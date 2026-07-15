/* Shinobi 1.8.0 — interface viva da Área de Batalha. */
(function(){
  "use strict";

  if(window.__batalhaVivaV180) return;
  window.__batalhaVivaV180=true;

  const TITULOS={
    dano:"Receber dano",
    cura:"Recuperar pontos de vida",
    chakra:"Gastar Chakra",
    "recuperar-chakra":"Recuperar Chakra"
  };

  function numero(valor,padrao=0){
    const n=Number(valor);
    return Number.isFinite(n)?n:padrao;
  }

  function limitar(valor,min,max){
    return Math.min(max,Math.max(min,valor));
  }

  function campo(id){
    return document.getElementById(id);
  }

  function campoSalvo(nome){
    return document.querySelector(`[data-save="${nome}"]`);
  }

  function atualizarRecurso(config){
    const atual=Math.max(0,numero(campoSalvo(config.atual)?.value,0));
    const maximo=Math.max(0,numero(campoSalvo(config.maximo)?.value,0));
    const percentual=maximo>0?limitar((atual/maximo)*100,0,100):(atual>0?100:0);
    const valorView=campo(config.valorView);
    const maxView=campo(config.maxView);
    const barra=campo(config.barra);
    const card=barra?.closest(".recursoBatalhaCard");
    const progress=barra?.parentElement;

    if(valorView) valorView.textContent=String(atual);
    if(maxView) maxView.textContent=String(maximo);
    if(barra) barra.style.width=`${percentual}%`;
    if(progress){
      progress.setAttribute("aria-valuemax",String(maximo));
      progress.setAttribute("aria-valuenow",String(atual));
    }
    if(card){
      card.classList.toggle("recursoCritico",config.atual==="pv"&&maximo>0&&percentual<=25);
    }
  }

  window.atualizarPainelBatalhaVivo=function(){
    atualizarRecurso({
      atual:"pv",
      maximo:"pvMax",
      valorView:"pvView",
      maxView:"pvMaxView",
      barra:"pvBatalhaBarra"
    });

    atualizarRecurso({
      atual:"chakra",
      maximo:"chakraMax",
      valorView:"chakraView",
      maxView:"chakraMaxView",
      barra:"chakraBatalhaBarra"
    });
  };

  window.abrirAcaoBatalha=function(tipo){
    const painel=campo("acaoBatalhaPainel");
    const titulo=campo("acaoBatalhaTitulo");
    if(!painel||!TITULOS[tipo]) return;

    const estavaAberto=!painel.hidden&&painel.dataset.acaoAtual===tipo;
    if(estavaAberto){
      window.fecharAcaoBatalha();
      return;
    }

    painel.hidden=false;
    painel.dataset.acaoAtual=tipo;
    if(titulo) titulo.textContent=TITULOS[tipo];

    painel.querySelectorAll("[data-acao-batalha]").forEach(form=>{
      form.hidden=form.dataset.acaoBatalha!==tipo;
    });

    requestAnimationFrame(()=>{
      painel.scrollIntoView({behavior:"smooth",block:"nearest"});
      painel.querySelector("[data-acao-batalha]:not([hidden]) input")?.focus({preventScroll:true});
    });
  };

  window.fecharAcaoBatalha=function(){
    const painel=campo("acaoBatalhaPainel");
    if(!painel) return;
    painel.hidden=true;
    painel.dataset.acaoAtual="";
    painel.querySelectorAll("[data-acao-batalha]").forEach(form=>form.hidden=true);
  };

  window.ajustarValorBatalha=function(id,delta){
    const input=campo(id);
    if(!input) return;
    input.value=String(Math.max(0,numero(input.value,0)+numero(delta,0)));
    input.dispatchEvent(new Event("input",{bubbles:true}));
  };

  window.definirValorBatalha=function(id,valor){
    const input=campo(id);
    if(!input) return;
    input.value=String(Math.max(0,numero(valor,0)));
    input.dispatchEvent(new Event("input",{bubbles:true}));
  };

  window.curarPVPersonalizado=async function(){
    const valor=Math.max(0,numero(campo("curaBatalha")?.value,0));
    if(valor<=0) return;
    if(typeof window.curarPV==="function"){
      await window.curarPV(valor);
      window.atualizarPainelBatalhaVivo();
    }
  };

  window.recuperarChakraPersonalizado=async function(){
    const valor=Math.max(0,numero(campo("recuperacaoChakraBatalha")?.value,0));
    if(valor<=0) return;
    if(typeof window.recuperarChakra==="function"){
      await window.recuperarChakra(valor);
      window.atualizarPainelBatalhaVivo();
    }
  };

  function envolverAtualizacaoPlacar(){
    if(typeof window.atualizarPlacar!=="function"||window.__placarComPainelVivoV180) return;
    window.__placarComPainelVivoV180=true;
    const base=window.atualizarPlacar;
    window.atualizarPlacar=function(){
      const resultado=base.apply(this,arguments);
      window.atualizarPainelBatalhaVivo();
      return resultado;
    };
  }

  function envolverAcoes(){
    ["aplicarDano","gastarChakra","curarPV","recuperarChakra","resetarBatalha"].forEach(nome=>{
      const original=window[nome];
      const chave=`__batalhaVivaWrapper_${nome}`;
      if(typeof original!=="function"||window[chave]) return;
      window[chave]=true;
      window[nome]=async function(){
        const resultado=await original.apply(this,arguments);
        window.atualizarPainelBatalhaVivo();
        return resultado;
      };
    });
  }

  function iniciar(){
    envolverAtualizacaoPlacar();
    envolverAcoes();
    window.atualizarPainelBatalhaVivo();

    document.addEventListener("input",evento=>{
      if(evento.target?.matches('[data-save="pv"],[data-save="pvMax"],[data-save="chakra"],[data-save="chakraMax"]')){
        window.atualizarPainelBatalhaVivo();
      }
    });

    document.addEventListener("change",evento=>{
      if(evento.target?.matches('[data-save="pv"],[data-save="pvMax"],[data-save="chakra"],[data-save="chakraMax"]')){
        window.atualizarPainelBatalhaVivo();
      }
    });
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",iniciar,{once:true});
  }else{
    iniciar();
  }

  window.addEventListener("pageshow",()=>{
    envolverAtualizacaoPlacar();
    envolverAcoes();
    window.atualizarPainelBatalhaVivo();
  });
})();
