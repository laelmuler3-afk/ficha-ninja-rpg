/* Shinobi — utilitários puros do gerenciador de backups históricos. */
(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  if(root) root.ShinobiBackupUtils=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";

  const CAMPOS_LOCAIS_PRESERVADOS=["scrollTop","jutsusAbertos","ataquesAbertos","avatarNinja","avatarNinjaId","perfilFundoImagem","perfilFundoImagemId"];

  function clonar(valor){
    if(valor==null)return valor;
    try{return structuredClone(valor);}catch(_erro){return JSON.parse(JSON.stringify(valor));}
  }

  function texto(valor){return String(valor==null?"":valor).trim();}

  function dayKeyLocal(timestamp=Date.now()){
    const data=new Date(Number(timestamp)||Date.now());
    const ano=data.getFullYear();
    const mes=String(data.getMonth()+1).padStart(2,"0");
    const dia=String(data.getDate()).padStart(2,"0");
    return `${ano}-${mes}-${dia}`;
  }

  function normalizarBackups(valor){
    const objeto=valor&&typeof valor==="object"&&!Array.isArray(valor)?valor:{};
    return Object.entries(objeto).map(([id,item])=>({
      id:texto(id),
      name:texto(item?.name)||"Ficha",
      characterName:texto(item?.characterName),
      revision:Number(item?.revision||0),
      createdAt:Number(item?.createdAt||0),
      reason:texto(item?.reason)||"manual",
      type:texto(item?.type)||"",
      dayKey:texto(item?.dayKey),
      appVersion:texto(item?.appVersion),
      sourceDeviceId:texto(item?.sourceDeviceId),
      data:item?.data&&typeof item.data==="object"&&!Array.isArray(item.data)?item.data:null
    })).filter(item=>item.id).sort((a,b)=>b.createdAt-a.createdAt||b.id.localeCompare(a.id));
  }

  function temBackupDiarioDoDia(valor,dayKey=dayKeyLocal()){
    const chave=texto(dayKey);
    return normalizarBackups(valor).some(item=>item.dayKey===chave&&(item.type==="daily"||item.reason==="automatico-diario"));
  }

  function idsParaRemoverPorRetencao(valor,limite=3,protegerIds=[]){
    const max=Math.max(1,Number(limite)||3);
    const lista=normalizarBackups(valor);
    const proteger=new Set((Array.isArray(protegerIds)?protegerIds:[]).map(texto).filter(Boolean));
    const manter=new Set();
    lista.forEach(item=>{if(proteger.has(item.id))manter.add(item.id);});
    for(const item of lista){
      if(manter.size>=max)break;
      manter.add(item.id);
    }
    return lista.filter(item=>!manter.has(item.id)).map(item=>item.id);
  }

  function prepararSnapshotRestaurado(dadosBackup,dadosAtual){
    const backup=dadosBackup&&typeof dadosBackup==="object"&&!Array.isArray(dadosBackup)?clonar(dadosBackup):{};
    const atual=dadosAtual&&typeof dadosAtual==="object"&&!Array.isArray(dadosAtual)?dadosAtual:{};
    backup.__online=clonar(atual.__online&&typeof atual.__online==="object"?atual.__online:{});
    CAMPOS_LOCAIS_PRESERVADOS.forEach(campo=>{
      if(Object.prototype.hasOwnProperty.call(atual,campo))backup[campo]=clonar(atual[campo]);
      else delete backup[campo];
    });
    const atuaisJutsus=Array.isArray(atual.jutsus)?atual.jutsus:[];
    if(Array.isArray(backup.jutsus)&&atuaisJutsus.length){
      const chave=item=>texto(item?.jutsuId||item?.catalogoId||item?.id||item?.uuid||item?.nome).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
      const porChave=new Map(atuaisJutsus.map(item=>[chave(item),item]).filter(([k])=>k));
      backup.jutsus=backup.jutsus.map(item=>{
        const copia=clonar(item);
        const local=porChave.get(chave(item));
        if(local){
          if(Object.prototype.hasOwnProperty.call(local,"imagem"))copia.imagem=local.imagem;else delete copia.imagem;
          if(Object.prototype.hasOwnProperty.call(local,"imagemId"))copia.imagemId=local.imagemId;else delete copia.imagemId;
        }else{
          delete copia.imagem;delete copia.imagemId;
        }
        return copia;
      });
    }
    return backup;
  }

  return {dayKeyLocal,normalizarBackups,temBackupDiarioDoDia,idsParaRemoverPorRetencao,prepararSnapshotRestaurado};
});
