/* EKO — utilitários puros para sincronização granular em tempo real. */
(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  if(root) root.EkoRealtimeFields=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";

  const CAMPOS_LOCAIS=new Set(["__online","jutsusAbertos","ataquesAbertos","scrollTop"]);

  function clonar(valor){
    if(valor==null) return valor;
    try{return structuredClone(valor);}catch(_erro){return JSON.parse(JSON.stringify(valor));}
  }

  function serializar(valor){
    if(valor===undefined) return "__eko_undefined__";
    try{return JSON.stringify(valor);}catch(_erro){return String(valor);}
  }

  function camposAlterados(antes,depois){
    const a=antes&&typeof antes==="object"&&!Array.isArray(antes)?antes:{};
    const b=depois&&typeof depois==="object"&&!Array.isArray(depois)?depois:{};
    const chaves=new Set([...Object.keys(a),...Object.keys(b)]);
    return [...chaves].filter(campoPermitido).filter(chave=>{
      const valorA=normalizarValorParaNuvem(chave,a[chave]);
      const valorB=normalizarValorParaNuvem(chave,b[chave]);
      return serializar(valorA)!==serializar(valorB);
    }).sort();
  }

  function campoPermitido(nome){
    const valor=String(nome==null?"":nome).trim();
    if(!valor||valor.length>120) return false;
    return !CAMPOS_LOCAIS.has(valor);
  }

  function campoParaChave(nome){
    return encodeURIComponent(String(nome==null?"":nome)).replace(/\./g,"%2E");
  }

  function chaveParaCampo(chave){
    try{return decodeURIComponent(String(chave==null?"":chave));}catch(_erro){return "";}
  }

  function compararVersoes(a,b){
    const ea=Number(a?.editAt||0),eb=Number(b?.editAt||0);
    if(ea!==eb) return ea>eb?1:-1;
    const oa=String(a?.opId||""),ob=String(b?.opId||"");
    if(oa===ob) return 0;
    return oa>ob?1:-1;
  }

  function normalizarValorParaNuvem(nome,valor){
    const copia=clonar(valor);
    if(nome==="notasTopicos"&&Array.isArray(copia)){
      return copia.map(item=>{
        if(!item||typeof item!=="object"||Array.isArray(item)) return item;
        const saida={...item};
        delete saida.aberto;
        return saida;
      });
    }
    return copia;
  }

  function mesclarValorRemoto(nome,remoto,local){
    const copia=clonar(remoto);
    if(nome!=="notasTopicos"||!Array.isArray(copia)) return copia;
    const locais=Array.isArray(local)?local:[];
    const porId=new Map();
    locais.forEach((item,indice)=>{
      if(!item||typeof item!=="object") return;
      const id=String(item.id||"");
      if(id) porId.set(`id:${id}`,Boolean(item.aberto));
      porId.set(`idx:${indice}:${String(item.titulo||"")}`,Boolean(item.aberto));
    });
    return copia.map((item,indice)=>{
      if(!item||typeof item!=="object"||Array.isArray(item)) return item;
      const id=String(item.id||"");
      const chaveId=id?`id:${id}`:"";
      const chaveIndice=`idx:${indice}:${String(item.titulo||"")}`;
      const aberto=chaveId&&porId.has(chaveId)?porId.get(chaveId):(porId.has(chaveIndice)?porId.get(chaveIndice):false);
      return {...item,aberto};
    });
  }

  return {camposAlterados,campoPermitido,campoParaChave,chaveParaCampo,compararVersoes,normalizarValorParaNuvem,mesclarValorRemoto};
});
