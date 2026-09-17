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

  function semImagemLocalDeJutsu(item){
    if(!item||typeof item!=="object"||Array.isArray(item)) return clonar(item);
    const saida={...item};
    delete saida.imagem;
    delete saida.imagemId;
    return saida;
  }

  function textoIdentidade(valor){
    return String(valor==null?"":valor).trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  }

  function chavesIdentidadeJutsu(item){
    if(!item||typeof item!=="object"||Array.isArray(item)) return [];
    const chaves=[];
    ["catalogoId","jutsuId","id","uuid"].forEach(campo=>{
      const valor=textoIdentidade(item[campo]);
      if(valor) chaves.push(`${campo}:${valor}`);
    });
    const nome=textoIdentidade(item.nome);
    if(nome) chaves.push(`nome:${nome}`);
    return chaves;
  }

  function copiarImagemLocalJutsu(destino,origem){
    if(!destino||typeof destino!=="object"||Array.isArray(destino)||!origem||typeof origem!=="object") return destino;
    if(Object.prototype.hasOwnProperty.call(origem,"imagem")) destino.imagem=origem.imagem;
    if(Object.prototype.hasOwnProperty.call(origem,"imagemId")) destino.imagemId=origem.imagemId;
    return destino;
  }

  function mesclarJutsusRemotos(remoto,local){
    const remotos=Array.isArray(remoto)?remoto.map(semImagemLocalDeJutsu):[];
    const locais=Array.isArray(local)?local:[];
    const usadosLocais=new Set();
    const correspondencias=new Map();
    const porChave=new Map();

    locais.forEach((item,indice)=>{
      chavesIdentidadeJutsu(item).forEach(chave=>{
        const lista=porChave.get(chave)||[];
        lista.push(indice);
        porChave.set(chave,lista);
      });
    });

    remotos.forEach((item,indiceRemoto)=>{
      for(const chave of chavesIdentidadeJutsu(item)){
        const candidatos=(porChave.get(chave)||[]).filter(indice=>!usadosLocais.has(indice));
        if(candidatos.length!==1) continue;
        const indiceLocal=candidatos[0];
        usadosLocais.add(indiceLocal);
        correspondencias.set(indiceRemoto,indiceLocal);
        break;
      }
    });

    const remotosSemPar=remotos.map((_item,indice)=>indice).filter(indice=>!correspondencias.has(indice));
    const locaisComImagemSemPar=locais.map((item,indice)=>({item,indice})).filter(({item,indice})=>
      !usadosLocais.has(indice)&&item&&typeof item==="object"&&(
        Object.prototype.hasOwnProperty.call(item,"imagemId")||
        Object.prototype.hasOwnProperty.call(item,"imagem")
      )
    );

    /* Uma única edição de nome deixa exatamente um jutsu sem correspondência.
       Nesse caso a posição lógica continua inequívoca e a capa local pode ser
       preservada sem correr o risco de anexá-la a outro jutsu. */
    if(remotosSemPar.length===1&&locaisComImagemSemPar.length===1){
      correspondencias.set(remotosSemPar[0],locaisComImagemSemPar[0].indice);
    }

    return remotos.map((item,indice)=>{
      const indiceLocal=correspondencias.get(indice);
      return indiceLocal===undefined?item:copiarImagemLocalJutsu(item,locais[indiceLocal]);
    });
  }

  function normalizarValorParaNuvem(nome,valor){
    const copia=clonar(valor);
    if(nome==="jutsus"&&Array.isArray(copia)){
      return copia.map(semImagemLocalDeJutsu);
    }
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
    if(nome==="jutsus"&&Array.isArray(copia)) return mesclarJutsusRemotos(copia,local);
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
