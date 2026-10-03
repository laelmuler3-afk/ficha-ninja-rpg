/* GERADO AUTOMATICAMENTE — fonte: js/14-level-up.js — app 2.5.8.154. Não editar. */
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
/* Shinobi 2.1.1 — Level Up completo: revisão de migração, recursos e desempenho. */
(function () {
    "use strict";
    if (window.__shinobiLevelUpV211)
        return;
    window.__shinobiLevelUpV211 = true;
    var VERSAO = "2.1.1";
    var URL_PROGRESSAO = "./data/progressao-ninja.json?v=".concat(VERSAO);
    var ATRIBUTOS = {
        forca: "Força",
        destreza: "Destreza",
        constituicao: "Constituição",
        inteligencia: "Inteligência",
        sabedoria: "Sabedoria",
        carisma: "Carisma"
    };
    var ABREVIACOES = {
        forca: "FOR",
        destreza: "DES",
        constituicao: "CON",
        inteligencia: "INT",
        sabedoria: "SAB",
        carisma: "CAR"
    };
    var regras = null;
    var mapaNiveis = new Map();
    var mapaClas = new Map();
    var mapaAliasesCla = new Map();
    var modalAtual = null;
    var observadorCatalogo = null;
    function numero(valor, padrao) {
        if (padrao === void 0) { padrao = 0; }
        var texto = String(valor !== null && valor !== void 0 ? valor : "").trim().replace(",", ".");
        if (!texto)
            return padrao;
        var n = Number(texto);
        return Number.isFinite(n) ? n : padrao;
    }
    function inteiro(valor, padrao) {
        if (padrao === void 0) { padrao = 0; }
        var n = Number.parseInt(String(valor !== null && valor !== void 0 ? valor : "").trim(), 10);
        return Number.isFinite(n) ? n : padrao;
    }
    function limitarNivel(valor) {
        var maximo = inteiro(regras === null || regras === void 0 ? void 0 : regras.maxLevel, 20);
        return Math.max(1, Math.min(maximo, inteiro(valor, 1)));
    }
    function escaparHTML(valor) {
        return String(valor !== null && valor !== void 0 ? valor : "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function normalizarTexto(valor) {
        return String(valor !== null && valor !== void 0 ? valor : "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, " ")
            .trim();
    }
    function clonar(valor) {
        if (typeof structuredClone === "function")
            return structuredClone(valor);
        return JSON.parse(JSON.stringify(valor));
    }
    function regraNivel(nivel) {
        return mapaNiveis.get(inteiro(nivel, 1)) || null;
    }
    function regraCla(id) {
        return mapaClas.get(String(id || "")) || null;
    }
    function detectarCla(valor) {
        var e_1, _a;
        var _b, _c;
        if (arguments.length === 0)
            valor = (_c = (_b = campoSalvo("cla")) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : estado === null || estado === void 0 ? void 0 : estado.cla;
        var normalizado = normalizarTexto(valor);
        if (!normalizado)
            return null;
        var id = mapaAliasesCla.get(normalizado);
        if (id)
            return regraCla(id);
        try {
            for (var _d = __values(mapaAliasesCla.entries()), _e = _d.next(); !_e.done; _e = _d.next()) {
                var _f = __read(_e.value, 2), alias = _f[0], claId = _f[1];
                if (normalizado.includes(alias) || alias.includes(normalizado))
                    return regraCla(claId);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    function campoSalvo(chave) {
        return document.querySelector("[data-save=\"".concat(chave, "\"]"));
    }
    function valorCampo(chave, padrao) {
        var _a;
        if (padrao === void 0) { padrao = 0; }
        var campo = campoSalvo(chave);
        return numero((_a = campo === null || campo === void 0 ? void 0 : campo.value) !== null && _a !== void 0 ? _a : estado === null || estado === void 0 ? void 0 : estado[chave], padrao);
    }
    function definirCampo(chave, valor) {
        var campo = campoSalvo(chave);
        if (campo)
            campo.value = String(valor);
        estado[chave] = String(valor);
    }
    function nivelAtual() {
        var _a, _b;
        var campo = document.getElementById("nivelDisplayMini");
        return limitarNivel((_b = (_a = estado === null || estado === void 0 ? void 0 : estado.nivel) !== null && _a !== void 0 ? _a : campo === null || campo === void 0 ? void 0 : campo.value) !== null && _b !== void 0 ? _b : 1);
    }
    function pontuacaoAtributo(chave) {
        var _a, _b;
        return inteiro((_b = (_a = campoSalvo(chave)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : estado === null || estado === void 0 ? void 0 : estado[chave], 0);
    }
    function modificadorAtributo(chave) {
        return Math.floor((pontuacaoAtributo(chave) - 10) / 2);
    }
    function sinal(valor) {
        var n = numero(valor, 0);
        return n >= 0 ? "+".concat(n) : String(n);
    }
    function quantidadeExigida(escolha) {
        var _a;
        return Math.max(1, inteiro((_a = escolha === null || escolha === void 0 ? void 0 : escolha.selectionCount) !== null && _a !== void 0 ? _a : escolha === null || escolha === void 0 ? void 0 : escolha.minSelections, 1));
    }
    function maximoEscolhas(escolha) {
        return Math.max(quantidadeExigida(escolha), inteiro(escolha === null || escolha === void 0 ? void 0 : escolha.maxSelections, quantidadeExigida(escolha)));
    }
    function normalizarSelecao(escolha, valor) {
        var permitidas = new Set(((escolha === null || escolha === void 0 ? void 0 : escolha.options) || []).map(function (opcao) { return String(opcao.id); }));
        var origem = Array.isArray(valor) ? valor : (String(valor !== null && valor !== void 0 ? valor : "").trim() ? [valor] : []);
        var unicas = [];
        origem.forEach(function (item) {
            var id = String(item !== null && item !== void 0 ? item : "").trim();
            if (id && permitidas.has(id) && !unicas.includes(id))
                unicas.push(id);
        });
        return unicas.slice(0, maximoEscolhas(escolha));
    }
    function escolhaCompleta(escolha, valor) {
        return normalizarSelecao(escolha, valor).length === quantidadeExigida(escolha);
    }
    function selecaoParaSalvar(escolha, valores) {
        var normalizada = normalizarSelecao(escolha, valores);
        return quantidadeExigida(escolha) > 1 ? normalizada : (normalizada[0] || "");
    }
    function caracteristicasAte(nivel) {
        var _a;
        var ids = [];
        for (var atual = 0; atual <= nivel; atual += 1) {
            (((_a = regraNivel(atual)) === null || _a === void 0 ? void 0 : _a.features) || []).forEach(function (id) {
                if (!ids.includes(id))
                    ids.push(id);
            });
        }
        return ids;
    }
    function pontosClaAte(nivel) {
        var _a;
        var total = 0;
        for (var atual = 0; atual <= nivel; atual += 1) {
            total += inteiro((_a = regraNivel(atual)) === null || _a === void 0 ? void 0 : _a.clanPointsGrant, 0);
        }
        return total;
    }
    function valoresFixos(nivel) {
        var limitado = limitarNivel(nivel);
        var linha = regraNivel(limitado) || {};
        return {
            nivel: limitado,
            proficiencia: inteiro(linha.proficiency, 2),
            rankJutsu: String(linha.jutsuRank || "—"),
            pontosChave: inteiro(linha.keyPoints, 0),
            pontosCla: pontosClaAte(limitado),
            ataquesPorAcao: inteiro(linha.attacksPerAction, 1),
            chakraBase: inteiro(linha.chakraBase, 0),
            caracteristicas: caracteristicasAte(limitado)
        };
    }
    function recursosAtuais() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return {
            pv: numero((_b = (_a = document.getElementById("pv")) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : estado === null || estado === void 0 ? void 0 : estado.pv, 0),
            pvMax: numero((_d = (_c = document.getElementById("pvMax")) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : estado === null || estado === void 0 ? void 0 : estado.pvMax, 0),
            chakra: numero((_f = (_e = document.getElementById("chakra")) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : estado === null || estado === void 0 ? void 0 : estado.chakra, 0),
            chakraMax: numero((_h = (_g = document.getElementById("chakraMax")) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : estado === null || estado === void 0 ? void 0 : estado.chakraMax, 0)
        };
    }
    function fichaPareceNovaSemDados() {
        var _a, _b, _c;
        if (estado === null || estado === void 0 ? void 0 : estado.progressaoFixa)
            return false;
        if (nivelAtual() !== 1)
            return false;
        var camposTexto = ["nome", "cla", "rank", "vila", "idade"];
        var temIdentidade = camposTexto.some(function (chave) { var _a; return Object.prototype.hasOwnProperty.call(estado || {}, chave) && String((_a = estado === null || estado === void 0 ? void 0 : estado[chave]) !== null && _a !== void 0 ? _a : "").trim(); });
        var atributos = Object.keys(ATRIBUTOS).some(function (chave) { return pontuacaoAtributo(chave) > 0; });
        var temListas = (((_a = estado === null || estado === void 0 ? void 0 : estado.jutsus) === null || _a === void 0 ? void 0 : _a.length) || 0) + (((_b = estado === null || estado === void 0 ? void 0 : estado.armados) === null || _b === void 0 ? void 0 : _b.length) || 0) + (((_c = estado === null || estado === void 0 ? void 0 : estado.inventarioItens) === null || _c === void 0 ? void 0 : _c.length) || 0) > 0;
        var temRecursosSalvos = ["pv", "pvMax", "chakra", "chakraMax"].some(function (chave) { return numero(estado === null || estado === void 0 ? void 0 : estado[chave], 0) > 0; });
        return !temIdentidade && !atributos && !temListas && !temRecursosSalvos;
    }
    function registrarAtualizacoesRetroativas(progresso, nivel) {
        var _a;
        var registrados = new Set((progresso.history || [])
            .map(function (item) { return inteiro(item === null || item === void 0 ? void 0 : item.toLevel, -1); })
            .filter(function (item) { return item >= 1; }));
        var adicionados = [];
        var instante = new Date().toISOString();
        for (var alvo = 1; alvo <= nivel; alvo += 1) {
            if (registrados.has(alvo))
                continue;
            progresso.history.push({
                type: alvo === 1 ? "initial-level" : "retroactive-level",
                fromLevel: Math.max(0, alvo - 1),
                toLevel: alvo,
                appliedAt: instante,
                fixedAfter: valoresFixos(alvo),
                unlockedFeatures: __spreadArray([], __read((((_a = regraNivel(alvo)) === null || _a === void 0 ? void 0 : _a.features) || [])), false),
                retroactive: Boolean(progresso.migratedFromExistingLevel),
                resources: { status: progresso.migratedFromExistingLevel ? "preserved-existing" : "pending-level-one" }
            });
            adicionados.push(alvo);
        }
        if (adicionados.length && progresso.migratedFromExistingLevel) {
            progresso.lastRetroactiveUpdate = {
                levels: adicionados,
                fromLevel: adicionados[0],
                toLevel: adicionados[adicionados.length - 1],
                appliedAt: instante
            };
            if (progresso.retroactiveReviewPending !== false)
                progresso.retroactiveReviewPending = true;
        }
        progresso.retroactiveBackfillTo = Math.max(inteiro(progresso.retroactiveBackfillTo, 0), nivel);
        return adicionados.length > 0;
    }
    function migrarPendenciasAntigasComoPreservadas(progresso, nivel) {
        var alterou = false;
        var pendencias = progresso.pendingByLevel || {};
        Object.entries(pendencias).forEach(function (_a) {
            var _b = __read(_a, 2), chave = _b[0], item = _b[1];
            var nivelItem = inteiro(chave, 0);
            if (nivelItem > nivel || !item || typeof item !== "object")
                return;
            ["vida", "chakra"].forEach(function (tipo) {
                if (!item[tipo] || item[tipo].status === "pending") {
                    item[tipo] = { status: "preserved-existing", value: null };
                    alterou = true;
                }
            });
        });
        return alterou;
    }
    function garantirEstruturaProgressao() {
        var atual = nivelAtual();
        var fixos = valoresFixos(atual);
        var tinhaProgressao = Boolean(estado.progressaoFixa && typeof estado.progressaoFixa === "object" && !Array.isArray(estado.progressaoFixa));
        var novaSemDados = !tinhaProgressao && fichaPareceNovaSemDados();
        var alterou = false;
        if (!tinhaProgressao) {
            estado.progressaoFixa = {
                schemaVersion: 3,
                engineVersion: VERSAO,
                initializedAt: new Date().toISOString(),
                migratedFromExistingLevel: !novaSemDados,
                level: atual,
                choices: {},
                history: [],
                pendingByLevel: {}
            };
            alterou = true;
        }
        var progresso = estado.progressaoFixa;
        if (!progresso.choices || typeof progresso.choices !== "object") {
            progresso.choices = {};
            alterou = true;
        }
        if (!Array.isArray(progresso.history)) {
            progresso.history = [];
            alterou = true;
        }
        if (!progresso.pendingByLevel || typeof progresso.pendingByLevel !== "object") {
            progresso.pendingByLevel = {};
            alterou = true;
        }
        Object.entries((regras === null || regras === void 0 ? void 0 : regras.choices) || {}).forEach(function (_a) {
            var _b = __read(_a, 2), id = _b[0], escolha = _b[1];
            if (!(id in progresso.choices))
                return;
            var normalizada = selecaoParaSalvar(escolha, progresso.choices[id]);
            if (JSON.stringify(progresso.choices[id]) !== JSON.stringify(normalizada)) {
                progresso.choices[id] = normalizada;
                alterou = true;
            }
        });
        if (registrarAtualizacoesRetroativas(progresso, atual))
            alterou = true;
        if (!progresso.vital || typeof progresso.vital !== "object") {
            var snapshot = recursosAtuais();
            progresso.vital = novaSemDados ? {
                schemaVersion: 1,
                status: "needs-level-one-setup",
                initializedAt: new Date().toISOString(),
                startLevel: 1,
                historyStartLevel: 1
            } : {
                schemaVersion: 1,
                status: "preserved-existing",
                initializedAt: new Date().toISOString(),
                preservedAtLevel: atual,
                startLevel: Math.min(inteiro(regras === null || regras === void 0 ? void 0 : regras.maxLevel, 20) + 1, atual + 1),
                historyStartLevel: atual + 1,
                preservedSnapshot: snapshot,
                migrationRule: "keep-current-values"
            };
            alterou = true;
        }
        if (migrarPendenciasAntigasComoPreservadas(progresso, atual))
            alterou = true;
        var atualizacoes = {
            schemaVersion: 3,
            engineVersion: VERSAO,
            level: fixos.nivel,
            proficiency: fixos.proficiencia,
            jutsuRankMax: fixos.rankJutsu,
            keyPointsTotal: fixos.pontosChave,
            clanPointsEarned: fixos.pontosCla,
            attacksPerAction: fixos.ataquesPorAcao,
            chakraBase: fixos.chakraBase,
            activeFeatures: fixos.caracteristicas
        };
        Object.entries(atualizacoes).forEach(function (_a) {
            var _b = __read(_a, 2), chave = _b[0], valor = _b[1];
            if (JSON.stringify(progresso[chave]) !== JSON.stringify(valor)) {
                progresso[chave] = valor;
                alterou = true;
            }
        });
        return alterou;
    }
    function sincronizarCamposFixos() {
        var fixos = valoresFixos(nivelAtual());
        var campoNivel = document.getElementById("nivelDisplayMini");
        var campoProf = document.getElementById("bonusProficiencia");
        if (campoNivel) {
            campoNivel.value = String(fixos.nivel);
            campoNivel.readOnly = true;
            campoNivel.min = "1";
            campoNivel.max = String((regras === null || regras === void 0 ? void 0 : regras.maxLevel) || 20);
            campoNivel.inputMode = "none";
            campoNivel.setAttribute("aria-label", "Nível atual. Toque para abrir a progressão e subir para o próximo nível.");
            campoNivel.setAttribute("role", "button");
            campoNivel.setAttribute("title", "Abrir progressão de nível");
        }
        if (campoProf) {
            campoProf.value = String(fixos.proficiencia);
            campoProf.readOnly = true;
            campoProf.setAttribute("aria-label", "Bônus de proficiência calculado automaticamente pelo nível.");
        }
        estado.nivel = String(fixos.nivel);
        estado.proficiencia = String(fixos.proficiencia);
    }
    function aplicarNivelManual(valor, _a) {
        var _b;
        var _c = _a === void 0 ? {} : _a, _d = _c.origem, origem = _d === void 0 ? "manual" : _d, _e = _c.notificar, notificar = _e === void 0 ? false : _e;
        if (!regras)
            return false;
        var progressoAnterior = inteiro((_b = estado === null || estado === void 0 ? void 0 : estado.progressaoFixa) === null || _b === void 0 ? void 0 : _b.level, inteiro(estado === null || estado === void 0 ? void 0 : estado.nivel, 1));
        var alvo = limitarNivel(valor);
        var fixos = valoresFixos(alvo);
        var alterou = progressoAnterior !== alvo || inteiro(estado === null || estado === void 0 ? void 0 : estado.nivel, 1) !== alvo;
        estado.nivel = String(alvo);
        estado.proficiencia = String(fixos.proficiencia);
        garantirEstruturaProgressao();
        var progresso = estado.progressaoFixa;
        progresso.level = alvo;
        progresso.proficiency = fixos.proficiencia;
        progresso.jutsuRankMax = fixos.rankJutsu;
        progresso.keyPointsTotal = fixos.pontosChave;
        progresso.clanPointsEarned = fixos.pontosCla;
        progresso.attacksPerAction = fixos.ataquesPorAcao;
        progresso.chakraBase = fixos.chakraBase;
        progresso.activeFeatures = fixos.caracteristicas;
        if (alterou) {
            progresso.history.push({
                type: "manual-level-adjustment",
                fromLevel: progressoAnterior,
                toLevel: alvo,
                source: String(origem || "manual"),
                appliedAt: new Date().toISOString(),
                fixedAfter: fixos,
                resources: { status: "preserved-existing" }
            });
            progresso.history = progresso.history.slice(-160);
        }
        sincronizarCamposFixos();
        persistirSeguro();
        atualizarIntegracoes();
        if (notificar && alterou) {
            var mensagem = "O n\u00EDvel da ficha foi ajustado para ".concat(alvo, ". PV e Chakra foram preservados.");
            if (typeof avisoShinobi === "function")
                avisoShinobi("Nível atualizado", mensagem);
            else
                alert(mensagem);
        }
        return true;
    }
    function abrirProgressaoPeloNivel() {
        if (!regras)
            return;
        // O número do nível abre primeiro o painel completo da progressão atual.
        // A partir dele o jogador pode iniciar o próximo Level Up, concluir escolhas
        // pendentes, configurar o nível 1 ou consultar o histórico.
        abrirProgressaoFixa();
    }
    function ligarEdicaoManualNivel() {
        var campo = document.getElementById("nivelDisplayMini");
        if (!campo || campo.dataset.manualLevelListener === "1")
            return;
        campo.dataset.manualLevelListener = "1";
        // O número do nível deixa de ser um campo de edição direta na ficha.
        // Ele vira o gatilho oficial para abrir a progressão do próximo nível,
        // garantindo que rolagens, escolhas e características sejam preenchidas.
        campo.readOnly = true;
        campo.setAttribute("aria-label", "Nível atual. Toque para abrir a progressão do personagem.");
        campo.setAttribute("role", "button");
        campo.setAttribute("title", "Abrir progressão do personagem");
        campo.tabIndex = 0;
        var abrir = function (evento) {
            var _a;
            (_a = evento === null || evento === void 0 ? void 0 : evento.preventDefault) === null || _a === void 0 ? void 0 : _a.call(evento);
            campo.blur();
            abrirProgressaoPeloNivel();
        };
        campo.addEventListener("click", abrir);
        campo.addEventListener("keydown", function (evento) {
            if (evento.key === "Enter" || evento.key === " ") {
                abrir(evento);
            }
        });
    }
    function persistirSeguro(contexto) {
        if (contexto === void 0) { contexto = {}; }
        if (typeof persistirEstadoLocal === "function")
            return persistirEstadoLocal(contexto);
        try {
            localStorage.setItem(CHAVE, JSON.stringify(estado));
            return true;
        }
        catch (erro) {
            console.error(erro);
            return false;
        }
    }
    function atualizarIntegracoes() {
        if (typeof atualizarCAAutomatica === "function")
            atualizarCAAutomatica();
        if (typeof atualizarDefesasTotaisBatalha === "function")
            atualizarDefesasTotaisBatalha();
        if (typeof atualizarPerfil === "function")
            atualizarPerfil();
        if (typeof atualizarPlacar === "function")
            atualizarPlacar();
        renderizarResumo();
        renderizarAtaquesPorAcaoBatalha();
        atualizarIndicadorCatalogo();
        if (typeof window.atualizarTestesResistenciaBatalha === "function")
            window.atualizarTestesResistenciaBatalha();
    }
    function renderizarAtaquesPorAcaoBatalha() {
        var grid = document.querySelector("#batalha .defesasGrid");
        if (!grid || !regras)
            return;
        var card = document.getElementById("ataquesPorAcaoCard");
        if (!card) {
            card = document.createElement("div");
            card.id = "ataquesPorAcaoCard";
            card.className = "levelUpBattleCard";
            card.innerHTML = '<span>Ataques/Ação</span><strong id="ataquesPorAcaoView">1</strong>';
            grid.appendChild(card);
        }
        var view = document.getElementById("ataquesPorAcaoView");
        if (view)
            view.textContent = String(valoresFixos(nivelAtual()).ataquesPorAcao);
    }
    function totalSelecoesPendentesAte(nivel) {
        var _a;
        var salvas = ((_a = estado.progressaoFixa) === null || _a === void 0 ? void 0 : _a.choices) || {};
        return Object.entries((regras === null || regras === void 0 ? void 0 : regras.choices) || {}).reduce(function (total, _a) {
            var _b = __read(_a, 2), id = _b[0], escolha = _b[1];
            if (!escolha.required || inteiro(escolha.level, 999) > nivel)
                return total;
            return total + Math.max(0, quantidadeExigida(escolha) - normalizarSelecao(escolha, salvas[id]).length);
        }, 0);
    }
    function escolhasPendentesAte(nivel) {
        var _a;
        var salvas = ((_a = estado.progressaoFixa) === null || _a === void 0 ? void 0 : _a.choices) || {};
        return Object.entries((regras === null || regras === void 0 ? void 0 : regras.choices) || {})
            .map(function (_a) {
            var _b = __read(_a, 2), id = _b[0], escolha = _b[1];
            return (__assign({ id: id }, escolha));
        })
            .filter(function (escolha) { return escolha.required && inteiro(escolha.level, 999) > 0 && inteiro(escolha.level, 999) <= nivel && !escolhaCompleta(escolha, salvas[escolha.id]); })
            .sort(function (a, b) { return inteiro(a.level, 0) - inteiro(b.level, 0); });
    }
    function precisaConfigurarNivelUm() {
        var _a, _b;
        return ((_b = (_a = estado.progressaoFixa) === null || _a === void 0 ? void 0 : _a.vital) === null || _b === void 0 ? void 0 : _b.status) === "needs-level-one-setup" && nivelAtual() === 1;
    }
    function textoStatus() {
        if (!regras)
            return "Carregando";
        var faltam = totalSelecoesPendentesAte(nivelAtual());
        if (faltam)
            return "".concat(faltam, " escolha").concat(faltam === 1 ? "" : "s", " pendente").concat(faltam === 1 ? "" : "s");
        if (precisaConfigurarNivelUm())
            return "Configurar PV e Chakra";
        return nivelAtual() >= inteiro(regras.maxLevel, 20) ? "Nível máximo" : "Level Up pronto";
    }
    function caracteristicasResumoHTML(fixos) {
        var itens = fixos.caracteristicas.map(function (id) { var _a; return (__assign({ id: id }, (((_a = regras.features) === null || _a === void 0 ? void 0 : _a[id]) || { name: id, short: "" }))); });
        return "\n      <details class=\"levelUpProgressaoDetalhes\">\n        <summary>\n          <span>Caracter\u00EDsticas de progress\u00E3o</span>\n          <strong>".concat(itens.length, "</strong>\n        </summary>\n        <div class=\"levelUpProgressaoLista\">\n          ").concat(itens.length ? itens.map(function (item) { return "<article><strong>".concat(escaparHTML(item.name), "</strong><small>").concat(escaparHTML(item.short || item.description || ""), "</small></article>"); }).join("") : '<div class="levelUpVazio">Nenhuma característica liberada.</div>', "\n        </div>\n      </details>");
    }
    function renderizarResumo() {
        var host = document.getElementById("levelUpResumoHost");
        if (!host)
            return;
        if (!regras) {
            host.innerHTML = '<section class="levelUpResumoCard"><div class="levelUpResumoTitulo"><small>Progressão</small><strong>Carregando regras...</strong></div></section>';
            return;
        }
        var fixos = valoresFixos(nivelAtual());
        var maximo = fixos.nivel >= inteiro(regras.maxLevel, 20);
        var precisaEscolher = escolhasPendentesAte(fixos.nivel).length > 0;
        var quantidadePendente = totalSelecoesPendentesAte(fixos.nivel);
        var configurarNivel1 = precisaConfigurarNivelUm();
        var acao = "abrirLevelUp()";
        var textoBotao = maximo ? "Nível máximo" : "Subir de nível";
        if (precisaEscolher) {
            acao = "abrirEscolhasPendentes()";
            textoBotao = "Completar ".concat(quantidadePendente, " escolha").concat(quantidadePendente === 1 ? "" : "s");
        }
        else if (configurarNivel1) {
            acao = "abrirConfiguracaoNivelUm()";
            textoBotao = "Configurar nível 1";
        }
        host.innerHTML = "\n      <section class=\"levelUpResumoCard\" aria-label=\"Resumo da progress\u00E3o\">\n        <div class=\"levelUpResumoTopo\">\n          <div class=\"levelUpResumoTitulo\"><small>Progress\u00E3o Shinobi</small><strong>N\u00EDvel ".concat(fixos.nivel, "</strong></div>\n          <span class=\"levelUpResumoStatus\">").concat(escaparHTML(textoStatus()), "</span>\n        </div>\n        <div class=\"levelUpResumoGrid\">\n          <div class=\"levelUpResumoItem\"><span>Profici\u00EAncia</span><strong>+").concat(fixos.proficiencia, "</strong></div>\n          <div class=\"levelUpResumoItem\"><span>Rank m\u00E1ximo</span><strong>").concat(escaparHTML(fixos.rankJutsu), "</strong></div>\n          <div class=\"levelUpResumoItem\"><span>Ataques/A\u00E7\u00E3o</span><strong>").concat(fixos.ataquesPorAcao, "</strong></div>\n          <div class=\"levelUpResumoItem\"><span>Chakra-base</span><strong>").concat(fixos.chakraBase, "</strong></div>\n        </div>\n        <section class=\"levelUpRecursosBloco\" aria-label=\"Recursos de progress\u00E3o\">\n          <div><span>Pontos-chave</span><strong>").concat(fixos.pontosChave, "</strong><small>Total do n\u00EDvel</small></div>\n          <div><span>Pontos de Cl\u00E3</span><strong>").concat(fixos.pontosCla, "</strong><small>Conquistados</small></div>\n        </section>\n        ").concat(caracteristicasResumoHTML(fixos), "\n        <div class=\"levelUpResumoAcoes\">\n          <button type=\"button\" class=\"levelUpBtn\" onclick=\"").concat(acao, "\" ").concat((maximo && !precisaEscolher && !configurarNivel1) ? "disabled" : "", ">").concat(textoBotao, "</button>\n          <button type=\"button\" class=\"levelUpBtnSecundario\" onclick=\"abrirProgressaoFixa()\">Ver hist\u00F3rico</button>\n        </div>\n      </section>");
    }
    function fecharModal() {
        modalAtual === null || modalAtual === void 0 ? void 0 : modalAtual.remove();
        modalAtual = null;
        document.body.classList.remove("levelUpAberto");
    }
    function criarModal(conteudo, acoes) {
        var _a;
        if (acoes === void 0) { acoes = ""; }
        fecharModal();
        var overlay = document.createElement("div");
        overlay.className = "levelUpOverlay";
        overlay.innerHTML = "<section class=\"levelUpModal\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Progress\u00E3o do personagem\">".concat(conteudo).concat(acoes, "</section>");
        overlay.addEventListener("click", function (evento) { if (evento.target === overlay)
            fecharModal(); });
        document.body.appendChild(overlay);
        document.body.classList.add("levelUpAberto");
        modalAtual = overlay;
        (_a = overlay.querySelector(".levelUpFechar")) === null || _a === void 0 ? void 0 : _a.focus();
        return overlay;
    }
    function comparacao(rotulo, antes, depois) {
        var mudou = String(antes) !== String(depois);
        return "<div class=\"levelUpComparacaoItem\"><span>".concat(escaparHTML(rotulo), "</span><strong class=\"").concat(mudou ? "levelUpMudou" : "", "\">").concat(escaparHTML(String(antes))).concat(mudou ? " \u2192 ".concat(escaparHTML(String(depois))) : "", "</strong></div>");
    }
    function caracteristicasDoNivel(nivel) {
        var _a;
        return (((_a = regraNivel(nivel)) === null || _a === void 0 ? void 0 : _a.features) || []).map(function (id) { var _a; return (__assign({ id: id }, (((_a = regras.features) === null || _a === void 0 ? void 0 : _a[id]) || { name: id, short: "" }))); });
    }
    function tagModo(modo) {
        return {
            fixed: "Aplicação fixa",
            information: "Regra liberada",
            "deferred-calculation": "Regra de recurso",
            "deferred-roll": "Rolagem guiada",
            "required-choice": "Escolha obrigatória",
            "guided-choice": "Escolha com o mestre"
        }[modo] || "Característica";
    }
    function escolhaObrigatoriaDoNivel(nivel) {
        return Object.entries(regras.choices || {})
            .map(function (_a) {
            var _b = __read(_a, 2), id = _b[0], escolha = _b[1];
            return (__assign({ id: id }, escolha));
        })
            .find(function (escolha) { return inteiro(escolha.level, -1) === nivel && escolha.required; }) || null;
    }
    function htmlEscolha(escolha) {
        var _a, _b;
        if (!escolha)
            return "";
        var atuais = normalizarSelecao(escolha, (_b = (_a = estado.progressaoFixa) === null || _a === void 0 ? void 0 : _a.choices) === null || _b === void 0 ? void 0 : _b[escolha.id]);
        var multipla = quantidadeExigida(escolha) > 1;
        var tipo = multipla ? "checkbox" : "radio";
        return "\n      <section class=\"levelUpSecao\" data-level-up-choice=\"".concat(escaparHTML(escolha.id), "\">\n        <h3>").concat(escaparHTML(escolha.label), "</h3>\n        <div class=\"levelUpEscolhaInstrucao\"><span>").concat(escaparHTML(escolha.help || "Selecione ".concat(quantidadeExigida(escolha), " op\u00E7\u00E3o").concat(quantidadeExigida(escolha) === 1 ? "" : "ões", ".")), "</span><strong class=\"levelUpEscolhaContador\" data-choice-counter>").concat(atuais.length, "/").concat(quantidadeExigida(escolha), "</strong></div>\n        <div class=\"levelUpEscolhas\">\n          ").concat((escolha.options || []).map(function (opcao) { return "<label class=\"levelUpOpcao\"><input type=\"".concat(tipo, "\" name=\"levelUpEscolha\" value=\"").concat(escaparHTML(opcao.id), "\" ").concat(atuais.includes(opcao.id) ? "checked" : "", "><span><strong>").concat(escaparHTML(opcao.label), "</strong><small>").concat(escaparHTML(opcao.ability), "</small></span></label>"); }).join(""), "\n        </div>\n      </section>");
    }
    function lerSelecaoModal(escolha) {
        if (!modalAtual || !escolha)
            return quantidadeExigida(escolha) > 1 ? [] : "";
        var valores = __spreadArray([], __read(modalAtual.querySelectorAll('input[name="levelUpEscolha"]:checked')), false).map(function (input) { return input.value; });
        return selecaoParaSalvar(escolha, valores);
    }
    function configurarControleEscolha(modal, escolha, aoAtualizar) {
        if (!modal || !escolha)
            return;
        var inputs = __spreadArray([], __read(modal.querySelectorAll('input[name="levelUpEscolha"]')), false);
        var atualizar = function (alterado) {
            if (alterado === void 0) { alterado = null; }
            var marcados = inputs.filter(function (input) { return input.checked; });
            var maximo = maximoEscolhas(escolha);
            if (marcados.length > maximo && alterado) {
                alterado.checked = false;
                marcados = inputs.filter(function (input) { return input.checked; });
            }
            inputs.forEach(function (input) { input.disabled = !input.checked && marcados.length >= maximo; });
            var contador = modal.querySelector('[data-choice-counter]');
            if (contador)
                contador.textContent = "".concat(marcados.length, "/").concat(quantidadeExigida(escolha));
            aoAtualizar === null || aoAtualizar === void 0 ? void 0 : aoAtualizar();
        };
        inputs.forEach(function (input) { return input.addEventListener("change", function () { return atualizar(input); }); });
        atualizar();
    }
    function opcoesClaHTML(selecionada) {
        return "<option value=\"\">Selecione o cl\u00E3 usado no c\u00E1lculo</option>".concat((regras.clans || []).map(function (cla) { return "<option value=\"".concat(escaparHTML(cla.id), "\" ").concat(cla.id === selecionada ? "selected" : "", ">").concat(escaparHTML(cla.label), "</option>"); }).join(""));
    }
    function htmlCalculadoraRecursos(nivel, inicial) {
        var _a, _b;
        var detectada = detectarCla();
        var selecionada = (detectada === null || detectada === void 0 ? void 0 : detectada.id) || ((_b = (_a = estado.progressaoFixa) === null || _a === void 0 ? void 0 : _a.vital) === null || _b === void 0 ? void 0 : _b.lastClanRuleId) || "";
        return "\n      <section class=\"levelUpSecao levelUpCalculadora\" data-level-up-calculadora>\n        <h3>".concat(inicial ? "PV e Chakra iniciais" : "Ganho de PV e Chakra", "</h3>\n        <label class=\"levelUpCampoCompleto\">\n          <span>Regra de cl\u00E3</span>\n          <select id=\"levelUpClaRegra\">").concat(opcoesClaHTML(selecionada), "</select>\n          <small id=\"levelUpClaAjuda\">").concat(detectada ? "Cl\u00E3 detectado na ficha: ".concat(escaparHTML(detectada.label), ".") : "O clã digitado na ficha não foi reconhecido. Escolha a regra correta.", "</small>\n        </label>\n\n        <div class=\"levelUpRecursoPainel levelUpVidaPainel\">\n          <header><div><span>Vida</span><strong id=\"levelUpVidaDado\">\u2014</strong></div><b id=\"levelUpVidaTotal\">\u2014</b></header>\n          ").concat(inicial ? '<div class="levelUpMetodoFixo">No nível 1, o dado de Vida usa automaticamente o valor máximo.</div>' : "\n            <div class=\"levelUpMetodoEscolha\">\n              <label><input type=\"radio\" name=\"levelUpVidaMetodo\" value=\"media\" checked><span>Usar m\u00E9dia</span></label>\n              <label><input type=\"radio\" name=\"levelUpVidaMetodo\" value=\"rolagem\"><span>Informar rolagem</span></label>\n            </div>\n            <label class=\"levelUpCampoRolagem\"><span>Resultado do dado de Vida</span><input id=\"levelUpVidaRolagem\" type=\"number\" inputmode=\"numeric\" min=\"1\" step=\"1\" disabled><small id=\"levelUpVidaLimite\">Escolha a rolagem para preencher.</small></label>", "\n          <div id=\"levelUpVidaFormula\" class=\"levelUpFormula\">Selecione um cl\u00E3.</div>\n        </div>\n\n        <div class=\"levelUpRecursoPainel levelUpChakraPainel\">\n          <header><div><span>Chakra</span><strong id=\"levelUpChakraDado\">\u2014</strong></div><b id=\"levelUpChakraTotal\">\u2014</b></header>\n          <label class=\"levelUpCampoRolagem\"><span>Resultado do dado de Chakra</span><input id=\"levelUpChakraRolagem\" type=\"number\" inputmode=\"numeric\" min=\"1\" step=\"1\"><small id=\"levelUpChakraLimite\">Informe o resultado rolado.</small></label>\n          <div id=\"levelUpChakraFormula\" class=\"levelUpFormula\">Selecione um cl\u00E3.</div>\n        </div>\n\n        <div id=\"levelUpErroCalculo\" class=\"levelUpErroCalculo\" hidden></div>\n        <div class=\"levelUpNotaRegra\">CON\u00B2 e INT\u00B2 s\u00E3o aplicados como <strong>duas vezes o modificador</strong> do atributo.</div>\n      </section>");
    }
    function ajustesRegra(regraRecurso) {
        var detalhes = [];
        var total = inteiro(regraRecurso === null || regraRecurso === void 0 ? void 0 : regraRecurso.flat, 0);
        var faltando = [];
        ((regraRecurso === null || regraRecurso === void 0 ? void 0 : regraRecurso.adjustments) || []).forEach(function (ajuste) {
            var atributo = String(ajuste.ability || "");
            var score = pontuacaoAtributo(atributo);
            var multiplicador = Math.max(1, inteiro(ajuste.multiplier, 1));
            if (score <= 0)
                faltando.push(atributo);
            var mod = modificadorAtributo(atributo);
            var parcela = mod * multiplicador;
            total += parcela;
            detalhes.push({ atributo: atributo, score: score, mod: mod, multiplicador: multiplicador, parcela: parcela });
        });
        if (inteiro(regraRecurso === null || regraRecurso === void 0 ? void 0 : regraRecurso.flat, 0) !== 0) {
            detalhes.push({ atributo: null, flat: inteiro(regraRecurso.flat, 0), parcela: inteiro(regraRecurso.flat, 0) });
        }
        return { total: total, detalhes: detalhes, faltando: __spreadArray([], __read(new Set(faltando)), false) };
    }
    function textoAjustes(calculo) {
        if (!calculo.detalhes.length)
            return "sem modificador de atributo";
        return calculo.detalhes.map(function (item) {
            if (item.atributo === null)
                return "".concat(sinal(item.flat), " fixo");
            var mult = item.multiplicador > 1 ? "".concat(item.multiplicador, "\u00D7 ") : "";
            return "".concat(mult, "Mod. ").concat(ABREVIACOES[item.atributo], " ").concat(sinal(item.mod)).concat(item.multiplicador > 1 ? " = ".concat(sinal(item.parcela)) : "");
        }).join(" · ");
    }
    function lerCalculoModal(nivel, inicial) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!modalAtual)
            return { valido: false, erro: "Janela de Level Up fechada." };
        var claId = ((_a = modalAtual.querySelector("#levelUpClaRegra")) === null || _a === void 0 ? void 0 : _a.value) || "";
        var cla = regraCla(claId);
        if (!cla)
            return { valido: false, erro: "Selecione a regra de clã." };
        var vidaAjustes = ajustesRegra(cla.life);
        var chakraAjustes = ajustesRegra(cla.chakra);
        var faltando = __spreadArray([], __read(new Set(__spreadArray(__spreadArray([], __read(vidaAjustes.faltando), false), __read(chakraAjustes.faltando), false))), false);
        if (faltando.length) {
            return { valido: false, erro: "Preencha na p\u00E1gina Atributos: ".concat(faltando.map(function (chave) { return ATRIBUTOS[chave] || chave; }).join(", "), "."), cla: cla, vidaAjustes: vidaAjustes, chakraAjustes: chakraAjustes };
        }
        var dadoVida = inteiro((_b = cla.life) === null || _b === void 0 ? void 0 : _b.die, 0);
        var dadoChakra = inteiro((_c = cla.chakra) === null || _c === void 0 ? void 0 : _c.die, 0);
        var metodoVida = inicial ? "maximo" : (((_d = modalAtual.querySelector('input[name="levelUpVidaMetodo"]:checked')) === null || _d === void 0 ? void 0 : _d.value) || "media");
        var baseVida = 0;
        if (inicial) {
            baseVida = dadoVida;
        }
        else if (metodoVida === "media") {
            baseVida = Math.floor(dadoVida / 2) + 1;
        }
        else {
            baseVida = inteiro((_e = modalAtual.querySelector("#levelUpVidaRolagem")) === null || _e === void 0 ? void 0 : _e.value, 0);
            if (baseVida < 1 || baseVida > dadoVida) {
                return { valido: false, erro: "O resultado de Vida deve estar entre 1 e ".concat(dadoVida, "."), cla: cla, vidaAjustes: vidaAjustes, chakraAjustes: chakraAjustes, dadoVida: dadoVida, dadoChakra: dadoChakra, metodoVida: metodoVida };
            }
        }
        var ganhoVida = baseVida + vidaAjustes.total;
        var rolagemChakra = inteiro((_f = modalAtual.querySelector("#levelUpChakraRolagem")) === null || _f === void 0 ? void 0 : _f.value, 0);
        if (rolagemChakra < 1 || rolagemChakra > dadoChakra) {
            return { valido: false, erro: "O resultado de Chakra deve estar entre 1 e ".concat(dadoChakra, "."), cla: cla, vidaAjustes: vidaAjustes, chakraAjustes: chakraAjustes, dadoVida: dadoVida, dadoChakra: dadoChakra, metodoVida: metodoVida, baseVida: baseVida, ganhoVida: ganhoVida };
        }
        var chakraBase = inteiro((_g = regraNivel(nivel)) === null || _g === void 0 ? void 0 : _g.chakraBase, 0);
        /* Chakra-base é referência da progressão do nível. Não é um bônus
           acumulado no Level Up. O ganho real é somente dado do clã + ajustes. */
        var ganhoChakra = rolagemChakra + chakraAjustes.total;
        if (ganhoVida <= 0)
            return { valido: false, erro: "O ganho total de Vida ficou igual ou abaixo de zero. Revise os atributos e a regra de clã." };
        if (ganhoChakra <= 0)
            return { valido: false, erro: "O ganho total de Chakra ficou igual ou abaixo de zero. Revise os atributos e a regra de clã." };
        return {
            valido: true,
            nivel: nivel,
            inicial: inicial,
            cla: cla,
            dadoVida: dadoVida,
            dadoChakra: dadoChakra,
            metodoVida: metodoVida,
            baseVida: baseVida,
            rolagemChakra: rolagemChakra,
            chakraBase: chakraBase,
            vidaAjustes: vidaAjustes,
            chakraAjustes: chakraAjustes,
            ganhoVida: ganhoVida,
            ganhoChakra: ganhoChakra,
            atributos: Object.fromEntries(Object.keys(ATRIBUTOS).map(function (chave) { return [chave, { score: pontuacaoAtributo(chave), modifier: modificadorAtributo(chave) }]; }))
        };
    }
    function atualizarCalculadora(nivel, inicial, escolha) {
        var _a, _b, _c, _d, _e;
        if (escolha === void 0) { escolha = null; }
        if (!modalAtual)
            return;
        var cla = regraCla(((_a = modalAtual.querySelector("#levelUpClaRegra")) === null || _a === void 0 ? void 0 : _a.value) || "");
        var vidaDado = modalAtual.querySelector("#levelUpVidaDado");
        var chakraDado = modalAtual.querySelector("#levelUpChakraDado");
        var vidaFormula = modalAtual.querySelector("#levelUpVidaFormula");
        var chakraFormula = modalAtual.querySelector("#levelUpChakraFormula");
        var vidaTotal = modalAtual.querySelector("#levelUpVidaTotal");
        var chakraTotal = modalAtual.querySelector("#levelUpChakraTotal");
        var vidaInput = modalAtual.querySelector("#levelUpVidaRolagem");
        var chakraInput = modalAtual.querySelector("#levelUpChakraRolagem");
        var vidaLimite = modalAtual.querySelector("#levelUpVidaLimite");
        var chakraLimite = modalAtual.querySelector("#levelUpChakraLimite");
        var erroEl = modalAtual.querySelector("#levelUpErroCalculo");
        var botao = modalAtual.querySelector("#confirmarLevelUpBtn");
        if (cla) {
            var dv = inteiro((_b = cla.life) === null || _b === void 0 ? void 0 : _b.die, 0);
            var dc = inteiro((_c = cla.chakra) === null || _c === void 0 ? void 0 : _c.die, 0);
            if (vidaDado)
                vidaDado.textContent = "1d".concat(dv);
            if (chakraDado)
                chakraDado.textContent = "1d".concat(dc);
            if (vidaInput) {
                vidaInput.max = String(dv);
                var metodo = ((_d = modalAtual.querySelector('input[name="levelUpVidaMetodo"]:checked')) === null || _d === void 0 ? void 0 : _d.value) || "media";
                vidaInput.disabled = metodo !== "rolagem";
                if (vidaLimite)
                    vidaLimite.textContent = metodo === "rolagem" ? "Valor permitido: 1 a ".concat(dv, ".") : "M\u00E9dia autom\u00E1tica: ".concat(Math.floor(dv / 2) + 1, ".");
            }
            if (chakraInput)
                chakraInput.max = String(dc);
            if (chakraLimite)
                chakraLimite.textContent = "Valor permitido: 1 a ".concat(dc, ".");
        }
        else {
            if (vidaDado)
                vidaDado.textContent = "—";
            if (chakraDado)
                chakraDado.textContent = "—";
            if (vidaInput)
                vidaInput.disabled = true;
        }
        var calculo = lerCalculoModal(nivel, inicial);
        if (calculo.cla) {
            var metodoTexto = inicial ? "m\u00E1ximo ".concat(calculo.dadoVida) : (calculo.metodoVida === "media" ? "m\u00E9dia ".concat(calculo.baseVida) : "rolagem ".concat(calculo.baseVida || "—"));
            if (vidaFormula)
                vidaFormula.innerHTML = "".concat(escaparHTML(metodoTexto), " <b>").concat(escaparHTML(textoAjustes(calculo.vidaAjustes)), "</b>");
            if (chakraFormula)
                chakraFormula.innerHTML = "rolagem ".concat(calculo.rolagemChakra || "—", " <b>").concat(escaparHTML(textoAjustes(calculo.chakraAjustes)), "</b> <span>\u00B7 Chakra-base ").concat(inteiro((_e = regraNivel(nivel)) === null || _e === void 0 ? void 0 : _e.chakraBase, 0), " (refer\u00EAncia, n\u00E3o somado)</span>");
        }
        else {
            if (vidaFormula)
                vidaFormula.textContent = "Selecione um clã.";
            if (chakraFormula)
                chakraFormula.textContent = "Selecione um clã.";
        }
        if (vidaTotal)
            vidaTotal.textContent = Number.isFinite(calculo.ganhoVida) ? "+".concat(calculo.ganhoVida) : "—";
        if (chakraTotal)
            chakraTotal.textContent = Number.isFinite(calculo.ganhoChakra) ? "+".concat(calculo.ganhoChakra) : "—";
        if (erroEl) {
            erroEl.hidden = calculo.valido;
            erroEl.textContent = calculo.valido ? "" : calculo.erro;
        }
        var escolhaValida = !escolha || escolhaCompleta(escolha, lerSelecaoModal(escolha));
        if (botao)
            botao.disabled = !(calculo.valido && escolhaValida);
        modalAtual.__levelUpCalculo = calculo;
    }
    function configurarCalculadora(modal, nivel, inicial, escolha) {
        var _a, _b, _c;
        var atualizar = function () { return atualizarCalculadora(nivel, inicial, escolha); };
        (_a = modal.querySelector("#levelUpClaRegra")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", atualizar);
        modal.querySelectorAll('input[name="levelUpVidaMetodo"]').forEach(function (input) { return input.addEventListener("change", atualizar); });
        (_b = modal.querySelector("#levelUpVidaRolagem")) === null || _b === void 0 ? void 0 : _b.addEventListener("input", atualizar);
        (_c = modal.querySelector("#levelUpChakraRolagem")) === null || _c === void 0 ? void 0 : _c.addEventListener("input", atualizar);
        configurarControleEscolha(modal, escolha, atualizar);
        atualizar();
    }
    function abrirAssistenteNivel(nivel, _a) {
        var _b;
        var _c = _a === void 0 ? {} : _a, _d = _c.inicial, inicial = _d === void 0 ? false : _d;
        var atual = nivelAtual();
        var alvo = limitarNivel(nivel);
        if (!inicial && alvo !== atual + 1) {
            alert("A progressão precisa ocorrer um nível por vez.");
            return;
        }
        var antes = valoresFixos(inicial ? 1 : atual);
        var depois = valoresFixos(alvo);
        var novas = caracteristicasDoNivel(alvo);
        var escolha = inicial ? null : escolhaObrigatoriaDoNivel(alvo);
        var ganhoCla = inicial ? 0 : inteiro((_b = regraNivel(alvo)) === null || _b === void 0 ? void 0 : _b.clanPointsGrant, 0);
        var recursos = recursosAtuais();
        var corpo = "\n      <header class=\"levelUpModalCabecalho\">\n        <div><span class=\"levelUpModalSelo\">".concat(inicial ? "Configuração inicial" : "Level Up completo", "</span><h2>").concat(inicial ? "Nível 1" : "N\u00EDvel ".concat(atual, " \u2192 ").concat(alvo), "</h2></div>\n        <button type=\"button\" class=\"levelUpFechar\" onclick=\"fecharLevelUp()\" aria-label=\"Fechar\">\u00D7</button>\n      </header>\n      <div class=\"levelUpModalCorpo\">\n        <div class=\"levelUpAvisoFase\">").concat(inicial ? "Configure os valores iniciais usando o máximo do dado de Vida e uma rolagem de Chakra." : "Informe as rolagens e confira todos os valores antes de confirmar. A ficha só será alterada no final.", "</div>\n        ").concat(inicial ? "<div class=\"levelUpComparacao\">".concat(comparacao("PV atual", recursos.pvMax, "será substituído")).concat(comparacao("Chakra atual", recursos.chakraMax, "será substituído")).concat(comparacao("Chakra-base do nível", depois.chakraBase, depois.chakraBase), "</div>") : "<div class=\"levelUpComparacao\">".concat(comparacao("Proficiência", "+".concat(antes.proficiencia), "+".concat(depois.proficiencia))).concat(comparacao("Rank máximo de Jutsu", antes.rankJutsu, depois.rankJutsu)).concat(comparacao("Pontos-chave", antes.pontosChave, depois.pontosChave)).concat(comparacao("Ataques por ação", antes.ataquesPorAcao, depois.ataquesPorAcao)).concat(ganhoCla ? comparacao("Pontos de Clã", antes.pontosCla, depois.pontosCla) : "").concat(comparacao("Chakra-base", antes.chakraBase, depois.chakraBase), "</div>"), "\n        ").concat(htmlCalculadoraRecursos(alvo, inicial), "\n        ").concat(!inicial ? "<section class=\"levelUpSecao\"><h3>Caracter\u00EDsticas do n\u00EDvel</h3><div class=\"levelUpLista\">".concat(novas.length ? novas.map(function (item) { return "<article class=\"levelUpCaracteristica\"><strong>".concat(escaparHTML(item.name), "</strong><p>").concat(escaparHTML(item.short || item.description || ""), "</p><span class=\"levelUpTag\">").concat(escaparHTML(tagModo(item.mode)), "</span></article>"); }).join("") : '<div class="levelUpVazio">Este nível não libera uma nova característica.</div>', "</div></section>").concat(htmlEscolha(escolha)) : "", "\n      </div>");
        var acoes = "\n      <footer class=\"levelUpModalAcoes\">\n        <button type=\"button\" class=\"levelUpCancelar\" onclick=\"fecharLevelUp()\">Cancelar</button>\n        <button type=\"button\" id=\"confirmarLevelUpBtn\" class=\"levelUpConfirmar\" onclick=\"confirmarLevelUpCompleto(".concat(alvo, ",").concat(inicial ? "true" : "false", ")\" disabled>").concat(inicial ? "Salvar nível 1" : "Confirmar n\u00EDvel ".concat(alvo), "</button>\n      </footer>");
        var modal = criarModal(corpo, acoes);
        configurarCalculadora(modal, alvo, inicial, escolha);
    }
    function abrirLevelUp() {
        if (!regras) {
            alert("As regras de progressão ainda estão carregando.");
            return;
        }
        var atual = nivelAtual();
        if (escolhasPendentesAte(atual).length) {
            abrirEscolhasPendentes();
            return;
        }
        if (precisaConfigurarNivelUm()) {
            abrirConfiguracaoNivelUm();
            return;
        }
        if (atual >= inteiro(regras.maxLevel, 20)) {
            alert("O personagem já está no nível máximo.");
            return;
        }
        abrirAssistenteNivel(atual + 1, { inicial: false });
    }
    function abrirConfiguracaoNivelUm() {
        abrirAssistenteNivel(1, { inicial: true });
    }
    function aplicarRecursos(calculo, inicial) {
        var antes = recursosAtuais();
        var depois = inicial ? {
            pv: calculo.ganhoVida,
            pvMax: calculo.ganhoVida,
            chakra: calculo.ganhoChakra,
            chakraMax: calculo.ganhoChakra
        } : {
            pv: Math.min(antes.pvMax + calculo.ganhoVida, antes.pv + calculo.ganhoVida),
            pvMax: antes.pvMax + calculo.ganhoVida,
            chakra: Math.min(antes.chakraMax + calculo.ganhoChakra, antes.chakra + calculo.ganhoChakra),
            chakraMax: antes.chakraMax + calculo.ganhoChakra
        };
        definirCampo("pv", depois.pv);
        definirCampo("pvMax", depois.pvMax);
        definirCampo("chakra", depois.chakra);
        definirCampo("chakraMax", depois.chakraMax);
        return { antes: antes, depois: depois };
    }
    function confirmarLevelUpCompleto(novoNivel, inicial) {
        var _a, _b;
        if (inicial === void 0) { inicial = false; }
        var atual = nivelAtual();
        var alvo = limitarNivel(novoNivel);
        if (!inicial && alvo !== atual + 1) {
            alert("A progressão precisa ocorrer um nível por vez.");
            return;
        }
        var calculo = (modalAtual === null || modalAtual === void 0 ? void 0 : modalAtual.__levelUpCalculo) || lerCalculoModal(alvo, inicial);
        if (!(calculo === null || calculo === void 0 ? void 0 : calculo.valido)) {
            alert((calculo === null || calculo === void 0 ? void 0 : calculo.erro) || "Complete os dados de Vida e Chakra.");
            return;
        }
        var escolha = inicial ? null : escolhaObrigatoriaDoNivel(alvo);
        var selecionada = escolha ? lerSelecaoModal(escolha) : "";
        if (escolha && !escolhaCompleta(escolha, selecionada)) {
            alert("Selecione exatamente ".concat(quantidadeExigida(escolha), " op\u00E7\u00F5es."));
            return;
        }
        var snapshot = clonar(estado);
        try {
            if (typeof sincronizarEstadoDosCampos === "function")
                sincronizarEstadoDosCampos();
            garantirEstruturaProgressao();
            var progresso = estado.progressaoFixa;
            var recursos = aplicarRecursos(calculo, inicial);
            var instante = new Date().toISOString();
            if (inicial) {
                progresso.vital = {
                    schemaVersion: 1,
                    status: "configured-level-one",
                    initializedAt: ((_a = progresso.vital) === null || _a === void 0 ? void 0 : _a.initializedAt) || instante,
                    configuredAt: instante,
                    startLevel: 2,
                    historyStartLevel: 1,
                    lastClanRuleId: calculo.cla.id,
                    lastClanLabel: calculo.cla.label
                };
                progresso.pendingByLevel["1"] = {
                    vida: { status: "completed", gain: calculo.ganhoVida },
                    chakra: { status: "completed", gain: calculo.ganhoChakra }
                };
                progresso.history.push({
                    type: "initial-resources",
                    fromLevel: 0,
                    toLevel: 1,
                    appliedAt: instante,
                    clan: { id: calculo.cla.id, label: calculo.cla.label },
                    resources: {
                        life: { die: "1d".concat(calculo.dadoVida), method: "maximum", roll: calculo.baseVida, adjustment: calculo.vidaAjustes.total, gain: calculo.ganhoVida },
                        chakra: { die: "1d".concat(calculo.dadoChakra), roll: calculo.rolagemChakra, adjustment: calculo.chakraAjustes.total, base: calculo.chakraBase, baseIsReference: true, gain: calculo.ganhoChakra },
                        before: recursos.antes,
                        after: recursos.depois,
                        attributes: calculo.atributos
                    }
                });
            }
            else {
                var antes = valoresFixos(atual);
                var depois = valoresFixos(alvo);
                if (escolha)
                    progresso.choices[escolha.id] = selecionada;
                progresso.pendingByLevel[String(alvo)] = {
                    vida: { status: "completed", gain: calculo.ganhoVida },
                    chakra: { status: "completed", gain: calculo.ganhoChakra }
                };
                progresso.history.push({
                    type: "level-up",
                    fromLevel: atual,
                    toLevel: alvo,
                    appliedAt: instante,
                    fixedBefore: antes,
                    fixedAfter: depois,
                    unlockedFeatures: __spreadArray([], __read((((_b = regraNivel(alvo)) === null || _b === void 0 ? void 0 : _b.features) || [])), false),
                    choice: escolha ? { id: escolha.id, value: selecionada } : null,
                    clan: { id: calculo.cla.id, label: calculo.cla.label },
                    resources: {
                        life: { die: "1d".concat(calculo.dadoVida), method: calculo.metodoVida, roll: calculo.baseVida, adjustment: calculo.vidaAjustes.total, gain: calculo.ganhoVida },
                        chakra: { die: "1d".concat(calculo.dadoChakra), roll: calculo.rolagemChakra, adjustment: calculo.chakraAjustes.total, base: calculo.chakraBase, baseIsReference: true, gain: calculo.ganhoChakra },
                        before: recursos.antes,
                        after: recursos.depois,
                        attributes: calculo.atributos
                    }
                });
                estado.nivel = String(alvo);
                estado.proficiencia = String(depois.proficiencia);
                progresso.level = alvo;
                progresso.proficiency = depois.proficiencia;
                progresso.jutsuRankMax = depois.rankJutsu;
                progresso.keyPointsTotal = depois.pontosChave;
                progresso.clanPointsEarned = depois.pontosCla;
                progresso.attacksPerAction = depois.ataquesPorAcao;
                progresso.chakraBase = depois.chakraBase;
                progresso.activeFeatures = depois.caracteristicas;
                progresso.vital.status = "active";
                progresso.vital.lastClanRuleId = calculo.cla.id;
                progresso.vital.lastClanLabel = calculo.cla.label;
                progresso.vital.lastLevelApplied = alvo;
                var campoNivel = document.getElementById("nivelDisplayMini");
                var campoProf = document.getElementById("bonusProficiencia");
                if (campoNivel)
                    campoNivel.value = String(alvo);
                if (campoProf)
                    campoProf.value = String(depois.proficiencia);
            }
            if (!persistirSeguro({ confirmada: true, origem: "level-up", campos: ["nivel", "proficiencia", "pv", "pvMax", "chakra", "chakraMax", "progressaoFixa"], motivo: "alteracao-confirmada" }))
                throw new Error("Não foi possível salvar a evolução.");
            fecharModal();
            atualizarIntegracoes();
            var mensagem = inicial
                ? "N\u00EDvel 1 configurado: ".concat(calculo.ganhoVida, " PV e ").concat(calculo.ganhoChakra, " Chakra.")
                : "N\u00EDvel ".concat(alvo, ": +").concat(calculo.ganhoVida, " PV e +").concat(calculo.ganhoChakra, " Chakra.");
            if (typeof log === "function")
                log(mensagem);
            if (typeof avisoShinobi === "function")
                avisoShinobi(inicial ? "Configuração concluída" : "Level Up concluído", mensagem);
            else
                alert(mensagem);
        }
        catch (erro) {
            console.error(erro);
            Object.keys(estado).forEach(function (chave) { return delete estado[chave]; });
            Object.assign(estado, snapshot);
            sincronizarCamposFixos();
            ["pv", "pvMax", "chakra", "chakraMax"].forEach(function (chave) {
                var campo = document.getElementById(chave);
                if (campo && estado[chave] !== undefined)
                    campo.value = estado[chave];
            });
            persistirSeguro();
            atualizarIntegracoes();
            alert("Não foi possível concluir o Level Up. Nenhuma alteração foi mantida.");
        }
    }
    function manterValoresNivelUmAtuais() {
        var _a;
        var snapshot = clonar(estado);
        try {
            garantirEstruturaProgressao();
            var instante = new Date().toISOString();
            estado.progressaoFixa.vital = {
                schemaVersion: 1,
                status: "preserved-existing",
                initializedAt: ((_a = estado.progressaoFixa.vital) === null || _a === void 0 ? void 0 : _a.initializedAt) || instante,
                preservedAtLevel: 1,
                startLevel: 2,
                historyStartLevel: 2,
                preservedSnapshot: recursosAtuais(),
                migrationRule: "keep-current-values"
            };
            estado.progressaoFixa.history.push({
                type: "resources-preserved",
                toLevel: 1,
                appliedAt: instante,
                resources: { status: "preserved-existing", snapshot: recursosAtuais() }
            });
            if (!persistirSeguro({ confirmada: true, origem: "level-up", campo: "progressaoFixa", motivo: "alteracao-confirmada" }))
                throw new Error("Falha ao salvar.");
            fecharModal();
            atualizarIntegracoes();
            if (typeof avisoShinobi === "function")
                avisoShinobi("Valores preservados", "O histórico de PV e Chakra começará no próximo Level Up.");
        }
        catch (erro) {
            Object.keys(estado).forEach(function (chave) { return delete estado[chave]; });
            Object.assign(estado, snapshot);
            persistirSeguro();
            alert("Não foi possível preservar os valores.");
        }
    }
    function abrirEscolhasPendentes() {
        if (!regras)
            return;
        garantirEstruturaProgressao();
        var pendente = escolhasPendentesAte(nivelAtual())[0];
        if (!pendente) {
            renderizarResumo();
            return;
        }
        var corpo = "\n      <header class=\"levelUpModalCabecalho\"><div><span class=\"levelUpModalSelo\">Escolha pendente \u2014 n\u00EDvel ".concat(inteiro(pendente.level, 0), "</span><h2>").concat(escaparHTML(pendente.label), "</h2></div><button type=\"button\" class=\"levelUpFechar\" onclick=\"fecharLevelUp()\" aria-label=\"Fechar\">\u00D7</button></header>\n      <div class=\"levelUpModalCorpo\"><div class=\"levelUpAvisoFase\">A ficha j\u00E1 alcan\u00E7ou este n\u00EDvel. Complete a escolha para liberar o pr\u00F3ximo Level Up.</div>").concat(htmlEscolha(pendente), "</div>");
        var acoes = "<footer class=\"levelUpModalAcoes\"><button type=\"button\" class=\"levelUpCancelar\" onclick=\"fecharLevelUp()\">Cancelar</button><button type=\"button\" id=\"salvarEscolhaPendenteBtn\" class=\"levelUpConfirmar\" disabled>Salvar escolhas</button></footer>";
        var modal = criarModal(corpo, acoes);
        var botao = modal.querySelector("#salvarEscolhaPendenteBtn");
        botao === null || botao === void 0 ? void 0 : botao.addEventListener("click", function () { return salvarEscolhaPendente(pendente.id); });
        configurarControleEscolha(modal, pendente, function () { if (botao)
            botao.disabled = !escolhaCompleta(pendente, lerSelecaoModal(pendente)); });
    }
    function salvarEscolhaPendente(id) {
        var _a;
        var escolha = (_a = regras === null || regras === void 0 ? void 0 : regras.choices) === null || _a === void 0 ? void 0 : _a[id];
        var selecionada = lerSelecaoModal(escolha);
        if (!escolhaCompleta(escolha, selecionada)) {
            alert("Selecione exatamente ".concat(quantidadeExigida(escolha), " op\u00E7\u00F5es."));
            return;
        }
        var snapshot = clonar(estado);
        try {
            garantirEstruturaProgressao();
            estado.progressaoFixa.choices[id] = selecionada;
            estado.progressaoFixa.history.push({ type: "completed-choice", level: inteiro(escolha === null || escolha === void 0 ? void 0 : escolha.level, nivelAtual()), choice: { id: id, value: selecionada }, appliedAt: new Date().toISOString() });
            if (!persistirSeguro({ confirmada: true, origem: "level-up", campo: "progressaoFixa", motivo: "alteracao-confirmada" }))
                throw new Error("Falha ao salvar.");
            fecharModal();
            atualizarIntegracoes();
            if (escolhasPendentesAte(nivelAtual()).length)
                abrirEscolhasPendentes();
            else if (typeof avisoShinobi === "function")
                avisoShinobi("Escolhas salvas", "A progressão da ficha foi completada.");
        }
        catch (erro) {
            Object.keys(estado).forEach(function (chave) { return delete estado[chave]; });
            Object.assign(estado, snapshot);
            persistirSeguro();
            alert("Não foi possível salvar as escolhas.");
        }
    }
    function escolhaTexto(id, valor) {
        var _a;
        var escolha = (_a = regras.choices) === null || _a === void 0 ? void 0 : _a[id];
        if (!escolha)
            return String(valor || "Não definida");
        var valores = normalizarSelecao(escolha, valor);
        if (!valores.length)
            return "Não definida";
        return valores.map(function (idOpcao) {
            var _a;
            var opcao = (_a = escolha.options) === null || _a === void 0 ? void 0 : _a.find(function (item) { return item.id === idOpcao; });
            return opcao ? "".concat(opcao.label, " (").concat(opcao.ability, ")") : idOpcao;
        }).join(", ");
    }
    function historicoItemHTML(item) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var data = item.appliedAt ? new Date(item.appliedAt).toLocaleString("pt-BR") : "Data não registrada";
        if (item.type === "completed-choice") {
            return "<article class=\"levelUpHistoricoItem\"><strong>Escolhas do n\u00EDvel ".concat(inteiro(item.level, 0), "</strong><small>").concat(escaparHTML(escolhaTexto((_a = item.choice) === null || _a === void 0 ? void 0 : _a.id, (_b = item.choice) === null || _b === void 0 ? void 0 : _b.value)), " \u00B7 ").concat(escaparHTML(data), "</small></article>");
        }
        if (item.type === "initial-level") {
            var migrado = item.retroactive === true || ((_c = item.resources) === null || _c === void 0 ? void 0 : _c.status) === "preserved-existing";
            return migrado
                ? "<article class=\"levelUpHistoricoItem\"><strong>N\u00EDvel 1 aplicado retroativamente</strong><small>Benef\u00EDcios fixos restaurados; PV e Chakra preservados \u00B7 ".concat(escaparHTML(data), "</small></article>")
                : "<article class=\"levelUpHistoricoItem\"><strong>N\u00EDvel 1 iniciado</strong><small>Benef\u00EDcios fixos preparados; configura\u00E7\u00E3o de PV e Chakra pendente \u00B7 ".concat(escaparHTML(data), "</small></article>");
        }
        if (item.type === "retroactive-level") {
            return "<article class=\"levelUpHistoricoItem\"><strong>N\u00EDvel ".concat(inteiro(item.toLevel, 0), " aplicado retroativamente</strong><small>Benef\u00EDcios fixos restaurados; PV e Chakra preservados \u00B7 ").concat(escaparHTML(data), "</small></article>");
        }
        if (item.type === "resources-preserved") {
            return "<article class=\"levelUpHistoricoItem\"><strong>PV e Chakra preservados</strong><small>Hist\u00F3rico detalhado iniciado no pr\u00F3ximo n\u00EDvel \u00B7 ".concat(escaparHTML(data), "</small></article>");
        }
        var vida = (_e = (_d = item.resources) === null || _d === void 0 ? void 0 : _d.life) === null || _e === void 0 ? void 0 : _e.gain;
        var chakra = (_g = (_f = item.resources) === null || _f === void 0 ? void 0 : _f.chakra) === null || _g === void 0 ? void 0 : _g.gain;
        if (item.type === "initial-resources") {
            return "<article class=\"levelUpHistoricoItem\"><strong>Recursos do n\u00EDvel 1 configurados</strong><small>+".concat(inteiro(vida, 0), " PV \u00B7 +").concat(inteiro(chakra, 0), " Chakra \u00B7 ").concat(escaparHTML(((_h = item.clan) === null || _h === void 0 ? void 0 : _h.label) || "Clã não informado"), " \u00B7 ").concat(escaparHTML(data), "</small></article>");
        }
        if (item.type === "level-up" || item.fromLevel !== undefined) {
            var detalhes = vida !== undefined && chakra !== undefined ? "+".concat(inteiro(vida, 0), " PV \u00B7 +").concat(inteiro(chakra, 0), " Chakra") : "PV e Chakra preservados";
            return "<article class=\"levelUpHistoricoItem\"><strong>N\u00EDvel ".concat(inteiro(item.fromLevel, 0), " \u2192 ").concat(inteiro(item.toLevel, 0), "</strong><small>").concat(detalhes, " \u00B7 ").concat(escaparHTML(((_j = item.clan) === null || _j === void 0 ? void 0 : _j.label) || ""), " ").concat(((_k = item.clan) === null || _k === void 0 ? void 0 : _k.label) ? "·" : "", " ").concat(escaparHTML(data), "</small></article>");
        }
        return "<article class=\"levelUpHistoricoItem\"><strong>Atualiza\u00E7\u00E3o de progress\u00E3o</strong><small>".concat(escaparHTML(data), "</small></article>");
    }
    function abrirProgressaoFixa() {
        var _a, _b, _c;
        if (!regras)
            return;
        var atual = nivelAtual();
        var fixos = valoresFixos(atual);
        var historico = __spreadArray([], __read((((_a = estado.progressaoFixa) === null || _a === void 0 ? void 0 : _a.history) || [])), false).reverse();
        var escolhas = Object.entries(((_b = estado.progressaoFixa) === null || _b === void 0 ? void 0 : _b.choices) || {});
        var vital = ((_c = estado.progressaoFixa) === null || _c === void 0 ? void 0 : _c.vital) || {};
        var pendentes = escolhasPendentesAte(atual);
        var quantidadePendente = totalSelecoesPendentesAte(atual);
        var configurarNivel1 = precisaConfigurarNivelUm();
        var maximo = atual >= inteiro(regras.maxLevel, 20);
        var acaoPrimaria = "abrirLevelUp()";
        var textoPrimario = "Subir de nível";
        if (configurarNivel1) {
            acaoPrimaria = "abrirConfiguracaoNivelUm()";
            textoPrimario = "Configurar nível 1";
        }
        else if (pendentes.length) {
            acaoPrimaria = "abrirEscolhasPendentes()";
            textoPrimario = "Completar ".concat(quantidadePendente, " escolha").concat(quantidadePendente === 1 ? "" : "s");
        }
        var corpo = "\n      <header class=\"levelUpModalCabecalho\">\n        <div><span class=\"levelUpModalSelo\">Progress\u00E3o atual</span><h2>N\u00EDvel ".concat(atual, "</h2></div>\n        <button type=\"button\" class=\"levelUpFechar\" onclick=\"fecharLevelUp()\" aria-label=\"Fechar\">\u00D7</button>\n      </header>\n      <div class=\"levelUpModalCorpo\">\n        <div class=\"levelUpAvisoFase\">Este \u00E9 o resumo completo da progress\u00E3o da ficha. Use o bot\u00E3o no final para avan\u00E7ar quando estiver pronto.</div>\n        <div class=\"levelUpComparacao\">\n          ").concat(comparacao("Proficiência", "+".concat(fixos.proficiencia), "+".concat(fixos.proficiencia)), "\n          ").concat(comparacao("Rank máximo de Jutsu", fixos.rankJutsu, fixos.rankJutsu), "\n          ").concat(comparacao("Pontos-chave totais", fixos.pontosChave, fixos.pontosChave), "\n          ").concat(comparacao("Pontos de Clã conquistados", fixos.pontosCla, fixos.pontosCla), "\n          ").concat(comparacao("Ataques por ação", fixos.ataquesPorAcao, fixos.ataquesPorAcao), "\n          ").concat(comparacao("Chakra-base", fixos.chakraBase, fixos.chakraBase), "\n        </div>\n        <section class=\"levelUpRecursosBloco\" aria-label=\"Recursos de progress\u00E3o\">\n          <div><span>Pontos-chave</span><strong>").concat(fixos.pontosChave, "</strong><small>Total do n\u00EDvel</small></div>\n          <div><span>Pontos de Cl\u00E3</span><strong>").concat(fixos.pontosCla, "</strong><small>Conquistados</small></div>\n        </section>\n        <details class=\"levelUpProgressaoDetalhes\">\n          <summary><span>PV e Chakra</span><strong>\u203A</strong></summary>\n          <div class=\"levelUpProgressaoLista\">\n            <article><strong>").concat(vital.status === "preserved-existing" ? "Valores anteriores preservados" : "Histórico automático ativo", "</strong><small>").concat(vital.status === "preserved-existing" ? "As rolagens detalhadas come\u00E7am no n\u00EDvel ".concat(inteiro(vital.historyStartLevel, atual + 1), ".") : "Cada Level Up registra dado, método, modificadores, clã e Chakra-base.", "</small></article>\n          </div>\n        </details>\n        ").concat(caracteristicasResumoHTML(fixos), "\n        ").concat(escolhas.length ? "<details class=\"levelUpProgressaoDetalhes\"><summary><span>Escolhas salvas</span><strong>".concat(escolhas.length, "</strong></summary><div class=\"levelUpProgressaoLista\">").concat(escolhas.map(function (_a) {
            var _b, _c;
            var _d = __read(_a, 2), id = _d[0], valor = _d[1];
            return "<article><strong>".concat(escaparHTML(((_c = (_b = regras.choices) === null || _b === void 0 ? void 0 : _b[id]) === null || _c === void 0 ? void 0 : _c.label) || id), "</strong><small>").concat(escaparHTML(escolhaTexto(id, valor)), "</small></article>");
        }).join(""), "</div></details>") : "", "\n        <details class=\"levelUpProgressaoDetalhes\">\n          <summary><span>Hist\u00F3rico de Level Up</span><strong>").concat(historico.length, "</strong></summary>\n          <div class=\"levelUpHistorico levelUpProgressaoLista\">").concat(historico.length ? historico.map(historicoItemHTML).join("") : '<div class="levelUpVazio">O próximo Level Up aparecerá aqui.</div>', "</div>\n        </details>\n      </div>");
        var desabilitado = maximo && !pendentes.length && !configurarNivel1;
        var acoes = "<footer class=\"levelUpModalAcoes\"><button type=\"button\" class=\"levelUpCancelar\" onclick=\"fecharLevelUp()\">Fechar</button><button type=\"button\" class=\"levelUpConfirmar\" onclick=\"fecharLevelUp();".concat(acaoPrimaria, "\" ").concat(desabilitado ? "disabled" : "", ">").concat(desabilitado ? "Nível máximo" : textoPrimario, "</button></footer>");
        criarModal(corpo, acoes);
    }
    function abrirRevisaoRetroativa() {
        var _a;
        if (!regras)
            return;
        var progresso = estado.progressaoFixa || {};
        var atualizacao = progresso.lastRetroactiveUpdate;
        if (!atualizacao || !progresso.retroactiveReviewPending)
            return;
        var ate = inteiro(atualizacao.toLevel, nivelAtual());
        var linhas = [];
        for (var nivel = 1; nivel <= ate; nivel += 1) {
            var nomes = (((_a = regraNivel(nivel)) === null || _a === void 0 ? void 0 : _a.features) || []).map(function (id) { var _a, _b; return ((_b = (_a = regras.features) === null || _a === void 0 ? void 0 : _a[id]) === null || _b === void 0 ? void 0 : _b.name) || id; });
            linhas.push("<article class=\"levelUpCaracteristica\"><strong>N\u00EDvel ".concat(nivel, "</strong><p>").concat(nomes.length ? escaparHTML(nomes.join(" · ")) : "Valores fixos conferidos", "</p></article>"));
        }
        var faltam = totalSelecoesPendentesAte(ate);
        var corpo = "<header class=\"levelUpModalCabecalho\"><div><span class=\"levelUpModalSelo\">Migra\u00E7\u00E3o da ficha</span><h2>N\u00EDveis anteriores atualizados</h2></div><button type=\"button\" class=\"levelUpFechar\" onclick=\"fecharLevelUp()\" aria-label=\"Fechar\">\u00D7</button></header><div class=\"levelUpModalCorpo\"><div class=\"levelUpAvisoFase\">Os benef\u00EDcios fixos dos n\u00EDveis 1 a ".concat(ate, " foram aplicados. <strong>PV e Chakra atuais foram preservados</strong>; as rolagens autom\u00E1ticas come\u00E7am no pr\u00F3ximo Level Up.</div><section class=\"levelUpSecao\"><h3>Atualiza\u00E7\u00F5es aplicadas</h3><div class=\"levelUpLista\">").concat(linhas.join(""), "</div></section>").concat(faltam ? "<div class=\"levelUpAvisoFase levelUpAvisoEscolhas\">Ainda faltam <strong>".concat(faltam, " escolhas</strong> da caracter\u00EDstica Resist\u00EAncia.</div>") : "", "</div>");
        var acoes = "<footer class=\"levelUpModalAcoes\"><button type=\"button\" class=\"levelUpCancelar\" onclick=\"fecharLevelUp()\">Ver depois</button><button type=\"button\" class=\"levelUpConfirmar\" onclick=\"confirmarRevisaoRetroativa()\">".concat(faltam ? "Continuar para escolhas" : "Concluir revisão", "</button></footer>");
        criarModal(corpo, acoes);
    }
    function confirmarRevisaoRetroativa() {
        garantirEstruturaProgressao();
        estado.progressaoFixa.retroactiveReviewPending = false;
        persistirSeguro({ confirmada: true, origem: "level-up", campo: "progressaoFixa", motivo: "alteracao-confirmada" });
        fecharModal();
        atualizarIntegracoes();
        if (escolhasPendentesAte(nivelAtual()).length)
            abrirEscolhasPendentes();
    }
    function atualizarIndicadorCatalogo() {
        var badge = document.getElementById("catalogoRankProgressao");
        if (!badge || !regras)
            return;
        badge.innerHTML = "Rank m\u00E1ximo da ficha: <strong>".concat(escaparHTML(valoresFixos(nivelAtual()).rankJutsu), "</strong>");
    }
    function observarCatalogo() {
        if (observadorCatalogo)
            return;
        var atualizacaoAgendada = false;
        observadorCatalogo = new MutationObserver(function () {
            if (atualizacaoAgendada)
                return;
            atualizacaoAgendada = true;
            requestAnimationFrame(function () {
                atualizacaoAgendada = false;
                atualizarIndicadorCatalogo();
            });
        });
        observadorCatalogo.observe(document.body, { childList: true, subtree: false });
    }
    function validarRegras(dados) {
        if (!dados || !Array.isArray(dados.levels) || !Array.isArray(dados.clans))
            throw new Error("Tabela de progressão inválida.");
        var niveis = new Set(dados.levels.map(function (item) { return inteiro(item.level, -1); }));
        for (var nivel = 0; nivel <= inteiro(dados.maxLevel, 20); nivel += 1) {
            if (!niveis.has(nivel))
                throw new Error("N\u00EDvel ".concat(nivel, " ausente na tabela."));
        }
        dados.clans.forEach(function (cla) {
            var _a, _b;
            if (!cla.id || !((_a = cla.life) === null || _a === void 0 ? void 0 : _a.die) || !((_b = cla.chakra) === null || _b === void 0 ? void 0 : _b.die))
                throw new Error("Regra de cl\u00E3 inv\u00E1lida: ".concat(cla.label || cla.id || "sem nome", "."));
        });
        return dados;
    }
    function carregarRegras() {
        return __awaiter(this, void 0, void 0, function () {
            var resposta, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetch(URL_PROGRESSAO, { cache: "no-store", credentials: "same-origin" })];
                    case 1:
                        resposta = _b.sent();
                        if (!resposta.ok)
                            throw new Error("Progress\u00E3o respondeu HTTP ".concat(resposta.status, "."));
                        _a = validarRegras;
                        return [4 /*yield*/, resposta.json()];
                    case 2:
                        regras = _a.apply(void 0, [_b.sent()]);
                        mapaNiveis = new Map(regras.levels.map(function (item) { return [inteiro(item.level, -1), item]; }));
                        mapaClas = new Map(regras.clans.map(function (item) { return [String(item.id), item]; }));
                        mapaAliasesCla = new Map();
                        regras.clans.forEach(function (cla) {
                            __spreadArray([cla.label, cla.id], __read((cla.aliases || [])), false).forEach(function (alias) {
                                var normalizado = normalizarTexto(alias);
                                if (normalizado)
                                    mapaAliasesCla.set(normalizado, cla.id);
                            });
                        });
                        return [2 /*return*/];
                }
            });
        });
    }
    function iniciar() {
        return __awaiter(this, void 0, void 0, function () {
            var campoNivel, xpLinha, host, tinhaNivel, erro_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        campoNivel = document.getElementById("nivelDisplayMini");
                        xpLinha = document.querySelector("#identidade .xpLinhaNova");
                        if (!campoNivel || !xpLinha)
                            return [2 /*return*/];
                        host = document.getElementById("levelUpResumoHost");
                        if (host)
                            renderizarResumo();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, carregarRegras()];
                    case 2:
                        _c.sent();
                        tinhaNivel = String((_a = estado === null || estado === void 0 ? void 0 : estado.nivel) !== null && _a !== void 0 ? _a : "").trim() !== "";
                        if (!tinhaNivel) {
                            estado.nivel = "1";
                            estado.proficiencia = "2";
                        }
                        garantirEstruturaProgressao();
                        sincronizarCamposFixos();
                        ligarEdicaoManualNivel();
                        persistirSeguro();
                        observarCatalogo();
                        atualizarIntegracoes();
                        if ((_b = estado.progressaoFixa) === null || _b === void 0 ? void 0 : _b.retroactiveReviewPending)
                            setTimeout(abrirRevisaoRetroativa, 260);
                        return [3 /*break*/, 4];
                    case 3:
                        erro_1 = _c.sent();
                        console.error("Falha ao iniciar Level Up", erro_1);
                        if (host)
                            host.innerHTML = '<section class="levelUpResumoCard"><div class="levelUpResumoTitulo"><small>Progressão</small><strong>Não foi possível carregar as regras</strong></div><div class="levelUpResumoAcoes"><button type="button" class="levelUpBtn" onclick="location.reload()">Recarregar</button></div></section>';
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    window.abrirLevelUp = abrirLevelUp;
    window.abrirConfiguracaoNivelUm = abrirConfiguracaoNivelUm;
    window.confirmarLevelUpCompleto = confirmarLevelUpCompleto;
    window.manterValoresNivelUmAtuais = manterValoresNivelUmAtuais;
    window.abrirEscolhasPendentes = abrirEscolhasPendentes;
    window.salvarEscolhaPendente = salvarEscolhaPendente;
    window.abrirProgressaoFixa = abrirProgressaoFixa;
    window.abrirRevisaoRetroativa = abrirRevisaoRetroativa;
    window.confirmarRevisaoRetroativa = confirmarRevisaoRetroativa;
    window.fecharLevelUp = fecharModal;
    window.shinobiLevelUp = {
        getRules: function () { return regras; },
        getFixedValues: function () { return regras ? valoresFixos(nivelAtual()) : null; },
        getMaxJutsuRank: function () { return regras ? valoresFixos(nivelAtual()).rankJutsu : null; },
        getClanRule: function () { return regras ? detectarCla() : null; },
        setManualLevel: function (nivel, opcoes) {
            if (opcoes === void 0) { opcoes = {}; }
            return aplicarNivelManual(nivel, opcoes);
        },
        refresh: atualizarIntegracoes
    };
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    else
        iniciar();
    window.addEventListener("pageshow", function () {
        if (!regras)
            return;
        setTimeout(function () {
            garantirEstruturaProgressao();
            sincronizarCamposFixos();
            atualizarIntegracoes();
        }, 180);
    });
})();
