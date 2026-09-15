/* EKO 2.5.8.78 — realtime lazy com isolamento de cópias legadas. */
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
  const CHAVE_OUTBOX_COLECOES_BASE="shinobi_collection_outbox_v1";
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
  function realtimeIdDaFicha(ficha){
    return texto(ficha?.characterId||ficha?.data?.__online?.characterId||ficha?.realtimeId||ficha?.data?.__online?.realtimeId||"");
  }
  function fichaPodeUsarRealtime(ficha){
    if(!ficha)return false;
    const online=ficha?.data?.__online&&typeof ficha.data.__online==="object"?ficha.data.__online:{};
    return online.syncDisabled!==true&&online.legacyAutoCopy!==true;
  }
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
  function criarOperacaoColecaoPura({sheetId,sheetName,collection,itemId,valor,deleted=false,editAt,deviceId,opId,uid=""}){
    const colecao=texto(collection),id=texto(itemId);
    const op={
      kind:"collection-item",uid:texto(uid),sheetId:texto(sheetId),sheetName:texto(sheetName)||"Principal",
      collection:colecao,itemId:id,deleted:deleted===true,editAt:Number(editAt||agora()),
      deviceId:texto(deviceId),opId:texto(opId)||idAleatorio("item")
    };
    if(!op.deleted){
      const normalizado=colecao==="notas"&&util?.normalizarItemNotaParaNuvem?util.normalizarItemNotaParaNuvem(valor):clonar(valor);
      op.payload=JSON.stringify(normalizado);
    }
    return op;
  }

  const test={compararRegistros,registroMaisNovo,criarOperacaoPura,criarOperacaoColecaoPura,realtimeIdDaFicha,fichaPodeUsarRealtime};

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
    function lerOutboxColecoes(uid=uidAtual()){return lerJson(chaveConta(CHAVE_OUTBOX_COLECOES_BASE,uid),{});}
    function salvarOutboxColecoes(valor,uid=uidAtual()){salvarJson(chaveConta(CHAVE_OUTBOX_COLECOES_BASE,uid),valor||{});}
    function lerVersoes(uid=uidAtual()){return lerJson(chaveConta(CHAVE_VERSOES_BASE,uid),{});}
    function salvarVersoes(valor,uid=uidAtual()){salvarJson(chaveConta(CHAVE_VERSOES_BASE,uid),valor||{});}
    function chaveOperacao(sheetId,campo){return `${texto(sheetId)}::${campoParaChave(campo)}`;}
    function timestampEdicao(){return agora()+(estadoRT.offsetConhecido?Number(estadoRT.offset||0):0);}

    function obterFichaAtiva(preparar=false){
      try{
        let atual=root.ShinobiOnline?.fichaAtualLocal?.();
        const nomeAtivo=texto(root.localStorage?.getItem("ficha_ninja_ativa_v1")||atual?.name||"Principal");
        const gerenciada=root.EkoSheetManager?.obterFichaPorNome?.(nomeAtivo);
        if(gerenciada?.physicalKeys?.length) atual=gerenciada;
        if(!atual)return null;
        if(!fichaPodeUsarRealtime(atual))return atual;
        if(preparar&&uidAtual()){
          return root.ShinobiOnline?.garantirIdentidadeFichaRealtime?.(atual.name)||atual;
        }
        return atual;
      }catch(_e){return null;}
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
    function chaveOperacaoColecao(sheetId,collection,itemId){return `${texto(sheetId)}::${texto(collection)}::${campoParaChave(itemId)}`;}
    function adicionarOutboxColecao(op,uid=uidAtual()){
      if(!uid||!op?.sheetId||texto(op?.collection)!=="notas"||!texto(op?.itemId))return;
      const todos=lerOutboxColecoes(uid),chave=chaveOperacaoColecao(op.sheetId,op.collection,op.itemId);
      const anterior=todos[chave];
      if(!anterior||compararRegistros(op,anterior)>=0)todos[chave]=op;
      salvarOutboxColecoes(todos,uid);
    }
    function removerOutboxColecao(op,uid=uidAtual()){
      const todos=lerOutboxColecoes(uid),chave=chaveOperacaoColecao(op?.sheetId,op?.collection,op?.itemId),atual=todos[chave];
      if(!atual)return;
      if(op?.opId&&texto(atual.opId)!==texto(op.opId))return;
      delete todos[chave];salvarOutboxColecoes(todos,uid);
    }
    function operacaoColecaoPendente(sheetId,collection,itemId,uid=uidAtual()){
      return lerOutboxColecoes(uid)?.[chaveOperacaoColecao(sheetId,collection,itemId)]||null;
    }
    function temPendencias(sheetId="",uid=uidAtual()){
      const id=texto(sheetId);
      return Object.values(lerOutbox(uid)).some(op=>!id||texto(op?.sheetId)===id)
        ||Object.values(lerOutboxColecoes(uid)).some(op=>!id||texto(op?.sheetId)===id);
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
      if(!fichaPodeUsarRealtime(fichaBase))return [];
      const ficha=fichaBase?root.ShinobiOnline?.garantirIdentidadeFichaRealtime?.(fichaBase.name)||fichaBase:null;
      if(!uid||!ficha||!fichaPodeUsarRealtime(ficha)||realtimeIdDaFicha(ficha)!==texto(sheetId))return [];
      let dados={};
      try{dados=JSON.parse(root.localStorage.getItem(ficha.key)||"{}");}catch(_e){dados=clonar(ficha.data||{});}
      if(!dados||typeof dados!=="object"||Array.isArray(dados))dados={};
      const aplicados=[];
      const registros=valor&&typeof valor==="object"?valor:{};
      for(const [chave,registro] of Object.entries(registros)){
        const campo=texto(registro?.name)||(util?.chaveParaCampo?util.chaveParaCampo(chave):"");
        if(!registro||!campoPermitido(campo)||texto(registro.name)!==campo)continue;
        if(campo==="notasTopicos")continue; /* notas usam collections/notas por item desde 2.5.8.81 */
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

    function aplicarSnapshotNotas(sheetId,valor){
      const uid=uidAtual(),ficha=obterFichaAtiva(false);
      if(!uid||!ficha||realtimeIdDaFicha(ficha)!==texto(sheetId))return [];
      let dados={};
      try{dados=JSON.parse(root.localStorage.getItem(ficha.key)||"{}");}catch(_e){dados=clonar(ficha.data||{});}
      if(!dados||typeof dados!=="object"||Array.isArray(dados))dados={};
      let notas=Array.isArray(dados.notasTopicos)?dados.notasTopicos:[];
      const aplicados=[];
      for(const [chave,registro] of Object.entries(valor&&typeof valor==="object"?valor:{})){
        const itemId=texto(registro?.id||registro?.itemId||(util?.chaveParaCampo?util.chaveParaCampo(chave):""));
        if(!registro||!itemId)continue;
        const versaoCampo=`@notas:${itemId}`;
        const anterior=versaoAplicada(sheetId,versaoCampo,uid);
        if(anterior&&compararRegistros(registro,anterior)<=0)continue;
        const pendente=operacaoColecaoPendente(sheetId,"notas",itemId,uid);
        if(pendente&&compararRegistros(pendente,registro)>0)continue;
        if(pendente&&compararRegistros(registro,pendente)>=0)removerOutboxColecao(pendente,uid);
        let item={id:itemId};
        if(registro.deleted!==true){
          try{item=JSON.parse(String(registro.payload||"{}"));}catch(_e){continue;}
          if(!item||typeof item!=="object"||Array.isArray(item))continue;
          item.id=itemId;
        }
        notas=util?.aplicarItemNotaRemoto?util.aplicarItemNotaRemoto(notas,item,registro.deleted===true):notas;
        registrarVersao(sheetId,versaoCampo,registro,uid);
        aplicados.push(itemId);
      }
      if(aplicados.length){
        dados.notasTopicos=notas;
        try{root.localStorage.setItem(ficha.key,JSON.stringify(dados));}catch(_e){}
        try{
          if(typeof estado!=="undefined"&&estado&&typeof estado==="object")estado.notasTopicos=clonar(notas);
        }catch(_e){}
        agendarAtualizacaoUi(["notasTopicos"],dados);
        try{root.dispatchEvent(new CustomEvent("shinobi:realtime-colecao-aplicada",{detail:{sheetId,collection:"notas",itemIds:aplicados}}));}catch(_e){}
      }
      return aplicados;
    }

    function desconectarListener(){
      const atual=estadoRT.listener;
      if(atual){
        try{atual.ref.off("value",atual.callback);}catch(_e){}
        try{atual.notasRef?.off("value",atual.notasCallback);}catch(_e){}
      }
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
      const fichaBase=obterFichaAtiva(false);
      if(!fichaPodeUsarRealtime(fichaBase)){desconectarListener();return {skipped:true,reason:"ficha-legada-ou-desativada"};}
      const ficha=obterFichaAtiva(true);
      const realtimeId=realtimeIdDaFicha(ficha);
      if(!fichaPodeUsarRealtime(ficha)||!realtimeId){desconectarListener();return {skipped:true,reason:"ficha-sem-identidade-realtime"};}
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
      const notasRef=db.ref(`sheetRealtime/${uid}/${sheetId}/collections/notas`);
      const notasCallback=snap=>{
        try{aplicarSnapshotNotas(sheetId,snap.val()||{});}catch(erro){console.warn("Falha ao aplicar notas realtime.",erro);}
      };
      notasRef.on("value",notasCallback,()=>{});
      estadoRT.listener={uid,sheetId,ref,callback,notasRef,notasCallback};

      try{
        const snapNotas=await notasRef.once("value");
        const remotas=snapNotas.val()&&typeof snapNotas.val()==="object"?snapNotas.val():{};
        const fichaLocal=obterFichaAtiva(false);
        const notas=Array.isArray(fichaLocal?.data?.notasTopicos)?fichaLocal.data.notasTopicos:[];
        notas.forEach((item,indice)=>{
          const itemId=texto(item?.id);
          if(!itemId||Object.prototype.hasOwnProperty.call(remotas,campoParaChave(itemId)))return;
          adicionarOutboxColecao(criarOperacaoColecaoPura({
            uid,sheetId,sheetName:fichaLocal.name,collection:"notas",itemId,valor:item,
            editAt:timestampEdicao()+indice,deviceId:deviceId(),opId:idAleatorio("note-seed")
          }),uid);
        });
      }catch(_e){}
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

    async function enviarOperacaoColecao(op){
      const uid=uidAtual(),db=banco();
      if(!uid||!db||texto(op?.uid)!==uid)throw new Error("Conta Google indisponível para sincronização realtime.");
      if(texto(op?.collection)!=="notas"||!texto(op?.itemId))throw new Error("Operação de coleção inválida.");
      const ref=db.ref(`sheetRealtime/${uid}/${op.sheetId}/collections/notas/${campoParaChave(op.itemId)}`);
      let registroAtual=null;
      const resultado=await ref.transaction(atual=>{
        if(atual&&compararRegistros(op,atual)<=0){registroAtual=atual;return;}
        const registro=registroParaFirebase(op);
        registro.id=op.itemId;
        return registro;
      });
      if(!resultado.committed){
        removerOutboxColecao(op,uid);
        const atual=registroAtual||resultado.snapshot?.val?.();
        if(atual&&estadoRT.listener?.sheetId===op.sheetId)aplicarSnapshotNotas(op.sheetId,{[campoParaChave(op.itemId)]:atual});
        return {ok:true,obsolete:true};
      }
      const salvo=resultado.snapshot?.val?.();
      removerOutboxColecao(op,uid);
      if(salvo)registrarVersao(op.sheetId,`@notas:${op.itemId}`,salvo,uid);
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
        const itens=Object.values(lerOutboxColecoes(uid)).filter(op=>op?.sheetId&&texto(op?.collection)==="notas"&&texto(op?.itemId));
        itens.sort((a,b)=>compararRegistros(a,b));
        for(const op of itens){
          try{resultados.push(await enviarOperacaoColecao(op));}
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
      const base=obterFichaAtiva(false);
      if(!fichaPodeUsarRealtime(base))return {skipped:true,reason:"ficha-legada-ou-desativada"};
      const ficha=root.ShinobiOnline?.garantirIdentidadeFichaRealtime?.(localSheetName)||obterFichaAtiva(true);
      const realtimeId=realtimeIdDaFicha(ficha);
      if(!realtimeId||!fichaPodeUsarRealtime(ficha))return {skipped:true,reason:"ficha-indisponivel"};
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

    async function sincronizarItemColecaoConfirmado(localSheetName,collection,itemId,valor,meta={}){
      const colecao=texto(collection),id=texto(itemId);
      if(colecao!=="notas"||!id)return {skipped:true,reason:"colecao-ou-item-invalido"};
      const user=usuarioAtual();
      if(!user)return {skipped:true,reason:"sem-conta-google"};
      const ficha=root.ShinobiOnline?.garantirIdentidadeFichaRealtime?.(localSheetName)||obterFichaAtiva(true);
      const realtimeId=realtimeIdDaFicha(ficha);
      if(!realtimeId||!fichaPodeUsarRealtime(ficha))return {skipped:true,reason:"ficha-indisponivel"};
      const uid=texto(user.uid),deleted=meta.deleted===true;
      const op=criarOperacaoColecaoPura({
        uid,sheetId:realtimeId,sheetName:ficha.name,collection:colecao,itemId:id,valor,deleted,
        editAt:Number(meta.editAt||timestampEdicao()),deviceId:deviceId(),opId:idAleatorio("note")
      });
      adicionarOutboxColecao(op,uid);
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
    root.ShinobiOnline.sincronizarItemColecaoConfirmado=sincronizarItemColecaoConfirmado;
    root.ShinobiOnline.sincronizarPendenciasRealtime=processarOutbox;
    root.EkoRealtimeSync={
      sincronizarCampoConfirmado,sincronizarItemColecaoConfirmado,processarOutbox,reconciliar,ativarFichaAtual,temPendencias,
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
