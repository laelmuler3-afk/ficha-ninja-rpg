/* GERADO AUTOMATICAMENTE — fonte: js/19-backup-manager-utils.js — app 2.5.8.154. Não editar. */
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
/* Shinobi — utilitários puros do gerenciador de backups históricos. */
(function (root, factory) {
    var api = factory();
    if (typeof module !== "undefined" && module.exports)
        module.exports = api;
    if (root)
        root.ShinobiBackupUtils = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
    "use strict";
    var CAMPOS_LOCAIS_PRESERVADOS = ["scrollTop", "jutsusAbertos", "ataquesAbertos", "avatarNinja", "avatarNinjaId", "perfilFundoImagem", "perfilFundoImagemId"];
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
    function texto(valor) { return String(valor == null ? "" : valor).trim(); }
    function dayKeyLocal(timestamp) {
        if (timestamp === void 0) { timestamp = Date.now(); }
        var data = new Date(Number(timestamp) || Date.now());
        var ano = data.getFullYear();
        var mes = String(data.getMonth() + 1).padStart(2, "0");
        var dia = String(data.getDate()).padStart(2, "0");
        return "".concat(ano, "-").concat(mes, "-").concat(dia);
    }
    function normalizarBackups(valor) {
        var objeto = valor && typeof valor === "object" && !Array.isArray(valor) ? valor : {};
        return Object.entries(objeto).map(function (_a) {
            var _b = __read(_a, 2), id = _b[0], item = _b[1];
            return ({
                id: texto(id),
                name: texto(item === null || item === void 0 ? void 0 : item.name) || "Ficha",
                characterName: texto(item === null || item === void 0 ? void 0 : item.characterName),
                revision: Number((item === null || item === void 0 ? void 0 : item.revision) || 0),
                createdAt: Number((item === null || item === void 0 ? void 0 : item.createdAt) || 0),
                reason: texto(item === null || item === void 0 ? void 0 : item.reason) || "manual",
                type: texto(item === null || item === void 0 ? void 0 : item.type) || "",
                dayKey: texto(item === null || item === void 0 ? void 0 : item.dayKey),
                appVersion: texto(item === null || item === void 0 ? void 0 : item.appVersion),
                sourceDeviceId: texto(item === null || item === void 0 ? void 0 : item.sourceDeviceId),
                data: (item === null || item === void 0 ? void 0 : item.data) && typeof item.data === "object" && !Array.isArray(item.data) ? item.data : null
            });
        }).filter(function (item) { return item.id; }).sort(function (a, b) { return b.createdAt - a.createdAt || b.id.localeCompare(a.id); });
    }
    function temBackupDiarioDoDia(valor, dayKey) {
        if (dayKey === void 0) { dayKey = dayKeyLocal(); }
        var chave = texto(dayKey);
        return normalizarBackups(valor).some(function (item) { return item.dayKey === chave && (item.type === "daily" || item.reason === "automatico-diario"); });
    }
    function ehBackupSeguranca(item) {
        return Boolean(item && (item.type === "safety" || item.reason === "antes-restaurar-historico"));
    }
    function separarBackups(valor) {
        var lista = normalizarBackups(valor);
        var historicos = lista.filter(function (item) { return !ehBackupSeguranca(item); });
        var segurancas = lista.filter(ehBackupSeguranca);
        return { historicos: historicos, seguranca: segurancas[0] || null, segurancas: segurancas };
    }
    function idsSegurancaLegadosParaRemover(valor, manterId) {
        if (manterId === void 0) { manterId = "safety_latest"; }
        var manter = texto(manterId);
        return normalizarBackups(valor)
            .filter(function (item) { return ehBackupSeguranca(item) && item.id !== manter; })
            .map(function (item) { return item.id; });
    }
    function idsParaRemoverPorRetencao(valor, limite, protegerIds) {
        var e_1, _a;
        if (limite === void 0) { limite = 3; }
        if (protegerIds === void 0) { protegerIds = []; }
        var max = Math.max(1, Number(limite) || 3);
        var lista = separarBackups(valor).historicos;
        var proteger = new Set((Array.isArray(protegerIds) ? protegerIds : []).map(texto).filter(Boolean));
        var manter = new Set();
        lista.forEach(function (item) { if (proteger.has(item.id))
            manter.add(item.id); });
        try {
            for (var lista_1 = __values(lista), lista_1_1 = lista_1.next(); !lista_1_1.done; lista_1_1 = lista_1.next()) {
                var item = lista_1_1.value;
                if (manter.size >= max)
                    break;
                manter.add(item.id);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (lista_1_1 && !lista_1_1.done && (_a = lista_1.return)) _a.call(lista_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return lista.filter(function (item) { return !manter.has(item.id); }).map(function (item) { return item.id; });
    }
    function idsParaLimpezaGerenciador(valor, limite, protegerIds) {
        var _a;
        if (limite === void 0) { limite = 3; }
        if (protegerIds === void 0) { protegerIds = []; }
        var grupos = separarBackups(valor);
        var removerHistoricos = idsParaRemoverPorRetencao(valor, limite, protegerIds);
        var manterSeguranca = texto((_a = grupos.seguranca) === null || _a === void 0 ? void 0 : _a.id);
        var removerSafeties = manterSeguranca ? idsSegurancaLegadosParaRemover(valor, manterSeguranca) : [];
        return __spreadArray([], __read(new Set(__spreadArray(__spreadArray([], __read(removerHistoricos), false), __read(removerSafeties), false))), false);
    }
    function mensagemErroRestauracao(etapa, detalhe) {
        if (detalhe === void 0) { detalhe = ""; }
        var info = texto(detalhe) || "Não foi possível concluir esta etapa.";
        var prefixos = {
            leitura: "Não foi possível ler o backup escolhido.",
            preflight: "Não há espaço local suficiente para iniciar a restauração com segurança.",
            seguranca: "Não foi possível criar o backup de segurança antes da restauração.",
            realtime: "Não foi possível aplicar a versão escolhida na sincronização.",
            local: "A versão chegou à sincronização, mas não foi possível aplicá-la neste aparelho."
        };
        return "".concat(prefixos[texto(etapa)] || "Não foi possível concluir a restauração.", " ").concat(info).trim();
    }
    function calcularReservaPersistenciaLocal(serializadoNovo, serializadoAtual) {
        if (serializadoAtual === void 0) { serializadoAtual = ""; }
        var novo = typeof serializadoNovo === "string" ? serializadoNovo : JSON.stringify(serializadoNovo !== null && serializadoNovo !== void 0 ? serializadoNovo : null);
        var atual = typeof serializadoAtual === "string" ? serializadoAtual : "";
        var delta = Math.max(0, novo.length - atual.length);
        if (delta <= 0)
            return { tamanhoNovo: novo.length, tamanhoAtual: atual.length, delta: 0, reserva: 0, margem: 0 };
        /* A reserva reproduz o crescimento que acontecerá ao substituir a ficha e
           mantém uma pequena margem para metadados do navegador/outras chaves. */
        var margem = Math.max(4096, Math.min(65536, Math.ceil(delta * 0.05)));
        return { tamanhoNovo: novo.length, tamanhoAtual: atual.length, delta: delta, reserva: delta + margem, margem: margem };
    }
    function prepararSnapshotRestaurado(dadosBackup, dadosAtual) {
        var backup = dadosBackup && typeof dadosBackup === "object" && !Array.isArray(dadosBackup) ? clonar(dadosBackup) : {};
        var atual = dadosAtual && typeof dadosAtual === "object" && !Array.isArray(dadosAtual) ? dadosAtual : {};
        backup.__online = clonar(atual.__online && typeof atual.__online === "object" ? atual.__online : {});
        CAMPOS_LOCAIS_PRESERVADOS.forEach(function (campo) {
            if (Object.prototype.hasOwnProperty.call(atual, campo))
                backup[campo] = clonar(atual[campo]);
            else
                delete backup[campo];
        });
        var atuaisJutsus = Array.isArray(atual.jutsus) ? atual.jutsus : [];
        if (Array.isArray(backup.jutsus) && atuaisJutsus.length) {
            var chave_1 = function (item) { return texto((item === null || item === void 0 ? void 0 : item.jutsuId) || (item === null || item === void 0 ? void 0 : item.catalogoId) || (item === null || item === void 0 ? void 0 : item.id) || (item === null || item === void 0 ? void 0 : item.uuid) || (item === null || item === void 0 ? void 0 : item.nome)).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); };
            var porChave_1 = new Map(atuaisJutsus.map(function (item) { return [chave_1(item), item]; }).filter(function (_a) {
                var _b = __read(_a, 1), k = _b[0];
                return k;
            }));
            backup.jutsus = backup.jutsus.map(function (item) {
                var copia = clonar(item);
                var local = porChave_1.get(chave_1(item));
                if (local) {
                    if (Object.prototype.hasOwnProperty.call(local, "imagem"))
                        copia.imagem = local.imagem;
                    else
                        delete copia.imagem;
                    if (Object.prototype.hasOwnProperty.call(local, "imagemId"))
                        copia.imagemId = local.imagemId;
                    else
                        delete copia.imagemId;
                }
                else {
                    delete copia.imagem;
                    delete copia.imagemId;
                }
                return copia;
            });
        }
        return backup;
    }
    return { dayKeyLocal: dayKeyLocal, normalizarBackups: normalizarBackups, temBackupDiarioDoDia: temBackupDiarioDoDia, ehBackupSeguranca: ehBackupSeguranca, separarBackups: separarBackups, idsSegurancaLegadosParaRemover: idsSegurancaLegadosParaRemover, idsParaRemoverPorRetencao: idsParaRemoverPorRetencao, idsParaLimpezaGerenciador: idsParaLimpezaGerenciador, mensagemErroRestauracao: mensagemErroRestauracao, calcularReservaPersistenciaLocal: calcularReservaPersistenciaLocal, prepararSnapshotRestaurado: prepararSnapshotRestaurado };
});
