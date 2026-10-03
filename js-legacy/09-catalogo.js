/* GERADO AUTOMATICAMENTE — fonte: js/09-catalogo.js — app 2.5.8.154. Não editar. */
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
/* Shinobi 2.1.0 — Catálogo de jutsus com Rank máximo da progressão
 *
 * Responsabilidades:
 * - carregar o catálogo JSON somente quando necessário;
 * - pesquisar e filtrar as técnicas;
 * - mostrar uma prévia antes da inclusão;
 * - copiar o jutsu escolhido para a ficha atual;
 * - preservar edição, imagem e demais recursos dos cards existentes.
 */
(function () {
    "use strict";
    if (window.__catalogoJutsusV150)
        return;
    window.__catalogoJutsusV150 = true;
    var URL_CATALOGO = "./data/catalogo-jutsus.json?v=".concat(encodeURIComponent(window.APP_VERSION || "1.10.8"));
    var LIMITE_INICIAL = 30;
    var PASSO_LISTAGEM = 30;
    function garantirEstilosCriticosCatalogo() {
        if (document.getElementById("catalogoCriticoV150")) {
            return;
        }
        var estilo = document.createElement("style");
        estilo.id = "catalogoCriticoV150";
        estilo.textContent = "\n      #catalogoJutsusLista{\n        display:block !important;\n      }\n\n      #catalogoJutsusLista .catalogoCarta{\n        display:block !important;\n        width:100% !important;\n        min-height:172px !important;\n        margin:0 0 12px !important;\n        overflow:hidden !important;\n        box-sizing:border-box !important;\n      }\n\n      #catalogoJutsusLista .catalogoCartaCorpo{\n        display:grid !important;\n        grid-template-columns:43px minmax(0,1fr) !important;\n        gap:11px !important;\n        width:100% !important;\n        min-height:128px !important;\n        padding:12px !important;\n        box-sizing:border-box !important;\n        visibility:visible !important;\n        opacity:1 !important;\n      }\n\n      #catalogoJutsusLista .catalogoCartaElemento{\n        display:grid !important;\n        width:41px !important;\n        height:41px !important;\n        place-items:center !important;\n        visibility:visible !important;\n        opacity:1 !important;\n      }\n\n      #catalogoJutsusLista .catalogoCartaConteudo{\n        display:block !important;\n        min-width:0 !important;\n        visibility:visible !important;\n        opacity:1 !important;\n      }\n\n      #catalogoJutsusLista .catalogoCartaConteudo strong,\n      #catalogoJutsusLista .catalogoCartaConteudo small,\n      #catalogoJutsusLista .catalogoCartaMetadados,\n      #catalogoJutsusLista .catalogoCartaResumo{\n        visibility:visible !important;\n        opacity:1 !important;\n      }\n\n      #catalogoJutsusLista .catalogoCartaConteudo strong,\n      #catalogoJutsusLista .catalogoCartaConteudo small,\n      #catalogoJutsusLista .catalogoCartaResumo{\n        display:block !important;\n      }\n\n      #catalogoJutsusLista .catalogoCartaMetadados,\n      #catalogoJutsusLista .catalogoCartaRodape{\n        display:flex !important;\n      }\n\n      #catalogoJutsusLista .catalogoCartaRodape{\n        min-height:43px !important;\n        visibility:visible !important;\n        opacity:1 !important;\n      }\n    ";
        document.head.appendChild(estilo);
    }
    var ELEMENTOS = {
        katon: {
            nome: "Katon",
            icone: "🔥",
            classe: "catalogoElementoKaton"
        },
        raiton: {
            nome: "Raiton",
            icone: "⚡",
            classe: "catalogoElementoRaiton"
        },
        fuuton: {
            nome: "Fuuton",
            icone: "🌪️",
            classe: "catalogoElementoFuuton"
        },
        suiton: {
            nome: "Suiton",
            icone: "💧",
            classe: "catalogoElementoSuiton"
        },
        doton: {
            nome: "Doton",
            icone: "🪨",
            classe: "catalogoElementoDoton"
        },
        yin: {
            nome: "Yinton",
            icone: "🌑",
            classe: "catalogoElementoYin"
        },
        yang: {
            nome: "Youton",
            icone: "☀️",
            classe: "catalogoElementoYang"
        },
        neutro: {
            nome: "Neutro",
            icone: "✨",
            classe: "catalogoElementoNeutro"
        }
    };
    var dadosCatalogo = null;
    var promessaCatalogo = null;
    var overlayCatalogo = null;
    var overlayEscolha = null;
    var overlayPrevia = null;
    var termoBusca = "";
    var filtroElemento = "";
    var filtroRank = "";
    var filtroCategoria = "";
    var limiteAtual = LIMITE_INICIAL;
    var selecionados = new Set();
    var filtrosAbertos = false;
    var rolagemAnteriorBloqueada = "";
    function escaparHtml(valor) {
        return String(valor !== null && valor !== void 0 ? valor : "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function normalizarBusca(valor) {
        return String(valor !== null && valor !== void 0 ? valor : "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }
    var NOMES_TECNICAS_LEE = new Set([
        "entrada dinamica (requer habilidade)",
        "lotus frontal (requer habilidade)",
        "lotus reverso (requer habilidade)",
        "segundo portao (requer habilidade)",
        "quarto portao (requer habilidade)"
    ]);
    function palavrasChaveExtrasJutsu(jutsu) {
        var nome = normalizarBusca(jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome);
        var categoria = normalizarBusca(jutsu === null || jutsu === void 0 ? void 0 : jutsu.categoria);
        var requisitos = normalizarBusca(Array.isArray(jutsu === null || jutsu === void 0 ? void 0 : jutsu.requisitos)
            ? jutsu.requisitos.join(" ")
            : jutsu === null || jutsu === void 0 ? void 0 : jutsu.requisitos);
        var extras = [];
        var adicionar = function () {
            var valores = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                valores[_i] = arguments[_i];
            }
            valores.forEach(function (valor) {
                var texto = String(valor !== null && valor !== void 0 ? valor : "").trim();
                if (texto)
                    extras.push(texto);
            });
        };
        if (nome.startsWith("8t:")) {
            adicionar("Hyuuga", "Hyuga", "Byakugan", "Jougan", "Punho Suave", "8T", "Oito Trigramas", "Kaiten");
        }
        else if (requisitos.includes("byakugan")) {
            adicionar("Hyuuga", "Hyuga", "Byakugan", "Jougan", "Punho Suave", "Oito Trigramas");
        }
        if (nome.includes("campo de cinzas quentes") ||
            requisitos.includes("cla sarutobi")) {
            adicionar("Sarutobi", "Vontade do Fogo");
        }
        if (NOMES_TECNICAS_LEE.has(nome)) {
            adicionar("Lee", "Rock Lee", "Portoes", "Portões", "Lótus", "Lotus");
        }
        if (nome === "agilidade felina") {
            adicionar("Izuna", "Agilidade Felina");
        }
        if (nome.includes("selamento")) {
            adicionar("Uzumaki", "Fuinjutsu", "Selamento");
        }
        if (categoria.includes("genjutsu")) {
            adicionar("Yuuhi", "Yuhi", "Ilusao", "Ilusão", "Pesadelo", "Genjutsu");
        }
        if (elementoDoJutsu(jutsu) === "katon") {
            adicionar("Uchiha", "Mestre do Fogo");
        }
        /*
         * Aliases preservam a grafia usada nas fichas de exemplo sem
         * reescrever o nome oficial que veio do suplemento de jutsus.
         */
        if (nome === "punhos de ferro") {
            adicionar("Punho de Ferro");
        }
        if (nome.includes("punhos silensiosos")) {
            adicionar("Punhos Silenciosos", "Punhos Silenciosos (C)");
        }
        if (nome.includes("fuuuton: grande espiral")) {
            adicionar("Fuuton: Grande Espiral de Vento");
        }
        if (nome.includes("jutsu multi clones das sombras")) {
            adicionar("Multi-Clones das Sombras", "Multi Clones das Sombras");
        }
        if (nome.includes("raiton: garras de tempestade")) {
            adicionar("Raiton: Garras da Tempestade");
        }
        if (nome.includes("suiton: grande vortice de agua")) {
            adicionar("Suiton: Grade Vórtice de Água", "Suiton: Grade Vortice de Agua");
        }
        return extras;
    }
    function textoBuscaJutsu(jutsu) {
        var _a, _b;
        return normalizarBusca(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.tipoNome,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.categoria,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.rank,
            jutsu === null || jutsu === void 0 ? void 0 : jutsu.descricao,
            (_a = jutsu === null || jutsu === void 0 ? void 0 : jutsu.upgrade) === null || _a === void 0 ? void 0 : _a.efeito,
            (_b = jutsu === null || jutsu === void 0 ? void 0 : jutsu.upgrade) === null || _b === void 0 ? void 0 : _b.requisito
        ], __read((Array.isArray(jutsu === null || jutsu === void 0 ? void 0 : jutsu.requisitos) ? jutsu.requisitos : [jutsu === null || jutsu === void 0 ? void 0 : jutsu.requisitos])), false), __read((Array.isArray(jutsu === null || jutsu === void 0 ? void 0 : jutsu.clas) ? jutsu.clas : [jutsu === null || jutsu === void 0 ? void 0 : jutsu.clas])), false), __read((Array.isArray(jutsu === null || jutsu === void 0 ? void 0 : jutsu.palavrasChave) ? jutsu.palavrasChave : [jutsu === null || jutsu === void 0 ? void 0 : jutsu.palavrasChave])), false), __read(palavrasChaveExtrasJutsu(jutsu)), false).filter(Boolean).join(" "));
    }
    var ORDEM_RANK_JUTSU = { E: 1, D: 2, C: 3, B: 4, A: 5, S: 6 };
    function rankMaximoPersonagem() {
        var _a, _b, _c;
        var api = (_b = (_a = window.shinobiLevelUp) === null || _a === void 0 ? void 0 : _a.getMaxJutsuRank) === null || _b === void 0 ? void 0 : _b.call(_a);
        var salvo = typeof estado !== "undefined" ? (_c = estado === null || estado === void 0 ? void 0 : estado.progressaoFixa) === null || _c === void 0 ? void 0 : _c.jutsuRankMax : "";
        return String(api || salvo || "").trim().toUpperCase();
    }
    function jutsuAcimaDoRank(jutsu) {
        var maximo = rankMaximoPersonagem();
        var rank = String((jutsu === null || jutsu === void 0 ? void 0 : jutsu.rank) || "").trim().toUpperCase();
        if (!maximo || !(maximo in ORDEM_RANK_JUTSU) || !(rank in ORDEM_RANK_JUTSU))
            return false;
        return ORDEM_RANK_JUTSU[rank] > ORDEM_RANK_JUTSU[maximo];
    }
    function chaveJutsu(jutsu) {
        return String((jutsu === null || jutsu === void 0 ? void 0 : jutsu.catalogoId) ||
            (jutsu === null || jutsu === void 0 ? void 0 : jutsu.id) ||
            "");
    }
    function elementoDoJutsu(jutsu) {
        var elemento = String((jutsu === null || jutsu === void 0 ? void 0 : jutsu.elemento) || "neutro").toLowerCase();
        return ELEMENTOS[elemento]
            ? elemento
            : "neutro";
    }
    function textoOuTraco(valor) {
        var texto = String(valor !== null && valor !== void 0 ? valor : "").trim();
        return texto || "—";
    }
    function travarRolagem() {
        if (overlayCatalogo ||
            overlayEscolha ||
            overlayPrevia) {
            return;
        }
        rolagemAnteriorBloqueada =
            document.body.style.overflow;
        document.body.style.overflow = "hidden";
    }
    function liberarRolagemSePossivel() {
        if (overlayCatalogo ||
            overlayEscolha ||
            overlayPrevia) {
            return;
        }
        document.body.style.overflow =
            rolagemAnteriorBloqueada;
    }
    function avisar(titulo, mensagem) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(typeof avisoShinobi === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, avisoShinobi(titulo, mensagem)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        alert("".concat(titulo, "\n\n").concat(mensagem));
                        return [2 /*return*/];
                }
            });
        });
    }
    function confirmar(titulo, mensagem) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof modalShinobi === "function") {
                    return [2 /*return*/, modalShinobi(titulo, mensagem)];
                }
                return [2 /*return*/, window.confirm("".concat(titulo, "\n\n").concat(mensagem))];
            });
        });
    }
    function carregarCatalogo() {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (dadosCatalogo)
                    return [2 /*return*/, dadosCatalogo];
                if (promessaCatalogo)
                    return [2 /*return*/, promessaCatalogo];
                promessaCatalogo = fetch(URL_CATALOGO, {
                    cache: "no-cache",
                    credentials: "same-origin"
                })
                    .then(function (response) { return __awaiter(_this, void 0, void 0, function () {
                    var dados;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!response.ok) {
                                    throw new Error("Cat\u00E1logo indispon\u00EDvel (".concat(response.status, ")."));
                                }
                                return [4 /*yield*/, response.json()];
                            case 1:
                                dados = _a.sent();
                                if (!dados ||
                                    !Array.isArray(dados.jutsus)) {
                                    throw new Error("O arquivo do catálogo possui formato inválido.");
                                }
                                dadosCatalogo = dados;
                                return [2 /*return*/, dadosCatalogo];
                        }
                    });
                }); })
                    .catch(function (erro) {
                    promessaCatalogo = null;
                    throw erro;
                });
                return [2 /*return*/, promessaCatalogo];
            });
        });
    }
    function idsPresentesNaFicha() {
        var ids = new Set();
        try {
            (estado.jutsus || []).forEach(function (jutsu) {
                var id = chaveJutsu(jutsu);
                if (id)
                    ids.add(id);
            });
        }
        catch (erro) { }
        return ids;
    }
    function obterJutsuPorId(id) {
        var _a;
        return ((_a = dadosCatalogo === null || dadosCatalogo === void 0 ? void 0 : dadosCatalogo.jutsus) === null || _a === void 0 ? void 0 : _a.find(function (jutsu) { return chaveJutsu(jutsu) === id; })) || null;
    }
    function obterJutsusFiltrados() {
        var busca = normalizarBusca(termoBusca);
        return ((dadosCatalogo === null || dadosCatalogo === void 0 ? void 0 : dadosCatalogo.jutsus) || []).filter(function (jutsu) {
            if (filtroElemento &&
                elementoDoJutsu(jutsu) !== filtroElemento) {
                return false;
            }
            if (filtroRank &&
                String(jutsu.rank || "") !== filtroRank) {
                return false;
            }
            if (filtroCategoria &&
                String(jutsu.categoria || "") !== filtroCategoria) {
                return false;
            }
            if (!busca)
                return true;
            var texto = textoBuscaJutsu(jutsu);
            return texto.includes(busca);
        });
    }
    function opcoesOrdenadas(campo) {
        return __spreadArray([], __read(new Set(((dadosCatalogo === null || dadosCatalogo === void 0 ? void 0 : dadosCatalogo.jutsus) || [])
            .map(function (jutsu) { return String((jutsu === null || jutsu === void 0 ? void 0 : jutsu[campo]) || "").trim(); })
            .filter(Boolean))), false).sort(function (a, b) { return a.localeCompare(b, "pt-BR", { numeric: true }); });
    }
    function montarOpcoesDosFiltros() {
        if (!overlayCatalogo)
            return;
        var rank = overlayCatalogo.querySelector("#catalogoFiltroRank");
        var categoria = overlayCatalogo.querySelector("#catalogoFiltroCategoria");
        rank.innerHTML = __spreadArray([
            '<option value="">Todos os ranks</option>'
        ], __read(opcoesOrdenadas("rank").map(function (valor) {
            return "<option value=\"".concat(escaparHtml(valor), "\">Rank ").concat(escaparHtml(valor), "</option>");
        })), false).join("");
        categoria.innerHTML = __spreadArray([
            '<option value="">Todas as categorias</option>'
        ], __read(opcoesOrdenadas("categoria").map(function (valor) {
            return "<option value=\"".concat(escaparHtml(valor), "\">").concat(escaparHtml(valor), "</option>");
        })), false).join("");
    }
    function filtrosAtivos() {
        var _a;
        var ativos = [];
        if (filtroElemento) {
            ativos.push({
                tipo: "elemento",
                rotulo: ((_a = ELEMENTOS[filtroElemento]) === null || _a === void 0 ? void 0 : _a.nome) || filtroElemento
            });
        }
        if (filtroRank) {
            ativos.push({
                tipo: "rank",
                rotulo: "Rank ".concat(filtroRank)
            });
        }
        if (filtroCategoria) {
            ativos.push({
                tipo: "categoria",
                rotulo: filtroCategoria
            });
        }
        return ativos;
    }
    function definirFiltrosAbertos(abertos) {
        filtrosAbertos = Boolean(abertos);
        if (!overlayCatalogo)
            return;
        var painel = overlayCatalogo.querySelector("#catalogoFiltrosPainel");
        var botao = overlayCatalogo.querySelector("#catalogoAlternarFiltros");
        if (painel) {
            painel.hidden = !filtrosAbertos;
        }
        if (botao) {
            botao.setAttribute("aria-expanded", String(filtrosAbertos));
            botao.classList.toggle("aberto", filtrosAbertos);
        }
    }
    function atualizarResumoFiltros() {
        if (!overlayCatalogo)
            return;
        var ativos = filtrosAtivos();
        var resumo = overlayCatalogo.querySelector("#catalogoFiltrosResumo");
        var contador = overlayCatalogo.querySelector("#catalogoFiltrosContador");
        var limpar = overlayCatalogo.querySelector("#catalogoLimparFiltros");
        if (contador) {
            contador.textContent = String(ativos.length);
            contador.hidden = ativos.length === 0;
        }
        if (limpar) {
            limpar.disabled = ativos.length === 0 && !termoBusca;
        }
        if (!resumo)
            return;
        resumo.hidden = ativos.length === 0;
        resumo.innerHTML = ativos.map(function (item) { return "\n      <span class=\"catalogoFiltroChip\">\n        ".concat(escaparHtml(item.rotulo), "\n      </span>\n    "); }).join("");
    }
    function resumoDescricao(jutsu) {
        var descricao = String((jutsu === null || jutsu === void 0 ? void 0 : jutsu.descricao) || "")
            .replace(/\s+/g, " ")
            .trim();
        if (descricao.length <= 125)
            return descricao;
        return "".concat(descricao.slice(0, 122).trim(), "\u2026");
    }
    function renderizarCartaCatalogo(jutsu, idsFicha) {
        var _a;
        var id = chaveJutsu(jutsu);
        var elementoId = elementoDoJutsu(jutsu);
        var elemento = ELEMENTOS[elementoId];
        var selecionado = selecionados.has(id);
        var jaPossui = idsFicha.has(id);
        var acimaDoRank = jutsuAcimaDoRank(jutsu);
        var rankMaximo = rankMaximoPersonagem();
        var custo = textoOuTraco(jutsu.custo);
        var dano = textoOuTraco(jutsu.dano);
        var acao = textoOuTraco(jutsu.acao);
        return "\n      <article\n        class=\"catalogoCarta ".concat(elemento.classe, " ").concat(selecionado ? "catalogoCartaSelecionada" : "", " ").concat(jaPossui ? "catalogoCartaAdquirida" : "", " ").concat(acimaDoRank ? "catalogoCartaAcimaRank" : "", "\"\n        data-catalogo-id=\"").concat(escaparHtml(id), "\"\n        style=\"display:block;width:100%;min-height:172px;margin:0 0 9px;overflow:hidden;box-sizing:border-box\"\n      >\n        <div\n          class=\"catalogoCartaCorpo\"\n          data-acao-catalogo=\"visualizar\"\n          data-catalogo-id=\"").concat(escaparHtml(id), "\"\n          role=\"button\"\n          tabindex=\"0\"\n          aria-label=\"Ver detalhes de ").concat(escaparHtml(jutsu.nome), "\"\n          style=\"display:grid;grid-template-columns:42px minmax(0,1fr);gap:10px;width:100%;min-height:128px;padding:11px;box-sizing:border-box;visibility:visible;opacity:1\"\n        >\n          <span class=\"catalogoCartaElemento\">\n            ").concat(elemento.icone, "\n          </span>\n\n          <span class=\"catalogoCartaConteudo\">\n            <strong>").concat(escaparHtml(jutsu.nome), "</strong>\n\n            <small>\n              ").concat(escaparHtml(elemento.nome), "\n              \u2022 Rank ").concat(escaparHtml(jutsu.rank || "—"), "\n              \u2022 ").concat(escaparHtml(custo), " CH\n            </small>\n\n            <span class=\"catalogoCartaMetadados\">\n              <b>").concat(escaparHtml(acao), "</b>\n              <b>Dano: ").concat(escaparHtml(dano), "</b>\n            </span>\n\n            ").concat(acimaDoRank ? "<span class=\"catalogoAvisoRank\">Acima do Rank m\u00E1ximo ".concat(escaparHtml(rankMaximo), "</span>") : "", "\n\n            <span class=\"catalogoCartaResumo\">\n              ").concat(escaparHtml(resumoDescricao(jutsu)), "\n            </span>\n          </span>\n        </div>\n\n        <div class=\"catalogoCartaRodape\">\n          <span class=\"catalogoCartaPagina\">\n            P\u00E1gina ").concat(escaparHtml(((_a = jutsu.fonte) === null || _a === void 0 ? void 0 : _a.pagina) || "—"), "\n          </span>\n\n          ").concat(jaPossui
            ? '<span class="catalogoJaNaFicha">Já está na ficha</span>'
            : "\n                <button\n                  type=\"button\"\n                  class=\"catalogoSelecionarBtn ".concat(selecionado ? "ativo" : "", "\"\n                  data-acao-catalogo=\"selecionar\"\n                  data-catalogo-id=\"").concat(escaparHtml(id), "\"\n                >\n                  ").concat(selecionado ? "Selecionado ✓" : "Selecionar", "\n                </button>\n              "), "\n        </div>\n      </article>\n    ");
    }
    function atualizarRodapeSelecao() {
        if (!overlayCatalogo)
            return;
        var contador = overlayCatalogo.querySelector("#catalogoSelecionadosContador");
        var botao = overlayCatalogo.querySelector("#catalogoAdicionarSelecionados");
        var total = selecionados.size;
        contador.textContent =
            total === 1
                ? "1 selecionado"
                : "".concat(total, " selecionados");
        botao.disabled = total === 0;
        botao.textContent =
            total > 0
                ? "Adicionar \u00E0 ficha (".concat(total, ")")
                : "Adicionar à ficha";
    }
    function renderizarCatalogo() {
        if (!overlayCatalogo || !dadosCatalogo)
            return;
        var lista = overlayCatalogo.querySelector("#catalogoJutsusLista");
        var status = overlayCatalogo.querySelector("#catalogoJutsusStatus");
        var carregarMais = overlayCatalogo.querySelector("#catalogoCarregarMais");
        var filtrados = obterJutsusFiltrados();
        var visiveis = filtrados.slice(0, limiteAtual);
        var idsFicha = idsPresentesNaFicha();
        status.textContent = filtrados.length === dadosCatalogo.jutsus.length
            ? "".concat(filtrados.length, " jutsus")
            : "".concat(filtrados.length, " de ").concat(dadosCatalogo.jutsus.length, " jutsus");
        atualizarResumoFiltros();
        if (!filtrados.length) {
            lista.innerHTML = "\n        <div class=\"catalogoVazio\">\n          <strong>Nenhum jutsu encontrado.</strong>\n          <span>Tente retirar algum filtro ou pesquisar outro nome.</span>\n        </div>\n      ";
        }
        else {
            lista.innerHTML = visiveis
                .map(function (jutsu) { return renderizarCartaCatalogo(jutsu, idsFicha); })
                .join("");
        }
        var faltam = filtrados.length - visiveis.length;
        carregarMais.hidden = faltam <= 0;
        carregarMais.textContent =
            faltam > PASSO_LISTAGEM
                ? "Carregar mais ".concat(PASSO_LISTAGEM)
                : "Carregar mais ".concat(faltam);
        atualizarRodapeSelecao();
    }
    function alternarSelecao(id) {
        if (!id)
            return;
        if (idsPresentesNaFicha().has(id)) {
            avisar("Jutsu já adicionado", "Esse jutsu já está na ficha. O card existente continua totalmente editável.");
            return;
        }
        if (selecionados.has(id)) {
            selecionados.delete(id);
        }
        else {
            selecionados.add(id);
        }
        renderizarCatalogo();
    }
    function converterParaJutsuDaFicha(jutsu) {
        var _a, _b;
        var descricao = String(jutsu.descricao || "");
        return {
            nome: String(jutsu.nome || ""),
            rank: String(jutsu.rank || ""),
            elemento: elementoDoJutsu(jutsu),
            categoria: String(jutsu.categoria || ""),
            tipoNome: String(jutsu.tipoNome || ""),
            bonusAcerto: String(jutsu.bonusAcerto || ""),
            dano: String(jutsu.dano || ""),
            bonusDano: String(jutsu.bonusDano || ""),
            custo: String((_a = jutsu.custo) !== null && _a !== void 0 ? _a : ""),
            alcance: String(jutsu.alcance || ""),
            raio: String(jutsu.raio || ""),
            duracao: String(jutsu.duracao || ""),
            acao: String(jutsu.acao || ""),
            resistencia: String(jutsu.resistencia || ""),
            alvo: String(jutsu.alvo || ""),
            descricao: descricao,
            imagem: "",
            /*
             * Os efeitos não ficam mais duplicados no catálogo. O módulo 12
             * associa o registro central ao card logo após a inclusão na ficha.
             */
            catalogoId: chaveJutsu(jutsu),
            catalogoFonte: {
                catalogo: (dadosCatalogo === null || dadosCatalogo === void 0 ? void 0 : dadosCatalogo.catalogoId) ||
                    "suplemento-shinobi-jutsus",
                pagina: ((_b = jutsu.fonte) === null || _b === void 0 ? void 0 : _b.pagina) || null
            }
        };
    }
    function persistirJutsusAdicionados(indicesAbertos) {
        estado.jutsusAbertos =
            estado.jutsusAbertos || {};
        indicesAbertos.forEach(function (indice) {
            estado.jutsusAbertos[indice] = true;
        });
        var contexto = { confirmada: true, origem: "catalogo-jutsus", campo: "jutsus", motivo: "alteracao-confirmada" };
        if (typeof persistirEstadoLocal === "function") {
            persistirEstadoLocal(contexto);
        }
        else if (typeof persistirSemRender === "function") {
            persistirSemRender(contexto);
        }
        if (typeof renderizarJutsus === "function") {
            renderizarJutsus();
        }
    }
    function adicionarIdsNaFicha(ids) {
        return __awaiter(this, void 0, void 0, function () {
            var idsFicha, novos, ignorados, primeiroIndice, indicesAbertos, erro_1, nomes, restantes;
            var _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        idsFicha = idsPresentesNaFicha();
                        novos = [];
                        ignorados = [];
                        ids.forEach(function (id) {
                            if (idsFicha.has(id)) {
                                ignorados.push(id);
                                return;
                            }
                            var jutsu = obterJutsuPorId(id);
                            if (jutsu) {
                                novos.push(converterParaJutsuDaFicha(jutsu));
                                idsFicha.add(id);
                            }
                        });
                        if (!!novos.length) return [3 /*break*/, 2];
                        return [4 /*yield*/, avisar("Nenhum jutsu adicionado", ignorados.length
                                ? "As cartas escolhidas já estão presentes na ficha."
                                : "Selecione ao menos uma carta do catálogo.")];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, false];
                    case 2:
                        estado.jutsus = Array.isArray(estado.jutsus)
                            ? estado.jutsus
                            : [];
                        primeiroIndice = estado.jutsus.length;
                        (_a = estado.jutsus).push.apply(_a, __spreadArray([], __read(novos), false));
                        indicesAbertos = novos.map(function (_, indice) { return primeiroIndice + indice; });
                        if (!((_b = window.EfeitosJutsuShinobi) === null || _b === void 0 ? void 0 : _b.migrar)) return [3 /*break*/, 6];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, window.EfeitosJutsuShinobi.migrar()];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        erro_1 = _c.sent();
                        console.warn("Não foi possível associar os efeitos do catálogo imediatamente.", erro_1);
                        return [3 /*break*/, 6];
                    case 6:
                        persistirJutsusAdicionados(indicesAbertos);
                        selecionados.clear();
                        fecharPreviaCatalogo();
                        fecharCatalogoJutsus();
                        nomes = novos
                            .slice(0, 3)
                            .map(function (jutsu) { return "\u2022 ".concat(jutsu.nome); })
                            .join("\n");
                        restantes = novos.length - 3;
                        return [4 /*yield*/, avisar(novos.length === 1
                                ? "Jutsu adicionado"
                                : "".concat(novos.length, " jutsus adicionados"), "".concat(nomes).concat(restantes > 0 ? "\n\u2022 e mais ".concat(restantes) : "", "\n\nOs campos e a imagem continuam edit\u00E1veis na ficha."))];
                    case 7:
                        _c.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    }
    function fecharPreviaCatalogo() {
        if (!overlayPrevia)
            return;
        overlayPrevia.remove();
        overlayPrevia = null;
        liberarRolagemSePossivel();
    }
    function abrirPreviaCatalogo(id) {
        var _a;
        var jutsu = obterJutsuPorId(id);
        if (!jutsu)
            return;
        fecharPreviaCatalogo();
        travarRolagem();
        var elemento = ELEMENTOS[elementoDoJutsu(jutsu)];
        var jaPossui = idsPresentesNaFicha().has(id);
        overlayPrevia = document.createElement("div");
        overlayPrevia.className =
            "catalogoPreviaOverlay modalShinobiOverlay";
        overlayPrevia.innerHTML = "\n      <section\n        class=\"catalogoPrevia ".concat(elemento.classe, "\"\n        role=\"dialog\"\n        aria-modal=\"true\"\n        aria-labelledby=\"catalogoPreviaTitulo\"\n      >\n        <header class=\"catalogoPreviaCabecalho\">\n          <div>\n            <span class=\"catalogoPreviaElemento\">\n              ").concat(elemento.icone, " ").concat(escaparHtml(elemento.nome), "\n            </span>\n\n            <h3 id=\"catalogoPreviaTitulo\">\n              ").concat(escaparHtml(jutsu.nome), "\n            </h3>\n\n            <p>\n              Rank ").concat(escaparHtml(jutsu.rank || "—"), "\n              \u2022 ").concat(escaparHtml(textoOuTraco(jutsu.custo)), " CH\n              \u2022 P\u00E1gina ").concat(escaparHtml(((_a = jutsu.fonte) === null || _a === void 0 ? void 0 : _a.pagina) || "—"), "\n            </p>\n          </div>\n\n          <button\n            type=\"button\"\n            class=\"catalogoFecharBtn\"\n            data-fechar-previa\n            aria-label=\"Fechar detalhes\"\n          >\n            \u00D7\n          </button>\n        </header>\n\n        <div class=\"catalogoPreviaResumo\">\n          <div>\n            <b>A\u00E7\u00E3o</b>\n            <span>").concat(escaparHtml(textoOuTraco(jutsu.acao)), "</span>\n          </div>\n\n          <div>\n            <b>Dura\u00E7\u00E3o</b>\n            <span>").concat(escaparHtml(textoOuTraco(jutsu.duracao)), "</span>\n          </div>\n\n          <div>\n            <b>Dano</b>\n            <span>").concat(escaparHtml(textoOuTraco(jutsu.dano)), "</span>\n          </div>\n\n          <div>\n            <b>Alcance</b>\n            <span>").concat(escaparHtml(textoOuTraco(jutsu.alcance)), "</span>\n          </div>\n\n          <div>\n            <b>\u00C1rea</b>\n            <span>").concat(escaparHtml(textoOuTraco(jutsu.raio)), "</span>\n          </div>\n\n          <div>\n            <b>Teste</b>\n            <span>").concat(escaparHtml(textoOuTraco(jutsu.resistencia)), "</span>\n          </div>\n        </div>\n\n        <div class=\"catalogoPreviaDescricao\">\n          ").concat(escaparHtml(jutsu.descricao || "Sem descrição."), "\n        </div>\n\n        <footer class=\"catalogoPreviaAcoes\">\n          <button\n            type=\"button\"\n            class=\"modalShinobiBtn cancelar\"\n            data-fechar-previa\n          >\n            Voltar\n          </button>\n\n          <button\n            type=\"button\"\n            class=\"modalShinobiBtn confirmar\"\n            data-adicionar-previa=\"").concat(escaparHtml(id), "\"\n            ").concat(jaPossui ? "disabled" : "", "\n          >\n            ").concat(jaPossui ? "Já está na ficha" : "Adicionar à ficha", "\n          </button>\n        </footer>\n      </section>\n    ");
        overlayPrevia.addEventListener("click", function (evento) {
            if (evento.target === overlayPrevia ||
                evento.target.closest("[data-fechar-previa]")) {
                fecharPreviaCatalogo();
                return;
            }
            var botaoAdicionar = evento.target.closest("[data-adicionar-previa]");
            if (botaoAdicionar && !botaoAdicionar.disabled) {
                adicionarIdsNaFicha([
                    botaoAdicionar.dataset.adicionarPrevia
                ]);
            }
        });
        document.body.appendChild(overlayPrevia);
    }
    function fecharCatalogoJutsus() {
        fecharPreviaCatalogo();
        if (!overlayCatalogo)
            return;
        overlayCatalogo.remove();
        overlayCatalogo = null;
        selecionados.clear();
        liberarRolagemSePossivel();
    }
    function instalarEventosCatalogo() {
        var busca = overlayCatalogo.querySelector("#catalogoBusca");
        var elemento = overlayCatalogo.querySelector("#catalogoFiltroElemento");
        var rank = overlayCatalogo.querySelector("#catalogoFiltroRank");
        var categoria = overlayCatalogo.querySelector("#catalogoFiltroCategoria");
        busca.addEventListener("input", function () {
            termoBusca = busca.value;
            limiteAtual = LIMITE_INICIAL;
            renderizarCatalogo();
        });
        elemento.addEventListener("change", function () {
            filtroElemento = elemento.value;
            limiteAtual = LIMITE_INICIAL;
            renderizarCatalogo();
        });
        rank.addEventListener("change", function () {
            filtroRank = rank.value;
            limiteAtual = LIMITE_INICIAL;
            renderizarCatalogo();
        });
        categoria.addEventListener("change", function () {
            filtroCategoria = categoria.value;
            limiteAtual = LIMITE_INICIAL;
            renderizarCatalogo();
        });
        overlayCatalogo.addEventListener("keydown", function (evento) {
            var acao = evento.target.closest('[data-acao-catalogo="visualizar"]');
            if (!acao ||
                (evento.key !== "Enter" && evento.key !== " ")) {
                return;
            }
            evento.preventDefault();
            abrirPreviaCatalogo(acao.dataset.catalogoId);
        });
        overlayCatalogo.addEventListener("click", function (evento) {
            if (evento.target === overlayCatalogo) {
                fecharCatalogoJutsus();
                return;
            }
            if (evento.target.closest("[data-fechar-catalogo]")) {
                fecharCatalogoJutsus();
                return;
            }
            if (evento.target.closest("#catalogoAlternarFiltros")) {
                definirFiltrosAbertos(!filtrosAbertos);
                return;
            }
            var acao = evento.target.closest("[data-acao-catalogo]");
            if (acao) {
                var id = acao.dataset.catalogoId;
                if (acao.dataset.acaoCatalogo === "selecionar") {
                    alternarSelecao(id);
                }
                if (acao.dataset.acaoCatalogo === "visualizar") {
                    abrirPreviaCatalogo(id);
                }
                return;
            }
            if (evento.target.closest("#catalogoCarregarMais")) {
                limiteAtual += PASSO_LISTAGEM;
                renderizarCatalogo();
                return;
            }
            if (evento.target.closest("#catalogoLimparFiltros")) {
                termoBusca = "";
                filtroElemento = "";
                filtroRank = "";
                filtroCategoria = "";
                limiteAtual = LIMITE_INICIAL;
                busca.value = "";
                elemento.value = "";
                rank.value = "";
                categoria.value = "";
                definirFiltrosAbertos(false);
                renderizarCatalogo();
                busca.focus();
                return;
            }
            if (evento.target.closest("#catalogoAdicionarSelecionados")) {
                adicionarIdsNaFicha(__spreadArray([], __read(selecionados), false));
            }
        });
    }
    function abrirCatalogoJutsus() {
        return __awaiter(this, void 0, void 0, function () {
            var erro_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        garantirEstilosCriticosCatalogo();
                        fecharMenuAdicionarJutsu();
                        if (overlayCatalogo)
                            return [2 /*return*/];
                        travarRolagem();
                        overlayCatalogo = document.createElement("div");
                        overlayCatalogo.className = "catalogoJutsusOverlay";
                        overlayCatalogo.innerHTML = "\n      <section\n        class=\"catalogoJutsusPainel\"\n        role=\"dialog\"\n        aria-modal=\"true\"\n        aria-labelledby=\"catalogoJutsusTitulo\"\n      >\n        <header class=\"catalogoJutsusCabecalho\">\n          <div>\n            <span class=\"catalogoJutsusSubtitulo\">\n              Biblioteca do mestre\n            </span>\n\n            <h2 id=\"catalogoJutsusTitulo\">\n              Cat\u00E1logo de Jutsus\n            </h2>\n          </div>\n\n          <button\n            type=\"button\"\n            class=\"catalogoFecharBtn\"\n            data-fechar-catalogo\n            aria-label=\"Fechar cat\u00E1logo\"\n          >\n            \u00D7\n          </button>\n        </header>\n\n        <div class=\"catalogoJutsusFerramentas\">\n          <div id=\"catalogoRankProgressao\" class=\"catalogoRankProgressao\">\n            Rank m\u00E1ximo da ficha: <strong>".concat(escaparHtml(rankMaximoPersonagem() || "—"), "</strong>\n          </div>\n          <div class=\"catalogoBuscaLinha\">\n            <label class=\"catalogoBuscaBox\">\n              <span class=\"catalogoBuscaIcone\" aria-hidden=\"true\">\u2315</span>\n\n              <input\n                id=\"catalogoBusca\"\n                type=\"search\"\n                placeholder=\"Pesquisar jutsu...\"\n                autocomplete=\"off\"\n                aria-label=\"Pesquisar jutsus\"\n              >\n            </label>\n\n            <button\n              type=\"button\"\n              id=\"catalogoAlternarFiltros\"\n              class=\"catalogoFiltrosToggle\"\n              aria-expanded=\"false\"\n              aria-controls=\"catalogoFiltrosPainel\"\n            >\n              <span class=\"catalogoFiltrosToggleIcone\" aria-hidden=\"true\">\u2637</span>\n              <span>Filtros</span>\n              <b id=\"catalogoFiltrosContador\" hidden>0</b>\n              <i aria-hidden=\"true\">\u2304</i>\n            </button>\n          </div>\n\n          <div\n            id=\"catalogoFiltrosResumo\"\n            class=\"catalogoFiltrosResumo\"\n            aria-label=\"Filtros ativos\"\n            hidden\n          ></div>\n\n          <section\n            id=\"catalogoFiltrosPainel\"\n            class=\"catalogoFiltrosPainel\"\n            aria-label=\"Op\u00E7\u00F5es de filtro\"\n            hidden\n          >\n            <div class=\"catalogoFiltrosGrid\">\n              <label>\n                <span>Elemento</span>\n                <select id=\"catalogoFiltroElemento\">\n                  <option value=\"\">Todos os elementos</option>\n                  <option value=\"katon\">Katon</option>\n                  <option value=\"raiton\">Raiton</option>\n                  <option value=\"fuuton\">Fuuton</option>\n                  <option value=\"suiton\">Suiton</option>\n                  <option value=\"doton\">Doton</option>\n                  <option value=\"yin\">Yinton</option>\n                  <option value=\"yang\">Youton</option>\n                  <option value=\"neutro\">Neutro</option>\n                </select>\n              </label>\n\n              <label>\n                <span>Rank</span>\n                <select id=\"catalogoFiltroRank\">\n                  <option value=\"\">Todos os ranks</option>\n                </select>\n              </label>\n\n              <label>\n                <span>Categoria</span>\n                <select id=\"catalogoFiltroCategoria\">\n                  <option value=\"\">Todas as categorias</option>\n                </select>\n              </label>\n            </div>\n\n            <div class=\"catalogoFiltrosPainelRodape\">\n              <span>Combine os filtros para encontrar uma t\u00E9cnica.</span>\n              <button\n                type=\"button\"\n                id=\"catalogoLimparFiltros\"\n                disabled\n              >\n                Limpar\n              </button>\n            </div>\n          </section>\n\n          <div class=\"catalogoFerramentasRodape\">\n            <span id=\"catalogoJutsusStatus\">\n              Carregando cat\u00E1logo...\n            </span>\n            <small>Toque em um card para ver os detalhes</small>\n          </div>\n        </div>\n\n        <main\n          id=\"catalogoJutsusLista\"\n          class=\"catalogoJutsusLista\"\n        >\n          <div class=\"catalogoCarregando\">\n            <span class=\"catalogoCarregandoIcone\">\uD83C\uDF65</span>\n            <strong>Preparando as cartas...</strong>\n          </div>\n        </main>\n\n        <button\n          type=\"button\"\n          id=\"catalogoCarregarMais\"\n          class=\"catalogoCarregarMais\"\n          hidden\n        >\n          Carregar mais\n        </button>\n\n        <footer class=\"catalogoJutsusRodape\">\n          <span id=\"catalogoSelecionadosContador\">\n            0 cartas selecionadas\n          </span>\n\n          <button\n            type=\"button\"\n            id=\"catalogoAdicionarSelecionados\"\n            disabled\n          >\n            Adicionar \u00E0 ficha\n          </button>\n        </footer>\n      </section>\n    ");
                        document.body.appendChild(overlayCatalogo);
                        instalarEventosCatalogo();
                        definirFiltrosAbertos(false);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, carregarCatalogo()];
                    case 2:
                        _a.sent();
                        if (!overlayCatalogo)
                            return [2 /*return*/];
                        montarOpcoesDosFiltros();
                        renderizarCatalogo();
                        requestAnimationFrame(function () {
                            var _a;
                            (_a = overlayCatalogo === null || overlayCatalogo === void 0 ? void 0 : overlayCatalogo.querySelector("#catalogoBusca")) === null || _a === void 0 ? void 0 : _a.focus();
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        erro_2 = _a.sent();
                        console.error("Falha ao carregar o catálogo de jutsus.", erro_2);
                        if (!overlayCatalogo)
                            return [2 /*return*/];
                        overlayCatalogo.querySelector("#catalogoJutsusLista").innerHTML = "\n        <div class=\"catalogoErro\">\n          <strong>N\u00E3o foi poss\u00EDvel abrir o cat\u00E1logo.</strong>\n          <span>\n            Verifique a internet na primeira abertura\n            e confirme se o arquivo\n            data/catalogo-jutsus.json foi publicado.\n          </span>\n\n          <button\n            type=\"button\"\n            data-tentar-catalogo\n          >\n            Tentar novamente\n          </button>\n        </div>\n      ";
                        overlayCatalogo
                            .querySelector("[data-tentar-catalogo]")
                            .addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        fecharCatalogoJutsus();
                                        return [4 /*yield*/, abrirCatalogoJutsus()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function fecharMenuAdicionarJutsu() {
        if (!overlayEscolha)
            return;
        overlayEscolha.remove();
        overlayEscolha = null;
        liberarRolagemSePossivel();
    }
    function abrirMenuAdicionarJutsu() {
        if (overlayEscolha)
            return;
        travarRolagem();
        overlayEscolha = document.createElement("div");
        overlayEscolha.className =
            "catalogoEscolhaOverlay modalShinobiOverlay";
        overlayEscolha.innerHTML = "\n      <section\n        class=\"catalogoEscolhaBox modalShinobiBox\"\n        role=\"dialog\"\n        aria-modal=\"true\"\n        aria-labelledby=\"catalogoEscolhaTitulo\"\n      >\n        <header class=\"catalogoEscolhaCabecalho\">\n          <div>\n            <span>Adicionar t\u00E9cnica</span>\n            <h3 id=\"catalogoEscolhaTitulo\">\n              Como deseja criar o jutsu?\n            </h3>\n          </div>\n\n          <button\n            type=\"button\"\n            class=\"catalogoFecharBtn\"\n            data-fechar-escolha\n            aria-label=\"Fechar\"\n          >\n            \u00D7\n          </button>\n        </header>\n\n        <div class=\"catalogoEscolhaOpcoes\">\n          <button\n            type=\"button\"\n            class=\"catalogoEscolhaOpcao catalogoEscolhaPrincipal\"\n            data-abrir-catalogo\n          >\n            <span class=\"catalogoEscolhaIcone\">\uD83C\uDCCF</span>\n\n            <span>\n              <strong>Escolher do cat\u00E1logo</strong>\n              <small>\n                Pesquise uma carta e preencha o card automaticamente.\n              </small>\n            </span>\n          </button>\n\n          <button\n            type=\"button\"\n            class=\"catalogoEscolhaOpcao\"\n            data-criar-manual\n          >\n            <span class=\"catalogoEscolhaIcone\">\u270D\uFE0F</span>\n\n            <span>\n              <strong>Criar manualmente</strong>\n              <small>\n                Adicione um card vazio como antes.\n              </small>\n            </span>\n          </button>\n        </div>\n      </section>\n    ";
        overlayEscolha.addEventListener("click", function (evento) {
            if (evento.target === overlayEscolha ||
                evento.target.closest("[data-fechar-escolha]")) {
                fecharMenuAdicionarJutsu();
                return;
            }
            if (evento.target.closest("[data-abrir-catalogo]")) {
                abrirCatalogoJutsus();
                return;
            }
            if (evento.target.closest("[data-criar-manual]")) {
                fecharMenuAdicionarJutsu();
                if (typeof adicionarJutsu === "function") {
                    adicionarJutsu();
                }
            }
        });
        document.body.appendChild(overlayEscolha);
    }
    document.addEventListener("keydown", function (evento) {
        if (evento.key !== "Escape")
            return;
        if (overlayPrevia) {
            fecharPreviaCatalogo();
            return;
        }
        if (overlayCatalogo) {
            fecharCatalogoJutsus();
            return;
        }
        if (overlayEscolha) {
            fecharMenuAdicionarJutsu();
        }
    });
    window.abrirMenuAdicionarJutsu =
        abrirMenuAdicionarJutsu;
    window.abrirCatalogoJutsus =
        abrirCatalogoJutsus;
    window.fecharCatalogoJutsus =
        fecharCatalogoJutsus;
})();
