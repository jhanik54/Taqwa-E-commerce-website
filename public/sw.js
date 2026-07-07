const CACHE_NAME = "taqwa-pwa-v1";
const OFFLINE_URL = "/offline.html";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  OFFLINE_URL
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Ignore non-GET, API, and extension requests
  if (
    event.request.method !== "GET" || 
    event.request.url.startsWith("chrome-extension://") ||
    event.request.url.includes("/api/") ||
    event.request.url.includes("hot-update") ||
    event.request.url.includes("@vite")
  ) {
    return;
  }

  // Network-First Strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If HTML request failed, show offline page
          if (event.request.headers.get("accept") && event.request.headers.get("accept").includes("text/html")) {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "Taqwa Enterprise", body: "নতুন অফার ও প্রমোশনাল আপডেট!" };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Taqwa Enterprise", body: event.data.text() };
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=192"
    })
  );
});
