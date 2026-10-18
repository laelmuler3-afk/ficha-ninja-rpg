/* GERADO AUTOMATICAMENTE — fonte: js/25-recuperacao-nuvem.js — app 2.5.8.174. Não editar. */
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
/* Recuperação assistida v2.5.8.174. Não envia dados nem sobrescreve fichas
 * automaticamente; a escolha do backup é sempre explícita. */
(function () {
    "use strict";
    if (window.__shinobiRecuperacaoNuvem174)
        return;
    window.__shinobiRecuperacaoNuvem174 = true;
    var overlay = null;
    var unsubscribe = null;
    function bloqueada() {
        var _a, _b;
        try {
            var nome = localStorage.getItem("ficha_ninja_ativa_v1") || "Principal";
            var chave = nome === "Principal" ? "ficha_ninja_app_v2" : "ficha_ninja_app_v2__" + nome;
            return ((_b = (_a = window.ShinobiIntegridadeFicha) === null || _a === void 0 ? void 0 : _a.bloqueadaPara) === null || _b === void 0 ? void 0 : _b.call(_a, chave)) === true;
        }
        catch (_erro) {
            return true;
        }
    }
    function adicionarBotao() {
        if (!bloqueada())
            return;
        var aviso = document.getElementById("shinobiAvisoIntegridadeFicha");
        if (!aviso)
            return;
        var b = aviso.querySelector('[data-integridade="recuperar-nuvem"]');
        if (b)
            return;
        b = document.createElement("button");
        b.type = "button";
        b.dataset.integridade = "recuperar-nuvem";
        b.textContent = "Recuperar da nuvem";
        b.style.cssText = "background:#184a43;color:#f1fff9;border:1px solid #76c9b8;padding:8px 12px;border-radius:8px;font:700 13px system-ui;cursor:pointer";
        b.addEventListener("click", abrir);
        (aviso.querySelector("div") || aviso).appendChild(b);
    }
    function criar(tag, texto, classe) {
        var el = document.createElement(tag);
        if (texto != null)
            el.textContent = String(texto);
        if (classe)
            el.className = classe;
        return el;
    }
    function botao(texto, acao) {
        var el = criar("button", texto);
        el.type = "button";
        el.style.cssText = "background:#1a272b;color:#f0f6f3;border:1px solid #688c91;padding:10px;border-radius:9px;cursor:pointer;font:700 14px system-ui";
        el.addEventListener("click", acao);
        return el;
    }
    function fechar() { if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    } if (overlay) {
        overlay.remove();
        overlay = null;
    } }
    function escreverMensagem(texto) {
        var msg = overlay === null || overlay === void 0 ? void 0 : overlay.querySelector("[data-recovery-status]");
        if (msg)
            msg.textContent = String(texto || "");
    }
    function desenhar() {
        var _a;
        if (!overlay)
            return;
        var corpo = overlay.querySelector("[data-recovery-list]");
        if (!corpo)
            return;
        corpo.replaceChildren();
        var api = window.ShinobiOnline;
        if (!api) {
            escreverMensagem("Módulo da nuvem ainda não carregado. Aguarde e tente novamente.");
            return;
        }
        var st = ((_a = api.snapshot) === null || _a === void 0 ? void 0 : _a.call(api)) || {};
        if (!st.user || st.user.anonymous) {
            escreverMensagem("Entre na mesma Conta Google usada para salvar as fichas. Nenhum dado local será substituído ao fazer login.");
            corpo.appendChild(botao("Abrir login do Google", function () { var _a, _b; fechar(); (_b = (_a = window.ShinobiOnlineUI) === null || _a === void 0 ? void 0 : _a.abrir) === null || _b === void 0 ? void 0 : _b.call(_a, "sincronizacao"); }));
            return;
        }
        var backups = (st.fichasNuvem || []).filter(function (f) { return f && f.id; });
        escreverMensagem(backups.length ? "Selecione o backup correto. A recuperação só acontece após sua confirmação." : "Procurando backups da sua conta… Se não aparecer nenhum, confira a conexão e a Conta Google.");
        backups.forEach(function (f) {
            var linha = criar("div");
            linha.style.cssText = "border:1px solid #394d56;border-radius:10px;padding:10px;display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap";
            var nome = criar("div");
            nome.style.cssText = "flex:1;min-width:125px";
            nome.appendChild(criar("strong", f.characterName || f.name || "Ficha"));
            nome.appendChild(criar("div", "Revisão " + Number(f.revision || 0) + (f.updatedAt ? " • " + new Date(f.updatedAt).toLocaleDateString("pt-BR") : "")));
            linha.appendChild(nome);
            linha.appendChild(botao("Restaurar", function () {
                return __awaiter(this, void 0, void 0, function () {
                    var erro_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!bloqueada()) {
                                    escreverMensagem("A ficha local já está acessível. A recuperação automática foi cancelada.");
                                    return [2 /*return*/];
                                }
                                if (!window.confirm("Restaurar esta ficha da nuvem neste dispositivo? A ficha será carregada somente após confirmação. Verifique o nome antes de continuar."))
                                    return [2 /*return*/];
                                escreverMensagem("Restaurando a ficha selecionada…");
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, api.restaurarFichaDaNuvem(f.id, { asCopy: false })];
                            case 2:
                                _a.sent();
                                fechar();
                                // O próprio gerenciador da nuvem dispara ficha-restaurada e recarrega.
                                window.location.reload();
                                return [3 /*break*/, 4];
                            case 3:
                                erro_1 = _a.sent();
                                escreverMensagem("Não foi possível restaurar: " + String((erro_1 === null || erro_1 === void 0 ? void 0 : erro_1.message) || erro_1));
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            }));
            corpo.appendChild(linha);
        });
    }
    function abrir() {
        var _a, _b, _c;
        if (!bloqueada())
            return;
        if (overlay)
            return;
        overlay = criar("div");
        overlay.id = "shinobiRecuperacaoNuvem174";
        overlay.style.cssText = "position:fixed;inset:0;z-index:1400;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:16px;color:#f4ede0;font:14px/1.45 system-ui";
        var painel = criar("section");
        painel.style.cssText = "background:#101c22;border:1px solid #698389;border-radius:16px;padding:18px;max-width:520px;width:100%;max-height:86vh;overflow:auto;display:flex;flex-direction:column;gap:12px";
        painel.appendChild(criar("h3", "Recuperar ficha da nuvem"));
        painel.appendChild(criar("p", "Seus dados locais continuam protegidos. Nada será enviado à nuvem nesta tela."));
        var status = criar("p", "Verificando conta…");
        status.dataset.recoveryStatus = "1";
        painel.appendChild(status);
        var lista = criar("div");
        lista.dataset.recoveryList = "1";
        lista.style.cssText = "display:flex;flex-direction:column;gap:8px";
        painel.appendChild(lista);
        painel.appendChild(botao("Cancelar", fechar));
        overlay.appendChild(painel);
        document.body.appendChild(overlay);
        if ((_a = window.ShinobiOnline) === null || _a === void 0 ? void 0 : _a.on)
            unsubscribe = window.ShinobiOnline.on("fichas-nuvem", desenhar);
        try {
            (_c = (_b = window.ShinobiOnline) === null || _b === void 0 ? void 0 : _b.ativarBackupsNuvem) === null || _c === void 0 ? void 0 : _c.call(_b);
        }
        catch (_erro) { }
        desenhar();
    }
    function iniciar() {
        adicionarBotao();
        document.addEventListener("shinobi:app-pronto", adicionarBotao);
        window.addEventListener("pageshow", adicionarBotao);
        // O aviso pode surgir depois do carregamento dos dados no Safari.
        var alvo = document.body;
        if (alvo && typeof MutationObserver !== "undefined") {
            var obs = new MutationObserver(function () { if (bloqueada())
                adicionarBotao(); });
            obs.observe(alvo, { childList: true, subtree: true });
        }
    }
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    else
        iniciar();
})();
