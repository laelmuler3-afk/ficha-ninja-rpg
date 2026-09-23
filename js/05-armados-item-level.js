/* Shinobi 2.5.8.93 — ataques/armados sincronizados por item. */
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
      .replace(/^-+|-+$/g,"").slice(0,72)||"ataque";
  }
  function hashDeterministico(valor){
    const entrada=String(valor||"");
    let hash=2166136261;
    for(let i=0;i<entrada.length;i+=1){hash^=entrada.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return (hash>>>0).toString(36);
  }
  function novoId(){
    try{if(root?.crypto?.randomUUID)return `ataque_${root.crypto.randomUUID().replace(/-/g,"")}`;}catch(_erro){}
    return `ataque_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,12)}`;
  }
  function idLegado(ataque){
    const existente=texto(ataque?.id||ataque?.uuid);
    if(existente)return `ataque_legado_id_${slug(existente)}`.slice(0,170);
    const assinatura=[
      texto(ataque?.nome),texto(ataque?.tipo||"armado"),texto(ataque?.dano),
      texto(ataque?.itemInventario)
    ].join("\u241f");
    return `ataque_legado_${slug(ataque?.nome||"ataque")}_${hashDeterministico(assinatura)}`.slice(0,170);
  }
  function garantirIdsPuro(itens,{legado=false,gerarId=novoId}={}){
    if(!Array.isArray(itens))return false;
    const usados=new Set();
    let alterou=false;
    let proximaOrdem=itens.reduce((max,item)=>{
      const ordem=Number(item?.ordem);
      return Number.isFinite(ordem)?Math.max(max,ordem+1):max;
    },0);

    itens.forEach(ataque=>{
      if(!ataque||typeof ataque!=="object"||Array.isArray(ataque))return;
      let id=texto(ataque.ataqueId);
      if(!id)id=legado?idLegado(ataque):gerarId();
      if(usados.has(id)){
        const base=id.slice(0,160)||"ataque_item";
        let sufixo=2;
        while(usados.has(`${base}_${sufixo}`))sufixo+=1;
        id=`${base}_${sufixo}`.slice(0,180);
      }
      if(ataque.ataqueId!==id){ataque.ataqueId=id;alterou=true;}
      if(!Number.isFinite(Number(ataque.ordem))){ataque.ordem=proximaOrdem++;alterou=true;}
      usados.add(id);
    });
    return alterou;
  }
  function snapshotPuro(itens){
    const saida={};
    (Array.isArray(itens)?itens:[]).forEach(ataque=>{
      const id=texto(ataque?.ataqueId);
      if(id)saida[id]=clonar(ataque);
    });
    return saida;
  }
  function diferencasPuro(anterior={},atual={}){
    const mudancas=[];
    Object.entries(atual||{}).forEach(([itemId,item])=>{
      const antes=anterior?.[itemId];
      if(!antes||JSON.stringify(antes)!==JSON.stringify(item)){
        mudancas.push({itemId,deleted:false,value:clonar(item)});
      }
    });
    Object.keys(anterior||{}).forEach(itemId=>{
      if(!Object.prototype.hasOwnProperty.call(atual||{},itemId)){
        mudancas.push({itemId,deleted:true,value:undefined});
      }
    });
    return mudancas;
  }

  const test={garantirIdsPuro,snapshotPuro,diferencasPuro,idLegado};

  function install(){
    if(!root||!root.addEventListener||root.__shinobiArmadosItemLevelV1)return false;
    root.__shinobiArmadosItemLevelV1=true;

    let baseline={};
    let baselineChave="";

    function chaveAtual(){
      try{return texto(typeof CHAVE!=="undefined"?CHAVE:"");}catch(_erro){return "";}
    }
    function persistirIdsSilenciosamente(origem){
      try{
        if(typeof persistirEstadoLocal==="function"){
          persistirEstadoLocal({emitir:false,confirmada:false,origem,motivo:"ids-permanentes-armados"});
        }
      }catch(_erro){}
    }
    function reiniciarBaseline({legado=true}={}){
      try{
        estado.armados=Array.isArray(estado?.armados)?estado.armados:[];
        if(garantirIdsPuro(estado.armados,{legado}))persistirIdsSilenciosamente("migracao-armados-item-level");
        baseline=snapshotPuro(estado.armados);
        baselineChave=chaveAtual();
        return estado.armados;
      }catch(_erro){return [];}
    }
    function garantirBaseline(){
      const chave=chaveAtual();
      if(chave!==baselineChave)return reiniciarBaseline({legado:true});
      try{return Array.isArray(estado?.armados)?estado.armados:[];}catch(_erro){return [];}
    }
    function publicarDiferencasConfirmadas(){
      garantirBaseline();
      const itens=Array.isArray(estado?.armados)?estado.armados:[];
      if(garantirIdsPuro(itens,{legado:false}))persistirIdsSilenciosamente("novo-ataque-item-level");
      const atual=snapshotPuro(itens);
      const mudancas=diferencasPuro(baseline,atual);
      baseline=atual;
      baselineChave=chaveAtual();
      mudancas.forEach(mudanca=>{
        try{
          root.dispatchEvent(new CustomEvent("shinobi:colecao-item-confirmado",{detail:{
            sheetName:String(typeof fichaAtual!=="undefined"?fichaAtual:"Principal"),
            collection:"armados",
            itemId:mudanca.itemId,
            deleted:mudanca.deleted===true,
            value:mudanca.deleted===true?undefined:mudanca.value,
            confirmed:true,
            source:"armados",
            reason:"alteracao-confirmada"
          }}));
        }catch(_erro){}
      });
      return mudancas;
    }

    root.ShinobiArmadosItemLevel=Object.freeze({
      garantirEstado(){return garantirBaseline();},
      garantirIdsLegados(itens){garantirIdsPuro(itens,{legado:true});return itens;},
      garantirIdsNovos(itens){garantirIdsPuro(itens,{legado:false});return itens;},
      snapshot:snapshotPuro,diferencas:diferencasPuro
    });

    root.addEventListener("shinobi:ficha-persistida",evento=>{
      const detalhe=evento?.detail||{};
      if(detalhe.confirmada!==true||texto(detalhe.campo)!=="armados")return;
      publicarDiferencasConfirmadas();
    });

    root.addEventListener("shinobi:realtime-colecao-aplicada",evento=>{
      if(texto(evento?.detail?.collection)!=="armados")return;
      reiniciarBaseline({legado:false});
    });

    const renderBase=root.renderizarArmados;
    if(typeof renderBase==="function"){
      root.renderizarArmados=function(){
        garantirBaseline();
        return renderBase.apply(this,arguments);
      };
    }

    reiniciarBaseline({legado:true});
    return true;
  }

  return {install,test};
});
