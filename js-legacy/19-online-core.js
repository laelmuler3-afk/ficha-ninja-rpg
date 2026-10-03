/* GERADO AUTOMATICAMENTE — fonte: js/19-online-core.js — app 2.5.8.154. Não editar. */
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
/* Ficha Ninja RPG — motor Firebase, salas, fichas, turnos e XP. */
(function () {
    "use strict";
    var CHAVE_SESSAO = "shinobi_online_session_v1";
    var CHAVE_DEVICE = "shinobi_device_id_v1";
    var CHAVE_SYNC_LEGADA = "shinobi_sheet_sync_v1";
    var CHAVE_SYNC_BASE = "shinobi_sheet_sync_v2";
    var CHAVE_OUTBOX_BASE = "shinobi_sheet_outbox_v1";
    var CHAVE_BACKUP_OUTBOX_BASE = "shinobi_backup_outbox_v1";
    var CHAVE_XP_PROCESSADO = "shinobi_xp_events_v1";
    var CHAVE_RESTORE_RESERVA_PREFIX = "shinobi_restore_reserve_v1__";
    var LIMITE_RESERVA_RESTORE_MS = 30 * 60 * 1000;
    var CAMPAIGN_SCHEMA_VERSION = 5;
    var EVENTO = new EventTarget();
    var CARACTERES_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var CACHE_BACKUPS_HISTORICOS = new Map();
    var LIMITE_CACHE_BACKUP_MS = 5 * 60 * 1000;
    var estadoOnline = {
        iniciado: false,
        configurado: false,
        carregando: false,
        conectado: false,
        user: null,
        auth: null,
        db: null,
        api: null,
        salaId: null,
        sala: null,
        presencas: {},
        campanhas: [],
        membrosCampanha: [],
        membrosCampanhaId: null,
        npcsCampanha: [],
        npcsCampanhaId: null,
        xpLedgerCampanha: [],
        xpLedgerCampanhaId: null,
        xpReceiptsCampanha: {},
        xpReceiptsCampanhaId: null,
        xpInbox: {},
        fichasNuvem: [],
        unsubscribeSala: null,
        unsubscribePresenca: null,
        unsubscribeCampanhas: null,
        unsubscribeMembrosCampanha: null,
        unsubscribeNpcsCampanha: null,
        unsubscribeXpLedgerCampanha: null,
        unsubscribeXpReceiptsCampanha: null,
        unsubscribeXpInbox: null,
        unsubscribeFichas: null,
        unsubscribeEventos: null,
        unsubscribeConnected: null,
        presenceGeneration: 0,
        sessionGeneration: 0,
        syncTimers: new Map(),
        syncQueues: new Map(),
        dirtySheets: new Set(),
        cloudQueue: Promise.resolve(),
        reconciliandoSync: false,
        processandoXp: false,
        processandoXpCampanha: false,
        deduplicandoEfeitos: false,
        lastDedupAt: 0,
        ultimoErro: null
    };
    function emitir(tipo, detalhe) {
        if (detalhe === void 0) { detalhe = {}; }
        EVENTO.dispatchEvent(new CustomEvent(tipo, { detail: detalhe }));
        window.dispatchEvent(new CustomEvent("shinobi:online:".concat(tipo), { detail: detalhe }));
    }
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
    function agora() { return Date.now(); }
    function texto(valor) { return String(valor == null ? "" : valor).trim(); }
    function slug(valor) {
        return texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
            .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "ficha";
    }
    function idAleatorio(prefixo) {
        var _a;
        if (prefixo === void 0) { prefixo = "id"; }
        if ((_a = window.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID)
            return "".concat(prefixo, "_").concat(crypto.randomUUID().replace(/-/g, ""));
        return "".concat(prefixo, "_").concat(agora().toString(36), "_").concat(Math.random().toString(36).slice(2, 12));
    }
    function obterDeviceId() {
        var id = localStorage.getItem(CHAVE_DEVICE);
        if (!id) {
            id = idAleatorio("device");
            localStorage.setItem(CHAVE_DEVICE, id);
        }
        return id;
    }
    function hashLeve(valor) {
        var str = typeof valor === "string" ? valor : JSON.stringify(valor);
        var hash = 2166136261;
        for (var i = 0; i < str.length; i += 1) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(16).padStart(8, "0");
    }
    function limparReservasRestauracaoLocais() {
        var limite = agora() - LIMITE_RESERVA_RESTORE_MS;
        try {
            for (var i = localStorage.length - 1; i >= 0; i -= 1) {
                var chave = localStorage.key(i);
                if (!chave || !chave.startsWith(CHAVE_RESTORE_RESERVA_PREFIX))
                    continue;
                var resto = chave.slice(CHAVE_RESTORE_RESERVA_PREFIX.length);
                var criadoEm = Number(resto.split("__", 1)[0]);
                /* Não apaga uma reserva recente: outra aba pode estar no meio de uma
                   restauração legítima. Só resíduos antigos são tratados como órfãos. */
                if (!Number.isFinite(criadoEm) || criadoEm <= limite)
                    localStorage.removeItem(chave);
            }
        }
        catch (_erro) { }
    }
    function prepararReservaRestauracaoLocal(chave, dados, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.sheetId, sheetId = _c === void 0 ? "" : _c;
        var serializado;
        try {
            serializado = JSON.stringify(dados);
        }
        catch (erro) {
            var falha = new Error("N\u00E3o foi poss\u00EDvel preparar a ficha restaurada para armazenamento local. ".concat(texto(erro === null || erro === void 0 ? void 0 : erro.message)).trim());
            falha.code = "shinobi/restore-preflight";
            falha.cause = erro;
            throw falha;
        }
        var atual = "";
        try {
            atual = localStorage.getItem(chave) || "";
        }
        catch (erro) {
            var falha = new Error("O armazenamento local deste aparelho n\u00E3o p\u00F4de ser verificado. ".concat(texto(erro === null || erro === void 0 ? void 0 : erro.message)).trim());
            falha.code = "shinobi/restore-preflight";
            falha.cause = erro;
            throw falha;
        }
        var calcular = backupUtils().calcularReservaPersistenciaLocal;
        var plano = typeof calcular === "function"
            ? calcular(serializado, atual)
            : { reserva: Math.max(0, serializado.length - atual.length) };
        var chaveReserva = "".concat(CHAVE_RESTORE_RESERVA_PREFIX).concat(agora(), "__").concat(slug(sheetId || "ficha"), "__").concat(idAleatorio("restore"));
        var ativa = false;
        try {
            if (Number(plano.reserva || 0) > 0) {
                localStorage.setItem(chaveReserva, "0".repeat(Number(plano.reserva)));
                ativa = true;
            }
        }
        catch (erro) {
            try {
                localStorage.removeItem(chaveReserva);
            }
            catch (_ignorar) { }
            var falha = new Error("O aparelho n\u00E3o possui espa\u00E7o local suficiente para guardar esta vers\u00E3o da ficha. ".concat(texto(erro === null || erro === void 0 ? void 0 : erro.message)).trim());
            falha.code = "shinobi/restore-preflight";
            falha.cause = erro;
            throw falha;
        }
        var liberada = false;
        return {
            serializado: serializado,
            plano: plano,
            liberar: function () {
                if (liberada)
                    return;
                liberada = true;
                if (ativa) {
                    try {
                        localStorage.removeItem(chaveReserva);
                    }
                    catch (_erro) { }
                }
            },
            confirmar: function () {
                /* Libera o espaço reservado e substitui a ficha sem await entre as duas
                   operações. A janela para outra escrita consumir a quota é mínima. */
                this.liberar();
                localStorage.setItem(chave, serializado);
            }
        };
    }
    function hashFicha(valor) {
        var copia = clonar(valor || {});
        /* Metadados de transporte nunca fazem parte do conteúdo da personagem.
           Isso evita conflitos falsos quando sheetId, ownerUid ou versão de
           identidade mudam durante uma migração entre aparelhos. */
        if (copia && typeof copia === "object")
            delete copia.__online;
        return hashLeve(copia);
    }
    function hashFichaSemVinculo(valor) {
        var copia = clonar(valor || {});
        /* Usado somente para reconhecer, sem risco, uma cópia idêntica criada em
           outro aparelho antes de receber o mesmo sheetId da nuvem. */
        if (copia && typeof copia === "object")
            delete copia.__online;
        return hashLeve(copia);
    }
    function nomeSemSufixoNuvem(valor) {
        return texto(valor).replace(/(?:\s+nuvem(?:\s+\d+)?)+$/i, "").trim();
    }
    function chaveLogicaFicha(ficha) {
        var dados = (ficha === null || ficha === void 0 ? void 0 : ficha.data) && typeof ficha.data === "object" ? ficha.data : {};
        /* Esta chave existe SOMENTE para localizar cópias legadas com sufixo
           "Nuvem 2/3/4" durante a ferramenta de limpeza local. Ela nunca pode ser
           usada para decidir que duas fichas representam a mesma personagem. */
        var base = texto(ficha === null || ficha === void 0 ? void 0 : ficha.name) || texto(dados.nome) || texto(ficha === null || ficha === void 0 ? void 0 : ficha.characterName) || "Ficha";
        return nomeSemSufixoNuvem(base).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
    }
    function ehNomeCopiaAutomatica(valor) {
        return /(?:\s+nuvem(?:\s+\d+)?)+$/i.test(texto(valor));
    }
    function fichaBloqueadaNuvem(fichaOuDados) {
        var dados = (fichaOuDados === null || fichaOuDados === void 0 ? void 0 : fichaOuDados.data) && typeof fichaOuDados.data === "object" ? fichaOuDados.data : fichaOuDados;
        var online = (dados === null || dados === void 0 ? void 0 : dados.__online) && typeof dados.__online === "object" ? dados.__online : {};
        return online.syncDisabled === true || online.legacyAutoCopy === true;
    }
    function pontuacaoConteudoFicha(dados) {
        var raiz = dados && typeof dados === "object" ? dados : {};
        var pontos = 0, nos = 0;
        var visitar = function (valor, chave, profundidade) {
            if (chave === void 0) { chave = ""; }
            if (profundidade === void 0) { profundidade = 0; }
            if (nos++ > 3500 || profundidade > 7 || chave === "__online")
                return;
            if (valor == null)
                return;
            if (typeof valor === "string") {
                var t = valor.trim();
                if (!t || /^data:image\//i.test(t))
                    return;
                pontos += 1;
                if (t.length > 24)
                    pontos += 1;
                return;
            }
            if (typeof valor === "number") {
                if (Number.isFinite(valor) && Math.abs(valor) > 0)
                    pontos += 1;
                return;
            }
            if (typeof valor === "boolean") {
                if (valor)
                    pontos += 1;
                return;
            }
            if (Array.isArray(valor)) {
                if (valor.length)
                    pontos += Math.min(4, valor.length);
                valor.slice(0, 60).forEach(function (item) { return visitar(item, "", profundidade + 1); });
                return;
            }
            if (typeof valor === "object") {
                Object.entries(valor).slice(0, 220).forEach(function (_a) {
                    var _b = __read(_a, 2), k = _b[0], v = _b[1];
                    return visitar(v, k, profundidade + 1);
                });
            }
        };
        visitar(raiz);
        if (texto(raiz.nome))
            pontos += 8;
        if (Number(raiz.nivel || 0) > 1)
            pontos += 3;
        ["pvMax", "chakraMax", "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"].forEach(function (k) {
            var v = Number(raiz[k]);
            if (Number.isFinite(v) && v > 0)
                pontos += 2;
        });
        return pontos;
    }
    function alteracaoPareceEsvaziamento(antes, depois) {
        var origem = pontuacaoConteudoFicha(antes);
        var destino = pontuacaoConteudoFicha(depois);
        if (origem < 12)
            return false;
        return destino <= Math.max(4, Math.floor(origem * 0.35)) && destino <= origem - 10;
    }
    function selecionarRegistroCanonico(itens) {
        var _a, _b;
        var ordenados = __spreadArray([], __read((itens || [])), false).sort(function (a, b) {
            var _a, _b, _c, _d;
            var dataDiff = Number(((_a = b.cloud) === null || _a === void 0 ? void 0 : _a.updatedAt) || 0) - Number(((_b = a.cloud) === null || _b === void 0 ? void 0 : _b.updatedAt) || 0);
            if (dataDiff)
                return dataDiff;
            return Number(((_c = b.cloud) === null || _c === void 0 ? void 0 : _c.revision) || 0) - Number(((_d = a.cloud) === null || _d === void 0 ? void 0 : _d.revision) || 0);
        });
        var maisRecente = ordenados[0];
        if (!maisRecente)
            return null;
        var maisRico = __spreadArray([], __read(ordenados), false).sort(function (a, b) { var _a, _b; return pontuacaoConteudoFicha((_a = b.cloud) === null || _a === void 0 ? void 0 : _a.data) - pontuacaoConteudoFicha((_b = a.cloud) === null || _b === void 0 ? void 0 : _b.data); })[0];
        if (maisRico && maisRico.sheetId !== maisRecente.sheetId && alteracaoPareceEsvaziamento((_a = maisRico.cloud) === null || _a === void 0 ? void 0 : _a.data, (_b = maisRecente.cloud) === null || _b === void 0 ? void 0 : _b.data)) {
            return maisRico;
        }
        return maisRecente;
    }
    function agruparRegistrosNuvem(valor) {
        /* v2.5.8.137 — uma identidade de ficha nunca é inferida pelo nome.
           Cada sheetId remoto é tratado como uma ficha independente. A limpeza
           antiga agrupava registros por nome (inclusive removendo sufixos
           "Nuvem") e podia fundir personagens distintos ou ressuscitar uma ficha
           antiga quando o usuário reutilizava o mesmo nome. Duplicatas legadas
           continuam preservadas para revisão, em vez de serem mescladas/apagadas
           automaticamente. */
        return Object.entries(valor || {}).flatMap(function (_a) {
            var _b = __read(_a, 2), sheetId = _b[0], cloud = _b[1];
            if (!cloud || typeof cloud !== "object" || cloud.deleted === true)
                return [];
            var item = { sheetId: sheetId, cloud: cloud };
            return [{ chave: "sheet:".concat(sheetId), itens: [item], canonico: item, duplicatas: [] }];
        });
    }
    function lerJson(chave, padrao) {
        try {
            var v = JSON.parse(localStorage.getItem(chave) || "");
            return v !== null && v !== void 0 ? v : padrao;
        }
        catch (_erro) {
            return padrao;
        }
    }
    function salvarJson(chave, valor) { localStorage.setItem(chave, JSON.stringify(valor)); }
    function uidContaAtiva() {
        return texto(estadoOnline.user && !estadoOnline.user.anonymous ? estadoOnline.user.uid : "");
    }
    function chaveConta(base, uid) {
        if (uid === void 0) { uid = uidContaAtiva(); }
        var id = texto(uid);
        return id ? "".concat(base, "__").concat(id) : "";
    }
    function chaveIdentidadeFicha(nome) {
        return nomeSemSufixoNuvem(texto(nome) || "Principal")
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
            .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "principal";
    }
    function characterIdPorSheetId(uid, sheetId) {
        var conta = texto(uid), ficha = texto(sheetId);
        if (!conta || !ficha)
            return idAleatorio("char");
        var a = hashLeve("eko:v3:character:".concat(conta, ":").concat(ficha));
        var b = hashLeve("".concat(ficha, ":").concat(conta, ":stable-character"));
        return "char_".concat(a).concat(b);
    }
    function descricaoDispositivo() {
        var ua = String(navigator.userAgent || "");
        if (/Android/i.test(ua))
            return "Android";
        if (/iPhone|iPad|iPod/i.test(ua))
            return "iPhone/iPad";
        if (/Windows/i.test(ua))
            return "Windows";
        if (/Macintosh|Mac OS X/i.test(ua))
            return "macOS";
        if (/Linux/i.test(ua))
            return "Linux";
        return "Dispositivo";
    }
    function configuracaoValida() {
        var _a;
        var config = window.SHINOBI_FIREBASE_CONFIG || {};
        var obrigatorios = ["apiKey", "authDomain", "databaseURL", "projectId", "appId"];
        return Boolean(((_a = window.SHINOBI_FIREBASE_OPTIONS) === null || _a === void 0 ? void 0 : _a.enabled) !== false && obrigatorios.every(function (k) { return texto(config[k]); }));
    }
    function erroAmigavel(erro) {
        var codigo = texto(erro === null || erro === void 0 ? void 0 : erro.code);
        var mapa = {
            "auth/popup-closed-by-user": "A entrada com Google foi cancelada.",
            "auth/popup-blocked": "O navegador bloqueou a janela de login. Tente novamente.",
            "auth/unauthorized-domain": "Este domínio ainda não foi autorizado no Firebase Authentication.",
            "auth/network-request-failed": "Não foi possível conectar ao Firebase. Verifique a internet.",
            "auth/internal-error": "O Firebase Authentication não conseguiu concluir o login neste navegador. O aplicativo tentou recuperar a sessão; se o erro persistir, desative bloqueadores de conteúdo para este site e tente novamente no navegador normal.",
            "auth/web-storage-unsupported": "O navegador bloqueou o armazenamento necessário para manter o login. Permita cookies/dados do site ou use o navegador normal.",
            "auth/user-disabled": "Esta Conta Google está desativada no Firebase Authentication.",
            "auth/operation-not-allowed": "O login com Google não está habilitado no Firebase Authentication.",
            "auth/cancelled-popup-request": "Uma tentativa de login anterior ainda estava aberta. Tente novamente.",
            "auth/credential-already-in-use": "Esta Conta Google já possui fichas na nuvem. Entre nela para acessar os dados.",
            "auth/email-already-in-use": "Este e-mail já possui uma conta no aplicativo.",
            "PERMISSION_DENIED": "O Firebase recusou esta operação. Revise as regras do banco.",
            "permission-denied": "O Firebase recusou esta operação. Revise as regras do banco."
        };
        var mensagem = texto(erro === null || erro === void 0 ? void 0 : erro.message);
        if (/failed to fetch dynamically imported module|não foi possível carregar o módulo online|tempo esgotado ao carregar o módulo online/i.test(mensagem)) {
            return "O modo online não pôde ser carregado agora. A ficha continua disponível offline. Verifique a internet e tente novamente.";
        }
        return mapa[codigo] || mensagem || "Ocorreu um erro na conexão online.";
    }
    var scriptsFirebaseEmCarga = new Map();
    var retryOnlineInstalado = false;
    function carregarScriptFirebase(url, timeoutMs) {
        if (timeoutMs === void 0) { timeoutMs = 18000; }
        if (scriptsFirebaseEmCarga.has(url))
            return scriptsFirebaseEmCarga.get(url);
        var promessa = new Promise(function (resolve, reject) {
            var _a;
            var existente = __spreadArray([], __read(document.scripts), false).find(function (script) { return script.src === url; });
            if (((_a = existente === null || existente === void 0 ? void 0 : existente.dataset) === null || _a === void 0 ? void 0 : _a.shinobiLoaded) === "true")
                return resolve(url);
            var script = existente || document.createElement("script");
            var timer = setTimeout(function () {
                if (!existente)
                    script.remove();
                reject(new Error("Tempo esgotado ao carregar o módulo online."));
            }, Math.max(5000, Number(timeoutMs) || 18000));
            script.async = true;
            script.src = url;
            script.dataset.shinobiFirebase = "true";
            script.onload = function () {
                clearTimeout(timer);
                script.dataset.shinobiLoaded = "true";
                resolve(url);
            };
            script.onerror = function () {
                clearTimeout(timer);
                if (!existente)
                    script.remove();
                reject(new Error("Não foi possível carregar o módulo online."));
            };
            if (!existente)
                document.head.appendChild(script);
        }).finally(function () { return scriptsFirebaseEmCarga.delete(url); });
        scriptsFirebaseEmCarga.set(url, promessa);
        return promessa;
    }
    function firebaseCompatCompleto() {
        var _a, _b, _c;
        return Boolean(((_a = window.firebase) === null || _a === void 0 ? void 0 : _a.initializeApp) && ((_b = window.firebase) === null || _b === void 0 ? void 0 : _b.auth) && ((_c = window.firebase) === null || _c === void 0 ? void 0 : _c.database));
    }
    function carregarFirebaseCompat() {
        return __awaiter(this, void 0, void 0, function () {
            var opcoes, versao, fontes, timeout, ultimoErro, fontes_1, fontes_1_1, baseBruta, base, erro_1, e_1_1;
            var e_1, _a;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (firebaseCompatCompleto())
                            return [2 /*return*/, window.firebase];
                        opcoes = window.SHINOBI_FIREBASE_OPTIONS || {};
                        versao = opcoes.sdkVersion || "12.16.0";
                        fontes = Array.isArray(opcoes.sdkSources) && opcoes.sdkSources.length
                            ? opcoes.sdkSources
                            : ["https://www.gstatic.com/firebasejs/".concat(versao), "https://cdn.jsdelivr.net/npm/firebase@".concat(versao)];
                        timeout = opcoes.sdkTimeoutMs || 18000;
                        ultimoErro = null;
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 13, 14, 15]);
                        fontes_1 = __values(fontes), fontes_1_1 = fontes_1.next();
                        _e.label = 2;
                    case 2:
                        if (!!fontes_1_1.done) return [3 /*break*/, 12];
                        baseBruta = fontes_1_1.value;
                        base = String(baseBruta || "").replace(/\/$/, "");
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 10, , 11]);
                        if (!!((_b = window.firebase) === null || _b === void 0 ? void 0 : _b.initializeApp)) return [3 /*break*/, 5];
                        return [4 /*yield*/, carregarScriptFirebase("".concat(base, "/firebase-app-compat.js"), timeout)];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        if (!!((_c = window.firebase) === null || _c === void 0 ? void 0 : _c.auth)) return [3 /*break*/, 7];
                        return [4 /*yield*/, carregarScriptFirebase("".concat(base, "/firebase-auth-compat.js"), timeout)];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7:
                        if (!!((_d = window.firebase) === null || _d === void 0 ? void 0 : _d.database)) return [3 /*break*/, 9];
                        return [4 /*yield*/, carregarScriptFirebase("".concat(base, "/firebase-database-compat.js"), timeout)];
                    case 8:
                        _e.sent();
                        _e.label = 9;
                    case 9:
                        if (firebaseCompatCompleto())
                            return [2 /*return*/, window.firebase];
                        return [3 /*break*/, 11];
                    case 10:
                        erro_1 = _e.sent();
                        ultimoErro = erro_1;
                        console.warn("Fonte Firebase indisponível:", base, (erro_1 === null || erro_1 === void 0 ? void 0 : erro_1.message) || erro_1);
                        return [3 /*break*/, 11];
                    case 11:
                        fontes_1_1 = fontes_1.next();
                        return [3 /*break*/, 2];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (fontes_1_1 && !fontes_1_1.done && (_a = fontes_1.return)) _a.call(fontes_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 15: throw ultimoErro || new Error("Não foi possível carregar o modo online.");
                }
            });
        });
    }
    function criarAdaptadorCompat(firebase) {
        var marcador = function (tipo, valor) { return ({ __shinobiQueryConstraint: true, tipo: tipo, valor: valor }); };
        return {
            initializeApp: function (config) { var _a; return ((_a = firebase.apps) === null || _a === void 0 ? void 0 : _a.length) ? firebase.app() : firebase.initializeApp(config); },
            getAuth: function (app) { return app.auth(); },
            getDatabase: function (app) { return app.database(); },
            browserLocalPersistence: firebase.auth.Auth.Persistence.LOCAL,
            browserSessionPersistence: firebase.auth.Auth.Persistence.SESSION,
            inMemoryPersistence: firebase.auth.Auth.Persistence.NONE,
            setPersistence: function (auth, persistence) { return auth.setPersistence(persistence); },
            onAuthStateChanged: function (auth, callback) { return auth.onAuthStateChanged(callback); },
            GoogleAuthProvider: firebase.auth.GoogleAuthProvider,
            signInAnonymously: function (auth) { return auth.signInAnonymously(); },
            signInWithPopup: function (auth, provider) { return auth.signInWithPopup(provider); },
            signInWithRedirect: function (auth, provider) { return auth.signInWithRedirect(provider); },
            signInWithCredential: function (auth, credential) { return auth.signInWithCredential(credential); },
            linkWithPopup: function (user, provider) { return user.linkWithPopup(provider); },
            linkWithRedirect: function (user, provider) { return user.linkWithRedirect(provider); },
            signOut: function (auth) { return auth.signOut(); },
            ref: function (db, path) { return db.ref(path); },
            set: function (referencia, valor) { return referencia.set(valor); },
            update: function (referencia, valor) { return referencia.update(valor); },
            remove: function (referencia) { return referencia.remove(); },
            get: function (referencia) { return referencia.once("value"); },
            onValue: function (referencia, callback, errorCallback) {
                referencia.on("value", callback, errorCallback);
                return function () { return referencia.off("value", callback); };
            },
            onDisconnect: function (referencia) { return referencia.onDisconnect(); },
            push: function (referencia, valor) { return arguments.length > 1 ? referencia.push(valor) : referencia.push(); },
            runTransaction: function (referencia, atualizador) { return referencia.transaction(atualizador); },
            serverTimestamp: function () { return firebase.database.ServerValue.TIMESTAMP; },
            orderByChild: function (chave) { return marcador("orderByChild", chave); },
            equalTo: function (valor) { return marcador("equalTo", valor); },
            limitToLast: function (valor) { return marcador("limitToLast", valor); },
            query: function (referencia) {
                var restricoes = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    restricoes[_i - 1] = arguments[_i];
                }
                return restricoes.reduce(function (consulta, item) {
                    if (!(item === null || item === void 0 ? void 0 : item.__shinobiQueryConstraint))
                        return consulta;
                    if (item.tipo === "orderByChild")
                        return consulta.orderByChild(item.valor);
                    if (item.tipo === "equalTo")
                        return consulta.equalTo(item.valor);
                    if (item.tipo === "limitToLast")
                        return consulta.limitToLast(item.valor);
                    return consulta;
                }, referencia);
            }
        };
    }
    function carregarFirebase() {
        return __awaiter(this, void 0, void 0, function () {
            var firebase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (estadoOnline.api)
                            return [2 /*return*/, estadoOnline.api];
                        return [4 /*yield*/, carregarFirebaseCompat()];
                    case 1:
                        firebase = _a.sent();
                        estadoOnline.api = criarAdaptadorCompat(firebase);
                        return [2 /*return*/, estadoOnline.api];
                }
            });
        });
    }
    function instalarRetryOnline() {
        if (retryOnlineInstalado)
            return;
        retryOnlineInstalado = true;
        window.addEventListener("online", function () {
            if (!estadoOnline.api && !estadoOnline.carregando) {
                setTimeout(function () { return iniciar().catch(function () { }); }, 700);
            }
            else if (estadoOnline.user && !estadoOnline.user.anonymous) {
                setTimeout(function () { return processarXpCampanhaPendente().catch(function () { }); }, 250);
            }
        }, { passive: true });
        var tentarXp = function () {
            if (estadoOnline.user && !estadoOnline.user.anonymous && Object.keys(estadoOnline.xpInbox || {}).length) {
                setTimeout(function () { return processarXpCampanhaPendente().catch(function () { }); }, 180);
            }
        };
        window.addEventListener("shinobi:ficha-persistida", tentarXp);
        window.addEventListener("shinobi:app-pronto", tentarXp);
        window.addEventListener("pageshow", tentarXp);
        window.addEventListener("focus", tentarXp);
        document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible")
            tentarXp(); });
    }
    function normalizarUsuarioFirebase(user) {
        return user ? {
            uid: user.uid,
            anonymous: Boolean(user.isAnonymous),
            displayName: user.displayName || "Jogador",
            email: user.email || "",
            photoURL: user.photoURL || ""
        } : null;
    }
    function iniciar() {
        return __awaiter(this, void 0, void 0, function () {
            var api, app, erroLocal_1, erroSessao_1, erro_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        instalarRetryOnline();
                        if (estadoOnline.carregando)
                            return [2 /*return*/, snapshot()];
                        if (estadoOnline.iniciado && estadoOnline.api)
                            return [2 /*return*/, snapshot()];
                        estadoOnline.ultimoErro = null;
                        estadoOnline.carregando = true;
                        estadoOnline.configurado = configuracaoValida();
                        emitir("status", snapshot());
                        if (!estadoOnline.configurado) {
                            estadoOnline.carregando = false;
                            estadoOnline.iniciado = true;
                            emitir("configuracao-pendente", snapshot());
                            return [2 /*return*/, snapshot()];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, , 13]);
                        return [4 /*yield*/, carregarFirebase()];
                    case 2:
                        api = _a.sent();
                        app = api.initializeApp(window.SHINOBI_FIREBASE_CONFIG);
                        estadoOnline.auth = api.getAuth(app);
                        estadoOnline.db = api.getDatabase(app);
                        if (!(api.setPersistence && api.browserLocalPersistence)) return [3 /*break*/, 11];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 11]);
                        return [4 /*yield*/, api.setPersistence(estadoOnline.auth, api.browserLocalPersistence)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 5:
                        erroLocal_1 = _a.sent();
                        /* Safari/iOS, modo privado e alguns WebViews podem recusar a
                           persistência LOCAL. Cair para SESSION/NONE evita transformar
                           uma limitação de armazenamento em auth/internal-error. */
                        console.warn("Persistência local do Firebase indisponível; tentando alternativa.", (erroLocal_1 === null || erroLocal_1 === void 0 ? void 0 : erroLocal_1.code) || erroLocal_1);
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 10]);
                        return [4 /*yield*/, api.setPersistence(estadoOnline.auth, api.browserSessionPersistence)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 8:
                        erroSessao_1 = _a.sent();
                        return [4 /*yield*/, api.setPersistence(estadoOnline.auth, api.inMemoryPersistence).catch(function () { })];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 11];
                    case 11:
                        api.onAuthStateChanged(estadoOnline.auth, function (user) { return __awaiter(_this, void 0, void 0, function () {
                            var uidAnterior, uidNovo, sessao;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        uidAnterior = texto((_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid);
                                        uidNovo = texto(user === null || user === void 0 ? void 0 : user.uid);
                                        if (uidAnterior && uidNovo && uidAnterior !== uidNovo)
                                            limparObservadoresConta();
                                        estadoOnline.user = normalizarUsuarioFirebase(user);
                                        estadoOnline.conectado = Boolean(user);
                                        if (user && !user.isAnonymous) {
                                            migrarEstadoSyncLegadoParaConta(user.uid);
                                            restaurarOutboxConta(user.uid);
                                        }
                                        emitir("auth", snapshot());
                                        if (!user) return [3 /*break*/, 2];
                                        /* A ficha local precisa abrir antes de qualquer trabalho de nuvem.
                                           Login restaura conta/salas, mas NÃO observa, baixa ou envia fichas
                                           completas. Realtime de ficha é ativado depois do window.load e
                                           apenas para a ficha ativa pelo motor granular. */
                                        return [4 /*yield*/, registrarPerfilUsuario().catch(function () { })];
                                    case 1:
                                        /* A ficha local precisa abrir antes de qualquer trabalho de nuvem.
                                           Login restaura conta/salas, mas NÃO observa, baixa ou envia fichas
                                           completas. Realtime de ficha é ativado depois do window.load e
                                           apenas para a ficha ativa pelo motor granular. */
                                        _b.sent();
                                        observarCampanhas();
                                        if (!user.isAnonymous)
                                            observarXpInbox();
                                        sessao = lerJson(CHAVE_SESSAO, null);
                                        if (sessao === null || sessao === void 0 ? void 0 : sessao.roomId)
                                            restaurarSalaSalva(sessao).catch(function () { });
                                        return [3 /*break*/, 3];
                                    case 2:
                                        limparObservadoresConta();
                                        _b.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        estadoOnline.iniciado = true;
                        estadoOnline.carregando = false;
                        emitir("pronto", snapshot());
                        return [3 /*break*/, 13];
                    case 12:
                        erro_2 = _a.sent();
                        estadoOnline.ultimoErro = erroAmigavel(erro_2);
                        estadoOnline.carregando = false;
                        /* Mantém o motor apto a tentar novamente quando a conexão voltar. */
                        estadoOnline.iniciado = false;
                        emitir("erro", { mensagem: estadoOnline.ultimoErro, erro: erro_2 });
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/, snapshot()];
                }
            });
        });
    }
    function snapshot() {
        return {
            iniciado: estadoOnline.iniciado,
            configurado: estadoOnline.configurado,
            carregando: estadoOnline.carregando,
            conectado: estadoOnline.conectado,
            user: clonar(estadoOnline.user),
            syncEntreDispositivos: Boolean(estadoOnline.user && !estadoOnline.user.anonymous),
            salaId: estadoOnline.salaId,
            sala: clonar(estadoOnline.sala),
            presencas: clonar(estadoOnline.presencas),
            campanhas: clonar(estadoOnline.campanhas),
            membrosCampanha: clonar(estadoOnline.membrosCampanha),
            membrosCampanhaId: estadoOnline.membrosCampanhaId,
            npcsCampanha: clonar(estadoOnline.npcsCampanha),
            npcsCampanhaId: estadoOnline.npcsCampanhaId,
            xpLedgerCampanha: clonar(estadoOnline.xpLedgerCampanha),
            xpLedgerCampanhaId: estadoOnline.xpLedgerCampanhaId,
            xpReceiptsCampanha: clonar(estadoOnline.xpReceiptsCampanha),
            xpReceiptsCampanhaId: estadoOnline.xpReceiptsCampanhaId,
            xpInbox: clonar(estadoOnline.xpInbox),
            fichasNuvem: clonar(estadoOnline.fichasNuvem),
            syncAtual: clonar(statusSincronizacaoAtual()),
            ultimoErro: estadoOnline.ultimoErro
        };
    }
    function exigirFirebase() {
        if (!estadoOnline.configurado)
            throw new Error("Firebase ainda não configurado.");
        if (!estadoOnline.api || !estadoOnline.auth || !estadoOnline.db)
            throw new Error("Firebase ainda está iniciando.");
    }
    function exigirUsuario() { exigirFirebase(); if (!estadoOnline.user)
        throw new Error("Entre no modo online primeiro."); }
    function exigirContaGoogle() {
        exigirUsuario();
        if (estadoOnline.user.anonymous)
            throw new Error("Entre com Google para salvar, baixar e sincronizar fichas entre aparelhos.");
    }
    function sessaoSalaAtual() {
        return lerJson(CHAVE_SESSAO, null);
    }
    function restaurarSalaSalva(sessao) {
        return __awaiter(this, void 0, void 0, function () {
            var roomId, publico, atual, erro_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(sessao === null || sessao === void 0 ? void 0 : sessao.roomId) || !estadoOnline.user)
                            return [2 /*return*/, { skipped: true }];
                        roomId = texto(sessao.roomId);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, estadoOnline.api.get(estadoOnline.api.ref(estadoOnline.db, "roomPublic/".concat(roomId)))];
                    case 2:
                        publico = _b.sent();
                        if (!publico.exists() || ((_a = publico.val()) === null || _a === void 0 ? void 0 : _a.status) !== "open") {
                            atual = lerJson(CHAVE_SESSAO, null);
                            if (texto(atual === null || atual === void 0 ? void 0 : atual.roomId) === roomId)
                                limparSessaoLocal();
                            return [2 /*return*/, { ok: true, closed: true }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        erro_3 = _b.sent();
                        /* Em falha transitória de rede, preserve a sessão e deixe o listener do
                           Firebase tentar a restauração. Só um estado remoto explicitamente
                           encerrado deve limpar a sessão salva. */
                        if (navigator.onLine !== false)
                            console.warn("Não foi possível validar a sala salva antes de restaurar.", (erro_3 === null || erro_3 === void 0 ? void 0 : erro_3.code) || erro_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, observarSala(roomId, { restaurar: true })];
                }
            });
        });
    }
    function sessaoEhMestre(sala) {
        if (sala === void 0) { sala = estadoOnline.sala; }
        var sessao = sessaoSalaAtual();
        return Boolean(estadoOnline.user && sala &&
            sala.masterUid === estadoOnline.user.uid &&
            (sessao === null || sessao === void 0 ? void 0 : sessao.role) === "master" &&
            (!sessao.roomId || sessao.roomId === sala.id || sessao.roomId === estadoOnline.salaId));
    }
    function exigirMestre(sala) {
        if (sala === void 0) { sala = estadoOnline.sala; }
        exigirUsuario();
        if (!sessaoEhMestre(sala))
            throw new Error("Somente o mestre desta sessão pode executar esta ação.");
    }
    function entrarAnonimo() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, iniciar()];
                    case 1:
                        _a.sent();
                        exigirFirebase();
                        if (estadoOnline.auth.currentUser)
                            return [2 /*return*/, snapshot()];
                        return [4 /*yield*/, estadoOnline.api.signInAnonymously(estadoOnline.auth)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, snapshot()];
                }
            });
        });
    }
    function criarProviderGoogle() {
        var provider = new estadoOnline.api.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        return provider;
    }
    function erroInternoAuth(erro) {
        return ["auth/internal-error", "auth/cancelled-popup-request"].includes(texto(erro === null || erro === void 0 ? void 0 : erro.code));
    }
    function autenticarGooglePopup() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var ultimoErro, tentativa, erro_4;
            var _b = _a === void 0 ? {} : _a, _c = _b.tentativas, tentativas = _c === void 0 ? 2 : _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        ultimoErro = null;
                        tentativa = 1;
                        _d.label = 1;
                    case 1:
                        if (!(tentativa <= Math.max(1, tentativas))) return [3 /*break*/, 7];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, estadoOnline.api.signInWithPopup(estadoOnline.auth, criarProviderGoogle())];
                    case 3: return [2 /*return*/, _d.sent()];
                    case 4:
                        erro_4 = _d.sent();
                        ultimoErro = erro_4;
                        if (!erroInternoAuth(erro_4) || tentativa >= tentativas)
                            throw erro_4;
                        /* auth/internal-error também pode aparecer quando o estado interno do
                           iframe/popup ficou preso após suspensão do PWA. Uma nova tentativa
                           com provider novo costuma recuperar sem apagar a ficha local. */
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 220); })];
                    case 5:
                        /* auth/internal-error também pode aparecer quando o estado interno do
                           iframe/popup ficou preso após suspensão do PWA. Uma nova tentativa
                           com provider novo costuma recuperar sem apagar a ficha local. */
                        _d.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        tentativa += 1;
                        return [3 /*break*/, 1];
                    case 7: throw ultimoErro || new Error("Não foi possível entrar com Google.");
                }
            });
        });
    }
    function restaurarSalaDepoisDoLogin(sessao) {
        return __awaiter(this, void 0, void 0, function () {
            var fichaSessao, erroSala_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if ((sessao === null || sessao === void 0 ? void 0 : sessao.role) !== "player" || !sessao.code)
                            return [2 /*return*/];
                        fichaSessao = fichaLocalDaSessao(sessao);
                        if (!fichaSessao) {
                            emitir("erro", { mensagem: "A ficha originalmente vinculada a esta sala não está mais neste aparelho. Entre novamente na sala escolhendo a ficha correta." });
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, entrarSala({ code: sessao.code, localSheetName: fichaSessao.name, membershipMode: sessao.membershipMode || "session" })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        erroSala_1 = _a.sent();
                        emitir("erro", {
                            mensagem: "Conta conectada, mas n\u00E3o foi poss\u00EDvel voltar \u00E0 sala: ".concat(erroAmigavel(erroSala_1)),
                            erro: erroSala_1
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function entrarGoogle() {
        return __awaiter(this, void 0, void 0, function () {
            var erro, api, atual, sessao, resultado, erro_5, anon, _erroRecuperacao_1, resultado, erro_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, iniciar()];
                    case 1:
                        _a.sent();
                        exigirFirebase();
                        if (navigator.onLine === false) {
                            erro = new Error("Sem conexão com a internet para entrar com Google.");
                            erro.code = "auth/network-request-failed";
                            throw erro;
                        }
                        api = estadoOnline.api;
                        atual = estadoOnline.auth.currentUser;
                        if (atual && !atual.isAnonymous)
                            return [2 /*return*/, snapshot()];
                        sessao = lerJson(CHAVE_SESSAO, null);
                        if (!(atual === null || atual === void 0 ? void 0 : atual.isAnonymous)) return [3 /*break*/, 14];
                        if (!((sessao === null || sessao === void 0 ? void 0 : sessao.role) === "player")) return [3 /*break*/, 3];
                        return [4 /*yield*/, sairDaSala({ silencioso: true }).catch(function () { })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, api.signOut(estadoOnline.auth).catch(function () { })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 8, , 14]);
                        return [4 /*yield*/, autenticarGooglePopup({ tentativas: 2 })];
                    case 6:
                        resultado = _a.sent();
                        estadoOnline.user = normalizarUsuarioFirebase(resultado.user);
                        estadoOnline.conectado = true;
                        emitir("auth", snapshot());
                        return [4 /*yield*/, restaurarSalaDepoisDoLogin(sessao)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, snapshot()];
                    case 8:
                        erro_5 = _a.sent();
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 12, , 13]);
                        return [4 /*yield*/, api.signInAnonymously(estadoOnline.auth)];
                    case 10:
                        anon = _a.sent();
                        estadoOnline.user = normalizarUsuarioFirebase(anon.user);
                        estadoOnline.conectado = true;
                        emitir("auth", snapshot());
                        return [4 /*yield*/, restaurarSalaDepoisDoLogin(sessao)];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        _erroRecuperacao_1 = _a.sent();
                        return [3 /*break*/, 13];
                    case 13: throw erro_5;
                    case 14:
                        _a.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, autenticarGooglePopup({ tentativas: 2 })];
                    case 15:
                        resultado = _a.sent();
                        estadoOnline.user = normalizarUsuarioFirebase(resultado.user);
                        estadoOnline.conectado = true;
                        emitir("auth", snapshot());
                        return [2 /*return*/, snapshot()];
                    case 16:
                        erro_6 = _a.sent();
                        /* Em GitHub Pages o redirect do Firebase usa um authDomain de outra
                           origem e é afetado pelo bloqueio moderno de armazenamento de terceiros.
                           Não fazemos fallback automático para redirect, pois ele pode voltar sem
                           credencial no Safari/Chrome atuais. Mantemos a ficha offline intacta e
                           devolvemos um erro útil ao usuário. */
                        throw erro_6;
                    case 17: return [2 /*return*/];
                }
            });
        });
    }
    function trocarContaGoogle() {
        return __awaiter(this, void 0, void 0, function () {
            var erro, uidAnterior, resultado;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, iniciar()];
                    case 1:
                        _c.sent();
                        exigirFirebase();
                        if (navigator.onLine === false) {
                            erro = new Error("Sem conexão com a internet para trocar a Conta Google.");
                            erro.code = "auth/network-request-failed";
                            throw erro;
                        }
                        uidAnterior = texto((_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid);
                        return [4 /*yield*/, autenticarGooglePopup({ tentativas: 2 })];
                    case 2:
                        resultado = _c.sent();
                        if (uidAnterior && uidAnterior !== texto((_b = resultado.user) === null || _b === void 0 ? void 0 : _b.uid))
                            limparObservadoresConta();
                        estadoOnline.user = normalizarUsuarioFirebase(resultado.user);
                        estadoOnline.conectado = true;
                        emitir("auth", snapshot());
                        return [2 /*return*/, snapshot()];
                }
            });
        });
    }
    function sair() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!estadoOnline.salaId) return [3 /*break*/, 2];
                        return [4 /*yield*/, sairDaSala({ silencioso: true }).catch(function () { })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!estadoOnline.auth) return [3 /*break*/, 4];
                        return [4 /*yield*/, estadoOnline.api.signOut(estadoOnline.auth)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        limparSessaoLocal();
                        return [2 /*return*/, snapshot()];
                }
            });
        });
    }
    function registrarPerfilUsuario() {
        return __awaiter(this, void 0, void 0, function () {
            var api, uid, deviceId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirUsuario();
                        api = estadoOnline.api, uid = estadoOnline.user.uid, deviceId = obterDeviceId();
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db, "users/".concat(uid)), {
                                displayName: estadoOnline.user.displayName,
                                email: estadoOnline.user.email,
                                photoURL: estadoOnline.user.photoURL,
                                anonymous: estadoOnline.user.anonymous,
                                lastSeen: api.serverTimestamp()
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db, "userDevices/".concat(uid, "/").concat(deviceId)), {
                                deviceId: deviceId,
                                label: descricaoDispositivo(),
                                appVersion: texto(window.APP_VERSION),
                                lastSeen: api.serverTimestamp()
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function observarCampanhas() {
        var _a;
        if (!estadoOnline.user || estadoOnline.user.anonymous)
            return;
        (_a = estadoOnline.unsubscribeCampanhas) === null || _a === void 0 ? void 0 : _a.call(estadoOnline);
        var api = estadoOnline.api;
        var consulta = api.query(api.ref(estadoOnline.db, "campaigns"), api.orderByChild("masterUid"), api.equalTo(estadoOnline.user.uid));
        estadoOnline.unsubscribeCampanhas = api.onValue(consulta, function (snap) {
            var valor = snap.val() || {};
            estadoOnline.campanhas = Object.entries(valor).map(function (_a) {
                var _b = __read(_a, 2), id = _b[0], c = _b[1];
                return (__assign({ id: id }, c));
            }).sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
            emitir("campanhas", snapshot());
        }, function (erro) { return emitir("erro", { mensagem: erroAmigavel(erro), erro: erro }); });
    }
    function normalizarMembrosCampanha(valor, campaignId) {
        if (campaignId === void 0) { campaignId = ""; }
        var saida = [];
        Object.entries(valor && typeof valor === "object" ? valor : {}).forEach(function (_a) {
            var _b = __read(_a, 2), userId = _b[0], personagens = _b[1];
            Object.entries(personagens && typeof personagens === "object" ? personagens : {}).forEach(function (_a) {
                var _b = __read(_a, 2), characterId = _b[0], membro = _b[1];
                if (!membro || typeof membro !== "object" || Array.isArray(membro))
                    return;
                saida.push(__assign(__assign({}, membro), { campaignId: texto(membro.campaignId) || texto(campaignId), userId: texto(membro.userId) || texto(userId), characterId: texto(membro.characterId) || texto(characterId) }));
            });
        });
        return saida.sort(function (a, b) {
            var statusA = a.status === "active" ? 0 : 1, statusB = b.status === "active" ? 0 : 1;
            if (statusA !== statusB)
                return statusA - statusB;
            return texto(a.displayName).localeCompare(texto(b.displayName), "pt-BR");
        });
    }
    function pararObservacaoMembrosCampanha() {
        var _a;
        (_a = estadoOnline.unsubscribeMembrosCampanha) === null || _a === void 0 ? void 0 : _a.call(estadoOnline);
        estadoOnline.unsubscribeMembrosCampanha = null;
        estadoOnline.membrosCampanha = [];
        estadoOnline.membrosCampanhaId = null;
        emitir("membros-campanha", snapshot());
    }
    function observarMembrosCampanha(campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var id, campanha, api;
            var _a;
            return __generator(this, function (_b) {
                exigirContaGoogle();
                id = texto(campaignId);
                campanha = estadoOnline.campanhas.find(function (item) { return item.id === id; });
                if (!campanha || campanha.masterUid !== estadoOnline.user.uid)
                    throw new Error("Campanha não encontrada.");
                if (estadoOnline.membrosCampanhaId === id && estadoOnline.unsubscribeMembrosCampanha)
                    return [2 /*return*/, snapshot()];
                (_a = estadoOnline.unsubscribeMembrosCampanha) === null || _a === void 0 ? void 0 : _a.call(estadoOnline);
                estadoOnline.membrosCampanhaId = id;
                estadoOnline.membrosCampanha = [];
                api = estadoOnline.api;
                estadoOnline.unsubscribeMembrosCampanha = api.onValue(api.ref(estadoOnline.db, "campaignMembers/".concat(id)), function (snap) {
                    estadoOnline.membrosCampanha = normalizarMembrosCampanha(snap.val() || {}, id);
                    emitir("membros-campanha", snapshot());
                }, function (erro) {
                    estadoOnline.membrosCampanha = [];
                    emitir("erro", { mensagem: erroAmigavel(erro), erro: erro });
                    emitir("membros-campanha", snapshot());
                });
                return [2 /*return*/, snapshot()];
            });
        });
    }
    function normalizarNpcsCampanha(valor, campaignId) {
        if (campaignId === void 0) { campaignId = ""; }
        return Object.entries(valor && typeof valor === "object" ? valor : {}).map(function (_a) {
            var _b = __read(_a, 2), npcId = _b[0], npc = _b[1];
            return (__assign(__assign({}, (npc && typeof npc === "object" && !Array.isArray(npc) ? npc : {})), { id: texto(npc === null || npc === void 0 ? void 0 : npc.id) || texto(npcId), campaignId: texto(npc === null || npc === void 0 ? void 0 : npc.campaignId) || texto(campaignId) }));
        }).filter(function (npc) { return npc.id; }).sort(function (a, b) {
            var statusA = a.status === "active" ? 0 : 1, statusB = b.status === "active" ? 0 : 1;
            if (statusA !== statusB)
                return statusA - statusB;
            return texto(a.displayName).localeCompare(texto(b.displayName), "pt-BR");
        });
    }
    function pararObservacaoNpcsCampanha() {
        var _a;
        (_a = estadoOnline.unsubscribeNpcsCampanha) === null || _a === void 0 ? void 0 : _a.call(estadoOnline);
        estadoOnline.unsubscribeNpcsCampanha = null;
        estadoOnline.npcsCampanha = [];
        estadoOnline.npcsCampanhaId = null;
        emitir("npcs-campanha", snapshot());
    }
    function observarNpcsCampanha(campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var id, campanha, api;
            var _a;
            return __generator(this, function (_b) {
                exigirContaGoogle();
                id = texto(campaignId);
                campanha = estadoOnline.campanhas.find(function (item) { return item.id === id; });
                if (!campanha || campanha.masterUid !== estadoOnline.user.uid)
                    throw new Error("Campanha não encontrada.");
                if (estadoOnline.npcsCampanhaId === id && estadoOnline.unsubscribeNpcsCampanha)
                    return [2 /*return*/, snapshot()];
                (_a = estadoOnline.unsubscribeNpcsCampanha) === null || _a === void 0 ? void 0 : _a.call(estadoOnline);
                estadoOnline.npcsCampanhaId = id;
                estadoOnline.npcsCampanha = [];
                api = estadoOnline.api;
                estadoOnline.unsubscribeNpcsCampanha = api.onValue(api.ref(estadoOnline.db, "campaignNpcs/".concat(id)), function (snap) {
                    estadoOnline.npcsCampanha = normalizarNpcsCampanha(snap.val() || {}, id);
                    emitir("npcs-campanha", snapshot());
                }, function (erro) {
                    estadoOnline.npcsCampanha = [];
                    emitir("erro", { mensagem: erroAmigavel(erro), erro: erro });
                    emitir("npcs-campanha", snapshot());
                });
                return [2 /*return*/, snapshot()];
            });
        });
    }
    function normalizarXpLedgerCampanha(valor, campaignId) {
        if (campaignId === void 0) { campaignId = ""; }
        return Object.entries(valor && typeof valor === "object" ? valor : {}).map(function (_a) {
            var _b = __read(_a, 2), ledgerId = _b[0], item = _b[1];
            return (__assign(__assign({}, (item && typeof item === "object" && !Array.isArray(item) ? item : {})), { id: texto(item === null || item === void 0 ? void 0 : item.id) || texto(ledgerId), campaignId: texto(item === null || item === void 0 ? void 0 : item.campaignId) || texto(campaignId), userId: texto(item === null || item === void 0 ? void 0 : item.userId), characterId: texto(item === null || item === void 0 ? void 0 : item.characterId), amount: Math.trunc(Number((item === null || item === void 0 ? void 0 : item.amount) || 0)) }));
        }).filter(function (item) { return item.id && item.characterId && Number.isSafeInteger(item.amount) && item.amount !== 0; })
            .sort(function (a, b) { return Number(b.createdAt || 0) - Number(a.createdAt || 0); });
    }
    function normalizarXpReceiptsCampanha(valor) {
        var saida = {};
        Object.entries(valor && typeof valor === "object" ? valor : {}).forEach(function (_a) {
            var _b = __read(_a, 2), ledgerId = _b[0], item = _b[1];
            if (!item || typeof item !== "object" || Array.isArray(item))
                return;
            var id = texto(item.ledgerId) || texto(ledgerId);
            if (id)
                saida[id] = __assign(__assign({}, item), { ledgerId: id });
        });
        return saida;
    }
    function pararObservacaoXpCampanha() {
        var _a, _b;
        (_a = estadoOnline.unsubscribeXpLedgerCampanha) === null || _a === void 0 ? void 0 : _a.call(estadoOnline);
        (_b = estadoOnline.unsubscribeXpReceiptsCampanha) === null || _b === void 0 ? void 0 : _b.call(estadoOnline);
        estadoOnline.unsubscribeXpLedgerCampanha = null;
        estadoOnline.unsubscribeXpReceiptsCampanha = null;
        estadoOnline.xpLedgerCampanha = [];
        estadoOnline.xpLedgerCampanhaId = null;
        estadoOnline.xpReceiptsCampanha = {};
        estadoOnline.xpReceiptsCampanhaId = null;
        emitir("xp-campanha", snapshot());
    }
    function observarXpCampanha(campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var id, campanha, api, consulta;
            var _a, _b;
            return __generator(this, function (_c) {
                exigirContaGoogle();
                id = texto(campaignId);
                campanha = estadoOnline.campanhas.find(function (item) { return item.id === id; });
                if (!campanha || campanha.masterUid !== estadoOnline.user.uid)
                    throw new Error("Campanha não encontrada.");
                if (estadoOnline.xpLedgerCampanhaId === id && estadoOnline.unsubscribeXpLedgerCampanha && estadoOnline.unsubscribeXpReceiptsCampanha)
                    return [2 /*return*/, snapshot()];
                (_a = estadoOnline.unsubscribeXpLedgerCampanha) === null || _a === void 0 ? void 0 : _a.call(estadoOnline);
                (_b = estadoOnline.unsubscribeXpReceiptsCampanha) === null || _b === void 0 ? void 0 : _b.call(estadoOnline);
                estadoOnline.xpLedgerCampanhaId = id;
                estadoOnline.xpReceiptsCampanhaId = id;
                estadoOnline.xpLedgerCampanha = [];
                estadoOnline.xpReceiptsCampanha = {};
                api = estadoOnline.api;
                consulta = api.query(api.ref(estadoOnline.db, "xpLedger/".concat(id)), api.orderByChild("createdAt"), api.limitToLast(100));
                estadoOnline.unsubscribeXpLedgerCampanha = api.onValue(consulta, function (snap) {
                    estadoOnline.xpLedgerCampanha = normalizarXpLedgerCampanha(snap.val() || {}, id);
                    emitir("xp-campanha", snapshot());
                }, function (erro) {
                    estadoOnline.xpLedgerCampanha = [];
                    emitir("erro", { mensagem: erroAmigavel(erro), erro: erro });
                    emitir("xp-campanha", snapshot());
                });
                estadoOnline.unsubscribeXpReceiptsCampanha = api.onValue(api.ref(estadoOnline.db, "xpReceipts/".concat(id)), function (snap) {
                    estadoOnline.xpReceiptsCampanha = normalizarXpReceiptsCampanha(snap.val() || {});
                    emitir("xp-campanha", snapshot());
                }, function (erro) {
                    estadoOnline.xpReceiptsCampanha = {};
                    emitir("erro", { mensagem: erroAmigavel(erro), erro: erro });
                    emitir("xp-campanha", snapshot());
                });
                return [2 /*return*/, snapshot()];
            });
        });
    }
    function normalizarXpInbox(valor) {
        var saida = {};
        Object.entries(valor && typeof valor === "object" ? valor : {}).forEach(function (_a) {
            var _b = __read(_a, 2), characterId = _b[0], itens = _b[1];
            Object.entries(itens && typeof itens === "object" ? itens : {}).forEach(function (_a) {
                var _b = __read(_a, 2), ledgerId = _b[0], item = _b[1];
                if (!item || typeof item !== "object" || Array.isArray(item))
                    return;
                var id = texto(item.id) || texto(ledgerId), personagem = texto(item.characterId) || texto(characterId);
                if (!id || !personagem)
                    return;
                saida["".concat(personagem, "::").concat(id)] = __assign(__assign({}, item), { id: id, characterId: personagem });
            });
        });
        return saida;
    }
    function observarXpInbox() {
        var _a;
        if (!estadoOnline.user || estadoOnline.user.anonymous || !estadoOnline.api)
            return;
        (_a = estadoOnline.unsubscribeXpInbox) === null || _a === void 0 ? void 0 : _a.call(estadoOnline);
        var api = estadoOnline.api, uid = estadoOnline.user.uid;
        estadoOnline.unsubscribeXpInbox = api.onValue(api.ref(estadoOnline.db, "xpInbox/".concat(uid)), function (snap) {
            estadoOnline.xpInbox = normalizarXpInbox(snap.val() || {});
            emitir("xp-inbox", snapshot());
            processarXpCampanhaPendente().catch(function (erro) { return emitir("erro-sync", { mensagem: erroAmigavel(erro), erro: erro }); });
            /* O Firebase pode autenticar alguns milissegundos antes de a lista local de
               fichas terminar de abrir (especialmente em PWA/iOS). Se a primeira
               tentativa não encontrou a ficha, uma segunda passagem após o boot evita
               deixar o lançamento parado até a próxima edição manual. */
            if (Object.keys(estadoOnline.xpInbox || {}).length) {
                setTimeout(function () { return processarXpCampanhaPendente().catch(function () { }); }, 900);
            }
        }, function (erro) {
            estadoOnline.xpInbox = {};
            emitir("erro", { mensagem: erroAmigavel(erro), erro: erro });
            emitir("xp-inbox", snapshot());
        });
    }
    function criarCampanha(nome) {
        return __awaiter(this, void 0, void 0, function () {
            var nomeLimpo, api, nova, dados;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirUsuario();
                        if (estadoOnline.user.anonymous)
                            throw new Error("Entre com Google para criar campanhas como mestre.");
                        nomeLimpo = texto(nome).slice(0, 80);
                        if (!nomeLimpo)
                            throw new Error("Informe o nome da campanha.");
                        api = estadoOnline.api;
                        nova = api.push(api.ref(estadoOnline.db, "campaigns"));
                        dados = {
                            masterUid: estadoOnline.user.uid,
                            name: nomeLimpo,
                            schemaVersion: CAMPAIGN_SCHEMA_VERSION,
                            createdAt: api.serverTimestamp(),
                            updatedAt: api.serverTimestamp(),
                            status: "active"
                        };
                        return [4 /*yield*/, api.set(nova, dados)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, nova.key];
                }
            });
        });
    }
    function prepararCampanhaPermanente(campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var id, campanha, versao, api;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirContaGoogle();
                        id = texto(campaignId);
                        campanha = estadoOnline.campanhas.find(function (item) { return item.id === id; });
                        if (!campanha || campanha.masterUid !== estadoOnline.user.uid)
                            throw new Error("Campanha não encontrada.");
                        versao = Number(campanha.schemaVersion || 0);
                        if (versao >= CAMPAIGN_SCHEMA_VERSION)
                            return [2 /*return*/, { ok: true, campaignId: id, migrated: false, schemaVersion: versao }];
                        api = estadoOnline.api;
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db, "campaigns/".concat(id)), {
                                schemaVersion: CAMPAIGN_SCHEMA_VERSION,
                                migratedAt: api.serverTimestamp(),
                                updatedAt: api.serverTimestamp()
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { ok: true, campaignId: id, migrated: true, schemaVersion: CAMPAIGN_SCHEMA_VERSION }];
                }
            });
        });
    }
    function editarCampanha(campaignId, nome) {
        return __awaiter(this, void 0, void 0, function () {
            var id, campanha, nomeLimpo, api;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirContaGoogle();
                        id = texto(campaignId);
                        campanha = estadoOnline.campanhas.find(function (item) { return item.id === id; });
                        if (!campanha || campanha.masterUid !== estadoOnline.user.uid)
                            throw new Error("Campanha não encontrada.");
                        nomeLimpo = texto(nome).slice(0, 80);
                        if (!nomeLimpo)
                            throw new Error("Informe o novo nome da campanha.");
                        if (nomeLimpo === campanha.name)
                            return [2 /*return*/, { ok: true, unchanged: true }];
                        api = estadoOnline.api;
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db, "campaigns/".concat(id)), {
                                name: nomeLimpo,
                                updatedAt: agora()
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { ok: true, name: nomeLimpo }];
                }
            });
        });
    }
    function excluirCampanha(campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var id, campanha, api, xpSnap, xpRegistros, roomIds, salas, updates, salasEncerradas;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        exigirContaGoogle();
                        id = texto(campaignId);
                        campanha = estadoOnline.campanhas.find(function (item) { return item.id === id; });
                        if (!campanha || campanha.masterUid !== estadoOnline.user.uid)
                            throw new Error("Campanha não encontrada.");
                        api = estadoOnline.api;
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "xpLedger/".concat(id))).catch(function () { return null; })];
                    case 1:
                        xpSnap = _c.sent();
                        xpRegistros = ((_a = xpSnap === null || xpSnap === void 0 ? void 0 : xpSnap.val) === null || _a === void 0 ? void 0 : _a.call(xpSnap)) || {};
                        roomIds = Object.keys(campanha.rooms || {});
                        return [4 /*yield*/, Promise.all(roomIds.map(function (roomId) { return __awaiter(_this, void 0, void 0, function () {
                                var roomSnap, data, code, _a, publicSnap, codeSnap;
                                var _b, _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0: return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "rooms/".concat(roomId)))];
                                        case 1:
                                            roomSnap = _d.sent();
                                            data = roomSnap.exists() ? roomSnap.val() : null;
                                            if (!data || data.masterUid !== estadoOnline.user.uid)
                                                return [2 /*return*/, { roomId: roomId, data: null, publicExists: false, codeExists: false }];
                                            code = texto(data.code || ((_c = (_b = campanha.rooms) === null || _b === void 0 ? void 0 : _b[roomId]) === null || _c === void 0 ? void 0 : _c.code));
                                            return [4 /*yield*/, Promise.all([
                                                    api.get(api.ref(estadoOnline.db, "roomPublic/".concat(roomId))),
                                                    code ? api.get(api.ref(estadoOnline.db, "roomCodes/".concat(code))) : Promise.resolve(null)
                                                ])];
                                        case 2:
                                            _a = __read.apply(void 0, [_d.sent(), 2]), publicSnap = _a[0], codeSnap = _a[1];
                                            return [2 /*return*/, {
                                                    roomId: roomId,
                                                    data: data,
                                                    code: code,
                                                    publicExists: Boolean(publicSnap === null || publicSnap === void 0 ? void 0 : publicSnap.exists()),
                                                    codeExists: Boolean(codeSnap === null || codeSnap === void 0 ? void 0 : codeSnap.exists())
                                                }];
                                    }
                                });
                            }); }))];
                    case 2:
                        salas = _c.sent();
                        updates = {};
                        salasEncerradas = 0;
                        salas.forEach(function (_a) {
                            var roomId = _a.roomId, data = _a.data, code = _a.code, publicExists = _a.publicExists, codeExists = _a.codeExists;
                            if (!data)
                                return;
                            updates["rooms/".concat(roomId, "/status")] = "closed";
                            updates["rooms/".concat(roomId, "/updatedAt")] = agora();
                            if (publicExists)
                                updates["roomPublic/".concat(roomId, "/status")] = "closed";
                            if (code && codeExists)
                                updates["roomCodes/".concat(code, "/status")] = "closed";
                            salasEncerradas += 1;
                        });
                        Object.entries(xpRegistros).forEach(function (_a) {
                            var _b = __read(_a, 2), ledgerId = _b[0], item = _b[1];
                            var uid = texto(item === null || item === void 0 ? void 0 : item.userId), characterId = texto(item === null || item === void 0 ? void 0 : item.characterId);
                            if (uid && characterId)
                                updates["xpInbox/".concat(uid, "/").concat(characterId, "/").concat(ledgerId)] = null;
                        });
                        updates["xpLedger/".concat(id)] = null;
                        updates["xpReceipts/".concat(id)] = null;
                        updates["campaignMembers/".concat(id)] = null;
                        updates["campaignNpcs/".concat(id)] = null;
                        updates["campaigns/".concat(id)] = null;
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db), updates)];
                    case 3:
                        _c.sent();
                        /* Se a campanha foi excluída em outro aparelho enquanto esta instalação
                           ainda acompanhava uma de suas salas, remove apenas a sessão local. */
                        if (((_b = estadoOnline.sala) === null || _b === void 0 ? void 0 : _b.campaignId) === id)
                            limparSessaoLocal();
                        return [2 /*return*/, { ok: true, closedRooms: salasEncerradas }];
                }
            });
        });
    }
    function gerarCodigoSala() {
        return __awaiter(this, void 0, void 0, function () {
            var api, _loop_1, tentativa, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        api = estadoOnline.api;
                        _loop_1 = function (tentativa) {
                            var codigo, bytes, snap;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        codigo = "";
                                        bytes = new Uint8Array(6);
                                        crypto.getRandomValues(bytes);
                                        bytes.forEach(function (v) { return codigo += CARACTERES_CODIGO[v % CARACTERES_CODIGO.length]; });
                                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "roomCodes/".concat(codigo)))];
                                    case 1:
                                        snap = _b.sent();
                                        if (!snap.exists())
                                            return [2 /*return*/, { value: codigo }];
                                        return [2 /*return*/];
                                }
                            });
                        };
                        tentativa = 0;
                        _a.label = 1;
                    case 1:
                        if (!(tentativa < 20)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(tentativa)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 3;
                    case 3:
                        tentativa += 1;
                        return [3 /*break*/, 1];
                    case 4: throw new Error("Não foi possível gerar um código de sala. Tente novamente.");
                }
            });
        });
    }
    function criarSala(_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var campanha, api, roomRef, roomId, code, titulo, base, updates;
            var campaignId = _b.campaignId, title = _b.title;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        exigirUsuario();
                        if (estadoOnline.user.anonymous)
                            throw new Error("Entre com Google para criar uma sala como mestre.");
                        if (estadoOnline.sala)
                            throw new Error("Saia da sala atual antes de criar uma nova sessão.");
                        campanha = estadoOnline.campanhas.find(function (c) { return c.id === campaignId; });
                        if (!campanha)
                            throw new Error("Selecione uma campanha válida.");
                        api = estadoOnline.api;
                        roomRef = api.push(api.ref(estadoOnline.db, "rooms"));
                        roomId = roomRef.key;
                        return [4 /*yield*/, gerarCodigoSala()];
                    case 1:
                        code = _c.sent();
                        titulo = texto(title).slice(0, 80) || "Sess\u00E3o de ".concat(campanha.name);
                        base = {
                            masterUid: estadoOnline.user.uid,
                            campaignId: campaignId,
                            schemaVersion: 2,
                            code: code,
                            title: titulo,
                            status: "open",
                            createdAt: agora(),
                            updatedAt: agora(),
                            combat: { started: false, round: 1, turnIndex: 0, order: [] },
                            participants: {},
                            effects: {},
                            events: {}
                        };
                        updates = {};
                        updates["rooms/".concat(roomId)] = base;
                        updates["roomCodes/".concat(code)] = { roomId: roomId, masterUid: estadoOnline.user.uid, status: "open", createdAt: agora() };
                        updates["roomPublic/".concat(roomId)] = { masterUid: estadoOnline.user.uid, campaignId: campaignId, title: titulo, campaignName: campanha.name, code: code, status: "open", createdAt: agora() };
                        updates["campaigns/".concat(campaignId, "/rooms/").concat(roomId)] = { title: titulo, code: code, status: "open", createdAt: agora() };
                        updates["campaigns/".concat(campaignId, "/updatedAt")] = agora();
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db), updates)];
                    case 2:
                        _c.sent();
                        /* A associação é criada depois que roomPublic já existe, permitindo que
                           as regras do banco confirmem com segurança quem é o mestre. */
                        return [4 /*yield*/, api.set(api.ref(estadoOnline.db, "roomMemberships/".concat(roomId, "/").concat(estadoOnline.user.uid)), { role: "master", joinedAt: agora() })];
                    case 3:
                        /* A associação é criada depois que roomPublic já existe, permitindo que
                           as regras do banco confirmem com segurança quem é o mestre. */
                        _c.sent();
                        estadoOnline.sessionGeneration += 1;
                        salvarJson(CHAVE_SESSAO, { roomId: roomId, participantId: "", role: "master", code: code });
                        return [4 /*yield*/, observarSala(roomId)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, { roomId: roomId, code: code }];
                }
            });
        });
    }
    function abrirSalaComoMestre(_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var idCampanha, idSala, campanha, api, snap, sala;
            var _c;
            var campaignId = _b.campaignId, roomId = _b.roomId;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        exigirContaGoogle();
                        idCampanha = texto(campaignId), idSala = texto(roomId);
                        campanha = estadoOnline.campanhas.find(function (item) { return item.id === idCampanha; });
                        if (!campanha || campanha.masterUid !== estadoOnline.user.uid)
                            throw new Error("Campanha não encontrada.");
                        if (!((_c = campanha.rooms) === null || _c === void 0 ? void 0 : _c[idSala]))
                            throw new Error("Esta sessão não pertence à campanha selecionada.");
                        api = estadoOnline.api;
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "rooms/".concat(idSala)))];
                    case 1:
                        snap = _d.sent();
                        if (!snap.exists())
                            throw new Error("A sala desta sessão não existe mais.");
                        sala = snap.val() || {};
                        if (sala.masterUid !== estadoOnline.user.uid || sala.campaignId !== idCampanha)
                            throw new Error("Esta sala não pertence à sua campanha.");
                        if (sala.status !== "open")
                            throw new Error("Esta sessão já foi encerrada.");
                        /* Salas criadas antes da campanha permanente não possuíam campaignId em
                           roomPublic. O mestre faz um backfill aditivo ao reabrir a sessão para que
                           jogadores novos possam criar vínculos permanentes com segurança. */
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db, "roomPublic/".concat(idSala)), {
                                campaignId: idCampanha,
                                campaignName: texto(campanha.name),
                                title: texto(sala.title),
                                code: texto(sala.code),
                                status: "open"
                            })];
                    case 2:
                        /* Salas criadas antes da campanha permanente não possuíam campaignId em
                           roomPublic. O mestre faz um backfill aditivo ao reabrir a sessão para que
                           jogadores novos possam criar vínculos permanentes com segurança. */
                        _d.sent();
                        return [4 /*yield*/, api.set(api.ref(estadoOnline.db, "roomMemberships/".concat(idSala, "/").concat(estadoOnline.user.uid)), { role: "master", joinedAt: agora() })];
                    case 3:
                        _d.sent();
                        estadoOnline.sessionGeneration += 1;
                        salvarJson(CHAVE_SESSAO, { roomId: idSala, participantId: "", role: "master", code: texto(sala.code) });
                        return [4 /*yield*/, observarSala(idSala)];
                    case 4:
                        _d.sent();
                        return [2 /*return*/, { roomId: idSala, code: texto(sala.code) }];
                }
            });
        });
    }
    function buscarSalaPorCodigo(codigo) {
        return __awaiter(this, void 0, void 0, function () {
            var code, api, snap, info, publico;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        exigirUsuario();
                        code = texto(codigo).toUpperCase().replace(/[^A-Z0-9]/g, "");
                        if (code.length !== 6)
                            throw new Error("O código da sala deve ter seis caracteres.");
                        api = estadoOnline.api;
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "roomCodes/".concat(code)))];
                    case 1:
                        snap = _c.sent();
                        if (!snap.exists() || ((_a = snap.val()) === null || _a === void 0 ? void 0 : _a.status) !== "open")
                            throw new Error("Sala não encontrada ou já encerrada.");
                        info = snap.val();
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "roomPublic/".concat(info.roomId)))];
                    case 2:
                        publico = _c.sent();
                        if (!publico.exists() || ((_b = publico.val()) === null || _b === void 0 ? void 0 : _b.status) !== "open")
                            throw new Error("Esta sala não está aberta.");
                        return [2 /*return*/, { roomId: info.roomId, code: code, publico: publico.val() }];
                }
            });
        });
    }
    function garantirMetadadosFichaLocal(nomeFicha, dados) {
        var copia = clonar(dados || {});
        copia.__online = copia.__online && typeof copia.__online === "object" ? copia.__online : {};
        if (!copia.__online.sheetId)
            copia.__online.sheetId = idAleatorio("sheet");
        copia.__online.name = nomeFicha;
        delete copia.__online.deviceId;
        return copia;
    }
    function fichaAtivaNomeSeguro() {
        try {
            return texto(window.fichaAtual || localStorage.getItem("ficha_ninja_ativa_v1") || "Principal") || "Principal";
        }
        catch (_erro) {
            return "Principal";
        }
    }
    function capturarEstadoAtualAntesDaSincronizacao(nomeFicha) {
        var nome = texto(nomeFicha) || fichaAtivaNomeSeguro();
        if (nome !== fichaAtivaNomeSeguro())
            return;
        try {
            /* Desde a 2.5.8.8, campos ainda não confirmados não entram na nuvem.
               Copiamos somente valores já confirmados e persistimos sem disparar
               um segundo ciclo de sincronização. */
            if (typeof window.sincronizarEstadoDosCampos === "function")
                window.sincronizarEstadoDosCampos();
            if (typeof window.persistirEstadoLocal === "function") {
                window.persistirEstadoLocal({ emitir: false, confirmada: true, origem: "pre-sync", motivo: "captura-confirmada" });
            }
        }
        catch (_erro) { }
    }
    function aplicarEstadoGlobalDaFicha(nome, chave, data) {
        try {
            localStorage.setItem("ficha_ninja_ativa_v1", nome);
            if (typeof window.fichaAtual !== "undefined")
                window.fichaAtual = nome;
            if (typeof window.CHAVE !== "undefined")
                window.CHAVE = chave;
            if (typeof window.estado !== "undefined")
                window.estado = clonar(data);
            if (typeof window.carregar === "function")
                window.carregar();
            if (typeof window.atualizarPerfil === "function")
                window.atualizarPerfil();
            if (typeof window.renderizarTopicosNotas === "function")
                window.renderizarTopicosNotas();
            return true;
        }
        catch (_erro) {
            return false;
        }
    }
    function listarFichasLocais() {
        var nomes = [];
        try {
            if (Array.isArray(window.fichas))
                nomes = __spreadArray([], __read(window.fichas), false);
        }
        catch (_erro) { }
        if (!nomes.length) {
            try {
                nomes = JSON.parse(localStorage.getItem("ficha_ninja_lista_v1") || '["Principal"]');
            }
            catch (_erro) {
                nomes = ["Principal"];
            }
        }
        nomes = Array.from(new Set((Array.isArray(nomes) ? nomes : ["Principal"]).map(function (nome) {
            return typeof window.limparNomeFicha === "function" ? window.limparNomeFicha(nome) : texto(nome) || "Principal";
        })));
        var ativa = fichaAtivaNomeSeguro();
        var vistos = new Set();
        var fichasValidas = [];
        var nomesValidos = [];
        nomes.forEach(function (nomeLimpo) {
            var chave = nomeLimpo === "Principal" ? "ficha_ninja_app_v2" : "ficha_ninja_app_v2__".concat(nomeLimpo);
            var bruto = localStorage.getItem(chave);
            var dados = null;
            var veioDoEstado = false;
            try {
                /* A listagem não deve transformar window.estado em fonte de gravação.
                   A versão persistida é a referência segura para sincronização; os
                   campos confirmados são gravados nela antes de qualquer envio. */
                if (bruto != null) {
                    var lido = JSON.parse(bruto);
                    if (lido && typeof lido === "object" && !Array.isArray(lido))
                        dados = lido;
                }
                if (!dados && nomeLimpo === ativa && typeof window.estado !== "undefined" && window.estado && typeof window.estado === "object") {
                    dados = clonar(window.estado);
                    veioDoEstado = true;
                }
            }
            catch (_erro) {
                dados = null;
            }
            /* Uma entrada antiga na lista sem dados reais não é uma ficha. Antes esta
               situação criava um objeto vazio + novo sheetId e acabava enviando uma
               "ficha fantasma" para o Firebase. */
            if (!dados) {
                if (nomeLimpo === ativa) {
                    dados = {};
                    veioDoEstado = true;
                }
                else
                    return;
            }
            dados = garantirMetadadosFichaLocal(nomeLimpo, dados);
            if (vistos.has(dados.__online.sheetId)) {
                /* Colisão local só pode acontecer com uma duplicação explícita/legada.
                   O segundo registro recebe uma identidade própria uma única vez. */
                var anterior = dados.__online.sheetId;
                dados.__online.sheetId = idAleatorio("sheet");
                dados.__online.sourceSheetId = anterior;
                dados.__online.userCopy = true;
            }
            vistos.add(dados.__online.sheetId);
            nomesValidos.push(nomeLimpo);
            try {
                localStorage.setItem(chave, JSON.stringify(dados));
                if (nomeLimpo === ativa && typeof estado !== "undefined")
                    estado.__online = clonar(dados.__online);
            }
            catch (_erro) { }
            fichasValidas.push({
                name: nomeLimpo, key: chave, sheetId: dados.__online.sheetId,
                level: Number(dados.nivel || 1), characterName: texto(dados.nome) || nomeLimpo,
                data: dados, storageExists: bruto != null || veioDoEstado,
                syncDisabled: fichaBloqueadaNuvem(dados)
            });
        });
        /* v2.5.8.136 — reparo de identidade herdada durante criação/troca de ficha.
           A falha antiga podia salvar o estado da ficha de origem na chave recém-
           criada durante pagehide. A colisão de sheetId já era separada acima, mas
           characterId/realtimeId permaneciam iguais e faziam duas fichas editar o
           mesmo personagem. Só rompemos a identidade quando há evidência forte:
           userCopy + sourceSheetId apontando para uma ficha local e a identidade de
           personagem ainda é exatamente a mesma da origem. O conteúdo nunca é
           apagado automaticamente. */
        var porSheetId = new Map(fichasValidas.map(function (item) { return [texto(item.sheetId), item]; }));
        fichasValidas.forEach(function (ficha) {
            var _a, _b, _c, _d, _e;
            var online = (_a = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _a === void 0 ? void 0 : _a.__online;
            if (!online || online.userCopy !== true || !texto(online.sourceSheetId) || online.characterSplitVersion === 1)
                return;
            var origem = porSheetId.get(texto(online.sourceSheetId));
            if (!origem || origem === ficha)
                return;
            var idAtual = texto(online.characterId) || texto(online.realtimeId);
            var idOrigem = texto((_c = (_b = origem.data) === null || _b === void 0 ? void 0 : _b.__online) === null || _c === void 0 ? void 0 : _c.characterId) || texto((_e = (_d = origem.data) === null || _d === void 0 ? void 0 : _d.__online) === null || _e === void 0 ? void 0 : _e.realtimeId);
            if (!idAtual || !idOrigem || idAtual !== idOrigem)
                return;
            online.sourceCharacterId = idAtual;
            delete online.characterId;
            delete online.characterOwnerUid;
            delete online.characterIdentityVersion;
            delete online.realtimeId;
            delete online.realtimeOwnerUid;
            delete online.realtimeIdentityVersion;
            online.characterSplitVersion = 1;
            online.characterSplitReason = "local-sheet-copy-collision";
            try {
                localStorage.setItem(ficha.key, JSON.stringify(ficha.data));
                if (ficha.name === ativa && typeof window.estado !== "undefined" && window.estado && typeof window.estado === "object") {
                    window.estado.__online = clonar(online);
                }
            }
            catch (_erro) { }
        });
        /* v2.5.8.137 — defesa geral contra duas fichas locais apontarem para a
           mesma identidade realtime. Não existe cenário válido em que duas chaves
           locais diferentes precisem editar o mesmo personagem. Mantemos como
           canônica a ficha com vínculo/sincronização mais forte e retiramos apenas
           a identidade realtime das demais; nenhum conteúdo da ficha é apagado. */
        var gruposCharacter = new Map();
        fichasValidas.forEach(function (ficha) {
            var _a;
            var online = ((_a = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _a === void 0 ? void 0 : _a.__online) || {};
            var id = texto(online.characterId) || texto(online.realtimeId);
            if (!id)
                return;
            var owner = texto(online.characterOwnerUid) || texto(online.realtimeOwnerUid) || texto(online.ownerUid) || uidContaAtiva() || "local";
            var chave = "".concat(owner, "::").concat(id);
            if (!gruposCharacter.has(chave))
                gruposCharacter.set(chave, []);
            gruposCharacter.get(chave).push(ficha);
        });
        var syncLocal = estadoSync();
        gruposCharacter.forEach(function (itens) {
            var _a, _b, _c, _d;
            var idsSheet = new Set(itens.map(function (item) { return texto(item.sheetId); }).filter(Boolean));
            if (itens.length < 2 || idsSheet.size < 2)
                return;
            var pontuar = function (item) {
                var _a;
                var online = ((_a = item === null || item === void 0 ? void 0 : item.data) === null || _a === void 0 ? void 0 : _a.__online) || {};
                var meta = (syncLocal === null || syncLocal === void 0 ? void 0 : syncLocal[item.sheetId]) || {};
                var pontos = Number(meta.revision || 0) * 1000;
                if (texto(meta.lastHash))
                    pontos += 250;
                if (texto(online.ownerUid))
                    pontos += 120;
                if (item.name === "Principal")
                    pontos += 20;
                pontos += Math.min(100, pontuacaoConteudoFicha(item.data));
                if (online.userCopy === true || texto(online.sourceSheetId))
                    pontos -= 500;
                if (online.syncDisabled === true || online.legacyAutoCopy === true)
                    pontos -= 1000;
                return pontos;
            };
            var ordenadas = __spreadArray([], __read(itens), false).sort(function (a, b) { return pontuar(b) - pontuar(a) || a.name.localeCompare(b.name); });
            var canonica = ordenadas[0];
            var idCanonico = texto((_b = (_a = canonica === null || canonica === void 0 ? void 0 : canonica.data) === null || _a === void 0 ? void 0 : _a.__online) === null || _b === void 0 ? void 0 : _b.characterId) || texto((_d = (_c = canonica === null || canonica === void 0 ? void 0 : canonica.data) === null || _c === void 0 ? void 0 : _c.__online) === null || _d === void 0 ? void 0 : _d.realtimeId);
            ordenadas.slice(1).forEach(function (ficha) {
                var _a;
                if (texto(ficha.sheetId) === texto(canonica.sheetId))
                    return;
                var online = (_a = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _a === void 0 ? void 0 : _a.__online;
                var idAtual = texto(online === null || online === void 0 ? void 0 : online.characterId) || texto(online === null || online === void 0 ? void 0 : online.realtimeId);
                if (!online || !idAtual || idAtual !== idCanonico)
                    return;
                online.sourceCharacterId = idAtual;
                delete online.characterId;
                delete online.characterOwnerUid;
                delete online.characterIdentityVersion;
                delete online.realtimeId;
                delete online.realtimeOwnerUid;
                delete online.realtimeIdentityVersion;
                online.characterSplitVersion = 2;
                online.characterSplitReason = "duplicate-local-character-id";
                try {
                    localStorage.setItem(ficha.key, JSON.stringify(ficha.data));
                    if (ficha.name === ativa && typeof window.estado !== "undefined" && window.estado && typeof window.estado === "object") {
                        window.estado.__online = clonar(online);
                    }
                }
                catch (_erro) { }
            });
        });
        /* Remove somente referências fantasmas da lista. Nenhum conteúdo existente
           é apagado aqui. */
        try {
            var listaAtual = lerJson("ficha_ninja_lista_v1", ["Principal"]);
            var filtrada = (Array.isArray(listaAtual) ? listaAtual : []).filter(function (nome) {
                var limpo = typeof window.limparNomeFicha === "function" ? window.limparNomeFicha(nome) : texto(nome);
                return nomesValidos.includes(limpo) || limpo === ativa;
            });
            if (!filtrada.includes("Principal"))
                filtrada.unshift("Principal");
            localStorage.setItem("ficha_ninja_lista_v1", JSON.stringify(Array.from(new Set(filtrada))));
        }
        catch (_erro) { }
        return fichasValidas;
    }
    function prepararCopiasLocaisLegadas() {
        /* v2.5.8.137 — não classificamos mais uma ficha como cópia automática pelo
           nome, pelo sufixo "Nuvem" ou porque o conteúdo coincide com outra. Flags
           legadas já existentes continuam sendo respeitadas por fichaBloqueadaNuvem,
           mas novas decisões destrutivas/isoladoras exigem evidência explícita. */
        return listarFichasLocais();
    }
    function listarCopiasLegadasLocaisSeguras() {
        var locais = prepararCopiasLocaisLegadas();
        var grupos = new Map();
        locais.forEach(function (ficha) {
            var chave = chaveLogicaFicha(ficha) || ficha.sheetId;
            if (!grupos.has(chave))
                grupos.set(chave, []);
            grupos.get(chave).push(ficha);
        });
        var seguras = [], revisar = [];
        locais.forEach(function (ficha) {
            var _a, _b, _c, _d, _e, _f, _g;
            var marcada = ((_a = window.EkoSheetManager) === null || _a === void 0 ? void 0 : _a.ehCopiaLegadaMarcada)
                ? window.EkoSheetManager.ehCopiaLegadaMarcada(ficha)
                : Boolean((ficha === null || ficha === void 0 ? void 0 : ficha.name) !== "Principal" &&
                    ((_c = (_b = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _b === void 0 ? void 0 : _b.__online) === null || _c === void 0 ? void 0 : _c.legacyAutoCopy) === true &&
                    ((_e = (_d = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _d === void 0 ? void 0 : _d.__online) === null || _e === void 0 ? void 0 : _e.syncDisabled) === true &&
                    ((_g = (_f = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _f === void 0 ? void 0 : _f.__online) === null || _g === void 0 ? void 0 : _g.userCopy) !== true);
            if (!marcada)
                return;
            var chave = chaveLogicaFicha(ficha) || ficha.sheetId;
            var grupo = grupos.get(chave) || [];
            var canonicos = grupo.filter(function (item) {
                var _a, _b, _c, _d;
                return item !== ficha &&
                    item.name !== ficha.name &&
                    ((_b = (_a = item.data) === null || _a === void 0 ? void 0 : _a.__online) === null || _b === void 0 ? void 0 : _b.legacyAutoCopy) !== true &&
                    ((_d = (_c = item.data) === null || _c === void 0 ? void 0 : _c.__online) === null || _d === void 0 ? void 0 : _d.syncDisabled) !== true;
            });
            var canonico = __spreadArray([], __read(canonicos), false).sort(function (a, b) { return pontuacaoConteudoFicha(b.data) - pontuacaoConteudoFicha(a.data); })[0];
            if (!canonico) {
                revisar.push(clonar(ficha));
                return;
            }
            /* Limpeza automática só remove duplicata byte-logicamente equivalente
               quando ignoramos __online. Se houver qualquer diferença de conteúdo,
               preservamos para revisão/exclusão individual. */
            var equivalente = hashFichaSemVinculo(ficha.data) === hashFichaSemVinculo(canonico.data);
            if (equivalente)
                seguras.push(clonar(ficha));
            else
                revisar.push(clonar(ficha));
        });
        return { seguras: seguras, revisar: revisar };
    }
    function listarFichasSincronizaveis() {
        var uid = uidContaAtiva();
        return prepararCopiasLocaisLegadas().filter(function (ficha) {
            var _a, _b;
            if (fichaBloqueadaNuvem(ficha))
                return false;
            var ownerUid = texto((_b = (_a = ficha.data) === null || _a === void 0 ? void 0 : _a.__online) === null || _b === void 0 ? void 0 : _b.ownerUid);
            return !uid || !ownerUid || ownerUid === uid;
        });
    }
    function fichaAtualLocal() {
        /* A ficha ativa precisa existir exatamente sob a chave ativa. Cair para a
           primeira ficha (normalmente Principal) quando essa chave desaparece pode
           transformar uma fila/tarefa atrasada em escrita na personagem errada. */
        var atual = fichaAtivaNomeSeguro();
        var locais = listarFichasLocais();
        return locais.find(function (f) { return f.name === atual; }) || null;
    }
    function fichaLocalSolicitada(localSheetName) {
        if (localSheetName === void 0) { localSheetName = ""; }
        var nome = texto(localSheetName);
        if (nome)
            return listarFichasLocais().find(function (f) { return f.name === nome; }) || null;
        return fichaAtualLocal();
    }
    function prepararIdentidadeFichaParaConta(nomeFicha) {
        var _a, _b;
        var uid = uidContaAtiva();
        if (!uid)
            return listarFichasLocais().find(function (f) { return f.name === nomeFicha; }) || null;
        var ficha = listarFichasLocais().find(function (f) { return f.name === nomeFicha; }) || null;
        if (!ficha)
            return null;
        var ownerUid = texto((_b = (_a = ficha.data) === null || _a === void 0 ? void 0 : _a.__online) === null || _b === void 0 ? void 0 : _b.ownerUid);
        if (ownerUid && ownerUid !== uid)
            return null;
        var data = clonar(ficha.data || {});
        data.__online = data.__online && typeof data.__online === "object" ? data.__online : {};
        var idAntigo = texto(data.__online.sheetId) || idAleatorio("sheet");
        /* O sheetId nasce aleatório e permanece estável. Não o convertemos mais
           para um hash de UID + nome ao entrar na conta: reutilizar um nome deve
           criar outra ficha, não reconectar a personagem antiga. */
        var idNovo = idAntigo;
        data.__online.sheetId = idNovo;
        data.__online.ownerUid = uid;
        data.__online.identityVersion = 2;
        data.__online.originKey = data.__online.originKey || chaveIdentidadeFicha(data.__online.name || ficha.name);
        data.__online.name = ficha.name;
        localStorage.setItem(ficha.key, JSON.stringify(data));
        if (fichaAtivaNomeSeguro() === ficha.name) {
            try {
                if (typeof window.estado !== "undefined")
                    window.estado.__online = clonar(data.__online);
            }
            catch (_erro) { }
        }
        if (idNovo !== idAntigo) {
            var sync = estadoSync();
            if (sync[idAntigo] && !sync[idNovo])
                sync[idNovo] = sync[idAntigo];
            delete sync[idAntigo];
            gravarEstadoSync(sync);
            var outbox = estadoOutbox();
            if (outbox[idAntigo]) {
                outbox[idNovo] = __assign(__assign({}, outbox[idAntigo]), { sheetId: idNovo });
                delete outbox[idAntigo];
                gravarOutbox(outbox);
            }
            if (estadoOnline.dirtySheets.has(idAntigo)) {
                estadoOnline.dirtySheets.delete(idAntigo);
                estadoOnline.dirtySheets.add(idNovo);
            }
        }
        return listarFichasLocais().find(function (f) { return f.name === ficha.name; }) || null;
    }
    function prepararIdentidadesDaConta() {
        if (!uidContaAtiva())
            return [];
        var nomes = listarFichasSincronizaveis().map(function (f) { return f.name; });
        return nomes.map(function (nome) { return prepararIdentidadeFichaParaConta(nome); }).filter(Boolean);
    }
    function limparDadosParaSala(valor, profundidade) {
        if (profundidade === void 0) { profundidade = 0; }
        if (valor == null || profundidade > 5)
            return valor;
        if (typeof valor === "string") {
            if (/^data:image\//i.test(valor))
                return "";
            return valor.length > 1800 ? "".concat(valor.slice(0, 1800), "\u2026") : valor;
        }
        if (typeof valor !== "object")
            return valor;
        if (Array.isArray(valor))
            return valor.slice(0, 120).map(function (v) { return limparDadosParaSala(v, profundidade + 1); });
        var saida = {};
        Object.entries(valor).forEach(function (_a) {
            var _b = __read(_a, 2), chave = _b[0], item = _b[1];
            if (/imagem|image|avatar|background|fundo/i.test(chave))
                return;
            saida[chave] = limparDadosParaSala(item, profundidade + 1);
        });
        return saida;
    }
    function nomeExibicaoSalaDaFicha(ficha) {
        var _a;
        var nomeLocal = texto(ficha === null || ficha === void 0 ? void 0 : ficha.name);
        var nomePersonagem = texto((_a = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _a === void 0 ? void 0 : _a.nome);
        /* Em fichas nomeadas/duplicadas, o nome local é a identidade escolhida pelo
           jogador para aquela ficha. A Principal mantém o nome do personagem.
           Isso evita uma cópia "Pipo" aparecer na sala como o personagem da ficha
           de origem apenas porque o campo interno `nome` foi copiado. */
        if (nomeLocal && nomeLocal !== "Principal")
            return nomeLocal;
        return nomePersonagem || nomeLocal || "Personagem";
    }
    function resumoBatalhaDaFicha(ficha) {
        var d = (ficha === null || ficha === void 0 ? void 0 : ficha.data) || {};
        var numero = function (v, p) {
            if (p === void 0) { p = 0; }
            return Number.isFinite(Number(v)) ? Number(v) : p;
        };
        return {
            sourceType: "sheet",
            sourceSheetId: ficha.sheetId,
            sourceSheetName: ficha.name,
            displayName: nomeExibicaoSalaDaFicha(ficha),
            level: numero(d.nivel, 1),
            rank: texto(d.rank),
            pv: numero(d.pv),
            pvMax: numero(d.pvMax),
            chakra: numero(d.chakra),
            chakraMax: numero(d.chakraMax),
            ca: numero(d.ca, 10),
            cd: numero(d.cd, 10),
            initiativeBonus: numero(d.iniciativa),
            speed: numero(d.velocidade),
            attributes: {
                forca: numero(d.forca), destreza: numero(d.destreza), constituicao: numero(d.constituicao),
                inteligencia: numero(d.inteligencia), sabedoria: numero(d.sabedoria), carisma: numero(d.carisma)
            },
            jutsus: limparDadosParaSala(Array.isArray(d.jutsus) ? d.jutsus : []),
            attacks: limparDadosParaSala(Array.isArray(d.armados) ? d.armados : []),
            resistances: clonar(Array.isArray(d.resistenciasEscolhidas) ? d.resistenciasEscolhidas : []),
            natures: limparDadosParaSala(d.naturezas || {})
        };
    }
    function participantIdDaFicha(uid, sheetId, masterUid, characterId) {
        var _a;
        if (masterUid === void 0) { masterUid = (_a = estadoOnline.sala) === null || _a === void 0 ? void 0 : _a.masterUid; }
        if (characterId === void 0) { characterId = ""; }
        var dono = texto(uid), ficha = texto(sheetId), mestre = texto(masterUid), personagem = texto(characterId);
        if (!dono || !ficha)
            return "";
        /* A partir da Campanha 2.0, personagens autenticados usam characterId como
           participantId. Assim a mesma Conta Google pode possuir vários personagens
           na campanha sem transformar UID, nome ou aparelho em identidade da ficha.
           Sessões anônimas/legadas continuam no fallback antigo. */
        if (personagem)
            return personagem;
        if (mestre && mestre === dono)
            return "player_".concat(hashLeve("".concat(dono, "|").concat(ficha)));
        return dono;
    }
    function participanteRepresentaFicha(participante, ficha, characterId) {
        if (characterId === void 0) { characterId = ""; }
        if (!participante || !ficha)
            return false;
        var personagemSala = texto(participante.characterId);
        var personagemFicha = texto(characterId);
        if (personagemSala && personagemFicha)
            return personagemSala === personagemFicha;
        var sheetSala = texto(participante.sheetId);
        var sheetFicha = texto(ficha.sheetId);
        return Boolean(sheetSala && sheetFicha && sheetSala === sheetFicha);
    }
    function outroDispositivoUsaParticipante(roomId, participantId) {
        return __awaiter(this, void 0, void 0, function () {
            var uid, salaId, alvo, snap, devices, atual_1, _erro_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        uid = texto((_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid), salaId = texto(roomId), alvo = texto(participantId);
                        if (!uid || !salaId || !alvo || !estadoOnline.api || !estadoOnline.db)
                            return [2 /*return*/, false];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, estadoOnline.api.get(estadoOnline.api.ref(estadoOnline.db, "presence/".concat(salaId, "/").concat(uid, "/devices")))];
                    case 2:
                        snap = _c.sent();
                        devices = ((_b = snap === null || snap === void 0 ? void 0 : snap.exists) === null || _b === void 0 ? void 0 : _b.call(snap)) ? snap.val() || {} : {};
                        atual_1 = obterDeviceId();
                        return [2 /*return*/, Object.entries(devices).some(function (_a) {
                                var _b = __read(_a, 2), deviceId = _b[0], device = _b[1];
                                return texto(deviceId) !== texto(atual_1) && (device === null || device === void 0 ? void 0 : device.connected) === true && texto(device === null || device === void 0 ? void 0 : device.participantId) === alvo;
                            })];
                    case 3:
                        _erro_1 = _c.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function desvincularPresencaDesteDispositivo(roomId) {
        return __awaiter(this, void 0, void 0, function () {
            var uid, salaId, ref, _erro_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        uid = texto((_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid), salaId = texto(roomId);
                        if (!uid || !salaId || !estadoOnline.api || !estadoOnline.db)
                            return [2 /*return*/, false];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        ref = estadoOnline.api.ref(estadoOnline.db, "presence/".concat(salaId, "/").concat(uid, "/devices/").concat(obterDeviceId()));
                        return [4 /*yield*/, estadoOnline.api.update(ref, { participantId: "", lastSeen: estadoOnline.api.serverTimestamp() })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 3:
                        _erro_2 = _b.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function normalizarParticipantesSala(raw) {
        var saida = {};
        Object.entries(raw && typeof raw === "object" ? raw : {}).forEach(function (_a) {
            var _b = __read(_a, 2), chave = _b[0], valor = _b[1];
            if (!valor || typeof valor !== "object" || Array.isArray(valor))
                return;
            var participantId = texto(chave);
            if (!participantId)
                return;
            /* A chave participants/{participantId} é a identidade canônica. Salas
               antigas podem não ter gravado o campo interno `id`, e versões antigas
               chegaram a gravar valores divergentes. Nunca dependemos disso para
               ações do mestre. */
            saida[participantId] = __assign(__assign({}, valor), { id: participantId });
        });
        return saida;
    }
    function modoVinculoCampanha(valor) {
        return texto(valor) === "session" ? "session" : "campaign";
    }
    function identidadePersonagemDaFicha(ficha) {
        var _a;
        if (!ficha || !estadoOnline.user || estadoOnline.user.anonymous)
            return { ficha: ficha, characterId: "" };
        var identificada = garantirIdentidadeFichaRealtime(ficha.name) || ficha;
        var online = ((_a = identificada === null || identificada === void 0 ? void 0 : identificada.data) === null || _a === void 0 ? void 0 : _a.__online) || {};
        var characterId = texto(identificada.characterId) || texto(online.characterId) || texto(online.realtimeId);
        return { ficha: identificada, characterId: characterId };
    }
    function resolverVinculoCampanhaDoJogador() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var uid, campanhaId, salaId, solicitado, identidade, characterId, api, refMembro, snap, existente, ativo, atualizacoes, nome, membro;
            var _b, _c, _d, _e, _f, _g;
            var _h = _a === void 0 ? {} : _a, roomId = _h.roomId, campaignId = _h.campaignId, ficha = _h.ficha, resumo = _h.resumo, _j = _h.membershipMode, membershipMode = _j === void 0 ? "campaign" : _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        uid = texto((_b = estadoOnline.user) === null || _b === void 0 ? void 0 : _b.uid);
                        campanhaId = texto(campaignId);
                        salaId = texto(roomId);
                        solicitado = modoVinculoCampanha(membershipMode);
                        if (!uid || ((_c = estadoOnline.user) === null || _c === void 0 ? void 0 : _c.anonymous)) {
                            return [2 /*return*/, { membershipType: "session", membershipMode: "session", campaignId: campanhaId, characterId: "", member: null, created: false }];
                        }
                        identidade = identidadePersonagemDaFicha(ficha);
                        characterId = texto(identidade.characterId);
                        if (!characterId)
                            throw new Error("Não foi possível estabelecer a identidade permanente deste personagem.");
                        if (!campanhaId) {
                            return [2 /*return*/, { membershipType: "session", membershipMode: "session", campaignId: "", characterId: characterId, member: null, created: false, legacyRoom: true, ficha: identidade.ficha }];
                        }
                        api = estadoOnline.api;
                        refMembro = api.ref(estadoOnline.db, "campaignMembers/".concat(campanhaId, "/").concat(uid, "/").concat(characterId));
                        return [4 /*yield*/, api.get(refMembro).catch(function () { return null; })];
                    case 1:
                        snap = _k.sent();
                        existente = ((_d = snap === null || snap === void 0 ? void 0 : snap.exists) === null || _d === void 0 ? void 0 : _d.call(snap)) ? snap.val() : null;
                        ativo = existente && existente.status !== "inactive";
                        if (!ativo) return [3 /*break*/, 3];
                        atualizacoes = { lastSeenAt: agora(), updatedAt: agora() };
                        nome = texto(resumo === null || resumo === void 0 ? void 0 : resumo.displayName);
                        if (nome && nome !== texto(existente.displayName))
                            atualizacoes.displayName = nome;
                        if (texto((_e = identidade.ficha) === null || _e === void 0 ? void 0 : _e.sheetId) && texto((_f = identidade.ficha) === null || _f === void 0 ? void 0 : _f.sheetId) !== texto(existente.legacySheetId))
                            atualizacoes.legacySheetId = texto(identidade.ficha.sheetId);
                        return [4 /*yield*/, api.update(refMembro, atualizacoes).catch(function () { })];
                    case 2:
                        _k.sent();
                        return [2 /*return*/, { membershipType: "campaign", membershipMode: "campaign", campaignId: campanhaId, characterId: characterId, member: __assign(__assign({}, existente), atualizacoes), created: false, ficha: identidade.ficha }];
                    case 3:
                        /* v2.5.8.148 — remover da campanha é uma decisão do mestre. Um jogador
                           removido ainda pode participar como convidado daquela sessão, mas não
                           pode reativar sozinho o vínculo permanente apenas entrando de novo. */
                        if (existente && existente.status === "inactive" && solicitado === "campaign") {
                            throw new Error("Este personagem foi removido da campanha pelo mestre. Entre somente nesta sessão ou peça ao mestre para reativá-lo na Área do Mestre.");
                        }
                        if (solicitado !== "campaign") {
                            return [2 /*return*/, { membershipType: "session", membershipMode: "session", campaignId: campanhaId, characterId: characterId, member: null, created: false, ficha: identidade.ficha }];
                        }
                        membro = {
                            campaignId: campanhaId, userId: uid,
                            characterId: characterId,
                            displayName: texto(resumo === null || resumo === void 0 ? void 0 : resumo.displayName) || "Personagem",
                            joinedAt: agora(), joinedViaRoomId: salaId, status: "active",
                            legacySheetId: texto((_g = identidade.ficha) === null || _g === void 0 ? void 0 : _g.sheetId), lastSeenAt: agora(), updatedAt: agora()
                        };
                        return [4 /*yield*/, api.set(refMembro, membro)];
                    case 4:
                        _k.sent();
                        return [2 /*return*/, { membershipType: "campaign", membershipMode: "campaign", campaignId: campanhaId, characterId: characterId, member: membro, created: true, ficha: identidade.ficha }];
                }
            });
        });
    }
    function migrarParticipanteDaSessao(_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var api, sala, participantesSala, antigo, antigoEhMesmaFicha, ordem, referenciado, existenteNovo, base, participante, updates;
            var _c, _d, _e;
            var roomId = _b.roomId, antigoId = _b.antigoId, novoId = _b.novoId, ficha = _b.ficha, resumo = _b.resumo, _f = _b.characterId, characterId = _f === void 0 ? "" : _f, _g = _b.campaignId, campaignId = _g === void 0 ? "" : _g, _h = _b.membershipType, membershipType = _h === void 0 ? "session" : _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (!roomId || !novoId || !ficha || !resumo)
                            return [2 /*return*/, { skipped: true }];
                        api = estadoOnline.api;
                        sala = estadoOnline.sala || {};
                        participantesSala = sala.participants || {};
                        antigo = antigoId ? participantesSala[antigoId] : null;
                        antigoEhMesmaFicha = Boolean(antigo && participanteRepresentaFicha(antigo, ficha, characterId));
                        if (antigo && antigoId !== novoId && antigoEhMesmaFicha) {
                            ordem = Array.isArray((_c = sala === null || sala === void 0 ? void 0 : sala.combat) === null || _c === void 0 ? void 0 : _c.order) ? sala.combat.order : Object.values(((_d = sala === null || sala === void 0 ? void 0 : sala.combat) === null || _d === void 0 ? void 0 : _d.order) || {});
                            referenciado = ordem.map(texto).includes(texto(antigoId)) || Object.values(sala.effects || {}).some(function (e) { return texto(e === null || e === void 0 ? void 0 : e.participantId) === texto(antigoId); });
                            if (referenciado)
                                return [2 /*return*/, { skipped: true, reason: "participant-referenced-by-combat" }];
                        }
                        existenteNovo = participantesSala[novoId] || null;
                        base = existenteNovo || (antigoEhMesmaFicha ? antigo : null) || {};
                        participante = __assign(__assign(__assign(__assign(__assign({}, base), { id: novoId, ownerUid: estadoOnline.user.uid, type: "player", connected: true, sheetId: ficha.sheetId, localSheetName: ficha.name, displayName: resumo.displayName }), (texto(characterId) ? { characterId: texto(characterId) } : {})), (texto(campaignId) ? { campaignId: texto(campaignId) } : {})), { membershipType: membershipType === "campaign" ? "campaign" : "session", initiativeBonus: resumo.initiativeBonus, initiative: (_e = base === null || base === void 0 ? void 0 : base.initiative) !== null && _e !== void 0 ? _e : null, battle: resumo, joinedAt: (base === null || base === void 0 ? void 0 : base.joinedAt) || agora(), updatedAt: agora() });
                        updates = {};
                        updates["rooms/".concat(roomId, "/participants/").concat(novoId)] = participante;
                        if (antigoId && antigoId !== novoId && antigoEhMesmaFicha)
                            updates["rooms/".concat(roomId, "/participants/").concat(antigoId)] = null;
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db), updates)];
                    case 1:
                        _j.sent();
                        return [2 /*return*/, { ok: true, participantId: novoId, migrated: Boolean(antigoId && antigoId !== novoId && antigoEhMesmaFicha) }];
                }
            });
        });
    }
    function entrarSala(_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var encontrada, nomeAtivo, nomeSolicitado, ficha, api, identidade, characterId, participantIdPreferido, ehDonoDaSala, roomSnap, roomData, participantesRemotos, legadoUid, ordemRemota, uidLegadoReferenciado, legadoEhMesmaFicha, sessaoAnterior, antigoId, participantId, antigo, removerAntigo, ordem, referenciado, mesmaFicha, outroDispositivo, resumo, vinculo, characterIdFinal, existente, base, participante, updates;
            var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            var code = _b.code, localSheetName = _b.localSheetName, _o = _b.membershipMode, membershipMode = _o === void 0 ? "campaign" : _o;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        if (!!estadoOnline.user) return [3 /*break*/, 2];
                        return [4 /*yield*/, entrarAnonimo()];
                    case 1:
                        _p.sent();
                        _p.label = 2;
                    case 2:
                        exigirUsuario();
                        return [4 /*yield*/, buscarSalaPorCodigo(code)];
                    case 3:
                        encontrada = _p.sent();
                        nomeAtivo = fichaAtivaNomeSeguro();
                        nomeSolicitado = texto(localSheetName) || nomeAtivo;
                        /* A sessão online pertence à ficha que está realmente aberta no app.
                           Permitir entrar com outra ficha apenas pelo seletor da Mesa cria uma
                           contradição: hooks, realtime e presença continuam lendo a ficha ativa e
                           acabam anunciando/atualizando outro personagem. Para usar outra ficha, o
                           usuário deve primeiro torná-la ativa no gerenciador de fichas. */
                        if (nomeSolicitado !== nomeAtivo) {
                            throw new Error("Abra a ficha \"".concat(nomeSolicitado, "\" no aplicativo antes de entrar na sala."));
                        }
                        ficha = fichaAtualLocal();
                        if (!ficha)
                            throw new Error("A ficha ativa não existe mais neste aparelho. Abra uma ficha válida antes de entrar na sala.");
                        api = estadoOnline.api;
                        identidade = identidadePersonagemDaFicha(ficha);
                        ficha = identidade.ficha || ficha;
                        characterId = texto(identidade.characterId);
                        participantIdPreferido = participantIdDaFicha(estadoOnline.user.uid, ficha.sheetId, (_c = encontrada.publico) === null || _c === void 0 ? void 0 : _c.masterUid, characterId);
                        if (!participantIdPreferido)
                            throw new Error("Não foi possível identificar a ficha escolhida para a sala.");
                        ehDonoDaSala = ((_d = encontrada.publico) === null || _d === void 0 ? void 0 : _d.masterUid) === estadoOnline.user.uid;
                        if (!!ehDonoDaSala) return [3 /*break*/, 5];
                        return [4 /*yield*/, api.set(api.ref(estadoOnline.db, "roomMemberships/".concat(encontrada.roomId, "/").concat(estadoOnline.user.uid)), {
                                role: "player", joinedAt: agora()
                            })];
                    case 4:
                        _p.sent();
                        _p.label = 5;
                    case 5: return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "rooms/".concat(encontrada.roomId)))];
                    case 6:
                        roomSnap = _p.sent();
                        roomData = roomSnap.exists() ? roomSnap.val() || {} : {};
                        participantesRemotos = normalizarParticipantesSala(roomData.participants || {});
                        legadoUid = participantesRemotos[estadoOnline.user.uid];
                        ordemRemota = Array.isArray((_e = roomData === null || roomData === void 0 ? void 0 : roomData.combat) === null || _e === void 0 ? void 0 : _e.order) ? roomData.combat.order : Object.values(((_f = roomData === null || roomData === void 0 ? void 0 : roomData.combat) === null || _f === void 0 ? void 0 : _f.order) || {});
                        uidLegadoReferenciado = ordemRemota.map(texto).includes(texto(estadoOnline.user.uid))
                            || Object.values(roomData.effects || {}).some(function (e) { return texto(e === null || e === void 0 ? void 0 : e.participantId) === texto(estadoOnline.user.uid); });
                        legadoEhMesmaFicha = Boolean(legadoUid && texto(legadoUid.ownerUid) === texto(estadoOnline.user.uid) &&
                            participanteRepresentaFicha(legadoUid, ficha, characterId));
                        sessaoAnterior = lerJson(CHAVE_SESSAO, null);
                        antigoId = ((sessaoAnterior === null || sessaoAnterior === void 0 ? void 0 : sessaoAnterior.roomId) === encontrada.roomId && (sessaoAnterior === null || sessaoAnterior === void 0 ? void 0 : sessaoAnterior.role) === "player") ? texto(sessaoAnterior.participantId) : "";
                        participantId = participantIdPreferido;
                        /* Compatibilidade de sala antiga sem voltar a usar e-mail/UID como identidade
                           de personagem. O UID legado só é preservado quando conseguimos provar por
                           characterId/sheetId que ele representa ESTA MESMA ficha e quando já está
                           referenciado pelo combate. Uma ficha diferente da mesma conta entra sempre
                           com seu próprio characterId. */
                        if (!participantesRemotos[participantIdPreferido] && legadoEhMesmaFicha && uidLegadoReferenciado) {
                            participantId = estadoOnline.user.uid;
                        }
                        else if (!antigoId && !uidLegadoReferenciado && legadoEhMesmaFicha && participantId !== estadoOnline.user.uid) {
                            /* Fora de combate, uma entrada legada da mesma ficha pode ser promovida
                               com segurança de participants/{uid} para participants/{characterId}. */
                            antigoId = estadoOnline.user.uid;
                        }
                        antigo = antigoId && antigoId !== participantId ? participantesRemotos[antigoId] : null;
                        removerAntigo = false;
                        if (!(antigo && texto(antigo.ownerUid) === texto(estadoOnline.user.uid))) return [3 /*break*/, 9];
                        ordem = Array.isArray((_g = roomData === null || roomData === void 0 ? void 0 : roomData.combat) === null || _g === void 0 ? void 0 : _g.order) ? roomData.combat.order : Object.values(((_h = roomData === null || roomData === void 0 ? void 0 : roomData.combat) === null || _h === void 0 ? void 0 : _h.order) || {});
                        referenciado = ordem.map(texto).includes(antigoId) || Object.values(roomData.effects || {}).some(function (e) { return texto(e === null || e === void 0 ? void 0 : e.participantId) === antigoId; });
                        mesmaFicha = participanteRepresentaFicha(antigo, ficha, characterId);
                        if (!(mesmaFicha && referenciado)) return [3 /*break*/, 7];
                        /* Migração de identidade da MESMA ficha durante um combate: preserva a
                           chave antiga para não quebrar iniciativa/efeitos já referenciados. */
                        participantId = antigoId;
                        return [3 /*break*/, 9];
                    case 7:
                        if (!(mesmaFicha && !referenciado)) return [3 /*break*/, 9];
                        return [4 /*yield*/, outroDispositivoUsaParticipante(encontrada.roomId, antigoId)];
                    case 8:
                        outroDispositivo = _p.sent();
                        removerAntigo = !outroDispositivo;
                        _p.label = 9;
                    case 9:
                        resumo = resumoBatalhaDaFicha(ficha);
                        return [4 /*yield*/, resolverVinculoCampanhaDoJogador({
                                roomId: encontrada.roomId, campaignId: (_j = encontrada.publico) === null || _j === void 0 ? void 0 : _j.campaignId,
                                ficha: ficha,
                                resumo: resumo,
                                membershipMode: membershipMode
                            })];
                    case 10:
                        vinculo = _p.sent();
                        ficha = vinculo.ficha || ficha;
                        characterIdFinal = texto(vinculo.characterId) || characterId;
                        existente = participantesRemotos[participantId] || null;
                        base = existente || {};
                        participante = __assign(__assign(__assign(__assign(__assign({}, base), { id: participantId, ownerUid: estadoOnline.user.uid, type: "player", connected: true, sheetId: ficha.sheetId, localSheetName: ficha.name, displayName: resumo.displayName }), (characterIdFinal ? { characterId: characterIdFinal } : {})), (texto((_k = encontrada.publico) === null || _k === void 0 ? void 0 : _k.campaignId) ? { campaignId: texto(encontrada.publico.campaignId) } : {})), { membershipType: vinculo.membershipType, initiativeBonus: resumo.initiativeBonus, initiative: (_l = base === null || base === void 0 ? void 0 : base.initiative) !== null && _l !== void 0 ? _l : null, battle: resumo, joinedAt: (base === null || base === void 0 ? void 0 : base.joinedAt) || agora(), updatedAt: agora() });
                        updates = {};
                        updates["rooms/".concat(encontrada.roomId, "/participants/").concat(participantId)] = participante;
                        if (removerAntigo && antigo && texto(antigo.ownerUid) === texto(estadoOnline.user.uid)) {
                            updates["rooms/".concat(encontrada.roomId, "/participants/").concat(antigoId)] = null;
                        }
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db), updates)];
                    case 11:
                        _p.sent();
                        estadoOnline.sessionGeneration += 1;
                        salvarJson(CHAVE_SESSAO, {
                            roomId: encontrada.roomId,
                            participantId: participantId,
                            role: "player", sheetId: ficha.sheetId, localSheetName: ficha.name, code: encontrada.code,
                            characterId: characterIdFinal, campaignId: texto((_m = encontrada.publico) === null || _m === void 0 ? void 0 : _m.campaignId), membershipMode: vinculo.membershipType
                        });
                        return [4 /*yield*/, observarSala(encontrada.roomId)];
                    case 12:
                        _p.sent();
                        return [2 /*return*/, __assign(__assign({}, encontrada), { membershipType: vinculo.membershipType, campaignMemberCreated: vinculo.created === true, characterId: characterIdFinal })];
                }
            });
        });
    }
    function observarSala(roomId_1) {
        return __awaiter(this, arguments, void 0, function (roomId, _a) {
            var api, sessao;
            var _b, _c, _d, _e;
            var _f = _a === void 0 ? {} : _a, _g = _f.restaurar, restaurar = _g === void 0 ? false : _g;
            return __generator(this, function (_h) {
                exigirUsuario();
                api = estadoOnline.api;
                (_b = estadoOnline.unsubscribeSala) === null || _b === void 0 ? void 0 : _b.call(estadoOnline);
                (_c = estadoOnline.unsubscribePresenca) === null || _c === void 0 ? void 0 : _c.call(estadoOnline);
                (_d = estadoOnline.unsubscribeEventos) === null || _d === void 0 ? void 0 : _d.call(estadoOnline);
                (_e = estadoOnline.unsubscribeConnected) === null || _e === void 0 ? void 0 : _e.call(estadoOnline);
                estadoOnline.salaId = roomId;
                estadoOnline.unsubscribeSala = api.onValue(api.ref(estadoOnline.db, "rooms/".concat(roomId)), function (snap) {
                    if (!snap.exists()) {
                        estadoOnline.sala = null;
                        emitir("sala-encerrada", snapshot());
                        limparSessaoLocal();
                        return;
                    }
                    var salaRemota = snap.val() || {};
                    if (salaRemota.status !== "open") {
                        estadoOnline.sala = __assign(__assign({ id: roomId }, salaRemota), { participants: normalizarParticipantesSala(salaRemota.participants) });
                        emitir("sala-encerrada", snapshot());
                        var sessaoAtual = lerJson(CHAVE_SESSAO, null);
                        if (texto(sessaoAtual === null || sessaoAtual === void 0 ? void 0 : sessaoAtual.roomId) === texto(roomId)) {
                            /* A sala encerrada deixa de ser uma sessão ativa neste aparelho.
                               Removemos presença e estado local, mas preservamos o snapshot final
                               dos participantes para o histórico da sessão. */
                            sairDaSala({ silencioso: true, preservarParticipante: true }).catch(function () { return limparSessaoLocal(); });
                        }
                        else {
                            limparSessaoLocal();
                        }
                        return;
                    }
                    estadoOnline.sala = __assign(__assign({ id: roomId }, salaRemota), { participants: normalizarParticipantesSala(salaRemota.participants) });
                    emitir("sala", snapshot());
                    /* Se o jogador trocou/duplicou a ficha enquanto a sessão da sala ficou
                       aberta, a sessão local ainda pode apontar para a ficha anterior. Fazemos
                       a reconciliação somente quando nome/id ativos diferem do que a sessão
                       registrou, evitando publicar silenciosamente os recursos da ficha velha. */
                    reconciliarSessaoDaSalaComFichaAtiva().catch(function () { });
                    deduplicarEfeitosDaSala().catch(function () { });
                    processarEventosXp().catch(function () { });
                }, function (erro) {
                    var codigo = texto(erro === null || erro === void 0 ? void 0 : erro.code).toLowerCase();
                    if (restaurar && codigo.includes("permission-denied")) {
                        /* Se a associação da conta já foi removida, uma sessão local residual
                           não pode deixar o PWA preso eternamente em "Reconectando". */
                        var sessaoAtual = lerJson(CHAVE_SESSAO, null);
                        if (texto(sessaoAtual === null || sessaoAtual === void 0 ? void 0 : sessaoAtual.roomId) === texto(roomId))
                            limparSessaoLocal();
                    }
                    emitir("erro", { mensagem: erroAmigavel(erro), erro: erro });
                });
                estadoOnline.unsubscribePresenca = api.onValue(api.ref(estadoOnline.db, "presence/".concat(roomId)), function (snap) {
                    estadoOnline.presencas = snap.val() || {};
                    emitir("presenca", snapshot());
                });
                configurarPresenca(roomId).catch(function () { });
                observarEventos(roomId);
                if (!restaurar) {
                    sessao = lerJson(CHAVE_SESSAO, {}) || {};
                    salvarJson(CHAVE_SESSAO, __assign(__assign({}, sessao), { roomId: roomId, code: sessao.code || "" }));
                }
                return [2 /*return*/, roomId];
            });
        });
    }
    function configurarPresenca(roomId) {
        return __awaiter(this, void 0, void 0, function () {
            var api, connectedRef, deviceId, geracao, myUserPresence, myDevicePresence;
            var _this = this;
            return __generator(this, function (_a) {
                exigirUsuario();
                api = estadoOnline.api;
                connectedRef = api.ref(estadoOnline.db, ".info/connected");
                deviceId = obterDeviceId();
                geracao = ++estadoOnline.presenceGeneration;
                myUserPresence = api.ref(estadoOnline.db, "presence/".concat(roomId, "/").concat(estadoOnline.user.uid));
                myDevicePresence = api.ref(estadoOnline.db, "presence/".concat(roomId, "/").concat(estadoOnline.user.uid, "/devices/").concat(deviceId));
                estadoOnline.unsubscribeConnected = api.onValue(connectedRef, function (snap) { return __awaiter(_this, void 0, void 0, function () {
                    var sessaoInicial, _erro_3, sessaoAtual, _erro_4;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (snap.val() !== true || geracao !== estadoOnline.presenceGeneration)
                                    return [2 /*return*/];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 10, , 11]);
                                sessaoInicial = lerJson(CHAVE_SESSAO, {}) || {};
                                if (texto(sessaoInicial.roomId) !== texto(roomId))
                                    return [2 /*return*/];
                                /* Cada aparelho mantém a própria presença. A geração impede que um
                                   callback antigo, já em voo durante a troca de ficha/sessão, grave de
                                   volta o participantId anterior depois da presença nova. */
                                return [4 /*yield*/, api.update(myUserPresence, { connected: null, lastSeen: null, deviceId: null, participantId: null })];
                            case 2:
                                /* Cada aparelho mantém a própria presença. A geração impede que um
                                   callback antigo, já em voo durante a troca de ficha/sessão, grave de
                                   volta o participantId anterior depois da presença nova. */
                                _a.sent();
                                if (geracao !== estadoOnline.presenceGeneration)
                                    return [2 /*return*/];
                                return [4 /*yield*/, api.onDisconnect(myDevicePresence).remove()];
                            case 3:
                                _a.sent();
                                if (!(geracao !== estadoOnline.presenceGeneration)) return [3 /*break*/, 8];
                                _a.label = 4;
                            case 4:
                                _a.trys.push([4, 6, , 7]);
                                return [4 /*yield*/, api.onDisconnect(myDevicePresence).cancel()];
                            case 5:
                                _a.sent();
                                return [3 /*break*/, 7];
                            case 6:
                                _erro_3 = _a.sent();
                                return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
                            case 8:
                                sessaoAtual = lerJson(CHAVE_SESSAO, {}) || {};
                                if (texto(sessaoAtual.roomId) !== texto(roomId))
                                    return [2 /*return*/];
                                return [4 /*yield*/, api.set(myDevicePresence, {
                                        connected: true, lastSeen: api.serverTimestamp(),
                                        deviceId: deviceId,
                                        participantId: sessaoAtual.role === "player" ? texto(sessaoAtual.participantId) : ""
                                    })];
                            case 9:
                                _a.sent();
                                return [3 /*break*/, 11];
                            case 10:
                                _erro_4 = _a.sent();
                                return [3 /*break*/, 11];
                            case 11: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    }
    function limparSessaoLocal() {
        var _a, _b, _c, _d;
        estadoOnline.presenceGeneration += 1;
        estadoOnline.sessionGeneration += 1;
        localStorage.removeItem(CHAVE_SESSAO);
        (_a = estadoOnline.unsubscribeSala) === null || _a === void 0 ? void 0 : _a.call(estadoOnline);
        estadoOnline.unsubscribeSala = null;
        (_b = estadoOnline.unsubscribePresenca) === null || _b === void 0 ? void 0 : _b.call(estadoOnline);
        estadoOnline.unsubscribePresenca = null;
        (_c = estadoOnline.unsubscribeEventos) === null || _c === void 0 ? void 0 : _c.call(estadoOnline);
        estadoOnline.unsubscribeEventos = null;
        (_d = estadoOnline.unsubscribeConnected) === null || _d === void 0 ? void 0 : _d.call(estadoOnline);
        estadoOnline.unsubscribeConnected = null;
        estadoOnline.salaId = null;
        estadoOnline.sala = null;
        estadoOnline.presencas = {};
        emitir("sala", snapshot());
    }
    function sairDaSala() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var sessao, api, uid, deviceId, userPresenceRef, devicePresenceRef, _erro_5, presencaSnap, devices, ativos, participantId_1, outroMesmoParticipante, outroDispositivoAtivo, membershipRef, membership, erro_7;
            var _b, _c, _d, _e;
            var _f = _a === void 0 ? {} : _a, _g = _f.silencioso, silencioso = _g === void 0 ? false : _g, _h = _f.preservarParticipante, preservarParticipante = _h === void 0 ? false : _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        /* Invalida imediatamente callbacks de presença e qualquer reconciliação de
                           ficha/sala que ainda esteja em voo. Nenhum trabalho iniciado antes do
                           clique em Sair pode recriar CHAVE_SESSAO depois da limpeza. */
                        estadoOnline.presenceGeneration += 1;
                        estadoOnline.sessionGeneration += 1;
                        sessao = lerJson(CHAVE_SESSAO, null);
                        if (!(sessao === null || sessao === void 0 ? void 0 : sessao.roomId) || !estadoOnline.user) {
                            limparSessaoLocal();
                            return [2 /*return*/];
                        }
                        api = estadoOnline.api;
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 15, , 16]);
                        uid = estadoOnline.user.uid;
                        deviceId = obterDeviceId();
                        userPresenceRef = api.ref(estadoOnline.db, "presence/".concat(sessao.roomId, "/").concat(uid));
                        devicePresenceRef = api.ref(estadoOnline.db, "presence/".concat(sessao.roomId, "/").concat(uid, "/devices/").concat(deviceId));
                        _j.label = 2;
                    case 2:
                        _j.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, api.onDisconnect(devicePresenceRef).cancel()];
                    case 3:
                        _j.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _erro_5 = _j.sent();
                        return [3 /*break*/, 5];
                    case 5: return [4 /*yield*/, api.remove(devicePresenceRef)];
                    case 6:
                        _j.sent();
                        return [4 /*yield*/, api.get(userPresenceRef).catch(function () { return null; })];
                    case 7:
                        presencaSnap = _j.sent();
                        devices = Object.values(((_b = presencaSnap === null || presencaSnap === void 0 ? void 0 : presencaSnap.exists) === null || _b === void 0 ? void 0 : _b.call(presencaSnap)) ? ((_c = presencaSnap.val()) === null || _c === void 0 ? void 0 : _c.devices) || {} : {});
                        ativos = devices.filter(function (device) { return (device === null || device === void 0 ? void 0 : device.connected) === true; });
                        participantId_1 = texto(sessao.participantId) || uid;
                        outroMesmoParticipante = ativos.some(function (device) { return texto(device === null || device === void 0 ? void 0 : device.participantId) === participantId_1; });
                        outroDispositivoAtivo = ativos.length > 0;
                        if (!(sessao.role === "player" && !preservarParticipante)) return [3 /*break*/, 12];
                        if (!!outroMesmoParticipante) return [3 /*break*/, 9];
                        return [4 /*yield*/, api.remove(api.ref(estadoOnline.db, "rooms/".concat(sessao.roomId, "/participants/").concat(participantId_1)))];
                    case 8:
                        _j.sent();
                        _j.label = 9;
                    case 9:
                        if (!!outroDispositivoAtivo) return [3 /*break*/, 12];
                        membershipRef = api.ref(estadoOnline.db, "roomMemberships/".concat(sessao.roomId, "/").concat(uid));
                        return [4 /*yield*/, api.get(membershipRef).catch(function () { return null; })];
                    case 10:
                        membership = _j.sent();
                        if (!(((_d = membership === null || membership === void 0 ? void 0 : membership.exists) === null || _d === void 0 ? void 0 : _d.call(membership)) && ((_e = membership.val()) === null || _e === void 0 ? void 0 : _e.role) === "player")) return [3 /*break*/, 12];
                        return [4 /*yield*/, api.remove(membershipRef)];
                    case 11:
                        _j.sent();
                        _j.label = 12;
                    case 12:
                        if (!!outroDispositivoAtivo) return [3 /*break*/, 14];
                        return [4 /*yield*/, api.remove(userPresenceRef).catch(function () { })];
                    case 13:
                        _j.sent();
                        _j.label = 14;
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        erro_7 = _j.sent();
                        if (!silencioso)
                            throw erro_7;
                        return [3 /*break*/, 16];
                    case 16:
                        limparSessaoLocal();
                        return [2 /*return*/];
                }
            });
        });
    }
    function encerrarSala() {
        return __awaiter(this, void 0, void 0, function () {
            var api, room, updates, sessao;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirMestre();
                        api = estadoOnline.api, room = estadoOnline.sala;
                        updates = {};
                        updates["rooms/".concat(room.id, "/status")] = "closed";
                        updates["rooms/".concat(room.id, "/updatedAt")] = agora();
                        updates["roomCodes/".concat(room.code, "/status")] = "closed";
                        updates["roomPublic/".concat(room.id, "/status")] = "closed";
                        updates["campaigns/".concat(room.campaignId, "/rooms/").concat(room.id, "/status")] = "closed";
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db), updates)];
                    case 1:
                        _a.sent();
                        sessao = lerJson(CHAVE_SESSAO, null);
                        if (!(texto(sessao === null || sessao === void 0 ? void 0 : sessao.roomId) === texto(room.id))) return [3 /*break*/, 3];
                        return [4 /*yield*/, sairDaSala({ silencioso: true, preservarParticipante: true })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, { ok: true, roomId: room.id }];
                }
            });
        });
    }
    function numeroNpc(valor, padrao) {
        if (padrao === void 0) { padrao = 0; }
        var n = Number(valor);
        return Number.isFinite(n) ? n : padrao;
    }
    function templateNpcRapido(dados) {
        if (dados === void 0) { dados = {}; }
        var nome = texto(dados.displayName).slice(0, 80);
        var pvMax = Math.max(0, numeroNpc(dados.pvMax, 0));
        var chakraMax = Math.max(0, numeroNpc(dados.chakraMax, 0));
        return {
            sourceType: "quick", displayName: nome, level: Math.max(1, numeroNpc(dados.level, 1)), rank: texto(dados.rank).slice(0, 40),
            pv: pvMax,
            pvMax: pvMax,
            chakra: chakraMax,
            chakraMax: chakraMax,
            ca: numeroNpc(dados.ca, 10), cd: numeroNpc(dados.cd, 10), initiativeBonus: numeroNpc(dados.initiativeBonus, 0),
            speed: Math.max(0, numeroNpc(dados.speed, 0)), attributes: {}, jutsus: [], attacks: [], resistances: [], natures: {}
        };
    }
    function snapshotNpcCampanhaParaSala(npc, nomeExibicao) {
        if (nomeExibicao === void 0) { nomeExibicao = ""; }
        var nome = texto(nomeExibicao) || texto(npc === null || npc === void 0 ? void 0 : npc.displayName) || "NPC";
        var battle = clonar((npc === null || npc === void 0 ? void 0 : npc.battleTemplate) && typeof npc.battleTemplate === "object" ? npc.battleTemplate : {});
        /* Informações privadas vivem exclusivamente em campaignNpcs. Mesmo que uma
           versão futura acrescente campos privados ao template, esta barreira evita
           que eles vazem para rooms, ramo que os jogadores da sessão conseguem ler. */
        ["privateNotes", "notesPrivate", "masterNotes", "gmNotes"].forEach(function (chave) { return delete battle[chave]; });
        battle.displayName = nome;
        battle.campaignNpcId = texto(npc === null || npc === void 0 ? void 0 : npc.id);
        battle.sourceType = texto(npc === null || npc === void 0 ? void 0 : npc.sourceType) === "sheet" ? "campaign-sheet" : "campaign-quick";
        return limparDadosParaSala(battle);
    }
    function salvarFichaComoNpcCampanha(campaignId_1, localSheetName_1) {
        return __awaiter(this, arguments, void 0, function (campaignId, localSheetName, _a) {
            var idCampanha, campanha, ficha, resumo, npcId, nome, api, instante, npc;
            var _b = _a === void 0 ? {} : _a, displayName = _b.displayName, privateNotes = _b.privateNotes;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        exigirContaGoogle();
                        idCampanha = texto(campaignId);
                        campanha = estadoOnline.campanhas.find(function (item) { return item.id === idCampanha; });
                        if (!campanha || campanha.masterUid !== estadoOnline.user.uid)
                            throw new Error("Campanha não encontrada.");
                        ficha = listarFichasLocais().find(function (f) { return f.name === localSheetName; });
                        if (!ficha)
                            throw new Error("Ficha local não encontrada.");
                        resumo = resumoBatalhaDaFicha(ficha);
                        npcId = idAleatorio("npc");
                        nome = texto(displayName).slice(0, 80) || resumo.displayName || "NPC";
                        api = estadoOnline.api, instante = agora();
                        npc = {
                            id: npcId, campaignId: idCampanha, ownerUid: estadoOnline.user.uid, status: "active",
                            displayName: nome, sourceType: "sheet", sourceSheetId: texto(ficha.sheetId), sourceSheetName: texto(ficha.name).slice(0, 80),
                            battleTemplate: __assign(__assign({}, resumo), { displayName: nome }), privateNotes: texto(privateNotes).slice(0, 4000),
                            createdAt: instante, updatedAt: instante
                        };
                        return [4 /*yield*/, api.set(api.ref(estadoOnline.db, "campaignNpcs/".concat(idCampanha, "/").concat(npcId)), npc)];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db, "campaigns/".concat(idCampanha)), { updatedAt: instante })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, npcId];
                }
            });
        });
    }
    function criarNpcCampanha(campaignId_1) {
        return __awaiter(this, arguments, void 0, function (campaignId, dados) {
            var idCampanha, campanha, nome, npcId, api, instante, npc;
            if (dados === void 0) { dados = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirContaGoogle();
                        idCampanha = texto(campaignId);
                        campanha = estadoOnline.campanhas.find(function (item) { return item.id === idCampanha; });
                        if (!campanha || campanha.masterUid !== estadoOnline.user.uid)
                            throw new Error("Campanha não encontrada.");
                        nome = texto(dados.displayName).slice(0, 80);
                        if (!nome)
                            throw new Error("Informe o nome do NPC ou inimigo.");
                        npcId = idAleatorio("npc"), api = estadoOnline.api, instante = agora();
                        npc = {
                            id: npcId, campaignId: idCampanha, ownerUid: estadoOnline.user.uid, status: "active", displayName: nome, sourceType: "quick",
                            battleTemplate: templateNpcRapido(__assign(__assign({}, dados), { displayName: nome })), privateNotes: texto(dados.privateNotes).slice(0, 4000),
                            createdAt: instante, updatedAt: instante
                        };
                        return [4 /*yield*/, api.set(api.ref(estadoOnline.db, "campaignNpcs/".concat(idCampanha, "/").concat(npcId)), npc)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db, "campaigns/".concat(idCampanha)), { updatedAt: instante })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, npcId];
                }
            });
        });
    }
    function atualizarNpcCampanha(campaignId_1, npcId_1) {
        return __awaiter(this, arguments, void 0, function (campaignId, npcId, dados) {
            var idCampanha, idNpc, campanha, api, refNpc, snap, atual, nome, battle, ajustarNumero, updates;
            if (dados === void 0) { dados = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirContaGoogle();
                        idCampanha = texto(campaignId), idNpc = texto(npcId);
                        campanha = estadoOnline.campanhas.find(function (item) { return item.id === idCampanha; });
                        if (!campanha || campanha.masterUid !== estadoOnline.user.uid)
                            throw new Error("Campanha não encontrada.");
                        api = estadoOnline.api, refNpc = api.ref(estadoOnline.db, "campaignNpcs/".concat(idCampanha, "/").concat(idNpc));
                        return [4 /*yield*/, api.get(refNpc)];
                    case 1:
                        snap = _a.sent();
                        if (!snap.exists())
                            throw new Error("NPC da campanha não encontrado.");
                        atual = __assign({ id: idNpc }, snap.val());
                        nome = texto(dados.displayName).slice(0, 80) || texto(atual.displayName) || "NPC";
                        battle = clonar(atual.battleTemplate || {});
                        battle.displayName = nome;
                        ajustarNumero = function (chave, _a) {
                            var _b = _a === void 0 ? {} : _a, _c = _b.min, min = _c === void 0 ? null : _c, _d = _b.padrao, padrao = _d === void 0 ? 0 : _d, _e = _b.espelhar, espelhar = _e === void 0 ? null : _e;
                            if (dados[chave] === undefined || dados[chave] === null || dados[chave] === "")
                                return;
                            var valor = numeroNpc(dados[chave], padrao);
                            if (min !== null)
                                valor = Math.max(min, valor);
                            battle[chave] = valor;
                            if (espelhar)
                                battle[espelhar] = valor;
                        };
                        ajustarNumero("level", { min: 1, padrao: 1 });
                        if (dados.rank !== undefined)
                            battle.rank = texto(dados.rank).slice(0, 40);
                        ajustarNumero("pvMax", { min: 0, padrao: 0, espelhar: "pv" });
                        ajustarNumero("chakraMax", { min: 0, padrao: 0, espelhar: "chakra" });
                        ajustarNumero("ca", { padrao: 10 });
                        ajustarNumero("cd", { padrao: 10 });
                        ajustarNumero("initiativeBonus");
                        ajustarNumero("speed", { min: 0 });
                        updates = { displayName: nome, battleTemplate: battle, updatedAt: agora() };
                        if (dados.privateNotes !== undefined)
                            updates.privateNotes = texto(dados.privateNotes).slice(0, 4000);
                        return [4 /*yield*/, api.update(refNpc, updates)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db, "campaigns/".concat(idCampanha)), { updatedAt: agora() })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, { ok: true, npcId: idNpc }];
                }
            });
        });
    }
    function arquivarNpcCampanha(campaignId, npcId) {
        return __awaiter(this, void 0, void 0, function () {
            var idCampanha, idNpc, campanha, api, refNpc, snap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirContaGoogle();
                        idCampanha = texto(campaignId), idNpc = texto(npcId);
                        campanha = estadoOnline.campanhas.find(function (item) { return item.id === idCampanha; });
                        if (!campanha || campanha.masterUid !== estadoOnline.user.uid)
                            throw new Error("Campanha não encontrada.");
                        api = estadoOnline.api, refNpc = api.ref(estadoOnline.db, "campaignNpcs/".concat(idCampanha, "/").concat(idNpc));
                        return [4 /*yield*/, api.get(refNpc)];
                    case 1:
                        snap = _a.sent();
                        if (!snap.exists())
                            throw new Error("NPC da campanha não encontrado.");
                        return [4 /*yield*/, api.update(refNpc, { status: "inactive", updatedAt: agora() })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db, "campaigns/".concat(idCampanha)), { updatedAt: agora() })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, { ok: true, npcId: idNpc }];
                }
            });
        });
    }
    function adicionarNpcCampanhaNaSala(npcId_1) {
        return __awaiter(this, arguments, void 0, function (npcId, _a) {
            var idNpc, idCampanha, api, snap, npc, nome, battle, participantId, participante;
            var _b, _c;
            var _d = _a === void 0 ? {} : _a, displayName = _d.displayName;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        exigirMestre();
                        idNpc = texto(npcId), idCampanha = texto((_b = estadoOnline.sala) === null || _b === void 0 ? void 0 : _b.campaignId);
                        if (!idCampanha)
                            throw new Error("Esta sala não está vinculada a uma campanha permanente.");
                        if (((_c = estadoOnline.sala) === null || _c === void 0 ? void 0 : _c.status) !== "open")
                            throw new Error("A sala já foi encerrada.");
                        api = estadoOnline.api;
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "campaignNpcs/".concat(idCampanha, "/").concat(idNpc)))];
                    case 1:
                        snap = _e.sent();
                        if (!snap.exists())
                            throw new Error("NPC da campanha não encontrado.");
                        npc = __assign({ id: idNpc }, snap.val());
                        if (texto(npc.campaignId) !== idCampanha || npc.status !== "active")
                            throw new Error("Este NPC não está disponível nesta campanha.");
                        nome = texto(displayName).slice(0, 80) || texto(npc.displayName) || "NPC";
                        battle = snapshotNpcCampanhaParaSala(npc, nome);
                        participantId = idAleatorio("npc");
                        participante = __assign(__assign(__assign({ id: participantId, ownerUid: estadoOnline.user.uid, type: "npc-campaign", displayName: nome, campaignId: idCampanha, campaignNpcId: idNpc, initiativeBonus: numeroNpc(battle.initiativeBonus, 0), initiative: null, battle: battle }, (texto(npc.sourceSheetId) ? { sourceSheetId: texto(npc.sourceSheetId) } : {})), (texto(npc.sourceSheetName) ? { sourceSheetName: texto(npc.sourceSheetName) } : {})), { createdAt: agora(), updatedAt: agora() });
                        return [4 /*yield*/, api.set(api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/participants/").concat(participantId)), participante)];
                    case 2:
                        _e.sent();
                        return [2 /*return*/, participantId];
                }
            });
        });
    }
    function importarFichaComoNpc(localSheetName_1) {
        return __awaiter(this, arguments, void 0, function (localSheetName, _a) {
            var ficha, resumo, id, nome, participante;
            var _b = _a === void 0 ? {} : _a, displayName = _b.displayName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        exigirMestre();
                        ficha = listarFichasLocais().find(function (f) { return f.name === localSheetName; });
                        if (!ficha)
                            throw new Error("Ficha local não encontrada.");
                        resumo = resumoBatalhaDaFicha(ficha);
                        id = idAleatorio("npc");
                        nome = texto(displayName) || resumo.displayName;
                        participante = {
                            id: id,
                            ownerUid: estadoOnline.user.uid, type: "npc-imported", displayName: nome,
                            initiativeBonus: resumo.initiativeBonus, initiative: null, battle: __assign(__assign({}, resumo), { displayName: nome }),
                            sourceSheetId: ficha.sheetId, sourceSheetName: ficha.name, createdAt: agora(), updatedAt: agora()
                        };
                        return [4 /*yield*/, estadoOnline.api.set(estadoOnline.api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/participants/").concat(id)), participante)];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, id];
                }
            });
        });
    }
    function criarNpcRapido(dados) {
        return __awaiter(this, void 0, void 0, function () {
            var numero, nome, id, battle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirMestre();
                        numero = function (v, p) {
                            if (p === void 0) { p = 0; }
                            return Number.isFinite(Number(v)) ? Number(v) : p;
                        };
                        nome = texto(dados === null || dados === void 0 ? void 0 : dados.displayName).slice(0, 80);
                        if (!nome)
                            throw new Error("Informe o nome do NPC ou inimigo.");
                        id = idAleatorio("npc");
                        battle = {
                            sourceType: "quick", displayName: nome, level: numero(dados.level, 1), rank: texto(dados.rank),
                            pv: numero(dados.pv, dados.pvMax || 0), pvMax: numero(dados.pvMax),
                            chakra: numero(dados.chakra, dados.chakraMax || 0), chakraMax: numero(dados.chakraMax),
                            ca: numero(dados.ca, 10), cd: numero(dados.cd, 10), initiativeBonus: numero(dados.initiativeBonus),
                            speed: numero(dados.speed), notes: texto(dados.notes).slice(0, 600), attributes: {}, jutsus: [], attacks: []
                        };
                        return [4 /*yield*/, estadoOnline.api.set(estadoOnline.api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/participants/").concat(id)), {
                                id: id,
                                ownerUid: estadoOnline.user.uid, type: "npc-quick", displayName: nome,
                                initiativeBonus: battle.initiativeBonus, initiative: null,
                                battle: battle,
                                createdAt: agora(), updatedAt: agora()
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, id];
                }
            });
        });
    }
    function validarVinculoFichaDaSessao(sessao) {
        var _a, _b, _c;
        var participantId = texto(sessao === null || sessao === void 0 ? void 0 : sessao.participantId) || texto((_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid);
        var participante = participantId ? (_c = (_b = estadoOnline.sala) === null || _b === void 0 ? void 0 : _b.participants) === null || _c === void 0 ? void 0 : _c[participantId] : null;
        var characterSessao = texto(sessao === null || sessao === void 0 ? void 0 : sessao.characterId);
        var characterSala = texto(participante === null || participante === void 0 ? void 0 : participante.characterId);
        var sheetSessao = texto(sessao === null || sessao === void 0 ? void 0 : sessao.sheetId);
        var sheetSala = texto(participante === null || participante === void 0 ? void 0 : participante.sheetId);
        /* characterId é a identidade entre aparelhos. sheetId permanece apenas
           como compatibilidade para participantes legados que ainda não possuem
           identidade permanente gravada na sala. */
        var usaCharacterId = Boolean(characterSessao && characterSala);
        var ok = !participante || (usaCharacterId ? characterSessao === characterSala : (!sheetSessao || !sheetSala || sheetSessao === sheetSala));
        return { ok: ok, participantId: participantId, participante: participante, characterSessao: characterSessao, characterSala: characterSala, sheetSessao: sheetSessao, sheetSala: sheetSala };
    }
    var reconciliacaoFichaSalaEmCurso = null;
    function reconciliarSessaoDaSalaComFichaAtiva() {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (reconciliacaoFichaSalaEmCurso)
                    return [2 /*return*/, reconciliacaoFichaSalaEmCurso];
                reconciliacaoFichaSalaEmCurso = (function () { return __awaiter(_this, void 0, void 0, function () {
                    var geracaoSessao, sessao, sessaoAindaAtual, ativa, identidade, characterIdInicial, idPreferido, atualId, participanteAtual, resumo, vinculo, characterId, novoId, identidadeMudou, faltaParticipante, resultado;
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    return __generator(this, function (_k) {
                        switch (_k.label) {
                            case 0:
                                if (!estadoOnline.user)
                                    return [2 /*return*/, { skipped: true, reason: "no-user" }];
                                geracaoSessao = estadoOnline.sessionGeneration;
                                sessao = lerJson(CHAVE_SESSAO, null);
                                if (!(sessao === null || sessao === void 0 ? void 0 : sessao.roomId) || sessao.role !== "player")
                                    return [2 /*return*/, { skipped: true, reason: "no-player-session" }];
                                if (estadoOnline.salaId !== sessao.roomId || !estadoOnline.sala)
                                    return [2 /*return*/, { skipped: true, reason: "room-not-ready" }];
                                sessaoAindaAtual = function () {
                                    if (geracaoSessao !== estadoOnline.sessionGeneration)
                                        return false;
                                    var atual = lerJson(CHAVE_SESSAO, null);
                                    return Boolean(atual && texto(atual.roomId) === texto(sessao.roomId) && atual.role === "player" && texto(atual.participantId) === texto(sessao.participantId));
                                };
                                ativa = fichaAtualLocal();
                                if (!ativa)
                                    return [2 /*return*/, { skipped: true, reason: "active-sheet-not-found" }];
                                identidade = identidadePersonagemDaFicha(ativa);
                                ativa = identidade.ficha || ativa;
                                characterIdInicial = texto(identidade.characterId);
                                idPreferido = participantIdDaFicha(estadoOnline.user.uid, ativa.sheetId, (_a = estadoOnline.sala) === null || _a === void 0 ? void 0 : _a.masterUid, characterIdInicial);
                                atualId = texto(sessao.participantId) || estadoOnline.user.uid;
                                participanteAtual = (_c = (_b = estadoOnline.sala) === null || _b === void 0 ? void 0 : _b.participants) === null || _c === void 0 ? void 0 : _c[atualId];
                                if (participanteAtual && texto(participanteAtual.ownerUid) !== texto(estadoOnline.user.uid)) {
                                    return [2 /*return*/, { skipped: true, reason: "participant-owner-mismatch" }];
                                }
                                if (!(participanteAtual && atualId !== idPreferido)) return [3 /*break*/, 2];
                                /* A ficha ativa mudou. Não transformamos a personagem antiga na nova
                                   silenciosamente. Este aparelho deixa de anunciar presença para a
                                   personagem anterior e aguarda o usuário entrar com a ficha escolhida. */
                                return [4 /*yield*/, desvincularPresencaDesteDispositivo(sessao.roomId)];
                            case 1:
                                /* A ficha ativa mudou. Não transformamos a personagem antiga na nova
                                   silenciosamente. Este aparelho deixa de anunciar presença para a
                                   personagem anterior e aguarda o usuário entrar com a ficha escolhida. */
                                _k.sent();
                                return [2 /*return*/, { skipped: true, reason: "participant-id-change-requires-rejoin" }];
                            case 2:
                                resumo = resumoBatalhaDaFicha(ativa);
                                return [4 /*yield*/, resolverVinculoCampanhaDoJogador({
                                        roomId: sessao.roomId, campaignId: texto(sessao.campaignId) || texto((_d = estadoOnline.sala) === null || _d === void 0 ? void 0 : _d.campaignId),
                                        ficha: ativa,
                                        resumo: resumo,
                                        membershipMode: sessao.membershipMode || "session"
                                    })];
                            case 3:
                                vinculo = _k.sent();
                                ativa = vinculo.ficha || ativa;
                                if (!sessaoAindaAtual())
                                    return [2 /*return*/, { skipped: true, reason: "session-ended-during-reconcile" }];
                                characterId = texto(vinculo.characterId) || characterIdInicial;
                                novoId = participantIdDaFicha(estadoOnline.user.uid, ativa.sheetId, (_e = estadoOnline.sala) === null || _e === void 0 ? void 0 : _e.masterUid, characterId);
                                identidadeMudou = atualId !== novoId || texto(sessao.sheetId) !== texto(ativa.sheetId) || texto(sessao.localSheetName) !== texto(ativa.name);
                                faltaParticipante = !((_g = (_f = estadoOnline.sala) === null || _f === void 0 ? void 0 : _f.participants) === null || _g === void 0 ? void 0 : _g[novoId]);
                                if (!identidadeMudou && !faltaParticipante)
                                    return [2 /*return*/, { ok: true, unchanged: true }];
                                return [4 /*yield*/, migrarParticipanteDaSessao({
                                        roomId: sessao.roomId, antigoId: atualId,
                                        novoId: novoId,
                                        ficha: ativa,
                                        resumo: resumo,
                                        characterId: characterId,
                                        campaignId: texto(sessao.campaignId) || texto((_h = estadoOnline.sala) === null || _h === void 0 ? void 0 : _h.campaignId), membershipType: vinculo.membershipType
                                    })];
                            case 4:
                                resultado = _k.sent();
                                if ((resultado === null || resultado === void 0 ? void 0 : resultado.ok) !== true)
                                    return [2 /*return*/, resultado];
                                if (!sessaoAindaAtual())
                                    return [2 /*return*/, { skipped: true, reason: "session-ended-during-reconcile" }];
                                /* roomMemberships é autorização por UID, não estado da ficha. Não altere
                                   esse nó quando a personagem ativa muda/reconcilia. */
                                salvarJson(CHAVE_SESSAO, __assign(__assign({}, sessao), { participantId: novoId, sheetId: ativa.sheetId, localSheetName: ativa.name, characterId: characterId, membershipMode: vinculo.membershipType, campaignId: texto(sessao.campaignId) || texto((_j = estadoOnline.sala) === null || _j === void 0 ? void 0 : _j.campaignId) }));
                                return [2 /*return*/, __assign(__assign({}, resultado), { rebound: true, from: { participantId: atualId, sheetId: sessao.sheetId, name: sessao.localSheetName }, to: { participantId: novoId, sheetId: ativa.sheetId, name: ativa.name } })];
                        }
                    });
                }); })().finally(function () { reconciliacaoFichaSalaEmCurso = null; });
                return [2 /*return*/, reconciliacaoFichaSalaEmCurso];
            });
        });
    }
    function fichaAtivaCompativelComSessao(sessao) {
        var ativa = fichaAtualLocal();
        if (!ativa)
            return { ok: false, reason: "active-sheet-not-found", ficha: null };
        var ok = texto(ativa.sheetId) === texto(sessao === null || sessao === void 0 ? void 0 : sessao.sheetId) && texto(ativa.name) === texto(sessao === null || sessao === void 0 ? void 0 : sessao.localSheetName);
        return { ok: ok, reason: ok ? "" : "active-sheet-session-mismatch", ficha: ativa };
    }
    function atualizarMeuParticipante() {
        return __awaiter(this, void 0, void 0, function () {
            var sessao, ativa, reconciliada, vinculo, ficha, resumo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirUsuario();
                        sessao = lerJson(CHAVE_SESSAO, null);
                        if (!(sessao === null || sessao === void 0 ? void 0 : sessao.roomId) || sessao.role !== "player")
                            return [2 /*return*/, { skipped: true }];
                        ativa = fichaAtivaCompativelComSessao(sessao);
                        if (!!ativa.ok) return [3 /*break*/, 2];
                        return [4 /*yield*/, reconciliarSessaoDaSalaComFichaAtiva()];
                    case 1:
                        reconciliada = _a.sent();
                        if ((reconciliada === null || reconciliada === void 0 ? void 0 : reconciliada.ok) !== true)
                            return [2 /*return*/, { skipped: true, reason: ativa.reason }];
                        return [2 /*return*/, { ok: true, rebound: reconciliada.rebound === true }];
                    case 2:
                        vinculo = validarVinculoFichaDaSessao(sessao);
                        if (!vinculo.ok) {
                            return [2 /*return*/, { skipped: true, reason: "room-bound-to-another-sheet", sheetId: vinculo.sheetSessao, roomSheetId: vinculo.sheetSala }];
                        }
                        ficha = ativa.ficha;
                        resumo = resumoBatalhaDaFicha(ficha);
                        return [4 /*yield*/, estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db, "rooms/".concat(sessao.roomId, "/participants/").concat(texto(sessao.participantId) || estadoOnline.user.uid)), {
                                displayName: resumo.displayName,
                                initiativeBonus: resumo.initiativeBonus,
                                battle: resumo,
                                localSheetName: ficha.name,
                                sheetId: ficha.sheetId,
                                updatedAt: agora()
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, { ok: true }];
                }
            });
        });
    }
    /* Recursos que precisam aparecer imediatamente na mesa durante a batalha.
       O resumo completo (jutsus, ataques, atributos etc.) continua podendo ser
       consolidado no fim do turno; aqui enviamos apenas números leves do HUD. */
    function atualizarMeuParticipanteAoVivo() {
        return __awaiter(this, void 0, void 0, function () {
            var sessao, participantId, ativa, vinculo, ficha, resumo, refParticipante;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        exigirUsuario();
                        sessao = lerJson(CHAVE_SESSAO, null);
                        if (!(sessao === null || sessao === void 0 ? void 0 : sessao.roomId) || sessao.role !== "player")
                            return [2 /*return*/, { skipped: true }];
                        participantId = texto(sessao.participantId) || estadoOnline.user.uid;
                        if (estadoOnline.salaId !== sessao.roomId || !((_b = (_a = estadoOnline.sala) === null || _a === void 0 ? void 0 : _a.participants) === null || _b === void 0 ? void 0 : _b[participantId]))
                            return [2 /*return*/, { skipped: true }];
                        ativa = fichaAtivaCompativelComSessao(sessao);
                        if (!ativa.ok) {
                            /* Nunca publique os números da ficha antiga enquanto uma troca de ficha
                               ainda não foi reconciliada. A própria reconciliação publica o resumo
                               completo da ficha nova quando concluir. */
                            reconciliarSessaoDaSalaComFichaAtiva().catch(function () { });
                            return [2 /*return*/, { skipped: true, reason: ativa.reason }];
                        }
                        vinculo = validarVinculoFichaDaSessao(sessao);
                        if (!vinculo.ok) {
                            return [2 /*return*/, { skipped: true, reason: "room-bound-to-another-sheet", sheetId: vinculo.sheetSessao, roomSheetId: vinculo.sheetSala }];
                        }
                        ficha = ativa.ficha;
                        resumo = resumoBatalhaDaFicha(ficha);
                        refParticipante = estadoOnline.api.ref(estadoOnline.db, "rooms/".concat(sessao.roomId, "/participants/").concat(participantId));
                        return [4 /*yield*/, estadoOnline.api.update(refParticipante, {
                                displayName: resumo.displayName,
                                "battle/pv": resumo.pv,
                                "battle/pvMax": resumo.pvMax,
                                "battle/chakra": resumo.chakra,
                                "battle/chakraMax": resumo.chakraMax,
                                "battle/ca": resumo.ca,
                                "battle/cd": resumo.cd,
                                updatedAt: agora()
                            })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { ok: true }];
                }
            });
        });
    }
    function chaveTurnoAtual(combat) {
        var _a;
        if (combat === void 0) { combat = ((_a = estadoOnline.sala) === null || _a === void 0 ? void 0 : _a.combat) || {}; }
        if (!(combat === null || combat === void 0 ? void 0 : combat.started))
            return "";
        var indice = Math.max(0, Number(combat.turnIndex || 0));
        var ordem = normalizarOrdem();
        var participanteId = texto(ordem[indice]);
        return "".concat(Math.max(1, Number(combat.round || 1)), ":").concat(indice, ":").concat(participanteId);
    }
    function meuParticipanteNaSala() {
        var _a, _b;
        if (!estadoOnline.user || !estadoOnline.sala)
            return null;
        var sessao = lerJson(CHAVE_SESSAO, null);
        var id = texto(sessao === null || sessao === void 0 ? void 0 : sessao.participantId) || estadoOnline.user.uid;
        return ((_b = (_a = estadoOnline.sala) === null || _a === void 0 ? void 0 : _a.participants) === null || _b === void 0 ? void 0 : _b[id]) || null;
    }
    function ehMeuTurno() {
        var _a;
        var sessao = lerJson(CHAVE_SESSAO, null);
        var combat = ((_a = estadoOnline.sala) === null || _a === void 0 ? void 0 : _a.combat) || {};
        if ((sessao === null || sessao === void 0 ? void 0 : sessao.role) !== "player" || !combat.started)
            return false;
        var ordem = normalizarOrdem();
        var atual = ordem[Math.max(0, Number(combat.turnIndex || 0))];
        return Boolean(atual && atual === sessao.participantId);
    }
    function fichaLocalDaSessao(sessao) {
        var referencia = sessao && typeof sessao === "object" ? sessao : {};
        var locais = listarFichasLocais();
        /* O sheetId é a referência local mais específica da sessão. characterId
           existe como ponte para fichas legadas/migradas, nunca nome da ficha. */
        var sheetId = texto(referencia.sheetId);
        if (sheetId) {
            var porFicha = locais.find(function (f) { return texto(f.sheetId) === sheetId; });
            if (porFicha)
                return porFicha;
        }
        var characterId = texto(referencia.characterId);
        if (characterId) {
            return locais.find(function (f) {
                var _a;
                var online = ((_a = f === null || f === void 0 ? void 0 : f.data) === null || _a === void 0 ? void 0 : _a.__online) || {};
                return texto(online.characterId || online.realtimeId) === characterId;
            }) || null;
        }
        return null;
    }
    function resumoMudancasMeuTurno() {
        var sessao = lerJson(CHAVE_SESSAO, null);
        var participante = meuParticipanteNaSala();
        var ficha = fichaLocalDaSessao(sessao);
        if (!ficha)
            return { turnKey: chaveTurnoAtual(), lines: ["Ficha local não encontrada."], changed: false };
        var antes = (participante === null || participante === void 0 ? void 0 : participante.battle) || {};
        var depois = resumoBatalhaDaFicha(ficha);
        var linhas = [];
        var comparar = function (rotulo, chave) {
            var a = antes === null || antes === void 0 ? void 0 : antes[chave], b = depois === null || depois === void 0 ? void 0 : depois[chave];
            if (String(a !== null && a !== void 0 ? a : "") !== String(b !== null && b !== void 0 ? b : ""))
                linhas.push("".concat(rotulo, ": ").concat(a !== null && a !== void 0 ? a : "—", " \u2192 ").concat(b !== null && b !== void 0 ? b : "—"));
        };
        comparar("PV", "pv");
        comparar("Chakra", "chakra");
        comparar("CA", "ca");
        comparar("CD", "cd");
        comparar("Nível", "level");
        comparar("Velocidade", "speed");
        var nomesAtributos = { forca: "FOR", destreza: "DES", constituicao: "CON", inteligencia: "INT", sabedoria: "SAB", carisma: "CAR" };
        Object.entries(nomesAtributos).forEach(function (_a) {
            var _b, _c;
            var _d = __read(_a, 2), chave = _d[0], rotulo = _d[1];
            var a = (_b = antes === null || antes === void 0 ? void 0 : antes.attributes) === null || _b === void 0 ? void 0 : _b[chave], b = (_c = depois === null || depois === void 0 ? void 0 : depois.attributes) === null || _c === void 0 ? void 0 : _c[chave];
            if (String(a !== null && a !== void 0 ? a : "") !== String(b !== null && b !== void 0 ? b : ""))
                linhas.push("".concat(rotulo, ": ").concat(a !== null && a !== void 0 ? a : "—", " \u2192 ").concat(b !== null && b !== void 0 ? b : "—"));
        });
        var qtdAntesJutsus = Array.isArray(antes === null || antes === void 0 ? void 0 : antes.jutsus) ? antes.jutsus.length : 0;
        var qtdDepoisJutsus = Array.isArray(depois === null || depois === void 0 ? void 0 : depois.jutsus) ? depois.jutsus.length : 0;
        if (qtdAntesJutsus !== qtdDepoisJutsus)
            linhas.push("Jutsus: ".concat(qtdAntesJutsus, " \u2192 ").concat(qtdDepoisJutsus));
        var qtdAntesAtaques = Array.isArray(antes === null || antes === void 0 ? void 0 : antes.attacks) ? antes.attacks.length : 0;
        var qtdDepoisAtaques = Array.isArray(depois === null || depois === void 0 ? void 0 : depois.attacks) ? depois.attacks.length : 0;
        if (qtdAntesAtaques !== qtdDepoisAtaques)
            linhas.push("Ataques: ".concat(qtdAntesAtaques, " \u2192 ").concat(qtdDepoisAtaques));
        if (JSON.stringify((antes === null || antes === void 0 ? void 0 : antes.resistances) || []) !== JSON.stringify((depois === null || depois === void 0 ? void 0 : depois.resistances) || []))
            linhas.push("Resistências atualizadas.");
        if (JSON.stringify((antes === null || antes === void 0 ? void 0 : antes.natures) || {}) !== JSON.stringify((depois === null || depois === void 0 ? void 0 : depois.natures) || {}))
            linhas.push("Naturezas atualizadas.");
        var meta = estadoSync()[ficha.sheetId] || {};
        var hashAtual = hashFicha(ficha.data || {});
        var fichaCompletaAlterada = Boolean(!meta.lastHash || meta.lastHash !== hashAtual);
        if (fichaCompletaAlterada && linhas.length === 0)
            linhas.push("Outros dados da ficha foram alterados neste turno.");
        if (!linhas.length)
            linhas.push("Nenhuma alteração pendente neste turno.");
        return {
            turnKey: chaveTurnoAtual(),
            sheetId: ficha.sheetId,
            name: ficha.name,
            lines: linhas.slice(0, 14),
            changed: fichaCompletaAlterada || linhas[0] !== "Nenhuma alteração pendente neste turno.",
            before: antes,
            after: depois
        };
    }
    function finalizarMeuTurno() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var sessao, combat, vinculo, ficha, chave, resultado, _erro_6, meta;
            var _b, _c, _d;
            var _e = _a === void 0 ? {} : _a, _f = _e.permitirForaDoTurno, permitirForaDoTurno = _f === void 0 ? false : _f, _g = _e.marcarPronto, marcarPronto = _g === void 0 ? true : _g, _h = _e.turnKey, turnKey = _h === void 0 ? "" : _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        exigirUsuario();
                        sessao = lerJson(CHAVE_SESSAO, null);
                        if ((sessao === null || sessao === void 0 ? void 0 : sessao.role) !== "player")
                            throw new Error("Somente um jogador pode confirmar o próprio turno.");
                        combat = ((_b = estadoOnline.sala) === null || _b === void 0 ? void 0 : _b.combat) || {};
                        if (!combat.started)
                            throw new Error("O combate ainda não foi iniciado.");
                        if (!permitirForaDoTurno && !ehMeuTurno())
                            throw new Error("Este não é o seu turno agora.");
                        vinculo = validarVinculoFichaDaSessao(sessao);
                        if (!vinculo.ok)
                            throw new Error("Esta sala foi vinculada a outra ficha desta conta. Saia e entre novamente na sala escolhendo a ficha correta.");
                        ficha = fichaLocalDaSessao(sessao);
                        if (!ficha)
                            throw new Error("Ficha local não encontrada.");
                        chave = texto(turnKey) || chaveTurnoAtual(combat);
                        resultado = { skipped: true, revision: 0 };
                        if (!!estadoOnline.user.anonymous) return [3 /*break*/, 4];
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ((_d = (_c = window.EkoRealtimeSync) === null || _c === void 0 ? void 0 : _c.reconciliar) === null || _d === void 0 ? void 0 : _d.call(_c))];
                    case 2:
                        resultado = (_j.sent()) || { skipped: true, revision: 0 };
                        return [3 /*break*/, 4];
                    case 3:
                        _erro_6 = _j.sent();
                        resultado = { queued: true, revision: 0 };
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, atualizarMeuParticipante()];
                    case 5:
                        _j.sent();
                        meta = estadoSync()[ficha.sheetId] || {};
                        if (!marcarPronto) return [3 /*break*/, 7];
                        return [4 /*yield*/, estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db, "rooms/".concat(sessao.roomId, "/participants/").concat(sessao.participantId)), {
                                turnReadyKey: chave,
                                turnReadyAt: agora(),
                                turnReadyRevision: Number(meta.revision || (resultado === null || resultado === void 0 ? void 0 : resultado.revision) || 0)
                            })];
                    case 6:
                        _j.sent();
                        _j.label = 7;
                    case 7:
                        emitir(marcarPronto ? "turno-finalizado" : "turno-sincronizado", {
                            turnKey: chave, sheetId: ficha.sheetId, revision: Number(meta.revision || (resultado === null || resultado === void 0 ? void 0 : resultado.revision) || 0)
                        });
                        return [2 /*return*/, {
                                ok: true, turnKey: chave, revision: Number(meta.revision || (resultado === null || resultado === void 0 ? void 0 : resultado.revision) || 0),
                                anonymous: Boolean(estadoOnline.user.anonymous), ready: Boolean(marcarPronto)
                            }];
                }
            });
        });
    }
    function atualizarParticipante(participantId, alteracoes) {
        return __awaiter(this, void 0, void 0, function () {
            var permitidas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirMestre();
                        permitidas = {};
                        ["displayName", "initiative", "initiativeBonus"].forEach(function (k) { if ((alteracoes === null || alteracoes === void 0 ? void 0 : alteracoes[k]) !== undefined)
                            permitidas[k] = alteracoes[k]; });
                        if ((alteracoes === null || alteracoes === void 0 ? void 0 : alteracoes.battle) && typeof alteracoes.battle === "object")
                            permitidas.battle = alteracoes.battle;
                        permitidas.updatedAt = agora();
                        return [4 /*yield*/, estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/participants/").concat(participantId)), permitidas)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function removerParticipante(participantId) {
        return __awaiter(this, void 0, void 0, function () {
            var api, updates, efeitos, ordem;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        exigirMestre();
                        api = estadoOnline.api;
                        updates = {};
                        updates["rooms/".concat(estadoOnline.salaId, "/participants/").concat(participantId)] = null;
                        efeitos = ((_a = estadoOnline.sala) === null || _a === void 0 ? void 0 : _a.effects) || {};
                        Object.entries(efeitos).forEach(function (_a) {
                            var _b = __read(_a, 2), id = _b[0], e = _b[1];
                            if (e.participantId === participantId)
                                updates["rooms/".concat(estadoOnline.salaId, "/effects/").concat(id)] = null;
                        });
                        ordem = normalizarOrdem().filter(function (id) { return id !== participantId; });
                        updates["rooms/".concat(estadoOnline.salaId, "/combat/order")] = ordem;
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db), updates)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function participantes() { var _a; return normalizarParticipantesSala(((_a = estadoOnline.sala) === null || _a === void 0 ? void 0 : _a.participants) || {}); }
    function normalizarOrdem() {
        var _a, _b;
        var raw = ((_b = (_a = estadoOnline.sala) === null || _a === void 0 ? void 0 : _a.combat) === null || _b === void 0 ? void 0 : _b.order) || [];
        var lista = Array.isArray(raw) ? raw : Object.keys(raw || {}).sort(function (a, b) { return Number(a) - Number(b); }).map(function (k) { return raw[k]; });
        var mapa = participantes(), saida = [];
        lista.forEach(function (valor) {
            var id = texto(valor);
            if (id && mapa[id] && !saida.includes(id))
                saida.push(id);
        });
        return saida;
    }
    function definirIniciativa(participantId, valor) {
        return __awaiter(this, void 0, void 0, function () {
            var numero;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirMestre();
                        numero = Number(valor);
                        return [4 /*yield*/, estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/participants/").concat(participantId)), {
                                initiative: Number.isFinite(numero) ? numero : null, updatedAt: agora()
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function ordenarIniciativa() {
        return __awaiter(this, void 0, void 0, function () {
            var ordem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirMestre();
                        ordem = Object.entries(participantes()).sort(function (_a, _b) {
                            var _c = __read(_a, 2), a = _c[1];
                            var _d = __read(_b, 2), b = _d[1];
                            var ia = Number.isFinite(Number(a.initiative)) ? Number(a.initiative) : -999;
                            var ib = Number.isFinite(Number(b.initiative)) ? Number(b.initiative) : -999;
                            if (ib !== ia)
                                return ib - ia;
                            return Number(b.initiativeBonus || 0) - Number(a.initiativeBonus || 0);
                        }).map(function (_a) {
                            var _b = __read(_a, 1), participantId = _b[0];
                            return texto(participantId);
                        }).filter(Boolean);
                        return [4 /*yield*/, estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/combat")), { order: ordem, turnIndex: 0, round: 1 })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, ordem];
                }
            });
        });
    }
    function iniciarCombate() {
        return __awaiter(this, void 0, void 0, function () {
            var ordem;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        exigirMestre();
                        ordem = normalizarOrdem();
                        if (!!ordem.length) return [3 /*break*/, 2];
                        return [4 /*yield*/, ordenarIniciativa()];
                    case 1:
                        ordem = _c.sent();
                        _c.label = 2;
                    case 2:
                        if (!ordem.length)
                            throw new Error("Adicione participantes antes de iniciar o combate.");
                        return [4 /*yield*/, estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/combat")), {
                                started: true, round: Math.max(1, Number(((_b = (_a = estadoOnline.sala) === null || _a === void 0 ? void 0 : _a.combat) === null || _b === void 0 ? void 0 : _b.round) || 1)), turnIndex: 0, order: ordem, startedAt: agora()
                            })];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, registrarEvento("COMBATE_INICIADO", { round: 1 })];
                    case 4:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function alterarTurno(direcao) {
        return __awaiter(this, void 0, void 0, function () {
            var api, refCombat, resultado, combat;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirMestre();
                        api = estadoOnline.api;
                        refCombat = api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/combat"));
                        return [4 /*yield*/, api.runTransaction(refCombat, function (combat) {
                                if (!combat || !combat.started)
                                    return;
                                var bruto = Array.isArray(combat.order) ? combat.order : Object.values(combat.order || {});
                                var ordem = [];
                                bruto.forEach(function (valor) { var id = texto(valor); if (id && !ordem.includes(id))
                                    ordem.push(id); });
                                if (!ordem.length)
                                    return;
                                var indice = Number(combat.turnIndex || 0), round = Math.max(1, Number(combat.round || 1));
                                if (!Number.isInteger(indice) || indice < 0 || indice >= ordem.length)
                                    indice = 0;
                                if (direcao > 0) {
                                    indice += 1;
                                    if (indice >= ordem.length) {
                                        indice = 0;
                                        round += 1;
                                    }
                                }
                                else {
                                    indice -= 1;
                                    if (indice < 0) {
                                        indice = ordem.length - 1;
                                        round = Math.max(1, round - 1);
                                    }
                                }
                                return __assign(__assign({}, combat), { order: ordem, turnIndex: indice, round: round, updatedAt: agora() });
                            })];
                    case 1:
                        resultado = _a.sent();
                        if (!resultado.committed)
                            throw new Error("O combate ainda não foi iniciado.");
                        combat = resultado.snapshot.val();
                        return [4 /*yield*/, registrarEvento(direcao > 0 ? "TURNO_AVANCADO" : "TURNO_RECUADO", { round: combat.round, turnIndex: combat.turnIndex })];
                    case 2:
                        _a.sent();
                        if (!(direcao > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, atualizarEfeitosDaSala(combat.round, combat.turnIndex)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, combat];
                }
            });
        });
    }
    var avancarTurno = function () { return alterarTurno(1); };
    var voltarTurno = function () { return alterarTurno(-1); };
    function analisarDuracaoRodadas(valor) {
        var original = texto(valor);
        var normal = original.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        if (!normal || /instant|ate ser encerr|manual|concentr/.test(normal))
            return null;
        var dado = normal.match(/(\d+)\s*d\s*(\d+)(?:\s*([+-])\s*(\d+))?/);
        if (dado) {
            var qtd = Math.max(1, Number(dado[1])), faces = Math.max(1, Number(dado[2]));
            var total = 0;
            for (var i = 0; i < qtd; i += 1)
                total += 1 + Math.floor(Math.random() * faces);
            var ajuste = Number(dado[4] || 0) * (dado[3] === "-" ? -1 : 1);
            total = Math.max(1, total + ajuste);
            if (/minut/.test(normal))
                total = Math.ceil(total * 10);
            else if (/segund/.test(normal) && !/turn|rodad/.test(normal))
                total = Math.ceil(total / 6);
            return { rounds: Math.max(1, total), rolled: true, original: original };
        }
        var obterNumero = function (regex) {
            var achado = normal.match(regex);
            if (!achado)
                return NaN;
            return Number(String(achado[1]).replace(",", "."));
        };
        /* Quando a descrição traz as duas formas — por exemplo
           "5 turnos (30 segundos)" — a quantidade de turnos/rodadas prevalece. */
        var numero = obterNumero(/(\d+(?:[.,]\d+)?)\s*(?:turnos?|rodadas?)/);
        if (Number.isFinite(numero) && numero > 0)
            return { rounds: Math.max(1, Math.ceil(numero)), original: original };
        numero = obterNumero(/(\d+(?:[.,]\d+)?)\s*minutos?/);
        if (Number.isFinite(numero) && numero > 0)
            return { rounds: Math.max(1, Math.ceil(numero * 10)), original: original };
        numero = obterNumero(/(\d+(?:[.,]\d+)?)\s*segundos?/);
        if (Number.isFinite(numero) && numero > 0)
            return { rounds: Math.max(1, Math.ceil(numero / 6)), original: original };
        return null;
    }
    function normalizarDetalhesEfeito(valor) {
        var lista = Array.isArray(valor) ? valor : [];
        return lista.slice(0, 16).map(function (item, indice) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            var bruto = item && typeof item === "object" ? item : {};
            var valorMecanico = typeof bruto.value === "number" || typeof bruto.valor === "number"
                ? Number((_a = bruto.value) !== null && _a !== void 0 ? _a : bruto.valor)
                : texto((_b = bruto.value) !== null && _b !== void 0 ? _b : bruto.valor).slice(0, 80);
            return {
                id: texto(bruto.id || "mecanica-".concat(indice + 1)).slice(0, 80),
                polarity: texto((_d = (_c = bruto.polarity) !== null && _c !== void 0 ? _c : bruto.polaridade) !== null && _d !== void 0 ? _d : "neutro").slice(0, 24),
                appliesTo: texto((_f = (_e = bruto.appliesTo) !== null && _e !== void 0 ? _e : bruto.aplicaEm) !== null && _f !== void 0 ? _f : "usuario").slice(0, 40),
                target: texto((_h = (_g = bruto.target) !== null && _g !== void 0 ? _g : bruto.alvo) !== null && _h !== void 0 ? _h : "efeito").slice(0, 60),
                operation: texto((_k = (_j = bruto.operation) !== null && _j !== void 0 ? _j : bruto.operacao) !== null && _k !== void 0 ? _k : "").slice(0, 30),
                value: valorMecanico,
                text: texto((_m = (_l = bruto.text) !== null && _l !== void 0 ? _l : bruto.texto) !== null && _m !== void 0 ? _m : "").slice(0, 220)
            };
        });
    }
    function chaveDeduplicacaoEfeito(efeito) {
        var local = texto(efeito === null || efeito === void 0 ? void 0 : efeito.localEffectId);
        if (local)
            return "".concat(texto(efeito === null || efeito === void 0 ? void 0 : efeito.participantId), "|").concat(texto(efeito === null || efeito === void 0 ? void 0 : efeito.ownerUid), "|local:").concat(local);
        return "".concat(texto(efeito === null || efeito === void 0 ? void 0 : efeito.participantId), "|").concat(texto(efeito === null || efeito === void 0 ? void 0 : efeito.ownerUid), "|").concat(texto(efeito === null || efeito === void 0 ? void 0 : efeito.source), "|").concat(texto(efeito === null || efeito === void 0 ? void 0 : efeito.name).toLowerCase());
    }
    function deduplicarEfeitosDaSala() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var api, snap, efeitos, ehMestre_1, grupos_1, updates_1;
            var _b = _a === void 0 ? {} : _a, _c = _b.forcar, forcar = _c === void 0 ? false : _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!estadoOnline.salaId || !estadoOnline.user || estadoOnline.deduplicandoEfeitos)
                            return [2 /*return*/, { skipped: true }];
                        if (!forcar && agora() - Number(estadoOnline.lastDedupAt || 0) < 1200)
                            return [2 /*return*/, { skipped: true }];
                        estadoOnline.deduplicandoEfeitos = true;
                        estadoOnline.lastDedupAt = agora();
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, , 5, 6]);
                        api = estadoOnline.api;
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/effects")))];
                    case 2:
                        snap = _d.sent();
                        efeitos = snap.val() || {};
                        ehMestre_1 = sessaoEhMestre();
                        grupos_1 = new Map();
                        Object.entries(efeitos).forEach(function (_a) {
                            var _b = __read(_a, 2), id = _b[0], efeito = _b[1];
                            if (!efeito || efeito.status !== "active")
                                return;
                            if (!ehMestre_1 && efeito.ownerUid !== estadoOnline.user.uid)
                                return;
                            var chave = chaveDeduplicacaoEfeito(efeito);
                            var lista = grupos_1.get(chave) || [];
                            lista.push({ id: id, efeito: efeito });
                            grupos_1.set(chave, lista);
                        });
                        updates_1 = {};
                        grupos_1.forEach(function (lista) {
                            if (lista.length < 2)
                                return;
                            lista.sort(function (a, b) { return Number(b.efeito.createdAt || 0) - Number(a.efeito.createdAt || 0); });
                            lista.slice(1).forEach(function (_a) {
                                var id = _a.id;
                                updates_1["rooms/".concat(estadoOnline.salaId, "/effects/").concat(id, "/status")] = "ended";
                                updates_1["rooms/".concat(estadoOnline.salaId, "/effects/").concat(id, "/endedAt")] = agora();
                                updates_1["rooms/".concat(estadoOnline.salaId, "/effects/").concat(id, "/endedReason")] = "duplicate-repair";
                            });
                        });
                        if (!Object.keys(updates_1).length) return [3 /*break*/, 4];
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db), updates_1)];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4: return [2 /*return*/, { ok: true, removed: Object.keys(updates_1).filter(function (k) { return k.endsWith('/status'); }).length }];
                    case 5:
                        estadoOnline.deduplicandoEfeitos = false;
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    function adicionarEfeito(_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var participante, ehMestre, regra, combat, round, ordem, turnIndex, localId, ativacao, id, refEfeito, existenteSnap, detalhes, efeito;
            var _c;
            var participantId = _b.participantId, name = _b.name, duration = _b.duration, _d = _b.source, source = _d === void 0 ? "manual" : _d, ownerUid = _b.ownerUid, _e = _b.summary, summary = _e === void 0 ? "" : _e, _f = _b.details, details = _f === void 0 ? [] : _f, _g = _b.localEffectId, localEffectId = _g === void 0 ? "" : _g, _h = _b.activationKey, activationKey = _h === void 0 ? "" : _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        exigirUsuario();
                        participante = participantes()[participantId];
                        if (!participante)
                            throw new Error("Participante não encontrado.");
                        ehMestre = sessaoEhMestre();
                        if (!ehMestre && participante.ownerUid !== estadoOnline.user.uid)
                            throw new Error("Você só pode publicar efeitos da sua própria ficha.");
                        regra = typeof duration === "number" ? { rounds: duration, original: "".concat(duration, " rodadas") } : analisarDuracaoRodadas(duration);
                        if (!regra)
                            return [2 /*return*/, null];
                        combat = ((_c = estadoOnline.sala) === null || _c === void 0 ? void 0 : _c.combat) || {};
                        round = Math.max(1, Number(combat.round || 1));
                        ordem = normalizarOrdem();
                        turnIndex = combat.started && ordem.length
                            ? Math.min(Math.max(0, Number(combat.turnIndex || 0)), ordem.length - 1)
                            : 0;
                        localId = texto(localEffectId).slice(0, 160);
                        ativacao = texto(activationKey).slice(0, 80);
                        id = localId && ativacao
                            ? "effect_".concat(hashLeve("".concat(estadoOnline.salaId, "|").concat(participantId, "|").concat(localId, "|").concat(ativacao)))
                            : idAleatorio("effect");
                        refEfeito = estadoOnline.api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/effects/").concat(id));
                        return [4 /*yield*/, estadoOnline.api.get(refEfeito)];
                    case 1:
                        existenteSnap = _j.sent();
                        if (existenteSnap.exists())
                            return [2 /*return*/, __assign({ id: id }, existenteSnap.val())];
                        detalhes = normalizarDetalhesEfeito(details);
                        efeito = {
                            id: id,
                            participantId: participantId,
                            ownerUid: ownerUid || participante.ownerUid || estadoOnline.user.uid,
                            name: (texto(name) || "Efeito").slice(0, 120), source: texto(source).slice(0, 140),
                            summary: texto(summary).slice(0, 500), details: detalhes,
                            localEffectId: localId, activationKey: ativacao,
                            durationOriginal: regra.original, totalRounds: regra.rounds,
                            startRound: round, startTurnIndex: turnIndex,
                            expiresAtRound: round + regra.rounds, expiresAtTurnIndex: turnIndex,
                            status: "active", createdAt: agora()
                        };
                        return [4 /*yield*/, estadoOnline.api.set(refEfeito, efeito)];
                    case 2:
                        _j.sent();
                        deduplicarEfeitosDaSala().catch(function () { });
                        return [2 /*return*/, efeito];
                }
            });
        });
    }
    function encerrarEfeito(effectId) {
        return __awaiter(this, void 0, void 0, function () {
            var refEfeito, efeito, remoto, ehMestre;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        exigirUsuario();
                        refEfeito = estadoOnline.api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/effects/").concat(effectId));
                        efeito = (_b = (_a = estadoOnline.sala) === null || _a === void 0 ? void 0 : _a.effects) === null || _b === void 0 ? void 0 : _b[effectId];
                        if (!!efeito) return [3 /*break*/, 2];
                        return [4 /*yield*/, estadoOnline.api.get(refEfeito)];
                    case 1:
                        remoto = _c.sent();
                        efeito = remoto.val();
                        _c.label = 2;
                    case 2:
                        if (!efeito)
                            return [2 /*return*/];
                        ehMestre = sessaoEhMestre();
                        if (!ehMestre && efeito.ownerUid !== estadoOnline.user.uid)
                            throw new Error("Você não pode encerrar este efeito.");
                        return [4 /*yield*/, estadoOnline.api.update(refEfeito, { status: "ended", endedAt: agora() })];
                    case 3:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function atualizarEfeitosDaSala(round_1) {
        return __awaiter(this, arguments, void 0, function (round, turnIndex) {
            var api, updates, snapshotEfeitos, efeitos, rodadaAtual, indiceAtual;
            if (turnIndex === void 0) { turnIndex = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirMestre();
                        api = estadoOnline.api, updates = {};
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/effects")))];
                    case 1:
                        snapshotEfeitos = _a.sent();
                        efeitos = snapshotEfeitos.val() || {};
                        rodadaAtual = Math.max(1, Number(round || 1));
                        indiceAtual = Math.max(0, Number(turnIndex || 0));
                        Object.entries(efeitos).forEach(function (_a) {
                            var _b, _c;
                            var _d = __read(_a, 2), id = _d[0], e = _d[1];
                            var rodadaFim = Math.max(1, Number(e.expiresAtRound || 1));
                            var indiceFim = Math.max(0, Number((_c = (_b = e.expiresAtTurnIndex) !== null && _b !== void 0 ? _b : e.startTurnIndex) !== null && _c !== void 0 ? _c : 0));
                            var chegouAoFim = rodadaAtual > rodadaFim || (rodadaAtual === rodadaFim && indiceAtual >= indiceFim);
                            if (e.status === "active" && chegouAoFim) {
                                updates["rooms/".concat(estadoOnline.salaId, "/effects/").concat(id, "/status")] = "expired";
                                updates["rooms/".concat(estadoOnline.salaId, "/effects/").concat(id, "/endedAt")] = agora();
                                updates["rooms/".concat(estadoOnline.salaId, "/effects/").concat(id, "/endedAtRound")] = rodadaAtual;
                                updates["rooms/".concat(estadoOnline.salaId, "/effects/").concat(id, "/endedAtTurnIndex")] = indiceAtual;
                            }
                        });
                        if (!Object.keys(updates).length) return [3 /*break*/, 3];
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db), updates)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    function registrarEvento(type_1) {
        return __awaiter(this, arguments, void 0, function (type, payload) {
            var api, refEvento;
            if (payload === void 0) { payload = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!estadoOnline.salaId || !estadoOnline.user)
                            return [2 /*return*/, null];
                        api = estadoOnline.api, refEvento = api.push(api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/events")));
                        return [4 /*yield*/, api.set(refEvento, { id: refEvento.key, type: type, payload: payload, createdBy: estadoOnline.user.uid, createdAt: agora() })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, refEvento.key];
                }
            });
        });
    }
    function parseXpAtual(valor) {
        var str = texto(valor);
        var partes = str.match(/-?\d+/g) || [];
        return { current: Math.max(0, Number(partes[0] || 0)), max: Math.max(0, Number(partes[1] || 355000)) };
    }
    function formatarXp(current, max) { return "".concat(Math.max(0, Math.trunc(current)), "/").concat(Math.max(0, Math.trunc(max || 355000))); }
    function referenciaFichaDoParticipante(p) {
        var _a, _b;
        return {
            characterId: texto(p === null || p === void 0 ? void 0 : p.characterId),
            sheetId: texto((p === null || p === void 0 ? void 0 : p.sheetId) || ((_a = p === null || p === void 0 ? void 0 : p.battle) === null || _a === void 0 ? void 0 : _a.sourceSheetId) || (p === null || p === void 0 ? void 0 : p.sourceSheetId)),
            /* Mantido apenas para exibição/compatibilidade de payload. Nunca é usado
               para localizar a ficha que receberá XP ou nível. */
            localSheetName: texto((p === null || p === void 0 ? void 0 : p.localSheetName) || ((_b = p === null || p === void 0 ? void 0 : p.battle) === null || _b === void 0 ? void 0 : _b.sourceSheetName) || (p === null || p === void 0 ? void 0 : p.sourceSheetName))
        };
    }
    function tipoXpCampanha(valor) {
        var t = texto(valor).toLowerCase();
        return ["grant", "remove", "correction"].includes(t) ? t : "grant";
    }
    function valorXpPorTipo(amount, type) {
        var bruto = Math.trunc(Number(amount));
        if (!Number.isSafeInteger(bruto) || bruto === 0)
            throw new Error("Informe uma quantidade inteira de XP diferente de zero.");
        if (Math.abs(bruto) > 1000000)
            throw new Error("A alteração máxima por operação é de 1.000.000 de XP.");
        var tipo = tipoXpCampanha(type);
        if (tipo === "grant")
            return Math.abs(bruto);
        if (tipo === "remove")
            return -Math.abs(bruto);
        return bruto;
    }
    function membrosAtivosDaCampanha(campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var id, api, snap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = texto(campaignId);
                        if (estadoOnline.membrosCampanhaId === id && estadoOnline.membrosCampanha.length)
                            return [2 /*return*/, estadoOnline.membrosCampanha.filter(function (m) { return (m === null || m === void 0 ? void 0 : m.status) !== "inactive"; })];
                        api = estadoOnline.api;
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "campaignMembers/".concat(id)))];
                    case 1:
                        snap = _a.sent();
                        return [2 /*return*/, normalizarMembrosCampanha(snap.val() || {}, id).filter(function (m) { return (m === null || m === void 0 ? void 0 : m.status) !== "inactive"; })];
                }
            });
        });
    }
    function montarLancamentosXpPermanentes() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var idCampanha, campanha, tipo, valor, motivo, salaId, membros, mapa, chaves, api, updates, lancamentos, chaves_1, chaves_1_1, chave, membro, ref, criadoEm, registro, sheetId;
            var e_2, _b;
            var _c = _a === void 0 ? {} : _a, campaignId = _c.campaignId, targets = _c.targets, amount = _c.amount, _d = _c.reason, reason = _d === void 0 ? "" : _d, _e = _c.type, type = _e === void 0 ? "grant" : _e, _f = _c.sessionId, sessionId = _f === void 0 ? "" : _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        exigirContaGoogle();
                        idCampanha = texto(campaignId), campanha = estadoOnline.campanhas.find(function (item) { return item.id === idCampanha; });
                        if (!idCampanha || !campanha || campanha.masterUid !== estadoOnline.user.uid)
                            throw new Error("Campanha não encontrada.");
                        tipo = tipoXpCampanha(type), valor = valorXpPorTipo(amount, tipo), motivo = texto(reason).slice(0, 160), salaId = texto(sessionId);
                        return [4 /*yield*/, membrosAtivosDaCampanha(idCampanha)];
                    case 1:
                        membros = _g.sent();
                        mapa = new Map(membros.map(function (m) { return ["".concat(texto(m.userId), "::").concat(texto(m.characterId)), m]; }));
                        chaves = Array.from(new Set((targets || []).map(function (alvo) {
                            if (alvo && typeof alvo === "object")
                                return "".concat(texto(alvo.userId), "::").concat(texto(alvo.characterId));
                            return texto(alvo);
                        }).filter(Boolean)));
                        if (!chaves.length)
                            throw new Error("Selecione ao menos um personagem da campanha.");
                        api = estadoOnline.api, updates = {}, lancamentos = [];
                        try {
                            for (chaves_1 = __values(chaves), chaves_1_1 = chaves_1.next(); !chaves_1_1.done; chaves_1_1 = chaves_1.next()) {
                                chave = chaves_1_1.value;
                                membro = mapa.get(chave);
                                if (!membro)
                                    throw new Error("Um dos personagens selecionados não pertence mais a esta campanha.");
                                ref = api.push(api.ref(estadoOnline.db, "xpLedger/".concat(idCampanha)));
                                criadoEm = agora();
                                registro = {
                                    id: ref.key, campaignId: idCampanha, userId: texto(membro.userId), characterId: texto(membro.characterId),
                                    displayName: texto(membro.displayName).slice(0, 120) || "Personagem", amount: valor, reason: motivo, type: tipo,
                                    createdAt: criadoEm, createdBy: estadoOnline.user.uid
                                };
                                sheetId = texto(membro.legacySheetId);
                                if (sheetId)
                                    registro.sourceSheetId = sheetId;
                                if (salaId)
                                    registro.sessionId = salaId;
                                updates["xpLedger/".concat(idCampanha, "/").concat(ref.key)] = registro;
                                updates["xpInbox/".concat(registro.userId, "/").concat(registro.characterId, "/").concat(ref.key)] = registro;
                                lancamentos.push(registro);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (chaves_1_1 && !chaves_1_1.done && (_b = chaves_1.return)) _b.call(chaves_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        return [2 /*return*/, { updates: updates, lancamentos: lancamentos, amount: valor, type: tipo }];
                }
            });
        });
    }
    function diagnosticarMembroCampanhaLocal(membro) {
        var _a;
        var uid = texto((_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid);
        if (!uid || !membro || texto(membro.userId) !== uid) {
            return { status: "remote", owned: false, linked: false, member: membro || null };
        }
        var characterId = texto(membro.characterId), sheetId = texto(membro.legacySheetId || membro.sheetId || membro.sourceSheetId);
        var locais = listarFichasLocais().map(function (ficha) { return ({ ficha: ficha, aliases: aliasesIdentidadeFichaXp(ficha) }); }).filter(function (_a) {
            var aliases = _a.aliases;
            return !aliases.ownerUid || aliases.ownerUid === uid;
        });
        /* v2.5.8.147 — identidade ATUAL tem precedência sobre aliases históricos.
           Fichas que nasceram durante a colisão 136–140 podem compartilhar
           sourceSheetId/sourceCharacterId com a ficha de origem. Esses campos são
           úteis para recuperação, mas não provam que o vínculo permanente ainda
           aponta para aquela ficha. */
        var porCharacterAtual = characterId ? locais.filter(function (_a) {
            var aliases = _a.aliases;
            return aliases.currentCharacterIds.has(characterId);
        }) : [];
        var porSheetAtual = sheetId ? locais.filter(function (_a) {
            var aliases = _a.aliases;
            return aliases.currentSheetIds.has(sheetId);
        }) : [];
        if (porCharacterAtual.length > 1 || porSheetAtual.length > 1) {
            return { status: "ambiguous", owned: true, linked: false, member: membro, characterId: characterId, sheetId: sheetId };
        }
        var fichaCharacter = porCharacterAtual.length === 1 ? porCharacterAtual[0].ficha : null;
        var fichaSheet = porSheetAtual.length === 1 ? porSheetAtual[0].ficha : null;
        if (fichaCharacter && fichaSheet && fichaCharacter.key !== fichaSheet.key) {
            return { status: "ambiguous", owned: true, linked: false, member: membro, characterId: characterId, sheetId: sheetId };
        }
        var fichaAtual = fichaCharacter || fichaSheet || null;
        if (fichaAtual) {
            return {
                status: "linked", owned: true, linked: true, member: membro,
                characterId: characterId,
                sheetId: sheetId,
                localSheetName: fichaAtual.name, localSheetId: fichaAtual.sheetId, characterName: fichaAtual.characterName,
                active: fichaAtual.name === fichaAtivaNomeSeguro(), basis: fichaCharacter ? "characterId" : "sheetId"
            };
        }
        var historicosCharacter = characterId ? locais.filter(function (_a) {
            var aliases = _a.aliases;
            return aliases.historicalCharacterIds.has(characterId);
        }) : [];
        var historicosSheet = sheetId ? locais.filter(function (_a) {
            var aliases = _a.aliases;
            return aliases.historicalSheetIds.has(sheetId);
        }) : [];
        var historicos = new Map();
        __spreadArray(__spreadArray([], __read(historicosCharacter), false), __read(historicosSheet), false).forEach(function (item) { return historicos.set(item.ficha.key, item.ficha); });
        var ativa = fichaAtualLocal();
        return {
            status: historicos.size > 1 ? "ambiguous" : "stale", owned: true, linked: false, member: membro,
            characterId: characterId,
            sheetId: sheetId,
            historicalMatches: historicos.size,
            activeSheetName: (ativa === null || ativa === void 0 ? void 0 : ativa.name) || "", activeSheetId: (ativa === null || ativa === void 0 ? void 0 : ativa.sheetId) || "", activeCharacterName: (ativa === null || ativa === void 0 ? void 0 : ativa.characterName) || ""
        };
    }
    function removerMembroCampanha() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var idCampanha, uid, idPersonagem, campanha, api, refMembro, snap, membro, instante;
            var _b = _a === void 0 ? {} : _a, campaignId = _b.campaignId, userId = _b.userId, characterId = _b.characterId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        exigirContaGoogle();
                        idCampanha = texto(campaignId), uid = texto(userId), idPersonagem = texto(characterId);
                        campanha = estadoOnline.campanhas.find(function (item) { return item.id === idCampanha; });
                        if (!idCampanha || !campanha || texto(campanha.masterUid) !== texto(estadoOnline.user.uid))
                            throw new Error("Campanha não encontrada.");
                        if (!uid || !idPersonagem)
                            throw new Error("Jogador da campanha não encontrado.");
                        api = estadoOnline.api, refMembro = api.ref(estadoOnline.db, "campaignMembers/".concat(idCampanha, "/").concat(uid, "/").concat(idPersonagem));
                        return [4 /*yield*/, api.get(refMembro)];
                    case 1:
                        snap = _c.sent();
                        membro = snap.exists() ? snap.val() : null;
                        if (!membro)
                            throw new Error("Este personagem não pertence mais à campanha.");
                        if (membro.status === "inactive")
                            return [2 /*return*/, { ok: true, alreadyInactive: true, displayName: texto(membro.displayName) || "Personagem" }];
                        instante = agora();
                        return [4 /*yield*/, api.update(refMembro, {
                                status: "inactive", updatedAt: instante, removedAt: instante, removedBy: estadoOnline.user.uid
                            })];
                    case 2:
                        _c.sent();
                        /* XP já registrado continua no histórico e qualquer entrega ainda pendente
                           fica congelada enquanto o membro estiver inativo. Nada é apagado. */
                        return [2 /*return*/, { ok: true, displayName: texto(membro.displayName) || "Personagem", pendingPaused: true }];
                }
            });
        });
    }
    function reativarMembroCampanha() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var idCampanha, uid, idPersonagem, campanha, api, refMembro, snap, membro, instante;
            var _b = _a === void 0 ? {} : _a, campaignId = _b.campaignId, userId = _b.userId, characterId = _b.characterId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        exigirContaGoogle();
                        idCampanha = texto(campaignId), uid = texto(userId), idPersonagem = texto(characterId);
                        campanha = estadoOnline.campanhas.find(function (item) { return item.id === idCampanha; });
                        if (!idCampanha || !campanha || texto(campanha.masterUid) !== texto(estadoOnline.user.uid))
                            throw new Error("Campanha não encontrada.");
                        if (!uid || !idPersonagem)
                            throw new Error("Jogador da campanha não encontrado.");
                        api = estadoOnline.api, refMembro = api.ref(estadoOnline.db, "campaignMembers/".concat(idCampanha, "/").concat(uid, "/").concat(idPersonagem));
                        return [4 /*yield*/, api.get(refMembro)];
                    case 1:
                        snap = _c.sent();
                        membro = snap.exists() ? snap.val() : null;
                        if (!membro)
                            throw new Error("O vínculo arquivado deste personagem não foi encontrado.");
                        if (membro.status !== "inactive")
                            return [2 /*return*/, { ok: true, alreadyActive: true, displayName: texto(membro.displayName) || "Personagem" }];
                        if (texto(membro.replacedByCharacterId))
                            throw new Error("Este vínculo antigo foi substituído por outra identidade do mesmo personagem e não pode ser reativado. Use o vínculo atual da campanha.");
                        instante = agora();
                        return [4 /*yield*/, api.update(refMembro, {
                                status: "active", updatedAt: instante, reactivatedAt: instante, reactivatedBy: estadoOnline.user.uid
                            })];
                    case 2:
                        _c.sent();
                        setTimeout(function () { return processarXpCampanhaPendente().catch(function () { }); }, 120);
                        return [2 /*return*/, { ok: true, displayName: texto(membro.displayName) || "Personagem" }];
                }
            });
        });
    }
    function reassociarMembroCampanhaComFichaAtual() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var idCampanha, uid, antigoCharacterId, campanha, ficha, novoCharacterId, novoSheetId, api, refAntigo, snapAntigo, antigo, resumo, instante, novoMembro, refNovo, inboxSnap, pendentes, migrados, concluidos, _b, _c, _d, ledgerId, item, ackAntigo, ackSnap, redirecionado, e_3_1;
            var e_3, _e;
            var _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            var _r = _a === void 0 ? {} : _a, campaignId = _r.campaignId, userId = _r.userId, characterId = _r.characterId;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        exigirContaGoogle();
                        idCampanha = texto(campaignId), uid = texto(userId), antigoCharacterId = texto(characterId);
                        campanha = estadoOnline.campanhas.find(function (item) { return item.id === idCampanha; });
                        if (!idCampanha || !campanha || texto(campanha.masterUid) !== texto(estadoOnline.user.uid))
                            throw new Error("Campanha não encontrada.");
                        if (!uid || uid !== texto(estadoOnline.user.uid))
                            throw new Error("A reassociação automática só pode usar uma ficha pertencente à Conta Google atualmente conectada.");
                        if (!antigoCharacterId)
                            throw new Error("O vínculo antigo do personagem não foi encontrado.");
                        ficha = fichaAtualLocal();
                        if (!ficha)
                            throw new Error("Abra primeiro a ficha correta que deve receber o XP.");
                        ficha = garantirIdentidadeFichaRealtime(ficha.name) || ficha;
                        novoCharacterId = texto(ficha.characterId) || texto((_g = (_f = ficha.data) === null || _f === void 0 ? void 0 : _f.__online) === null || _g === void 0 ? void 0 : _g.characterId) || texto((_j = (_h = ficha.data) === null || _h === void 0 ? void 0 : _h.__online) === null || _j === void 0 ? void 0 : _j.realtimeId);
                        novoSheetId = texto(ficha.sheetId) || texto((_l = (_k = ficha.data) === null || _k === void 0 ? void 0 : _k.__online) === null || _l === void 0 ? void 0 : _l.sheetId);
                        if (!novoCharacterId || !novoSheetId)
                            throw new Error("Não foi possível estabelecer a identidade da ficha aberta.");
                        api = estadoOnline.api;
                        refAntigo = api.ref(estadoOnline.db, "campaignMembers/".concat(idCampanha, "/").concat(uid, "/").concat(antigoCharacterId));
                        return [4 /*yield*/, api.get(refAntigo)];
                    case 1:
                        snapAntigo = _s.sent();
                        antigo = snapAntigo.exists() ? snapAntigo.val() : null;
                        if (!antigo || antigo.status === "inactive")
                            throw new Error("O vínculo antigo não está mais ativo nesta campanha.");
                        resumo = resumoBatalhaDaFicha(ficha);
                        instante = agora();
                        novoMembro = __assign(__assign({}, antigo), { campaignId: idCampanha, userId: uid, characterId: novoCharacterId, displayName: texto(resumo === null || resumo === void 0 ? void 0 : resumo.displayName) || texto(ficha.characterName) || texto(antigo.displayName) || "Personagem", legacySheetId: novoSheetId, status: "active", lastSeenAt: instante, updatedAt: instante, reboundFromCharacterId: antigoCharacterId, reboundAt: instante });
                        refNovo = api.ref(estadoOnline.db, "campaignMembers/".concat(idCampanha, "/").concat(uid, "/").concat(novoCharacterId));
                        return [4 /*yield*/, api.set(refNovo, novoMembro)];
                    case 2:
                        _s.sent();
                        if (!(novoCharacterId !== antigoCharacterId)) return [3 /*break*/, 4];
                        return [4 /*yield*/, api.update(refAntigo, { status: "inactive", updatedAt: instante, replacedByCharacterId: novoCharacterId, reboundAt: instante })];
                    case 3:
                        _s.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(texto(antigo.legacySheetId) !== novoSheetId)) return [3 /*break*/, 6];
                        return [4 /*yield*/, api.update(refAntigo, { legacySheetId: novoSheetId, displayName: novoMembro.displayName, lastSeenAt: instante, updatedAt: instante, reboundAt: instante })];
                    case 5:
                        _s.sent();
                        _s.label = 6;
                    case 6: return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "xpInbox/".concat(uid, "/").concat(antigoCharacterId))).catch(function () { return null; })];
                    case 7:
                        inboxSnap = _s.sent();
                        pendentes = ((_m = inboxSnap === null || inboxSnap === void 0 ? void 0 : inboxSnap.exists) === null || _m === void 0 ? void 0 : _m.call(inboxSnap)) ? inboxSnap.val() || {} : {};
                        migrados = 0, concluidos = 0;
                        _s.label = 8;
                    case 8:
                        _s.trys.push([8, 22, 23, 24]);
                        _b = __values(Object.entries(pendentes)), _c = _b.next();
                        _s.label = 9;
                    case 9:
                        if (!!_c.done) return [3 /*break*/, 21];
                        _d = __read(_c.value, 2), ledgerId = _d[0], item = _d[1];
                        if (!item || typeof item !== "object")
                            return [3 /*break*/, 20];
                        ackAntigo = api.ref(estadoOnline.db, "xpAcks/".concat(uid, "/").concat(antigoCharacterId, "/").concat(ledgerId));
                        return [4 /*yield*/, api.get(ackAntigo).catch(function () { return null; })];
                    case 10:
                        ackSnap = _s.sent();
                        if (!(((_p = (_o = ackSnap === null || ackSnap === void 0 ? void 0 : ackSnap.val) === null || _o === void 0 ? void 0 : _o.call(ackSnap)) === null || _p === void 0 ? void 0 : _p.status) === "done")) return [3 /*break*/, 12];
                        return [4 /*yield*/, api.remove(api.ref(estadoOnline.db, "xpInbox/".concat(uid, "/").concat(antigoCharacterId, "/").concat(ledgerId))).catch(function () { })];
                    case 11:
                        _s.sent();
                        concluidos += 1;
                        return [3 /*break*/, 20];
                    case 12:
                        redirecionado = __assign(__assign({}, item), { characterId: novoCharacterId, sourceCharacterId: texto(item.characterId) || antigoCharacterId, sourceSheetId: novoSheetId, redirectedAt: instante, redirectedBy: estadoOnline.user.uid });
                        if (!(novoCharacterId === antigoCharacterId)) return [3 /*break*/, 14];
                        return [4 /*yield*/, api.remove(api.ref(estadoOnline.db, "xpInbox/".concat(uid, "/").concat(antigoCharacterId, "/").concat(ledgerId)))];
                    case 13:
                        _s.sent();
                        _s.label = 14;
                    case 14: return [4 /*yield*/, api.set(api.ref(estadoOnline.db, "xpInbox/".concat(uid, "/").concat(novoCharacterId, "/").concat(ledgerId)), redirecionado)];
                    case 15:
                        _s.sent();
                        if (!(novoCharacterId !== antigoCharacterId)) return [3 /*break*/, 17];
                        return [4 /*yield*/, api.remove(api.ref(estadoOnline.db, "xpInbox/".concat(uid, "/").concat(antigoCharacterId, "/").concat(ledgerId))).catch(function () { })];
                    case 16:
                        _s.sent();
                        _s.label = 17;
                    case 17:
                        if (!((_q = ackSnap === null || ackSnap === void 0 ? void 0 : ackSnap.exists) === null || _q === void 0 ? void 0 : _q.call(ackSnap))) return [3 /*break*/, 19];
                        return [4 /*yield*/, api.remove(ackAntigo).catch(function () { })];
                    case 18:
                        _s.sent();
                        _s.label = 19;
                    case 19:
                        migrados += 1;
                        _s.label = 20;
                    case 20:
                        _c = _b.next();
                        return [3 /*break*/, 9];
                    case 21: return [3 /*break*/, 24];
                    case 22:
                        e_3_1 = _s.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 24];
                    case 23:
                        try {
                            if (_c && !_c.done && (_e = _b.return)) _e.call(_b);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 24:
                        setTimeout(function () { return processarXpCampanhaPendente().catch(function () { }); }, 120);
                        return [2 /*return*/, { ok: true, campaignId: idCampanha, userId: uid, oldCharacterId: antigoCharacterId, characterId: novoCharacterId, sheetId: novoSheetId, displayName: novoMembro.displayName, migratedPending: migrados, alreadyDone: concluidos }];
                }
            });
        });
    }
    function alterarXpCampanha() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var alvos, idCampanha, membros, mapa, alvos_1, alvos_1_1, alvo, chave, membro, diagnostico, pacote;
            var e_4, _b;
            var _c;
            var _d = _a === void 0 ? {} : _a, campaignId = _d.campaignId, memberKeys = _d.memberKeys, targets = _d.targets, amount = _d.amount, _e = _d.reason, reason = _e === void 0 ? "" : _e, _f = _d.type, type = _f === void 0 ? "grant" : _f, _g = _d.sessionId, sessionId = _g === void 0 ? "" : _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        exigirContaGoogle();
                        alvos = targets || memberKeys || [];
                        idCampanha = texto(campaignId);
                        return [4 /*yield*/, membrosAtivosDaCampanha(idCampanha)];
                    case 1:
                        membros = _h.sent();
                        mapa = new Map(membros.map(function (m) { return ["".concat(texto(m.userId), "::").concat(texto(m.characterId)), m]; }));
                        try {
                            for (alvos_1 = __values(alvos), alvos_1_1 = alvos_1.next(); !alvos_1_1.done; alvos_1_1 = alvos_1.next()) {
                                alvo = alvos_1_1.value;
                                chave = alvo && typeof alvo === "object" ? "".concat(texto(alvo.userId), "::").concat(texto(alvo.characterId)) : texto(alvo);
                                membro = mapa.get(chave);
                                if (membro && texto(membro.userId) === texto((_c = estadoOnline.user) === null || _c === void 0 ? void 0 : _c.uid)) {
                                    diagnostico = diagnosticarMembroCampanhaLocal(membro);
                                    if (diagnostico.status === "stale" || diagnostico.status === "ambiguous") {
                                        throw new Error("O v\u00EDnculo de ".concat(texto(membro.displayName) || "personagem", " aponta para uma identidade antiga. Reassocie esse personagem \u00E0 ficha correta antes de registrar novo XP."));
                                    }
                                }
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (alvos_1_1 && !alvos_1_1.done && (_b = alvos_1.return)) _b.call(alvos_1);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        return [4 /*yield*/, montarLancamentosXpPermanentes({ campaignId: idCampanha, targets: alvos, amount: amount, reason: reason, type: type, sessionId: sessionId })];
                    case 2:
                        pacote = _h.sent();
                        return [4 /*yield*/, estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db), pacote.updates)];
                    case 3:
                        _h.sent();
                        return [2 /*return*/, { ok: true, count: pacote.lancamentos.length, amount: pacote.amount, type: pacote.type, entries: pacote.lancamentos }];
                }
            });
        });
    }
    function concederXp(_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var valor, ids, api, updates, campanhaId, permanentes, legados, pacotePermanente;
            var _c;
            var participantIds = _b.participantIds, amount = _b.amount, _d = _b.reason, reason = _d === void 0 ? "" : _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        exigirMestre();
                        valor = Math.trunc(Number(amount));
                        if (!Number.isSafeInteger(valor) || valor === 0)
                            throw new Error("Informe uma quantidade inteira de XP diferente de zero.");
                        if (Math.abs(valor) > 1000000)
                            throw new Error("A alteração máxima por operação é de 1.000.000 de XP.");
                        ids = Array.from(new Set((participantIds || []).filter(function (id) { var _a; return ((_a = participantes()[id]) === null || _a === void 0 ? void 0 : _a.type) === "player"; })));
                        if (!ids.length)
                            throw new Error("Selecione ao menos um jogador.");
                        api = estadoOnline.api, updates = {}, campanhaId = texto((_c = estadoOnline.sala) === null || _c === void 0 ? void 0 : _c.campaignId), permanentes = [], legados = [];
                        ids.forEach(function (participantId) {
                            var p = participantes()[participantId];
                            var ownerUid = texto(p === null || p === void 0 ? void 0 : p.ownerUid);
                            if (!ownerUid)
                                throw new Error("O participante ".concat(texto(p === null || p === void 0 ? void 0 : p.displayName) || participantId, " n\u00E3o possui propriet\u00E1rio v\u00E1lido. Remova-o e entre novamente na sala."));
                            if (campanhaId && (p === null || p === void 0 ? void 0 : p.membershipType) === "campaign" && texto(p === null || p === void 0 ? void 0 : p.characterId)) {
                                permanentes.push({ userId: ownerUid, characterId: texto(p.characterId) });
                            }
                            else {
                                legados.push({ participantId: participantId, p: p, ownerUid: ownerUid });
                            }
                        });
                        pacotePermanente = null;
                        if (!permanentes.length) return [3 /*break*/, 2];
                        return [4 /*yield*/, montarLancamentosXpPermanentes({
                                campaignId: campanhaId, targets: permanentes, amount: Math.abs(valor), type: valor > 0 ? "grant" : "remove",
                                reason: reason,
                                sessionId: estadoOnline.salaId
                            })];
                    case 1:
                        pacotePermanente = _e.sent();
                        Object.assign(updates, pacotePermanente.updates);
                        _e.label = 2;
                    case 2:
                        /* Convidados/sessões legadas continuam usando o evento de sala. Isso
                           preserva compatibilidade sem transformar um convidado em membro da campanha. */
                        legados.forEach(function (_a) {
                            var participantId = _a.participantId, p = _a.p, ownerUid = _a.ownerUid;
                            var ficha = referenciaFichaDoParticipante(p);
                            var eventRef = api.push(api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/events")));
                            updates["rooms/".concat(estadoOnline.salaId, "/events/").concat(eventRef.key)] = {
                                id: eventRef.key, type: "XP_GRANTED", createdBy: estadoOnline.user.uid, createdAt: agora(),
                                payload: { participantId: participantId, targetUid: ownerUid, characterId: ficha.characterId, sheetId: ficha.sheetId, localSheetName: ficha.localSheetName, amount: valor, reason: texto(reason).slice(0, 160) }
                            };
                        });
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db), updates)];
                    case 3:
                        _e.sent();
                        return [2 /*return*/, { ok: true, permanentCount: permanentes.length, sessionCount: legados.length, total: ids.length }];
                }
            });
        });
    }
    function definirNivelJogador(_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var p, valor, ownerUid, ficha, api, eventRef, updates;
            var participantId = _b.participantId, nivel = _b.nivel, _c = _b.reason, reason = _c === void 0 ? "" : _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        exigirMestre();
                        p = participantes()[participantId];
                        if (!p || p.type !== "player")
                            throw new Error("Jogador não encontrado na sala.");
                        valor = Math.max(1, Math.min(20, Math.trunc(Number(nivel))));
                        if (!Number.isFinite(valor))
                            throw new Error("Informe um nível entre 1 e 20.");
                        ownerUid = texto(p === null || p === void 0 ? void 0 : p.ownerUid);
                        if (!ownerUid)
                            throw new Error("O participante ".concat(texto(p === null || p === void 0 ? void 0 : p.displayName) || participantId, " n\u00E3o possui propriet\u00E1rio v\u00E1lido. Remova-o e entre novamente na sala."));
                        ficha = referenciaFichaDoParticipante(p);
                        api = estadoOnline.api;
                        eventRef = api.push(api.ref(estadoOnline.db, "rooms/".concat(estadoOnline.salaId, "/events")));
                        updates = {};
                        updates["rooms/".concat(estadoOnline.salaId, "/participants/").concat(participantId, "/battle/level")] = valor;
                        updates["rooms/".concat(estadoOnline.salaId, "/participants/").concat(participantId, "/updatedAt")] = agora();
                        updates["rooms/".concat(estadoOnline.salaId, "/events/").concat(eventRef.key)] = {
                            id: eventRef.key, type: "LEVEL_SET", createdBy: estadoOnline.user.uid, createdAt: agora(),
                            payload: {
                                participantId: participantId,
                                targetUid: ownerUid, characterId: ficha.characterId, sheetId: ficha.sheetId, localSheetName: ficha.localSheetName,
                                level: valor, reason: texto(reason).slice(0, 160)
                            }
                        };
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db), updates)];
                    case 1:
                        _d.sent();
                        return [2 /*return*/, { participantId: participantId, level: valor, eventId: eventRef.key }];
                }
            });
        });
    }
    function observarEventos(roomId) {
        var _a;
        var api = estadoOnline.api;
        (_a = estadoOnline.unsubscribeEventos) === null || _a === void 0 ? void 0 : _a.call(estadoOnline);
        var consulta = api.query(api.ref(estadoOnline.db, "rooms/".concat(roomId, "/events")), api.orderByChild("createdAt"), api.limitToLast(100));
        estadoOnline.unsubscribeEventos = api.onValue(consulta, function () { return processarEventosXp().catch(function () { }); });
    }
    function reivindicarEventoXp(roomId, eventId, userUid) {
        return __awaiter(this, void 0, void 0, function () {
            var api, deviceId, refAck, instante, resultado, valor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        api = estadoOnline.api;
                        deviceId = obterDeviceId();
                        refAck = api.ref(estadoOnline.db, "rooms/".concat(roomId, "/eventAcks/").concat(eventId, "/").concat(userUid));
                        instante = agora();
                        return [4 /*yield*/, api.runTransaction(refAck, function (atual) {
                                if ((atual === null || atual === void 0 ? void 0 : atual.status) === "done")
                                    return;
                                var processando = (atual === null || atual === void 0 ? void 0 : atual.status) === "processing";
                                var expirou = processando && instante - Number(atual.claimedAt || 0) > 45000;
                                if (atual && !expirou)
                                    return;
                                return { status: "processing", deviceId: deviceId, claimedAt: instante };
                            }, { applyLocally: false })];
                    case 1:
                        resultado = _a.sent();
                        valor = resultado.snapshot.val();
                        return [2 /*return*/, {
                                claimed: Boolean(resultado.committed && (valor === null || valor === void 0 ? void 0 : valor.status) === "processing" && (valor === null || valor === void 0 ? void 0 : valor.deviceId) === deviceId),
                                refAck: refAck,
                                deviceId: deviceId,
                                value: valor
                            }];
                }
            });
        });
    }
    function liberarReivindicacaoXp(refAck, deviceId) {
        return __awaiter(this, void 0, void 0, function () {
            var api;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        api = estadoOnline.api;
                        return [4 /*yield*/, api.runTransaction(refAck, function (atual) {
                                if ((atual === null || atual === void 0 ? void 0 : atual.status) === "processing" && (atual === null || atual === void 0 ? void 0 : atual.deviceId) === deviceId)
                                    return null;
                                return;
                            }, { applyLocally: false }).catch(function () { })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function processarEventosXp() {
        return __awaiter(this, void 0, void 0, function () {
            var room, user, api, sessao, reconciliada, processados, eventos, _loop_2, eventos_1, eventos_1_1, evento, e_5_1;
            var e_5, _a;
            var _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (estadoOnline.processandoXp)
                            return [2 /*return*/];
                        room = estadoOnline.sala;
                        user = estadoOnline.user, api = estadoOnline.api;
                        sessao = lerJson(CHAVE_SESSAO, null);
                        if (!room || !user || (sessao === null || sessao === void 0 ? void 0 : sessao.role) !== "player" || sessao.roomId !== room.id)
                            return [2 /*return*/];
                        estadoOnline.processandoXp = true;
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, , 12, 13]);
                        if (!!fichaAtivaCompativelComSessao(sessao).ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, reconciliarSessaoDaSalaComFichaAtiva().catch(function () { return null; })];
                    case 2:
                        reconciliada = _h.sent();
                        sessao = lerJson(CHAVE_SESSAO, null);
                        room = estadoOnline.sala;
                        if ((reconciliada === null || reconciliada === void 0 ? void 0 : reconciliada.ok) !== true || !room || (sessao === null || sessao === void 0 ? void 0 : sessao.role) !== "player" || sessao.roomId !== room.id || !fichaAtivaCompativelComSessao(sessao).ok)
                            return [2 /*return*/];
                        _h.label = 3;
                    case 3:
                        processados = lerJson(CHAVE_XP_PROCESSADO, {}) || {};
                        eventos = Object.values(room.events || {})
                            .filter(function (e) {
                            var _a, _b, _c;
                            if (!["XP_GRANTED", "LEVEL_SET"].includes(e.type) || ((_a = e.payload) === null || _a === void 0 ? void 0 : _a.targetUid) !== user.uid)
                                return false;
                            var alvoPersonagem = texto((_b = e.payload) === null || _b === void 0 ? void 0 : _b.characterId);
                            var alvoFicha = texto((_c = e.payload) === null || _c === void 0 ? void 0 : _c.sheetId);
                            /* participantId/UID e nome não são identidade suficiente para aplicar
                               uma recompensa em dados permanentes. Eventos legados sem sheetId
                               ou characterId ficam preservados na sala, mas não são aplicados
                               automaticamente a uma ficha diferente. */
                            return (alvoPersonagem && alvoPersonagem === texto(sessao.characterId)) || (alvoFicha && alvoFicha === texto(sessao.sheetId));
                        })
                            .sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
                        _loop_2 = function (evento) {
                            var characterId, sheetId, fichasLocais, ficha, ackAtual, claim, dados, aplicados, notificacao, xp, antes, antes, depois, recentes, sincronizada, resultados, _j, _k, _l, _m, _erro_7, erro_8;
                            return __generator(this, function (_o) {
                                switch (_o.label) {
                                    case 0:
                                        characterId = texto((_b = evento.payload) === null || _b === void 0 ? void 0 : _b.characterId);
                                        sheetId = texto((_c = evento.payload) === null || _c === void 0 ? void 0 : _c.sheetId);
                                        fichasLocais = listarFichasLocais();
                                        ficha = sheetId
                                            ? fichasLocais.find(function (f) { return texto(f.sheetId) === sheetId; })
                                            : (characterId ? fichasLocais.find(function (f) { var _a, _b, _c, _d; return texto(((_b = (_a = f.data) === null || _a === void 0 ? void 0 : _a.__online) === null || _b === void 0 ? void 0 : _b.characterId) || ((_d = (_c = f.data) === null || _c === void 0 ? void 0 : _c.__online) === null || _d === void 0 ? void 0 : _d.realtimeId)) === characterId; }) : null);
                                        if (!ficha)
                                            return [2 /*return*/, "continue"];
                                        ackAtual = (_e = (_d = room.eventAcks) === null || _d === void 0 ? void 0 : _d[evento.id]) === null || _e === void 0 ? void 0 : _e[user.uid];
                                        if ((ackAtual === null || ackAtual === void 0 ? void 0 : ackAtual.status) === "done" || ackAtual === true || typeof ackAtual === "number") {
                                            processados[evento.id] = processados[evento.id] || agora();
                                            return [2 /*return*/, "continue"];
                                        }
                                        return [4 /*yield*/, reivindicarEventoXp(room.id, evento.id, user.uid)];
                                    case 1:
                                        claim = _o.sent();
                                        if (!claim.claimed)
                                            return [2 /*return*/, "continue"];
                                        _o.label = 2;
                                    case 2:
                                        _o.trys.push([2, 14, , 16]);
                                        /* Recarrega a ficha depois da reivindicação, pois outro snapshot pode
                                           ter chegado enquanto o Firebase concluía a transação. */
                                        fichasLocais = listarFichasLocais();
                                        ficha = sheetId
                                            ? fichasLocais.find(function (f) { return texto(f.sheetId) === sheetId; })
                                            : (characterId ? fichasLocais.find(function (f) { var _a, _b, _c, _d; return texto(((_b = (_a = f.data) === null || _a === void 0 ? void 0 : _a.__online) === null || _b === void 0 ? void 0 : _b.characterId) || ((_d = (_c = f.data) === null || _c === void 0 ? void 0 : _c.__online) === null || _d === void 0 ? void 0 : _d.realtimeId)) === characterId; }) : null);
                                        if (!!ficha) return [3 /*break*/, 4];
                                        return [4 /*yield*/, liberarReivindicacaoXp(claim.refAck, claim.deviceId)];
                                    case 3:
                                        _o.sent();
                                        return [2 /*return*/, "continue"];
                                    case 4:
                                        dados = clonar(ficha.data);
                                        dados.__online = dados.__online && typeof dados.__online === "object" ? dados.__online : {};
                                        aplicados = dados.__online.appliedOnlineEvents && typeof dados.__online.appliedOnlineEvents === "object"
                                            ? dados.__online.appliedOnlineEvents
                                            : (dados.__online.appliedXpEvents && typeof dados.__online.appliedXpEvents === "object" ? dados.__online.appliedXpEvents : {});
                                        if (!aplicados[evento.id] && !processados[evento.id]) {
                                            notificacao = null;
                                            if (evento.type === "XP_GRANTED") {
                                                xp = parseXpAtual(dados.xp), antes = xp.current;
                                                dados.xp = formatarXp(Math.max(0, xp.current + Number(evento.payload.amount || 0)), xp.max);
                                                notificacao = { tipo: "xp-recebido", detalhe: {
                                                        amount: Number(evento.payload.amount || 0), before: antes, after: parseXpAtual(dados.xp).current,
                                                        reason: evento.payload.reason, character: texto(dados.nome) || ficha.characterName
                                                    } };
                                            }
                                            else if (evento.type === "LEVEL_SET") {
                                                antes = Math.max(1, Math.min(20, Math.trunc(Number(dados.nivel || 1)) || 1));
                                                depois = Math.max(1, Math.min(20, Math.trunc(Number(evento.payload.level || 1)) || 1));
                                                dados.nivel = String(depois);
                                                dados.proficiencia = String(2 + Math.floor((depois - 1) / 4));
                                                notificacao = { tipo: "nivel-recebido", detalhe: {
                                                        before: antes, after: depois, reason: evento.payload.reason,
                                                        character: texto(dados.nome) || ficha.characterName
                                                    } };
                                            }
                                            aplicados[evento.id] = agora();
                                            recentes = Object.entries(aplicados).sort(function (a, b) { return Number(b[1]) - Number(a[1]); }).slice(0, 100);
                                            dados.__online.appliedOnlineEvents = Object.fromEntries(recentes);
                                            dados.__online.appliedXpEvents = Object.fromEntries(recentes.filter(function (_a) {
                                                var _b, _c;
                                                var _d = __read(_a, 1), id = _d[0];
                                                return ((_c = (_b = room.events) === null || _b === void 0 ? void 0 : _b[id]) === null || _c === void 0 ? void 0 : _c.type) === "XP_GRANTED";
                                            }));
                                            dados.__online.lastOnlineEvent = evento.id;
                                            if (evento.type === "XP_GRANTED")
                                                dados.__online.lastXpEvent = evento.id;
                                            localStorage.setItem(ficha.key, JSON.stringify(dados));
                                            if (ficha.name === fichaAtivaNomeSeguro()) {
                                                try {
                                                    estado = dados;
                                                    CHAVE = ficha.key;
                                                    carregar();
                                                    atualizarPerfil();
                                                    if (evento.type === "LEVEL_SET" && ((_f = window.shinobiLevelUp) === null || _f === void 0 ? void 0 : _f.setManualLevel)) {
                                                        window.shinobiLevelUp.setManualLevel(dados.nivel, { origem: "mestre", notificar: false });
                                                    }
                                                }
                                                catch (_erro) { }
                                            }
                                            if (notificacao)
                                                emitir(notificacao.tipo, notificacao.detalhe);
                                        }
                                        sincronizada = { ok: true, localOnly: Boolean(user.anonymous) };
                                        if (!(!user.anonymous && typeof ((_g = window.ShinobiOnline) === null || _g === void 0 ? void 0 : _g.sincronizarCampoConfirmado) === "function")) return [3 /*break*/, 12];
                                        _o.label = 5;
                                    case 5:
                                        _o.trys.push([5, 11, , 12]);
                                        if (!(evento.type === "XP_GRANTED")) return [3 /*break*/, 7];
                                        return [4 /*yield*/, window.ShinobiOnline.sincronizarCampoConfirmado(ficha.name, "xp", dados.xp, { origem: "mestre", motivo: "xp-mestre" })];
                                    case 6:
                                        sincronizada = _o.sent();
                                        return [3 /*break*/, 10];
                                    case 7:
                                        if (!(evento.type === "LEVEL_SET")) return [3 /*break*/, 10];
                                        resultados = [];
                                        _k = (_j = resultados).push;
                                        return [4 /*yield*/, window.ShinobiOnline.sincronizarCampoConfirmado(ficha.name, "nivel", dados.nivel, { origem: "mestre", motivo: "nivel-mestre" })];
                                    case 8:
                                        _k.apply(_j, [_o.sent()]);
                                        _m = (_l = resultados).push;
                                        return [4 /*yield*/, window.ShinobiOnline.sincronizarCampoConfirmado(ficha.name, "proficiencia", dados.proficiencia, { origem: "mestre", motivo: "nivel-mestre" })];
                                    case 9:
                                        _m.apply(_l, [_o.sent()]);
                                        sincronizada = { ok: resultados.every(function (item) { return (item === null || item === void 0 ? void 0 : item.ok) !== false; }), resultados: resultados };
                                        _o.label = 10;
                                    case 10: return [3 /*break*/, 12];
                                    case 11:
                                        _erro_7 = _o.sent();
                                        sincronizada = { queued: true };
                                        return [3 /*break*/, 12];
                                    case 12:
                                        processados[evento.id] = agora();
                                        salvarJson(CHAVE_XP_PROCESSADO, processados);
                                        return [4 /*yield*/, api.set(claim.refAck, { status: "done", deviceId: claim.deviceId, completedAt: agora() })];
                                    case 13:
                                        _o.sent();
                                        return [3 /*break*/, 16];
                                    case 14:
                                        erro_8 = _o.sent();
                                        return [4 /*yield*/, liberarReivindicacaoXp(claim.refAck, claim.deviceId)];
                                    case 15:
                                        _o.sent();
                                        emitir("erro-sync", { mensagem: erroAmigavel(erro_8), erro: erro_8 });
                                        return [3 /*break*/, 16];
                                    case 16: return [2 /*return*/];
                                }
                            });
                        };
                        _h.label = 4;
                    case 4:
                        _h.trys.push([4, 9, 10, 11]);
                        eventos_1 = __values(eventos), eventos_1_1 = eventos_1.next();
                        _h.label = 5;
                    case 5:
                        if (!!eventos_1_1.done) return [3 /*break*/, 8];
                        evento = eventos_1_1.value;
                        return [5 /*yield**/, _loop_2(evento)];
                    case 6:
                        _h.sent();
                        _h.label = 7;
                    case 7:
                        eventos_1_1 = eventos_1.next();
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_5_1 = _h.sent();
                        e_5 = { error: e_5_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (eventos_1_1 && !eventos_1_1.done && (_a = eventos_1.return)) _a.call(eventos_1);
                        }
                        finally { if (e_5) throw e_5.error; }
                        return [7 /*endfinally*/];
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        estadoOnline.processandoXp = false;
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        });
    }
    function reivindicarXpCampanha(item) {
        return __awaiter(this, void 0, void 0, function () {
            var api, uid, characterId, ledgerId, deviceId, refAck, instante, resultado, valor;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        api = estadoOnline.api, uid = (_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid, characterId = texto(item === null || item === void 0 ? void 0 : item.characterId), ledgerId = texto(item === null || item === void 0 ? void 0 : item.id), deviceId = obterDeviceId();
                        if (!api || !uid || !characterId || !ledgerId)
                            return [2 /*return*/, { claimed: false }];
                        refAck = api.ref(estadoOnline.db, "xpAcks/".concat(uid, "/").concat(characterId, "/").concat(ledgerId)), instante = agora();
                        return [4 /*yield*/, api.runTransaction(refAck, function (atual) {
                                if ((atual === null || atual === void 0 ? void 0 : atual.status) === "done")
                                    return;
                                var expirou = (atual === null || atual === void 0 ? void 0 : atual.status) === "processing" && instante - Number(atual.claimedAt || 0) > 60000;
                                if (atual && !expirou)
                                    return;
                                return __assign(__assign({}, (atual && typeof atual === "object" ? atual : {})), { status: "processing", deviceId: deviceId, claimedAt: instante });
                            }, { applyLocally: false })];
                    case 1:
                        resultado = _b.sent();
                        valor = resultado.snapshot.val();
                        return [2 /*return*/, { claimed: Boolean(resultado.committed && (valor === null || valor === void 0 ? void 0 : valor.status) === "processing" && (valor === null || valor === void 0 ? void 0 : valor.deviceId) === deviceId), refAck: refAck, deviceId: deviceId, value: valor }];
                }
            });
        });
    }
    function liberarXpCampanha(refAck, deviceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!refAck || !estadoOnline.api)
                            return [2 /*return*/];
                        return [4 /*yield*/, estadoOnline.api.runTransaction(refAck, function (atual) {
                                if ((atual === null || atual === void 0 ? void 0 : atual.status) !== "processing" || (atual === null || atual === void 0 ? void 0 : atual.deviceId) !== deviceId)
                                    return;
                                /* Se o alvo absoluto já foi calculado, preservamos esse valor para que
                                   um retry nunca some o mesmo ledger novamente. claimedAt=1 libera a
                                   nova tentativa imediatamente sem perder targetXp/xpMax. */
                                if (Number.isFinite(Number(atual.targetXp))) {
                                    return __assign(__assign({}, atual), { deviceId: "retry", claimedAt: 1 });
                                }
                                return null;
                            }, { applyLocally: false }).catch(function () { })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function fixarAlvoXpCampanha(claim_1, _a) {
        return __awaiter(this, arguments, void 0, function (claim, _b) {
            var api, atual, base, limite, alvo, resultado, salvo;
            var current = _b.current, max = _b.max, amount = _b.amount;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        api = estadoOnline.api;
                        atual = (claim === null || claim === void 0 ? void 0 : claim.value) || {};
                        if (Number.isFinite(Number(atual.targetXp))) {
                            return [2 /*return*/, { targetXp: Math.max(0, Math.trunc(Number(atual.targetXp))), xpMax: Math.max(0, Math.trunc(Number(atual.xpMax || max || 355000))), baseXp: Math.max(0, Math.trunc(Number(atual.baseXp || current || 0))) }];
                        }
                        base = Math.max(0, Math.trunc(Number(current || 0))), limite = Math.max(0, Math.trunc(Number(max || 355000)));
                        alvo = Math.max(0, base + Math.trunc(Number(amount || 0)));
                        return [4 /*yield*/, api.runTransaction(claim.refAck, function (estado) {
                                if ((estado === null || estado === void 0 ? void 0 : estado.status) !== "processing" || (estado === null || estado === void 0 ? void 0 : estado.deviceId) !== claim.deviceId)
                                    return;
                                if (Number.isFinite(Number(estado.targetXp)))
                                    return estado;
                                return __assign(__assign({}, estado), { baseXp: base, targetXp: alvo, xpMax: limite });
                            }, { applyLocally: false })];
                    case 1:
                        resultado = _c.sent();
                        salvo = resultado.snapshot.val();
                        if (!salvo || salvo.status !== "processing" || salvo.deviceId !== claim.deviceId || !Number.isFinite(Number(salvo.targetXp))) {
                            throw new Error("Não foi possível reservar de forma segura o XP deste lançamento.");
                        }
                        claim.value = salvo;
                        return [2 /*return*/, { targetXp: Math.max(0, Math.trunc(Number(salvo.targetXp))), xpMax: Math.max(0, Math.trunc(Number(salvo.xpMax || limite))), baseXp: Math.max(0, Math.trunc(Number(salvo.baseXp || base))) }];
                }
            });
        });
    }
    function aliasesIdentidadeFichaXp(ficha) {
        var _a;
        var online = ((_a = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _a === void 0 ? void 0 : _a.__online) && typeof ficha.data.__online === "object" ? ficha.data.__online : {};
        /* ownerUid pertence ao backup estrutural e pode continuar apontando para uma
           conta anterior após testes/troca de login. Para XP, a identidade atual do
           personagem é characterOwnerUid/realtimeOwnerUid; misturar os dois donos
           fazia uma ficha correta ser descartada antes mesmo de comparar IDs. */
        var backupOwnerUid = texto(online.ownerUid);
        var characterOwnerUid = texto(online.characterOwnerUid) || texto(online.realtimeOwnerUid);
        var ownerUid = characterOwnerUid || backupOwnerUid;
        var currentCharacterIds = new Set([texto(online.characterId), texto(online.realtimeId)].filter(Boolean));
        var currentSheetIds = new Set([texto(ficha === null || ficha === void 0 ? void 0 : ficha.sheetId), texto(online.sheetId)].filter(Boolean));
        var historicalCharacterIds = new Set([texto(online.sourceCharacterId)].filter(Boolean));
        var historicalSheetIds = new Set([texto(online.sourceSheetId), texto(online.originSheetId)].filter(Boolean));
        return {
            ownerUid: ownerUid,
            backupOwnerUid: backupOwnerUid,
            characterOwnerUid: characterOwnerUid,
            currentCharacterIds: currentCharacterIds,
            currentSheetIds: currentSheetIds,
            historicalCharacterIds: historicalCharacterIds,
            historicalSheetIds: historicalSheetIds,
            characterIds: new Set(__spreadArray(__spreadArray([], __read(currentCharacterIds), false), __read(historicalCharacterIds), false)),
            sheetIds: new Set(__spreadArray(__spreadArray([], __read(currentSheetIds), false), __read(historicalSheetIds), false))
        };
    }
    function fichaLocalDoXpCampanha(item) {
        var _a;
        var characterId = texto(item === null || item === void 0 ? void 0 : item.characterId), sheetId = texto(item === null || item === void 0 ? void 0 : item.sourceSheetId), uid = texto((_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid);
        var todas = listarFichasLocais().map(function (ficha) { return ({ ficha: ficha, aliases: aliasesIdentidadeFichaXp(ficha) }); });
        var porConta = todas.filter(function (_a) {
            var aliases = _a.aliases;
            return !uid || !aliases.characterOwnerUid || aliases.characterOwnerUid === uid;
        });
        /* A identidade atual do personagem continua sendo a primeira escolha. */
        var porPersonagemAtual = characterId ? porConta.filter(function (_a) {
            var aliases = _a.aliases;
            return aliases.currentCharacterIds.has(characterId);
        }) : [];
        if (porPersonagemAtual.length === 1)
            return porPersonagemAtual[0].ficha;
        if (porPersonagemAtual.length > 1)
            return null;
        /* sourceSheetId é um UUID persistente da ficha. O inbox já está protegido
           por userId no Firebase; portanto uma correspondência EXATA e única de
           sheetId é segura mesmo quando ownerUid de backup ficou obsoleto após uma
           troca de conta. Isso fecha o caso em que o ledger existia, mas o cliente
           descartava a própria ficha antes de tentar aplicar o XP. */
        var porSheetAtual = sheetId ? todas.filter(function (_a) {
            var aliases = _a.aliases;
            return aliases.currentSheetIds.has(sheetId);
        }) : [];
        if (porSheetAtual.length === 1)
            return porSheetAtual[0].ficha;
        if (porSheetAtual.length > 1)
            return null;
        /* Aliases históricos são somente fallback e exigem compatibilidade com a
           identidade da conta atual para não religar cópias antigas. */
        var porPersonagemHistorico = characterId ? porConta.filter(function (_a) {
            var aliases = _a.aliases;
            return aliases.historicalCharacterIds.has(characterId);
        }) : [];
        var porSheetHistorico = sheetId ? porConta.filter(function (_a) {
            var aliases = _a.aliases;
            return aliases.historicalSheetIds.has(sheetId);
        }) : [];
        var historicas = new Map();
        __spreadArray(__spreadArray([], __read(porPersonagemHistorico), false), __read(porSheetHistorico), false).forEach(function (item) { return historicas.set(item.ficha.key, item.ficha); });
        return historicas.size === 1 ? Array.from(historicas.values())[0] : null;
    }
    function fichaLocalUnicaPorSheetIds(sheetIds) {
        var _a;
        var ids = new Set(Array.from(sheetIds || []).map(texto).filter(Boolean));
        if (!ids.size)
            return null;
        var uid = texto((_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid);
        var todas = listarFichasLocais().map(function (ficha) { return ({ ficha: ficha, aliases: aliasesIdentidadeFichaXp(ficha) }); });
        var atuais = todas.filter(function (_a) {
            var aliases = _a.aliases;
            return Array.from(aliases.currentSheetIds).some(function (id) { return ids.has(id); });
        });
        if (atuais.length === 1)
            return atuais[0].ficha;
        if (atuais.length > 1)
            return null;
        var porConta = todas.filter(function (_a) {
            var aliases = _a.aliases;
            return !uid || !aliases.characterOwnerUid || aliases.characterOwnerUid === uid;
        });
        var historicas = porConta.filter(function (_a) {
            var aliases = _a.aliases;
            return Array.from(aliases.historicalSheetIds).some(function (id) { return ids.has(id); });
        });
        return historicas.length === 1 ? historicas[0].ficha : null;
    }
    function fichaLocalDoXpCampanhaComReparo(item) {
        return __awaiter(this, void 0, void 0, function () {
            var direta, uid, campaignId, characterId, sheetIds, snap, membros, antigo, id, _erro_8, ficha, snap, remotas, idsRemotos_1, _erro_9;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        direta = fichaLocalDoXpCampanha(item);
                        if (direta)
                            return [2 /*return*/, direta];
                        uid = texto((_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid), campaignId = texto(item === null || item === void 0 ? void 0 : item.campaignId), characterId = texto(item === null || item === void 0 ? void 0 : item.characterId);
                        if (!uid || !campaignId || !estadoOnline.api)
                            return [2 /*return*/, null];
                        sheetIds = new Set([texto(item === null || item === void 0 ? void 0 : item.sourceSheetId)].filter(Boolean));
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, estadoOnline.api.get(estadoOnline.api.ref(estadoOnline.db, "campaignMembers/".concat(campaignId, "/").concat(uid)))];
                    case 2:
                        snap = _d.sent();
                        membros = ((_b = snap === null || snap === void 0 ? void 0 : snap.val) === null || _b === void 0 ? void 0 : _b.call(snap)) || {};
                        antigo = membros && typeof membros === 'object' ? membros[characterId] : null;
                        if (antigo && typeof antigo === 'object') {
                            id = texto(antigo.legacySheetId || antigo.sheetId || antigo.sourceSheetId);
                            if (id)
                                sheetIds.add(id);
                        }
                        /* Se o mesmo sheetId já foi reassociado a um characterId novo, o membro
                           novo também será encontrado por igualdade exata de sheetId. Nenhum nome,
                           e-mail ou deviceId participa desta decisão. */
                        Object.values(membros && typeof membros === 'object' ? membros : {}).forEach(function (membro) {
                            if (!membro || typeof membro !== 'object')
                                return;
                            var id = texto(membro.legacySheetId || membro.sheetId || membro.sourceSheetId);
                            if (id && sheetIds.has(id))
                                sheetIds.add(id);
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        _erro_8 = _d.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        ficha = fichaLocalUnicaPorSheetIds(sheetIds);
                        if (ficha)
                            return [2 /*return*/, ficha];
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, estadoOnline.api.get(estadoOnline.api.ref(estadoOnline.db, "userSheets/".concat(uid)))];
                    case 6:
                        snap = _d.sent();
                        remotas = ((_c = snap === null || snap === void 0 ? void 0 : snap.val) === null || _c === void 0 ? void 0 : _c.call(snap)) || {};
                        idsRemotos_1 = new Set();
                        Object.entries(remotas && typeof remotas === 'object' ? remotas : {}).forEach(function (_a) {
                            var _b = __read(_a, 2), sheetId = _b[0], registro = _b[1];
                            if (!registro || registro.deleted === true || !registro.data)
                                return;
                            var online = registro.data.__online && typeof registro.data.__online === 'object' ? registro.data.__online : {};
                            var chars = [online.characterId, online.realtimeId, online.sourceCharacterId].map(texto).filter(Boolean);
                            if ((characterId && chars.includes(characterId)) || sheetIds.has(texto(sheetId)) || sheetIds.has(texto(online.sheetId))) {
                                idsRemotos_1.add(texto(sheetId));
                                if (texto(online.sheetId))
                                    idsRemotos_1.add(texto(online.sheetId));
                            }
                        });
                        if (idsRemotos_1.size) {
                            ficha = fichaLocalUnicaPorSheetIds(idsRemotos_1);
                            if (ficha)
                                return [2 /*return*/, ficha];
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        _erro_9 = _d.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, null];
                }
            });
        });
    }
    function mapaXpCampanhaAplicado(dados) {
        dados.__online = dados.__online && typeof dados.__online === "object" ? dados.__online : {};
        var atual = dados.__online.appliedCampaignXpLedger;
        return atual && typeof atual === "object" && !Array.isArray(atual) ? atual : {};
    }
    function limitarMapaEventos(mapa, limite) {
        if (limite === void 0) { limite = 200; }
        return Object.fromEntries(Object.entries(mapa || {}).sort(function (a, b) { return Number(b[1]) - Number(a[1]); }).slice(0, limite));
    }
    function registroXpJaAplicadoNaNuvem(ficha, ledgerId) {
        return __awaiter(this, void 0, void 0, function () {
            var snap, remoto, aplicados, _erro_10;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(ficha === null || ficha === void 0 ? void 0 : ficha.sheetId) || !((_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid) || estadoOnline.user.anonymous)
                            return [2 /*return*/, null];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, estadoOnline.api.get(estadoOnline.api.ref(estadoOnline.db, "userSheets/".concat(estadoOnline.user.uid, "/").concat(ficha.sheetId)))];
                    case 2:
                        snap = _d.sent();
                        remoto = (_b = snap.val()) === null || _b === void 0 ? void 0 : _b.data;
                        if (!remoto || typeof remoto !== "object")
                            return [2 /*return*/, null];
                        aplicados = (_c = remoto.__online) === null || _c === void 0 ? void 0 : _c.appliedCampaignXpLedger;
                        if (aplicados && typeof aplicados === "object" && aplicados[ledgerId])
                            return [2 /*return*/, remoto];
                        return [3 /*break*/, 4];
                    case 3:
                        _erro_10 = _d.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, null];
                }
            });
        });
    }
    function registrarRecebimentoXpCampanha(item_1, ficha_1) {
        return __awaiter(this, arguments, void 0, function (item, ficha, _a) {
            var api, uid, campaignId, ledgerId, characterId, recibo, erro_9;
            var _b;
            var _c = _a === void 0 ? {} : _a, _d = _c.xpAfter, xpAfter = _d === void 0 ? 0 : _d, _e = _c.syncStatus, syncStatus = _e === void 0 ? "queued" : _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        api = estadoOnline.api, uid = texto((_b = estadoOnline.user) === null || _b === void 0 ? void 0 : _b.uid);
                        campaignId = texto(item === null || item === void 0 ? void 0 : item.campaignId), ledgerId = texto(item === null || item === void 0 ? void 0 : item.id), characterId = texto(item === null || item === void 0 ? void 0 : item.characterId);
                        if (!api || !uid || !campaignId || !ledgerId || !characterId || !(ficha === null || ficha === void 0 ? void 0 : ficha.sheetId))
                            return [2 /*return*/, { ok: false, skipped: true }];
                        recibo = {
                            campaignId: campaignId,
                            ledgerId: ledgerId,
                            userId: uid,
                            characterId: characterId,
                            sheetId: texto(ficha.sheetId),
                            amount: Math.trunc(Number((item === null || item === void 0 ? void 0 : item.amount) || 0)), receivedAt: agora(), deviceId: obterDeviceId(),
                            xpAfter: Math.max(0, Math.trunc(Number(xpAfter || 0))), status: "received",
                            syncStatus: syncStatus === "synced" ? "synced" : "queued"
                        };
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, api.set(api.ref(estadoOnline.db, "xpReceipts/".concat(campaignId, "/").concat(ledgerId)), recibo)];
                    case 2:
                        _f.sent();
                        return [2 /*return*/, { ok: true, receipt: recibo }];
                    case 3:
                        erro_9 = _f.sent();
                        /* O recibo serve para o mestre acompanhar a entrega, mas jamais pode
                           impedir o XP de entrar na ficha. Se as rules ainda não foram publicadas
                           ou houver uma falha transitória, o ACK principal continua funcionando. */
                        emitir("erro-sync", { mensagem: "O XP foi aplicado, mas a confirmação para o mestre ficou pendente.", erro: erro_9 });
                        return [2 /*return*/, { ok: false, error: erro_9 }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function processarXpCampanhaPendente() {
        return __awaiter(this, void 0, void 0, function () {
            var uid, api, fila, personagensBloqueados, statusMembroCache, fila_1, fila_1_1, item, ledgerId, characterId, amount, campaignId, chaveMembro, statusSnap, _erro_11, ficha, ackRef, ackSnap, claim, dados, aplicados, xpAntes, alvo, aplicouAgora, remoto, atual, rt, _a, xpAceito, estrutural, depois, erro_10, e_6_1;
            var e_6, _b;
            var _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (estadoOnline.processandoXpCampanha || !estadoOnline.user || estadoOnline.user.anonymous || !estadoOnline.api)
                            return [2 /*return*/];
                        if (((_c = window.navigator) === null || _c === void 0 ? void 0 : _c.onLine) === false)
                            return [2 /*return*/];
                        uid = estadoOnline.user.uid, api = estadoOnline.api;
                        fila = Object.values(estadoOnline.xpInbox || {}).filter(function (item) {
                            return texto(item === null || item === void 0 ? void 0 : item.userId) === uid && texto(item === null || item === void 0 ? void 0 : item.characterId) && texto(item === null || item === void 0 ? void 0 : item.id) && Number.isSafeInteger(Math.trunc(Number(item === null || item === void 0 ? void 0 : item.amount))) && Math.trunc(Number(item === null || item === void 0 ? void 0 : item.amount)) !== 0;
                        }).sort(function (a, b) { return Number(a.createdAt || 0) - Number(b.createdAt || 0); });
                        if (!fila.length)
                            return [2 /*return*/];
                        estadoOnline.processandoXpCampanha = true;
                        personagensBloqueados = new Set(), statusMembroCache = new Map();
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, , 36, 37]);
                        _j.label = 2;
                    case 2:
                        _j.trys.push([2, 33, 34, 35]);
                        fila_1 = __values(fila), fila_1_1 = fila_1.next();
                        _j.label = 3;
                    case 3:
                        if (!!fila_1_1.done) return [3 /*break*/, 32];
                        item = fila_1_1.value;
                        ledgerId = texto(item.id), characterId = texto(item.characterId), amount = Math.trunc(Number(item.amount || 0));
                        if (personagensBloqueados.has(characterId))
                            return [3 /*break*/, 31];
                        campaignId = texto(item.campaignId), chaveMembro = "".concat(campaignId, "::").concat(characterId);
                        if (!(campaignId && !statusMembroCache.has(chaveMembro))) return [3 /*break*/, 7];
                        _j.label = 4;
                    case 4:
                        _j.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "campaignMembers/".concat(campaignId, "/").concat(uid, "/").concat(characterId, "/status")))];
                    case 5:
                        statusSnap = _j.sent();
                        statusMembroCache.set(chaveMembro, texto(statusSnap.val()));
                        return [3 /*break*/, 7];
                    case 6:
                        _erro_11 = _j.sent();
                        statusMembroCache.set(chaveMembro, "");
                        return [3 /*break*/, 7];
                    case 7:
                        if (statusMembroCache.get(chaveMembro) === "inactive") {
                            personagensBloqueados.add(characterId);
                            return [3 /*break*/, 31];
                        }
                        return [4 /*yield*/, fichaLocalDoXpCampanhaComReparo(item)];
                    case 8:
                        ficha = _j.sent();
                        if (!ficha) {
                            personagensBloqueados.add(characterId);
                            emitir("xp-pendente", {
                                reason: "target-sheet-not-found",
                                campaignId: campaignId,
                                ledgerId: ledgerId,
                                characterId: characterId,
                                sourceSheetId: texto(item === null || item === void 0 ? void 0 : item.sourceSheetId), displayName: texto(item === null || item === void 0 ? void 0 : item.displayName)
                            });
                            return [3 /*break*/, 31];
                        }
                        ackRef = api.ref(estadoOnline.db, "xpAcks/".concat(uid, "/").concat(characterId, "/").concat(ledgerId));
                        return [4 /*yield*/, api.get(ackRef).catch(function () { return null; })];
                    case 9:
                        ackSnap = _j.sent();
                        if (!(((_e = (_d = ackSnap === null || ackSnap === void 0 ? void 0 : ackSnap.val) === null || _d === void 0 ? void 0 : _d.call(ackSnap)) === null || _e === void 0 ? void 0 : _e.status) === "done")) return [3 /*break*/, 11];
                        return [4 /*yield*/, api.remove(api.ref(estadoOnline.db, "xpInbox/".concat(uid, "/").concat(characterId, "/").concat(ledgerId))).catch(function () { })];
                    case 10:
                        _j.sent();
                        return [3 /*break*/, 31];
                    case 11: return [4 /*yield*/, reivindicarXpCampanha(item)];
                    case 12:
                        claim = _j.sent();
                        if (!claim.claimed) {
                            personagensBloqueados.add(characterId);
                            return [3 /*break*/, 31];
                        }
                        _j.label = 13;
                    case 13:
                        _j.trys.push([13, 29, , 31]);
                        return [4 /*yield*/, fichaLocalDoXpCampanhaComReparo(item)];
                    case 14:
                        ficha = _j.sent();
                        if (!!ficha) return [3 /*break*/, 16];
                        return [4 /*yield*/, liberarXpCampanha(claim.refAck, claim.deviceId)];
                    case 15:
                        _j.sent();
                        personagensBloqueados.add(characterId);
                        return [3 /*break*/, 31];
                    case 16:
                        dados = clonar(ficha.data || {}), aplicados = mapaXpCampanhaAplicado(dados);
                        xpAntes = parseXpAtual(dados.xp);
                        return [4 /*yield*/, fixarAlvoXpCampanha(claim, { current: xpAntes.current, max: xpAntes.max, amount: amount })];
                    case 17:
                        alvo = _j.sent();
                        aplicouAgora = false;
                        if (!!aplicados[ledgerId]) return [3 /*break*/, 19];
                        return [4 /*yield*/, registroXpJaAplicadoNaNuvem(ficha, ledgerId)];
                    case 18:
                        remoto = _j.sent();
                        if (remoto) {
                            atual = parseXpAtual(dados.xp).current;
                            if (atual === alvo.baseXp)
                                dados.xp = formatarXp(alvo.targetXp, alvo.xpMax);
                            aplicados[ledgerId] = Number((_g = (_f = remoto.__online) === null || _f === void 0 ? void 0 : _f.appliedCampaignXpLedger) === null || _g === void 0 ? void 0 : _g[ledgerId]) || agora();
                        }
                        else {
                            dados.xp = formatarXp(alvo.targetXp, alvo.xpMax);
                            aplicados[ledgerId] = agora();
                            aplicouAgora = true;
                        }
                        dados.__online.appliedCampaignXpLedger = limitarMapaEventos(aplicados, 200);
                        dados.__online.lastCampaignXpLedger = ledgerId;
                        localStorage.setItem(ficha.key, JSON.stringify(dados));
                        if (ficha.name === fichaAtivaNomeSeguro()) {
                            try {
                                estado = dados;
                                CHAVE = ficha.key;
                                carregar();
                                atualizarPerfil();
                            }
                            catch (_erro) { }
                        }
                        _j.label = 19;
                    case 19:
                        if (!(typeof ((_h = window.ShinobiOnline) === null || _h === void 0 ? void 0 : _h.sincronizarCampoConfirmado) === "function")) return [3 /*break*/, 21];
                        return [4 /*yield*/, window.ShinobiOnline.sincronizarCampoConfirmado(ficha.name, "xp", dados.xp, { origem: "mestre", motivo: "xp-campanha" }).catch(function (erro) { return ({ accepted: false, ok: false, erro: erro }); })];
                    case 20:
                        _a = _j.sent();
                        return [3 /*break*/, 22];
                    case 21:
                        _a = { accepted: false, ok: false, reason: "realtime-indisponivel" };
                        _j.label = 22;
                    case 22:
                        rt = _a;
                        xpAceito = (rt === null || rt === void 0 ? void 0 : rt.accepted) === true || (rt === null || rt === void 0 ? void 0 : rt.delivered) === true;
                        if (!!xpAceito) return [3 /*break*/, 24];
                        return [4 /*yield*/, liberarXpCampanha(claim.refAck, claim.deviceId)];
                    case 23:
                        _j.sent();
                        personagensBloqueados.add(characterId);
                        return [3 /*break*/, 31];
                    case 24: return [4 /*yield*/, sincronizarFicha(ficha.name, { motivo: "xp-campanha-ledger" }).catch(function (erro) { return ({ ok: false, erro: erro }); })];
                    case 25:
                        estrutural = _j.sent();
                        if ((estrutural === null || estrutural === void 0 ? void 0 : estrutural.conflict) || (estrutural === null || estrutural === void 0 ? void 0 : estrutural.queued) || (estrutural === null || estrutural === void 0 ? void 0 : estrutural.ok) === false) {
                            /* O campo XP já está no outbox/realtime. O snapshot estrutural e o
                               marker de idempotência podem convergir depois sem repetir o delta. */
                            marcarFichaPendente(ficha.name, { motivo: "xp-campanha-ledger", modo: "imediato" });
                        }
                        depois = parseXpAtual(dados.xp).current;
                        return [4 /*yield*/, registrarRecebimentoXpCampanha(item, ficha, {
                                xpAfter: depois, syncStatus: (rt === null || rt === void 0 ? void 0 : rt.delivered) === true ? "synced" : "queued"
                            })];
                    case 26:
                        _j.sent();
                        return [4 /*yield*/, api.set(claim.refAck, {
                                status: "done", deviceId: claim.deviceId, completedAt: agora(),
                                baseXp: alvo.baseXp, targetXp: alvo.targetXp, xpMax: alvo.xpMax
                            })];
                    case 27:
                        _j.sent();
                        return [4 /*yield*/, api.remove(api.ref(estadoOnline.db, "xpInbox/".concat(uid, "/").concat(characterId, "/").concat(ledgerId))).catch(function () { })];
                    case 28:
                        _j.sent();
                        if (aplicouAgora)
                            emitir("xp-recebido", {
                                amount: depois - xpAntes.current, before: xpAntes.current, after: depois, requestedAmount: amount,
                                reason: texto(item.reason), character: texto(dados.nome) || ficha.characterName,
                                campaignId: texto(item.campaignId),
                                ledgerId: ledgerId,
                                permanent: true
                            });
                        return [3 /*break*/, 31];
                    case 29:
                        erro_10 = _j.sent();
                        return [4 /*yield*/, liberarXpCampanha(claim.refAck, claim.deviceId)];
                    case 30:
                        _j.sent();
                        personagensBloqueados.add(characterId);
                        emitir("erro-sync", { mensagem: erroAmigavel(erro_10), erro: erro_10 });
                        return [3 /*break*/, 31];
                    case 31:
                        fila_1_1 = fila_1.next();
                        return [3 /*break*/, 3];
                    case 32: return [3 /*break*/, 35];
                    case 33:
                        e_6_1 = _j.sent();
                        e_6 = { error: e_6_1 };
                        return [3 /*break*/, 35];
                    case 34:
                        try {
                            if (fila_1_1 && !fila_1_1.done && (_b = fila_1.return)) _b.call(fila_1);
                        }
                        finally { if (e_6) throw e_6.error; }
                        return [7 /*endfinally*/];
                    case 35: return [3 /*break*/, 37];
                    case 36:
                        estadoOnline.processandoXpCampanha = false;
                        return [7 /*endfinally*/];
                    case 37: return [2 /*return*/];
                }
            });
        });
    }
    function chaveSyncConta(uid) {
        if (uid === void 0) { uid = uidContaAtiva(); }
        return chaveConta(CHAVE_SYNC_BASE, uid);
    }
    function chaveOutboxConta(uid) {
        if (uid === void 0) { uid = uidContaAtiva(); }
        return chaveConta(CHAVE_OUTBOX_BASE, uid);
    }
    function chaveBackupOutboxConta(uid) {
        if (uid === void 0) { uid = uidContaAtiva(); }
        return chaveConta(CHAVE_BACKUP_OUTBOX_BASE, uid);
    }
    function migrarEstadoSyncLegadoParaConta(uid) {
        var chave = chaveSyncConta(uid);
        if (!chave || localStorage.getItem(chave) != null)
            return;
        var legado = lerJson(CHAVE_SYNC_LEGADA, null);
        if (legado && typeof legado === "object") {
            salvarJson(chave, legado);
            localStorage.removeItem(CHAVE_SYNC_LEGADA);
        }
    }
    function estadoSync(uid) {
        if (uid === void 0) { uid = uidContaAtiva(); }
        var chave = chaveSyncConta(uid);
        return chave ? (lerJson(chave, {}) || {}) : {};
    }
    function gravarEstadoSync(v, uid) {
        if (uid === void 0) { uid = uidContaAtiva(); }
        var chave = chaveSyncConta(uid);
        if (chave)
            salvarJson(chave, v || {});
    }
    function estadoOutbox(uid) {
        if (uid === void 0) { uid = uidContaAtiva(); }
        var chave = chaveOutboxConta(uid);
        return chave ? (lerJson(chave, {}) || {}) : {};
    }
    function gravarOutbox(v, uid) {
        if (uid === void 0) { uid = uidContaAtiva(); }
        var chave = chaveOutboxConta(uid);
        if (chave)
            salvarJson(chave, v || {});
    }
    function adicionarOutbox(sheetId, tipo, extra, uid) {
        if (tipo === void 0) { tipo = "upsert"; }
        if (extra === void 0) { extra = {}; }
        if (uid === void 0) { uid = uidContaAtiva(); }
        var id = texto(sheetId), conta = texto(uid);
        if (!id || !conta)
            return;
        var outbox = estadoOutbox(conta);
        var anterior = outbox[id] && typeof outbox[id] === "object" ? outbox[id] : {};
        outbox[id] = __assign(__assign(__assign({}, anterior), extra), { type: tipo, sheetId: id, updatedAt: agora() });
        gravarOutbox(outbox, conta);
    }
    function removerOutbox(sheetId, _a, uid) {
        var _b = _a === void 0 ? {} : _a, _c = _b.somenteTipo, somenteTipo = _c === void 0 ? "" : _c;
        if (uid === void 0) { uid = uidContaAtiva(); }
        var id = texto(sheetId), conta = texto(uid);
        if (!id || !conta)
            return;
        var outbox = estadoOutbox(conta);
        if (!outbox[id])
            return;
        if (somenteTipo && texto(outbox[id].type) !== somenteTipo)
            return;
        delete outbox[id];
        gravarOutbox(outbox, conta);
    }
    function estadoBackupOutbox(uid) {
        if (uid === void 0) { uid = uidContaAtiva(); }
        var chave = chaveBackupOutboxConta(uid);
        return chave ? (lerJson(chave, {}) || {}) : {};
    }
    function gravarBackupOutbox(v, uid) {
        if (uid === void 0) { uid = uidContaAtiva(); }
        var chave = chaveBackupOutboxConta(uid);
        if (chave)
            salvarJson(chave, v || {});
    }
    function marcarBackupEstruturalPendente(localSheetName, sheetId, _a, uid) {
        var _b = _a === void 0 ? {} : _a, _c = _b.motivo, motivo = _c === void 0 ? "backup-estrutural" : _c;
        if (uid === void 0) { uid = uidContaAtiva(); }
        var conta = texto(uid), id = texto(sheetId);
        if (!conta || !id)
            return;
        var outbox = estadoBackupOutbox(conta);
        outbox[id] = { sheetId: id, name: texto(localSheetName) || "Principal", reason: texto(motivo) || "backup-estrutural", updatedAt: agora() };
        gravarBackupOutbox(outbox, conta);
    }
    function removerBackupEstruturalPendente(sheetId, uid) {
        if (uid === void 0) { uid = uidContaAtiva(); }
        var conta = texto(uid), id = texto(sheetId);
        if (!conta || !id)
            return;
        var outbox = estadoBackupOutbox(conta);
        if (!outbox[id])
            return;
        delete outbox[id];
        gravarBackupOutbox(outbox, conta);
    }
    function restaurarOutboxConta(uid) {
        if (uid === void 0) { uid = uidContaAtiva(); }
        estadoOnline.dirtySheets.clear();
        var outbox = estadoOutbox(uid);
        Object.values(outbox).forEach(function (op) {
            if (texto(op === null || op === void 0 ? void 0 : op.type) === "upsert" && texto(op === null || op === void 0 ? void 0 : op.sheetId))
                estadoOnline.dirtySheets.add(texto(op.sheetId));
        });
    }
    function definirStatusSync(sheetId, syncStatus, phase, extra) {
        if (phase === void 0) { phase = "pending"; }
        if (extra === void 0) { extra = {}; }
        var id = texto(sheetId);
        if (!id)
            return null;
        var sync = estadoSync();
        var atual = sync[id] && typeof sync[id] === "object" ? sync[id] : {};
        sync[id] = __assign(__assign(__assign({}, atual), { syncStatus: syncStatus === 1 ? 1 : 0, phase: texto(phase) || "pending", statusUpdatedAt: agora() }), extra);
        gravarEstadoSync(sync);
        emitir("status-sync", { sheetId: sheetId, status: clonar(sync[id]) });
        return sync[id];
    }
    function statusSincronizacaoAtual() {
        var ficha = fichaAtualLocal();
        if (!ficha)
            return { syncStatus: 1, phase: "synced", sheetId: "", revision: 0 };
        var meta = estadoSync()[ficha.sheetId] || {};
        var hashAtual = hashFicha(ficha.data || {});
        var op = estadoOutbox()[ficha.sheetId];
        var pendenteReal = estadoOnline.dirtySheets.has(ficha.sheetId) || texto(op === null || op === void 0 ? void 0 : op.type) === "upsert" || estadoOnline.syncTimers.has(ficha.sheetId);
        var sincronizado = Boolean(meta.lastHash && meta.lastHash === hashAtual && !pendenteReal);
        var phase = "idle";
        if (texto(meta.phase) === "conflict")
            phase = "conflict";
        else if (pendenteReal)
            phase = texto(meta.phase) === "syncing" ? "syncing" : "pending";
        else if (sincronizado || Number(meta.syncStatus || 0) === 1)
            phase = "synced";
        return {
            sheetId: ficha.sheetId,
            name: ficha.name,
            revision: Number(meta.revision || 0),
            syncStatus: phase === "synced" ? 1 : 0,
            phase: phase,
            pendingMode: pendenteReal ? texto(meta.pendingMode) : "",
            lastSyncedAt: Number(meta.lastSyncedAt || 0),
            statusUpdatedAt: Number(meta.statusUpdatedAt || 0)
        };
    }
    function marcarFichaPendente(localSheetName, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.motivo, motivo = _c === void 0 ? "alteracao" : _c, _d = _b.modo, modo = _d === void 0 ? "imediato" : _d;
        if (!estadoOnline.user || estadoOnline.user.anonymous || !estadoOnline.configurado)
            return null;
        var ficha = fichaLocalSolicitada(localSheetName);
        if (!ficha || fichaBloqueadaNuvem(ficha))
            return null;
        estadoOnline.dirtySheets.add(ficha.sheetId);
        adicionarOutbox(ficha.sheetId, "upsert", { name: ficha.name, reason: texto(motivo), mode: texto(modo) || "imediato" });
        limparAgendamentoSync(ficha.sheetId);
        return definirStatusSync(ficha.sheetId, 0, "pending", { pendingMode: texto(modo) || "imediato", pendingReason: texto(motivo) });
    }
    function limparAgendamentoSync(sheetId) {
        var id = texto(sheetId);
        if (!id)
            return;
        var timer = estadoOnline.syncTimers.get(id);
        if (timer)
            clearTimeout(timer);
        estadoOnline.syncTimers.delete(id);
    }
    function marcarFichaLimpa(sheetId) {
        var id = texto(sheetId);
        if (!id)
            return;
        limparAgendamentoSync(id);
        estadoOnline.dirtySheets.delete(id);
        removerOutbox(id, { somenteTipo: "upsert" });
        definirStatusSync(id, 1, "synced", { pendingMode: "", pendingReason: "" });
    }
    function nomeLocalDisponivel(base) {
        var limpar = typeof window.limparNomeFicha === "function"
            ? window.limparNomeFicha
            : function (valor) { return texto(valor).slice(0, 32) || "Principal"; };
        var nomes = new Set(listarFichasLocais().map(function (f) { return f.name; }));
        var nomeBase = limpar(base || "Ficha da nuvem");
        if (!nomes.has(nomeBase))
            return nomeBase;
        var sufixoBase = limpar("".concat(nomeBase, " Nuvem"));
        if (!nomes.has(sufixoBase))
            return sufixoBase;
        var indice = 2;
        while (indice < 1000) {
            var candidato = limpar("".concat(nomeBase, " Nuvem ").concat(indice));
            if (!nomes.has(candidato))
                return candidato;
            indice += 1;
        }
        return limpar("Nuvem ".concat(Date.now().toString(36)));
    }
    function vincularFichaAusenteDaNuvem(sheetId, cloud, _a) {
        var _b;
        var _c = _a === void 0 ? {} : _a, _d = _c.groupIds, groupIds = _d === void 0 ? [] : _d;
        if (!(cloud === null || cloud === void 0 ? void 0 : cloud.data))
            return { linked: false };
        var locais = prepararCopiasLocaisLegadas();
        var existente = locais.find(function (f) { return f.sheetId === sheetId; });
        if (existente)
            return { linked: true, localName: existente.name, reusedLocal: true, divergent: false, alreadyLinked: true };
        var uid = uidContaAtiva();
        /* v2.5.8.137 — sheetId é a identidade autoritativa do backup.
           Nunca transformamos uma ficha local já existente em outra ficha remota
           só porque nome ou characterId coincidem: ambos já puderam ser herdados
           por cópias defeituosas em versões antigas. */
        var placeholder = null;
        if (texto(cloud.name) === "Principal") {
            var principal = locais.find(function (local) { return local.name === "Principal"; });
            if (principal && !fichaBloqueadaNuvem(principal)) {
                var meta = estadoSync()[principal.sheetId] || {};
                var semHistorico = !texto(meta.lastHash) && Number(meta.revision || 0) === 0;
                var onlineLocal = ((_b = principal.data) === null || _b === void 0 ? void 0 : _b.__online) || {};
                var semVinculoRemoto = !texto(onlineLocal.ownerUid) && !texto(onlineLocal.characterId) && !texto(onlineLocal.realtimeId);
                if (semHistorico && semVinculoRemoto && pontuacaoConteudoFicha(principal.data) <= 4)
                    placeholder = principal;
            }
        }
        if (placeholder) {
            var antigoId = placeholder.sheetId;
            /* O slot Principal está vazio: copiamos o snapshot remoto inteiro, em vez
               de preservar a identidade aleatória do placeholder. */
            var data_1 = clonar(cloud.data || {});
            data_1.__online = data_1.__online && typeof data_1.__online === "object" ? data_1.__online : {};
            data_1.__online.sheetId = sheetId;
            data_1.__online.ownerUid = uid;
            data_1.__online.identityVersion = 2;
            data_1.__online.originKey = data_1.__online.originKey || chaveIdentidadeFicha(placeholder.name);
            data_1.__online.name = placeholder.name;
            delete data_1.__online.syncDisabled;
            delete data_1.__online.legacyAutoCopy;
            localStorage.setItem(placeholder.key, JSON.stringify(data_1));
            if (fichaAtivaNomeSeguro() === placeholder.name) {
                try {
                    if (typeof window.estado !== "undefined")
                        window.estado = clonar(data_1);
                }
                catch (_erro) { }
            }
            var sync = estadoSync();
            var metaAntiga = sync[antigoId] || {};
            if (antigoId !== sheetId)
                delete sync[antigoId];
            sync[sheetId] = __assign(__assign({}, metaAntiga), { revision: Number(cloud.revision || 0), lastHash: hashFicha(data_1), lastSyncedAt: Number(cloud.updatedAt || agora()), deviceId: texto(cloud.deviceId), syncStatus: 1, phase: "synced", pendingMode: "", pendingReason: "", statusUpdatedAt: agora() });
            gravarEstadoSync(sync);
            estadoOnline.dirtySheets.delete(antigoId);
            estadoOnline.dirtySheets.delete(sheetId);
            removerOutbox(antigoId, {});
            emitir("ficha-vinculada-nuvem", {
                sheetId: sheetId,
                name: placeholder.name, characterName: texto(data_1.nome) || texto(cloud.characterName) || placeholder.name,
                revision: Number(cloud.revision || 0), reusedLocal: true, placeholder: true, divergent: false, oldSheetId: antigoId
            });
            return { linked: true, localName: placeholder.name, reusedLocal: true, placeholder: true, divergent: false, oldSheetId: antigoId };
        }
        var data = clonar(cloud.data || {});
        var nomeCloud = texto(cloud.name) || texto(cloud.characterName) || "Ficha da nuvem";
        var nome = nomeLocalDisponivel(nomeCloud);
        data.__online = data.__online && typeof data.__online === "object" ? data.__online : {};
        data.__online.sheetId = sheetId;
        data.__online.ownerUid = uid;
        data.__online.identityVersion = 2;
        data.__online.originKey = data.__online.originKey || chaveIdentidadeFicha(nome);
        data.__online.name = nome;
        delete data.__online.syncDisabled;
        delete data.__online.legacyAutoCopy;
        var chave = nome === "Principal" ? "ficha_ninja_app_v2" : "ficha_ninja_app_v2__".concat(nome);
        localStorage.setItem(chave, JSON.stringify(data));
        var listaAtual = lerJson("ficha_ninja_lista_v1", ["Principal"]);
        var lista = Array.from(new Set(__spreadArray(__spreadArray([], __read((Array.isArray(listaAtual) ? listaAtual : ["Principal"])), false), [nome], false)));
        localStorage.setItem("ficha_ninja_lista_v1", JSON.stringify(lista));
        atualizarMetaSync(sheetId, cloud, hashFicha(data));
        try {
            if (Array.isArray(window.fichas) && !window.fichas.includes(nome))
                window.fichas.push(nome);
            if (typeof window.atualizarListaFichas === "function")
                window.atualizarListaFichas();
        }
        catch (_erro) { }
        emitir("ficha-vinculada-nuvem", {
            sheetId: sheetId,
            name: nome, characterName: texto(data.nome) || texto(cloud.characterName) || nome,
            revision: Number(cloud.revision || 0), reusedLocal: false, divergent: false
        });
        return { linked: true, localName: nome, reusedLocal: false, divergent: false };
    }
    function atualizarMetaSync(sheetId, cloud, dataHash) {
        var sync = estadoSync();
        sync[sheetId] = __assign(__assign({}, (sync[sheetId] || {})), { revision: Number((cloud === null || cloud === void 0 ? void 0 : cloud.revision) || 0), lastHash: dataHash || hashFicha((cloud === null || cloud === void 0 ? void 0 : cloud.data) || {}), lastSyncedAt: Number((cloud === null || cloud === void 0 ? void 0 : cloud.updatedAt) || agora()), deviceId: texto(cloud === null || cloud === void 0 ? void 0 : cloud.deviceId), syncStatus: 1, phase: "synced", pendingMode: "", pendingReason: "", statusUpdatedAt: agora() });
        gravarEstadoSync(sync);
    }
    function aplicarFichaDaNuvemNoLocal(sheetId_1, cloud_1, local_1) {
        return __awaiter(this, arguments, void 0, function (sheetId, cloud, local, _a) {
            var _erro_12, data, ativa, hash;
            var _b = _a === void 0 ? {} : _a, _c = _b.motivo, motivo = _c === void 0 ? "atualizacao-remota" : _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!local || !cloud)
                            return [2 /*return*/, false];
                        if (alteracaoPareceEsvaziamento(local.data, cloud.data)) {
                            definirStatusSync(sheetId, 0, "conflict", { pendingMode: "imediato", pendingReason: "protecao-contra-esvaziamento" });
                            emitir("conflito-ficha", { sheetId: sheetId, local: local, cloud: cloud, reason: "incoming-data-loss" });
                            return [2 /*return*/, false];
                        }
                        if (!(pontuacaoConteudoFicha(local.data) >= 8)) return [3 /*break*/, 4];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, criarBackupFicha(local, { reason: "antes-".concat(motivo), revision: Number((estadoSync()[sheetId] || {}).revision || 0) })];
                    case 2:
                        _d.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _erro_12 = _d.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        data = clonar(cloud.data || {});
                        data.__online = data.__online && typeof data.__online === "object" ? data.__online : {};
                        data.__online.sheetId = sheetId;
                        data.__online.ownerUid = uidContaAtiva();
                        data.__online.identityVersion = 2;
                        data.__online.originKey = data.__online.originKey || chaveIdentidadeFicha(local.name);
                        data.__online.name = local.name;
                        delete data.__online.syncDisabled;
                        delete data.__online.legacyAutoCopy;
                        ativa = fichaAtivaNomeSeguro() === local.name;
                        localStorage.setItem(local.key, JSON.stringify(data));
                        hash = hashFicha(data);
                        atualizarMetaSync(sheetId, cloud, hash);
                        /* Não consulte fichaAtualLocal() entre gravar o remoto e atualizar o estado
                           global: essa função lê window.estado e, se ele ainda estiver antigo, pode
                           gravar a versão velha de volta por cima da versão recém-recebida. */
                        if (ativa)
                            aplicarEstadoGlobalDaFicha(local.name, local.key, data);
                        emitir("ficha-atualizada-nuvem", {
                            sheetId: sheetId,
                            name: local.name, characterName: texto(data.nome) || local.characterName || local.name,
                            revision: Number(cloud.revision || 0), active: ativa
                        });
                        return [2 /*return*/, true];
                }
            });
        });
    }
    function arquivarDuplicataNuvem(canonicoId, duplicata) {
        return __awaiter(this, void 0, void 0, function () {
            var api, uid, id, sync, erro_11;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        api = estadoOnline.api, uid = (_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid;
                        if (!api || !uid || !(duplicata === null || duplicata === void 0 ? void 0 : duplicata.sheetId) || !(duplicata === null || duplicata === void 0 ? void 0 : duplicata.cloud))
                            return [2 /*return*/, false];
                        id = "".concat(agora(), "_duplicata_").concat(slug(duplicata.sheetId).slice(-28));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, api.set(api.ref(estadoOnline.db, "sheetBackups/".concat(uid, "/").concat(canonicoId, "/").concat(id)), {
                                name: duplicata.cloud.name || "Ficha", characterName: duplicata.cloud.characterName || "",
                                revision: Number(duplicata.cloud.revision || 0), createdAt: agora(), reason: "duplicata-automatica-legada",
                                sourceSheetId: duplicata.sheetId, data: duplicata.cloud.data || {}
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, aplicarRetencaoBackups(canonicoId)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, api.remove(api.ref(estadoOnline.db, "userSheets/".concat(uid, "/").concat(duplicata.sheetId)))];
                    case 4:
                        _b.sent();
                        sync = estadoSync();
                        delete sync[duplicata.sheetId];
                        gravarEstadoSync(sync);
                        estadoOnline.dirtySheets.delete(duplicata.sheetId);
                        limparAgendamentoSync(duplicata.sheetId);
                        emitir("duplicata-nuvem-arquivada", { sheetId: duplicata.sheetId, canonicalSheetId: canonicoId });
                        return [2 /*return*/, true];
                    case 5:
                        erro_11 = _b.sent();
                        emitir("erro-sync", { mensagem: erroAmigavel(erro_11), erro: erro_11 });
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    function limparDuplicatasNuvemSeguras(grupos) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, grupo, canonico, hashCanonico, _c, _d, duplicata, hashDuplicata, identica, muitoMaisVazia, copiaAutomatica, e_7_1, e_8_1;
            var e_8, _e, e_7, _f;
            var _g, _h, _j, _k, _l, _m;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        _o.trys.push([0, 11, 12, 13]);
                        _a = __values(grupos || []), _b = _a.next();
                        _o.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 10];
                        grupo = _b.value;
                        canonico = grupo.canonico;
                        if (!canonico)
                            return [3 /*break*/, 9];
                        hashCanonico = hashFichaSemVinculo(((_g = canonico.cloud) === null || _g === void 0 ? void 0 : _g.data) || {});
                        _o.label = 2;
                    case 2:
                        _o.trys.push([2, 7, 8, 9]);
                        _c = (e_7 = void 0, __values(grupo.duplicatas || [])), _d = _c.next();
                        _o.label = 3;
                    case 3:
                        if (!!_d.done) return [3 /*break*/, 6];
                        duplicata = _d.value;
                        hashDuplicata = hashFichaSemVinculo(((_h = duplicata.cloud) === null || _h === void 0 ? void 0 : _h.data) || {});
                        identica = hashCanonico === hashDuplicata;
                        muitoMaisVazia = alteracaoPareceEsvaziamento((_j = canonico.cloud) === null || _j === void 0 ? void 0 : _j.data, (_k = duplicata.cloud) === null || _k === void 0 ? void 0 : _k.data);
                        copiaAutomatica = ehNomeCopiaAutomatica((_l = duplicata.cloud) === null || _l === void 0 ? void 0 : _l.name) || ehNomeCopiaAutomatica((_m = canonico.cloud) === null || _m === void 0 ? void 0 : _m.name);
                        if (!identica && !muitoMaisVazia && !copiaAutomatica)
                            return [3 /*break*/, 5];
                        return [4 /*yield*/, arquivarDuplicataNuvem(canonico.sheetId, duplicata)];
                    case 4:
                        _o.sent();
                        _o.label = 5;
                    case 5:
                        _d = _c.next();
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_7_1 = _o.sent();
                        e_7 = { error: e_7_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (_d && !_d.done && (_f = _c.return)) _f.call(_c);
                        }
                        finally { if (e_7) throw e_7.error; }
                        return [7 /*endfinally*/];
                    case 9:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 10: return [3 /*break*/, 13];
                    case 11:
                        e_8_1 = _o.sent();
                        e_8 = { error: e_8_1 };
                        return [3 /*break*/, 13];
                    case 12:
                        try {
                            if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                        }
                        finally { if (e_8) throw e_8.error; }
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        });
    }
    function registrarExclusaoLocal(nomeFicha, dados) {
        var _a, _b, _c;
        var data = dados && typeof dados === "object" ? dados : {};
        var sheetId = texto((_a = data === null || data === void 0 ? void 0 : data.__online) === null || _a === void 0 ? void 0 : _a.sheetId);
        var ownerUid = texto((_b = data === null || data === void 0 ? void 0 : data.__online) === null || _b === void 0 ? void 0 : _b.ownerUid) || uidContaAtiva();
        if (!sheetId || !ownerUid)
            return false;
        var meta = estadoSync(ownerUid)[sheetId] || {};
        adicionarOutbox(sheetId, "delete", {
            name: texto(nomeFicha) || texto((_c = data === null || data === void 0 ? void 0 : data.__online) === null || _c === void 0 ? void 0 : _c.name) || "Ficha",
            characterName: texto(data === null || data === void 0 ? void 0 : data.nome),
            baseRevision: Number(meta.revision || 0),
            requestedAt: agora()
        }, ownerUid);
        if (ownerUid === uidContaAtiva())
            setTimeout(function () { return processarExclusoesPendentes().catch(function () { }); }, 0);
        return true;
    }
    function processarExclusoesPendentes() {
        return __awaiter(this, void 0, void 0, function () {
            var uid, api, outbox, resultados, _loop_3, _a, _b, op, e_9_1;
            var e_9, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        uid = uidContaAtiva();
                        if (!uid || !estadoOnline.api || !estadoOnline.db)
                            return [2 /*return*/, []];
                        api = estadoOnline.api, outbox = estadoOutbox(uid), resultados = [];
                        _loop_3 = function (op) {
                            var sheetId, refFicha, jaExcluida_1, resultado, sync, erro_12;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        if (texto(op === null || op === void 0 ? void 0 : op.type) !== "delete" || !texto(op === null || op === void 0 ? void 0 : op.sheetId))
                                            return [2 /*return*/, "continue"];
                                        sheetId = texto(op.sheetId);
                                        _e.label = 1;
                                    case 1:
                                        _e.trys.push([1, 3, , 4]);
                                        refFicha = api.ref(estadoOnline.db, "userSheets/".concat(uid, "/").concat(sheetId));
                                        jaExcluida_1 = false;
                                        return [4 /*yield*/, api.runTransaction(refFicha, function (atual) {
                                                if ((atual === null || atual === void 0 ? void 0 : atual.deleted) === true) {
                                                    jaExcluida_1 = true;
                                                    return;
                                                }
                                                var revision = atual ? Number(atual.revision || 0) + 1 : 1;
                                                return {
                                                    name: texto(atual === null || atual === void 0 ? void 0 : atual.name) || texto(op.name) || "Ficha",
                                                    characterName: texto(atual === null || atual === void 0 ? void 0 : atual.characterName) || texto(op.characterName),
                                                    revision: revision,
                                                    updatedAt: api.serverTimestamp(), deviceId: obterDeviceId(),
                                                    deleted: true, deletedAt: api.serverTimestamp(), appVersion: texto(window.APP_VERSION)
                                                };
                                            }, { applyLocally: false })];
                                    case 2:
                                        resultado = _e.sent();
                                        if (resultado.committed || jaExcluida_1) {
                                            removerOutbox(sheetId, {}, uid);
                                            sync = estadoSync(uid);
                                            delete sync[sheetId];
                                            gravarEstadoSync(sync, uid);
                                            estadoOnline.dirtySheets.delete(sheetId);
                                            resultados.push({ sheetId: sheetId, ok: true, alreadyDeleted: jaExcluida_1 });
                                        }
                                        return [3 /*break*/, 4];
                                    case 3:
                                        erro_12 = _e.sent();
                                        resultados.push({ sheetId: sheetId, ok: false, erro: erro_12 });
                                        emitir("erro-sync", { mensagem: erroAmigavel(erro_12), erro: erro_12 });
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, 7, 8]);
                        _a = __values(Object.values(outbox)), _b = _a.next();
                        _d.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        op = _b.value;
                        return [5 /*yield**/, _loop_3(op)];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_9_1 = _d.sent();
                        e_9 = { error: e_9_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_9) throw e_9.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, resultados];
                }
            });
        });
    }
    function excluirFichaDaNuvem(sheetId) {
        return __awaiter(this, void 0, void 0, function () {
            var uid, id, api, refFicha, resultado, valor, snap, sync;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        exigirContaGoogle();
                        uid = uidContaAtiva(), id = texto(sheetId);
                        if (!uid || !id)
                            throw new Error("Ficha da nuvem inválida.");
                        if (listarFichasLocais().some(function (f) { return texto(f.sheetId) === id; })) {
                            throw new Error("Esta ficha ainda existe neste aparelho. Exclua a ficha pelo gerenciador local para remover também a versão sincronizada.");
                        }
                        api = estadoOnline.api, refFicha = api.ref(estadoOnline.db, "userSheets/".concat(uid, "/").concat(id));
                        return [4 /*yield*/, api.runTransaction(refFicha, function (atual) {
                                if (!atual || atual.deleted === true)
                                    return;
                                return {
                                    name: texto(atual.name) || "Ficha",
                                    characterName: texto(atual.characterName),
                                    revision: Number(atual.revision || 0) + 1, updatedAt: api.serverTimestamp(), deviceId: obterDeviceId(),
                                    deleted: true, deletedAt: api.serverTimestamp(), appVersion: texto(window.APP_VERSION)
                                };
                            }, { applyLocally: false })];
                    case 1:
                        resultado = _e.sent();
                        valor = (_b = (_a = resultado.snapshot) === null || _a === void 0 ? void 0 : _a.val) === null || _b === void 0 ? void 0 : _b.call(_a);
                        if (!(!resultado.committed && (valor === null || valor === void 0 ? void 0 : valor.deleted) !== true)) return [3 /*break*/, 3];
                        return [4 /*yield*/, api.get(refFicha).catch(function () { return null; })];
                    case 2:
                        snap = _e.sent();
                        if (((_c = snap === null || snap === void 0 ? void 0 : snap.exists) === null || _c === void 0 ? void 0 : _c.call(snap)) && ((_d = snap.val()) === null || _d === void 0 ? void 0 : _d.deleted) !== true)
                            throw new Error("Não foi possível excluir esta ficha da nuvem.");
                        _e.label = 3;
                    case 3:
                        removerOutbox(id, {}, uid);
                        removerBackupEstruturalPendente(id, uid);
                        sync = estadoSync(uid);
                        delete sync[id];
                        gravarEstadoSync(sync, uid);
                        estadoOnline.dirtySheets.delete(id);
                        limparAgendamentoSync(id);
                        return [2 /*return*/, { ok: true, sheetId: id }];
                }
            });
        });
    }
    function aplicarExclusoesNuvem(valor) {
        var uid = uidContaAtiva();
        if (!uid)
            return false;
        var alterou = false;
        Object.entries(valor || {}).forEach(function (_a) {
            var _b = __read(_a, 2), sheetId = _b[0], cloud = _b[1];
            if ((cloud === null || cloud === void 0 ? void 0 : cloud.deleted) !== true)
                return;
            var local = listarFichasLocais().find(function (f) { return f.sheetId === sheetId; });
            if (local && local.name !== "Principal") {
                try {
                    localStorage.removeItem(local.key);
                }
                catch (_erro) { }
                try {
                    var lista = lerJson("ficha_ninja_lista_v1", ["Principal"]);
                    var nova = (Array.isArray(lista) ? lista : []).filter(function (nome) { return nome !== local.name; });
                    if (!nova.includes("Principal"))
                        nova.unshift("Principal");
                    localStorage.setItem("ficha_ninja_lista_v1", JSON.stringify(nova));
                    if (Array.isArray(window.fichas))
                        window.fichas = window.fichas.filter(function (nome) { return nome !== local.name; });
                    if (fichaAtivaNomeSeguro() === local.name) {
                        localStorage.setItem("ficha_ninja_ativa_v1", "Principal");
                        setTimeout(function () { return location.reload(); }, 80);
                    }
                    else if (typeof window.atualizarListaFichas === "function")
                        window.atualizarListaFichas();
                }
                catch (_erro) { }
                alterou = true;
            }
            var sync = estadoSync(uid);
            if (sync[sheetId]) {
                delete sync[sheetId];
                gravarEstadoSync(sync, uid);
            }
            removerOutbox(sheetId, {}, uid);
            estadoOnline.dirtySheets.delete(sheetId);
            limparAgendamentoSync(sheetId);
        });
        return alterou;
    }
    function processarAtualizacoesNuvem(valor) {
        return __awaiter(this, void 0, void 0, function () {
            var locais, sync, grupos, _loop_4, grupos_2, grupos_2_1, grupo, e_10_1;
            var e_10, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!estadoOnline.user || estadoOnline.user.anonymous)
                            return [2 /*return*/];
                        aplicarExclusoesNuvem(valor);
                        locais = prepararCopiasLocaisLegadas();
                        sync = estadoSync();
                        grupos = agruparRegistrosNuvem(valor);
                        _loop_4 = function (grupo) {
                            var registro, sheetId, cloud, local, vinculo, cloudRevision, localHash, cloudHash, meta, localRevision, baseHash, localFoiAlterado;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        registro = grupo.canonico;
                                        if (!registro)
                                            return [2 /*return*/, "continue"];
                                        sheetId = registro.sheetId, cloud = registro.cloud;
                                        local = locais.find(function (f) { return f.sheetId === sheetId; });
                                        vinculo = null;
                                        if (!local) {
                                            vinculo = vincularFichaAusenteDaNuvem(sheetId, cloud, { groupIds: grupo.itens.map(function (item) { return item.sheetId; }) });
                                            locais = prepararCopiasLocaisLegadas();
                                            local = locais.find(function (f) { return f.sheetId === sheetId; });
                                            if (!local)
                                                return [2 /*return*/, "continue"];
                                        }
                                        cloudRevision = Number((cloud === null || cloud === void 0 ? void 0 : cloud.revision) || 0);
                                        localHash = hashFicha(local.data || {});
                                        cloudHash = hashFicha((cloud === null || cloud === void 0 ? void 0 : cloud.data) || {});
                                        meta = sync[sheetId] || estadoSync()[sheetId] || {};
                                        localRevision = Number(meta.revision || 0);
                                        if (cloudRevision <= localRevision) {
                                            if (localHash === cloudHash) {
                                                atualizarMetaSync(sheetId, cloud, cloudHash);
                                                marcarFichaLimpa(sheetId);
                                            }
                                            return [2 /*return*/, "continue"];
                                        }
                                        if (localHash === cloudHash) {
                                            atualizarMetaSync(sheetId, cloud, cloudHash);
                                            marcarFichaLimpa(sheetId);
                                            return [2 /*return*/, "continue"];
                                        }
                                        baseHash = texto(meta.lastHash);
                                        localFoiAlterado = Boolean(baseHash && localHash !== baseHash);
                                        if (localFoiAlterado) {
                                            definirStatusSync(sheetId, 0, "conflict", { pendingMode: "imediato", pendingReason: "alteracoes-nos-dois-aparelhos" });
                                            emitir("conflito-ficha", { sheetId: sheetId, local: local, cloud: cloud, reason: "both-changed" });
                                            return [2 /*return*/, "continue"];
                                        }
                                        if (alteracaoPareceEsvaziamento(local.data, cloud.data)) {
                                            definirStatusSync(sheetId, 0, "conflict", { pendingMode: "imediato", pendingReason: "protecao-contra-esvaziamento" });
                                            emitir("conflito-ficha", { sheetId: sheetId, local: local, cloud: cloud, reason: "incoming-data-loss" });
                                            return [2 /*return*/, "continue"];
                                        }
                                        return [4 /*yield*/, aplicarFichaDaNuvemNoLocal(sheetId, cloud, local)];
                                    case 1:
                                        if (_c.sent()) {
                                            marcarFichaLimpa(sheetId);
                                            locais = prepararCopiasLocaisLegadas();
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        grupos_2 = __values(grupos), grupos_2_1 = grupos_2.next();
                        _b.label = 2;
                    case 2:
                        if (!!grupos_2_1.done) return [3 /*break*/, 5];
                        grupo = grupos_2_1.value;
                        return [5 /*yield**/, _loop_4(grupo)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        grupos_2_1 = grupos_2.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_10_1 = _b.sent();
                        e_10 = { error: e_10_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (grupos_2_1 && !grupos_2_1.done && (_a = grupos_2.return)) _a.call(grupos_2);
                        }
                        finally { if (e_10) throw e_10.error; }
                        return [7 /*endfinally*/];
                    case 8: return [4 /*yield*/, limparDuplicatasNuvemSeguras(grupos)];
                    case 9:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function observarFichasNuvem() {
        var _a;
        if (!estadoOnline.user)
            return;
        (_a = estadoOnline.unsubscribeFichas) === null || _a === void 0 ? void 0 : _a.call(estadoOnline);
        estadoOnline.unsubscribeFichas = null;
        if (estadoOnline.user.anonymous) {
            estadoOnline.fichasNuvem = [];
            emitir("fichas-nuvem", snapshot());
            return;
        }
        var api = estadoOnline.api;
        var uidObservado = texto(estadoOnline.user.uid);
        estadoOnline.unsubscribeFichas = api.onValue(api.ref(estadoOnline.db, "userSheets/".concat(uidObservado)), function (snap) {
            var _a;
            /* userSheets é backup/recuperação. Abrir a área de nuvem só lista
               backups; nunca aplica, reconcilia ou envia fichas automaticamente. */
            if (!uidObservado || texto((_a = estadoOnline.user) === null || _a === void 0 ? void 0 : _a.uid) !== uidObservado)
                return;
            var valor = snap.val() || {};
            var locais = listarFichasLocais();
            estadoOnline.fichasNuvem = Object.entries(valor)
                .filter(function (_a) {
                var _b = __read(_a, 2), f = _b[1];
                return (f === null || f === void 0 ? void 0 : f.deleted) !== true;
            })
                .map(function (_a) {
                var _b = __read(_a, 2), id = _b[0], f = _b[1];
                return ({
                    id: id,
                    name: (f === null || f === void 0 ? void 0 : f.name) || (f === null || f === void 0 ? void 0 : f.characterName) || "Ficha",
                    characterName: (f === null || f === void 0 ? void 0 : f.characterName) || "",
                    revision: Number((f === null || f === void 0 ? void 0 : f.revision) || 0),
                    updatedAt: Number((f === null || f === void 0 ? void 0 : f.updatedAt) || 0),
                    deviceId: texto(f === null || f === void 0 ? void 0 : f.deviceId),
                    linked: locais.some(function (local) { return local.sheetId === id; })
                });
            })
                .sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
            emitir("fichas-nuvem", snapshot());
        }, function (erro) { return emitir("erro-sync", { mensagem: erroAmigavel(erro), erro: erro }); });
    }
    function ativarBackupsNuvem() {
        if (!estadoOnline.user || estadoOnline.user.anonymous)
            return snapshot();
        observarFichasNuvem();
        return snapshot();
    }
    function garantirIdentidadeFichaRealtime(localSheetName) {
        var _a;
        if (!estadoOnline.user || estadoOnline.user.anonymous)
            return null;
        var uid = texto(estadoOnline.user.uid);
        var ativo = fichaAtivaNomeSeguro();
        var nome = texto(localSheetName) || ativo || "Principal";
        /* Realtime não percorre a biblioteca de fichas. Ele cria/recupera uma
           identidade própria apenas para a ficha solicitada (normalmente a ativa),
           independente do sheetId legado usado por backup/restauração. */
        var chave = nome === "Principal" ? "ficha_ninja_app_v2" : "ficha_ninja_app_v2__".concat(nome);
        var dados = null;
        try {
            var bruto = localStorage.getItem(chave);
            if (bruto) {
                var lido = JSON.parse(bruto);
                if (lido && typeof lido === "object" && !Array.isArray(lido))
                    dados = lido;
            }
        }
        catch (_erro) {
            dados = null;
        }
        if (!dados && nome === ativo) {
            try {
                if (typeof window.estado !== "undefined" && window.estado && typeof window.estado === "object")
                    dados = clonar(window.estado);
            }
            catch (_erro) { }
        }
        if (!dados)
            return null;
        dados = garantirMetadadosFichaLocal(nome, dados);
        dados.__online = dados.__online && typeof dados.__online === "object" ? dados.__online : {};
        var resolvedor = (_a = window.EkoCharacterIdentity) === null || _a === void 0 ? void 0 : _a.resolveCharacterIdentity;
        var resolvida = typeof resolvedor === "function" ? resolvedor({
            uid: uid,
            name: nome,
            characterId: texto(dados.__online.characterId),
            characterOwnerUid: texto(dados.__online.characterOwnerUid),
            realtimeId: texto(dados.__online.realtimeId),
            realtimeOwnerUid: texto(dados.__online.realtimeOwnerUid),
            /* O fallback usa o sheetId persistente, nunca o nome da ficha. */
            deterministicId: function () { return characterIdPorSheetId(uid, dados.__online.sheetId); }
        }) : null;
        var realtimeId = texto(resolvida === null || resolvida === void 0 ? void 0 : resolvida.realtimeId) || texto(dados.__online.realtimeId) || characterIdPorSheetId(uid, dados.__online.sheetId);
        var characterId = texto(resolvida === null || resolvida === void 0 ? void 0 : resolvida.characterId) || realtimeId;
        dados.__online.characterId = characterId;
        dados.__online.characterOwnerUid = uid;
        dados.__online.characterIdentityVersion = 1;
        dados.__online.realtimeId = realtimeId;
        dados.__online.realtimeOwnerUid = uid;
        dados.__online.realtimeIdentityVersion = 2;
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
            if (nome === ativo && typeof window.estado !== "undefined" && window.estado && typeof window.estado === "object") {
                window.estado.__online = clonar(dados.__online);
            }
        }
        catch (_erro) { }
        return {
            name: nome, key: chave, sheetId: texto(dados.__online.sheetId),
            characterId: characterId,
            realtimeId: realtimeId,
            level: Number(dados.nivel || 1), characterName: texto(dados.nome) || nome,
            data: dados, storageExists: true, syncDisabled: fichaBloqueadaNuvem(dados)
        };
    }
    function criarBackupRegistroNuvem(sheetId_1, cloud_1) {
        return __awaiter(this, arguments, void 0, function (sheetId, cloud, _a) {
            var api, uid, id;
            var _b = _a === void 0 ? {} : _a, _c = _b.reason, reason = _c === void 0 ? "antes-sobrescrever-nuvem" : _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(cloud === null || cloud === void 0 ? void 0 : cloud.data) || !estadoOnline.user || estadoOnline.user.anonymous)
                            return [2 /*return*/, false];
                        api = estadoOnline.api, uid = estadoOnline.user.uid;
                        id = "".concat(agora(), "_").concat(slug(reason));
                        return [4 /*yield*/, api.set(api.ref(estadoOnline.db, "sheetBackups/".concat(uid, "/").concat(sheetId, "/").concat(id)), {
                                name: cloud.name || "Ficha", characterName: cloud.characterName || "", revision: Number(cloud.revision || 0),
                                createdAt: agora(),
                                reason: reason,
                                data: cloud.data, sourceDeviceId: texto(cloud.deviceId)
                            })];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, aplicarRetencaoBackups(sheetId)];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    }
    function sincronizarFichaDireta(localSheetName_1) {
        return __awaiter(this, arguments, void 0, function (localSheetName, _a) {
            var ficha, ownerUid, api, uid, sheetId, sync, meta, data, conteudoHash, realtimeId, realtimeWatermark, refFicha, antes, _erro_13, conflito, resultado, motivoConflito, salvo;
            var _b, _c, _d, _e, _f, _g;
            var _h = _a === void 0 ? {} : _a, _j = _h.force, force = _j === void 0 ? false : _j, _k = _h.backup, backup = _k === void 0 ? false : _k, _l = _h.motivo, motivo = _l === void 0 ? "autosave" : _l;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        exigirContaGoogle();
                        capturarEstadoAtualAntesDaSincronizacao(localSheetName);
                        prepararIdentidadeFichaParaConta(localSheetName);
                        ficha = fichaLocalSolicitada(localSheetName);
                        if (!ficha)
                            throw new Error("Ficha local não encontrada.");
                        ownerUid = texto((_c = (_b = ficha.data) === null || _b === void 0 ? void 0 : _b.__online) === null || _c === void 0 ? void 0 : _c.ownerUid);
                        if (ownerUid && ownerUid !== uidContaAtiva())
                            throw new Error("Esta ficha local pertence a outra Conta Google neste aparelho.");
                        if (fichaBloqueadaNuvem(ficha)) {
                            return [2 /*return*/, { skipped: true, legacyRecovery: true, reason: "copia-automatica-legada" }];
                        }
                        api = estadoOnline.api, uid = estadoOnline.user.uid, sheetId = ficha.sheetId;
                        definirStatusSync(sheetId, 0, "syncing", { pendingReason: texto(motivo) });
                        sync = estadoSync(), meta = sync[sheetId] || {};
                        data = garantirMetadadosFichaLocal(ficha.name, ficha.data);
                        conteudoHash = hashFicha(data);
                        realtimeId = texto(((_d = data.__online) === null || _d === void 0 ? void 0 : _d.characterId) || ((_e = data.__online) === null || _e === void 0 ? void 0 : _e.realtimeId));
                        realtimeWatermark = Math.max(0, Number(((_g = (_f = window.EkoRealtimeSync) === null || _f === void 0 ? void 0 : _f.maiorEditAtConhecido) === null || _g === void 0 ? void 0 : _g.call(_f, realtimeId)) || 0));
                        if (!force && meta.lastHash === conteudoHash) {
                            marcarFichaLimpa(sheetId);
                            return [2 /*return*/, { skipped: true }];
                        }
                        refFicha = api.ref(estadoOnline.db, "userSheets/".concat(uid, "/").concat(sheetId));
                        if (!force) return [3 /*break*/, 6];
                        _m.label = 1;
                    case 1:
                        _m.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, api.get(refFicha)];
                    case 2:
                        antes = _m.sent();
                        if (!antes.exists()) return [3 /*break*/, 4];
                        return [4 /*yield*/, criarBackupRegistroNuvem(sheetId, antes.val(), { reason: "antes-forcar-versao-local" })];
                    case 3:
                        _m.sent();
                        _m.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        _erro_13 = _m.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        conflito = null;
                        return [4 /*yield*/, api.runTransaction(refFicha, function (atual) {
                                var cloudRevision = Number((atual === null || atual === void 0 ? void 0 : atual.revision) || 0);
                                var baseRevision = Number(meta.revision || 0);
                                if (!force && (atual === null || atual === void 0 ? void 0 : atual.deleted) === true) {
                                    conflito = { cloudRevision: cloudRevision, baseRevision: baseRevision, cloud: atual, reason: "deleted-remotely" };
                                    return;
                                }
                                if (!force && atual && alteracaoPareceEsvaziamento(atual.data, data)) {
                                    conflito = { cloudRevision: cloudRevision, baseRevision: baseRevision, cloud: atual, reason: "outgoing-data-loss" };
                                    return;
                                }
                                var hashCloudAtual = (atual === null || atual === void 0 ? void 0 : atual.data) ? hashFicha(atual.data) : "";
                                if (!force && atual && cloudRevision > baseRevision && hashCloudAtual !== texto(meta.lastHash)) {
                                    conflito = { cloudRevision: cloudRevision, baseRevision: baseRevision, cloud: atual, reason: "revision-conflict" };
                                    return;
                                }
                                var cloudWatermark = Math.max(0, Number((atual === null || atual === void 0 ? void 0 : atual.realtimeWatermark) || 0));
                                if (cloudWatermark > realtimeWatermark) {
                                    conflito = { cloudRevision: cloudRevision, baseRevision: baseRevision, cloud: atual, reason: "realtime-newer" };
                                    return;
                                }
                                var revision = cloudRevision + 1;
                                return {
                                    name: ficha.name, characterName: texto(data.nome) || ficha.name,
                                    revision: revision,
                                    updatedAt: api.serverTimestamp(),
                                    deviceId: obterDeviceId(), hash: conteudoHash, appVersion: window.APP_VERSION || "", deleted: false,
                                    realtimeWatermark: realtimeWatermark,
                                    data: data
                                };
                            }, { applyLocally: false })];
                    case 7:
                        resultado = _m.sent();
                        if (!resultado.committed) {
                            if (conflito) {
                                motivoConflito = conflito.reason === "outgoing-data-loss" ? "protecao-contra-esvaziamento" : "conflito";
                                definirStatusSync(sheetId, 0, "conflict", { pendingMode: "imediato", pendingReason: motivoConflito });
                                emitir("conflito-ficha", { sheetId: sheetId, local: ficha, cloud: conflito.cloud, reason: conflito.reason || "conflict" });
                                return [2 /*return*/, __assign({ conflict: true }, conflito)];
                            }
                            definirStatusSync(sheetId, 0, "pending", { pendingReason: "transacao-nao-concluida" });
                            throw new Error("A sincronização da ficha não foi concluída.");
                        }
                        salvo = resultado.snapshot.val();
                        if (!(salvo === null || salvo === void 0 ? void 0 : salvo.data) || texto(salvo.hash) !== conteudoHash) {
                            definirStatusSync(sheetId, 0, "pending", { pendingReason: "confirmacao-incompleta" });
                            throw new Error("A nuvem não confirmou o conteúdo completo da ficha. Tente sincronizar novamente.");
                        }
                        sync[sheetId] = __assign(__assign({}, (sync[sheetId] || {})), { revision: salvo.revision, lastHash: salvo.hash, lastSyncedAt: Number(salvo.updatedAt) || agora(), deviceId: salvo.deviceId, syncStatus: 1, phase: "synced", pendingMode: "", pendingReason: "", statusUpdatedAt: agora() });
                        gravarEstadoSync(sync);
                        marcarFichaLimpa(sheetId);
                        if (!backup) return [3 /*break*/, 9];
                        return [4 /*yield*/, criarBackupFicha(ficha, { reason: motivo, revision: salvo.revision })];
                    case 8:
                        _m.sent();
                        _m.label = 9;
                    case 9:
                        emitir("ficha-sincronizada", { sheetId: sheetId, name: ficha.name, revision: salvo.revision });
                        return [2 /*return*/, { ok: true, revision: salvo.revision }];
                }
            });
        });
    }
    function sincronizarFicha(localSheetName, opcoes) {
        if (opcoes === void 0) { opcoes = {}; }
        exigirContaGoogle();
        var ficha = fichaLocalSolicitada(localSheetName);
        if (!ficha)
            return Promise.reject(new Error("Ficha local não encontrada."));
        if (fichaBloqueadaNuvem(ficha))
            return Promise.resolve({ skipped: true, legacyRecovery: true });
        var sheetId = ficha.sheetId;
        var anterior = estadoOnline.syncQueues.get(sheetId) || Promise.resolve();
        var tarefa = anterior.catch(function () { }).then(function () { return sincronizarFichaDireta(ficha.name, opcoes); }).catch(function (erro) {
            marcarFichaPendente(ficha.name, {
                motivo: texto(opcoes === null || opcoes === void 0 ? void 0 : opcoes.motivo) || "falha-sync",
                modo: texto(opcoes === null || opcoes === void 0 ? void 0 : opcoes.modo) || "imediato"
            });
            throw erro;
        });
        estadoOnline.syncQueues.set(sheetId, tarefa);
        tarefa.finally(function () {
            if (estadoOnline.syncQueues.get(sheetId) === tarefa)
                estadoOnline.syncQueues.delete(sheetId);
        }).catch(function () { });
        return tarefa;
    }
    function atualizarBackupEstrutural(localSheetName_1) {
        return __awaiter(this, arguments, void 0, function (localSheetName, _a) {
            var ficha, preparada, ownerUid, api, uid, sheetId, realtimeId, fichaAtiva, convergencia, data, conteudoHash, realtimeIdAtual, realtimeWatermark, refFicha, excluidaRemotamente, snapshotEstruturalMaisNovo, resultado, salvo;
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            var _p = _a === void 0 ? {} : _a, _q = _p.motivo, motivo = _q === void 0 ? "backup-automatico-estrutural" : _q;
            return __generator(this, function (_r) {
                switch (_r.label) {
                    case 0:
                        exigirContaGoogle();
                        ficha = fichaLocalSolicitada(localSheetName);
                        if (!ficha)
                            throw new Error("Ficha local não encontrada.");
                        if (fichaBloqueadaNuvem(ficha))
                            return [2 /*return*/, { skipped: true, legacyRecovery: true }];
                        preparada = prepararIdentidadeFichaParaConta(ficha.name);
                        if (preparada)
                            ficha = preparada;
                        if (fichaBloqueadaNuvem(ficha))
                            return [2 /*return*/, { skipped: true, legacyRecovery: true }];
                        ownerUid = texto((_c = (_b = ficha.data) === null || _b === void 0 ? void 0 : _b.__online) === null || _c === void 0 ? void 0 : _c.ownerUid);
                        if (ownerUid && ownerUid !== uidContaAtiva())
                            throw new Error("Esta ficha local pertence a outra Conta Google neste aparelho.");
                        api = estadoOnline.api, uid = estadoOnline.user.uid, sheetId = ficha.sheetId;
                        marcarBackupEstruturalPendente(ficha.name, sheetId, { motivo: motivo }, uid);
                        if (((_d = window.navigator) === null || _d === void 0 ? void 0 : _d.onLine) === false)
                            return [2 /*return*/, { queued: true, sheetId: sheetId }];
                        realtimeId = texto(((_f = (_e = ficha.data) === null || _e === void 0 ? void 0 : _e.__online) === null || _f === void 0 ? void 0 : _f.characterId) || ((_h = (_g = ficha.data) === null || _g === void 0 ? void 0 : _g.__online) === null || _h === void 0 ? void 0 : _h.realtimeId));
                        fichaAtiva = fichaAtivaNomeSeguro() === ficha.name;
                        if (!(fichaAtiva && realtimeId && typeof ((_j = window.EkoRealtimeSync) === null || _j === void 0 ? void 0 : _j.aguardarConvergenciaAtual) === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, window.EkoRealtimeSync.aguardarConvergenciaAtual({ timeoutMs: 8000 })];
                    case 1:
                        convergencia = _r.sent();
                        if ((convergencia === null || convergencia === void 0 ? void 0 : convergencia.ok) !== true) {
                            return [2 /*return*/, { queued: true, sheetId: sheetId, reason: texto(convergencia === null || convergencia === void 0 ? void 0 : convergencia.reason) || "realtime-nao-convergido" }];
                        }
                        _r.label = 2;
                    case 2:
                        capturarEstadoAtualAntesDaSincronizacao(ficha.name);
                        ficha = listarFichasLocais().find(function (f) { return f.name === ficha.name; }) || null;
                        if (!ficha || fichaBloqueadaNuvem(ficha))
                            return [2 /*return*/, { skipped: true, legacyRecovery: true }];
                        data = garantirMetadadosFichaLocal(ficha.name, ficha.data);
                        conteudoHash = hashFicha(data);
                        realtimeIdAtual = texto(((_k = data.__online) === null || _k === void 0 ? void 0 : _k.characterId) || ((_l = data.__online) === null || _l === void 0 ? void 0 : _l.realtimeId) || realtimeId);
                        realtimeWatermark = Math.max(0, Number(((_o = (_m = window.EkoRealtimeSync) === null || _m === void 0 ? void 0 : _m.maiorEditAtConhecido) === null || _o === void 0 ? void 0 : _o.call(_m, realtimeIdAtual)) || 0));
                        refFicha = api.ref(estadoOnline.db, "userSheets/".concat(uid, "/").concat(sheetId));
                        excluidaRemotamente = false;
                        snapshotEstruturalMaisNovo = false;
                        return [4 /*yield*/, api.runTransaction(refFicha, function (atual) {
                                if ((atual === null || atual === void 0 ? void 0 : atual.deleted) === true) {
                                    excluidaRemotamente = true;
                                    return;
                                }
                                var watermarkAtual = Math.max(0, Number((atual === null || atual === void 0 ? void 0 : atual.realtimeWatermark) || 0));
                                if (watermarkAtual > realtimeWatermark) {
                                    snapshotEstruturalMaisNovo = true;
                                    return;
                                }
                                var revision = Number((atual === null || atual === void 0 ? void 0 : atual.revision) || 0) + 1;
                                return {
                                    name: ficha.name, characterName: texto(data.nome) || ficha.name,
                                    revision: revision,
                                    updatedAt: api.serverTimestamp(),
                                    deviceId: obterDeviceId(), hash: conteudoHash, appVersion: window.APP_VERSION || "", deleted: false,
                                    realtimeWatermark: realtimeWatermark,
                                    data: data
                                };
                            }, { applyLocally: false })];
                    case 3:
                        resultado = _r.sent();
                        if (!resultado.committed) {
                            if (excluidaRemotamente) {
                                removerBackupEstruturalPendente(sheetId, uid);
                                return [2 /*return*/, { skipped: true, reason: "deleted-remotely", sheetId: sheetId }];
                            }
                            if (snapshotEstruturalMaisNovo) {
                                return [2 /*return*/, { queued: true, reason: "snapshot-estrutural-remoto-mais-novo", sheetId: sheetId }];
                            }
                            throw new Error("O backup estrutural não foi confirmado pela nuvem.");
                        }
                        salvo = resultado.snapshot.val();
                        if (!(salvo === null || salvo === void 0 ? void 0 : salvo.data) || texto(salvo.hash) !== conteudoHash)
                            throw new Error("A nuvem não confirmou o snapshot completo da ficha.");
                        removerBackupEstruturalPendente(sheetId, uid);
                        emitir("backup-estrutural-atualizado", { sheetId: sheetId, name: ficha.name, revision: Number(salvo.revision || 0), realtimeWatermark: Number(salvo.realtimeWatermark || 0), motivo: texto(motivo) });
                        return [2 /*return*/, { ok: true, sheetId: sheetId, revision: Number(salvo.revision || 0), realtimeWatermark: Number(salvo.realtimeWatermark || 0) }];
                }
            });
        });
    }
    function processarBackupsEstruturaisPendentes() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var uid, pendentes, resultados, ativa, _loop_5, _b, _c, op, e_11_1;
            var e_11, _d;
            var _e;
            var _f = _a === void 0 ? {} : _a, _g = _f.motivo, motivo = _g === void 0 ? "reconexao" : _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (!estadoOnline.user || estadoOnline.user.anonymous || !estadoOnline.configurado)
                            return [2 /*return*/, []];
                        if (((_e = window.navigator) === null || _e === void 0 ? void 0 : _e.onLine) === false)
                            return [2 /*return*/, []];
                        uid = uidContaAtiva(), pendentes = estadoBackupOutbox(uid), resultados = [], ativa = fichaAtivaNomeSeguro();
                        _loop_5 = function (op) {
                            var sheetId, ficha, _j, _k, erro_13;
                            return __generator(this, function (_l) {
                                switch (_l.label) {
                                    case 0:
                                        sheetId = texto(op === null || op === void 0 ? void 0 : op.sheetId);
                                        if (!sheetId)
                                            return [2 /*return*/, "continue"];
                                        ficha = listarFichasLocais().find(function (f) { return f.sheetId === sheetId; });
                                        if (!ficha) {
                                            removerBackupEstruturalPendente(sheetId, uid);
                                            return [2 /*return*/, "continue"];
                                        }
                                        if (fichaBloqueadaNuvem(ficha)) {
                                            removerBackupEstruturalPendente(sheetId, uid);
                                            return [2 /*return*/, "continue"];
                                        }
                                        /* Não abrimos/sincronizamos fichas de fundo apenas para fazer backup. A
                                           pendência permanece e será drenada quando essa ficha for a ativa. */
                                        if (ficha.name !== ativa) {
                                            resultados.push({ skipped: true, queued: true, sheetId: sheetId, reason: "ficha-inativa" });
                                            return [2 /*return*/, "continue"];
                                        }
                                        _l.label = 1;
                                    case 1:
                                        _l.trys.push([1, 3, , 4]);
                                        _k = (_j = resultados).push;
                                        return [4 /*yield*/, atualizarBackupEstrutural(ficha.name, { motivo: texto(op === null || op === void 0 ? void 0 : op.reason) || texto(motivo) || "reconexao" })];
                                    case 2:
                                        _k.apply(_j, [_l.sent()]);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        erro_13 = _l.sent();
                                        resultados.push({ ok: false, sheetId: sheetId, erro: erro_13 });
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 6, 7, 8]);
                        _b = __values(Object.values(pendentes)), _c = _b.next();
                        _h.label = 2;
                    case 2:
                        if (!!_c.done) return [3 /*break*/, 5];
                        op = _c.value;
                        return [5 /*yield**/, _loop_5(op)];
                    case 3:
                        _h.sent();
                        _h.label = 4;
                    case 4:
                        _c = _b.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_11_1 = _h.sent();
                        e_11 = { error: e_11_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                        }
                        finally { if (e_11) throw e_11.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, resultados];
                }
            });
        });
    }
    function chaveCacheBackup(uid, sheetId, backupId) {
        return "".concat(texto(uid), "::").concat(texto(sheetId), "::").concat(texto(backupId));
    }
    function guardarBackupNoCache(uid, sheetId, backupId, registro) {
        if (!uid || !sheetId || !backupId || !registro || typeof registro !== "object")
            return;
        CACHE_BACKUPS_HISTORICOS.set(chaveCacheBackup(uid, sheetId, backupId), {
            fetchedAt: agora(),
            registro: clonar(registro)
        });
    }
    function obterBackupDoCache(uid, sheetId, backupId) {
        /* safety_latest é rotativo e pode ser substituído por outro aparelho. Para
           os históricos normais, as Rules atuais tornam o registro imutável; usar
           por poucos minutos a cópia que a própria tela acabou de baixar evita uma
           segunda leitura grande sem alterar a semântica da restauração. */
        if (texto(backupId) === "safety_latest")
            return null;
        var chave = chaveCacheBackup(uid, sheetId, backupId), item = CACHE_BACKUPS_HISTORICOS.get(chave);
        if (!item)
            return null;
        if (agora() - Number(item.fetchedAt || 0) > LIMITE_CACHE_BACKUP_MS) {
            CACHE_BACKUPS_HISTORICOS.delete(chave);
            return null;
        }
        return clonar(item.registro);
    }
    function removerBackupDoCache(uid, sheetId, backupId) {
        CACHE_BACKUPS_HISTORICOS.delete(chaveCacheBackup(uid, sheetId, backupId));
    }
    function backupUtils() {
        return window.ShinobiBackupUtils || {};
    }
    function normalizarBackupsHistoricos(valor) {
        var fn = backupUtils().normalizarBackups;
        if (typeof fn === "function")
            return fn(valor);
        return Object.entries(valor || {}).map(function (_a) {
            var _b = __read(_a, 2), id = _b[0], item = _b[1];
            return (__assign({ id: id }, item));
        }).sort(function (a, b) { return Number((b === null || b === void 0 ? void 0 : b.createdAt) || 0) - Number((a === null || a === void 0 ? void 0 : a.createdAt) || 0); });
    }
    function aplicarRetencaoBackups(sheetId_1) {
        return __awaiter(this, arguments, void 0, function (sheetId, _a) {
            var api, uid, snap, valor, limite, utils, fn, ids, updates;
            var _b, _c;
            var _d = _a === void 0 ? {} : _a, _e = _d.protegerIds, protegerIds = _e === void 0 ? [] : _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        api = estadoOnline.api, uid = (_b = estadoOnline.user) === null || _b === void 0 ? void 0 : _b.uid;
                        if (!api || !uid || !sheetId)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "sheetBackups/".concat(uid, "/").concat(sheetId)))];
                    case 1:
                        snap = _f.sent();
                        valor = snap.val() || {};
                        limite = Math.max(1, Number(((_c = window.SHINOBI_FIREBASE_OPTIONS) === null || _c === void 0 ? void 0 : _c.backupsToKeep) || 3));
                        utils = backupUtils();
                        fn = utils.idsParaLimpezaGerenciador || utils.idsParaRemoverPorRetencao;
                        ids = typeof fn === "function"
                            ? fn(valor, limite, protegerIds)
                            : normalizarBackupsHistoricos(valor).slice(limite).map(function (item) { return item.id; });
                        if (!ids.length)
                            return [2 /*return*/, []];
                        updates = {};
                        ids.forEach(function (backupId) { updates["sheetBackups/".concat(uid, "/").concat(sheetId, "/").concat(backupId)] = null; });
                        return [4 /*yield*/, api.update(api.ref(estadoOnline.db), updates)];
                    case 2:
                        _f.sent();
                        return [2 /*return*/, ids];
                }
            });
        });
    }
    function criarBackupFicha(ficha_1) {
        return __awaiter(this, arguments, void 0, function (ficha, _a) {
            var api, uid, tipo, seguranca, backupId, createdAt, registro;
            var _b = _a === void 0 ? {} : _a, _c = _b.reason, reason = _c === void 0 ? "manual" : _c, _d = _b.revision, revision = _d === void 0 ? 0 : _d, _e = _b.type, type = _e === void 0 ? "" : _e, _f = _b.dayKey, dayKey = _f === void 0 ? "" : _f, _g = _b.id, id = _g === void 0 ? "" : _g, _h = _b.protectIds, protectIds = _h === void 0 ? [] : _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        exigirContaGoogle();
                        if (!(ficha === null || ficha === void 0 ? void 0 : ficha.sheetId) || !(ficha === null || ficha === void 0 ? void 0 : ficha.data))
                            throw new Error("Ficha indisponível para backup.");
                        api = estadoOnline.api, uid = estadoOnline.user.uid;
                        tipo = texto(type);
                        seguranca = tipo === "safety" || texto(reason) === "antes-restaurar-historico";
                        backupId = texto(id) || (seguranca ? "safety_latest" : "".concat(agora(), "_").concat(slug(reason)));
                        createdAt = agora();
                        registro = {
                            name: ficha.name, characterName: ficha.characterName, revision: Number(revision || 0),
                            createdAt: createdAt,
                            reason: texto(reason) || "manual", type: tipo, dayKey: texto(dayKey),
                            appVersion: texto(window.APP_VERSION), sourceDeviceId: obterDeviceId(), data: clonar(ficha.data)
                        };
                        return [4 /*yield*/, api.set(api.ref(estadoOnline.db, "sheetBackups/".concat(uid, "/").concat(ficha.sheetId, "/").concat(backupId)), registro)];
                    case 1:
                        _j.sent();
                        guardarBackupNoCache(uid, ficha.sheetId, backupId, registro);
                        if (!seguranca) return [3 /*break*/, 2];
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, aplicarRetencaoBackups(ficha.sheetId, { protegerIds: protectIds })];
                    case 3:
                        _j.sent();
                        _j.label = 4;
                    case 4:
                        emitir("backup-historico-criado", { sheetId: ficha.sheetId, backupId: backupId, createdAt: createdAt, reason: registro.reason, type: registro.type });
                        return [2 /*return*/, { ok: true, sheetId: ficha.sheetId, backupId: backupId, createdAt: createdAt, reason: registro.reason, type: registro.type }];
                }
            });
        });
    }
    function listarBackupsHistoricos() {
        return __awaiter(this, arguments, void 0, function (sheetId) {
            var ficha, id, api, uid, snap, valor, limpar, idsLegados, updates_2;
            if (sheetId === void 0) { sheetId = ""; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirContaGoogle();
                        ficha = fichaAtualLocal();
                        id = texto(sheetId) || texto(ficha === null || ficha === void 0 ? void 0 : ficha.sheetId);
                        if (!id)
                            throw new Error("A ficha ativa ainda não possui identidade de backup.");
                        api = estadoOnline.api, uid = estadoOnline.user.uid;
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "sheetBackups/".concat(uid, "/").concat(id)))];
                    case 1:
                        snap = _a.sent();
                        valor = snap.val() || {};
                        /* A lista do painel já trouxe os snapshots completos do Firebase. Guardamos
                           por poucos minutos os históricos imutáveis para a restauração não baixar
                           o mesmo JSON novamente ao apertar Restaurar. */
                        Object.entries(valor).forEach(function (_a) {
                            var _b = __read(_a, 2), backupId = _b[0], registro = _b[1];
                            return guardarBackupNoCache(uid, id, backupId, registro);
                        });
                        limpar = backupUtils().idsSegurancaLegadosParaRemover;
                        idsLegados = typeof limpar === "function" ? limpar(valor, "safety_latest") : [];
                        if (idsLegados.length) {
                            updates_2 = {};
                            idsLegados.forEach(function (idAntigo) {
                                updates_2["sheetBackups/".concat(uid, "/").concat(id, "/").concat(idAntigo)] = null;
                                removerBackupDoCache(uid, id, idAntigo);
                            });
                            api.update(api.ref(estadoOnline.db), updates_2).catch(function (erro) {
                                console.warn("Não foi possível limpar backups safety legados agora.", erro);
                            });
                        }
                        return [2 /*return*/, normalizarBackupsHistoricos(valor).map(function (item) { return ({
                                id: texto(item.id), name: texto(item.name) || "Ficha", characterName: texto(item.characterName),
                                revision: Number(item.revision || 0), createdAt: Number(item.createdAt || 0), reason: texto(item.reason) || "manual",
                                type: texto(item.type), dayKey: texto(item.dayKey), appVersion: texto(item.appVersion), sourceDeviceId: texto(item.sourceDeviceId)
                            }); })];
                }
            });
        });
    }
    function criarBackupHistoricoAtual() {
        return __awaiter(this, arguments, void 0, function (localSheetName, _a) {
            var ficha, resultado;
            if (localSheetName === void 0) { localSheetName = ""; }
            var _b = _a === void 0 ? {} : _a, _c = _b.motivo, motivo = _c === void 0 ? "manual" : _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        exigirContaGoogle();
                        capturarEstadoAtualAntesDaSincronizacao(localSheetName);
                        prepararIdentidadeFichaParaConta(localSheetName || fichaAtivaNomeSeguro());
                        ficha = fichaLocalSolicitada(localSheetName);
                        if (!ficha)
                            throw new Error("Ficha local não encontrada.");
                        if (fichaBloqueadaNuvem(ficha))
                            return [2 /*return*/, { skipped: true, legacyRecovery: true }];
                        return [4 /*yield*/, criarBackupFicha(ficha, { reason: texto(motivo) || "manual", type: "manual" })];
                    case 1:
                        resultado = _d.sent();
                        /* O ponto histórico já está confirmado no Firebase. userSheets é um snapshot
                           estrutural secundário e possui outbox própria; não seguramos mais o botão
                           de backup esperando convergência dos nove listeners + outra transaction.
                           atualizarBackupEstrutural marca a pendência antes do primeiro await. */
                        atualizarBackupEstrutural(ficha.name, { motivo: "backup-manual-historico" }).catch(function (erro) {
                            console.warn("Backup histórico criado; snapshot estrutural ficou pendente.", erro);
                        });
                        return [2 /*return*/, __assign(__assign({}, resultado), { snapshotEstruturalAgendado: true })];
                }
            });
        });
    }
    function garantirBackupDiarioFichaAtiva() {
        return __awaiter(this, void 0, void 0, function () {
            var ficha, utils, dayKey, backupId, api, uid, chaveOk, refBackup, atualizada, registro, jaExistia, transacao, created;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!estadoOnline.user || estadoOnline.user.anonymous || !estadoOnline.configurado || ((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.onLine) === false)
                            return [2 /*return*/, { skipped: true }];
                        ficha = fichaAtualLocal();
                        if (!ficha || fichaBloqueadaNuvem(ficha))
                            return [2 /*return*/, { skipped: true }];
                        utils = backupUtils();
                        dayKey = typeof utils.dayKeyLocal === "function" ? utils.dayKeyLocal(agora()) : new Date().toISOString().slice(0, 10);
                        backupId = "daily_".concat(dayKey);
                        api = estadoOnline.api, uid = estadoOnline.user.uid;
                        chaveOk = "shinobi_backup_daily_ok_v1__".concat(uid, "__").concat(ficha.sheetId);
                        try {
                            if (localStorage.getItem(chaveOk) === dayKey)
                                return [2 /*return*/, { ok: true, created: false, skipped: true, sheetId: ficha.sheetId, backupId: backupId, dayKey: dayKey }];
                        }
                        catch (_erro) { }
                        refBackup = api.ref(estadoOnline.db, "sheetBackups/".concat(uid, "/").concat(ficha.sheetId, "/").concat(backupId));
                        capturarEstadoAtualAntesDaSincronizacao(ficha.name);
                        atualizada = listarFichasLocais().find(function (f) { return f.name === ficha.name; }) || ficha;
                        registro = {
                            name: atualizada.name, characterName: atualizada.characterName, revision: Number((estadoSync()[atualizada.sheetId] || {}).revision || 0),
                            createdAt: agora(), reason: "automatico-diario", type: "daily",
                            dayKey: dayKey,
                            appVersion: texto(window.APP_VERSION), sourceDeviceId: obterDeviceId(), data: clonar(atualizada.data)
                        };
                        jaExistia = false;
                        return [4 /*yield*/, api.runTransaction(refBackup, function (existente) {
                                if (existente) {
                                    jaExistia = true;
                                    return;
                                }
                                return registro;
                            }, { applyLocally: false })];
                    case 1:
                        transacao = _b.sent();
                        return [4 /*yield*/, aplicarRetencaoBackups(atualizada.sheetId, { protegerIds: [backupId] })];
                    case 2:
                        _b.sent();
                        created = Boolean(transacao.committed && !jaExistia);
                        try {
                            localStorage.setItem(chaveOk, dayKey);
                        }
                        catch (_erro) { }
                        if (created)
                            emitir("backup-diario-criado", { sheetId: atualizada.sheetId, backupId: backupId, dayKey: dayKey });
                        return [2 /*return*/, { ok: true, created: created, sheetId: atualizada.sheetId, backupId: backupId, dayKey: dayKey }];
                }
            });
        });
    }
    function excluirBackupHistorico(sheetId, backupId) {
        return __awaiter(this, void 0, void 0, function () {
            var id, backup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exigirContaGoogle();
                        id = texto(sheetId), backup = texto(backupId);
                        if (!id || !backup)
                            throw new Error("Backup histórico inválido.");
                        return [4 /*yield*/, estadoOnline.api.remove(estadoOnline.api.ref(estadoOnline.db, "sheetBackups/".concat(estadoOnline.user.uid, "/").concat(id, "/").concat(backup)))];
                    case 1:
                        _a.sent();
                        removerBackupDoCache(estadoOnline.user.uid, id, backup);
                        emitir("backup-historico-excluido", { sheetId: id, backupId: backup });
                        return [2 /*return*/, { ok: true, sheetId: id, backupId: backup }];
                }
            });
        });
    }
    function restaurarBackupHistorico(sheetId, backupId) {
        return __awaiter(this, void 0, void 0, function () {
            var id, backup, atual, api, uid, mensagemEtapa, registro, snap, erro_14, detalhe, falha, antes, preparar, restaurada, reservaLocal, detalhe, falha, erro_15, detalhe, falha, realtime, erro_16, detalhe, falha, detalhe, falha, snapshotAtualizado, snapshotPendente, snapshotErro;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        exigirContaGoogle();
                        if (((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.onLine) === false)
                            throw new Error("Conecte este aparelho à internet para restaurar um backup histórico.");
                        id = texto(sheetId), backup = texto(backupId);
                        atual = fichaAtualLocal();
                        if (!id || !backup || !atual || texto(atual.sheetId) !== id)
                            throw new Error("Abra a ficha correspondente antes de restaurar este backup.");
                        if (fichaBloqueadaNuvem(atual))
                            throw new Error("Esta cópia antiga está preservada e não pode substituir a ficha principal.");
                        api = estadoOnline.api, uid = estadoOnline.user.uid;
                        mensagemEtapa = backupUtils().mensagemErroRestauracao;
                        registro = obterBackupDoCache(uid, id, backup);
                        if (!!registro) return [3 /*break*/, 5];
                        snap = void 0;
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "sheetBackups/".concat(uid, "/").concat(id, "/").concat(backup)))];
                    case 2:
                        snap = _e.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        erro_14 = _e.sent();
                        detalhe = erroAmigavel(erro_14);
                        falha = new Error(typeof mensagemEtapa === "function" ? mensagemEtapa("leitura", detalhe) : "N\u00E3o foi poss\u00EDvel ler o backup escolhido. ".concat(detalhe));
                        falha.code = "shinobi/restore-read";
                        falha.cause = erro_14;
                        throw falha;
                    case 4:
                        if (!snap.exists())
                            throw new Error("Backup histórico não encontrado.");
                        registro = snap.val() || {};
                        guardarBackupNoCache(uid, id, backup, registro);
                        _e.label = 5;
                    case 5:
                        if (!registro.data || typeof registro.data !== "object" || Array.isArray(registro.data))
                            throw new Error("Este backup histórico não contém uma ficha válida.");
                        capturarEstadoAtualAntesDaSincronizacao(atual.name);
                        antes = listarFichasLocais().find(function (f) { return f.name === atual.name; }) || atual;
                        preparar = backupUtils().prepararSnapshotRestaurado;
                        restaurada = typeof preparar === "function" ? preparar(registro.data, antes.data) : clonar(registro.data);
                        restaurada.__online = clonar(((_b = antes.data) === null || _b === void 0 ? void 0 : _b.__online) || {});
                        try {
                            reservaLocal = prepararReservaRestauracaoLocal(antes.key, restaurada, { sheetId: id });
                        }
                        catch (erro) {
                            detalhe = erroAmigavel(erro);
                            falha = new Error(typeof mensagemEtapa === "function" ? mensagemEtapa("preflight", detalhe) : "N\u00E3o h\u00E1 espa\u00E7o local suficiente para iniciar a restaura\u00E7\u00E3o com seguran\u00E7a. ".concat(detalhe));
                            falha.code = "shinobi/restore-preflight";
                            falha.cause = erro;
                            throw falha;
                        }
                        _e.label = 6;
                    case 6:
                        _e.trys.push([6, , 15, 16]);
                        _e.label = 7;
                    case 7:
                        _e.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, criarBackupFicha(antes, { reason: "antes-restaurar-historico", type: "safety" })];
                    case 8:
                        _e.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        erro_15 = _e.sent();
                        detalhe = erroAmigavel(erro_15);
                        falha = new Error(typeof mensagemEtapa === "function" ? mensagemEtapa("seguranca", detalhe) : "N\u00E3o foi poss\u00EDvel criar o backup de seguran\u00E7a antes da restaura\u00E7\u00E3o. ".concat(detalhe));
                        falha.code = "shinobi/restore-safety";
                        falha.cause = erro_15;
                        throw falha;
                    case 10:
                        if (typeof ((_c = window.EkoRealtimeSync) === null || _c === void 0 ? void 0 : _c.aplicarSnapshotAutoritativo) !== "function")
                            throw new Error("O motor de sincronização ainda não está pronto para restaurar o backup.");
                        realtime = void 0;
                        _e.label = 11;
                    case 11:
                        _e.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, window.EkoRealtimeSync.aplicarSnapshotAutoritativo(antes.name, restaurada)];
                    case 12:
                        realtime = _e.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        erro_16 = _e.sent();
                        detalhe = erroAmigavel(erro_16);
                        falha = new Error(typeof mensagemEtapa === "function" ? mensagemEtapa("realtime", detalhe) : "N\u00E3o foi poss\u00EDvel aplicar a vers\u00E3o escolhida na sincroniza\u00E7\u00E3o. ".concat(detalhe));
                        falha.code = "shinobi/restore-realtime";
                        falha.cause = erro_16;
                        throw falha;
                    case 14:
                        try {
                            reservaLocal.confirmar();
                            aplicarEstadoGlobalDaFicha(antes.name, antes.key, restaurada);
                        }
                        catch (erro) {
                            detalhe = texto(erro === null || erro === void 0 ? void 0 : erro.message) || "O armazenamento local recusou a gravação.";
                            falha = new Error(typeof mensagemEtapa === "function" ? mensagemEtapa("local", detalhe) : "A vers\u00E3o chegou \u00E0 sincroniza\u00E7\u00E3o, mas n\u00E3o foi poss\u00EDvel aplic\u00E1-la neste aparelho. ".concat(detalhe));
                            falha.code = "shinobi/restore-local";
                            falha.cause = erro;
                            throw falha;
                        }
                        snapshotAtualizado = false, snapshotPendente = true, snapshotErro = "";
                        atualizarBackupEstrutural(antes.name, { motivo: "restauracao-backup-historico" }).then(function (resultado) {
                            if ((resultado === null || resultado === void 0 ? void 0 : resultado.ok) === true) {
                                emitir("backup-restauracao-snapshot-atualizado", { sheetId: id, backupId: backup });
                                return;
                            }
                            emitir("backup-restauracao-snapshot-pendente", {
                                sheetId: id, backupId: backup, mensagem: texto(resultado === null || resultado === void 0 ? void 0 : resultado.reason) || "snapshot-estrutural-agendado"
                            });
                        }).catch(function (erro) {
                            var mensagem = erroAmigavel(erro);
                            emitir("backup-restauracao-snapshot-pendente", { sheetId: id, backupId: backup, mensagem: mensagem });
                        });
                        emitir("backup-historico-restaurado", { sheetId: id, backupId: backup, createdAt: Number(registro.createdAt || 0), snapshotAtualizado: snapshotAtualizado, snapshotPendente: snapshotPendente });
                        return [2 /*return*/, { ok: true, sheetId: id, backupId: backup, realtime: realtime, snapshotAtualizado: snapshotAtualizado, snapshotPendente: snapshotPendente, snapshotAgendado: true, snapshotErro: snapshotErro }];
                    case 15:
                        (_d = reservaLocal === null || reservaLocal === void 0 ? void 0 : reservaLocal.liberar) === null || _d === void 0 ? void 0 : _d.call(reservaLocal);
                        return [7 /*endfinally*/];
                    case 16: return [2 /*return*/];
                }
            });
        });
    }
    function sincronizarTodasFichas() {
        return __awaiter(this, void 0, void 0, function () {
            var resultados, _a, _b, ficha, _c, _d, e_12_1;
            var e_12, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        exigirContaGoogle();
                        prepararIdentidadesDaConta();
                        resultados = [];
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 6, 7, 8]);
                        _a = __values(listarFichasSincronizaveis()), _b = _a.next();
                        _f.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        ficha = _b.value;
                        _d = (_c = resultados).push;
                        return [4 /*yield*/, sincronizarFicha(ficha.name, { force: false, backup: false, motivo: "sincronizacao-geral" })];
                    case 3:
                        _d.apply(_c, [_f.sent()]);
                        _f.label = 4;
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_12_1 = _f.sent();
                        e_12 = { error: e_12_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                        }
                        finally { if (e_12) throw e_12.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, resultados];
                }
            });
        });
    }
    function restaurarFichaDaNuvem(sheetId_1) {
        return __awaiter(this, arguments, void 0, function (sheetId, _a) {
            var api, snap, cloud, data, locais, uid, identidadeApi, vinculada, nome, base, nMax, n, candidato_1, anterior, _erro_14, identidade, idFinal, chave, lista, sync;
            var _b = _a === void 0 ? {} : _a, _c = _b.asCopy, asCopy = _c === void 0 ? false : _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        exigirContaGoogle();
                        api = estadoOnline.api;
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "userSheets/".concat(estadoOnline.user.uid, "/").concat(sheetId)))];
                    case 1:
                        snap = _d.sent();
                        if (!snap.exists())
                            throw new Error("Backup da nuvem não encontrado.");
                        cloud = snap.val();
                        if ((cloud === null || cloud === void 0 ? void 0 : cloud.deleted) === true)
                            throw new Error("Esta ficha foi excluída em outro aparelho e não pode ser restaurada como versão ativa.");
                        data = clonar(cloud.data || {});
                        locais = prepararCopiasLocaisLegadas();
                        uid = uidContaAtiva();
                        identidadeApi = window.EkoCharacterIdentity;
                        vinculada = locais.find(function (f) { return f.sheetId === sheetId; });
                        nome = (vinculada === null || vinculada === void 0 ? void 0 : vinculada.name) || texto(cloud.name) || texto(cloud.characterName) || "Ficha restaurada";
                        if (!asCopy) return [3 /*break*/, 2];
                        base = "".concat(nome, " C\u00F3pia"), nMax = 1000;
                        n = 2, candidato_1 = base;
                        while (locais.some(function (f) { return f.name === candidato_1; }) && n < nMax) {
                            candidato_1 = "".concat(base, " ").concat(n++);
                        }
                        nome = candidato_1;
                        data.__online = {};
                        data.__online.sheetId = idAleatorio("sheet");
                        data.__online.userCopy = true;
                        data.__online.sourceSheetId = sheetId;
                        return [3 /*break*/, 7];
                    case 2:
                        /* Sem correspondência explícita de sheetId, baixar uma ficha nunca
                           substitui outra apenas porque nome ou characterId são iguais. */
                        if (!vinculada)
                            nome = nomeLocalDisponivel(nome);
                        anterior = vinculada;
                        if (!(anterior && pontuacaoConteudoFicha(anterior.data) >= 8)) return [3 /*break*/, 6];
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, criarBackupFicha(anterior, { reason: "antes-restaurar-nuvem", revision: Number((estadoSync()[anterior.sheetId] || {}).revision || 0) })];
                    case 4:
                        _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _erro_14 = _d.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        data.__online = data.__online && typeof data.__online === "object" ? data.__online : {};
                        if (typeof (identidadeApi === null || identidadeApi === void 0 ? void 0 : identidadeApi.resolveCloudCharacterIdentity) === "function") {
                            identidade = identidadeApi.resolveCloudCharacterIdentity({
                                uid: uid,
                                name: nome, online: data.__online,
                                deterministicId: function () { return characterIdPorSheetId(uid, sheetId); }
                            });
                            if (texto(identidade === null || identidade === void 0 ? void 0 : identidade.characterId)) {
                                data.__online.characterId = identidade.characterId;
                                data.__online.characterOwnerUid = uid;
                                data.__online.characterIdentityVersion = 1;
                                data.__online.realtimeId = identidade.realtimeId || identidade.characterId;
                                data.__online.realtimeOwnerUid = uid;
                                data.__online.realtimeIdentityVersion = 2;
                            }
                        }
                        data.__online.sheetId = sheetId;
                        data.__online.ownerUid = uid;
                        data.__online.identityVersion = 2;
                        data.__online.originKey = data.__online.originKey || chaveIdentidadeFicha(nome);
                        delete data.__online.syncDisabled;
                        delete data.__online.legacyAutoCopy;
                        _d.label = 7;
                    case 7:
                        data.__online = data.__online && typeof data.__online === "object" ? data.__online : {};
                        idFinal = texto(data.__online.sheetId) || sheetId;
                        data.__online.sheetId = idFinal;
                        data.__online.name = nome;
                        chave = nome === "Principal" ? "ficha_ninja_app_v2" : "ficha_ninja_app_v2__".concat(nome);
                        localStorage.setItem(chave, JSON.stringify(data));
                        lista = Array.from(new Set(__spreadArray(__spreadArray([], __read(locais.map(function (f) { return f.name; })), false), [nome], false)));
                        localStorage.setItem("ficha_ninja_lista_v1", JSON.stringify(lista));
                        localStorage.setItem("ficha_ninja_ativa_v1", nome);
                        aplicarEstadoGlobalDaFicha(nome, chave, data);
                        sync = estadoSync();
                        sync[idFinal] = {
                            revision: asCopy ? 0 : Number(cloud.revision || 0), lastHash: asCopy ? "" : hashFicha(data),
                            lastSyncedAt: asCopy ? 0 : Number(cloud.updatedAt || agora()), deviceId: asCopy ? "" : texto(cloud.deviceId),
                            syncStatus: asCopy ? 0 : 1, phase: asCopy ? "pending" : "synced", pendingMode: asCopy ? "imediato" : "", pendingReason: asCopy ? "copia-explicita" : ""
                        };
                        gravarEstadoSync(sync);
                        emitir("ficha-restaurada", { name: nome, sheetId: idFinal, asCopy: asCopy });
                        if (!asCopy && Object.keys(estadoOnline.xpInbox || {}).length) {
                            setTimeout(function () { return processarXpCampanhaPendente().catch(function () { }); }, 120);
                        }
                        return [2 /*return*/, nome];
                }
            });
        });
    }
    function resolverConflito(sheetId, acao) {
        return __awaiter(this, void 0, void 0, function () {
            var local;
            return __generator(this, function (_a) {
                exigirContaGoogle();
                local = listarFichasLocais().find(function (f) { return f.sheetId === sheetId; });
                if (acao === "nuvem")
                    return [2 /*return*/, restaurarFichaDaNuvem(sheetId, { asCopy: false })];
                if (acao === "copia")
                    return [2 /*return*/, restaurarFichaDaNuvem(sheetId, { asCopy: true })];
                if (acao === "local" && local)
                    return [2 /*return*/, sincronizarFicha(local.name, { force: true, backup: true, motivo: "conflito-local" })];
                throw new Error("Escolha de conflito inválida.");
            });
        });
    }
    function sincronizarPendenciasAgora() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var locais, sync, alvos, resultados, alvos_2, alvos_2_1, _b, sheetId, ficha, _c, _d, erro_17, e_13_1;
            var e_13, _e;
            var _f = _a === void 0 ? {} : _a, _g = _f.motivo, motivo = _g === void 0 ? "flush" : _g, _h = _f.incluirTurno, incluirTurno = _h === void 0 ? false : _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (!estadoOnline.user || estadoOnline.user.anonymous || !estadoOnline.configurado)
                            return [2 /*return*/, []];
                        locais = listarFichasSincronizaveis();
                        sync = estadoSync();
                        alvos = new Map();
                        locais.forEach(function (ficha) {
                            var _a;
                            var meta = sync[ficha.sheetId] || {};
                            var hashAtual = hashFicha(ficha.data || {});
                            var pendente = estadoOnline.dirtySheets.has(ficha.sheetId) || ((_a = estadoOutbox()[ficha.sheetId]) === null || _a === void 0 ? void 0 : _a.type) === "upsert" || (meta.lastHash && meta.lastHash !== hashAtual);
                            if (!pendente)
                                return;
                            if (!incluirTurno && texto(meta.pendingMode) === "turno")
                                return;
                            alvos.set(ficha.sheetId, ficha);
                        });
                        resultados = [];
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 8, 9, 10]);
                        alvos_2 = __values(alvos), alvos_2_1 = alvos_2.next();
                        _j.label = 2;
                    case 2:
                        if (!!alvos_2_1.done) return [3 /*break*/, 7];
                        _b = __read(alvos_2_1.value, 2), sheetId = _b[0], ficha = _b[1];
                        limparAgendamentoSync(sheetId);
                        _j.label = 3;
                    case 3:
                        _j.trys.push([3, 5, , 6]);
                        _d = (_c = resultados).push;
                        return [4 /*yield*/, sincronizarFicha(ficha.name, { force: false, backup: false, motivo: motivo, modo: "imediato" })];
                    case 4:
                        _d.apply(_c, [_j.sent()]);
                        return [3 /*break*/, 6];
                    case 5:
                        erro_17 = _j.sent();
                        estadoOnline.dirtySheets.add(sheetId);
                        definirStatusSync(sheetId, 0, "pending", { pendingReason: texto(motivo) });
                        emitir("erro-sync", { mensagem: erroAmigavel(erro_17), erro: erro_17 });
                        return [3 /*break*/, 6];
                    case 6:
                        alvos_2_1 = alvos_2.next();
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_13_1 = _j.sent();
                        e_13 = { error: e_13_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (alvos_2_1 && !alvos_2_1.done && (_e = alvos_2.return)) _e.call(alvos_2);
                        }
                        finally { if (e_13) throw e_13.error; }
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/, resultados];
                }
            });
        });
    }
    function reconciliarSincronizacaoConta() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var api, snap, valor, sync, _b, _c, ficha, meta, hashAtual, cloud, pendenteDeTurno, cloudHash, e_14_1, erro_18;
            var e_14, _d;
            var _e;
            var _f = _a === void 0 ? {} : _a, _g = _f.motivo, motivo = _g === void 0 ? "reconciliacao" : _g, _h = _f.somenteReceber, somenteReceber = _h === void 0 ? false : _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (estadoOnline.reconciliandoSync)
                            return [2 /*return*/, { busy: true }];
                        if (!estadoOnline.user || estadoOnline.user.anonymous || !estadoOnline.api || !estadoOnline.db)
                            return [2 /*return*/, { skipped: true }];
                        estadoOnline.reconciliandoSync = true;
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 16, 17, 18]);
                        api = estadoOnline.api;
                        return [4 /*yield*/, api.get(api.ref(estadoOnline.db, "userSheets/".concat(estadoOnline.user.uid)))];
                    case 2:
                        snap = _j.sent();
                        valor = snap.val() || {};
                        return [4 /*yield*/, processarAtualizacoesNuvem(valor)];
                    case 3:
                        _j.sent();
                        return [4 /*yield*/, processarExclusoesPendentes()];
                    case 4:
                        _j.sent();
                        prepararIdentidadesDaConta();
                        sync = estadoSync();
                        _j.label = 5;
                    case 5:
                        _j.trys.push([5, 13, 14, 15]);
                        _b = __values(listarFichasSincronizaveis()), _c = _b.next();
                        _j.label = 6;
                    case 6:
                        if (!!_c.done) return [3 /*break*/, 12];
                        ficha = _c.value;
                        meta = sync[ficha.sheetId] || {};
                        hashAtual = hashFicha(ficha.data || {});
                        cloud = valor[ficha.sheetId];
                        pendenteDeTurno = texto(meta.pendingMode) === "turno";
                        if ((cloud === null || cloud === void 0 ? void 0 : cloud.deleted) === true)
                            return [3 /*break*/, 11];
                        if (!!cloud) return [3 /*break*/, 9];
                        if (!(!somenteReceber && !pendenteDeTurno && (estadoOnline.dirtySheets.has(ficha.sheetId) || ((_e = estadoOutbox()[ficha.sheetId]) === null || _e === void 0 ? void 0 : _e.type) === "upsert" || meta.lastHash))) return [3 /*break*/, 8];
                        return [4 /*yield*/, sincronizarFicha(ficha.name, { motivo: motivo, modo: "imediato" })];
                    case 7:
                        _j.sent();
                        _j.label = 8;
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        cloudHash = hashFicha(cloud.data || {});
                        if (hashAtual === cloudHash) {
                            atualizarMetaSync(ficha.sheetId, cloud, cloudHash);
                            marcarFichaLimpa(ficha.sheetId);
                            return [3 /*break*/, 11];
                        }
                        if (!(!somenteReceber && !pendenteDeTurno && meta.lastHash && hashAtual !== meta.lastHash)) return [3 /*break*/, 11];
                        return [4 /*yield*/, sincronizarFicha(ficha.name, { motivo: motivo, modo: "imediato" })];
                    case 10:
                        _j.sent();
                        _j.label = 11;
                    case 11:
                        _c = _b.next();
                        return [3 /*break*/, 6];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_14_1 = _j.sent();
                        e_14 = { error: e_14_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                        }
                        finally { if (e_14) throw e_14.error; }
                        return [7 /*endfinally*/];
                    case 15: return [2 /*return*/, { ok: true }];
                    case 16:
                        erro_18 = _j.sent();
                        emitir("erro-sync", { mensagem: erroAmigavel(erro_18), erro: erro_18 });
                        return [2 /*return*/, { ok: false, erro: erro_18 }];
                    case 17:
                        estadoOnline.reconciliandoSync = false;
                        return [7 /*endfinally*/];
                    case 18: return [2 /*return*/];
                }
            });
        });
    }
    function agendarSincronizacaoFicha(localSheetName, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.imediata, imediata = _c === void 0 ? false : _c, _d = _b.motivo, motivo = _d === void 0 ? "autosave" : _d;
        if (!estadoOnline.user || estadoOnline.user.anonymous || !estadoOnline.configurado)
            return;
        var ficha = fichaLocalSolicitada(localSheetName);
        if (!ficha || fichaBloqueadaNuvem(ficha))
            return;
        var sheetId = ficha.sheetId;
        marcarFichaPendente(ficha.name, { motivo: motivo, modo: "imediato" });
        limparAgendamentoSync(sheetId);
        var timer = setTimeout(function () {
            estadoOnline.syncTimers.delete(sheetId);
            /* A tarefa pertence ao sheetId que a criou. Se o nome foi reutilizado
               por outra ficha antes do timer disparar, não enviamos a nova ficha. */
            var alvo = listarFichasLocais().find(function (item) { return texto(item.sheetId) === texto(sheetId); });
            if (!alvo)
                return;
            sincronizarFicha(alvo.name, { motivo: motivo }).catch(function (erro) {
                estadoOnline.dirtySheets.add(sheetId);
                emitir("erro-sync", { mensagem: erroAmigavel(erro), erro: erro });
            });
        }, imediata ? 25 : 450);
        estadoOnline.syncTimers.set(sheetId, timer);
    }
    function limparObservadoresConta() {
        var _a, _b, _c, _d, _e, _f, _g;
        (_a = estadoOnline.unsubscribeCampanhas) === null || _a === void 0 ? void 0 : _a.call(estadoOnline);
        estadoOnline.unsubscribeCampanhas = null;
        (_b = estadoOnline.unsubscribeMembrosCampanha) === null || _b === void 0 ? void 0 : _b.call(estadoOnline);
        estadoOnline.unsubscribeMembrosCampanha = null;
        (_c = estadoOnline.unsubscribeNpcsCampanha) === null || _c === void 0 ? void 0 : _c.call(estadoOnline);
        estadoOnline.unsubscribeNpcsCampanha = null;
        (_d = estadoOnline.unsubscribeXpLedgerCampanha) === null || _d === void 0 ? void 0 : _d.call(estadoOnline);
        estadoOnline.unsubscribeXpLedgerCampanha = null;
        (_e = estadoOnline.unsubscribeXpReceiptsCampanha) === null || _e === void 0 ? void 0 : _e.call(estadoOnline);
        estadoOnline.unsubscribeXpReceiptsCampanha = null;
        (_f = estadoOnline.unsubscribeXpInbox) === null || _f === void 0 ? void 0 : _f.call(estadoOnline);
        estadoOnline.unsubscribeXpInbox = null;
        (_g = estadoOnline.unsubscribeFichas) === null || _g === void 0 ? void 0 : _g.call(estadoOnline);
        estadoOnline.unsubscribeFichas = null;
        estadoOnline.syncTimers.forEach(function (timer) { return clearTimeout(timer); });
        estadoOnline.syncTimers.clear();
        estadoOnline.syncQueues.clear();
        estadoOnline.dirtySheets.clear();
        estadoOnline.cloudQueue = Promise.resolve();
        limparSessaoLocal();
        estadoOnline.campanhas = [];
        estadoOnline.membrosCampanha = [];
        estadoOnline.membrosCampanhaId = null;
        estadoOnline.npcsCampanha = [];
        estadoOnline.npcsCampanhaId = null;
        estadoOnline.xpLedgerCampanha = [];
        estadoOnline.xpLedgerCampanhaId = null;
        estadoOnline.xpReceiptsCampanha = {};
        estadoOnline.xpReceiptsCampanhaId = null;
        estadoOnline.xpInbox = {};
        estadoOnline.fichasNuvem = [];
    }
    function linkDaSala(code) {
        var url = new URL(location.href);
        url.search = "";
        url.hash = "";
        url.searchParams.set("sala", code);
        return url.href;
    }
    function codigoDaUrl() {
        var url = new URL(location.href);
        return texto(url.searchParams.get("sala")).toUpperCase();
    }
    window.ShinobiOnline = {
        iniciar: iniciar,
        on: function (tipo, fn) { EVENTO.addEventListener(tipo, fn); return function () { return EVENTO.removeEventListener(tipo, fn); }; },
        snapshot: snapshot,
        entrarAnonimo: entrarAnonimo,
        entrarGoogle: entrarGoogle,
        trocarContaGoogle: trocarContaGoogle,
        sair: sair,
        criarCampanha: criarCampanha,
        prepararCampanhaPermanente: prepararCampanhaPermanente,
        editarCampanha: editarCampanha,
        excluirCampanha: excluirCampanha,
        observarMembrosCampanha: observarMembrosCampanha,
        pararObservacaoMembrosCampanha: pararObservacaoMembrosCampanha,
        observarNpcsCampanha: observarNpcsCampanha,
        pararObservacaoNpcsCampanha: pararObservacaoNpcsCampanha,
        observarXpCampanha: observarXpCampanha,
        pararObservacaoXpCampanha: pararObservacaoXpCampanha,
        criarSala: criarSala,
        abrirSalaComoMestre: abrirSalaComoMestre,
        buscarSalaPorCodigo: buscarSalaPorCodigo,
        entrarSala: entrarSala,
        observarSala: observarSala,
        sairDaSala: sairDaSala,
        encerrarSala: encerrarSala,
        listarFichasLocais: listarFichasLocais,
        listarFichasSincronizaveis: listarFichasSincronizaveis,
        listarCopiasLegadasLocaisSeguras: listarCopiasLegadasLocaisSeguras,
        fichaAtualLocal: fichaAtualLocal,
        fichaPodeParticiparNuvem: function (ficha) { return !fichaBloqueadaNuvem(ficha); },
        resumoBatalhaDaFicha: resumoBatalhaDaFicha,
        salvarFichaComoNpcCampanha: salvarFichaComoNpcCampanha,
        criarNpcCampanha: criarNpcCampanha,
        atualizarNpcCampanha: atualizarNpcCampanha,
        arquivarNpcCampanha: arquivarNpcCampanha,
        adicionarNpcCampanhaNaSala: adicionarNpcCampanhaNaSala,
        diagnosticarMembroCampanhaLocal: diagnosticarMembroCampanhaLocal,
        removerMembroCampanha: removerMembroCampanha,
        reativarMembroCampanha: reativarMembroCampanha,
        reassociarMembroCampanhaComFichaAtual: reassociarMembroCampanhaComFichaAtual,
        importarFichaComoNpc: importarFichaComoNpc,
        criarNpcRapido: criarNpcRapido,
        atualizarMeuParticipante: atualizarMeuParticipante,
        atualizarMeuParticipanteAoVivo: atualizarMeuParticipanteAoVivo,
        atualizarParticipante: atualizarParticipante,
        removerParticipante: removerParticipante,
        definirIniciativa: definirIniciativa,
        ordenarIniciativa: ordenarIniciativa,
        iniciarCombate: iniciarCombate,
        avancarTurno: avancarTurno,
        voltarTurno: voltarTurno,
        normalizarOrdem: normalizarOrdem,
        analisarDuracaoRodadas: analisarDuracaoRodadas,
        adicionarEfeito: adicionarEfeito,
        encerrarEfeito: encerrarEfeito,
        deduplicarEfeitosDaSala: deduplicarEfeitosDaSala,
        concederXp: concederXp,
        alterarXpCampanha: alterarXpCampanha,
        processarXpCampanhaPendente: processarXpCampanhaPendente,
        definirNivelJogador: definirNivelJogador,
        registrarEvento: registrarEvento,
        sincronizarFicha: sincronizarFicha,
        sincronizarTodasFichas: sincronizarTodasFichas,
        restaurarFichaDaNuvem: restaurarFichaDaNuvem,
        resolverConflito: resolverConflito,
        agendarSincronizacaoFicha: agendarSincronizacaoFicha,
        marcarFichaPendente: marcarFichaPendente,
        registrarExclusaoLocal: registrarExclusaoLocal,
        processarExclusoesPendentes: processarExclusoesPendentes,
        excluirFichaDaNuvem: excluirFichaDaNuvem,
        statusSincronizacaoAtual: statusSincronizacaoAtual,
        sincronizarPendenciasAgora: sincronizarPendenciasAgora,
        reconciliarSincronizacaoConta: reconciliarSincronizacaoConta,
        atualizarBackupEstrutural: atualizarBackupEstrutural,
        processarBackupsEstruturaisPendentes: processarBackupsEstruturaisPendentes,
        ativarBackupsNuvem: ativarBackupsNuvem,
        garantirIdentidadeFichaRealtime: garantirIdentidadeFichaRealtime,
        listarBackupsHistoricos: listarBackupsHistoricos,
        criarBackupHistoricoAtual: criarBackupHistoricoAtual,
        garantirBackupDiarioFichaAtiva: garantirBackupDiarioFichaAtiva,
        excluirBackupHistorico: excluirBackupHistorico,
        restaurarBackupHistorico: restaurarBackupHistorico,
        resumoMudancasMeuTurno: resumoMudancasMeuTurno,
        finalizarMeuTurno: finalizarMeuTurno,
        ehMeuTurno: ehMeuTurno,
        chaveTurnoAtual: chaveTurnoAtual,
        linkDaSala: linkDaSala,
        codigoDaUrl: codigoDaUrl,
        erroAmigavel: erroAmigavel,
        parseXpAtual: parseXpAtual,
        formatarXp: formatarXp
    };
    document.addEventListener("DOMContentLoaded", function () {
        var codigo = codigoDaUrl();
        if (codigo)
            emitir("convite-url", { code: codigo });
    });
    function iniciarOnlineDepoisDaAbertura() {
        setTimeout(function () { return iniciar().catch(function (erro) {
            /* O online nunca é requisito para a ficha abrir. */
            console.warn("Modo online indisponível após a abertura do app.", erro);
        }); }, 80);
    }
    function agendarInicioOnlineSeguro() {
        var _a;
        if ((_a = window.ShinobiAppReady) === null || _a === void 0 ? void 0 : _a.executar) {
            window.ShinobiAppReady.executar(iniciarOnlineDepoisDaAbertura);
        }
        else if (document.readyState === "complete") {
            setTimeout(iniciarOnlineDepoisDaAbertura, 1200);
        }
        else {
            window.addEventListener("load", function () { return setTimeout(iniciarOnlineDepoisDaAbertura, 1200); }, { once: true });
        }
    }
    limparReservasRestauracaoLocais();
    if (window.__shinobiOnlineStackLoading) {
        window.addEventListener("shinobi:online-stack-ready", agendarInicioOnlineSeguro, { once: true });
    }
    else {
        agendarInicioOnlineSeguro();
    }
})();
