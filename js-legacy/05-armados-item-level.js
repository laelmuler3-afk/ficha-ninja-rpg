/* GERADO AUTOMATICAMENTE — fonte: js/05-armados-item-level.js — app 2.5.8.154. Não editar. */
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
/* Shinobi 2.5.8.93 — ataques/armados sincronizados por item. */
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
            .replace(/^-+|-+$/g, "").slice(0, 72) || "ataque";
    }
    function hashDeterministico(valor) {
        var entrada = String(valor || "");
        var hash = 2166136261;
        for (var i = 0; i < entrada.length; i += 1) {
            hash ^= entrada.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
    }
    function novoId() {
        var _a;
        try {
            if ((_a = root === null || root === void 0 ? void 0 : root.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID)
                return "ataque_".concat(root.crypto.randomUUID().replace(/-/g, ""));
        }
        catch (_erro) { }
        return "ataque_".concat(Date.now().toString(36), "_").concat(Math.random().toString(36).slice(2, 12));
    }
    function idLegado(ataque) {
        var existente = texto((ataque === null || ataque === void 0 ? void 0 : ataque.id) || (ataque === null || ataque === void 0 ? void 0 : ataque.uuid));
        if (existente)
            return "ataque_legado_id_".concat(slug(existente)).slice(0, 170);
        var assinatura = [
            texto(ataque === null || ataque === void 0 ? void 0 : ataque.nome), texto((ataque === null || ataque === void 0 ? void 0 : ataque.tipo) || "armado"), texto(ataque === null || ataque === void 0 ? void 0 : ataque.dano),
            texto(ataque === null || ataque === void 0 ? void 0 : ataque.itemInventario)
        ].join("\u241f");
        return "ataque_legado_".concat(slug((ataque === null || ataque === void 0 ? void 0 : ataque.nome) || "ataque"), "_").concat(hashDeterministico(assinatura)).slice(0, 170);
    }
    function garantirIdsPuro(itens, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? false : _c, _d = _b.gerarId, gerarId = _d === void 0 ? novoId : _d;
        if (!Array.isArray(itens))
            return false;
        var identidade = root === null || root === void 0 ? void 0 : root.ShinobiItemIdentity;
        var alterou = false;
        if (identidade === null || identidade === void 0 ? void 0 : identidade.garantirIds) {
            alterou = identidade.garantirIds(itens, { colecao: "armados", campo: "ataqueId", legado: legado, gerarId: gerarId });
        }
        else {
            var usados_1 = new Set();
            itens.forEach(function (item) {
                if (!item || typeof item !== "object" || Array.isArray(item))
                    return;
                var id = texto(item.ataqueId);
                if (!id)
                    id = legado ? idLegado(item) : gerarId();
                if (usados_1.has(id)) {
                    var raiz = id.slice(0, 160) || "armados_item";
                    var sufixo = 2;
                    while (usados_1.has("".concat(raiz, "_").concat(sufixo)))
                        sufixo += 1;
                    id = "".concat(raiz, "_").concat(sufixo).slice(0, 180);
                }
                if (item.ataqueId !== id) {
                    item.ataqueId = id;
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
        (Array.isArray(itens) ? itens : []).forEach(function (ataque) {
            var id = texto(ataque === null || ataque === void 0 ? void 0 : ataque.ataqueId);
            if (id)
                saida[id] = clonar(ataque);
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
                mudancas.push({ itemId: itemId, deleted: false, value: clonar(item), identityKey: ((_b = identidade === null || identidade === void 0 ? void 0 : identidade.identityKey) === null || _b === void 0 ? void 0 : _b.call(identidade, "armados", item)) || "" });
        });
        Object.keys(anterior || {}).forEach(function (itemId) {
            var _a;
            if (!Object.prototype.hasOwnProperty.call(atual || {}, itemId)) {
                var antes = anterior === null || anterior === void 0 ? void 0 : anterior[itemId];
                mudancas.push({ itemId: itemId, deleted: true, value: undefined, identityKey: ((_a = identidade === null || identidade === void 0 ? void 0 : identidade.identityKey) === null || _a === void 0 ? void 0 : _a.call(identidade, "armados", antes)) || "" });
            }
        });
        return mudancas;
    }
    var test = { garantirIdsPuro: garantirIdsPuro, snapshotPuro: snapshotPuro, diferencasPuro: diferencasPuro, idLegado: idLegado };
    function install() {
        if (!root || !root.addEventListener || root.__shinobiArmadosItemLevelV1)
            return false;
        root.__shinobiArmadosItemLevelV1 = true;
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
                    persistirEstadoLocal({ emitir: false, confirmada: false, origem: origem, motivo: "ids-permanentes-armados" });
                }
            }
            catch (_erro) { }
        }
        function reiniciarBaseline(_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? true : _c;
            try {
                estado.armados = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.armados) ? estado.armados : [];
                if (garantirIdsPuro(estado.armados, { legado: legado }))
                    persistirIdsSilenciosamente("migracao-armados-item-level");
                baseline = snapshotPuro(estado.armados);
                baselineChave = chaveAtual();
                return estado.armados;
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
                return Array.isArray(estado === null || estado === void 0 ? void 0 : estado.armados) ? estado.armados : [];
            }
            catch (_erro) {
                return [];
            }
        }
        function publicarDiferencasConfirmadas() {
            garantirBaseline();
            var itens = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.armados) ? estado.armados : [];
            if (garantirIdsPuro(itens, { legado: false }))
                persistirIdsSilenciosamente("novo-ataque-item-level");
            var atual = snapshotPuro(itens);
            var mudancas = diferencasPuro(baseline, atual);
            baseline = atual;
            baselineChave = chaveAtual();
            mudancas.forEach(function (mudanca) {
                try {
                    root.dispatchEvent(new CustomEvent("shinobi:colecao-item-confirmado", { detail: {
                            sheetName: String(typeof fichaAtual !== "undefined" ? fichaAtual : "Principal"),
                            collection: "armados",
                            itemId: mudanca.itemId,
                            deleted: mudanca.deleted === true,
                            value: mudanca.deleted === true ? undefined : mudanca.value,
                            identityKey: mudanca.identityKey || "",
                            confirmed: true,
                            source: "armados",
                            reason: "alteracao-confirmada"
                        } }));
                }
                catch (_erro) { }
            });
            return mudancas;
        }
        root.ShinobiArmadosItemLevel = Object.freeze({
            garantirEstado: function () { return garantirBaseline(); },
            garantirIdsLegados: function (itens) { garantirIdsPuro(itens, { legado: true }); return itens; },
            garantirIdsNovos: function (itens) { garantirIdsPuro(itens, { legado: false }); return itens; },
            snapshot: snapshotPuro, diferencas: diferencasPuro
        });
        root.addEventListener("shinobi:ficha-persistida", function (evento) {
            var detalhe = (evento === null || evento === void 0 ? void 0 : evento.detail) || {};
            if (detalhe.confirmada !== true || texto(detalhe.campo) !== "armados")
                return;
            publicarDiferencasConfirmadas();
        });
        root.addEventListener("shinobi:realtime-colecao-aplicada", function (evento) {
            var _a;
            if (texto((_a = evento === null || evento === void 0 ? void 0 : evento.detail) === null || _a === void 0 ? void 0 : _a.collection) !== "armados")
                return;
            reiniciarBaseline({ legado: false });
        });
        var renderBase = root.renderizarArmados;
        if (typeof renderBase === "function") {
            root.renderizarArmados = function () {
                garantirBaseline();
                return renderBase.apply(this, arguments);
            };
        }
        reiniciarBaseline({ legado: true });
        return true;
    }
    return { install: install, test: test };
});
