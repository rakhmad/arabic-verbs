// sw.js — Service Worker for offline caching
// Cache-first strategy: serve from cache, fallback to network

var CACHE_NAME = "arabic-verbs-v1";

var LOCAL_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./data.js",
  "./db.js",
  "./srs.js",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
  "./icons/icon-192.png"
];

// Install: precache all local app files, best-effort cache fonts
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(LOCAL_FILES).then(function () {
        // Font files: best-effort (don't fail install if CDN is unavailable)
        var fontUrls = [
          "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
        ];
        return Promise.allSettled(
          fontUrls.map(function (url) { return cache.add(url); })
        );
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

// Activate: delete old caches, claim all clients
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) { return k !== CACHE_NAME; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

// Fetch: cache-first, fallback to network, cache new successful GET responses
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (response) {
        if (e.request.method === "GET" && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function () {
        // Network failed and not in cache — return nothing (browser shows offline error)
        return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
      });
    })
  );
});
