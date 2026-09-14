/* EKO 2.5.8.75 — identidade permanente da personagem, independente do nome local. */
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

  return {resolveCharacterIdentity};
});
