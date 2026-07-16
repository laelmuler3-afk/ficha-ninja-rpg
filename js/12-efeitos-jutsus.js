/* Shinobi 1.9.1 — motor estruturado com registro central otimizado. */
(function(){
  "use strict";

  if(window.__motorEfeitosEstruturadosV191) return;
  window.__motorEfeitosEstruturadosV191 = true;

  const VERSAO = "1.9.1";
  const VERSAO_EFEITOS = "1.0.1";
  const CHAVE_ESTADO = "efeitosBatalhaAtivos";
  const URL_REGISTRO = `data/efeitos-jutsus.json?v=${VERSAO_EFEITOS}`;

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
  let promessaRegistro = null;
  let renderizando = false;
  let quadroAtualizacao = null;

  function numero(valor, padrao=0){
    const n = Number(String(valor ?? "").trim().replace(",", "."));
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
    if(efeito.condicao.tipo === "natureza_nivel") return condicaoNaturezaAtiva(efeito.condicao);
    /* CA só é consultada contra ataques, então esta condição é inerente ao uso da CA. */
    if(efeito.condicao.tipo === "contra_ataques") return true;
    return false;
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
        registroPorId = new Map(lista.map(item => [String(item.catalogoId || ""), item]));
        return dados;
      })
      .catch(erro => {
        console.warn("Registro estruturado de efeitos indisponível.", erro);
        registro = {jutsus:[]};
        registroPorId = new Map();
        return registro;
      });

    return promessaRegistro;
  }

  function registroDoJutsu(jutsu){
    return registroPorId.get(String(jutsu?.catalogoId || "")) || null;
  }

  async function migrarJutsusDoCatalogo(){
    await carregarRegistro();
    const lista = Array.isArray(estado?.jutsus) ? estado.jutsus : [];
    let alterou = false;

    lista.forEach(jutsu => {
      if(!jutsu || jutsu.efeitosEditadosManualmente) return;
      const item = registroDoJutsu(jutsu);
      if(!item) return;

      const precisaMigrar = !Array.isArray(jutsu.efeitosEstruturados)
        || String(jutsu.efeitosVersao || "") !== VERSAO_EFEITOS;

      if(!precisaMigrar) return;

      jutsu.efeitosEstruturados = clonar(item.efeitos || []);
      jutsu.efeitosConfig = Object.fromEntries(
        Object.entries(item).filter(([chave]) => ![
          "catalogoId","nome","elemento","classificacao","revisado","pagina","efeitos"
        ].includes(chave))
      );
      jutsu.classificacaoEfeitos = String(item.classificacao || "");
      jutsu.efeitosVersao = VERSAO_EFEITOS;
      alterou = true;
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

    estado[CHAVE_ESTADO] = estado[CHAVE_ESTADO]
      .filter(item => item && typeof item === "object")
      .map((item,indice) => {
        const efeitos = Array.isArray(item.efeitos)
          ? item.efeitos.map(normalizarEfeito)
          : bonusLegadoParaEfeitos(item.bonus);
        return {
          id:String(item.id || `efeito-${indice}-${Date.now()}`),
          origemTipo:String(item.origemTipo || "jutsu"),
          origemId:String(item.origemId || ""),
          nome:String(item.nome || "Efeito de jutsu"),
          duracao:String(item.duracao || ""),
          alvoNome:String(item.alvoNome || ""),
          aplicacao:String(item.aplicacao || "usuario"),
          efeitos,
          bonus:calcularBonusDoItem(efeitos),
          multiplicadores:calcularMultiplicadoresDoItem(efeitos),
          aplicadoEm:numero(item.aplicadoEm, Date.now())
        };
      })
      .filter(item => item.efeitos.length > 0);

    return estado[CHAVE_ESTADO];
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
    const base = modificador(destreza + bonusAtributoManual) + bonusModDestreza + (treinado ? proficiencia : 0);
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
      const total = modificador(atributo + bonusManual) + bonusJutsu;
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
    if(efeito.tipo === "bonus_numerico" && typeof valor === "number"){
      return `${rotulo} ${comSinal(valor)}${efeito.unidade?` ${efeito.unidade}`:""}`;
    }
    if(efeito.operacao === "multiplicar" && valor !== undefined){
      return `${rotulo} ×${valor}`;
    }
    return efeito.texto || rotulo;
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

  function renderizarEfeitos(){
    const host=garantirHostEfeitos();
    if(!host) return;
    const lista=garantirLista();
    host.hidden=!lista.length;
    host.innerHTML=lista.map(item=>{
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
    const proprios=Array.isArray(jutsu?.efeitosEstruturados)?jutsu.efeitosEstruturados:[];
    if(proprios.length) return proprios.map(normalizarEfeito).filter(efeitoDesbloqueado);
    const item=registroDoJutsu(jutsu);
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
    /* Fallback conservador para jutsus manuais: apenas bônus explícitos no usuário. */
    const texto=normalizar(jutsu?.descricao || "");
    const efeitos=[];
    const regras=[
      {alvo:"ca", rx:/(?:ganha|recebe|aumenta)[^.;]{0,40}?([+]\s*\d+)\s*(?:de\s*)?ca\b|([+]\s*\d+)\s*(?:de\s*)?ca\b/},
      {alvo:"furtividade", rx:/(?:ganha|recebe|aumenta)[^.;]{0,40}?([+]\s*\d+)\s*(?:de\s*)?furtividade\b|([+]\s*\d+)\s*(?:de\s*)?furtividade\b/},
      {alvo:"velocidade", rx:/velocidade[^.;]{0,50}?(?:aumenta|ganha|recebe)[^.;]{0,20}?([+]?[ ]*\d+(?:[.,]\d+)?)\s*(?:m|metros?)\b/}
    ];
    regras.forEach((regra,indice)=>{
      const m=texto.match(regra.rx);
      const bruto=m?.[1] || m?.[2];
      if(!bruto) return;
      const valor=numero(String(bruto).replace(/\s+/g,""),0);
      if(!valor) return;
      efeitos.push(normalizarEfeito({
        id:`fallback-${regra.alvo}-${indice}`,
        polaridade:"buff",aplicaEm:"usuario",tipo:"bonus_numerico",alvo:regra.alvo,
        operacao:"somar",valor,texto:`${ROTULOS_ALVO[regra.alvo]} ${comSinal(valor)}`,
        automatico:true,persistente:true,duracao:String(jutsu?.duracao||"")
      },indice));
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
    if(persistentes.length){
      const item={
        id:id || `jutsu:${slug(jutsu?.nome||indice)}`,
        origemTipo:"jutsu",
        origemId:String(jutsu?.catalogoId || indice || ""),
        nome:String(jutsu?.nome || "Jutsu sem nome"),
        duracao:duracaoEfetiva(jutsu,persistentes),
        alvoNome:destino.alvoNome,
        aplicacao:destino.aplicarNoUsuario?"usuario":"alvo",
        efeitos:persistentes,
        bonus:calcularBonusDoItem(persistentes),
        multiplicadores:calcularMultiplicadoresDoItem(persistentes),
        aplicadoEm:Date.now()
      };
      const existente=lista.findIndex(x=>x.id===item.id);
      if(existente>=0){lista[existente]=item;renovado=true;}
      else lista.push(item);
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

    return {aplicado:persistentes.length>0,renovado,efeitos,persistentes};
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
    if(window.__renderJutsusEfeitosV191 || typeof window.renderizarJutsus!=="function") return;
    window.__renderJutsusEfeitosV191=true;
    const base=window.renderizarJutsus;
    window.renderizarJutsus=function(){
      const resultado=base.apply(this,arguments);
      requestAnimationFrame(decorarCardsJutsu);
      return resultado;
    };
    try{renderizarJutsus=window.renderizarJutsus;}catch(_erro){}
  }

  function instalarAtualizadores(){
    if(!window.__modsEfeitosEstruturadosV191 && typeof window.atualizarModsBatalhaComBonus==="function"){
      window.__modsEfeitosEstruturadosV191=true;
      const base=window.atualizarModsBatalhaComBonus;
      window.atualizarModsBatalhaComBonus=function(){
        const resultado=base.apply(this,arguments);
        atualizarModificadoresComEfeitos();
        atualizarFurtividade();
        return resultado;
      };
      try{atualizarModsBatalhaComBonus=window.atualizarModsBatalhaComBonus;}catch(_erro){}
    }
    if(!window.__extrasEfeitosEstruturadosV191 && typeof window.atualizarMostradoresExtrasBatalha==="function"){
      window.__extrasEfeitosEstruturadosV191=true;
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
    if(window.__resetEfeitosEstruturadosV191) return;
    window.__resetEfeitosEstruturadosV191=true;
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
    carregarRegistro().then(migrarJutsusDoCatalogo).then(()=>{
      atualizarTudo();
      decorarCardsJutsu();
    });
  });

  window.EfeitosJutsuShinobi={
    versao:VERSAO,
    versaoEfeitos:VERSAO_EFEITOS,
    carregarRegistro,
    migrar:migrarJutsusDoCatalogo,
    extrair:obterEfeitosDoJutsu,
    ativos:window.obterEfeitosJutsuBatalhaAtivos,
    bonus:window.obterBonusEfeitosJutsuBatalha,
    multiplicador:window.obterMultiplicadorEfeitosJutsuBatalha
  };
})();
