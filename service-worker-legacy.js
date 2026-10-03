/* GERADO AUTOMATICAMENTE — fonte: service-worker.js — app 2.5.8.154. Não editar. */
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
/* Ficha Ninja RPG 2.5.8.154 — build progressivo para navegadores antigos.
 * Mantém cache versionado e estratégia de atualização multi-dispositivo.
 */
var APP_VERSION = "2.5.8.154";
var CACHE_PREFIX = "shinobi";
var SHELL_CACHE = "".concat(CACHE_PREFIX, "-shell-").concat(APP_VERSION);
var RUNTIME_CACHE = "".concat(CACHE_PREFIX, "-runtime-").concat(APP_VERSION);
var FIREBASE_CACHE = "".concat(CACHE_PREFIX, "-firebase-").concat(APP_VERSION);
var LIMITE_DOWNLOADS_SIMULTANEOS = 1;
var CACHE_VERSOES_RETIDAS = 6;
var FIREBASE_VERSION = "12.16.0";
var FIREBASE_GSTATIC_BASE = "https://www.gstatic.com/firebasejs/".concat(FIREBASE_VERSION);
var FIREBASE_JSDELIVR_BASE = "https://cdn.jsdelivr.net/npm/firebase@".concat(FIREBASE_VERSION);
var LEGACY_WORKER = String(self.location && self.location.pathname || "").includes("service-worker-legacy.js");
var JS_ROOT = LEGACY_WORKER ? "js-legacy" : "js";
var QR_LOCAL_PATH = LEGACY_WORKER ? "vendor/qrcode-local-legacy.js" : "vendor/qrcode-local.js";
var APP_SHELL = [
    "./index.html?v=".concat(APP_VERSION),
    "./manifest.json?v=".concat(APP_VERSION),
    "./css/app.css?v=".concat(APP_VERSION),
    "./css/carteira-v233.css?v=".concat(APP_VERSION),
    "./css/update.css?v=".concat(APP_VERSION),
    "./css/catalogo.css?v=".concat(APP_VERSION),
    "./css/regras-natureza.css?v=".concat(APP_VERSION),
    "./css/batalha-viva.css?v=".concat(APP_VERSION),
    "./css/level-up.css?v=".concat(APP_VERSION),
    "./css/pericias.css?v=".concat(APP_VERSION),
    "./css/online.css?v=".concat(APP_VERSION),
    "./css/organizacao-retratil.css?v=".concat(APP_VERSION),
    "./css/shinobi-theme.css?v=".concat(APP_VERSION),
    "./css/design-system-eko.css?v=".concat(APP_VERSION),
    "./css/perfil-home.css?v=".concat(APP_VERSION),
    "./css/cabecalho-navegacao-passo3.css?v=".concat(APP_VERSION),
    "./css/status.css?v=".concat(APP_VERSION),
    "./css/combate.css?v=".concat(APP_VERSION),
    "./css/jutsus.css?v=".concat(APP_VERSION),
    "./css/loja-v25843.css?v=".concat(APP_VERSION),
    "./css/notas.css?v=".concat(APP_VERSION),
    "./css/legacy-compat.css?v=".concat(APP_VERSION),
    "./".concat(JS_ROOT, "/00-shinobi-ui.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/00-item-identity.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/01-core.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/01-sheet-manager.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/02-runtime.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/03-images.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/04-jutsus.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/05-armados-item-level.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/05-kekkei-item-level.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/09-catalogo.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/05-battle.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/06-inventory.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/06-wallet-item-level.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/07-profile.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/08-update.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/08-post-render-loader.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/10-regras-natureza.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/11-batalha-ui.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/12-efeitos-jutsus.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/13-motor-universal.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/14-level-up.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/15-testes-resistencia.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/16-pericias.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/17-dano-inteligente.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/18-online-config.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/19-character-identity.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/19-backup-manager-utils.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/19-online-core.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/19-realtime-fields-utils.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/19-realtime-sync-engine.js?v=").concat(APP_VERSION),
    "./".concat(QR_LOCAL_PATH, "?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/20-online-ui.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/21-online-hooks.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/22-organizacao-retratil.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/23-security-hardening.js?v=").concat(APP_VERSION),
    "./".concat(JS_ROOT, "/24-terminologia-eko.js?v=").concat(APP_VERSION),
    "./data/catalogo-jutsus.json?v=".concat(APP_VERSION),
    "./data/efeitos-jutsus.json?v=".concat(APP_VERSION),
    "./data/progressao-ninja.json?v=".concat(APP_VERSION),
];
if (LEGACY_WORKER) {
    APP_SHELL.push("./js-legacy/00-polyfills.js?v=".concat(APP_VERSION));
}
var INDEX_URL = new URL("./index.html", self.registration.scope).href;
var SHELL_URLS = APP_SHELL.map(function (path) { return new URL(path, self.registration.scope).href; });
var SHELL_PATHS = new Set(SHELL_URLS.map(function (url) { return new URL(url).pathname; }));
function respostaPodeSerSalva(response) {
    return Boolean(response && response.ok && (response.type === "basic" || response.type === "default"));
}
function recursoShellOpcional(url) {
    try {
        return new URL(url).pathname.includes("/assets/inventory-");
    }
    catch (_erro) {
        return false;
    }
}
function avisarClientes(mensagem) {
    return __awaiter(this, void 0, void 0, function () {
        var clientes, _erro_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, self.clients.matchAll({ includeUncontrolled: true, type: "window" })];
                case 1:
                    clientes = _a.sent();
                    clientes.forEach(function (cliente) { return cliente.postMessage(mensagem); });
                    return [3 /*break*/, 3];
                case 2:
                    _erro_1 = _a.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchComTentativas(url_1) {
    return __awaiter(this, arguments, void 0, function (url, maxTentativas) {
        var ultimoErro, _loop_1, tentativa, state_1;
        if (maxTentativas === void 0) { maxTentativas = 3; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ultimoErro = null;
                    _loop_1 = function (tentativa) {
                        var controller, timer, requestOptions, response, erro_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    controller = typeof AbortController === "function" ? new AbortController() : null;
                                    timer = setTimeout(function () { if (controller)
                                        controller.abort(); }, 20000);
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 6]);
                                    requestOptions = {
                                        cache: "reload",
                                        credentials: "same-origin"
                                    };
                                    if (controller)
                                        requestOptions.signal = controller.signal;
                                    return [4 /*yield*/, fetch(new Request(url, requestOptions))];
                                case 2:
                                    response = _b.sent();
                                    clearTimeout(timer);
                                    if (!respostaPodeSerSalva(response)) {
                                        throw new Error("HTTP ".concat(response.status, " em ").concat(url));
                                    }
                                    return [2 /*return*/, { value: response }];
                                case 3:
                                    erro_1 = _b.sent();
                                    clearTimeout(timer);
                                    ultimoErro = erro_1;
                                    if (!(tentativa < maxTentativas)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500 * tentativa); })];
                                case 4:
                                    _b.sent();
                                    _b.label = 5;
                                case 5: return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    tentativa = 1;
                    _a.label = 1;
                case 1:
                    if (!(tentativa <= maxTentativas)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(tentativa)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    tentativa += 1;
                    return [3 /*break*/, 1];
                case 4: throw ultimoErro || new Error("Falha ao baixar ".concat(url));
            }
        });
    });
}
function executarComLimite(itens, limite, tarefa) {
    return __awaiter(this, void 0, void 0, function () {
        var proximo, quantidade, trabalhadores;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    proximo = 0;
                    quantidade = Math.max(1, Math.min(limite, itens.length));
                    trabalhadores = Array.from({ length: quantidade }, function () { return __awaiter(_this, void 0, void 0, function () {
                        var indice;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!true) return [3 /*break*/, 2];
                                    indice = proximo;
                                    proximo += 1;
                                    if (indice >= itens.length)
                                        return [2 /*return*/];
                                    return [4 /*yield*/, tarefa(itens[indice], indice)];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 0];
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(trabalhadores)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function instalarAppShell() {
    return __awaiter(this, void 0, void 0, function () {
        var cache, carregados, total;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, caches.open(SHELL_CACHE)];
                case 1:
                    cache = _a.sent();
                    carregados = 0;
                    total = SHELL_URLS.length;
                    return [4 /*yield*/, avisarClientes({
                            type: "SW_INSTALL_PROGRESS",
                            version: APP_VERSION,
                            loaded: 0,
                            total: total
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, executarComLimite(SHELL_URLS, LIMITE_DOWNLOADS_SIMULTANEOS, function (url) { return __awaiter(_this, void 0, void 0, function () {
                            var recursoUrl, pathname, chave, response, canonica, erro_2, opcional;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 6, , 8]);
                                        recursoUrl = new URL(url);
                                        pathname = recursoUrl.pathname;
                                        chave = pathname.endsWith("/index.html") ? INDEX_URL : url;
                                        return [4 /*yield*/, fetchComTentativas(url)];
                                    case 1:
                                        response = _a.sent();
                                        // Mantém a chave versionada e também uma chave canônica sem query string.
                                        // Vários recursos internos (principalmente imagens referenciadas pelo CSS/JS)
                                        // podem ser solicitados com uma versão diferente ou sem ?v=. Sem este alias,
                                        // o arquivo existe no cache mas não é encontrado quando o aparelho está offline.
                                        return [4 /*yield*/, cache.put(chave, response.clone())];
                                    case 2:
                                        // Mantém a chave versionada e também uma chave canônica sem query string.
                                        // Vários recursos internos (principalmente imagens referenciadas pelo CSS/JS)
                                        // podem ser solicitados com uma versão diferente ou sem ?v=. Sem este alias,
                                        // o arquivo existe no cache mas não é encontrado quando o aparelho está offline.
                                        _a.sent();
                                        if (!!pathname.endsWith("/index.html")) return [3 /*break*/, 4];
                                        canonica = new URL(url);
                                        canonica.search = "";
                                        canonica.hash = "";
                                        return [4 /*yield*/, cache.put(canonica.href, response.clone())];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        carregados += 1;
                                        return [4 /*yield*/, avisarClientes({
                                                type: "SW_INSTALL_PROGRESS",
                                                version: APP_VERSION,
                                                loaded: carregados,
                                                total: total
                                            })];
                                    case 5:
                                        _a.sent();
                                        return [3 /*break*/, 8];
                                    case 6:
                                        erro_2 = _a.sent();
                                        opcional = recursoShellOpcional(url);
                                        carregados += opcional ? 1 : 0;
                                        return [4 /*yield*/, avisarClientes({
                                                type: opcional ? "SW_INSTALL_PROGRESS" : "SW_INSTALL_ERROR",
                                                version: APP_VERSION,
                                                url: url,
                                                loaded: carregados,
                                                total: total,
                                                skipped: opcional,
                                                message: String((erro_2 === null || erro_2 === void 0 ? void 0 : erro_2.message) || erro_2)
                                            })];
                                    case 7:
                                        _a.sent();
                                        if (opcional) {
                                            console.warn("Recurso visual opcional não foi pré-carregado:", url, erro_2);
                                            return [2 /*return*/];
                                        }
                                        throw erro_2;
                                    case 8: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function compararVersoesCache(a, b) {
    var partesA = String(a || "").split(/[.-]/).map(function (valor) { return Number(valor) || 0; });
    var partesB = String(b || "").split(/[.-]/).map(function (valor) { return Number(valor) || 0; });
    var tamanho = Math.max(partesA.length, partesB.length);
    for (var i = 0; i < tamanho; i += 1) {
        var av = partesA[i] || 0;
        var bv = partesB[i] || 0;
        if (av > bv)
            return 1;
        if (av < bv)
            return -1;
    }
    return 0;
}
function identificarCacheVersionado(nome) {
    var prefixos = [
        "".concat(CACHE_PREFIX, "-shell-"),
        "".concat(CACHE_PREFIX, "-runtime-"),
        "".concat(CACHE_PREFIX, "-firebase-")
    ];
    var prefixo = prefixos.find(function (item) { return String(nome || "").startsWith(item); });
    if (!prefixo)
        return null;
    var versao = String(nome).slice(prefixo.length).trim();
    if (!/^\d+(?:\.\d+){1,5}$/.test(versao))
        return null;
    return { nome: String(nome), versao: versao };
}
function limparCachesAntigosComRetencao() {
    return __awaiter(this, void 0, void 0, function () {
        var nomes, reconhecidos, versoes, manter, antigos, removidos, antigos_1, antigos_1_1, nome, erro_3, e_1_1;
        var e_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, caches.keys()];
                case 1:
                    nomes = _b.sent();
                    reconhecidos = nomes
                        .map(identificarCacheVersionado)
                        .filter(Boolean);
                    versoes = __spreadArray([], __read(new Set(reconhecidos.map(function (item) { return item.versao; }))), false).sort(function (a, b) { return compararVersoesCache(b, a); });
                    manter = new Set(versoes.slice(0, CACHE_VERSOES_RETIDAS));
                    manter.add(APP_VERSION);
                    antigos = reconhecidos
                        .filter(function (item) { return !manter.has(item.versao); })
                        .map(function (item) { return item.nome; });
                    if (!antigos.length)
                        return [2 /*return*/, { removidos: [], mantidos: __spreadArray([], __read(manter), false) }];
                    removidos = [];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 9, 10, 11]);
                    antigos_1 = __values(antigos), antigos_1_1 = antigos_1.next();
                    _b.label = 3;
                case 3:
                    if (!!antigos_1_1.done) return [3 /*break*/, 8];
                    nome = antigos_1_1.value;
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, caches.delete(nome)];
                case 5:
                    if (_b.sent())
                        removidos.push(nome);
                    return [3 /*break*/, 7];
                case 6:
                    erro_3 = _b.sent();
                    console.warn("Não foi possível remover cache antigo:", nome, erro_3);
                    return [3 /*break*/, 7];
                case 7:
                    antigos_1_1 = antigos_1.next();
                    return [3 /*break*/, 3];
                case 8: return [3 /*break*/, 11];
                case 9:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 11];
                case 10:
                    try {
                        if (antigos_1_1 && !antigos_1_1.done && (_a = antigos_1.return)) _a.call(antigos_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/, { removidos: removidos, mantidos: __spreadArray([], __read(manter), false) }];
            }
        });
    });
}
function urlCanonicaSemBusca(url) {
    var canonica = new URL(url);
    canonica.search = "";
    canonica.hash = "";
    return canonica.href;
}
function buscarShellNoCache(request) {
    return __awaiter(this, void 0, void 0, function () {
        var cache, exata, canonica, rede;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, caches.open(SHELL_CACHE)];
                case 1:
                    cache = _a.sent();
                    return [4 /*yield*/, cache.match(request)];
                case 2:
                    exata = _a.sent();
                    if (exata)
                        return [2 /*return*/, exata];
                    return [4 /*yield*/, cache.match(urlCanonicaSemBusca(request.url))];
                case 3:
                    canonica = _a.sent();
                    if (canonica)
                        return [2 /*return*/, canonica];
                    return [4 /*yield*/, fetch(new Request(request, { cache: "no-store" }))];
                case 4:
                    rede = _a.sent();
                    if (!respostaPodeSerSalva(rede)) return [3 /*break*/, 7];
                    return [4 /*yield*/, cache.put(request, rede.clone())];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, cache.put(urlCanonicaSemBusca(request.url), rede.clone())];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [2 /*return*/, rede];
            }
        });
    });
}
// Código e dados do shell formam uma coorte imutável. Um documento controlado
// por este worker recebe somente arquivos preparados para APP_VERSION.
function buscarCodigoAtualizado(request) {
    return __awaiter(this, void 0, void 0, function () {
        var url, versaoSolicitada, cache, exata, canonica, rede;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = new URL(request.url);
                    versaoSolicitada = String(url.searchParams.get("v") || "").trim();
                    if (!(versaoSolicitada && versaoSolicitada !== APP_VERSION)) return [3 /*break*/, 2];
                    return [4 /*yield*/, avisarClientes({
                            type: "SW_VERSION_MISMATCH",
                            workerVersion: APP_VERSION,
                            requestedVersion: versaoSolicitada,
                            url: request.url
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, new Response("Versão de recurso incompatível com o Service Worker ativo.", {
                            status: 409,
                            headers: {
                                "Content-Type": "text/plain; charset=utf-8",
                                "Cache-Control": "no-store"
                            }
                        })];
                case 2: return [4 /*yield*/, caches.open(SHELL_CACHE)];
                case 3:
                    cache = _a.sent();
                    return [4 /*yield*/, cache.match(request)];
                case 4:
                    exata = _a.sent();
                    if (exata)
                        return [2 /*return*/, exata];
                    if (!!versaoSolicitada) return [3 /*break*/, 6];
                    return [4 /*yield*/, cache.match(urlCanonicaSemBusca(request.url))];
                case 5:
                    canonica = _a.sent();
                    if (canonica)
                        return [2 /*return*/, canonica];
                    _a.label = 6;
                case 6: return [4 /*yield*/, fetch(new Request(request, { cache: "no-store" }))];
                case 7:
                    rede = _a.sent();
                    if (!respostaPodeSerSalva(rede)) return [3 /*break*/, 10];
                    return [4 /*yield*/, cache.put(request, rede.clone())];
                case 8:
                    _a.sent();
                    if (!!versaoSolicitada) return [3 /*break*/, 10];
                    return [4 /*yield*/, cache.put(urlCanonicaSemBusca(request.url), rede.clone())];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [2 /*return*/, rede];
            }
        });
    });
}
function abrirPaginaPrincipal(request) {
    return __awaiter(this, void 0, void 0, function () {
        var cache, atual, resposta;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, caches.open(SHELL_CACHE)];
                case 1:
                    cache = _a.sent();
                    return [4 /*yield*/, cache.match(INDEX_URL)];
                case 2:
                    atual = _a.sent();
                    if (atual)
                        return [2 /*return*/, atual];
                    return [4 /*yield*/, fetch(new Request(request, { cache: "no-store" }))];
                case 3:
                    resposta = _a.sent();
                    if (!respostaPodeSerSalva(resposta)) return [3 /*break*/, 5];
                    return [4 /*yield*/, cache.put(INDEX_URL, resposta.clone())];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, resposta];
            }
        });
    });
}
function staleWhileRevalidate(request, event) {
    return __awaiter(this, void 0, void 0, function () {
        var cache, salva, atualizar, rede;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, caches.open(RUNTIME_CACHE)];
                case 1:
                    cache = _a.sent();
                    return [4 /*yield*/, cache.match(request, { ignoreSearch: true })];
                case 2:
                    salva = _a.sent();
                    atualizar = fetch(request)
                        .then(function (response) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!respostaPodeSerSalva(response)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, cache.put(request, response.clone())];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, limitarCache(RUNTIME_CACHE, 80)];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [2 /*return*/, response];
                            }
                        });
                    }); })
                        .catch(function () { return null; });
                    event.waitUntil(atualizar);
                    if (salva)
                        return [2 /*return*/, salva];
                    return [4 /*yield*/, atualizar];
                case 3:
                    rede = _a.sent();
                    if (rede)
                        return [2 /*return*/, rede];
                    throw new Error("Recurso indispon\u00EDvel: ".concat(request.url));
            }
        });
    });
}
function limitarCache(nome, limite) {
    return __awaiter(this, void 0, void 0, function () {
        var cache, chaves;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, caches.open(nome)];
                case 1:
                    cache = _a.sent();
                    return [4 /*yield*/, cache.keys()];
                case 2:
                    chaves = _a.sent();
                    _a.label = 3;
                case 3:
                    if (!(chaves.length > limite)) return [3 /*break*/, 5];
                    return [4 /*yield*/, cache.delete(chaves.shift())];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function respostaFirebasePodeSerSalva(response) {
    return Boolean(response && (response.ok || response.type === "opaque"));
}
function alternativoFirebase(url) {
    if (url.startsWith(FIREBASE_GSTATIC_BASE))
        return url.replace(FIREBASE_GSTATIC_BASE, FIREBASE_JSDELIVR_BASE);
    if (url.startsWith(FIREBASE_JSDELIVR_BASE))
        return url.replace(FIREBASE_JSDELIVR_BASE, FIREBASE_GSTATIC_BASE);
    return null;
}
function baixarFirebase(url) {
    return __awaiter(this, void 0, void 0, function () {
        var controller, timer, requisicao, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    controller = new AbortController();
                    timer = setTimeout(function () { return controller.abort(); }, 12000);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    requisicao = new Request(url, { mode: "no-cors", cache: "reload", credentials: "omit", signal: controller.signal });
                    return [4 /*yield*/, fetch(requisicao)];
                case 2:
                    response = _a.sent();
                    if (!respostaFirebasePodeSerSalva(response))
                        throw new Error("Firebase SDK indispon\u00EDvel: ".concat(url));
                    return [2 /*return*/, response];
                case 3:
                    clearTimeout(timer);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function responderFirebase(request) {
    return __awaiter(this, void 0, void 0, function () {
        var cache, salva, response, erroPrincipal_1, alternativa, salvaAlternativa, response, _erroAlternativa_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, caches.open(FIREBASE_CACHE)];
                case 1:
                    cache = _a.sent();
                    return [4 /*yield*/, cache.match(request, { ignoreSearch: true })];
                case 2:
                    salva = _a.sent();
                    if (salva)
                        return [2 /*return*/, salva];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 7, , 16]);
                    return [4 /*yield*/, fetch(request)];
                case 4:
                    response = _a.sent();
                    if (!respostaFirebasePodeSerSalva(response)) return [3 /*break*/, 6];
                    return [4 /*yield*/, cache.put(request, response.clone())];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/, response];
                case 7:
                    erroPrincipal_1 = _a.sent();
                    alternativa = alternativoFirebase(request.url);
                    if (!alternativa) return [3 /*break*/, 15];
                    return [4 /*yield*/, cache.match(alternativa, { ignoreSearch: true })];
                case 8:
                    salvaAlternativa = _a.sent();
                    if (!salvaAlternativa) return [3 /*break*/, 10];
                    return [4 /*yield*/, cache.put(request, salvaAlternativa.clone())];
                case 9:
                    _a.sent();
                    return [2 /*return*/, salvaAlternativa];
                case 10:
                    _a.trys.push([10, 14, , 15]);
                    return [4 /*yield*/, baixarFirebase(alternativa)];
                case 11:
                    response = _a.sent();
                    return [4 /*yield*/, cache.put(alternativa, response.clone())];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, cache.put(request, response.clone())];
                case 13:
                    _a.sent();
                    return [2 /*return*/, response];
                case 14:
                    _erroAlternativa_1 = _a.sent();
                    return [3 /*break*/, 15];
                case 15: throw erroPrincipal_1;
                case 16: return [2 /*return*/];
            }
        });
    });
}
self.addEventListener("install", function (event) {
    /* Instala somente o shell de código. Firebase e assets pesados entram sob demanda,
       depois que o aplicativo já está utilizável. */
    event.waitUntil(instalarAppShell());
});
self.addEventListener("activate", function (event) {
    /* Continua sem clients.claim(): a release nova não toma uma aba no meio da
       sessão. A limpeza também é deliberadamente conservadora: preserva as 6
       coortes mais recentes que realmente existem neste aparelho e só remove
       caches reconhecidos mais antigos. */
    event.waitUntil(limparCachesAntigosComRetencao().catch(function (erro) {
        console.warn("Falha ao limpar caches PWA antigos:", erro);
    }));
});
self.addEventListener("fetch", function (event) {
    var request = event.request;
    if (request.method !== "GET" || request.headers.has("range"))
        return;
    var url = new URL(request.url);
    var firebaseExterno = (url.hostname === "www.gstatic.com" && url.pathname.includes("/firebasejs/".concat(FIREBASE_VERSION, "/")))
        || (url.hostname === "cdn.jsdelivr.net" && url.pathname.includes("/npm/firebase@".concat(FIREBASE_VERSION, "/")));
    if (firebaseExterno) {
        event.respondWith(responderFirebase(request));
        return;
    }
    if (url.origin !== self.location.origin)
        return;
    // version.json precisa sempre vir da rede para anunciar a versão publicada.
    if (url.pathname.endsWith("/version.json"))
        return;
    if (request.mode === "navigate") {
        event.respondWith(abrirPaginaPrincipal(request));
        return;
    }
    if (SHELL_PATHS.has(url.pathname)) {
        var mutavel = /\.(?:css|js|json)$/i.test(url.pathname);
        event.respondWith(mutavel ? buscarCodigoAtualizado(request) : buscarShellNoCache(request));
        return;
    }
    var estatico = /\.(?:png|jpe?g|webp|svg|ico|woff2?)$/i.test(url.pathname);
    if (estatico)
        event.respondWith(staleWhileRevalidate(request, event));
});
self.addEventListener("message", function (event) {
    var _a, _b;
    var data = event.data || {};
    if (data.type === "SKIP_WAITING") {
        self.skipWaiting();
        return;
    }
    if (data.type === "GET_VERSION") {
        var resposta = { type: "SERVICE_WORKER_VERSION", version: APP_VERSION };
        if ((_a = event.ports) === null || _a === void 0 ? void 0 : _a[0])
            event.ports[0].postMessage(resposta);
        else
            (_b = event.source) === null || _b === void 0 ? void 0 : _b.postMessage(resposta);
    }
});
