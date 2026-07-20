/* Ficha Ninja RPG — interface de mesa online e backup. */
(function(){
  "use strict";

  let root=null;
  let aberto=false;
  let renderTimer=null;
  let scannerStream=null;
  let scannerFrame=null;
  let conflitoAtual=null;
  let painelFlutuante=null;
  let arrastoPainel=null;
  let ignorarCliquePainel=false;

  const CHAVE_PAINEL_FLUTUANTE="shinobi_online_widget_v1";

  const esc=valor=>String(valor==null?"":valor).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  const num=(v,p=0)=>Number.isFinite(Number(v))?Number(v):p;
  const listaDeObjeto=valor=>Object.values(valor||{});

  function obterEstado(){return window.ShinobiOnline?.snapshot?.()||{};}
  function sessaoLocal(){try{return JSON.parse(localStorage.getItem("shinobi_online_session_v1")||"null");}catch(_erro){return null;}}
  function ehMestre(st){return Boolean(st?.user&&st?.sala&&st.sala.masterUid===st.user.uid);}
  function participantes(st){return listaDeObjeto(st?.sala?.participants).sort((a,b)=>String(a.displayName||"").localeCompare(String(b.displayName||""),"pt-BR"));}
  function ordem(st){return window.ShinobiOnline?.normalizarOrdem?.()||[];}
  function participanteAtual(st){const o=ordem(st);return st?.sala?.participants?.[o[num(st?.sala?.combat?.turnIndex)]]||null;}
  function conectado(st,p){return p.type==="player"&&Boolean(st?.presencas?.[p.ownerUid]?.connected);}
  function rodadasRestantes(efeito,combat){
    const rodadaAtual=Math.max(1,num(combat?.round,1));
    const indiceAtual=Math.max(0,num(combat?.turnIndex));
    const rodadaFim=Math.max(1,num(efeito?.expiresAtRound,rodadaAtual));
    const indiceFim=Math.max(0,num(efeito?.expiresAtTurnIndex??efeito?.startTurnIndex));
    if(rodadaAtual>rodadaFim||(rodadaAtual===rodadaFim&&indiceAtual>=indiceFim))return 0;
    const diferenca=rodadaFim-rodadaAtual;
    return diferenca>0?diferenca:1;
  }

  function preferenciasPainel(){
    const padrao={modo:"minimizado",x:null,y:null};
    try{
      const salvo=JSON.parse(localStorage.getItem(CHAVE_PAINEL_FLUTUANTE)||"null");
      if(!salvo||typeof salvo!=="object")return padrao;
      return {
        modo:salvo.modo==="expandido"?"expandido":"minimizado",
        x:salvo.x!==null&&salvo.x!==""&&Number.isFinite(Number(salvo.x))?Number(salvo.x):null,
        y:salvo.y!==null&&salvo.y!==""&&Number.isFinite(Number(salvo.y))?Number(salvo.y):null
      };
    }catch(_erro){return padrao;}
  }

  function salvarPreferenciasPainel(alteracoes={}){
    const atual=preferenciasPainel();
    const novo={...atual,...alteracoes};
    novo.modo=novo.modo==="expandido"?"expandido":"minimizado";
    try{localStorage.setItem(CHAVE_PAINEL_FLUTUANTE,JSON.stringify(novo));}catch(_erro){}
    return novo;
  }

  function proximoParticipante(st){
    const lista=ordem(st),combat=st?.sala?.combat||{};
    if(!combat.started||!lista.length)return null;
    const indice=(Math.max(0,num(combat.turnIndex))+1)%lista.length;
    return st?.sala?.participants?.[lista[indice]]||null;
  }

  function efeitosDoPainel(st){
    const ativos=listaDeObjeto(st?.sala?.effects).filter(e=>e?.status==="active");
    if(ehMestre(st))return ativos;
    const participanteId=sessaoLocal()?.participantId;
    return participanteId?ativos.filter(e=>e.participantId===participanteId):[];
  }

  function conexaoPainel(st){
    if(navigator.onLine===false)return "offline";
    const presenca=st?.presencas?.[st?.user?.uid];
    if(presenca?.connected===true)return "online";
    if(st?.conectado)return "conectando";
    return "offline";
  }

  function instalarPainelFlutuante(){
    if(painelFlutuante&&document.body.contains(painelFlutuante))return painelFlutuante;
    painelFlutuante=document.getElementById("shinobiTurnoFlutuante");
    if(!painelFlutuante){
      painelFlutuante=document.createElement("aside");
      painelFlutuante.id="shinobiTurnoFlutuante";
      painelFlutuante.className="shinobiTurnoFlutuante";
      painelFlutuante.hidden=true;
      painelFlutuante.setAttribute("aria-label","Mostrador flutuante da mesa online");
      document.body.appendChild(painelFlutuante);
    }
    if(!painelFlutuante.dataset.eventosInstalados){
      painelFlutuante.dataset.eventosInstalados="1";
      painelFlutuante.addEventListener("click",tratarCliquePainel);
      painelFlutuante.addEventListener("pointerdown",iniciarArrastoPainel);
      painelFlutuante.addEventListener("pointermove",moverPainel);
      painelFlutuante.addEventListener("pointerup",finalizarArrastoPainel);
      painelFlutuante.addEventListener("pointercancel",finalizarArrastoPainel);
    }
    if(!window.__shinobiPainelFlutuanteResize){
      window.__shinobiPainelFlutuanteResize=true;
      window.addEventListener("resize",()=>ajustarPosicaoPainel(),{passive:true});
      window.addEventListener("orientationchange",()=>setTimeout(ajustarPosicaoPainel,120),{passive:true});
    }
    return painelFlutuante;
  }

  function limitesPainel(){
    if(!painelFlutuante)return{minX:8,minY:8,maxX:8,maxY:8};
    const rect=painelFlutuante.getBoundingClientRect();
    const margem=8;
    const reservaInferior=78;
    return {
      minX:margem,
      minY:margem,
      maxX:Math.max(margem,window.innerWidth-rect.width-margem),
      maxY:Math.max(margem,window.innerHeight-rect.height-reservaInferior)
    };
  }

  function posicionarPainel(x,y,{salvar=true}={}){
    if(!painelFlutuante||painelFlutuante.hidden)return;
    const limites=limitesPainel();
    const xFinal=Math.min(limites.maxX,Math.max(limites.minX,num(x,limites.maxX)));
    const yFinal=Math.min(limites.maxY,Math.max(limites.minY,num(y,limites.maxY)));
    painelFlutuante.style.left=`${Math.round(xFinal)}px`;
    painelFlutuante.style.top=`${Math.round(yFinal)}px`;
    painelFlutuante.style.right="auto";
    painelFlutuante.style.bottom="auto";
    if(salvar)salvarPreferenciasPainel({x:Math.round(xFinal),y:Math.round(yFinal)});
  }

  function ajustarPosicaoPainel(){
    if(!painelFlutuante||painelFlutuante.hidden)return;
    requestAnimationFrame(()=>{
      if(!painelFlutuante||painelFlutuante.hidden)return;
      const pref=preferenciasPainel(),rect=painelFlutuante.getBoundingClientRect();
      const x=pref.x==null?window.innerWidth-rect.width-12:pref.x;
      const y=pref.y==null?window.innerHeight-rect.height-92:pref.y;
      posicionarPainel(x,y);
    });
  }

  function iniciarArrastoPainel(evento){
    const alca=evento.target.closest("[data-widget-drag]");
    if(!alca||evento.target.closest("[data-widget-no-drag]")||evento.button>0)return;
    const rect=painelFlutuante.getBoundingClientRect();
    arrastoPainel={
      pointerId:evento.pointerId,
      inicioX:evento.clientX,inicioY:evento.clientY,
      origemX:rect.left,origemY:rect.top,movido:false
    };
    painelFlutuante.setPointerCapture?.(evento.pointerId);
    painelFlutuante.classList.add("arrastando");
  }

  function moverPainel(evento){
    if(!arrastoPainel||arrastoPainel.pointerId!==evento.pointerId)return;
    const dx=evento.clientX-arrastoPainel.inicioX,dy=evento.clientY-arrastoPainel.inicioY;
    if(!arrastoPainel.movido&&Math.hypot(dx,dy)<4)return;
    arrastoPainel.movido=true;
    evento.preventDefault();
    posicionarPainel(arrastoPainel.origemX+dx,arrastoPainel.origemY+dy,{salvar:false});
  }

  function finalizarArrastoPainel(evento){
    if(!arrastoPainel||arrastoPainel.pointerId!==evento.pointerId)return;
    const movido=arrastoPainel.movido;
    arrastoPainel=null;
    painelFlutuante.releasePointerCapture?.(evento.pointerId);
    painelFlutuante.classList.remove("arrastando");
    if(movido){
      const rect=painelFlutuante.getBoundingClientRect();
      posicionarPainel(rect.left,rect.top);
      ignorarCliquePainel=true;
      setTimeout(()=>{ignorarCliquePainel=false;},280);
    }
  }

  function renderPainelFlutuante(st=obterEstado()){
    instalarPainelFlutuante();
    const sessao=sessaoLocal();
    const reconectando=Boolean(sessao?.roomId&&st?.user&&!st?.sala&&st?.configurado);
    if(!st?.sala&&!reconectando){painelFlutuante.hidden=true;return;}

    painelFlutuante.hidden=false;
    const pref=preferenciasPainel(),expandido=pref.modo==="expandido";
    painelFlutuante.classList.toggle("expandido",expandido);
    painelFlutuante.classList.toggle("minimizado",!expandido);

    if(reconectando){
      painelFlutuante.className=`shinobiTurnoFlutuante ${expandido?"expandido":"minimizado"} reconectando`;
      painelFlutuante.innerHTML=expandido?`
        <header class="shinobiTurnoWidgetCabecalho" data-widget-drag>
          <span class="shinobiTurnoWidgetAlca" aria-hidden="true">⠿</span>
          <div><small>MESA ONLINE</small><strong>Reconectando à sala...</strong></div>
          <button type="button" data-widget-action="minimizar" data-widget-no-drag aria-label="Minimizar mostrador">−</button>
        </header>
        <div class="shinobiTurnoWidgetCorpo"><p class="shinobiTurnoWidgetStatus">Recuperando a última sala usada neste aparelho.</p></div>
        <footer class="shinobiTurnoWidgetRodape"><button type="button" class="onlineBtn secundario" data-widget-action="abrir-sala">Entrar na sala</button></footer>`:`
        <button type="button" class="shinobiTurnoWidgetMini" data-widget-action="alternar" data-widget-drag>
          <span class="shinobiTurnoWidgetDot conectando" aria-hidden="true"></span>
          <span><small>MESA ONLINE</small><strong>Reconectando...</strong></span>
          <em>⌃</em>
        </button>`;
      ajustarPosicaoPainel();
      return;
    }

    const master=ehMestre(st),combat=st.sala?.combat||{},lista=ordem(st);
    const atual=participanteAtual(st),proximo=proximoParticipante(st);
    const rodada=Math.max(1,num(combat.round,1));
    const meuId=sessao?.participantId,meuTurno=Boolean(combat.started&&meuId&&atual?.id===meuId);
    const conexao=conexaoPainel(st);
    const statusTurno=combat.started?(meuTurno?"É o seu turno":`Turno de ${atual?.displayName||"—"}`):"Combate ainda não iniciado";
    const efeitos=efeitosDoPainel(st).slice(0,3);
    const efeitosHtml=efeitos.length?efeitos.map(efeito=>{
      const participante=st.sala?.participants?.[efeito.participantId];
      const complemento=master&&participante?` • ${participante.displayName}`:"";
      return `<li><span>${esc(efeito.name||"Efeito")}${esc(complemento)}</span><b>${rodadasRestantes(efeito,combat)}r</b></li>`;
    }).join(""):`<li class="vazio"><span>Nenhum efeito ativo</span></li>`;

    painelFlutuante.className=`shinobiTurnoFlutuante ${expandido?"expandido":"minimizado"} ${meuTurno?"meuTurno":""}`.trim();
    painelFlutuante.innerHTML=expandido?`
      <header class="shinobiTurnoWidgetCabecalho" data-widget-drag>
        <span class="shinobiTurnoWidgetAlca" aria-hidden="true">⠿</span>
        <div><small>SALA ${esc(st.sala.code||"")}</small><strong>${esc(st.sala.title||"Mesa online")}</strong></div>
        <button type="button" data-widget-action="minimizar" data-widget-no-drag aria-label="Minimizar mostrador">−</button>
      </header>
      <div class="shinobiTurnoWidgetCorpo">
        <div class="shinobiTurnoWidgetResumo">
          <div><small>RODADA</small><strong>${rodada}</strong></div>
          <div><small>TURNO ATUAL</small><strong>${esc(atual?.displayName||"Aguardando")}</strong><em>${lista.length?`${num(combat.turnIndex)+1} de ${lista.length}`:"Sem iniciativa"}</em></div>
        </div>
        <p class="shinobiTurnoWidgetStatus ${meuTurno?"destaque":""}"><span class="shinobiTurnoWidgetDot ${conexao}" aria-hidden="true"></span>${esc(statusTurno)}</p>
        <div class="shinobiTurnoWidgetProximo"><small>PRÓXIMO</small><strong>${esc(proximo?.displayName||"—")}</strong></div>
        <div class="shinobiTurnoWidgetEfeitos"><small>${master?"EFEITOS ATIVOS":"SEUS EFEITOS"}</small><ul>${efeitosHtml}</ul></div>
      </div>
      <footer class="shinobiTurnoWidgetRodape">
        ${master?(combat.started?`<div class="shinobiTurnoWidgetControles"><button type="button" class="onlineBtn secundario" data-widget-action="turno-anterior">‹ Anterior</button><button type="button" class="onlineBtn primario" data-widget-action="proximo-turno">Próximo ›</button></div>`:`<button type="button" class="onlineBtn primario" data-widget-action="iniciar-combate">Iniciar combate</button>`):""}
        <button type="button" class="onlineBtn secundario entrarSala" data-widget-action="abrir-sala">Entrar na sala</button>
      </footer>`:`
      <button type="button" class="shinobiTurnoWidgetMini" data-widget-action="alternar" data-widget-drag aria-label="Expandir mostrador da mesa online">
        <span class="shinobiTurnoWidgetDot ${conexao}" aria-hidden="true"></span>
        <span><small>RODADA ${rodada}</small><strong>${esc(statusTurno)}</strong></span>
        <em>⌃</em>
      </button>`;
    ajustarPosicaoPainel();
  }

  async function tratarCliquePainel(evento){
    if(ignorarCliquePainel){evento.preventDefault();evento.stopPropagation();return;}
    const el=evento.target.closest("[data-widget-action]");
    if(!el)return;
    const acao=el.dataset.widgetAction;
    if(acao==="alternar"){
      const modo=preferenciasPainel().modo==="expandido"?"minimizado":"expandido";
      salvarPreferenciasPainel({modo});
      renderPainelFlutuante();
      return;
    }
    if(acao==="minimizar"){salvarPreferenciasPainel({modo:"minimizado"});renderPainelFlutuante();return;}
    if(acao==="abrir-sala")return abrir();
    if(acao==="turno-anterior")return executar(()=>window.ShinobiOnline.voltarTurno());
    if(acao==="proximo-turno")return executar(()=>window.ShinobiOnline.avancarTurno());
    if(acao==="iniciar-combate")return executar(()=>window.ShinobiOnline.iniciarCombate());
  }

  function instalarBotao(){
    const config=document.getElementById("configMenu");
    if(config&&!document.getElementById("shinobiOnlineMenuBtn")){
      const botao=document.createElement("button");
      botao.id="shinobiOnlineMenuBtn";
      botao.type="button";
      botao.className="btn backupBtn shinobiOnlineMenuBtn";
      botao.innerHTML='<span class="onlineDot" aria-hidden="true"></span><span>Mesa online e nuvem</span>';
      botao.addEventListener("click",abrir);
      const painelUpdate=config.querySelector("#shinobiAtualizacaoPainel");
      config.insertBefore(botao,painelUpdate||null);
    }

    const topo=document.querySelector(".topo");
    if(topo&&!document.getElementById("shinobiOnlineTopoBtn")){
      const botao=document.createElement("button");
      botao.id="shinobiOnlineTopoBtn";
      botao.type="button";
      botao.className="shinobiOnlineTopoBtn";
      botao.innerHTML='<span class="onlineDot"></span><span class="onlineTopoTexto">Online</span>';
      botao.addEventListener("click",abrir);
      const configGlobal=topo.querySelector(".configGlobal");
      topo.insertBefore(botao,configGlobal||null);
    }
    document.getElementById("shinobiTurnoMini")?.remove();
    instalarPainelFlutuante();
    atualizarIndicadores();
  }

  function criarRoot(){
    if(root) return root;
    root=document.createElement("div");
    root.id="shinobiOnlineOverlay";
    root.className="shinobiOnlineOverlay";
    root.hidden=true;
    root.innerHTML=`
      <div class="shinobiOnlineShell" role="dialog" aria-modal="true" aria-label="Mesa online">
        <header class="shinobiOnlineHeader">
          <div><span class="shinobiOnlineEyebrow">FICHA NINJA</span><h2>Mesa online</h2></div>
          <button type="button" class="shinobiOnlineFechar" data-action="close" aria-label="Fechar">×</button>
        </header>
        <div id="shinobiOnlineConteudo" class="shinobiOnlineConteudo"></div>
      </div>
      <div id="shinobiScanner" class="shinobiScanner" hidden>
        <div class="shinobiScannerBox">
          <h3>Escanear QR Code</h3>
          <video id="shinobiScannerVideo" playsinline muted></video>
          <div class="scannerMoldura"></div>
          <p id="shinobiScannerStatus">Aponte a câmera para o QR Code da sala.</p>
          <button type="button" class="onlineBtn secundario" data-action="stop-scan">Cancelar</button>
        </div>
      </div>`;
    document.body.appendChild(root);
    root.addEventListener("click",tratarClique);
    root.addEventListener("submit",tratarSubmit);
    root.addEventListener("change",tratarChange);
    return root;
  }

  function abrir(){
    criarRoot();aberto=true;root.hidden=false;document.body.classList.add("onlineAberto");
    document.getElementById("configMenu")?.classList.remove("aberto");
    renderizar();
  }
  function fechar(){aberto=false;pararScanner();if(root)root.hidden=true;document.body.classList.remove("onlineAberto");}

  function atualizarIndicadores(){
    const st=obterEstado();
    const ativo=Boolean(st.configurado&&st.conectado);
    const emSala=Boolean(st.salaId&&st.sala);
    document.querySelectorAll("#shinobiOnlineMenuBtn,#shinobiOnlineTopoBtn").forEach(el=>{
      el.classList.toggle("onlineAtivo",ativo);
      el.classList.toggle("onlineEmSala",emSala);
    });
    const textoTopo=document.querySelector("#shinobiOnlineTopoBtn .onlineTopoTexto");
    if(textoTopo) textoTopo.textContent=emSala?`Sala ${st.sala?.code||""}`:ativo?"Nuvem":"Online";
    renderPainelFlutuante(st);
  }

  function agendarRender(){
    atualizarIndicadores();
    if(!aberto)return;
    clearTimeout(renderTimer);
    const foco=document.activeElement;
    const editando=foco&&root?.contains(foco)&&/INPUT|TEXTAREA|SELECT/.test(foco.tagName);
    renderTimer=setTimeout(renderizar,editando?650:40);
  }

  function cabecalhoConta(st){
    if(!st.user)return"";
    return `<div class="onlineConta">
      <div class="onlineAvatar">${st.user.photoURL?`<img src="${esc(st.user.photoURL)}" alt="">`:st.user.anonymous?"🥷":"👤"}</div>
      <div><strong>${esc(st.user.displayName||"Jogador")}</strong><small>${st.user.anonymous?"Acesso rápido de jogador":"Conta Google"}</small></div>
      <button type="button" class="onlineBtn texto" data-action="logout">Sair</button>
    </div>`;
  }

  function renderConfiguracao(){
    return `<section class="onlineCard onlineSetup">
      <span class="onlineCardSelo">CONFIGURAÇÃO NECESSÁRIA</span>
      <h3>Conecte o aplicativo ao Firebase</h3>
      <p>A parte online já está instalada no projeto, mas precisa receber as informações do seu Firebase antes de criar salas e backups.</p>
      <ol>
        <li>Crie o projeto e o aplicativo Web no Firebase.</li>
        <li>Ative login Google e Anônimo.</li>
        <li>Crie o Realtime Database e publique as regras incluídas no ZIP.</li>
        <li>Cole o objeto de configuração em <code>js/18-online-config.js</code>.</li>
      </ol>
      <p class="onlineAjuda">O guia completo está em <code>firebase/SETUP-FIREBASE.md</code>.</p>
    </section>`;
  }

  function renderLogin(){
    return `<div class="onlineGridDois">
      <section class="onlineCard destaqueMestre">
        <span class="onlineCardSelo">CONTA GOOGLE</span>
        <h3>Mestre ou jogador</h3>
        <p>Crie salas como mestre ou entre como jogador mantendo as fichas sincronizadas entre seus aparelhos.</p>
        <button type="button" class="onlineBtn primario" data-action="login-google">Entrar com Google</button>
      </section>
      <section class="onlineCard">
        <span class="onlineCardSelo">JOGADOR</span>
        <h3>Entrada rápida</h3>
        <p>Entre sem cadastro, escolha uma ficha deste aparelho e participe da sala.</p>
        <button type="button" class="onlineBtn secundario" data-action="login-anonymous">Continuar como jogador</button>
      </section>
    </div>`;
  }

  function opcoesFichasLocais(selecionada=""){
    return (window.ShinobiOnline?.listarFichasLocais?.()||[]).map(f=>`<option value="${esc(f.name)}" ${f.name===selecionada?"selected":""}>${esc(f.characterName)} — ${esc(f.name)}</option>`).join("");
  }

  function renderEntradaSala(st){
    const codigoUrl=window.ShinobiOnline?.codigoDaUrl?.()||"";
    return `<section class="onlineCard">
      <span class="onlineCardSelo">ENTRAR EM UMA SALA</span>
      <h3>Código ou QR Code</h3>
      <form data-form="join-room" class="onlineForm">
        <label>Código da sala<input name="code" maxlength="6" autocomplete="off" value="${esc(codigoUrl)}" placeholder="ABC234" required></label>
        <label>Ficha usada na mesa<select name="localSheetName">${opcoesFichasLocais()}</select></label>
        <div class="onlineAcoesLinha">
          <button class="onlineBtn primario" type="submit">Entrar na sala</button>
          <button class="onlineBtn secundario" type="button" data-action="scan-qr">Escanear QR</button>
        </div>
      </form>
    </section>`;
  }

  function renderMestreHome(st){
    const campanhas=st.campanhas||[];
    return `<section class="onlineCard destaqueMestre">
      <span class="onlineCardSelo">PAINEL DO MESTRE</span>
      <h3>Campanhas e salas</h3>
      <form data-form="create-campaign" class="onlineForm onlineFormLinha">
        <label>Nova campanha<input name="name" maxlength="80" placeholder="Crônicas de Konoha" required></label>
        <button class="onlineBtn secundario" type="submit">Criar campanha</button>
      </form>
      ${campanhas.length?`<form data-form="create-room" class="onlineForm">
        <label>Campanha<select name="campaignId">${campanhas.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("")}</select></label>
        <label>Nome da sessão<input name="title" maxlength="80" placeholder="Batalha da ponte"></label>
        <button class="onlineBtn primario" type="submit">Criar sala e QR Code</button>
      </form>`:`<p class="onlineVazio">Crie a primeira campanha para abrir uma sala.</p>`}
    </section>`;
  }

  function renderNuvem(st){
    const locais=window.ShinobiOnline?.listarFichasLocais?.()||[];
    const nuvem=st.fichasNuvem||[];
    return `<details class="onlineCard onlineDetails">
      <summary><span><b>Backup e sincronização</b><small>${nuvem.length} ficha(s) na nuvem</small></span></summary>
      <div class="onlineDetailsConteudo">
        <div class="onlineAcoesLinha">
          <button type="button" class="onlineBtn secundario" data-action="sync-current">Sincronizar ficha atual</button>
          <button type="button" class="onlineBtn secundario" data-action="sync-all">Sincronizar todas</button>
        </div>
        <div class="onlineListaNuvem">
          ${nuvem.length?nuvem.map(f=>`<article><div><strong>${esc(f.characterName||f.name)}</strong><small>${esc(f.name)} • revisão ${num(f.revision,1)}</small></div><button type="button" class="onlineBtn texto" data-action="restore-cloud" data-sheet-id="${esc(f.id)}">Restaurar</button></article>`).join(""):`<p class="onlineVazio">Nenhuma ficha enviada para a nuvem ainda.</p>`}
        </div>
        <small class="onlineRodape">As fichas continuam salvas no aparelho. A nuvem funciona como cópia e sincronização entre dispositivos.</small>
      </div>
    </details>`;
  }

  function renderConflito(){
    if(!conflitoAtual)return"";
    const nome=conflitoAtual.local?.characterName||conflitoAtual.local?.name||"Ficha";
    return `<section class="onlineCard onlineConflito">
      <span class="onlineCardSelo">CONFLITO DE SINCRONIZAÇÃO</span>
      <h3>${esc(nome)}</h3>
      <p>Existe uma versão mais recente dessa ficha na nuvem. Escolha qual versão deve ser mantida.</p>
      <div class="onlineAcoesColuna">
        <button class="onlineBtn primario" data-action="resolve-conflict" data-choice="nuvem" data-sheet-id="${esc(conflitoAtual.sheetId)}">Usar versão da nuvem</button>
        <button class="onlineBtn secundario" data-action="resolve-conflict" data-choice="local" data-sheet-id="${esc(conflitoAtual.sheetId)}">Manter este aparelho</button>
        <button class="onlineBtn texto" data-action="resolve-conflict" data-choice="copia" data-sheet-id="${esc(conflitoAtual.sheetId)}">Criar uma cópia das duas</button>
      </div>
    </section>`;
  }

  function qrHtml(st){
    const link=window.ShinobiOnline?.linkDaSala?.(st.sala.code)||"";
    return `<div class="onlineQrBloco">
      <div id="shinobiQrCode" class="onlineQrCode" data-link="${esc(link)}"><span>Gerando QR...</span></div>
      <div class="onlineCodigoSala"><small>CÓDIGO DA SALA</small><strong>${esc(st.sala.code)}</strong></div>
      <div class="onlineAcoesLinha"><button class="onlineBtn secundario" data-action="copy-code">Copiar código</button><button class="onlineBtn secundario" data-action="copy-link">Copiar link</button></div>
    </div>`;
  }

  function tipoParticipante(p){
    if(p.type==="player")return"Jogador";
    if(p.type==="npc-imported")return`Ficha importada${p.sourceSheetName?` • ${p.sourceSheetName}`:""}`;
    return"NPC rápido";
  }

  function renderParticipantes(st,master){
    const ps=participantes(st),ord=ordem(st),atual=participanteAtual(st);
    return `<section class="onlineCard">
      <div class="onlineCardTitulo"><div><span class="onlineCardSelo">PARTICIPANTES</span><h3>${ps.length} na sala</h3></div></div>
      <div class="onlineParticipantes">
        ${ps.length?ps.map(p=>{
          const naOrdem=ord.indexOf(p.id),isAtual=atual?.id===p.id;
          return `<article class="onlineParticipante ${isAtual?"turnoAtual":""}">
            <div class="onlineParticipanteNome">
              ${p.type==="player"?`<span class="presencaDot ${conectado(st,p)?"conectado":""}" title="${conectado(st,p)?"Conectado":"Desconectado"}"></span>`:`<span class="npcDot">◆</span>`}
              <div><strong>${esc(p.displayName||"Participante")}</strong><small>${esc(tipoParticipante(p))}${naOrdem>=0?` • ordem ${naOrdem+1}`:""}</small></div>
            </div>
            <div class="onlineParticipanteStats">
              <span>PV <b>${num(p.battle?.pv)}/${num(p.battle?.pvMax)}</b></span>
              <span>CH <b>${num(p.battle?.chakra)}/${num(p.battle?.chakraMax)}</b></span>
              <span>CA <b>${num(p.battle?.ca,10)}</b></span>
            </div>
            ${master?`<div class="onlineParticipanteAcoes">
              <label>Iniciativa<input data-action-change="initiative" data-participant-id="${esc(p.id)}" type="number" value="${p.initiative==null?"":esc(p.initiative)}" placeholder="—"></label>
              ${p.type!=="player"?`<button class="onlineBtn texto" data-action="edit-npc" data-participant-id="${esc(p.id)}">Editar</button>`:""}
              <button class="onlineBtn perigoTexto" data-action="remove-participant" data-participant-id="${esc(p.id)}">Remover</button>
            </div>`:""}
          </article>`;
        }).join(""):`<p class="onlineVazio">Nenhum participante entrou ainda.</p>`}
      </div>
    </section>`;
  }

  function renderAdicionarNpc(st){
    return `<details class="onlineCard onlineDetails">
      <summary><span><b>Adicionar NPC ou inimigo</b><small>Importe uma ficha ou crie rapidamente</small></span></summary>
      <div class="onlineDetailsConteudo onlineGridDois">
        <form data-form="import-npc" class="onlineForm onlineSubCard">
          <h4>Importar ficha existente</h4>
          <p>Leva para a sala as informações principais de batalha sem alterar a ficha original.</p>
          <label>Ficha<select name="localSheetName">${opcoesFichasLocais()}</select></label>
          <label>Nome nesta batalha<input name="displayName" placeholder="Opcional"></label>
          <button class="onlineBtn primario" type="submit">Importar para a sala</button>
        </form>
        <form data-form="quick-npc" class="onlineForm onlineSubCard">
          <h4>Criar durante a mesa</h4>
          <label>Nome<input name="displayName" required placeholder="Mercenário"></label>
          <div class="onlineFormGrid"><label>PV máximo<input name="pvMax" type="number" min="0" value="20"></label><label>Chakra<input name="chakraMax" type="number" min="0" value="0"></label><label>CA<input name="ca" type="number" value="10"></label><label>Iniciativa<input name="initiativeBonus" type="number" value="0"></label></div>
          <label>Observações<textarea name="notes" maxlength="600" placeholder="Ataques, habilidades ou lembretes rápidos"></textarea></label>
          <button class="onlineBtn secundario" type="submit">Adicionar NPC rápido</button>
        </form>
      </div>
    </details>`;
  }

  function renderCombate(st,master){
    const combat=st.sala?.combat||{},atual=participanteAtual(st),ord=ordem(st);
    const rodada=Math.max(1,num(combat.round,1)),segundosInicio=(rodada-1)*6,segundosFim=rodada*6;
    return `<section class="onlineCard onlineCombate ${combat.started?"iniciado":""}">
      <span class="onlineCardSelo">INICIATIVA E RODADAS</span>
      <div class="onlineTurnoHero">
        <div><small>RODADA</small><strong>${rodada}</strong><em>${segundosInicio}–${segundosFim} segundos</em></div>
        <div><small>TURNO ATUAL</small><strong>${esc(atual?.displayName||"Aguardando")}</strong><em>${ord.length?`${num(combat.turnIndex)+1} de ${ord.length}`:"Defina a iniciativa"}</em></div>
      </div>
      ${master?`<div class="onlineAcoesLinha onlineControlesTurno">
        <button class="onlineBtn secundario" data-action="sort-initiative">Ordenar iniciativa</button>
        ${combat.started?`<button class="onlineBtn secundario" data-action="prev-turn">Turno anterior</button><button class="onlineBtn primario" data-action="next-turn">Próximo turno</button>`:`<button class="onlineBtn primario" data-action="start-combat">Iniciar combate</button>`}
      </div>`:`<p class="onlineAvisoTurno">${atual?.id===sessaoLocal()?.participantId?"É o seu turno.":atual?`Turno de ${esc(atual.displayName)}.`:"O mestre ainda não iniciou o combate."}</p>`}
    </section>`;
  }

  function efeitosAtivos(st){return listaDeObjeto(st.sala?.effects).filter(e=>e.status==="active");}
  function renderEfeitos(st,master){
    const efeitos=efeitosAtivos(st);
    return `<section class="onlineCard">
      <span class="onlineCardSelo">DURAÇÃO AUTOMÁTICA</span><h3>Efeitos em rodadas</h3>
      <p class="onlineExplicacao">Uma rodada completa representa 6 segundos. O contador só diminui depois que todos tiverem jogado.</p>
      <div class="onlineEfeitosLista">
        ${efeitos.length?efeitos.map(e=>{
          const p=st.sala?.participants?.[e.participantId],rest=rodadasRestantes(e,st.sala?.combat);
          return `<article><div><strong>${esc(e.name)}</strong><small>${esc(p?.displayName||"Participante")} • ${rest} rodada(s) restante(s)</small></div>${master||e.ownerUid===st.user?.uid?`<button class="onlineBtn texto" data-action="end-effect" data-effect-id="${esc(e.id)}">Encerrar</button>`:""}</article>`;
        }).join(""):`<p class="onlineVazio">Nenhum efeito com duração ativa.</p>`}
      </div>
      ${master?`<form data-form="add-effect" class="onlineForm onlineFormLinha onlineFormEfeito">
        <label>Participante<select name="participantId">${participantes(st).map(p=>`<option value="${esc(p.id)}">${esc(p.displayName)}</option>`).join("")}</select></label>
        <label>Efeito<input name="name" placeholder="Atordoado" required></label>
        <label>Rodadas<input name="duration" type="number" min="1" value="1" required></label>
        <button class="onlineBtn secundario" type="submit">Adicionar</button>
      </form>`:""}
    </section>`;
  }

  function renderXp(st){
    const jogadores=participantes(st).filter(p=>p.type==="player");
    return `<details class="onlineCard onlineDetails">
      <summary><span><b>Distribuir XP</b><small>Somente o mestre altera</small></span></summary>
      <div class="onlineDetailsConteudo">
        <form data-form="grant-xp" class="onlineForm">
          <div class="onlineXpJogadores">${jogadores.length?jogadores.map(p=>`<label><input type="checkbox" name="participantIds" value="${esc(p.id)}" checked><span class="presencaDot ${conectado(st,p)?"conectado":""}"></span>${esc(p.displayName)}</label>`).join(""):`<p class="onlineVazio">Aguarde jogadores entrarem na sala.</p>`}</div>
          <div class="onlineFormGrid"><label>Quantidade<input name="amount" type="number" value="500" required></label><label>Motivo<input name="reason" maxlength="160" placeholder="Fim da missão"></label></div>
          <button class="onlineBtn primario" type="submit" ${jogadores.length?"":"disabled"}>Conceder XP</button>
        </form>
      </div>
    </details>`;
  }

  function renderSala(st){
    const master=ehMestre(st);
    return `${cabecalhoConta(st)}
      <section class="onlineCard onlineSalaTopo">
        <div><span class="onlineCardSelo">${master?"SALA DO MESTRE":"SALA ATUAL"}</span><h3>${esc(st.sala.title)}</h3><p>${esc(st.sala.status==="open"?"Sala aberta":"Sala encerrada")}</p></div>
        ${master?qrHtml(st):`<div class="onlineCodigoSala compacto"><small>CÓDIGO</small><strong>${esc(st.sala.code)}</strong></div>`}
      </section>
      ${renderCombate(st,master)}
      ${renderParticipantes(st,master)}
      ${master?renderAdicionarNpc(st):""}
      ${renderEfeitos(st,master)}
      ${master?renderXp(st):""}
      ${renderNuvem(st)}
      <section class="onlineCard onlineZonaPerigo">
        ${master?`<button class="onlineBtn perigo" data-action="close-room">Encerrar sala</button>`:`<button class="onlineBtn perigo" data-action="leave-room">Sair da sala</button>`}
      </section>`;
  }

  function renderHome(st){
    return `${cabecalhoConta(st)}${renderConflito()}<div class="onlineGridDois">${!st.user.anonymous?renderMestreHome(st):""}${renderEntradaSala(st)}</div>${renderNuvem(st)}`;
  }

  function renderizar(){
    criarRoot();
    const conteudo=document.getElementById("shinobiOnlineConteudo"),st=obterEstado();
    if(!conteudo)return;
    if(st.carregando){conteudo.innerHTML='<div class="onlineLoading"><span></span><p>Conectando ao sistema online...</p></div>';return;}
    if(!st.configurado){conteudo.innerHTML=renderConfiguracao();return;}
    if(st.ultimoErro&&!st.iniciado){conteudo.innerHTML=`<section class="onlineCard"><h3>Falha ao iniciar</h3><p>${esc(st.ultimoErro)}</p><button type="button" class="onlineBtn primario" data-action="retry-online">Tentar novamente</button></section>`;return;}
    if(!st.user){conteudo.innerHTML=renderLogin();return;}
    conteudo.innerHTML=st.sala?renderSala(st):renderHome(st);
    requestAnimationFrame(renderQr);
  }

  function renderQr(){
    const host=document.getElementById("shinobiQrCode");
    if(!host)return;
    const link=host.dataset.link;
    try{
      if(typeof window.ShinobiQRCodeSvg!=="function")throw new Error("Gerador QR indisponível");
      host.innerHTML=window.ShinobiQRCodeSvg(link,{cellSize:5,margin:4,level:"M"});
    }catch(_erro){
      host.innerHTML=`<div class="onlineQrFallback">${esc(obterEstado().sala?.code||"")}</div><small>Use o código manual</small>`;
    }
  }

  async function executar(acao,{mensagem="Processando..."}={}){
    const conteudo=document.getElementById("shinobiOnlineConteudo");
    conteudo?.classList.add("ocupado");
    try{return await acao();}
    catch(erro){await avisar("Não foi possível concluir",window.ShinobiOnline?.erroAmigavel?.(erro)||erro.message||String(erro));throw erro;}
    finally{conteudo?.classList.remove("ocupado");agendarRender();}
  }

  async function avisar(titulo,mensagem){
    if(typeof window.avisoShinobi==="function")return window.avisoShinobi(titulo,mensagem);
    alert(`${titulo}\n\n${mensagem}`);
  }
  async function confirmar(titulo,mensagem){
    if(typeof window.modalShinobi==="function")return window.modalShinobi(titulo,mensagem);
    return confirm(`${titulo}\n\n${mensagem}`);
  }

  async function tratarClique(evento){
    const el=evento.target.closest("[data-action]");if(!el)return;
    const acao=el.dataset.action;
    if(acao==="close")return fechar();
    if(acao==="stop-scan")return pararScanner();
    if(acao==="retry-online")return executar(()=>window.ShinobiOnline.iniciar());
    if(acao==="login-google")return executar(()=>window.ShinobiOnline.entrarGoogle());
    if(acao==="login-anonymous")return executar(()=>window.ShinobiOnline.entrarAnonimo());
    if(acao==="logout")return executar(()=>window.ShinobiOnline.sair());
    if(acao==="scan-qr")return iniciarScanner();
    if(acao==="copy-code")return copiar(obterEstado().sala?.code,"Código copiado.");
    if(acao==="copy-link")return copiar(window.ShinobiOnline.linkDaSala(obterEstado().sala?.code),"Link copiado.");
    if(acao==="sync-current")return executar(async()=>{await window.ShinobiOnline.sincronizarFicha(window.ShinobiOnline.fichaAtualLocal()?.name,{backup:true,motivo:"manual"});await avisar("Ficha sincronizada","A ficha atual foi enviada para a nuvem.");});
    if(acao==="sync-all")return executar(async()=>{await window.ShinobiOnline.sincronizarTodasFichas();await avisar("Sincronização concluída","Todas as fichas deste aparelho foram verificadas.");});
    if(acao==="restore-cloud")return executar(async()=>{if(await confirmar("Restaurar ficha","A ficha da nuvem será adicionada ou atualizada neste aparelho.")){await window.ShinobiOnline.restaurarFichaDaNuvem(el.dataset.sheetId,{asCopy:true});}});
    if(acao==="resolve-conflict")return executar(async()=>{await window.ShinobiOnline.resolverConflito(el.dataset.sheetId,el.dataset.choice);conflitoAtual=null;});
    if(acao==="sort-initiative")return executar(()=>window.ShinobiOnline.ordenarIniciativa());
    if(acao==="start-combat")return executar(()=>window.ShinobiOnline.iniciarCombate());
    if(acao==="next-turn")return executar(()=>window.ShinobiOnline.avancarTurno());
    if(acao==="prev-turn")return executar(()=>window.ShinobiOnline.voltarTurno());
    if(acao==="end-effect")return executar(()=>window.ShinobiOnline.encerrarEfeito(el.dataset.effectId));
    if(acao==="remove-participant")return executar(async()=>{const p=obterEstado().sala?.participants?.[el.dataset.participantId];if(await confirmar("Remover participante",`Remover ${p?.displayName||"este participante"} da sala?`))await window.ShinobiOnline.removerParticipante(el.dataset.participantId);});
    if(acao==="edit-npc")return editarNpc(el.dataset.participantId);
    if(acao==="leave-room")return executar(async()=>{if(await confirmar("Sair da sala","A ficha continuará salva neste aparelho e na nuvem."))await window.ShinobiOnline.sairDaSala();});
    if(acao==="close-room")return executar(async()=>{if(await confirmar("Encerrar sala","Jogadores não poderão entrar novamente com este código.")){await window.ShinobiOnline.encerrarSala();await window.ShinobiOnline.sairDaSala({silencioso:true});}});
  }

  async function tratarSubmit(evento){
    const form=evento.target.closest("form[data-form]");if(!form)return;evento.preventDefault();
    const dados=new FormData(form),tipo=form.dataset.form;
    if(tipo==="create-campaign")return executar(async()=>{await window.ShinobiOnline.criarCampanha(dados.get("name"));form.reset();});
    if(tipo==="create-room")return executar(()=>window.ShinobiOnline.criarSala({campaignId:dados.get("campaignId"),title:dados.get("title")}));
    if(tipo==="join-room")return executar(()=>window.ShinobiOnline.entrarSala({code:dados.get("code"),localSheetName:dados.get("localSheetName")}));
    if(tipo==="import-npc")return executar(async()=>{await window.ShinobiOnline.importarFichaComoNpc(dados.get("localSheetName"),{displayName:dados.get("displayName")});form.reset();});
    if(tipo==="quick-npc")return executar(async()=>{await window.ShinobiOnline.criarNpcRapido(Object.fromEntries(dados.entries()));form.reset();});
    if(tipo==="add-effect")return executar(async()=>{await window.ShinobiOnline.adicionarEfeito({participantId:dados.get("participantId"),name:dados.get("name"),duration:num(dados.get("duration"),1)});form.reset();});
    if(tipo==="grant-xp")return executar(async()=>{
      const ids=dados.getAll("participantIds");
      await window.ShinobiOnline.concederXp({participantIds:ids,amount:dados.get("amount"),reason:dados.get("reason")});
      await avisar("XP distribuído",`A alteração foi enviada para ${ids.length} jogador(es).`);
    });
  }

  function tratarChange(evento){
    const el=evento.target.closest("[data-action-change]");if(!el)return;
    if(el.dataset.actionChange==="initiative")executar(()=>window.ShinobiOnline.definirIniciativa(el.dataset.participantId,el.value));
  }

  async function editarNpc(id){
    const st=obterEstado(),p=st.sala?.participants?.[id];if(!p)return;
    const nome=prompt("Nome do NPC:",p.displayName||"");if(nome===null)return;
    const pv=prompt("PV atual:",String(num(p.battle?.pv)));if(pv===null)return;
    const pvMax=prompt("PV máximo:",String(num(p.battle?.pvMax)));if(pvMax===null)return;
    const chakra=prompt("Chakra atual:",String(num(p.battle?.chakra)));if(chakra===null)return;
    const chakraMax=prompt("Chakra máximo:",String(num(p.battle?.chakraMax)));if(chakraMax===null)return;
    const ca=prompt("Classe de Armadura:",String(num(p.battle?.ca,10)));if(ca===null)return;
    const iniciativa=prompt("Bônus de iniciativa:",String(num(p.initiativeBonus)));if(iniciativa===null)return;
    const notas=prompt("Observações rápidas:",String(p.battle?.notes||""));if(notas===null)return;
    const battle={
      ...p.battle,displayName:String(nome).trim()||p.displayName,
      pv:Math.max(0,num(pv)),pvMax:Math.max(0,num(pvMax)),
      chakra:Math.max(0,num(chakra)),chakraMax:Math.max(0,num(chakraMax)),
      ca:num(ca,10),initiativeBonus:num(iniciativa),notes:String(notas).slice(0,600)
    };
    return executar(()=>window.ShinobiOnline.atualizarParticipante(id,{
      displayName:battle.displayName,initiativeBonus:battle.initiativeBonus,battle
    }));
  }

  async function copiar(valor,mensagem){
    try{await navigator.clipboard.writeText(String(valor||""));await avisar("Copiado",mensagem);}catch(_erro){prompt("Copie o texto:",String(valor||""));}
  }

  async function iniciarScanner(){
    if(!("BarcodeDetector" in window)){await avisar("Leitor não disponível","Este navegador não oferece leitura direta de QR Code. Digite o código de seis caracteres.");return;}
    try{
      const suportados=await BarcodeDetector.getSupportedFormats();
      if(!suportados.includes("qr_code"))throw new Error("QR não suportado");
      const scanner=document.getElementById("shinobiScanner"),video=document.getElementById("shinobiScannerVideo");
      scanner.hidden=false;
      scannerStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
      video.srcObject=scannerStream;await video.play();
      const detector=new BarcodeDetector({formats:["qr_code"]});
      const ler=async()=>{
        if(!scannerStream)return;
        try{
          const codigos=await detector.detect(video);
          if(codigos.length){
            const bruto=codigos[0].rawValue||"";let codigo="";
            try{codigo=new URL(bruto).searchParams.get("sala")||bruto;}catch(_erro){codigo=bruto;}
            codigo=String(codigo).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(-6);
            const input=root.querySelector('form[data-form="join-room"] input[name="code"]');if(input)input.value=codigo;
            pararScanner();await avisar("QR Code lido",`Código ${codigo} preenchido.`);return;
          }
        }catch(_erro){}
        scannerFrame=requestAnimationFrame(ler);
      };
      scannerFrame=requestAnimationFrame(ler);
    }catch(erro){pararScanner();await avisar("Câmera indisponível","Não foi possível abrir a câmera. Digite o código manualmente.");}
  }

  function pararScanner(){
    if(scannerFrame)cancelAnimationFrame(scannerFrame);scannerFrame=null;
    scannerStream?.getTracks?.().forEach(t=>t.stop());scannerStream=null;
    const scanner=document.getElementById("shinobiScanner");if(scanner)scanner.hidden=true;
    const video=document.getElementById("shinobiScannerVideo");if(video)video.srcObject=null;
  }

  function instalarEventos(){
    if(!window.ShinobiOnline||window.__shinobiOnlineUIEventos)return;
    window.__shinobiOnlineUIEventos=true;
    ["status","pronto","auth","campanhas","fichas-nuvem","sala","presenca","configuracao-pendente","sala-encerrada"].forEach(tipo=>window.ShinobiOnline.on(tipo,agendarRender));
    window.ShinobiOnline.on("erro",e=>avisar("Erro online",e.detail.mensagem));
    window.ShinobiOnline.on("erro-sync",e=>{document.getElementById("shinobiOnlineTopoBtn")?.classList.add("onlineErro");console.warn(e.detail.mensagem);});
    window.ShinobiOnline.on("conflito-ficha",e=>{conflitoAtual=e.detail;abrir();agendarRender();});
    window.ShinobiOnline.on("xp-recebido",e=>{
      const d=e.detail;avisar("XP recebido",`${d.amount>0?"+":""}${d.amount} XP\n${d.before} → ${d.after}${d.reason?`\n${d.reason}`:""}`);
    });
    window.ShinobiOnline.on("convite-url",()=>{if(obterEstado().user)abrir();});
    window.addEventListener("online",agendarRender,{passive:true});
    window.addEventListener("offline",agendarRender,{passive:true});
  }

  function iniciar(){criarRoot();instalarBotao();instalarEventos();agendarRender();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",iniciar,{once:true});else iniciar();
  window.addEventListener("pageshow",()=>setTimeout(iniciar,120));

  window.ShinobiOnlineUI={abrir,fechar,renderizar,renderPainelFlutuante};
})();
