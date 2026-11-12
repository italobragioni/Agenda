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

// Notificação push (novo agendamento, etc.).
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = data.title || "Carvi";
  const options = {
    body: data.body || "Você tem uma novidade.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/agenda" },
    tag: data.tag || undefined,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Ao tocar na notificação, abre/foca o app na tela certa.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/agenda";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
