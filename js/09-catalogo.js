/* Shinobi 1.4.2 — Catálogo de jutsus
 *
 * Responsabilidades:
 * - carregar o catálogo JSON somente quando necessário;
 * - pesquisar e filtrar as técnicas;
 * - mostrar uma prévia antes da inclusão;
 * - copiar o jutsu escolhido para a ficha atual;
 * - preservar edição, imagem e demais recursos dos cards existentes.
 */
(function(){
  "use strict";

  if(window.__catalogoJutsusV140) return;
  window.__catalogoJutsusV140 = true;

  const URL_CATALOGO = "./data/catalogo-jutsus.json?v=1.9.0";
  const LIMITE_INICIAL = 30;
  const PASSO_LISTAGEM = 30;

  function garantirEstilosCriticosCatalogo(){
    if(document.getElementById("catalogoCriticoV142")){
      return;
    }

    const estilo = document.createElement("style");
    estilo.id = "catalogoCriticoV142";
    estilo.textContent = `
      #catalogoJutsusLista{
        display:block !important;
      }

      #catalogoJutsusLista .catalogoCarta{
        display:block !important;
        width:100% !important;
        min-height:205px !important;
        margin:0 0 12px !important;
        overflow:hidden !important;
        box-sizing:border-box !important;
      }

      #catalogoJutsusLista .catalogoCartaCorpo{
        display:grid !important;
        grid-template-columns:43px minmax(0,1fr) !important;
        gap:11px !important;
        width:100% !important;
        min-height:160px !important;
        padding:12px !important;
        box-sizing:border-box !important;
        visibility:visible !important;
        opacity:1 !important;
      }

      #catalogoJutsusLista .catalogoCartaElemento{
        display:grid !important;
        width:41px !important;
        height:41px !important;
        place-items:center !important;
        visibility:visible !important;
        opacity:1 !important;
      }

      #catalogoJutsusLista .catalogoCartaConteudo{
        display:block !important;
        min-width:0 !important;
        visibility:visible !important;
        opacity:1 !important;
      }

      #catalogoJutsusLista .catalogoCartaConteudo strong,
      #catalogoJutsusLista .catalogoCartaConteudo small,
      #catalogoJutsusLista .catalogoCartaMetadados,
      #catalogoJutsusLista .catalogoCartaResumo{
        visibility:visible !important;
        opacity:1 !important;
      }

      #catalogoJutsusLista .catalogoCartaConteudo strong,
      #catalogoJutsusLista .catalogoCartaConteudo small,
      #catalogoJutsusLista .catalogoCartaResumo{
        display:block !important;
      }

      #catalogoJutsusLista .catalogoCartaMetadados,
      #catalogoJutsusLista .catalogoCartaRodape{
        display:flex !important;
      }

      #catalogoJutsusLista .catalogoCartaRodape{
        min-height:43px !important;
        visibility:visible !important;
        opacity:1 !important;
      }
    `;

    document.head.appendChild(estilo);
  }

  const ELEMENTOS = {
    katon: {
      nome: "Katon",
      icone: "🔥",
      classe: "catalogoElementoKaton"
    },
    raiton: {
      nome: "Raiton",
      icone: "⚡",
      classe: "catalogoElementoRaiton"
    },
    fuuton: {
      nome: "Fuuton",
      icone: "🌪️",
      classe: "catalogoElementoFuuton"
    },
    suiton: {
      nome: "Suiton",
      icone: "💧",
      classe: "catalogoElementoSuiton"
    },
    doton: {
      nome: "Doton",
      icone: "🪨",
      classe: "catalogoElementoDoton"
    },
    yin: {
      nome: "Yinton",
      icone: "🌑",
      classe: "catalogoElementoYin"
    },
    yang: {
      nome: "Youton",
      icone: "☀️",
      classe: "catalogoElementoYang"
    },
    neutro: {
      nome: "Neutro",
      icone: "✨",
      classe: "catalogoElementoNeutro"
    }
  };

  let dadosCatalogo = null;
  let promessaCatalogo = null;
  let overlayCatalogo = null;
  let overlayEscolha = null;
  let overlayPrevia = null;
  let termoBusca = "";
  let filtroElemento = "";
  let filtroRank = "";
  let filtroCategoria = "";
  let limiteAtual = LIMITE_INICIAL;
  let selecionados = new Set();
  let rolagemAnteriorBloqueada = "";

  function escaparHtml(valor){
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizarBusca(valor){
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function chaveJutsu(jutsu){
    return String(
      jutsu?.catalogoId ||
      jutsu?.id ||
      ""
    );
  }

  function elementoDoJutsu(jutsu){
    const elemento = String(
      jutsu?.elemento || "neutro"
    ).toLowerCase();

    return ELEMENTOS[elemento]
      ? elemento
      : "neutro";
  }

  function textoOuTraco(valor){
    const texto = String(valor ?? "").trim();
    return texto || "—";
  }

  function travarRolagem(){
    if(
      overlayCatalogo ||
      overlayEscolha ||
      overlayPrevia
    ){
      return;
    }

    rolagemAnteriorBloqueada =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";
  }

  function liberarRolagemSePossivel(){
    if(
      overlayCatalogo ||
      overlayEscolha ||
      overlayPrevia
    ){
      return;
    }

    document.body.style.overflow =
      rolagemAnteriorBloqueada;
  }

  async function avisar(titulo, mensagem){
    if(typeof avisoShinobi === "function"){
      await avisoShinobi(titulo, mensagem);
      return;
    }

    alert(`${titulo}\n\n${mensagem}`);
  }

  async function confirmar(titulo, mensagem){
    if(typeof modalShinobi === "function"){
      return modalShinobi(titulo, mensagem);
    }

    return window.confirm(`${titulo}\n\n${mensagem}`);
  }

  async function carregarCatalogo(){
    if(dadosCatalogo) return dadosCatalogo;
    if(promessaCatalogo) return promessaCatalogo;

    promessaCatalogo = fetch(URL_CATALOGO, {
      cache: "no-cache",
      credentials: "same-origin"
    })
      .then(async response=>{
        if(!response.ok){
          throw new Error(
            `Catálogo indisponível (${response.status}).`
          );
        }

        const dados = await response.json();

        if(
          !dados ||
          !Array.isArray(dados.jutsus)
        ){
          throw new Error(
            "O arquivo do catálogo possui formato inválido."
          );
        }

        dadosCatalogo = dados;
        return dadosCatalogo;
      })
      .catch(erro=>{
        promessaCatalogo = null;
        throw erro;
      });

    return promessaCatalogo;
  }

  function idsPresentesNaFicha(){
    const ids = new Set();

    try{
      (estado.jutsus || []).forEach(jutsu=>{
        const id = chaveJutsu(jutsu);
        if(id) ids.add(id);
      });
    }catch(erro){}

    return ids;
  }

  function obterJutsuPorId(id){
    return dadosCatalogo?.jutsus?.find(
      jutsu=>chaveJutsu(jutsu) === id
    ) || null;
  }

  function obterJutsusFiltrados(){
    const busca = normalizarBusca(termoBusca);

    return (dadosCatalogo?.jutsus || []).filter(jutsu=>{
      if(
        filtroElemento &&
        elementoDoJutsu(jutsu) !== filtroElemento
      ){
        return false;
      }

      if(
        filtroRank &&
        String(jutsu.rank || "") !== filtroRank
      ){
        return false;
      }

      if(
        filtroCategoria &&
        String(jutsu.categoria || "") !== filtroCategoria
      ){
        return false;
      }

      if(!busca) return true;

      const texto = normalizarBusca([
        jutsu.nome,
        jutsu.tipoNome,
        jutsu.categoria,
        jutsu.rank,
        jutsu.descricao,
        jutsu.upgrade?.efeito,
        jutsu.upgrade?.requisito
      ].filter(Boolean).join(" "));

      return texto.includes(busca);
    });
  }

  function opcoesOrdenadas(campo){
    return [...new Set(
      (dadosCatalogo?.jutsus || [])
        .map(jutsu=>String(jutsu?.[campo] || "").trim())
        .filter(Boolean)
    )].sort((a, b)=>a.localeCompare(
      b,
      "pt-BR",
      {numeric:true}
    ));
  }

  function montarOpcoesDosFiltros(){
    if(!overlayCatalogo) return;

    const rank = overlayCatalogo.querySelector(
      "#catalogoFiltroRank"
    );

    const categoria = overlayCatalogo.querySelector(
      "#catalogoFiltroCategoria"
    );

    rank.innerHTML = [
      '<option value="">Todos os ranks</option>',
      ...opcoesOrdenadas("rank").map(valor=>
        `<option value="${escaparHtml(valor)}">Rank ${escaparHtml(valor)}</option>`
      )
    ].join("");

    categoria.innerHTML = [
      '<option value="">Todas as categorias</option>',
      ...opcoesOrdenadas("categoria").map(valor=>
        `<option value="${escaparHtml(valor)}">${escaparHtml(valor)}</option>`
      )
    ].join("");
  }

  function resumoDescricao(jutsu){
    const descricao = String(jutsu?.descricao || "")
      .replace(/\s+/g, " ")
      .trim();

    if(descricao.length <= 160) return descricao;

    return `${descricao.slice(0, 157).trim()}…`;
  }

  function renderizarCartaCatalogo(jutsu, idsFicha){
    const id = chaveJutsu(jutsu);
    const elementoId = elementoDoJutsu(jutsu);
    const elemento = ELEMENTOS[elementoId];
    const selecionado = selecionados.has(id);
    const jaPossui = idsFicha.has(id);

    const custo = textoOuTraco(jutsu.custo);
    const dano = textoOuTraco(jutsu.dano);
    const acao = textoOuTraco(jutsu.acao);

    return `
      <article
        class="catalogoCarta ${elemento.classe} ${selecionado ? "catalogoCartaSelecionada" : ""} ${jaPossui ? "catalogoCartaAdquirida" : ""}"
        data-catalogo-id="${escaparHtml(id)}"
        style="display:block;width:100%;min-height:205px;margin:0 0 12px;overflow:hidden;box-sizing:border-box"
      >
        <div
          class="catalogoCartaCorpo"
          data-acao-catalogo="visualizar"
          data-catalogo-id="${escaparHtml(id)}"
          role="button"
          tabindex="0"
          aria-label="Ver detalhes de ${escaparHtml(jutsu.nome)}"
          style="display:grid;grid-template-columns:43px minmax(0,1fr);gap:11px;width:100%;min-height:160px;padding:12px;box-sizing:border-box;visibility:visible;opacity:1"
        >
          <span class="catalogoCartaElemento">
            ${elemento.icone}
          </span>

          <span class="catalogoCartaConteudo">
            <strong>${escaparHtml(jutsu.nome)}</strong>

            <small>
              ${escaparHtml(elemento.nome)}
              • Rank ${escaparHtml(jutsu.rank || "—")}
              • ${escaparHtml(custo)} CH
            </small>

            <span class="catalogoCartaMetadados">
              <b>${escaparHtml(acao)}</b>
              <b>Dano: ${escaparHtml(dano)}</b>
            </span>

            <span class="catalogoCartaResumo">
              ${escaparHtml(resumoDescricao(jutsu))}
            </span>
          </span>
        </div>

        <div class="catalogoCartaRodape">
          <span class="catalogoCartaPagina">
            Página ${escaparHtml(jutsu.fonte?.pagina || "—")}
          </span>

          ${
            jaPossui
              ? '<span class="catalogoJaNaFicha">Já está na ficha</span>'
              : `
                <button
                  type="button"
                  class="catalogoSelecionarBtn ${selecionado ? "ativo" : ""}"
                  data-acao-catalogo="selecionar"
                  data-catalogo-id="${escaparHtml(id)}"
                >
                  ${selecionado ? "Selecionado ✓" : "Selecionar"}
                </button>
              `
          }
        </div>
      </article>
    `;
  }

  function atualizarRodapeSelecao(){
    if(!overlayCatalogo) return;

    const contador = overlayCatalogo.querySelector(
      "#catalogoSelecionadosContador"
    );

    const botao = overlayCatalogo.querySelector(
      "#catalogoAdicionarSelecionados"
    );

    const total = selecionados.size;

    contador.textContent =
      total === 1
        ? "1 carta selecionada"
        : `${total} cartas selecionadas`;

    botao.disabled = total === 0;
    botao.textContent =
      total > 0
        ? `Adicionar à ficha (${total})`
        : "Adicionar à ficha";
  }

  function renderizarCatalogo(){
    if(!overlayCatalogo || !dadosCatalogo) return;

    const lista = overlayCatalogo.querySelector(
      "#catalogoJutsusLista"
    );

    const status = overlayCatalogo.querySelector(
      "#catalogoJutsusStatus"
    );

    const carregarMais = overlayCatalogo.querySelector(
      "#catalogoCarregarMais"
    );

    const filtrados = obterJutsusFiltrados();
    const visiveis = filtrados.slice(0, limiteAtual);
    const idsFicha = idsPresentesNaFicha();

    status.textContent =
      `${filtrados.length} de ${dadosCatalogo.jutsus.length} cartas`;

    if(!filtrados.length){
      lista.innerHTML = `
        <div class="catalogoVazio">
          <strong>Nenhum jutsu encontrado.</strong>
          <span>Tente retirar algum filtro ou pesquisar outro nome.</span>
        </div>
      `;
    }else{
      lista.innerHTML = visiveis
        .map(jutsu=>renderizarCartaCatalogo(
          jutsu,
          idsFicha
        ))
        .join("");
    }

    const faltam = filtrados.length - visiveis.length;

    carregarMais.hidden = faltam <= 0;
    carregarMais.textContent =
      faltam > PASSO_LISTAGEM
        ? `Carregar mais ${PASSO_LISTAGEM}`
        : `Carregar mais ${faltam}`;

    atualizarRodapeSelecao();
  }

  function alternarSelecao(id){
    if(!id) return;

    if(idsPresentesNaFicha().has(id)){
      avisar(
        "Jutsu já adicionado",
        "Esse jutsu já está na ficha. O card existente continua totalmente editável."
      );
      return;
    }

    if(selecionados.has(id)){
      selecionados.delete(id);
    }else{
      selecionados.add(id);
    }

    renderizarCatalogo();
  }

  function converterParaJutsuDaFicha(jutsu){
    const descricao = String(
      jutsu.descricao || ""
    );

    return {
      nome: String(jutsu.nome || ""),
      rank: String(jutsu.rank || ""),
      elemento: elementoDoJutsu(jutsu),
      bonusAcerto: String(jutsu.bonusAcerto || ""),
      dano: String(jutsu.dano || ""),
      bonusDano: String(jutsu.bonusDano || ""),
      custo: String(jutsu.custo ?? ""),
      alcance: String(jutsu.alcance || ""),
      raio: String(jutsu.raio || ""),
      duracao: String(jutsu.duracao || ""),
      acao: String(jutsu.acao || ""),
      resistencia: String(jutsu.resistencia || ""),
      alvo: String(jutsu.alvo || ""),
      descricao,
      imagem: "",
      efeitosEstruturados: Array.isArray(jutsu.efeitosEstruturados)
        ? JSON.parse(JSON.stringify(jutsu.efeitosEstruturados))
        : [],
      efeitosConfig: jutsu.efeitosConfig && typeof jutsu.efeitosConfig === "object"
        ? JSON.parse(JSON.stringify(jutsu.efeitosConfig))
        : {},
      classificacaoEfeitos: String(jutsu.classificacaoEfeitos || ""),
      efeitosVersao: String(jutsu.efeitosVersao || "1.0.0"),
      catalogoId: chaveJutsu(jutsu),
      catalogoFonte: {
        catalogo:
          dadosCatalogo?.catalogoId ||
          "suplemento-shinobi-jutsus",

        pagina: jutsu.fonte?.pagina || null
      }
    };
  }

  function persistirJutsusAdicionados(indicesAbertos){
    estado.jutsusAbertos =
      estado.jutsusAbertos || {};

    indicesAbertos.forEach(indice=>{
      estado.jutsusAbertos[indice] = true;
    });

    if(typeof persistirEstadoLocal === "function"){
      persistirEstadoLocal();
    }else if(typeof persistirSemRender === "function"){
      persistirSemRender();
    }

    if(typeof renderizarJutsus === "function"){
      renderizarJutsus();
    }
  }

  async function adicionarIdsNaFicha(ids){
    const idsFicha = idsPresentesNaFicha();
    const novos = [];
    const ignorados = [];

    ids.forEach(id=>{
      if(idsFicha.has(id)){
        ignorados.push(id);
        return;
      }

      const jutsu = obterJutsuPorId(id);

      if(jutsu){
        novos.push(converterParaJutsuDaFicha(jutsu));
        idsFicha.add(id);
      }
    });

    if(!novos.length){
      await avisar(
        "Nenhum jutsu adicionado",
        ignorados.length
          ? "As cartas escolhidas já estão presentes na ficha."
          : "Selecione ao menos uma carta do catálogo."
      );

      return false;
    }

    estado.jutsus = Array.isArray(estado.jutsus)
      ? estado.jutsus
      : [];

    const primeiroIndice = estado.jutsus.length;
    estado.jutsus.push(...novos);

    const indicesAbertos = novos.map(
      (_, indice)=>primeiroIndice + indice
    );

    persistirJutsusAdicionados(indicesAbertos);
    selecionados.clear();
    fecharPreviaCatalogo();
    fecharCatalogoJutsus();

    const nomes = novos
      .slice(0, 3)
      .map(jutsu=>`• ${jutsu.nome}`)
      .join("\n");

    const restantes = novos.length - 3;

    await avisar(
      novos.length === 1
        ? "Jutsu adicionado"
        : `${novos.length} jutsus adicionados`,

      `${nomes}${restantes > 0 ? `\n• e mais ${restantes}` : ""}\n\nOs campos e a imagem continuam editáveis na ficha.`
    );

    return true;
  }

  function fecharPreviaCatalogo(){
    if(!overlayPrevia) return;

    overlayPrevia.remove();
    overlayPrevia = null;
    liberarRolagemSePossivel();
  }

  function abrirPreviaCatalogo(id){
    const jutsu = obterJutsuPorId(id);
    if(!jutsu) return;

    fecharPreviaCatalogo();
    travarRolagem();

    const elemento = ELEMENTOS[elementoDoJutsu(jutsu)];
    const jaPossui = idsPresentesNaFicha().has(id);

    overlayPrevia = document.createElement("div");
    overlayPrevia.className =
      "catalogoPreviaOverlay modalShinobiOverlay";

    overlayPrevia.innerHTML = `
      <section
        class="catalogoPrevia ${elemento.classe}"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalogoPreviaTitulo"
      >
        <header class="catalogoPreviaCabecalho">
          <div>
            <span class="catalogoPreviaElemento">
              ${elemento.icone} ${escaparHtml(elemento.nome)}
            </span>

            <h3 id="catalogoPreviaTitulo">
              ${escaparHtml(jutsu.nome)}
            </h3>

            <p>
              Rank ${escaparHtml(jutsu.rank || "—")}
              • ${escaparHtml(textoOuTraco(jutsu.custo))} CH
              • Página ${escaparHtml(jutsu.fonte?.pagina || "—")}
            </p>
          </div>

          <button
            type="button"
            class="catalogoFecharBtn"
            data-fechar-previa
            aria-label="Fechar detalhes"
          >
            ×
          </button>
        </header>

        <div class="catalogoPreviaResumo">
          <div>
            <b>Ação</b>
            <span>${escaparHtml(textoOuTraco(jutsu.acao))}</span>
          </div>

          <div>
            <b>Duração</b>
            <span>${escaparHtml(textoOuTraco(jutsu.duracao))}</span>
          </div>

          <div>
            <b>Dano</b>
            <span>${escaparHtml(textoOuTraco(jutsu.dano))}</span>
          </div>

          <div>
            <b>Alcance</b>
            <span>${escaparHtml(textoOuTraco(jutsu.alcance))}</span>
          </div>

          <div>
            <b>Área</b>
            <span>${escaparHtml(textoOuTraco(jutsu.raio))}</span>
          </div>

          <div>
            <b>Teste</b>
            <span>${escaparHtml(textoOuTraco(jutsu.resistencia))}</span>
          </div>
        </div>

        <div class="catalogoPreviaDescricao">
          ${escaparHtml(jutsu.descricao || "Sem descrição.")}
        </div>

        <footer class="catalogoPreviaAcoes">
          <button
            type="button"
            class="modalShinobiBtn cancelar"
            data-fechar-previa
          >
            Voltar
          </button>

          <button
            type="button"
            class="modalShinobiBtn confirmar"
            data-adicionar-previa="${escaparHtml(id)}"
            ${jaPossui ? "disabled" : ""}
          >
            ${jaPossui ? "Já está na ficha" : "Adicionar à ficha"}
          </button>
        </footer>
      </section>
    `;

    overlayPrevia.addEventListener("click", evento=>{
      if(
        evento.target === overlayPrevia ||
        evento.target.closest("[data-fechar-previa]")
      ){
        fecharPreviaCatalogo();
        return;
      }

      const botaoAdicionar = evento.target.closest(
        "[data-adicionar-previa]"
      );

      if(botaoAdicionar && !botaoAdicionar.disabled){
        adicionarIdsNaFicha([
          botaoAdicionar.dataset.adicionarPrevia
        ]);
      }
    });

    document.body.appendChild(overlayPrevia);
  }

  function fecharCatalogoJutsus(){
    fecharPreviaCatalogo();

    if(!overlayCatalogo) return;

    overlayCatalogo.remove();
    overlayCatalogo = null;
    selecionados.clear();
    liberarRolagemSePossivel();
  }

  function instalarEventosCatalogo(){
    const busca = overlayCatalogo.querySelector(
      "#catalogoBusca"
    );

    const elemento = overlayCatalogo.querySelector(
      "#catalogoFiltroElemento"
    );

    const rank = overlayCatalogo.querySelector(
      "#catalogoFiltroRank"
    );

    const categoria = overlayCatalogo.querySelector(
      "#catalogoFiltroCategoria"
    );

    busca.addEventListener("input", ()=>{
      termoBusca = busca.value;
      limiteAtual = LIMITE_INICIAL;
      renderizarCatalogo();
    });

    elemento.addEventListener("change", ()=>{
      filtroElemento = elemento.value;
      limiteAtual = LIMITE_INICIAL;
      renderizarCatalogo();
    });

    rank.addEventListener("change", ()=>{
      filtroRank = rank.value;
      limiteAtual = LIMITE_INICIAL;
      renderizarCatalogo();
    });

    categoria.addEventListener("change", ()=>{
      filtroCategoria = categoria.value;
      limiteAtual = LIMITE_INICIAL;
      renderizarCatalogo();
    });

    overlayCatalogo.addEventListener("keydown", evento=>{
      const acao = evento.target.closest(
        '[data-acao-catalogo="visualizar"]'
      );

      if(
        !acao ||
        (evento.key !== "Enter" && evento.key !== " ")
      ){
        return;
      }

      evento.preventDefault();
      abrirPreviaCatalogo(
        acao.dataset.catalogoId
      );
    });

    overlayCatalogo.addEventListener("click", evento=>{
      if(evento.target === overlayCatalogo){
        fecharCatalogoJutsus();
        return;
      }

      if(evento.target.closest("[data-fechar-catalogo]")){
        fecharCatalogoJutsus();
        return;
      }

      const acao = evento.target.closest(
        "[data-acao-catalogo]"
      );

      if(acao){
        const id = acao.dataset.catalogoId;

        if(acao.dataset.acaoCatalogo === "selecionar"){
          alternarSelecao(id);
        }

        if(acao.dataset.acaoCatalogo === "visualizar"){
          abrirPreviaCatalogo(id);
        }

        return;
      }

      if(evento.target.closest("#catalogoCarregarMais")){
        limiteAtual += PASSO_LISTAGEM;
        renderizarCatalogo();
        return;
      }

      if(evento.target.closest("#catalogoLimparFiltros")){
        termoBusca = "";
        filtroElemento = "";
        filtroRank = "";
        filtroCategoria = "";
        limiteAtual = LIMITE_INICIAL;

        busca.value = "";
        elemento.value = "";
        rank.value = "";
        categoria.value = "";

        renderizarCatalogo();
        return;
      }

      if(evento.target.closest("#catalogoAdicionarSelecionados")){
        adicionarIdsNaFicha([...selecionados]);
      }
    });
  }

  async function abrirCatalogoJutsus(){
    garantirEstilosCriticosCatalogo();
    fecharMenuAdicionarJutsu();

    if(overlayCatalogo) return;

    travarRolagem();

    overlayCatalogo = document.createElement("div");
    overlayCatalogo.className = "catalogoJutsusOverlay";

    overlayCatalogo.innerHTML = `
      <section
        class="catalogoJutsusPainel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalogoJutsusTitulo"
      >
        <header class="catalogoJutsusCabecalho">
          <div>
            <span class="catalogoJutsusSubtitulo">
              Biblioteca do mestre
            </span>

            <h2 id="catalogoJutsusTitulo">
              Catálogo de Jutsus
            </h2>
          </div>

          <button
            type="button"
            class="catalogoFecharBtn"
            data-fechar-catalogo
            aria-label="Fechar catálogo"
          >
            ×
          </button>
        </header>

        <div class="catalogoJutsusFerramentas">
          <label class="catalogoBuscaBox">
            <span>Pesquisar</span>

            <input
              id="catalogoBusca"
              type="search"
              placeholder="Nome, efeito, categoria..."
              autocomplete="off"
            >
          </label>

          <div class="catalogoFiltrosGrid">
            <label>
              <span>Elemento</span>
              <select id="catalogoFiltroElemento">
                <option value="">Todos os elementos</option>
                <option value="katon">Katon</option>
                <option value="raiton">Raiton</option>
                <option value="fuuton">Fuuton</option>
                <option value="suiton">Suiton</option>
                <option value="doton">Doton</option>
                <option value="yin">Yinton</option>
                <option value="yang">Youton</option>
                <option value="neutro">Neutro</option>
              </select>
            </label>

            <label>
              <span>Rank</span>
              <select id="catalogoFiltroRank">
                <option value="">Todos os ranks</option>
              </select>
            </label>

            <label>
              <span>Categoria</span>
              <select id="catalogoFiltroCategoria">
                <option value="">Todas as categorias</option>
              </select>
            </label>
          </div>

          <div class="catalogoFerramentasRodape">
            <span id="catalogoJutsusStatus">
              Carregando catálogo...
            </span>

            <button
              type="button"
              id="catalogoLimparFiltros"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        <main
          id="catalogoJutsusLista"
          class="catalogoJutsusLista"
        >
          <div class="catalogoCarregando">
            <span class="catalogoCarregandoIcone">🍥</span>
            <strong>Preparando as cartas...</strong>
          </div>
        </main>

        <button
          type="button"
          id="catalogoCarregarMais"
          class="catalogoCarregarMais"
          hidden
        >
          Carregar mais
        </button>

        <footer class="catalogoJutsusRodape">
          <span id="catalogoSelecionadosContador">
            0 cartas selecionadas
          </span>

          <button
            type="button"
            id="catalogoAdicionarSelecionados"
            disabled
          >
            Adicionar à ficha
          </button>
        </footer>
      </section>
    `;

    document.body.appendChild(overlayCatalogo);
    instalarEventosCatalogo();

    try{
      await carregarCatalogo();

      if(!overlayCatalogo) return;

      montarOpcoesDosFiltros();
      renderizarCatalogo();

      requestAnimationFrame(()=>{
        overlayCatalogo
          ?.querySelector("#catalogoBusca")
          ?.focus();
      });
    }catch(erro){
      console.error(
        "Falha ao carregar o catálogo de jutsus.",
        erro
      );

      if(!overlayCatalogo) return;

      overlayCatalogo.querySelector(
        "#catalogoJutsusLista"
      ).innerHTML = `
        <div class="catalogoErro">
          <strong>Não foi possível abrir o catálogo.</strong>
          <span>
            Verifique a internet na primeira abertura
            e confirme se o arquivo
            data/catalogo-jutsus.json foi publicado.
          </span>

          <button
            type="button"
            data-tentar-catalogo
          >
            Tentar novamente
          </button>
        </div>
      `;

      overlayCatalogo
        .querySelector("[data-tentar-catalogo]")
        .addEventListener("click", async()=>{
          fecharCatalogoJutsus();
          await abrirCatalogoJutsus();
        });
    }
  }

  function fecharMenuAdicionarJutsu(){
    if(!overlayEscolha) return;

    overlayEscolha.remove();
    overlayEscolha = null;
    liberarRolagemSePossivel();
  }

  function abrirMenuAdicionarJutsu(){
    if(overlayEscolha) return;

    travarRolagem();

    overlayEscolha = document.createElement("div");
    overlayEscolha.className =
      "catalogoEscolhaOverlay modalShinobiOverlay";

    overlayEscolha.innerHTML = `
      <section
        class="catalogoEscolhaBox modalShinobiBox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalogoEscolhaTitulo"
      >
        <header class="catalogoEscolhaCabecalho">
          <div>
            <span>Adicionar técnica</span>
            <h3 id="catalogoEscolhaTitulo">
              Como deseja criar o jutsu?
            </h3>
          </div>

          <button
            type="button"
            class="catalogoFecharBtn"
            data-fechar-escolha
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div class="catalogoEscolhaOpcoes">
          <button
            type="button"
            class="catalogoEscolhaOpcao catalogoEscolhaPrincipal"
            data-abrir-catalogo
          >
            <span class="catalogoEscolhaIcone">🃏</span>

            <span>
              <strong>Escolher do catálogo</strong>
              <small>
                Pesquise uma carta e preencha o card automaticamente.
              </small>
            </span>
          </button>

          <button
            type="button"
            class="catalogoEscolhaOpcao"
            data-criar-manual
          >
            <span class="catalogoEscolhaIcone">✍️</span>

            <span>
              <strong>Criar manualmente</strong>
              <small>
                Adicione um card vazio como antes.
              </small>
            </span>
          </button>
        </div>
      </section>
    `;

    overlayEscolha.addEventListener("click", evento=>{
      if(
        evento.target === overlayEscolha ||
        evento.target.closest("[data-fechar-escolha]")
      ){
        fecharMenuAdicionarJutsu();
        return;
      }

      if(evento.target.closest("[data-abrir-catalogo]")){
        abrirCatalogoJutsus();
        return;
      }

      if(evento.target.closest("[data-criar-manual]")){
        fecharMenuAdicionarJutsu();

        if(typeof adicionarJutsu === "function"){
          adicionarJutsu();
        }
      }
    });

    document.body.appendChild(overlayEscolha);
  }

  document.addEventListener("keydown", evento=>{
    if(evento.key !== "Escape") return;

    if(overlayPrevia){
      fecharPreviaCatalogo();
      return;
    }

    if(overlayCatalogo){
      fecharCatalogoJutsus();
      return;
    }

    if(overlayEscolha){
      fecharMenuAdicionarJutsu();
    }
  });

  window.abrirMenuAdicionarJutsu =
    abrirMenuAdicionarJutsu;

  window.abrirCatalogoJutsus =
    abrirCatalogoJutsus;

  window.fecharCatalogoJutsus =
    fecharCatalogoJutsus;
})();
