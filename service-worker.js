/* Shinobi — Service Worker otimizado
 *
 * Versão 1.1.0
 *
 * Objetivos:
 * - abrir o app rapidamente usando o cache local;
 * - manter HTML, CSS e JavaScript da mesma versão juntos;
 * - verificar atualizações assim que o app é aberto;
 * - continuar funcionando offline;
 * - não tocar nas fichas nem nas imagens salvas pelo usuário.
 *
 * REGRA DE PUBLICAÇÃO:
 * Sempre envie index.html, app.css e app.js primeiro.
 * Envie o service-worker.js por último e aumente APP_VERSION.
 */

const APP_VERSION = "1.4.0";
const CACHE_PREFIX = "shinobi";
const SHELL_CACHE = `${CACHE_PREFIX}-shell-${APP_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${APP_VERSION}`;

const APP_SHELL = [
  "./index.html",
  "./manifest.json",
  "./data/catalogo-jutsus.json",
  "./css/app.css",
  "./js/01-core.js",
  "./js/02-runtime.js",
  "./js/03-images.js",
  "./js/04-jutsus.js",
  "./js/09-catalogo.js",
  "./js/05-battle.js",
  "./js/06-inventory.js",
  "./js/07-profile.js",
  "./js/08-update.js",
  "./assets/ui-background-main.jpg",
  "./assets/ui-notes-parchment.jpg",
  "./icon_192x192.png",
  "./icon_512x512.png"
];

const INDEX_URL = new URL("./index.html", self.registration.scope).href;
const SHELL_URLS = APP_SHELL.map(
  (path) => new URL(path, self.registration.scope).href
);
const SHELL_PATHS = new Set(
  SHELL_URLS.map((url) => new URL(url).pathname)
);

function respostaPodeSerSalva(response) {
  return Boolean(
    response &&
    response.ok &&
    (response.type === "basic" || response.type === "default")
  );
}

async function instalarAppShell() {
  const cache = await caches.open(SHELL_CACHE);

  await Promise.all(
    SHELL_URLS.map(async (url) => {
      const request = new Request(url, {
        cache: "reload",
        credentials: "same-origin"
      });

      const response = await fetch(request);

      if (!respostaPodeSerSalva(response)) {
        throw new Error(`Falha ao armazenar no cache: ${url}`);
      }

      await cache.put(url, response);
    })
  );
}

async function limparCachesAntigos() {
  const nomes = await caches.keys();
  const cachesAtuais = new Set([SHELL_CACHE, RUNTIME_CACHE]);

  await Promise.all(
    nomes
      .filter(
        (nome) =>
          nome.startsWith(`${CACHE_PREFIX}-`) &&
          !cachesAtuais.has(nome)
      )
      .map((nome) => caches.delete(nome))
  );
}

async function buscarShellNoCache(request) {
  const cache = await caches.open(SHELL_CACHE);
  const resposta = await cache.match(request, {
    ignoreSearch: true
  });

  if (resposta) {
    return resposta;
  }

  const rede = await fetch(request);

  if (respostaPodeSerSalva(rede)) {
    await cache.put(request, rede.clone());
  }

  return rede;
}

async function abrirPaginaPrincipal(request) {
  const cache = await caches.open(SHELL_CACHE);
  const paginaSalva = await cache.match(INDEX_URL);

  if (paginaSalva) {
    return paginaSalva;
  }

  try {
    const resposta = await fetch(request);

    if (respostaPodeSerSalva(resposta)) {
      await cache.put(INDEX_URL, resposta.clone());
    }

    return resposta;
  } catch (erro) {
    const fallback = await cache.match(INDEX_URL);

    if (fallback) {
      return fallback;
    }

    throw erro;
  }
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(RUNTIME_CACHE);
  const salva = await cache.match(request, {
    ignoreSearch: true
  });

  const atualizar = fetch(request)
    .then(async (response) => {
      if (respostaPodeSerSalva(response)) {
        await cache.put(request, response.clone());
        await limitarCache(RUNTIME_CACHE, 80);
      }

      return response;
    })
    .catch(() => null);

  event.waitUntil(atualizar);

  if (salva) {
    return salva;
  }

  const rede = await atualizar;

  if (rede) {
    return rede;
  }

  throw new Error(`Recurso indisponível: ${request.url}`);
}

async function limitarCache(nomeCache, limite) {
  const cache = await caches.open(nomeCache);
  const chaves = await cache.keys();

  while (chaves.length > limite) {
    const chaveMaisAntiga = chaves.shift();
    await cache.delete(chaveMaisAntiga);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(instalarAppShell());

  /*
   * Não usamos skipWaiting automaticamente.
   * O app decide quando aplicar a atualização, protegendo a ficha em uso.
   */
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      limparCachesAntigos(),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  if (request.headers.has("range")) {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    /*
     * Mostra imediatamente a versão já instalada e, em paralelo,
     * verifica se existe um service worker novo no servidor.
     */
    event.waitUntil(
      self.registration.update().catch(() => {})
    );

    event.respondWith(abrirPaginaPrincipal(request));
    return;
  }

  if (SHELL_PATHS.has(url.pathname)) {
    /*
     * Cache-first deixa CSS/JS rápidos e impede misturar arquivos
     * de versões diferentes durante uma atualização.
     */
    event.respondWith(buscarShellNoCache(request));
    return;
  }

  const recursoEstatico =
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".woff2");

  if (recursoEstatico) {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});

self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (data.type === "GET_VERSION") {
    event.source?.postMessage({
      type: "SERVICE_WORKER_VERSION",
      version: APP_VERSION
    });
  }
});
