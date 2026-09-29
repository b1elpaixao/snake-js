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

// devolve por que a cobra bateu ("parede", "proprioCorpo", "pedra", "outroJogador") ou nulll se não bateu
function motivoDaColisao(jogador, jogadores, obstaculos, colunas, linhas) {
    const cabeca = jogador.cobra[0];

    if (foraDoTabuleiro(cabeca, colunas, linhas)) {
        return "parede";// nem invencível escapa da parede
    }

    if (jogador.invencivel) {
        return null;
    }

    if (jogador.cobra.slice(1).some((segmento) => mesmaPosicao(segmento, cabeca))) {
        return "proprioCorpo";
    }

    if (obstaculos.some((obstaculo) => mesmaPosicao(obstaculo, cabeca))) {
        return "pedra";
    }

    const bateuNoOutroJogador = jogadores.some(
        (outro) => outro !== jogador && outro.cobra.some((segmento) => mesmaPosicao(segmento, cabeca))
    );
    
    return bateuNoOutroJogador ? "outroJogador" : null;
}

function verificarColisao(jogador, jogadores, obstaculos, colunas, linhas) {
    return motivoDaColisao(jogador, jogadores, obstaculos, colunas, linhas) !== null;
}

// frase pra tela de fim de jogo, ex.: "Ana bateu numa pedra"
function descreverBatida(nome, motivo, nomeDoOutro) {
    const frases = {
        parede: "bateu na parede",
        proprioCorpo: "bateu no próprio corpo",
        pedra: "bateu numa pedra",
        outroJogador: `bateu em ${nomeDoOutro}`,
    };

    return `${nome} ${frases[motivo]}`;
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

// ==========================================
// Bot (função puras - testadas em testes.js)
// ==========================================
function chavePosicao(posicao) {
    return `${posicao.x},${posicao.y}`;
}

// quantas casas livres dá pra alcançar a partir de "inicio" (para de contar ao chegar no limite)
// andar(posicao, direcao) devolve a casa vizinha; casaLivre(posicao) diz se dá pra entrar nela
function contarEspacoLivre(inicio, andar, casaLivre, limite) {
    const vistas = new Set([chavePosicao(inicio)]);
    const fila = [inicio];
    let total = 0;

    while (fila.length > 0 && total < limite) {
        const atual = fila.shift();
        total++;

        for (const direcao of DIRECOES) {
            const vizinha = andar(atual, direcao);
            const chave = chavePosicao(vizinha);

            if (!vistas.has(chave) && casaLivre(vizinha)) {
                vistas.add(chave);
                fila.push(vizinha);
            }
        }
    }

    return total;
}

// vai atrás do alvo, mas só por caminhos com espaço suficiente para caber a cobra
function escolherDirecaoBot(cabeca, direcaoAtual, alvo, andar, casaLivre, espacoNecessario) {
    const opcoes = DIRECOES
        .filter((direcao) => !(direcao.x === -direcaoAtual.x && direcao.y === -direcaoAtual.y))
        .map((direcao) => ({ direcao, destino: andar(cabeca, direcao) }))
        .filter((opcao) => casaLivre(opcao.destino))
        .map((opcao) => ({
            ...opcao,
            espaco: contarEspacoLivre(opcao.destino, andar, casaLivre, espacoNecessario),
            distancia: distanciaManhattan(opcao.destino, alvo),
        }));
    
    if (opcoes.length === 0) {
        return direcaoAtual; // sem saída: segue em frente
    }
    
    const seguras = opcoes.filter((opcao) => opcao.espaco >= espacoNecessario);

    if (seguras.length > 0) {
        seguras.sort((a, b) => a.distancia - b.distancia);
        return seguras[0].direcao;
    }

    // nenhuma é segura: vai pra que tiver mais espaço
    opcoes.sort((a, b) => b.espaco - a.espaco || a.distancia - b.distancia);
    return opcoes[0].direcao;
}

// ==========================================
// Imã (função pura - testada em testes.js)
// ==========================================
// um passo de "origem" em direção a "destino"; tenta primeiro o eixo mais longe.
// se as duas casas estiverem ocupadas, fica onde está
function passoEmDirecaoA(origem, destino, casaLivre) {
    const passoX = { x: Math.sign(destino.x - origem.x), y: 0 };
    const passoY = { x: 0, y: Math.sign(destino.y - origem.y) };
    const maisLongeEmX = Math.abs(destino.x - origem.x) >= Math.abs(destino.y - origem.y);
    const tentativas = maisLongeEmX ? [passoX, passoY] : [passoY, passoX];

    for (const passo of tentativas) {
        if (passo.x === 0 && passo.y === 0) continue;

        const casa = { x: origem.x + passo.x, y: origem.y + passo.y };
        if (casaLivre(casa)) {
            return casa;
        }
    }

    return { x: origem.x, y: origem.y };
}

// ==========================================
// Pedras que andam (função pura - testada em testes.js)
// ==========================================
// a pedra vai e volta: anda pra frente; se não der, vira e tenta pra trás; se nem isso, fica e vira
function proximoPassoPedra(pedra, casaLivre) {
    const frente = { x: pedra.x + pedra.direcao.x, y: pedra.y + pedra.direcao.y };

    if (casaLivre(frente)) {
        return { x: frente.x, y: frente.y, direcao: pedra.direcao };
    }

    const direcaoContraria = { x: -pedra.direcao.x, y: -pedra.direcao.y };
    const atras = { x: pedra.x + direcaoContraria.x, y: pedra.y + direcaoContraria.y };

    if (casaLivre(atras)) {
        return { x: atras.x, y: atras.y, direcao: direcaoContraria };
    }

    return { x: pedra.x, y: pedra.y, direcao: direcaoContraria };   
}