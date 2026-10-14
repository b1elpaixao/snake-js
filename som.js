// ==========================================
// Som
// ==========================================
const NOTAS_MUSICA_FUNDO = [220, 246.94, 261.63, 246.94, 220, 196, 220, 246.94];
const DURACAO_NOTA_MUSICA_MS = 280;
const VOLUME_MUSICA_FUNDO = 0.05;

let contextoAudio = null;
let indiceNotaMusica = 0;
let temporizadorMusica = null;
let musicaAtiva = false;

function obterContextoAudio() {
    if (!contextoAudio) {
        contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
    }
    return contextoAudio;
}

function tocarSom(frequencia, duracaoSegundos, tipoOnda = "sine") {
    if (mudo) return;

    const ctxAudio = obterContextoAudio();
    const oscilador = ctxAudio.createOscillator();
    const ganho = ctxAudio.createGain();

    oscilador.type = tipoOnda;
    oscilador.frequency.value = frequencia;

    ganho.gain.setValueAtTime(0.2, ctxAudio.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.001, ctxAudio.currentTime + duracaoSegundos);

    oscilador.connect(ganho);
    ganho.connect(ctxAudio.destination);

    oscilador.start();
    oscilador.stop(ctxAudio.currentTime + duracaoSegundos);
}

function tocarSomComer() {
    tocarSom(700, 0.1, "square");
}

function tocarSomColisao() {
    tocarSom(120, 0.4, "sawtooth");
}

function tocarSomComidaDourada() {
    tocarSom(1000, 0.15, "triangle");
}

// vibra o celular (o botão "Efeitos" desliga a vibração também)
// padrao: milissegundos de vibração, ou uma lista [vibra, pausa, vibra, ...]
function vibrar(padrao) {
    if (mudo || !navigator.vibrate) return;
    navigator.vibrate(padrao);
}

function tocarNotaMusica(frequencia) {
    if (musicaDesligada) return;

    const ctxAudio = obterContextoAudio();
    const oscilador = ctxAudio.createOscillator();
    const ganho = ctxAudio.createGain();

    oscilador.type = "triangle";
    oscilador.frequency.value = frequencia;

    ganho.gain.setValueAtTime(VOLUME_MUSICA_FUNDO, ctxAudio.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.001, ctxAudio.currentTime + DURACAO_NOTA_MUSICA_MS / 1000);

    oscilador.connect(ganho);
    ganho.connect(ctxAudio.destination);

    oscilador.start();
    oscilador.stop(ctxAudio.currentTime + DURACAO_NOTA_MUSICA_MS / 1000);
}

function loopMusicaFundo() {
    if (!musicaAtiva) return;

    if (jogoAtivo && !pausado) {
        tocarNotaMusica(NOTAS_MUSICA_FUNDO[indiceNotaMusica]);
        indiceNotaMusica = (indiceNotaMusica + 1) % NOTAS_MUSICA_FUNDO.length;
    }

    temporizadorMusica = setTimeout(loopMusicaFundo, DURACAO_NOTA_MUSICA_MS);
}

function iniciarMusicaFundo() {
    if (musicaAtiva) return;

    musicaAtiva = true;
    indiceNotaMusica = 0;
    loopMusicaFundo();
}

function pararMusicaFundo() {
    musicaAtiva = false;
    clearTimeout(temporizadorMusica);
}

function atualizarBotaoMudo() {
    botaoMudo.textContent = mudo ? "🔇 Efeitos" : "🔊 Efeitos";
    botaoMudo.setAttribute("aria-pressed", String(!mudo));
}

function atualizarBotaoMusica() {
    botaoMusica.textContent = musicaDesligada ? "🔇 Música" : "🎵 Música";
    botaoMusica.setAttribute("aria-pressed", String(!musicaDesligada));
}
