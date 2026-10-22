// ==========================================
// Fantasma do recorde
// ==========================================
// com 1 jogador, uma cobra transparente refaz a sua melhor partida de hoje naquele modo
const LIMITE_PASSOS_FANTASMA = 20000; // uns 10 minutos de partida: depois disso para de gravar
const DURACAO_SUMIR_FANTASMA_MS = 1000;
const COR_FANTASMA = "#e8f5e9";
const OPACIDADE_FANTASMA = 0.35;

let gravacaoDoFantasma = null; // passos da partida atual, ou null quando não grava (2 jogadores)
let fantasma = null;           // { passos, pontuacao } da melhor partida de hoje, ou null
let tempoDoUltimoMeioPasso = { em: null, duracao: 0 }; // pra o fantasma andar liso entre um passo e outro

function lerFantasmas() {
    try {
        return JSON.parse(lerDoArmazenamento("snakeFantasmas"));
    } catch {
        return null; // dado corrompido: começa sem fantasma
    }
}

// chamado no reiniciar, com as cobras já no lugar
function prepararFantasma() {
    gravacaoDoFantasma = null;
    fantasma = null;
    tempoDoUltimoMeioPasso = { em: null, duracao: 0 };

    if (jogadores.length !== 1 || modoAtual === "personalizada") return; // fase criada: cada mapa é diferente

    // começa com o corpo inicial (do rabo pra cabeça), no tempo 0
    const cobra = jogadores[0].cobra;
    gravacaoDoFantasma = [];
    for (let i = cobra.length - 1; i >= 0; i--) {
        gravacaoDoFantasma.push([0, cobra[i].x, cobra[i].y, cobra.length]);
    }

    fantasma = fantasmasDoDia(lerFantasmas(), dataDeHoje()).porModo[modoAtual] || null;
}

// chamado no loop a cada meio passo, logo depois de somar o tempo da partida
function marcarTempoDoFantasma(duracao) {
    tempoDoUltimoMeioPasso = { em: agoraDoJogo(), duracao };
}

// chamado no loop depois que a cobra anda
function gravarPassoDoFantasma(jogador) {
    if (!gravacaoDoFantasma || jogador !== jogadores[0] || gravacaoDoFantasma.length >= LIMITE_PASSOS_FANTASMA) return;

    const cabeca = jogador.cobra[0];
    gravacaoDoFantasma.push([Math.round(tempoDaPartidaMs), cabeca.x, cabeca.y, jogador.cobra.length]);
}

// chamado no fim da partida: se foi a melhor de hoje, vira o novo fantasma
function guardarFantasmaDaPartida() {
    if (!gravacaoDoFantasma) return;

    const novos = guardarFantasmaSeMelhor(lerFantasmas(), dataDeHoje(), modoAtual, jogadores[0].pontuacao, gravacaoDoFantasma);
    gravacaoDoFantasma = null;

    if (novos) {
        salvarNoArmazenamento("snakeFantasmas", JSON.stringify(novos));
    }
}

// o tempo da partida "agora", contando o pedaço do meio passo que já passou
// (relógio do jogo: na pausa ele para, e o fantasma congela junto com a cobra)
function tempoDaPartidaParaDesenho() {
    const { em, duracao } = tempoDoUltimoMeioPasso;

    if (em === null) return 0;
    if (!jogoAtivo) return tempoDaPartidaMs;

    return tempoDaPartidaMs + Math.min(Math.max(agoraDoJogo() - em, 0), duracao);
}

// a trilha do fantasma no mesmo formato da trilhaDaCobra: está nas casas do passo "indice"
// e a cabeça já vai andando rumo à casa do passo seguinte
function trilhaDoFantasma(passos, indice, andou) {
    const celulas = corpoDoFantasma(passos, indice);
    const proximo = passos[indice + 1];
    const cabecaDepois = proximo ? { x: proximo[1], y: proximo[2] } : celulas[0];
    const direcao = direcaoDoFantasma(celulas[0], cabecaDepois, COLUNAS, LINHAS);

    if (!direcao) {
        // parada (fim da partida dele) ou trocou de fase: fica onde está, olhando pra onde veio
        const anterior = passos[indice - 1];
        const veioDe = anterior ? direcaoDoFantasma({ x: anterior[1], y: anterior[2] }, celulas[0], COLUNAS, LINHAS) : null;
        return { pontos: celulas.length > 1 ? celulas : [celulas[0]], direcao: veioDe || { x: 1, y: 0 } };
    }

    const crescendo = proximo[3] > passos[indice][3];
    const cabeca = { x: celulas[0].x + direcao.x * andou, y: celulas[0].y + direcao.y * andou };
    const pontos = [cabeca, ...celulas];

    if (!crescendo && celulas.length > 1) {
        const rabo = celulas[celulas.length - 1];
        const frente = celulas[celulas.length - 2];
        pontos[pontos.length - 1] = { x: rabo.x + (frente.x - rabo.x) * andou, y: rabo.y + (frente.y - rabo.y) * andou };
    } else if (!crescendo) {
        pontos.pop(); // cobra de 1 casa: só a cabeça
    }

    return { pontos, direcao };
}

function desenharFantasma() {
    if (!fantasma || noMenu) return;

    const passos = fantasma.passos;
    const tempo = tempoDaPartidaParaDesenho();
    const indice = passoDoFantasmaNoTempo(passos, tempo);

    if (indice < 0) return;

    const ultimo = indice >= passos.length - 1;
    const tempoDepoisDoFim = ultimo ? tempo - passos[indice][0] : 0;

    if (tempoDepoisDoFim >= DURACAO_SUMIR_FANTASMA_MS) return; // a partida do fantasma acabou: ele some

    const duracaoDoPasso = ultimo ? 0 : passos[indice + 1][0] - passos[indice][0];
    const andou = duracaoDoPasso > 0 ? Math.min((tempo - passos[indice][0]) / duracaoDoPasso, 1) : 0;
    const cores = { invencivel: false, corCorpo: COR_FANTASMA, corCabeca: COR_FANTASMA };

    ctx.save();
    ctx.globalAlpha = OPACIDADE_FANTASMA * (1 - tempoDepoisDoFim / DURACAO_SUMIR_FANTASMA_MS);
    desenharCobra(cores, trilhaDoFantasma(passos, indice, andou));
    ctx.restore();
}
