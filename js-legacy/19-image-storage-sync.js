/* GERADO AUTOMATICAMENTE — fonte: js/19-image-storage-sync.js — app 2.5.8.156. Não editar. */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
/* EKO 2.5.8.88 — imagens entre dispositivos via Firebase Storage.
 * O arquivo fica no Storage; o Realtime Database transporta apenas metadados.
 * IndexedDB continua sendo o cache/local-first da interface.
 */
(function (root, factory) {
    var emNode = typeof module !== "undefined" && module.exports;
    var api = factory(root);
    if (emNode)
        module.exports = api.test;
    else
        api.install();
})(typeof window !== "undefined" ? window : globalThis, function (root) {
    "use strict";
    var CHAVE_OUTBOX_BASE = "shinobi_image_cloud_outbox_v1";
    var CHAVE_VERSOES_BASE = "shinobi_image_cloud_versions_v1";
    var CHAVE_DEVICE = "shinobi_device_id_v1";
    var scriptsEmCarga = new Map();
    var filaSemConta = [];
    var processando = false;
    var reprocessar = false;
    var storagePromise = null;
    var listener = null;
    var timerAtivacao = 0;
    function texto(v) { return String(v == null ? "" : v).trim(); }
    function agora() { return Date.now(); }
    function idAleatorio(prefixo) {
        var _a;
        if (prefixo === void 0) { prefixo = "img"; }
        try {
            if ((_a = root === null || root === void 0 ? void 0 : root.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID)
                return "".concat(prefixo, "_").concat(root.crypto.randomUUID().replace(/-/g, ""));
        }
        catch (_e) { }
        return "".concat(prefixo, "_").concat(agora().toString(36), "_").concat(Math.random().toString(36).slice(2, 12));
    }
    function segmento(v) { return encodeURIComponent(texto(v)).replace(/\./g, "%2E"); }
    function alvoNormalizado(alvo) {
        var type = texto(alvo === null || alvo === void 0 ? void 0 : alvo.type);
        if (type === "avatar" || type === "profile-cover")
            return { type: type };
        if (type === "jutsu-cover" && texto(alvo === null || alvo === void 0 ? void 0 : alvo.jutsuId))
            return { type: type, jutsuId: texto(alvo.jutsuId) };
        return null;
    }
    function mediaKey(alvo) {
        var a = alvoNormalizado(alvo);
        if (!a)
            return "";
        return a.type === "jutsu-cover" ? "jutsu:".concat(a.jutsuId) : a.type;
    }
    function storagePath(uid, characterId, alvo) {
        var a = alvoNormalizado(alvo), u = segmento(uid), c = segmento(characterId);
        if (!a || !u || !c)
            return "";
        if (a.type === "avatar")
            return "users/".concat(u, "/characters/").concat(c, "/avatar/current.webp");
        if (a.type === "profile-cover")
            return "users/".concat(u, "/characters/").concat(c, "/profile-cover/current.webp");
        return "users/".concat(u, "/characters/").concat(c, "/jutsus/").concat(segmento(a.jutsuId), "/cover.webp");
    }
    function metadataPath(uid, characterId, alvo) {
        var a = alvoNormalizado(alvo), u = segmento(uid), c = segmento(characterId);
        if (!a || !u || !c)
            return "";
        if (a.type === "avatar")
            return "sheetMedia/".concat(u, "/").concat(c, "/avatar");
        if (a.type === "profile-cover")
            return "sheetMedia/".concat(u, "/").concat(c, "/profile-cover");
        return "sheetMedia/".concat(u, "/").concat(c, "/jutsus/").concat(segmento(a.jutsuId));
    }
    function criarOperacaoPura(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.uid, uid = _c === void 0 ? "" : _c, _d = _b.characterId, characterId = _d === void 0 ? "" : _d, _f = _b.sheetName, sheetName = _f === void 0 ? "Principal" : _f, target = _b.target, _g = _b.imageId, imageId = _g === void 0 ? "" : _g, _h = _b.deleted, deleted = _h === void 0 ? false : _h, _j = _b.version, version = _j === void 0 ? "" : _j, _k = _b.createdAt, createdAt = _k === void 0 ? 0 : _k, _l = _b.ownerUid, ownerUid = _l === void 0 ? "" : _l;
        var alvo = alvoNormalizado(target);
        return {
            uid: texto(uid), characterId: texto(characterId), sheetName: texto(sheetName) || "Principal",
            target: alvo, imageId: texto(imageId), deleted: deleted === true,
            version: texto(version) || idAleatorio("img"), createdAt: Number(createdAt || agora()), ownerUid: texto(ownerUid)
        };
    }
    function deveAplicarRemoto(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.pending, pending = _c === void 0 ? false : _c, _d = _b.remoteVersion, remoteVersion = _d === void 0 ? "" : _d, _f = _b.localVersion, localVersion = _f === void 0 ? "" : _f;
        if (pending)
            return false;
        var remoto = texto(remoteVersion), local = texto(localVersion);
        if (!remoto)
            return false;
        return remoto !== local;
    }
    function usuarioAtual() {
        var _a, _b;
        var snap = (_b = (_a = root.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.snapshot) === null || _b === void 0 ? void 0 : _b.call(_a);
        var user = snap === null || snap === void 0 ? void 0 : snap.user;
        return user && !user.anonymous && texto(user.uid) ? user : null;
    }
    function deviceId() {
        var _a, _b;
        var id = "";
        try {
            id = ((_a = root.localStorage) === null || _a === void 0 ? void 0 : _a.getItem(CHAVE_DEVICE)) || "";
        }
        catch (_e) { }
        if (!id) {
            id = idAleatorio("device");
            try {
                (_b = root.localStorage) === null || _b === void 0 ? void 0 : _b.setItem(CHAVE_DEVICE, id);
            }
            catch (_e) { }
        }
        return id;
    }
    function chaveConta(base, uid) { return "".concat(base, "__").concat(texto(uid)); }
    function lerJson(chave, padrao) {
        var _a;
        if (padrao === void 0) { padrao = {}; }
        try {
            return JSON.parse(((_a = root.localStorage) === null || _a === void 0 ? void 0 : _a.getItem(chave)) || "") || padrao;
        }
        catch (_e) {
            return padrao;
        }
    }
    function salvarJson(chave, valor) { var _a; try {
        (_a = root.localStorage) === null || _a === void 0 ? void 0 : _a.setItem(chave, JSON.stringify(valor));
    }
    catch (_e) { } }
    function lerOutbox(uid) { return lerJson(chaveConta(CHAVE_OUTBOX_BASE, uid), {}); }
    function gravarOutbox(uid, valor) { salvarJson(chaveConta(CHAVE_OUTBOX_BASE, uid), valor || {}); }
    function lerVersoes(uid) { return lerJson(chaveConta(CHAVE_VERSOES_BASE, uid), {}); }
    function gravarVersoes(uid, valor) { salvarJson(chaveConta(CHAVE_VERSOES_BASE, uid), valor || {}); }
    function versaoLocal(uid, characterId, alvo) { var _a, _b, _c; return texto((_c = (_b = (_a = lerVersoes(uid)) === null || _a === void 0 ? void 0 : _a[characterId]) === null || _b === void 0 ? void 0 : _b[mediaKey(alvo)]) === null || _c === void 0 ? void 0 : _c.version); }
    function registrarVersao(uid, characterId, alvo, version) {
        var dados = lerVersoes(uid);
        dados[characterId] = dados[characterId] || {};
        dados[characterId][mediaKey(alvo)] = { version: texto(version), appliedAt: agora() };
        gravarVersoes(uid, dados);
    }
    function temPendencia(uid, characterId, alvo) {
        var _a;
        var op = (_a = lerOutbox(uid)) === null || _a === void 0 ? void 0 : _a["".concat(characterId, "::").concat(mediaKey(alvo))];
        return Boolean(op);
    }
    function identidadePara(sheetName) {
        var _a, _b, _c, _d, _f, _g, _h, _j;
        var user = usuarioAtual();
        if (!user)
            return null;
        var ficha = (_b = (_a = root.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.garantirIdentidadeFichaRealtime) === null || _b === void 0 ? void 0 : _b.call(_a, sheetName);
        var characterId = texto((ficha === null || ficha === void 0 ? void 0 : ficha.characterId) || ((_d = (_c = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _c === void 0 ? void 0 : _c.__online) === null || _d === void 0 ? void 0 : _d.characterId) || (ficha === null || ficha === void 0 ? void 0 : ficha.realtimeId));
        if (!characterId)
            return null;
        var owner = texto(((_g = (_f = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _f === void 0 ? void 0 : _f.__online) === null || _g === void 0 ? void 0 : _g.characterOwnerUid) || ((_j = (_h = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _h === void 0 ? void 0 : _h.__online) === null || _j === void 0 ? void 0 : _j.realtimeOwnerUid));
        if (owner && owner !== texto(user.uid))
            return null;
        return { uid: texto(user.uid), characterId: characterId, sheetName: texto((ficha === null || ficha === void 0 ? void 0 : ficha.name) || sheetName) || "Principal" };
    }
    function carregarScript(url, timeoutMs) {
        if (timeoutMs === void 0) { timeoutMs = 18000; }
        if (scriptsEmCarga.has(url))
            return scriptsEmCarga.get(url);
        var promessa = new Promise(function (resolve, reject) {
            var _a, _b, _c, _d;
            var existente = __spreadArray([], __read((((_a = root.document) === null || _a === void 0 ? void 0 : _a.scripts) || [])), false).find(function (s) { return s.src === url; });
            if (((_b = existente === null || existente === void 0 ? void 0 : existente.dataset) === null || _b === void 0 ? void 0 : _b.shinobiLoaded) === "true")
                return resolve(url);
            var script = existente || ((_d = (_c = root.document) === null || _c === void 0 ? void 0 : _c.createElement) === null || _d === void 0 ? void 0 : _d.call(_c, "script"));
            if (!script)
                return reject(new Error("Documento indisponível para carregar Firebase Storage."));
            var timer = root.setTimeout(function () { var _a; if (!existente)
                (_a = script.remove) === null || _a === void 0 ? void 0 : _a.call(script); reject(new Error("Tempo esgotado ao carregar Firebase Storage.")); }, Math.max(5000, Number(timeoutMs) || 18000));
            script.async = true;
            script.src = url;
            script.dataset.shinobiFirebase = "true";
            script.onload = function () { root.clearTimeout(timer); script.dataset.shinobiLoaded = "true"; resolve(url); };
            script.onerror = function () { var _a; root.clearTimeout(timer); if (!existente)
                (_a = script.remove) === null || _a === void 0 ? void 0 : _a.call(script); reject(new Error("Não foi possível carregar Firebase Storage.")); };
            if (!existente)
                root.document.head.appendChild(script);
        }).finally(function () { return scriptsEmCarga.delete(url); });
        scriptsEmCarga.set(url, promessa);
        return promessa;
    }
    function carregarStorage() {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                if ((_a = root.firebase) === null || _a === void 0 ? void 0 : _a.storage)
                    return [2 /*return*/, root.firebase.app().storage()];
                if (storagePromise)
                    return [2 /*return*/, storagePromise];
                storagePromise = (function () { return __awaiter(_this, void 0, void 0, function () {
                    var opcoes, modoLegado, versao, fontesConfiguradas, fontes, ultimoErro, fontes_1, fontes_1_1, baseBruta, base, erro_1, e_1_1;
                    var e_1, _a;
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                opcoes = root.SHINOBI_FIREBASE_OPTIONS || {}, modoLegado = root.SHINOBI_LEGACY_MODE === true;
                                versao = modoLegado ? (opcoes.legacySdkVersion || "10.14.1") : (opcoes.sdkVersion || "12.16.0");
                                fontesConfiguradas = modoLegado ? opcoes.legacySdkSources : opcoes.sdkSources;
                                fontes = Array.isArray(fontesConfiguradas) && fontesConfiguradas.length ? fontesConfiguradas : ["https://www.gstatic.com/firebasejs/".concat(versao), "https://cdn.jsdelivr.net/npm/firebase@".concat(versao)];
                                ultimoErro = null;
                                _c.label = 1;
                            case 1:
                                _c.trys.push([1, 8, 9, 10]);
                                fontes_1 = __values(fontes), fontes_1_1 = fontes_1.next();
                                _c.label = 2;
                            case 2:
                                if (!!fontes_1_1.done) return [3 /*break*/, 7];
                                baseBruta = fontes_1_1.value;
                                base = String(baseBruta || "").replace(/\/$/, "");
                                _c.label = 3;
                            case 3:
                                _c.trys.push([3, 5, , 6]);
                                return [4 /*yield*/, carregarScript("".concat(base, "/firebase-storage-compat.js"), opcoes.sdkTimeoutMs || 18000)];
                            case 4:
                                _c.sent();
                                if ((_b = root.firebase) === null || _b === void 0 ? void 0 : _b.storage)
                                    return [2 /*return*/, root.firebase.app().storage()];
                                return [3 /*break*/, 6];
                            case 5:
                                erro_1 = _c.sent();
                                ultimoErro = erro_1;
                                console.warn("Firebase Storage indisponível nesta fonte:", base, (erro_1 === null || erro_1 === void 0 ? void 0 : erro_1.message) || erro_1);
                                return [3 /*break*/, 6];
                            case 6:
                                fontes_1_1 = fontes_1.next();
                                return [3 /*break*/, 2];
                            case 7: return [3 /*break*/, 10];
                            case 8:
                                e_1_1 = _c.sent();
                                e_1 = { error: e_1_1 };
                                return [3 /*break*/, 10];
                            case 9:
                                try {
                                    if (fontes_1_1 && !fontes_1_1.done && (_a = fontes_1.return)) _a.call(fontes_1);
                                }
                                finally { if (e_1) throw e_1.error; }
                                return [7 /*endfinally*/];
                            case 10: throw ultimoErro || new Error("Firebase Storage indisponível.");
                        }
                    });
                }); })().catch(function (erro) { storagePromise = null; throw erro; });
                return [2 /*return*/, storagePromise];
            });
        });
    }
    function banco() { var _a, _b, _c, _d; try {
        return ((_d = (_b = (_a = root.firebase) === null || _a === void 0 ? void 0 : _a.app) === null || _b === void 0 ? void 0 : (_c = _b.call(_a)).database) === null || _d === void 0 ? void 0 : _d.call(_c)) || null;
    }
    catch (_e) {
        return null;
    } }
    function enviarOperacao(op) {
        return __awaiter(this, void 0, void 0, function () {
            var user, storage, db, alvo, path, metaPath, refStorage, erro_2, blob, registro, outbox, chave;
            var _a, _b, _c, _d;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        user = usuarioAtual();
                        if (!user || texto(user.uid) !== texto(op.uid))
                            throw new Error("Conta Google indisponível para enviar imagem.");
                        if (((_a = root.navigator) === null || _a === void 0 ? void 0 : _a.onLine) === false)
                            throw new Error("offline");
                        return [4 /*yield*/, carregarStorage()];
                    case 1:
                        storage = _f.sent();
                        db = banco();
                        if (!db)
                            throw new Error("Realtime Database indisponível para metadados da imagem.");
                        alvo = alvoNormalizado(op.target), path = storagePath(op.uid, op.characterId, alvo), metaPath = metadataPath(op.uid, op.characterId, alvo);
                        if (!alvo || !path || !metaPath)
                            throw new Error("Destino de imagem inválido.");
                        refStorage = storage.ref(path);
                        if (!op.deleted) return [3 /*break*/, 6];
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, refStorage.delete()];
                    case 3:
                        _f.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        erro_2 = _f.sent();
                        if (!/object-not-found/i.test(texto(erro_2 === null || erro_2 === void 0 ? void 0 : erro_2.code) || texto(erro_2 === null || erro_2 === void 0 ? void 0 : erro_2.message)))
                            throw erro_2;
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 9];
                    case 6: return [4 /*yield*/, ((_c = (_b = root.ShinobiImagensLocal) === null || _b === void 0 ? void 0 : _b.obterBlob) === null || _c === void 0 ? void 0 : _c.call(_b, op.imageId))];
                    case 7:
                        blob = _f.sent();
                        if (!blob)
                            throw new Error("Imagem local não encontrada para upload.");
                        return [4 /*yield*/, refStorage.put(blob, { contentType: blob.type || "image/webp", customMetadata: { ekoVersion: op.version } })];
                    case 8:
                        _f.sent();
                        _f.label = 9;
                    case 9:
                        registro = {
                            kind: alvo.type,
                            path: path,
                            version: op.version, deleted: op.deleted === true,
                            updatedAt: root.firebase.database.ServerValue.TIMESTAMP, deviceId: deviceId()
                        };
                        if (alvo.type === "jutsu-cover")
                            registro.jutsuId = alvo.jutsuId;
                        return [4 /*yield*/, db.ref(metaPath).set(registro)];
                    case 10:
                        _f.sent();
                        registrarVersao(op.uid, op.characterId, alvo, op.version);
                        outbox = lerOutbox(op.uid), chave = "".concat(op.characterId, "::").concat(mediaKey(alvo));
                        if (texto((_d = outbox[chave]) === null || _d === void 0 ? void 0 : _d.version) === texto(op.version)) {
                            delete outbox[chave];
                            gravarOutbox(op.uid, outbox);
                        }
                        return [2 /*return*/, { ok: true, record: registro }];
                }
            });
        });
    }
    function processarOutbox() {
        return __awaiter(this, void 0, void 0, function () {
            var user, resultados, ops, ops_1, ops_1_1, op, _a, _b, erro_3, e_2_1;
            var e_2, _c;
            var _d;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (processando) {
                            reprocessar = true;
                            return [2 /*return*/, { busy: true }];
                        }
                        user = usuarioAtual();
                        if (!user || ((_d = root.navigator) === null || _d === void 0 ? void 0 : _d.onLine) === false)
                            return [2 /*return*/, { skipped: true }];
                        processando = true;
                        resultados = [];
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, , 12, 13]);
                        ops = Object.values(lerOutbox(user.uid)).filter(function (op) { return op && texto(op.uid) === texto(user.uid) && alvoNormalizado(op.target); });
                        ops.sort(function (a, b) { return Number(a.createdAt || 0) - Number(b.createdAt || 0); });
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 9, 10, 11]);
                        ops_1 = __values(ops), ops_1_1 = ops_1.next();
                        _f.label = 3;
                    case 3:
                        if (!!ops_1_1.done) return [3 /*break*/, 8];
                        op = ops_1_1.value;
                        _f.label = 4;
                    case 4:
                        _f.trys.push([4, 6, , 7]);
                        _b = (_a = resultados).push;
                        return [4 /*yield*/, enviarOperacao(op)];
                    case 5:
                        _b.apply(_a, [_f.sent()]);
                        return [3 /*break*/, 7];
                    case 6:
                        erro_3 = _f.sent();
                        resultados.push({ ok: false, error: erro_3, op: op });
                        return [3 /*break*/, 7];
                    case 7:
                        ops_1_1 = ops_1.next();
                        return [3 /*break*/, 3];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_2_1 = _f.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (ops_1_1 && !ops_1_1.done && (_c = ops_1.return)) _c.call(ops_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        processando = false;
                        if (reprocessar) {
                            reprocessar = false;
                            root.setTimeout(function () { return processarOutbox().catch(function () { }); }, 0);
                        }
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/, { ok: resultados.every(function (r) { return r.ok !== false; }), resultados: resultados }];
                }
            });
        });
    }
    function enfileirarDetalhe(detalhe) {
        var _a;
        if (root.__shinobiSheetTransition === true)
            return { skipped: true, reason: "sheet-transition" };
        var alvo = alvoNormalizado(detalhe === null || detalhe === void 0 ? void 0 : detalhe.target);
        if (!alvo)
            return { skipped: true, reason: "alvo-invalido" };
        var user = usuarioAtual();
        if (!user) {
            filaSemConta.push(__assign(__assign({}, detalhe), { target: alvo }));
            return { queued: true, waitingAuth: true };
        }
        var ownerUid = texto(detalhe === null || detalhe === void 0 ? void 0 : detalhe.ownerUid);
        if (ownerUid && ownerUid !== texto(user.uid))
            return { skipped: true, reason: "outra-conta" };
        var identidade = identidadePara(detalhe === null || detalhe === void 0 ? void 0 : detalhe.sheetName);
        if (!identidade)
            return { skipped: true, reason: "sem-identidade" };
        /* O evento de imagem carrega a identidade observada no instante do clique.
           Se uma migração/reparo trocou a identidade antes do callback assíncrono,
           não reaproveitamos a imagem em outra personagem. */
        var characterEvento = texto(detalhe === null || detalhe === void 0 ? void 0 : detalhe.characterId);
        if (characterEvento && characterEvento !== identidade.characterId)
            return { skipped: true, reason: "identidade-alterada" };
        var op = criarOperacaoPura({
            uid: identidade.uid, characterId: identidade.characterId, sheetName: identidade.sheetName, target: alvo,
            imageId: detalhe === null || detalhe === void 0 ? void 0 : detalhe.imageId, deleted: (detalhe === null || detalhe === void 0 ? void 0 : detalhe.deleted) === true, version: idAleatorio("img"), createdAt: (detalhe === null || detalhe === void 0 ? void 0 : detalhe.savedAt) || agora(), ownerUid: identidade.uid
        });
        var outbox = lerOutbox(op.uid);
        outbox["".concat(op.characterId, "::").concat(mediaKey(alvo))] = op;
        gravarOutbox(op.uid, outbox);
        if (((_a = root.navigator) === null || _a === void 0 ? void 0 : _a.onLine) !== false)
            root.setTimeout(function () { return processarOutbox().catch(function () { }); }, 0);
        ativarObservador(identidade.sheetName).catch(function () { });
        return { queued: true, op: op };
    }
    function drenarFilaSemConta() {
        if (!usuarioAtual() || !filaSemConta.length)
            return;
        var fila = filaSemConta.splice(0, filaSemConta.length);
        fila.forEach(function (item) { return enfileirarDetalhe(item); });
    }
    function baixarBlob(path) {
        return __awaiter(this, void 0, void 0, function () {
            var storage, ref, url, resposta;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, carregarStorage()];
                    case 1:
                        storage = _a.sent(), ref = storage.ref(path);
                        if (typeof ref.getBlob === "function")
                            return [2 /*return*/, ref.getBlob()];
                        return [4 /*yield*/, ref.getDownloadURL()];
                    case 2:
                        url = _a.sent();
                        return [4 /*yield*/, fetch(url, { cache: "no-store" })];
                    case 3:
                        resposta = _a.sent();
                        if (!resposta.ok)
                            throw new Error("Falha ao baixar imagem (".concat(resposta.status, ")."));
                        return [2 /*return*/, resposta.blob()];
                }
            });
        });
    }
    function aplicarRegistro(uid, characterId, alvo, registro) {
        return __awaiter(this, void 0, void 0, function () {
            var version, localVersion, aplicado_1, esperado, blob, aplicado;
            var _a, _b, _c, _d;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!registro || typeof registro !== "object")
                            return [2 /*return*/];
                        version = texto(registro.version);
                        if (!version)
                            return [2 /*return*/];
                        if (temPendencia(uid, characterId, alvo))
                            return [2 /*return*/];
                        localVersion = versaoLocal(uid, characterId, alvo);
                        if (!deveAplicarRemoto({ pending: false, remoteVersion: version, localVersion: localVersion })) {
                            return [2 /*return*/];
                        }
                        if (!(registro.deleted === true)) return [3 /*break*/, 2];
                        return [4 /*yield*/, ((_b = (_a = root.ShinobiImagensLocal) === null || _a === void 0 ? void 0 : _a.aplicarRemota) === null || _b === void 0 ? void 0 : _b.call(_a, { target: alvo, deleted: true, version: version }))];
                    case 1:
                        aplicado_1 = _f.sent();
                        if (aplicado_1 !== false)
                            registrarVersao(uid, characterId, alvo, version);
                        return [2 /*return*/];
                    case 2:
                        esperado = storagePath(uid, characterId, alvo);
                        if (texto(registro.path) !== esperado)
                            return [2 /*return*/];
                        return [4 /*yield*/, baixarBlob(esperado)];
                    case 3:
                        blob = _f.sent();
                        return [4 /*yield*/, ((_d = (_c = root.ShinobiImagensLocal) === null || _c === void 0 ? void 0 : _c.aplicarRemota) === null || _d === void 0 ? void 0 : _d.call(_c, { target: alvo, blob: blob, deleted: false, version: version }))];
                    case 4:
                        aplicado = _f.sent();
                        if (aplicado !== false)
                            registrarVersao(uid, characterId, alvo, version);
                        return [2 /*return*/];
                }
            });
        });
    }
    function aplicarSnapshot(uid_1, characterId_1, valor_1) {
        return __awaiter(this, arguments, void 0, function (uid, characterId, valor, sheetName) {
            var atual, tarefas;
            if (sheetName === void 0) { sheetName = ""; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        atual = identidadePara(sheetName);
                        if (!atual || texto(atual.uid) !== texto(uid) || texto(atual.characterId) !== texto(characterId)) {
                            return [2 /*return*/, { skipped: true, reason: "listener-identidade-obsoleta" }];
                        }
                        tarefas = [];
                        if (valor === null || valor === void 0 ? void 0 : valor.avatar)
                            tarefas.push(aplicarRegistro(uid, characterId, { type: "avatar" }, valor.avatar));
                        if (valor === null || valor === void 0 ? void 0 : valor["profile-cover"])
                            tarefas.push(aplicarRegistro(uid, characterId, { type: "profile-cover" }, valor["profile-cover"]));
                        Object.values((valor === null || valor === void 0 ? void 0 : valor.jutsus) || {}).forEach(function (reg) {
                            var jutsuId = texto(reg === null || reg === void 0 ? void 0 : reg.jutsuId);
                            if (jutsuId)
                                tarefas.push(aplicarRegistro(uid, characterId, { type: "jutsu-cover", jutsuId: jutsuId }, reg));
                        });
                        return [4 /*yield*/, Promise.all(tarefas)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { ok: true }];
                }
            });
        });
    }
    function desconectar() {
        if (listener) {
            try {
                listener.ref.off("value", listener.callback);
            }
            catch (_e) { }
            listener = null;
        }
    }
    function ativarObservador() {
        return __awaiter(this, arguments, void 0, function (sheetName) {
            var identidade, db, ref, callback;
            if (sheetName === void 0) { sheetName = ""; }
            return __generator(this, function (_a) {
                identidade = identidadePara(sheetName);
                if (!identidade) {
                    desconectar();
                    return [2 /*return*/, { skipped: true }];
                }
                if (listener && listener.uid === identidade.uid && listener.characterId === identidade.characterId)
                    return [2 /*return*/, { ok: true }];
                desconectar();
                db = banco();
                if (!db)
                    return [2 /*return*/, { skipped: true, reason: "sem-db" }];
                ref = db.ref("sheetMedia/".concat(segmento(identidade.uid), "/").concat(segmento(identidade.characterId)));
                callback = function (snap) { aplicarSnapshot(identidade.uid, identidade.characterId, snap.val() || {}, identidade.sheetName).catch(function (erro) { return console.warn("Falha ao aplicar imagem remota.", erro); }); };
                ref.on("value", callback, function (erro) { return console.warn("Metadados de imagens indisponíveis.", (erro === null || erro === void 0 ? void 0 : erro.code) || (erro === null || erro === void 0 ? void 0 : erro.message) || erro); });
                listener = { uid: identidade.uid, characterId: identidade.characterId, sheetName: identidade.sheetName, ref: ref, callback: callback };
                return [2 /*return*/, { ok: true }];
            });
        });
    }
    function agendarAtivacao() { root.clearTimeout(timerAtivacao); timerAtivacao = root.setTimeout(function () { drenarFilaSemConta(); ativarObservador().catch(function () { }); processarOutbox().catch(function () { }); }, 120); }
    function reaplicarSnapshotAtual() {
        var _a;
        if (!((_a = listener === null || listener === void 0 ? void 0 : listener.ref) === null || _a === void 0 ? void 0 : _a.once))
            return Promise.resolve({ skipped: true });
        return listener.ref.once("value").then(function (snap) { return aplicarSnapshot(listener.uid, listener.characterId, snap.val() || {}, listener.sheetName || ""); });
    }
    function install() {
        if (root.__ekoImageStorageSyncV1)
            return root.ShinobiImageCloud;
        root.__ekoImageStorageSyncV1 = true;
        var apiPublica = { enfileirarEvento: enfileirarDetalhe, processarPendencias: processarOutbox, ativarObservador: ativarObservador };
        root.ShinobiImageCloud = Object.freeze(apiPublica);
        root.addEventListener("shinobi:imagem-confirmada", function (evento) { return enfileirarDetalhe((evento === null || evento === void 0 ? void 0 : evento.detail) || {}); });
        root.addEventListener("shinobi:online:auth", agendarAtivacao);
        root.addEventListener("shinobi:online:pronto", agendarAtivacao);
        root.addEventListener("online", function () { agendarAtivacao(); }, { passive: true });
        root.addEventListener("shinobi:realtime-colecao-aplicada", function (evento) {
            var _a;
            if (texto((_a = evento === null || evento === void 0 ? void 0 : evento.detail) === null || _a === void 0 ? void 0 : _a.collection) === "jutsus")
                reaplicarSnapshotAtual().catch(function () { });
        });
        root.addEventListener("pagehide", desconectar);
        agendarAtivacao();
        return apiPublica;
    }
    return {
        install: install,
        test: { mediaKey: mediaKey, storagePath: storagePath, metadataPath: metadataPath, criarOperacaoPura: criarOperacaoPura, deveAplicarRemoto: deveAplicarRemoto, alvoNormalizado: alvoNormalizado }
    };
});
