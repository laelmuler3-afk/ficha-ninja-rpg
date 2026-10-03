/* GERADO AUTOMATICAMENTE — fonte: js/05-battle.js — app 2.5.8.154. Não editar. */
/* Shinobi 1.8.5 — painel de combate com modificadores e efeitos acumulados. */
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
/* ===== MODIFICADORES VISÍVEIS E BÔNUS TEMPORÁRIOS ===== */
(function () {
    if (window.__modificadoresCombateVisiveisV185)
        return;
    window.__modificadoresCombateVisiveisV185 = true;
    var frame = null;
    var ROTULOS = {
        forca: "FOR",
        destreza: "DES",
        constituicao: "CON",
        inteligencia: "INT",
        sabedoria: "SAB",
        carisma: "CAR",
        ca: "CA",
        furtividade: "FUR",
        velocidade: "VEL",
        mod_forca: "MOD FOR",
        mod_destreza: "MOD DES",
        mod_constituicao: "MOD CON",
        mod_inteligencia: "MOD INT",
        mod_sabedoria: "MOD SAB",
        mod_carisma: "MOD CAR"
    };
    function numero(valor) {
        var n = Number(valor || 0);
        return Number.isFinite(n) ? n : 0;
    }
    function comSinal(valor) {
        var n = numero(valor);
        return n > 0 ? "+".concat(n) : String(n);
    }
    function bonusManuais() {
        return Array.from(document.querySelectorAll(".bonusAtributoBatalha"))
            .map(function (input) {
            var alvo = String(input.dataset.bonusBatalha || "").toLowerCase();
            var valor = numero(input.value);
            return valor ? { alvo: alvo, valor: valor, origem: "manual" } : null;
        })
            .filter(Boolean);
    }
    function bonusDeJutsus() {
        var efeitos = typeof window.obterEfeitosJutsuBatalhaAtivos === "function"
            ? window.obterEfeitosJutsuBatalhaAtivos()
            : [];
        return efeitos.flatMap(function (efeito) {
            return Object.entries((efeito === null || efeito === void 0 ? void 0 : efeito.bonus) || {})
                .map(function (_a) {
                var _b = __read(_a, 2), alvo = _b[0], valor = _b[1];
                return ({
                    alvo: String(alvo || "").toLowerCase(),
                    valor: numero(valor),
                    origem: "jutsu",
                    nome: String((efeito === null || efeito === void 0 ? void 0 : efeito.nome) || "Jutsu")
                });
            })
                .filter(function (item) { return item.valor; });
        });
    }
    function agruparBonus(itens) {
        var mapa = new Map();
        itens.forEach(function (item) {
            var alvo = item.alvo;
            if (!alvo)
                return;
            if (!mapa.has(alvo)) {
                mapa.set(alvo, {
                    alvo: alvo,
                    total: 0,
                    manual: 0,
                    jutsu: 0,
                    fontesJutsu: new Set()
                });
            }
            var grupo = mapa.get(alvo);
            grupo.total += item.valor;
            if (item.origem === "manual") {
                grupo.manual += item.valor;
            }
            else {
                grupo.jutsu += item.valor;
                if (item.nome)
                    grupo.fontesJutsu.add(item.nome);
            }
        });
        return Array.from(mapa.values());
    }
    window.obterResumoBonusCombate = function () {
        return agruparBonus(__spreadArray(__spreadArray([], __read(bonusManuais()), false), __read(bonusDeJutsus()), false)).map(function (item) { return (__assign(__assign({}, item), { fontesJutsu: Array.from(item.fontesJutsu) })); });
    };
    window.atualizarBonusBatalhaCompacto = function () {
        var painel = document.querySelector("#batalha .bonusAtributosBatalha");
        if (!painel)
            return;
        var resumo = painel.querySelector(".bonusResumoCompacto");
        if (!resumo) {
            resumo = document.createElement("div");
            resumo.className = "bonusResumoCompacto";
            painel.appendChild(resumo);
        }
        var grupos = window.obterResumoBonusCombate();
        painel.classList.toggle("semBonusTemporario", !grupos.length);
        resumo.hidden = !grupos.length;
        resumo.innerHTML = grupos.length
            ? "\n        <div class=\"bonusResumoTitulo\">B\u00F4nus ativos acumulados</div>\n        <div class=\"bonusResumoAtivos\">\n          ".concat(grupos.map(function (grupo) {
                var detalhes = [];
                if (grupo.manual)
                    detalhes.push("".concat(comSinal(grupo.manual), " manual"));
                if (grupo.jutsu) {
                    var qtd = grupo.fontesJutsu.length;
                    detalhes.push("".concat(comSinal(grupo.jutsu), " ").concat(qtd > 1 ? "".concat(qtd, " jutsus") : "jutsu"));
                }
                return "\n              <span class=\"bonusResumoChip bonusResumoChipTotal\">\n                <b>".concat(ROTULOS[grupo.alvo] || grupo.alvo.toUpperCase(), "</b>\n                <strong>").concat(comSinal(grupo.total), "</strong>\n                ").concat(detalhes.length ? "<small>".concat(detalhes.join(" · "), "</small>") : "", "\n              </span>\n            ");
            }).join(""), "\n        </div>\n      ")
            : "";
    };
    /*
     * Mantém compatibilidade com botões antigos. Os campos manuais agora
     * ficam dentro de um <details>, por isso não há mais um painel próprio
     * que precise ser aberto por JavaScript.
     */
    window.alternarBonusAtributosBatalha = function () {
        var detalhes = document.querySelector("#batalha .ajustesBonusAtributos");
        if (detalhes)
            detalhes.open = !detalhes.open;
    };
    function agendar() {
        if (frame !== null)
            return;
        frame = requestAnimationFrame(function () {
            frame = null;
            window.atualizarBonusBatalhaCompacto();
        });
    }
    if (typeof window.atualizarModsBatalhaComBonus === "function" && !window.__modsBatalhaComResumoV184) {
        window.__modsBatalhaComResumoV184 = true;
        var base_1 = window.atualizarModsBatalhaComBonus;
        window.atualizarModsBatalhaComBonus = function () {
            var resultado = base_1.apply(this, arguments);
            agendar();
            return resultado;
        };
    }
    document.addEventListener("input", function (evento) {
        var _a;
        if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches(".bonusAtributoBatalha"))
            agendar();
    });
    document.addEventListener("change", function (evento) {
        var _a;
        if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches(".bonusAtributoBatalha"))
            agendar();
    });
    window.addEventListener("shinobi:efeitos-batalha-atualizados", agendar);
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", agendar, { once: true });
    }
    else {
        agendar();
    }
    window.addEventListener("pageshow", agendar);
})();
/* ===== RESISTÊNCIAS PERSISTENTES ===== */
(function () {
    if (window.__resistenciasPersistentesV4)
        return;
    window.__resistenciasPersistentesV4 = true;
    var aberto = false;
    var frame = null;
    var GRUPOS = [
        { titulo: "Elementos", itens: [
                { id: "katon", nome: "🔥 Katon" }, { id: "raiton", nome: "⚡ Raiton" }, { id: "fuuton", nome: "🌪️ Fuuton" },
                { id: "suiton", nome: "💧 Suiton" }, { id: "doton", nome: "🪨 Doton" }, { id: "mokuton", nome: "🌱 Mokuton" },
                { id: "youton", nome: "☀️ Youton" }, { id: "shoton", nome: "💎 Shoton" }, { id: "neutro", nome: "✨ Neutro" }
            ] },
        { titulo: "Atributos", itens: [
                { id: "forca", nome: "FOR" }, { id: "destreza", nome: "DES" }, { id: "constituicao", nome: "CON" },
                { id: "inteligencia", nome: "INT" }, { id: "sabedoria", nome: "SAB" }, { id: "carisma", nome: "CAR" }
            ] },
        { titulo: "Especiais", itens: [
                { id: "fisico", nome: "⚔️ Físico" }, { id: "taijutsu", nome: "👊 Taijutsu" }, { id: "genjutsu", nome: "👁️ Genjutsu" },
                { id: "veneno", nome: "☠️ Veneno" }, { id: "selamento", nome: "🔒 Selamento" }, { id: "sangramento", nome: "🩸 Sangramento" },
                { id: "atordoamento", nome: "😵 Atordoamento" }, { id: "eletrica", nome: "⚡ Elétrica" }
            ] }
    ];
    var NOMES = new Map(GRUPOS.flatMap(function (grupo) { return grupo.itens.map(function (item) { return [item.id, item.nome]; }); }));
    function salvar(contexto) {
        if (contexto === void 0) { contexto = {}; }
        try {
            if (typeof sincronizarEstadoDosCampos === "function")
                sincronizarEstadoDosCampos();
            if (typeof persistirEstadoLocal === "function")
                return persistirEstadoLocal(contexto);
            if (typeof CHAVE !== "undefined") {
                localStorage.setItem(CHAVE, JSON.stringify(estado));
                return true;
            }
        }
        catch (erro) {
            console.warn("Falha ao salvar resistências.", erro);
        }
        return false;
    }
    function obterEstado() {
        /* Migração preservada: remove as resistências antigas ativadas automaticamente. */
        if (!estado.__resistenciasV3Inicializadas) {
            estado.__resistenciasV3Inicializadas = true;
            estado.resistenciasBatalha = {};
            if (!estado.resistenciasEscolhidas || typeof estado.resistenciasEscolhidas !== "object" || Array.isArray(estado.resistenciasEscolhidas)) {
                estado.resistenciasEscolhidas = {};
            }
            salvar();
        }
        if (!estado.resistenciasEscolhidas || typeof estado.resistenciasEscolhidas !== "object" || Array.isArray(estado.resistenciasEscolhidas)) {
            estado.resistenciasEscolhidas = {};
        }
        return estado.resistenciasEscolhidas;
    }
    function criarPainel() {
        var container = document.querySelector("#batalha #resistenciasBatalhaHost") || document.querySelector("#batalha .modificadoresBatalha");
        if (!container)
            return null;
        var painel = document.getElementById("resistenciasBatalhaPainel");
        if (!painel) {
            painel = document.createElement("div");
            painel.id = "resistenciasBatalhaPainel";
            painel.className = "resistenciasBatalhaPainel";
            var bonus = container.querySelector(".bonusAtributosBatalha");
            bonus ? container.insertBefore(painel, bonus) : container.appendChild(painel);
        }
        return painel;
    }
    window.toggleResistenciaBatalha = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var resistencias, estavaAtiva, acao, mensagem, confirmado, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!NOMES.has(id))
                            return [2 /*return*/];
                        resistencias = obterEstado();
                        estavaAtiva = Boolean(resistencias[id]);
                        acao = estavaAtiva ? "Remover" : "Adicionar";
                        mensagem = "".concat(acao, " ").concat(NOMES.get(id), " nas resist\u00EAncias da ficha?");
                        if (!(typeof modalShinobi === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, modalShinobi("Confirmar alteração?", mensagem)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = confirm(mensagem);
                        _b.label = 3;
                    case 3:
                        confirmado = _a;
                        if (!confirmado)
                            return [2 /*return*/];
                        estavaAtiva ? delete resistencias[id] : resistencias[id] = true;
                        salvar({ confirmada: true, origem: "resistencias", campo: "resistenciasEscolhidas", motivo: "alteracao-confirmada" });
                        window.renderizarResistenciasBatalha();
                        return [2 /*return*/];
                }
            });
        });
    };
    window.alternarPainelResistenciasBatalha = function () {
        aberto = !aberto;
        window.renderizarResistenciasBatalha();
    };
    window.renderizarResistenciasBatalha = function () {
        var painel = criarPainel();
        if (!painel)
            return;
        var resistencias = obterEstado();
        var ativas = Object.keys(resistencias)
            .filter(function (id) { return resistencias[id] && NOMES.has(id); })
            .map(function (id) { return ({ id: id, nome: NOMES.get(id) }); });
        painel.classList.toggle("aberto", aberto);
        painel.classList.toggle("fechado", !aberto);
        var resumo = ativas.length
            ? "<div class=\"resistenciasAtivasGrid\">".concat(ativas.map(function (item) { return "<button type=\"button\" class=\"resistenciaChipResumo\" onclick=\"toggleResistenciaBatalha('".concat(item.id, "')\">").concat(item.nome, "</button>"); }).join(""), "</div>")
            : "<div class=\"resistenciaVazia\">Nenhuma resist\u00EAncia ativa.</div>";
        var controles = aberto ? GRUPOS.map(function (grupo) { return "\n      <div class=\"resistenciaGrupo\">\n        <span class=\"resistenciaGrupoTitulo\">".concat(grupo.titulo, "</span>\n        <div class=\"resistenciasBatalhaGrid\">\n          ").concat(grupo.itens.map(function (item) { return "<button type=\"button\" class=\"resistenciaChip ".concat(resistencias[item.id] ? "ativo" : "", "\" onclick=\"toggleResistenciaBatalha('").concat(item.id, "')\">").concat(item.nome, "</button>"); }).join(""), "\n        </div>\n      </div>\n    "); }).join("") : "";
        painel.innerHTML = "\n      <h3>Resist\u00EAncias</h3>\n      ".concat(resumo, "\n      <button type=\"button\" class=\"btnGerenciarResistencias\" onclick=\"alternarPainelResistenciasBatalha()\">\n        ").concat(aberto ? "▲ Fechar resistências" : "▼ Gerenciar resistências", "\n      </button>\n      ").concat(controles, "\n    ");
    };
    function agendar() {
        if (frame !== null)
            return;
        frame = requestAnimationFrame(function () {
            frame = null;
            window.renderizarResistenciasBatalha();
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", agendar, { once: true });
    }
    else {
        agendar();
    }
    window.addEventListener("pageshow", agendar);
})();
/* ===== MOSTRADORES EXTRAS DA BATALHA ===== */
(function () {
    if (window.__mostradoresExtrasBatalhaV3)
        return;
    window.__mostradoresExtrasBatalhaV3 = true;
    var frame = null;
    function numeroCampo(nome, fallback) {
        var _a, _b;
        if (fallback === void 0) { fallback = 0; }
        var campo = document.querySelector("[data-save=\"".concat(nome, "\"]"));
        var bruto = (_b = (_a = campo === null || campo === void 0 ? void 0 : campo.value) !== null && _a !== void 0 ? _a : estado === null || estado === void 0 ? void 0 : estado[nome]) !== null && _b !== void 0 ? _b : fallback;
        var numero = Number(bruto);
        return Number.isFinite(numero) ? numero : Number(fallback || 0);
    }
    function comSinal(numero) {
        var valor = Number(numero || 0);
        return valor > 0 ? "+".concat(valor) : String(valor);
    }
    function criarExtras() {
        var grade = document.querySelector("#batalha .defesasGrid");
        if (!grade)
            return null;
        grade.classList.add("defesasGridComExtras");
        if (!document.getElementById("batalhaIniciativaView")) {
            grade.insertAdjacentHTML("beforeend", "\n        <div class=\"extraBatalhaBox\"><span>Inic.</span><strong id=\"batalhaIniciativaView\">0</strong></div>\n        <div class=\"extraBatalhaBox\"><span>Vel.</span><strong id=\"batalhaVelocidadeView\">0</strong></div>\n        <div class=\"extraBatalhaBox\"><span>Prof.</span><strong id=\"batalhaProficienciaView\">0</strong></div>\n      ");
        }
        return grade;
    }
    window.atualizarMostradoresExtrasBatalha = function () {
        var _a, _b;
        if (!criarExtras())
            return;
        var iniciativa = document.getElementById("batalhaIniciativaView");
        var velocidade = document.getElementById("batalhaVelocidadeView");
        var proficiencia = document.getElementById("batalhaProficienciaView");
        if (iniciativa)
            iniciativa.textContent = comSinal(numeroCampo("iniciativa"));
        if (velocidade) {
            var base = numeroCampo("velocidade"), multiplicador = Number(((_a = window.obterMultiplicadorEfeitosJutsuBatalha) === null || _a === void 0 ? void 0 : _a.call(window, "velocidade")) || 1), bonus = Number(((_b = window.obterBonusEfeitosJutsuBatalha) === null || _b === void 0 ? void 0 : _b.call(window, "velocidade")) || 0), total = Math.floor(base * multiplicador * 1000) / 1000 + bonus, detalhes = [];
            multiplicador !== 1 && detalhes.push("\u00D7".concat(multiplicador, " jutsu")), bonus && detalhes.push("".concat(bonus > 0 ? "+" : "").concat(bonus, "m jutsu")), velocidade.innerHTML = "".concat(String(total).replace(".", ",")).concat(detalhes.length ? "<span class=\"bonusDefesaTexto\">".concat(detalhes.join(" · "), "</span>") : "");
        }
        if (proficiencia)
            proficiencia.textContent = comSinal(numeroCampo("proficiencia"));
    };
    function agendar() {
        if (frame !== null)
            return;
        frame = requestAnimationFrame(function () {
            frame = null;
            window.atualizarMostradoresExtrasBatalha();
        });
    }
    if (typeof window.atualizarModificadoresBatalha === "function" && !window.__modsComExtrasBatalhaV3) {
        window.__modsComExtrasBatalhaV3 = true;
        var base_2 = window.atualizarModificadoresBatalha;
        window.atualizarModificadoresBatalha = function () {
            var resultado = base_2.apply(this, arguments);
            agendar();
            return resultado;
        };
    }
    document.addEventListener("input", function (evento) {
        var _a;
        if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches('[data-save="iniciativa"],[data-save="velocidade"],[data-save="proficiencia"]'))
            agendar();
    });
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", agendar, { once: true });
    }
    else {
        agendar();
    }
    window.addEventListener("pageshow", agendar);
})();
/* ===== NAVEGAÇÃO VERTICAL CONTÍNUA ===== */
(function () {
    if (window.__navegacaoVerticalUnicaV4)
        return;
    window.__navegacaoVerticalUnicaV4 = true;
    var IDS = ["identidade", "atributos", "jutsus", "batalha", "inventario", "anotacoes"];
    var paginas = new Map();
    var botoes = new Map();
    var botoesMenu = [];
    var scrollFrame = null;
    var timerClique = null;
    var timerOrientacao = null;
    var cliqueEmAndamento = false;
    var paginaAtiva = "";
    var iniciada = false;
    function atualizarReferencias() {
        paginas.clear();
        botoes.clear();
        IDS.forEach(function (id) {
            var pagina = document.getElementById(id);
            if (pagina)
                paginas.set(id, pagina);
        });
        botoesMenu = Array.from(document.querySelectorAll(".menu button"));
        botoesMenu.forEach(function (botao) {
            var acao = botao.getAttribute("onclick") || "";
            var id = IDS.find(function (item) { return acao.includes("'".concat(item, "'")) || acao.includes("\"".concat(item, "\"")); });
            if (id)
                botoes.set(id, botao);
        });
    }
    function alturaTopo() {
        var _a;
        return (((_a = document.querySelector(".topo")) === null || _a === void 0 ? void 0 : _a.offsetHeight) || 0) + 8;
    }
    function alturaMenu() {
        var _a;
        return (((_a = document.querySelector(".menu.bottomNav")) === null || _a === void 0 ? void 0 : _a.offsetHeight) || 0) + 28;
    }
    function offsetPagina(id) {
        var pagina = paginas.get(id);
        return pagina
            ? Math.max(0, pagina.getBoundingClientRect().top + window.scrollY - alturaTopo())
            : 0;
    }
    function atualizarIndice(id) {
        var indice = IDS.indexOf(id);
        if (indice >= 0)
            window.abaSwipeAtual = indice;
    }
    function marcarAtiva(id, forcar) {
        var _a;
        if (forcar === void 0) { forcar = false; }
        if (!paginas.has(id))
            return;
        if (!forcar && paginaAtiva === id) {
            atualizarIndice(id);
            return;
        }
        paginas.forEach(function (pagina, paginaId) { return pagina.classList.toggle("ativa", paginaId === id); });
        botoesMenu.forEach(function (botao) { return botao.classList.remove("ativo"); });
        (_a = botoes.get(id)) === null || _a === void 0 ? void 0 : _a.classList.add("ativo");
        paginaAtiva = id;
        atualizarIndice(id);
    }
    function rolar(id, suave) {
        if (!paginas.has(id))
            return;
        var reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({
            top: offsetPagina(id),
            behavior: suave === false || reduzir ? "auto" : "smooth"
        });
    }
    function detectarVisivel() {
        if (cliqueEmAndamento)
            return;
        var topo = alturaTopo();
        var base = window.innerHeight - alturaMenu();
        var melhorId = "";
        var melhorArea = -1;
        var melhorDistancia = Infinity;
        paginas.forEach(function (pagina, id) {
            var rect = pagina.getBoundingClientRect();
            var area = Math.max(0, Math.min(rect.bottom, base) - Math.max(rect.top, topo));
            var distancia = Math.abs(rect.top - topo);
            if (area > melhorArea || (area === melhorArea && distancia < melhorDistancia)) {
                melhorId = id;
                melhorArea = area;
                melhorDistancia = distancia;
            }
        });
        if (melhorId)
            marcarAtiva(melhorId);
    }
    function agendarDeteccao() {
        if (scrollFrame !== null)
            return;
        scrollFrame = requestAnimationFrame(function () {
            scrollFrame = null;
            detectarVisivel();
        });
    }
    var abrirAnterior = window.abrirPagina;
    window.abrirPagina = function (id, botao) {
        if (!paginas.has(id)) {
            return typeof abrirAnterior === "function"
                ? abrirAnterior.apply(this, arguments)
                : undefined;
        }
        cliqueEmAndamento = true;
        if (timerClique !== null)
            clearTimeout(timerClique);
        var resultado;
        if (typeof abrirAnterior === "function") {
            resultado = abrirAnterior.apply(this, arguments);
            paginaAtiva = id;
            atualizarIndice(id);
        }
        else {
            marcarAtiva(id, true);
        }
        requestAnimationFrame(function () {
            rolar(id, true);
            timerClique = setTimeout(function () {
                timerClique = null;
                cliqueEmAndamento = false;
                detectarVisivel();
            }, 520);
        });
        return resultado;
    };
    function iniciar() {
        var _a;
        if (iniciada) {
            agendarDeteccao();
            return;
        }
        iniciada = true;
        atualizarReferencias();
        (_a = document.querySelector("main")) === null || _a === void 0 ? void 0 : _a.classList.add("scrollPages");
        window.alvoBloqueiaSwipe = function () { return true; };
        window.abasSwipe = IDS.slice();
        var hash = location.hash ? location.hash.replace("#", "") : "";
        var inicial = paginas.has(hash) ? hash : "identidade";
        marcarAtiva(inicial, true);
        requestAnimationFrame(function () {
            rolar(inicial, false);
            detectarVisivel();
        });
    }
    window.addEventListener("scroll", agendarDeteccao, { passive: true });
    window.addEventListener("resize", agendarDeteccao, { passive: true });
    window.addEventListener("orientationchange", function () {
        if (timerOrientacao !== null)
            clearTimeout(timerOrientacao);
        timerOrientacao = setTimeout(function () {
            timerOrientacao = null;
            agendarDeteccao();
        }, 180);
    }, { passive: true });
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    }
    else {
        iniciar();
    }
    window.addEventListener("pageshow", agendarDeteccao);
})();
/* ===== NOTAS: ABRIR TÓPICO SEM DESLOCAR A SEÇÃO ===== */
(function () {
    if (window.__notasFundoFixoAoAlternarV2)
        return;
    window.__notasFundoFixoAoAlternarV2 = true;
    var timer = null;
    function manterPosicao(antes) {
        var secao = document.getElementById("anotacoes");
        if (!secao || typeof antes !== "number")
            return;
        var delta = secao.getBoundingClientRect().top - antes;
        if (Math.abs(delta) > 1)
            window.scrollBy({ top: delta, behavior: "auto" });
    }
    if (typeof window.alternarTopicoNota === "function") {
        var base_3 = window.alternarTopicoNota;
        window.alternarTopicoNota = function () {
            var secao = document.getElementById("anotacoes");
            var antes = secao ? secao.getBoundingClientRect().top : null;
            var resultado = base_3.apply(this, arguments);
            requestAnimationFrame(function () {
                manterPosicao(antes);
                if (timer !== null)
                    clearTimeout(timer);
                timer = setTimeout(function () {
                    timer = null;
                    manterPosicao(antes);
                }, 120);
            });
            return resultado;
        };
    }
})();
