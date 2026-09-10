/* Ficha Ninja RPG — integração do app local com o motor online. */
(function(){
  "use strict";

  let timerResumo=null;
  let aplicandoRodada=false;
  let sincronizandoPendentes=false;
  let ultimoTurnoObservado="";
  let ultimoParticipanteObservado="";
  const publicacoesEmCurso=new Set();

  function sessaoAtual(){
    try{return JSON.parse(localStorage.getItem("shinobi_online_session_v1")||"null");}catch(_erro){return null;}
  }

  function fichaAtualNome(){
    try{return localStorage.getItem("ficha_ninja_ativa_v1")||"Principal";}catch(_erro){return "Principal";}
  }

  const CHAVE_TURNO_PENDENTE="shinobi_turn_pending_v1";
  function marcarTurnoLocalPendente(){
    const sessao=sessaoAtual();
    try{
      localStorage.setItem(CHAVE_TURNO_PENDENTE,JSON.stringify({
        roomId:sessao?.roomId||"",
        sheetName:fichaAtualNome(),
        pending:true,
        updatedAt:Date.now()
      }));
    }catch(_erro){}
  }
  function turnoLocalPendente(){
    try{
      const dado=JSON.parse(localStorage.getItem(CHAVE_TURNO_PENDENTE)||"null");
      const sessao=sessaoAtual();
      return Boolean(dado?.pending&&(!dado.roomId||dado.roomId===sessao?.roomId));
    }catch(_erro){return false;}
  }
  function limparTurnoLocalPendente(){
    try{localStorage.removeItem(CHAVE_TURNO_PENDENTE);}catch(_erro){}
  }

  function texto(valor){return String(valor==null?"":valor).trim();}
  function normalizar(valor){
    return texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  }

  function rodadasRestantes(remoto,combat){
    const rodadaAtual=Math.max(1,Number(combat?.round||1));
    const indiceAtual=Math.max(0,Number(combat?.turnIndex||0));
    const rodadaFim=Math.max(1,Number(remoto?.expiresAtRound||rodadaAtual));
    const indiceFim=Math.max(0,Number(remoto?.expiresAtTurnIndex??remoto?.startTurnIndex??0));
    if(rodadaAtual>rodadaFim||(rodadaAtual===rodadaFim&&indiceAtual>=indiceFim)) return 0;
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

  let resumoSincronizando=false;
  let resumoPendente=false;

  async function sincronizarResumoParticipante(){
    if(!window.ShinobiOnline?.atualizarMeuParticipante) return;
    if(resumoSincronizando){
      resumoPendente=true;
      return;
    }
    resumoSincronizando=true;
    try{
      await window.ShinobiOnline.atualizarMeuParticipante();
    }catch(erro){
      window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:window.ShinobiOnline?.erroAmigavel?.(erro)||String(erro)}}));
    }finally{
      resumoSincronizando=false;
      if(resumoPendente){
        resumoPendente=false;
        setTimeout(()=>sincronizarResumoParticipante(),40);
      }
    }
  }

  function agendarResumoParticipante(atraso=140){
    clearTimeout(timerResumo);
    timerResumo=setTimeout(()=>sincronizarResumoParticipante(),atraso);
  }

  function syncPorTurnoAtiva(){
    const sessao=sessaoAtual();
    const st=window.ShinobiOnline?.snapshot?.();
    return Boolean(
      sessao?.role==="player" &&
      st?.sala?.combat?.started
    );
  }

  function contaGoogleAtiva(){
    const st=window.ShinobiOnline?.snapshot?.();
    return Boolean(st?.user&&!st.user.anonymous);
  }

  async function enviarAlteracaoConfirmada(detalhe={}){
    if(!window.ShinobiOnline) return;
    const nome=texto(detalhe.sheetName)||fichaAtualNome();

    if(syncPorTurnoAtiva()){
      marcarTurnoLocalPendente();
      if(contaGoogleAtiva()){
        window.ShinobiOnline.marcarFichaPendente?.(nome,{
          motivo:texto(detalhe.motivo)||"alteracao-turno",
          modo:"turno"
        });
      }
      return;
    }

    if(!contaGoogleAtiva()){
      await sincronizarResumoParticipante();
      return;
    }

    window.ShinobiOnline.marcarFichaPendente?.(nome,{
      motivo:texto(detalhe.motivo)||"alteracao-confirmada",
      modo:"imediato"
    });
    try{
      await window.ShinobiOnline.sincronizarFicha(nome,{
        force:false,
        backup:texto(detalhe.motivo)==="salvamento-manual",
        motivo:texto(detalhe.motivo)||"alteracao-confirmada",
        modo:"imediato"
      });
      await sincronizarResumoParticipante();
    }catch(erro){
      window.ShinobiOnline.marcarFichaPendente?.(nome,{
        motivo:"falha-envio-confirmado",
        modo:"imediato"
      });
      window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{
        detail:{mensagem:window.ShinobiOnline?.erroAmigavel?.(erro)||String(erro)}
      }));
    }
  }

  function instalarAutoSync(){
    if(window.__shinobiOnlinePersistListener) return;
    window.__shinobiOnlinePersistListener=true;

    /* 2.5.8.8: a confirmação do usuário é o ponto de commit.
       Fora do turno, persistir = enviar imediatamente. Durante o próprio
       turno, a cópia local fica segura e a nuvem recebe um único pacote ao
       confirmar o encerramento do turno. */
    window.addEventListener("shinobi:ficha-persistida",evento=>{
      if(evento?.detail?.confirmada===false) return;
      enviarAlteracaoConfirmada(evento?.detail||{}).catch(()=>{});
    });

    document.addEventListener("visibilitychange",()=>{
      if(document.visibilityState==="hidden"){
        clearTimeout(timerResumo);
        if(!syncPorTurnoAtiva()){
          sincronizarResumoParticipante();
          window.ShinobiOnline?.sincronizarPendenciasAgora?.({motivo:"app-em-segundo-plano"}).catch(()=>{});
        }
      }else{
        window.ShinobiOnline?.reconciliarSincronizacaoConta?.({
          motivo:"app-visivel",
          somenteReceber:syncPorTurnoAtiva()
        }).catch(()=>{});
      }
    });
    window.addEventListener("pagehide",()=>{
      clearTimeout(timerResumo);
      if(!syncPorTurnoAtiva()){
        sincronizarResumoParticipante();
        window.ShinobiOnline?.sincronizarPendenciasAgora?.({motivo:"pagehide"}).catch(()=>{});
      }
    });
    window.addEventListener("focus",()=>{
      window.ShinobiOnline?.reconciliarSincronizacaoConta?.({
        motivo:"foco",
        somenteReceber:syncPorTurnoAtiva()
      }).catch(()=>{});
    });
    window.addEventListener("online",()=>{
      window.ShinobiOnline?.reconciliarSincronizacaoConta?.({
        motivo:"rede-restaurada",
        somenteReceber:syncPorTurnoAtiva()
      }).catch(()=>{});
    });
  }

  function instalarBackupManual(){
    /* O evento shinobi:ficha-persistida já trata o salvamento manual e cria
       backup após a confirmação do Firebase. Mantido como ponto de extensão. */
  }

  function participanteVinculado(sessao,online){
    const participantes=online?.sala?.participants||{};
    if(sessao?.participantId&&participantes[sessao.participantId]) return participantes[sessao.participantId];
    const candidatos=Object.values(participantes).filter(p=>p?.type==="player"&&p?.ownerUid===online?.user?.uid);
    if(sessao?.sheetId){
      const mesmaFicha=candidatos.find(p=>p.sheetId===sessao.sheetId);
      if(mesmaFicha) return mesmaFicha;
    }
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

  function detalhesDoResultado(resultado){
    const origem=Array.isArray(resultado?.persistentes)?resultado.persistentes:[];
    return origem.slice(0,16).map((efeito,indice)=>({
      id:texto(efeito?.id||`mecanica-${indice+1}`),
      polarity:texto(efeito?.polaridade||"neutro"),
      appliesTo:texto(efeito?.aplicaEm||"usuario"),
      target:texto(efeito?.alvo||efeito?.tipo||"efeito"),
      operation:texto(efeito?.operacao||""),
      value:efeito?.valor??"",
      text:textoMecanica(efeito)
    }));
  }

  function resumoDosDetalhes(detalhes){
    return (detalhes||[]).map(item=>texto(item.text)).filter(Boolean).slice(0,8).join(" • ");
  }

  async function aguardarSalaDaSessao(limiteMs=2600){
    const inicio=Date.now();
    while(Date.now()-inicio<limiteMs){
      const sessao=sessaoAtual();
      const online=window.ShinobiOnline?.snapshot?.();
      if(sessao?.roomId&&online?.sala?.id===sessao.roomId&&online?.user) return {sessao,online};
      await new Promise(resolve=>setTimeout(resolve,90));
    }
    return {sessao:sessaoAtual(),online:window.ShinobiOnline?.snapshot?.()};
  }

  async function publicarEfeitoDoJutsu(jutsu,indice,resultado){
    if(!resultado?.aplicado) return;
    const chavePublicacao=texto(resultado?.itemId||`${jutsu?.catalogoId||indice}:${resultado?.aplicadoEm||Date.now()}`);
    if(publicacoesEmCurso.has(chavePublicacao)) return;
    const {sessao,online}=await aguardarSalaDaSessao();
    if(!sessao?.roomId||!online?.sala||online.sala.id!==sessao.roomId) return;

    const participante=participanteVinculado(sessao,online);
    if(!participante) return;

    const duracao=resultado?.duracao||jutsu?.duracao||resultado?.persistentes?.find(e=>texto(e?.duracao))?.duracao;
    const regra=window.ShinobiOnline.analisarDuracaoRodadas(duracao);
    if(!regra) return;

    const detalhes=detalhesDoResultado(resultado);
    const resumo=resumoDosDetalhes(detalhes);
    publicacoesEmCurso.add(chavePublicacao);
    try{
      if(resultado?.onlineEffectIdAnterior){
        await window.ShinobiOnline.encerrarEfeito(resultado.onlineEffectIdAnterior).catch(()=>{});
      }

      const efeitoOnline=await window.ShinobiOnline.adicionarEfeito({
        participantId:participante.id,
        name:jutsu?.nome||"Jutsu",
        duration:regra.rounds,
        source:`jutsu:${jutsu?.catalogoId||indice}`,
        ownerUid:online.user?.uid,
        summary:resumo,
        details:detalhes,
        localEffectId:resultado?.itemId||"",
        activationKey:resultado?.aplicadoEm||""
      });
      if(!efeitoOnline) return;

      const lista=Array.isArray(estado?.efeitosBatalhaAtivos)?estado.efeitosBatalhaAtivos:[];
      let item=resultado?.itemId?lista.find(ativo=>ativo?.id===resultado.itemId):null;
      if(!item){
        const candidatos=lista.filter(ativo=>normalizar(ativo?.nome)===normalizar(jutsu?.nome));
        item=candidatos.sort((a,b)=>Number(b.aplicadoEm||0)-Number(a.aplicadoEm||0))[0];
      }
      if(item){
        item.onlineEffectId=efeitoOnline.id;
        item.onlineRoomId=online.sala.id;
        item.onlinePublicadoEm=Date.now();
        item.onlineSyncPendente=false;
        item.duracaoOriginal=item.duracaoOriginal||regra.original||item.duracao;
        item.duracaoRodadasTotal=efeitoOnline.totalRounds;
        item.duracaoRodadasRestantes=efeitoOnline.totalRounds;
        item.rodadaAtivacao=efeitoOnline.startRound;
        item.turnoAtivacao=efeitoOnline.startTurnIndex;
        item.expiraNaRodada=efeitoOnline.expiresAtRound;
        item.expiraNoTurno=efeitoOnline.expiresAtTurnIndex;
        item.duracao=`${efeitoOnline.totalRounds} rodadas • restam ${efeitoOnline.totalRounds}`;
        salvarEstadoSemLoop();
        atualizarVisualEfeitos();
      }
      try{if(typeof log==="function") log(`Buff de ${jutsu?.nome||"Jutsu"} sincronizado com a mesa por ${efeitoOnline.totalRounds} rodadas.`);}catch(_erro){}
    }finally{publicacoesEmCurso.delete(chavePublicacao);}
  }

  async function sincronizarEfeitosPendentes(){
    if(sincronizandoPendentes||typeof estado==="undefined") return;
    const {sessao,online}=await aguardarSalaDaSessao(1200);
    if(!sessao?.roomId||!online?.sala||online.sala.id!==sessao.roomId) return;
    const participante=participanteVinculado(sessao,online);
    if(!participante) return;

    const lista=Array.isArray(estado?.efeitosBatalhaAtivos)?estado.efeitosBatalhaAtivos:[];
    const pendentes=lista.filter(item=>{
      const regra=window.ShinobiOnline?.analisarDuracaoRodadas?.(item?.duracaoOriginal||item?.duracao);
      if(!regra) return false;
      return Boolean(item?.onlineSyncPendente||!item?.onlineEffectId||item?.onlineRoomId!==online.sala.id);
    });
    if(!pendentes.length) return;

    sincronizandoPendentes=true;
    try{
      for(const item of pendentes){
        const jutsu={nome:item.nome,catalogoId:item.origemId,duracao:item.duracaoOriginal||item.duracao};
        const resultado={
          aplicado:true,itemId:item.id,duracao:item.duracaoOriginal||item.duracao,
          aplicadoEm:item.aplicadoEm,persistentes:Array.isArray(item.efeitos)?item.efeitos:[]
        };
        try{
          await publicarEfeitoDoJutsu(jutsu,0,resultado);
        }catch(erro){
          item.onlineSyncPendente=true;
          item.onlineErro=Date.now();
          salvarEstadoSemLoop();
          window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:window.ShinobiOnline?.erroAmigavel?.(erro)||String(erro)}}));
        }
      }
    }finally{
      sincronizandoPendentes=false;
    }
  }

  function instalarPublicacaoJutsu(){
    const atual=window.aplicarEfeitosJutsuBatalha;
    if(typeof atual!=="function"||atual.__onlineHook) return;
    const wrapper=async function(jutsu,indice){
      const resultado=await atual.apply(this,arguments);
      try{await publicarEfeitoDoJutsu(jutsu,indice,resultado);}catch(erro){
        const lista=Array.isArray(estado?.efeitosBatalhaAtivos)?estado.efeitosBatalhaAtivos:[];
        const item=resultado?.itemId?lista.find(ativo=>ativo?.id===resultado.itemId):null;
        if(item){item.onlineSyncPendente=true;item.onlineErro=Date.now();salvarEstadoSemLoop();}
        window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:window.ShinobiOnline?.erroAmigavel?.(erro)||String(erro)}}));
      }
      return resultado;
    };
    wrapper.__onlineHook=true;
    wrapper.__original=atual;
    window.aplicarEfeitosJutsuBatalha=wrapper;
  }

  function instalarEncerramentoManual(){
    const atual=window.removerEfeitoJutsuBatalha;
    if(typeof atual!=="function"||atual.__onlineHook) return;
    const wrapper=async function(id){
      const listaAntes=Array.isArray(estado?.efeitosBatalhaAtivos)?estado.efeitosBatalhaAtivos:[];
      const itemAntes=listaAntes.find(item=>item?.id===id);
      const retorno=await atual.apply(this,arguments);
      const listaDepois=Array.isArray(estado?.efeitosBatalhaAtivos)?estado.efeitosBatalhaAtivos:[];
      const foiRemovido=Boolean(itemAntes&&!listaDepois.some(item=>item?.id===id));
      if(foiRemovido&&itemAntes?.onlineEffectId){
        await Promise.resolve(window.ShinobiOnline?.encerrarEfeito?.(itemAntes.onlineEffectId)).catch(()=>{});
      }
      return retorno;
    };
    wrapper.__onlineHook=true;
    wrapper.__original=atual;
    window.removerEfeitoJutsuBatalha=wrapper;
  }

  function instalarLimpezaOnline(){
    const atual=window.limparEfeitosJutsuBatalhaSemConfirmacao;
    if(typeof atual!=="function"||atual.__onlineHook) return;
    const wrapper=function(){
      const ids=(Array.isArray(estado?.efeitosBatalhaAtivos)?estado.efeitosBatalhaAtivos:[])
        .map(item=>item?.onlineEffectId).filter(Boolean);
      const retorno=atual.apply(this,arguments);
      ids.forEach(id=>Promise.resolve(window.ShinobiOnline?.encerrarEfeito?.(id)).catch(()=>{}));
      return retorno;
    };
    wrapper.__onlineHook=true;
    wrapper.__original=atual;
    window.limparEfeitosJutsuBatalhaSemConfirmacao=wrapper;
  }

  async function aplicarRodadaSala(snapshot){
    if(aplicandoRodada) return;
    const sessao=sessaoAtual();
    const room=snapshot?.sala;
    if(!sessao?.roomId||!room||room.id!==sessao.roomId) return;
    if(typeof estado==="undefined") return;
    const lista=Array.isArray(estado.efeitosBatalhaAtivos)?estado.efeitosBatalhaAtivos:[];
    if(!lista.some(item=>item?.onlineEffectId)) return;

    aplicandoRodada=true;
    try{
      const efeitos=room.effects||{};
      let alterou=false;
      const encerrados=[];

      for(let i=lista.length-1;i>=0;i-=1){
        const item=lista[i];
        if(!item?.onlineEffectId) continue;
        const remoto=efeitos[item.onlineEffectId];
        if(!remoto){
          /* Um efeito encerrado pode ser removido pelo mestre. Após uma pequena
             margem para propagação, o bônus local também é retirado. */
          const publicadoEm=Number(item.onlinePublicadoEm||0);
          if(publicadoEm&&Date.now()-publicadoEm>4500){
            encerrados.push(item.nome||"Efeito");
            lista.splice(i,1);
            alterou=true;
          }
          continue;
        }
        const restante=rodadasRestantes(remoto,room.combat);
        if(remoto.status==="expired"||remoto.status==="ended"||restante<=0){
          encerrados.push(item.nome||"Efeito");
          lista.splice(i,1);
          alterou=true;
          continue;
        }
        const novoTexto=`${Number(remoto.totalRounds||restante)} rodadas • restam ${restante}`;
        if(item.duracao!==novoTexto||item.duracaoRodadasRestantes!==restante){
          item.duracao=novoTexto;
          item.duracaoRodadasRestantes=restante;
          alterou=true;
        }
      }

      if(alterou){
        estado.efeitosBatalhaAtivos=lista;
        salvarEstadoSemLoop();
        atualizarVisualEfeitos();
        encerrados.forEach(nome=>{try{if(typeof log==="function") log(`O efeito ${nome} terminou automaticamente pela contagem da mesa.`);}catch(_erro){}});
      }
    }finally{aplicandoRodada=false;}
  }

  async function observarTransicaoDeTurno(snapshot){
    const sessao=sessaoAtual();
    const room=snapshot?.sala;
    if(!sessao?.roomId||!room||room.id!==sessao.roomId||sessao.role!=="player") return;

    const combat=room.combat||{};
    const ordem=Array.isArray(combat.order)?combat.order:Object.values(combat.order||{});
    const indice=Math.max(0,Number(combat.turnIndex||0));
    const participanteAtual=ordem[indice]||"";
    const chaveAtual=combat.started
      ?`${Math.max(1,Number(combat.round||1))}:${indice}:${participanteAtual}`
      :"";

    const turnoAnterior=ultimoTurnoObservado;
    const participanteAnterior=ultimoParticipanteObservado;
    ultimoTurnoObservado=chaveAtual;
    ultimoParticipanteObservado=participanteAtual;

    if(!turnoAnterior||turnoAnterior===chaveAtual) return;

    const sync=window.ShinobiOnline?.statusSincronizacaoAtual?.();
    const haPendente=turnoLocalPendente()||(sync?.syncStatus===0&&sync?.pendingMode==="turno");
    if(haPendente){
      /* Qualquer alteração feita durante o turno é consolidada quando a
         iniciativa avança. Se era o turno deste jogador, também marcamos o
         turno como pronto; caso contrário, apenas atualizamos ficha e sala. */
      try{
        await window.ShinobiOnline.finalizarMeuTurno({
          permitirForaDoTurno:true,
          marcarPronto:participanteAnterior===sessao.participantId,
          turnKey:turnoAnterior
        });
        limparTurnoLocalPendente();
        window.dispatchEvent(new CustomEvent("shinobi:turno-auto-sincronizado",{
          detail:{turnKey:turnoAnterior}
        }));
      }catch(erro){
        window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{
          detail:{mensagem:window.ShinobiOnline?.erroAmigavel?.(erro)||String(erro)}
        }));
      }
    }
  }

  function instalarEventosOnline(){
    if(!window.ShinobiOnline||window.__shinobiOnlineHooksEventos) return;
    window.__shinobiOnlineHooksEventos=true;
    window.ShinobiOnline.on("sala",evento=>{
      aplicarRodadaSala(evento.detail);
      observarTransicaoDeTurno(evento.detail).catch(()=>{});
      setTimeout(()=>sincronizarEfeitosPendentes().catch(()=>{}),120);
    });
    window.ShinobiOnline.on("turno-finalizado",()=>limparTurnoLocalPendente());
    window.ShinobiOnline.on("turno-sincronizado",()=>limparTurnoLocalPendente());
    window.ShinobiOnline.on("ficha-restaurada",()=>setTimeout(()=>location.reload(),250));
    window.ShinobiOnline.on("ficha-atualizada-nuvem",evento=>{
      if(evento?.detail?.active) setTimeout(()=>location.reload(),250);
    });
  }

  function iniciar(){
    instalarAutoSync();
    instalarBackupManual();
    instalarPublicacaoJutsu();
    instalarEncerramentoManual();
    instalarLimpezaOnline();
    instalarEventosOnline();
    setTimeout(()=>{
      instalarAutoSync();
      instalarBackupManual();
      instalarPublicacaoJutsu();
      instalarEncerramentoManual();
      instalarLimpezaOnline();
      sincronizarEfeitosPendentes().catch(()=>{});
    },700);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",iniciar,{once:true});
  else iniciar();
  window.addEventListener("pageshow",()=>{
    setTimeout(()=>{
      iniciar();
      window.ShinobiOnline?.reconciliarSincronizacaoConta?.({
        motivo:"pageshow",
        somenteReceber:syncPorTurnoAtiva()
      }).catch(()=>{});
    },120);
  });
})();
