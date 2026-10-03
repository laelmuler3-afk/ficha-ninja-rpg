/* GERADO AUTOMATICAMENTE — fonte: js/17-dano-inteligente.js — app 2.5.8.154. Não editar. */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
/* Ficha Ninja 2.1.8 — aplicação inteligente de dano. */
(function () {
    "use strict";
    if (window.__danoInteligenteV218)
        return;
    window.__danoInteligenteV218 = true;
    var TIPOS = [
        { id: "fisico", nome: "Físico", icone: "⚔️" },
        { id: "taijutsu", nome: "Taijutsu", icone: "👊" },
        { id: "katon", nome: "Katon", icone: "🔥" },
        { id: "raiton", nome: "Raiton", icone: "⚡" },
        { id: "fuuton", nome: "Fuuton", icone: "🌪️" },
        { id: "suiton", nome: "Suiton", icone: "💧" },
        { id: "doton", nome: "Doton", icone: "🪨" },
        { id: "mokuton", nome: "Mokuton", icone: "🌱" },
        { id: "youton", nome: "Youton", icone: "☀️" },
        { id: "shoton", nome: "Shoton", icone: "💎" },
        { id: "neutro", nome: "Neutro", icone: "✨" },
        { id: "genjutsu", nome: "Genjutsu", icone: "👁️" },
        { id: "veneno", nome: "Veneno", icone: "☠️" },
        { id: "selamento", nome: "Selamento", icone: "🔒" },
        { id: "sangramento", nome: "Sangramento", icone: "🩸" },
        { id: "atordoamento", nome: "Atordoamento", icone: "😵" },
        { id: "eletrica", nome: "Elétrica", icone: "⚡" },
        { id: "outro", nome: "Outro / sem redução automática", icone: "◈" }
    ];
    var TIPO_POR_ID = new Map(TIPOS.map(function (tipo) { return [tipo.id, tipo]; }));
    function numeroInteiro(valor) {
        var numero = Number(String(valor !== null && valor !== void 0 ? valor : "").replace(",", "."));
        return Number.isFinite(numero) ? Math.max(0, Math.floor(numero)) : 0;
    }
    function campo(id) {
        return document.getElementById(id);
    }
    function obterResistenciasManuais() {
        try {
            var salvas = typeof estado !== "undefined" ? estado === null || estado === void 0 ? void 0 : estado.resistenciasEscolhidas : null;
            return salvas && typeof salvas === "object" && !Array.isArray(salvas) ? salvas : {};
        }
        catch (_erro) {
            return {};
        }
    }
    function obterProtecoesAutomaticas() {
        try {
            var api = window.RegrasNaturezaShinobi;
            if (typeof (api === null || api === void 0 ? void 0 : api.idsResistenciasAutomaticas) !== "function") {
                return { resistencias: new Map(), imunidades: new Map() };
            }
            var resultado = api.idsResistenciasAutomaticas();
            return {
                resistencias: (resultado === null || resultado === void 0 ? void 0 : resultado.resistencias) instanceof Map ? resultado.resistencias : new Map(),
                imunidades: (resultado === null || resultado === void 0 ? void 0 : resultado.imunidades) instanceof Map ? resultado.imunidades : new Map()
            };
        }
        catch (erro) {
            console.warn("Não foi possível consultar as proteções automáticas.", erro);
            return { resistencias: new Map(), imunidades: new Map() };
        }
    }
    function calcularDanoInteligente(_a) {
        var danoBruto = _a.danoBruto, tipoId = _a.tipoId, _b = _a.ignorarReducao, ignorarReducao = _b === void 0 ? false : _b;
        var bruto = numeroInteiro(danoBruto);
        var tipo = TIPO_POR_ID.get(tipoId) || TIPO_POR_ID.get("outro");
        var manuais = obterResistenciasManuais();
        var automaticas = obterProtecoesAutomaticas();
        var temImunidade = tipo.id !== "outro" && automaticas.imunidades.has(tipo.id);
        var temResistenciaManual = tipo.id !== "outro" && Boolean(manuais[tipo.id]);
        var temResistenciaAutomatica = tipo.id !== "outro" && automaticas.resistencias.has(tipo.id);
        var temResistencia = temResistenciaManual || temResistenciaAutomatica;
        var danoFinal = bruto;
        var regra = "normal";
        var explicacao = "Nenhuma resistência identificada.";
        if (ignorarReducao) {
            regra = "ignorado";
            explicacao = "A redução foi ignorada por decisão do mestre.";
        }
        else if (temImunidade) {
            danoFinal = 0;
            regra = "imunidade";
            explicacao = "Imunidade a ".concat(tipo.nome, " identificada.");
        }
        else if (temResistencia) {
            danoFinal = Math.floor(bruto / 2);
            regra = "resistencia";
            explicacao = "Resist\u00EAncia a ".concat(tipo.nome, " identificada: metade do dano.");
        }
        else if (tipo.id === "outro") {
            explicacao = "Tipo sem redução automática.";
        }
        return {
            bruto: bruto,
            danoFinal: danoFinal,
            tipo: tipo,
            regra: regra,
            explicacao: explicacao,
            temImunidade: temImunidade,
            temResistencia: temResistencia,
            origemResistencia: temResistenciaManual && temResistenciaAutomatica
                ? "manual e automática"
                : temResistenciaAutomatica
                    ? "automática"
                    : temResistenciaManual
                        ? "manual"
                        : ""
        };
    }
    function classeResultado(regra) {
        if (regra === "imunidade")
            return "imunidade";
        if (regra === "resistencia")
            return "resistencia";
        if (regra === "ignorado")
            return "ignorado";
        return "normal";
    }
    function atualizarPreviaDano() {
        var _a, _b, _c;
        var previa = campo("danoInteligentePrevia");
        if (!previa)
            return null;
        var resultado = calcularDanoInteligente({
            danoBruto: (_a = campo("danoBatalha")) === null || _a === void 0 ? void 0 : _a.value,
            tipoId: ((_b = campo("tipoDanoBatalha")) === null || _b === void 0 ? void 0 : _b.value) || "fisico",
            ignorarReducao: Boolean((_c = campo("ignorarReducaoDano")) === null || _c === void 0 ? void 0 : _c.checked)
        });
        previa.className = "danoInteligentePrevia ".concat(classeResultado(resultado.regra));
        previa.innerHTML = "\n      <div class=\"danoInteligentePreviaTopo\">\n        <span>".concat(resultado.tipo.icone, " ").concat(resultado.tipo.nome, "</span>\n        <strong>").concat(resultado.bruto, " \u2192 ").concat(resultado.danoFinal, "</strong>\n      </div>\n      <p>").concat(resultado.explicacao, "</p>\n      ").concat(resultado.regra === "resistencia"
            ? "<small>".concat(resultado.bruto, " \u00F7 2 = ").concat(resultado.danoFinal, " (arredondado para baixo)</small>")
            : "", "\n    ");
        return resultado;
    }
    function detalheConfirmacao(resultado, pvAtual, pvDepois) {
        var linhas = [
            "Tipo: ".concat(resultado.tipo.nome),
            "Dano informado: ".concat(resultado.bruto),
            resultado.explicacao,
            "Dano final: ".concat(resultado.danoFinal),
            "PV atual: ".concat(pvAtual),
            "PV ap\u00F3s dano: ".concat(pvDepois)
        ];
        return linhas.join("\n");
    }
    function aplicarDanoInteligente() {
        return __awaiter(this, void 0, void 0, function () {
            var resultado, pv, atual, novo, confirmar, ok, sufixo, mensagemLog;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        resultado = atualizarPreviaDano() || calcularDanoInteligente({
                            danoBruto: (_a = campo("danoBatalha")) === null || _a === void 0 ? void 0 : _a.value,
                            tipoId: ((_b = campo("tipoDanoBatalha")) === null || _b === void 0 ? void 0 : _b.value) || "fisico",
                            ignorarReducao: Boolean((_c = campo("ignorarReducaoDano")) === null || _c === void 0 ? void 0 : _c.checked)
                        });
                        if (!(resultado.bruto <= 0)) return [3 /*break*/, 3];
                        if (!(typeof window.avisoShinobi === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, window.avisoShinobi("Dano inválido", "Informe um valor de dano maior que zero.")];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2: return [2 /*return*/];
                    case 3:
                        pv = campo("pv");
                        atual = numeroInteiro(pv === null || pv === void 0 ? void 0 : pv.value);
                        novo = Math.max(0, atual - resultado.danoFinal);
                        confirmar = typeof window.confirmarUsoAcao === "function"
                            ? window.confirmarUsoAcao("ação de batalha", "Aplicar dano", detalheConfirmacao(resultado, atual, novo))
                            : Promise.resolve(confirm("".concat(detalheConfirmacao(resultado, atual, novo), "\n\nAplicar este dano?")));
                        return [4 /*yield*/, confirmar];
                    case 4:
                        ok = _d.sent();
                        if (!ok)
                            return [2 /*return*/];
                        if (pv)
                            pv.value = String(novo);
                        if (typeof window.salvar === "function")
                            window.salvar({ confirmada: true, origem: "dano-inteligente", campo: "pv", antes: atual, depois: novo, motivo: "alteracao-confirmada" });
                        sufixo = resultado.regra === "resistencia"
                            ? " (resistência)"
                            : resultado.regra === "imunidade"
                                ? " (imunidade)"
                                : resultado.regra === "ignorado"
                                    ? " (redução ignorada)"
                                    : "";
                        mensagemLog = "Dano ".concat(resultado.tipo.nome, ": ").concat(resultado.bruto, " \u2192 ").concat(resultado.danoFinal).concat(sufixo);
                        if (typeof window.log === "function")
                            window.log(mensagemLog);
                        else if (typeof window.registrarLog === "function")
                            window.registrarLog(mensagemLog);
                        if (typeof window.atualizarPainelBatalhaVivo === "function") {
                            window.atualizarPainelBatalhaVivo();
                        }
                        if (typeof window.fecharAcaoBatalha === "function")
                            window.fecharAcaoBatalha();
                        return [2 /*return*/];
                }
            });
        });
    }
    function prepararFormulario() {
        var select = campo("tipoDanoBatalha");
        if (select && !select.dataset.preenchido) {
            select.innerHTML = TIPOS.map(function (tipo) {
                return "<option value=\"".concat(tipo.id, "\">").concat(tipo.icone, " ").concat(tipo.nome, "</option>");
            }).join("");
            select.value = "fisico";
            select.dataset.preenchido = "1";
        }
        atualizarPreviaDano();
    }
    var abrirAcaoBase = typeof window.abrirAcaoBatalha === "function"
        ? window.abrirAcaoBatalha
        : null;
    if (abrirAcaoBase) {
        window.abrirAcaoBatalha = function (tipo) {
            var resultado = abrirAcaoBase.apply(this, arguments);
            if (tipo === "dano")
                requestAnimationFrame(prepararFormulario);
            return resultado;
        };
    }
    document.addEventListener("input", function (evento) {
        var _a;
        if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches("#danoBatalha, #ignorarReducaoDano"))
            atualizarPreviaDano();
    }, true);
    document.addEventListener("change", function (evento) {
        var _a;
        if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches("#tipoDanoBatalha, #ignorarReducaoDano"))
            atualizarPreviaDano();
    }, true);
    function iniciar() {
        prepararFormulario();
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    }
    else {
        iniciar();
    }
    window.addEventListener("pageshow", prepararFormulario);
    window.aplicarDano = aplicarDanoInteligente;
    try {
        aplicarDano = aplicarDanoInteligente;
    }
    catch (_erro) { }
    window.atualizarPreviaDano = atualizarPreviaDano;
    window.DanoInteligenteShinobi = {
        versao: "2.1.8",
        tipos: TIPOS.map(function (tipo) { return (__assign({}, tipo)); }),
        calcular: calcularDanoInteligente,
        atualizarPrevia: atualizarPreviaDano
    };
})();
