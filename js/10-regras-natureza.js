/* Shinobi 1.8.1 — Naturezas + integração com efeitos automáticos de batalha. */
(function(){
  "use strict";

  if(window.__regrasNaturezaChakraV181) return;
  window.__regrasNaturezaChakraV181 = true;

  const VERSAO = "1.8.1";

  const NATUREZAS = [
    {id:"katon", nome:"KATON", icone:"🔥", classe:"katon", resistenciaId:"katon", resistenciaNome:"Katon / Fogo"},
    {id:"raiton", nome:"RAITON", icone:"⚡", classe:"raiton", resistenciaId:"raiton", resistenciaNome:"Raiton / Elétrico"},
    {id:"fuuton", nome:"FUUTON", icone:"🌪️", classe:"fuuton", resistenciaId:"fuuton", resistenciaNome:"Fuuton / Vento"},
    {id:"suiton", nome:"SUITON", icone:"💧", classe:"suiton", resistenciaId:"suiton", resistenciaNome:"Suiton / Água"},
    {id:"doton", nome:"DOTON", icone:"🪨", classe:"doton", resistenciaId:"doton", resistenciaNome:"Doton / Terra"},
    {id:"yin", nome:"YINTON", icone:"🌑", classe:"yin", resistenciaId:"genjutsu", resistenciaNome:"Yin / Genjutsu"},
    {id:"yang", nome:"YOUTON", icone:"☀️", classe:"yang", resistenciaId:"youton", resistenciaNome:"Yang / Youton"}
  ];

  const NATUREZA_POR_ID = new Map(NATUREZAS.map(item => [item.id, item]));

  const ATRIBUTOS = [
    {id:"", nome:"Escolha o atributo"},
    {id:"inteligencia", nome:"Inteligência"},
    {id:"sabedoria", nome:"Sabedoria"},
    {id:"carisma", nome:"Carisma"},
    {id:"constituicao", nome:"Constituição"},
    {id:"forca", nome:"Força"},
    {id:"destreza", nome:"Destreza"}
  ];

  const ATRIBUTO_POR_ID = new Map(ATRIBUTOS.map(item => [item.id, item]));

  const BENEFICIOS = {
    1:"Aprende a natureza",
    2:"Modificador de Conjuração no dano",
    3:"Resistência automática",
    4:"Técnica Kai sem custo",
    5:"Dado de dano superior",
    6:"Modificador de Conjuração em cada dado",
    7:"Imunidade à natureza"
  };

  const PROXIMO_DADO = new Map([[4,6],[6,8],[8,10],[10,12],[12,12]]);
  const META_NIVEL5 = "beneficioNaturezaNivel5";

  /*
   * Reconhece as formas mais comuns usadas pelos jogadores:
   * 8d8, 8D8, 8 d 8, 8de8, 8 de 8, 8 d8 e d8.
   *
   * O trecho "de" só é aceito quando existe uma quantidade antes dele.
   * Isso evita interpretar frases comuns como "alcance de 8 metros" como dado.
   */
  const PADRAO_DADO_FONTE = String.raw`\b(?:(\d+)\s*(?:de|d)\s*|(d)\s*)(4|6|8|10|12)\b`;

  function criarRegexDado(){
    return new RegExp(PADRAO_DADO_FONTE, "gi");
  }

  function dadosDoMatch(match){
    const quantidadeTexto = match?.[1] || "";
    const quantidade = quantidadeTexto ? Number(quantidadeTexto) : 1;
    const faces = Number(match?.[3]);
    return {
      quantidadeTexto,
      quantidade:Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1,
      faces
    };
  }

  let frameAtualizacao = null;
  let renderizandoJutsus = false;
  let renderizandoNaturezas = false;
  let renderizandoResistencias = false;

  function numeroSeguro(valor, fallback=0){
    const numero = Number(String(valor ?? "").trim().replace(",", "."));
    return Number.isFinite(numero) ? numero : fallback;
  }

  function limitarNivel(valor){
    return Math.max(0, Math.min(7, Math.trunc(numeroSeguro(valor, 0))));
  }

  function normalizarElemento(valor){
    const texto = String(valor || "neutro")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const aliases = {
      fogo:"katon", katon:"katon",
      raio:"raiton", relampago:"raiton", eletrico:"raiton", raiton:"raiton",
      vento:"fuuton", futon:"fuuton", fuuton:"fuuton",
      agua:"suiton", suiton:"suiton",
      terra:"doton", doton:"doton",
      yin:"yin", yinton:"yin", inton:"yin",
      yang:"yang", youton:"yang",
      neutro:"neutro"
    };

    return aliases[texto] || texto;
  }

  function nivelNatureza(id){
    return limitarNivel(estado?.[id]);
  }

  function atributoConjuracaoSelecionado(){
    const id = String(estado?.atributoConjuracaoNatureza || "").trim();
    return ATRIBUTO_POR_ID.has(id) ? id : "";
  }

  function valorAtributo(id){
    if(!id) return null;
    const campo = document.querySelector(`[data-save="${id}"]`);
    const bruto = campo?.value ?? estado?.[id];
    const numero = Number(bruto);
    return Number.isFinite(numero) ? numero : null;
  }

  function calcularModificadorLocal(valor){
    const numero = Number(valor);
    if(!Number.isFinite(numero)) return null;
    if(typeof calcularModificador === "function"){
      const resultado = Number(calcularModificador(numero));
      return Number.isFinite(resultado) ? resultado : null;
    }
    return Math.floor((numero - 10) / 2);
  }

  function dadosConjuracao(){
    const atributoId = atributoConjuracaoSelecionado();
    const atributo = ATRIBUTO_POR_ID.get(atributoId) || ATRIBUTO_POR_ID.get("");
    const valor = valorAtributo(atributoId);
    const modificador = atributoId ? calcularModificadorLocal(valor) : null;

    return {
      atributoId,
      atributoNome: atributo?.nome || "Conjuração",
      valor,
      modificador:Number.isFinite(modificador) ? modificador : null
    };
  }

  function comSinal(valor){
    const numero = numeroSeguro(valor, 0);
    return numero > 0 ? `+${numero}` : String(numero);
  }

  function valorNumericoEstrito(valor){
    const texto = String(valor ?? "").trim().replace(",", ".");
    if(!/^[-+]?\d+(?:\.\d+)?$/.test(texto)) return null;
    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : null;
  }

  function elevarDadosDano(formula){
    const regex = criarRegexDado();
    return String(formula ?? "").replace(regex, (trecho, quantidadeTexto, _dUnitario, faces) => {
      const proximo = PROXIMO_DADO.get(Number(faces));
      if(!proximo) return trecho;
      return `${quantidadeTexto || ""}d${proximo}`;
    });
  }

  function assinaturaDados(formula){
    const dados = [];
    const texto = String(formula ?? "");
    const regex = criarRegexDado();
    let match;
    while((match = regex.exec(texto)) !== null){
      const dado = dadosDoMatch(match);
      dados.push(`${dado.quantidade}d${dado.faces}`);
    }
    return dados.join("|");
  }

  function contarDados(formula){
    let total = 0;
    const texto = String(formula ?? "");
    const regex = criarRegexDado();
    let match;
    while((match = regex.exec(texto)) !== null){
      total += dadosDoMatch(match).quantidade;
    }
    return total;
  }

  function possuiDadoAprimoravel(formula){
    return criarRegexDado().test(String(formula ?? ""));
  }

  function possuiDano(jutsu){
    const texto = String(jutsu?.dano ?? "").trim();
    return Boolean(texto && texto !== "—");
  }

  function ehTecnicaKai(jutsu){
    const nome = String(jutsu?.nome ?? "").trim();
    return /(?:^|:)\s*Kai(?:\s|\(|$)/i.test(nome);
  }

  function persistirEstadoSeguro(){
    try{
      if(typeof persistirEstadoLocal === "function") return persistirEstadoLocal();
      if(typeof window.persistirEstadoLocal === "function") return window.persistirEstadoLocal();
      if(typeof CHAVE !== "undefined"){
        localStorage.setItem(CHAVE, JSON.stringify(estado));
        return true;
      }
    }catch(erro){
      console.warn("Não foi possível salvar as regras de Natureza.", erro);
    }
    return false;
  }

  function limparMarcadoresAntigos(jutsu){
    delete jutsu.naturezaDadoNivel5Aplicado;
    delete jutsu.naturezaDadoNivel5Natureza;
    delete jutsu.naturezaDadoNivel5Versao;
    delete jutsu.naturezaDadoEntradaNivel5;
    delete jutsu.naturezaDadoSaidaNivel5;
  }

  function migrarMarcadorAntigo(jutsu, naturezaId){
    if(!jutsu?.naturezaDadoNivel5Aplicado) return false;

    const antes = String(jutsu.naturezaDadoAntesNivel5 ?? "").trim();
    const atual = String(jutsu.dano ?? "").trim();
    const esperado = antes && possuiDadoAprimoravel(antes)
      ? elevarDadosDano(antes)
      : "";

    if(antes && esperado && atual === esperado){
      jutsu[META_NIVEL5] = {
        natureza:naturezaId,
        entrada:antes,
        saida:atual,
        assinaturaEntrada:assinaturaDados(antes),
        assinaturaSaida:assinaturaDados(atual),
        versao:VERSAO
      };
      limparMarcadoresAntigos(jutsu);
      delete jutsu.naturezaDadoAntesNivel5;
      return true;
    }

    /* O marcador antigo dizia que aplicou, mas o dano permaneceu igual à entrada. */
    if(antes && atual === antes){
      limparMarcadoresAntigos(jutsu);
      delete jutsu.naturezaDadoAntesNivel5;
      return false;
    }

    /* Marcador incompleto ou incompatível: não pode bloquear o valor atual do card. */
    limparMarcadoresAntigos(jutsu);
    delete jutsu.naturezaDadoAntesNivel5;
    return false;
  }

  function nivel5JaAplicado(jutsu, naturezaId){
    const meta = jutsu?.[META_NIVEL5];
    if(!meta || typeof meta !== "object") return false;
    if(normalizarElemento(meta.natureza) !== naturezaId) return false;

    const atual = String(jutsu.dano ?? "").trim();
    return atual === String(meta.saida ?? "").trim();
  }

  function aplicarNivel5AoJutsu(jutsu, naturezaId){
    if(!jutsu || !NATUREZA_POR_ID.has(naturezaId)) return false;
    if(normalizarElemento(jutsu.elemento) !== naturezaId) return false;
    if(nivelNatureza(naturezaId) < 5) return false;

    if(migrarMarcadorAntigo(jutsu, naturezaId)) return true;
    if(nivel5JaAplicado(jutsu, naturezaId)) return false;

    const danoAtual = String(jutsu.dano ?? "").trim();
    if(!possuiDadoAprimoravel(danoAtual)) return false;

    const danoElevado = elevarDadosDano(danoAtual);

    jutsu.dano = danoElevado;
    jutsu[META_NIVEL5] = {
      natureza:naturezaId,
      entrada:danoAtual,
      saida:danoElevado,
      assinaturaEntrada:assinaturaDados(danoAtual),
      assinaturaSaida:assinaturaDados(danoElevado),
      versao:VERSAO
    };

    limparMarcadoresAntigos(jutsu);
    delete jutsu.naturezaDadoAntesNivel5;
    return true;
  }

  function aplicarNivel5NaNatureza(naturezaId, {persistir=true}={}){
    if(!NATUREZA_POR_ID.has(naturezaId) || nivelNatureza(naturezaId) < 5) return 0;
    let alterados = 0;

    (Array.isArray(estado?.jutsus) ? estado.jutsus : []).forEach(jutsu => {
      if(aplicarNivel5AoJutsu(jutsu, naturezaId)) alterados += 1;
    });

    if(alterados && persistir) persistirEstadoSeguro();
    return alterados;
  }

  function aplicarNiveis5Pendentes({persistir=true}={}){
    let alterados = 0;
    NATUREZAS.forEach(natureza => {
      if(nivelNatureza(natureza.id) >= 5){
        alterados += aplicarNivel5NaNatureza(natureza.id, {persistir:false});
      }
    });
    if(alterados && persistir) persistirEstadoSeguro();
    return alterados;
  }

  function calcularJutsuComNatureza(jutsu){
    const elemento = normalizarElemento(jutsu?.elemento);
    const natureza = NATUREZA_POR_ID.get(elemento) || null;
    const nivel = natureza ? nivelNatureza(elemento) : 0;
    const conjuracao = dadosConjuracao();
    const danoEfetivo = String(jutsu?.dano ?? "").trim();
    const quantidadeDados = contarDados(danoEfetivo);
    const temDano = possuiDano(jutsu);

    let bonusNivel2 = 0;
    let bonusNivel6 = 0;
    const motivos = [];

    if(natureza && temDano && conjuracao.modificador !== null){
      if(nivel >= 2){
        bonusNivel2 = conjuracao.modificador;
        motivos.push(`N2 ${comSinal(bonusNivel2)}`);
      }

      /* Os benefícios são cumulativos: o nível 6 soma ao nível 2. */
      if(nivel >= 6 && quantidadeDados > 0){
        bonusNivel6 = conjuracao.modificador * quantidadeDados;
        motivos.push(`N6 ${quantidadeDados} dado${quantidadeDados === 1 ? "" : "s"} × ${comSinal(conjuracao.modificador)}`);
      }
    }

    const bonusNatureza = bonusNivel2 + bonusNivel6;
    const bonusManualTexto = String(jutsu?.bonusDano ?? "").trim();
    const bonusManualNumero = valorNumericoEstrito(bonusManualTexto);
    const bonusTotalNumero = bonusManualNumero === null
      ? null
      : bonusManualNumero + bonusNatureza;

    const custoBaseTexto = String(jutsu?.custo ?? "").trim();
    const kaiSemCusto = Boolean(natureza && nivel >= 4 && ehTecnicaKai(jutsu));
    const metaNivel5 = jutsu?.[META_NIVEL5] && typeof jutsu[META_NIVEL5] === "object"
      ? jutsu[META_NIVEL5]
      : null;

    return {
      natureza,
      elemento,
      nivel,
      conjuracao,
      danoEfetivo,
      quantidadeDados,
      bonusNivel2,
      bonusNivel6,
      bonusNatureza,
      motivoBonus:motivos.join(" + "),
      bonusManualTexto,
      bonusManualNumero,
      bonusTotalNumero,
      custoBaseTexto,
      custoEfetivoTexto:kaiSemCusto ? "0" : custoBaseTexto,
      kaiSemCusto,
      dadoElevado:Boolean(metaNivel5),
      metaNivel5,
      resistenciaAutomatica:Boolean(natureza && nivel >= 3),
      imunidadeAutomatica:Boolean(natureza && nivel >= 7)
    };
  }

  function formatarBonusTotal(regra){
    if(regra.bonusTotalNumero !== null) return comSinal(regra.bonusTotalNumero);
    if(regra.bonusManualTexto && regra.bonusNatureza){
      return `${regra.bonusManualTexto} · automático ${comSinal(regra.bonusNatureza)}`;
    }
    if(regra.bonusManualTexto) return regra.bonusManualTexto;
    if(regra.bonusNatureza) return comSinal(regra.bonusNatureza);
    return "—";
  }

  function formatarDanoTotal(regra){
    const dano = regra.danoEfetivo || "";
    const bonus = formatarBonusTotal(regra);
    if(!dano) return bonus;
    if(bonus === "—" || bonus === "0") return dano;

    if(regra.bonusTotalNumero !== null){
      return `${dano} ${regra.bonusTotalNumero >= 0 ? "+" : "-"} ${Math.abs(regra.bonusTotalNumero)}`;
    }

    if(regra.bonusManualTexto && regra.bonusNatureza){
      return `${dano} + ${regra.bonusManualTexto} ${regra.bonusNatureza >= 0 ? "+" : "-"} ${Math.abs(regra.bonusNatureza)}`;
    }

    if(regra.bonusNatureza){
      return `${dano} ${regra.bonusNatureza >= 0 ? "+" : "-"} ${Math.abs(regra.bonusNatureza)}`;
    }

    return `${dano} + ${regra.bonusManualTexto}`;
  }

  function garantirPainelConjuracao(){
    const container = document.querySelector(".naturezasNoPerfil");
    const lista = document.getElementById("naturezasUI");
    if(!container || !lista) return null;

    let painel = document.getElementById("configConjuracaoNatureza");
    if(!painel){
      painel = document.createElement("div");
      painel.id = "configConjuracaoNatureza";
      painel.className = "configConjuracaoNatureza";
      container.insertBefore(painel, lista);
    }
    return painel;
  }

  function renderizarPainelConjuracao(){
    const painel = garantirPainelConjuracao();
    if(!painel) return;

    const conjuracao = dadosConjuracao();
    const opcoes = ATRIBUTOS.map(atributo => `
      <option value="${atributo.id}" ${atributo.id === conjuracao.atributoId ? "selected" : ""}>
        ${atributo.nome}
      </option>
    `).join("");

    const resumo = conjuracao.atributoId && conjuracao.modificador !== null
      ? `${conjuracao.atributoNome}: ${conjuracao.valor} · Mod. ${comSinal(conjuracao.modificador)}`
      : "Escolha o atributo usado para conjurar os jutsus.";

    painel.innerHTML = `
      <label for="atributoConjuracaoNatureza">Atributo de Conjuração</label>
      <select id="atributoConjuracaoNatureza">${opcoes}</select>
      <span class="conjuracaoNaturezaResumo">${resumo}</span>
      <details class="naturezaRegrasDetalhes">
        <summary>Benefícios cumulativos dos níveis</summary>
        <ol>
          ${Object.entries(BENEFICIOS).map(([nivel, texto]) => `<li><b>Nível ${nivel}:</b> ${texto}.</li>`).join("")}
        </ol>
      </details>
    `;

    painel.querySelector("#atributoConjuracaoNatureza")?.addEventListener("change", evento => {
      definirAtributoConjuracaoNaturezaComRegras(evento.target.value);
    });
  }

  function renderizarNaturezasComRegras(){
    if(renderizandoNaturezas) return;
    renderizandoNaturezas = true;
    try{
      renderizarPainelConjuracao();
      const box = document.getElementById("naturezasUI");
      if(!box) return;

      box.innerHTML = NATUREZAS.map(natureza => {
        const nivelAtual = nivelNatureza(natureza.id);
        const niveis = Array.from({length:7}, (_, indice) => {
          const nivel = indice + 1;
          return `
            <button type="button" class="naturezaNivel" onclick="definirNatureza('${natureza.id}',${nivel})" aria-label="${natureza.nome} nível ${nivel}">
              <span class="naturezaBolinha ${nivel <= nivelAtual ? "ativa" : ""}"></span>
              <small>${nivel}</small>
            </button>
          `;
        }).join("");

        return `
          <div class="naturezaCard ${natureza.classe}">
            <div class="naturezaInfo">
              <span class="naturezaIcone">${natureza.icone}</span>
              <div class="naturezaIdentificacao">
                <div class="naturezaNome">${natureza.nome}</div>
                <span class="naturezaNivelTexto">${nivelAtual}/7</span>
              </div>
            </div>
            <div class="naturezaLinha naturezaLinhaSete">${niveis}</div>
          </div>
        `;
      }).join("");
    }finally{
      renderizandoNaturezas = false;
    }
  }

  function preencherBotaoResumo(botao, rotulo, principal, detalhe=""){
    if(!botao) return;
    const titulo = document.createElement("b");
    titulo.textContent = rotulo;
    const valor = document.createElement("span");
    valor.className = "jutsuValorRegraNatureza";
    valor.textContent = principal || "—";
    botao.replaceChildren(titulo, valor);

    if(detalhe){
      const observacao = document.createElement("small");
      observacao.className = "jutsuDetalheRegraNatureza";
      observacao.textContent = detalhe;
      botao.appendChild(observacao);
    }
  }

  function botaoResumoPorRotulo(card, rotulo){
    return Array.from(card.querySelectorAll(".jutsuResumo button"))
      .find(botao => botao.querySelector("b")?.textContent.trim() === rotulo);
  }

  function aplicarRegrasNosCards(){
    const cards = Array.from(document.querySelectorAll("#listaJutsus .jutsuCard"));

    cards.forEach((card, indice) => {
      const jutsu = estado?.jutsus?.[indice];
      if(!jutsu) return;

      const regra = calcularJutsuComNatureza(jutsu);
      const custo = regra.custoEfetivoTexto || "0";
      const rank = String(jutsu.rank || "Rank").trim() || "Rank";
      const dadosElemento = typeof dadosElementoJutsu === "function"
        ? dadosElementoJutsu(jutsu.elemento || "neutro")
        : {nome:String(jutsu.elemento || "NEUTRO").toUpperCase()};

      const resumoLinha = card.querySelector(".jutsuLinhaTexto small");
      if(resumoLinha) resumoLinha.textContent = `${dadosElemento.nome} • ${rank} • ${custo} CH`;

      const custoPill = card.querySelector(".jutsuCustoPill");
      if(custoPill){
        custoPill.textContent = `${custo} CH`;
        custoPill.classList.toggle("jutsuCustoAutomatico", regra.kaiSemCusto);
        custoPill.title = regra.kaiSemCusto
          ? `Custo base: ${regra.custoBaseTexto || "0"}. Zerado pelo nível 4.`
          : "Editar custo de Chakra";
      }

      const detalheDano = regra.metaNivel5
        ? `N5 aplicado: ${regra.metaNivel5.entrada} → ${regra.metaNivel5.saida}`
        : regra.natureza && regra.nivel >= 5
          ? "N5 aguardando uma fórmula de dado no campo Dano"
          : "";

      preencherBotaoResumo(
        botaoResumoPorRotulo(card, "Dano"),
        "Dano",
        regra.danoEfetivo || "—",
        detalheDano
      );

      const partesBonus = [];
      if(regra.bonusManualTexto) partesBonus.push(`Manual ${regra.bonusManualTexto}`);
      if(regra.bonusNivel2) partesBonus.push(`N2 ${comSinal(regra.bonusNivel2)}`);
      if(regra.bonusNivel6 || (regra.nivel >= 6 && regra.quantidadeDados > 0)){
        partesBonus.push(`N6 ${comSinal(regra.bonusNivel6)} (${regra.quantidadeDados} dados)`);
      }

      const detalheBonus = partesBonus.length
        ? partesBonus.join(" · ")
        : regra.conjuracao.atributoId
          ? "Sem bônus automático neste nível"
          : "Escolha o atributo de Conjuração nas Naturezas";

      preencherBotaoResumo(
        botaoResumoPorRotulo(card, "Bônus dano"),
        "Bônus dano",
        formatarBonusTotal(regra),
        detalheBonus
      );

      preencherBotaoResumo(
        botaoResumoPorRotulo(card, "Dano total"),
        "Dano total",
        formatarDanoTotal(regra),
        regra.natureza && regra.nivel >= 2
          ? `${regra.natureza.nome} N${regra.nivel} · benefícios N1–N${regra.nivel} ativos`
          : ""
      );

      card.classList.toggle("jutsuComBeneficioNatureza", Boolean(regra.natureza && regra.nivel >= 2));
    });
  }

  function idsResistenciasAutomaticas(){
    const resistencias = new Map();
    const imunidades = new Map();

    NATUREZAS.forEach(natureza => {
      const nivel = nivelNatureza(natureza.id);
      if(nivel >= 3) resistencias.set(natureza.resistenciaId, natureza);
      if(nivel >= 7) imunidades.set(natureza.resistenciaId, natureza);
    });

    return {resistencias, imunidades};
  }

  function criarChipAutomatico(natureza, tipo){
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = tipo === "imunidade"
      ? "resistenciaChipResumo resistenciaNaturezaAuto imunidadeNaturezaAuto"
      : "resistenciaChipResumo resistenciaNaturezaAuto";
    chip.textContent = tipo === "imunidade"
      ? `${natureza.icone} Imune: ${natureza.nome}`
      : `${natureza.icone} ${natureza.nome} · Resistência`;
    chip.title = tipo === "imunidade"
      ? "Imunidade automática do nível 7. A resistência do nível 3 continua ativa."
      : "Resistência automática do nível 3.";
    chip.addEventListener("click", () => mostrarBeneficioAutomaticoNatureza(tipo, natureza.id));
    return chip;
  }

  function aplicarRegrasNasResistencias(){
    const painel = document.getElementById("resistenciasBatalhaPainel");
    if(!painel) return;

    painel.querySelectorAll(".resistenciaNaturezaAuto").forEach(chip => chip.remove());

    const {resistencias, imunidades} = idsResistenciasAutomaticas();
    const resumoGrid = painel.querySelector(".resistenciasAtivasGrid") || (() => {
      const vazio = painel.querySelector(".resistenciaVazia");
      if(!vazio) return null;
      const grid = document.createElement("div");
      grid.className = "resistenciasAtivasGrid";
      vazio.replaceWith(grid);
      return grid;
    })();

    resistencias.forEach(natureza => resumoGrid?.appendChild(criarChipAutomatico(natureza, "resistencia")));
    imunidades.forEach(natureza => resumoGrid?.appendChild(criarChipAutomatico(natureza, "imunidade")));

    painel.querySelectorAll(".resistenciaChip").forEach(botao => {
      const onclick = botao.getAttribute("onclick") || "";
      const match = onclick.match(/toggleResistenciaBatalha\(['\"]([^'\"]+)['\"]\)/);
      const id = match?.[1];
      if(!id || !resistencias.has(id)) return;

      const imunidade = imunidades.has(id);
      botao.classList.add("ativo", "resistenciaNaturezaBloqueada");
      botao.classList.toggle("imunidadeNaturezaBloqueada", imunidade);
      botao.title = imunidade
        ? "Resistência N3 e imunidade N7 ativas."
        : "Resistência automática do nível 3.";
    });
  }

  function agendarAtualizacaoCompleta(){
    if(frameAtualizacao !== null) return;
    frameAtualizacao = requestAnimationFrame(() => {
      frameAtualizacao = null;
      renderizarNaturezasComRegras();
      renderizarJutsusComRegras();
      renderizarResistenciasComRegras();
    });
  }

  function definirAtributoConjuracaoNaturezaComRegras(atributoId){
    const id = String(atributoId || "").trim();
    estado.atributoConjuracaoNatureza = ATRIBUTO_POR_ID.has(id) ? id : "";
    persistirEstadoSeguro();
    agendarAtualizacaoCompleta();
  }

  function definirNaturezaComRegras(id, nivel){
    if(!NATUREZA_POR_ID.has(id)) return;
    const nivelClicado = limitarNivel(nivel);
    const nivelAtual = nivelNatureza(id);
    const nivelFinal = nivelAtual === nivelClicado ? 0 : nivelClicado;

    estado[id] = nivelFinal;
    if(nivelFinal >= 5) aplicarNivel5NaNatureza(id, {persistir:false});
    persistirEstadoSeguro();
    agendarAtualizacaoCompleta();
  }

  async function mostrarBeneficioAutomaticoNatureza(tipo, naturezaId){
    const natureza = NATUREZA_POR_ID.get(naturezaId);
    if(!natureza) return;

    const titulo = tipo === "imunidade" ? "Imunidade automática" : "Resistência automática";
    const mensagem = tipo === "imunidade"
      ? `${natureza.nome}: resistência do nível 3 e imunidade do nível 7 estão ativas.`
      : `${natureza.nome}: resistência automática concedida pelo nível 3.`;

    if(typeof avisoShinobi === "function") await avisoShinobi(titulo, mensagem);
    else alert(`${titulo}\n\n${mensagem}`);
  }

  const renderizarJutsusBase = typeof window.renderizarJutsus === "function"
    ? window.renderizarJutsus
    : null;

  function renderizarJutsusComRegras(){
    if(!renderizarJutsusBase) return;
    if(renderizandoJutsus) return renderizarJutsusBase.apply(this, arguments);

    renderizandoJutsus = true;
    try{
      aplicarNiveis5Pendentes({persistir:true});
      const resultado = renderizarJutsusBase.apply(this, arguments);
      aplicarRegrasNosCards();
      return resultado;
    }finally{
      renderizandoJutsus = false;
    }
  }

  const renderizarResistenciasBase = typeof window.renderizarResistenciasBatalha === "function"
    ? window.renderizarResistenciasBatalha
    : null;

  function renderizarResistenciasComRegras(){
    if(!renderizarResistenciasBase) return;
    if(renderizandoResistencias) return renderizarResistenciasBase.apply(this, arguments);

    renderizandoResistencias = true;
    try{
      const resultado = renderizarResistenciasBase.apply(this, arguments);
      aplicarRegrasNasResistencias();
      return resultado;
    }finally{
      renderizandoResistencias = false;
    }
  }

  const toggleResistenciaBase = typeof window.toggleResistenciaBatalha === "function"
    ? window.toggleResistenciaBatalha
    : null;

  function toggleResistenciaComRegras(id){
    const {resistencias, imunidades} = idsResistenciasAutomaticas();
    const natureza = resistencias.get(id) || imunidades.get(id);
    if(natureza){
      mostrarBeneficioAutomaticoNatureza(imunidades.has(id) ? "imunidade" : "resistencia", natureza.id);
      return;
    }
    return toggleResistenciaBase?.apply(this, arguments);
  }

  async function usarJutsuComRegras(indice){
    aplicarNiveis5Pendentes({persistir:true});
    const jutsu = estado?.jutsus?.[indice];
    if(!jutsu) return;

    const regra = calcularJutsuComNatureza(jutsu);
    const custoTexto = regra.custoEfetivoTexto || "0";
    const custoNumero = valorNumericoEstrito(custoTexto);
    const chakra = document.getElementById("chakra");
    const chakraAtual = numeroSeguro(chakra?.value, 0);
    const dadosElemento = typeof dadosElementoJutsu === "function"
      ? dadosElementoJutsu(jutsu.elemento || "neutro")
      : {icone:"✨", nome:"NEUTRO"};

    const nome = jutsu.nome || "Jutsu sem nome";
    const danoTotal = formatarDanoTotal(regra);
    const detalhe = [
      `${dadosElemento.icone} ${dadosElemento.nome}`,
      custoNumero !== null
        ? custoNumero > 0
          ? `Custo de chakra: ${custoNumero}`
          : regra.kaiSemCusto
            ? "Custo de chakra: 0 (benefício N4)"
            : "Sem custo de chakra"
        : `Custo variável: ${custoTexto}`,
      danoTotal && danoTotal !== "—" ? `Dano total: ${danoTotal}` : "",
      regra.bonusNivel2 ? `N2: ${comSinal(regra.bonusNivel2)}` : "",
      regra.bonusNivel6 ? `N6: ${comSinal(regra.bonusNivel6)} (${regra.quantidadeDados} dados)` : ""
    ].filter(Boolean).join("\n");

    const confirmado = typeof confirmarUsoAcao === "function"
      ? await confirmarUsoAcao("jutsu", nome, detalhe)
      : confirm(`${nome}\n\n${detalhe}\n\nUsar este jutsu?`);
    if(!confirmado) return;

    if(custoNumero !== null && custoNumero > chakraAtual){
      const mensagem = `Você tem ${chakraAtual} de chakra.\nEste jutsu precisa de ${custoNumero}.`;
      if(typeof avisoShinobi === "function") await avisoShinobi("Chakra insuficiente", mensagem);
      else alert(mensagem);
      return;
    }

    if(chakra && custoNumero !== null){
      chakra.value = Math.max(0, chakraAtual - Math.max(0, custoNumero));
    }

    if(typeof salvar === "function") salvar();
    else persistirEstadoSeguro();

    const danoLog = danoTotal && danoTotal !== "—" ? ` | Dano: ${danoTotal}` : "";
    const custoLog = custoNumero !== null && custoNumero > 0 ? ` | Chakra: -${custoNumero}` : "";
    if(typeof log === "function") log(`${dadosElemento.icone} Usou ${nome}${danoLog}${custoLog}`);

    /*
     * O catálogo só preenche o card. Ao usar o jutsu, o motor de batalha lê
     * a descrição atualmente salva na ficha e aplica os efeitos reconhecidos.
     */
    if(typeof window.aplicarEfeitosJutsuBatalha === "function"){
      await window.aplicarEfeitosJutsuBatalha(jutsu, indice);
    }

    if(typeof atualizarHUD === "function") atualizarHUD();
    if(typeof window.atualizarDefesasTotaisBatalha === "function") window.atualizarDefesasTotaisBatalha();

    /*
     * Confirma visualmente a execução: depois que o jutsu foi usado com
     * sucesso, fecha somente a carta acionada e devolve a lista ao estado
     * compacto. Não fecha a carta quando a confirmação é cancelada ou quando
     * não há chakra suficiente.
     */
    estado.jutsusAbertos = estado.jutsusAbertos || {};
    delete estado.jutsusAbertos[indice];
    if(typeof persistirSemRender === "function") persistirSemRender();
    else persistirEstadoSeguro();
    if(typeof renderizarJutsus === "function") renderizarJutsus();
  }

  /* Publica também nas ligações globais usadas pelo código antigo e pelos onclicks. */
  window.definirAtributoConjuracaoNatureza = definirAtributoConjuracaoNaturezaComRegras;
  window.definirNatureza = definirNaturezaComRegras;
  window.renderizarNaturezas = renderizarNaturezasComRegras;
  window.renderizarJutsus = renderizarJutsusComRegras;
  window.renderizarResistenciasBatalha = renderizarResistenciasComRegras;
  window.toggleResistenciaBatalha = toggleResistenciaComRegras;
  window.mostrarBeneficioAutomaticoNatureza = mostrarBeneficioAutomaticoNatureza;
  window.usarJutsu = usarJutsuComRegras;

  try{ definirNatureza = definirNaturezaComRegras; }catch(_erro){}
  try{ renderizarNaturezas = renderizarNaturezasComRegras; }catch(_erro){}
  try{ renderizarJutsus = renderizarJutsusComRegras; }catch(_erro){}
  try{ usarJutsu = usarJutsuComRegras; }catch(_erro){}

  window.RegrasNaturezaShinobi = {
    versao:VERSAO,
    nivelNatureza,
    dadosConjuracao,
    elevarDadosDano,
    contarDados,
    calcularJutsu:calcularJutsuComNatureza,
    formatarBonusTotal,
    formatarDanoTotal,
    aplicarNivel5NaNatureza,
    aplicarNiveis5Pendentes,
    idsResistenciasAutomaticas
  };

  document.addEventListener("input", evento => {
    if(evento.target?.matches('[data-save="forca"], [data-save="destreza"], [data-save="constituicao"], [data-save="inteligencia"], [data-save="sabedoria"], [data-save="carisma"]')){
      agendarAtualizacaoCompleta();
    }
  });

  document.addEventListener("change", evento => {
    if(evento.target?.matches('[data-save="forca"], [data-save="destreza"], [data-save="constituicao"], [data-save="inteligencia"], [data-save="sabedoria"], [data-save="carisma"]')){
      agendarAtualizacaoCompleta();
    }
  });

  function iniciar(){
    aplicarNiveis5Pendentes({persistir:true});
    renderizarNaturezasComRegras();
    renderizarJutsusComRegras();
    renderizarResistenciasComRegras();
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar, {once:true});
  else iniciar();
  window.addEventListener("pageshow", iniciar);
})();
