/* Ficha Ninja RPG — motor Firebase, salas, fichas, turnos e XP. */
(function(){
  "use strict";

  const CHAVE_SESSAO = "shinobi_online_session_v1";
  const CHAVE_DEVICE = "shinobi_device_id_v1";
  const CHAVE_SYNC = "shinobi_sheet_sync_v1";
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
    presenceRef:null,
    syncTimer:null,
    processandoXp:false,
    xpPendente:false,
    operacoesDesdeLimpeza:0,
    limpandoHistorico:false,
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
    /* O nome interno depende da chave local usada em cada aparelho. Ele não
       representa uma alteração real da personagem e não deve gerar conflito. */
    if(copia?.__online&&typeof copia.__online==="object") delete copia.__online.name;
    return hashLeve(copia);
  }
  function lerJson(chave,padrao){
    try{const v=JSON.parse(localStorage.getItem(chave)||"");return v??padrao;}catch(_erro){return padrao;}
  }
  function salvarJson(chave,valor){localStorage.setItem(chave,JSON.stringify(valor));}

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
      "PERMISSION_DENIED":"O Firebase recusou esta operação. Revise as regras do banco.",
      "permission-denied":"O Firebase recusou esta operação. Revise as regras do banco."
    };
    return mapa[codigo]||texto(erro?.message)||"Ocorreu um erro na conexão online.";
  }

  async function carregarFirebase(){
    if(estadoOnline.api) return estadoOnline.api;
    const versao=window.SHINOBI_FIREBASE_OPTIONS?.sdkVersion||"12.16.0";
    const base=`https://www.gstatic.com/firebasejs/${versao}`;
    const [appApi,authApi,dbApi]=await Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
      import(`${base}/firebase-database.js`)
    ]);
    estadoOnline.api={...appApi,...authApi,...dbApi};
    return estadoOnline.api;
  }

  function definirUsuarioFirebase(user){
    estadoOnline.user=user?{
      uid:user.uid,
      anonymous:Boolean(user.isAnonymous),
      displayName:user.displayName||"Jogador",
      email:user.email||"",
      photoURL:user.photoURL||""
    }:null;
    estadoOnline.conectado=Boolean(user);
    return estadoOnline.user;
  }

  async function iniciar(){
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
      const apps=typeof api.getApps==="function"?api.getApps():[];
      const app=apps.length?apps[0]:api.initializeApp(window.SHINOBI_FIREBASE_CONFIG);
      estadoOnline.auth=api.getAuth(app);
      estadoOnline.db=api.getDatabase(app);
      if(api.setPersistence&&api.browserLocalPersistence){
        await api.setPersistence(estadoOnline.auth,api.browserLocalPersistence).catch(()=>{});
      }

      api.onAuthStateChanged(estadoOnline.auth,async user=>{
        definirUsuarioFirebase(user);
        emitir("auth",snapshot());
        if(user){
          await registrarPerfilUsuario().catch(()=>{});
          observarCampanhas();
          observarFichasNuvem();
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
      ultimoErro:estadoOnline.ultimoErro
    };
  }

  function exigirFirebase(){
    if(!estadoOnline.configurado) throw new Error("Firebase ainda não configurado.");
    if(!estadoOnline.api||!estadoOnline.auth||!estadoOnline.db) throw new Error("Firebase ainda está iniciando.");
  }
  function exigirUsuario(){exigirFirebase();if(!estadoOnline.user) throw new Error("Entre no modo online primeiro.");}
  function exigirMestre(sala=estadoOnline.sala){
    exigirUsuario();
    if(!sala||sala.masterUid!==estadoOnline.user.uid) throw new Error("Somente o mestre pode executar esta ação.");
  }

  async function entrarAnonimo(){
    await iniciar();exigirFirebase();
    if(estadoOnline.auth.currentUser){
      if(!estadoOnline.user) definirUsuarioFirebase(estadoOnline.auth.currentUser);
      return snapshot();
    }
    const credencial=await estadoOnline.api.signInAnonymously(estadoOnline.auth);
    if(credencial?.user&&!estadoOnline.user) definirUsuarioFirebase(credencial.user);
    return snapshot();
  }

  async function entrarGoogle(){
    await iniciar();exigirFirebase();
    const provider=new estadoOnline.api.GoogleAuthProvider();
    provider.setCustomParameters({prompt:"select_account"});
    try{
      const credencial=await estadoOnline.api.signInWithPopup(estadoOnline.auth,provider);
      if(credencial?.user&&!estadoOnline.user) definirUsuarioFirebase(credencial.user);
    }catch(erro){
      if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment"].includes(erro?.code)){
        await estadoOnline.api.signInWithRedirect(estadoOnline.auth,provider);
        return snapshot();
      }
      throw erro;
    }
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
    const api=estadoOnline.api;
    await api.update(api.ref(estadoOnline.db,`users/${estadoOnline.user.uid}`),{
      displayName:estadoOnline.user.displayName,
      email:estadoOnline.user.email,
      photoURL:estadoOnline.user.photoURL,
      anonymous:estadoOnline.user.anonymous,
      lastSeen:api.serverTimestamp(),
      deviceId:obterDeviceId()
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

  function listarFichasLocais(){
    let nomes=[];
    try{
      if(typeof fichas!=="undefined"&&Array.isArray(fichas)) nomes=[...fichas];
      else if(Array.isArray(window.fichas)) nomes=[...window.fichas];
    }catch(_erro){}
    if(!nomes.length){
      try{nomes=JSON.parse(localStorage.getItem("ficha_ninja_lista_v1")||'["Principal"]');}catch(_erro){nomes=["Principal"];}
    }
    const vistos=new Set();
    return nomes.map(nome=>{
      const nomeLimpo=typeof window.limparNomeFicha==="function"?window.limparNomeFicha(nome):texto(nome)||"Principal";
      const chave=nomeLimpo==="Principal"?"ficha_ninja_app_v2":`ficha_ninja_app_v2__${nomeLimpo}`;
      let dados={};
      try{dados=JSON.parse(localStorage.getItem(chave)||"{}");}catch(_erro){dados={};}
      dados=garantirMetadadosFichaLocal(nomeLimpo,dados);
      while(vistos.has(dados.__online.sheetId)) dados.__online.sheetId=idAleatorio("sheet");
      vistos.add(dados.__online.sheetId);
      try{
        localStorage.setItem(chave,JSON.stringify(dados));
        const ativa=localStorage.getItem("ficha_ninja_ativa_v1")||"Principal";
        if(nomeLimpo===ativa&&typeof estado!=="undefined") estado.__online=clonar(dados.__online);
      }catch(_erro){}
      return {
        name:nomeLimpo,
        key:chave,
        sheetId:dados.__online.sheetId,
        level:Number(dados.nivel||1),
        characterName:texto(dados.nome)||nomeLimpo,
        data:dados
      };
    });
  }

  function fichaAtualLocal(){
    let atual="";
    try{
      if(typeof fichaAtual!=="undefined") atual=texto(fichaAtual);
      if(!atual) atual=texto(window.fichaAtual);
    }catch(_erro){}
    if(!atual) atual=texto(localStorage.getItem("ficha_ninja_ativa_v1"))||"Principal";
    const locais=listarFichasLocais();
    return locais.find(f=>f.name===atual)||locais[0]||null;
  }

  function limparDadosParaSala(valor,profundidade=0){
    if(valor==null)return valor;
    if(profundidade>6)return null;
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
    await api.set(api.ref(estadoOnline.db,`roomMemberships/${encontrada.roomId}/${estadoOnline.user.uid}`),{
      role:"player",joinedAt:agora(),sheetId:ficha.sheetId
    });
    const resumo=resumoBatalhaDaFicha(ficha);
    const participanteRef=api.ref(estadoOnline.db,`rooms/${encontrada.roomId}/participants/${estadoOnline.user.uid}`);
    const participanteSnap=await api.get(participanteRef);
    const existente=participanteSnap.val();
    if(existente&&existente.ownerUid===estadoOnline.user.uid&&existente.type==="player"){
      /* Um segundo aparelho da mesma conta não pode apagar a iniciativa já
         definida pelo mestre. Atualizamos apenas os dados permitidos. */
      await api.update(participanteRef,{
        sheetId:ficha.sheetId,
        localSheetName:ficha.name,
        displayName:resumo.displayName,
        initiativeBonus:resumo.initiativeBonus,
        battle:resumo,
        updatedAt:agora()
      });
    }else{
      await api.set(participanteRef,{
        id:estadoOnline.user.uid,
        ownerUid:estadoOnline.user.uid,
        type:"player",
        connected:true,
        sheetId:ficha.sheetId,
        localSheetName:ficha.name,
        displayName:resumo.displayName,
        initiativeBonus:resumo.initiativeBonus,
        initiative:null,
        battle:resumo,
        joinedAt:agora(),
        updatedAt:agora()
      });
    }
    salvarJson(CHAVE_SESSAO,{roomId:encontrada.roomId,participantId:estadoOnline.user.uid,role:"player",sheetId:ficha.sheetId,localSheetName:ficha.name,code:encontrada.code});
    await observarSala(encontrada.roomId);
    return encontrada;
  }

  async function removerMinhaPresenca(roomId){
    if(!roomId||!estadoOnline.user||!estadoOnline.api||!estadoOnline.db)return;
    const api=estadoOnline.api,deviceId=obterDeviceId();
    const refPresenca=api.ref(estadoOnline.db,`presence/${roomId}/${estadoOnline.user.uid}/${deviceId}`);
    try{await api.onDisconnect(refPresenca).cancel();}catch(_erro){}
    try{await api.remove(refPresenca);}catch(_erro){}
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
      if(estadoOnline.sala.status&&estadoOnline.sala.status!=="open"){
        emitir("sala-encerrada",snapshot());
        removerMinhaPresenca(roomId).finally(()=>{
          const sessao=lerJson(CHAVE_SESSAO,null);
          limparSessaoLocal();
          emitir("saiu-sala",{roomId,uid:estadoOnline.user?.uid||"",reason:"closed",session:sessao});
        });
        return;
      }
      emitir("sala",snapshot());
      processarEventosXp().catch(()=>{});
    },erro=>{
      const mensagem=erroAmigavel(erro);
      emitir("erro",{mensagem,erro});
      if(["PERMISSION_DENIED","permission-denied"].includes(texto(erro?.code))){
        const sessao=lerJson(CHAVE_SESSAO,null);
        removerMinhaPresenca(roomId).finally(()=>{
          limparSessaoLocal();
          emitir("saiu-sala",{roomId,uid:estadoOnline.user?.uid||"",reason:"permission",session:sessao});
        });
      }
    });
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
    const uidRef=api.ref(estadoOnline.db,`presence/${roomId}/${estadoOnline.user.uid}`);
    const myPresence=api.ref(estadoOnline.db,`presence/${roomId}/${estadoOnline.user.uid}/${deviceId}`);
    estadoOnline.presenceRef=myPresence;
    estadoOnline.unsubscribeConnected=api.onValue(connectedRef,async snap=>{
      if(snap.val()!==true) return;
      try{
        /* Remove o formato antigo de presença por usuário. A partir desta
           versão cada aparelho possui seu próprio nó, evitando que fechar o
           celular marque o tablet como desconectado. */
        await api.update(uidRef,{connected:null,lastSeen:null,deviceId:null,participantId:null}).catch(()=>{});
        await api.onDisconnect(myPresence).set({connected:false,lastSeen:api.serverTimestamp(),participantId:lerJson(CHAVE_SESSAO,{})?.participantId||""});
        await api.set(myPresence,{connected:true,lastSeen:api.serverTimestamp(),participantId:lerJson(CHAVE_SESSAO,{})?.participantId||""});
      }catch(_erro){}
    });
  }

  function limparSessaoLocal(){
    localStorage.removeItem(CHAVE_SESSAO);
    estadoOnline.unsubscribeSala?.();estadoOnline.unsubscribeSala=null;
    estadoOnline.unsubscribePresenca?.();estadoOnline.unsubscribePresenca=null;
    estadoOnline.unsubscribeEventos?.();estadoOnline.unsubscribeEventos=null;
    estadoOnline.unsubscribeConnected?.();estadoOnline.unsubscribeConnected=null;
    estadoOnline.presenceRef=null;
    estadoOnline.salaId=null;estadoOnline.sala=null;estadoOnline.presencas={};
    emitir("sala",snapshot());
  }

  async function sairDaSala({silencioso=false}={}){
    const sessao=lerJson(CHAVE_SESSAO,null);
    if(!sessao?.roomId||!estadoOnline.user){limparSessaoLocal();return;}
    const api=estadoOnline.api;
    const roomId=sessao.roomId,uid=estadoOnline.user.uid,deviceId=obterDeviceId();
    try{
      const devicePresence=api.ref(estadoOnline.db,`presence/${roomId}/${uid}/${deviceId}`);
      await api.onDisconnect(devicePresence).cancel().catch(()=>{});
      await api.remove(devicePresence).catch(()=>{});

      if(sessao.role==="player"){
        const presencasSnap=await api.get(api.ref(estadoOnline.db,`presence/${roomId}/${uid}`)).catch(()=>null);
        const presencas=presencasSnap?.val()||{};
        const outroAparelhoAtivo=Object.values(presencas).some(item=>item&&typeof item==="object"&&item.connected===true);
        if(!outroAparelhoAtivo){
          const efeitosSnap=await api.get(api.ref(estadoOnline.db,`rooms/${roomId}/effects`)).catch(()=>null);
          const updates={};
          Object.entries(efeitosSnap?.val()||{}).forEach(([id,efeito])=>{
            if(efeito?.ownerUid===uid&&efeito?.status==="active"){
              updates[`rooms/${roomId}/effects/${id}/status`]="ended";
              updates[`rooms/${roomId}/effects/${id}/endedAt`]=agora();
            }
          });
          if(Object.keys(updates).length) await api.update(api.ref(estadoOnline.db),updates).catch(()=>{});
          await api.remove(api.ref(estadoOnline.db,`rooms/${roomId}/participants/${uid}`));
          await api.remove(api.ref(estadoOnline.db,`roomMemberships/${roomId}/${uid}`));
        }
      }else if(sessao.role==="master"){
        await api.remove(api.ref(estadoOnline.db,`roomMemberships/${roomId}/${uid}`)).catch(()=>{});
      }
    }catch(erro){if(!silencioso) throw erro;}
    limparSessaoLocal();
    emitir("saiu-sala",{roomId,uid});
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
    Object.entries(room.effects||{}).forEach(([id,efeito])=>{
      if(efeito?.status==="active"){
        updates[`rooms/${room.id}/effects/${id}/status`]="ended";
        updates[`rooms/${room.id}/effects/${id}/endedAt`]=agora();
      }
    });
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
    const api=estadoOnline.api,roomId=estadoOnline.salaId;
    const participante=participantes()[participantId];
    const updates={};
    updates[`rooms/${roomId}/participants/${participantId}`]=null;
    const efeitos=estadoOnline.sala?.effects||{};
    Object.entries(efeitos).forEach(([id,e])=>{if(e.participantId===participantId) updates[`rooms/${roomId}/effects/${id}`]=null;});
    const ordemAntiga=normalizarOrdem();
    const indiceAntigo=Math.max(0,Number(estadoOnline.sala?.combat?.turnIndex||0));
    const atualId=ordemAntiga[indiceAntigo]||"";
    const novaOrdem=ordemAntiga.filter(id=>id!==participantId);
    let novoIndice=0;
    if(novaOrdem.length){
      if(atualId&&atualId!==participantId&&novaOrdem.includes(atualId)) novoIndice=novaOrdem.indexOf(atualId);
      else novoIndice=Math.min(indiceAntigo,novaOrdem.length-1);
    }
    updates[`rooms/${roomId}/combat/order`]=novaOrdem;
    updates[`rooms/${roomId}/combat/turnIndex`]=novoIndice;
    if(!novaOrdem.length) updates[`rooms/${roomId}/combat/started`]=false;
    if(participante?.type==="player"&&participante.ownerUid){
      updates[`roomMemberships/${roomId}/${participante.ownerUid}`]=null;
    }
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
    const combat=estadoOnline.sala?.combat||{};
    const ordemAnterior=normalizarOrdem();
    const atualId=combat.started?ordemAnterior[Math.max(0,Number(combat.turnIndex||0))]:"";
    const ordem=Object.values(participantes()).sort((a,b)=>{
      const ia=Number.isFinite(Number(a.initiative))?Number(a.initiative):-999;
      const ib=Number.isFinite(Number(b.initiative))?Number(b.initiative):-999;
      if(ib!==ia)return ib-ia;
      return Number(b.initiativeBonus||0)-Number(a.initiativeBonus||0);
    }).map(p=>p.id);
    const turnIndex=combat.started&&atualId&&ordem.includes(atualId)?ordem.indexOf(atualId):0;
    const round=combat.started?Math.max(1,Number(combat.round||1)):1;
    await estadoOnline.api.update(estadoOnline.api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/combat`),{order:ordem,turnIndex,round});
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
    if(direcao>0) await atualizarEfeitosDaSala(combat.round,combat.turnIndex,combat.order||[]);
    return combat;
  }
  const avancarTurno=()=>alterarTurno(1);
  const voltarTurno=()=>alterarTurno(-1);

  function analisarDuracaoRodadas(valor){
    const original=texto(valor);
    const normal=original.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();
    if(!normal) return {rounds:null,timed:false,manual:true,original:"Até ser encerrado"};

    const limitar=n=>Math.min(525600,Math.max(1,Math.ceil(Number(n)||1)));
    const dado=normal.match(/(\d+)\s*d\s*(\d+)(?:\s*([+-])\s*(\d+))?/);
    if(dado){
      const qtd=Math.max(1,Number(dado[1])),faces=Math.max(1,Number(dado[2]));let total=0;
      for(let i=0;i<qtd;i+=1) total+=1+Math.floor(Math.random()*faces);
      const ajuste=Number(dado[4]||0)*(dado[3]==="-"?-1:1);
      total=Math.max(1,total+ajuste);
      if(/(?:min(?:uto)?s?\b)/.test(normal)) total*=10;
      else if(/(?:horas?|\d\s*h\b)/.test(normal)) total*=600;
      else if(/(?:dias?\b)/.test(normal)) total*=14400;
      else if(/(?:seg(?:undo)?s?\b)/.test(normal)&&!/(?:turn|rodad)/.test(normal)) total=Math.ceil(total/6);
      return {rounds:limitar(total),timed:true,rolled:true,original};
    }

    const obterNumero=regex=>{
      const achado=normal.match(regex);
      if(!achado)return NaN;
      return Number(String(achado[1]).replace(",","."));
    };
    /* Formas em turnos e rodadas prevalecem quando a descrição também traz
       segundos entre parênteses. */
    let numero=obterNumero(/(\d+(?:[.,]\d+)?)\s*(?:turnos?|rodadas?|turn\.?|rod\.?)(?:\b|$)/);
    if(Number.isFinite(numero)&&numero>0)return {rounds:limitar(numero),timed:true,original};
    numero=obterNumero(/(\d+(?:[.,]\d+)?)\s*(?:minutos?|mins?|min\.?)(?:\b|$)/);
    if(Number.isFinite(numero)&&numero>0)return {rounds:limitar(numero*10),timed:true,original};
    numero=obterNumero(/(\d+(?:[.,]\d+)?)\s*(?:segundos?|segs?|seg\.?|s)(?:\b|$)/);
    if(Number.isFinite(numero)&&numero>0)return {rounds:limitar(numero/6),timed:true,original};
    numero=obterNumero(/(\d+(?:[.,]\d+)?)\s*(?:horas?|hrs?|hr\.?|h)(?:\b|$)/);
    if(Number.isFinite(numero)&&numero>0)return {rounds:limitar(numero*600),timed:true,original};
    numero=obterNumero(/(\d+(?:[.,]\d+)?)\s*dias?(?:\b|$)/);
    if(Number.isFinite(numero)&&numero>0)return {rounds:limitar(numero*14400),timed:true,original};

    if(/proximo turno|próximo turno|inicio do proximo turno|final do proximo turno|fim do proximo turno|final do turno|fim do turno/.test(normal)){
      return {rounds:1,timed:true,semantic:true,original};
    }

    if(/instant/.test(normal)&&!/(enquanto|terreno dificil|penalidade|reducao|efeito)/.test(normal)) return null;
    if(/instant/.test(normal)&&/(enquanto|terreno dificil|efeito)/.test(normal)){
      return {rounds:null,timed:false,manual:true,original};
    }
    if(/indefin|ate ser encerr|manual|concentr|enquanto|ate o chakra|fim do combate|ate sair|ate sofrer|ate ser destr|ate ser deton|ate completar|ate o efeito|proximo ataque|conforme o jutsu|x turnos?/.test(normal)){
      return {rounds:null,timed:false,manual:true,original};
    }
    /* Efeitos persistentes com texto não reconhecido continuam visíveis para
       o mestre e precisam ser encerrados manualmente. */
    return {rounds:null,timed:false,manual:true,original};
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
        polarity:(()=>{const v=texto(bruto.polarity??bruto.polaridade??"neutro").toLowerCase();return ["buff","debuff","custo","neutro"].includes(v)?v:"neutro";})(),
        appliesTo:texto(bruto.appliesTo??bruto.aplicaEm??"usuario").slice(0,40),
        target:texto(bruto.target??bruto.alvo??"efeito").slice(0,60),
        operation:texto(bruto.operation??bruto.operacao??"").slice(0,30),
        value:valorMecanico,
        text:texto(bruto.text??bruto.texto??"").slice(0,220)
      };
    });
  }

  async function adicionarEfeito({participantId,name,duration,source="manual",ownerUid,summary="",details=[],localEffectId="",effectId="",startRound=null,startTurnIndex=null,resolvedRounds=null,durationTimed=null,durationOriginal=""}){
    exigirUsuario();
    const api=estadoOnline.api,roomId=estadoOnline.salaId;
    if(!roomId) throw new Error("Nenhuma sala ativa.");
    let participante=participantes()[participantId];
    if(!participante){
      const snap=await api.get(api.ref(estadoOnline.db,`rooms/${roomId}/participants/${participantId}`));
      participante=snap.val();
    }
    if(!participante) throw new Error("Participante não encontrado.");
    const ehMestre=estadoOnline.sala?.masterUid===estadoOnline.user.uid;
    if(!ehMestre&&participante.ownerUid!==estadoOnline.user.uid) throw new Error("Você só pode publicar efeitos da sua própria ficha.");
    const regra=durationTimed===false
      ?{rounds:null,timed:false,manual:true,original:texto(durationOriginal)||texto(duration)||"Até ser encerrado"}
      :Number.isFinite(Number(resolvedRounds))
        ?{rounds:Math.min(525600,Math.max(1,Math.ceil(Number(resolvedRounds)))),timed:true,original:texto(durationOriginal)||texto(duration)||`${Math.max(1,Math.ceil(Number(resolvedRounds)))} rodadas`}
        :typeof duration==="number"
          ?{rounds:Math.min(525600,Math.max(1,Math.ceil(Number(duration)||1))),timed:true,original:texto(durationOriginal)||`${Math.max(1,Math.ceil(Number(duration)||1))} rodadas`}
          :analisarDuracaoRodadas(duration);
    if(!regra) return null;
    const combat=estadoOnline.sala?.combat||{};
    const round=Math.max(1,Number(startRound??combat.round??1));
    const ordem=normalizarOrdem();
    const indicePadrao=combat.started&&ordem.length?Math.min(Math.max(0,Number(combat.turnIndex||0)),ordem.length-1):0;
    const turnIndex=Math.min(Math.max(0,Number(startTurnIndex??indicePadrao)),Math.max(0,ordem.length-1));
    const turnParticipantId=texto(ordem[turnIndex]||"");
    const idSeguro=texto(effectId).replace(/[.#$\[\]\/]/g,"_").slice(0,180);
    const id=idSeguro||idAleatorio("effect");
    const refEfeito=api.ref(estadoOnline.db,`rooms/${roomId}/effects/${id}`);
    const existenteSnap=await api.get(refEfeito).catch(()=>null);
    const existente=existenteSnap?.val();
    if(existente&&existente.ownerUid===(ownerUid||participante.ownerUid||estadoOnline.user.uid)&&existente.participantId===participantId){
      return {id,...existente};
    }
    const detalhes=normalizarDetalhesEfeito(details);
    const timed=regra.timed!==false&&Number.isFinite(Number(regra.rounds));
    const rounds=timed?Math.min(525600,Math.max(1,Math.ceil(Number(regra.rounds)))):null;
    const efeito={
      id,participantId,ownerUid:ownerUid||participante.ownerUid||estadoOnline.user.uid,
      name:(texto(name)||"Efeito").slice(0,120),source:texto(source).slice(0,140),
      summary:texto(summary).slice(0,500),details:detalhes,
      localEffectId:texto(localEffectId).slice(0,160),
      durationOriginal:regra.original||texto(duration)||"Até ser encerrado",timed,
      totalRounds:rounds,
      startRound:round,startTurnIndex:turnIndex,startTurnParticipantId:turnParticipantId,
      expiresAtRound:timed?round+rounds:null,expiresAtTurnIndex:timed?turnIndex:null,
      expiresAtParticipantId:timed?turnParticipantId:"",
      status:"active",createdAt:agora()
    };
    try{
      await api.set(refEfeito,efeito);
    }catch(erro){
      /* Se a gravação chegou ao Firebase mas a resposta se perdeu, a nova
         tentativa encontra o mesmo ID determinístico e não duplica o buff. */
      const confirmado=await api.get(refEfeito).catch(()=>null);
      const remoto=confirmado?.val();
      if(remoto&&remoto.ownerUid===efeito.ownerUid&&remoto.participantId===participante.id) return {id,...remoto};
      throw erro;
    }
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
    if(!efeito||efeito.status!=="active") return;
    const ehMestre=estadoOnline.sala?.masterUid===estadoOnline.user.uid;
    if(!ehMestre&&efeito.ownerUid!==estadoOnline.user.uid) throw new Error("Você não pode encerrar este efeito.");
    await estadoOnline.api.update(refEfeito,{status:"ended",endedAt:agora()});
  }

  async function atualizarEfeitosDaSala(round,turnIndex=0,ordemAtual=[]){
    exigirMestre();
    const api=estadoOnline.api,updates={};
    /* Lê os efeitos diretamente do banco depois da troca de turno. Isso evita
       perder um buff recém-publicado pelo jogador por causa de um snapshot
       local que ainda não chegou ao aparelho do mestre. */
    const snapshotEfeitos=await api.get(api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/effects`));
    const efeitos=snapshotEfeitos.val()||{};
    const rodadaAtual=Math.max(1,Number(round||1));
    const indiceAtual=Math.max(0,Number(turnIndex||0));
    const ordem=Array.isArray(ordemAtual)?ordemAtual:Object.values(ordemAtual||{});
    Object.entries(efeitos).forEach(([id,e])=>{
      if(e?.timed===false||!Number.isFinite(Number(e?.expiresAtRound))) return;
      const rodadaFim=Math.max(1,Number(e.expiresAtRound||1));
      const participanteFim=texto(e.expiresAtParticipantId||e.startTurnParticipantId);
      const indiceParticipante=participanteFim?ordem.indexOf(participanteFim):-1;
      const indiceFim=Math.max(0,indiceParticipante>=0?indiceParticipante:Number(e.expiresAtTurnIndex??e.startTurnIndex??0));
      const chegouAoFim=rodadaAtual>rodadaFim||(rodadaAtual===rodadaFim&&indiceAtual>=indiceFim);
      if(e.status==="active"&&chegouAoFim){
        updates[`rooms/${estadoOnline.salaId}/effects/${id}/status`]="expired";
        updates[`rooms/${estadoOnline.salaId}/effects/${id}/endedAt`]=agora();
        updates[`rooms/${estadoOnline.salaId}/effects/${id}/endedAtRound`]=rodadaAtual;
        updates[`rooms/${estadoOnline.salaId}/effects/${id}/endedAtTurnIndex`]=indiceAtual;
      }
    });
    if(Object.keys(updates).length) await api.update(api.ref(estadoOnline.db),updates);
    podarHistoricoSala().catch(()=>{});
  }

  async function podarHistoricoSala({forcar=false}={}){
    const roomId=estadoOnline.salaId,room=estadoOnline.sala;
    if(!roomId||!room||room.masterUid!==estadoOnline.user?.uid||estadoOnline.limpandoHistorico)return;
    const totalEventos=Object.keys(room.events||{}).length;
    const totalEfeitos=Object.keys(room.effects||{}).length;
    estadoOnline.operacoesDesdeLimpeza+=1;
    if(!forcar&&estadoOnline.operacoesDesdeLimpeza<20&&totalEventos<=260&&totalEfeitos<=140)return;
    estadoOnline.operacoesDesdeLimpeza=0;
    estadoOnline.limpandoHistorico=true;
    try{
      const api=estadoOnline.api;
      const [eventosSnap,acksSnap,efeitosSnap]=await Promise.all([
        api.get(api.ref(estadoOnline.db,`rooms/${roomId}/events`)),
        api.get(api.ref(estadoOnline.db,`rooms/${roomId}/eventAcks`)),
        api.get(api.ref(estadoOnline.db,`rooms/${roomId}/effects`))
      ]);
      const eventos=eventosSnap.val()||{},acks=acksSnap.val()||{},efeitos=efeitosSnap.val()||{};
      const updates={};
      const ordenados=Object.entries(eventos).sort((a,b)=>Number(b[1]?.createdAt||0)-Number(a[1]?.createdAt||0));
      let mantidos=0;
      for(const [id,evento] of ordenados){
        const ehXp=evento?.type==="XP_GRANTED";
        const alvo=texto(evento?.payload?.targetUid);
        const confirmado=!ehXp||Boolean(alvo&&acks?.[id]?.[alvo]);
        if(mantidos<220||!confirmado){mantidos+=1;continue;}
        updates[`rooms/${roomId}/events/${id}`]=null;
        if(acks[id])updates[`rooms/${roomId}/eventAcks/${id}`]=null;
      }
      const inativos=Object.entries(efeitos)
        .filter(([,efeito])=>efeito?.status&&efeito.status!=="active")
        .sort((a,b)=>Number(b[1]?.endedAt||b[1]?.createdAt||0)-Number(a[1]?.endedAt||a[1]?.createdAt||0));
      inativos.slice(100).forEach(([id])=>{updates[`rooms/${roomId}/effects/${id}`]=null;});
      if(Object.keys(updates).length)await api.update(api.ref(estadoOnline.db),updates);
    }catch(_erro){
      /* Limpeza é preventiva e nunca pode interromper turno, XP ou efeito. */
    }finally{estadoOnline.limpandoHistorico=false;}
  }

  async function registrarEvento(type,payload={}){
    if(!estadoOnline.salaId||!estadoOnline.user) return null;
    const api=estadoOnline.api,refEvento=api.push(api.ref(estadoOnline.db,`rooms/${estadoOnline.salaId}/events`));
    await api.set(refEvento,{id:refEvento.key,type,payload,createdBy:estadoOnline.user.uid,createdAt:agora()});
    podarHistoricoSala().catch(()=>{});
    return refEvento.key;
  }

  function parseXpAtual(valor){
    const bruto=texto(valor);
    const inteiro=parte=>{
      const limpo=texto(parte).replace(/\s/g,"").replace(/[.,](?=\d{3}(?:\D|$))/g,"").replace(/[^0-9-]/g,"");
      return Math.max(0,Number(limpo)||0);
    };
    const partes=bruto.split("/");
    return {current:inteiro(partes[0]),max:Math.max(1,inteiro(partes[1])||355000)};
  }
  function formatarXp(current,max){return `${Math.max(0,Math.trunc(current))}/${Math.max(0,Math.trunc(max||355000))}`;}

  async function concederXp({participantIds,amount,reason=""}){
    exigirMestre();
    const valor=Math.trunc(Number(amount));
    if(!Number.isFinite(valor)||valor===0) throw new Error("Informe uma quantidade de XP diferente de zero.");
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
    podarHistoricoSala().catch(()=>{});
  }

  function observarEventos(roomId){
    const api=estadoOnline.api;
    estadoOnline.unsubscribeEventos?.();
    const consulta=api.query(api.ref(estadoOnline.db,`rooms/${roomId}/events`),api.orderByChild("createdAt"),api.limitToLast(100));
    estadoOnline.unsubscribeEventos=api.onValue(consulta,()=>processarEventosXp().catch(()=>{}));
  }

  async function processarEventosXp(){
    if(estadoOnline.processandoXp){estadoOnline.xpPendente=true;return;}
    const room=estadoOnline.sala,user=estadoOnline.user;
    if(!room||!user) return;
    estadoOnline.processandoXp=true;
    try{
      const processados=lerJson(CHAVE_XP_PROCESSADO,{})||{};
      const eventos=Object.values(room.events||{})
        .filter(e=>e.type==="XP_GRANTED"&&e.payload?.targetUid===user.uid)
        .sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));

      for(const evento of eventos){
        const sheetId=texto(evento.payload?.sheetId);
        const nome=texto(evento.payload?.localSheetName);
        const fichasLocais=listarFichasLocais();
        /* Eventos novos sempre apontam para o ID estável da ficha. O nome só é
           usado como compatibilidade com eventos antigos, evitando aplicar XP
           numa ficha diferente que por acaso tenha o mesmo nome. */
        const ficha=sheetId
          ?fichasLocais.find(f=>f.sheetId===sheetId)
          :fichasLocais.find(f=>f.name===nome);
        if(!ficha) continue;

        const dados=clonar(ficha.data);
        dados.__online=dados.__online&&typeof dados.__online==="object"?dados.__online:{};
        const aplicados=dados.__online.appliedXpEvents&&typeof dados.__online.appliedXpEvents==="object"
          ?dados.__online.appliedXpEvents:{};
        const confirmadoNaSala=Boolean(room.eventAcks?.[evento.id]?.[user.uid]);
        if(confirmadoNaSala&&(aplicados[evento.id]||processados[evento.id])) continue;

        if(!aplicados[evento.id]&&!processados[evento.id]){
          const xp=parseXpAtual(dados.xp),antes=xp.current;
          dados.xp=formatarXp(Math.max(0,xp.current+Number(evento.payload.amount||0)),xp.max);
          aplicados[evento.id]=agora();
          /* Mantém somente os eventos mais recentes para a ficha não crescer
             indefinidamente. A identificação fica na própria ficha e viaja no
             backup, impedindo XP duplicado ao abrir em outro aparelho. */
          const recentes=Object.entries(aplicados).sort((a,b)=>Number(b[1])-Number(a[1])).slice(0,80);
          dados.__online.appliedXpEvents=Object.fromEntries(recentes);
          dados.__online.lastXpEvent=evento.id;
          localStorage.setItem(ficha.key,JSON.stringify(dados));

          if(ficha.name===fichaAtualLocal()?.name){
            try{estado=dados;CHAVE=ficha.key;carregar();atualizarPerfil();}catch(_erro){}
          }
          emitir("xp-recebido",{
            amount:Number(evento.payload.amount||0),before:antes,after:parseXpAtual(dados.xp).current,
            reason:evento.payload.reason,character:texto(dados.nome)||ficha.characterName
          });
        }

        /* Primeiro confirma a ficha na nuvem e só depois registra o ACK da sala.
           Assim, outro aparelho não considera o evento concluído antes de o novo
           total de XP estar protegido no backup. */
        const sincronizada=await sincronizarFicha(ficha.name,{force:false,backup:false,motivo:"xp"});
        if(sincronizada?.conflict) continue;
        processados[evento.id]=agora();
        const recentesProcessados=Object.entries(processados).sort((a,b)=>Number(b[1])-Number(a[1])).slice(0,200);
        salvarJson(CHAVE_XP_PROCESSADO,Object.fromEntries(recentesProcessados));
        if(!confirmadoNaSala){
          await estadoOnline.api.set(
            estadoOnline.api.ref(estadoOnline.db,`rooms/${room.id}/eventAcks/${evento.id}/${user.uid}`),
            agora()
          ).catch(()=>{});
        }
      }
    }finally{
      estadoOnline.processandoXp=false;
      if(estadoOnline.xpPendente){
        estadoOnline.xpPendente=false;
        setTimeout(()=>processarEventosXp().catch(()=>{}),0);
      }
    }
  }

  function estadoSync(){return lerJson(CHAVE_SYNC,{})||{};}
  function gravarEstadoSync(v){salvarJson(CHAVE_SYNC,v);}

  function atualizarMetaSync(sheetId,cloud,dataHash){
    const sync=estadoSync();
    sync[sheetId]={
      revision:Number(cloud?.revision||0),
      lastHash:texto(cloud?.hash)||dataHash||"",
      lastSyncedAt:Number(cloud?.updatedAt||agora()),
      deviceId:texto(cloud?.deviceId)
    };
    gravarEstadoSync(sync);
  }

  function aplicarFichaDaNuvemNoLocal(sheetId,cloud,local){
    if(!local||!cloud) return false;
    const data=clonar(cloud.data||{});
    data.__online=data.__online&&typeof data.__online==="object"?data.__online:{};
    data.__online.sheetId=sheetId;
    /* O nome local é preservado para não quebrar a chave usada pelo aplicativo.
       O conteúdo da ficha, incluindo XP, inventário e jutsus, vem da nuvem. */
    data.__online.name=local.name;
    localStorage.setItem(local.key,JSON.stringify(data));
    const hash=texto(cloud.hash)||hashFicha(data);
    atualizarMetaSync(sheetId,cloud,hash);
    const ativa=fichaAtualLocal()?.sheetId===sheetId;
    emitir("ficha-atualizada-nuvem",{
      sheetId,
      name:local.name,
      characterName:texto(data.nome)||local.characterName||local.name,
      revision:Number(cloud.revision||0),
      active:ativa
    });
    return true;
  }

  function processarAtualizacoesNuvem(valor){
    if(!estadoOnline.user||estadoOnline.user.anonymous) return;
    const locais=listarFichasLocais();
    const sync=estadoSync();
    Object.entries(valor||{}).forEach(([sheetId,cloud])=>{
      const local=locais.find(f=>f.sheetId===sheetId);
      if(!local) return; // Primeiro vínculo no aparelho continua sendo uma ação explícita.

      const meta=sync[sheetId]||{};
      const cloudRevision=Number(cloud?.revision||0);
      const localRevision=Number(meta.revision||0);
      if(cloudRevision<=localRevision) return;

      const localHash=hashFicha(local.data||{});
      const cloudHash=texto(cloud?.hash)||hashFicha(cloud?.data||{});

      /* Se o snapshot é a confirmação do próprio envio, apenas atualiza a revisão.
         Isso evita falso conflito enquanto a transação do Firebase termina. */
      if(localHash===cloudHash||texto(cloud?.deviceId)===obterDeviceId()){
        atualizarMetaSync(sheetId,cloud,cloudHash);
        return;
      }

      const baseHash=texto(meta.lastHash);
      const localFoiAlterado=Boolean(baseHash&&localHash!==baseHash);
      if(localFoiAlterado){
        emitir("conflito-ficha",{sheetId,local,cloud});
        return;
      }

      aplicarFichaDaNuvemNoLocal(sheetId,cloud,local);
    });
  }

  function observarFichasNuvem(){
    if(!estadoOnline.user||estadoOnline.user.anonymous){
      estadoOnline.unsubscribeFichas?.();estadoOnline.unsubscribeFichas=null;
      estadoOnline.fichasNuvem=[];
      return;
    }
    estadoOnline.unsubscribeFichas?.();
    const api=estadoOnline.api;
    estadoOnline.unsubscribeFichas=api.onValue(api.ref(estadoOnline.db,`userSheets/${estadoOnline.user.uid}`),snap=>{
      const valor=snap.val()||{};
      estadoOnline.fichasNuvem=Object.entries(valor).map(([id,f])=>({
        id,...f,data:undefined,
        linked:listarFichasLocais().some(local=>local.sheetId===id)
      })).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
      try{processarAtualizacoesNuvem(valor);}catch(erro){emitir("erro-sync",{mensagem:erroAmigavel(erro),erro});}
      emitir("fichas-nuvem",snapshot());
    });
  }

  async function sincronizarFicha(localSheetName,{force=false,backup=false,motivo="autosave"}={}){
    exigirUsuario();
    if(estadoOnline.user.anonymous) throw new Error("Entre com Google para sincronizar fichas entre aparelhos.");
    const ficha=listarFichasLocais().find(f=>f.name===localSheetName)||fichaAtualLocal();
    if(!ficha) throw new Error("Ficha local não encontrada.");
    const api=estadoOnline.api,uid=estadoOnline.user.uid,sheetId=ficha.sheetId;
    const sync=estadoSync(),meta=sync[sheetId]||{};
    const data=garantirMetadadosFichaLocal(ficha.name,ficha.data);
    const conteudoHash=hashFicha(data);
    if(!force&&meta.lastHash===conteudoHash) return {skipped:true};
    const refFicha=api.ref(estadoOnline.db,`userSheets/${uid}/${sheetId}`);
    let conflito=null;
    const resultado=await api.runTransaction(refFicha,atual=>{
      const cloudRevision=Number(atual?.revision||0);
      const baseRevision=Number(meta.revision||0);
      if(!force&&atual&&cloudRevision>baseRevision&&atual.hash!==meta.lastHash){
        conflito={cloudRevision,baseRevision,cloud:atual};
        return;
      }
      const revision=Math.max(cloudRevision,baseRevision)+1;
      return {
        name:ficha.name,characterName:texto(data.nome)||ficha.name,revision,updatedAt:agora(),
        deviceId:obterDeviceId(),hash:conteudoHash,appVersion:window.APP_VERSION||"",data
      };
    },{applyLocally:false});
    if(!resultado.committed){
      if(conflito){emitir("conflito-ficha",{sheetId,local:ficha,cloud:conflito.cloud});return {conflict:true,...conflito};}
      throw new Error("A sincronização da ficha não foi concluída.");
    }
    const salvo=resultado.snapshot.val();
    sync[sheetId]={revision:salvo.revision,lastHash:salvo.hash,lastSyncedAt:salvo.updatedAt,deviceId:salvo.deviceId};
    gravarEstadoSync(sync);
    if(backup) await criarBackupFicha(ficha,{reason:motivo,revision:salvo.revision});
    emitir("ficha-sincronizada",{sheetId,name:ficha.name,revision:salvo.revision});
    return {ok:true,revision:salvo.revision};
  }

  async function criarBackupFicha(ficha,{reason="manual",revision=0}={}){
    exigirUsuario();
    if(estadoOnline.user.anonymous) throw new Error("Entre com Google para criar backups na nuvem.");
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
    exigirUsuario();
    const resultados=[];
    for(const ficha of listarFichasLocais()){
      resultados.push(await sincronizarFicha(ficha.name,{force:false,backup:false,motivo:"sincronizacao-geral"}));
    }
    return resultados;
  }

  async function restaurarFichaDaNuvem(sheetId,{asCopy=false}={}){
    exigirUsuario();
    if(estadoOnline.user.anonymous) throw new Error("Entre com Google para baixar fichas da nuvem.");
    const api=estadoOnline.api;
    const snap=await api.get(api.ref(estadoOnline.db,`userSheets/${estadoOnline.user.uid}/${sheetId}`));
    if(!snap.exists()) throw new Error("Backup da nuvem não encontrado.");
    const cloud=snap.val(),data=clonar(cloud.data||{});
    let nome=texto(cloud.name)||texto(cloud.characterName)||"Ficha restaurada";
    const locais=listarFichasLocais();
    if(asCopy||locais.some(f=>f.name===nome&&f.sheetId!==sheetId)){
      let base=`${nome} Nuvem`,n=2,candidato=base;
      while(locais.some(f=>f.name===candidato)){candidato=`${base} ${n++}`;}
      nome=candidato;
      data.__online=data.__online||{};
      data.__online.sheetId=asCopy?idAleatorio("sheet"):sheetId;
    }
    data.__online=data.__online&&typeof data.__online==="object"?data.__online:{};
    const idFinal=texto(data.__online.sheetId)||sheetId;
    data.__online.sheetId=idFinal;
    data.__online.name=nome;
    const chave=nome==="Principal"?"ficha_ninja_app_v2":`ficha_ninja_app_v2__${nome}`;
    localStorage.setItem(chave,JSON.stringify(data));
    const lista=Array.from(new Set([...locais.map(f=>f.name),nome]));
    localStorage.setItem("ficha_ninja_lista_v1",JSON.stringify(lista));
    const sync=estadoSync();
    sync[idFinal]={
      revision:Number(cloud.revision||0),lastHash:texto(cloud.hash)||hashFicha(data),
      lastSyncedAt:Number(cloud.updatedAt||agora()),deviceId:texto(cloud.deviceId)
    };
    gravarEstadoSync(sync);
    emitir("ficha-restaurada",{name:nome,sheetId:idFinal});
    return nome;
  }

  async function resolverConflito(sheetId,acao){
    exigirUsuario();
    const local=listarFichasLocais().find(f=>f.sheetId===sheetId);
    if(acao==="nuvem") return restaurarFichaDaNuvem(sheetId,{asCopy:false});
    if(acao==="copia") return restaurarFichaDaNuvem(sheetId,{asCopy:true});
    if(acao==="local"&&local) return sincronizarFicha(local.name,{force:true,backup:true,motivo:"conflito-local"});
    throw new Error("Escolha de conflito inválida.");
  }

  function agendarSincronizacaoFicha(localSheetName,{imediata=false,motivo="autosave"}={}){
    if(!estadoOnline.user||estadoOnline.user.anonymous||!estadoOnline.configurado) return;
    clearTimeout(estadoOnline.syncTimer);
    estadoOnline.syncTimer=setTimeout(()=>sincronizarFicha(localSheetName,{motivo}).catch(erro=>emitir("erro-sync",{mensagem:erroAmigavel(erro),erro})),imediata?40:1800);
  }

  function limparObservadoresConta(){
    estadoOnline.unsubscribeCampanhas?.();estadoOnline.unsubscribeCampanhas=null;
    estadoOnline.unsubscribeFichas?.();estadoOnline.unsubscribeFichas=null;
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
    entrarAnonimo,entrarGoogle,sair,criarCampanha,criarSala,buscarSalaPorCodigo,entrarSala,observarSala,
    sairDaSala,encerrarSala,listarFichasLocais,fichaAtualLocal,resumoBatalhaDaFicha,
    importarFichaComoNpc,criarNpcRapido,atualizarMeuParticipante,atualizarParticipante,removerParticipante,definirIniciativa,
    ordenarIniciativa,iniciarCombate,avancarTurno,voltarTurno,normalizarOrdem,analisarDuracaoRodadas,
    adicionarEfeito,encerrarEfeito,concederXp,registrarEvento,sincronizarFicha,sincronizarTodasFichas,
    restaurarFichaDaNuvem,resolverConflito,agendarSincronizacaoFicha,linkDaSala,codigoDaUrl,erroAmigavel,
    parseXpAtual,formatarXp
  };

  document.addEventListener("DOMContentLoaded",()=>{
    iniciar().catch(()=>{});
    const codigo=codigoDaUrl();
    if(codigo) emitir("convite-url",{code:codigo});
  });
})();
