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

// ==========================================
// Posições e colisão (função pura - testadas em teste.js)
//  ==========================================
function mesmaPosicao(a, b) {
    return a.x === b.x && a.y === b.y;
}

function foraDoTabuleiro(posicao, colunas, linhas) {
    return posicao.x < 0 || posicao.x >= colunas || posicao.y < 0 || posicao.y >= linhas;
}

function calcularNovaCabeca(cabeca, direcao, semParedes, colunas, linhas) {
    let x = cabeca.x + direcao.x;
    let y = cabeca.y + direcao.y;

    if (semParedes) {
        x = (x + colunas) % colunas;
        y = (y + linhas) % linhas;
    }

    return { x, y };
}

function posicaoOcupada(posicao, obstaculos, jogadores) {
    return (
        obstaculos.some((obstaculo) => mesmaPosicao(obstaculo, posicao)) ||
        jogadores.some((jogador) => jogador.cobra.some((segmento) => mesmaPosicao(segmento, posicao)))
    );
}

function verificarColisao(jogador, jogadores, obstaculos, colunas, linhas) {
    const cabeca = jogador.cobra[0];

    if (foraDoTabuleiro(cabeca, colunas, linhas)) {
        return true;
    }

    if (jogador.invencivel) {
        return false;
    }

    const bateuNoProprioCorpo = jogador.cobra.slice(1).some((segmento) => mesmaPosicao(segmento, cabeca));
    const bateuEmObstaculo = obstaculos.some((obstaculo) => mesmaPosicao(obstaculo, cabeca));
    const bateuNoOutroJogador = jogadores.some(
        (outro) => outro !== jogador && outro.cobra.some((segmento) => mesmaPosicao(segmento, cabeca))
    );

    return bateuNoProprioCorpo || bateuEmObstaculo || bateuNoOutroJogador;
}

// ==========================================
// Modo rato (funções pura - testadas em teste.js)
// ==========================================
const DIRECOES = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
];
const CHANCE_RATO_PASSEAR = 0.4;

function distanciaManhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function distanciaAteMaisProxima(posicao, cabecas) {
    return Math.min(...cabecas.map((cabeca) => distanciaManhattan(posicao, cabeca)));
}

///devolve a próxima casa do rato (ou a mesma, se ele ficar parado)
//casaLivre(posicao) diz se o rato pode ir pra lá; sorteio() funciona como Math.random
function escolherPassoRato(rato, cabecas, casaLivre, distanciaAlerta, sorteio) {
    const parado = { x: rato.x, y: rato.y };
    const vizinhas = DIRECOES
        .map((direcao) => ({ x: rato.x + direcao.x, y: rato.y + direcao.y }))
        .filter(casaLivre);
    
    if (vizinhas.length === 0) {
        return parado; // encurralado
    }

    const distanciaAtual = distanciaAteMaisProxima(rato, cabecas);

    if (distanciaAtual <= distanciaAlerta) {
        // foge: vai pra casa mais longe da cabeça mais próxima
        let melhor = parado;
        let melhorDistancia = distanciaAtual;

        for (const vizinha of vizinhas) {
            const distancia = distanciaAteMaisProxima(vizinha, cabecas);
            if (distancia > melhorDistancia) {
                melhor = vizinha;
                melhorDistancia = distancia;
            }
        }

        return melhor;
    }

    // longe da cobra: às vezes dá um passeio
    if (sorteio() < CHANCE_RATO_PASSEAR) {
        return vizinhas[Math.floor(sorteio() * vizinhas.length)];
    }

    return parado;
}

// ==========================================
// Recordes (funções puras - testadas em testes.js)
// ==========================================
const TAMANHO_TOP_RECORDES = 5;

// tira registros inválidos (dado corrompido, bot, zero pontos)
function limparRecordes(lista) {
    if (!Array.isArray(lista)) {
        return [];
    }

    return lista.filter((registro) =>
        registro &&
        typeof registro.nome === "string" &&
        registro.nome !== "Bot" &&
        Number(registro.pontuacao) > 0
    );
}

// junta os registros novos, ordena do maior pro menor e fica só com o top 5
function juntarRecordes(lista, novosRegistros) {
    return lista
        .concat(novosRegistros)
        .sort((a, b) => b.pontuacao - a.pontuacao)
        .slice(0, TAMANHO_TOP_RECORDES);
}

// ==========================================
// Pedras Novas (funções puras - testadas em testes.js)
// ==========================================
const RAIO_SEGURO_PEDRA = 2;         // nenhuma pedra nova a 2 casas ou menos de cabeça
const ALCANCE_CAMINHO_PEDRA = 5;     // nem nas 5 casas bem na frente da cobra

function pedraAtrapalhaJogador(posicao, cabeca, direcao) {
    if (distanciaManhattan(posicao, cabeca) <= RAIO_SEGURO_PEDRA) {
        return true;
    }

    for (let passo =  1; passo <= ALCANCE_CAMINHO_PEDRA; passo++) {
        const casaNaFrente = { x: cabeca.x + direcao.x * passo, y: cabeca.y + direcao.y * passo };
        
        if (mesmaPosicao(posicao, casaNaFrente)) {
            return true;
        }
    }

    return false;
}

// ==========================================
// Conquista no fim da partida (função para  - testada em testes.js)
// ==========================================
// devolve "recorde" (bateu o 1° lugar), "top" (entrou no Top 5) ou null
function tipoDeConquista(pontuacoes, listaAntes) {
    const pontuacoesValidas = pontuacoes.filter((pontos) => pontos > 0);

    if (pontuacoesValidas.length === 0) {
        return null;
    }

    const recordeAnterior = listaAntes.length > 0 ? listaAntes[0].pontuacao : 0;

    if (pontuacoesValidas.some((pontos) => pontos > recordeAnterior)) {
        return "recorde";
    }

    const menorDoTop = listaAntes.length < TAMANHO_TOP_RECORDES ? 0 : listaAntes[listaAntes.length - 1].pontuacao;

    if (pontuacoesValidas.some((pontos) => pontos > menorDoTop)) {
        return "top";
    }

    return null;
}