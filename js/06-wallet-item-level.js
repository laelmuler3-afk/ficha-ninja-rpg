/* Shinobi 2.5.8.95 — carteira por moeda + histórico por movimentação. */
(function(root,factory){
  const emNode=typeof module!=="undefined"&&module.exports;
  const api=factory(root);
  if(emNode)module.exports=api.test;
  else api.install();
})(typeof window!=="undefined"?window:globalThis,function(root){
  "use strict";

  const CHAVES_MOEDA=Object.freeze(["pd","po","pp","pc"]);

  function texto(valor){return String(valor==null?"":valor).trim();}
  function clonar(valor){
    if(valor==null)return valor;
    try{return structuredClone(valor);}catch(_erro){return JSON.parse(JSON.stringify(valor));}
  }
  function inteiroSeguro(valor){
    const numero=Number.parseInt(valor,10);
    return Number.isFinite(numero)&&numero>0?numero:0;
  }
  function hashDeterministico(valor){
    const entrada=String(valor||"");
    let hash=2166136261;
    for(let i=0;i<entrada.length;i+=1){hash^=entrada.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return (hash>>>0).toString(36);
  }
  function novoIdHistorico(){
    try{if(root?.crypto?.randomUUID)return `wallet_${root.crypto.randomUUID().replace(/-/g,"")}`;}catch(_erro){}
    return `wallet_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,12)}`;
  }
  function idLegadoHistorico(item){
    const assinatura=[
      Number(item?.data||0),texto(item?.tipo),texto(item?.titulo),texto(item?.detalhe)
    ].join("\u241f");
    return `wallet_legado_${hashDeterministico(assinatura)}`;
  }
  function normalizarCarteiraPura(carteira){
    const origem=carteira&&typeof carteira==="object"&&!Array.isArray(carteira)?carteira:{};
    const saida={};
    CHAVES_MOEDA.forEach(chave=>{saida[chave]=inteiroSeguro(origem[chave]);});
    return saida;
  }
  function snapshotMoedasPuro(carteira){
    const normalizada=normalizarCarteiraPura(carteira),saida={};
    CHAVES_MOEDA.forEach(chave=>{saida[chave]={chave,quantidade:normalizada[chave]};});
    return saida;
  }
  function diferencasMoedasPuro(anterior={},atual={}){
    const mudancas=[];
    CHAVES_MOEDA.forEach(chave=>{
      const antes=inteiroSeguro(anterior?.[chave]?.quantidade);
      const depois=inteiroSeguro(atual?.[chave]?.quantidade);
      if(!anterior?.[chave]||antes!==depois){
        mudancas.push({itemId:chave,deleted:false,value:{chave,quantidade:depois}});
      }
    });
    return mudancas;
  }
  function aplicarMoedaPuro(carteira,itemId,registro){
    const chave=texto(itemId).toLowerCase();
    const saida=normalizarCarteiraPura(carteira);
    if(!CHAVES_MOEDA.includes(chave)||!registro)return saida;
    if(registro.deleted===true){saida[chave]=0;return saida;}
    let remoto;
    try{remoto=JSON.parse(String(registro.payload??"null"));}catch(_erro){return saida;}
    if(!remoto||typeof remoto!=="object"||Array.isArray(remoto))return saida;
    if(texto(remoto.chave).toLowerCase()!==chave)return saida;
    saida[chave]=inteiroSeguro(remoto.quantidade);
    return saida;
  }
  function garantirIdsHistoricoPuro(itens,{legado=false,gerarId=novoIdHistorico}={}){
    if(!Array.isArray(itens))return false;
    const identidade=root?.ShinobiItemIdentity;
    if(identidade?.garantirIds)return identidade.garantirIds(itens,{colecao:"carteiraHistorico",campo:"id",legado,gerarId});
    const usados=new Set();let alterou=false;
    itens.forEach(item=>{
      if(!item||typeof item!=="object"||Array.isArray(item))return;
      let id=texto(item.id);if(!id)id=legado?idLegadoHistorico(item):gerarId();
      if(usados.has(id)){const raiz=id.slice(0,160)||"wallet_item";let sufixo=2;while(usados.has(`${raiz}_${sufixo}`))sufixo+=1;id=`${raiz}_${sufixo}`.slice(0,180);}
      if(item.id!==id){item.id=id;alterou=true;}usados.add(id);
    });
    return alterou;
  }
  function snapshotHistoricoPuro(itens){
    const saida={};
    (Array.isArray(itens)?itens:[]).forEach(item=>{
      const id=texto(item?.id);
      if(id)saida[id]=clonar(item);
    });
    return saida;
  }
  function diferencasHistoricoPuro(anterior={},atual={}){
    const mudancas=[],identidade=root?.ShinobiItemIdentity;
    Object.entries(atual||{}).forEach(([itemId,item])=>{
      const antes=anterior?.[itemId];
      if(!antes||JSON.stringify(antes)!==JSON.stringify(item))mudancas.push({itemId,deleted:false,value:clonar(item),identityKey:identidade?.identityKey?.("carteiraHistorico",item)||""});
    });
    Object.keys(anterior||{}).forEach(itemId=>{
      if(!Object.prototype.hasOwnProperty.call(atual||{},itemId)){const antes=anterior?.[itemId];mudancas.push({itemId,deleted:true,value:undefined,identityKey:identidade?.identityKey?.("carteiraHistorico",antes)||""});}
    });
    return mudancas;
  }
  function aplicarHistoricoPuro(itens,itemId,registro){
    const id=texto(itemId),lista=Array.isArray(itens)?clonar(itens):[];
    if(!id||!registro)return lista;
    const indice=lista.findIndex(item=>texto(item?.id)===id);
    if(registro.deleted===true){
      if(indice>=0)lista.splice(indice,1);
      return lista;
    }
    let remoto;
    try{remoto=JSON.parse(String(registro.payload??"null"));}catch(_erro){return lista;}
    if(!remoto||typeof remoto!=="object"||Array.isArray(remoto))return lista;
    remoto=clonar(remoto)||{};
    remoto.id=id;
    if(indice>=0)lista[indice]=remoto;else lista.push(remoto);
    lista.sort((a,b)=>{
      const da=Number(a?.data||0),db=Number(b?.data||0);
      if(da!==db)return db-da;
      return texto(b?.id).localeCompare(texto(a?.id));
    });
    return lista.slice(0,40);
  }

  const test={
    CHAVES_MOEDA,normalizarCarteiraPura,snapshotMoedasPuro,diferencasMoedasPuro,aplicarMoedaPuro,
    garantirIdsHistoricoPuro,snapshotHistoricoPuro,diferencasHistoricoPuro,aplicarHistoricoPuro,idLegadoHistorico
  };

  function install(){
    if(!root||!root.addEventListener||root.__shinobiWalletItemLevelV1)return false;
    root.__shinobiWalletItemLevelV1=true;

    let baselineMoedas={};
    let baselineHistorico={};
    let baselineChave="";

    function chaveAtual(){
      try{return texto(typeof CHAVE!=="undefined"?CHAVE:"");}catch(_erro){return "";}
    }
    function persistirSilenciosamente(origem){
      try{
        const fn=typeof root.persistirEstadoLocal==="function"?root.persistirEstadoLocal:(typeof persistirEstadoLocal==="function"?persistirEstadoLocal:null);
        fn?.({emitir:false,confirmada:false,origem,motivo:"ids-permanentes-carteira"});
      }catch(_erro){}
    }
    function garantirEstadoLocal({legado=true}={}){
      try{
        if(!estado.carteira||typeof estado.carteira!=="object"||Array.isArray(estado.carteira))estado.carteira={};
        estado.carteira=normalizarCarteiraPura(estado.carteira);
        if(!Array.isArray(estado.carteiraHistorico))estado.carteiraHistorico=[];
        if(garantirIdsHistoricoPuro(estado.carteiraHistorico,{legado}))persistirSilenciosamente("migracao-carteira-item-level");
        return true;
      }catch(_erro){return false;}
    }
    function reiniciarBaseline({legado=true}={}){
      garantirEstadoLocal({legado});
      try{
        baselineMoedas=snapshotMoedasPuro(estado.carteira);
        baselineHistorico=snapshotHistoricoPuro(estado.carteiraHistorico);
        baselineChave=chaveAtual();
      }catch(_erro){baselineMoedas={};baselineHistorico={};baselineChave=chaveAtual();}
    }
    function garantirBaseline(){
      if(chaveAtual()!==baselineChave)reiniciarBaseline({legado:true});
      else garantirEstadoLocal({legado:true});
    }
    function emitir(collection,mudanca){
      try{
        root.dispatchEvent(new CustomEvent("shinobi:colecao-item-confirmado",{detail:{
          sheetName:String(typeof fichaAtual!=="undefined"?fichaAtual:"Principal"),
          collection,itemId:mudanca.itemId,deleted:mudanca.deleted===true,
          value:mudanca.deleted===true?undefined:mudanca.value,identityKey:mudanca.identityKey||"",confirmed:true,
          source:"carteira",reason:"alteracao-confirmada"
        }}));
      }catch(_erro){}
    }
    function publicarMoedas(){
      garantirBaseline();
      const atual=snapshotMoedasPuro(typeof estado!=="undefined"?estado.carteira:{});
      const mudancas=diferencasMoedasPuro(baselineMoedas,atual);
      baselineMoedas=atual;baselineChave=chaveAtual();
      mudancas.forEach(mudanca=>emitir("carteiraMoedas",mudanca));
      return mudancas;
    }
    function publicarHistorico(){
      garantirBaseline();
      const itens=Array.isArray(estado?.carteiraHistorico)?estado.carteiraHistorico:[];
      if(garantirIdsHistoricoPuro(itens,{legado:false}))persistirSilenciosamente("novo-historico-carteira-item-level");
      const atual=snapshotHistoricoPuro(itens);
      const mudancas=diferencasHistoricoPuro(baselineHistorico,atual);
      baselineHistorico=atual;baselineChave=chaveAtual();
      mudancas.forEach(mudanca=>emitir("carteiraHistorico",mudanca));
      return mudancas;
    }

    root.ShinobiWalletItemLevel=Object.freeze({
      garantirEstado(){garantirBaseline();return {carteira:estado?.carteira,historico:estado?.carteiraHistorico};},
      garantirIdsHistorico(itens){garantirIdsHistoricoPuro(itens,{legado:true});return itens;},
      snapshotMoedas:snapshotMoedasPuro,snapshotHistorico:snapshotHistoricoPuro,
      diferencasMoedas:diferencasMoedasPuro,diferencasHistorico:diferencasHistoricoPuro
    });

    root.addEventListener("shinobi:ficha-persistida",evento=>{
      const detalhe=evento?.detail||{};
      if(detalhe.confirmada!==true)return;
      const campo=texto(detalhe.campo);
      if(campo==="carteira")publicarMoedas();
      if(campo==="carteiraHistorico")publicarHistorico();
    });
    root.addEventListener("shinobi:realtime-colecao-aplicada",evento=>{
      const collection=texto(evento?.detail?.collection);
      if(collection!=="carteiraMoedas"&&collection!=="carteiraHistorico")return;
      reiniciarBaseline({legado:false});
    });

    reiniciarBaseline({legado:true});
    return true;
  }

  return {install,test};
});
