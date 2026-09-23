/* EKO 2.5.8.75 — carrega atualização e online somente após a ficha estar utilizável. */
(function(){
  "use strict";
  if(window.__shinobiPostRenderLoaderV25875) return;
  window.__shinobiPostRenderLoaderV25875=true;

  var versao=String(document.documentElement.getAttribute("data-app-version")||window.APP_VERSION||"2.5.8.75");

  function url(caminho){
    return caminho+"?v="+encodeURIComponent(versao);
  }

  function carregarScript(caminho,aoCarregar,aoFalhar){
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
    script.src=url(caminho);
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
    window.__shinobiOnlineStackLoading=true;
    var arquivos=[
      "js/18-online-config.js",
      "js/19-character-identity.js",
      "js/19-online-core.js",
      "js/19-realtime-fields-utils.js",
      "js/19-realtime-sync-engine.js",
      "vendor/qrcode-local.js",
      "js/20-online-ui.js",
      "js/21-online-hooks.js"
    ];
    carregarSequencia(arquivos,0,function(){
      window.__shinobiOnlineStackLoading=false;
      try{window.dispatchEvent(new CustomEvent("shinobi:online-stack-ready"));}catch(_erro){}
    },function(caminho,erro){
      window.__shinobiOnlineStackLoading=false;
      console.warn("Online ficou desativado sem afetar a ficha. Falha em:",caminho,erro);
      try{window.dispatchEvent(new CustomEvent("shinobi:online-stack-error",{detail:{arquivo:caminho}}));}catch(_erro){}
    });
  }

  function iniciarAtualizador(){
    carregarScript("js/08-update.js",null,function(erro){
      console.warn("Atualizador indisponível. A ficha continua funcionando.",erro);
    });
  }

  function depoisDaRenderizacao(){
    /* Realtime recebe prioridade após a renderização; o update espera mais para
       não disputar rede/CPU com login e sincronização em aparelhos lentos. */
    setTimeout(iniciarOnline,150);
    setTimeout(iniciarAtualizador,3500);
  }

  if(window.ShinobiAppReady&&typeof window.ShinobiAppReady.executar==="function"){
    window.ShinobiAppReady.executar(depoisDaRenderizacao);
  }else if(document.readyState==="complete"){
    setTimeout(depoisDaRenderizacao,1200);
  }else{
    window.addEventListener("load",function(){setTimeout(depoisDaRenderizacao,1200);},{once:true});
  }
})();
