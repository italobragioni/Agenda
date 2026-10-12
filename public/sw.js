// Service worker mínimo da Carvi.
// Objetivo: tornar o app "instalável" (Android/Chrome exige um service worker
// com handler de fetch). NÃO fazemos cache para não atrapalhar atualizações —
// é sempre rede (o app continua sempre na versão mais nova).

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Apenas GET; repasse direto para a rede (sem cache).
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request));
});
