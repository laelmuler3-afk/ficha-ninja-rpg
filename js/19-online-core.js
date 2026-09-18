/* Ficha Ninja RPG — motor Firebase, salas, fichas, turnos e XP. */
(function(){
  "use strict";

  const CHAVE_SESSAO = "shinobi_online_session_v1";
  const CHAVE_DEVICE = "shinobi_device_id_v1";
  const CHAVE_SYNC_LEGADA = "shinobi_sheet_sync_v1";
  const CHAVE_SYNC_BASE = "shinobi_sheet_sync_v2";
  const CHAVE_OUTBOX_BASE = "shinobi_sheet_outbox_v1";
  const CHAVE_BACKUP_OUTBOX_BASE = "shinobi_backup_outbox_v1";
  const CHAVE_XP_PROCESSADO = "shinobi_xp_events_v1";
  const EVENTO = new EventTarget();
  const CARACTERES_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const estadoOnline = {
    iniciado:false,
    configurado:false,
    carregando:false,
    conectado:false,
    user:null,
    auth:null,
    db:null,
    api:null,
    salaId:null,
    sala:null,
    presencas:{},
    campanhas:[],
    fichasNuvem:[],
    unsubscribeSala:null,
    unsubscribePresenca:null,
    unsubscribeCampanhas:null,
    unsubscribeFichas:null,
    unsubscribeEventos:null,
    unsubscribeConnected:null,
    syncTimers:new Map(),
    syncQueues:new Map(),
    dirtySheets:new Set(),
    cloudQueue:Promise.resolve(),
    reconciliandoSync:false,
    processandoXp:false,
    deduplicandoEfeitos:false,
    lastDedupAt:0,
    ultimoErro:null
  };

  function emitir(tipo, detalhe={}){
    EVENTO.dispatchEvent(new CustomEvent(tipo,{detail:detalhe}));
    window.dispatchEvent(new CustomEvent(`shinobi:online:${tipo}`,{detail:detalhe}));
  }

  function clonar(valor){
    if(valor == null) return valor;
    try{return structuredClone(valor);}catch(_erro){return JSON.parse(JSON.stringify(valor));}
  }

  function agora(){return Date.now();}
  function texto(valor){return String(valor == null ? "" : valor).trim();}
  function slug(valor){
    return texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
      .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,48)||"ficha";
  }
  function idAleatorio(prefixo="id"){
    if(window.crypto?.randomUUID) return `${prefixo}_${crypto.randomUUID().replace(/-/g,"")}`;
    return `${prefixo}_${agora().toString(36)}_${Math.random().toString(36).slice(2,12)}`;
  }
  function obterDeviceId(){
    let id=localStorage.getItem(CHAVE_DEVICE);
    if(!id){id=idAleatorio("device");localStorage.setItem(CHAVE_DEVICE,id);}
    return id;
  }
  function hashLeve(valor){
    const str=typeof valor==="string"?valor:JSON.stringify(valor);
    let hash=2166136261;
    for(let i=0;i<str.length;i+=1){hash^=str.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return (hash>>>0).toString(16).padStart(8,"0");
  }
  function hashFicha(valor){
    const copia=clonar(valor||{});
    /* Metadados de transporte nunca fazem parte do conteúdo da personagem.
       Isso evita conflitos falsos quando sheetId, ownerUid ou versão de
       identidade mudam durante uma migração entre aparelhos. */
    if(copia&&typeof copia==="object") delete copia.__online;
    return hashLeve(copia);
  }

  function hashFichaSemVinculo(valor){
    const copia=clonar(valor||{});
    /* Usado somente para reconhecer, sem risco, uma cópia idêntica criada em
       outro aparelho antes de receber o mesmo sheetId da nuvem. */
    if(copia&&typeof copia==="object") delete copia.__online;
    return hashLeve(copia);
  }

  function nomeSemSufixoNuvem(valor){
    return texto(valor).replace(/(?:\s+nuvem(?:\s+\d+)?)+$/i,"").trim();
  }

  function chaveLogicaFicha(ficha){
    const dados=ficha?.data&&typeof ficha.data==="object"?ficha.data:{};
    /* O nome da ficha é o identificador lógico mais estável entre aparelhos.
       O nome do personagem pode estar vazio numa cópia zerada ou mudar durante
       a campanha. Sufixos "Nuvem 2/3/4" eram gerados pelo bug antigo. */
    const base=texto(ficha?.name)||texto(dados.nome)||texto(ficha?.characterName)||"Ficha";
    return nomeSemSufixoNuvem(base).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();
  }

  function ehNomeCopiaAutomatica(valor){
    return /(?:\s+nuvem(?:\s+\d+)?)+$/i.test(texto(valor));
  }

  function pontuacaoConteudoFicha(dados){
    const raiz=dados&&typeof dados==="object"?dados:{};
    let pontos=0,nos=0;
    const visitar=(valor,chave="",profundidade=0)=>{
      if(nos++>3500||profundidade>7||chave==="__online") return;
      if(valor==null) return;
      if(typeof valor==="string"){
        const t=valor.trim();
        if(!t||/^data:image\//i.test(t)) return;
        pontos+=1;
        if(t.length>24) pontos+=1;
        return;
      }
      if(typeof valor==="number"){if(Number.isFinite(valor)&&Math.abs(valor)>0) pontos+=1;return;}
      if(typeof valor==="boolean"){if(valor) pontos+=1;return;}
      if(Array.isArray(valor)){
        if(valor.length) pontos+=Math.min(4,valor.length);
        valor.slice(0,60).forEach(item=>visitar(item,"",profundidade+1));
        return;
      }
      if(typeof valor==="object"){
        Object.entries(valor).slice(0,220).forEach(([k,v])=>visitar(v,k,profundidade+1));
      }
    };
    visitar(raiz);
    if(texto(raiz.nome)) pontos+=8;
    if(Number(raiz.nivel||0)>1) pontos+=3;
    ["pvMax","chakraMax","forca","destreza","constituicao","inteligencia","sabedoria","carisma"].forEach(k=>{
      const v=Number(raiz[k]);if(Number.isFinite(v)&&v>0) pontos+=2;
    });
    return pontos;
  }

  function alteracaoPareceEsvaziamento(antes,depois){
    const origem=pontuacaoConteudoFicha(antes);
    const destino=pontuacaoConteudoFicha(depois);
    if(origem<12) return false;
    return destino<=Math.max(4,Math.floor(origem*0.35)) && destino<=origem-10;
  }

  function selecionarRegistroCanonico(itens){
    const ordenados=[...(itens||[])].sort((a,b)=>{
      const dataDiff=Number(b.cloud?.updatedAt||0)-Number(a.cloud?.updatedAt||0);
      if(dataDiff) return dataDiff;
      return Number(b.cloud?.revision||0)-Number(a.cloud?.revision||0);
    });
    const maisRecente=ordenados[0];
    if(!maisRecente) return null;
    const maisRico=[...ordenados].sort((a,b)=>pontuacaoConteudoFicha(b.cloud?.data)-pontuacaoConteudoFicha(a.cloud?.data))[0];
    if(maisRico&&maisRico.sheetId!==maisRecente.sheetId&&alteracaoPareceEsvaziamento(maisRico.cloud?.data,maisRecente.cloud?.data)){
      return maisRico;
    }
    return maisRecente;
  }

  function agruparRegistrosNuvem(valor){
    const grupos=new Map();
    Object.entries(valor||{}).forEach(([sheetId,cloud])=>{
      if(!cloud||typeof cloud!=="object"||cloud.deleted===true) return;
      const chave=chaveLogicaFicha({name:cloud.name,characterName:cloud.characterName,data:cloud.data})||sheetId;
      if(!grupos.has(chave)) grupos.set(chave,[]);
      grupos.get(chave).push({sheetId,cloud});
    });
    return [...grupos.entries()].map(([chave,itens])=>{
      const canonico=selecionarRegistroCanonico(itens);
      return {chave,itens,canonico,duplicatas:itens.filter(item=>item.sheetId!==canonico?.sheetId)};
    });
  }
  function lerJson(chave,padrao){
    try{const v=JSON.parse(localStorage.getItem(chave)||"");return v??padrao;}catch(_erro){return padrao;}
  }
  function salvarJson(chave,valor){localStorage.setItem(chave,JSON.stringify(valor));}

  function uidContaAtiva(){
    return texto(estadoOnline.user&&!estadoOnline.user.anonymous?estadoOnline.user.uid:"");
  }

  function chaveConta(base,uid=uidContaAtiva()){
    const id=texto(uid);
    return id?`${base}__${id}`:"";
  }

  function chaveIdentidadeFicha(nome){
    return nomeSemSufixoNuvem(texto(nome)||"Principal")
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
      .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"principal";
  }

  function sheetIdDeterministico(uid,nome){
    const conta=texto(uid),chave=chaveIdentidadeFicha(nome);
    const a=hashLeve(`eko:v2:${conta}:${chave}`);
    const b=hashLeve(`${chave}:${conta}:personagem`);
    return `sheet_${a}${b}`;
  }

  function descricaoDispositivo(){
    const ua=String(navigator.userAgent||"");
    if(/Android/i.test(ua)) return "Android";
    if(/iPhone|iPad|iPod/i.test(ua)) return "iPhone/iPad";
    if(/Windows/i.test(ua)) return "Windows";
    if(/Macintosh|Mac OS X/i.test(ua)) return "macOS";
    if(/Linux/i.test(ua)) return "Linux";
    return "Dispositivo";
  }

  function configuracaoValida(){
    const config=window.SHINOBI_FIREBASE_CONFIG||{};
    const obrigatorios=["apiKey","authDomain","databaseURL","projectId","appId"];
    return Boolean(window.SHINOBI_FIREBASE_OPTIONS?.enabled!==false && obrigatorios.every(k=>texto(config[k])));
  }

  function erroAmigavel(erro){
    const codigo=texto(erro?.code);
    const mapa={
      "auth/popup-closed-by-user":"A entrada com Google foi cancelada.",
      "auth/popup-blocked":"O navegador bloqueou a janela de login. Tente novamente.",
      "auth/unauthorized-domain":"Este domínio ainda não foi autorizado no Firebase Authentication.",
      "auth/network-request-failed":"Não foi possível conectar ao Firebase. Verifique a internet.",
      "auth/internal-error":"O Firebase Authentication não conseguiu concluir o login neste navegador. O aplicativo tentou recuperar a sessão; se o erro persistir, desative bloqueadores de conteúdo para este site e tente novamente no navegador normal.",
      "auth/web-storage-unsupported":"O navegador bloqueou o armazenamento necessário para manter o login. Permita cookies/dados do site ou use o navegador normal.",
      "auth/user-disabled":"Esta Conta Google está desativada no Firebase Authentication.",
      "auth/operation-not-allowed":"O login com Google não está habilitado no Firebase Authentication.",
      "auth/cancelled-popup-request":"Uma tentativa de login anterior ainda estava aberta. Tente novamente.",
      "auth/credential-already-in-use":"Esta Conta Google já possui fichas na nuvem. Entre nela para acessar os dados.",
      "auth/email-already-in-use":"Este e-mail já possui uma conta no aplicativo.",
      "PERMISSION_DENIED":"O Firebase recusou esta operação. Revise as regras do banco.",
      "permission-denied":"O Firebase recusou esta operação. Revise as regras do banco."
    };
    const mensagem=texto(erro?.message);
    if(/failed to fetch dynamically imported module|não foi possível carregar o módulo online|tempo esgotado ao carregar o módulo online/i.test(mensagem)){
      return "O modo online não pôde ser carregado agora. A ficha continua disponível offline. Verifique a internet e tente novamente.";
    }
    return mapa[codigo]||mensagem||"Ocorreu um erro na conexão online.";
  }

  const scriptsFirebaseEmCarga = new Map();
  let retryOnlineInstalado = false;

  function carregarScriptFirebase(url, timeoutMs=18000){
    if(scriptsFirebaseEmCarga.has(url)) return scriptsFirebaseEmCarga.get(url);
    const promessa=new Promise((resolve,reject)=>{
      const existente=[...document.scripts].find(script=>script.src===url);
      if(existente?.dataset?.shinobiLoaded==="true") return resolve(url);
      const script=existente||document.createElement("script");
      const timer=setTimeout(()=>{
        if(!existente) script.remove();
        reject(new Error("Tempo esgotado ao carregar o módulo online."));
      },Math.max(5000,Number(timeoutMs)||18000));
      script.async=true;
      script.src=url;
      script.dataset.shinobiFirebase="true";
      script.onload=()=>{
        clearTimeout(timer);
        script.dataset.shinobiLoaded="true";
        resolve(url);
      };
      script.onerror=()=>{
        clearTimeout(timer);
        if(!existente) script.remove();
        reject(new Error("Não foi possível carregar o módulo online."));
      };
      if(!existente) document.head.appendChild(script);
    }).finally(()=>scriptsFirebaseEmCarga.delete(url));
    scriptsFirebaseEmCarga.set(url,promessa);
    return promessa;
  }

  function firebaseCompatCompleto(){
    return Boolean(window.firebase?.initializeApp&&window.firebase?.auth&&window.firebase?.database);
  }

  async function carregarFirebaseCompat(){
    if(firebaseCompatCompleto()) return window.firebase;
    const opcoes=window.SHINOBI_FIREBASE_OPTIONS||{};
    const versao=opcoes.sdkVersion||"12.16.0";
    const fontes=Array.isArray(opcoes.sdkSources)&&opcoes.sdkSources.length
      ? opcoes.sdkSources
      : [`https://www.gstatic.com/firebasejs/${versao}`,`https://cdn.jsdelivr.net/npm/firebase@${versao}`];
    const timeout=opcoes.sdkTimeoutMs||18000;
    let ultimoErro=null;

    for(const baseBruta of fontes){
      const base=String(baseBruta||"").replace(/\/$/,"");
      try{
        if(!window.firebase?.initializeApp) await carregarScriptFirebase(`${base}/firebase-app-compat.js`,timeout);
        if(!window.firebase?.auth) await carregarScriptFirebase(`${base}/firebase-auth-compat.js`,timeout);
        if(!window.firebase?.database) await carregarScriptFirebase(`${base}/firebase-database-compat.js`,timeout);
        if(firebaseCompatCompleto()) return window.firebase;
      }catch(erro){
        ultimoErro=erro;
        console.warn("Fonte Firebase indisponível:",base,erro?.message||erro);
      }
    }
    throw ultimoErro||new Error("Não foi possível carregar o modo online.");
  }

  function criarAdaptadorCompat(firebase){
    const marcador=(tipo,valor)=>({__shinobiQueryConstraint:true,tipo,valor});
    return {
      initializeApp(config){return firebase.apps?.length?firebase.app():firebase.initializeApp(config);},
      getAuth(app){return app.auth();},
      getDatabase(app){return app.database();},
      browserLocalPersistence:firebase.auth.Auth.Persistence.LOCAL,
      browserSessionPersistence:firebase.auth.Auth.Persistence.SESSION,
      inMemoryPersistence:firebase.auth.Auth.Persistence.NONE,
      setPersistence(auth,persistence){return auth.setPersistence(persistence);},
      onAuthStateChanged(auth,callback){return auth.onAuthStateChanged(callback);},
      GoogleAuthProvider:firebase.auth.GoogleAuthProvider,
      signInAnonymously(auth){return auth.signInAnonymously();},
      signInWithPopup(auth,provider){return auth.signInWithPopup(provider);},
      signInWithRedirect(auth,provider){return auth.signInWithRedirect(provider);},
      signInWithCredential(auth,credential){return auth.signInWithCredential(credential);},
      linkWithPopup(user,provider){return user.linkWithPopup(provider);},
      linkWithRedirect(user,provider){return user.linkWithRedirect(provider);},
      signOut(auth){return auth.signOut();},
      ref(db,path){return db.ref(path);},
      set(referencia,valor){return referencia.set(valor);},
      update(referencia,valor){return referencia.update(valor);},
      remove(referencia){return referencia.remove();},
      get(referencia){return referencia.once("value");},
      onValue(referencia,callback,errorCallback){
        referencia.on("value",callback,errorCallback);
        return ()=>referencia.off("value",callback);
      },
      onDisconnect(referencia){return referencia.onDisconnect();},
      push(referencia,valor){return arguments.length>1?referencia.push(valor):referencia.push();},
      runTransaction(referencia,atualizador){return referencia.transaction(atualizador);},
      serverTimestamp(){return firebase.database.ServerValue.TIMESTAMP;},
      orderByChild(chave){return marcador("orderByChild",chave);},
      equalTo(valor){return marcador("equalTo",valor);},
      limitToLast(valor){return marcador("limitToLast",valor);},
      query(referencia,...restricoes){
        return restricoes.reduce((consulta,item)=>{
          if(!item?.__shinobiQueryConstraint) return consulta;
          if(item.tipo==="orderByChild") return consulta.orderByChild(item.valor);
          if(item.tipo==="equalTo") return consulta.equalTo(item.valor);
          if(item.tipo==="limitToLast") return consulta.limitToLast(item.valor);
          return consulta;
        },referencia);
      }
    };
  }

  async function carregarFirebase(){
    if(estadoOnline.api) return estadoOnline.api;
    const firebase=await carregarFirebaseCompat();
    estadoOnline.api=criarAdaptadorCompat(firebase);
    return estadoOnline.api;
  }

  function instalarRetryOnline(){
    if(retryOnlineInstalado) return;
    retryOnlineInstalado=true;
    window.addEventListener("online",()=>{
      if(!estadoOnline.api&&!estadoOnline.carregando){
        setTimeout(()=>iniciar().catch(()=>{}),700);
      }
    },{passive:true});
  }

  function normalizarUsuarioFirebase(user){
    return user?{
      uid:user.uid,
      anonymous:Boolean(user.isAnonymous),
      displayName:user.displayName||"Jogador",
      email:user.email||"",
      photoURL:user.photoURL||""
    }:null;
  }

  async function iniciar(){
    instalarRetryOnline();
    if(estadoOnline.carregando) return snapshot();
    if(estadoOnline.iniciado&&estadoOnline.api) return snapshot();
    estadoOnline.ultimoErro=null;
    estadoOnline.carregando=true;
    estadoOnline.configurado=configuracaoValida();
    emitir("status",snapshot());

    if(!estadoOnline.configurado){
      estadoOnline.carregando=false;
      estadoOnline.iniciado=true;
      emitir("configuracao-pendente",snapshot());
      return snapshot();
    }

    try{
      const api=await carregarFirebase();
      const app=api.initializeApp(window.SHINOBI_FIREBASE_CONFIG);
      estadoOnline.auth=api.getAuth(app);
      estadoOnline.db=api.getDatabase(app);
      if(api.setPersistence&&api.browserLocalPersistence){
        try{
          await api.setPersistence(estadoOnline.auth,api.browserLocalPersistence);
        }catch(erroLocal){
          /* Safari/iOS, modo privado e alguns WebViews podem recusar a
             persistência LOCAL. Cair para SESSION/NONE evita transformar
             uma limitação de armazenamento em auth/internal-error. */
          console.warn("Persistência local do Firebase indisponível; tentando alternativa.",erroLocal?.code||erroLocal);
          try{
            await api.setPersistence(estadoOnline.auth,api.browserSessionPersistence);
          }catch(erroSessao){
            await api.setPersistence(estadoOnline.auth,api.inMemoryPersistence).catch(()=>{});
          }
        }
      }

      api.onAuthStateChanged(estadoOnline.auth,async user=>{
        const uidAnterior=texto(estadoOnline.user?.uid);
        const uidNovo=texto(user?.uid);
        if(uidAnterior&&uidNovo&&uidAnterior!==uidNovo) limparObservadoresConta();
        estadoOnline.user=normalizarUsuarioFirebase(user);
        estadoOnline.conectado=Boolean(user);
        if(user&&!user.isAnonymous){
          migrarEstadoSyncLegadoParaConta(user.uid);
          restaurarOutboxConta(user.uid);
        }
        emitir("auth",snapshot());
        if(user){
          /* A ficha local precisa abrir antes de qualquer trabalho de nuvem.
             Login restaura conta/salas, mas NÃO observa, baixa ou envia fichas
             completas. Realtime de ficha é ativado depois do window.load e
             apenas para a ficha ativa pelo motor granular. */
          await registrarPerfilUsuario().catch(()=>{});
          observarCampanhas();
          const sessao=lerJson(CHAVE_SESSAO,null);
          if(sessao?.roomId) observarSala(sessao.roomId,{restaurar:true}).catch(()=>limparSessaoLocal());
        }else{
          limparObservadoresConta();
        }
      });

      estadoOnline.iniciado=true;
      estadoOnline.carregando=false;
      emitir("pronto",snapshot());
    }catch(erro){
      estadoOnline.ultimoErro=erroAmigavel(erro);
      estadoOnline.carregando=false;
      /* Mantém o motor apto a tentar novamente quando a conexão voltar. */
      estadoOnline.iniciado=false;
      emitir("erro",{mensagem:estadoOnline.ultimoErro,erro});
    }
    return snapshot();
  }

  function snapshot(){
    return {
      iniciado:estadoOnline.iniciado,
      configurado:estadoOnline.configurado,
      carregando:estadoOnline.carregando,
      conectado:estadoOnline.conectado,
      user:clonar(estadoOnline.user),
      syncEntreDispositivos:Boolean(estadoOnline.user&&!estadoOnline.user.anonymous),
      salaId:estadoOnline.salaId,
      sala:clonar(estadoOnline.sala),
      presencas:clonar(estadoOnline.presencas),
      campanhas:clonar(estadoOnline.campanhas),
      fichasNuvem:clonar(estadoOnline.fichasNuvem),
      syncAtual:clonar(statusSincronizacaoAtual()),
      ultimoErro:estadoOnline.ultimoErro
    };
  }

  function exigirFirebase(){
    if(!estadoOnline.configurado) throw new Error("Firebase ainda não configurado.");
    if(!estadoOnline.api||!estadoOnline.auth||!estadoOnline.db) throw new Error("Firebase ainda está iniciando.");
  }
  function exigirUsuario(){exigirFirebase();if(!estadoOnline.user) throw new Error("Entre no modo online primeiro.");}
  function exigirContaGoogle(){
    exigirUsuario();
    if(estadoOnline.user.anonymous) throw new Error("Entre com Google para salvar, baixar e sincronizar fichas entre aparelhos.");
  }
  function exigirMestre(sala=estadoOnline.sala){
    exigirUsuario();
    if(!sala||sala.masterUid!==estadoOnline.user.uid) throw new Error("Somente o mestre pode executar esta ação.");
  }

  async function entrarAnonimo(){
    await iniciar();exigirFirebase();
    if(estadoOnline.auth.currentUser) return snapshot();
    await estadoOnline.api.signInAnonymously(estadoOnline.auth);
    return snapshot();
  }

  function criarProviderGoogle(){
    const provider=new estadoOnline.api.GoogleAuthProvider();
    provider.setCustomParameters({prompt:"select_account"});
    return provider;
  }

  function erroInternoAuth(erro){
    return ["auth/internal-error","auth/cancelled-popup-request"].includes(texto(erro?.code));
  }

  async function autenticarGooglePopup({tentativas=2}={}){
    let ultimoErro=null;
    for(let tentativa=1;tentativa<=Math.max(1,tentativas);tentativa+=1){
      try{
        return await estadoOnline.api.signInWithPopup(estadoOnline.auth,criarProviderGoogle());
      }catch(erro){
        ultimoErro=erro;
        if(!erroInternoAuth(erro)||tentativa>=tentativas) throw erro;
        /* auth/internal-error também pode aparecer quando o estado interno do
           iframe/popup ficou preso após suspensão do PWA. Uma nova tentativa
           com provider novo costuma recuperar sem apagar a ficha local. */
        await new Promise(resolve=>setTimeout(resolve,220));
      }
    }
    throw ultimoErro||new Error("Não foi possível entrar com Google.");
  }

  async function restaurarSalaDepoisDoLogin(sessao){
    if(sessao?.role!=="player"||!sessao.code||!sessao.localSheetName) return;
    try{
      await entrarSala({code:sessao.code,localSheetName:sessao.localSheetName});
    }catch(erroSala){
      emitir("erro",{
        mensagem:`Conta conectada, mas não foi possível voltar à sala: ${erroAmigavel(erroSala)}`,
        erro:erroSala
      });
    }
  }

  async function entrarGoogle(){
    await iniciar();exigirFirebase();
    if(navigator.onLine===false){
      const erro=new Error("Sem conexão com a internet para entrar com Google.");
      erro.code="auth/network-request-failed";
      throw erro;
    }

    const api=estadoOnline.api;
    const atual=estadoOnline.auth.currentUser;
    if(atual&&!atual.isAnonymous) return snapshot();
    const sessao=lerJson(CHAVE_SESSAO,null);

    /* Jogadores entram primeiro como anônimos para acessar uma sala sem conta.
       Vincular esse usuário temporário com linkWithPopup adicionava uma segunda
       camada de estado OAuth e era o ponto mais frágil em PWA/mobile. Como as
       fichas são locais e a sala pode ser reentrada, trocamos a identidade de
       forma explícita: sai do usuário temporário, entra no Google e reconecta. */
    if(atual?.isAnonymous){
      if(sessao?.role==="player") await sairDaSala({silencioso:true}).catch(()=>{});
      await api.signOut(estadoOnline.auth).catch(()=>{});
      try{
        const resultado=await autenticarGooglePopup({tentativas:2});
        estadoOnline.user=normalizarUsuarioFirebase(resultado.user);
        estadoOnline.conectado=true;
        emitir("auth",snapshot());
        await restaurarSalaDepoisDoLogin(sessao);
        return snapshot();
      }catch(erro){
        /* Se o popup falhar, recupera a sessão anônima para o jogador não ser
           expulso da mesa por causa de um erro de autenticação. */
        try{
          const anon=await api.signInAnonymously(estadoOnline.auth);
          estadoOnline.user=normalizarUsuarioFirebase(anon.user);
          estadoOnline.conectado=true;
          emitir("auth",snapshot());
          await restaurarSalaDepoisDoLogin(sessao);
        }catch(_erroRecuperacao){}
        throw erro;
      }
    }

    try{
      const resultado=await autenticarGooglePopup({tentativas:2});
      estadoOnline.user=normalizarUsuarioFirebase(resultado.user);
      estadoOnline.conectado=true;
      emitir("auth",snapshot());
      return snapshot();
    }catch(erro){
      /* Em GitHub Pages o redirect do Firebase usa um authDomain de outra
         origem e é afetado pelo bloqueio moderno de armazenamento de terceiros.
         Não fazemos fallback automático para redirect, pois ele pode voltar sem
         credencial no Safari/Chrome atuais. Mantemos a ficha offline intacta e
         devolvemos um erro útil ao usuário. */
      throw erro;
    }
  }

  async function trocarContaGoogle(){
    await iniciar();exigirFirebase();
    if(navigator.onLine===false){
      const erro=new Error("Sem conexão com a internet para trocar a Conta Google.");
      erro.code="auth/network-request-failed";
      throw erro;
    }
    /* signInWithPopup pode substituir o usuário atual diretamente. Não fazemos
       signOut antes do seletor: se a pessoa cancelar a escolha, a conta que já
       estava conectada continua ativa. A saída da sala, quando necessária, é
       tratada pela interface antes desta função. */
    const uidAnterior=texto(estadoOnline.user?.uid);
    const resultado=await autenticarGooglePopup({tentativas:2});
    if(uidAnterior&&uidAnterior!==texto(resultado.user?.uid)) limparObservadoresConta();
    estadoOnline.user=normalizarUsuarioFirebase(resultado.user);
    estadoOnline.conectado=true;
    emitir("auth",snapshot());
    return snapshot();
  }

  async function sair(){
    if(estadoOnline.salaId) await sairDaSala({silencioso:true}).catch(()=>{});
    if(estadoOnline.auth) await estadoOnline.api.signOut(estadoOnline.auth);
    limparSessaoLocal();
    return snapshot();
  }

  async function registrarPerfilUsuario(){
    exigirUsuario();
    const api=estadoOnline.api,uid=estadoOnline.user.uid,deviceId=obterDeviceId();
    await api.update(api.ref(estadoOnline.db,`users/${uid}`),{
      displayName:estadoOnline.user.displayName,
      email:estadoOnline.user.email,
      photoURL:estadoOnline.user.photoURL,
      anonymous:estadoOnline.user.anonymous,
      lastSeen:api.serverTimestamp()
    });
    await api.update(api.ref(estadoOnline.db,`userDevices/${uid}/${deviceId}`),{
      deviceId,
      label:descricaoDispositivo(),
      appVersion:texto(window.APP_VERSION),
      lastSeen:api.serverTimestamp()
    });
  }

  function observarCampanhas(){
    if(!estadoOnline.user||estadoOnline.user.anonymous) return;
    estadoOnline.unsubscribeCampanhas?.();
    const api=estadoOnline.api;
    const consulta=api.query(api.ref(estadoOnline.db,"campaigns"),api.orderByChild("masterUid"),api.equalTo(estadoOnline.user.uid));
    estadoOnline.unsubscribeCampanhas=api.onValue(consulta,snap=>{
      const valor=snap.val()||{};
      estadoOnline.campanhas=Object.entries(valor).map(([id,c])=>({id,...c})).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
      emitir("campanhas",snapshot());
    },erro=>emitir("erro",{mensagem:erroAmigavel(erro),erro}));
  }

  async function criarCampanha(nome){
    exigirUsuario();
    if(estadoOnline.user.anonymous) throw new Error("Entre com Google para criar campanhas como mestre.");
    const nomeLimpo=texto(nome).slice(0,80);
    if(!nomeLimpo) throw new Error("Informe o nome da campanha.");
    const api=estadoOnline.api;
    const nova=api.push(api.ref(estadoOnline.db,"campaigns"));
    const dados={masterUid:estadoOnline.user.uid,name:nomeLimpo,createdAt:api.serverTimestamp(),updatedAt:api.serverTimestamp(),status:"active"};
    await api.set(nova,dados);
    return nova.key;
  }

  async function editarCampanha(campaignId,nome){
    exigirContaGoogle();
    const id=texto(campaignId);
    const campanha=estadoOnline.campanhas.find(item=>item.id===id);
    if(!campanha||campanha.masterUid!==estadoOnline.user.uid) throw new Error("Campanha não encontrada.");
    const nomeLimpo=texto(nome).slice(0,80);
    if(!nomeLimpo) throw new Error("Informe o novo nome da campanha.");
    if(nomeLimpo===campanha.name) return {ok:true,unchanged:true};
    const api=estadoOnline.api;
    await api.update(api.ref(estadoOnline.db,`campaigns/${id}`),{
      name:nomeLimpo,
      updatedAt:agora()
    });
    return {ok:true,name:nomeLimpo};
  }

  async function excluirCampanha(campaignId){
    exigirContaGoogle();
    const id=texto(campaignId);
    const campanha=estadoOnline.campanhas.find(item=>item.id===id);
    if(!campanha||campanha.masterUid!==estadoOnline.user.uid) throw new Error("Campanha não encontrada.");

    const api=estadoOnline.api;
    const roomIds=Object.keys(campanha.rooms||{});
    const salas=await Promise.all(roomIds.map(async roomId=>{
      const roomSnap=await api.get(api.ref(estadoOnline.db,`rooms/${roomId}`));
      const data=roomSnap.exists()?roomSnap.val():null;
      if(!data||data.masterUid!==estadoOnline.user.uid)return {roomId,data:null,publicExists:false,codeExists:false};
      const code=texto(data.code||campanha.rooms?.[roomId]?.code);
      const [publicSnap,codeSnap]=await Promise.all([
        api.get(api.ref(estadoOnline.db,`roomPublic/${roomId}`)),
        code?api.get(api.ref(estadoOnline.db,`roomCodes/${code}`)):Promise.resolve(null)
      ]);
      return {
        roomId,data,code,
        publicExists:Boolean(publicSnap?.exists()),
        codeExists:Boolean(codeSnap?.exists())
      };
    }));

    const updates={};
    let salasEncerradas=0;
    salas.forEach(({roomId,data,code,publicExists,codeExists})=>{
      if(!data)return;
      updates[`rooms/${roomId}/status`]="closed";
      updates[`rooms/${roomId}/updatedAt`]=agora();
      if(publicExists)updates[`roomPublic/${roomId}/status`]="closed";
      if(code&&codeExists)updates[`roomCodes/${code}/status`]="closed";
      salasEncerradas+=1;
    });
    updates[`campaigns/${id}`]=null;
    await api.update(api.ref(estadoOnline.db),updates);

    /* Se a campanha foi excluída em outro aparelho enquanto esta instalação
       ainda acompanhava uma de suas salas, remove apenas a sessão local. */
    if(estadoOnline.sala?.campaignId===id) limparSessaoLocal();
    return {ok:true,closedRooms:salasEncerradas};
  }

  async function gerarCodigoSala(){
    const api=estadoOnline.api;
    for(let tentativa=0;tentativa<20;tentativa+=1){
      let codigo="";
      const bytes=new Uint8Array(6);
      crypto.getRandomValues(bytes);
      bytes.forEach(v=>codigo+=CARACTERES_CODIGO[v%CARACTERES_CODIGO.length]);
      const snap=await api.get(api.ref(estadoOnline.db,`roomCodes/${codigo}`));
      if(!snap.exists()) return codigo;
    }
    throw new Error("Não foi possível gerar um código de sala. Tente novamente.");
  }

  async function criarSala({campaignId,title}){
    exigirUsuario();
    if(estadoOnline.user.anonymous) throw new Error("Entre com Google para criar uma sala como mestre.");
    const campanha=estadoOnline.campanhas.find(c=>c.id===campaignId);
    if(!campanha) throw new Error("Selecione uma campanha válida.");
    const api=estadoOnline.api;
    const roomRef=api.push(api.ref(estadoOnline.db,"rooms"));
    const roomId=roomRef.key;
    const code=await gerarCodigoSala();
    const titulo=texto(title).slice(0,80)||`Sessão de ${campanha.name}`;
    const base={
      masterUid:estadoOnline.user.uid,
      campaignId,
      code,
      title:titulo,
      status:"open",
      createdAt:agora(),
      updatedAt:agora(),
      combat:{started:false,round:1,turnIndex:0,order:[]},
      participants:{},
      effects:{},
      events:{}
    };
    const updates={};
    updates[`rooms/${roomId}`]=base;
    updates[`roomCodes/${code}`]={roomId,masterUid:estadoOnline.user.uid,status:"open",createdAt:agora()};
    updates[`roomPublic/${roomId}`]={masterUid:estadoOnline.user.uid,title:titulo,campaignName:campanha.name,code,status:"open",createdAt:agora()};
    updates[`campaigns/${campaignId}/rooms/${roomId}`]={title:titulo,code,status:"open",createdAt:agora()};
    updates[`campaigns/${campaignId}/updatedAt`]=agora();
    await api.update(api.ref(estadoOnline.db),updates);
    /* A associação é criada depois que roomPublic já existe, permitindo que
       as regras do banco confirmem com segurança quem é o mestre. */
    await api.set(api.ref(estadoOnline.db,`roomMemberships/${roomId}/${estadoOnline.user.uid}`),{role:"master",joinedAt:agora()});
    salvarJson(CHAVE_SESSAO,{roomId,participantId:"",role:"master",code});
    await observarSala(roomId);
    return {roomId,code};
  }

  async function buscarSalaPorCodigo(codigo){
    exigirUsuario();
    const code=texto(codigo).toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(code.length!==6) throw new Error("O código da sala deve ter seis caracteres.");
    const api=estadoOnline.api;
    const snap=await api.get(api.ref(estadoOnline.db,`roomCodes/${code}`));
    if(!snap.exists()||snap.val()?.status!=="open") throw new Error("Sala não encontrada ou já encerrada.");
    const info=snap.val();
    const publico=await api.get(api.ref(estadoOnline.db,`roomPublic/${info.roomId}`));
    if(!publico.exists()||publico.val()?.status!=="open") throw new Error("Esta sala não está aberta.");
    return {roomId:info.roomId,code,publico:publico.val()};
  }

  function garantirMetadadosFichaLocal(nomeFicha,dados){
    const copia=clonar(dados||{});
    copia.__online=copia.__online&&typeof copia.__online==="object"?copia.__online:{};
    if(!copia.__online.sheetId) copia.__online.sheetId=idAleatorio("sheet");
    copia.__online.name=nomeFicha;
    delete copia.__online.deviceId;
    return copia;
  }


  function fichaAtivaNomeSeguro(){
    try{return texto(window.fichaAtual||localStorage.getItem("ficha_ninja_ativa_v1")||"Principal")||"Principal";}catch(_erro){return "Principal";}
  }

  function capturarEstadoAtualAntesDaSincronizacao(nomeFicha){
    const nome=texto(nomeFicha)||fichaAtivaNomeSeguro();
    if(nome!==fichaAtivaNomeSeguro()) return;
    try{
      /* Desde a 2.5.8.8, campos ainda não confirmados não entram na nuvem.
         Copiamos somente valores já confirmados e persistimos sem disparar
         um segundo ciclo de sincronização. */
      if(typeof window.sincronizarEstadoDosCampos==="function") window.sincronizarEstadoDosCampos();
      if(typeof window.persistirEstadoLocal==="function"){
        window.persistirEstadoLocal({emitir:false,confirmada:true,origem:"pre-sync",motivo:"captura-confirmada"});
      }
    }catch(_erro){}
  }

  function aplicarEstadoGlobalDaFicha(nome,chave,data){
    try{
      localStorage.setItem("ficha_ninja_ativa_v1",nome);
      if(typeof window.fichaAtual!=="undefined") window.fichaAtual=nome;
      if(typeof window.CHAVE!=="undefined") window.CHAVE=chave;
      if(typeof window.estado!=="undefined") window.estado=clonar(data);
      if(typeof window.carregar==="function") window.carregar();
      if(typeof window.atualizarPerfil==="function") window.atualizarPerfil();
      if(typeof window.renderizarTopicosNotas==="function") window.renderizarTopicosNotas();
      return true;
    }catch(_erro){return false;}
  }

  function listarFichasLocais(){
    let nomes=[];
    try{
      if(Array.isArray(window.fichas)) nomes=[...window.fichas];
    }catch(_erro){}
    if(!nomes.length){
      try{nomes=JSON.parse(localStorage.getItem("ficha_ninja_lista_v1")||'["Principal"]');}catch(_erro){nomes=["Principal"];}
    }
    nomes=Array.from(new Set((Array.isArray(nomes)?nomes:["Principal"]).map(nome=>
      typeof window.limparNomeFicha==="function"?window.limparNomeFicha(nome):texto(nome)||"Principal"
    )));
    const ativa=fichaAtivaNomeSeguro();
    const vistos=new Set();
    const fichasValidas=[];
    const nomesValidos=[];

    nomes.forEach(nomeLimpo=>{
      const chave=nomeLimpo==="Principal"?"ficha_ninja_app_v2":`ficha_ninja_app_v2__${nomeLimpo}`;
      const bruto=localStorage.getItem(chave);
      let dados=null;
      let veioDoEstado=false;
      try{
        /* A listagem não deve transformar window.estado em fonte de gravação.
           A versão persistida é a referência segura para sincronização; os
           campos confirmados são gravados nela antes de qualquer envio. */
        if(bruto!=null){
          const lido=JSON.parse(bruto);
          if(lido&&typeof lido==="object"&&!Array.isArray(lido)) dados=lido;
        }
        if(!dados&&nomeLimpo===ativa&&typeof window.estado!=="undefined"&&window.estado&&typeof window.estado==="object"){
          dados=clonar(window.estado);
          veioDoEstado=true;
        }
      }catch(_erro){dados=null;}

      /* Uma entrada antiga na lista sem dados reais não é uma ficha. Antes esta
         situação criava um objeto vazio + novo sheetId e acabava enviando uma
         "ficha fantasma" para o Firebase. */
      if(!dados){
        if(nomeLimpo===ativa){dados={};veioDoEstado=true;}
        else return;
      }

      dados=garantirMetadadosFichaLocal(nomeLimpo,dados);
      if(vistos.has(dados.__online.sheetId)){
        /* Colisão local só pode acontecer com uma duplicação explícita/legada.
           O segundo registro recebe uma identidade própria uma única vez. */
        const anterior=dados.__online.sheetId;
        dados.__online.sheetId=idAleatorio("sheet");
        dados.__online.sourceSheetId=anterior;
        dados.__online.userCopy=true;
      }
      vistos.add(dados.__online.sheetId);
      nomesValidos.push(nomeLimpo);
      try{
        localStorage.setItem(chave,JSON.stringify(dados));
        if(nomeLimpo===ativa&&typeof estado!=="undefined") estado.__online=clonar(dados.__online);
      }catch(_erro){}
      fichasValidas.push({
        name:nomeLimpo,key:chave,sheetId:dados.__online.sheetId,
        level:Number(dados.nivel||1),characterName:texto(dados.nome)||nomeLimpo,
        data:dados,storageExists:bruto!=null||veioDoEstado,
        syncDisabled:Boolean(dados.__online?.syncDisabled)
      });
    });

    /* Remove somente referências fantasmas da lista. Nenhum conteúdo existente
       é apagado aqui. */
    try{
      const listaAtual=lerJson("ficha_ninja_lista_v1",["Principal"]);
      const filtrada=(Array.isArray(listaAtual)?listaAtual:[]).filter(nome=>{
        const limpo=typeof window.limparNomeFicha==="function"?window.limparNomeFicha(nome):texto(nome);
        return nomesValidos.includes(limpo)||limpo===ativa;
      });
      if(!filtrada.includes("Principal")) filtrada.unshift("Principal");
      localStorage.setItem("ficha_ninja_lista_v1",JSON.stringify(Array.from(new Set(filtrada))));
    }catch(_erro){}
    return fichasValidas;
  }

  function prepararCopiasLocaisLegadas(){
    const locais=listarFichasLocais();
    const grupos=new Map();
    locais.forEach(ficha=>{
      const chave=chaveLogicaFicha(ficha)||ficha.sheetId;
      if(!grupos.has(chave)) grupos.set(chave,[]);
      grupos.get(chave).push(ficha);
    });
    const ativa=fichaAtivaNomeSeguro();
    grupos.forEach(itens=>{
      if(itens.length<2) return;
      const suspeitas=itens.filter(item=>ehNomeCopiaAutomatica(item.name));
      if(!suspeitas.length) return;
      const normais=itens.filter(item=>!ehNomeCopiaAutomatica(item.name));
      const candidatas=normais.length?normais:itens;
      const principal=[...candidatas].sort((a,b)=>{
        if(a.name===ativa&&b.name!==ativa) return -1;
        if(b.name===ativa&&a.name!==ativa) return 1;
        return pontuacaoConteudoFicha(b.data)-pontuacaoConteudoFicha(a.data);
      })[0];
      itens.forEach(item=>{
        const deveDesativar=item!==principal&&ehNomeCopiaAutomatica(item.name);
        const atual=Boolean(item.data?.__online?.syncDisabled);
        if(atual===deveDesativar) return;
        const data=clonar(item.data||{});
        data.__online=data.__online&&typeof data.__online==="object"?data.__online:{};
        if(deveDesativar){
          data.__online.syncDisabled=true;
          data.__online.legacyAutoCopy=true;
        }else{
          delete data.__online.syncDisabled;
          delete data.__online.legacyAutoCopy;
        }
        localStorage.setItem(item.key,JSON.stringify(data));
        if(item.name===ativa){try{if(typeof window.estado!=="undefined") window.estado.__online=clonar(data.__online);}catch(_erro){}}
      });
    });
    return listarFichasLocais();
  }

  function listarCopiasLegadasLocaisSeguras(){
    const locais=prepararCopiasLocaisLegadas();
    const grupos=new Map();
    locais.forEach(ficha=>{
      const chave=chaveLogicaFicha(ficha)||ficha.sheetId;
      if(!grupos.has(chave)) grupos.set(chave,[]);
      grupos.get(chave).push(ficha);
    });

    const seguras=[],revisar=[];
    locais.forEach(ficha=>{
      const marcada=window.EkoSheetManager?.ehCopiaLegadaMarcada
        ? window.EkoSheetManager.ehCopiaLegadaMarcada(ficha)
        : Boolean(
            ficha?.name!=="Principal"&&
            ficha?.data?.__online?.legacyAutoCopy===true&&
            ficha?.data?.__online?.syncDisabled===true&&
            ficha?.data?.__online?.userCopy!==true
          );
      if(!marcada) return;

      const chave=chaveLogicaFicha(ficha)||ficha.sheetId;
      const grupo=grupos.get(chave)||[];
      const canonicos=grupo.filter(item=>
        item!==ficha&&
        item.name!==ficha.name&&
        item.data?.__online?.legacyAutoCopy!==true&&
        item.data?.__online?.syncDisabled!==true
      );
      const canonico=[...canonicos].sort((a,b)=>pontuacaoConteudoFicha(b.data)-pontuacaoConteudoFicha(a.data))[0];
      if(!canonico){revisar.push(clonar(ficha));return;}

      /* Limpeza automática só remove duplicata byte-logicamente equivalente
         quando ignoramos __online. Se houver qualquer diferença de conteúdo,
         preservamos para revisão/exclusão individual. */
      const equivalente=hashFichaSemVinculo(ficha.data)===hashFichaSemVinculo(canonico.data);
      if(equivalente) seguras.push(clonar(ficha));
      else revisar.push(clonar(ficha));
    });
    return {seguras,revisar};
  }

  function listarFichasSincronizaveis(){
    const uid=uidContaAtiva();
    return prepararCopiasLocaisLegadas().filter(ficha=>{
      if(ficha.data?.__online?.syncDisabled) return false;
      const ownerUid=texto(ficha.data?.__online?.ownerUid);
      return !uid||!ownerUid||ownerUid===uid;
    });
  }

  function fichaAtualLocal(){
    const atual=(()=>{try{return window.fichaAtual;}catch(_erro){return localStorage.getItem("ficha_ninja_ativa_v1")||"Principal";}})();
    return listarFichasLocais().find(f=>f.name===atual)||listarFichasLocais()[0];
  }

  function prepararIdentidadeFichaParaConta(nomeFicha){
    const uid=uidContaAtiva();
    if(!uid) return listarFichasLocais().find(f=>f.name===nomeFicha)||null;
    const ficha=listarFichasLocais().find(f=>f.name===nomeFicha)||null;
    if(!ficha) return null;
    const ownerUid=texto(ficha.data?.__online?.ownerUid);
    if(ownerUid&&ownerUid!==uid) return null;

    const data=clonar(ficha.data||{});
    data.__online=data.__online&&typeof data.__online==="object"?data.__online:{};
    const idAntigo=texto(data.__online.sheetId)||idAleatorio("sheet");
    const metaAntiga=estadoSync()[idAntigo]||{};
    const jaSincronizada=Boolean(metaAntiga.lastHash||Number(metaAntiga.revision||0)>0);
    const idNovo=!ownerUid&&!jaSincronizada?sheetIdDeterministico(uid,data.__online.name||ficha.name):idAntigo;

    data.__online.sheetId=idNovo;
    data.__online.ownerUid=uid;
    data.__online.identityVersion=2;
    data.__online.originKey=data.__online.originKey||chaveIdentidadeFicha(data.__online.name||ficha.name);
    data.__online.name=ficha.name;
    localStorage.setItem(ficha.key,JSON.stringify(data));
    if(fichaAtivaNomeSeguro()===ficha.name){try{if(typeof window.estado!=="undefined") window.estado.__online=clonar(data.__online);}catch(_erro){}}

    if(idNovo!==idAntigo){
      const sync=estadoSync();
      if(sync[idAntigo]&&!sync[idNovo]) sync[idNovo]=sync[idAntigo];
      delete sync[idAntigo];
      gravarEstadoSync(sync);
      const outbox=estadoOutbox();
      if(outbox[idAntigo]){outbox[idNovo]={...outbox[idAntigo],sheetId:idNovo};delete outbox[idAntigo];gravarOutbox(outbox);}
      if(estadoOnline.dirtySheets.has(idAntigo)){estadoOnline.dirtySheets.delete(idAntigo);estadoOnline.dirtySheets.add(idNovo);}
    }
    return listarFichasLocais().find(f=>f.name===ficha.name)||null;
  }

  function prepararIdentidadesDaConta(){
    if(!uidContaAtiva()) return [];
    const nomes=listarFichasSincronizaveis().map(f=>f.name);
    return nomes.map(nome=>prepararIdentidadeFichaParaConta(nome)).filter(Boolean);
  }

  function limparDadosParaSala(valor,profundidade=0){
    if(valor==null||profundidade>5)return valor;
    if(typeof valor==="string"){
      if(/^data:image\//i.test(valor))return "";
      return valor.length>1800?`${valor.slice(0,1800)}…`:valor;
    }
    if(typeof valor!=="object")return valor;
    if(Array.isArray(valor))return valor.slice(0,120).map(v=>limparDadosParaSala(v,profundidade+1));
    const saida={};
    Object.entries(valor).forEach(([chave,item])=>{
      if(/imagem|image|avatar|background|fundo/i.test(chave))return;
      saida[chave]=limparDadosParaSala(item,profundidade+1);
    });
    return saida;
  }

  function resumoBatalhaDaFicha(ficha){
    const d=ficha?.data||{};
    const numero=(v,p=0)=>Number.isFinite(Number(v))?Number(v):p;
    return {
      sourceType:"sheet",
      sourceSheetId:ficha.sheetId,
      sourceSheetName:ficha.name,
      displayName:texto(d.nome)||ficha.name,
      level:numero(d.nivel,1),
      rank:texto(d.rank),
      pv:numero(d.pv),
      pvMax:numero(d.pvMax),
      chakra:numero(d.chakra),
      chakraMax:numero(d.chakraMax),
      ca:numero(d.ca,10),
      cd:numero(d.cd,10),
      initiativeBonus:numero(d.iniciativa),
      speed:numero(d.velocidade),
      attributes:{
        forca:numero(d.forca),destreza:numero(d.destreza),constituicao:numero(d.constituicao),
        inteligencia:numero(d.inteligencia),sabedoria:numero(d.sabedoria),carisma:numero(d.carisma)
      },
      jutsus:limparDadosParaSala(Array.isArray(d.jutsus)?d.jutsus:[]),
      attacks:limparDadosParaSala(Array.isArray(d.armados)?d.armados:[]),
      resistances:clonar(Array.isArray(d.resistenciasEscolhidas)?d.resistenciasEscolhidas:[]),
      natures:limparDadosParaSala(d.naturezas||{})
    };
  }

  async function entrarSala({code,localSheetName}){
    if(!estadoOnline.user) await entrarAnonimo();
    exigirUsuario();
    const encontrada=await buscarSalaPorCodigo(code);
    const ficha=listarFichasLocais().find(f=>f.name===localSheetName)||fichaAtualLocal();
    if(!ficha) throw new Error("Escolha uma ficha para entrar na sala.");
    const api=estadoOnline.api;
    const participantId=estadoOnline.user.uid;

    await api.set(api.ref(estadoOnline.db,`roomMemberships/${encontrada.roomId}/${estadoOnline.user.uid}`),{
      role:"player",joinedAt:agora(),sheetId:ficha.sheetId
    });

    /* O mesmo e-mail em celular e tablet representa um único participante.
       Antes de atualizar a ficha da sala, preservamos os campos controlados
       pelo mestre (principalmente iniciativa). A versão anterior sobrescrevia
       initiative com null e o Firebase recusava o segundo aparelho. */
    const refParticipante=api.ref(estadoOnline.db,`rooms/${encontrada.roomId}/participants/${participantId}`);
    const snapExistente=await api.get(refParticipante);
    const existente=snapExistente.exists()?snapExistente.val():null;
    const resumo=resumoBatalhaDaFicha(ficha);
    await api.set(refParticipante,{
      id:participantId,
      ownerUid:estadoOnline.user.uid,
      type:"player",
      connected:true,
      sheetId:ficha.sheetId,
      localSheetName:ficha.name,
      displayName:resumo.displayName,
      initiativeBonus:resumo.initiativeBonus,
      initiative:existente?.initiative??null,
      battle:resumo,
      joinedAt:existente?.joinedAt||agora(),
      updatedAt:agora()
    });
    salvarJson(CHAVE_SESSAO,{roomId:encontrada.roomId,participantId,role:"player",sheetId:ficha.sheetId,localSheetName:ficha.name,code:encontrada.code});
    await observarSala(encontrada.roomId);
    return encontrada;
  }

  async function observarSala(roomId,{restaurar=false}={}){
    exigirUsuario();
    const api=estadoOnline.api;
    estadoOnline.unsubscribeSala?.();
    estadoOnline.unsubscribePresenca?.();
    estadoOnline.unsubscribeEventos?.();
    estadoOnline.unsubscribeConnected?.();
    estadoOnline.salaId=roomId;
    estadoOnline.unsubscribeSala=api.onValue(api.ref(estadoOnline.db,`rooms/${roomId}`),snap=>{
      if(!snap.exists()){
        estadoOnline.sala=null;
        emitir("sala-encerrada",snapshot());
        limparSessaoLocal();
        return;
      }
      estadoOnline.sala={id:roomId,...snap.val()};
      emitir("sala",snapshot());
      deduplicarEfeitosDaSala().catch(()=>{});
      processarEventosXp().catch(()=>{});
    },erro=>emitir("erro",{mensagem:erroAmigavel(erro),erro}));
    estadoOnline.unsubscribePresenca=api.onValue(api.ref(estadoOnline.db,`presence/${roomId}`),snap=>{
      estadoOnline.presencas=snap.val()||{};
      emitir("presenca",snapshot());
    });
    configurarPresenca(roomId).catch(()=>{});
    observarEventos(roomId);
    if(!restaurar){
      const sessao=lerJson(CHAVE_SESSAO,{})||{};
      salvarJson(CHAVE_SESSAO,{...sessao,roomId,code:sessao.code||""});
    }
    return roomId;
  }

  async function configurarPresenca(roomId){
    exigirUsuario();
    const api=estadoOnline.api;
    const connectedRef=api.ref(estadoOnline.db,".info/connected");
    const deviceId=obterDeviceId();
    const myUserPresence=api.ref(estadoOnline.db,`presence/${roomId}/${estadoOnline.user.uid}`);
    const myDevicePresence=api.ref(estadoOnline.db,`presence/${roomId}/${estadoOnline.user.uid}/devices/${deviceId}`);
    estadoOnline.unsubscribeConnected=api.onValue(connectedRef,async snap=>{
      if(snap.val()!==true) return;
      try{
        /* Cada aparelho mantém a própria presença. Fechar o celular não deixa
           o personagem offline se o tablet com o mesmo e-mail continuar aberto. */
        await api.update(myUserPresence,{connected:null,lastSeen:null,deviceId:null,participantId:null});
        await api.onDisconnect(myDevicePresence).remove();
        await api.set(myDevicePresence,{
          connected:true,lastSeen:api.serverTimestamp(),deviceId,
          participantId:lerJson(CHAVE_SESSAO,{})?.participantId||""
        });
      }catch(_erro){}
    });
  }

  function limparSessaoLocal(){
    localStorage.removeItem(CHAVE_SESSAO);
    estadoOnline.unsubscribeSala?.();estadoOnline.unsubscribeSala=null;
    estadoOnline.unsubscribePresenca?.();estadoOnline.unsubscribePresenca=null;
    estadoOnline.unsubscribeEventos?.();estadoOnline.unsubscribeEventos=null;
    estadoOnline.unsubscribeConnected?.();estadoOnline.unsubscribeConnected=null;
    estadoOnline.salaId=null;estadoOnline.sala=null;estadoOnline.presencas={};
    emitir("sala",snapshot());
  }

  async function sairDaSala({silencioso=false}={}){
    const sessao=lerJson(CHAVE_SESSAO,null);
    if(!sessao?.roomId||!estadoOnline.user){limparSessaoLocal();return;}
    const api=estadoOnline.api;
    try{
      await api.remove(api.ref(estadoOnline.db,`presence/${sessao.roomId}/${estadoOnline.user.uid}`));
      if(sessao.role==="player"){
        await api.remove(api.ref(estadoOnline.db,`rooms/${sessao.roomId}/participants/${estadoOnline.user.uid}`));
        await api.remove(api.ref(estadoOnline.db,`roomMemberships/${sessao.roomId}/${estadoOnline.user.uid}`));
      }
    }catch(erro){if(!silencioso) throw erro;}
    limparSessaoLocal();
  }

  async function encerrarSala(){
    exigirMestre();
    const api=estadoOnline.api,room=estadoOnline.sala;
    const updates={};
    updates[`rooms/${room.id}/status`]="closed";
    updates[`rooms/${room.id}/updatedAt`]=agora();
    updates[`roomCodes/${room.code}/status`]="closed";
    updates[`roomPublic/${room.id}/status`]="closed";
    updates[`campaigns/${room.campaignId}/rooms/${room.id}/status`]="closed";
    await api.update(api.ref(estadoOnline.db),updates);
  }

  async function importarFichaComoNpc(localSheetName,{displayName}={}){
    exigirMestre();
    const ficha=listarFichasLocais().find(f=>f.name===localSheetName);
    if(!ficha) throw new Error("Ficha local não encontrada.");
    const resumo=resumoBatalhaDaFicha(ficha);
    const id=idAleatorio("npc");
    const nome=texto(displayName)||resumo.displayName;
    const participante={
      id,ownerUid:estadoOnline.user.uid,type:"npc-imported",displayName:nome,
      initiativeBonus:resumo.initiativeBonus,initiative:null,battle:{...resumo,displayName:nome},
      sourceSheetId:ficha.sheetId,sourceSheetName:ficha.name,createdAt:agora(),updatedAt:agora()
    };
    await estadoOnline.api.set(estadoOnline.api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/participants/${id}`),participante);
    return id;
  }

  async function criarNpcRapido(dados){
    exigirMestre();
    const numero=(v,p=0)=>Number.isFinite(Number(v))?Number(v):p;
    const nome=texto(dados?.displayName).slice(0,80);
    if(!nome) throw new Error("Informe o nome do NPC ou inimigo.");
    const id=idAleatorio("npc");
    const battle={
      sourceType:"quick",displayName:nome,level:numero(dados.level,1),rank:texto(dados.rank),
      pv:numero(dados.pv,dados.pvMax||0),pvMax:numero(dados.pvMax),
      chakra:numero(dados.chakra,dados.chakraMax||0),chakraMax:numero(dados.chakraMax),
      ca:numero(dados.ca,10),cd:numero(dados.cd,10),initiativeBonus:numero(dados.initiativeBonus),
      speed:numero(dados.speed),notes:texto(dados.notes).slice(0,600),attributes:{},jutsus:[],attacks:[]
    };
    await estadoOnline.api.set(estadoOnline.api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/participants/${id}`),{
      id,ownerUid:estadoOnline.user.uid,type:"npc-quick",displayName:nome,
      initiativeBonus:battle.initiativeBonus,initiative:null,battle,createdAt:agora(),updatedAt:agora()
    });
    return id;
  }

  async function atualizarMeuParticipante(){
    exigirUsuario();
    const sessao=lerJson(CHAVE_SESSAO,null);
    if(!sessao?.roomId||sessao.role!=="player") return {skipped:true};
    const ficha=listarFichasLocais().find(f=>f.sheetId===sessao.sheetId)||listarFichasLocais().find(f=>f.name===sessao.localSheetName)||fichaAtualLocal();
    if(!ficha) return {skipped:true};
    const resumo=resumoBatalhaDaFicha(ficha);
    await estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db,`rooms/${sessao.roomId}/participants/${estadoOnline.user.uid}`),{
      displayName:resumo.displayName,
      initiativeBonus:resumo.initiativeBonus,
      battle:resumo,
      localSheetName:ficha.name,
      sheetId:ficha.sheetId,
      updatedAt:agora()
    });
    return {ok:true};
  }

  function chaveTurnoAtual(combat=estadoOnline.sala?.combat||{}){
    if(!combat?.started) return "";
    const indice=Math.max(0,Number(combat.turnIndex||0));
    const ordem=normalizarOrdem();
    const participanteId=texto(ordem[indice]);
    return `${Math.max(1,Number(combat.round||1))}:${indice}:${participanteId}`;
  }

  function meuParticipanteNaSala(){
    if(!estadoOnline.user||!estadoOnline.sala) return null;
    const sessao=lerJson(CHAVE_SESSAO,null);
    const id=texto(sessao?.participantId)||estadoOnline.user.uid;
    return estadoOnline.sala?.participants?.[id]||null;
  }

  function ehMeuTurno(){
    const sessao=lerJson(CHAVE_SESSAO,null);
    const combat=estadoOnline.sala?.combat||{};
    if(sessao?.role!=="player"||!combat.started) return false;
    const ordem=normalizarOrdem();
    const atual=ordem[Math.max(0,Number(combat.turnIndex||0))];
    return Boolean(atual&&atual===sessao.participantId);
  }

  function resumoMudancasMeuTurno(){
    const sessao=lerJson(CHAVE_SESSAO,null);
    const participante=meuParticipanteNaSala();
    const ficha=listarFichasLocais().find(f=>f.sheetId===sessao?.sheetId)
      ||listarFichasLocais().find(f=>f.name===sessao?.localSheetName)
      ||fichaAtualLocal();
    if(!ficha) return {turnKey:chaveTurnoAtual(),lines:["Ficha local não encontrada."],changed:false};
    const antes=participante?.battle||{};
    const depois=resumoBatalhaDaFicha(ficha);
    const linhas=[];
    const comparar=(rotulo,chave)=>{
      const a=antes?.[chave],b=depois?.[chave];
      if(String(a??"")!==String(b??"")) linhas.push(`${rotulo}: ${a??"—"} → ${b??"—"}`);
    };
    comparar("PV","pv");
    comparar("Chakra","chakra");
    comparar("CA","ca");
    comparar("CD","cd");
    comparar("Nível","level");
    comparar("Velocidade","speed");

    const nomesAtributos={forca:"FOR",destreza:"DES",constituicao:"CON",inteligencia:"INT",sabedoria:"SAB",carisma:"CAR"};
    Object.entries(nomesAtributos).forEach(([chave,rotulo])=>{
      const a=antes?.attributes?.[chave],b=depois?.attributes?.[chave];
      if(String(a??"")!==String(b??"")) linhas.push(`${rotulo}: ${a??"—"} → ${b??"—"}`);
    });

    const qtdAntesJutsus=Array.isArray(antes?.jutsus)?antes.jutsus.length:0;
    const qtdDepoisJutsus=Array.isArray(depois?.jutsus)?depois.jutsus.length:0;
    if(qtdAntesJutsus!==qtdDepoisJutsus) linhas.push(`Jutsus: ${qtdAntesJutsus} → ${qtdDepoisJutsus}`);
    const qtdAntesAtaques=Array.isArray(antes?.attacks)?antes.attacks.length:0;
    const qtdDepoisAtaques=Array.isArray(depois?.attacks)?depois.attacks.length:0;
    if(qtdAntesAtaques!==qtdDepoisAtaques) linhas.push(`Ataques: ${qtdAntesAtaques} → ${qtdDepoisAtaques}`);
    if(JSON.stringify(antes?.resistances||[])!==JSON.stringify(depois?.resistances||[])) linhas.push("Resistências atualizadas.");
    if(JSON.stringify(antes?.natures||{})!==JSON.stringify(depois?.natures||{})) linhas.push("Naturezas atualizadas.");

    const meta=estadoSync()[ficha.sheetId]||{};
    const hashAtual=hashFicha(ficha.data||{});
    const fichaCompletaAlterada=Boolean(!meta.lastHash||meta.lastHash!==hashAtual);
    if(fichaCompletaAlterada&&linhas.length===0) linhas.push("Outros dados da ficha foram alterados neste turno.");
    if(!linhas.length) linhas.push("Nenhuma alteração pendente neste turno.");

    return {
      turnKey:chaveTurnoAtual(),
      sheetId:ficha.sheetId,
      name:ficha.name,
      lines:linhas.slice(0,14),
      changed:fichaCompletaAlterada||linhas[0]!=="Nenhuma alteração pendente neste turno.",
      before:antes,
      after:depois
    };
  }

  async function finalizarMeuTurno({permitirForaDoTurno=false,marcarPronto=true,turnKey=""}={}){
    exigirUsuario();
    const sessao=lerJson(CHAVE_SESSAO,null);
    if(sessao?.role!=="player") throw new Error("Somente um jogador pode confirmar o próprio turno.");
    const combat=estadoOnline.sala?.combat||{};
    if(!combat.started) throw new Error("O combate ainda não foi iniciado.");
    if(!permitirForaDoTurno&&!ehMeuTurno()) throw new Error("Este não é o seu turno agora.");

    const ficha=listarFichasLocais().find(f=>f.sheetId===sessao.sheetId)
      ||listarFichasLocais().find(f=>f.name===sessao.localSheetName)
      ||fichaAtualLocal();
    if(!ficha) throw new Error("Ficha local não encontrada.");

    const chave=texto(turnKey)||chaveTurnoAtual(combat);
    let resultado={skipped:true,revision:0};
    if(!estadoOnline.user.anonymous){
      /* Alterações da ficha já entram na outbox por campo quando confirmadas.
         Finalizar o turno apenas força o envio dessas operações pendentes;
         nunca envia a ficha inteira para userSheets. */
      try{
        resultado=await window.EkoRealtimeSync?.reconciliar?.()||{skipped:true,revision:0};
      }catch(_erro){
        resultado={queued:true,revision:0};
      }
    }

    await atualizarMeuParticipante();
    const meta=estadoSync()[ficha.sheetId]||{};
    if(marcarPronto){
      await estadoOnline.api.update(
        estadoOnline.api.ref(estadoOnline.db,`rooms/${sessao.roomId}/participants/${sessao.participantId}`),
        {
          turnReadyKey:chave,
          turnReadyAt:agora(),
          turnReadyRevision:Number(meta.revision||resultado?.revision||0)
        }
      );
    }
    emitir(marcarPronto?"turno-finalizado":"turno-sincronizado",{
      turnKey:chave,sheetId:ficha.sheetId,revision:Number(meta.revision||resultado?.revision||0)
    });
    return {
      ok:true,turnKey:chave,revision:Number(meta.revision||resultado?.revision||0),
      anonymous:Boolean(estadoOnline.user.anonymous),ready:Boolean(marcarPronto)
    };
  }

  async function atualizarParticipante(participantId,alteracoes){
    exigirMestre();
    const permitidas={};
    ["displayName","initiative","initiativeBonus"].forEach(k=>{if(alteracoes?.[k]!==undefined) permitidas[k]=alteracoes[k];});
    if(alteracoes?.battle&&typeof alteracoes.battle==="object") permitidas.battle=alteracoes.battle;
    permitidas.updatedAt=agora();
    await estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/participants/${participantId}`),permitidas);
  }

  async function removerParticipante(participantId){
    exigirMestre();
    const api=estadoOnline.api;
    const updates={};
    updates[`rooms/${estadoOnline.salaId}/participants/${participantId}`]=null;
    const efeitos=estadoOnline.sala?.effects||{};
    Object.entries(efeitos).forEach(([id,e])=>{if(e.participantId===participantId) updates[`rooms/${estadoOnline.salaId}/effects/${id}`]=null;});
    const ordem=normalizarOrdem().filter(id=>id!==participantId);
    updates[`rooms/${estadoOnline.salaId}/combat/order`]=ordem;
    await api.update(api.ref(estadoOnline.db),updates);
  }

  function participantes(){return estadoOnline.sala?.participants||{};}
  function normalizarOrdem(){
    const raw=estadoOnline.sala?.combat?.order||[];
    const lista=Array.isArray(raw)?raw:Object.keys(raw).sort((a,b)=>Number(a)-Number(b)).map(k=>raw[k]);
    return lista.filter(id=>participantes()[id]);
  }

  async function definirIniciativa(participantId,valor){
    exigirMestre();
    const numero=Number(valor);
    await estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/participants/${participantId}`),{
      initiative:Number.isFinite(numero)?numero:null,updatedAt:agora()
    });
  }

  async function ordenarIniciativa(){
    exigirMestre();
    const ordem=Object.values(participantes()).sort((a,b)=>{
      const ia=Number.isFinite(Number(a.initiative))?Number(a.initiative):-999;
      const ib=Number.isFinite(Number(b.initiative))?Number(b.initiative):-999;
      if(ib!==ia)return ib-ia;
      return Number(b.initiativeBonus||0)-Number(a.initiativeBonus||0);
    }).map(p=>p.id);
    await estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/combat`),{order:ordem,turnIndex:0,round:1});
    return ordem;
  }

  async function iniciarCombate(){
    exigirMestre();
    let ordem=normalizarOrdem();
    if(!ordem.length) ordem=await ordenarIniciativa();
    if(!ordem.length) throw new Error("Adicione participantes antes de iniciar o combate.");
    await estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/combat`),{
      started:true,round:Math.max(1,Number(estadoOnline.sala?.combat?.round||1)),turnIndex:0,order:ordem,startedAt:agora()
    });
    await registrarEvento("COMBATE_INICIADO",{round:1});
  }

  async function alterarTurno(direcao){
    exigirMestre();
    const api=estadoOnline.api;
    const refCombat=api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/combat`);
    const resultado=await api.runTransaction(refCombat,combat=>{
      if(!combat||!combat.started) return;
      const ordem=Array.isArray(combat.order)?combat.order:Object.values(combat.order||{});
      if(!ordem.length) return;
      let indice=Number(combat.turnIndex||0),round=Math.max(1,Number(combat.round||1));
      if(direcao>0){indice+=1;if(indice>=ordem.length){indice=0;round+=1;}}
      else{indice-=1;if(indice<0){indice=ordem.length-1;round=Math.max(1,round-1);}}
      return {...combat,turnIndex:indice,round,updatedAt:agora()};
    });
    if(!resultado.committed) throw new Error("O combate ainda não foi iniciado.");
    const combat=resultado.snapshot.val();
    await registrarEvento(direcao>0?"TURNO_AVANCADO":"TURNO_RECUADO",{round:combat.round,turnIndex:combat.turnIndex});
    /* A duração é conferida em cada mudança de iniciativa. Dessa forma,
       um efeito de 5 rodadas termina no mesmo ponto da ordem em que começou,
       e não simplesmente no começo da quinta rodada. */
    if(direcao>0) await atualizarEfeitosDaSala(combat.round,combat.turnIndex);
    return combat;
  }
  const avancarTurno=()=>alterarTurno(1);
  const voltarTurno=()=>alterarTurno(-1);

  function analisarDuracaoRodadas(valor){
    const original=texto(valor);
    const normal=original.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    if(!normal||/instant|ate ser encerr|manual|concentr/.test(normal)) return null;

    const dado=normal.match(/(\d+)\s*d\s*(\d+)(?:\s*([+-])\s*(\d+))?/);
    if(dado){
      const qtd=Math.max(1,Number(dado[1])),faces=Math.max(1,Number(dado[2]));let total=0;
      for(let i=0;i<qtd;i+=1) total+=1+Math.floor(Math.random()*faces);
      const ajuste=Number(dado[4]||0)*(dado[3]==="-"?-1:1);
      total=Math.max(1,total+ajuste);
      if(/minut/.test(normal)) total=Math.ceil(total*10);
      else if(/segund/.test(normal)&&!/turn|rodad/.test(normal)) total=Math.ceil(total/6);
      return {rounds:Math.max(1,total),rolled:true,original};
    }

    const obterNumero=regex=>{
      const achado=normal.match(regex);
      if(!achado)return NaN;
      return Number(String(achado[1]).replace(",","."));
    };
    /* Quando a descrição traz as duas formas — por exemplo
       "5 turnos (30 segundos)" — a quantidade de turnos/rodadas prevalece. */
    let numero=obterNumero(/(\d+(?:[.,]\d+)?)\s*(?:turnos?|rodadas?)/);
    if(Number.isFinite(numero)&&numero>0)return {rounds:Math.max(1,Math.ceil(numero)),original};
    numero=obterNumero(/(\d+(?:[.,]\d+)?)\s*minutos?/);
    if(Number.isFinite(numero)&&numero>0)return {rounds:Math.max(1,Math.ceil(numero*10)),original};
    numero=obterNumero(/(\d+(?:[.,]\d+)?)\s*segundos?/);
    if(Number.isFinite(numero)&&numero>0)return {rounds:Math.max(1,Math.ceil(numero/6)),original};
    return null;
  }

  function normalizarDetalhesEfeito(valor){
    const lista=Array.isArray(valor)?valor:[];
    return lista.slice(0,16).map((item,indice)=>{
      const bruto=item&&typeof item==="object"?item:{};
      const valorMecanico=typeof bruto.value==="number"||typeof bruto.valor==="number"
        ?Number(bruto.value??bruto.valor)
        :texto(bruto.value??bruto.valor).slice(0,80);
      return {
        id:texto(bruto.id||`mecanica-${indice+1}`).slice(0,80),
        polarity:texto(bruto.polarity??bruto.polaridade??"neutro").slice(0,24),
        appliesTo:texto(bruto.appliesTo??bruto.aplicaEm??"usuario").slice(0,40),
        target:texto(bruto.target??bruto.alvo??"efeito").slice(0,60),
        operation:texto(bruto.operation??bruto.operacao??"").slice(0,30),
        value:valorMecanico,
        text:texto(bruto.text??bruto.texto??"").slice(0,220)
      };
    });
  }

  function chaveDeduplicacaoEfeito(efeito){
    const local=texto(efeito?.localEffectId);
    if(local) return `${texto(efeito?.participantId)}|${texto(efeito?.ownerUid)}|local:${local}`;
    return `${texto(efeito?.participantId)}|${texto(efeito?.ownerUid)}|${texto(efeito?.source)}|${texto(efeito?.name).toLowerCase()}`;
  }

  async function deduplicarEfeitosDaSala({forcar=false}={}){
    if(!estadoOnline.salaId||!estadoOnline.user||estadoOnline.deduplicandoEfeitos) return {skipped:true};
    if(!forcar&&agora()-Number(estadoOnline.lastDedupAt||0)<1200) return {skipped:true};
    estadoOnline.deduplicandoEfeitos=true;
    estadoOnline.lastDedupAt=agora();
    try{
      const api=estadoOnline.api;
      const snap=await api.get(api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/effects`));
      const efeitos=snap.val()||{};
      const ehMestre=estadoOnline.sala?.masterUid===estadoOnline.user.uid;
      const grupos=new Map();
      Object.entries(efeitos).forEach(([id,efeito])=>{
        if(!efeito||efeito.status!=="active") return;
        if(!ehMestre&&efeito.ownerUid!==estadoOnline.user.uid) return;
        const chave=chaveDeduplicacaoEfeito(efeito);
        const lista=grupos.get(chave)||[];
        lista.push({id,efeito});
        grupos.set(chave,lista);
      });
      const updates={};
      grupos.forEach(lista=>{
        if(lista.length<2) return;
        lista.sort((a,b)=>Number(b.efeito.createdAt||0)-Number(a.efeito.createdAt||0));
        lista.slice(1).forEach(({id})=>{
          updates[`rooms/${estadoOnline.salaId}/effects/${id}/status`]="ended";
          updates[`rooms/${estadoOnline.salaId}/effects/${id}/endedAt`]=agora();
          updates[`rooms/${estadoOnline.salaId}/effects/${id}/endedReason`]="duplicate-repair";
        });
      });
      if(Object.keys(updates).length) await api.update(api.ref(estadoOnline.db),updates);
      return {ok:true,removed:Object.keys(updates).filter(k=>k.endsWith('/status')).length};
    }finally{
      estadoOnline.deduplicandoEfeitos=false;
    }
  }

  async function adicionarEfeito({participantId,name,duration,source="manual",ownerUid,summary="",details=[],localEffectId="",activationKey=""}){
    exigirUsuario();
    const participante=participantes()[participantId];
    if(!participante) throw new Error("Participante não encontrado.");
    const ehMestre=estadoOnline.sala?.masterUid===estadoOnline.user.uid;
    if(!ehMestre&&participante.ownerUid!==estadoOnline.user.uid) throw new Error("Você só pode publicar efeitos da sua própria ficha.");
    const regra=typeof duration==="number"?{rounds:duration,original:`${duration} rodadas`}:analisarDuracaoRodadas(duration);
    if(!regra) return null;
    const combat=estadoOnline.sala?.combat||{};
    const round=Math.max(1,Number(combat.round||1));
    const ordem=normalizarOrdem();
    const turnIndex=combat.started&&ordem.length
      ?Math.min(Math.max(0,Number(combat.turnIndex||0)),ordem.length-1)
      :0;
    const localId=texto(localEffectId).slice(0,160);
    const ativacao=texto(activationKey).slice(0,80);
    /* A chave inclui a ativação. A mesma ativação reenviada após reiniciar o app
       encontra o mesmo registro; usar o jutsu novamente cria uma nova chave. */
    const id=localId&&ativacao
      ?`effect_${hashLeve(`${estadoOnline.salaId}|${participantId}|${localId}|${ativacao}`)}`
      :idAleatorio("effect");
    const refEfeito=estadoOnline.api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/effects/${id}`);
    const existenteSnap=await estadoOnline.api.get(refEfeito);
    if(existenteSnap.exists()) return {id,...existenteSnap.val()};

    const detalhes=normalizarDetalhesEfeito(details);
    const efeito={
      id,participantId,ownerUid:ownerUid||participante.ownerUid||estadoOnline.user.uid,
      name:(texto(name)||"Efeito").slice(0,120),source:texto(source).slice(0,140),
      summary:texto(summary).slice(0,500),details:detalhes,
      localEffectId:localId,activationKey:ativacao,
      durationOriginal:regra.original,totalRounds:regra.rounds,
      startRound:round,startTurnIndex:turnIndex,
      expiresAtRound:round+regra.rounds,expiresAtTurnIndex:turnIndex,
      status:"active",createdAt:agora()
    };
    await estadoOnline.api.set(refEfeito,efeito);
    deduplicarEfeitosDaSala().catch(()=>{});
    return efeito;
  }

  async function encerrarEfeito(effectId){
    exigirUsuario();
    const refEfeito=estadoOnline.api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/effects/${effectId}`);
    let efeito=estadoOnline.sala?.effects?.[effectId];
    if(!efeito){
      const remoto=await estadoOnline.api.get(refEfeito);
      efeito=remoto.val();
    }
    if(!efeito) return;
    const ehMestre=estadoOnline.sala?.masterUid===estadoOnline.user.uid;
    if(!ehMestre&&efeito.ownerUid!==estadoOnline.user.uid) throw new Error("Você não pode encerrar este efeito.");
    await estadoOnline.api.update(refEfeito,{status:"ended",endedAt:agora()});
  }

  async function atualizarEfeitosDaSala(round,turnIndex=0){
    exigirMestre();
    const api=estadoOnline.api,updates={};
    /* Lê os efeitos diretamente do banco depois da troca de turno. Isso evita
       perder um buff recém-publicado pelo jogador por causa de um snapshot
       local que ainda não chegou ao aparelho do mestre. */
    const snapshotEfeitos=await api.get(api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/effects`));
    const efeitos=snapshotEfeitos.val()||{};
    const rodadaAtual=Math.max(1,Number(round||1));
    const indiceAtual=Math.max(0,Number(turnIndex||0));
    Object.entries(efeitos).forEach(([id,e])=>{
      const rodadaFim=Math.max(1,Number(e.expiresAtRound||1));
      const indiceFim=Math.max(0,Number(e.expiresAtTurnIndex??e.startTurnIndex??0));
      const chegouAoFim=rodadaAtual>rodadaFim||(rodadaAtual===rodadaFim&&indiceAtual>=indiceFim);
      if(e.status==="active"&&chegouAoFim){
        updates[`rooms/${estadoOnline.salaId}/effects/${id}/status`]="expired";
        updates[`rooms/${estadoOnline.salaId}/effects/${id}/endedAt`]=agora();
        updates[`rooms/${estadoOnline.salaId}/effects/${id}/endedAtRound`]=rodadaAtual;
        updates[`rooms/${estadoOnline.salaId}/effects/${id}/endedAtTurnIndex`]=indiceAtual;
      }
    });
    if(Object.keys(updates).length) await api.update(api.ref(estadoOnline.db),updates);
  }

  async function registrarEvento(type,payload={}){
    if(!estadoOnline.salaId||!estadoOnline.user) return null;
    const api=estadoOnline.api,refEvento=api.push(api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/events`));
    await api.set(refEvento,{id:refEvento.key,type,payload,createdBy:estadoOnline.user.uid,createdAt:agora()});
    return refEvento.key;
  }

  function parseXpAtual(valor){
    const str=texto(valor);
    const partes=str.match(/-?\d+/g)||[];
    return {current:Math.max(0,Number(partes[0]||0)),max:Math.max(0,Number(partes[1]||355000))};
  }
  function formatarXp(current,max){return `${Math.max(0,Math.trunc(current))}/${Math.max(0,Math.trunc(max||355000))}`;}

  async function concederXp({participantIds,amount,reason=""}){
    exigirMestre();
    const valor=Math.trunc(Number(amount));
    if(!Number.isSafeInteger(valor)||valor===0) throw new Error("Informe uma quantidade inteira de XP diferente de zero.");
    if(Math.abs(valor)>1000000) throw new Error("A alteração máxima por operação é de 1.000.000 de XP.");
    const ids=Array.from(new Set((participantIds||[]).filter(id=>participantes()[id]?.type==="player")));
    if(!ids.length) throw new Error("Selecione ao menos um jogador.");
    const api=estadoOnline.api,updates={};
    ids.forEach(participantId=>{
      const p=participantes()[participantId];
      const eventRef=api.push(api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/events`));
      updates[`rooms/${estadoOnline.salaId}/events/${eventRef.key}`]={
        id:eventRef.key,type:"XP_GRANTED",createdBy:estadoOnline.user.uid,createdAt:agora(),
        payload:{participantId,targetUid:p.ownerUid,sheetId:p.sheetId,localSheetName:p.localSheetName,amount:valor,reason:texto(reason).slice(0,160)}
      };
    });
    await api.update(api.ref(estadoOnline.db),updates);
  }

  async function definirNivelJogador({participantId,nivel,reason=""}){
    exigirMestre();
    const p=participantes()[participantId];
    if(!p||p.type!=="player") throw new Error("Jogador não encontrado na sala.");
    const valor=Math.max(1,Math.min(20,Math.trunc(Number(nivel))));
    if(!Number.isFinite(valor)) throw new Error("Informe um nível entre 1 e 20.");

    const api=estadoOnline.api;
    const eventRef=api.push(api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/events`));
    const updates={};
    updates[`rooms/${estadoOnline.salaId}/participants/${participantId}/battle/level`]=valor;
    updates[`rooms/${estadoOnline.salaId}/participants/${participantId}/updatedAt`]=agora();
    updates[`rooms/${estadoOnline.salaId}/events/${eventRef.key}`]={
      id:eventRef.key,type:"LEVEL_SET",createdBy:estadoOnline.user.uid,createdAt:agora(),
      payload:{
        participantId,targetUid:p.ownerUid,sheetId:p.sheetId,localSheetName:p.localSheetName,
        level:valor,reason:texto(reason).slice(0,160)
      }
    };
    await api.update(api.ref(estadoOnline.db),updates);
    return {participantId,level:valor,eventId:eventRef.key};
  }

  function observarEventos(roomId){
    const api=estadoOnline.api;
    estadoOnline.unsubscribeEventos?.();
    const consulta=api.query(api.ref(estadoOnline.db,`rooms/${roomId}/events`),api.orderByChild("createdAt"),api.limitToLast(100));
    estadoOnline.unsubscribeEventos=api.onValue(consulta,()=>processarEventosXp().catch(()=>{}));
  }

  async function reivindicarEventoXp(roomId,eventId,userUid){
    const api=estadoOnline.api;
    const deviceId=obterDeviceId();
    const refAck=api.ref(estadoOnline.db,`rooms/${roomId}/eventAcks/${eventId}/${userUid}`);
    const instante=agora();
    const resultado=await api.runTransaction(refAck,atual=>{
      if(atual?.status==="done") return;
      const processando=atual?.status==="processing";
      const expirou=processando&&instante-Number(atual.claimedAt||0)>45000;
      if(atual&&!expirou) return;
      return {status:"processing",deviceId,claimedAt:instante};
    },{applyLocally:false});
    const valor=resultado.snapshot.val();
    return {
      claimed:Boolean(resultado.committed&&valor?.status==="processing"&&valor?.deviceId===deviceId),
      refAck,deviceId,value:valor
    };
  }

  async function liberarReivindicacaoXp(refAck,deviceId){
    const api=estadoOnline.api;
    await api.runTransaction(refAck,atual=>{
      if(atual?.status==="processing"&&atual?.deviceId===deviceId) return null;
      return;
    },{applyLocally:false}).catch(()=>{});
  }

  async function processarEventosXp(){
    if(estadoOnline.processandoXp) return;
    const room=estadoOnline.sala,user=estadoOnline.user,api=estadoOnline.api;
    if(!room||!user) return;
    estadoOnline.processandoXp=true;
    try{
      const processados=lerJson(CHAVE_XP_PROCESSADO,{})||{};
      const eventos=Object.values(room.events||{})
        .filter(e=>["XP_GRANTED","LEVEL_SET"].includes(e.type)&&e.payload?.targetUid===user.uid)
        .sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));

      for(const evento of eventos){
        const sheetId=texto(evento.payload?.sheetId);
        const nome=texto(evento.payload?.localSheetName);
        let fichasLocais=listarFichasLocais();
        let ficha=sheetId
          ?fichasLocais.find(f=>f.sheetId===sheetId)
          :fichasLocais.find(f=>f.name===nome);
        if(!ficha) continue;

        const ackAtual=room.eventAcks?.[evento.id]?.[user.uid];
        if(ackAtual?.status==="done"||ackAtual===true||typeof ackAtual==="number"){
          processados[evento.id]=processados[evento.id]||agora();
          continue;
        }

        /* Celular e tablet compartilham o mesmo UID. Somente um aparelho pode
           reivindicar o evento; assim o XP é somado uma única vez. */
        const claim=await reivindicarEventoXp(room.id,evento.id,user.uid);
        if(!claim.claimed) continue;

        try{
          /* Recarrega a ficha depois da reivindicação, pois outro snapshot pode
             ter chegado enquanto o Firebase concluía a transação. */
          fichasLocais=listarFichasLocais();
          ficha=sheetId
            ?fichasLocais.find(f=>f.sheetId===sheetId)
            :fichasLocais.find(f=>f.name===nome);
          if(!ficha){
            await liberarReivindicacaoXp(claim.refAck,claim.deviceId);
            continue;
          }

          const dados=clonar(ficha.data);
          dados.__online=dados.__online&&typeof dados.__online==="object"?dados.__online:{};
          const aplicados=dados.__online.appliedOnlineEvents&&typeof dados.__online.appliedOnlineEvents==="object"
            ?dados.__online.appliedOnlineEvents
            :(dados.__online.appliedXpEvents&&typeof dados.__online.appliedXpEvents==="object"?dados.__online.appliedXpEvents:{});

          if(!aplicados[evento.id]&&!processados[evento.id]){
            let notificacao=null;
            if(evento.type==="XP_GRANTED"){
              const xp=parseXpAtual(dados.xp),antes=xp.current;
              dados.xp=formatarXp(Math.max(0,xp.current+Number(evento.payload.amount||0)),xp.max);
              notificacao={tipo:"xp-recebido",detalhe:{
                amount:Number(evento.payload.amount||0),before:antes,after:parseXpAtual(dados.xp).current,
                reason:evento.payload.reason,character:texto(dados.nome)||ficha.characterName
              }};
            }else if(evento.type==="LEVEL_SET"){
              const antes=Math.max(1,Math.min(20,Math.trunc(Number(dados.nivel||1))||1));
              const depois=Math.max(1,Math.min(20,Math.trunc(Number(evento.payload.level||1))||1));
              dados.nivel=String(depois);
              dados.proficiencia=String(2+Math.floor((depois-1)/4));
              notificacao={tipo:"nivel-recebido",detalhe:{
                before:antes,after:depois,reason:evento.payload.reason,
                character:texto(dados.nome)||ficha.characterName
              }};
            }

            aplicados[evento.id]=agora();
            const recentes=Object.entries(aplicados).sort((a,b)=>Number(b[1])-Number(a[1])).slice(0,100);
            dados.__online.appliedOnlineEvents=Object.fromEntries(recentes);
            dados.__online.appliedXpEvents=Object.fromEntries(recentes.filter(([id])=>room.events?.[id]?.type==="XP_GRANTED"));
            dados.__online.lastOnlineEvent=evento.id;
            if(evento.type==="XP_GRANTED") dados.__online.lastXpEvent=evento.id;
            localStorage.setItem(ficha.key,JSON.stringify(dados));

            if(ficha.name===fichaAtivaNomeSeguro()){
              try{
                estado=dados;CHAVE=ficha.key;carregar();atualizarPerfil();
                if(evento.type==="LEVEL_SET"&&window.shinobiLevelUp?.setManualLevel){
                  window.shinobiLevelUp.setManualLevel(dados.nivel,{origem:"mestre",notificar:false});
                }
              }catch(_erro){}
            }
            if(notificacao) emitir(notificacao.tipo,notificacao.detalhe);
          }

          let sincronizada={ok:true,localOnly:Boolean(user.anonymous)};
          if(!user.anonymous&&typeof window.ShinobiOnline?.sincronizarCampoConfirmado==="function"){
            try{
              if(evento.type==="XP_GRANTED"){
                sincronizada=await window.ShinobiOnline.sincronizarCampoConfirmado(ficha.name,"xp",dados.xp,{origem:"mestre",motivo:"xp-mestre"});
              }else if(evento.type==="LEVEL_SET"){
                const resultados=[];
                resultados.push(await window.ShinobiOnline.sincronizarCampoConfirmado(ficha.name,"nivel",dados.nivel,{origem:"mestre",motivo:"nivel-mestre"}));
                resultados.push(await window.ShinobiOnline.sincronizarCampoConfirmado(ficha.name,"proficiencia",dados.proficiencia,{origem:"mestre",motivo:"nivel-mestre"}));
                sincronizada={ok:resultados.every(item=>item?.ok!==false),resultados};
              }
            }catch(_erro){
              sincronizada={queued:true};
            }
          }
          processados[evento.id]=agora();
          salvarJson(CHAVE_XP_PROCESSADO,processados);
          await api.set(claim.refAck,{status:"done",deviceId:claim.deviceId,completedAt:agora()});
        }catch(erro){
          await liberarReivindicacaoXp(claim.refAck,claim.deviceId);
          emitir("erro-sync",{mensagem:erroAmigavel(erro),erro});
        }
      }
    }finally{
      estadoOnline.processandoXp=false;
    }
  }

  function chaveSyncConta(uid=uidContaAtiva()){return chaveConta(CHAVE_SYNC_BASE,uid);}
  function chaveOutboxConta(uid=uidContaAtiva()){return chaveConta(CHAVE_OUTBOX_BASE,uid);}
  function chaveBackupOutboxConta(uid=uidContaAtiva()){return chaveConta(CHAVE_BACKUP_OUTBOX_BASE,uid);}

  function migrarEstadoSyncLegadoParaConta(uid){
    const chave=chaveSyncConta(uid);
    if(!chave||localStorage.getItem(chave)!=null) return;
    const legado=lerJson(CHAVE_SYNC_LEGADA,null);
    if(legado&&typeof legado==="object"){
      salvarJson(chave,legado);
      localStorage.removeItem(CHAVE_SYNC_LEGADA);
    }
  }

  function estadoSync(uid=uidContaAtiva()){
    const chave=chaveSyncConta(uid);
    return chave?(lerJson(chave,{})||{}):{};
  }
  function gravarEstadoSync(v,uid=uidContaAtiva()){
    const chave=chaveSyncConta(uid);
    if(chave) salvarJson(chave,v||{});
  }

  function estadoOutbox(uid=uidContaAtiva()){
    const chave=chaveOutboxConta(uid);
    return chave?(lerJson(chave,{})||{}):{};
  }
  function gravarOutbox(v,uid=uidContaAtiva()){
    const chave=chaveOutboxConta(uid);
    if(chave) salvarJson(chave,v||{});
  }
  function adicionarOutbox(sheetId,tipo="upsert",extra={},uid=uidContaAtiva()){
    const id=texto(sheetId),conta=texto(uid);
    if(!id||!conta) return;
    const outbox=estadoOutbox(conta);
    const anterior=outbox[id]&&typeof outbox[id]==="object"?outbox[id]:{};
    outbox[id]={...anterior,...extra,type:tipo,sheetId:id,updatedAt:agora()};
    gravarOutbox(outbox,conta);
  }
  function removerOutbox(sheetId,{somenteTipo=""}={},uid=uidContaAtiva()){
    const id=texto(sheetId),conta=texto(uid);
    if(!id||!conta) return;
    const outbox=estadoOutbox(conta);
    if(!outbox[id]) return;
    if(somenteTipo&&texto(outbox[id].type)!==somenteTipo) return;
    delete outbox[id];
    gravarOutbox(outbox,conta);
  }

  function estadoBackupOutbox(uid=uidContaAtiva()){
    const chave=chaveBackupOutboxConta(uid);
    return chave?(lerJson(chave,{})||{}):{};
  }
  function gravarBackupOutbox(v,uid=uidContaAtiva()){
    const chave=chaveBackupOutboxConta(uid);
    if(chave) salvarJson(chave,v||{});
  }
  function marcarBackupEstruturalPendente(localSheetName,sheetId,{motivo="backup-estrutural"}={},uid=uidContaAtiva()){
    const conta=texto(uid),id=texto(sheetId);
    if(!conta||!id) return;
    const outbox=estadoBackupOutbox(conta);
    outbox[id]={sheetId:id,name:texto(localSheetName)||"Principal",reason:texto(motivo)||"backup-estrutural",updatedAt:agora()};
    gravarBackupOutbox(outbox,conta);
  }
  function removerBackupEstruturalPendente(sheetId,uid=uidContaAtiva()){
    const conta=texto(uid),id=texto(sheetId);
    if(!conta||!id) return;
    const outbox=estadoBackupOutbox(conta);
    if(!outbox[id]) return;
    delete outbox[id];
    gravarBackupOutbox(outbox,conta);
  }
  function restaurarOutboxConta(uid=uidContaAtiva()){
    estadoOnline.dirtySheets.clear();
    const outbox=estadoOutbox(uid);
    Object.values(outbox).forEach(op=>{
      if(texto(op?.type)==="upsert"&&texto(op?.sheetId)) estadoOnline.dirtySheets.add(texto(op.sheetId));
    });
  }

  function definirStatusSync(sheetId,syncStatus,phase="pending",extra={}){
    const id=texto(sheetId);
    if(!id) return null;
    const sync=estadoSync();
    const atual=sync[id]&&typeof sync[id]==="object"?sync[id]:{};
    sync[id]={
      ...atual,
      syncStatus:syncStatus===1?1:0,
      phase:texto(phase)||"pending",
      statusUpdatedAt:agora(),
      ...extra
    };
    gravarEstadoSync(sync);
    emitir("status-sync",{sheetId,status:clonar(sync[id])});
    return sync[id];
  }

  function statusSincronizacaoAtual(){
    const ficha=fichaAtualLocal();
    if(!ficha) return {syncStatus:1,phase:"synced",sheetId:"",revision:0};
    const meta=estadoSync()[ficha.sheetId]||{};
    const hashAtual=hashFicha(ficha.data||{});
    const sincronizado=Boolean(meta.lastHash&&meta.lastHash===hashAtual&&!estadoOnline.dirtySheets.has(ficha.sheetId));
    return {
      sheetId:ficha.sheetId,
      name:ficha.name,
      revision:Number(meta.revision||0),
      syncStatus:sincronizado?1:Number(meta.syncStatus||0),
      phase:sincronizado?"synced":texto(meta.phase)||"pending",
      pendingMode:texto(meta.pendingMode),
      lastSyncedAt:Number(meta.lastSyncedAt||0),
      statusUpdatedAt:Number(meta.statusUpdatedAt||0)
    };
  }

  function marcarFichaPendente(localSheetName,{motivo="alteracao",modo="imediato"}={}){
    if(!estadoOnline.user||estadoOnline.user.anonymous||!estadoOnline.configurado) return null;
    const ficha=listarFichasLocais().find(f=>f.name===localSheetName)||fichaAtualLocal();
    if(!ficha||ficha.data?.__online?.syncDisabled) return null;
    estadoOnline.dirtySheets.add(ficha.sheetId);
    adicionarOutbox(ficha.sheetId,"upsert",{name:ficha.name,reason:texto(motivo),mode:texto(modo)||"imediato"});
    limparAgendamentoSync(ficha.sheetId);
    return definirStatusSync(ficha.sheetId,0,"pending",{pendingMode:texto(modo)||"imediato",pendingReason:texto(motivo)});
  }

  function limparAgendamentoSync(sheetId){
    const id=texto(sheetId);
    if(!id) return;
    const timer=estadoOnline.syncTimers.get(id);
    if(timer) clearTimeout(timer);
    estadoOnline.syncTimers.delete(id);
  }

  function marcarFichaLimpa(sheetId){
    const id=texto(sheetId);
    if(!id) return;
    limparAgendamentoSync(id);
    estadoOnline.dirtySheets.delete(id);
    removerOutbox(id,{somenteTipo:"upsert"});
    definirStatusSync(id,1,"synced",{pendingMode:"",pendingReason:""});
  }

  function nomeLocalDisponivel(base){
    const limpar=typeof window.limparNomeFicha==="function"
      ? window.limparNomeFicha
      : valor=>texto(valor).slice(0,32)||"Principal";
    const nomes=new Set(listarFichasLocais().map(f=>f.name));
    const nomeBase=limpar(base||"Ficha da nuvem");
    if(!nomes.has(nomeBase)) return nomeBase;
    const sufixoBase=limpar(`${nomeBase} Nuvem`);
    if(!nomes.has(sufixoBase)) return sufixoBase;
    let indice=2;
    while(indice<1000){
      const candidato=limpar(`${nomeBase} Nuvem ${indice}`);
      if(!nomes.has(candidato)) return candidato;
      indice+=1;
    }
    return limpar(`Nuvem ${Date.now().toString(36)}`);
  }

  function vincularFichaAusenteDaNuvem(sheetId,cloud,{groupIds=[]}={}){
    if(!cloud?.data) return {linked:false};
    const locais=prepararCopiasLocaisLegadas();
    const existente=locais.find(f=>f.sheetId===sheetId);
    if(existente) return {linked:true,localName:existente.name,reusedLocal:true,divergent:false,alreadyLinked:true};

    const chaveCloud=chaveLogicaFicha({name:cloud.name,characterName:cloud.characterName,data:cloud.data});
    const grupoIds=new Set(groupIds.map(texto));
    const uid=uidContaAtiva();
    const mesmaPersonagem=locais.filter(local=>{
      const ownerUid=texto(local.data?.__online?.ownerUid);
      return chaveLogicaFicha(local)===chaveCloud&&(!ownerUid||ownerUid===uid);
    });
    let candidato=[...mesmaPersonagem].sort((a,b)=>{
      const aDes=Boolean(a.data?.__online?.syncDisabled),bDes=Boolean(b.data?.__online?.syncDisabled);
      if(aDes!==bDes) return Number(aDes)-Number(bDes);
      const aNormal=!ehNomeCopiaAutomatica(a.name),bNormal=!ehNomeCopiaAutomatica(b.name);
      if(aNormal!==bNormal) return Number(bNormal)-Number(aNormal);
      const ativa=fichaAtivaNomeSeguro();
      if(a.name===ativa&&b.name!==ativa) return -1;
      if(b.name===ativa&&a.name!==ativa) return 1;
      const aGrupo=grupoIds.has(texto(a.sheetId)),bGrupo=grupoIds.has(texto(b.sheetId));
      if(aGrupo!==bGrupo) return Number(bGrupo)-Number(aGrupo);
      return pontuacaoConteudoFicha(b.data)-pontuacaoConteudoFicha(a.data);
    })[0];

    if(candidato){
      const antigoId=candidato.sheetId;
      const data=clonar(candidato.data||{});
      data.__online=data.__online&&typeof data.__online==="object"?data.__online:{};
      data.__online.sheetId=sheetId;
      data.__online.ownerUid=uidContaAtiva();
      data.__online.identityVersion=2;
      data.__online.originKey=data.__online.originKey||chaveIdentidadeFicha(candidato.name);
      data.__online.name=candidato.name;
      delete data.__online.syncDisabled;
      delete data.__online.legacyAutoCopy;
      localStorage.setItem(candidato.key,JSON.stringify(data));
      const ativa=fichaAtivaNomeSeguro()===candidato.name;
      if(ativa){try{if(typeof window.estado!=="undefined") window.estado.__online=clonar(data.__online);}catch(_erro){}}

      const localHashSemVinculo=hashFichaSemVinculo(data);
      const cloudHashSemVinculo=hashFichaSemVinculo(cloud.data);
      const identica=localHashSemVinculo===cloudHashSemVinculo;
      const sync=estadoSync();
      const metaAntiga=sync[antigoId]||{};
      if(antigoId!==sheetId) delete sync[antigoId];
      if(identica){
        sync[sheetId]={
          ...metaAntiga,revision:Number(cloud.revision||0),
          lastHash:hashFicha(data),lastSyncedAt:Number(cloud.updatedAt||agora()),
          deviceId:texto(cloud.deviceId),syncStatus:1,phase:"synced",pendingMode:"",pendingReason:"",statusUpdatedAt:agora()
        };
        estadoOnline.dirtySheets.delete(antigoId);
        estadoOnline.dirtySheets.delete(sheetId);
      }else{
        sync[sheetId]={
          ...metaAntiga,revision:0,lastHash:"",lastSyncedAt:Number(metaAntiga.lastSyncedAt||0),
          syncStatus:0,phase:"pending",pendingMode:"imediato",pendingReason:"primeiro-vinculo",statusUpdatedAt:agora()
        };
        if(estadoOnline.dirtySheets.has(antigoId)) estadoOnline.dirtySheets.add(sheetId);
        estadoOnline.dirtySheets.delete(antigoId);
      }
      gravarEstadoSync(sync);
      emitir("ficha-vinculada-nuvem",{
        sheetId,name:candidato.name,characterName:texto(data.nome)||texto(cloud.characterName)||candidato.name,
        revision:Number(cloud.revision||0),reusedLocal:true,divergent:!identica,oldSheetId:antigoId
      });
      return {linked:true,localName:candidato.name,reusedLocal:true,divergent:!identica,oldSheetId:antigoId};
    }

    const data=clonar(cloud.data||{});
    const nomeCloud=texto(cloud.name)||texto(cloud.characterName)||"Ficha da nuvem";
    const nome=nomeLocalDisponivel(nomeCloud);
    data.__online=data.__online&&typeof data.__online==="object"?data.__online:{};
    data.__online.sheetId=sheetId;
    data.__online.ownerUid=uidContaAtiva();
    data.__online.identityVersion=2;
    data.__online.originKey=data.__online.originKey||chaveIdentidadeFicha(nome);
    data.__online.name=nome;
    delete data.__online.syncDisabled;
    delete data.__online.legacyAutoCopy;

    const chave=nome==="Principal"?"ficha_ninja_app_v2":`ficha_ninja_app_v2__${nome}`;
    localStorage.setItem(chave,JSON.stringify(data));
    const listaAtual=lerJson("ficha_ninja_lista_v1",["Principal"]);
    const lista=Array.from(new Set([...(Array.isArray(listaAtual)?listaAtual:["Principal"]),nome]));
    localStorage.setItem("ficha_ninja_lista_v1",JSON.stringify(lista));
    atualizarMetaSync(sheetId,cloud,hashFicha(data));
    try{
      if(Array.isArray(window.fichas)&&!window.fichas.includes(nome)) window.fichas.push(nome);
      if(typeof window.atualizarListaFichas==="function") window.atualizarListaFichas();
    }catch(_erro){}
    emitir("ficha-vinculada-nuvem",{
      sheetId,name:nome,characterName:texto(data.nome)||texto(cloud.characterName)||nome,
      revision:Number(cloud.revision||0),reusedLocal:false,divergent:false
    });
    return {linked:true,localName:nome,reusedLocal:false,divergent:false};
  }

  function atualizarMetaSync(sheetId,cloud,dataHash){
    const sync=estadoSync();
    sync[sheetId]={
      ...(sync[sheetId]||{}),
      revision:Number(cloud?.revision||0),
      lastHash:dataHash||hashFicha(cloud?.data||{}),
      lastSyncedAt:Number(cloud?.updatedAt||agora()),
      deviceId:texto(cloud?.deviceId),
      syncStatus:1,phase:"synced",pendingMode:"",pendingReason:"",statusUpdatedAt:agora()
    };
    gravarEstadoSync(sync);
  }

  async function aplicarFichaDaNuvemNoLocal(sheetId,cloud,local,{motivo="atualizacao-remota"}={}){
    if(!local||!cloud) return false;
    if(alteracaoPareceEsvaziamento(local.data,cloud.data)){
      definirStatusSync(sheetId,0,"conflict",{pendingMode:"imediato",pendingReason:"protecao-contra-esvaziamento"});
      emitir("conflito-ficha",{sheetId,local,cloud,reason:"incoming-data-loss"});
      return false;
    }

    /* Antes de substituir uma versão local preenchida por uma revisão remota,
       guarda a revisão anterior. Isso permite recuperação mesmo que o outro
       dispositivo tenha enviado algo incorreto. */
    if(pontuacaoConteudoFicha(local.data)>=8){
      try{await criarBackupFicha(local,{reason:`antes-${motivo}`,revision:Number((estadoSync()[sheetId]||{}).revision||0)});}catch(_erro){}
    }

    const data=clonar(cloud.data||{});
    data.__online=data.__online&&typeof data.__online==="object"?data.__online:{};
    data.__online.sheetId=sheetId;
    data.__online.ownerUid=uidContaAtiva();
    data.__online.identityVersion=2;
    data.__online.originKey=data.__online.originKey||chaveIdentidadeFicha(local.name);
    data.__online.name=local.name;
    delete data.__online.syncDisabled;
    delete data.__online.legacyAutoCopy;
    const ativa=fichaAtivaNomeSeguro()===local.name;
    localStorage.setItem(local.key,JSON.stringify(data));
    const hash=hashFicha(data);
    atualizarMetaSync(sheetId,cloud,hash);
    /* Não consulte fichaAtualLocal() entre gravar o remoto e atualizar o estado
       global: essa função lê window.estado e, se ele ainda estiver antigo, pode
       gravar a versão velha de volta por cima da versão recém-recebida. */
    if(ativa) aplicarEstadoGlobalDaFicha(local.name,local.key,data);
    emitir("ficha-atualizada-nuvem",{
      sheetId,name:local.name,characterName:texto(data.nome)||local.characterName||local.name,
      revision:Number(cloud.revision||0),active:ativa
    });
    return true;
  }

  async function arquivarDuplicataNuvem(canonicoId,duplicata){
    const api=estadoOnline.api,uid=estadoOnline.user?.uid;
    if(!api||!uid||!duplicata?.sheetId||!duplicata?.cloud) return false;
    const id=`${agora()}_duplicata_${slug(duplicata.sheetId).slice(-28)}`;
    try{
      await api.set(api.ref(estadoOnline.db,`sheetBackups/${uid}/${canonicoId}/${id}`),{
        name:duplicata.cloud.name||"Ficha",characterName:duplicata.cloud.characterName||"",
        revision:Number(duplicata.cloud.revision||0),createdAt:agora(),reason:"duplicata-automatica-legada",
        sourceSheetId:duplicata.sheetId,data:duplicata.cloud.data||{}
      });
      await api.remove(api.ref(estadoOnline.db,`userSheets/${uid}/${duplicata.sheetId}`));
      const sync=estadoSync();
      delete sync[duplicata.sheetId];
      gravarEstadoSync(sync);
      estadoOnline.dirtySheets.delete(duplicata.sheetId);
      limparAgendamentoSync(duplicata.sheetId);
      emitir("duplicata-nuvem-arquivada",{sheetId:duplicata.sheetId,canonicalSheetId:canonicoId});
      return true;
    }catch(erro){
      emitir("erro-sync",{mensagem:erroAmigavel(erro),erro});
      return false;
    }
  }

  async function limparDuplicatasNuvemSeguras(grupos){
    for(const grupo of grupos||[]){
      const canonico=grupo.canonico;
      if(!canonico) continue;
      const hashCanonico=hashFichaSemVinculo(canonico.cloud?.data||{});
      for(const duplicata of grupo.duplicatas||[]){
        const hashDuplicata=hashFichaSemVinculo(duplicata.cloud?.data||{});
        const identica=hashCanonico===hashDuplicata;
        const muitoMaisVazia=alteracaoPareceEsvaziamento(canonico.cloud?.data,duplicata.cloud?.data);
        const copiaAutomatica=ehNomeCopiaAutomatica(duplicata.cloud?.name)||ehNomeCopiaAutomatica(canonico.cloud?.name);
        if(!identica&&!muitoMaisVazia&&!copiaAutomatica) continue;
        await arquivarDuplicataNuvem(canonico.sheetId,duplicata);
      }
    }
  }

  function registrarExclusaoLocal(nomeFicha,dados){
    const data=dados&&typeof dados==="object"?dados:{};
    const sheetId=texto(data?.__online?.sheetId);
    const ownerUid=texto(data?.__online?.ownerUid)||uidContaAtiva();
    if(!sheetId||!ownerUid) return false;
    const meta=estadoSync(ownerUid)[sheetId]||{};
    adicionarOutbox(sheetId,"delete",{
      name:texto(nomeFicha)||texto(data?.__online?.name)||"Ficha",
      characterName:texto(data?.nome),
      baseRevision:Number(meta.revision||0),
      requestedAt:agora()
    },ownerUid);
    if(ownerUid===uidContaAtiva()) setTimeout(()=>processarExclusoesPendentes().catch(()=>{}),0);
    return true;
  }

  async function processarExclusoesPendentes(){
    const uid=uidContaAtiva();
    if(!uid||!estadoOnline.api||!estadoOnline.db) return [];
    const api=estadoOnline.api,outbox=estadoOutbox(uid),resultados=[];
    for(const op of Object.values(outbox)){
      if(texto(op?.type)!=="delete"||!texto(op?.sheetId)) continue;
      const sheetId=texto(op.sheetId);
      try{
        const refFicha=api.ref(estadoOnline.db,`userSheets/${uid}/${sheetId}`);
        let jaExcluida=false;
        const resultado=await api.runTransaction(refFicha,atual=>{
          if(atual?.deleted===true){jaExcluida=true;return;}
          const revision=atual?Number(atual.revision||0)+1:1;
          return {
            name:texto(atual?.name)||texto(op.name)||"Ficha",
            characterName:texto(atual?.characterName)||texto(op.characterName),
            revision,updatedAt:api.serverTimestamp(),deviceId:obterDeviceId(),
            deleted:true,deletedAt:api.serverTimestamp(),appVersion:texto(window.APP_VERSION)
          };
        },{applyLocally:false});
        if(resultado.committed||jaExcluida){
          removerOutbox(sheetId,{},uid);
          const sync=estadoSync(uid);delete sync[sheetId];gravarEstadoSync(sync,uid);
          estadoOnline.dirtySheets.delete(sheetId);
          resultados.push({sheetId,ok:true,alreadyDeleted:jaExcluida});
        }
      }catch(erro){
        resultados.push({sheetId,ok:false,erro});
        emitir("erro-sync",{mensagem:erroAmigavel(erro),erro});
      }
    }
    return resultados;
  }

  function aplicarExclusoesNuvem(valor){
    const uid=uidContaAtiva();
    if(!uid) return false;
    let alterou=false;
    Object.entries(valor||{}).forEach(([sheetId,cloud])=>{
      if(cloud?.deleted!==true) return;
      const local=listarFichasLocais().find(f=>f.sheetId===sheetId);
      if(local&&local.name!=="Principal"){
        try{localStorage.removeItem(local.key);}catch(_erro){}
        try{
          const lista=lerJson("ficha_ninja_lista_v1",["Principal"]);
          const nova=(Array.isArray(lista)?lista:[]).filter(nome=>nome!==local.name);
          if(!nova.includes("Principal")) nova.unshift("Principal");
          localStorage.setItem("ficha_ninja_lista_v1",JSON.stringify(nova));
          if(Array.isArray(window.fichas)) window.fichas=window.fichas.filter(nome=>nome!==local.name);
          if(fichaAtivaNomeSeguro()===local.name){
            localStorage.setItem("ficha_ninja_ativa_v1","Principal");
            setTimeout(()=>location.reload(),80);
          }else if(typeof window.atualizarListaFichas==="function") window.atualizarListaFichas();
        }catch(_erro){}
        alterou=true;
      }
      const sync=estadoSync(uid);
      if(sync[sheetId]){delete sync[sheetId];gravarEstadoSync(sync,uid);}
      removerOutbox(sheetId,{},uid);
      estadoOnline.dirtySheets.delete(sheetId);
      limparAgendamentoSync(sheetId);
    });
    return alterou;
  }

  async function processarAtualizacoesNuvem(valor){
    if(!estadoOnline.user||estadoOnline.user.anonymous) return;
    aplicarExclusoesNuvem(valor);
    let locais=prepararCopiasLocaisLegadas();
    const sync=estadoSync();
    const grupos=agruparRegistrosNuvem(valor);

    for(const grupo of grupos){
      const registro=grupo.canonico;
      if(!registro) continue;
      const sheetId=registro.sheetId,cloud=registro.cloud;
      let local=locais.find(f=>f.sheetId===sheetId);
      let vinculo=null;

      if(!local){
        vinculo=vincularFichaAusenteDaNuvem(sheetId,cloud,{groupIds:grupo.itens.map(item=>item.sheetId)});
        locais=prepararCopiasLocaisLegadas();
        local=locais.find(f=>f.sheetId===sheetId);
        if(!local) continue;
      }

      const cloudRevision=Number(cloud?.revision||0);
      const localHash=hashFicha(local.data||{});
      const cloudHash=hashFicha(cloud?.data||{});

      /* No primeiro encontro entre dois aparelhos, o mesmo personagem pode ter
         sido editado antes de receber a identidade da nuvem. Em vez de criar
         "Nuvem 2/3/4", vinculamos ao mesmo sheetId e só decidimos o conteúdo. */
      if(vinculo?.divergent){
        const pontosLocal=pontuacaoConteudoFicha(local.data);
        const pontosCloud=pontuacaoConteudoFicha(cloud.data);
        if(pontosLocal<=4&&pontosCloud>pontosLocal){
          if(await aplicarFichaDaNuvemNoLocal(sheetId,cloud,local,{motivo:"primeiro-vinculo"})) marcarFichaLimpa(sheetId);
        }else{
          definirStatusSync(sheetId,0,"conflict",{pendingMode:"imediato",pendingReason:"primeiro-vinculo-divergente"});
          emitir("conflito-ficha",{sheetId,local,cloud,reason:alteracaoPareceEsvaziamento(cloud.data,local.data)?"cloud-data-loss":"first-link-divergent"});
        }
        continue;
      }

      const meta=sync[sheetId]||estadoSync()[sheetId]||{};
      const localRevision=Number(meta.revision||0);
      if(cloudRevision<=localRevision){
        if(localHash===cloudHash){atualizarMetaSync(sheetId,cloud,cloudHash);marcarFichaLimpa(sheetId);}
        continue;
      }

      if(localHash===cloudHash){
        atualizarMetaSync(sheetId,cloud,cloudHash);
        marcarFichaLimpa(sheetId);
        continue;
      }

      const baseHash=texto(meta.lastHash);
      const localFoiAlterado=Boolean(baseHash&&localHash!==baseHash);
      if(localFoiAlterado){
        definirStatusSync(sheetId,0,"conflict",{pendingMode:"imediato",pendingReason:"alteracoes-nos-dois-aparelhos"});
        emitir("conflito-ficha",{sheetId,local,cloud,reason:"both-changed"});
        continue;
      }

      if(alteracaoPareceEsvaziamento(local.data,cloud.data)){
        definirStatusSync(sheetId,0,"conflict",{pendingMode:"imediato",pendingReason:"protecao-contra-esvaziamento"});
        emitir("conflito-ficha",{sheetId,local,cloud,reason:"incoming-data-loss"});
        continue;
      }

      if(await aplicarFichaDaNuvemNoLocal(sheetId,cloud,local)){
        marcarFichaLimpa(sheetId);
        locais=prepararCopiasLocaisLegadas();
      }
    }

    await limparDuplicatasNuvemSeguras(grupos);
  }

  function observarFichasNuvem(){
    if(!estadoOnline.user) return;
    estadoOnline.unsubscribeFichas?.();
    estadoOnline.unsubscribeFichas=null;
    if(estadoOnline.user.anonymous){
      estadoOnline.fichasNuvem=[];
      emitir("fichas-nuvem",snapshot());
      return;
    }
    const api=estadoOnline.api;
    const uidObservado=texto(estadoOnline.user.uid);
    estadoOnline.unsubscribeFichas=api.onValue(
      api.ref(estadoOnline.db,`userSheets/${uidObservado}`),
      snap=>{
        /* userSheets é backup/recuperação. Abrir a área de nuvem só lista
           backups; nunca aplica, reconcilia ou envia fichas automaticamente. */
        if(!uidObservado||texto(estadoOnline.user?.uid)!==uidObservado) return;
        const valor=snap.val()||{};
        const locais=listarFichasLocais();
        estadoOnline.fichasNuvem=Object.entries(valor)
          .filter(([,f])=>f?.deleted!==true)
          .map(([id,f])=>({
            id,
            name:f?.name||f?.characterName||"Ficha",
            characterName:f?.characterName||"",
            revision:Number(f?.revision||0),
            updatedAt:Number(f?.updatedAt||0),
            deviceId:texto(f?.deviceId),
            linked:locais.some(local=>local.sheetId===id)
          }))
          .sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
        emitir("fichas-nuvem",snapshot());
      },
      erro=>emitir("erro-sync",{mensagem:erroAmigavel(erro),erro})
    );
  }

  function ativarBackupsNuvem(){
    if(!estadoOnline.user||estadoOnline.user.anonymous) return snapshot();
    observarFichasNuvem();
    return snapshot();
  }

  function garantirIdentidadeFichaRealtime(localSheetName){
    if(!estadoOnline.user||estadoOnline.user.anonymous) return null;
    const uid=texto(estadoOnline.user.uid);
    const ativo=fichaAtivaNomeSeguro();
    const nome=texto(localSheetName)||ativo||"Principal";
    /* Realtime não percorre a biblioteca de fichas. Ele cria/recupera uma
       identidade própria apenas para a ficha solicitada (normalmente a ativa),
       independente do sheetId legado usado por backup/restauração. */
    const chave=nome==="Principal"?"ficha_ninja_app_v2":`ficha_ninja_app_v2__${nome}`;
    let dados=null;
    try{
      const bruto=localStorage.getItem(chave);
      if(bruto){
        const lido=JSON.parse(bruto);
        if(lido&&typeof lido==="object"&&!Array.isArray(lido)) dados=lido;
      }
    }catch(_erro){dados=null;}
    if(!dados&&nome===ativo){
      try{if(typeof window.estado!=="undefined"&&window.estado&&typeof window.estado==="object") dados=clonar(window.estado);}catch(_erro){}
    }
    if(!dados) return null;
    dados=garantirMetadadosFichaLocal(nome,dados);
    dados.__online=dados.__online&&typeof dados.__online==="object"?dados.__online:{};
    const resolvedor=window.EkoCharacterIdentity?.resolveCharacterIdentity;
    const resolvida=typeof resolvedor==="function"?resolvedor({
      uid,
      name:nome,
      characterId:texto(dados.__online.characterId),
      characterOwnerUid:texto(dados.__online.characterOwnerUid),
      realtimeId:texto(dados.__online.realtimeId),
      realtimeOwnerUid:texto(dados.__online.realtimeOwnerUid),
      deterministicId:(conta,nomeFicha)=>sheetIdDeterministico(conta,nomeFicha).replace(/^sheet_/,"rt_")
    }):null;
    const realtimeId=texto(resolvida?.realtimeId)||texto(dados.__online.realtimeId)||sheetIdDeterministico(uid,nome).replace(/^sheet_/,"rt_");
    const characterId=texto(resolvida?.characterId)||realtimeId;
    dados.__online.characterId=characterId;
    dados.__online.characterOwnerUid=uid;
    dados.__online.characterIdentityVersion=1;
    dados.__online.realtimeId=realtimeId;
    dados.__online.realtimeOwnerUid=uid;
    dados.__online.realtimeIdentityVersion=2;
    try{
      localStorage.setItem(chave,JSON.stringify(dados));
      if(nome===ativo&&typeof window.estado!=="undefined"&&window.estado&&typeof window.estado==="object"){
        window.estado.__online=clonar(dados.__online);
      }
    }catch(_erro){}
    return {
      name:nome,key:chave,sheetId:texto(dados.__online.sheetId),characterId,realtimeId,
      level:Number(dados.nivel||1),characterName:texto(dados.nome)||nome,
      data:dados,storageExists:true,syncDisabled:Boolean(dados.__online?.syncDisabled)
    };
  }

  async function criarBackupRegistroNuvem(sheetId,cloud,{reason="antes-sobrescrever-nuvem"}={}){
    if(!cloud?.data||!estadoOnline.user||estadoOnline.user.anonymous) return false;
    const api=estadoOnline.api,uid=estadoOnline.user.uid;
    const id=`${agora()}_${slug(reason)}`;
    await api.set(api.ref(estadoOnline.db,`sheetBackups/${uid}/${sheetId}/${id}`),{
      name:cloud.name||"Ficha",characterName:cloud.characterName||"",revision:Number(cloud.revision||0),
      createdAt:agora(),reason,data:cloud.data,sourceDeviceId:texto(cloud.deviceId)
    });
    return true;
  }

  async function sincronizarFichaDireta(localSheetName,{force=false,backup=false,motivo="autosave"}={}){
    exigirContaGoogle();
    capturarEstadoAtualAntesDaSincronizacao(localSheetName);
    prepararIdentidadeFichaParaConta(localSheetName);
    const ficha=listarFichasLocais().find(f=>f.name===localSheetName)||fichaAtualLocal();
    if(!ficha) throw new Error("Ficha local não encontrada.");
    const ownerUid=texto(ficha.data?.__online?.ownerUid);
    if(ownerUid&&ownerUid!==uidContaAtiva()) throw new Error("Esta ficha local pertence a outra Conta Google neste aparelho.");
    if(ficha.data?.__online?.syncDisabled){
      return {skipped:true,legacyRecovery:true,reason:"copia-automatica-legada"};
    }
    const api=estadoOnline.api,uid=estadoOnline.user.uid,sheetId=ficha.sheetId;
    definirStatusSync(sheetId,0,"syncing",{pendingReason:texto(motivo)});
    const sync=estadoSync(),meta=sync[sheetId]||{};
    const data=garantirMetadadosFichaLocal(ficha.name,ficha.data);
    const conteudoHash=hashFicha(data);
    if(!force&&meta.lastHash===conteudoHash){
      marcarFichaLimpa(sheetId);
      return {skipped:true};
    }
    const refFicha=api.ref(estadoOnline.db,`userSheets/${uid}/${sheetId}`);
    if(force){
      try{
        const antes=await api.get(refFicha);
        if(antes.exists()) await criarBackupRegistroNuvem(sheetId,antes.val(),{reason:"antes-forcar-versao-local"});
      }catch(_erro){}
    }
    let conflito=null;
    const resultado=await api.runTransaction(refFicha,atual=>{
      const cloudRevision=Number(atual?.revision||0);
      const baseRevision=Number(meta.revision||0);
      if(!force&&atual?.deleted===true){
        conflito={cloudRevision,baseRevision,cloud:atual,reason:"deleted-remotely"};
        return;
      }
      if(!force&&atual&&alteracaoPareceEsvaziamento(atual.data,data)){
        conflito={cloudRevision,baseRevision,cloud:atual,reason:"outgoing-data-loss"};
        return;
      }
      const hashCloudAtual=atual?.data?hashFicha(atual.data):"";
      if(!force&&atual&&cloudRevision>baseRevision&&hashCloudAtual!==texto(meta.lastHash)){
        conflito={cloudRevision,baseRevision,cloud:atual,reason:"revision-conflict"};
        return;
      }
      const revision=cloudRevision+1;
      return {
        name:ficha.name,characterName:texto(data.nome)||ficha.name,revision,updatedAt:api.serverTimestamp(),
        deviceId:obterDeviceId(),hash:conteudoHash,appVersion:window.APP_VERSION||"",deleted:false,data
      };
    },{applyLocally:false});
    if(!resultado.committed){
      if(conflito){
        const motivoConflito=conflito.reason==="outgoing-data-loss"?"protecao-contra-esvaziamento":"conflito";
        definirStatusSync(sheetId,0,"conflict",{pendingMode:"imediato",pendingReason:motivoConflito});
        emitir("conflito-ficha",{sheetId,local:ficha,cloud:conflito.cloud,reason:conflito.reason||"conflict"});
        return {conflict:true,...conflito};
      }
      definirStatusSync(sheetId,0,"pending",{pendingReason:"transacao-nao-concluida"});
      throw new Error("A sincronização da ficha não foi concluída.");
    }
    const salvo=resultado.snapshot.val();
    if(!salvo?.data||texto(salvo.hash)!==conteudoHash){
      definirStatusSync(sheetId,0,"pending",{pendingReason:"confirmacao-incompleta"});
      throw new Error("A nuvem não confirmou o conteúdo completo da ficha. Tente sincronizar novamente.");
    }
    sync[sheetId]={
      ...(sync[sheetId]||{}),
      revision:salvo.revision,lastHash:salvo.hash,lastSyncedAt:Number(salvo.updatedAt)||agora(),deviceId:salvo.deviceId,
      syncStatus:1,phase:"synced",pendingMode:"",pendingReason:"",statusUpdatedAt:agora()
    };
    gravarEstadoSync(sync);
    marcarFichaLimpa(sheetId);
    if(backup) await criarBackupFicha(ficha,{reason:motivo,revision:salvo.revision});
    emitir("ficha-sincronizada",{sheetId,name:ficha.name,revision:salvo.revision});
    return {ok:true,revision:salvo.revision};
  }

  function sincronizarFicha(localSheetName,opcoes={}){
    exigirContaGoogle();
    const ficha=listarFichasLocais().find(f=>f.name===localSheetName)||fichaAtualLocal();
    if(!ficha) return Promise.reject(new Error("Ficha local não encontrada."));
    if(ficha.data?.__online?.syncDisabled) return Promise.resolve({skipped:true,legacyRecovery:true});
    const sheetId=ficha.sheetId;
    const anterior=estadoOnline.syncQueues.get(sheetId)||Promise.resolve();
    const tarefa=anterior.catch(()=>{}).then(()=>sincronizarFichaDireta(ficha.name,opcoes)).catch(erro=>{
      marcarFichaPendente(ficha.name,{
        motivo:texto(opcoes?.motivo)||"falha-sync",
        modo:texto(opcoes?.modo)||"imediato"
      });
      throw erro;
    });
    estadoOnline.syncQueues.set(sheetId,tarefa);
    tarefa.finally(()=>{
      if(estadoOnline.syncQueues.get(sheetId)===tarefa) estadoOnline.syncQueues.delete(sheetId);
    }).catch(()=>{});
    return tarefa;
  }

  async function atualizarBackupEstrutural(localSheetName,{motivo="backup-automatico-estrutural"}={}){
    exigirContaGoogle();
    capturarEstadoAtualAntesDaSincronizacao(localSheetName);
    prepararIdentidadeFichaParaConta(localSheetName);
    const ficha=listarFichasLocais().find(f=>f.name===localSheetName)||fichaAtualLocal();
    if(!ficha) throw new Error("Ficha local não encontrada.");
    const ownerUid=texto(ficha.data?.__online?.ownerUid);
    if(ownerUid&&ownerUid!==uidContaAtiva()) throw new Error("Esta ficha local pertence a outra Conta Google neste aparelho.");
    if(ficha.data?.__online?.syncDisabled) return {skipped:true,legacyRecovery:true};

    const api=estadoOnline.api,uid=estadoOnline.user.uid,sheetId=ficha.sheetId;
    const data=garantirMetadadosFichaLocal(ficha.name,ficha.data);
    const conteudoHash=hashFicha(data);
    marcarBackupEstruturalPendente(ficha.name,sheetId,{motivo},uid);
    if(window.navigator?.onLine===false) return {queued:true,sheetId};

    const refFicha=api.ref(estadoOnline.db,`userSheets/${uid}/${sheetId}`);
    let excluidaRemotamente=false;
    const resultado=await api.runTransaction(refFicha,atual=>{
      if(atual?.deleted===true){excluidaRemotamente=true;return;}
      const revision=Number(atual?.revision||0)+1;
      return {
        name:ficha.name,characterName:texto(data.nome)||ficha.name,revision,updatedAt:api.serverTimestamp(),
        deviceId:obterDeviceId(),hash:conteudoHash,appVersion:window.APP_VERSION||"",deleted:false,data
      };
    },{applyLocally:false});

    if(!resultado.committed){
      if(excluidaRemotamente){
        removerBackupEstruturalPendente(sheetId,uid);
        return {skipped:true,reason:"deleted-remotely",sheetId};
      }
      throw new Error("O backup estrutural não foi confirmado pela nuvem.");
    }

    const salvo=resultado.snapshot.val();
    if(!salvo?.data||texto(salvo.hash)!==conteudoHash) throw new Error("A nuvem não confirmou o snapshot completo da ficha.");
    removerBackupEstruturalPendente(sheetId,uid);
    emitir("backup-estrutural-atualizado",{sheetId,name:ficha.name,revision:Number(salvo.revision||0),motivo:texto(motivo)});
    return {ok:true,sheetId,revision:Number(salvo.revision||0)};
  }

  async function processarBackupsEstruturaisPendentes({motivo="reconexao"}={}){
    if(!estadoOnline.user||estadoOnline.user.anonymous||!estadoOnline.configurado) return [];
    if(window.navigator?.onLine===false) return [];
    const uid=uidContaAtiva(),pendentes=estadoBackupOutbox(uid),resultados=[];
    for(const op of Object.values(pendentes)){
      const sheetId=texto(op?.sheetId);
      if(!sheetId) continue;
      const ficha=listarFichasLocais().find(f=>f.sheetId===sheetId)||listarFichasLocais().find(f=>f.name===texto(op?.name));
      if(!ficha){removerBackupEstruturalPendente(sheetId,uid);continue;}
      try{
        resultados.push(await atualizarBackupEstrutural(ficha.name,{motivo:texto(op?.reason)||texto(motivo)||"reconexao"}));
      }catch(erro){
        resultados.push({ok:false,sheetId,erro});
      }
    }
    return resultados;
  }

  async function criarBackupFicha(ficha,{reason="manual",revision=0}={}){
    exigirContaGoogle();
    const api=estadoOnline.api,uid=estadoOnline.user.uid,id=`${agora()}_${slug(reason)}`;
    await api.set(api.ref(estadoOnline.db,`sheetBackups/${uid}/${ficha.sheetId}/${id}`),{
      name:ficha.name,characterName:ficha.characterName,revision,createdAt:agora(),reason,data:ficha.data
    });
    const snap=await api.get(api.ref(estadoOnline.db,`sheetBackups/${uid}/${ficha.sheetId}`));
    const itens=Object.entries(snap.val()||{}).sort((a,b)=>(b[1].createdAt||0)-(a[1].createdAt||0));
    const limite=Math.max(1,Number(window.SHINOBI_FIREBASE_OPTIONS?.backupsToKeep||5));
    const updates={};
    itens.slice(limite).forEach(([backupId])=>updates[`sheetBackups/${uid}/${ficha.sheetId}/${backupId}`]=null);
    if(Object.keys(updates).length) await api.update(api.ref(estadoOnline.db),updates);
  }

  async function sincronizarTodasFichas(){
    exigirContaGoogle();
    prepararIdentidadesDaConta();
    const resultados=[];
    for(const ficha of listarFichasSincronizaveis()){
      resultados.push(await sincronizarFicha(ficha.name,{force:false,backup:false,motivo:"sincronizacao-geral"}));
    }
    return resultados;
  }

  async function restaurarFichaDaNuvem(sheetId,{asCopy=false}={}){
    exigirContaGoogle();
    const api=estadoOnline.api;
    const snap=await api.get(api.ref(estadoOnline.db,`userSheets/${estadoOnline.user.uid}/${sheetId}`));
    if(!snap.exists()) throw new Error("Backup da nuvem não encontrado.");
    const cloud=snap.val();
    if(cloud?.deleted===true) throw new Error("Esta ficha foi excluída em outro aparelho e não pode ser restaurada como versão ativa.");
    const data=clonar(cloud.data||{});
    const locais=prepararCopiasLocaisLegadas();
    const uid=uidContaAtiva();
    const identidadeApi=window.EkoCharacterIdentity;
    const chaveCloud=chaveLogicaFicha({name:cloud.name,characterName:cloud.characterName,data:cloud.data});
    const vinculada=locais.find(f=>f.sheetId===sheetId);
    const mesmaIdentidade=!asCopy&&typeof identidadeApi?.sameCharacterIdentity==="function"
      ?locais.find(f=>!f.data?.__online?.syncDisabled&&identidadeApi.sameCharacterIdentity(f.data?.__online||{},data.__online||{},uid))
      :null;
    const mesmaPersonagem=locais.find(f=>{
      const ownerUid=texto(f.data?.__online?.ownerUid);
      return chaveLogicaFicha(f)===chaveCloud&&!f.data?.__online?.syncDisabled&&(!ownerUid||ownerUid===uid);
    });
    let nome=vinculada?.name||mesmaIdentidade?.name||mesmaPersonagem?.name||texto(cloud.name)||texto(cloud.characterName)||"Ficha restaurada";

    if(asCopy){
      const base=`${nome} Cópia`,nMax=1000;let n=2,candidato=base;
      while(locais.some(f=>f.name===candidato)&&n<nMax){candidato=`${base} ${n++}`;}
      nome=candidato;
      data.__online={};
      data.__online.sheetId=idAleatorio("sheet");
      data.__online.userCopy=true;
      data.__online.sourceSheetId=sheetId;
    }else{
      const anterior=vinculada||mesmaIdentidade||mesmaPersonagem;
      if(anterior&&pontuacaoConteudoFicha(anterior.data)>=8){
        try{await criarBackupFicha(anterior,{reason:"antes-restaurar-nuvem",revision:Number((estadoSync()[anterior.sheetId]||{}).revision||0)});}catch(_erro){}
      }
      data.__online=data.__online&&typeof data.__online==="object"?data.__online:{};
      if(typeof identidadeApi?.resolveCloudCharacterIdentity==="function"){
        const identidade=identidadeApi.resolveCloudCharacterIdentity({
          uid,name:nome,online:data.__online,
          deterministicId:(conta,nomeFicha)=>sheetIdDeterministico(conta,nomeFicha).replace(/^sheet_/,"rt_")
        });
        if(texto(identidade?.characterId)){
          data.__online.characterId=identidade.characterId;
          data.__online.characterOwnerUid=uid;
          data.__online.characterIdentityVersion=1;
          data.__online.realtimeId=identidade.realtimeId||identidade.characterId;
          data.__online.realtimeOwnerUid=uid;
          data.__online.realtimeIdentityVersion=2;
        }
      }
      data.__online.sheetId=sheetId;
      data.__online.ownerUid=uid;
      data.__online.identityVersion=2;
      data.__online.originKey=data.__online.originKey||chaveIdentidadeFicha(nome);
      delete data.__online.syncDisabled;
      delete data.__online.legacyAutoCopy;
    }

    data.__online=data.__online&&typeof data.__online==="object"?data.__online:{};
    const idFinal=texto(data.__online.sheetId)||sheetId;
    data.__online.sheetId=idFinal;
    data.__online.name=nome;
    const chave=nome==="Principal"?"ficha_ninja_app_v2":`ficha_ninja_app_v2__${nome}`;
    localStorage.setItem(chave,JSON.stringify(data));
    const lista=Array.from(new Set([...locais.map(f=>f.name),nome]));
    localStorage.setItem("ficha_ninja_lista_v1",JSON.stringify(lista));
    localStorage.setItem("ficha_ninja_ativa_v1",nome);
    aplicarEstadoGlobalDaFicha(nome,chave,data);
    const sync=estadoSync();
    sync[idFinal]={
      revision:asCopy?0:Number(cloud.revision||0),lastHash:asCopy?"":hashFicha(data),
      lastSyncedAt:asCopy?0:Number(cloud.updatedAt||agora()),deviceId:asCopy?"":texto(cloud.deviceId),
      syncStatus:asCopy?0:1,phase:asCopy?"pending":"synced",pendingMode:asCopy?"imediato":"",pendingReason:asCopy?"copia-explicita":""
    };
    gravarEstadoSync(sync);
    emitir("ficha-restaurada",{name:nome,sheetId:idFinal,asCopy});
    return nome;
  }

  async function resolverConflito(sheetId,acao){
    exigirContaGoogle();
    const local=listarFichasLocais().find(f=>f.sheetId===sheetId);
    if(acao==="nuvem") return restaurarFichaDaNuvem(sheetId,{asCopy:false});
    if(acao==="copia") return restaurarFichaDaNuvem(sheetId,{asCopy:true});
    if(acao==="local"&&local) return sincronizarFicha(local.name,{force:true,backup:true,motivo:"conflito-local"});
    throw new Error("Escolha de conflito inválida.");
  }

  async function sincronizarPendenciasAgora({motivo="flush",incluirTurno=false}={}){
    if(!estadoOnline.user||estadoOnline.user.anonymous||!estadoOnline.configurado) return [];
    const locais=listarFichasSincronizaveis();
    const sync=estadoSync();
    const alvos=new Map();

    locais.forEach(ficha=>{
      const meta=sync[ficha.sheetId]||{};
      const hashAtual=hashFicha(ficha.data||{});
      const pendente=estadoOnline.dirtySheets.has(ficha.sheetId)||estadoOutbox()[ficha.sheetId]?.type==="upsert"||(meta.lastHash&&meta.lastHash!==hashAtual);
      if(!pendente) return;
      if(!incluirTurno&&texto(meta.pendingMode)==="turno") return;
      alvos.set(ficha.sheetId,ficha);
    });

    const resultados=[];
    for(const [sheetId,ficha] of alvos){
      limparAgendamentoSync(sheetId);
      try{
        resultados.push(await sincronizarFicha(ficha.name,{force:false,backup:false,motivo,modo:"imediato"}));
      }catch(erro){
        estadoOnline.dirtySheets.add(sheetId);
        definirStatusSync(sheetId,0,"pending",{pendingReason:texto(motivo)});
        emitir("erro-sync",{mensagem:erroAmigavel(erro),erro});
      }
    }
    return resultados;
  }

  async function reconciliarSincronizacaoConta({motivo="reconciliacao",somenteReceber=false}={}){
    if(estadoOnline.reconciliandoSync) return {busy:true};
    if(!estadoOnline.user||estadoOnline.user.anonymous||!estadoOnline.api||!estadoOnline.db) return {skipped:true};
    estadoOnline.reconciliandoSync=true;
    try{
      const api=estadoOnline.api;
      const snap=await api.get(api.ref(estadoOnline.db,`userSheets/${estadoOnline.user.uid}`));
      const valor=snap.val()||{};
      await processarAtualizacoesNuvem(valor);
      await processarExclusoesPendentes();
      prepararIdentidadesDaConta();

      const sync=estadoSync();
      for(const ficha of listarFichasSincronizaveis()){
        const meta=sync[ficha.sheetId]||{};
        const hashAtual=hashFicha(ficha.data||{});
        const cloud=valor[ficha.sheetId];
        const pendenteDeTurno=texto(meta.pendingMode)==="turno";

        if(cloud?.deleted===true) continue;
        if(!cloud){
          if(!somenteReceber&&!pendenteDeTurno&&(estadoOnline.dirtySheets.has(ficha.sheetId)||estadoOutbox()[ficha.sheetId]?.type==="upsert"||meta.lastHash)){
            await sincronizarFicha(ficha.name,{motivo,modo:"imediato"});
          }
          continue;
        }

        const cloudHash=hashFicha(cloud.data||{});
        if(hashAtual===cloudHash){
          atualizarMetaSync(ficha.sheetId,cloud,cloudHash);
          marcarFichaLimpa(ficha.sheetId);
          continue;
        }

        if(!somenteReceber&&!pendenteDeTurno&&meta.lastHash&&hashAtual!==meta.lastHash){
          await sincronizarFicha(ficha.name,{motivo,modo:"imediato"});
        }
      }
      return {ok:true};
    }catch(erro){
      emitir("erro-sync",{mensagem:erroAmigavel(erro),erro});
      return {ok:false,erro};
    }finally{
      estadoOnline.reconciliandoSync=false;
    }
  }

  function agendarSincronizacaoFicha(localSheetName,{imediata=false,motivo="autosave"}={}){
    if(!estadoOnline.user||estadoOnline.user.anonymous||!estadoOnline.configurado) return;
    const ficha=listarFichasLocais().find(f=>f.name===localSheetName)||fichaAtualLocal();
    if(!ficha||ficha.data?.__online?.syncDisabled) return;
    const sheetId=ficha.sheetId;
    marcarFichaPendente(ficha.name,{motivo,modo:"imediato"});
    limparAgendamentoSync(sheetId);
    const timer=setTimeout(()=>{
      estadoOnline.syncTimers.delete(sheetId);
      sincronizarFicha(ficha.name,{motivo}).catch(erro=>{
        estadoOnline.dirtySheets.add(sheetId);
        emitir("erro-sync",{mensagem:erroAmigavel(erro),erro});
      });
    },imediata?25:450);
    estadoOnline.syncTimers.set(sheetId,timer);
  }

  function limparObservadoresConta(){
    estadoOnline.unsubscribeCampanhas?.();estadoOnline.unsubscribeCampanhas=null;
    estadoOnline.unsubscribeFichas?.();estadoOnline.unsubscribeFichas=null;
    estadoOnline.syncTimers.forEach(timer=>clearTimeout(timer));
    estadoOnline.syncTimers.clear();
    estadoOnline.syncQueues.clear();
    estadoOnline.dirtySheets.clear();
    estadoOnline.cloudQueue=Promise.resolve();
    limparSessaoLocal();
    estadoOnline.campanhas=[];estadoOnline.fichasNuvem=[];
  }

  function linkDaSala(code){
    const url=new URL(location.href);
    url.search="";url.hash="";url.searchParams.set("sala",code);
    return url.href;
  }

  function codigoDaUrl(){
    const url=new URL(location.href);
    return texto(url.searchParams.get("sala")).toUpperCase();
  }

  window.ShinobiOnline={
    iniciar,on:(tipo,fn)=>{EVENTO.addEventListener(tipo,fn);return()=>EVENTO.removeEventListener(tipo,fn);},snapshot,
    entrarAnonimo,entrarGoogle,trocarContaGoogle,sair,criarCampanha,editarCampanha,excluirCampanha,criarSala,buscarSalaPorCodigo,entrarSala,observarSala,
    sairDaSala,encerrarSala,listarFichasLocais,listarFichasSincronizaveis,listarCopiasLegadasLocaisSeguras,fichaAtualLocal,resumoBatalhaDaFicha,
    importarFichaComoNpc,criarNpcRapido,atualizarMeuParticipante,atualizarParticipante,removerParticipante,definirIniciativa,
    ordenarIniciativa,iniciarCombate,avancarTurno,voltarTurno,normalizarOrdem,analisarDuracaoRodadas,
    adicionarEfeito,encerrarEfeito,deduplicarEfeitosDaSala,concederXp,definirNivelJogador,registrarEvento,sincronizarFicha,sincronizarTodasFichas,
    restaurarFichaDaNuvem,resolverConflito,agendarSincronizacaoFicha,marcarFichaPendente,registrarExclusaoLocal,statusSincronizacaoAtual,
    sincronizarPendenciasAgora,reconciliarSincronizacaoConta,atualizarBackupEstrutural,processarBackupsEstruturaisPendentes,ativarBackupsNuvem,garantirIdentidadeFichaRealtime,
    resumoMudancasMeuTurno,finalizarMeuTurno,ehMeuTurno,chaveTurnoAtual,linkDaSala,codigoDaUrl,erroAmigavel,
    parseXpAtual,formatarXp
  };

  document.addEventListener("DOMContentLoaded",()=>{
    const codigo=codigoDaUrl();
    if(codigo) emitir("convite-url",{code:codigo});
  });

  function iniciarOnlineDepoisDaAbertura(){
    setTimeout(()=>iniciar().catch(erro=>{
      /* O online nunca é requisito para a ficha abrir. */
      console.warn("Modo online indisponível após a abertura do app.",erro);
    }),80);
  }
  function agendarInicioOnlineSeguro(){
    if(window.ShinobiAppReady?.executar){
      window.ShinobiAppReady.executar(iniciarOnlineDepoisDaAbertura);
    }else if(document.readyState==="complete"){
      setTimeout(iniciarOnlineDepoisDaAbertura,1200);
    }else{
      window.addEventListener("load",()=>setTimeout(iniciarOnlineDepoisDaAbertura,1200),{once:true});
    }
  }
  if(window.__shinobiOnlineStackLoading){
    window.addEventListener("shinobi:online-stack-ready",agendarInicioOnlineSeguro,{once:true});
  }else{
    agendarInicioOnlineSeguro();
  }
})();
