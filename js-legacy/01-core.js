/* GERADO AUTOMATICAMENTE — fonte: js/01-core.js — app 2.5.8.154. Não editar. */
/* Shinobi 1.3.0 — arquivo modular gerado preservando a ordem do app original. */
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
/* ======================================================================
   Código principal do aplicativo
   ====================================================================== */
/* ===== Modal Shinobi: confirmação de uso ===== */
function modalShinobi(titulo, texto, opcoes) {
    opcoes = opcoes || {};
    return new Promise(function (resolve) {
        var overlay = document.createElement('div');
        overlay.className = 'modalShinobiOverlay';
        var somenteOk = opcoes.tipo === 'alerta';
        overlay.innerHTML = "\n      <div class=\"modalShinobiBox\" role=\"dialog\" aria-modal=\"true\">\n        <h3 class=\"modalShinobiTitulo\">".concat(escaparHtmlShinobi(titulo || 'Confirmação'), "</h3>\n        <p class=\"modalShinobiTexto\">").concat(escaparHtmlShinobi(texto || ''), "</p>\n        <div class=\"modalShinobiAcoes ").concat(somenteOk ? 'somenteOk' : '', "\">\n          ").concat(somenteOk ? '' : '<button type="button" class="modalShinobiBtn cancelar" data-resposta="0">Cancelar</button>', "\n          <button type=\"button\" class=\"modalShinobiBtn confirmar\" data-resposta=\"1\">").concat(somenteOk ? 'OK' : 'Confirmar', "</button>\n        </div>\n      </div>\n    ");
        document.body.appendChild(overlay);
        overlay.querySelectorAll('[data-resposta]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var resposta = btn.dataset.resposta === '1';
                overlay.remove();
                resolve(resposta);
            });
        });
    });
}
function avisoShinobi(titulo, texto) {
    return modalShinobi(titulo, texto, { tipo: 'alerta' });
}
function confirmarUsoAcao(tipo, nome, detalhe) {
    var texto = "".concat(nome || 'Ação').concat(detalhe ? '\n\n' + detalhe : '');
    return modalShinobi("Usar ".concat(tipo, "?"), texto);
}
function escaparHtmlShinobi(valor) {
    return String(valor == null ? "" : valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function normalizarImagemJutsuSegura(valor) {
    var imagem = String(valor || "").trim();
    if (!/^(?:blob:|data:image\/(?:png|jpe?g|webp|gif);base64,)/i.test(imagem))
        return "";
    return imagem.replace(/[\r\n'"()\\]/g, function (caractere) { return encodeURIComponent(caractere); });
}
function lerEstadoFichaSeguro(chave) {
    try {
        var bruto = localStorage.getItem(chave);
        if (!bruto)
            return {};
        var dados = JSON.parse(bruto);
        return dados && typeof dados === "object" && !Array.isArray(dados) ? dados : {};
    }
    catch (erro) {
        console.warn("A ficha salva contém dados inválidos e foi aberta em modo seguro.", erro);
        return {};
    }
}
/* ===== Versão interna do app ===== */
var APP_VERSION = window.APP_VERSION || "2.5.8.62";
window.APP_VERSION = APP_VERSION;
/* Ficha Ninja RPG — otimização v2 */
/* ===== Confirmação transacional de campos persistentes — v2.5.8.8 ===== */
var shinobiCamposConfirmando = new WeakSet();
function shinobiValorCampo(campo) {
    var _a;
    return (campo === null || campo === void 0 ? void 0 : campo.type) === "checkbox" ? Boolean(campo.checked) : String((_a = campo === null || campo === void 0 ? void 0 : campo.value) !== null && _a !== void 0 ? _a : "");
}
function shinobiSerializarValorCampo(valor) {
    try {
        return JSON.stringify(valor);
    }
    catch (_erro) {
        return String(valor !== null && valor !== void 0 ? valor : "");
    }
}
function shinobiDesserializarValorCampo(valor, padrao) {
    if (padrao === void 0) { padrao = ""; }
    if (valor == null)
        return padrao;
    try {
        return JSON.parse(valor);
    }
    catch (_erro) {
        return valor;
    }
}
function shinobiRotuloCampo(campo) {
    var _a, _b;
    var mapa = {
        pv: "PV", pvMax: "PV máximo", chakra: "Chakra", chakraMax: "Chakra máximo",
        ca: "CA", cd: "CD", nivel: "Nível", rank: "Rank", velocidade: "Velocidade",
        forca: "Força", destreza: "Destreza", constituicao: "Constituição",
        inteligencia: "Inteligência", sabedoria: "Sabedoria", carisma: "Carisma",
        iniciativa: "Iniciativa", proficiencia: "Proficiência"
    };
    var chave = String(((_a = campo === null || campo === void 0 ? void 0 : campo.dataset) === null || _a === void 0 ? void 0 : _a.save) || "");
    if (mapa[chave])
        return mapa[chave];
    if (campo === null || campo === void 0 ? void 0 : campo.id) {
        var label = document.querySelector("label[for=\"".concat(String(campo.id).replace(/"/g, '\\"'), "\"]"));
        var textoLabel = String((label === null || label === void 0 ? void 0 : label.textContent) || "").trim().replace(/\s+/g, " ");
        if (textoLabel)
            return textoLabel.slice(0, 70);
    }
    var nome = String(((_b = campo === null || campo === void 0 ? void 0 : campo.getAttribute) === null || _b === void 0 ? void 0 : _b.call(campo, "aria-label")) || (campo === null || campo === void 0 ? void 0 : campo.name) || (campo === null || campo === void 0 ? void 0 : campo.placeholder) || chave || "Campo").trim();
    return nome || "Campo";
}
function shinobiTextoValorCampo(valor) {
    if (typeof valor === "boolean")
        return valor ? "Sim" : "Não";
    var texto = String(valor !== null && valor !== void 0 ? valor : "").trim();
    return texto || "vazio";
}
function shinobiAtualizarVisualSemSalvar() {
    var _a;
    try {
        atualizarPlacar();
    }
    catch (_erro) { }
    try {
        atualizarPerfil();
    }
    catch (_erro) { }
    try {
        (_a = window.atualizarDefesasTotaisBatalha) === null || _a === void 0 ? void 0 : _a.call(window);
    }
    catch (_erro) { }
}
function shinobiRegistrarEdicaoCampo(evento) {
    var _a;
    var campo = evento === null || evento === void 0 ? void 0 : evento.currentTarget;
    if (!((_a = campo === null || campo === void 0 ? void 0 : campo.dataset) === null || _a === void 0 ? void 0 : _a.save))
        return;
    var atual = shinobiSerializarValorCampo(shinobiValorCampo(campo));
    var confirmado = campo.dataset.shinobiValorConfirmado;
    if (confirmado == null)
        campo.dataset.shinobiValorConfirmado = atual;
    campo.dataset.shinobiEdicaoPendente = atual === campo.dataset.shinobiValorConfirmado ? "0" : "1";
    shinobiAtualizarVisualSemSalvar();
}
function shinobiConfirmarEdicaoCampo(evento) {
    return __awaiter(this, void 0, void 0, function () {
        var campo, novo, novoSerializado, antigo, antigoSerializado, rotulo, ok;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    campo = evento === null || evento === void 0 ? void 0 : evento.currentTarget;
                    if (!((_a = campo === null || campo === void 0 ? void 0 : campo.dataset) === null || _a === void 0 ? void 0 : _a.save) || shinobiCamposConfirmando.has(campo))
                        return [2 /*return*/];
                    novo = shinobiValorCampo(campo);
                    novoSerializado = shinobiSerializarValorCampo(novo);
                    antigo = shinobiDesserializarValorCampo(campo.dataset.shinobiValorConfirmado, campo.type === "checkbox" ? Boolean(estado === null || estado === void 0 ? void 0 : estado[campo.dataset.save]) : String((_b = estado === null || estado === void 0 ? void 0 : estado[campo.dataset.save]) !== null && _b !== void 0 ? _b : ""));
                    antigoSerializado = shinobiSerializarValorCampo(antigo);
                    if (novoSerializado === antigoSerializado) {
                        campo.dataset.shinobiEdicaoPendente = "0";
                        return [2 /*return*/];
                    }
                    shinobiCamposConfirmando.add(campo);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, , 3, 4]);
                    rotulo = shinobiRotuloCampo(campo);
                    return [4 /*yield*/, modalShinobi("Confirmar alteração?", "".concat(rotulo, ": ").concat(shinobiTextoValorCampo(antigo), " \u2192 ").concat(shinobiTextoValorCampo(novo)))];
                case 2:
                    ok = _c.sent();
                    if (!ok) {
                        if (campo.type === "checkbox")
                            campo.checked = Boolean(antigo);
                        else
                            campo.value = String(antigo !== null && antigo !== void 0 ? antigo : "");
                        campo.dataset.shinobiEdicaoPendente = "0";
                        shinobiAtualizarVisualSemSalvar();
                        return [2 /*return*/];
                    }
                    campo.dataset.shinobiValorConfirmado = novoSerializado;
                    campo.dataset.shinobiEdicaoPendente = "0";
                    salvar({
                        confirmada: true,
                        origem: "campo",
                        campo: campo.dataset.save,
                        antes: antigo,
                        depois: novo,
                        motivo: "alteracao-confirmada"
                    });
                    return [3 /*break*/, 4];
                case 3:
                    shinobiCamposConfirmando.delete(campo);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var CHAVE_BASE = "ficha_ninja_app_v2", CHAVE_LISTA = "ficha_ninja_lista_v1", CHAVE_ATIVA = "ficha_ninja_ativa_v1";
function limparNomeFicha(nome) { return String(nome || "Principal").trim().replace(/[^\w\-À-ÿ ]+/g, "").slice(0, 32) || "Principal"; }
function lerListaFichas() { var lista = ["Principal"]; try {
    var salva = JSON.parse(localStorage.getItem(CHAVE_LISTA) || '["Principal"]');
    Array.isArray(salva) && salva.length && (lista = salva);
}
catch (e) {
    lista = ["Principal"];
} try {
    Object.keys(localStorage).forEach(function (k) { if (k.startsWith(CHAVE_BASE + "__")) {
        var nome = k.replace(CHAVE_BASE + "__", "");
        nome && !lista.includes(nome) && lista.push(nome);
    } });
}
catch (e) { } return lista = __spreadArray([], __read(new Set(lista.map(limparNomeFicha))), false), lista.includes("Principal") || lista.unshift("Principal"), localStorage.setItem(CHAVE_LISTA, JSON.stringify(lista)), lista; }
var fichas = lerListaFichas(), fichaAtual = limparNomeFicha(localStorage.getItem(CHAVE_ATIVA) || "Principal");
function chaveFicha(nome) {
    if (nome === void 0) { nome = fichaAtual; }
    var ficha = limparNomeFicha(nome);
    return "Principal" === ficha ? CHAVE_BASE : CHAVE_BASE + "__" + ficha;
}
fichas.includes(fichaAtual) || (fichas.push(fichaAtual), localStorage.setItem(CHAVE_LISTA, JSON.stringify(fichas)));
var CHAVE = chaveFicha(), estado = lerEstadoFichaSeguro(CHAVE), camposSalvaveisCache = null, timerSalvar = null, avisoArmazenamentoExibido = !1;
/* Ponte estável entre o estado lexical do core e módulos carregados depois.
   Variáveis declaradas com `let` no escopo global não viram propriedades de
   `window`. O motor online historicamente consulta esses nomes via window; sem
   essa ponte ele pode acreditar que a primeira ficha (Principal) está ativa
   mesmo quando a interface está em outra ficha, como Pipo. */
(function exporEstadoLocalShinobi() {
    var descritores = {
        fichas: { get: function () { return fichas; }, set: function (v) { if (Array.isArray(v))
                fichas = v; } },
        fichaAtual: { get: function () { return fichaAtual; }, set: function (v) { fichaAtual = limparNomeFicha(v); } },
        CHAVE: { get: function () { return CHAVE; }, set: function (v) { CHAVE = String(v || chaveFicha()); } },
        estado: { get: function () { return estado; }, set: function (v) { if (v && typeof v === "object" && !Array.isArray(v))
                estado = v; } }
    };
    Object.entries(descritores).forEach(function (_a) {
        var _b = __read(_a, 2), nome = _b[0], acesso = _b[1];
        try {
            var atual = Object.getOwnPropertyDescriptor(window, nome);
            if (!atual || atual.configurable !== false)
                Object.defineProperty(window, nome, __assign(__assign({}, acesso), { configurable: true }));
        }
        catch (_erro) { }
    });
})();
function obterCamposSalvaveis() { var campos = Array.from(document.querySelectorAll("[data-save]")); return camposSalvaveisCache && camposSalvaveisCache.length === campos.length || (camposSalvaveisCache = campos), camposSalvaveisCache; }
function prepararEstadoParaPersistenciaLocal(valor) { var saida = valor; try {
    if (typeof window.shinobiPrepararEstadoPersistencia === "function") {
        var preparado = window.shinobiPrepararEstadoPersistencia(valor);
        preparado && typeof preparado === "object" && !Array.isArray(preparado) && (saida = preparado);
    }
}
catch (_erroPreparacao) { } return saida; }
function persistirEstadoLocal(contexto) {
    if (contexto === void 0) { contexto = {}; }
    if (window.__shinobiSheetTransition === true)
        return !1;
    try {
        var estadoPersistido_1 = prepararEstadoParaPersistenciaLocal(estado);
        localStorage.setItem(CHAVE, JSON.stringify(estadoPersistido_1));
        if (contexto.emitir !== false) {
            try {
                var confirmada_1 = contexto.confirmada === true, lista = Array.isArray(contexto.campos) ? contexto.campos : [contexto.campo], campos = __spreadArray([], __read(new Set(lista.map(function (valor) { return String(valor || "").trim(); }).filter(Boolean))), false), eventos_1 = campos.length ? campos : [""];
                eventos_1.forEach(function (campo) { var depois = Object.prototype.hasOwnProperty.call(contexto, "depois") && eventos_1.length === 1 ? contexto.depois : (campo ? estadoPersistido_1 === null || estadoPersistido_1 === void 0 ? void 0 : estadoPersistido_1[campo] : undefined); window.dispatchEvent(new CustomEvent("shinobi:ficha-persistida", { detail: { sheetName: String(fichaAtual || "Principal"), savedAt: Date.now(), confirmada: confirmada_1, origem: String(contexto.origem || "acao"), campo: campo, antes: eventos_1.length === 1 ? contexto.antes : undefined, depois: depois, motivo: String(contexto.motivo || "persistencia") } })); });
            }
            catch (_erroEvento) { }
        }
        return !0;
    }
    catch (erro) {
        return avisoArmazenamentoExibido || (avisoArmazenamentoExibido = !0, alert("O armazenamento da ficha está cheio. Remova algumas imagens de fundo dos jutsus ou use imagens menores para continuar salvando.")), !1;
    }
}
function sincronizarEstadoDosCampos(opcoes) {
    if (opcoes === void 0) { opcoes = {}; }
    var incluirPendentes = opcoes.incluirPendentes === true;
    obterCamposSalvaveis().forEach(function (c) { if (!incluirPendentes && c.dataset.shinobiEdicaoPendente === "1")
        return; estado[c.dataset.save] = "checkbox" === c.type ? c.checked : c.value; });
}
function atualizarValoresConfirmadosDosCampos() { obterCamposSalvaveis().forEach(function (c) { if (c.dataset.shinobiEdicaoPendente === "1")
    return; c.dataset.shinobiValorConfirmado = shinobiSerializarValorCampo(shinobiValorCampo(c)); c.dataset.shinobiEdicaoPendente = "0"; }); }
function salvar(contexto) {
    if (contexto === void 0) { contexto = {}; }
    timerSalvar && (clearTimeout(timerSalvar), timerSalvar = null), sincronizarEstadoDosCampos(), persistirEstadoLocal(contexto), atualizarValoresConfirmadosDosCampos(), atualizarPlacar(), atualizarPerfil();
}
function salvarAgendado() { timerSalvar && clearTimeout(timerSalvar), timerSalvar = setTimeout(function () { timerSalvar = null; shinobiAtualizarVisualSemSalvar(); }, 180); }
function salvarManual() { salvar({ confirmada: true, origem: "manual", motivo: "salvamento-manual" }), alert("Ficha salva!"); }
function carregar() { obterCamposSalvaveis().forEach(function (c) { void 0 !== estado[c.dataset.save] && ("checkbox" === c.type ? c.checked = estado[c.dataset.save] : c.value = estado[c.dataset.save]), c.dataset.shinobiValorConfirmado = shinobiSerializarValorCampo(shinobiValorCampo(c)), c.dataset.shinobiEdicaoPendente = "0", c.dataset.saveListener || (c.dataset.saveListener = "1", c.addEventListener("input", shinobiRegistrarEdicaoCampo), c.addEventListener("change", shinobiConfirmarEdicaoCampo)); }), renderizarJutsus(), renderizarArmados(), renderizarNaturezas(), renderizarKekkeiGenkai(), renderizarInventario(), atualizarPlacar(), atualizarPerfil(), carregarAvatarSalvo(), carregarFundoPerfilSalvo(); }
function abrirPagina(id, botao) { var pagina = document.getElementById(id); if (!pagina)
    return; document.querySelectorAll(".pagina").forEach(function (p) { return p.classList.remove("ativa"); }), pagina.classList.add("ativa"); var botoes = Array.from(document.querySelectorAll(".menu button")); botoes.forEach(function (b) { return b.classList.remove("ativo"); }); var botaoFinal = botao || botoes.find(function (b) { var onclick = b.getAttribute("onclick") || ""; return onclick.includes("'" + id + "'") || onclick.includes('"' + id + '"'); }); if (botaoFinal && botaoFinal.classList.add("ativo"), window.abasSwipe) {
    var idx = window.abasSwipe.indexOf(id);
    idx >= 0 && (window.abaSwipeAtual = idx);
} }
function atualizarPlacar() { var _a, _b; var pv = ((_a = document.getElementById("pv")) === null || _a === void 0 ? void 0 : _a.value) || 0, chakra = ((_b = document.getElementById("chakra")) === null || _b === void 0 ? void 0 : _b.value) || 0; var pvView = document.getElementById("pvView"), chakraView = document.getElementById("chakraView"); pvView && (pvView.textContent = pv), chakraView && (chakraView.textContent = chakra), atualizarHUD(), atualizarModificadoresBatalha(); }
function alterarValor(id, valor) { var c = document.getElementById(id); if (!c)
    return; var atual = Number(c.value || 0), delta = Number(valor); c.value = Math.max(0, (Number.isFinite(atual) ? atual : 0) + (Number.isFinite(delta) ? delta : 0)), c.dispatchEvent(new Event("input", { bubbles: !0 })); }
function log(txt) { var l = document.getElementById("log"); if (!l)
    return; "Nada aconteceu ainda." === l.textContent.trim() && (l.innerHTML = ""), l.innerHTML = "• " + escaparHtmlShinobi(txt) + "<br>" + l.innerHTML; }
function registrarLog(txt) { log(txt); }
function aplicarDano() {
    return __awaiter(this, void 0, void 0, function () {
        var dano, pv, atual, novo, ok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dano = Number(document.getElementById("danoBatalha").value || 0);
                    pv = document.getElementById("pv");
                    atual = Number((pv === null || pv === void 0 ? void 0 : pv.value) || 0);
                    novo = Math.max(0, atual - dano);
                    return [4 /*yield*/, confirmarUsoAcao("ação de batalha", "Aplicar dano", "Dano: ".concat(dano, "\nPV atual: ").concat(atual, "\nPV ap\u00F3s dano: ").concat(novo))];
                case 1:
                    ok = _a.sent();
                    if (!ok)
                        return [2 /*return*/];
                    if (pv)
                        pv.value = novo;
                    salvar({ confirmada: true, origem: "batalha", campo: "pv", antes: atual, depois: novo, motivo: "alteracao-confirmada" });
                    log("Dano recebido: " + dano);
                    return [2 /*return*/];
            }
        });
    });
}
function gastarChakra() {
    return __awaiter(this, void 0, void 0, function () {
        var custo, ch, atual, novo, ok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    custo = Number(document.getElementById("custoBatalha").value || 0);
                    ch = document.getElementById("chakra");
                    atual = Number((ch === null || ch === void 0 ? void 0 : ch.value) || 0);
                    novo = Math.max(0, atual - custo);
                    return [4 /*yield*/, confirmarUsoAcao("ação de batalha", "Gastar chakra", "Custo: ".concat(custo, "\nChakra atual: ").concat(atual, "\nChakra ap\u00F3s gasto: ").concat(novo))];
                case 1:
                    ok = _a.sent();
                    if (!ok)
                        return [2 /*return*/];
                    if (ch)
                        ch.value = novo;
                    salvar({ confirmada: true, origem: "batalha", campo: "chakra", antes: atual, depois: novo, motivo: "alteracao-confirmada" });
                    log("Chakra gasto: " + custo);
                    return [2 /*return*/];
            }
        });
    });
}
function curarPV(v) {
    return __awaiter(this, void 0, void 0, function () {
        var pv, atual, pvMax, max, novo, ok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pv = document.getElementById("pv");
                    atual = Number((pv === null || pv === void 0 ? void 0 : pv.value) || 0);
                    pvMax = document.getElementById("pvMax");
                    max = Number((pvMax === null || pvMax === void 0 ? void 0 : pvMax.value) || 0);
                    novo = max > 0 ? Math.min(max, atual + v) : atual + v;
                    return [4 /*yield*/, confirmarUsoAcao("recuperação", "Recuperar PV", "Recupera\u00E7\u00E3o: +".concat(v, " PV\nPV atual: ").concat(atual, "\nPV ap\u00F3s recupera\u00E7\u00E3o: ").concat(novo))];
                case 1:
                    ok = _a.sent();
                    if (!ok)
                        return [2 /*return*/];
                    if (pv)
                        pv.value = novo;
                    salvar({ confirmada: true, origem: "batalha", campo: "pv", antes: atual, depois: novo, motivo: "alteracao-confirmada" });
                    log("Recuperou " + v + " PV");
                    return [2 /*return*/];
            }
        });
    });
}
function recuperarChakra(v) {
    return __awaiter(this, void 0, void 0, function () {
        var ch, atual, chakraMax, max, novo, ok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ch = document.getElementById("chakra");
                    atual = Number((ch === null || ch === void 0 ? void 0 : ch.value) || 0);
                    chakraMax = document.getElementById("chakraMax");
                    max = Number((chakraMax === null || chakraMax === void 0 ? void 0 : chakraMax.value) || 0);
                    novo = max > 0 ? Math.min(max, atual + v) : atual + v;
                    return [4 /*yield*/, confirmarUsoAcao("recuperação", "Recuperar chakra", "Recupera\u00E7\u00E3o: +".concat(v, " chakra\nChakra atual: ").concat(atual, "\nChakra ap\u00F3s recupera\u00E7\u00E3o: ").concat(novo))];
                case 1:
                    ok = _a.sent();
                    if (!ok)
                        return [2 /*return*/];
                    if (ch)
                        ch.value = novo;
                    salvar({ confirmada: true, origem: "batalha", campo: "chakra", antes: atual, depois: novo, motivo: "alteracao-confirmada" });
                    log("Recuperou " + v + " chakra");
                    return [2 /*return*/];
            }
        });
    });
}
function resetarBatalha() {
    return __awaiter(this, void 0, void 0, function () {
        var ok, pv, pvMax, chakra, chakraMax, dano, custo, logBox;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, confirmarUsoAcao("reset", "Resetar batalha", "PV e chakra voltam para o máximo.\nDano, custo, bônus temporários e histórico serão limpos.")];
                case 1:
                    ok = _a.sent();
                    if (!ok)
                        return [2 /*return*/];
                    pv = document.getElementById("pv"), pvMax = document.getElementById("pvMax"), chakra = document.getElementById("chakra"), chakraMax = document.getElementById("chakraMax");
                    if (pv)
                        pv.value = (pvMax === null || pvMax === void 0 ? void 0 : pvMax.value) || 0;
                    if (chakra)
                        chakra.value = (chakraMax === null || chakraMax === void 0 ? void 0 : chakraMax.value) || 0;
                    dano = document.getElementById("danoBatalha");
                    custo = document.getElementById("custoBatalha");
                    logBox = document.getElementById("log");
                    if (dano)
                        dano.value = 1;
                    if (custo)
                        custo.value = 1;
                    if (logBox)
                        logBox.innerHTML = "Nada aconteceu ainda.";
                    salvar();
                    shinobiZerarBonusBatalhaPersistidos("todos");
                    if (typeof bonusBatalhaAtributos !== "undefined") {
                        Object.keys(bonusBatalhaAtributos).forEach(function (k) { return bonusBatalhaAtributos[k] = 0; });
                    }
                    if (typeof atualizarModsBatalhaComBonus === "function")
                        atualizarModsBatalhaComBonus();
                    if (typeof atualizarDefesasTotaisBatalha === "function")
                        atualizarDefesasTotaisBatalha();
                    return [4 /*yield*/, avisoShinobi("Batalha resetada", "A área de batalha foi restaurada.")];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var shinobiJutsuFocoPendente = null;
var shinobiJutsuFocoLimpezaTimer = null;
function fixarAbaJutsus() {
    try {
        if (typeof window.abrirPagina === "function")
            window.abrirPagina("jutsus");
        else if (typeof abrirPagina === "function")
            abrirPagina("jutsus");
    }
    catch (_erro) { }
}
function cancelarFocoJutsuPendente(i) {
    if (!shinobiJutsuFocoPendente)
        return;
    if (Number.isInteger(Number(i))) {
        var indice = Number(i), jutsu = (estado.jutsus || [])[indice];
        var id = String((jutsu === null || jutsu === void 0 ? void 0 : jutsu.jutsuId) || "").trim();
        var mesmoId = id && id === shinobiJutsuFocoPendente.jutsuId;
        var mesmoIndice = !shinobiJutsuFocoPendente.jutsuId && indice === shinobiJutsuFocoPendente.indiceInicial;
        if (!mesmoId && !mesmoIndice)
            return;
    }
    shinobiJutsuFocoPendente = null;
    if (shinobiJutsuFocoLimpezaTimer) {
        clearTimeout(shinobiJutsuFocoLimpezaTimer);
        shinobiJutsuFocoLimpezaTimer = null;
    }
}
function indiceJutsuFocoPendente() {
    var alvo = shinobiJutsuFocoPendente;
    if (!alvo)
        return -1;
    var lista = Array.isArray(estado.jutsus) ? estado.jutsus : [];
    if (alvo.jutsuId) {
        var porId = lista.findIndex(function (j) { return String((j === null || j === void 0 ? void 0 : j.jutsuId) || "").trim() === alvo.jutsuId; });
        if (porId >= 0)
            return porId;
    }
    var fallback = Number(alvo.indiceInicial);
    return Number.isInteger(fallback) && fallback >= 0 && fallback < lista.length ? fallback : -1;
}
function ativarAbaJutsusSemRolar() {
    var _a, _b;
    var pagina = document.getElementById("jutsus");
    if (!pagina)
        return;
    var main = document.querySelector("main");
    if (!((_a = main === null || main === void 0 ? void 0 : main.classList) === null || _a === void 0 ? void 0 : _a.contains("scrollPages"))) {
        fixarAbaJutsus();
        return;
    }
    document.querySelectorAll(".pagina").forEach(function (p) { return p.classList.toggle("ativa", p === pagina); });
    var botoes = Array.from(document.querySelectorAll(".menu button"));
    botoes.forEach(function (b) { return b.classList.remove("ativo"); });
    var botao = botoes.find(function (b) { var onclick = b.getAttribute("onclick") || ""; return onclick.includes("'jutsus'") || onclick.includes('"jutsus"'); });
    (_b = botao === null || botao === void 0 ? void 0 : botao.classList) === null || _b === void 0 ? void 0 : _b.add("ativo");
    if (Array.isArray(window.abasSwipe)) {
        var indice = window.abasSwipe.indexOf("jutsus");
        if (indice >= 0)
            window.abaSwipeAtual = indice;
    }
}
function localizarCardJutsuFoco(alvo, indice) {
    var e_1, _a;
    var _b, _c;
    var lista = document.getElementById("listaJutsus");
    if (!lista)
        return null;
    var id = String((alvo === null || alvo === void 0 ? void 0 : alvo.jutsuId) || "").trim();
    if (id) {
        var cards = lista.querySelectorAll(".jutsuListaCard[data-jutsu-id]");
        try {
            for (var cards_1 = __values(cards), cards_1_1 = cards_1.next(); !cards_1_1.done; cards_1_1 = cards_1.next()) {
                var card = cards_1_1.value;
                if (String(((_b = card === null || card === void 0 ? void 0 : card.dataset) === null || _b === void 0 ? void 0 : _b.jutsuId) || "") === id)
                    return card;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (cards_1_1 && !cards_1_1.done && (_a = cards_1.return)) _a.call(cards_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    return lista.querySelector(".jutsuListaCard[data-jutsu-index=\"".concat(indice, "\"]")) || ((_c = lista.querySelectorAll(".jutsuListaCard")) === null || _c === void 0 ? void 0 : _c[indice]) || null;
}
function rolarAteCardJutsu(card, alvo) {
    var _a, _b, _c;
    if (!card)
        return false;
    ativarAbaJutsusSemRolar();
    var alvoVisual = card.querySelector(".jutsuDetalhesCompactos") || card;
    var rect = alvoVisual.getBoundingClientRect();
    if (!Number.isFinite(rect.top) || rect.height <= 0 || ((_a = alvoVisual.getClientRects) === null || _a === void 0 ? void 0 : _a.call(alvoVisual).length) === 0)
        return false;
    if (alvo && !alvo.scrollConcluido) {
        var alturaTopo = ((_c = (_b = document.querySelector(".topo")) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect) === null || _c === void 0 ? void 0 : _c.call(_b).height) || 0;
        var margem = Math.max(12, alturaTopo + 12);
        var destino = Math.max(0, (window.scrollY || window.pageYOffset || 0) + rect.top - margem);
        /* Scroll imediato: o smooth podia ser interrompido pelo reagrupamento
           síncrono/assíncrono das cartas e deixava a tela parada no topo da aba. */
        try {
            window.scrollTo({ top: destino, behavior: "auto" });
        }
        catch (_erro) {
            try {
                window.scrollTo(0, destino);
            }
            catch (_erro2) { }
        }
        alvo.scrollConcluido = true;
    }
    var resumo = card.querySelector(".jutsuLinhaResumo");
    if (resumo && typeof resumo.focus === "function") {
        try {
            resumo.focus({ preventScroll: true });
        }
        catch (_erro) {
            try {
                resumo.focus();
            }
            catch (_erro2) { }
        }
    }
    return true;
}
function abrirGrupoDoJutsuParaFoco(indice) {
    var jutsu = Array.isArray(estado.jutsus) ? estado.jutsus[indice] : null;
    var organizacao = window.ShinobiOrganizacaoRetratil;
    if (!jutsu || !organizacao)
        return false;
    try {
        if (typeof organizacao.organizarJutsus === "function")
            organizacao.organizarJutsus();
        var grupo = typeof organizacao.grupoDoJutsu === "function" ? organizacao.grupoDoJutsu(jutsu) : "";
        if (grupo && typeof organizacao.abrirGrupoJutsu === "function") {
            organizacao.abrirGrupoJutsu(grupo, { rolar: false });
            return true;
        }
    }
    catch (_erro) { }
    return false;
}
function aplicarFocoJutsuPendente() {
    var alvo = shinobiJutsuFocoPendente;
    if (!alvo)
        return false;
    if (Date.now() > alvo.expiraEm) {
        cancelarFocoJutsuPendente();
        return false;
    }
    var indice = indiceJutsuFocoPendente();
    if (indice < 0)
        return false;
    estado.jutsusAbertos = estado.jutsusAbertos || {};
    var precisaRender = !estado.jutsusAbertos[indice];
    estado.jutsusAbertos[indice] = true;
    if (precisaRender) {
        try {
            renderizarJutsus();
        }
        catch (_erro) { }
    }
    /* A organização retrátil move as cartas para grupos por elemento. O card pode
       estar aberto no estado e ainda assim invisível porque o grupo pai está
       fechado. Antes de calcular o scroll, abra explicitamente o grupo da carta
       recém-criada e limpe filtros que possam escondê-la. */
    abrirGrupoDoJutsuParaFoco(indice);
    var localizar = function () { return rolarAteCardJutsu(localizarCardJutsuFoco(alvo, indice), alvo); };
    if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(function () { return requestAnimationFrame(localizar); });
    else
        setTimeout(localizar, 0);
    return true;
}
function direcionarJutsuRecemCriado(i, jutsuId) {
    if (jutsuId === void 0) { jutsuId = ""; }
    cancelarFocoJutsuPendente();
    shinobiJutsuFocoPendente = {
        jutsuId: String(jutsuId || "").trim(),
        indiceInicial: Number(i),
        expiraEm: Date.now() + 4000,
        scrollConcluido: false
    };
    [0, 80, 180, 360, 700, 1200].forEach(function (atraso) { return setTimeout(aplicarFocoJutsuPendente, atraso); });
    shinobiJutsuFocoLimpezaTimer = setTimeout(function () { return cancelarFocoJutsuPendente(); }, 4300);
}
if (!window.__shinobiJutsuFocoRealtimeV128) {
    window.__shinobiJutsuFocoRealtimeV128 = true;
    window.addEventListener("shinobi:realtime-colecao-aplicada", function (evento) {
        var _a;
        if (String(((_a = evento === null || evento === void 0 ? void 0 : evento.detail) === null || _a === void 0 ? void 0 : _a.collection) || "") !== "jutsus" || !shinobiJutsuFocoPendente)
            return;
        setTimeout(aplicarFocoJutsuPendente, 0);
        setTimeout(aplicarFocoJutsuPendente, 120);
    });
}
function adicionarJutsu() {
    var _a, _b;
    estado.jutsus = estado.jutsus || [];
    var indice = estado.jutsus.length;
    estado.jutsus.push({ nome: "", rank: "", elemento: "katon", bonusAcerto: "", dano: "", bonusDano: "", custo: "", alcance: "", raio: "", duracao: "", acao: "", resistencia: "", alvo: "", descricao: "", imagem: "" });
    estado.jutsusAbertos = estado.jutsusAbertos || {};
    estado.jutsusAbertos[indice] = true;
    persistirListas("jutsus");
    var jutsuId = String(((_b = (_a = estado.jutsus) === null || _a === void 0 ? void 0 : _a[indice]) === null || _b === void 0 ? void 0 : _b.jutsuId) || "").trim();
    direcionarJutsuRecemCriado(indice, jutsuId);
}
function adicionarArmado() { estado.armados = estado.armados || [], estado.armados.push({ nome: "", tipo: "armado", bonusAcerto: "", dano: "", bonusDano: "", obs: "", itemInventario: "", quantidadeUso: "1" }), persistirListas("armados"); }
function removerJutsu(i) {
    return __awaiter(this, void 0, void 0, function () { var j, nome, ok, _a; return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                j = (estado.jutsus || [])[i];
                if (!j)
                    return [2 /*return*/];
                nome = String(j.nome || "Jutsu");
                if (!(typeof modalShinobi === "function")) return [3 /*break*/, 2];
                return [4 /*yield*/, modalShinobi("Remover jutsu?", "Remover \u201C".concat(nome, "\u201D da ficha?"))];
            case 1:
                _a = _b.sent();
                return [3 /*break*/, 3];
            case 2:
                _a = confirm("Remover \"".concat(nome, "\" da ficha?"));
                _b.label = 3;
            case 3:
                ok = _a;
                if (!ok)
                    return [2 /*return*/];
                estado.jutsus.splice(i, 1), estado.jutsusAbertos = {}, persistirListas("jutsus");
                return [2 /*return*/];
        }
    }); });
}
function removerArmado(i) {
    return __awaiter(this, void 0, void 0, function () { var a, nome, ok, _a; return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                a = (estado.armados || [])[i];
                if (!a)
                    return [2 /*return*/];
                nome = String(a.nome || "Ataque");
                if (!(typeof modalShinobi === "function")) return [3 /*break*/, 2];
                return [4 /*yield*/, modalShinobi("Remover ataque?", "Remover \u201C".concat(nome, "\u201D da ficha?"))];
            case 1:
                _a = _b.sent();
                return [3 /*break*/, 3];
            case 2:
                _a = confirm("Remover \"".concat(nome, "\" da ficha?"));
                _b.label = 3;
            case 3:
                ok = _a;
                if (!ok)
                    return [2 /*return*/];
                estado.armados.splice(i, 1), estado.ataquesAbertos = {}, persistirListas("armados");
                return [2 /*return*/];
        }
    }); });
}
function persistirSemRender(contexto) {
    if (contexto === void 0) { contexto = {}; }
    persistirEstadoLocal(contexto);
}
function persistirListas(campo) { persistirEstadoLocal({ confirmada: true, origem: "colecao", campo: String(campo || ""), motivo: "alteracao-confirmada" }), renderizarJutsus(), renderizarArmados(); }
function dadosElementoJutsu(elemento) { var mapa = { katon: { nome: "KATON", icone: "🔥", classe: "jutsu-katon" }, raiton: { nome: "RAITON", icone: "⚡", classe: "jutsu-raiton" }, fuuton: { nome: "FUUTON", icone: "🌪️", classe: "jutsu-fuuton" }, suiton: { nome: "SUITON", icone: "💧", classe: "jutsu-suiton" }, doton: { nome: "DOTON", icone: "🪨", classe: "jutsu-doton" }, yin: { nome: "YINTON", icone: "🌑", classe: "jutsu-yin" }, yang: { nome: "YOUTON", icone: "☀️", classe: "jutsu-yang" }, neutro: { nome: "NEUTRO", icone: "✨", classe: "jutsu-neutro" } }; return mapa[elemento] || mapa.neutro; }
function limparNumeroDano(valor) { var texto = String(valor || "").trim().replace(",", "."); if (!texto)
    return 0; var match = texto.match(/[-+]?\d+(\.\d+)?/); return match ? Number(match[0]) : 0; }
function formatarDanoTotal(dano, bonus) { var danoTexto = String(dano || "").trim(), bonusTexto = String(bonus || "").trim(), bonusNum = limparNumeroDano(bonusTexto); if (!danoTexto && !bonusTexto)
    return "—"; var danoEhNumero = /^[-+]?\d+([.,]\d+)?$/.test(danoTexto), bonusEhNumero = /^[-+]?\d+([.,]\d+)?$/.test(bonusTexto); return danoEhNumero && bonusEhNumero ? String(limparNumeroDano(danoTexto) + bonusNum) : danoTexto && bonusNum ? danoTexto + " + " + bonusNum : danoTexto || (bonusTexto || "—"); }
function valorJutsu(j, campo, padrao) {
    if (padrao === void 0) { padrao = "—"; }
    return (j && void 0 !== j[campo] ? String(j[campo]).trim() : "") || padrao;
}
function editarCampoJutsuPrompt(i, campo, rotulo, padrao) {
    if (padrao === void 0) { padrao = ""; }
    var j = (estado.jutsus || [])[i];
    if (!j)
        return;
    var atual = j[campo] || "", novo = prompt(rotulo, atual);
    null !== novo && (j[campo] = novo.trim(), persistirSemRender({ confirmada: true, origem: "jutsus", campo: "jutsus", motivo: "alteracao-confirmada" }), renderizarJutsus());
}
function escolherElementoJutsuPrompt(i) { var j = (estado.jutsus || [])[i]; if (!j)
    return; var atual = j.elemento || "katon", escolha = prompt("Escolha o elemento:\n1 - Katon\n2 - Raiton\n3 - Fuuton\n4 - Suiton\n5 - Doton\n6 - Yinton\n7 - Youton\n8 - Neutro\n\nAtual: ".concat(atual), ""); if (null === escolha)
    return; var novo = { 1: "katon", 2: "raiton", 3: "fuuton", 4: "suiton", 5: "doton", 6: "yin", 7: "yang", 8: "neutro" }[String(escolha).trim()] || String(escolha).trim().toLowerCase(); ["katon", "raiton", "fuuton", "suiton", "doton", "yin", "yang", "neutro"].includes(novo) ? (j.elemento = novo, persistirSemRender({ confirmada: true, origem: "jutsus", campo: "jutsus", motivo: "alteracao-confirmada" }), renderizarJutsus()) : alert("Elemento inválido."); }
function jutsuAberto(i) { return estado.jutsusAbertos = estado.jutsusAbertos || {}, !!estado.jutsusAbertos[i]; }
function alternarJutsuAberto(i) {
    estado.jutsusAbertos = estado.jutsusAbertos || {};
    var estavaAberto = !!estado.jutsusAbertos[i];
    estado.jutsusAbertos[i] = !estavaAberto;
    if (estavaAberto)
        cancelarFocoJutsuPendente(i);
    persistirEstadoLocal({ emitir: false, confirmada: true, origem: "ui", motivo: "jutsu-aberto" });
    renderizarJutsus();
    if (estavaAberto) {
        var voltarParaJutsus = function () { return fixarAbaJutsus(); };
        if (typeof requestAnimationFrame === "function")
            requestAnimationFrame(voltarParaJutsus);
        else
            setTimeout(voltarParaJutsus, 0);
    }
}
function renderizarJutsus() { var box = document.getElementById("listaJutsus"); if (!box)
    return; var html = []; (estado.jutsus || []).forEach(function (j, i) { var aberto = jutsuAberto(i), dados = dadosElementoJutsu(j.elemento || "katon"), nome = escaparHtmlShinobi(valorJutsu(j, "nome", "Novo jutsu")), custo = escaparHtmlShinobi(valorJutsu(j, "custo", "0")), rank = escaparHtmlShinobi(valorJutsu(j, "rank", "Rank")), dano = escaparHtmlShinobi(valorJutsu(j, "dano", "—")), totalDano = escaparHtmlShinobi(formatarDanoTotal(j.dano, j.bonusDano)), alcance = escaparHtmlShinobi(valorJutsu(j, "alcance", "—")), raio = escaparHtmlShinobi(valorJutsu(j, "raio", "—")), duracao = escaparHtmlShinobi(valorJutsu(j, "duracao", "—")), bonusAcerto = escaparHtmlShinobi(valorJutsu(j, "bonusAcerto", "—")), bonusDano = escaparHtmlShinobi(valorJutsu(j, "bonusDano", "—")), acao = escaparHtmlShinobi(valorJutsu(j, "acao", "—")), resistencia = escaparHtmlShinobi(valorJutsu(j, "resistencia", "—")), alvo = escaparHtmlShinobi(valorJutsu(j, "alvo", "—")), descricao = escaparHtmlShinobi(valorJutsu(j, "descricao", "Toque para editar efeitos")), imagem = normalizarImagemJutsuSegura(j.imagem), estiloImagem = imagem ? "style=\"background-image:url('".concat(imagem, "')\"") : ""; var jutsuIdAttr = escaparHtmlShinobi(String((j === null || j === void 0 ? void 0 : j.jutsuId) || "")); html.push("\n      <div class=\"jutsuCard jutsuCardCompacto jutsuListaCard ".concat(aberto ? "jutsuAberto" : "", " ").concat(imagem ? "comImagem" : "semImagem", " ").concat(dados.classe, "\" data-jutsu-id=\"").concat(jutsuIdAttr, "\" data-jutsu-index=\"").concat(i, "\">\n        <div class=\"jutsuCartaFundo\" ").concat(estiloImagem, "></div>\n        <button class=\"jutsuLinhaResumo\" onclick=\"alternarJutsuAberto(").concat(i, ")\">\n          <span class=\"jutsuLinhaIcone\">").concat(dados.icone, "</span>\n\n          <span class=\"jutsuLinhaTexto\">\n            <strong>").concat(nome, "</strong>\n            <small>").concat(dados.nome, " \u2022 ").concat(rank, " \u2022 ").concat(custo, " CH</small>\n          </span>\n\n          <span class=\"jutsuLinhaSeta\">").concat(aberto ? "▲" : "▼", "</span>\n        </button>\n\n        <div class=\"jutsuDetalhesCompactos\">\n          <div class=\"jutsuTopo jutsuTopoEditavel\">\n            <button class=\"jutsuIcone jutsuEditavel\" onclick=\"escolherElementoJutsuPrompt(").concat(i, ")\" title=\"Editar elemento\">").concat(dados.icone, "</button>\n\n            <div class=\"jutsuTitulo jutsuNomeEditavel\" onclick=\"editarCampoJutsuPrompt(").concat(i, ",'nome','Nome do jutsu')\">\n              <h3>").concat(nome, "</h3>\n              <span class=\"jutsuElementoLabel\">").concat(dados.nome, "</span>\n            </div>\n\n            <button class=\"jutsuRankPill jutsuEditavel\" onclick=\"editarCampoJutsuPrompt(").concat(i, ",'rank','Rank do jutsu')\">").concat(rank, "</button>\n            <button class=\"jutsuCustoPill jutsuEditavel\" onclick=\"editarCampoJutsuPrompt(").concat(i, ",'custo','Custo de Chakra')\">").concat(custo, " CH</button>\n          </div>\n\n          <div class=\"jutsuCartaImagemAcoes\">\n            <button type=\"button\" onclick=\"abrirUploadImagemJutsu(").concat(i, ")\">\uD83D\uDDBC Fundo da carta</button>\n            <button type=\"button\" onclick=\"removerImagemJutsu(").concat(i, ")\">Remover fundo</button>\n          </div>\n\n          <div class=\"jutsuResumo jutsuResumoEditavel\">\n            <button onclick=\"editarCampoJutsuPrompt(").concat(i, ",'dano','Dano')\"><b>Dano</b>").concat(dano, "</button>\n            <button class=\"danoTotalBox\" onclick=\"editarCampoJutsuPrompt(").concat(i, ",'bonusDano','B\u00F4nus de dano')\"><b>Dano total</b>").concat(totalDano, "</button>\n            <button onclick=\"editarCampoJutsuPrompt(").concat(i, ",'alcance','Alcance')\"><b>Alcance</b>").concat(alcance, "</button>\n            <button onclick=\"editarCampoJutsuPrompt(").concat(i, ",'raio','Raio / \u00C1rea')\"><b>Raio</b>").concat(raio, "</button>\n            <button onclick=\"editarCampoJutsuPrompt(").concat(i, ",'duracao','Dura\u00E7\u00E3o')\"><b>Dura\u00E7\u00E3o</b>").concat(duracao, "</button>\n            <button onclick=\"editarCampoJutsuPrompt(").concat(i, ",'bonusAcerto','B\u00F4nus de acerto')\"><b>Acerto</b>").concat(bonusAcerto, "</button>\n            <button onclick=\"editarCampoJutsuPrompt(").concat(i, ",'bonusDano','B\u00F4nus de dano')\"><b>B\u00F4nus dano</b>").concat(bonusDano, "</button>\n            <button onclick=\"editarCampoJutsuPrompt(").concat(i, ",'acao','Tipo de a\u00E7\u00E3o')\"><b>A\u00E7\u00E3o</b>").concat(acao, "</button>\n            <button onclick=\"editarCampoJutsuPrompt(").concat(i, ",'resistencia','Teste / Resist\u00EAncia')\"><b>Teste</b>").concat(resistencia, "</button>\n            <button onclick=\"editarCampoJutsuPrompt(").concat(i, ",'alvo','Alvo')\"><b>Alvo</b>").concat(alvo, "</button>\n            <button class=\"jutsuResumoFull\" onclick=\"editarCampoJutsuPrompt(").concat(i, ",'descricao','Outros b\u00F4nus / efeitos')\"><b>Efeitos</b>").concat(descricao, "</button>\n          </div>\n\n          <div class=\"jutsuAcoes jutsuAcoesCompactas\">\n            <button class=\"btn btnUsarJutsu\" onclick=\"usarJutsu(").concat(i, ")\">USAR JUTSU</button>\n            <button class=\"btn perigo btnRemoverJutsu\" onclick=\"removerJutsu(").concat(i, ")\">Remover</button>\n          </div>\n        </div>\n      </div>\n    ")); }), box.innerHTML = html.join(""); }
function usarJutsu(i) {
    return __awaiter(this, void 0, void 0, function () {
        var j, custo, chakra, chakraAtual, dados, classe, nome, dano, detalhe, ok, danoTxt, custoTxt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    j = (estado.jutsus || [])[i];
                    if (!j)
                        return [2 /*return*/];
                    custo = numeroSeguro(j.custo || 0);
                    chakra = document.getElementById("chakra");
                    chakraAtual = numeroSeguro((chakra === null || chakra === void 0 ? void 0 : chakra.value) || 0);
                    dados = dadosElementoJutsu(j.elemento || "katon"), classe = dados.classe || "jutsu-neutro";
                    nome = j.nome || "Jutsu sem nome";
                    dano = j.dano ? "Dano: " + j.dano : "";
                    detalhe = [
                        "".concat(dados.icone, " ").concat(dados.nome),
                        custo ? "Custo de chakra: ".concat(custo) : "Sem custo de chakra",
                        dano
                    ].filter(Boolean).join("\\n");
                    return [4 /*yield*/, confirmarUsoAcao("jutsu", nome, detalhe)];
                case 1:
                    ok = _a.sent();
                    if (!ok)
                        return [2 /*return*/];
                    if (!(custo > chakraAtual)) return [3 /*break*/, 3];
                    return [4 /*yield*/, avisoShinobi("Chakra insuficiente", "Voc\u00EA tem ".concat(chakraAtual, " de chakra.\\nEste jutsu precisa de ").concat(custo, "."))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
                case 3:
                    if (chakra)
                        chakra.value = Math.max(0, chakraAtual - custo);
                    salvar();
                    danoTxt = j.dano ? " | Dano: " + j.dano : "";
                    custoTxt = custo ? " | Chakra: -" + custo : "";
                    log("".concat(dados.icone, " Usou ").concat(nome).concat(danoTxt).concat(custoTxt));
                    if (!(typeof window.aplicarEfeitosJutsuBatalha === "function")) return [3 /*break*/, 5];
                    return [4 /*yield*/, window.aplicarEfeitosJutsuBatalha(j, i)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    atualizarHUD();
                    if (typeof window.atualizarDefesasTotaisBatalha === "function")
                        window.atualizarDefesasTotaisBatalha();
                    return [2 /*return*/];
            }
        });
    });
}
function escolherTipoAtaquePrompt(i) { var a = (estado.armados || [])[i]; if (!a)
    return; var atual = a.tipo || "armado", escolha = prompt("Tipo de ataque:\n1 - Armado\n2 - Desarmado\n\nAtual: ".concat(atual), ""); if (null === escolha)
    return; var valor = String(escolha).trim().toLowerCase(), novo = "2" === valor || "desarmado" === valor ? "desarmado" : "armado"; a.tipo = novo, persistirSemRender({ confirmada: true, origem: "armados", campo: "armados", motivo: "alteracao-confirmada" }), renderizarArmados(); }
function iconeTipoAtaque(tipo) { return "desarmado" === tipo ? "👊🏼" : "⚔️"; }
function labelTipoAtaque(tipo) { return "desarmado" === tipo ? "Ataque desarmado" : "Ataque armado"; }
function referenciaIconeAtaque(a) { if (!a)
    return ""; var item = String(a.itemInventario || "").trim(); return item || String(a.nome || "").trim(); }
function srcIconeInventarioCompartilhado(nome) { if (typeof window.obterImagemInventarioPorNome !== "function")
    return ""; return String(window.obterImagemInventarioPorNome(nome) || ""); }
function visualIconeAtaque(a, classeImagem) {
    if (classeImagem === void 0) { classeImagem = ""; }
    var tipo = (a === null || a === void 0 ? void 0 : a.tipo) || "armado";
    if ("desarmado" === tipo)
        return '<span class="ataqueIconeFallback">👊🏼</span>';
    var src = srcIconeInventarioCompartilhado(referenciaIconeAtaque(a));
    return src ? "<img class=\"ataqueArmaImagem ".concat(classeImagem, "\" src=\"").concat(src, "\" alt=\"\" loading=\"lazy\" decoding=\"async\" draggable=\"false\">") : '<span class="ataqueIconeFallback">⚔️</span>';
}
function visualIconeItemAtaque(a) { var referencia = String((a === null || a === void 0 ? void 0 : a.itemInventario) || "").trim(); if (!referencia)
    return '<span class="ataqueItemUsadoFallback">🎒</span>'; var src = srcIconeInventarioCompartilhado(referencia); return src ? "<img class=\"ataqueItemUsadoImagem\" src=\"".concat(src, "\" alt=\"\" loading=\"lazy\" decoding=\"async\" draggable=\"false\">") : "<span class=\"ataqueItemUsadoFallback\">".concat(iconeInventario(referencia), "</span>"); }
function editarCampoArmadoPrompt(i, campo, rotulo) { var a = (estado.armados || [])[i]; if (!a)
    return; var atual = a[campo] || "", novo = prompt(rotulo, atual); null !== novo && (a[campo] = novo.trim(), "nome" !== campo || a.itemInventario && String(a.itemInventario).trim() || (a.itemInventario = novo.trim(), a.quantidadeUso || (a.quantidadeUso = "1")), persistirSemRender({ confirmada: true, origem: "armados", campo: "armados", motivo: "alteracao-confirmada" }), renderizarArmados()); }
function valorArmado(a, campo, padrao) {
    if (padrao === void 0) { padrao = "—"; }
    return (a && void 0 !== a[campo] ? String(a[campo]).trim() : "") || padrao;
}
function ataqueAberto(i) { return estado.ataquesAbertos = estado.ataquesAbertos || {}, !!estado.ataquesAbertos[i]; }
function alternarAtaqueAberto(i) { estado.ataquesAbertos = estado.ataquesAbertos || {}, estado.ataquesAbertos[i] = !estado.ataquesAbertos[i], persistirEstadoLocal({ emitir: false, confirmada: true, origem: "ui", motivo: "ataque-aberto" }), renderizarArmados(); }
function renderizarArmados() {
    var box = document.getElementById("listaArmados");
    if (!box)
        return;
    var html = [];
    (estado.armados || []).forEach(function (a, i) {
        var aberto = ataqueAberto(i), tipo = a.tipo || "armado", classeTipo = "desarmado" === tipo ? "ataque-desarmado" : "ataque-armado", nome = escaparHtmlShinobi(valorArmado(a, "nome", "Novo ataque")), acerto = escaparHtmlShinobi(valorArmado(a, "bonusAcerto", valorArmado(a, "bonus", "—"))), dano = escaparHtmlShinobi(valorArmado(a, "dano", "—")), bonusDano = escaparHtmlShinobi(valorArmado(a, "bonusDano", "—")), totalDano = escaparHtmlShinobi(formatarDanoTotal(a.dano, a.bonusDano)), obs = escaparHtmlShinobi(valorArmado(a, "obs", "Toque para editar observações")), itemInventario = escaparHtmlShinobi(valorArmado(a, "itemInventario", "Nenhum")), quantidadeUso = escaparHtmlShinobi(valorArmado(a, "quantidadeUso", "1")), iconeResumo = visualIconeAtaque(a, "ataqueArmaImagemResumo"), iconeDetalhe = visualIconeAtaque(a, "ataqueArmaImagemDetalhe"), iconeItem = visualIconeItemAtaque(a), resumoTipo = escaparHtmlShinobi(labelTipoAtaque(tipo));
        html.push("\n      <div class=\"armadoCardCompacto ataqueListaCard ".concat(classeTipo, " ").concat(aberto ? "ataqueAberto" : "", "\">\n        <button class=\"ataqueLinhaResumo\" onclick=\"alternarAtaqueAberto(").concat(i, ")\">\n          <span class=\"ataqueLinhaIcone\" onclick=\"event.stopPropagation(); escolherTipoAtaquePrompt(").concat(i, ")\">").concat(iconeResumo, "</span>\n\n          <span class=\"ataqueLinhaTexto\">\n            <strong>").concat(nome, "</strong>\n            <small>").concat(resumoTipo, "</small>\n          </span>\n\n          <span class=\"ataqueLinhaDano\">").concat(totalDano, "</span>\n          <span class=\"ataqueLinhaSeta\" aria-hidden=\"true\">").concat(aberto ? "▲" : "›", "</span>\n        </button>\n\n        <div class=\"ataqueDetalhesCompactos\">\n          <div class=\"armadoTopo\">\n            <button class=\"armadoIcone\" onclick=\"escolherTipoAtaquePrompt(").concat(i, ")\" aria-label=\"Editar tipo do ataque\">").concat(iconeDetalhe, "</button>\n\n            <div class=\"armadoNome\" onclick=\"editarCampoArmadoPrompt(").concat(i, ",'nome','Nome do ataque')\">\n              <h3>").concat(nome, "</h3>\n              <span onclick=\"event.stopPropagation(); escolherTipoAtaquePrompt(").concat(i, ")\">").concat(resumoTipo, "</span>\n            </div>\n          </div>\n\n          <div class=\"armadoResumoEditavel\">\n            <button onclick=\"editarCampoArmadoPrompt(").concat(i, ",'bonusAcerto','B\u00F4nus de acerto')\"><b>Acerto</b>").concat(acerto, "</button>\n            <button onclick=\"editarCampoArmadoPrompt(").concat(i, ",'dano','Dano')\"><b>Dano</b>").concat(dano, "</button>\n            <button class=\"danoTotalBox\" onclick=\"editarCampoArmadoPrompt(").concat(i, ",'bonusDano','B\u00F4nus de dano')\"><b>Dano total</b>").concat(totalDano, "</button>\n            <button onclick=\"editarCampoArmadoPrompt(").concat(i, ",'bonusDano','B\u00F4nus de dano')\"><b>B\u00F4nus dano</b>").concat(bonusDano, "</button>\n            <button class=\"armadoResumoFull\" onclick=\"editarCampoArmadoPrompt(").concat(i, ",'obs','Outros b\u00F4nus / observa\u00E7\u00F5es')\"><b>Observa\u00E7\u00F5es</b>").concat(obs, "</button>\n            <button onclick=\"vincularItemAtaque(").concat(i, ")\"><b>Item usado</b><span class=\"ataqueItemUsado\">").concat(iconeItem, "<span>").concat(itemInventario, "</span></span></button>\n            <button onclick=\"editarQtdUsoAtaque(").concat(i, ")\"><b>Qtd. por uso</b>").concat(quantidadeUso, "</button>\n          </div>\n\n          <div class=\"armadoAcoesCompactas ataqueAcoesUso\">\n            <button class=\"btn btnUsarAtaqueInventario\" onclick=\"usarAtaqueInventario(").concat(i, ")\">Usar ataque</button>\n            <button class=\"btn perigo\" onclick=\"removerArmado(").concat(i, ")\">Remover</button>\n          </div>\n        </div>\n      </div>\n    "));
    }), box.innerHTML = html.join("");
}
function numeroSeguro(valor) { var n = Number(valor); return Number.isFinite(n) ? n : 0; }
function limitarPorcentagem(valor) { return Math.max(0, Math.min(100, valor)); }
function lerXP(valor) { var XP_MAX_PADRAO = 355000, bruto = String(valor !== null && valor !== void 0 ? valor : "").trim(), lerInteiroXP = function (v) { var limpo = String(v !== null && v !== void 0 ? v : "").replace(/\s/g, "").replace(/[.,](?=\d{3}(?:\D|$))/g, "").replace(/[^0-9-]/g, ""); return Math.max(0, numeroSeguro(limpo)); }; if (bruto.includes("/")) {
    var partes = bruto.split("/");
    var atual_1 = lerInteiroXP(partes[0]), maximo = Math.max(1, lerInteiroXP(partes[1]) || XP_MAX_PADRAO);
    return { atual: atual_1, maximo: maximo, texto: atual_1 + "/" + maximo };
} var atual = lerInteiroXP(bruto); return { atual: atual, maximo: XP_MAX_PADRAO, texto: atual + "/" + XP_MAX_PADRAO }; }
function atualizarHUD() { var _a, _b, _c, _d, _e; var pv = ((_a = document.getElementById("pv")) === null || _a === void 0 ? void 0 : _a.value) || 0, pvMax = ((_b = document.getElementById("pvMax")) === null || _b === void 0 ? void 0 : _b.value) || 0, chakra = ((_c = document.getElementById("chakra")) === null || _c === void 0 ? void 0 : _c.value) || 0, chakraMax = ((_d = document.getElementById("chakraMax")) === null || _d === void 0 ? void 0 : _d.value) || 0, xp = lerXP(((_e = document.querySelector('[data-save="xp"]')) === null || _e === void 0 ? void 0 : _e.value) || "0/355000"); definirLargura("perfilPvBarra", pv, pvMax), definirLargura("perfilChakraBarra", chakra, chakraMax), definirLargura("perfilXpBarra", xp.atual, xp.maximo); var pvTxt = document.getElementById("perfilPvView"), chTxt = document.getElementById("perfilChakraView"), xpTxt = document.getElementById("perfilXpView"); pvTxt && (pvTxt.textContent = pv + "/" + (pvMax || 0)), chTxt && (chTxt.textContent = chakra + "/" + (chakraMax || 0)), xpTxt && (xpTxt.textContent = xp.texto); }
window.addEventListener("pagehide", function () { window.__shinobiSheetTransition !== true && timerSalvar && salvar(); });
var NATUREZAS = [{ id: "katon", icone: "🔥", nome: "KATON", classe: "katon" }, { id: "raiton", icone: "⚡", nome: "RAITON", classe: "raiton" }, { id: "fuuton", icone: "🌪️", nome: "FUUTON", classe: "fuuton" }, { id: "suiton", icone: "💧", nome: "SUITON", classe: "suiton" }, { id: "doton", icone: "🪨", nome: "DOTON", classe: "doton" }, { id: "yin", icone: "🌑", nome: "YINTON", classe: "yin" }, { id: "yang", icone: "☀️", nome: "YOUTON", classe: "yang" }];
function renderizarNaturezas() { var box = document.getElementById("naturezasUI"); if (!box)
    return; var html = []; NATUREZAS.forEach(function (n) { var valor = Math.max(0, Math.min(6, numeroSeguro(estado[n.id] || 0))), bolinhas = Array.from({ length: 6 }, function (_, i) { var nivel = i + 1, ativa = nivel <= valor ? "ativa" : ""; return "\n        <button type=\"button\" class=\"naturezaNivel\" onclick=\"definirNatureza('".concat(n.id, "',").concat(nivel, ")\" aria-label=\"").concat(n.nome, " n\u00EDvel ").concat(nivel, "\">\n          <span class=\"naturezaBolinha ").concat(ativa, "\"></span>\n          <small>").concat(nivel, "</small>\n        </button>\n      "); }).join(""); html.push("\n      <div class=\"naturezaCard ".concat(n.classe, "\">\n        <div class=\"naturezaInfo\">\n          <span class=\"naturezaIcone\">").concat(n.icone, "</span>\n          <div>\n            <div class=\"naturezaNome\">").concat(n.nome, "</div>\n            <span class=\"naturezaNivelTexto\">").concat(valor, "/6</span>\n          </div>\n        </div>\n        <div class=\"naturezaLinha\">").concat(bolinhas, "</div>\n      </div>\n    ")); }), box.innerHTML = html.join(""); }
function definirNatureza(id, nivel) { var atual = numeroSeguro(estado[id] || 0); estado[id] = atual === nivel ? 0 : nivel, persistirEstadoLocal(), renderizarNaturezas(); }
function textoCampo(chave, padrao) { var valor = estado[chave]; return void 0 !== valor && "" !== String(valor).trim() ? String(valor).trim() : padrao; }
function definirLargura(id, atual, maximo) { var el = document.getElementById(id); if (!el)
    return; var a = numeroSeguro(atual), m = Math.max(1, numeroSeguro(maximo)); el.style.width = limitarPorcentagem(a / m * 100) + "%"; }
function corNatureza(classe) { return { katon: "#ff4b26", raiton: "#ffd02a", fuuton: "#53e25a", suiton: "#2aa8ff", doton: "#b8793a", yin: "#a965ff", yang: "#ffe06a" }[classe] || "#ffb15a"; }
function atualizarPerfil() { var _a, _b, _c, _d, _e; var cla = textoCampo("cla", "Clã indefinido"), vila = textoCampo("vila", "Vila indefinida"), rank = textoCampo("rank", "Rank"), nivel = textoCampo("nivel", "1"), setText = function (id, txt) { var el = document.getElementById(id); el && (el.textContent = txt); }; setText("perfilResumoView", cla + " • " + vila), setText("perfilRankView", rank), setText("perfilNivelView", "Nível " + nivel); var pv = ((_a = document.getElementById("pv")) === null || _a === void 0 ? void 0 : _a.value) || 0, pvMax = ((_b = document.getElementById("pvMax")) === null || _b === void 0 ? void 0 : _b.value) || 0, chakra = ((_c = document.getElementById("chakra")) === null || _c === void 0 ? void 0 : _c.value) || 0, chakraMax = ((_d = document.getElementById("chakraMax")) === null || _d === void 0 ? void 0 : _d.value) || 0, xp = lerXP(((_e = document.querySelector('[data-save="xp"]')) === null || _e === void 0 ? void 0 : _e.value) || "0/355000"); setText("perfilPvView", pv + "/" + (pvMax || 0)), setText("perfilChakraView", chakra + "/" + (chakraMax || 0)), setText("perfilXpView", xp.texto), definirLargura("perfilPvBarra", pv, pvMax), definirLargura("perfilChakraBarra", chakra, chakraMax), definirLargura("perfilXpBarra", xp.atual, xp.maximo); var box = document.getElementById("perfilElementosView"); if (box) {
    var ativos = NATUREZAS.map(function (n) { return (__assign(__assign({}, n), { valor: numeroSeguro(estado[n.id] || 0) })); }).filter(function (n) { return n.valor > 0; }).sort(function (a, b) { return b.valor - a.valor; }).slice(0, 4);
    ativos.length ? box.innerHTML = ativos.map(function (n) { return "\n        <span class=\"elementoPill\" style=\"color:".concat(corNatureza(n.classe), "\">\n          ").concat(n.icone, " ").concat(n.nome, " ").concat(n.valor, "/6\n        </span>\n      "); }).join("") : box.innerHTML = '<span class="elementoPill" style="color:#ffb15a">✨ Nenhum elemento selecionado</span>';
} }
function abrirUploadAvatar() { var input = document.getElementById("avatarUpload"); input && input.click(); }
function carregarAvatar(event) { var arquivo = event.target.files && event.target.files[0]; if (!arquivo)
    return; if (!arquivo.type.startsWith("image/"))
    return void alert("Escolha uma imagem válida."); var leitor = new FileReader; leitor.onload = function (e) { var imagem = e.target.result; estado.avatarNinja = imagem, persistirEstadoLocal(), aplicarAvatar(imagem); }, leitor.readAsDataURL(arquivo); }
function aplicarAvatar(imagem) { var preview = document.getElementById("avatarPreview"), emoji = document.getElementById("avatarEmoji"); preview && emoji && (imagem ? (preview.src = imagem, preview.style.display = "block", emoji.style.display = "none") : (preview.removeAttribute("src"), preview.style.display = "none", emoji.style.display = "block")); }
function carregarAvatarSalvo() { aplicarAvatar(estado.avatarNinja || ""); }
function abrirUploadFundoPerfil() { var menu = document.getElementById("avatarMenu"), input = document.createElement("input"); input.type = "file", input.accept = "image/*", input.onchange = function (event) { carregarFundoPerfil(event), setTimeout(function () { return input.remove(); }, 300); }, document.body.appendChild(input), input.click(), setTimeout(function () { menu && menu.classList.remove("aberto"); }, 250); }
function compactarImagemParaFundo(arquivo, callback) { var leitor = new FileReader; leitor.onload = function (e) { var img = new Image; img.onload = function () { var largura = img.width, altura = img.height; largura > altura && largura > 1200 ? (altura = Math.round(1200 * altura / largura), largura = 1200) : altura >= largura && altura > 1200 && (largura = Math.round(1200 * largura / altura), altura = 1200); try {
    var canvas = document.createElement("canvas");
    canvas.width = largura, canvas.height = altura;
    canvas.getContext("2d").drawImage(img, 0, 0, largura, altura);
    var imagemCompactada = canvas.toDataURL("image/jpeg", .78);
    callback(imagemCompactada);
}
catch (erro) {
    callback(e.target.result);
} }, img.onerror = function () { callback(e.target.result); }, img.src = e.target.result; }, leitor.readAsDataURL(arquivo); }
function carregarFundoPerfil(event) { var arquivo = event.target.files && event.target.files[0]; arquivo && (arquivo.type && arquivo.type.startsWith("image/") ? compactarImagemParaFundo(arquivo, function (imagem) { try {
    estado.perfilFundoImagem = imagem, persistirEstadoLocal(), aplicarFundoPerfil(imagem);
    var menu = document.getElementById("avatarMenu");
    menu && menu.classList.remove("aberto");
}
catch (erro) {
    alert("Não consegui salvar essa imagem. Tente uma imagem menor ou mais leve.");
} }) : alert("Escolha uma imagem válida.")); }
function aplicarFundoPerfil(imagem) { var fundo = document.getElementById("perfilFundoImagem"); fundo && (imagem ? (fundo.style.backgroundImage = 'url("' + imagem + '")', fundo.style.backgroundSize = "cover", fundo.style.backgroundPosition = "center", fundo.style.backgroundRepeat = "no-repeat", fundo.classList.add("ativo")) : (fundo.style.backgroundImage = "none", fundo.classList.remove("ativo"))); }
function removerFundoPerfil() { delete estado.perfilFundoImagem; try {
    persistirEstadoLocal();
}
catch (erro) { } aplicarFundoPerfil(""); var menu = document.getElementById("avatarMenu"); menu && menu.classList.remove("aberto"); var input = document.getElementById("perfilFundoUpload"); input && (input.value = ""); }
function carregarFundoPerfilSalvo() { aplicarFundoPerfil(estado.perfilFundoImagem || ""); }
function formatarModificador(valor) { var n = calcularModificador(valor); return n >= 0 ? "+" + n : String(n); }
function atualizarModificadoresBatalha() { var _a, _b; [["forca", "modForca"], ["destreza", "modDestreza"], ["constituicao", "modConstituicao"], ["inteligencia", "modInteligencia"], ["sabedoria", "modSabedoria"], ["carisma", "modCarisma"]].forEach(function (_a) {
    var _b = __read(_a, 2), campo = _b[0], id = _b[1];
    var el = document.getElementById(id), input = document.querySelector("[data-save=\"".concat(campo, "\"]"));
    el && (el.textContent = formatarModificador((input === null || input === void 0 ? void 0 : input.value) || 0));
}); var ca = ((_a = document.querySelector('[data-save="ca"]')) === null || _a === void 0 ? void 0 : _a.value) || 10, cd = ((_b = document.querySelector('[data-save="cd"]')) === null || _b === void 0 ? void 0 : _b.value) || 10, caView = document.getElementById("batalhaCaView"), cdView = document.getElementById("batalhaCdView"); "function" == typeof atualizarDefesasTotaisBatalha ? atualizarDefesasTotaisBatalha() : (caView && (caView.textContent = ca), cdView && (cdView.textContent = cd)); }
function salvarListaFichas() { fichas = __spreadArray([], __read(new Set((fichas || ["Principal"]).map(limparNomeFicha))), false), fichas.includes("Principal") || fichas.unshift("Principal"), localStorage.setItem(CHAVE_LISTA, JSON.stringify(fichas)); }
function atualizarListaFichas() { var seletor = document.getElementById("seletorFicha"); seletor && (seletor.innerHTML = "", fichas.forEach(function (nome) { var opcao = document.createElement("option"); opcao.value = nome, opcao.textContent = nome, nome === fichaAtual && (opcao.selected = !0), seletor.appendChild(opcao); })); }
function iniciarTransicaoFicha() { window.__shinobiSheetTransition = true, timerSalvar && (clearTimeout(timerSalvar), timerSalvar = null); }
function novaFicha() { salvar(); var nome = prompt("Nome da nova ficha:"); if (!nome)
    return; if (nome = limparNomeFicha(nome), fichas.includes(nome))
    return void alert("Já existe uma ficha com esse nome."); var chaveNova = chaveFicha(nome); fichas.push(nome), salvarListaFichas(), localStorage.setItem(chaveNova, JSON.stringify({})), iniciarTransicaoFicha(), fichaAtual = nome, CHAVE = chaveNova, estado = {}, localStorage.setItem(CHAVE_ATIVA, fichaAtual), location.reload(); }
function duplicarFicha() { salvar(); var nome = prompt("Nome da cópia da ficha:"); if (!nome)
    return; if (nome = limparNomeFicha(nome), fichas.includes(nome))
    return void alert("Já existe uma ficha com esse nome."); var copia = JSON.parse(JSON.stringify(estado || {})); delete copia.__online; var chaveNova = chaveFicha(nome); localStorage.setItem(chaveNova, JSON.stringify(copia)), fichas = __spreadArray([], __read(new Set(__spreadArray(__spreadArray([], __read(fichas), false), [nome], false))), false), salvarListaFichas(), iniciarTransicaoFicha(), fichaAtual = nome, CHAVE = chaveNova, localStorage.setItem(CHAVE_ATIVA, fichaAtual), estado = copia, atualizarListaFichas(), alert("Ficha duplicada com sucesso!"), setTimeout(function () { return location.reload(); }, 120); }
function trocarFicha(nome) { salvar(); var destino = limparNomeFicha(nome), chaveDestino = chaveFicha(destino); iniciarTransicaoFicha(), fichaAtual = destino, CHAVE = chaveDestino, localStorage.setItem(CHAVE_ATIVA, fichaAtual), location.reload(); }
function renomearFicha() { if (salvar(), "Principal" === fichaAtual)
    return void alert("A ficha Principal não pode ser renomeada. Para mudar o nome dela, use duplicar ficha e crie uma cópia com o novo nome."); var novoNome = prompt("Novo nome da ficha:", fichaAtual); if (!novoNome)
    return; if (novoNome = limparNomeFicha(novoNome), novoNome === fichaAtual)
    return; if (fichas.includes(novoNome))
    return void alert("Já existe uma ficha com esse nome."); var chaveAntiga = chaveFicha(fichaAtual), chaveNova = chaveFicha(novoNome), dados = localStorage.getItem(chaveAntiga) || JSON.stringify(estado || {}); localStorage.setItem(chaveNova, dados), localStorage.removeItem(chaveAntiga), fichas = fichas.map(function (nome) { return nome === fichaAtual ? novoNome : nome; }), iniciarTransicaoFicha(), fichaAtual = novoNome, CHAVE = chaveNova, localStorage.setItem(CHAVE_ATIVA, fichaAtual), salvarListaFichas(), alert("Ficha renomeada com sucesso!"), location.reload(); }
function excluirFicha() { var gerenciador = window.EkoSheetManager; if (gerenciador && typeof gerenciador.excluirFichaMelhorada === "function")
    return gerenciador.excluirFichaMelhorada(); return void alert("O gerenciador de fichas ainda está carregando. Tente novamente em instantes."); }
function exportarFicha() { salvar(); var dados = { app: "Ficha Ninja RPG", versao: "backup-1", criadoEm: (new Date).toISOString(), chave: CHAVE, estado: estado }, nomeNinja = (estado.nome || "ninja").toString().trim().replace(/[^\w\-]+/g, "_") || "ninja", arquivo = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" }), url = URL.createObjectURL(arquivo), link = document.createElement("a"); link.href = url, link.download = "ficha_" + nomeNinja + ".json", document.body.appendChild(link), link.click(), link.remove(), URL.revokeObjectURL(url); }
function abrirImportarFicha() { var input = document.getElementById("importarFichaInput"); input && input.click(); }
function importarFicha(event) { var arquivo = event.target.files && event.target.files[0]; if (!arquivo)
    return; var leitor = new FileReader; leitor.onload = function (e) { try {
    var dados = JSON.parse(e.target.result), novoEstado = dados.estado || dados;
    if (!novoEstado || "object" != typeof novoEstado || Array.isArray(novoEstado))
        return void alert("Arquivo inválido. Escolha um backup da ficha.");
    if (!confirm("Importar esta ficha vai substituir os dados salvos neste aparelho. Continuar?"))
        return;
    estado = novoEstado, persistirEstadoLocal(), alert("Ficha importada com sucesso!"), location.reload();
}
catch (erro) {
    alert("Não foi possível importar. O arquivo precisa estar em formato JSON válido.");
}
finally {
    event.target.value = "";
} }, leitor.readAsText(arquivo); }
function toggleConfigMenu() { var menu = document.getElementById("configMenu"); if ((menu === null || menu === void 0 ? void 0 : menu.closest("#shinobiNavDrawer")) && typeof window.abrirConfiguracoesShinobi === "function")
    return window.abrirConfiguracoesShinobi(); menu && menu.classList.toggle("aberto"); }
function toggleAvatarMenu() { var menu = document.getElementById("avatarMenu"); menu && menu.classList.toggle("aberto"); }
function calcularModificador(valor) { var pontuacao = parseInt(valor, 10); return Number.isFinite(pontuacao) && pontuacao > 0 ? Math.floor((pontuacao - 10) / 2) : 0; }
function atualizarCAAutomatica() { var campoDestreza = document.getElementById("atributoDestreza") || document.querySelector('[data-save="destreza"]'), campoProficiencia = document.getElementById("bonusProficiencia") || document.querySelector('[data-save="proficiencia"]'), campoBonusCA = document.getElementById("bonusCA") || document.querySelector('[data-save="bonusCA"]'), campoCA = document.getElementById("campoCA") || document.querySelector('[data-save="ca"]'); if (!campoCA)
    return; var destreza = parseInt((campoDestreza === null || campoDestreza === void 0 ? void 0 : campoDestreza.value) || 0), proficiencia = parseInt((campoProficiencia === null || campoProficiencia === void 0 ? void 0 : campoProficiencia.value) || 0), bonusCA = parseInt((campoBonusCA === null || campoBonusCA === void 0 ? void 0 : campoBonusCA.value) || 0); if (!Number.isFinite(destreza) || destreza <= 0)
    return; var ca = 10 + calcularModificador(destreza) + proficiencia + bonusCA; campoCA.value = ca, estado.ca = String(ca), persistirEstadoLocal(), "function" == typeof atualizarDefesasTotaisBatalha && atualizarDefesasTotaisBatalha(); }
function garantirKekkeiArray() { estado.kekkeiGenkai && Array.isArray(estado.kekkeiGenkai) || (estado.kekkeiGenkai = []); }
function salvarKekkeiGenkai() { garantirKekkeiArray(), persistirEstadoLocal({ confirmada: true, origem: "kekkei", campo: "kekkeiGenkai", motivo: "alteracao-confirmada" }); }
function adicionarKekkeiGenkai() { garantirKekkeiArray(); var nome = prompt("Nome da Kekkei Genkai:"); nome && nome.trim() && (estado.kekkeiGenkai.push({ nome: nome.trim(), nivel: 0 }), salvarKekkeiGenkai(), renderizarKekkeiGenkai()); }
function removerKekkeiGenkai(i) { garantirKekkeiArray(), confirm("Remover esta Kekkei Genkai?") && (estado.kekkeiGenkai.splice(i, 1), salvarKekkeiGenkai(), renderizarKekkeiGenkai()); }
function definirNivelKekkei(i, nivel) {
    return __awaiter(this, void 0, void 0, function () {
        var nivelAtual, nivelFinal, nome, ok, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (garantirKekkeiArray(), !estado.kekkeiGenkai[i])
                        return [2 /*return*/];
                    nivelAtual = Number(estado.kekkeiGenkai[i].nivel || 0), nivelFinal = nivelAtual === nivel ? nivel - 1 : nivel, nome = String(estado.kekkeiGenkai[i].nome || "Kekkei Genkai");
                    if (nivelFinal === nivelAtual)
                        return [2 /*return*/];
                    if (!(typeof modalShinobi === "function")) return [3 /*break*/, 2];
                    return [4 /*yield*/, modalShinobi("Confirmar alteração?", "".concat(nome, ": n\u00EDvel ").concat(nivelAtual, " \u2192 ").concat(nivelFinal))];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = confirm("".concat(nome, ": n\u00EDvel ").concat(nivelAtual, " \u2192 ").concat(nivelFinal, "\n\nConfirmar altera\u00E7\u00E3o?"));
                    _b.label = 3;
                case 3:
                    ok = _a;
                    if (!ok)
                        return [2 /*return*/];
                    estado.kekkeiGenkai[i].nivel = nivelFinal, salvarKekkeiGenkai(), renderizarKekkeiGenkai();
                    return [2 /*return*/];
            }
        });
    });
}
function editarNomeKekkei(i) { var _a; garantirKekkeiArray(); var atual = ((_a = estado.kekkeiGenkai[i]) === null || _a === void 0 ? void 0 : _a.nome) || "", novo = prompt("Nome da Kekkei Genkai:", atual); null !== novo && novo.trim() && (estado.kekkeiGenkai[i].nome = novo.trim(), salvarKekkeiGenkai(), renderizarKekkeiGenkai()); }
function renderizarKekkeiGenkai() { garantirKekkeiArray(); var lista = document.getElementById("kekkeiLista"); if (!lista)
    return; var html = []; estado.kekkeiGenkai.forEach(function (k, i) { var nome = escaparHtmlShinobi(String(k.nome || "Kekkei Genkai").trim()), nivel = Number(k.nivel || 0); var bolinhas = ""; for (var n = 1; n <= 6; n++)
    bolinhas += "\n        <button type=\"button\" class=\"kekkeiNivel ".concat(n <= nivel ? "ativo" : "", "\" onclick=\"definirNivelKekkei(").concat(i, ",").concat(n, ")\" aria-label=\"N\u00EDvel ").concat(n, "\"></button>\n      "); html.push("\n      <div class=\"kekkeiNaturezaCard\">\n        <div class=\"kekkeiInfo\" onclick=\"editarNomeKekkei(".concat(i, ")\">\n          <span class=\"kekkeiIcone\">\uD83E\uDDEC</span>\n          <div class=\"kekkeiTexto\">\n            <div class=\"kekkeiNome\">").concat(nome, "</div>\n            <div class=\"kekkeiNivelTexto\">").concat(nivel, "/6</div>\n          </div>\n        </div>\n\n        <div class=\"kekkeiNiveis\">\n          ").concat(bolinhas, "\n        </div>\n\n        <button type=\"button\" class=\"removerKekkeiBtn\" onclick=\"removerKekkeiGenkai(").concat(i, ")\">\u00D7</button>\n      </div>\n    ")); }), lista.innerHTML = html.join(""); }
document.addEventListener("click", function (e) { var config = document.querySelector(".configGlobal"), menuConfig = document.getElementById("configMenu"), configMigrado = Boolean(menuConfig === null || menuConfig === void 0 ? void 0 : menuConfig.closest("#shinobiNavDrawer")), avatar = document.querySelector(".avatarAreaNovo"); if (!configMigrado && config && !config.contains(e.target)) {
    menuConfig && menuConfig.classList.remove("aberto");
} if (avatar && !avatar.contains(e.target)) {
    var menu = document.getElementById("avatarMenu");
    menu && menu.classList.remove("aberto");
} }), carregar(), atualizarListaFichas(), document.addEventListener("input", function (e) { e.target && ["destreza", "proficiencia", "bonusCA"].includes(e.target.dataset.save) && atualizarCAAutomatica(); }), document.addEventListener("change", function (e) { e.target && ["destreza", "proficiencia", "bonusCA"].includes(e.target.dataset.save) && atualizarCAAutomatica(); }), document.addEventListener("DOMContentLoaded", function () { setTimeout(atualizarCAAutomatica, 200); }), window.addEventListener("pageshow", function () { estado = lerEstadoFichaSeguro(CHAVE); renderizarKekkeiGenkai(); });
function garantirInventarioItens() { estado.inventarioItens && Array.isArray(estado.inventarioItens) || (estado.inventarioItens = []); }
function salvarInventarioItens() { garantirInventarioItens(), persistirEstadoLocal({ confirmada: true, origem: "inventario", campo: "inventarioItens", motivo: "alteracao-confirmada" }); }
function adicionarItemInventario() { garantirInventarioItens(); var nome = prompt("Nome do item:"); if (!nome || !nome.trim())
    return; var quantidade = prompt("Quantidade:", "1"); quantidade = parseInt(quantidade || "1"), (isNaN(quantidade) || quantidade < 0) && (quantidade = 1), estado.inventarioItens.push({ nome: nome.trim(), quantidade: quantidade }), salvarInventarioItens(), renderizarInventario(); }
function editarNomeItemInventario(i) { var _a; garantirInventarioItens(); var atual = ((_a = estado.inventarioItens[i]) === null || _a === void 0 ? void 0 : _a.nome) || "", novo = prompt("Nome do item:", atual); null !== novo && novo.trim() && (estado.inventarioItens[i].nome = novo.trim(), salvarInventarioItens(), renderizarInventario()); }
function alterarQtdItemInventario(i, valor) {
    return __awaiter(this, void 0, void 0, function () { var item, atual, qtd, ok; return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (garantirInventarioItens(), !estado.inventarioItens[i])
                    return [2 /*return*/];
                item = estado.inventarioItens[i], atual = Math.max(0, parseInt(item.quantidade || 0) || 0);
                qtd = parseInt(valor || 0);
                (isNaN(qtd) || qtd < 0) && (qtd = 0);
                if (qtd === atual)
                    return [2 /*return*/];
                return [4 /*yield*/, modalShinobi("Confirmar alteração?", "".concat(item.nome || "Item", ": ").concat(atual, " \u2192 ").concat(qtd))];
            case 1:
                ok = _a.sent();
                if (!ok) {
                    renderizarInventario();
                    return [2 /*return*/];
                }
                item.quantidade = qtd;
                salvarInventarioItens();
                renderizarInventario();
                return [2 /*return*/];
        }
    }); });
}
function removerItemInventario(i) { garantirInventarioItens(), confirm("Remover este item do inventário?") && (estado.inventarioItens.splice(i, 1), salvarInventarioItens(), renderizarInventario()); }
function renderizarInventario() { garantirInventarioItens(); var lista = document.getElementById("listaInventario"); if (!lista)
    return; lista.innerHTML = ""; var html = []; 0 !== estado.inventarioItens.length ? (estado.inventarioItens.forEach(function (item, i) { var nome = escaparHtmlShinobi(item.nome || "Item"), qtd = Math.max(0, Number(item.quantidade || 0) || 0); html.push("\n      <div class=\"itemInventario\">\n        <div class=\"itemInventarioNome\" onclick=\"editarNomeItemInventario(".concat(i, ")\"><span class=\"itemInventarioIcone\">").concat(iconeInventario(nome), "</span><span>").concat(nome, "</span></div>\n        <input class=\"itemInventarioQtd\" type=\"number\" value=\"").concat(qtd, "\" min=\"0\" inputmode=\"numeric\" onchange=\"alterarQtdItemInventario(").concat(i, ", this.value)\">\n        <button type=\"button\" class=\"btnRemoverItemInventario\" onclick=\"removerItemInventario(").concat(i, ")\">\u00D7</button>\n      </div>\n    ")); }), lista.innerHTML = html.join("")) : lista.innerHTML = '\n      <div class="itemInventario">\n        <div class="itemInventarioNome" style="opacity:.65; cursor:default;">Nenhum item adicionado</div>\n        <input class="itemInventarioQtd" type="number" value="0" disabled>\n        <button type="button" class="btnRemoverItemInventario" disabled>×</button>\n      </div>\n    '; }
function iconeInventario(nome) { var n = normalizarTextoInventario ? normalizarTextoInventario(nome) : String(nome || "").toLowerCase(); return n ? n.includes("shuriken") ? "✴️" : n.includes("kunai") ? "🔪" : n.includes("agulha") || n.includes("agulhas") || n.includes("senbon") ? "🪡" : n.includes("fio") || n.includes("fios") || n.includes("linha") || n.includes("arame") ? "🧵" : n.includes("comida") || n.includes("alimento") || n.includes("lanche") || n.includes("racao") || n.includes("ração") ? "🍙" : n.includes("pergaminho") || n.includes("scroll") ? "📜" : n.includes("bomba") || n.includes("explosivo") ? "💣" : n.includes("selo") || n.includes("papel bomba") || n.includes("tarja") ? "🏷️" : n.includes("pocao") || n.includes("poção") || n.includes("remedio") || n.includes("remédio") ? "🧪" : n.includes("bandagem") || n.includes("curativo") ? "🩹" : n.includes("espada") || n.includes("katana") ? "🗡️" : n.includes("mascara") || n.includes("máscara") ? "🎭" : n.includes("dinheiro") || n.includes("ryo") || n.includes("ryou") ? "💰" : "🎒" : "🎒"; }
function normalizarTextoInventario(txt) { return String(txt || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function buscarItemInventarioPorNome(nome) { garantirInventarioItens(); var alvo = normalizarTextoInventario(nome); return alvo ? estado.inventarioItens.findIndex(function (item) { return normalizarTextoInventario(item.nome) === alvo; }) : -1; }
function vincularItemAtaque(i) { estado.armados = estado.armados || [], garantirInventarioItens(); var ataque = estado.armados[i]; if (!ataque)
    return; var sugestao = ataque.itemInventario || ataque.nome || ""; if (estado.inventarioItens.length) {
    var lista = estado.inventarioItens.map(function (item) { return item.nome; }).join(", "), escolhido = prompt("Qual item do inventário esse ataque usa?\\n\\nItens disponíveis: " + lista, sugestao);
    if (null === escolhido)
        return;
    ataque.itemInventario = escolhido.trim();
}
else {
    var escolhido = prompt("Qual item do inventário esse ataque usa?", sugestao);
    if (null === escolhido)
        return;
    ataque.itemInventario = escolhido.trim();
} !ataque.itemInventario && ataque.nome && (ataque.itemInventario = ataque.nome), ataque.quantidadeUso || (ataque.quantidadeUso = "1"), persistirSemRender({ confirmada: true, origem: "armados", campo: "armados", motivo: "alteracao-confirmada" }), renderizarArmados(); }
function editarQtdUsoAtaque(i) { estado.armados = estado.armados || []; var ataque = estado.armados[i]; if (!ataque)
    return; var atual = ataque.quantidadeUso || "1", nova = prompt("Quantos itens esse ataque consome por uso?", atual); null !== nova && (nova = parseInt(nova || "1"), (isNaN(nova) || nova < 1) && (nova = 1), ataque.quantidadeUso = String(nova), persistirSemRender({ confirmada: true, origem: "armados", campo: "armados", motivo: "alteracao-confirmada" }), renderizarArmados()); }
function usarAtaqueInventario(i) {
    return __awaiter(this, void 0, void 0, function () {
        var ataque, nomeAtaque, itemVinculado, qtdUso, idxItem, item, qtdAtual, ok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    estado.armados = estado.armados || [];
                    garantirInventarioItens();
                    ataque = estado.armados[i];
                    if (!ataque)
                        return [2 /*return*/];
                    nomeAtaque = ataque.nome || "Ataque";
                    itemVinculado = String(ataque.itemInventario || "").trim();
                    if (!!itemVinculado) return [3 /*break*/, 2];
                    return [4 /*yield*/, avisoShinobi("Item não vinculado", 'Antes de usar, toque em "Item usado" e vincule esse ataque a um item do inventário.')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    qtdUso = Math.max(1, parseInt(ataque.quantidadeUso || "1"));
                    idxItem = buscarItemInventarioPorNome(itemVinculado);
                    if (!(idxItem < 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, avisoShinobi("Item não encontrado", "N\u00E3o encontrei \"".concat(itemVinculado, "\" no invent\u00E1rio.\\nAdicione esse item no Invent\u00E1rio ou ajuste o nome em \"Item usado\"."))];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
                case 4:
                    item = estado.inventarioItens[idxItem];
                    qtdAtual = parseInt(item.quantidade || 0);
                    if (!(qtdAtual < qtdUso)) return [3 /*break*/, 6];
                    return [4 /*yield*/, avisoShinobi("Quantidade insuficiente", "Voc\u00EA tem: ".concat(qtdAtual, "\\nPrecisa: ").concat(qtdUso))];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
                case 6: return [4 /*yield*/, confirmarUsoAcao("ataque", nomeAtaque, "Item consumido: ".concat(item.nome, "\\nQuantidade: ").concat(qtdUso, "\\nRestar\u00E1: ").concat(qtdAtual - qtdUso))];
                case 7:
                    ok = _a.sent();
                    if (!ok)
                        return [2 /*return*/];
                    item.quantidade = qtdAtual - qtdUso;
                    salvarInventarioItens();
                    persistirSemRender();
                    if (typeof registrarLog === "function")
                        registrarLog("".concat(nomeAtaque, " usado. Consumiu ").concat(qtdUso, "x ").concat(item.nome, "."));
                    else
                        avisoShinobi("Ataque usado", "".concat(nomeAtaque, " usado. Consumiu ").concat(qtdUso, "x ").concat(item.nome, "."));
                    renderizarInventario();
                    renderizarArmados();
                    return [2 /*return*/];
            }
        });
    });
}
window.addEventListener("pageshow", function () { estado = lerEstadoFichaSeguro(CHAVE); renderizarInventario(); });
/* ===== Estado granular dos bônus temporários de combate — v2.5.8.89 ===== */
var SHINOBI_BONUS_BATALHA_CAMPOS = {
    atributo: {
        forca: "batalhaBonusForca", destreza: "batalhaBonusDestreza", constituicao: "batalhaBonusConstituicao",
        inteligencia: "batalhaBonusInteligencia", sabedoria: "batalhaBonusSabedoria", carisma: "batalhaBonusCarisma"
    },
    defesa: { ca: "batalhaBonusCA", cd: "batalhaBonusCD" }
};
function shinobiCampoEstadoBonusBatalha(input) {
    var _a, _b;
    if (!input)
        return "";
    var atributo = String(((_a = input.getAttribute) === null || _a === void 0 ? void 0 : _a.call(input, "data-bonus-batalha")) || "").trim();
    if (atributo)
        return SHINOBI_BONUS_BATALHA_CAMPOS.atributo[atributo] || "";
    var defesa = String(((_b = input.getAttribute) === null || _b === void 0 ? void 0 : _b.call(input, "data-bonus-defesa-batalha")) || "").trim();
    if (defesa)
        return SHINOBI_BONUS_BATALHA_CAMPOS.defesa[defesa] || "";
    return "";
}
function shinobiPersistirBonusBatalha(input) {
    var campo = shinobiCampoEstadoBonusBatalha(input);
    if (!campo)
        return false;
    var antes = Number((estado === null || estado === void 0 ? void 0 : estado[campo]) || 0), depois = Number((input === null || input === void 0 ? void 0 : input.value) || 0);
    if (!Number.isFinite(depois))
        return false;
    estado[campo] = depois;
    return persistirEstadoLocal({ confirmada: true, origem: "batalha-bonus", campo: campo, antes: antes, depois: depois, motivo: "alteracao-confirmada" });
}
function shinobiCarregarBonusBatalhaPersistidos() {
    document.querySelectorAll("[data-bonus-batalha],[data-bonus-defesa-batalha]").forEach(function (input) {
        var campo = shinobiCampoEstadoBonusBatalha(input);
        if (!campo)
            return;
        if (Object.prototype.hasOwnProperty.call(estado || {}, campo))
            input.value = String(Number(estado[campo] || 0));
    });
    try {
        atualizarModsBatalhaComBonus();
    }
    catch (_erro) { }
    try {
        atualizarDefesasTotaisBatalha();
    }
    catch (_erro) { }
}
function shinobiZerarBonusBatalhaPersistidos(grupo) {
    if (grupo === void 0) { grupo = "todos"; }
    var seletores = [];
    if (grupo === "todos" || grupo === "atributo")
        seletores.push("[data-bonus-batalha]");
    if (grupo === "todos" || grupo === "defesa")
        seletores.push("[data-bonus-defesa-batalha]");
    var campos = [];
    document.querySelectorAll(seletores.join(",")).forEach(function (input) {
        input.value = 0;
        var campo = shinobiCampoEstadoBonusBatalha(input);
        if (!campo)
            return;
        estado[campo] = 0;
        campos.push(campo);
    });
    if (campos.length)
        persistirEstadoLocal({ confirmada: true, origem: "batalha-bonus", campos: campos, motivo: "alteracao-confirmada" });
    return campos;
}
window.shinobiPersistirBonusBatalha = shinobiPersistirBonusBatalha;
window.shinobiCarregarBonusBatalhaPersistidos = shinobiCarregarBonusBatalhaPersistidos;
window.shinobiZerarBonusBatalhaPersistidos = shinobiZerarBonusBatalhaPersistidos;
document.addEventListener("change", function (evento) {
    var _a, _b;
    if ((_b = (_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches) === null || _b === void 0 ? void 0 : _b.call(_a, "[data-bonus-batalha],[data-bonus-defesa-batalha]"))
        shinobiPersistirBonusBatalha(evento.target);
});
document.addEventListener("DOMContentLoaded", function () { return setTimeout(shinobiCarregarBonusBatalhaPersistidos, 160); });
window.addEventListener("pageshow", function () { return setTimeout(shinobiCarregarBonusBatalhaPersistidos, 160); });
var bonusBatalhaAtributos = { forca: 0, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 };
function lerBonusAtributosBatalha() { document.querySelectorAll("[data-bonus-batalha]").forEach(function (input) { var chave = input.getAttribute("data-bonus-batalha"); bonusBatalhaAtributos[chave] = Number(input.value || 0); }); }
function valorAtributoComBonusBatalha(chave) { var _a; return Number(((_a = document.querySelector("[data-save=\"".concat(chave, "\"]"))) === null || _a === void 0 ? void 0 : _a.value) || 0) + Number(bonusBatalhaAtributos[chave] || 0); }
function modificadorComBonusBatalha(chave) { var _a; var base = Number(((_a = document.querySelector("[data-save=\"".concat(chave, "\"]"))) === null || _a === void 0 ? void 0 : _a.value) || 0); if (!Number.isFinite(base) || base <= 0)
    return 0; return calcularModificador(base + Number(bonusBatalhaAtributos[chave] || 0)); }
function formatarModBatalha(v) { return v >= 0 ? "+" + v : String(v); }
function atualizarModsBatalhaComBonus() { lerBonusAtributosBatalha(), [["forca", "modForca"], ["destreza", "modDestreza"], ["constituicao", "modConstituicao"], ["inteligencia", "modInteligencia"], ["sabedoria", "modSabedoria"], ["carisma", "modCarisma"]].forEach(function (_a) {
    var _b;
    var _c = __read(_a, 2), chave = _c[0], id = _c[1];
    var el = document.getElementById(id);
    if (!el)
        return;
    var bonusManual = Number(bonusBatalhaAtributos[chave] || 0), bonusJutsu = Number(((_b = window.obterBonusEfeitosJutsuBatalha) === null || _b === void 0 ? void 0 : _b.call(window, "mod_".concat(chave))) || 0), mod = modificadorComBonusBatalha(chave) + bonusJutsu, detalhes = [];
    bonusManual && detalhes.push("+".concat(bonusManual, " atr.")), bonusJutsu && detalhes.push("".concat(bonusJutsu > 0 ? "+" : "").concat(bonusJutsu, " jutsu")), el.innerHTML = formatarModBatalha(mod) + (detalhes.length ? "<span class=\"bonusAplicadoTexto\">".concat(detalhes.join(" · "), "</span>") : "");
}); }
function limparBonusAtributosBatalha() {
    return __awaiter(this, void 0, void 0, function () {
        var ok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, confirmarUsoAcao("bônus temporários", "Limpar bônus de atributos", "Todos os bônus temporários de FOR, DES, CON, INT, SAB e CAR serão zerados.")];
                case 1:
                    ok = _a.sent();
                    if (!ok)
                        return [2 /*return*/];
                    shinobiZerarBonusBatalhaPersistidos("atributo");
                    if (typeof bonusBatalhaAtributos !== "undefined") {
                        Object.keys(bonusBatalhaAtributos).forEach(function (k) { return bonusBatalhaAtributos[k] = 0; });
                    }
                    atualizarModsBatalhaComBonus();
                    if (typeof logar === "function")
                        logar("Bônus temporários de atributos removidos.");
                    else if (typeof log === "function")
                        log("Bônus temporários de atributos removidos.");
                    return [2 /*return*/];
            }
        });
    });
}
function numeroBatalha(valor, padrao) {
    if (padrao === void 0) { padrao = 0; }
    var n = Number(valor);
    return Number.isFinite(n) ? n : padrao;
}
function obterBaseCaBatalha() { var campoCA = document.getElementById("campoCA") || document.querySelector('[data-save="ca"]'); return numeroBatalha(campoCA === null || campoCA === void 0 ? void 0 : campoCA.value, 10); }
function obterBaseCdBatalha() { var campoCD = document.querySelector('[data-save="cd"]'); return numeroBatalha(campoCD === null || campoCD === void 0 ? void 0 : campoCD.value, 10); }
function obterBonusDefesaBatalha(tipo) { var _a; return numeroBatalha((_a = document.querySelector("[data-bonus-defesa-batalha=\"".concat(tipo, "\"]"))) === null || _a === void 0 ? void 0 : _a.value, 0); }
function atualizarDefesasTotaisBatalha() { var _a; var caBase = obterBaseCaBatalha(), cdBase = obterBaseCdBatalha(), bonusCA = obterBonusDefesaBatalha("ca"), bonusCD = obterBonusDefesaBatalha("cd"), bonusCAJutsu = Number(((_a = window.obterBonusEfeitosJutsuBatalha) === null || _a === void 0 ? void 0 : _a.call(window, "ca")) || 0), caTotal = caBase + bonusCA + bonusCAJutsu, cdTotal = cdBase + bonusCD, caView = document.getElementById("batalhaCaView"), cdView = document.getElementById("batalhaCdView"), detalhesCA = []; bonusCA && detalhesCA.push("".concat(bonusCA > 0 ? "+" : "").concat(bonusCA, " manual")), bonusCAJutsu && detalhesCA.push("".concat(bonusCAJutsu > 0 ? "+" : "").concat(bonusCAJutsu, " jutsu")), caView && (caView.innerHTML = String(caTotal) + (detalhesCA.length ? "<span class=\"bonusDefesaTexto\">".concat(detalhesCA.join(" · "), "</span>") : "")), cdView && (cdView.innerHTML = String(cdTotal) + (bonusCD ? "<span class=\"bonusDefesaTexto\">".concat(bonusCD > 0 ? "+" : "").concat(bonusCD, " manual</span>") : "")); }
function zerarBonusDefesasBatalha() {
    return __awaiter(this, void 0, void 0, function () {
        var ok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, confirmarUsoAcao("bônus temporários", "Limpar bônus de CA/CD", "Os bônus temporários de CA e CD serão zerados.")];
                case 1:
                    ok = _a.sent();
                    if (!ok)
                        return [2 /*return*/];
                    shinobiZerarBonusBatalhaPersistidos("defesa");
                    if (typeof atualizarDefesasTotaisBatalha === "function")
                        atualizarDefesasTotaisBatalha();
                    if (typeof logar === "function")
                        logar("Bônus temporários de CA/CD removidos.");
                    else if (typeof log === "function")
                        log("Bônus temporários de CA/CD removidos.");
                    return [2 /*return*/];
            }
        });
    });
}
/* ===== NOTAS: editor interno compatível com o app instalado ===== */
function garantirTopicosNotas() {
    if (!estado.notasTopicos || !Array.isArray(estado.notasTopicos)) {
        estado.notasTopicos = [];
        if (estado.notas && String(estado.notas).trim()) {
            estado.notasTopicos.push({
                titulo: "Anotações da campanha",
                texto: String(estado.notas || ""),
                aberto: true
            });
        }
    }
    var idsMigrados = false;
    var identidade = window.ShinobiItemIdentity;
    if (identidade === null || identidade === void 0 ? void 0 : identidade.garantirIds) {
        idsMigrados = identidade.garantirIds(estado.notasTopicos, {
            colecao: "notas", campo: "id", legado: true,
            gerarId: function () { return "nota_".concat(Date.now().toString(36), "_").concat(Math.random().toString(36).slice(2, 10)); }
        });
    }
    else {
        /* Fallback defensivo para builds antigos que não carreguem o utilitário. */
        var idsUsados_1 = new Set();
        estado.notasTopicos.forEach(function (topico) {
            if (!topico || typeof topico !== "object")
                return;
            var id = String(topico.id || "").trim();
            if (!id) {
                var titulo = String(topico.titulo || "nota").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 36) || "nota";
                id = "nota_legado_".concat(titulo);
                idsMigrados = true;
            }
            if (idsUsados_1.has(id)) {
                var base = id || "nota_legado_nota";
                var sufixo = 2;
                while (idsUsados_1.has("".concat(base, "_").concat(sufixo)))
                    sufixo += 1;
                id = "".concat(base, "_").concat(sufixo);
                idsMigrados = true;
            }
            if (topico.id !== id) {
                topico.id = id;
                idsMigrados = true;
            }
            idsUsados_1.add(id);
        });
    }
    if (idsMigrados && typeof persistirEstadoLocal === "function") {
        persistirEstadoLocal({ emitir: false, confirmada: false, origem: "migracao-notas-item-level", motivo: "ids-permanentes-notas" });
    }
}
function salvarTopicosNotas(operacao) {
    var _a, _b, _c;
    if (operacao === void 0) { operacao = {}; }
    garantirTopicosNotas();
    var persistiu = false;
    if (typeof persistirEstadoLocal === "function") {
        persistiu = persistirEstadoLocal({
            confirmada: true,
            origem: "notas",
            campo: "notasTopicos",
            motivo: "alteracao-confirmada"
        }) !== false;
    }
    else if (typeof persistirSemRender === "function") {
        persistirSemRender({ confirmada: true, origem: "notas", campo: "notasTopicos", motivo: "alteracao-confirmada" });
        persistiu = true;
    }
    var itemId = String(operacao.itemId || ((_a = operacao.item) === null || _a === void 0 ? void 0 : _a.id) || "").trim();
    if (!persistiu || !itemId || typeof (window === null || window === void 0 ? void 0 : window.dispatchEvent) !== "function")
        return persistiu;
    try {
        window.dispatchEvent(new CustomEvent("shinobi:colecao-item-confirmado", {
            detail: {
                sheetName: String(typeof fichaAtual !== "undefined" ? fichaAtual : "Principal"),
                collection: "notas",
                itemId: itemId,
                deleted: operacao.deleted === true,
                value: operacao.deleted === true ? undefined : __assign(__assign({}, (operacao.item || {})), { id: itemId }),
                identityKey: ((_c = (_b = window.ShinobiItemIdentity) === null || _b === void 0 ? void 0 : _b.identityKey) === null || _c === void 0 ? void 0 : _c.call(_b, "notas", operacao.item || {})) || "",
                confirmed: true,
                source: "notas",
                reason: "alteracao-confirmada"
            }
        }));
    }
    catch (_erroColecao) { }
    return persistiu;
}
function escaparHtmlNotas(txt) {
    return String(txt || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
function garantirEstilosEditorNotas() {
    if (document.getElementById("editorTopicoNotaStyles")) {
        return;
    }
    var estilo = document.createElement("style");
    estilo.id = "editorTopicoNotaStyles";
    estilo.textContent = "\n    .editorTopicoNotaBox{\n      width:min(94vw,520px);\n      max-height:min(90vh,720px);\n      overflow:auto;\n    }\n\n    .editorTopicoNotaCampo{\n      display:grid;\n      gap:7px;\n      margin:0 0 14px;\n    }\n\n    .editorTopicoNotaCampo label{\n      color:#ffd08a;\n      font-weight:900;\n      font-size:13px;\n      letter-spacing:.25px;\n    }\n\n    .editorTopicoNotaCampo input,\n    .editorTopicoNotaCampo textarea{\n      width:100%;\n      box-sizing:border-box;\n      border:1px solid rgba(255,177,90,.32);\n      background:rgba(5,7,10,.78);\n      color:#fff4dc;\n      font:inherit;\n      padding:11px 12px;\n      outline:none;\n    }\n\n    .editorTopicoNotaCampo input:focus,\n    .editorTopicoNotaCampo textarea:focus{\n      border-color:rgba(255,208,138,.82);\n      box-shadow:0 0 0 2px rgba(255,177,90,.12);\n    }\n\n    .editorTopicoNotaCampo textarea{\n      min-height:150px;\n      max-height:42vh;\n      resize:vertical;\n      line-height:1.45;\n    }\n\n    .editorTopicoNotaAjuda{\n      margin:-5px 0 14px;\n      color:#cdbfa8;\n      font-size:12px;\n      line-height:1.35;\n    }\n  ";
    document.head.appendChild(estilo);
}
function abrirEditorTopicoNota(opcoes) {
    if (opcoes === void 0) { opcoes = {}; }
    garantirEstilosEditorNotas();
    var modalAnterior = document.querySelector(".editorTopicoNotaOverlay");
    if (modalAnterior) {
        modalAnterior.remove();
    }
    return new Promise(function (resolve) {
        var overlay = document.createElement("div");
        overlay.className =
            "modalShinobiOverlay editorTopicoNotaOverlay";
        var tituloModal = opcoes.modo === "editar"
            ? "Editar tópico"
            : "Novo tópico";
        var textoBotao = opcoes.modo === "editar"
            ? "Salvar"
            : "Criar tópico";
        var tituloInicial = escaparHtmlNotas(opcoes.titulo || "Novo tópico");
        var textoInicial = escaparHtmlNotas(opcoes.texto || "");
        overlay.innerHTML = "\n      <form class=\"modalShinobiBox editorTopicoNotaBox\">\n        <h3 class=\"modalShinobiTitulo\">\n          ".concat(tituloModal, "\n        </h3>\n\n        <div class=\"editorTopicoNotaCampo\">\n          <label for=\"editorTopicoNotaTitulo\">\n            Tema do t\u00F3pico\n          </label>\n\n          <input\n            id=\"editorTopicoNotaTitulo\"\n            type=\"text\"\n            maxlength=\"120\"\n            value=\"").concat(tituloInicial, "\"\n            autocomplete=\"off\"\n          >\n        </div>\n\n        <div class=\"editorTopicoNotaCampo\">\n          <label for=\"editorTopicoNotaTexto\">\n            Anota\u00E7\u00F5es\n          </label>\n\n          <textarea\n            id=\"editorTopicoNotaTexto\"\n            placeholder=\"Escreva as informa\u00E7\u00F5es deste t\u00F3pico...\"\n          >").concat(textoInicial, "</textarea>\n        </div>\n\n        <p class=\"editorTopicoNotaAjuda\">\n          Voc\u00EA tamb\u00E9m poder\u00E1 continuar escrevendo diretamente\n          no t\u00F3pico depois de cri\u00E1-lo.\n        </p>\n\n        <div class=\"modalShinobiAcoes\">\n          <button\n            type=\"button\"\n            class=\"modalShinobiBtn cancelar\"\n            data-acao=\"cancelar\"\n          >\n            Cancelar\n          </button>\n\n          <button\n            type=\"submit\"\n            class=\"modalShinobiBtn confirmar\"\n          >\n            ").concat(textoBotao, "\n          </button>\n        </div>\n      </form>\n    ");
        var formulario = overlay.querySelector("form");
        var campoTitulo = overlay.querySelector("#editorTopicoNotaTitulo");
        var campoTexto = overlay.querySelector("#editorTopicoNotaTexto");
        var finalizado = false;
        function finalizar(resultado) {
            if (finalizado)
                return;
            finalizado = true;
            document.removeEventListener("keydown", tratarTeclado);
            overlay.remove();
            resolve(resultado);
        }
        function tratarTeclado(evento) {
            if (evento.key === "Escape") {
                evento.preventDefault();
                finalizar(null);
            }
        }
        overlay.addEventListener("click", function (evento) {
            if (evento.target === overlay) {
                finalizar(null);
            }
        });
        overlay
            .querySelector('[data-acao="cancelar"]')
            .addEventListener("click", function () {
            finalizar(null);
        });
        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();
            finalizar({
                titulo: String(campoTitulo.value || "").trim() ||
                    "Novo tópico",
                texto: String(campoTexto.value || "")
            });
        });
        document.addEventListener("keydown", tratarTeclado);
        document.body.appendChild(overlay);
        requestAnimationFrame(function () {
            campoTitulo.focus();
            campoTitulo.select();
        });
    });
}
function adicionarTopicoNota() {
    return __awaiter(this, void 0, void 0, function () {
        var dados, novoTopico;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    garantirTopicosNotas();
                    return [4 /*yield*/, abrirEditorTopicoNota({
                            modo: "adicionar",
                            titulo: "Novo tópico",
                            texto: ""
                        })];
                case 1:
                    dados = _a.sent();
                    if (!dados)
                        return [2 /*return*/];
                    novoTopico = {
                        id: "nota_".concat(Date.now().toString(36), "_").concat(Math.random().toString(36).slice(2, 10)),
                        titulo: dados.titulo,
                        texto: dados.texto,
                        aberto: true
                    };
                    estado.notasTopicos.push(novoTopico);
                    salvarTopicosNotas({ itemId: novoTopico.id, item: novoTopico, deleted: false });
                    renderizarTopicosNotas();
                    return [2 /*return*/];
            }
        });
    });
}
function alternarTopicoNota(i) {
    garantirTopicosNotas();
    if (!estado.notasTopicos[i]) {
        return;
    }
    estado.notasTopicos[i].aberto =
        !estado.notasTopicos[i].aberto;
    /* Abrir/fechar tópico é estado visual local, não uma alteração de ficha
       que precise gerar revisão na nuvem. */
    if (typeof persistirEstadoLocal === "function") {
        persistirEstadoLocal({ emitir: false, confirmada: true, origem: "ui", motivo: "topico-aberto" });
    }
    renderizarTopicosNotas();
}
function editarTituloTopicoNota(i, ev) {
    return __awaiter(this, void 0, void 0, function () {
        var topico, dados;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (ev) {
                        ev.stopPropagation();
                    }
                    garantirTopicosNotas();
                    topico = estado.notasTopicos[i];
                    if (!topico)
                        return [2 /*return*/];
                    return [4 /*yield*/, abrirEditorTopicoNota({
                            modo: "editar",
                            titulo: topico.titulo || "Novo tópico",
                            texto: topico.texto || ""
                        })];
                case 1:
                    dados = _a.sent();
                    if (!dados)
                        return [2 /*return*/];
                    topico.titulo = dados.titulo;
                    topico.texto = dados.texto;
                    salvarTopicosNotas({ itemId: topico.id, item: topico, deleted: false });
                    renderizarTopicosNotas();
                    return [2 /*return*/];
            }
        });
    });
}
function removerTopicoNota(i, ev) {
    return __awaiter(this, void 0, void 0, function () {
        var topico, confirmado;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (ev) {
                        ev.stopPropagation();
                    }
                    garantirTopicosNotas();
                    topico = estado.notasTopicos[i];
                    if (!topico)
                        return [2 /*return*/];
                    confirmado = false;
                    if (!(typeof modalShinobi === "function")) return [3 /*break*/, 2];
                    return [4 /*yield*/, modalShinobi("Remover tópico", "O t\u00F3pico \u201C".concat(topico.titulo || "Novo tópico", "\u201D ser\u00E1 removido."), {})];
                case 1:
                    confirmado = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    confirmado = window.confirm("Remover este tópico de notas?");
                    _a.label = 3;
                case 3:
                    if (!confirmado)
                        return [2 /*return*/];
                    estado.notasTopicos.splice(i, 1);
                    salvarTopicosNotas({ itemId: topico.id, item: topico, deleted: true });
                    renderizarTopicosNotas();
                    return [2 /*return*/];
            }
        });
    });
}
function confirmarTextoTopicoNota(i, valor) {
    return __awaiter(this, void 0, void 0, function () {
        var topico, antigo, novo, ok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    garantirTopicosNotas();
                    topico = estado.notasTopicos[i];
                    if (!topico)
                        return [2 /*return*/];
                    antigo = String(topico.texto || "");
                    novo = String(valor || "");
                    if (antigo === novo)
                        return [2 /*return*/];
                    return [4 /*yield*/, modalShinobi("Confirmar alteração?", "Salvar as altera\u00E7\u00F5es nas notas de \u201C".concat(topico.titulo || "Novo tópico", "\u201D?"))];
                case 1:
                    ok = _a.sent();
                    if (!ok) {
                        renderizarTopicosNotas();
                        return [2 /*return*/];
                    }
                    topico.texto = novo;
                    salvarTopicosNotas({ itemId: topico.id, item: topico, deleted: false });
                    renderizarTopicosNotas();
                    return [2 /*return*/];
            }
        });
    });
}
function renderizarTopicosNotas() {
    garantirTopicosNotas();
    var lista = document.getElementById("listaTopicosNotas");
    if (!lista)
        return;
    if (!estado.notasTopicos.length) {
        lista.innerHTML =
            '<div class="notaVazia">Nenhum tópico criado ainda.</div>';
        return;
    }
    lista.innerHTML = estado.notasTopicos
        .map(function (topico, i) {
        var aberto = topico.aberto
            ? "aberto"
            : "";
        var seta = topico.aberto
            ? "▼"
            : "▶";
        var titulo = escaparHtmlNotas(topico.titulo || "Novo tópico");
        var texto = escaparHtmlNotas(topico.texto || "");
        return "\n        <div class=\"topicoNotaCard ".concat(aberto, "\">\n          <div\n            class=\"topicoNotaHeader\"\n            onclick=\"alternarTopicoNota(").concat(i, ")\"\n          >\n            <span class=\"topicoNotaSeta\">\n              ").concat(seta, "\n            </span>\n\n            <span class=\"topicoNotaTitulo\">\n              ").concat(titulo, "\n            </span>\n\n            <button\n              type=\"button\"\n              class=\"topicoNotaEditar\"\n              onclick=\"editarTituloTopicoNota(").concat(i, ", event)\"\n              aria-label=\"Editar t\u00F3pico\"\n            >\n              <span class=\"shinobiIcon icon-edit\" aria-hidden=\"true\"></span>\n            </button>\n\n            <button\n              type=\"button\"\n              class=\"topicoNotaRemover\"\n              onclick=\"removerTopicoNota(").concat(i, ", event)\"\n              aria-label=\"Remover t\u00F3pico\"\n            >\n              <span class=\"shinobiIcon icon-trash\" aria-hidden=\"true\"></span>\n            </button>\n          </div>\n\n          <div class=\"topicoNotaConteudo\">\n            <textarea\n              placeholder=\"Escreva as anota\u00E7\u00F5es deste t\u00F3pico...\"\n              onchange=\"confirmarTextoTopicoNota(").concat(i, ", this.value)\"\n            >").concat(texto, "</textarea>\n          </div>\n        </div>\n      ");
    })
        .join("");
}
/*
 * Os botões do HTML usam onclick.
 * A atribuição explícita evita diferenças de escopo
 * entre navegador, PWA e aplicativo instalado.
 */
window.adicionarTopicoNota = adicionarTopicoNota;
window.alternarTopicoNota = alternarTopicoNota;
window.editarTituloTopicoNota = editarTituloTopicoNota;
window.removerTopicoNota = removerTopicoNota;
window.confirmarTextoTopicoNota =
    confirmarTextoTopicoNota;
window.renderizarTopicosNotas =
    renderizarTopicosNotas;
document.addEventListener("input", function (e) { e.target && e.target.matches("[data-bonus-batalha]") && atualizarModsBatalhaComBonus(); }), document.addEventListener("DOMContentLoaded", function () { setTimeout(atualizarModsBatalhaComBonus, 180); }), window.addEventListener("pageshow", function () { setTimeout(atualizarModsBatalhaComBonus, 180); }), document.addEventListener("input", function (e) { e.target && (e.target.matches("[data-bonus-defesa-batalha]") || e.target.matches('[data-save="ca"]') || e.target.matches('[data-save="cd"]') || e.target.matches('[data-save="bonusCA"]') || e.target.matches('[data-save="destreza"]') || e.target.matches('[data-save="proficiencia"]')) && setTimeout(atualizarDefesasTotaisBatalha, 30); }), document.addEventListener("change", function (e) { e.target && (e.target.matches("[data-bonus-defesa-batalha]") || e.target.matches('[data-save="ca"]') || e.target.matches('[data-save="cd"]') || e.target.matches('[data-save="bonusCA"]') || e.target.matches('[data-save="destreza"]') || e.target.matches('[data-save="proficiencia"]')) && setTimeout(atualizarDefesasTotaisBatalha, 30); }), document.addEventListener("DOMContentLoaded", function () { setTimeout(atualizarDefesasTotaisBatalha, 180); }), window.addEventListener("pageshow", function () { setTimeout(atualizarDefesasTotaisBatalha, 180); }), document.addEventListener("DOMContentLoaded", function () { setTimeout(renderizarTopicosNotas, 180); }), window.addEventListener("pageshow", function () { setTimeout(renderizarTopicosNotas, 180); });
var jutsuUploadIndiceAtual = null;
function abrirUploadImagemJutsu(i) { jutsuUploadIndiceAtual = i; var input = document.getElementById("jutsuUploadGlobalSeguro"); input ? (input.value = "", input.click()) : alert("Campo de imagem não encontrado. Recarregue o app e tente novamente."); }
function removerImagemJutsu(i) { var indice = Number(i); if (estado.jutsus && estado.jutsus[indice]) {
    estado.jutsus[indice].imagem = "", estado.jutsusAbertos = estado.jutsusAbertos || {}, estado.jutsusAbertos[indice] = !0;
    try {
        persistirEstadoLocal();
    }
    catch (err) { }
    "function" == typeof renderizarJutsus && renderizarJutsus();
} }
document.addEventListener("DOMContentLoaded", function () { var input = document.getElementById("jutsuUploadGlobalSeguro"); input && !input.dataset.configurado && (input.dataset.configurado = "1", input.addEventListener("change", function (ev) { carregarImagemJutsu(ev, jutsuUploadIndiceAtual); })); }), window.addEventListener("pageshow", function () { var input = document.getElementById("jutsuUploadGlobalSeguro"); input && !input.dataset.configurado && (input.dataset.configurado = "1", input.addEventListener("change", function (ev) { carregarImagemJutsu(ev, jutsuUploadIndiceAtual); })); });
