/* Shinobi 1.3.0 — arquivo modular gerado preservando a ordem do app original. */

/* ===== Performance v3: salvamento seguro e tarefas leves ===== */
(function(){
  if(window.__performanceV3Ativa) return;
  window.__performanceV3Ativa = true;

  const idle = window.requestIdleCallback || function(fn){ return setTimeout(fn, 120); };
  const cancelIdle = window.cancelIdleCallback || clearTimeout;

  let salvarTimerV3 = null;
  let salvarIdleV3 = null;

  window.salvarLeveV3 = function(){
    if(typeof estado === 'undefined' || typeof CHAVE === 'undefined') return;

    if(salvarTimerV3) clearTimeout(salvarTimerV3);
    if(salvarIdleV3) cancelIdle(salvarIdleV3);

    salvarTimerV3 = setTimeout(function(){
      salvarIdleV3 = idle(function(){
        try{
          localStorage.setItem(CHAVE, JSON.stringify(estado));
        }catch(err){
          console.warn('Armazenamento cheio ou indisponível:', err);
          if(!window.__alertaStorageCheioV3){
            window.__alertaStorageCheioV3 = true;
            setTimeout(function(){
              alert('O armazenamento do app está quase cheio. Se estiver usando muitas imagens nos jutsus, tente remover algumas imagens ou usar imagens menores.');
              window.__alertaStorageCheioV3 = false;
            }, 80);
          }
        }
      });
    }, 180);
  };

  window.salvarImediatoV3 = function(){
    if(typeof estado === 'undefined' || typeof CHAVE === 'undefined') return;
    try{
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    }catch(err){
      console.warn('Erro ao salvar imediatamente:', err);
    }
  };

  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'hidden'){
      window.salvarImediatoV3();
    }
  });

  window.addEventListener('pagehide', function(){
    window.salvarImediatoV3();
  });
})();

/* Bloco antigo de autoaltura removido: a versão segura abaixo é a ativa. */

/* ===== Inventário: usar item com modal Shinobi ===== */
async function usarItemInventario(i){
  garantirInventarioItens();

  const item=estado.inventarioItens[i];
  if(!item)return;

  const nome=item.nome||"Item";
  const atual=Number(item.quantidade||0);

  if(atual<=0){
    await avisoShinobi("Sem quantidade", "Esse item está sem quantidade disponível.");
    return;
  }

  let quantidade=prompt(`Usar quantos de "${nome}"?`,"1");
  if(quantidade===null)return;

  quantidade=parseInt(quantidade||"1",10);
  if(isNaN(quantidade)||quantidade<1)quantidade=1;

  if(quantidade>atual){
    await avisoShinobi("Quantidade insuficiente",`Você só tem ${atual} desse item.`);
    return;
  }

  const ok=await confirmarUsoAcao("item",nome,`Quantidade: ${quantidade}\nRestará: ${atual-quantidade}`);
  if(!ok)return;

  item.quantidade=atual-quantidade;
  salvarInventarioItens();

  if(typeof registrarLog==="function")registrarLog(`Usou ${quantidade}x ${nome}.`);

  renderizarInventario();
}

/* ===== Jutsus: reforço visual por elemento após renderização ===== */
function aplicarCoresCartasJutsu(){
  const cards=document.querySelectorAll('#jutsus .jutsuListaCard');
  cards.forEach(card=>{
    const texto=(card.innerText||'').toLowerCase();

    const mapa=[
      ['katon','jutsu-katon'],
      ['fogo','jutsu-katon'],
      ['suiton','jutsu-suiton'],
      ['água','jutsu-suiton'],
      ['agua','jutsu-suiton'],
      ['raiton','jutsu-raiton'],
      ['raio','jutsu-raiton'],
      ['fuuton','jutsu-fuuton'],
      ['vento','jutsu-fuuton'],
      ['doton','jutsu-doton'],
      ['terra','jutsu-doton'],
      ['yinton','jutsu-yin'],
      ['yin','jutsu-yin'],
      ['youton','jutsu-yang'],
      ['yang','jutsu-yang']
    ];

    if(!Array.from(card.classList).some(c=>c.startsWith('jutsu-'))){
      const achado=mapa.find(([termo])=>texto.includes(termo));
      card.classList.add(achado?achado[1]:'jutsu-neutro');
    }

    if(card.style.backgroundImage && card.style.backgroundImage !== 'none'){
      card.classList.add('temImagemJutsu');
    }
  });
}

if(typeof renderizarJutsus==='function' && !window.__renderizarJutsusCoresElemento){
  window.__renderizarJutsusCoresElemento=true;
  const renderizarJutsusOriginalCores=renderizarJutsus;
  window.renderizarJutsus=function(){
    const r=renderizarJutsusOriginalCores.apply(this,arguments);
    setTimeout(aplicarCoresCartasJutsu,40);
    return r;
  };
}

document.addEventListener('DOMContentLoaded',()=>setTimeout(aplicarCoresCartasJutsu,180));
window.addEventListener('pageshow',()=>setTimeout(aplicarCoresCartasJutsu,180));

/* ===== Notas: autoaltura com limite seguro no pergaminho ===== */
function ajustarAlturaTextareaNotaSeguro(el){
  if(!el) return;

  const isMobile = window.matchMedia('(max-width:600px)').matches;
  const limiteTela = window.innerHeight * (isMobile ? 0.56 : 0.62);
  const limiteFinal = Math.min(limiteTela, isMobile ? 460 : 520);

  el.style.height = 'auto';

  const alturaConteudo = el.scrollHeight + 8;
  const novaAltura = Math.min(alturaConteudo, limiteFinal);

  el.style.height = novaAltura + 'px';
  el.style.overflowY = alturaConteudo > limiteFinal ? 'auto' : 'hidden';
}

function ajustarNotasAbertasSeguro(){
  document.querySelectorAll('#anotacoes .topicoNotaConteudo textarea').forEach(ajustarAlturaTextareaNotaSeguro);
}

document.addEventListener('input', function(ev){
  if(ev.target && ev.target.matches('#anotacoes .topicoNotaConteudo textarea')){
    ajustarAlturaTextareaNotaSeguro(ev.target);
  }
});

window.addEventListener('resize', function(){
  setTimeout(ajustarNotasAbertasSeguro, 100);
});

document.addEventListener('DOMContentLoaded', function(){
  setTimeout(ajustarNotasAbertasSeguro, 250);
});

window.addEventListener('pageshow', function(){
  setTimeout(ajustarNotasAbertasSeguro, 250);
});

if(typeof alternarTopicoNota === 'function' && !window.__notasAlturaLimitadaV2){
  window.__notasAlturaLimitadaV2 = true;
  const alternarTopicoNotaBaseV2 = alternarTopicoNota;
  window.alternarTopicoNota = function(i){
    const r = alternarTopicoNotaBaseV2.apply(this, arguments);
    setTimeout(ajustarNotasAbertasSeguro, 120);
    return r;
  };
}

if(typeof renderizarTopicosNotas === 'function' && !window.__renderNotasAlturaLimitadaV2){
  window.__renderNotasAlturaLimitadaV2 = true;
  const renderizarTopicosNotasBaseV2 = renderizarTopicosNotas;
  window.renderizarTopicosNotas = function(){
    const r = renderizarTopicosNotasBaseV2.apply(this, arguments);
    setTimeout(ajustarNotasAbertasSeguro, 120);
    return r;
  };
}

/* Rotinas antigas de Base64 removidas: IndexedDB V5 é o sistema ativo. */
