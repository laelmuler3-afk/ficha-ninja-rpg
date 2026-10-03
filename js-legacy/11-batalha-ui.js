/* GERADO AUTOMATICAMENTE — fonte: js/11-batalha-ui.js — app 2.5.8.154. Não editar. */
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
/* Shinobi 1.8.0 — interface viva da Área de Batalha. */
(function () {
    "use strict";
    if (window.__batalhaVivaV180)
        return;
    window.__batalhaVivaV180 = true;
    var TITULOS = {
        dano: "Receber dano",
        cura: "Recuperar pontos de vida",
        chakra: "Gastar Chakra",
        "recuperar-chakra": "Recuperar Chakra"
    };
    function numero(valor, padrao) {
        if (padrao === void 0) { padrao = 0; }
        var n = Number(valor);
        return Number.isFinite(n) ? n : padrao;
    }
    function limitar(valor, min, max) {
        return Math.min(max, Math.max(min, valor));
    }
    function campo(id) {
        return document.getElementById(id);
    }
    function campoSalvo(nome) {
        return document.querySelector("[data-save=\"".concat(nome, "\"]"));
    }
    function atualizarRecurso(config) {
        var _a, _b;
        var atual = Math.max(0, numero((_a = campoSalvo(config.atual)) === null || _a === void 0 ? void 0 : _a.value, 0));
        var maximo = Math.max(0, numero((_b = campoSalvo(config.maximo)) === null || _b === void 0 ? void 0 : _b.value, 0));
        var percentual = maximo > 0 ? limitar((atual / maximo) * 100, 0, 100) : (atual > 0 ? 100 : 0);
        var valorView = campo(config.valorView);
        var maxView = campo(config.maxView);
        var barra = campo(config.barra);
        var card = barra === null || barra === void 0 ? void 0 : barra.closest(".recursoBatalhaCard");
        var progress = barra === null || barra === void 0 ? void 0 : barra.parentElement;
        if (valorView)
            valorView.textContent = String(atual);
        if (maxView)
            maxView.textContent = String(maximo);
        if (barra)
            barra.style.width = "".concat(percentual, "%");
        if (progress) {
            progress.setAttribute("aria-valuemax", String(maximo));
            progress.setAttribute("aria-valuenow", String(atual));
        }
        if (card) {
            card.classList.toggle("recursoCritico", config.atual === "pv" && maximo > 0 && percentual <= 25);
        }
    }
    window.atualizarPainelBatalhaVivo = function () {
        atualizarRecurso({
            atual: "pv",
            maximo: "pvMax",
            valorView: "pvView",
            maxView: "pvMaxView",
            barra: "pvBatalhaBarra"
        });
        atualizarRecurso({
            atual: "chakra",
            maximo: "chakraMax",
            valorView: "chakraView",
            maxView: "chakraMaxView",
            barra: "chakraBatalhaBarra"
        });
    };
    window.abrirAcaoBatalha = function (tipo) {
        var painel = campo("acaoBatalhaPainel");
        var titulo = campo("acaoBatalhaTitulo");
        if (!painel || !TITULOS[tipo])
            return;
        var estavaAberto = !painel.hidden && painel.dataset.acaoAtual === tipo;
        if (estavaAberto) {
            window.fecharAcaoBatalha();
            return;
        }
        painel.hidden = false;
        painel.dataset.acaoAtual = tipo;
        if (titulo)
            titulo.textContent = TITULOS[tipo];
        painel.querySelectorAll("[data-acao-batalha]").forEach(function (form) {
            form.hidden = form.dataset.acaoBatalha !== tipo;
        });
        requestAnimationFrame(function () {
            var _a;
            painel.scrollIntoView({ behavior: "smooth", block: "nearest" });
            (_a = painel.querySelector("[data-acao-batalha]:not([hidden]) input")) === null || _a === void 0 ? void 0 : _a.focus({ preventScroll: true });
        });
    };
    window.fecharAcaoBatalha = function () {
        var painel = campo("acaoBatalhaPainel");
        if (!painel)
            return;
        painel.hidden = true;
        painel.dataset.acaoAtual = "";
        painel.querySelectorAll("[data-acao-batalha]").forEach(function (form) { return form.hidden = true; });
    };
    window.ajustarValorBatalha = function (id, delta) {
        var input = campo(id);
        if (!input)
            return;
        input.value = String(Math.max(0, numero(input.value, 0) + numero(delta, 0)));
        input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    window.definirValorBatalha = function (id, valor) {
        var input = campo(id);
        if (!input)
            return;
        input.value = String(Math.max(0, numero(valor, 0)));
        input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    window.curarPVPersonalizado = function () {
        return __awaiter(this, void 0, void 0, function () {
            var valor;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        valor = Math.max(0, numero((_a = campo("curaBatalha")) === null || _a === void 0 ? void 0 : _a.value, 0));
                        if (valor <= 0)
                            return [2 /*return*/];
                        if (!(typeof window.curarPV === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, window.curarPV(valor)];
                    case 1:
                        _b.sent();
                        window.atualizarPainelBatalhaVivo();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    window.recuperarChakraPersonalizado = function () {
        return __awaiter(this, void 0, void 0, function () {
            var valor;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        valor = Math.max(0, numero((_a = campo("recuperacaoChakraBatalha")) === null || _a === void 0 ? void 0 : _a.value, 0));
                        if (valor <= 0)
                            return [2 /*return*/];
                        if (!(typeof window.recuperarChakra === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, window.recuperarChakra(valor)];
                    case 1:
                        _b.sent();
                        window.atualizarPainelBatalhaVivo();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    function envolverAtualizacaoPlacar() {
        if (typeof window.atualizarPlacar !== "function" || window.__placarComPainelVivoV180)
            return;
        window.__placarComPainelVivoV180 = true;
        var base = window.atualizarPlacar;
        window.atualizarPlacar = function () {
            var resultado = base.apply(this, arguments);
            window.atualizarPainelBatalhaVivo();
            return resultado;
        };
    }
    function envolverAcoes() {
        ["aplicarDano", "gastarChakra", "curarPV", "recuperarChakra", "resetarBatalha"].forEach(function (nome) {
            var original = window[nome];
            var chave = "__batalhaVivaWrapper_".concat(nome);
            if (typeof original !== "function" || window[chave])
                return;
            window[chave] = true;
            window[nome] = function () {
                var arguments_1 = arguments;
                return __awaiter(this, void 0, void 0, function () {
                    var resultado;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, original.apply(this, arguments_1)];
                            case 1:
                                resultado = _a.sent();
                                window.atualizarPainelBatalhaVivo();
                                return [2 /*return*/, resultado];
                        }
                    });
                });
            };
        });
    }
    function iniciar() {
        envolverAtualizacaoPlacar();
        envolverAcoes();
        window.atualizarPainelBatalhaVivo();
        document.addEventListener("input", function (evento) {
            var _a;
            if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches('[data-save="pv"],[data-save="pvMax"],[data-save="chakra"],[data-save="chakraMax"]')) {
                window.atualizarPainelBatalhaVivo();
            }
        });
        document.addEventListener("change", function (evento) {
            var _a;
            if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches('[data-save="pv"],[data-save="pvMax"],[data-save="chakra"],[data-save="chakraMax"]')) {
                window.atualizarPainelBatalhaVivo();
            }
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    }
    else {
        iniciar();
    }
    window.addEventListener("pageshow", function () {
        envolverAtualizacaoPlacar();
        envolverAcoes();
        window.atualizarPainelBatalhaVivo();
    });
})();
