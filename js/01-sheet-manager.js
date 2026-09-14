/* EKO 2.5.8.76 — exclusão simples e limpeza segura de cópias legadas. */
(function(root,factory){
  const api=factory(root);
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  if(root){
    root.EkoSheetManager=api;
    if(root.document) api.instalar();
  }
})(typeof window!=="undefined"?window:globalThis,function(root){
  "use strict";

  const CHAVE_BASE="ficha_ninja_app_v2";
  const CHAVE_LISTA="ficha_ninja_lista_v1";
  const CHAVE_ATIVA="ficha_ninja_ativa_v1";

  function texto(valor){return String(valor==null?"":valor).trim();}

  function ehCopiaLegadaMarcada(ficha){
    const nome=texto(ficha?.name);
    const online=ficha?.data?.__online&&typeof ficha.data.__online==="object"?ficha.data.__online:{};
    return Boolean(
      nome&&nome!=="Principal"&&
      online.legacyAutoCopy===true&&
      online.syncDisabled===true&&
      online.userCopy!==true
    );
  }

  function lerJson(chave,padrao){
    try{
      const valor=JSON.parse(root.localStorage.getItem(chave)||"");
      return valor==null?padrao:valor;
    }catch(_erro){return padrao;}
  }

  function limparNome(nome){
    if(typeof root.limparNomeFicha==="function") return root.limparNomeFicha(nome);
    return texto(nome||"Principal").slice(0,32)||"Principal";
  }

  function chaveFicha(nome){
    const limpo=limparNome(nome);
    return limpo==="Principal"?CHAVE_BASE:`${CHAVE_BASE}__${limpo}`;
  }

  function lerDadosFicha(nome){
    try{
      const valor=JSON.parse(root.localStorage.getItem(chaveFicha(nome))||"{}");
      return valor&&typeof valor==="object"&&!Array.isArray(valor)?valor:{};
    }catch(_erro){return {};}
  }

  function atualizarListaAposExclusao(nomesExcluidos){
    const excluir=new Set((nomesExcluidos||[]).map(limparNome));
    let lista=lerJson(CHAVE_LISTA,["Principal"]);
    if(!Array.isArray(lista)) lista=["Principal"];
    lista=lista.map(limparNome).filter(nome=>!excluir.has(nome));
    lista=Array.from(new Set(lista));
    if(!lista.includes("Principal")) lista.unshift("Principal");
    root.localStorage.setItem(CHAVE_LISTA,JSON.stringify(lista));

    const ativa=limparNome(root.localStorage.getItem(CHAVE_ATIVA)||"Principal");
    if(excluir.has(ativa)) root.localStorage.setItem(CHAVE_ATIVA,"Principal");
    return lista;
  }

  async function esperarOnline(timeoutMs=2500){
    if(root.ShinobiOnline) return root.ShinobiOnline;
    return new Promise(resolve=>{
      let terminou=false;
      const finalizar=()=>{
        if(terminou)return;
        terminou=true;
        root.removeEventListener?.("shinobi:online-stack-ready",aoPronto);
        resolve(root.ShinobiOnline||null);
      };
      const aoPronto=()=>finalizar();
      root.addEventListener?.("shinobi:online-stack-ready",aoPronto,{once:true});
      setTimeout(finalizar,Math.max(100,Number(timeoutMs)||2500));
    });
  }

  function removerFichaLocal(nome){
    const limpo=limparNome(nome);
    if(!limpo||limpo==="Principal") return false;
    try{root.localStorage.removeItem(chaveFicha(limpo));}catch(_erro){}
    atualizarListaAposExclusao([limpo]);
    return true;
  }

  async function excluirFichaMelhorada(){
    try{root.salvar?.();}catch(_erro){}
    const nome=limparNome(root.localStorage.getItem(CHAVE_ATIVA)||"Principal");
    if(nome==="Principal"){
      if(typeof root.avisoShinobi==="function") await root.avisoShinobi("Ficha protegida","A ficha Principal não pode ser excluída.");
      else root.alert?.("A ficha Principal não pode ser excluída.");
      return false;
    }

    const lista=lerJson(CHAVE_LISTA,["Principal"]);
    if(Array.isArray(lista)&&lista.length<=1){
      root.alert?.("Você precisa manter pelo menos uma ficha.");
      return false;
    }

    const confirmar=typeof root.modalShinobi==="function"
      ? await root.modalShinobi("Excluir ficha?",`Excluir “${nome}”? A ficha Principal será mantida.`)
      : root.confirm?.(`Excluir "${nome}"?`);
    if(!confirmar) return false;

    const dados=lerDadosFicha(nome);
    const online=await esperarOnline(1800);
    try{online?.registrarExclusaoLocal?.(nome,dados);}catch(_erroOnline){}

    removerFichaLocal(nome);
    root.alert?.("Ficha excluída.");
    try{root.location.reload();}catch(_erro){}
    return true;
  }

  async function limparCopiasAntigas(){
    const online=await esperarOnline(3500);
    if(!online?.listarCopiasLegadasLocaisSeguras){
      if(typeof root.avisoShinobi==="function"){
        await root.avisoShinobi("Sincronização ainda carregando","Aguarde alguns segundos com a internet ligada e tente novamente. Nenhuma ficha foi apagada.");
      }else root.alert?.("Aguarde a sincronização iniciar e tente novamente. Nenhuma ficha foi apagada.");
      return {removidas:0,revisar:0};
    }

    let analise={seguras:[],revisar:[]};
    try{analise=online.listarCopiasLegadasLocaisSeguras()||analise;}catch(_erro){}
    const seguras=Array.isArray(analise.seguras)?analise.seguras.filter(ehCopiaLegadaMarcada):[];
    const revisar=Array.isArray(analise.revisar)?analise.revisar:[];

    if(!seguras.length){
      const complemento=revisar.length
        ? ` Existem ${revisar.length} cópia(s) antiga(s) com conteúdo diferente; elas foram preservadas e podem ser excluídas individualmente.`
        : "";
      if(typeof root.avisoShinobi==="function") await root.avisoShinobi("Nenhuma cópia segura para limpar",`Não encontrei duplicatas idênticas que possam ser removidas automaticamente.${complemento}`);
      else root.alert?.(`Nenhuma cópia segura para limpar.${complemento}`);
      return {removidas:0,revisar:revisar.length};
    }

    const avisoRevisao=revisar.length?` ${revisar.length} cópia(s) com diferenças serão mantidas para revisão.`:"";
    const ok=typeof root.modalShinobi==="function"
      ? await root.modalShinobi(
          "Limpar cópias antigas?",
          `Encontramos ${seguras.length} cópia(s) legada(s) idêntica(s) à ficha principal correspondente. A ficha Principal e cópias criadas por você não serão apagadas.${avisoRevisao}`
        )
      : root.confirm?.(`Excluir ${seguras.length} cópia(s) legada(s) idêntica(s)?`);
    if(!ok) return {removidas:0,revisar:revisar.length};

    const removidas=[];
    for(const ficha of seguras){
      if(!ehCopiaLegadaMarcada(ficha)) continue;
      try{online.registrarExclusaoLocal?.(ficha.name,ficha.data||{});}catch(_erroOnline){}
      try{root.localStorage.removeItem(ficha.key||chaveFicha(ficha.name));}catch(_erroStorage){}
      removidas.push(limparNome(ficha.name));
    }
    atualizarListaAposExclusao(removidas);

    root.alert?.(`${removidas.length} cópia(s) antiga(s) removida(s).${revisar.length?` ${revisar.length} foram preservadas por terem diferenças.`:""}`);
    try{root.location.reload();}catch(_erro){}
    return {removidas:removidas.length,revisar:revisar.length};
  }

  function instalar(){
    root.excluirFicha=excluirFichaMelhorada;
    root.limparCopiasAntigas=limparCopiasAntigas;
  }

  return {ehCopiaLegadaMarcada,excluirFichaMelhorada,limparCopiasAntigas,instalar};
});
