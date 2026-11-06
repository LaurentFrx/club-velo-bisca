/* Service hors ligne de l'application du club : garde une copie de la page
   pour l'ouvrir sans internet. En ligne, la page est toujours relue sur le
   site (on reçoit donc chaque nouvelle version) ; la copie ne sert que hors connexion.
   Les données (le fichier Excel du club) ne passent jamais par ici. */
const CACHE = "club-velo-2026-11-06";
const FICHIERS = ["./", "./index.html", "./manifest.webmanifest", "./icone.svg", "./icone-192.png",
  "./icone-512.png", "./icone-masquable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // cartes, altitudes : toujours en ligne
  e.respondWith(fetch(e.request)
    .then(r => {
      if (r.ok) { const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); }
      return r;
    })
    .catch(() => caches.match(e.request, { ignoreSearch: true })
      .then(r => r || (e.request.mode === "navigate" ? caches.match("./index.html") : Response.error()))));
});
