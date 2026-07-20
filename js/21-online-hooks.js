/* Ficha Ninja RPG — integração do app local com o motor online. */
(function(){
  "use strict";

  let timerResumo=null;
  let aplicandoRodada=false;

  function sessaoAtual(){
    try{return JSON.parse(localStorage.getItem("shinobi_online_session_v1")||"null");}catch(_erro){return null;}
  }

  function fichaAtualNome(){
    try{return localStorage.getItem("ficha_ninja_ativa_v1")||"Principal";}catch(_erro){return "Principal";}
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

  async function publicarEfeitoDoJutsu(jutsu,indice,resultado){
    const sessao=sessaoAtual();
    const online=window.ShinobiOnline?.snapshot?.();
    if(!sessao?.roomId||!online?.sala||online.sala.id!==sessao.roomId) return;
    if(sessao.role!=="player"&&online.sala.masterUid!==online.user?.uid) return;
    const regra=window.ShinobiOnline.analisarDuracaoRodadas(jutsu?.duracao);
    if(!regra||!resultado?.aplicado) return;

    const participantId=sessao.role==="player"?sessao.participantId:null;
    if(!participantId) return;

    const efeitoOnline=await window.ShinobiOnline.adicionarEfeito({
      participantId,
      name:jutsu?.nome||"Jutsu",
      duration:regra.rounds,
      source:`jutsu:${jutsu?.catalogoId||indice}`,
      ownerUid:online.user?.uid
    });
    if(!efeitoOnline) return;

    const lista=Array.isArray(estado?.efeitosBatalhaAtivos)?estado.efeitosBatalhaAtivos:[];
    const candidatos=lista.filter(item=>String(item?.nome||"").trim().toLowerCase()===String(jutsu?.nome||"").trim().toLowerCase());
    const item=candidatos.sort((a,b)=>Number(b.aplicadoEm||0)-Number(a.aplicadoEm||0))[0];
    if(item){
      item.onlineEffectId=efeitoOnline.id;
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
  }

  function instalarPublicacaoJutsu(){
    const atual=window.aplicarEfeitosJutsuBatalha;
    if(typeof atual!=="function"||atual.__onlineHook) return;
    const wrapper=async function(jutsu,indice){
      const resultado=await atual.apply(this,arguments);
      try{await publicarEfeitoDoJutsu(jutsu,indice,resultado);}catch(erro){
        window.dispatchEvent(new CustomEvent("shinobi:online:erro-sync",{detail:{mensagem:window.ShinobiOnline?.erroAmigavel?.(erro)||String(erro)}}));
      }
      return resultado;
    };
    wrapper.__onlineHook=true;
    wrapper.__original=atual;
    window.aplicarEfeitosJutsuBatalha=wrapper;
  }

  async function aplicarRodadaSala(snapshot){
    if(aplicandoRodada) return;
    const sessao=sessaoAtual();
    const room=snapshot?.sala;
    if(!sessao?.roomId||!room||room.id!==sessao.roomId||sessao.role!=="player") return;
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
        if(!remoto) continue;
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
        encerrados.forEach(nome=>{try{log(`O efeito ${nome} terminou no ponto correto da iniciativa.`);}catch(_erro){}});
      }
    }finally{aplicandoRodada=false;}
  }

  function instalarEventosOnline(){
    if(!window.ShinobiOnline||window.__shinobiOnlineHooksEventos) return;
    window.__shinobiOnlineHooksEventos=true;
    window.ShinobiOnline.on("sala",evento=>aplicarRodadaSala(evento.detail));
    window.ShinobiOnline.on("ficha-restaurada",()=>setTimeout(()=>location.reload(),250));
  }

  function iniciar(){
    instalarAutoSync();
    instalarBackupManual();
    instalarPublicacaoJutsu();
    instalarEventosOnline();
    setTimeout(()=>{
      instalarAutoSync();
      instalarBackupManual();
      instalarPublicacaoJutsu();
    },700);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",iniciar,{once:true});
  else iniciar();
  window.addEventListener("pageshow",()=>setTimeout(iniciar,120));
})();
