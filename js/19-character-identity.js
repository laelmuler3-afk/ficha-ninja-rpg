/* EKO 2.5.8.80 — identidade permanente da personagem, independente do nome local. */
(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  if(root) root.EkoCharacterIdentity=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";

  function texto(valor){return String(valor==null?"":valor).trim();}

  function resolveCharacterIdentity({
    uid="",name="Principal",characterId="",characterOwnerUid="",
    realtimeId="",realtimeOwnerUid="",deterministicId
  }={}){
    const conta=texto(uid);
    const nome=texto(name)||"Principal";
    const existente=texto(characterId);
    const donoCharacter=texto(characterOwnerUid);
    const rt=texto(realtimeId);
    const donoRt=texto(realtimeOwnerUid);
    let id="",source="generated";

    if(conta&&existente&&donoCharacter===conta){
      id=existente;
      source="character";
    }else if(conta&&rt&&donoRt===conta){
      /* Migração sem mudar o caminho já usado no Firebase. */
      id=rt;
      source="realtime-migration";
    }else if(conta&&typeof deterministicId==="function"){
      id=texto(deterministicId(conta,nome));
    }

    return {
      characterId:id,
      characterOwnerUid:conta,
      realtimeId:id,
      realtimeOwnerUid:conta,
      source
    };
  }

  function donoDaIdentidade(online={}){
    return texto(online.characterOwnerUid)||texto(online.realtimeOwnerUid)||texto(online.ownerUid);
  }

  function idDaIdentidade(online={}){
    return texto(online.characterId)||texto(online.realtimeId);
  }

  function sameCharacterIdentity(a={},b={},uid=""){
    const conta=texto(uid);
    const idA=idDaIdentidade(a),idB=idDaIdentidade(b);
    if(!idA||!idB||idA!==idB) return false;
    const donoA=donoDaIdentidade(a),donoB=donoDaIdentidade(b);
    if(conta&&donoA&&donoA!==conta) return false;
    if(conta&&donoB&&donoB!==conta) return false;
    return true;
  }

  function resolveCloudCharacterIdentity({uid="",name="Principal",online={},deterministicId}={}){
    const conta=texto(uid);
    const dados=online&&typeof online==="object"?online:{};
    const donoBackup=texto(dados.ownerUid);
    const donoCharacterExplicito=texto(dados.characterOwnerUid);
    const donoRealtimeExplicito=texto(dados.realtimeOwnerUid);
    const backupPodePertencerConta=!donoBackup||donoBackup===conta;

    const donoCharacter=donoCharacterExplicito||(
      texto(dados.characterId)&&backupPodePertencerConta?conta:""
    );
    const donoRealtime=donoRealtimeExplicito||(
      texto(dados.realtimeId)&&backupPodePertencerConta?conta:""
    );

    return resolveCharacterIdentity({
      uid:conta,
      name,
      characterId:texto(dados.characterId),
      characterOwnerUid:donoCharacter,
      realtimeId:texto(dados.realtimeId),
      realtimeOwnerUid:donoRealtime,
      deterministicId
    });
  }

  return {resolveCharacterIdentity,resolveCloudCharacterIdentity,sameCharacterIdentity};
});
