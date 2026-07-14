/* Shinobi 1.3.7 — perfil, Kekkei Genkai e fundo revisados. */

/* ======================================================================
   Kekkei Genkai como natureza dinâmica dos jutsus
   ====================================================================== */
(function(){
  "use strict";

  if(window.__kekkeiJutsuDinamicoAtivo) return;
  window.__kekkeiJutsuDinamicoAtivo = true;

  const ELEMENTOS_JUTSU_FIXOS = Object.freeze([
    {valor:"katon",  nome:"KATON",  icone:"🔥", classe:"jutsu-katon"},
    {valor:"raiton", nome:"RAITON", icone:"⚡", classe:"jutsu-raiton"},
    {valor:"fuuton", nome:"FUUTON", icone:"🌪️", classe:"jutsu-fuuton"},
    {valor:"suiton", nome:"SUITON", icone:"💧", classe:"jutsu-suiton"},
    {valor:"doton",  nome:"DOTON",  icone:"🪨", classe:"jutsu-doton"},
    {valor:"yin",    nome:"YINTON", icone:"🌑", classe:"jutsu-yin"},
    {valor:"yang",   nome:"YOUTON", icone:"☀️", classe:"jutsu-yang"},
    {valor:"neutro", nome:"NEUTRO", icone:"✨", classe:"jutsu-neutro"}
  ]);

  const ELEMENTOS_POR_VALOR = new Map(
    ELEMENTOS_JUTSU_FIXOS.map(item=>[item.valor, item])
  );

  function normalizarKekkeiJutsu(valor){
    return String(valor || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function criarIdKekkeiJutsu(){
    return "kg_" + Date.now().toString(36) + "_" +
      Math.random().toString(36).slice(2, 10);
  }

  /*
   * Mantém compatibilidade com Kekkei Genkai antigas e garante IDs
   * estáveis. Retorna true somente quando alguma migração foi necessária.
   */
  window.garantirKekkeiArray = function(){
    let alterou = false;

    if(!Array.isArray(estado.kekkeiGenkai)){
      estado.kekkeiGenkai = [];
      alterou = true;
    }

    const idsUsados = new Set();

    estado.kekkeiGenkai.forEach(kekkei=>{
      if(!kekkei || typeof kekkei !== "object") return;

      let id = String(kekkei.id || "").trim();

      if(!id || idsUsados.has(id)){
        do{
          id = criarIdKekkeiJutsu();
        }while(idsUsados.has(id));

        kekkei.id = id;
        alterou = true;
      }

      idsUsados.add(id);
    });

    return alterou;
  };

  function kekkeisDisponiveisParaJutsu(){
    window.garantirKekkeiArray();

    return estado.kekkeiGenkai
      .filter(kekkei=>kekkei && String(kekkei.nome || "").trim())
      .map(kekkei=>({
        id:String(kekkei.id),
        nome:String(kekkei.nome).trim()
      }));
  }

  function localizarKekkei(referencia){
    window.garantirKekkeiArray();

    const lista = estado.kekkeiGenkai || [];
    const porId = lista.find(kekkei=>
      kekkei && String(kekkei.id) === referencia
    );

    if(porId) return porId;

    const nomeNormalizado = normalizarKekkeiJutsu(referencia);
    return lista.find(kekkei=>
      kekkei &&
      normalizarKekkeiJutsu(kekkei.nome) === nomeNormalizado
    );
  }

  window.dadosElementoJutsu = function(elemento){
    const valor = String(elemento || "neutro");
    const fixo = ELEMENTOS_POR_VALOR.get(valor);

    if(fixo){
      return {
        nome:fixo.nome,
        icone:fixo.icone,
        classe:fixo.classe
      };
    }

    if(valor.startsWith("kekkei:")){
      const kekkei = localizarKekkei(valor.slice(7));

      return {
        nome:kekkei
          ? String(kekkei.nome).toUpperCase()
          : "KEKKEI GENKAI REMOVIDA",
        icone:"🧬",
        classe:"jutsu-kekkei"
      };
    }

    return {
      nome:"NEUTRO",
      icone:"✨",
      classe:"jutsu-neutro"
    };
  };

  window.escolherElementoJutsuPrompt = function(indice){
    const jutsu = (estado.jutsus || [])[indice];
    if(!jutsu) return;

    const kekkeis = kekkeisDisponiveisParaJutsu();
    const linhas = ELEMENTOS_JUTSU_FIXOS.map((item, posicao)=>
      (posicao + 1) + " - " +
      item.nome.charAt(0) + item.nome.slice(1).toLowerCase()
    );

    kekkeis.forEach((kekkei, posicao)=>{
      linhas.push(
        (ELEMENTOS_JUTSU_FIXOS.length + posicao + 1) +
        " - Kekkei Genkai: " + kekkei.nome
      );
    });

    const atual = window.dadosElementoJutsu(
      jutsu.elemento || "katon"
    ).nome;

    const escolha = prompt([
      "Escolha a natureza do jutsu:",
      "",
      linhas.join("\n"),
      "",
      "Atual: " + atual
    ].join("\n"), "");

    if(escolha === null) return;

    const texto = String(escolha).trim();
    if(!texto) return;

    const numero = Number(texto);
    let novoElemento = "";

    if(Number.isInteger(numero)){
      if(numero >= 1 && numero <= ELEMENTOS_JUTSU_FIXOS.length){
        novoElemento = ELEMENTOS_JUTSU_FIXOS[numero - 1].valor;
      }else{
        const indiceKekkei =
          numero - ELEMENTOS_JUTSU_FIXOS.length - 1;

        if(kekkeis[indiceKekkei]){
          novoElemento = "kekkei:" + kekkeis[indiceKekkei].id;
        }
      }
    }else{
      const textoNormalizado = normalizarKekkeiJutsu(texto);
      const fixoDigitado = ELEMENTOS_JUTSU_FIXOS.find(item=>
        normalizarKekkeiJutsu(item.valor) === textoNormalizado ||
        normalizarKekkeiJutsu(item.nome) === textoNormalizado
      );

      if(fixoDigitado){
        novoElemento = fixoDigitado.valor;
      }else{
        const nomeSemPrefixo = texto.replace(
          /^kekkei\s*genkai\s*:\s*/i,
          ""
        );

        const nomeNormalizado = normalizarKekkeiJutsu(nomeSemPrefixo);
        const kekkeiDigitada = kekkeis.find(kekkei=>
          normalizarKekkeiJutsu(kekkei.nome) === nomeNormalizado
        );

        if(kekkeiDigitada){
          novoElemento = "kekkei:" + kekkeiDigitada.id;
        }
      }
    }

    if(!novoElemento){
      alert(
        "Opção inválida. Escolha um dos números ou digite " +
        "o nome de uma Kekkei Genkai cadastrada."
      );
      return;
    }

    jutsu.elemento = novoElemento;

    if(typeof persistirSemRender === "function"){
      persistirSemRender();
    }else if(typeof persistirEstadoLocal === "function"){
      persistirEstadoLocal();
    }

    if(typeof renderizarJutsus === "function"){
      renderizarJutsus();
    }
  };

  /* Persiste uma única vez os IDs criados para fichas antigas. */
  if(
    window.garantirKekkeiArray() &&
    typeof persistirEstadoLocal === "function"
  ){
    persistirEstadoLocal();
  }
})();


/* ======================================================================
   Atualização imediata da barra de XP
   ====================================================================== */
(function(){
  "use strict";

  let quadroXp = 0;

  function atualizarXpNoProximoQuadro(){
    if(quadroXp) return;

    quadroXp = requestAnimationFrame(()=>{
      quadroXp = 0;

      if(typeof atualizarPerfil === "function"){
        atualizarPerfil();
      }else if(typeof atualizarHUD === "function"){
        atualizarHUD();
      }
    });
  }

  function ligarAtualizacaoXp(){
    const campo = document.getElementById("xpPerfilInput");

    if(!campo || campo.dataset.xpBarListener === "1") return;

    campo.dataset.xpBarListener = "1";
    campo.addEventListener("input", atualizarXpNoProximoQuadro);
    atualizarXpNoProximoQuadro();
  }

  if(document.readyState === "loading"){
    document.addEventListener(
      "DOMContentLoaded",
      ligarAtualizacaoXp,
      {once:true}
    );
  }else{
    ligarAtualizacaoXp();
  }
})();


/* ======================================================================
   Menu do avatar e enquadramento do fundo do perfil
   ====================================================================== */
(function(){
  "use strict";

  const AJUSTE_PADRAO = Object.freeze({
    modo:"cover",
    x:50,
    y:50,
    zoom:100
  });

  let imagemFundoAtual = "";
  let dimensoesFundo = {
    imagem:"",
    largura:0,
    altura:0,
    estado:"vazio"
  };
  let tokenMedicao = 0;
  let ajusteTemporario = null;
  let previewFundo = null;
  let overlayAtual = null;
  let menuPaiOriginal = null;
  let menuProximoOriginal = null;
  let quadroMenu = 0;
  let quadroEnquadramento = 0;
  let menuObservado = null;

  function numeroLimitado(valor, minimo, maximo, padrao){
    const numero = Number(valor);

    return Number.isFinite(numero)
      ? Math.min(maximo, Math.max(minimo, numero))
      : padrao;
  }

  function campoPersistido(id){
    return document.getElementById(id);
  }

  function obterFundo(){
    return document.getElementById("perfilFundoImagem");
  }

  function obterMenuAvatar(){
    return document.getElementById("avatarMenu");
  }

  function obterAjusteFundo(){
    const modo = campoPersistido("perfilFundoModo")?.value;

    return {
      modo:modo === "contain" ? "contain" : "cover",
      x:numeroLimitado(
        campoPersistido("perfilFundoPosX")?.value,
        0,
        100,
        AJUSTE_PADRAO.x
      ),
      y:numeroLimitado(
        campoPersistido("perfilFundoPosY")?.value,
        0,
        100,
        AJUSTE_PADRAO.y
      ),
      zoom:numeroLimitado(
        campoPersistido("perfilFundoZoom")?.value,
        70,
        200,
        AJUSTE_PADRAO.zoom
      )
    };
  }

  function gravarAjusteFundo(ajuste){
    const valores = {
      perfilFundoModo:
        ajuste.modo === "contain" ? "contain" : "cover",
      perfilFundoPosX:String(
        numeroLimitado(ajuste.x, 0, 100, 50)
      ),
      perfilFundoPosY:String(
        numeroLimitado(ajuste.y, 0, 100, 50)
      ),
      perfilFundoZoom:String(
        numeroLimitado(ajuste.zoom, 70, 200, 100)
      )
    };

    Object.entries(valores).forEach(([id, valor])=>{
      const campo = campoPersistido(id);
      if(campo) campo.value = valor;

      if(typeof estado !== "undefined"){
        estado[id] = valor;
      }
    });

    /* Uma única gravação substitui oito eventos input/change. */
    if(typeof persistirEstadoLocal === "function"){
      persistirEstadoLocal();
    }
  }

  function ajusteAtivo(){
    return ajusteTemporario || obterAjusteFundo();
  }

  function extrairUrlFundo(valor){
    const texto = String(valor || "").trim();
    if(!texto || texto === "none") return "";

    const inicio = texto.indexOf("url(");
    const fim = texto.lastIndexOf(")");
    if(inicio < 0 || fim <= inicio) return "";

    let url = texto.slice(inicio + 4, fim).trim();

    if(
      (url.startsWith('"') && url.endsWith('"')) ||
      (url.startsWith("'") && url.endsWith("'"))
    ){
      url = url.slice(1, -1);
    }

    return url.replace(/\\(["'\\])/g, "$1");
  }

  function invalidarDimensoes(imagem){
    tokenMedicao += 1;
    dimensoesFundo = {
      imagem:imagem || "",
      largura:0,
      altura:0,
      estado:imagem ? "pendente" : "vazio"
    };
  }

  function medirImagemFundo(imagem){
    if(!imagem) return;

    if(
      dimensoesFundo.imagem === imagem &&
      ["carregando", "pronto", "erro"].includes(
        dimensoesFundo.estado
      )
    ){
      return;
    }

    invalidarDimensoes(imagem);
    dimensoesFundo.estado = "carregando";

    const tokenAtual = tokenMedicao;
    const medidor = new Image();
    medidor.decoding = "async";

    medidor.onload = function(){
      if(
        tokenAtual !== tokenMedicao ||
        imagemFundoAtual !== imagem
      ){
        return;
      }

      dimensoesFundo = {
        imagem,
        largura:Number(medidor.naturalWidth || medidor.width || 0),
        altura:Number(medidor.naturalHeight || medidor.height || 0),
        estado:"pronto"
      };

      aplicarEnquadramentoFundo();
    };

    medidor.onerror = function(){
      if(tokenAtual !== tokenMedicao) return;

      dimensoesFundo = {
        imagem,
        largura:0,
        altura:0,
        estado:"erro"
      };

      aplicarEnquadramentoFundo();
    };

    medidor.src = imagem;
  }

  function sincronizarImagemFundoAtual(){
    const fundo = obterFundo();
    if(!fundo) return "";

    if(!imagemFundoAtual){
      imagemFundoAtual =
        extrairUrlFundo(fundo.style.backgroundImage) ||
        extrairUrlFundo(getComputedStyle(fundo).backgroundImage);

      if(imagemFundoAtual){
        invalidarDimensoes(imagemFundoAtual);
      }
    }

    if(imagemFundoAtual){
      medirImagemFundo(imagemFundoAtual);
    }

    return imagemFundoAtual;
  }

  function aplicarEnquadramentoNoElemento(
    alvo,
    ajuste,
    imagem,
    dimensoes
  ){
    if(!alvo || !imagem) return;

    const fundo = obterFundo();

    if(alvo !== fundo){
      alvo.style.setProperty(
        "background-image",
        'url("' + imagem.replace(/"/g, "%22") + '")',
        "important"
      );
    }

    alvo.style.setProperty(
      "background-position",
      ajuste.x + "% " + ajuste.y + "%",
      "important"
    );
    alvo.style.setProperty(
      "background-repeat",
      "no-repeat",
      "important"
    );

    const larguraImagem = dimensoes.largura;
    const alturaImagem = dimensoes.altura;
    const larguraAlvo = alvo.clientWidth;
    const alturaAlvo = alvo.clientHeight;

    if(
      larguraImagem > 0 &&
      alturaImagem > 0 &&
      larguraAlvo > 0 &&
      alturaAlvo > 0
    ){
      const escalaBase = ajuste.modo === "contain"
        ? Math.min(
            larguraAlvo / larguraImagem,
            alturaAlvo / alturaImagem
          )
        : Math.max(
            larguraAlvo / larguraImagem,
            alturaAlvo / alturaImagem
          );

      const escala = escalaBase * (ajuste.zoom / 100);

      alvo.style.setProperty(
        "background-size",
        Math.max(1, larguraImagem * escala) + "px " +
        Math.max(1, alturaImagem * escala) + "px",
        "important"
      );
    }else{
      alvo.style.setProperty(
        "background-size",
        ajuste.modo,
        "important"
      );
    }
  }

  function aplicarEnquadramentoFundo(){
    const fundo = obterFundo();
    if(!fundo) return;

    const imagem = sincronizarImagemFundoAtual();
    if(!imagem) return;

    const ajuste = ajusteAtivo();

    aplicarEnquadramentoNoElemento(
      fundo,
      ajuste,
      imagem,
      dimensoesFundo
    );

    if(previewFundo){
      aplicarEnquadramentoNoElemento(
        previewFundo,
        ajuste,
        imagem,
        dimensoesFundo
      );
    }
  }

  function agendarEnquadramentoFundo(){
    if(quadroEnquadramento) return;

    quadroEnquadramento = requestAnimationFrame(()=>{
      quadroEnquadramento = 0;
      aplicarEnquadramentoFundo();
    });
  }

  window.aplicarFundoPerfil = function(imagem){
    const fundo = obterFundo();
    const novaImagem = imagem || "";

    if(novaImagem !== imagemFundoAtual){
      imagemFundoAtual = novaImagem;
      invalidarDimensoes(novaImagem);
    }

    if(!fundo) return;

    if(!novaImagem){
      fundo.style.setProperty(
        "background-image",
        "none",
        "important"
      );
      fundo.style.removeProperty("background-size");
      fundo.style.removeProperty("background-position");
      fundo.style.removeProperty("background-repeat");
      fundo.classList.remove("ativo");
      return;
    }

    fundo.style.setProperty(
      "background-image",
      'url("' + novaImagem.replace(/"/g, "%22") + '")',
      "important"
    );
    fundo.classList.add("ativo");

    medirImagemFundo(novaImagem);
    aplicarEnquadramentoFundo();
  };

  function guardarLocalMenu(menu){
    if(menuPaiOriginal || !menu) return;

    menuPaiOriginal = menu.parentNode;
    menuProximoOriginal = menu.nextSibling;
  }

  function levarMenuParaBody(menu){
    guardarLocalMenu(menu);

    if(menu.parentNode !== document.body){
      document.body.appendChild(menu);
    }
  }

  function restaurarLocalMenu(menu){
    if(
      !menuPaiOriginal ||
      !menu ||
      menu.parentNode === menuPaiOriginal
    ){
      return;
    }

    if(
      menuProximoOriginal &&
      menuProximoOriginal.parentNode === menuPaiOriginal
    ){
      menuPaiOriginal.insertBefore(menu, menuProximoOriginal);
    }else{
      menuPaiOriginal.appendChild(menu);
    }
  }

  function limparPosicaoMenuAvatar(){
    const menu = obterMenuAvatar();
    if(!menu) return;

    [
      "display",
      "visibility",
      "position",
      "left",
      "top",
      "right",
      "bottom",
      "width",
      "transform"
    ].forEach(propriedade=>{
      menu.style.removeProperty(propriedade);
    });

    restaurarLocalMenu(menu);
  }

  function fecharMenuAvatar(){
    const menu = obterMenuAvatar();
    if(!menu) return;

    menu.classList.remove("aberto");
    limparPosicaoMenuAvatar();
  }

  /*
   * O módulo de imagens chama esta função ao remover o fundo.
   * Ela precisa existir também no escopo global.
   */
  window.fecharMenuAvatar = fecharMenuAvatar;

  function posicionarMenuAvatarAgora(){
    const menu = obterMenuAvatar();
    const avatar = document.querySelector(
      "#identidade .avatarNovo"
    );

    if(
      !menu ||
      !avatar ||
      !menu.classList.contains("aberto")
    ){
      return;
    }

    levarMenuParaBody(menu);

    menu.style.setProperty("position", "fixed", "important");
    menu.style.setProperty("visibility", "hidden", "important");
    menu.style.setProperty("display", "grid", "important");
    menu.style.setProperty("left", "10px", "important");
    menu.style.setProperty("top", "10px", "important");
    menu.style.setProperty("transform", "none", "important");

    const avatarRect = avatar.getBoundingClientRect();
    const visual = window.visualViewport;
    const origemX = visual ? visual.offsetLeft : 0;
    const origemY = visual ? visual.offsetTop : 0;
    const larguraTela = visual ? visual.width : window.innerWidth;
    const alturaTela = visual ? visual.height : window.innerHeight;
    const margem = 12;
    const larguraMenu = Math.min(
      menu.offsetWidth || 214,
      Math.max(120, larguraTela - margem * 2)
    );
    const alturaMenu = Math.min(
      menu.offsetHeight || 210,
      Math.max(80, alturaTela - margem * 2)
    );
    const direita = origemX + larguraTela - margem;
    const inferior = origemY + alturaTela - margem;

    let esquerda;
    let topo;

    if(larguraTela <= 520){
      esquerda = origemX + (larguraTela - larguraMenu) / 2;
      topo = avatarRect.bottom + 10;

      if(topo + alturaMenu > inferior){
        topo = avatarRect.top - alturaMenu - 10;
      }
    }else if(avatarRect.right + 12 + larguraMenu <= direita){
      esquerda = avatarRect.right + 12;
      topo = avatarRect.top;
    }else if(
      avatarRect.left - larguraMenu - 12 >= origemX + margem
    ){
      esquerda = avatarRect.left - larguraMenu - 12;
      topo = avatarRect.top;
    }else{
      esquerda =
        avatarRect.left + (avatarRect.width - larguraMenu) / 2;
      topo = avatarRect.bottom + 10;
    }

    esquerda = Math.max(
      origemX + margem,
      Math.min(esquerda, direita - larguraMenu)
    );
    topo = Math.max(
      origemY + margem,
      Math.min(topo, inferior - alturaMenu)
    );

    menu.style.setProperty(
      "width",
      larguraMenu + "px",
      "important"
    );
    menu.style.setProperty(
      "left",
      esquerda + "px",
      "important"
    );
    menu.style.setProperty(
      "top",
      topo + "px",
      "important"
    );
    menu.style.setProperty(
      "visibility",
      "visible",
      "important"
    );
  }

  function agendarPosicaoMenuAvatar(){
    if(quadroMenu) return;

    quadroMenu = requestAnimationFrame(()=>{
      quadroMenu = 0;
      posicionarMenuAvatarAgora();
    });
  }

  window.toggleAvatarMenu = function(){
    const menu = obterMenuAvatar();
    if(!menu) return;

    if(menu.classList.contains("aberto")){
      fecharMenuAvatar();
      return;
    }

    menu.classList.add("aberto");
    agendarPosicaoMenuAvatar();
  };

  function fecharAjusteFundo(restaurar){
    if(restaurar){
      ajusteTemporario = null;
      aplicarEnquadramentoFundo();
    }

    previewFundo = null;
    document.body.classList.remove("ajustandoFundoPerfil");

    if(overlayAtual){
      overlayAtual.remove();
      overlayAtual = null;
    }
  }

  window.abrirAjusteFundoPerfil = function(){
    const fundo = obterFundo();
    const imagem = sincronizarImagemFundoAtual();
    const temImagem = Boolean(
      imagem ||
      (fundo && getComputedStyle(fundo).backgroundImage !== "none")
    );

    fecharMenuAvatar();

    if(!temImagem){
      if(typeof window.avisar === "function"){
        window.avisar(
          "Nenhum fundo definido",
          "Adicione uma imagem de fundo antes de ajustar o enquadramento."
        );
      }else{
        alert(
          "Adicione uma imagem de fundo antes de ajustar o enquadramento."
        );
      }
      return;
    }

    if(overlayAtual){
      fecharAjusteFundo(true);
    }

    ajusteTemporario = {...obterAjusteFundo()};

    const overlay = document.createElement("div");
    overlay.className = "ajusteFundoOverlay";
    overlay.innerHTML = `
      <div class="ajusteFundoPainel" role="dialog" aria-modal="true" aria-label="Ajustar imagem de fundo">
        <div class="ajusteFundoCabecalho">
          <h3>Ajustar fundo</h3>
          <button type="button" class="ajusteFundoFechar" data-acao="cancelar" aria-label="Fechar">×</button>
        </div>
        <div class="ajusteFundoPreview" aria-label="Prévia do enquadramento">
          <div class="ajusteFundoPreviewImagem"></div>
          <div class="ajusteFundoPreviewGrade"></div>
          <span class="ajusteFundoPreviewDica">Arraste para reposicionar</span>
        </div>
        <label>Exibição
          <select data-ajuste="modo">
            <option value="cover">Preencher a área</option>
            <option value="contain">Mostrar imagem inteira</option>
          </select>
        </label>
        <label>Horizontal
          <input data-ajuste="x" type="range" min="0" max="100" step="1">
          <span class="ajusteFundoValor" data-valor="x"></span>
        </label>
        <label>Vertical
          <input data-ajuste="y" type="range" min="0" max="100" step="1">
          <span class="ajusteFundoValor" data-valor="y"></span>
        </label>
        <label>Zoom
          <input data-ajuste="zoom" type="range" min="70" max="200" step="1">
          <span class="ajusteFundoValor" data-valor="zoom"></span>
        </label>
        <div class="ajusteFundoAcoes">
          <button type="button" data-acao="resetar">Centralizar</button>
          <button type="button" data-acao="cancelar">Cancelar</button>
          <button type="button" class="aplicar" data-acao="aplicar">Aplicar</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    document.body.classList.add("ajustandoFundoPerfil");

    overlayAtual = overlay;
    previewFundo = overlay.querySelector(
      ".ajusteFundoPreviewImagem"
    );

    function atualizarCampo(campo){
      const controle = overlay.querySelector(
        '[data-ajuste="' + campo + '"]'
      );
      if(controle) controle.value = ajusteTemporario[campo];

      if(campo !== "modo"){
        const valor = overlay.querySelector(
          '[data-valor="' + campo + '"]'
        );
        if(valor){
          valor.textContent = ajusteTemporario[campo] + "%";
        }
      }
    }

    function atualizarCampos(){
      ["modo", "x", "y", "zoom"].forEach(atualizarCampo);
    }

    overlay.addEventListener("input", evento=>{
      const campo = evento.target?.dataset?.ajuste || "";
      if(!campo) return;

      ajusteTemporario[campo] = campo === "modo"
        ? evento.target.value
        : Number(evento.target.value);

      atualizarCampo(campo);
      agendarEnquadramentoFundo();
    });

    overlay.addEventListener("click", evento=>{
      if(evento.target === overlay){
        fecharAjusteFundo(true);
        return;
      }

      const acao = evento.target?.dataset?.acao || "";

      if(acao === "resetar"){
        ajusteTemporario = {...AJUSTE_PADRAO};
        atualizarCampos();
        aplicarEnquadramentoFundo();
      }else if(acao === "cancelar"){
        fecharAjusteFundo(true);
      }else if(acao === "aplicar"){
        gravarAjusteFundo(ajusteTemporario);
        ajusteTemporario = null;
        aplicarEnquadramentoFundo();
        fecharAjusteFundo(false);
      }
    });

    const areaPreview = overlay.querySelector(
      ".ajusteFundoPreview"
    );
    let arrastePreview = null;

    areaPreview.addEventListener("pointerdown", evento=>{
      arrastePreview = {
        id:evento.pointerId,
        inicioX:evento.clientX,
        inicioY:evento.clientY,
        x:ajusteTemporario.x,
        y:ajusteTemporario.y
      };

      areaPreview.classList.add("arrastando");
      areaPreview.setPointerCapture?.(evento.pointerId);
      evento.preventDefault();
    });

    areaPreview.addEventListener("pointermove", evento=>{
      if(
        !arrastePreview ||
        evento.pointerId !== arrastePreview.id
      ){
        return;
      }

      const retangulo = areaPreview.getBoundingClientRect();

      ajusteTemporario.x = numeroLimitado(
        arrastePreview.x -
          ((evento.clientX - arrastePreview.inicioX) /
            Math.max(1, retangulo.width)) * 100,
        0,
        100,
        50
      );

      ajusteTemporario.y = numeroLimitado(
        arrastePreview.y -
          ((evento.clientY - arrastePreview.inicioY) /
            Math.max(1, retangulo.height)) * 100,
        0,
        100,
        50
      );

      atualizarCampo("x");
      atualizarCampo("y");
      agendarEnquadramentoFundo();
      evento.preventDefault();
    });

    function finalizarArraste(evento){
      if(
        !arrastePreview ||
        (
          evento.pointerId !== undefined &&
          evento.pointerId !== arrastePreview.id
        )
      ){
        return;
      }

      areaPreview.releasePointerCapture?.(arrastePreview.id);
      arrastePreview = null;
      areaPreview.classList.remove("arrastando");
    }

    areaPreview.addEventListener("pointerup", finalizarArraste);
    areaPreview.addEventListener("pointercancel", finalizarArraste);
    areaPreview.addEventListener("lostpointercapture", finalizarArraste);

    atualizarCampos();
    aplicarEnquadramentoFundo();
  };

  const carregarFundoAnterior = window.carregarFundoPerfil;

  if(typeof carregarFundoAnterior === "function"){
    window.carregarFundoPerfil = async function(evento){
      ajusteTemporario = null;
      gravarAjusteFundo(AJUSTE_PADRAO);
      await carregarFundoAnterior(evento);
      aplicarEnquadramentoFundo();
    };
  }

  function observarMenuAvatar(){
    const menu = obterMenuAvatar();

    if(!menu || menuObservado === menu) return;

    menuObservado = menu;
    guardarLocalMenu(menu);

    menu.addEventListener("click", evento=>{
      evento.stopPropagation();
    });

    new MutationObserver(()=>{
      if(!menu.classList.contains("aberto")){
        limparPosicaoMenuAvatar();
      }
    }).observe(menu, {
      attributes:true,
      attributeFilter:["class"]
    });
  }

  function iniciarFundoJaCarregado(){
    observarMenuAvatar();

    if(sincronizarImagemFundoAtual()){
      aplicarEnquadramentoFundo();
    }
  }

  window.addEventListener("resize", ()=>{
    agendarPosicaoMenuAvatar();
    agendarEnquadramentoFundo();
  }, {passive:true});

  window.addEventListener(
    "scroll",
    agendarPosicaoMenuAvatar,
    {passive:true}
  );

  window.visualViewport?.addEventListener(
    "resize",
    ()=>{
      agendarPosicaoMenuAvatar();
      agendarEnquadramentoFundo();
    },
    {passive:true}
  );

  window.visualViewport?.addEventListener(
    "scroll",
    agendarPosicaoMenuAvatar,
    {passive:true}
  );

  if(document.readyState === "loading"){
    document.addEventListener(
      "DOMContentLoaded",
      ()=>requestAnimationFrame(iniciarFundoJaCarregado),
      {once:true}
    );
  }else{
    requestAnimationFrame(iniciarFundoJaCarregado);
  }

  window.addEventListener("pageshow", ()=>{
    requestAnimationFrame(iniciarFundoJaCarregado);
  });
})();
