function interpolarEixo(anterior, atual, progresso) {
    const diferenca = atual - anterior;

    if (Math.abs(diferenca) >1) {
        return atual; //atravessou a borda no modo "sem paredes" - não anima o salto
    }

    return anterior + diferenca * progresso;
}

const TAMANHO_MAXIMO_FILA_DIRECOES = 2;

function definirDirecaoJogador(jogador, novaDirecao) {
    if (!jogador.filaDirecoes) {
        jogador.filaDirecoes = [];
    }

    const fila = jogador.filaDirecoes;
    // compara com a última direção pedida (ou com a atual, se a fila estiver vazia)
    const referencia = fila.length > 0 ? fila[fila.length - 1] : jogador.direcao;

    const mesmaDirecao = novaDirecao.x === referencia.x && novaDirecao.y === referencia.y;
    const meiaVolta = novaDirecao.x === -referencia.x && novaDirecao.y === -referencia.y

    if (mesmaDirecao || meiaVolta || fila.length >= TAMANHO_MAXIMO_FILA_DIRECOES) {
        return;
    }

    fila.push(novaDirecao);
}

function aplicarProximaDirecao(jogador) {
    if (jogador.filaDirecoes && jogador.filaDirecoes.length > 0) {
        jogador.direcao = jogador.filaDirecoes.shift();
    }
}

function misturarCores(corA, corB, proporcao) {
    const canais = [1, 3, 5].map((inicio) => {
        const a = parseInt(corA.slice(inicio, inicio + 2), 16);
        const b = parseInt(corB.slice(inicio, inicio + 2), 16);
        return Math.round(a + (b - a) * proporcao);
    });

    return `rgb(${canais[0]}, ${canais[1]}, ${canais[2]})`;
}