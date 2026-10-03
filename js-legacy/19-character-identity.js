/* GERADO AUTOMATICAMENTE — fonte: js/19-character-identity.js — app 2.5.8.154. Não editar. */
/* EKO 2.5.8.80 — identidade permanente da personagem, independente do nome local. */
(function (root, factory) {
    var api = factory();
    if (typeof module !== "undefined" && module.exports)
        module.exports = api;
    if (root)
        root.EkoCharacterIdentity = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
    "use strict";
    function texto(valor) { return String(valor == null ? "" : valor).trim(); }
    function resolveCharacterIdentity(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.uid, uid = _c === void 0 ? "" : _c, _d = _b.name, name = _d === void 0 ? "Principal" : _d, _e = _b.characterId, characterId = _e === void 0 ? "" : _e, _f = _b.characterOwnerUid, characterOwnerUid = _f === void 0 ? "" : _f, _g = _b.realtimeId, realtimeId = _g === void 0 ? "" : _g, _h = _b.realtimeOwnerUid, realtimeOwnerUid = _h === void 0 ? "" : _h, deterministicId = _b.deterministicId;
        var conta = texto(uid);
        var nome = texto(name) || "Principal";
        var existente = texto(characterId);
        var donoCharacter = texto(characterOwnerUid);
        var rt = texto(realtimeId);
        var donoRt = texto(realtimeOwnerUid);
        var id = "", source = "generated";
        if (conta && existente && donoCharacter === conta) {
            id = existente;
            source = "character";
        }
        else if (conta && rt && donoRt === conta) {
            /* Migração sem mudar o caminho já usado no Firebase. */
            id = rt;
            source = "realtime-migration";
        }
        else if (conta && typeof deterministicId === "function") {
            /* O nome é apenas apresentação. A fábrica de identidade recebe somente
               a conta; o identificador estável da ficha deve ser fechado pelo caller
               (hoje: sheetId). Assim um nome reutilizado nunca reconecta personagem. */
            id = texto(deterministicId(conta));
        }
        return {
            characterId: id,
            characterOwnerUid: conta,
            realtimeId: id,
            realtimeOwnerUid: conta,
            source: source
        };
    }
    function donoDaIdentidade(online) {
        if (online === void 0) { online = {}; }
        return texto(online.characterOwnerUid) || texto(online.realtimeOwnerUid) || texto(online.ownerUid);
    }
    function idDaIdentidade(online) {
        if (online === void 0) { online = {}; }
        return texto(online.characterId) || texto(online.realtimeId);
    }
    function sameCharacterIdentity(a, b, uid) {
        if (a === void 0) { a = {}; }
        if (b === void 0) { b = {}; }
        if (uid === void 0) { uid = ""; }
        var conta = texto(uid);
        var idA = idDaIdentidade(a), idB = idDaIdentidade(b);
        if (!idA || !idB || idA !== idB)
            return false;
        var donoA = donoDaIdentidade(a), donoB = donoDaIdentidade(b);
        if (conta && donoA && donoA !== conta)
            return false;
        if (conta && donoB && donoB !== conta)
            return false;
        return true;
    }
    function resolveCloudCharacterIdentity(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.uid, uid = _c === void 0 ? "" : _c, _d = _b.name, name = _d === void 0 ? "Principal" : _d, _e = _b.online, online = _e === void 0 ? {} : _e, deterministicId = _b.deterministicId;
        var conta = texto(uid);
        var dados = online && typeof online === "object" ? online : {};
        var donoBackup = texto(dados.ownerUid);
        var donoCharacterExplicito = texto(dados.characterOwnerUid);
        var donoRealtimeExplicito = texto(dados.realtimeOwnerUid);
        var backupPodePertencerConta = !donoBackup || donoBackup === conta;
        var donoCharacter = donoCharacterExplicito || (texto(dados.characterId) && backupPodePertencerConta ? conta : "");
        var donoRealtime = donoRealtimeExplicito || (texto(dados.realtimeId) && backupPodePertencerConta ? conta : "");
        return resolveCharacterIdentity({
            uid: conta,
            name: name,
            characterId: texto(dados.characterId),
            characterOwnerUid: donoCharacter,
            realtimeId: texto(dados.realtimeId),
            realtimeOwnerUid: donoRealtime,
            deterministicId: deterministicId
        });
    }
    return { resolveCharacterIdentity: resolveCharacterIdentity, resolveCloudCharacterIdentity: resolveCloudCharacterIdentity, sameCharacterIdentity: sameCharacterIdentity };
});
