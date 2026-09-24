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
  const CHAVE_SERVER_OFFSET="shinobi_server_time_offset_v2";
  const CHAVE_DEVICE="shinobi_device_id_v1";
  const CHAVE_COLECAO_OUTBOX_BASE="shinobi_collection_outbox_v1";
  const CHAVE_COLECAO_VERSOES_BASE="shinobi_collection_versions_v1";

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

  const CAMPOS_ITEM_LEVEL=new Map([["notasTopicos","notas"],["inventarioItens","inventario"],["jutsus","jutsus"],["armados","armados"],["kekkeiGenkai","kekkeiGenkai"],["carteira","carteiraMoedas"],["carteiraHistorico","carteiraHistorico"],["efeitosBatalhaAtivos","efeitosBatalha"]]);
  const COLECOES_ITEM_LEVEL=new Set(["notas","inventario","jutsus","armados","kekkeiGenkai","carteiraMoedas","carteiraHistorico","efeitosBatalha"]);

  function campoGerenciadoPorColecao(campo){
    return CAMPOS_ITEM_LEVEL.has(texto(campo));
  }
  function colecaoPermitida(colecao){
    return COLECOES_ITEM_LEVEL.has(texto(colecao));
  }
  function normalizarItemColecao(colecao,valor,itemId=""){
    if(valor==null||typeof valor!=="object"||Array.isArray(valor))return clonar(valor);
    const copia=clonar(valor)||{};
    const collection=texto(colecao);
    if(collection==="notas") delete copia.aberto;
    if(["notas","inventario","carteiraHistorico","efeitosBatalha"].includes(collection)&&itemId)copia.id=texto(itemId);
    if(collection==="carteiraMoedas"){
      const chave=texto(itemId||copia.chave).toLowerCase();
      const quantidade=Math.max(0,Number.parseInt(copia.quantidade,10)||0);
      return {chave,quantidade};
    }
    if(collection==="armados"&&itemId)copia.ataqueId=texto(itemId);
    if(collection==="kekkeiGenkai"&&itemId)copia.kekkeiId=texto(itemId);
    if(collection==="jutsus"){
      delete copia.imagem;
      delete copia.imagemId;
      if(itemId)copia.jutsuId=texto(itemId);
    }
    return copia;
  }
  function criarOperacaoColecaoPura({sheetId,sheetName,colecao,itemId,valor,deleted=false,editAt,deviceId,opId,uid=""}){
    const collection=texto(colecao),id=texto(itemId);
    const removida=deleted===true||valor===undefined;
    const op={
      kind:"collection",uid:texto(uid),sheetId:texto(sheetId),sheetName:texto(sheetName)||"Principal",
      collection,itemId:id,deleted:removida,editAt:Number(editAt||agora()),deviceId:texto(deviceId),
      opId:texto(opId)||idAleatorio("item")
    };
    if(!removida)op.payload=JSON.stringify(normalizarItemColecao(collection,valor,id));
    return op;
  }
  function aplicarRegistroColecaoPuro(colecao,itens,itemId,registro){
    const collection=texto(colecao),id=texto(itemId);
    if(!colecaoPermitida(collection)||!id||!registro){
      return collection==="carteiraMoedas"?(itens&&typeof itens==="object"&&!Array.isArray(itens)?clonar(itens):{}):(Array.isArray(itens)?clonar(itens):[]);
    }
    if(collection==="carteiraMoedas"){
      const carteira=itens&&typeof itens==="object"&&!Array.isArray(itens)?clonar(itens):{};
      const chave=id.toLowerCase();
      if(!["pd","po","pp","pc"].includes(chave))return carteira;
      if(registro.deleted===true){carteira[chave]=0;return carteira;}
      let remoto;
      try{remoto=JSON.parse(String(registro.payload??"null"));}catch(_e){return carteira;}
      if(!remoto||typeof remoto!=="object"||Array.isArray(remoto)||texto(remoto.chave).toLowerCase()!==chave)return carteira;
      carteira[chave]=Math.max(0,Number.parseInt(remoto.quantidade,10)||0);
      return carteira;
    }
    const lista=Array.isArray(itens)?clonar(itens):[];
    const indice=lista.findIndex(item=>texto(collection==="jutsus"?item?.jutsuId:collection==="armados"?item?.ataqueId:collection==="kekkeiGenkai"?item?.kekkeiId:item?.id)===id);
    if(registro.deleted===true){
      if(indice>=0)lista.splice(indice,1);
      return lista;
    }
    let remoto;
    try{remoto=JSON.parse(String(registro.payload??"null"));}catch(_e){return lista;}
    if(!remoto||typeof remoto!=="object"||Array.isArray(remoto))return lista;
    remoto=normalizarItemColecao(collection,remoto,id);
    if(collection==="notas"){
      const aberto=indice>=0?Boolean(lista[indice]?.aberto):false;
      remoto.aberto=aberto;
    }
    if(collection==="jutsus"&&indice>=0){
      const local=lista[indice];
      if(Object.prototype.hasOwnProperty.call(local||{},"imagem"))remoto.imagem=local.imagem;
      if(Object.prototype.hasOwnProperty.call(local||{},"imagemId"))remoto.imagemId=local.imagemId;
    }
    if(indice>=0)lista[indice]=remoto;else lista.push(remoto);
    if(collection==="jutsus"||collection==="armados"||collection==="kekkeiGenkai"){
      lista.sort((a,b)=>{
        const oa=Number(a?.ordem),ob=Number(b?.ordem);
        const va=Number.isFinite(oa)?oa:Number.MAX_SAFE_INTEGER;
        const vb=Number.isFinite(ob)?ob:Number.MAX_SAFE_INTEGER;
        if(va!==vb)return va-vb;
        return texto(collection==="jutsus"?a?.jutsuId:collection==="armados"?a?.ataqueId:a?.kekkeiId).localeCompare(texto(collection==="jutsus"?b?.jutsuId:collection==="armados"?b?.ataqueId:b?.kekkeiId));
      });
    }
    if(collection==="carteiraHistorico"){
      lista.sort((a,b)=>{
        const da=Number(a?.data||0),db=Number(b?.data||0);
        if(da!==db)return db-da;
        return texto(b?.id).localeCompare(texto(a?.id));
      });
      return lista.slice(0,40);
    }
    return lista;
  }

  function slugRegularizacao(valor,limite=72){
    return texto(valor)
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .toLowerCase().replace(/[^a-z0-9]+/g,"-")
      .replace(/^-+|-+$/g,"").slice(0,limite)||"item";
  }
  function hashRegularizacao(valor){
    const str=String(valor==null?"":valor);
    let hash=2166136261;
    for(let i=0;i<str.length;i+=1){hash^=str.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return (hash>>>0).toString(36);
  }
  function ordenarObjetoRegularizacao(valor){
    if(Array.isArray(valor))return valor.map(ordenarObjetoRegularizacao);
    if(!valor||typeof valor!=="object")return valor;
    const saida={};
    Object.keys(valor).sort().forEach(chave=>{saida[chave]=ordenarObjetoRegularizacao(valor[chave]);});
    return saida;
  }
  function campoIdColecao(colecao){const collection=texto(colecao);return collection==="jutsus"?"jutsuId":collection==="armados"?"ataqueId":collection==="kekkeiGenkai"?"kekkeiId":"id";}
  function itemComparavelRegularizacao(colecao,item){
    const collection=texto(colecao),copia=clonar(item)||{};
    if(!copia||typeof copia!=="object"||Array.isArray(copia))return copia;
    delete copia[campoIdColecao(collection)];
    if(collection==="notas")delete copia.aberto;
    if(collection==="jutsus"){
      delete copia.imagem;delete copia.imagemId;delete copia.ordem;
    }
    if(collection==="armados"||collection==="kekkeiGenkai")delete copia.ordem;
    return ordenarObjetoRegularizacao(copia);
  }
  function fingerprintRegularizacao(colecao,item){
    return hashRegularizacao(JSON.stringify(itemComparavelRegularizacao(colecao,item)));
  }
  function idLegadoRegularizacao(colecao,item){
    const collection=texto(colecao);
    if(collection==="notas"){
      return `nota_legado_${slugRegularizacao(item?.titulo||"nota",36)}`;
    }
    if(collection==="inventario"){
      const catalogo=slugRegularizacao(item?.catalogoSlug||item?.slug||"",64);
      if(catalogo!=="item")return `inv_legado_catalogo_${catalogo}`.slice(0,170);
      const nome=slugRegularizacao(item?.nome||"item",64);
      const tipo=slugRegularizacao(item?.tipo||"",64);
      const dano=slugRegularizacao(item?.dano||"",64);
      const complemento=[tipo,dano].filter(v=>v&&v!=="item").join("_");
      return `inv_legado_${nome}${complemento?`_${complemento}`:""}`.slice(0,170);
    }
    if(collection==="armados"){
      const existente=texto(item?.id||item?.uuid);
      if(existente)return `ataque_legado_id_${slugRegularizacao(existente)}`.slice(0,170);
      const assinatura=[texto(item?.nome),texto(item?.tipo||"armado"),texto(item?.dano),texto(item?.itemInventario)].join("\u241f");
      return `ataque_legado_${slugRegularizacao(item?.nome||"ataque")}_${hashRegularizacao(assinatura)}`.slice(0,170);
    }
    if(collection==="kekkeiGenkai"){
      const existente=texto(item?.id||item?.uuid);
      if(existente)return `kekkei_legado_id_${slugRegularizacao(existente)}`.slice(0,170);
      return `kekkei_legado_${slugRegularizacao(item?.nome||"kekkei")}`.slice(0,170);
    }
    if(collection==="jutsus"){
      const catalogo=texto(item?.catalogoId);
      if(catalogo)return `jutsu_catalogo_${slugRegularizacao(catalogo)}`.slice(0,170);
      const existente=texto(item?.id||item?.uuid);
      if(existente)return `jutsu_legado_id_${slugRegularizacao(existente)}`.slice(0,170);
      const assinatura=[texto(item?.nome),texto(item?.rank),texto(item?.elemento),texto(item?.categoria),texto(item?.tipoNome)].join("\u241f");
      return `jutsu_legado_${slugRegularizacao(item?.nome||"jutsu")}_${hashRegularizacao(assinatura)}`.slice(0,170);
    }
    return `item_legado_${hashRegularizacao(JSON.stringify(itemComparavelRegularizacao(collection,item)))}`;
  }
  function normalizarListaLegada(colecao,itens){
    const collection=texto(colecao),campoId=campoIdColecao(collection),usados=new Set(),saida=[];
    (Array.isArray(itens)?itens:[]).forEach((valor,indice)=>{
      if(!valor||typeof valor!=="object"||Array.isArray(valor))return;
      const item=clonar(valor)||{};
      let id=texto(item[campoId])||idLegadoRegularizacao(collection,item);
      if(usados.has(id)){
        const base=id.slice(0,165)||`${collection}_legado`;
        let sufixo=2;
        while(usados.has(`${base}_${sufixo}`))sufixo+=1;
        id=`${base}_${sufixo}`.slice(0,180);
      }
      item[campoId]=id;
      if((collection==="jutsus"||collection==="armados"||collection==="kekkeiGenkai")&&!Number.isFinite(Number(item.ordem)))item.ordem=indice;
      usados.add(id);saida.push(item);
    });
    return saida;
  }
  function extrairRealtimeRegularizacao(colecao,valor){
    const collection=texto(colecao),ativos=[],deletados=new Set();
    const registros=valor&&typeof valor==="object"&&!Array.isArray(valor)?valor:{};
    Object.values(registros).forEach(registro=>{
      const id=texto(registro?.itemId);
      if(!id||texto(registro?.collection)!==collection)return;
      if(registro.deleted===true){deletados.add(id);return;}
      let item;
      try{item=JSON.parse(String(registro?.payload??"null"));}catch(_e){return;}
      if(!item||typeof item!=="object"||Array.isArray(item))return;
      item=normalizarItemColecao(collection,item,id);
      ativos.push(item);
    });
    return {ativos,deletados};
  }
  function novoIdColisaoRegularizacao(base,fingerprint,usados){
    const raiz=(texto(base)||"item").slice(0,145);
    let id=`${raiz}__rec_${fingerprint}`.slice(0,180),sufixo=2;
    while(usados.has(id))id=`${raiz}__rec_${fingerprint}_${sufixo++}`.slice(0,180);
    return id;
  }
  function preservarLocaisRegularizacao(colecao,destino,origem){
    const collection=texto(colecao);
    if(collection==="notas"&&Object.prototype.hasOwnProperty.call(origem||{},"aberto"))destino.aberto=Boolean(origem.aberto);
    if(collection==="jutsus"){
      if(Object.prototype.hasOwnProperty.call(origem||{},"imagem"))destino.imagem=origem.imagem;
      if(Object.prototype.hasOwnProperty.call(origem||{},"imagemId"))destino.imagemId=origem.imagemId;
      if(Number.isFinite(Number(origem?.ordem)))destino.ordem=Number(origem.ordem);
    }
  }
  function mesclarColecaoLegadaPura(colecao,{local=[],backup=[],realtime={}}={}){
    const collection=texto(colecao),campoId=campoIdColecao(collection);
    if(!colecaoPermitida(collection))return {items:[],toPublish:[],conflicts:0,skippedDeleted:0};
    const localNorm=normalizarListaLegada(collection,local);
    const backupNorm=normalizarListaLegada(collection,backup);
    const rt=extrairRealtimeRegularizacao(collection,realtime);
    const rtNorm=normalizarListaLegada(collection,rt.ativos);
    const items=[],porId=new Map(),porFingerprint=new Map(),usados=new Set();
    let conflicts=0,skippedDeleted=0;

    const adicionar=(item,origem)=>{
      const copia=clonar(item)||{};
      let id=texto(copia[campoId])||idLegadoRegularizacao(collection,copia);
      if(origem!=="realtime"&&rt.deletados.has(id)){skippedDeleted+=1;return;}
      let fp=fingerprintRegularizacao(collection,copia);
      const igual=porFingerprint.get(fp);
      if(igual){
        if(origem==="local")preservarLocaisRegularizacao(collection,igual,copia);
        return;
      }
      const mesmoId=porId.get(id);
      if(mesmoId){
        id=novoIdColisaoRegularizacao(id,fp,usados);
        copia[campoId]=id;
        conflicts+=1;
        fp=fingerprintRegularizacao(collection,copia);
      }else{
        copia[campoId]=id;
      }
      usados.add(id);porId.set(id,copia);porFingerprint.set(fp,copia);items.push(copia);
    };

    rtNorm.forEach(item=>adicionar(item,"realtime"));
    localNorm.forEach(item=>adicionar(item,"local"));
    backupNorm.forEach(item=>adicionar(item,"backup"));

    if(collection==="jutsus"||collection==="armados"){
      const ordemLocal=new Map(localNorm.map((item,indice)=>[fingerprintRegularizacao(collection,item),indice]));
      items.sort((a,b)=>{
        const fa=fingerprintRegularizacao(collection,a),fb=fingerprintRegularizacao(collection,b);
        const oa=ordemLocal.has(fa)?ordemLocal.get(fa):100000+Number(a?.ordem||0);
        const ob=ordemLocal.has(fb)?ordemLocal.get(fb):100000+Number(b?.ordem||0);
        return oa-ob||texto(a[campoId]).localeCompare(texto(b[campoId]));
      });
      items.forEach((item,indice)=>item.ordem=indice);
    }
    if(collection==="carteiraHistorico"){
      items.sort((a,b)=>{
        const da=Number(a?.data||0),db=Number(b?.data||0);
        if(da!==db)return db-da;
        return texto(b?.id).localeCompare(texto(a?.id));
      });
      if(items.length>40)items.splice(40);
    }

    const remotoPorId=new Map(rtNorm.map(item=>[texto(item[campoId]),fingerprintRegularizacao(collection,item)]));
    const toPublish=[];
    items.forEach(item=>{
      const id=texto(item[campoId]),fp=fingerprintRegularizacao(collection,item);
      if(!id||rt.deletados.has(id))return;
      if(remotoPorId.get(id)===fp)return;
      toPublish.push({itemId:id,value:clonar(item)});
    });
    return {items,toPublish,conflicts,skippedDeleted};
  }

  function normalizarCarteiraRegularizacao(valor){
    const origem=valor&&typeof valor==="object"&&!Array.isArray(valor)?valor:{};
    const saida={};
    ["pd","po","pp","pc"].forEach(chave=>{saida[chave]=Math.max(0,Number.parseInt(origem[chave],10)||0);});
    return saida;
  }
  function extrairCarteiraRealtimeRegularizacao(valor){
    const registros=valor&&typeof valor==="object"&&!Array.isArray(valor)?valor:{};
    const ativos={},deletados=new Set();
    Object.values(registros).forEach(registro=>{
      const id=texto(registro?.itemId).toLowerCase();
      if(!["pd","po","pp","pc"].includes(id)||texto(registro?.collection)!=="carteiraMoedas")return;
      if(registro.deleted===true){deletados.add(id);return;}
      let item;
      try{item=JSON.parse(String(registro?.payload??"null"));}catch(_e){return;}
      if(!item||typeof item!=="object"||Array.isArray(item)||texto(item.chave).toLowerCase()!==id)return;
      ativos[id]=Math.max(0,Number.parseInt(item.quantidade,10)||0);
    });
    return {ativos,deletados};
  }
  function regularizarCarteiraMoedasPura({local={},backup={},realtime={}}={}){
    const localObj=local&&typeof local==="object"&&!Array.isArray(local)?local:{};
    const backupObj=backup&&typeof backup==="object"&&!Array.isArray(backup)?backup:{};
    const rt=extrairCarteiraRealtimeRegularizacao(realtime);
    const carteira={},toPublish=[];
    let exclusoesRespeitadas=0;
    ["pd","po","pp","pc"].forEach(chave=>{
      if(Object.prototype.hasOwnProperty.call(rt.ativos,chave)){
        carteira[chave]=rt.ativos[chave];
        return;
      }
      if(rt.deletados.has(chave)){carteira[chave]=0;exclusoesRespeitadas+=1;return;}
      const fonte=Object.prototype.hasOwnProperty.call(localObj,chave)?localObj:backupObj;
      const quantidade=Math.max(0,Number.parseInt(fonte?.[chave],10)||0);
      carteira[chave]=quantidade;
      toPublish.push({itemId:chave,value:{chave,quantidade}});
    });
    return {carteira,toPublish,total:4,skippedDeleted:exclusoesRespeitadas};
  }

  async function enviarLoteRegularizacaoPuro(operacoes,enviar){
    const lista=Array.isArray(operacoes)?operacoes.filter(Boolean):[];
    if(typeof enviar!=="function")throw new TypeError("Função de envio da regularização indisponível.");
    const resultados=[],falhas=[];
    for(const op of lista){
      try{
        const resultado=await enviar(op);
        if(resultado?.ok===false){
          const erro=resultado.error||new Error("Operação recusada sem detalhe adicional.");
          falhas.push({
            collection:texto(op?.collection),itemId:texto(op?.itemId),opId:texto(op?.opId),
            code:texto(erro?.code||resultado?.code),message:texto(erro?.message||resultado?.message||erro)
          });
        }else{
          resultados.push({op,resultado});
        }
      }catch(erro){
        falhas.push({
          collection:texto(op?.collection),itemId:texto(op?.itemId),opId:texto(op?.opId),
          code:texto(erro?.code),message:texto(erro?.message||erro)
        });
      }
    }
    return {ok:falhas.length===0,resultados,falhas};
  }

  function proximoEditAtColecaoPuro(timestampAtual,versaoAplicada,operacaoPendente,editAtSolicitado){
    const base=Number(editAtSolicitado||timestampAtual||0);
    const anterior=Number(versaoAplicada?.editAt||0);
    const pendente=Number(operacaoPendente?.editAt||0);
    return Math.max(base,anterior+1,pendente+1);
  }

  function mensagemFalhasRegularizacaoPura(falhas){
    const lista=Array.isArray(falhas)?falhas.filter(Boolean):[];
    if(!lista.length)return "";
    const linhas=lista.slice(0,3).map(falha=>{
      const alvo=[texto(falha?.collection),texto(falha?.itemId)].filter(Boolean).join(" / ")||"item";
      const codigo=texto(falha?.code);
      const mensagem=texto(falha?.message)||"falha sem detalhe";
      return `${alvo}${codigo?` (${codigo})`:""}: ${mensagem}`;
    });
    if(lista.length>3)linhas.push(`+ ${lista.length-3} falha(s) adicional(is)`);
    return `A regularização consolidou os dados locais, mas ${lista.length} item(ns) não puderam ser publicados agora. Os itens que falharam continuam na fila para nova tentativa.\n\n${linhas.join("\n")}`;
  }

  const test={
    compararRegistros,registroMaisNovo,criarOperacaoPura,realtimeIdDaFicha,fichaPodeUsarRealtime,
    criarOperacaoColecaoPura,aplicarRegistroColecaoPuro,campoGerenciadoPorColecao,colecaoPermitida,
    mesclarColecaoLegadaPura,fingerprintRegularizacao,normalizarListaLegada,regularizarCarteiraMoedasPura,
    enviarLoteRegularizacaoPuro,mensagemFalhasRegularizacaoPura,proximoEditAtColecaoPuro
  };

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
      listenerNotas:null,
      listenerInventario:null,
      listenerJutsus:null,
      listenerArmados:null,
      listenerKekkeiGenkai:null,
      listenerCarteiraMoedas:null,
      listenerCarteiraHistorico:null,
      listenerEfeitosBatalha:null,
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
    function chaveOperacaoColecao(sheetId,colecao,itemId){
      return `${texto(sheetId)}::${texto(colecao)}::${campoParaChave(itemId)}`;
    }
    function lerOutboxColecoes(uid=uidAtual()){return lerJson(chaveConta(CHAVE_COLECAO_OUTBOX_BASE,uid),{});}
    function salvarOutboxColecoes(valor,uid=uidAtual()){salvarJson(chaveConta(CHAVE_COLECAO_OUTBOX_BASE,uid),valor||{});}
    function lerVersoesColecoes(uid=uidAtual()){return lerJson(chaveConta(CHAVE_COLECAO_VERSOES_BASE,uid),{});}
    function salvarVersoesColecoes(valor,uid=uidAtual()){salvarJson(chaveConta(CHAVE_COLECAO_VERSOES_BASE,uid),valor||{});}
    function registrarVersaoColecao(sheetId,colecao,itemId,registro,uid=uidAtual()){
      if(!uid||!sheetId||!colecao||!itemId||!registro)return;
      const todos=lerVersoesColecoes(uid);
      todos[chaveOperacaoColecao(sheetId,colecao,itemId)]={editAt:Number(registro.editAt||0),opId:texto(registro.opId)};
      salvarVersoesColecoes(todos,uid);
    }
    function versaoColecaoAplicada(sheetId,colecao,itemId,uid=uidAtual()){
      return lerVersoesColecoes(uid)?.[chaveOperacaoColecao(sheetId,colecao,itemId)]||null;
    }
    function adicionarOutboxColecao(op,uid=uidAtual()){
      if(!uid||!op?.sheetId||!colecaoPermitida(op?.collection)||!texto(op?.itemId))return;
      const todos=lerOutboxColecoes(uid),chave=chaveOperacaoColecao(op.sheetId,op.collection,op.itemId),anterior=todos[chave];
      if(!anterior||compararRegistros(op,anterior)>=0)todos[chave]=op;
      salvarOutboxColecoes(todos,uid);
    }
    function removerOutboxColecao(op,uid=uidAtual()){
      if(!uid||!op?.sheetId||!op?.collection||!op?.itemId)return;
      const todos=lerOutboxColecoes(uid),chave=chaveOperacaoColecao(op.sheetId,op.collection,op.itemId),atual=todos[chave];
      if(!atual)return;
      if(op.opId&&texto(atual.opId)!==texto(op.opId))return;
      delete todos[chave];
      salvarOutboxColecoes(todos,uid);
    }
    function operacaoColecaoPendente(sheetId,colecao,itemId,uid=uidAtual()){
      return lerOutboxColecoes(uid)?.[chaveOperacaoColecao(sheetId,colecao,itemId)]||null;
    }
    function temPendencias(sheetId="",uid=uidAtual()){
      const id=texto(sheetId);
      const campos=Object.values(lerOutbox(uid)).some(op=>!id||texto(op?.sheetId)===id);
      const colecoes=Object.values(lerOutboxColecoes(uid)).some(op=>!id||texto(op?.sheetId)===id);
      return campos||colecoes;
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

    function registroColecaoParaFirebase(op){
      const registro={
        collection:texto(op.collection),itemId:texto(op.itemId),deleted:op.deleted===true,
        editAt:Number(op.editAt||0),serverUpdatedAt:root.firebase.database.ServerValue.TIMESTAMP,
        deviceId:texto(op.deviceId),opId:texto(op.opId)
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
      const bonusCombateMap={
        batalhaBonusForca:'[data-bonus-batalha="forca"]',
        batalhaBonusDestreza:'[data-bonus-batalha="destreza"]',
        batalhaBonusConstituicao:'[data-bonus-batalha="constituicao"]',
        batalhaBonusInteligencia:'[data-bonus-batalha="inteligencia"]',
        batalhaBonusSabedoria:'[data-bonus-batalha="sabedoria"]',
        batalhaBonusCarisma:'[data-bonus-batalha="carisma"]',
        batalhaBonusCA:'[data-bonus-defesa-batalha="ca"]',
        batalhaBonusCD:'[data-bonus-defesa-batalha="cd"]'
      };
      let atualizouBonusCombate=false;
      try{
        lista.forEach(campo=>{
          const seletor=bonusCombateMap[campo];if(!seletor)return;
          const input=root.document.querySelector(seletor);if(!input)return;
          input.value=String(dados?.[campo]??0);atualizouBonusCombate=true;
        });
      }catch(_e){}
      const chamar=nome=>{try{if(typeof root[nome]==="function")root[nome]();}catch(_e){}};
      if(atualizouBonusCombate){
        chamar("atualizarModsBatalhaComBonus");
        chamar("atualizarDefesasTotaisBatalha");
        chamar("atualizarBonusBatalhaCompacto");
      }
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
        /* Campos migrados para collections/{colecao}/{itemId} não podem mais ser
           reaplicados pelo registro legado em fields, senão um array antigo pode
           sobrescrever o merge item-level. */
        if(campoGerenciadoPorColecao(campo))continue;
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

    function campoLocalDaColecao(colecao){
      const collection=texto(colecao);
      if(collection==="notas")return "notasTopicos";
      if(collection==="inventario")return "inventarioItens";
      if(collection==="jutsus")return "jutsus";
      if(collection==="armados")return "armados";
      if(collection==="kekkeiGenkai")return "kekkeiGenkai";
      if(collection==="carteiraMoedas")return "carteira";
      if(collection==="carteiraHistorico")return "carteiraHistorico";
      if(collection==="efeitosBatalha")return "efeitosBatalhaAtivos";
      return "";
    }

    function aplicarSnapshotColecao(sheetId,colecao,valor){
      const uid=uidAtual(),collection=texto(colecao),campoLocal=campoLocalDaColecao(collection);
      if(!uid||!colecaoPermitida(collection)||!campoLocal)return [];
      const fichaBase=obterFichaAtiva(false);
      if(!fichaPodeUsarRealtime(fichaBase))return [];
      const ficha=fichaBase?root.ShinobiOnline?.garantirIdentidadeFichaRealtime?.(fichaBase.name)||fichaBase:null;
      if(!ficha||!fichaPodeUsarRealtime(ficha)||realtimeIdDaFicha(ficha)!==texto(sheetId))return [];
      if(collection==="notas"){
        try{root.garantirTopicosNotas?.();}catch(_e){}
      }
      if(collection==="inventario"){
        try{root.ShinobiInventarioItemLevel?.garantirEstado?.();}catch(_e){}
      }
      if(collection==="jutsus"){
        try{root.ShinobiJutsusItemLevel?.garantirEstado?.();}catch(_e){}
      }
      if(collection==="armados"){
        try{root.ShinobiArmadosItemLevel?.garantirEstado?.();}catch(_e){}
      }
      if(collection==="kekkeiGenkai"){
        try{root.ShinobiKekkeiItemLevel?.garantirEstado?.();}catch(_e){}
      }
      if(collection==="carteiraMoedas"||collection==="carteiraHistorico"){
        try{root.ShinobiWalletItemLevel?.garantirEstado?.();}catch(_e){}
      }
      let dados={};
      try{dados=JSON.parse(root.localStorage.getItem(ficha.key)||"{}");}catch(_e){dados=clonar(ficha.data||{});}
      if(!dados||typeof dados!=="object"||Array.isArray(dados))dados={};
      let itens=collection==="carteiraMoedas"
        ?(dados[campoLocal]&&typeof dados[campoLocal]==="object"&&!Array.isArray(dados[campoLocal])?clonar(dados[campoLocal]):{pd:0,po:0,pp:0,pc:0})
        :(Array.isArray(dados[campoLocal])?clonar(dados[campoLocal]):[]);
      const aplicados=[];
      const registros=valor&&typeof valor==="object"?valor:{};
      for(const [chave,registro] of Object.entries(registros)){
        const itemId=texto(registro?.itemId)||(util?.chaveParaCampo?util.chaveParaCampo(chave):texto(chave));
        if(!registro||texto(registro.collection)!==collection||!itemId||texto(registro.itemId)!==itemId)continue;
        const anterior=versaoColecaoAplicada(sheetId,collection,itemId,uid);
        if(anterior&&compararRegistros(registro,anterior)<=0)continue;
        const pendente=operacaoColecaoPendente(sheetId,collection,itemId,uid);
        if(pendente&&compararRegistros(pendente,registro)>0)continue;
        if(pendente&&compararRegistros(registro,pendente)>=0)removerOutboxColecao(pendente,uid);
        itens=aplicarRegistroColecaoPuro(collection,itens,itemId,registro);
        registrarVersaoColecao(sheetId,collection,itemId,registro,uid);
        aplicados.push(itemId);
      }
      if(aplicados.length){
        dados[campoLocal]=clonar(itens);
        try{
          if(typeof estado!=="undefined"&&estado&&typeof estado==="object"){
            estado[campoLocal]=clonar(itens);
            if(collection==="jutsus")estado.jutsusAbertos={};
            if(collection==="armados")estado.ataquesAbertos={};
          }
        }catch(_e){}
        try{root.localStorage.setItem(ficha.key,JSON.stringify(dados));}catch(_e){}
        agendarAtualizacaoUi([campoLocal],dados);
        try{root.dispatchEvent(new CustomEvent("shinobi:realtime-colecao-aplicada",{detail:{sheetId,collection,itemIds:aplicados}}));}catch(_e){}
      }
      return aplicados;
    }

    function desconectarListener(){
      const atual=estadoRT.listener;
      if(atual){try{atual.ref.off("value",atual.callback);}catch(_e){}}
      const notas=estadoRT.listenerNotas;
      if(notas){try{notas.ref.off("value",notas.callback);}catch(_e){}}
      const inventario=estadoRT.listenerInventario;
      if(inventario){try{inventario.ref.off("value",inventario.callback);}catch(_e){}}
      const jutsus=estadoRT.listenerJutsus;
      if(jutsus){try{jutsus.ref.off("value",jutsus.callback);}catch(_e){}}
      const armados=estadoRT.listenerArmados;
      if(armados){try{armados.ref.off("value",armados.callback);}catch(_e){}}
      const kekkeiGenkai=estadoRT.listenerKekkeiGenkai;
      if(kekkeiGenkai){try{kekkeiGenkai.ref.off("value",kekkeiGenkai.callback);}catch(_e){}}
      const carteiraMoedas=estadoRT.listenerCarteiraMoedas;
      if(carteiraMoedas){try{carteiraMoedas.ref.off("value",carteiraMoedas.callback);}catch(_e){}}
      const carteiraHistorico=estadoRT.listenerCarteiraHistorico;
      if(carteiraHistorico){try{carteiraHistorico.ref.off("value",carteiraHistorico.callback);}catch(_e){}}
      const efeitosBatalha=estadoRT.listenerEfeitosBatalha;
      if(efeitosBatalha){try{efeitosBatalha.ref.off("value",efeitosBatalha.callback);}catch(_e){}}
      estadoRT.listener=null;
      estadoRT.listenerNotas=null;
      estadoRT.listenerInventario=null;
      estadoRT.listenerJutsus=null;
      estadoRT.listenerArmados=null;
      estadoRT.listenerKekkeiGenkai=null;
      estadoRT.listenerCarteiraMoedas=null;
      estadoRT.listenerCarteiraHistorico=null;
      estadoRT.listenerEfeitosBatalha=null;
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
      if(estadoRT.listener&&estadoRT.listener.uid===uid&&estadoRT.listener.sheetId===sheetId&&
         estadoRT.listenerNotas&&estadoRT.listenerNotas.uid===uid&&estadoRT.listenerNotas.sheetId===sheetId&&
         estadoRT.listenerInventario&&estadoRT.listenerInventario.uid===uid&&estadoRT.listenerInventario.sheetId===sheetId&&
         estadoRT.listenerJutsus&&estadoRT.listenerJutsus.uid===uid&&estadoRT.listenerJutsus.sheetId===sheetId&&
         estadoRT.listenerArmados&&estadoRT.listenerArmados.uid===uid&&estadoRT.listenerArmados.sheetId===sheetId&&
         estadoRT.listenerKekkeiGenkai&&estadoRT.listenerKekkeiGenkai.uid===uid&&estadoRT.listenerKekkeiGenkai.sheetId===sheetId&&
         estadoRT.listenerCarteiraMoedas&&estadoRT.listenerCarteiraMoedas.uid===uid&&estadoRT.listenerCarteiraMoedas.sheetId===sheetId&&
         estadoRT.listenerCarteiraHistorico&&estadoRT.listenerCarteiraHistorico.uid===uid&&estadoRT.listenerCarteiraHistorico.sheetId===sheetId&&
         estadoRT.listenerEfeitosBatalha&&estadoRT.listenerEfeitosBatalha.uid===uid&&estadoRT.listenerEfeitosBatalha.sheetId===sheetId){
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

      const refNotas=db.ref(`sheetRealtime/${uid}/${sheetId}/collections/notas`);
      const callbackNotas=snap=>{
        try{aplicarSnapshotColecao(sheetId,"notas",snap.val()||{});}catch(erro){console.warn("Falha ao aplicar notas item-level.",erro);}
      };
      refNotas.on("value",callbackNotas,erro=>{
        console.warn("Realtime item-level de notas indisponível.",erro?.code||erro?.message||erro);
        try{root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:"Sincronização das notas indisponível. As notas locais continuam salvas neste aparelho."}}));}catch(_e){}
      });
      estadoRT.listenerNotas={uid,sheetId,ref:refNotas,callback:callbackNotas};

      const refInventario=db.ref(`sheetRealtime/${uid}/${sheetId}/collections/inventario`);
      const callbackInventario=snap=>{
        try{aplicarSnapshotColecao(sheetId,"inventario",snap.val()||{});}catch(erro){console.warn("Falha ao aplicar inventário item-level.",erro);}
      };
      refInventario.on("value",callbackInventario,erro=>{
        console.warn("Realtime item-level do inventário indisponível.",erro?.code||erro?.message||erro);
        try{root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:"Sincronização do inventário indisponível. Os itens locais continuam salvos neste aparelho."}}));}catch(_e){}
      });
      estadoRT.listenerInventario={uid,sheetId,ref:refInventario,callback:callbackInventario};

      const refJutsus=db.ref(`sheetRealtime/${uid}/${sheetId}/collections/jutsus`);
      const callbackJutsus=snap=>{
        try{aplicarSnapshotColecao(sheetId,"jutsus",snap.val()||{});}catch(erro){console.warn("Falha ao aplicar jutsus item-level.",erro);}
      };
      refJutsus.on("value",callbackJutsus,erro=>{
        console.warn("Realtime item-level de jutsus indisponível.",erro?.code||erro?.message||erro);
        try{root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:"Sincronização dos jutsus indisponível. Os jutsus locais continuam salvos neste aparelho."}}));}catch(_e){}
      });
      estadoRT.listenerJutsus={uid,sheetId,ref:refJutsus,callback:callbackJutsus};

      const refArmados=db.ref(`sheetRealtime/${uid}/${sheetId}/collections/armados`);
      const callbackArmados=snap=>{
        try{aplicarSnapshotColecao(sheetId,"armados",snap.val()||{});}catch(erro){console.warn("Falha ao aplicar ataques item-level.",erro);}
      };
      refArmados.on("value",callbackArmados,erro=>{
        console.warn("Realtime item-level de ataques indisponível.",erro?.code||erro?.message||erro);
        try{root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:"Sincronização dos ataques indisponível. Os ataques locais continuam salvos neste aparelho."}}));}catch(_e){}
      });
      estadoRT.listenerArmados={uid,sheetId,ref:refArmados,callback:callbackArmados};

      const refKekkeiGenkai=db.ref(`sheetRealtime/${uid}/${sheetId}/collections/kekkeiGenkai`);
      const callbackKekkeiGenkai=snap=>{
        try{aplicarSnapshotColecao(sheetId,"kekkeiGenkai",snap.val()||{});}catch(erro){console.warn("Falha ao aplicar Kekkei Genkai item-level.",erro);}
      };
      refKekkeiGenkai.on("value",callbackKekkeiGenkai,erro=>{
        console.warn("Realtime item-level de Kekkei Genkai indisponível.",erro?.code||erro?.message||erro);
        try{root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:"Sincronização de Kekkei Genkai indisponível. Os dados locais continuam salvos neste aparelho."}}));}catch(_e){}
      });
      estadoRT.listenerKekkeiGenkai={uid,sheetId,ref:refKekkeiGenkai,callback:callbackKekkeiGenkai};

      const refCarteiraMoedas=db.ref(`sheetRealtime/${uid}/${sheetId}/collections/carteiraMoedas`);
      const callbackCarteiraMoedas=snap=>{
        try{aplicarSnapshotColecao(sheetId,"carteiraMoedas",snap.val()||{});}catch(erro){console.warn("Falha ao aplicar carteira por moeda.",erro);}
      };
      refCarteiraMoedas.on("value",callbackCarteiraMoedas,erro=>{
        console.warn("Realtime item-level da carteira indisponível.",erro?.code||erro?.message||erro);
        try{root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:"Sincronização da carteira indisponível. O saldo local continua salvo neste aparelho."}}));}catch(_e){}
      });
      estadoRT.listenerCarteiraMoedas={uid,sheetId,ref:refCarteiraMoedas,callback:callbackCarteiraMoedas};

      const refCarteiraHistorico=db.ref(`sheetRealtime/${uid}/${sheetId}/collections/carteiraHistorico`);
      const callbackCarteiraHistorico=snap=>{
        try{aplicarSnapshotColecao(sheetId,"carteiraHistorico",snap.val()||{});}catch(erro){console.warn("Falha ao aplicar histórico da carteira item-level.",erro);}
      };
      refCarteiraHistorico.on("value",callbackCarteiraHistorico,erro=>{
        console.warn("Realtime item-level do histórico da carteira indisponível.",erro?.code||erro?.message||erro);
        try{root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:"Sincronização do histórico da carteira indisponível. O histórico local continua salvo neste aparelho."}}));}catch(_e){}
      });
      estadoRT.listenerCarteiraHistorico={uid,sheetId,ref:refCarteiraHistorico,callback:callbackCarteiraHistorico};

      const refEfeitosBatalha=db.ref(`sheetRealtime/${uid}/${sheetId}/collections/efeitosBatalha`);
      const callbackEfeitosBatalha=snap=>{
        try{aplicarSnapshotColecao(sheetId,"efeitosBatalha",snap.val()||{});}catch(erro){console.warn("Falha ao aplicar efeitos de batalha item-level.",erro);}
      };
      refEfeitosBatalha.on("value",callbackEfeitosBatalha,erro=>{
        console.warn("Realtime item-level dos efeitos de batalha indisponível.",erro?.code||erro?.message||erro);
        try{root.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:"Sincronização dos efeitos de batalha indisponível. Os efeitos locais continuam salvos neste aparelho."}}));}catch(_e){}
      });
      estadoRT.listenerEfeitosBatalha={uid,sheetId,ref:refEfeitosBatalha,callback:callbackEfeitosBatalha};
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
      if(!uid||!db||texto(op?.uid)!==uid)throw new Error("Conta Google indisponível para sincronização item-level.");
      if(!colecaoPermitida(op?.collection)||!texto(op?.itemId))throw new Error("Coleção item-level inválida.");
      const itemKey=campoParaChave(op.itemId);
      const ref=db.ref(`sheetRealtime/${uid}/${op.sheetId}/collections/${op.collection}/${itemKey}`);
      let registroAtual=null;
      const resultado=await ref.transaction(atual=>{
        if(atual&&compararRegistros(op,atual)<=0){registroAtual=atual;return;}
        return registroColecaoParaFirebase(op);
      });
      if(!resultado.committed){
        removerOutboxColecao(op,uid);
        const atual=registroAtual||resultado.snapshot?.val?.();
        if(atual&&estadoRT.listener?.sheetId===op.sheetId){
          aplicarSnapshotColecao(op.sheetId,op.collection,{[itemKey]:atual});
        }
        return {ok:true,obsolete:true};
      }
      const salvo=resultado.snapshot?.val?.();
      removerOutboxColecao(op,uid);
      if(salvo)registrarVersaoColecao(op.sheetId,op.collection,op.itemId,salvo,uid);
      return {ok:true,record:salvo};
    }

    async function processarOutbox(){
      if(estadoRT.processando){estadoRT.reprocessar=true;return {busy:true};}
      const uid=uidAtual(),db=banco();
      if(!uid||!db||root.navigator?.onLine===false)return {skipped:true};
      estadoRT.processando=true;
      const resultados=[];
      try{
        const pendentesCampos=Object.values(lerOutbox(uid)).filter(op=>op?.sheetId&&campoPermitido(op?.name));
        const pendentesColecoes=Object.values(lerOutboxColecoes(uid)).filter(op=>op?.sheetId&&colecaoPermitida(op?.collection)&&texto(op?.itemId));
        const pendentes=[...pendentesCampos,...pendentesColecoes];
        pendentes.sort((a,b)=>compararRegistros(a,b));
        for(const op of pendentes){
          try{resultados.push(op?.kind==="collection"?await enviarOperacaoColecao(op):await enviarOperacao(op));}
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

    async function sincronizarItemColecaoConfirmado(localSheetName,colecao,itemId,valor,meta={}){
      const collection=texto(colecao),id=texto(itemId);
      if(!colecaoPermitida(collection)||!id)return {skipped:true,reason:"colecao-ou-item-invalido"};
      const user=usuarioAtual();
      if(!user)return {skipped:true,reason:"sem-conta-google"};
      const base=obterFichaAtiva(false);
      if(!fichaPodeUsarRealtime(base))return {skipped:true,reason:"ficha-legada-ou-desativada"};
      const ficha=root.ShinobiOnline?.garantirIdentidadeFichaRealtime?.(localSheetName)||obterFichaAtiva(true);
      const realtimeId=realtimeIdDaFicha(ficha);
      if(!realtimeId||!fichaPodeUsarRealtime(ficha))return {skipped:true,reason:"ficha-indisponivel"};
      const uid=texto(user.uid);
      const editAt=proximoEditAtColecaoPuro(
        timestampEdicao(),
        versaoColecaoAplicada(realtimeId,collection,id,uid),
        operacaoColecaoPendente(realtimeId,collection,id,uid),
        Number(meta.editAt||0)
      );
      const op=criarOperacaoColecaoPura({
        uid,sheetId:realtimeId,sheetName:ficha.name,colecao:collection,itemId:id,valor,
        deleted:meta.deleted===true,editAt,deviceId:deviceId(),opId:idAleatorio("item")
      });
      adicionarOutboxColecao(op,uid);
      if(root.navigator?.onLine===false)return {queued:true,op};
      if(estadoRT.bootLiberado)await ativarFichaAtual().catch(()=>{});
      const resultado=await processarOutbox();
      return {...resultado,op};
    }

    async function regularizarFichaCompleta(localSheetName=""){
      if(root.navigator?.onLine===false)throw new Error("Conecte este aparelho à internet para regularizar a ficha.");
      const user=usuarioAtual(),db=banco();
      if(!user||!db)throw new Error("Entre com a mesma Conta Google usada nos outros aparelhos antes de regularizar a ficha.");
      const fichaBase=obterFichaAtiva(false);
      if(!fichaPodeUsarRealtime(fichaBase))throw new Error("Esta cópia antiga está preservada e não pode substituir a ficha principal.");
      const ficha=root.ShinobiOnline?.garantirIdentidadeFichaRealtime?.(texto(localSheetName)||fichaBase?.name)||obterFichaAtiva(true);
      if(!ficha||!fichaPodeUsarRealtime(ficha))throw new Error("Ficha ativa indisponível para regularização.");
      const uid=texto(user.uid),realtimeId=realtimeIdDaFicha(ficha),backupSheetId=texto(ficha.sheetId);
      if(!realtimeId||!backupSheetId)throw new Error("A ficha ainda não possui identidade de sincronização completa.");

      let dadosLocal={};
      try{dadosLocal=JSON.parse(root.localStorage.getItem(ficha.key)||"{}");}catch(_e){dadosLocal=clonar(ficha.data||{});}
      if(!dadosLocal||typeof dadosLocal!=="object"||Array.isArray(dadosLocal))dadosLocal=clonar(ficha.data||{});

      const [snapBackup,snapColecoes]=await Promise.all([
        db.ref(`userSheets/${uid}/${backupSheetId}`).once("value"),
        db.ref(`sheetRealtime/${uid}/${realtimeId}/collections`).once("value")
      ]);
      const backupCloud=snapBackup?.val?.()||{};
      const dadosBackup=backupCloud?.deleted===true?{}:(backupCloud?.data&&typeof backupCloud.data==="object"?backupCloud.data:{});
      const colecoesCloud=snapColecoes?.val?.()||{};
      const configs=[
        {collection:"notas",field:"notasTopicos"},
        {collection:"inventario",field:"inventarioItens"},
        {collection:"jutsus",field:"jutsus"},
        {collection:"armados",field:"armados"},
        {collection:"kekkeiGenkai",field:"kekkeiGenkai"},
        {collection:"carteiraHistorico",field:"carteiraHistorico"}
      ];
      const detalhes={},publicacoes=[];

      const carteiraResultado=regularizarCarteiraMoedasPura({
        local:dadosLocal?.carteira||{},
        backup:dadosBackup?.carteira||{},
        realtime:colecoesCloud?.carteiraMoedas||{}
      });
      dadosLocal.carteira=clonar(carteiraResultado.carteira);
      detalhes.carteiraMoedas={
        total:carteiraResultado.total,
        novos:carteiraResultado.toPublish.length,
        conflitosPreservados:0,
        exclusoesRespeitadas:carteiraResultado.skippedDeleted
      };
      carteiraResultado.toPublish.forEach(item=>publicacoes.push({collection:"carteiraMoedas",...item}));

      for(const config of configs){
        const resultado=mesclarColecaoLegadaPura(config.collection,{
          local:Array.isArray(dadosLocal?.[config.field])?dadosLocal[config.field]:[],
          backup:Array.isArray(dadosBackup?.[config.field])?dadosBackup[config.field]:[],
          realtime:colecoesCloud?.[config.collection]||{}
        });
        dadosLocal[config.field]=clonar(resultado.items);
        detalhes[config.collection]={
          total:resultado.items.length,
          novos:resultado.toPublish.length,
          conflitosPreservados:resultado.conflicts,
          exclusoesRespeitadas:resultado.skippedDeleted
        };
        resultado.toPublish.forEach(item=>publicacoes.push({collection:config.collection,...item}));
      }

      /* Mantém os metadados/identidade da instalação atual. O backup remoto só
         contribui com conteúdo de coleção; nunca troca owner, characterId ou sheetId. */
      dadosLocal.__online=dadosLocal.__online&&typeof dadosLocal.__online==="object"?dadosLocal.__online:{};
      dadosLocal.__online={...(ficha.data?.__online||{}),...dadosLocal.__online};
      try{root.localStorage.setItem(ficha.key,JSON.stringify(dadosLocal));}catch(_e){throw new Error("Não foi possível salvar o resultado regularizado neste aparelho.");}

      try{
        if(typeof estado!=="undefined"&&estado&&typeof estado==="object"){
          estado.notasTopicos=clonar(dadosLocal.notasTopicos||[]);
          estado.inventarioItens=clonar(dadosLocal.inventarioItens||[]);
          estado.jutsus=clonar(dadosLocal.jutsus||[]);
          estado.armados=clonar(dadosLocal.armados||[]);
          estado.kekkeiGenkai=clonar(dadosLocal.kekkeiGenkai||[]);
          estado.carteira=clonar(dadosLocal.carteira||{pd:0,po:0,pp:0,pc:0});
          estado.carteiraHistorico=clonar(dadosLocal.carteiraHistorico||[]);
        }
      }catch(_e){}
      try{root.persistirEstadoLocal?.({emitir:false,confirmada:false,origem:"regularizacao-historica",motivo:"merge-seguro"});}catch(_e){}
      agendarAtualizacaoUi(["notasTopicos","inventarioItens","jutsus","armados","kekkeiGenkai","carteira","carteiraHistorico"],dadosLocal);

      const editBase=timestampEdicao();
      const operacoesRegularizacao=publicacoes.map((pub,indice)=>{
        const op=criarOperacaoColecaoPura({
          uid,sheetId:realtimeId,sheetName:ficha.name,colecao:pub.collection,itemId:pub.itemId,valor:pub.value,
          deleted:false,editAt:editBase+indice,deviceId:deviceId(),opId:idAleatorio("regulariza")
        });
        adicionarOutboxColecao(op,uid);
        return op;
      });

      /* A regularização envia somente as operações que ela própria criou.
         Pendências antigas de campos, combate ou outras coleções continuam na fila
         normal e não podem fazer este botão falhar por um erro não relacionado. */
      const envio=await enviarLoteRegularizacaoPuro(operacoesRegularizacao,enviarOperacaoColecao);
      if(!envio.ok)throw new Error(mensagemFalhasRegularizacaoPura(envio.falhas));

      if(typeof root.ShinobiOnline?.atualizarBackupEstrutural==="function"){
        await root.ShinobiOnline.atualizarBackupEstrutural(ficha.name,{motivo:"regularizacao-historica"});
      }
      return {
        ok:true,sheetId:backupSheetId,realtimeId,
        published:publicacoes.length,
        details:detalhes,
        total:carteiraResultado.total+configs.reduce((soma,c)=>soma+Number(detalhes[c.collection]?.total||0),0),
        conflicts:configs.reduce((soma,c)=>soma+Number(detalhes[c.collection]?.conflitosPreservados||0),0),
        skippedDeleted:carteiraResultado.skippedDeleted+configs.reduce((soma,c)=>soma+Number(detalhes[c.collection]?.exclusoesRespeitadas||0),0)
      };
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
    root.ShinobiOnline.regularizarFichaCompleta=regularizarFichaCompleta;
    root.ShinobiOnline.sincronizarPendenciasRealtime=processarOutbox;
    root.EkoRealtimeSync={
      sincronizarCampoConfirmado,sincronizarItemColecaoConfirmado,regularizarFichaCompleta,processarOutbox,reconciliar,ativarFichaAtual,temPendencias,
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
