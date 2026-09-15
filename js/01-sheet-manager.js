/* EKO 2.5.8.79 — exclusão individual protegida contra salvamento no pagehide. */
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
  const PREFIXO=`${CHAVE_BASE}__`;

  function texto(valor){return String(valor==null?"":valor).trim();}

  function limparNome(nome){
    if(typeof root.limparNomeFicha==="function") return root.limparNomeFicha(nome);
    return texto(nome||"Principal").replace(/[^\w\-À-ÿ ]+/g,"").slice(0,32)||"Principal";
  }

  function ehNomeCopiaAutomatica(nome){
    const valor=texto(nome);
    if(/(?:\s+nuvem(?:\s+\d+)?)+$/i.test(valor)) return true;
    /* O sistema antigo usava `Nuvem ${Date.now().toString(36)}` quando os
       sufixos normais já estavam ocupados. */
    return /^nuvem\s+[a-z0-9]{6,}$/i.test(valor);
  }

  function lerJson(chave,padrao){
    try{
      const valor=JSON.parse(root.localStorage.getItem(chave)||"");
      return valor==null?padrao:valor;
    }catch(_erro){return padrao;}
  }

  function lerDadosPorChave(chave){
    try{
      const valor=JSON.parse(root.localStorage.getItem(chave)||"{}");
      return valor&&typeof valor==="object"&&!Array.isArray(valor)?valor:{};
    }catch(_erro){return {};}
  }

  function chaveFicha(nome){
    const limpo=limparNome(nome);
    return limpo==="Principal"?CHAVE_BASE:`${PREFIXO}${limpo}`;
  }

  function chavesStorage(){
    const saida=new Set();
    try{
      const total=Number(root.localStorage?.length||0);
      for(let i=0;i<total;i++){
        const chave=root.localStorage.key?.(i);
        if(chave)saida.add(String(chave));
      }
    }catch(_erro){}
    try{Object.keys(root.localStorage||{}).forEach(chave=>saida.add(String(chave)));}catch(_erro){}
    return [...saida];
  }

  function listarRegistrosFisicos(){
    const registros=[];
    for(const chave of chavesStorage()){
      if(chave!==CHAVE_BASE&&!chave.startsWith(PREFIXO))continue;
      const rawName=chave===CHAVE_BASE?"Principal":chave.slice(PREFIXO.length);
      registros.push({
        key:chave,
        rawName,
        name:limparNome(rawName),
        data:lerDadosPorChave(chave)
      });
    }
    return registros;
  }

  function nomesDaLista(){
    let lista=lerJson(CHAVE_LISTA,["Principal"]);
    if(!Array.isArray(lista))lista=["Principal"];
    const nomes=lista.map(limparNome).filter(Boolean);
    if(!nomes.includes("Principal"))nomes.unshift("Principal");
    return Array.from(new Set(nomes));
  }

  function agruparRegistrosFisicos(){
    const grupos=new Map();
    for(const registro of listarRegistrosFisicos()){
      if(!grupos.has(registro.name))grupos.set(registro.name,[]);
      grupos.get(registro.name).push(registro);
    }
    return grupos;
  }

  function escolherRegistroPrincipal(registros,nome){
    const canonica=chaveFicha(nome);
    return (registros||[]).find(item=>item.key===canonica)||(registros||[])[0]||null;
  }

  function listarFichasLocais(){
    const grupos=agruparRegistrosFisicos();
    const nomes=Array.from(new Set([...nomesDaLista(),...grupos.keys()]));
    if(!nomes.includes("Principal"))nomes.unshift("Principal");
    return nomes.map(nome=>{
      const fisicos=grupos.get(nome)||[];
      const principal=escolherRegistroPrincipal(fisicos,nome);
      return {
        name:nome,
        key:principal?.key||chaveFicha(nome),
        data:principal?.data||{},
        rawName:principal?.rawName||nome,
        physicalKeys:fisicos.map(item=>item.key),
        physicalRecords:fisicos
      };
    });
  }

  function obterFichaPorNome(nome){
    const alvo=limparNome(nome);
    return listarFichasLocais().find(ficha=>ficha.name===alvo)||null;
  }

  function onlineDaFicha(data){
    return data?.__online&&typeof data.__online==="object"?data.__online:{};
  }

  function identidadesDaFicha(data){
    const online=onlineDaFicha(data);
    return new Set([
      texto(online.characterId),texto(online.realtimeId),texto(online.sheetId),
      texto(online.sourceSheetId),texto(online.originSheetId)
    ].filter(Boolean));
  }

  function compartilhaIdentidade(dataA,dataB){
    const a=identidadesDaFicha(dataA),b=identidadesDaFicha(dataB);
    for(const id of a)if(b.has(id))return true;
    return false;
  }

  function normalizarConteudoComparacao(valor){
    if(Array.isArray(valor))return valor.map(normalizarConteudoComparacao);
    if(!valor||typeof valor!=="object")return valor;
    const saida={};
    Object.keys(valor).sort().forEach(chave=>{
      if(chave==="__online")return;
      saida[chave]=normalizarConteudoComparacao(valor[chave]);
    });
    return saida;
  }

  function conteudoEquivalente(dataA,dataB){
    try{return JSON.stringify(normalizarConteudoComparacao(dataA))===JSON.stringify(normalizarConteudoComparacao(dataB));}
    catch(_erro){return false;}
  }

  function classificarRegistroLegado(registro,principalData){
    const online=onlineDaFicha(registro?.data);
    const explicitamenteLegado=online.legacyAutoCopy===true||online.syncDisabled===true;
    const nomeGerado=ehNomeCopiaAutomatica(registro?.rawName)||ehNomeCopiaAutomatica(registro?.name);
    const mesmaIdentidade=compartilhaIdentidade(registro?.data,principalData);
    const igualPrincipal=conteudoEquivalente(registro?.data,principalData);
    const copiaUsuario=online.userCopy===true;

    if(explicitamenteLegado)return "segura";
    if(nomeGerado&&mesmaIdentidade)return "segura";
    if(nomeGerado&&igualPrincipal&&!copiaUsuario)return "segura";
    if(nomeGerado||mesmaIdentidade)return "revisar";
    return "normal";
  }

  function ehCopiaLegadaMarcada(ficha){
    if(!ficha||limparNome(ficha.name)==="Principal")return false;
    const principal=obterFichaPorNome("Principal");
    const registros=ficha.physicalRecords?.length?ficha.physicalRecords:[{
      name:ficha.name,rawName:ficha.rawName||ficha.name,data:ficha.data||{}
    }];
    return registros.length>0&&registros.every(registro=>classificarRegistroLegado(registro,principal?.data||{})==="segura");
  }

  function listarCopiasLegadasLocais(){
    const fichas=listarFichasLocais();
    const principal=fichas.find(ficha=>ficha.name==="Principal");
    const seguras=[],revisar=[];

    for(const ficha of fichas){
      if(ficha.name==="Principal")continue;
      const registros=ficha.physicalRecords||[];
      if(!registros.length){
        if(ehNomeCopiaAutomatica(ficha.name))revisar.push(ficha);
        continue;
      }
      const classes=registros.map(registro=>classificarRegistroLegado(registro,principal?.data||{}));
      if(classes.every(classe=>classe==="segura"))seguras.push(ficha);
      else if(classes.some(classe=>classe!=="normal")||ehNomeCopiaAutomatica(ficha.name))revisar.push(ficha);
    }
    return {seguras,revisar};
  }

  function atualizarListaAposExclusao(nomesExcluidos){
    const excluir=new Set((nomesExcluidos||[]).map(limparNome));
    let lista=lerJson(CHAVE_LISTA,["Principal"]);
    if(!Array.isArray(lista))lista=["Principal"];
    lista=lista.map(limparNome).filter(nome=>!excluir.has(nome));
    lista=Array.from(new Set(lista));
    if(!lista.includes("Principal"))lista.unshift("Principal");
    root.localStorage.setItem(CHAVE_LISTA,JSON.stringify(lista));

    const ativa=limparNome(root.localStorage.getItem(CHAVE_ATIVA)||"Principal");
    if(excluir.has(ativa))root.localStorage.setItem(CHAVE_ATIVA,"Principal");
    try{
      if(Array.isArray(root.fichas))root.fichas=root.fichas.filter(nome=>!excluir.has(limparNome(nome)));
    }catch(_erro){}
    return lista;
  }

  function chavesFisicasDaFicha(nome){
    const alvo=limparNome(nome);
    const chaves=new Set([chaveFicha(alvo)]);
    for(const registro of listarRegistrosFisicos()){
      if(registro.name===alvo)chaves.add(registro.key);
    }
    return [...chaves];
  }

  function exclusaoEmAndamento(){
    return Boolean(root.__ekoExclusaoFichaEmAndamento);
  }

  function iniciarTravaExclusao(nome){
    const limpo=limparNome(nome);
    root.__ekoExclusaoFichaEmAndamento={
      name:limpo,
      keys:chavesFisicasDaFicha(limpo),
      startedAt:Date.now()
    };
    return root.__ekoExclusaoFichaEmAndamento;
  }

  function encerrarTravaExclusao(){
    try{delete root.__ekoExclusaoFichaEmAndamento;}catch(_erro){root.__ekoExclusaoFichaEmAndamento=null;}
  }

  function bloquearSalvamentoDeSaida(evento){
    if(!exclusaoEmAndamento())return;
    /* O 02-runtime.js registra salvamento automático em pagehide/visibilitychange.
       Durante uma exclusão esses listeners não podem executar, senão recriam a
       chave que acabou de ser removida. stopImmediatePropagation não cancela a
       navegação; apenas impede os listeners posteriores deste mesmo evento. */
    try{evento?.stopImmediatePropagation?.();}catch(_erro){}
  }

  function instalarBloqueioSaida(){
    if(root.__ekoBloqueioExclusaoInstalado)return;
    root.__ekoBloqueioExclusaoInstalado=true;
    try{root.addEventListener?.("pagehide",bloquearSalvamentoDeSaida,true);}catch(_erro){}
    try{root.addEventListener?.("beforeunload",bloquearSalvamentoDeSaida,true);}catch(_erro){}
    try{root.document?.addEventListener?.("visibilitychange",bloquearSalvamentoDeSaida,true);}catch(_erro){}
  }

  function removerFichaLocal(nome){
    const limpo=limparNome(nome);
    if(!limpo||limpo==="Principal")return false;

    const ativa=limparNome(root.localStorage.getItem(CHAVE_ATIVA)||"Principal");
    if(ativa===limpo)root.localStorage.setItem(CHAVE_ATIVA,"Principal");

    let removeuAlgo=false;
    for(const chave of chavesFisicasDaFicha(limpo)){
      try{
        if(root.localStorage.getItem(chave)!==null)removeuAlgo=true;
        root.localStorage.removeItem(chave);
      }catch(_erro){}
    }

    const listaAntes=nomesDaLista();
    atualizarListaAposExclusao([limpo]);
    if(listaAntes.includes(limpo))removeuAlgo=true;
    return removeuAlgo;
  }

  async function excluirFichaMelhorada(){
    const nome=limparNome(root.localStorage.getItem(CHAVE_ATIVA)||"Principal");
    if(nome==="Principal"){
      if(typeof root.avisoShinobi==="function")await root.avisoShinobi("Ficha protegida","A ficha Principal não pode ser excluída.");
      else root.alert?.("A ficha Principal não pode ser excluída.");
      return false;
    }

    const confirmar=typeof root.modalShinobi==="function"
      ? await root.modalShinobi("Excluir ficha?",`Excluir “${nome}”? A ficha Principal será mantida. A exclusão é somente deste aparelho; backups da nuvem não serão apagados.`)
      : root.confirm?.(`Excluir "${nome}" deste aparelho?`);
    if(!confirmar)return false;

    /* A trava precisa nascer ANTES da remoção. Ao chamar reload(), navegadores
       disparam visibilitychange/pagehide; versões anteriores deixavam o runtime
       salvar a ficha velha nesse intervalo e, assim, ressuscitá-la. */
    iniciarTravaExclusao(nome);

    /* Não chamamos salvar() aqui: em aliases antigos cujo nome foi truncado,
       salvar antes da exclusão podia criar uma NOVA chave canônica e manter a
       chave física antiga viva. */
    const removeu=removerFichaLocal(nome);
    if(!removeu){
      if(typeof root.avisoShinobi==="function")await root.avisoShinobi("Ficha não encontrada","A entrada já não possui dados locais. A lista será reparada ao recarregar.");
      atualizarListaAposExclusao([nome]);
    }

    /* Não religamos realtime nesta página: ela está sendo destruída. A nova
       página abrirá já na Principal e ativará o realtime pelo fluxo normal. */
    root.alert?.("Ficha excluída deste aparelho.");
    try{
      root.location.reload();
    }catch(_erro){
      /* Se o ambiente não conseguir recarregar, não deixamos o app travado sem
         salvamento. Em um reload normal o novo contexto já nasce sem a trava. */
      encerrarTravaExclusao();
    }
    return true;
  }

  function nomesParaMensagem(fichas){
    return (fichas||[]).map(f=>`“${limparNome(f.name)}”`).join(" • ");
  }

  async function limparCopiasAntigas(){
    const analise=listarCopiasLegadasLocais();
    const seguras=analise.seguras;
    const revisar=analise.revisar;

    if(!seguras.length){
      const complemento=revisar.length
        ? ` Existem ${revisar.length} entrada(s) suspeita(s), mas sem evidência suficiente para exclusão automática; elas foram preservadas.`
        : "";
      if(typeof root.avisoShinobi==="function")await root.avisoShinobi("Nenhuma cópia segura para limpar",`Não encontrei cópias antigas que possam ser removidas automaticamente.${complemento}`);
      else root.alert?.(`Nenhuma cópia segura para remover.${complemento}`);
      return {removidas:0,revisar:revisar.length};
    }

    const nomes=nomesParaMensagem(seguras);
    const avisoRevisao=revisar.length?` ${revisar.length} entrada(s) duvidosa(s) serão mantidas.`:"";
    const ok=typeof root.modalShinobi==="function"
      ? await root.modalShinobi(
          "Limpar cópias antigas?",
          `Serão removidas ${seguras.length} entrada(s) antigas deste aparelho: ${nomes}. A ficha Principal e os dados online dela serão mantidos.${avisoRevisao}`
        )
      : root.confirm?.(`Excluir ${seguras.length} cópia(s) antigas deste aparelho? ${nomes}`);
    if(!ok)return {removidas:0,revisar:revisar.length};

    const removidas=[];
    for(const ficha of seguras){
      if(!ehCopiaLegadaMarcada(ficha))continue;
      if(removerFichaLocal(ficha.name))removidas.push(limparNome(ficha.name));
    }

    try{await root.EkoRealtimeSync?.ativarFichaAtual?.();}catch(_erro){}
    root.alert?.(`${removidas.length} cópia(s) antiga(s) removida(s) deste aparelho.${revisar.length?` ${revisar.length} foram preservadas por segurança.`:""}`);
    try{root.location.reload();}catch(_erro){}
    return {removidas:removidas.length,revisar:revisar.length};
  }

  function instalar(){
    /* Este arquivo é carregado antes de 02-runtime.js; registrar o bloqueio aqui
       garante que, numa exclusão, ele rode antes dos salvamentos de saída. */
    instalarBloqueioSaida();
    root.excluirFicha=excluirFichaMelhorada;
    root.limparCopiasAntigas=limparCopiasAntigas;
  }

  return {
    ehNomeCopiaAutomatica,
    ehCopiaLegadaMarcada,
    listarRegistrosFisicos,
    listarFichasLocais,
    obterFichaPorNome,
    listarCopiasLegadasLocais,
    chavesFisicasDaFicha,
    exclusaoEmAndamento,
    iniciarTravaExclusao,
    encerrarTravaExclusao,
    instalarBloqueioSaida,
    excluirFichaMelhorada,
    limparCopiasAntigas,
    removerFichaLocal,
    instalar
  };
});
