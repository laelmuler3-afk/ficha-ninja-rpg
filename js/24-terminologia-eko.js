/* ==========================================================
   SHINOBI 2.5.8.11 — terminologia visual EKO
   Rebatiza "Chakra" apenas na apresentação da interface.
   IDs, funções, chaves salvas e regras continuam usando "chakra"
   internamente para preservar compatibilidade com fichas existentes.
   ========================================================== */
(function(){
  "use strict";

  const IGNORAR = new Set(["SCRIPT","STYLE","NOSCRIPT","TEXTAREA"]);

  function traduzirTexto(valor){
    if(typeof valor!=="string" || !valor) return valor;
    return valor
      .replace(/\bChakra\b/g,"EKO")
      .replace(/\bchakra\b/g,"EKO")
      .replace(/\bCH\b/g,"EKO");
  }

  function deveIgnorar(elemento){
    if(!elemento || !(elemento instanceof Element)) return false;
    if(IGNORAR.has(elemento.tagName)) return true;
    /* Não altera o conteúdo escrito pelo jogador nas notas. */
    if(elemento.closest("#anotacoes, #notas")) return true;
    return false;
  }

  function traduzirAtributos(elemento){
    if(!(elemento instanceof Element) || deveIgnorar(elemento)) return;
    ["aria-label","title","placeholder"].forEach(atributo=>{
      if(!elemento.hasAttribute(atributo)) return;
      const atual=elemento.getAttribute(atributo);
      const novo=traduzirTexto(atual);
      if(novo!==atual) elemento.setAttribute(atributo,novo);
    });
  }

  function traduzirNo(raiz){
    if(!raiz) return;

    if(raiz.nodeType===Node.TEXT_NODE){
      const pai=raiz.parentElement;
      if(deveIgnorar(pai)) return;
      const atual=raiz.nodeValue;
      const novo=traduzirTexto(atual);
      if(novo!==atual) raiz.nodeValue=novo;
      return;
    }

    if(!(raiz instanceof Element) && raiz!==document) return;
    if(raiz instanceof Element && deveIgnorar(raiz)) return;

    if(raiz instanceof Element) traduzirAtributos(raiz);

    const walker=document.createTreeWalker(
      raiz,
      NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,
      {
        acceptNode(no){
          if(no.nodeType===Node.ELEMENT_NODE && deveIgnorar(no)){
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let no=walker.currentNode;
    while(no){
      if(no.nodeType===Node.TEXT_NODE){
        const atual=no.nodeValue;
        const novo=traduzirTexto(atual);
        if(novo!==atual) no.nodeValue=novo;
      }else if(no.nodeType===Node.ELEMENT_NODE){
        traduzirAtributos(no);
      }
      no=walker.nextNode();
    }
  }

  function instalarDialogosTraduzidos(){
    const alerta=window.alert?.bind(window);
    const confirmar=window.confirm?.bind(window);
    const perguntar=window.prompt?.bind(window);

    if(alerta) window.alert=(mensagem)=>alerta(traduzirTexto(String(mensagem??"")));
    if(confirmar) window.confirm=(mensagem)=>confirmar(traduzirTexto(String(mensagem??"")));
    if(perguntar) window.prompt=(mensagem,padrao)=>perguntar(traduzirTexto(String(mensagem??"")),padrao);
  }

  function iniciar(){
    instalarDialogosTraduzidos();
    traduzirNo(document.body);

    const observer=new MutationObserver(mutacoes=>{
      for(const mutacao of mutacoes){
        if(mutacao.type==="characterData"){
          traduzirNo(mutacao.target);
          continue;
        }
        mutacao.addedNodes.forEach(traduzirNo);
      }
    });

    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    window.__shinobiTerminologiaEko={traduzirTexto,traduzirNo};
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",iniciar,{once:true});
  }else{
    iniciar();
  }
})();
