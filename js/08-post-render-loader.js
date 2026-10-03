/* EKO 2.5.8.156 — carregamento progressivo do online e atualizador.
 * Em aparelhos antigos, a ficha fica responsiva primeiro e o stack online
 * entra sob demanda ou quando o navegador estiver ocioso.
 */
(function(){
  "use strict";
  if(window.__shinobiPostRenderLoaderV258156) return;
  window.__shinobiPostRenderLoaderV258156=true;

  var versao=String(document.documentElement.getAttribute("data-app-version")||window.APP_VERSION||"2.5.8.156");
  var modoLegado=window.SHINOBI_LEGACY_MODE===true;
  var onlinePromise=null;
  var onlinePronto=false;

  function caminhoCompativel(caminho){
    var valor=String(caminho||"");
    if(!modoLegado) return valor;
    if(valor.indexOf("js/")===0) return "js-legacy/"+valor.slice(3);
    if(valor==="vendor/qrcode-local.js") return "vendor/qrcode-local-legacy.js";
    return valor;
  }

  function url(caminho){
    return caminho+"?v="+encodeURIComponent(versao);
  }

  function carregarScript(caminho,aoCarregar,aoFalhar){
    var caminhoReal=caminhoCompativel(caminho);
    var seletor='script[data-shinobi-lazy="'+caminho.replace(/"/g,'')+'"]';
    var existente=document.querySelector(seletor);
    if(existente){
      if(existente.getAttribute("data-carregado")==="1"){
        if(typeof aoCarregar==="function") setTimeout(aoCarregar,0);
      }else if(typeof aoCarregar==="function"){
        existente.addEventListener("load",aoCarregar,{once:true});
      }
      return;
    }
    var script=document.createElement("script");
    script.src=url(caminhoReal);
    script.async=false;
    script.setAttribute("data-shinobi-lazy",caminho);
    script.onload=function(){
      script.setAttribute("data-carregado","1");
      if(typeof aoCarregar==="function") aoCarregar();
    };
    script.onerror=function(erro){
      console.warn("Módulo pós-render indisponível: "+caminho,erro);
      if(typeof aoFalhar==="function") aoFalhar(erro);
    };
    document.head.appendChild(script);
  }

  function carregarSequencia(lista,indice,concluido,falhou){
    var i=Number(indice||0);
    if(i>=lista.length){ if(typeof concluido==="function") concluido(); return; }
    carregarScript(lista[i],function(){
      carregarSequencia(lista,i+1,concluido,falhou);
    },function(erro){
      if(typeof falhou==="function") falhou(lista[i],erro);
    });
  }

  function iniciarOnline(){
    if(onlinePronto&&window.ShinobiOnlineUI) return Promise.resolve(window.ShinobiOnlineUI);
    if(onlinePromise) return onlinePromise;

    window.__shinobiOnlineStackLoading=true;
    var arquivos=[
      "js/18-online-config.js",
      "js/19-character-identity.js",
      "js/19-backup-manager-utils.js",
      "js/19-online-core.js",
      "js/19-realtime-fields-utils.js",
      "js/19-realtime-sync-engine.js",
      "vendor/qrcode-local.js",
      "js/20-online-ui.js",
      "js/21-online-hooks.js"
    ];

    onlinePromise=new Promise(function(resolve,reject){
      carregarSequencia(arquivos,0,function(){
        onlinePronto=true;
        window.__shinobiOnlineStackLoading=false;
        try{window.dispatchEvent(new CustomEvent("shinobi:online-stack-ready"));}catch(_erro){}
        resolve(window.ShinobiOnlineUI||true);
      },function(caminho,erro){
        window.__shinobiOnlineStackLoading=false;
        onlinePromise=null;
        console.warn("Online ficou desativado sem afetar a ficha. Falha em:",caminho,erro);
        try{window.dispatchEvent(new CustomEvent("shinobi:online-stack-error",{detail:{arquivo:caminho}}));}catch(_erro){}
        reject(erro||new Error("Falha ao carregar recursos online."));
      });
    });
    return onlinePromise;
  }

  window.ShinobiOnlineLoader={
    ensureReady:iniciarOnline,
    isReady:function(){return onlinePronto===true||Boolean(window.ShinobiOnlineUI);},
    isLoading:function(){return window.__shinobiOnlineStackLoading===true;}
  };

  function iniciarAtualizador(){
    carregarScript("js/08-update.js",null,function(erro){
      console.warn("Atualizador indisponível. A ficha continua funcionando.",erro);
    });
  }

  function agendarOnlineLegado(){
    /* No J7/engines antigas, parsear o stack online inteiro durante a entrada
       deixa o menu e as páginas pesados. Damos prioridade à interação e ainda
       ativamos a sincronização automaticamente após um período ocioso. */
    var disparar=function(){iniciarOnline().catch(function(){});};
    setTimeout(function(){
      if(onlinePronto||onlinePromise) return;
      if(typeof window.requestIdleCallback==="function"){
        window.requestIdleCallback(disparar,{timeout:5000});
      }else setTimeout(disparar,1200);
    },6500);
  }

  function depoisDaRenderizacao(){
    if(modoLegado){
      agendarOnlineLegado();
      setTimeout(iniciarAtualizador,13000);
    }else{
      setTimeout(function(){iniciarOnline().catch(function(){});},150);
      setTimeout(iniciarAtualizador,3500);
    }
  }

  if(window.ShinobiAppReady&&typeof window.ShinobiAppReady.executar==="function"){
    window.ShinobiAppReady.executar(depoisDaRenderizacao);
  }else if(document.readyState==="complete"){
    setTimeout(depoisDaRenderizacao,1200);
  }else{
    window.addEventListener("load",function(){setTimeout(depoisDaRenderizacao,1200);},{once:true});
  }
})();
