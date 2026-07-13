/* Shinobi 1.3.0 — arquivo modular gerado preservando a ordem do app original. */

/* ===== SHINOBI: SERVICE WORKER E ATUALIZAÇÃO CONTROLADA ===== */
(function(){
  "use strict";

  if(window.__shinobiAtualizacaoSWAtiva) return;
  window.__shinobiAtualizacaoSWAtiva = true;

  if(!("serviceWorker" in navigator)) return;

  const SW_URL = "./service-worker.js";
  const INTERVALO_VERIFICACAO = 60 * 60 * 1000;

  let registroAtual = null;
  let recarregando = false;
  let verificacaoEmAndamento = false;

  function obterAvisoAtualizacao(){
    let aviso = document.getElementById("shinobiAvisoAtualizacao");
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
        window.salvarImediatoV3();
        return;
      }

      if(typeof window.salvar === "function"){
        window.salvar();
      }
    }catch(erro){
      console.warn(
        "Não foi possível executar o salvamento antes da atualização.",
        erro
      );
    }
  }

  function mostrarAvisoAtualizacao(registro){
    if(!registro || !registro.waiting) return;

    registroAtual = registro;

    const aviso = obterAvisoAtualizacao();
    const botao = aviso.querySelector("#shinobiBotaoAtualizar");

    aviso.hidden = false;

    window.requestAnimationFrame(function(){
      aviso.classList.add("visivel");
    });

    if(!botao || botao.dataset.configurado === "1") return;

    botao.dataset.configurado = "1";

    botao.addEventListener("click", function(){
      if(!registroAtual || !registroAtual.waiting) return;

      salvarFichaAntesDeAtualizar();

      botao.disabled = true;
      botao.textContent = "Atualizando...";

      registroAtual.waiting.postMessage({
        type: "SKIP_WAITING"
      });

      window.setTimeout(function(){
        if(!recarregando){
          window.location.reload();
        }
      }, 8000);
    });
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

  async function verificarAtualizacao(){
    if(
      !registroAtual ||
      verificacaoEmAndamento ||
      !navigator.onLine
    ){
      return;
    }

    verificacaoEmAndamento = true;

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

  async function registrarServiceWorker(){
    try{
      const registro = await navigator.serviceWorker.register(SW_URL, {
        scope: "./",
        updateViaCache: "none"
      });

      registroAtual = registro;
      acompanharRegistro(registro);

      await navigator.serviceWorker.ready;
      await verificarAtualizacao();

      window.setInterval(
        verificarAtualizacao,
        INTERVALO_VERIFICACAO
      );
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
      window.location.reload();
    }
  );

  document.addEventListener(
    "visibilitychange",
    function(){
      if(document.visibilityState === "visible"){
        verificarAtualizacao();
      }
    }
  );

  window.addEventListener("online", verificarAtualizacao);

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
