// JD Diversões / JD Vendas – app instalável
// Guarda as páginas no aparelho para abrir rápido e funcionar sem internet quando possível.
const VERSAO = "jdbingo-v1";
const FB = "https://www.gstatic.com/firebasejs/8.10.1/";
const ESSENCIAIS = [
  "/", "/bingo", "/bolao", "/vendas", "/vendas-adm", "/adm", "/bolao-adm", "/offline.html",
  "/pwa.js", "/boneco.png", "/boneco_abertura.png",
  "/icone-192.png", "/icone-512.png", "/icone-vendas-192.png", "/icone-vendas-512.png",
  "/manifest.webmanifest", "/manifest-vendas.webmanifest", "/manifest-gerente.webmanifest",
  FB + "firebase-app.js", FB + "firebase-database.js"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSAO)
      .then(c => Promise.all(ESSENCIAIS.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function semHtml(url) {
  const u = new URL(url);
  u.search = "";
  if (u.pathname.endsWith("/index.html")) u.pathname = u.pathname.slice(0, -10) || "/";
  else if (u.pathname.endsWith(".html")) u.pathname = u.pathname.slice(0, -5);
  return u.href;
}

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);

  // Páginas e arquivos do próprio site: internet primeiro; sem internet, a cópia guardada.
  if (u.origin === self.location.origin) {
    e.respondWith(
      fetch(r)
        .then(res => {
          if (res.ok && !res.redirected) { const cp = res.clone(); caches.open(VERSAO).then(c => c.put(semHtml(r.url), cp)); }
          return res;
        })
        .catch(async () => {
          const m = await caches.match(semHtml(r.url)) || await caches.match(r, { ignoreSearch: true });
          if (m) return m;
          if (r.mode === "navigate") return caches.match("/offline.html");
          return Response.error();
        })
    );
    return;
  }

  // Bibliotecas do Firebase: cópia guardada primeiro.
  if (u.hostname === "www.gstatic.com") {
    e.respondWith(
      caches.match(r).then(m =>
        m || fetch(r).then(res => {
          if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(VERSAO).then(c => c.put(r, cp)); }
          return res;
        })
      )
    );
  }
  // Banco de dados, Pix e o resto passam direto, sem guardar.
});
