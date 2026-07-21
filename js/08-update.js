/* Ficha Ninja 2.3.4 — atualizador PWA sem avisos repetidos. */
(function(){
  "use strict";

  if(window.__fichaNinjaAtualizadorV234) return;
  window.__fichaNinjaAtualizadorV234=true;

  const versaoDocumento=String(document.documentElement.dataset.appVersion||"").trim();
  const versaoScript=(()=>{
    try{
      return new URL(document.currentScript?.src||"",window.location.href).searchParams.get("v")||"";
    }catch(_erro){
      return "";
    }
  })();

  /* O HTML é a fonte canônica da versão da tela carregada. Usar primeiro a
     versão do próprio script causava o ciclo 2.3.2 → 2.3.3 da versão anterior. */
  const APP_VERSION=String(versaoDocumento||versaoScript||"2.3.4");
  document.documentElement.dataset.appVersion=APP_VERSION;
  window.APP_VERSION=APP_VERSION;

  const SW_URL="./service-worker.js";
  const VERSION_URL="./version.json";
  const INTERVALO_PERIODICO=5*60*1000;
  const INTERVALO_MINIMO=15*1000;
  const LIMITE_REPETICOES_PUBLICACAO=8;

  let registroAtual=null;
  let verificando=false;
  let aplicando=false;
  let recarregando=false;
  let recarregarAoTrocarControlador=false;
  let ultimaVerificacao=0;
  let timerPeriodico=null;
  let timerRecarga=null;
  let tentativasPublicacao=0;
  let versaoRemotaConhecida="";
  let ultimoErroInstalacao="";

  function compararVersoes(a,b){
    const partesA=String(a||"").split(/[.-]/).map(v=>Number(v)||0);
    const partesB=String(b||"").split(/[.-]/).map(v=>Number(v)||0);
    const tamanho=Math.max(partesA.length,partesB.length);
    for(let i=0;i<tamanho;i+=1){
      const av=partesA[i]||0;
      const bv=partesB[i]||0;
      if(av>bv) return 1;
      if(av<bv) return -1;
    }
    return 0;
  }

  function ehVersaoNova(versao){
    return Boolean(versao&&compararVersoes(versao,APP_VERSION)>0);
  }

  function limparMarcadorRecargaDaUrl(){
    try{
      const url=new URL(window.location.href);
      if(!url.searchParams.has("_shinobi_reload")) return;
      url.searchParams.delete("_shinobi_reload");
      window.history.replaceState(null,"",`${url.pathname}${url.search}${url.hash}`);
    }catch(_erro){}
  }

  function salvarFicha(){
    try{
      if(typeof window.salvarImediatoV3==="function"){
        const resultado=window.salvarImediatoV3();
        if(resultado!==false) return true;
      }
      if(typeof window.salvar==="function"){
        window.salvar();
        return true;
      }
    }catch(erro){
      console.warn("Não foi possível salvar antes da atualização.",erro);
    }
    return false;
  }

  function recarregarAplicacao(){
    if(recarregando) return;
    recarregando=true;
    salvarFicha();
    try{
      const url=new URL(window.location.href);
      url.searchParams.set("_shinobi_reload",String(Date.now()));
      window.location.replace(url.href);
    }catch(_erro){
      window.location.reload();
    }
  }

  limparMarcadorRecargaDaUrl();

  function obterPainel(){
    let painel=document.getElementById("shinobiAtualizacaoPainel");
    if(painel) return painel;
    const menu=document.getElementById("configMenu")||document.body;
    painel=document.createElement("section");
    painel.id="shinobiAtualizacaoPainel";
    painel.className="shinobiAtualizacaoPainel";
    painel.setAttribute("aria-label","Atualização do aplicativo");
    painel.innerHTML=`
      <div class="shinobiAtualizacaoPainel__linha">
        <span class="shinobiAtualizacaoPainel__rotulo">Versão instalada</span>
        <strong id="shinobiVersaoInstalada" class="shinobiAtualizacaoPainel__versao"></strong>
      </div>
      <div id="shinobiStatusAtualizacao" class="shinobiAtualizacaoPainel__status" role="status" aria-live="polite"></div>
      <button id="shinobiVerificarAtualizacao" class="shinobiAtualizacaoPainel__botao" type="button">Verificar atualização</button>
    `;
    menu.appendChild(painel);
    return painel;
  }

  function configurarPainel(){
    const painel=obterPainel();
    const versao=painel.querySelector("#shinobiVersaoInstalada");
    const botao=painel.querySelector("#shinobiVerificarAtualizacao");
    if(versao) versao.textContent=`v${APP_VERSION}`;
    if(botao&&!botao.dataset.configurado){
      botao.dataset.configurado="1";
      botao.addEventListener("click",()=>verificarAtualizacao({manual:true,forcar:true}));
    }
  }

  function definirStatus(texto,estado="normal"){
    configurarPainel();
    const status=document.getElementById("shinobiStatusAtualizacao");
    if(status){
      status.textContent=texto;
      status.dataset.estado=estado;
    }
  }

  function marcarIconeAtualizacao(ativo){
    document.querySelector(".configBtn")?.classList.toggle("temAtualizacao",Boolean(ativo));
  }

  function obterAviso(){
    let aviso=document.getElementById("shinobiAvisoAtualizacao");
    if(aviso) return aviso;
    aviso=document.createElement("section");
    aviso.id="shinobiAvisoAtualizacao";
    aviso.className="shinobiAvisoAtualizacao";
    aviso.hidden=true;
    aviso.setAttribute("role","status");
    aviso.setAttribute("aria-live","polite");
    aviso.innerHTML=`
      <div class="shinobiAvisoAtualizacao__texto">
        <strong id="shinobiAvisoAtualizacaoTitulo">Verificando atualização</strong>
        <span id="shinobiAvisoAtualizacaoMensagem">Aguarde um instante.</span>
      </div>
      <button id="shinobiBotaoAtualizar" class="shinobiAvisoAtualizacao__botao" type="button" disabled>Preparando...</button>
    `;
    document.body.appendChild(aviso);
    aviso.querySelector("#shinobiBotaoAtualizar")?.addEventListener("click",()=>{
      const acao=aviso.dataset.acao||"aplicar";
      if(acao==="recarregar"){
        recarregarAplicacao();
        return;
      }
      if(acao==="verificar"){
        tentativasPublicacao=0;
        ultimoErroInstalacao="";
        ocultarAviso();
        verificarAtualizacao({manual:true,forcar:true});
        return;
      }
      aplicarAtualizacao();
    });
    return aviso;
  }

  function mostrarAviso({titulo,mensagem,pronto=false,botaoTexto,acao="aplicar"}={}){
    const aviso=obterAviso();
    aviso.querySelector("#shinobiAvisoAtualizacaoTitulo").textContent=titulo||"Nova versão encontrada";
    aviso.querySelector("#shinobiAvisoAtualizacaoMensagem").textContent=mensagem||"Preparando os arquivos da atualização.";
    const botao=aviso.querySelector("#shinobiBotaoAtualizar");
    if(botao){
      botao.disabled=!pronto;
      botao.textContent=botaoTexto||(pronto?"Atualizar agora":"Preparando...");
      botao.setAttribute("aria-busy",pronto?"false":"true");
    }
    aviso.dataset.acao=acao;
    aviso.hidden=false;
    requestAnimationFrame(()=>aviso.classList.add("visivel"));
    marcarIconeAtualizacao(true);
  }

  function ocultarAviso(){
    const aviso=document.getElementById("shinobiAvisoAtualizacao");
    if(aviso){
      aviso.classList.remove("visivel");
      window.setTimeout(()=>{
        if(!aviso.classList.contains("visivel")) aviso.hidden=true;
      },220);
    }
    marcarIconeAtualizacao(false);
  }

  function obterVersaoWorker(worker){
    return new Promise(resolve=>{
      if(!worker){
        resolve("");
        return;
      }
      const canal=new MessageChannel();
      const timer=window.setTimeout(()=>resolve(""),1800);
      canal.port1.onmessage=evento=>{
        clearTimeout(timer);
        resolve(String(evento.data?.version||""));
      };
      try{
        worker.postMessage({type:"GET_VERSION"},[canal.port2]);
      }catch(_erro){
        clearTimeout(timer);
        resolve("");
      }
    });
  }

  async function anunciarWorkerEsperando(){
    const worker=registroAtual?.waiting;
    if(!worker||!navigator.serviceWorker.controller) return false;
    const versaoWorker=await obterVersaoWorker(worker);
    const versao=versaoWorker||versaoRemotaConhecida;
    if(!ehVersaoNova(versao)) return false;
    tentativasPublicacao=0;
    definirStatus(`Atualização v${versao} pronta para instalar.`,"pronto");
    mostrarAviso({
      titulo:`Versão v${versao} pronta`,
      mensagem:"Os arquivos foram preparados. A ficha será salva antes de atualizar.",
      pronto:true,
      botaoTexto:"Atualizar agora",
      acao:"aplicar"
    });
    return true;
  }

  function ativarWorkerSemRecarregar(worker){
    if(!worker) return;
    try{worker.postMessage({type:"SKIP_WAITING"});}catch(_erro){}
  }

  function aplicarAtualizacao(){
    const worker=registroAtual?.waiting;
    if(aplicando) return;
    if(!worker){
      definirStatus("A atualização ainda não está pronta. Tente verificar novamente.","erro");
      mostrarAviso({
        titulo:"Atualização não concluída",
        mensagem:"O navegador não encontrou os arquivos preparados. Tente novamente.",
        pronto:true,
        botaoTexto:"Tentar novamente",
        acao:"verificar"
      });
      return;
    }
    aplicando=true;
    recarregarAoTrocarControlador=true;
    salvarFicha();
    definirStatus("Aplicando a atualização...","pronto");
    mostrarAviso({
      titulo:"Atualizando a Ficha Ninja",
      mensagem:"Salvando a ficha e abrindo a nova versão.",
      pronto:false,
      botaoTexto:"Atualizando..."
    });
    worker.postMessage({type:"SKIP_WAITING"});
    clearTimeout(timerRecarga);
    timerRecarga=window.setTimeout(()=>{
      if(!recarregando) recarregarAplicacao();
    },10000);
  }

  async function buscarVersaoRemota(){
    const resposta=await fetch(`${VERSION_URL}?_=${Date.now()}`,{
      cache:"no-store",
      credentials:"same-origin",
      headers:{"Cache-Control":"no-cache"}
    });
    if(!resposta.ok) throw new Error(`version.json respondeu ${resposta.status}`);
    const dados=await resposta.json();
    return String(dados?.version||"").trim();
  }

  function acompanharWorker(worker){
    if(!worker||worker.__fichaNinjaAcompanhadoV234) return;
    worker.__fichaNinjaAcompanhadoV234=true;
    worker.addEventListener("statechange",async()=>{
      if(worker.state==="installed"){
        if(!navigator.serviceWorker.controller){
          definirStatus(`Versão v${APP_VERSION} disponível offline.`,"pronto");
          ocultarAviso();
          return;
        }
        const anunciou=await anunciarWorkerEsperando();
        if(!anunciou&&!ehVersaoNova(versaoRemotaConhecida)){
          ativarWorkerSemRecarregar(registroAtual?.waiting);
          ocultarAviso();
        }
      }
      if(worker.state==="redundant"&&ehVersaoNova(versaoRemotaConhecida)){
        definirStatus("A atualização não terminou. Tentaremos novamente.","erro");
        mostrarAviso({
          titulo:"Não foi possível preparar a atualização",
          mensagem:"A conexão pode ter oscilado. O app tentará novamente automaticamente.",
          pronto:false,
          botaoTexto:"Tentando novamente..."
        });
        window.setTimeout(()=>verificarAtualizacao({forcar:true}),5000);
      }
    });
  }

  function acompanharRegistro(registro){
    if(!registro||registro.__fichaNinjaAcompanhadoV234) return;
    registro.__fichaNinjaAcompanhadoV234=true;
    if(registro.installing) acompanharWorker(registro.installing);
    registro.addEventListener("updatefound",()=>{
      ultimoErroInstalacao="";
      const worker=registro.installing;
      acompanharWorker(worker);
      if(!navigator.serviceWorker.controller){
        definirStatus("Preparando funcionamento offline...","normal");
        return;
      }
      if(ehVersaoNova(versaoRemotaConhecida)){
        definirStatus("Nova versão encontrada. Preparando arquivos...","normal");
        mostrarAviso({
          titulo:`Preparando versão v${versaoRemotaConhecida}`,
          mensagem:"Baixando os arquivos necessários. Você pode continuar usando a ficha.",
          pronto:false,
          botaoTexto:"Preparando..."
        });
      }
    });
  }

  async function solicitarAtualizacaoDoRegistro(){
    if(!registroAtual) return;
    await registroAtual.update();
    if(registroAtual.installing) acompanharWorker(registroAtual.installing);
  }

  function reagendarPublicacao(){
    if(!ehVersaoNova(versaoRemotaConhecida)) return;
    if(tentativasPublicacao>=LIMITE_REPETICOES_PUBLICACAO){
      const detalhe=ultimoErroInstalacao
        ?`Não foi possível baixar ${ultimoErroInstalacao}.`
        :"O navegador não concluiu a preparação dos arquivos.";
      definirStatus("A atualização não terminou. Use o botão para tentar novamente.","erro");
      mostrarAviso({
        titulo:"Atualização não concluída",
        mensagem:`${detalhe} Sua ficha continua salva.`,
        pronto:true,
        botaoTexto:"Tentar novamente",
        acao:"verificar"
      });
      return;
    }
    tentativasPublicacao+=1;
    window.setTimeout(()=>verificarAtualizacao({forcar:true}),5000);
  }

  async function verificarAtualizacao({manual=false,forcar=false}={}){
    if(!("serviceWorker" in navigator)){
      definirStatus("Este navegador não oferece atualização offline.","erro");
      return;
    }
    if(!navigator.onLine){
      definirStatus("Sem internet. A versão instalada continua disponível offline.","erro");
      return;
    }
    if(verificando) return;
    const agora=Date.now();
    if(!forcar&&agora-ultimaVerificacao<INTERVALO_MINIMO) return;

    verificando=true;
    ultimaVerificacao=agora;
    const botao=document.getElementById("shinobiVerificarAtualizacao");
    if(botao){
      botao.disabled=true;
      botao.textContent="Verificando...";
    }
    definirStatus("Verificando atualização...","normal");

    try{
      const remota=await buscarVersaoRemota();
      versaoRemotaConhecida=remota;
      if(ehVersaoNova(remota)){
        definirStatus(`Versão v${remota} encontrada. Preparando...`,"normal");
        mostrarAviso({
          titulo:`Nova versão v${remota}`,
          mensagem:"Preparando os arquivos. O botão será liberado quando estiver tudo pronto.",
          pronto:false,
          botaoTexto:"Preparando..."
        });
        await solicitarAtualizacaoDoRegistro();
        if(await anunciarWorkerEsperando()) return;

        const versaoAtiva=await obterVersaoWorker(navigator.serviceWorker.controller);
        if(versaoAtiva&&compararVersoes(versaoAtiva,remota)>=0){
          tentativasPublicacao=0;
          definirStatus(`Versão v${remota} pronta. Recarregue para abrir os arquivos novos.`,"pronto");
          mostrarAviso({
            titulo:`Versão v${remota} pronta`,
            mensagem:"O sistema foi atualizado em segundo plano. Recarregue uma vez para abrir a versão nova.",
            pronto:true,
            botaoTexto:"Recarregar agora",
            acao:"recarregar"
          });
        }else{
          reagendarPublicacao();
        }
        return;
      }

      await solicitarAtualizacaoDoRegistro();
      const waiting=registroAtual?.waiting;
      if(waiting){
        const versaoWaiting=await obterVersaoWorker(waiting);
        if(ehVersaoNova(versaoWaiting)){
          await anunciarWorkerEsperando();
          return;
        }
        /* Worker da mesma versão que ficou aguardando por uma instalação anterior:
           ativa silenciosamente e não exibe novamente o botão de recarga. */
        ativarWorkerSemRecarregar(waiting);
      }
      tentativasPublicacao=0;
      ocultarAviso();
      definirStatus(`Você está na versão mais recente: v${APP_VERSION}.`,"pronto");
    }catch(erro){
      console.warn("Falha ao verificar atualização.",erro);
      definirStatus(
        manual
          ?"Não foi possível conferir agora. Verifique sua conexão e tente novamente."
          :`Versão instalada: v${APP_VERSION}.`,
        manual?"erro":"normal"
      );
    }finally{
      verificando=false;
      if(botao){
        botao.disabled=false;
        botao.textContent="Verificar atualização";
      }
    }
  }

  async function iniciar(){
    configurarPainel();
    definirStatus("Iniciando verificação...","normal");
    if(!("serviceWorker" in navigator)){
      definirStatus("Atualização offline indisponível neste navegador.","erro");
      return;
    }
    try{
      registroAtual=await navigator.serviceWorker.register(SW_URL,{
        scope:"./",
        updateViaCache:"none"
      });
      acompanharRegistro(registroAtual);
      await verificarAtualizacao({forcar:true});
      clearInterval(timerPeriodico);
      timerPeriodico=window.setInterval(()=>{
        if(document.visibilityState==="visible") verificarAtualizacao();
      },INTERVALO_PERIODICO);
    }catch(erro){
      console.error("Falha ao registrar o service worker.",erro);
      definirStatus("Não foi possível iniciar o atualizador. A ficha continua funcionando.","erro");
    }
  }

  navigator.serviceWorker?.addEventListener("message",evento=>{
    const dados=evento.data||{};
    if(dados.type==="SW_INSTALL_PROGRESS"){
      const versao=String(dados.version||versaoRemotaConhecida||"");
      if(!ehVersaoNova(versao)) return;
      versaoRemotaConhecida=versao;
      const atual=Number(dados.loaded||0);
      const total=Number(dados.total||0);
      const progresso=total?` (${atual}/${total})`:"";
      definirStatus(`Preparando atualização${progresso}...`,"normal");
      mostrarAviso({
        titulo:`Preparando versão v${versao}`,
        mensagem:`Baixando arquivos necessários${progresso}. Você pode continuar usando a ficha.`,
        pronto:false,
        botaoTexto:"Preparando..."
      });
    }
    if(dados.type==="SW_INSTALL_ERROR"){
      const versao=String(dados.version||versaoRemotaConhecida||"");
      if(!ehVersaoNova(versao)) return;
      try{
        const url=new URL(String(dados.url||""),window.location.href);
        ultimoErroInstalacao=url.pathname.split("/").pop()||"um arquivo";
      }catch(_erro){
        ultimoErroInstalacao="um arquivo";
      }
      definirStatus(`Falha ao baixar ${ultimoErroInstalacao}.`,"erro");
      mostrarAviso({
        titulo:"Falha ao preparar a atualização",
        mensagem:`Não foi possível baixar ${ultimoErroInstalacao}. Verifique a conexão e tente novamente.`,
        pronto:true,
        botaoTexto:"Tentar novamente",
        acao:"verificar"
      });
    }
  });

  navigator.serviceWorker?.addEventListener("controllerchange",()=>{
    clearTimeout(timerRecarga);
    if(recarregarAoTrocarControlador||aplicando){
      recarregarAplicacao();
      return;
    }
    /* A ativação silenciosa de um worker da mesma versão não deve recarregar a
       página e nem reabrir o aviso. */
    ocultarAviso();
    definirStatus(`Você está na versão mais recente: v${APP_VERSION}.`,"pronto");
  });

  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible") verificarAtualizacao();
  });
  window.addEventListener("online",()=>verificarAtualizacao({forcar:true}));
  window.addEventListener("pageshow",()=>verificarAtualizacao());

  window.ShinobiAtualizacao={
    verificar:()=>verificarAtualizacao({manual:true,forcar:true}),
    aplicar:aplicarAtualizacao,
    versao:APP_VERSION
  };

  iniciar();
})();
