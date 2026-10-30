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
        ganhoMusica.connect(contextoAudio.destination);
        ganhoEfeitos.connect(contextoAudio.destination);
        aplicarVolumes();
    }
    return contextoAudio;
}

// chamado quando mexe nas barrinhas (e quando o áudio nasce)
function aplicarVolumes() {
    if (!ganhoMusica) return;
    ganhoMusica.gain.value = volumeMusica / 50;
    ganhoEfeitos.gain.value = volumeEfeitos / 50;
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
        ganho.gain.setValueAtTime(0.2, inicio);
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
    ganho.gain.setValueAtTime(peca === "caixa" ? 0.12 : 0.05, inicio);
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
    botaoOuvirMusica.textContent = `■ Parar (${musica.nome})`;
    botaoOuvirMusica.setAttribute("aria-pressed", "true");
}

function pararDeOuvirMusica() {
    if (!ouvindoNoMenu) return;
    ouvindoNoMenu = false;
    clearTimeout(temporizadorMusica);
    botaoOuvirMusica.textContent = "▶ Ouvir";
    botaoOuvirMusica.setAttribute("aria-pressed", "false");
}

// barrinhas e lista do cartão Som (a lista é montada na primeira vez)
function mostrarControlesDeSom() {
    const seletor = document.getElementById("seletorMusica");
    if (seletor.options.length === 0) {
        for (const musica of MUSICAS.filter((outra) => !outra.soChefao)) seletor.add(new Option(`${musica.nome} · ${musica.descricao}`, musica.id));
        seletor.add(new Option("Sortear a cada partida", "sortear"));
    }
    seletor.value = musicaEscolhida;
    document.getElementById("volumeMusica").value = volumeMusica;
    document.getElementById("volumeEfeitos").value = volumeEfeitos;
    document.getElementById("valorVolumeMusica").textContent = `${volumeMusica}%`;
    document.getElementById("valorVolumeEfeitos").textContent = `${volumeEfeitos}%`;
}

function atualizarBotaoMudo() {
    botaoMudo.textContent = mudo ? "🔇 Efeitos" : "🔊 Efeitos";
    botaoMudo.setAttribute("aria-pressed", String(!mudo));
}

function atualizarBotaoMusica() {
    botaoMusica.textContent = musicaDesligada ? "🔇 Música" : "🎵 Música";
    botaoMusica.setAttribute("aria-pressed", String(!musicaDesligada));
}
