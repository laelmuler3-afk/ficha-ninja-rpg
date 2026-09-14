/* EKO 2.5.8.74 — realtime lazy, por campo e fora do caminho de boot. */
(function(root,factory){
  const emNode=typeof module!=="undefined"&&module.exports;
  const util=emNode?require("./19-realtime-fields-utils.js"):root?.EkoRealtimeFields;
  const api=factory(root,util);
  if(emNode) module.exports=api.test;
  else api.install();
})(typeof window!=="undefined"?window:globalThis,function(root,util){
  "use strict";

  const CHAVE_OUTBOX_BASE="shinobi_field_outbox_v2";
  const CHAVE_VERSOES_BASE="shinobi_field_versions_v2";
  const CHAVE_SERVER_OFFSET="shinobi_server_time_offset_v2";
  const CHAVE_DEVICE="shinobi_device_id_v1";

  function texto(v){return String(v==null?"":v).trim();}
  function clonar(v){if(v==null)return v;try{return structuredClone(v);}catch(_e){return JSON.parse(JSON.stringify(v));}}
  function agora(){return Date.now();}
  function idAleatorio(prefixo="op"){
    try{if(root?.crypto?.randomUUID)return `${prefixo}_${root.crypto.randomUUID().replace(/-/g,"")}`;}catch(_e){}
    return `${prefixo}_${agora().toString(36)}_${Math.random().toString(36).slice(2,12)}`;
  }
  function compararRegistros(a,b){
    if(util?.compararVersoes)return util.compararVersoes(a,b);
    const ea=Number(a?.editAt||0),eb=Number(b?.editAt||0);
    if(ea!==eb)return ea>eb?1:-1;
    const oa=texto(a?.opId),ob=texto(b?.opId);
    return oa===ob?0:(oa>ob?1:-1);
  }
  function registroMaisNovo(a,b){return compararRegistros(a,b)>=0?a:b;}
  function campoParaChave(campo){return util?.campoParaChave?util.campoParaChave(campo):encodeURIComponent(texto(campo)).replace(/\./g,"%2E");}
  function campoPermitido(campo){return util?.campoPermitido?util.campoPermitido(campo):Boolean(texto(campo));}
  function normalizarValor(campo,valor){return util?.normalizarValorParaNuvem?util.normalizarValorParaNuvem(campo,valor):clonar(valor);}
  function criarOperacaoPura({sheetId,sheetName,campo,valor,editAt,deviceId,opId,uid=""}){
    const nome=texto(campo);
    const deleted=valor===undefined;
    const op={
      uid:texto(uid),sheetId:texto(sheetId),sheetName:texto(sheetName)||"Principal",name:nome,
      deleted,editAt:Number(editAt||agora()),deviceId:texto(deviceId),opId:texto(opId)||idAleatorio("field")
    };
    if(!deleted)op.payload=JSON.stringify(normalizarValor(nome,valor));
    return op;
  }

  const test={compararRegistros,registroMaisNovo,criarOperacaoPura};

  function install(){
    if(!root||!root.document||root.__ekoRealtimeLazyV2)return false;
    root.__ekoRealtimeLazyV2=true;
    if(!util||!root.ShinobiOnline){
      console.warn("Realtime lazy aguardando dependências.");
      return false;
    }

    const offsetSalvo=Number(root.localStorage?.getItem(CHAVE_SERVER_OFFSET));
    const estadoRT={
      bootLiberado:false,
      uid:"",
      listener:null,
      offset:Number.isFinite(offsetSalvo)?offsetSalvo:0,
      offsetConhecido:Number.isFinite(offsetSalvo),
      offsetRef:null,
      offsetCallback:null,
      processando:false,
      reprocessar:false,
      timerAtivacao:null
    };

    function usuarioAtual(){
      const u=root.ShinobiOnline?.snapshot?.()?.user;
      return u&&!u.anonymous?u:null;
    }
    function uidAtual(){return texto(usuarioAtual()?.uid);}
    function deviceId(){
      let id="";
      try{id=root.localStorage.getItem(CHAVE_DEVICE)||"";}catch(_e){}
      if(!id){id=idAleatorio("device");try{root.localStorage.setItem(CHAVE_DEVICE,id);}catch(_e){}}
      return id;
    }
    function banco(){
      try{return root.firebase?.apps?.length?root.firebase.app().database():null;}catch(_e){return null;}
    }
    function chaveConta(base,uid=uidAtual()){return uid?`${base}__${uid}`:"";}
    function lerJson(chave,padrao={}){try{const raw=root.localStorage.getItem(chave);return raw?JSON.parse(raw):padrao;}catch(_e){return padrao;}}
    function salvarJson(chave,valor){if(!chave)return;try{root.localStorage.setItem(chave,JSON.stringify(valor));}catch(_e){}}
    function lerOutbox(uid=uidAtual()){return lerJson(chaveConta(CHAVE_OUTBOX_BASE,uid),{});}
    function salvarOutbox(valor,uid=uidAtual()){salvarJson(chaveConta(CHAVE_OUTBOX_BASE,uid),valor||{});}
    function lerVersoes(uid=uidAtual()){return lerJson(chaveConta(CHAVE_VERSOES_BASE,uid),{});}
    function salvarVersoes(valor,uid=uidAtual()){salvarJson(chaveConta(CHAVE_VERSOES_BASE,uid),valor||{});}
    function chaveOperacao(sheetId,campo){return `${texto(sheetId)}::${campoParaChave(campo)}`;}
    function timestampEdicao(){return agora()+(estadoRT.offsetConhecido?Number(estadoRT.offset||0):0);}

    function obterFichaAtiva(preparar=false){
      try{
        const atual=root.ShinobiOnline?.fichaAtualLocal?.();
        if(!atual)return null;
        if(preparar&&uidAtual()){
          return root.ShinobiOnline?.garantirIdentidadeFichaRealtime?.(atual.name)||atual;
        }
        return atual;
      }catch(_e){return null;}
    }
    function realtimeIdDaFicha(ficha){
      return texto(ficha?.realtimeId||ficha?.data?.__online?.realtimeId||"");
    }

    function registrarVersao(sheetId,campo,registro,uid=uidAtual()){
      if(!uid||!sheetId||!campo||!registro)return;
      const todos=lerVersoes(uid);
      todos[sheetId]=todos[sheetId]&&typeof todos[sheetId]==="object"?todos[sheetId]:{};
      todos[sheetId][campoParaChave(campo)]={editAt:Number(registro.editAt||0),opId:texto(registro.opId)};
      salvarVersoes(todos,uid);
    }
    function versaoAplicada(sheetId,campo,uid=uidAtual()){
      return lerVersoes(uid)?.[sheetId]?.[campoParaChave(campo)]||null;
    }
    function adicionarOutbox(op,uid=uidAtual()){
      if(!uid||!op?.sheetId||!campoPermitido(op?.name))return;
      const todos=lerOutbox(uid);
      const chave=chaveOperacao(op.sheetId,op.name);
      const anterior=todos[chave];
      if(!anterior||compararRegistros(op,anterior)>=0)todos[chave]=op;
      salvarOutbox(todos,uid);
    }
    function removerOutbox(op,uid=uidAtual()){
      if(!uid||!op?.sheetId||!op?.name)return;
      const todos=lerOutbox(uid),chave=chaveOperacao(op.sheetId,op.name),atual=todos[chave];
      if(!atual)return;
      if(op.opId&&texto(atual.opId)!==texto(op.opId))return;
      delete todos[chave];
      salvarOutbox(todos,uid);
    }
    function operacaoPendente(sheetId,campo,uid=uidAtual()){
      return lerOutbox(uid)?.[chaveOperacao(sheetId,campo)]||null;
    }
    function temPendencias(sheetId="",uid=uidAtual()){
      const id=texto(sheetId);
      return Object.values(lerOutbox(uid)).some(op=>!id||texto(op?.sheetId)===id);
    }

    function registroParaFirebase(op){
      const registro={
        name:op.name,
        deleted:op.deleted===true,
        editAt:Number(op.editAt||0),
        serverUpdatedAt:root.firebase.database.ServerValue.TIMESTAMP,
        deviceId:texto(op.deviceId),
        opId:texto(op.opId)
      };
      if(!registro.deleted)registro.payload=String(op.payload??"null");
      return registro;
    }

    function parsePayload(campo,registro,localAtual){
      if(registro?.deleted===true)return {deletar:true,valor:undefined};
      let valor=null;
      try{valor=JSON.parse(String(registro?.payload??"null"));}catch(_e){return {invalido:true};}
      if(util?.mesclarValorRemoto)valor=util.mesclarValorRemoto(campo,valor,localAtual);
      return {valor};
    }

    function atualizarUi(campos,dados){
      const lista=[...new Set((campos||[]).map(texto).filter(Boolean))];
      if(!lista.length)return;
      const conjunto=new Set(lista);
      try{
        root.document.querySelectorAll("[data-save]").forEach(el=>{
          const campo=texto(el.dataset.save);
          if(!conjunto.has(campo)||el.dataset.shinobiEdicaoPendente==="1")return;
          const valor=dados?.[campo];
          if(el.type==="checkbox")el.checked=Boolean(valor);else el.value=valor==null?"":String(valor);
          try{
            if(typeof root.shinobiSerializarValorCampo==="function"&&typeof root.shinobiValorCampo==="function"){
              el.dataset.shinobiValorConfirmado=root.shinobiSerializarValorCampo(root.shinobiValorCampo(el));
            }
          }catch(_e){}
        });
      }catch(_e){}
      const chamar=nome=>{try{if(typeof root[nome]==="function")root[nome]();}catch(_e){}};
      if(conjunto.has("notasTopicos")||conjunto.has("notas"))chamar("renderizarTopicosNotas");
      if(conjunto.has("inventarioItens")||conjunto.has("inventario")||conjunto.has("carteira")||conjunto.has("carteiraHistorico"))chamar("renderizarInventario");
      if(conjunto.has("jutsus"))chamar("renderizarJutsus");
      if(conjunto.has("armados"))chamar("renderizarArmados");
      if(conjunto.has("kekkeiGenkai"))chamar("renderizarKekkeiGenkai");
      if(conjunto.has("resistenciasEscolhidas"))chamar("renderizarResistenciasBatalha");
      if(conjunto.has("bonusAtivos")||conjunto.has("bonusCA"))chamar("atualizarBonusGeralRealtime");
      if(conjunto.has("efeitosBatalhaAtivos")){
        try{root.EfeitosJutsuShinobi?.atualizar?.();}catch(_e){}
        chamar("atualizarHUD");
        chamar("atualizarDefesasTotaisBatalha");
      }
      if(conjunto.has("progressaoFixa")){try{root.shinobiLevelUp?.refresh?.();}catch(_e){}}
      if(lista.some(c=>["katon","raiton","fuuton","suiton","doton","yin","yang","atributoConjuracaoNatureza"].includes(c))){
        chamar("renderizarNaturezas");
        chamar("renderizarJutsus");
        chamar("renderizarResistenciasBatalha");
        chamar("atualizarPerfil");
      }
      if(lista.some(c=>["forca","destreza","constituicao","inteligencia","sabedoria","carisma","ca","cd","proficiencia"].includes(c)||c.startsWith("p_"))){
        chamar("atualizarModificadoresBatalha");
        chamar("atualizarBonusPericias");
        chamar("atualizarDefesasTotaisBatalha");
      }
      if(lista.some(c=>["pv","pvMax","chakra","chakraMax","xp","nivel","nome","rank","ca","cd"].includes(c))){
        chamar("atualizarPlacar");
        chamar("atualizarHUD");
        chamar("atualizarPerfil");
      }
    }

    let camposUiPendentes=new Set();
    let dadosUiPendentes=null;
    let frameUiPendente=0;
    function agendarAtualizacaoUi(campos,dados){
      (campos||[]).forEach(campo=>{const nome=texto(campo);if(nome)camposUiPendentes.add(nome);});
      dadosUiPendentes=dados;
      if(frameUiPendente)return;
      const executar=()=>{
        frameUiPendente=0;
        const lista=[...camposUiPendentes];
        camposUiPendentes.clear();
        const snapshot=dadosUiPendentes;
        dadosUiPendentes=null;
        if(lista.length)atualizarUi(lista,snapshot);
      };
      if(typeof root.requestAnimationFrame==="function")frameUiPendente=root.requestAnimationFrame(executar);
      else frameUiPendente=root.setTimeout(executar,16);
    }

    function aplicarSnapshotCampos(sheetId,valor){
      const uid=uidAtual();
      const fichaBase=obterFichaAtiva(false);
      const ficha=fichaBase?root.ShinobiOnline?.garantirIdentidadeFichaRealtime?.(fichaBase.name)||fichaBase:null;
      if(!uid||!ficha||realtimeIdDaFicha(ficha)!==texto(sheetId))return [];
      let dados={};
      try{dados=JSON.parse(root.localStorage.getItem(ficha.key)||"{}");}catch(_e){dados=clonar(ficha.data||{});}
      if(!dados||typeof dados!=="object"||Array.isArray(dados))dados={};
      const aplicados=[];
      const registros=valor&&typeof valor==="object"?valor:{};
      for(const [chave,registro] of Object.entries(registros)){
        const campo=texto(registro?.name)||(util?.chaveParaCampo?util.chaveParaCampo(chave):"");
        if(!registro||!campoPermitido(campo)||texto(registro.name)!==campo)continue;
        const anterior=versaoAplicada(sheetId,campo,uid);
        if(anterior&&compararRegistros(registro,anterior)<=0)continue;
        const pendente=operacaoPendente(sheetId,campo,uid);
        if(pendente&&compararRegistros(pendente,registro)>0)continue;
        if(pendente&&compararRegistros(registro,pendente)>=0)removerOutbox(pendente,uid);
        const parsed=parsePayload(campo,registro,dados[campo]);
        if(parsed.invalido)continue;
        if(parsed.deletar)delete dados[campo];else dados[campo]=clonar(parsed.valor);
        try{
          if(typeof estado!=="undefined"&&estado&&typeof estado==="object"){
            if(parsed.deletar)delete estado[campo];else estado[campo]=clonar(parsed.valor);
          }
        }catch(_e){}
        registrarVersao(sheetId,campo,registro,uid);
        aplicados.push(campo);
      }
      if(aplicados.length){
        try{root.localStorage.setItem(ficha.key,JSON.stringify(dados));}catch(_e){}
        agendarAtualizacaoUi(aplicados,dados);
        try{root.dispatchEvent(new CustomEvent("shinobi:realtime-aplicado",{detail:{sheetId,campos:aplicados}}));}catch(_e){}
      }
      return aplicados;
    }

    function desconectarListener(){
      const atual=estadoRT.listener;
      if(atual){try{atual.ref.off("value",atual.callback);}catch(_e){}}
      estadoRT.listener=null;
    }

    function observarOffset(db){
      if(estadoRT.offsetRef||!db)return;
      try{
        const ref=db.ref(".info/serverTimeOffset");
        const callback=snap=>{
          const valor=Number(snap.val());
          if(Number.isFinite(valor)){
            estadoRT.offset=valor;estadoRT.offsetConhecido=true;
            try{root.localStorage.setItem(CHAVE_SERVER_OFFSET,String(valor));}catch(_e){}
          }
        };
        ref.on("value",callback,()=>{});
        estadoRT.offsetRef=ref;estadoRT.offsetCallback=callback;
      }catch(_e){}
    }

    async function ativarFichaAtual(){
      if(!estadoRT.bootLiberado)return {skipped:true,reason:"boot-ainda-nao-liberado"};
      const user=usuarioAtual(),db=banco();
      if(!user||!db){desconectarListener();return {skipped:true,reason:"conta-ou-firebase-indisponivel"};}
      observarOffset(db);
      const ficha=obterFichaAtiva(true);
      const realtimeId=realtimeIdDaFicha(ficha);
      if(!realtimeId){desconectarListener();return {skipped:true,reason:"ficha-sem-identidade-realtime"};}
      const uid=texto(user.uid),sheetId=realtimeId;
      if(estadoRT.listener&&estadoRT.listener.uid===uid&&estadoRT.listener.sheetId===sheetId){
        await processarOutbox().catch(()=>{});
        return {ok:true,already:true,sheetId};
      }
      desconectarListener();
      const ref=db.ref(`sheetRealtime/${uid}/${sheetId}/fields`);
      const callback=snap=>{
        try{aplicarSnapshotCampos(sheetId,snap.val()||{});}catch(erro){console.warn("Falha ao aplicar realtime da ficha ativa.",erro);}
      };
      ref.on("value",callback,erro=>{
        console.warn("Realtime da ficha ativa indisponível.",erro?.code||erro?.message||erro);
        try{root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:"Sincronização em tempo real indisponível. A ficha local continua funcionando."}}));}catch(_e){}
      });
      estadoRT.listener={uid,sheetId,ref,callback};
      await processarOutbox().catch(()=>{});
      return {ok:true,sheetId};
    }

    function agendarAtivacao(atraso=80){
      clearTimeout(estadoRT.timerAtivacao);
      estadoRT.timerAtivacao=setTimeout(()=>ativarFichaAtual().catch(erro=>console.warn("Realtime lazy não iniciou.",erro)),atraso);
    }

    async function enviarOperacao(op){
      const uid=uidAtual(),db=banco();
      if(!uid||!db||texto(op?.uid)!==uid)throw new Error("Conta Google indisponível para sincronização realtime.");
      const ref=db.ref(`sheetRealtime/${uid}/${op.sheetId}/fields/${campoParaChave(op.name)}`);
      let registroAtual=null;
      const resultado=await ref.transaction(atual=>{
        if(atual&&compararRegistros(op,atual)<=0){registroAtual=atual;return;}
        return registroParaFirebase(op);
      });
      if(!resultado.committed){
        removerOutbox(op,uid);
        const atual=registroAtual||resultado.snapshot?.val?.();
        if(atual&&estadoRT.listener?.sheetId===op.sheetId)aplicarSnapshotCampos(op.sheetId,{[campoParaChave(op.name)]:atual});
        return {ok:true,obsolete:true};
      }
      const salvo=resultado.snapshot?.val?.();
      removerOutbox(op,uid);
      if(salvo)registrarVersao(op.sheetId,op.name,salvo,uid);
      return {ok:true,record:salvo};
    }

    async function processarOutbox(){
      if(estadoRT.processando){estadoRT.reprocessar=true;return {busy:true};}
      const uid=uidAtual(),db=banco();
      if(!uid||!db||root.navigator?.onLine===false)return {skipped:true};
      estadoRT.processando=true;
      const resultados=[];
      try{
        const pendentes=Object.values(lerOutbox(uid)).filter(op=>op?.sheetId&&campoPermitido(op?.name));
        pendentes.sort((a,b)=>compararRegistros(a,b));
        for(const op of pendentes){
          try{resultados.push(await enviarOperacao(op));}
          catch(erro){resultados.push({ok:false,error:erro,op});}
        }
      }finally{
        estadoRT.processando=false;
        if(estadoRT.reprocessar){estadoRT.reprocessar=false;setTimeout(()=>processarOutbox().catch(()=>{}),0);}
      }
      return {ok:resultados.every(r=>r.ok!==false),resultados};
    }

    async function sincronizarCampoConfirmado(localSheetName,campo,valor,meta={}){
      const nome=texto(campo);
      if(!campoPermitido(nome))return {skipped:true,reason:"campo-invalido"};
      const user=usuarioAtual();
      if(!user)return {skipped:true,reason:"sem-conta-google"};
      const ficha=root.ShinobiOnline?.garantirIdentidadeFichaRealtime?.(localSheetName)||obterFichaAtiva(true);
      const realtimeId=realtimeIdDaFicha(ficha);
      if(!realtimeId||ficha?.data?.__online?.syncDisabled)return {skipped:true,reason:"ficha-indisponivel"};
      const uid=texto(user.uid);
      const op=criarOperacaoPura({
        uid,sheetId:realtimeId,sheetName:ficha.name,campo:nome,valor,
        editAt:Number(meta.editAt||timestampEdicao()),deviceId:deviceId(),opId:idAleatorio("field")
      });
      adicionarOutbox(op,uid);
      if(root.navigator?.onLine===false)return {queued:true,op};
      if(estadoRT.bootLiberado)await ativarFichaAtual().catch(()=>{});
      const resultado=await processarOutbox();
      return {...resultado,op};
    }

    async function reconciliar(){
      if(!estadoRT.bootLiberado)return {skipped:true};
      await ativarFichaAtual().catch(()=>{});
      return processarOutbox();
    }

    function liberarBoot(){
      if(estadoRT.bootLiberado)return;
      estadoRT.bootLiberado=true;
      agendarAtivacao(80);
    }

    root.ShinobiOnline.sincronizarCampoConfirmado=sincronizarCampoConfirmado;
    root.ShinobiOnline.sincronizarPendenciasRealtime=processarOutbox;
    root.EkoRealtimeSync={
      sincronizarCampoConfirmado,processarOutbox,reconciliar,ativarFichaAtual,temPendencias,
      get estado(){return {bootLiberado:estadoRT.bootLiberado,uid:uidAtual(),sheetId:estadoRT.listener?.sheetId||""};}
    };

    root.addEventListener("shinobi:online:auth",()=>{if(estadoRT.bootLiberado)agendarAtivacao(100);});
    root.addEventListener("online",()=>{if(estadoRT.bootLiberado)reconciliar().catch(()=>{});},{passive:true});
    root.addEventListener("pagehide",()=>{desconectarListener();});

    const liberarDepoisDaRenderizacao=()=>setTimeout(liberarBoot,120);
    if(root.ShinobiAppReady?.executar){
      root.ShinobiAppReady.executar(liberarDepoisDaRenderizacao);
    }else if(root.document.readyState==="complete"){
      setTimeout(liberarDepoisDaRenderizacao,1200);
    }else{
      root.addEventListener("load",()=>setTimeout(liberarDepoisDaRenderizacao,1200),{once:true});
    }
    return true;
  }

  return {install,test};
});
