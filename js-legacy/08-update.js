/* GERADO AUTOMATICAMENTE — fonte: js/08-update.js — app 2.5.8.154. Não editar. */
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
/* Ficha Ninja 2.5.0 — atualizador PWA sem avisos repetidos. */
(function () {
    "use strict";
    var _a, _b, _c;
    if (window.__fichaNinjaAtualizadorV234)
        return;
    window.__fichaNinjaAtualizadorV234 = true;
    var versaoDocumento = String(document.documentElement.dataset.appVersion || "").trim();
    var versaoScript = (function () {
        var _a;
        try {
            return new URL(((_a = document.currentScript) === null || _a === void 0 ? void 0 : _a.src) || "", window.location.href).searchParams.get("v") || "";
        }
        catch (_erro) {
            return "";
        }
    })();
    /* O HTML é a fonte canônica da versão da tela carregada. Usar primeiro a
       versão do próprio script causava o ciclo 2.3.2 → 2.3.3 da versão anterior. */
    var APP_VERSION = String(versaoDocumento || versaoScript || "2.5.0");
    document.documentElement.dataset.appVersion = APP_VERSION;
    window.APP_VERSION = APP_VERSION;
    var SW_URL_BASE = window.SHINOBI_LEGACY_MODE === true ? "./service-worker-legacy.js" : "./service-worker.js";
    var swUrl = function (versao) {
        if (versao === void 0) { versao = APP_VERSION; }
        return "".concat(SW_URL_BASE, "?v=").concat(encodeURIComponent(String(versao || APP_VERSION)));
    };
    var VERSION_URL = "./version.json";
    var INTERVALO_PERIODICO = 15 * 60 * 1000;
    var INTERVALO_MINIMO = 15 * 1000;
    var LIMITE_REPETICOES_PUBLICACAO = 8;
    var registroAtual = null;
    var verificando = false;
    var aplicando = false;
    var recarregando = false;
    var recarregarAoTrocarControlador = false;
    var ultimaVerificacao = 0;
    var timerPeriodico = null;
    var timerRecarga = null;
    var tentativasPublicacao = 0;
    var versaoRemotaConhecida = "";
    var ultimoErroInstalacao = "";
    function compararVersoes(a, b) {
        var partesA = String(a || "").split(/[.-]/).map(function (v) { return Number(v) || 0; });
        var partesB = String(b || "").split(/[.-]/).map(function (v) { return Number(v) || 0; });
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
    function ehVersaoNova(versao) {
        return Boolean(versao && compararVersoes(versao, APP_VERSION) > 0);
    }
    function deveRecarregarAoAtivarWorker(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.versaoDocumento, versaoDocumento = _c === void 0 ? APP_VERSION : _c, _d = _b.versaoControlador, versaoControlador = _d === void 0 ? "" : _d, _e = _b.versaoWorker, versaoWorker = _e === void 0 ? "" : _e, _f = _b.temControlador, temControlador = _f === void 0 ? false : _f;
        var documento = String(versaoDocumento || "").trim();
        var controlador = String(versaoControlador || "").trim();
        var worker = String(versaoWorker || "").trim();
        if (!temControlador || !documento || !worker || compararVersoes(worker, documento) !== 0)
            return false;
        if (!controlador)
            return true;
        return compararVersoes(controlador, worker) < 0;
    }
    function limparMarcadorRecargaDaUrl() {
        try {
            var url = new URL(window.location.href);
            if (!url.searchParams.has("_shinobi_reload"))
                return;
            url.searchParams.delete("_shinobi_reload");
            window.history.replaceState(null, "", "".concat(url.pathname).concat(url.search).concat(url.hash));
        }
        catch (_erro) { }
    }
    function salvarFicha() {
        try {
            if (typeof window.salvarImediatoV3 === "function") {
                var resultado = window.salvarImediatoV3();
                if (resultado !== false)
                    return true;
            }
            if (typeof window.salvar === "function") {
                window.salvar();
                return true;
            }
        }
        catch (erro) {
            console.warn("Não foi possível salvar antes da atualização.", erro);
        }
        return false;
    }
    function recarregarAplicacao() {
        if (recarregando)
            return;
        recarregando = true;
        salvarFicha();
        try {
            var url = new URL(window.location.href);
            url.searchParams.set("_shinobi_reload", String(Date.now()));
            window.location.replace(url.href);
        }
        catch (_erro) {
            window.location.reload();
        }
    }
    limparMarcadorRecargaDaUrl();
    function obterPainel() {
        var painel = document.getElementById("shinobiAtualizacaoPainel");
        if (painel)
            return painel;
        var menu = document.getElementById("configMenu") || document.body;
        painel = document.createElement("section");
        painel.id = "shinobiAtualizacaoPainel";
        painel.className = "shinobiAtualizacaoPainel";
        painel.setAttribute("aria-label", "Atualização do aplicativo");
        painel.innerHTML = "\n      <div class=\"shinobiAtualizacaoPainel__linha\">\n        <span class=\"shinobiAtualizacaoPainel__rotulo\">Vers\u00E3o instalada</span>\n        <strong id=\"shinobiVersaoInstalada\" class=\"shinobiAtualizacaoPainel__versao\"></strong>\n      </div>\n      <div id=\"shinobiStatusAtualizacao\" class=\"shinobiAtualizacaoPainel__status\" role=\"status\" aria-live=\"polite\"></div>\n      <button id=\"shinobiVerificarAtualizacao\" class=\"shinobiAtualizacaoPainel__botao\" type=\"button\">Verificar atualiza\u00E7\u00E3o</button>\n    ";
        menu.appendChild(painel);
        return painel;
    }
    function configurarPainel() {
        var painel = obterPainel();
        var versao = painel.querySelector("#shinobiVersaoInstalada");
        var botao = painel.querySelector("#shinobiVerificarAtualizacao");
        if (versao)
            versao.textContent = "v".concat(APP_VERSION);
        if (botao && !botao.dataset.configurado) {
            botao.dataset.configurado = "1";
            botao.addEventListener("click", function () { return verificarAtualizacao({ manual: true, forcar: true }); });
        }
    }
    function definirStatus(texto, estado) {
        if (estado === void 0) { estado = "normal"; }
        configurarPainel();
        var status = document.getElementById("shinobiStatusAtualizacao");
        if (status) {
            status.textContent = texto;
            status.dataset.estado = estado;
        }
    }
    function marcarIconeAtualizacao(ativo) {
        var _a, _b;
        var estado = Boolean(ativo);
        document.documentElement.classList.toggle("shinobiTemAtualizacao", estado);
        (_a = document.querySelector(".topoMenuBtn")) === null || _a === void 0 ? void 0 : _a.classList.toggle("temAtualizacao", estado);
        (_b = document.querySelector('[data-drawer-action="settings"]')) === null || _b === void 0 ? void 0 : _b.classList.toggle("temAtualizacao", estado);
    }
    function obterAviso() {
        var _a;
        var aviso = document.getElementById("shinobiAvisoAtualizacao");
        if (aviso)
            return aviso;
        aviso = document.createElement("section");
        aviso.id = "shinobiAvisoAtualizacao";
        aviso.className = "shinobiAvisoAtualizacao";
        aviso.hidden = true;
        aviso.setAttribute("role", "status");
        aviso.setAttribute("aria-live", "polite");
        aviso.innerHTML = "\n      <div class=\"shinobiAvisoAtualizacao__texto\">\n        <strong id=\"shinobiAvisoAtualizacaoTitulo\">Verificando atualiza\u00E7\u00E3o</strong>\n        <span id=\"shinobiAvisoAtualizacaoMensagem\">Aguarde um instante.</span>\n      </div>\n      <button id=\"shinobiBotaoAtualizar\" class=\"shinobiAvisoAtualizacao__botao\" type=\"button\" disabled>Preparando...</button>\n    ";
        document.body.appendChild(aviso);
        (_a = aviso.querySelector("#shinobiBotaoAtualizar")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
            var acao = aviso.dataset.acao || "aplicar";
            if (acao === "recarregar") {
                recarregarAplicacao();
                return;
            }
            if (acao === "verificar") {
                tentativasPublicacao = 0;
                ultimoErroInstalacao = "";
                ocultarAviso();
                verificarAtualizacao({ manual: true, forcar: true });
                return;
            }
            aplicarAtualizacao();
        });
        return aviso;
    }
    function mostrarAviso(_a) {
        var _b = _a === void 0 ? {} : _a, titulo = _b.titulo, mensagem = _b.mensagem, _c = _b.pronto, pronto = _c === void 0 ? false : _c, botaoTexto = _b.botaoTexto, _d = _b.acao, acao = _d === void 0 ? "aplicar" : _d;
        var aviso = obterAviso();
        aviso.querySelector("#shinobiAvisoAtualizacaoTitulo").textContent = titulo || "Nova versão encontrada";
        aviso.querySelector("#shinobiAvisoAtualizacaoMensagem").textContent = mensagem || "Preparando os arquivos da atualização.";
        var botao = aviso.querySelector("#shinobiBotaoAtualizar");
        if (botao) {
            botao.disabled = !pronto;
            botao.textContent = botaoTexto || (pronto ? "Atualizar agora" : "Preparando...");
            botao.setAttribute("aria-busy", pronto ? "false" : "true");
        }
        aviso.dataset.acao = acao;
        aviso.hidden = false;
        requestAnimationFrame(function () { return aviso.classList.add("visivel"); });
        marcarIconeAtualizacao(true);
    }
    function ocultarAviso() {
        var aviso = document.getElementById("shinobiAvisoAtualizacao");
        if (aviso) {
            aviso.classList.remove("visivel");
            window.setTimeout(function () {
                if (!aviso.classList.contains("visivel"))
                    aviso.hidden = true;
            }, 220);
        }
        marcarIconeAtualizacao(false);
    }
    function obterVersaoWorker(worker) {
        return new Promise(function (resolve) {
            if (!worker) {
                resolve("");
                return;
            }
            var canal = new MessageChannel();
            var timer = window.setTimeout(function () { return resolve(""); }, 1800);
            canal.port1.onmessage = function (evento) {
                var _a;
                clearTimeout(timer);
                resolve(String(((_a = evento.data) === null || _a === void 0 ? void 0 : _a.version) || ""));
            };
            try {
                worker.postMessage({ type: "GET_VERSION" }, [canal.port2]);
            }
            catch (_erro) {
                clearTimeout(timer);
                resolve("");
            }
        });
    }
    function anunciarWorkerEsperando() {
        return __awaiter(this, void 0, void 0, function () {
            var worker, versaoWorker, versao;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        worker = registroAtual === null || registroAtual === void 0 ? void 0 : registroAtual.waiting;
                        if (!worker || !navigator.serviceWorker.controller)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, obterVersaoWorker(worker)];
                    case 1:
                        versaoWorker = _a.sent();
                        versao = versaoWorker || versaoRemotaConhecida;
                        if (!ehVersaoNova(versao))
                            return [2 /*return*/, false];
                        tentativasPublicacao = 0;
                        definirStatus("Atualiza\u00E7\u00E3o v".concat(versao, " pronta para instalar."), "pronto");
                        mostrarAviso({
                            titulo: "Vers\u00E3o v".concat(versao, " pronta"),
                            mensagem: "Os arquivos foram preparados. A ficha será salva antes de atualizar.",
                            pronto: true,
                            botaoTexto: "Atualizar agora",
                            acao: "aplicar"
                        });
                        return [2 /*return*/, true];
                }
            });
        });
    }
    function ativarWorkerSemRecarregar(worker) {
        if (!worker)
            return;
        try {
            worker.postMessage({ type: "SKIP_WAITING" });
        }
        catch (_erro) { }
    }
    function ativarWorkerDaVersaoDoDocumento(worker) {
        return __awaiter(this, void 0, void 0, function () {
            var controlador, _a, versaoWorker, versaoControlador;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!worker)
                            return [2 /*return*/];
                        controlador = ((_b = navigator.serviceWorker) === null || _b === void 0 ? void 0 : _b.controller) || null;
                        return [4 /*yield*/, Promise.all([
                                obterVersaoWorker(worker),
                                obterVersaoWorker(controlador)
                            ])];
                    case 1:
                        _a = __read.apply(void 0, [_c.sent(), 2]), versaoWorker = _a[0], versaoControlador = _a[1];
                        if (deveRecarregarAoAtivarWorker({
                            versaoDocumento: APP_VERSION,
                            versaoControlador: versaoControlador,
                            versaoWorker: versaoWorker || APP_VERSION,
                            temControlador: Boolean(controlador)
                        })) {
                            recarregarAoTrocarControlador = true;
                        }
                        ativarWorkerSemRecarregar(worker);
                        return [2 /*return*/];
                }
            });
        });
    }
    function aplicarAtualizacao() {
        var worker = registroAtual === null || registroAtual === void 0 ? void 0 : registroAtual.waiting;
        if (aplicando)
            return;
        if (!worker) {
            definirStatus("A atualização ainda não está pronta. Tente verificar novamente.", "erro");
            mostrarAviso({
                titulo: "Atualização não concluída",
                mensagem: "O navegador não encontrou os arquivos preparados. Tente novamente.",
                pronto: true,
                botaoTexto: "Tentar novamente",
                acao: "verificar"
            });
            return;
        }
        aplicando = true;
        recarregarAoTrocarControlador = true;
        salvarFicha();
        definirStatus("Aplicando a atualização...", "pronto");
        mostrarAviso({
            titulo: "Atualizando a Ficha Ninja",
            mensagem: "Salvando a ficha e abrindo a nova versão.",
            pronto: false,
            botaoTexto: "Atualizando..."
        });
        worker.postMessage({ type: "SKIP_WAITING" });
        clearTimeout(timerRecarga);
        timerRecarga = window.setTimeout(function () {
            if (!recarregando)
                recarregarAplicacao();
        }, 10000);
    }
    function buscarVersaoRemota() {
        return __awaiter(this, void 0, void 0, function () {
            var resposta, dados;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(VERSION_URL, "?_=").concat(Date.now()), {
                            cache: "no-store",
                            credentials: "same-origin",
                            headers: { "Cache-Control": "no-cache" }
                        })];
                    case 1:
                        resposta = _a.sent();
                        if (!resposta.ok)
                            throw new Error("version.json respondeu ".concat(resposta.status));
                        return [4 /*yield*/, resposta.json()];
                    case 2:
                        dados = _a.sent();
                        return [2 /*return*/, String((dados === null || dados === void 0 ? void 0 : dados.version) || "").trim()];
                }
            });
        });
    }
    function acompanharWorker(worker) {
        var _this = this;
        if (!worker || worker.__fichaNinjaAcompanhadoV234)
            return;
        worker.__fichaNinjaAcompanhadoV234 = true;
        worker.addEventListener("statechange", function () { return __awaiter(_this, void 0, void 0, function () {
            var anunciou;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(worker.state === "installed")) return [3 /*break*/, 3];
                        if (!navigator.serviceWorker.controller) {
                            definirStatus("Vers\u00E3o v".concat(APP_VERSION, " dispon\u00EDvel offline."), "pronto");
                            ocultarAviso();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, anunciarWorkerEsperando()];
                    case 1:
                        anunciou = _a.sent();
                        if (!(!anunciou && !ehVersaoNova(versaoRemotaConhecida))) return [3 /*break*/, 3];
                        return [4 /*yield*/, ativarWorkerDaVersaoDoDocumento(registroAtual === null || registroAtual === void 0 ? void 0 : registroAtual.waiting)];
                    case 2:
                        _a.sent();
                        ocultarAviso();
                        _a.label = 3;
                    case 3:
                        if (worker.state === "redundant" && ehVersaoNova(versaoRemotaConhecida)) {
                            definirStatus("A atualização não terminou. Tentaremos novamente.", "erro");
                            mostrarAviso({
                                titulo: "Não foi possível preparar a atualização",
                                mensagem: "A conexão pode ter oscilado. O app tentará novamente automaticamente.",
                                pronto: false,
                                botaoTexto: "Tentando novamente..."
                            });
                            window.setTimeout(function () { return verificarAtualizacao({ forcar: true }); }, 5000);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    }
    function acompanharRegistro(registro) {
        if (!registro || registro.__fichaNinjaAcompanhadoV234)
            return;
        registro.__fichaNinjaAcompanhadoV234 = true;
        if (registro.installing)
            acompanharWorker(registro.installing);
        registro.addEventListener("updatefound", function () {
            ultimoErroInstalacao = "";
            var worker = registro.installing;
            acompanharWorker(worker);
            if (!navigator.serviceWorker.controller) {
                definirStatus("Preparando funcionamento offline...", "normal");
                return;
            }
            if (ehVersaoNova(versaoRemotaConhecida)) {
                definirStatus("Nova versão encontrada. Preparando arquivos...", "normal");
                mostrarAviso({
                    titulo: "Preparando vers\u00E3o v".concat(versaoRemotaConhecida),
                    mensagem: "Baixando os arquivos necessários. Você pode continuar usando a ficha.",
                    pronto: false,
                    botaoTexto: "Preparando..."
                });
            }
        });
    }
    function garantirWorkerDaVersao(versao) {
        return __awaiter(this, void 0, void 0, function () {
            var alvo, registro, erro_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        alvo = String(versao || "").trim();
                        if (!alvo)
                            return [2 /*return*/, registroAtual];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, navigator.serviceWorker.register(swUrl(alvo), {
                                scope: "./",
                                updateViaCache: "none"
                            })];
                    case 2:
                        registro = _a.sent();
                        registroAtual = registro;
                        acompanharRegistro(registroAtual);
                        if (registroAtual.installing)
                            acompanharWorker(registroAtual.installing);
                        return [2 /*return*/, registroAtual];
                    case 3:
                        erro_1 = _a.sent();
                        console.warn("N\u00E3o foi poss\u00EDvel registrar o Service Worker v".concat(alvo, "."), erro_1);
                        throw erro_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function solicitarAtualizacaoDoRegistro() {
        return __awaiter(this, arguments, void 0, function (versao) {
            if (versao === void 0) { versao = versaoRemotaConhecida || APP_VERSION; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, garantirWorkerDaVersao(versao)];
                    case 1:
                        _a.sent();
                        if (!registroAtual)
                            return [2 /*return*/];
                        return [4 /*yield*/, registroAtual.update()];
                    case 2:
                        _a.sent();
                        if (registroAtual.installing)
                            acompanharWorker(registroAtual.installing);
                        return [2 /*return*/];
                }
            });
        });
    }
    function reagendarPublicacao() {
        if (!ehVersaoNova(versaoRemotaConhecida))
            return;
        if (tentativasPublicacao >= LIMITE_REPETICOES_PUBLICACAO) {
            var detalhe = ultimoErroInstalacao
                ? "N\u00E3o foi poss\u00EDvel baixar ".concat(ultimoErroInstalacao, ".")
                : "O navegador não concluiu a preparação dos arquivos.";
            definirStatus("A atualização não terminou. Use o botão para tentar novamente.", "erro");
            mostrarAviso({
                titulo: "Atualização não concluída",
                mensagem: "".concat(detalhe, " Sua ficha continua salva."),
                pronto: true,
                botaoTexto: "Tentar novamente",
                acao: "verificar"
            });
            return;
        }
        tentativasPublicacao += 1;
        window.setTimeout(function () { return verificarAtualizacao({ forcar: true }); }, 5000);
    }
    function verificarAtualizacao() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var agora, botao, remota, versaoAtiva, waiting, versaoWaiting, erro_2;
            var _b = _a === void 0 ? {} : _a, _c = _b.manual, manual = _c === void 0 ? false : _c, _d = _b.forcar, forcar = _d === void 0 ? false : _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!("serviceWorker" in navigator)) {
                            definirStatus("Este navegador não oferece atualização offline.", "erro");
                            return [2 /*return*/];
                        }
                        if (!navigator.onLine) {
                            definirStatus("Sem internet. A versão instalada continua disponível offline.", "erro");
                            return [2 /*return*/];
                        }
                        if (verificando)
                            return [2 /*return*/];
                        agora = Date.now();
                        if (!forcar && agora - ultimaVerificacao < INTERVALO_MINIMO)
                            return [2 /*return*/];
                        verificando = true;
                        ultimaVerificacao = agora;
                        botao = document.getElementById("shinobiVerificarAtualizacao");
                        if (botao) {
                            botao.disabled = true;
                            botao.textContent = "Verificando...";
                        }
                        definirStatus("Verificando atualização...", "normal");
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 13, 14, 15]);
                        return [4 /*yield*/, buscarVersaoRemota()];
                    case 2:
                        remota = _e.sent();
                        versaoRemotaConhecida = remota;
                        if (!ehVersaoNova(remota)) return [3 /*break*/, 6];
                        definirStatus("Vers\u00E3o v".concat(remota, " encontrada. Preparando..."), "normal");
                        mostrarAviso({
                            titulo: "Nova vers\u00E3o v".concat(remota),
                            mensagem: "Preparando os arquivos. O botão será liberado quando estiver tudo pronto.",
                            pronto: false,
                            botaoTexto: "Preparando..."
                        });
                        return [4 /*yield*/, solicitarAtualizacaoDoRegistro(remota)];
                    case 3:
                        _e.sent();
                        return [4 /*yield*/, anunciarWorkerEsperando()];
                    case 4:
                        if (_e.sent())
                            return [2 /*return*/];
                        return [4 /*yield*/, obterVersaoWorker(navigator.serviceWorker.controller)];
                    case 5:
                        versaoAtiva = _e.sent();
                        if (versaoAtiva && compararVersoes(versaoAtiva, remota) >= 0) {
                            tentativasPublicacao = 0;
                            definirStatus("Vers\u00E3o v".concat(remota, " pronta. Recarregue para abrir os arquivos novos."), "pronto");
                            mostrarAviso({
                                titulo: "Vers\u00E3o v".concat(remota, " pronta"),
                                mensagem: "O sistema foi atualizado em segundo plano. Recarregue uma vez para abrir a versão nova.",
                                pronto: true,
                                botaoTexto: "Recarregar agora",
                                acao: "recarregar"
                            });
                        }
                        else {
                            reagendarPublicacao();
                        }
                        return [2 /*return*/];
                    case 6: return [4 /*yield*/, solicitarAtualizacaoDoRegistro(APP_VERSION)];
                    case 7:
                        _e.sent();
                        waiting = registroAtual === null || registroAtual === void 0 ? void 0 : registroAtual.waiting;
                        if (!waiting) return [3 /*break*/, 12];
                        return [4 /*yield*/, obterVersaoWorker(waiting)];
                    case 8:
                        versaoWaiting = _e.sent();
                        if (!ehVersaoNova(versaoWaiting)) return [3 /*break*/, 10];
                        return [4 /*yield*/, anunciarWorkerEsperando()];
                    case 9:
                        _e.sent();
                        return [2 /*return*/];
                    case 10: 
                    /* Se o documento já veio da rede na versão nova mas ainda está controlado
                       pelo Service Worker anterior, a troca precisa recarregar a página uma vez.
                       Isso impede HTML/version.json novos com módulos online antigos em cache. */
                    return [4 /*yield*/, ativarWorkerDaVersaoDoDocumento(waiting)];
                    case 11:
                        /* Se o documento já veio da rede na versão nova mas ainda está controlado
                           pelo Service Worker anterior, a troca precisa recarregar a página uma vez.
                           Isso impede HTML/version.json novos com módulos online antigos em cache. */
                        _e.sent();
                        _e.label = 12;
                    case 12:
                        tentativasPublicacao = 0;
                        ocultarAviso();
                        definirStatus("Voc\u00EA est\u00E1 na vers\u00E3o mais recente: v".concat(APP_VERSION, "."), "pronto");
                        return [3 /*break*/, 15];
                    case 13:
                        erro_2 = _e.sent();
                        console.warn("Falha ao verificar atualização.", erro_2);
                        definirStatus(manual
                            ? "Não foi possível conferir agora. Verifique sua conexão e tente novamente."
                            : "Vers\u00E3o instalada: v".concat(APP_VERSION, "."), manual ? "erro" : "normal");
                        return [3 /*break*/, 15];
                    case 14:
                        verificando = false;
                        if (botao) {
                            botao.disabled = false;
                            botao.textContent = "Verificar atualização";
                        }
                        return [7 /*endfinally*/];
                    case 15: return [2 /*return*/];
                }
            });
        });
    }
    function iniciar() {
        return __awaiter(this, void 0, void 0, function () {
            var erro_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configurarPainel();
                        definirStatus("Iniciando verificação...", "normal");
                        if (!("serviceWorker" in navigator)) {
                            definirStatus("Atualização offline indisponível neste navegador.", "erro");
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, navigator.serviceWorker.register(swUrl(APP_VERSION), {
                                scope: "./",
                                updateViaCache: "none"
                            })];
                    case 2:
                        registroAtual = _a.sent();
                        acompanharRegistro(registroAtual);
                        return [4 /*yield*/, verificarAtualizacao({ forcar: true })];
                    case 3:
                        _a.sent();
                        clearInterval(timerPeriodico);
                        timerPeriodico = window.setInterval(function () {
                            if (document.visibilityState === "visible")
                                verificarAtualizacao();
                        }, INTERVALO_PERIODICO);
                        return [3 /*break*/, 5];
                    case 4:
                        erro_3 = _a.sent();
                        console.error("Falha ao registrar o service worker.", erro_3);
                        definirStatus("Não foi possível iniciar o atualizador. A ficha continua funcionando.", "erro");
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    (_a = navigator.serviceWorker) === null || _a === void 0 ? void 0 : _a.addEventListener("message", function (evento) {
        var dados = evento.data || {};
        if (dados.type === "SW_INSTALL_PROGRESS") {
            var versao = String(dados.version || versaoRemotaConhecida || "");
            if (!ehVersaoNova(versao))
                return;
            versaoRemotaConhecida = versao;
            var atual = Number(dados.loaded || 0);
            var total = Number(dados.total || 0);
            var progresso = total ? " (".concat(atual, "/").concat(total, ")") : "";
            definirStatus("Preparando atualiza\u00E7\u00E3o".concat(progresso, "..."), "normal");
            mostrarAviso({
                titulo: "Preparando vers\u00E3o v".concat(versao),
                mensagem: "Baixando arquivos necess\u00E1rios".concat(progresso, ". Voc\u00EA pode continuar usando a ficha."),
                pronto: false,
                botaoTexto: "Preparando..."
            });
        }
        if (dados.type === "SW_INSTALL_ERROR") {
            var versao = String(dados.version || versaoRemotaConhecida || "");
            if (!ehVersaoNova(versao))
                return;
            try {
                var url = new URL(String(dados.url || ""), window.location.href);
                ultimoErroInstalacao = url.pathname.split("/").pop() || "um arquivo";
            }
            catch (_erro) {
                ultimoErroInstalacao = "um arquivo";
            }
            definirStatus("Falha ao baixar ".concat(ultimoErroInstalacao, "."), "erro");
            mostrarAviso({
                titulo: "Falha ao preparar a atualização",
                mensagem: "N\u00E3o foi poss\u00EDvel baixar ".concat(ultimoErroInstalacao, ". Verifique a conex\u00E3o e tente novamente."),
                pronto: true,
                botaoTexto: "Tentar novamente",
                acao: "verificar"
            });
        }
    });
    (_b = navigator.serviceWorker) === null || _b === void 0 ? void 0 : _b.addEventListener("controllerchange", function () {
        clearTimeout(timerRecarga);
        if (recarregarAoTrocarControlador || aplicando) {
            recarregarAplicacao();
            return;
        }
        /* A ativação silenciosa de um worker da mesma versão não deve recarregar a
           página e nem reabrir o aviso. */
        ocultarAviso();
        definirStatus("Voc\u00EA est\u00E1 na vers\u00E3o mais recente: v".concat(APP_VERSION, "."), "pronto");
    });
    var timerReconexao = null;
    window.addEventListener("online", function () {
        clearTimeout(timerReconexao);
        timerReconexao = setTimeout(function () { return verificarAtualizacao(); }, 5000);
    }, { passive: true });
    window.ShinobiAtualizacao = {
        verificar: function () { return verificarAtualizacao({ manual: true, forcar: true }); },
        aplicar: aplicarAtualizacao,
        versao: APP_VERSION,
        __test: { deveRecarregarAoAtivarWorker: deveRecarregarAoAtivarWorker }
    };
    function iniciarDepoisDaRenderizacao() {
        try {
            var resultado = iniciar();
            if (resultado && typeof resultado.catch === "function")
                resultado.catch(function () { });
        }
        catch (erro) {
            console.warn("Atualizador não iniciou. A ficha continua funcionando.", erro);
        }
    }
    if ((_c = window.ShinobiAppReady) === null || _c === void 0 ? void 0 : _c.executar) {
        window.ShinobiAppReady.executar(iniciarDepoisDaRenderizacao);
    }
    else if (document.readyState === "complete") {
        setTimeout(iniciarDepoisDaRenderizacao, 1200);
    }
    else {
        window.addEventListener("load", function () { return setTimeout(iniciarDepoisDaRenderizacao, 1200); }, { once: true });
    }
})();
