/* GERADO AUTOMATICAMENTE — fonte: js/20-online-ui.js — app 2.5.8.154. Não editar. */
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
/* Ficha Ninja RPG — interface de mesa online e backup. */
(function () {
    "use strict";
    var root = null;
    var aberto = false;
    var renderTimer = null;
    var scannerStream = null;
    var scannerFrame = null;
    var conflitoAtual = null;
    var painelFlutuante = null;
    var arrastoPainel = null;
    var ignorarCliquePainel = false;
    var campanhaMenuAberto = null;
    var destinoAtual = null;
    var onlineHistoryToken = "";
    var onlineHistorySeq = 0;
    var origemOnline = "";
    var ultimaVerificacaoSync = 0;
    var backupsHistoricos = [];
    var backupsCarregando = false;
    var backupsErro = "";
    var backupSheetId = "";
    var modoMesaMestre = "combate";
    var campanhaMestreId = "";
    var CHAVE_PAINEL_FLUTUANTE = "shinobi_online_widget_v1";
    var CHAVE_MODO_MESA_MESTRE = "shinobi_master_room_view_v1";
    var CHAVE_CAMPANHA_MESTRE = "shinobi_master_campaign_v1";
    try {
        modoMesaMestre = localStorage.getItem(CHAVE_MODO_MESA_MESTRE) === "gestao" ? "gestao" : "combate";
    }
    catch (_erro) { }
    try {
        campanhaMestreId = String(localStorage.getItem(CHAVE_CAMPANHA_MESTRE) || "");
    }
    catch (_erro) { }
    var esc = function (valor) { return String(valor == null ? "" : valor).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); };
    var num = function (v, p) {
        if (p === void 0) { p = 0; }
        return Number.isFinite(Number(v)) ? Number(v) : p;
    };
    var pct = function (atual, max) { var m = num(max); return m > 0 ? Math.max(0, Math.min(100, Math.round((num(atual) / m) * 100))) : 0; };
    var listaDeObjeto = function (valor) { return Object.values(valor || {}); };
    var participantesComId = function (valor) { return Object.entries(valor || {}).map(function (_a) {
        var _b = __read(_a, 2), participantId = _b[0], p = _b[1];
        return (__assign(__assign({}, (p && typeof p === "object" ? p : {})), { id: String(participantId) }));
    }); };
    function formDataParaObjeto(dados, form) {
        var out = {};
        if (dados && typeof dados.forEach === "function") {
            dados.forEach(function (valor, chave) { out[chave] = valor; });
            return out;
        }
        var elementos = Array.from((form === null || form === void 0 ? void 0 : form.elements) || []);
        elementos.forEach(function (el) {
            var nome = String((el === null || el === void 0 ? void 0 : el.name) || "");
            if (!nome || el.disabled)
                return;
            if ((el.type === "checkbox" || el.type === "radio") && !el.checked)
                return;
            out[nome] = el.value;
        });
        return out;
    }
    function obterEstado() { var _a, _b; return ((_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.snapshot) === null || _b === void 0 ? void 0 : _b.call(_a)) || {}; }
    function sessaoLocal() { try {
        return JSON.parse(localStorage.getItem("shinobi_online_session_v1") || "null");
    }
    catch (_erro) {
        return null;
    } }
    function nomeFichaAtiva() { try {
        return String(localStorage.getItem("ficha_ninja_ativa_v1") || "Principal");
    }
    catch (_erro) {
        return "Principal";
    } }
    function fichaAtivaDifereDaSessao(sessao) {
        return Boolean((sessao === null || sessao === void 0 ? void 0 : sessao.role) === "player" && (sessao === null || sessao === void 0 ? void 0 : sessao.localSheetName) && String(sessao.localSheetName) !== nomeFichaAtiva());
    }
    function ehMestre(st) {
        var sessao = sessaoLocal();
        return Boolean((st === null || st === void 0 ? void 0 : st.user) && (st === null || st === void 0 ? void 0 : st.sala) && st.sala.masterUid === st.user.uid && (sessao === null || sessao === void 0 ? void 0 : sessao.role) === "master" && (!sessao.roomId || sessao.roomId === st.sala.id));
    }
    function participantes(st) { var _a; return participantesComId((_a = st === null || st === void 0 ? void 0 : st.sala) === null || _a === void 0 ? void 0 : _a.participants).sort(function (a, b) { return String(a.displayName || "").localeCompare(String(b.displayName || ""), "pt-BR"); }); }
    function campanhaMestreAtual(st) { return ((st === null || st === void 0 ? void 0 : st.campanhas) || []).find(function (c) { return String(c.id) === String(campanhaMestreId); }) || null; }
    function selecionarCampanhaMestre(campaignId) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        campanhaMestreId = String(campaignId || "");
        try {
            if (campanhaMestreId)
                localStorage.setItem(CHAVE_CAMPANHA_MESTRE, campanhaMestreId);
            else
                localStorage.removeItem(CHAVE_CAMPANHA_MESTRE);
        }
        catch (_erro) { }
        if (campanhaMestreId) {
            (_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.observarMembrosCampanha) === null || _b === void 0 ? void 0 : _b.call(_a, campanhaMestreId).catch(function () { });
            (_d = (_c = window.ShinobiOnline) === null || _c === void 0 ? void 0 : _c.observarNpcsCampanha) === null || _d === void 0 ? void 0 : _d.call(_c, campanhaMestreId).catch(function () { });
        }
        else {
            (_f = (_e = window.ShinobiOnline) === null || _e === void 0 ? void 0 : _e.pararObservacaoMembrosCampanha) === null || _f === void 0 ? void 0 : _f.call(_e);
            (_h = (_g = window.ShinobiOnline) === null || _g === void 0 ? void 0 : _g.pararObservacaoNpcsCampanha) === null || _h === void 0 ? void 0 : _h.call(_g);
        }
    }
    function ordem(st) { var _a, _b; return ((_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.normalizarOrdem) === null || _b === void 0 ? void 0 : _b.call(_a)) || []; }
    function participanteAtual(st) { var _a, _b, _c, _d; var o = ordem(st); return ((_b = (_a = st === null || st === void 0 ? void 0 : st.sala) === null || _a === void 0 ? void 0 : _a.participants) === null || _b === void 0 ? void 0 : _b[o[num((_d = (_c = st === null || st === void 0 ? void 0 : st.sala) === null || _c === void 0 ? void 0 : _c.combat) === null || _d === void 0 ? void 0 : _d.turnIndex)]]) || null; }
    function presencaConectada(registro, participantId) {
        if (participantId === void 0) { participantId = ""; }
        var alvo = String(participantId || "");
        var devices = Object.values((registro === null || registro === void 0 ? void 0 : registro.devices) || {});
        if (devices.length) {
            if (!alvo)
                return devices.some(function (device) { return (device === null || device === void 0 ? void 0 : device.connected) === true; });
            /* Em contas com vários personagens, um aparelho conectado não pode fazer
               todos os personagens daquele mesmo UID parecerem online. Se ao menos um
               device usa o formato moderno, participantId precisa coincidir. */
            var modernos = devices.filter(function (device) { return device && Object.prototype.hasOwnProperty.call(device, "participantId"); });
            if (modernos.length)
                return modernos.some(function (device) { return (device === null || device === void 0 ? void 0 : device.connected) === true && String(device.participantId || "") === alvo; });
            return devices.some(function (device) { return (device === null || device === void 0 ? void 0 : device.connected) === true; }); // presença legada sem participantId
        }
        return (registro === null || registro === void 0 ? void 0 : registro.connected) === true; // compatibilidade com versões antigas
    }
    function conectado(st, p) { var _a; return p.type === "player" && presencaConectada((_a = st === null || st === void 0 ? void 0 : st.presencas) === null || _a === void 0 ? void 0 : _a[p.ownerUid], p.id); }
    function rodadasRestantes(efeito, combat) {
        var _a;
        var rodadaAtual = Math.max(1, num(combat === null || combat === void 0 ? void 0 : combat.round, 1));
        var indiceAtual = Math.max(0, num(combat === null || combat === void 0 ? void 0 : combat.turnIndex));
        var rodadaFim = Math.max(1, num(efeito === null || efeito === void 0 ? void 0 : efeito.expiresAtRound, rodadaAtual));
        var indiceFim = Math.max(0, num((_a = efeito === null || efeito === void 0 ? void 0 : efeito.expiresAtTurnIndex) !== null && _a !== void 0 ? _a : efeito === null || efeito === void 0 ? void 0 : efeito.startTurnIndex));
        if (rodadaAtual > rodadaFim || (rodadaAtual === rodadaFim && indiceAtual >= indiceFim))
            return 0;
        var diferenca = rodadaFim - rodadaAtual;
        return diferenca > 0 ? diferenca : 1;
    }
    function preferenciasPainel() {
        var padrao = { modo: "minimizado", x: null, y: null };
        try {
            var salvo = JSON.parse(localStorage.getItem(CHAVE_PAINEL_FLUTUANTE) || "null");
            if (!salvo || typeof salvo !== "object")
                return padrao;
            return {
                modo: salvo.modo === "expandido" ? "expandido" : "minimizado",
                x: salvo.x !== null && salvo.x !== "" && Number.isFinite(Number(salvo.x)) ? Number(salvo.x) : null,
                y: salvo.y !== null && salvo.y !== "" && Number.isFinite(Number(salvo.y)) ? Number(salvo.y) : null
            };
        }
        catch (_erro) {
            return padrao;
        }
    }
    function salvarPreferenciasPainel(alteracoes) {
        if (alteracoes === void 0) { alteracoes = {}; }
        var atual = preferenciasPainel();
        var novo = __assign(__assign({}, atual), alteracoes);
        novo.modo = novo.modo === "expandido" ? "expandido" : "minimizado";
        try {
            localStorage.setItem(CHAVE_PAINEL_FLUTUANTE, JSON.stringify(novo));
        }
        catch (_erro) { }
        return novo;
    }
    function proximoParticipante(st) {
        var _a, _b, _c;
        var lista = ordem(st), combat = ((_a = st === null || st === void 0 ? void 0 : st.sala) === null || _a === void 0 ? void 0 : _a.combat) || {};
        if (!combat.started || !lista.length)
            return null;
        var indice = (Math.max(0, num(combat.turnIndex)) + 1) % lista.length;
        return ((_c = (_b = st === null || st === void 0 ? void 0 : st.sala) === null || _b === void 0 ? void 0 : _b.participants) === null || _c === void 0 ? void 0 : _c[lista[indice]]) || null;
    }
    function efeitosDoPainel(st) {
        var _a, _b;
        var ativos = listaDeObjeto((_a = st === null || st === void 0 ? void 0 : st.sala) === null || _a === void 0 ? void 0 : _a.effects).filter(function (e) { return (e === null || e === void 0 ? void 0 : e.status) === "active"; });
        if (ehMestre(st))
            return ativos;
        var participanteId = (_b = sessaoLocal()) === null || _b === void 0 ? void 0 : _b.participantId;
        return participanteId ? ativos.filter(function (e) { return e.participantId === participanteId; }) : [];
    }
    function textoMecanicaRemota(item) {
        var direto = String((item === null || item === void 0 ? void 0 : item.text) || "").trim();
        if (direto)
            return direto;
        var alvo = String((item === null || item === void 0 ? void 0 : item.target) || "efeito").replace(/_/g, " ");
        var valor = item === null || item === void 0 ? void 0 : item.value;
        if ((item === null || item === void 0 ? void 0 : item.operation) === "multiplicar" && valor !== "" && valor !== undefined)
            return "".concat(alvo, " \u00D7").concat(valor);
        if (["somar", "subtrair"].includes(item === null || item === void 0 ? void 0 : item.operation) && valor !== "" && valor !== undefined) {
            var n = Number(valor), formatado = Number.isFinite(n) && n > 0 ? "+".concat(n) : String(valor);
            return "".concat(alvo, " ").concat(formatado);
        }
        return valor !== "" && valor !== undefined ? "".concat(alvo, ": ").concat(valor) : alvo;
    }
    function mecanicasDoEfeito(efeito) {
        var detalhes = Array.isArray(efeito === null || efeito === void 0 ? void 0 : efeito.details) ? efeito.details : [];
        return detalhes.map(textoMecanicaRemota).filter(Boolean);
    }
    function resumoDoEfeito(efeito) {
        var resumo = String((efeito === null || efeito === void 0 ? void 0 : efeito.summary) || "").trim();
        if (resumo)
            return resumo;
        return mecanicasDoEfeito(efeito).slice(0, 4).join(" • ");
    }
    function conexaoPainel(st) {
        var _a, _b;
        if (navigator.onLine === false)
            return "offline";
        var presenca = (_a = st === null || st === void 0 ? void 0 : st.presencas) === null || _a === void 0 ? void 0 : _a[(_b = st === null || st === void 0 ? void 0 : st.user) === null || _b === void 0 ? void 0 : _b.uid];
        if (presencaConectada(presenca))
            return "online";
        if (st === null || st === void 0 ? void 0 : st.conectado)
            return "conectando";
        return "offline";
    }
    function instalarPainelFlutuante() {
        if (painelFlutuante && document.body.contains(painelFlutuante))
            return painelFlutuante;
        painelFlutuante = document.getElementById("shinobiTurnoFlutuante");
        if (!painelFlutuante) {
            painelFlutuante = document.createElement("aside");
            painelFlutuante.id = "shinobiTurnoFlutuante";
            painelFlutuante.className = "shinobiTurnoFlutuante";
            painelFlutuante.hidden = true;
            painelFlutuante.setAttribute("aria-label", "Mostrador flutuante da mesa online");
            document.body.appendChild(painelFlutuante);
        }
        if (!painelFlutuante.dataset.eventosInstalados) {
            painelFlutuante.dataset.eventosInstalados = "1";
            painelFlutuante.addEventListener("click", tratarCliquePainel);
            painelFlutuante.addEventListener("pointerdown", iniciarArrastoPainel);
            painelFlutuante.addEventListener("pointermove", moverPainel);
            painelFlutuante.addEventListener("pointerup", finalizarArrastoPainel);
            painelFlutuante.addEventListener("pointercancel", finalizarArrastoPainel);
        }
        if (!window.__shinobiPainelFlutuanteResize) {
            window.__shinobiPainelFlutuanteResize = true;
            window.addEventListener("resize", function () { return ajustarPosicaoPainel(); }, { passive: true });
            window.addEventListener("orientationchange", function () { return setTimeout(ajustarPosicaoPainel, 120); }, { passive: true });
        }
        return painelFlutuante;
    }
    function limitesPainel() {
        if (!painelFlutuante)
            return { minX: 8, minY: 8, maxX: 8, maxY: 8 };
        var rect = painelFlutuante.getBoundingClientRect();
        var margem = 8;
        var reservaInferior = 78;
        return {
            minX: margem,
            minY: margem,
            maxX: Math.max(margem, window.innerWidth - rect.width - margem),
            maxY: Math.max(margem, window.innerHeight - rect.height - reservaInferior)
        };
    }
    function posicionarPainel(x, y, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.salvar, salvar = _c === void 0 ? true : _c;
        if (!painelFlutuante || painelFlutuante.hidden)
            return;
        var limites = limitesPainel();
        var xFinal = Math.min(limites.maxX, Math.max(limites.minX, num(x, limites.maxX)));
        var yFinal = Math.min(limites.maxY, Math.max(limites.minY, num(y, limites.maxY)));
        painelFlutuante.style.left = "".concat(Math.round(xFinal), "px");
        painelFlutuante.style.top = "".concat(Math.round(yFinal), "px");
        painelFlutuante.style.right = "auto";
        painelFlutuante.style.bottom = "auto";
        if (salvar)
            salvarPreferenciasPainel({ x: Math.round(xFinal), y: Math.round(yFinal) });
    }
    function ajustarPosicaoPainel() {
        if (!painelFlutuante || painelFlutuante.hidden)
            return;
        requestAnimationFrame(function () {
            if (!painelFlutuante || painelFlutuante.hidden)
                return;
            var pref = preferenciasPainel(), rect = painelFlutuante.getBoundingClientRect();
            var x = pref.x == null ? window.innerWidth - rect.width - 12 : pref.x;
            var y = pref.y == null ? window.innerHeight - rect.height - 92 : pref.y;
            posicionarPainel(x, y);
        });
    }
    function iniciarArrastoPainel(evento) {
        var _a;
        var alca = evento.target.closest("[data-widget-drag]");
        if (!alca || evento.target.closest("[data-widget-no-drag]") || evento.button > 0)
            return;
        var rect = painelFlutuante.getBoundingClientRect();
        arrastoPainel = {
            pointerId: evento.pointerId,
            inicioX: evento.clientX, inicioY: evento.clientY,
            origemX: rect.left, origemY: rect.top, movido: false
        };
        (_a = painelFlutuante.setPointerCapture) === null || _a === void 0 ? void 0 : _a.call(painelFlutuante, evento.pointerId);
        painelFlutuante.classList.add("arrastando");
    }
    function moverPainel(evento) {
        if (!arrastoPainel || arrastoPainel.pointerId !== evento.pointerId)
            return;
        var dx = evento.clientX - arrastoPainel.inicioX, dy = evento.clientY - arrastoPainel.inicioY;
        if (!arrastoPainel.movido && Math.hypot(dx, dy) < 4)
            return;
        arrastoPainel.movido = true;
        evento.preventDefault();
        posicionarPainel(arrastoPainel.origemX + dx, arrastoPainel.origemY + dy, { salvar: false });
    }
    function finalizarArrastoPainel(evento) {
        var _a;
        if (!arrastoPainel || arrastoPainel.pointerId !== evento.pointerId)
            return;
        var movido = arrastoPainel.movido;
        arrastoPainel = null;
        (_a = painelFlutuante.releasePointerCapture) === null || _a === void 0 ? void 0 : _a.call(painelFlutuante, evento.pointerId);
        painelFlutuante.classList.remove("arrastando");
        if (movido) {
            var rect = painelFlutuante.getBoundingClientRect();
            posicionarPainel(rect.left, rect.top);
            ignorarCliquePainel = true;
            setTimeout(function () { ignorarCliquePainel = false; }, 280);
        }
    }
    function renderPainelFlutuante(st) {
        var _a;
        if (st === void 0) { st = obterEstado(); }
        instalarPainelFlutuante();
        var sessao = sessaoLocal();
        var reconectando = Boolean((sessao === null || sessao === void 0 ? void 0 : sessao.roomId) && (st === null || st === void 0 ? void 0 : st.user) && !(st === null || st === void 0 ? void 0 : st.sala) && (st === null || st === void 0 ? void 0 : st.configurado));
        if (!(st === null || st === void 0 ? void 0 : st.sala) && !reconectando) {
            painelFlutuante.hidden = true;
            return;
        }
        painelFlutuante.hidden = false;
        var pref = preferenciasPainel(), expandido = pref.modo === "expandido";
        painelFlutuante.classList.toggle("expandido", expandido);
        painelFlutuante.classList.toggle("minimizado", !expandido);
        if (reconectando) {
            painelFlutuante.className = "shinobiTurnoFlutuante ".concat(expandido ? "expandido" : "minimizado", " reconectando");
            painelFlutuante.innerHTML = expandido ? "\n        <header class=\"shinobiTurnoWidgetCabecalho\" data-widget-drag>\n          <span class=\"shinobiTurnoWidgetAlca\" aria-hidden=\"true\">\u283F</span>\n          <div><small>MESA ONLINE</small><strong>Reconectando \u00E0 sala...</strong></div>\n          <button type=\"button\" data-widget-action=\"minimizar\" data-widget-no-drag aria-label=\"Minimizar mostrador\">\u2212</button>\n        </header>\n        <div class=\"shinobiTurnoWidgetCorpo\"><p class=\"shinobiTurnoWidgetStatus\">Recuperando a \u00FAltima sala usada neste aparelho.</p></div>\n        <footer class=\"shinobiTurnoWidgetRodape\"><button type=\"button\" class=\"onlineBtn secundario\" data-widget-action=\"abrir-sala\">Entrar na sala</button></footer>" : "\n        <button type=\"button\" class=\"shinobiTurnoWidgetMini\" data-widget-action=\"alternar\" data-widget-drag>\n          <span class=\"shinobiTurnoWidgetDot conectando\" aria-hidden=\"true\"></span>\n          <span><small>MESA ONLINE</small><strong>Reconectando...</strong></span>\n          <em>\u2303</em>\n        </button>";
            ajustarPosicaoPainel();
            return;
        }
        var master = ehMestre(st), combat = ((_a = st.sala) === null || _a === void 0 ? void 0 : _a.combat) || {}, lista = ordem(st);
        var atual = participanteAtual(st), proximo = proximoParticipante(st);
        var rodada = Math.max(1, num(combat.round, 1));
        var fichaTrocada = fichaAtivaDifereDaSessao(sessao);
        var fichaAtiva = nomeFichaAtiva();
        var meuId = sessao === null || sessao === void 0 ? void 0 : sessao.participantId, meuTurno = Boolean(!fichaTrocada && combat.started && meuId && (atual === null || atual === void 0 ? void 0 : atual.id) === meuId);
        var conexao = conexaoPainel(st);
        var statusTurno = fichaTrocada
            ? "".concat(fichaAtiva, " ainda n\u00E3o entrou nesta sala")
            : (combat.started ? (meuTurno ? "É o seu turno" : "Turno de ".concat((atual === null || atual === void 0 ? void 0 : atual.displayName) || "—")) : "Combate ainda não iniciado");
        var efeitos = efeitosDoPainel(st).slice(0, 3);
        var efeitosHtml = efeitos.length ? efeitos.map(function (efeito) {
            var _a, _b;
            var participante = (_b = (_a = st.sala) === null || _a === void 0 ? void 0 : _a.participants) === null || _b === void 0 ? void 0 : _b[efeito.participantId];
            var complemento = master && participante ? " \u2022 ".concat(participante.displayName) : "";
            var resumo = resumoDoEfeito(efeito);
            return "<li><span class=\"shinobiTurnoEfeitoTexto\"><strong>".concat(esc(efeito.name || "Efeito")).concat(esc(complemento), "</strong>").concat(resumo ? "<small>".concat(esc(resumo), "</small>") : "", "</span><b>").concat(rodadasRestantes(efeito, combat), "r</b></li>");
        }).join("") : "<li class=\"vazio\"><span>Nenhum efeito ativo</span></li>";
        painelFlutuante.className = "shinobiTurnoFlutuante ".concat(expandido ? "expandido" : "minimizado", " ").concat(meuTurno ? "meuTurno" : "").trim();
        painelFlutuante.innerHTML = expandido ? "\n      <header class=\"shinobiTurnoWidgetCabecalho\" data-widget-drag>\n        <span class=\"shinobiTurnoWidgetAlca\" aria-hidden=\"true\">\u283F</span>\n        <div><small>SALA ".concat(esc(st.sala.code || ""), "</small><strong>").concat(esc(st.sala.title || "Mesa online"), "</strong></div>\n        <button type=\"button\" data-widget-action=\"minimizar\" data-widget-no-drag aria-label=\"Minimizar mostrador\">\u2212</button>\n      </header>\n      <div class=\"shinobiTurnoWidgetCorpo\">\n        <div class=\"shinobiTurnoWidgetResumo\">\n          <div><small>RODADA</small><strong>").concat(rodada, "</strong></div>\n          <div><small>TURNO ATUAL</small><strong>").concat(esc((atual === null || atual === void 0 ? void 0 : atual.displayName) || "Aguardando"), "</strong><em>").concat(lista.length ? "".concat(num(combat.turnIndex) + 1, " de ").concat(lista.length) : "Sem iniciativa", "</em></div>\n        </div>\n        <p class=\"shinobiTurnoWidgetStatus ").concat(meuTurno ? "destaque" : "", "\"><span class=\"shinobiTurnoWidgetDot ").concat(conexao, "\" aria-hidden=\"true\"></span>").concat(esc(statusTurno), "</p>\n        <div class=\"shinobiTurnoWidgetProximo\"><small>PR\u00D3XIMO</small><strong>").concat(esc((proximo === null || proximo === void 0 ? void 0 : proximo.displayName) || "—"), "</strong></div>\n        <div class=\"shinobiTurnoWidgetEfeitos\"><small>").concat(master ? "EFEITOS ATIVOS" : "SEUS EFEITOS", "</small><ul>").concat(efeitosHtml, "</ul></div>\n      </div>\n      <footer class=\"shinobiTurnoWidgetRodape\">\n        ").concat(master ? (combat.started ? "<div class=\"shinobiTurnoWidgetControles\"><button type=\"button\" class=\"onlineBtn secundario\" data-widget-action=\"turno-anterior\">\u2039 Anterior</button><button type=\"button\" class=\"onlineBtn primario\" data-widget-action=\"proximo-turno\">Pr\u00F3ximo \u203A</button></div>" : "<button type=\"button\" class=\"onlineBtn primario\" data-widget-action=\"iniciar-combate\">Iniciar combate</button>") : "", "\n        <button type=\"button\" class=\"onlineBtn secundario entrarSala\" data-widget-action=\"abrir-sala\">").concat(fichaTrocada ? "Entrar com ".concat(esc(fichaAtiva)) : "Abrir sala", "</button>\n      </footer>") : "\n      <button type=\"button\" class=\"shinobiTurnoWidgetMini\" data-widget-action=\"alternar\" data-widget-drag aria-label=\"Expandir mostrador da mesa online\">\n        <span class=\"shinobiTurnoWidgetDot ".concat(conexao, "\" aria-hidden=\"true\"></span>\n        <span><small>RODADA ").concat(rodada, "</small><strong>").concat(esc(statusTurno), "</strong></span>\n        <em>\u2303</em>\n      </button>");
        ajustarPosicaoPainel();
    }
    function tratarCliquePainel(evento) {
        return __awaiter(this, void 0, void 0, function () {
            var el, acao, modo;
            return __generator(this, function (_a) {
                if (ignorarCliquePainel) {
                    evento.preventDefault();
                    evento.stopPropagation();
                    return [2 /*return*/];
                }
                el = evento.target.closest("[data-widget-action]");
                if (!el)
                    return [2 /*return*/];
                acao = el.dataset.widgetAction;
                if (acao === "alternar") {
                    modo = preferenciasPainel().modo === "expandido" ? "minimizado" : "expandido";
                    salvarPreferenciasPainel({ modo: modo });
                    renderPainelFlutuante();
                    return [2 /*return*/];
                }
                if (acao === "minimizar") {
                    salvarPreferenciasPainel({ modo: "minimizado" });
                    renderPainelFlutuante();
                    return [2 /*return*/];
                }
                if (acao === "abrir-sala")
                    return [2 /*return*/, abrir()];
                if (acao === "turno-anterior")
                    return [2 /*return*/, executar(function () { return window.ShinobiOnline.voltarTurno(); })];
                if (acao === "proximo-turno")
                    return [2 /*return*/, executar(function () { return window.ShinobiOnline.avancarTurno(); })];
                if (acao === "iniciar-combate")
                    return [2 /*return*/, executar(function () { return window.ShinobiOnline.iniciarCombate(); })];
                return [2 /*return*/];
            });
        });
    }
    function instalarBotao() {
        var _a, _b, _c;
        // A navegação online agora pertence integralmente ao menu lateral esquerdo.
        // Mantemos apenas o widget de batalha/sala, sem recriar atalhos no cabeçalho
        // ou no antigo menu de configurações.
        (_a = document.getElementById("shinobiOnlineMenuBtn")) === null || _a === void 0 ? void 0 : _a.remove();
        (_b = document.getElementById("shinobiOnlineTopoBtn")) === null || _b === void 0 ? void 0 : _b.remove();
        (_c = document.getElementById("shinobiTurnoMini")) === null || _c === void 0 ? void 0 : _c.remove();
        instalarPainelFlutuante();
        atualizarIndicadores();
    }
    function criarRoot() {
        if (root)
            return root;
        root = document.createElement("div");
        root.id = "shinobiOnlineOverlay";
        root.className = "shinobiOnlineOverlay";
        root.hidden = true;
        root.innerHTML = "\n      <div class=\"shinobiOnlineShell\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Mesa online\">\n        <header class=\"shinobiOnlineHeader\">\n          <div class=\"shinobiOnlineHeaderNavegacao\">\n            <button type=\"button\" class=\"shinobiOnlineVoltar\" data-action=\"back-panel\" aria-label=\"Voltar para a tela anterior\"><span aria-hidden=\"true\">\u2190</span><b>Voltar</b></button>\n            <div><span class=\"shinobiOnlineEyebrow\">FICHA NINJA</span><h2>Mesa online</h2></div>\n          </div>\n          <button type=\"button\" class=\"shinobiOnlineFechar\" data-action=\"close\" aria-label=\"Fechar\">\u00D7</button>\n        </header>\n        <div id=\"shinobiOnlineConteudo\" class=\"shinobiOnlineConteudo\"></div>\n      </div>\n      <div id=\"shinobiScanner\" class=\"shinobiScanner\" hidden>\n        <div class=\"shinobiScannerBox\">\n          <h3>Escanear QR Code</h3>\n          <video id=\"shinobiScannerVideo\" playsinline muted></video>\n          <div class=\"scannerMoldura\"></div>\n          <p id=\"shinobiScannerStatus\">Aponte a c\u00E2mera para o QR Code da sala.</p>\n          <button type=\"button\" class=\"onlineBtn secundario\" data-action=\"stop-scan\">Cancelar</button>\n        </div>\n      </div>";
        document.body.appendChild(root);
        root.addEventListener("click", tratarClique);
        root.addEventListener("submit", tratarSubmit);
        root.addEventListener("change", tratarChange);
        if (!window.__shinobiOnlineHistorico) {
            window.__shinobiOnlineHistorico = true;
            window.addEventListener("popstate", function () {
                var _a, _b;
                if (!aberto)
                    return;
                if (onlineHistoryToken && ((_a = history.state) === null || _a === void 0 ? void 0 : _a.shinobiOnlineToken) === onlineHistoryToken)
                    return;
                var voltarDrawer = origemOnline === "drawer" && Boolean((_b = history.state) === null || _b === void 0 ? void 0 : _b.shinobiDrawerToken);
                fecharDireto({ viaHistorico: true, reabrirDrawer: voltarDrawer });
            });
        }
        return root;
    }
    function normalizarDestino(destino) {
        var valor = String(destino || "").trim().toLowerCase();
        if (valor === "conta")
            return "conta-conectada"; // compatibilidade com atalhos antigos
        if (valor === "criar-sala")
            return "area-mestre"; // atalho legado agora abre a área permanente da campanha
        var permitidos = new Set(["login", "conta-conectada", "sincronizacao", "backups", "area-mestre", "entrar-sala", "sala-atual"]);
        return permitidos.has(valor) ? valor : null;
    }
    function aplicarDestino() {
        if (!destinoAtual || !root)
            return;
        requestAnimationFrame(function () {
            var mapa = {
                "login": "[data-online-destino=\"login\"]",
                "conta-conectada": "[data-online-destino=\"conta-conectada\"]",
                "sincronizacao": "[data-online-destino=\"sincronizacao\"]",
                "backups": "[data-online-destino=\"backups\"]",
                "area-mestre": "[data-online-destino=\"area-mestre\"]",
                "entrar-sala": "form[data-form=\"join-room\"]",
                "sala-atual": ".onlineSalaTopo,[data-online-destino=\"sala-atual\"]"
            };
            var alvo = root.querySelector(mapa[destinoAtual] || "");
            if (!alvo)
                return;
            if (destinoAtual === "entrar-sala") {
                setTimeout(function () { var _a; return (_a = alvo.querySelector('input[name="code"]')) === null || _a === void 0 ? void 0 : _a.focus({ preventScroll: true }); }, 180);
            }
        });
    }
    function atualizarCabecalhoDestino() {
        if (!root)
            return;
        var h2 = root.querySelector(".shinobiOnlineHeader h2");
        var eyebrow = root.querySelector(".shinobiOnlineHeader .shinobiOnlineEyebrow");
        var mapa = {
            "login": ["CONTA", "Minha conta"],
            "conta-conectada": ["CONTA", "Conta conectada"],
            "sincronizacao": ["NUVEM", "Sincronização"],
            "backups": ["NUVEM", "Backups da ficha"],
            "area-mestre": ["CAMPANHA", "Área do Mestre"],
            "entrar-sala": ["SALA", "Entrar em sala"],
            "sala-atual": ["SALA", "Sala atual"]
        };
        var _a = __read(mapa[destinoAtual] || ["FICHA NINJA", "Mesa online"], 2), rotulo = _a[0], titulo = _a[1];
        if (eyebrow)
            eyebrow.textContent = rotulo;
        if (h2)
            h2.textContent = titulo;
    }
    function verificarSincronizacaoAoAbrir() {
        if (destinoAtual !== "sincronizacao")
            return;
        var st = obterEstado();
        if (!st.user || st.user.anonymous)
            return;
        var agora = Date.now();
        if (agora - ultimaVerificacaoSync < 5000)
            return;
        ultimaVerificacaoSync = agora;
        setTimeout(function () {
            var _a, _b, _c, _d;
            /* A área de nuvem é sob demanda. Abrir o painel lista backups, mas não
               baixa, envia ou reconcilia fichas completas. */
            try {
                (_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.ativarBackupsNuvem) === null || _b === void 0 ? void 0 : _b.call(_a);
            }
            catch (_erro) { }
            (_d = (_c = window.EkoRealtimeSync) === null || _c === void 0 ? void 0 : _c.reconciliar) === null || _d === void 0 ? void 0 : _d.call(_c).catch(function () { });
        }, 80);
    }
    function empilharHistoricoOnline() {
        var _a;
        if (!((_a = window.history) === null || _a === void 0 ? void 0 : _a.pushState))
            return;
        var token = "online_".concat(Date.now().toString(36), "_").concat((++onlineHistorySeq).toString(36));
        try {
            var estado = __assign({}, ((history.state && typeof history.state === "object") ? history.state : {}));
            delete estado.shinobiDrawerToken;
            history.pushState(__assign(__assign({}, estado), { shinobiOnlineToken: token, shinobiOnlineDestino: destinoAtual || "" }), "", location.href);
            onlineHistoryToken = token;
        }
        catch (_erro) {
            onlineHistoryToken = "";
        }
    }
    function fecharDireto(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.viaHistorico, viaHistorico = _c === void 0 ? false : _c, _d = _b.reabrirDrawer, reabrirDrawer = _d === void 0 ? false : _d;
        aberto = false;
        destinoAtual = null;
        pararScanner();
        if (root) {
            root.hidden = true;
            root.setAttribute("aria-hidden", "true");
        }
        document.body.classList.remove("onlineAberto");
        if (viaHistorico)
            onlineHistoryToken = "";
        if (reabrirDrawer && origemOnline === "drawer") {
            requestAnimationFrame(function () { var _a; return (_a = window.reabrirShinobiDrawerDoHistorico) === null || _a === void 0 ? void 0 : _a.call(window); });
        }
        if (!reabrirDrawer)
            origemOnline = "";
    }
    function voltarPainelOnline() {
        var _a;
        if (!aberto)
            return false;
        if (onlineHistoryToken && ((_a = history.state) === null || _a === void 0 ? void 0 : _a.shinobiOnlineToken) === onlineHistoryToken) {
            try {
                history.back();
                return true;
            }
            catch (_erro) { }
        }
        var voltarDrawer = origemOnline === "drawer";
        fecharDireto({ viaHistorico: true, reabrirDrawer: voltarDrawer });
        return true;
    }
    function abrir(destino, opcoes) {
        if (opcoes === void 0) { opcoes = {}; }
        destinoAtual = normalizarDestino(destino);
        origemOnline = (opcoes === null || opcoes === void 0 ? void 0 : opcoes.origem) === "drawer" ? "drawer" : "app";
        try {
            criarRoot();
            aberto = true;
            root.hidden = false;
            root.removeAttribute("hidden");
            root.setAttribute("aria-hidden", "false");
            document.body.classList.add("onlineAberto");
            try {
                renderizar();
            }
            catch (erroRender) {
                console.error("Falha ao renderizar o painel Online:", erroRender);
                var conteudo = document.getElementById("shinobiOnlineConteudo");
                if (conteudo) {
                    conteudo.innerHTML = "<section class=\"onlineCard\"><h3>Painel online</h3><p>O painel foi aberto, mas ocorreu um erro ao montar o conte\u00FAdo.</p><button type=\"button\" class=\"onlineBtn primario\" data-action=\"retry-online\">Tentar novamente</button></section>";
                }
            }
            verificarSincronizacaoAoAbrir();
            empilharHistoricoOnline();
            // Reafirma a visibilidade no frame seguinte. Isso protege PWAs/WebViews
            // que recalculam a camada ao mesmo tempo em que o drawer lateral fecha.
            requestAnimationFrame(function () {
                if (!aberto || !root)
                    return;
                root.hidden = false;
                root.removeAttribute("hidden");
                root.setAttribute("aria-hidden", "false");
                document.body.classList.add("onlineAberto");
                aplicarDestino();
            });
            return true;
        }
        catch (erro) {
            aberto = false;
            document.body.classList.remove("onlineAberto");
            console.error("Falha ao abrir o painel Online:", erro);
            return false;
        }
    }
    function fechar() { return voltarPainelOnline(); }
    function atualizarIndicadores() {
        var st = obterEstado();
        var ativo = Boolean(st.configurado && st.conectado);
        var emSala = Boolean(st.salaId && st.sala);
        var card = document.querySelector("[data-drawer-sync]");
        if (card) {
            card.classList.toggle("onlineAtivo", ativo);
            card.classList.toggle("onlineEmSala", emSala);
            if (ativo)
                card.classList.remove("onlineErro");
        }
        renderPainelFlutuante(st);
    }
    function agendarRender() {
        atualizarIndicadores();
        if (!aberto)
            return;
        clearTimeout(renderTimer);
        var foco = document.activeElement;
        var editando = foco && (root === null || root === void 0 ? void 0 : root.contains(foco)) && /INPUT|TEXTAREA|SELECT/.test(foco.tagName);
        renderTimer = setTimeout(renderizar, editando ? 650 : 40);
    }
    function cabecalhoConta(st) {
        if (!st.user)
            return "";
        var subtitulo = st.user.anonymous
            ? "Sem conta • dados somente neste aparelho"
            : "".concat(st.user.email || "Conta Google", " \u2022 nuvem ativa");
        var sync = st.syncAtual || {};
        var fase = String(sync.phase || "");
        var temPendencia = fase === "pending" || fase === "conflict" || fase === "syncing";
        var classeSync = st.user.anonymous ? "local" : sync.syncStatus === 1 ? "ok" : fase === "syncing" ? "syncing" : temPendencia ? "pending" : "ok";
        var textoSync = st.user.anonymous
            ? "Somente local"
            : sync.syncStatus === 1
                ? "✓ Sincronizado"
                : fase === "syncing"
                    ? "↻ Sincronizando..."
                    : fase === "conflict"
                        ? "⚠ Conflito"
                        : fase === "pending"
                            ? (sync.pendingMode === "turno" ? "⚠ Pendente do turno" : "⚠ Pendente")
                            : "✓ Pronto";
        return "<div class=\"onlineConta\">\n      <div class=\"onlineAvatar\">".concat(st.user.photoURL ? "<img src=\"".concat(esc(st.user.photoURL), "\" alt=\"\">") : st.user.anonymous ? "🥷" : "👤", "</div>\n      <div class=\"onlineContaIdentidade\"><strong>").concat(esc(st.user.displayName || "Jogador"), "</strong><small>").concat(esc(subtitulo), "</small><span class=\"onlineSyncEstado ").concat(classeSync, "\">").concat(esc(textoSync), "</span></div>\n      <div class=\"onlineContaAcoes\">\n        ").concat(st.user.anonymous ? "<button type=\"button\" class=\"onlineBtn primario compacto\" data-action=\"login-google\">Entrar com Google</button>" : "", "\n        <button type=\"button\" class=\"onlineBtn texto\" data-action=\"logout\">Sair</button>\n      </div>\n    </div>");
    }
    function renderConfiguracao() {
        return "<section class=\"onlineCard onlineSetup\">\n      <span class=\"onlineCardSelo\">CONFIGURA\u00C7\u00C3O NECESS\u00C1RIA</span>\n      <h3>Conecte o aplicativo ao Firebase</h3>\n      <p>A parte online j\u00E1 est\u00E1 instalada no projeto, mas precisa receber as informa\u00E7\u00F5es do seu Firebase antes de criar salas e backups.</p>\n      <ol>\n        <li>Crie o projeto e o aplicativo Web no Firebase.</li>\n        <li>Ative login Google e An\u00F4nimo.</li>\n        <li>Crie o Realtime Database e publique as regras inclu\u00EDdas no ZIP.</li>\n        <li>Cole o objeto de configura\u00E7\u00E3o em <code>js/18-online-config.js</code>.</li>\n      </ol>\n      <p class=\"onlineAjuda\">O guia completo est\u00E1 em <code>firebase/SETUP-FIREBASE.md</code>.</p>\n    </section>";
    }
    function renderLogin() {
        return "<div class=\"onlineGridDois\">\n      <section class=\"onlineCard destaqueMestre\">\n        <span class=\"onlineCardSelo\">CONTA E NUVEM</span>\n        <h3>Entrar com Google</h3>\n        <p>Serve para mestre e jogador. Permite salvar a ficha na nuvem, baixar em outro aparelho e manter celular e tablet sincronizados.</p>\n        <button type=\"button\" class=\"onlineBtn primario\" data-action=\"login-google\">Entrar com Google</button>\n      </section>\n      <section class=\"onlineCard\">\n        <span class=\"onlineCardSelo\">SEM CONTA</span>\n        <h3>Jogar temporariamente</h3>\n        <p>Permite entrar na sala sem cadastro, mas a ficha n\u00E3o poder\u00E1 ser recuperada em outro aparelho.</p>\n        <button type=\"button\" class=\"onlineBtn secundario\" data-action=\"login-anonymous\">Continuar sem sincroniza\u00E7\u00E3o</button>\n      </section>\n    </div>";
    }
    function opcoesFichasLocais(selecionada) {
        var _a, _b;
        if (selecionada === void 0) { selecionada = ""; }
        return (((_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.listarFichasLocais) === null || _b === void 0 ? void 0 : _b.call(_a)) || []).map(function (f) { return "<option value=\"".concat(esc(f.name), "\" ").concat(f.name === selecionada ? "selected" : "", ">").concat(esc(f.characterName), " \u2014 ").concat(esc(f.name), "</option>"); }).join("");
    }
    function renderEntradaSala(st) {
        var _a, _b, _c, _d;
        var codigoUrl = ((_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.codigoDaUrl) === null || _b === void 0 ? void 0 : _b.call(_a)) || "";
        var contaPermanente = Boolean((st === null || st === void 0 ? void 0 : st.user) && !st.user.anonymous);
        var fichaAtiva = nomeFichaAtiva();
        var fichaAtivaInfo = (((_d = (_c = window.ShinobiOnline) === null || _c === void 0 ? void 0 : _c.listarFichasLocais) === null || _d === void 0 ? void 0 : _d.call(_c)) || []).find(function (f) { return String(f.name) === String(fichaAtiva); });
        var personagemAtivo = String((fichaAtivaInfo === null || fichaAtivaInfo === void 0 ? void 0 : fichaAtivaInfo.characterName) || fichaAtiva);
        var vinculo = contaPermanente ? "\n      <fieldset class=\"onlineVinculoCampanha\">\n        <legend>V\u00EDnculo do personagem</legend>\n        <label class=\"onlineVinculoOpcao\">\n          <input type=\"radio\" name=\"membershipMode\" value=\"campaign\" checked>\n          <span><b>Adicionar \u00E0 campanha</b><small>Fica reconhecido nas pr\u00F3ximas sess\u00F5es desta campanha.</small></span>\n        </label>\n        <label class=\"onlineVinculoOpcao\">\n          <input type=\"radio\" name=\"membershipMode\" value=\"session\">\n          <span><b>Somente nesta sess\u00E3o</b><small>Entra na sala sem criar um v\u00EDnculo permanente novo.</small></span>\n        </label>\n      </fieldset>" : "\n      <input type=\"hidden\" name=\"membershipMode\" value=\"session\">\n      <p class=\"onlineAjuda onlineVinculoTemporario\">Sem Conta Google, o personagem entra somente nesta sess\u00E3o.</p>";
        return "<section class=\"onlineCard\">\n      <span class=\"onlineCardSelo\">ENTRAR EM UMA SALA</span>\n      <h3>C\u00F3digo ou QR Code</h3>\n      <form data-form=\"join-room\" class=\"onlineForm\">\n        <label>C\u00F3digo da sala<input name=\"code\" maxlength=\"6\" autocomplete=\"off\" value=\"".concat(esc(codigoUrl), "\" placeholder=\"ABC234\" required></label>\n        <label>Ficha usada na mesa<input value=\"").concat(esc(personagemAtivo), " \u2014 ").concat(esc(fichaAtiva), "\" readonly></label>\n        <input type=\"hidden\" name=\"localSheetName\" value=\"").concat(esc(fichaAtiva), "\">\n        <p class=\"onlineAjuda\">A sala usa sempre a ficha que est\u00E1 aberta no aplicativo. Para entrar com outra personagem, troque de ficha primeiro.</p>\n        ").concat(vinculo, "\n        <div class=\"onlineAcoesLinha\">\n          <button class=\"onlineBtn primario\" type=\"submit\">Entrar na sala</button>\n          <button class=\"onlineBtn secundario\" type=\"button\" data-action=\"scan-qr\">Escanear QR</button>\n        </div>\n      </form>\n    </section>");
    }
    function formatarDataSessao(timestamp) {
        var valor = Number(timestamp || 0);
        if (!valor)
            return "Data indisponível";
        try {
            return new Date(valor).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
        }
        catch (_erro) {
            return new Date(valor).toLocaleDateString("pt-BR");
        }
    }
    function renderMestreHome(st) {
        var campanhas = st.campanhas || [];
        var listaCampanhas = campanhas.length ? "\n      <div class=\"onlineCampanhasTitulo\"><h4>Suas campanhas</h4><small>".concat(campanhas.length, " cadastrada(s)</small></div>\n      <div class=\"onlineCampanhasLista\">\n        ").concat(campanhas.map(function (c) {
            var salas = Object.values(c.rooms || {});
            var abertas = salas.filter(function (sala) { return (sala === null || sala === void 0 ? void 0 : sala.status) === "open"; }).length;
            var menuAberto = campanhaMenuAberto === c.id;
            return "<article class=\"onlineCampanhaItem onlineCampanhaItemAbrir ".concat(menuAberto ? "menuAberto" : "", "\">\n            <button type=\"button\" class=\"onlineCampanhaMenuBtn\" data-action=\"toggle-campaign-menu\" data-campaign-id=\"").concat(esc(c.id), "\" aria-label=\"Op\u00E7\u00F5es da campanha ").concat(esc(c.name), "\" aria-expanded=\"").concat(menuAberto ? "true" : "false", "\">\u22EE</button>\n            <div class=\"onlineCampanhaInfo\">\n              <small>CAMPANHA</small>\n              <strong>").concat(esc(c.name), "</strong>\n              <span>").concat(salas.length ? "".concat(salas.length, " sess\u00E3o(\u00F5es)").concat(abertas ? " \u2022 ".concat(abertas, " aberta(s)") : "") : "Nenhuma sessão criada", "</span>\n            </div>\n            <button type=\"button\" class=\"onlineBtn secundario compacto onlineCampanhaAbrirBtn\" data-action=\"open-campaign\" data-campaign-id=\"").concat(esc(c.id), "\">Abrir campanha</button>\n            ").concat(menuAberto ? "<div class=\"onlineCampanhaMenu\" role=\"menu\">\n              <button type=\"button\" data-action=\"edit-campaign\" data-campaign-id=\"".concat(esc(c.id), "\" role=\"menuitem\">Editar nome</button>\n              <button type=\"button\" class=\"perigo\" data-action=\"delete-campaign\" data-campaign-id=\"").concat(esc(c.id), "\" role=\"menuitem\">Excluir campanha</button>\n            </div>") : "", "\n          </article>");
        }).join(""), "\n      </div>") : "";
        return "<section class=\"onlineCard destaqueMestre\">\n      <span class=\"onlineCardSelo\">\u00C1REA DO MESTRE</span>\n      <h3>Campanhas</h3>\n      <p>Abra uma campanha para administrar sua estrutura permanente. Criar uma sala passa a ser uma a\u00E7\u00E3o dentro da campanha.</p>\n      <form data-form=\"create-campaign\" class=\"onlineForm onlineFormLinha\">\n        <label>Nova campanha<input name=\"name\" maxlength=\"80\" placeholder=\"Cr\u00F4nicas de Konoha\" required></label>\n        <button class=\"onlineBtn secundario\" type=\"submit\">Criar campanha</button>\n      </form>\n      ".concat(listaCampanhas || "<p class=\"onlineVazio\">Crie a primeira campanha para come\u00E7ar a \u00C1rea do Mestre.</p>", "\n    </section>");
    }
    function renderCampanhaMestre(st, campanha) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (st.membrosCampanhaId !== campanha.id) {
            (_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.observarMembrosCampanha) === null || _b === void 0 ? void 0 : _b.call(_a, campanha.id).catch(function () { });
        }
        if (st.npcsCampanhaId !== campanha.id) {
            (_d = (_c = window.ShinobiOnline) === null || _c === void 0 ? void 0 : _c.observarNpcsCampanha) === null || _d === void 0 ? void 0 : _d.call(_c, campanha.id).catch(function () { });
        }
        if (st.xpLedgerCampanhaId !== campanha.id) {
            (_f = (_e = window.ShinobiOnline) === null || _e === void 0 ? void 0 : _e.observarXpCampanha) === null || _f === void 0 ? void 0 : _f.call(_e, campanha.id).catch(function () { });
        }
        var membrosCarregados = st.membrosCampanhaId === campanha.id;
        var todosMembros = membrosCarregados ? st.membrosCampanha : [];
        var membros = todosMembros.filter(function (m) { return (m === null || m === void 0 ? void 0 : m.status) !== "inactive"; });
        var membrosInativos = todosMembros.filter(function (m) { return (m === null || m === void 0 ? void 0 : m.status) === "inactive"; });
        var npcsCarregados = st.npcsCampanhaId === campanha.id;
        var npcs = (npcsCarregados ? st.npcsCampanha : []).filter(function (npc) { return (npc === null || npc === void 0 ? void 0 : npc.status) !== "inactive"; });
        var xpCarregado = st.xpLedgerCampanhaId === campanha.id;
        var historicoXp = xpCarregado ? (st.xpLedgerCampanha || []) : [];
        var recibosXp = st.xpReceiptsCampanhaId === campanha.id ? (st.xpReceiptsCampanha || {}) : {};
        var xpConfirmados = historicoXp.filter(function (item) { var _a; return ((_a = recibosXp === null || recibosXp === void 0 ? void 0 : recibosXp[item.id]) === null || _a === void 0 ? void 0 : _a.status) === "received"; }).length;
        var sessoes = Object.entries(campanha.rooms || {}).map(function (_a) {
            var _b = __read(_a, 2), id = _b[0], sala = _b[1];
            return (__assign({ id: id }, (sala || {})));
        }).sort(function (a, b) { return num(b.createdAt) - num(a.createdAt); });
        var abertas = sessoes.filter(function (s) { return s.status === "open"; });
        var encerradas = sessoes.filter(function (s) { return s.status !== "open"; });
        var sessaoAtualId = String(((_g = st.sala) === null || _g === void 0 ? void 0 : _g.id) || st.salaId || "");
        var cardSessao = function (sessao) {
            var aberta = sessao.status === "open";
            var atual = aberta && sessaoAtualId === String(sessao.id);
            return "<article class=\"onlineCampanhaSessao ".concat(aberta ? "aberta" : "encerrada", "\">\n        <div>\n          <small>").concat(aberta ? "SESSÃO ABERTA" : "SESSÃO ENCERRADA", "</small>\n          <strong>").concat(esc(sessao.title || "Sessão"), "</strong>\n          <span>").concat(esc(formatarDataSessao(sessao.createdAt))).concat(sessao.code ? " \u2022 ".concat(esc(sessao.code)) : "", "</span>\n        </div>\n        ").concat(aberta ? "<button type=\"button\" class=\"onlineBtn ".concat(atual ? "primario" : "secundario", " compacto\" data-action=\"open-campaign-room\" data-campaign-id=\"").concat(esc(campanha.id), "\" data-room-id=\"").concat(esc(sessao.id), "\">").concat(atual ? "Abrir sala atual" : "Entrar como mestre", "</button>") : "", "\n      </article>");
        };
        var diagnosticoMembro = function (membro) {
            var _a, _b;
            try {
                return ((_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.diagnosticarMembroCampanhaLocal) === null || _b === void 0 ? void 0 : _b.call(_a, membro)) || { status: "remote", owned: false };
            }
            catch (_erro) {
                return { status: "remote", owned: false };
            }
        };
        var listaMembros = !membrosCarregados
            ? "<p class=\"onlineVazio\">Carregando jogadores da campanha...</p>"
            : membros.length
                ? "<div class=\"onlineCampanhaMembros\">".concat(membros.map(function (membro) {
                    var diag = diagnosticoMembro(membro);
                    var proprio = diag.owned === true;
                    var vinculo = diag.status === "linked"
                        ? "V\u00EDnculo local confirmado".concat(diag.localSheetName ? " \u2022 ".concat(esc(diag.localSheetName)) : "")
                        : diag.status === "stale" ? "Vínculo antigo neste aparelho"
                            : diag.status === "ambiguous" ? "Vínculo local ambíguo"
                                : "Vínculo permanente";
                    var botaoReassociar = proprio && (diag.status === "stale" || diag.status === "ambiguous")
                        ? "<button type=\"button\" class=\"onlineBtn texto compacto\" data-action=\"rebind-campaign-member\" data-campaign-id=\"".concat(esc(campanha.id), "\" data-user-id=\"").concat(esc(membro.userId), "\" data-character-id=\"").concat(esc(membro.characterId), "\" data-display-name=\"").concat(esc(membro.displayName || "Personagem"), "\">Reassociar \u00E0 ficha aberta</button>") : "";
                    return "<article class=\"onlineCampanhaMembro\">\n              <div class=\"onlineCampanhaMembroIcone\">\u5FCD</div>\n              <div><small>PERSONAGEM DA CAMPANHA</small><strong>".concat(esc(membro.displayName || "Personagem"), "</strong><span>").concat(vinculo).concat(membro.joinedAt ? " \u2022 desde ".concat(esc(formatarDataSessao(membro.joinedAt))) : "", "</span><div class=\"onlineAcoesLinha\">").concat(botaoReassociar, "<button type=\"button\" class=\"onlineBtn texto perigo compacto\" data-action=\"remove-campaign-member\" data-campaign-id=\"").concat(esc(campanha.id), "\" data-user-id=\"").concat(esc(membro.userId), "\" data-character-id=\"").concat(esc(membro.characterId), "\" data-display-name=\"").concat(esc(membro.displayName || "Personagem"), "\">Remover da campanha</button></div></div>\n            </article>");
                }).join(""), "</div>")
                : "<p class=\"onlineVazio\">Nenhum personagem permanente ainda. O primeiro v\u00EDnculo ser\u00E1 criado quando um jogador entrar em uma sala escolhendo \u201CAdicionar \u00E0 campanha\u201D.</p>";
        var listaMembrosInativos = membrosInativos.length ? "<details class=\"onlineSubDetails\">\n      <summary>Removidos e v\u00EDnculos antigos (".concat(membrosInativos.length, ")</summary>\n      <div class=\"onlineCampanhaMembros\">").concat(membrosInativos.map(function (membro) {
            var substituido = Boolean(membro.replacedByCharacterId);
            var descricao = substituido
                ? "Vínculo antigo substituído por uma identidade mais nova. Mantido apenas para histórico."
                : "Removido da campanha. Não recebe XP novo nem é reconhecido como membro permanente.";
            var acao = substituido ? "" : "<div class=\"onlineAcoesLinha\"><button type=\"button\" class=\"onlineBtn texto compacto\" data-action=\"restore-campaign-member\" data-campaign-id=\"".concat(esc(campanha.id), "\" data-user-id=\"").concat(esc(membro.userId), "\" data-character-id=\"").concat(esc(membro.characterId), "\" data-display-name=\"").concat(esc(membro.displayName || "Personagem"), "\">Reativar</button></div>");
            return "<article class=\"onlineCampanhaMembro\">\n          <div class=\"onlineCampanhaMembroIcone\">\u5FCD</div>\n          <div><small>".concat(substituido ? "VÍNCULO ANTIGO" : "REMOVIDO DA CAMPANHA", "</small><strong>").concat(esc(membro.displayName || "Personagem"), "</strong><span>").concat(descricao, "</span>").concat(acao, "</div>\n        </article>");
        }).join(""), "</div>\n    </details>") : "";
        var listaNpcs = !npcsCarregados
            ? "<p class=\"onlineVazio\">Carregando biblioteca de NPCs...</p>"
            : npcs.length
                ? "<div class=\"onlineCampanhaNpcs\">".concat(npcs.map(function (npc) {
                    var b = npc.battleTemplate || {};
                    var origem = npc.sourceType === "sheet" ? "Ficha importada".concat(npc.sourceSheetName ? " \u2022 ".concat(esc(npc.sourceSheetName)) : "") : "Criado na campanha";
                    return "<article class=\"onlineCampanhaNpc\">\n              <div class=\"onlineCampanhaNpcTopo\"><div><small>NPC PERMANENTE</small><strong>".concat(esc(npc.displayName || "NPC"), "</strong><span>").concat(origem, "</span></div><div class=\"onlineCampanhaNpcAcoes\"><button type=\"button\" class=\"onlineBtn texto compacto\" data-action=\"edit-campaign-npc\" data-campaign-id=\"").concat(esc(campanha.id), "\" data-npc-id=\"").concat(esc(npc.id), "\">Editar</button><button type=\"button\" class=\"onlineBtn texto perigo compacto\" data-action=\"archive-campaign-npc\" data-campaign-id=\"").concat(esc(campanha.id), "\" data-npc-id=\"").concat(esc(npc.id), "\">Arquivar</button></div></div>\n              <div class=\"onlineCampanhaNpcStats\"><span>PV <b>").concat(num(b.pvMax), "</b></span><span>Chakra <b>").concat(num(b.chakraMax), "</b></span><span>CA <b>").concat(num(b.ca, 10), "</b></span><span>Init. <b>").concat(num(b.initiativeBonus) >= 0 ? "+" : "").concat(num(b.initiativeBonus), "</b></span></div>\n              ").concat(npc.privateNotes ? "<p class=\"onlineCampanhaNpcNota\"><b>Privado:</b> ".concat(esc(String(npc.privateNotes).slice(0, 180))).concat(String(npc.privateNotes).length > 180 ? "…" : "", "</p>") : "", "\n            </article>");
                }).join(""), "</div>")
                : "<p class=\"onlineVazio\">Nenhum NPC permanente ainda. Crie um aqui ou importe uma ficha existente.</p>";
        return "<div class=\"onlineDestinoPagina\" data-online-destino=\"area-mestre\">\n      ".concat(cabecalhoConta(st), "\n      <section class=\"onlineCard onlineCampanhaHero\">\n        <div class=\"onlineCampanhaHeroTopo\">\n          <button type=\"button\" class=\"onlineBtn texto compacto\" data-action=\"back-campaigns\">\u2039 Campanhas</button>\n          <span class=\"onlineCampanhaVersao\">Campanha permanente</span>\n        </div>\n        <span class=\"onlineCardSelo\">\u00C1REA DO MESTRE</span>\n        <h3>").concat(esc(campanha.name), "</h3>\n        <p>A campanha existe mesmo sem uma sala aberta. As salas abaixo s\u00E3o sess\u00F5es tempor\u00E1rias ligadas a ela.</p>\n        ").concat(((_h = st.sala) === null || _h === void 0 ? void 0 : _h.campaignId) === campanha.id ? "<div class=\"onlineCampanhaSalaAtiva\"><span>\u25CF Sess\u00E3o ativa agora</span><strong>".concat(esc(st.sala.title || "Sala atual"), "</strong><button type=\"button\" class=\"onlineBtn secundario compacto\" data-action=\"open-current-room\">Abrir sala</button></div>") : "", "\n      </section>\n\n      <section class=\"onlineCard onlineCampanhaArquitetura\">\n        <div class=\"onlineCardTitulo\"><div><span class=\"onlineCardSelo\">GEST\u00C3O PERMANENTE</span><h3>Base da campanha</h3></div><small>").concat(membros.length, " personagem(s)</small></div>\n        <p>Jogadores e NPCs permanentes agora pertencem \u00E0 campanha. A sala recebe apenas c\u00F3pias tempor\u00E1rias para aquela sess\u00E3o.</p>\n        <div class=\"onlineCampanhaModulos\">\n          <div class=\"ativo\"><b>Jogadores</b><span>V\u00EDnculos permanentes</span><em>Ativo</em></div>\n          <div class=\"ativo\"><b>NPCs</b><span>Biblioteca da campanha</span><em>Ativo</em></div>\n          <div class=\"ativo\"><b>XP</b><span>Hist\u00F3rico e recompensas</span><em>Ativo</em></div>\n          <div><b>Encontros e notas</b><span>Prepara\u00E7\u00E3o do mestre</span><em>Pr\u00F3xima etapa</em></div>\n        </div>\n        <div class=\"onlineCampanhaMembrosTitulo\"><strong>Jogadores da campanha</strong><small>Reconhecidos por conta + personagem</small></div>\n        ").concat(listaMembros, "\n        ").concat(listaMembrosInativos, "\n        <div class=\"onlineCampanhaMembrosTitulo onlineCampanhaNpcTitulo\"><strong>NPCs e inimigos</strong><small>").concat(npcs.length, " permanente(s) na biblioteca</small></div>\n        ").concat(listaNpcs, "\n        <details class=\"onlineSubDetails onlineNpcBibliotecaCriar\">\n          <summary>Adicionar NPC \u00E0 biblioteca</summary>\n          <div class=\"onlineGridDois\">\n            <form data-form=\"save-campaign-npc-sheet\" class=\"onlineForm onlineSubCard\">\n              <input type=\"hidden\" name=\"campaignId\" value=\"").concat(esc(campanha.id), "\">\n              <h4>Importar ficha existente</h4>\n              <p>Salva um modelo permanente na campanha. A ficha original continua independente.</p>\n              <label>Ficha<select name=\"localSheetName\">").concat(opcoesFichasLocais(), "</select></label>\n              <label>Nome na campanha<input name=\"displayName\" maxlength=\"80\" placeholder=\"Opcional\"></label>\n              <label>Notas privadas do mestre<textarea name=\"privateNotes\" maxlength=\"4000\" placeholder=\"Segredos, objetivos, t\u00E1ticas... N\u00E3o v\u00E3o para os jogadores.\"></textarea></label>\n              <button class=\"onlineBtn primario\" type=\"submit\">Salvar NPC na campanha</button>\n            </form>\n            <form data-form=\"create-campaign-npc\" class=\"onlineForm onlineSubCard\">\n              <input type=\"hidden\" name=\"campaignId\" value=\"").concat(esc(campanha.id), "\">\n              <h4>Criar NPC permanente</h4>\n              <label>Nome<input name=\"displayName\" maxlength=\"80\" required placeholder=\"Mercen\u00E1rio da N\u00E9voa\"></label>\n              <div class=\"onlineFormGrid\"><label>PV m\u00E1ximo<input name=\"pvMax\" type=\"number\" min=\"0\" value=\"20\"></label><label>Chakra<input name=\"chakraMax\" type=\"number\" min=\"0\" value=\"0\"></label><label>CA<input name=\"ca\" type=\"number\" value=\"10\"></label><label>Iniciativa<input name=\"initiativeBonus\" type=\"number\" value=\"0\"></label></div>\n              <label>Notas privadas do mestre<textarea name=\"privateNotes\" maxlength=\"4000\" placeholder=\"Informa\u00E7\u00F5es que s\u00F3 o mestre pode ver\"></textarea></label>\n              <button class=\"onlineBtn secundario\" type=\"submit\">Criar na biblioteca</button>\n            </form>\n          </div>\n        </details>\n\n        <div class=\"onlineCampanhaMembrosTitulo onlineCampanhaXpTitulo\"><strong>XP da campanha</strong><small>Funciona mesmo sem sala aberta</small></div>\n        <div class=\"onlineCampanhaXpGrid\">\n          <form data-form=\"campaign-xp\" class=\"onlineForm onlineCampanhaXpForm\">\n            <input type=\"hidden\" name=\"campaignId\" value=\"").concat(esc(campanha.id), "\">\n            <div class=\"onlineXpJogadores onlineCampanhaXpJogadores\">").concat(membros.length ? membros.map(function (membro) {
            var diag = diagnosticoMembro(membro);
            var bloqueado = diag.owned === true && (diag.status === "stale" || diag.status === "ambiguous");
            var detalhe = bloqueado ? " • vínculo antigo" : diag.status === "linked" && diag.localSheetName ? " \u2022 ".concat(esc(diag.localSheetName)) : "";
            return "<label><input type=\"checkbox\" name=\"memberKeys\" value=\"".concat(esc("".concat(membro.userId, "::").concat(membro.characterId)), "\" ").concat(bloqueado ? "disabled" : "checked", "><span>").concat(esc(membro.displayName || "Personagem")).concat(detalhe, "</span></label>");
        }).join("") : "<p class=\"onlineVazio\">Adicione jogadores permanentes \u00E0 campanha para distribuir XP.</p>", "</div>\n            <div class=\"onlineFormGrid\">\n              <label>Opera\u00E7\u00E3o<select name=\"type\"><option value=\"grant\">Adicionar XP</option><option value=\"remove\">Remover XP</option><option value=\"correction\">Corre\u00E7\u00E3o (+/-)</option></select></label>\n              <label>Quantidade<input name=\"amount\" type=\"number\" value=\"500\" step=\"1\" required></label>\n            </div>\n            <label>Motivo (opcional)<input name=\"reason\" maxlength=\"160\" placeholder=\"Miss\u00E3o Rank B\"></label>\n            <button class=\"onlineBtn primario\" type=\"submit\" ").concat(membros.length ? "" : "disabled", ">Registrar XP</button>\n            <p class=\"onlineAjudaCompacta\">O lan\u00E7amento fica no hist\u00F3rico e ser\u00E1 entregue quando a ficha do jogador voltar a sincronizar. Level Up continua usando o fluxo normal da ficha.</p>\n          </form>\n          <div class=\"onlineCampanhaXpHistorico\">\n            <div class=\"onlineCampanhaXpHistoricoTopo\"><strong>Hist\u00F3rico</strong><small>").concat(xpCarregado ? "".concat(historicoXp.length, " lan\u00E7amento(s) \u2022 ").concat(xpConfirmados, " recebido(s)") : "Carregando...", "</small></div>\n            ").concat(!xpCarregado ? "<p class=\"onlineVazio\">Carregando hist\u00F3rico de XP...</p>" : historicoXp.length ? "<div class=\"onlineCampanhaXpLista\">".concat(historicoXp.slice(0, 30).map(function (item) {
            var valor = num(item.amount), tipo = item.type === "remove" ? "Remoção" : item.type === "correction" ? "Correção" : "Recompensa";
            var recibo = recibosXp === null || recibosXp === void 0 ? void 0 : recibosXp[item.id];
            var entrega = (recibo === null || recibo === void 0 ? void 0 : recibo.status) === "received"
                ? "\u2713 Recebido".concat(recibo.receivedAt ? " \u2022 ".concat(esc(formatarDataSessao(recibo.receivedAt))) : "")
                : "⏳ Aguardando confirmação";
            return "<article class=\"onlineCampanhaXpItem\"><div><strong>".concat(esc(item.displayName || "Personagem"), "</strong><span>").concat(esc(tipo)).concat(item.reason ? " \u2022 ".concat(esc(item.reason)) : "", "</span><small>").concat(esc(formatarDataSessao(item.createdAt))).concat(item.sessionId ? " • sessão" : "", " \u2022 ").concat(entrega, "</small></div><b class=\"").concat(valor < 0 ? "negativo" : "positivo", "\">").concat(valor > 0 ? "+" : "").concat(valor, " XP</b></article>");
        }).join(""), "</div>") : "<p class=\"onlineVazio\">Nenhum XP registrado nesta campanha.</p>", "\n          </div>\n        </div>\n      </section>\n\n      <section class=\"onlineCard\">\n        <div class=\"onlineCardTitulo\"><div><span class=\"onlineCardSelo\">SESS\u00D5ES</span><h3>Salas de jogo</h3></div><small>").concat(abertas.length, " aberta(s) \u2022 ").concat(encerradas.length, " encerrada(s)</small></div>\n        <p>Uma sala guarda apenas o estado tempor\u00E1rio daquela sess\u00E3o. Encerrar uma sala n\u00E3o encerra esta campanha.</p>\n        ").concat(sessoes.length ? "<div class=\"onlineCampanhaSessoes\">".concat(abertas.map(cardSessao).join("")).concat(encerradas.map(cardSessao).join(""), "</div>") : "<p class=\"onlineVazio\">Nenhuma sess\u00E3o criada nesta campanha.</p>", "\n        ").concat(st.sala ? "<div class=\"onlineVazio\">Voc\u00EA j\u00E1 est\u00E1 conectado a uma sala. Saia ou encerre a sala atual antes de criar uma nova sess\u00E3o.</div>" : "<form data-form=\"create-room\" class=\"onlineForm onlineCriarSalaForm\">\n          <input type=\"hidden\" name=\"campaignId\" value=\"".concat(esc(campanha.id), "\">\n          <label>Nome da nova sess\u00E3o<input name=\"title\" maxlength=\"80\" placeholder=\"Batalha da ponte\"></label>\n          <button class=\"onlineBtn primario\" type=\"submit\">Criar sala e entrar como mestre</button>\n        </form>"), "\n      </section>\n    </div>");
    }
    function renderMinhaConta(st) {
        if (!st.user) {
            return "<div class=\"onlineDestinoPagina\" data-online-destino=\"login\">\n        <div class=\"onlineDestinoTitulo\"><span class=\"onlineCardSelo\">MINHA CONTA</span><h3>Login</h3><p>Entre com a mesma Conta Google usada nos seus outros aparelhos para manter a mesma ficha sincronizada.</p></div>\n        ".concat(renderLogin(), "\n      </div>");
        }
        if (st.user.anonymous) {
            return "<div class=\"onlineDestinoPagina\" data-online-destino=\"login\">\n        ".concat(cabecalhoConta(st), "\n        <section class=\"onlineCard onlineContaGerenciar\">\n          <span class=\"onlineCardSelo\">MINHA CONTA</span><h3>Voc\u00EA est\u00E1 usando uma sess\u00E3o tempor\u00E1ria</h3>\n          <p>Entre com Google para vincular as fichas a uma conta e recuper\u00E1-las em celular, tablet ou outro aparelho.</p>\n          <button type=\"button\" class=\"onlineBtn primario\" data-action=\"login-google\">Entrar com Google</button>\n        </section>\n      </div>");
        }
        return "<div class=\"onlineDestinoPagina\" data-online-destino=\"login\">\n      ".concat(cabecalhoConta(st), "\n      <section class=\"onlineCard onlineContaGerenciar\">\n        <span class=\"onlineCardSelo\">MINHA CONTA</span><h3>Login ativo</h3>\n        <p>Esta conta j\u00E1 est\u00E1 autenticada. Para selecionar outro usu\u00E1rio Google, abra <b>Conta conectada</b> no menu lateral.</p>\n      </section>\n    </div>");
    }
    function renderContaConectada(st) {
        if (!st.user) {
            return "<div class=\"onlineDestinoPagina\" data-online-destino=\"conta-conectada\">\n        <section class=\"onlineCard onlineEstadoVazio\">\n          <span class=\"onlineCardSelo\">CONTA CONECTADA</span><h3>Nenhum usu\u00E1rio conectado</h3>\n          <p>Fa\u00E7a login primeiro. Depois voc\u00EA poder\u00E1 voltar aqui para trocar o usu\u00E1rio conectado.</p>\n          <button type=\"button\" class=\"onlineBtn primario\" data-action=\"go-login\">Abrir login</button>\n        </section>\n      </div>";
        }
        if (st.user.anonymous) {
            return "<div class=\"onlineDestinoPagina\" data-online-destino=\"conta-conectada\">\n        ".concat(cabecalhoConta(st), "\n        <section class=\"onlineCard onlineContaGerenciar\">\n          <span class=\"onlineCardSelo\">CONTA CONECTADA</span><h3>Sess\u00E3o tempor\u00E1ria</h3>\n          <p>Esta sess\u00E3o n\u00E3o representa uma Conta Google. Conecte uma conta para poder alternar entre usu\u00E1rios do navegador.</p>\n          <button type=\"button\" class=\"onlineBtn primario\" data-action=\"login-google\">Conectar Conta Google</button>\n        </section>\n      </div>");
        }
        return "<div class=\"onlineDestinoPagina\" data-online-destino=\"conta-conectada\">\n      ".concat(cabecalhoConta(st), "\n      <section class=\"onlineCard onlineContaGerenciar\">\n        <span class=\"onlineCardSelo\">CONTA CONECTADA</span><h3>Trocar usu\u00E1rio</h3>\n        <p>Usu\u00E1rio atual: <strong>").concat(esc(st.user.email || st.user.displayName || "Conta Google"), "</strong></p>\n        <p>Ao tocar em trocar usu\u00E1rio, o seletor de contas do Google ser\u00E1 aberto para voc\u00EA escolher outra conta dispon\u00EDvel neste aparelho.</p>\n        <div class=\"onlineAcoesLinha\">\n          <button type=\"button\" class=\"onlineBtn primario\" data-action=\"switch-google-account\">Trocar usu\u00E1rio</button>\n          <button type=\"button\" class=\"onlineBtn secundario\" data-action=\"logout\">Desconectar</button>\n        </div>\n      </section>\n    </div>");
    }
    function renderAreaMestreDestino(st) {
        if (!st.user || st.user.anonymous) {
            return "<div class=\"onlineDestinoPagina\" data-online-destino=\"area-mestre\">\n        ".concat(st.user ? cabecalhoConta(st) : "", "\n        <section class=\"onlineCard onlineEstadoVazio\">\n          <span class=\"onlineCardSelo\">\u00C1REA DO MESTRE</span><h3>Entre com Google para administrar campanhas</h3>\n          <p>Campanhas permanentes e suas sess\u00F5es ficam vinculadas \u00E0 sua conta.</p>\n          <button type=\"button\" class=\"onlineBtn primario\" data-action=\"login-google\">Entrar com Google</button>\n        </section>\n      </div>");
        }
        var campanha = campanhaMestreAtual(st);
        if (campanha)
            return renderCampanhaMestre(st, campanha);
        return "<div class=\"onlineDestinoPagina\" data-online-destino=\"area-mestre\">\n      ".concat(cabecalhoConta(st), "\n      ").concat(st.sala ? "<section class=\"onlineCard onlineCampanhaSalaAtivaResumo\"><span class=\"onlineCardSelo\">SALA ATIVA</span><h3>".concat(esc(st.sala.title || "Sala atual"), "</h3><p>Voc\u00EA pode continuar administrando suas campanhas sem encerrar esta sala.</p><button type=\"button\" class=\"onlineBtn secundario\" data-action=\"open-current-room\">Abrir sala atual</button></section>") : "", "\n      ").concat(renderMestreHome(st), "\n    </div>");
    }
    function renderEntrarSalaDestino(st) {
        var aviso = !st.user
            ? "<p class=\"onlineAviso\">Voc\u00EA pode entrar sem cadastro. O aplicativo criar\u00E1 uma sess\u00E3o tempor\u00E1ria automaticamente.</p>"
            : st.sala
                ? "<p class=\"onlineAviso\">Voc\u00EA est\u00E1 na sala ".concat(esc(st.sala.code || ""), ". Ao entrar em outro c\u00F3digo, o aplicativo pedir\u00E1 confirma\u00E7\u00E3o para trocar de sala.</p>")
                : "";
        return "<div class=\"onlineDestinoPagina\" data-online-destino=\"entrar-sala\">\n      ".concat(st.user ? cabecalhoConta(st) : "", "\n      ").concat(aviso, "\n      ").concat(renderEntradaSala(st), "\n    </div>");
    }
    function renderSalaAtualDestino(st) {
        if (st.sala)
            return "<div class=\"onlineDestinoPagina\" data-online-destino=\"sala-atual\">".concat(renderSala(st), "</div>");
        var sessao = sessaoLocal();
        if (sessao === null || sessao === void 0 ? void 0 : sessao.roomId) {
            return "<div class=\"onlineDestinoPagina\" data-online-destino=\"sala-atual\">\n        <section class=\"onlineCard onlineEstadoVazio\">\n          <span class=\"onlineCardSelo\">SALA ATUAL</span><h3>Reconectando \u00E0 sala...</h3>\n          <p>Existe uma sala salva neste aparelho, mas a conex\u00E3o ainda n\u00E3o foi restaurada.</p>\n          <button type=\"button\" class=\"onlineBtn primario\" data-action=\"reconnect-current-room\">Tentar reconectar</button>\n        </section>\n      </div>";
        }
        return "<div class=\"onlineDestinoPagina\" data-online-destino=\"sala-atual\">\n      <section class=\"onlineCard onlineEstadoVazio\">\n        <span class=\"onlineCardSelo\">SALA ATUAL</span><h3>Nenhuma sala ativa</h3>\n        <p>Entre em uma sala existente ou crie uma nova mesa como mestre.</p>\n        <div class=\"onlineAcoesLinha\">\n          <button type=\"button\" class=\"onlineBtn primario\" data-action=\"go-join-room\">Entrar em sala</button>\n          ".concat(st.user && !st.user.anonymous ? "<button type=\"button\" class=\"onlineBtn secundario\" data-action=\"go-create-room\">Criar sala</button>" : "", "\n        </div>\n      </section>\n    </div>");
    }
    function renderSincronizacaoDestino(st) {
        if (!st.user) {
            return "<div class=\"onlineDestinoPagina\" data-online-destino=\"sincronizacao\">\n        <section class=\"onlineCard onlineEstadoVazio\"><span class=\"onlineCardSelo\">SINCRONIZA\u00C7\u00C3O</span><h3>Entre para ativar a nuvem</h3><p>A sincroniza\u00E7\u00E3o entre dispositivos usa a mesma Conta Google em todos os seus aparelhos.</p><button type=\"button\" class=\"onlineBtn primario\" data-action=\"go-login\">Abrir login</button></section>\n      </div>";
        }
        return "<div class=\"onlineDestinoPagina\" data-online-destino=\"sincronizacao\">".concat(cabecalhoConta(st)).concat(renderConflito()).concat(renderNuvem(st), "</div>");
    }
    function formatarDataBackup(timestamp) {
        var n = Number(timestamp || 0);
        if (!n)
            return "Data indisponível";
        try {
            return new Date(n).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
        }
        catch (_erro) {
            return new Date(n).toLocaleString("pt-BR");
        }
    }
    function rotuloMotivoBackup(item) {
        if ((item === null || item === void 0 ? void 0 : item.type) === "daily" || (item === null || item === void 0 ? void 0 : item.reason) === "automatico-diario")
            return "Automático diário";
        if ((item === null || item === void 0 ? void 0 : item.type) === "safety" || (item === null || item === void 0 ? void 0 : item.reason) === "antes-restaurar-historico")
            return "Estado anterior à última restauração";
        if ((item === null || item === void 0 ? void 0 : item.reason) === "manual")
            return "Manual";
        return String((item === null || item === void 0 ? void 0 : item.reason) || "Backup").replace(/[-_]+/g, " ");
    }
    function carregarBackupsAtivos() {
        return __awaiter(this, void 0, void 0, function () {
            var ficha, erro_1;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        ficha = (_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.fichaAtualLocal) === null || _b === void 0 ? void 0 : _b.call(_a);
                        backupSheetId = String((ficha === null || ficha === void 0 ? void 0 : ficha.sheetId) || "");
                        if (!backupSheetId) {
                            backupsHistoricos = [];
                            backupsErro = "A ficha ativa ainda não possui identidade de backup.";
                            return [2 /*return*/];
                        }
                        backupsCarregando = true;
                        backupsErro = "";
                        renderizar();
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, window.ShinobiOnline.listarBackupsHistoricos(backupSheetId)];
                    case 2:
                        backupsHistoricos = _e.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        erro_1 = _e.sent();
                        backupsHistoricos = [];
                        backupsErro = ((_d = (_c = window.ShinobiOnline) === null || _c === void 0 ? void 0 : _c.erroAmigavel) === null || _d === void 0 ? void 0 : _d.call(_c, erro_1)) || erro_1.message || String(erro_1);
                        return [3 /*break*/, 5];
                    case 4:
                        backupsCarregando = false;
                        renderizar();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function renderBackupsDestino(st) {
        var _a, _b, _c;
        if (!st.user || st.user.anonymous) {
            return "<div class=\"onlineDestinoPagina\" data-online-destino=\"backups\"><section class=\"onlineCard onlineEstadoVazio\"><span class=\"onlineCardSelo\">BACKUPS</span><h3>Conta Google necess\u00E1ria</h3><p>Os backups hist\u00F3ricos pertencem \u00E0 sua Conta Google.</p><button type=\"button\" class=\"onlineBtn primario\" data-action=\"go-login\">Abrir login</button></section></div>";
        }
        var ficha = (_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.fichaAtualLocal) === null || _b === void 0 ? void 0 : _b.call(_a);
        var nome = String((ficha === null || ficha === void 0 ? void 0 : ficha.characterName) || ((_c = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _c === void 0 ? void 0 : _c.nome) || (ficha === null || ficha === void 0 ? void 0 : ficha.name) || "Ficha");
        var lista = Array.isArray(backupsHistoricos) ? backupsHistoricos : [];
        var ehSeguranca = function (item) { return (item === null || item === void 0 ? void 0 : item.type) === "safety" || (item === null || item === void 0 ? void 0 : item.reason) === "antes-restaurar-historico"; };
        var historicos = lista.filter(function (item) { return !ehSeguranca(item); });
        var seguranca = lista.find(ehSeguranca) || null;
        var cardBackup = function (item) { return "<div class=\"onlineCard\" style=\"margin:0;padding:14px\"><div class=\"onlineCardTitulo\"><div><strong>".concat(esc(rotuloMotivoBackup(item)), "</strong><small>").concat(esc(formatarDataBackup(item.createdAt))).concat(item.appVersion ? " \u2022 v".concat(esc(item.appVersion)) : "", "</small></div></div><div class=\"onlineAcoesLinha\"><button type=\"button\" class=\"onlineBtn secundario compacto\" data-action=\"restore-history-backup\" data-sheet-id=\"").concat(esc(backupSheetId), "\" data-backup-id=\"").concat(esc(item.id), "\">Restaurar</button><button type=\"button\" class=\"onlineBtn texto compacto\" data-action=\"delete-history-backup\" data-sheet-id=\"").concat(esc(backupSheetId), "\" data-backup-id=\"").concat(esc(item.id), "\">Excluir</button></div></div>"); };
        return "<div class=\"onlineDestinoPagina\" data-online-destino=\"backups\">\n      <section class=\"onlineCard\">\n        <div class=\"onlineCardTitulo\"><div><span class=\"onlineCardSelo\">BACKUPS HIST\u00D3RICOS</span><h3>".concat(esc(nome), "</h3></div></div>\n        <p>O Shinobi mant\u00E9m no m\u00E1ximo <strong>3 vers\u00F5es hist\u00F3ricas</strong> desta ficha entre backups manuais e autom\u00E1ticos. A seguran\u00E7a criada antes de uma restaura\u00E7\u00E3o usa um slot separado e n\u00E3o ocupa uma dessas tr\u00EAs vagas.</p>\n        <div class=\"onlineAcoesLinha\">\n          <button type=\"button\" class=\"onlineBtn primario\" data-action=\"create-history-backup\">Criar backup agora</button>\n          <button type=\"button\" class=\"onlineBtn secundario\" data-action=\"back-sync\">Voltar para sincroniza\u00E7\u00E3o</button>\n        </div>\n      </section>\n      ").concat(backupsCarregando ? "<div class=\"onlineLoading\"><span></span><p>Carregando backups...</p></div>" : "", "\n      ").concat(backupsErro ? "<section class=\"onlineCard\"><h3>N\u00E3o foi poss\u00EDvel listar os backups</h3><p>".concat(esc(backupsErro), "</p><button type=\"button\" class=\"onlineBtn secundario\" data-action=\"reload-backups\">Tentar novamente</button></section>") : "", "\n      ").concat(!backupsCarregando && !backupsErro ? (historicos.length ? "<section class=\"onlineCard\"><div class=\"onlineSyncSecaoTitulo\"><span>VERS\u00D5ES DA FICHA</span><small>".concat(historicos.length, "/3 backups hist\u00F3ricos</small></div><div class=\"onlineAcoesColuna\">").concat(historicos.map(cardBackup).join(""), "</div></section>") : "<section class=\"onlineCard onlineEstadoVazio\"><span class=\"onlineCardSelo\">VERS\u00D5ES DA FICHA</span><h3>Nenhum backup hist\u00F3rico ainda</h3><p>Voc\u00EA pode criar o primeiro agora. O autom\u00E1tico di\u00E1rio tamb\u00E9m ser\u00E1 criado quando esta ficha estiver aberta e a conta estiver online.</p></section>") : "", "\n      ").concat(!backupsCarregando && !backupsErro && seguranca ? "<section class=\"onlineCard\"><div class=\"onlineSyncSecaoTitulo\"><span>SEGURAN\u00C7A DA RESTAURA\u00C7\u00C3O</span><small>slot separado</small></div><p>Guarda somente o estado imediatamente anterior \u00E0 \u00FAltima restaura\u00E7\u00E3o.</p><div class=\"onlineAcoesColuna\">".concat(cardBackup(seguranca), "</div></section>") : "", "\n    </div>");
    }
    function renderDestino(st) {
        if (destinoAtual === "login")
            return renderMinhaConta(st);
        if (destinoAtual === "conta-conectada")
            return renderContaConectada(st);
        if (destinoAtual === "area-mestre")
            return renderAreaMestreDestino(st);
        if (destinoAtual === "entrar-sala")
            return renderEntrarSalaDestino(st);
        if (destinoAtual === "sala-atual")
            return renderSalaAtualDestino(st);
        if (destinoAtual === "sincronizacao")
            return renderSincronizacaoDestino(st);
        if (destinoAtual === "backups")
            return renderBackupsDestino(st);
        return null;
    }
    function agruparFichasNuvem(nuvem, locais) {
        /* sheetId é a identidade da ficha na nuvem. Nomes iguais podem pertencer a
           personagens diferentes, então a interface também não pode agrupá-los por
           nome. Cada registro remoto aparece individualmente e pode ser revisado ou
           removido sem afetar outro personagem homônimo. */
        return (nuvem || []).map(function (ficha) {
            var vinculada = (locais || []).some(function (local) { return local.sheetId === ficha.id; });
            var item = __assign(__assign({}, ficha), { vinculada: vinculada });
            return { principal: item, itens: [item], duplicatas: [], vinculada: vinculada };
        }).sort(function (a, b) {
            var _a, _b;
            if (Boolean(b.vinculada) !== Boolean(a.vinculada))
                return Number(Boolean(b.vinculada)) - Number(Boolean(a.vinculada));
            return num((_a = b.principal) === null || _a === void 0 ? void 0 : _a.updatedAt) - num((_b = a.principal) === null || _b === void 0 ? void 0 : _b.updatedAt);
        });
    }
    function textoStatusSync(st) {
        var sync = (st === null || st === void 0 ? void 0 : st.syncAtual) || {};
        if (sync.phase === "conflict")
            return { classe: "conflito", rotulo: "Atenção necessária", detalhe: "Existe um conflito aguardando sua escolha." };
        if (sync.phase === "syncing")
            return { classe: "sincronizando", rotulo: "Sincronizando…", detalhe: "Enviando as alterações desta ficha." };
        if (sync.phase === "pending")
            return { classe: "pendente", rotulo: "Aguardando envio", detalhe: navigator.onLine === false ? "Será enviada quando a internet voltar." : "A sincronização automática está preparando o envio." };
        if (sync.syncStatus === 1)
            return { classe: "ok", rotulo: "Tudo sincronizado", detalhe: "As alterações são enviadas e recebidas automaticamente." };
        return { classe: "ok", rotulo: "Sincronização entre dispositivos", detalhe: "Não há envio pendente da ficha ativa. Alterações confirmadas são sincronizadas automaticamente." };
    }
    function renderFichaNuvemGrupo(grupo) {
        var ficha = grupo.principal || {};
        var antigas = grupo.duplicatas || [];
        var nome = ficha.characterName || ficha.name || "Ficha";
        var nomeFicha = String(ficha.name || nome).replace(/(?:\s+nuvem(?:\s+\d+)?)+$/i, "").trim() || nome;
        var subtitulo = grupo.vinculada
            ? "".concat(nomeFicha, " \u2022 neste aparelho")
            : "".concat(nomeFicha, " \u2022 dispon\u00EDvel na nuvem");
        var acao = grupo.vinculada
            ? "<span class=\"onlineSyncBadge ok\">Autom\u00E1tica</span>"
            : "<div class=\"onlineAcoesLinha\"><button type=\"button\" class=\"onlineBtn secundario compacto\" data-action=\"restore-cloud\" data-sheet-id=\"".concat(esc(ficha.id), "\">Adicionar</button><button type=\"button\" class=\"onlineBtn texto perigo compacto\" data-action=\"delete-cloud-sheet\" data-sheet-id=\"").concat(esc(ficha.id), "\" data-sheet-name=\"").concat(esc(nomeFicha), "\">Excluir da nuvem</button></div>");
        var duplicatas = "";
        return "<article class=\"onlineSyncFicha ".concat(grupo.vinculada ? "vinculada" : "disponivel", "\">\n      <div class=\"onlineSyncFichaTopo\">\n        <div class=\"onlineSyncFichaTexto\"><strong>").concat(esc(nome), "</strong><small>").concat(esc(subtitulo), "</small></div>\n        ").concat(acao, "\n      </div>\n      ").concat(duplicatas, "\n    </article>");
    }
    function renderNuvem(st) {
        var _a, _b, _c, _d, _e, _f;
        var todasLocais = ((_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.listarFichasLocais) === null || _b === void 0 ? void 0 : _b.call(_a)) || [];
        var locais = ((_d = (_c = window.ShinobiOnline) === null || _c === void 0 ? void 0 : _c.listarFichasSincronizaveis) === null || _d === void 0 ? void 0 : _d.call(_c)) || todasLocais.filter(function (f) { var _a, _b; return !((_b = (_a = f === null || f === void 0 ? void 0 : f.data) === null || _a === void 0 ? void 0 : _a.__online) === null || _b === void 0 ? void 0 : _b.syncDisabled); });
        var recuperacoes = Math.max(0, todasLocais.length - locais.length);
        var nuvem = st.fichasNuvem || [];
        if ((_e = st.user) === null || _e === void 0 ? void 0 : _e.anonymous) {
            return "<section class=\"onlineCard onlineSyncPainel\">\n        <div class=\"onlineSyncHero desligada\">\n          <div class=\"onlineSyncIcone\">\u2601</div>\n          <div><span class=\"onlineCardSelo\">SINCRONIZA\u00C7\u00C3O</span><h3>Nuvem desativada</h3><p>Use a mesma Conta Google no celular, tablet e outros aparelhos para manter suas fichas iguais em todos eles.</p></div>\n        </div>\n        <button type=\"button\" class=\"onlineBtn primario\" data-action=\"login-google\">Entrar com Google</button>\n      </section>";
        }
        var grupos = agruparFichasNuvem(nuvem, locais);
        var vinculadas = grupos.filter(function (grupo) { return grupo.vinculada; });
        var disponiveis = grupos.filter(function (grupo) { return !grupo.vinculada; });
        var status = textoStatusSync(st);
        return "<section class=\"onlineCard onlineSyncPainel\">\n      <div class=\"onlineSyncHero\">\n        <div class=\"onlineSyncIcone\">\u21BB</div>\n        <div class=\"onlineSyncHeroTexto\">\n          <span class=\"onlineCardSelo\">SINCRONIZA\u00C7\u00C3O ENTRE DISPOSITIVOS</span>\n          <h3>".concat(esc(status.rotulo), "</h3>\n          <p>").concat(esc(status.detalhe), "</p>\n        </div>\n        <span class=\"onlineSyncIndicador ").concat(esc(status.classe), "\" aria-label=\"").concat(esc(status.rotulo), "\"></span>\n      </div>\n\n      <div class=\"onlineSyncConta\">\n        <div><small>CONTA GOOGLE</small><strong>").concat(esc(((_f = st.user) === null || _f === void 0 ? void 0 : _f.email) || "Conta Google"), "</strong></div>\n        <span>").concat(locais.length, " ").concat(locais.length === 1 ? "personagem" : "personagens", " neste aparelho").concat(recuperacoes ? " \u2022 ".concat(recuperacoes, " ").concat(recuperacoes === 1 ? "cópia antiga preservada" : "cópias antigas preservadas") : "", "</span>\n      </div>\n\n      <div class=\"onlineSyncResumo\">\n        <div><b>").concat(vinculadas.length, "</b><span>sincronizadas</span></div>\n        <div><b>").concat(disponiveis.length, "</b><span>dispon\u00EDveis</span></div>\n        <div><b>").concat(grupos.length, "</b><span>personagens</span></div>\n      </div>\n\n      ").concat(grupos.length ? "\n        <div class=\"onlineSyncSecao\">\n          <div class=\"onlineSyncSecaoTitulo\"><span>SEUS PERSONAGENS</span><small>Uma personagem \u00E9 a mesma no celular, tablet e demais aparelhos</small></div>\n          <div class=\"onlineListaNuvem onlineListaNuvemClean\">".concat(grupos.map(renderFichaNuvemGrupo).join(""), "</div>\n        </div>") : "<p class=\"onlineVazio\">Nenhum backup da ficha foi encontrado na nuvem. A sincroniza\u00E7\u00E3o entre dispositivos funciona separadamente, por altera\u00E7\u00E3o confirmada.</p>", "\n\n      <details class=\"onlineSyncAvancado\">\n        <summary>Op\u00E7\u00F5es avan\u00E7adas</summary>\n        <div>\n          <button type=\"button\" class=\"onlineBtn secundario compacto\" data-action=\"sync-check\">Verificar sincroniza\u00E7\u00E3o agora</button>\n          <small>As altera\u00E7\u00F5es confirmadas s\u00E3o enviadas automaticamente. Use esta op\u00E7\u00E3o apenas para reenviar pend\u00EAncias da ficha ativa.</small>\n        </div>\n        <div>\n          <button type=\"button\" class=\"onlineBtn secundario compacto\" data-action=\"regularize-current\">Regularizar ficha completa</button>\n          <small>Une notas, invent\u00E1rio, jutsus, ataques, Kekkei Genkai, carteira e hist\u00F3rico antigos com o backup e o realtime, sem escolher um aparelho como vencedor.</small>\n        </div>\n        <div>\n          <button type=\"button\" class=\"onlineBtn secundario compacto\" data-action=\"manage-backups\">Gerenciar backups</button>\n          <small>Crie um ponto de restaura\u00E7\u00E3o, veja as tr\u00EAs vers\u00F5es hist\u00F3ricas mais recentes, restaure ou exclua uma delas.</small>\n        </div>\n      </details>\n    </section>");
    }
    function renderConflito() {
        var _a, _b;
        if (!conflitoAtual)
            return "";
        var nome = ((_a = conflitoAtual.local) === null || _a === void 0 ? void 0 : _a.characterName) || ((_b = conflitoAtual.local) === null || _b === void 0 ? void 0 : _b.name) || "Ficha";
        var motivo = String(conflitoAtual.reason || "");
        var protegido = ["incoming-data-loss", "outgoing-data-loss", "cloud-data-loss"].includes(motivo);
        var primeiroVinculo = motivo === "first-link-divergent";
        var textoConflito = protegido
            ? "A proteção contra perda de dados bloqueou uma versão muito mais vazia antes que ela substituísse sua ficha. Confira as duas versões e escolha qual deve continuar."
            : primeiroVinculo
                ? "Este personagem já existia neste aparelho e na nuvem antes de receber a mesma identidade. O app não criou outra cópia: ele parou para você escolher qual conteúdo deve prevalecer."
                : "Existem alterações diferentes desta mesma ficha em dois aparelhos. Escolha qual versão deve ser mantida.";
        return "<section class=\"onlineCard onlineConflito\">\n      <span class=\"onlineCardSelo\">PROTE\u00C7\u00C3O DE SINCRONIZA\u00C7\u00C3O</span>\n      <h3>".concat(esc(nome), "</h3>\n      <p>").concat(esc(textoConflito), "</p>\n      <div class=\"onlineAcoesColuna\">\n        <button class=\"onlineBtn primario\" data-action=\"resolve-conflict\" data-choice=\"nuvem\" data-sheet-id=\"").concat(esc(conflitoAtual.sheetId), "\">Usar vers\u00E3o da nuvem</button>\n        <button class=\"onlineBtn secundario\" data-action=\"resolve-conflict\" data-choice=\"local\" data-sheet-id=\"").concat(esc(conflitoAtual.sheetId), "\">Manter este aparelho</button>\n        <button class=\"onlineBtn texto\" data-action=\"resolve-conflict\" data-choice=\"copia\" data-sheet-id=\"").concat(esc(conflitoAtual.sheetId), "\">Manter as duas como c\u00F3pias separadas</button>\n      </div>\n    </section>");
    }
    function qrHtml(st) {
        var _a, _b;
        var link = ((_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.linkDaSala) === null || _b === void 0 ? void 0 : _b.call(_a, st.sala.code)) || "";
        return "<div class=\"onlineQrBloco\">\n      <div id=\"shinobiQrCode\" class=\"onlineQrCode\" data-link=\"".concat(esc(link), "\"><span>Gerando QR...</span></div>\n      <div class=\"onlineCodigoSala\"><small>C\u00D3DIGO DA SALA</small><strong>").concat(esc(st.sala.code), "</strong></div>\n      <div class=\"onlineAcoesLinha\"><button class=\"onlineBtn secundario\" data-action=\"copy-code\">Copiar c\u00F3digo</button><button class=\"onlineBtn secundario\" data-action=\"copy-link\">Copiar link</button></div>\n    </div>");
    }
    function renderConviteSala(st) {
        return "<details class=\"onlineCard onlineDetails onlineConviteSala\" data-online-detail=\"invite\">\n      <summary><span><b>Convidar jogadores</b><small>QR Code, link e c\u00F3digo ".concat(esc(st.sala.code || ""), "</small></span></summary>\n      <div class=\"onlineDetailsConteudo\">").concat(qrHtml(st), "</div>\n    </details>");
    }
    function tipoParticipante(p) {
        if (p.type === "player")
            return "Jogador";
        if (p.type === "npc-imported")
            return "Ficha importada".concat(p.sourceSheetName ? " \u2022 ".concat(p.sourceSheetName) : "");
        return "NPC rápido";
    }
    function renderParticipantes(st, master) {
        var ps = participantes(st), ord = ordem(st), atual = participanteAtual(st);
        return "<section class=\"onlineCard onlineParticipantesCard\">\n      <div class=\"onlineCardTitulo\"><div><span class=\"onlineCardSelo\">PARTICIPANTES</span><h3>".concat(ps.length, " na sala</h3></div><small class=\"onlineAoVivoLegenda\">\u25CF recursos ao vivo</small></div>\n      <div class=\"onlineParticipantes\">\n        ").concat(ps.length ? ps.map(function (p) {
            var _a, _b, _c, _d, _e, _f;
            var naOrdem = ord.indexOf(p.id), isAtual = (atual === null || atual === void 0 ? void 0 : atual.id) === p.id;
            var pv = num((_a = p.battle) === null || _a === void 0 ? void 0 : _a.pv), pvMax = num((_b = p.battle) === null || _b === void 0 ? void 0 : _b.pvMax), chakra = num((_c = p.battle) === null || _c === void 0 ? void 0 : _c.chakra), chakraMax = num((_d = p.battle) === null || _d === void 0 ? void 0 : _d.chakraMax);
            return "<article class=\"onlineParticipante ".concat(isAtual ? "turnoAtual" : "", "\">\n            <div class=\"onlineParticipanteNome\">\n              ").concat(p.type === "player" ? "<span class=\"presencaDot ".concat(conectado(st, p) ? "conectado" : "", "\" title=\"").concat(conectado(st, p) ? "Conectado" : "Desconectado", "\"></span>") : "<span class=\"npcDot\">\u25C6</span>", "\n              <div><strong>").concat(esc(p.displayName || "Participante"), "</strong><small>").concat(esc(tipoParticipante(p))).concat(naOrdem >= 0 ? " \u2022 ordem ".concat(naOrdem + 1) : "", "</small></div>\n              ").concat(isAtual ? "<span class=\"onlineTurnoBadge\">TURNO</span>" : "", "\n            </div>\n            <div class=\"onlineRecursosAoVivo\">\n              <div class=\"onlineRecurso onlineRecursoPv\"><span><b>PV</b><strong>").concat(pv, "/").concat(pvMax, "</strong></span><i><em style=\"width:").concat(pct(pv, pvMax), "%\"></em></i></div>\n              <div class=\"onlineRecurso onlineRecursoChakra\"><span><b>CH</b><strong>").concat(chakra, "/").concat(chakraMax, "</strong></span><i><em style=\"width:").concat(pct(chakra, chakraMax), "%\"></em></i></div>\n              <div class=\"onlineDefesasCompactas\"><span>CA <b>").concat(num((_e = p.battle) === null || _e === void 0 ? void 0 : _e.ca, 10), "</b></span><span>CD <b>").concat(num((_f = p.battle) === null || _f === void 0 ? void 0 : _f.cd, 10), "</b></span></div>\n            </div>\n            ").concat(master ? "<div class=\"onlineParticipanteAcoes\">\n              <label>Iniciativa<input data-action-change=\"initiative\" data-participant-id=\"".concat(esc(p.id), "\" type=\"number\" value=\"").concat(p.initiative == null ? "" : esc(p.initiative), "\" placeholder=\"\u2014\"></label>\n              ").concat(p.type !== "player" ? "<button class=\"onlineBtn texto\" data-action=\"edit-npc\" data-participant-id=\"".concat(esc(p.id), "\">Editar</button>") : "", "\n              <button class=\"onlineBtn perigoTexto\" data-action=\"remove-participant\" data-participant-id=\"").concat(esc(p.id), "\">Remover</button>\n            </div>") : "", "\n          </article>");
        }).join("") : "<p class=\"onlineVazio\">Nenhum participante entrou ainda.</p>", "\n      </div>\n    </section>");
    }
    function renderAdicionarNpc(st) {
        var _a, _b, _c;
        var campaignId = String(((_a = st.sala) === null || _a === void 0 ? void 0 : _a.campaignId) || "");
        if (campaignId && st.npcsCampanhaId !== campaignId) {
            (_c = (_b = window.ShinobiOnline) === null || _b === void 0 ? void 0 : _b.observarNpcsCampanha) === null || _c === void 0 ? void 0 : _c.call(_b, campaignId).catch(function () { });
        }
        var npcs = (st.npcsCampanhaId === campaignId ? st.npcsCampanha || [] : []).filter(function (npc) { return (npc === null || npc === void 0 ? void 0 : npc.status) !== "inactive"; });
        var opcoes = npcs.map(function (npc) { return "<option value=\"".concat(esc(npc.id), "\">").concat(esc(npc.displayName || "NPC"), "</option>"); }).join("");
        var biblioteca = campaignId ? "<form data-form=\"add-campaign-npc-room\" class=\"onlineForm onlineSubCard onlineNpcDaBiblioteca\">\n          <h4>Biblioteca da campanha</h4>\n          <p>Adiciona uma c\u00F3pia para esta sess\u00E3o. Altera\u00E7\u00F5es de PV, Chakra e efeitos n\u00E3o mudam o NPC permanente.</p>\n          ".concat(npcs.length ? "<label>NPC<select name=\"campaignNpcId\" required>".concat(opcoes, "</select></label><label>Nome nesta sess\u00E3o<input name=\"displayName\" maxlength=\"80\" placeholder=\"Opcional\"></label><button class=\"onlineBtn primario\" type=\"submit\">Adicionar \u00E0 sess\u00E3o</button>") : "<p class=\"onlineVazio\">A biblioteca ainda est\u00E1 vazia. Crie NPCs permanentes na \u00C1rea da Campanha.</p><button type=\"button\" class=\"onlineBtn secundario\" data-action=\"go-master-area\">Abrir \u00C1rea da Campanha</button>", "\n        </form>") : "";
        return "<details class=\"onlineCard onlineDetails\" data-online-detail=\"npc\">\n      <summary><span><b>Adicionar NPC ou inimigo</b><small>".concat(campaignId ? "Use a biblioteca da campanha ou crie um temporário" : "Importe uma ficha ou crie rapidamente", "</small></span></summary>\n      <div class=\"onlineDetailsConteudo\">\n        ").concat(biblioteca, "\n        <details class=\"onlineSubDetails onlineNpcTemporario\">\n          <summary>NPC somente nesta sess\u00E3o</summary>\n          <div class=\"onlineGridDois\">\n            <form data-form=\"import-npc\" class=\"onlineForm onlineSubCard\">\n              <h4>Importar ficha temporariamente</h4>\n              <p>Leva informa\u00E7\u00F5es de batalha s\u00F3 para esta sala. N\u00E3o cria NPC permanente.</p>\n              <label>Ficha<select name=\"localSheetName\">").concat(opcoesFichasLocais(), "</select></label>\n              <label>Nome nesta batalha<input name=\"displayName\" placeholder=\"Opcional\"></label>\n              <button class=\"onlineBtn secundario\" type=\"submit\">Importar s\u00F3 nesta sess\u00E3o</button>\n            </form>\n            <form data-form=\"quick-npc\" class=\"onlineForm onlineSubCard\">\n              <h4>Criar temporariamente</h4>\n              <label>Nome<input name=\"displayName\" required placeholder=\"Mercen\u00E1rio\"></label>\n              <div class=\"onlineFormGrid\"><label>PV m\u00E1ximo<input name=\"pvMax\" type=\"number\" min=\"0\" value=\"20\"></label><label>Chakra<input name=\"chakraMax\" type=\"number\" min=\"0\" value=\"0\"></label><label>CA<input name=\"ca\" type=\"number\" value=\"10\"></label><label>Iniciativa<input name=\"initiativeBonus\" type=\"number\" value=\"0\"></label></div>\n              <label>Observa\u00E7\u00F5es da sess\u00E3o<textarea name=\"notes\" maxlength=\"600\" placeholder=\"Vis\u00EDveis nos dados da sala; n\u00E3o use para segredos do mestre\"></textarea></label>\n              <button class=\"onlineBtn texto\" type=\"submit\">Adicionar tempor\u00E1rio</button>\n            </form>\n          </div>\n        </details>\n      </div>\n    </details>");
    }
    function renderCombate(st, master) {
        var _a, _b, _c;
        var combat = ((_a = st.sala) === null || _a === void 0 ? void 0 : _a.combat) || {}, atual = participanteAtual(st), ord = ordem(st);
        var rodada = Math.max(1, num(combat.round, 1)), segundosInicio = (rodada - 1) * 6, segundosFim = rodada * 6;
        var sessao = sessaoLocal();
        var minhaVez = Boolean(combat.started && (atual === null || atual === void 0 ? void 0 : atual.id) && atual.id === (sessao === null || sessao === void 0 ? void 0 : sessao.participantId));
        var turnKey = ((_c = (_b = window.ShinobiOnline) === null || _b === void 0 ? void 0 : _b.chaveTurnoAtual) === null || _c === void 0 ? void 0 : _c.call(_b, combat)) || "".concat(rodada, ":").concat(Math.max(0, num(combat.turnIndex)), ":").concat((atual === null || atual === void 0 ? void 0 : atual.id) || "");
        var turnoConfirmado = Boolean(minhaVez && (atual === null || atual === void 0 ? void 0 : atual.turnReadyKey) === turnKey);
        return "<section class=\"onlineCard onlineCombate ".concat(combat.started ? "iniciado" : "", "\">\n      <span class=\"onlineCardSelo\">INICIATIVA E RODADAS</span>\n      <div class=\"onlineTurnoHero\">\n        <div><small>RODADA</small><strong>").concat(rodada, "</strong><em>").concat(segundosInicio, "\u2013").concat(segundosFim, " segundos</em></div>\n        <div><small>TURNO ATUAL</small><strong>").concat(esc((atual === null || atual === void 0 ? void 0 : atual.displayName) || "Aguardando"), "</strong><em>").concat(ord.length ? "".concat(num(combat.turnIndex) + 1, " de ").concat(ord.length) : "Defina a iniciativa", "</em></div>\n      </div>\n      ").concat(master ? "<div class=\"onlineAcoesLinha onlineControlesTurno\">\n        <button class=\"onlineBtn secundario\" data-action=\"sort-initiative\">Ordenar iniciativa</button>\n        ".concat(combat.started ? "<button class=\"onlineBtn secundario\" data-action=\"prev-turn\">Turno anterior</button><button class=\"onlineBtn primario\" data-action=\"next-turn\">Pr\u00F3ximo turno</button>" : "<button class=\"onlineBtn primario\" data-action=\"start-combat\">Iniciar combate</button>", "\n      </div>") : "<div class=\"onlineTurnoJogador\">\n        <p class=\"onlineAvisoTurno\">".concat(minhaVez ? "É o seu turno." : atual ? "Turno de ".concat(esc(atual.displayName), ".") : "O mestre ainda não iniciou o combate.", "</p>\n        ").concat(minhaVez ? "<button type=\"button\" class=\"onlineBtn ".concat(turnoConfirmado ? "secundario" : "primario", " onlineEncerrarTurno\" data-action=\"finish-my-turn\" ").concat(turnoConfirmado ? "disabled" : "", ">").concat(turnoConfirmado ? "✓ Turno sincronizado" : "Encerrar meu turno", "</button><small>").concat(turnoConfirmado ? "O mestre já pode avançar a iniciativa." : "Ao confirmar, todas as alterações deste turno serão enviadas em um único pacote.", "</small>") : "", "\n      </div>"), "\n    </section>");
    }
    function efeitosAtivos(st) { var _a; return listaDeObjeto((_a = st.sala) === null || _a === void 0 ? void 0 : _a.effects).filter(function (e) { return e.status === "active"; }); }
    function renderEfeitos(st, master) {
        var efeitos = efeitosAtivos(st);
        return "<section class=\"onlineCard\">\n      <span class=\"onlineCardSelo\">DURA\u00C7\u00C3O AUTOM\u00C1TICA</span><h3>Efeitos em rodadas</h3>\n      ".concat(efeitos.length ? "<p class=\"onlineExplicacao\">O contador avan\u00E7a junto com as rodadas da mesa.</p>" : "", "\n      <div class=\"onlineEfeitosLista\">\n        ").concat(efeitos.length ? efeitos.map(function (e) {
            var _a, _b, _c, _d;
            var p = (_b = (_a = st.sala) === null || _a === void 0 ? void 0 : _a.participants) === null || _b === void 0 ? void 0 : _b[e.participantId], rest = rodadasRestantes(e, (_c = st.sala) === null || _c === void 0 ? void 0 : _c.combat);
            var mecanicas = mecanicasDoEfeito(e);
            var resumo = resumoDoEfeito(e);
            return "<article class=\"onlineEfeitoItem\"><div class=\"onlineEfeitoConteudo\"><strong>".concat(esc(e.name), "</strong><small>").concat(esc((p === null || p === void 0 ? void 0 : p.displayName) || "Participante"), " \u2022 ").concat(rest, " rodada(s) restante(s)</small>").concat(mecanicas.length ? "<div class=\"onlineEfeitoMecanicas\">".concat(mecanicas.map(function (mecanica, indice) { var _a, _b; return "<span class=\"".concat(String(((_b = (_a = e.details) === null || _a === void 0 ? void 0 : _a[indice]) === null || _b === void 0 ? void 0 : _b.polarity) || "").toLowerCase(), "\">").concat(esc(mecanica), "</span>"); }).join(""), "</div>") : resumo ? "<p class=\"onlineEfeitoResumo\">".concat(esc(resumo), "</p>") : "", "</div>").concat(master || e.ownerUid === ((_d = st.user) === null || _d === void 0 ? void 0 : _d.uid) ? "<button class=\"onlineBtn texto\" data-action=\"end-effect\" data-effect-id=\"".concat(esc(e.id), "\">Encerrar</button>") : "", "</article>");
        }).join("") : "<p class=\"onlineVazio\">Nenhum efeito ativo.</p>", "\n      </div>\n      ").concat(master ? "<details class=\"onlineSubDetails\" data-online-detail=\"add-effect\"><summary>Adicionar efeito</summary><div>\n        <form data-form=\"add-effect\" class=\"onlineForm onlineFormLinha onlineFormEfeito\">\n          <label>Participante<select name=\"participantId\">".concat(participantes(st).map(function (p) { return "<option value=\"".concat(esc(p.id), "\">").concat(esc(p.displayName), "</option>"); }).join(""), "</select></label>\n          <label>Efeito<input name=\"name\" placeholder=\"Atordoado\" required></label>\n          <label>Rodadas<input name=\"duration\" type=\"number\" min=\"1\" value=\"1\" required></label>\n          <button class=\"onlineBtn secundario\" type=\"submit\">Adicionar</button>\n        </form>\n      </div></details>") : "", "\n    </section>");
    }
    function renderXp(st) {
        var jogadores = participantes(st).filter(function (p) { return p.type === "player"; });
        return "<details class=\"onlineCard onlineDetails\" data-online-detail=\"progression\">\n      <summary><span><b>Progress\u00E3o dos jogadores</b><small>N\u00EDvel individual e distribui\u00E7\u00E3o de XP</small></span></summary>\n      <div class=\"onlineDetailsConteudo onlineProgressaoConteudo\">\n        <section class=\"onlineProgressaoSecao\">\n          <div class=\"onlineProgressaoTitulo\"><h4>Alterar n\u00EDvel individual</h4><small>O n\u00EDvel \u00E9 enviado diretamente para a ficha do jogador. PV e Chakra n\u00E3o s\u00E3o recalculados.</small></div>\n          <div class=\"onlineNivelJogadores\">".concat(jogadores.length ? jogadores.map(function (p) {
            var _a, _b;
            return "<form data-form=\"set-player-level\" data-participant-id=\"".concat(esc(p.id), "\" class=\"onlineNivelJogador\">\n            <div class=\"onlineNivelJogadorNome\"><span class=\"presencaDot ").concat(conectado(st, p) ? "conectado" : "", "\"></span><div><strong>").concat(esc(p.displayName), "</strong><small>N\u00EDvel atual na sala: ").concat(Math.max(1, num((_a = p.battle) === null || _a === void 0 ? void 0 : _a.level, 1)), "</small></div></div>\n            <label>N\u00EDvel<input name=\"level\" type=\"number\" min=\"1\" max=\"20\" value=\"").concat(Math.max(1, num((_b = p.battle) === null || _b === void 0 ? void 0 : _b.level, 1)), "\" required></label>\n            <button class=\"onlineBtn secundario\" type=\"submit\">Salvar n\u00EDvel</button>\n          </form>");
        }).join("") : "<p class=\"onlineVazio\">Aguarde jogadores entrarem na sala.</p>", "</div>\n        </section>\n        <section class=\"onlineProgressaoSecao\">\n          <div class=\"onlineProgressaoTitulo\"><h4>Distribuir XP</h4><small>Funciona tamb\u00E9m para jogadores que entraram como convidados.</small></div>\n          <form data-form=\"grant-xp\" class=\"onlineForm\">\n            <div class=\"onlineXpJogadores\">").concat(jogadores.length ? jogadores.map(function (p) { return "<label><input type=\"checkbox\" name=\"participantIds\" value=\"".concat(esc(p.id), "\" checked><span class=\"presencaDot ").concat(conectado(st, p) ? "conectado" : "", "\"></span>").concat(esc(p.displayName), "</label>"); }).join("") : "<p class=\"onlineVazio\">Aguarde jogadores entrarem na sala.</p>", "</div>\n            <div class=\"onlineFormGrid\"><label>Quantidade<input name=\"amount\" type=\"number\" value=\"500\" required></label><label>Motivo<input name=\"reason\" maxlength=\"160\" placeholder=\"Fim da miss\u00E3o\"></label></div>\n            <button class=\"onlineBtn primario\" type=\"submit\" ").concat(jogadores.length ? "" : "disabled", ">Conceder XP</button>\n          </form>\n        </section>\n      </div>\n    </details>");
    }
    function renderNavegacaoMesaMestre(st) {
        var _a;
        var combat = ((_a = st.sala) === null || _a === void 0 ? void 0 : _a.combat) || {};
        var rodada = Math.max(1, num(combat.round, 1));
        var ps = participantes(st);
        return "<nav class=\"onlineMesaMestreTabs\" aria-label=\"\u00C1rea da mesa do mestre\">\n      <button type=\"button\" class=\"onlineMesaMestreTab ".concat(modoMesaMestre === "combate" ? "ativo" : "", "\" data-action=\"master-room-view\" data-view=\"combate\" aria-pressed=\"").concat(modoMesaMestre === "combate" ? "true" : "false", "\">\n        <span>Combate</span><small>").concat(combat.started ? "Rodada ".concat(rodada) : "".concat(ps.length, " ").concat(ps.length === 1 ? "participante" : "participantes"), "</small>\n      </button>\n      <button type=\"button\" class=\"onlineMesaMestreTab ").concat(modoMesaMestre === "gestao" ? "ativo" : "", "\" data-action=\"master-room-view\" data-view=\"gestao\" aria-pressed=\"").concat(modoMesaMestre === "gestao" ? "true" : "false", "\">\n        <span>Gest\u00E3o</span><small>Convite \u00B7 NPCs \u00B7 XP</small>\n      </button>\n    </nav>");
    }
    function aplicarModoMesaMestre(conteudo) {
        if (conteudo === void 0) { conteudo = document.getElementById("shinobiOnlineConteudo"); }
        if (!conteudo)
            return;
        conteudo.querySelectorAll("[data-master-room-panel]").forEach(function (painel) {
            painel.hidden = painel.dataset.masterRoomPanel !== modoMesaMestre;
        });
        conteudo.querySelectorAll("[data-action=\"master-room-view\"]").forEach(function (botao) {
            var ativo = botao.dataset.view === modoMesaMestre;
            botao.classList.toggle("ativo", ativo);
            botao.setAttribute("aria-pressed", ativo ? "true" : "false");
        });
    }
    function renderSala(st) {
        var master = ehMestre(st);
        var ps = participantes(st);
        var topo = "<section class=\"onlineCard onlineSalaTopo onlineSalaTopoCompacta\">\n        <div><span class=\"onlineCardSelo\">".concat(master ? "SALA DO MESTRE" : "SALA ATUAL", "</span><h3>").concat(esc(st.sala.title), "</h3><div class=\"onlineSalaMeta\"><span class=\"onlineSalaStatus ").concat(st.sala.status === "open" ? "aberta" : "fechada", "\">").concat(st.sala.status === "open" ? "● Sala aberta" : "Sala encerrada", "</span><span>").concat(ps.length, " ").concat(ps.length === 1 ? "participante" : "participantes", "</span>").concat(master && st.sala.campaignId ? "<button type=\"button\" class=\"onlineSalaCampanhaLink\" data-action=\"go-master-area\">\u00C1rea da campanha</button>" : "", "</div></div>\n        <button type=\"button\" class=\"onlineCodigoRapido\" data-action=\"copy-code\" title=\"Copiar c\u00F3digo da sala\"><small>C\u00D3DIGO</small><strong>").concat(esc(st.sala.code), "</strong></button>\n      </section>");
        if (!master) {
            return "".concat(topo, "\n        ").concat(renderCombate(st, false), "\n        ").concat(renderParticipantes(st, false), "\n        ").concat(renderEfeitos(st, false), "\n        <section class=\"onlineCard onlineZonaPerigo onlineZonaPerigoCompacta\"><button class=\"onlineBtn perigo\" data-action=\"leave-room\">Sair da sala</button></section>");
        }
        return "".concat(topo, "\n      ").concat(renderNavegacaoMesaMestre(st), "\n      <div class=\"onlineMesaMestrePainel\" data-master-room-panel=\"combate\" ").concat(modoMesaMestre === "combate" ? "" : "hidden", ">\n        ").concat(renderCombate(st, true), "\n        ").concat(renderParticipantes(st, true), "\n        ").concat(renderEfeitos(st, true), "\n      </div>\n      <div class=\"onlineMesaMestrePainel\" data-master-room-panel=\"gestao\" ").concat(modoMesaMestre === "gestao" ? "" : "hidden", ">\n        ").concat(renderConviteSala(st), "\n        ").concat(renderAdicionarNpc(st), "\n        ").concat(renderXp(st), "\n        <section class=\"onlineCard onlineZonaPerigo onlineZonaPerigoCompacta\"><button class=\"onlineBtn perigo\" data-action=\"close-room\">Encerrar sala</button></section>\n      </div>");
    }
    function renderHome(st) {
        return "".concat(cabecalhoConta(st)).concat(renderConflito(), "<div class=\"onlineGridDois\">").concat(!st.user.anonymous ? renderMestreHome(st) : "").concat(renderEntradaSala(st), "</div>").concat(renderNuvem(st));
    }
    function chaveFormulario(form, indice) {
        var _a, _b;
        return [((_a = form === null || form === void 0 ? void 0 : form.dataset) === null || _a === void 0 ? void 0 : _a.form) || "form", ((_b = form === null || form === void 0 ? void 0 : form.dataset) === null || _b === void 0 ? void 0 : _b.participantId) || "", indice].join("::");
    }
    function capturarInteracao(conteudo) {
        var estado = { details: {}, campos: [], foco: null, scrollTop: (conteudo === null || conteudo === void 0 ? void 0 : conteudo.scrollTop) || 0 };
        if (!conteudo)
            return estado;
        conteudo.querySelectorAll("details[data-online-detail]").forEach(function (el) { estado.details[el.dataset.onlineDetail] = el.open; });
        conteudo.querySelectorAll("form[data-form]").forEach(function (form, indiceForm) {
            var chave = chaveFormulario(form, indiceForm);
            form.querySelectorAll("input[name],select[name],textarea[name]").forEach(function (campo, indiceCampo) {
                estado.campos.push({
                    chave: chave,
                    nome: campo.name, indice: indiceCampo, tipo: campo.type || campo.tagName,
                    value: campo.value, checked: Boolean(campo.checked)
                });
            });
        });
        var ativo = document.activeElement;
        if (ativo && conteudo.contains(ativo) && ativo.name) {
            var form = ativo.closest("form[data-form]");
            if (form) {
                var forms = __spreadArray([], __read(conteudo.querySelectorAll("form[data-form]")), false);
                estado.foco = {
                    chave: chaveFormulario(form, forms.indexOf(form)), nome: ativo.name,
                    inicio: Number.isInteger(ativo.selectionStart) ? ativo.selectionStart : null,
                    fim: Number.isInteger(ativo.selectionEnd) ? ativo.selectionEnd : null
                };
            }
        }
        return estado;
    }
    function restaurarInteracao(conteudo, estado) {
        var _a;
        if (!conteudo || !estado)
            return;
        conteudo.querySelectorAll("details[data-online-detail]").forEach(function (el) {
            if (Object.prototype.hasOwnProperty.call(estado.details || {}, el.dataset.onlineDetail))
                el.open = Boolean(estado.details[el.dataset.onlineDetail]);
        });
        var forms = __spreadArray([], __read(conteudo.querySelectorAll("form[data-form]")), false);
        var mapa = new Map(forms.map(function (form, indice) { return [chaveFormulario(form, indice), form]; }));
        (estado.campos || []).forEach(function (item) {
            var form = mapa.get(item.chave);
            if (!form)
                return;
            var candidatos = __spreadArray([], __read(form.querySelectorAll("[name=\"".concat(CSS.escape(item.nome), "\"]"))), false);
            var campo = candidatos[item.indice] || candidatos[0];
            if (!campo)
                return;
            if (campo.type === "checkbox" || campo.type === "radio")
                campo.checked = item.checked;
            else
                campo.value = item.value;
        });
        if (estado.foco) {
            var form = mapa.get(estado.foco.chave);
            var campo = form === null || form === void 0 ? void 0 : form.querySelector("[name=\"".concat(CSS.escape(estado.foco.nome), "\"]"));
            if (campo) {
                campo.focus({ preventScroll: true });
                if (estado.foco.inicio !== null && typeof campo.setSelectionRange === "function") {
                    try {
                        campo.setSelectionRange(estado.foco.inicio, (_a = estado.foco.fim) !== null && _a !== void 0 ? _a : estado.foco.inicio);
                    }
                    catch (_erro) { }
                }
            }
        }
        conteudo.scrollTop = estado.scrollTop || 0;
    }
    function renderizar() {
        criarRoot();
        atualizarCabecalhoDestino();
        var conteudo = document.getElementById("shinobiOnlineConteudo"), st = obterEstado();
        if (!conteudo)
            return;
        var interacao = capturarInteracao(conteudo);
        if (st.carregando) {
            conteudo.innerHTML = '<div class="onlineLoading"><span></span><p>Conectando ao sistema online...</p></div>';
            return;
        }
        if (!st.configurado) {
            conteudo.innerHTML = renderConfiguracao();
            return;
        }
        if (st.ultimoErro && !st.iniciado) {
            conteudo.innerHTML = "<section class=\"onlineCard\"><h3>Falha ao iniciar</h3><p>".concat(esc(st.ultimoErro), "</p><button type=\"button\" class=\"onlineBtn primario\" data-action=\"retry-online\">Tentar novamente</button></section>");
            return;
        }
        var destinoHtml = destinoAtual ? renderDestino(st) : null;
        if (destinoHtml !== null) {
            conteudo.innerHTML = destinoHtml;
            restaurarInteracao(conteudo, interacao);
            aplicarModoMesaMestre(conteudo);
            requestAnimationFrame(function () { renderQr(); aplicarDestino(); });
            return;
        }
        if (!st.user) {
            conteudo.innerHTML = renderLogin();
            return;
        }
        conteudo.innerHTML = st.sala ? renderSala(st) : renderHome(st);
        restaurarInteracao(conteudo, interacao);
        aplicarModoMesaMestre(conteudo);
        requestAnimationFrame(function () { renderQr(); });
    }
    function renderQr() {
        var _a;
        var host = document.getElementById("shinobiQrCode");
        if (!host)
            return;
        var link = host.dataset.link;
        try {
            if (typeof window.ShinobiQRCodeSvg !== "function")
                throw new Error("Gerador QR indisponível");
            host.innerHTML = window.ShinobiQRCodeSvg(link, { cellSize: 5, margin: 4, level: "M" });
        }
        catch (_erro) {
            host.innerHTML = "<div class=\"onlineQrFallback\">".concat(esc(((_a = obterEstado().sala) === null || _a === void 0 ? void 0 : _a.code) || ""), "</div><small>Use o c\u00F3digo manual</small>");
        }
    }
    function executar(acao_1) {
        return __awaiter(this, arguments, void 0, function (acao, _a) {
            var conteudo, erro_2;
            var _b, _c;
            var _d = _a === void 0 ? {} : _a, _e = _d.mensagem, mensagem = _e === void 0 ? "Processando..." : _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        conteudo = document.getElementById("shinobiOnlineConteudo");
                        conteudo === null || conteudo === void 0 ? void 0 : conteudo.classList.add("ocupado");
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 3, 5, 6]);
                        return [4 /*yield*/, acao()];
                    case 2: return [2 /*return*/, _f.sent()];
                    case 3:
                        erro_2 = _f.sent();
                        return [4 /*yield*/, avisar("Não foi possível concluir", ((_c = (_b = window.ShinobiOnline) === null || _b === void 0 ? void 0 : _b.erroAmigavel) === null || _c === void 0 ? void 0 : _c.call(_b, erro_2)) || erro_2.message || String(erro_2))];
                    case 4:
                        _f.sent();
                        throw erro_2;
                    case 5:
                        conteudo === null || conteudo === void 0 ? void 0 : conteudo.classList.remove("ocupado");
                        agendarRender();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    function avisar(titulo, mensagem) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof window.avisoShinobi === "function")
                    return [2 /*return*/, window.avisoShinobi(titulo, mensagem)];
                alert("".concat(titulo, "\n\n").concat(mensagem));
                return [2 /*return*/];
            });
        });
    }
    function confirmar(titulo, mensagem) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof window.modalShinobi === "function")
                    return [2 /*return*/, window.modalShinobi(titulo, mensagem)];
                return [2 /*return*/, confirm("".concat(titulo, "\n\n").concat(mensagem))];
            });
        });
    }
    function tratarClique(evento) {
        return __awaiter(this, void 0, void 0, function () {
            var el, acao, id, id_1, id_2, campanha, novoNome_1, id_3, campanha, salas, abertas, detalhe, confirmado, resumo, linhas, stAtual, mensagemDestino, ok;
            var _this = this;
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        el = evento.target.closest("[data-action]");
                        if (!el) {
                            if (campanhaMenuAberto) {
                                campanhaMenuAberto = null;
                                agendarRender();
                            }
                            return [2 /*return*/];
                        }
                        acao = el.dataset.action;
                        if (acao === "back-panel")
                            return [2 /*return*/, voltarPainelOnline()];
                        if (acao === "close")
                            return [2 /*return*/, voltarPainelOnline()];
                        if (acao === "stop-scan")
                            return [2 /*return*/, pararScanner()];
                        if (acao === "retry-online")
                            return [2 /*return*/, executar(function () { return window.ShinobiOnline.iniciar(); })];
                        if (acao === "login-google")
                            return [2 /*return*/, executar(function () { return window.ShinobiOnline.entrarGoogle(); })];
                        if (acao === "login-anonymous")
                            return [2 /*return*/, executar(function () { return window.ShinobiOnline.entrarAnonimo(); })];
                        if (acao === "logout")
                            return [2 /*return*/, executar(function () { return window.ShinobiOnline.sair(); })];
                        if (acao === "go-login") {
                            destinoAtual = "login";
                            renderizar();
                            return [2 /*return*/];
                        }
                        if (acao === "go-join-room") {
                            destinoAtual = "entrar-sala";
                            renderizar();
                            return [2 /*return*/];
                        }
                        if (acao === "go-create-room") {
                            destinoAtual = "area-mestre";
                            renderizar();
                            return [2 /*return*/];
                        }
                        if (acao === "go-master-area") {
                            if ((_a = obterEstado().sala) === null || _a === void 0 ? void 0 : _a.campaignId)
                                selecionarCampanhaMestre(obterEstado().sala.campaignId);
                            destinoAtual = "area-mestre";
                            renderizar();
                            return [2 /*return*/];
                        }
                        if (acao === "open-current-room") {
                            destinoAtual = "sala-atual";
                            renderizar();
                            return [2 /*return*/];
                        }
                        if (acao === "master-room-view") {
                            modoMesaMestre = el.dataset.view === "gestao" ? "gestao" : "combate";
                            try {
                                localStorage.setItem(CHAVE_MODO_MESA_MESTRE, modoMesaMestre);
                            }
                            catch (_erro) { }
                            aplicarModoMesaMestre();
                            return [2 /*return*/];
                        }
                        if (acao === "back-sync") {
                            destinoAtual = "sincronizacao";
                            renderizar();
                            verificarSincronizacaoAoAbrir();
                            return [2 /*return*/];
                        }
                        if (acao === "manage-backups") {
                            destinoAtual = "backups";
                            backupsHistoricos = [];
                            backupsErro = "";
                            renderizar();
                            return [2 /*return*/, carregarBackupsAtivos()];
                        }
                        if (acao === "reload-backups")
                            return [2 /*return*/, carregarBackupsAtivos()];
                        if (acao === "create-history-backup")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var resultado;
                                    var _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                try {
                                                    if (typeof window.salvar === "function")
                                                        window.salvar();
                                                }
                                                catch (_erro) { }
                                                return [4 /*yield*/, window.ShinobiOnline.criarBackupHistoricoAtual((_a = window.ShinobiOnline.fichaAtualLocal()) === null || _a === void 0 ? void 0 : _a.name, { motivo: "manual" })];
                                            case 1:
                                                resultado = _b.sent();
                                                return [4 /*yield*/, carregarBackupsAtivos()];
                                            case 2:
                                                _b.sent();
                                                return [4 /*yield*/, avisar("Backup criado", "Um ponto de restaura\u00E7\u00E3o foi salvo. O Shinobi mant\u00E9m no m\u00E1ximo 3 backups hist\u00F3ricos por ficha.")];
                                            case 3:
                                                _b.sent();
                                                return [2 /*return*/, resultado];
                                        }
                                    });
                                }); })];
                        if (acao === "delete-history-backup")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var ok;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, confirmar("Excluir backup", "Excluir este backup histórico? Esta versão específica não poderá ser restaurada depois.")];
                                            case 1:
                                                ok = _a.sent();
                                                if (!ok)
                                                    return [2 /*return*/];
                                                return [4 /*yield*/, window.ShinobiOnline.excluirBackupHistorico(el.dataset.sheetId, el.dataset.backupId)];
                                            case 2:
                                                _a.sent();
                                                return [4 /*yield*/, carregarBackupsAtivos()];
                                            case 3:
                                                _a.sent();
                                                return [4 /*yield*/, avisar("Backup excluído", "A versão histórica foi removida da nuvem.")];
                                            case 4:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "restore-history-backup")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var ok, resultado;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, confirmar("Restaurar backup histórico", "Esta versão substituirá o estado atual desta ficha e será propagada para os outros aparelhos. Antes da restauração, o Shinobi criará automaticamente um backup de segurança do estado atual.\n\nContinuar?")];
                                            case 1:
                                                ok = _a.sent();
                                                if (!ok)
                                                    return [2 /*return*/];
                                                return [4 /*yield*/, window.ShinobiOnline.restaurarBackupHistorico(el.dataset.sheetId, el.dataset.backupId)];
                                            case 2:
                                                resultado = _a.sent();
                                                if (!(resultado === null || resultado === void 0 ? void 0 : resultado.snapshotAgendado)) return [3 /*break*/, 4];
                                                return [4 /*yield*/, avisar("Backup restaurado", "A versão escolhida foi aplicada à ficha e à sincronização. O snapshot estrutural será consolidado automaticamente sem atrasar a restauração. O app será recarregado agora.")];
                                            case 3:
                                                _a.sent();
                                                return [3 /*break*/, 8];
                                            case 4:
                                                if (!(resultado === null || resultado === void 0 ? void 0 : resultado.snapshotPendente)) return [3 /*break*/, 6];
                                                return [4 /*yield*/, avisar("Backup restaurado", "A vers\u00E3o escolhida foi aplicada \u00E0 ficha e \u00E0 sincroniza\u00E7\u00E3o. O backup completo atual ficou pendente e o Shinobi tentar\u00E1 envi\u00E1-lo novamente.".concat(resultado.snapshotErro ? "\n\nDetalhe: ".concat(resultado.snapshotErro) : "", "\n\nO app ser\u00E1 recarregado agora."))];
                                            case 5:
                                                _a.sent();
                                                return [3 /*break*/, 8];
                                            case 6: return [4 /*yield*/, avisar("Backup restaurado", "A versão escolhida foi aplicada à ficha, à sincronização e ao backup atual. O app será recarregado agora.")];
                                            case 7:
                                                _a.sent();
                                                _a.label = 8;
                                            case 8:
                                                setTimeout(function () { return window.location.reload(); }, 180);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "switch-google-account")
                            return [2 /*return*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                                    var st, ok;
                                    var _this = this;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                st = obterEstado();
                                                if (!st.sala) return [3 /*break*/, 2];
                                                return [4 /*yield*/, confirmar("Trocar usuário", "Voc\u00EA est\u00E1 conectado \u00E0 sala ".concat(st.sala.code || "atual", ". Para trocar a Conta Google, este usu\u00E1rio ser\u00E1 desconectado da sala. Continuar?"))];
                                            case 1:
                                                ok = _a.sent();
                                                if (!ok)
                                                    return [2 /*return*/];
                                                _a.label = 2;
                                            case 2: return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                if (!obterEstado().sala) return [3 /*break*/, 2];
                                                                return [4 /*yield*/, window.ShinobiOnline.sairDaSala({ silencioso: true })];
                                                            case 1:
                                                                _a.sent();
                                                                _a.label = 2;
                                                            case 2: return [4 /*yield*/, window.ShinobiOnline.trocarContaGoogle()];
                                                            case 3:
                                                                _a.sent();
                                                                destinoAtual = "conta-conectada";
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); })];
                                        }
                                    });
                                }); })()];
                        if (acao === "reconnect-current-room")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var sessao, st;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                sessao = sessaoLocal();
                                                return [4 /*yield*/, window.ShinobiOnline.iniciar()];
                                            case 1:
                                                _a.sent();
                                                st = obterEstado();
                                                if (!(sessao === null || sessao === void 0 ? void 0 : sessao.roomId))
                                                    throw new Error("Não existe uma sala salva neste aparelho.");
                                                if (!st.user)
                                                    throw new Error("A sessão da conta ainda não foi restaurada. Abra Minha conta e faça login novamente.");
                                                return [4 /*yield*/, window.ShinobiOnline.observarSala(sessao.roomId, { restaurar: true })];
                                            case 2:
                                                _a.sent();
                                                destinoAtual = "sala-atual";
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "scan-qr")
                            return [2 /*return*/, iniciarScanner()];
                        if (acao === "toggle-campaign-menu") {
                            id = el.dataset.campaignId;
                            campanhaMenuAberto = campanhaMenuAberto === id ? null : id;
                            agendarRender();
                            return [2 /*return*/];
                        }
                        if (acao === "open-campaign") {
                            id_1 = String(el.dataset.campaignId || "");
                            campanhaMenuAberto = null;
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, window.ShinobiOnline.prepararCampanhaPermanente(id_1)];
                                            case 1:
                                                _a.sent();
                                                selecionarCampanhaMestre(id_1);
                                                destinoAtual = "area-mestre";
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        }
                        if (acao === "back-campaigns") {
                            selecionarCampanhaMestre("");
                            campanhaMenuAberto = null;
                            destinoAtual = "area-mestre";
                            renderizar();
                            return [2 /*return*/];
                        }
                        if (acao === "open-campaign-room")
                            return [2 /*return*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                                    var campaignId, roomId, st, ok;
                                    var _this = this;
                                    var _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                campaignId = String(el.dataset.campaignId || "");
                                                roomId = String(el.dataset.roomId || "");
                                                st = obterEstado();
                                                if (String(((_a = st.sala) === null || _a === void 0 ? void 0 : _a.id) || st.salaId || "") === roomId) {
                                                    destinoAtual = "sala-atual";
                                                    renderizar();
                                                    return [2 /*return*/];
                                                }
                                                if (!st.sala) return [3 /*break*/, 2];
                                                return [4 /*yield*/, confirmar("Trocar de sala", "Voc\u00EA est\u00E1 conectado \u00E0 sala \u201C".concat(st.sala.title || st.sala.code || "atual", "\u201D. Deseja sair dela e abrir esta sess\u00E3o como mestre?"))];
                                            case 1:
                                                ok = _b.sent();
                                                if (!ok)
                                                    return [2 /*return*/];
                                                _b.label = 2;
                                            case 2: return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                if (!obterEstado().sala) return [3 /*break*/, 2];
                                                                return [4 /*yield*/, window.ShinobiOnline.sairDaSala({ silencioso: true })];
                                                            case 1:
                                                                _a.sent();
                                                                _a.label = 2;
                                                            case 2: return [4 /*yield*/, window.ShinobiOnline.abrirSalaComoMestre({ campaignId: campaignId, roomId: roomId })];
                                                            case 3:
                                                                _a.sent();
                                                                selecionarCampanhaMestre(campaignId);
                                                                destinoAtual = "sala-atual";
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); })];
                                        }
                                    });
                                }); })()];
                        if (acao === "edit-campaign") {
                            id_2 = el.dataset.campaignId;
                            campanha = (_b = obterEstado().campanhas) === null || _b === void 0 ? void 0 : _b.find(function (item) { return item.id === id_2; });
                            if (!campanha)
                                return [2 /*return*/];
                            novoNome_1 = prompt("Novo nome da campanha:", campanha.name || "");
                            if (novoNome_1 === null)
                                return [2 /*return*/];
                            campanhaMenuAberto = null;
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, window.ShinobiOnline.editarCampanha(id_2, novoNome_1)];
                                            case 1:
                                                _a.sent();
                                                return [4 /*yield*/, avisar("Campanha atualizada", "O novo nome foi salvo.")];
                                            case 2:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        }
                        if (!(acao === "delete-campaign")) return [3 /*break*/, 2];
                        id_3 = el.dataset.campaignId;
                        campanha = (_c = obterEstado().campanhas) === null || _c === void 0 ? void 0 : _c.find(function (item) { return item.id === id_3; });
                        if (!campanha)
                            return [2 /*return*/];
                        salas = Object.values(campanha.rooms || {});
                        abertas = salas.filter(function (sala) { return (sala === null || sala === void 0 ? void 0 : sala.status) === "open"; }).length;
                        detalhe = salas.length
                            ? "Esta campanha possui ".concat(salas.length, " sess\u00E3o(\u00F5es). ").concat(abertas ? "".concat(abertas, " sala(s) aberta(s) tamb\u00E9m ser\u00E3o encerradas. ") : "", "A exclus\u00E3o da campanha n\u00E3o poder\u00E1 ser desfeita.")
                            : "A campanha será removida permanentemente.";
                        return [4 /*yield*/, confirmar("Excluir campanha", "Excluir \u201C".concat(campanha.name, "\u201D?\n\n").concat(detalhe))];
                    case 1:
                        confirmado = _j.sent();
                        if (!confirmado)
                            return [2 /*return*/];
                        campanhaMenuAberto = null;
                        return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                var resultado, complemento;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, window.ShinobiOnline.excluirCampanha(id_3)];
                                        case 1:
                                            resultado = _a.sent();
                                            if (campanhaMestreId === id_3)
                                                selecionarCampanhaMestre("");
                                            complemento = (resultado === null || resultado === void 0 ? void 0 : resultado.closedRooms) ? " ".concat(resultado.closedRooms, " sala(s) vinculada(s) foram encerradas.") : "";
                                            return [4 /*yield*/, avisar("Campanha excluída", "A campanha foi removida.".concat(complemento))];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        if (acao === "remove-campaign-member")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var st, membro, nome, ok;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                st = obterEstado();
                                                membro = (st.membrosCampanha || []).find(function (item) { return String(item.userId) === String(el.dataset.userId) && String(item.characterId) === String(el.dataset.characterId); });
                                                if (!membro)
                                                    return [2 /*return*/];
                                                nome = String(membro.displayName || el.dataset.displayName || "Personagem");
                                                return [4 /*yield*/, confirmar("Remover jogador da campanha", "Remover \u201C".concat(nome, "\u201D da campanha?\n\nEle deixar\u00E1 de aparecer entre os jogadores ativos e n\u00E3o receber\u00E1 novos XP da campanha. XP j\u00E1 pendente ficar\u00E1 pausado, e todo o hist\u00F3rico ser\u00E1 preservado. Isso n\u00E3o apaga a ficha do jogador nem o remove de uma sala que j\u00E1 esteja aberta."))];
                                            case 1:
                                                ok = _a.sent();
                                                if (!ok)
                                                    return [2 /*return*/];
                                                return [4 /*yield*/, window.ShinobiOnline.removerMembroCampanha({
                                                        campaignId: el.dataset.campaignId, userId: el.dataset.userId, characterId: el.dataset.characterId
                                                    })];
                                            case 2:
                                                _a.sent();
                                                return [4 /*yield*/, avisar("Jogador removido", "".concat(nome, " foi removido da campanha. Voc\u00EA pode reativ\u00E1-lo depois na lista de removidos."))];
                                            case 3:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "restore-campaign-member")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var nome, ok;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                nome = String(el.dataset.displayName || "Personagem");
                                                return [4 /*yield*/, confirmar("Reativar jogador", "Reativar \u201C".concat(nome, "\u201D nesta campanha?\n\nO v\u00EDnculo permanente volta a ficar ativo e XP pendente desse mesmo v\u00EDnculo poder\u00E1 ser entregue novamente."))];
                                            case 1:
                                                ok = _a.sent();
                                                if (!ok)
                                                    return [2 /*return*/];
                                                return [4 /*yield*/, window.ShinobiOnline.reativarMembroCampanha({
                                                        campaignId: el.dataset.campaignId, userId: el.dataset.userId, characterId: el.dataset.characterId
                                                    })];
                                            case 2:
                                                _a.sent();
                                                return [4 /*yield*/, avisar("Jogador reativado", "".concat(nome, " voltou a fazer parte da campanha."))];
                                            case 3:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "rebind-campaign-member")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var atual, nomeMembro, nomeFicha, ok, resultado;
                                    var _a, _b;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                atual = (_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.fichaAtualLocal) === null || _b === void 0 ? void 0 : _b.call(_a);
                                                if (!atual)
                                                    throw new Error("Abra primeiro a ficha correta que deve representar este personagem.");
                                                nomeMembro = String(el.dataset.displayName || "Personagem");
                                                nomeFicha = String(atual.characterName || atual.name || "ficha atual");
                                                return [4 /*yield*/, confirmar("Reassociar personagem", "O v\u00EDnculo \u201C".concat(nomeMembro, "\u201D ser\u00E1 transferido para a ficha que est\u00E1 aberta agora: \u201C").concat(nomeFicha, "\u201D.\n\nXP pendente desse v\u00EDnculo tamb\u00E9m ser\u00E1 redirecionado para esta ficha. Nenhuma associa\u00E7\u00E3o ser\u00E1 feita apenas pelo nome.\n\nContinuar?"))];
                                            case 1:
                                                ok = _c.sent();
                                                if (!ok)
                                                    return [2 /*return*/];
                                                return [4 /*yield*/, window.ShinobiOnline.reassociarMembroCampanhaComFichaAtual({
                                                        campaignId: el.dataset.campaignId, userId: el.dataset.userId, characterId: el.dataset.characterId
                                                    })];
                                            case 2:
                                                resultado = _c.sent();
                                                return [4 /*yield*/, avisar("Vínculo atualizado", "".concat(resultado.displayName || nomeFicha, " agora aponta para a ficha correta.").concat(Number(resultado.migratedPending || 0) > 0 ? " ".concat(resultado.migratedPending, " lan\u00E7amento(s) de XP pendente(s) foram redirecionados.") : ""))];
                                            case 3:
                                                _c.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "edit-campaign-npc")
                            return [2 /*return*/, editarNpcCampanha(el.dataset.campaignId, el.dataset.npcId)];
                        if (acao === "archive-campaign-npc")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var st, npc, ok;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                st = obterEstado(), npc = (st.npcsCampanha || []).find(function (item) { return String(item.id) === String(el.dataset.npcId); });
                                                if (!npc)
                                                    return [2 /*return*/];
                                                return [4 /*yield*/, confirmar("Arquivar NPC", "Arquivar \u201C".concat(npc.displayName || "NPC", "\u201D da biblioteca? NPCs que j\u00E1 foram usados em sess\u00F5es antigas n\u00E3o ser\u00E3o alterados."))];
                                            case 1:
                                                ok = _a.sent();
                                                if (!ok)
                                                    return [2 /*return*/];
                                                return [4 /*yield*/, window.ShinobiOnline.arquivarNpcCampanha(el.dataset.campaignId, el.dataset.npcId)];
                                            case 2:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "copy-code")
                            return [2 /*return*/, copiar((_d = obterEstado().sala) === null || _d === void 0 ? void 0 : _d.code, "Código copiado.")];
                        if (acao === "copy-link")
                            return [2 /*return*/, copiar(window.ShinobiOnline.linkDaSala((_e = obterEstado().sala) === null || _e === void 0 ? void 0 : _e.code), "Link copiado.")];
                        if (acao === "sync-check")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var _a, _b, _c, _d;
                                    return __generator(this, function (_e) {
                                        switch (_e.label) {
                                            case 0:
                                                try {
                                                    (_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.ativarBackupsNuvem) === null || _b === void 0 ? void 0 : _b.call(_a);
                                                }
                                                catch (_erro) { }
                                                return [4 /*yield*/, ((_d = (_c = window.EkoRealtimeSync) === null || _c === void 0 ? void 0 : _c.reconciliar) === null || _d === void 0 ? void 0 : _d.call(_c))];
                                            case 1:
                                                _e.sent();
                                                return [4 /*yield*/, avisar("Sincronização verificada", "As alterações confirmadas da ficha ativa foram conferidas. O backup na nuvem permanece separado.")];
                                            case 2:
                                                _e.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "regularize-current")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var ok, nome, resultado, detalhes, partes, extras;
                                    var _a, _b, _c, _d, _e, _f, _g, _h;
                                    return __generator(this, function (_j) {
                                        switch (_j.label) {
                                            case 0: return [4 /*yield*/, confirmar("Regularizar ficha completa", "O Shinobi vai unir notas, inventário, jutsus, ataques, Kekkei Genkai, carteira e histórico antigos deste aparelho com o que já existe na nuvem. Duplicatas idênticas serão unificadas; versões diferentes serão preservadas separadamente; exclusões já confirmadas no realtime não serão ressuscitadas.\n\nNa carteira, cada moeda é regularizada separadamente; se já existir um saldo realtime consolidado, ele é preservado.\n\nSe outro aparelho antigo tiver conteúdo que nunca chegou à nuvem, execute esta opção uma vez naquele aparelho também.\n\nContinuar?")];
                                            case 1:
                                                ok = _j.sent();
                                                if (!ok)
                                                    return [2 /*return*/];
                                                nome = (_a = window.ShinobiOnline.fichaAtualLocal()) === null || _a === void 0 ? void 0 : _a.name;
                                                return [4 /*yield*/, window.ShinobiOnline.regularizarFichaCompleta(nome)];
                                            case 2:
                                                resultado = _j.sent();
                                                detalhes = (resultado === null || resultado === void 0 ? void 0 : resultado.details) || {};
                                                partes = [
                                                    "Notas: ".concat(Number(((_b = detalhes.notas) === null || _b === void 0 ? void 0 : _b.total) || 0)),
                                                    "Invent\u00E1rio: ".concat(Number(((_c = detalhes.inventario) === null || _c === void 0 ? void 0 : _c.total) || 0)),
                                                    "Jutsus: ".concat(Number(((_d = detalhes.jutsus) === null || _d === void 0 ? void 0 : _d.total) || 0)),
                                                    "Ataques: ".concat(Number(((_e = detalhes.armados) === null || _e === void 0 ? void 0 : _e.total) || 0)),
                                                    "Kekkei Genkai: ".concat(Number(((_f = detalhes.kekkeiGenkai) === null || _f === void 0 ? void 0 : _f.total) || 0)),
                                                    "Carteira: ".concat(Number(((_g = detalhes.carteiraMoedas) === null || _g === void 0 ? void 0 : _g.total) || 0)),
                                                    "Hist\u00F3rico: ".concat(Number(((_h = detalhes.carteiraHistorico) === null || _h === void 0 ? void 0 : _h.total) || 0))
                                                ];
                                                extras = [];
                                                if (Number((resultado === null || resultado === void 0 ? void 0 : resultado.published) || 0) > 0)
                                                    extras.push("".concat(resultado.published, " item(ns) antigos publicados"));
                                                if (Number((resultado === null || resultado === void 0 ? void 0 : resultado.conflicts) || 0) > 0)
                                                    extras.push("".concat(resultado.conflicts, " diferen\u00E7a(s) preservada(s) como c\u00F3pia separada"));
                                                if (Number((resultado === null || resultado === void 0 ? void 0 : resultado.skippedDeleted) || 0) > 0)
                                                    extras.push("".concat(resultado.skippedDeleted, " item(ns) j\u00E1 exclu\u00EDdos mantidos como exclu\u00EDdos"));
                                                return [4 /*yield*/, avisar("Ficha regularizada", "".concat(partes.join(" • "), ".").concat(extras.length ? "\n\n".concat(extras.join(" • "), ".") : "", "\n\nO backup completo tamb\u00E9m foi atualizado. O app ser\u00E1 recarregado para consolidar os \u00EDndices locais."))];
                                            case 3:
                                                _j.sent();
                                                setTimeout(function () { return window.location.reload(); }, 180);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "sync-current")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                try {
                                                    if (typeof window.salvar === "function")
                                                        window.salvar();
                                                }
                                                catch (_erro) { }
                                                return [4 /*yield*/, window.ShinobiOnline.atualizarBackupEstrutural((_a = window.ShinobiOnline.fichaAtualLocal()) === null || _a === void 0 ? void 0 : _a.name, { motivo: "backup-manual" })];
                                            case 1:
                                                _b.sent();
                                                return [4 /*yield*/, avisar("Backup atualizado", "A ficha completa foi salva na nuvem. A sincronização entre dispositivos continua sendo feita separadamente por campo confirmado.")];
                                            case 2:
                                                _b.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "sync-all")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var _a, _b;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0: return [4 /*yield*/, ((_b = (_a = window.EkoRealtimeSync) === null || _a === void 0 ? void 0 : _a.reconciliar) === null || _b === void 0 ? void 0 : _b.call(_a))];
                                            case 1:
                                                _c.sent();
                                                return [4 /*yield*/, avisar("Sincronização verificada", "As alterações confirmadas pendentes da ficha ativa foram reenviadas.")];
                                            case 2:
                                                _c.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "restore-cloud")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var vinculada, mensagem;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                vinculada = el.dataset.linked === "true";
                                                mensagem = vinculada
                                                    ? "A versão local desta ficha será atualizada com os dados atuais da nuvem."
                                                    : "A ficha será baixada e ficará vinculada à mesma versão da nuvem neste aparelho.";
                                                return [4 /*yield*/, confirmar(vinculada ? "Baixar novamente" : "Baixar ficha", mensagem)];
                                            case 1:
                                                if (!_a.sent()) return [3 /*break*/, 4];
                                                return [4 /*yield*/, window.ShinobiOnline.restaurarFichaDaNuvem(el.dataset.sheetId, { asCopy: false })];
                                            case 2:
                                                _a.sent();
                                                return [4 /*yield*/, avisar("Ficha completa baixada", "A ficha foi aberta neste aparelho com notas, inventário, carteira, jutsus e demais dados da nuvem.")];
                                            case 3:
                                                _a.sent();
                                                _a.label = 4;
                                            case 4: return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "delete-cloud-sheet")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var nome, ok;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                nome = String(el.dataset.sheetName || "Ficha");
                                                return [4 /*yield*/, confirmar("Excluir da nuvem", "Remover \u201C".concat(nome, "\u201D da lista de sincroniza\u00E7\u00E3o?\n\nUse esta op\u00E7\u00E3o para fichas que j\u00E1 foram exclu\u00EDdas dos seus aparelhos. Backups hist\u00F3ricos continuam preservados."))];
                                            case 1:
                                                ok = _a.sent();
                                                if (!ok)
                                                    return [2 /*return*/];
                                                return [4 /*yield*/, window.ShinobiOnline.excluirFichaDaNuvem(el.dataset.sheetId)];
                                            case 2:
                                                _a.sent();
                                                return [4 /*yield*/, avisar("Ficha removida da nuvem", "Ela não aparecerá mais como personagem disponível para adicionar neste aparelho.")];
                                            case 3:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        if (acao === "resolve-conflict")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, window.ShinobiOnline.resolverConflito(el.dataset.sheetId, el.dataset.choice)];
                                        case 1:
                                            _a.sent();
                                            conflitoAtual = null;
                                            return [2 /*return*/];
                                    }
                                }); }); })];
                        if (acao === "sort-initiative")
                            return [2 /*return*/, executar(function () { return window.ShinobiOnline.ordenarIniciativa(); })];
                        if (acao === "start-combat")
                            return [2 /*return*/, executar(function () { return window.ShinobiOnline.iniciarCombate(); })];
                        if (acao === "next-turn")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var st, atual, combat, chave, ok;
                                    var _a, _b, _c;
                                    return __generator(this, function (_d) {
                                        switch (_d.label) {
                                            case 0:
                                                st = obterEstado();
                                                atual = participanteAtual(st);
                                                combat = ((_a = st.sala) === null || _a === void 0 ? void 0 : _a.combat) || {};
                                                chave = ((_c = (_b = window.ShinobiOnline) === null || _b === void 0 ? void 0 : _b.chaveTurnoAtual) === null || _c === void 0 ? void 0 : _c.call(_b, combat)) || "".concat(Math.max(1, num(combat.round, 1)), ":").concat(Math.max(0, num(combat.turnIndex)), ":").concat((atual === null || atual === void 0 ? void 0 : atual.id) || "");
                                                if (!((atual === null || atual === void 0 ? void 0 : atual.type) === "player" && atual.turnReadyKey !== chave)) return [3 /*break*/, 2];
                                                return [4 /*yield*/, confirmar("Turno ainda não sincronizado", "".concat(atual.displayName || "O jogador", " ainda n\u00E3o confirmou o encerramento deste turno. Se voc\u00EA avan\u00E7ar agora, o aplicativo tentar\u00E1 sincronizar automaticamente no aparelho dele para evitar perda de dados.\n\nAvan\u00E7ar mesmo assim?"))];
                                            case 1:
                                                ok = _d.sent();
                                                if (!ok)
                                                    return [2 /*return*/];
                                                _d.label = 2;
                                            case 2: return [2 /*return*/, window.ShinobiOnline.avancarTurno()];
                                        }
                                    });
                                }); })];
                        if (acao === "prev-turn")
                            return [2 /*return*/, executar(function () { return window.ShinobiOnline.voltarTurno(); })];
                        if (!(acao === "finish-my-turn")) return [3 /*break*/, 4];
                        resumo = ((_g = (_f = window.ShinobiOnline) === null || _f === void 0 ? void 0 : _f.resumoMudancasMeuTurno) === null || _g === void 0 ? void 0 : _g.call(_f)) || { lines: ["Alterações do turno serão sincronizadas."] };
                        linhas = (resumo.lines || []).join("\n");
                        stAtual = obterEstado();
                        mensagemDestino = ((_h = stAtual === null || stAtual === void 0 ? void 0 : stAtual.user) === null || _h === void 0 ? void 0 : _h.anonymous)
                            ? "Ao confirmar, o estado consolidado será enviado para a sala. Para sincronizar a ficha entre aparelhos, entre com Google."
                            : "Ao confirmar, a ficha será salva na nuvem e os outros dispositivos receberão esta versão.";
                        return [4 /*yield*/, confirmar("Encerrar e sincronizar turno?", "".concat(linhas, "\n\n").concat(mensagemDestino))];
                    case 3:
                        ok = _j.sent();
                        if (!ok)
                            return [2 /*return*/];
                        return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                var resultado;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, window.ShinobiOnline.finalizarMeuTurno()];
                                        case 1:
                                            resultado = _a.sent();
                                            if (!(resultado === null || resultado === void 0 ? void 0 : resultado.conflict)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, avisar("Conflito de sincronização", "Outro dispositivo possui uma versão mais recente desta ficha. Resolva o conflito antes de encerrar o turno.")];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                        case 3:
                                            if (!(resultado === null || resultado === void 0 ? void 0 : resultado.anonymous)) return [3 /*break*/, 5];
                                            return [4 /*yield*/, avisar("Turno atualizado", "As alterações foram enviadas para a sala. Para sincronizar a ficha entre aparelhos, entre com Google.")];
                                        case 4:
                                            _a.sent();
                                            return [3 /*break*/, 7];
                                        case 5: return [4 /*yield*/, avisar("Turno sincronizado", "As alterações deste turno foram confirmadas pelo Firebase. O mestre já pode avançar.")];
                                        case 6:
                                            _a.sent();
                                            _a.label = 7;
                                        case 7: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 4:
                        if (acao === "end-effect")
                            return [2 /*return*/, executar(function () { return window.ShinobiOnline.encerrarEfeito(el.dataset.effectId); })];
                        if (acao === "remove-participant")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () { var p; var _a, _b; return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            p = (_b = (_a = obterEstado().sala) === null || _a === void 0 ? void 0 : _a.participants) === null || _b === void 0 ? void 0 : _b[el.dataset.participantId];
                                            return [4 /*yield*/, confirmar("Remover participante", "Remover ".concat((p === null || p === void 0 ? void 0 : p.displayName) || "este participante", " da sala?"))];
                                        case 1:
                                            if (!_c.sent()) return [3 /*break*/, 3];
                                            return [4 /*yield*/, window.ShinobiOnline.removerParticipante(el.dataset.participantId)];
                                        case 2:
                                            _c.sent();
                                            _c.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                }); }); })];
                        if (acao === "edit-npc")
                            return [2 /*return*/, editarNpc(el.dataset.participantId)];
                        if (acao === "leave-room")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, confirmar("Sair da sala", "A ficha continuará salva neste aparelho e na nuvem.")];
                                        case 1:
                                            if (!_a.sent()) return [3 /*break*/, 3];
                                            return [4 /*yield*/, window.ShinobiOnline.sairDaSala()];
                                        case 2:
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                }); }); })];
                        if (acao === "close-room")
                            return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, confirmar("Encerrar sala", "Jogadores não poderão entrar novamente com este código.")];
                                        case 1:
                                            if (!_a.sent()) return [3 /*break*/, 3];
                                            return [4 /*yield*/, window.ShinobiOnline.encerrarSala()];
                                        case 2:
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                }); }); })];
                        return [2 /*return*/];
                }
            });
        });
    }
    function tratarSubmit(evento) {
        return __awaiter(this, void 0, void 0, function () {
            var form, dados, tipo;
            var _this = this;
            return __generator(this, function (_a) {
                form = evento.target.closest("form[data-form]");
                if (!form)
                    return [2 /*return*/];
                evento.preventDefault();
                dados = new FormData(form), tipo = form.dataset.form;
                if (tipo === "create-campaign")
                    return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                            var id;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, window.ShinobiOnline.criarCampanha(dados.get("name"))];
                                    case 1:
                                        id = _a.sent();
                                        selecionarCampanhaMestre(id);
                                        destinoAtual = "area-mestre";
                                        form.reset();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                if (tipo === "create-room")
                    return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, window.ShinobiOnline.criarSala({ campaignId: dados.get("campaignId"), title: dados.get("title") })];
                                    case 1:
                                        _a.sent();
                                        selecionarCampanhaMestre(dados.get("campaignId"));
                                        destinoAtual = "sala-atual";
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                if (tipo === "join-room")
                    return [2 /*return*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                            var codigo, fichaEscolhida, st, atual, sessao, ok;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        codigo = String(dados.get("code") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
                                        fichaEscolhida = nomeFichaAtiva();
                                        st = obterEstado();
                                        if (!st.sala) return [3 /*break*/, 2];
                                        atual = String(st.sala.code || "").toUpperCase();
                                        if (codigo === atual) {
                                            sessao = sessaoLocal();
                                            if ((sessao === null || sessao === void 0 ? void 0 : sessao.role) === "player" && fichaEscolhida && fichaEscolhida !== String(sessao.localSheetName || "")) {
                                                return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                                        var resultado;
                                                        var _a;
                                                        return __generator(this, function (_b) {
                                                            switch (_b.label) {
                                                                case 0: return [4 /*yield*/, window.ShinobiOnline.entrarSala({ code: codigo, localSheetName: fichaEscolhida, membershipMode: dados.get("membershipMode") })];
                                                                case 1:
                                                                    resultado = _b.sent();
                                                                    if (!(resultado === null || resultado === void 0 ? void 0 : resultado.campaignMemberCreated)) return [3 /*break*/, 3];
                                                                    return [4 /*yield*/, avisar("Personagem adicionado à campanha", "".concat(((_a = window.ShinobiOnline.fichaAtualLocal()) === null || _a === void 0 ? void 0 : _a.characterName) || fichaEscolhida, " ficar\u00E1 reconhecido nas pr\u00F3ximas sess\u00F5es desta campanha."))];
                                                                case 2:
                                                                    _b.sent();
                                                                    _b.label = 3;
                                                                case 3:
                                                                    pararScanner();
                                                                    destinoAtual = "sala-atual";
                                                                    return [2 /*return*/];
                                                            }
                                                        });
                                                    }); })];
                                            }
                                            destinoAtual = "sala-atual";
                                            renderizar();
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, confirmar("Trocar de sala", "Voc\u00EA est\u00E1 na sala ".concat(atual || "atual", ". Deseja sair dela e entrar na sala ").concat(codigo || "informada", "?"))];
                                    case 1:
                                        ok = _a.sent();
                                        if (!ok)
                                            return [2 /*return*/];
                                        _a.label = 2;
                                    case 2: return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                                            var resultado;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!obterEstado().sala) return [3 /*break*/, 2];
                                                        return [4 /*yield*/, window.ShinobiOnline.sairDaSala({ silencioso: true })];
                                                    case 1:
                                                        _a.sent();
                                                        _a.label = 2;
                                                    case 2: return [4 /*yield*/, window.ShinobiOnline.entrarSala({ code: codigo, localSheetName: fichaEscolhida, membershipMode: dados.get("membershipMode") })];
                                                    case 3:
                                                        resultado = _a.sent();
                                                        if (!(resultado === null || resultado === void 0 ? void 0 : resultado.campaignMemberCreated)) return [3 /*break*/, 5];
                                                        return [4 /*yield*/, avisar("Personagem adicionado à campanha", "Este personagem agora possui um vínculo permanente e será reconhecido nas próximas sessões desta campanha.")];
                                                    case 4:
                                                        _a.sent();
                                                        _a.label = 5;
                                                    case 5:
                                                        pararScanner();
                                                        destinoAtual = "sala-atual";
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); })];
                                }
                            });
                        }); })()];
                if (tipo === "save-campaign-npc-sheet")
                    return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, window.ShinobiOnline.salvarFichaComoNpcCampanha(dados.get("campaignId"), dados.get("localSheetName"), { displayName: dados.get("displayName"), privateNotes: dados.get("privateNotes") })];
                                    case 1:
                                        _a.sent();
                                        form.reset();
                                        return [4 /*yield*/, avisar("NPC salvo", "A ficha foi adicionada à biblioteca permanente da campanha.")];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                if (tipo === "create-campaign-npc")
                    return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, window.ShinobiOnline.criarNpcCampanha(dados.get("campaignId"), formDataParaObjeto(dados, form))];
                                    case 1:
                                        _a.sent();
                                        form.reset();
                                        return [4 /*yield*/, avisar("NPC criado", "O NPC agora pertence à campanha e pode ser usado em qualquer sessão.")];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                if (tipo === "add-campaign-npc-room")
                    return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, window.ShinobiOnline.adicionarNpcCampanhaNaSala(dados.get("campaignNpcId"), { displayName: dados.get("displayName") })];
                                    case 1:
                                        _a.sent();
                                        form.reset();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                if (tipo === "import-npc")
                    return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, window.ShinobiOnline.importarFichaComoNpc(dados.get("localSheetName"), { displayName: dados.get("displayName") })];
                                case 1:
                                    _a.sent();
                                    form.reset();
                                    return [2 /*return*/];
                            }
                        }); }); })];
                if (tipo === "quick-npc")
                    return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, window.ShinobiOnline.criarNpcRapido(formDataParaObjeto(dados, form))];
                                case 1:
                                    _a.sent();
                                    form.reset();
                                    return [2 /*return*/];
                            }
                        }); }); })];
                if (tipo === "add-effect")
                    return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, window.ShinobiOnline.adicionarEfeito({ participantId: dados.get("participantId"), name: dados.get("name"), duration: num(dados.get("duration"), 1) })];
                                case 1:
                                    _a.sent();
                                    form.reset();
                                    return [2 /*return*/];
                            }
                        }); }); })];
                if (tipo === "campaign-xp")
                    return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                            var chaves, tipoXp, quantidade, resultado, verbo;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        chaves = dados.getAll("memberKeys"), tipoXp = String(dados.get("type") || "grant"), quantidade = dados.get("amount");
                                        return [4 /*yield*/, window.ShinobiOnline.alterarXpCampanha({
                                                campaignId: dados.get("campaignId"), memberKeys: chaves, amount: quantidade, reason: dados.get("reason"), type: tipoXp
                                            })];
                                    case 1:
                                        resultado = _a.sent();
                                        verbo = resultado.type === "remove" ? "removido" : resultado.type === "correction" ? "corrigido" : "adicionado";
                                        return [4 /*yield*/, avisar("XP registrado", "XP ".concat(verbo, " para ").concat(resultado.count, " personagem(ns). O hist\u00F3rico foi salvo e a entrega acontecer\u00E1 pela conta de cada jogador."))];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                if (tipo === "set-player-level")
                    return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                            var participantId, resultado, jogador;
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        participantId = form.dataset.participantId;
                                        return [4 /*yield*/, window.ShinobiOnline.definirNivelJogador({ participantId: participantId, nivel: dados.get("level") })];
                                    case 1:
                                        resultado = _c.sent();
                                        jogador = (_b = (_a = obterEstado().sala) === null || _a === void 0 ? void 0 : _a.participants) === null || _b === void 0 ? void 0 : _b[participantId];
                                        return [4 /*yield*/, avisar("Nível atualizado", "".concat((jogador === null || jogador === void 0 ? void 0 : jogador.displayName) || "Jogador", " foi definido como n\u00EDvel ").concat(resultado.level, "."))];
                                    case 2:
                                        _c.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                if (tipo === "grant-xp")
                    return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                            var ids;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        ids = dados.getAll("participantIds");
                                        return [4 /*yield*/, window.ShinobiOnline.concederXp({ participantIds: ids, amount: dados.get("amount"), reason: dados.get("reason") })];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, avisar("XP distribuído", "A altera\u00E7\u00E3o foi enviada para ".concat(ids.length, " jogador(es)."))];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                return [2 /*return*/];
            });
        });
    }
    function tratarChange(evento) {
        var el = evento.target.closest("[data-action-change]");
        if (!el)
            return;
        if (el.dataset.actionChange === "initiative")
            executar(function () { return window.ShinobiOnline.definirIniciativa(el.dataset.participantId, el.value); });
    }
    function editarNpcCampanha(campaignId, npcId) {
        return __awaiter(this, void 0, void 0, function () {
            var st, npc, b, nome, pvMax, chakraMax, ca, iniciativa, notas;
            var _this = this;
            return __generator(this, function (_a) {
                st = obterEstado(), npc = (st.npcsCampanha || []).find(function (item) { return String(item.id) === String(npcId); });
                if (!npc)
                    return [2 /*return*/];
                b = npc.battleTemplate || {};
                nome = prompt("Nome do NPC:", npc.displayName || "");
                if (nome === null)
                    return [2 /*return*/];
                pvMax = prompt("PV máximo padrão:", String(num(b.pvMax)));
                if (pvMax === null)
                    return [2 /*return*/];
                chakraMax = prompt("Chakra máximo padrão:", String(num(b.chakraMax)));
                if (chakraMax === null)
                    return [2 /*return*/];
                ca = prompt("Classe de Armadura padrão:", String(num(b.ca, 10)));
                if (ca === null)
                    return [2 /*return*/];
                iniciativa = prompt("Bônus de iniciativa:", String(num(b.initiativeBonus)));
                if (iniciativa === null)
                    return [2 /*return*/];
                notas = prompt("Notas privadas do mestre:", String(npc.privateNotes || ""));
                if (notas === null)
                    return [2 /*return*/];
                return [2 /*return*/, executar(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, window.ShinobiOnline.atualizarNpcCampanha(campaignId, npcId, { displayName: nome, pvMax: pvMax, chakraMax: chakraMax, ca: ca, initiativeBonus: iniciativa, privateNotes: notas })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, avisar("NPC atualizado", "As alterações foram salvas na biblioteca. Instâncias já adicionadas a uma sala não são alteradas.")];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    }
    function editarNpc(id) {
        return __awaiter(this, void 0, void 0, function () {
            var st, p, nome, pv, pvMax, chakra, chakraMax, ca, iniciativa, notas, battle;
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                st = obterEstado(), p = (_b = (_a = st.sala) === null || _a === void 0 ? void 0 : _a.participants) === null || _b === void 0 ? void 0 : _b[id];
                if (!p)
                    return [2 /*return*/];
                nome = prompt("Nome do NPC:", p.displayName || "");
                if (nome === null)
                    return [2 /*return*/];
                pv = prompt("PV atual:", String(num((_c = p.battle) === null || _c === void 0 ? void 0 : _c.pv)));
                if (pv === null)
                    return [2 /*return*/];
                pvMax = prompt("PV máximo:", String(num((_d = p.battle) === null || _d === void 0 ? void 0 : _d.pvMax)));
                if (pvMax === null)
                    return [2 /*return*/];
                chakra = prompt("Chakra atual:", String(num((_e = p.battle) === null || _e === void 0 ? void 0 : _e.chakra)));
                if (chakra === null)
                    return [2 /*return*/];
                chakraMax = prompt("Chakra máximo:", String(num((_f = p.battle) === null || _f === void 0 ? void 0 : _f.chakraMax)));
                if (chakraMax === null)
                    return [2 /*return*/];
                ca = prompt("Classe de Armadura:", String(num((_g = p.battle) === null || _g === void 0 ? void 0 : _g.ca, 10)));
                if (ca === null)
                    return [2 /*return*/];
                iniciativa = prompt("Bônus de iniciativa:", String(num(p.initiativeBonus)));
                if (iniciativa === null)
                    return [2 /*return*/];
                notas = prompt("Observações da sessão (não privadas):", String(((_h = p.battle) === null || _h === void 0 ? void 0 : _h.notes) || ""));
                if (notas === null)
                    return [2 /*return*/];
                battle = __assign(__assign({}, p.battle), { displayName: String(nome).trim() || p.displayName, pv: Math.max(0, num(pv)), pvMax: Math.max(0, num(pvMax)), chakra: Math.max(0, num(chakra)), chakraMax: Math.max(0, num(chakraMax)), ca: num(ca, 10), initiativeBonus: num(iniciativa), notes: String(notas).slice(0, 600) });
                return [2 /*return*/, executar(function () { return window.ShinobiOnline.atualizarParticipante(id, {
                        displayName: battle.displayName, initiativeBonus: battle.initiativeBonus,
                        battle: battle
                    }); })];
            });
        });
    }
    function copiar(valor, mensagem) {
        return __awaiter(this, void 0, void 0, function () {
            var _erro_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, navigator.clipboard.writeText(String(valor || ""))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, avisar("Copiado", mensagem)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _erro_1 = _a.sent();
                        prompt("Copie o texto:", String(valor || ""));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function iniciarScanner() {
        return __awaiter(this, void 0, void 0, function () {
            var suportados, scanner, video_1, detector_1, ler_1, erro_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!("BarcodeDetector" in window)) return [3 /*break*/, 2];
                        return [4 /*yield*/, avisar("Leitor não disponível", "Este navegador não oferece leitura direta de QR Code. Digite o código de seis caracteres.")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, BarcodeDetector.getSupportedFormats()];
                    case 3:
                        suportados = _a.sent();
                        if (!suportados.includes("qr_code"))
                            throw new Error("QR não suportado");
                        scanner = document.getElementById("shinobiScanner"), video_1 = document.getElementById("shinobiScannerVideo");
                        scanner.hidden = false;
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })];
                    case 4:
                        scannerStream = _a.sent();
                        video_1.srcObject = scannerStream;
                        return [4 /*yield*/, video_1.play()];
                    case 5:
                        _a.sent();
                        detector_1 = new BarcodeDetector({ formats: ["qr_code"] });
                        ler_1 = function () { return __awaiter(_this, void 0, void 0, function () {
                            var codigos, bruto, codigo, input, _erro_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!scannerStream)
                                            return [2 /*return*/];
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 5, , 6]);
                                        return [4 /*yield*/, detector_1.detect(video_1)];
                                    case 2:
                                        codigos = _a.sent();
                                        if (!codigos.length) return [3 /*break*/, 4];
                                        bruto = codigos[0].rawValue || "";
                                        codigo = "";
                                        try {
                                            codigo = new URL(bruto).searchParams.get("sala") || bruto;
                                        }
                                        catch (_erro) {
                                            codigo = bruto;
                                        }
                                        codigo = String(codigo).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-6);
                                        input = root.querySelector('form[data-form="join-room"] input[name="code"]');
                                        if (input)
                                            input.value = codigo;
                                        pararScanner();
                                        return [4 /*yield*/, avisar("QR Code lido", "C\u00F3digo ".concat(codigo, " preenchido."))];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/];
                                    case 4: return [3 /*break*/, 6];
                                    case 5:
                                        _erro_2 = _a.sent();
                                        return [3 /*break*/, 6];
                                    case 6:
                                        scannerFrame = requestAnimationFrame(ler_1);
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        scannerFrame = requestAnimationFrame(ler_1);
                        return [3 /*break*/, 8];
                    case 6:
                        erro_3 = _a.sent();
                        pararScanner();
                        return [4 /*yield*/, avisar("Câmera indisponível", "Não foi possível abrir a câmera. Digite o código manualmente.")];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    function pararScanner() {
        var _a;
        if (scannerFrame)
            cancelAnimationFrame(scannerFrame);
        scannerFrame = null;
        (_a = scannerStream === null || scannerStream === void 0 ? void 0 : scannerStream.getTracks) === null || _a === void 0 ? void 0 : _a.call(scannerStream).forEach(function (t) { return t.stop(); });
        scannerStream = null;
        var scanner = document.getElementById("shinobiScanner");
        if (scanner)
            scanner.hidden = true;
        var video = document.getElementById("shinobiScannerVideo");
        if (video)
            video.srcObject = null;
    }
    function instalarEventos() {
        if (!window.ShinobiOnline || window.__shinobiOnlineUIEventos)
            return;
        window.__shinobiOnlineUIEventos = true;
        ["status", "pronto", "auth", "campanhas", "membros-campanha", "npcs-campanha", "xp-campanha", "xp-inbox", "fichas-nuvem", "ficha-atualizada-nuvem", "ficha-sincronizada", "status-sync", "turno-finalizado", "turno-sincronizado", "sala", "presenca", "configuracao-pendente", "sala-encerrada"].forEach(function (tipo) { return window.ShinobiOnline.on(tipo, agendarRender); });
        window.ShinobiOnline.on("erro", function (e) {
            var _a;
            (_a = document.querySelector("[data-drawer-sync]")) === null || _a === void 0 ? void 0 : _a.classList.add("onlineErro");
            console.warn("Modo online indisponível:", e.detail.mensagem);
            agendarRender();
        });
        window.ShinobiOnline.on("erro-sync", function (e) { var _a; (_a = document.querySelector("[data-drawer-sync]")) === null || _a === void 0 ? void 0 : _a.classList.add("onlineErro"); console.warn(e.detail.mensagem); });
        window.ShinobiOnline.on("conflito-ficha", function (e) { conflitoAtual = e.detail; abrir(); agendarRender(); });
        window.ShinobiOnline.on("xp-recebido", function (e) {
            var d = e.detail;
            avisar("XP recebido", "".concat(d.amount > 0 ? "+" : "").concat(d.amount, " XP\n").concat(d.before, " \u2192 ").concat(d.after).concat(d.reason ? "\n".concat(d.reason) : ""));
        });
        window.addEventListener("shinobi:turno-auto-sincronizado", function () { avisar("Turno sincronizado automaticamente", "O mestre avançou a iniciativa antes da confirmação. As alterações locais foram enviadas para evitar perda de dados."); });
        window.ShinobiOnline.on("nivel-recebido", function (e) {
            var d = e.detail;
            avisar("Nível atualizado pelo mestre", "".concat(d.character || "Sua ficha", ": n\u00EDvel ").concat(d.before, " \u2192 ").concat(d.after, ".").concat(d.reason ? "\n".concat(d.reason) : ""));
        });
        window.ShinobiOnline.on("convite-url", function () { if (obterEstado().user)
            abrir(); });
        window.addEventListener("online", agendarRender, { passive: true });
        window.addEventListener("offline", agendarRender, { passive: true });
    }
    function iniciar() {
        try {
            criarRoot();
            instalarBotao();
            instalarEventos();
            agendarRender();
            return true;
        }
        catch (erro) {
            console.error("Falha ao inicializar a interface Online:", erro);
            return false;
        }
    }
    // Expõe a API ANTES da inicialização. Assim o menu lateral sempre possui
    // um destino válido mesmo se algum recurso secundário do Online falhar.
    window.ShinobiOnlineUI = { abrir: abrir, fechar: fechar, voltar: voltarPainelOnline, renderizar: renderizar, renderPainelFlutuante: renderPainelFlutuante, iniciar: iniciar };
    window.dispatchEvent(new CustomEvent("shinobi:online-ui-ready"));
    function iniciarDepoisDaRenderizacao() {
        var _a;
        if ((_a = window.ShinobiAppReady) === null || _a === void 0 ? void 0 : _a.executar) {
            window.ShinobiAppReady.executar(iniciar);
        }
        else if (document.readyState === "complete") {
            setTimeout(iniciar, 1200);
        }
        else {
            window.addEventListener("load", function () { return setTimeout(iniciar, 1200); }, { once: true });
        }
    }
    iniciarDepoisDaRenderizacao();
    window.addEventListener("pageshow", function () {
        var _a;
        if ((_a = window.ShinobiAppReady) === null || _a === void 0 ? void 0 : _a.executar)
            window.ShinobiAppReady.executar(function () { return setTimeout(iniciar, 180); });
        else
            setTimeout(iniciar, 1200);
    });
})();
