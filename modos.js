// ==========================================
// Modo Contra o Tempo
// ==========================================
function estaAtordoado(jogador) {
    return jogador.atordoadoAte > agoraDoJogo();
}

function penalizarBatida(jogador) {
    // volta pra onde estava antes de bater e perde pedaços do rabo
    jogador.cobra = encolherCobra(jogador.cobraAnterior, PEDACOS_PERDIDOS_NA_BATIDA);
    jogador.cobraAnterior = jogador.cobra.map((segmento) => ({ ...segmento }));
    jogador.filaDirecoes = [];
    jogador.comboAtual = 0;
    jogador.elementoPontuacao.textContent = jogador.pontuacao;
    jogador.atordoadoAte = agoraDoJogo() + DURACAO_ATORDOADO_MS;
    adicionarTextoFlutuante(jogador.cobra[0], "Bateu!", "#ff8a80");
}

function atualizarRelogio() {
    const restante = DURACAO_MODO_TEMPO_MS - tempoDaPartidaMs;
    elementoRelogio.textContent = formatarRelogio(restante);
    elementoRelogio.classList.toggle("acabando", restante <= 10000);
}

function encerrarPorTempo() {
    jogoAtivo = false;
    travarSemParedes(false);
    pararMusicaFundo();
    tocarSom(660, 0.4, "square");
    vibrar(200);
    mostrarTelaGameOver(jogadores, []);
}

// ==========================================
// Modo Fases
// ==========================================
// coloca as paredes do mapa e põe as cobras (pequenas) nos pontos de partida
function carregarFase(numero) {
    const mapa = lerMapa(MAPAS_DAS_FASES[numero - 1]. linhas);

    faseAtual = numero;
    obstaculos = mapa.paredes;

    jogadores.forEach((jogador, indice) => {
        const inicio = mapa.inicios[indice];
        jogador.cobra = [{ x: inicio.x, y: inicio.y }];
        jogador.cobraAnterior = [{ x: inicio.x, y: inicio.y }];
        jogador.direcao = indice === 0 ? { x: 1, y: 0 } : { x: -1, y: 0};
        jogador.inicio = { x: inicio.x, y: inicio.y }; // no 2 Juntos, quem bate volta pra cá
        jogador.direcaoInicial = { ...jogador.direcao };
        jogador.filaDirecoes = [];
    });

    elementoFase.textContent = `Fase ${numero} · ${MAPAS_DAS_FASES[numero - 1].nome}`;
}

function passarDeFase(numero) {
    carregarFase(numero);
    verificarConquistas();
    comida = gerarComida();
    powerUp = null;
    comidaDourada = null;
    textosFlutuantes = [];

    // pausa e mostra "Fase 2", depois 3, 2, 1, Vai!
    pausado = true;
    pausadoDesde = performance.now();
    iniciarContagem(sairDaPausa, [`Fase ${numero}`, "3", "2", "1", "Vai!"]);
}


// ==========================================
// 2 Juntos (cooperativo)
// ==========================================
const DURACAO_FORA_JUNTOS_MS = 3000;

// no 2 Juntos uma cobra passa por dentro da outra: só conta bater em si mesma, pedra e parede
function jogadoresQueBatem(jogador) {
    return modoCooperativo ? [jogador] : jogadores;
}

// quem bateu volta pro começo, desde que o parceiro continue no jogo
function parceiroContinuaNoJogo(batidas) {
    if (!modoCooperativo) return false;

    return jogadores.some((jogador) =>
        !batidas.some((batida) => batida.jogador === jogador) && !estaAtordoado(jogador)
    );
}

function voltarAoInicio(jogador) {
    jogador.cobra = [{ ...jogador.inicio }];
    jogador.cobraAnterior = [{ ...jogador.inicio }];
    jogador.direcao = { ...jogador.direcaoInicial };
    jogador.direcaoAndada = { ...jogador.direcaoInicial };
    jogador.filaDirecoes = [];
    jogador.comboAtual = 0;
    jogador.bateu = false;
    jogador.atordoadoAte = agoraDoJogo() + DURACAO_FORA_JUNTOS_MS; // pisca parada no começo e volta a andar
    adicionarTextoFlutuante(jogador.inicio, "Volta em 3 s", "#ffffff");
}

function atualizarPlacarJuntos() {
    placarJuntos.hidden = !modoCooperativo;
    elementoPontosJuntos.textContent = jogadores.reduce((total, jogador) => total + jogador.pontuacao, 0);
}
