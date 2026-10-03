/* GERADO AUTOMATICAMENTE — fonte: js/00-item-identity.js — app 2.5.8.154. Não editar. */
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
/* Shinobi 2.5.8.100 — identidade estável para coleções item-level. */
(function (root, factory) {
    var api = factory();
    if (typeof module !== "undefined" && module.exports)
        module.exports = api;
    if (root)
        root.ShinobiItemIdentity = Object.freeze(api);
})(typeof window !== "undefined" ? window : globalThis, function () {
    "use strict";
    var CAMPOS_ID = Object.freeze({
        notas: "id", inventario: "id", jutsus: "jutsuId", armados: "ataqueId",
        kekkeiGenkai: "kekkeiId", carteiraHistorico: "id", efeitosBatalha: "id"
    });
    var PREFIXOS = Object.freeze({
        notas: "nota", inventario: "inv", jutsus: "jutsu", armados: "ataque",
        kekkeiGenkai: "kekkei", carteiraHistorico: "wallet", efeitosBatalha: "efeito"
    });
    function texto(valor) { return String(valor == null ? "" : valor).trim(); }
    function slug(valor, limite, padrao) {
        if (limite === void 0) { limite = 72; }
        if (padrao === void 0) { padrao = "item"; }
        return texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
            .slice(0, Math.max(1, Number(limite) || 72)) || padrao;
    }
    function hash(valor) {
        var entrada = String(valor == null ? "" : valor);
        var h = 2166136261;
        for (var i = 0; i < entrada.length; i += 1) {
            h ^= entrada.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return (h >>> 0).toString(36);
    }
    function ordenar(valor) {
        if (Array.isArray(valor))
            return valor.map(ordenar);
        if (!valor || typeof valor !== "object")
            return valor;
        var saida = {};
        Object.keys(valor).sort().forEach(function (chave) { saida[chave] = ordenar(valor[chave]); });
        return saida;
    }
    function serializar(valor) { try {
        return JSON.stringify(ordenar(valor));
    }
    catch (_erro) {
        return texto(valor);
    } }
    function idFirebaseSeguro(valor) {
        var id = texto(valor);
        return Boolean(id && id.length <= 180 && !/[.#$\/\[\]\u0000-\u001F\u007F]/.test(id));
    }
    function campoId(colecao) { return CAMPOS_ID[texto(colecao)] || "id"; }
    function prefixo(colecao) { return PREFIXOS[texto(colecao)] || "item"; }
    function limitarId(base, sufixo) {
        if (sufixo === void 0) { sufixo = ""; }
        var fim = texto(sufixo), limite = Math.max(1, 180 - fim.length);
        return "".concat(texto(base).slice(0, limite) || "item").concat(fim).slice(0, 180);
    }
    function normalizarIdExistente(colecao, valor) {
        var id = texto(valor);
        if (!id)
            return "";
        if (idFirebaseSeguro(id))
            return id;
        var p = prefixo(colecao), parte = slug(id, 48, "id");
        return limitarId("".concat(p, "_rec_").concat(parte), "_".concat(hash(id)));
    }
    /* Mantém as bases históricas já usadas pelo app para não criar uma nova
       identidade quando outro aparelho já publicou a mesma ficha em versões 98/99. */
    function idLegado(colecao, item) {
        if (item === void 0) { item = {}; }
        var c = texto(colecao);
        if (c === "notas")
            return "nota_legado_".concat(slug((item === null || item === void 0 ? void 0 : item.titulo) || "nota", 36, "nota")).slice(0, 180);
        if (c === "inventario") {
            var catalogo = slug((item === null || item === void 0 ? void 0 : item.catalogoSlug) || (item === null || item === void 0 ? void 0 : item.slug) || "", 64, "item");
            if (catalogo !== "item")
                return "inv_legado_catalogo_".concat(catalogo).slice(0, 180);
            var nome = slug((item === null || item === void 0 ? void 0 : item.nome) || "item", 64, "item"), tipo = slug((item === null || item === void 0 ? void 0 : item.tipo) || "", 64, "item"), dano = slug((item === null || item === void 0 ? void 0 : item.dano) || "", 64, "item");
            var complemento = [tipo, dano].filter(function (v) { return v && v !== "item"; }).join("_");
            return "inv_legado_".concat(nome).concat(complemento ? "_".concat(complemento) : "").slice(0, 180);
        }
        if (c === "jutsus") {
            var catalogo = texto(item === null || item === void 0 ? void 0 : item.catalogoId);
            if (catalogo)
                return "jutsu_catalogo_".concat(slug(catalogo)).slice(0, 180);
            var existente = texto((item === null || item === void 0 ? void 0 : item.id) || (item === null || item === void 0 ? void 0 : item.uuid));
            if (existente)
                return "jutsu_legado_id_".concat(slug(existente)).slice(0, 180);
            var assinatura = [texto(item === null || item === void 0 ? void 0 : item.nome), texto(item === null || item === void 0 ? void 0 : item.rank), texto(item === null || item === void 0 ? void 0 : item.elemento), texto(item === null || item === void 0 ? void 0 : item.categoria), texto(item === null || item === void 0 ? void 0 : item.tipoNome)].join("\u241f");
            return "jutsu_legado_".concat(slug((item === null || item === void 0 ? void 0 : item.nome) || "jutsu", 72, "jutsu"), "_").concat(hash(assinatura)).slice(0, 180);
        }
        if (c === "armados") {
            var existente = texto((item === null || item === void 0 ? void 0 : item.id) || (item === null || item === void 0 ? void 0 : item.uuid));
            if (existente)
                return "ataque_legado_id_".concat(slug(existente)).slice(0, 180);
            var assinatura = [texto(item === null || item === void 0 ? void 0 : item.nome), texto((item === null || item === void 0 ? void 0 : item.tipo) || "armado"), texto(item === null || item === void 0 ? void 0 : item.dano), texto(item === null || item === void 0 ? void 0 : item.itemInventario)].join("\u241f");
            return "ataque_legado_".concat(slug((item === null || item === void 0 ? void 0 : item.nome) || "ataque", 72, "ataque"), "_").concat(hash(assinatura)).slice(0, 180);
        }
        if (c === "kekkeiGenkai") {
            var existente = texto((item === null || item === void 0 ? void 0 : item.id) || (item === null || item === void 0 ? void 0 : item.uuid));
            if (existente)
                return "kekkei_legado_id_".concat(slug(existente)).slice(0, 180);
            return "kekkei_legado_".concat(slug((item === null || item === void 0 ? void 0 : item.nome) || "kekkei", 72, "kekkei")).slice(0, 180);
        }
        if (c === "carteiraHistorico") {
            var assinatura = [Number((item === null || item === void 0 ? void 0 : item.data) || 0), texto(item === null || item === void 0 ? void 0 : item.tipo), texto(item === null || item === void 0 ? void 0 : item.titulo), texto(item === null || item === void 0 ? void 0 : item.detalhe)].join("\u241f");
            return "wallet_legado_".concat(hash(assinatura)).slice(0, 180);
        }
        if (c === "efeitosBatalha") {
            var existente = texto(item === null || item === void 0 ? void 0 : item.id);
            if (existente)
                return normalizarIdExistente(c, existente);
            var assinatura = [texto(item === null || item === void 0 ? void 0 : item.origemId), texto(item === null || item === void 0 ? void 0 : item.nome), texto((item === null || item === void 0 ? void 0 : item.duracaoOriginal) || (item === null || item === void 0 ? void 0 : item.duracao)), Number((item === null || item === void 0 ? void 0 : item.rodadaAtivacao) || 0)].join("\u241f");
            return "efeito_legado_".concat(hash(assinatura)).slice(0, 180);
        }
        return "".concat(prefixo(c), "_legado_").concat(hash(serializar(item))).slice(0, 180);
    }
    function comparavel(colecao, item) {
        if (item === void 0) { item = {}; }
        var c = texto(colecao), copia = item && typeof item === "object" && !Array.isArray(item) ? JSON.parse(JSON.stringify(item)) : {};
        delete copia[campoId(c)];
        if (c === "notas")
            delete copia.aberto;
        if (c === "jutsus") {
            delete copia.imagem;
            delete copia.imagemId;
            delete copia.ordem;
        }
        if (c === "armados" || c === "kekkeiGenkai")
            delete copia.ordem;
        return copia;
    }
    function fingerprint(colecao, item) { return hash(serializar(comparavel(colecao, item))); }
    /* identityKey é deliberadamente mais estável que o fingerprint completo.
       Ela só é usada para canonicalizar IDs quando há exatamente uma correspondência
       local e uma remota; ambiguidades nunca são resolvidas automaticamente. */
    function identityKey(colecao, item) {
        if (item === void 0) { item = {}; }
        var c = texto(colecao);
        var partes = [];
        if (c === "notas")
            partes = [texto(item === null || item === void 0 ? void 0 : item.titulo).toLowerCase()];
        else if (c === "inventario") {
            var catalogo = texto((item === null || item === void 0 ? void 0 : item.catalogoSlug) || (item === null || item === void 0 ? void 0 : item.slug));
            partes = catalogo ? ["catalogo", catalogo] : ["manual", texto(item === null || item === void 0 ? void 0 : item.nome).toLowerCase(), texto(item === null || item === void 0 ? void 0 : item.tipo).toLowerCase()];
        }
        else if (c === "jutsus") {
            var catalogo = texto(item === null || item === void 0 ? void 0 : item.catalogoId), externo = texto((item === null || item === void 0 ? void 0 : item.id) || (item === null || item === void 0 ? void 0 : item.uuid));
            partes = catalogo ? ["catalogo", catalogo] : externo ? ["externo", externo] : [texto(item === null || item === void 0 ? void 0 : item.nome).toLowerCase(), texto(item === null || item === void 0 ? void 0 : item.rank).toLowerCase(), texto(item === null || item === void 0 ? void 0 : item.elemento).toLowerCase(), texto(item === null || item === void 0 ? void 0 : item.categoria).toLowerCase(), texto(item === null || item === void 0 ? void 0 : item.tipoNome).toLowerCase()];
        }
        else if (c === "armados") {
            var externo = texto((item === null || item === void 0 ? void 0 : item.id) || (item === null || item === void 0 ? void 0 : item.uuid));
            partes = externo ? ["externo", externo] : [texto(item === null || item === void 0 ? void 0 : item.nome).toLowerCase(), texto((item === null || item === void 0 ? void 0 : item.tipo) || "armado").toLowerCase(), texto(item === null || item === void 0 ? void 0 : item.itemInventario).toLowerCase()];
        }
        else if (c === "kekkeiGenkai") {
            var externo = texto((item === null || item === void 0 ? void 0 : item.id) || (item === null || item === void 0 ? void 0 : item.uuid));
            partes = externo ? ["externo", externo] : [texto(item === null || item === void 0 ? void 0 : item.nome).toLowerCase()];
        }
        else if (c === "carteiraHistorico")
            partes = [Number((item === null || item === void 0 ? void 0 : item.data) || 0), texto(item === null || item === void 0 ? void 0 : item.tipo), texto(item === null || item === void 0 ? void 0 : item.titulo), texto(item === null || item === void 0 ? void 0 : item.detalhe)];
        else if (c === "efeitosBatalha")
            partes = [texto(item === null || item === void 0 ? void 0 : item.origemId), texto(item === null || item === void 0 ? void 0 : item.nome), texto(item === null || item === void 0 ? void 0 : item.onlineEffectId), Number((item === null || item === void 0 ? void 0 : item.rodadaAtivacao) || 0), Number((item === null || item === void 0 ? void 0 : item.turnoAtivacao) || 0)];
        else
            partes = [serializar(comparavel(c, item))];
        return "idk_".concat(slug(c, 24, "item"), "_").concat(hash(serializar(partes))).slice(0, 180);
    }
    function gerarSufixoDeterministico(base, fp, usados, reservados) {
        var marcador = "__dup_".concat(fp);
        var candidato = limitarId(base, marcador), n = 2;
        while (usados.has(candidato) || reservados.has(candidato)) {
            candidato = limitarId(base, "".concat(marcador, "_").concat(n++));
        }
        return candidato;
    }
    function gerarSufixoCompativel(base, usados, reservados) {
        var raiz = texto(base).slice(0, 172) || "item";
        var n = 2, candidato = limitarId(raiz, "_".concat(n));
        while (usados.has(candidato) || reservados.has(candidato)) {
            n += 1;
            candidato = limitarId(raiz, "_".concat(n));
        }
        return candidato;
    }
    function garantirIds(itens, _a) {
        var _b = _a === void 0 ? {} : _a, colecao = _b.colecao, _c = _b.campo, campo = _c === void 0 ? campoId(colecao) : _c, _d = _b.legado, legado = _d === void 0 ? false : _d, gerarId = _b.gerarId;
        if (!Array.isArray(itens))
            return false;
        var c = texto(colecao), entradas = [];
        itens.forEach(function (item, indice) {
            if (!item || typeof item !== "object" || Array.isArray(item))
                return;
            var bruto = texto(item[campo]);
            var proposto = bruto ? normalizarIdExistente(c, bruto) : "";
            if (!proposto)
                proposto = legado ? idLegado(c, item) : (typeof gerarId === "function" ? texto(gerarId(item, indice)) : "");
            if (!proposto)
                proposto = "".concat(prefixo(c), "_").concat(hash("".concat(Date.now(), "\u241F").concat(indice, "\u241F").concat(Math.random())));
            proposto = normalizarIdExistente(c, proposto) || "".concat(prefixo(c), "_").concat(hash(proposto));
            entradas.push({
                item: item,
                indice: indice,
                bruto: bruto,
                proposto: proposto,
                fp: fingerprint(c, item), canon: serializar(comparavel(c, item)),
                existente: Boolean(bruto && idFirebaseSeguro(bruto))
            });
        });
        var grupos = new Map();
        entradas.forEach(function (e) { var grupo = grupos.get(e.proposto) || []; grupo.push(e); grupos.set(e.proposto, grupo); });
        var reservados = new Set(grupos.keys()), usados = new Set();
        var alterou = false;
        __spreadArray([], __read(grupos.keys()), false).sort().forEach(function (base) {
            var brutoGrupo = grupos.get(base).slice();
            var temIdExistente = brutoGrupo.some(function (entrada) { return entrada.existente; });
            var grupo = brutoGrupo.sort(function (a, b) {
                /* Compatibilidade: IDs válidos já persistidos não mudam por causa de
                   fingerprint/conteúdo. Em colisões históricas mantemos a ordem antiga
                   (_2, _3...) usada até a v99. Só itens ainda sem ID usam desempate
                   determinístico independente da ordem do array. */
                if (a.existente !== b.existente)
                    return a.existente ? -1 : 1;
                if (temIdExistente)
                    return a.indice - b.indice;
                return a.fp.localeCompare(b.fp) || a.canon.localeCompare(b.canon) || a.indice - b.indice;
            });
            grupo.forEach(function (entrada, pos) {
                var id;
                if (pos === 0 && !usados.has(base))
                    id = base;
                else if (entrada.existente)
                    id = gerarSufixoCompativel(base, usados, reservados);
                else
                    id = gerarSufixoDeterministico(base, entrada.fp, usados, reservados);
                if (entrada.item[campo] !== id) {
                    entrada.item[campo] = id;
                    alterou = true;
                }
                usados.add(id);
            });
        });
        return alterou;
    }
    return { texto: texto, slug: slug, hash: hash, idFirebaseSeguro: idFirebaseSeguro, campoId: campoId, normalizarIdExistente: normalizarIdExistente, idLegado: idLegado, fingerprint: fingerprint, identityKey: identityKey, garantirIds: garantirIds };
});
