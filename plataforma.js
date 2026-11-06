// ==========================================
// Plataforma de jogos (CrazyGames): anúncios, saves na conta e avisos de "jogando/parou".
// Fora de lá nada disso liga: o jogo abre direto, igual sempre foi.
// É o último <script> do index.html: espera o SDK e só depois carrega o script.js
// (o script.js lê os saves ao abrir, e na plataforma eles vêm do SDK).
// Pra testar no computador: abrir em http://127.0.0.1 com ?useLocalSdk=true no endereço
// ==========================================
const ENDERECO_DO_SDK = "https://sdk.crazygames.com/crazygames-sdk-v3.js";
const ESPERA_MAXIMA_DO_SDK_MS = 6000;           // internet ruim ou bloqueador: abre o jogo sem SDK
const ESPERA_MAXIMA_DO_ANUNCIO_MS = 8000;       // se o anúncio nem começar, libera a tela
const TEMPO_ANTES_DO_PRIMEIRO_ANUNCIO_MS = 60000; // ninguém vê anúncio logo que abriu o jogo

let sdkDaPlataforma = null;    // null = fora da plataforma (ou o SDK não carregou)
let anuncioAberto = false;     // pedindo ou mostrando anúncio: "Jogar de novo" e as teclas esperam
let anuncioTocando = false;    // o anúncio começou de verdade: o som do jogo cala
let jogandoNaPlataforma = false;

// Portais menores: a versão de cada um põe window.PORTAL_DO_JOGO = { nome, id } no index.html
// (o id vem do painel do portal). Os dois usam o mesmo jeito: SDK_GAME_PAUSE = anúncio começou, SDK_GAME_START = acabou
const SDKS_DOS_PORTAIS = {
    gamemonetize: { endereco: "https://api.gamemonetize.com/sdk.js", opcoes: "SDK_OPTIONS", anuncio: () => window.sdk.showBanner(), camada: "imaContainer" },
    gamedistribution: { endereco: "https://html5.api.gamedistribution.com/main.min.js", opcoes: "GD_OPTIONS", anuncio: () => window.gdsdk.showAd() },
};
const portalDoJogo = SDKS_DOS_PORTAIS[window.PORTAL_DO_JOGO?.nome] ? window.PORTAL_DO_JOGO : null;
const INTERVALO_ENTRE_ANUNCIOS_DO_PORTAL_MS = 120000; // lá quem controla somos nós: no máximo 1 a cada 2 min (o primeiro já no fim da 1ª partida: a revisão do portal precisa ver um anúncio)
let ultimoAnuncioDoPortal = -Infinity;
let segurancaDoPortal = null;
let vigiaDaCamada = null;

// dentro de um iframe também tenta: se não for a plataforma, o SDK responde "disabled" e o jogo abre normal
function jogoEstaNumaPlataforma() {
    return window.self !== window.top || /(^|\.)crazygames\./.test(location.hostname) || new URLSearchParams(location.search).has("useLocalSdk");
}

// carrega o arquivo do SDK e inicia; nunca trava: se der errado, o jogo abre sem ele
function iniciarSdk() {
    const carregar = new Promise((pronto, falhou) => {
        const arquivo = document.createElement("script");
        arquivo.src = ENDERECO_DO_SDK;
        arquivo.onload = pronto;
        arquivo.onerror = falhou;
        document.head.appendChild(arquivo);
    }).then(() => window.CrazyGames.SDK.init());
    const desistir = new Promise((_, falhou) => setTimeout(falhou, ESPERA_MAXIMA_DO_SDK_MS));
    return Promise.race([carregar, desistir]);
}

function carregarOJogo() {
    const arquivo = document.createElement("script");
    arquivo.src = "script.js";
    arquivo.onload = () => {
        if (!sdkDaPlataforma) return;
        aplicarVolumes();
        sdkDaPlataforma.game.addSettingsChangeListener(aplicarVolumes); // "sem som" do site da plataforma
        sdkDaPlataforma.game.loadingStop();
    };
    document.body.appendChild(arquivo);
}

async function abrirNaPlataforma() {
    try {
        await iniciarSdk();
        const sdk = window.CrazyGames.SDK;
        if (sdk.environment === "crazygames" || sdk.environment === "local") {
            sdkDaPlataforma = sdk;
            document.documentElement.classList.add("na-plataforma"); // o CSS esconde o que lá não pode
            document.title = "Snake Brawl"; // o nome do jogo no CrazyGames (o site continua Snake)
            sdk.game.loadingStart();
        }
    } catch {
        sdkDaPlataforma = null;
    }
    carregarOJogo();
}

function anuncioDoPortalComecou() {
    anuncioAberto = true;
    anuncioTocando = true;
    document.getElementById("telaGameOver").inert = true;
    clearTimeout(segurancaDoPortal);
    segurancaDoPortal = setTimeout(anuncioDoPortalAcabou, 90000); // se o SDK nunca avisar o fim, o jogo não fica preso
    try { aplicarVolumes(); } catch { /* o jogo ainda está abrindo */ }
}

function anuncioDoPortalAcabou() {
    clearTimeout(segurancaDoPortal);
    anuncioAberto = false;
    anuncioTocando = false;
    document.getElementById("telaGameOver").inert = false;
    try { aplicarVolumes(); } catch { /* o jogo ainda está abrindo */ }
}

// sem conta nem saves no portal: o jogo guarda no navegador, como no site
function abrirNoPortal() {
    const portal = SDKS_DOS_PORTAIS[portalDoJogo.nome];
    document.documentElement.classList.add("na-plataforma"); // sem links pra fora, compartilhar e instalar
    document.title = "Snake Brawl";
    window[portal.opcoes] = {
        gameId: portalDoJogo.id,
        onEvent: (evento) => {
            if (evento.name === "SDK_GAME_PAUSE") anuncioDoPortalComecou();
            else if (evento.name === "SDK_GAME_START") anuncioDoPortalAcabou();
        },
    };
    const arquivo = document.createElement("script");
    arquivo.src = portal.endereco;
    arquivo.async = true;
    document.head.appendChild(arquivo);
    carregarOJogo(); // não espera o SDK: se ele não carregar, o jogo abre igual
}

// no site do GameMonetize os avisos de pausa nem sempre chegam: a camada do anúncio aparecendo e sumindo também vale
function vigiarCamadaDoAnuncio(id) {
    clearInterval(vigiaDaCamada);
    let viu = false;
    const desistirEm = performance.now() + 10000; // o anúncio nem apareceu: para de olhar
    vigiaDaCamada = setInterval(() => {
        const camada = document.getElementById(id);
        const aparecendo = Boolean(camada) && getComputedStyle(camada).visibility !== "hidden" && camada.offsetWidth > 0;
        if (aparecendo && !viu) {
            viu = true;
            if (!anuncioAberto) anuncioDoPortalComecou();
        } else if (!aparecendo && viu) {
            clearInterval(vigiaDaCamada);
            if (anuncioAberto) anuncioDoPortalAcabou();
        } else if (!viu && performance.now() > desistirEm) {
            clearInterval(vigiaDaCamada);
        }
    }, 250);
}

function pedirAnuncioDoPortal() {
    const agora = performance.now();
    if (agora - ultimoAnuncioDoPortal < INTERVALO_ENTRE_ANUNCIOS_DO_PORTAL_MS) return;
    ultimoAnuncioDoPortal = agora;
    try {
        const portal = SDKS_DOS_PORTAIS[portalDoJogo.nome];
        portal.anuncio(); // sem anúncio pra mostrar, o SDK não avisa nada e o jogo segue
        if (portal.camada) vigiarCamadaDoAnuncio(portal.camada);
    } catch {
        anuncioDoPortalAcabou();
    }
}

// o site da plataforma mandou calar, ou tem anúncio tocando (ganha dos botões do jogo)
function plataformaCalaOSom() {
    return anuncioTocando || Boolean(sdkDaPlataforma && sdkDaPlataforma.game.settings.muteAudio);
}

// chamado a cada quadro; a plataforma só fica sabendo quando muda
function avisarPlataformaSeEstaJogando(jogando) {
    if (!sdkDaPlataforma || jogando === jogandoNaPlataforma) return;
    jogandoNaPlataforma = jogando;
    if (jogando) sdkDaPlataforma.game.gameplayStart();
    else sdkDaPlataforma.game.gameplayStop();
}

// no fim da partida. A plataforma controla o intervalo entre anúncios (e recusa se for cedo demais)
function pedirAnuncioDoIntervalo() {
    if (portalDoJogo) { pedirAnuncioDoPortal(); return; }
    if (!sdkDaPlataforma || performance.now() < TEMPO_ANTES_DO_PRIMEIRO_ANUNCIO_MS) return;

    avisarPlataformaSeEstaJogando(false);
    const tela = document.getElementById("telaGameOver");
    let seguranca = null;
    const fechar = () => {
        clearTimeout(seguranca);
        anuncioAberto = false;
        anuncioTocando = false;
        tela.inert = false;
        aplicarVolumes();
    };

    anuncioAberto = true;
    tela.inert = true;
    seguranca = setTimeout(fechar, ESPERA_MAXIMA_DO_ANUNCIO_MS);
    try {
        sdkDaPlataforma.ad.requestAd("midgame", {
            adStarted: () => {
                clearTimeout(seguranca);
                anuncioTocando = true;
                aplicarVolumes();
            },
            adFinished: fechar,
            adError: fechar, // sem anúncio, bloqueador ou cedo demais: o jogo só segue
        });
    } catch {
        fechar();
    }
}

if (portalDoJogo) abrirNoPortal();
else if (jogoEstaNumaPlataforma()) abrirNaPlataforma();
else carregarOJogo();
