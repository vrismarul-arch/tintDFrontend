self.addEventListener("install", (event) => {
  console.log("Service Worker installed.");
  event.waitUntil(
    caches.open("tintd-cache-v1").then((cache) => {
      return cache.addAll(["/", "/index.html"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
