(function(){
  "use strict";

  const ICON_BASE="assets/icons/";
  const EMOJI_ICON={
    "⚙":"settings","⚙️":"settings","👤":"profile","💪":"attributes","🔥":"fire","🥷":"profile","🎒":"inventory","📜":"notes",
    "⭐":"bonus","❤️":"heart","❤":"heart","🔵":"chakra","⚡":"lightning","🌪":"wind","🌪️":"wind","💧":"water","🪨":"earth",
    "🧬":"dna","⚔":"sword","⚔️":"sword","👊":"fist","👁":"eye","👁️":"eye","💰":"wallet","🏪":"store","✴":"shuriken","✴️":"shuriken",
    "🔪":"sword","🪡":"jutsu","🧵":"inventory","🍙":"inventory","💣":"fire","🏷":"notes","🏷️":"notes","🧪":"chakra","🩹":"heal",
    "🗡":"sword","🗡️":"sword","🎭":"profile","🌱":"leaf","🌑":"eye","☀":"bonus","☀️":"bonus","✨":"bonus","🖼":"image","🖼️":"image",
    "🔎":"target","☷":"menu","🍥":"jutsu","🃏":"jutsu","✍":"edit","✍️":"edit","🥋":"fist","🌀":"jutsu","🏹":"target",
    "🧰":"inventory","💎":"bonus","☠":"bonus","☠️":"bonus","🔒":"shield","🩸":"heart","😵":"eye"
  };

  function nomeSeguro(nome){return String(nome||"bonus").toLowerCase().replace(/[^a-z0-9-]/g,"")||"bonus";}
  function iconHTML(nome,extra="",label=""){
    const seguro=nomeSeguro(nome);
    const aria=label?` role="img" aria-label="${String(label).replace(/"/g,"&quot;")}"`:' aria-hidden="true"';
    if(seguro==="fire") return `<span class="shinobiEmojiIcon icon-fire-emoji${extra?` ${extra}`:""}"${aria}>🔥</span>`;
    return `<span class="shinobiIcon icon-${seguro}${extra?` ${extra}`:""}"${aria}></span>`;
  }
  window.iconeShinobi=iconHTML;
  window.shinobiIcon=iconHTML;

  function detectarIcone(texto){
    const limpo=String(texto||"").trim();
    for(const [emoji,icone] of Object.entries(EMOJI_ICON)){
      if(limpo.startsWith(emoji))return {icone,resto:limpo.slice(emoji.length).trim()};
    }
    return null;
  }

  function aplicarIconeElemento(el,forcado){
    if(!el||el.dataset.shinobiIconApplied==="1")return;
    const detectado=forcado?{icone:forcado,resto:""}:detectarIcone(el.textContent);
    if(!detectado)return;
    el.dataset.shinobiIconApplied="1";
    const resto=detectado.resto;
    el.innerHTML=iconHTML(detectado.icone,"",resto||"")+(resto?`<span class="shinobiIconTexto">${resto}</span>`:"");
  }

  function aplicarIcones(root=document){
    const seletor=".navIcon,.jutsuLinhaIcone,.jutsuIcone,.jutsuGrupoIcone,.lojaGrupoIcone,.naturezaIcone,.kekkeiIcone,.itemInventarioIcone,.onlineAvatar,.danoInteligentePreviaTopo span,.inventarioAbas button>span:first-child,.jutsuCartaImagemAcoes button:first-child,.catalogoFiltrosToggleIcone,.catalogoCarregandoIcone,.catalogoEscolhaIcone";
    if(root.matches?.(seletor))aplicarIconeElemento(root);
    root.querySelectorAll?.(seletor).forEach(el=>aplicarIconeElemento(el));
    if(root.matches?.("[data-shinobi-icon]"))aplicarIconeElemento(root,root.dataset.shinobiIcon);
    root.querySelectorAll?.("[data-shinobi-icon]").forEach(el=>aplicarIconeElemento(el,el.dataset.shinobiIcon));
    atualizarProgressoNaturezas(root);
  }

  function atualizarProgressoNaturezas(root=document){
    root.querySelectorAll?.(".naturezaCard,.kekkeiNaturezaCard").forEach(card=>{
      const txt=card.querySelector(".naturezaNivelTexto,.kekkeiNivelTexto")?.textContent||"0/6";
      const m=txt.match(/(\d+)\s*\/\s*(\d+)/);
      const atual=m?Number(m[1]):0,total=m?Math.max(1,Number(m[2])):6;
      card.style.setProperty("--nivel-progresso",`${Math.max(0,Math.min(100,atual/total*100))}%`);
    });
  }

  function instalarDrawer(){
    if(document.getElementById("shinobiNavDrawer"))return;
    const drawer=document.createElement("aside");
    drawer.id="shinobiNavDrawer";
    drawer.className="shinobiNavDrawer";
    drawer.setAttribute("aria-hidden","true");
    const itens=[
      ["identidade","profile","Ninja"],["atributos","attributes","Atributos"],["jutsus","jutsu","Jutsus"],
      ["batalha","battle","Batalha"],["inventario","inventory","Inventário"],["anotacoes","notes","Notas"]
    ];
    drawer.innerHTML=`<button type="button" class="shinobiDrawerBackdrop" aria-label="Fechar menu"></button><nav class="shinobiDrawerPainel"><header><span>FICHA NINJA</span><button type="button" class="shinobiDrawerFechar">${iconHTML("close")}</button></header>${itens.map(([id,icon,label])=>`<button type="button" data-page="${id}">${iconHTML(icon)}<span>${label}</span></button>`).join("")}</nav>`;
    document.body.appendChild(drawer);
    const fechar=()=>{document.body.classList.remove("shinobiDrawerAberto");drawer.setAttribute("aria-hidden","true");};
    drawer.querySelector(".shinobiDrawerBackdrop")?.addEventListener("click",fechar);
    drawer.querySelector(".shinobiDrawerFechar")?.addEventListener("click",fechar);
    drawer.querySelectorAll("[data-page]").forEach(btn=>btn.addEventListener("click",()=>{
      const id=btn.dataset.page;
      const navBtn=[...document.querySelectorAll(".bottomNav button")].find(b=>(b.getAttribute("onclick")||"").includes(`'${id}'`));
      if(typeof window.abrirPagina==="function")window.abrirPagina(id,navBtn);
      fechar();window.scrollTo({top:0,behavior:"smooth"});
    }));
  }

  window.toggleShinobiDrawer=function(){
    instalarDrawer();
    const aberto=!document.body.classList.contains("shinobiDrawerAberto");
    document.body.classList.toggle("shinobiDrawerAberto",aberto);
    document.getElementById("shinobiNavDrawer")?.setAttribute("aria-hidden",aberto?"false":"true");
  };

  function instalarMelhorias(){
    aplicarIcones(document);
    instalarDrawer();
    const original=window.abrirPagina;
    if(typeof original==="function"&&!original.__shinobiWrapped){
      const wrapped=function(id,botao){
        const r=original.apply(this,arguments);
        document.body.dataset.pagina=id;
        requestAnimationFrame(()=>{
          aplicarIcones(document);
          document.dispatchEvent(new CustomEvent("shinobi:pagechange",{detail:{id}}));
        });
        return r;
      };
      wrapped.__shinobiWrapped=true;window.abrirPagina=wrapped;
    }
    const ativa=document.querySelector(".pagina.ativa");
    if(ativa)document.body.dataset.pagina=ativa.id;
  }

  document.addEventListener("DOMContentLoaded",()=>{
    instalarMelhorias();
    const pendentes=new Set();
    let frameIcones=0;
    const agendarIcones=()=>{
      if(frameIcones) return;
      frameIcones=requestAnimationFrame(()=>{
        frameIcones=0;
        const raizes=[...pendentes];
        pendentes.clear();
        raizes.forEach(raiz=>{
          if(raiz?.isConnected) aplicarIcones(raiz);
        });
      });
    };
    const obs=new MutationObserver(muts=>{
      for(const mut of muts){
        for(const node of mut.addedNodes){
          if(node.nodeType===1) pendentes.add(node);
        }
      }
      if(pendentes.size) agendarIcones();
    });
    obs.observe(document.body,{childList:true,subtree:true});
  });
})();
