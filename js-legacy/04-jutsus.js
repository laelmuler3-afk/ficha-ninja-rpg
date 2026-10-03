/* GERADO AUTOMATICAMENTE — fonte: js/04-jutsus.js — app 2.5.8.154. Não editar. */
/* Shinobi 1.3.0 — arquivo modular gerado preservando a ordem do app original. */
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
/* Shinobi 1.3.4 — jutsus revisados e sem sistemas antigos duplicados. */
/* ===== JUTSUS ITEM-LEVEL ===== */
(function () {
    "use strict";
    if (window.__ekoJutsusItemLevelV1)
        return;
    window.__ekoJutsusItemLevelV1 = true;
    var baseline = {};
    var baselineChave = "";
    function texto(valor) { return String(valor == null ? "" : valor).trim(); }
    function clonar(valor) {
        if (valor == null)
            return valor;
        try {
            return structuredClone(valor);
        }
        catch (_erro) {
            return JSON.parse(JSON.stringify(valor));
        }
    }
    function slug(valor) {
        return texto(valor)
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "").slice(0, 72) || "jutsu";
    }
    function hashDeterministico(valor) {
        var entrada = String(valor || "");
        var hash = 2166136261;
        for (var i = 0; i < entrada.length; i++) {
            hash ^= entrada.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
    }
    function novoId() {
        var _a;
        try {
            if ((_a = window.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID)
                return "jutsu_".concat(window.crypto.randomUUID().replace(/-/g, ""));
        }
        catch (_erro) { }
        return "jutsu_".concat(Date.now().toString(36), "_").concat(Math.random().toString(36).slice(2, 12));
    }
    function idCatalogo(jutsu) {
        var id = texto(jutsu === null || jutsu === void 0 ? void 0 : jutsu.catalogoId);
        return id ? "jutsu_catalogo_".concat(slug(id)) : "";
    }
    function idLegado(jutsu) {
        var doCatalogo = idCatalogo(jutsu);
        if (doCatalogo)
            return doCatalogo;
        var idExistente = texto((jutsu === null || jutsu === void 0 ? void 0 : jutsu.id) || (jutsu === null || jutsu === void 0 ? void 0 : jutsu.uuid));
        if (idExistente)
            return "jutsu_legado_id_".concat(slug(idExistente)).slice(0, 170);
        /* Para fichas anteriores ao item-level, usamos uma impressão baseada nos
           campos mais estáveis. Assim, o mesmo jutsu existente em dois aparelhos
           tende a receber o mesmo ID mesmo que dano/descrição tenham sido editados. */
        var assinatura = [
            texto(jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome), texto(jutsu === null || jutsu === void 0 ? void 0 : jutsu.rank), texto(jutsu === null || jutsu === void 0 ? void 0 : jutsu.elemento),
            texto(jutsu === null || jutsu === void 0 ? void 0 : jutsu.categoria), texto(jutsu === null || jutsu === void 0 ? void 0 : jutsu.tipoNome)
        ].join("\u241f");
        return "jutsu_legado_".concat(slug((jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome) || "jutsu"), "_").concat(hashDeterministico(assinatura)).slice(0, 170);
    }
    function garantirIds(itens, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? false : _c;
        if (!Array.isArray(itens))
            return false;
        var identidade = window.ShinobiItemIdentity;
        var alterou = false;
        if (identidade === null || identidade === void 0 ? void 0 : identidade.garantirIds) {
            alterou = identidade.garantirIds(itens, { colecao: "jutsus", campo: "jutsuId", legado: legado, gerarId: novoId });
        }
        else {
            var usados_1 = new Set();
            itens.forEach(function (jutsu) {
                if (!jutsu || typeof jutsu !== "object" || Array.isArray(jutsu))
                    return;
                var id = texto(jutsu.jutsuId) || idCatalogo(jutsu) || (legado ? idLegado(jutsu) : novoId());
                if (usados_1.has(id)) {
                    var base = id.slice(0, 160) || "jutsu_item";
                    var sufixo = 2;
                    while (usados_1.has("".concat(base, "_").concat(sufixo)))
                        sufixo += 1;
                    id = "".concat(base, "_").concat(sufixo);
                }
                if (jutsu.jutsuId !== id) {
                    jutsu.jutsuId = id;
                    alterou = true;
                }
                usados_1.add(id);
            });
        }
        itens.forEach(function (jutsu, indice) { if (jutsu && typeof jutsu === "object" && !Array.isArray(jutsu) && Number(jutsu.ordem) !== indice) {
            jutsu.ordem = indice;
            alterou = true;
        } });
        return alterou;
    }
    function paraNuvem(jutsu) {
        if (!jutsu || typeof jutsu !== "object" || Array.isArray(jutsu))
            return clonar(jutsu);
        var copia = clonar(jutsu) || {};
        delete copia.imagem;
        delete copia.imagemId;
        return copia;
    }
    function snapshot(itens) {
        var saida = {};
        (Array.isArray(itens) ? itens : []).forEach(function (jutsu) {
            var id = texto(jutsu === null || jutsu === void 0 ? void 0 : jutsu.jutsuId);
            if (id)
                saida[id] = paraNuvem(jutsu);
        });
        return saida;
    }
    function diferencas(anterior, atual) {
        if (anterior === void 0) { anterior = {}; }
        if (atual === void 0) { atual = {}; }
        var mudancas = [], identidade = window.ShinobiItemIdentity;
        Object.entries(atual || {}).forEach(function (_a) {
            var _b;
            var _c = __read(_a, 2), itemId = _c[0], item = _c[1];
            var antes = anterior === null || anterior === void 0 ? void 0 : anterior[itemId];
            if (!antes || JSON.stringify(antes) !== JSON.stringify(item)) {
                mudancas.push({ itemId: itemId, deleted: false, value: clonar(item), identityKey: ((_b = identidade === null || identidade === void 0 ? void 0 : identidade.identityKey) === null || _b === void 0 ? void 0 : _b.call(identidade, "jutsus", item)) || "" });
            }
        });
        Object.keys(anterior || {}).forEach(function (itemId) {
            var _a;
            if (!Object.prototype.hasOwnProperty.call(atual || {}, itemId)) {
                var antes = anterior === null || anterior === void 0 ? void 0 : anterior[itemId];
                mudancas.push({ itemId: itemId, deleted: true, value: undefined, identityKey: ((_a = identidade === null || identidade === void 0 ? void 0 : identidade.identityKey) === null || _a === void 0 ? void 0 : _a.call(identidade, "jutsus", antes)) || "" });
            }
        });
        return mudancas;
    }
    function fingerprintReparo(jutsu) {
        var identidade = window.ShinobiItemIdentity;
        if (identidade === null || identidade === void 0 ? void 0 : identidade.fingerprint)
            return identidade.fingerprint("jutsus", jutsu);
        var copia = clonar(jutsu) || {};
        delete copia.jutsuId;
        delete copia.imagem;
        delete copia.imagemId;
        delete copia.ordem;
        return hashDeterministico(JSON.stringify(copia));
    }
    function repararDuplicatasCatalogoExatas() {
        var itens = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.jutsus) ? estado.jutsus : [];
        if (itens.length < 2)
            return { alterou: false, removidos: [] };
        var grupos = new Map();
        itens.forEach(function (jutsu, indice) {
            var catalogoId = texto(jutsu === null || jutsu === void 0 ? void 0 : jutsu.catalogoId);
            if (!catalogoId)
                return;
            var chave = "".concat(catalogoId.toLowerCase(), "::").concat(fingerprintReparo(jutsu));
            var grupo = grupos.get(chave) || [];
            grupo.push({ jutsu: jutsu, indice: indice });
            grupos.set(chave, grupo);
        });
        var remover = new Set(), removidos = [];
        grupos.forEach(function (grupo) {
            if (grupo.length < 2)
                return;
            var ordenado = grupo.slice().sort(function (a, b) {
                var _a, _b, _c, _d;
                var imagemA = texto((_a = a.jutsu) === null || _a === void 0 ? void 0 : _a.imagemId) ? 1 : 0, imagemB = texto((_b = b.jutsu) === null || _b === void 0 ? void 0 : _b.imagemId) ? 1 : 0;
                if (imagemA !== imagemB)
                    return imagemB - imagemA;
                var ordemA = Number.isFinite(Number((_c = a.jutsu) === null || _c === void 0 ? void 0 : _c.ordem)) ? Number(a.jutsu.ordem) : a.indice;
                var ordemB = Number.isFinite(Number((_d = b.jutsu) === null || _d === void 0 ? void 0 : _d.ordem)) ? Number(b.jutsu.ordem) : b.indice;
                return ordemA - ordemB || a.indice - b.indice;
            });
            var manter = ordenado[0];
            ordenado.slice(1).forEach(function (entrada) {
                var _a, _b, _c, _d, _e, _f;
                if (!texto((_a = manter.jutsu) === null || _a === void 0 ? void 0 : _a.imagemId) && texto((_b = entrada.jutsu) === null || _b === void 0 ? void 0 : _b.imagemId)) {
                    manter.jutsu.imagemId = entrada.jutsu.imagemId;
                    manter.jutsu.imagem = entrada.jutsu.imagem || "";
                }
                else if (!texto((_c = manter.jutsu) === null || _c === void 0 ? void 0 : _c.imagem) && texto((_d = entrada.jutsu) === null || _d === void 0 ? void 0 : _d.imagem)) {
                    manter.jutsu.imagem = entrada.jutsu.imagem;
                }
                var idRemovido = texto((_e = entrada.jutsu) === null || _e === void 0 ? void 0 : _e.jutsuId);
                if (idRemovido && idRemovido !== texto((_f = manter.jutsu) === null || _f === void 0 ? void 0 : _f.jutsuId))
                    removidos.push(idRemovido);
                remover.add(entrada.indice);
            });
        });
        if (!remover.size)
            return { alterou: false, removidos: [] };
        estado.jutsus = itens.filter(function (_, indice) { return !remover.has(indice); });
        estado.jutsus.forEach(function (jutsu, indice) { if (jutsu && typeof jutsu === "object")
            jutsu.ordem = indice; });
        estado.jutsusAbertos = {};
        return { alterou: true, removidos: __spreadArray([], __read(new Set(removidos)), false) };
    }
    function aplicarReparoDuplicatasCatalogo(origem) {
        var reparo = repararDuplicatasCatalogoExatas();
        if (!reparo.alterou)
            return reparo;
        try {
            if (typeof persistirEstadoLocal === "function") {
                persistirEstadoLocal({
                    confirmada: true, campo: "jutsus", origem: origem || "reparo-jutsus",
                    motivo: "reparo-duplicatas-catalogo-v100"
                });
            }
        }
        catch (_erro) { }
        try {
            if (typeof renderizarJutsus === "function")
                renderizarJutsus();
        }
        catch (_erro) { }
        return reparo;
    }
    function chaveAtual() {
        try {
            return texto(typeof CHAVE !== "undefined" ? CHAVE : "");
        }
        catch (_erro) {
            return "";
        }
    }
    function persistirIdsSilenciosamente(origem) {
        try {
            if (typeof persistirEstadoLocal === "function") {
                persistirEstadoLocal({ emitir: false, confirmada: false, origem: origem, motivo: "ids-permanentes-jutsus" });
            }
        }
        catch (_erro) { }
    }
    function reiniciarBaseline(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? true : _c;
        estado.jutsus = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.jutsus) ? estado.jutsus : [];
        if (garantirIds(estado.jutsus, { legado: legado }))
            persistirIdsSilenciosamente("migracao-jutsus-item-level");
        baseline = snapshot(estado.jutsus);
        baselineChave = chaveAtual();
        return estado.jutsus;
    }
    function garantirBaseline() {
        var chave = chaveAtual();
        if (chave !== baselineChave)
            return reiniciarBaseline({ legado: true });
        return Array.isArray(estado === null || estado === void 0 ? void 0 : estado.jutsus) ? estado.jutsus : [];
    }
    function publicarDiferencasConfirmadas() {
        garantirBaseline();
        var itens = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.jutsus) ? estado.jutsus : [];
        if (garantirIds(itens, { legado: false }))
            persistirIdsSilenciosamente("novo-jutsu-item-level");
        var atual = snapshot(itens);
        var mudancas = diferencas(baseline, atual);
        baseline = atual;
        baselineChave = chaveAtual();
        if (typeof window.dispatchEvent !== "function")
            return mudancas;
        mudancas.forEach(function (mudanca) {
            try {
                window.dispatchEvent(new CustomEvent("shinobi:colecao-item-confirmado", { detail: {
                        sheetName: String(typeof fichaAtual !== "undefined" ? fichaAtual : "Principal"),
                        collection: "jutsus",
                        itemId: mudanca.itemId,
                        deleted: mudanca.deleted === true,
                        value: mudanca.deleted === true ? undefined : mudanca.value,
                        identityKey: mudanca.identityKey || "",
                        confirmed: true,
                        source: "jutsus",
                        reason: "alteracao-confirmada"
                    } }));
            }
            catch (_erro) { }
        });
        return mudancas;
    }
    window.ShinobiJutsusItemLevel = Object.freeze({
        garantirEstado: function () { return garantirBaseline(); },
        garantirIdsLegados: function (itens) { garantirIds(itens, { legado: true }); return itens; },
        garantirIdsNovos: function (itens) { garantirIds(itens, { legado: false }); return itens; },
        snapshot: snapshot,
        diferencas: diferencas
    });
    window.addEventListener("shinobi:ficha-persistida", function (evento) {
        var detalhe = (evento === null || evento === void 0 ? void 0 : evento.detail) || {};
        if (detalhe.confirmada !== true || texto(detalhe.campo) !== "jutsus")
            return;
        publicarDiferencasConfirmadas();
    });
    window.addEventListener("shinobi:realtime-colecao-aplicada", function (evento) {
        var _a;
        if (texto((_a = evento === null || evento === void 0 ? void 0 : evento.detail) === null || _a === void 0 ? void 0 : _a.collection) !== "jutsus")
            return;
        reiniciarBaseline({ legado: false });
        /* Repara apenas duplicatas inequívocas do catálogo: mesmo catalogoId e
           mesmo conteúdo funcional. Se houver qualquer diferença real entre as
           cartas, nenhuma delas é removida automaticamente. */
        aplicarReparoDuplicatasCatalogo("reparo-jutsus-pos-realtime");
    });
    var renderBase = window.renderizarJutsus;
    if (typeof renderBase === "function") {
        window.renderizarJutsus = function () {
            garantirBaseline();
            return renderBase.apply(this, arguments);
        };
    }
    reiniciarBaseline({ legado: true });
    aplicarReparoDuplicatasCatalogo("reparo-jutsus-inicial");
})();
/* ===== JUTSUS: ORGANIZAÇÃO POR ELEMENTO ===== */
(function () {
    if (window.__jutsuOrganizacaoV3)
        return;
    window.__jutsuOrganizacaoV3 = true;
    var ORDEM_ELEMENTOS = [
        "katon",
        "raiton",
        "fuuton",
        "suiton",
        "doton",
        "yin",
        "yang",
        "neutro"
    ];
    function salvarOrganizacaoJutsus() {
        var contexto = { confirmada: true, origem: "jutsus", campo: "jutsus", motivo: "alteracao-confirmada" };
        if (typeof persistirSemRender === "function") {
            persistirSemRender(contexto);
            return;
        }
        if (typeof persistirEstadoLocal === "function") {
            persistirEstadoLocal(contexto);
            return;
        }
        if (typeof CHAVE !== "undefined") {
            localStorage.setItem(CHAVE, JSON.stringify(estado));
        }
    }
    function elementoNormalizado(jutsu) {
        var elemento = String((jutsu === null || jutsu === void 0 ? void 0 : jutsu.elemento) || "neutro").trim().toLowerCase();
        return ORDEM_ELEMENTOS.includes(elemento)
            ? elemento
            : "neutro";
    }
    window.organizarJutsusPorElemento = function () {
        var lista = Array.isArray(estado.jutsus)
            ? estado.jutsus
            : [];
        if (lista.length < 2)
            return;
        estado.jutsus = lista
            .map(function (jutsu, indice) { return ({
            jutsu: jutsu,
            indice: indice
        }); })
            .sort(function (a, b) {
            var ordemA = ORDEM_ELEMENTOS.indexOf(elementoNormalizado(a.jutsu));
            var ordemB = ORDEM_ELEMENTOS.indexOf(elementoNormalizado(b.jutsu));
            return ordemA === ordemB
                ? a.indice - b.indice
                : ordemA - ordemB;
        })
            .map(function (item) { return item.jutsu; });
        estado.jutsusAbertos = {};
        salvarOrganizacaoJutsus();
        if (typeof renderizarJutsus === "function") {
            renderizarJutsus();
        }
    };
    function inserirBarraOrganizacao() {
        var lista = document.getElementById("listaJutsus");
        if (!lista ||
            document.getElementById("jutsuOrganizacaoBarra")) {
            return;
        }
        var barra = document.createElement("div");
        barra.id = "jutsuOrganizacaoBarra";
        barra.className = "jutsuOrganizacaoBarra";
        barra.innerHTML = "\n      <button\n        type=\"button\"\n        class=\"btn jutsuOrganizarBtn\"\n        onclick=\"organizarJutsusPorElemento()\"\n      >\n        Organizar por elemento\n      </button>\n\n      <span class=\"jutsuOrganizacaoDica\">\n        Segure uma carta e arraste para mudar a posi\u00E7\u00E3o.\n      </span>\n    ";
        lista.parentNode.insertBefore(barra, lista);
    }
    var renderizarJutsusBaseOrganizacao = window.renderizarJutsus;
    if (typeof renderizarJutsusBaseOrganizacao === "function") {
        window.renderizarJutsus = function () {
            var resultado = renderizarJutsusBaseOrganizacao.apply(this, arguments);
            inserirBarraOrganizacao();
            return resultado;
        };
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inserirBarraOrganizacao, { once: true });
    }
    else {
        inserirBarraOrganizacao();
    }
})();
/* ===== BÔNUS MÚLTIPLOS NO MESMO BOTÃO ===== */
(function () {
    if (window.__bonusMultiMoverV3)
        return;
    window.__bonusMultiMoverV3 = true;
    var ALVOS = {
        ca: { label: "CA", selector: '#campoCA,[data-save="ca"]' },
        cd: { label: "CD", selector: '[data-save="cd"]' },
        proficiencia: { label: "Prof.", selector: '#bonusProficiencia,[data-save="proficiencia"]' },
        velocidade: { label: "Vel.", selector: '[data-save="velocidade"]' },
        iniciativa: { label: "Inic.", selector: '[data-save="iniciativa"]' },
        forca: { label: "FOR", selector: '[data-save="forca"]' },
        destreza: { label: "DES", selector: '[data-save="destreza"]' },
        constituicao: { label: "CON", selector: '[data-save="constituicao"]' },
        inteligencia: { label: "INT", selector: '[data-save="inteligencia"]' },
        sabedoria: { label: "SAB", selector: '[data-save="sabedoria"]' },
        carisma: { label: "CAR", selector: '[data-save="carisma"]' }
    };
    var ORDEM = ["ca", "cd", "proficiencia", "velocidade", "iniciativa", "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];
    var num = function (v) { var n = parseInt(String(v !== null && v !== void 0 ? v : "0").replace(",", "."), 10); return Number.isFinite(n) ? n : 0; };
    var textoSeguro = function (v) { return typeof escaparHtmlShinobi === "function" ? escaparHtmlShinobi(v) : String(v !== null && v !== void 0 ? v : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
    var aplicandoBonus = false;
    var migracaoAlterouEstado = false;
    function salvarSeguro(contexto) {
        if (contexto === void 0) { contexto = {}; }
        try {
            if (typeof persistirSemRender === "function")
                persistirSemRender(contexto);
            else if (typeof persistirEstadoLocal === "function")
                persistirEstadoLocal(contexto);
            else if (typeof CHAVE !== "undefined")
                localStorage.setItem(CHAVE, JSON.stringify(estado));
        }
        catch (e) {
            console.warn("Não foi possível salvar os bônus.", e);
        }
    }
    function somasBonus(lista) {
        var somas = {};
        lista.forEach(function (b) {
            if (!b || !ALVOS[b.alvo])
                return;
            var valor = num(b.valor);
            if (valor)
                somas[b.alvo] = (somas[b.alvo] || 0) + valor;
        });
        return somas;
    }
    function normalizarListaBonus() {
        estado.bonusAtivos = Array.isArray(estado.bonusAtivos) ? estado.bonusAtivos : [];
        // Migração única do sistema antigo, sem duplicar bônus a cada abertura.
        if (!estado.bonusMigracaoV3Concluida) {
            var alvoAntigo_1 = String(estado.bonusGeralAlvo || "");
            var valorAntigo_1 = num(estado.bonusGeralValor);
            if (alvoAntigo_1 && ALVOS[alvoAntigo_1] && valorAntigo_1) {
                var jaExiste = estado.bonusAtivos.some(function (b) { return b && b.alvo === alvoAntigo_1 && num(b.valor) === valorAntigo_1; });
                if (!jaExiste)
                    estado.bonusAtivos.push({ nome: "Bônus", alvo: alvoAntigo_1, valor: valorAntigo_1 });
            }
            var bonusCAAntigo_1 = num(estado.bonusCA || 0);
            if (bonusCAAntigo_1) {
                var jaExisteCA = estado.bonusAtivos.some(function (b) { return b && b.alvo === "ca" && num(b.valor) === bonusCAAntigo_1; });
                if (!jaExisteCA)
                    estado.bonusAtivos.push({ nome: "Bônus CA", alvo: "ca", valor: bonusCAAntigo_1 });
            }
            estado.bonusGeralAlvo = "";
            estado.bonusGeralValor = "0";
            estado.bonusCA = "0";
            estado.bonusMigracaoV3Concluida = true;
            migracaoAlterouEstado = true;
        }
        // Elimina duplicatas exatas criadas pelas versões anteriores.
        var vistos = new Set();
        estado.bonusAtivos = estado.bonusAtivos.filter(function (b) {
            if (!b || !ALVOS[b.alvo] || !num(b.valor))
                return false;
            var chave = [String(b.nome || "Bônus").trim(), b.alvo, num(b.valor)].join("|");
            if (vistos.has(chave)) {
                migracaoAlterouEstado = true;
                return false;
            }
            vistos.add(chave);
            b.nome = String(b.nome || "Bônus").trim() || "Bônus";
            b.valor = num(b.valor);
            return true;
        });
        return estado.bonusAtivos;
    }
    function valorEstadoOuCampo(id) {
        var _a;
        if (estado[id] !== undefined && estado[id] !== null && estado[id] !== "")
            return num(estado[id]);
        var el = document.querySelector(((_a = ALVOS[id]) === null || _a === void 0 ? void 0 : _a.selector) || "");
        return num((el === null || el === void 0 ? void 0 : el.value) || 0);
    }
    function garantirBasesBonus() {
        var lista = normalizarListaBonus();
        var somas = somasBonus(lista);
        estado.bonusBaseValores = estado.bonusBaseValores && typeof estado.bonusBaseValores === "object" ? estado.bonusBaseValores : {};
        var VERSAO_BASE_BONUS = 4;
        var migrando = num(estado.bonusBaseVersao || 0) < VERSAO_BASE_BONUS;
        ORDEM.forEach(function (id) {
            var _a;
            if (id === "ca")
                return;
            var temBase = Object.prototype.hasOwnProperty.call(estado.bonusBaseValores, id)
                && estado.bonusBaseValores[id] !== null
                && estado.bonusBaseValores[id] !== "";
            var bonus = num(somas[id] || 0);
            var base = temBase ? num(estado.bonusBaseValores[id]) : valorEstadoOuCampo(id);
            if (migrando && bonus > 0) {
                // A versão anterior podia subtrair o bônus de um valor que já era a base.
                // Ex.: base 4 com bônus +5 virava -1 e aparecia como 4. Recupera 4.
                if (temBase && base < 0) {
                    base = base + bonus;
                }
                // Recupera o acúmulo legado observado na iniciativa: 14, 19, 24... com +5.
                if (!temBase && id === "iniciativa" && bonus === 5 && base >= 14) {
                    var resto = ((base % 5) + 5) % 5;
                    base = resto === 0 ? 5 : resto;
                }
            }
            var baseTexto = String(base);
            if (!temBase || String(estado.bonusBaseValores[id]) !== baseTexto || String((_a = estado[id]) !== null && _a !== void 0 ? _a : "") !== baseTexto) {
                estado.bonusBaseValores[id] = baseTexto;
                estado[id] = baseTexto;
                migracaoAlterouEstado = true;
            }
        });
        if (migrando) {
            estado.bonusBaseVersao = VERSAO_BASE_BONUS;
            migracaoAlterouEstado = true;
        }
        return somas;
    }
    function cardResumo() {
        var card = document.getElementById("bonusGeralCard");
        var res = document.getElementById("bonusGeralResumo");
        if (!card || !res)
            return;
        var lista = normalizarListaBonus();
        var total = lista.reduce(function (a, b) { return a + num(b.valor); }, 0);
        card.classList.toggle("ativo", lista.length > 0);
        if (!lista.length) {
            res.innerHTML = "Definir";
            return;
        }
        if (lista.length === 1) {
            var b = lista[0], v = num(b.valor), al = ALVOS[b.alvo].label;
            res.innerHTML = "".concat(al, " ").concat(v > 0 ? "+" : "").concat(v, "<small>").concat(textoSeguro(b.nome || "Bônus ativo"), "</small>");
            return;
        }
        res.innerHTML = "".concat(lista.length, " b\u00F4nus<small>").concat(total > 0 ? "+" : "").concat(total, " total</small>");
    }
    function limparDestaques() {
        document.querySelectorAll("#identidade .bonusAplicadoAoAlvo").forEach(function (el) { return el.classList.remove("bonusAplicadoAoAlvo"); });
    }
    function aplicar() {
        if (aplicandoBonus)
            return;
        aplicandoBonus = true;
        try {
            normalizarListaBonus();
            var somas_1 = garantirBasesBonus();
            var bases_1 = {};
            limparDestaques();
            // O estado mantém somente a base. A soma existe apenas na apresentação.
            ORDEM.forEach(function (id) {
                var _a;
                if (id === "ca")
                    return;
                var base = num((_a = estado.bonusBaseValores[id]) !== null && _a !== void 0 ? _a : valorEstadoOuCampo(id));
                bases_1[id] = base;
                estado[id] = String(base);
                var el = document.querySelector(ALVOS[id].selector);
                if (el)
                    el.value = String(base + num(somas_1[id] || 0));
            });
            // O bônus de CA continua no campo oculto usado pelo cálculo automático.
            var campoBonusCA = document.getElementById("bonusCA") || document.querySelector('[data-save="bonusCA"]');
            if (campoBonusCA)
                campoBonusCA.value = String(somas_1.ca || 0);
            Object.entries(somas_1).forEach(function (_a) {
                var _b, _c, _d, _e;
                var _f = __read(_a, 2), id = _f[0], valor = _f[1];
                if (!valor)
                    return;
                if (id === "ca") {
                    (_c = (_b = document.getElementById("campoCA")) === null || _b === void 0 ? void 0 : _b.closest("div")) === null || _c === void 0 ? void 0 : _c.classList.add("bonusAplicadoAoAlvo");
                    return;
                }
                var el = document.querySelector(((_d = ALVOS[id]) === null || _d === void 0 ? void 0 : _d.selector) || "");
                (_e = el === null || el === void 0 ? void 0 : el.closest("div")) === null || _e === void 0 ? void 0 : _e.classList.add("bonusAplicadoAoAlvo");
            });
            if (typeof atualizarCAAutomatica === "function")
                atualizarCAAutomatica();
            if (typeof atualizarHUD === "function")
                atualizarHUD();
            if (typeof atualizarPlacar === "function")
                atualizarPlacar();
            if (typeof atualizarModificadoresBatalha === "function")
                atualizarModificadoresBatalha();
            if (typeof atualizarDefesasTotaisBatalha === "function")
                atualizarDefesasTotaisBatalha();
            // Algumas rotinas de atualização leem o estado-base. Reafirma o total visual
            // depois delas para impedir que tablet/celular volte a mostrar apenas a base.
            ORDEM.forEach(function (id) {
                if (id === "ca")
                    return;
                var el = document.querySelector(ALVOS[id].selector);
                if (el)
                    el.value = String(num(bases_1[id]) + num(somas_1[id] || 0));
            });
            cardResumo();
            if (migracaoAlterouEstado) {
                migracaoAlterouEstado = false;
                salvarSeguro();
            }
        }
        finally {
            aplicandoBonus = false;
        }
    }
    window.atualizarBonusGeralRealtime = function () { aplicar(); };
    function norm(x) {
        x = String(x || "").trim().toLowerCase();
        return { "inic": "iniciativa", "iniciativa": "iniciativa", "prof": "proficiencia", "prof.": "proficiencia", "proficiência": "proficiencia", "proficiencia": "proficiencia", "vel": "velocidade", "velocidade": "velocidade", "ca": "ca", "cd": "cd", "for": "forca", "força": "forca", "forca": "forca", "des": "destreza", "destreza": "destreza", "con": "constituicao", "constituição": "constituicao", "constituicao": "constituicao", "int": "inteligencia", "inteligência": "inteligencia", "inteligencia": "inteligencia", "sab": "sabedoria", "sabedoria": "sabedoria", "car": "carisma", "carisma": "carisma" }[x] || x;
    }
    function textoAlvos() { return ORDEM.map(function (id) { return "".concat(id, " = ").concat(ALVOS[id].label); }).join("\n"); }
    function addBonus() {
        garantirBasesBonus();
        var nome = prompt("Nome/origem do bônus. Ex: Modo Sábio, item, jutsu:", "Bônus");
        if (nome === null)
            return;
        var alvo = prompt("Onde aplicar?\n\n" + textoAlvos() + "\n\nDigite a opção:", "iniciativa");
        if (alvo === null)
            return;
        alvo = norm(alvo);
        if (!ALVOS[alvo]) {
            alert("Opção não encontrada. Use iniciativa, CA, CD, FOR, DES, CON, INT, SAB ou CAR.");
            return;
        }
        var vt = prompt("Valor do bônus. Ex: 5 ou -2:", "1");
        if (vt === null)
            return;
        var valor = num(vt);
        if (!valor) {
            alert("Digite um valor diferente de zero.");
            return;
        }
        normalizarListaBonus().push({ nome: String(nome || "Bônus").trim() || "Bônus", alvo: alvo, valor: valor });
        salvarSeguro({ confirmada: true, origem: "bonus", campo: "bonusAtivos", motivo: "alteracao-confirmada" });
        aplicar();
    }
    function verBonus() {
        var lista = normalizarListaBonus();
        if (!lista.length) {
            alert("Nenhum bônus ativo.");
            return;
        }
        alert("Bônus ativos:\n\n" + lista.map(function (b, i) { var _a; return "".concat(i + 1, ". ").concat(b.nome || "Bônus", " \u2014 ").concat(((_a = ALVOS[b.alvo]) === null || _a === void 0 ? void 0 : _a.label) || b.alvo, " ").concat(num(b.valor) > 0 ? "+" : "").concat(num(b.valor)); }).join("\n"));
    }
    function removerBonus() {
        var lista = normalizarListaBonus();
        if (!lista.length) {
            alert("Nenhum bônus ativo para remover.");
            return;
        }
        var texto = lista.map(function (b, i) { var _a; return "".concat(i + 1, ". ").concat(b.nome || "Bônus", " \u2014 ").concat(((_a = ALVOS[b.alvo]) === null || _a === void 0 ? void 0 : _a.label) || b.alvo, " ").concat(num(b.valor) > 0 ? "+" : "").concat(num(b.valor)); }).join("\n");
        var esc = prompt("Qual bônus remover?\n\n" + texto + "\n\nDigite o número:", "1");
        if (esc === null)
            return;
        var idx = parseInt(esc, 10) - 1;
        if (idx < 0 || idx >= lista.length) {
            alert("Número inválido.");
            return;
        }
        lista.splice(idx, 1);
        salvarSeguro({ confirmada: true, origem: "bonus", campo: "bonusAtivos", motivo: "alteracao-confirmada" });
        aplicar();
    }
    window.editarBonusGeralPerfil = function () {
        var e = prompt("Bônus ativos\n\n1 = Adicionar bônus\n2 = Ver bônus ativos\n3 = Remover bônus\n4 = Limpar todos\n\nDigite uma opção:", "1");
        if (e === null)
            return;
        if (e === "1")
            addBonus();
        else if (e === "2")
            verBonus();
        else if (e === "3")
            removerBonus();
        else if (e === "4" && confirm("Remover todos os bônus ativos?")) {
            estado.bonusAtivos = [];
            estado.bonusCA = "0";
            salvarSeguro({ confirmada: true, origem: "bonus", campos: ["bonusAtivos", "bonusCA"], motivo: "alteracao-confirmada" });
            aplicar();
        }
        else if (e !== "4")
            alert("Opção inválida.");
    };
    function garantirCard() {
        var antigo = document.querySelector("#identidade .bonusCaCard");
        if (!antigo)
            return;
        antigo.id = "bonusGeralCard";
        antigo.classList.add("bonusGeralCard");
        antigo.setAttribute("onclick", "editarBonusGeralPerfil()");
        if (!document.getElementById("bonusGeralResumo")) {
            antigo.innerHTML = '<label>Bônus</label><div id="bonusGeralResumo" class="bonusGeralResumo">Definir</div><input id="bonusCA" data-save="bonusCA" type="hidden" value="0">';
        }
    }
    // Impede que o salvar geral grave o valor visual já somado como novo valor-base.
    if (typeof sincronizarEstadoDosCampos === "function" && !window.__sincronizarCamposBonusV3) {
        window.__sincronizarCamposBonusV3 = true;
        var sincronizarOriginal_1 = sincronizarEstadoDosCampos;
        window.sincronizarEstadoDosCampos = function () {
            var trocas = [];
            if (estado.bonusBaseValores && typeof estado.bonusBaseValores === "object") {
                ORDEM.forEach(function (id) {
                    if (id === "ca")
                        return;
                    var el = document.querySelector(ALVOS[id].selector);
                    if (!el || estado.bonusBaseValores[id] === undefined)
                        return;
                    trocas.push([el, el.value]);
                    el.value = String(estado.bonusBaseValores[id]);
                });
            }
            try {
                var retorno = sincronizarOriginal_1.apply(this, arguments);
                if (estado.bonusBaseValores) {
                    ORDEM.forEach(function (id) {
                        if (id !== "ca" && estado.bonusBaseValores[id] !== undefined)
                            estado[id] = String(estado.bonusBaseValores[id]);
                    });
                }
                return retorno;
            }
            finally {
                trocas.forEach(function (_a) {
                    var _b = __read(_a, 2), el = _b[0], valor = _b[1];
                    el.value = valor;
                });
            }
        };
    }
    // Ao editar manualmente um campo bonificado, considera o número digitado como total
    // visível e recalcula o valor-base uma única vez.
    var timerAplicarBonusCampo = null;
    document.addEventListener("input", function (ev) {
        if (aplicandoBonus ||
            !ev.target ||
            !ev.target.matches('input[data-save]:not(#bonusCA)')) {
            return;
        }
        var id = ev.target.dataset.save;
        if (!ALVOS[id] || id === "ca")
            return;
        var soma = num(somasBonus(normalizarListaBonus())[id] || 0);
        estado.bonusBaseValores =
            estado.bonusBaseValores &&
                typeof estado.bonusBaseValores === "object"
                ? estado.bonusBaseValores
                : {};
        estado.bonusBaseValores[id] = String(num(ev.target.value) - soma);
        estado[id] = estado.bonusBaseValores[id];
        if (timerAplicarBonusCampo) {
            clearTimeout(timerAplicarBonusCampo);
        }
        timerAplicarBonusCampo = setTimeout(function () {
            timerAplicarBonusCampo = null;
            salvarSeguro();
            aplicar();
        }, 100);
    });
    function iniciar() {
        garantirCard();
        aplicar();
    }
    var timerInicializacaoBonus = null;
    function agendarInicializacaoBonus(atraso) {
        if (atraso === void 0) { atraso = 160; }
        if (timerInicializacaoBonus) {
            clearTimeout(timerInicializacaoBonus);
        }
        timerInicializacaoBonus = setTimeout(function () {
            timerInicializacaoBonus = null;
            iniciar();
        }, atraso);
    }
    if (typeof carregar === "function" && !window.__carregarBonusV3) {
        window.__carregarBonusV3 = true;
        var carregarOriginal_1 = carregar;
        window.carregar = function () {
            var r = carregarOriginal_1.apply(this, arguments);
            agendarInicializacaoBonus();
            return r;
        };
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { return agendarInicializacaoBonus(); }, { once: true });
    }
    else {
        agendarInicializacaoBonus();
    }
    window.addEventListener("pageshow", function () { return agendarInicializacaoBonus(); });
})();
/* ===== AJUSTE MOVER JUTSU V3: toque menor e não abre ao soltar ===== */
(function () {
    if (window.__ajusteMoverJutsuV3)
        return;
    window.__ajusteMoverJutsuV3 = true;
    var timer = null;
    var ativo = false;
    var origem = null;
    var alvo = null;
    var ghost = null;
    var bloquearProximoClick = false;
    var inicioX = 0;
    var inicioY = 0;
    function salvarMove() {
        var contexto = { confirmada: true, origem: "jutsus", campo: "jutsus", motivo: "alteracao-confirmada" };
        try {
            if (typeof persistirSemRender === "function")
                persistirSemRender(contexto);
            else if (typeof salvar === "function")
                salvar(contexto);
            else if (typeof persistirEstadoLocal === "function")
                persistirEstadoLocal(contexto);
            else if (typeof CHAVE !== "undefined")
                localStorage.setItem(CHAVE, JSON.stringify(estado));
        }
        catch (e) {
            console.warn(e);
        }
    }
    function prepararMoverV3() {
        var lista = document.getElementById("listaJutsus");
        if (!lista || lista.dataset.moverTouchV3)
            return;
        lista.dataset.moverTouchV3 = "1";
        function atualizarIndices() {
            Array.from(lista.querySelectorAll(".jutsuListaCard")).forEach(function (card, i) {
                card.dataset.jutsuIndex = String(i);
            });
        }
        atualizarIndices();
        lista.addEventListener("pointerdown", function (ev) {
            var resumo = ev.target.closest(".jutsuLinhaResumo");
            var card = ev.target.closest(".jutsuListaCard");
            if (!resumo || !card)
                return;
            atualizarIndices();
            var idx = Number(card.dataset.jutsuIndex);
            if (!Number.isInteger(idx))
                return;
            inicioX = ev.clientX;
            inicioY = ev.clientY;
            clearTimeout(timer);
            timer = setTimeout(function () {
                ativo = true;
                bloquearProximoClick = true;
                origem = idx;
                alvo = idx;
                lista.classList.add("modoMoverJutsus");
                card.classList.add("jutsuPressionando");
                ghost = card.cloneNode(true);
                ghost.classList.add("jutsuGhostMover");
                ghost.style.left = ev.clientX + "px";
                ghost.style.top = ev.clientY + "px";
                document.body.appendChild(ghost);
                try {
                    card.setPointerCapture(ev.pointerId);
                }
                catch (e) { }
            }, 1200);
        }, true);
        lista.addEventListener("pointermove", function (ev) {
            var _a;
            if (!ativo) {
                if (Math.abs(ev.clientX - inicioX) > 14 || Math.abs(ev.clientY - inicioY) > 14) {
                    clearTimeout(timer);
                }
                return;
            }
            ev.preventDefault();
            if (ghost) {
                ghost.style.left = ev.clientX + "px";
                ghost.style.top = ev.clientY + "px";
            }
            var el = document.elementFromPoint(ev.clientX, ev.clientY);
            var card = (_a = el === null || el === void 0 ? void 0 : el.closest) === null || _a === void 0 ? void 0 : _a.call(el, "#listaJutsus .jutsuListaCard");
            document.querySelectorAll(".jutsuDropAlvo").forEach(function (x) { return x.classList.remove("jutsuDropAlvo"); });
            if (card) {
                alvo = Number(card.dataset.jutsuIndex);
                card.classList.add("jutsuDropAlvo");
            }
        }, { passive: false, capture: true });
        function finalizar(ev) {
            var _a;
            clearTimeout(timer);
            if (!ativo)
                return;
            if (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                (_a = ev.stopImmediatePropagation) === null || _a === void 0 ? void 0 : _a.call(ev);
            }
            lista.classList.remove("modoMoverJutsus");
            document.querySelectorAll(".jutsuPressionando,.jutsuDropAlvo").forEach(function (x) {
                x.classList.remove("jutsuPressionando", "jutsuDropAlvo");
            });
            if (ghost) {
                ghost.remove();
                ghost = null;
            }
            if (origem !== null && alvo !== null && origem !== alvo && estado.jutsus) {
                var item = estado.jutsus.splice(origem, 1)[0];
                estado.jutsus.splice(alvo, 0, item);
                estado.jutsusAbertos = {};
                salvarMove();
                if (typeof renderizarJutsus === "function")
                    renderizarJutsus();
            }
            setTimeout(function () {
                ativo = false;
                origem = null;
                alvo = null;
            }, 120);
            setTimeout(function () {
                bloquearProximoClick = false;
            }, 500);
        }
        lista.addEventListener("pointerup", finalizar, true);
        lista.addEventListener("pointercancel", finalizar, true);
        lista.addEventListener("click", function (ev) {
            var _a;
            if (bloquearProximoClick) {
                ev.preventDefault();
                ev.stopPropagation();
                (_a = ev.stopImmediatePropagation) === null || _a === void 0 ? void 0 : _a.call(ev);
                bloquearProximoClick = false;
            }
        }, true);
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", prepararMoverV3, { once: true });
    }
    else {
        prepararMoverV3();
    }
})();
