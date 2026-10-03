/* GERADO AUTOMATICAMENTE — fonte: js/19-realtime-fields-utils.js — app 2.5.8.154. Não editar. */
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
/* EKO — utilitários puros para sincronização granular em tempo real. */
(function (root, factory) {
    var api = factory();
    if (typeof module !== "undefined" && module.exports)
        module.exports = api;
    if (root)
        root.EkoRealtimeFields = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
    "use strict";
    var CAMPOS_LOCAIS = new Set(["__online", "jutsusAbertos", "ataquesAbertos", "scrollTop"]);
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
    function serializar(valor) {
        if (valor === undefined)
            return "__eko_undefined__";
        try {
            return JSON.stringify(valor);
        }
        catch (_erro) {
            return String(valor);
        }
    }
    function camposAlterados(antes, depois) {
        var a = antes && typeof antes === "object" && !Array.isArray(antes) ? antes : {};
        var b = depois && typeof depois === "object" && !Array.isArray(depois) ? depois : {};
        var chaves = new Set(__spreadArray(__spreadArray([], __read(Object.keys(a)), false), __read(Object.keys(b)), false));
        return __spreadArray([], __read(chaves), false).filter(campoPermitido).filter(function (chave) {
            var valorA = normalizarValorParaNuvem(chave, a[chave]);
            var valorB = normalizarValorParaNuvem(chave, b[chave]);
            return serializar(valorA) !== serializar(valorB);
        }).sort();
    }
    function campoPermitido(nome) {
        var valor = String(nome == null ? "" : nome).trim();
        if (!valor || valor.length > 120)
            return false;
        return !CAMPOS_LOCAIS.has(valor);
    }
    function campoParaChave(nome) {
        return encodeURIComponent(String(nome == null ? "" : nome)).replace(/\./g, "%2E");
    }
    function chaveParaCampo(chave) {
        try {
            return decodeURIComponent(String(chave == null ? "" : chave));
        }
        catch (_erro) {
            return "";
        }
    }
    function compararVersoes(a, b) {
        var ea = Number((a === null || a === void 0 ? void 0 : a.editAt) || 0), eb = Number((b === null || b === void 0 ? void 0 : b.editAt) || 0);
        if (ea !== eb)
            return ea > eb ? 1 : -1;
        var oa = String((a === null || a === void 0 ? void 0 : a.opId) || ""), ob = String((b === null || b === void 0 ? void 0 : b.opId) || "");
        if (oa === ob)
            return 0;
        return oa > ob ? 1 : -1;
    }
    function semImagemLocalDeJutsu(item) {
        if (!item || typeof item !== "object" || Array.isArray(item))
            return clonar(item);
        var saida = __assign({}, item);
        delete saida.imagem;
        delete saida.imagemId;
        return saida;
    }
    function textoIdentidade(valor) {
        return String(valor == null ? "" : valor).trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
    function chavesIdentidadeJutsu(item) {
        if (!item || typeof item !== "object" || Array.isArray(item))
            return [];
        var chaves = [];
        ["catalogoId", "jutsuId", "id", "uuid"].forEach(function (campo) {
            var valor = textoIdentidade(item[campo]);
            if (valor)
                chaves.push("".concat(campo, ":").concat(valor));
        });
        var nome = textoIdentidade(item.nome);
        if (nome)
            chaves.push("nome:".concat(nome));
        return chaves;
    }
    function copiarImagemLocalJutsu(destino, origem) {
        if (!destino || typeof destino !== "object" || Array.isArray(destino) || !origem || typeof origem !== "object")
            return destino;
        if (Object.prototype.hasOwnProperty.call(origem, "imagem"))
            destino.imagem = origem.imagem;
        if (Object.prototype.hasOwnProperty.call(origem, "imagemId"))
            destino.imagemId = origem.imagemId;
        return destino;
    }
    function mesclarJutsusRemotos(remoto, local) {
        var remotos = Array.isArray(remoto) ? remoto.map(semImagemLocalDeJutsu) : [];
        var locais = Array.isArray(local) ? local : [];
        var usadosLocais = new Set();
        var correspondencias = new Map();
        var porChave = new Map();
        locais.forEach(function (item, indice) {
            chavesIdentidadeJutsu(item).forEach(function (chave) {
                var lista = porChave.get(chave) || [];
                lista.push(indice);
                porChave.set(chave, lista);
            });
        });
        remotos.forEach(function (item, indiceRemoto) {
            var e_1, _a;
            try {
                for (var _b = __values(chavesIdentidadeJutsu(item)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var chave = _c.value;
                    var candidatos = (porChave.get(chave) || []).filter(function (indice) { return !usadosLocais.has(indice); });
                    if (candidatos.length !== 1)
                        continue;
                    var indiceLocal = candidatos[0];
                    usadosLocais.add(indiceLocal);
                    correspondencias.set(indiceRemoto, indiceLocal);
                    break;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
        var remotosSemPar = remotos.map(function (_item, indice) { return indice; }).filter(function (indice) { return !correspondencias.has(indice); });
        var locaisComImagemSemPar = locais.map(function (item, indice) { return ({ item: item, indice: indice }); }).filter(function (_a) {
            var item = _a.item, indice = _a.indice;
            return !usadosLocais.has(indice) && item && typeof item === "object" && (Object.prototype.hasOwnProperty.call(item, "imagemId") ||
                Object.prototype.hasOwnProperty.call(item, "imagem"));
        });
        /* Uma única edição de nome deixa exatamente um jutsu sem correspondência.
           Nesse caso a posição lógica continua inequívoca e a capa local pode ser
           preservada sem correr o risco de anexá-la a outro jutsu. */
        if (remotosSemPar.length === 1 && locaisComImagemSemPar.length === 1) {
            correspondencias.set(remotosSemPar[0], locaisComImagemSemPar[0].indice);
        }
        return remotos.map(function (item, indice) {
            var indiceLocal = correspondencias.get(indice);
            return indiceLocal === undefined ? item : copiarImagemLocalJutsu(item, locais[indiceLocal]);
        });
    }
    function normalizarValorParaNuvem(nome, valor) {
        var copia = clonar(valor);
        if (nome === "jutsus" && Array.isArray(copia)) {
            return copia.map(semImagemLocalDeJutsu);
        }
        if (nome === "notasTopicos" && Array.isArray(copia)) {
            return copia.map(function (item) {
                if (!item || typeof item !== "object" || Array.isArray(item))
                    return item;
                var saida = __assign({}, item);
                delete saida.aberto;
                return saida;
            });
        }
        return copia;
    }
    function mesclarValorRemoto(nome, remoto, local) {
        var copia = clonar(remoto);
        if (nome === "jutsus" && Array.isArray(copia))
            return mesclarJutsusRemotos(copia, local);
        if (nome !== "notasTopicos" || !Array.isArray(copia))
            return copia;
        var locais = Array.isArray(local) ? local : [];
        var porId = new Map();
        locais.forEach(function (item, indice) {
            if (!item || typeof item !== "object")
                return;
            var id = String(item.id || "");
            if (id)
                porId.set("id:".concat(id), Boolean(item.aberto));
            porId.set("idx:".concat(indice, ":").concat(String(item.titulo || "")), Boolean(item.aberto));
        });
        return copia.map(function (item, indice) {
            if (!item || typeof item !== "object" || Array.isArray(item))
                return item;
            var id = String(item.id || "");
            var chaveId = id ? "id:".concat(id) : "";
            var chaveIndice = "idx:".concat(indice, ":").concat(String(item.titulo || ""));
            var aberto = chaveId && porId.has(chaveId) ? porId.get(chaveId) : (porId.has(chaveIndice) ? porId.get(chaveIndice) : false);
            return __assign(__assign({}, item), { aberto: aberto });
        });
    }
    return { camposAlterados: camposAlterados, campoPermitido: campoPermitido, campoParaChave: campoParaChave, chaveParaCampo: chaveParaCampo, compararVersoes: compararVersoes, normalizarValorParaNuvem: normalizarValorParaNuvem, mesclarValorRemoto: mesclarValorRemoto };
});
