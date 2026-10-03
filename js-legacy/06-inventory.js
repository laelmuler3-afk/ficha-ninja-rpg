/* GERADO AUTOMATICAMENTE — fonte: js/06-inventory.js — app 2.5.8.154. Não editar. */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/* Ficha Ninja RPG 2.3.0 — Inventário, Carteira e Loja de Itens. */
(function () {
    "use strict";
    /* ===== Inventário item-level =====
       IDs antigos são migrados de forma determinística. Itens criados depois da
       migração recebem IDs aleatórios, para que dois aparelhos possam adicionar
       itens com o mesmo nome sem colidirem no Firebase. */
    var inventarioItemLevelBaseline = {};
    var inventarioItemLevelChave = "";
    function clonarItemInventario(valor) {
        if (valor == null)
            return valor;
        try {
            return structuredClone(valor);
        }
        catch (_erro) {
            return JSON.parse(JSON.stringify(valor));
        }
    }
    function slugIdInventario(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 64) || "item";
    }
    function novoIdInventario() {
        var _a;
        try {
            if ((_a = window.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID)
                return "inv_".concat(window.crypto.randomUUID().replace(/-/g, ""));
        }
        catch (_erro) { }
        return "inv_".concat(Date.now().toString(36), "_").concat(Math.random().toString(36).slice(2, 12));
    }
    function idLegadoInventario(item) {
        var catalogo = slugIdInventario((item === null || item === void 0 ? void 0 : item.catalogoSlug) || (item === null || item === void 0 ? void 0 : item.slug) || "");
        if (catalogo !== "item")
            return "inv_legado_catalogo_".concat(catalogo);
        var nome = slugIdInventario((item === null || item === void 0 ? void 0 : item.nome) || "item");
        var tipo = slugIdInventario((item === null || item === void 0 ? void 0 : item.tipo) || "");
        var dano = slugIdInventario((item === null || item === void 0 ? void 0 : item.dano) || "");
        var complemento = [tipo, dano].filter(function (valor) { return valor && valor !== "item"; }).join("_");
        return "inv_legado_".concat(nome).concat(complemento ? "_".concat(complemento) : "").slice(0, 150);
    }
    function garantirIdsInventario(itens, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? false : _c;
        if (!Array.isArray(itens))
            return false;
        var identidade = window.ShinobiItemIdentity;
        if (identidade === null || identidade === void 0 ? void 0 : identidade.garantirIds) {
            return identidade.garantirIds(itens, { colecao: "inventario", campo: "id", legado: legado, gerarId: novoIdInventario });
        }
        var usados = new Set();
        var alterou = false;
        itens.forEach(function (item) {
            if (!item || typeof item !== "object" || Array.isArray(item))
                return;
            var id = String(item.id || "").trim();
            if (!id)
                id = legado ? idLegadoInventario(item) : novoIdInventario();
            if (usados.has(id)) {
                var base = id.slice(0, 160) || "inv_item";
                var sufixo = 2;
                while (usados.has("".concat(base, "_").concat(sufixo)))
                    sufixo += 1;
                id = "".concat(base, "_").concat(sufixo);
            }
            if (item.id !== id) {
                item.id = id;
                alterou = true;
            }
            usados.add(id);
        });
        return alterou;
    }
    function snapshotInventarioItemLevel(itens) {
        var snapshot = {};
        (Array.isArray(itens) ? itens : []).forEach(function (item) {
            var id = String((item === null || item === void 0 ? void 0 : item.id) || "").trim();
            if (id)
                snapshot[id] = clonarItemInventario(item);
        });
        return snapshot;
    }
    function diferencasInventarioItemLevel(anterior, atual) {
        if (anterior === void 0) { anterior = {}; }
        if (atual === void 0) { atual = {}; }
        var mudancas = [], identidade = window.ShinobiItemIdentity;
        Object.entries(atual || {}).forEach(function (_a) {
            var _b;
            var _c = __read(_a, 2), itemId = _c[0], item = _c[1];
            var antes = anterior === null || anterior === void 0 ? void 0 : anterior[itemId];
            if (!antes || JSON.stringify(antes) !== JSON.stringify(item))
                mudancas.push({ itemId: itemId, deleted: false, value: clonarItemInventario(item), identityKey: ((_b = identidade === null || identidade === void 0 ? void 0 : identidade.identityKey) === null || _b === void 0 ? void 0 : _b.call(identidade, "inventario", item)) || "" });
        });
        Object.keys(anterior || {}).forEach(function (itemId) {
            var _a;
            if (!Object.prototype.hasOwnProperty.call(atual || {}, itemId)) {
                var antes = anterior === null || anterior === void 0 ? void 0 : anterior[itemId];
                mudancas.push({ itemId: itemId, deleted: true, value: undefined, identityKey: ((_a = identidade === null || identidade === void 0 ? void 0 : identidade.identityKey) === null || _a === void 0 ? void 0 : _a.call(identidade, "inventario", antes)) || "" });
            }
        });
        return mudancas;
    }
    function chaveAtualInventarioItemLevel() {
        try {
            return String(typeof CHAVE !== "undefined" ? CHAVE : "");
        }
        catch (_erro) {
            return "";
        }
    }
    function persistirIdsInventarioSilenciosamente(origem) {
        try {
            if (typeof persistirEstadoLocal === "function") {
                persistirEstadoLocal({ emitir: false, confirmada: false, origem: origem, motivo: "ids-permanentes-inventario" });
            }
        }
        catch (_erro) { }
    }
    function reiniciarBaselineInventario(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.legado, legado = _c === void 0 ? true : _c;
        try {
            if (typeof garantirInventarioItens === "function")
                garantirInventarioItens();
        }
        catch (_erro) { }
        var itens = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.inventarioItens) ? estado.inventarioItens : [];
        if (garantirIdsInventario(itens, { legado: legado }))
            persistirIdsInventarioSilenciosamente("migracao-inventario-item-level");
        inventarioItemLevelBaseline = snapshotInventarioItemLevel(itens);
        inventarioItemLevelChave = chaveAtualInventarioItemLevel();
        return itens;
    }
    function garantirBaselineInventario() {
        var chave = chaveAtualInventarioItemLevel();
        if (chave !== inventarioItemLevelChave)
            return reiniciarBaselineInventario({ legado: true });
        return Array.isArray(estado === null || estado === void 0 ? void 0 : estado.inventarioItens) ? estado.inventarioItens : [];
    }
    function publicarDiferencasInventarioConfirmadas() {
        garantirBaselineInventario();
        var itens = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.inventarioItens) ? estado.inventarioItens : [];
        if (garantirIdsInventario(itens, { legado: false }))
            persistirIdsInventarioSilenciosamente("novo-item-inventario-item-level");
        var atual = snapshotInventarioItemLevel(itens);
        var mudancas = diferencasInventarioItemLevel(inventarioItemLevelBaseline, atual);
        inventarioItemLevelBaseline = atual;
        inventarioItemLevelChave = chaveAtualInventarioItemLevel();
        if (typeof window.dispatchEvent !== "function")
            return mudancas;
        mudancas.forEach(function (mudanca) {
            try {
                window.dispatchEvent(new CustomEvent("shinobi:colecao-item-confirmado", { detail: {
                        sheetName: String(typeof fichaAtual !== "undefined" ? fichaAtual : "Principal"),
                        collection: "inventario",
                        itemId: mudanca.itemId,
                        deleted: mudanca.deleted === true,
                        value: mudanca.deleted === true ? undefined : mudanca.value,
                        identityKey: mudanca.identityKey || "",
                        confirmed: true,
                        source: "inventario",
                        reason: "alteracao-confirmada"
                    } }));
            }
            catch (_erro) { }
        });
        return mudancas;
    }
    window.ShinobiInventarioItemLevel = Object.freeze({
        garantirIds: function (itens) { garantirIdsInventario(itens, { legado: true }); return itens; },
        snapshot: snapshotInventarioItemLevel,
        diferencas: diferencasInventarioItemLevel,
        garantirEstado: function () { return garantirBaselineInventario(); }
    });
    window.addEventListener("shinobi:ficha-persistida", function (evento) {
        var detalhe = (evento === null || evento === void 0 ? void 0 : evento.detail) || {};
        if (detalhe.confirmada !== true || String(detalhe.campo || "") !== "inventarioItens")
            return;
        publicarDiferencasInventarioConfirmadas();
    });
    window.addEventListener("shinobi:realtime-colecao-aplicada", function (evento) {
        var _a;
        if (String(((_a = evento === null || evento === void 0 ? void 0 : evento.detail) === null || _a === void 0 ? void 0 : _a.collection) || "") !== "inventario")
            return;
        reiniciarBaselineInventario({ legado: false });
    });
    var ICONES_INVENTARIO = Object.freeze({
        "repelente": "assets/inventory-repelente.webp",
        "pergaminho-de-selamento": "assets/inventory-pergaminho-de-selamento.webp",
        "moeda-de-ouro": "assets/inventory-moeda-de-ouro.webp",
        "moeda-de-prata": "assets/inventory-moeda-de-prata.webp",
        "moeda-de-bronze": "assets/inventory-moeda-de-bronze.webp",
        "moeda-de-cobre": "assets/inventory-moeda-de-bronze.webp",
        "moeda-de-platina": "assets/inventory-moeda-de-platina.webp",
        // Slug legado mantido apenas para fichas antigas.
        "moeda-de-diamante": "assets/inventory-moeda-de-platina.webp",
        "kunai": "assets/inventory-kunai.webp",
        "shuriken": "assets/inventory-shuriken.webp",
        "agulhas": "assets/inventory-agulhas.webp",
        "fio-de-nilon": "assets/inventory-fio-de-nilon.webp",
        "pedra-da-familia": "assets/inventory-pedra-da-familia.webp",
        "papel-bomba": "assets/inventory-papel-bomba.webp",
        "comida": "assets/inventory-comida.webp",
        "esfera": "assets/inventory-esfera.webp",
        "foice-curta": "assets/inventory-foice-curta.webp",
        "bastao": "assets/inventory-bastao.webp",
        "zarabatana": "assets/inventory-zarabatana.webp",
        "balista": "assets/inventory-balista.webp",
        "funda": "assets/inventory-funda.webp",
        "arco-composto": "assets/inventory-arco-composto.webp",
        "arco-longo": "assets/inventory-arco-longo.webp",
        "arco-curto": "assets/inventory-arco-curto.webp",
        "shuriken-de-vento": "assets/inventory-shuriken-de-vento.webp",
        "tanto": "assets/inventory-tanto.webp",
        "dispositivo-de-disparo": "assets/inventory-dispositivo-de-disparo.webp",
        "wakizaki": "assets/inventory-wakizaki.webp",
        "nunchaku": "assets/inventory-nunchaku.webp",
        "katana": "assets/inventory-katana.webp",
        "corrente": "assets/inventory-corrente.webp",
        "chicote": "assets/inventory-chicote.webp",
        "lanca": "assets/inventory-lanca.webp",
        "pilula-de-chakra": "assets/inventory-pilula-de-chakra.webp",
        "kit-medico": "assets/inventory-kit-medico.webp"
    });
    var ALIASES_INVENTARIO = Object.freeze({
        "foice curta": "foice-curta",
        "foice": "foice-curta",
        "bastao": "bastao",
        "zarabatana": "zarabatana",
        "balista": "balista",
        "funda": "funda",
        "arco composto": "arco-composto",
        "arco longo": "arco-longo",
        "arco curto": "arco-curto",
        "shuriken de vento": "shuriken-de-vento",
        "shuriken de vento demoniaca": "shuriken-de-vento",
        "shuriken vento": "shuriken-de-vento",
        "tanto": "tanto",
        "dispositivo de disparo": "dispositivo-de-disparo",
        "dispositivo disparo": "dispositivo-de-disparo",
        "wakizaki": "wakizaki",
        "wakizashi": "wakizaki",
        "nunchaku": "nunchaku",
        "katana": "katana",
        "corrente": "corrente",
        "chicote": "chicote",
        "lanca": "lanca",
        "kit medico": "kit-medico",
        "kit de primeiros socorros": "kit-medico",
        "primeiros socorros": "kit-medico",
        "pilula de chakra": "pilula-de-chakra",
        "pilula chakra": "pilula-de-chakra",
        "esferas de metal": "esfera",
        "esfera": "esfera",
        "alimento": "comida",
        "comida": "comida",
        "papeis bomba": "papel-bomba",
        "papel bomba": "papel-bomba",
        "bomba": "papel-bomba",
        "pedra da familia": "pedra-da-familia",
        "pedra de familia": "pedra-da-familia",
        "fio de nylon": "fio-de-nilon",
        "fio de nilon": "fio-de-nilon",
        "nylon": "fio-de-nilon",
        "nilon": "fio-de-nilon",
        "agulhas": "agulhas",
        "agulha": "agulhas",
        "senbon": "agulhas",
        "shuriken": "shuriken",
        "kunai": "kunai",
        "moeda de platina": "moeda-de-platina",
        "platina": "moeda-de-platina",
        "pl": "moeda-de-platina",
        // Compatibilidade com fichas antigas que ainda salvam a nomenclatura anterior.
        "moeda de diamante": "moeda-de-platina",
        "diamante": "moeda-de-platina",
        "moeda de ouro": "moeda-de-ouro",
        "ouro": "moeda-de-ouro",
        "moeda de prata": "moeda-de-prata",
        "prata": "moeda-de-prata",
        "moeda de cobre": "moeda-de-cobre",
        "cobre": "moeda-de-cobre",
        "moeda de bronze": "moeda-de-bronze",
        "bronze": "moeda-de-bronze",
        "repelente": "repelente",
        "pergaminho de selamento": "pergaminho-de-selamento",
        "pergaminho selamento": "pergaminho-de-selamento",
        "selamento": "pergaminho-de-selamento"
    });
    var MOEDAS = Object.freeze([
        // A chave interna "pd" e o slug legado são mantidos para não quebrar fichas já salvas.
        { chave: "pd", sigla: "PL", nome: "Platina", fator: 1000000, slug: "moeda-de-platina" },
        { chave: "po", sigla: "PO", nome: "Ouro", fator: 10000, slug: "moeda-de-ouro" },
        { chave: "pp", sigla: "PP", nome: "Prata", fator: 100, slug: "moeda-de-prata" },
        { chave: "pc", sigla: "PC", nome: "Cobre", fator: 1, slug: "moeda-de-cobre" }
    ]);
    var FATOR_MOEDA = Object.freeze(MOEDAS.reduce(function (mapa, moeda) {
        mapa[moeda.chave] = moeda.fator;
        return mapa;
    }, {}));
    var CATALOGO_ITENS_INVENTARIO = Object.freeze([
        { slug: "kunai", nome: "Kunai", categoria: "Arremessáveis", tipo: "Arremessável", preco: { valor: 2, moeda: "pc" }, dano: "1d6 cortante ou perfurante" },
        { slug: "shuriken", nome: "Shuriken", categoria: "Arremessáveis", tipo: "Arremessável", preco: { valor: 2, moeda: "pc" }, dano: "1d4 perfurante" },
        { slug: "shuriken-de-vento", nome: "Shuriken de Vento Demoníaca", categoria: "Arremessáveis", tipo: "Arremessável", preco: { valor: 5, moeda: "pp" }, dano: "1d10 cortante" },
        { slug: "agulhas", nome: "Agulha", categoria: "Arremessáveis", tipo: "Arremessável", preco: { valor: 5, moeda: "pc" }, dano: "1 perfurante" },
        { slug: "papel-bomba", nome: "Papel bomba", categoria: "Arremessáveis", tipo: "Arremessável", preco: { valor: 5, moeda: "pp" }, dano: "1d6 fogo" },
        { slug: "arco-curto", nome: "Arco curto", categoria: "Armas à distância", tipo: "Arma à distância", preco: { valor: 20, moeda: "pp" }, dano: "1d6 perfurante" },
        { slug: "arco-longo", nome: "Arco longo", categoria: "Armas à distância", tipo: "Arma à distância", preco: { valor: 50, moeda: "pp" }, dano: "1d8 perfurante" },
        { slug: "arco-composto", nome: "Arco composto", categoria: "Armas à distância", tipo: "Arma à distância", preco: { valor: 1, moeda: "po" }, dano: "1d10 perfurante" },
        { slug: "funda", nome: "Funda", categoria: "Armas à distância", tipo: "Arma à distância", preco: { valor: 1, moeda: "pp" }, dano: "1d6 contusão" },
        { slug: "balista", nome: "Balista", categoria: "Armas à distância", tipo: "Arma à distância", preco: { valor: 20, moeda: "po" }, dano: "5d10 perfurante" },
        { slug: "dispositivo-de-disparo", nome: "Dispositivo de disparo", categoria: "Armas à distância", tipo: "Arma à distância", preco: { valor: 1, moeda: "po" }, dano: "—" },
        { slug: "zarabatana", nome: "Zarabatana", categoria: "Armas à distância", tipo: "Arma à distância", preco: { valor: 1, moeda: "po" }, dano: "1 perfurante" },
        { slug: "bastao", nome: "Bastão", categoria: "Corpo a corpo", tipo: "Arma corpo a corpo", preco: { valor: 10, moeda: "pp" }, dano: "1d6 contusão" },
        { slug: "foice-curta", nome: "Foice curta", categoria: "Corpo a corpo", tipo: "Arma corpo a corpo", preco: { valor: 5, moeda: "pp" }, dano: "1d6 cortante" },
        { slug: "lanca", nome: "Lança", categoria: "Corpo a corpo", tipo: "Arma corpo a corpo", preco: { valor: 15, moeda: "pp" }, dano: "1d8 perfurante" },
        { slug: "chicote", nome: "Chicote", categoria: "Corpo a corpo", tipo: "Arma corpo a corpo", preco: { valor: 10, moeda: "pp" }, dano: "1d8 cortante" },
        { slug: "tanto", nome: "Tanto", categoria: "Corpo a corpo", tipo: "Katana curta", preco: { valor: 1, moeda: "po" }, dano: "1d6 cortante" },
        { slug: "wakizaki", nome: "Wakizaki", categoria: "Corpo a corpo", tipo: "Katana de uma mão", preco: { valor: 2, moeda: "po" }, dano: "1d8 cortante" },
        { slug: "katana", nome: "Katana", categoria: "Corpo a corpo", tipo: "Katana de duas mãos", preco: { valor: 5, moeda: "po" }, dano: "1d12 cortante" },
        { slug: "corrente", nome: "Corrente", categoria: "Corpo a corpo", tipo: "Arma corpo a corpo", preco: { valor: 1, moeda: "po", por: "metro" }, dano: "Modificador de Força ×3" },
        { slug: "nunchaku", nome: "Nunchaku", categoria: "Corpo a corpo", tipo: "Arma corpo a corpo", preco: { valor: 2, moeda: "po" }, dano: "Modificador de Destreza ×2" },
        { slug: "esfera", nome: "Esferas de metal", categoria: "Outras armas", tipo: "Arma", preco: null, dano: "—", observacao: "Preço aguardando tabela completa" },
        { slug: "fio-de-nilon", nome: "Fio de náilon", categoria: "Ferramentas", tipo: "Ferramenta", preco: null, dano: "—", observacao: "Preço aguardando tabela completa" },
        { slug: "pergaminho-de-selamento", nome: "Pergaminho de selamento", categoria: "Ferramentas", tipo: "Ferramenta", preco: null, dano: "—", observacao: "Preço aguardando tabela completa" },
        { slug: "repelente", nome: "Repelente", categoria: "Ferramentas", tipo: "Ferramenta", preco: null, dano: "—", observacao: "Preço aguardando tabela completa" },
        { slug: "comida", nome: "Comida", categoria: "Consumíveis", tipo: "Consumível", preco: null, dano: "—", observacao: "Preço aguardando tabela completa" },
        { slug: "kit-medico", nome: "Kit médico", categoria: "Consumíveis", tipo: "Consumível", preco: null, dano: "—", observacao: "Preço aguardando tabela completa" },
        { slug: "pilula-de-chakra", nome: "Pílula de chakra", categoria: "Consumíveis", tipo: "Consumível", preco: null, dano: "—", observacao: "Preço aguardando tabela completa" },
        { slug: "pedra-da-familia", nome: "Pedra da família", categoria: "Itens especiais", tipo: "Item especial", preco: null, dano: "—", observacao: "Não disponível para compra" }
    ]);
    window.CATALOGO_ITENS_INVENTARIO = CATALOGO_ITENS_INVENTARIO;
    var ALIASES_ORDENADOS = Object.keys(ALIASES_INVENTARIO).sort(function (a, b) { return b.length - a.length; });
    var cacheSlugs = new Map();
    var detalheAberto = null;
    var menuAcoesAberto = null;
    var lojaBusca = "";
    var compraOverlay = null;
    var compraSlug = "";
    var compraQuantidade = 1;
    var compraEmAndamento = false;
    function normalizarNome(valor) {
        if (typeof normalizarTextoInventario === "function") {
            return normalizarTextoInventario(valor).replace(/\s+/g, " ");
        }
        return String(valor || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ");
    }
    function escaparHtml(valor) {
        return String(valor == null ? "" : valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function inteiroSeguro(valor) {
        var numero = Number.parseInt(valor, 10);
        return Number.isFinite(numero) && numero > 0 ? numero : 0;
    }
    function slugIconeInventario(nome) {
        var e_1, _a;
        var nomeNormalizado = normalizarNome(nome);
        if (!nomeNormalizado)
            return "";
        if (cacheSlugs.has(nomeNormalizado))
            return cacheSlugs.get(nomeNormalizado);
        var slug = ALIASES_INVENTARIO[nomeNormalizado] || "";
        if (!slug) {
            try {
                for (var ALIASES_ORDENADOS_1 = __values(ALIASES_ORDENADOS), ALIASES_ORDENADOS_1_1 = ALIASES_ORDENADOS_1.next(); !ALIASES_ORDENADOS_1_1.done; ALIASES_ORDENADOS_1_1 = ALIASES_ORDENADOS_1.next()) {
                    var alias = ALIASES_ORDENADOS_1_1.value;
                    if (alias.length > 2 && nomeNormalizado.includes(alias)) {
                        slug = ALIASES_INVENTARIO[alias];
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (ALIASES_ORDENADOS_1_1 && !ALIASES_ORDENADOS_1_1.done && (_a = ALIASES_ORDENADOS_1.return)) _a.call(ALIASES_ORDENADOS_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        cacheSlugs.set(nomeNormalizado, slug);
        return slug;
    }
    window.obterImagemInventarioPorNome = function (nome) {
        var slug = slugIconeInventario(nome);
        return slug ? (ICONES_INVENTARIO[slug] || "") : "";
    };
    window.temImagemInventarioPorNome = function (nome) {
        return Boolean(window.obterImagemInventarioPorNome(nome));
    };
    function imagemInventarioVisual(nome, classeExtra, slug) {
        if (classeExtra === void 0) { classeExtra = ""; }
        if (slug === void 0) { slug = null; }
        var slugFinal = slug == null ? slugIconeInventario(nome) : slug;
        var src = slugFinal ? (ICONES_INVENTARIO[slugFinal] || "") : "";
        if (src) {
            return "<img class=\"itemInventarioImg ".concat(classeExtra, "\" src=\"").concat(src, "\" alt=\"\" loading=\"lazy\" decoding=\"async\" draggable=\"false\">");
        }
        var fallback = typeof iconeInventario === "function" ? iconeInventario(nome) : "🎒";
        return "<span class=\"itemInventarioIconeFallback ".concat(classeExtra, "\">").concat(fallback, "</span>");
    }
    function quantidadeInventarioVisual(item) {
        var _a;
        var quantidade = Number.parseInt((_a = item === null || item === void 0 ? void 0 : item.quantidade) !== null && _a !== void 0 ? _a : 0, 10);
        return Number.isFinite(quantidade) && quantidade >= 0 ? quantidade : 0;
    }
    function garantirCarteira() {
        if (!estado.carteira || typeof estado.carteira !== "object" || Array.isArray(estado.carteira)) {
            estado.carteira = {};
        }
        MOEDAS.forEach(function (moeda) {
            estado.carteira[moeda.chave] = inteiroSeguro(estado.carteira[moeda.chave]);
        });
        if (!Array.isArray(estado.carteiraHistorico))
            estado.carteiraHistorico = [];
        return estado.carteira;
    }
    function copiarCarteira(carteira) {
        if (carteira === void 0) { carteira = garantirCarteira(); }
        return MOEDAS.reduce(function (copia, moeda) {
            copia[moeda.chave] = inteiroSeguro(carteira[moeda.chave]);
            return copia;
        }, {});
    }
    function valorTotalCarteira(carteira) {
        if (carteira === void 0) { carteira = garantirCarteira(); }
        return MOEDAS.reduce(function (total, moeda) { return total + inteiroSeguro(carteira[moeda.chave]) * moeda.fator; }, 0);
    }
    function decomporValor(valorPc) {
        var restante = Math.max(0, Math.floor(Number(valorPc) || 0));
        var carteira = {};
        MOEDAS.forEach(function (moeda) {
            carteira[moeda.chave] = Math.floor(restante / moeda.fator);
            restante %= moeda.fator;
        });
        return carteira;
    }
    function formatarNumero(valor) {
        try {
            return new Intl.NumberFormat("pt-BR").format(valor);
        }
        catch (_erro) {
            return String(valor);
        }
    }
    function normalizarTerminologiaMoedas(texto) {
        return String(texto !== null && texto !== void 0 ? texto : "")
            .replace(/\bPeças? de Diamante\b/gi, function (termo) { return /^Peças/.test(termo) ? "Peças de Platina" : "Peça de Platina"; })
            .replace(/\bMoedas? de Diamante\b/gi, function (termo) { return /^Moedas/.test(termo) ? "Moedas de Platina" : "Moeda de Platina"; })
            .replace(/\bDiamante\b/gi, "Platina")
            .replace(/\bPD\b/g, "PL");
    }
    function formatarCarteira(carteira, _a) {
        if (carteira === void 0) { carteira = garantirCarteira(); }
        var _b = _a === void 0 ? {} : _a, _c = _b.incluirZeros, incluirZeros = _c === void 0 ? false : _c;
        var partes = MOEDAS
            .map(function (moeda) { return ({ moeda: moeda, quantidade: inteiroSeguro(carteira[moeda.chave]) }); })
            .filter(function (item) { return incluirZeros || item.quantidade > 0; })
            .map(function (item) { return "".concat(formatarNumero(item.quantidade), " ").concat(item.moeda.sigla); });
        return partes.length ? partes.join(" • ") : "0 PC";
    }
    function formatarPreco(preco, quantidade) {
        if (quantidade === void 0) { quantidade = 1; }
        if (!preco)
            return "Preço pendente";
        var total = inteiroSeguro(preco.valor) * Math.max(1, inteiroSeguro(quantidade));
        var moeda = MOEDAS.find(function (item) { return item.chave === preco.moeda; });
        var sufixo = preco.por ? " por ".concat(preco.por) : "";
        return "".concat(formatarNumero(total), " ").concat((moeda === null || moeda === void 0 ? void 0 : moeda.sigla) || String(preco.moeda || "").toUpperCase()).concat(quantidade === 1 ? sufixo : "");
    }
    function valorPrecoEmPc(preco, quantidade) {
        if (quantidade === void 0) { quantidade = 1; }
        if (!preco || !FATOR_MOEDA[preco.moeda])
            return null;
        return inteiroSeguro(preco.valor) * FATOR_MOEDA[preco.moeda] * Math.max(1, inteiroSeguro(quantidade));
    }
    function registrarHistoricoCarteira(registro) {
        garantirCarteira();
        estado.carteiraHistorico.unshift(__assign({ id: "wallet_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 8)), data: Date.now() }, registro));
        estado.carteiraHistorico = estado.carteiraHistorico.slice(0, 40);
    }
    function persistirEstadoSeguro(contexto) {
        if (contexto === void 0) { contexto = {}; }
        try {
            if (typeof persistirEstadoLocal === "function")
                return persistirEstadoLocal(contexto) !== false;
            localStorage.setItem(CHAVE, JSON.stringify(estado));
            return true;
        }
        catch (erro) {
            console.warn("Não foi possível salvar a carteira/inventário.", erro);
            return false;
        }
    }
    function moedaPorSlug(slug) {
        if (slug === "moeda-de-platina" || slug === "moeda-de-diamante")
            return "pd";
        if (slug === "moeda-de-ouro")
            return "po";
        if (slug === "moeda-de-prata")
            return "pp";
        if (slug === "moeda-de-cobre" || slug === "moeda-de-bronze")
            return "pc";
        return "";
    }
    function chaveMoedaDoItem(item) {
        var slugExplicito = String((item === null || item === void 0 ? void 0 : item.catalogoSlug) || (item === null || item === void 0 ? void 0 : item.slug) || "").trim();
        var porSlug = moedaPorSlug(slugExplicito);
        if (porSlug)
            return porSlug;
        var nome = normalizarNome(item === null || item === void 0 ? void 0 : item.nome);
        var nomesExatos = {
            "moeda de platina": "pd", "platina": "pd", "pl": "pd", "peca de platina": "pd",
            // Legado: aceita a nomenclatura antiga apenas para migrar fichas existentes.
            "moeda de diamante": "pd", "diamante": "pd", "pd": "pd", "peca de diamante": "pd",
            "moeda de ouro": "po", "ouro": "po", "po": "po", "peca de ouro": "po",
            "moeda de prata": "pp", "prata": "pp", "pp": "pp", "peca de prata": "pp",
            "moeda de cobre": "pc", "cobre": "pc", "pc": "pc", "peca de cobre": "pc",
            "moeda de bronze": "pc", "bronze": "pc", "peca de bronze": "pc"
        };
        return nomesExatos[nome] || "";
    }
    function migrarMoedasDoInventario() {
        garantirInventarioItens();
        garantirCarteira();
        var alterou = false;
        var mantidos = [];
        var migradas = { pd: 0, po: 0, pp: 0, pc: 0 };
        estado.inventarioItens.forEach(function (item) {
            var chave = chaveMoedaDoItem(item);
            if (!chave) {
                mantidos.push(item);
                return;
            }
            var quantidade = quantidadeInventarioVisual(item);
            if (quantidade > 0) {
                estado.carteira[chave] += quantidade;
                migradas[chave] += quantidade;
            }
            alterou = true;
        });
        if (!alterou)
            return false;
        estado.inventarioItens = mantidos;
        registrarHistoricoCarteira({
            tipo: "migracao",
            titulo: "Moedas movidas para a Carteira",
            detalhe: formatarCarteira(migradas)
        });
        persistirEstadoSeguro();
        return true;
    }
    function fecharEstadoItemInventario(indice) {
        if (indice === void 0) { indice = null; }
        if (indice == null || detalheAberto === indice)
            detalheAberto = null;
        menuAcoesAberto = null;
    }
    window.fecharDetalheItemInventario = function (indice) {
        if (indice === void 0) { indice = null; }
        fecharEstadoItemInventario(indice);
        renderizarInventario();
    };
    window.abrirDetalheItemInventario = function (indice) {
        garantirInventarioItens();
        if (!estado.inventarioItens[indice])
            return;
        detalheAberto = detalheAberto === indice ? null : indice;
        menuAcoesAberto = null;
        renderizarInventario();
    };
    window.alternarMenuItemInventario = function (indice) {
        garantirInventarioItens();
        if (!estado.inventarioItens[indice])
            return;
        detalheAberto = indice;
        menuAcoesAberto = menuAcoesAberto === indice ? null : indice;
        renderizarInventario();
    };
    window.ajustarQtdItemInventario = function (indice, delta) {
        return __awaiter(this, void 0, void 0, function () {
            var item, atual, nova, mensagem, confirmado, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        garantirInventarioItens();
                        item = estado.inventarioItens[indice];
                        if (!item)
                            return [2 /*return*/];
                        atual = quantidadeInventarioVisual(item);
                        nova = Math.max(0, atual + Number(delta || 0));
                        if (nova === atual)
                            return [2 /*return*/];
                        mensagem = "".concat(item.nome || "Item", ": ").concat(atual, " \u2192 ").concat(nova);
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
                        item.quantidade = nova;
                        persistirEstadoSeguro({ confirmada: true, origem: "inventario", campo: "inventarioItens", motivo: "alteracao-confirmada" });
                        renderizarInventario();
                        return [2 /*return*/];
                }
            });
        });
    };
    window.confirmarQtdItemInventarioVisual = function (indice, valor) {
        return __awaiter(this, void 0, void 0, function () {
            var item, atual, nova, mensagem, confirmado, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        garantirInventarioItens();
                        item = estado.inventarioItens[indice];
                        if (!item)
                            return [2 /*return*/];
                        atual = quantidadeInventarioVisual(item);
                        nova = Math.max(0, Number.parseInt(valor, 10) || 0);
                        if (nova === atual) {
                            renderizarInventario();
                            return [2 /*return*/];
                        }
                        mensagem = "".concat(item.nome || "Item", ": ").concat(atual, " \u2192 ").concat(nova);
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
                        if (!confirmado) {
                            renderizarInventario();
                            return [2 /*return*/];
                        }
                        item.quantidade = nova;
                        persistirEstadoSeguro({ confirmada: true, origem: "inventario", campo: "inventarioItens", motivo: "alteracao-confirmada" });
                        renderizarInventario();
                        return [2 /*return*/];
                }
            });
        });
    };
    var usarItemInventarioOriginal = window.usarItemInventario;
    if (typeof usarItemInventarioOriginal === "function") {
        window.usarItemInventario = function (indice) {
            return __awaiter(this, void 0, void 0, function () {
                var item, quantidadeAntes, itemDepois, quantidadeDepois;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            garantirInventarioItens();
                            item = estado.inventarioItens[indice];
                            if (!item)
                                return [2 /*return*/];
                            quantidadeAntes = quantidadeInventarioVisual(item);
                            return [4 /*yield*/, usarItemInventarioOriginal(indice)];
                        case 1:
                            _a.sent();
                            itemDepois = estado.inventarioItens[indice];
                            quantidadeDepois = itemDepois ? quantidadeInventarioVisual(itemDepois) : quantidadeAntes;
                            if (itemDepois === item && quantidadeDepois < quantidadeAntes) {
                                fecharEstadoItemInventario(indice);
                                renderizarInventario();
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
    }
    window.editarNomeItemInventario = function (indice) {
        garantirInventarioItens();
        var item = estado.inventarioItens[indice];
        if (!item)
            return;
        var novo = prompt("Nome do item:", String(item.nome || ""));
        if (novo === null || !novo.trim())
            return;
        item.nome = novo.trim();
        persistirEstadoSeguro({ confirmada: true, origem: "inventario", campo: "inventarioItens", motivo: "alteracao-confirmada" });
        fecharEstadoItemInventario(indice);
        renderizarInventario();
    };
    window.removerItemInventario = function (indice) {
        return __awaiter(this, void 0, void 0, function () {
            var item, nome, confirmado, _a, indiceAtual;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        garantirInventarioItens();
                        item = estado.inventarioItens[indice];
                        if (!item)
                            return [2 /*return*/];
                        nome = String(item.nome || "Item");
                        if (!(typeof modalShinobi === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, modalShinobi("Excluir item?", "Excluir \u201C".concat(nome, "\u201D do invent\u00E1rio?\n\nEssa a\u00E7\u00E3o n\u00E3o pode ser desfeita."))];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = confirm("Excluir \"".concat(nome, "\" do invent\u00E1rio?"));
                        _b.label = 3;
                    case 3:
                        confirmado = _a;
                        if (!confirmado)
                            return [2 /*return*/];
                        indiceAtual = estado.inventarioItens.indexOf(item);
                        if (indiceAtual < 0)
                            return [2 /*return*/];
                        estado.inventarioItens.splice(indiceAtual, 1);
                        persistirEstadoSeguro({ confirmada: true, origem: "inventario", campo: "inventarioItens", motivo: "alteracao-confirmada" });
                        fecharEstadoItemInventario();
                        renderizarInventario();
                        return [2 /*return*/];
                }
            });
        });
    };
    function renderizarListaInventario() {
        garantirInventarioItens();
        var lista = document.getElementById("listaInventario");
        if (!lista)
            return;
        var itens = estado.inventarioItens;
        if (!itens.length) {
            detalheAberto = null;
            lista.innerHTML = '<div class="itemInventarioVazio">Nenhum item no inventário. Abra a Loja para comprar equipamentos.</div>';
            return;
        }
        if (detalheAberto != null && !itens[detalheAberto])
            detalheAberto = null;
        if (menuAcoesAberto != null && !itens[menuAcoesAberto])
            menuAcoesAberto = null;
        var html = [];
        itens.forEach(function (item, indice) {
            var nomeOriginal = String((item === null || item === void 0 ? void 0 : item.nome) || "Item");
            var nomeExibicao = normalizarTerminologiaMoedas(nomeOriginal);
            var nomeSeguro = escaparHtml(nomeExibicao);
            var quantidade = quantidadeInventarioVisual(item);
            var aberto = detalheAberto === indice;
            var menuAberto = menuAcoesAberto === indice;
            var slug = (item === null || item === void 0 ? void 0 : item.catalogoSlug) || slugIconeInventario(nomeOriginal);
            var catalogado = CATALOGO_ITENS_INVENTARIO.find(function (catalogo) { return catalogo.slug === slug; });
            html.push("\n        <div class=\"itemInventario itemInventarioVisualCard ".concat(aberto ? "itemInventarioAberto" : "", "\" role=\"button\" tabindex=\"0\" aria-expanded=\"").concat(aberto, "\" onclick=\"abrirDetalheItemInventario(").concat(indice, ")\" onkeydown=\"if(event.key==='Enter'||event.key===' '){event.preventDefault();abrirDetalheItemInventario(").concat(indice, ")}\">\n          <div class=\"itemInventarioImagemWrap\">\n            ").concat(imagemInventarioVisual(nomeOriginal, "", slug), "\n            <span class=\"itemInventarioQuantidadeBadge\">").concat(quantidade, "</span>\n          </div>\n          <div class=\"itemInventarioNomeMini\" title=\"").concat(nomeSeguro, "\">").concat(nomeSeguro, "</div>\n        </div>\n      "));
            if (!aberto)
                return;
            var detalhes = [];
            if ((catalogado === null || catalogado === void 0 ? void 0 : catalogado.dano) && catalogado.dano !== "—")
                detalhes.push("<span><b>Dano</b>".concat(escaparHtml(catalogado.dano), "</span>"));
            if (catalogado === null || catalogado === void 0 ? void 0 : catalogado.tipo)
                detalhes.push("<span><b>Tipo</b>".concat(escaparHtml(catalogado.tipo), "</span>"));
            if ((item === null || item === void 0 ? void 0 : item.adquiridoPor) === "loja")
                detalhes.push('<span><b>Origem</b>Comprado na loja</span>');
            html.push("\n        <div class=\"itemInventarioDetalhe\">\n          <div class=\"itemInventarioMenuWrap\">\n            <button type=\"button\" class=\"itemInventarioMenuBtn\" aria-label=\"Mais op\u00E7\u00F5es de ".concat(nomeSeguro, "\" aria-haspopup=\"menu\" aria-expanded=\"").concat(menuAberto, "\" onclick=\"event.stopPropagation();alternarMenuItemInventario(").concat(indice, ")\">\u22EE</button>\n            <div class=\"itemInventarioMenuBalao ").concat(menuAberto ? "aberto" : "", "\" role=\"menu\">\n              <button type=\"button\" class=\"itemInventarioExcluirMenu\" role=\"menuitem\" onclick=\"event.stopPropagation();removerItemInventario(").concat(indice, ")\">Excluir item</button>\n            </div>\n          </div>\n          <div class=\"itemInventarioDetalheImagem\">").concat(imagemInventarioVisual(nomeOriginal, "itemInventarioImgGrande", slug), "</div>\n          <div class=\"itemInventarioDetalheConteudo\">\n            <div class=\"itemInventarioDetalheNome\">").concat(nomeSeguro, "</div>\n            ").concat(detalhes.length ? "<div class=\"itemInventarioMetadados\">".concat(detalhes.join(""), "</div>") : "", "\n            <div class=\"itemInventarioQtdControle\">\n              <button type=\"button\" onclick=\"event.stopPropagation();ajustarQtdItemInventario(").concat(indice, ",-1)\">\u2212</button>\n              <input type=\"number\" min=\"0\" inputmode=\"numeric\" value=\"").concat(quantidade, "\" onchange=\"confirmarQtdItemInventarioVisual(").concat(indice, ",this.value)\">\n              <button type=\"button\" onclick=\"event.stopPropagation();ajustarQtdItemInventario(").concat(indice, ",1)\">+</button>\n            </div>\n            <div class=\"itemInventarioAcoes\">\n              <button type=\"button\" class=\"itemInventarioBtnUsar\" onclick=\"event.stopPropagation();usarItemInventario(").concat(indice, ")\">Usar</button>\n              <button type=\"button\" class=\"itemInventarioBtnEditar\" onclick=\"event.stopPropagation();editarNomeItemInventario(").concat(indice, ")\">Editar</button>\n            </div>\n          </div>\n        </div>\n      "));
        });
        lista.innerHTML = html.join("");
    }
    function renderizarCarteira() {
        var host = document.getElementById("carteiraConteudo");
        if (!host)
            return;
        var carteira = garantirCarteira();
        var total = valorTotalCarteira(carteira);
        var historico = estado.carteiraHistorico || [];
        host.innerHTML = "\n      <section class=\"carteiraResumoCard\">\n        <span>VALOR TOTAL</span>\n        <strong>".concat(escaparHtml(formatarCarteira(carteira)), "</strong>\n        <small>Equivalente a ").concat(formatarNumero(total), " PC</small>\n      </section>\n\n      <div class=\"carteiraMoedasGrid\">\n        ").concat(MOEDAS.map(function (moeda) { return "\n          <article class=\"carteiraMoedaCard carteiraMoeda-".concat(moeda.chave, "\">\n            <div class=\"carteiraMoedaImagem\">").concat(imagemInventarioVisual("Moeda de ".concat(moeda.nome), "", moeda.slug), "</div>\n            <div class=\"carteiraMoedaInfo\"><strong>").concat(moeda.sigla, "</strong><small>").concat(moeda.nome, "</small></div>\n            <label class=\"carteiraMoedaControle\" aria-label=\"Editar quantidade de moedas de ").concat(moeda.nome, "\">\n              <input type=\"number\" min=\"0\" step=\"1\" inputmode=\"numeric\" value=\"").concat(inteiroSeguro(carteira[moeda.chave]), "\" onchange=\"definirMoedaCarteira('").concat(moeda.chave, "',this.value)\" onfocus=\"this.select()\" onkeydown=\"if(event.key==='Enter'){this.blur()}\" aria-label=\"Quantidade de moedas de ").concat(moeda.nome, "\">\n              <span class=\"shinobiIcon icon-edit carteiraMoedaEditIcon\" aria-hidden=\"true\"></span>\n            </label>\n          </article>\n        "); }).join(""), "\n      </div>\n\n      <div class=\"carteiraConversao\">\n        <span class=\"shinobiIcon icon-sync carteiraConversaoIcone\" aria-hidden=\"true\"></span>\n        <div><strong>Convers\u00E3o autom\u00E1tica</strong><span>1 PL = 100 PO \u00B7 1 PO = 100 PP \u00B7 1 PP = 100 PC</span></div>\n      </div>\n\n      <button type=\"button\" class=\"carteiraOrganizarBtn\" onclick=\"organizarMoedasCarteira()\">\n        <span class=\"shinobiIcon icon-wallet\" aria-hidden=\"true\"></span>\n        <strong>Organizar moedas</strong>\n        <span class=\"carteiraAcaoSeta\" aria-hidden=\"true\">\u203A</span>\n      </button>\n\n      <details class=\"carteiraHistorico\" ").concat(historico.length ? "" : "disabled", ">\n        <summary><span>Hist\u00F3rico da carteira</span><small>").concat(historico.length, " ").concat(historico.length === 1 ? "movimentação" : "movimentações", "</small></summary>\n        <div class=\"carteiraHistoricoLista\">\n          ").concat(historico.length ? historico.slice(0, 20).map(function (item) { return "\n            <article>\n              <div><strong>".concat(escaparHtml(item.titulo || "Movimentação"), "</strong><small>").concat(new Date(Number(item.data) || Date.now()).toLocaleString("pt-BR"), "</small></div>\n              <span>").concat(escaparHtml(normalizarTerminologiaMoedas(item.detalhe || "")), "</span>\n            </article>\n          "); }).join("") : '<p>Nenhuma movimentação registrada.</p>', "\n        </div>\n      </details>\n    ");
    }
    window.definirMoedaCarteira = function (chave, valor) {
        return __awaiter(this, void 0, void 0, function () {
            var carteira, atual, novo, mensagem, confirmado, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!FATOR_MOEDA[chave])
                            return [2 /*return*/];
                        carteira = garantirCarteira();
                        atual = inteiroSeguro(carteira[chave]), novo = inteiroSeguro(valor);
                        if (novo === atual) {
                            renderizarCarteira();
                            return [2 /*return*/];
                        }
                        mensagem = "".concat(String(chave).toUpperCase(), ": ").concat(atual, " \u2192 ").concat(novo);
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
                        if (!confirmado) {
                            renderizarCarteira();
                            return [2 /*return*/];
                        }
                        carteira[chave] = novo;
                        registrarHistoricoCarteira({
                            tipo: "ajuste",
                            titulo: "".concat(String(chave).toUpperCase(), " ajustado"),
                            detalhe: "".concat(formatarNumero(atual), " ").concat(String(chave).toUpperCase(), " \u2192 ").concat(formatarNumero(novo), " ").concat(String(chave).toUpperCase())
                        });
                        persistirEstadoSeguro({ confirmada: true, origem: "carteira", campos: ["carteira", "carteiraHistorico"], motivo: "alteracao-confirmada" });
                        renderizarCarteira();
                        renderizarSaldoLoja();
                        return [2 /*return*/];
                }
            });
        });
    };
    window.ajustarMoedaCarteira = function (chave, delta) {
        return __awaiter(this, void 0, void 0, function () {
            var carteira, atual, novo, mensagem, confirmado, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!FATOR_MOEDA[chave])
                            return [2 /*return*/];
                        carteira = garantirCarteira();
                        atual = inteiroSeguro(carteira[chave]);
                        novo = Math.max(0, atual + Number(delta || 0));
                        if (novo === atual)
                            return [2 /*return*/];
                        mensagem = "".concat(String(chave).toUpperCase(), ": ").concat(atual, " \u2192 ").concat(novo);
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
                        carteira[chave] = novo;
                        registrarHistoricoCarteira({
                            tipo: "ajuste",
                            titulo: "".concat(String(chave).toUpperCase(), " ajustado"),
                            detalhe: "".concat(formatarNumero(atual), " ").concat(String(chave).toUpperCase(), " \u2192 ").concat(formatarNumero(novo), " ").concat(String(chave).toUpperCase())
                        });
                        persistirEstadoSeguro({ confirmada: true, origem: "carteira", campos: ["carteira", "carteiraHistorico"], motivo: "alteracao-confirmada" });
                        renderizarCarteira();
                        renderizarSaldoLoja();
                        return [2 /*return*/];
                }
            });
        });
    };
    window.organizarMoedasCarteira = function () {
        return __awaiter(this, void 0, void 0, function () {
            var carteira, antes, depois;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        carteira = garantirCarteira();
                        antes = copiarCarteira(carteira);
                        depois = decomporValor(valorTotalCarteira(carteira));
                        if (!(formatarCarteira(antes, { incluirZeros: true }) === formatarCarteira(depois, { incluirZeros: true }))) return [3 /*break*/, 3];
                        if (!(typeof avisoShinobi === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, avisoShinobi("Carteira organizada", "As moedas já estão organizadas nas maiores unidades possíveis.")];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                    case 3:
                        estado.carteira = depois;
                        registrarHistoricoCarteira({ tipo: "conversao", titulo: "Moedas organizadas", detalhe: "".concat(formatarCarteira(antes), " \u2192 ").concat(formatarCarteira(depois)) });
                        persistirEstadoSeguro({ confirmada: true, origem: "carteira", campos: ["carteira", "carteiraHistorico"], motivo: "alteracao-confirmada" });
                        renderizarCarteira();
                        renderizarSaldoLoja();
                        return [2 /*return*/];
                }
            });
        });
    };
    function itemCatalogoPorSlug(slug) {
        return CATALOGO_ITENS_INVENTARIO.find(function (item) { return item.slug === slug; }) || null;
    }
    function quantidadeCatalogadaNoInventario(slug) {
        garantirInventarioItens();
        return estado.inventarioItens.reduce(function (total, item) {
            var itemSlug = (item === null || item === void 0 ? void 0 : item.catalogoSlug) || slugIconeInventario(item === null || item === void 0 ? void 0 : item.nome);
            return itemSlug === slug ? total + quantidadeInventarioVisual(item) : total;
        }, 0);
    }
    function itensLojaFiltrados() {
        var termo = normalizarNome(lojaBusca);
        if (!termo)
            return __spreadArray([], __read(CATALOGO_ITENS_INVENTARIO), false);
        return CATALOGO_ITENS_INVENTARIO.filter(function (item) {
            var texto = normalizarNome("".concat(item.nome, " ").concat(item.categoria, " ").concat(item.tipo || "", " ").concat(item.dano || "", " ").concat(item.slug.replace(/-/g, " ")));
            return texto.includes(termo);
        });
    }
    function htmlCardLoja(item) {
        var possui = quantidadeCatalogadaNoInventario(item.slug);
        var disponivel = Boolean(item.preco);
        return "\n      <article class=\"lojaItemCard ".concat(disponivel ? "" : "lojaItemIndisponivel", "\">\n        <div class=\"lojaItemImagem\">\n          ").concat(imagemInventarioVisual(item.nome, "lojaItemImg", item.slug), "\n          ").concat(possui > 0 ? "<small class=\"lojaItemPossui\">Possui ".concat(possui, "</small>") : "", "\n        </div>\n        <div class=\"lojaItemConteudo\">\n          <small>").concat(escaparHtml(item.tipo || item.categoria), "</small>\n          <strong>").concat(escaparHtml(item.nome), "</strong>\n          <span>").concat(escaparHtml(item.preco ? (item.dano || "Sem descrição") : (item.observacao || "Preço aguardando tabela completa")), "</span>\n        </div>\n        <div class=\"lojaItemRodape\">\n          <b>").concat(escaparHtml(formatarPreco(item.preco)), "</b>\n          <button type=\"button\" ").concat(disponivel ? "onclick=\"abrirCompraLoja('".concat(item.slug, "')\"") : "disabled", ">").concat(disponivel ? "Comprar" : "Indisponível", "</button>\n        </div>\n      </article>\n    ");
    }
    function renderizarSaldoLoja() {
        var saldo = document.getElementById("lojaSaldoAtual");
        if (saldo)
            saldo.textContent = formatarCarteira(garantirCarteira());
        if (compraOverlay)
            atualizarCompraOverlay();
    }
    function renderizarLoja() {
        var host = document.getElementById("lojaCatalogo");
        var contador = document.getElementById("lojaContador");
        if (!host)
            return;
        var itens = itensLojaFiltrados();
        if (contador)
            contador.textContent = "".concat(itens.length, " ").concat(itens.length === 1 ? "item" : "itens");
        renderizarSaldoLoja();
        if (!itens.length) {
            host.innerHTML = '<div class="lojaSemResultado">Nenhum item encontrado.</div>';
            return;
        }
        var categorias = [];
        itens.forEach(function (item) {
            var grupo = categorias.find(function (categoria) { return categoria.nome === item.categoria; });
            if (!grupo) {
                grupo = { nome: item.categoria, itens: [] };
                categorias.push(grupo);
            }
            grupo.itens.push(item);
        });
        host.innerHTML = categorias.map(function (categoria) { return "\n      <section class=\"lojaCategoria\">\n        <h3>".concat(escaparHtml(categoria.nome), "</h3>\n        <div class=\"lojaGrid\">").concat(categoria.itens.map(htmlCardLoja).join(""), "</div>\n      </section>\n    "); }).join("");
    }
    var timerFiltroLoja = 0;
    window.filtrarLoja = function (valor) {
        lojaBusca = String(valor || "");
        clearTimeout(timerFiltroLoja);
        timerFiltroLoja = setTimeout(function () {
            timerFiltroLoja = 0;
            renderizarLoja();
        }, 90);
    };
    function atualizarCompraOverlay() {
        if (!compraOverlay)
            return;
        var item = itemCatalogoPorSlug(compraSlug);
        if (!item || !item.preco)
            return;
        var custoPc = valorPrecoEmPc(item.preco, compraQuantidade);
        var saldoPc = valorTotalCarteira();
        var total = compraOverlay.querySelector("[data-compra-total]");
        var quantidade = compraOverlay.querySelector("[data-compra-quantidade]");
        var saldoDepois = compraOverlay.querySelector("[data-compra-saldo-depois]");
        var confirmar = compraOverlay.querySelector("[data-compra-confirmar]");
        if (quantidade)
            quantidade.value = String(compraQuantidade);
        if (total)
            total.textContent = formatarPreco(item.preco, compraQuantidade);
        if (saldoDepois) {
            saldoDepois.textContent = saldoPc >= custoPc ? formatarCarteira(decomporValor(saldoPc - custoPc)) : "Faltam ".concat(formatarNumero(custoPc - saldoPc), " PC");
            saldoDepois.classList.toggle("insuficiente", saldoPc < custoPc);
        }
        if (confirmar) {
            confirmar.disabled = compraEmAndamento || saldoPc < custoPc;
            confirmar.textContent = compraEmAndamento ? "Processando..." : "Confirmar compra";
        }
    }
    function fecharCompraLoja() {
        compraOverlay === null || compraOverlay === void 0 ? void 0 : compraOverlay.remove();
        compraOverlay = null;
        compraSlug = "";
        compraQuantidade = 1;
        compraEmAndamento = false;
        document.body.classList.remove("compraLojaAberta");
    }
    window.fecharCompraLoja = fecharCompraLoja;
    window.alterarQuantidadeCompra = function (delta) {
        compraQuantidade = Math.min(9999, Math.max(1, compraQuantidade + Number(delta || 0)));
        atualizarCompraOverlay();
    };
    window.definirQuantidadeCompra = function (valor) {
        compraQuantidade = Math.min(9999, Math.max(1, Number.parseInt(valor, 10) || 1));
        atualizarCompraOverlay();
    };
    window.abrirCompraLoja = function (slug) {
        var item = itemCatalogoPorSlug(slug);
        if (!(item === null || item === void 0 ? void 0 : item.preco))
            return;
        fecharCompraLoja();
        compraSlug = slug;
        compraQuantidade = 1;
        var overlay = document.createElement("div");
        overlay.className = "compraLojaOverlay";
        overlay.innerHTML = "\n      <div class=\"compraLojaBox\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"compraLojaTitulo\">\n        <header>\n          <div><small>LOJA DE ITENS</small><h3 id=\"compraLojaTitulo\">".concat(escaparHtml(item.nome), "</h3></div>\n          <button type=\"button\" onclick=\"fecharCompraLoja()\" aria-label=\"Fechar\">\u00D7</button>\n        </header>\n        <div class=\"compraLojaCorpo\">\n          <div class=\"compraLojaItemImagem\">").concat(imagemInventarioVisual(item.nome, "compraLojaImg", item.slug), "</div>\n          <div class=\"compraLojaDetalhes\">\n            <span><b>Tipo</b>").concat(escaparHtml(item.tipo || item.categoria), "</span>\n            <span><b>Dano</b>").concat(escaparHtml(item.dano || "—"), "</span>\n            <span><b>Pre\u00E7o unit\u00E1rio</b>").concat(escaparHtml(formatarPreco(item.preco)), "</span>\n          </div>\n          <label class=\"compraLojaQuantidade\">\n            <span>").concat(item.preco.por === "metro" ? "Metros" : "Quantidade", "</span>\n            <div><button type=\"button\" onclick=\"alterarQuantidadeCompra(-1)\">\u2212</button><input data-compra-quantidade type=\"number\" min=\"1\" max=\"9999\" value=\"1\" onchange=\"definirQuantidadeCompra(this.value)\"><button type=\"button\" onclick=\"alterarQuantidadeCompra(1)\">+</button></div>\n          </label>\n          <div class=\"compraLojaResumo\">\n            <span><small>Total da compra</small><strong data-compra-total></strong></span>\n            <span><small>Saldo atual</small><strong>").concat(escaparHtml(formatarCarteira()), "</strong></span>\n            <span><small>Saldo ap\u00F3s compra</small><strong data-compra-saldo-depois></strong></span>\n          </div>\n        </div>\n        <footer><button type=\"button\" class=\"compraLojaCancelar\" onclick=\"fecharCompraLoja()\">Cancelar</button><button type=\"button\" class=\"compraLojaConfirmar\" data-compra-confirmar onclick=\"confirmarCompraLoja()\">Confirmar compra</button></footer>\n      </div>\n    ");
        compraOverlay = overlay;
        document.body.appendChild(overlay);
        document.body.classList.add("compraLojaAberta");
        overlay.addEventListener("click", function (event) { if (event.target === overlay)
            fecharCompraLoja(); });
        atualizarCompraOverlay();
    };
    function adicionarItemComprado(itemCatalogado, quantidade) {
        garantirInventarioItens();
        var indice = estado.inventarioItens.findIndex(function (item) {
            var slug = (item === null || item === void 0 ? void 0 : item.catalogoSlug) || slugIconeInventario(item === null || item === void 0 ? void 0 : item.nome);
            return slug === itemCatalogado.slug;
        });
        if (indice >= 0) {
            var item = estado.inventarioItens[indice];
            item.quantidade = quantidadeInventarioVisual(item) + quantidade;
            item.catalogoSlug = itemCatalogado.slug;
            item.adquiridoPor = item.adquiridoPor || "loja";
            return;
        }
        estado.inventarioItens.push({
            nome: itemCatalogado.nome,
            quantidade: quantidade,
            catalogoSlug: itemCatalogado.slug,
            adquiridoPor: "loja",
            tipo: itemCatalogado.tipo || "",
            dano: itemCatalogado.dano || ""
        });
    }
    window.confirmarCompraLoja = function () {
        return __awaiter(this, void 0, void 0, function () {
            var item, quantidade, custoPc, saldoPc, carteiraAntes, carteiraDepois, mensagem, confirmado, _a, inventarioAntes, historicoAntes, erro_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (compraEmAndamento)
                            return [2 /*return*/];
                        item = itemCatalogoPorSlug(compraSlug);
                        if (!(item === null || item === void 0 ? void 0 : item.preco))
                            return [2 /*return*/];
                        quantidade = Math.max(1, inteiroSeguro(compraQuantidade));
                        custoPc = valorPrecoEmPc(item.preco, quantidade);
                        saldoPc = valorTotalCarteira();
                        if (!(saldoPc < custoPc)) return [3 /*break*/, 3];
                        if (!(typeof avisoShinobi === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, avisoShinobi("Moedas insuficientes", "Pre\u00E7o: ".concat(formatarPreco(item.preco, quantidade), "\nVoc\u00EA possui: ").concat(formatarCarteira(), "\nFaltam: ").concat(formatarNumero(custoPc - saldoPc), " PC"))];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                    case 3:
                        carteiraAntes = copiarCarteira();
                        carteiraDepois = decomporValor(saldoPc - custoPc);
                        mensagem = "".concat(quantidade, "x ").concat(item.nome, "\n\nPre\u00E7o total: ").concat(formatarPreco(item.preco, quantidade), "\nSaldo antes: ").concat(formatarCarteira(carteiraAntes), "\nSaldo depois: ").concat(formatarCarteira(carteiraDepois), "\n\nO troco ser\u00E1 convertido automaticamente.");
                        if (!(typeof modalShinobi === "function")) return [3 /*break*/, 5];
                        return [4 /*yield*/, modalShinobi("Confirmar compra", mensagem)];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _a = confirm(mensagem);
                        _b.label = 6;
                    case 6:
                        confirmado = _a;
                        if (!confirmado)
                            return [2 /*return*/];
                        compraEmAndamento = true;
                        atualizarCompraOverlay();
                        inventarioAntes = JSON.parse(JSON.stringify(estado.inventarioItens || []));
                        historicoAntes = JSON.parse(JSON.stringify(estado.carteiraHistorico || []));
                        _b.label = 7;
                    case 7:
                        _b.trys.push([7, 10, , 13]);
                        estado.carteira = carteiraDepois;
                        adicionarItemComprado(item, quantidade);
                        registrarHistoricoCarteira({
                            tipo: "compra",
                            titulo: "Compra: ".concat(item.nome),
                            detalhe: "-".concat(formatarPreco(item.preco, quantidade), " \u00B7 ").concat(quantidade, " ").concat(item.preco.por === "metro" ? "m" : "un.")
                        });
                        if (!persistirEstadoSeguro({ confirmada: true, origem: "loja", campos: ["carteira", "carteiraHistorico", "inventarioItens"], motivo: "alteracao-confirmada" }))
                            throw new Error("A compra não pôde ser salva no aparelho.");
                        fecharCompraLoja();
                        renderizarInventario();
                        if (typeof registrarLog === "function")
                            registrarLog("Comprou ".concat(quantidade, "x ").concat(item.nome, " por ").concat(formatarPreco(item.preco, quantidade), "."));
                        if (!(typeof avisoShinobi === "function")) return [3 /*break*/, 9];
                        return [4 /*yield*/, avisoShinobi("Compra realizada", "".concat(item.nome, " foi adicionado ao invent\u00E1rio.\n\nNovo saldo: ").concat(formatarCarteira()))];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: return [3 /*break*/, 13];
                    case 10:
                        erro_1 = _b.sent();
                        estado.carteira = carteiraAntes;
                        estado.inventarioItens = inventarioAntes;
                        estado.carteiraHistorico = historicoAntes;
                        persistirEstadoSeguro();
                        compraEmAndamento = false;
                        atualizarCompraOverlay();
                        if (!(typeof avisoShinobi === "function")) return [3 /*break*/, 12];
                        return [4 /*yield*/, avisoShinobi("Compra não concluída", String((erro_1 === null || erro_1 === void 0 ? void 0 : erro_1.message) || erro_1))];
                    case 11:
                        _b.sent();
                        _b.label = 12;
                    case 12: return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    var adicionarItemInventarioOriginal = window.adicionarItemInventario;
    window.adicionarItemSemCusto = function () {
        if (typeof adicionarItemInventarioOriginal !== "function")
            return;
        adicionarItemInventarioOriginal();
        migrarMoedasDoInventario();
        renderizarInventario();
    };
    window.adicionarItemInventario = function () {
        abrirAbaInventario("loja");
    };
    window.abrirAbaInventario = function (aba, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.renderizar, renderizar = _c === void 0 ? true : _c;
        var permitidas = ["carteira", "itens", "loja"];
        var escolhida = permitidas.includes(aba) ? aba : "itens";
        try {
            localStorage.setItem("shinobi_inventario_aba_v1", escolhida);
        }
        catch (_erro) { }
        document.querySelectorAll("[data-inventario-aba]").forEach(function (botao) {
            var ativo = botao.dataset.inventarioAba === escolhida;
            botao.classList.toggle("ativo", ativo);
            botao.setAttribute("aria-selected", String(ativo));
        });
        document.querySelectorAll("[data-inventario-painel]").forEach(function (painel) {
            var ativo = painel.dataset.inventarioPainel === escolhida;
            painel.classList.toggle("ativo", ativo);
            painel.hidden = !ativo;
        });
        if (renderizar) {
            if (escolhida === "carteira")
                renderizarCarteira();
            if (escolhida === "itens")
                renderizarListaInventario();
            if (escolhida === "loja")
                renderizarLoja();
        }
    };
    window.renderizarInventario = function () {
        migrarMoedasDoInventario();
        garantirBaselineInventario();
        var aba = "itens";
        try {
            aba = localStorage.getItem("shinobi_inventario_aba_v1") || "itens";
        }
        catch (_erro) { }
        abrirAbaInventario(aba, { renderizar: true });
    };
    document.addEventListener("click", function (event) {
        var _a, _b;
        if (menuAcoesAberto != null && !((_b = (_a = event.target).closest) === null || _b === void 0 ? void 0 : _b.call(_a, ".itemInventarioMenuWrap"))) {
            menuAcoesAberto = null;
            renderizarListaInventario();
        }
    });
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && compraOverlay)
            fecharCompraLoja();
    });
    window.addEventListener("pageshow", function () {
        setTimeout(function () {
            migrarMoedasDoInventario();
            renderizarInventario();
        }, 0);
    });
    window.ShinobiCarteiraLoja = Object.freeze({
        moedas: MOEDAS,
        catalogo: CATALOGO_ITENS_INVENTARIO,
        decomporValor: decomporValor,
        valorTotalCarteira: valorTotalCarteira,
        valorPrecoEmPc: valorPrecoEmPc,
        formatarCarteira: formatarCarteira,
        formatarPreco: formatarPreco,
        slugIconeInventario: slugIconeInventario
    });
    migrarMoedasDoInventario();
    reiniciarBaselineInventario({ legado: true });
    renderizarInventario();
    if (typeof renderizarArmados === "function")
        renderizarArmados();
})();
