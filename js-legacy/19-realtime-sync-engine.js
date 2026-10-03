/* GERADO AUTOMATICAMENTE — fonte: js/19-realtime-sync-engine.js — app 2.5.8.154. Não editar. */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/* EKO 2.5.8.78 — realtime lazy com isolamento de cópias legadas. */
(function (root, factory) {
    var emNode = typeof module !== "undefined" && module.exports;
    var util = emNode ? require("./19-realtime-fields-utils.js") : root === null || root === void 0 ? void 0 : root.EkoRealtimeFields;
    var itemIdentity = emNode ? require("./00-item-identity.js") : root === null || root === void 0 ? void 0 : root.ShinobiItemIdentity;
    var api = factory(root, util, itemIdentity);
    if (emNode)
        module.exports = api.test;
    else
        api.install();
})(typeof window !== "undefined" ? window : globalThis, function (root, util, itemIdentity) {
    "use strict";
    var CHAVE_OUTBOX_BASE = "shinobi_field_outbox_v2";
    var CHAVE_VERSOES_BASE = "shinobi_field_versions_v2";
    var CHAVE_SERVER_OFFSET = "shinobi_server_time_offset_v2";
    var CHAVE_DEVICE = "shinobi_device_id_v1";
    var CHAVE_COLECAO_OUTBOX_BASE = "shinobi_collection_outbox_v1";
    var CHAVE_COLECAO_VERSOES_BASE = "shinobi_collection_versions_v1";
    var CHAVE_COLECAO_QUARENTENA_BASE = "shinobi_collection_quarantine_v1";
    function texto(v) { return String(v == null ? "" : v).trim(); }
    function clonar(v) { if (v == null)
        return v; try {
        return structuredClone(v);
    }
    catch (_e) {
        return JSON.parse(JSON.stringify(v));
    } }
    function agora() { return Date.now(); }
    function idAleatorio(prefixo) {
        var _a;
        if (prefixo === void 0) { prefixo = "op"; }
        try {
            if ((_a = root === null || root === void 0 ? void 0 : root.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID)
                return "".concat(prefixo, "_").concat(root.crypto.randomUUID().replace(/-/g, ""));
        }
        catch (_e) { }
        return "".concat(prefixo, "_").concat(agora().toString(36), "_").concat(Math.random().toString(36).slice(2, 12));
    }
    function compararRegistros(a, b) {
        if (util === null || util === void 0 ? void 0 : util.compararVersoes)
            return util.compararVersoes(a, b);
        var ea = Number((a === null || a === void 0 ? void 0 : a.editAt) || 0), eb = Number((b === null || b === void 0 ? void 0 : b.editAt) || 0);
        if (ea !== eb)
            return ea > eb ? 1 : -1;
        var oa = texto(a === null || a === void 0 ? void 0 : a.opId), ob = texto(b === null || b === void 0 ? void 0 : b.opId);
        return oa === ob ? 0 : (oa > ob ? 1 : -1);
    }
    function registroMaisNovo(a, b) { return compararRegistros(a, b) >= 0 ? a : b; }
    function campoParaChave(campo) { return (util === null || util === void 0 ? void 0 : util.campoParaChave) ? util.campoParaChave(campo) : encodeURIComponent(texto(campo)).replace(/\./g, "%2E"); }
    function campoPermitido(campo) { return (util === null || util === void 0 ? void 0 : util.campoPermitido) ? util.campoPermitido(campo) : Boolean(texto(campo)); }
    function erroItemIdInvalido(mensagem) {
        var erro = new Error(mensagem);
        erro.code = "shinobi/invalid-item-id";
        return erro;
    }
    function itemIdParaChaveFirebasePura(itemId) {
        var id = texto(itemId);
        if (!id)
            throw erroItemIdInvalido("ID de item inválido para sincronização.");
        if (id.length > 180)
            throw erroItemIdInvalido("ID de item inválido para sincronização: limite de 180 caracteres excedido.");
        if (/[.#$\/\[\]\u0000-\u001F\u007F]/.test(id)) {
            throw erroItemIdInvalido("ID de item inv\u00E1lido para Firebase Realtime Database: ".concat(id));
        }
        return id;
    }
    function normalizarValor(campo, valor) { return (util === null || util === void 0 ? void 0 : util.normalizarValorParaNuvem) ? util.normalizarValorParaNuvem(campo, valor) : clonar(valor); }
    function realtimeIdDaFicha(ficha) {
        var _a, _b, _c, _d;
        return texto((ficha === null || ficha === void 0 ? void 0 : ficha.characterId) || ((_b = (_a = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _a === void 0 ? void 0 : _a.__online) === null || _b === void 0 ? void 0 : _b.characterId) || (ficha === null || ficha === void 0 ? void 0 : ficha.realtimeId) || ((_d = (_c = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _c === void 0 ? void 0 : _c.__online) === null || _d === void 0 ? void 0 : _d.realtimeId) || "");
    }
    function fichaPodeUsarRealtime(ficha) {
        var _a;
        if (!ficha)
            return false;
        var online = ((_a = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _a === void 0 ? void 0 : _a.__online) && typeof ficha.data.__online === "object" ? ficha.data.__online : {};
        return online.syncDisabled !== true && online.legacyAutoCopy !== true;
    }
    function criarOperacaoPura(_a) {
        var sheetId = _a.sheetId, sheetName = _a.sheetName, campo = _a.campo, valor = _a.valor, editAt = _a.editAt, deviceId = _a.deviceId, opId = _a.opId, _b = _a.uid, uid = _b === void 0 ? "" : _b;
        var nome = texto(campo);
        var deleted = valor === undefined;
        var op = {
            uid: texto(uid), sheetId: texto(sheetId), sheetName: texto(sheetName) || "Principal", name: nome,
            deleted: deleted,
            editAt: Number(editAt || agora()), deviceId: texto(deviceId), opId: texto(opId) || idAleatorio("field")
        };
        if (!deleted)
            op.payload = JSON.stringify(normalizarValor(nome, valor));
        return op;
    }
    var CAMPOS_ITEM_LEVEL = new Map([["notasTopicos", "notas"], ["inventarioItens", "inventario"], ["jutsus", "jutsus"], ["armados", "armados"], ["kekkeiGenkai", "kekkeiGenkai"], ["carteira", "carteiraMoedas"], ["carteiraHistorico", "carteiraHistorico"], ["efeitosBatalhaAtivos", "efeitosBatalha"]]);
    var COLECOES_ITEM_LEVEL = new Set(["notas", "inventario", "jutsus", "armados", "kekkeiGenkai", "carteiraMoedas", "carteiraHistorico", "efeitosBatalha"]);
    function campoGerenciadoPorColecao(campo) {
        return CAMPOS_ITEM_LEVEL.has(texto(campo));
    }
    function colecaoPermitida(colecao) {
        return COLECOES_ITEM_LEVEL.has(texto(colecao));
    }
    function normalizarItemColecao(colecao, valor, itemId) {
        if (itemId === void 0) { itemId = ""; }
        if (valor == null || typeof valor !== "object" || Array.isArray(valor))
            return clonar(valor);
        var copia = clonar(valor) || {};
        var collection = texto(colecao);
        if (collection === "notas")
            delete copia.aberto;
        if (["notas", "inventario", "carteiraHistorico", "efeitosBatalha"].includes(collection) && itemId)
            copia.id = texto(itemId);
        if (collection === "carteiraMoedas") {
            var chave = texto(itemId || copia.chave).toLowerCase();
            var quantidade = Math.max(0, Number.parseInt(copia.quantidade, 10) || 0);
            return { chave: chave, quantidade: quantidade };
        }
        if (collection === "armados" && itemId)
            copia.ataqueId = texto(itemId);
        if (collection === "kekkeiGenkai" && itemId)
            copia.kekkeiId = texto(itemId);
        if (collection === "jutsus") {
            delete copia.imagem;
            delete copia.imagemId;
            if (itemId)
                copia.jutsuId = texto(itemId);
        }
        return copia;
    }
    function criarOperacaoColecaoPura(_a) {
        var _b;
        var sheetId = _a.sheetId, sheetName = _a.sheetName, colecao = _a.colecao, itemId = _a.itemId, valor = _a.valor, _c = _a.deleted, deleted = _c === void 0 ? false : _c, editAt = _a.editAt, deviceId = _a.deviceId, opId = _a.opId, _d = _a.uid, uid = _d === void 0 ? "" : _d, _f = _a.identityKey, identityKey = _f === void 0 ? "" : _f;
        var collection = texto(colecao), id = texto(itemId);
        var removida = deleted === true || valor === undefined;
        var identidade = texto(identityKey) || (!removida ? texto((_b = itemIdentity === null || itemIdentity === void 0 ? void 0 : itemIdentity.identityKey) === null || _b === void 0 ? void 0 : _b.call(itemIdentity, collection, valor)) : "");
        var op = {
            kind: "collection", uid: texto(uid), sheetId: texto(sheetId), sheetName: texto(sheetName) || "Principal",
            collection: collection,
            itemId: id, deleted: removida, editAt: Number(editAt || agora()), deviceId: texto(deviceId),
            opId: texto(opId) || idAleatorio("item")
        };
        if (identidade)
            op.identityKey = identidade.slice(0, 180);
        if (!removida)
            op.payload = JSON.stringify(normalizarItemColecao(collection, valor, id));
        return op;
    }
    function aplicarRegistroColecaoPuro(colecao, itens, itemId, registro) {
        var _a, _b, _c;
        var collection = texto(colecao), id = texto(itemId);
        if (!colecaoPermitida(collection) || !id || !registro) {
            return collection === "carteiraMoedas" ? (itens && typeof itens === "object" && !Array.isArray(itens) ? clonar(itens) : {}) : (Array.isArray(itens) ? clonar(itens) : []);
        }
        if (collection === "carteiraMoedas") {
            var carteira = itens && typeof itens === "object" && !Array.isArray(itens) ? clonar(itens) : {};
            var chave = id.toLowerCase();
            if (!["pd", "po", "pp", "pc"].includes(chave))
                return carteira;
            if (registro.deleted === true) {
                carteira[chave] = 0;
                return carteira;
            }
            var remoto_1;
            try {
                remoto_1 = JSON.parse(String((_a = registro.payload) !== null && _a !== void 0 ? _a : "null"));
            }
            catch (_e) {
                return carteira;
            }
            if (!remoto_1 || typeof remoto_1 !== "object" || Array.isArray(remoto_1) || texto(remoto_1.chave).toLowerCase() !== chave)
                return carteira;
            carteira[chave] = Math.max(0, Number.parseInt(remoto_1.quantidade, 10) || 0);
            return carteira;
        }
        var lista = Array.isArray(itens) ? clonar(itens) : [];
        var indice = lista.findIndex(function (item) { return texto(collection === "jutsus" ? item === null || item === void 0 ? void 0 : item.jutsuId : collection === "armados" ? item === null || item === void 0 ? void 0 : item.ataqueId : collection === "kekkeiGenkai" ? item === null || item === void 0 ? void 0 : item.kekkeiId : item === null || item === void 0 ? void 0 : item.id) === id; });
        if (registro.deleted === true) {
            if (indice >= 0)
                lista.splice(indice, 1);
            return lista;
        }
        var remoto;
        try {
            remoto = JSON.parse(String((_b = registro.payload) !== null && _b !== void 0 ? _b : "null"));
        }
        catch (_e) {
            return lista;
        }
        if (!remoto || typeof remoto !== "object" || Array.isArray(remoto))
            return lista;
        remoto = normalizarItemColecao(collection, remoto, id);
        if (collection === "notas") {
            var aberto = indice >= 0 ? Boolean((_c = lista[indice]) === null || _c === void 0 ? void 0 : _c.aberto) : false;
            remoto.aberto = aberto;
        }
        if (collection === "jutsus" && indice >= 0) {
            var local = lista[indice];
            if (Object.prototype.hasOwnProperty.call(local || {}, "imagem"))
                remoto.imagem = local.imagem;
            if (Object.prototype.hasOwnProperty.call(local || {}, "imagemId"))
                remoto.imagemId = local.imagemId;
        }
        if (indice >= 0)
            lista[indice] = remoto;
        else
            lista.push(remoto);
        if (collection === "jutsus" || collection === "armados" || collection === "kekkeiGenkai") {
            lista.sort(function (a, b) {
                var oa = Number(a === null || a === void 0 ? void 0 : a.ordem), ob = Number(b === null || b === void 0 ? void 0 : b.ordem);
                var va = Number.isFinite(oa) ? oa : Number.MAX_SAFE_INTEGER;
                var vb = Number.isFinite(ob) ? ob : Number.MAX_SAFE_INTEGER;
                if (va !== vb)
                    return va - vb;
                return texto(collection === "jutsus" ? a === null || a === void 0 ? void 0 : a.jutsuId : collection === "armados" ? a === null || a === void 0 ? void 0 : a.ataqueId : a === null || a === void 0 ? void 0 : a.kekkeiId).localeCompare(texto(collection === "jutsus" ? b === null || b === void 0 ? void 0 : b.jutsuId : collection === "armados" ? b === null || b === void 0 ? void 0 : b.ataqueId : b === null || b === void 0 ? void 0 : b.kekkeiId));
            });
        }
        if (collection === "carteiraHistorico") {
            lista.sort(function (a, b) {
                var da = Number((a === null || a === void 0 ? void 0 : a.data) || 0), db = Number((b === null || b === void 0 ? void 0 : b.data) || 0);
                if (da !== db)
                    return db - da;
                return texto(b === null || b === void 0 ? void 0 : b.id).localeCompare(texto(a === null || a === void 0 ? void 0 : a.id));
            });
            return lista.slice(0, 40);
        }
        return lista;
    }
    function slugRegularizacao(valor, limite) {
        if (limite === void 0) { limite = 72; }
        return texto(valor)
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "").slice(0, limite) || "item";
    }
    function hashRegularizacao(valor) {
        var str = String(valor == null ? "" : valor);
        var hash = 2166136261;
        for (var i = 0; i < str.length; i += 1) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
    }
    function ordenarObjetoRegularizacao(valor) {
        if (Array.isArray(valor))
            return valor.map(ordenarObjetoRegularizacao);
        if (!valor || typeof valor !== "object")
            return valor;
        var saida = {};
        Object.keys(valor).sort().forEach(function (chave) { saida[chave] = ordenarObjetoRegularizacao(valor[chave]); });
        return saida;
    }
    function campoIdColecao(colecao) { var collection = texto(colecao); return collection === "jutsus" ? "jutsuId" : collection === "armados" ? "ataqueId" : collection === "kekkeiGenkai" ? "kekkeiId" : "id"; }
    function identityKeyColecao(colecao, item) { var _a; return texto(((_a = itemIdentity === null || itemIdentity === void 0 ? void 0 : itemIdentity.identityKey) === null || _a === void 0 ? void 0 : _a.call(itemIdentity, texto(colecao), item)) || ""); }
    function identityKeyRegistro(colecao, registro) {
        var _a;
        var explicita = texto(registro === null || registro === void 0 ? void 0 : registro.identityKey);
        if ((registro === null || registro === void 0 ? void 0 : registro.deleted) === true)
            return explicita;
        var item;
        try {
            item = JSON.parse(String((_a = registro === null || registro === void 0 ? void 0 : registro.payload) !== null && _a !== void 0 ? _a : "null"));
        }
        catch (_e) {
            return explicita;
        }
        var calculada = item && typeof item === "object" && !Array.isArray(item) ? identityKeyColecao(colecao, item) : "";
        return calculada || explicita;
    }
    function itemComparavelRegularizacao(colecao, item) {
        var collection = texto(colecao), copia = clonar(item) || {};
        if (!copia || typeof copia !== "object" || Array.isArray(copia))
            return copia;
        delete copia[campoIdColecao(collection)];
        if (collection === "notas")
            delete copia.aberto;
        if (collection === "jutsus") {
            delete copia.imagem;
            delete copia.imagemId;
            delete copia.ordem;
        }
        if (collection === "armados" || collection === "kekkeiGenkai")
            delete copia.ordem;
        return ordenarObjetoRegularizacao(copia);
    }
    function fingerprintRegularizacao(colecao, item) {
        return hashRegularizacao(JSON.stringify(itemComparavelRegularizacao(colecao, item)));
    }
    function idLegadoRegularizacao(colecao, item) {
        var collection = texto(colecao);
        if (collection === "notas") {
            return "nota_legado_".concat(slugRegularizacao((item === null || item === void 0 ? void 0 : item.titulo) || "nota", 36));
        }
        if (collection === "inventario") {
            var catalogo = slugRegularizacao((item === null || item === void 0 ? void 0 : item.catalogoSlug) || (item === null || item === void 0 ? void 0 : item.slug) || "", 64);
            if (catalogo !== "item")
                return "inv_legado_catalogo_".concat(catalogo).slice(0, 170);
            var nome = slugRegularizacao((item === null || item === void 0 ? void 0 : item.nome) || "item", 64);
            var tipo = slugRegularizacao((item === null || item === void 0 ? void 0 : item.tipo) || "", 64);
            var dano = slugRegularizacao((item === null || item === void 0 ? void 0 : item.dano) || "", 64);
            var complemento = [tipo, dano].filter(function (v) { return v && v !== "item"; }).join("_");
            return "inv_legado_".concat(nome).concat(complemento ? "_".concat(complemento) : "").slice(0, 170);
        }
        if (collection === "armados") {
            var existente = texto((item === null || item === void 0 ? void 0 : item.id) || (item === null || item === void 0 ? void 0 : item.uuid));
            if (existente)
                return "ataque_legado_id_".concat(slugRegularizacao(existente)).slice(0, 170);
            var assinatura = [texto(item === null || item === void 0 ? void 0 : item.nome), texto((item === null || item === void 0 ? void 0 : item.tipo) || "armado"), texto(item === null || item === void 0 ? void 0 : item.dano), texto(item === null || item === void 0 ? void 0 : item.itemInventario)].join("\u241f");
            return "ataque_legado_".concat(slugRegularizacao((item === null || item === void 0 ? void 0 : item.nome) || "ataque"), "_").concat(hashRegularizacao(assinatura)).slice(0, 170);
        }
        if (collection === "kekkeiGenkai") {
            var existente = texto((item === null || item === void 0 ? void 0 : item.id) || (item === null || item === void 0 ? void 0 : item.uuid));
            if (existente)
                return "kekkei_legado_id_".concat(slugRegularizacao(existente)).slice(0, 170);
            return "kekkei_legado_".concat(slugRegularizacao((item === null || item === void 0 ? void 0 : item.nome) || "kekkei")).slice(0, 170);
        }
        if (collection === "jutsus") {
            var catalogo = texto(item === null || item === void 0 ? void 0 : item.catalogoId);
            if (catalogo)
                return "jutsu_catalogo_".concat(slugRegularizacao(catalogo)).slice(0, 170);
            var existente = texto((item === null || item === void 0 ? void 0 : item.id) || (item === null || item === void 0 ? void 0 : item.uuid));
            if (existente)
                return "jutsu_legado_id_".concat(slugRegularizacao(existente)).slice(0, 170);
            var assinatura = [texto(item === null || item === void 0 ? void 0 : item.nome), texto(item === null || item === void 0 ? void 0 : item.rank), texto(item === null || item === void 0 ? void 0 : item.elemento), texto(item === null || item === void 0 ? void 0 : item.categoria), texto(item === null || item === void 0 ? void 0 : item.tipoNome)].join("\u241f");
            return "jutsu_legado_".concat(slugRegularizacao((item === null || item === void 0 ? void 0 : item.nome) || "jutsu"), "_").concat(hashRegularizacao(assinatura)).slice(0, 170);
        }
        return "item_legado_".concat(hashRegularizacao(JSON.stringify(itemComparavelRegularizacao(collection, item))));
    }
    function normalizarListaLegada(colecao, itens) {
        var collection = texto(colecao), campoId = campoIdColecao(collection);
        var saida = (Array.isArray(itens) ? itens : []).filter(function (valor) { return valor && typeof valor === "object" && !Array.isArray(valor); }).map(function (valor) { return clonar(valor) || {}; });
        if (itemIdentity === null || itemIdentity === void 0 ? void 0 : itemIdentity.garantirIds) {
            itemIdentity.garantirIds(saida, { colecao: collection, campo: campoId, legado: true, gerarId: function () { return idAleatorio(collection || "item"); } });
        }
        else {
            var usados_1 = new Set();
            saida.forEach(function (item) {
                var id = texto(item[campoId]) || idLegadoRegularizacao(collection, item);
                if (usados_1.has(id)) {
                    var base = id.slice(0, 165) || "".concat(collection, "_legado");
                    var sufixo = 2;
                    while (usados_1.has("".concat(base, "_").concat(sufixo)))
                        sufixo += 1;
                    id = "".concat(base, "_").concat(sufixo).slice(0, 180);
                }
                item[campoId] = id;
                usados_1.add(id);
            });
        }
        saida.forEach(function (item, indice) {
            if ((collection === "jutsus" || collection === "armados" || collection === "kekkeiGenkai") && !Number.isFinite(Number(item.ordem)))
                item.ordem = indice;
        });
        return saida;
    }
    function extrairRealtimeRegularizacao(colecao, valor) {
        var collection = texto(colecao), ativos = [], deletados = new Set();
        var registros = valor && typeof valor === "object" && !Array.isArray(valor) ? valor : {};
        Object.values(registros).forEach(function (registro) {
            var _a;
            var id = texto(registro === null || registro === void 0 ? void 0 : registro.itemId);
            if (!id || texto(registro === null || registro === void 0 ? void 0 : registro.collection) !== collection)
                return;
            if (registro.deleted === true) {
                deletados.add(id);
                return;
            }
            var item;
            try {
                item = JSON.parse(String((_a = registro === null || registro === void 0 ? void 0 : registro.payload) !== null && _a !== void 0 ? _a : "null"));
            }
            catch (_e) {
                return;
            }
            if (!item || typeof item !== "object" || Array.isArray(item))
                return;
            item = normalizarItemColecao(collection, item, id);
            ativos.push(item);
        });
        return { ativos: ativos, deletados: deletados };
    }
    function novoIdColisaoRegularizacao(base, fingerprint, usados) {
        var raiz = (texto(base) || "item").slice(0, 145);
        var id = "".concat(raiz, "__rec_").concat(fingerprint).slice(0, 180), sufixo = 2;
        while (usados.has(id))
            id = "".concat(raiz, "__rec_").concat(fingerprint, "_").concat(sufixo++).slice(0, 180);
        return id;
    }
    function preservarLocaisRegularizacao(colecao, destino, origem) {
        var collection = texto(colecao);
        if (collection === "notas" && Object.prototype.hasOwnProperty.call(origem || {}, "aberto"))
            destino.aberto = Boolean(origem.aberto);
        if (collection === "jutsus") {
            if (Object.prototype.hasOwnProperty.call(origem || {}, "imagem"))
                destino.imagem = origem.imagem;
            if (Object.prototype.hasOwnProperty.call(origem || {}, "imagemId"))
                destino.imagemId = origem.imagemId;
            if (Number.isFinite(Number(origem === null || origem === void 0 ? void 0 : origem.ordem)))
                destino.ordem = Number(origem.ordem);
        }
    }
    function mesclarColecaoLegadaPura(colecao, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.local, local = _c === void 0 ? [] : _c, _d = _b.backup, backup = _d === void 0 ? [] : _d, _f = _b.realtime, realtime = _f === void 0 ? {} : _f;
        var collection = texto(colecao), campoId = campoIdColecao(collection);
        if (!colecaoPermitida(collection))
            return { items: [], toPublish: [], conflicts: 0, skippedDeleted: 0 };
        var localNorm = normalizarListaLegada(collection, local);
        var backupNorm = normalizarListaLegada(collection, backup);
        var rt = extrairRealtimeRegularizacao(collection, realtime);
        var rtNorm = normalizarListaLegada(collection, rt.ativos);
        var items = [], porId = new Map(), porFingerprint = new Map(), usados = new Set();
        var conflicts = 0, skippedDeleted = 0;
        var adicionar = function (item, origem) {
            var copia = clonar(item) || {};
            var id = texto(copia[campoId]) || idLegadoRegularizacao(collection, copia);
            if (origem !== "realtime" && rt.deletados.has(id)) {
                skippedDeleted += 1;
                return;
            }
            var fp = fingerprintRegularizacao(collection, copia);
            var igual = porFingerprint.get(fp);
            if (igual) {
                if (origem === "local")
                    preservarLocaisRegularizacao(collection, igual, copia);
                return;
            }
            var mesmoId = porId.get(id);
            if (mesmoId) {
                id = novoIdColisaoRegularizacao(id, fp, usados);
                copia[campoId] = id;
                conflicts += 1;
                fp = fingerprintRegularizacao(collection, copia);
            }
            else {
                copia[campoId] = id;
            }
            usados.add(id);
            porId.set(id, copia);
            porFingerprint.set(fp, copia);
            items.push(copia);
        };
        rtNorm.forEach(function (item) { return adicionar(item, "realtime"); });
        localNorm.forEach(function (item) { return adicionar(item, "local"); });
        backupNorm.forEach(function (item) { return adicionar(item, "backup"); });
        if (collection === "jutsus" || collection === "armados") {
            var ordemLocal_1 = new Map(localNorm.map(function (item, indice) { return [fingerprintRegularizacao(collection, item), indice]; }));
            items.sort(function (a, b) {
                var fa = fingerprintRegularizacao(collection, a), fb = fingerprintRegularizacao(collection, b);
                var oa = ordemLocal_1.has(fa) ? ordemLocal_1.get(fa) : 100000 + Number((a === null || a === void 0 ? void 0 : a.ordem) || 0);
                var ob = ordemLocal_1.has(fb) ? ordemLocal_1.get(fb) : 100000 + Number((b === null || b === void 0 ? void 0 : b.ordem) || 0);
                return oa - ob || texto(a[campoId]).localeCompare(texto(b[campoId]));
            });
            items.forEach(function (item, indice) { return item.ordem = indice; });
        }
        if (collection === "carteiraHistorico") {
            items.sort(function (a, b) {
                var da = Number((a === null || a === void 0 ? void 0 : a.data) || 0), db = Number((b === null || b === void 0 ? void 0 : b.data) || 0);
                if (da !== db)
                    return db - da;
                return texto(b === null || b === void 0 ? void 0 : b.id).localeCompare(texto(a === null || a === void 0 ? void 0 : a.id));
            });
            if (items.length > 40)
                items.splice(40);
        }
        var remotoPorId = new Map(rtNorm.map(function (item) { return [texto(item[campoId]), fingerprintRegularizacao(collection, item)]; }));
        var toPublish = [];
        items.forEach(function (item) {
            var id = texto(item[campoId]), fp = fingerprintRegularizacao(collection, item);
            if (!id || rt.deletados.has(id))
                return;
            if (remotoPorId.get(id) === fp)
                return;
            toPublish.push({ itemId: id, value: clonar(item) });
        });
        return { items: items, toPublish: toPublish, conflicts: conflicts, skippedDeleted: skippedDeleted };
    }
    function normalizarCarteiraRegularizacao(valor) {
        var origem = valor && typeof valor === "object" && !Array.isArray(valor) ? valor : {};
        var saida = {};
        ["pd", "po", "pp", "pc"].forEach(function (chave) { saida[chave] = Math.max(0, Number.parseInt(origem[chave], 10) || 0); });
        return saida;
    }
    function extrairCarteiraRealtimeRegularizacao(valor) {
        var registros = valor && typeof valor === "object" && !Array.isArray(valor) ? valor : {};
        var ativos = {}, deletados = new Set();
        Object.values(registros).forEach(function (registro) {
            var _a;
            var id = texto(registro === null || registro === void 0 ? void 0 : registro.itemId).toLowerCase();
            if (!["pd", "po", "pp", "pc"].includes(id) || texto(registro === null || registro === void 0 ? void 0 : registro.collection) !== "carteiraMoedas")
                return;
            if (registro.deleted === true) {
                deletados.add(id);
                return;
            }
            var item;
            try {
                item = JSON.parse(String((_a = registro === null || registro === void 0 ? void 0 : registro.payload) !== null && _a !== void 0 ? _a : "null"));
            }
            catch (_e) {
                return;
            }
            if (!item || typeof item !== "object" || Array.isArray(item) || texto(item.chave).toLowerCase() !== id)
                return;
            ativos[id] = Math.max(0, Number.parseInt(item.quantidade, 10) || 0);
        });
        return { ativos: ativos, deletados: deletados };
    }
    function regularizarCarteiraMoedasPura(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.local, local = _c === void 0 ? {} : _c, _d = _b.backup, backup = _d === void 0 ? {} : _d, _f = _b.realtime, realtime = _f === void 0 ? {} : _f;
        var localObj = local && typeof local === "object" && !Array.isArray(local) ? local : {};
        var backupObj = backup && typeof backup === "object" && !Array.isArray(backup) ? backup : {};
        var rt = extrairCarteiraRealtimeRegularizacao(realtime);
        var carteira = {}, toPublish = [];
        var exclusoesRespeitadas = 0;
        ["pd", "po", "pp", "pc"].forEach(function (chave) {
            if (Object.prototype.hasOwnProperty.call(rt.ativos, chave)) {
                carteira[chave] = rt.ativos[chave];
                return;
            }
            if (rt.deletados.has(chave)) {
                carteira[chave] = 0;
                exclusoesRespeitadas += 1;
                return;
            }
            var fonte = Object.prototype.hasOwnProperty.call(localObj, chave) ? localObj : backupObj;
            var quantidade = Math.max(0, Number.parseInt(fonte === null || fonte === void 0 ? void 0 : fonte[chave], 10) || 0);
            carteira[chave] = quantidade;
            toPublish.push({ itemId: chave, value: { chave: chave, quantidade: quantidade } });
        });
        return { carteira: carteira, toPublish: toPublish, total: 4, skippedDeleted: exclusoesRespeitadas };
    }
    var CAMPOS_LOCAIS_RESTAURACAO = new Set(["avatarNinja", "avatarNinjaId", "perfilFundoImagem", "perfilFundoImagemId"]);
    var CONFIG_RESTAURACAO_COLECOES = [
        { field: "notasTopicos", collection: "notas" },
        { field: "inventarioItens", collection: "inventario" },
        { field: "jutsus", collection: "jutsus" },
        { field: "armados", collection: "armados" },
        { field: "kekkeiGenkai", collection: "kekkeiGenkai" },
        { field: "carteiraHistorico", collection: "carteiraHistorico" },
        { field: "efeitosBatalhaAtivos", collection: "efeitosBatalha" }
    ];
    function maiorEditAtRealtimePuro(realtime) {
        var maior = 0;
        var visitar = function (valor) {
            if (!valor || typeof valor !== "object")
                return;
            if (Number.isFinite(Number(valor.editAt)))
                maior = Math.max(maior, Number(valor.editAt));
            Object.values(valor).forEach(function (filho) { if (filho && typeof filho === "object")
                visitar(filho); });
        };
        visitar(realtime || {});
        return maior;
    }
    function planejarRestauracaoAutoritativaPura(_a) {
        var e_1, _b, e_2, _c;
        var _d;
        var _f = _a === void 0 ? {} : _a, sheetId = _f.sheetId, sheetName = _f.sheetName, _g = _f.snapshot, snapshot = _g === void 0 ? {} : _g, _h = _f.realtime, realtime = _h === void 0 ? {} : _h, _j = _f.editAtBase, editAtBase = _j === void 0 ? 0 : _j, _k = _f.deviceId, deviceId = _k === void 0 ? "" : _k, _l = _f.uid, uid = _l === void 0 ? "" : _l;
        var dados = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) ? clonar(snapshot) : {};
        var rt = realtime && typeof realtime === "object" && !Array.isArray(realtime) ? realtime : {};
        var proximo = Math.max(Number(editAtBase || 0), maiorEditAtRealtimePuro(rt)) + 1;
        var novoEditAt = function () { return proximo++; };
        var fieldOps = [], collectionOps = [];
        var camposIguais = 0, itensIguais = 0;
        var camposDesejados = new Map();
        Object.keys(dados).forEach(function (campo) {
            if (!campoPermitido(campo) || campoGerenciadoPorColecao(campo) || CAMPOS_LOCAIS_RESTAURACAO.has(campo))
                return;
            camposDesejados.set(campo, dados[campo]);
        });
        var remotosCampos = rt.fields && typeof rt.fields === "object" ? rt.fields : {};
        var remotoCampoPorNome = new Map();
        Object.values(remotosCampos).forEach(function (registro) {
            var campo = texto(registro === null || registro === void 0 ? void 0 : registro.name);
            if (!campo || !campoPermitido(campo) || campoGerenciadoPorColecao(campo) || CAMPOS_LOCAIS_RESTAURACAO.has(campo))
                return;
            var anterior = remotoCampoPorNome.get(campo);
            if (!anterior || compararRegistros(registro, anterior) > 0)
                remotoCampoPorNome.set(campo, registro);
        });
        remotoCampoPorNome.forEach(function (registro, campo) {
            if (camposDesejados.has(campo) || (registro === null || registro === void 0 ? void 0 : registro.deleted) === true)
                return;
            fieldOps.push(criarOperacaoPura({ uid: uid, sheetId: sheetId, sheetName: sheetName, campo: campo, valor: undefined, editAt: novoEditAt(), deviceId: deviceId, opId: idAleatorio("restore_field") }));
        });
        camposDesejados.forEach(function (valor, campo) {
            var _a;
            var remoto = remotoCampoPorNome.get(campo);
            var payloadDesejado = JSON.stringify(normalizarValor(campo, valor));
            if (remoto && remoto.deleted !== true && String((_a = remoto.payload) !== null && _a !== void 0 ? _a : "null") === payloadDesejado) {
                camposIguais += 1;
                return;
            }
            fieldOps.push(criarOperacaoPura({ uid: uid, sheetId: sheetId, sheetName: sheetName, campo: campo, valor: valor, editAt: novoEditAt(), deviceId: deviceId, opId: idAleatorio("restore_field") }));
        });
        var remotasColecoes = rt.collections && typeof rt.collections === "object" ? rt.collections : {};
        var _loop_1 = function (config) {
            var collection = config.collection, campoId = campoIdColecao(collection);
            var desejados = normalizarListaLegada(collection, Array.isArray(dados[config.field]) ? dados[config.field] : []);
            var porId = new Map(desejados.map(function (item) { return [texto(item === null || item === void 0 ? void 0 : item[campoId]), item]; }).filter(function (_a) {
                var _b = __read(_a, 1), id = _b[0];
                return id;
            }));
            var remotos = remotasColecoes[collection] && typeof remotasColecoes[collection] === "object" ? remotasColecoes[collection] : {};
            var remotoPorId = new Map();
            Object.values(remotos).forEach(function (registro) {
                var itemId = texto(registro === null || registro === void 0 ? void 0 : registro.itemId);
                if (!itemId)
                    return;
                var anterior = remotoPorId.get(itemId);
                if (!anterior || compararRegistros(registro, anterior) > 0)
                    remotoPorId.set(itemId, registro);
            });
            remotoPorId.forEach(function (registro, itemId) {
                if (porId.has(itemId) || (registro === null || registro === void 0 ? void 0 : registro.deleted) === true)
                    return;
                collectionOps.push(criarOperacaoColecaoPura({ uid: uid, sheetId: sheetId, sheetName: sheetName, colecao: collection, itemId: itemId, deleted: true, identityKey: identityKeyRegistro(collection, registro), editAt: novoEditAt(), deviceId: deviceId, opId: idAleatorio("restore_item") }));
            });
            porId.forEach(function (item, itemId) {
                var _a;
                var remoto = remotoPorId.get(itemId);
                var payloadDesejado = JSON.stringify(normalizarItemColecao(collection, item, itemId));
                if (remoto && remoto.deleted !== true && String((_a = remoto.payload) !== null && _a !== void 0 ? _a : "null") === payloadDesejado) {
                    itensIguais += 1;
                    return;
                }
                collectionOps.push(criarOperacaoColecaoPura({ uid: uid, sheetId: sheetId, sheetName: sheetName, colecao: collection, itemId: itemId, valor: item, deleted: false, editAt: novoEditAt(), deviceId: deviceId, opId: idAleatorio("restore_item") }));
            });
        };
        try {
            for (var CONFIG_RESTAURACAO_COLECOES_1 = __values(CONFIG_RESTAURACAO_COLECOES), CONFIG_RESTAURACAO_COLECOES_1_1 = CONFIG_RESTAURACAO_COLECOES_1.next(); !CONFIG_RESTAURACAO_COLECOES_1_1.done; CONFIG_RESTAURACAO_COLECOES_1_1 = CONFIG_RESTAURACAO_COLECOES_1.next()) {
                var config = CONFIG_RESTAURACAO_COLECOES_1_1.value;
                _loop_1(config);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (CONFIG_RESTAURACAO_COLECOES_1_1 && !CONFIG_RESTAURACAO_COLECOES_1_1.done && (_b = CONFIG_RESTAURACAO_COLECOES_1.return)) _b.call(CONFIG_RESTAURACAO_COLECOES_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var carteira = normalizarCarteiraRegularizacao(dados.carteira || {});
        var moedasRemotas = remotasColecoes.carteiraMoedas && typeof remotasColecoes.carteiraMoedas === "object" ? remotasColecoes.carteiraMoedas : {};
        var moedaRemotaPorId = new Map();
        Object.values(moedasRemotas).forEach(function (registro) {
            var itemId = texto(registro === null || registro === void 0 ? void 0 : registro.itemId).toLowerCase();
            if (!["pd", "po", "pp", "pc"].includes(itemId))
                return;
            var anterior = moedaRemotaPorId.get(itemId);
            if (!anterior || compararRegistros(registro, anterior) > 0)
                moedaRemotaPorId.set(itemId, registro);
        });
        try {
            for (var _m = __values(["pd", "po", "pp", "pc"]), _o = _m.next(); !_o.done; _o = _m.next()) {
                var chave = _o.value;
                var valor = { chave: chave, quantidade: carteira[chave] };
                var remoto = moedaRemotaPorId.get(chave);
                var payloadDesejado = JSON.stringify(normalizarItemColecao("carteiraMoedas", valor, chave));
                if (remoto && remoto.deleted !== true && String((_d = remoto.payload) !== null && _d !== void 0 ? _d : "null") === payloadDesejado) {
                    itensIguais += 1;
                    continue;
                }
                collectionOps.push(criarOperacaoColecaoPura({
                    uid: uid,
                    sheetId: sheetId,
                    sheetName: sheetName,
                    colecao: "carteiraMoedas", itemId: chave,
                    valor: valor,
                    deleted: false, editAt: novoEditAt(),
                    deviceId: deviceId,
                    opId: idAleatorio("restore_item")
                }));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_o && !_o.done && (_c = _m.return)) _c.call(_m);
            }
            finally { if (e_2) throw e_2.error; }
        }
        /* Registros inválidos/legados com outra chave não são tocados: as regras atuais
           só aceitam as quatro moedas canônicas e os listeners ignoram qualquer outra. */
        return {
            fieldOps: fieldOps,
            collectionOps: collectionOps,
            camposIguais: camposIguais,
            itensIguais: itensIguais,
            maxPreviousEditAt: maiorEditAtRealtimePuro(rt), nextEditAt: proximo
        };
    }
    function enviarLoteRegularizacaoPuro(operacoes, enviar) {
        return __awaiter(this, void 0, void 0, function () {
            var lista, resultados, falhas, lista_1, lista_1_1, op, resultado, erro, erro_1, e_3_1;
            var e_3, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        lista = Array.isArray(operacoes) ? operacoes.filter(Boolean) : [];
                        if (typeof enviar !== "function")
                            throw new TypeError("Função de envio da regularização indisponível.");
                        resultados = [], falhas = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, 9, 10]);
                        lista_1 = __values(lista), lista_1_1 = lista_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!lista_1_1.done) return [3 /*break*/, 7];
                        op = lista_1_1.value;
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, enviar(op)];
                    case 4:
                        resultado = _b.sent();
                        if ((resultado === null || resultado === void 0 ? void 0 : resultado.ok) === false) {
                            erro = resultado.error || new Error("Operação recusada sem detalhe adicional.");
                            falhas.push({
                                collection: texto(op === null || op === void 0 ? void 0 : op.collection), itemId: texto(op === null || op === void 0 ? void 0 : op.itemId), opId: texto(op === null || op === void 0 ? void 0 : op.opId),
                                code: texto((erro === null || erro === void 0 ? void 0 : erro.code) || (resultado === null || resultado === void 0 ? void 0 : resultado.code)), message: texto((erro === null || erro === void 0 ? void 0 : erro.message) || (resultado === null || resultado === void 0 ? void 0 : resultado.message) || erro)
                            });
                        }
                        else {
                            resultados.push({ op: op, resultado: resultado });
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        erro_1 = _b.sent();
                        falhas.push({
                            collection: texto(op === null || op === void 0 ? void 0 : op.collection), itemId: texto(op === null || op === void 0 ? void 0 : op.itemId), opId: texto(op === null || op === void 0 ? void 0 : op.opId),
                            code: texto(erro_1 === null || erro_1 === void 0 ? void 0 : erro_1.code), message: texto((erro_1 === null || erro_1 === void 0 ? void 0 : erro_1.message) || erro_1)
                        });
                        return [3 /*break*/, 6];
                    case 6:
                        lista_1_1 = lista_1.next();
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_3_1 = _b.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (lista_1_1 && !lista_1_1.done && (_a = lista_1.return)) _a.call(lista_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/, { ok: falhas.length === 0, resultados: resultados, falhas: falhas }];
                }
            });
        });
    }
    function proximoEditAtPuro(timestampAtual, versaoAplicada, operacaoPendente, editAtSolicitado) {
        var base = Number(editAtSolicitado || timestampAtual || 0);
        var anterior = Number((versaoAplicada === null || versaoAplicada === void 0 ? void 0 : versaoAplicada.editAt) || 0);
        var pendente = Number((operacaoPendente === null || operacaoPendente === void 0 ? void 0 : operacaoPendente.editAt) || 0);
        return Math.max(base, anterior + 1, pendente + 1);
    }
    function proximoEditAtColecaoPuro(timestampAtual, versaoAplicada, operacaoPendente, editAtSolicitado) {
        return proximoEditAtPuro(timestampAtual, versaoAplicada, operacaoPendente, editAtSolicitado);
    }
    function mensagemFalhasRegularizacaoPura(falhas) {
        var lista = Array.isArray(falhas) ? falhas.filter(Boolean) : [];
        if (!lista.length)
            return "";
        var linhas = lista.slice(0, 3).map(function (falha) {
            var alvo = [texto(falha === null || falha === void 0 ? void 0 : falha.collection), texto(falha === null || falha === void 0 ? void 0 : falha.itemId)].filter(Boolean).join(" / ") || "item";
            var codigo = texto(falha === null || falha === void 0 ? void 0 : falha.code);
            var mensagem = texto(falha === null || falha === void 0 ? void 0 : falha.message) || "falha sem detalhe";
            return "".concat(alvo).concat(codigo ? " (".concat(codigo, ")") : "", ": ").concat(mensagem);
        });
        if (lista.length > 3)
            linhas.push("+ ".concat(lista.length - 3, " falha(s) adicional(is)"));
        return "A regulariza\u00E7\u00E3o consolidou os dados locais, mas ".concat(lista.length, " item(ns) n\u00E3o puderam ser publicados agora. Os itens que falharam continuam na fila para nova tentativa.\n\n").concat(linhas.join("\n"));
    }
    var test = {
        compararRegistros: compararRegistros,
        registroMaisNovo: registroMaisNovo,
        criarOperacaoPura: criarOperacaoPura,
        realtimeIdDaFicha: realtimeIdDaFicha,
        fichaPodeUsarRealtime: fichaPodeUsarRealtime,
        criarOperacaoColecaoPura: criarOperacaoColecaoPura,
        aplicarRegistroColecaoPuro: aplicarRegistroColecaoPuro,
        campoGerenciadoPorColecao: campoGerenciadoPorColecao,
        colecaoPermitida: colecaoPermitida,
        mesclarColecaoLegadaPura: mesclarColecaoLegadaPura,
        fingerprintRegularizacao: fingerprintRegularizacao,
        normalizarListaLegada: normalizarListaLegada,
        regularizarCarteiraMoedasPura: regularizarCarteiraMoedasPura,
        enviarLoteRegularizacaoPuro: enviarLoteRegularizacaoPuro,
        mensagemFalhasRegularizacaoPura: mensagemFalhasRegularizacaoPura,
        proximoEditAtPuro: proximoEditAtPuro,
        proximoEditAtColecaoPuro: proximoEditAtColecaoPuro,
        planejarRestauracaoAutoritativaPura: planejarRestauracaoAutoritativaPura,
        itemIdParaChaveFirebasePura: itemIdParaChaveFirebasePura,
        identityKeyRegistro: identityKeyRegistro
    };
    function install() {
        var _a, _b;
        if (!root || !root.document || root.__ekoRealtimeLazyV2)
            return false;
        root.__ekoRealtimeLazyV2 = true;
        if (!util || !root.ShinobiOnline) {
            console.warn("Realtime lazy aguardando dependências.");
            return false;
        }
        var offsetSalvo = Number((_a = root.localStorage) === null || _a === void 0 ? void 0 : _a.getItem(CHAVE_SERVER_OFFSET));
        var estadoRT = {
            bootLiberado: false,
            uid: "",
            listener: null,
            listenerNotas: null,
            listenerInventario: null,
            listenerJutsus: null,
            listenerArmados: null,
            listenerKekkeiGenkai: null,
            listenerCarteiraMoedas: null,
            listenerCarteiraHistorico: null,
            listenerEfeitosBatalha: null,
            offset: Number.isFinite(offsetSalvo) ? offsetSalvo : 0,
            offsetConhecido: Number.isFinite(offsetSalvo),
            offsetRef: null,
            offsetCallback: null,
            convergencia: null,
            processando: false,
            reprocessar: false,
            timerAtivacao: null
        };
        function usuarioAtual() {
            var _a, _b, _c;
            var u = (_c = (_b = (_a = root.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.snapshot) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.user;
            return u && !u.anonymous ? u : null;
        }
        function uidAtual() { var _a; return texto((_a = usuarioAtual()) === null || _a === void 0 ? void 0 : _a.uid); }
        function deviceId() {
            var id = "";
            try {
                id = root.localStorage.getItem(CHAVE_DEVICE) || "";
            }
            catch (_e) { }
            if (!id) {
                id = idAleatorio("device");
                try {
                    root.localStorage.setItem(CHAVE_DEVICE, id);
                }
                catch (_e) { }
            }
            return id;
        }
        function banco() {
            var _a, _b;
            try {
                return ((_b = (_a = root.firebase) === null || _a === void 0 ? void 0 : _a.apps) === null || _b === void 0 ? void 0 : _b.length) ? root.firebase.app().database() : null;
            }
            catch (_e) {
                return null;
            }
        }
        function chaveConta(base, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            return uid ? "".concat(base, "__").concat(uid) : "";
        }
        function lerJson(chave, padrao) {
            if (padrao === void 0) { padrao = {}; }
            try {
                var raw = root.localStorage.getItem(chave);
                return raw ? JSON.parse(raw) : padrao;
            }
            catch (_e) {
                return padrao;
            }
        }
        function salvarJson(chave, valor) { if (!chave)
            return; try {
            root.localStorage.setItem(chave, JSON.stringify(valor));
        }
        catch (_e) { } }
        function lerOutbox(uid) {
            if (uid === void 0) { uid = uidAtual(); }
            return lerJson(chaveConta(CHAVE_OUTBOX_BASE, uid), {});
        }
        function salvarOutbox(valor, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            salvarJson(chaveConta(CHAVE_OUTBOX_BASE, uid), valor || {});
        }
        function lerVersoes(uid) {
            if (uid === void 0) { uid = uidAtual(); }
            return lerJson(chaveConta(CHAVE_VERSOES_BASE, uid), {});
        }
        function salvarVersoes(valor, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            salvarJson(chaveConta(CHAVE_VERSOES_BASE, uid), valor || {});
        }
        function chaveOperacao(sheetId, campo) { return "".concat(texto(sheetId), "::").concat(campoParaChave(campo)); }
        function timestampEdicao() { return agora() + (estadoRT.offsetConhecido ? Number(estadoRT.offset || 0) : 0); }
        function obterFichaAtiva(preparar) {
            var _a, _b, _c, _d, _f, _g, _h, _j;
            if (preparar === void 0) { preparar = false; }
            try {
                var atual = (_b = (_a = root.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.fichaAtualLocal) === null || _b === void 0 ? void 0 : _b.call(_a);
                var nomeAtivo = texto(((_c = root.localStorage) === null || _c === void 0 ? void 0 : _c.getItem("ficha_ninja_ativa_v1")) || (atual === null || atual === void 0 ? void 0 : atual.name) || "Principal");
                var gerenciada = (_f = (_d = root.EkoSheetManager) === null || _d === void 0 ? void 0 : _d.obterFichaPorNome) === null || _f === void 0 ? void 0 : _f.call(_d, nomeAtivo);
                if ((_g = gerenciada === null || gerenciada === void 0 ? void 0 : gerenciada.physicalKeys) === null || _g === void 0 ? void 0 : _g.length)
                    atual = gerenciada;
                if (!atual)
                    return null;
                if (!fichaPodeUsarRealtime(atual))
                    return atual;
                if (preparar && uidAtual()) {
                    return ((_j = (_h = root.ShinobiOnline) === null || _h === void 0 ? void 0 : _h.garantirIdentidadeFichaRealtime) === null || _j === void 0 ? void 0 : _j.call(_h, atual.name)) || atual;
                }
                return atual;
            }
            catch (_e) {
                return null;
            }
        }
        function obterFichaSolicitada(localSheetName, preparar) {
            var _a, _b, _c, _d;
            if (localSheetName === void 0) { localSheetName = ""; }
            if (preparar === void 0) { preparar = false; }
            var nome = texto(localSheetName);
            if (!nome)
                return obterFichaAtiva(preparar);
            try {
                var locais = ((_b = (_a = root.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.listarFichasLocais) === null || _b === void 0 ? void 0 : _b.call(_a)) || [];
                var ficha = locais.find(function (item) { return texto(item === null || item === void 0 ? void 0 : item.name) === nome; }) || null;
                if (!ficha)
                    return null;
                if (!fichaPodeUsarRealtime(ficha))
                    return ficha;
                if (preparar && uidAtual()) {
                    /* Nome aqui é apenas a chave local explicitamente recebida do evento.
                       Se ela deixou de existir, falhamos fechado; nunca caímos na ficha
                       que por acaso ficou ativa depois de uma troca/exclusão. */
                    return ((_d = (_c = root.ShinobiOnline) === null || _c === void 0 ? void 0 : _c.garantirIdentidadeFichaRealtime) === null || _d === void 0 ? void 0 : _d.call(_c, nome)) || null;
                }
                return ficha;
            }
            catch (_e) {
                return null;
            }
        }
        function registrarVersao(sheetId, campo, registro, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            if (!uid || !sheetId || !campo || !registro)
                return;
            var todos = lerVersoes(uid);
            todos[sheetId] = todos[sheetId] && typeof todos[sheetId] === "object" ? todos[sheetId] : {};
            todos[sheetId][campoParaChave(campo)] = { editAt: Number(registro.editAt || 0), opId: texto(registro.opId) };
            salvarVersoes(todos, uid);
        }
        function versaoAplicada(sheetId, campo, uid) {
            var _a, _b;
            if (uid === void 0) { uid = uidAtual(); }
            return ((_b = (_a = lerVersoes(uid)) === null || _a === void 0 ? void 0 : _a[sheetId]) === null || _b === void 0 ? void 0 : _b[campoParaChave(campo)]) || null;
        }
        function adicionarOutbox(op, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            if (!uid || !(op === null || op === void 0 ? void 0 : op.sheetId) || !campoPermitido(op === null || op === void 0 ? void 0 : op.name))
                return;
            var todos = lerOutbox(uid);
            var chave = chaveOperacao(op.sheetId, op.name);
            var anterior = todos[chave];
            if (!anterior || compararRegistros(op, anterior) >= 0)
                todos[chave] = op;
            salvarOutbox(todos, uid);
        }
        function removerOutbox(op, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            if (!uid || !(op === null || op === void 0 ? void 0 : op.sheetId) || !(op === null || op === void 0 ? void 0 : op.name))
                return;
            var todos = lerOutbox(uid), chave = chaveOperacao(op.sheetId, op.name), atual = todos[chave];
            if (!atual)
                return;
            if (op.opId && texto(atual.opId) !== texto(op.opId))
                return;
            delete todos[chave];
            salvarOutbox(todos, uid);
        }
        function operacaoPendente(sheetId, campo, uid) {
            var _a;
            if (uid === void 0) { uid = uidAtual(); }
            return ((_a = lerOutbox(uid)) === null || _a === void 0 ? void 0 : _a[chaveOperacao(sheetId, campo)]) || null;
        }
        function chaveOperacaoColecao(sheetId, colecao, itemId) {
            return "".concat(texto(sheetId), "::").concat(texto(colecao), "::").concat(campoParaChave(itemId));
        }
        function lerOutboxColecoes(uid) {
            if (uid === void 0) { uid = uidAtual(); }
            return lerJson(chaveConta(CHAVE_COLECAO_OUTBOX_BASE, uid), {});
        }
        function salvarOutboxColecoes(valor, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            salvarJson(chaveConta(CHAVE_COLECAO_OUTBOX_BASE, uid), valor || {});
        }
        function lerQuarentenaColecoes(uid) {
            if (uid === void 0) { uid = uidAtual(); }
            return lerJson(chaveConta(CHAVE_COLECAO_QUARENTENA_BASE, uid), {});
        }
        function salvarQuarentenaColecoes(valor, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            salvarJson(chaveConta(CHAVE_COLECAO_QUARENTENA_BASE, uid), valor || {});
        }
        function quarentenarOperacaoColecao(op, erro, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            if (!uid || !op)
                return;
            var todos = lerQuarentenaColecoes(uid);
            var chave = chaveOperacaoColecao(op.sheetId, op.collection, op.itemId || op.opId || idAleatorio("invalid"));
            todos[chave] = __assign(__assign({}, clonar(op)), { quarantinedAt: agora(), errorCode: texto((erro === null || erro === void 0 ? void 0 : erro.code) || "shinobi/invalid-item-id"), errorMessage: texto((erro === null || erro === void 0 ? void 0 : erro.message) || erro) });
            salvarQuarentenaColecoes(todos, uid);
            removerOutboxColecao(op, uid);
        }
        function lerVersoesColecoes(uid) {
            if (uid === void 0) { uid = uidAtual(); }
            return lerJson(chaveConta(CHAVE_COLECAO_VERSOES_BASE, uid), {});
        }
        function salvarVersoesColecoes(valor, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            salvarJson(chaveConta(CHAVE_COLECAO_VERSOES_BASE, uid), valor || {});
        }
        function registrarVersaoColecao(sheetId, colecao, itemId, registro, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            if (!uid || !sheetId || !colecao || !itemId || !registro)
                return;
            var todos = lerVersoesColecoes(uid);
            todos[chaveOperacaoColecao(sheetId, colecao, itemId)] = { editAt: Number(registro.editAt || 0), opId: texto(registro.opId) };
            salvarVersoesColecoes(todos, uid);
        }
        function versaoColecaoAplicada(sheetId, colecao, itemId, uid) {
            var _a;
            if (uid === void 0) { uid = uidAtual(); }
            return ((_a = lerVersoesColecoes(uid)) === null || _a === void 0 ? void 0 : _a[chaveOperacaoColecao(sheetId, colecao, itemId)]) || null;
        }
        function adicionarOutboxColecao(op, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            if (!uid || !(op === null || op === void 0 ? void 0 : op.sheetId) || !colecaoPermitida(op === null || op === void 0 ? void 0 : op.collection) || !texto(op === null || op === void 0 ? void 0 : op.itemId))
                return;
            var todos = lerOutboxColecoes(uid), chave = chaveOperacaoColecao(op.sheetId, op.collection, op.itemId), anterior = todos[chave];
            if (!anterior || compararRegistros(op, anterior) >= 0)
                todos[chave] = op;
            salvarOutboxColecoes(todos, uid);
        }
        function removerOutboxColecao(op, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            if (!uid || !(op === null || op === void 0 ? void 0 : op.sheetId) || !(op === null || op === void 0 ? void 0 : op.collection) || !(op === null || op === void 0 ? void 0 : op.itemId))
                return;
            var todos = lerOutboxColecoes(uid), chave = chaveOperacaoColecao(op.sheetId, op.collection, op.itemId), atual = todos[chave];
            if (!atual)
                return;
            if (op.opId && texto(atual.opId) !== texto(op.opId))
                return;
            delete todos[chave];
            salvarOutboxColecoes(todos, uid);
        }
        function operacaoColecaoPendente(sheetId, colecao, itemId, uid) {
            var _a;
            if (uid === void 0) { uid = uidAtual(); }
            return ((_a = lerOutboxColecoes(uid)) === null || _a === void 0 ? void 0 : _a[chaveOperacaoColecao(sheetId, colecao, itemId)]) || null;
        }
        function temPendencias(sheetId, uid) {
            if (sheetId === void 0) { sheetId = ""; }
            if (uid === void 0) { uid = uidAtual(); }
            var id = texto(sheetId);
            var campos = Object.values(lerOutbox(uid)).some(function (op) { return !id || texto(op === null || op === void 0 ? void 0 : op.sheetId) === id; });
            var colecoes = Object.values(lerOutboxColecoes(uid)).some(function (op) { return !id || texto(op === null || op === void 0 ? void 0 : op.sheetId) === id; });
            return campos || colecoes;
        }
        function registroParaFirebase(op) {
            var _a;
            var registro = {
                name: op.name,
                deleted: op.deleted === true,
                editAt: Number(op.editAt || 0),
                serverUpdatedAt: root.firebase.database.ServerValue.TIMESTAMP,
                deviceId: texto(op.deviceId),
                opId: texto(op.opId)
            };
            if (!registro.deleted)
                registro.payload = String((_a = op.payload) !== null && _a !== void 0 ? _a : "null");
            return registro;
        }
        function registroColecaoParaFirebase(op) {
            var _a;
            var registro = {
                collection: texto(op.collection), itemId: texto(op.itemId), deleted: op.deleted === true,
                editAt: Number(op.editAt || 0), serverUpdatedAt: root.firebase.database.ServerValue.TIMESTAMP,
                deviceId: texto(op.deviceId), opId: texto(op.opId)
            };
            var identidade = texto(op.identityKey);
            if (identidade)
                registro.identityKey = identidade.slice(0, 180);
            if (!registro.deleted)
                registro.payload = String((_a = op.payload) !== null && _a !== void 0 ? _a : "null");
            return registro;
        }
        function parsePayload(campo, registro, localAtual) {
            var _a;
            if ((registro === null || registro === void 0 ? void 0 : registro.deleted) === true)
                return { deletar: true, valor: undefined };
            var valor = null;
            try {
                valor = JSON.parse(String((_a = registro === null || registro === void 0 ? void 0 : registro.payload) !== null && _a !== void 0 ? _a : "null"));
            }
            catch (_e) {
                return { invalido: true };
            }
            if (util === null || util === void 0 ? void 0 : util.mesclarValorRemoto)
                valor = util.mesclarValorRemoto(campo, valor, localAtual);
            return { valor: valor };
        }
        function atualizarUi(campos, dados) {
            var _a, _b, _c, _d;
            var lista = __spreadArray([], __read(new Set((campos || []).map(texto).filter(Boolean))), false);
            if (!lista.length)
                return;
            var conjunto = new Set(lista);
            try {
                root.document.querySelectorAll("[data-save]").forEach(function (el) {
                    var campo = texto(el.dataset.save);
                    if (!conjunto.has(campo) || el.dataset.shinobiEdicaoPendente === "1")
                        return;
                    var valor = dados === null || dados === void 0 ? void 0 : dados[campo];
                    if (el.type === "checkbox")
                        el.checked = Boolean(valor);
                    else
                        el.value = valor == null ? "" : String(valor);
                    try {
                        if (typeof root.shinobiSerializarValorCampo === "function" && typeof root.shinobiValorCampo === "function") {
                            el.dataset.shinobiValorConfirmado = root.shinobiSerializarValorCampo(root.shinobiValorCampo(el));
                        }
                    }
                    catch (_e) { }
                });
            }
            catch (_e) { }
            var bonusCombateMap = {
                batalhaBonusForca: '[data-bonus-batalha="forca"]',
                batalhaBonusDestreza: '[data-bonus-batalha="destreza"]',
                batalhaBonusConstituicao: '[data-bonus-batalha="constituicao"]',
                batalhaBonusInteligencia: '[data-bonus-batalha="inteligencia"]',
                batalhaBonusSabedoria: '[data-bonus-batalha="sabedoria"]',
                batalhaBonusCarisma: '[data-bonus-batalha="carisma"]',
                batalhaBonusCA: '[data-bonus-defesa-batalha="ca"]',
                batalhaBonusCD: '[data-bonus-defesa-batalha="cd"]'
            };
            var atualizouBonusCombate = false;
            try {
                lista.forEach(function (campo) {
                    var _a;
                    var seletor = bonusCombateMap[campo];
                    if (!seletor)
                        return;
                    var input = root.document.querySelector(seletor);
                    if (!input)
                        return;
                    input.value = String((_a = dados === null || dados === void 0 ? void 0 : dados[campo]) !== null && _a !== void 0 ? _a : 0);
                    atualizouBonusCombate = true;
                });
            }
            catch (_e) { }
            var chamar = function (nome) { try {
                if (typeof root[nome] === "function")
                    root[nome]();
            }
            catch (_e) { } };
            if (atualizouBonusCombate) {
                chamar("atualizarModsBatalhaComBonus");
                chamar("atualizarDefesasTotaisBatalha");
                chamar("atualizarBonusBatalhaCompacto");
            }
            if (conjunto.has("notasTopicos") || conjunto.has("notas"))
                chamar("renderizarTopicosNotas");
            if (conjunto.has("inventarioItens") || conjunto.has("inventario") || conjunto.has("carteira") || conjunto.has("carteiraHistorico"))
                chamar("renderizarInventario");
            if (conjunto.has("jutsus"))
                chamar("renderizarJutsus");
            if (conjunto.has("armados"))
                chamar("renderizarArmados");
            if (conjunto.has("kekkeiGenkai"))
                chamar("renderizarKekkeiGenkai");
            if (conjunto.has("resistenciasEscolhidas"))
                chamar("renderizarResistenciasBatalha");
            if (conjunto.has("bonusAtivos") || conjunto.has("bonusCA"))
                chamar("atualizarBonusGeralRealtime");
            if (conjunto.has("efeitosBatalhaAtivos")) {
                try {
                    (_b = (_a = root.EfeitosJutsuShinobi) === null || _a === void 0 ? void 0 : _a.atualizar) === null || _b === void 0 ? void 0 : _b.call(_a);
                }
                catch (_e) { }
                chamar("atualizarHUD");
                chamar("atualizarDefesasTotaisBatalha");
            }
            if (conjunto.has("progressaoFixa")) {
                try {
                    (_d = (_c = root.shinobiLevelUp) === null || _c === void 0 ? void 0 : _c.refresh) === null || _d === void 0 ? void 0 : _d.call(_c);
                }
                catch (_e) { }
            }
            if (lista.some(function (c) { return ["katon", "raiton", "fuuton", "suiton", "doton", "yin", "yang", "atributoConjuracaoNatureza"].includes(c); })) {
                chamar("renderizarNaturezas");
                chamar("renderizarJutsus");
                chamar("renderizarResistenciasBatalha");
                chamar("atualizarPerfil");
            }
            if (lista.some(function (c) { return ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma", "ca", "cd", "proficiencia"].includes(c) || c.startsWith("p_"); })) {
                chamar("atualizarModificadoresBatalha");
                chamar("atualizarBonusPericias");
                chamar("atualizarDefesasTotaisBatalha");
            }
            if (lista.some(function (c) { return ["pv", "pvMax", "chakra", "chakraMax", "xp", "nivel", "nome", "rank", "ca", "cd"].includes(c); })) {
                chamar("atualizarPlacar");
                chamar("atualizarHUD");
                chamar("atualizarPerfil");
            }
        }
        var camposUiPendentes = new Set();
        var dadosUiPendentes = null;
        var frameUiPendente = 0;
        function agendarAtualizacaoUi(campos, dados) {
            (campos || []).forEach(function (campo) { var nome = texto(campo); if (nome)
                camposUiPendentes.add(nome); });
            dadosUiPendentes = dados;
            if (frameUiPendente)
                return;
            var executar = function () {
                frameUiPendente = 0;
                var lista = __spreadArray([], __read(camposUiPendentes), false);
                camposUiPendentes.clear();
                var snapshot = dadosUiPendentes;
                dadosUiPendentes = null;
                if (lista.length)
                    atualizarUi(lista, snapshot);
            };
            if (typeof root.requestAnimationFrame === "function")
                frameUiPendente = root.requestAnimationFrame(executar);
            else
                frameUiPendente = root.setTimeout(executar, 16);
        }
        function aplicarSnapshotCampos(sheetId, valor) {
            var e_4, _a;
            var _b, _c;
            var uid = uidAtual();
            var fichaBase = obterFichaAtiva(false);
            if (!fichaPodeUsarRealtime(fichaBase))
                return [];
            var ficha = fichaBase ? ((_c = (_b = root.ShinobiOnline) === null || _b === void 0 ? void 0 : _b.garantirIdentidadeFichaRealtime) === null || _c === void 0 ? void 0 : _c.call(_b, fichaBase.name)) || fichaBase : null;
            if (!uid || !ficha || !fichaPodeUsarRealtime(ficha) || realtimeIdDaFicha(ficha) !== texto(sheetId))
                return [];
            var dados = {};
            try {
                dados = JSON.parse(root.localStorage.getItem(ficha.key) || "{}");
            }
            catch (_e) {
                dados = clonar(ficha.data || {});
            }
            if (!dados || typeof dados !== "object" || Array.isArray(dados))
                dados = {};
            var aplicados = [];
            var registros = valor && typeof valor === "object" ? valor : {};
            try {
                for (var _d = __values(Object.entries(registros)), _f = _d.next(); !_f.done; _f = _d.next()) {
                    var _g = __read(_f.value, 2), chave = _g[0], registro = _g[1];
                    var campo = texto(registro === null || registro === void 0 ? void 0 : registro.name) || ((util === null || util === void 0 ? void 0 : util.chaveParaCampo) ? util.chaveParaCampo(chave) : "");
                    if (!registro || !campoPermitido(campo) || texto(registro.name) !== campo)
                        continue;
                    /* Campos migrados para collections/{colecao}/{itemId} não podem mais ser
                       reaplicados pelo registro legado em fields, senão um array antigo pode
                       sobrescrever o merge item-level. */
                    if (campoGerenciadoPorColecao(campo))
                        continue;
                    var anterior = versaoAplicada(sheetId, campo, uid);
                    if (anterior && compararRegistros(registro, anterior) <= 0)
                        continue;
                    var pendente = operacaoPendente(sheetId, campo, uid);
                    if (pendente && compararRegistros(pendente, registro) > 0)
                        continue;
                    if (pendente && compararRegistros(registro, pendente) >= 0)
                        removerOutbox(pendente, uid);
                    var parsed = parsePayload(campo, registro, dados[campo]);
                    if (parsed.invalido)
                        continue;
                    if (parsed.deletar)
                        delete dados[campo];
                    else
                        dados[campo] = clonar(parsed.valor);
                    try {
                        if (typeof estado !== "undefined" && estado && typeof estado === "object") {
                            if (parsed.deletar)
                                delete estado[campo];
                            else
                                estado[campo] = clonar(parsed.valor);
                        }
                    }
                    catch (_e) { }
                    registrarVersao(sheetId, campo, registro, uid);
                    aplicados.push(campo);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_4) throw e_4.error; }
            }
            if (aplicados.length) {
                try {
                    root.localStorage.setItem(ficha.key, JSON.stringify(dados));
                }
                catch (_e) { }
                agendarAtualizacaoUi(aplicados, dados);
                try {
                    root.dispatchEvent(new CustomEvent("shinobi:realtime-aplicado", { detail: { sheetId: sheetId, campos: aplicados } }));
                }
                catch (_e) { }
            }
            return aplicados;
        }
        function campoLocalDaColecao(colecao) {
            var collection = texto(colecao);
            if (collection === "notas")
                return "notasTopicos";
            if (collection === "inventario")
                return "inventarioItens";
            if (collection === "jutsus")
                return "jutsus";
            if (collection === "armados")
                return "armados";
            if (collection === "kekkeiGenkai")
                return "kekkeiGenkai";
            if (collection === "carteiraMoedas")
                return "carteira";
            if (collection === "carteiraHistorico")
                return "carteiraHistorico";
            if (collection === "efeitosBatalha")
                return "efeitosBatalhaAtivos";
            return "";
        }
        function aplicarSnapshotColecao(sheetId, colecao, valor) {
            var e_5, _a;
            var _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            var uid = uidAtual(), collection = texto(colecao), campoLocal = campoLocalDaColecao(collection);
            if (!uid || !colecaoPermitida(collection) || !campoLocal)
                return [];
            var fichaBase = obterFichaAtiva(false);
            if (!fichaPodeUsarRealtime(fichaBase))
                return [];
            var ficha = fichaBase ? ((_c = (_b = root.ShinobiOnline) === null || _b === void 0 ? void 0 : _b.garantirIdentidadeFichaRealtime) === null || _c === void 0 ? void 0 : _c.call(_b, fichaBase.name)) || fichaBase : null;
            if (!ficha || !fichaPodeUsarRealtime(ficha) || realtimeIdDaFicha(ficha) !== texto(sheetId))
                return [];
            if (collection === "notas") {
                try {
                    (_d = root.garantirTopicosNotas) === null || _d === void 0 ? void 0 : _d.call(root);
                }
                catch (_e) { }
            }
            if (collection === "inventario") {
                try {
                    (_g = (_f = root.ShinobiInventarioItemLevel) === null || _f === void 0 ? void 0 : _f.garantirEstado) === null || _g === void 0 ? void 0 : _g.call(_f);
                }
                catch (_e) { }
            }
            if (collection === "jutsus") {
                try {
                    (_j = (_h = root.ShinobiJutsusItemLevel) === null || _h === void 0 ? void 0 : _h.garantirEstado) === null || _j === void 0 ? void 0 : _j.call(_h);
                }
                catch (_e) { }
            }
            if (collection === "armados") {
                try {
                    (_l = (_k = root.ShinobiArmadosItemLevel) === null || _k === void 0 ? void 0 : _k.garantirEstado) === null || _l === void 0 ? void 0 : _l.call(_k);
                }
                catch (_e) { }
            }
            if (collection === "kekkeiGenkai") {
                try {
                    (_o = (_m = root.ShinobiKekkeiItemLevel) === null || _m === void 0 ? void 0 : _m.garantirEstado) === null || _o === void 0 ? void 0 : _o.call(_m);
                }
                catch (_e) { }
            }
            if (collection === "carteiraMoedas" || collection === "carteiraHistorico") {
                try {
                    (_q = (_p = root.ShinobiWalletItemLevel) === null || _p === void 0 ? void 0 : _p.garantirEstado) === null || _q === void 0 ? void 0 : _q.call(_p);
                }
                catch (_e) { }
            }
            var dados = {};
            try {
                dados = JSON.parse(root.localStorage.getItem(ficha.key) || "{}");
            }
            catch (_e) {
                dados = clonar(ficha.data || {});
            }
            if (!dados || typeof dados !== "object" || Array.isArray(dados))
                dados = {};
            var itens = collection === "carteiraMoedas"
                ? (dados[campoLocal] && typeof dados[campoLocal] === "object" && !Array.isArray(dados[campoLocal]) ? clonar(dados[campoLocal]) : { pd: 0, po: 0, pp: 0, pc: 0 })
                : (Array.isArray(dados[campoLocal]) ? clonar(dados[campoLocal]) : []);
            var alterados = new Set(), registros = valor && typeof valor === "object" ? valor : {};
            try {
                for (var _r = __values(Object.entries(registros)), _s = _r.next(); !_s.done; _s = _r.next()) {
                    var _t = __read(_s.value, 2), chave = _t[0], registro = _t[1];
                    var itemId = texto(registro === null || registro === void 0 ? void 0 : registro.itemId) || ((util === null || util === void 0 ? void 0 : util.chaveParaCampo) ? util.chaveParaCampo(chave) : texto(chave));
                    if (!registro || texto(registro.collection) !== collection || !itemId || texto(registro.itemId) !== itemId)
                        continue;
                    /* O ID permanente é a única identidade autoritativa do realtime.
                       A v100 tentou reconciliar IDs diferentes por uma assinatura semântica
                       (nome/rank/catalogo etc.). Isso podia transformar um tombstone antigo
                       no ID de um jutsu local e apagar justamente o objeto que guardava a
                       imagem local. Assinaturas continuam nos registros para diagnóstico,
                       mas nunca mais renomeiam um item automaticamente. */
                    var anterior = versaoColecaoAplicada(sheetId, collection, itemId, uid);
                    if (anterior && compararRegistros(registro, anterior) <= 0)
                        continue;
                    var pendente = operacaoColecaoPendente(sheetId, collection, itemId, uid);
                    if (pendente && compararRegistros(pendente, registro) > 0)
                        continue;
                    if (pendente && compararRegistros(registro, pendente) >= 0)
                        removerOutboxColecao(pendente, uid);
                    itens = aplicarRegistroColecaoPuro(collection, itens, itemId, registro);
                    registrarVersaoColecao(sheetId, collection, itemId, registro, uid);
                    alterados.add(itemId);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_s && !_s.done && (_a = _r.return)) _a.call(_r);
                }
                finally { if (e_5) throw e_5.error; }
            }
            var aplicados = __spreadArray([], __read(alterados), false);
            if (aplicados.length) {
                dados[campoLocal] = clonar(itens);
                try {
                    if (typeof estado !== "undefined" && estado && typeof estado === "object") {
                        estado[campoLocal] = clonar(itens);
                        if (collection === "jutsus")
                            estado.jutsusAbertos = {};
                        if (collection === "armados")
                            estado.ataquesAbertos = {};
                    }
                }
                catch (_e) { }
                try {
                    root.localStorage.setItem(ficha.key, JSON.stringify(dados));
                }
                catch (_e) { }
                agendarAtualizacaoUi([campoLocal], dados);
                try {
                    root.dispatchEvent(new CustomEvent("shinobi:realtime-colecao-aplicada", { detail: { sheetId: sheetId, collection: collection, itemIds: aplicados } }));
                }
                catch (_e) { }
            }
            return aplicados;
        }
        var CHAVES_CONVERGENCIA = ["fields", "notas", "inventario", "jutsus", "armados", "kekkeiGenkai", "carteiraMoedas", "carteiraHistorico", "efeitosBatalha"];
        function finalizarConvergencia(resultado) {
            var _a;
            var atual = estadoRT.convergencia;
            if (!atual || atual.concluida)
                return;
            atual.concluida = true;
            atual.resultado = resultado || { ok: true, sheetId: atual.sheetId };
            try {
                (_a = atual.resolve) === null || _a === void 0 ? void 0 : _a.call(atual, atual.resultado);
            }
            catch (_e) { }
        }
        function iniciarConvergencia(uid, sheetId) {
            if (estadoRT.convergencia && !estadoRT.convergencia.concluida) {
                finalizarConvergencia({ ok: false, reason: "listener-substituido", sheetId: estadoRT.convergencia.sheetId });
            }
            var resolve;
            var promise = new Promise(function (res) { resolve = res; });
            estadoRT.convergencia = { uid: uid, sheetId: sheetId, pendentes: new Set(CHAVES_CONVERGENCIA), concluida: false, resultado: null, promise: promise, resolve: resolve };
        }
        function marcarConvergencia(sheetId, chave) {
            var atual = estadoRT.convergencia;
            if (!atual || atual.concluida || texto(atual.sheetId) !== texto(sheetId))
                return;
            atual.pendentes.delete(chave);
            if (!atual.pendentes.size)
                finalizarConvergencia({ ok: true, sheetId: atual.sheetId });
        }
        function aguardarConvergenciaAtual() {
            return __awaiter(this, arguments, void 0, function (_a) {
                var ativacao, atual, limite;
                var _b = _a === void 0 ? {} : _a, _c = _b.timeoutMs, timeoutMs = _c === void 0 ? 8000 : _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            if (!estadoRT.bootLiberado)
                                return [2 /*return*/, { ok: false, reason: "boot-ainda-nao-liberado" }];
                            return [4 /*yield*/, ativarFichaAtual()];
                        case 1:
                            ativacao = _d.sent();
                            if ((ativacao === null || ativacao === void 0 ? void 0 : ativacao.ok) !== true)
                                return [2 /*return*/, ativacao || { ok: false, reason: "ficha-indisponivel" }];
                            atual = estadoRT.convergencia;
                            if (!atual || atual.concluida)
                                return [2 /*return*/, (atual === null || atual === void 0 ? void 0 : atual.resultado) || { ok: true, sheetId: ativacao.sheetId, already: true }];
                            limite = Math.max(1000, Number(timeoutMs) || 8000);
                            return [2 /*return*/, Promise.race([
                                    atual.promise,
                                    new Promise(function (resolve) { return root.setTimeout(function () { return resolve({ ok: false, reason: "timeout-convergencia", sheetId: atual.sheetId }); }, limite); })
                                ])];
                    }
                });
            });
        }
        function desconectarListener() {
            var atual = estadoRT.listener;
            if (atual) {
                try {
                    atual.ref.off("value", atual.callback);
                }
                catch (_e) { }
            }
            var notas = estadoRT.listenerNotas;
            if (notas) {
                try {
                    if (notas.callback)
                        notas.ref.off("value", notas.callback);
                }
                catch (_e) { }
                try {
                    if (notas.callbackValue)
                        notas.ref.off("value", notas.callbackValue);
                }
                catch (_e) { }
                try {
                    if (notas.callbackChildAdded)
                        notas.ref.off("child_added", notas.callbackChildAdded);
                }
                catch (_e) { }
                try {
                    if (notas.callbackChildChanged)
                        notas.ref.off("child_changed", notas.callbackChildChanged);
                }
                catch (_e) { }
            }
            var inventario = estadoRT.listenerInventario;
            if (inventario) {
                try {
                    if (inventario.callback)
                        inventario.ref.off("value", inventario.callback);
                }
                catch (_e) { }
                try {
                    if (inventario.callbackValue)
                        inventario.ref.off("value", inventario.callbackValue);
                }
                catch (_e) { }
                try {
                    if (inventario.callbackChildAdded)
                        inventario.ref.off("child_added", inventario.callbackChildAdded);
                }
                catch (_e) { }
                try {
                    if (inventario.callbackChildChanged)
                        inventario.ref.off("child_changed", inventario.callbackChildChanged);
                }
                catch (_e) { }
            }
            var jutsus = estadoRT.listenerJutsus;
            if (jutsus) {
                try {
                    if (jutsus.callbackValue)
                        jutsus.ref.off("value", jutsus.callbackValue);
                }
                catch (_e) { }
                try {
                    if (jutsus.callbackChildAdded)
                        jutsus.ref.off("child_added", jutsus.callbackChildAdded);
                }
                catch (_e) { }
                try {
                    if (jutsus.callbackChildChanged)
                        jutsus.ref.off("child_changed", jutsus.callbackChildChanged);
                }
                catch (_e) { }
            }
            var armados = estadoRT.listenerArmados;
            if (armados) {
                try {
                    if (armados.callback)
                        armados.ref.off("value", armados.callback);
                }
                catch (_e) { }
                try {
                    if (armados.callbackValue)
                        armados.ref.off("value", armados.callbackValue);
                }
                catch (_e) { }
                try {
                    if (armados.callbackChildAdded)
                        armados.ref.off("child_added", armados.callbackChildAdded);
                }
                catch (_e) { }
                try {
                    if (armados.callbackChildChanged)
                        armados.ref.off("child_changed", armados.callbackChildChanged);
                }
                catch (_e) { }
            }
            var kekkeiGenkai = estadoRT.listenerKekkeiGenkai;
            if (kekkeiGenkai) {
                try {
                    if (kekkeiGenkai.callback)
                        kekkeiGenkai.ref.off("value", kekkeiGenkai.callback);
                }
                catch (_e) { }
                try {
                    if (kekkeiGenkai.callbackValue)
                        kekkeiGenkai.ref.off("value", kekkeiGenkai.callbackValue);
                }
                catch (_e) { }
                try {
                    if (kekkeiGenkai.callbackChildAdded)
                        kekkeiGenkai.ref.off("child_added", kekkeiGenkai.callbackChildAdded);
                }
                catch (_e) { }
                try {
                    if (kekkeiGenkai.callbackChildChanged)
                        kekkeiGenkai.ref.off("child_changed", kekkeiGenkai.callbackChildChanged);
                }
                catch (_e) { }
            }
            var carteiraMoedas = estadoRT.listenerCarteiraMoedas;
            if (carteiraMoedas) {
                try {
                    if (carteiraMoedas.callback)
                        carteiraMoedas.ref.off("value", carteiraMoedas.callback);
                }
                catch (_e) { }
                try {
                    if (carteiraMoedas.callbackValue)
                        carteiraMoedas.ref.off("value", carteiraMoedas.callbackValue);
                }
                catch (_e) { }
                try {
                    if (carteiraMoedas.callbackChildAdded)
                        carteiraMoedas.ref.off("child_added", carteiraMoedas.callbackChildAdded);
                }
                catch (_e) { }
                try {
                    if (carteiraMoedas.callbackChildChanged)
                        carteiraMoedas.ref.off("child_changed", carteiraMoedas.callbackChildChanged);
                }
                catch (_e) { }
            }
            var carteiraHistorico = estadoRT.listenerCarteiraHistorico;
            if (carteiraHistorico) {
                try {
                    if (carteiraHistorico.callback)
                        carteiraHistorico.ref.off("value", carteiraHistorico.callback);
                }
                catch (_e) { }
                try {
                    if (carteiraHistorico.callbackValue)
                        carteiraHistorico.ref.off("value", carteiraHistorico.callbackValue);
                }
                catch (_e) { }
                try {
                    if (carteiraHistorico.callbackChildAdded)
                        carteiraHistorico.ref.off("child_added", carteiraHistorico.callbackChildAdded);
                }
                catch (_e) { }
                try {
                    if (carteiraHistorico.callbackChildChanged)
                        carteiraHistorico.ref.off("child_changed", carteiraHistorico.callbackChildChanged);
                }
                catch (_e) { }
            }
            var efeitosBatalha = estadoRT.listenerEfeitosBatalha;
            if (efeitosBatalha) {
                try {
                    if (efeitosBatalha.callback)
                        efeitosBatalha.ref.off("value", efeitosBatalha.callback);
                }
                catch (_e) { }
                try {
                    if (efeitosBatalha.callbackValue)
                        efeitosBatalha.ref.off("value", efeitosBatalha.callbackValue);
                }
                catch (_e) { }
                try {
                    if (efeitosBatalha.callbackChildAdded)
                        efeitosBatalha.ref.off("child_added", efeitosBatalha.callbackChildAdded);
                }
                catch (_e) { }
                try {
                    if (efeitosBatalha.callbackChildChanged)
                        efeitosBatalha.ref.off("child_changed", efeitosBatalha.callbackChildChanged);
                }
                catch (_e) { }
            }
            estadoRT.listener = null;
            estadoRT.listenerNotas = null;
            estadoRT.listenerInventario = null;
            estadoRT.listenerJutsus = null;
            estadoRT.listenerArmados = null;
            estadoRT.listenerKekkeiGenkai = null;
            estadoRT.listenerCarteiraMoedas = null;
            estadoRT.listenerCarteiraHistorico = null;
            estadoRT.listenerEfeitosBatalha = null;
            if (estadoRT.convergencia && !estadoRT.convergencia.concluida) {
                finalizarConvergencia({ ok: false, reason: "listener-desconectado", sheetId: estadoRT.convergencia.sheetId });
            }
        }
        function observarOffset(db) {
            if (estadoRT.offsetRef || !db)
                return;
            try {
                var ref = db.ref(".info/serverTimeOffset");
                var callback = function (snap) {
                    var valor = Number(snap.val());
                    if (Number.isFinite(valor)) {
                        estadoRT.offset = valor;
                        estadoRT.offsetConhecido = true;
                        try {
                            root.localStorage.setItem(CHAVE_SERVER_OFFSET, String(valor));
                        }
                        catch (_e) { }
                    }
                };
                ref.on("value", callback, function () { });
                estadoRT.offsetRef = ref;
                estadoRT.offsetCallback = callback;
            }
            catch (_e) { }
        }
        function ativarFichaAtual() {
            return __awaiter(this, void 0, void 0, function () {
                var user, db, fichaBase, ficha, realtimeId, uid, sheetId, ref, callback, refNotas, notasIncrementaisAtivas, erroNotas, aplicarNotaIncremental, callbackNotasChildAdded, callbackNotasChildChanged, callbackNotasValue, refInventario, inventarioIncrementalAtivo, erroInventario, aplicarInventarioIncremental, callbackInventarioChildAdded, callbackInventarioChildChanged, callbackInventarioValue, refJutsus, jutsusIncrementaisAtivos, erroJutsus, aplicarJutsuIncremental, callbackJutsusChildAdded, callbackJutsusChildChanged, callbackJutsusValue, refArmados, armadosIncrementaisAtivos, erroArmados, aplicarArmadoIncremental, callbackArmadosChildAdded, callbackArmadosChildChanged, callbackArmadosValue, refKekkeiGenkai, kekkeiIncrementalAtiva, erroKekkeiGenkai, aplicarKekkeiIncremental, callbackKekkeiChildAdded, callbackKekkeiChildChanged, callbackKekkeiValue, refCarteiraMoedas, carteiraMoedasIncrementalAtiva, erroCarteiraMoedas, aplicarCarteiraMoedaIncremental, callbackCarteiraMoedasChildAdded, callbackCarteiraMoedasChildChanged, callbackCarteiraMoedasValue, refCarteiraHistorico, carteiraHistoricoIncrementalAtivo, erroCarteiraHistorico, aplicarCarteiraHistoricoIncremental, callbackCarteiraHistoricoChildAdded, callbackCarteiraHistoricoChildChanged, callbackCarteiraHistoricoValue, refEfeitosBatalha, efeitosBatalhaIncrementaisAtivos, erroEfeitosBatalha, aplicarEfeitoBatalhaIncremental, callbackEfeitosBatalhaChildAdded, callbackEfeitosBatalhaChildChanged, callbackEfeitosBatalhaValue;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!estadoRT.bootLiberado)
                                return [2 /*return*/, { skipped: true, reason: "boot-ainda-nao-liberado" }];
                            user = usuarioAtual(), db = banco();
                            if (!user || !db) {
                                desconectarListener();
                                return [2 /*return*/, { skipped: true, reason: "conta-ou-firebase-indisponivel" }];
                            }
                            observarOffset(db);
                            fichaBase = obterFichaAtiva(false);
                            if (!fichaPodeUsarRealtime(fichaBase)) {
                                desconectarListener();
                                return [2 /*return*/, { skipped: true, reason: "ficha-legada-ou-desativada" }];
                            }
                            ficha = obterFichaAtiva(true);
                            realtimeId = realtimeIdDaFicha(ficha);
                            if (!fichaPodeUsarRealtime(ficha) || !realtimeId) {
                                desconectarListener();
                                return [2 /*return*/, { skipped: true, reason: "ficha-sem-identidade-realtime" }];
                            }
                            uid = texto(user.uid), sheetId = realtimeId;
                            if (!(estadoRT.listener && estadoRT.listener.uid === uid && estadoRT.listener.sheetId === sheetId &&
                                estadoRT.listenerNotas && estadoRT.listenerNotas.uid === uid && estadoRT.listenerNotas.sheetId === sheetId &&
                                estadoRT.listenerInventario && estadoRT.listenerInventario.uid === uid && estadoRT.listenerInventario.sheetId === sheetId &&
                                estadoRT.listenerJutsus && estadoRT.listenerJutsus.uid === uid && estadoRT.listenerJutsus.sheetId === sheetId &&
                                estadoRT.listenerArmados && estadoRT.listenerArmados.uid === uid && estadoRT.listenerArmados.sheetId === sheetId &&
                                estadoRT.listenerKekkeiGenkai && estadoRT.listenerKekkeiGenkai.uid === uid && estadoRT.listenerKekkeiGenkai.sheetId === sheetId &&
                                estadoRT.listenerCarteiraMoedas && estadoRT.listenerCarteiraMoedas.uid === uid && estadoRT.listenerCarteiraMoedas.sheetId === sheetId &&
                                estadoRT.listenerCarteiraHistorico && estadoRT.listenerCarteiraHistorico.uid === uid && estadoRT.listenerCarteiraHistorico.sheetId === sheetId &&
                                estadoRT.listenerEfeitosBatalha && estadoRT.listenerEfeitosBatalha.uid === uid && estadoRT.listenerEfeitosBatalha.sheetId === sheetId)) return [3 /*break*/, 2];
                            return [4 /*yield*/, processarOutbox().catch(function () { })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { ok: true, already: true, sheetId: sheetId }];
                        case 2:
                            desconectarListener();
                            iniciarConvergencia(uid, sheetId);
                            ref = db.ref("sheetRealtime/".concat(uid, "/").concat(sheetId, "/fields"));
                            callback = function (snap) {
                                try {
                                    aplicarSnapshotCampos(sheetId, snap.val() || {});
                                    marcarConvergencia(sheetId, "fields");
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar realtime da ficha ativa.", erro);
                                }
                            };
                            ref.on("value", callback, function (erro) {
                                console.warn("Realtime da ficha ativa indisponível.", (erro === null || erro === void 0 ? void 0 : erro.code) || (erro === null || erro === void 0 ? void 0 : erro.message) || erro);
                                try {
                                    root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: "Sincronização em tempo real indisponível. A ficha local continua funcionando." } }));
                                }
                                catch (_e) { }
                            });
                            estadoRT.listener = { uid: uid, sheetId: sheetId, ref: ref, callback: callback };
                            refNotas = db.ref("sheetRealtime/".concat(uid, "/").concat(sheetId, "/collections/notas"));
                            notasIncrementaisAtivas = false;
                            erroNotas = function (erro) {
                                console.warn("Realtime item-level de notas indisponível.", (erro === null || erro === void 0 ? void 0 : erro.code) || (erro === null || erro === void 0 ? void 0 : erro.message) || erro);
                                try {
                                    root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: "Sincronização das notas indisponível. As notas locais continuam salvas neste aparelho." } }));
                                }
                                catch (_e) { }
                            };
                            aplicarNotaIncremental = function (snap) {
                                var _a;
                                var _b;
                                if (!notasIncrementaisAtivas)
                                    return;
                                try {
                                    var chave = texto(snap === null || snap === void 0 ? void 0 : snap.key);
                                    var registro = (_b = snap === null || snap === void 0 ? void 0 : snap.val) === null || _b === void 0 ? void 0 : _b.call(snap);
                                    if (!chave || !registro || typeof registro !== "object")
                                        return;
                                    aplicarSnapshotColecao(sheetId, "notas", (_a = {}, _a[chave] = registro, _a));
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar nota incremental.", erro);
                                }
                            };
                            callbackNotasChildAdded = function (snap) { return aplicarNotaIncremental(snap); };
                            callbackNotasChildChanged = function (snap) { return aplicarNotaIncremental(snap); };
                            callbackNotasValue = function (snap) {
                                try {
                                    /* A primeira hidratação continua sendo um snapshot completo. Só depois
                                       dela trocamos as notas para eventos por item. Isso preserva a
                                       convergência de boot/restauração e evita uma mudança arquitetural
                                       maior numa única versão. */
                                    aplicarSnapshotColecao(sheetId, "notas", snap.val() || {});
                                    marcarConvergencia(sheetId, "notas");
                                    if (!notasIncrementaisAtivas) {
                                        notasIncrementaisAtivas = true;
                                        /* child_added é necessário para tópicos criados depois da hidratação.
                                           Os tópicos já existentes também são emitidos uma vez ao registrar
                                           o listener, mas são descartados pelo controle de versão já gravado
                                           pelo snapshot inicial. Tombstones chegam por child_changed. */
                                        refNotas.on("child_added", callbackNotasChildAdded, erroNotas);
                                        refNotas.on("child_changed", callbackNotasChildChanged, erroNotas);
                                        refNotas.off("value", callbackNotasValue);
                                    }
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar notas item-level.", erro);
                                }
                            };
                            refNotas.on("value", callbackNotasValue, erroNotas);
                            estadoRT.listenerNotas = {
                                uid: uid,
                                sheetId: sheetId,
                                ref: refNotas,
                                callbackValue: callbackNotasValue,
                                callbackChildAdded: callbackNotasChildAdded,
                                callbackChildChanged: callbackNotasChildChanged
                            };
                            refInventario = db.ref("sheetRealtime/".concat(uid, "/").concat(sheetId, "/collections/inventario"));
                            inventarioIncrementalAtivo = false;
                            erroInventario = function (erro) {
                                console.warn("Realtime item-level do inventário indisponível.", (erro === null || erro === void 0 ? void 0 : erro.code) || (erro === null || erro === void 0 ? void 0 : erro.message) || erro);
                                try {
                                    root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: "Sincronização do inventário indisponível. Os itens locais continuam salvos neste aparelho." } }));
                                }
                                catch (_e) { }
                            };
                            aplicarInventarioIncremental = function (snap) {
                                var _a;
                                var _b;
                                if (!inventarioIncrementalAtivo)
                                    return;
                                try {
                                    var chave = texto(snap === null || snap === void 0 ? void 0 : snap.key);
                                    var registro = (_b = snap === null || snap === void 0 ? void 0 : snap.val) === null || _b === void 0 ? void 0 : _b.call(snap);
                                    if (!chave || !registro || typeof registro !== "object")
                                        return;
                                    aplicarSnapshotColecao(sheetId, "inventario", (_a = {}, _a[chave] = registro, _a));
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar item incremental do inventário.", erro);
                                }
                            };
                            callbackInventarioChildAdded = function (snap) { return aplicarInventarioIncremental(snap); };
                            callbackInventarioChildChanged = function (snap) { return aplicarInventarioIncremental(snap); };
                            callbackInventarioValue = function (snap) {
                                try {
                                    /* Assim como nas notas, a primeira hidratação permanece completa para
                                       preservar a convergência de boot/restauração já validada. Depois
                                       dela, alterações do inventário passam a chegar item por item. */
                                    aplicarSnapshotColecao(sheetId, "inventario", snap.val() || {});
                                    marcarConvergencia(sheetId, "inventario");
                                    if (!inventarioIncrementalAtivo) {
                                        inventarioIncrementalAtivo = true;
                                        /* Registros já existentes podem ser emitidos por child_added logo
                                           após o registro dos listeners. O controle de versão já preenchido
                                           pelo snapshot inicial descarta esses eventos repetidos. Tombstones
                                           continuam chegando como child_changed do próprio item. */
                                        refInventario.on("child_added", callbackInventarioChildAdded, erroInventario);
                                        refInventario.on("child_changed", callbackInventarioChildChanged, erroInventario);
                                        refInventario.off("value", callbackInventarioValue);
                                    }
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar inventário item-level.", erro);
                                }
                            };
                            refInventario.on("value", callbackInventarioValue, erroInventario);
                            estadoRT.listenerInventario = {
                                uid: uid,
                                sheetId: sheetId,
                                ref: refInventario,
                                callbackValue: callbackInventarioValue,
                                callbackChildAdded: callbackInventarioChildAdded,
                                callbackChildChanged: callbackInventarioChildChanged
                            };
                            refJutsus = db.ref("sheetRealtime/".concat(uid, "/").concat(sheetId, "/collections/jutsus"));
                            jutsusIncrementaisAtivos = false;
                            erroJutsus = function (erro) {
                                console.warn("Realtime item-level de jutsus indisponível.", (erro === null || erro === void 0 ? void 0 : erro.code) || (erro === null || erro === void 0 ? void 0 : erro.message) || erro);
                                try {
                                    root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: "Sincronização dos jutsus indisponível. Os jutsus locais continuam salvos neste aparelho." } }));
                                }
                                catch (_e) { }
                            };
                            aplicarJutsuIncremental = function (snap) {
                                var _a;
                                var _b;
                                if (!jutsusIncrementaisAtivos)
                                    return;
                                try {
                                    var chave = texto(snap === null || snap === void 0 ? void 0 : snap.key);
                                    var registro = (_b = snap === null || snap === void 0 ? void 0 : snap.val) === null || _b === void 0 ? void 0 : _b.call(snap);
                                    if (!chave || !registro || typeof registro !== "object")
                                        return;
                                    /* O merge por item preserva imagem/imagemId da cópia local quando o
                                       jutsuId é o mesmo. A nuvem continua sem carregar blobs ou IDs de
                                       imagem; esta mudança altera somente a granularidade da leitura. */
                                    aplicarSnapshotColecao(sheetId, "jutsus", (_a = {}, _a[chave] = registro, _a));
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar jutsu incremental.", erro);
                                }
                            };
                            callbackJutsusChildAdded = function (snap) { return aplicarJutsuIncremental(snap); };
                            callbackJutsusChildChanged = function (snap) { return aplicarJutsuIncremental(snap); };
                            callbackJutsusValue = function (snap) {
                                try {
                                    /* Jutsus mantêm a hidratação inicial completa — o caminho já validado
                                       para boot, migração e restauração. Só depois dessa convergência
                                       ativamos eventos por jutsu, reduzindo leitura/reprocessamento sem
                                       alterar IDs permanentes, tombstones ou o armazenamento de imagens. */
                                    aplicarSnapshotColecao(sheetId, "jutsus", snap.val() || {});
                                    marcarConvergencia(sheetId, "jutsus");
                                    if (!jutsusIncrementaisAtivos) {
                                        jutsusIncrementaisAtivos = true;
                                        /* child_added cobre jutsus criados após a hidratação. Os registros
                                           existentes emitidos ao registrar o listener são descartados pelo
                                           controle de versão preenchido pelo snapshot inicial. Tombstones
                                           seguem chegando por child_changed do mesmo jutsuId. */
                                        refJutsus.on("child_added", callbackJutsusChildAdded, erroJutsus);
                                        refJutsus.on("child_changed", callbackJutsusChildChanged, erroJutsus);
                                        refJutsus.off("value", callbackJutsusValue);
                                    }
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar jutsus item-level.", erro);
                                }
                            };
                            refJutsus.on("value", callbackJutsusValue, erroJutsus);
                            estadoRT.listenerJutsus = {
                                uid: uid,
                                sheetId: sheetId,
                                ref: refJutsus,
                                callbackValue: callbackJutsusValue,
                                callbackChildAdded: callbackJutsusChildAdded,
                                callbackChildChanged: callbackJutsusChildChanged
                            };
                            refArmados = db.ref("sheetRealtime/".concat(uid, "/").concat(sheetId, "/collections/armados"));
                            armadosIncrementaisAtivos = false;
                            erroArmados = function (erro) {
                                console.warn("Realtime item-level de ataques indisponível.", (erro === null || erro === void 0 ? void 0 : erro.code) || (erro === null || erro === void 0 ? void 0 : erro.message) || erro);
                                try {
                                    root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: "Sincronização dos ataques indisponível. Os ataques locais continuam salvos neste aparelho." } }));
                                }
                                catch (_e) { }
                            };
                            aplicarArmadoIncremental = function (snap) {
                                var _a;
                                var _b;
                                if (!armadosIncrementaisAtivos)
                                    return;
                                try {
                                    var chave = texto(snap === null || snap === void 0 ? void 0 : snap.key);
                                    var registro = (_b = snap === null || snap === void 0 ? void 0 : snap.val) === null || _b === void 0 ? void 0 : _b.call(snap);
                                    if (!chave || !registro || typeof registro !== "object")
                                        return;
                                    aplicarSnapshotColecao(sheetId, "armados", (_a = {}, _a[chave] = registro, _a));
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar ataque incremental.", erro);
                                }
                            };
                            callbackArmadosChildAdded = function (snap) { return aplicarArmadoIncremental(snap); };
                            callbackArmadosChildChanged = function (snap) { return aplicarArmadoIncremental(snap); };
                            callbackArmadosValue = function (snap) {
                                try {
                                    /* Mantém o snapshot completo somente na primeira hidratação, igual às
                                       coleções de notas e inventário já validadas. Depois dela, cada
                                       ataque chega isoladamente sem reprocessar a lista inteira. */
                                    aplicarSnapshotColecao(sheetId, "armados", snap.val() || {});
                                    marcarConvergencia(sheetId, "armados");
                                    if (!armadosIncrementaisAtivos) {
                                        armadosIncrementaisAtivos = true;
                                        /* child_added cobre ataques criados depois da hidratação. Eventos
                                           repetidos dos registros já existentes são descartados pelo
                                           controle de versão preenchido pelo snapshot inicial. Tombstones
                                           continuam chegando por child_changed do próprio ataque. */
                                        refArmados.on("child_added", callbackArmadosChildAdded, erroArmados);
                                        refArmados.on("child_changed", callbackArmadosChildChanged, erroArmados);
                                        refArmados.off("value", callbackArmadosValue);
                                    }
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar ataques item-level.", erro);
                                }
                            };
                            refArmados.on("value", callbackArmadosValue, erroArmados);
                            estadoRT.listenerArmados = {
                                uid: uid,
                                sheetId: sheetId,
                                ref: refArmados,
                                callbackValue: callbackArmadosValue,
                                callbackChildAdded: callbackArmadosChildAdded,
                                callbackChildChanged: callbackArmadosChildChanged
                            };
                            refKekkeiGenkai = db.ref("sheetRealtime/".concat(uid, "/").concat(sheetId, "/collections/kekkeiGenkai"));
                            kekkeiIncrementalAtiva = false;
                            erroKekkeiGenkai = function (erro) {
                                console.warn("Realtime item-level de Kekkei Genkai indisponível.", (erro === null || erro === void 0 ? void 0 : erro.code) || (erro === null || erro === void 0 ? void 0 : erro.message) || erro);
                                try {
                                    root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: "Sincronização de Kekkei Genkai indisponível. Os dados locais continuam salvos neste aparelho." } }));
                                }
                                catch (_e) { }
                            };
                            aplicarKekkeiIncremental = function (snap) {
                                var _a;
                                var _b;
                                if (!kekkeiIncrementalAtiva)
                                    return;
                                try {
                                    var chave = texto(snap === null || snap === void 0 ? void 0 : snap.key);
                                    var registro = (_b = snap === null || snap === void 0 ? void 0 : snap.val) === null || _b === void 0 ? void 0 : _b.call(snap);
                                    if (!chave || !registro || typeof registro !== "object")
                                        return;
                                    aplicarSnapshotColecao(sheetId, "kekkeiGenkai", (_a = {}, _a[chave] = registro, _a));
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar Kekkei Genkai incremental.", erro);
                                }
                            };
                            callbackKekkeiChildAdded = function (snap) { return aplicarKekkeiIncremental(snap); };
                            callbackKekkeiChildChanged = function (snap) { return aplicarKekkeiIncremental(snap); };
                            callbackKekkeiValue = function (snap) {
                                try {
                                    /* A hidratação inicial continua completa para preservar convergência,
                                       migração e ordenação já validadas. Depois dela, cada Kekkei Genkai
                                       passa a ser recebida isoladamente pelo próprio kekkeiId. */
                                    aplicarSnapshotColecao(sheetId, "kekkeiGenkai", snap.val() || {});
                                    marcarConvergencia(sheetId, "kekkeiGenkai");
                                    if (!kekkeiIncrementalAtiva) {
                                        kekkeiIncrementalAtiva = true;
                                        /* child_added cobre novos registros após a hidratação. Os registros
                                           já conhecidos são ignorados pelo controle de versão preenchido no
                                           snapshot inicial; tombstones chegam por child_changed. */
                                        refKekkeiGenkai.on("child_added", callbackKekkeiChildAdded, erroKekkeiGenkai);
                                        refKekkeiGenkai.on("child_changed", callbackKekkeiChildChanged, erroKekkeiGenkai);
                                        refKekkeiGenkai.off("value", callbackKekkeiValue);
                                    }
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar Kekkei Genkai item-level.", erro);
                                }
                            };
                            refKekkeiGenkai.on("value", callbackKekkeiValue, erroKekkeiGenkai);
                            estadoRT.listenerKekkeiGenkai = {
                                uid: uid,
                                sheetId: sheetId,
                                ref: refKekkeiGenkai,
                                callbackValue: callbackKekkeiValue,
                                callbackChildAdded: callbackKekkeiChildAdded,
                                callbackChildChanged: callbackKekkeiChildChanged
                            };
                            refCarteiraMoedas = db.ref("sheetRealtime/".concat(uid, "/").concat(sheetId, "/collections/carteiraMoedas"));
                            carteiraMoedasIncrementalAtiva = false;
                            erroCarteiraMoedas = function (erro) {
                                console.warn("Realtime item-level da carteira indisponível.", (erro === null || erro === void 0 ? void 0 : erro.code) || (erro === null || erro === void 0 ? void 0 : erro.message) || erro);
                                try {
                                    root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: "Sincronização da carteira indisponível. O saldo local continua salvo neste aparelho." } }));
                                }
                                catch (_e) { }
                            };
                            aplicarCarteiraMoedaIncremental = function (snap) {
                                var _a;
                                var _b;
                                if (!carteiraMoedasIncrementalAtiva)
                                    return;
                                try {
                                    var chave = texto(snap === null || snap === void 0 ? void 0 : snap.key).toLowerCase();
                                    var registro = (_b = snap === null || snap === void 0 ? void 0 : snap.val) === null || _b === void 0 ? void 0 : _b.call(snap);
                                    if (!["pd", "po", "pp", "pc"].includes(chave) || !registro || typeof registro !== "object")
                                        return;
                                    aplicarSnapshotColecao(sheetId, "carteiraMoedas", (_a = {}, _a[chave] = registro, _a));
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar moeda incremental da carteira.", erro);
                                }
                            };
                            callbackCarteiraMoedasChildAdded = function (snap) { return aplicarCarteiraMoedaIncremental(snap); };
                            callbackCarteiraMoedasChildChanged = function (snap) { return aplicarCarteiraMoedaIncremental(snap); };
                            callbackCarteiraMoedasValue = function (snap) {
                                try {
                                    /* A carteira mantém uma hidratação completa inicial para preservar a
                                       convergência já validada. Depois dela, cada uma das quatro moedas
                                       passa a chegar isoladamente, sem reprocessar os outros saldos. */
                                    aplicarSnapshotColecao(sheetId, "carteiraMoedas", snap.val() || {});
                                    marcarConvergencia(sheetId, "carteiraMoedas");
                                    if (!carteiraMoedasIncrementalAtiva) {
                                        carteiraMoedasIncrementalAtiva = true;
                                        /* child_added cobre uma moeda criada após a hidratação. Os quatro
                                           registros existentes são reemitidos ao registrar o listener, mas
                                           o controle de versão do snapshot inicial os descarta. Tombstones
                                           continuam chegando por child_changed e zeram apenas aquela moeda. */
                                        refCarteiraMoedas.on("child_added", callbackCarteiraMoedasChildAdded, erroCarteiraMoedas);
                                        refCarteiraMoedas.on("child_changed", callbackCarteiraMoedasChildChanged, erroCarteiraMoedas);
                                        refCarteiraMoedas.off("value", callbackCarteiraMoedasValue);
                                    }
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar carteira por moeda.", erro);
                                }
                            };
                            refCarteiraMoedas.on("value", callbackCarteiraMoedasValue, erroCarteiraMoedas);
                            estadoRT.listenerCarteiraMoedas = {
                                uid: uid,
                                sheetId: sheetId,
                                ref: refCarteiraMoedas,
                                callbackValue: callbackCarteiraMoedasValue,
                                callbackChildAdded: callbackCarteiraMoedasChildAdded,
                                callbackChildChanged: callbackCarteiraMoedasChildChanged
                            };
                            refCarteiraHistorico = db.ref("sheetRealtime/".concat(uid, "/").concat(sheetId, "/collections/carteiraHistorico"));
                            carteiraHistoricoIncrementalAtivo = false;
                            erroCarteiraHistorico = function (erro) {
                                console.warn("Realtime item-level do histórico da carteira indisponível.", (erro === null || erro === void 0 ? void 0 : erro.code) || (erro === null || erro === void 0 ? void 0 : erro.message) || erro);
                                try {
                                    root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: "Sincronização do histórico da carteira indisponível. O histórico local continua salvo neste aparelho." } }));
                                }
                                catch (_e) { }
                            };
                            aplicarCarteiraHistoricoIncremental = function (snap) {
                                var _a;
                                var _b;
                                if (!carteiraHistoricoIncrementalAtivo)
                                    return;
                                try {
                                    var chave = texto(snap === null || snap === void 0 ? void 0 : snap.key);
                                    var registro = (_b = snap === null || snap === void 0 ? void 0 : snap.val) === null || _b === void 0 ? void 0 : _b.call(snap);
                                    if (!chave || !registro || typeof registro !== "object")
                                        return;
                                    aplicarSnapshotColecao(sheetId, "carteiraHistorico", (_a = {}, _a[chave] = registro, _a));
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar lançamento incremental do histórico da carteira.", erro);
                                }
                            };
                            callbackCarteiraHistoricoChildAdded = function (snap) { return aplicarCarteiraHistoricoIncremental(snap); };
                            callbackCarteiraHistoricoChildChanged = function (snap) { return aplicarCarteiraHistoricoIncremental(snap); };
                            callbackCarteiraHistoricoValue = function (snap) {
                                try {
                                    /* O histórico mantém uma hidratação completa inicial para preservar
                                       a convergência, a ordenação e o limite local de 40 lançamentos já
                                       validados. Depois dela, cada movimentação chega isoladamente. */
                                    aplicarSnapshotColecao(sheetId, "carteiraHistorico", snap.val() || {});
                                    marcarConvergencia(sheetId, "carteiraHistorico");
                                    if (!carteiraHistoricoIncrementalAtivo) {
                                        carteiraHistoricoIncrementalAtivo = true;
                                        /* child_added cobre novos lançamentos. Registros já existentes podem
                                           ser reemitidos ao registrar o listener, mas o controle de versão
                                           preenchido no snapshot inicial os descarta. Tombstones continuam
                                           chegando por child_changed do próprio lançamento. */
                                        refCarteiraHistorico.on("child_added", callbackCarteiraHistoricoChildAdded, erroCarteiraHistorico);
                                        refCarteiraHistorico.on("child_changed", callbackCarteiraHistoricoChildChanged, erroCarteiraHistorico);
                                        refCarteiraHistorico.off("value", callbackCarteiraHistoricoValue);
                                    }
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar histórico da carteira item-level.", erro);
                                }
                            };
                            refCarteiraHistorico.on("value", callbackCarteiraHistoricoValue, erroCarteiraHistorico);
                            estadoRT.listenerCarteiraHistorico = {
                                uid: uid,
                                sheetId: sheetId,
                                ref: refCarteiraHistorico,
                                callbackValue: callbackCarteiraHistoricoValue,
                                callbackChildAdded: callbackCarteiraHistoricoChildAdded,
                                callbackChildChanged: callbackCarteiraHistoricoChildChanged
                            };
                            refEfeitosBatalha = db.ref("sheetRealtime/".concat(uid, "/").concat(sheetId, "/collections/efeitosBatalha"));
                            efeitosBatalhaIncrementaisAtivos = false;
                            erroEfeitosBatalha = function (erro) {
                                console.warn("Realtime item-level dos efeitos de batalha indisponível.", (erro === null || erro === void 0 ? void 0 : erro.code) || (erro === null || erro === void 0 ? void 0 : erro.message) || erro);
                                try {
                                    root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: "Sincronização dos efeitos de batalha indisponível. Os efeitos locais continuam salvos neste aparelho." } }));
                                }
                                catch (_e) { }
                            };
                            aplicarEfeitoBatalhaIncremental = function (snap) {
                                var _a;
                                var _b;
                                if (!efeitosBatalhaIncrementaisAtivos)
                                    return;
                                try {
                                    var chave = texto(snap === null || snap === void 0 ? void 0 : snap.key);
                                    var registro = (_b = snap === null || snap === void 0 ? void 0 : snap.val) === null || _b === void 0 ? void 0 : _b.call(snap);
                                    if (!chave || !registro || typeof registro !== "object")
                                        return;
                                    aplicarSnapshotColecao(sheetId, "efeitosBatalha", (_a = {}, _a[chave] = registro, _a));
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar efeito de batalha incremental.", erro);
                                }
                            };
                            callbackEfeitosBatalhaChildAdded = function (snap) { return aplicarEfeitoBatalhaIncremental(snap); };
                            callbackEfeitosBatalhaChildChanged = function (snap) { return aplicarEfeitoBatalhaIncremental(snap); };
                            callbackEfeitosBatalhaValue = function (snap) {
                                try {
                                    /* Efeitos de batalha preservam a hidratação completa inicial para que
                                       a ficha, os bônus derivados e a convergência de boot/restauração
                                       continuem exatamente como nas versões anteriores. Depois dela, cada
                                       efeito passa a ser recebido isoladamente pelo próprio ID. */
                                    aplicarSnapshotColecao(sheetId, "efeitosBatalha", snap.val() || {});
                                    marcarConvergencia(sheetId, "efeitosBatalha");
                                    if (!efeitosBatalhaIncrementaisAtivos) {
                                        efeitosBatalhaIncrementaisAtivos = true;
                                        /* child_added cobre efeitos criados depois da hidratação. Os efeitos
                                           já existentes podem ser reemitidos ao registrar o listener, mas
                                           o controle de versão preenchido no snapshot inicial os descarta.
                                           Tombstones continuam chegando por child_changed. */
                                        refEfeitosBatalha.on("child_added", callbackEfeitosBatalhaChildAdded, erroEfeitosBatalha);
                                        refEfeitosBatalha.on("child_changed", callbackEfeitosBatalhaChildChanged, erroEfeitosBatalha);
                                        refEfeitosBatalha.off("value", callbackEfeitosBatalhaValue);
                                    }
                                }
                                catch (erro) {
                                    console.warn("Falha ao aplicar efeitos de batalha item-level.", erro);
                                }
                            };
                            refEfeitosBatalha.on("value", callbackEfeitosBatalhaValue, erroEfeitosBatalha);
                            estadoRT.listenerEfeitosBatalha = {
                                uid: uid,
                                sheetId: sheetId,
                                ref: refEfeitosBatalha,
                                callbackValue: callbackEfeitosBatalhaValue,
                                callbackChildAdded: callbackEfeitosBatalhaChildAdded,
                                callbackChildChanged: callbackEfeitosBatalhaChildChanged
                            };
                            return [4 /*yield*/, processarOutbox().catch(function () { })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, { ok: true, sheetId: sheetId }];
                    }
                });
            });
        }
        function agendarAtivacao(atraso) {
            if (atraso === void 0) { atraso = 80; }
            clearTimeout(estadoRT.timerAtivacao);
            estadoRT.timerAtivacao = setTimeout(function () { return ativarFichaAtual().catch(function (erro) { return console.warn("Realtime lazy não iniciou.", erro); }); }, atraso);
        }
        function enviarOperacao(op) {
            return __awaiter(this, void 0, void 0, function () {
                var uid, db, ref, registroAtual, resultado, atual, salvo;
                var _a;
                var _b, _c, _d, _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            uid = uidAtual(), db = banco();
                            if (!uid || !db || texto(op === null || op === void 0 ? void 0 : op.uid) !== uid)
                                throw new Error("Conta Google indisponível para sincronização realtime.");
                            ref = db.ref("sheetRealtime/".concat(uid, "/").concat(op.sheetId, "/fields/").concat(campoParaChave(op.name)));
                            registroAtual = null;
                            return [4 /*yield*/, ref.transaction(function (atual) {
                                    if (atual && compararRegistros(op, atual) <= 0) {
                                        registroAtual = atual;
                                        return;
                                    }
                                    return registroParaFirebase(op);
                                })];
                        case 1:
                            resultado = _h.sent();
                            if (!resultado.committed) {
                                removerOutbox(op, uid);
                                atual = registroAtual || ((_c = (_b = resultado.snapshot) === null || _b === void 0 ? void 0 : _b.val) === null || _c === void 0 ? void 0 : _c.call(_b));
                                if (atual && ((_d = estadoRT.listener) === null || _d === void 0 ? void 0 : _d.sheetId) === op.sheetId)
                                    aplicarSnapshotCampos(op.sheetId, (_a = {}, _a[campoParaChave(op.name)] = atual, _a));
                                return [2 /*return*/, { ok: true, obsolete: true }];
                            }
                            salvo = (_g = (_f = resultado.snapshot) === null || _f === void 0 ? void 0 : _f.val) === null || _g === void 0 ? void 0 : _g.call(_f);
                            removerOutbox(op, uid);
                            if (salvo)
                                registrarVersao(op.sheetId, op.name, salvo, uid);
                            return [2 /*return*/, { ok: true, record: salvo }];
                    }
                });
            });
        }
        function enviarOperacaoColecao(op) {
            return __awaiter(this, void 0, void 0, function () {
                var uid, db, itemKey, ref, registroAtual, resultado, atual, salvo;
                var _a;
                var _b, _c, _d, _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            uid = uidAtual(), db = banco();
                            if (!uid || !db || texto(op === null || op === void 0 ? void 0 : op.uid) !== uid)
                                throw new Error("Conta Google indisponível para sincronização item-level.");
                            if (!colecaoPermitida(op === null || op === void 0 ? void 0 : op.collection) || !texto(op === null || op === void 0 ? void 0 : op.itemId))
                                throw new Error("Coleção item-level inválida.");
                            itemKey = itemIdParaChaveFirebasePura(op.itemId);
                            ref = db.ref("sheetRealtime/".concat(uid, "/").concat(op.sheetId, "/collections/").concat(op.collection, "/").concat(itemKey));
                            registroAtual = null;
                            return [4 /*yield*/, ref.transaction(function (atual) {
                                    if (atual && compararRegistros(op, atual) <= 0) {
                                        registroAtual = atual;
                                        return;
                                    }
                                    return registroColecaoParaFirebase(op);
                                })];
                        case 1:
                            resultado = _h.sent();
                            if (!resultado.committed) {
                                removerOutboxColecao(op, uid);
                                atual = registroAtual || ((_c = (_b = resultado.snapshot) === null || _b === void 0 ? void 0 : _b.val) === null || _c === void 0 ? void 0 : _c.call(_b));
                                if (atual && ((_d = estadoRT.listener) === null || _d === void 0 ? void 0 : _d.sheetId) === op.sheetId) {
                                    aplicarSnapshotColecao(op.sheetId, op.collection, (_a = {}, _a[itemKey] = atual, _a));
                                }
                                return [2 /*return*/, { ok: true, obsolete: true }];
                            }
                            salvo = (_g = (_f = resultado.snapshot) === null || _f === void 0 ? void 0 : _f.val) === null || _g === void 0 ? void 0 : _g.call(_f);
                            removerOutboxColecao(op, uid);
                            if (salvo)
                                registrarVersaoColecao(op.sheetId, op.collection, op.itemId, salvo, uid);
                            return [2 /*return*/, { ok: true, record: salvo }];
                    }
                });
            });
        }
        function processarOutbox() {
            return __awaiter(this, void 0, void 0, function () {
                var uid, db, resultados, pendentesCampos, pendentesColecoes_1, pendentes, pendentes_1, pendentes_1_1, op, resposta, _a, erro_2, e_6_1;
                var e_6, _b;
                var _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            if (estadoRT.processando) {
                                estadoRT.reprocessar = true;
                                return [2 /*return*/, { busy: true }];
                            }
                            uid = uidAtual(), db = banco();
                            if (!uid || !db || ((_c = root.navigator) === null || _c === void 0 ? void 0 : _c.onLine) === false)
                                return [2 /*return*/, { skipped: true }];
                            estadoRT.processando = true;
                            resultados = [];
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, , 15, 16]);
                            pendentesCampos = Object.values(lerOutbox(uid)).filter(function (op) { return (op === null || op === void 0 ? void 0 : op.sheetId) && campoPermitido(op === null || op === void 0 ? void 0 : op.name); });
                            pendentesColecoes_1 = [];
                            Object.values(lerOutboxColecoes(uid)).forEach(function (op) {
                                if (!(op === null || op === void 0 ? void 0 : op.sheetId) || !colecaoPermitida(op === null || op === void 0 ? void 0 : op.collection) || !texto(op === null || op === void 0 ? void 0 : op.itemId))
                                    return;
                                try {
                                    itemIdParaChaveFirebasePura(op.itemId);
                                    pendentesColecoes_1.push(op);
                                }
                                catch (erro) {
                                    quarentenarOperacaoColecao(op, erro, uid);
                                    try {
                                        root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: "Um item legado possui um identificador incompatível com a nuvem e foi retirado da fila automática para evitar tentativas infinitas." } }));
                                    }
                                    catch (_e) { }
                                    resultados.push({ ok: false, quarantined: true, error: erro, op: op });
                                }
                            });
                            pendentes = __spreadArray(__spreadArray([], __read(pendentesCampos), false), __read(pendentesColecoes_1), false);
                            pendentes.sort(function (a, b) { return compararRegistros(a, b); });
                            _d.label = 2;
                        case 2:
                            _d.trys.push([2, 12, 13, 14]);
                            pendentes_1 = __values(pendentes), pendentes_1_1 = pendentes_1.next();
                            _d.label = 3;
                        case 3:
                            if (!!pendentes_1_1.done) return [3 /*break*/, 11];
                            op = pendentes_1_1.value;
                            _d.label = 4;
                        case 4:
                            _d.trys.push([4, 9, , 10]);
                            if (!((op === null || op === void 0 ? void 0 : op.kind) === "collection")) return [3 /*break*/, 6];
                            return [4 /*yield*/, enviarOperacaoColecao(op)];
                        case 5:
                            _a = _d.sent();
                            return [3 /*break*/, 8];
                        case 6: return [4 /*yield*/, enviarOperacao(op)];
                        case 7:
                            _a = _d.sent();
                            _d.label = 8;
                        case 8:
                            resposta = _a;
                            resultados.push(__assign(__assign({}, resposta), { op: op }));
                            return [3 /*break*/, 10];
                        case 9:
                            erro_2 = _d.sent();
                            resultados.push({ ok: false, error: erro_2, op: op });
                            return [3 /*break*/, 10];
                        case 10:
                            pendentes_1_1 = pendentes_1.next();
                            return [3 /*break*/, 3];
                        case 11: return [3 /*break*/, 14];
                        case 12:
                            e_6_1 = _d.sent();
                            e_6 = { error: e_6_1 };
                            return [3 /*break*/, 14];
                        case 13:
                            try {
                                if (pendentes_1_1 && !pendentes_1_1.done && (_b = pendentes_1.return)) _b.call(pendentes_1);
                            }
                            finally { if (e_6) throw e_6.error; }
                            return [7 /*endfinally*/];
                        case 14: return [3 /*break*/, 16];
                        case 15:
                            estadoRT.processando = false;
                            if (estadoRT.reprocessar) {
                                estadoRT.reprocessar = false;
                                setTimeout(function () { return processarOutbox().catch(function () { }); }, 0);
                            }
                            return [7 /*endfinally*/];
                        case 16: return [2 /*return*/, { ok: resultados.every(function (r) { return r.ok !== false; }), resultados: resultados }];
                    }
                });
            });
        }
        function sincronizarCampoConfirmado(localSheetName_1, campo_1, valor_1) {
            return __awaiter(this, arguments, void 0, function (localSheetName, campo, valor, meta) {
                var nome, user, ficha, realtimeId, uid, editAt, op, resultado, proprio, entregue, aindaNaFila;
                var _a, _b;
                if (meta === void 0) { meta = {}; }
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            nome = texto(campo);
                            if (!campoPermitido(nome))
                                return [2 /*return*/, { skipped: true, reason: "campo-invalido" }];
                            user = usuarioAtual();
                            if (!user)
                                return [2 /*return*/, { skipped: true, reason: "sem-conta-google" }];
                            ficha = obterFichaSolicitada(localSheetName, true);
                            if (!ficha)
                                return [2 /*return*/, { skipped: true, reason: "ficha-solicitada-nao-encontrada" }];
                            if (!fichaPodeUsarRealtime(ficha))
                                return [2 /*return*/, { skipped: true, reason: "ficha-legada-ou-desativada" }];
                            realtimeId = realtimeIdDaFicha(ficha);
                            if (!realtimeId)
                                return [2 /*return*/, { skipped: true, reason: "ficha-indisponivel" }];
                            uid = texto(user.uid);
                            editAt = proximoEditAtPuro(timestampEdicao(), versaoAplicada(realtimeId, nome, uid), operacaoPendente(realtimeId, nome, uid), Number(meta.editAt || 0));
                            op = criarOperacaoPura({
                                uid: uid,
                                sheetId: realtimeId, sheetName: ficha.name, campo: nome,
                                valor: valor,
                                editAt: editAt,
                                deviceId: deviceId(), opId: idAleatorio("field")
                            });
                            adicionarOutbox(op, uid);
                            /* A operação passa a ser considerada aceita assim que entra no outbox
                               persistente. Isso é diferente de "toda a fila da conta sincronizou".
                               Antes, um erro em qualquer outro campo fazia consumidores como o XP
                               concluírem que a operação de XP havia falhado, mesmo quando ela já
                               estava gravada/na fila corretamente. */
                            if (((_a = root.navigator) === null || _a === void 0 ? void 0 : _a.onLine) === false)
                                return [2 /*return*/, { accepted: true, queued: true, op: op }];
                            if (!estadoRT.bootLiberado) return [3 /*break*/, 2];
                            return [4 /*yield*/, ativarFichaAtual().catch(function () { })];
                        case 1:
                            _c.sent();
                            _c.label = 2;
                        case 2: return [4 /*yield*/, processarOutbox()];
                        case 3:
                            resultado = _c.sent();
                            proprio = ((resultado === null || resultado === void 0 ? void 0 : resultado.resultados) || []).find(function (item) { var _a; return texto((_a = item === null || item === void 0 ? void 0 : item.op) === null || _a === void 0 ? void 0 : _a.opId) === texto(op.opId); }) || null;
                            entregue = Boolean((proprio === null || proprio === void 0 ? void 0 : proprio.ok) === true);
                            aindaNaFila = Boolean((_b = lerOutbox(uid)) === null || _b === void 0 ? void 0 : _b[chaveOperacao(op.sheetId, op.name)]);
                            return [2 /*return*/, __assign(__assign({}, resultado), { op: op, ownResult: proprio, accepted: true, delivered: entregue, queued: !entregue && aindaNaFila })];
                    }
                });
            });
        }
        function sincronizarItemColecaoConfirmado(localSheetName_1, colecao_1, itemId_1, valor_1) {
            return __awaiter(this, arguments, void 0, function (localSheetName, colecao, itemId, valor, meta) {
                var collection, id, user, ficha, realtimeId, uid, editAt, op, resultado;
                var _a;
                if (meta === void 0) { meta = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            collection = texto(colecao), id = texto(itemId);
                            if (!colecaoPermitida(collection) || !id)
                                return [2 /*return*/, { skipped: true, reason: "colecao-ou-item-invalido" }];
                            itemIdParaChaveFirebasePura(id);
                            user = usuarioAtual();
                            if (!user)
                                return [2 /*return*/, { skipped: true, reason: "sem-conta-google" }];
                            ficha = obterFichaSolicitada(localSheetName, true);
                            if (!ficha)
                                return [2 /*return*/, { skipped: true, reason: "ficha-solicitada-nao-encontrada" }];
                            if (!fichaPodeUsarRealtime(ficha))
                                return [2 /*return*/, { skipped: true, reason: "ficha-legada-ou-desativada" }];
                            realtimeId = realtimeIdDaFicha(ficha);
                            if (!realtimeId)
                                return [2 /*return*/, { skipped: true, reason: "ficha-indisponivel" }];
                            uid = texto(user.uid);
                            editAt = proximoEditAtColecaoPuro(timestampEdicao(), versaoColecaoAplicada(realtimeId, collection, id, uid), operacaoColecaoPendente(realtimeId, collection, id, uid), Number(meta.editAt || 0));
                            op = criarOperacaoColecaoPura({
                                uid: uid,
                                sheetId: realtimeId, sheetName: ficha.name, colecao: collection, itemId: id,
                                valor: valor,
                                deleted: meta.deleted === true, identityKey: texto(meta.identityKey),
                                editAt: editAt,
                                deviceId: deviceId(), opId: idAleatorio("item")
                            });
                            adicionarOutboxColecao(op, uid);
                            if (((_a = root.navigator) === null || _a === void 0 ? void 0 : _a.onLine) === false)
                                return [2 /*return*/, { queued: true, op: op }];
                            if (!estadoRT.bootLiberado) return [3 /*break*/, 2];
                            return [4 /*yield*/, ativarFichaAtual().catch(function () { })];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2: return [4 /*yield*/, processarOutbox()];
                        case 3:
                            resultado = _b.sent();
                            return [2 /*return*/, __assign(__assign({}, resultado), { op: op })];
                    }
                });
            });
        }
        function maiorEditAtPendenciasFicha(sheetId, uid) {
            var _a;
            if (uid === void 0) { uid = uidAtual(); }
            var id = texto(sheetId);
            var maior = 0;
            Object.values(lerOutbox(uid)).forEach(function (op) { if (texto(op === null || op === void 0 ? void 0 : op.sheetId) === id)
                maior = Math.max(maior, Number((op === null || op === void 0 ? void 0 : op.editAt) || 0)); });
            Object.values(lerOutboxColecoes(uid)).forEach(function (op) { if (texto(op === null || op === void 0 ? void 0 : op.sheetId) === id)
                maior = Math.max(maior, Number((op === null || op === void 0 ? void 0 : op.editAt) || 0)); });
            var versoesCampos = ((_a = lerVersoes(uid)) === null || _a === void 0 ? void 0 : _a[id]) || {};
            Object.values(versoesCampos).forEach(function (v) { maior = Math.max(maior, Number((v === null || v === void 0 ? void 0 : v.editAt) || 0)); });
            var prefixo = "".concat(id, "::");
            Object.entries(lerVersoesColecoes(uid)).forEach(function (_a) {
                var _b = __read(_a, 2), chave = _b[0], v = _b[1];
                if (chave.startsWith(prefixo))
                    maior = Math.max(maior, Number((v === null || v === void 0 ? void 0 : v.editAt) || 0));
            });
            return maior;
        }
        function limparPendenciasFicha(sheetId, uid) {
            if (uid === void 0) { uid = uidAtual(); }
            var id = texto(sheetId), prefixo = "".concat(id, "::");
            var campos = lerOutbox(uid);
            Object.keys(campos).forEach(function (chave) { if (chave.startsWith(prefixo))
                delete campos[chave]; });
            salvarOutbox(campos, uid);
            var colecoes = lerOutboxColecoes(uid);
            Object.keys(colecoes).forEach(function (chave) { if (chave.startsWith(prefixo))
                delete colecoes[chave]; });
            salvarOutboxColecoes(colecoes, uid);
        }
        function aplicarSnapshotAutoritativo() {
            return __awaiter(this, arguments, void 0, function (localSheetName, snapshot) {
                var user, db, ficha, sheetId, uid, dados, ref, snap, realtime, plano, updates;
                var _a;
                if (localSheetName === void 0) { localSheetName = ""; }
                if (snapshot === void 0) { snapshot = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (((_a = root.navigator) === null || _a === void 0 ? void 0 : _a.onLine) === false)
                                throw new Error("Conecte este aparelho à internet para restaurar um backup histórico.");
                            user = usuarioAtual(), db = banco();
                            if (!user || !db)
                                throw new Error("Entre com sua Conta Google antes de restaurar um backup histórico.");
                            ficha = obterFichaSolicitada(localSheetName, true);
                            if (!ficha)
                                throw new Error("A ficha escolhida para restauração não existe mais neste aparelho.");
                            if (!fichaPodeUsarRealtime(ficha))
                                throw new Error("Esta cópia antiga está preservada e não pode substituir a ficha principal.");
                            sheetId = realtimeIdDaFicha(ficha), uid = texto(user.uid);
                            if (!sheetId)
                                throw new Error("Ficha escolhida indisponível para restauração.");
                            dados = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) ? clonar(snapshot) : {};
                            ref = db.ref("sheetRealtime/".concat(uid, "/").concat(sheetId));
                            return [4 /*yield*/, ref.once("value")];
                        case 1:
                            snap = _b.sent();
                            realtime = snap.val() || {};
                            plano = planejarRestauracaoAutoritativaPura({
                                uid: uid,
                                sheetId: sheetId,
                                sheetName: ficha.name, snapshot: dados,
                                realtime: realtime,
                                editAtBase: Math.max(timestampEdicao(), maiorEditAtPendenciasFicha(sheetId, uid)),
                                deviceId: deviceId()
                            });
                            updates = {};
                            plano.fieldOps.forEach(function (op) { updates["fields/".concat(campoParaChave(op.name))] = registroParaFirebase(op); });
                            plano.collectionOps.forEach(function (op) { updates["collections/".concat(op.collection, "/").concat(itemIdParaChaveFirebasePura(op.itemId))] = registroColecaoParaFirebase(op); });
                            if (!Object.keys(updates).length) return [3 /*break*/, 3];
                            return [4 /*yield*/, ref.update(updates)];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            limparPendenciasFicha(sheetId, uid);
                            return [2 /*return*/, { ok: true, sheetId: sheetId, fields: plano.fieldOps.length, items: plano.collectionOps.length }];
                    }
                });
            });
        }
        function regularizarFichaCompleta() {
            return __awaiter(this, arguments, void 0, function (localSheetName) {
                var user, db, ficha, uid, realtimeId, backupSheetId, dadosLocal, _a, snapBackup, snapColecoes, backupCloud, dadosBackup, colecoesCloud, configs, detalhes, publicacoes, carteiraResultado, _loop_2, configs_1, configs_1_1, config, editBase, operacoesRegularizacao, envio;
                var e_7, _b;
                var _c, _d, _f, _g, _h, _j;
                if (localSheetName === void 0) { localSheetName = ""; }
                return __generator(this, function (_k) {
                    switch (_k.label) {
                        case 0:
                            if (((_c = root.navigator) === null || _c === void 0 ? void 0 : _c.onLine) === false)
                                throw new Error("Conecte este aparelho à internet para regularizar a ficha.");
                            user = usuarioAtual(), db = banco();
                            if (!user || !db)
                                throw new Error("Entre com a mesma Conta Google usada nos outros aparelhos antes de regularizar a ficha.");
                            ficha = obterFichaSolicitada(localSheetName, true);
                            if (!ficha)
                                throw new Error("A ficha escolhida para regularização não existe mais neste aparelho.");
                            if (!fichaPodeUsarRealtime(ficha))
                                throw new Error("Esta cópia antiga está preservada e não pode substituir a ficha principal.");
                            uid = texto(user.uid), realtimeId = realtimeIdDaFicha(ficha), backupSheetId = texto(ficha.sheetId);
                            if (!realtimeId || !backupSheetId)
                                throw new Error("A ficha ainda não possui identidade de sincronização completa.");
                            dadosLocal = {};
                            try {
                                dadosLocal = JSON.parse(root.localStorage.getItem(ficha.key) || "{}");
                            }
                            catch (_e) {
                                dadosLocal = clonar(ficha.data || {});
                            }
                            if (!dadosLocal || typeof dadosLocal !== "object" || Array.isArray(dadosLocal))
                                dadosLocal = clonar(ficha.data || {});
                            return [4 /*yield*/, Promise.all([
                                    db.ref("userSheets/".concat(uid, "/").concat(backupSheetId)).once("value"),
                                    db.ref("sheetRealtime/".concat(uid, "/").concat(realtimeId, "/collections")).once("value")
                                ])];
                        case 1:
                            _a = __read.apply(void 0, [_k.sent(), 2]), snapBackup = _a[0], snapColecoes = _a[1];
                            backupCloud = ((_d = snapBackup === null || snapBackup === void 0 ? void 0 : snapBackup.val) === null || _d === void 0 ? void 0 : _d.call(snapBackup)) || {};
                            dadosBackup = (backupCloud === null || backupCloud === void 0 ? void 0 : backupCloud.deleted) === true ? {} : ((backupCloud === null || backupCloud === void 0 ? void 0 : backupCloud.data) && typeof backupCloud.data === "object" ? backupCloud.data : {});
                            colecoesCloud = ((_f = snapColecoes === null || snapColecoes === void 0 ? void 0 : snapColecoes.val) === null || _f === void 0 ? void 0 : _f.call(snapColecoes)) || {};
                            configs = [
                                { collection: "notas", field: "notasTopicos" },
                                { collection: "inventario", field: "inventarioItens" },
                                { collection: "jutsus", field: "jutsus" },
                                { collection: "armados", field: "armados" },
                                { collection: "kekkeiGenkai", field: "kekkeiGenkai" },
                                { collection: "carteiraHistorico", field: "carteiraHistorico" }
                            ];
                            detalhes = {}, publicacoes = [];
                            carteiraResultado = regularizarCarteiraMoedasPura({
                                local: (dadosLocal === null || dadosLocal === void 0 ? void 0 : dadosLocal.carteira) || {},
                                backup: (dadosBackup === null || dadosBackup === void 0 ? void 0 : dadosBackup.carteira) || {},
                                realtime: (colecoesCloud === null || colecoesCloud === void 0 ? void 0 : colecoesCloud.carteiraMoedas) || {}
                            });
                            dadosLocal.carteira = clonar(carteiraResultado.carteira);
                            detalhes.carteiraMoedas = {
                                total: carteiraResultado.total,
                                novos: carteiraResultado.toPublish.length,
                                conflitosPreservados: 0,
                                exclusoesRespeitadas: carteiraResultado.skippedDeleted
                            };
                            carteiraResultado.toPublish.forEach(function (item) { return publicacoes.push(__assign({ collection: "carteiraMoedas" }, item)); });
                            _loop_2 = function (config) {
                                var resultado = mesclarColecaoLegadaPura(config.collection, {
                                    local: Array.isArray(dadosLocal === null || dadosLocal === void 0 ? void 0 : dadosLocal[config.field]) ? dadosLocal[config.field] : [],
                                    backup: Array.isArray(dadosBackup === null || dadosBackup === void 0 ? void 0 : dadosBackup[config.field]) ? dadosBackup[config.field] : [],
                                    realtime: (colecoesCloud === null || colecoesCloud === void 0 ? void 0 : colecoesCloud[config.collection]) || {}
                                });
                                dadosLocal[config.field] = clonar(resultado.items);
                                detalhes[config.collection] = {
                                    total: resultado.items.length,
                                    novos: resultado.toPublish.length,
                                    conflitosPreservados: resultado.conflicts,
                                    exclusoesRespeitadas: resultado.skippedDeleted
                                };
                                resultado.toPublish.forEach(function (item) { return publicacoes.push(__assign({ collection: config.collection }, item)); });
                            };
                            try {
                                for (configs_1 = __values(configs), configs_1_1 = configs_1.next(); !configs_1_1.done; configs_1_1 = configs_1.next()) {
                                    config = configs_1_1.value;
                                    _loop_2(config);
                                }
                            }
                            catch (e_7_1) { e_7 = { error: e_7_1 }; }
                            finally {
                                try {
                                    if (configs_1_1 && !configs_1_1.done && (_b = configs_1.return)) _b.call(configs_1);
                                }
                                finally { if (e_7) throw e_7.error; }
                            }
                            /* Mantém os metadados/identidade da instalação atual. O backup remoto só
                               contribui com conteúdo de coleção; nunca troca owner, characterId ou sheetId. */
                            dadosLocal.__online = dadosLocal.__online && typeof dadosLocal.__online === "object" ? dadosLocal.__online : {};
                            dadosLocal.__online = __assign(__assign({}, (((_g = ficha.data) === null || _g === void 0 ? void 0 : _g.__online) || {})), dadosLocal.__online);
                            try {
                                root.localStorage.setItem(ficha.key, JSON.stringify(dadosLocal));
                            }
                            catch (_e) {
                                throw new Error("Não foi possível salvar o resultado regularizado neste aparelho.");
                            }
                            try {
                                if (typeof estado !== "undefined" && estado && typeof estado === "object") {
                                    estado.notasTopicos = clonar(dadosLocal.notasTopicos || []);
                                    estado.inventarioItens = clonar(dadosLocal.inventarioItens || []);
                                    estado.jutsus = clonar(dadosLocal.jutsus || []);
                                    estado.armados = clonar(dadosLocal.armados || []);
                                    estado.kekkeiGenkai = clonar(dadosLocal.kekkeiGenkai || []);
                                    estado.carteira = clonar(dadosLocal.carteira || { pd: 0, po: 0, pp: 0, pc: 0 });
                                    estado.carteiraHistorico = clonar(dadosLocal.carteiraHistorico || []);
                                }
                            }
                            catch (_e) { }
                            try {
                                (_h = root.persistirEstadoLocal) === null || _h === void 0 ? void 0 : _h.call(root, { emitir: false, confirmada: false, origem: "regularizacao-historica", motivo: "merge-seguro" });
                            }
                            catch (_e) { }
                            agendarAtualizacaoUi(["notasTopicos", "inventarioItens", "jutsus", "armados", "kekkeiGenkai", "carteira", "carteiraHistorico"], dadosLocal);
                            editBase = timestampEdicao();
                            operacoesRegularizacao = publicacoes.map(function (pub, indice) {
                                var op = criarOperacaoColecaoPura({
                                    uid: uid,
                                    sheetId: realtimeId, sheetName: ficha.name, colecao: pub.collection, itemId: pub.itemId, valor: pub.value,
                                    deleted: false, editAt: editBase + indice, deviceId: deviceId(), opId: idAleatorio("regulariza")
                                });
                                adicionarOutboxColecao(op, uid);
                                return op;
                            });
                            return [4 /*yield*/, enviarLoteRegularizacaoPuro(operacoesRegularizacao, enviarOperacaoColecao)];
                        case 2:
                            envio = _k.sent();
                            if (!envio.ok)
                                throw new Error(mensagemFalhasRegularizacaoPura(envio.falhas));
                            if (!(typeof ((_j = root.ShinobiOnline) === null || _j === void 0 ? void 0 : _j.atualizarBackupEstrutural) === "function")) return [3 /*break*/, 4];
                            return [4 /*yield*/, root.ShinobiOnline.atualizarBackupEstrutural(ficha.name, { motivo: "regularizacao-historica" })];
                        case 3:
                            _k.sent();
                            _k.label = 4;
                        case 4: return [2 /*return*/, {
                                ok: true, sheetId: backupSheetId,
                                realtimeId: realtimeId,
                                published: publicacoes.length,
                                details: detalhes,
                                total: carteiraResultado.total + configs.reduce(function (soma, c) { var _a; return soma + Number(((_a = detalhes[c.collection]) === null || _a === void 0 ? void 0 : _a.total) || 0); }, 0),
                                conflicts: configs.reduce(function (soma, c) { var _a; return soma + Number(((_a = detalhes[c.collection]) === null || _a === void 0 ? void 0 : _a.conflitosPreservados) || 0); }, 0),
                                skippedDeleted: carteiraResultado.skippedDeleted + configs.reduce(function (soma, c) { var _a; return soma + Number(((_a = detalhes[c.collection]) === null || _a === void 0 ? void 0 : _a.exclusoesRespeitadas) || 0); }, 0)
                            }];
                    }
                });
            });
        }
        function reconciliar() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!estadoRT.bootLiberado)
                                return [2 /*return*/, { skipped: true }];
                            return [4 /*yield*/, ativarFichaAtual().catch(function () { })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, processarOutbox()];
                    }
                });
            });
        }
        function liberarBoot() {
            if (estadoRT.bootLiberado)
                return;
            estadoRT.bootLiberado = true;
            agendarAtivacao(80);
        }
        root.ShinobiOnline.sincronizarCampoConfirmado = sincronizarCampoConfirmado;
        root.ShinobiOnline.sincronizarItemColecaoConfirmado = sincronizarItemColecaoConfirmado;
        root.ShinobiOnline.regularizarFichaCompleta = regularizarFichaCompleta;
        root.ShinobiOnline.aplicarSnapshotAutoritativo = aplicarSnapshotAutoritativo;
        root.ShinobiOnline.sincronizarPendenciasRealtime = processarOutbox;
        root.EkoRealtimeSync = {
            sincronizarCampoConfirmado: sincronizarCampoConfirmado,
            sincronizarItemColecaoConfirmado: sincronizarItemColecaoConfirmado,
            regularizarFichaCompleta: regularizarFichaCompleta,
            aplicarSnapshotAutoritativo: aplicarSnapshotAutoritativo,
            processarOutbox: processarOutbox,
            reconciliar: reconciliar,
            ativarFichaAtual: ativarFichaAtual,
            aguardarConvergenciaAtual: aguardarConvergenciaAtual,
            temPendencias: temPendencias,
            maiorEditAtConhecido: maiorEditAtPendenciasFicha,
            get estado() { var _a, _b, _c, _d; return { bootLiberado: estadoRT.bootLiberado, uid: uidAtual(), sheetId: ((_a = estadoRT.listener) === null || _a === void 0 ? void 0 : _a.sheetId) || "", convergente: Boolean(((_b = estadoRT.convergencia) === null || _b === void 0 ? void 0 : _b.concluida) && ((_d = (_c = estadoRT.convergencia) === null || _c === void 0 ? void 0 : _c.resultado) === null || _d === void 0 ? void 0 : _d.ok)) }; }
        };
        root.addEventListener("shinobi:online:auth", function () { if (estadoRT.bootLiberado)
            agendarAtivacao(100); });
        root.addEventListener("online", function () { if (estadoRT.bootLiberado)
            reconciliar().catch(function () { }); }, { passive: true });
        root.addEventListener("pagehide", function () { desconectarListener(); });
        var liberarDepoisDaRenderizacao = function () { return setTimeout(liberarBoot, 120); };
        if ((_b = root.ShinobiAppReady) === null || _b === void 0 ? void 0 : _b.executar) {
            root.ShinobiAppReady.executar(liberarDepoisDaRenderizacao);
        }
        else if (root.document.readyState === "complete") {
            setTimeout(liberarDepoisDaRenderizacao, 1200);
        }
        else {
            root.addEventListener("load", function () { return setTimeout(liberarDepoisDaRenderizacao, 1200); }, { once: true });
        }
        return true;
    }
    return { install: install, test: test };
});
