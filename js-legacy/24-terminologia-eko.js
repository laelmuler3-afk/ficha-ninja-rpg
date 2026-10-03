/* GERADO AUTOMATICAMENTE — fonte: js/24-terminologia-eko.js — app 2.5.8.154. Não editar. */
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
/* ==========================================================
   SHINOBI 2.5.8.11 — terminologia visual EKO
   Rebatiza "Chakra" apenas na apresentação da interface.
   IDs, funções, chaves salvas e regras continuam usando "chakra"
   internamente para preservar compatibilidade com fichas existentes.
   ========================================================== */
(function () {
    "use strict";
    var IGNORAR = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
    function traduzirTexto(valor) {
        if (typeof valor !== "string" || !valor)
            return valor;
        return valor
            .replace(/\bChakra\b/g, "EKO")
            .replace(/\bchakra\b/g, "EKO")
            .replace(/\bCH\b/g, "EKO");
    }
    function deveIgnorar(elemento) {
        if (!elemento || !(elemento instanceof Element))
            return false;
        if (IGNORAR.has(elemento.tagName))
            return true;
        /* Não altera o conteúdo escrito pelo jogador nas notas. */
        if (elemento.closest("#anotacoes, #notas"))
            return true;
        return false;
    }
    function traduzirAtributos(elemento) {
        if (!(elemento instanceof Element) || deveIgnorar(elemento))
            return;
        ["aria-label", "title", "placeholder"].forEach(function (atributo) {
            if (!elemento.hasAttribute(atributo))
                return;
            var atual = elemento.getAttribute(atributo);
            var novo = traduzirTexto(atual);
            if (novo !== atual)
                elemento.setAttribute(atributo, novo);
        });
    }
    function traduzirNo(raiz) {
        if (!raiz)
            return;
        if (raiz.nodeType === Node.TEXT_NODE) {
            var pai = raiz.parentElement;
            if (deveIgnorar(pai))
                return;
            var atual = raiz.nodeValue;
            var novo = traduzirTexto(atual);
            if (novo !== atual)
                raiz.nodeValue = novo;
            return;
        }
        if (!(raiz instanceof Element) && raiz !== document)
            return;
        if (raiz instanceof Element && deveIgnorar(raiz))
            return;
        if (raiz instanceof Element)
            traduzirAtributos(raiz);
        var walker = document.createTreeWalker(raiz, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
            acceptNode: function (no) {
                if (no.nodeType === Node.ELEMENT_NODE && deveIgnorar(no)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var no = walker.currentNode;
        while (no) {
            if (no.nodeType === Node.TEXT_NODE) {
                var atual = no.nodeValue;
                var novo = traduzirTexto(atual);
                if (novo !== atual)
                    no.nodeValue = novo;
            }
            else if (no.nodeType === Node.ELEMENT_NODE) {
                traduzirAtributos(no);
            }
            no = walker.nextNode();
        }
    }
    function instalarDialogosTraduzidos() {
        var _a, _b, _c;
        var alerta = (_a = window.alert) === null || _a === void 0 ? void 0 : _a.bind(window);
        var confirmar = (_b = window.confirm) === null || _b === void 0 ? void 0 : _b.bind(window);
        var perguntar = (_c = window.prompt) === null || _c === void 0 ? void 0 : _c.bind(window);
        if (alerta)
            window.alert = function (mensagem) { return alerta(traduzirTexto(String(mensagem !== null && mensagem !== void 0 ? mensagem : ""))); };
        if (confirmar)
            window.confirm = function (mensagem) { return confirmar(traduzirTexto(String(mensagem !== null && mensagem !== void 0 ? mensagem : ""))); };
        if (perguntar)
            window.prompt = function (mensagem, padrao) { return perguntar(traduzirTexto(String(mensagem !== null && mensagem !== void 0 ? mensagem : "")), padrao); };
    }
    function iniciar() {
        instalarDialogosTraduzidos();
        traduzirNo(document.body);
        var observer = new MutationObserver(function (mutacoes) {
            var e_1, _a;
            try {
                for (var mutacoes_1 = __values(mutacoes), mutacoes_1_1 = mutacoes_1.next(); !mutacoes_1_1.done; mutacoes_1_1 = mutacoes_1.next()) {
                    var mutacao = mutacoes_1_1.value;
                    if (mutacao.type === "characterData") {
                        traduzirNo(mutacao.target);
                        continue;
                    }
                    mutacao.addedNodes.forEach(traduzirNo);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (mutacoes_1_1 && !mutacoes_1_1.done && (_a = mutacoes_1.return)) _a.call(mutacoes_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
        observer.observe(document.body, { subtree: true, childList: true, characterData: true });
        window.__shinobiTerminologiaEko = { traduzirTexto: traduzirTexto, traduzirNo: traduzirNo };
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    }
    else {
        iniciar();
    }
})();
