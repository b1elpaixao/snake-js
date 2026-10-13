// Service worker: guarda uma cópia do jogo pra ele abrir sem internet (e poder ser instalado como app)
const NOME_DO_CACHE = "snake-v1";
const ARQUIVOS =["./", "index.html", "style.css", "logica.js", "script.js", "manifest.webmanifest", "icone.svg"];

self.addEventListener("install", (evento) => {
    evento.waitUntil(caches.open(NOME_DO_CACHE).then((cache) => cache.addAll(ARQUIVOS)));
    self.skipWaiting();
});

// apaga caches de versões antigas
self.addEventListener("activate", (evento) => {
    evento.waitUntil(
        caches.keys()
            .then((nomes) => Promise.all(nomes.filter((nome) => nome !== NOME_DO_CACHE).map((nome) => caches.delete(nome))))
            .then(() => self.clients.claim())
    );
});

// internet primeiro (sempre pega a versão mais nova); sem internet, usa a cópia guardada
self.addEventListener("fetch", (evento) => {
    const pedido = evento.request;

    if (pedido.method !== "GET" || !pedido.url.startsWith("http")) return;

    evento.respondWith(
        fetch(pedido)
            .then((resposta) => {
                if (resposta.ok || resposta.type === "opaque") {
                    const copia = resposta.clone();
                    caches.open(NOME_DO_CACHE).then((cache) => cache.put(pedido, copia));
                }
                return resposta;
            })
            .catch(() => caches.match(pedido, { ignoreSearch: true }))
    );
});