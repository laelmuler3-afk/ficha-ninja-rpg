/* GERADO AUTOMATICAMENTE — fonte: js/06-wallet-item-level.js — app 2.5.8.154. Não editar. */
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
/* Shinobi 2.5.8.95 — carteira por moeda + histórico por movimentação. */
(function (root, factory) {
    var emNode = typeof module !== "undefined" && module.exports;
    var api = factory(root);
    if (emNode)
        module.exports = api.test;
    else
        api.install();
})(typeof window !== "undefined" ? window : globalThis, function (root) {
    "use strict";
    var CHAVES_MOEDA = Object.freeze(["pd", "po", "pp", "pc"]);
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
    function inteiroSeguro(valor) {
        var numero = Number.parseInt(valor, 10);
        return Number.isFinite(numero) && numero > 0 ? numero : 0;
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
    function novoIdHistorico() {
        var _a;
        try {
            if ((_a = root === null || root === void 0 ? void 0 : root.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID)
                return "wallet_".concat(root.crypto.randomUUID().replace(/-/g, ""));
        }
        catch (_erro) { }
        return "wallet_".concat(Date.now().toString(36), "_").concat(Math.random().toString(36).slice(2, 12));
    }
    function idLegadoHistorico(item) {
        var assinatura = [
            Number((item === null || item === void 0 ? void 0 : item.data) || 0), texto(item === null || item === void 0 ? void 0 : item.tipo), texto(item === null || item === void 0 ? void 0 : item.titulo), texto(item === null || item === void 0 ? void 0 : item.detalhe)
        ].join("\u241f");
        return "wallet_legado_".concat(hashDeterministico(assinatura));
    }
    function normalizarCarteiraPura(carteira) {
        var origem = carteira && typeof carteira === "object" && !Array.isArray(carteira) ? carteira : {};
        var saida = {};
        CHAVES_MOEDA.forEach(function (chave) { saida[chave] = inteiroSeguro(origem[chave]); });
        return saida;
    }
    function snapshotMoedasPuro(carteira) {
        var normalizada = normalizarCarteiraPura(carteira), saida = {};
        CHAVES_MOEDA.forEach(function (chave) { saida[chave] = { chave: chave, quantidade: normalizada[chave] }; });
        return saida;
    }
    function diferencasMoedasPuro(anterior, atual) {
        if (anterior === void 0) { anterior = {}; }
        if (atual === void 0) { atual = {}; }
        var mudancas = [];
        CHAVES_MOEDA.forEach(function (chave) {
            var _a, _b;
            var antes = inteiroSeguro((_a = anterior === null || anterior === void 0 ? void 0 : anterior[chave]) === null || _a === void 0 ? void 0 : _a.quantidade);
            var depois = inteiroSeguro((_b = atual === null || atual === void 0 ? void 0 : atual[chave]) === null || _b === void 0 ? void 0 : _b.quantidade);
            if (!(anterior === null || anterior === void 0 ? void 0 : anterior[chave]) || antes !== depois) {
                mudancas.push({ itemId: chave, deleted: false, value: { chave: chave, quantidade: depois } });
            }
        });
        return mudancas;
    }
    function aplicarMoedaPuro(carteira, itemId, registro) {
        var _a;
        var chave = texto(itemId).toLowerCase();
        var saida = normalizarCarteiraPura(carteira);
        if (!CHAVES_MOEDA.includes(chave) || !registro)
            return saida;
        if (registro.deleted === true) {
            saida[chave] = 0;
            return saida;
        }
        var remoto;
        try {
            remoto = JSON.parse(String((_a = registro.payload) !== null && _a !== void 0 ? _a : "null"));
        }
        catch (_erro) {
            return saida;
        }
        if (!remoto || typeof remoto !== "object" || Array.isArray(remoto))
            return saida;
        if (texto(remoto.chave).toLowerCase() !== chave)
            return saida;
        saida[chave] = inteiroSeguro(remoto.quantidade);
        return saida;
    }
    function garantirIdsHistoricoPuro(itens, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? false : _c, _d = _b.gerarId, gerarId = _d === void 0 ? novoIdHistorico : _d;
        if (!Array.isArray(itens))
            return false;
        var identidade = root === null || root === void 0 ? void 0 : root.ShinobiItemIdentity;
        if (identidade === null || identidade === void 0 ? void 0 : identidade.garantirIds)
            return identidade.garantirIds(itens, { colecao: "carteiraHistorico", campo: "id", legado: legado, gerarId: gerarId });
        var usados = new Set();
        var alterou = false;
        itens.forEach(function (item) {
            if (!item || typeof item !== "object" || Array.isArray(item))
                return;
            var id = texto(item.id);
            if (!id)
                id = legado ? idLegadoHistorico(item) : gerarId();
            if (usados.has(id)) {
                var raiz = id.slice(0, 160) || "wallet_item";
                var sufixo = 2;
                while (usados.has("".concat(raiz, "_").concat(sufixo)))
                    sufixo += 1;
                id = "".concat(raiz, "_").concat(sufixo).slice(0, 180);
            }
            if (item.id !== id) {
                item.id = id;
                alterou = true;
            }
            usados.add(id);
        });
        return alterou;
    }
    function snapshotHistoricoPuro(itens) {
        var saida = {};
        (Array.isArray(itens) ? itens : []).forEach(function (item) {
            var id = texto(item === null || item === void 0 ? void 0 : item.id);
            if (id)
                saida[id] = clonar(item);
        });
        return saida;
    }
    function diferencasHistoricoPuro(anterior, atual) {
        if (anterior === void 0) { anterior = {}; }
        if (atual === void 0) { atual = {}; }
        var mudancas = [], identidade = root === null || root === void 0 ? void 0 : root.ShinobiItemIdentity;
        Object.entries(atual || {}).forEach(function (_a) {
            var _b;
            var _c = __read(_a, 2), itemId = _c[0], item = _c[1];
            var antes = anterior === null || anterior === void 0 ? void 0 : anterior[itemId];
            if (!antes || JSON.stringify(antes) !== JSON.stringify(item))
                mudancas.push({ itemId: itemId, deleted: false, value: clonar(item), identityKey: ((_b = identidade === null || identidade === void 0 ? void 0 : identidade.identityKey) === null || _b === void 0 ? void 0 : _b.call(identidade, "carteiraHistorico", item)) || "" });
        });
        Object.keys(anterior || {}).forEach(function (itemId) {
            var _a;
            if (!Object.prototype.hasOwnProperty.call(atual || {}, itemId)) {
                var antes = anterior === null || anterior === void 0 ? void 0 : anterior[itemId];
                mudancas.push({ itemId: itemId, deleted: true, value: undefined, identityKey: ((_a = identidade === null || identidade === void 0 ? void 0 : identidade.identityKey) === null || _a === void 0 ? void 0 : _a.call(identidade, "carteiraHistorico", antes)) || "" });
            }
        });
        return mudancas;
    }
    function aplicarHistoricoPuro(itens, itemId, registro) {
        var _a;
        var id = texto(itemId), lista = Array.isArray(itens) ? clonar(itens) : [];
        if (!id || !registro)
            return lista;
        var indice = lista.findIndex(function (item) { return texto(item === null || item === void 0 ? void 0 : item.id) === id; });
        if (registro.deleted === true) {
            if (indice >= 0)
                lista.splice(indice, 1);
            return lista;
        }
        var remoto;
        try {
            remoto = JSON.parse(String((_a = registro.payload) !== null && _a !== void 0 ? _a : "null"));
        }
        catch (_erro) {
            return lista;
        }
        if (!remoto || typeof remoto !== "object" || Array.isArray(remoto))
            return lista;
        remoto = clonar(remoto) || {};
        remoto.id = id;
        if (indice >= 0)
            lista[indice] = remoto;
        else
            lista.push(remoto);
        lista.sort(function (a, b) {
            var da = Number((a === null || a === void 0 ? void 0 : a.data) || 0), db = Number((b === null || b === void 0 ? void 0 : b.data) || 0);
            if (da !== db)
                return db - da;
            return texto(b === null || b === void 0 ? void 0 : b.id).localeCompare(texto(a === null || a === void 0 ? void 0 : a.id));
        });
        return lista.slice(0, 40);
    }
    var test = {
        CHAVES_MOEDA: CHAVES_MOEDA,
        normalizarCarteiraPura: normalizarCarteiraPura,
        snapshotMoedasPuro: snapshotMoedasPuro,
        diferencasMoedasPuro: diferencasMoedasPuro,
        aplicarMoedaPuro: aplicarMoedaPuro,
        garantirIdsHistoricoPuro: garantirIdsHistoricoPuro,
        snapshotHistoricoPuro: snapshotHistoricoPuro,
        diferencasHistoricoPuro: diferencasHistoricoPuro,
        aplicarHistoricoPuro: aplicarHistoricoPuro,
        idLegadoHistorico: idLegadoHistorico
    };
    function install() {
        if (!root || !root.addEventListener || root.__shinobiWalletItemLevelV1)
            return false;
        root.__shinobiWalletItemLevelV1 = true;
        var baselineMoedas = {};
        var baselineHistorico = {};
        var baselineChave = "";
        function chaveAtual() {
            try {
                return texto(typeof CHAVE !== "undefined" ? CHAVE : "");
            }
            catch (_erro) {
                return "";
            }
        }
        function persistirSilenciosamente(origem) {
            try {
                var fn = typeof root.persistirEstadoLocal === "function" ? root.persistirEstadoLocal : (typeof persistirEstadoLocal === "function" ? persistirEstadoLocal : null);
                fn === null || fn === void 0 ? void 0 : fn({ emitir: false, confirmada: false, origem: origem, motivo: "ids-permanentes-carteira" });
            }
            catch (_erro) { }
        }
        function garantirEstadoLocal(_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? true : _c;
            try {
                if (!estado.carteira || typeof estado.carteira !== "object" || Array.isArray(estado.carteira))
                    estado.carteira = {};
                estado.carteira = normalizarCarteiraPura(estado.carteira);
                if (!Array.isArray(estado.carteiraHistorico))
                    estado.carteiraHistorico = [];
                if (garantirIdsHistoricoPuro(estado.carteiraHistorico, { legado: legado }))
                    persistirSilenciosamente("migracao-carteira-item-level");
                return true;
            }
            catch (_erro) {
                return false;
            }
        }
        function reiniciarBaselineMoedas(_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? true : _c;
            garantirEstadoLocal({ legado: legado });
            try {
                baselineMoedas = snapshotMoedasPuro(estado.carteira);
                baselineChave = chaveAtual();
            }
            catch (_erro) {
                baselineMoedas = {};
                baselineChave = chaveAtual();
            }
        }
        function reiniciarBaselineHistorico(_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? true : _c;
            garantirEstadoLocal({ legado: legado });
            try {
                baselineHistorico = snapshotHistoricoPuro(estado.carteiraHistorico);
                baselineChave = chaveAtual();
            }
            catch (_erro) {
                baselineHistorico = {};
                baselineChave = chaveAtual();
            }
        }
        function reiniciarBaseline(_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? true : _c;
            garantirEstadoLocal({ legado: legado });
            try {
                baselineMoedas = snapshotMoedasPuro(estado.carteira);
                baselineHistorico = snapshotHistoricoPuro(estado.carteiraHistorico);
                baselineChave = chaveAtual();
            }
            catch (_erro) {
                baselineMoedas = {};
                baselineHistorico = {};
                baselineChave = chaveAtual();
            }
        }
        function garantirBaseline() {
            if (chaveAtual() !== baselineChave)
                reiniciarBaseline({ legado: true });
            else
                garantirEstadoLocal({ legado: true });
        }
        function emitir(collection, mudanca) {
            try {
                root.dispatchEvent(new CustomEvent("shinobi:colecao-item-confirmado", { detail: {
                        sheetName: String(typeof fichaAtual !== "undefined" ? fichaAtual : "Principal"),
                        collection: collection,
                        itemId: mudanca.itemId, deleted: mudanca.deleted === true,
                        value: mudanca.deleted === true ? undefined : mudanca.value, identityKey: mudanca.identityKey || "", confirmed: true,
                        source: "carteira", reason: "alteracao-confirmada"
                    } }));
            }
            catch (_erro) { }
        }
        function publicarMoedas() {
            garantirBaseline();
            var atual = snapshotMoedasPuro(typeof estado !== "undefined" ? estado.carteira : {});
            var mudancas = diferencasMoedasPuro(baselineMoedas, atual);
            baselineMoedas = atual;
            baselineChave = chaveAtual();
            mudancas.forEach(function (mudanca) { return emitir("carteiraMoedas", mudanca); });
            return mudancas;
        }
        function publicarHistorico() {
            garantirBaseline();
            var itens = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.carteiraHistorico) ? estado.carteiraHistorico : [];
            if (garantirIdsHistoricoPuro(itens, { legado: false }))
                persistirSilenciosamente("novo-historico-carteira-item-level");
            var atual = snapshotHistoricoPuro(itens);
            var mudancas = diferencasHistoricoPuro(baselineHistorico, atual);
            baselineHistorico = atual;
            baselineChave = chaveAtual();
            mudancas.forEach(function (mudanca) { return emitir("carteiraHistorico", mudanca); });
            return mudancas;
        }
        root.ShinobiWalletItemLevel = Object.freeze({
            garantirEstado: function () { garantirBaseline(); return { carteira: estado === null || estado === void 0 ? void 0 : estado.carteira, historico: estado === null || estado === void 0 ? void 0 : estado.carteiraHistorico }; },
            garantirIdsHistorico: function (itens) { garantirIdsHistoricoPuro(itens, { legado: true }); return itens; },
            snapshotMoedas: snapshotMoedasPuro, snapshotHistorico: snapshotHistoricoPuro,
            diferencasMoedas: diferencasMoedasPuro, diferencasHistorico: diferencasHistoricoPuro
        });
        root.addEventListener("shinobi:ficha-persistida", function (evento) {
            var detalhe = (evento === null || evento === void 0 ? void 0 : evento.detail) || {};
            if (detalhe.confirmada !== true)
                return;
            var campo = texto(detalhe.campo);
            if (campo === "carteira")
                publicarMoedas();
            if (campo === "carteiraHistorico")
                publicarHistorico();
        });
        root.addEventListener("shinobi:realtime-colecao-aplicada", function (evento) {
            var _a;
            var collection = texto((_a = evento === null || evento === void 0 ? void 0 : evento.detail) === null || _a === void 0 ? void 0 : _a.collection);
            /* Moedas e histórico são persistidos juntos em algumas ações, mas possuem
               filas item-level independentes. Um eco remoto de carteiraMoedas pode
               ocorrer antes do evento local de carteiraHistorico; reiniciar os dois
               baselines nesse ponto fazia o lançamento recém-criado parecer já
               conhecido e ele nunca era publicado. Cada coleção só pode avançar o
               próprio baseline. */
            if (collection === "carteiraMoedas") {
                reiniciarBaselineMoedas({ legado: false });
                return;
            }
            if (collection === "carteiraHistorico")
                reiniciarBaselineHistorico({ legado: false });
        });
        reiniciarBaseline({ legado: true });
        return true;
    }
    return { install: install, test: test };
});
