/* Ficha Ninja RPG — integração do app local com o motor online. */
(function(){
  "use strict";

  let timerResumo=null;
  let aplicandoRodada=false;
  const publicacoesEmCurso=new Set();

  function sessaoAtual(){
    try{return JSON.parse(localStorage.getItem("shinobi_online_session_v1")||"null");}catch(_erro){return null;}
  }

  function fichaAtualNome(){
    try{return localStorage.getItem("ficha_ninja_ativa_v1")||"Principal";}catch(_erro){return "Principal";}
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
    try{salvarManual=wrapper;}catch(_erro){window.salvarManual=wrapper;}
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
        localEffectId:resultado?.itemId||""
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

  function instalarEventosOnline(){
    if(!window.ShinobiOnline||window.__shinobiOnlineHooksEventos) return;
    window.__shinobiOnlineHooksEventos=true;
    window.ShinobiOnline.on("sala",evento=>aplicarRodadaSala(evento.detail));
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
    },700);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",iniciar,{once:true});
  else iniciar();
  window.addEventListener("pageshow",()=>setTimeout(iniciar,120));
})();
