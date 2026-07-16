/* Shinobi 1.9.4 — atualizador observável com verificação sem cache. */
(function(){
  "use strict";

  if(window.__shinobiAtualizadorV194) return;
  window.__shinobiAtualizadorV194 = true;

  const APP_VERSION = String(
    document.documentElement.dataset.appVersion || "1.9.4"
  );
  const SW_URL = `./service-worker.js?v=${encodeURIComponent(APP_VERSION)}`;
  const VERSION_URL = "./version.json";
  const INTERVALO_PERIODICO = 5 * 60 * 1000;
  const INTERVALO_MINIMO = 15 * 1000;
  const LIMITE_REPETICOES_PUBLICACAO = 12;

  let registroAtual = null;
  let verificando = false;
  let aplicando = false;
  let recarregando = false;
  let ultimaVerificacao = 0;
  let timerPeriodico = null;
  let timerRecarga = null;
  let tentativasPublicacao = 0;
  let versaoRemotaConhecida = "";

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

  function obterPainel(){
    let painel=document.getElementById("shinobiAtualizacaoPainel");
    if(painel) return painel;

    const menu=document.getElementById("configMenu")||document.body;
    painel=document.createElement("section");
    painel.id="shinobiAtualizacaoPainel";
    painel.className="shinobiAtualizacaoPainel";
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

    aviso.querySelector("#shinobiBotaoAtualizar")?.addEventListener("click",aplicarAtualizacao);
    return aviso;
  }

  function mostrarAviso({titulo,mensagem,pronto=false,botaoTexto}={}){
    const aviso=obterAviso();
    const tituloEl=aviso.querySelector("#shinobiAvisoAtualizacaoTitulo");
    const mensagemEl=aviso.querySelector("#shinobiAvisoAtualizacaoMensagem");
    const botao=aviso.querySelector("#shinobiBotaoAtualizar");

    if(tituloEl) tituloEl.textContent=titulo||"Nova versão encontrada";
    if(mensagemEl) mensagemEl.textContent=mensagem||"Preparando os arquivos da atualização.";
    if(botao){
      botao.disabled=!pronto;
      botao.textContent=botaoTexto||(pronto?"Atualizar agora":"Preparando...");
      botao.setAttribute("aria-busy",pronto?"false":"true");
    }

    aviso.hidden=false;
    requestAnimationFrame(()=>aviso.classList.add("visivel"));
    marcarIconeAtualizacao(true);
  }

  function ocultarAviso(){
    const aviso=document.getElementById("shinobiAvisoAtualizacao");
    if(!aviso) return;
    aviso.classList.remove("visivel");
    window.setTimeout(()=>{
      if(!aviso.classList.contains("visivel")) aviso.hidden=true;
    },220);
    marcarIconeAtualizacao(false);
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

  function workerEsperando(){
    return registroAtual?.waiting||null;
  }

  function anunciarAtualizacaoPronta(){
    if(!workerEsperando()) return false;

    tentativasPublicacao=0;
    const versao=versaoRemotaConhecida||"nova";
    definirStatus(`Atualização ${versao==="nova"?"":`v${versao} `}pronta para instalar.`,"pronto");
    mostrarAviso({
      titulo:"Nova versão disponível",
      mensagem:"Os arquivos já foram preparados. A ficha será salva antes de atualizar.",
      pronto:true,
      botaoTexto:"Atualizar agora"
    });
    return true;
  }

  function aplicarAtualizacao(){
    const worker=workerEsperando();
    if(!worker||aplicando) return;

    aplicando=true;
    salvarFicha();
    definirStatus("Aplicando a atualização...","pronto");
    mostrarAviso({
      titulo:"Atualizando o Shinobi",
      mensagem:"Salvando a ficha e abrindo a nova versão.",
      pronto:false,
      botaoTexto:"Atualizando..."
    });

    worker.postMessage({type:"SKIP_WAITING"});

    clearTimeout(timerRecarga);
    timerRecarga=window.setTimeout(()=>{
      if(!recarregando){
        salvarFicha();
        window.location.reload();
      }
    },10000);
  }

  async function buscarVersaoRemota(){
    const separador=VERSION_URL.includes("?")?"&":"?";
    const resposta=await fetch(`${VERSION_URL}${separador}_=${Date.now()}`,{
      cache:"no-store",
      credentials:"same-origin",
      headers:{"Cache-Control":"no-cache"}
    });

    if(!resposta.ok) throw new Error(`version.json respondeu ${resposta.status}`);
    const dados=await resposta.json();
    return String(dados?.version||"").trim();
  }

  function acompanharWorker(worker){
    if(!worker||worker.__shinobiAcompanhadoV194) return;
    worker.__shinobiAcompanhadoV194=true;

    worker.addEventListener("statechange",()=>{
      if(worker.state==="installed"){
        if(navigator.serviceWorker.controller){
          anunciarAtualizacaoPronta();
        }else{
          definirStatus(`Versão v${APP_VERSION} instalada.`,"pronto");
        }
      }

      if(worker.state==="redundant"){
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
    if(!registro||registro.__shinobiAcompanhadoV194) return;
    registro.__shinobiAcompanhadoV194=true;

    if(registro.waiting&&navigator.serviceWorker.controller){
      anunciarAtualizacaoPronta();
    }
    if(registro.installing) acompanharWorker(registro.installing);

    registro.addEventListener("updatefound",()=>{
      const worker=registro.installing;
      acompanharWorker(worker);
      definirStatus("Nova versão encontrada. Preparando arquivos...","normal");
      mostrarAviso({
        titulo:"Nova versão encontrada",
        mensagem:"Baixando os arquivos necessários. Você pode continuar usando a ficha.",
        pronto:false,
        botaoTexto:"Preparando..."
      });
    });
  }

  async function solicitarAtualizacaoDoRegistro(){
    if(!registroAtual) return;
    await registroAtual.update();
    if(!anunciarAtualizacaoPronta()&&registroAtual.installing){
      acompanharWorker(registroAtual.installing);
    }
  }

  function reagendarPublicacao(){
    if(tentativasPublicacao>=LIMITE_REPETICOES_PUBLICACAO){
      definirStatus("A nova versão ainda está sendo publicada. Tente novamente em alguns minutos.","erro");
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
      const existeNova=remota&&compararVersoes(remota,APP_VERSION)>0;

      if(existeNova){
        definirStatus(`Versão v${remota} encontrada. Preparando...`,"normal");
        mostrarAviso({
          titulo:`Nova versão v${remota}`,
          mensagem:"Preparando os arquivos. O botão será liberado quando estiver tudo pronto.",
          pronto:false,
          botaoTexto:"Preparando..."
        });
        await solicitarAtualizacaoDoRegistro();
        if(!anunciarAtualizacaoPronta()) reagendarPublicacao();
      }else{
        await solicitarAtualizacaoDoRegistro();
        if(!anunciarAtualizacaoPronta()){
          tentativasPublicacao=0;
          ocultarAviso();
          definirStatus(`Você está na versão mais recente: v${APP_VERSION}.`,"pronto");
        }
      }
    }catch(erro){
      console.warn("Falha ao verificar atualização.",erro);
      try{
        await solicitarAtualizacaoDoRegistro();
        if(!anunciarAtualizacaoPronta()){
          definirStatus(
            manual
              ? "Não foi possível conferir agora. Verifique sua conexão e tente novamente."
              : `Versão instalada: v${APP_VERSION}.`,
            manual?"erro":"normal"
          );
        }
      }catch(segundoErro){
        console.warn("Falha ao atualizar o registro do service worker.",segundoErro);
        definirStatus("Não foi possível verificar agora. A ficha continua salva e funcional.","erro");
      }
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

      if(registroAtual.waiting&&navigator.serviceWorker.controller){
        anunciarAtualizacaoPronta();
      }else{
        verificarAtualizacao({forcar:true});
      }

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
      versaoRemotaConhecida=String(dados.version||versaoRemotaConhecida||"");
      const atual=Number(dados.loaded||0);
      const total=Number(dados.total||0);
      const progresso=total?` (${atual}/${total})`:"";
      definirStatus(`Preparando atualização${progresso}...`,"normal");
      mostrarAviso({
        titulo:`Preparando versão v${versaoRemotaConhecida||"nova"}`,
        mensagem:`Baixando arquivos necessários${progresso}. Você pode continuar usando a ficha.`,
        pronto:false,
        botaoTexto:"Preparando..."
      });
    }

    if(dados.type==="SW_INSTALL_ERROR"){
      definirStatus("Falha ao baixar um arquivo da atualização. Tentaremos novamente.","erro");
    }
  });

  navigator.serviceWorker?.addEventListener("controllerchange",()=>{
    if(recarregando) return;
    recarregando=true;
    salvarFicha();
    clearTimeout(timerRecarga);
    window.location.reload();
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

  // O script é defer: o DOM já foi analisado. Não esperamos todas as imagens carregarem.
  iniciar();
})();
