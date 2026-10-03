/* GERADO AUTOMATICAMENTE — fonte: js/02-runtime.js — app 2.5.8.154. Não editar. */
/* Shinobi 1.3.2 — runtime limpo e otimizado. */
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
/* ===== Salvamento imediato e seguro ===== */
(function () {
    if (window.__performanceV3Ativa)
        return;
    window.__performanceV3Ativa = true;
    window.salvarImediatoV3 = function () {
        /* Durante criação/troca/renomeação de ficha, CHAVE pode já apontar para
           o destino enquanto `estado` ainda representa a ficha de origem. Salvar
           nesse intervalo copia a ficha antiga para a nova e também herda a
           identidade online. A transição explícita já salvou a origem antes. */
        if (window.__shinobiSheetTransition === true) {
            return false;
        }
        if (typeof estado === "undefined" ||
            typeof CHAVE === "undefined") {
            return false;
        }
        try {
            /*
             * Captura o valor mais recente dos campos antes de ocultar,
             * fechar ou atualizar o aplicativo.
             */
            if (typeof sincronizarEstadoDosCampos === "function") {
                sincronizarEstadoDosCampos();
            }
            /*
             * Usa a rotina ativa de persistência. Depois que o módulo de
             * imagens é carregado, essa função respeita o IndexedDB e evita
             * recolocar imagens pesadas no localStorage.
             */
            if (typeof persistirEstadoLocal === "function") {
                return persistirEstadoLocal();
            }
            localStorage.setItem(CHAVE, JSON.stringify(estado));
            return true;
        }
        catch (err) {
            console.warn("Erro ao salvar imediatamente:", err);
            return false;
        }
    };
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") {
            window.salvarImediatoV3();
        }
    });
    window.addEventListener("pagehide", function () {
        window.salvarImediatoV3();
    });
})();
/* ===== Inventário: usar item com modal Shinobi ===== */
function usarItemInventario(i) {
    return __awaiter(this, void 0, void 0, function () {
        var item, nome, atual, quantidade, ok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    garantirInventarioItens();
                    item = estado.inventarioItens[i];
                    if (!item)
                        return [2 /*return*/];
                    nome = item.nome || "Item";
                    atual = Number(item.quantidade || 0);
                    if (!(atual <= 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, avisoShinobi("Sem quantidade", "Esse item está sem quantidade disponível.")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    quantidade = prompt("Usar quantos de \"".concat(nome, "\"?"), "1");
                    if (quantidade === null)
                        return [2 /*return*/];
                    quantidade = parseInt(quantidade || "1", 10);
                    if (isNaN(quantidade) || quantidade < 1) {
                        quantidade = 1;
                    }
                    if (!(quantidade > atual)) return [3 /*break*/, 4];
                    return [4 /*yield*/, avisoShinobi("Quantidade insuficiente", "Voc\u00EA s\u00F3 tem ".concat(atual, " desse item."))];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
                case 4: return [4 /*yield*/, confirmarUsoAcao("item", nome, "Quantidade: ".concat(quantidade, "\nRestar\u00E1: ").concat(atual - quantidade))];
                case 5:
                    ok = _a.sent();
                    if (!ok)
                        return [2 /*return*/];
                    item.quantidade = atual - quantidade;
                    salvarInventarioItens();
                    if (typeof registrarLog === "function") {
                        registrarLog("Usou ".concat(quantidade, "x ").concat(nome, "."));
                    }
                    renderizarInventario();
                    return [2 /*return*/];
            }
        });
    });
}
/* ===== Notas: autoaltura com limite seguro ===== */
function ajustarAlturaTextareaNotaSeguro(el) {
    if (!el)
        return;
    var isMobile = window.matchMedia("(max-width:600px)").matches;
    var limiteTela = window.innerHeight * (isMobile ? 0.56 : 0.62);
    var limiteFinal = Math.min(limiteTela, isMobile ? 460 : 520);
    el.style.height = "auto";
    var alturaConteudo = el.scrollHeight + 8;
    var novaAltura = Math.min(alturaConteudo, limiteFinal);
    el.style.height = novaAltura + "px";
    el.style.overflowY =
        alturaConteudo > limiteFinal ? "auto" : "hidden";
}
function ajustarNotasAbertasSeguro() {
    document
        .querySelectorAll("#anotacoes .topicoNotaConteudo textarea")
        .forEach(ajustarAlturaTextareaNotaSeguro);
}
document.addEventListener("input", function (evento) {
    var campo = evento.target;
    if (campo &&
        campo.matches("#anotacoes .topicoNotaConteudo textarea")) {
        ajustarAlturaTextareaNotaSeguro(campo);
    }
});
var timerAjusteNotasRuntime = null;
window.addEventListener("resize", function () {
    if (timerAjusteNotasRuntime) {
        clearTimeout(timerAjusteNotasRuntime);
    }
    timerAjusteNotasRuntime = setTimeout(function () {
        timerAjusteNotasRuntime = null;
        ajustarNotasAbertasSeguro();
    }, 120);
});
/*
 * Toda criação ou reabertura dos tópicos passa por esta função.
 * Um único ajuste após a renderização substitui os listeners e
 * wrappers duplicados que existiam anteriormente.
 */
if (typeof renderizarTopicosNotas === "function" &&
    !window.__renderNotasAlturaLimitadaV3) {
    window.__renderNotasAlturaLimitadaV3 = true;
    var renderizarTopicosNotasBaseV3_1 = renderizarTopicosNotas;
    window.renderizarTopicosNotas = function () {
        var resultado = renderizarTopicosNotasBaseV3_1.apply(this, arguments);
        setTimeout(ajustarNotasAbertasSeguro, 100);
        return resultado;
    };
}
