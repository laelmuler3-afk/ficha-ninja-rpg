/* GERADO AUTOMATICAMENTE — fonte: js/21-online-hooks.js — app 2.5.8.154. Não editar. */
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
/* Ficha Ninja RPG — integração do app local com o motor online. */
(function () {
    "use strict";
    var timerResumo = null;
    var timerBackupDiario = null;
    var intervaloBackupDiario = null;
    var timersBackupEstrutural = new Map();
    var ATRASO_BACKUP_ESTRUTURAL_MS = 4000;
    var CAMPOS_BACKUP_ESTRUTURAL = new Set([
        "nome", "cla", "idade", "rank", "nivel", "xp", "proficiencia",
        "pvMax", "chakraMax", "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma",
        "ca", "cd", "bonusCA", "iniciativa", "velocidade",
        "jutsus", "armados", "inventarioItens", "notasTopicos", "carteira", "carteiraHistorico", "kekkeiGenkai",
        "resistenciasEscolhidas", "progressaoFixa", "atributoConjuracaoNatureza"
    ]);
    var aplicandoRodada = false;
    var sincronizandoPendentes = false;
    var ultimoTurnoObservado = "";
    var ultimoParticipanteObservado = "";
    var publicacoesEmCurso = new Set();
    function sessaoAtual() {
        try {
            return JSON.parse(localStorage.getItem("shinobi_online_session_v1") || "null");
        }
        catch (_erro) {
            return null;
        }
    }
    function fichaAtualNome() {
        try {
            return localStorage.getItem("ficha_ninja_ativa_v1") || "Principal";
        }
        catch (_erro) {
            return "Principal";
        }
    }
    function transicaoFichaAtiva() {
        return window.__shinobiSheetTransition === true;
    }
    var CHAVE_TURNO_PENDENTE = "shinobi_turn_pending_v1";
    function marcarTurnoLocalPendente() {
        var sessao = sessaoAtual();
        try {
            localStorage.setItem(CHAVE_TURNO_PENDENTE, JSON.stringify({
                roomId: (sessao === null || sessao === void 0 ? void 0 : sessao.roomId) || "",
                sheetName: fichaAtualNome(),
                pending: true,
                updatedAt: Date.now()
            }));
        }
        catch (_erro) { }
    }
    function turnoLocalPendente() {
        try {
            var dado = JSON.parse(localStorage.getItem(CHAVE_TURNO_PENDENTE) || "null");
            var sessao = sessaoAtual();
            return Boolean((dado === null || dado === void 0 ? void 0 : dado.pending) && (!dado.roomId || dado.roomId === (sessao === null || sessao === void 0 ? void 0 : sessao.roomId)));
        }
        catch (_erro) {
            return false;
        }
    }
    function limparTurnoLocalPendente() {
        try {
            localStorage.removeItem(CHAVE_TURNO_PENDENTE);
        }
        catch (_erro) { }
    }
    function texto(valor) { return String(valor == null ? "" : valor).trim(); }
    function normalizar(valor) {
        return texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
    function rodadasRestantes(remoto, combat) {
        var _a, _b;
        var rodadaAtual = Math.max(1, Number((combat === null || combat === void 0 ? void 0 : combat.round) || 1));
        var indiceAtual = Math.max(0, Number((combat === null || combat === void 0 ? void 0 : combat.turnIndex) || 0));
        var rodadaFim = Math.max(1, Number((remoto === null || remoto === void 0 ? void 0 : remoto.expiresAtRound) || rodadaAtual));
        var indiceFim = Math.max(0, Number((_b = (_a = remoto === null || remoto === void 0 ? void 0 : remoto.expiresAtTurnIndex) !== null && _a !== void 0 ? _a : remoto === null || remoto === void 0 ? void 0 : remoto.startTurnIndex) !== null && _b !== void 0 ? _b : 0));
        if (rodadaAtual > rodadaFim || (rodadaAtual === rodadaFim && indiceAtual >= indiceFim))
            return 0;
        var diferenca = rodadaFim - rodadaAtual;
        return diferenca > 0 ? diferenca : 1;
    }
    function atualizarVisualEfeitos() {
        var _a, _b, _c, _d, _e;
        try {
            (_b = (_a = window.EfeitosJutsuShinobi) === null || _a === void 0 ? void 0 : _a.atualizar) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
        catch (_erro) { }
        try {
            (_c = window.atualizarHUD) === null || _c === void 0 ? void 0 : _c.call(window);
        }
        catch (_erro) { }
        try {
            (_d = window.atualizarDefesasTotaisBatalha) === null || _d === void 0 ? void 0 : _d.call(window);
        }
        catch (_erro) { }
        try {
            (_e = window.atualizarMotorUniversalEfeitos) === null || _e === void 0 ? void 0 : _e.call(window);
        }
        catch (_erro) { }
        window.dispatchEvent(new CustomEvent("shinobi:efeitos-batalha-atualizados"));
    }
    function salvarEstadoSemLoop() {
        /* Callbacks de efeitos podem terminar depois que o usuário iniciou uma
           troca de ficha. Nesse intervalo CHAVE já pode apontar ao destino e estado
           ainda representar a origem; portanto a mesma trava global vale aqui. */
        if (transicaoFichaAtiva())
            return false;
        try {
            localStorage.setItem(CHAVE, JSON.stringify(estado));
            return true;
        }
        catch (_erro) {
            return false;
        }
    }
    var CAMPOS_SALA_AO_VIVO = new Set(["pv", "pvMax", "chakra", "chakraMax", "ca", "cd"]);
    var timerSalaAoVivo = null;
    var salaAoVivoSincronizando = false;
    var salaAoVivoPendente = false;
    function possuiCampoSalaAoVivo(campos) {
        var lista = Array.isArray(campos) ? campos : [campos];
        return lista.some(function (campo) { return CAMPOS_SALA_AO_VIVO.has(texto(campo)); });
    }
    function sincronizarRecursosSalaAoVivo() {
        return __awaiter(this, void 0, void 0, function () {
            var sessao, erro_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (transicaoFichaAtiva())
                            return [2 /*return*/, { skipped: true, reason: "sheet-transition" }];
                        if (!((_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.atualizarMeuParticipanteAoVivo))
                            return [2 /*return*/];
                        sessao = sessaoAtual();
                        if ((sessao === null || sessao === void 0 ? void 0 : sessao.role) !== "player" || !sessao.roomId)
                            return [2 /*return*/];
                        if (salaAoVivoSincronizando) {
                            salaAoVivoPendente = true;
                            return [2 /*return*/];
                        }
                        salaAoVivoSincronizando = true;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, window.ShinobiOnline.atualizarMeuParticipanteAoVivo()];
                    case 2:
                        _d.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        erro_1 = _d.sent();
                        window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: ((_c = (_b = window.ShinobiOnline) === null || _b === void 0 ? void 0 : _b.erroAmigavel) === null || _c === void 0 ? void 0 : _c.call(_b, erro_1)) || String(erro_1) } }));
                        return [3 /*break*/, 5];
                    case 4:
                        salaAoVivoSincronizando = false;
                        if (salaAoVivoPendente) {
                            salaAoVivoPendente = false;
                            setTimeout(function () { return sincronizarRecursosSalaAoVivo(); }, 30);
                        }
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function agendarRecursosSalaAoVivo(campos, atraso) {
        if (atraso === void 0) { atraso = 35; }
        if (transicaoFichaAtiva())
            return;
        if (!possuiCampoSalaAoVivo(campos))
            return;
        clearTimeout(timerSalaAoVivo);
        timerSalaAoVivo = setTimeout(function () {
            timerSalaAoVivo = null;
            sincronizarRecursosSalaAoVivo();
        }, Math.max(0, Number(atraso) || 0));
    }
    var resumoSincronizando = false;
    var resumoPendente = false;
    function sincronizarResumoParticipante() {
        return __awaiter(this, void 0, void 0, function () {
            var erro_2;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (transicaoFichaAtiva())
                            return [2 /*return*/, { skipped: true, reason: "sheet-transition" }];
                        if (!((_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.atualizarMeuParticipante))
                            return [2 /*return*/];
                        if (resumoSincronizando) {
                            resumoPendente = true;
                            return [2 /*return*/];
                        }
                        resumoSincronizando = true;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, window.ShinobiOnline.atualizarMeuParticipante()];
                    case 2:
                        _d.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        erro_2 = _d.sent();
                        window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: ((_c = (_b = window.ShinobiOnline) === null || _b === void 0 ? void 0 : _b.erroAmigavel) === null || _c === void 0 ? void 0 : _c.call(_b, erro_2)) || String(erro_2) } }));
                        return [3 /*break*/, 5];
                    case 4:
                        resumoSincronizando = false;
                        if (resumoPendente) {
                            resumoPendente = false;
                            setTimeout(function () { return sincronizarResumoParticipante(); }, 40);
                        }
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function agendarResumoParticipante(atraso) {
        if (atraso === void 0) { atraso = 140; }
        if (transicaoFichaAtiva())
            return;
        clearTimeout(timerResumo);
        timerResumo = setTimeout(function () { return sincronizarResumoParticipante(); }, atraso);
    }
    function syncPorTurnoAtiva() {
        var _a, _b, _c, _d;
        var sessao = sessaoAtual();
        var st = (_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.snapshot) === null || _b === void 0 ? void 0 : _b.call(_a);
        return Boolean((sessao === null || sessao === void 0 ? void 0 : sessao.role) === "player" &&
            ((_d = (_c = st === null || st === void 0 ? void 0 : st.sala) === null || _c === void 0 ? void 0 : _c.combat) === null || _d === void 0 ? void 0 : _d.started));
    }
    function contaGoogleAtiva() {
        var _a, _b;
        var st = (_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.snapshot) === null || _b === void 0 ? void 0 : _b.call(_a);
        return Boolean((st === null || st === void 0 ? void 0 : st.user) && !st.user.anonymous);
    }
    function campoExigeBackupEstrutural(campo) {
        var nome = texto(campo);
        return Boolean(nome && (CAMPOS_BACKUP_ESTRUTURAL.has(nome) || nome.startsWith("p_")));
    }
    function campoLocalDaColecao(collection) {
        var nome = texto(collection);
        if (nome === "notas")
            return "notasTopicos";
        if (nome === "inventario")
            return "inventarioItens";
        if (nome === "jutsus")
            return "jutsus";
        if (nome === "armados")
            return "armados";
        if (nome === "kekkeiGenkai")
            return "kekkeiGenkai";
        if (nome === "carteiraMoedas")
            return "carteira";
        if (nome === "carteiraHistorico")
            return "carteiraHistorico";
        if (nome === "efeitosBatalha")
            return "efeitosBatalhaAtivos";
        return "";
    }
    function referenciaFichaLocal(nome) {
        var _a, _b;
        var alvo = texto(nome) || fichaAtualNome();
        var ficha = (((_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.listarFichasLocais) === null || _b === void 0 ? void 0 : _b.call(_a)) || []).find(function (item) { return texto(item === null || item === void 0 ? void 0 : item.name) === alvo; }) || null;
        if (!ficha)
            return { name: alvo, sheetId: "" };
        return { name: texto(ficha.name), sheetId: texto(ficha.sheetId) };
    }
    function executarBackupEstrutural(referencia) {
        var _a, _b, _c;
        if (transicaoFichaAtiva())
            return;
        if (!contaGoogleAtiva() || typeof ((_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.atualizarBackupEstrutural) !== "function")
            return;
        var ref = typeof referencia === "string" ? { name: referencia, sheetId: "" } : (referencia || {});
        var nome = texto(ref.name);
        if (ref.sheetId) {
            var ficha = (((_c = (_b = window.ShinobiOnline) === null || _b === void 0 ? void 0 : _b.listarFichasLocais) === null || _c === void 0 ? void 0 : _c.call(_b)) || []).find(function (item) { return texto(item === null || item === void 0 ? void 0 : item.sheetId) === texto(ref.sheetId); }) || null;
            if (!ficha)
                return;
            nome = texto(ficha.name);
        }
        else {
            var atual = referenciaFichaLocal(nome);
            if (!atual.name)
                return;
            nome = atual.name;
        }
        window.ShinobiOnline.atualizarBackupEstrutural(nome, {
            motivo: "backup-automatico-estrutural"
        }).catch(function () { });
    }
    function agendarBackupEstrutural(detalhe) {
        var _a;
        if (detalhe === void 0) { detalhe = {}; }
        if (transicaoFichaAtiva())
            return;
        if (!detalhe.confirmada || !campoExigeBackupEstrutural(detalhe.campo))
            return;
        if (!contaGoogleAtiva() || typeof ((_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.atualizarBackupEstrutural) !== "function")
            return;
        var referencia = referenciaFichaLocal(texto(detalhe.sheetName) || fichaAtualNome());
        var chave = referencia.sheetId || "name:".concat(referencia.name);
        var anterior = timersBackupEstrutural.get(chave);
        if (anterior === null || anterior === void 0 ? void 0 : anterior.timer)
            clearTimeout(anterior.timer);
        else if (anterior)
            clearTimeout(anterior);
        var timer = setTimeout(function () {
            timersBackupEstrutural.delete(chave);
            executarBackupEstrutural(referencia);
        }, ATRASO_BACKUP_ESTRUTURAL_MS);
        timersBackupEstrutural.set(chave, { timer: timer, referencia: referencia });
    }
    function enviarBackupsEstruturaisPendentes() {
        __spreadArray([], __read(timersBackupEstrutural.entries()), false).forEach(function (_a) {
            var _b = __read(_a, 2), chave = _b[0], registro = _b[1];
            var timer = (registro === null || registro === void 0 ? void 0 : registro.timer) || registro;
            var referencia = (registro === null || registro === void 0 ? void 0 : registro.referencia) || String(chave || "").replace(/^name:/, "");
            clearTimeout(timer);
            timersBackupEstrutural.delete(chave);
            executarBackupEstrutural(referencia);
        });
    }
    function valorAtualDoCampo(nomeFicha, campo, detalhe) {
        var _a, _b, _c, _d, _e;
        if (detalhe === void 0) { detalhe = {}; }
        if (Object.prototype.hasOwnProperty.call(detalhe, "depois"))
            return detalhe.depois;
        try {
            var nome_1 = texto(nomeFicha);
            var ficha = nome_1
                ? (((_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.listarFichasLocais) === null || _b === void 0 ? void 0 : _b.call(_a)) || []).find(function (f) { return f.name === nome_1; }) || null
                : (_d = (_c = window.ShinobiOnline) === null || _c === void 0 ? void 0 : _c.fichaAtualLocal) === null || _d === void 0 ? void 0 : _d.call(_c);
            /* Evento atrasado de uma ficha que já foi trocada/excluída não pode usar
               a nova ficha ativa como substituta silenciosa. */
            return (_e = ficha === null || ficha === void 0 ? void 0 : ficha.data) === null || _e === void 0 ? void 0 : _e[campo];
        }
        catch (_erro) {
            return undefined;
        }
    }
    function enviarAlteracaoConfirmada() {
        return __awaiter(this, arguments, void 0, function (detalhe) {
            var campo, nome, valor, erro_3;
            var _a, _b, _c, _d;
            if (detalhe === void 0) { detalhe = {}; }
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (transicaoFichaAtiva())
                            return [2 /*return*/, { skipped: true, reason: "sheet-transition" }];
                        if (!window.ShinobiOnline)
                            return [2 /*return*/];
                        campo = texto(detalhe.campo);
                        if (!detalhe.confirmada || !campo)
                            return [2 /*return*/];
                        nome = texto(detalhe.sheetName) || fichaAtualNome();
                        /* PV/Chakra e defesas precisam continuar ao vivo na mesa mesmo quando o
                           restante da ficha está sendo consolidado por turno. É uma escrita pequena
                           e independente da sincronização item-level/fields. */
                        agendarRecursosSalaAoVivo(campo, 20);
                        /* Coleções item-level continuam emitindo persistência para o backup estrutural,
                           mas seus arrays completos não entram mais no realtime de fields. */
                        if (campo === "notasTopicos" || campo === "inventarioItens" || campo === "jutsus" || campo === "armados" || campo === "kekkeiGenkai" || campo === "carteira" || campo === "carteiraHistorico" || campo === "efeitosBatalhaAtivos")
                            return [2 /*return*/];
                        if (syncPorTurnoAtiva())
                            marcarTurnoLocalPendente();
                        if (!!contaGoogleAtiva()) return [3 /*break*/, 3];
                        if (!!syncPorTurnoAtiva()) return [3 /*break*/, 2];
                        return [4 /*yield*/, sincronizarResumoParticipante()];
                    case 1:
                        _e.sent();
                        _e.label = 2;
                    case 2: return [2 /*return*/];
                    case 3:
                        valor = valorAtualDoCampo(nome, campo, detalhe);
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 8, , 9]);
                        return [4 /*yield*/, ((_b = (_a = window.ShinobiOnline).sincronizarCampoConfirmado) === null || _b === void 0 ? void 0 : _b.call(_a, nome, campo, valor, {
                                motivo: texto(detalhe.motivo) || "alteracao-confirmada",
                                origem: texto(detalhe.origem) || "campo"
                            }))];
                    case 5:
                        _e.sent();
                        agendarBackupEstrutural(detalhe);
                        if (!!syncPorTurnoAtiva()) return [3 /*break*/, 7];
                        return [4 /*yield*/, sincronizarResumoParticipante()];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        erro_3 = _e.sent();
                        window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", {
                            detail: { mensagem: ((_d = (_c = window.ShinobiOnline) === null || _c === void 0 ? void 0 : _c.erroAmigavel) === null || _d === void 0 ? void 0 : _d.call(_c, erro_3)) || "A alteração ficou salva neste aparelho e será reenviada quando a sincronização estiver disponível." }
                        }));
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }
    function enviarItemColecaoConfirmado() {
        return __awaiter(this, arguments, void 0, function (detalhe) {
            var collection, itemId, nome, campoBackup, erro_4, mensagem;
            var _a, _b, _c, _d;
            if (detalhe === void 0) { detalhe = {}; }
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (transicaoFichaAtiva())
                            return [2 /*return*/, { skipped: true, reason: "sheet-transition" }];
                        if (!window.ShinobiOnline || detalhe.confirmed !== true)
                            return [2 /*return*/];
                        collection = texto(detalhe.collection), itemId = texto(detalhe.itemId);
                        if (!["notas", "inventario", "jutsus", "armados", "kekkeiGenkai", "carteiraMoedas", "carteiraHistorico", "efeitosBatalha"].includes(collection) || !itemId)
                            return [2 /*return*/];
                        if (!contaGoogleAtiva())
                            return [2 /*return*/];
                        nome = texto(detalhe.sheetName) || fichaAtualNome();
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ((_b = (_a = window.ShinobiOnline).sincronizarItemColecaoConfirmado) === null || _b === void 0 ? void 0 : _b.call(_a, nome, collection, itemId, detalhe.deleted === true ? undefined : detalhe.value, {
                                deleted: detalhe.deleted === true,
                                identityKey: texto(detalhe.identityKey),
                                motivo: texto(detalhe.reason) || "alteracao-confirmada",
                                origem: texto(detalhe.source) || "colecao"
                            }))];
                    case 2:
                        _e.sent();
                        campoBackup = campoLocalDaColecao(collection);
                        if (campoBackup)
                            agendarBackupEstrutural({ confirmada: true, campo: campoBackup, sheetName: nome });
                        return [3 /*break*/, 4];
                    case 3:
                        erro_4 = _e.sent();
                        mensagem = (erro_4 === null || erro_4 === void 0 ? void 0 : erro_4.code) === "shinobi/invalid-item-id"
                            ? "Este item possui um identificador legado incompatível com a nuvem. Ele continua salvo neste aparelho, mas precisa ser regularizado antes de sincronizar."
                            : (((_d = (_c = window.ShinobiOnline) === null || _c === void 0 ? void 0 : _c.erroAmigavel) === null || _d === void 0 ? void 0 : _d.call(_c, erro_4)) || "A alteração ficou salva neste aparelho e será reenviada quando a sincronização estiver disponível.");
                        window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: mensagem } }));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    var drenagemBackupEstruturalEmCurso = null;
    function drenarBackupsEstruturaisAposRealtime(motivo) {
        var _this = this;
        if (motivo === void 0) { motivo = "reconexao"; }
        if (drenagemBackupEstruturalEmCurso)
            return drenagemBackupEstruturalEmCurso;
        drenagemBackupEstruturalEmCurso = (function () { return __awaiter(_this, void 0, void 0, function () {
            var convergencia;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!contaGoogleAtiva() || ((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.onLine) === false)
                            return [2 /*return*/, { skipped: true }];
                        return [4 /*yield*/, ((_c = (_b = window.EkoRealtimeSync) === null || _b === void 0 ? void 0 : _b.reconciliar) === null || _c === void 0 ? void 0 : _c.call(_b))];
                    case 1:
                        _g.sent();
                        if (!(typeof ((_d = window.EkoRealtimeSync) === null || _d === void 0 ? void 0 : _d.aguardarConvergenciaAtual) === "function")) return [3 /*break*/, 3];
                        return [4 /*yield*/, window.EkoRealtimeSync.aguardarConvergenciaAtual({ timeoutMs: 8000 })];
                    case 2:
                        convergencia = _g.sent();
                        if ((convergencia === null || convergencia === void 0 ? void 0 : convergencia.ok) !== true)
                            return [2 /*return*/, { queued: true, reason: texto(convergencia === null || convergencia === void 0 ? void 0 : convergencia.reason) || "realtime-nao-convergido" }];
                        _g.label = 3;
                    case 3: return [2 /*return*/, (_f = (_e = window.ShinobiOnline) === null || _e === void 0 ? void 0 : _e.processarBackupsEstruturaisPendentes) === null || _f === void 0 ? void 0 : _f.call(_e, { motivo: motivo })];
                }
            });
        }); })().finally(function () { drenagemBackupEstruturalEmCurso = null; });
        return drenagemBackupEstruturalEmCurso;
    }
    function instalarAutoSync() {
        if (window.__shinobiOnlinePersistListener)
            return;
        window.__shinobiOnlinePersistListener = true;
        /* Realtime só recebe commits explícitos de um campo/área. Persistências
           internas, renderização, pagehide e migrações locais não são transmitidas. */
        window.addEventListener("shinobi:ficha-persistida", function (evento) {
            var detalhe = (evento === null || evento === void 0 ? void 0 : evento.detail) || {};
            var campo = texto(detalhe.campo);
            if (!detalhe.confirmada || !campo)
                return;
            enviarAlteracaoConfirmada(detalhe).catch(function () { });
        });
        window.addEventListener("shinobi:colecao-item-confirmado", function (evento) {
            enviarItemColecaoConfirmado((evento === null || evento === void 0 ? void 0 : evento.detail) || {}).catch(function () { });
        });
        /* Se outro aparelho da mesma conta vencer a reconciliação de PV/Chakra,
           republicamos apenas os recursos leves na sala. Assim o mestre vê o valor
           canônico do realtime, não apenas a última tentativa local de um aparelho. */
        window.addEventListener("shinobi:realtime-aplicado", function (evento) {
            var _a;
            agendarRecursosSalaAoVivo(((_a = evento === null || evento === void 0 ? void 0 : evento.detail) === null || _a === void 0 ? void 0 : _a.campos) || [], 45);
        });
        /* Receber uma alteração remota não agenda novo userSheets neste aparelho.
           O dispositivo autor já mantém o backup estrutural; regravar aqui criava
           amplificação de escrita e podia promover snapshots atrasados. */
        document.addEventListener("visibilitychange", function () {
            if (document.visibilityState === "hidden") {
                clearTimeout(timerResumo);
                clearTimeout(timerSalaAoVivo);
                /* Durante criação/troca/renomeação de ficha, os globais já podem
                   apontar para o destino enquanto a sessão da sala ainda pertence à
                   origem. Nenhuma escrita online é permitida nessa janela. */
                if (transicaoFichaAtiva())
                    return;
                enviarBackupsEstruturaisPendentes();
                if (!syncPorTurnoAtiva())
                    sincronizarResumoParticipante();
            }
        });
        window.addEventListener("pagehide", function () {
            clearTimeout(timerResumo);
            clearTimeout(timerSalaAoVivo);
            if (transicaoFichaAtiva())
                return;
            enviarBackupsEstruturaisPendentes();
            if (!syncPorTurnoAtiva())
                sincronizarResumoParticipante();
        });
        window.addEventListener("online", function () {
            drenarBackupsEstruturaisAposRealtime("backup-automatico-reconexao").catch(function () { });
            agendarRecursosSalaAoVivo(__spreadArray([], __read(CAMPOS_SALA_AO_VIVO), false), 260);
        });
        window.addEventListener("shinobi:online:auth", function () {
            setTimeout(function () { return drenarBackupsEstruturaisAposRealtime("backup-automatico-login").catch(function () { }); }, 1500);
        });
    }
    function executarBackupDiario() {
        var _a;
        clearTimeout(timerBackupDiario);
        timerBackupDiario = null;
        if (transicaoFichaAtiva())
            return;
        if (!contaGoogleAtiva() || typeof ((_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.garantirBackupDiarioFichaAtiva) !== "function")
            return;
        window.ShinobiOnline.garantirBackupDiarioFichaAtiva().catch(function () { });
    }
    function agendarBackupDiario(atraso) {
        if (atraso === void 0) { atraso = 6500; }
        if (transicaoFichaAtiva())
            return;
        clearTimeout(timerBackupDiario);
        timerBackupDiario = setTimeout(executarBackupDiario, Math.max(800, Number(atraso) || 6500));
    }
    function instalarBackupDiario() {
        if (window.__shinobiBackupDiarioInstalado)
            return;
        window.__shinobiBackupDiarioInstalado = true;
        agendarBackupDiario(7000);
        window.addEventListener("shinobi:online:auth", function () { return agendarBackupDiario(2200); });
        window.addEventListener("online", function () { return agendarBackupDiario(1800); });
        document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible")
            agendarBackupDiario(2500); });
        if (!intervaloBackupDiario)
            intervaloBackupDiario = setInterval(function () { return agendarBackupDiario(1200); }, 60 * 60 * 1000);
    }
    function instalarBackupManual() {
        /* O evento shinobi:ficha-persistida já trata o salvamento manual e cria
           backup após a confirmação do Firebase. Mantido como ponto de extensão. */
    }
    function participanteVinculado(sessao, online) {
        var _a;
        var participantes = ((_a = online === null || online === void 0 ? void 0 : online.sala) === null || _a === void 0 ? void 0 : _a.participants) || {};
        if ((sessao === null || sessao === void 0 ? void 0 : sessao.participantId) && participantes[sessao.participantId])
            return participantes[sessao.participantId];
        var candidatos = Object.values(participantes).filter(function (p) { var _a; return (p === null || p === void 0 ? void 0 : p.type) === "player" && (p === null || p === void 0 ? void 0 : p.ownerUid) === ((_a = online === null || online === void 0 ? void 0 : online.user) === null || _a === void 0 ? void 0 : _a.uid); });
        var characterId = texto(sessao === null || sessao === void 0 ? void 0 : sessao.characterId);
        if (characterId) {
            var mesmoPersonagem = candidatos.find(function (p) { return texto(p === null || p === void 0 ? void 0 : p.characterId) === characterId; });
            if (mesmoPersonagem)
                return mesmoPersonagem;
        }
        var sheetId = texto(sessao === null || sessao === void 0 ? void 0 : sessao.sheetId);
        if (sheetId) {
            var mesmaFicha = candidatos.find(function (p) { return texto(p === null || p === void 0 ? void 0 : p.sheetId) === sheetId; });
            if (mesmaFicha)
                return mesmaFicha;
        }
        /* Ter somente um personagem da conta na sala não prova que ele é o da
           sessão local. Falhamos fechado para não publicar buff/efeito em outra
           ficha depois de uma troca, exclusão ou recuperação de sessão. */
        return null;
    }
    function valorComSinal(valor) {
        var n = Number(valor);
        return Number.isFinite(n) ? (n > 0 ? "+".concat(n) : String(n)) : texto(valor);
    }
    function textoMecanica(efeito) {
        if (texto(efeito === null || efeito === void 0 ? void 0 : efeito.texto))
            return texto(efeito.texto);
        var alvo = texto((efeito === null || efeito === void 0 ? void 0 : efeito.alvo) || (efeito === null || efeito === void 0 ? void 0 : efeito.tipo) || "efeito").replace(/_/g, " ");
        var operacao = texto(efeito === null || efeito === void 0 ? void 0 : efeito.operacao);
        var valor = efeito === null || efeito === void 0 ? void 0 : efeito.valor;
        if (operacao === "multiplicar" && valor !== undefined)
            return "".concat(alvo, " \u00D7").concat(valor);
        if (["somar", "subtrair"].includes(operacao) && valor !== undefined)
            return "".concat(alvo, " ").concat(valorComSinal(valor));
        if (valor !== undefined && texto(valor))
            return "".concat(alvo, ": ").concat(texto(valor));
        return alvo;
    }
    function detalhesDoResultado(resultado) {
        var origem = Array.isArray(resultado === null || resultado === void 0 ? void 0 : resultado.persistentes) ? resultado.persistentes : [];
        return origem.slice(0, 16).map(function (efeito, indice) {
            var _a;
            return ({
                id: texto((efeito === null || efeito === void 0 ? void 0 : efeito.id) || "mecanica-".concat(indice + 1)),
                polarity: texto((efeito === null || efeito === void 0 ? void 0 : efeito.polaridade) || "neutro"),
                appliesTo: texto((efeito === null || efeito === void 0 ? void 0 : efeito.aplicaEm) || "usuario"),
                target: texto((efeito === null || efeito === void 0 ? void 0 : efeito.alvo) || (efeito === null || efeito === void 0 ? void 0 : efeito.tipo) || "efeito"),
                operation: texto((efeito === null || efeito === void 0 ? void 0 : efeito.operacao) || ""),
                value: (_a = efeito === null || efeito === void 0 ? void 0 : efeito.valor) !== null && _a !== void 0 ? _a : "",
                text: textoMecanica(efeito)
            });
        });
    }
    function resumoDosDetalhes(detalhes) {
        return (detalhes || []).map(function (item) { return texto(item.text); }).filter(Boolean).slice(0, 8).join(" • ");
    }
    function aguardarSalaDaSessao() {
        return __awaiter(this, arguments, void 0, function (limiteMs) {
            var inicio, sessao, online;
            var _a, _b, _c, _d, _e;
            if (limiteMs === void 0) { limiteMs = 2600; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        inicio = Date.now();
                        _f.label = 1;
                    case 1:
                        if (!(Date.now() - inicio < limiteMs)) return [3 /*break*/, 3];
                        sessao = sessaoAtual();
                        online = (_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.snapshot) === null || _b === void 0 ? void 0 : _b.call(_a);
                        if ((sessao === null || sessao === void 0 ? void 0 : sessao.roomId) && ((_c = online === null || online === void 0 ? void 0 : online.sala) === null || _c === void 0 ? void 0 : _c.id) === sessao.roomId && (online === null || online === void 0 ? void 0 : online.user))
                            return [2 /*return*/, { sessao: sessao, online: online }];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 90); })];
                    case 2:
                        _f.sent();
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, { sessao: sessaoAtual(), online: (_e = (_d = window.ShinobiOnline) === null || _d === void 0 ? void 0 : _d.snapshot) === null || _e === void 0 ? void 0 : _e.call(_d) }];
                }
            });
        });
    }
    function publicarEfeitoDoJutsu(jutsu, indice, resultado) {
        return __awaiter(this, void 0, void 0, function () {
            var chavePublicacao, _a, sessao, online, participante, duracao, regra, detalhes, resumo, efeitoOnline, lista, item, candidatos;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!(resultado === null || resultado === void 0 ? void 0 : resultado.aplicado))
                            return [2 /*return*/];
                        chavePublicacao = texto((resultado === null || resultado === void 0 ? void 0 : resultado.itemId) || "".concat((jutsu === null || jutsu === void 0 ? void 0 : jutsu.catalogoId) || indice, ":").concat((resultado === null || resultado === void 0 ? void 0 : resultado.aplicadoEm) || Date.now()));
                        if (publicacoesEmCurso.has(chavePublicacao))
                            return [2 /*return*/];
                        return [4 /*yield*/, aguardarSalaDaSessao()];
                    case 1:
                        _a = _g.sent(), sessao = _a.sessao, online = _a.online;
                        if (!(sessao === null || sessao === void 0 ? void 0 : sessao.roomId) || !(online === null || online === void 0 ? void 0 : online.sala) || online.sala.id !== sessao.roomId)
                            return [2 /*return*/];
                        participante = participanteVinculado(sessao, online);
                        if (!participante)
                            return [2 /*return*/];
                        duracao = (resultado === null || resultado === void 0 ? void 0 : resultado.duracao) || (jutsu === null || jutsu === void 0 ? void 0 : jutsu.duracao) || ((_c = (_b = resultado === null || resultado === void 0 ? void 0 : resultado.persistentes) === null || _b === void 0 ? void 0 : _b.find(function (e) { return texto(e === null || e === void 0 ? void 0 : e.duracao); })) === null || _c === void 0 ? void 0 : _c.duracao);
                        regra = window.ShinobiOnline.analisarDuracaoRodadas(duracao);
                        if (!regra)
                            return [2 /*return*/];
                        detalhes = detalhesDoResultado(resultado);
                        resumo = resumoDosDetalhes(detalhes);
                        publicacoesEmCurso.add(chavePublicacao);
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, , 6, 7]);
                        if (!(resultado === null || resultado === void 0 ? void 0 : resultado.onlineEffectIdAnterior)) return [3 /*break*/, 4];
                        return [4 /*yield*/, window.ShinobiOnline.encerrarEfeito(resultado.onlineEffectIdAnterior).catch(function () { })];
                    case 3:
                        _g.sent();
                        _g.label = 4;
                    case 4: return [4 /*yield*/, window.ShinobiOnline.adicionarEfeito({
                            participantId: participante.id,
                            name: (jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome) || "Jutsu",
                            duration: regra.rounds,
                            source: "jutsu:".concat((jutsu === null || jutsu === void 0 ? void 0 : jutsu.catalogoId) || indice),
                            ownerUid: (_d = online.user) === null || _d === void 0 ? void 0 : _d.uid,
                            summary: resumo,
                            details: detalhes,
                            localEffectId: (resultado === null || resultado === void 0 ? void 0 : resultado.itemId) || "",
                            activationKey: (resultado === null || resultado === void 0 ? void 0 : resultado.aplicadoEm) || ""
                        })];
                    case 5:
                        efeitoOnline = _g.sent();
                        if (!efeitoOnline)
                            return [2 /*return*/];
                        lista = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.efeitosBatalhaAtivos) ? estado.efeitosBatalhaAtivos : [];
                        item = (resultado === null || resultado === void 0 ? void 0 : resultado.itemId) ? lista.find(function (ativo) { return (ativo === null || ativo === void 0 ? void 0 : ativo.id) === resultado.itemId; }) : null;
                        if (!item) {
                            candidatos = lista.filter(function (ativo) { return normalizar(ativo === null || ativo === void 0 ? void 0 : ativo.nome) === normalizar(jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome); });
                            item = candidatos.sort(function (a, b) { return Number(b.aplicadoEm || 0) - Number(a.aplicadoEm || 0); })[0];
                        }
                        if (item) {
                            item.onlineEffectId = efeitoOnline.id;
                            item.onlineRoomId = online.sala.id;
                            item.onlinePublicadoEm = Date.now();
                            item.onlineSyncPendente = false;
                            item.duracaoOriginal = item.duracaoOriginal || regra.original || item.duracao;
                            item.duracaoRodadasTotal = efeitoOnline.totalRounds;
                            item.duracaoRodadasRestantes = efeitoOnline.totalRounds;
                            item.rodadaAtivacao = efeitoOnline.startRound;
                            item.turnoAtivacao = efeitoOnline.startTurnIndex;
                            item.expiraNaRodada = efeitoOnline.expiresAtRound;
                            item.expiraNoTurno = efeitoOnline.expiresAtTurnIndex;
                            item.duracao = "".concat(efeitoOnline.totalRounds, " rodadas \u2022 restam ").concat(efeitoOnline.totalRounds);
                            salvarEstadoSemLoop();
                            atualizarVisualEfeitos();
                            try {
                                window.dispatchEvent(new CustomEvent("shinobi:colecao-item-confirmado", { detail: {
                                        confirmed: true, collection: "efeitosBatalha", itemId: String(item.id || ""), value: item,
                                        identityKey: ((_f = (_e = window.ShinobiItemIdentity) === null || _e === void 0 ? void 0 : _e.identityKey) === null || _f === void 0 ? void 0 : _f.call(_e, "efeitosBatalha", item)) || "",
                                        deleted: false, source: "efeitos-online", reason: "vinculo-efeito-online"
                                    } }));
                            }
                            catch (_erro) { }
                        }
                        try {
                            if (typeof log === "function")
                                log("Buff de ".concat((jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome) || "Jutsu", " sincronizado com a mesa por ").concat(efeitoOnline.totalRounds, " rodadas."));
                        }
                        catch (_erro) { }
                        return [3 /*break*/, 7];
                    case 6:
                        publicacoesEmCurso.delete(chavePublicacao);
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    function sincronizarEfeitosPendentes() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, sessao, online, participante, lista, pendentes, pendentes_1, pendentes_1_1, item, jutsu, resultado, erro_5, e_1_1;
            var e_1, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (sincronizandoPendentes || typeof estado === "undefined")
                            return [2 /*return*/];
                        return [4 /*yield*/, aguardarSalaDaSessao(1200)];
                    case 1:
                        _a = _e.sent(), sessao = _a.sessao, online = _a.online;
                        if (!(sessao === null || sessao === void 0 ? void 0 : sessao.roomId) || !(online === null || online === void 0 ? void 0 : online.sala) || online.sala.id !== sessao.roomId)
                            return [2 /*return*/];
                        participante = participanteVinculado(sessao, online);
                        if (!participante)
                            return [2 /*return*/];
                        lista = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.efeitosBatalhaAtivos) ? estado.efeitosBatalhaAtivos : [];
                        pendentes = lista.filter(function (item) {
                            var _a, _b;
                            var regra = (_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.analisarDuracaoRodadas) === null || _b === void 0 ? void 0 : _b.call(_a, (item === null || item === void 0 ? void 0 : item.duracaoOriginal) || (item === null || item === void 0 ? void 0 : item.duracao));
                            if (!regra)
                                return false;
                            return Boolean((item === null || item === void 0 ? void 0 : item.onlineSyncPendente) || !(item === null || item === void 0 ? void 0 : item.onlineEffectId) || (item === null || item === void 0 ? void 0 : item.onlineRoomId) !== online.sala.id);
                        });
                        if (!pendentes.length)
                            return [2 /*return*/];
                        sincronizandoPendentes = true;
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, , 13, 14]);
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 10, 11, 12]);
                        pendentes_1 = __values(pendentes), pendentes_1_1 = pendentes_1.next();
                        _e.label = 4;
                    case 4:
                        if (!!pendentes_1_1.done) return [3 /*break*/, 9];
                        item = pendentes_1_1.value;
                        jutsu = { nome: item.nome, catalogoId: item.origemId, duracao: item.duracaoOriginal || item.duracao };
                        resultado = {
                            aplicado: true, itemId: item.id, duracao: item.duracaoOriginal || item.duracao,
                            aplicadoEm: item.aplicadoEm, persistentes: Array.isArray(item.efeitos) ? item.efeitos : []
                        };
                        _e.label = 5;
                    case 5:
                        _e.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, publicarEfeitoDoJutsu(jutsu, 0, resultado)];
                    case 6:
                        _e.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        erro_5 = _e.sent();
                        item.onlineSyncPendente = true;
                        item.onlineErro = Date.now();
                        salvarEstadoSemLoop();
                        window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: ((_d = (_c = window.ShinobiOnline) === null || _c === void 0 ? void 0 : _c.erroAmigavel) === null || _d === void 0 ? void 0 : _d.call(_c, erro_5)) || String(erro_5) } }));
                        return [3 /*break*/, 8];
                    case 8:
                        pendentes_1_1 = pendentes_1.next();
                        return [3 /*break*/, 4];
                    case 9: return [3 /*break*/, 12];
                    case 10:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 12];
                    case 11:
                        try {
                            if (pendentes_1_1 && !pendentes_1_1.done && (_b = pendentes_1.return)) _b.call(pendentes_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        sincronizandoPendentes = false;
                        return [7 /*endfinally*/];
                    case 14: return [2 /*return*/];
                }
            });
        });
    }
    function instalarPublicacaoJutsu() {
        var atual = window.aplicarEfeitosJutsuBatalha;
        if (typeof atual !== "function" || atual.__onlineHook)
            return;
        var wrapper = function (jutsu, indice) {
            var arguments_1 = arguments;
            return __awaiter(this, void 0, void 0, function () {
                var resultado, erro_6, lista, item;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, atual.apply(this, arguments_1)];
                        case 1:
                            resultado = _c.sent();
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, publicarEfeitoDoJutsu(jutsu, indice, resultado)];
                        case 3:
                            _c.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            erro_6 = _c.sent();
                            lista = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.efeitosBatalhaAtivos) ? estado.efeitosBatalhaAtivos : [];
                            item = (resultado === null || resultado === void 0 ? void 0 : resultado.itemId) ? lista.find(function (ativo) { return (ativo === null || ativo === void 0 ? void 0 : ativo.id) === resultado.itemId; }) : null;
                            if (item) {
                                item.onlineSyncPendente = true;
                                item.onlineErro = Date.now();
                                salvarEstadoSemLoop();
                            }
                            window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", { detail: { mensagem: ((_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.erroAmigavel) === null || _b === void 0 ? void 0 : _b.call(_a, erro_6)) || String(erro_6) } }));
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/, resultado];
                    }
                });
            });
        };
        wrapper.__onlineHook = true;
        wrapper.__original = atual;
        window.aplicarEfeitosJutsuBatalha = wrapper;
    }
    function instalarEncerramentoManual() {
        var atual = window.removerEfeitoJutsuBatalha;
        if (typeof atual !== "function" || atual.__onlineHook)
            return;
        var wrapper = function (id) {
            var arguments_2 = arguments;
            return __awaiter(this, void 0, void 0, function () {
                var listaAntes, itemAntes, retorno, listaDepois, foiRemovido;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            listaAntes = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.efeitosBatalhaAtivos) ? estado.efeitosBatalhaAtivos : [];
                            itemAntes = listaAntes.find(function (item) { return (item === null || item === void 0 ? void 0 : item.id) === id; });
                            return [4 /*yield*/, atual.apply(this, arguments_2)];
                        case 1:
                            retorno = _c.sent();
                            listaDepois = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.efeitosBatalhaAtivos) ? estado.efeitosBatalhaAtivos : [];
                            foiRemovido = Boolean(itemAntes && !listaDepois.some(function (item) { return (item === null || item === void 0 ? void 0 : item.id) === id; }));
                            if (!(foiRemovido && (itemAntes === null || itemAntes === void 0 ? void 0 : itemAntes.onlineEffectId))) return [3 /*break*/, 3];
                            return [4 /*yield*/, Promise.resolve((_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.encerrarEfeito) === null || _b === void 0 ? void 0 : _b.call(_a, itemAntes.onlineEffectId)).catch(function () { })];
                        case 2:
                            _c.sent();
                            _c.label = 3;
                        case 3: return [2 /*return*/, retorno];
                    }
                });
            });
        };
        wrapper.__onlineHook = true;
        wrapper.__original = atual;
        window.removerEfeitoJutsuBatalha = wrapper;
    }
    function instalarLimpezaOnline() {
        var atual = window.limparEfeitosJutsuBatalhaSemConfirmacao;
        if (typeof atual !== "function" || atual.__onlineHook)
            return;
        var wrapper = function () {
            var ids = (Array.isArray(estado === null || estado === void 0 ? void 0 : estado.efeitosBatalhaAtivos) ? estado.efeitosBatalhaAtivos : [])
                .map(function (item) { return item === null || item === void 0 ? void 0 : item.onlineEffectId; }).filter(Boolean);
            var retorno = atual.apply(this, arguments);
            ids.forEach(function (id) { var _a, _b; return Promise.resolve((_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.encerrarEfeito) === null || _b === void 0 ? void 0 : _b.call(_a, id)).catch(function () { }); });
            return retorno;
        };
        wrapper.__onlineHook = true;
        wrapper.__original = atual;
        window.limparEfeitosJutsuBatalhaSemConfirmacao = wrapper;
    }
    function aplicarRodadaSala(snapshot) {
        return __awaiter(this, void 0, void 0, function () {
            var sessao, room, lista, efeitos, alterou, encerrados, i, item, remoto, publicadoEm, restante, novoTexto;
            return __generator(this, function (_a) {
                if (aplicandoRodada)
                    return [2 /*return*/];
                sessao = sessaoAtual();
                room = snapshot === null || snapshot === void 0 ? void 0 : snapshot.sala;
                if (!(sessao === null || sessao === void 0 ? void 0 : sessao.roomId) || !room || room.id !== sessao.roomId)
                    return [2 /*return*/];
                if (typeof estado === "undefined")
                    return [2 /*return*/];
                lista = Array.isArray(estado.efeitosBatalhaAtivos) ? estado.efeitosBatalhaAtivos : [];
                if (!lista.some(function (item) { return item === null || item === void 0 ? void 0 : item.onlineEffectId; }))
                    return [2 /*return*/];
                aplicandoRodada = true;
                try {
                    efeitos = room.effects || {};
                    alterou = false;
                    encerrados = [];
                    for (i = lista.length - 1; i >= 0; i -= 1) {
                        item = lista[i];
                        if (!(item === null || item === void 0 ? void 0 : item.onlineEffectId))
                            continue;
                        remoto = efeitos[item.onlineEffectId];
                        if (!remoto) {
                            publicadoEm = Number(item.onlinePublicadoEm || 0);
                            if (publicadoEm && Date.now() - publicadoEm > 4500) {
                                encerrados.push(item.nome || "Efeito");
                                lista.splice(i, 1);
                                alterou = true;
                            }
                            continue;
                        }
                        restante = rodadasRestantes(remoto, room.combat);
                        if (remoto.status === "expired" || remoto.status === "ended" || restante <= 0) {
                            encerrados.push(item.nome || "Efeito");
                            lista.splice(i, 1);
                            alterou = true;
                            continue;
                        }
                        novoTexto = "".concat(Number(remoto.totalRounds || restante), " rodadas \u2022 restam ").concat(restante);
                        if (item.duracao !== novoTexto || item.duracaoRodadasRestantes !== restante) {
                            item.duracao = novoTexto;
                            item.duracaoRodadasRestantes = restante;
                            alterou = true;
                        }
                    }
                    if (alterou) {
                        estado.efeitosBatalhaAtivos = lista;
                        salvarEstadoSemLoop();
                        atualizarVisualEfeitos();
                        encerrados.forEach(function (nome) { try {
                            if (typeof log === "function")
                                log("O efeito ".concat(nome, " terminou automaticamente pela contagem da mesa."));
                        }
                        catch (_erro) { } });
                    }
                }
                finally {
                    aplicandoRodada = false;
                }
                return [2 /*return*/];
            });
        });
    }
    function observarTransicaoDeTurno(snapshot) {
        return __awaiter(this, void 0, void 0, function () {
            var sessao, room, combat, ordem, indice, participanteAtual, chaveAtual, turnoAnterior, participanteAnterior, sync, haPendente, erro_7;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        sessao = sessaoAtual();
                        room = snapshot === null || snapshot === void 0 ? void 0 : snapshot.sala;
                        if (!(sessao === null || sessao === void 0 ? void 0 : sessao.roomId) || !room || room.id !== sessao.roomId || sessao.role !== "player")
                            return [2 /*return*/];
                        combat = room.combat || {};
                        ordem = Array.isArray(combat.order) ? combat.order : Object.values(combat.order || {});
                        indice = Math.max(0, Number(combat.turnIndex || 0));
                        participanteAtual = ordem[indice] || "";
                        chaveAtual = combat.started
                            ? "".concat(Math.max(1, Number(combat.round || 1)), ":").concat(indice, ":").concat(participanteAtual)
                            : "";
                        turnoAnterior = ultimoTurnoObservado;
                        participanteAnterior = ultimoParticipanteObservado;
                        ultimoTurnoObservado = chaveAtual;
                        ultimoParticipanteObservado = participanteAtual;
                        if (!turnoAnterior || turnoAnterior === chaveAtual)
                            return [2 /*return*/];
                        sync = (_b = (_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.statusSincronizacaoAtual) === null || _b === void 0 ? void 0 : _b.call(_a);
                        haPendente = turnoLocalPendente() || ((sync === null || sync === void 0 ? void 0 : sync.syncStatus) === 0 && (sync === null || sync === void 0 ? void 0 : sync.pendingMode) === "turno");
                        if (!haPendente) return [3 /*break*/, 4];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, window.ShinobiOnline.finalizarMeuTurno({
                                permitirForaDoTurno: true,
                                marcarPronto: participanteAnterior === sessao.participantId,
                                turnKey: turnoAnterior
                            })];
                    case 2:
                        _e.sent();
                        limparTurnoLocalPendente();
                        window.dispatchEvent(new CustomEvent("shinobi:turno-auto-sincronizado", {
                            detail: { turnKey: turnoAnterior }
                        }));
                        return [3 /*break*/, 4];
                    case 3:
                        erro_7 = _e.sent();
                        window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync", {
                            detail: { mensagem: ((_d = (_c = window.ShinobiOnline) === null || _c === void 0 ? void 0 : _c.erroAmigavel) === null || _d === void 0 ? void 0 : _d.call(_c, erro_7)) || String(erro_7) }
                        }));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function instalarEventosOnline() {
        if (!window.ShinobiOnline || window.__shinobiOnlineHooksEventos)
            return;
        window.__shinobiOnlineHooksEventos = true;
        window.ShinobiOnline.on("sala", function (evento) {
            aplicarRodadaSala(evento.detail);
            observarTransicaoDeTurno(evento.detail).catch(function () { });
            setTimeout(function () { return sincronizarEfeitosPendentes().catch(function () { }); }, 120);
        });
        window.ShinobiOnline.on("turno-finalizado", function () { return limparTurnoLocalPendente(); });
        window.ShinobiOnline.on("turno-sincronizado", function () { return limparTurnoLocalPendente(); });
        window.ShinobiOnline.on("ficha-restaurada", function () { return setTimeout(function () { return location.reload(); }, 250); });
        window.ShinobiOnline.on("ficha-atualizada-nuvem", function (evento) {
            var _a;
            if ((_a = evento === null || evento === void 0 ? void 0 : evento.detail) === null || _a === void 0 ? void 0 : _a.active)
                setTimeout(function () { return location.reload(); }, 250);
        });
    }
    function iniciar() {
        instalarAutoSync();
        instalarBackupManual();
        instalarBackupDiario();
        instalarPublicacaoJutsu();
        instalarEncerramentoManual();
        instalarLimpezaOnline();
        instalarEventosOnline();
        setTimeout(function () {
            instalarAutoSync();
            instalarBackupManual();
            instalarBackupDiario();
            instalarPublicacaoJutsu();
            instalarEncerramentoManual();
            instalarLimpezaOnline();
            sincronizarEfeitosPendentes().catch(function () { });
        }, 700);
    }
    function executarDepoisDaRenderizacao(fn) {
        var _a;
        if ((_a = window.ShinobiAppReady) === null || _a === void 0 ? void 0 : _a.executar) {
            window.ShinobiAppReady.executar(fn);
            return;
        }
        if (document.readyState === "complete")
            setTimeout(fn, 1200);
        else
            window.addEventListener("load", function () { return setTimeout(fn, 1200); }, { once: true });
    }
    executarDepoisDaRenderizacao(iniciar);
    window.addEventListener("pageshow", function () {
        executarDepoisDaRenderizacao(function () {
            setTimeout(function () {
                iniciar();
                /* pageshow não reconcilia fichas completas. Apenas tenta reenviar
                   operações granulares que já estavam confirmadas e pendentes. */
                drenarBackupsEstruturaisAposRealtime("backup-automatico-pageshow").catch(function () { });
            }, 180);
        });
    });
})();
