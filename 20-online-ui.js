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
  let campanhaMenuAberto=null;
  let destinoAtual=null;
  let ultimaVerificacaoSync=0;
  let backupsHistoricos=[];
  let backupsCarregando=false;
  let backupsErro="";
  let backupSheetId="";

  const CHAVE_PAINEL_FLUTUANTE="shinobi_online_widget_v1";

  const esc=valor=>String(valor==null?"":valor).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  const num=(v,p=0)=>Number.isFinite(Number(v))?Number(v):p;
  const pct=(atual,max)=>{const m=num(max);return m>0?Math.max(0,Math.min(100,Math.round((num(atual)/m)*100))):0;};
  const listaDeObjeto=valor=>Object.values(valor||{});

  function obterEstado(){return window.ShinobiOnline?.snapshot?.()||{};}
  function sessaoLocal(){try{return JSON.parse(localStorage.getItem("shinobi_online_session_v1")||"null");}catch(_erro){return null;}}
  function ehMestre(st){
    const sessao=sessaoLocal();
    return Boolean(st?.user&&st?.sala&&st.sala.masterUid===st.user.uid&&sessao?.role==="master"&&(!sessao.roomId||sessao.roomId===st.sala.id));
  }
  function participantes(st){return listaDeObjeto(st?.sala?.participants).sort((a,b)=>String(a.displayName||"").localeCompare(String(b.displayName||""),"pt-BR"));}
  function ordem(st){return window.ShinobiOnline?.normalizarOrdem?.()||[];}
  function participanteAtual(st){const o=ordem(st);return st?.sala?.participants?.[o[num(st?.sala?.combat?.turnIndex)]]||null;}
  function presencaConectada(registro,participantId=""){
    const alvo=String(participantId||"");
    const devices=Object.values(registro?.devices||{});
    if(devices.length){
      return devices.some(device=>device?.connected===true&&(!alvo||!device?.participantId||String(device.participantId)===alvo));
    }
    return registro?.connected===true; // compatibilidade com versões antigas
  }
  function conectado(st,p){return p.type==="player"&&presencaConectada(st?.presencas?.[p.ownerUid],p.id);}
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

  function textoMecanicaRemota(item){
    const direto=String(item?.text||"").trim();
    if(direto)return direto;
    const alvo=String(item?.target||"efeito").replace(/_/g," ");
    const valor=item?.value;
    if(item?.operation==="multiplicar"&&valor!==""&&valor!==undefined)return `${alvo} ×${valor}`;
    if(["somar","subtrair"].includes(item?.operation)&&valor!==""&&valor!==undefined){
      const n=Number(valor),formatado=Number.isFinite(n)&&n>0?`+${n}`:String(valor);
      return `${alvo} ${formatado}`;
    }
    return valor!==""&&valor!==undefined?`${alvo}: ${valor}`:alvo;
  }

  function mecanicasDoEfeito(efeito){
    const detalhes=Array.isArray(efeito?.details)?efeito.details:[];
    return detalhes.map(textoMecanicaRemota).filter(Boolean);
  }

  function resumoDoEfeito(efeito){
    const resumo=String(efeito?.summary||"").trim();
    if(resumo)return resumo;
    return mecanicasDoEfeito(efeito).slice(0,4).join(" • ");
  }

  function conexaoPainel(st){
    if(navigator.onLine===false)return "offline";
    const presenca=st?.presencas?.[st?.user?.uid];
    if(presencaConectada(presenca))return "online";
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
      const resumo=resumoDoEfeito(efeito);
      return `<li><span class="shinobiTurnoEfeitoTexto"><strong>${esc(efeito.name||"Efeito")}${esc(complemento)}</strong>${resumo?`<small>${esc(resumo)}</small>`:""}</span><b>${rodadasRestantes(efeito,combat)}r</b></li>`;
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
    // A navegação online agora pertence integralmente ao menu lateral esquerdo.
    // Mantemos apenas o widget de batalha/sala, sem recriar atalhos no cabeçalho
    // ou no antigo menu de configurações.
    document.getElementById("shinobiOnlineMenuBtn")?.remove();
    document.getElementById("shinobiOnlineTopoBtn")?.remove();
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

  function normalizarDestino(destino){
    const valor=String(destino||"").trim().toLowerCase();
    if(valor==="conta")return "conta-conectada"; // compatibilidade com atalhos antigos
    const permitidos=new Set(["login","conta-conectada","sincronizacao","backups","criar-sala","entrar-sala","sala-atual"]);
    return permitidos.has(valor)?valor:null;
  }

  function aplicarDestino(){
    if(!destinoAtual||!root)return;
    requestAnimationFrame(()=>{
      const mapa={
        "login":"[data-online-destino=\"login\"]",
        "conta-conectada":"[data-online-destino=\"conta-conectada\"]",
        "sincronizacao":"[data-online-destino=\"sincronizacao\"]",
        "backups":"[data-online-destino=\"backups\"]",
        "criar-sala":"[data-online-destino=\"criar-sala\"]",
        "entrar-sala":"form[data-form=\"join-room\"]",
        "sala-atual":".onlineSalaTopo,[data-online-destino=\"sala-atual\"]"
      };
      const alvo=root.querySelector(mapa[destinoAtual]||"");
      if(!alvo)return;
      if(destinoAtual==="entrar-sala"){
        setTimeout(()=>alvo.querySelector('input[name="code"]')?.focus({preventScroll:true}),180);
      }
    });
  }

  function atualizarCabecalhoDestino(){
    if(!root)return;
    const h2=root.querySelector(".shinobiOnlineHeader h2");
    const eyebrow=root.querySelector(".shinobiOnlineHeader .shinobiOnlineEyebrow");
    const mapa={
      "login":["CONTA","Minha conta"],
      "conta-conectada":["CONTA","Conta conectada"],
      "sincronizacao":["NUVEM","Sincronização"],
      "backups":["NUVEM","Backups da ficha"],
      "criar-sala":["SALA","Criar sala"],
      "entrar-sala":["SALA","Entrar em sala"],
      "sala-atual":["SALA","Sala atual"]
    };
    const [rotulo,titulo]=mapa[destinoAtual]||["FICHA NINJA","Mesa online"];
    if(eyebrow)eyebrow.textContent=rotulo;
    if(h2)h2.textContent=titulo;
  }

  function verificarSincronizacaoAoAbrir(){
    if(destinoAtual!=="sincronizacao")return;
    const st=obterEstado();
    if(!st.user||st.user.anonymous)return;
    const agora=Date.now();
    if(agora-ultimaVerificacaoSync<5000)return;
    ultimaVerificacaoSync=agora;
    setTimeout(()=>{
      /* A área de nuvem é sob demanda. Abrir o painel lista backups, mas não
         baixa, envia ou reconcilia fichas completas. */
      try{window.ShinobiOnline?.ativarBackupsNuvem?.();}catch(_erro){}
      window.EkoRealtimeSync?.reconciliar?.().catch(()=>{});
    },80);
  }

  function abrir(destino){
    destinoAtual=normalizarDestino(destino);
    try{
      criarRoot();
      aberto=true;
      root.hidden=false;
      root.removeAttribute("hidden");
      root.setAttribute("aria-hidden","false");
      document.body.classList.add("onlineAberto");

      try{
        renderizar();
      }catch(erroRender){
        console.error("Falha ao renderizar o painel Online:",erroRender);
        const conteudo=document.getElementById("shinobiOnlineConteudo");
        if(conteudo){
          conteudo.innerHTML=`<section class="onlineCard"><h3>Painel online</h3><p>O painel foi aberto, mas ocorreu um erro ao montar o conteúdo.</p><button type="button" class="onlineBtn primario" data-action="retry-online">Tentar novamente</button></section>`;
        }
      }

      verificarSincronizacaoAoAbrir();

      // Reafirma a visibilidade no frame seguinte. Isso protege PWAs/WebViews
      // que recalculam a camada ao mesmo tempo em que o drawer lateral fecha.
      requestAnimationFrame(()=>{
        if(!aberto||!root)return;
        root.hidden=false;
        root.removeAttribute("hidden");
        root.setAttribute("aria-hidden","false");
        document.body.classList.add("onlineAberto");
        aplicarDestino();
      });
      return true;
    }catch(erro){
      aberto=false;
      document.body.classList.remove("onlineAberto");
      console.error("Falha ao abrir o painel Online:",erro);
      return false;
    }
  }
  function fechar(){aberto=false;destinoAtual=null;pararScanner();if(root){root.hidden=true;root.setAttribute("aria-hidden","true");}document.body.classList.remove("onlineAberto");}

  function atualizarIndicadores(){
    const st=obterEstado();
    const ativo=Boolean(st.configurado&&st.conectado);
    const emSala=Boolean(st.salaId&&st.sala);
    const card=document.querySelector("[data-drawer-sync]");
    if(card){
      card.classList.toggle("onlineAtivo",ativo);
      card.classList.toggle("onlineEmSala",emSala);
      if(ativo)card.classList.remove("onlineErro");
    }
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
    const subtitulo=st.user.anonymous
      ? "Sem conta • dados somente neste aparelho"
      : `${st.user.email||"Conta Google"} • nuvem ativa`;
    const sync=st.syncAtual||{};
    const fase=String(sync.phase||"");
    const classeSync=st.user.anonymous?"local":sync.syncStatus===1?"ok":fase==="syncing"?"syncing":"pending";
    const textoSync=st.user.anonymous
      ?"Somente local"
      :sync.syncStatus===1
        ?"✓ Sincronizado"
        :fase==="syncing"
          ?"↻ Sincronizando..."
          :sync.pendingMode==="turno"
            ?"⚠ Pendente do turno"
            :"⚠ Pendente";
    return `<div class="onlineConta">
      <div class="onlineAvatar">${st.user.photoURL?`<img src="${esc(st.user.photoURL)}" alt="">`:st.user.anonymous?"🥷":"👤"}</div>
      <div class="onlineContaIdentidade"><strong>${esc(st.user.displayName||"Jogador")}</strong><small>${esc(subtitulo)}</small><span class="onlineSyncEstado ${classeSync}">${esc(textoSync)}</span></div>
      <div class="onlineContaAcoes">
        ${st.user.anonymous?`<button type="button" class="onlineBtn primario compacto" data-action="login-google">Entrar com Google</button>`:""}
        <button type="button" class="onlineBtn texto" data-action="logout">Sair</button>
      </div>
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
        <span class="onlineCardSelo">CONTA E NUVEM</span>
        <h3>Entrar com Google</h3>
        <p>Serve para mestre e jogador. Permite salvar a ficha na nuvem, baixar em outro aparelho e manter celular e tablet sincronizados.</p>
        <button type="button" class="onlineBtn primario" data-action="login-google">Entrar com Google</button>
      </section>
      <section class="onlineCard">
        <span class="onlineCardSelo">SEM CONTA</span>
        <h3>Jogar temporariamente</h3>
        <p>Permite entrar na sala sem cadastro, mas a ficha não poderá ser recuperada em outro aparelho.</p>
        <button type="button" class="onlineBtn secundario" data-action="login-anonymous">Continuar sem sincronização</button>
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
    const listaCampanhas=campanhas.length?`
      <div class="onlineCampanhasTitulo"><h4>Suas campanhas</h4><small>${campanhas.length} cadastrada(s)</small></div>
      <div class="onlineCampanhasLista">
        ${campanhas.map(c=>{
          const salas=Object.values(c.rooms||{});
          const abertas=salas.filter(sala=>sala?.status==="open").length;
          const menuAberto=campanhaMenuAberto===c.id;
          return `<article class="onlineCampanhaItem ${menuAberto?"menuAberto":""}">
            <button type="button" class="onlineCampanhaMenuBtn" data-action="toggle-campaign-menu" data-campaign-id="${esc(c.id)}" aria-label="Opções da campanha ${esc(c.name)}" aria-expanded="${menuAberto?"true":"false"}">⋮</button>
            <div class="onlineCampanhaInfo">
              <small>CAMPANHA</small>
              <strong>${esc(c.name)}</strong>
              <span>${salas.length?`${salas.length} sessão(ões)${abertas?` • ${abertas} aberta(s)`:""}`:"Nenhuma sessão criada"}</span>
            </div>
            ${menuAberto?`<div class="onlineCampanhaMenu" role="menu">
              <button type="button" data-action="edit-campaign" data-campaign-id="${esc(c.id)}" role="menuitem">Editar nome</button>
              <button type="button" class="perigo" data-action="delete-campaign" data-campaign-id="${esc(c.id)}" role="menuitem">Excluir campanha</button>
            </div>`:""}
          </article>`;
        }).join("")}
      </div>`:"";
    return `<section class="onlineCard destaqueMestre">
      <span class="onlineCardSelo">PAINEL DO MESTRE</span>
      <h3>Campanhas e salas</h3>
      <form data-form="create-campaign" class="onlineForm onlineFormLinha">
        <label>Nova campanha<input name="name" maxlength="80" placeholder="Crônicas de Konoha" required></label>
        <button class="onlineBtn secundario" type="submit">Criar campanha</button>
      </form>
      ${listaCampanhas}
      ${campanhas.length?`<form data-form="create-room" class="onlineForm onlineCriarSalaForm">
        <label>Campanha<select name="campaignId">${campanhas.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("")}</select></label>
        <label>Nome da sessão<input name="title" maxlength="80" placeholder="Batalha da ponte"></label>
        <button class="onlineBtn primario" type="submit">Criar sala e QR Code</button>
      </form>`:`<p class="onlineVazio">Crie a primeira campanha para abrir uma sala.</p>`}
    </section>`;
  }

  function renderMinhaConta(st){
    if(!st.user){
      return `<div class="onlineDestinoPagina" data-online-destino="login">
        <div class="onlineDestinoTitulo"><span class="onlineCardSelo">MINHA CONTA</span><h3>Login</h3><p>Entre com a mesma Conta Google usada nos seus outros aparelhos para manter a mesma ficha sincronizada.</p></div>
        ${renderLogin()}
      </div>`;
    }
    if(st.user.anonymous){
      return `<div class="onlineDestinoPagina" data-online-destino="login">
        ${cabecalhoConta(st)}
        <section class="onlineCard onlineContaGerenciar">
          <span class="onlineCardSelo">MINHA CONTA</span><h3>Você está usando uma sessão temporária</h3>
          <p>Entre com Google para vincular as fichas a uma conta e recuperá-las em celular, tablet ou outro aparelho.</p>
          <button type="button" class="onlineBtn primario" data-action="login-google">Entrar com Google</button>
        </section>
      </div>`;
    }
    return `<div class="onlineDestinoPagina" data-online-destino="login">
      ${cabecalhoConta(st)}
      <section class="onlineCard onlineContaGerenciar">
        <span class="onlineCardSelo">MINHA CONTA</span><h3>Login ativo</h3>
        <p>Esta conta já está autenticada. Para selecionar outro usuário Google, abra <b>Conta conectada</b> no menu lateral.</p>
      </section>
    </div>`;
  }

  function renderContaConectada(st){
    if(!st.user){
      return `<div class="onlineDestinoPagina" data-online-destino="conta-conectada">
        <section class="onlineCard onlineEstadoVazio">
          <span class="onlineCardSelo">CONTA CONECTADA</span><h3>Nenhum usuário conectado</h3>
          <p>Faça login primeiro. Depois você poderá voltar aqui para trocar o usuário conectado.</p>
          <button type="button" class="onlineBtn primario" data-action="go-login">Abrir login</button>
        </section>
      </div>`;
    }
    if(st.user.anonymous){
      return `<div class="onlineDestinoPagina" data-online-destino="conta-conectada">
        ${cabecalhoConta(st)}
        <section class="onlineCard onlineContaGerenciar">
          <span class="onlineCardSelo">CONTA CONECTADA</span><h3>Sessão temporária</h3>
          <p>Esta sessão não representa uma Conta Google. Conecte uma conta para poder alternar entre usuários do navegador.</p>
          <button type="button" class="onlineBtn primario" data-action="login-google">Conectar Conta Google</button>
        </section>
      </div>`;
    }
    return `<div class="onlineDestinoPagina" data-online-destino="conta-conectada">
      ${cabecalhoConta(st)}
      <section class="onlineCard onlineContaGerenciar">
        <span class="onlineCardSelo">CONTA CONECTADA</span><h3>Trocar usuário</h3>
        <p>Usuário atual: <strong>${esc(st.user.email||st.user.displayName||"Conta Google")}</strong></p>
        <p>Ao tocar em trocar usuário, o seletor de contas do Google será aberto para você escolher outra conta disponível neste aparelho.</p>
        <div class="onlineAcoesLinha">
          <button type="button" class="onlineBtn primario" data-action="switch-google-account">Trocar usuário</button>
          <button type="button" class="onlineBtn secundario" data-action="logout">Desconectar</button>
        </div>
      </section>
    </div>`;
  }

  function renderCriarSalaDestino(st){
    if(!st.user||st.user.anonymous){
      return `<div class="onlineDestinoPagina" data-online-destino="criar-sala">
        ${st.user?cabecalhoConta(st):""}
        <section class="onlineCard onlineEstadoVazio">
          <span class="onlineCardSelo">CRIAR SALA</span><h3>Entre com Google para ser mestre</h3>
          <p>A criação e o gerenciamento das salas ficam vinculados à sua conta.</p>
          <button type="button" class="onlineBtn primario" data-action="login-google">Entrar com Google</button>
        </section>
      </div>`;
    }
    if(st.sala){
      const master=ehMestre(st);
      return `<div class="onlineDestinoPagina" data-online-destino="criar-sala">
        ${cabecalhoConta(st)}
        <section class="onlineCard onlineSalaGerenciador">
          <span class="onlineCardSelo">${master?"GERENCIADOR DA SALA":"SALA ATIVA"}</span>
          <h3>${esc(st.sala.title||"Sala atual")}</h3>
          ${master?`<p>Compartilhe o código ou o QR Code com os jogadores.</p>${qrHtml(st)}`:`<p>Você já está conectado à sala <strong>${esc(st.sala.code||"")}</strong>. Saia dela antes de criar uma sala como mestre.</p>`}
          <button type="button" class="onlineBtn secundario" data-action="open-current-room">Abrir sala atual</button>
        </section>
      </div>`;
    }
    return `<div class="onlineDestinoPagina" data-online-destino="criar-sala">
      ${cabecalhoConta(st)}
      ${renderMestreHome(st)}
    </div>`;
  }

  function renderEntrarSalaDestino(st){
    const aviso=!st.user
      ? `<p class="onlineAviso">Você pode entrar sem cadastro. O aplicativo criará uma sessão temporária automaticamente.</p>`
      : st.sala
        ? `<p class="onlineAviso">Você está na sala ${esc(st.sala.code||"")}. Ao entrar em outro código, o aplicativo pedirá confirmação para trocar de sala.</p>`
        : "";
    return `<div class="onlineDestinoPagina" data-online-destino="entrar-sala">
      ${st.user?cabecalhoConta(st):""}
      ${aviso}
      ${renderEntradaSala(st)}
    </div>`;
  }

  function renderSalaAtualDestino(st){
    if(st.sala)return `<div class="onlineDestinoPagina" data-online-destino="sala-atual">${renderSala(st)}</div>`;
    const sessao=sessaoLocal();
    if(sessao?.roomId){
      return `<div class="onlineDestinoPagina" data-online-destino="sala-atual">
        <section class="onlineCard onlineEstadoVazio">
          <span class="onlineCardSelo">SALA ATUAL</span><h3>Reconectando à sala...</h3>
          <p>Existe uma sala salva neste aparelho, mas a conexão ainda não foi restaurada.</p>
          <button type="button" class="onlineBtn primario" data-action="reconnect-current-room">Tentar reconectar</button>
        </section>
      </div>`;
    }
    return `<div class="onlineDestinoPagina" data-online-destino="sala-atual">
      <section class="onlineCard onlineEstadoVazio">
        <span class="onlineCardSelo">SALA ATUAL</span><h3>Nenhuma sala ativa</h3>
        <p>Entre em uma sala existente ou crie uma nova mesa como mestre.</p>
        <div class="onlineAcoesLinha">
          <button type="button" class="onlineBtn primario" data-action="go-join-room">Entrar em sala</button>
          ${st.user&&!st.user.anonymous?`<button type="button" class="onlineBtn secundario" data-action="go-create-room">Criar sala</button>`:""}
        </div>
      </section>
    </div>`;
  }

  function renderSincronizacaoDestino(st){
    if(!st.user){
      return `<div class="onlineDestinoPagina" data-online-destino="sincronizacao">
        <section class="onlineCard onlineEstadoVazio"><span class="onlineCardSelo">SINCRONIZAÇÃO</span><h3>Entre para ativar a nuvem</h3><p>A sincronização entre dispositivos usa a mesma Conta Google em todos os seus aparelhos.</p><button type="button" class="onlineBtn primario" data-action="go-login">Abrir login</button></section>
      </div>`;
    }
    return `<div class="onlineDestinoPagina" data-online-destino="sincronizacao">${cabecalhoConta(st)}${renderConflito()}${renderNuvem(st)}</div>`;
  }

  function formatarDataBackup(timestamp){
    const n=Number(timestamp||0);
    if(!n)return "Data indisponível";
    try{return new Date(n).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});}catch(_erro){return new Date(n).toLocaleString("pt-BR");}
  }

  function rotuloMotivoBackup(item){
    if(item?.type==="daily"||item?.reason==="automatico-diario")return "Automático diário";
    if(item?.type==="safety"||item?.reason==="antes-restaurar-historico")return "Estado anterior à última restauração";
    if(item?.reason==="manual")return "Manual";
    return String(item?.reason||"Backup").replace(/[-_]+/g," ");
  }

  async function carregarBackupsAtivos(){
    const ficha=window.ShinobiOnline?.fichaAtualLocal?.();
    backupSheetId=String(ficha?.sheetId||"");
    if(!backupSheetId){backupsHistoricos=[];backupsErro="A ficha ativa ainda não possui identidade de backup.";return;}
    backupsCarregando=true;backupsErro="";renderizar();
    try{backupsHistoricos=await window.ShinobiOnline.listarBackupsHistoricos(backupSheetId);}
    catch(erro){backupsHistoricos=[];backupsErro=window.ShinobiOnline?.erroAmigavel?.(erro)||erro.message||String(erro);}
    finally{backupsCarregando=false;renderizar();}
  }

  function renderBackupsDestino(st){
    if(!st.user||st.user.anonymous){
      return `<div class="onlineDestinoPagina" data-online-destino="backups"><section class="onlineCard onlineEstadoVazio"><span class="onlineCardSelo">BACKUPS</span><h3>Conta Google necessária</h3><p>Os backups históricos pertencem à sua Conta Google.</p><button type="button" class="onlineBtn primario" data-action="go-login">Abrir login</button></section></div>`;
    }
    const ficha=window.ShinobiOnline?.fichaAtualLocal?.();
    const nome=String(ficha?.characterName||ficha?.data?.nome||ficha?.name||"Ficha");
    const lista=Array.isArray(backupsHistoricos)?backupsHistoricos:[];
    const ehSeguranca=item=>item?.type==="safety"||item?.reason==="antes-restaurar-historico";
    const historicos=lista.filter(item=>!ehSeguranca(item));
    const seguranca=lista.find(ehSeguranca)||null;
    const cardBackup=item=>`<div class="onlineCard" style="margin:0;padding:14px"><div class="onlineCardTitulo"><div><strong>${esc(rotuloMotivoBackup(item))}</strong><small>${esc(formatarDataBackup(item.createdAt))}${item.appVersion?` • v${esc(item.appVersion)}`:""}</small></div></div><div class="onlineAcoesLinha"><button type="button" class="onlineBtn secundario compacto" data-action="restore-history-backup" data-sheet-id="${esc(backupSheetId)}" data-backup-id="${esc(item.id)}">Restaurar</button><button type="button" class="onlineBtn texto compacto" data-action="delete-history-backup" data-sheet-id="${esc(backupSheetId)}" data-backup-id="${esc(item.id)}">Excluir</button></div></div>`;
    return `<div class="onlineDestinoPagina" data-online-destino="backups">
      <section class="onlineCard">
        <div class="onlineCardTitulo"><div><span class="onlineCardSelo">BACKUPS HISTÓRICOS</span><h3>${esc(nome)}</h3></div></div>
        <p>O Shinobi mantém no máximo <strong>3 versões históricas</strong> desta ficha entre backups manuais e automáticos. A segurança criada antes de uma restauração usa um slot separado e não ocupa uma dessas três vagas.</p>
        <div class="onlineAcoesLinha">
          <button type="button" class="onlineBtn primario" data-action="create-history-backup">Criar backup agora</button>
          <button type="button" class="onlineBtn secundario" data-action="back-sync">Voltar para sincronização</button>
        </div>
      </section>
      ${backupsCarregando?`<div class="onlineLoading"><span></span><p>Carregando backups...</p></div>`:""}
      ${backupsErro?`<section class="onlineCard"><h3>Não foi possível listar os backups</h3><p>${esc(backupsErro)}</p><button type="button" class="onlineBtn secundario" data-action="reload-backups">Tentar novamente</button></section>`:""}
      ${!backupsCarregando&&!backupsErro?(historicos.length?`<section class="onlineCard"><div class="onlineSyncSecaoTitulo"><span>VERSÕES DA FICHA</span><small>${historicos.length}/3 backups históricos</small></div><div class="onlineAcoesColuna">${historicos.map(cardBackup).join("")}</div></section>`:`<section class="onlineCard onlineEstadoVazio"><span class="onlineCardSelo">VERSÕES DA FICHA</span><h3>Nenhum backup histórico ainda</h3><p>Você pode criar o primeiro agora. O automático diário também será criado quando esta ficha estiver aberta e a conta estiver online.</p></section>`):""}
      ${!backupsCarregando&&!backupsErro&&seguranca?`<section class="onlineCard"><div class="onlineSyncSecaoTitulo"><span>SEGURANÇA DA RESTAURAÇÃO</span><small>slot separado</small></div><p>Guarda somente o estado imediatamente anterior à última restauração.</p><div class="onlineAcoesColuna">${cardBackup(seguranca)}</div></section>`:""}
    </div>`;
  }

  function renderDestino(st){
    if(destinoAtual==="login")return renderMinhaConta(st);
    if(destinoAtual==="conta-conectada")return renderContaConectada(st);
    if(destinoAtual==="criar-sala")return renderCriarSalaDestino(st);
    if(destinoAtual==="entrar-sala")return renderEntrarSalaDestino(st);
    if(destinoAtual==="sala-atual")return renderSalaAtualDestino(st);
    if(destinoAtual==="sincronizacao")return renderSincronizacaoDestino(st);
    if(destinoAtual==="backups")return renderBackupsDestino(st);
    return null;
  }

  function chaveVisualFicha(ficha){
    return String(ficha?.name||ficha?.characterName||"Ficha")
      .replace(/(?:\s+nuvem(?:\s+\d+)?)+$/i,"")
      .trim().toLocaleLowerCase("pt-BR").replace(/\s+/g," ");
  }

  function agruparFichasNuvem(nuvem,locais){
    const grupos=new Map();
    (nuvem||[]).forEach(ficha=>{
      const chave=chaveVisualFicha(ficha);
      const vinculada=(locais||[]).some(local=>local.sheetId===ficha.id);
      const item={...ficha,vinculada};
      if(!grupos.has(chave))grupos.set(chave,[]);
      grupos.get(chave).push(item);
    });
    return [...grupos.values()].map(itens=>{
      itens.sort((a,b)=>{
        if(Boolean(b.vinculada)!==Boolean(a.vinculada))return Number(Boolean(b.vinculada))-Number(Boolean(a.vinculada));
        const dataDiff=num(b.updatedAt)-num(a.updatedAt);
        if(dataDiff)return dataDiff;
        return num(b.revision)-num(a.revision);
      });
      const principal=itens[0];
      return {principal,itens,duplicatas:itens.slice(1),vinculada:itens.some(item=>item.vinculada)};
    }).sort((a,b)=>{
      if(Boolean(b.vinculada)!==Boolean(a.vinculada))return Number(Boolean(b.vinculada))-Number(Boolean(a.vinculada));
      return num(b.principal?.updatedAt)-num(a.principal?.updatedAt);
    });
  }

  function textoStatusSync(st){
    const sync=st?.syncAtual||{};
    if(sync.phase==="conflict")return {classe:"conflito",rotulo:"Atenção necessária",detalhe:"Existe um conflito aguardando sua escolha."};
    if(sync.phase==="syncing")return {classe:"sincronizando",rotulo:"Sincronizando…",detalhe:"Enviando as alterações desta ficha."};
    if(sync.phase==="pending")return {classe:"pendente",rotulo:"Aguardando envio",detalhe:navigator.onLine===false?"Será enviada quando a internet voltar.":"A sincronização automática está preparando o envio."};
    if(sync.syncStatus===1)return {classe:"ok",rotulo:"Tudo sincronizado",detalhe:"As alterações são enviadas e recebidas automaticamente."};
    return {classe:"ok",rotulo:"Sincronização entre dispositivos",detalhe:"Alterações confirmadas da ficha ativa são enviadas e recebidas por campo."};
  }

  function renderFichaNuvemGrupo(grupo){
    const ficha=grupo.principal||{};
    const antigas=grupo.duplicatas||[];
    const nome=ficha.characterName||ficha.name||"Ficha";
    const nomeFicha=String(ficha.name||nome).replace(/(?:\s+nuvem(?:\s+\d+)?)+$/i,"").trim()||nome;
    const subtitulo=grupo.vinculada
      ? `${nomeFicha} • neste aparelho`
      : `${nomeFicha} • disponível na nuvem`;
    const acao=grupo.vinculada
      ? `<span class="onlineSyncBadge ok">Automática</span>`
      : `<button type="button" class="onlineBtn secundario compacto" data-action="restore-cloud" data-sheet-id="${esc(ficha.id)}">Adicionar</button>`;
    const duplicatas=antigas.length?`
      <details class="onlineSyncDuplicatas">
        <summary>${antigas.length} ${antigas.length===1?"cópia antiga oculta":"cópias antigas ocultas"}</summary>
        <div class="onlineSyncDuplicatasLista">
          ${antigas.map(item=>`<div class="onlineSyncDuplicata"><span><b>${esc(item.name||item.characterName||"Ficha")}</b><small>Revisão ${num(item.revision,1)}</small></span>${item.vinculada?`<span class="onlineSyncBadge neutro">Neste aparelho</span>`:`<button type="button" class="onlineBtn texto compacto" data-action="restore-cloud" data-sheet-id="${esc(item.id)}">Adicionar</button>`}</div>`).join("")}
        </div>
      </details>`:"";
    return `<article class="onlineSyncFicha ${grupo.vinculada?"vinculada":"disponivel"}">
      <div class="onlineSyncFichaTopo">
        <div class="onlineSyncFichaTexto"><strong>${esc(nome)}</strong><small>${esc(subtitulo)}</small></div>
        ${acao}
      </div>
      ${duplicatas}
    </article>`;
  }

  function renderNuvem(st){
    const todasLocais=window.ShinobiOnline?.listarFichasLocais?.()||[];
    const locais=window.ShinobiOnline?.listarFichasSincronizaveis?.()||todasLocais.filter(f=>!f?.data?.__online?.syncDisabled);
    const recuperacoes=Math.max(0,todasLocais.length-locais.length);
    const nuvem=st.fichasNuvem||[];

    if(st.user?.anonymous){
      return `<section class="onlineCard onlineSyncPainel">
        <div class="onlineSyncHero desligada">
          <div class="onlineSyncIcone">☁</div>
          <div><span class="onlineCardSelo">SINCRONIZAÇÃO</span><h3>Nuvem desativada</h3><p>Use a mesma Conta Google no celular, tablet e outros aparelhos para manter suas fichas iguais em todos eles.</p></div>
        </div>
        <button type="button" class="onlineBtn primario" data-action="login-google">Entrar com Google</button>
      </section>`;
    }

    const grupos=agruparFichasNuvem(nuvem,locais);
    const vinculadas=grupos.filter(grupo=>grupo.vinculada);
    const disponiveis=grupos.filter(grupo=>!grupo.vinculada);
    const status=textoStatusSync(st);

    return `<section class="onlineCard onlineSyncPainel">
      <div class="onlineSyncHero">
        <div class="onlineSyncIcone">↻</div>
        <div class="onlineSyncHeroTexto">
          <span class="onlineCardSelo">SINCRONIZAÇÃO ENTRE DISPOSITIVOS</span>
          <h3>${esc(status.rotulo)}</h3>
          <p>${esc(status.detalhe)}</p>
        </div>
        <span class="onlineSyncIndicador ${esc(status.classe)}" aria-label="${esc(status.rotulo)}"></span>
      </div>

      <div class="onlineSyncConta">
        <div><small>CONTA GOOGLE</small><strong>${esc(st.user?.email||"Conta Google")}</strong></div>
        <span>${locais.length} ${locais.length===1?"personagem":"personagens"} neste aparelho${recuperacoes?` • ${recuperacoes} ${recuperacoes===1?"cópia antiga preservada":"cópias antigas preservadas"}`:""}</span>
      </div>

      <div class="onlineSyncResumo">
        <div><b>${vinculadas.length}</b><span>sincronizadas</span></div>
        <div><b>${disponiveis.length}</b><span>disponíveis</span></div>
        <div><b>${grupos.length}</b><span>personagens</span></div>
      </div>

      ${grupos.length?`
        <div class="onlineSyncSecao">
          <div class="onlineSyncSecaoTitulo"><span>SEUS PERSONAGENS</span><small>Uma personagem é a mesma no celular, tablet e demais aparelhos</small></div>
          <div class="onlineListaNuvem onlineListaNuvemClean">${grupos.map(renderFichaNuvemGrupo).join("")}</div>
        </div>`:`<p class="onlineVazio">Nenhum backup da ficha foi encontrado na nuvem. A sincronização entre dispositivos funciona separadamente, por alteração confirmada.</p>`}

      <details class="onlineSyncAvancado">
        <summary>Opções avançadas</summary>
        <div>
          <button type="button" class="onlineBtn secundario compacto" data-action="sync-check">Verificar sincronização agora</button>
          <small>As alterações confirmadas são enviadas automaticamente. Use esta opção apenas para reenviar pendências da ficha ativa.</small>
        </div>
        <div>
          <button type="button" class="onlineBtn secundario compacto" data-action="regularize-current">Regularizar ficha completa</button>
          <small>Une notas, inventário, jutsus, ataques, Kekkei Genkai, carteira e histórico antigos com o backup e o realtime, sem escolher um aparelho como vencedor.</small>
        </div>
        <div>
          <button type="button" class="onlineBtn secundario compacto" data-action="manage-backups">Gerenciar backups</button>
          <small>Crie um ponto de restauração, veja as três versões históricas mais recentes, restaure ou exclua uma delas.</small>
        </div>
      </details>
    </section>`;
  }

  function renderConflito(){
    if(!conflitoAtual)return"";
    const nome=conflitoAtual.local?.characterName||conflitoAtual.local?.name||"Ficha";
    const motivo=String(conflitoAtual.reason||"");
    const protegido=["incoming-data-loss","outgoing-data-loss","cloud-data-loss"].includes(motivo);
    const primeiroVinculo=motivo==="first-link-divergent";
    const textoConflito=protegido
      ? "A proteção contra perda de dados bloqueou uma versão muito mais vazia antes que ela substituísse sua ficha. Confira as duas versões e escolha qual deve continuar."
      : primeiroVinculo
        ? "Este personagem já existia neste aparelho e na nuvem antes de receber a mesma identidade. O app não criou outra cópia: ele parou para você escolher qual conteúdo deve prevalecer."
        : "Existem alterações diferentes desta mesma ficha em dois aparelhos. Escolha qual versão deve ser mantida.";
    return `<section class="onlineCard onlineConflito">
      <span class="onlineCardSelo">PROTEÇÃO DE SINCRONIZAÇÃO</span>
      <h3>${esc(nome)}</h3>
      <p>${esc(textoConflito)}</p>
      <div class="onlineAcoesColuna">
        <button class="onlineBtn primario" data-action="resolve-conflict" data-choice="nuvem" data-sheet-id="${esc(conflitoAtual.sheetId)}">Usar versão da nuvem</button>
        <button class="onlineBtn secundario" data-action="resolve-conflict" data-choice="local" data-sheet-id="${esc(conflitoAtual.sheetId)}">Manter este aparelho</button>
        <button class="onlineBtn texto" data-action="resolve-conflict" data-choice="copia" data-sheet-id="${esc(conflitoAtual.sheetId)}">Manter as duas como cópias separadas</button>
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

  function renderConviteSala(st){
    return `<details class="onlineCard onlineDetails onlineConviteSala" data-online-detail="invite">
      <summary><span><b>Convidar jogadores</b><small>QR Code, link e código ${esc(st.sala.code||"")}</small></span></summary>
      <div class="onlineDetailsConteudo">${qrHtml(st)}</div>
    </details>`;
  }

  function tipoParticipante(p){
    if(p.type==="player")return"Jogador";
    if(p.type==="npc-imported")return`Ficha importada${p.sourceSheetName?` • ${p.sourceSheetName}`:""}`;
    return"NPC rápido";
  }

  function renderParticipantes(st,master){
    const ps=participantes(st),ord=ordem(st),atual=participanteAtual(st);
    return `<section class="onlineCard onlineParticipantesCard">
      <div class="onlineCardTitulo"><div><span class="onlineCardSelo">PARTICIPANTES</span><h3>${ps.length} na sala</h3></div><small class="onlineAoVivoLegenda">● recursos ao vivo</small></div>
      <div class="onlineParticipantes">
        ${ps.length?ps.map(p=>{
          const naOrdem=ord.indexOf(p.id),isAtual=atual?.id===p.id;
          const pv=num(p.battle?.pv),pvMax=num(p.battle?.pvMax),chakra=num(p.battle?.chakra),chakraMax=num(p.battle?.chakraMax);
          return `<article class="onlineParticipante ${isAtual?"turnoAtual":""}">
            <div class="onlineParticipanteNome">
              ${p.type==="player"?`<span class="presencaDot ${conectado(st,p)?"conectado":""}" title="${conectado(st,p)?"Conectado":"Desconectado"}"></span>`:`<span class="npcDot">◆</span>`}
              <div><strong>${esc(p.displayName||"Participante")}</strong><small>${esc(tipoParticipante(p))}${naOrdem>=0?` • ordem ${naOrdem+1}`:""}</small></div>
              ${isAtual?`<span class="onlineTurnoBadge">TURNO</span>`:""}
            </div>
            <div class="onlineRecursosAoVivo">
              <div class="onlineRecurso onlineRecursoPv"><span><b>PV</b><strong>${pv}/${pvMax}</strong></span><i><em style="width:${pct(pv,pvMax)}%"></em></i></div>
              <div class="onlineRecurso onlineRecursoChakra"><span><b>CH</b><strong>${chakra}/${chakraMax}</strong></span><i><em style="width:${pct(chakra,chakraMax)}%"></em></i></div>
              <div class="onlineDefesasCompactas"><span>CA <b>${num(p.battle?.ca,10)}</b></span><span>CD <b>${num(p.battle?.cd,10)}</b></span></div>
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
    return `<details class="onlineCard onlineDetails" data-online-detail="npc">
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
    const sessao=sessaoLocal();
    const minhaVez=Boolean(combat.started&&atual?.id&&atual.id===sessao?.participantId);
    const turnKey=window.ShinobiOnline?.chaveTurnoAtual?.(combat)||`${rodada}:${Math.max(0,num(combat.turnIndex))}:${atual?.id||""}`;
    const turnoConfirmado=Boolean(minhaVez&&atual?.turnReadyKey===turnKey);
    return `<section class="onlineCard onlineCombate ${combat.started?"iniciado":""}">
      <span class="onlineCardSelo">INICIATIVA E RODADAS</span>
      <div class="onlineTurnoHero">
        <div><small>RODADA</small><strong>${rodada}</strong><em>${segundosInicio}–${segundosFim} segundos</em></div>
        <div><small>TURNO ATUAL</small><strong>${esc(atual?.displayName||"Aguardando")}</strong><em>${ord.length?`${num(combat.turnIndex)+1} de ${ord.length}`:"Defina a iniciativa"}</em></div>
      </div>
      ${master?`<div class="onlineAcoesLinha onlineControlesTurno">
        <button class="onlineBtn secundario" data-action="sort-initiative">Ordenar iniciativa</button>
        ${combat.started?`<button class="onlineBtn secundario" data-action="prev-turn">Turno anterior</button><button class="onlineBtn primario" data-action="next-turn">Próximo turno</button>`:`<button class="onlineBtn primario" data-action="start-combat">Iniciar combate</button>`}
      </div>`:`<div class="onlineTurnoJogador">
        <p class="onlineAvisoTurno">${minhaVez?"É o seu turno.":atual?`Turno de ${esc(atual.displayName)}.`:"O mestre ainda não iniciou o combate."}</p>
        ${minhaVez?`<button type="button" class="onlineBtn ${turnoConfirmado?"secundario":"primario"} onlineEncerrarTurno" data-action="finish-my-turn" ${turnoConfirmado?"disabled":""}>${turnoConfirmado?"✓ Turno sincronizado":"Encerrar meu turno"}</button><small>${turnoConfirmado?"O mestre já pode avançar a iniciativa.":"Ao confirmar, todas as alterações deste turno serão enviadas em um único pacote."}</small>`:""}
      </div>`}
    </section>`;
  }

  function efeitosAtivos(st){return listaDeObjeto(st.sala?.effects).filter(e=>e.status==="active");}
  function renderEfeitos(st,master){
    const efeitos=efeitosAtivos(st);
    return `<section class="onlineCard">
      <span class="onlineCardSelo">DURAÇÃO AUTOMÁTICA</span><h3>Efeitos em rodadas</h3>
      ${efeitos.length?`<p class="onlineExplicacao">O contador avança junto com as rodadas da mesa.</p>`:""}
      <div class="onlineEfeitosLista">
        ${efeitos.length?efeitos.map(e=>{
          const p=st.sala?.participants?.[e.participantId],rest=rodadasRestantes(e,st.sala?.combat);
          const mecanicas=mecanicasDoEfeito(e);
          const resumo=resumoDoEfeito(e);
          return `<article class="onlineEfeitoItem"><div class="onlineEfeitoConteudo"><strong>${esc(e.name)}</strong><small>${esc(p?.displayName||"Participante")} • ${rest} rodada(s) restante(s)</small>${mecanicas.length?`<div class="onlineEfeitoMecanicas">${mecanicas.map((mecanica,indice)=>`<span class="${String(e.details?.[indice]?.polarity||"").toLowerCase()}">${esc(mecanica)}</span>`).join("")}</div>`:resumo?`<p class="onlineEfeitoResumo">${esc(resumo)}</p>`:""}</div>${master||e.ownerUid===st.user?.uid?`<button class="onlineBtn texto" data-action="end-effect" data-effect-id="${esc(e.id)}">Encerrar</button>`:""}</article>`;
        }).join(""):`<p class="onlineVazio">Nenhum efeito ativo.</p>`}
      </div>
      ${master?`<details class="onlineSubDetails" data-online-detail="add-effect"><summary>Adicionar efeito</summary><div>
        <form data-form="add-effect" class="onlineForm onlineFormLinha onlineFormEfeito">
          <label>Participante<select name="participantId">${participantes(st).map(p=>`<option value="${esc(p.id)}">${esc(p.displayName)}</option>`).join("")}</select></label>
          <label>Efeito<input name="name" placeholder="Atordoado" required></label>
          <label>Rodadas<input name="duration" type="number" min="1" value="1" required></label>
          <button class="onlineBtn secundario" type="submit">Adicionar</button>
        </form>
      </div></details>`:""}
    </section>`;
  }

  function renderXp(st){
    const jogadores=participantes(st).filter(p=>p.type==="player");
    return `<details class="onlineCard onlineDetails" data-online-detail="progression">
      <summary><span><b>Progressão dos jogadores</b><small>Nível individual e distribuição de XP</small></span></summary>
      <div class="onlineDetailsConteudo onlineProgressaoConteudo">
        <section class="onlineProgressaoSecao">
          <div class="onlineProgressaoTitulo"><h4>Alterar nível individual</h4><small>O nível é enviado diretamente para a ficha do jogador. PV e Chakra não são recalculados.</small></div>
          <div class="onlineNivelJogadores">${jogadores.length?jogadores.map(p=>`<form data-form="set-player-level" data-participant-id="${esc(p.id)}" class="onlineNivelJogador">
            <div class="onlineNivelJogadorNome"><span class="presencaDot ${conectado(st,p)?"conectado":""}"></span><div><strong>${esc(p.displayName)}</strong><small>Nível atual na sala: ${Math.max(1,num(p.battle?.level,1))}</small></div></div>
            <label>Nível<input name="level" type="number" min="1" max="20" value="${Math.max(1,num(p.battle?.level,1))}" required></label>
            <button class="onlineBtn secundario" type="submit">Salvar nível</button>
          </form>`).join(""):`<p class="onlineVazio">Aguarde jogadores entrarem na sala.</p>`}</div>
        </section>
        <section class="onlineProgressaoSecao">
          <div class="onlineProgressaoTitulo"><h4>Distribuir XP</h4><small>Funciona também para jogadores que entraram como convidados.</small></div>
          <form data-form="grant-xp" class="onlineForm">
            <div class="onlineXpJogadores">${jogadores.length?jogadores.map(p=>`<label><input type="checkbox" name="participantIds" value="${esc(p.id)}" checked><span class="presencaDot ${conectado(st,p)?"conectado":""}"></span>${esc(p.displayName)}</label>`).join(""):`<p class="onlineVazio">Aguarde jogadores entrarem na sala.</p>`}</div>
            <div class="onlineFormGrid"><label>Quantidade<input name="amount" type="number" value="500" required></label><label>Motivo<input name="reason" maxlength="160" placeholder="Fim da missão"></label></div>
            <button class="onlineBtn primario" type="submit" ${jogadores.length?"":"disabled"}>Conceder XP</button>
          </form>
        </section>
      </div>
    </details>`;
  }

  function renderSala(st){
    const master=ehMestre(st);
    const ps=participantes(st);
    return `<section class="onlineCard onlineSalaTopo onlineSalaTopoCompacta">
        <div><span class="onlineCardSelo">${master?"SALA DO MESTRE":"SALA ATUAL"}</span><h3>${esc(st.sala.title)}</h3><div class="onlineSalaMeta"><span class="onlineSalaStatus ${st.sala.status==="open"?"aberta":"fechada"}">${st.sala.status==="open"?"● Sala aberta":"Sala encerrada"}</span><span>${ps.length} ${ps.length===1?"participante":"participantes"}</span></div></div>
        <button type="button" class="onlineCodigoRapido" data-action="copy-code" title="Copiar código da sala"><small>CÓDIGO</small><strong>${esc(st.sala.code)}</strong></button>
      </section>
      ${master?renderConviteSala(st):""}
      ${renderCombate(st,master)}
      ${renderParticipantes(st,master)}
      ${renderEfeitos(st,master)}
      ${master?renderAdicionarNpc(st):""}
      ${master?renderXp(st):""}
      <section class="onlineCard onlineZonaPerigo onlineZonaPerigoCompacta">
        ${master?`<button class="onlineBtn perigo" data-action="close-room">Encerrar sala</button>`:`<button class="onlineBtn perigo" data-action="leave-room">Sair da sala</button>`}
      </section>`;
  }

  function renderHome(st){
    return `${cabecalhoConta(st)}${renderConflito()}<div class="onlineGridDois">${!st.user.anonymous?renderMestreHome(st):""}${renderEntradaSala(st)}</div>${renderNuvem(st)}`;
  }

  function chaveFormulario(form,indice){
    return [form?.dataset?.form||"form",form?.dataset?.participantId||"",indice].join("::");
  }

  function capturarInteracao(conteudo){
    const estado={details:{},campos:[],foco:null,scrollTop:conteudo?.scrollTop||0};
    if(!conteudo)return estado;
    conteudo.querySelectorAll("details[data-online-detail]").forEach(el=>{estado.details[el.dataset.onlineDetail]=el.open;});
    conteudo.querySelectorAll("form[data-form]").forEach((form,indiceForm)=>{
      const chave=chaveFormulario(form,indiceForm);
      form.querySelectorAll("input[name],select[name],textarea[name]").forEach((campo,indiceCampo)=>{
        estado.campos.push({
          chave,nome:campo.name,indice:indiceCampo,tipo:campo.type||campo.tagName,
          value:campo.value,checked:Boolean(campo.checked)
        });
      });
    });
    const ativo=document.activeElement;
    if(ativo&&conteudo.contains(ativo)&&ativo.name){
      const form=ativo.closest("form[data-form]");
      if(form){
        const forms=[...conteudo.querySelectorAll("form[data-form]")];
        estado.foco={
          chave:chaveFormulario(form,forms.indexOf(form)),nome:ativo.name,
          inicio:Number.isInteger(ativo.selectionStart)?ativo.selectionStart:null,
          fim:Number.isInteger(ativo.selectionEnd)?ativo.selectionEnd:null
        };
      }
    }
    return estado;
  }

  function restaurarInteracao(conteudo,estado){
    if(!conteudo||!estado)return;
    conteudo.querySelectorAll("details[data-online-detail]").forEach(el=>{
      if(Object.prototype.hasOwnProperty.call(estado.details||{},el.dataset.onlineDetail))el.open=Boolean(estado.details[el.dataset.onlineDetail]);
    });
    const forms=[...conteudo.querySelectorAll("form[data-form]")];
    const mapa=new Map(forms.map((form,indice)=>[chaveFormulario(form,indice),form]));
    (estado.campos||[]).forEach(item=>{
      const form=mapa.get(item.chave);if(!form)return;
      const candidatos=[...form.querySelectorAll(`[name="${CSS.escape(item.nome)}"]`)];
      const campo=candidatos[item.indice]||candidatos[0];if(!campo)return;
      if(campo.type==="checkbox"||campo.type==="radio")campo.checked=item.checked;
      else campo.value=item.value;
    });
    if(estado.foco){
      const form=mapa.get(estado.foco.chave);
      const campo=form?.querySelector(`[name="${CSS.escape(estado.foco.nome)}"]`);
      if(campo){
        campo.focus({preventScroll:true});
        if(estado.foco.inicio!==null&&typeof campo.setSelectionRange==="function"){
          try{campo.setSelectionRange(estado.foco.inicio,estado.foco.fim??estado.foco.inicio);}catch(_erro){}
        }
      }
    }
    conteudo.scrollTop=estado.scrollTop||0;
  }

  function renderizar(){
    criarRoot();
    atualizarCabecalhoDestino();
    const conteudo=document.getElementById("shinobiOnlineConteudo"),st=obterEstado();
    if(!conteudo)return;
    const interacao=capturarInteracao(conteudo);
    if(st.carregando){conteudo.innerHTML='<div class="onlineLoading"><span></span><p>Conectando ao sistema online...</p></div>';return;}
    if(!st.configurado){conteudo.innerHTML=renderConfiguracao();return;}
    if(st.ultimoErro&&!st.iniciado){conteudo.innerHTML=`<section class="onlineCard"><h3>Falha ao iniciar</h3><p>${esc(st.ultimoErro)}</p><button type="button" class="onlineBtn primario" data-action="retry-online">Tentar novamente</button></section>`;return;}
    const destinoHtml=destinoAtual?renderDestino(st):null;
    if(destinoHtml!==null){
      conteudo.innerHTML=destinoHtml;
      restaurarInteracao(conteudo,interacao);
      requestAnimationFrame(()=>{renderQr();aplicarDestino();});
      return;
    }
    if(!st.user){conteudo.innerHTML=renderLogin();return;}
    conteudo.innerHTML=st.sala?renderSala(st):renderHome(st);
    restaurarInteracao(conteudo,interacao);
    requestAnimationFrame(()=>{renderQr();});
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
    const el=evento.target.closest("[data-action]");
    if(!el){
      if(campanhaMenuAberto){campanhaMenuAberto=null;agendarRender();}
      return;
    }
    const acao=el.dataset.action;
    if(acao==="close")return fechar();
    if(acao==="stop-scan")return pararScanner();
    if(acao==="retry-online")return executar(()=>window.ShinobiOnline.iniciar());
    if(acao==="login-google")return executar(()=>window.ShinobiOnline.entrarGoogle());
    if(acao==="login-anonymous")return executar(()=>window.ShinobiOnline.entrarAnonimo());
    if(acao==="logout")return executar(()=>window.ShinobiOnline.sair());
    if(acao==="go-login"){destinoAtual="login";renderizar();return;}
    if(acao==="go-join-room"){destinoAtual="entrar-sala";renderizar();return;}
    if(acao==="go-create-room"){destinoAtual="criar-sala";renderizar();return;}
    if(acao==="open-current-room"){destinoAtual="sala-atual";renderizar();return;}
    if(acao==="back-sync"){destinoAtual="sincronizacao";renderizar();verificarSincronizacaoAoAbrir();return;}
    if(acao==="manage-backups"){
      destinoAtual="backups";backupsHistoricos=[];backupsErro="";renderizar();
      return carregarBackupsAtivos();
    }
    if(acao==="reload-backups")return carregarBackupsAtivos();
    if(acao==="create-history-backup")return executar(async()=>{
      try{if(typeof window.salvar==="function")window.salvar();}catch(_erro){}
      const resultado=await window.ShinobiOnline.criarBackupHistoricoAtual(window.ShinobiOnline.fichaAtualLocal()?.name,{motivo:"manual"});
      await carregarBackupsAtivos();
      await avisar("Backup criado",`Um ponto de restauração foi salvo. O Shinobi mantém no máximo 3 backups históricos por ficha.`);
      return resultado;
    });
    if(acao==="delete-history-backup")return executar(async()=>{
      const ok=await confirmar("Excluir backup","Excluir este backup histórico? Esta versão específica não poderá ser restaurada depois.");
      if(!ok)return;
      await window.ShinobiOnline.excluirBackupHistorico(el.dataset.sheetId,el.dataset.backupId);
      await carregarBackupsAtivos();
      await avisar("Backup excluído","A versão histórica foi removida da nuvem.");
    });
    if(acao==="restore-history-backup")return executar(async()=>{
      const ok=await confirmar(
        "Restaurar backup histórico",
        "Esta versão substituirá o estado atual desta ficha e será propagada para os outros aparelhos. Antes da restauração, o Shinobi criará automaticamente um backup de segurança do estado atual.\n\nContinuar?"
      );
      if(!ok)return;
      const resultado=await window.ShinobiOnline.restaurarBackupHistorico(el.dataset.sheetId,el.dataset.backupId);
      if(resultado?.snapshotAgendado){
        await avisar("Backup restaurado","A versão escolhida foi aplicada à ficha e à sincronização. O snapshot estrutural será consolidado automaticamente sem atrasar a restauração. O app será recarregado agora.");
      }else if(resultado?.snapshotPendente){
        await avisar("Backup restaurado",`A versão escolhida foi aplicada à ficha e à sincronização. O backup completo atual ficou pendente e o Shinobi tentará enviá-lo novamente.${resultado.snapshotErro?`\n\nDetalhe: ${resultado.snapshotErro}`:""}\n\nO app será recarregado agora.`);
      }else{
        await avisar("Backup restaurado","A versão escolhida foi aplicada à ficha, à sincronização e ao backup atual. O app será recarregado agora.");
      }
      setTimeout(()=>window.location.reload(),180);
    });
    if(acao==="switch-google-account")return (async()=>{
      const st=obterEstado();
      if(st.sala){
        const ok=await confirmar("Trocar usuário",`Você está conectado à sala ${st.sala.code||"atual"}. Para trocar a Conta Google, este usuário será desconectado da sala. Continuar?`);
        if(!ok)return;
      }
      return executar(async()=>{
        if(obterEstado().sala)await window.ShinobiOnline.sairDaSala({silencioso:true});
        await window.ShinobiOnline.trocarContaGoogle();
        destinoAtual="conta-conectada";
      });
    })();
    if(acao==="reconnect-current-room")return executar(async()=>{
      const sessao=sessaoLocal();
      await window.ShinobiOnline.iniciar();
      const st=obterEstado();
      if(!sessao?.roomId)throw new Error("Não existe uma sala salva neste aparelho.");
      if(!st.user)throw new Error("A sessão da conta ainda não foi restaurada. Abra Minha conta e faça login novamente.");
      await window.ShinobiOnline.observarSala(sessao.roomId,{restaurar:true});
      destinoAtual="sala-atual";
    });
    if(acao==="scan-qr")return iniciarScanner();
    if(acao==="toggle-campaign-menu"){
      const id=el.dataset.campaignId;
      campanhaMenuAberto=campanhaMenuAberto===id?null:id;
      agendarRender();
      return;
    }
    if(acao==="edit-campaign"){
      const id=el.dataset.campaignId;
      const campanha=obterEstado().campanhas?.find(item=>item.id===id);
      if(!campanha)return;
      const novoNome=prompt("Novo nome da campanha:",campanha.name||"");
      if(novoNome===null)return;
      campanhaMenuAberto=null;
      return executar(async()=>{
        await window.ShinobiOnline.editarCampanha(id,novoNome);
        await avisar("Campanha atualizada","O novo nome foi salvo.");
      });
    }
    if(acao==="delete-campaign"){
      const id=el.dataset.campaignId;
      const campanha=obterEstado().campanhas?.find(item=>item.id===id);
      if(!campanha)return;
      const salas=Object.values(campanha.rooms||{});
      const abertas=salas.filter(sala=>sala?.status==="open").length;
      const detalhe=salas.length
        ? `Esta campanha possui ${salas.length} sessão(ões). ${abertas?`${abertas} sala(s) aberta(s) também serão encerradas. `:""}A exclusão da campanha não poderá ser desfeita.`
        : "A campanha será removida permanentemente.";
      const confirmado=await confirmar("Excluir campanha",`Excluir “${campanha.name}”?\n\n${detalhe}`);
      if(!confirmado)return;
      campanhaMenuAberto=null;
      return executar(async()=>{
        const resultado=await window.ShinobiOnline.excluirCampanha(id);
        const complemento=resultado?.closedRooms?` ${resultado.closedRooms} sala(s) vinculada(s) foram encerradas.`:"";
        await avisar("Campanha excluída",`A campanha foi removida.${complemento}`);
      });
    }
    if(acao==="copy-code")return copiar(obterEstado().sala?.code,"Código copiado.");
    if(acao==="copy-link")return copiar(window.ShinobiOnline.linkDaSala(obterEstado().sala?.code),"Link copiado.");
    if(acao==="sync-check")return executar(async()=>{
      try{window.ShinobiOnline?.ativarBackupsNuvem?.();}catch(_erro){}
      await window.EkoRealtimeSync?.reconciliar?.();
      await avisar("Sincronização verificada","As alterações confirmadas da ficha ativa foram conferidas. O backup na nuvem permanece separado.");
    });
    if(acao==="regularize-current")return executar(async()=>{
      const ok=await confirmar(
        "Regularizar ficha completa",
        "O Shinobi vai unir notas, inventário, jutsus, ataques, Kekkei Genkai, carteira e histórico antigos deste aparelho com o que já existe na nuvem. Duplicatas idênticas serão unificadas; versões diferentes serão preservadas separadamente; exclusões já confirmadas no realtime não serão ressuscitadas.\n\nNa carteira, cada moeda é regularizada separadamente; se já existir um saldo realtime consolidado, ele é preservado.\n\nSe outro aparelho antigo tiver conteúdo que nunca chegou à nuvem, execute esta opção uma vez naquele aparelho também.\n\nContinuar?"
      );
      if(!ok)return;
      const nome=window.ShinobiOnline.fichaAtualLocal()?.name;
      const resultado=await window.ShinobiOnline.regularizarFichaCompleta(nome);
      const detalhes=resultado?.details||{};
      const partes=[
        `Notas: ${Number(detalhes.notas?.total||0)}`,
        `Inventário: ${Number(detalhes.inventario?.total||0)}`,
        `Jutsus: ${Number(detalhes.jutsus?.total||0)}`,
        `Ataques: ${Number(detalhes.armados?.total||0)}`,
        `Kekkei Genkai: ${Number(detalhes.kekkeiGenkai?.total||0)}`,
        `Carteira: ${Number(detalhes.carteiraMoedas?.total||0)}`,
        `Histórico: ${Number(detalhes.carteiraHistorico?.total||0)}`
      ];
      const extras=[];
      if(Number(resultado?.published||0)>0)extras.push(`${resultado.published} item(ns) antigos publicados`);
      if(Number(resultado?.conflicts||0)>0)extras.push(`${resultado.conflicts} diferença(s) preservada(s) como cópia separada`);
      if(Number(resultado?.skippedDeleted||0)>0)extras.push(`${resultado.skippedDeleted} item(ns) já excluídos mantidos como excluídos`);
      await avisar(
        "Ficha regularizada",
        `${partes.join(" • ")}.${extras.length?`\n\n${extras.join(" • ")}.`:""}\n\nO backup completo também foi atualizado. O app será recarregado para consolidar os índices locais.`
      );
      setTimeout(()=>window.location.reload(),180);
    });
    if(acao==="sync-current")return executar(async()=>{
      try{if(typeof window.salvar==="function")window.salvar();}catch(_erro){}
      await window.ShinobiOnline.atualizarBackupEstrutural(window.ShinobiOnline.fichaAtualLocal()?.name,{motivo:"backup-manual"});
      await avisar("Backup atualizado","A ficha completa foi salva na nuvem. A sincronização entre dispositivos continua sendo feita separadamente por campo confirmado.");
    });
    if(acao==="sync-all")return executar(async()=>{
      await window.EkoRealtimeSync?.reconciliar?.();
      await avisar("Sincronização verificada","As alterações confirmadas pendentes da ficha ativa foram reenviadas.");
    });
    if(acao==="restore-cloud")return executar(async()=>{
      const vinculada=el.dataset.linked==="true";
      const mensagem=vinculada
        ? "A versão local desta ficha será atualizada com os dados atuais da nuvem."
        : "A ficha será baixada e ficará vinculada à mesma versão da nuvem neste aparelho.";
      if(await confirmar(vinculada?"Baixar novamente":"Baixar ficha",mensagem)){
        await window.ShinobiOnline.restaurarFichaDaNuvem(el.dataset.sheetId,{asCopy:false});
        await avisar("Ficha completa baixada","A ficha foi aberta neste aparelho com notas, inventário, carteira, jutsus e demais dados da nuvem.");
      }
    });
    if(acao==="resolve-conflict")return executar(async()=>{await window.ShinobiOnline.resolverConflito(el.dataset.sheetId,el.dataset.choice);conflitoAtual=null;});
    if(acao==="sort-initiative")return executar(()=>window.ShinobiOnline.ordenarIniciativa());
    if(acao==="start-combat")return executar(()=>window.ShinobiOnline.iniciarCombate());
    if(acao==="next-turn")return executar(async()=>{
      const st=obterEstado();
      const atual=participanteAtual(st);
      const combat=st.sala?.combat||{};
      const chave=window.ShinobiOnline?.chaveTurnoAtual?.(combat)||`${Math.max(1,num(combat.round,1))}:${Math.max(0,num(combat.turnIndex))}:${atual?.id||""}`;
      if(atual?.type==="player"&&atual.turnReadyKey!==chave){
        const ok=await confirmar(
          "Turno ainda não sincronizado",
          `${atual.displayName||"O jogador"} ainda não confirmou o encerramento deste turno. Se você avançar agora, o aplicativo tentará sincronizar automaticamente no aparelho dele para evitar perda de dados.\n\nAvançar mesmo assim?`
        );
        if(!ok)return;
      }
      return window.ShinobiOnline.avancarTurno();
    });
    if(acao==="prev-turn")return executar(()=>window.ShinobiOnline.voltarTurno());
    if(acao==="finish-my-turn"){
      const resumo=window.ShinobiOnline?.resumoMudancasMeuTurno?.()||{lines:["Alterações do turno serão sincronizadas."]};
      const linhas=(resumo.lines||[]).join("\n");
      const stAtual=obterEstado();
      const mensagemDestino=stAtual?.user?.anonymous
        ? "Ao confirmar, o estado consolidado será enviado para a sala. Para sincronizar a ficha entre aparelhos, entre com Google."
        : "Ao confirmar, a ficha será salva na nuvem e os outros dispositivos receberão esta versão.";
      const ok=await confirmar(
        "Encerrar e sincronizar turno?",
        `${linhas}\n\n${mensagemDestino}`
      );
      if(!ok)return;
      return executar(async()=>{
        const resultado=await window.ShinobiOnline.finalizarMeuTurno();
        if(resultado?.conflict){
          await avisar("Conflito de sincronização","Outro dispositivo possui uma versão mais recente desta ficha. Resolva o conflito antes de encerrar o turno.");
          return;
        }
        if(resultado?.anonymous){
          await avisar("Turno atualizado","As alterações foram enviadas para a sala. Para sincronizar a ficha entre aparelhos, entre com Google.");
        }else{
          await avisar("Turno sincronizado","As alterações deste turno foram confirmadas pelo Firebase. O mestre já pode avançar.");
        }
      });
    }
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
    if(tipo==="create-room")return executar(async()=>{
      await window.ShinobiOnline.criarSala({campaignId:dados.get("campaignId"),title:dados.get("title")});
      destinoAtual="criar-sala";
    });
    if(tipo==="join-room")return (async()=>{
      const codigo=String(dados.get("code")||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
      const st=obterEstado();
      if(st.sala){
        const atual=String(st.sala.code||"").toUpperCase();
        if(codigo===atual){
          const fichaEscolhida=String(dados.get("localSheetName")||"");
          const sessao=sessaoLocal();
          if(sessao?.role==="player"&&fichaEscolhida&&fichaEscolhida!==String(sessao.localSheetName||"")){
            return executar(async()=>{
              await window.ShinobiOnline.entrarSala({code:codigo,localSheetName:fichaEscolhida});
              pararScanner();
              destinoAtual="sala-atual";
            });
          }
          destinoAtual="sala-atual";renderizar();return;
        }
        const ok=await confirmar("Trocar de sala",`Você está na sala ${atual||"atual"}. Deseja sair dela e entrar na sala ${codigo||"informada"}?`);
        if(!ok)return;
      }
      return executar(async()=>{
        if(obterEstado().sala)await window.ShinobiOnline.sairDaSala({silencioso:true});
        await window.ShinobiOnline.entrarSala({code:codigo,localSheetName:dados.get("localSheetName")});
        pararScanner();
        destinoAtual="sala-atual";
      });
    })();
    if(tipo==="import-npc")return executar(async()=>{await window.ShinobiOnline.importarFichaComoNpc(dados.get("localSheetName"),{displayName:dados.get("displayName")});form.reset();});
    if(tipo==="quick-npc")return executar(async()=>{await window.ShinobiOnline.criarNpcRapido(Object.fromEntries(dados.entries()));form.reset();});
    if(tipo==="add-effect")return executar(async()=>{await window.ShinobiOnline.adicionarEfeito({participantId:dados.get("participantId"),name:dados.get("name"),duration:num(dados.get("duration"),1)});form.reset();});
    if(tipo==="set-player-level")return executar(async()=>{
      const participantId=form.dataset.participantId;
      const resultado=await window.ShinobiOnline.definirNivelJogador({participantId,nivel:dados.get("level")});
      const jogador=obterEstado().sala?.participants?.[participantId];
      await avisar("Nível atualizado",`${jogador?.displayName||"Jogador"} foi definido como nível ${resultado.level}.`);
    });
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
    ["status","pronto","auth","campanhas","fichas-nuvem","ficha-atualizada-nuvem","ficha-sincronizada","status-sync","turno-finalizado","turno-sincronizado","sala","presenca","configuracao-pendente","sala-encerrada"].forEach(tipo=>window.ShinobiOnline.on(tipo,agendarRender));
    window.ShinobiOnline.on("erro",e=>{
      document.querySelector("[data-drawer-sync]")?.classList.add("onlineErro");
      console.warn("Modo online indisponível:",e.detail.mensagem);
      agendarRender();
    });
    window.ShinobiOnline.on("erro-sync",e=>{document.querySelector("[data-drawer-sync]")?.classList.add("onlineErro");console.warn(e.detail.mensagem);});
    window.ShinobiOnline.on("conflito-ficha",e=>{conflitoAtual=e.detail;abrir();agendarRender();});
    window.ShinobiOnline.on("xp-recebido",e=>{
      const d=e.detail;avisar("XP recebido",`${d.amount>0?"+":""}${d.amount} XP\n${d.before} → ${d.after}${d.reason?`\n${d.reason}`:""}`);
    });
    window.addEventListener("shinobi:turno-auto-sincronizado",()=>{avisar("Turno sincronizado automaticamente","O mestre avançou a iniciativa antes da confirmação. As alterações locais foram enviadas para evitar perda de dados.");});
    window.ShinobiOnline.on("nivel-recebido",e=>{
      const d=e.detail;avisar("Nível atualizado pelo mestre",`${d.character||"Sua ficha"}: nível ${d.before} → ${d.after}.${d.reason?`\n${d.reason}`:""}`);
    });
    window.ShinobiOnline.on("convite-url",()=>{if(obterEstado().user)abrir();});
    window.addEventListener("online",agendarRender,{passive:true});
    window.addEventListener("offline",agendarRender,{passive:true});
  }

  function iniciar(){
    try{
      criarRoot();
      instalarBotao();
      instalarEventos();
      agendarRender();
      return true;
    }catch(erro){
      console.error("Falha ao inicializar a interface Online:",erro);
      return false;
    }
  }

  // Expõe a API ANTES da inicialização. Assim o menu lateral sempre possui
  // um destino válido mesmo se algum recurso secundário do Online falhar.
  window.ShinobiOnlineUI={abrir,fechar,renderizar,renderPainelFlutuante,iniciar};
  window.dispatchEvent(new CustomEvent("shinobi:online-ui-ready"));

  function iniciarDepoisDaRenderizacao(){
    if(window.ShinobiAppReady?.executar){
      window.ShinobiAppReady.executar(iniciar);
    }else if(document.readyState==="complete"){
      setTimeout(iniciar,1200);
    }else{
      window.addEventListener("load",()=>setTimeout(iniciar,1200),{once:true});
    }
  }
  iniciarDepoisDaRenderizacao();
  window.addEventListener("pageshow",()=>{
    if(window.ShinobiAppReady?.executar)window.ShinobiAppReady.executar(()=>setTimeout(iniciar,180));
    else setTimeout(iniciar,1200);
  });
})();
