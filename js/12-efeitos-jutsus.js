/* Shinobi 1.10.0 — motor estruturado com reparo de efeitos automáticos em fichas antigas. */
(function(){
  "use strict";

  if(window.__motorEfeitosEstruturadosV110) return;
  window.__motorEfeitosEstruturadosV110 = true;

  const VERSAO = "1.10.0";
  const VERSAO_EFEITOS = "1.2.0";
  const CHAVE_ESTADO = "efeitosBatalhaAtivos";
  const URL_REGISTRO = `data/efeitos-jutsus.json?v=${encodeURIComponent(window.APP_VERSION || VERSAO)}-${VERSAO_EFEITOS}`;

  const ATRIBUTOS = {
    forca:{rotulo:"FOR", id:"modForca"},
    destreza:{rotulo:"DES", id:"modDestreza"},
    constituicao:{rotulo:"CON", id:"modConstituicao"},
    inteligencia:{rotulo:"INT", id:"modInteligencia"},
    sabedoria:{rotulo:"SAB", id:"modSabedoria"},
    carisma:{rotulo:"CAR", id:"modCarisma"}
  };

  const ALVOS_AUTOMATICOS = new Set([
    "ca", "furtividade", "velocidade",
    ...Object.keys(ATRIBUTOS).map(chave => `mod_${chave}`)
  ]);

  const CONDICOES_DE_ESCOPO = new Set([
    "contra_ataques",
    "contra_ataques_distancia"
  ]);

  const CONDICOES_COM_CONFIRMACAO = new Set([
    "resultado",
    "apos_ataque_escolhido"
  ]);

  const ROTULOS_ALVO = {
    ca:"CA",
    furtividade:"Furtividade",
    velocidade:"Velocidade",
    mod_forca:"Mod. FOR",
    mod_destreza:"Mod. DES",
    mod_constituicao:"Mod. CON",
    mod_inteligencia:"Mod. INT",
    mod_sabedoria:"Mod. SAB",
    mod_carisma:"Mod. CAR",
    jogada_ataque:"Jogada de ataque",
    jogada_ataque_desarmado:"Ataque desarmado",
    dano:"Dano",
    dano_corpo_a_corpo:"Dano corpo a corpo",
    dano_desarmado:"Dano desarmado",
    bonus_ataque_dano:"Ataque e dano",
    acao:"Ações",
    acao_bonus:"Ações bônus",
    ataque_desarmado:"Ataques desarmados",
    ataques_acao_bonus:"Ataques na ação bônus",
    pv:"PV",
    pv_temporario:"PV temporários",
    chakra:"Chakra",
    empurrao:"Empurrão",
    caido:"Caído",
    atordoado:"Atordoado",
    paralisado:"Paralisado",
    agarrado:"Agarrado",
    impedido:"Impedido",
    sangrando:"Sangrando",
    queimando:"Queimando",
    cego:"Cego",
    surdo:"Surdo",
    amedrontado:"Amedrontado",
    inconsciente:"Inconsciente",
    exaustao:"Exaustão"
  };

  const APLICACOES_USUARIO = new Set([
    "usuario", "ataques_usuario", "ataque_usuario", "armas_usuario", "jutsus_usuario"
  ]);

  const APLICACOES_EXTERNAS = new Set([
    "alvo", "aliado", "aliados", "aliados_area", "usuario_ou_aliado",
    "inimigos_area", "todos_area", "alvos_area", "criaturas_area",
    "criaturas_hostis", "criaturas_adjacentes_alvo", "atacante", "invocacao"
  ]);

  const APLICACOES_COM_NOME_DE_ALVO = new Set([
    "alvo", "aliado", "usuario_ou_aliado", "atacante"
  ]);

  let registro = null;
  let registroPorId = new Map();
  let registroPorNome = new Map();
  let registroPorNomeFlexivel = new Map();
  let promessaRegistro = null;
  let renderizando = false;
  let quadroAtualizacao = null;

  function numero(valor, padrao=0){
    const texto = String(valor ?? "").trim().replace(",", ".");
    if(!texto) return padrao;
    const n = Number(texto);
    return Number.isFinite(n) ? n : padrao;
  }

  function comSinal(valor){
    const n = numero(valor, 0);
    return n > 0 ? `+${n}` : String(n);
  }

  function escaparHtml(valor){
    return String(valor ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function normalizar(valor){
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function slug(valor){
    return normalizar(valor)
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-+|-+$/g,"") || "efeito";
  }

  function chaveNomeFlexivel(valor){
    return normalizar(valor)
      .replace(/\([^)]*\)/g," ")
      .replace(/\brequer\s+(?:tutor|habilidade)\b/g," ")
      .replace(/silenciosos/g,"silensiosos")
      .replace(/[^a-z0-9]+/g,"")
      .trim();
  }

  function clonar(valor){
    try{return JSON.parse(JSON.stringify(valor));}
    catch(_erro){return valor;}
  }

  function salvarEstado(){
    try{
      if(typeof persistirEstadoLocal === "function") return persistirEstadoLocal();
      if(typeof persistirSemRender === "function") return persistirSemRender();
      if(typeof CHAVE !== "undefined"){
        localStorage.setItem(CHAVE, JSON.stringify(estado));
        return true;
      }
    }catch(erro){
      console.warn("Não foi possível salvar os efeitos da batalha.", erro);
    }
    return false;
  }

  function nivelNatureza(id){
    if(!id) return 0;
    if(window.RegrasNaturezaShinobi?.nivelNatureza){
      return numero(window.RegrasNaturezaShinobi.nivelNatureza(id), 0);
    }
    return Math.max(0, Math.min(7, Math.trunc(numero(estado?.[id], 0))));
  }

  function condicaoNaturezaAtiva(condicao){
    if(!condicao || condicao.tipo !== "natureza_nivel") return false;
    return nivelNatureza(condicao.natureza) >= numero(condicao.minimo, 0);
  }

  function efeitoDesbloqueado(efeito){
    if(!efeito?.condicao) return true;
    if(efeito.condicao.tipo === "natureza_nivel") return condicaoNaturezaAtiva(efeito.condicao);
    return true;
  }

  function condicaoPermiteAutomatico(efeito){
    if(!efeito?.condicao) return true;
    const tipo=String(efeito.condicao.tipo||"");
    if(tipo === "natureza_nivel") return condicaoNaturezaAtiva(efeito.condicao);
    /* Condições de escopo continuam sendo bônus válidos; o texto informa quando usar. */
    if(CONDICOES_DE_ESCOPO.has(tipo)) return true;
    if(CONDICOES_COM_CONFIRMACAO.has(tipo)) return efeito.condicaoAtendida === true;
    return efeito.condicaoAtendida === true;
  }

  async function carregarRegistro(){
    if(registro) return registro;
    if(promessaRegistro) return promessaRegistro;

    promessaRegistro = fetch(URL_REGISTRO, {cache:"no-store"})
      .then(resposta => {
        if(!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        return resposta.json();
      })
      .then(dados => {
        const lista = Array.isArray(dados?.jutsus) ? dados.jutsus : [];
        registro = dados;
        registroPorId = new Map(
          lista
            .filter(item => String(item?.catalogoId || "").trim())
            .map(item => [String(item.catalogoId), item])
        );
        registroPorNome = new Map(
          lista
            .filter(item => normalizar(item?.nome))
            .map(item => [normalizar(item.nome), item])
        );
        registroPorNomeFlexivel = new Map(
          lista
            .filter(item => chaveNomeFlexivel(item?.nome))
            .map(item => [chaveNomeFlexivel(item.nome), item])
        );
        return dados;
      })
      .catch(erro => {
        console.warn("Registro estruturado de efeitos indisponível.", erro);
        registro = {jutsus:[]};
        registroPorId = new Map();
        registroPorNome = new Map();
        registroPorNomeFlexivel = new Map();
        return registro;
      });

    return promessaRegistro;
  }

  function registroDoJutsu(jutsu){
    return registroPorId.get(String(jutsu?.catalogoId || jutsu?.id || ""))
      || registroPorNome.get(normalizar(jutsu?.nome))
      || registroPorNomeFlexivel.get(chaveNomeFlexivel(jutsu?.nome))
      || null;
  }

  function registroDoItemAtivo(item){
    return registroPorId.get(String(item?.origemId || ""))
      || registroPorNome.get(normalizar(item?.nome))
      || registroPorNomeFlexivel.get(chaveNomeFlexivel(item?.nome))
      || null;
  }

  function ordenarValorParaAssinatura(valor){
    if(Array.isArray(valor)) return valor.map(ordenarValorParaAssinatura);
    if(valor && typeof valor === "object"){
      return Object.keys(valor)
        .sort()
        .reduce((saida,chave)=>{
          saida[chave]=ordenarValorParaAssinatura(valor[chave]);
          return saida;
        },{});
    }
    return valor;
  }

  function assinaturaEfeitos(efeitos){
    const campos=[
      "id","polaridade","aplicaEm","tipo","alvo","operacao","valor","unidade",
      "automatico","persistente","acumulo","duracao","grupoEscolha","opcao","condicao"
    ];
    const canonicos=(Array.isArray(efeitos)?efeitos:[])
      .map((efeito,indice)=>normalizarEfeito(efeito,indice))
      .map(efeito=>{
        const saida={};
        campos.forEach(chave=>{
          if(efeito[chave] !== undefined) saida[chave]=ordenarValorParaAssinatura(efeito[chave]);
        });
        return saida;
      })
      .sort((a,b)=>String(a.id||"").localeCompare(String(b.id||"")));
    return JSON.stringify(canonicos);
  }

  function efeitoAutomaticoObrigatorioDoCatalogo(efeito){
    const e=normalizarEfeito(efeito);
    return Boolean(
      e.automatico
      && ALVOS_AUTOMATICOS.has(e.alvo)
      && ["somar","multiplicar"].includes(e.operacao)
    );
  }

  function chaveSemanticaEfeito(efeito){
    const e=normalizarEfeito(efeito);
    return [
      e.aplicaEm,e.tipo,e.alvo,e.operacao,e.grupoEscolha||"",e.opcao||"",
      JSON.stringify(ordenarValorParaAssinatura(e.condicao||{}))
    ].join("|");
  }

  function mesclarEfeitosManuaisComCatalogo(jutsu,item){
    const atuais=Array.isArray(jutsu?.efeitosEstruturados)
      ? jutsu.efeitosEstruturados.map((efeito,indice)=>normalizarEfeito(efeito,indice))
      : [];
    const canonicos=(Array.isArray(item?.efeitos)?item.efeitos:[])
      .map((efeito,indice)=>normalizarEfeito(efeito,indice));

    /*
     * O catálogo é a fonte das regras. Fichas antigas podem manter efeitos extras
     * personalizados, mas não podem perder nenhum efeito oficial por causa de uma
     * edição antiga ou de uma migração incompleta.
     */
    const atuaisPorId=new Map(atuais.map(efeito=>[efeito.id,efeito]));
    const atuaisPorSemantica=new Map(atuais.map(efeito=>[chaveSemanticaEfeito(efeito),efeito]));
    const consumidos=new Set();

    const mesclados=canonicos.map(canonico=>{
      const manual=atuaisPorId.get(canonico.id)
        || atuaisPorSemantica.get(chaveSemanticaEfeito(canonico));
      if(!manual) return canonico;
      consumidos.add(manual.id);
      const combinado={...manual,...canonico};
      if(manual.condicaoAtendida !== undefined) combinado.condicaoAtendida=manual.condicaoAtendida;
      return normalizarEfeito(combinado);
    });

    atuais.forEach(efeito=>{
      if(consumidos.has(efeito.id)) return;
      const jaExiste=mesclados.some(itemMesclado=>
        itemMesclado.id===efeito.id || chaveSemanticaEfeito(itemMesclado)===chaveSemanticaEfeito(efeito)
      );
      if(!jaExiste) mesclados.push(efeito);
    });

    return mesclados;
  }

  async function migrarJutsusDoCatalogo(){
    await carregarRegistro();
    const lista = Array.isArray(estado?.jutsus) ? estado.jutsus : [];
    let alterou = false;

    lista.forEach(jutsu => {
      if(!jutsu) return;
      const item = registroDoJutsu(jutsu);
      if(!item) return;

      const efeitosEsperados = jutsu.efeitosEditadosManualmente
        ? mesclarEfeitosManuaisComCatalogo(jutsu,item)
        : clonar(item.efeitos || []);
      const precisaMigrar = !Array.isArray(jutsu.efeitosEstruturados)
        || String(jutsu.efeitosVersao || "") !== VERSAO_EFEITOS
        || assinaturaEfeitos(jutsu.efeitosEstruturados) !== assinaturaEfeitos(efeitosEsperados);

      if(!precisaMigrar) return;

      jutsu.efeitosEstruturados = efeitosEsperados;
      jutsu.efeitosConfig = Object.fromEntries(
        Object.entries(item).filter(([chave]) => ![
          "catalogoId","nome","elemento","classificacao","revisado","pagina","efeitos"
        ].includes(chave))
      );
      jutsu.classificacaoEfeitos = String(item.classificacao || "");
      jutsu.efeitosVersao = VERSAO_EFEITOS;
      jutsu.efeitosAssinatura = assinaturaEfeitos(jutsu.efeitosEstruturados);
      if(jutsu.efeitosEditadosManualmente) jutsu.efeitosAutomaticosReparados = true;
      alterou = true;
    });

    if(alterou) salvarEstado();
    return alterou;
  }


  function resolverAplicacaoParaItemAtivo(efeito,item){
    const e=normalizarEfeito(efeito);
    if(e.aplicaEm==="usuario_ou_aliado"){
      e.aplicaEm=String(item?.aplicacao||"usuario")==="usuario"?"usuario":"aliado";
    }
    return e;
  }

  function efeitosDoRegistroParaAtivo(item,itemRegistro){
    const origem=(Array.isArray(itemRegistro?.efeitos)?itemRegistro.efeitos:[])
      .map((efeito,indice)=>resolverAplicacaoParaItemAtivo(normalizarEfeito(efeito,indice),item))
      .filter(efeito=>efeito.persistente!==false && efeito.tipo!=="encerrar_efeitos");

    const atuais=Array.isArray(item?.efeitos)
      ? item.efeitos.map((efeito,indice)=>normalizarEfeito(efeito,indice))
      : bonusLegadoParaEfeitos(item?.bonus);
    const atuaisPorId=new Map(atuais.map(efeito=>[efeito.id,efeito]));
    origem.forEach(efeito=>{
      const anterior=atuaisPorId.get(efeito.id);
      if(anterior?.condicaoAtendida !== undefined) efeito.condicaoAtendida=anterior.condicaoAtendida;
    });

    /*
     * Efeitos de escolha não podem ser ativados em bloco durante uma migração.
     * Mantemos a opção que já estava ativa e acrescentamos somente os efeitos
     * sem escolha. Nos registros legados, os bônus parciais são substituídos
     * pela definição completa e segura do catálogo.
     */
    const escolhasAtuais=new Set(
      atuais
        .filter(efeito=>efeito.grupoEscolha && efeito.opcao)
        .map(efeito=>`${efeito.grupoEscolha}:${efeito.opcao}`)
    );

    const selecionados=origem.filter(efeito=>{
      if(!efeito.grupoEscolha || !efeito.opcao) return true;
      return escolhasAtuais.has(`${efeito.grupoEscolha}:${efeito.opcao}`);
    });

    const ids=new Set(selecionados.map(efeito=>efeito.id));
    atuais.forEach(efeito=>{
      if(efeito.grupoEscolha && efeito.opcao && !ids.has(efeito.id)){
        selecionados.push(efeito);
        ids.add(efeito.id);
      }
    });

    return selecionados;
  }

  async function migrarEfeitosAtivosDoCatalogo(){
    await carregarRegistro();
    if(!estado || typeof estado!=="object" || !Array.isArray(estado[CHAVE_ESTADO])) return false;

    let alterou=false;
    estado[CHAVE_ESTADO].forEach(item=>{
      if(!item || String(item.origemTipo||"jutsu")!=="jutsu") return;

      const itemRegistro=registroDoItemAtivo(item);
      if(!itemRegistro) return;

      const efeitos=efeitosDoRegistroParaAtivo(item,itemRegistro);
      const assinaturaEsperada=assinaturaEfeitos(efeitos);
      const assinaturaAtual=assinaturaEfeitos(item.efeitos);
      const origemCanonica=String(itemRegistro.catalogoId||item.origemId||"");
      const precisaReparar=String(item.efeitosVersao||"")!==VERSAO_EFEITOS
        || assinaturaAtual!==assinaturaEsperada
        || String(item.efeitosAssinatura||"")!==assinaturaEsperada
        || String(item.origemId||"")!==origemCanonica;

      if(!precisaReparar) return;

      item.origemId=origemCanonica;
      item.efeitos=efeitos;
      item.bonus=calcularBonusDoItem(efeitos);
      item.multiplicadores=calcularMultiplicadoresDoItem(efeitos);
      item.efeitosVersao=VERSAO_EFEITOS;
      item.efeitosAssinatura=assinaturaEsperada;
      alterou=true;
    });

    if(alterou) salvarEstado();
    return alterou;
  }

  function normalizarEfeito(efeito, indice=0){
    const e = efeito && typeof efeito === "object" ? clonar(efeito) : {};
    return {
      ...e,
      id:String(e.id || `efeito-${indice+1}`),
      polaridade:["buff","debuff","custo","neutro"].includes(e.polaridade) ? e.polaridade : "neutro",
      aplicaEm:String(e.aplicaEm || "usuario"),
      tipo:String(e.tipo || "especial"),
      alvo:String(e.alvo || "efeito"),
      operacao:String(e.operacao || "adicionar"),
      texto:String(e.texto || ROTULOS_ALVO[e.alvo] || "Efeito do jutsu"),
      automatico:Boolean(e.automatico),
      persistente:e.persistente !== false,
      acumulo:String(e.acumulo || "renova_mesma_origem")
    };
  }

  function bonusLegadoParaEfeitos(bonus){
    if(!bonus || typeof bonus !== "object") return [];
    return Object.entries(bonus)
      .filter(([,valor]) => numero(valor,0) !== 0)
      .map(([alvo,valor],indice) => normalizarEfeito({
        id:`legado-${alvo}-${indice}`,
        polaridade:numero(valor,0) >= 0 ? "buff" : "debuff",
        aplicaEm:"usuario",
        tipo:"bonus_numerico",
        alvo,
        operacao:"somar",
        valor:numero(valor,0),
        texto:`${ROTULOS_ALVO[alvo] || alvo} ${comSinal(valor)}`,
        automatico:true,
        persistente:true
      }, indice));
  }

  function garantirLista(){
    if(!estado || typeof estado !== "object") return [];
    if(!Array.isArray(estado[CHAVE_ESTADO])) estado[CHAVE_ESTADO] = [];

    const lista=estado[CHAVE_ESTADO];
    const quantidadeOriginal=lista.length;
    const porId=new Map();

    lista
      .filter(item => item && typeof item === "object")
      .forEach((item,indice) => {
        const efeitos = Array.isArray(item.efeitos)
          ? item.efeitos.map(normalizarEfeito)
          : bonusLegadoParaEfeitos(item.bonus);
        if(!efeitos.length) return;

        /*
         * Campos do módulo online precisam sobreviver a cada normalização. A
         * implementação anterior recriava o objeto sem onlineEffectId e
         * onlineRoomId. Ao reabrir o app, o mesmo buff parecia não publicado e
         * era enviado novamente para a sala.
         */
        const normalizado={
          ...item,
          id:String(item.id || `efeito-${indice}-${Date.now()}`),
          origemTipo:String(item.origemTipo || "jutsu"),
          origemId:String(item.origemId || ""),
          nome:String(item.nome || "Efeito de jutsu"),
          duracao:String(item.duracao || ""),
          alvoNome:String(item.alvoNome || ""),
          aplicacao:String(item.aplicacao || "usuario"),
          efeitosVersao:String(item.efeitosVersao || ""),
          efeitosAssinatura:String(item.efeitosAssinatura || assinaturaEfeitos(efeitos)),
          efeitos,
          bonus:calcularBonusDoItem(efeitos),
          multiplicadores:calcularMultiplicadoresDoItem(efeitos),
          aplicadoEm:numero(item.aplicadoEm, Date.now()),
          onlineEffectId:String(item.onlineEffectId || ""),
          onlineRoomId:String(item.onlineRoomId || ""),
          onlinePublicadoEm:numero(item.onlinePublicadoEm,0),
          onlineSyncPendente:Boolean(item.onlineSyncPendente),
          onlineErro:numero(item.onlineErro,0),
          duracaoOriginal:String(item.duracaoOriginal || ""),
          duracaoRodadasTotal:numero(item.duracaoRodadasTotal,0),
          duracaoRodadasRestantes:numero(item.duracaoRodadasRestantes,0),
          rodadaAtivacao:numero(item.rodadaAtivacao,0),
          turnoAtivacao:numero(item.turnoAtivacao,0),
          expiraNaRodada:numero(item.expiraNaRodada,0),
          expiraNoTurno:numero(item.expiraNoTurno,0)
        };

        const anterior=porId.get(normalizado.id);
        if(!anterior){
          porId.set(normalizado.id,normalizado);
          return;
        }

        /* Repara fichas que já receberam cópias locais repetidas. Mantém a
           ativação mais recente e reaproveita o vínculo online conhecido. */
        const maisNovo=normalizado.aplicadoEm>=anterior.aplicadoEm?normalizado:anterior;
        const outro=maisNovo===normalizado?anterior:normalizado;
        if(!maisNovo.onlineEffectId&&outro.onlineEffectId) maisNovo.onlineEffectId=outro.onlineEffectId;
        if(!maisNovo.onlineRoomId&&outro.onlineRoomId) maisNovo.onlineRoomId=outro.onlineRoomId;
        if(!maisNovo.onlinePublicadoEm&&outro.onlinePublicadoEm) maisNovo.onlinePublicadoEm=outro.onlinePublicadoEm;
        if(maisNovo.onlineEffectId) maisNovo.onlineSyncPendente=false;
        porId.set(normalizado.id,maisNovo);
      });

    const normalizada=Array.from(porId.values());
    const reparouDuplicatas=normalizada.length<quantidadeOriginal;
    /* Mantém a mesma referência para não perder inserções durante o cálculo de acúmulo. */
    lista.splice(0,lista.length,...normalizada);
    if(reparouDuplicatas){
      setTimeout(()=>{
        try{
          if(typeof CHAVE!=="undefined") localStorage.setItem(CHAVE,JSON.stringify(estado));
        }catch(_erro){}
      },0);
    }
    return lista;
  }

  function efeitoAutomaticoNoUsuario(efeito){
    return Boolean(
      efeito?.automatico
      && APLICACOES_USUARIO.has(efeito.aplicaEm)
      && ALVOS_AUTOMATICOS.has(efeito.alvo)
      && efeitoDesbloqueado(efeito)
      && condicaoPermiteAutomatico(efeito)
    );
  }

  function calcularBonusDoItem(efeitos){
    const bonus = {};
    (efeitos || []).forEach(efeito => {
      if(!efeitoAutomaticoNoUsuario(efeito)) return;
      if(efeito.operacao !== "somar") return;
      const valor = numero(efeito.valor, 0);
      if(valor) bonus[efeito.alvo] = numero(bonus[efeito.alvo],0) + valor;
    });
    return bonus;
  }

  function calcularMultiplicadoresDoItem(efeitos){
    const multiplicadores = {};
    (efeitos || []).forEach(efeito => {
      if(!efeitoAutomaticoNoUsuario(efeito)) return;
      if(efeito.operacao !== "multiplicar") return;
      const valor = numero(efeito.valor, 1);
      if(valor > 0) multiplicadores[efeito.alvo] = numero(multiplicadores[efeito.alvo],1) * valor;
    });
    return multiplicadores;
  }

  function bonusAutomatico(alvo){
    return garantirLista().reduce((total,item) => total + numero(item.bonus?.[alvo],0), 0);
  }

  function multiplicadorAutomatico(alvo){
    return garantirLista().reduce((total,item) => total * numero(item.multiplicadores?.[alvo],1), 1);
  }

  function campoSalvo(nome){
    return document.querySelector(`[data-save="${nome}"]`);
  }

  function modificador(valor){
    if(typeof calcularModificador === "function") return numero(calcularModificador(valor), 0);
    return Math.floor((numero(valor,0)-10)/2);
  }

  function bonusManualAtributo(chave){
    return numero(document.querySelector(`[data-bonus-batalha="${chave}"]`)?.value, 0);
  }

  function dadosFurtividade(){
    const destreza = numero(campoSalvo("destreza")?.value ?? estado?.destreza, 0);
    const proficiencia = numero(campoSalvo("proficiencia")?.value ?? estado?.proficiencia, 0);
    const treinado = Boolean(campoSalvo("p_furtividade")?.checked ?? estado?.p_furtividade);
    const bonusAtributoManual = bonusManualAtributo("destreza");
    const bonusModDestreza = bonusAutomatico("mod_destreza");
    const baseModDestreza = destreza > 0 ? modificador(destreza + bonusAtributoManual) : 0;
    const base = baseModDestreza + bonusModDestreza + (treinado ? proficiencia : 0);
    const bonusJutsu = bonusAutomatico("furtividade");
    return {base,bonusJutsu,total:base+bonusJutsu,treinado,bonusModDestreza};
  }

  function garantirMostradorFurtividade(){
    const grade = document.querySelector("#batalha .defesasGrid");
    if(!grade) return null;
    let box = document.getElementById("batalhaFurtividadeBox");
    if(!box){
      box = document.createElement("div");
      box.id = "batalhaFurtividadeBox";
      box.className = "extraBatalhaBox furtividadeBatalhaBox";
      box.innerHTML = '<span>Furt.</span><strong id="batalhaFurtividadeView">+0</strong>';
      const velocidade = document.getElementById("batalhaVelocidadeView")?.closest("div");
      if(velocidade?.nextSibling) grade.insertBefore(box, velocidade.nextSibling);
      else grade.appendChild(box);
    }
    grade.classList.add("defesasGridComFurtividade");
    return box;
  }

  function atualizarFurtividade(){
    garantirMostradorFurtividade();
    const view = document.getElementById("batalhaFurtividadeView");
    if(!view) return;
    const dados = dadosFurtividade();
    const detalhe=[];
    if(dados.treinado) detalhe.push("prof.");
    if(dados.bonusModDestreza) detalhe.push(`${comSinal(dados.bonusModDestreza)} mod. DES`);
    if(dados.bonusJutsu) detalhe.push(`${comSinal(dados.bonusJutsu)} jutsu`);
    view.innerHTML = `${comSinal(dados.total)}${detalhe.length?`<span class="bonusDefesaTexto">${detalhe.join(" · ")}</span>`:""}`;
  }

  function atualizarVelocidadeComEfeitos(){
    const view = document.getElementById("batalhaVelocidadeView");
    if(!view) return;
    const base = numero(campoSalvo("velocidade")?.value ?? estado?.velocidade, 0);
    const multiplicador = multiplicadorAutomatico("velocidade");
    const bonus = bonusAutomatico("velocidade");
    const total = Math.floor(base * multiplicador * 1000) / 1000 + bonus;
    const detalhes=[];
    if(multiplicador !== 1) detalhes.push(`×${multiplicador} jutsu`);
    if(bonus) detalhes.push(`${comSinal(bonus)}m jutsu`);
    view.innerHTML = `${String(total).replace(".",",")}${detalhes.length?`<span class="bonusDefesaTexto">${detalhes.join(" · ")}</span>`:""}`;
  }

  function atualizarModificadoresComEfeitos(){
    Object.entries(ATRIBUTOS).forEach(([chave,dados]) => {
      const el = document.getElementById(dados.id);
      if(!el) return;
      const atributo = numero(campoSalvo(chave)?.value ?? estado?.[chave],0);
      const bonusManual = bonusManualAtributo(chave);
      const bonusJutsu = bonusAutomatico(`mod_${chave}`);
      const total = (atributo > 0 ? modificador(atributo + bonusManual) : 0) + bonusJutsu;
      const detalhes=[];
      if(bonusManual) detalhes.push(`${comSinal(bonusManual)} atr.`);
      if(bonusJutsu) detalhes.push(`${comSinal(bonusJutsu)} jutsu`);
      el.innerHTML = `${comSinal(total)}${detalhes.length?`<span class="bonusAplicadoTexto">${detalhes.join(" · ")}</span>`:""}`;
    });
  }

  function atualizarDefesasComEfeitos(){
    const caBase = numero(document.getElementById("campoCA")?.value ?? campoSalvo("ca")?.value,10);
    const cdBase = numero(campoSalvo("cd")?.value,10);
    const bonusCaManual = numero(document.querySelector('[data-bonus-defesa-batalha="ca"]')?.value,0);
    const bonusCdManual = numero(document.querySelector('[data-bonus-defesa-batalha="cd"]')?.value,0);
    const bonusCaJutsu = bonusAutomatico("ca");
    const caTotal = caBase + bonusCaManual + bonusCaJutsu;
    const cdTotal = cdBase + bonusCdManual;
    const caView = document.getElementById("batalhaCaView");
    const cdView = document.getElementById("batalhaCdView");

    if(caView){
      const detalhes=[];
      if(bonusCaManual) detalhes.push(`${comSinal(bonusCaManual)} manual`);
      if(bonusCaJutsu) detalhes.push(`${comSinal(bonusCaJutsu)} jutsu`);
      caView.innerHTML = `${caTotal}${detalhes.length?`<span class="bonusDefesaTexto">${detalhes.join(" · ")}</span>`:""}`;
    }
    if(cdView){
      cdView.innerHTML = `${cdTotal}${bonusCdManual?`<span class="bonusDefesaTexto">${comSinal(bonusCdManual)} manual</span>`:""}`;
    }
    atualizarVelocidadeComEfeitos();
    atualizarModificadoresComEfeitos();
    atualizarFurtividade();
  }

  function efeitoParaTexto(efeito){
    const rotulo = ROTULOS_ALVO[efeito.alvo] || efeito.alvo.replace(/_/g," ");
    const valor = efeito.valor;
    let texto;
    if(efeito.tipo === "bonus_numerico" && typeof valor === "number"){
      texto=`${rotulo} ${comSinal(valor)}${efeito.unidade?` ${efeito.unidade}`:""}`;
    }else if(efeito.operacao === "multiplicar" && valor !== undefined){
      texto=`${rotulo} ×${valor}`;
    }else{
      texto=efeito.texto || rotulo;
    }
    if(efeito.condicao){
      const condicao=textoCondicao(efeito.condicao);
      if(CONDICOES_COM_CONFIRMACAO.has(String(efeito.condicao.tipo||"")) && efeito.condicaoAtendida!==true){
        return `${texto} (condição não confirmada: ${condicao})`;
      }
      if(CONDICOES_DE_ESCOPO.has(String(efeito.condicao.tipo||""))){
        return `${texto} (${condicao})`;
      }
    }
    return texto;
  }

  function polaridadeDoItem(item){
    const pols = new Set(item.efeitos.map(e=>e.polaridade));
    if(pols.has("buff") && (pols.has("debuff") || pols.has("custo"))) return "misto";
    if(pols.has("debuff")) return "debuff";
    if(pols.has("buff")) return "buff";
    if(pols.has("custo")) return "custo";
    return "neutro";
  }

  function garantirHostEfeitos(){
    const secao = document.querySelector("#batalha .efeitosBatalhaSecao");
    if(!secao) return null;
    let host = document.getElementById("efeitosJutsuAtivos");
    if(!host){
      host=document.createElement("div");
      host.id="efeitosJutsuAtivos";
      host.className="efeitosJutsuAtivos";
      const bonusManual=secao.querySelector(".bonusAtributosBatalha");
      bonusManual?secao.insertBefore(host,bonusManual):secao.appendChild(host);
    }
    return host;
  }

  function construirResumoBonusGerais(lista){
    const diretos=ALVOS_AUTOMATICOS;
    const chips=[];
    const vistos=new Set();
    lista.forEach(item=>{
      item.efeitos
        .filter(e=>e.persistente!==false && efeitoDesbloqueado(e) && APLICACOES_USUARIO.has(e.aplicaEm))
        .filter(e=>e.polaridade==="buff" && !diretos.has(e.alvo))
        .forEach(efeito=>{
          const texto=efeitoParaTexto(efeito);
          const chave=normalizar(texto);
          if(!texto || vistos.has(chave)) return;
          vistos.add(chave);
          chips.push(`<span class="efeitoResumoGeralChip">${escaparHtml(texto)}</span>`);
        });
    });
    if(!chips.length) return "";
    return `<div class="efeitosResumoGeral"><strong>Outros bônus ativos</strong><div>${chips.join("")}</div></div>`;
  }

  function renderizarEfeitos(){
    const host=garantirHostEfeitos();
    if(!host) return;
    const lista=garantirLista();
    host.hidden=!lista.length;
    const resumoGeral=construirResumoBonusGerais(lista);
    host.innerHTML=resumoGeral+lista.map(item=>{
      const polaridade=polaridadeDoItem(item);
      const persistentes=item.efeitos.filter(e=>e.persistente!==false && efeitoDesbloqueado(e));
      const usuario=persistentes.filter(e=>APLICACOES_USUARIO.has(e.aplicaEm));
      const externos=persistentes.filter(e=>!APLICACOES_USUARIO.has(e.aplicaEm));
      const classe=`efeitoPolaridade-${polaridade}`;
      const destino=externos.length && !usuario.length
        ? (item.alvoNome?`Alvo: ${item.alvoNome}`:"Aplicado ao alvo")
        : externos.length
          ? (item.alvoNome?`Você + ${item.alvoNome}`:"Você + alvo")
          : "Aplicado em você";
      return `
        <article class="efeitoJutsuBatalhaCard ${classe}">
          <div class="efeitoJutsuBatalhaTopo">
            <div>
              <div class="efeitoJutsuBadges">
                <span class="efeitoJutsuBadge efeitoJutsuBadge-${polaridade}">${polaridade.toUpperCase()}</span>
                <span class="efeitoJutsuDestino">${escaparHtml(destino)}</span>
              </div>
              <strong>${escaparHtml(item.nome)}</strong>
              ${item.duracao?`<small>Duração: ${escaparHtml(item.duracao)}</small>`:""}
            </div>
            <button type="button" onclick="removerEfeitoJutsuBatalha('${escaparHtml(item.id)}')" aria-label="Encerrar ${escaparHtml(item.nome)}">×</button>
          </div>
          <div class="efeitoJutsuBatalhaBonus">
            ${persistentes.map(efeito=>`<span class="efeitoChip-${escaparHtml(efeito.polaridade)}">${escaparHtml(efeitoParaTexto(efeito))}</span>`).join("")}
          </div>
        </article>`;
    }).join("");
  }

  function atualizarTudo(){
    atualizarDefesasComEfeitos();
    renderizarEfeitos();
    if(typeof window.atualizarBonusBatalhaCompacto === "function") window.atualizarBonusBatalhaCompacto();
    window.dispatchEvent(new CustomEvent("shinobi:efeitos-batalha-atualizados"));
  }

  function agendarAtualizacao(){
    if(quadroAtualizacao !== null) return;
    quadroAtualizacao=requestAnimationFrame(()=>{
      quadroAtualizacao=null;
      atualizarTudo();
    });
  }

  function obterEfeitosDoJutsu(jutsu){
    const item=registroDoJutsu(jutsu);
    const proprios=Array.isArray(jutsu?.efeitosEstruturados)?jutsu.efeitosEstruturados:[];
    if(proprios.length){
      const efeitos=jutsu?.efeitosEditadosManualmente && item
        ? mesclarEfeitosManuaisComCatalogo(jutsu,item)
        : proprios;
      return efeitos.map(normalizarEfeito).filter(efeitoDesbloqueado);
    }
    if(item?.efeitos?.length) return item.efeitos.map(normalizarEfeito).filter(efeitoDesbloqueado);
    return extrairFallback(jutsu);
  }

  function configDoJutsu(jutsu){
    if(jutsu?.efeitosConfig && typeof jutsu.efeitosConfig === "object") return clonar(jutsu.efeitosConfig);
    const item=registroDoJutsu(jutsu);
    if(!item) return {};
    return Object.fromEntries(Object.entries(item).filter(([k])=>!["catalogoId","nome","elemento","classificacao","revisado","pagina","efeitos"].includes(k)));
  }

  function extrairFallback(jutsu){
    /* Fallback para jutsus manuais e fichas antigas sem catalogoId. */
    const texto=normalizar([jutsu?.descricao,jutsu?.upgrade?.efeito,jutsu?.bonus,jutsu?.efeitos].filter(Boolean).join(". "));
    const efeitos=[];
    const vistos=new Set();

    function adicionar(alvo,valor,{operacao="somar",unidade="",textoEfeito="",automatico=true}={}){
      const numeroValor=numero(valor,operacao==="multiplicar"?1:0);
      if((operacao==="somar"&&!numeroValor)||(operacao==="multiplicar"&&numeroValor===1)) return;
      const chave=`${alvo}|${operacao}|${numeroValor}`;
      if(vistos.has(chave)) return;
      vistos.add(chave);
      efeitos.push(normalizarEfeito({
        id:`fallback-${slug(alvo)}-${efeitos.length+1}`,
        polaridade:"buff",aplicaEm:"usuario",tipo:operacao==="multiplicar"?"multiplicador":"bonus_numerico",
        alvo,operacao,valor:numeroValor,unidade,
        texto:textoEfeito || `${ROTULOS_ALVO[alvo]||alvo} ${operacao==="multiplicar"?`×${numeroValor}`:comSinal(numeroValor)}`,
        automatico,persistente:true,duracao:String(jutsu?.duracao||"")
      },efeitos.length));
    }

    function primeiroValor(padroes){
      for(const rx of padroes){
        const m=texto.match(rx);
        if(m?.[1]) return numero(String(m[1]).replace(/\s+/g,""),0);
      }
      return 0;
    }

    adicionar("ca",primeiroValor([
      /\bca\b[^.;\n]{0,55}?\+\s*(\d+(?:[.,]\d+)?)/,
      /\+\s*(\d+(?:[.,]\d+)?)[^.;\n]{0,35}?\bca\b/
    ]));
    adicionar("furtividade",primeiroValor([
      /furtividade[^.;\n]{0,45}?\+\s*(\d+(?:[.,]\d+)?)/,
      /\+\s*(\d+(?:[.,]\d+)?)[^.;\n]{0,35}?furtividade/
    ]));
    adicionar("velocidade",primeiroValor([
      /(?:velocidade|deslocamento|movimento)[^.;\n]{0,55}?\+\s*(\d+(?:[.,]\d+)?)\s*(?:m|metros?)?/,
      /\+\s*(\d+(?:[.,]\d+)?)\s*(?:m|metros?)[^.;\n]{0,35}?(?:velocidade|deslocamento|movimento)/
    ]),{unidade:"m"});
    if(/(?:velocidade|deslocamento|movimento)[^.;\n]{0,30}?(?:e|fica|torna-se)?\s*dobrad/.test(texto)){
      adicionar("velocidade",2,{operacao:"multiplicar",textoEfeito:"Velocidade ×2"});
    }

    const atributos={forca:"mod_forca",destreza:"mod_destreza",constituicao:"mod_constituicao",inteligencia:"mod_inteligencia",sabedoria:"mod_sabedoria",carisma:"mod_carisma"};
    Object.entries(atributos).forEach(([nome,alvo])=>{
      const valor=primeiroValor([
        new RegExp(`(?:${nome}|modificador\\s+de\\s+${nome})[^.;\\n]{0,40}?\\+\\s*(\\d+(?:[.,]\\d+)?)`),
        new RegExp(`\\+\\s*(\\d+(?:[.,]\\d+)?)[^.;\\n]{0,35}?(?:${nome}|modificador\\s+de\\s+${nome})`)
      ]);
      adicionar(alvo,valor);
    });

    return efeitos;
  }

  function rotuloOpcao(opcao,efeitos){
    const mapa={
      pv_temporario:"10 PV temporários",
      ca:"+1 de CA",
      velocidade:"+1,5 m de Velocidade",
      ataque_dano:"+1 em ataque e dano",
      acerto:"+3 de acerto",
      dano_maximizado:"Dano maximizado",
      agilidade_gato:"Agilidade de Gato",
      forca_touro:"Força do Touro",
      vigor_urso:"Vigor do Urso"
    };
    return mapa[opcao] || efeitos.find(e=>e.opcao===opcao)?.texto || opcao.replace(/_/g," ");
  }

  function selecionarEscolhas(efeitos,config){
    const grupos=new Map();
    efeitos.forEach(efeito=>{
      if(!efeito.grupoEscolha || !efeito.opcao) return;
      if(!grupos.has(efeito.grupoEscolha)) grupos.set(efeito.grupoEscolha,new Set());
      grupos.get(efeito.grupoEscolha).add(efeito.opcao);
    });
    if(!grupos.size) return efeitos;

    let escolhidos=efeitos.filter(e=>!e.grupoEscolha || !e.opcao);
    for(const [grupo,opcoesSet] of grupos){
      const opcoes=Array.from(opcoesSet);
      const podeTodos=condicaoNaturezaAtiva(config?.escolhaTodosCondicao);
      const linhas=opcoes.map((opcao,i)=>`${i+1} - ${rotuloOpcao(opcao,efeitos)}`);
      if(podeTodos) linhas.push(`${opcoes.length+1} - Todos os efeitos`);
      const resposta=prompt(`Escolha o efeito de ${grupo.replace(/_/g," ")}\n\n${linhas.join("\n")}`,"1");
      if(resposta===null) return null;
      const indice=Math.trunc(numero(resposta,1))-1;
      if(podeTodos && indice===opcoes.length){
        escolhidos.push(...efeitos.filter(e=>e.grupoEscolha===grupo));
      }else{
        const opcao=opcoes[Math.max(0,Math.min(opcoes.length-1,indice))];
        escolhidos.push(...efeitos.filter(e=>e.grupoEscolha===grupo && e.opcao===opcao));
      }
    }
    return escolhidos;
  }

  function textoCondicao(condicao){
    const tipo=String(condicao?.tipo||"");
    if(tipo==="contra_ataques") return "contra ataques";
    if(tipo==="contra_ataques_distancia") return "contra ataques à distância";
    if(tipo==="apos_ataque_escolhido") return "após realizar o ataque indicado";
    if(tipo==="resultado") return String(condicao?.valor||"quando o resultado indicado acontecer");
    return String(condicao?.valor||tipo.replace(/_/g," "));
  }

  function resolverCondicoesAutomaticas(efeitos,jutsu){
    return efeitos.map(efeito=>{
      const e=normalizarEfeito(efeito);
      const tipo=String(e.condicao?.tipo||"");
      if(!e.automatico || !CONDICOES_COM_CONFIRMACAO.has(tipo)) return e;
      const pergunta=`${jutsu?.nome||"Este jutsu"}: a condição foi atendida?\n\n${e.texto||textoCondicao(e.condicao)}\n\nOK = aplicar o bônus agora\nCancelar = registrar sem somar o bônus`;
      e.condicaoAtendida=confirm(pergunta);
      return e;
    });
  }

  function resolverDestino(efeitos){
    let aplicarNoUsuario=true;
    const temFlexivel=efeitos.some(e=>e.aplicaEm==="usuario_ou_aliado");
    if(temFlexivel){
      aplicarNoUsuario=confirm("Este jutsu pode afetar você ou outro alvo.\n\nOK = aplicar em você\nCancelar = registrar no outro alvo");
    }
    const resolvidos=efeitos.map(efeito=>{
      const e=clonar(efeito);
      if(e.aplicaEm==="usuario_ou_aliado") e.aplicaEm=aplicarNoUsuario?"usuario":"aliado";
      return normalizarEfeito(e);
    });
    const temAlvoNomeavel=resolvidos.some(e=>APLICACOES_COM_NOME_DE_ALVO.has(e.aplicaEm));
    let alvoNome="";
    if(temAlvoNomeavel){
      alvoNome=String(prompt("Nome do alvo ou aliado (opcional):", "Alvo") ?? "").trim();
    }
    return {efeitos:resolvidos,alvoNome,aplicarNoUsuario};
  }

  function encerrarEfeitosRequeridos(efeitos){
    const nomes=[];
    efeitos.filter(e=>e.tipo==="encerrar_efeitos" && Array.isArray(e.valor)).forEach(e=>nomes.push(...e.valor));
    if(!nomes.length) return;
    const normalizados=new Set(nomes.map(normalizar));
    const lista=garantirLista();
    for(let i=lista.length-1;i>=0;i--){
      if(normalizados.has(normalizar(lista[i].nome))) lista.splice(i,1);
    }
  }

  function idDoJutsu(jutsu,indice,config,destino,efeitos){
    let base=`jutsu:${slug(jutsu?.catalogoId || jutsu?.id || jutsu?.nome || indice || "jutsu")}`;

    /*
     * O mesmo debuff pode permanecer ativo em alvos diferentes. O nome do
     * alvo entra na chave somente quando o efeito não modifica o usuário.
     */
    const persistentes=efeitosPersistentes(efeitos || []);
    const temUsuario=persistentes.some(e=>APLICACOES_USUARIO.has(e.aplicaEm));
    const temExterno=persistentes.some(e=>APLICACOES_EXTERNAS.has(e.aplicaEm));
    if(temExterno && !temUsuario && destino?.alvoNome){
      base+=`:alvo-${slug(destino.alvoNome)}`;
    }

    if(!config?.acumulaConsigo) return base;
    const lista=garantirLista().filter(item=>item.id===base || item.id.startsWith(`${base}:instancia-`));
    const limite=Math.max(1,Math.trunc(numero(config.limiteInstancias,99)));
    if(lista.length>=limite) return null;
    let numeroInstancia=1;
    const usados=new Set(lista.map(item=>numero(item.id.match(/:instancia-(\d+)$/)?.[1],0)));
    while(usados.has(numeroInstancia)) numeroInstancia++;
    return `${base}:instancia-${numeroInstancia}`;
  }

  function duracaoEfetiva(jutsu,persistentes){
    const duracaoJutsu=String(jutsu?.duracao || "").trim();
    const duracaoEfeito=String((persistentes || []).find(e=>String(e?.duracao||"").trim())?.duracao || "").trim();
    if(!duracaoJutsu || /^instant/i.test(normalizar(duracaoJutsu))){
      return duracaoEfeito || "Até ser encerrado";
    }
    return duracaoJutsu;
  }

  function efeitosPersistentes(efeitos){
    return efeitos.filter(e=>e.persistente!==false && e.tipo!=="encerrar_efeitos");
  }

  function resumoEfeitos(efeitos){
    const buffs=efeitos.filter(e=>e.polaridade==="buff").map(efeitoParaTexto);
    const debuffs=efeitos.filter(e=>e.polaridade==="debuff").map(efeitoParaTexto);
    const custos=efeitos.filter(e=>e.polaridade==="custo").map(efeitoParaTexto);
    const partes=[];
    if(buffs.length) partes.push(`BUFFS\n• ${buffs.join("\n• ")}`);
    if(debuffs.length) partes.push(`DEBUFFS / ALVO\n• ${debuffs.join("\n• ")}`);
    if(custos.length) partes.push(`CUSTOS / CONSEQUÊNCIAS\n• ${custos.join("\n• ")}`);
    return partes.join("\n\n");
  }

  window.obterEfeitosJutsuBatalhaAtivos=function(){
    return garantirLista().map(item=>({...item,bonus:{...item.bonus},multiplicadores:{...item.multiplicadores},efeitos:clonar(item.efeitos)}));
  };

  window.obterBonusEfeitosJutsuBatalha=function(alvo){return bonusAutomatico(alvo);};
  window.obterMultiplicadorEfeitosJutsuBatalha=function(alvo){return multiplicadorAutomatico(alvo);};
  window.extrairEfeitosJutsuBatalha=function(jutsu){return {efeitos:obterEfeitosDoJutsu(jutsu),config:configDoJutsu(jutsu)};};

  window.aplicarEfeitosJutsuBatalha=async function(jutsu,indice){
    await carregarRegistro();
    let efeitos=obterEfeitosDoJutsu(jutsu);
    if(!efeitos.length) return {aplicado:false,efeitos:[]};
    const config=configDoJutsu(jutsu);
    efeitos=selecionarEscolhas(efeitos,config);
    if(efeitos===null) return {aplicado:false,cancelado:true,efeitos:[]};
    efeitos=resolverCondicoesAutomaticas(efeitos,jutsu);

    const destino=resolverDestino(efeitos);
    efeitos=destino.efeitos;
    encerrarEfeitosRequeridos(efeitos);

    const persistentes=efeitosPersistentes(efeitos);
    const resumo=resumoEfeitos(efeitos);
    const lista=garantirLista();
    const id=idDoJutsu(jutsu,indice,config,destino,efeitos);

    if(config?.acumulaConsigo && id===null){
      const mensagem=`O limite de ${config.limiteInstancias || 1} instâncias ativas deste jutsu já foi atingido.`;
      if(typeof avisoShinobi==="function") await avisoShinobi("Limite de acúmulo",mensagem);
      else alert(mensagem);
      return {aplicado:false,limite:true,efeitos};
    }

    let renovado=false;
    let itemAtivo=null;
    let onlineEffectIdAnterior="";
    if(persistentes.length){
      const item={
        id:id || `jutsu:${slug(jutsu?.nome||indice)}`,
        origemTipo:"jutsu",
        origemId:String(jutsu?.catalogoId || indice || ""),
        nome:String(jutsu?.nome || "Jutsu sem nome"),
        duracao:duracaoEfetiva(jutsu,persistentes),
        alvoNome:destino.alvoNome,
        aplicacao:destino.aplicarNoUsuario?"usuario":"alvo",
        efeitosVersao:VERSAO_EFEITOS,
        efeitosAssinatura:assinaturaEfeitos(persistentes),
        efeitos:persistentes,
        bonus:calcularBonusDoItem(persistentes),
        multiplicadores:calcularMultiplicadoresDoItem(persistentes),
        aplicadoEm:Date.now()
      };
      const existente=lista.findIndex(x=>x.id===item.id);
      if(existente>=0){
        const anterior=lista[existente]||{};
        onlineEffectIdAnterior=String(anterior.onlineEffectId||"");
        /* O vínculo antigo é devolvido ao módulo online para que uma renovação
           encerre o contador anterior antes de publicar o novo. */
        if(onlineEffectIdAnterior) item.onlineEffectId=onlineEffectIdAnterior;
        lista[existente]=item;
        renovado=true;
      }else lista.push(item);
      itemAtivo=item;
      salvarEstado();
      atualizarTudo();
    }

    if(typeof log==="function"){
      const curto=efeitos.slice(0,4).map(efeitoParaTexto).join(" · ");
      log(`Efeitos de ${jutsu?.nome || "Jutsu"}: ${curto}${efeitos.length>4?" · …":""}`);
    }

    if(resumo && typeof avisoShinobi==="function"){
      await avisoShinobi(persistentes.length?"Efeitos aplicados":"Efeitos do jutsu",resumo);
    }

    return {
      aplicado:persistentes.length>0,
      renovado,
      efeitos,
      persistentes,
      itemId:itemAtivo?.id||null,
      duracao:itemAtivo?.duracao||duracaoEfetiva(jutsu,persistentes),
      aplicadoEm:itemAtivo?.aplicadoEm||Date.now(),
      onlineEffectIdAnterior:onlineEffectIdAnterior||null
    };
  };

  window.removerEfeitoJutsuBatalha=async function(id){
    const lista=garantirLista();
    const indice=lista.findIndex(item=>item.id===id);
    if(indice<0) return;
    const item=lista[indice];
    const ok=typeof confirmarUsoAcao==="function"
      ? await confirmarUsoAcao("efeito de batalha",`Encerrar ${item.nome}`,"Os modificadores automáticos deste efeito serão removidos.")
      : confirm(`Encerrar ${item.nome}?`);
    if(!ok) return;
    lista.splice(indice,1);
    salvarEstado();
    atualizarTudo();
    if(typeof log==="function") log(`Efeito encerrado: ${item.nome}`);
  };

  window.limparEfeitosJutsuBatalhaSemConfirmacao=function(){
    if(estado && typeof estado==="object") estado[CHAVE_ESTADO]=[];
    salvarEstado();
    atualizarTudo();
  };

  function listarEfeitosEditaveis(jutsu){
    const efeitos=Array.isArray(jutsu?.efeitosEstruturados)?jutsu.efeitosEstruturados:[];
    return efeitos.map((e,i)=>`${i+1}. [${String(e.polaridade||"neutro").toUpperCase()} / ${e.aplicaEm||"usuario"}] ${e.texto||efeitoParaTexto(e)}`).join("\n");
  }

  window.editarEfeitosJutsuEstruturados=async function(indice){
    await carregarRegistro();
    const jutsu=estado?.jutsus?.[indice];
    if(!jutsu) return;
    if(!Array.isArray(jutsu.efeitosEstruturados)) jutsu.efeitosEstruturados=[];
    const lista=listarEfeitosEditaveis(jutsu) || "Nenhum efeito estruturado.";
    const escolha=prompt(`EFEITOS AUTOMÁTICOS — ${jutsu.nome || "Jutsu"}\n\n${lista}\n\n1 = Adicionar\n2 = Remover\n3 = Restaurar do catálogo\n4 = Apenas visualizar\n\nOpção:`,"4");
    if(escolha===null || escolha==="4") return;

    if(escolha==="1"){
      const polaridade=normalizar(prompt("Polaridade: buff, debuff, custo ou neutro","buff")||"buff");
      const aplicaEm=normalizar(prompt("Aplicação: usuario, alvo ou usuario_ou_aliado","usuario")||"usuario").replace(/\s+/g,"_");
      const alvo=normalizar(prompt("O que afeta? Ex.: ca, velocidade, furtividade, mod_forca, dano, paralisado","ca")||"efeito").replace(/\s+/g,"_");
      const operacao=normalizar(prompt("Operação: somar, multiplicar, vantagem, desvantagem, adicionar ou reduzir","somar")||"adicionar");
      const valorTexto=prompt("Valor. Ex.: 2, 1d6, metade ou deixe vazio:","");
      const texto=prompt("Descrição curta do efeito:",`${ROTULOS_ALVO[alvo]||alvo}`);
      if(texto===null) return;
      const valorNumerico=valorTexto!==null && /^[-+]?\d+(?:[.,]\d+)?$/.test(String(valorTexto).trim())
        ? numero(valorTexto,0)
        : String(valorTexto||"").trim() || undefined;
      const automatico=APLICACOES_USUARIO.has(aplicaEm) && ALVOS_AUTOMATICOS.has(alvo) && ["somar","multiplicar"].includes(operacao)
        ? confirm("Aplicar este valor automaticamente na Área de Batalha?")
        : false;
      jutsu.efeitosEstruturados.push(normalizarEfeito({
        id:`manual:${Date.now()}`,
        polaridade:["buff","debuff","custo","neutro"].includes(polaridade)?polaridade:"neutro",
        aplicaEm,tipo:automatico?"bonus_numerico":"especial",alvo,operacao,
        valor:valorNumerico,texto:String(texto||"Efeito personalizado"),automatico,persistente:true
      }));
      jutsu.efeitosEditadosManualmente=true;
    }else if(escolha==="2"){
      const numeroItem=Math.trunc(numero(prompt(`Qual número remover?\n\n${lista}`,"1"),0))-1;
      if(numeroItem>=0 && numeroItem<jutsu.efeitosEstruturados.length){
        jutsu.efeitosEstruturados.splice(numeroItem,1);
        jutsu.efeitosEditadosManualmente=true;
      }
    }else if(escolha==="3"){
      const item=registroDoJutsu(jutsu);
      if(!item){alert("Este jutsu não possui uma definição no catálogo.");return;}
      jutsu.efeitosEstruturados=clonar(item.efeitos||[]);
      jutsu.efeitosEditadosManualmente=false;
      jutsu.efeitosVersao=VERSAO_EFEITOS;
      jutsu.efeitosAssinatura=assinaturaEfeitos(jutsu.efeitosEstruturados);
    }else{
      alert("Opção inválida.");return;
    }
    salvarEstado();
    if(typeof renderizarJutsus==="function") renderizarJutsus();
  };

  function decorarCardsJutsu(){
    const cards=Array.from(document.querySelectorAll("#listaJutsus .jutsuCard"));
    cards.forEach((card,indice)=>{
      const acoes=card.querySelector(".jutsuAcoes");
      if(!acoes || acoes.querySelector(".btnEfeitosEstruturados")) return;
      const jutsu=estado?.jutsus?.[indice];
      const qtd=Array.isArray(jutsu?.efeitosEstruturados)?jutsu.efeitosEstruturados.length:0;
      const botao=document.createElement("button");
      botao.type="button";
      botao.className="btn btnEfeitosEstruturados";
      botao.textContent=`EFEITOS AUTO (${qtd})`;
      botao.onclick=()=>window.editarEfeitosJutsuEstruturados(indice);
      acoes.insertBefore(botao,acoes.lastElementChild);
    });
  }

  function instalarRenderJutsus(){
    if(window.__renderJutsusEfeitosV196 || typeof window.renderizarJutsus!=="function") return;
    window.__renderJutsusEfeitosV196=true;
    const base=window.renderizarJutsus;
    window.renderizarJutsus=function(){
      const resultado=base.apply(this,arguments);
      requestAnimationFrame(decorarCardsJutsu);
      return resultado;
    };
    try{renderizarJutsus=window.renderizarJutsus;}catch(_erro){}
  }

  function instalarAtualizadores(){
    if(!window.__modsEfeitosEstruturadosV196 && typeof window.atualizarModsBatalhaComBonus==="function"){
      window.__modsEfeitosEstruturadosV196=true;
      const base=window.atualizarModsBatalhaComBonus;
      window.atualizarModsBatalhaComBonus=function(){
        const resultado=base.apply(this,arguments);
        atualizarModificadoresComEfeitos();
        atualizarFurtividade();
        return resultado;
      };
      try{atualizarModsBatalhaComBonus=window.atualizarModsBatalhaComBonus;}catch(_erro){}
    }
    if(!window.__extrasEfeitosEstruturadosV196 && typeof window.atualizarMostradoresExtrasBatalha==="function"){
      window.__extrasEfeitosEstruturadosV196=true;
      const base=window.atualizarMostradoresExtrasBatalha;
      window.atualizarMostradoresExtrasBatalha=function(){
        const resultado=base.apply(this,arguments);
        atualizarVelocidadeComEfeitos();
        return resultado;
      };
      try{atualizarMostradoresExtrasBatalha=window.atualizarMostradoresExtrasBatalha;}catch(_erro){}
    }
    window.atualizarDefesasTotaisBatalha=atualizarDefesasComEfeitos;
    try{atualizarDefesasTotaisBatalha=atualizarDefesasComEfeitos;}catch(_erro){}
  }

  function instalarReset(){
    if(window.__resetEfeitosEstruturadosV196) return;
    window.__resetEfeitosEstruturadosV196=true;
    window.resetarBatalha=async function(){
      const ok=typeof confirmarUsoAcao==="function"
        ? await confirmarUsoAcao("reset","Resetar batalha","PV e Chakra voltam ao máximo. Efeitos, bônus temporários e histórico serão limpos.")
        : confirm("Resetar a batalha e limpar os efeitos ativos?");
      if(!ok) return false;
      const pv=document.getElementById("pv"),pvMax=document.getElementById("pvMax");
      const chakra=document.getElementById("chakra"),chakraMax=document.getElementById("chakraMax");
      const dano=document.getElementById("danoBatalha"),custo=document.getElementById("custoBatalha"),logBox=document.getElementById("log");
      if(pv) pv.value=pvMax?.value||0;
      if(chakra) chakra.value=chakraMax?.value||0;
      if(dano) dano.value=1;
      if(custo) custo.value=1;
      if(logBox) logBox.innerHTML="Nada aconteceu ainda.";
      document.querySelectorAll("[data-bonus-batalha],[data-bonus-defesa-batalha]").forEach(input=>{input.value=0;});
      if(typeof bonusBatalhaAtributos!=="undefined") Object.keys(bonusBatalhaAtributos).forEach(chave=>{bonusBatalhaAtributos[chave]=0;});
      estado[CHAVE_ESTADO]=[];
      if(typeof salvar==="function") salvar(); else salvarEstado();
      if(typeof atualizarModsBatalhaComBonus==="function") atualizarModsBatalhaComBonus();
      if(typeof atualizarPainelBatalhaVivo==="function") atualizarPainelBatalhaVivo();
      atualizarTudo();

      /* Fecha o menu de opções como confirmação visual do reset concluído. */
      document.querySelectorAll("details.batalhaMenuOpcoes[open]").forEach(menu=>{
        menu.removeAttribute("open");
      });

      if(typeof avisoShinobi==="function") await avisoShinobi("Batalha resetada","A Área de Batalha e os efeitos ativos foram restaurados.");
      return true;
    };
  }

  async function iniciar(){
    instalarAtualizadores();
    instalarReset();
    instalarRenderJutsus();
    await carregarRegistro();
    await migrarJutsusDoCatalogo();
    await migrarEfeitosAtivosDoCatalogo();
    garantirLista();
    garantirMostradorFurtividade();
    atualizarTudo();
    decorarCardsJutsu();

    const seletor=[
      '[data-save="forca"]','[data-save="destreza"]','[data-save="constituicao"]',
      '[data-save="inteligencia"]','[data-save="sabedoria"]','[data-save="carisma"]',
      '[data-save="velocidade"]','[data-save="proficiencia"]','[data-save="p_furtividade"]',
      '[data-save="ca"]','[data-save="cd"]','[data-bonus-batalha]','[data-bonus-defesa-batalha]'
    ].join(",");
    document.addEventListener("input",evento=>{if(evento.target?.matches(seletor)) agendarAtualizacao();});
    document.addEventListener("change",evento=>{if(evento.target?.matches(seletor)) agendarAtualizacao();});
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",iniciar,{once:true});
  else iniciar();

  window.addEventListener("pageshow",()=>{
    instalarAtualizadores();
    instalarReset();
    instalarRenderJutsus();
    carregarRegistro()
      .then(migrarJutsusDoCatalogo)
      .then(migrarEfeitosAtivosDoCatalogo)
      .then(()=>{
        atualizarTudo();
        decorarCardsJutsu();
      });
  });

  window.EfeitosJutsuShinobi={
    versao:VERSAO,
    versaoEfeitos:VERSAO_EFEITOS,
    carregarRegistro,
    migrar:migrarJutsusDoCatalogo,
    migrarAtivos:migrarEfeitosAtivosDoCatalogo,
    extrair:obterEfeitosDoJutsu,
    ativos:window.obterEfeitosJutsuBatalhaAtivos,
    bonus:window.obterBonusEfeitosJutsuBatalha,
    multiplicador:window.obterMultiplicadorEfeitosJutsuBatalha,
    assinatura:assinaturaEfeitos,
    repararAtivos:migrarEfeitosAtivosDoCatalogo,
    localizar:registroDoJutsu,
    atualizar:atualizarTudo,
    condicaoPermiteAutomatico,
    auditarCatalogo(){
      const lista=Array.isArray(registro?.jutsus)?registro.jutsus:[];
      return lista.map(item=>({
        catalogoId:item.catalogoId,
        nome:item.nome,
        totalEfeitos:Array.isArray(item.efeitos)?item.efeitos.length:0,
        automaticos:(item.efeitos||[]).filter(e=>e.automatico).length
      }));
    }
  };
})();
