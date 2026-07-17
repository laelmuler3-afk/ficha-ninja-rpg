/* Shinobi 2.0.0 — Level Up de benefícios fixos, integrado sobre a base 1.10.8. */
(function(){
  "use strict";

  if(window.__shinobiLevelUpFixosV200) return;
  window.__shinobiLevelUpFixosV200 = true;

  const VERSAO = "2.0.0";
  const URL_PROGRESSAO = `./data/progressao-ninja.json?v=${VERSAO}`;
  let regras = null;
  let mapaNiveis = new Map();
  let modalAtual = null;

  function numeroInteiro(valor, padrao=0){
    const numero = Number.parseInt(String(valor ?? "").trim(), 10);
    return Number.isFinite(numero) ? numero : padrao;
  }

  function limitarNivel(valor){
    const maximo = numeroInteiro(regras?.maxLevel, 20);
    return Math.max(1, Math.min(maximo, numeroInteiro(valor, 1)));
  }

  function escaparHTML(valor){
    return String(valor ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function clonar(valor){
    if(typeof structuredClone === "function") return structuredClone(valor);
    return JSON.parse(JSON.stringify(valor));
  }

  function regraNivel(nivel){
    return mapaNiveis.get(numeroInteiro(nivel, 1)) || null;
  }

  function nivelAtual(){
    const campo = document.getElementById("nivelDisplayMini");
    return limitarNivel(estado?.nivel ?? campo?.value ?? 1);
  }

  function caracteristicasAte(nivel){
    const ids=[];
    for(let atual=0; atual<=nivel; atual+=1){
      const linha=regraNivel(atual);
      (linha?.features || []).forEach(id=>{
        if(!ids.includes(id)) ids.push(id);
      });
    }
    return ids;
  }

  function pontosClaAte(nivel){
    let total=0;
    for(let atual=0; atual<=nivel; atual+=1){
      total += numeroInteiro(regraNivel(atual)?.clanPointsGrant, 0);
    }
    return total;
  }

  function valoresFixos(nivel){
    const linha=regraNivel(limitarNivel(nivel)) || {};
    return {
      nivel:limitarNivel(nivel),
      proficiencia:numeroInteiro(linha.proficiency, 2),
      rankJutsu:String(linha.jutsuRank || "—"),
      pontosChave:numeroInteiro(linha.keyPoints, 0),
      pontosCla:pontosClaAte(nivel),
      ataquesPorAcao:numeroInteiro(linha.attacksPerAction, 1),
      caracteristicas:caracteristicasAte(nivel)
    };
  }

  function garantirEstruturaProgressao(){
    const atual=nivelAtual();
    const fixos=valoresFixos(atual);
    let alterou=false;

    if(!estado.progressaoFixa || typeof estado.progressaoFixa !== "object" || Array.isArray(estado.progressaoFixa)){
      estado.progressaoFixa={
        schemaVersion:1,
        engineVersion:VERSAO,
        initializedAt:new Date().toISOString(),
        migratedFromExistingLevel:atual>1,
        level:atual,
        choices:{},
        history:[],
        pendingByLevel:{}
      };
      alterou=true;
    }

    const progresso=estado.progressaoFixa;
    if(!progresso.choices || typeof progresso.choices !== "object"){
      progresso.choices={};
      alterou=true;
    }
    if(!Array.isArray(progresso.history)){
      progresso.history=[];
      alterou=true;
    }
    if(!progresso.pendingByLevel || typeof progresso.pendingByLevel !== "object"){
      progresso.pendingByLevel={};
      alterou=true;
    }

    const atualizacoes={
      schemaVersion:1,
      engineVersion:VERSAO,
      level:fixos.nivel,
      proficiency:fixos.proficiencia,
      jutsuRankMax:fixos.rankJutsu,
      keyPointsTotal:fixos.pontosChave,
      clanPointsEarned:fixos.pontosCla,
      attacksPerAction:fixos.ataquesPorAcao,
      activeFeatures:fixos.caracteristicas
    };

    Object.entries(atualizacoes).forEach(([chave,valor])=>{
      if(JSON.stringify(progresso[chave]) !== JSON.stringify(valor)){
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
      campoNivel.max=String(regras?.maxLevel || 20);
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
    if(typeof persistirEstadoLocal === "function") return persistirEstadoLocal();
    try{
      localStorage.setItem(CHAVE,JSON.stringify(estado));
      return true;
    }catch(erro){
      console.error(erro);
      return false;
    }
  }

  function atualizarIntegracoes(){
    if(typeof atualizarCAAutomatica === "function") atualizarCAAutomatica();
    if(typeof atualizarDefesasTotaisBatalha === "function") atualizarDefesasTotaisBatalha();
    if(typeof atualizarPerfil === "function") atualizarPerfil();
    if(typeof atualizarPlacar === "function") atualizarPlacar();
    renderizarResumo();
    renderizarAtaquesPorAcaoBatalha();
  }

  function renderizarAtaquesPorAcaoBatalha(){
    const grid=document.querySelector("#batalha .defesasGrid");
    if(!grid || !regras) return;

    let card=document.getElementById("ataquesPorAcaoCard");
    if(!card){
      card=document.createElement("div");
      card.id="ataquesPorAcaoCard";
      card.className="levelUpBattleCard";
      card.innerHTML='<span>Ataques/Ação</span><strong id="ataquesPorAcaoView">1</strong>';
      grid.appendChild(card);
    }

    const valor=valoresFixos(nivelAtual()).ataquesPorAcao;
    const view=document.getElementById("ataquesPorAcaoView");
    if(view) view.textContent=String(valor);
  }

  function textoStatus(){
    if(!regras) return "Carregando";
    if(escolhasPendentesAte(nivelAtual()).length) return "Escolha pendente";
    return nivelAtual() >= numeroInteiro(regras.maxLevel,20) ? "Nível máximo" : "Fixos ativos";
  }

  function renderizarResumo(){
    const host=document.getElementById("levelUpResumoHost");
    if(!host) return;

    if(!regras){
      host.innerHTML=`
        <section class="levelUpResumoCard">
          <div class="levelUpResumoTopo">
            <div class="levelUpResumoTitulo"><small>Progressão</small><strong>Carregando regras...</strong></div>
            <span class="levelUpResumoStatus">Aguarde</span>
          </div>
        </section>`;
      return;
    }

    const fixos=valoresFixos(nivelAtual());
    const maximo=fixos.nivel >= numeroInteiro(regras.maxLevel,20);
    const escolhasPendentes=escolhasPendentesAte(fixos.nivel);
    const precisaEscolher=escolhasPendentes.length>0;
    host.innerHTML=`
      <section class="levelUpResumoCard" aria-label="Resumo da progressão fixa">
        <div class="levelUpResumoTopo">
          <div class="levelUpResumoTitulo">
            <small>Progressão fixa</small>
            <strong>Nível ${fixos.nivel}</strong>
          </div>
          <span class="levelUpResumoStatus">${escaparHTML(textoStatus())}</span>
        </div>
        <div class="levelUpResumoGrid">
          <div class="levelUpResumoItem"><span>Proficiência</span><strong>+${fixos.proficiencia}</strong></div>
          <div class="levelUpResumoItem"><span>Rank Jutsu</span><strong>${escaparHTML(fixos.rankJutsu)}</strong></div>
          <div class="levelUpResumoItem"><span>Pontos-chave</span><strong>${fixos.pontosChave}</strong></div>
          <div class="levelUpResumoItem"><span>Ataques/Ação</span><strong>${fixos.ataquesPorAcao}</strong></div>
        </div>
        <div class="levelUpResumoAcoes">
          <button type="button" class="levelUpBtn" onclick="${precisaEscolher?"abrirEscolhasPendentes()":"abrirLevelUp()"}" ${(maximo&&!precisaEscolher)?"disabled":""}>${precisaEscolher?"Completar escolha":(maximo?"Nível máximo":"Subir de nível")}</button>
          <button type="button" class="levelUpBtnSecundario" onclick="abrirProgressaoFixa()">Ver progressão</button>
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
    overlay.innerHTML=`
      <section class="levelUpModal" role="dialog" aria-modal="true" aria-label="Progressão do personagem">
        ${conteudo}
        ${acoes}
      </section>`;
    overlay.addEventListener("click",evento=>{
      if(evento.target===overlay) fecharModal();
    });
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
    const linha=regraNivel(nivel);
    return (linha?.features || []).map(id=>({id,...(regras.features?.[id] || {name:id,short:""})}));
  }

  function tagModo(modo){
    return {
      "fixed":"Aplicação fixa",
      "information":"Regra liberada",
      "deferred-calculation":"Cálculo adiado",
      "deferred-roll":"Rolagem adiada",
      "required-choice":"Escolha obrigatória",
      "guided-choice":"Escolha com o mestre"
    }[modo] || "Característica";
  }

  function escolhaObrigatoriaDoNivel(nivel){
    return Object.entries(regras.choices || {})
      .map(([id,escolha])=>({id,...escolha}))
      .find(escolha=>numeroInteiro(escolha.level,-1)===nivel && escolha.required) || null;
  }

  function escolhasPendentesAte(nivel){
    const salvas=estado.progressaoFixa?.choices || {};
    return Object.entries(regras?.choices || {})
      .map(([id,escolha])=>({id,...escolha}))
      .filter(escolha=>
        escolha.required &&
        numeroInteiro(escolha.level,999)>0 &&
        numeroInteiro(escolha.level,999)<=nivel &&
        !String(salvas[escolha.id] || "").trim()
      )
      .sort((a,b)=>numeroInteiro(a.level,0)-numeroInteiro(b.level,0));
  }

  function htmlEscolha(escolha){
    if(!escolha) return "";
    const atual=estado.progressaoFixa?.choices?.[escolha.id] || "";
    return `
      <section class="levelUpSecao">
        <h3>${escaparHTML(escolha.label)}</h3>
        <div class="levelUpEscolhas">
          ${(escolha.options || []).map(opcao=>`
            <label class="levelUpOpcao">
              <input type="radio" name="levelUpEscolha" value="${escaparHTML(opcao.id)}" ${atual===opcao.id?"checked":""}>
              <span><strong>${escaparHTML(opcao.label)}</strong><small>${escaparHTML(opcao.ability)}</small></span>
            </label>`).join("")}
        </div>
      </section>`;
  }

  function abrirLevelUp(){
    if(!regras){
      alert("As regras de progressão ainda estão carregando. Tente novamente em alguns segundos.");
      return;
    }

    const atual=nivelAtual();
    if(escolhasPendentesAte(atual).length){
      abrirEscolhasPendentes();
      return;
    }
    const proximo=atual+1;
    if(proximo>numeroInteiro(regras.maxLevel,20)){
      alert("Este personagem já está no nível máximo.");
      return;
    }

    const antes=valoresFixos(atual);
    const depois=valoresFixos(proximo);
    const novas=caracteristicasDoNivel(proximo);
    const escolha=escolhaObrigatoriaDoNivel(proximo);
    const ganhoCla=numeroInteiro(regraNivel(proximo)?.clanPointsGrant,0);

    const corpo=`
      <header class="levelUpModalCabecalho">
        <div><span class="levelUpModalSelo">Level Up — fase 1</span><h2>Nível ${atual} → ${proximo}</h2></div>
        <button type="button" class="levelUpFechar" onclick="fecharLevelUp()" aria-label="Fechar">×</button>
      </header>
      <div class="levelUpModalCorpo">
        <div class="levelUpAvisoFase">Esta atualização aplica somente os benefícios fixos. <strong>PV e Chakra não serão alterados</strong> até as regras de rolagem serem confirmadas.</div>
        <div class="levelUpComparacao">
          ${comparacao("Proficiência",`+${antes.proficiencia}`,`+${depois.proficiencia}`)}
          ${comparacao("Rank máximo de Jutsu",antes.rankJutsu,depois.rankJutsu)}
          ${comparacao("Pontos-chave",antes.pontosChave,depois.pontosChave)}
          ${comparacao("Ataques por ação",antes.ataquesPorAcao,depois.ataquesPorAcao)}
          ${ganhoCla?comparacao("Pontos de Clã",antes.pontosCla,depois.pontosCla):""}
        </div>
        <section class="levelUpSecao">
          <h3>Características do nível</h3>
          <div class="levelUpLista">
            ${novas.length?novas.map(item=>`
              <article class="levelUpCaracteristica">
                <strong>${escaparHTML(item.name)}</strong>
                <p>${escaparHTML(item.short || item.description || "")}</p>
                <span class="levelUpTag">${escaparHTML(tagModo(item.mode))}</span>
              </article>`).join(""):'<div class="levelUpVazio">Este nível não libera uma nova característica fixa.</div>'}
          </div>
        </section>
        ${htmlEscolha(escolha)}
        <section class="levelUpSecao">
          <h3>Fica para a fase 2</h3>
          <div class="levelUpPendencias">
            ${(regras.deferred || []).map(item=>`<div class="levelUpPendente"><strong>${escaparHTML(item.label)}</strong><small>${escaparHTML(item.reason)}</small></div>`).join("")}
          </div>
        </section>
      </div>`;

    const acoes=`
      <footer class="levelUpModalAcoes">
        <button type="button" class="levelUpCancelar" onclick="fecharLevelUp()">Cancelar</button>
        <button type="button" id="confirmarLevelUpBtn" class="levelUpConfirmar" onclick="confirmarLevelUp(${proximo})" ${escolha?"disabled":""}>Confirmar nível ${proximo}</button>
      </footer>`;

    const modal=criarModal(corpo,acoes);
    if(escolha){
      const botao=modal.querySelector("#confirmarLevelUpBtn");
      const radios=modal.querySelectorAll('input[name="levelUpEscolha"]');
      const validar=()=>{ if(botao) botao.disabled=!modal.querySelector('input[name="levelUpEscolha"]:checked'); };
      radios.forEach(radio=>radio.addEventListener("change",validar));
      validar();
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
      <header class="levelUpModalCabecalho">
        <div><span class="levelUpModalSelo">Escolha pendente — nível ${numeroInteiro(pendente.level,0)}</span><h2>${escaparHTML(pendente.label)}</h2></div>
        <button type="button" class="levelUpFechar" onclick="fecharLevelUp()" aria-label="Fechar">×</button>
      </header>
      <div class="levelUpModalCorpo">
        <div class="levelUpAvisoFase">Esta ficha já alcançou o nível da característica, mas a escolha ainda não foi registrada. Selecione uma opção para completar a progressão fixa.</div>
        ${htmlEscolha(pendente)}
      </div>`;
    const acoes=`
      <footer class="levelUpModalAcoes">
        <button type="button" class="levelUpCancelar" onclick="fecharLevelUp()">Cancelar</button>
        <button type="button" id="salvarEscolhaPendenteBtn" class="levelUpConfirmar" onclick="salvarEscolhaPendente('${escaparHTML(pendente.id)}')" disabled>Salvar escolha</button>
      </footer>`;
    const modal=criarModal(corpo,acoes);
    const botao=modal.querySelector("#salvarEscolhaPendenteBtn");
    const validar=()=>{ if(botao) botao.disabled=!modal.querySelector('input[name="levelUpEscolha"]:checked'); };
    modal.querySelectorAll('input[name="levelUpEscolha"]').forEach(radio=>radio.addEventListener("change",validar));
    validar();
  }

  function salvarEscolhaPendente(id){
    const selecionada=modalAtual?.querySelector('input[name="levelUpEscolha"]:checked')?.value || "";
    if(!selecionada){
      alert("Escolha uma opção para continuar.");
      return;
    }

    const snapshot=clonar(estado);
    try{
      garantirEstruturaProgressao();
      estado.progressaoFixa.choices[id]=selecionada;
      estado.progressaoFixa.history.push({
        type:"completed-choice",
        level:nivelAtual(),
        choice:{id,value:selecionada},
        appliedAt:new Date().toISOString()
      });
      if(!persistirSeguro()) throw new Error("Não foi possível salvar a escolha.");
      fecharModal();
      atualizarIntegracoes();
      if(escolhasPendentesAte(nivelAtual()).length) abrirEscolhasPendentes();
      else if(typeof avisoShinobi === "function") avisoShinobi("Escolha salva","A progressão fixa da ficha foi completada.");
    }catch(erro){
      console.error(erro);
      Object.keys(estado).forEach(chave=>delete estado[chave]);
      Object.assign(estado,snapshot);
      persistirSeguro();
      alert("Não foi possível salvar a escolha. Nenhuma alteração foi mantida.");
    }
  }

  function confirmarLevelUp(novoNivel){
    const atual=nivelAtual();
    const alvo=limitarNivel(novoNivel);
    if(alvo!==atual+1){
      alert("A progressão precisa ocorrer um nível por vez.");
      return;
    }

    const escolha=escolhaObrigatoriaDoNivel(alvo);
    const selecionada=modalAtual?.querySelector('input[name="levelUpEscolha"]:checked')?.value || "";
    if(escolha && !selecionada){
      alert("Escolha uma característica para concluir este nível.");
      return;
    }

    const snapshot=clonar(estado);
    try{
      if(typeof sincronizarEstadoDosCampos === "function") sincronizarEstadoDosCampos();
      garantirEstruturaProgressao();

      const antes=valoresFixos(atual);
      const depois=valoresFixos(alvo);
      const progresso=estado.progressaoFixa;

      if(escolha) progresso.choices[escolha.id]=selecionada;
      progresso.pendingByLevel[String(alvo)]={
        vida:{status:"pending",value:null},
        chakra:{status:"pending",value:null}
      };
      progresso.history.push({
        fromLevel:atual,
        toLevel:alvo,
        appliedAt:new Date().toISOString(),
        fixedBefore:antes,
        fixedAfter:depois,
        unlockedFeatures:[...(regraNivel(alvo)?.features || [])],
        choice:escolha?{id:escolha.id,value:selecionada}:null,
        deferred:["vida","chakra"]
      });

      estado.nivel=String(alvo);
      estado.proficiencia=String(depois.proficiencia);
      progresso.level=alvo;
      progresso.proficiency=depois.proficiencia;
      progresso.jutsuRankMax=depois.rankJutsu;
      progresso.keyPointsTotal=depois.pontosChave;
      progresso.clanPointsEarned=depois.pontosCla;
      progresso.attacksPerAction=depois.ataquesPorAcao;
      progresso.activeFeatures=depois.caracteristicas;

      const campoNivel=document.getElementById("nivelDisplayMini");
      const campoProf=document.getElementById("bonusProficiencia");
      if(campoNivel) campoNivel.value=String(alvo);
      if(campoProf) campoProf.value=String(depois.proficiencia);

      if(!persistirSeguro()) throw new Error("Não foi possível salvar a evolução.");

      fecharModal();
      atualizarIntegracoes();
      if(typeof log === "function") log(`Subiu para o nível ${alvo}. Benefícios fixos aplicados; PV e Chakra pendentes.`);
      if(typeof avisoShinobi === "function"){
        avisoShinobi("Level Up concluído",`Nível ${alvo} aplicado. Proficiência, Rank de Jutsu, pontos, ataques e características fixas foram atualizados. PV e Chakra permaneceram iguais.`);
      }else{
        alert(`Nível ${alvo} aplicado. PV e Chakra permaneceram iguais.`);
      }
    }catch(erro){
      console.error(erro);
      Object.keys(estado).forEach(chave=>delete estado[chave]);
      Object.assign(estado,snapshot);
      sincronizarCamposFixos();
      persistirSeguro();
      atualizarIntegracoes();
      alert("Não foi possível concluir o Level Up. Nenhuma alteração foi mantida.");
    }
  }

  function escolhaTexto(id,valor){
    const escolha=regras.choices?.[id];
    const opcao=escolha?.options?.find(item=>item.id===valor);
    return opcao ? `${opcao.label} (${opcao.ability})` : valor || "Não definida";
  }

  function abrirProgressaoFixa(){
    if(!regras) return;
    const atual=nivelAtual();
    const fixos=valoresFixos(atual);
    const ativos=fixos.caracteristicas.map(id=>({id,...(regras.features?.[id] || {name:id,description:""})}));
    const historico=[...(estado.progressaoFixa?.history || [])].reverse();
    const escolhas=Object.entries(estado.progressaoFixa?.choices || {});

    const corpo=`
      <header class="levelUpModalCabecalho">
        <div><span class="levelUpModalSelo">Progressão atual</span><h2>Nível ${atual}</h2></div>
        <button type="button" class="levelUpFechar" onclick="fecharLevelUp()" aria-label="Fechar">×</button>
      </header>
      <div class="levelUpModalCorpo">
        <div class="levelUpComparacao">
          ${comparacao("Proficiência",`+${fixos.proficiencia}`,`+${fixos.proficiencia}`)}
          ${comparacao("Rank máximo de Jutsu",fixos.rankJutsu,fixos.rankJutsu)}
          ${comparacao("Pontos-chave totais",fixos.pontosChave,fixos.pontosChave)}
          ${comparacao("Pontos de Clã conquistados",fixos.pontosCla,fixos.pontosCla)}
          ${comparacao("Ataques por ação",fixos.ataquesPorAcao,fixos.ataquesPorAcao)}
        </div>
        <section class="levelUpSecao">
          <h3>Características desbloqueadas</h3>
          <div class="levelUpLista">
            ${ativos.map(item=>`<article class="levelUpCaracteristica"><strong>N${(regras.levels.find(l=>(l.features||[]).includes(item.id))||{}).level ?? 0} · ${escaparHTML(item.name)}</strong><p>${escaparHTML(item.description || item.short || "")}</p></article>`).join("")}
          </div>
        </section>
        ${escolhas.length?`<section class="levelUpSecao"><h3>Escolhas salvas</h3><div class="levelUpLista">${escolhas.map(([id,valor])=>`<article class="levelUpCaracteristica"><strong>${escaparHTML(regras.choices?.[id]?.label || id)}</strong><p>${escaparHTML(escolhaTexto(id,valor))}</p></article>`).join("")}</div></section>`:""}
        <section class="levelUpSecao">
          <h3>Histórico de Level Up</h3>
          <div class="levelUpHistorico">
            ${historico.length?historico.map(item=>{
              const data=item.appliedAt?new Date(item.appliedAt).toLocaleString("pt-BR"):"Data não registrada";
              if(item.type==="completed-choice"){
                const escolha=item.choice||{};
                return `<article class="levelUpHistoricoItem"><strong>Escolha do nível ${numeroInteiro(item.level,0)}</strong><small>${escaparHTML(escolhaTexto(escolha.id,escolha.value))} · ${escaparHTML(data)}</small></article>`;
              }
              return `<article class="levelUpHistoricoItem"><strong>Nível ${numeroInteiro(item.fromLevel,0)} → ${numeroInteiro(item.toLevel,0)}</strong><small>${escaparHTML(data)} · PV e Chakra pendentes</small></article>`;
            }).join(""):'<div class="levelUpVazio">Esta ficha foi migrada no nível atual. Os próximos Level Ups aparecerão aqui.</div>'}
          </div>
        </section>
      </div>`;
    const acoes=`<footer class="levelUpModalAcoes"><button type="button" class="levelUpCancelar" onclick="fecharLevelUp()">Fechar</button><button type="button" class="levelUpConfirmar" onclick="fecharLevelUp();abrirLevelUp()" ${atual>=numeroInteiro(regras.maxLevel,20)?"disabled":""}>Subir de nível</button></footer>`;
    criarModal(corpo,acoes);
  }

  function validarRegras(dados){
    if(!dados || !Array.isArray(dados.levels)) throw new Error("Tabela de progressão inválida.");
    const niveis=new Set(dados.levels.map(item=>numeroInteiro(item.level,-1)));
    for(let nivel=0;nivel<=numeroInteiro(dados.maxLevel,20);nivel+=1){
      if(!niveis.has(nivel)) throw new Error(`Nível ${nivel} ausente na tabela.`);
    }
    return dados;
  }

  async function carregarRegras(){
    const resposta=await fetch(URL_PROGRESSAO,{cache:"no-store",credentials:"same-origin"});
    if(!resposta.ok) throw new Error(`Progressão respondeu HTTP ${resposta.status}.`);
    regras=validarRegras(await resposta.json());
    mapaNiveis=new Map(regras.levels.map(item=>[numeroInteiro(item.level,-1),item]));
  }

  async function iniciar(){
    const campoNivel=document.getElementById("nivelDisplayMini");
    const xpLinha=document.querySelector("#identidade .xpLinhaNova");
    if(!campoNivel || !xpLinha) return;

    let host=document.getElementById("levelUpResumoHost");
    if(!host){
      host=document.createElement("div");
      host.id="levelUpResumoHost";
      xpLinha.insertAdjacentElement("afterend",host);
    }
    renderizarResumo();

    try{
      await carregarRegras();
      const tinhaNivel=String(estado?.nivel ?? "").trim()!=="";
      if(!tinhaNivel){
        estado.nivel="1";
        estado.proficiencia="2";
      }
      garantirEstruturaProgressao();
      sincronizarCamposFixos();
      persistirSeguro();
      atualizarIntegracoes();
    }catch(erro){
      console.error("Falha ao iniciar Level Up",erro);
      host.innerHTML=`<section class="levelUpResumoCard"><div class="levelUpResumoTitulo"><small>Progressão</small><strong>Não foi possível carregar as regras</strong></div><div class="levelUpResumoAcoes"><button type="button" class="levelUpBtn" onclick="location.reload()">Recarregar</button></div></section>`;
    }
  }

  window.abrirLevelUp=abrirLevelUp;
  window.abrirEscolhasPendentes=abrirEscolhasPendentes;
  window.salvarEscolhaPendente=salvarEscolhaPendente;
  window.confirmarLevelUp=confirmarLevelUp;
  window.abrirProgressaoFixa=abrirProgressaoFixa;
  window.fecharLevelUp=fecharModal;
  window.shinobiLevelUp={
    getRules:()=>regras,
    getFixedValues:()=>regras?valoresFixos(nivelAtual()):null,
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
