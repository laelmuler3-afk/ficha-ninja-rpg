/* Ficha Ninja RPG — motor Firebase, salas, fichas, turnos e XP. */
(function(){
  "use strict";

  const CHAVE_SESSAO = "shinobi_online_session_v1";
  const CHAVE_DEVICE = "shinobi_device_id_v1";
  const CHAVE_SYNC_LEGADA = "shinobi_sheet_sync_v1";
  const CHAVE_SYNC_BASE = "shinobi_sheet_sync_v2";
  const CHAVE_OUTBOX_BASE = "shinobi_sheet_outbox_v1";
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
          /* A identidade precisa estar estável antes que o motor granular
             receba o evento de autenticação; caso contrário um aparelho novo
             pode publicar o sheetId aleatório legado antes da migração
             determinística por Conta Google. */
          prepararIdentidadesDaConta();
        }
        emitir("auth",snapshot());
        if(user){
          await registrarPerfilUsuario().catch(()=>{});
          observarCampanhas();
          observarFichasNuvem();
          setTimeout(()=>{
            reconciliarSincronizacaoConta({motivo:"login"}).catch(()=>{});
            processarExclusoesPendentes().catch(()=>{});
          },180);
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

    capturarEstadoAtualAntesDaSincronizacao(ficha.name);
    const chave=texto(turnKey)||chaveTurnoAtual(combat);
    let resultado={skipped:true,revision:0,granular:true};
    if(!estadoOnline.user.anonymous){
      await sincronizarPendenciasAgora({motivo:"fim-turno",incluirTurno:true});
      resultado={ok:true,revision:0,granular:true};
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

          let sincronizada={ok:true,localOnly:Boolean(user.anonymous),granular:true};
          if(!user.anonymous&&window.ShinobiOnline?.sincronizarCamposFicha){
            const camposEvento=evento.type==="LEVEL_SET"?["nivel","proficiencia"]:["xp"];
            sincronizada=await window.ShinobiOnline.sincronizarCamposFicha(
              ficha.name,camposEvento,{motivo:evento.type==="LEVEL_SET"?"nivel-mestre":"xp"}
            );
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
  function restaurarOutboxConta(uid=uidContaAtiva()){
    /* 2.5.8.67: a outbox antiga de ficha inteira foi aposentada. Mantemos
       somente exclusões pendentes; alterações normais vivem na outbox granular
       do EkoRealtimeSync. Isso impede uma versão antiga do app de disparar um
       upload completo ao voltar à internet. */
    estadoOnline.dirtySheets.clear();
    const outbox=estadoOutbox(uid);
    let alterou=false;
    Object.entries(outbox).forEach(([sheetId,op])=>{
      if(texto(op?.type)!=="upsert") return;
      delete outbox[sheetId];
      alterou=true;
    });
    if(alterou) gravarOutbox(outbox,uid);
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

  function registrarSyncGranularPendente(sheetId,motivo="alteracao-granular"){
    const id=texto(sheetId);
    if(!id) return null;
    estadoOnline.dirtySheets.add(id);
    limparAgendamentoSync(id);
    return definirStatusSync(id,0,"pending",{
      pendingMode:"granular",
      pendingReason:texto(motivo)||"alteracao-granular"
    });
  }

  function confirmarSyncGranular(sheetId,lastHash,lastSyncedAt=0){
    const id=texto(sheetId);
    if(!id) return null;
    const sync=estadoSync();
    const atual=sync[id]&&typeof sync[id]==="object"?sync[id]:{};
    sync[id]={
      ...atual,
      lastHash:texto(lastHash)||texto(atual.lastHash),
      lastSyncedAt:Number(lastSyncedAt)||agora(),
      syncStatus:1,
      phase:"synced",
      pendingMode:"",
      pendingReason:"",
      statusUpdatedAt:agora()
    };
    gravarEstadoSync(sync);
    limparAgendamentoSync(id);
    estadoOnline.dirtySheets.delete(id);
    removerOutbox(id,{somenteTipo:"upsert"});
    emitir("status-sync",{sheetId:id,status:clonar(sync[id])});
    emitir("ficha-sincronizada",{sheetId:id,granular:true,lastSyncedAt:sync[id].lastSyncedAt});
    return sync[id];
  }

  function notificarEventoSync(tipo,detalhe={}){
    emitir(texto(tipo)||"status",detalhe||{});
  }

  function statusSincronizacaoAtual(){
    const ficha=fichaAtualLocal();
    if(!ficha) return {syncStatus:1,phase:"synced",sheetId:"",revision:0};
    const meta=estadoSync()[ficha.sheetId]||{};
    const hashAtual=hashFicha(ficha.data||{});
    const granularPendente=Boolean(window.EkoRealtimeSync?.temPendencias?.(ficha.sheetId));
    const sincronizado=Boolean(meta.lastHash&&meta.lastHash===hashAtual&&!estadoOnline.dirtySheets.has(ficha.sheetId)&&!granularPendente);
    return {
      sheetId:ficha.sheetId,
      name:ficha.name,
      revision:Number(meta.revision||0),
      syncStatus:sincronizado?1:Number(meta.syncStatus||0),
      phase:sincronizado?"synced":(granularPendente?"pending":texto(meta.phase)||"pending"),
      pendingMode:texto(meta.pendingMode),
      lastSyncedAt:Number(meta.lastSyncedAt||0),
      statusUpdatedAt:Number(meta.statusUpdatedAt||0)
    };
  }

  function marcarFichaPendente(localSheetName,{motivo="alteracao",modo="imediato"}={}){
    if(!estadoOnline.user||estadoOnline.user.anonymous||!estadoOnline.configurado) return null;
    const ficha=listarFichasLocais().find(f=>f.name===localSheetName)||fichaAtualLocal();
    if(!ficha||ficha.data?.__online?.syncDisabled) return null;
    /* Compatibilidade: esta função agora só sinaliza a UI. O envio de dados
       acontece exclusivamente pela outbox granular, nunca pela ficha inteira. */
    estadoOnline.dirtySheets.add(ficha.sheetId);
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
    const outbox=estadoOutbox(uid),resultados=[];
    for(const op of Object.values(outbox)){
      if(texto(op?.type)!=="delete"||!texto(op?.sheetId)) continue;
      const sheetId=texto(op.sheetId);
      if(navigator.onLine===false){resultados.push({sheetId,queued:true});continue;}
      try{
        /* Excluir uma ficha local encerra apenas a sessão realtime dela. O
           backup completo fica preservado em userSheets para recuperação. */
        if(!window.EkoRealtimeSync?.excluirFichaRealtime) throw new Error("Motor realtime indisponível para concluir a exclusão.");
        const resultado=await window.EkoRealtimeSync.excluirFichaRealtime(sheetId,{removerNuvem:true});
        if(resultado?.ok===false) throw resultado.error||new Error("Não foi possível remover a ficha da sincronização em tempo real.");
        removerOutbox(sheetId,{},uid);
        const sync=estadoSync(uid);delete sync[sheetId];gravarEstadoSync(sync,uid);
        estadoOnline.dirtySheets.delete(sheetId);
        resultados.push({sheetId,ok:true,backupPreservado:true});
      }catch(erro){
        resultados.push({sheetId,ok:false,erro});
        emitir("erro-sync",{mensagem:erroAmigavel(erro),erro});
      }
    }
    return resultados;
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
    /* userSheets agora é SOMENTE o repositório de backup completo. O observer
       atualiza a lista da interface, mas não aplica o snapshot sobre a ficha
       local e não dispara upload automático. */
    estadoOnline.unsubscribeFichas=api.onValue(
      api.ref(estadoOnline.db,`userSheets/${estadoOnline.user.uid}`),
      snap=>{
        const valor=snap.val()||{};
        const locais=prepararCopiasLocaisLegadas();
        estadoOnline.fichasNuvem=Object.entries(valor)
          .filter(([,f])=>f&&f.deleted!==true&&f.data&&typeof f.data==="object")
          .map(([id,f])=>({
            id,...f,data:undefined,
            linked:locais.some(local=>local.sheetId===id)
          }))
          .sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
        emitir("fichas-nuvem",snapshot());
      },
      erro=>emitir("erro-sync",{mensagem:erroAmigavel(erro),erro})
    );
  }

  async function salvarBackupFicha(localSheetName,{motivo="manual"}={}){
    exigirContaGoogle();
    capturarEstadoAtualAntesDaSincronizacao(localSheetName);
    prepararIdentidadeFichaParaConta(localSheetName);
    const ficha=listarFichasLocais().find(f=>f.name===localSheetName)||fichaAtualLocal();
    if(!ficha) throw new Error("Ficha local não encontrada.");
    if(ficha.data?.__online?.syncDisabled) throw new Error("Esta cópia antiga está em modo de recuperação e não pode substituir o backup principal.");
    const ownerUid=texto(ficha.data?.__online?.ownerUid);
    if(ownerUid&&ownerUid!==uidContaAtiva()) throw new Error("Esta ficha local pertence a outra Conta Google neste aparelho.");

    const api=estadoOnline.api,uid=estadoOnline.user.uid,sheetId=ficha.sheetId;
    const data=garantirMetadadosFichaLocal(ficha.name,ficha.data);
    if(alteracaoPareceEsvaziamento(ficha.data,data)) throw new Error("O backup foi bloqueado porque os dados preparados ficaram incompletos.");
    const conteudoHash=hashFicha(data);
    const refBackup=api.ref(estadoOnline.db,`userSheets/${uid}/${sheetId}`);

    /* Um sheetId possui exatamente UM backup completo. Cada novo backup grava
       no mesmo caminho e incrementa a revisão; não existe backupId por data. */
    const resultado=await api.runTransaction(refBackup,atual=>({
      name:ficha.name,
      characterName:texto(data.nome)||ficha.name,
      revision:Number(atual?.revision||0)+1,
      updatedAt:api.serverTimestamp(),
      deviceId:obterDeviceId(),
      hash:conteudoHash,
      appVersion:window.APP_VERSION||"",
      deleted:false,
      backupReason:texto(motivo)||"manual",
      data
    }),{applyLocally:false});

    if(!resultado.committed) throw new Error("O backup da ficha não foi confirmado pelo Firebase.");
    const salvo=resultado.snapshot.val();
    if(!salvo?.data||texto(salvo.hash)!==conteudoHash) throw new Error("O Firebase não confirmou o conteúdo completo do backup.");
    emitir("backup-ficha",{sheetId,name:ficha.name,revision:Number(salvo.revision||0),updatedAt:Number(salvo.updatedAt||0)});
    return {ok:true,sheetId,revision:Number(salvo.revision||0),updatedAt:Number(salvo.updatedAt||0)};
  }

  /* Aliases mantidos somente para compatibilidade com extensões antigas.
     Eles têm semântica de BACKUP explícito, nunca de sincronização automática. */
  function sincronizarFicha(localSheetName,opcoes={}){
    /* Compatibilidade com módulos/caches de versões anteriores: chamadas
       antigas de "sincronizarFicha" sem intenção explícita de backup NÃO
       podem voltar a enviar a ficha inteira. */
    const motivo=texto(opcoes?.motivo)||"compatibilidade";
    if(opcoes?.backup===true||opcoes?.acao==="backup"){
      return salvarBackupFicha(localSheetName,{motivo});
    }
    return sincronizarPendenciasAgora({motivo,incluirTurno:Boolean(opcoes?.modo==="turno")});
  }

  async function salvarBackupTodasFichas(){
    exigirContaGoogle();
    prepararIdentidadesDaConta();
    const resultados=[];
    for(const ficha of listarFichasSincronizaveis()){
      resultados.push(await salvarBackupFicha(ficha.name,{motivo:"backup-todas"}));
    }
    return resultados;
  }

  function sincronizarTodasFichas(){
    return salvarBackupTodasFichas();
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
    const chaveCloud=chaveLogicaFicha({name:cloud.name,characterName:cloud.characterName,data:cloud.data});
    const vinculada=locais.find(f=>f.sheetId===sheetId);
    const mesmaPersonagem=locais.find(f=>{
      const ownerUid=texto(f.data?.__online?.ownerUid);
      return chaveLogicaFicha(f)===chaveCloud&&!f.data?.__online?.syncDisabled&&(!ownerUid||ownerUid===uidContaAtiva());
    });
    let nome=vinculada?.name||mesmaPersonagem?.name||texto(cloud.name)||texto(cloud.characterName)||"Ficha restaurada";

    if(asCopy){
      const base=`${nome} Cópia`,nMax=1000;let n=2,candidato=base;
      while(locais.some(f=>f.name===candidato)&&n<nMax){candidato=`${base} ${n++}`;}
      nome=candidato;
      data.__online={};
      data.__online.sheetId=idAleatorio("sheet");
      data.__online.userCopy=true;
      data.__online.sourceSheetId=sheetId;
    }else{
      const anterior=vinculada||mesmaPersonagem;
      void anterior;
      data.__online=data.__online&&typeof data.__online==="object"?data.__online:{};
      data.__online.sheetId=sheetId;
      data.__online.ownerUid=uidContaAtiva();
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
    if(acao==="local"&&local) return salvarBackupFicha(local.name,{motivo:"conflito-local"});
    throw new Error("Escolha de conflito inválida.");
  }

  async function sincronizarPendenciasAgora({motivo="flush",incluirTurno=false}={}){
    if(!estadoOnline.user||estadoOnline.user.anonymous||!estadoOnline.configurado) return [];
    void motivo;void incluirTurno;
    const resultados=[];
    if(window.EkoRealtimeSync?.processarOutbox){
      try{
        const retorno=await window.EkoRealtimeSync.processarOutbox();
        if(Array.isArray(retorno)) resultados.push(...retorno);
        else if(Array.isArray(retorno?.resultados)) resultados.push(...retorno.resultados);
      }catch(_erroGranular){}
    }
    try{resultados.push(...await processarExclusoesPendentes());}catch(_erroDelete){}
    return resultados;
  }

  async function reconciliarSincronizacaoConta({motivo="reconciliacao",somenteReceber=false}={}){
    if(estadoOnline.reconciliandoSync) return {busy:true};
    if(!estadoOnline.user||estadoOnline.user.anonymous||!estadoOnline.api||!estadoOnline.db) return {skipped:true};
    estadoOnline.reconciliandoSync=true;
    try{
      void motivo;void somenteReceber;
      prepararIdentidadesDaConta();
      if(window.EkoRealtimeSync?.reconciliar) await window.EkoRealtimeSync.reconciliar();
      await processarExclusoesPendentes();
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
    limparAgendamentoSync(ficha.sheetId);
    const timer=setTimeout(()=>{
      estadoOnline.syncTimers.delete(ficha.sheetId);
      sincronizarPendenciasAgora({motivo}).catch(erro=>emitir("erro-sync",{mensagem:erroAmigavel(erro),erro}));
    },imediata?25:120);
    estadoOnline.syncTimers.set(ficha.sheetId,timer);
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
    sairDaSala,encerrarSala,listarFichasLocais,listarFichasSincronizaveis,fichaAtualLocal,resumoBatalhaDaFicha,
    importarFichaComoNpc,criarNpcRapido,atualizarMeuParticipante,atualizarParticipante,removerParticipante,definirIniciativa,
    ordenarIniciativa,iniciarCombate,avancarTurno,voltarTurno,normalizarOrdem,analisarDuracaoRodadas,
    adicionarEfeito,encerrarEfeito,deduplicarEfeitosDaSala,concederXp,definirNivelJogador,registrarEvento,
    salvarBackupFicha,salvarBackupTodasFichas,sincronizarFicha,sincronizarTodasFichas,
    restaurarFichaDaNuvem,resolverConflito,agendarSincronizacaoFicha,marcarFichaPendente,registrarExclusaoLocal,statusSincronizacaoAtual,
    registrarSyncGranularPendente,confirmarSyncGranular,notificarEventoSync,
    sincronizarPendenciasAgora,reconciliarSincronizacaoConta,resumoMudancasMeuTurno,finalizarMeuTurno,ehMeuTurno,chaveTurnoAtual,linkDaSala,codigoDaUrl,erroAmigavel,
    parseXpAtual,formatarXp
  };

  document.addEventListener("DOMContentLoaded",()=>{
    iniciar().catch(()=>{});
    const codigo=codigoDaUrl();
    if(codigo) emitir("convite-url",{code:codigo});
  });
})();
