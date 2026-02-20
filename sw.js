/* ============================================================
   OK CUISINE — Service Worker
   Cache minimal pour fonctionnement hors-ligne partiel
   Note: la reconnaissance vocale nécessite internet (Google)
   ============================================================ */

const CACHE_NAME = 'ok-cuisine-v3';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/storage.js',
    '/js/ui.js',
    '/js/voice.js',
    '/js/dashboard.js',
    '/js/temperatures.js',
    '/js/nettoyage.js',
    '/js/receptions.js',
    '/js/inventaire.js',
    '/js/alertes.js',
    '/js/journal.js',
    '/js/allergenes.js',
    '/js/tracabilite.js',
    '/js/protocoles.js',
    '/js/menus.js',
    '/js/audit.js',
    '/js/simulateur.js',
    '/js/config.js',
    '/js/pdf.js',
    '/js/app.js',
    '/manifest.json'
];

// Install — cache files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(URLS_TO_CACHE);
        }).catch(() => {
            // Ignore cache errors silently
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names => {
            return Promise.all(
                names.filter(name => name !== CACHE_NAME)
                     .map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache the response for offline use
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Offline — serve from cache
                return caches.match(event.request);
            })
    );
});
