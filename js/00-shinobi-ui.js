(function(){
  "use strict";

  const ICON_BASE="assets/icons/";
  const EMOJI_ICON={
    "⚙":"settings","⚙️":"settings","👤":"profile","💪":"attributes","🔥":"fire","🥷":"profile","🎒":"inventory","📜":"notes",
    "⭐":"bonus","❤️":"heart","❤":"heart","🔵":"chakra","⚡":"lightning","🌪":"wind","🌪️":"wind","💧":"water","🪨":"earth",
    "🧬":"dna","⚔":"sword","⚔️":"sword","👊":"fist","👁":"eye","👁️":"eye","💰":"wallet","🏪":"store","✴":"shuriken","✴️":"shuriken",
    "🔪":"sword","🪡":"jutsu","🧵":"inventory","🍙":"inventory","💣":"fire","🏷":"notes","🏷️":"notes","🧪":"chakra","🩹":"heal",
    "🗡":"sword","🗡️":"sword","🎭":"profile","🌱":"leaf","🌑":"eye","☀":"bonus","☀️":"bonus","✨":"bonus","🖼":"image","🖼️":"image",
    "🔎":"target","☷":"menu","🍥":"jutsu","🃏":"jutsu","✍":"edit","✍️":"edit","🥋":"fist","🌀":"jutsu","🏹":"target",
    "🧰":"inventory","💎":"bonus","☠":"bonus","☠️":"bonus","🔒":"shield","🩸":"heart","😵":"eye"
  };

  function nomeSeguro(nome){return String(nome||"bonus").toLowerCase().replace(/[^a-z0-9-]/g,"")||"bonus";}
  function iconHTML(nome,extra="",label=""){
    const seguro=nomeSeguro(nome);
    const aria=label?` role="img" aria-label="${String(label).replace(/"/g,"&quot;")}"`:' aria-hidden="true"';
    if(seguro==="fire") return `<span class="shinobiEmojiIcon icon-fire-emoji${extra?` ${extra}`:""}"${aria}>🔥</span>`;
    return `<span class="shinobiIcon icon-${seguro}${extra?` ${extra}`:""}"${aria}></span>`;
  }
  window.iconeShinobi=iconHTML;
  window.shinobiIcon=iconHTML;

  function detectarIcone(texto){
    const limpo=String(texto||"").trim();
    for(const [emoji,icone] of Object.entries(EMOJI_ICON)){
      if(limpo.startsWith(emoji))return {icone,resto:limpo.slice(emoji.length).trim()};
    }
    return null;
  }

  function aplicarIconeElemento(el,forcado){
    if(!el||el.dataset.shinobiIconApplied==="1")return;
    const detectado=forcado?{icone:forcado,resto:""}:detectarIcone(el.textContent);
    if(!detectado)return;
    el.dataset.shinobiIconApplied="1";
    const resto=detectado.resto;
    el.innerHTML=iconHTML(detectado.icone,"",resto||"")+(resto?`<span class="shinobiIconTexto">${resto}</span>`:"");
  }

  function aplicarIcones(root=document){
    const seletor=".navIcon,.jutsuLinhaIcone,.jutsuIcone,.jutsuGrupoIcone,.lojaGrupoIcone,.naturezaIcone,.kekkeiIcone,.itemInventarioIcone,.onlineAvatar,.danoInteligentePreviaTopo span,.inventarioAbas button>span:first-child,.jutsuCartaImagemAcoes button:first-child,.catalogoFiltrosToggleIcone,.catalogoCarregandoIcone,.catalogoEscolhaIcone";
    if(root.matches?.(seletor))aplicarIconeElemento(root);
    root.querySelectorAll?.(seletor).forEach(el=>aplicarIconeElemento(el));
    if(root.matches?.("[data-shinobi-icon]"))aplicarIconeElemento(root,root.dataset.shinobiIcon);
    root.querySelectorAll?.("[data-shinobi-icon]").forEach(el=>aplicarIconeElemento(el,el.dataset.shinobiIcon));
    atualizarProgressoNaturezas(root);
  }

  function atualizarProgressoNaturezas(root=document){
    root.querySelectorAll?.(".naturezaCard,.kekkeiNaturezaCard").forEach(card=>{
      const txt=card.querySelector(".naturezaNivelTexto,.kekkeiNivelTexto")?.textContent||"0/6";
      const m=txt.match(/(\d+)\s*\/\s*(\d+)/);
      const atual=m?Number(m[1]):0,total=m?Math.max(1,Number(m[2])):6;
      card.style.setProperty("--nivel-progresso",`${Math.max(0,Math.min(100,atual/total*100))}%`);
    });
  }

  function textoDrawer(valor,padrao=""){
    const texto=String(valor??"").trim();
    return texto||padrao;
  }

  function estadoDrawer(){
    const nome=textoDrawer(document.querySelector('[data-save="nome"]')?.value,"Ninja");
    const nivel=Math.max(1,Number(document.querySelector('[data-save="nivel"]')?.value)||1);
    const rank=textoDrawer(document.querySelector('[data-save="rank"]')?.value,"Shinobi");
    const avatar=document.getElementById("avatarPreview");
    const avatarSrc=avatar?.getAttribute("src")||"";
    const online=window.ShinobiOnline?.snapshot?.()||{};
    const usuario=online.user||null;
    const sala=online.sala||null;
    let sessaoSala=null;
    try{sessaoSala=JSON.parse(localStorage.getItem("shinobi_online_session_v1")||"null");}catch(_erro){}
    const temSala=Boolean(sala||online.salaId||sessaoSala?.roomId);
    const mestre=Boolean(usuario&&sala&&sala.masterUid===usuario.uid);
    let syncTexto="Somente neste aparelho",syncEstado="local";
    if(navigator.onLine===false){syncTexto="Offline · alterações locais";syncEstado="offline";}
    else if(usuario&&!usuario.anonymous){
      const status=window.ShinobiOnline?.statusSincronizacaoAtual?.();
      if(status?.syncStatus===1||status?.phase==="synced"){syncTexto="Dados atualizados";syncEstado="ok";}
      else {syncTexto="Sincronização disponível";syncEstado="pending";}
    }else if(usuario?.anonymous){syncTexto="Sessão local ativa";syncEstado="local";}
    const salaTexto=sala?.code?`Sala ${String(sala.code).toUpperCase()}`:temSala?"Reconectando à sala...":"Nenhuma sala ativa";
    const contaTexto=usuario&&!usuario.anonymous?(usuario.email||usuario.displayName||"Conta Google"):usuario?.anonymous?"Sessão temporária":"Nenhuma conta conectada";
    return {nome,nivel,rank,avatarSrc,usuario,sala,mestre,temSala,syncTexto,syncEstado,salaTexto,contaTexto};
  }

  function atualizarDrawerContexto(){
    const drawer=document.getElementById("shinobiNavDrawer");
    if(!drawer)return;
    const st=estadoDrawer();
    const nome=drawer.querySelector("[data-drawer-profile-name]");
    const meta=drawer.querySelector("[data-drawer-profile-meta]");
    const papel=drawer.querySelector("[data-drawer-profile-role]");
    const imagem=drawer.querySelector("[data-drawer-profile-image]");
    const fallback=drawer.querySelector("[data-drawer-profile-fallback]");
    const sync=drawer.querySelector("[data-drawer-sync-text]");
    const syncCard=drawer.querySelector("[data-drawer-sync]");
    const sala=drawer.querySelector("[data-drawer-room-current]");
    const contaConectada=drawer.querySelector("[data-drawer-connected-account-meta]");
    const salaAtualBtn=drawer.querySelector('[data-drawer-action="current-room"]');
    if(nome)nome.textContent=st.nome;
    if(meta)meta.textContent=`Nível ${st.nivel} · ${st.rank}`;
    if(papel)papel.textContent=st.mestre?"Mestre":"Jogador";
    if(imagem){
      if(st.avatarSrc){imagem.src=st.avatarSrc;imagem.hidden=false;if(fallback)fallback.hidden=true;}
      else {imagem.removeAttribute("src");imagem.hidden=true;if(fallback)fallback.hidden=false;}
    }
    if(sync)sync.textContent=st.syncTexto;
    if(syncCard)syncCard.dataset.syncState=st.syncEstado;
    if(sala)sala.textContent=st.salaTexto;
    if(contaConectada)contaConectada.textContent=st.contaTexto;
    if(salaAtualBtn){
      salaAtualBtn.disabled=!st.temSala;
      salaAtualBtn.setAttribute("aria-disabled",st.temSala?"false":"true");
      salaAtualBtn.title=st.temSala?"Abrir a sala atual":"Você ainda não está em uma sala";
    }
  }

  function fecharShinobiDrawer(){
    const drawer=document.getElementById("shinobiNavDrawer");
    document.body.classList.remove("shinobiDrawerAberto");
    drawer?.setAttribute("aria-hidden","true");
    document.querySelector(".topoMenuBtn")?.setAttribute("aria-expanded","false");
  }
  window.fecharShinobiDrawer=fecharShinobiDrawer;

  function onlineUIDisponivel(){
    return typeof window.ShinobiOnlineUI?.abrir==="function";
  }

  function aguardarOnlineUI(timeout=1800){
    if(onlineUIDisponivel()) return Promise.resolve(window.ShinobiOnlineUI);
    return new Promise(resolve=>{
      let finalizado=false;
      const concluir=()=>{
        if(finalizado)return;
        finalizado=true;
        window.removeEventListener("shinobi:online-ui-ready",aoPronto);
        resolve(onlineUIDisponivel()?window.ShinobiOnlineUI:null);
      };
      const aoPronto=()=>concluir();
      window.addEventListener("shinobi:online-ui-ready",aoPronto,{once:true});
      const inicio=performance.now();
      const verificar=()=>{
        if(onlineUIDisponivel())return concluir();
        if(performance.now()-inicio>=timeout)return concluir();
        setTimeout(verificar,60);
      };
      verificar();
    });
  }

  async function abrirPainelOnline(destino,botaoOrigem){
    // Em aparelhos móveis, fechar o drawer antes de abrir a próxima camada
    // podia deixar apenas a ficha visível caso o módulo Online ainda estivesse
    // terminando a inicialização. Agora o destino abre primeiro e o drawer só
    // fecha depois que a abertura foi confirmada.
    const botao=botaoOrigem||null;
    botao?.classList.add("shinobiDrawerAcaoCarregando");
    botao?.setAttribute("aria-busy","true");

    try{
      const ui=onlineUIDisponivel()?window.ShinobiOnlineUI:await aguardarOnlineUI();
      if(!ui){
        if(typeof window.avisoShinobi==="function"){
          await window.avisoShinobi("Recursos online","O painel de conta, sincronização e salas não terminou de carregar. Tente novamente em instantes.");
        }
        return false;
      }

      const aberto=ui.abrir(destino);
      if(aberto===false)throw new Error("O painel online recusou a abertura.");

      // O overlay Online possui z-index próprio e já está visível neste ponto.
      // Fechar no frame seguinte evita o efeito visual de "voltar para a Home".
      requestAnimationFrame(()=>fecharShinobiDrawer());
      return true;
    }catch(erro){
      console.error("Falha ao abrir destino do menu lateral:",destino,erro);
      if(typeof window.avisoShinobi==="function"){
        await window.avisoShinobi("Não foi possível abrir",erro?.message||"O recurso selecionado não pôde ser aberto.");
      }
      return false;
    }finally{
      botao?.classList.remove("shinobiDrawerAcaoCarregando");
      botao?.removeAttribute("aria-busy");
    }
  }


  function migrarConfiguracoesLegadas(drawer=document.getElementById("shinobiNavDrawer")){
    const destino=drawer?.querySelector("[data-drawer-config-legacy]");
    const menu=document.getElementById("configMenu");
    if(!destino||!menu)return;
    if(menu.parentElement!==destino)destino.appendChild(menu);
    menu.classList.add("aberto","shinobiConfigMigrado");
    menu.removeAttribute("aria-hidden");
    const host=document.getElementById("shinobiLegacyConfigHost");
    if(host)host.remove();
  }

  function alternarConfiguracoesDrawer(forcar){
    const drawer=document.getElementById("shinobiNavDrawer");
    if(!drawer)return;
    migrarConfiguracoesLegadas(drawer);
    const botao=drawer.querySelector('[data-drawer-action="settings"]');
    const conteudo=drawer.querySelector("[data-drawer-config]");
    if(!botao||!conteudo)return;
    const abrir=typeof forcar==="boolean"?forcar:conteudo.hidden;
    conteudo.hidden=!abrir;
    botao.classList.toggle("aberto",abrir);
    botao.setAttribute("aria-expanded",abrir?"true":"false");
    if(abrir){
      requestAnimationFrame(()=>{
        botao.scrollIntoView({behavior:"smooth",block:"nearest"});
      });
    }
  }
  window.abrirConfiguracoesShinobi=()=>alternarConfiguracoesDrawer(true);

  function avisoEmBreve(titulo){
    if(typeof window.avisoShinobi==="function")window.avisoShinobi(titulo,"Esta opção já está reservada na nova estrutura e será ativada em uma próxima etapa.");
  }

  function instalarDrawer(){
    const existente=document.getElementById("shinobiNavDrawer");
    if(existente){migrarConfiguracoesLegadas(existente);return existente;}
    const drawer=document.createElement("aside");
    drawer.id="shinobiNavDrawer";
    drawer.className="shinobiNavDrawer";
    drawer.setAttribute("aria-hidden","true");
    drawer.innerHTML=`
      <button type="button" class="shinobiDrawerBackdrop" aria-label="Fechar menu"></button>
      <nav class="shinobiDrawerPainel" aria-label="Menu principal">
        <div class="shinobiDrawerTopo">
          <div class="shinobiDrawerMarca">
            <strong>FICHA NINJA RPG</strong>
            <small>DISCIPLINA · ESTRATÉGIA · EVOLUÇÃO</small>
          </div>
          <span class="shinobiDrawerKanji" aria-hidden="true">忍</span>
          <button type="button" class="shinobiDrawerFechar" aria-label="Fechar menu">${iconHTML("close")}</button>
        </div>

        <section class="shinobiDrawerPerfil" aria-label="Personagem atual">
          <div class="shinobiDrawerAvatar">
            <img data-drawer-profile-image alt="Avatar do personagem" hidden>
            <span data-drawer-profile-fallback>${iconHTML("profile")}</span>
          </div>
          <div class="shinobiDrawerPerfilTexto">
            <strong data-drawer-profile-name>Ninja</strong>
            <span data-drawer-profile-meta>Nível 1 · Shinobi</span>
            <small><span class="shinobiIcon icon-profile" aria-hidden="true"></span><b data-drawer-profile-role>Jogador</b></small>
          </div>
        </section>

        <button type="button" class="shinobiDrawerSyncCard" data-drawer-action="sync" data-drawer-sync>
          <span class="shinobiDrawerItemIcon">${iconHTML("cloud")}</span>
          <span class="shinobiDrawerItemTexto"><b>Sincronização</b><small><i class="shinobiDrawerStatusDot"></i><span data-drawer-sync-text>Somente neste aparelho</span></small></span>
          <span class="shinobiDrawerChevron" aria-hidden="true">›</span>
        </button>

        <div class="shinobiDrawerGrupo">
          <h3>CONTA</h3>
          <button type="button" class="shinobiDrawerItem" data-drawer-action="account">
            <span class="shinobiDrawerItemIcon">${iconHTML("profile")}</span>
            <span class="shinobiDrawerItemTexto"><b>Minha conta</b><small>Login e autenticação</small></span>
            <span class="shinobiDrawerChevron" aria-hidden="true">›</span>
          </button>
          <button type="button" class="shinobiDrawerItem" data-drawer-action="login">
            <span class="shinobiDrawerItemIcon">${iconHTML("sync")}</span>
            <span class="shinobiDrawerItemTexto"><b>Conta conectada</b><small data-drawer-connected-account-meta>Nenhuma conta conectada</small></span>
            <span class="shinobiDrawerChevron" aria-hidden="true">›</span>
          </button>
        </div>

        <div class="shinobiDrawerGrupo">
          <h3>SALA</h3>
          <button type="button" class="shinobiDrawerItem" data-drawer-action="create-room">
            <span class="shinobiDrawerItemIcon">${iconHTML("plus")}</span>
            <span class="shinobiDrawerItemTexto"><b>Criar sala</b><small>Para iniciar uma mesa como mestre</small></span>
            <span class="shinobiDrawerChevron" aria-hidden="true">›</span>
          </button>
          <button type="button" class="shinobiDrawerItem" data-drawer-action="join-room">
            <span class="shinobiDrawerItemIcon">${iconHTML("download")}</span>
            <span class="shinobiDrawerItemTexto"><b>Entrar em sala</b><small>Junte-se a uma campanha</small></span>
            <span class="shinobiDrawerChevron" aria-hidden="true">›</span>
          </button>
          <button type="button" class="shinobiDrawerItem" data-drawer-action="current-room">
            <span class="shinobiDrawerItemIcon">${iconHTML("attributes")}</span>
            <span class="shinobiDrawerItemTexto"><b>Sala atual</b><small data-drawer-room-current>Nenhuma sala ativa</small></span>
            <span class="shinobiDrawerChevron" aria-hidden="true">›</span>
          </button>
        </div>

        <div class="shinobiDrawerGrupo shinobiDrawerConfiguracoes">
          <h3>CONFIGURAÇÕES</h3>
          <button type="button" class="shinobiDrawerItem shinobiDrawerItemExpansivel" data-drawer-action="settings" aria-expanded="false">
            <span class="shinobiDrawerItemIcon">${iconHTML("settings")}</span>
            <span class="shinobiDrawerItemTexto"><b>Configurações</b><small>Ajustes gerais do aplicativo</small></span>
            <span class="shinobiDrawerChevron" aria-hidden="true">›</span>
          </button>
          <div class="shinobiDrawerConfigConteudo" data-drawer-config hidden>
            <div class="shinobiDrawerConfigLegado" data-drawer-config-legacy></div>
            <p class="shinobiDrawerSubtitulo shinobiPersonalizacaoTitulo">PERSONALIZAÇÃO</p>
            <button type="button" class="shinobiDrawerSubitem" data-drawer-action="themes">
              <span class="shinobiDrawerItemIcon">${iconHTML("store")}</span>
              <span class="shinobiDrawerItemTexto"><b>Loja de temas</b><small>Em breve</small></span>
              <span class="shinobiDrawerChevron" aria-hidden="true">›</span>
            </button>
            <button type="button" class="shinobiDrawerSubitem" data-drawer-action="personalization">
              <span class="shinobiDrawerItemIcon">${iconHTML("image")}</span>
              <span class="shinobiDrawerItemTexto"><b>Aparência</b><small>Preferências visuais · em breve</small></span>
              <span class="shinobiDrawerChevron" aria-hidden="true">›</span>
            </button>
          </div>
        </div>

        <div class="shinobiDrawerGrupo">
          <h3>SOBRE</h3>
          <button type="button" class="shinobiDrawerItem" data-drawer-action="about">
            <span class="shinobiDrawerItemIcon">${iconHTML("notes")}</span>
            <span class="shinobiDrawerItemTexto"><b>Sobre o app</b><small>Versão e informações</small></span>
            <span class="shinobiDrawerChevron" aria-hidden="true">›</span>
          </button>
          <button type="button" class="shinobiDrawerItem" data-drawer-action="help">
            <span class="shinobiDrawerItemIcon">${iconHTML("book")}</span>
            <span class="shinobiDrawerItemTexto"><b>Ajuda</b><small>Guias e suporte</small></span>
            <span class="shinobiDrawerChevron" aria-hidden="true">›</span>
          </button>
          <button type="button" class="shinobiDrawerItem" data-drawer-action="feedback">
            <span class="shinobiDrawerItemIcon">${iconHTML("edit")}</span>
            <span class="shinobiDrawerItemTexto"><b>Feedback</b><small>Envie uma sugestão</small></span>
            <span class="shinobiDrawerChevron" aria-hidden="true">›</span>
          </button>
        </div>

        <footer class="shinobiDrawerRodape">
          <span>v${String(window.APP_VERSION||"")}</span>
          <em>Grandes ninjas também escrevem suas histórias.</em>
        </footer>
      </nav>`;
    document.body.appendChild(drawer);
    migrarConfiguracoesLegadas(drawer);
    drawer.querySelector('[data-drawer-action="settings"]')?.classList.toggle("temAtualizacao",document.documentElement.classList.contains("shinobiTemAtualizacao"));

    const backdrop=drawer.querySelector(".shinobiDrawerBackdrop");
    const painel=drawer.querySelector(".shinobiDrawerPainel");
    backdrop?.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      fecharShinobiDrawer();
    });
    drawer.querySelector(".shinobiDrawerFechar")?.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      fecharShinobiDrawer();
    });

    // O painel é uma superfície interativa própria. Impedir que pointer/touch
    // escapem daqui evita "ghost taps" no conteúdo da ficha que fica atrás.
    ["pointerdown","pointerup","touchstart","touchend"].forEach(tipo=>{
      painel?.addEventListener(tipo,event=>event.stopPropagation(),{passive:true});
    });

    painel?.addEventListener("click",event=>{
      const botao=event.target.closest("[data-drawer-action]");
      if(!botao||!painel.contains(botao))return;
      event.preventDefault();
      event.stopPropagation();

      const acao=botao.dataset.drawerAction;
      if(acao==="sync"){void abrirPainelOnline("sincronizacao",botao);return;}
      if(acao==="account"){void abrirPainelOnline("login",botao);return;}
      if(acao==="login"){void abrirPainelOnline("conta-conectada",botao);return;}
      if(acao==="create-room"){void abrirPainelOnline("criar-sala",botao);return;}
      if(acao==="join-room"){void abrirPainelOnline("entrar-sala",botao);return;}
      if(acao==="current-room"){void abrirPainelOnline("sala-atual",botao);return;}
      if(acao==="settings"){alternarConfiguracoesDrawer();return;}
      if(acao==="themes"){avisoEmBreve("Loja de temas");return;}
      if(acao==="personalization"){avisoEmBreve("Personalização");return;}
      if(acao==="about"){avisoEmBreve("Sobre o app");return;}
      if(acao==="help"){avisoEmBreve("Ajuda");return;}
      if(acao==="feedback"){avisoEmBreve("Feedback");return;}
    });

    if(!window.__shinobiDrawerTeclado){
      window.__shinobiDrawerTeclado=true;
      document.addEventListener("keydown",event=>{if(event.key==="Escape")fecharShinobiDrawer();});
    }
    if(window.ShinobiOnline?.on&&!drawer.dataset.onlineBound){
      drawer.dataset.onlineBound="1";
      ["status","pronto","auth","status-sync","sala","sala-encerrada","ficha-sincronizada"].forEach(tipo=>{
        try{window.ShinobiOnline.on(tipo,()=>atualizarDrawerContexto());}catch(_erro){}
      });
    }
    atualizarDrawerContexto();
  }

  window.toggleShinobiDrawer=function(){
    instalarDrawer();
    const aberto=!document.body.classList.contains("shinobiDrawerAberto");
    document.body.classList.toggle("shinobiDrawerAberto",aberto);
    document.getElementById("shinobiNavDrawer")?.setAttribute("aria-hidden",aberto?"false":"true");
    document.querySelector(".topoMenuBtn")?.setAttribute("aria-expanded",aberto?"true":"false");
    if(aberto)atualizarDrawerContexto();
  };

  function instalarMelhorias(){
    aplicarIcones(document);
    instalarDrawer();
    const original=window.abrirPagina;
    if(typeof original==="function"&&!original.__shinobiWrapped){
      const wrapped=function(id,botao){
        const r=original.apply(this,arguments);
        document.body.dataset.pagina=id;
        requestAnimationFrame(()=>{
          aplicarIcones(document);
          document.dispatchEvent(new CustomEvent("shinobi:pagechange",{detail:{id}}));
        });
        return r;
      };
      wrapped.__shinobiWrapped=true;window.abrirPagina=wrapped;
    }
    const ativa=document.querySelector(".pagina.ativa");
    if(ativa)document.body.dataset.pagina=ativa.id;
  }

  document.addEventListener("DOMContentLoaded",()=>{
    instalarMelhorias();
    const pendentes=new Set();
    let frameIcones=0;
    const agendarIcones=()=>{
      if(frameIcones) return;
      frameIcones=requestAnimationFrame(()=>{
        frameIcones=0;
        const raizes=[...pendentes];
        pendentes.clear();
        raizes.forEach(raiz=>{
          if(raiz?.isConnected) aplicarIcones(raiz);
        });
      });
    };
    const obs=new MutationObserver(muts=>{
      for(const mut of muts){
        for(const node of mut.addedNodes){
          if(node.nodeType===1) pendentes.add(node);
        }
      }
      if(pendentes.size) agendarIcones();
    });
    obs.observe(document.body,{childList:true,subtree:true});
  });
})();
