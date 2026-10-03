/* GERADO AUTOMATICAMENTE — fonte: js/01-sheet-manager.js — app 2.5.8.154. Não editar. */
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
/* EKO 2.5.8.79 — exclusão individual protegida contra salvamento no pagehide. */
(function (root, factory) {
    var api = factory(root);
    if (typeof module !== "undefined" && module.exports)
        module.exports = api;
    if (root) {
        root.EkoSheetManager = api;
        if (root.document)
            api.instalar();
    }
})(typeof window !== "undefined" ? window : globalThis, function (root) {
    "use strict";
    var CHAVE_BASE = "ficha_ninja_app_v2";
    var CHAVE_LISTA = "ficha_ninja_lista_v1";
    var CHAVE_ATIVA = "ficha_ninja_ativa_v1";
    var PREFIXO = "".concat(CHAVE_BASE, "__");
    function texto(valor) { return String(valor == null ? "" : valor).trim(); }
    function limparNome(nome) {
        if (typeof root.limparNomeFicha === "function")
            return root.limparNomeFicha(nome);
        return texto(nome || "Principal").replace(/[^\w\-À-ÿ ]+/g, "").slice(0, 32) || "Principal";
    }
    function ehNomeCopiaAutomatica(nome) {
        var valor = texto(nome);
        if (/(?:\s+nuvem(?:\s+\d+)?)+$/i.test(valor))
            return true;
        /* O sistema antigo usava `Nuvem ${Date.now().toString(36)}` quando os
           sufixos normais já estavam ocupados. */
        return /^nuvem\s+[a-z0-9]{6,}$/i.test(valor);
    }
    function lerJson(chave, padrao) {
        try {
            var valor = JSON.parse(root.localStorage.getItem(chave) || "");
            return valor == null ? padrao : valor;
        }
        catch (_erro) {
            return padrao;
        }
    }
    function lerDadosPorChave(chave) {
        try {
            var valor = JSON.parse(root.localStorage.getItem(chave) || "{}");
            return valor && typeof valor === "object" && !Array.isArray(valor) ? valor : {};
        }
        catch (_erro) {
            return {};
        }
    }
    function chaveFicha(nome) {
        var limpo = limparNome(nome);
        return limpo === "Principal" ? CHAVE_BASE : "".concat(PREFIXO).concat(limpo);
    }
    function chavesStorage() {
        var _a, _b, _c;
        var saida = new Set();
        try {
            var total = Number(((_a = root.localStorage) === null || _a === void 0 ? void 0 : _a.length) || 0);
            for (var i = 0; i < total; i++) {
                var chave = (_c = (_b = root.localStorage).key) === null || _c === void 0 ? void 0 : _c.call(_b, i);
                if (chave)
                    saida.add(String(chave));
            }
        }
        catch (_erro) { }
        try {
            Object.keys(root.localStorage || {}).forEach(function (chave) { return saida.add(String(chave)); });
        }
        catch (_erro) { }
        return __spreadArray([], __read(saida), false);
    }
    function listarRegistrosFisicos() {
        var e_1, _a;
        var registros = [];
        try {
            for (var _b = __values(chavesStorage()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var chave = _c.value;
                if (chave !== CHAVE_BASE && !chave.startsWith(PREFIXO))
                    continue;
                var rawName = chave === CHAVE_BASE ? "Principal" : chave.slice(PREFIXO.length);
                registros.push({
                    key: chave,
                    rawName: rawName,
                    name: limparNome(rawName),
                    data: lerDadosPorChave(chave)
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return registros;
    }
    function nomesDaLista() {
        var lista = lerJson(CHAVE_LISTA, ["Principal"]);
        if (!Array.isArray(lista))
            lista = ["Principal"];
        var nomes = lista.map(limparNome).filter(Boolean);
        if (!nomes.includes("Principal"))
            nomes.unshift("Principal");
        return Array.from(new Set(nomes));
    }
    function agruparRegistrosFisicos() {
        var e_2, _a;
        var grupos = new Map();
        try {
            for (var _b = __values(listarRegistrosFisicos()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var registro = _c.value;
                if (!grupos.has(registro.name))
                    grupos.set(registro.name, []);
                grupos.get(registro.name).push(registro);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return grupos;
    }
    function escolherRegistroPrincipal(registros, nome) {
        var canonica = chaveFicha(nome);
        return (registros || []).find(function (item) { return item.key === canonica; }) || (registros || [])[0] || null;
    }
    function listarFichasLocais() {
        var grupos = agruparRegistrosFisicos();
        var nomes = Array.from(new Set(__spreadArray(__spreadArray([], __read(nomesDaLista()), false), __read(grupos.keys()), false)));
        if (!nomes.includes("Principal"))
            nomes.unshift("Principal");
        return nomes.map(function (nome) {
            var fisicos = grupos.get(nome) || [];
            var principal = escolherRegistroPrincipal(fisicos, nome);
            return {
                name: nome,
                key: (principal === null || principal === void 0 ? void 0 : principal.key) || chaveFicha(nome),
                data: (principal === null || principal === void 0 ? void 0 : principal.data) || {},
                rawName: (principal === null || principal === void 0 ? void 0 : principal.rawName) || nome,
                physicalKeys: fisicos.map(function (item) { return item.key; }),
                physicalRecords: fisicos
            };
        });
    }
    function obterFichaPorNome(nome) {
        var alvo = limparNome(nome);
        return listarFichasLocais().find(function (ficha) { return ficha.name === alvo; }) || null;
    }
    function onlineDaFicha(data) {
        return (data === null || data === void 0 ? void 0 : data.__online) && typeof data.__online === "object" ? data.__online : {};
    }
    function identidadesDaFicha(data) {
        var online = onlineDaFicha(data);
        return new Set([
            texto(online.characterId), texto(online.realtimeId), texto(online.sheetId),
            texto(online.sourceSheetId), texto(online.originSheetId)
        ].filter(Boolean));
    }
    function compartilhaIdentidade(dataA, dataB) {
        var e_3, _a;
        var a = identidadesDaFicha(dataA), b = identidadesDaFicha(dataB);
        try {
            for (var a_1 = __values(a), a_1_1 = a_1.next(); !a_1_1.done; a_1_1 = a_1.next()) {
                var id = a_1_1.value;
                if (b.has(id))
                    return true;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (a_1_1 && !a_1_1.done && (_a = a_1.return)) _a.call(a_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return false;
    }
    function normalizarConteudoComparacao(valor) {
        if (Array.isArray(valor))
            return valor.map(normalizarConteudoComparacao);
        if (!valor || typeof valor !== "object")
            return valor;
        var saida = {};
        Object.keys(valor).sort().forEach(function (chave) {
            if (chave === "__online")
                return;
            saida[chave] = normalizarConteudoComparacao(valor[chave]);
        });
        return saida;
    }
    function conteudoEquivalente(dataA, dataB) {
        try {
            return JSON.stringify(normalizarConteudoComparacao(dataA)) === JSON.stringify(normalizarConteudoComparacao(dataB));
        }
        catch (_erro) {
            return false;
        }
    }
    function classificarRegistroLegado(registro, principalData) {
        var online = onlineDaFicha(registro === null || registro === void 0 ? void 0 : registro.data);
        var explicitamenteLegado = online.legacyAutoCopy === true || online.syncDisabled === true;
        var nomeGerado = ehNomeCopiaAutomatica(registro === null || registro === void 0 ? void 0 : registro.rawName) || ehNomeCopiaAutomatica(registro === null || registro === void 0 ? void 0 : registro.name);
        var mesmaIdentidade = compartilhaIdentidade(registro === null || registro === void 0 ? void 0 : registro.data, principalData);
        var igualPrincipal = conteudoEquivalente(registro === null || registro === void 0 ? void 0 : registro.data, principalData);
        var copiaUsuario = online.userCopy === true;
        /* Nome, conteúdo igual ou identidade compartilhada podem ser justamente o
           resultado do bug que estamos reparando. Portanto nenhum desses sinais,
           isoladamente, autoriza exclusão automática. Só uma entrada já marcada
           explicitamente como legado E ainda byte-logicamente igual à Principal é
           considerada segura; qualquer divergência vai para revisão humana. */
        if (explicitamenteLegado && igualPrincipal && !copiaUsuario)
            return "segura";
        if (explicitamenteLegado || nomeGerado || mesmaIdentidade)
            return "revisar";
        return "normal";
    }
    function ehCopiaLegadaMarcada(ficha) {
        var _a;
        if (!ficha || limparNome(ficha.name) === "Principal")
            return false;
        var principal = obterFichaPorNome("Principal");
        var registros = ((_a = ficha.physicalRecords) === null || _a === void 0 ? void 0 : _a.length) ? ficha.physicalRecords : [{
                name: ficha.name, rawName: ficha.rawName || ficha.name, data: ficha.data || {}
            }];
        return registros.length > 0 && registros.every(function (registro) { return classificarRegistroLegado(registro, (principal === null || principal === void 0 ? void 0 : principal.data) || {}) === "segura"; });
    }
    function listarCopiasLegadasLocais() {
        var e_4, _a;
        var fichas = listarFichasLocais();
        var principal = fichas.find(function (ficha) { return ficha.name === "Principal"; });
        var seguras = [], revisar = [];
        try {
            for (var fichas_1 = __values(fichas), fichas_1_1 = fichas_1.next(); !fichas_1_1.done; fichas_1_1 = fichas_1.next()) {
                var ficha = fichas_1_1.value;
                if (ficha.name === "Principal")
                    continue;
                var registros = ficha.physicalRecords || [];
                if (!registros.length) {
                    if (ehNomeCopiaAutomatica(ficha.name))
                        revisar.push(ficha);
                    continue;
                }
                var classes = registros.map(function (registro) { return classificarRegistroLegado(registro, (principal === null || principal === void 0 ? void 0 : principal.data) || {}); });
                if (classes.every(function (classe) { return classe === "segura"; }))
                    seguras.push(ficha);
                else if (classes.some(function (classe) { return classe !== "normal"; }) || ehNomeCopiaAutomatica(ficha.name))
                    revisar.push(ficha);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (fichas_1_1 && !fichas_1_1.done && (_a = fichas_1.return)) _a.call(fichas_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return { seguras: seguras, revisar: revisar };
    }
    function atualizarListaAposExclusao(nomesExcluidos) {
        var excluir = new Set((nomesExcluidos || []).map(limparNome));
        var lista = lerJson(CHAVE_LISTA, ["Principal"]);
        if (!Array.isArray(lista))
            lista = ["Principal"];
        lista = lista.map(limparNome).filter(function (nome) { return !excluir.has(nome); });
        lista = Array.from(new Set(lista));
        if (!lista.includes("Principal"))
            lista.unshift("Principal");
        root.localStorage.setItem(CHAVE_LISTA, JSON.stringify(lista));
        var ativa = limparNome(root.localStorage.getItem(CHAVE_ATIVA) || "Principal");
        if (excluir.has(ativa))
            root.localStorage.setItem(CHAVE_ATIVA, "Principal");
        try {
            if (Array.isArray(root.fichas))
                root.fichas = root.fichas.filter(function (nome) { return !excluir.has(limparNome(nome)); });
        }
        catch (_erro) { }
        return lista;
    }
    function chavesFisicasDaFicha(nome) {
        var e_5, _a;
        var alvo = limparNome(nome);
        var chaves = new Set([chaveFicha(alvo)]);
        try {
            for (var _b = __values(listarRegistrosFisicos()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var registro = _c.value;
                if (registro.name === alvo)
                    chaves.add(registro.key);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return __spreadArray([], __read(chaves), false);
    }
    function exclusaoEmAndamento() {
        return Boolean(root.__ekoExclusaoFichaEmAndamento);
    }
    function iniciarTravaExclusao(nome) {
        var limpo = limparNome(nome);
        /* A exclusão da ficha ativa é também uma transição de identidade. Isso faz
           todos os módulos (realtime, backup, imagens e pagehide) falharem fechado
           enquanto a chave removida está sendo trocada pela Principal. */
        root.__shinobiSheetTransition = true;
        root.__ekoExclusaoFichaEmAndamento = {
            name: limpo,
            keys: chavesFisicasDaFicha(limpo),
            startedAt: Date.now()
        };
        return root.__ekoExclusaoFichaEmAndamento;
    }
    function encerrarTravaExclusao() {
        try {
            delete root.__ekoExclusaoFichaEmAndamento;
        }
        catch (_erro) {
            root.__ekoExclusaoFichaEmAndamento = null;
        }
        try {
            delete root.__shinobiSheetTransition;
        }
        catch (_erro) {
            root.__shinobiSheetTransition = false;
        }
    }
    function bloquearSalvamentoDeSaida(evento) {
        var _a;
        if (!exclusaoEmAndamento())
            return;
        /* O 02-runtime.js registra salvamento automático em pagehide/visibilitychange.
           Durante uma exclusão esses listeners não podem executar, senão recriam a
           chave que acabou de ser removida. stopImmediatePropagation não cancela a
           navegação; apenas impede os listeners posteriores deste mesmo evento. */
        try {
            (_a = evento === null || evento === void 0 ? void 0 : evento.stopImmediatePropagation) === null || _a === void 0 ? void 0 : _a.call(evento);
        }
        catch (_erro) { }
    }
    function instalarBloqueioSaida() {
        var _a, _b, _c, _d;
        if (root.__ekoBloqueioExclusaoInstalado)
            return;
        root.__ekoBloqueioExclusaoInstalado = true;
        try {
            (_a = root.addEventListener) === null || _a === void 0 ? void 0 : _a.call(root, "pagehide", bloquearSalvamentoDeSaida, true);
        }
        catch (_erro) { }
        try {
            (_b = root.addEventListener) === null || _b === void 0 ? void 0 : _b.call(root, "beforeunload", bloquearSalvamentoDeSaida, true);
        }
        catch (_erro) { }
        try {
            (_d = (_c = root.document) === null || _c === void 0 ? void 0 : _c.addEventListener) === null || _d === void 0 ? void 0 : _d.call(_c, "visibilitychange", bloquearSalvamentoDeSaida, true);
        }
        catch (_erro) { }
    }
    function removerFichaLocal(nome) {
        var e_6, _a;
        var limpo = limparNome(nome);
        if (!limpo || limpo === "Principal")
            return false;
        var ativa = limparNome(root.localStorage.getItem(CHAVE_ATIVA) || "Principal");
        if (ativa === limpo)
            root.localStorage.setItem(CHAVE_ATIVA, "Principal");
        var removeuAlgo = false;
        try {
            for (var _b = __values(chavesFisicasDaFicha(limpo)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var chave = _c.value;
                try {
                    if (root.localStorage.getItem(chave) !== null)
                        removeuAlgo = true;
                    root.localStorage.removeItem(chave);
                }
                catch (_erro) { }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        var listaAntes = nomesDaLista();
        atualizarListaAposExclusao([limpo]);
        if (listaAntes.includes(limpo))
            removeuAlgo = true;
        return removeuAlgo;
    }
    function excluirFichaMelhorada() {
        return __awaiter(this, void 0, void 0, function () {
            var nome, confirmar, _a, fichaAntes, _erro_1, removeu;
            var _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        nome = limparNome(root.localStorage.getItem(CHAVE_ATIVA) || "Principal");
                        if (!(nome === "Principal")) return [3 /*break*/, 4];
                        if (!(typeof root.avisoShinobi === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, root.avisoShinobi("Ficha protegida", "A ficha Principal não pode ser excluída.")];
                    case 1:
                        _j.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        (_b = root.alert) === null || _b === void 0 ? void 0 : _b.call(root, "A ficha Principal não pode ser excluída.");
                        _j.label = 3;
                    case 3: return [2 /*return*/, false];
                    case 4:
                        if (!(typeof root.modalShinobi === "function")) return [3 /*break*/, 6];
                        return [4 /*yield*/, root.modalShinobi("Excluir ficha?", "Excluir \u201C".concat(nome, "\u201D? A ficha Principal ser\u00E1 mantida. Se esta ficha estiver vinculada \u00E0 sua Conta Google, ela tamb\u00E9m ser\u00E1 removida da lista de sincroniza\u00E7\u00E3o. Backups hist\u00F3ricos continuam preservados."))];
                    case 5:
                        _a = _j.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _a = (_c = root.confirm) === null || _c === void 0 ? void 0 : _c.call(root, "Excluir \"".concat(nome, "\"? Se estiver sincronizada, a vers\u00E3o da nuvem tamb\u00E9m ser\u00E1 removida."));
                        _j.label = 7;
                    case 7:
                        confirmar = _a;
                        if (!confirmar)
                            return [2 /*return*/, false];
                        /* A trava precisa nascer ANTES da remoção. Ao chamar reload(), navegadores
                           disparam visibilitychange/pagehide; versões anteriores deixavam o runtime
                           salvar a ficha velha nesse intervalo e, assim, ressuscitá-la. */
                        iniciarTravaExclusao(nome);
                        fichaAntes = obterFichaPorNome(nome);
                        _j.label = 8;
                    case 8:
                        _j.trys.push([8, 10, , 11]);
                        (_e = (_d = root.ShinobiOnline) === null || _d === void 0 ? void 0 : _d.registrarExclusaoLocal) === null || _e === void 0 ? void 0 : _e.call(_d, nome, (fichaAntes === null || fichaAntes === void 0 ? void 0 : fichaAntes.data) || {});
                        return [4 /*yield*/, ((_g = (_f = root.ShinobiOnline) === null || _f === void 0 ? void 0 : _f.processarExclusoesPendentes) === null || _g === void 0 ? void 0 : _g.call(_f))];
                    case 9:
                        _j.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        _erro_1 = _j.sent();
                        return [3 /*break*/, 11];
                    case 11:
                        removeu = removerFichaLocal(nome);
                        if (!!removeu) return [3 /*break*/, 14];
                        if (!(typeof root.avisoShinobi === "function")) return [3 /*break*/, 13];
                        return [4 /*yield*/, root.avisoShinobi("Ficha não encontrada", "A entrada já não possui dados locais. A lista será reparada ao recarregar.")];
                    case 12:
                        _j.sent();
                        _j.label = 13;
                    case 13:
                        atualizarListaAposExclusao([nome]);
                        _j.label = 14;
                    case 14:
                        /* Não religamos realtime nesta página: ela está sendo destruída. A nova
                           página abrirá já na Principal e ativará o realtime pelo fluxo normal. */
                        (_h = root.alert) === null || _h === void 0 ? void 0 : _h.call(root, "Ficha excluída deste aparelho.");
                        try {
                            root.location.reload();
                        }
                        catch (_erro) {
                            /* Se o ambiente não conseguir recarregar, não deixamos o app travado sem
                               salvamento. Em um reload normal o novo contexto já nasce sem a trava. */
                            encerrarTravaExclusao();
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    }
    function nomesParaMensagem(fichas) {
        return (fichas || []).map(function (f) { return "\u201C".concat(limparNome(f.name), "\u201D"); }).join(" • ");
    }
    function limparCopiasAntigas() {
        return __awaiter(this, void 0, void 0, function () {
            var analise, seguras, revisar, complemento, nomes, avisoRevisao, ok, _a, removidas, seguras_1, seguras_1_1, ficha, _erro_2;
            var e_7, _b;
            var _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        analise = listarCopiasLegadasLocais();
                        seguras = analise.seguras;
                        revisar = analise.revisar;
                        if (!!seguras.length) return [3 /*break*/, 4];
                        complemento = revisar.length
                            ? " Existem ".concat(revisar.length, " entrada(s) suspeita(s), mas sem evid\u00EAncia suficiente para exclus\u00E3o autom\u00E1tica; elas foram preservadas.")
                            : "";
                        if (!(typeof root.avisoShinobi === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, root.avisoShinobi("Nenhuma cópia segura para limpar", "N\u00E3o encontrei c\u00F3pias antigas que possam ser removidas automaticamente.".concat(complemento))];
                    case 1:
                        _h.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        (_c = root.alert) === null || _c === void 0 ? void 0 : _c.call(root, "Nenhuma c\u00F3pia segura para remover.".concat(complemento));
                        _h.label = 3;
                    case 3: return [2 /*return*/, { removidas: 0, revisar: revisar.length }];
                    case 4:
                        nomes = nomesParaMensagem(seguras);
                        avisoRevisao = revisar.length ? " ".concat(revisar.length, " entrada(s) duvidosa(s) ser\u00E3o mantidas.") : "";
                        if (!(typeof root.modalShinobi === "function")) return [3 /*break*/, 6];
                        return [4 /*yield*/, root.modalShinobi("Limpar cópias antigas?", "Ser\u00E3o removidas ".concat(seguras.length, " entrada(s) antigas deste aparelho: ").concat(nomes, ". A ficha Principal e os dados online dela ser\u00E3o mantidos.").concat(avisoRevisao))];
                    case 5:
                        _a = _h.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _a = (_d = root.confirm) === null || _d === void 0 ? void 0 : _d.call(root, "Excluir ".concat(seguras.length, " c\u00F3pia(s) antigas deste aparelho? ").concat(nomes));
                        _h.label = 7;
                    case 7:
                        ok = _a;
                        if (!ok)
                            return [2 /*return*/, { removidas: 0, revisar: revisar.length }];
                        removidas = [];
                        try {
                            for (seguras_1 = __values(seguras), seguras_1_1 = seguras_1.next(); !seguras_1_1.done; seguras_1_1 = seguras_1.next()) {
                                ficha = seguras_1_1.value;
                                if (!ehCopiaLegadaMarcada(ficha))
                                    continue;
                                if (removerFichaLocal(ficha.name))
                                    removidas.push(limparNome(ficha.name));
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (seguras_1_1 && !seguras_1_1.done && (_b = seguras_1.return)) _b.call(seguras_1);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                        _h.label = 8;
                    case 8:
                        _h.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, ((_f = (_e = root.EkoRealtimeSync) === null || _e === void 0 ? void 0 : _e.ativarFichaAtual) === null || _f === void 0 ? void 0 : _f.call(_e))];
                    case 9:
                        _h.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        _erro_2 = _h.sent();
                        return [3 /*break*/, 11];
                    case 11:
                        (_g = root.alert) === null || _g === void 0 ? void 0 : _g.call(root, "".concat(removidas.length, " c\u00F3pia(s) antiga(s) removida(s) deste aparelho.").concat(revisar.length ? " ".concat(revisar.length, " foram preservadas por seguran\u00E7a.") : ""));
                        try {
                            root.location.reload();
                        }
                        catch (_erro) { }
                        return [2 /*return*/, { removidas: removidas.length, revisar: revisar.length }];
                }
            });
        });
    }
    function instalar() {
        /* Este arquivo é carregado antes de 02-runtime.js; registrar o bloqueio aqui
           garante que, numa exclusão, ele rode antes dos salvamentos de saída. */
        instalarBloqueioSaida();
        root.excluirFicha = excluirFichaMelhorada;
        root.limparCopiasAntigas = limparCopiasAntigas;
    }
    return {
        ehNomeCopiaAutomatica: ehNomeCopiaAutomatica,
        ehCopiaLegadaMarcada: ehCopiaLegadaMarcada,
        listarRegistrosFisicos: listarRegistrosFisicos,
        listarFichasLocais: listarFichasLocais,
        obterFichaPorNome: obterFichaPorNome,
        listarCopiasLegadasLocais: listarCopiasLegadasLocais,
        chavesFisicasDaFicha: chavesFisicasDaFicha,
        exclusaoEmAndamento: exclusaoEmAndamento,
        iniciarTravaExclusao: iniciarTravaExclusao,
        encerrarTravaExclusao: encerrarTravaExclusao,
        instalarBloqueioSaida: instalarBloqueioSaida,
        excluirFichaMelhorada: excluirFichaMelhorada,
        limparCopiasAntigas: limparCopiasAntigas,
        removerFichaLocal: removerFichaLocal,
        instalar: instalar
    };
});
