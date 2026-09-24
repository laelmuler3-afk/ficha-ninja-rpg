/* Ficha Ninja RPG — integração do app local com o motor online. */
(function(){
  "use strict";

  let timerResumo=null;
  let timerBackupDiario=null;
  let intervaloBackupDiario=null;
  const timersBackupEstrutural=new Map();
  const ATRASO_BACKUP_ESTRUTURAL_MS=4000;
  const CAMPOS_BACKUP_ESTRUTURAL=new Set([
    "nome","cla","idade","rank","nivel","xp","proficiencia",
    "pvMax","chakraMax","forca","destreza","constituicao","inteligencia","sabedoria","carisma",
    "ca","cd","bonusCA","iniciativa","velocidade",
    "jutsus","armados","inventarioItens","notasTopicos","carteira","carteiraHistorico","kekkeiGenkai",
    "resistenciasEscolhidas","progressaoFixa","atributoConjuracaoNatureza"
  ]);
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

  function campoExigeBackupEstrutural(campo){
    const nome=texto(campo);
    return Boolean(nome&&(CAMPOS_BACKUP_ESTRUTURAL.has(nome)||nome.startsWith("p_")));
  }

  function executarBackupEstrutural(nome){
    if(!contaGoogleAtiva()||typeof window.ShinobiOnline?.atualizarBackupEstrutural!=="function") return;
    window.ShinobiOnline.atualizarBackupEstrutural(nome,{
      motivo:"backup-automatico-estrutural"
    }).catch(()=>{});
  }

  function agendarBackupEstrutural(detalhe={}){
    if(!detalhe.confirmada||!campoExigeBackupEstrutural(detalhe.campo)) return;
    if(!contaGoogleAtiva()||typeof window.ShinobiOnline?.atualizarBackupEstrutural!=="function") return;
    const nome=texto(detalhe.sheetName)||fichaAtualNome();
    const anterior=timersBackupEstrutural.get(nome);
    if(anterior) clearTimeout(anterior);
    const timer=setTimeout(()=>{
      timersBackupEstrutural.delete(nome);
      executarBackupEstrutural(nome);
    },ATRASO_BACKUP_ESTRUTURAL_MS);
    timersBackupEstrutural.set(nome,timer);
  }

  function enviarBackupsEstruturaisPendentes(){
    [...timersBackupEstrutural.entries()].forEach(([nome,timer])=>{
      clearTimeout(timer);
      timersBackupEstrutural.delete(nome);
      executarBackupEstrutural(nome);
    });
  }

  function valorAtualDoCampo(nomeFicha,campo,detalhe={}){
    if(Object.prototype.hasOwnProperty.call(detalhe,"depois")) return detalhe.depois;
    try{
      const ficha=(window.ShinobiOnline?.listarFichasLocais?.()||[]).find(f=>f.name===nomeFicha)
        ||window.ShinobiOnline?.fichaAtualLocal?.();
      return ficha?.data?.[campo];
    }catch(_erro){return undefined;}
  }

  async function enviarAlteracaoConfirmada(detalhe={}){
    if(!window.ShinobiOnline) return;
    const campo=texto(detalhe.campo);
    if(!detalhe.confirmada||!campo)return;
    const nome=texto(detalhe.sheetName)||fichaAtualNome();

    /* Coleções item-level continuam emitindo persistência para o backup estrutural,
       mas seus arrays completos não entram mais no realtime de fields. */
    if(campo==="notasTopicos"||campo==="inventarioItens"||campo==="jutsus"||campo==="armados"||campo==="kekkeiGenkai"||campo==="carteira"||campo==="carteiraHistorico"||campo==="efeitosBatalhaAtivos") return;

    if(syncPorTurnoAtiva()) marcarTurnoLocalPendente();

    if(!contaGoogleAtiva()){
      if(!syncPorTurnoAtiva()) await sincronizarResumoParticipante();
      return;
    }

    const valor=valorAtualDoCampo(nome,campo,detalhe);
    try{
      await window.ShinobiOnline.sincronizarCampoConfirmado?.(nome,campo,valor,{
        motivo:texto(detalhe.motivo)||"alteracao-confirmada",
        origem:texto(detalhe.origem)||"campo"
      });
      if(!syncPorTurnoAtiva()) await sincronizarResumoParticipante();
    }catch(erro){
      window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{
        detail:{mensagem:window.ShinobiOnline?.erroAmigavel?.(erro)||"A alteração ficou salva neste aparelho e será reenviada quando a sincronização estiver disponível."}
      }));
    }
  }

  async function enviarItemColecaoConfirmado(detalhe={}){
    if(!window.ShinobiOnline||detalhe.confirmed!==true) return;
    const collection=texto(detalhe.collection),itemId=texto(detalhe.itemId);
    if(!["notas","inventario","jutsus","armados","kekkeiGenkai","carteiraMoedas","carteiraHistorico","efeitosBatalha"].includes(collection)||!itemId) return;
    if(!contaGoogleAtiva()) return;
    const nome=texto(detalhe.sheetName)||fichaAtualNome();
    try{
      await window.ShinobiOnline.sincronizarItemColecaoConfirmado?.(
        nome,collection,itemId,detalhe.deleted===true?undefined:detalhe.value,{
          deleted:detalhe.deleted===true,
          motivo:texto(detalhe.reason)||"alteracao-confirmada",
          origem:texto(detalhe.source)||"colecao"
        }
      );
    }catch(erro){
      window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{
        detail:{mensagem:window.ShinobiOnline?.erroAmigavel?.(erro)||"A alteração ficou salva neste aparelho e será reenviada quando a sincronização estiver disponível."}
      }));
    }
  }

  function instalarAutoSync(){
    if(window.__shinobiOnlinePersistListener) return;
    window.__shinobiOnlinePersistListener=true;

    /* Realtime só recebe commits explícitos de um campo/área. Persistências
       internas, renderização, pagehide e migrações locais não são transmitidas. */
    window.addEventListener("shinobi:ficha-persistida",evento=>{
      const detalhe=evento?.detail||{};
      const campo=texto(detalhe.campo);
      if(!detalhe.confirmada||!campo)return;
      enviarAlteracaoConfirmada(detalhe).catch(()=>{});
      agendarBackupEstrutural(detalhe);
    });

    window.addEventListener("shinobi:colecao-item-confirmado",evento=>{
      enviarItemColecaoConfirmado(evento?.detail||{}).catch(()=>{});
    });

    /* Quando uma coleção remota chega, o estado local já contém o merge item-level.
       Atualizamos o snapshot completo depois do mesmo debounce para que o backup
       também converja sem transformar userSheets em um segundo realtime. */
    window.addEventListener("shinobi:realtime-colecao-aplicada",evento=>{
      const collection=texto(evento?.detail?.collection);
      const campo=collection==="notas"?"notasTopicos":collection==="inventario"?"inventarioItens":collection==="jutsus"?"jutsus":collection==="armados"?"armados":collection==="kekkeiGenkai"?"kekkeiGenkai":collection==="carteiraMoedas"?"carteira":collection==="carteiraHistorico"?"carteiraHistorico":"";
      if(!campo) return;
      agendarBackupEstrutural({confirmada:true,campo,sheetName:fichaAtualNome()});
    });

    document.addEventListener("visibilitychange",()=>{
      if(document.visibilityState==="hidden"){
        clearTimeout(timerResumo);
        enviarBackupsEstruturaisPendentes();
        if(!syncPorTurnoAtiva()) sincronizarResumoParticipante();
      }
    });
    window.addEventListener("pagehide",()=>{
      clearTimeout(timerResumo);
      enviarBackupsEstruturaisPendentes();
      if(!syncPorTurnoAtiva()) sincronizarResumoParticipante();
    });
    window.addEventListener("online",()=>{
      window.EkoRealtimeSync?.reconciliar?.().catch(()=>{});
      window.ShinobiOnline?.processarBackupsEstruturaisPendentes?.({motivo:"backup-automatico-reconexao"}).catch(()=>{});
    });
  }

  function executarBackupDiario(){
    clearTimeout(timerBackupDiario);
    timerBackupDiario=null;
    if(!contaGoogleAtiva()||typeof window.ShinobiOnline?.garantirBackupDiarioFichaAtiva!=="function")return;
    window.ShinobiOnline.garantirBackupDiarioFichaAtiva().catch(()=>{});
  }

  function agendarBackupDiario(atraso=6500){
    clearTimeout(timerBackupDiario);
    timerBackupDiario=setTimeout(executarBackupDiario,Math.max(800,Number(atraso)||6500));
  }

  function instalarBackupDiario(){
    if(window.__shinobiBackupDiarioInstalado)return;
    window.__shinobiBackupDiarioInstalado=true;
    agendarBackupDiario(7000);
    window.addEventListener("shinobi:online:auth",()=>agendarBackupDiario(2200));
    window.addEventListener("online",()=>agendarBackupDiario(1800));
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")agendarBackupDiario(2500);});
    if(!intervaloBackupDiario)intervaloBackupDiario=setInterval(()=>agendarBackupDiario(1200),60*60*1000);
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
        try{
          window.dispatchEvent(new CustomEvent("shinobi:colecao-item-confirmado",{detail:{
            confirmed:true,collection:"efeitosBatalha",itemId:String(item.id||""),value:item,
            deleted:false,source:"efeitos-online",reason:"vinculo-efeito-online"
          }}));
        }catch(_erro){}
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
    instalarBackupDiario();
    instalarPublicacaoJutsu();
    instalarEncerramentoManual();
    instalarLimpezaOnline();
    instalarEventosOnline();
    setTimeout(()=>{
      instalarAutoSync();
      instalarBackupManual();
      instalarBackupDiario();
      instalarPublicacaoJutsu();
      instalarEncerramentoManual();
      instalarLimpezaOnline();
      sincronizarEfeitosPendentes().catch(()=>{});
    },700);
  }

  function executarDepoisDaRenderizacao(fn){
    if(window.ShinobiAppReady?.executar){
      window.ShinobiAppReady.executar(fn);
      return;
    }
    if(document.readyState==="complete")setTimeout(fn,1200);
    else window.addEventListener("load",()=>setTimeout(fn,1200),{once:true});
  }

  executarDepoisDaRenderizacao(iniciar);
  window.addEventListener("pageshow",()=>{
    executarDepoisDaRenderizacao(()=>{
      setTimeout(()=>{
        iniciar();
        /* pageshow não reconcilia fichas completas. Apenas tenta reenviar
           operações granulares que já estavam confirmadas e pendentes. */
        window.EkoRealtimeSync?.reconciliar?.().catch(()=>{});
      },180);
    });
  });
})();
