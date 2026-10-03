/* GERADO AUTOMATICAMENTE — fonte: js/15-testes-resistencia.js — app 2.5.8.154. Não editar. */
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
/* Ficha Ninja 2.5.3 — testes de resistência com atualização sem loop de DOM. */
(function () {
    "use strict";
    if (window.__testesResistenciaBatalhaV213)
        return;
    window.__testesResistenciaBatalhaV213 = true;
    var ATRIBUTOS = [
        { chave: "forca", sigla: "FOR", nome: "Força", view: "saveForcaView", estado: "saveForcaEstado", detalhe: "saveForcaDetalhe" },
        { chave: "destreza", sigla: "DES", nome: "Destreza", view: "saveDestrezaView", estado: "saveDestrezaEstado", detalhe: "saveDestrezaDetalhe" },
        { chave: "constituicao", sigla: "CON", nome: "Constituição", view: "saveConstituicaoView", estado: "saveConstituicaoEstado", detalhe: "saveConstituicaoDetalhe" },
        { chave: "inteligencia", sigla: "INT", nome: "Inteligência", view: "saveInteligenciaView", estado: "saveInteligenciaEstado", detalhe: "saveInteligenciaDetalhe" },
        { chave: "sabedoria", sigla: "SAB", nome: "Sabedoria", view: "saveSabedoriaView", estado: "saveSabedoriaEstado", detalhe: "saveSabedoriaDetalhe" },
        { chave: "carisma", sigla: "CAR", nome: "Carisma", view: "saveCarismaView", estado: "saveCarismaEstado", detalhe: "saveCarismaDetalhe" }
    ];
    var CHAVE_ESCOLHA_RESISTENCIA = "resistencia_nivel_7";
    var ESCOLHAS_POR_ATRIBUTO = {
        ferocidade: ["forca"],
        evasao: ["destreza"],
        resistencia: ["constituicao"],
        discernimento: ["inteligencia", "sabedoria"]
    };
    var ROTULOS_ESCOLHAS = {
        ferocidade: "Ferocidade",
        evasao: "Evasão",
        resistencia: "Resistência",
        discernimento: "Discernimento"
    };
    var CHAVES_MANUAIS_ANTIGAS = [
        "save_forca_prof",
        "save_destreza_prof",
        "save_constituicao_prof",
        "save_inteligencia_prof",
        "save_sabedoria_prof",
        "save_carisma_prof"
    ];
    var frame = null;
    function numero(valor, padrao) {
        if (padrao === void 0) { padrao = 0; }
        var convertido = Number(String(valor !== null && valor !== void 0 ? valor : "").replace(",", "."));
        return Number.isFinite(convertido) ? convertido : padrao;
    }
    function campoSalvo(chave) {
        return document.querySelector("[data-save=\"".concat(chave, "\"]"));
    }
    function comSinal(valor) {
        var n = numero(valor, 0);
        return n >= 0 ? "+".concat(n) : String(n);
    }
    function normalizarToken(valor) {
        return String(valor !== null && valor !== void 0 ? valor : "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
    }
    function normalizarListaEscolhas(valor) {
        if (Array.isArray(valor))
            return valor.flatMap(normalizarListaEscolhas);
        if (valor && typeof valor === "object") {
            if ("value" in valor)
                return normalizarListaEscolhas(valor.value);
            if ("selected" in valor)
                return normalizarListaEscolhas(valor.selected);
            return Object.entries(valor)
                .filter(function (_a) {
                var _b = __read(_a, 2), ativo = _b[1];
                return Boolean(ativo);
            })
                .map(function (_a) {
                var _b = __read(_a, 1), id = _b[0];
                return normalizarToken(id);
            })
                .filter(Boolean);
        }
        var texto = String(valor !== null && valor !== void 0 ? valor : "").trim();
        if (!texto)
            return [];
        return texto
            .split(/[;,|]/)
            .map(normalizarToken)
            .filter(Boolean);
    }
    function escolhasSalvasResistencia() {
        var _a, _b, _c, _d, _e, _f;
        var valor = null;
        try {
            valor = (_c = (_b = (_a = estado === null || estado === void 0 ? void 0 : estado.progressaoFixa) === null || _a === void 0 ? void 0 : _a.choices) === null || _b === void 0 ? void 0 : _b[CHAVE_ESCOLHA_RESISTENCIA]) !== null && _c !== void 0 ? _c : null;
            if (valor == null) {
                var historico = Array.isArray((_d = estado === null || estado === void 0 ? void 0 : estado.progressaoFixa) === null || _d === void 0 ? void 0 : _d.history)
                    ? estado.progressaoFixa.history
                    : [];
                var registro = __spreadArray([], __read(historico), false).reverse().find(function (item) { var _a; return ((_a = item === null || item === void 0 ? void 0 : item.choice) === null || _a === void 0 ? void 0 : _a.id) === CHAVE_ESCOLHA_RESISTENCIA; });
                valor = (_f = (_e = registro === null || registro === void 0 ? void 0 : registro.choice) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : null;
            }
        }
        catch (erro) {
            valor = null;
        }
        var permitidas = new Set(Object.keys(ESCOLHAS_POR_ATRIBUTO));
        return __spreadArray([], __read(new Set(normalizarListaEscolhas(valor).filter(function (id) { return permitidas.has(id); }))), false);
    }
    function perfilProficiencias() {
        var escolhas = escolhasSalvasResistencia();
        var atributos = new Set();
        escolhas.forEach(function (id) {
            (ESCOLHAS_POR_ATRIBUTO[id] || []).forEach(function (chave) { return atributos.add(chave); });
        });
        return { escolhas: escolhas, atributos: atributos };
    }
    function escolhaQueConcede(chave, perfil) {
        return perfil.escolhas.find(function (id) { return (ESCOLHAS_POR_ATRIBUTO[id] || []).includes(chave); }) || "";
    }
    function modificadorPontuacao(pontuacao) {
        var valor = numero(pontuacao, 0);
        if (valor <= 0)
            return 0;
        if (typeof window.calcularModificador === "function")
            return numero(window.calcularModificador(valor), 0);
        return Math.floor((valor - 10) / 2);
    }
    function bonusManualAtributo(chave) {
        var _a;
        return numero((_a = document.querySelector("[data-bonus-batalha=\"".concat(chave, "\"]"))) === null || _a === void 0 ? void 0 : _a.value, 0);
    }
    function bonusModificadorJutsu(chave) {
        var _a;
        return numero((_a = window.obterBonusEfeitosJutsuBatalha) === null || _a === void 0 ? void 0 : _a.call(window, "mod_".concat(chave)), 0);
    }
    function bonusEspecificoTeste(chave) {
        if (typeof window.obterBonusUniversal !== "function")
            return 0;
        var alvos = [
            "tr_".concat(chave),
            "save_".concat(chave),
            "teste_resistencia_".concat(chave),
            "resistencia_".concat(chave),
            "tr_geral",
            "teste_resistencia",
            "testes_resistencia",
            "save_geral"
        ];
        return alvos.reduce(function (total, alvo) { return total + numero(window.obterBonusUniversal(alvo), 0); }, 0);
    }
    function perfilEfeitos() {
        try {
            return typeof window.obterPerfilUniversalEfeitos === "function"
                ? window.obterPerfilUniversalEfeitos()
                : { vantagens: [], desvantagens: [] };
        }
        catch (erro) {
            return { vantagens: [], desvantagens: [] };
        }
    }
    function alvoAbrangeAtributo(alvo, chave) {
        var texto = String(alvo || "").toLowerCase();
        if (["tr_".concat(chave), "save_".concat(chave), "teste_resistencia_".concat(chave), "resistencia_".concat(chave)].includes(texto))
            return true;
        if (texto.startsWith("tr_"))
            return texto.slice(3).split("_").includes(chave);
        return ["tr_geral", "teste_resistencia", "testes_resistencia", "save_geral", "proximo_teste_resistencia"].includes(texto);
    }
    function estadoRolagem(chave, perfil) {
        var vantagens = Array.isArray(perfil === null || perfil === void 0 ? void 0 : perfil.vantagens) ? perfil.vantagens : [];
        var desvantagens = Array.isArray(perfil === null || perfil === void 0 ? void 0 : perfil.desvantagens) ? perfil.desvantagens : [];
        var vantagem = vantagens.some(function (alvo) { return alvoAbrangeAtributo(alvo, chave); });
        var desvantagem = desvantagens.some(function (alvo) { return alvoAbrangeAtributo(alvo, chave); });
        if (vantagem && desvantagem)
            return "anulada";
        if (vantagem)
            return "vantagem";
        if (desvantagem)
            return "desvantagem";
        return "";
    }
    function dadosTeste(config, perfilEfeito, perfilProf) {
        var _a, _b;
        var pontuacaoBase = numero((_a = campoSalvo(config.chave)) === null || _a === void 0 ? void 0 : _a.value, 0);
        var bonusManual = bonusManualAtributo(config.chave);
        var modificadorBase = modificadorPontuacao(pontuacaoBase + bonusManual);
        var bonusModJutsu = bonusModificadorJutsu(config.chave);
        var modificadorFinal = modificadorBase + bonusModJutsu;
        var escolhaOrigem = escolhaQueConcede(config.chave, perfilProf);
        var proficiente = Boolean(escolhaOrigem);
        var bonusProf = proficiente ? numero((_b = campoSalvo("proficiencia")) === null || _b === void 0 ? void 0 : _b.value, 0) : 0;
        var bonusTeste = bonusEspecificoTeste(config.chave);
        return {
            pontuacaoBase: pontuacaoBase,
            bonusManual: bonusManual,
            modificadorBase: modificadorBase,
            bonusModJutsu: bonusModJutsu,
            modificadorFinal: modificadorFinal,
            proficiente: proficiente,
            escolhaOrigem: escolhaOrigem,
            bonusProf: bonusProf,
            bonusTeste: bonusTeste,
            total: modificadorFinal + bonusProf + bonusTeste,
            rolagem: estadoRolagem(config.chave, perfilEfeito)
        };
    }
    function textoEstado(dados) {
        var partes = [];
        if (dados.proficiente)
            partes.push("PROF.");
        if (dados.rolagem === "vantagem")
            partes.push("VANT.");
        if (dados.rolagem === "desvantagem")
            partes.push("DESV.");
        if (dados.rolagem === "anulada")
            partes.push("ANUL.");
        return partes.join(" ");
    }
    function textoDetalhe(config, dados) {
        var partes = ["Mod. ".concat(comSinal(dados.modificadorFinal))];
        if (dados.proficiente)
            partes.push("Prof. ".concat(comSinal(dados.bonusProf)));
        if (dados.bonusTeste)
            partes.push("Efeito ".concat(comSinal(dados.bonusTeste)));
        return partes.join(" · ") || config.nome;
    }
    function textoOrigem(dados) {
        return dados.escolhaOrigem ? ROTULOS_ESCOLHAS[dados.escolhaOrigem] || dados.escolhaOrigem : "";
    }
    function atualizar() {
        var perfilEfeito = perfilEfeitos();
        var perfilProf = perfilProficiencias();
        ATRIBUTOS.forEach(function (config) {
            var card = document.querySelector("[data-teste-resistencia=\"".concat(config.chave, "\"]"));
            var view = document.getElementById(config.view);
            var estadoView = document.getElementById(config.estado);
            var detalhe = document.getElementById(config.detalhe);
            if (!card || !view)
                return;
            var dados = dadosTeste(config, perfilEfeito, perfilProf);
            view.textContent = comSinal(dados.total);
            if (estadoView)
                estadoView.textContent = textoEstado(dados);
            if (detalhe)
                detalhe.textContent = textoDetalhe(config, dados);
            card.classList.toggle("proficiente", dados.proficiente);
            card.classList.toggle("comVantagem", dados.rolagem === "vantagem");
            card.classList.toggle("comDesvantagem", dados.rolagem === "desvantagem");
            card.classList.toggle("vantagemAnulada", dados.rolagem === "anulada");
            var origem = textoOrigem(dados);
            card.title = "".concat(config.nome, ": ").concat(comSinal(dados.total), " \u2014 ").concat(textoDetalhe(config, dados)).concat(origem ? " \u2014 ".concat(origem) : "");
        });
    }
    function agendar() {
        if (frame)
            cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
            frame = null;
            atualizar();
        });
    }
    function persistirLimpezaMarcadoresAntigos() {
        try {
            if (typeof estado === "undefined" || !estado || typeof estado !== "object")
                return;
            var alterou_1 = false;
            CHAVES_MANUAIS_ANTIGAS.forEach(function (chave) {
                if (Object.prototype.hasOwnProperty.call(estado, chave)) {
                    delete estado[chave];
                    alterou_1 = true;
                }
            });
            if (!estado.__testesResistenciaAutomaticosV213) {
                estado.__testesResistenciaAutomaticosV213 = true;
                alterou_1 = true;
            }
            if (alterou_1) {
                if (typeof persistirEstadoLocal === "function")
                    persistirEstadoLocal();
                else if (typeof CHAVE !== "undefined")
                    localStorage.setItem(CHAVE, JSON.stringify(estado));
            }
        }
        catch (erro) {
            console.warn("Não foi possível limpar os marcadores antigos de resistência.", erro);
        }
    }
    function iniciar() {
        persistirLimpezaMarcadoresAntigos();
        agendar();
        setTimeout(agendar, 250);
    }
    var seletor = __spreadArray(__spreadArray([], __read(ATRIBUTOS.map(function (item) { return "[data-save=\"".concat(item.chave, "\"]"); })), false), [
        '[data-save="proficiencia"]',
        '[data-bonus-batalha]'
    ], false).join(",");
    document.addEventListener("input", function (evento) {
        var _a;
        if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches(seletor))
            agendar();
    }, true);
    document.addEventListener("change", function (evento) {
        var _a;
        if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches(seletor))
            agendar();
    }, true);
    document.addEventListener("click", function (evento) {
        var _a, _b;
        if ((_b = (_a = evento.target) === null || _a === void 0 ? void 0 : _a.closest) === null || _b === void 0 ? void 0 : _b.call(_a, "#batalha,#atributos,#jutsus,.levelUpModal"))
            setTimeout(agendar, 0);
    }, true);
    document.addEventListener("shinobi:pagechange", function (evento) {
        var _a;
        if (((_a = evento.detail) === null || _a === void 0 ? void 0 : _a.id) === "batalha")
            agendar();
    });
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    else
        iniciar();
    window.addEventListener("pageshow", function () { return setTimeout(iniciar, 80); });
    window.atualizarTestesResistenciaBatalha = agendar;
    window.obterResistenciasProficientesAutomaticas = function () {
        return __spreadArray([], __read(perfilProficiencias().atributos), false);
    };
    window.calcularTesteResistenciaBatalha = function (chave) {
        var config = ATRIBUTOS.find(function (item) { return item.chave === chave; });
        return config ? dadosTeste(config, perfilEfeitos(), perfilProficiencias()) : null;
    };
})();
