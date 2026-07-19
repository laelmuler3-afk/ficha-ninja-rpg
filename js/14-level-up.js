/* Shinobi 2.1.1 — Level Up completo: revisão de migração, recursos e desempenho. */
(function(){
  "use strict";

  if(window.__shinobiLevelUpV211) return;
  window.__shinobiLevelUpV211=true;

  const VERSAO="2.1.1";
  const URL_PROGRESSAO=`./data/progressao-ninja.json?v=${VERSAO}`;
  const ATRIBUTOS={
    forca:"Força",
    destreza:"Destreza",
    constituicao:"Constituição",
    inteligencia:"Inteligência",
    sabedoria:"Sabedoria",
    carisma:"Carisma"
  };
  const ABREVIACOES={
    forca:"FOR",
    destreza:"DES",
    constituicao:"CON",
    inteligencia:"INT",
    sabedoria:"SAB",
    carisma:"CAR"
  };

  let regras=null;
  let mapaNiveis=new Map();
  let mapaClas=new Map();
  let mapaAliasesCla=new Map();
  let modalAtual=null;
  let observadorCatalogo=null;

  function numero(valor,padrao=0){
    const texto=String(valor??"").trim().replace(",",".");
    if(!texto) return padrao;
    const n=Number(texto);
    return Number.isFinite(n)?n:padrao;
  }

  function inteiro(valor,padrao=0){
    const n=Number.parseInt(String(valor??"").trim(),10);
    return Number.isFinite(n)?n:padrao;
  }

  function limitarNivel(valor){
    const maximo=inteiro(regras?.maxLevel,20);
    return Math.max(1,Math.min(maximo,inteiro(valor,1)));
  }

  function escaparHTML(valor){
    return String(valor??"")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function normalizarTexto(valor){
    return String(valor??"")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g," ")
      .trim();
  }

  function clonar(valor){
    if(typeof structuredClone==="function") return structuredClone(valor);
    return JSON.parse(JSON.stringify(valor));
  }

  function regraNivel(nivel){
    return mapaNiveis.get(inteiro(nivel,1))||null;
  }

  function regraCla(id){
    return mapaClas.get(String(id||""))||null;
  }

  function detectarCla(valor){
    if(arguments.length===0) valor=campoSalvo("cla")?.value??estado?.cla;
    const normalizado=normalizarTexto(valor);
    if(!normalizado) return null;
    const id=mapaAliasesCla.get(normalizado);
    if(id) return regraCla(id);

    for(const [alias,claId] of mapaAliasesCla.entries()){
      if(normalizado.includes(alias)||alias.includes(normalizado)) return regraCla(claId);
    }
    return null;
  }

  function campoSalvo(chave){
    return document.querySelector(`[data-save="${chave}"]`);
  }

  function valorCampo(chave,padrao=0){
    const campo=campoSalvo(chave);
    return numero(campo?.value??estado?.[chave],padrao);
  }

  function definirCampo(chave,valor){
    const campo=campoSalvo(chave);
    if(campo) campo.value=String(valor);
    estado[chave]=String(valor);
  }

  function nivelAtual(){
    const campo=document.getElementById("nivelDisplayMini");
    return limitarNivel(estado?.nivel??campo?.value??1);
  }

  function pontuacaoAtributo(chave){
    return inteiro(campoSalvo(chave)?.value??estado?.[chave],0);
  }

  function modificadorAtributo(chave){
    return Math.floor((pontuacaoAtributo(chave)-10)/2);
  }

  function sinal(valor){
    const n=numero(valor,0);
    return n>=0?`+${n}`:String(n);
  }

  function quantidadeExigida(escolha){
    return Math.max(1,inteiro(escolha?.selectionCount??escolha?.minSelections,1));
  }

  function maximoEscolhas(escolha){
    return Math.max(quantidadeExigida(escolha),inteiro(escolha?.maxSelections,quantidadeExigida(escolha)));
  }

  function normalizarSelecao(escolha,valor){
    const permitidas=new Set((escolha?.options||[]).map(opcao=>String(opcao.id)));
    const origem=Array.isArray(valor)?valor:(String(valor??"").trim()?[valor]:[]);
    const unicas=[];
    origem.forEach(item=>{
      const id=String(item??"").trim();
      if(id&&permitidas.has(id)&&!unicas.includes(id)) unicas.push(id);
    });
    return unicas.slice(0,maximoEscolhas(escolha));
  }

  function escolhaCompleta(escolha,valor){
    return normalizarSelecao(escolha,valor).length===quantidadeExigida(escolha);
  }

  function selecaoParaSalvar(escolha,valores){
    const normalizada=normalizarSelecao(escolha,valores);
    return quantidadeExigida(escolha)>1?normalizada:(normalizada[0]||"");
  }

  function caracteristicasAte(nivel){
    const ids=[];
    for(let atual=0;atual<=nivel;atual+=1){
      (regraNivel(atual)?.features||[]).forEach(id=>{
        if(!ids.includes(id)) ids.push(id);
      });
    }
    return ids;
  }

  function pontosClaAte(nivel){
    let total=0;
    for(let atual=0;atual<=nivel;atual+=1){
      total+=inteiro(regraNivel(atual)?.clanPointsGrant,0);
    }
    return total;
  }

  function valoresFixos(nivel){
    const limitado=limitarNivel(nivel);
    const linha=regraNivel(limitado)||{};
    return {
      nivel:limitado,
      proficiencia:inteiro(linha.proficiency,2),
      rankJutsu:String(linha.jutsuRank||"—"),
      pontosChave:inteiro(linha.keyPoints,0),
      pontosCla:pontosClaAte(limitado),
      ataquesPorAcao:inteiro(linha.attacksPerAction,1),
      chakraBase:inteiro(linha.chakraBase,0),
      caracteristicas:caracteristicasAte(limitado)
    };
  }

  function recursosAtuais(){
    return {
      pv:numero(document.getElementById("pv")?.value??estado?.pv,0),
      pvMax:numero(document.getElementById("pvMax")?.value??estado?.pvMax,0),
      chakra:numero(document.getElementById("chakra")?.value??estado?.chakra,0),
      chakraMax:numero(document.getElementById("chakraMax")?.value??estado?.chakraMax,0)
    };
  }

  function fichaPareceNovaSemDados(){
    if(estado?.progressaoFixa) return false;
    if(nivelAtual()!==1) return false;
    const camposTexto=["nome","cla","rank","vila","idade"];
    const temIdentidade=camposTexto.some(chave=>
      Object.prototype.hasOwnProperty.call(estado||{},chave)&&String(estado?.[chave]??"").trim()
    );
    const atributos=Object.keys(ATRIBUTOS).some(chave=>pontuacaoAtributo(chave)>0);
    const temListas=(estado?.jutsus?.length||0)+(estado?.armados?.length||0)+(estado?.inventarioItens?.length||0)>0;
    const temRecursosSalvos=["pv","pvMax","chakra","chakraMax"].some(chave=>numero(estado?.[chave],0)>0);
    return !temIdentidade&&!atributos&&!temListas&&!temRecursosSalvos;
  }

  function registrarAtualizacoesRetroativas(progresso,nivel){
    const registrados=new Set((progresso.history||[])
      .map(item=>inteiro(item?.toLevel,-1))
      .filter(item=>item>=1));
    const adicionados=[];
    const instante=new Date().toISOString();

    for(let alvo=1;alvo<=nivel;alvo+=1){
      if(registrados.has(alvo)) continue;
      progresso.history.push({
        type:alvo===1?"initial-level":"retroactive-level",
        fromLevel:Math.max(0,alvo-1),
        toLevel:alvo,
        appliedAt:instante,
        fixedAfter:valoresFixos(alvo),
        unlockedFeatures:[...(regraNivel(alvo)?.features||[])],
        retroactive:Boolean(progresso.migratedFromExistingLevel),
        resources:{status:progresso.migratedFromExistingLevel?"preserved-existing":"pending-level-one"}
      });
      adicionados.push(alvo);
    }

    if(adicionados.length&&progresso.migratedFromExistingLevel){
      progresso.lastRetroactiveUpdate={
        levels:adicionados,
        fromLevel:adicionados[0],
        toLevel:adicionados[adicionados.length-1],
        appliedAt:instante
      };
      if(progresso.retroactiveReviewPending!==false) progresso.retroactiveReviewPending=true;
    }
    progresso.retroactiveBackfillTo=Math.max(inteiro(progresso.retroactiveBackfillTo,0),nivel);
    return adicionados.length>0;
  }

  function migrarPendenciasAntigasComoPreservadas(progresso,nivel){
    let alterou=false;
    const pendencias=progresso.pendingByLevel||{};
    Object.entries(pendencias).forEach(([chave,item])=>{
      const nivelItem=inteiro(chave,0);
      if(nivelItem>nivel||!item||typeof item!=="object") return;
      ["vida","chakra"].forEach(tipo=>{
        if(!item[tipo]||item[tipo].status==="pending"){
          item[tipo]={status:"preserved-existing",value:null};
          alterou=true;
        }
      });
    });
    return alterou;
  }

  function garantirEstruturaProgressao(){
    const atual=nivelAtual();
    const fixos=valoresFixos(atual);
    const tinhaProgressao=Boolean(estado.progressaoFixa&&typeof estado.progressaoFixa==="object"&&!Array.isArray(estado.progressaoFixa));
    const novaSemDados=!tinhaProgressao&&fichaPareceNovaSemDados();
    let alterou=false;

    if(!tinhaProgressao){
      estado.progressaoFixa={
        schemaVersion:3,
        engineVersion:VERSAO,
        initializedAt:new Date().toISOString(),
        migratedFromExistingLevel:!novaSemDados,
        level:atual,
        choices:{},
        history:[],
        pendingByLevel:{}
      };
      alterou=true;
    }

    const progresso=estado.progressaoFixa;
    if(!progresso.choices||typeof progresso.choices!=="object"){
      progresso.choices={};
      alterou=true;
    }
    if(!Array.isArray(progresso.history)){
      progresso.history=[];
      alterou=true;
    }
    if(!progresso.pendingByLevel||typeof progresso.pendingByLevel!=="object"){
      progresso.pendingByLevel={};
      alterou=true;
    }

    Object.entries(regras?.choices||{}).forEach(([id,escolha])=>{
      if(!(id in progresso.choices)) return;
      const normalizada=selecaoParaSalvar(escolha,progresso.choices[id]);
      if(JSON.stringify(progresso.choices[id])!==JSON.stringify(normalizada)){
        progresso.choices[id]=normalizada;
        alterou=true;
      }
    });

    if(registrarAtualizacoesRetroativas(progresso,atual)) alterou=true;

    if(!progresso.vital||typeof progresso.vital!=="object"){
      const snapshot=recursosAtuais();
      progresso.vital=novaSemDados?{
        schemaVersion:1,
        status:"needs-level-one-setup",
        initializedAt:new Date().toISOString(),
        startLevel:1,
        historyStartLevel:1
      }:{
        schemaVersion:1,
        status:"preserved-existing",
        initializedAt:new Date().toISOString(),
        preservedAtLevel:atual,
        startLevel:Math.min(inteiro(regras?.maxLevel,20)+1,atual+1),
        historyStartLevel:atual+1,
        preservedSnapshot:snapshot,
        migrationRule:"keep-current-values"
      };
      alterou=true;
    }

    if(migrarPendenciasAntigasComoPreservadas(progresso,atual)) alterou=true;

    const atualizacoes={
      schemaVersion:3,
      engineVersion:VERSAO,
      level:fixos.nivel,
      proficiency:fixos.proficiencia,
      jutsuRankMax:fixos.rankJutsu,
      keyPointsTotal:fixos.pontosChave,
      clanPointsEarned:fixos.pontosCla,
      attacksPerAction:fixos.ataquesPorAcao,
      chakraBase:fixos.chakraBase,
      activeFeatures:fixos.caracteristicas
    };

    Object.entries(atualizacoes).forEach(([chave,valor])=>{
      if(JSON.stringify(progresso[chave])!==JSON.stringify(valor)){
        progresso[chave]=valor;
        alterou=true;
      }
    });

    return alterou;
  }

  function sincronizarCamposFixos(){
    const fixos=valoresFixos(nivelAtual());
    const campoNivel=document.getElementById("nivelDisplayMini");
    const campoProf=document.getElementById("bonusProficiencia");

    if(campoNivel){
      campoNivel.value=String(fixos.nivel);
      campoNivel.readOnly=true;
      campoNivel.min="1";
      campoNivel.max=String(regras?.maxLevel||20);
      campoNivel.setAttribute("aria-label","Nível atual. Use o botão Subir de nível para evoluir.");
    }
    if(campoProf){
      campoProf.value=String(fixos.proficiencia);
      campoProf.readOnly=true;
      campoProf.setAttribute("aria-label","Bônus de proficiência calculado automaticamente pelo nível.");
    }
    estado.nivel=String(fixos.nivel);
    estado.proficiencia=String(fixos.proficiencia);
  }

  function persistirSeguro(){
    if(typeof persistirEstadoLocal==="function") return persistirEstadoLocal();
    try{
      localStorage.setItem(CHAVE,JSON.stringify(estado));
      return true;
    }catch(erro){
      console.error(erro);
      return false;
    }
  }

  function atualizarIntegracoes(){
    if(typeof atualizarCAAutomatica==="function") atualizarCAAutomatica();
    if(typeof atualizarDefesasTotaisBatalha==="function") atualizarDefesasTotaisBatalha();
    if(typeof atualizarPerfil==="function") atualizarPerfil();
    if(typeof atualizarPlacar==="function") atualizarPlacar();
    renderizarResumo();
    renderizarAtaquesPorAcaoBatalha();
    atualizarIndicadorCatalogo();
  }

  function renderizarAtaquesPorAcaoBatalha(){
    const grid=document.querySelector("#batalha .defesasGrid");
    if(!grid||!regras) return;
    let card=document.getElementById("ataquesPorAcaoCard");
    if(!card){
      card=document.createElement("div");
      card.id="ataquesPorAcaoCard";
      card.className="levelUpBattleCard";
      card.innerHTML='<span>Ataques/Ação</span><strong id="ataquesPorAcaoView">1</strong>';
      grid.appendChild(card);
    }
    const view=document.getElementById("ataquesPorAcaoView");
    if(view) view.textContent=String(valoresFixos(nivelAtual()).ataquesPorAcao);
  }

  function totalSelecoesPendentesAte(nivel){
    const salvas=estado.progressaoFixa?.choices||{};
    return Object.entries(regras?.choices||{}).reduce((total,[id,escolha])=>{
      if(!escolha.required||inteiro(escolha.level,999)>nivel) return total;
      return total+Math.max(0,quantidadeExigida(escolha)-normalizarSelecao(escolha,salvas[id]).length);
    },0);
  }

  function escolhasPendentesAte(nivel){
    const salvas=estado.progressaoFixa?.choices||{};
    return Object.entries(regras?.choices||{})
      .map(([id,escolha])=>({id,...escolha}))
      .filter(escolha=>escolha.required&&inteiro(escolha.level,999)>0&&inteiro(escolha.level,999)<=nivel&&!escolhaCompleta(escolha,salvas[escolha.id]))
      .sort((a,b)=>inteiro(a.level,0)-inteiro(b.level,0));
  }

  function precisaConfigurarNivelUm(){
    return estado.progressaoFixa?.vital?.status==="needs-level-one-setup"&&nivelAtual()===1;
  }

  function textoStatus(){
    if(!regras) return "Carregando";
    const faltam=totalSelecoesPendentesAte(nivelAtual());
    if(faltam) return `${faltam} escolha${faltam===1?"":"s"} pendente${faltam===1?"":"s"}`;
    if(precisaConfigurarNivelUm()) return "Configurar PV e Chakra";
    return nivelAtual()>=inteiro(regras.maxLevel,20)?"Nível máximo":"Level Up pronto";
  }

  function caracteristicasResumoHTML(fixos){
    const itens=fixos.caracteristicas.map(id=>({id,...(regras.features?.[id]||{name:id,short:""})}));
    return `
      <details class="levelUpProgressaoDetalhes">
        <summary>
          <span>Características de progressão</span>
          <strong>${itens.length}</strong>
        </summary>
        <div class="levelUpProgressaoLista">
          ${itens.length?itens.map(item=>`<article><strong>${escaparHTML(item.name)}</strong><small>${escaparHTML(item.short||item.description||"")}</small></article>`).join(""):'<div class="levelUpVazio">Nenhuma característica liberada.</div>'}
        </div>
      </details>`;
  }

  function renderizarResumo(){
    const host=document.getElementById("levelUpResumoHost");
    if(!host) return;
    if(!regras){
      host.innerHTML='<section class="levelUpResumoCard"><div class="levelUpResumoTitulo"><small>Progressão</small><strong>Carregando regras...</strong></div></section>';
      return;
    }

    const fixos=valoresFixos(nivelAtual());
    const maximo=fixos.nivel>=inteiro(regras.maxLevel,20);
    const precisaEscolher=escolhasPendentesAte(fixos.nivel).length>0;
    const quantidadePendente=totalSelecoesPendentesAte(fixos.nivel);
    const configurarNivel1=precisaConfigurarNivelUm();
    let acao="abrirLevelUp()";
    let textoBotao=maximo?"Nível máximo":"Subir de nível";
    if(precisaEscolher){
      acao="abrirEscolhasPendentes()";
      textoBotao=`Completar ${quantidadePendente} escolha${quantidadePendente===1?"":"s"}`;
    }else if(configurarNivel1){
      acao="abrirConfiguracaoNivelUm()";
      textoBotao="Configurar nível 1";
    }

    host.innerHTML=`
      <section class="levelUpResumoCard" aria-label="Resumo da progressão">
        <div class="levelUpResumoTopo">
          <div class="levelUpResumoTitulo"><small>Progressão Shinobi</small><strong>Nível ${fixos.nivel}</strong></div>
          <span class="levelUpResumoStatus">${escaparHTML(textoStatus())}</span>
        </div>
        <div class="levelUpResumoGrid">
          <div class="levelUpResumoItem"><span>Proficiência</span><strong>+${fixos.proficiencia}</strong></div>
          <div class="levelUpResumoItem"><span>Rank máximo</span><strong>${escaparHTML(fixos.rankJutsu)}</strong></div>
          <div class="levelUpResumoItem"><span>Ataques/Ação</span><strong>${fixos.ataquesPorAcao}</strong></div>
          <div class="levelUpResumoItem"><span>Chakra-base</span><strong>${fixos.chakraBase}</strong></div>
        </div>
        <section class="levelUpRecursosBloco" aria-label="Recursos de progressão">
          <div><span>Pontos-chave</span><strong>${fixos.pontosChave}</strong><small>Total do nível</small></div>
          <div><span>Pontos de Clã</span><strong>${fixos.pontosCla}</strong><small>Conquistados</small></div>
        </section>
        ${caracteristicasResumoHTML(fixos)}
        <div class="levelUpResumoAcoes">
          <button type="button" class="levelUpBtn" onclick="${acao}" ${(maximo&&!precisaEscolher&&!configurarNivel1)?"disabled":""}>${textoBotao}</button>
          <button type="button" class="levelUpBtnSecundario" onclick="abrirProgressaoFixa()">Ver histórico</button>
        </div>
      </section>`;
  }

  function fecharModal(){
    modalAtual?.remove();
    modalAtual=null;
    document.body.classList.remove("levelUpAberto");
  }

  function criarModal(conteudo,acoes=""){
    fecharModal();
    const overlay=document.createElement("div");
    overlay.className="levelUpOverlay";
    overlay.innerHTML=`<section class="levelUpModal" role="dialog" aria-modal="true" aria-label="Progressão do personagem">${conteudo}${acoes}</section>`;
    overlay.addEventListener("click",evento=>{if(evento.target===overlay) fecharModal();});
    document.body.appendChild(overlay);
    document.body.classList.add("levelUpAberto");
    modalAtual=overlay;
    overlay.querySelector(".levelUpFechar")?.focus();
    return overlay;
  }

  function comparacao(rotulo,antes,depois){
    const mudou=String(antes)!==String(depois);
    return `<div class="levelUpComparacaoItem"><span>${escaparHTML(rotulo)}</span><strong class="${mudou?"levelUpMudou":""}">${escaparHTML(String(antes))}${mudou?` → ${escaparHTML(String(depois))}`:""}</strong></div>`;
  }

  function caracteristicasDoNivel(nivel){
    return (regraNivel(nivel)?.features||[]).map(id=>({id,...(regras.features?.[id]||{name:id,short:""})}));
  }

  function tagModo(modo){
    return {
      fixed:"Aplicação fixa",
      information:"Regra liberada",
      "deferred-calculation":"Regra de recurso",
      "deferred-roll":"Rolagem guiada",
      "required-choice":"Escolha obrigatória",
      "guided-choice":"Escolha com o mestre"
    }[modo]||"Característica";
  }

  function escolhaObrigatoriaDoNivel(nivel){
    return Object.entries(regras.choices||{})
      .map(([id,escolha])=>({id,...escolha}))
      .find(escolha=>inteiro(escolha.level,-1)===nivel&&escolha.required)||null;
  }

  function htmlEscolha(escolha){
    if(!escolha) return "";
    const atuais=normalizarSelecao(escolha,estado.progressaoFixa?.choices?.[escolha.id]);
    const multipla=quantidadeExigida(escolha)>1;
    const tipo=multipla?"checkbox":"radio";
    return `
      <section class="levelUpSecao" data-level-up-choice="${escaparHTML(escolha.id)}">
        <h3>${escaparHTML(escolha.label)}</h3>
        <div class="levelUpEscolhaInstrucao"><span>${escaparHTML(escolha.help||`Selecione ${quantidadeExigida(escolha)} opção${quantidadeExigida(escolha)===1?"":"ões"}.`)}</span><strong class="levelUpEscolhaContador" data-choice-counter>${atuais.length}/${quantidadeExigida(escolha)}</strong></div>
        <div class="levelUpEscolhas">
          ${(escolha.options||[]).map(opcao=>`<label class="levelUpOpcao"><input type="${tipo}" name="levelUpEscolha" value="${escaparHTML(opcao.id)}" ${atuais.includes(opcao.id)?"checked":""}><span><strong>${escaparHTML(opcao.label)}</strong><small>${escaparHTML(opcao.ability)}</small></span></label>`).join("")}
        </div>
      </section>`;
  }

  function lerSelecaoModal(escolha){
    if(!modalAtual||!escolha) return quantidadeExigida(escolha)>1?[]:"";
    const valores=[...modalAtual.querySelectorAll('input[name="levelUpEscolha"]:checked')].map(input=>input.value);
    return selecaoParaSalvar(escolha,valores);
  }

  function configurarControleEscolha(modal,escolha,aoAtualizar){
    if(!modal||!escolha) return;
    const inputs=[...modal.querySelectorAll('input[name="levelUpEscolha"]')];
    const atualizar=(alterado=null)=>{
      let marcados=inputs.filter(input=>input.checked);
      const maximo=maximoEscolhas(escolha);
      if(marcados.length>maximo&&alterado){
        alterado.checked=false;
        marcados=inputs.filter(input=>input.checked);
      }
      inputs.forEach(input=>{input.disabled=!input.checked&&marcados.length>=maximo;});
      const contador=modal.querySelector('[data-choice-counter]');
      if(contador) contador.textContent=`${marcados.length}/${quantidadeExigida(escolha)}`;
      aoAtualizar?.();
    };
    inputs.forEach(input=>input.addEventListener("change",()=>atualizar(input)));
    atualizar();
  }

  function opcoesClaHTML(selecionada){
    return `<option value="">Selecione o clã usado no cálculo</option>${(regras.clans||[]).map(cla=>`<option value="${escaparHTML(cla.id)}" ${cla.id===selecionada?"selected":""}>${escaparHTML(cla.label)}</option>`).join("")}`;
  }

  function htmlCalculadoraRecursos(nivel,inicial){
    const detectada=detectarCla();
    const selecionada=detectada?.id||estado.progressaoFixa?.vital?.lastClanRuleId||"";
    return `
      <section class="levelUpSecao levelUpCalculadora" data-level-up-calculadora>
        <h3>${inicial?"PV e Chakra iniciais":"Ganho de PV e Chakra"}</h3>
        <label class="levelUpCampoCompleto">
          <span>Regra de clã</span>
          <select id="levelUpClaRegra">${opcoesClaHTML(selecionada)}</select>
          <small id="levelUpClaAjuda">${detectada?`Clã detectado na ficha: ${escaparHTML(detectada.label)}.`:"O clã digitado na ficha não foi reconhecido. Escolha a regra correta."}</small>
        </label>

        <div class="levelUpRecursoPainel levelUpVidaPainel">
          <header><div><span>Vida</span><strong id="levelUpVidaDado">—</strong></div><b id="levelUpVidaTotal">—</b></header>
          ${inicial?'<div class="levelUpMetodoFixo">No nível 1, o dado de Vida usa automaticamente o valor máximo.</div>':`
            <div class="levelUpMetodoEscolha">
              <label><input type="radio" name="levelUpVidaMetodo" value="media" checked><span>Usar média</span></label>
              <label><input type="radio" name="levelUpVidaMetodo" value="rolagem"><span>Informar rolagem</span></label>
            </div>
            <label class="levelUpCampoRolagem"><span>Resultado do dado de Vida</span><input id="levelUpVidaRolagem" type="number" inputmode="numeric" min="1" step="1" disabled><small id="levelUpVidaLimite">Escolha a rolagem para preencher.</small></label>`}
          <div id="levelUpVidaFormula" class="levelUpFormula">Selecione um clã.</div>
        </div>

        <div class="levelUpRecursoPainel levelUpChakraPainel">
          <header><div><span>Chakra</span><strong id="levelUpChakraDado">—</strong></div><b id="levelUpChakraTotal">—</b></header>
          <label class="levelUpCampoRolagem"><span>Resultado do dado de Chakra</span><input id="levelUpChakraRolagem" type="number" inputmode="numeric" min="1" step="1"><small id="levelUpChakraLimite">Informe o resultado rolado.</small></label>
          <div id="levelUpChakraFormula" class="levelUpFormula">Selecione um clã.</div>
        </div>

        <div id="levelUpErroCalculo" class="levelUpErroCalculo" hidden></div>
        <div class="levelUpNotaRegra">CON² e INT² são aplicados como <strong>duas vezes o modificador</strong> do atributo.</div>
      </section>`;
  }

  function ajustesRegra(regraRecurso){
    const detalhes=[];
    let total=inteiro(regraRecurso?.flat,0);
    const faltando=[];
    (regraRecurso?.adjustments||[]).forEach(ajuste=>{
      const atributo=String(ajuste.ability||"");
      const score=pontuacaoAtributo(atributo);
      const multiplicador=Math.max(1,inteiro(ajuste.multiplier,1));
      if(score<=0) faltando.push(atributo);
      const mod=modificadorAtributo(atributo);
      const parcela=mod*multiplicador;
      total+=parcela;
      detalhes.push({atributo,score,mod,multiplicador,parcela});
    });
    if(inteiro(regraRecurso?.flat,0)!==0){
      detalhes.push({atributo:null,flat:inteiro(regraRecurso.flat,0),parcela:inteiro(regraRecurso.flat,0)});
    }
    return {total,detalhes,faltando:[...new Set(faltando)]};
  }

  function textoAjustes(calculo){
    if(!calculo.detalhes.length) return "sem modificador de atributo";
    return calculo.detalhes.map(item=>{
      if(item.atributo===null) return `${sinal(item.flat)} fixo`;
      const mult=item.multiplicador>1?`${item.multiplicador}× `:"";
      return `${mult}Mod. ${ABREVIACOES[item.atributo]} ${sinal(item.mod)}${item.multiplicador>1?` = ${sinal(item.parcela)}`:""}`;
    }).join(" · ");
  }

  function lerCalculoModal(nivel,inicial){
    if(!modalAtual) return {valido:false,erro:"Janela de Level Up fechada."};
    const claId=modalAtual.querySelector("#levelUpClaRegra")?.value||"";
    const cla=regraCla(claId);
    if(!cla) return {valido:false,erro:"Selecione a regra de clã."};

    const vidaAjustes=ajustesRegra(cla.life);
    const chakraAjustes=ajustesRegra(cla.chakra);
    const faltando=[...new Set([...vidaAjustes.faltando,...chakraAjustes.faltando])];
    if(faltando.length){
      return {valido:false,erro:`Preencha na página Atributos: ${faltando.map(chave=>ATRIBUTOS[chave]||chave).join(", ")}.`,cla,vidaAjustes,chakraAjustes};
    }

    const dadoVida=inteiro(cla.life?.die,0);
    const dadoChakra=inteiro(cla.chakra?.die,0);
    let metodoVida=inicial?"maximo":(modalAtual.querySelector('input[name="levelUpVidaMetodo"]:checked')?.value||"media");
    let baseVida=0;
    if(inicial){
      baseVida=dadoVida;
    }else if(metodoVida==="media"){
      baseVida=Math.floor(dadoVida/2)+1;
    }else{
      baseVida=inteiro(modalAtual.querySelector("#levelUpVidaRolagem")?.value,0);
      if(baseVida<1||baseVida>dadoVida){
        return {valido:false,erro:`O resultado de Vida deve estar entre 1 e ${dadoVida}.`,cla,vidaAjustes,chakraAjustes,dadoVida,dadoChakra,metodoVida};
      }
    }

    const ganhoVida=baseVida+vidaAjustes.total;
    const rolagemChakra=inteiro(modalAtual.querySelector("#levelUpChakraRolagem")?.value,0);
    if(rolagemChakra<1||rolagemChakra>dadoChakra){
      return {valido:false,erro:`O resultado de Chakra deve estar entre 1 e ${dadoChakra}.`,cla,vidaAjustes,chakraAjustes,dadoVida,dadoChakra,metodoVida,baseVida,ganhoVida};
    }

    const chakraBase=inteiro(regraNivel(nivel)?.chakraBase,0);
    const ganhoChakra=rolagemChakra+chakraAjustes.total+chakraBase;
    if(ganhoVida<=0) return {valido:false,erro:"O ganho total de Vida ficou igual ou abaixo de zero. Revise os atributos e a regra de clã."};
    if(ganhoChakra<=0) return {valido:false,erro:"O ganho total de Chakra ficou igual ou abaixo de zero. Revise os atributos e a regra de clã."};

    return {
      valido:true,
      nivel,
      inicial,
      cla,
      dadoVida,
      dadoChakra,
      metodoVida,
      baseVida,
      rolagemChakra,
      chakraBase,
      vidaAjustes,
      chakraAjustes,
      ganhoVida,
      ganhoChakra,
      atributos:Object.fromEntries(Object.keys(ATRIBUTOS).map(chave=>[chave,{score:pontuacaoAtributo(chave),modifier:modificadorAtributo(chave)}]))
    };
  }

  function atualizarCalculadora(nivel,inicial,escolha=null){
    if(!modalAtual) return;
    const cla=regraCla(modalAtual.querySelector("#levelUpClaRegra")?.value||"");
    const vidaDado=modalAtual.querySelector("#levelUpVidaDado");
    const chakraDado=modalAtual.querySelector("#levelUpChakraDado");
    const vidaFormula=modalAtual.querySelector("#levelUpVidaFormula");
    const chakraFormula=modalAtual.querySelector("#levelUpChakraFormula");
    const vidaTotal=modalAtual.querySelector("#levelUpVidaTotal");
    const chakraTotal=modalAtual.querySelector("#levelUpChakraTotal");
    const vidaInput=modalAtual.querySelector("#levelUpVidaRolagem");
    const chakraInput=modalAtual.querySelector("#levelUpChakraRolagem");
    const vidaLimite=modalAtual.querySelector("#levelUpVidaLimite");
    const chakraLimite=modalAtual.querySelector("#levelUpChakraLimite");
    const erroEl=modalAtual.querySelector("#levelUpErroCalculo");
    const botao=modalAtual.querySelector("#confirmarLevelUpBtn");

    if(cla){
      const dv=inteiro(cla.life?.die,0);
      const dc=inteiro(cla.chakra?.die,0);
      if(vidaDado) vidaDado.textContent=`1d${dv}`;
      if(chakraDado) chakraDado.textContent=`1d${dc}`;
      if(vidaInput){
        vidaInput.max=String(dv);
        const metodo=modalAtual.querySelector('input[name="levelUpVidaMetodo"]:checked')?.value||"media";
        vidaInput.disabled=metodo!=="rolagem";
        if(vidaLimite) vidaLimite.textContent=metodo==="rolagem"?`Valor permitido: 1 a ${dv}.`:`Média automática: ${Math.floor(dv/2)+1}.`;
      }
      if(chakraInput) chakraInput.max=String(dc);
      if(chakraLimite) chakraLimite.textContent=`Valor permitido: 1 a ${dc}.`;
    }else{
      if(vidaDado) vidaDado.textContent="—";
      if(chakraDado) chakraDado.textContent="—";
      if(vidaInput) vidaInput.disabled=true;
    }

    const calculo=lerCalculoModal(nivel,inicial);
    if(calculo.cla){
      const metodoTexto=inicial?`máximo ${calculo.dadoVida}`:(calculo.metodoVida==="media"?`média ${calculo.baseVida}`:`rolagem ${calculo.baseVida||"—"}`);
      if(vidaFormula) vidaFormula.innerHTML=`${escaparHTML(metodoTexto)} <b>${escaparHTML(textoAjustes(calculo.vidaAjustes))}</b>`;
      if(chakraFormula) chakraFormula.innerHTML=`rolagem ${calculo.rolagemChakra||"—"} <b>${escaparHTML(textoAjustes(calculo.chakraAjustes))}</b> <b>+${inteiro(regraNivel(nivel)?.chakraBase,0)} base do nível</b>`;
    }else{
      if(vidaFormula) vidaFormula.textContent="Selecione um clã.";
      if(chakraFormula) chakraFormula.textContent="Selecione um clã.";
    }
    if(vidaTotal) vidaTotal.textContent=Number.isFinite(calculo.ganhoVida)?`+${calculo.ganhoVida}`:"—";
    if(chakraTotal) chakraTotal.textContent=Number.isFinite(calculo.ganhoChakra)?`+${calculo.ganhoChakra}`:"—";
    if(erroEl){
      erroEl.hidden=calculo.valido;
      erroEl.textContent=calculo.valido?"":calculo.erro;
    }

    const escolhaValida=!escolha||escolhaCompleta(escolha,lerSelecaoModal(escolha));
    if(botao) botao.disabled=!(calculo.valido&&escolhaValida);
    modalAtual.__levelUpCalculo=calculo;
  }

  function configurarCalculadora(modal,nivel,inicial,escolha){
    const atualizar=()=>atualizarCalculadora(nivel,inicial,escolha);
    modal.querySelector("#levelUpClaRegra")?.addEventListener("change",atualizar);
    modal.querySelectorAll('input[name="levelUpVidaMetodo"]').forEach(input=>input.addEventListener("change",atualizar));
    modal.querySelector("#levelUpVidaRolagem")?.addEventListener("input",atualizar);
    modal.querySelector("#levelUpChakraRolagem")?.addEventListener("input",atualizar);
    configurarControleEscolha(modal,escolha,atualizar);
    atualizar();
  }

  function abrirAssistenteNivel(nivel,{inicial=false}={}){
    const atual=nivelAtual();
    const alvo=limitarNivel(nivel);
    if(!inicial&&alvo!==atual+1){
      alert("A progressão precisa ocorrer um nível por vez.");
      return;
    }
    const antes=valoresFixos(inicial?1:atual);
    const depois=valoresFixos(alvo);
    const novas=caracteristicasDoNivel(alvo);
    const escolha=inicial?null:escolhaObrigatoriaDoNivel(alvo);
    const ganhoCla=inicial?0:inteiro(regraNivel(alvo)?.clanPointsGrant,0);
    const recursos=recursosAtuais();

    const corpo=`
      <header class="levelUpModalCabecalho">
        <div><span class="levelUpModalSelo">${inicial?"Configuração inicial":"Level Up completo"}</span><h2>${inicial?"Nível 1":`Nível ${atual} → ${alvo}`}</h2></div>
        <button type="button" class="levelUpFechar" onclick="fecharLevelUp()" aria-label="Fechar">×</button>
      </header>
      <div class="levelUpModalCorpo">
        <div class="levelUpAvisoFase">${inicial?"Configure os valores iniciais usando o máximo do dado de Vida e uma rolagem de Chakra.":"Informe as rolagens e confira todos os valores antes de confirmar. A ficha só será alterada no final."}</div>
        ${inicial?`<div class="levelUpComparacao">${comparacao("PV atual",recursos.pvMax,"será substituído")}${comparacao("Chakra atual",recursos.chakraMax,"será substituído")}${comparacao("Chakra-base do nível",depois.chakraBase,depois.chakraBase)}</div>`:`<div class="levelUpComparacao">${comparacao("Proficiência",`+${antes.proficiencia}`,`+${depois.proficiencia}`)}${comparacao("Rank máximo de Jutsu",antes.rankJutsu,depois.rankJutsu)}${comparacao("Pontos-chave",antes.pontosChave,depois.pontosChave)}${comparacao("Ataques por ação",antes.ataquesPorAcao,depois.ataquesPorAcao)}${ganhoCla?comparacao("Pontos de Clã",antes.pontosCla,depois.pontosCla):""}${comparacao("Chakra-base",antes.chakraBase,depois.chakraBase)}</div>`}
        ${htmlCalculadoraRecursos(alvo,inicial)}
        ${!inicial?`<section class="levelUpSecao"><h3>Características do nível</h3><div class="levelUpLista">${novas.length?novas.map(item=>`<article class="levelUpCaracteristica"><strong>${escaparHTML(item.name)}</strong><p>${escaparHTML(item.short||item.description||"")}</p><span class="levelUpTag">${escaparHTML(tagModo(item.mode))}</span></article>`).join(""):'<div class="levelUpVazio">Este nível não libera uma nova característica.</div>'}</div></section>${htmlEscolha(escolha)}`:""}
      </div>`;

    const acoes=`
      <footer class="levelUpModalAcoes">
        <button type="button" class="levelUpCancelar" onclick="fecharLevelUp()">Cancelar</button>
        <button type="button" id="confirmarLevelUpBtn" class="levelUpConfirmar" onclick="confirmarLevelUpCompleto(${alvo},${inicial?"true":"false"})" disabled>${inicial?"Salvar nível 1":`Confirmar nível ${alvo}`}</button>
      </footer>`;
    const modal=criarModal(corpo,acoes);
    configurarCalculadora(modal,alvo,inicial,escolha);
  }

  function abrirLevelUp(){
    if(!regras){
      alert("As regras de progressão ainda estão carregando.");
      return;
    }
    const atual=nivelAtual();
    if(escolhasPendentesAte(atual).length){
      abrirEscolhasPendentes();
      return;
    }
    if(precisaConfigurarNivelUm()){
      abrirConfiguracaoNivelUm();
      return;
    }
    if(atual>=inteiro(regras.maxLevel,20)){
      alert("O personagem já está no nível máximo.");
      return;
    }
    abrirAssistenteNivel(atual+1,{inicial:false});
  }

  function abrirConfiguracaoNivelUm(){
    abrirAssistenteNivel(1,{inicial:true});
  }

  function aplicarRecursos(calculo,inicial){
    const antes=recursosAtuais();
    const depois=inicial?{
      pv:calculo.ganhoVida,
      pvMax:calculo.ganhoVida,
      chakra:calculo.ganhoChakra,
      chakraMax:calculo.ganhoChakra
    }:{
      pv:Math.min(antes.pvMax+calculo.ganhoVida,antes.pv+calculo.ganhoVida),
      pvMax:antes.pvMax+calculo.ganhoVida,
      chakra:Math.min(antes.chakraMax+calculo.ganhoChakra,antes.chakra+calculo.ganhoChakra),
      chakraMax:antes.chakraMax+calculo.ganhoChakra
    };
    definirCampo("pv",depois.pv);
    definirCampo("pvMax",depois.pvMax);
    definirCampo("chakra",depois.chakra);
    definirCampo("chakraMax",depois.chakraMax);
    return {antes,depois};
  }

  function confirmarLevelUpCompleto(novoNivel,inicial=false){
    const atual=nivelAtual();
    const alvo=limitarNivel(novoNivel);
    if(!inicial&&alvo!==atual+1){
      alert("A progressão precisa ocorrer um nível por vez.");
      return;
    }
    const calculo=modalAtual?.__levelUpCalculo||lerCalculoModal(alvo,inicial);
    if(!calculo?.valido){
      alert(calculo?.erro||"Complete os dados de Vida e Chakra.");
      return;
    }
    const escolha=inicial?null:escolhaObrigatoriaDoNivel(alvo);
    const selecionada=escolha?lerSelecaoModal(escolha):"";
    if(escolha&&!escolhaCompleta(escolha,selecionada)){
      alert(`Selecione exatamente ${quantidadeExigida(escolha)} opções.`);
      return;
    }

    const snapshot=clonar(estado);
    try{
      if(typeof sincronizarEstadoDosCampos==="function") sincronizarEstadoDosCampos();
      garantirEstruturaProgressao();
      const progresso=estado.progressaoFixa;
      const recursos=aplicarRecursos(calculo,inicial);
      const instante=new Date().toISOString();

      if(inicial){
        progresso.vital={
          schemaVersion:1,
          status:"configured-level-one",
          initializedAt:progresso.vital?.initializedAt||instante,
          configuredAt:instante,
          startLevel:2,
          historyStartLevel:1,
          lastClanRuleId:calculo.cla.id,
          lastClanLabel:calculo.cla.label
        };
        progresso.pendingByLevel["1"]={
          vida:{status:"completed",gain:calculo.ganhoVida},
          chakra:{status:"completed",gain:calculo.ganhoChakra}
        };
        progresso.history.push({
          type:"initial-resources",
          fromLevel:0,
          toLevel:1,
          appliedAt:instante,
          clan:{id:calculo.cla.id,label:calculo.cla.label},
          resources:{
            life:{die:`1d${calculo.dadoVida}`,method:"maximum",roll:calculo.baseVida,adjustment:calculo.vidaAjustes.total,gain:calculo.ganhoVida},
            chakra:{die:`1d${calculo.dadoChakra}`,roll:calculo.rolagemChakra,adjustment:calculo.chakraAjustes.total,base:calculo.chakraBase,gain:calculo.ganhoChakra},
            before:recursos.antes,
            after:recursos.depois,
            attributes:calculo.atributos
          }
        });
      }else{
        const antes=valoresFixos(atual);
        const depois=valoresFixos(alvo);
        if(escolha) progresso.choices[escolha.id]=selecionada;
        progresso.pendingByLevel[String(alvo)]={
          vida:{status:"completed",gain:calculo.ganhoVida},
          chakra:{status:"completed",gain:calculo.ganhoChakra}
        };
        progresso.history.push({
          type:"level-up",
          fromLevel:atual,
          toLevel:alvo,
          appliedAt:instante,
          fixedBefore:antes,
          fixedAfter:depois,
          unlockedFeatures:[...(regraNivel(alvo)?.features||[])],
          choice:escolha?{id:escolha.id,value:selecionada}:null,
          clan:{id:calculo.cla.id,label:calculo.cla.label},
          resources:{
            life:{die:`1d${calculo.dadoVida}`,method:calculo.metodoVida,roll:calculo.baseVida,adjustment:calculo.vidaAjustes.total,gain:calculo.ganhoVida},
            chakra:{die:`1d${calculo.dadoChakra}`,roll:calculo.rolagemChakra,adjustment:calculo.chakraAjustes.total,base:calculo.chakraBase,gain:calculo.ganhoChakra},
            before:recursos.antes,
            after:recursos.depois,
            attributes:calculo.atributos
          }
        });

        estado.nivel=String(alvo);
        estado.proficiencia=String(depois.proficiencia);
        progresso.level=alvo;
        progresso.proficiency=depois.proficiencia;
        progresso.jutsuRankMax=depois.rankJutsu;
        progresso.keyPointsTotal=depois.pontosChave;
        progresso.clanPointsEarned=depois.pontosCla;
        progresso.attacksPerAction=depois.ataquesPorAcao;
        progresso.chakraBase=depois.chakraBase;
        progresso.activeFeatures=depois.caracteristicas;
        progresso.vital.status="active";
        progresso.vital.lastClanRuleId=calculo.cla.id;
        progresso.vital.lastClanLabel=calculo.cla.label;
        progresso.vital.lastLevelApplied=alvo;

        const campoNivel=document.getElementById("nivelDisplayMini");
        const campoProf=document.getElementById("bonusProficiencia");
        if(campoNivel) campoNivel.value=String(alvo);
        if(campoProf) campoProf.value=String(depois.proficiencia);
      }

      if(!persistirSeguro()) throw new Error("Não foi possível salvar a evolução.");
      fecharModal();
      atualizarIntegracoes();
      const mensagem=inicial
        ?`Nível 1 configurado: ${calculo.ganhoVida} PV e ${calculo.ganhoChakra} Chakra.`
        :`Nível ${alvo}: +${calculo.ganhoVida} PV e +${calculo.ganhoChakra} Chakra.`;
      if(typeof log==="function") log(mensagem);
      if(typeof avisoShinobi==="function") avisoShinobi(inicial?"Configuração concluída":"Level Up concluído",mensagem);
      else alert(mensagem);
    }catch(erro){
      console.error(erro);
      Object.keys(estado).forEach(chave=>delete estado[chave]);
      Object.assign(estado,snapshot);
      sincronizarCamposFixos();
      ["pv","pvMax","chakra","chakraMax"].forEach(chave=>{
        const campo=document.getElementById(chave);
        if(campo&&estado[chave]!==undefined) campo.value=estado[chave];
      });
      persistirSeguro();
      atualizarIntegracoes();
      alert("Não foi possível concluir o Level Up. Nenhuma alteração foi mantida.");
    }
  }

  function manterValoresNivelUmAtuais(){
    const snapshot=clonar(estado);
    try{
      garantirEstruturaProgressao();
      const instante=new Date().toISOString();
      estado.progressaoFixa.vital={
        schemaVersion:1,
        status:"preserved-existing",
        initializedAt:estado.progressaoFixa.vital?.initializedAt||instante,
        preservedAtLevel:1,
        startLevel:2,
        historyStartLevel:2,
        preservedSnapshot:recursosAtuais(),
        migrationRule:"keep-current-values"
      };
      estado.progressaoFixa.history.push({
        type:"resources-preserved",
        toLevel:1,
        appliedAt:instante,
        resources:{status:"preserved-existing",snapshot:recursosAtuais()}
      });
      if(!persistirSeguro()) throw new Error("Falha ao salvar.");
      fecharModal();
      atualizarIntegracoes();
      if(typeof avisoShinobi==="function") avisoShinobi("Valores preservados","O histórico de PV e Chakra começará no próximo Level Up.");
    }catch(erro){
      Object.keys(estado).forEach(chave=>delete estado[chave]);
      Object.assign(estado,snapshot);
      persistirSeguro();
      alert("Não foi possível preservar os valores.");
    }
  }

  function abrirEscolhasPendentes(){
    if(!regras) return;
    garantirEstruturaProgressao();
    const pendente=escolhasPendentesAte(nivelAtual())[0];
    if(!pendente){
      renderizarResumo();
      return;
    }
    const corpo=`
      <header class="levelUpModalCabecalho"><div><span class="levelUpModalSelo">Escolha pendente — nível ${inteiro(pendente.level,0)}</span><h2>${escaparHTML(pendente.label)}</h2></div><button type="button" class="levelUpFechar" onclick="fecharLevelUp()" aria-label="Fechar">×</button></header>
      <div class="levelUpModalCorpo"><div class="levelUpAvisoFase">A ficha já alcançou este nível. Complete a escolha para liberar o próximo Level Up.</div>${htmlEscolha(pendente)}</div>`;
    const acoes=`<footer class="levelUpModalAcoes"><button type="button" class="levelUpCancelar" onclick="fecharLevelUp()">Cancelar</button><button type="button" id="salvarEscolhaPendenteBtn" class="levelUpConfirmar" onclick="salvarEscolhaPendente('${escaparHTML(pendente.id)}')" disabled>Salvar escolhas</button></footer>`;
    const modal=criarModal(corpo,acoes);
    const botao=modal.querySelector("#salvarEscolhaPendenteBtn");
    configurarControleEscolha(modal,pendente,()=>{if(botao) botao.disabled=!escolhaCompleta(pendente,lerSelecaoModal(pendente));});
  }

  function salvarEscolhaPendente(id){
    const escolha=regras?.choices?.[id];
    const selecionada=lerSelecaoModal(escolha);
    if(!escolhaCompleta(escolha,selecionada)){
      alert(`Selecione exatamente ${quantidadeExigida(escolha)} opções.`);
      return;
    }
    const snapshot=clonar(estado);
    try{
      garantirEstruturaProgressao();
      estado.progressaoFixa.choices[id]=selecionada;
      estado.progressaoFixa.history.push({type:"completed-choice",level:inteiro(escolha?.level,nivelAtual()),choice:{id,value:selecionada},appliedAt:new Date().toISOString()});
      if(!persistirSeguro()) throw new Error("Falha ao salvar.");
      fecharModal();
      atualizarIntegracoes();
      if(escolhasPendentesAte(nivelAtual()).length) abrirEscolhasPendentes();
      else if(typeof avisoShinobi==="function") avisoShinobi("Escolhas salvas","A progressão da ficha foi completada.");
    }catch(erro){
      Object.keys(estado).forEach(chave=>delete estado[chave]);
      Object.assign(estado,snapshot);
      persistirSeguro();
      alert("Não foi possível salvar as escolhas.");
    }
  }

  function escolhaTexto(id,valor){
    const escolha=regras.choices?.[id];
    if(!escolha) return String(valor||"Não definida");
    const valores=normalizarSelecao(escolha,valor);
    if(!valores.length) return "Não definida";
    return valores.map(idOpcao=>{
      const opcao=escolha.options?.find(item=>item.id===idOpcao);
      return opcao?`${opcao.label} (${opcao.ability})`:idOpcao;
    }).join(", ");
  }

  function historicoItemHTML(item){
    const data=item.appliedAt?new Date(item.appliedAt).toLocaleString("pt-BR"):"Data não registrada";
    if(item.type==="completed-choice"){
      return `<article class="levelUpHistoricoItem"><strong>Escolhas do nível ${inteiro(item.level,0)}</strong><small>${escaparHTML(escolhaTexto(item.choice?.id,item.choice?.value))} · ${escaparHTML(data)}</small></article>`;
    }
    if(item.type==="initial-level"){
      const migrado=item.retroactive===true||item.resources?.status==="preserved-existing";
      return migrado
        ?`<article class="levelUpHistoricoItem"><strong>Nível 1 aplicado retroativamente</strong><small>Benefícios fixos restaurados; PV e Chakra preservados · ${escaparHTML(data)}</small></article>`
        :`<article class="levelUpHistoricoItem"><strong>Nível 1 iniciado</strong><small>Benefícios fixos preparados; configuração de PV e Chakra pendente · ${escaparHTML(data)}</small></article>`;
    }
    if(item.type==="retroactive-level"){
      return `<article class="levelUpHistoricoItem"><strong>Nível ${inteiro(item.toLevel,0)} aplicado retroativamente</strong><small>Benefícios fixos restaurados; PV e Chakra preservados · ${escaparHTML(data)}</small></article>`;
    }
    if(item.type==="resources-preserved"){
      return `<article class="levelUpHistoricoItem"><strong>PV e Chakra preservados</strong><small>Histórico detalhado iniciado no próximo nível · ${escaparHTML(data)}</small></article>`;
    }
    const vida=item.resources?.life?.gain;
    const chakra=item.resources?.chakra?.gain;
    if(item.type==="initial-resources"){
      return `<article class="levelUpHistoricoItem"><strong>Recursos do nível 1 configurados</strong><small>+${inteiro(vida,0)} PV · +${inteiro(chakra,0)} Chakra · ${escaparHTML(item.clan?.label||"Clã não informado")} · ${escaparHTML(data)}</small></article>`;
    }
    if(item.type==="level-up"||item.fromLevel!==undefined){
      const detalhes=vida!==undefined&&chakra!==undefined?`+${inteiro(vida,0)} PV · +${inteiro(chakra,0)} Chakra`:`PV e Chakra preservados`;
      return `<article class="levelUpHistoricoItem"><strong>Nível ${inteiro(item.fromLevel,0)} → ${inteiro(item.toLevel,0)}</strong><small>${detalhes} · ${escaparHTML(item.clan?.label||"")} ${item.clan?.label?"·":""} ${escaparHTML(data)}</small></article>`;
    }
    return `<article class="levelUpHistoricoItem"><strong>Atualização de progressão</strong><small>${escaparHTML(data)}</small></article>`;
  }

  function abrirProgressaoFixa(){
    if(!regras) return;
    const atual=nivelAtual();
    const fixos=valoresFixos(atual);
    const ativos=fixos.caracteristicas.map(id=>({id,...(regras.features?.[id]||{name:id,description:""})}));
    const historico=[...(estado.progressaoFixa?.history||[])].reverse();
    const escolhas=Object.entries(estado.progressaoFixa?.choices||{});
    const vital=estado.progressaoFixa?.vital||{};
    const corpo=`
      <header class="levelUpModalCabecalho"><div><span class="levelUpModalSelo">Progressão atual</span><h2>Nível ${atual}</h2></div><button type="button" class="levelUpFechar" onclick="fecharLevelUp()" aria-label="Fechar">×</button></header>
      <div class="levelUpModalCorpo">
        <div class="levelUpComparacao">${comparacao("Proficiência",`+${fixos.proficiencia}`,`+${fixos.proficiencia}`)}${comparacao("Rank máximo de Jutsu",fixos.rankJutsu,fixos.rankJutsu)}${comparacao("Pontos-chave totais",fixos.pontosChave,fixos.pontosChave)}${comparacao("Pontos de Clã conquistados",fixos.pontosCla,fixos.pontosCla)}${comparacao("Ataques por ação",fixos.ataquesPorAcao,fixos.ataquesPorAcao)}${comparacao("Chakra-base",fixos.chakraBase,fixos.chakraBase)}</div>
        <section class="levelUpSecao"><h3>PV e Chakra</h3><div class="levelUpCaracteristica"><strong>${vital.status==="preserved-existing"?"Valores anteriores preservados":"Histórico automático ativo"}</strong><p>${vital.status==="preserved-existing"?`As rolagens detalhadas começam no nível ${inteiro(vital.historyStartLevel,atual+1)}.`:"Cada Level Up registra dado, método, modificadores, clã e Chakra-base."}</p></div></section>
        <section class="levelUpSecao"><h3>Características desbloqueadas</h3><div class="levelUpLista">${ativos.map(item=>`<article class="levelUpCaracteristica"><strong>${escaparHTML(item.name)}</strong><p>${escaparHTML(item.description||item.short||"")}</p></article>`).join("")}</div></section>
        ${escolhas.length?`<section class="levelUpSecao"><h3>Escolhas salvas</h3><div class="levelUpLista">${escolhas.map(([id,valor])=>`<article class="levelUpCaracteristica"><strong>${escaparHTML(regras.choices?.[id]?.label||id)}</strong><p>${escaparHTML(escolhaTexto(id,valor))}</p></article>`).join("")}</div></section>`:""}
        <section class="levelUpSecao"><h3>Histórico de Level Up</h3><div class="levelUpHistorico">${historico.length?historico.map(historicoItemHTML).join(""):'<div class="levelUpVazio">O próximo Level Up aparecerá aqui.</div>'}</div></section>
      </div>`;
    const acoes=`<footer class="levelUpModalAcoes"><button type="button" class="levelUpCancelar" onclick="fecharLevelUp()">Fechar</button><button type="button" class="levelUpConfirmar" onclick="fecharLevelUp();${precisaConfigurarNivelUm()?"abrirConfiguracaoNivelUm()":"abrirLevelUp()"}" ${atual>=inteiro(regras.maxLevel,20)&&!precisaConfigurarNivelUm()?"disabled":""}>${precisaConfigurarNivelUm()?"Configurar nível 1":"Subir de nível"}</button></footer>`;
    criarModal(corpo,acoes);
  }

  function abrirRevisaoRetroativa(){
    if(!regras) return;
    const progresso=estado.progressaoFixa||{};
    const atualizacao=progresso.lastRetroactiveUpdate;
    if(!atualizacao||!progresso.retroactiveReviewPending) return;
    const ate=inteiro(atualizacao.toLevel,nivelAtual());
    const linhas=[];
    for(let nivel=1;nivel<=ate;nivel+=1){
      const nomes=(regraNivel(nivel)?.features||[]).map(id=>regras.features?.[id]?.name||id);
      linhas.push(`<article class="levelUpCaracteristica"><strong>Nível ${nivel}</strong><p>${nomes.length?escaparHTML(nomes.join(" · ")):"Valores fixos conferidos"}</p></article>`);
    }
    const faltam=totalSelecoesPendentesAte(ate);
    const corpo=`<header class="levelUpModalCabecalho"><div><span class="levelUpModalSelo">Migração da ficha</span><h2>Níveis anteriores atualizados</h2></div><button type="button" class="levelUpFechar" onclick="fecharLevelUp()" aria-label="Fechar">×</button></header><div class="levelUpModalCorpo"><div class="levelUpAvisoFase">Os benefícios fixos dos níveis 1 a ${ate} foram aplicados. <strong>PV e Chakra atuais foram preservados</strong>; as rolagens automáticas começam no próximo Level Up.</div><section class="levelUpSecao"><h3>Atualizações aplicadas</h3><div class="levelUpLista">${linhas.join("")}</div></section>${faltam?`<div class="levelUpAvisoFase levelUpAvisoEscolhas">Ainda faltam <strong>${faltam} escolhas</strong> da característica Resistência.</div>`:""}</div>`;
    const acoes=`<footer class="levelUpModalAcoes"><button type="button" class="levelUpCancelar" onclick="fecharLevelUp()">Ver depois</button><button type="button" class="levelUpConfirmar" onclick="confirmarRevisaoRetroativa()">${faltam?"Continuar para escolhas":"Concluir revisão"}</button></footer>`;
    criarModal(corpo,acoes);
  }

  function confirmarRevisaoRetroativa(){
    garantirEstruturaProgressao();
    estado.progressaoFixa.retroactiveReviewPending=false;
    persistirSeguro();
    fecharModal();
    atualizarIntegracoes();
    if(escolhasPendentesAte(nivelAtual()).length) abrirEscolhasPendentes();
  }

  function atualizarIndicadorCatalogo(){
    const badge=document.getElementById("catalogoRankProgressao");
    if(!badge||!regras) return;
    badge.innerHTML=`Rank máximo da ficha: <strong>${escaparHTML(valoresFixos(nivelAtual()).rankJutsu)}</strong>`;
  }

  function observarCatalogo(){
    if(observadorCatalogo) return;
    let atualizacaoAgendada=false;
    observadorCatalogo=new MutationObserver(()=>{
      if(atualizacaoAgendada) return;
      atualizacaoAgendada=true;
      requestAnimationFrame(()=>{
        atualizacaoAgendada=false;
        atualizarIndicadorCatalogo();
      });
    });
    observadorCatalogo.observe(document.body,{childList:true,subtree:false});
  }

  function validarRegras(dados){
    if(!dados||!Array.isArray(dados.levels)||!Array.isArray(dados.clans)) throw new Error("Tabela de progressão inválida.");
    const niveis=new Set(dados.levels.map(item=>inteiro(item.level,-1)));
    for(let nivel=0;nivel<=inteiro(dados.maxLevel,20);nivel+=1){
      if(!niveis.has(nivel)) throw new Error(`Nível ${nivel} ausente na tabela.`);
    }
    dados.clans.forEach(cla=>{
      if(!cla.id||!cla.life?.die||!cla.chakra?.die) throw new Error(`Regra de clã inválida: ${cla.label||cla.id||"sem nome"}.`);
    });
    return dados;
  }

  async function carregarRegras(){
    const resposta=await fetch(URL_PROGRESSAO,{cache:"no-store",credentials:"same-origin"});
    if(!resposta.ok) throw new Error(`Progressão respondeu HTTP ${resposta.status}.`);
    regras=validarRegras(await resposta.json());
    mapaNiveis=new Map(regras.levels.map(item=>[inteiro(item.level,-1),item]));
    mapaClas=new Map(regras.clans.map(item=>[String(item.id),item]));
    mapaAliasesCla=new Map();
    regras.clans.forEach(cla=>{
      [cla.label,cla.id,...(cla.aliases||[])].forEach(alias=>{
        const normalizado=normalizarTexto(alias);
        if(normalizado) mapaAliasesCla.set(normalizado,cla.id);
      });
    });
  }

  async function iniciar(){
    const campoNivel=document.getElementById("nivelDisplayMini");
    const xpLinha=document.querySelector("#identidade .xpLinhaNova");
    if(!campoNivel||!xpLinha) return;
    let host=document.getElementById("levelUpResumoHost");
    if(!host){
      host=document.createElement("div");
      host.id="levelUpResumoHost";
      xpLinha.insertAdjacentElement("afterend",host);
    }
    renderizarResumo();

    try{
      await carregarRegras();
      const tinhaNivel=String(estado?.nivel??"").trim()!=="";
      if(!tinhaNivel){
        estado.nivel="1";
        estado.proficiencia="2";
      }
      garantirEstruturaProgressao();
      sincronizarCamposFixos();
      persistirSeguro();
      observarCatalogo();
      atualizarIntegracoes();
      if(estado.progressaoFixa?.retroactiveReviewPending) setTimeout(abrirRevisaoRetroativa,260);
    }catch(erro){
      console.error("Falha ao iniciar Level Up",erro);
      host.innerHTML='<section class="levelUpResumoCard"><div class="levelUpResumoTitulo"><small>Progressão</small><strong>Não foi possível carregar as regras</strong></div><div class="levelUpResumoAcoes"><button type="button" class="levelUpBtn" onclick="location.reload()">Recarregar</button></div></section>';
    }
  }

  window.abrirLevelUp=abrirLevelUp;
  window.abrirConfiguracaoNivelUm=abrirConfiguracaoNivelUm;
  window.confirmarLevelUpCompleto=confirmarLevelUpCompleto;
  window.manterValoresNivelUmAtuais=manterValoresNivelUmAtuais;
  window.abrirEscolhasPendentes=abrirEscolhasPendentes;
  window.salvarEscolhaPendente=salvarEscolhaPendente;
  window.abrirProgressaoFixa=abrirProgressaoFixa;
  window.abrirRevisaoRetroativa=abrirRevisaoRetroativa;
  window.confirmarRevisaoRetroativa=confirmarRevisaoRetroativa;
  window.fecharLevelUp=fecharModal;
  window.shinobiLevelUp={
    getRules:()=>regras,
    getFixedValues:()=>regras?valoresFixos(nivelAtual()):null,
    getMaxJutsuRank:()=>regras?valoresFixos(nivelAtual()).rankJutsu:null,
    getClanRule:()=>regras?detectarCla():null,
    refresh:atualizarIntegracoes
  };

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",iniciar,{once:true});
  else iniciar();

  window.addEventListener("pageshow",()=>{
    if(!regras) return;
    setTimeout(()=>{
      garantirEstruturaProgressao();
      sincronizarCamposFixos();
      atualizarIntegracoes();
    },180);
  });
})();
