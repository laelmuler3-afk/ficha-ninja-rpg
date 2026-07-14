/* Shinobi 1.3.6 — inventário visual revisado e otimizado. */

/* ===== Inventário visual compacto ===== */
(function(){
  const ICONES_INVENTARIO = Object.freeze({
    "repelente": "assets/inventory-repelente.webp",
    "pergaminho-de-selamento": "assets/inventory-pergaminho-de-selamento.webp",
    "moeda-de-ouro": "assets/inventory-moeda-de-ouro.webp",
    "moeda-de-prata": "assets/inventory-moeda-de-prata.webp",
    "moeda-de-bronze": "assets/inventory-moeda-de-bronze.webp",
    "moeda-de-diamante": "assets/inventory-moeda-de-diamante.webp",
    "kunai": "assets/inventory-kunai.webp",
    "shuriken": "assets/inventory-shuriken.webp",
    "agulhas": "assets/inventory-agulhas.webp",
    "fio-de-nilon": "assets/inventory-fio-de-nilon.webp",
    "pedra-da-familia": "assets/inventory-pedra-da-familia.webp",
    "papel-bomba": "assets/inventory-papel-bomba.webp",
    "comida": "assets/inventory-comida.webp",
    "esfera": "assets/inventory-esfera.webp",
    "pilula-de-chakra": "assets/inventory-pilula-de-chakra.webp"
  });

  /* Os nomes são normalizados; versões repetidas com acentos são desnecessárias. */
  const ALIASES_INVENTARIO = Object.freeze({
    "pilula de chakra": "pilula-de-chakra",
    "pilula chakra": "pilula-de-chakra",
    "chakra": "pilula-de-chakra",
    "esferas de metal": "esfera",
    "esfera": "esfera",
    "alimento": "comida",
    "comida": "comida",
    "papeis bomba": "papel-bomba",
    "papel bomba": "papel-bomba",
    "bomba": "papel-bomba",
    "pedra da familia": "pedra-da-familia",
    "pedra de familia": "pedra-da-familia",
    "fio de nylon": "fio-de-nilon",
    "fio de nilon": "fio-de-nilon",
    "nylon": "fio-de-nilon",
    "nilon": "fio-de-nilon",
    "agulhas": "agulhas",
    "agulha": "agulhas",
    "senbon": "agulhas",
    "shuriken": "shuriken",
    "kunai": "kunai",
    "moeda de diamante": "moeda-de-diamante",
    "diamante": "moeda-de-diamante",
    "moeda de ouro": "moeda-de-ouro",
    "ouro": "moeda-de-ouro",
    "moeda de prata": "moeda-de-prata",
    "prata": "moeda-de-prata",
    "moeda de bronze": "moeda-de-bronze",
    "bronze": "moeda-de-bronze",
    "repelente": "repelente",
    "pergaminho de selamento": "pergaminho-de-selamento",
    "pergaminho selamento": "pergaminho-de-selamento",
    "selamento": "pergaminho-de-selamento"
  });

  const ALIASES_ORDENADOS = Object.keys(ALIASES_INVENTARIO)
    .sort((a, b)=>b.length - a.length);

  const cacheSlugs = new Map();
  let detalheAberto = null;

  function normalizarNome(valor){
    if(typeof normalizarTextoInventario === "function"){
      return normalizarTextoInventario(valor).replace(/\s+/g, " ");
    }

    return String(valor || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");
  }

  function escaparHtml(valor){
    return String(valor == null ? "" : valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slugIconeInventario(nome){
    const nomeNormalizado = normalizarNome(nome);
    if(!nomeNormalizado) return "";

    if(cacheSlugs.has(nomeNormalizado)){
      return cacheSlugs.get(nomeNormalizado);
    }

    let slug = ALIASES_INVENTARIO[nomeNormalizado] || "";

    if(!slug){
      for(const alias of ALIASES_ORDENADOS){
        if(alias.length > 2 && nomeNormalizado.includes(alias)){
          slug = ALIASES_INVENTARIO[alias];
          break;
        }
      }
    }

    cacheSlugs.set(nomeNormalizado, slug);
    return slug;
  }

  function imagemInventarioVisual(nome, classeExtra = "", slug = null){
    const slugFinal = slug == null ? slugIconeInventario(nome) : slug;
    const src = slugFinal ? ICONES_INVENTARIO[slugFinal] : "";

    if(src){
      return `<img class="itemInventarioImg ${classeExtra}" src="${src}" alt="" loading="lazy" decoding="async" draggable="false">`;
    }

    const fallback = typeof iconeInventario === "function"
      ? iconeInventario(nome)
      : "🎒";

    return `<span class="itemInventarioIconeFallback ${classeExtra}">${fallback}</span>`;
  }

  function quantidadeInventarioVisual(item){
    const quantidade = Number.parseInt(item?.quantidade ?? 0, 10);

    return Number.isFinite(quantidade) && quantidade >= 0
      ? quantidade
      : 0;
  }

  window.abrirDetalheItemInventario = function(indice){
    garantirInventarioItens();

    if(!estado.inventarioItens[indice]) return;

    detalheAberto = detalheAberto === indice ? null : indice;
    renderizarInventario();
  };

  window.ajustarQtdItemInventario = function(indice, delta){
    garantirInventarioItens();

    const item = estado.inventarioItens[indice];
    if(!item) return;

    const quantidade = Math.max(
      0,
      quantidadeInventarioVisual(item) + Number(delta || 0)
    );

    alterarQtdItemInventario(indice, quantidade);
    renderizarInventario();
  };

  window.confirmarQtdItemInventarioVisual = function(indice, valor){
    alterarQtdItemInventario(indice, valor);
    renderizarInventario();
  };

  window.renderizarInventario = function(){
    garantirInventarioItens();

    const lista = document.getElementById("listaInventario");
    if(!lista) return;

    const itens = estado.inventarioItens;

    if(!itens.length){
      detalheAberto = null;
      lista.innerHTML = '<div class="itemInventarioVazio">Nenhum item adicionado</div>';
      return;
    }

    if(detalheAberto != null && !itens[detalheAberto]){
      detalheAberto = null;
    }

    const html = [];

    itens.forEach((item, indice)=>{
      const nomeOriginal = String(item?.nome || "Item");
      const nomeSeguro = escaparHtml(nomeOriginal);
      const quantidade = quantidadeInventarioVisual(item);
      const aberto = detalheAberto === indice;
      const slug = slugIconeInventario(nomeOriginal);

      html.push(`
        <div class="itemInventario itemInventarioVisualCard ${aberto ? "itemInventarioAberto" : ""}" role="button" tabindex="0" aria-expanded="${aberto}" onclick="abrirDetalheItemInventario(${indice})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();abrirDetalheItemInventario(${indice})}">
          <div class="itemInventarioImagemWrap">
            ${imagemInventarioVisual(nomeOriginal, "", slug)}
            <span class="itemInventarioQuantidadeBadge">${quantidade}</span>
          </div>
          <div class="itemInventarioNomeMini" title="${nomeSeguro}">${nomeSeguro}</div>
        </div>
      `);

      if(!aberto) return;

      html.push(`
        <div class="itemInventarioDetalhe">
          <div class="itemInventarioDetalheImagem">
            ${imagemInventarioVisual(nomeOriginal, "itemInventarioImgGrande", slug)}
          </div>
          <div class="itemInventarioDetalheConteudo">
            <div class="itemInventarioDetalheNome">${nomeSeguro}</div>
            <div class="itemInventarioQtdControle">
              <button type="button" onclick="event.stopPropagation();ajustarQtdItemInventario(${indice},-1)">−</button>
              <input type="number" min="0" inputmode="numeric" value="${quantidade}" onchange="confirmarQtdItemInventarioVisual(${indice},this.value)">
              <button type="button" onclick="event.stopPropagation();ajustarQtdItemInventario(${indice},1)">+</button>
            </div>
            <div class="itemInventarioAcoes">
              <button type="button" onclick="event.stopPropagation();usarItemInventario(${indice})">Usar</button>
              <button type="button" onclick="event.stopPropagation();editarNomeItemInventario(${indice})">Editar</button>
              <button type="button" class="btnExcluirItemVisual" onclick="event.stopPropagation();removerItemInventario(${indice})">Excluir</button>
            </div>
          </div>
        </div>
      `);
    });

    lista.innerHTML = html.join("");
  };
})();
