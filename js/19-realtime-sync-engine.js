/* EKO — sincronização granular de ficha entre dispositivos da mesma Conta Google. */
(function(){
  "use strict";
  if(window.__ekoRealtimeSyncEngineV1) return;
  window.__ekoRealtimeSyncEngineV1=true;

  const CHAVE_OUTBOX_BASE="shinobi_field_outbox_v1";
  const CHAVE_VERSOES_BASE="shinobi_field_versions_v1";
  const CHAVE_SERVER_OFFSET="shinobi_server_time_offset_v1";
  const SCHEMA_VERSION=1;
  const util=window.EkoRealtimeFields;
  const offsetInicial=Number(localStorage.getItem(CHAVE_SERVER_OFFSET));
  const estadoRT={
    uid:"",
    db:null,
    serverOffset:Number.isFinite(offsetInicial)?offsetInicial:0,
    serverOffsetKnown:Number.isFinite(offsetInicial),
    unsubscribeOffset:null,
    listeners:new Map(),
    initPromises:new Map(),
    processando:false,
    reprocessar:false,
    timerGarantia:null
  };

  function texto(v){return String(v==null?"":v).trim();}
  function clonar(v){if(v==null)return v;try{return structuredClone(v);}catch(_e){return JSON.parse(JSON.stringify(v));}}
  function agora(){return Date.now();}
  function idAleatorio(prefixo="op"){
    if(window.crypto?.randomUUID) return `${prefixo}_${crypto.randomUUID().replace(/-/g,"")}`;
    return `${prefixo}_${agora().toString(36)}_${Math.random().toString(36).slice(2,12)}`;
  }
  function uidAtual(){
    const u=window.ShinobiOnline?.snapshot?.()?.user;
    return u&&!u.anonymous?texto(u.uid):"";
  }
  function deviceId(){
    const chave="shinobi_device_id_v1";
    let id=localStorage.getItem(chave);
    if(!id){id=idAleatorio("device");localStorage.setItem(chave,id);}
    return id;
  }
  function chaveConta(base,uid=uidAtual()){return uid?`${base}__${uid}`:"";}
  function lerJson(chave,padrao={}){try{const v=JSON.parse(localStorage.getItem(chave)||"");return v??padrao;}catch(_e){return padrao;}}
  function salvarJson(chave,valor){if(chave)localStorage.setItem(chave,JSON.stringify(valor));}
  function outbox(uid=uidAtual()){return lerJson(chaveConta(CHAVE_OUTBOX_BASE,uid),{});}
  function salvarOutbox(v,uid=uidAtual()){salvarJson(chaveConta(CHAVE_OUTBOX_BASE,uid),v||{});}
  function versoes(uid=uidAtual()){return lerJson(chaveConta(CHAVE_VERSOES_BASE,uid),{});}
  function salvarVersoes(v,uid=uidAtual()){salvarJson(chaveConta(CHAVE_VERSOES_BASE,uid),v||{});}
  function chaveOperacao(sheetId,campo){return `${texto(sheetId)}::${util.campoParaChave(campo)}`;}
  function timestampEdicao(){return agora()+(estadoRT.serverOffsetKnown?Number(estadoRT.serverOffset||0):0);}

  function hashLeve(valor){
    const str=typeof valor==="string"?valor:JSON.stringify(valor);
    let hash=2166136261;
    for(let i=0;i<str.length;i+=1){hash^=str.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return (hash>>>0).toString(16).padStart(8,"0");
  }
  function hashFicha(dados){
    const copia=clonar(dados||{});
    if(copia&&typeof copia==="object") delete copia.__online;
    return hashLeve(copia);
  }

  function banco(){
    try{
      if(estadoRT.db) return estadoRT.db;
      if(!window.firebase?.apps?.length) return null;
      estadoRT.db=window.firebase.app().database();
      return estadoRT.db;
    }catch(_e){return null;}
  }

  function fichasLocais(){
    try{return window.ShinobiOnline?.listarFichasSincronizaveis?.()||[];}catch(_e){return [];}
  }
  function fichaPorId(sheetId){return fichasLocais().find(f=>texto(f.sheetId)===texto(sheetId))||null;}
  function fichaPorNome(nome){return fichasLocais().find(f=>f.name===nome)||null;}

  function registrarVersao(sheetId,campo,registro,uid=uidAtual()){
    if(!uid||!sheetId||!campo||!registro) return;
    const todos=versoes(uid);
    todos[sheetId]=todos[sheetId]&&typeof todos[sheetId]==="object"?todos[sheetId]:{};
    todos[sheetId][util.campoParaChave(campo)]={editAt:Number(registro.editAt||0),opId:texto(registro.opId)};
    salvarVersoes(todos,uid);
  }
  function versaoAplicada(sheetId,campo,uid=uidAtual()){
    return versoes(uid)?.[sheetId]?.[util.campoParaChave(campo)]||null;
  }

  function adicionarOutbox(op,uid=uidAtual()){
    if(!uid||!op?.sheetId||!op?.name) return;
    const todos=outbox(uid);
    todos[chaveOperacao(op.sheetId,op.name)]=op;
    salvarOutbox(todos,uid);
  }
  function removerOutbox(op,uid=uidAtual()){
    if(!uid||!op?.sheetId||!op?.name) return;
    const todos=outbox(uid),chave=chaveOperacao(op.sheetId,op.name);
    if(!todos[chave]) return;
    if(op.opId&&texto(todos[chave].opId)!==texto(op.opId)) return;
    delete todos[chave];
    salvarOutbox(todos,uid);
  }
  function operacaoPendente(sheetId,campo,uid=uidAtual()){
    return outbox(uid)[chaveOperacao(sheetId,campo)]||null;
  }
  function temPendencias(sheetId="",uid=uidAtual()){
    const id=texto(sheetId);
    return Object.values(outbox(uid)).some(op=>!id||texto(op?.sheetId)===id);
  }

  function atualizarStatusPendente(sheetId,motivo){
    try{window.ShinobiOnline?.registrarSyncGranularPendente?.(sheetId,texto(motivo)||"alteracao-granular");}catch(_e){}
  }
  function confirmarStatusSeLimpo(sheetId,data,serverUpdatedAt=0){
    if(temPendencias(sheetId)) return;
    try{window.ShinobiOnline?.confirmarSyncGranular?.(sheetId,hashFicha(data||{}),Number(serverUpdatedAt)||agora());}catch(_e){}
  }

  function normalizarRegistroParaEnvio(op){
    const registro={
      name:op.name,
      deleted:op.deleted===true,
      editAt:Number(op.editAt||0),
      serverUpdatedAt:window.firebase.database.ServerValue.TIMESTAMP,
      deviceId:texto(op.deviceId),
      opId:texto(op.opId)
    };
    if(!registro.deleted) registro.payload=String(op.payload??"null");
    return registro;
  }

  function dadosPersistidosDaFicha(ficha){
    if(!ficha) return {};
    try{
      const bruto=localStorage.getItem(ficha.key);
      if(bruto){const d=JSON.parse(bruto);if(d&&typeof d==="object"&&!Array.isArray(d))return d;}
    }catch(_e){}
    return clonar(ficha.data||{});
  }

  function criarOperacao(ficha,campo,editAtBase=timestampEdicao()){
    const dados=dadosPersistidosDaFicha(ficha);
    const existe=Object.prototype.hasOwnProperty.call(dados,campo);
    const op={
      sheetId:ficha.sheetId,
      sheetName:ficha.name,
      name:campo,
      deleted:!existe,
      editAt:Number(editAtBase)||timestampEdicao(),
      deviceId:deviceId(),
      opId:idAleatorio("field")
    };
    if(existe){
      const valor=util.normalizarValorParaNuvem(campo,dados[campo]);
      op.payload=JSON.stringify(valor);
    }
    return op;
  }

  function atualizarUiCampo(campo,valor){
    try{
      document.querySelectorAll("[data-save]").forEach(el=>{
        if(el.dataset.save!==campo||el.dataset.shinobiEdicaoPendente==="1") return;
        if(el.type==="checkbox") el.checked=Boolean(valor);
        else el.value=valor==null?"":String(valor);
        try{
          if(typeof shinobiSerializarValorCampo==="function"&&typeof shinobiValorCampo==="function"){
            el.dataset.shinobiValorConfirmado=shinobiSerializarValorCampo(shinobiValorCampo(el));
          }
        }catch(_e){}
      });
    }catch(_e){}

    const chamar=nome=>{try{if(typeof window[nome]==="function") window[nome]();else if(typeof globalThis[nome]==="function") globalThis[nome]();}catch(_e){}};
    if(campo==="notasTopicos"||campo==="notas") chamar("renderizarTopicosNotas");
    if(campo==="inventarioItens"||campo==="inventario") chamar("renderizarInventario");
    if(campo==="jutsus") chamar("renderizarJutsus");
    if(campo==="armados") chamar("renderizarArmados");
    if(campo==="naturezas") chamar("renderizarNaturezas");
    if(campo==="kekkeiGenkai") chamar("renderizarKekkeiGenkai");
    if(campo==="carteira"||campo==="carteiraHistorico") chamar("renderizarCarteira");
    if(campo==="avatarNinjaId"||campo==="avatarNinja") chamar("carregarAvatarSalvo");
    if(campo==="perfilFundoImagemId"||campo.startsWith("perfilFundo")) chamar("carregarFundoPerfilSalvo");

    const atributosBase=["forca","destreza","constituicao","inteligencia","sabedoria","carisma"];
    if(atributosBase.includes(campo)){
      chamar("atualizarModificadoresBatalha");
      chamar("atualizarModsBatalhaComBonus");
      chamar("atualizarBonusPericias");
    }
    if(campo.startsWith("p_")||campo==="proficiencia") chamar("atualizarBonusPericias");

    if(["pv","pvMax","chakra","chakraMax","ca","cd","bonusCA","destreza","proficiencia","xp","nivel","nome","rank"].includes(campo)){
      chamar("atualizarPlacar");
      chamar("atualizarHUD");
      chamar("atualizarPerfil");
      chamar("atualizarCAAutomatica");
      chamar("atualizarDefesasTotaisBatalha");
    }
  }

  function aplicarRegistroRemoto(sheetId,campo,registro){
    const uid=uidAtual();
    if(!uid||!registro||!util.campoPermitido(campo)) return false;
    if(texto(registro.name)!==campo) return false;
    const aplicada=versaoAplicada(sheetId,campo,uid);
    if(aplicada&&util.compararVersoes(registro,aplicada)<=0) return false;

    const pendente=operacaoPendente(sheetId,campo,uid);
    if(pendente){
      const cmp=util.compararVersoes(registro,pendente);
      if(cmp<0) return false;
      if(cmp>=0) removerOutbox(pendente,uid);
    }

    const ficha=fichaPorId(sheetId);
    if(!ficha) return false;
    const dados=dadosPersistidosDaFicha(ficha);
    const localAtual=dados[campo];
    if(registro.deleted===true) delete dados[campo];
    else{
      let valorRemoto;
      try{valorRemoto=JSON.parse(String(registro.payload));}catch(_erroPayload){return false;}
      dados[campo]=util.mesclarValorRemoto(campo,valorRemoto,localAtual);
    }

    try{localStorage.setItem(ficha.key,JSON.stringify(dados));}catch(_e){return false;}
    registrarVersao(sheetId,campo,registro,uid);

    const ativa=texto(localStorage.getItem("ficha_ninja_ativa_v1")||"Principal");
    if(ativa===ficha.name){
      try{
        if(typeof estado!=="undefined"&&estado&&typeof estado==="object"){
          if(registro.deleted===true) delete estado[campo];
          else estado[campo]=clonar(dados[campo]);
        }
      }catch(_e){}
      atualizarUiCampo(campo,dados[campo]);
    }
    confirmarStatusSeLimpo(sheetId,dados,registro.serverUpdatedAt);
    try{window.ShinobiOnline?.notificarEventoSync?.("ficha-atualizada-nuvem",{sheetId,name:ficha.name,campo,granular:true});}catch(_e){}
    return true;
  }

  function ouvirCampo(sheetId,snapshot){
    try{
      const registro=snapshot.val();
      if(!registro||typeof registro!=="object") return;
      const campo=texto(registro.name)||util.chaveParaCampo(snapshot.key);
      aplicarRegistroRemoto(sheetId,campo,registro);
    }catch(error){console.warn("Falha ao aplicar campo remoto",error);}
  }

  function removerListener(sheetId){
    const item=estadoRT.listeners.get(sheetId);
    if(!item) return;
    try{item.ref.off("child_added",item.onAdded);}catch(_e){}
    try{item.ref.off("child_changed",item.onChanged);}catch(_e){}
    estadoRT.listeners.delete(sheetId);
  }
  function limparListeners(){
    [...estadoRT.listeners.keys()].forEach(removerListener);
    estadoRT.initPromises.clear();
  }

  async function inicializarRealtimeFicha(ficha){
    const uid=uidAtual(),db=banco();
    if(!uid||!db||!ficha?.sheetId) return false;
    if(estadoRT.listeners.has(ficha.sheetId)) return true;
    if(estadoRT.initPromises.has(ficha.sheetId)) return estadoRT.initPromises.get(ficha.sheetId);
    const promessa=(async()=>{
      let cloudDescoberta=null;
      try{cloudDescoberta=await garantirRegistroDescoberta(ficha);}catch(error){console.warn("Falha ao garantir registro de descoberta da ficha",ficha.name,error);}
      if(cloudDescoberta?.deleted===true){
        await excluirFichaRealtime(ficha.sheetId).catch(()=>{});
        return false;
      }
      const raizRef=db.ref(`sheetRealtime/${uid}/${ficha.sheetId}`);
      const existente=await raizRef.once("value");
      const existenteValor=existente.val();
      if(!existente.exists()||Number(existenteValor?.schemaVersion||0)<SCHEMA_VERSION){
        let fonte=dadosPersistidosDaFicha(ficha),sourceRevision=0,baseEditAt=timestampEdicao();
        try{
          const cloud=cloudDescoberta;
          if(cloud?.deleted!==true&&cloud?.data&&typeof cloud.data==="object"){
            fonte=cloud.data;
            sourceRevision=Number(cloud.revision||0);
            if(Number.isFinite(Number(cloud.updatedAt))&&Number(cloud.updatedAt)>0) baseEditAt=Number(cloud.updatedAt);
          }
        }catch(_e){}
        const fields={};
        Object.keys(fonte||{}).filter(util.campoPermitido).forEach(campo=>{
          const chave=util.campoParaChave(campo);
          const valor=util.normalizarValorParaNuvem(campo,fonte[campo]);
          fields[chave]={
            name:campo,
            deleted:false,
            payload:JSON.stringify(valor),
            editAt:baseEditAt,
            serverUpdatedAt:window.firebase.database.ServerValue.TIMESTAMP,
            deviceId:deviceId(),
            opId:`init_${baseEditAt}_${chave}`.slice(0,180)
          };
        });
        await raizRef.transaction(atual=>{
          if(atual&&Number(atual.schemaVersion||0)>=SCHEMA_VERSION) return;
          return {
            schemaVersion:SCHEMA_VERSION,
            initializedAt:window.firebase.database.ServerValue.TIMESTAMP,
            initializedBy:deviceId(),
            sourceRevision,
            fields:{...fields,...(atual?.fields||{})}
          };
        });
      }
      observarFicha(ficha.sheetId);
      return true;
    })().finally(()=>estadoRT.initPromises.delete(ficha.sheetId));
    estadoRT.initPromises.set(ficha.sheetId,promessa);
    return promessa;
  }

  function observarFicha(sheetId){
    const uid=uidAtual(),db=banco();
    if(!uid||!db||!sheetId||estadoRT.listeners.has(sheetId)) return;
    const ref=db.ref(`sheetRealtime/${uid}/${sheetId}/fields`);
    const onAdded=snap=>ouvirCampo(sheetId,snap);
    const onChanged=snap=>ouvirCampo(sheetId,snap);
    ref.on("child_added",onAdded,error=>console.warn("Realtime child_added",error));
    ref.on("child_changed",onChanged,error=>console.warn("Realtime child_changed",error));
    estadoRT.listeners.set(sheetId,{ref,onAdded,onChanged});
  }

  async function garantirRegistroDescoberta(ficha){
    const uid=uidAtual(),db=banco();
    if(!uid||!db||!ficha?.sheetId) return null;
    const ref=db.ref(`userSheets/${uid}/${ficha.sheetId}`);
    const snapshot=await ref.once("value");
    if(snapshot.exists()) return snapshot.val();

    const data=dadosPersistidosDaFicha(ficha);
    const registro={
      name:texto(ficha.name)||"Ficha",
      characterName:texto(data?.nome)||texto(ficha.name)||"Ficha",
      revision:1,
      updatedAt:window.firebase.database.ServerValue.TIMESTAMP,
      deviceId:deviceId(),
      hash:hashFicha(data),
      appVersion:texto(window.APP_VERSION),
      deleted:false,
      data
    };
    const resultado=await ref.transaction(atual=>{
      if(atual) return;
      return registro;
    });
    return resultado.snapshot?.val?.()||null;
  }

  async function garantirConta(){
    const uid=uidAtual(),db=banco();
    if(!uid||!db){
      if(estadoRT.uid){limparListeners();estadoRT.uid="";}
      return false;
    }
    observarOffsetServidor();
    if(estadoRT.uid&&estadoRT.uid!==uid) limparListeners();
    estadoRT.uid=uid;
    const locais=fichasLocais();
    const idsAtuais=new Set(locais.map(f=>texto(f.sheetId)).filter(Boolean));
    [...estadoRT.listeners.keys()].forEach(id=>{if(!idsAtuais.has(id))removerListener(id);});
    if(!navigator.onLine) return true;
    for(const ficha of locais){
      try{await inicializarRealtimeFicha(ficha);}catch(error){console.warn("Falha ao inicializar realtime da ficha",ficha.name,error);}
    }
    await processarOutbox().catch(()=>{});
    return true;
  }

  function agendarGarantia(atraso=80){
    clearTimeout(estadoRT.timerGarantia);
    estadoRT.timerGarantia=setTimeout(()=>garantirConta().catch(()=>{}),atraso);
  }

  async function enviarOperacao(op){
    const uid=uidAtual(),db=banco();
    if(!uid||!db||uid!==texto(op?.uid||uid)) throw new Error("Conta Google indisponível para sincronização granular.");
    const chave=util.campoParaChave(op.name);
    const ref=db.ref(`sheetRealtime/${uid}/${op.sheetId}/fields/${chave}`);
    let maisNova=null;
    const result=await ref.transaction(atual=>{
      if(atual&&util.compararVersoes(op,atual)<=0){maisNova=atual;return;}
      return normalizarRegistroParaEnvio(op);
    });
    if(!result.committed){
      const atual=maisNova||result.snapshot?.val?.();
      removerOutbox(op,uid);
      if(atual&&typeof atual==="object") aplicarRegistroRemoto(op.sheetId,op.name,atual);
      return {ok:true,obsolete:true};
    }
    const salvo=result.snapshot.val();
    removerOutbox(op,uid);
    if(salvo) registrarVersao(op.sheetId,op.name,salvo,uid);
    const ficha=fichaPorId(op.sheetId);
    if(ficha) confirmarStatusSeLimpo(op.sheetId,dadosPersistidosDaFicha(ficha),salvo?.serverUpdatedAt);
    return {ok:true,record:salvo};
  }

  async function processarOutbox({sheetId=""}={}){
    if(estadoRT.processando){estadoRT.reprocessar=true;return {busy:true};}
    const uid=uidAtual(),db=banco();
    if(!uid||!db||!navigator.onLine) return {skipped:true};
    estadoRT.processando=true;
    const resultados=[];
    try{
      for(let rodada=0;rodada<4;rodada+=1){
        const pendentes=Object.values(outbox(uid)).filter(op=>!sheetId||texto(op?.sheetId)===texto(sheetId));
        if(!pendentes.length) break;
        let avancou=false;
        pendentes.sort((a,b)=>Number(a.editAt||0)-Number(b.editAt||0));
        for(const op of pendentes){
          if(!op?.sheetId||!util.campoPermitido(op?.name)) {removerOutbox(op,uid);continue;}
          try{
            const ficha=fichaPorId(op.sheetId);
            if(ficha) await inicializarRealtimeFicha(ficha);
            const r=await enviarOperacao(op);resultados.push(r);avancou=true;
          }catch(error){
            resultados.push({ok:false,error,op});
            atualizarStatusPendente(op.sheetId,"offline-ou-falha-campo");
          }
        }
        if(!avancou) break;
      }
    }finally{
      estadoRT.processando=false;
      if(estadoRT.reprocessar){
        estadoRT.reprocessar=false;
        setTimeout(()=>processarOutbox().catch(()=>{}),0);
      }
    }
    return resultados;
  }

  async function sincronizarCamposFicha(localSheetName,campos,{motivo="alteracao-confirmada"}={}){
    const uid=uidAtual();
    if(!uid) return {skipped:true,reason:"sem-conta-google"};
    const ficha=fichaPorNome(localSheetName)||window.ShinobiOnline?.fichaAtualLocal?.();
    if(!ficha||ficha.data?.__online?.syncDisabled) return {skipped:true,reason:"ficha-indisponivel"};
    const lista=[...new Set((Array.isArray(campos)?campos:[]).map(texto).filter(util.campoPermitido))];
    if(!lista.length) return {skipped:true,reason:"sem-campos"};
    const base=timestampEdicao();
    lista.forEach((campo,indice)=>{
      const op=criarOperacao(ficha,campo,base+indice/1000);
      op.uid=uid;
      adicionarOutbox(op,uid);
    });
    atualizarStatusPendente(ficha.sheetId,motivo);
    if(!navigator.onLine) return {queued:true,count:lista.length};
    await inicializarRealtimeFicha(ficha);
    const resultados=await processarOutbox({sheetId:ficha.sheetId});
    return {ok:!temPendencias(ficha.sheetId),count:lista.length,resultados};
  }

  async function reconciliar(){
    await garantirConta();
    return processarOutbox();
  }

  async function excluirFichaRealtime(sheetId,{removerNuvem=true}={}){
    const uid=uidAtual(),id=texto(sheetId);
    if(!uid||!id) return {skipped:true};
    removerListener(id);
    estadoRT.initPromises.delete(id);

    const pendentes=outbox(uid);
    let alterouOutbox=false;
    Object.entries(pendentes).forEach(([chave,op])=>{
      if(texto(op?.sheetId)!==id) return;
      delete pendentes[chave];
      alterouOutbox=true;
    });
    if(alterouOutbox) salvarOutbox(pendentes,uid);

    const aplicadas=versoes(uid);
    if(aplicadas[id]){delete aplicadas[id];salvarVersoes(aplicadas,uid);}

    const db=banco();
    if(removerNuvem&&db&&navigator.onLine){
      try{await db.ref(`sheetRealtime/${uid}/${id}`).remove();}
      catch(error){
        console.warn("Falha ao limpar dados realtime de ficha excluída",error);
        return {ok:false,error};
      }
    }
    return {ok:true,removedRemote:Boolean(removerNuvem&&db&&navigator.onLine)};
  }

  function estaAtiva(sheetId){return Boolean(uidAtual()&&texto(sheetId)&&(estadoRT.listeners.has(sheetId)||estadoRT.initPromises.has(sheetId)));}

  function observarOffsetServidor(){
    const db=banco();
    if(!db||estadoRT.unsubscribeOffset) return;
    const ref=db.ref(".info/serverTimeOffset");
    const callback=snap=>{
      const valor=Number(snap.val());
      if(Number.isFinite(valor)){
        estadoRT.serverOffset=valor;
        estadoRT.serverOffsetKnown=true;
        try{localStorage.setItem(CHAVE_SERVER_OFFSET,String(valor));}catch(_e){}
      }
    };
    ref.on("value",callback);
    estadoRT.unsubscribeOffset=()=>ref.off("value",callback);
  }

  function instalar(){
    if(!util||!window.ShinobiOnline) return false;
    observarOffsetServidor();
    window.ShinobiOnline.sincronizarCamposFicha=sincronizarCamposFicha;
    window.ShinobiOnline.sincronizarPendenciasCampos=processarOutbox;
    window.EkoRealtimeSync={
      sincronizarCamposFicha,processarOutbox,reconciliar,garantirConta,temPendencias,estaAtiva,excluirFichaRealtime,
      timestampEdicao,aplicarRegistroRemoto
    };
    ["auth","fichas-nuvem","ficha-restaurada","pronto"].forEach(tipo=>{
      window.addEventListener(`shinobi:online:${tipo}`,()=>agendarGarantia(tipo==="auth"?20:100));
    });
    window.addEventListener("shinobi:online:ficha-sincronizada",evento=>{
      /* Confirmações granulares acontecem a cada edição e já estão com o
         listener ativo. Reexecutar o bootstrap completo aqui adicionaria
         leituras desnecessárias após cada PV, nota ou atributo alterado. */
      if(evento?.detail?.granular) return;
      agendarGarantia(100);
    });
    window.addEventListener("online",()=>reconciliar().catch(()=>{}),{passive:true});
    window.addEventListener("focus",()=>agendarGarantia(60));
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")agendarGarantia(60);});
    document.addEventListener("DOMContentLoaded",()=>agendarGarantia(20));
    agendarGarantia(20);
    return true;
  }

  instalar();
})();
