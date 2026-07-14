/* Shinobi 1.3.8 — atualização do aplicativo revisada e otimizada. */

/* ===== SHINOBI: SERVICE WORKER E ATUALIZAÇÃO CONTROLADA ===== */
(function(){
  "use strict";

  if(window.__shinobiAtualizacaoSWAtiva) return;
  window.__shinobiAtualizacaoSWAtiva = true;

  if(!("serviceWorker" in navigator)) return;

  const SW_URL = "./service-worker.js";
  const INTERVALO_VERIFICACAO = 60 * 60 * 1000;
  const INTERVALO_MINIMO = 60 * 1000;

  let registroAtual = null;
  let recarregando = false;
  let verificacaoEmAndamento = false;
  let ultimaVerificacao = 0;
  let timerVerificacao = null;
  let timerPeriodico = null;
  let timerRecargaSegura = null;

  function obterAvisoAtualizacao(){
    let aviso = document.getElementById(
      "shinobiAvisoAtualizacao"
    );

    if(aviso) return aviso;

    aviso = document.createElement("section");
    aviso.id = "shinobiAvisoAtualizacao";
    aviso.className = "shinobiAvisoAtualizacao";
    aviso.hidden = true;
    aviso.setAttribute("role", "status");
    aviso.setAttribute("aria-live", "polite");

    aviso.innerHTML = `
      <div class="shinobiAvisoAtualizacao__texto">
        <strong>Nova versão disponível</strong>
        <span>Atualize para receber as correções mais recentes.</span>
      </div>

      <button
        id="shinobiBotaoAtualizar"
        class="shinobiAvisoAtualizacao__botao"
        type="button"
      >
        Atualizar agora
      </button>
    `;

    document.body.appendChild(aviso);
    return aviso;
  }

  function salvarFichaAntesDeAtualizar(){
    try{
      if(typeof window.salvarImediatoV3 === "function"){
        const salvou = window.salvarImediatoV3();
        if(salvou !== false) return true;
      }

      if(typeof window.salvar === "function"){
        window.salvar();
        return true;
      }
    }catch(erro){
      console.warn(
        "Não foi possível executar o salvamento antes da atualização.",
        erro
      );
    }

    return false;
  }

  function aplicarAtualizacao(){
    const worker = registroAtual?.waiting;
    if(!worker) return;

    salvarFichaAntesDeAtualizar();

    const aviso = obterAvisoAtualizacao();
    const botao = aviso.querySelector(
      "#shinobiBotaoAtualizar"
    );

    if(botao){
      botao.disabled = true;
      botao.textContent = "Atualizando...";
      botao.setAttribute("aria-busy", "true");
    }

    worker.postMessage({type: "SKIP_WAITING"});

    if(timerRecargaSegura){
      clearTimeout(timerRecargaSegura);
    }

    timerRecargaSegura = window.setTimeout(function(){
      if(!recarregando){
        salvarFichaAntesDeAtualizar();
        window.location.reload();
      }
    }, 8000);
  }

  function mostrarAvisoAtualizacao(registro){
    if(!registro?.waiting) return;

    registroAtual = registro;

    const aviso = obterAvisoAtualizacao();
    const botao = aviso.querySelector(
      "#shinobiBotaoAtualizar"
    );

    if(aviso.hidden){
      aviso.hidden = false;
      window.requestAnimationFrame(function(){
        aviso.classList.add("visivel");
      });
    }

    if(!botao || botao.dataset.configurado === "1"){
      return;
    }

    botao.dataset.configurado = "1";
    botao.addEventListener("click", aplicarAtualizacao);
  }

  function acompanharRegistro(registro){
    if(!registro) return;

    if(registro.waiting && navigator.serviceWorker.controller){
      mostrarAvisoAtualizacao(registro);
    }

    registro.addEventListener("updatefound", function(){
      const workerNovo = registro.installing;
      if(!workerNovo) return;

      workerNovo.addEventListener("statechange", function(){
        if(
          workerNovo.state === "installed" &&
          navigator.serviceWorker.controller
        ){
          mostrarAvisoAtualizacao(registro);
        }
      });
    });
  }

  async function verificarAtualizacao(forcar = false){
    if(
      !registroAtual ||
      verificacaoEmAndamento ||
      !navigator.onLine
    ){
      return;
    }

    const agora = Date.now();

    if(
      !forcar &&
      agora - ultimaVerificacao < INTERVALO_MINIMO
    ){
      return;
    }

    verificacaoEmAndamento = true;
    ultimaVerificacao = agora;

    try{
      await registroAtual.update();

      if(
        registroAtual.waiting &&
        navigator.serviceWorker.controller
      ){
        mostrarAvisoAtualizacao(registroAtual);
      }
    }catch(erro){
      console.warn(
        "Não foi possível verificar uma atualização agora.",
        erro
      );
    }finally{
      verificacaoEmAndamento = false;
    }
  }

  function agendarVerificacao(atraso = 800, forcar = false){
    if(timerVerificacao){
      clearTimeout(timerVerificacao);
    }

    timerVerificacao = window.setTimeout(function(){
      timerVerificacao = null;
      verificarAtualizacao(forcar);
    }, atraso);
  }

  function agendarVerificacaoPeriodica(){
    if(timerPeriodico){
      clearTimeout(timerPeriodico);
    }

    timerPeriodico = window.setTimeout(function ciclo(){
      timerPeriodico = null;

      if(document.visibilityState === "visible"){
        verificarAtualizacao();
      }

      agendarVerificacaoPeriodica();
    }, INTERVALO_VERIFICACAO);
  }

  async function registrarServiceWorker(){
    try{
      const registro = await navigator.serviceWorker.register(
        SW_URL,
        {
          scope: "./",
          updateViaCache: "none"
        }
      );

      registroAtual = registro;
      acompanharRegistro(registro);

      agendarVerificacao(1200, true);
      agendarVerificacaoPeriodica();
    }catch(erro){
      console.error(
        "Falha ao registrar o service worker do Shinobi.",
        erro
      );
    }
  }

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    function(){
      if(recarregando) return;

      recarregando = true;
      salvarFichaAntesDeAtualizar();

      if(timerRecargaSegura){
        clearTimeout(timerRecargaSegura);
        timerRecargaSegura = null;
      }

      window.location.reload();
    }
  );

  document.addEventListener(
    "visibilitychange",
    function(){
      if(document.visibilityState === "visible"){
        agendarVerificacao();
      }
    }
  );

  window.addEventListener(
    "online",
    function(){
      agendarVerificacao();
    }
  );

  if(document.readyState === "complete"){
    registrarServiceWorker();
  }else{
    window.addEventListener(
      "load",
      registrarServiceWorker,
      {once: true}
    );
  }
})();
