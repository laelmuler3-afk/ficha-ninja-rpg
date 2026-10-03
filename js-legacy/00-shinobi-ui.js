/* GERADO AUTOMATICAMENTE — fonte: js/00-shinobi-ui.js — app 2.5.8.156. Não editar. */
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
(function () {
    "use strict";
    var ICON_BASE = "assets/icons/";
    var EMOJI_ICON = {
        "⚙": "settings", "⚙️": "settings", "👤": "profile", "💪": "attributes", "🔥": "fire", "🥷": "profile", "🎒": "inventory", "📜": "notes",
        "⭐": "bonus", "❤️": "heart", "❤": "heart", "🔵": "chakra", "⚡": "lightning", "🌪": "wind", "🌪️": "wind", "💧": "water", "🪨": "earth",
        "🧬": "dna", "⚔": "sword", "⚔️": "sword", "👊": "fist", "👁": "eye", "👁️": "eye", "💰": "wallet", "🏪": "store", "✴": "shuriken", "✴️": "shuriken",
        "🔪": "sword", "🪡": "jutsu", "🧵": "inventory", "🍙": "inventory", "💣": "fire", "🏷": "notes", "🏷️": "notes", "🧪": "chakra", "🩹": "heal",
        "🗡": "sword", "🗡️": "sword", "🎭": "profile", "🌱": "leaf", "🌑": "eye", "☀": "bonus", "☀️": "bonus", "✨": "bonus", "🖼": "image", "🖼️": "image",
        "🔎": "target", "☷": "menu", "🍥": "jutsu", "🃏": "jutsu", "✍": "edit", "✍️": "edit", "🥋": "fist", "🌀": "jutsu", "🏹": "target",
        "🧰": "inventory", "💎": "bonus", "☠": "bonus", "☠️": "bonus", "🔒": "shield", "🩸": "heart", "😵": "eye"
    };
    function nomeSeguro(nome) { return String(nome || "bonus").toLowerCase().replace(/[^a-z0-9-]/g, "") || "bonus"; }
    function iconHTML(nome, extra, label) {
        if (extra === void 0) { extra = ""; }
        if (label === void 0) { label = ""; }
        var seguro = nomeSeguro(nome);
        var aria = label ? " role=\"img\" aria-label=\"".concat(String(label).replace(/"/g, "&quot;"), "\"") : ' aria-hidden="true"';
        if (seguro === "fire")
            return "<span class=\"shinobiEmojiIcon icon-fire-emoji".concat(extra ? " ".concat(extra) : "", "\"").concat(aria, ">\uD83D\uDD25</span>");
        return "<span class=\"shinobiIcon icon-".concat(seguro).concat(extra ? " ".concat(extra) : "", "\"").concat(aria, "></span>");
    }
    window.iconeShinobi = iconHTML;
    window.shinobiIcon = iconHTML;
    function detectarIcone(texto) {
        var e_1, _a;
        var limpo = String(texto || "").trim();
        try {
            for (var _b = __values(Object.entries(EMOJI_ICON)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), emoji = _d[0], icone = _d[1];
                if (limpo.startsWith(emoji))
                    return { icone: icone, resto: limpo.slice(emoji.length).trim() };
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    function aplicarIconeElemento(el, forcado) {
        if (!el || el.dataset.shinobiIconApplied === "1")
            return;
        var detectado = forcado ? { icone: forcado, resto: "" } : detectarIcone(el.textContent);
        if (!detectado)
            return;
        el.dataset.shinobiIconApplied = "1";
        var resto = detectado.resto;
        el.innerHTML = iconHTML(detectado.icone, "", resto || "") + (resto ? "<span class=\"shinobiIconTexto\">".concat(resto, "</span>") : "");
    }
    function aplicarIcones(root) {
        var _a, _b, _c, _d;
        if (root === void 0) { root = document; }
        var seletor = ".navIcon,.jutsuLinhaIcone,.jutsuIcone,.jutsuGrupoIcone,.lojaGrupoIcone,.naturezaIcone,.kekkeiIcone,.itemInventarioIcone,.onlineAvatar,.danoInteligentePreviaTopo span,.inventarioAbas button>span:first-child,.jutsuCartaImagemAcoes button:first-child,.catalogoFiltrosToggleIcone,.catalogoCarregandoIcone,.catalogoEscolhaIcone";
        if ((_a = root.matches) === null || _a === void 0 ? void 0 : _a.call(root, seletor))
            aplicarIconeElemento(root);
        (_b = root.querySelectorAll) === null || _b === void 0 ? void 0 : _b.call(root, seletor).forEach(function (el) { return aplicarIconeElemento(el); });
        if ((_c = root.matches) === null || _c === void 0 ? void 0 : _c.call(root, "[data-shinobi-icon]"))
            aplicarIconeElemento(root, root.dataset.shinobiIcon);
        (_d = root.querySelectorAll) === null || _d === void 0 ? void 0 : _d.call(root, "[data-shinobi-icon]").forEach(function (el) { return aplicarIconeElemento(el, el.dataset.shinobiIcon); });
        atualizarProgressoNaturezas(root);
    }
    function atualizarProgressoNaturezas(root) {
        var _a;
        if (root === void 0) { root = document; }
        (_a = root.querySelectorAll) === null || _a === void 0 ? void 0 : _a.call(root, ".naturezaCard,.kekkeiNaturezaCard").forEach(function (card) {
            var _a;
            var txt = ((_a = card.querySelector(".naturezaNivelTexto,.kekkeiNivelTexto")) === null || _a === void 0 ? void 0 : _a.textContent) || "0/6";
            var m = txt.match(/(\d+)\s*\/\s*(\d+)/);
            var atual = m ? Number(m[1]) : 0, total = m ? Math.max(1, Number(m[2])) : 6;
            card.style.setProperty("--nivel-progresso", "".concat(Math.max(0, Math.min(100, atual / total * 100)), "%"));
        });
    }
    function textoDrawer(valor, padrao) {
        if (padrao === void 0) { padrao = ""; }
        var texto = String(valor !== null && valor !== void 0 ? valor : "").trim();
        return texto || padrao;
    }
    function estadoDrawer() {
        var _a, _b, _c, _d, _e, _f, _g;
        var nome = textoDrawer((_a = document.querySelector('[data-save="nome"]')) === null || _a === void 0 ? void 0 : _a.value, "Ninja");
        var nivel = Math.max(1, Number((_b = document.querySelector('[data-save="nivel"]')) === null || _b === void 0 ? void 0 : _b.value) || 1);
        var rank = textoDrawer((_c = document.querySelector('[data-save="rank"]')) === null || _c === void 0 ? void 0 : _c.value, "Shinobi");
        var avatar = document.getElementById("avatarPreview");
        var avatarSrc = (avatar === null || avatar === void 0 ? void 0 : avatar.getAttribute("src")) || "";
        var online = ((_e = (_d = window.ShinobiOnline) === null || _d === void 0 ? void 0 : _d.snapshot) === null || _e === void 0 ? void 0 : _e.call(_d)) || {};
        var usuario = online.user || null;
        var sala = online.sala || null;
        var sessaoSala = null;
        try {
            sessaoSala = JSON.parse(localStorage.getItem("shinobi_online_session_v1") || "null");
        }
        catch (_erro) { }
        var temSala = Boolean(sala || online.salaId || (sessaoSala === null || sessaoSala === void 0 ? void 0 : sessaoSala.roomId));
        var mestre = Boolean(usuario && sala && sala.masterUid === usuario.uid && (sessaoSala === null || sessaoSala === void 0 ? void 0 : sessaoSala.role) === "master" && (!sessaoSala.roomId || sessaoSala.roomId === sala.id));
        var syncTexto = "Somente neste aparelho", syncEstado = "local";
        if (navigator.onLine === false) {
            syncTexto = "Offline · alterações locais";
            syncEstado = "offline";
        }
        else if (usuario && !usuario.anonymous) {
            var status = (_g = (_f = window.ShinobiOnline) === null || _f === void 0 ? void 0 : _f.statusSincronizacaoAtual) === null || _g === void 0 ? void 0 : _g.call(_f);
            if ((status === null || status === void 0 ? void 0 : status.syncStatus) === 1 || (status === null || status === void 0 ? void 0 : status.phase) === "synced") {
                syncTexto = "Dados atualizados";
                syncEstado = "ok";
            }
            else {
                syncTexto = "Sincronização disponível";
                syncEstado = "pending";
            }
        }
        else if (usuario === null || usuario === void 0 ? void 0 : usuario.anonymous) {
            syncTexto = "Sessão local ativa";
            syncEstado = "local";
        }
        var salaTexto = (sala === null || sala === void 0 ? void 0 : sala.code) ? "Sala ".concat(String(sala.code).toUpperCase()) : temSala ? "Reconectando à sala..." : "Nenhuma sala ativa";
        var contaTexto = usuario && !usuario.anonymous ? (usuario.email || usuario.displayName || "Conta Google") : (usuario === null || usuario === void 0 ? void 0 : usuario.anonymous) ? "Sessão temporária" : "Nenhuma conta conectada";
        return { nome: nome, nivel: nivel, rank: rank, avatarSrc: avatarSrc, usuario: usuario, sala: sala, mestre: mestre, temSala: temSala, syncTexto: syncTexto, syncEstado: syncEstado, salaTexto: salaTexto, contaTexto: contaTexto };
    }
    function atualizarDrawerContexto() {
        var drawer = document.getElementById("shinobiNavDrawer");
        if (!drawer)
            return;
        var st = estadoDrawer();
        var nome = drawer.querySelector("[data-drawer-profile-name]");
        var meta = drawer.querySelector("[data-drawer-profile-meta]");
        var papel = drawer.querySelector("[data-drawer-profile-role]");
        var imagem = drawer.querySelector("[data-drawer-profile-image]");
        var fallback = drawer.querySelector("[data-drawer-profile-fallback]");
        var sync = drawer.querySelector("[data-drawer-sync-text]");
        var syncCard = drawer.querySelector("[data-drawer-sync]");
        var sala = drawer.querySelector("[data-drawer-room-current]");
        var contaConectada = drawer.querySelector("[data-drawer-connected-account-meta]");
        var salaAtualBtn = drawer.querySelector('[data-drawer-action="current-room"]');
        if (nome)
            nome.textContent = st.nome;
        if (meta)
            meta.textContent = "N\u00EDvel ".concat(st.nivel, " \u00B7 ").concat(st.rank);
        if (papel)
            papel.textContent = st.mestre ? "Mestre" : "Jogador";
        if (imagem) {
            if (st.avatarSrc) {
                imagem.src = st.avatarSrc;
                imagem.hidden = false;
                if (fallback)
                    fallback.hidden = true;
            }
            else {
                imagem.removeAttribute("src");
                imagem.hidden = true;
                if (fallback)
                    fallback.hidden = false;
            }
        }
        if (sync)
            sync.textContent = st.syncTexto;
        if (syncCard)
            syncCard.dataset.syncState = st.syncEstado;
        if (sala)
            sala.textContent = st.salaTexto;
        if (contaConectada)
            contaConectada.textContent = st.contaTexto;
        if (salaAtualBtn) {
            salaAtualBtn.disabled = !st.temSala;
            salaAtualBtn.setAttribute("aria-disabled", st.temSala ? "false" : "true");
            salaAtualBtn.title = st.temSala ? "Abrir a sala atual" : "Você ainda não está em uma sala";
        }
    }
    var drawerHistoryToken = "";
    var drawerHistorySeq = 0;
    function empilharHistoricoDrawer() {
        var _a, _b;
        if (!((_a = window.history) === null || _a === void 0 ? void 0 : _a.pushState))
            return;
        if (drawerHistoryToken && ((_b = history.state) === null || _b === void 0 ? void 0 : _b.shinobiDrawerToken) === drawerHistoryToken)
            return;
        var token = "drawer_".concat(Date.now().toString(36), "_").concat((++drawerHistorySeq).toString(36));
        try {
            history.pushState(__assign(__assign({}, ((history.state && typeof history.state === "object") ? history.state : {})), { shinobiDrawerToken: token }), "", location.href);
            drawerHistoryToken = token;
        }
        catch (_erro) {
            drawerHistoryToken = "";
        }
    }
    function consumirHistoricoDrawer() {
        var _a;
        var token = drawerHistoryToken;
        drawerHistoryToken = "";
        if (!token || ((_a = history.state) === null || _a === void 0 ? void 0 : _a.shinobiDrawerToken) !== token)
            return false;
        try {
            history.back();
            return true;
        }
        catch (_erro) {
            return false;
        }
    }
    function fecharSubpainelDrawer() {
        var drawer = document.getElementById("shinobiNavDrawer");
        if (!drawer)
            return false;
        var fichas = drawer.querySelector("[data-drawer-sheets]");
        var conta = drawer.querySelector("[data-drawer-account]");
        var config = drawer.querySelector("[data-drawer-config]");
        var sobre = drawer.querySelector("[data-drawer-about]");
        if (sobre && !sobre.hidden) {
            alternarSobreDrawer(false);
            return true;
        }
        if (fichas && !fichas.hidden) {
            alternarFichasDrawer(false);
            return true;
        }
        if (conta && !conta.hidden) {
            alternarContaDrawer(false);
            return true;
        }
        if (config && !config.hidden) {
            alternarConfiguracoesDrawer(false);
            return true;
        }
        return false;
    }
    function mostrarShinobiDrawer(_a) {
        var _b, _c, _d;
        var _e = _a === void 0 ? {} : _a, _f = _e.empilhar, empilhar = _f === void 0 ? true : _f;
        instalarDrawer();
        document.body.classList.add("shinobiDrawerAberto");
        (_b = document.getElementById("shinobiNavDrawer")) === null || _b === void 0 ? void 0 : _b.setAttribute("aria-hidden", "false");
        (_c = document.querySelector(".topoMenuBtn")) === null || _c === void 0 ? void 0 : _c.setAttribute("aria-expanded", "true");
        atualizarDrawerContexto();
        if (empilhar)
            empilharHistoricoDrawer();
        else if ((_d = history.state) === null || _d === void 0 ? void 0 : _d.shinobiDrawerToken)
            drawerHistoryToken = String(history.state.shinobiDrawerToken);
    }
    function fecharShinobiDrawer(opcoes) {
        var _a;
        if (opcoes === void 0) { opcoes = {}; }
        var drawer = document.getElementById("shinobiNavDrawer");
        document.body.classList.remove("shinobiDrawerAberto");
        drawer === null || drawer === void 0 ? void 0 : drawer.setAttribute("aria-hidden", "true");
        (_a = document.querySelector(".topoMenuBtn")) === null || _a === void 0 ? void 0 : _a.setAttribute("aria-expanded", "false");
        if ((opcoes === null || opcoes === void 0 ? void 0 : opcoes.preservarHistorico) === true)
            return;
        if ((opcoes === null || opcoes === void 0 ? void 0 : opcoes.viaHistorico) === true)
            drawerHistoryToken = "";
        else
            consumirHistoricoDrawer();
    }
    window.fecharShinobiDrawer = fecharShinobiDrawer;
    window.reabrirShinobiDrawerDoHistorico = function () { return mostrarShinobiDrawer({ empilhar: false }); };
    window.voltarShinobiDrawer = function () { if (!fecharSubpainelDrawer())
        fecharShinobiDrawer(); };
    function onlineUIDisponivel() {
        var _a;
        return typeof ((_a = window.ShinobiOnlineUI) === null || _a === void 0 ? void 0 : _a.abrir) === "function";
    }
    function aguardarOnlineUI(timeout) {
        if (onlineUIDisponivel())
            return Promise.resolve(window.ShinobiOnlineUI);
        var modoLegado = window.SHINOBI_LEGACY_MODE === true;
        var limite = Number(timeout) || (modoLegado ? 22000 : 5000);
        try {
            var loader = window.ShinobiOnlineLoader;
            if (loader && typeof loader.ensureReady === "function")
                loader.ensureReady().catch(function () { });
        }
        catch (_erro) { }
        return new Promise(function (resolve) {
            var finalizado = false;
            var concluir = function () {
                if (finalizado)
                    return;
                finalizado = true;
                window.removeEventListener("shinobi:online-ui-ready", aoPronto);
                window.removeEventListener("shinobi:online-stack-error", aoErro);
                resolve(onlineUIDisponivel() ? window.ShinobiOnlineUI : null);
            };
            var aoPronto = function () { return concluir(); };
            var aoErro = function () { return concluir(); };
            window.addEventListener("shinobi:online-ui-ready", aoPronto, { once: true });
            window.addEventListener("shinobi:online-stack-error", aoErro, { once: true });
            var agora = function () { return window.performance && typeof window.performance.now === "function" ? window.performance.now() : Date.now(); };
            var inicio = agora();
            var verificar = function () {
                if (onlineUIDisponivel())
                    return concluir();
                if (agora() - inicio >= limite)
                    return concluir();
                setTimeout(verificar, modoLegado ? 120 : 60);
            };
            verificar();
        });
    }
    function abrirPainelOnline(destino, botaoOrigem) {
        return __awaiter(this, void 0, void 0, function () {
            var botao, ui, _a, aberto, erro_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        botao = botaoOrigem || null;
                        botao === null || botao === void 0 ? void 0 : botao.classList.add("shinobiDrawerAcaoCarregando");
                        botao === null || botao === void 0 ? void 0 : botao.setAttribute("aria-busy", "true");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, 11, 12]);
                        if (!onlineUIDisponivel()) return [3 /*break*/, 2];
                        _a = window.ShinobiOnlineUI;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, aguardarOnlineUI()];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        ui = _a;
                        if (!!ui) return [3 /*break*/, 7];
                        if (!(typeof window.avisoShinobi === "function")) return [3 /*break*/, 6];
                        return [4 /*yield*/, window.avisoShinobi("Recursos online", "O painel de conta, sincronização e salas não terminou de carregar. Tente novamente em instantes.")];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [2 /*return*/, false];
                    case 7:
                        aberto = ui.abrir(destino, { origem: "drawer" });
                        if (aberto === false)
                            throw new Error("O painel online recusou a abertura.");
                        // O overlay Online cria sua própria entrada no histórico. Mantemos a
                        // entrada do drawer logo abaixo para que Voltar retorne ao menu, em vez
                        // de saltar direto para a ficha.
                        requestAnimationFrame(function () { return fecharShinobiDrawer({ preservarHistorico: true }); });
                        return [2 /*return*/, true];
                    case 8:
                        erro_1 = _b.sent();
                        console.error("Falha ao abrir destino do menu lateral:", destino, erro_1);
                        if (!(typeof window.avisoShinobi === "function")) return [3 /*break*/, 10];
                        return [4 /*yield*/, window.avisoShinobi("Não foi possível abrir", (erro_1 === null || erro_1 === void 0 ? void 0 : erro_1.message) || "O recurso selecionado não pôde ser aberto.")];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [2 /*return*/, false];
                    case 11:
                        botao === null || botao === void 0 ? void 0 : botao.classList.remove("shinobiDrawerAcaoCarregando");
                        botao === null || botao === void 0 ? void 0 : botao.removeAttribute("aria-busy");
                        return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
                }
            });
        });
    }
    function migrarGerenciamentoFichas(drawer) {
        if (drawer === void 0) { drawer = document.getElementById("shinobiNavDrawer"); }
        var destino = drawer === null || drawer === void 0 ? void 0 : drawer.querySelector("[data-drawer-sheets-legacy]");
        var acoes = document.getElementById("shinobiSheetActions");
        if (!destino || !acoes)
            return;
        if (acoes.parentElement !== destino)
            destino.appendChild(acoes);
        acoes.classList.add("shinobiFichasMigrado");
        acoes.removeAttribute("hidden");
    }
    function migrarConfiguracoesLegadas(drawer) {
        if (drawer === void 0) { drawer = document.getElementById("shinobiNavDrawer"); }
        // Os controles legados de atualização continuam com os mesmos IDs para
        // preservar js/08-update.js, mas agora moram em Sobre o app.
        var destino = drawer === null || drawer === void 0 ? void 0 : drawer.querySelector("[data-drawer-about-legacy]");
        var menu = document.getElementById("configMenu");
        if (!destino || !menu)
            return;
        if (menu.parentElement !== destino)
            destino.appendChild(menu);
        menu.classList.add("aberto", "shinobiConfigMigrado");
        menu.removeAttribute("aria-hidden");
        var host = document.getElementById("shinobiLegacyConfigHost");
        if (host)
            host.remove();
    }
    function alternarFichasDrawer(forcar) {
        var drawer = document.getElementById("shinobiNavDrawer");
        if (!drawer)
            return;
        migrarGerenciamentoFichas(drawer);
        var botao = drawer.querySelector('[data-drawer-action="sheets"]');
        var conteudo = drawer.querySelector("[data-drawer-sheets]");
        if (!botao || !conteudo)
            return;
        var abrir = typeof forcar === "boolean" ? forcar : conteudo.hidden;
        conteudo.hidden = !abrir;
        botao.classList.toggle("aberto", abrir);
        botao.setAttribute("aria-expanded", abrir ? "true" : "false");
        if (abrir) {
            alternarContaDrawer(false);
            alternarConfiguracoesDrawer(false);
            requestAnimationFrame(function () { return conteudo.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
        }
    }
    window.abrirGerenciadorFichas = function () { return alternarFichasDrawer(true); };
    function alternarContaDrawer(forcar) {
        var drawer = document.getElementById("shinobiNavDrawer");
        if (!drawer)
            return;
        var botao = drawer.querySelector('[data-drawer-action="account"]');
        var conteudo = drawer.querySelector("[data-drawer-account]");
        if (!botao || !conteudo)
            return;
        var abrir = typeof forcar === "boolean" ? forcar : conteudo.hidden;
        conteudo.hidden = !abrir;
        botao.classList.toggle("aberto", abrir);
        botao.setAttribute("aria-expanded", abrir ? "true" : "false");
        if (abrir) {
            alternarFichasDrawer(false);
            alternarConfiguracoesDrawer(false);
            requestAnimationFrame(function () { return botao.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
        }
    }
    window.abrirMinhaContaShinobi = function () { return alternarContaDrawer(true); };
    function alternarConfiguracoesDrawer(forcar) {
        var drawer = document.getElementById("shinobiNavDrawer");
        if (!drawer)
            return;
        migrarConfiguracoesLegadas(drawer);
        var botao = drawer.querySelector('[data-drawer-action="settings"]');
        var conteudo = drawer.querySelector("[data-drawer-config]");
        if (!botao || !conteudo)
            return;
        var abrir = typeof forcar === "boolean" ? forcar : conteudo.hidden;
        conteudo.hidden = !abrir;
        botao.classList.toggle("aberto", abrir);
        botao.setAttribute("aria-expanded", abrir ? "true" : "false");
        if (abrir) {
            var fichas = drawer.querySelector("[data-drawer-sheets]");
            var botaoFichas = drawer.querySelector('[data-drawer-action="sheets"]');
            if (fichas)
                fichas.hidden = true;
            botaoFichas === null || botaoFichas === void 0 ? void 0 : botaoFichas.classList.remove("aberto");
            botaoFichas === null || botaoFichas === void 0 ? void 0 : botaoFichas.setAttribute("aria-expanded", "false");
            alternarContaDrawer(false);
            alternarSobreDrawer(false);
            requestAnimationFrame(function () {
                botao.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
        }
        else {
            alternarSobreDrawer(false);
        }
    }
    window.abrirConfiguracoesShinobi = function () { return alternarConfiguracoesDrawer(true); };
    function alternarSobreDrawer(forcar) {
        var drawer = document.getElementById("shinobiNavDrawer");
        if (!drawer)
            return;
        migrarConfiguracoesLegadas(drawer);
        var principal = drawer.querySelector("[data-drawer-config-main]");
        var sobre = drawer.querySelector("[data-drawer-about]");
        if (!principal || !sobre)
            return;
        var abrir = typeof forcar === "boolean" ? forcar : sobre.hidden;
        sobre.hidden = !abrir;
        principal.hidden = abrir;
        if (abrir) {
            requestAnimationFrame(function () { return sobre.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
        }
    }
    function avisoEmBreve(titulo) {
        if (typeof window.avisoShinobi === "function")
            window.avisoShinobi(titulo, "Esta opção já está reservada na nova estrutura e será ativada em uma próxima etapa.");
    }
    function instalarDrawer() {
        var _a, _b, _c;
        var existente = document.getElementById("shinobiNavDrawer");
        if (existente) {
            migrarGerenciamentoFichas(existente);
            migrarConfiguracoesLegadas(existente);
            return existente;
        }
        var drawer = document.createElement("aside");
        drawer.id = "shinobiNavDrawer";
        drawer.className = "shinobiNavDrawer";
        drawer.setAttribute("aria-hidden", "true");
        drawer.innerHTML = "\n      <button type=\"button\" class=\"shinobiDrawerBackdrop\" aria-label=\"Fechar menu\"></button>\n      <nav class=\"shinobiDrawerPainel\" aria-label=\"Menu principal\">\n        <div class=\"shinobiDrawerTopo\">\n          <div class=\"shinobiDrawerMarca\">\n            <strong>FICHA NINJA RPG</strong>\n            <small>DISCIPLINA \u00B7 ESTRAT\u00C9GIA \u00B7 EVOLU\u00C7\u00C3O</small>\n          </div>\n          <span class=\"shinobiDrawerKanji\" aria-hidden=\"true\">\u5FCD</span>\n          <button type=\"button\" class=\"shinobiDrawerFechar\" aria-label=\"Fechar menu\">".concat(iconHTML("close"), "</button>\n        </div>\n\n        <section class=\"shinobiDrawerPerfil\" aria-label=\"Personagem atual\">\n          <button type=\"button\" class=\"shinobiDrawerAvatar shinobiDrawerAvatarBtn\" data-drawer-action=\"sheets\" aria-label=\"Abrir gerenciamento de fichas\" aria-expanded=\"false\" title=\"Gerenciar fichas\">\n            <img data-drawer-profile-image alt=\"Avatar do personagem\" hidden>\n            <span data-drawer-profile-fallback>").concat(iconHTML("profile"), "</span>\n          </button>\n          <div class=\"shinobiDrawerPerfilTexto\">\n            <strong data-drawer-profile-name>Ninja</strong>\n            <span data-drawer-profile-meta>N\u00EDvel 1 \u00B7 Shinobi</span>\n            <small><span class=\"shinobiIcon icon-profile\" aria-hidden=\"true\"></span><b data-drawer-profile-role>Jogador</b></small>\n            <em class=\"shinobiDrawerPerfilDica\">Toque na foto para gerenciar fichas</em>\n          </div>\n        </section>\n\n        <div class=\"shinobiDrawerFichasConteudo\" data-drawer-sheets hidden>\n          <button type=\"button\" class=\"shinobiDrawerSubvoltar\" data-drawer-action=\"back-menu\" aria-label=\"Voltar ao menu principal\">\n            <span aria-hidden=\"true\">\u2190</span><b>Voltar</b>\n          </button>\n          <div class=\"shinobiDrawerFichasCabecalho\">\n            <strong>FICHAS</strong>\n            <small>Troque, crie e gerencie seus personagens</small>\n          </div>\n          <div class=\"shinobiDrawerFichasLegado\" data-drawer-sheets-legacy></div>\n        </div>\n\n        <div class=\"shinobiDrawerGrupo shinobiDrawerConta\">\n          <h3>CONTA</h3>\n          <button type=\"button\" class=\"shinobiDrawerItem shinobiDrawerItemExpansivel\" data-drawer-action=\"account\" aria-expanded=\"false\">\n            <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("profile"), "</span>\n            <span class=\"shinobiDrawerItemTexto\"><b>Minha conta</b><small>Login, conta e sincroniza\u00E7\u00E3o</small></span>\n            <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n          </button>\n          <div class=\"shinobiDrawerConfigConteudo shinobiDrawerContaConteudo\" data-drawer-account hidden>\n            <button type=\"button\" class=\"shinobiDrawerSubvoltar\" data-drawer-action=\"back-menu\" aria-label=\"Voltar ao menu principal\">\n              <span aria-hidden=\"true\">\u2190</span><b>Voltar</b>\n            </button>\n            <button type=\"button\" class=\"shinobiDrawerSubitem\" data-drawer-action=\"account-login\">\n              <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("profile"), "</span>\n              <span class=\"shinobiDrawerItemTexto\"><b>Login e autentica\u00E7\u00E3o</b><small>Entrar, sair ou usar sess\u00E3o tempor\u00E1ria</small></span>\n              <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n            </button>\n            <button type=\"button\" class=\"shinobiDrawerSubitem\" data-drawer-action=\"login\">\n              <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("sync"), "</span>\n              <span class=\"shinobiDrawerItemTexto\"><b>Conta conectada</b><small data-drawer-connected-account-meta>Nenhuma conta conectada</small></span>\n              <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n            </button>\n            <button type=\"button\" class=\"shinobiDrawerSubitem shinobiDrawerSyncSubitem\" data-drawer-action=\"sync\" data-drawer-sync>\n              <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("cloud"), "</span>\n              <span class=\"shinobiDrawerItemTexto\"><b>Sincroniza\u00E7\u00E3o</b><small><i class=\"shinobiDrawerStatusDot\"></i><span data-drawer-sync-text>Somente neste aparelho</span></small></span>\n              <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n            </button>\n          </div>\n        </div>\n\n        <div class=\"shinobiDrawerGrupo\">\n          <h3>MESA ONLINE</h3>\n          <button type=\"button\" class=\"shinobiDrawerItem\" data-drawer-action=\"create-room\">\n            <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("plus"), "</span>\n            <span class=\"shinobiDrawerItemTexto\"><b>\u00C1rea do Mestre</b><small>Campanhas, sess\u00F5es e gest\u00E3o permanente</small></span>\n            <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n          </button>\n          <button type=\"button\" class=\"shinobiDrawerItem\" data-drawer-action=\"join-room\">\n            <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("download"), "</span>\n            <span class=\"shinobiDrawerItemTexto\"><b>Entrar em sala</b><small>Junte-se a uma campanha</small></span>\n            <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n          </button>\n          <button type=\"button\" class=\"shinobiDrawerItem\" data-drawer-action=\"current-room\">\n            <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("attributes"), "</span>\n            <span class=\"shinobiDrawerItemTexto\"><b>Sala atual</b><small data-drawer-room-current>Nenhuma sala ativa</small></span>\n            <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n          </button>\n        </div>\n\n        <div class=\"shinobiDrawerGrupo shinobiDrawerConfiguracoes\">\n          <h3>CONFIGURA\u00C7\u00D5ES</h3>\n          <button type=\"button\" class=\"shinobiDrawerItem shinobiDrawerItemExpansivel\" data-drawer-action=\"settings\" aria-expanded=\"false\">\n            <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("settings"), "</span>\n            <span class=\"shinobiDrawerItemTexto\"><b>Configura\u00E7\u00F5es</b><small>Ajustes gerais do aplicativo</small></span>\n            <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n          </button>\n          <div class=\"shinobiDrawerConfigConteudo\" data-drawer-config hidden>\n            <div data-drawer-config-main>\n              <button type=\"button\" class=\"shinobiDrawerSubvoltar\" data-drawer-action=\"back-menu\" aria-label=\"Voltar ao menu principal\">\n                <span aria-hidden=\"true\">\u2190</span><b>Voltar</b>\n              </button>\n              <p class=\"shinobiDrawerSubtitulo shinobiPersonalizacaoTitulo\">PERSONALIZA\u00C7\u00C3O</p>\n              <button type=\"button\" class=\"shinobiDrawerSubitem\" data-drawer-action=\"themes\">\n                <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("store"), "</span>\n                <span class=\"shinobiDrawerItemTexto\"><b>Loja de temas</b><small>Em breve</small></span>\n                <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n              </button>\n              <button type=\"button\" class=\"shinobiDrawerSubitem\" data-drawer-action=\"personalization\">\n                <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("image"), "</span>\n                <span class=\"shinobiDrawerItemTexto\"><b>Apar\u00EAncia</b><small>Prefer\u00EAncias visuais \u00B7 em breve</small></span>\n                <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n              </button>\n              <p class=\"shinobiDrawerSubtitulo shinobiDrawerSobreTitulo\">SOBRE</p>\n              <button type=\"button\" class=\"shinobiDrawerSubitem\" data-drawer-action=\"about\">\n                <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("notes"), "</span>\n                <span class=\"shinobiDrawerItemTexto\"><b>Sobre o app</b><small>Vers\u00E3o, atualiza\u00E7\u00F5es e informa\u00E7\u00F5es</small></span>\n                <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n              </button>\n              <button type=\"button\" class=\"shinobiDrawerSubitem\" data-drawer-action=\"help\">\n                <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("book"), "</span>\n                <span class=\"shinobiDrawerItemTexto\"><b>Ajuda</b><small>Guias e suporte</small></span>\n                <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n              </button>\n              <button type=\"button\" class=\"shinobiDrawerSubitem\" data-drawer-action=\"feedback\">\n                <span class=\"shinobiDrawerItemIcon\">").concat(iconHTML("edit"), "</span>\n                <span class=\"shinobiDrawerItemTexto\"><b>Feedback</b><small>Envie uma sugest\u00E3o</small></span>\n                <span class=\"shinobiDrawerChevron\" aria-hidden=\"true\">\u203A</span>\n              </button>\n            </div>\n            <div data-drawer-about hidden>\n              <button type=\"button\" class=\"shinobiDrawerSubvoltar\" data-drawer-action=\"back-settings\" aria-label=\"Voltar \u00E0s configura\u00E7\u00F5es\">\n                <span aria-hidden=\"true\">\u2190</span><b>Voltar</b>\n              </button>\n              <div class=\"shinobiDrawerFichasCabecalho\">\n                <strong>SOBRE O APP</strong>\n                <small>Vers\u00E3o, atualiza\u00E7\u00F5es e informa\u00E7\u00F5es do aplicativo</small>\n              </div>\n              <div class=\"shinobiDrawerConfigLegado\" data-drawer-about-legacy></div>\n            </div>\n          </div>\n        </div>\n\n        <footer class=\"shinobiDrawerRodape\">\n          <span>v").concat(String(window.APP_VERSION || ""), "</span>\n          <em>Grandes ninjas tamb\u00E9m escrevem suas hist\u00F3rias.</em>\n        </footer>\n      </nav>");
        document.body.appendChild(drawer);
        migrarGerenciamentoFichas(drawer);
        migrarConfiguracoesLegadas(drawer);
        (_a = drawer.querySelector('[data-drawer-action="settings"]')) === null || _a === void 0 ? void 0 : _a.classList.toggle("temAtualizacao", document.documentElement.classList.contains("shinobiTemAtualizacao"));
        var backdrop = drawer.querySelector(".shinobiDrawerBackdrop");
        var painel = drawer.querySelector(".shinobiDrawerPainel");
        backdrop === null || backdrop === void 0 ? void 0 : backdrop.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            fecharShinobiDrawer();
        });
        (_b = drawer.querySelector(".shinobiDrawerFechar")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            fecharShinobiDrawer();
        });
        // O painel é uma superfície interativa própria. Impedir que pointer/touch
        // escapem daqui evita "ghost taps" no conteúdo da ficha que fica atrás.
        ["pointerdown", "pointerup", "touchstart", "touchend"].forEach(function (tipo) {
            painel === null || painel === void 0 ? void 0 : painel.addEventListener(tipo, function (event) { return event.stopPropagation(); }, { passive: true });
        });
        painel === null || painel === void 0 ? void 0 : painel.addEventListener("click", function (event) {
            var botao = event.target.closest("[data-drawer-action]");
            if (!botao || !painel.contains(botao))
                return;
            event.preventDefault();
            event.stopPropagation();
            var acao = botao.dataset.drawerAction;
            if (acao === "back-menu") {
                fecharSubpainelDrawer();
                return;
            }
            if (acao === "back-settings") {
                alternarSobreDrawer(false);
                return;
            }
            if (acao === "sheets") {
                alternarFichasDrawer();
                return;
            }
            if (acao === "account") {
                alternarContaDrawer();
                return;
            }
            if (acao === "account-login") {
                void abrirPainelOnline("login", botao);
                return;
            }
            if (acao === "login") {
                void abrirPainelOnline("conta-conectada", botao);
                return;
            }
            if (acao === "sync") {
                void abrirPainelOnline("sincronizacao", botao);
                return;
            }
            if (acao === "create-room") {
                void abrirPainelOnline("area-mestre", botao);
                return;
            }
            if (acao === "join-room") {
                void abrirPainelOnline("entrar-sala", botao);
                return;
            }
            if (acao === "current-room") {
                void abrirPainelOnline("sala-atual", botao);
                return;
            }
            if (acao === "settings") {
                alternarConfiguracoesDrawer();
                return;
            }
            if (acao === "themes") {
                avisoEmBreve("Loja de temas");
                return;
            }
            if (acao === "personalization") {
                avisoEmBreve("Personalização");
                return;
            }
            if (acao === "about") {
                alternarSobreDrawer(true);
                return;
            }
            if (acao === "help") {
                avisoEmBreve("Ajuda");
                return;
            }
            if (acao === "feedback") {
                avisoEmBreve("Feedback");
                return;
            }
        });
        if (!window.__shinobiDrawerTeclado) {
            window.__shinobiDrawerTeclado = true;
            document.addEventListener("keydown", function (event) { if (event.key === "Escape")
                fecharShinobiDrawer(); });
            /* Android/PWA transforma o gesto/botão Voltar em navegação do histórico.
               Ao abrir o drawer criamos uma entrada efêmera; voltar consome essa
               entrada e fecha o menu, em vez de exigir o X ou sair do aplicativo. */
            window.addEventListener("popstate", function () {
                var _a;
                if (document.body.classList.contains("shinobiDrawerAberto")) {
                    // Se uma caixa retrátil está aberta, o primeiro Voltar fecha apenas
                    // essa caixa e mantém o menu. O próximo Voltar fecha o drawer.
                    if (fecharSubpainelDrawer()) {
                        empilharHistoricoDrawer();
                        return;
                    }
                    fecharShinobiDrawer({ viaHistorico: true });
                    return;
                }
                // Quando um painel Online foi aberto pelo drawer, a entrada do menu
                // continua logo abaixo no histórico. Não a descarte: o painel Online
                // irá reabrir o drawer ao voltar.
                if ((_a = history.state) === null || _a === void 0 ? void 0 : _a.shinobiDrawerToken) {
                    drawerHistoryToken = String(history.state.shinobiDrawerToken);
                    return;
                }
                drawerHistoryToken = "";
            });
        }
        if (((_c = window.ShinobiOnline) === null || _c === void 0 ? void 0 : _c.on) && !drawer.dataset.onlineBound) {
            drawer.dataset.onlineBound = "1";
            ["status", "pronto", "auth", "status-sync", "sala", "sala-encerrada", "ficha-sincronizada"].forEach(function (tipo) {
                try {
                    window.ShinobiOnline.on(tipo, function () { return atualizarDrawerContexto(); });
                }
                catch (_erro) { }
            });
        }
        atualizarDrawerContexto();
    }
    window.toggleShinobiDrawer = function () {
        instalarDrawer();
        var deveAbrir = !document.body.classList.contains("shinobiDrawerAberto");
        if (!deveAbrir) {
            fecharShinobiDrawer();
            return;
        }
        mostrarShinobiDrawer({ empilhar: true });
    };
    function instalarMelhorias() {
        aplicarIcones(document);
        instalarDrawer();
        var original = window.abrirPagina;
        if (typeof original === "function" && !original.__shinobiWrapped) {
            var wrapped = function (id, botao) {
                var r = original.apply(this, arguments);
                document.body.dataset.pagina = id;
                requestAnimationFrame(function () {
                    aplicarIcones(document);
                    document.dispatchEvent(new CustomEvent("shinobi:pagechange", { detail: { id: id } }));
                });
                return r;
            };
            wrapped.__shinobiWrapped = true;
            window.abrirPagina = wrapped;
        }
        var ativa = document.querySelector(".pagina.ativa");
        if (ativa)
            document.body.dataset.pagina = ativa.id;
    }
    document.addEventListener("DOMContentLoaded", function () {
        instalarMelhorias();
        var pendentes = new Set();
        var frameIcones = 0;
        var agendarIcones = function () {
            if (frameIcones)
                return;
            frameIcones = requestAnimationFrame(function () {
                frameIcones = 0;
                var raizes = __spreadArray([], __read(pendentes), false);
                pendentes.clear();
                raizes.forEach(function (raiz) {
                    if (raiz === null || raiz === void 0 ? void 0 : raiz.isConnected)
                        aplicarIcones(raiz);
                });
            });
        };
        var obs = new MutationObserver(function (muts) {
            var e_2, _a, e_3, _b;
            try {
                for (var muts_1 = __values(muts), muts_1_1 = muts_1.next(); !muts_1_1.done; muts_1_1 = muts_1.next()) {
                    var mut = muts_1_1.value;
                    try {
                        for (var _c = (e_3 = void 0, __values(mut.addedNodes)), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var node = _d.value;
                            if (node.nodeType === 1)
                                pendentes.add(node);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (muts_1_1 && !muts_1_1.done && (_a = muts_1.return)) _a.call(muts_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            if (pendentes.size)
                agendarIcones();
        });
        obs.observe(document.body, { childList: true, subtree: true });
    });
})();
