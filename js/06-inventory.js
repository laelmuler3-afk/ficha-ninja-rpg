/* Shinobi 1.10.4 — inventário visual com catálogo ampliado. */

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
    "foice-curta": "assets/inventory-foice-curta.webp",
    "bastao": "assets/inventory-bastao.webp",
    "zarabatana": "assets/inventory-zarabatana.webp",
    "balista": "assets/inventory-balista.webp",
    "funda": "assets/inventory-funda.webp",
    "arco-composto": "assets/inventory-arco-composto.webp",
    "arco-longo": "assets/inventory-arco-longo.webp",
    "arco-curto": "assets/inventory-arco-curto.webp",
    "shuriken-de-vento": "assets/inventory-shuriken-de-vento.webp",
    "tanto": "assets/inventory-tanto.webp",
    "dispositivo-de-disparo": "assets/inventory-dispositivo-de-disparo.webp",
    "wakizaki": "assets/inventory-wakizaki.webp",
    "nunchaku": "assets/inventory-nunchaku.webp",
    "katana": "assets/inventory-katana.webp",
    "corrente": "assets/inventory-corrente.webp",
    "chicote": "assets/inventory-chicote.webp",
    "lanca": "assets/inventory-lanca.webp",
    "pilula-de-chakra": "assets/inventory-pilula-de-chakra.webp"
  });

  /* Os nomes são normalizados; versões repetidas com acentos são desnecessárias. */
  const ALIASES_INVENTARIO = Object.freeze({
    "foice curta": "foice-curta",
    "bastao": "bastao",
    "zarabatana": "zarabatana",
    "balista": "balista",
    "funda": "funda",
    "arco composto": "arco-composto",
    "arco longo": "arco-longo",
    "arco curto": "arco-curto",
    "shuriken de vento": "shuriken-de-vento",
    "tanto": "tanto",
    "dispositivo de disparo": "dispositivo-de-disparo",
    "wakizaki": "wakizaki",
    "nunchaku": "nunchaku",
    "katana": "katana",
    "corrente": "corrente",
    "chicote": "chicote",
    "lanca": "lanca",
    "wakizashi": "wakizaki",
    "shuriken vento": "shuriken-de-vento",
    "dispositivo disparo": "dispositivo-de-disparo",
    "foice": "foice-curta",
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
  let menuAcoesAberto = null;

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

  function fecharEstadoItemInventario(indice = null){
    if(indice == null || detalheAberto === indice){
      detalheAberto = null;
    }
    menuAcoesAberto = null;
  }

  window.fecharDetalheItemInventario = function(indice = null){
    fecharEstadoItemInventario(indice);
    renderizarInventario();
  };

  window.abrirDetalheItemInventario = function(indice){
    garantirInventarioItens();

    if(!estado.inventarioItens[indice]) return;

    const estavaAberto = detalheAberto === indice;
    detalheAberto = estavaAberto ? null : indice;
    menuAcoesAberto = null;
    renderizarInventario();
  };

  window.alternarMenuItemInventario = function(indice){
    garantirInventarioItens();
    if(!estado.inventarioItens[indice]) return;

    detalheAberto = indice;
    menuAcoesAberto = menuAcoesAberto === indice ? null : indice;
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

  /*
   * Mantém o fluxo de uso centralizado no runtime e fecha o detalhe apenas
   * quando a quantidade realmente foi consumida. Cancelamentos e falhas
   * deixam o card aberto para o jogador corrigir ou tentar novamente.
   */
  const usarItemInventarioOriginal = window.usarItemInventario;
  if(typeof usarItemInventarioOriginal === "function"){
    window.usarItemInventario = async function(indice){
      garantirInventarioItens();
      const item = estado.inventarioItens[indice];
      if(!item) return;

      const quantidadeAntes = quantidadeInventarioVisual(item);
      await usarItemInventarioOriginal(indice);

      const itemDepois = estado.inventarioItens[indice];
      const quantidadeDepois = itemDepois
        ? quantidadeInventarioVisual(itemDepois)
        : quantidadeAntes;

      if(itemDepois === item && quantidadeDepois < quantidadeAntes){
        fecharEstadoItemInventario(indice);
        renderizarInventario();
      }
    };
  }

  window.editarNomeItemInventario = function(indice){
    garantirInventarioItens();
    const item = estado.inventarioItens[indice];
    if(!item) return;

    const atual = String(item.nome || "");
    const novo = prompt("Nome do item:", atual);
    if(novo === null) return;

    const nomeFinal = novo.trim();
    if(!nomeFinal) return;

    item.nome = nomeFinal;
    salvarInventarioItens();
    fecharEstadoItemInventario(indice);
    renderizarInventario();
  };

  window.removerItemInventario = async function(indice){
    garantirInventarioItens();
    const item = estado.inventarioItens[indice];
    if(!item) return;

    const nome = String(item.nome || "Item");
    const confirmado = typeof modalShinobi === "function"
      ? await modalShinobi(
          "Excluir item?",
          `Excluir “${nome}” do inventário?\n\nEssa ação não pode ser desfeita.`
        )
      : confirm(`Excluir "${nome}" do inventário?`);

    if(!confirmado) return;

    const indiceAtual = estado.inventarioItens.indexOf(item);
    if(indiceAtual < 0) return;

    estado.inventarioItens.splice(indiceAtual, 1);
    salvarInventarioItens();
    fecharEstadoItemInventario();
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
    if(menuAcoesAberto != null && !itens[menuAcoesAberto]){
      menuAcoesAberto = null;
    }

    const html = [];

    itens.forEach((item, indice)=>{
      const nomeOriginal = String(item?.nome || "Item");
      const nomeSeguro = escaparHtml(nomeOriginal);
      const quantidade = quantidadeInventarioVisual(item);
      const aberto = detalheAberto === indice;
      const menuAberto = menuAcoesAberto === indice;
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
          <div class="itemInventarioMenuWrap">
            <button
              type="button"
              class="itemInventarioMenuBtn"
              aria-label="Mais opções de ${nomeSeguro}"
              aria-haspopup="menu"
              aria-expanded="${menuAberto}"
              onclick="event.stopPropagation();alternarMenuItemInventario(${indice})"
            >⋮</button>
            <div class="itemInventarioMenuBalao ${menuAberto ? "aberto" : ""}" role="menu">
              <button
                type="button"
                class="itemInventarioExcluirMenu"
                role="menuitem"
                onclick="event.stopPropagation();removerItemInventario(${indice})"
              >Excluir item</button>
            </div>
          </div>

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
              <button type="button" class="itemInventarioBtnUsar" onclick="event.stopPropagation();usarItemInventario(${indice})">Usar</button>
              <button type="button" class="itemInventarioBtnEditar" onclick="event.stopPropagation();editarNomeItemInventario(${indice})">Editar</button>
            </div>
          </div>
        </div>
      `);
    });

    lista.innerHTML = html.join("");
  };

  document.addEventListener("click", function(event){
    if(menuAcoesAberto == null) return;
    if(event.target.closest?.(".itemInventarioMenuWrap")) return;

    menuAcoesAberto = null;
    renderizarInventario();
  });
})();
