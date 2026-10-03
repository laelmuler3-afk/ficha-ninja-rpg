/* GERADO AUTOMATICAMENTE — fonte: js/22-organizacao-retratil.js — app 2.5.8.154. Não editar. */
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
/* Ficha Ninja RPG 2.5.8.44 — organização retrátil de Jutsus e Loja. */
(function () {
    "use strict";
    if (window.__shinobiOrganizacaoRetratilV25831)
        return;
    window.__shinobiOrganizacaoRetratilV25831 = true;
    var GRUPOS_JUTSU = Object.freeze([
        { id: "katon", nome: "Katon", atalho: "Katon", descricao: "Técnicas de Fogo", icone: "🔥" },
        { id: "suiton", nome: "Suiton", atalho: "Suiton", descricao: "Técnicas de Água", icone: "💧" },
        { id: "raiton", nome: "Raiton", atalho: "Raiton", descricao: "Técnicas de Relâmpago", icone: "⚡" },
        { id: "fuuton", nome: "Fuuton", atalho: "Fuuton", descricao: "Técnicas de Vento", icone: "🌪️" },
        { id: "doton", nome: "Doton", atalho: "Doton", descricao: "Técnicas de Terra", icone: "🪨" },
        { id: "yin", nome: "Yinton / Genjutsu", atalho: "Yinton", descricao: "Genjutsu e técnicas Yin", icone: "🌑" },
        { id: "yang", nome: "Youton / Iryō", atalho: "Youton", descricao: "Técnicas médicas e Yang", icone: "☀️" },
        { id: "taijutsu", nome: "Taijutsu", atalho: "Taijutsu", descricao: "Técnicas corporais", icone: "🥋" },
        { id: "ninjutsu", nome: "Ninjutsu / Técnicas", atalho: "Ninjutsu", descricao: "Técnicas variadas", icone: "🌀" },
        { id: "neutro", nome: "Outras Técnicas", atalho: "Outros", descricao: "Outras técnicas variadas", icone: "✨" }
    ]);
    var GRUPO_POR_ID = new Map(GRUPOS_JUTSU.map(function (grupo) { return [grupo.id, grupo]; }));
    var ICONE_LOJA = Object.freeze({
        "arremessaveis": "✴️",
        "armas a distancia": "🏹",
        "corpo a corpo": "⚔️",
        "outras armas": "🗡️",
        "ferramentas": "🧰",
        "consumiveis": "🧪",
        "itens especiais": "✨"
    });
    var buscaJutsus = "";
    var grupoJutsuAberto = "";
    var frameJutsus = 0;
    var frameLoja = 0;
    var organizandoJutsus = false;
    var organizandoLoja = false;
    var observadorLoja = null;
    var catalogoJutsusPorId = new Map();
    var preferenciasMemoria = new Map();
    function normalizar(valor) {
        return String(valor !== null && valor !== void 0 ? valor : "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ");
    }
    function escaparHtml(valor) {
        return String(valor !== null && valor !== void 0 ? valor : "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function nomeFichaAtual() {
        try {
            if (typeof fichaAtual !== "undefined" && fichaAtual)
                return String(fichaAtual);
        }
        catch (_erro) { }
        try {
            return localStorage.getItem("ficha_ninja_ativa_v1") || "Principal";
        }
        catch (_erro) {
            return "Principal";
        }
    }
    function chavePreferencia(tipo) {
        return "shinobi_".concat(tipo, "_aberto_v252__").concat(normalizar(nomeFichaAtual()).replace(/[^a-z0-9_-]+/g, "_") || "principal");
    }
    function lerPreferencia(tipo) {
        var chave = chavePreferencia(tipo);
        try {
            var salva = localStorage.getItem(chave);
            if (salva !== null)
                return salva;
        }
        catch (_erro) { }
        return preferenciasMemoria.get(chave) || "";
    }
    function salvarPreferencia(tipo, valor) {
        var chave = chavePreferencia(tipo);
        var texto = String(valor || "");
        preferenciasMemoria.set(chave, texto);
        try {
            localStorage.setItem(chave, texto);
        }
        catch (_erro) { }
    }
    function registroCatalogoDoJutsu(jutsu) {
        var e_1, _a;
        var ids = [jutsu === null || jutsu === void 0 ? void 0 : jutsu.catalogoId, jutsu === null || jutsu === void 0 ? void 0 : jutsu.origemId, jutsu === null || jutsu === void 0 ? void 0 : jutsu.id].filter(Boolean).map(String);
        try {
            for (var ids_1 = __values(ids), ids_1_1 = ids_1.next(); !ids_1_1.done; ids_1_1 = ids_1.next()) {
                var id = ids_1_1.value;
                if (catalogoJutsusPorId.has(id))
                    return catalogoJutsusPorId.get(id);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (ids_1_1 && !ids_1_1.done && (_a = ids_1.return)) _a.call(ids_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    function grupoDoJutsu(jutsu) {
        var elemento = normalizar((jutsu === null || jutsu === void 0 ? void 0 : jutsu.elemento) || "neutro");
        if (["katon", "suiton", "raiton", "fuuton", "doton", "yin", "yang"].includes(elemento))
            return elemento;
        var catalogado = registroCatalogoDoJutsu(jutsu);
        var classificacao = normalizar([
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.categoria,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.tipo,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.tipoNome,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.classificacao,
            catalogado === null || catalogado === void 0 ? void 0 : catalogado.categoria,
            catalogado === null || catalogado === void 0 ? void 0 : catalogado.tipoNome,
            catalogado === null || catalogado === void 0 ? void 0 : catalogado.tipoOriginal,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome
        ].filter(Boolean).join(" "));
        if (classificacao.includes("genjutsu") || classificacao.includes("yinton"))
            return "yin";
        if (classificacao.includes("iryo") || classificacao.includes("medic") || classificacao.includes("youton"))
            return "yang";
        if (classificacao.includes("taijutsu"))
            return "taijutsu";
        if (classificacao.includes("ninjutsu") || classificacao.includes("tecnica geral"))
            return "ninjutsu";
        if (classificacao.includes("katon"))
            return "katon";
        if (classificacao.includes("suiton"))
            return "suiton";
        if (classificacao.includes("raiton"))
            return "raiton";
        if (classificacao.includes("fuuton"))
            return "fuuton";
        if (classificacao.includes("doton"))
            return "doton";
        return elemento === "neutro" ? "ninjutsu" : "neutro";
    }
    function carregarClassificacoesCatalogo() {
        return __awaiter(this, void 0, void 0, function () {
            var versao, resposta, dados, lista, _erro_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        versao = encodeURIComponent(String(window.APP_VERSION || "2.5.2"));
                        return [4 /*yield*/, fetch("data/catalogo-jutsus.json?v=".concat(versao), { cache: "force-cache" })];
                    case 1:
                        resposta = _a.sent();
                        if (!resposta.ok)
                            return [2 /*return*/];
                        return [4 /*yield*/, resposta.json()];
                    case 2:
                        dados = _a.sent();
                        lista = Array.isArray(dados) ? dados : Array.isArray(dados === null || dados === void 0 ? void 0 : dados.jutsus) ? dados.jutsus : [];
                        lista.forEach(function (item) {
                            [item === null || item === void 0 ? void 0 : item.id, item === null || item === void 0 ? void 0 : item.catalogoId].filter(Boolean).forEach(function (id) { return catalogoJutsusPorId.set(String(id), item); });
                        });
                        agendarOrganizacaoJutsus();
                        return [3 /*break*/, 4];
                    case 3:
                        _erro_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function indiceDoCard(card, indiceFallback) {
        var resumo = card.querySelector(".jutsuLinhaResumo");
        var onclick = (resumo === null || resumo === void 0 ? void 0 : resumo.getAttribute("onclick")) || "";
        var encontrado = onclick.match(/alternarJutsuAberto\((\d+)\)/);
        if (encontrado)
            return Number(encontrado[1]);
        var salvo = Number(card.dataset.jutsuIndex);
        return Number.isInteger(salvo) ? salvo : indiceFallback;
    }
    function textoBuscaJutsu(jutsu, card) {
        return normalizar([
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.elemento,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.rank,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.custo,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.dano,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.alcance,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.duracao,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.acao,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.resistencia,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.alvo,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.descricao,
            card === null || card === void 0 ? void 0 : card.textContent
        ].filter(Boolean).join(" "));
    }
    function criarFerramentasJutsus(lista) {
        var _a;
        var pai = lista.parentElement;
        if (!pai)
            return null;
        var ferramentas = document.getElementById("jutsuFerramentasRetrateis");
        if (!ferramentas) {
            ferramentas = document.createElement("section");
            ferramentas.id = "jutsuFerramentasRetrateis";
            ferramentas.className = "jutsuFerramentasRetrateis";
            ferramentas.innerHTML = "\n        <label class=\"jutsuBuscaRetratil\">\n          <span aria-hidden=\"true\">\uD83D\uDD0E</span>\n          <input id=\"jutsuBuscaFicha\" type=\"search\" autocomplete=\"off\" placeholder=\"Buscar nos seus jutsus...\" aria-label=\"Buscar nos jutsus da ficha\">\n          <button id=\"jutsuBuscaLimpar\" type=\"button\" aria-label=\"Limpar busca\" hidden>\u00D7</button>\n        </label>\n        <div class=\"jutsuFerramentasLinha\">\n          <span id=\"jutsuResumoRetratil\">0 jutsus</span>\n          <button id=\"jutsuFecharGrupos\" type=\"button\">Fechar grupos</button>\n        </div>\n        <div id=\"jutsuElementosAtalhos\" class=\"jutsuElementosAtalhos\" aria-label=\"Atalhos dos elementos\"></div>\n      ";
            pai.insertBefore(ferramentas, lista);
            var input_1 = ferramentas.querySelector("#jutsuBuscaFicha");
            var limpar_1 = ferramentas.querySelector("#jutsuBuscaLimpar");
            input_1 === null || input_1 === void 0 ? void 0 : input_1.addEventListener("input", function () {
                buscaJutsus = String(input_1.value || "");
                if (limpar_1)
                    limpar_1.hidden = !buscaJutsus;
                aplicarFiltroJutsus();
            });
            limpar_1 === null || limpar_1 === void 0 ? void 0 : limpar_1.addEventListener("click", function () {
                buscaJutsus = "";
                if (input_1)
                    input_1.value = "";
                limpar_1.hidden = true;
                aplicarFiltroJutsus();
                input_1 === null || input_1 === void 0 ? void 0 : input_1.focus();
            });
            (_a = ferramentas.querySelector("#jutsuFecharGrupos")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
                grupoJutsuAberto = "";
                lista.querySelectorAll(".jutsuGrupoRetratil").forEach(function (secao) { return definirGrupoJutsuAberto(secao, false); });
                atualizarEstadoAtalhosJutsus();
            });
        }
        var input = ferramentas.querySelector("#jutsuBuscaFicha");
        if (input && input.value !== buscaJutsus)
            input.value = buscaJutsus;
        var limpar = ferramentas.querySelector("#jutsuBuscaLimpar");
        if (limpar)
            limpar.hidden = !buscaJutsus;
        return ferramentas;
    }
    function definirGrupoJutsuAberto(secao, aberto) {
        var cabecalho = secao.querySelector(".jutsuGrupoCabecalho");
        var conteudo = secao.querySelector(".jutsuGrupoConteudo");
        secao.classList.toggle("aberto", Boolean(aberto));
        cabecalho === null || cabecalho === void 0 ? void 0 : cabecalho.setAttribute("aria-expanded", String(Boolean(aberto)));
        if (conteudo)
            conteudo.hidden = !aberto;
    }
    function abrirSomenteGrupoJutsu(id, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.rolar, rolar = _c === void 0 ? false : _c;
        var lista = document.getElementById("listaJutsus");
        if (!lista)
            return;
        buscaJutsus = "";
        var input = document.getElementById("jutsuBuscaFicha");
        if (input)
            input.value = "";
        var limpar = document.getElementById("jutsuBuscaLimpar");
        if (limpar)
            limpar.hidden = true;
        lista.querySelectorAll(".jutsuGrupoRetratil").forEach(function (secao) {
            definirGrupoJutsuAberto(secao, secao.dataset.grupoJutsu === id);
        });
        grupoJutsuAberto = id;
        aplicarFiltroJutsus();
        atualizarEstadoAtalhosJutsus();
        if (rolar) {
            var alvo = lista.querySelector(".jutsuGrupoRetratil[data-grupo-jutsu=\"".concat(id, "\"]"));
            alvo === null || alvo === void 0 ? void 0 : alvo.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
    function atualizarEstadoAtalhosJutsus() {
        var host = document.getElementById("jutsuElementosAtalhos");
        if (!host)
            return;
        host.querySelectorAll("[data-atalho-jutsu]").forEach(function (botao) {
            var id = botao.dataset.atalhoJutsu || "";
            var ativo = id === "todos" ? !grupoJutsuAberto : id === grupoJutsuAberto;
            botao.classList.toggle("ativo", ativo);
            botao.setAttribute("aria-pressed", String(ativo));
        });
    }
    function atualizarAtalhosJutsus(contagens) {
        var host = document.getElementById("jutsuElementosAtalhos");
        if (!host)
            return;
        var total = Array.from(contagens.values()).reduce(function (soma, valor) { return soma + Number(valor || 0); }, 0);
        var todos = "\n      <button type=\"button\" class=\"jutsuElementoAtalho grupo-todos\" data-atalho-jutsu=\"todos\" title=\"Mostrar todos os grupos\" aria-pressed=\"false\">\n        <span class=\"jutsuAtalhoIcone\" aria-hidden=\"true\">\u25A6</span>\n        <span class=\"jutsuAtalhoTexto\"><strong>Todos</strong><b>".concat(total, "</b></span>\n      </button>\n    ");
        var grupos = GRUPOS_JUTSU
            .filter(function (grupo) { return (contagens.get(grupo.id) || 0) > 0; })
            .map(function (grupo) { return "\n        <button type=\"button\" class=\"jutsuElementoAtalho grupo-".concat(grupo.id, "\" data-atalho-jutsu=\"").concat(grupo.id, "\" title=\"Abrir ").concat(escaparHtml(grupo.nome), "\" aria-pressed=\"false\">\n          <span class=\"jutsuAtalhoIcone\" aria-hidden=\"true\">").concat(grupo.icone, "</span>\n          <span class=\"jutsuAtalhoTexto\"><strong>").concat(escaparHtml(grupo.atalho || grupo.nome), "</strong><b>").concat(contagens.get(grupo.id), "</b></span>\n        </button>\n      "); }).join("");
        host.innerHTML = todos + grupos;
        host.querySelectorAll("[data-atalho-jutsu]").forEach(function (botao) {
            botao.addEventListener("click", function () {
                var id = botao.dataset.atalhoJutsu;
                if (id === "todos") {
                    grupoJutsuAberto = "";
                    buscaJutsus = "";
                    var input = document.getElementById("jutsuBuscaFicha");
                    var limpar = document.getElementById("jutsuBuscaLimpar");
                    if (input)
                        input.value = "";
                    if (limpar)
                        limpar.hidden = true;
                    document.querySelectorAll("#listaJutsus .jutsuGrupoRetratil").forEach(function (secao) { return definirGrupoJutsuAberto(secao, false); });
                    aplicarFiltroJutsus();
                    atualizarEstadoAtalhosJutsus();
                    return;
                }
                abrirSomenteGrupoJutsu(id, { rolar: true });
            });
        });
        atualizarEstadoAtalhosJutsus();
    }
    function aplicarFiltroJutsus() {
        var lista = document.getElementById("listaJutsus");
        if (!lista)
            return;
        var termo = normalizar(buscaJutsus);
        var totalVisivel = 0;
        var gruposVisiveis = 0;
        lista.querySelectorAll(".jutsuGrupoRetratil").forEach(function (secao) {
            var visiveis = 0;
            secao.querySelectorAll(".jutsuListaCard").forEach(function (card) {
                var corresponde = !termo || String(card.dataset.jutsuBusca || "").includes(termo);
                card.hidden = !corresponde;
                if (corresponde)
                    visiveis += 1;
            });
            secao.hidden = visiveis === 0;
            if (visiveis) {
                gruposVisiveis += 1;
                totalVisivel += visiveis;
            }
            var contador = secao.querySelector("[data-jutsu-grupo-contador]");
            var total = Number(secao.dataset.totalJutsus || 0);
            if (contador)
                contador.textContent = termo ? "".concat(visiveis, "/").concat(total) : String(total);
            if (termo)
                definirGrupoJutsuAberto(secao, visiveis > 0);
        });
        if (!termo) {
            lista.querySelectorAll(".jutsuGrupoRetratil").forEach(function (secao) {
                definirGrupoJutsuAberto(secao, Boolean(grupoJutsuAberto) && secao.dataset.grupoJutsu === grupoJutsuAberto);
            });
        }
        var vazio = lista.querySelector(".jutsuBuscaSemResultado");
        if (vazio)
            vazio.hidden = totalVisivel > 0 || !termo;
        var resumo = document.getElementById("jutsuResumoRetratil");
        if (resumo) {
            resumo.textContent = termo
                ? "".concat(totalVisivel, " ").concat(totalVisivel === 1 ? "resultado" : "resultados")
                : "".concat(totalVisivel, " ").concat(totalVisivel === 1 ? "jutsu" : "jutsus", " em ").concat(gruposVisiveis, " ").concat(gruposVisiveis === 1 ? "grupo" : "grupos");
        }
        atualizarEstadoAtalhosJutsus();
    }
    function organizarJutsusAgora() {
        var _a, _b;
        if (organizandoJutsus)
            return;
        var lista = document.getElementById("listaJutsus");
        if (!lista)
            return;
        organizandoJutsus = true;
        try {
            (_a = document.getElementById("jutsuOrganizacaoBarra")) === null || _a === void 0 ? void 0 : _a.remove();
            criarFerramentasJutsus(lista);
            var cards = Array.from(lista.querySelectorAll(".jutsuListaCard"));
            if (!cards.length) {
                lista.querySelectorAll(".jutsuGrupoRetratil,.jutsuBuscaSemResultado").forEach(function (elemento) { return elemento.remove(); });
                var resumo = document.getElementById("jutsuResumoRetratil");
                if (resumo)
                    resumo.textContent = "0 jutsus";
                atualizarAtalhosJutsus(new Map());
                return;
            }
            var porGrupo_1 = new Map(GRUPOS_JUTSU.map(function (grupo) { return [grupo.id, []]; }));
            cards.forEach(function (card, posicao) {
                var _a, _b, _c;
                var indice = indiceDoCard(card, posicao);
                var jutsu = Array.isArray((_a = window.estado) === null || _a === void 0 ? void 0 : _a.jutsus) ? window.estado.jutsus[indice] : (typeof estado !== "undefined" ? (_b = estado === null || estado === void 0 ? void 0 : estado.jutsus) === null || _b === void 0 ? void 0 : _b[indice] : null);
                var grupo = grupoDoJutsu(jutsu);
                card.dataset.jutsuIndex = String(indice);
                card.dataset.jutsuGrupo = grupo;
                card.dataset.jutsuBusca = textoBuscaJutsu(jutsu, card);
                card.hidden = false;
                (_c = porGrupo_1.get(grupo)) === null || _c === void 0 ? void 0 : _c.push(card);
            });
            lista.replaceChildren();
            var grupoInicial_1 = grupoJutsuAberto && ((_b = porGrupo_1.get(grupoJutsuAberto)) === null || _b === void 0 ? void 0 : _b.length)
                ? grupoJutsuAberto
                : "";
            if (!grupoInicial_1)
                grupoJutsuAberto = "";
            var contagens_1 = new Map();
            GRUPOS_JUTSU.forEach(function (grupo) {
                var cardsGrupo = porGrupo_1.get(grupo.id) || [];
                if (!cardsGrupo.length)
                    return;
                contagens_1.set(grupo.id, cardsGrupo.length);
                var secao = document.createElement("section");
                secao.className = "jutsuGrupoRetratil grupo-".concat(grupo.id);
                secao.dataset.grupoJutsu = grupo.id;
                secao.dataset.totalJutsus = String(cardsGrupo.length);
                var cabecalho = document.createElement("button");
                cabecalho.type = "button";
                cabecalho.className = "jutsuGrupoCabecalho";
                cabecalho.innerHTML = "\n          <span class=\"jutsuGrupoIcone\" aria-hidden=\"true\">".concat(grupo.icone, "</span>\n          <span class=\"jutsuGrupoTexto\">\n            <span class=\"jutsuGrupoTitulo\">").concat(escaparHtml(grupo.nome), "</span>\n            <span class=\"jutsuGrupoSubtitulo\">").concat(escaparHtml(grupo.descricao || "Técnicas e habilidades"), "</span>\n          </span>\n          <span class=\"jutsuGrupoContador\" data-jutsu-grupo-contador>").concat(cardsGrupo.length, "</span>\n          <span class=\"jutsuGrupoSeta\" aria-hidden=\"true\">\u203A</span>\n        ");
                var conteudo = document.createElement("div");
                conteudo.className = "jutsuGrupoConteudo";
                cardsGrupo.forEach(function (card) { return conteudo.appendChild(card); });
                secao.append(cabecalho, conteudo);
                lista.appendChild(secao);
                cabecalho.addEventListener("click", function () {
                    if (normalizar(buscaJutsus))
                        return;
                    var vaiAbrir = !secao.classList.contains("aberto");
                    lista.querySelectorAll(".jutsuGrupoRetratil").forEach(function (outro) { return definirGrupoJutsuAberto(outro, false); });
                    definirGrupoJutsuAberto(secao, vaiAbrir);
                    grupoJutsuAberto = vaiAbrir ? grupo.id : "";
                    atualizarEstadoAtalhosJutsus();
                });
                definirGrupoJutsuAberto(secao, !buscaJutsus && grupo.id === grupoInicial_1);
            });
            var vazio = document.createElement("div");
            vazio.className = "jutsuBuscaSemResultado";
            vazio.hidden = true;
            vazio.innerHTML = "<strong>Nenhum jutsu encontrado.</strong><span>Tente outro nome, elemento, rank ou efeito.</span>";
            lista.appendChild(vazio);
            atualizarAtalhosJutsus(contagens_1);
            aplicarFiltroJutsus();
        }
        finally {
            organizandoJutsus = false;
        }
    }
    function agendarOrganizacaoJutsus() {
        if (frameJutsus)
            cancelAnimationFrame(frameJutsus);
        frameJutsus = requestAnimationFrame(function () {
            frameJutsus = requestAnimationFrame(function () {
                frameJutsus = 0;
                organizarJutsusAgora();
            });
        });
    }
    function desativarMovimentacaoLegada() {
        var lista = document.getElementById("listaJutsus");
        if (!lista || lista.dataset.retratilV240Node === "1")
            return;
        var clone = lista.cloneNode(true);
        clone.dataset.retratilV240Node = "1";
        delete clone.dataset.moverTouchV3;
        lista.replaceWith(clone);
    }
    function iconeCategoriaLoja(nome) {
        var chave = normalizar(nome);
        return ICONE_LOJA[chave] || (chave.includes("distancia") ? "🏹" : chave.includes("corpo") ? "⚔️" : chave.includes("consum") ? "🧪" : "🎒");
    }
    function chaveCategoriaLoja(nome) {
        return normalizar(nome).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "itens";
    }
    function definirCategoriaLojaAberta(secao, aberta) {
        var cabecalho = secao.querySelector(".lojaCategoriaCabecalho");
        var grade = secao.querySelector(".lojaGrid");
        secao.classList.toggle("aberta", Boolean(aberta));
        cabecalho === null || cabecalho === void 0 ? void 0 : cabecalho.setAttribute("aria-expanded", String(Boolean(aberta)));
        if (grade)
            grade.hidden = !aberta;
    }
    function organizarLojaAgora() {
        var _a;
        if (organizandoLoja)
            return;
        var host = document.getElementById("lojaCatalogo");
        if (!host)
            return;
        organizandoLoja = true;
        try {
            var secoes = Array.from(host.querySelectorAll(":scope > .lojaCategoria"));
            if (!secoes.length)
                return;
            var pesquisando_1 = Boolean(normalizar(((_a = document.getElementById("lojaBusca")) === null || _a === void 0 ? void 0 : _a.value) || ""));
            var preferida = lerPreferencia("loja");
            var categorias_1 = [];
            secoes.forEach(function (secao, indice) {
                if (secao.dataset.retratilV240 === "1") {
                    categorias_1.push(secao.dataset.categoriaLoja || "");
                    return;
                }
                var tituloAntigo = secao.querySelector(":scope > h3");
                var nome = String((tituloAntigo === null || tituloAntigo === void 0 ? void 0 : tituloAntigo.textContent) || "Categoria ".concat(indice + 1)).trim();
                var chave = chaveCategoriaLoja(nome);
                var quantidade = secao.querySelectorAll(".lojaItemCard").length;
                var grade = secao.querySelector(":scope > .lojaGrid");
                if (!grade)
                    return;
                var cabecalho = document.createElement("button");
                cabecalho.type = "button";
                cabecalho.className = "lojaCategoriaCabecalho";
                cabecalho.innerHTML = "\n          <span class=\"lojaCategoriaIcone\" aria-hidden=\"true\">".concat(iconeCategoriaLoja(nome), "</span>\n          <span class=\"lojaCategoriaTitulo\">").concat(escaparHtml(nome), "</span>\n          <span class=\"lojaCategoriaContador\">").concat(quantidade, "</span>\n          <span class=\"lojaCategoriaSeta\" aria-hidden=\"true\">\u2304</span>\n        ");
                tituloAntigo === null || tituloAntigo === void 0 ? void 0 : tituloAntigo.replaceWith(cabecalho);
                secao.dataset.retratilV240 = "1";
                secao.dataset.categoriaLoja = chave;
                categorias_1.push(chave);
                cabecalho.addEventListener("click", function () {
                    var vaiAbrir = !secao.classList.contains("aberta");
                    host.querySelectorAll(":scope > .lojaCategoria").forEach(function (outra) { return definirCategoriaLojaAberta(outra, false); });
                    definirCategoriaLojaAberta(secao, vaiAbrir);
                    salvarPreferencia("loja", vaiAbrir ? chave : "");
                });
            });
            var chaveInicial_1 = categorias_1.includes(preferida) ? preferida : "";
            secoes.forEach(function (secao) {
                var aberta = pesquisando_1 || secao.dataset.categoriaLoja === chaveInicial_1;
                definirCategoriaLojaAberta(secao, aberta);
            });
        }
        finally {
            organizandoLoja = false;
        }
    }
    function agendarOrganizacaoLoja() {
        if (frameLoja)
            cancelAnimationFrame(frameLoja);
        frameLoja = requestAnimationFrame(function () {
            frameLoja = 0;
            organizarLojaAgora();
        });
    }
    function instalarObservadorLoja() {
        var host = document.getElementById("lojaCatalogo");
        if (!host || observadorLoja)
            return;
        observadorLoja = new MutationObserver(function () { return agendarOrganizacaoLoja(); });
        observadorLoja.observe(host, { childList: true });
        agendarOrganizacaoLoja();
    }
    function instalarWrapperJutsus() {
        if (typeof window.renderizarJutsus !== "function" || window.__renderJutsusRetratilV240)
            return;
        window.__renderJutsusRetratilV240 = true;
        var base = window.renderizarJutsus;
        window.renderizarJutsus = function () {
            var resultado = base.apply(this, arguments);
            /* O render base recria as cartas de forma síncrona. Reagrupar também
               de forma síncrona evita que o navegador pinte por 1–2 frames a lista
               sem os grupos retráteis, que aparecia como uma piscada no realtime. */
            organizarJutsusAgora();
            return resultado;
        };
        try {
            renderizarJutsus = window.renderizarJutsus;
        }
        catch (_erro) { }
    }
    function iniciar() {
        desativarMovimentacaoLegada();
        instalarWrapperJutsus();
        instalarObservadorLoja();
        agendarOrganizacaoJutsus();
        agendarOrganizacaoLoja();
        carregarClassificacoesCatalogo();
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { return setTimeout(iniciar, 0); }, { once: true });
    }
    else {
        setTimeout(iniciar, 0);
    }
    window.addEventListener("pageshow", function () { return setTimeout(function () {
        instalarWrapperJutsus();
        instalarObservadorLoja();
        agendarOrganizacaoJutsus();
        agendarOrganizacaoLoja();
    }, 0); });
    window.ShinobiOrganizacaoRetratil = Object.freeze({
        versao: "2.5.2",
        organizarJutsus: organizarJutsusAgora,
        organizarLoja: organizarLojaAgora,
        abrirGrupoJutsu: abrirSomenteGrupoJutsu,
        grupoDoJutsu: grupoDoJutsu,
        chaveCategoriaLoja: chaveCategoriaLoja
    });
})();
