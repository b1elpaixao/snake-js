// Service worker: guarda uma cópia do jogo pra ele abrir sem internet (e poder ser instalado como app)
const NOME_DO_CACHE = "snake-v9";
const ARQUIVOS =["./", "index.html", "style.css", "logica.js", "itens.js", "desenho.js", "som.js", "movimento.js", "modos.js", "fantasma.js", "controle.js", "tutorial.js", "acessibilidade.js", "historico.js", "script.js", "manifest.webmanifest", "icone-32.png", "icone-180.png", "icone-192.png", "icone-512.png", "icone-maskable-512.png"];

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
        fetch(pedido, { cache: "no-cache" }) // pergunta pro site se mudou: atualização aparece na hora
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