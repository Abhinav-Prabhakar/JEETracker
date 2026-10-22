/* JEE Tracker — a small, static app-shell cache.
   Navigation is network-first so GitHub Pages updates arrive on the next
   online load; same-origin assets are stale-while-revalidate. */
'use strict';

const CACHE = 'jee-tracker-v1';
const CACHE_PREFIX = 'jee-tracker-';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon-32.png'
];

const INDEX = new URL('./index.html', self.registration.scope).href;
const ROOT = new URL('./', self.registration.scope).href;

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) {
        return Promise.all(SHELL.map(function (url) {
          return cache.add(url).catch(function () { /* one missing icon must not block install */ });
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (key) {
          if (key !== CACHE && key.indexOf(CACHE_PREFIX) === 0) return caches.delete(key);
          return null;
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function offlineFallback() {
  return new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>JEE Tracker — offline</title>' +
    '<style>html,body{height:100%;margin:0;background:#fcfcfd;color:#141418;' +
    'font:300 14px/1.6 Inter,system-ui,sans-serif;display:grid;place-items:center;text-align:center}' +
    'p{max-width:28rem;padding:2rem}b{font-weight:500;color:#b12f5f}</style>' +
    '<p><b>JEE Tracker is offline.</b><br>Reconnect once and reload — the app will keep the rest of the year with you.</p>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    const type = response && response.headers.get('content-type') || '';
    if (response && response.ok && /text\/html/i.test(type)) {
      const cache = await caches.open(CACHE);
      await cache.put(INDEX, response.clone()).catch(function () {});
    }
    return response;
  } catch (err) {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(INDEX) || await cache.match(ROOT);
    return cached || offlineFallback();
  }
}

function handleAsset(event) {
  const request = event.request;
  return caches.open(CACHE).then(async function (cache) {
    const cached = await cache.match(request);
    const network = fetch(request).then(function (response) {
      if (response && response.ok && response.type === 'basic') {
        cache.put(request, response.clone()).catch(function () {});
      }
      return response;
    });

    event.waitUntil(network.catch(function () { /* offline: the cached copy is enough */ }));

    if (cached) return cached;
    const response = await network.catch(function () { return null; });
    return response || new Response('', { status: 504, statusText: 'Offline' });
  });
}

self.addEventListener('fetch', function (event) {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  /* The browser may fetch the manifest's screenshots for its install UI.
     They are README-weight images, not the app shell: leave them on the
     network instead of filling the cache with them. */
  if (/\.(png|jpe?g|webp|gif|avif)$/i.test(url.pathname) &&
      url.pathname.indexOf('/assets/icons/') === -1) {
    return;
  }

  event.respondWith(handleAsset(event));
});
