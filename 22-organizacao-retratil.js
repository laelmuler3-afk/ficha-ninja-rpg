/* Ficha Ninja RPG 2.4.0 — Jutsus e Loja organizados em seções retráteis. */
(function(){
  "use strict";

  if(window.__shinobiOrganizacaoRetratilV240) return;
  window.__shinobiOrganizacaoRetratilV240 = true;

  const GRUPOS_JUTSU = Object.freeze([
    {id:"katon",  nome:"Katon",             icone:"🔥"},
    {id:"suiton", nome:"Suiton",            icone:"💧"},
    {id:"raiton", nome:"Raiton",            icone:"⚡"},
    {id:"fuuton", nome:"Fuuton",            icone:"🌪️"},
    {id:"doton",  nome:"Doton",             icone:"🪨"},
    {id:"yin",    nome:"Yinton / Genjutsu", icone:"🌑"},
    {id:"yang",     nome:"Youton / Iryō",     icone:"☀️"},
    {id:"taijutsu", nome:"Taijutsu",           icone:"🥋"},
    {id:"ninjutsu", nome:"Ninjutsu / Técnicas", icone:"🌀"},
    {id:"neutro",   nome:"Outros",              icone:"✨"}
  ]);

  const GRUPO_POR_ID = new Map(GRUPOS_JUTSU.map(grupo=>[grupo.id,grupo]));
  const ICONE_LOJA = Object.freeze({
    "arremessaveis":"✴️",
    "armas a distancia":"🏹",
    "corpo a corpo":"⚔️",
    "outras armas":"🗡️",
    "ferramentas":"🧰",
    "consumiveis":"🧪",
    "itens especiais":"✨"
  });

  let buscaJutsus = "";
  let frameJutsus = 0;
  let frameLoja = 0;
  let organizandoJutsus = false;
  let organizandoLoja = false;
  let observadorLoja = null;
  const catalogoJutsusPorId = new Map();
  const preferenciasMemoria = new Map();

  function normalizar(valor){
    return String(valor ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/\s+/g," ");
  }

  function escaparHtml(valor){
    return String(valor ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function nomeFichaAtual(){
    try{
      if(typeof fichaAtual !== "undefined" && fichaAtual) return String(fichaAtual);
    }catch(_erro){}
    try{return localStorage.getItem("ficha_ninja_ativa_v1") || "Principal";}catch(_erro){return "Principal";}
  }

  function chavePreferencia(tipo){
    return `shinobi_${tipo}_aberto_v240__${normalizar(nomeFichaAtual()).replace(/[^a-z0-9_-]+/g,"_") || "principal"}`;
  }

  function lerPreferencia(tipo){
    const chave = chavePreferencia(tipo);
    try{
      const salva = localStorage.getItem(chave);
      if(salva !== null) return salva;
    }catch(_erro){}
    return preferenciasMemoria.get(chave) || "";
  }

  function salvarPreferencia(tipo,valor){
    const chave = chavePreferencia(tipo);
    const texto = String(valor || "");
    preferenciasMemoria.set(chave,texto);
    try{localStorage.setItem(chave,texto);}catch(_erro){}
  }

  function registroCatalogoDoJutsu(jutsu){
    const ids = [jutsu?.catalogoId,jutsu?.origemId,jutsu?.id].filter(Boolean).map(String);
    for(const id of ids){
      if(catalogoJutsusPorId.has(id)) return catalogoJutsusPorId.get(id);
    }
    return null;
  }

  function grupoDoJutsu(jutsu){
    const elemento = normalizar(jutsu?.elemento || "neutro");
    if(["katon","suiton","raiton","fuuton","doton","yin","yang"].includes(elemento)) return elemento;

    const catalogado = registroCatalogoDoJutsu(jutsu);
    const classificacao = normalizar([
      jutsu?.categoria,
      jutsu?.tipo,
      jutsu?.tipoNome,
      jutsu?.classificacao,
      catalogado?.categoria,
      catalogado?.tipoNome,
      catalogado?.tipoOriginal,
      jutsu?.nome
    ].filter(Boolean).join(" "));

    if(classificacao.includes("genjutsu") || classificacao.includes("yinton")) return "yin";
    if(classificacao.includes("iryo") || classificacao.includes("medic") || classificacao.includes("youton")) return "yang";
    if(classificacao.includes("taijutsu")) return "taijutsu";
    if(classificacao.includes("ninjutsu") || classificacao.includes("tecnica geral")) return "ninjutsu";
    if(classificacao.includes("katon")) return "katon";
    if(classificacao.includes("suiton")) return "suiton";
    if(classificacao.includes("raiton")) return "raiton";
    if(classificacao.includes("fuuton")) return "fuuton";
    if(classificacao.includes("doton")) return "doton";
    return elemento === "neutro" ? "ninjutsu" : "neutro";
  }

  async function carregarClassificacoesCatalogo(){
    try{
      const versao = encodeURIComponent(String(window.APP_VERSION || "2.4.0"));
      const resposta = await fetch(`data/catalogo-jutsus.json?v=${versao}`,{cache:"force-cache"});
      if(!resposta.ok) return;
      const dados = await resposta.json();
      const lista = Array.isArray(dados) ? dados : Array.isArray(dados?.jutsus) ? dados.jutsus : [];
      lista.forEach(item=>{
        [item?.id,item?.catalogoId].filter(Boolean).forEach(id=>catalogoJutsusPorId.set(String(id),item));
      });
      agendarOrganizacaoJutsus();
    }catch(_erro){
      /* A classificação básica por elemento continua funcionando offline. */
    }
  }

  function indiceDoCard(card,indiceFallback){
    const resumo = card.querySelector(".jutsuLinhaResumo");
    const onclick = resumo?.getAttribute("onclick") || "";
    const encontrado = onclick.match(/alternarJutsuAberto\((\d+)\)/);
    if(encontrado) return Number(encontrado[1]);
    const salvo = Number(card.dataset.jutsuIndex);
    return Number.isInteger(salvo) ? salvo : indiceFallback;
  }

  function textoBuscaJutsu(jutsu,card){
    return normalizar([
      jutsu?.nome,
      jutsu?.elemento,
      jutsu?.rank,
      jutsu?.custo,
      jutsu?.dano,
      jutsu?.alcance,
      jutsu?.duracao,
      jutsu?.acao,
      jutsu?.resistencia,
      jutsu?.alvo,
      jutsu?.descricao,
      card?.textContent
    ].filter(Boolean).join(" "));
  }

  function criarFerramentasJutsus(lista){
    const pai = lista.parentElement;
    if(!pai) return null;

    let ferramentas = document.getElementById("jutsuFerramentasRetrateis");
    if(!ferramentas){
      ferramentas = document.createElement("section");
      ferramentas.id = "jutsuFerramentasRetrateis";
      ferramentas.className = "jutsuFerramentasRetrateis";
      ferramentas.innerHTML = `
        <label class="jutsuBuscaRetratil">
          <span aria-hidden="true">🔎</span>
          <input id="jutsuBuscaFicha" type="search" autocomplete="off" placeholder="Buscar nos seus jutsus..." aria-label="Buscar nos jutsus da ficha">
          <button id="jutsuBuscaLimpar" type="button" aria-label="Limpar busca" hidden>×</button>
        </label>
        <div class="jutsuFerramentasLinha">
          <span id="jutsuResumoRetratil">0 jutsus</span>
          <button id="jutsuFecharGrupos" type="button">Fechar grupos</button>
        </div>
        <div id="jutsuElementosAtalhos" class="jutsuElementosAtalhos" aria-label="Atalhos dos elementos"></div>
      `;
      pai.insertBefore(ferramentas,lista);

      const input = ferramentas.querySelector("#jutsuBuscaFicha");
      const limpar = ferramentas.querySelector("#jutsuBuscaLimpar");
      input?.addEventListener("input",()=>{
        buscaJutsus = String(input.value || "");
        if(limpar) limpar.hidden = !buscaJutsus;
        aplicarFiltroJutsus();
      });
      limpar?.addEventListener("click",()=>{
        buscaJutsus = "";
        if(input) input.value = "";
        limpar.hidden = true;
        aplicarFiltroJutsus();
        input?.focus();
      });
      ferramentas.querySelector("#jutsuFecharGrupos")?.addEventListener("click",()=>{
        salvarPreferencia("jutsus","");
        lista.querySelectorAll(".jutsuGrupoRetratil").forEach(secao=>definirGrupoJutsuAberto(secao,false));
      });
    }

    const input = ferramentas.querySelector("#jutsuBuscaFicha");
    if(input && input.value !== buscaJutsus) input.value = buscaJutsus;
    const limpar = ferramentas.querySelector("#jutsuBuscaLimpar");
    if(limpar) limpar.hidden = !buscaJutsus;
    return ferramentas;
  }

  function definirGrupoJutsuAberto(secao,aberto){
    const cabecalho = secao.querySelector(".jutsuGrupoCabecalho");
    const conteudo = secao.querySelector(".jutsuGrupoConteudo");
    secao.classList.toggle("aberto",Boolean(aberto));
    cabecalho?.setAttribute("aria-expanded",String(Boolean(aberto)));
    if(conteudo) conteudo.hidden = !aberto;
  }

  function abrirSomenteGrupoJutsu(id,{rolar=false}={}){
    const lista = document.getElementById("listaJutsus");
    if(!lista) return;
    buscaJutsus = "";
    const input = document.getElementById("jutsuBuscaFicha");
    if(input) input.value = "";
    const limpar = document.getElementById("jutsuBuscaLimpar");
    if(limpar) limpar.hidden = true;

    lista.querySelectorAll(".jutsuGrupoRetratil").forEach(secao=>{
      definirGrupoJutsuAberto(secao,secao.dataset.grupoJutsu === id);
    });
    salvarPreferencia("jutsus",id);
    aplicarFiltroJutsus();

    if(rolar){
      const alvo = lista.querySelector(`.jutsuGrupoRetratil[data-grupo-jutsu="${id}"]`);
      alvo?.scrollIntoView({behavior:"smooth",block:"start"});
    }
  }

  function atualizarAtalhosJutsus(contagens){
    const host = document.getElementById("jutsuElementosAtalhos");
    if(!host) return;
    host.innerHTML = GRUPOS_JUTSU
      .filter(grupo=>(contagens.get(grupo.id) || 0) > 0)
      .map(grupo=>`
        <button type="button" class="jutsuElementoAtalho grupo-${grupo.id}" data-atalho-jutsu="${grupo.id}" title="Abrir ${escaparHtml(grupo.nome)}">
          <span>${grupo.icone}</span><b>${contagens.get(grupo.id)}</b>
        </button>
      `).join("");
    host.querySelectorAll("[data-atalho-jutsu]").forEach(botao=>{
      botao.addEventListener("click",()=>abrirSomenteGrupoJutsu(botao.dataset.atalhoJutsu,{rolar:true}));
    });
  }

  function aplicarFiltroJutsus(){
    const lista = document.getElementById("listaJutsus");
    if(!lista) return;
    const termo = normalizar(buscaJutsus);
    let totalVisivel = 0;
    let gruposVisiveis = 0;

    lista.querySelectorAll(".jutsuGrupoRetratil").forEach(secao=>{
      let visiveis = 0;
      secao.querySelectorAll(".jutsuListaCard").forEach(card=>{
        const corresponde = !termo || String(card.dataset.jutsuBusca || "").includes(termo);
        card.hidden = !corresponde;
        if(corresponde) visiveis += 1;
      });

      secao.hidden = visiveis === 0;
      if(visiveis){
        gruposVisiveis += 1;
        totalVisivel += visiveis;
      }

      const contador = secao.querySelector("[data-jutsu-grupo-contador]");
      const total = Number(secao.dataset.totalJutsus || 0);
      if(contador) contador.textContent = termo ? `${visiveis}/${total}` : String(total);
      if(termo) definirGrupoJutsuAberto(secao,visiveis > 0);
    });

    if(!termo){
      const preferido = lerPreferencia("jutsus");
      lista.querySelectorAll(".jutsuGrupoRetratil").forEach(secao=>{
        definirGrupoJutsuAberto(secao,Boolean(preferido) && secao.dataset.grupoJutsu === preferido);
      });
    }

    const vazio = lista.querySelector(".jutsuBuscaSemResultado");
    if(vazio) vazio.hidden = totalVisivel > 0 || !termo;

    const resumo = document.getElementById("jutsuResumoRetratil");
    if(resumo){
      resumo.textContent = termo
        ? `${totalVisivel} ${totalVisivel===1?"resultado":"resultados"}`
        : `${totalVisivel} ${totalVisivel===1?"jutsu":"jutsus"} em ${gruposVisiveis} ${gruposVisiveis===1?"grupo":"grupos"}`;
    }
  }

  function organizarJutsusAgora(){
    if(organizandoJutsus) return;
    const lista = document.getElementById("listaJutsus");
    if(!lista) return;
    organizandoJutsus = true;

    try{
      document.getElementById("jutsuOrganizacaoBarra")?.remove();
      criarFerramentasJutsus(lista);

      const cards = Array.from(lista.querySelectorAll(".jutsuListaCard"));
      if(!cards.length){
        lista.querySelectorAll(".jutsuGrupoRetratil,.jutsuBuscaSemResultado").forEach(elemento=>elemento.remove());
        const resumo = document.getElementById("jutsuResumoRetratil");
        if(resumo) resumo.textContent = "0 jutsus";
        atualizarAtalhosJutsus(new Map());
        return;
      }

      const porGrupo = new Map(GRUPOS_JUTSU.map(grupo=>[grupo.id,[]]));
      cards.forEach((card,posicao)=>{
        const indice = indiceDoCard(card,posicao);
        const jutsu = Array.isArray(window.estado?.jutsus) ? window.estado.jutsus[indice] : (typeof estado !== "undefined" ? estado?.jutsus?.[indice] : null);
        const grupo = grupoDoJutsu(jutsu);
        card.dataset.jutsuIndex = String(indice);
        card.dataset.jutsuGrupo = grupo;
        card.dataset.jutsuBusca = textoBuscaJutsu(jutsu,card);
        card.hidden = false;
        porGrupo.get(grupo)?.push(card);
      });

      lista.replaceChildren();
      const preferido = lerPreferencia("jutsus");
      const primeiroDisponivel = GRUPOS_JUTSU.find(grupo=>(porGrupo.get(grupo.id) || []).length)?.id || "";
      const grupoInicial = porGrupo.get(preferido)?.length ? preferido : primeiroDisponivel;
      if(grupoInicial && grupoInicial !== preferido) salvarPreferencia("jutsus",grupoInicial);
      const contagens = new Map();

      GRUPOS_JUTSU.forEach(grupo=>{
        const cardsGrupo = porGrupo.get(grupo.id) || [];
        if(!cardsGrupo.length) return;
        contagens.set(grupo.id,cardsGrupo.length);

        const secao = document.createElement("section");
        secao.className = `jutsuGrupoRetratil grupo-${grupo.id}`;
        secao.dataset.grupoJutsu = grupo.id;
        secao.dataset.totalJutsus = String(cardsGrupo.length);

        const cabecalho = document.createElement("button");
        cabecalho.type = "button";
        cabecalho.className = "jutsuGrupoCabecalho";
        cabecalho.innerHTML = `
          <span class="jutsuGrupoIcone" aria-hidden="true">${grupo.icone}</span>
          <span class="jutsuGrupoTitulo">${escaparHtml(grupo.nome)}</span>
          <span class="jutsuGrupoContador" data-jutsu-grupo-contador>${cardsGrupo.length}</span>
          <span class="jutsuGrupoSeta" aria-hidden="true">⌄</span>
        `;

        const conteudo = document.createElement("div");
        conteudo.className = "jutsuGrupoConteudo";
        cardsGrupo.forEach(card=>conteudo.appendChild(card));

        secao.append(cabecalho,conteudo);
        lista.appendChild(secao);

        cabecalho.addEventListener("click",()=>{
          if(normalizar(buscaJutsus)) return;
          const vaiAbrir = !secao.classList.contains("aberto");
          lista.querySelectorAll(".jutsuGrupoRetratil").forEach(outro=>definirGrupoJutsuAberto(outro,false));
          definirGrupoJutsuAberto(secao,vaiAbrir);
          salvarPreferencia("jutsus",vaiAbrir ? grupo.id : "");
        });

        definirGrupoJutsuAberto(secao,!buscaJutsus && grupo.id === grupoInicial);
      });

      const vazio = document.createElement("div");
      vazio.className = "jutsuBuscaSemResultado";
      vazio.hidden = true;
      vazio.innerHTML = "<strong>Nenhum jutsu encontrado.</strong><span>Tente outro nome, elemento, rank ou efeito.</span>";
      lista.appendChild(vazio);

      atualizarAtalhosJutsus(contagens);
      aplicarFiltroJutsus();
    }finally{
      organizandoJutsus = false;
    }
  }

  function agendarOrganizacaoJutsus(){
    if(frameJutsus) cancelAnimationFrame(frameJutsus);
    frameJutsus = requestAnimationFrame(()=>{
      frameJutsus = requestAnimationFrame(()=>{
        frameJutsus = 0;
        organizarJutsusAgora();
      });
    });
  }

  function desativarMovimentacaoLegada(){
    const lista = document.getElementById("listaJutsus");
    if(!lista || lista.dataset.retratilV240Node === "1") return;
    const clone = lista.cloneNode(true);
    clone.dataset.retratilV240Node = "1";
    delete clone.dataset.moverTouchV3;
    lista.replaceWith(clone);
  }

  function iconeCategoriaLoja(nome){
    const chave = normalizar(nome);
    return ICONE_LOJA[chave] || (chave.includes("distancia") ? "🏹" : chave.includes("corpo") ? "⚔️" : chave.includes("consum") ? "🧪" : "🎒");
  }

  function chaveCategoriaLoja(nome){
    return normalizar(nome).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "itens";
  }

  function definirCategoriaLojaAberta(secao,aberta){
    const cabecalho = secao.querySelector(".lojaCategoriaCabecalho");
    const grade = secao.querySelector(".lojaGrid");
    secao.classList.toggle("aberta",Boolean(aberta));
    cabecalho?.setAttribute("aria-expanded",String(Boolean(aberta)));
    if(grade) grade.hidden = !aberta;
  }

  function organizarLojaAgora(){
    if(organizandoLoja) return;
    const host = document.getElementById("lojaCatalogo");
    if(!host) return;
    organizandoLoja = true;

    try{
      const secoes = Array.from(host.querySelectorAll(":scope > .lojaCategoria"));
      if(!secoes.length) return;
      const pesquisando = Boolean(normalizar(document.getElementById("lojaBusca")?.value || ""));
      const preferida = lerPreferencia("loja");
      const categorias = [];

      secoes.forEach((secao,indice)=>{
        if(secao.dataset.retratilV240 === "1"){
          categorias.push(secao.dataset.categoriaLoja || "");
          return;
        }

        const tituloAntigo = secao.querySelector(":scope > h3");
        const nome = String(tituloAntigo?.textContent || `Categoria ${indice+1}`).trim();
        const chave = chaveCategoriaLoja(nome);
        const quantidade = secao.querySelectorAll(".lojaItemCard").length;
        const grade = secao.querySelector(":scope > .lojaGrid");
        if(!grade) return;

        const cabecalho = document.createElement("button");
        cabecalho.type = "button";
        cabecalho.className = "lojaCategoriaCabecalho";
        cabecalho.innerHTML = `
          <span class="lojaCategoriaIcone" aria-hidden="true">${iconeCategoriaLoja(nome)}</span>
          <span class="lojaCategoriaTitulo">${escaparHtml(nome)}</span>
          <span class="lojaCategoriaContador">${quantidade}</span>
          <span class="lojaCategoriaSeta" aria-hidden="true">⌄</span>
        `;

        tituloAntigo?.replaceWith(cabecalho);
        secao.dataset.retratilV240 = "1";
        secao.dataset.categoriaLoja = chave;
        categorias.push(chave);

        cabecalho.addEventListener("click",()=>{
          const vaiAbrir = !secao.classList.contains("aberta");
          host.querySelectorAll(":scope > .lojaCategoria").forEach(outra=>definirCategoriaLojaAberta(outra,false));
          definirCategoriaLojaAberta(secao,vaiAbrir);
          salvarPreferencia("loja",vaiAbrir ? chave : "");
        });
      });

      const chaveInicial = categorias.includes(preferida) ? preferida : categorias[0];
      secoes.forEach(secao=>{
        const aberta = pesquisando || secao.dataset.categoriaLoja === chaveInicial;
        definirCategoriaLojaAberta(secao,aberta);
      });
    }finally{
      organizandoLoja = false;
    }
  }

  function agendarOrganizacaoLoja(){
    if(frameLoja) cancelAnimationFrame(frameLoja);
    frameLoja = requestAnimationFrame(()=>{
      frameLoja = 0;
      organizarLojaAgora();
    });
  }

  function instalarObservadorLoja(){
    const host = document.getElementById("lojaCatalogo");
    if(!host || observadorLoja) return;
    observadorLoja = new MutationObserver(()=>agendarOrganizacaoLoja());
    observadorLoja.observe(host,{childList:true});
    agendarOrganizacaoLoja();
  }

  function instalarWrapperJutsus(){
    if(typeof window.renderizarJutsus !== "function" || window.__renderJutsusRetratilV240) return;
    window.__renderJutsusRetratilV240 = true;
    const base = window.renderizarJutsus;
    window.renderizarJutsus = function(){
      const resultado = base.apply(this,arguments);
      agendarOrganizacaoJutsus();
      return resultado;
    };
    try{renderizarJutsus = window.renderizarJutsus;}catch(_erro){}
  }

  function iniciar(){
    desativarMovimentacaoLegada();
    instalarWrapperJutsus();
    instalarObservadorLoja();
    agendarOrganizacaoJutsus();
    agendarOrganizacaoLoja();
    carregarClassificacoesCatalogo();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",()=>setTimeout(iniciar,0),{once:true});
  }else{
    setTimeout(iniciar,0);
  }

  window.addEventListener("pageshow",()=>setTimeout(()=>{
    instalarWrapperJutsus();
    instalarObservadorLoja();
    agendarOrganizacaoJutsus();
    agendarOrganizacaoLoja();
  },0));

  window.ShinobiOrganizacaoRetratil = Object.freeze({
    versao:"2.4.0",
    organizarJutsus:organizarJutsusAgora,
    organizarLoja:organizarLojaAgora,
    abrirGrupoJutsu:abrirSomenteGrupoJutsu,
    grupoDoJutsu,
    chaveCategoriaLoja
  });
})();
