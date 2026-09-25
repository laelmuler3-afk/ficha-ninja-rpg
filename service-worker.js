/* Ficha Ninja RPG 2.5.8.105 — proteção de backups históricos e coorte PWA.
 * Mantém cache versionado e estratégia de atualização multi-dispositivo.
 */
const APP_VERSION = "2.5.8.105";
const CACHE_PREFIX = "shinobi";
const SHELL_CACHE = `${CACHE_PREFIX}-shell-${APP_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${APP_VERSION}`;
const FIREBASE_CACHE = `${CACHE_PREFIX}-firebase-${APP_VERSION}`;
const LIMITE_DOWNLOADS_SIMULTANEOS = 1;
const CACHE_VERSOES_RETIDAS = 6;

const FIREBASE_VERSION = "12.16.0";
const FIREBASE_GSTATIC_BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
const FIREBASE_JSDELIVR_BASE = `https://cdn.jsdelivr.net/npm/firebase@${FIREBASE_VERSION}`;
const FIREBASE_FILES = [
  "firebase-app-compat.js",
  "firebase-auth-compat.js",
  "firebase-database-compat.js"
];
const FIREBASE_URLS = FIREBASE_FILES.flatMap(nome=>[
  `${FIREBASE_GSTATIC_BASE}/${nome}`,
  `${FIREBASE_JSDELIVR_BASE}/${nome}`
]);

const APP_SHELL = [
  `./index.html?v=${APP_VERSION}`,
  `./manifest.json?v=${APP_VERSION}`,
  `./css/app.css?v=${APP_VERSION}`,
  `./css/carteira-v233.css?v=${APP_VERSION}`,
  `./css/update.css?v=${APP_VERSION}`,
  `./css/catalogo.css?v=${APP_VERSION}`,
  `./css/regras-natureza.css?v=${APP_VERSION}`,
  `./css/batalha-viva.css?v=${APP_VERSION}`,
  `./css/level-up.css?v=${APP_VERSION}`,
  `./css/pericias.css?v=${APP_VERSION}`,
  `./css/online.css?v=${APP_VERSION}`,
  `./css/organizacao-retratil.css?v=${APP_VERSION}`,
  `./css/shinobi-theme.css?v=${APP_VERSION}`,
  `./css/design-system-eko.css?v=${APP_VERSION}`,
  `./css/perfil-home.css?v=${APP_VERSION}`,
  `./css/cabecalho-navegacao-passo3.css?v=${APP_VERSION}`,
  `./css/status.css?v=${APP_VERSION}`,
  `./css/combate.css?v=${APP_VERSION}`,
  `./css/jutsus.css?v=${APP_VERSION}`,
  `./css/loja-v25843.css?v=${APP_VERSION}`,
  `./css/notas.css?v=${APP_VERSION}`,
  `./js/00-shinobi-ui.js?v=${APP_VERSION}`,
  `./js/00-item-identity.js?v=${APP_VERSION}`,
  `./js/01-core.js?v=${APP_VERSION}`,
  `./js/01-sheet-manager.js?v=${APP_VERSION}`,
  `./js/02-runtime.js?v=${APP_VERSION}`,
  `./js/03-images.js?v=${APP_VERSION}`,
  `./js/04-jutsus.js?v=${APP_VERSION}`,
  `./js/05-armados-item-level.js?v=${APP_VERSION}`,
  `./js/05-kekkei-item-level.js?v=${APP_VERSION}`,
  `./js/09-catalogo.js?v=${APP_VERSION}`,
  `./js/05-battle.js?v=${APP_VERSION}`,
  `./js/06-inventory.js?v=${APP_VERSION}`,
  `./js/06-wallet-item-level.js?v=${APP_VERSION}`,
  `./js/07-profile.js?v=${APP_VERSION}`,
  `./js/08-update.js?v=${APP_VERSION}`,
  `./js/08-post-render-loader.js?v=${APP_VERSION}`,
  `./js/10-regras-natureza.js?v=${APP_VERSION}`,
  `./js/11-batalha-ui.js?v=${APP_VERSION}`,
  `./js/12-efeitos-jutsus.js?v=${APP_VERSION}`,
  `./js/13-motor-universal.js?v=${APP_VERSION}`,
  `./js/14-level-up.js?v=${APP_VERSION}`,
  `./js/15-testes-resistencia.js?v=${APP_VERSION}`,
  `./js/16-pericias.js?v=${APP_VERSION}`,
  `./js/17-dano-inteligente.js?v=${APP_VERSION}`,
  `./js/18-online-config.js?v=${APP_VERSION}`,
  `./js/19-character-identity.js?v=${APP_VERSION}`,
  `./js/19-backup-manager-utils.js?v=${APP_VERSION}`,
  `./js/19-online-core.js?v=${APP_VERSION}`,
  `./js/19-realtime-fields-utils.js?v=${APP_VERSION}`,
  `./js/19-realtime-sync-engine.js?v=${APP_VERSION}`,
  `./vendor/qrcode-local.js?v=${APP_VERSION}`,
  `./js/20-online-ui.js?v=${APP_VERSION}`,
  `./js/21-online-hooks.js?v=${APP_VERSION}`,
  `./js/22-organizacao-retratil.js?v=${APP_VERSION}`,
  `./js/23-security-hardening.js?v=${APP_VERSION}`,
  `./js/24-terminologia-eko.js?v=${APP_VERSION}`,
  `./data/catalogo-jutsus.json?v=${APP_VERSION}`,
  `./data/efeitos-jutsus.json?v=${APP_VERSION}`,
  `./data/progressao-ninja.json?v=${APP_VERSION}`,
];

const INDEX_URL = new URL("./index.html", self.registration.scope).href;
const SHELL_URLS = APP_SHELL.map(path => new URL(path, self.registration.scope).href);
const SHELL_PATHS = new Set(SHELL_URLS.map(url => new URL(url).pathname));

function respostaPodeSerSalva(response){
  return Boolean(response&&response.ok&&(response.type==="basic"||response.type==="default"));
}

function recursoShellOpcional(url){
  try{return new URL(url).pathname.includes("/assets/inventory-");}
  catch(_erro){return false;}
}

async function avisarClientes(mensagem){
  try{
    const clientes=await self.clients.matchAll({includeUncontrolled:true,type:"window"});
    clientes.forEach(cliente=>cliente.postMessage(mensagem));
  }catch(_erro){}
}

async function fetchComTentativas(url,maxTentativas=3){
  let ultimoErro=null;

  for(let tentativa=1;tentativa<=maxTentativas;tentativa+=1){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch(new Request(url,{
        cache:"reload",
        credentials:"same-origin",
        signal:controller.signal
      }));
      clearTimeout(timer);
      if(!respostaPodeSerSalva(response)){
        throw new Error(`HTTP ${response.status} em ${url}`);
      }
      return response;
    }catch(erro){
      clearTimeout(timer);
      ultimoErro=erro;
      if(tentativa<maxTentativas){
        await new Promise(resolve=>setTimeout(resolve,500*tentativa));
      }
    }
  }

  throw ultimoErro||new Error(`Falha ao baixar ${url}`);
}

async function executarComLimite(itens,limite,tarefa){
  let proximo=0;
  const quantidade=Math.max(1,Math.min(limite,itens.length));
  const trabalhadores=Array.from({length:quantidade},async()=>{
    while(true){
      const indice=proximo;
      proximo+=1;
      if(indice>=itens.length) return;
      await tarefa(itens[indice],indice);
    }
  });
  await Promise.all(trabalhadores);
}

async function instalarAppShell(){
  const cache=await caches.open(SHELL_CACHE);
  let carregados=0;
  const total=SHELL_URLS.length;

  await avisarClientes({
    type:"SW_INSTALL_PROGRESS",
    version:APP_VERSION,
    loaded:0,
    total
  });

  await executarComLimite(
    SHELL_URLS,
    LIMITE_DOWNLOADS_SIMULTANEOS,
    async url=>{
      try{
        const recursoUrl=new URL(url);
        const pathname=recursoUrl.pathname;
        const chave=pathname.endsWith("/index.html")?INDEX_URL:url;
        const response=await fetchComTentativas(url);

        // Mantém a chave versionada e também uma chave canônica sem query string.
        // Vários recursos internos (principalmente imagens referenciadas pelo CSS/JS)
        // podem ser solicitados com uma versão diferente ou sem ?v=. Sem este alias,
        // o arquivo existe no cache mas não é encontrado quando o aparelho está offline.
        await cache.put(chave,response.clone());
        if(!pathname.endsWith("/index.html")){
          const canonica=new URL(url);
          canonica.search="";
          canonica.hash="";
          await cache.put(canonica.href,response.clone());
        }
        carregados+=1;
        await avisarClientes({
          type:"SW_INSTALL_PROGRESS",
          version:APP_VERSION,
          loaded:carregados,
          total
        });
      }catch(erro){
        const opcional=recursoShellOpcional(url);
        carregados+=opcional?1:0;
        await avisarClientes({
          type:opcional?"SW_INSTALL_PROGRESS":"SW_INSTALL_ERROR",
          version:APP_VERSION,
          url,
          loaded:carregados,
          total,
          skipped:opcional,
          message:String(erro?.message||erro)
        });
        if(opcional){
          console.warn("Recurso visual opcional não foi pré-carregado:",url,erro);
          return;
        }
        throw erro;
      }
    }
  );
}

function compararVersoesCache(a,b){
  const partesA=String(a||"").split(/[.-]/).map(valor=>Number(valor)||0);
  const partesB=String(b||"").split(/[.-]/).map(valor=>Number(valor)||0);
  const tamanho=Math.max(partesA.length,partesB.length);
  for(let i=0;i<tamanho;i+=1){
    const av=partesA[i]||0;
    const bv=partesB[i]||0;
    if(av>bv) return 1;
    if(av<bv) return -1;
  }
  return 0;
}

function identificarCacheVersionado(nome){
  const prefixos=[
    `${CACHE_PREFIX}-shell-`,
    `${CACHE_PREFIX}-runtime-`,
    `${CACHE_PREFIX}-firebase-`
  ];
  const prefixo=prefixos.find(item=>String(nome||"").startsWith(item));
  if(!prefixo) return null;
  const versao=String(nome).slice(prefixo.length).trim();
  if(!/^\d+(?:\.\d+){1,5}$/.test(versao)) return null;
  return {nome:String(nome),versao};
}

async function limparCachesAntigosComRetencao(){
  const nomes=await caches.keys();
  const reconhecidos=nomes
    .map(identificarCacheVersionado)
    .filter(Boolean);

  const versoes=[...new Set(reconhecidos.map(item=>item.versao))]
    .sort((a,b)=>compararVersoesCache(b,a));

  // Mantém várias coortes reais do próprio aparelho. Se um usuário saltou
  // diretamente de uma versão antiga para a atual, as duas permanecem: a
  // limpeza só começa quando existem mais de CACHE_VERSOES_RETIDAS releases
  // distintas armazenadas localmente.
  const manter=new Set(versoes.slice(0,CACHE_VERSOES_RETIDAS));
  manter.add(APP_VERSION);

  const antigos=reconhecidos
    .filter(item=>!manter.has(item.versao))
    .map(item=>item.nome);

  if(!antigos.length) return {removidos:[],mantidos:[...manter]};

  const removidos=[];
  for(const nome of antigos){
    try{
      if(await caches.delete(nome)) removidos.push(nome);
    }catch(erro){
      console.warn("Não foi possível remover cache antigo:",nome,erro);
    }
  }
  return {removidos,mantidos:[...manter]};
}

function urlCanonicaSemBusca(url){
  const canonica=new URL(url);
  canonica.search="";
  canonica.hash="";
  return canonica.href;
}

async function buscarShellNoCache(request){
  const cache=await caches.open(SHELL_CACHE);
  const exata=await cache.match(request);
  if(exata) return exata;

  // O alias canônico é seguro porque vive dentro do cache desta versão do worker.
  const canonica=await cache.match(urlCanonicaSemBusca(request.url));
  if(canonica) return canonica;

  const rede=await fetch(new Request(request,{cache:"no-store"}));
  if(respostaPodeSerSalva(rede)){
    await cache.put(request,rede.clone());
    await cache.put(urlCanonicaSemBusca(request.url),rede.clone());
  }
  return rede;
}

// Código e dados do shell formam uma coorte imutável. Um documento controlado
// por este worker recebe somente arquivos preparados para APP_VERSION.
async function buscarCodigoAtualizado(request){
  const url=new URL(request.url);
  const versaoSolicitada=String(url.searchParams.get("v")||"").trim();

  if(versaoSolicitada&&versaoSolicitada!==APP_VERSION){
    await avisarClientes({
      type:"SW_VERSION_MISMATCH",
      workerVersion:APP_VERSION,
      requestedVersion:versaoSolicitada,
      url:request.url
    });
    return new Response("Versão de recurso incompatível com o Service Worker ativo.",{
      status:409,
      headers:{
        "Content-Type":"text/plain; charset=utf-8",
        "Cache-Control":"no-store"
      }
    });
  }

  const cache=await caches.open(SHELL_CACHE);
  const exata=await cache.match(request);
  if(exata) return exata;

  // Requisições sem ?v= podem usar somente o alias da release atual.
  if(!versaoSolicitada){
    const canonica=await cache.match(urlCanonicaSemBusca(request.url));
    if(canonica) return canonica;
  }

  const rede=await fetch(new Request(request,{cache:"no-store"}));
  if(respostaPodeSerSalva(rede)){
    await cache.put(request,rede.clone());
    if(!versaoSolicitada){
      await cache.put(urlCanonicaSemBusca(request.url),rede.clone());
    }
  }
  return rede;
}

async function abrirPaginaPrincipal(request){
  const cache=await caches.open(SHELL_CACHE);

  // A página principal vem primeiro do shell desta release. Atualizações entram
  // somente após o updater preparar o novo worker e ocorrer um reload.
  const atual=await cache.match(INDEX_URL);
  if(atual) return atual;

  const resposta=await fetch(new Request(request,{cache:"no-store"}));
  if(respostaPodeSerSalva(resposta)) await cache.put(INDEX_URL,resposta.clone());
  return resposta;
}

async function staleWhileRevalidate(request,event){
  const cache=await caches.open(RUNTIME_CACHE);
  const salva=await cache.match(request,{ignoreSearch:true});
  const atualizar=fetch(request)
    .then(async response=>{
      if(respostaPodeSerSalva(response)){
        await cache.put(request,response.clone());
        await limitarCache(RUNTIME_CACHE,80);
      }
      return response;
    })
    .catch(()=>null);

  event.waitUntil(atualizar);
  if(salva) return salva;
  const rede=await atualizar;
  if(rede) return rede;
  throw new Error(`Recurso indisponível: ${request.url}`);
}

async function limitarCache(nome,limite){
  const cache=await caches.open(nome);
  const chaves=await cache.keys();
  while(chaves.length>limite){
    await cache.delete(chaves.shift());
  }
}


function respostaFirebasePodeSerSalva(response){
  return Boolean(response&&(response.ok||response.type==="opaque"));
}

function alternativoFirebase(url){
  if(url.startsWith(FIREBASE_GSTATIC_BASE)) return url.replace(FIREBASE_GSTATIC_BASE,FIREBASE_JSDELIVR_BASE);
  if(url.startsWith(FIREBASE_JSDELIVR_BASE)) return url.replace(FIREBASE_JSDELIVR_BASE,FIREBASE_GSTATIC_BASE);
  return null;
}

async function baixarFirebase(url){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),12000);
  try{
    const requisicao=new Request(url,{mode:"no-cors",cache:"reload",credentials:"omit",signal:controller.signal});
    const response=await fetch(requisicao);
    if(!respostaFirebasePodeSerSalva(response)) throw new Error(`Firebase SDK indisponível: ${url}`);
    return response;
  }finally{
    clearTimeout(timer);
  }
}

async function prepararCacheFirebase(){
  const cache=await caches.open(FIREBASE_CACHE);
  for(const nome of FIREBASE_FILES){
    const principal=`${FIREBASE_GSTATIC_BASE}/${nome}`;
    const secundario=`${FIREBASE_JSDELIVR_BASE}/${nome}`;
    try{
      const response=await baixarFirebase(principal);
      await cache.put(principal,response.clone());
      await cache.put(secundario,response.clone());
    }catch(_erroPrincipal){
      try{
        const response=await baixarFirebase(secundario);
        await cache.put(secundario,response.clone());
        await cache.put(principal,response.clone());
      }catch(erroSecundario){
        console.warn("Firebase SDK não foi pré-carregado:",nome,erroSecundario);
      }
    }
  }
}

async function responderFirebase(request){
  const cache=await caches.open(FIREBASE_CACHE);
  const salva=await cache.match(request,{ignoreSearch:true});
  if(salva) return salva;

  try{
    const response=await fetch(request);
    if(respostaFirebasePodeSerSalva(response)) await cache.put(request,response.clone());
    return response;
  }catch(erroPrincipal){
    const alternativa=alternativoFirebase(request.url);
    if(alternativa){
      const salvaAlternativa=await cache.match(alternativa,{ignoreSearch:true});
      if(salvaAlternativa){
        await cache.put(request,salvaAlternativa.clone());
        return salvaAlternativa;
      }
      try{
        const response=await baixarFirebase(alternativa);
        await cache.put(alternativa,response.clone());
        await cache.put(request,response.clone());
        return response;
      }catch(_erroAlternativa){}
    }
    throw erroPrincipal;
  }
}

self.addEventListener("install",event=>{
  /* Instala somente o shell de código. Firebase e assets pesados entram sob demanda,
     depois que o aplicativo já está utilizável. */
  event.waitUntil(instalarAppShell());
});

self.addEventListener("activate",event=>{
  /* Continua sem clients.claim(): a release nova não toma uma aba no meio da
     sessão. A limpeza também é deliberadamente conservadora: preserva as 6
     coortes mais recentes que realmente existem neste aparelho e só remove
     caches reconhecidos mais antigos. */
  event.waitUntil(
    limparCachesAntigosComRetencao().catch(erro=>{
      console.warn("Falha ao limpar caches PWA antigos:",erro);
    })
  );
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||request.headers.has("range")) return;

  const url=new URL(request.url);
  const firebaseExterno=(url.hostname==="www.gstatic.com"&&url.pathname.includes(`/firebasejs/${FIREBASE_VERSION}/`))
    ||(url.hostname==="cdn.jsdelivr.net"&&url.pathname.includes(`/npm/firebase@${FIREBASE_VERSION}/`));

  if(firebaseExterno){
    event.respondWith(responderFirebase(request));
    return;
  }

  if(url.origin!==self.location.origin) return;

  // version.json precisa sempre vir da rede para anunciar a versão publicada.
  if(url.pathname.endsWith("/version.json")) return;

  if(request.mode==="navigate"){
    event.respondWith(abrirPaginaPrincipal(request));
    return;
  }

  if(SHELL_PATHS.has(url.pathname)){
    const mutavel=/\.(?:css|js|json)$/i.test(url.pathname);
    event.respondWith(mutavel?buscarCodigoAtualizado(request):buscarShellNoCache(request));
    return;
  }

  const estatico=/\.(?:png|jpe?g|webp|svg|ico|woff2?)$/i.test(url.pathname);
  if(estatico) event.respondWith(staleWhileRevalidate(request,event));
});

self.addEventListener("message",event=>{
  const data=event.data||{};
  if(data.type==="SKIP_WAITING"){
    self.skipWaiting();
    return;
  }
  if(data.type==="GET_VERSION"){
    const resposta={type:"SERVICE_WORKER_VERSION",version:APP_VERSION};
    if(event.ports?.[0]) event.ports[0].postMessage(resposta);
    else event.source?.postMessage(resposta);
  }
});
