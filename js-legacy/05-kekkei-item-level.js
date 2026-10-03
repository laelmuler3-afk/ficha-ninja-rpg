/* GERADO AUTOMATICAMENTE — fonte: js/05-kekkei-item-level.js — app 2.5.8.154. Não editar. */
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
/* Shinobi 2.5.8.94 — Kekkei Genkai sincronizada por item. */
(function (root, factory) {
    var emNode = typeof module !== "undefined" && module.exports;
    var api = factory(root);
    if (emNode)
        module.exports = api.test;
    else
        api.install();
})(typeof window !== "undefined" ? window : globalThis, function (root) {
    "use strict";
    function texto(valor) { return String(valor == null ? "" : valor).trim(); }
    function clonar(valor) {
        if (valor == null)
            return valor;
        try {
            return structuredClone(valor);
        }
        catch (_erro) {
            return JSON.parse(JSON.stringify(valor));
        }
    }
    function slug(valor) {
        return texto(valor)
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "").slice(0, 72) || "kekkei";
    }
    function novoId() {
        var _a;
        try {
            if ((_a = root === null || root === void 0 ? void 0 : root.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID)
                return "kekkei_".concat(root.crypto.randomUUID().replace(/-/g, ""));
        }
        catch (_erro) { }
        return "kekkei_".concat(Date.now().toString(36), "_").concat(Math.random().toString(36).slice(2, 12));
    }
    function idLegado(item) {
        var existente = texto((item === null || item === void 0 ? void 0 : item.id) || (item === null || item === void 0 ? void 0 : item.uuid));
        if (existente)
            return "kekkei_legado_id_".concat(slug(existente)).slice(0, 170);
        return "kekkei_legado_".concat(slug((item === null || item === void 0 ? void 0 : item.nome) || "kekkei")).slice(0, 170);
    }
    function garantirIdsPuro(itens, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? false : _c, _d = _b.gerarId, gerarId = _d === void 0 ? novoId : _d;
        if (!Array.isArray(itens))
            return false;
        var identidade = root === null || root === void 0 ? void 0 : root.ShinobiItemIdentity;
        var alterou = false;
        if (identidade === null || identidade === void 0 ? void 0 : identidade.garantirIds) {
            alterou = identidade.garantirIds(itens, { colecao: "kekkeiGenkai", campo: "kekkeiId", legado: legado, gerarId: gerarId });
        }
        else {
            var usados_1 = new Set();
            itens.forEach(function (item) {
                if (!item || typeof item !== "object" || Array.isArray(item))
                    return;
                var id = texto(item.kekkeiId);
                if (!id)
                    id = legado ? idLegado(item) : gerarId();
                if (usados_1.has(id)) {
                    var raiz = id.slice(0, 160) || "kekkeiGenkai_item";
                    var sufixo = 2;
                    while (usados_1.has("".concat(raiz, "_").concat(sufixo)))
                        sufixo += 1;
                    id = "".concat(raiz, "_").concat(sufixo).slice(0, 180);
                }
                if (item.kekkeiId !== id) {
                    item.kekkeiId = id;
                    alterou = true;
                }
                usados_1.add(id);
            });
        }
        var proximaOrdem = itens.reduce(function (max, item) { var ordem = Number(item === null || item === void 0 ? void 0 : item.ordem); return Number.isFinite(ordem) ? Math.max(max, ordem + 1) : max; }, 0);
        itens.forEach(function (item) { if (item && typeof item === "object" && !Array.isArray(item) && !Number.isFinite(Number(item.ordem))) {
            item.ordem = proximaOrdem++;
            alterou = true;
        } });
        return alterou;
    }
    function snapshotPuro(itens) {
        var saida = {};
        (Array.isArray(itens) ? itens : []).forEach(function (item) {
            var id = texto(item === null || item === void 0 ? void 0 : item.kekkeiId);
            if (id)
                saida[id] = clonar(item);
        });
        return saida;
    }
    function diferencasPuro(anterior, atual) {
        if (anterior === void 0) { anterior = {}; }
        if (atual === void 0) { atual = {}; }
        var mudancas = [], identidade = root === null || root === void 0 ? void 0 : root.ShinobiItemIdentity;
        Object.entries(atual || {}).forEach(function (_a) {
            var _b;
            var _c = __read(_a, 2), itemId = _c[0], item = _c[1];
            var antes = anterior === null || anterior === void 0 ? void 0 : anterior[itemId];
            if (!antes || JSON.stringify(antes) !== JSON.stringify(item))
                mudancas.push({ itemId: itemId, deleted: false, value: clonar(item), identityKey: ((_b = identidade === null || identidade === void 0 ? void 0 : identidade.identityKey) === null || _b === void 0 ? void 0 : _b.call(identidade, "kekkeiGenkai", item)) || "" });
        });
        Object.keys(anterior || {}).forEach(function (itemId) {
            var _a;
            if (!Object.prototype.hasOwnProperty.call(atual || {}, itemId)) {
                var antes = anterior === null || anterior === void 0 ? void 0 : anterior[itemId];
                mudancas.push({ itemId: itemId, deleted: true, value: undefined, identityKey: ((_a = identidade === null || identidade === void 0 ? void 0 : identidade.identityKey) === null || _a === void 0 ? void 0 : _a.call(identidade, "kekkeiGenkai", antes)) || "" });
            }
        });
        return mudancas;
    }
    var test = { garantirIdsPuro: garantirIdsPuro, snapshotPuro: snapshotPuro, diferencasPuro: diferencasPuro, idLegado: idLegado };
    function install() {
        if (!root || !root.addEventListener || root.__shinobiKekkeiItemLevelV1)
            return false;
        root.__shinobiKekkeiItemLevelV1 = true;
        var baseline = {};
        var baselineChave = "";
        function chaveAtual() {
            try {
                return texto(typeof CHAVE !== "undefined" ? CHAVE : "");
            }
            catch (_erro) {
                return "";
            }
        }
        function persistirIdsSilenciosamente(origem) {
            try {
                if (typeof persistirEstadoLocal === "function") {
                    persistirEstadoLocal({ emitir: false, confirmada: false, origem: origem, motivo: "ids-permanentes-kekkei" });
                }
            }
            catch (_erro) { }
        }
        function reiniciarBaseline(_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? true : _c;
            try {
                estado.kekkeiGenkai = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.kekkeiGenkai) ? estado.kekkeiGenkai : [];
                if (garantirIdsPuro(estado.kekkeiGenkai, { legado: legado }))
                    persistirIdsSilenciosamente("migracao-kekkei-item-level");
                baseline = snapshotPuro(estado.kekkeiGenkai);
                baselineChave = chaveAtual();
                return estado.kekkeiGenkai;
            }
            catch (_erro) {
                return [];
            }
        }
        function garantirBaseline() {
            var chave = chaveAtual();
            if (chave !== baselineChave)
                return reiniciarBaseline({ legado: true });
            try {
                return Array.isArray(estado === null || estado === void 0 ? void 0 : estado.kekkeiGenkai) ? estado.kekkeiGenkai : [];
            }
            catch (_erro) {
                return [];
            }
        }
        function publicarDiferencasConfirmadas() {
            garantirBaseline();
            var itens = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.kekkeiGenkai) ? estado.kekkeiGenkai : [];
            if (garantirIdsPuro(itens, { legado: false }))
                persistirIdsSilenciosamente("nova-kekkei-item-level");
            var atual = snapshotPuro(itens);
            var mudancas = diferencasPuro(baseline, atual);
            baseline = atual;
            baselineChave = chaveAtual();
            mudancas.forEach(function (mudanca) {
                try {
                    root.dispatchEvent(new CustomEvent("shinobi:colecao-item-confirmado", { detail: {
                            sheetName: String(typeof fichaAtual !== "undefined" ? fichaAtual : "Principal"),
                            collection: "kekkeiGenkai",
                            itemId: mudanca.itemId,
                            deleted: mudanca.deleted === true,
                            value: mudanca.deleted === true ? undefined : mudanca.value,
                            identityKey: mudanca.identityKey || "",
                            confirmed: true,
                            source: "kekkei",
                            reason: "alteracao-confirmada"
                        } }));
                }
                catch (_erro) { }
            });
            return mudancas;
        }
        root.ShinobiKekkeiItemLevel = Object.freeze({
            garantirEstado: function () { return garantirBaseline(); },
            garantirIdsLegados: function (itens) { garantirIdsPuro(itens, { legado: true }); return itens; },
            garantirIdsNovos: function (itens) { garantirIdsPuro(itens, { legado: false }); return itens; },
            snapshot: snapshotPuro, diferencas: diferencasPuro
        });
        root.addEventListener("shinobi:ficha-persistida", function (evento) {
            var detalhe = (evento === null || evento === void 0 ? void 0 : evento.detail) || {};
            if (detalhe.confirmada !== true || texto(detalhe.campo) !== "kekkeiGenkai")
                return;
            publicarDiferencasConfirmadas();
        });
        root.addEventListener("shinobi:realtime-colecao-aplicada", function (evento) {
            var _a;
            if (texto((_a = evento === null || evento === void 0 ? void 0 : evento.detail) === null || _a === void 0 ? void 0 : _a.collection) !== "kekkeiGenkai")
                return;
            reiniciarBaseline({ legado: false });
        });
        var renderBase = root.renderizarKekkeiGenkai;
        if (typeof renderBase === "function") {
            root.renderizarKekkeiGenkai = function () {
                garantirBaseline();
                return renderBase.apply(this, arguments);
            };
        }
        reiniciarBaseline({ legado: true });
        return true;
    }
    return { install: install, test: test };
});
