// ==========================================
// Som
// ==========================================
// As músicas (MUSICAS) e as contas delas ficam no logica.js; aqui é só tocar.
// Volume: 50% é o volume de antes; 100% é o dobro
let contextoAudio = null;
let ganhoMusica = null;   // o volume da música (barrinha "Música")
let ganhoEfeitos = null;  // o volume dos efeitos (barrinha "Efeitos")
let musicaAtiva = false;
let musicaTocando = null; // { musica, passo, proximoEm (no relógio do áudio) }
let ouvindoNoMenu = false; // o botão "Ouvir" do cartão Som
let temporizadorMusica = null;

function obterContextoAudio() {
    if (!contextoAudio) {
        contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
        ganhoMusica = contextoAudio.createGain();
        ganhoEfeitos = contextoAudio.createGain();
        ligarSaidasDoAudio(contextoAudio);
        aplicarVolumes();
    }
    return contextoAudio;
}

// tudo passa por um compressor (som mais cheio, sem estourar); a música ganha um ecozinho
function ligarSaidasDoAudio(ctxAudio) {
    const mestre = ctxAudio.createDynamicsCompressor();
    mestre.threshold.value = -16;
    mestre.ratio.value = 5;
    mestre.attack.value = 0.003;
    mestre.release.value = 0.2;
    mestre.connect(ctxAudio.destination);
    ganhoEfeitos.connect(mestre);
    ganhoMusica.connect(mestre);

    const eco = ctxAudio.createDelay(1);
    const voltaDoEco = ctxAudio.createGain();
    const volumeDoEco = ctxAudio.createGain();
    const filtroDoEco = ctxAudio.createBiquadFilter();
    eco.delayTime.value = 0.19;
    voltaDoEco.gain.value = 0.25;
    volumeDoEco.gain.value = 0.18;
    filtroDoEco.type = "bandpass"; // sem grave nem chiado: só a melodia ecoa
    filtroDoEco.frequency.value = 1200;
    filtroDoEco.Q.value = 0.5;
    ganhoMusica.connect(filtroDoEco);
    filtroDoEco.connect(eco);
    eco.connect(voltaDoEco);
    voltaDoEco.connect(eco);
    eco.connect(volumeDoEco);
    volumeDoEco.connect(mestre);
}

// chamado quando mexe nas barrinhas (e quando o áudio nasce)
function aplicarVolumes() {
    if (!ganhoMusica) return;
    const ligado = plataformaCalaOSom() ? 0 : 1;
    ganhoMusica.gain.value = ligado * volumeMusica / 50;
    ganhoEfeitos.gain.value = ligado * volumeEfeitos / 50 * 1.8; // o compressor segura: os efeitos precisam aparecer em cima da música
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
    ganho.connect(ganhoEfeitos);

    oscilador.start();
    oscilador.stop(ctxAudio.currentTime + duracaoSegundos);
}

// uma nota de efeito: pode começar depois (atraso) e escorregar até outra frequência
function tocarNotaDeEfeito(frequencia, atraso, duracao, onda, volume, frequenciaFinal = frequencia) {
    if (mudo) return;
    const ctxAudio = obterContextoAudio();
    const inicio = ctxAudio.currentTime + atraso;
    const oscilador = ctxAudio.createOscillator();
    const ganho = ctxAudio.createGain();
    oscilador.type = onda;
    oscilador.frequency.setValueAtTime(frequencia, inicio);
    if (frequenciaFinal !== frequencia) oscilador.frequency.exponentialRampToValueAtTime(frequenciaFinal, inicio + duracao);
    ganho.gain.value = 0;
    ganho.gain.setValueAtTime(0.0001, inicio);
    ganho.gain.linearRampToValueAtTime(volume, inicio + 0.005);
    ganho.gain.exponentialRampToValueAtTime(0.001, inicio + duracao);
    oscilador.connect(ganho);
    ganho.connect(ganhoEfeitos);
    oscilador.start(inicio);
    oscilador.stop(inicio + duracao + 0.02);
}

// um estouro de chiado, com o filtro fechando (de frequencia até frequenciaFinal)
function tocarChiadoDeEfeito(atraso, duracao, volume, frequencia, frequenciaFinal) {
    if (mudo) return;
    const ctxAudio = obterContextoAudio();
    const inicio = ctxAudio.currentTime + atraso;
    const chiado = ctxAudio.createBufferSource();
    const filtro = ctxAudio.createBiquadFilter();
    const ganho = ctxAudio.createGain();
    chiado.buffer = ruidoDaMusica(ctxAudio);
    filtro.type = "lowpass";
    filtro.frequency.setValueAtTime(frequencia, inicio);
    filtro.frequency.exponentialRampToValueAtTime(frequenciaFinal, inicio + duracao);
    ganho.gain.value = 0;
    ganho.gain.setValueAtTime(volume, inicio);
    ganho.gain.exponentialRampToValueAtTime(0.001, inicio + duracao);
    chiado.connect(filtro);
    filtro.connect(ganho);
    ganho.connect(ganhoEfeitos);
    chiado.start(inicio);
    chiado.stop(inicio + duracao + 0.02);
}

// nham: duas notinhas subindo. Cada ponto de combo sobe um tom (até x8)
function tocarSomComer(combo = 1, volume = 1) {
    const base = 520 * Math.pow(2, (Math.min(Math.max(combo, 1), 8) - 1) * 2 / 12);
    tocarNotaDeEfeito(base, 0, 0.06, "square", 0.14 * volume);
    tocarNotaDeEfeito(base * 1.5, 0.05, 0.1, "square", 0.16 * volume);
    tocarChiadoDeEfeito(0, 0.03, 0.08 * volume, 6000, 2000);
}

// pancada: grave que cai, chiado da batida e um rasgo
function tocarSomColisao() {
    tocarNotaDeEfeito(170, 0, 0.32, "sine", 0.55, 38);
    tocarNotaDeEfeito(120, 0, 0.22, "sawtooth", 0.16, 50);
    tocarChiadoDeEfeito(0, 0.28, 0.38, 3500, 250);
}

function tocarSomComidaDourada() {
    [880, 1175, 1568].forEach((nota, indice) => tocarNotaDeEfeito(nota, indice * 0.06, 0.16, "triangle", 0.24));
    tocarNotaDeEfeito(2093, 0.18, 0.3, "sine", 0.12);
}

// pegou um power-up: sobe rasgando e termina num ping
function tocarSomPoder() {
    tocarNotaDeEfeito(380, 0, 0.18, "sawtooth", 0.12, 1300);
    tocarNotaDeEfeito(1320, 0.16, 0.22, "triangle", 0.22);
}

function tocarSomExplosao() {
    tocarNotaDeEfeito(110, 0, 0.6, "sine", 0.6, 28);
    tocarNotaDeEfeito(70, 0, 0.4, "sawtooth", 0.18, 35);
    tocarChiadoDeEfeito(0, 0.7, 0.5, 5000, 120);
}

// 3, 2, 1: toc grave; "Vai!": agudo com pancada
function tocarSomContagem(ultimoPasso) {
    if (ultimoPasso) {
        tocarNotaDeEfeito(880, 0, 0.3, "square", 0.17);
        tocarNotaDeEfeito(440, 0, 0.3, "square", 0.12);
        tocarNotaDeEfeito(150, 0, 0.2, "sine", 0.45, 45);
        tocarChiadoDeEfeito(0, 0.15, 0.2, 5000, 800);
    } else {
        tocarNotaDeEfeito(440, 0, 0.1, "square", 0.15);
        tocarNotaDeEfeito(110, 0, 0.12, "sine", 0.3, 60);
    }
}

// vibra o celular (o botão "Efeitos" desliga a vibração também)
// padrao: milissegundos de vibração, ou uma lista [vibra, pausa, vibra, ...]
function vibrar(padrao) {
    if (mudo) return;
    tremerControles(padrao); // controle de videogame treme junto
    if (navigator.vibrate) navigator.vibrate(padrao);
}

// ==========================================
// Música: as notas são marcadas um pouquinho adiantado no relógio do áudio,
// assim o ritmo não tropeça quando o jogo engasga
// ==========================================
function tocarNotaDaMusica(ctxAudio, frequencia, inicio, duracao, onda, volume) {
    const oscilador = ctxAudio.createOscillator();
    const ganho = ctxAudio.createGain();
    ganho.gain.value = 0; // mudo até a hora da nota (senão escapa um estalo no começo)
    oscilador.type = onda;
    oscilador.frequency.value = frequencia;
    ganho.gain.setValueAtTime(0.0001, inicio);
    ganho.gain.linearRampToValueAtTime(volume, inicio + 0.01);
    ganho.gain.exponentialRampToValueAtTime(0.001, inicio + duracao);
    oscilador.connect(ganho);
    ganho.connect(ganhoMusica);
    oscilador.start(inicio);
    oscilador.stop(inicio + duracao + 0.02);
}

// chiado guardado pra caixa e chimbal (1 s de ruído, feito uma vez só)
let ruidoDaBateria = null;
function ruidoDaMusica(ctxAudio) {
    if (!ruidoDaBateria) {
        ruidoDaBateria = ctxAudio.createBuffer(1, ctxAudio.sampleRate, ctxAudio.sampleRate);
        const dados = ruidoDaBateria.getChannelData(0);
        for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
    }
    return ruidoDaBateria;
}

// bumbo (grave que cai), caixa (chiado médio) ou chimbal (chiado agudo e curtinho)
function tocarBatida(ctxAudio, peca, inicio) {
    const ganho = ctxAudio.createGain();
    ganho.gain.value = 0; // mudo até a hora da batida (senão o chiado estala no começo)
    ganho.connect(ganhoMusica);
    if (peca === "bumbo") {
        const oscilador = ctxAudio.createOscillator();
        oscilador.frequency.setValueAtTime(140, inicio);
        oscilador.frequency.exponentialRampToValueAtTime(40, inicio + 0.12);
        ganho.gain.setValueAtTime(0.32, inicio);
        ganho.gain.exponentialRampToValueAtTime(0.001, inicio + 0.16);
        oscilador.connect(ganho);
        oscilador.start(inicio);
        oscilador.stop(inicio + 0.18);
        return;
    }
    const chiado = ctxAudio.createBufferSource();
    const filtro = ctxAudio.createBiquadFilter();
    chiado.buffer = ruidoDaMusica(ctxAudio);
    filtro.type = "highpass";
    filtro.frequency.value = peca === "caixa" ? 1200 : 7000;
    const duracao = peca === "caixa" ? 0.12 : 0.04;
    ganho.gain.setValueAtTime(peca === "caixa" ? 0.16 : 0.05, inicio);
    ganho.gain.exponentialRampToValueAtTime(0.001, inicio + duracao);
    chiado.connect(filtro);
    filtro.connect(ganho);
    chiado.start(inicio);
    chiado.stop(inicio + duracao + 0.02);
}

// toca tudo que começa neste passo da música, no tempo "inicio" do relógio do áudio
function tocarPassoDaMusica(ctxAudio, musica, passo, inicio) {
    const duracaoDoPasso = duracaoDoPassoDaMusica(musica);
    for (const nota of notasDoPasso(musica, passo)) {
        tocarNotaDaMusica(ctxAudio, frequenciaDaNota(nota.nota), inicio, nota.duracao * duracaoDoPasso * 0.95, nota.onda, nota.volume);
    }
    for (const peca of batidasDoPasso(musica, passo)) tocarBatida(ctxAudio, peca, inicio);
}

// a cada 25 ms marca as notas dos próximos 0,12 s. Na pausa (ou com a música desligada) ela espera parada
function loopMusicaFundo() {
    const ctxAudio = obterContextoAudio();
    const tocando = ouvindoNoMenu || (jogoAtivo && !pausado && !musicaDesligada);

    if (!tocando) musicaTocando.proximoEm = ctxAudio.currentTime + 0.05;
    while (tocando && musicaTocando.proximoEm < ctxAudio.currentTime + 0.12) {
        tocarPassoDaMusica(ctxAudio, musicaTocando.musica, musicaTocando.passo, musicaTocando.proximoEm);
        musicaTocando.passo = (musicaTocando.passo + 1) % passosDaMusica(musicaTocando.musica);
        musicaTocando.proximoEm += duracaoDoPassoDaMusica(musicaTocando.musica);
    }

    temporizadorMusica = setTimeout(loopMusicaFundo, 25);
}

function comecarMusica(musica) {
    clearTimeout(temporizadorMusica);
    musicaTocando = { musica, passo: 0, proximoEm: obterContextoAudio().currentTime + 0.05 };
    loopMusicaFundo();
}

function iniciarMusicaFundo() {
    if (musicaAtiva) return;

    pararDeOuvirMusica();
    musicaAtiva = true;
    botaoOuvirMusica.disabled = true; // durante a partida o "Ouvir" descansa
    const sorteio = musicaEscolhida === "sortear" ? Math.random() : 0; // só sorteia quando precisa
    comecarMusica(escolherMusica(musicaEscolhida, modoAtual === "chefao", sorteio));
}

function pararMusicaFundo() {
    musicaAtiva = false;
    clearTimeout(temporizadorMusica);
    botaoOuvirMusica.disabled = false;
}

// botão "Ouvir" do cartão Som: toca a música escolhida ali mesmo no menu
function alternarOuvirMusica() {
    if (ouvindoNoMenu) {
        pararDeOuvirMusica();
        return;
    }
    const ctxAudio = obterContextoAudio();
    if (ctxAudio.state === "suspended") ctxAudio.resume();
    const musica = escolherMusica(musicaEscolhida, false, Math.random());
    ouvindoNoMenu = true;
    comecarMusica(musica);
    botaoOuvirMusica.textContent = tr("■ Parar ({musica})", { musica: musica.nome });
    botaoOuvirMusica.setAttribute("aria-pressed", "true");
}

function pararDeOuvirMusica() {
    if (!ouvindoNoMenu) return;
    ouvindoNoMenu = false;
    clearTimeout(temporizadorMusica);
    botaoOuvirMusica.textContent = tr("▶ Ouvir");
    botaoOuvirMusica.setAttribute("aria-pressed", "false");
}

// barrinhas e lista do cartão Som (a lista é montada na primeira vez)
function mostrarControlesDeSom() {
    const seletor = document.getElementById("seletorMusica");
    if (seletor.options.length === 0) {
        for (const musica of MUSICAS.filter((outra) => !outra.soChefao)) seletor.add(new Option(`${musica.nome} · ${musica.descricao}`, musica.id));
        seletor.add(new Option(tr("Sortear a cada partida"), "sortear"));
    }
    seletor.value = musicaEscolhida;
    document.getElementById("volumeMusica").value = volumeMusica;
    document.getElementById("volumeEfeitos").value = volumeEfeitos;
    document.getElementById("valorVolumeMusica").textContent = `${volumeMusica}%`;
    document.getElementById("valorVolumeEfeitos").textContent = `${volumeEfeitos}%`;
}

function atualizarBotaoMudo() {
    botaoMudo.textContent = tr(mudo ? "🔇 Efeitos" : "🔊 Efeitos");
    botaoMudo.setAttribute("aria-pressed", String(!mudo));
}

function atualizarBotaoMusica() {
    botaoMusica.textContent = tr(musicaDesligada ? "🔇 Música" : "🎵 Música");
    botaoMusica.setAttribute("aria-pressed", String(!musicaDesligada));
}
