/* EKO 2.5.8.77 — exclusão local confiável e limpeza de cópias legadas. */
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

  function ehNomeCopiaAutomatica(nome){
    return /(?:\s+nuvem(?:\s+\d+)?)+$/i.test(texto(nome));
  }

  function ehCopiaLegadaMarcada(ficha){
    const nome=texto(ficha?.name);
    const online=ficha?.data?.__online&&typeof ficha.data.__online==="object"?ficha.data.__online:{};
    /*
     * O bug antigo podia marcar uma cópia automática como userCopy ao resolver
     * colisões de sheetId. Esse userCopy contaminado não pode anular os sinais
     * explícitos de legado (legacyAutoCopy/syncDisabled). Esses marcadores eram
     * exclusivos do mecanismo automático antigo, então também cobrem nomes
     * anômalos gerados por ele (ex.: "Nuvem abc123"). Um nome contendo
     * "Nuvem" sem esses sinais nunca é suficiente para apagar.
     */
    return Boolean(
      nome&&nome!=="Principal"&&
      (online.legacyAutoCopy===true||online.syncDisabled===true)
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

  function listarFichasLocais(){
    let lista=lerJson(CHAVE_LISTA,["Principal"]);
    if(!Array.isArray(lista)) lista=["Principal"];
    const nomes=Array.from(new Set(lista.map(limparNome)));
    if(!nomes.includes("Principal")) nomes.unshift("Principal");
    return nomes.map(nome=>({
      name:nome,
      key:chaveFicha(nome),
      data:lerDadosFicha(nome)
    }));
  }

  function listarCopiasLegadasLocais(){
    const seguras=[];
    const revisar=[];
    for(const ficha of listarFichasLocais()){
      if(ficha.name==="Principal") continue;
      if(ehCopiaLegadaMarcada(ficha)) seguras.push(ficha);
      else if(ehNomeCopiaAutomatica(ficha.name)) revisar.push(ficha);
    }
    return {seguras,revisar};
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

    /* A exclusão da ficha local não depende mais da identidade antiga no
       Firebase. Backups da nuvem serão administrados separadamente pelo futuro
       gerenciador de backups. */
    const removeu=removerFichaLocal(nome);
    if(!removeu) return false;

    root.alert?.("Ficha excluída.");
    try{root.location.reload();}catch(_erro){}
    return true;
  }

  function nomesParaMensagem(fichas){
    return (fichas||[]).map(f=>`“${limparNome(f.name)}”`).join(" • ");
  }

  async function limparCopiasAntigas(){
    /* Se a pilha online já estiver carregada, permitimos que ela faça apenas a
       normalização LOCAL dos marcadores legados. A limpeza não depende disso,
       não aguarda rede e não registra exclusões no Firebase. */
    try{root.ShinobiOnline?.listarCopiasLegadasLocaisSeguras?.();}catch(_erro){}

    const analise=listarCopiasLegadasLocais();
    const seguras=analise.seguras;
    const revisar=analise.revisar;

    if(!seguras.length){
      const complemento=revisar.length
        ? ` Existem ${revisar.length} ficha(s) com nome do padrão antigo, mas sem marcação segura de cópia automática; elas foram preservadas.`
        : "";
      if(typeof root.avisoShinobi==="function") await root.avisoShinobi("Nenhuma cópia antiga marcada",`Não encontrei cópias automáticas antigas que possam ser removidas com segurança.${complemento}`);
      else root.alert?.(`Nenhuma cópia antiga marcada para remover.${complemento}`);
      return {removidas:0,revisar:revisar.length};
    }

    const nomes=nomesParaMensagem(seguras);
    const avisoRevisao=revisar.length?` ${revisar.length} ficha(s) sem marcação segura serão mantidas.`:"";
    const ok=typeof root.modalShinobi==="function"
      ? await root.modalShinobi(
          "Limpar cópias antigas?",
          `Serão removidas ${seguras.length} cópia(s) automáticas antigas: ${nomes}. A ficha Principal será mantida.${avisoRevisao}`
        )
      : root.confirm?.(`Excluir ${seguras.length} cópia(s) automáticas antigas? ${nomes}`);
    if(!ok) return {removidas:0,revisar:revisar.length};

    const removidas=[];
    for(const ficha of seguras){
      if(!ehCopiaLegadaMarcada(ficha)) continue;
      try{root.localStorage.removeItem(ficha.key||chaveFicha(ficha.name));}catch(_erroStorage){continue;}
      removidas.push(limparNome(ficha.name));
    }
    atualizarListaAposExclusao(removidas);

    root.alert?.(`${removidas.length} cópia(s) antiga(s) removida(s).${revisar.length?` ${revisar.length} foram preservadas por segurança.`:""}`);
    try{root.location.reload();}catch(_erro){}
    return {removidas:removidas.length,revisar:revisar.length};
  }

  function instalar(){
    root.excluirFicha=excluirFichaMelhorada;
    root.limparCopiasAntigas=limparCopiasAntigas;
  }

  return {
    ehCopiaLegadaMarcada,
    listarCopiasLegadasLocais,
    excluirFichaMelhorada,
    limparCopiasAntigas,
    removerFichaLocal,
    instalar
  };
});
