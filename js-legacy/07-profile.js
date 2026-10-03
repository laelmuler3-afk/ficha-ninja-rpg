/* GERADO AUTOMATICAMENTE — fonte: js/07-profile.js — app 2.5.8.154. Não editar. */
/* Shinobi 1.3.7 — perfil, Kekkei Genkai e fundo revisados. */
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
/* ======================================================================
   Kekkei Genkai como natureza dinâmica dos jutsus
   ====================================================================== */
(function () {
    "use strict";
    if (window.__kekkeiJutsuDinamicoAtivo)
        return;
    window.__kekkeiJutsuDinamicoAtivo = true;
    var ELEMENTOS_JUTSU_FIXOS = Object.freeze([
        { valor: "katon", nome: "KATON", icone: "🔥", classe: "jutsu-katon" },
        { valor: "raiton", nome: "RAITON", icone: "⚡", classe: "jutsu-raiton" },
        { valor: "fuuton", nome: "FUUTON", icone: "🌪️", classe: "jutsu-fuuton" },
        { valor: "suiton", nome: "SUITON", icone: "💧", classe: "jutsu-suiton" },
        { valor: "doton", nome: "DOTON", icone: "🪨", classe: "jutsu-doton" },
        { valor: "yin", nome: "YINTON", icone: "🌑", classe: "jutsu-yin" },
        { valor: "yang", nome: "YOUTON", icone: "☀️", classe: "jutsu-yang" },
        { valor: "neutro", nome: "NEUTRO", icone: "✨", classe: "jutsu-neutro" }
    ]);
    var ELEMENTOS_POR_VALOR = new Map(ELEMENTOS_JUTSU_FIXOS.map(function (item) { return [item.valor, item]; }));
    function normalizarKekkeiJutsu(valor) {
        return String(valor || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }
    function criarIdKekkeiJutsu() {
        return "kg_" + Date.now().toString(36) + "_" +
            Math.random().toString(36).slice(2, 10);
    }
    /*
     * Mantém compatibilidade com Kekkei Genkai antigas e garante IDs
     * estáveis. Retorna true somente quando alguma migração foi necessária.
     */
    window.garantirKekkeiArray = function () {
        var alterou = false;
        if (!Array.isArray(estado.kekkeiGenkai)) {
            estado.kekkeiGenkai = [];
            alterou = true;
        }
        var idsUsados = new Set();
        estado.kekkeiGenkai.forEach(function (kekkei) {
            if (!kekkei || typeof kekkei !== "object")
                return;
            var id = String(kekkei.id || "").trim();
            if (!id || idsUsados.has(id)) {
                do {
                    id = criarIdKekkeiJutsu();
                } while (idsUsados.has(id));
                kekkei.id = id;
                alterou = true;
            }
            idsUsados.add(id);
        });
        return alterou;
    };
    function kekkeisDisponiveisParaJutsu() {
        window.garantirKekkeiArray();
        return estado.kekkeiGenkai
            .filter(function (kekkei) { return kekkei && String(kekkei.nome || "").trim(); })
            .map(function (kekkei) { return ({
            id: String(kekkei.id),
            nome: String(kekkei.nome).trim()
        }); });
    }
    function localizarKekkei(referencia) {
        window.garantirKekkeiArray();
        var lista = estado.kekkeiGenkai || [];
        var porId = lista.find(function (kekkei) {
            return kekkei && String(kekkei.id) === referencia;
        });
        if (porId)
            return porId;
        var nomeNormalizado = normalizarKekkeiJutsu(referencia);
        return lista.find(function (kekkei) {
            return kekkei &&
                normalizarKekkeiJutsu(kekkei.nome) === nomeNormalizado;
        });
    }
    window.dadosElementoJutsu = function (elemento) {
        var valor = String(elemento || "neutro");
        var fixo = ELEMENTOS_POR_VALOR.get(valor);
        if (fixo) {
            return {
                nome: fixo.nome,
                icone: fixo.icone,
                classe: fixo.classe
            };
        }
        if (valor.startsWith("kekkei:")) {
            var kekkei = localizarKekkei(valor.slice(7));
            return {
                nome: kekkei
                    ? String(kekkei.nome).toUpperCase()
                    : "KEKKEI GENKAI REMOVIDA",
                icone: "🧬",
                classe: "jutsu-kekkei"
            };
        }
        return {
            nome: "NEUTRO",
            icone: "✨",
            classe: "jutsu-neutro"
        };
    };
    window.escolherElementoJutsuPrompt = function (indice) {
        var jutsu = (estado.jutsus || [])[indice];
        if (!jutsu)
            return;
        var kekkeis = kekkeisDisponiveisParaJutsu();
        var linhas = ELEMENTOS_JUTSU_FIXOS.map(function (item, posicao) {
            return (posicao + 1) + " - " +
                item.nome.charAt(0) + item.nome.slice(1).toLowerCase();
        });
        kekkeis.forEach(function (kekkei, posicao) {
            linhas.push((ELEMENTOS_JUTSU_FIXOS.length + posicao + 1) +
                " - Kekkei Genkai: " + kekkei.nome);
        });
        var atual = window.dadosElementoJutsu(jutsu.elemento || "katon").nome;
        var escolha = prompt([
            "Escolha a natureza do jutsu:",
            "",
            linhas.join("\n"),
            "",
            "Atual: " + atual
        ].join("\n"), "");
        if (escolha === null)
            return;
        var texto = String(escolha).trim();
        if (!texto)
            return;
        var numero = Number(texto);
        var novoElemento = "";
        if (Number.isInteger(numero)) {
            if (numero >= 1 && numero <= ELEMENTOS_JUTSU_FIXOS.length) {
                novoElemento = ELEMENTOS_JUTSU_FIXOS[numero - 1].valor;
            }
            else {
                var indiceKekkei = numero - ELEMENTOS_JUTSU_FIXOS.length - 1;
                if (kekkeis[indiceKekkei]) {
                    novoElemento = "kekkei:" + kekkeis[indiceKekkei].id;
                }
            }
        }
        else {
            var textoNormalizado_1 = normalizarKekkeiJutsu(texto);
            var fixoDigitado = ELEMENTOS_JUTSU_FIXOS.find(function (item) {
                return normalizarKekkeiJutsu(item.valor) === textoNormalizado_1 ||
                    normalizarKekkeiJutsu(item.nome) === textoNormalizado_1;
            });
            if (fixoDigitado) {
                novoElemento = fixoDigitado.valor;
            }
            else {
                var nomeSemPrefixo = texto.replace(/^kekkei\s*genkai\s*:\s*/i, "");
                var nomeNormalizado_1 = normalizarKekkeiJutsu(nomeSemPrefixo);
                var kekkeiDigitada = kekkeis.find(function (kekkei) {
                    return normalizarKekkeiJutsu(kekkei.nome) === nomeNormalizado_1;
                });
                if (kekkeiDigitada) {
                    novoElemento = "kekkei:" + kekkeiDigitada.id;
                }
            }
        }
        if (!novoElemento) {
            alert("Opção inválida. Escolha um dos números ou digite " +
                "o nome de uma Kekkei Genkai cadastrada.");
            return;
        }
        jutsu.elemento = novoElemento;
        var contexto = { confirmada: true, origem: "jutsus", campo: "jutsus", motivo: "alteracao-confirmada" };
        if (typeof persistirSemRender === "function") {
            persistirSemRender(contexto);
        }
        else if (typeof persistirEstadoLocal === "function") {
            persistirEstadoLocal(contexto);
        }
        if (typeof renderizarJutsus === "function") {
            renderizarJutsus();
        }
    };
    /* Persiste uma única vez os IDs criados para fichas antigas. */
    if (window.garantirKekkeiArray() &&
        typeof persistirEstadoLocal === "function") {
        persistirEstadoLocal();
    }
})();
/* ======================================================================
   Atualização imediata da barra de XP
   ====================================================================== */
(function () {
    "use strict";
    var quadroXp = 0;
    function atualizarXpNoProximoQuadro() {
        if (quadroXp)
            return;
        quadroXp = requestAnimationFrame(function () {
            quadroXp = 0;
            if (typeof atualizarPerfil === "function") {
                atualizarPerfil();
            }
            else if (typeof atualizarHUD === "function") {
                atualizarHUD();
            }
        });
    }
    function ligarAtualizacaoXp() {
        var campo = document.getElementById("xpPerfilInput");
        if (!campo || campo.dataset.xpBarListener === "1")
            return;
        campo.dataset.xpBarListener = "1";
        campo.addEventListener("input", atualizarXpNoProximoQuadro);
        atualizarXpNoProximoQuadro();
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", ligarAtualizacaoXp, { once: true });
    }
    else {
        ligarAtualizacaoXp();
    }
})();
/* ======================================================================
   Menu do avatar e enquadramento do fundo do perfil
   ====================================================================== */
(function () {
    "use strict";
    var _a, _b;
    var AJUSTE_PADRAO = Object.freeze({
        modo: "cover",
        x: 50,
        y: 50,
        zoom: 100
    });
    var imagemFundoAtual = "";
    var dimensoesFundo = {
        imagem: "",
        largura: 0,
        altura: 0,
        estado: "vazio"
    };
    var tokenMedicao = 0;
    var ajusteTemporario = null;
    var previewFundo = null;
    var overlayAtual = null;
    var menuPaiOriginal = null;
    var menuProximoOriginal = null;
    var quadroMenu = 0;
    var quadroEnquadramento = 0;
    var menuObservado = null;
    function numeroLimitado(valor, minimo, maximo, padrao) {
        var numero = Number(valor);
        return Number.isFinite(numero)
            ? Math.min(maximo, Math.max(minimo, numero))
            : padrao;
    }
    function campoPersistido(id) {
        return document.getElementById(id);
    }
    function obterFundo() {
        return document.getElementById("perfilFundoImagem");
    }
    function obterMenuAvatar() {
        return document.getElementById("avatarMenu");
    }
    function obterAjusteFundo() {
        var _a, _b, _c, _d;
        var modo = (_a = campoPersistido("perfilFundoModo")) === null || _a === void 0 ? void 0 : _a.value;
        return {
            modo: modo === "contain" ? "contain" : "cover",
            x: numeroLimitado((_b = campoPersistido("perfilFundoPosX")) === null || _b === void 0 ? void 0 : _b.value, 0, 100, AJUSTE_PADRAO.x),
            y: numeroLimitado((_c = campoPersistido("perfilFundoPosY")) === null || _c === void 0 ? void 0 : _c.value, 0, 100, AJUSTE_PADRAO.y),
            zoom: numeroLimitado((_d = campoPersistido("perfilFundoZoom")) === null || _d === void 0 ? void 0 : _d.value, 70, 200, AJUSTE_PADRAO.zoom)
        };
    }
    function gravarAjusteFundo(ajuste) {
        var valores = {
            perfilFundoModo: ajuste.modo === "contain" ? "contain" : "cover",
            perfilFundoPosX: String(numeroLimitado(ajuste.x, 0, 100, 50)),
            perfilFundoPosY: String(numeroLimitado(ajuste.y, 0, 100, 50)),
            perfilFundoZoom: String(numeroLimitado(ajuste.zoom, 70, 200, 100))
        };
        Object.entries(valores).forEach(function (_a) {
            var _b = __read(_a, 2), id = _b[0], valor = _b[1];
            var campo = campoPersistido(id);
            if (campo)
                campo.value = valor;
            if (typeof estado !== "undefined") {
                estado[id] = valor;
            }
        });
        /* Uma única gravação substitui oito eventos input/change. */
        if (typeof persistirEstadoLocal === "function") {
            persistirEstadoLocal();
        }
    }
    function ajusteAtivo() {
        return ajusteTemporario || obterAjusteFundo();
    }
    function extrairUrlFundo(valor) {
        var texto = String(valor || "").trim();
        if (!texto || texto === "none")
            return "";
        var inicio = texto.indexOf("url(");
        var fim = texto.lastIndexOf(")");
        if (inicio < 0 || fim <= inicio)
            return "";
        var url = texto.slice(inicio + 4, fim).trim();
        if ((url.startsWith('"') && url.endsWith('"')) ||
            (url.startsWith("'") && url.endsWith("'"))) {
            url = url.slice(1, -1);
        }
        return url.replace(/\\(["'\\])/g, "$1");
    }
    function invalidarDimensoes(imagem) {
        tokenMedicao += 1;
        dimensoesFundo = {
            imagem: imagem || "",
            largura: 0,
            altura: 0,
            estado: imagem ? "pendente" : "vazio"
        };
    }
    function medirImagemFundo(imagem) {
        if (!imagem)
            return;
        if (dimensoesFundo.imagem === imagem &&
            ["carregando", "pronto", "erro"].includes(dimensoesFundo.estado)) {
            return;
        }
        invalidarDimensoes(imagem);
        dimensoesFundo.estado = "carregando";
        var tokenAtual = tokenMedicao;
        var medidor = new Image();
        medidor.decoding = "async";
        medidor.onload = function () {
            if (tokenAtual !== tokenMedicao ||
                imagemFundoAtual !== imagem) {
                return;
            }
            dimensoesFundo = {
                imagem: imagem,
                largura: Number(medidor.naturalWidth || medidor.width || 0),
                altura: Number(medidor.naturalHeight || medidor.height || 0),
                estado: "pronto"
            };
            aplicarEnquadramentoFundo();
        };
        medidor.onerror = function () {
            if (tokenAtual !== tokenMedicao)
                return;
            dimensoesFundo = {
                imagem: imagem,
                largura: 0,
                altura: 0,
                estado: "erro"
            };
            aplicarEnquadramentoFundo();
        };
        medidor.src = imagem;
    }
    function sincronizarImagemFundoAtual() {
        var fundo = obterFundo();
        if (!fundo)
            return "";
        if (!imagemFundoAtual) {
            imagemFundoAtual =
                extrairUrlFundo(fundo.style.backgroundImage) ||
                    extrairUrlFundo(getComputedStyle(fundo).backgroundImage);
            if (imagemFundoAtual) {
                invalidarDimensoes(imagemFundoAtual);
            }
        }
        if (imagemFundoAtual) {
            medirImagemFundo(imagemFundoAtual);
        }
        return imagemFundoAtual;
    }
    function aplicarEnquadramentoNoElemento(alvo, ajuste, imagem, dimensoes) {
        if (!alvo || !imagem)
            return;
        var fundo = obterFundo();
        if (alvo !== fundo) {
            alvo.style.setProperty("background-image", 'url("' + imagem.replace(/"/g, "%22") + '")', "important");
        }
        alvo.style.setProperty("background-position", ajuste.x + "% " + ajuste.y + "%", "important");
        alvo.style.setProperty("background-repeat", "no-repeat", "important");
        var larguraImagem = dimensoes.largura;
        var alturaImagem = dimensoes.altura;
        var larguraAlvo = alvo.clientWidth;
        var alturaAlvo = alvo.clientHeight;
        if (larguraImagem > 0 &&
            alturaImagem > 0 &&
            larguraAlvo > 0 &&
            alturaAlvo > 0) {
            var escalaBase = ajuste.modo === "contain"
                ? Math.min(larguraAlvo / larguraImagem, alturaAlvo / alturaImagem)
                : Math.max(larguraAlvo / larguraImagem, alturaAlvo / alturaImagem);
            var escala = escalaBase * (ajuste.zoom / 100);
            alvo.style.setProperty("background-size", Math.max(1, larguraImagem * escala) + "px " +
                Math.max(1, alturaImagem * escala) + "px", "important");
        }
        else {
            alvo.style.setProperty("background-size", ajuste.modo, "important");
        }
    }
    function aplicarEnquadramentoFundo() {
        var fundo = obterFundo();
        if (!fundo)
            return;
        var imagem = sincronizarImagemFundoAtual();
        if (!imagem)
            return;
        var ajuste = ajusteAtivo();
        aplicarEnquadramentoNoElemento(fundo, ajuste, imagem, dimensoesFundo);
        if (previewFundo) {
            aplicarEnquadramentoNoElemento(previewFundo, ajuste, imagem, dimensoesFundo);
        }
    }
    function agendarEnquadramentoFundo() {
        if (quadroEnquadramento)
            return;
        quadroEnquadramento = requestAnimationFrame(function () {
            quadroEnquadramento = 0;
            aplicarEnquadramentoFundo();
        });
    }
    window.aplicarFundoPerfil = function (imagem) {
        var fundo = obterFundo();
        var novaImagem = imagem || "";
        if (novaImagem !== imagemFundoAtual) {
            imagemFundoAtual = novaImagem;
            invalidarDimensoes(novaImagem);
        }
        if (!fundo)
            return;
        if (!novaImagem) {
            fundo.style.setProperty("background-image", "none", "important");
            fundo.style.removeProperty("background-size");
            fundo.style.removeProperty("background-position");
            fundo.style.removeProperty("background-repeat");
            fundo.classList.remove("ativo");
            return;
        }
        fundo.style.setProperty("background-image", 'url("' + novaImagem.replace(/"/g, "%22") + '")', "important");
        fundo.classList.add("ativo");
        medirImagemFundo(novaImagem);
        aplicarEnquadramentoFundo();
    };
    function guardarLocalMenu(menu) {
        if (menuPaiOriginal || !menu)
            return;
        menuPaiOriginal = menu.parentNode;
        menuProximoOriginal = menu.nextSibling;
    }
    function levarMenuParaBody(menu) {
        guardarLocalMenu(menu);
        if (menu.parentNode !== document.body) {
            document.body.appendChild(menu);
        }
    }
    function restaurarLocalMenu(menu) {
        if (!menuPaiOriginal ||
            !menu ||
            menu.parentNode === menuPaiOriginal) {
            return;
        }
        if (menuProximoOriginal &&
            menuProximoOriginal.parentNode === menuPaiOriginal) {
            menuPaiOriginal.insertBefore(menu, menuProximoOriginal);
        }
        else {
            menuPaiOriginal.appendChild(menu);
        }
    }
    function limparPosicaoMenuAvatar() {
        var menu = obterMenuAvatar();
        if (!menu)
            return;
        [
            "display",
            "visibility",
            "position",
            "left",
            "top",
            "right",
            "bottom",
            "width",
            "transform"
        ].forEach(function (propriedade) {
            menu.style.removeProperty(propriedade);
        });
        restaurarLocalMenu(menu);
    }
    function fecharMenuAvatar() {
        var menu = obterMenuAvatar();
        if (!menu)
            return;
        menu.classList.remove("aberto");
        limparPosicaoMenuAvatar();
    }
    /*
     * O módulo de imagens chama esta função ao remover o fundo.
     * Ela precisa existir também no escopo global.
     */
    window.fecharMenuAvatar = fecharMenuAvatar;
    function posicionarMenuAvatarAgora() {
        var menu = obterMenuAvatar();
        var avatar = document.querySelector("#identidade .avatarNovo");
        if (!menu ||
            !avatar ||
            !menu.classList.contains("aberto")) {
            return;
        }
        levarMenuParaBody(menu);
        menu.style.setProperty("position", "fixed", "important");
        menu.style.setProperty("visibility", "hidden", "important");
        menu.style.setProperty("display", "grid", "important");
        menu.style.setProperty("left", "10px", "important");
        menu.style.setProperty("top", "10px", "important");
        menu.style.setProperty("transform", "none", "important");
        var avatarRect = avatar.getBoundingClientRect();
        var visual = window.visualViewport;
        var origemX = visual ? visual.offsetLeft : 0;
        var origemY = visual ? visual.offsetTop : 0;
        var larguraTela = visual ? visual.width : window.innerWidth;
        var alturaTela = visual ? visual.height : window.innerHeight;
        var margem = 12;
        var larguraMenu = Math.min(menu.offsetWidth || 214, Math.max(120, larguraTela - margem * 2));
        var alturaMenu = Math.min(menu.offsetHeight || 210, Math.max(80, alturaTela - margem * 2));
        var direita = origemX + larguraTela - margem;
        var inferior = origemY + alturaTela - margem;
        var esquerda;
        var topo;
        if (larguraTela <= 520) {
            esquerda = origemX + (larguraTela - larguraMenu) / 2;
            topo = avatarRect.bottom + 10;
            if (topo + alturaMenu > inferior) {
                topo = avatarRect.top - alturaMenu - 10;
            }
        }
        else if (avatarRect.right + 12 + larguraMenu <= direita) {
            esquerda = avatarRect.right + 12;
            topo = avatarRect.top;
        }
        else if (avatarRect.left - larguraMenu - 12 >= origemX + margem) {
            esquerda = avatarRect.left - larguraMenu - 12;
            topo = avatarRect.top;
        }
        else {
            esquerda =
                avatarRect.left + (avatarRect.width - larguraMenu) / 2;
            topo = avatarRect.bottom + 10;
        }
        esquerda = Math.max(origemX + margem, Math.min(esquerda, direita - larguraMenu));
        topo = Math.max(origemY + margem, Math.min(topo, inferior - alturaMenu));
        menu.style.setProperty("width", larguraMenu + "px", "important");
        menu.style.setProperty("left", esquerda + "px", "important");
        menu.style.setProperty("top", topo + "px", "important");
        menu.style.setProperty("visibility", "visible", "important");
    }
    function agendarPosicaoMenuAvatar() {
        if (quadroMenu)
            return;
        quadroMenu = requestAnimationFrame(function () {
            quadroMenu = 0;
            posicionarMenuAvatarAgora();
        });
    }
    window.toggleAvatarMenu = function () {
        var menu = obterMenuAvatar();
        if (!menu)
            return;
        if (menu.classList.contains("aberto")) {
            fecharMenuAvatar();
            return;
        }
        menu.classList.add("aberto");
        agendarPosicaoMenuAvatar();
    };
    function fecharAjusteFundo(restaurar) {
        if (restaurar) {
            ajusteTemporario = null;
            aplicarEnquadramentoFundo();
        }
        previewFundo = null;
        document.body.classList.remove("ajustandoFundoPerfil");
        if (overlayAtual) {
            overlayAtual.remove();
            overlayAtual = null;
        }
    }
    window.abrirAjusteFundoPerfil = function () {
        var fundo = obterFundo();
        var imagem = sincronizarImagemFundoAtual();
        var temImagem = Boolean(imagem ||
            (fundo && getComputedStyle(fundo).backgroundImage !== "none"));
        fecharMenuAvatar();
        if (!temImagem) {
            if (typeof window.avisar === "function") {
                window.avisar("Nenhum fundo definido", "Adicione uma imagem de fundo antes de ajustar o enquadramento.");
            }
            else {
                alert("Adicione uma imagem de fundo antes de ajustar o enquadramento.");
            }
            return;
        }
        if (overlayAtual) {
            fecharAjusteFundo(true);
        }
        ajusteTemporario = __assign({}, obterAjusteFundo());
        var overlay = document.createElement("div");
        overlay.className = "ajusteFundoOverlay";
        overlay.innerHTML = "\n      <div class=\"ajusteFundoPainel\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Ajustar imagem de fundo\">\n        <div class=\"ajusteFundoCabecalho\">\n          <h3>Ajustar fundo</h3>\n          <button type=\"button\" class=\"ajusteFundoFechar\" data-acao=\"cancelar\" aria-label=\"Fechar\">\u00D7</button>\n        </div>\n        <div class=\"ajusteFundoPreview\" aria-label=\"Pr\u00E9via do enquadramento\">\n          <div class=\"ajusteFundoPreviewImagem\"></div>\n          <div class=\"ajusteFundoPreviewGrade\"></div>\n          <span class=\"ajusteFundoPreviewDica\">Arraste para reposicionar</span>\n        </div>\n        <label>Exibi\u00E7\u00E3o\n          <select data-ajuste=\"modo\">\n            <option value=\"cover\">Preencher a \u00E1rea</option>\n            <option value=\"contain\">Mostrar imagem inteira</option>\n          </select>\n        </label>\n        <label>Horizontal\n          <input data-ajuste=\"x\" type=\"range\" min=\"0\" max=\"100\" step=\"1\">\n          <span class=\"ajusteFundoValor\" data-valor=\"x\"></span>\n        </label>\n        <label>Vertical\n          <input data-ajuste=\"y\" type=\"range\" min=\"0\" max=\"100\" step=\"1\">\n          <span class=\"ajusteFundoValor\" data-valor=\"y\"></span>\n        </label>\n        <label>Zoom\n          <input data-ajuste=\"zoom\" type=\"range\" min=\"70\" max=\"200\" step=\"1\">\n          <span class=\"ajusteFundoValor\" data-valor=\"zoom\"></span>\n        </label>\n        <div class=\"ajusteFundoAcoes\">\n          <button type=\"button\" data-acao=\"resetar\">Centralizar</button>\n          <button type=\"button\" data-acao=\"cancelar\">Cancelar</button>\n          <button type=\"button\" class=\"aplicar\" data-acao=\"aplicar\">Aplicar</button>\n        </div>\n      </div>";
        document.body.appendChild(overlay);
        document.body.classList.add("ajustandoFundoPerfil");
        overlayAtual = overlay;
        previewFundo = overlay.querySelector(".ajusteFundoPreviewImagem");
        function atualizarCampo(campo) {
            var controle = overlay.querySelector('[data-ajuste="' + campo + '"]');
            if (controle)
                controle.value = ajusteTemporario[campo];
            if (campo !== "modo") {
                var valor = overlay.querySelector('[data-valor="' + campo + '"]');
                if (valor) {
                    valor.textContent = ajusteTemporario[campo] + "%";
                }
            }
        }
        function atualizarCampos() {
            ["modo", "x", "y", "zoom"].forEach(atualizarCampo);
        }
        overlay.addEventListener("input", function (evento) {
            var _a, _b;
            var campo = ((_b = (_a = evento.target) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.ajuste) || "";
            if (!campo)
                return;
            ajusteTemporario[campo] = campo === "modo"
                ? evento.target.value
                : Number(evento.target.value);
            atualizarCampo(campo);
            agendarEnquadramentoFundo();
        });
        overlay.addEventListener("click", function (evento) {
            var _a, _b;
            if (evento.target === overlay) {
                fecharAjusteFundo(true);
                return;
            }
            var acao = ((_b = (_a = evento.target) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.acao) || "";
            if (acao === "resetar") {
                ajusteTemporario = __assign({}, AJUSTE_PADRAO);
                atualizarCampos();
                aplicarEnquadramentoFundo();
            }
            else if (acao === "cancelar") {
                fecharAjusteFundo(true);
            }
            else if (acao === "aplicar") {
                gravarAjusteFundo(ajusteTemporario);
                ajusteTemporario = null;
                aplicarEnquadramentoFundo();
                fecharAjusteFundo(false);
            }
        });
        var areaPreview = overlay.querySelector(".ajusteFundoPreview");
        var arrastePreview = null;
        areaPreview.addEventListener("pointerdown", function (evento) {
            var _a;
            arrastePreview = {
                id: evento.pointerId,
                inicioX: evento.clientX,
                inicioY: evento.clientY,
                x: ajusteTemporario.x,
                y: ajusteTemporario.y
            };
            areaPreview.classList.add("arrastando");
            (_a = areaPreview.setPointerCapture) === null || _a === void 0 ? void 0 : _a.call(areaPreview, evento.pointerId);
            evento.preventDefault();
        });
        areaPreview.addEventListener("pointermove", function (evento) {
            if (!arrastePreview ||
                evento.pointerId !== arrastePreview.id) {
                return;
            }
            var retangulo = areaPreview.getBoundingClientRect();
            ajusteTemporario.x = numeroLimitado(arrastePreview.x -
                ((evento.clientX - arrastePreview.inicioX) /
                    Math.max(1, retangulo.width)) * 100, 0, 100, 50);
            ajusteTemporario.y = numeroLimitado(arrastePreview.y -
                ((evento.clientY - arrastePreview.inicioY) /
                    Math.max(1, retangulo.height)) * 100, 0, 100, 50);
            atualizarCampo("x");
            atualizarCampo("y");
            agendarEnquadramentoFundo();
            evento.preventDefault();
        });
        function finalizarArraste(evento) {
            var _a;
            if (!arrastePreview ||
                (evento.pointerId !== undefined &&
                    evento.pointerId !== arrastePreview.id)) {
                return;
            }
            (_a = areaPreview.releasePointerCapture) === null || _a === void 0 ? void 0 : _a.call(areaPreview, arrastePreview.id);
            arrastePreview = null;
            areaPreview.classList.remove("arrastando");
        }
        areaPreview.addEventListener("pointerup", finalizarArraste);
        areaPreview.addEventListener("pointercancel", finalizarArraste);
        areaPreview.addEventListener("lostpointercapture", finalizarArraste);
        atualizarCampos();
        aplicarEnquadramentoFundo();
    };
    var carregarFundoAnterior = window.carregarFundoPerfil;
    if (typeof carregarFundoAnterior === "function") {
        window.carregarFundoPerfil = function (evento) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ajusteTemporario = null;
                            gravarAjusteFundo(AJUSTE_PADRAO);
                            return [4 /*yield*/, carregarFundoAnterior(evento)];
                        case 1:
                            _a.sent();
                            aplicarEnquadramentoFundo();
                            return [2 /*return*/];
                    }
                });
            });
        };
    }
    function observarMenuAvatar() {
        var menu = obterMenuAvatar();
        if (!menu || menuObservado === menu)
            return;
        menuObservado = menu;
        guardarLocalMenu(menu);
        menu.addEventListener("click", function (evento) {
            evento.stopPropagation();
        });
        new MutationObserver(function () {
            if (!menu.classList.contains("aberto")) {
                limparPosicaoMenuAvatar();
            }
        }).observe(menu, {
            attributes: true,
            attributeFilter: ["class"]
        });
    }
    function iniciarFundoJaCarregado() {
        observarMenuAvatar();
        if (sincronizarImagemFundoAtual()) {
            aplicarEnquadramentoFundo();
        }
    }
    window.addEventListener("resize", function () {
        agendarPosicaoMenuAvatar();
        agendarEnquadramentoFundo();
    }, { passive: true });
    window.addEventListener("scroll", agendarPosicaoMenuAvatar, { passive: true });
    (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.addEventListener("resize", function () {
        agendarPosicaoMenuAvatar();
        agendarEnquadramentoFundo();
    }, { passive: true });
    (_b = window.visualViewport) === null || _b === void 0 ? void 0 : _b.addEventListener("scroll", agendarPosicaoMenuAvatar, { passive: true });
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { return requestAnimationFrame(iniciarFundoJaCarregado); }, { once: true });
    }
    else {
        requestAnimationFrame(iniciarFundoJaCarregado);
    }
    window.addEventListener("pageshow", function () {
        requestAnimationFrame(iniciarFundoJaCarregado);
    });
})();
