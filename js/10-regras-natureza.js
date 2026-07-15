/* Shinobi 1.6.0 — motor dinâmico das Naturezas de Chakra. */
(function(){
  "use strict";

  if(window.__regrasNaturezaChakraV160) return;
  window.__regrasNaturezaChakraV160 = true;

  const NATUREZAS = [
    {
      id: "katon",
      nome: "KATON",
      icone: "🔥",
      classe: "katon",
      resistenciaId: "katon",
      resistenciaNome: "Katon / Fogo"
    },
    {
      id: "raiton",
      nome: "RAITON",
      icone: "⚡",
      classe: "raiton",
      resistenciaId: "raiton",
      resistenciaNome: "Raiton / Elétrico"
    },
    {
      id: "fuuton",
      nome: "FUUTON",
      icone: "🌪️",
      classe: "fuuton",
      resistenciaId: "fuuton",
      resistenciaNome: "Fuuton / Vento"
    },
    {
      id: "suiton",
      nome: "SUITON",
      icone: "💧",
      classe: "suiton",
      resistenciaId: "suiton",
      resistenciaNome: "Suiton / Água"
    },
    {
      id: "doton",
      nome: "DOTON",
      icone: "🪨",
      classe: "doton",
      resistenciaId: "doton",
      resistenciaNome: "Doton / Terra"
    },
    {
      id: "yin",
      nome: "YINTON",
      icone: "🌑",
      classe: "yin",
      resistenciaId: "genjutsu",
      resistenciaNome: "Yin / Genjutsu"
    },
    {
      id: "yang",
      nome: "YOUTON",
      icone: "☀️",
      classe: "yang",
      resistenciaId: "youton",
      resistenciaNome: "Yang / Youton"
    }
  ];

  const NATUREZA_POR_ID = new Map(
    NATUREZAS.map(natureza => [natureza.id, natureza])
  );

  const ATRIBUTOS = [
    {id: "", nome: "Escolha o atributo"},
    {id: "inteligencia", nome: "Inteligência"},
    {id: "sabedoria", nome: "Sabedoria"},
    {id: "carisma", nome: "Carisma"},
    {id: "constituicao", nome: "Constituição"},
    {id: "forca", nome: "Força"},
    {id: "destreza", nome: "Destreza"}
  ];

  const ATRIBUTO_POR_ID = new Map(
    ATRIBUTOS.map(atributo => [atributo.id, atributo])
  );

  const BENEFICIOS_NIVEL = {
    0: "Natureza não aprendida",
    1: "Natureza aprendida",
    2: "Modificador de Conjuração no dano",
    3: "Resistência automática",
    4: "Técnica Kai sem custo",
    5: "Dado de dano superior",
    6: "Modificador de Conjuração em cada dado",
    7: "Imunidade à natureza"
  };

  const PROXIMO_DADO = new Map([
    [4, 6],
    [6, 8],
    [8, 10],
    [10, 12],
    [12, 12]
  ]);

  let frameAtualizacao = null;
  let renderizandoNaturezas = false;
  let renderizandoJutsus = false;
  let renderizandoResistencias = false;

  function numeroSeguro(valor, fallback = 0){
    const numero = Number(String(valor ?? "").replace(",", "."));
    return Number.isFinite(numero) ? numero : fallback;
  }

  function limitarNivel(valor){
    return Math.max(0, Math.min(7, Math.trunc(numeroSeguro(valor, 0))));
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

    if(typeof window.calcularModificador === "function"){
      return Number(window.calcularModificador(numero));
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
      modificador: Number.isFinite(modificador) ? modificador : null
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
    const texto = String(formula ?? "");

    return texto.replace(
      /(\d*)\s*[dD]\s*(4|6|8|10|12)\b/g,
      (trecho, quantidade, faces) => {
        const proximo = PROXIMO_DADO.get(Number(faces));
        if(!proximo) return trecho;

        const qtd = quantidade || "1";
        return `${qtd}d${proximo}`;
      }
    );
  }

  function contarDados(formula){
    const texto = String(formula ?? "");
    let total = 0;

    for(const correspondencia of texto.matchAll(
      /(\d*)\s*[dD]\s*\d+\b/g
    )){
      const quantidade = correspondencia[1]
        ? Number(correspondencia[1])
        : 1;

      if(Number.isFinite(quantidade) && quantidade > 0){
        total += quantidade;
      }
    }

    return total;
  }

  function possuiDano(jutsu){
    const texto = String(jutsu?.dano ?? "").trim();
    return Boolean(texto && texto !== "—");
  }

  function ehTecnicaKai(jutsu){
    const nome = String(jutsu?.nome ?? "").trim();
    return /(?:^|:)\s*Kai(?:\s|\(|$)/i.test(nome);
  }

  function possuiDadoAprimoravel(formula){
    return /(?:\d*)\s*[dD]\s*(?:4|6|8|10|12)\b/i.test(
      String(formula ?? "")
    );
  }

  function normalizarFormulaComparacao(formula){
    return String(formula ?? "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .trim();
  }

  /*
   * As versões 1.5.2–1.5.4 podiam gravar o aumento do nível 5 dentro
   * do dano. A migração abaixo restaura o valor anterior somente quando
   * o dano atual ainda corresponde exatamente ao resultado automático.
   * Depois remove os marcadores antigos. A partir da 1.6.0 nenhum dano é
   * regravado pelo motor de Naturezas.
   */
  function migrarNivel5Antigo({persistir = true} = {}){
    let alterados = 0;

    (estado?.jutsus || []).forEach(jutsu => {
      if(!jutsu) return;

      const marcado = Boolean(jutsu.naturezaDadoNivel5Aplicado);
      const entrada = String(
        jutsu.naturezaDadoNivel5Entrada ??
        jutsu.naturezaDadoAntesNivel5 ??
        ""
      ).trim();
      const resultadoRegistrado = String(
        jutsu.naturezaDadoNivel5Resultado ?? ""
      ).trim();
      const resultadoEsperado = resultadoRegistrado ||
        (entrada ? elevarDadosDano(entrada) : "");
      const danoAtual = String(jutsu.dano ?? "").trim();

      if(
        marcado &&
        entrada &&
        resultadoEsperado &&
        normalizarFormulaComparacao(danoAtual) ===
          normalizarFormulaComparacao(resultadoEsperado)
      ){
        jutsu.dano = entrada;
        alterados += 1;
      }

      [
        "naturezaDadoNivel5Aplicado",
        "naturezaDadoAntesNivel5",
        "naturezaDadoNivel5Entrada",
        "naturezaDadoNivel5Resultado",
        "naturezaDadoNivel5Natureza",
        "naturezaDadoNivel5Versao"
      ].forEach(campo => {
        if(Object.prototype.hasOwnProperty.call(jutsu, campo)){
          delete jutsu[campo];
          alterados += 1;
        }
      });
    });

    if(!estado?.regrasNaturezaMigracaoV160){
      estado.regrasNaturezaMigracaoV160 = true;
      alterados += 1;
    }

    if(alterados && persistir){
      salvarEstado();
    }

    return alterados;
  }

  function calcularJutsuComNatureza(jutsu){
    const elemento = String(jutsu?.elemento || "neutro")
      .trim()
      .toLowerCase();
    const natureza = NATUREZA_POR_ID.get(elemento) || null;
    const nivel = natureza ? nivelNatureza(elemento) : 0;
    const conjuracao = dadosConjuracao();

    /*
     * O campo dano é sempre a fonte escrita pelo jogador.
     * O nível 5 cria um valor efetivo a partir dessa fonte, sem alterar
     * o dado salvo. Assim, cada ficha usa o próprio dano atual e nunca
     * acumula aumentos ao abrir ou renderizar novamente.
     */
    const danoBase = String(jutsu?.dano ?? "").trim();
    const dadoElevado = Boolean(
      natureza &&
      nivel >= 5 &&
      possuiDadoAprimoravel(danoBase)
    );
    const danoEfetivo = dadoElevado
      ? elevarDadosDano(danoBase)
      : danoBase;

    const quantidadeDados = contarDados(danoEfetivo);
    const temDano = possuiDano(jutsu);

    let bonusNatureza = 0;
    let motivoBonus = "";

    if(
      natureza &&
      temDano &&
      conjuracao.modificador !== null &&
      nivel >= 2
    ){
      if(nivel >= 6){
        if(quantidadeDados > 0){
          bonusNatureza = conjuracao.modificador * quantidadeDados;
          motivoBonus = `${quantidadeDados} dado${quantidadeDados === 1 ? "" : "s"} × ${comSinal(conjuracao.modificador)}`;
        }else{
          motivoBonus = "Nenhum dado reconhecido no campo Dano";
        }
      }else{
        bonusNatureza = conjuracao.modificador;
        motivoBonus = `${conjuracao.atributoNome} ${comSinal(conjuracao.modificador)}`;
      }
    }

    const bonusManualTexto = String(jutsu?.bonusDano ?? "").trim();
    const bonusManualNumero = valorNumericoEstrito(bonusManualTexto);
    const bonusTotalNumero = bonusManualNumero === null
      ? null
      : bonusManualNumero + bonusNatureza;

    const custoBaseTexto = String(jutsu?.custo ?? "").trim();
    const kaiSemCusto = Boolean(
      natureza &&
      nivel >= 4 &&
      ehTecnicaKai(jutsu)
    );

    const custoEfetivoTexto = kaiSemCusto
      ? "0"
      : custoBaseTexto;

    return {
      natureza,
      elemento,
      nivel,
      conjuracao,
      danoBase,
      danoEfetivo,
      quantidadeDados,
      bonusNatureza,
      motivoBonus,
      bonusManualTexto,
      bonusManualNumero,
      bonusTotalNumero,
      custoBaseTexto,
      custoEfetivoTexto,
      kaiSemCusto,
      dadoElevado,
      danoAntesNivel5: dadoElevado ? danoBase : "",
      resistenciaAutomatica: Boolean(natureza && nivel >= 3 && nivel < 7),
      imunidadeAutomatica: Boolean(natureza && nivel >= 7)
    };
  }

  function formatarBonusTotal(regra){
    if(regra.bonusTotalNumero !== null){
      return comSinal(regra.bonusTotalNumero);
    }

    if(regra.bonusManualTexto && regra.bonusNatureza){
      return `${regra.bonusManualTexto} · automático ${comSinal(regra.bonusNatureza)}`;
    }

    if(regra.bonusManualTexto) return regra.bonusManualTexto;
    if(regra.bonusNatureza) return comSinal(regra.bonusNatureza);

    return "—";
  }

  function formatarDanoTotalRegra(regra){
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

  function salvarEstado(){
    try{
      if(typeof window.sincronizarEstadoDosCampos === "function"){
        window.sincronizarEstadoDosCampos();
      }

      if(typeof window.persistirEstadoLocal === "function"){
        return window.persistirEstadoLocal();
      }

      if(typeof CHAVE !== "undefined"){
        localStorage.setItem(CHAVE, JSON.stringify(estado));
        return true;
      }
    }catch(erro){
      console.warn("Não foi possível salvar as regras de natureza.", erro);
    }

    return false;
  }

  function agendarAtualizacaoCompleta(){
    if(frameAtualizacao !== null) return;

    frameAtualizacao = requestAnimationFrame(() => {
      frameAtualizacao = null;
      window.renderizarNaturezas?.();
      window.renderizarJutsus?.();
      window.renderizarResistenciasBatalha?.();
    });
  }

  function garantirPainelConjuracao(){
    const container = document.querySelector(".naturezasNoPerfil");
    const listaNaturezas = document.getElementById("naturezasUI");

    if(!container || !listaNaturezas) return null;

    let painel = document.getElementById("configConjuracaoNatureza");

    if(!painel){
      painel = document.createElement("div");
      painel.id = "configConjuracaoNatureza";
      painel.className = "configConjuracaoNatureza";
      container.insertBefore(painel, listaNaturezas);
    }

    return painel;
  }

  function renderizarPainelConjuracao(){
    const painel = garantirPainelConjuracao();
    if(!painel) return;

    const conjuracao = dadosConjuracao();
    const opcoes = ATRIBUTOS.map(atributo => `
      <option
        value="${atributo.id}"
        ${atributo.id === conjuracao.atributoId ? "selected" : ""}
      >
        ${atributo.nome}
      </option>
    `).join("");

    const resumo = conjuracao.atributoId && conjuracao.modificador !== null
      ? `${conjuracao.atributoNome}: ${conjuracao.valor} · Mod. ${comSinal(conjuracao.modificador)}`
      : "Escolha o atributo usado para conjurar os jutsus.";

    painel.innerHTML = `
      <label for="atributoConjuracaoNatureza">
        Atributo de Conjuração
      </label>

      <select id="atributoConjuracaoNatureza">
        ${opcoes}
      </select>

      <span class="conjuracaoNaturezaResumo">
        ${resumo}
      </span>

      <details class="naturezaRegrasDetalhes">
        <summary>Benefícios dos níveis</summary>
        <ol>
          <li>Aprende a natureza.</li>
          <li>Adiciona o modificador de Conjuração ao dano.</li>
          <li>Ganha resistência automática.</li>
          <li>A Técnica Kai da natureza passa a custar 0.</li>
          <li>Os dados de dano sobem uma categoria.</li>
          <li>O modificador é aplicado a cada dado.</li>
          <li>Ganha imunidade à natureza.</li>
        </ol>
      </details>
    `;

    const seletor = painel.querySelector("#atributoConjuracaoNatureza");
    seletor?.addEventListener("change", evento => {
      window.definirAtributoConjuracaoNatureza(evento.target.value);
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
        const niveis = Array.from({length: 7}, (_, indice) => {
          const nivel = indice + 1;
          const ativo = nivel <= nivelAtual ? "ativa" : "";

          return `
            <button
              type="button"
              class="naturezaNivel"
              onclick="definirNatureza('${natureza.id}', ${nivel})"
              aria-label="${natureza.nome} nível ${nivel}"
              title="${BENEFICIOS_NIVEL[nivel]}"
            >
              <span class="naturezaBolinha ${ativo}"></span>
              <small>${nivel}</small>
            </button>
          `;
        }).join("");

        return `
          <div class="naturezaCard ${natureza.classe}">
            <div class="naturezaInfo">
              <span class="naturezaIcone">${natureza.icone}</span>
              <div>
                <div class="naturezaNome">${natureza.nome}</div>
                <span class="naturezaNivelTexto">${nivelAtual}/7</span>
                <small class="naturezaBeneficioAtual">
                  ${BENEFICIOS_NIVEL[nivelAtual]}
                </small>
              </div>
            </div>

            <div class="naturezaLinha naturezaLinhaSete">
              ${niveis}
            </div>
          </div>
        `;
      }).join("");
    }finally{
      renderizandoNaturezas = false;
    }
  }

  function preencherBotaoResumo(botao, rotulo, principal, detalhe = ""){
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
    const cards = Array.from(
      document.querySelectorAll("#listaJutsus .jutsuCard")
    );

    cards.forEach((card, indice) => {
      const jutsu = estado?.jutsus?.[indice];
      if(!jutsu) return;

      const regra = calcularJutsuComNatureza(jutsu);
      const custo = regra.custoEfetivoTexto || "0";
      const rank = String(jutsu.rank || "Rank").trim() || "Rank";
      const dadosElemento = typeof window.dadosElementoJutsu === "function"
        ? window.dadosElementoJutsu(jutsu.elemento || "neutro")
        : {nome: String(jutsu.elemento || "NEUTRO").toUpperCase()};

      const resumoLinha = card.querySelector(".jutsuLinhaTexto small");
      if(resumoLinha){
        resumoLinha.textContent = `${dadosElemento.nome} • ${rank} • ${custo} CH`;
      }

      const custoPill = card.querySelector(".jutsuCustoPill");
      if(custoPill){
        custoPill.textContent = `${custo} CH`;
        custoPill.classList.toggle("jutsuCustoAutomatico", regra.kaiSemCusto);
        custoPill.title = regra.kaiSemCusto
          ? `Custo base: ${regra.custoBaseTexto || "0"}. Zerado pela Natureza nível 4.`
          : "Editar custo de Chakra";
      }

      const detalheDano = regra.dadoElevado
        ? regra.danoAntesNivel5
          ? `Base da ficha ${regra.danoAntesNivel5} · Natureza nível 5`
          : "Aumento automático da Natureza nível 5"
        : "";

      preencherBotaoResumo(
        botaoResumoPorRotulo(card, "Dano"),
        "Dano",
        regra.danoEfetivo || "—",
        detalheDano
      );

      const detalheBonus = regra.bonusNatureza
        ? `${regra.bonusManualTexto ? `Manual ${regra.bonusManualTexto} · ` : ""}Automático ${comSinal(regra.bonusNatureza)} (${regra.motivoBonus})`
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
        formatarDanoTotalRegra(regra),
        regra.nivel >= 2 && regra.natureza
          ? `${regra.natureza.nome} nível ${regra.nivel}`
          : ""
      );

      card.classList.toggle(
        "jutsuComBeneficioNatureza",
        Boolean(regra.natureza && regra.nivel >= 2)
      );
    });
  }

  function idsResistenciasAutomaticas(){
    const resistencias = new Map();
    const imunidades = new Map();

    NATUREZAS.forEach(natureza => {
      const nivel = nivelNatureza(natureza.id);

      if(nivel >= 7){
        imunidades.set(natureza.resistenciaId, natureza);
      }else if(nivel >= 3){
        resistencias.set(natureza.resistenciaId, natureza);
      }
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
      : `${natureza.icone} ${natureza.nome} · Natureza`;

    chip.title = tipo === "imunidade"
      ? "Imunidade automática concedida pelo nível 7 da Natureza."
      : "Resistência automática concedida pelo nível 3 da Natureza.";

    chip.addEventListener("click", () => {
      window.mostrarBeneficioAutomaticoNatureza(tipo, natureza.id);
    });

    return chip;
  }

  function aplicarRegrasNasResistencias(){
    const painel = document.getElementById("resistenciasBatalhaPainel");
    if(!painel) return;

    const {resistencias, imunidades} = idsResistenciasAutomaticas();
    const automaticas = new Map([...resistencias, ...imunidades]);

    painel.querySelectorAll(".resistenciaNaturezaAuto").forEach(elemento => {
      elemento.remove();
    });

    let resumoGrid = painel.querySelector(".resistenciasAtivasGrid");
    const vazio = painel.querySelector(".resistenciaVazia");

    if(automaticas.size && !resumoGrid){
      resumoGrid = document.createElement("div");
      resumoGrid.className = "resistenciasAtivasGrid";
      vazio?.replaceWith(resumoGrid);
    }

    function aplicarOuCriarChip(natureza, tipo){
      const id = natureza.resistenciaId;
      const existente = Array.from(
        resumoGrid?.querySelectorAll("button") || []
      ).find(botao => {
        const onclick = botao.getAttribute("onclick") || "";
        return onclick.includes(`'${id}'`) || onclick.includes(`"${id}"`);
      });

      if(existente){
        existente.classList.add("resistenciaNaturezaAuto");
        existente.classList.toggle(
          "imunidadeNaturezaAuto",
          tipo === "imunidade"
        );
        existente.textContent = tipo === "imunidade"
          ? `${natureza.icone} Imune: ${natureza.nome}`
          : `${natureza.icone} ${natureza.nome} · Natureza`;
        existente.title = tipo === "imunidade"
          ? "Imunidade automática concedida pelo nível 7 da Natureza."
          : "Resistência automática concedida pelo nível 3 da Natureza.";
        return;
      }

      resumoGrid?.appendChild(criarChipAutomatico(natureza, tipo));
    }

    resistencias.forEach(natureza => {
      aplicarOuCriarChip(natureza, "resistencia");
    });

    imunidades.forEach(natureza => {
      aplicarOuCriarChip(natureza, "imunidade");
    });

    painel.querySelectorAll(".resistenciaChip").forEach(botao => {
      const onclick = botao.getAttribute("onclick") || "";
      const correspondencia = onclick.match(/toggleResistenciaBatalha\(['\"]([^'\"]+)['\"]\)/);
      const id = correspondencia?.[1];
      if(!id || !automaticas.has(id)) return;

      const natureza = automaticas.get(id);
      const imunidade = imunidades.has(id);

      botao.classList.add("ativo", "resistenciaNaturezaBloqueada");
      botao.classList.toggle("imunidadeNaturezaBloqueada", imunidade);
      botao.title = imunidade
        ? `${natureza.nome}: imunidade automática do nível 7.`
        : `${natureza.nome}: resistência automática do nível 3.`;
    });
  }

  window.definirAtributoConjuracaoNatureza = function(atributoId){
    const id = String(atributoId || "").trim();
    estado.atributoConjuracaoNatureza = ATRIBUTO_POR_ID.has(id) ? id : "";
    salvarEstado();
    agendarAtualizacaoCompleta();
  };

  window.definirNatureza = function(id, nivel){
    if(!NATUREZA_POR_ID.has(id)) return;

    const novoNivel = limitarNivel(nivel);
    const atual = nivelNatureza(id);
    const nivelFinal = atual === novoNivel
      ? 0
      : novoNivel;

    estado[id] = nivelFinal;
    salvarEstado();
    agendarAtualizacaoCompleta();
  };

  window.mostrarBeneficioAutomaticoNatureza = async function(tipo, naturezaId){
    const natureza = NATUREZA_POR_ID.get(naturezaId);
    if(!natureza) return;

    const titulo = tipo === "imunidade"
      ? "Imunidade automática"
      : "Resistência automática";

    const mensagem = tipo === "imunidade"
      ? `${natureza.nome} está no nível 7. Esta imunidade é concedida pela Natureza e acompanha o nível automaticamente.`
      : `${natureza.nome} está no nível 3 ou superior. Esta resistência é concedida pela Natureza e acompanha o nível automaticamente.`;

    if(typeof window.avisoShinobi === "function"){
      await window.avisoShinobi(titulo, mensagem);
    }else{
      alert(`${titulo}\n\n${mensagem}`);
    }
  };

  window.RegrasNaturezaShinobi = {
    versao: "1.6.0",
    nivelNatureza,
    dadosConjuracao,
    elevarDadosDano,
    contarDados,
    calcularJutsu: calcularJutsuComNatureza,
    formatarBonusTotal,
    formatarDanoTotal: formatarDanoTotalRegra,
    idsResistenciasAutomaticas,
    migrarNivel5Antigo
  };

  /*
   * O renderizador recebe temporariamente o dano efetivo do nível 5,
   * o bônus total e o custo efetivo do Kai. Logo após criar o HTML,
   * os valores escritos pelo jogador são restaurados. O app mostra e
   * usa o benefício sem alterar a fonte da ficha e sem acumular bônus.
   */
  function prepararValoresEfetivosParaRenderizacao(){
    const restaurar = [];

    (estado?.jutsus || []).forEach(jutsu => {
      if(!jutsu) return;

      const regra = calcularJutsuComNatureza(jutsu);

      restaurar.push({
        jutsu,
        dano: jutsu.dano,
        bonusDano: jutsu.bonusDano,
        custo: jutsu.custo
      });

      if(regra.dadoElevado){
        jutsu.dano = regra.danoEfetivo;
      }

      if(regra.bonusNatureza){
        if(regra.bonusManualNumero !== null){
          jutsu.bonusDano = String(regra.bonusTotalNumero);
        }else if(!regra.bonusManualTexto){
          jutsu.bonusDano = String(regra.bonusNatureza);
        }
      }

      if(regra.kaiSemCusto){
        jutsu.custo = regra.custoEfetivoTexto;
      }
    });

    return function restaurarValoresBase(){
      restaurar.forEach(item => {
        item.jutsu.dano = item.dano;
        item.jutsu.bonusDano = item.bonusDano;
        item.jutsu.custo = item.custo;
      });
    };
  }

  const renderizarJutsusBase = window.renderizarJutsus;
  if(typeof renderizarJutsusBase === "function"){
    window.renderizarJutsus = function(){
      if(renderizandoJutsus){
        return renderizarJutsusBase.apply(this, arguments);
      }

      renderizandoJutsus = true;

      const restaurarValoresBase =
        prepararValoresEfetivosParaRenderizacao();

      let resultado;

      try{
        resultado = renderizarJutsusBase.apply(
          this,
          arguments
        );
      }finally{
        restaurarValoresBase();
        renderizandoJutsus = false;
      }

      /*
       * Os textos auxiliares são aplicados depois da restauração para
       * que o cálculo sempre use os valores-base, sem elevar o dado duas
       * vezes ou somar o bônus automático novamente.
       */
      aplicarRegrasNosCards();
      return resultado;
    };
  }

  const renderizarResistenciasBase = window.renderizarResistenciasBatalha;
  if(typeof renderizarResistenciasBase === "function"){
    window.renderizarResistenciasBatalha = function(){
      if(renderizandoResistencias){
        return renderizarResistenciasBase.apply(this, arguments);
      }

      renderizandoResistencias = true;
      try{
        const resultado = renderizarResistenciasBase.apply(this, arguments);
        aplicarRegrasNasResistencias();
        return resultado;
      }finally{
        renderizandoResistencias = false;
      }
    };
  }

  const toggleResistenciaBase = window.toggleResistenciaBatalha;
  if(typeof toggleResistenciaBase === "function"){
    window.toggleResistenciaBatalha = function(id){
      const {resistencias, imunidades} = idsResistenciasAutomaticas();
      const natureza = resistencias.get(id) || imunidades.get(id);

      if(natureza){
        window.mostrarBeneficioAutomaticoNatureza(
          imunidades.has(id) ? "imunidade" : "resistencia",
          natureza.id
        );
        return;
      }

      return toggleResistenciaBase.apply(this, arguments);
    };
  }

  window.renderizarNaturezas = renderizarNaturezasComRegras;

  window.usarJutsu = async function(indice){
    const jutsu = estado?.jutsus?.[indice];
    if(!jutsu) return;

    const regra = calcularJutsuComNatureza(jutsu);
    const custoTexto = regra.custoEfetivoTexto || "0";
    const custoNumero = valorNumericoEstrito(custoTexto);
    const chakra = document.getElementById("chakra");
    const chakraAtual = numeroSeguro(chakra?.value, 0);
    const dadosElemento = typeof window.dadosElementoJutsu === "function"
      ? window.dadosElementoJutsu(jutsu.elemento || "neutro")
      : {icone: "✨", nome: "NEUTRO"};

    const nome = jutsu.nome || "Jutsu sem nome";
    const danoTotal = formatarDanoTotalRegra(regra);

    const detalhe = [
      `${dadosElemento.icone} ${dadosElemento.nome}`,
      custoNumero !== null
        ? custoNumero > 0
          ? `Custo de chakra: ${custoNumero}`
          : regra.kaiSemCusto
            ? "Custo de chakra: 0 (Natureza nível 4)"
            : "Sem custo de chakra"
        : `Custo variável: ${custoTexto}`,
      danoTotal && danoTotal !== "—"
        ? `Dano total: ${danoTotal}`
        : "",
      regra.bonusNatureza
        ? `Bônus automático: ${comSinal(regra.bonusNatureza)} (${regra.motivoBonus})`
        : ""
    ].filter(Boolean).join("\n");

    const confirmado = typeof window.confirmarUsoAcao === "function"
      ? await window.confirmarUsoAcao("jutsu", nome, detalhe)
      : confirm(`${nome}\n\n${detalhe}\n\nUsar este jutsu?`);

    if(!confirmado) return;

    if(custoNumero !== null && custoNumero > chakraAtual){
      const mensagem = `Você tem ${chakraAtual} de chakra.\nEste jutsu precisa de ${custoNumero}.`;

      if(typeof window.avisoShinobi === "function"){
        await window.avisoShinobi("Chakra insuficiente", mensagem);
      }else{
        alert(mensagem);
      }
      return;
    }

    if(chakra && custoNumero !== null){
      chakra.value = Math.max(0, chakraAtual - Math.max(0, custoNumero));
    }

    if(typeof window.salvar === "function"){
      window.salvar();
    }else{
      salvarEstado();
    }

    const danoLog = danoTotal && danoTotal !== "—"
      ? ` | Dano: ${danoTotal}`
      : "";

    const custoLog = custoNumero !== null && custoNumero > 0
      ? ` | Chakra: -${custoNumero}`
      : "";

    if(typeof window.log === "function"){
      window.log(`${dadosElemento.icone} Usou ${nome}${danoLog}${custoLog}`);
    }

    window.atualizarHUD?.();
  };

  document.addEventListener("input", evento => {
    if(
      evento.target?.matches(
        '[data-save="forca"], [data-save="destreza"], [data-save="constituicao"], [data-save="inteligencia"], [data-save="sabedoria"], [data-save="carisma"]'
      )
    ){
      agendarAtualizacaoCompleta();
    }
  });

  document.addEventListener("change", evento => {
    if(
      evento.target?.matches(
        '[data-save="forca"], [data-save="destreza"], [data-save="constituicao"], [data-save="inteligencia"], [data-save="sabedoria"], [data-save="carisma"]'
      )
    ){
      agendarAtualizacaoCompleta();
    }
  });

  function iniciar(){
    migrarNivel5Antigo({persistir: true});
    window.renderizarNaturezas?.();
    window.renderizarJutsus?.();
    window.renderizarResistenciasBatalha?.();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", iniciar, {once: true});
  }else{
    iniciar();
  }

  window.addEventListener("pageshow", iniciar);
})();
