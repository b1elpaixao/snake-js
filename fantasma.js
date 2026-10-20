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

    if (jogadores.length !== 1) return;

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
    tempoDoUltimoMeioPasso = { em: performance.now(), duracao };
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
function tempoDaPartidaParaDesenho() {
    const { em, duracao } = tempoDoUltimoMeioPasso;

    if (em === null) return 0;
    if (!jogoAtivo || pausado) return tempoDaPartidaMs;

    // a cobra chega na casa nova só no fim do passo; o fantasma acompanha o mesmo atraso
    return tempoDaPartidaMs - duracao + Math.min(performance.now() - em, duracao);
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

    const proximo = ultimo ? indice : indice + 1;
    const duracaoDoPasso = passos[proximo][0] - passos[indice][0];
    const progresso = duracaoDoPasso > 0 ? Math.min((tempo - passos[indice][0]) / duracaoDoPasso, 1) : 1;
    const cobra = corpoDoFantasma(passos, proximo);
    const cobraAnterior = corpoDoFantasma(passos, indice);
    const cabecaAntes = { x: passos[Math.max(proximo - 1, 0)][1], y: passos[Math.max(proximo - 1, 0)][2] };
    const direcao = mesmaPosicao(cabecaAntes, cobra[0]) ? { x: 1, y: 0 } : direcaoDoFantasma(cabecaAntes, cobra[0]);

    ctx.save();
    ctx.globalAlpha = OPACIDADE_FANTASMA * (1 - tempoDepoisDoFim / DURACAO_SUMIR_FANTASMA_MS);
    desenharCobra({ cobra, cobraAnterior, direcao, invencivel: false, corCorpo: COR_FANTASMA, corCabeca: COR_FANTASMA }, progresso);
    ctx.restore();
}
