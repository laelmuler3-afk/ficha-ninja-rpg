/* Shinobi — Service Worker
 *
 * Responsável pelo cache dos arquivos do aplicativo, funcionamento offline
 * básico e atualização controlada.
 *
 * IMPORTANTE:
 * - A cada nova versão do app, altere APP_VERSION.
 * - O service worker não apaga fichas, personagens ou imagens do usuário.
 *   Esses dados continuam no armazenamento local do navegador.
 */

const APP_VERSION = "1.0.1";
const CACHE_PREFIX = "shinobi-app";
const CACHE_NAME = `${CACHE_PREFIX}-${APP_VERSION}`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/app.css",
  "./js/app.js",
  "./icon_192x192.png",
  "./icon_512x512.png"
];

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isCacheableResponse(response) {
  return Boolean(
    response &&
    response.ok &&
    (response.type === "basic" || response.type === "default")
  );
}

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);

  await Promise.all(
    APP_SHELL.map(async (path) => {
      const url = new URL(path, self.registration.scope);
      const request = new Request(url, { cache: "reload" });
      const response = await fetch(request);

      if (!isCacheableResponse(response)) {
        throw new Error(`Não foi possível armazenar no cache: ${url.pathname}`);
      }

      await cache.put(request, response);
    })
  );
}

async function removeOldCaches() {
  const cacheNames = await caches.keys();

  await Promise.all(
    cacheNames
      .filter(
        (name) =>
          name.startsWith(`${CACHE_PREFIX}-`) &&
          name !== CACHE_NAME
      )
      .map((name) => caches.delete(name))
  );
}

async function networkFirst(request, fallbackPath = null) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request, { cache: "no-store" });

    if (isCacheableResponse(response)) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request, {
      ignoreSearch: true
    });

    if (cachedResponse) {
      return cachedResponse;
    }

    if (fallbackPath) {
      const fallbackUrl = new URL(fallbackPath, self.registration.scope);
      const fallbackResponse = await cache.match(fallbackUrl, {
        ignoreSearch: true
      });

      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    throw error;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheAppShell());

  // Não chamamos skipWaiting automaticamente.
  // A atualização só será aplicada quando o usuário confirmar no aplicativo.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      removeOldCaches(),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (!isSameOrigin(url)) {
    return;
  }

  // Evita interferir em downloads parciais de arquivos.
  if (request.headers.has("range")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }

  const isAppAsset =
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".json") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico");

  if (isAppAsset) {
    event.respondWith(networkFirst(request));
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
