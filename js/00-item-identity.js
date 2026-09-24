/* Shinobi 2.5.8.100 — identidade estável para coleções item-level. */
(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  if(root)root.ShinobiItemIdentity=Object.freeze(api);
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";

  const CAMPOS_ID=Object.freeze({
    notas:"id",inventario:"id",jutsus:"jutsuId",armados:"ataqueId",
    kekkeiGenkai:"kekkeiId",carteiraHistorico:"id",efeitosBatalha:"id"
  });
  const PREFIXOS=Object.freeze({
    notas:"nota",inventario:"inv",jutsus:"jutsu",armados:"ataque",
    kekkeiGenkai:"kekkei",carteiraHistorico:"wallet",efeitosBatalha:"efeito"
  });

  function texto(valor){return String(valor==null?"":valor).trim();}
  function slug(valor,limite=72,padrao="item"){
    return texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")
      .slice(0,Math.max(1,Number(limite)||72))||padrao;
  }
  function hash(valor){
    const entrada=String(valor==null?"":valor);let h=2166136261;
    for(let i=0;i<entrada.length;i+=1){h^=entrada.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(36);
  }
  function ordenar(valor){
    if(Array.isArray(valor))return valor.map(ordenar);
    if(!valor||typeof valor!=="object")return valor;
    const saida={};Object.keys(valor).sort().forEach(chave=>{saida[chave]=ordenar(valor[chave]);});return saida;
  }
  function serializar(valor){try{return JSON.stringify(ordenar(valor));}catch(_erro){return texto(valor);}}
  function idFirebaseSeguro(valor){
    const id=texto(valor);
    return Boolean(id&&id.length<=180&&!/[.#$\/\[\]\u0000-\u001F\u007F]/.test(id));
  }
  function campoId(colecao){return CAMPOS_ID[texto(colecao)]||"id";}
  function prefixo(colecao){return PREFIXOS[texto(colecao)]||"item";}
  function limitarId(base,sufixo=""){
    const fim=texto(sufixo),limite=Math.max(1,180-fim.length);
    return `${texto(base).slice(0,limite)||"item"}${fim}`.slice(0,180);
  }
  function normalizarIdExistente(colecao,valor){
    const id=texto(valor);if(!id)return "";if(idFirebaseSeguro(id))return id;
    const p=prefixo(colecao),parte=slug(id,48,"id");
    return limitarId(`${p}_rec_${parte}`,`_${hash(id)}`);
  }

  /* Mantém as bases históricas já usadas pelo app para não criar uma nova
     identidade quando outro aparelho já publicou a mesma ficha em versões 98/99. */
  function idLegado(colecao,item={}){
    const c=texto(colecao);
    if(c==="notas")return `nota_legado_${slug(item?.titulo||"nota",36,"nota")}`.slice(0,180);
    if(c==="inventario"){
      const catalogo=slug(item?.catalogoSlug||item?.slug||"",64,"item");
      if(catalogo!=="item")return `inv_legado_catalogo_${catalogo}`.slice(0,180);
      const nome=slug(item?.nome||"item",64,"item"),tipo=slug(item?.tipo||"",64,"item"),dano=slug(item?.dano||"",64,"item");
      const complemento=[tipo,dano].filter(v=>v&&v!=="item").join("_");
      return `inv_legado_${nome}${complemento?`_${complemento}`:""}`.slice(0,180);
    }
    if(c==="jutsus"){
      const catalogo=texto(item?.catalogoId);if(catalogo)return `jutsu_catalogo_${slug(catalogo)}`.slice(0,180);
      const existente=texto(item?.id||item?.uuid);if(existente)return `jutsu_legado_id_${slug(existente)}`.slice(0,180);
      const assinatura=[texto(item?.nome),texto(item?.rank),texto(item?.elemento),texto(item?.categoria),texto(item?.tipoNome)].join("\u241f");
      return `jutsu_legado_${slug(item?.nome||"jutsu",72,"jutsu")}_${hash(assinatura)}`.slice(0,180);
    }
    if(c==="armados"){
      const existente=texto(item?.id||item?.uuid);if(existente)return `ataque_legado_id_${slug(existente)}`.slice(0,180);
      const assinatura=[texto(item?.nome),texto(item?.tipo||"armado"),texto(item?.dano),texto(item?.itemInventario)].join("\u241f");
      return `ataque_legado_${slug(item?.nome||"ataque",72,"ataque")}_${hash(assinatura)}`.slice(0,180);
    }
    if(c==="kekkeiGenkai"){
      const existente=texto(item?.id||item?.uuid);if(existente)return `kekkei_legado_id_${slug(existente)}`.slice(0,180);
      return `kekkei_legado_${slug(item?.nome||"kekkei",72,"kekkei")}`.slice(0,180);
    }
    if(c==="carteiraHistorico"){
      const assinatura=[Number(item?.data||0),texto(item?.tipo),texto(item?.titulo),texto(item?.detalhe)].join("\u241f");
      return `wallet_legado_${hash(assinatura)}`.slice(0,180);
    }
    if(c==="efeitosBatalha"){
      const existente=texto(item?.id);if(existente)return normalizarIdExistente(c,existente);
      const assinatura=[texto(item?.origemId),texto(item?.nome),texto(item?.duracaoOriginal||item?.duracao),Number(item?.rodadaAtivacao||0)].join("\u241f");
      return `efeito_legado_${hash(assinatura)}`.slice(0,180);
    }
    return `${prefixo(c)}_legado_${hash(serializar(item))}`.slice(0,180);
  }

  function comparavel(colecao,item={}){
    const c=texto(colecao),copia=item&&typeof item==="object"&&!Array.isArray(item)?JSON.parse(JSON.stringify(item)):{};
    delete copia[campoId(c)];
    if(c==="notas")delete copia.aberto;
    if(c==="jutsus"){delete copia.imagem;delete copia.imagemId;delete copia.ordem;}
    if(c==="armados"||c==="kekkeiGenkai")delete copia.ordem;
    return copia;
  }
  function fingerprint(colecao,item){return hash(serializar(comparavel(colecao,item)));}

  /* identityKey é deliberadamente mais estável que o fingerprint completo.
     Ela só é usada para canonicalizar IDs quando há exatamente uma correspondência
     local e uma remota; ambiguidades nunca são resolvidas automaticamente. */
  function identityKey(colecao,item={}){
    const c=texto(colecao);let partes=[];
    if(c==="notas")partes=[texto(item?.titulo).toLowerCase()];
    else if(c==="inventario"){
      const catalogo=texto(item?.catalogoSlug||item?.slug);
      partes=catalogo?["catalogo",catalogo]:["manual",texto(item?.nome).toLowerCase(),texto(item?.tipo).toLowerCase()];
    }else if(c==="jutsus"){
      const catalogo=texto(item?.catalogoId),externo=texto(item?.id||item?.uuid);
      partes=catalogo?["catalogo",catalogo]:externo?["externo",externo]:[texto(item?.nome).toLowerCase(),texto(item?.rank).toLowerCase(),texto(item?.elemento).toLowerCase(),texto(item?.categoria).toLowerCase(),texto(item?.tipoNome).toLowerCase()];
    }else if(c==="armados"){
      const externo=texto(item?.id||item?.uuid);
      partes=externo?["externo",externo]:[texto(item?.nome).toLowerCase(),texto(item?.tipo||"armado").toLowerCase(),texto(item?.itemInventario).toLowerCase()];
    }else if(c==="kekkeiGenkai"){
      const externo=texto(item?.id||item?.uuid);partes=externo?["externo",externo]:[texto(item?.nome).toLowerCase()];
    }else if(c==="carteiraHistorico")partes=[Number(item?.data||0),texto(item?.tipo),texto(item?.titulo),texto(item?.detalhe)];
    else if(c==="efeitosBatalha")partes=[texto(item?.origemId),texto(item?.nome),texto(item?.onlineEffectId),Number(item?.rodadaAtivacao||0),Number(item?.turnoAtivacao||0)];
    else partes=[serializar(comparavel(c,item))];
    return `idk_${slug(c,24,"item")}_${hash(serializar(partes))}`.slice(0,180);
  }

  function gerarSufixoDeterministico(base,fp,usados,reservados){
    const marcador=`__dup_${fp}`;let candidato=limitarId(base,marcador),n=2;
    while(usados.has(candidato)||reservados.has(candidato)){
      candidato=limitarId(base,`${marcador}_${n++}`);
    }
    return candidato;
  }

  function garantirIds(itens,{colecao,campo=campoId(colecao),legado=false,gerarId}={}){
    if(!Array.isArray(itens))return false;
    const c=texto(colecao),entradas=[];
    itens.forEach((item,indice)=>{
      if(!item||typeof item!=="object"||Array.isArray(item))return;
      const bruto=texto(item[campo]);
      let proposto=bruto?normalizarIdExistente(c,bruto):"";
      if(!proposto)proposto=legado?idLegado(c,item):(typeof gerarId==="function"?texto(gerarId(item,indice)):"");
      if(!proposto)proposto=`${prefixo(c)}_${hash(`${Date.now()}\u241f${indice}\u241f${Math.random()}`)}`;
      proposto=normalizarIdExistente(c,proposto)||`${prefixo(c)}_${hash(proposto)}`;
      entradas.push({item,indice,bruto,proposto,fp:fingerprint(c,item),canon:serializar(comparavel(c,item)),existente:Boolean(bruto&&idFirebaseSeguro(bruto))});
    });
    const grupos=new Map();
    entradas.forEach(e=>{const grupo=grupos.get(e.proposto)||[];grupo.push(e);grupos.set(e.proposto,grupo);});
    const reservados=new Set(grupos.keys()),usados=new Set();let alterou=false;
    [...grupos.keys()].sort().forEach(base=>{
      const grupo=grupos.get(base).slice().sort((a,b)=>{
        if(a.existente!==b.existente)return a.existente?-1:1;
        return a.fp.localeCompare(b.fp)||a.canon.localeCompare(b.canon)||a.indice-b.indice;
      });
      grupo.forEach((entrada,pos)=>{
        let id=pos===0&&!usados.has(base)?base:gerarSufixoDeterministico(base,entrada.fp,usados,reservados);
        if(entrada.item[campo]!==id){entrada.item[campo]=id;alterou=true;}
        usados.add(id);
      });
    });
    return alterou;
  }

  return {texto,slug,hash,idFirebaseSeguro,campoId,normalizarIdExistente,idLegado,fingerprint,identityKey,garantirIds};
});
