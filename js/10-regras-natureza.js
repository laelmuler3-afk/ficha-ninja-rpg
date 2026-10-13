/* Shinobi 1.8.4 — Naturezas + integração com efeitos automáticos de batalha. */
(function(){
  "use strict";

  if(window.__regrasNaturezaChakraV184) return;
  window.__regrasNaturezaChakraV184 = true;

  const VERSAO = "1.8.4";

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
  let beneficiosNaturezaAberto = false;

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

  function persistirEstadoSeguro(contexto={}){
    try{
      if(typeof persistirEstadoLocal === "function") return persistirEstadoLocal(contexto);
      if(typeof window.persistirEstadoLocal === "function") return window.persistirEstadoLocal(contexto);
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
    delete jutsu.naturezaDadoAntesNivel5;
  }

  /*
   * Até a 1.8.3 o benefício N5 alterava jutsu.dano de forma persistente.
   * Isso deixava o dado promovido gravado na ficha e fazia um jutsu continuar
   * com d8/d10/etc. mesmo quando a Natureza atual já não tinha N5.
   *
   * A partir da 1.8.4 jutsu.dano volta a ser SEMPRE o dano-base informado pelo
   * jogador/catálogo. A promoção de dado é somente uma projeção calculada na
   * hora, a partir do nível ATUAL da Natureza daquele elemento.
   *
   * Esta rotina só desfaz alterações antigas quando os marcadores existentes
   * comprovam, sem ambiguidade, qual era a entrada e qual foi a saída gerada.
   * Edições manuais posteriores nunca são sobrescritas.
   */
  function restaurarDanoBaseNivel5Antigo(jutsu){
    if(!jutsu || typeof jutsu !== "object") return false;

    let alterou = false;
    const atual = String(jutsu.dano ?? "").trim();
    const meta = jutsu[META_NIVEL5];

    if(meta && typeof meta === "object"){
      const entrada = String(meta.entrada ?? "").trim();
      const saida = String(meta.saida ?? "").trim();

      if(entrada && saida && atual === saida){
        jutsu.dano = entrada;
        alterou = true;
      }

      /* O marcador antigo não participa mais do cálculo, mesmo quando o valor
       * foi editado manualmente depois da promoção. */
      delete jutsu[META_NIVEL5];
      alterou = true;
    }

    if(jutsu.naturezaDadoNivel5Aplicado){
      const antes = String(jutsu.naturezaDadoAntesNivel5 ?? "").trim();
      const agora = String(jutsu.dano ?? "").trim();
      const esperado = antes && possuiDadoAprimoravel(antes)
        ? elevarDadosDano(antes)
        : "";

      if(antes && esperado && agora === esperado){
        jutsu.dano = antes;
        alterou = true;
      }

      limparMarcadoresAntigos(jutsu);
      alterou = true;
    }else{
      const tinhaMarcadorSolto = [
        "naturezaDadoNivel5Natureza",
        "naturezaDadoNivel5Versao",
        "naturezaDadoEntradaNivel5",
        "naturezaDadoSaidaNivel5",
        "naturezaDadoAntesNivel5"
      ].some(chave => Object.prototype.hasOwnProperty.call(jutsu, chave));
      if(tinhaMarcadorSolto){
        limparMarcadoresAntigos(jutsu);
        alterou = true;
      }
    }

    return alterou;
  }

  function normalizarDanosNivel5Persistidos({persistir=true}={}){
    let alterados = 0;
    (Array.isArray(estado?.jutsus) ? estado.jutsus : []).forEach(jutsu => {
      if(restaurarDanoBaseNivel5Antigo(jutsu)) alterados += 1;
    });

    if(alterados && persistir) persistirEstadoSeguro({
      confirmada:true,
      origem:"natureza",
      campo:"jutsus",
      motivo:"reparo-nivel-natureza"
    });
    return alterados;
  }

  /* Mantidos com os mesmos nomes públicos para compatibilidade com o restante
   * do app. Eles agora normalizam dados persistidos antigos; a promoção N5 não
   * é mais gravada no jutsu. */
  function aplicarNivel5NaNatureza(_naturezaId, {persistir=true}={}){
    return normalizarDanosNivel5Persistidos({persistir});
  }

  function aplicarNiveis5Pendentes({persistir=true}={}){
    return normalizarDanosNivel5Persistidos({persistir});
  }

  function calcularJutsuComNatureza(jutsu){
    const elemento = normalizarElemento(jutsu?.elemento);
    const natureza = NATUREZA_POR_ID.get(elemento) || null;
    const nivel = natureza ? nivelNatureza(elemento) : 0;
    const conjuracao = dadosConjuracao();
    const danoBase = String(jutsu?.dano ?? "").trim();
    const nivel5Ativo = Boolean(
      natureza &&
      nivel >= 5 &&
      possuiDadoAprimoravel(danoBase)
    );
    const danoEfetivo = nivel5Ativo ? elevarDadosDano(danoBase) : danoBase;
    const quantidadeDados = contarDados(danoEfetivo);
    const temDano = Boolean(danoBase && danoBase !== "—");

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
    const metaNivel5 = nivel5Ativo
      ? {
          natureza:elemento,
          entrada:danoBase,
          saida:danoEfetivo,
          versao:VERSAO,
          dinamico:true
        }
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

    painel.innerHTML = `
      <label for="atributoConjuracaoNatureza">Atributo de Conjuração</label>
      <select id="atributoConjuracaoNatureza">${opcoes}</select>
      <button type="button" class="conjuracaoBeneficiosToggle ${beneficiosNaturezaAberto ? "aberto" : ""}" aria-expanded="${beneficiosNaturezaAberto ? "true" : "false"}" aria-controls="naturezaBeneficiosPainel" aria-label="Mostrar benefícios cumulativos dos níveis" title="Benefícios cumulativos dos níveis">
        <span class="conjuracaoBeneficiosSeta" aria-hidden="true"></span>
      </button>
      <div id="naturezaBeneficiosPainel" class="naturezaBeneficiosPainel ${beneficiosNaturezaAberto ? "aberto" : ""}" ${beneficiosNaturezaAberto ? "" : "hidden"}>
        <div class="naturezaBeneficiosCabecalho">
          <strong>Benefícios cumulativos dos níveis</strong>
        </div>
        <ol>
          ${Object.entries(BENEFICIOS).map(([nivel, texto]) => `<li><b>Nível ${nivel}:</b> ${texto}.</li>`).join("")}
        </ol>
      </div>
    `;

    painel.querySelector("#atributoConjuracaoNatureza")?.addEventListener("change", evento => {
      definirAtributoConjuracaoNaturezaComRegras(evento.target.value);
    });

    const toggle = painel.querySelector('.conjuracaoBeneficiosToggle');
    const beneficios = painel.querySelector('#naturezaBeneficiosPainel');
    const sincronizarBeneficios = ()=>{
      const aberto = !!beneficiosNaturezaAberto;
      if(toggle){
        toggle.classList.toggle('aberto', aberto);
        toggle.setAttribute('aria-expanded', String(aberto));
      }
      if(beneficios){
        beneficios.hidden = !aberto;
        beneficios.classList.toggle('aberto', aberto);
      }
    };
    toggle?.addEventListener('click', ()=>{
      beneficiosNaturezaAberto = !beneficiosNaturezaAberto;
      sincronizarBeneficios();
    });
    sincronizarBeneficios();
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
          <article class="naturezaCard ${natureza.classe}">
            <span class="naturezaInfo">
              <span class="naturezaIcone">${natureza.icone}</span>
              <span class="naturezaIdentificacao">
                <span class="naturezaNome">${natureza.nome}</span>
              </span>
            </span>
            <span class="naturezaLinha naturezaLinhaSete">${niveis}</span>
          </article>
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
        ? `N5 ativo: ${regra.metaNivel5.entrada} → ${regra.metaNivel5.saida}`
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

  async function definirAtributoConjuracaoNaturezaComRegras(atributoId){
    const id = String(atributoId || "").trim();
    const novo=ATRIBUTO_POR_ID.has(id) ? id : "";
    const atual=String(estado.atributoConjuracaoNatureza||"");
    if(novo===atual) return;
    const rotuloNovo=ATRIBUTO_POR_ID.get(novo)?.nome||novo||"Automático";
    const rotuloAtual=ATRIBUTO_POR_ID.get(atual)?.nome||atual||"Automático";
    const confirmado=typeof modalShinobi==="function"
      ? await modalShinobi("Confirmar alteração?",`Atributo de conjuração: ${rotuloAtual} → ${rotuloNovo}`)
      : confirm(`Atributo de conjuração: ${rotuloAtual} → ${rotuloNovo}`);
    if(!confirmado) return;
    estado.atributoConjuracaoNatureza = novo;
    persistirEstadoSeguro({confirmada:true,origem:"natureza",campo:"atributoConjuracaoNatureza",motivo:"alteracao-confirmada"});
    agendarAtualizacaoCompleta();
  }

  async function definirNaturezaComRegras(id, nivel){
    if(!NATUREZA_POR_ID.has(id)) return;
    const nivelClicado = limitarNivel(nivel);
    const nivelAtual = nivelNatureza(id);
    const nivelFinal = nivelAtual === nivelClicado ? 0 : nivelClicado;
    if(nivelFinal===nivelAtual) return;
    const natureza=NATUREZA_POR_ID.get(id);
    const confirmado=typeof modalShinobi==="function"
      ? await modalShinobi("Confirmar alteração?",`${natureza?.nome||id}: nível ${nivelAtual} → ${nivelFinal}`)
      : confirm(`${natureza?.nome||id}: nível ${nivelAtual} → ${nivelFinal}`);
    if(!confirmado) return;

    estado[id] = nivelFinal;
    normalizarDanosNivel5Persistidos({persistir:false});
    persistirEstadoSeguro({confirmada:true,origem:"natureza",campos:[id,"jutsus"],motivo:"alteracao-confirmada"});
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

    if(typeof salvar === "function") salvar({confirmada:true,origem:"jutsu",campo:"chakra",antes:chakraAtual,depois:chakra?Number(chakra.value):chakraAtual,motivo:"alteracao-confirmada"});
    else persistirEstadoSeguro({confirmada:true,origem:"jutsu",campo:"chakra",motivo:"alteracao-confirmada"});

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
    normalizarDanosNivel5Persistidos,
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
