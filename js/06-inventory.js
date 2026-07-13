/* Shinobi 1.3.0 — arquivo modular gerado preservando a ordem do app original. */

/* ===== Inventário visual compacto com ícones embutidos ===== */
(function(){
  const ICONES_INVENTARIO_EMBUTIDOS = {"repelente":"assets/inventory-repelente.webp","pergaminho-de-selamento":"assets/inventory-pergaminho-de-selamento.webp","moeda-de-ouro":"assets/inventory-moeda-de-ouro.webp","moeda-de-prata":"assets/inventory-moeda-de-prata.webp","moeda-de-bronze":"assets/inventory-moeda-de-bronze.webp","moeda-de-diamante":"assets/inventory-moeda-de-diamante.webp","kunai":"assets/inventory-kunai.webp","shuriken":"assets/inventory-shuriken.webp","agulhas":"assets/inventory-agulhas.webp","fio-de-nilon":"assets/inventory-fio-de-nilon.webp","pedra-da-familia":"assets/inventory-pedra-da-familia.webp","papel-bomba":"assets/inventory-papel-bomba.webp","comida":"assets/inventory-comida.webp","esfera":"assets/inventory-esfera.webp","pilula-de-chakra":"assets/inventory-pilula-de-chakra.webp"};
  const ALIASES_INVENTARIO = {
    "pilula de chakra":"pilula-de-chakra",
    "pilula chakra":"pilula-de-chakra",
    "pílula de chakra":"pilula-de-chakra",
    "chakra":"pilula-de-chakra",
    "esfera":"esfera",
    "esferas de metal":"esfera",
    "comida":"comida",
    "alimento":"comida",
    "papel bomba":"papel-bomba",
    "papeis bomba":"papel-bomba",
    "papéis bomba":"papel-bomba",
    "bomba":"papel-bomba",
    "pedra da familia":"pedra-da-familia",
    "pedra da família":"pedra-da-familia",
    "pedra de familia":"pedra-da-familia",
    "pedra de família":"pedra-da-familia",
    "fio de nilon":"fio-de-nilon",
    "fio de nylon":"fio-de-nilon",
    "nylon":"fio-de-nilon",
    "nilon":"fio-de-nilon",
    "agulha":"agulhas",
    "agulhas":"agulhas",
    "senbon":"agulhas",
    "shuriken":"shuriken",
    "kunai":"kunai",
    "moeda de diamante":"moeda-de-diamante",
    "diamante":"moeda-de-diamante",
    "moeda de ouro":"moeda-de-ouro",
    "ouro":"moeda-de-ouro",
    "moeda de prata":"moeda-de-prata",
    "prata":"moeda-de-prata",
    "moeda de bronze":"moeda-de-bronze",
    "bronze":"moeda-de-bronze",
    "repelente":"repelente",
    "pergaminho de selamento":"pergaminho-de-selamento",
    "pergaminho selamento":"pergaminho-de-selamento",
    "selamento":"pergaminho-de-selamento"
  };

  function normalizarInventarioVisual(valor){
    return String(valor||"")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g,"")
      .replace(/\s+/g," ");
  }

  function escaparInventarioVisual(valor){
    return String(valor==null?"":valor)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function slugIconeInventarioVisual(nome){
    const alvo=normalizarInventarioVisual(nome);
    if(!alvo)return "";
    if(ALIASES_INVENTARIO[alvo])return ALIASES_INVENTARIO[alvo];

    const chaves=Object.keys(ALIASES_INVENTARIO).sort(function(a,b){return b.length-a.length;});
    for(const chave of chaves){
      if(chave.length>2 && alvo.includes(chave))return ALIASES_INVENTARIO[chave];
    }
    return "";
  }

  function imagemInventarioVisual(nome, classeExtra){
    const slug=slugIconeInventarioVisual(nome);
    const src=slug ? ICONES_INVENTARIO_EMBUTIDOS[slug] : "";
    if(src){
      return `<img class="itemInventarioImg ${classeExtra||""}" src="${src}" alt="" loading="lazy" decoding="async">`;
    }
    const fallback=(typeof iconeInventario==="function" ? iconeInventario(nome) : "🎒");
    return `<span class="itemInventarioIconeFallback ${classeExtra||""}">${fallback}</span>`;
  }

  function quantidadeInventarioVisual(item){
    let qtd=parseInt(item&&item.quantidade!=null?item.quantidade:0,10);
    if(isNaN(qtd)||qtd<0)qtd=0;
    return qtd;
  }

  window.abrirDetalheItemInventario = function(i){
    garantirInventarioItens();
    window.__inventarioDetalheAberto = (window.__inventarioDetalheAberto===i ? null : i);
    renderizarInventario();
  };

  window.fecharDetalheItemInventario = function(){
    window.__inventarioDetalheAberto = null;
    renderizarInventario();
  };

  window.ajustarQtdItemInventario = function(i,delta){
    garantirInventarioItens();
    if(!estado.inventarioItens[i])return;
    const atual=quantidadeInventarioVisual(estado.inventarioItens[i]);
    const novo=Math.max(0, atual + Number(delta||0));
    alterarQtdItemInventario(i, novo);
    renderizarInventario();
  };

  window.confirmarQtdItemInventarioVisual = function(i,valor){
    alterarQtdItemInventario(i,valor);
    renderizarInventario();
  };

  window.renderizarInventario = function(){
    garantirInventarioItens();
    const lista=document.getElementById("listaInventario");
    if(!lista)return;

    const itens=estado.inventarioItens||[];
    if(!itens.length){
      lista.innerHTML='<div class="itemInventarioVazio">Nenhum item adicionado</div>';
      window.__inventarioDetalheAberto=null;
      return;
    }

    if(window.__inventarioDetalheAberto!=null && !itens[window.__inventarioDetalheAberto]){
      window.__inventarioDetalheAberto=null;
    }

    const html=[];
    itens.forEach(function(item,i){
      const nomeOriginal=String(item&&item.nome?item.nome:"Item");
      const nome=escaparInventarioVisual(nomeOriginal);
      const qtd=quantidadeInventarioVisual(item);
      const aberto=window.__inventarioDetalheAberto===i;

      html.push(`
        <div class="itemInventario itemInventarioVisualCard ${aberto?"itemInventarioAberto":""}" role="button" tabindex="0" onclick="abrirDetalheItemInventario(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();abrirDetalheItemInventario(${i})}">
          <div class="itemInventarioImagemWrap">
            ${imagemInventarioVisual(nomeOriginal)}
            <span class="itemInventarioQuantidadeBadge">${qtd}</span>
          </div>
          <div class="itemInventarioNomeMini" title="${nome}">${nome}</div>
        </div>
      `);

      if(aberto){
        html.push(`
          <div class="itemInventarioDetalhe">
            <div class="itemInventarioDetalheImagem">
              ${imagemInventarioVisual(nomeOriginal,"itemInventarioImgGrande")}
            </div>
            <div class="itemInventarioDetalheConteudo">
              <div class="itemInventarioDetalheNome">${nome}</div>
              <div class="itemInventarioQtdControle">
                <button type="button" onclick="event.stopPropagation();ajustarQtdItemInventario(${i},-1)">−</button>
                <input type="number" min="0" inputmode="numeric" value="${qtd}" onchange="confirmarQtdItemInventarioVisual(${i},this.value)">
                <button type="button" onclick="event.stopPropagation();ajustarQtdItemInventario(${i},1)">+</button>
              </div>
              <div class="itemInventarioAcoes">
                <button type="button" onclick="event.stopPropagation();usarItemInventario(${i})">Usar</button>
                <button type="button" onclick="event.stopPropagation();editarNomeItemInventario(${i})">Editar</button>
                <button type="button" class="btnExcluirItemVisual" onclick="event.stopPropagation();removerItemInventario(${i})">Excluir</button>
              </div>
            </div>
          </div>
        `);
      }
    });

    lista.innerHTML=html.join("");
  };
})();
