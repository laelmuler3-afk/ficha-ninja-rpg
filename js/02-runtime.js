/* Shinobi 1.3.2 — runtime limpo e otimizado. */

/* ===== Salvamento imediato e seguro ===== */
(function(){
  if(window.__performanceV3Ativa) return;
  window.__performanceV3Ativa = true;

  window.salvarImediatoV3 = function(){
    if(
      typeof estado === "undefined" ||
      typeof CHAVE === "undefined"
    ){
      return false;
    }

    try{
      /*
       * Captura o valor mais recente dos campos antes de ocultar,
       * fechar ou atualizar o aplicativo.
       */
      if(typeof sincronizarEstadoDosCampos === "function"){
        sincronizarEstadoDosCampos();
      }

      /*
       * Usa a rotina ativa de persistência. Depois que o módulo de
       * imagens é carregado, essa função respeita o IndexedDB e evita
       * recolocar imagens pesadas no localStorage.
       */
      if(typeof persistirEstadoLocal === "function"){
        return persistirEstadoLocal();
      }

      localStorage.setItem(CHAVE, JSON.stringify(estado));
      return true;
    }catch(err){
      console.warn("Erro ao salvar imediatamente:", err);
      return false;
    }
  };

  document.addEventListener("visibilitychange", function(){
    if(document.visibilityState === "hidden"){
      window.salvarImediatoV3();
    }
  });

  window.addEventListener("pagehide", function(){
    window.salvarImediatoV3();
  });
})();

/* ===== Inventário: usar item com modal Shinobi ===== */
async function usarItemInventario(i){
  garantirInventarioItens();

  const item = estado.inventarioItens[i];
  if(!item) return;

  const nome = item.nome || "Item";
  const atual = Number(item.quantidade || 0);

  if(atual <= 0){
    await avisoShinobi(
      "Sem quantidade",
      "Esse item está sem quantidade disponível."
    );
    return;
  }

  let quantidade = prompt(
    `Usar quantos de "${nome}"?`,
    "1"
  );

  if(quantidade === null) return;

  quantidade = parseInt(quantidade || "1", 10);

  if(isNaN(quantidade) || quantidade < 1){
    quantidade = 1;
  }

  if(quantidade > atual){
    await avisoShinobi(
      "Quantidade insuficiente",
      `Você só tem ${atual} desse item.`
    );
    return;
  }

  const ok = await confirmarUsoAcao(
    "item",
    nome,
    `Quantidade: ${quantidade}\nRestará: ${atual - quantidade}`
  );

  if(!ok) return;

  item.quantidade = atual - quantidade;
  salvarInventarioItens();

  if(typeof registrarLog === "function"){
    registrarLog(`Usou ${quantidade}x ${nome}.`);
  }

  renderizarInventario();
}

/* ===== Notas: autoaltura com limite seguro ===== */
function ajustarAlturaTextareaNotaSeguro(el){
  if(!el) return;

  const isMobile = window.matchMedia(
    "(max-width:600px)"
  ).matches;

  const limiteTela =
    window.innerHeight * (isMobile ? 0.56 : 0.62);

  const limiteFinal = Math.min(
    limiteTela,
    isMobile ? 460 : 520
  );

  el.style.height = "auto";

  const alturaConteudo = el.scrollHeight + 8;
  const novaAltura = Math.min(
    alturaConteudo,
    limiteFinal
  );

  el.style.height = novaAltura + "px";
  el.style.overflowY =
    alturaConteudo > limiteFinal ? "auto" : "hidden";
}

function ajustarNotasAbertasSeguro(){
  document
    .querySelectorAll(
      "#anotacoes .topicoNotaConteudo textarea"
    )
    .forEach(ajustarAlturaTextareaNotaSeguro);
}

document.addEventListener("input", function(evento){
  const campo = evento.target;

  if(
    campo &&
    campo.matches(
      "#anotacoes .topicoNotaConteudo textarea"
    )
  ){
    ajustarAlturaTextareaNotaSeguro(campo);
  }
});

let timerAjusteNotasRuntime = null;

window.addEventListener("resize", function(){
  if(timerAjusteNotasRuntime){
    clearTimeout(timerAjusteNotasRuntime);
  }

  timerAjusteNotasRuntime = setTimeout(function(){
    timerAjusteNotasRuntime = null;
    ajustarNotasAbertasSeguro();
  }, 120);
});

/*
 * Toda criação ou reabertura dos tópicos passa por esta função.
 * Um único ajuste após a renderização substitui os listeners e
 * wrappers duplicados que existiam anteriormente.
 */
if(
  typeof renderizarTopicosNotas === "function" &&
  !window.__renderNotasAlturaLimitadaV3
){
  window.__renderNotasAlturaLimitadaV3 = true;

  const renderizarTopicosNotasBaseV3 =
    renderizarTopicosNotas;

  window.renderizarTopicosNotas = function(){
    const resultado =
      renderizarTopicosNotasBaseV3.apply(
        this,
        arguments
      );

    setTimeout(ajustarNotasAbertasSeguro, 100);
    return resultado;
  };
}
