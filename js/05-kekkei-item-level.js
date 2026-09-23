/* Shinobi 2.5.8.94 — Kekkei Genkai sincronizada por item. */
(function(root,factory){
  const emNode=typeof module!=="undefined"&&module.exports;
  const api=factory(root);
  if(emNode)module.exports=api.test;
  else api.install();
})(typeof window!=="undefined"?window:globalThis,function(root){
  "use strict";

  function texto(valor){return String(valor==null?"":valor).trim();}
  function clonar(valor){
    if(valor==null)return valor;
    try{return structuredClone(valor);}catch(_erro){return JSON.parse(JSON.stringify(valor));}
  }
  function slug(valor){
    return texto(valor)
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .toLowerCase().replace(/[^a-z0-9]+/g,"-")
      .replace(/^-+|-+$/g,"").slice(0,72)||"kekkei";
  }
  function novoId(){
    try{if(root?.crypto?.randomUUID)return `kekkei_${root.crypto.randomUUID().replace(/-/g,"")}`;}catch(_erro){}
    return `kekkei_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,12)}`;
  }
  function idLegado(item){
    const existente=texto(item?.id||item?.uuid);
    if(existente)return `kekkei_legado_id_${slug(existente)}`.slice(0,170);
    return `kekkei_legado_${slug(item?.nome||"kekkei")}`.slice(0,170);
  }
  function garantirIdsPuro(itens,{legado=false,gerarId=novoId}={}){
    if(!Array.isArray(itens))return false;
    const usados=new Set();
    let alterou=false;
    let proximaOrdem=itens.reduce((max,item)=>{
      const ordem=Number(item?.ordem);
      return Number.isFinite(ordem)?Math.max(max,ordem+1):max;
    },0);
    itens.forEach(item=>{
      if(!item||typeof item!=="object"||Array.isArray(item))return;
      let id=texto(item.kekkeiId);
      if(!id)id=legado?idLegado(item):gerarId();
      if(usados.has(id)){
        const raiz=id.slice(0,160)||"kekkei_item";
        let sufixo=2;
        while(usados.has(`${raiz}_${sufixo}`))sufixo+=1;
        id=`${raiz}_${sufixo}`.slice(0,180);
      }
      if(item.kekkeiId!==id){item.kekkeiId=id;alterou=true;}
      if(!Number.isFinite(Number(item.ordem))){item.ordem=proximaOrdem++;alterou=true;}
      usados.add(id);
    });
    return alterou;
  }
  function snapshotPuro(itens){
    const saida={};
    (Array.isArray(itens)?itens:[]).forEach(item=>{
      const id=texto(item?.kekkeiId);
      if(id)saida[id]=clonar(item);
    });
    return saida;
  }
  function diferencasPuro(anterior={},atual={}){
    const mudancas=[];
    Object.entries(atual||{}).forEach(([itemId,item])=>{
      const antes=anterior?.[itemId];
      if(!antes||JSON.stringify(antes)!==JSON.stringify(item))mudancas.push({itemId,deleted:false,value:clonar(item)});
    });
    Object.keys(anterior||{}).forEach(itemId=>{
      if(!Object.prototype.hasOwnProperty.call(atual||{},itemId))mudancas.push({itemId,deleted:true,value:undefined});
    });
    return mudancas;
  }

  const test={garantirIdsPuro,snapshotPuro,diferencasPuro,idLegado};

  function install(){
    if(!root||!root.addEventListener||root.__shinobiKekkeiItemLevelV1)return false;
    root.__shinobiKekkeiItemLevelV1=true;

    let baseline={};
    let baselineChave="";

    function chaveAtual(){
      try{return texto(typeof CHAVE!=="undefined"?CHAVE:"");}catch(_erro){return "";}
    }
    function persistirIdsSilenciosamente(origem){
      try{
        if(typeof persistirEstadoLocal==="function"){
          persistirEstadoLocal({emitir:false,confirmada:false,origem,motivo:"ids-permanentes-kekkei"});
        }
      }catch(_erro){}
    }
    function reiniciarBaseline({legado=true}={}){
      try{
        estado.kekkeiGenkai=Array.isArray(estado?.kekkeiGenkai)?estado.kekkeiGenkai:[];
        if(garantirIdsPuro(estado.kekkeiGenkai,{legado}))persistirIdsSilenciosamente("migracao-kekkei-item-level");
        baseline=snapshotPuro(estado.kekkeiGenkai);
        baselineChave=chaveAtual();
        return estado.kekkeiGenkai;
      }catch(_erro){return [];}
    }
    function garantirBaseline(){
      const chave=chaveAtual();
      if(chave!==baselineChave)return reiniciarBaseline({legado:true});
      try{return Array.isArray(estado?.kekkeiGenkai)?estado.kekkeiGenkai:[];}catch(_erro){return [];}
    }
    function publicarDiferencasConfirmadas(){
      garantirBaseline();
      const itens=Array.isArray(estado?.kekkeiGenkai)?estado.kekkeiGenkai:[];
      if(garantirIdsPuro(itens,{legado:false}))persistirIdsSilenciosamente("nova-kekkei-item-level");
      const atual=snapshotPuro(itens);
      const mudancas=diferencasPuro(baseline,atual);
      baseline=atual;
      baselineChave=chaveAtual();
      mudancas.forEach(mudanca=>{
        try{
          root.dispatchEvent(new CustomEvent("shinobi:colecao-item-confirmado",{detail:{
            sheetName:String(typeof fichaAtual!=="undefined"?fichaAtual:"Principal"),
            collection:"kekkeiGenkai",
            itemId:mudanca.itemId,
            deleted:mudanca.deleted===true,
            value:mudanca.deleted===true?undefined:mudanca.value,
            confirmed:true,
            source:"kekkei",
            reason:"alteracao-confirmada"
          }}));
        }catch(_erro){}
      });
      return mudancas;
    }

    root.ShinobiKekkeiItemLevel=Object.freeze({
      garantirEstado(){return garantirBaseline();},
      garantirIdsLegados(itens){garantirIdsPuro(itens,{legado:true});return itens;},
      garantirIdsNovos(itens){garantirIdsPuro(itens,{legado:false});return itens;},
      snapshot:snapshotPuro,diferencas:diferencasPuro
    });

    root.addEventListener("shinobi:ficha-persistida",evento=>{
      const detalhe=evento?.detail||{};
      if(detalhe.confirmada!==true||texto(detalhe.campo)!=="kekkeiGenkai")return;
      publicarDiferencasConfirmadas();
    });
    root.addEventListener("shinobi:realtime-colecao-aplicada",evento=>{
      if(texto(evento?.detail?.collection)!=="kekkeiGenkai")return;
      reiniciarBaseline({legado:false});
    });

    const renderBase=root.renderizarKekkeiGenkai;
    if(typeof renderBase==="function"){
      root.renderizarKekkeiGenkai=function(){
        garantirBaseline();
        return renderBase.apply(this,arguments);
      };
    }

    reiniciarBaseline({legado:true});
    return true;
  }

  return {install,test};
});
