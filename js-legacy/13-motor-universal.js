/* GERADO AUTOMATICAMENTE — fonte: js/13-motor-universal.js — app 2.5.8.154. Não editar. */
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/* Shinobi 2.5.3 — camada universal de efeitos de batalha com atualização localizada. */
(function () {
    "use strict";
    if (window.__motorUniversalEfeitosV110)
        return;
    window.__motorUniversalEfeitosV110 = true;
    var APLICACOES_USUARIO = new Set(["usuario", "ataques_usuario", "ataque_usuario", "armas_usuario", "jutsus_usuario"]);
    var CONDICOES = new Set(["caido", "atordoado", "paralisado", "agarrado", "impedido", "sangrando", "queimando", "cego", "surdo", "amedrontado", "inconsciente", "exaustao", "imobilizado"]);
    var TIPOS_RECURSO = new Set(["pv", "pv_temporario", "cura", "cura_periodica", "custo_periodico", "dano_periodico", "dano_programado"]);
    var frame = null;
    function numero(v, p) {
        if (p === void 0) { p = 0; }
        var n = Number(String(v !== null && v !== void 0 ? v : "").replace(",", "."));
        return Number.isFinite(n) ? n : p;
    }
    function normalizar(v) { return String(v !== null && v !== void 0 ? v : "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
    function escapar(v) { return String(v !== null && v !== void 0 ? v : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
    function sinal(v) { var n = numero(v); return n > 0 ? "+".concat(n) : String(n); }
    function ativos() { return typeof window.obterEfeitosJutsuBatalhaAtivos === "function" ? window.obterEfeitosJutsuBatalhaAtivos() : []; }
    function efeitosUsuario() { return ativos().flatMap(function (item) { return (item.efeitos || []).map(function (e) { return (__assign(__assign({}, e), { __item: item })); }); }).filter(function (e) { return e.persistente !== false && APLICACOES_USUARIO.has(String(e.aplicaEm || "usuario")); }); }
    function dadoValido(v) { return /^\d+d\d+(?:\s*[+-]\s*\d+)?$/i.test(String(v || "").trim()); }
    function somarDados(lista) { return lista.map(String).filter(dadoValido).join(" + "); }
    function perfil() {
        var e_1, _a;
        var efs = efeitosUsuario();
        var p = { numericos: {}, multiplicadores: {}, dados: {}, vantagens: new Set(), desvantagens: new Set(), resistencias: new Set(), imunidades: new Set(), vulnerabilidades: new Set(), condicoes: new Set(), acoes: {}, recursos: [], especiais: [] };
        try {
            for (var efs_1 = __values(efs), efs_1_1 = efs_1.next(); !efs_1_1.done; efs_1_1 = efs_1.next()) {
                var e = efs_1_1.value;
                var alvo = String(e.alvo || e.tipo || "efeito");
                var op = String(e.operacao || "");
                var tipo = String(e.tipo || "");
                var valor = e.valor;
                if (op === "somar" && Number.isFinite(Number(valor)))
                    p.numericos[alvo] = numero(p.numericos[alvo]) + numero(valor);
                else if (op === "subtrair" && Number.isFinite(Number(valor)))
                    p.numericos[alvo] = numero(p.numericos[alvo]) - numero(valor);
                else if (op === "multiplicar" && Number.isFinite(Number(valor)))
                    p.multiplicadores[alvo] = numero(p.multiplicadores[alvo], 1) * numero(valor, 1);
                if (dadoValido(valor))
                    (p.dados[alvo] || (p.dados[alvo] = [])).push(String(valor));
                if (tipo.includes("vantagem") || op === "vantagem")
                    p.vantagens.add(alvo);
                if (tipo === "desvantagem" || op === "desvantagem")
                    p.desvantagens.add(alvo);
                if (tipo === "resistencia")
                    p.resistencias.add(alvo);
                if (tipo.startsWith("imunidade"))
                    p.imunidades.add(alvo);
                if (tipo === "vulnerabilidade")
                    p.vulnerabilidades.add(alvo);
                if (tipo === "condicao" && op === "adicionar")
                    p.condicoes.add(alvo);
                if (tipo === "remover_condicao" || op === "remover")
                    p.condicoes.delete(alvo);
                if (tipo === "acao_extra" || tipo === "acao" || ["acao", "acao_bonus", "ataques_acao_bonus", "ataques_desarmados"].includes(alvo))
                    p.acoes[alvo] = (p.acoes[alvo] || 0) + (Number.isFinite(Number(valor)) ? numero(valor) : 1);
                if (TIPOS_RECURSO.has(tipo))
                    p.recursos.push(e);
                if (!Number.isFinite(Number(valor)) && !dadoValido(valor) && !["vantagem", "desvantagem", "adicionar", "remover"].includes(op))
                    p.especiais.push(e);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (efs_1_1 && !efs_1_1.done && (_a = efs_1.return)) _a.call(efs_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return p;
    }
    window.obterPerfilUniversalEfeitos = function () { var p = perfil(); return __assign(__assign({}, p), { vantagens: __spreadArray([], __read(p.vantagens), false), desvantagens: __spreadArray([], __read(p.desvantagens), false), resistencias: __spreadArray([], __read(p.resistencias), false), imunidades: __spreadArray([], __read(p.imunidades), false), vulnerabilidades: __spreadArray([], __read(p.vulnerabilidades), false), condicoes: __spreadArray([], __read(p.condicoes), false) }); };
    window.obterBonusUniversal = function (alvo) { return numero(perfil().numericos[String(alvo || "")]); };
    window.obterMultiplicadorUniversal = function (alvo) { return numero(perfil().multiplicadores[String(alvo || "")], 1); };
    window.obterDadosExtrasUniversal = function (alvo) { return somarDados(perfil().dados[String(alvo || "")] || []); };
    window.temVantagemUniversal = function (alvo) { var p = perfil(); return p.vantagens.has(alvo) && !p.desvantagens.has(alvo); };
    window.temDesvantagemUniversal = function (alvo) { var p = perfil(); return p.desvantagens.has(alvo) && !p.vantagens.has(alvo); };
    function rotulo(k) { return String(k || "").replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
    function chips(titulo, valores, classe) {
        if (classe === void 0) { classe = ""; }
        var arr = __spreadArray([], __read(valores), false);
        if (!arr.length)
            return "";
        return "<div class=\"motorUniversalGrupo ".concat(classe, "\"><strong>").concat(escapar(titulo), "</strong><div>").concat(arr.map(function (v) { return "<span>".concat(escapar(rotulo(v)), "</span>"); }).join(""), "</div></div>");
    }
    function mapaChips(titulo, mapa, format) { var itens = Object.entries(mapa).filter(function (_a) {
        var _b = __read(_a, 2), v = _b[1];
        return v && v !== 1;
    }); if (!itens.length)
        return ""; return "<div class=\"motorUniversalGrupo\"><strong>".concat(escapar(titulo), "</strong><div>").concat(itens.map(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        return "<span>".concat(escapar(rotulo(k)), " ").concat(escapar(format(v)), "</span>");
    }).join(""), "</div></div>"); }
    function render() {
        var host = document.getElementById("resistenciasBatalhaHost");
        if (!host)
            return;
        var box = document.getElementById("motorUniversalResumo");
        if (!box) {
            box = document.createElement("div");
            box.id = "motorUniversalResumo";
            box.className = "motorUniversalResumo";
            host.appendChild(box);
        }
        var p = perfil();
        var dados = Object.fromEntries(Object.entries(p.dados).map(function (_a) {
            var _b = __read(_a, 2), k = _b[0], v = _b[1];
            return [k, somarDados(v)];
        }));
        box.innerHTML = "<h3>Efeitos mec\u00E2nicos ativos</h3>\n      ".concat(mapaChips("Bônus", p.numericos, sinal), "\n      ").concat(mapaChips("Multiplicadores", p.multiplicadores, function (v) { return "\u00D7".concat(v); }), "\n      ").concat(mapaChips("Dados extras", dados, function (v) { return v; }), "\n      ").concat(mapaChips("Ações extras", p.acoes, function (v) { return sinal(v); }), "\n      ").concat(chips("Vantagens", p.vantagens)).concat(chips("Desvantagens", p.desvantagens, "negativo"), "\n      ").concat(chips("Resistências", p.resistencias)).concat(chips("Imunidades", p.imunidades)).concat(chips("Vulnerabilidades", p.vulnerabilidades, "negativo"), "\n      ").concat(chips("Condições", p.condicoes, "negativo"));
        box.hidden = !box.querySelector(".motorUniversalGrupo");
    }
    function agendar() { if (frame)
        cancelAnimationFrame(frame); frame = requestAnimationFrame(function () { frame = null; render(); }); }
    function eventoRelevante(evento) {
        var _a, _b;
        return Boolean((_b = (_a = evento.target) === null || _a === void 0 ? void 0 : _a.closest) === null || _b === void 0 ? void 0 : _b.call(_a, "#batalha,#jutsus,.levelUpModal,.acaoBatalhaPainel"));
    }
    document.addEventListener("input", function (evento) { if (eventoRelevante(evento))
        agendar(); }, true);
    document.addEventListener("change", function (evento) { if (eventoRelevante(evento))
        agendar(); }, true);
    document.addEventListener("click", function (evento) { if (eventoRelevante(evento))
        setTimeout(agendar, 0); }, true);
    document.addEventListener("shinobi:pagechange", function (evento) { var _a; if (((_a = evento.detail) === null || _a === void 0 ? void 0 : _a.id) === "batalha")
        agendar(); });
    document.addEventListener("DOMContentLoaded", function () { return setTimeout(agendar, 250); });
    window.addEventListener("pageshow", function () { return setTimeout(agendar, 100); });
    var original = window.aplicarEfeitosJutsuBatalha;
    if (typeof original === "function")
        window.aplicarEfeitosJutsuBatalha = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () { var r; return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, original.apply(this, args)];
                    case 1:
                        r = _a.sent();
                        agendar();
                        return [2 /*return*/, r];
                }
            }); });
        };
    window.atualizarMotorUniversalEfeitos = agendar;
})();
