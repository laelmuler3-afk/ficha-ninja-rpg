/* EKO 2.5.8.88 — imagens entre dispositivos via Firebase Storage.
 * O arquivo fica no Storage; o Realtime Database transporta apenas metadados.
 * IndexedDB continua sendo o cache/local-first da interface.
 */
(function(root,factory){
  const emNode=typeof module!=="undefined"&&module.exports;
  const api=factory(root);
  if(emNode) module.exports=api.test;
  else api.install();
})(typeof window!=="undefined"?window:globalThis,function(root){
  "use strict";

  const CHAVE_OUTBOX_BASE="shinobi_image_cloud_outbox_v1";
  const CHAVE_VERSOES_BASE="shinobi_image_cloud_versions_v1";
  const CHAVE_DEVICE="shinobi_device_id_v1";
  const scriptsEmCarga=new Map();
  const filaSemConta=[];
  let processando=false;
  let reprocessar=false;
  let storagePromise=null;
  let listener=null;
  let timerAtivacao=0;

  function texto(v){return String(v==null?"":v).trim();}
  function agora(){return Date.now();}
  function idAleatorio(prefixo="img"){
    try{if(root?.crypto?.randomUUID)return `${prefixo}_${root.crypto.randomUUID().replace(/-/g,"")}`;}catch(_e){}
    return `${prefixo}_${agora().toString(36)}_${Math.random().toString(36).slice(2,12)}`;
  }
  function segmento(v){return encodeURIComponent(texto(v)).replace(/\./g,"%2E");}
  function alvoNormalizado(alvo){
    const type=texto(alvo?.type);
    if(type==="avatar"||type==="profile-cover")return {type};
    if(type==="jutsu-cover"&&texto(alvo?.jutsuId))return {type,jutsuId:texto(alvo.jutsuId)};
    return null;
  }
  function mediaKey(alvo){
    const a=alvoNormalizado(alvo);
    if(!a)return "";
    return a.type==="jutsu-cover"?`jutsu:${a.jutsuId}`:a.type;
  }
  function storagePath(uid,characterId,alvo){
    const a=alvoNormalizado(alvo),u=segmento(uid),c=segmento(characterId);
    if(!a||!u||!c)return "";
    if(a.type==="avatar")return `users/${u}/characters/${c}/avatar/current.webp`;
    if(a.type==="profile-cover")return `users/${u}/characters/${c}/profile-cover/current.webp`;
    return `users/${u}/characters/${c}/jutsus/${segmento(a.jutsuId)}/cover.webp`;
  }
  function metadataPath(uid,characterId,alvo){
    const a=alvoNormalizado(alvo),u=segmento(uid),c=segmento(characterId);
    if(!a||!u||!c)return "";
    if(a.type==="avatar")return `sheetMedia/${u}/${c}/avatar`;
    if(a.type==="profile-cover")return `sheetMedia/${u}/${c}/profile-cover`;
    return `sheetMedia/${u}/${c}/jutsus/${segmento(a.jutsuId)}`;
  }
  function criarOperacaoPura({uid="",characterId="",sheetName="Principal",target,imageId="",deleted=false,version="",createdAt=0,ownerUid=""}={}){
    const alvo=alvoNormalizado(target);
    return {
      uid:texto(uid),characterId:texto(characterId),sheetName:texto(sheetName)||"Principal",
      target:alvo,imageId:texto(imageId),deleted:deleted===true,
      version:texto(version)||idAleatorio("img"),createdAt:Number(createdAt||agora()),ownerUid:texto(ownerUid)
    };
  }
  function deveAplicarRemoto({pending=false,remoteVersion="",localVersion=""}={}){
    if(pending)return false;
    const remoto=texto(remoteVersion),local=texto(localVersion);
    if(!remoto)return false;
    return remoto!==local;
  }

  function usuarioAtual(){
    const snap=root.ShinobiOnline?.snapshot?.();
    const user=snap?.user;
    return user&&!user.anonymous&&texto(user.uid)?user:null;
  }
  function deviceId(){
    let id="";
    try{id=root.localStorage?.getItem(CHAVE_DEVICE)||"";}catch(_e){}
    if(!id){id=idAleatorio("device");try{root.localStorage?.setItem(CHAVE_DEVICE,id);}catch(_e){}}
    return id;
  }
  function chaveConta(base,uid){return `${base}__${texto(uid)}`;}
  function lerJson(chave,padrao={}){try{return JSON.parse(root.localStorage?.getItem(chave)||"")||padrao;}catch(_e){return padrao;}}
  function salvarJson(chave,valor){try{root.localStorage?.setItem(chave,JSON.stringify(valor));}catch(_e){}}
  function lerOutbox(uid){return lerJson(chaveConta(CHAVE_OUTBOX_BASE,uid),{});}
  function gravarOutbox(uid,valor){salvarJson(chaveConta(CHAVE_OUTBOX_BASE,uid),valor||{});}
  function lerVersoes(uid){return lerJson(chaveConta(CHAVE_VERSOES_BASE,uid),{});}
  function gravarVersoes(uid,valor){salvarJson(chaveConta(CHAVE_VERSOES_BASE,uid),valor||{});}
  function versaoLocal(uid,characterId,alvo){return texto(lerVersoes(uid)?.[characterId]?.[mediaKey(alvo)]?.version);}
  function registrarVersao(uid,characterId,alvo,version){
    const dados=lerVersoes(uid);dados[characterId]=dados[characterId]||{};
    dados[characterId][mediaKey(alvo)]={version:texto(version),appliedAt:agora()};
    gravarVersoes(uid,dados);
  }
  function temPendencia(uid,characterId,alvo){
    const op=lerOutbox(uid)?.[`${characterId}::${mediaKey(alvo)}`];
    return Boolean(op);
  }
  function identidadePara(sheetName){
    const user=usuarioAtual();if(!user)return null;
    const ficha=root.ShinobiOnline?.garantirIdentidadeFichaRealtime?.(sheetName);
    const characterId=texto(ficha?.characterId||ficha?.data?.__online?.characterId||ficha?.realtimeId);
    if(!characterId)return null;
    const owner=texto(ficha?.data?.__online?.characterOwnerUid||ficha?.data?.__online?.realtimeOwnerUid);
    if(owner&&owner!==texto(user.uid))return null;
    return {uid:texto(user.uid),characterId,sheetName:texto(ficha?.name||sheetName)||"Principal"};
  }

  function carregarScript(url,timeoutMs=18000){
    if(scriptsEmCarga.has(url))return scriptsEmCarga.get(url);
    const promessa=new Promise((resolve,reject)=>{
      const existente=[...(root.document?.scripts||[])].find(s=>s.src===url);
      if(existente?.dataset?.shinobiLoaded==="true")return resolve(url);
      const script=existente||root.document?.createElement?.("script");
      if(!script)return reject(new Error("Documento indisponível para carregar Firebase Storage."));
      const timer=root.setTimeout(()=>{if(!existente)script.remove?.();reject(new Error("Tempo esgotado ao carregar Firebase Storage."));},Math.max(5000,Number(timeoutMs)||18000));
      script.async=true;script.src=url;script.dataset.shinobiFirebase="true";
      script.onload=()=>{root.clearTimeout(timer);script.dataset.shinobiLoaded="true";resolve(url);};
      script.onerror=()=>{root.clearTimeout(timer);if(!existente)script.remove?.();reject(new Error("Não foi possível carregar Firebase Storage."));};
      if(!existente)root.document.head.appendChild(script);
    }).finally(()=>scriptsEmCarga.delete(url));
    scriptsEmCarga.set(url,promessa);return promessa;
  }
  async function carregarStorage(){
    if(root.firebase?.storage)return root.firebase.app().storage();
    if(storagePromise)return storagePromise;
    storagePromise=(async()=>{
      const opcoes=root.SHINOBI_FIREBASE_OPTIONS||{},versao=opcoes.sdkVersion||"12.16.0";
      const fontes=Array.isArray(opcoes.sdkSources)&&opcoes.sdkSources.length?opcoes.sdkSources:[`https://www.gstatic.com/firebasejs/${versao}`,`https://cdn.jsdelivr.net/npm/firebase@${versao}`];
      let ultimoErro=null;
      for(const baseBruta of fontes){
        const base=String(baseBruta||"").replace(/\/$/,"");
        try{
          await carregarScript(`${base}/firebase-storage-compat.js`,opcoes.sdkTimeoutMs||18000);
          if(root.firebase?.storage)return root.firebase.app().storage();
        }catch(erro){ultimoErro=erro;console.warn("Firebase Storage indisponível nesta fonte:",base,erro?.message||erro);}
      }
      throw ultimoErro||new Error("Firebase Storage indisponível.");
    })().catch(erro=>{storagePromise=null;throw erro;});
    return storagePromise;
  }
  function banco(){try{return root.firebase?.app?.().database?.()||null;}catch(_e){return null;}}

  async function enviarOperacao(op){
    const user=usuarioAtual();if(!user||texto(user.uid)!==texto(op.uid))throw new Error("Conta Google indisponível para enviar imagem.");
    if(root.navigator?.onLine===false)throw new Error("offline");
    const storage=await carregarStorage();
    const db=banco();if(!db)throw new Error("Realtime Database indisponível para metadados da imagem.");
    const alvo=alvoNormalizado(op.target),path=storagePath(op.uid,op.characterId,alvo),metaPath=metadataPath(op.uid,op.characterId,alvo);
    if(!alvo||!path||!metaPath)throw new Error("Destino de imagem inválido.");
    const refStorage=storage.ref(path);
    if(op.deleted){
      try{await refStorage.delete();}catch(erro){if(!/object-not-found/i.test(texto(erro?.code)||texto(erro?.message)))throw erro;}
    }else{
      const blob=await root.ShinobiImagensLocal?.obterBlob?.(op.imageId);
      if(!blob)throw new Error("Imagem local não encontrada para upload.");
      await refStorage.put(blob,{contentType:blob.type||"image/webp",customMetadata:{ekoVersion:op.version}});
    }
    const registro={
      kind:alvo.type,path,version:op.version,deleted:op.deleted===true,
      updatedAt:root.firebase.database.ServerValue.TIMESTAMP,deviceId:deviceId()
    };
    if(alvo.type==="jutsu-cover")registro.jutsuId=alvo.jutsuId;
    await db.ref(metaPath).set(registro);
    registrarVersao(op.uid,op.characterId,alvo,op.version);
    const outbox=lerOutbox(op.uid),chave=`${op.characterId}::${mediaKey(alvo)}`;
    if(texto(outbox[chave]?.version)===texto(op.version)){delete outbox[chave];gravarOutbox(op.uid,outbox);}
    return {ok:true,record:registro};
  }

  async function processarOutbox(){
    if(processando){reprocessar=true;return {busy:true};}
    const user=usuarioAtual();if(!user||root.navigator?.onLine===false)return {skipped:true};
    processando=true;const resultados=[];
    try{
      const ops=Object.values(lerOutbox(user.uid)).filter(op=>op&&texto(op.uid)===texto(user.uid)&&alvoNormalizado(op.target));
      ops.sort((a,b)=>Number(a.createdAt||0)-Number(b.createdAt||0));
      for(const op of ops){try{resultados.push(await enviarOperacao(op));}catch(erro){resultados.push({ok:false,error:erro,op});}}
    }finally{
      processando=false;if(reprocessar){reprocessar=false;root.setTimeout(()=>processarOutbox().catch(()=>{}),0);}
    }
    return {ok:resultados.every(r=>r.ok!==false),resultados};
  }

  function enfileirarDetalhe(detalhe){
    const alvo=alvoNormalizado(detalhe?.target);if(!alvo)return {skipped:true,reason:"alvo-invalido"};
    const user=usuarioAtual();
    if(!user){filaSemConta.push({...detalhe,target:alvo});return {queued:true,waitingAuth:true};}
    const ownerUid=texto(detalhe?.ownerUid);
    if(ownerUid&&ownerUid!==texto(user.uid))return {skipped:true,reason:"outra-conta"};
    const identidade=identidadePara(detalhe?.sheetName);
    if(!identidade)return {skipped:true,reason:"sem-identidade"};
    const op=criarOperacaoPura({
      uid:identidade.uid,characterId:identidade.characterId,sheetName:identidade.sheetName,target:alvo,
      imageId:detalhe?.imageId,deleted:detalhe?.deleted===true,version:idAleatorio("img"),createdAt:detalhe?.savedAt||agora(),ownerUid:identidade.uid
    });
    const outbox=lerOutbox(op.uid);outbox[`${op.characterId}::${mediaKey(alvo)}`]=op;gravarOutbox(op.uid,outbox);
    if(root.navigator?.onLine!==false)root.setTimeout(()=>processarOutbox().catch(()=>{}),0);
    ativarObservador(identidade.sheetName).catch(()=>{});
    return {queued:true,op};
  }
  function drenarFilaSemConta(){
    if(!usuarioAtual()||!filaSemConta.length)return;
    const fila=filaSemConta.splice(0,filaSemConta.length);fila.forEach(item=>enfileirarDetalhe(item));
  }

  async function baixarBlob(path){
    const storage=await carregarStorage(),ref=storage.ref(path);
    if(typeof ref.getBlob==="function")return ref.getBlob();
    const url=await ref.getDownloadURL();
    const resposta=await fetch(url,{cache:"no-store"});
    if(!resposta.ok)throw new Error(`Falha ao baixar imagem (${resposta.status}).`);
    return resposta.blob();
  }
  async function aplicarRegistro(uid,characterId,alvo,registro){
    if(!registro||typeof registro!=="object")return;
    const version=texto(registro.version);if(!version)return;
    if(temPendencia(uid,characterId,alvo))return;
    const localVersion=versaoLocal(uid,characterId,alvo);
    if(!deveAplicarRemoto({pending:false,remoteVersion:version,localVersion})){
      return;
    }
    if(registro.deleted===true){
      const aplicado=await root.ShinobiImagensLocal?.aplicarRemota?.({target:alvo,deleted:true,version});
      if(aplicado!==false)registrarVersao(uid,characterId,alvo,version);
      return;
    }
    const esperado=storagePath(uid,characterId,alvo);
    if(texto(registro.path)!==esperado)return;
    const blob=await baixarBlob(esperado);
    const aplicado=await root.ShinobiImagensLocal?.aplicarRemota?.({target:alvo,blob,deleted:false,version});
    if(aplicado!==false)registrarVersao(uid,characterId,alvo,version);
  }
  async function aplicarSnapshot(uid,characterId,valor){
    const tarefas=[];
    if(valor?.avatar)tarefas.push(aplicarRegistro(uid,characterId,{type:"avatar"},valor.avatar));
    if(valor?.["profile-cover"])tarefas.push(aplicarRegistro(uid,characterId,{type:"profile-cover"},valor["profile-cover"]));
    Object.values(valor?.jutsus||{}).forEach(reg=>{
      const jutsuId=texto(reg?.jutsuId);if(jutsuId)tarefas.push(aplicarRegistro(uid,characterId,{type:"jutsu-cover",jutsuId},reg));
    });
    await Promise.all(tarefas);
  }
  function desconectar(){
    if(listener){try{listener.ref.off("value",listener.callback);}catch(_e){}listener=null;}
  }
  async function ativarObservador(sheetName=""){
    const identidade=identidadePara(sheetName);if(!identidade){desconectar();return {skipped:true};}
    if(listener&&listener.uid===identidade.uid&&listener.characterId===identidade.characterId)return {ok:true};
    desconectar();
    const db=banco();if(!db)return {skipped:true,reason:"sem-db"};
    const ref=db.ref(`sheetMedia/${segmento(identidade.uid)}/${segmento(identidade.characterId)}`);
    const callback=snap=>{aplicarSnapshot(identidade.uid,identidade.characterId,snap.val()||{}).catch(erro=>console.warn("Falha ao aplicar imagem remota.",erro));};
    ref.on("value",callback,erro=>console.warn("Metadados de imagens indisponíveis.",erro?.code||erro?.message||erro));
    listener={uid:identidade.uid,characterId:identidade.characterId,ref,callback};
    return {ok:true};
  }
  function agendarAtivacao(){root.clearTimeout(timerAtivacao);timerAtivacao=root.setTimeout(()=>{drenarFilaSemConta();ativarObservador().catch(()=>{});processarOutbox().catch(()=>{});},120);}
  function reaplicarSnapshotAtual(){
    if(!listener?.ref?.once)return Promise.resolve({skipped:true});
    return listener.ref.once("value").then(snap=>aplicarSnapshot(listener.uid,listener.characterId,snap.val()||{}));
  }

  function install(){
    if(root.__ekoImageStorageSyncV1)return root.ShinobiImageCloud;
    root.__ekoImageStorageSyncV1=true;
    const apiPublica={enfileirarEvento:enfileirarDetalhe,processarPendencias:processarOutbox,ativarObservador};
    root.ShinobiImageCloud=Object.freeze(apiPublica);
    root.addEventListener("shinobi:imagem-confirmada",evento=>enfileirarDetalhe(evento?.detail||{}));
    root.addEventListener("shinobi:online:auth",agendarAtivacao);
    root.addEventListener("shinobi:online:pronto",agendarAtivacao);
    root.addEventListener("online",()=>{agendarAtivacao();},{passive:true});
    root.addEventListener("shinobi:realtime-colecao-aplicada",evento=>{
      if(texto(evento?.detail?.collection)==="jutsus")reaplicarSnapshotAtual().catch(()=>{});
    });
    root.addEventListener("pagehide",desconectar);
    agendarAtivacao();
    return apiPublica;
  }

  return {
    install,
    test:{mediaKey,storagePath,metadataPath,criarOperacaoPura,deveAplicarRemoto,alvoNormalizado}
  };
});
