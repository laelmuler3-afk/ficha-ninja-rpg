/* Ficha Ninja RPG — integração local/online, fila de buffs e sincronização. */
(function(){
  "use strict";

  const CHAVE_FILA_EFEITOS="shinobi_online_effect_queue_v1";
  const TTL_FILA=7*24*60*60*1000;
  const INTERVALO_RETRY=4500;

  let timerResumo=null;
  let timerFila=null;
  let aplicandoRodada=false;
  let processandoFila=false;
  const publicacoesEmCurso=new Set();

  function sessaoAtual(){
    try{return JSON.parse(localStorage.getItem("shinobi_online_session_v1")||"null");}catch(_erro){return null;}
  }

  function fichaAtualNome(){
    try{
      if(typeof fichaAtual!=="undefined"&&String(fichaAtual||"").trim()) return String(fichaAtual).trim();
    }catch(_erro){}
    try{return localStorage.getItem("ficha_ninja_ativa_v1")||"Principal";}catch(_erro){return "Principal";}
  }

  function fichaAtualId(){
    try{return window.ShinobiOnline?.fichaAtualLocal?.()?.sheetId||"";}catch(_erro){return "";}
  }

  function texto(valor){return String(valor==null?"":valor).trim();}
  function normalizar(valor){
    return texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  }
  function clonar(valor){
    try{return structuredClone(valor);}catch(_erro){try{return JSON.parse(JSON.stringify(valor));}catch(_erro2){return valor;}}
  }
  function hashLeve(valor){
    const str=typeof valor==="string"?valor:JSON.stringify(valor);
    let hash=2166136261;
    for(let i=0;i<str.length;i+=1){hash^=str.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return (hash>>>0).toString(16).padStart(8,"0");
  }

  function lerFila(){
    try{
      const valor=JSON.parse(localStorage.getItem(CHAVE_FILA_EFEITOS)||"{}");
      return valor&&typeof valor==="object"&&!Array.isArray(valor)?valor:{};
    }catch(_erro){return {};}
  }
  function salvarFila(fila){
    try{localStorage.setItem(CHAVE_FILA_EFEITOS,JSON.stringify(fila||{}));}catch(_erro){}
    agendarFila();
  }
  function idFila(roomId,localEffectId,aplicadoEm){
    return `queue_${hashLeve(`${roomId}|${localEffectId}|${aplicadoEm}`)}_${Math.max(0,Number(aplicadoEm||Date.now())).toString(36)}`;
  }
  function idEfeitoRemoto(roomId,participantId,localEffectId,aplicadoEm){
    return `effect_${hashLeve(`${roomId}|${participantId}|${localEffectId}|${aplicadoEm}`)}_${Math.max(0,Number(aplicadoEm||Date.now())).toString(36)}`;
  }

  function listaEfeitosLocais(){
    try{return Array.isArray(estado?.efeitosBatalhaAtivos)?estado.efeitosBatalhaAtivos:[];}catch(_erro){return [];}
  }
  function itemLocal(localEffectId){return listaEfeitosLocais().find(item=>item?.id===localEffectId)||null;}

  function rodadasRestantes(remoto,combat){
    if(remoto?.timed===false||!Number.isFinite(Number(remoto?.expiresAtRound))) return null;
    const rodadaAtual=Math.max(1,Number(combat?.round||1));
    const indiceAtual=Math.max(0,Number(combat?.turnIndex||0));
    const rodadaFim=Math.max(1,Number(remoto.expiresAtRound));
    const ordem=Array.isArray(combat?.order)?combat.order:Object.values(combat?.order||{});
    const participanteFim=texto(remoto?.expiresAtParticipantId||remoto?.startTurnParticipantId);
    const indiceEncontrado=participanteFim?ordem.indexOf(participanteFim):-1;
    const indiceFim=Math.max(0,indiceEncontrado>=0?indiceEncontrado:Number(remoto?.expiresAtTurnIndex??remoto?.startTurnIndex??0));
    if(rodadaAtual>rodadaFim||(rodadaAtual===rodadaFim&&indiceAtual>=indiceFim)) return 0;
    if(ordem.length){
      const turnosAteFim=(rodadaFim-rodadaAtual)*ordem.length+(indiceFim-indiceAtual);
      return Math.max(1,Math.ceil(turnosAteFim/ordem.length));
    }
    const diferenca=rodadaFim-rodadaAtual;
    return diferenca>0?diferenca:1;
  }

  function atualizarVisualEfeitos(){
    try{window.EfeitosJutsuShinobi?.atualizar?.();}catch(_erro){}
    try{window.atualizarHUD?.();}catch(_erro){}
    try{window.atualizarDefesasTotaisBatalha?.();}catch(_erro){}
    try{window.atualizarMotorUniversalEfeitos?.();}catch(_erro){}
    window.dispatchEvent(new CustomEvent("shinobi:efeitos-batalha-atualizados"));
  }

  function salvarEstadoSemLoop(){
    try{
      localStorage.setItem(CHAVE,JSON.stringify(estado));
      return true;
    }catch(_erro){return false;}
  }

  function instalarAutoSync(){
    if(typeof persistirEstadoLocal!=="function"||persistirEstadoLocal.__onlineHook) return;
    const original=persistirEstadoLocal;
    const wrapper=function(){
      const ok=original.apply(this,arguments);
      if(ok!==false&&window.ShinobiOnline){
        window.ShinobiOnline.agendarSincronizacaoFicha(fichaAtualNome());
        clearTimeout(timerResumo);
        timerResumo=setTimeout(()=>window.ShinobiOnline.atualizarMeuParticipante?.().catch(()=>{}),900);
      }
      return ok;
    };
    wrapper.__onlineHook=true;
    wrapper.__original=original;
    try{persistirEstadoLocal=wrapper;}catch(_erro){window.persistirEstadoLocal=wrapper;}
  }

  function instalarBackupManual(){
    if(typeof salvarManual!=="function"||salvarManual.__onlineHook) return;
    const original=salvarManual;
    const wrapper=function(){
      const retorno=original.apply(this,arguments);
      setTimeout(()=>window.ShinobiOnline?.sincronizarFicha(fichaAtualNome(),{force:false,backup:true,motivo:"salvamento-manual"}).catch(()=>{}),60);
      return retorno;
    };
    wrapper.__onlineHook=true;
    wrapper.__original=original;
    try{salvarManual=wrapper;}catch(_erro){window.salvarManual=wrapper;}
  }

  function participanteVinculado(sessao,online,registro={}){
    const participantes=online?.sala?.participants||{};
    if(registro.participantId&&participantes[registro.participantId]) return participantes[registro.participantId];
    if(sessao?.participantId&&participantes[sessao.participantId]) return participantes[sessao.participantId];

    const uid=online?.user?.uid;
    const candidatos=Object.values(participantes).filter(p=>p?.ownerUid===uid);
    const sheetId=texto(registro.sheetId||sessao?.sheetId||fichaAtualId());
    if(sheetId){
      const mesmaFicha=candidatos.find(p=>p.sheetId===sheetId||p.sourceSheetId===sheetId||p.battle?.sourceSheetId===sheetId);
      if(mesmaFicha) return mesmaFicha;
    }
    const jogadores=candidatos.filter(p=>p?.type==="player");
    if(jogadores.length===1) return jogadores[0];
    return candidatos.length===1?candidatos[0]:null;
  }

  function valorComSinal(valor){
    const n=Number(valor);
    return Number.isFinite(n)?(n>0?`+${n}`:String(n)):texto(valor);
  }

  function textoMecanica(efeito){
    if(texto(efeito?.texto)) return texto(efeito.texto);
    const alvo=texto(efeito?.alvo||efeito?.tipo||"efeito").replace(/_/g," ");
    const operacao=texto(efeito?.operacao);
    const valor=efeito?.valor;
    if(operacao==="multiplicar"&&valor!==undefined) return `${alvo} ×${valor}`;
    if(["somar","subtrair"].includes(operacao)&&valor!==undefined) return `${alvo} ${valorComSinal(valor)}`;
    if(valor!==undefined&&texto(valor)) return `${alvo}: ${texto(valor)}`;
    return alvo;
  }

  function detalhesDosEfeitos(origem){
    return (Array.isArray(origem)?origem:[]).slice(0,16).map((efeito,indice)=>({
      id:texto(efeito?.id||`mecanica-${indice+1}`),
      polarity:texto(efeito?.polaridade||efeito?.polarity||"neutro"),
      appliesTo:texto(efeito?.aplicaEm||efeito?.appliesTo||"usuario"),
      target:texto(efeito?.alvo||efeito?.target||efeito?.tipo||"efeito"),
      operation:texto(efeito?.operacao||efeito?.operation||""),
      value:efeito?.valor??efeito?.value??"",
      text:textoMecanica(efeito)
    }));
  }

  function detalhesDoResultado(resultado){return detalhesDosEfeitos(resultado?.persistentes);}
  function resumoDosDetalhes(detalhes){return (detalhes||[]).map(item=>texto(item.text)).filter(Boolean).slice(0,8).join(" • ");}

  function idsUnicos(...valores){
    return Array.from(new Set(valores.flat(Infinity).map(texto).filter(Boolean)));
  }

  function marcarItemPendente(item,registro){
    if(!item)return;
    item.onlineSyncPendente=true;
    item.onlineFilaId=registro.id;
    item.onlineRoomId=registro.roomId;
    item.onlineErro="";
    const anteriores=idsUnicos(registro.previousEffectIds,registro.previousEffectId,item.onlinePreviousEffectIds);
    if(anteriores.length)item.onlinePreviousEffectIds=anteriores;
    if(item.onlineEffectId&&anteriores.includes(item.onlineEffectId)) delete item.onlineEffectId;
    salvarEstadoSemLoop();
    atualizarVisualEfeitos();
  }

  function criarRegistroFila({jutsu=null,indice=0,resultado=null,item=null,forcar=false}={}){
    const sessao=sessaoAtual();
    if(!sessao?.roomId||!window.ShinobiOnline) return null;
    const local=item||itemLocal(resultado?.itemId);
    if(!local||(!forcar&&resultado&&!resultado.aplicado)) return null;
    const duracao=texto(resultado?.duracao||local.duracaoOriginal||local.duracao||jutsu?.duracao||local.efeitos?.find(e=>texto(e?.duracao))?.duracao);
    const regra=window.ShinobiOnline.analisarDuracaoRodadas(duracao);
    if(!regra) return null;

    const aplicadoEm=Number(resultado?.aplicadoEm||local.aplicadoEm||Date.now());
    const localEffectId=texto(resultado?.itemId||local.id);
    if(!localEffectId) return null;
    const online=window.ShinobiOnline.snapshot?.()||{};
    const combat=online?.sala?.id===sessao.roomId?online.sala.combat||{}:{};
    const detalhes=resultado?detalhesDoResultado(resultado):detalhesDosEfeitos(local.efeitos);
    const registro={
      id:idFila(sessao.roomId,localEffectId,aplicadoEm),
      roomId:sessao.roomId,
      sheetId:texto(sessao.sheetId||fichaAtualId()),
      participantId:texto(sessao.participantId),
      localEffectId,
      effectId:idEfeitoRemoto(sessao.roomId,texto(sessao.participantId||"pending"),localEffectId,aplicadoEm),
      previousEffectIds:idsUnicos(resultado?.onlineEffectIdAnterior,local.onlineEffectId,local.onlinePreviousEffectIds),
      name:texto(jutsu?.nome||local.nome||"Jutsu"),
      source:`jutsu:${texto(jutsu?.catalogoId||local.origemId||indice)}`,
      durationOriginal:regra.original||duracao||"Até ser encerrado",
      timed:regra.timed!==false&&Number.isFinite(Number(regra.rounds)),
      rounds:Number.isFinite(Number(regra.rounds))?Math.max(1,Math.ceil(Number(regra.rounds))):null,
      summary:resumoDosDetalhes(detalhes),
      details:detalhes,
      appliedAt:aplicadoEm,
      startRound:Number.isFinite(Number(combat.round))?Math.max(1,Number(combat.round)):null,
      startTurnIndex:Number.isFinite(Number(combat.turnIndex))?Math.max(0,Number(combat.turnIndex)):null,
      createdAt:Date.now(),attempts:0,nextAttemptAt:0,lastError:""
    };
    return registro;
  }

  function enfileirarRegistro(registro){
    if(!registro)return null;
    const fila=lerFila();
    const anteriores=[];
    Object.entries(fila).forEach(([id,item])=>{
      if(item?.roomId===registro.roomId&&item?.localEffectId===registro.localEffectId&&id!==registro.id){
        anteriores.push(item.previousEffectIds||item.previousEffectId||[],item.effectId||"");
        delete fila[id];
      }
    });
    registro.previousEffectIds=idsUnicos(registro.previousEffectIds,anteriores).filter(id=>id!==registro.effectId);
    fila[registro.id]=registro;
    salvarFila(fila);
    marcarItemPendente(itemLocal(registro.localEffectId),registro);
    window.dispatchEvent(new CustomEvent("shinobi:online:efeito-pendente",{detail:{registro:clonar(registro)}}));
    processarFilaEfeitos({forcar:true}).catch(()=>{});
    return registro;
  }

  function recuperarEfeitosNaoPublicados(){
    const sessao=sessaoAtual();
    const online=window.ShinobiOnline?.snapshot?.();
    if(!sessao?.roomId||!online?.user)return;
    const fila=lerFila();
    let alterou=false;
    listaEfeitosLocais().forEach(item=>{
      if(!item?.id||item.onlineEffectId||item.onlineRoomId&&item.onlineRoomId!==sessao.roomId)return;
      const existente=Object.values(fila).find(reg=>reg?.roomId===sessao.roomId&&reg?.localEffectId===item.id);
      if(existente){if(!item.onlineSyncPendente)marcarItemPendente(item,existente);return;}
      const registro=criarRegistroFila({item,forcar:true});
      if(registro){fila[registro.id]=registro;marcarItemPendente(item,registro);alterou=true;}
    });
    if(alterou)salvarFila(fila);
  }

  function atualizarItemPublicado(registro,efeitoOnline){
    const item=itemLocal(registro.localEffectId);
    if(!item)return false;
    /* Uma renovação pode ocorrer enquanto a publicação anterior ainda está em
       andamento. Nesse caso, o resultado antigo não pode sobrescrever o estado
       da renovação mais nova. O novo registro já contém o ID antigo para encerrá-lo. */
    if(item.onlineFilaId&&item.onlineFilaId!==registro.id)return false;
    item.onlineEffectId=efeitoOnline.id;
    item.onlineRoomId=registro.roomId;
    item.onlinePublicadoEm=Date.now();
    item.onlineSyncPendente=false;
    item.onlineErro="";
    delete item.onlineFilaId;
    delete item.onlinePreviousEffectIds;
    item.duracaoOriginal=item.duracaoOriginal||registro.durationOriginal||item.duracao;
    if(efeitoOnline.timed!==false&&Number.isFinite(Number(efeitoOnline.totalRounds))){
      item.duracaoRodadasTotal=Number(efeitoOnline.totalRounds);
      item.duracaoRodadasRestantes=Number(efeitoOnline.totalRounds);
      item.rodadaAtivacao=efeitoOnline.startRound;
      item.turnoAtivacao=efeitoOnline.startTurnIndex;
      item.expiraNaRodada=efeitoOnline.expiresAtRound;
      item.expiraNoTurno=efeitoOnline.expiresAtTurnIndex;
      item.duracao=`${efeitoOnline.totalRounds} rodadas • restam ${efeitoOnline.totalRounds}`;
    }else{
      item.duracao=efeitoOnline.durationOriginal||registro.durationOriginal||"Até ser encerrado";
      item.duracaoRodadasTotal=null;
      item.duracaoRodadasRestantes=null;
    }
    salvarEstadoSemLoop();
    atualizarVisualEfeitos();
    return true;
  }

  function removerRegistroDaFila(id){const fila=lerFila();if(fila[id]){delete fila[id];salvarFila(fila);}}

  async function publicarRegistro(registro,online,sessao){
    const chave=registro.id;
    if(publicacoesEmCurso.has(chave))return false;
    const local=itemLocal(registro.localEffectId);
    if(!local){removerRegistroDaFila(registro.id);return false;}
    if(!sessao?.roomId||sessao.roomId!==registro.roomId)return false;
    if(!online?.sala||online.sala.id!==registro.roomId||!online.user)return false;

    const participante=participanteVinculado(sessao,online,registro);
    if(!participante)throw new Error("A ficha ainda não está vinculada a um participante desta sala.");
    registro.participantId=participante.id;
    registro.effectId=idEfeitoRemoto(registro.roomId,participante.id,registro.localEffectId,registro.appliedAt);
    publicacoesEmCurso.add(chave);
    try{
      const anteriores=idsUnicos(registro.previousEffectIds,registro.previousEffectId).filter(id=>id!==registro.effectId);
      if(anteriores.length){
        await Promise.all(anteriores.map(id=>Promise.resolve(window.ShinobiOnline.encerrarEfeito(id)).catch(()=>{})));
      }
      const efeitoOnline=await window.ShinobiOnline.adicionarEfeito({
        participantId:participante.id,
        name:registro.name,
        duration:registro.durationOriginal,
        resolvedRounds:registro.rounds,
        durationTimed:registro.timed,
        durationOriginal:registro.durationOriginal,
        source:registro.source,
        ownerUid:online.user.uid,
        summary:registro.summary,
        details:registro.details,
        localEffectId:registro.localEffectId,
        effectId:registro.effectId,
        startRound:registro.startRound,
        startTurnIndex:registro.startTurnIndex
      });
      if(!efeitoOnline)return false;
      const aplicadoNoItem=atualizarItemPublicado(registro,efeitoOnline);
      removerRegistroDaFila(registro.id);
      if(aplicadoNoItem){
        try{if(typeof log==="function")log(`Buff de ${registro.name} sincronizado com a mesa${efeitoOnline.timed===false?" até ser encerrado":` por ${efeitoOnline.totalRounds} rodadas`}.`);}catch(_erro){}
        window.dispatchEvent(new CustomEvent("shinobi:online:efeito-sincronizado",{detail:{registro:clonar(registro),efeito:clonar(efeitoOnline)}}));
      }
      return true;
    }finally{publicacoesEmCurso.delete(chave);}
  }

  async function processarFilaEfeitos({forcar=false}={}){
    if(processandoFila||!window.ShinobiOnline)return;
    processandoFila=true;
    try{
      const filaInicial=lerFila();
      const ids=Object.keys(filaInicial).sort((a,b)=>Number(filaInicial[a]?.createdAt||0)-Number(filaInicial[b]?.createdAt||0));
      for(const id of ids){
        const agora=Date.now();
        const filaAtual=lerFila();
        const registro=filaAtual[id];
        if(!registro)continue;
        const sessao=sessaoAtual();
        const online=window.ShinobiOnline.snapshot?.()||{};
        if(agora-Number(registro.createdAt||agora)>TTL_FILA){removerRegistroDaFila(id);continue;}
        if(sessao?.roomId&&registro.roomId!==sessao.roomId){removerRegistroDaFila(id);continue;}
        if(!itemLocal(registro.localEffectId)){removerRegistroDaFila(id);continue;}
        if(!forcar&&Number(registro.nextAttemptAt||0)>agora)continue;
        if(!sessao?.roomId||!online?.user||!online?.sala||online.sala.id!==registro.roomId)continue;
        try{
          await publicarRegistro(registro,online,sessao);
        }catch(erro){
          const atual=lerFila();
          const pendente=atual[id];
          if(!pendente)continue;
          pendente.attempts=Number(pendente.attempts||0)+1;
          pendente.lastError=window.ShinobiOnline?.erroAmigavel?.(erro)||String(erro?.message||erro);
          pendente.nextAttemptAt=Date.now()+Math.min(30000,1200*Math.pow(2,Math.min(4,pendente.attempts)));
          atual[id]=pendente;
          salvarFila(atual);
          const item=itemLocal(pendente.localEffectId);
          if(item){item.onlineSyncPendente=true;item.onlineErro=pendente.lastError;salvarEstadoSemLoop();}
          if(pendente.attempts===1||pendente.attempts%4===0){
            window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:`O buff ${pendente.name} está pendente e será reenviado automaticamente. ${pendente.lastError}`}}));
          }
        }
      }
    }finally{
      processandoFila=false;
      agendarFila();
    }
  }

  function agendarFila(){
    clearTimeout(timerFila);
    const fila=lerFila();
    if(!Object.keys(fila).length)return;
    timerFila=setTimeout(()=>processarFilaEfeitos().catch(()=>{}),INTERVALO_RETRY);
  }

  async function publicarEfeitoDoJutsu(jutsu,indice,resultado){
    if(!resultado?.aplicado)return;
    const registro=criarRegistroFila({jutsu,indice,resultado});
    if(registro)enfileirarRegistro(registro);
  }

  function instalarPublicacaoJutsu(){
    const atual=window.aplicarEfeitosJutsuBatalha;
    if(typeof atual!=="function"||atual.__onlineHook)return;
    const wrapper=async function(jutsu,indice){
      const resultado=await atual.apply(this,arguments);
      try{await publicarEfeitoDoJutsu(jutsu,indice,resultado);}catch(erro){
        const item=resultado?.itemId?itemLocal(resultado.itemId):null;
        if(item){item.onlineSyncPendente=true;item.onlineErro=Date.now();salvarEstadoSemLoop();}
        window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:window.ShinobiOnline?.erroAmigavel?.(erro)||String(erro)}}));
      }
      return resultado;
    };
    wrapper.__onlineHook=true;
    wrapper.__original=atual;
    window.aplicarEfeitosJutsuBatalha=wrapper;
  }

  function removerPendenciasDoItem(localEffectId){
    const fila=lerFila();
    const remotos=[];
    Object.entries(fila).forEach(([id,registro])=>{
      if(registro?.localEffectId===localEffectId){
        remotos.push(registro.previousEffectIds||registro.previousEffectId||[],registro.effectId||"");
        delete fila[id];
      }
    });
    salvarFila(fila);
    return idsUnicos(remotos);
  }

  function instalarEncerramentoManual(){
    const atual=window.removerEfeitoJutsuBatalha;
    if(typeof atual!=="function"||atual.__onlineHook)return;
    const wrapper=async function(id){
      const itemAntes=itemLocal(id);
      const retorno=await atual.apply(this,arguments);
      const foiRemovido=Boolean(itemAntes&&!itemLocal(id));
      if(foiRemovido){
        const ids=idsUnicos(itemAntes.onlineEffectId,itemAntes.onlinePreviousEffectIds,removerPendenciasDoItem(id));
        await Promise.all(ids.map(effectId=>Promise.resolve(window.ShinobiOnline?.encerrarEfeito?.(effectId)).catch(()=>{})));
      }
      return retorno;
    };
    wrapper.__onlineHook=true;
    wrapper.__original=atual;
    window.removerEfeitoJutsuBatalha=wrapper;
  }

  function limparFilaDaSala(roomId=""){
    const fila=lerFila(),remotos=[];
    Object.entries(fila).forEach(([id,registro])=>{
      if(!roomId||registro?.roomId===roomId){
        remotos.push(registro.previousEffectIds||registro.previousEffectId||[],registro.effectId||"");
        delete fila[id];
      }
    });
    salvarFila(fila);
    return idsUnicos(remotos);
  }

  function instalarLimpezaOnline(){
    const atual=window.limparEfeitosJutsuBatalhaSemConfirmacao;
    if(typeof atual!=="function"||atual.__onlineHook)return;
    const wrapper=function(){
      const sessao=sessaoAtual();
      const ids=idsUnicos(listaEfeitosLocais().flatMap(item=>[item?.onlineEffectId,item?.onlinePreviousEffectIds]),limparFilaDaSala(sessao?.roomId));
      const retorno=atual.apply(this,arguments);
      ids.forEach(id=>Promise.resolve(window.ShinobiOnline?.encerrarEfeito?.(id)).catch(()=>{}));
      return retorno;
    };
    wrapper.__onlineHook=true;
    wrapper.__original=atual;
    window.limparEfeitosJutsuBatalhaSemConfirmacao=wrapper;
  }

  async function aplicarRodadaSala(snapshot){
    if(aplicandoRodada)return;
    const sessao=sessaoAtual();
    const room=snapshot?.sala;
    if(!sessao?.roomId||!room||room.id!==sessao.roomId)return;
    if(typeof estado==="undefined")return;
    recuperarEfeitosNaoPublicados();
    processarFilaEfeitos({forcar:true}).catch(()=>{});

    const lista=listaEfeitosLocais();
    if(!lista.some(item=>item?.onlineEffectId))return;
    aplicandoRodada=true;
    try{
      const efeitos=room.effects||{};
      let alterou=false;
      const encerrados=[];
      for(let i=lista.length-1;i>=0;i-=1){
        const item=lista[i];
        if(!item?.onlineEffectId)continue;
        const remoto=efeitos[item.onlineEffectId];
        if(!remoto){
          const publicadoEm=Number(item.onlinePublicadoEm||0);
          if(publicadoEm&&Date.now()-publicadoEm>6000){encerrados.push(item.nome||"Efeito");lista.splice(i,1);alterou=true;}
          continue;
        }
        const restante=rodadasRestantes(remoto,room.combat);
        if(remoto.status==="expired"||remoto.status==="ended"||restante===0){
          encerrados.push(item.nome||"Efeito");lista.splice(i,1);alterou=true;continue;
        }
        if(restante==null){
          const novoTexto=remoto.durationOriginal||item.duracaoOriginal||"Até ser encerrado";
          if(item.duracao!==novoTexto||item.duracaoRodadasRestantes!==null){item.duracao=novoTexto;item.duracaoRodadasRestantes=null;alterou=true;}
          continue;
        }
        const novoTexto=`${Number(remoto.totalRounds||restante)} rodadas • restam ${restante}`;
        if(item.duracao!==novoTexto||item.duracaoRodadasRestantes!==restante){item.duracao=novoTexto;item.duracaoRodadasRestantes=restante;alterou=true;}
      }
      if(alterou){
        estado.efeitosBatalhaAtivos=lista;
        salvarEstadoSemLoop();
        atualizarVisualEfeitos();
        encerrados.forEach(nome=>{try{if(typeof log==="function")log(`O efeito ${nome} terminou automaticamente pela contagem da mesa.`);}catch(_erro){}});
      }
    }finally{aplicandoRodada=false;}
  }

  function limparMetadadosAoSair(roomId){
    limparFilaDaSala(roomId);
    let alterou=false;
    listaEfeitosLocais().forEach(item=>{
      if(item?.onlineRoomId===roomId||item?.onlineSyncPendente){
        delete item.onlineEffectId;delete item.onlineRoomId;delete item.onlineFilaId;delete item.onlineErro;delete item.onlinePreviousEffectIds;
        item.onlineSyncPendente=false;alterou=true;
      }
    });
    if(alterou){salvarEstadoSemLoop();atualizarVisualEfeitos();}
  }

  function instalarEventosOnline(){
    if(!window.ShinobiOnline||window.__shinobiOnlineHooksEventos)return;
    window.__shinobiOnlineHooksEventos=true;
    window.ShinobiOnline.on("sala",evento=>aplicarRodadaSala(evento.detail));
    ["pronto","auth","presenca"].forEach(tipo=>window.ShinobiOnline.on(tipo,()=>{recuperarEfeitosNaoPublicados();processarFilaEfeitos({forcar:true}).catch(()=>{});}));
    window.ShinobiOnline.on("saiu-sala",evento=>limparMetadadosAoSair(evento.detail?.roomId));
    window.ShinobiOnline.on("ficha-restaurada",()=>setTimeout(()=>location.reload(),250));
    window.ShinobiOnline.on("ficha-atualizada-nuvem",evento=>{if(evento?.detail?.active)setTimeout(()=>location.reload(),250);});
    window.addEventListener("online",()=>processarFilaEfeitos({forcar:true}).catch(()=>{}),{passive:true});
  }

  function iniciar(){
    instalarAutoSync();
    instalarBackupManual();
    instalarPublicacaoJutsu();
    instalarEncerramentoManual();
    instalarLimpezaOnline();
    instalarEventosOnline();
    recuperarEfeitosNaoPublicados();
    processarFilaEfeitos({forcar:true}).catch(()=>{});
    setTimeout(()=>{
      instalarAutoSync();instalarBackupManual();instalarPublicacaoJutsu();instalarEncerramentoManual();instalarLimpezaOnline();
      recuperarEfeitosNaoPublicados();processarFilaEfeitos({forcar:true}).catch(()=>{});
    },700);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",iniciar,{once:true});
  else iniciar();
  window.addEventListener("pageshow",()=>setTimeout(iniciar,120));
})();
