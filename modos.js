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
    if (zonaArena) {
        atualizarRelogioDaArena();
        return;
    }
    elementoRelogio.title = "Tempo restante";
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
// 3 ou 4 jogadores: quem bate sai e o resto continua
// ==========================================
function tirarDaPartida(batidas) {
    const quem = batidas.map((batida) => batida.jogador);
    saidasDaPartida.push(batidas);
    jogadores = jogadores.filter((jogador) => !quem.includes(jogador));

    for (const jogador of quem) {
        jogador.fora = true;
        placaresDosJogadores[jogador.numero - 1].classList.add("fora");
        eliminacoesRecentes.push({ jogador, ate: performance.now() + 900 });
        adicionarTextoFlutuante(jogador.cobra[0], "Fora!", "#ff6b6b");
    }
    anunciar(`${quem.map((jogador) => jogador.nome).join(" e ")} ${quem.length === 1 ? "saiu" : "saíram"}. Sobraram ${jogadores.length}.`);
    tocarSomColisao();
    vibrar(80);
}

// quem acabou de sair pisca apagado no lugar onde bateu e some
function desenharQuemSaiu() {
    const agora = performance.now();
    eliminacoesRecentes = eliminacoesRecentes.filter((saida) => saida.ate > agora);
    for (const { jogador } of eliminacoesRecentes) {
        if (Math.floor(agora / 120) % 2 === 0) continue;
        ctx.save();
        ctx.globalAlpha = 0.3;
        desenharCobra(jogador);
        ctx.restore();
    }
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
    anunciar(elementoFase.textContent);
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
// no Chefão, com a espada, encostar no chefão é golpe e não batida
function jogadoresQueBatem(jogador) {
    if (modoCooperativo) return [jogador];
    if (chefao && jogador !== chefao && temEspada(jogador)) return [jogador];
    return jogadores;
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
    if (foraDaZonaAtual(jogador.inicio)) {
        jogador.cobra = [gerarPosicaoLivre()]; // na Arena o começo pode ter ficado fora da zona
        jogador.cobraAnterior = jogador.cobra.map((pedaco) => ({ ...pedaco }));
    }
    adicionarTextoFlutuante(jogador.cobra[0], "Volta em 3 s", "#ffffff");
}

function atualizarPlacarJuntos() {
    placarJuntos.hidden = !modoCooperativo;
    elementoPontosJuntos.textContent = jogadores.reduce((total, jogador) => total + jogador.pontuacao, 0);
}

// ==========================================
// Arena: a cada 15 s a zona fecha uma volta da borda
// ==========================================
let zonaArena = null; // { esquerda, topo, direita, baixo, final } na Arena; null nos outros modos
let avisouQueVaiFechar = false;

function foraDaZonaAtual(casa) {
    return zonaArena !== null && foraDaZona(casa, zonaArena);
}

function prepararArena() {
    zonaArena = modoAtual === "arena" ? zonaDaArena(0, COLUNAS, LINHAS) : null;
    avisouQueVaiFechar = false;
}

function atualizarRelogioDaArena() {
    const restante = tempoParaFecharArena(tempoDaPartidaMs, COLUNAS, LINHAS);
    elementoRelogio.title = "Tempo até a zona fechar";
    elementoRelogio.textContent = restante === null ? "Zona final" : `Zona ${formatarRelogio(restante)}`;
    elementoRelogio.classList.toggle("acabando", restante !== null && restante <= ARENA_AVISO_MS);
}

// chamado a cada meio passo; devolve true quando a zona acabou de fechar
function atualizarZonaDaArena() {
    atualizarRelogioDaArena();
    const restante = tempoParaFecharArena(tempoDaPartidaMs, COLUNAS, LINHAS);

    if (restante !== null && restante <= ARENA_AVISO_MS && !avisouQueVaiFechar) {
        avisouQueVaiFechar = true;
        tocarSom(440, 0.12, "square");
        anunciar("A zona vai fechar");
    }

    const nova = zonaDaArena(tempoDaPartidaMs, COLUNAS, LINHAS);
    if (nova.esquerda === zonaArena.esquerda) return false;

    zonaArena = nova;
    avisouQueVaiFechar = false;

    for (const jogador of jogadores) {
        const antes = jogador.cobra.length;
        jogador.cobra = cortarCobraNaZona(jogador.cobra, zonaArena);
        jogador.cobraAnterior = jogador.cobraAnterior.slice(0, jogador.cobra.length);
        if (jogador.cobra.length < antes) adicionarTextoFlutuante(jogador.cobra[0], "Queimou!", "#ff8a65");
    }

    // o que ficou fora some: a maçã nasce de novo dentro da zona
    obstaculos = obstaculos.filter((pedra) => !foraDaZonaAtual(pedra));
    if (foraDaZonaAtual(comida)) comida = gerarComida();
    if (powerUp && foraDaZonaAtual(powerUp)) powerUp = null;
    if (comidaDourada && foraDaZonaAtual(comidaDourada)) comidaDourada = null;

    tocarSom(160, 0.3, "sawtooth");
    vibrar(100);
    if (zonaArena.final) {
        anunciar("Zona final");
        verificarConquistas({ zonaFinal: true });
    }
    return true;
}
