/* Shinobi 1.9.0 — Service Worker com atualização observável e motor de efeitos estruturados. */
const APP_VERSION = "1.9.0";
const CACHE_PREFIX = "shinobi";
const SHELL_CACHE = `${CACHE_PREFIX}-shell-${APP_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${APP_VERSION}`;

const APP_SHELL = [
  `./index.html?v=${APP_VERSION}`,
  "./manifest.json",
  "./css/app.css",
  `./css/update.css?v=${APP_VERSION}`,
  "./css/catalogo.css?v=1.4.2",
  "./css/regras-natureza.css?v=1.7.2",
  "./css/batalha-viva.css?v=1.9.0",
  "./js/01-core.js",
  "./js/02-runtime.js",
  "./js/03-images.js",
  "./js/04-jutsus.js",
  "./js/09-catalogo.js?v=1.9.0",
  "./js/05-battle.js?v=1.8.4",
  "./js/06-inventory.js",
  "./js/07-profile.js",
  `./js/08-update.js?v=${APP_VERSION}`,
  "./js/10-regras-natureza.js?v=1.8.2",
  "./js/11-batalha-ui.js?v=1.8.0",
  "./js/12-efeitos-jutsus.js?v=1.9.0",
  "./data/catalogo-jutsus.json?v=1.9.0",
  "./data/efeitos-jutsus.json?v=1.0.0",
  "./assets/ui-background-main.jpg",
  "./assets/ui-notes-parchment.jpg",
  "./icon_192x192.png",
  "./icon_512x512.png"
];

const INDEX_URL = new URL("./index.html", self.registration.scope).href;
const SHELL_URLS = APP_SHELL.map(path => new URL(path, self.registration.scope).href);
const SHELL_PATHS = new Set(SHELL_URLS.map(url => new URL(url).pathname));

function respostaPodeSerSalva(response){
  return Boolean(response&&response.ok&&(response.type==="basic"||response.type==="default"));
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

async function localizarCacheShellAnterior(){
  const nomes=await caches.keys();
  const anteriores=nomes.filter(
    nome=>nome.startsWith(`${CACHE_PREFIX}-shell-`)&&nome!==SHELL_CACHE
  );
  if(!anteriores.length) return null;
  return caches.open(anteriores[anteriores.length-1]);
}

async function instalarAppShell(){
  const cache=await caches.open(SHELL_CACHE);
  const cacheAnterior=await localizarCacheShellAnterior();
  let carregados=0;
  const total=SHELL_URLS.length;

  await avisarClientes({
    type:"SW_INSTALL_PROGRESS",
    version:APP_VERSION,
    loaded:0,
    total
  });

  await Promise.all(SHELL_URLS.map(async url=>{
    try{
      const pathname=new URL(url).pathname;
      const chave=pathname.endsWith("/index.html")?INDEX_URL:url;
      let response=null;

      /*
       * Arquivos com a mesma URL já foram validados pela versão anterior.
       * Copiá-los do cache torna a atualização muito mais rápida.
       * Arquivos alterados recebem uma nova query ?v= e são baixados da rede.
       */
      if(cacheAnterior&&!pathname.endsWith("/index.html")){
        response=await cacheAnterior.match(url);
      }

      if(!response){
        response=await fetchComTentativas(url);
      }

      await cache.put(chave,response.clone());
      carregados+=1;
      await avisarClientes({
        type:"SW_INSTALL_PROGRESS",
        version:APP_VERSION,
        loaded:carregados,
        total
      });
    }catch(erro){
      await avisarClientes({
        type:"SW_INSTALL_ERROR",
        version:APP_VERSION,
        url,
        message:String(erro?.message||erro)
      });
      throw erro;
    }
  }));
}

async function limparCachesAntigos(){
  const nomes=await caches.keys();
  const atuais=new Set([SHELL_CACHE,RUNTIME_CACHE]);
  await Promise.all(
    nomes
      .filter(nome=>nome.startsWith(`${CACHE_PREFIX}-`)&&!atuais.has(nome))
      .map(nome=>caches.delete(nome))
  );
}

async function buscarShellNoCache(request){
  const cache=await caches.open(SHELL_CACHE);
  const resposta=await cache.match(request,{ignoreSearch:true});
  if(resposta) return resposta;

  const rede=await fetch(request);
  if(respostaPodeSerSalva(rede)) await cache.put(request,rede.clone());
  return rede;
}

async function abrirPaginaPrincipal(request){
  const cache=await caches.open(SHELL_CACHE);
  const pagina=await cache.match(INDEX_URL,{ignoreSearch:true});
  if(pagina) return pagina;

  try{
    const resposta=await fetch(request);
    if(respostaPodeSerSalva(resposta)) await cache.put(INDEX_URL,resposta.clone());
    return resposta;
  }catch(erro){
    const fallback=await cache.match(INDEX_URL,{ignoreSearch:true});
    if(fallback) return fallback;
    throw erro;
  }
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

self.addEventListener("install",event=>{
  event.waitUntil(instalarAppShell());
});

self.addEventListener("activate",event=>{
  event.waitUntil(Promise.all([limparCachesAntigos(),self.clients.claim()]));
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||request.headers.has("range")) return;

  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;

  // version.json precisa sempre vir da rede para anunciar a versão publicada.
  if(url.pathname.endsWith("/version.json")) return;

  if(request.mode==="navigate"){
    event.waitUntil(self.registration.update().catch(()=>{}));
    event.respondWith(abrirPaginaPrincipal(request));
    return;
  }

  if(SHELL_PATHS.has(url.pathname)){
    event.respondWith(buscarShellNoCache(request));
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
    event.source?.postMessage({type:"SERVICE_WORKER_VERSION",version:APP_VERSION});
  }
});
