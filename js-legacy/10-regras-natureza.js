/* GERADO AUTOMATICAMENTE — fonte: js/10-regras-natureza.js — app 2.5.8.154. Não editar. */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
/* Shinobi 1.8.3 — Naturezas + integração com efeitos automáticos de batalha. */
(function () {
    "use strict";
    if (window.__regrasNaturezaChakraV183)
        return;
    window.__regrasNaturezaChakraV183 = true;
    var VERSAO = "1.8.3";
    var NATUREZAS = [
        { id: "katon", nome: "KATON", icone: "🔥", classe: "katon", resistenciaId: "katon", resistenciaNome: "Katon / Fogo" },
        { id: "raiton", nome: "RAITON", icone: "⚡", classe: "raiton", resistenciaId: "raiton", resistenciaNome: "Raiton / Elétrico" },
        { id: "fuuton", nome: "FUUTON", icone: "🌪️", classe: "fuuton", resistenciaId: "fuuton", resistenciaNome: "Fuuton / Vento" },
        { id: "suiton", nome: "SUITON", icone: "💧", classe: "suiton", resistenciaId: "suiton", resistenciaNome: "Suiton / Água" },
        { id: "doton", nome: "DOTON", icone: "🪨", classe: "doton", resistenciaId: "doton", resistenciaNome: "Doton / Terra" },
        { id: "yin", nome: "YINTON", icone: "🌑", classe: "yin", resistenciaId: "genjutsu", resistenciaNome: "Yin / Genjutsu" },
        { id: "yang", nome: "YOUTON", icone: "☀️", classe: "yang", resistenciaId: "youton", resistenciaNome: "Yang / Youton" }
    ];
    var NATUREZA_POR_ID = new Map(NATUREZAS.map(function (item) { return [item.id, item]; }));
    var ATRIBUTOS = [
        { id: "", nome: "Escolha o atributo" },
        { id: "inteligencia", nome: "Inteligência" },
        { id: "sabedoria", nome: "Sabedoria" },
        { id: "carisma", nome: "Carisma" },
        { id: "constituicao", nome: "Constituição" },
        { id: "forca", nome: "Força" },
        { id: "destreza", nome: "Destreza" }
    ];
    var ATRIBUTO_POR_ID = new Map(ATRIBUTOS.map(function (item) { return [item.id, item]; }));
    var BENEFICIOS = {
        1: "Aprende a natureza",
        2: "Modificador de Conjuração no dano",
        3: "Resistência automática",
        4: "Técnica Kai sem custo",
        5: "Dado de dano superior",
        6: "Modificador de Conjuração em cada dado",
        7: "Imunidade à natureza"
    };
    var PROXIMO_DADO = new Map([[4, 6], [6, 8], [8, 10], [10, 12], [12, 12]]);
    var META_NIVEL5 = "beneficioNaturezaNivel5";
    /*
     * Reconhece as formas mais comuns usadas pelos jogadores:
     * 8d8, 8D8, 8 d 8, 8de8, 8 de 8, 8 d8 e d8.
     *
     * O trecho "de" só é aceito quando existe uma quantidade antes dele.
     * Isso evita interpretar frases comuns como "alcance de 8 metros" como dado.
     */
    var PADRAO_DADO_FONTE = String.raw(__makeTemplateObject(["\b(?:(d+)s*(?:de|d)s*|(d)s*)(4|6|8|10|12)\b"], ["\\b(?:(\\d+)\\s*(?:de|d)\\s*|(d)\\s*)(4|6|8|10|12)\\b"]));
    function criarRegexDado() {
        return new RegExp(PADRAO_DADO_FONTE, "gi");
    }
    function dadosDoMatch(match) {
        var quantidadeTexto = (match === null || match === void 0 ? void 0 : match[1]) || "";
        var quantidade = quantidadeTexto ? Number(quantidadeTexto) : 1;
        var faces = Number(match === null || match === void 0 ? void 0 : match[3]);
        return {
            quantidadeTexto: quantidadeTexto,
            quantidade: Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1,
            faces: faces
        };
    }
    var frameAtualizacao = null;
    var renderizandoJutsus = false;
    var renderizandoNaturezas = false;
    var renderizandoResistencias = false;
    var beneficiosNaturezaAberto = false;
    function numeroSeguro(valor, fallback) {
        if (fallback === void 0) { fallback = 0; }
        var numero = Number(String(valor !== null && valor !== void 0 ? valor : "").trim().replace(",", "."));
        return Number.isFinite(numero) ? numero : fallback;
    }
    function limitarNivel(valor) {
        return Math.max(0, Math.min(7, Math.trunc(numeroSeguro(valor, 0))));
    }
    function normalizarElemento(valor) {
        var texto = String(valor || "neutro")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        var aliases = {
            fogo: "katon", katon: "katon",
            raio: "raiton", relampago: "raiton", eletrico: "raiton", raiton: "raiton",
            vento: "fuuton", futon: "fuuton", fuuton: "fuuton",
            agua: "suiton", suiton: "suiton",
            terra: "doton", doton: "doton",
            yin: "yin", yinton: "yin", inton: "yin",
            yang: "yang", youton: "yang",
            neutro: "neutro"
        };
        return aliases[texto] || texto;
    }
    function nivelNatureza(id) {
        return limitarNivel(estado === null || estado === void 0 ? void 0 : estado[id]);
    }
    function atributoConjuracaoSelecionado() {
        var id = String((estado === null || estado === void 0 ? void 0 : estado.atributoConjuracaoNatureza) || "").trim();
        return ATRIBUTO_POR_ID.has(id) ? id : "";
    }
    function valorAtributo(id) {
        var _a;
        if (!id)
            return null;
        var campo = document.querySelector("[data-save=\"".concat(id, "\"]"));
        var bruto = (_a = campo === null || campo === void 0 ? void 0 : campo.value) !== null && _a !== void 0 ? _a : estado === null || estado === void 0 ? void 0 : estado[id];
        var numero = Number(bruto);
        return Number.isFinite(numero) ? numero : null;
    }
    function calcularModificadorLocal(valor) {
        var numero = Number(valor);
        if (!Number.isFinite(numero))
            return null;
        if (typeof calcularModificador === "function") {
            var resultado = Number(calcularModificador(numero));
            return Number.isFinite(resultado) ? resultado : null;
        }
        return Math.floor((numero - 10) / 2);
    }
    function dadosConjuracao() {
        var atributoId = atributoConjuracaoSelecionado();
        var atributo = ATRIBUTO_POR_ID.get(atributoId) || ATRIBUTO_POR_ID.get("");
        var valor = valorAtributo(atributoId);
        var modificador = atributoId ? calcularModificadorLocal(valor) : null;
        return {
            atributoId: atributoId,
            atributoNome: (atributo === null || atributo === void 0 ? void 0 : atributo.nome) || "Conjuração",
            valor: valor,
            modificador: Number.isFinite(modificador) ? modificador : null
        };
    }
    function comSinal(valor) {
        var numero = numeroSeguro(valor, 0);
        return numero > 0 ? "+".concat(numero) : String(numero);
    }
    function valorNumericoEstrito(valor) {
        var texto = String(valor !== null && valor !== void 0 ? valor : "").trim().replace(",", ".");
        if (!/^[-+]?\d+(?:\.\d+)?$/.test(texto))
            return null;
        var numero = Number(texto);
        return Number.isFinite(numero) ? numero : null;
    }
    function elevarDadosDano(formula) {
        var regex = criarRegexDado();
        return String(formula !== null && formula !== void 0 ? formula : "").replace(regex, function (trecho, quantidadeTexto, _dUnitario, faces) {
            var proximo = PROXIMO_DADO.get(Number(faces));
            if (!proximo)
                return trecho;
            return "".concat(quantidadeTexto || "", "d").concat(proximo);
        });
    }
    function assinaturaDados(formula) {
        var dados = [];
        var texto = String(formula !== null && formula !== void 0 ? formula : "");
        var regex = criarRegexDado();
        var match;
        while ((match = regex.exec(texto)) !== null) {
            var dado = dadosDoMatch(match);
            dados.push("".concat(dado.quantidade, "d").concat(dado.faces));
        }
        return dados.join("|");
    }
    function contarDados(formula) {
        var total = 0;
        var texto = String(formula !== null && formula !== void 0 ? formula : "");
        var regex = criarRegexDado();
        var match;
        while ((match = regex.exec(texto)) !== null) {
            total += dadosDoMatch(match).quantidade;
        }
        return total;
    }
    function possuiDadoAprimoravel(formula) {
        return criarRegexDado().test(String(formula !== null && formula !== void 0 ? formula : ""));
    }
    function possuiDano(jutsu) {
        var _a;
        var texto = String((_a = jutsu === null || jutsu === void 0 ? void 0 : jutsu.dano) !== null && _a !== void 0 ? _a : "").trim();
        return Boolean(texto && texto !== "—");
    }
    function ehTecnicaKai(jutsu) {
        var _a;
        var nome = String((_a = jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome) !== null && _a !== void 0 ? _a : "").trim();
        return /(?:^|:)\s*Kai(?:\s|\(|$)/i.test(nome);
    }
    function persistirEstadoSeguro(contexto) {
        if (contexto === void 0) { contexto = {}; }
        try {
            if (typeof persistirEstadoLocal === "function")
                return persistirEstadoLocal(contexto);
            if (typeof window.persistirEstadoLocal === "function")
                return window.persistirEstadoLocal(contexto);
            if (typeof CHAVE !== "undefined") {
                localStorage.setItem(CHAVE, JSON.stringify(estado));
                return true;
            }
        }
        catch (erro) {
            console.warn("Não foi possível salvar as regras de Natureza.", erro);
        }
        return false;
    }
    function limparMarcadoresAntigos(jutsu) {
        delete jutsu.naturezaDadoNivel5Aplicado;
        delete jutsu.naturezaDadoNivel5Natureza;
        delete jutsu.naturezaDadoNivel5Versao;
        delete jutsu.naturezaDadoEntradaNivel5;
        delete jutsu.naturezaDadoSaidaNivel5;
    }
    function migrarMarcadorAntigo(jutsu, naturezaId) {
        var _a, _b;
        if (!(jutsu === null || jutsu === void 0 ? void 0 : jutsu.naturezaDadoNivel5Aplicado))
            return false;
        var antes = String((_a = jutsu.naturezaDadoAntesNivel5) !== null && _a !== void 0 ? _a : "").trim();
        var atual = String((_b = jutsu.dano) !== null && _b !== void 0 ? _b : "").trim();
        var esperado = antes && possuiDadoAprimoravel(antes)
            ? elevarDadosDano(antes)
            : "";
        if (antes && esperado && atual === esperado) {
            jutsu[META_NIVEL5] = {
                natureza: naturezaId,
                entrada: antes,
                saida: atual,
                assinaturaEntrada: assinaturaDados(antes),
                assinaturaSaida: assinaturaDados(atual),
                versao: VERSAO
            };
            limparMarcadoresAntigos(jutsu);
            delete jutsu.naturezaDadoAntesNivel5;
            return true;
        }
        /* O marcador antigo dizia que aplicou, mas o dano permaneceu igual à entrada. */
        if (antes && atual === antes) {
            limparMarcadoresAntigos(jutsu);
            delete jutsu.naturezaDadoAntesNivel5;
            return false;
        }
        /* Marcador incompleto ou incompatível: não pode bloquear o valor atual do card. */
        limparMarcadoresAntigos(jutsu);
        delete jutsu.naturezaDadoAntesNivel5;
        return false;
    }
    function nivel5JaAplicado(jutsu, naturezaId) {
        var _a, _b;
        var meta = jutsu === null || jutsu === void 0 ? void 0 : jutsu[META_NIVEL5];
        if (!meta || typeof meta !== "object")
            return false;
        if (normalizarElemento(meta.natureza) !== naturezaId)
            return false;
        var atual = String((_a = jutsu.dano) !== null && _a !== void 0 ? _a : "").trim();
        return atual === String((_b = meta.saida) !== null && _b !== void 0 ? _b : "").trim();
    }
    function aplicarNivel5AoJutsu(jutsu, naturezaId) {
        var _a;
        if (!jutsu || !NATUREZA_POR_ID.has(naturezaId))
            return false;
        if (normalizarElemento(jutsu.elemento) !== naturezaId)
            return false;
        if (nivelNatureza(naturezaId) < 5)
            return false;
        if (migrarMarcadorAntigo(jutsu, naturezaId))
            return true;
        if (nivel5JaAplicado(jutsu, naturezaId))
            return false;
        var danoAtual = String((_a = jutsu.dano) !== null && _a !== void 0 ? _a : "").trim();
        if (!possuiDadoAprimoravel(danoAtual))
            return false;
        var danoElevado = elevarDadosDano(danoAtual);
        jutsu.dano = danoElevado;
        jutsu[META_NIVEL5] = {
            natureza: naturezaId,
            entrada: danoAtual,
            saida: danoElevado,
            assinaturaEntrada: assinaturaDados(danoAtual),
            assinaturaSaida: assinaturaDados(danoElevado),
            versao: VERSAO
        };
        limparMarcadoresAntigos(jutsu);
        delete jutsu.naturezaDadoAntesNivel5;
        return true;
    }
    function aplicarNivel5NaNatureza(naturezaId, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.persistir, persistir = _c === void 0 ? true : _c;
        if (!NATUREZA_POR_ID.has(naturezaId) || nivelNatureza(naturezaId) < 5)
            return 0;
        var alterados = 0;
        (Array.isArray(estado === null || estado === void 0 ? void 0 : estado.jutsus) ? estado.jutsus : []).forEach(function (jutsu) {
            if (aplicarNivel5AoJutsu(jutsu, naturezaId))
                alterados += 1;
        });
        if (alterados && persistir)
            persistirEstadoSeguro();
        return alterados;
    }
    function aplicarNiveis5Pendentes(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.persistir, persistir = _c === void 0 ? true : _c;
        var alterados = 0;
        NATUREZAS.forEach(function (natureza) {
            if (nivelNatureza(natureza.id) >= 5) {
                alterados += aplicarNivel5NaNatureza(natureza.id, { persistir: false });
            }
        });
        if (alterados && persistir)
            persistirEstadoSeguro();
        return alterados;
    }
    function calcularJutsuComNatureza(jutsu) {
        var _a, _b, _c;
        var elemento = normalizarElemento(jutsu === null || jutsu === void 0 ? void 0 : jutsu.elemento);
        var natureza = NATUREZA_POR_ID.get(elemento) || null;
        var nivel = natureza ? nivelNatureza(elemento) : 0;
        var conjuracao = dadosConjuracao();
        var danoEfetivo = String((_a = jutsu === null || jutsu === void 0 ? void 0 : jutsu.dano) !== null && _a !== void 0 ? _a : "").trim();
        var quantidadeDados = contarDados(danoEfetivo);
        var temDano = possuiDano(jutsu);
        var bonusNivel2 = 0;
        var bonusNivel6 = 0;
        var motivos = [];
        if (natureza && temDano && conjuracao.modificador !== null) {
            if (nivel >= 2) {
                bonusNivel2 = conjuracao.modificador;
                motivos.push("N2 ".concat(comSinal(bonusNivel2)));
            }
            /* Os benefícios são cumulativos: o nível 6 soma ao nível 2. */
            if (nivel >= 6 && quantidadeDados > 0) {
                bonusNivel6 = conjuracao.modificador * quantidadeDados;
                motivos.push("N6 ".concat(quantidadeDados, " dado").concat(quantidadeDados === 1 ? "" : "s", " \u00D7 ").concat(comSinal(conjuracao.modificador)));
            }
        }
        var bonusNatureza = bonusNivel2 + bonusNivel6;
        var bonusManualTexto = String((_b = jutsu === null || jutsu === void 0 ? void 0 : jutsu.bonusDano) !== null && _b !== void 0 ? _b : "").trim();
        var bonusManualNumero = valorNumericoEstrito(bonusManualTexto);
        var bonusTotalNumero = bonusManualNumero === null
            ? null
            : bonusManualNumero + bonusNatureza;
        var custoBaseTexto = String((_c = jutsu === null || jutsu === void 0 ? void 0 : jutsu.custo) !== null && _c !== void 0 ? _c : "").trim();
        var kaiSemCusto = Boolean(natureza && nivel >= 4 && ehTecnicaKai(jutsu));
        var metaNivel5 = (jutsu === null || jutsu === void 0 ? void 0 : jutsu[META_NIVEL5]) && typeof jutsu[META_NIVEL5] === "object"
            ? jutsu[META_NIVEL5]
            : null;
        return {
            natureza: natureza,
            elemento: elemento,
            nivel: nivel,
            conjuracao: conjuracao,
            danoEfetivo: danoEfetivo,
            quantidadeDados: quantidadeDados,
            bonusNivel2: bonusNivel2,
            bonusNivel6: bonusNivel6,
            bonusNatureza: bonusNatureza,
            motivoBonus: motivos.join(" + "),
            bonusManualTexto: bonusManualTexto,
            bonusManualNumero: bonusManualNumero,
            bonusTotalNumero: bonusTotalNumero,
            custoBaseTexto: custoBaseTexto,
            custoEfetivoTexto: kaiSemCusto ? "0" : custoBaseTexto,
            kaiSemCusto: kaiSemCusto,
            dadoElevado: Boolean(metaNivel5),
            metaNivel5: metaNivel5,
            resistenciaAutomatica: Boolean(natureza && nivel >= 3),
            imunidadeAutomatica: Boolean(natureza && nivel >= 7)
        };
    }
    function formatarBonusTotal(regra) {
        if (regra.bonusTotalNumero !== null)
            return comSinal(regra.bonusTotalNumero);
        if (regra.bonusManualTexto && regra.bonusNatureza) {
            return "".concat(regra.bonusManualTexto, " \u00B7 autom\u00E1tico ").concat(comSinal(regra.bonusNatureza));
        }
        if (regra.bonusManualTexto)
            return regra.bonusManualTexto;
        if (regra.bonusNatureza)
            return comSinal(regra.bonusNatureza);
        return "—";
    }
    function formatarDanoTotal(regra) {
        var dano = regra.danoEfetivo || "";
        var bonus = formatarBonusTotal(regra);
        if (!dano)
            return bonus;
        if (bonus === "—" || bonus === "0")
            return dano;
        if (regra.bonusTotalNumero !== null) {
            return "".concat(dano, " ").concat(regra.bonusTotalNumero >= 0 ? "+" : "-", " ").concat(Math.abs(regra.bonusTotalNumero));
        }
        if (regra.bonusManualTexto && regra.bonusNatureza) {
            return "".concat(dano, " + ").concat(regra.bonusManualTexto, " ").concat(regra.bonusNatureza >= 0 ? "+" : "-", " ").concat(Math.abs(regra.bonusNatureza));
        }
        if (regra.bonusNatureza) {
            return "".concat(dano, " ").concat(regra.bonusNatureza >= 0 ? "+" : "-", " ").concat(Math.abs(regra.bonusNatureza));
        }
        return "".concat(dano, " + ").concat(regra.bonusManualTexto);
    }
    function garantirPainelConjuracao() {
        var container = document.querySelector(".naturezasNoPerfil");
        var lista = document.getElementById("naturezasUI");
        if (!container || !lista)
            return null;
        var painel = document.getElementById("configConjuracaoNatureza");
        if (!painel) {
            painel = document.createElement("div");
            painel.id = "configConjuracaoNatureza";
            painel.className = "configConjuracaoNatureza";
            container.insertBefore(painel, lista);
        }
        return painel;
    }
    function renderizarPainelConjuracao() {
        var _a;
        var painel = garantirPainelConjuracao();
        if (!painel)
            return;
        var conjuracao = dadosConjuracao();
        var opcoes = ATRIBUTOS.map(function (atributo) { return "\n      <option value=\"".concat(atributo.id, "\" ").concat(atributo.id === conjuracao.atributoId ? "selected" : "", ">\n        ").concat(atributo.nome, "\n      </option>\n    "); }).join("");
        painel.innerHTML = "\n      <label for=\"atributoConjuracaoNatureza\">Atributo de Conjura\u00E7\u00E3o</label>\n      <select id=\"atributoConjuracaoNatureza\">".concat(opcoes, "</select>\n      <button type=\"button\" class=\"conjuracaoBeneficiosToggle ").concat(beneficiosNaturezaAberto ? "aberto" : "", "\" aria-expanded=\"").concat(beneficiosNaturezaAberto ? "true" : "false", "\" aria-controls=\"naturezaBeneficiosPainel\" aria-label=\"Mostrar benef\u00EDcios cumulativos dos n\u00EDveis\" title=\"Benef\u00EDcios cumulativos dos n\u00EDveis\">\n        <span class=\"conjuracaoBeneficiosSeta\" aria-hidden=\"true\"></span>\n      </button>\n      <div id=\"naturezaBeneficiosPainel\" class=\"naturezaBeneficiosPainel ").concat(beneficiosNaturezaAberto ? "aberto" : "", "\" ").concat(beneficiosNaturezaAberto ? "" : "hidden", ">\n        <div class=\"naturezaBeneficiosCabecalho\">\n          <strong>Benef\u00EDcios cumulativos dos n\u00EDveis</strong>\n        </div>\n        <ol>\n          ").concat(Object.entries(BENEFICIOS).map(function (_a) {
            var _b = __read(_a, 2), nivel = _b[0], texto = _b[1];
            return "<li><b>N\u00EDvel ".concat(nivel, ":</b> ").concat(texto, ".</li>");
        }).join(""), "\n        </ol>\n      </div>\n    ");
        (_a = painel.querySelector("#atributoConjuracaoNatureza")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", function (evento) {
            definirAtributoConjuracaoNaturezaComRegras(evento.target.value);
        });
        var toggle = painel.querySelector('.conjuracaoBeneficiosToggle');
        var beneficios = painel.querySelector('#naturezaBeneficiosPainel');
        var sincronizarBeneficios = function () {
            var aberto = !!beneficiosNaturezaAberto;
            if (toggle) {
                toggle.classList.toggle('aberto', aberto);
                toggle.setAttribute('aria-expanded', String(aberto));
            }
            if (beneficios) {
                beneficios.hidden = !aberto;
                beneficios.classList.toggle('aberto', aberto);
            }
        };
        toggle === null || toggle === void 0 ? void 0 : toggle.addEventListener('click', function () {
            beneficiosNaturezaAberto = !beneficiosNaturezaAberto;
            sincronizarBeneficios();
        });
        sincronizarBeneficios();
    }
    function renderizarNaturezasComRegras() {
        if (renderizandoNaturezas)
            return;
        renderizandoNaturezas = true;
        try {
            renderizarPainelConjuracao();
            var box = document.getElementById("naturezasUI");
            if (!box)
                return;
            box.innerHTML = NATUREZAS.map(function (natureza) {
                var nivelAtual = nivelNatureza(natureza.id);
                var niveis = Array.from({ length: 7 }, function (_, indice) {
                    var nivel = indice + 1;
                    return "\n            <button type=\"button\" class=\"naturezaNivel\" onclick=\"definirNatureza('".concat(natureza.id, "',").concat(nivel, ")\" aria-label=\"").concat(natureza.nome, " n\u00EDvel ").concat(nivel, "\">\n              <span class=\"naturezaBolinha ").concat(nivel <= nivelAtual ? "ativa" : "", "\"></span>\n              <small>").concat(nivel, "</small>\n            </button>\n          ");
                }).join("");
                return "\n          <article class=\"naturezaCard ".concat(natureza.classe, "\">\n            <span class=\"naturezaInfo\">\n              <span class=\"naturezaIcone\">").concat(natureza.icone, "</span>\n              <span class=\"naturezaIdentificacao\">\n                <span class=\"naturezaNome\">").concat(natureza.nome, "</span>\n              </span>\n            </span>\n            <span class=\"naturezaLinha naturezaLinhaSete\">").concat(niveis, "</span>\n          </article>\n        ");
            }).join("");
        }
        finally {
            renderizandoNaturezas = false;
        }
    }
    function preencherBotaoResumo(botao, rotulo, principal, detalhe) {
        if (detalhe === void 0) { detalhe = ""; }
        if (!botao)
            return;
        var titulo = document.createElement("b");
        titulo.textContent = rotulo;
        var valor = document.createElement("span");
        valor.className = "jutsuValorRegraNatureza";
        valor.textContent = principal || "—";
        botao.replaceChildren(titulo, valor);
        if (detalhe) {
            var observacao = document.createElement("small");
            observacao.className = "jutsuDetalheRegraNatureza";
            observacao.textContent = detalhe;
            botao.appendChild(observacao);
        }
    }
    function botaoResumoPorRotulo(card, rotulo) {
        return Array.from(card.querySelectorAll(".jutsuResumo button"))
            .find(function (botao) { var _a; return ((_a = botao.querySelector("b")) === null || _a === void 0 ? void 0 : _a.textContent.trim()) === rotulo; });
    }
    function aplicarRegrasNosCards() {
        var cards = Array.from(document.querySelectorAll("#listaJutsus .jutsuCard"));
        cards.forEach(function (card, indice) {
            var _a;
            var jutsu = (_a = estado === null || estado === void 0 ? void 0 : estado.jutsus) === null || _a === void 0 ? void 0 : _a[indice];
            if (!jutsu)
                return;
            var regra = calcularJutsuComNatureza(jutsu);
            var custo = regra.custoEfetivoTexto || "0";
            var rank = String(jutsu.rank || "Rank").trim() || "Rank";
            var dadosElemento = typeof dadosElementoJutsu === "function"
                ? dadosElementoJutsu(jutsu.elemento || "neutro")
                : { nome: String(jutsu.elemento || "NEUTRO").toUpperCase() };
            var resumoLinha = card.querySelector(".jutsuLinhaTexto small");
            if (resumoLinha)
                resumoLinha.textContent = "".concat(dadosElemento.nome, " \u2022 ").concat(rank, " \u2022 ").concat(custo, " CH");
            var custoPill = card.querySelector(".jutsuCustoPill");
            if (custoPill) {
                custoPill.textContent = "".concat(custo, " CH");
                custoPill.classList.toggle("jutsuCustoAutomatico", regra.kaiSemCusto);
                custoPill.title = regra.kaiSemCusto
                    ? "Custo base: ".concat(regra.custoBaseTexto || "0", ". Zerado pelo n\u00EDvel 4.")
                    : "Editar custo de Chakra";
            }
            var detalheDano = regra.metaNivel5
                ? "N5 aplicado: ".concat(regra.metaNivel5.entrada, " \u2192 ").concat(regra.metaNivel5.saida)
                : regra.natureza && regra.nivel >= 5
                    ? "N5 aguardando uma fórmula de dado no campo Dano"
                    : "";
            preencherBotaoResumo(botaoResumoPorRotulo(card, "Dano"), "Dano", regra.danoEfetivo || "—", detalheDano);
            var partesBonus = [];
            if (regra.bonusManualTexto)
                partesBonus.push("Manual ".concat(regra.bonusManualTexto));
            if (regra.bonusNivel2)
                partesBonus.push("N2 ".concat(comSinal(regra.bonusNivel2)));
            if (regra.bonusNivel6 || (regra.nivel >= 6 && regra.quantidadeDados > 0)) {
                partesBonus.push("N6 ".concat(comSinal(regra.bonusNivel6), " (").concat(regra.quantidadeDados, " dados)"));
            }
            var detalheBonus = partesBonus.length
                ? partesBonus.join(" · ")
                : regra.conjuracao.atributoId
                    ? "Sem bônus automático neste nível"
                    : "Escolha o atributo de Conjuração nas Naturezas";
            preencherBotaoResumo(botaoResumoPorRotulo(card, "Bônus dano"), "Bônus dano", formatarBonusTotal(regra), detalheBonus);
            preencherBotaoResumo(botaoResumoPorRotulo(card, "Dano total"), "Dano total", formatarDanoTotal(regra), regra.natureza && regra.nivel >= 2
                ? "".concat(regra.natureza.nome, " N").concat(regra.nivel, " \u00B7 benef\u00EDcios N1\u2013N").concat(regra.nivel, " ativos")
                : "");
            card.classList.toggle("jutsuComBeneficioNatureza", Boolean(regra.natureza && regra.nivel >= 2));
        });
    }
    function idsResistenciasAutomaticas() {
        var resistencias = new Map();
        var imunidades = new Map();
        NATUREZAS.forEach(function (natureza) {
            var nivel = nivelNatureza(natureza.id);
            if (nivel >= 3)
                resistencias.set(natureza.resistenciaId, natureza);
            if (nivel >= 7)
                imunidades.set(natureza.resistenciaId, natureza);
        });
        return { resistencias: resistencias, imunidades: imunidades };
    }
    function criarChipAutomatico(natureza, tipo) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = tipo === "imunidade"
            ? "resistenciaChipResumo resistenciaNaturezaAuto imunidadeNaturezaAuto"
            : "resistenciaChipResumo resistenciaNaturezaAuto";
        chip.textContent = tipo === "imunidade"
            ? "".concat(natureza.icone, " Imune: ").concat(natureza.nome)
            : "".concat(natureza.icone, " ").concat(natureza.nome, " \u00B7 Resist\u00EAncia");
        chip.title = tipo === "imunidade"
            ? "Imunidade automática do nível 7. A resistência do nível 3 continua ativa."
            : "Resistência automática do nível 3.";
        chip.addEventListener("click", function () { return mostrarBeneficioAutomaticoNatureza(tipo, natureza.id); });
        return chip;
    }
    function aplicarRegrasNasResistencias() {
        var painel = document.getElementById("resistenciasBatalhaPainel");
        if (!painel)
            return;
        painel.querySelectorAll(".resistenciaNaturezaAuto").forEach(function (chip) { return chip.remove(); });
        var _a = idsResistenciasAutomaticas(), resistencias = _a.resistencias, imunidades = _a.imunidades;
        var resumoGrid = painel.querySelector(".resistenciasAtivasGrid") || (function () {
            var vazio = painel.querySelector(".resistenciaVazia");
            if (!vazio)
                return null;
            var grid = document.createElement("div");
            grid.className = "resistenciasAtivasGrid";
            vazio.replaceWith(grid);
            return grid;
        })();
        resistencias.forEach(function (natureza) { return resumoGrid === null || resumoGrid === void 0 ? void 0 : resumoGrid.appendChild(criarChipAutomatico(natureza, "resistencia")); });
        imunidades.forEach(function (natureza) { return resumoGrid === null || resumoGrid === void 0 ? void 0 : resumoGrid.appendChild(criarChipAutomatico(natureza, "imunidade")); });
        painel.querySelectorAll(".resistenciaChip").forEach(function (botao) {
            var onclick = botao.getAttribute("onclick") || "";
            var match = onclick.match(/toggleResistenciaBatalha\(['\"]([^'\"]+)['\"]\)/);
            var id = match === null || match === void 0 ? void 0 : match[1];
            if (!id || !resistencias.has(id))
                return;
            var imunidade = imunidades.has(id);
            botao.classList.add("ativo", "resistenciaNaturezaBloqueada");
            botao.classList.toggle("imunidadeNaturezaBloqueada", imunidade);
            botao.title = imunidade
                ? "Resistência N3 e imunidade N7 ativas."
                : "Resistência automática do nível 3.";
        });
    }
    function agendarAtualizacaoCompleta() {
        if (frameAtualizacao !== null)
            return;
        frameAtualizacao = requestAnimationFrame(function () {
            frameAtualizacao = null;
            renderizarNaturezasComRegras();
            renderizarJutsusComRegras();
            renderizarResistenciasComRegras();
        });
    }
    function definirAtributoConjuracaoNaturezaComRegras(atributoId) {
        return __awaiter(this, void 0, void 0, function () {
            var id, novo, atual, rotuloNovo, rotuloAtual, confirmado, _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        id = String(atributoId || "").trim();
                        novo = ATRIBUTO_POR_ID.has(id) ? id : "";
                        atual = String(estado.atributoConjuracaoNatureza || "");
                        if (novo === atual)
                            return [2 /*return*/];
                        rotuloNovo = ((_b = ATRIBUTO_POR_ID.get(novo)) === null || _b === void 0 ? void 0 : _b.nome) || novo || "Automático";
                        rotuloAtual = ((_c = ATRIBUTO_POR_ID.get(atual)) === null || _c === void 0 ? void 0 : _c.nome) || atual || "Automático";
                        if (!(typeof modalShinobi === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, modalShinobi("Confirmar alteração?", "Atributo de conjura\u00E7\u00E3o: ".concat(rotuloAtual, " \u2192 ").concat(rotuloNovo))];
                    case 1:
                        _a = _d.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = confirm("Atributo de conjura\u00E7\u00E3o: ".concat(rotuloAtual, " \u2192 ").concat(rotuloNovo));
                        _d.label = 3;
                    case 3:
                        confirmado = _a;
                        if (!confirmado)
                            return [2 /*return*/];
                        estado.atributoConjuracaoNatureza = novo;
                        persistirEstadoSeguro({ confirmada: true, origem: "natureza", campo: "atributoConjuracaoNatureza", motivo: "alteracao-confirmada" });
                        agendarAtualizacaoCompleta();
                        return [2 /*return*/];
                }
            });
        });
    }
    function definirNaturezaComRegras(id, nivel) {
        return __awaiter(this, void 0, void 0, function () {
            var nivelClicado, nivelAtual, nivelFinal, natureza, confirmado, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!NATUREZA_POR_ID.has(id))
                            return [2 /*return*/];
                        nivelClicado = limitarNivel(nivel);
                        nivelAtual = nivelNatureza(id);
                        nivelFinal = nivelAtual === nivelClicado ? 0 : nivelClicado;
                        if (nivelFinal === nivelAtual)
                            return [2 /*return*/];
                        natureza = NATUREZA_POR_ID.get(id);
                        if (!(typeof modalShinobi === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, modalShinobi("Confirmar alteração?", "".concat((natureza === null || natureza === void 0 ? void 0 : natureza.nome) || id, ": n\u00EDvel ").concat(nivelAtual, " \u2192 ").concat(nivelFinal))];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = confirm("".concat((natureza === null || natureza === void 0 ? void 0 : natureza.nome) || id, ": n\u00EDvel ").concat(nivelAtual, " \u2192 ").concat(nivelFinal));
                        _b.label = 3;
                    case 3:
                        confirmado = _a;
                        if (!confirmado)
                            return [2 /*return*/];
                        estado[id] = nivelFinal;
                        if (nivelFinal >= 5)
                            aplicarNivel5NaNatureza(id, { persistir: false });
                        persistirEstadoSeguro({ confirmada: true, origem: "natureza", campos: [id, "jutsus"], motivo: "alteracao-confirmada" });
                        agendarAtualizacaoCompleta();
                        return [2 /*return*/];
                }
            });
        });
    }
    function mostrarBeneficioAutomaticoNatureza(tipo, naturezaId) {
        return __awaiter(this, void 0, void 0, function () {
            var natureza, titulo, mensagem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        natureza = NATUREZA_POR_ID.get(naturezaId);
                        if (!natureza)
                            return [2 /*return*/];
                        titulo = tipo === "imunidade" ? "Imunidade automática" : "Resistência automática";
                        mensagem = tipo === "imunidade"
                            ? "".concat(natureza.nome, ": resist\u00EAncia do n\u00EDvel 3 e imunidade do n\u00EDvel 7 est\u00E3o ativas.")
                            : "".concat(natureza.nome, ": resist\u00EAncia autom\u00E1tica concedida pelo n\u00EDvel 3.");
                        if (!(typeof avisoShinobi === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, avisoShinobi(titulo, mensagem)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        alert("".concat(titulo, "\n\n").concat(mensagem));
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    var renderizarJutsusBase = typeof window.renderizarJutsus === "function"
        ? window.renderizarJutsus
        : null;
    function renderizarJutsusComRegras() {
        if (!renderizarJutsusBase)
            return;
        if (renderizandoJutsus)
            return renderizarJutsusBase.apply(this, arguments);
        renderizandoJutsus = true;
        try {
            aplicarNiveis5Pendentes({ persistir: true });
            var resultado = renderizarJutsusBase.apply(this, arguments);
            aplicarRegrasNosCards();
            return resultado;
        }
        finally {
            renderizandoJutsus = false;
        }
    }
    var renderizarResistenciasBase = typeof window.renderizarResistenciasBatalha === "function"
        ? window.renderizarResistenciasBatalha
        : null;
    function renderizarResistenciasComRegras() {
        if (!renderizarResistenciasBase)
            return;
        if (renderizandoResistencias)
            return renderizarResistenciasBase.apply(this, arguments);
        renderizandoResistencias = true;
        try {
            var resultado = renderizarResistenciasBase.apply(this, arguments);
            aplicarRegrasNasResistencias();
            return resultado;
        }
        finally {
            renderizandoResistencias = false;
        }
    }
    var toggleResistenciaBase = typeof window.toggleResistenciaBatalha === "function"
        ? window.toggleResistenciaBatalha
        : null;
    function toggleResistenciaComRegras(id) {
        var _a = idsResistenciasAutomaticas(), resistencias = _a.resistencias, imunidades = _a.imunidades;
        var natureza = resistencias.get(id) || imunidades.get(id);
        if (natureza) {
            mostrarBeneficioAutomaticoNatureza(imunidades.has(id) ? "imunidade" : "resistencia", natureza.id);
            return;
        }
        return toggleResistenciaBase === null || toggleResistenciaBase === void 0 ? void 0 : toggleResistenciaBase.apply(this, arguments);
    }
    function usarJutsuComRegras(indice) {
        return __awaiter(this, void 0, void 0, function () {
            var jutsu, regra, custoTexto, custoNumero, chakra, chakraAtual, dadosElemento, nome, danoTotal, detalhe, confirmado, _a, mensagem, danoLog, custoLog;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        aplicarNiveis5Pendentes({ persistir: true });
                        jutsu = (_b = estado === null || estado === void 0 ? void 0 : estado.jutsus) === null || _b === void 0 ? void 0 : _b[indice];
                        if (!jutsu)
                            return [2 /*return*/];
                        regra = calcularJutsuComNatureza(jutsu);
                        custoTexto = regra.custoEfetivoTexto || "0";
                        custoNumero = valorNumericoEstrito(custoTexto);
                        chakra = document.getElementById("chakra");
                        chakraAtual = numeroSeguro(chakra === null || chakra === void 0 ? void 0 : chakra.value, 0);
                        dadosElemento = typeof dadosElementoJutsu === "function"
                            ? dadosElementoJutsu(jutsu.elemento || "neutro")
                            : { icone: "✨", nome: "NEUTRO" };
                        nome = jutsu.nome || "Jutsu sem nome";
                        danoTotal = formatarDanoTotal(regra);
                        detalhe = [
                            "".concat(dadosElemento.icone, " ").concat(dadosElemento.nome),
                            custoNumero !== null
                                ? custoNumero > 0
                                    ? "Custo de chakra: ".concat(custoNumero)
                                    : regra.kaiSemCusto
                                        ? "Custo de chakra: 0 (benefício N4)"
                                        : "Sem custo de chakra"
                                : "Custo vari\u00E1vel: ".concat(custoTexto),
                            danoTotal && danoTotal !== "—" ? "Dano total: ".concat(danoTotal) : "",
                            regra.bonusNivel2 ? "N2: ".concat(comSinal(regra.bonusNivel2)) : "",
                            regra.bonusNivel6 ? "N6: ".concat(comSinal(regra.bonusNivel6), " (").concat(regra.quantidadeDados, " dados)") : ""
                        ].filter(Boolean).join("\n");
                        if (!(typeof confirmarUsoAcao === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, confirmarUsoAcao("jutsu", nome, detalhe)];
                    case 1:
                        _a = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = confirm("".concat(nome, "\n\n").concat(detalhe, "\n\nUsar este jutsu?"));
                        _c.label = 3;
                    case 3:
                        confirmado = _a;
                        if (!confirmado)
                            return [2 /*return*/];
                        if (!(custoNumero !== null && custoNumero > chakraAtual)) return [3 /*break*/, 7];
                        mensagem = "Voc\u00EA tem ".concat(chakraAtual, " de chakra.\nEste jutsu precisa de ").concat(custoNumero, ".");
                        if (!(typeof avisoShinobi === "function")) return [3 /*break*/, 5];
                        return [4 /*yield*/, avisoShinobi("Chakra insuficiente", mensagem)];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        alert(mensagem);
                        _c.label = 6;
                    case 6: return [2 /*return*/];
                    case 7:
                        if (chakra && custoNumero !== null) {
                            chakra.value = Math.max(0, chakraAtual - Math.max(0, custoNumero));
                        }
                        if (typeof salvar === "function")
                            salvar({ confirmada: true, origem: "jutsu", campo: "chakra", antes: chakraAtual, depois: chakra ? Number(chakra.value) : chakraAtual, motivo: "alteracao-confirmada" });
                        else
                            persistirEstadoSeguro({ confirmada: true, origem: "jutsu", campo: "chakra", motivo: "alteracao-confirmada" });
                        danoLog = danoTotal && danoTotal !== "—" ? " | Dano: ".concat(danoTotal) : "";
                        custoLog = custoNumero !== null && custoNumero > 0 ? " | Chakra: -".concat(custoNumero) : "";
                        if (typeof log === "function")
                            log("".concat(dadosElemento.icone, " Usou ").concat(nome).concat(danoLog).concat(custoLog));
                        if (!(typeof window.aplicarEfeitosJutsuBatalha === "function")) return [3 /*break*/, 9];
                        return [4 /*yield*/, window.aplicarEfeitosJutsuBatalha(jutsu, indice)];
                    case 8:
                        _c.sent();
                        _c.label = 9;
                    case 9:
                        if (typeof atualizarHUD === "function")
                            atualizarHUD();
                        if (typeof window.atualizarDefesasTotaisBatalha === "function")
                            window.atualizarDefesasTotaisBatalha();
                        /*
                         * Confirma visualmente a execução: depois que o jutsu foi usado com
                         * sucesso, fecha somente a carta acionada e devolve a lista ao estado
                         * compacto. Não fecha a carta quando a confirmação é cancelada ou quando
                         * não há chakra suficiente.
                         */
                        estado.jutsusAbertos = estado.jutsusAbertos || {};
                        delete estado.jutsusAbertos[indice];
                        if (typeof persistirSemRender === "function")
                            persistirSemRender();
                        else
                            persistirEstadoSeguro();
                        if (typeof renderizarJutsus === "function")
                            renderizarJutsus();
                        return [2 /*return*/];
                }
            });
        });
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
    try {
        definirNatureza = definirNaturezaComRegras;
    }
    catch (_erro) { }
    try {
        renderizarNaturezas = renderizarNaturezasComRegras;
    }
    catch (_erro) { }
    try {
        renderizarJutsus = renderizarJutsusComRegras;
    }
    catch (_erro) { }
    try {
        usarJutsu = usarJutsuComRegras;
    }
    catch (_erro) { }
    window.RegrasNaturezaShinobi = {
        versao: VERSAO,
        nivelNatureza: nivelNatureza,
        dadosConjuracao: dadosConjuracao,
        elevarDadosDano: elevarDadosDano,
        contarDados: contarDados,
        calcularJutsu: calcularJutsuComNatureza,
        formatarBonusTotal: formatarBonusTotal,
        formatarDanoTotal: formatarDanoTotal,
        aplicarNivel5NaNatureza: aplicarNivel5NaNatureza,
        aplicarNiveis5Pendentes: aplicarNiveis5Pendentes,
        idsResistenciasAutomaticas: idsResistenciasAutomaticas
    };
    document.addEventListener("input", function (evento) {
        var _a;
        if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches('[data-save="forca"], [data-save="destreza"], [data-save="constituicao"], [data-save="inteligencia"], [data-save="sabedoria"], [data-save="carisma"]')) {
            agendarAtualizacaoCompleta();
        }
    });
    document.addEventListener("change", function (evento) {
        var _a;
        if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches('[data-save="forca"], [data-save="destreza"], [data-save="constituicao"], [data-save="inteligencia"], [data-save="sabedoria"], [data-save="carisma"]')) {
            agendarAtualizacaoCompleta();
        }
    });
    function iniciar() {
        aplicarNiveis5Pendentes({ persistir: true });
        renderizarNaturezasComRegras();
        renderizarJutsusComRegras();
        renderizarResistenciasComRegras();
    }
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    else
        iniciar();
    window.addEventListener("pageshow", iniciar);
})();
