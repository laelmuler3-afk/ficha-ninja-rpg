/* Ficha Ninja RPG 2.3.0 — Inventário, Carteira e Loja de Itens. */
(function(){
  "use strict";

  const ICONES_INVENTARIO = Object.freeze({
    "repelente": "assets/inventory-repelente.webp",
    "pergaminho-de-selamento": "assets/inventory-pergaminho-de-selamento.webp",
    "moeda-de-ouro": "assets/inventory-moeda-de-ouro.webp",
    "moeda-de-prata": "assets/inventory-moeda-de-prata.webp",
    "moeda-de-bronze": "assets/inventory-moeda-de-bronze.webp",
    "moeda-de-cobre": "assets/inventory-moeda-de-bronze.webp",
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

  const ALIASES_INVENTARIO = Object.freeze({
    "foice curta": "foice-curta",
    "foice": "foice-curta",
    "bastao": "bastao",
    "zarabatana": "zarabatana",
    "balista": "balista",
    "funda": "funda",
    "arco composto": "arco-composto",
    "arco longo": "arco-longo",
    "arco curto": "arco-curto",
    "shuriken de vento": "shuriken-de-vento",
    "shuriken de vento demoniaca": "shuriken-de-vento",
    "shuriken vento": "shuriken-de-vento",
    "tanto": "tanto",
    "dispositivo de disparo": "dispositivo-de-disparo",
    "dispositivo disparo": "dispositivo-de-disparo",
    "wakizaki": "wakizaki",
    "wakizashi": "wakizaki",
    "nunchaku": "nunchaku",
    "katana": "katana",
    "corrente": "corrente",
    "chicote": "chicote",
    "lanca": "lanca",
    "kit medico": "kit-medico",
    "kit de primeiros socorros": "kit-medico",
    "primeiros socorros": "kit-medico",
    "pilula de chakra": "pilula-de-chakra",
    "pilula chakra": "pilula-de-chakra",
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
    "moeda de cobre": "moeda-de-cobre",
    "cobre": "moeda-de-cobre",
    "moeda de bronze": "moeda-de-bronze",
    "bronze": "moeda-de-bronze",
    "repelente": "repelente",
    "pergaminho de selamento": "pergaminho-de-selamento",
    "pergaminho selamento": "pergaminho-de-selamento",
    "selamento": "pergaminho-de-selamento"
  });

  const MOEDAS = Object.freeze([
    { chave:"pd", sigla:"PD", nome:"Diamante", fator:1000000, slug:"moeda-de-diamante" },
    { chave:"po", sigla:"PO", nome:"Ouro", fator:10000, slug:"moeda-de-ouro" },
    { chave:"pp", sigla:"PP", nome:"Prata", fator:100, slug:"moeda-de-prata" },
    { chave:"pc", sigla:"PC", nome:"Cobre", fator:1, slug:"moeda-de-cobre" }
  ]);

  const FATOR_MOEDA = Object.freeze(
    MOEDAS.reduce((mapa, moeda)=>{
      mapa[moeda.chave] = moeda.fator;
      return mapa;
    }, {})
  );

  const CATALOGO_ITENS_INVENTARIO = Object.freeze([
    { slug:"kunai", nome:"Kunai", categoria:"Arremessáveis", tipo:"Arremessável", preco:{valor:2,moeda:"pc"}, dano:"1d6 cortante ou perfurante" },
    { slug:"shuriken", nome:"Shuriken", categoria:"Arremessáveis", tipo:"Arremessável", preco:{valor:2,moeda:"pc"}, dano:"1d4 perfurante" },
    { slug:"shuriken-de-vento", nome:"Shuriken de Vento Demoníaca", categoria:"Arremessáveis", tipo:"Arremessável", preco:{valor:5,moeda:"pp"}, dano:"1d10 cortante" },
    { slug:"agulhas", nome:"Agulha", categoria:"Arremessáveis", tipo:"Arremessável", preco:{valor:5,moeda:"pc"}, dano:"1 perfurante" },
    { slug:"papel-bomba", nome:"Papel bomba", categoria:"Arremessáveis", tipo:"Arremessável", preco:{valor:5,moeda:"pp"}, dano:"1d6 fogo" },

    { slug:"arco-curto", nome:"Arco curto", categoria:"Armas à distância", tipo:"Arma à distância", preco:{valor:20,moeda:"pp"}, dano:"1d6 perfurante" },
    { slug:"arco-longo", nome:"Arco longo", categoria:"Armas à distância", tipo:"Arma à distância", preco:{valor:50,moeda:"pp"}, dano:"1d8 perfurante" },
    { slug:"arco-composto", nome:"Arco composto", categoria:"Armas à distância", tipo:"Arma à distância", preco:{valor:1,moeda:"po"}, dano:"1d10 perfurante" },
    { slug:"funda", nome:"Funda", categoria:"Armas à distância", tipo:"Arma à distância", preco:{valor:1,moeda:"pp"}, dano:"1d6 contusão" },
    { slug:"balista", nome:"Balista", categoria:"Armas à distância", tipo:"Arma à distância", preco:{valor:20,moeda:"po"}, dano:"5d10 perfurante" },
    { slug:"dispositivo-de-disparo", nome:"Dispositivo de disparo", categoria:"Armas à distância", tipo:"Arma à distância", preco:{valor:1,moeda:"po"}, dano:"—" },
    { slug:"zarabatana", nome:"Zarabatana", categoria:"Armas à distância", tipo:"Arma à distância", preco:{valor:1,moeda:"po"}, dano:"1 perfurante" },

    { slug:"bastao", nome:"Bastão", categoria:"Corpo a corpo", tipo:"Arma corpo a corpo", preco:{valor:10,moeda:"pp"}, dano:"1d6 contusão" },
    { slug:"foice-curta", nome:"Foice curta", categoria:"Corpo a corpo", tipo:"Arma corpo a corpo", preco:{valor:5,moeda:"pp"}, dano:"1d6 cortante" },
    { slug:"lanca", nome:"Lança", categoria:"Corpo a corpo", tipo:"Arma corpo a corpo", preco:{valor:15,moeda:"pp"}, dano:"1d8 perfurante" },
    { slug:"chicote", nome:"Chicote", categoria:"Corpo a corpo", tipo:"Arma corpo a corpo", preco:{valor:10,moeda:"pp"}, dano:"1d8 cortante" },
    { slug:"tanto", nome:"Tanto", categoria:"Corpo a corpo", tipo:"Katana curta", preco:{valor:1,moeda:"po"}, dano:"1d6 cortante" },
    { slug:"wakizaki", nome:"Wakizaki", categoria:"Corpo a corpo", tipo:"Katana de uma mão", preco:{valor:2,moeda:"po"}, dano:"1d8 cortante" },
    { slug:"katana", nome:"Katana", categoria:"Corpo a corpo", tipo:"Katana de duas mãos", preco:{valor:5,moeda:"po"}, dano:"1d12 cortante" },
    { slug:"corrente", nome:"Corrente", categoria:"Corpo a corpo", tipo:"Arma corpo a corpo", preco:{valor:1,moeda:"po",por:"metro"}, dano:"Modificador de Força ×3" },
    { slug:"nunchaku", nome:"Nunchaku", categoria:"Corpo a corpo", tipo:"Arma corpo a corpo", preco:{valor:2,moeda:"po"}, dano:"Modificador de Destreza ×2" },

    { slug:"esfera", nome:"Esferas de metal", categoria:"Outras armas", tipo:"Arma", preco:null, dano:"—", observacao:"Preço aguardando tabela completa" },
    { slug:"fio-de-nilon", nome:"Fio de náilon", categoria:"Ferramentas", tipo:"Ferramenta", preco:null, dano:"—", observacao:"Preço aguardando tabela completa" },
    { slug:"pergaminho-de-selamento", nome:"Pergaminho de selamento", categoria:"Ferramentas", tipo:"Ferramenta", preco:null, dano:"—", observacao:"Preço aguardando tabela completa" },
    { slug:"repelente", nome:"Repelente", categoria:"Ferramentas", tipo:"Ferramenta", preco:null, dano:"—", observacao:"Preço aguardando tabela completa" },
    { slug:"comida", nome:"Comida", categoria:"Consumíveis", tipo:"Consumível", preco:null, dano:"—", observacao:"Preço aguardando tabela completa" },
    { slug:"kit-medico", nome:"Kit médico", categoria:"Consumíveis", tipo:"Consumível", preco:null, dano:"—", observacao:"Preço aguardando tabela completa" },
    { slug:"pilula-de-chakra", nome:"Pílula de chakra", categoria:"Consumíveis", tipo:"Consumível", preco:null, dano:"—", observacao:"Preço aguardando tabela completa" },
    { slug:"pedra-da-familia", nome:"Pedra da família", categoria:"Itens especiais", tipo:"Item especial", preco:null, dano:"—", observacao:"Não disponível para compra" }
  ]);

  window.CATALOGO_ITENS_INVENTARIO = CATALOGO_ITENS_INVENTARIO;

  const ALIASES_ORDENADOS = Object.keys(ALIASES_INVENTARIO).sort((a,b)=>b.length-a.length);
  const cacheSlugs = new Map();
  let detalheAberto = null;
  let menuAcoesAberto = null;
  let lojaBusca = "";
  let compraOverlay = null;
  let compraSlug = "";
  let compraQuantidade = 1;
  let compraEmAndamento = false;

  function normalizarNome(valor){
    if(typeof normalizarTextoInventario === "function"){
      return normalizarTextoInventario(valor).replace(/\s+/g," ");
    }
    return String(valor||"")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/\s+/g," ");
  }

  function escaparHtml(valor){
    return String(valor==null?"":valor)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function inteiroSeguro(valor){
    const numero = Number.parseInt(valor,10);
    return Number.isFinite(numero)&&numero>0?numero:0;
  }

  function slugIconeInventario(nome){
    const nomeNormalizado = normalizarNome(nome);
    if(!nomeNormalizado) return "";
    if(cacheSlugs.has(nomeNormalizado)) return cacheSlugs.get(nomeNormalizado);

    let slug = ALIASES_INVENTARIO[nomeNormalizado]||"";
    if(!slug){
      for(const alias of ALIASES_ORDENADOS){
        if(alias.length>2&&nomeNormalizado.includes(alias)){
          slug = ALIASES_INVENTARIO[alias];
          break;
        }
      }
    }
    cacheSlugs.set(nomeNormalizado,slug);
    return slug;
  }

  window.obterImagemInventarioPorNome = function(nome){
    const slug = slugIconeInventario(nome);
    return slug?(ICONES_INVENTARIO[slug]||""):"";
  };

  window.temImagemInventarioPorNome = function(nome){
    return Boolean(window.obterImagemInventarioPorNome(nome));
  };

  function imagemInventarioVisual(nome,classeExtra="",slug=null){
    const slugFinal = slug==null?slugIconeInventario(nome):slug;
    const src = slugFinal?(ICONES_INVENTARIO[slugFinal]||""):"";
    if(src){
      return `<img class="itemInventarioImg ${classeExtra}" src="${src}" alt="" loading="lazy" decoding="async" draggable="false">`;
    }
    const fallback = typeof iconeInventario === "function"?iconeInventario(nome):"🎒";
    return `<span class="itemInventarioIconeFallback ${classeExtra}">${fallback}</span>`;
  }

  function quantidadeInventarioVisual(item){
    const quantidade = Number.parseInt(item?.quantidade??0,10);
    return Number.isFinite(quantidade)&&quantidade>=0?quantidade:0;
  }

  function garantirCarteira(){
    if(!estado.carteira||typeof estado.carteira!=="object"||Array.isArray(estado.carteira)){
      estado.carteira = {};
    }
    MOEDAS.forEach(moeda=>{
      estado.carteira[moeda.chave] = inteiroSeguro(estado.carteira[moeda.chave]);
    });
    if(!Array.isArray(estado.carteiraHistorico)) estado.carteiraHistorico = [];
    return estado.carteira;
  }

  function copiarCarteira(carteira=garantirCarteira()){
    return MOEDAS.reduce((copia,moeda)=>{
      copia[moeda.chave] = inteiroSeguro(carteira[moeda.chave]);
      return copia;
    },{});
  }

  function valorTotalCarteira(carteira=garantirCarteira()){
    return MOEDAS.reduce((total,moeda)=>total+inteiroSeguro(carteira[moeda.chave])*moeda.fator,0);
  }

  function decomporValor(valorPc){
    let restante = Math.max(0,Math.floor(Number(valorPc)||0));
    const carteira = {};
    MOEDAS.forEach(moeda=>{
      carteira[moeda.chave] = Math.floor(restante/moeda.fator);
      restante %= moeda.fator;
    });
    return carteira;
  }

  function formatarNumero(valor){
    try{return new Intl.NumberFormat("pt-BR").format(valor);}catch(_erro){return String(valor);}
  }

  function formatarCarteira(carteira=garantirCarteira(),{incluirZeros=false}={}){
    const partes = MOEDAS
      .map(moeda=>({moeda,quantidade:inteiroSeguro(carteira[moeda.chave])}))
      .filter(item=>incluirZeros||item.quantidade>0)
      .map(item=>`${formatarNumero(item.quantidade)} ${item.moeda.sigla}`);
    return partes.length?partes.join(" • "):"0 PC";
  }

  function formatarPreco(preco,quantidade=1){
    if(!preco) return "Preço pendente";
    const total = inteiroSeguro(preco.valor)*Math.max(1,inteiroSeguro(quantidade));
    const moeda = MOEDAS.find(item=>item.chave===preco.moeda);
    const sufixo = preco.por?` por ${preco.por}`:"";
    return `${formatarNumero(total)} ${moeda?.sigla||String(preco.moeda||"").toUpperCase()}${quantidade===1?sufixo:""}`;
  }

  function valorPrecoEmPc(preco,quantidade=1){
    if(!preco||!FATOR_MOEDA[preco.moeda]) return null;
    return inteiroSeguro(preco.valor)*FATOR_MOEDA[preco.moeda]*Math.max(1,inteiroSeguro(quantidade));
  }

  function registrarHistoricoCarteira(registro){
    garantirCarteira();
    estado.carteiraHistorico.unshift({
      id:`wallet_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      data:Date.now(),
      ...registro
    });
    estado.carteiraHistorico = estado.carteiraHistorico.slice(0,40);
  }

  function persistirEstadoSeguro(){
    try{
      if(typeof persistirEstadoLocal === "function") return persistirEstadoLocal()!==false;
      localStorage.setItem(CHAVE,JSON.stringify(estado));
      return true;
    }catch(erro){
      console.warn("Não foi possível salvar a carteira/inventário.",erro);
      return false;
    }
  }

  function moedaPorSlug(slug){
    if(slug==="moeda-de-diamante") return "pd";
    if(slug==="moeda-de-ouro") return "po";
    if(slug==="moeda-de-prata") return "pp";
    if(slug==="moeda-de-cobre"||slug==="moeda-de-bronze") return "pc";
    return "";
  }

  function chaveMoedaDoItem(item){
    const slugExplicito=String(item?.catalogoSlug||item?.slug||"").trim();
    const porSlug=moedaPorSlug(slugExplicito);
    if(porSlug) return porSlug;

    const nome=normalizarNome(item?.nome);
    const nomesExatos={
      "moeda de diamante":"pd","diamante":"pd","pd":"pd","peca de diamante":"pd",
      "moeda de ouro":"po","ouro":"po","po":"po","peca de ouro":"po",
      "moeda de prata":"pp","prata":"pp","pp":"pp","peca de prata":"pp",
      "moeda de cobre":"pc","cobre":"pc","pc":"pc","peca de cobre":"pc",
      "moeda de bronze":"pc","bronze":"pc","peca de bronze":"pc"
    };
    return nomesExatos[nome]||"";
  }

  function migrarMoedasDoInventario(){
    garantirInventarioItens();
    garantirCarteira();
    let alterou = false;
    const mantidos = [];
    const migradas = {pd:0,po:0,pp:0,pc:0};

    estado.inventarioItens.forEach(item=>{
      const chave = chaveMoedaDoItem(item);
      if(!chave){
        mantidos.push(item);
        return;
      }
      const quantidade = quantidadeInventarioVisual(item);
      if(quantidade>0){
        estado.carteira[chave] += quantidade;
        migradas[chave] += quantidade;
      }
      alterou = true;
    });

    if(!alterou) return false;
    estado.inventarioItens = mantidos;
    registrarHistoricoCarteira({
      tipo:"migracao",
      titulo:"Moedas movidas para a Carteira",
      detalhe:formatarCarteira(migradas)
    });
    persistirEstadoSeguro();
    return true;
  }

  function fecharEstadoItemInventario(indice=null){
    if(indice==null||detalheAberto===indice) detalheAberto=null;
    menuAcoesAberto=null;
  }

  window.fecharDetalheItemInventario = function(indice=null){
    fecharEstadoItemInventario(indice);
    renderizarInventario();
  };

  window.abrirDetalheItemInventario = function(indice){
    garantirInventarioItens();
    if(!estado.inventarioItens[indice]) return;
    detalheAberto = detalheAberto===indice?null:indice;
    menuAcoesAberto = null;
    renderizarInventario();
  };

  window.alternarMenuItemInventario = function(indice){
    garantirInventarioItens();
    if(!estado.inventarioItens[indice]) return;
    detalheAberto = indice;
    menuAcoesAberto = menuAcoesAberto===indice?null:indice;
    renderizarInventario();
  };

  window.ajustarQtdItemInventario = function(indice,delta){
    garantirInventarioItens();
    const item = estado.inventarioItens[indice];
    if(!item) return;
    item.quantidade = Math.max(0,quantidadeInventarioVisual(item)+Number(delta||0));
    persistirEstadoSeguro();
    renderizarInventario();
  };

  window.confirmarQtdItemInventarioVisual = function(indice,valor){
    garantirInventarioItens();
    const item = estado.inventarioItens[indice];
    if(!item) return;
    item.quantidade = Math.max(0,Number.parseInt(valor,10)||0);
    persistirEstadoSeguro();
    renderizarInventario();
  };

  const usarItemInventarioOriginal = window.usarItemInventario;
  if(typeof usarItemInventarioOriginal === "function"){
    window.usarItemInventario = async function(indice){
      garantirInventarioItens();
      const item = estado.inventarioItens[indice];
      if(!item) return;
      const quantidadeAntes = quantidadeInventarioVisual(item);
      await usarItemInventarioOriginal(indice);
      const itemDepois = estado.inventarioItens[indice];
      const quantidadeDepois = itemDepois?quantidadeInventarioVisual(itemDepois):quantidadeAntes;
      if(itemDepois===item&&quantidadeDepois<quantidadeAntes){
        fecharEstadoItemInventario(indice);
        renderizarInventario();
      }
    };
  }

  window.editarNomeItemInventario = function(indice){
    garantirInventarioItens();
    const item = estado.inventarioItens[indice];
    if(!item) return;
    const novo = prompt("Nome do item:",String(item.nome||""));
    if(novo===null||!novo.trim()) return;
    item.nome = novo.trim();
    persistirEstadoSeguro();
    fecharEstadoItemInventario(indice);
    renderizarInventario();
  };

  window.removerItemInventario = async function(indice){
    garantirInventarioItens();
    const item = estado.inventarioItens[indice];
    if(!item) return;
    const nome = String(item.nome||"Item");
    const confirmado = typeof modalShinobi === "function"
      ? await modalShinobi("Excluir item?",`Excluir “${nome}” do inventário?\n\nEssa ação não pode ser desfeita.`)
      : confirm(`Excluir "${nome}" do inventário?`);
    if(!confirmado) return;
    const indiceAtual = estado.inventarioItens.indexOf(item);
    if(indiceAtual<0) return;
    estado.inventarioItens.splice(indiceAtual,1);
    persistirEstadoSeguro();
    fecharEstadoItemInventario();
    renderizarInventario();
  };

  function renderizarListaInventario(){
    garantirInventarioItens();
    const lista = document.getElementById("listaInventario");
    if(!lista) return;
    const itens = estado.inventarioItens;

    if(!itens.length){
      detalheAberto=null;
      lista.innerHTML='<div class="itemInventarioVazio">Nenhum item no inventário. Abra a Loja para comprar equipamentos.</div>';
      return;
    }

    if(detalheAberto!=null&&!itens[detalheAberto]) detalheAberto=null;
    if(menuAcoesAberto!=null&&!itens[menuAcoesAberto]) menuAcoesAberto=null;

    const html=[];
    itens.forEach((item,indice)=>{
      const nomeOriginal=String(item?.nome||"Item");
      const nomeSeguro=escaparHtml(nomeOriginal);
      const quantidade=quantidadeInventarioVisual(item);
      const aberto=detalheAberto===indice;
      const menuAberto=menuAcoesAberto===indice;
      const slug=item?.catalogoSlug||slugIconeInventario(nomeOriginal);
      const catalogado=CATALOGO_ITENS_INVENTARIO.find(catalogo=>catalogo.slug===slug);

      html.push(`
        <div class="itemInventario itemInventarioVisualCard ${aberto?"itemInventarioAberto":""}" role="button" tabindex="0" aria-expanded="${aberto}" onclick="abrirDetalheItemInventario(${indice})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();abrirDetalheItemInventario(${indice})}">
          <div class="itemInventarioImagemWrap">
            ${imagemInventarioVisual(nomeOriginal,"",slug)}
            <span class="itemInventarioQuantidadeBadge">${quantidade}</span>
          </div>
          <div class="itemInventarioNomeMini" title="${nomeSeguro}">${nomeSeguro}</div>
        </div>
      `);

      if(!aberto) return;
      const detalhes=[];
      if(catalogado?.dano&&catalogado.dano!=="—") detalhes.push(`<span><b>Dano</b>${escaparHtml(catalogado.dano)}</span>`);
      if(catalogado?.tipo) detalhes.push(`<span><b>Tipo</b>${escaparHtml(catalogado.tipo)}</span>`);
      if(item?.adquiridoPor==="loja") detalhes.push('<span><b>Origem</b>Comprado na loja</span>');

      html.push(`
        <div class="itemInventarioDetalhe">
          <div class="itemInventarioMenuWrap">
            <button type="button" class="itemInventarioMenuBtn" aria-label="Mais opções de ${nomeSeguro}" aria-haspopup="menu" aria-expanded="${menuAberto}" onclick="event.stopPropagation();alternarMenuItemInventario(${indice})">⋮</button>
            <div class="itemInventarioMenuBalao ${menuAberto?"aberto":""}" role="menu">
              <button type="button" class="itemInventarioExcluirMenu" role="menuitem" onclick="event.stopPropagation();removerItemInventario(${indice})">Excluir item</button>
            </div>
          </div>
          <div class="itemInventarioDetalheImagem">${imagemInventarioVisual(nomeOriginal,"itemInventarioImgGrande",slug)}</div>
          <div class="itemInventarioDetalheConteudo">
            <div class="itemInventarioDetalheNome">${nomeSeguro}</div>
            ${detalhes.length?`<div class="itemInventarioMetadados">${detalhes.join("")}</div>`:""}
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
    lista.innerHTML=html.join("");
  }

  function renderizarCarteira(){
    const host=document.getElementById("carteiraConteudo");
    if(!host) return;
    const carteira=garantirCarteira();
    const total=valorTotalCarteira(carteira);
    const historico=estado.carteiraHistorico||[];

    host.innerHTML=`
      <section class="carteiraResumoCard">
        <span>VALOR TOTAL</span>
        <strong>${escaparHtml(formatarCarteira(carteira))}</strong>
        <small>Equivalente a ${formatarNumero(total)} PC</small>
      </section>

      <div class="carteiraMoedasGrid">
        ${MOEDAS.map(moeda=>`
          <article class="carteiraMoedaCard carteiraMoeda-${moeda.chave}">
            <div class="carteiraMoedaImagem">${imagemInventarioVisual(`Moeda de ${moeda.nome}`,"",moeda.slug)}</div>
            <div class="carteiraMoedaInfo"><strong>${moeda.sigla}</strong><small>${moeda.nome}</small></div>
            <div class="carteiraMoedaControle">
              <button type="button" onclick="ajustarMoedaCarteira('${moeda.chave}',-1)" aria-label="Remover uma moeda de ${moeda.nome}">−</button>
              <input type="number" min="0" inputmode="numeric" value="${inteiroSeguro(carteira[moeda.chave])}" onchange="definirMoedaCarteira('${moeda.chave}',this.value)" aria-label="Quantidade de moedas de ${moeda.nome}">
              <button type="button" onclick="ajustarMoedaCarteira('${moeda.chave}',1)" aria-label="Adicionar uma moeda de ${moeda.nome}">+</button>
            </div>
          </article>
        `).join("")}
      </div>

      <div class="carteiraConversao">
        <div><strong>Conversão automática</strong><span>1 PD = 100 PO · 1 PO = 100 PP · 1 PP = 100 PC</span></div>
        <button type="button" onclick="organizarMoedasCarteira()">Organizar moedas</button>
      </div>

      <details class="carteiraHistorico" ${historico.length?"":"disabled"}>
        <summary><span>Histórico da carteira</span><small>${historico.length} ${historico.length===1?"movimentação":"movimentações"}</small></summary>
        <div class="carteiraHistoricoLista">
          ${historico.length?historico.slice(0,20).map(item=>`
            <article>
              <div><strong>${escaparHtml(item.titulo||"Movimentação")}</strong><small>${new Date(Number(item.data)||Date.now()).toLocaleString("pt-BR")}</small></div>
              <span>${escaparHtml(item.detalhe||"")}</span>
            </article>
          `).join(""):'<p>Nenhuma movimentação registrada.</p>'}
        </div>
      </details>
    `;
  }

  window.definirMoedaCarteira=function(chave,valor){
    if(!FATOR_MOEDA[chave]) return;
    const carteira=garantirCarteira();
    carteira[chave]=inteiroSeguro(valor);
    persistirEstadoSeguro();
    renderizarCarteira();
    renderizarSaldoLoja();
  };

  window.ajustarMoedaCarteira=function(chave,delta){
    if(!FATOR_MOEDA[chave]) return;
    const carteira=garantirCarteira();
    carteira[chave]=Math.max(0,inteiroSeguro(carteira[chave])+Number(delta||0));
    persistirEstadoSeguro();
    renderizarCarteira();
    renderizarSaldoLoja();
  };

  window.organizarMoedasCarteira=async function(){
    const carteira=garantirCarteira();
    const antes=copiarCarteira(carteira);
    const depois=decomporValor(valorTotalCarteira(carteira));
    if(formatarCarteira(antes,{incluirZeros:true})===formatarCarteira(depois,{incluirZeros:true})){
      if(typeof avisoShinobi==="function") await avisoShinobi("Carteira organizada","As moedas já estão organizadas nas maiores unidades possíveis.");
      return;
    }
    estado.carteira=depois;
    registrarHistoricoCarteira({tipo:"conversao",titulo:"Moedas organizadas",detalhe:`${formatarCarteira(antes)} → ${formatarCarteira(depois)}`});
    persistirEstadoSeguro();
    renderizarCarteira();
    renderizarSaldoLoja();
  };

  function itemCatalogoPorSlug(slug){
    return CATALOGO_ITENS_INVENTARIO.find(item=>item.slug===slug)||null;
  }

  function quantidadeCatalogadaNoInventario(slug){
    garantirInventarioItens();
    return estado.inventarioItens.reduce((total,item)=>{
      const itemSlug=item?.catalogoSlug||slugIconeInventario(item?.nome);
      return itemSlug===slug?total+quantidadeInventarioVisual(item):total;
    },0);
  }

  function itensLojaFiltrados(){
    const termo=normalizarNome(lojaBusca);
    if(!termo) return [...CATALOGO_ITENS_INVENTARIO];
    return CATALOGO_ITENS_INVENTARIO.filter(item=>{
      const texto=normalizarNome(`${item.nome} ${item.categoria} ${item.tipo||""} ${item.dano||""} ${item.slug.replace(/-/g," ")}`);
      return texto.includes(termo);
    });
  }

  function htmlCardLoja(item){
    const possui=quantidadeCatalogadaNoInventario(item.slug);
    const disponivel=Boolean(item.preco);
    return `
      <article class="lojaItemCard ${disponivel?"":"lojaItemIndisponivel"}">
        <div class="lojaItemImagem">
          ${imagemInventarioVisual(item.nome,"lojaItemImg",item.slug)}
          ${possui>0?`<small class="lojaItemPossui">Possui ${possui}</small>`:""}
        </div>
        <div class="lojaItemConteudo">
          <small>${escaparHtml(item.tipo||item.categoria)}</small>
          <strong>${escaparHtml(item.nome)}</strong>
          <span>${escaparHtml(item.preco?(item.dano||"Sem descrição"):(item.observacao||"Preço aguardando tabela completa"))}</span>
        </div>
        <div class="lojaItemRodape">
          <b>${escaparHtml(formatarPreco(item.preco))}</b>
          <button type="button" ${disponivel?`onclick="abrirCompraLoja('${item.slug}')"`:"disabled"}>${disponivel?"Comprar":"Indisponível"}</button>
        </div>
      </article>
    `;
  }

  function renderizarSaldoLoja(){
    const saldo=document.getElementById("lojaSaldoAtual");
    if(saldo) saldo.textContent=formatarCarteira(garantirCarteira());
    if(compraOverlay) atualizarCompraOverlay();
  }

  function renderizarLoja(){
    const host=document.getElementById("lojaCatalogo");
    const contador=document.getElementById("lojaContador");
    if(!host) return;
    const itens=itensLojaFiltrados();
    if(contador) contador.textContent=`${itens.length} ${itens.length===1?"item":"itens"}`;
    renderizarSaldoLoja();

    if(!itens.length){
      host.innerHTML='<div class="lojaSemResultado">Nenhum item encontrado.</div>';
      return;
    }

    const categorias=[];
    itens.forEach(item=>{
      let grupo=categorias.find(categoria=>categoria.nome===item.categoria);
      if(!grupo){grupo={nome:item.categoria,itens:[]};categorias.push(grupo);}
      grupo.itens.push(item);
    });
    host.innerHTML=categorias.map(categoria=>`
      <section class="lojaCategoria">
        <h3>${escaparHtml(categoria.nome)}</h3>
        <div class="lojaGrid">${categoria.itens.map(htmlCardLoja).join("")}</div>
      </section>
    `).join("");
  }

  window.filtrarLoja=function(valor){
    lojaBusca=String(valor||"");
    renderizarLoja();
  };

  function atualizarCompraOverlay(){
    if(!compraOverlay) return;
    const item=itemCatalogoPorSlug(compraSlug);
    if(!item||!item.preco) return;
    const custoPc=valorPrecoEmPc(item.preco,compraQuantidade);
    const saldoPc=valorTotalCarteira();
    const total=compraOverlay.querySelector("[data-compra-total]");
    const quantidade=compraOverlay.querySelector("[data-compra-quantidade]");
    const saldoDepois=compraOverlay.querySelector("[data-compra-saldo-depois]");
    const confirmar=compraOverlay.querySelector("[data-compra-confirmar]");
    if(quantidade) quantidade.value=String(compraQuantidade);
    if(total) total.textContent=formatarPreco(item.preco,compraQuantidade);
    if(saldoDepois){
      saldoDepois.textContent=saldoPc>=custoPc?formatarCarteira(decomporValor(saldoPc-custoPc)):`Faltam ${formatarNumero(custoPc-saldoPc)} PC`;
      saldoDepois.classList.toggle("insuficiente",saldoPc<custoPc);
    }
    if(confirmar){
      confirmar.disabled=compraEmAndamento||saldoPc<custoPc;
      confirmar.textContent=compraEmAndamento?"Processando...":"Confirmar compra";
    }
  }

  function fecharCompraLoja(){
    compraOverlay?.remove();
    compraOverlay=null;
    compraSlug="";
    compraQuantidade=1;
    compraEmAndamento=false;
    document.body.classList.remove("compraLojaAberta");
  }

  window.fecharCompraLoja=fecharCompraLoja;

  window.alterarQuantidadeCompra=function(delta){
    compraQuantidade=Math.min(9999,Math.max(1,compraQuantidade+Number(delta||0)));
    atualizarCompraOverlay();
  };

  window.definirQuantidadeCompra=function(valor){
    compraQuantidade=Math.min(9999,Math.max(1,Number.parseInt(valor,10)||1));
    atualizarCompraOverlay();
  };

  window.abrirCompraLoja=function(slug){
    const item=itemCatalogoPorSlug(slug);
    if(!item?.preco) return;
    fecharCompraLoja();
    compraSlug=slug;
    compraQuantidade=1;

    const overlay=document.createElement("div");
    overlay.className="compraLojaOverlay";
    overlay.innerHTML=`
      <div class="compraLojaBox" role="dialog" aria-modal="true" aria-labelledby="compraLojaTitulo">
        <header>
          <div><small>LOJA DE ITENS</small><h3 id="compraLojaTitulo">${escaparHtml(item.nome)}</h3></div>
          <button type="button" onclick="fecharCompraLoja()" aria-label="Fechar">×</button>
        </header>
        <div class="compraLojaCorpo">
          <div class="compraLojaItemImagem">${imagemInventarioVisual(item.nome,"compraLojaImg",item.slug)}</div>
          <div class="compraLojaDetalhes">
            <span><b>Tipo</b>${escaparHtml(item.tipo||item.categoria)}</span>
            <span><b>Dano</b>${escaparHtml(item.dano||"—")}</span>
            <span><b>Preço unitário</b>${escaparHtml(formatarPreco(item.preco))}</span>
          </div>
          <label class="compraLojaQuantidade">
            <span>${item.preco.por==="metro"?"Metros":"Quantidade"}</span>
            <div><button type="button" onclick="alterarQuantidadeCompra(-1)">−</button><input data-compra-quantidade type="number" min="1" max="9999" value="1" onchange="definirQuantidadeCompra(this.value)"><button type="button" onclick="alterarQuantidadeCompra(1)">+</button></div>
          </label>
          <div class="compraLojaResumo">
            <span><small>Total da compra</small><strong data-compra-total></strong></span>
            <span><small>Saldo atual</small><strong>${escaparHtml(formatarCarteira())}</strong></span>
            <span><small>Saldo após compra</small><strong data-compra-saldo-depois></strong></span>
          </div>
        </div>
        <footer><button type="button" class="compraLojaCancelar" onclick="fecharCompraLoja()">Cancelar</button><button type="button" class="compraLojaConfirmar" data-compra-confirmar onclick="confirmarCompraLoja()">Confirmar compra</button></footer>
      </div>
    `;
    compraOverlay=overlay;
    document.body.appendChild(overlay);
    document.body.classList.add("compraLojaAberta");
    overlay.addEventListener("click",event=>{if(event.target===overlay) fecharCompraLoja();});
    atualizarCompraOverlay();
  };

  function adicionarItemComprado(itemCatalogado,quantidade){
    garantirInventarioItens();
    const indice=estado.inventarioItens.findIndex(item=>{
      const slug=item?.catalogoSlug||slugIconeInventario(item?.nome);
      return slug===itemCatalogado.slug;
    });
    if(indice>=0){
      const item=estado.inventarioItens[indice];
      item.quantidade=quantidadeInventarioVisual(item)+quantidade;
      item.catalogoSlug=itemCatalogado.slug;
      item.adquiridoPor=item.adquiridoPor||"loja";
      return;
    }
    estado.inventarioItens.push({
      nome:itemCatalogado.nome,
      quantidade,
      catalogoSlug:itemCatalogado.slug,
      adquiridoPor:"loja",
      tipo:itemCatalogado.tipo||"",
      dano:itemCatalogado.dano||""
    });
  }

  window.confirmarCompraLoja=async function(){
    if(compraEmAndamento) return;
    const item=itemCatalogoPorSlug(compraSlug);
    if(!item?.preco) return;
    const quantidade=Math.max(1,inteiroSeguro(compraQuantidade));
    const custoPc=valorPrecoEmPc(item.preco,quantidade);
    const saldoPc=valorTotalCarteira();
    if(saldoPc<custoPc){
      if(typeof avisoShinobi==="function") await avisoShinobi("Moedas insuficientes",`Preço: ${formatarPreco(item.preco,quantidade)}\nVocê possui: ${formatarCarteira()}\nFaltam: ${formatarNumero(custoPc-saldoPc)} PC`);
      return;
    }

    const carteiraAntes=copiarCarteira();
    const carteiraDepois=decomporValor(saldoPc-custoPc);
    const mensagem=`${quantidade}x ${item.nome}\n\nPreço total: ${formatarPreco(item.preco,quantidade)}\nSaldo antes: ${formatarCarteira(carteiraAntes)}\nSaldo depois: ${formatarCarteira(carteiraDepois)}\n\nO troco será convertido automaticamente.`;
    const confirmado=typeof modalShinobi==="function"?await modalShinobi("Confirmar compra",mensagem):confirm(mensagem);
    if(!confirmado) return;

    compraEmAndamento=true;
    atualizarCompraOverlay();
    const inventarioAntes=JSON.parse(JSON.stringify(estado.inventarioItens||[]));
    const historicoAntes=JSON.parse(JSON.stringify(estado.carteiraHistorico||[]));
    try{
      estado.carteira=carteiraDepois;
      adicionarItemComprado(item,quantidade);
      registrarHistoricoCarteira({
        tipo:"compra",
        titulo:`Compra: ${item.nome}`,
        detalhe:`-${formatarPreco(item.preco,quantidade)} · ${quantidade} ${item.preco.por==="metro"?"m":"un."}`
      });
      if(!persistirEstadoSeguro()) throw new Error("A compra não pôde ser salva no aparelho.");
      fecharCompraLoja();
      renderizarInventario();
      if(typeof registrarLog==="function") registrarLog(`Comprou ${quantidade}x ${item.nome} por ${formatarPreco(item.preco,quantidade)}.`);
      if(typeof avisoShinobi==="function") await avisoShinobi("Compra realizada",`${item.nome} foi adicionado ao inventário.\n\nNovo saldo: ${formatarCarteira()}`);
    }catch(erro){
      estado.carteira=carteiraAntes;
      estado.inventarioItens=inventarioAntes;
      estado.carteiraHistorico=historicoAntes;
      persistirEstadoSeguro();
      compraEmAndamento=false;
      atualizarCompraOverlay();
      if(typeof avisoShinobi==="function") await avisoShinobi("Compra não concluída",String(erro?.message||erro));
    }
  };

  const adicionarItemInventarioOriginal=window.adicionarItemInventario;

  window.adicionarItemSemCusto=function(){
    if(typeof adicionarItemInventarioOriginal!=="function") return;
    adicionarItemInventarioOriginal();
    migrarMoedasDoInventario();
    renderizarInventario();
  };

  window.adicionarItemInventario=function(){
    abrirAbaInventario("loja");
  };

  window.abrirAbaInventario=function(aba){
    const permitidas=["carteira","itens","loja"];
    const escolhida=permitidas.includes(aba)?aba:"itens";
    try{localStorage.setItem("shinobi_inventario_aba_v1",escolhida);}catch(_erro){}
    document.querySelectorAll("[data-inventario-aba]").forEach(botao=>{
      const ativo=botao.dataset.inventarioAba===escolhida;
      botao.classList.toggle("ativo",ativo);
      botao.setAttribute("aria-selected",String(ativo));
    });
    document.querySelectorAll("[data-inventario-painel]").forEach(painel=>{
      const ativo=painel.dataset.inventarioPainel===escolhida;
      painel.classList.toggle("ativo",ativo);
      painel.hidden=!ativo;
    });
    if(escolhida==="carteira") renderizarCarteira();
    if(escolhida==="itens") renderizarListaInventario();
    if(escolhida==="loja"){
      renderizarLoja();
      requestAnimationFrame(()=>document.getElementById("lojaBusca")?.focus());
    }
  };

  window.renderizarInventario=function(){
    migrarMoedasDoInventario();
    renderizarListaInventario();
    renderizarCarteira();
    renderizarLoja();
    let aba="itens";
    try{aba=localStorage.getItem("shinobi_inventario_aba_v1")||"itens";}catch(_erro){}
    abrirAbaInventario(aba);
  };

  document.addEventListener("click",event=>{
    if(menuAcoesAberto!=null&&!event.target.closest?.(".itemInventarioMenuWrap")){
      menuAcoesAberto=null;
      renderizarListaInventario();
    }
  });

  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&compraOverlay) fecharCompraLoja();
  });

  window.addEventListener("pageshow",()=>{
    setTimeout(()=>{
      migrarMoedasDoInventario();
      renderizarInventario();
    },0);
  });

  window.ShinobiCarteiraLoja=Object.freeze({
    moedas:MOEDAS,
    catalogo:CATALOGO_ITENS_INVENTARIO,
    decomporValor,
    valorTotalCarteira,
    valorPrecoEmPc,
    formatarCarteira,
    formatarPreco,
    slugIconeInventario
  });

  migrarMoedasDoInventario();
  renderizarInventario();
  if(typeof renderizarArmados==="function") renderizarArmados();
})();
