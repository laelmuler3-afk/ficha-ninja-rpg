/* Shinobi 1.10.7 — catálogo visual para adicionar itens e ícones compartilhados. */

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
    "pilula-de-chakra": "assets/inventory-pilula-de-chakra.webp",
    "kit-medico": "assets/inventory-kit-medico.webp"
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
    "kit medico": "kit-medico",
    "kit de primeiros socorros": "kit-medico",
    "primeiros socorros": "kit-medico",
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



  const CATALOGO_ITENS_INVENTARIO = Object.freeze([
    { slug:"agulhas", nome:"Agulhas", categoria:"Armas" },
    { slug:"arco-composto", nome:"Arco composto", categoria:"Armas" },
    { slug:"arco-curto", nome:"Arco curto", categoria:"Armas" },
    { slug:"arco-longo", nome:"Arco longo", categoria:"Armas" },
    { slug:"balista", nome:"Balista", categoria:"Armas" },
    { slug:"bastao", nome:"Bastão", categoria:"Armas" },
    { slug:"chicote", nome:"Chicote", categoria:"Armas" },
    { slug:"corrente", nome:"Corrente", categoria:"Armas" },
    { slug:"dispositivo-de-disparo", nome:"Dispositivo de disparo", categoria:"Armas" },
    { slug:"esfera", nome:"Esferas de metal", categoria:"Armas" },
    { slug:"foice-curta", nome:"Foice curta", categoria:"Armas" },
    { slug:"funda", nome:"Funda", categoria:"Armas" },
    { slug:"katana", nome:"Katana", categoria:"Armas" },
    { slug:"kunai", nome:"Kunai", categoria:"Armas" },
    { slug:"lanca", nome:"Lança", categoria:"Armas" },
    { slug:"nunchaku", nome:"Nunchaku", categoria:"Armas" },
    { slug:"shuriken", nome:"Shuriken", categoria:"Armas" },
    { slug:"shuriken-de-vento", nome:"Shuriken de vento", categoria:"Armas" },
    { slug:"tanto", nome:"Tanto", categoria:"Armas" },
    { slug:"wakizaki", nome:"Wakizaki", categoria:"Armas" },
    { slug:"zarabatana", nome:"Zarabatana", categoria:"Armas" },

    { slug:"fio-de-nilon", nome:"Fio de náilon", categoria:"Ferramentas" },
    { slug:"papel-bomba", nome:"Papel bomba", categoria:"Ferramentas" },
    { slug:"pergaminho-de-selamento", nome:"Pergaminho de selamento", categoria:"Ferramentas" },
    { slug:"repelente", nome:"Repelente", categoria:"Ferramentas" },

    { slug:"comida", nome:"Comida", categoria:"Consumíveis" },
    { slug:"kit-medico", nome:"Kit médico", categoria:"Consumíveis" },
    { slug:"pilula-de-chakra", nome:"Pílula de chakra", categoria:"Consumíveis" },

    { slug:"moeda-de-bronze", nome:"Moeda de bronze", categoria:"Moedas" },
    { slug:"moeda-de-diamante", nome:"Moeda de diamante", categoria:"Moedas" },
    { slug:"moeda-de-ouro", nome:"Moeda de ouro", categoria:"Moedas" },
    { slug:"moeda-de-prata", nome:"Moeda de prata", categoria:"Moedas" },

    { slug:"pedra-da-familia", nome:"Pedra da família", categoria:"Itens especiais" }
  ]);

  window.CATALOGO_ITENS_INVENTARIO = CATALOGO_ITENS_INVENTARIO;

  const ALIASES_ORDENADOS = Object.keys(ALIASES_INVENTARIO)
    .sort((a, b)=>b.length - a.length);

  const cacheSlugs = new Map();
  let detalheAberto = null;
  let menuAcoesAberto = null;
  let catalogoInventarioOverlay = null;
  let catalogoInventarioSlugSelecionado = "";
  let catalogoInventarioQuantidade = 1;
  let catalogoInventarioBusca = "";

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

  window.obterImagemInventarioPorNome = function(nome){
    const slug = slugIconeInventario(nome);
    return slug ? (ICONES_INVENTARIO[slug] || "") : "";
  };

  window.temImagemInventarioPorNome = function(nome){
    return Boolean(window.obterImagemInventarioPorNome(nome));
  };

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



  function itemCatalogoPorSlug(slug){
    return CATALOGO_ITENS_INVENTARIO.find(item=>item.slug === slug) || null;
  }

  function quantidadeCatalogadaNoInventario(slug){
    garantirInventarioItens();

    return estado.inventarioItens.reduce((total, item)=>{
      return slugIconeInventario(item?.nome) === slug
        ? total + quantidadeInventarioVisual(item)
        : total;
    }, 0);
  }

  function itensCatalogoFiltrados(){
    const termo = normalizarNome(catalogoInventarioBusca);
    if(!termo) return [...CATALOGO_ITENS_INVENTARIO];

    return CATALOGO_ITENS_INVENTARIO.filter(item=>{
      const texto = normalizarNome(`${item.nome} ${item.categoria} ${item.slug.replace(/-/g," ")}`);
      return texto.includes(termo);
    });
  }

  function htmlCardCatalogoInventario(item){
    const selecionado = item.slug === catalogoInventarioSlugSelecionado;
    const quantidadeAtual = quantidadeCatalogadaNoInventario(item.slug);
    const nomeSeguro = escaparHtml(item.nome);
    const categoriaSegura = escaparHtml(item.categoria);

    return `
      <button
        type="button"
        class="catalogoInventarioItem ${selecionado ? "selecionado" : ""}"
        data-catalogo-slug="${item.slug}"
        aria-pressed="${selecionado}"
        aria-label="Selecionar ${nomeSeguro}"
      >
        <span class="catalogoInventarioItemImagem">
          ${imagemInventarioVisual(item.nome, "catalogoInventarioImg", item.slug)}
          ${quantidadeAtual > 0 ? `<small class="catalogoInventarioJaPossui">${quantidadeAtual}</small>` : ""}
        </span>
        <strong>${nomeSeguro}</strong>
        <small>${categoriaSegura}</small>
      </button>
    `;
  }

  function renderizarListaCatalogoInventario(){
    if(!catalogoInventarioOverlay) return;

    const host = catalogoInventarioOverlay.querySelector("[data-catalogo-inventario-lista]");
    const contador = catalogoInventarioOverlay.querySelector("[data-catalogo-inventario-contador]");
    if(!host) return;

    const itens = itensCatalogoFiltrados();
    if(contador){
      contador.textContent = `${itens.length} ${itens.length === 1 ? "item" : "itens"}`;
    }

    if(!itens.length){
      host.innerHTML = `
        <div class="catalogoInventarioSemResultado">
          Nenhum item encontrado.<br>
          <small>Use “Item personalizado” para cadastrar outro nome.</small>
        </div>
      `;
      return;
    }

    const categorias = [];
    itens.forEach(item=>{
      let grupo = categorias.find(categoria=>categoria.nome === item.categoria);
      if(!grupo){
        grupo = { nome:item.categoria, itens:[] };
        categorias.push(grupo);
      }
      grupo.itens.push(item);
    });

    host.innerHTML = categorias.map(categoria=>`
      <section class="catalogoInventarioGrupo">
        <h4>${escaparHtml(categoria.nome)}</h4>
        <div class="catalogoInventarioGrid">
          ${categoria.itens.map(htmlCardCatalogoInventario).join("")}
        </div>
      </section>
    `).join("");
  }

  function atualizarResumoCatalogoInventario(){
    if(!catalogoInventarioOverlay) return;

    const item = itemCatalogoPorSlug(catalogoInventarioSlugSelecionado);
    const resumo = catalogoInventarioOverlay.querySelector("[data-catalogo-inventario-resumo]");
    const nome = catalogoInventarioOverlay.querySelector("[data-catalogo-inventario-nome]");
    const imagem = catalogoInventarioOverlay.querySelector("[data-catalogo-inventario-imagem]");
    const input = catalogoInventarioOverlay.querySelector("[data-catalogo-inventario-quantidade]");
    const confirmar = catalogoInventarioOverlay.querySelector("[data-catalogo-inventario-confirmar]");

    if(input) input.value = String(catalogoInventarioQuantidade);
    if(confirmar) confirmar.disabled = !item;

    if(!item){
      resumo?.classList.remove("temSelecao");
      if(nome) nome.textContent = "Selecione um item";
      if(imagem) imagem.innerHTML = '<span class="catalogoInventarioResumoFallback">🎒</span>';
      return;
    }

    resumo?.classList.add("temSelecao");
    if(nome) nome.textContent = item.nome;
    if(imagem){
      imagem.innerHTML = imagemInventarioVisual(
        item.nome,
        "catalogoInventarioResumoImg",
        item.slug
      );
    }
  }

  function selecionarItemCatalogoInventario(slug){
    if(!itemCatalogoPorSlug(slug)) return;

    catalogoInventarioSlugSelecionado = slug;
    renderizarListaCatalogoInventario();
    atualizarResumoCatalogoInventario();
  }

  function definirQuantidadeCatalogoInventario(valor){
    let quantidade = Number.parseInt(valor, 10);
    if(!Number.isFinite(quantidade) || quantidade < 1) quantidade = 1;
    catalogoInventarioQuantidade = Math.min(9999, quantidade);
    atualizarResumoCatalogoInventario();
  }

  function fecharCatalogoInventario(){
    if(!catalogoInventarioOverlay) return;

    catalogoInventarioOverlay.remove();
    catalogoInventarioOverlay = null;
    catalogoInventarioSlugSelecionado = "";
    catalogoInventarioQuantidade = 1;
    catalogoInventarioBusca = "";
    document.body.classList.remove("catalogoInventarioAberto");
  }

  function adicionarItemCatalogadoAoInventario(){
    const itemCatalogado = itemCatalogoPorSlug(catalogoInventarioSlugSelecionado);
    if(!itemCatalogado) return;

    garantirInventarioItens();
    const quantidade = Math.max(1, Number.parseInt(catalogoInventarioQuantidade, 10) || 1);
    const indiceExistente = estado.inventarioItens.findIndex(item=>{
      return slugIconeInventario(item?.nome) === itemCatalogado.slug;
    });

    if(indiceExistente >= 0){
      const itemExistente = estado.inventarioItens[indiceExistente];
      itemExistente.quantidade = quantidadeInventarioVisual(itemExistente) + quantidade;
    }else{
      estado.inventarioItens.push({
        nome:itemCatalogado.nome,
        quantidade
      });
    }

    salvarInventarioItens();
    fecharEstadoItemInventario();
    renderizarInventario();
    fecharCatalogoInventario();
  }

  const adicionarItemInventarioOriginal = window.adicionarItemInventario;

  function adicionarItemPersonalizadoDoCatalogo(){
    fecharCatalogoInventario();
    if(typeof adicionarItemInventarioOriginal === "function"){
      adicionarItemInventarioOriginal();
    }
  }

  window.fecharCatalogoInventario = fecharCatalogoInventario;

  window.adicionarItemInventario = function(){
    if(catalogoInventarioOverlay){
      const busca = catalogoInventarioOverlay.querySelector("[data-catalogo-inventario-busca]");
      busca?.focus();
      return;
    }

    garantirInventarioItens();
    catalogoInventarioSlugSelecionado = "";
    catalogoInventarioQuantidade = 1;
    catalogoInventarioBusca = "";

    const overlay = document.createElement("div");
    overlay.className = "catalogoInventarioOverlay";
    overlay.innerHTML = `
      <div class="catalogoInventarioBox" role="dialog" aria-modal="true" aria-labelledby="catalogoInventarioTitulo">
        <header class="catalogoInventarioCabecalho">
          <div>
            <small>CATÁLOGO DO INVENTÁRIO</small>
            <h3 id="catalogoInventarioTitulo">Adicionar item</h3>
          </div>
          <button type="button" class="catalogoInventarioFechar" data-catalogo-inventario-fechar aria-label="Fechar catálogo">×</button>
        </header>

        <div class="catalogoInventarioFerramentas">
          <label class="catalogoInventarioBusca">
            <span>⌕</span>
            <input
              type="search"
              autocomplete="off"
              placeholder="Buscar item..."
              data-catalogo-inventario-busca
            >
          </label>
          <div class="catalogoInventarioLinhaAuxiliar">
            <span data-catalogo-inventario-contador></span>
            <button type="button" data-catalogo-inventario-personalizado>＋ Item personalizado</button>
          </div>
        </div>

        <div class="catalogoInventarioLista" data-catalogo-inventario-lista></div>

        <footer class="catalogoInventarioRodape">
          <div class="catalogoInventarioResumo" data-catalogo-inventario-resumo>
            <span class="catalogoInventarioResumoImagem" data-catalogo-inventario-imagem>
              <span class="catalogoInventarioResumoFallback">🎒</span>
            </span>
            <div>
              <small>ITEM SELECIONADO</small>
              <strong data-catalogo-inventario-nome>Selecione um item</strong>
            </div>
          </div>

          <div class="catalogoInventarioQuantidade">
            <span>Quantidade</span>
            <div>
              <button type="button" data-catalogo-inventario-delta="-1" aria-label="Diminuir quantidade">−</button>
              <input type="number" min="1" max="9999" inputmode="numeric" value="1" data-catalogo-inventario-quantidade aria-label="Quantidade do item">
              <button type="button" data-catalogo-inventario-delta="1" aria-label="Aumentar quantidade">+</button>
            </div>
          </div>

          <button type="button" class="catalogoInventarioConfirmar" data-catalogo-inventario-confirmar disabled>
            Adicionar ao inventário
          </button>
        </footer>
      </div>
    `;

    catalogoInventarioOverlay = overlay;
    document.body.appendChild(overlay);
    document.body.classList.add("catalogoInventarioAberto");

    overlay.addEventListener("click", event=>{
      if(event.target === overlay){
        fecharCatalogoInventario();
        return;
      }

      const card = event.target.closest?.("[data-catalogo-slug]");
      if(card){
        selecionarItemCatalogoInventario(card.dataset.catalogoSlug || "");
        return;
      }

      const delta = event.target.closest?.("[data-catalogo-inventario-delta]");
      if(delta){
        definirQuantidadeCatalogoInventario(
          catalogoInventarioQuantidade + Number(delta.dataset.catalogoInventarioDelta || 0)
        );
      }
    });

    overlay.querySelector("[data-catalogo-inventario-fechar]")?.addEventListener("click", fecharCatalogoInventario);
    overlay.querySelector("[data-catalogo-inventario-personalizado]")?.addEventListener("click", adicionarItemPersonalizadoDoCatalogo);
    overlay.querySelector("[data-catalogo-inventario-confirmar]")?.addEventListener("click", adicionarItemCatalogadoAoInventario);

    const inputBusca = overlay.querySelector("[data-catalogo-inventario-busca]");
    inputBusca?.addEventListener("input", event=>{
      catalogoInventarioBusca = String(event.target.value || "");
      renderizarListaCatalogoInventario();
    });

    const inputQuantidade = overlay.querySelector("[data-catalogo-inventario-quantidade]");
    inputQuantidade?.addEventListener("input", event=>{
      const valor = Number.parseInt(event.target.value, 10);
      if(Number.isFinite(valor) && valor >= 1){
        catalogoInventarioQuantidade = Math.min(9999, valor);
      }
    });
    inputQuantidade?.addEventListener("change", event=>{
      definirQuantidadeCatalogoInventario(event.target.value);
    });

    renderizarListaCatalogoInventario();
    atualizarResumoCatalogoInventario();
    requestAnimationFrame(()=>inputBusca?.focus());
  };

  document.addEventListener("keydown", event=>{
    if(event.key === "Escape" && catalogoInventarioOverlay){
      fecharCatalogoInventario();
    }
  });


  /* O núcleo é carregado antes deste módulo. Renderiza novamente os ataques
     para substituir os emojis pelos mesmos ícones visuais do inventário. */
  if(typeof renderizarArmados === "function"){
    renderizarArmados();
  }
})();
