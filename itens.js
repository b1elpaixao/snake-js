// ==========================================
// Obstáculos e posições
// ==========================================
function gerarPosicaoLivre() {
    let candidato;

    do {
        candidato = {
            x: Math.floor(Math.random() * COLUNAS),
            y: Math.floor(Math.random() * LINHAS),
        };
    } while (
        posicaoOcupada(candidato, obstaculos, jogadores) ||
        mesmaPosicao(comida, candidato) ||
        ratos.some((rato) => mesmaPosicao(rato, candidato))
    );

    return candidato;
}

function gerarTipoPowerUp() {
    const tipos = ["invencibilidade", "velocidade", "pontosDobrados", "encolher", "ima"];
    const indice = Math.floor(Math.random() * tipos.length);
    return tipos[indice];
}

function gerarObstaculos() {
    const novosObstaculos = [];

    while (novosObstaculos.length < QUANTIDADE_OBSTACULOS) {
        const candidato = {
            x: Math.floor(Math.random() * COLUNAS),
            y: Math.floor(Math.random() * LINHAS),
        };

        const pertoDeAlgumJogador = jogadores.some(
            (jogador) =>
                Math.abs(candidato.x - jogador.cobra[0].x) <= 2 &&
                Math.abs(candidato.y - jogador.cobra[0].y) <= 2
        );
        const jaExiste = novosObstaculos.some(
            (o) => o.x === candidato.x && o.y === candidato.y
        );

        if (!pertoDeAlgumJogador && !jaExiste) {
            novosObstaculos.push(candidato);
        }
    }

    return novosObstaculos;
}

// posição livre que não fique colada nem na frente de nenhuma cobra
function gerarPosicaoParaPedra() {
    let posicao;
    let tentativas = 0;

    do {
        posicao = gerarPosicaoLivre();
        tentativas++;
    } while (
        tentativas < 100 &&
        jogadores.some((jogador) => pedraAtrapalhaJogador(posicao, jogador.cobra[0], jogador.direcao))
    );

    return posicao;
}

// no Díficil, as primeiras pedras do mapa passam a andar (metade na horizontal, metade na vertical)
function tornarPedrasMoveis() {
    obstaculos.slice(0, QUANTIDADE_PEDRAS_MOVEIS).forEach((pedra, indice) => {
        pedra.movel = true;
        pedra.direcao = indice % 2 === 0 ? { x: 1, y: 0 } : { x: 0, y: 1 };
        pedra.anterior = { x: pedra.x, y: pedra.y };
    });
}

function moverPedras() {
    contadorPassosPedras++;
    const vezDeAndar = contadorPassosPedras % TICKS_POR_PASSO_PEDRA === 0;
    const cabecas = jogadores.map((jogador) => jogador.cobra[0]);

    for (const pedra of obstaculos) {
        if (!pedra.movel) continue;

        pedra.anterior = { x: pedra.x, y: pedra.y };

        if (!vezDeAndar) continue;

        // a pedra não entra em nada, e nunca chega colada na cabeça de uma cobra
        const casaLivre = (posicao) =>
            !foraDoTabuleiro(posicao, COLUNAS, LINHAS) &&
            !posicaoOcupada(posicao, obstaculos, jogadores) &&
            cabecas.every((cabeca) => distanciaManhattan(cabeca, posicao) > 1) &&
            !mesmaPosicao(comida, posicao) &&
            !(comidaDourada && mesmaPosicao(comidaDourada, posicao)) &&
            !(powerUp && mesmaPosicao(powerUp, posicao)) &&
            !ratos.some((rato) => mesmaPosicao(rato, posicao));

        const passo = proximoPassoPedra(pedra, casaLivre);
        pedra.x = passo.x;
        pedra.y = passo.y;
        pedra.direcao = passo.direcao;
    }
}

function adicionarObstaculosSeNecessario() {
    if (modoAtual === "clássico" || modoAtual === "fases" || modoAtual === "desafio") return;

    const maiorPontuacao = Math.max(...jogadores.map((j) => j.pontuacao));
    const quantidadeAlvo = QUANTIDADE_OBSTACULOS + Math.floor(maiorPontuacao / PONTOS_POR_NOVO_OBSTACULO);

    while (obstaculos.length < quantidadeAlvo) {
        obstaculos.push(gerarPosicaoParaPedra());
    }
}

// ==========================================
// Comida
// ==========================================
function gerarComida() {
    // desafioDoDia vem primeiro: quando a página abre, modoAtual ainda nem existe
    if (desafioDoDia && modoAtual === "desafio") {
        return proximaComidaDoDesafio();
    }

    let candidato;

    do {
        candidato = {
            x: Math.floor(Math.random() * COLUNAS),
            y: Math.floor(Math.random() * LINHAS),
        };
    } while (
        posicaoOcupada(candidato, obstaculos, jogadores)
    );
    
    return candidato;
}

// pega a próxima maçã da lista do dia (pula as que caírem em cima de uma cobra)
function proximaComidaDoDesafio() {
    while (indiceComidaDesafio < desafioDoDia.comidas.length) {
        const casa = desafioDoDia.comidas[indiceComidaDesafio];
        indiceComidaDesafio++;

        if (!posicaoOcupada(casa, obstaculos, jogadores)) {
            return { x: casa.x, y: casa.y };
        }
    }

    return gerarPosicaoLivre(); // acabou a lista (partida muito longa): sorteia normal
}

function gerarComidaDourada() {
    const posicao = gerarPosicaoLivre();
    
    comidaDourada = { x: posicao.x, y: posicao.y, expiraEm: agoraDoJogo() +
DURACAO_COMIDA_DOURADA_MS };
}

// ==========================================
// Ratos (modo rato)
// ==========================================
function gerarRato(tipo) {
    let posicao;
    let tentativas = 0;

    // tenta nascer longe das cobras; se o tabuleiro estiver cheio, aceita qualquer casa livre
    do {
        posicao = gerarPosicaoLivre();
        tentativas++;
    } while (
        tentativas < 100 &&
        jogadores.some((jogador) => distanciaManhattan(jogador.cobra[0], posicao) < DISTANCIA_MINIMA_NASCER_RATO)
    );

    return {
        x: posicao.x,
        y: posicao.y,
        anterior: { x: posicao.x, y: posicao.y },
        direcao: { x: 1, y: 0},
        tipo,
    };
}

function criarRatosIniciais() {
    ratos = [];
    contadorTicksRatos = 0;

    if (modoAtual === "rato") {
        ratos.push(gerarRato("parado"));
        ratos.push(gerarRato("fujao"));
    }
}

function moverRatos() {
    contadorTicksRatos++;
    const cabecas = jogadores.map((jogador) => jogador.cobra[0]);
    const vezDeAndar = contadorTicksRatos % TICKS_POR_PASSO_RATO === 0;

    for (const rato of ratos) {
        rato.anterior = { x: rato.x, y: rato.y };

        if (!TIPOS_RATO[rato.tipo].anda || !vezDeAndar) {
            continue;
        }

        const casaLivre = (posicao) =>
            !foraDoTabuleiro(posicao, COLUNAS, LINHAS) &&
            !posicaoOcupada(posicao, obstaculos, jogadores) &&
            !ratos.some((outro) => outro !== rato && mesmaPosicao(outro, posicao));

        const destino = escolherPassoRato(rato, cabecas, casaLivre, DISTANCIA_ALERTA_RATO, Math.random);

        if (!mesmaPosicao(destino, rato)) {
            rato.direcao = { x: destino.x - rato.x, y: destino.y - rato.y };
            rato.x = destino.x;
            rato.y = destino.y;
        }
    }
}
