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
        zona: "ficou fora da zona",
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

// ==========================================
// Velocidade no placar (função para - testadas em  testes.js)
// ==========================================
// a cobra acelera conforme COME, e não conforme os pontos (o combo multiplica os pontos e o jogo disparava).
// Acelera mais no começo e cada vez menos, chegando perto do limite da dificuldade (ex.: 2x no Normal)
const COMIDAS_PARA_ACELERAR = 30; // com 30 comidas a cobra já fez uns 2/3 da aceleração

function duracaoDoPasso(velocidadeInicialMs, comidas, aceleracaoMaxima) {
    const menorPasso = velocidadeInicialMs / aceleracaoMaxima;
    return Math.round(menorPasso + (velocidadeInicialMs - menorPasso) * Math.exp(-comidas / COMIDAS_PARA_ACELERAR));
}

// quantas vezes mais rápido que no começo da partida, ex.: "1,4x"
function formatarVelocidade(velocidadeInicialMs, velocidadeAtualMs) {
    const fator = velocidadeInicialMs / velocidadeAtualMs;
    return `${fator.toFixed(1).replace(".", ",")}x`;
}

// ==========================================
// Preferências salvas (função pura - testada em testes.js)
// ==========================================
// aceita só os valores que existem no jogo; o resto volta pro padrão
function limparPreferencias(salvas, modosValidos, dificuldadesValidas) {
    const preferencias = salvas && typeof salvas === "object" ? salvas : {};
    const nome = (valor) => (typeof valor === "string" ? valor.slice(0, 12) : "");

    return {
        nome1: nome(preferencias.nome1),
        nome2: nome(preferencias.nome2),
        modo: modosValidos.includes(preferencias.modo) ? preferencias.modo : modosValidos[0],
        dificuldade: dificuldadesValidas.includes(preferencias.dificuldade) ? preferencias.dificuldade : "normal",
        semParedes: preferencias.semParedes === true,
    };
}

// ==========================================
// Estatíticas (funções puras - testadas em teste.js)
// ==========================================
function estatisticasVazias() {
    return {
        partidas: 0,
        tempoTotalMs: 0,
        comidas: 0,
        macasDouradas: 0,
        powerUps: 0,
        maiorCombo: 0,
        maiorTamanho: 0,
        mortes: { parede: 0, proprioCorpo: 0, pedra: 0, outroJogador: 0 },
    };
}

// aceita só numeros válidos (>= 0); o que faltar ou vier estragado vira 0
function limparEstatisticas(salvas) {
    const limpas = estatisticasVazias();

    if(!salvas || typeof salvas !== "object") {
        return limpas;
    }

    const numero = (valor) => (Number.isFinite(valor) && valor >= 0 ? valor: 0);

    for (const chave of Object.keys(limpas)) {
        if (chave !== "mortes") {
            limpas[chave] = numero(salvas[chave]);
        }
    }

    const mortesSalvas = salvas.mortes && typeof salvas.mortes === "object" ? salvas.mortes : {};

    for (const motivo of Object.keys(limpas.mortes)) {
        limpas.mortes[motivo] = numero(mortesSalvas[motivo]);
    }

    return limpas;
}

// 4500 -> "45 s"; 750000 -> "12 min 30 s"; 390000 -> "1 h 05 min"
function formatarTempo(milissegundos) {
    const totalSegundos = Math.floor(milissegundos / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    if (horas > 0) {
        return `${horas} h ${String(minutos).padStart(2, "0")} min`;
    }

    if (minutos > 0) {
        return `${minutos} min ${String(segundos).padStart(2, "0")} s`;
    }

    return `${segundos} s`;
}

// qual motivo de morte aparece mais (ou null se ainda não morreu)
function morteMaisComum(mortes) {
    let maisComum= null;

    for (const [motivo, quantidade] of Object.entries(mortes)) {
        if (quantidade > 0 && (maisComum === null || quantidade > mortes[maisComum])) {
            maisComum = motivo;
        }
    }

    return maisComum;
}

// ==========================================
// Modo Contra o Tempo (funções puras - testadas em teste.js)
// ==========================================
// 65000 -> "1:05" (arredonda pra cima: com 0,4 s ainda mostra "0:01")
function formatarRelogio(milissegundos) {
    const totalSegundos = Math.ceil(Math.max(0, milissegundos) / 1000);
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${minutos}:${String(segundos).padStart(2, "0")}`;
}

// ==========================================
// Modo Arena (funções puras - testadas em testes.js)
// ==========================================
const ARENA_FECHA_A_CADA_MS = 15000;
const ARENA_AVISO_MS = 3000; // a faixa que vai fechar pisca antes
const ARENA_LADO_MINIMO = 8; // a zona para de fechar quando o lado menor chega aqui

function margemMaximaDaArena(colunas, linhas) {
    return Math.max(0, Math.floor((Math.min(colunas, linhas) - ARENA_LADO_MINIMO) / 2));
}

// a zona livre depois de "tempoMs" jogados: a cada 15 s fecha uma volta inteira da borda
function zonaDaArena(tempoMs, colunas, linhas) {
    const maxima = margemMaximaDaArena(colunas, linhas);
    const margem = Math.min(Math.floor(tempoMs / ARENA_FECHA_A_CADA_MS), maxima);

    return { esquerda: margem, topo: margem, direita: colunas - 1 - margem, baixo: linhas - 1 - margem, final: margem === maxima };
}

// quanto falta pra zona fechar de novo (null: já é a zona final)
function tempoParaFecharArena(tempoMs, colunas, linhas) {
    if (zonaDaArena(tempoMs, colunas, linhas).final) return null;
    return ARENA_FECHA_A_CADA_MS - (tempoMs % ARENA_FECHA_A_CADA_MS);
}

function foraDaZona(casa, zona) {
    return casa.x < zona.esquerda || casa.x > zona.direita || casa.y < zona.topo || casa.y > zona.baixo;
}

// quando a zona fecha, o corpo que ficou fora queima (do primeiro pedaço fora até o rabo).
// A cabeça fica: se ela estiver fora, é batida
function cortarCobraNaZona(cobra, zona) {
    const primeiroFora = cobra.findIndex((pedaco, indice) => indice > 0 && foraDaZona(pedaco, zona));
    return primeiroFora === -1 ? cobra : cobra.slice(0, primeiroFora);
}

// ==========================================
// Modo Chefão (funções puras - testadas em testes.js)
// ==========================================
const DURACAO_ESPADA_MS = 6000;
const ESPADA_VOLTA_EM_MS = 4000; // depois que a espada acaba (ou chega chefão novo), outra aparece
const PONTOS_POR_CHEFAO = 10; // vezes o número do chefão: o 1º dá 10, o 2º dá 20...
const DISTANCIA_DE_CACA = 8; // mais perto que isso, o chefão vai pra frente da sua cabeça

// cada chefão é mais forte que o anterior: mais vida, maior e erra menos
function nivelDoChefao(numero) {
    return {
        vida: Math.min(2 + numero, 6),
        tamanho: Math.min(6 + numero * 2, 16),
        chanceDeErro: Math.max(0.02, 0.14 - numero * 0.03),
        cuidado: Math.min(1, 0.3 + numero * 0.15),
    };
}

// pra onde o chefão vai: se você está com a espada, ele foge; perto, corta a sua frente; longe, vai na comida
function alvoDoChefao(cabecaDoChefao, cabecaDoJogador, direcaoDoJogador, comida, fugindo, colunas, linhas) {
    const dentro = (casa) => ({
        x: Math.max(0, Math.min(colunas - 1, casa.x)),
        y: Math.max(0, Math.min(linhas - 1, casa.y)),
    });

    if (fugindo) {
        return dentro({ x: cabecaDoChefao.x * 2 - cabecaDoJogador.x, y: cabecaDoChefao.y * 2 - cabecaDoJogador.y });
    }
    if (distanciaManhattan(cabecaDoChefao, cabecaDoJogador) <= DISTANCIA_DE_CACA) {
        return dentro({ x: cabecaDoJogador.x + direcaoDoJogador.x * 3, y: cabecaDoJogador.y + direcaoDoJogador.y * 3 });
    }
    return comida;
}

// tira "quantidade" pedaços do rabo, mas a cobra fica com pelo menos 1
function encolherCobra (cobra, quantidade) {
    const tamanho = Math.max(1, cobra.length - quantidade);
    return cobra.slice(0, tamanho).map((segmento) => ({ ...segmento }));
}

// quem fez mais pontos; null se empatou
function vencedorPorPontos(jogadores) {
    const ordenados = [...jogadores].sort((a, b) => b.pontuacao - a.pontuacao);

    if (ordenados.length > 1 && ordenados[0].pontuacao === ordenados[1].pontuacao) {
        return null;
    }

    return ordenados[0];
}

// ==========================================
// Modo Fases (mapas desenhados - testados em testes.js)
// ==========================================
// cada mapa tem 20 linhas de 20 letras:
// "#" = parede, "." = livre, "1" = onde o Jogador 1 começa, "2" = onde o Jogador 2 começa
const MAPAS_DAS_FASES = [
    {
        nome: "Cantos",
        linhas: [
            "....................",
            "....................",
            "..####........####..",
            "..#..............#..",
            "..#..............#..",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            ".....1........2.....",
            "....................",
            "....................",
            "....................",
            "....................",
            "..#..............#..",
            "..#..............#..",
            "..####........####..",
            "....................",
            "....................",
        ],
    },
    {
        nome: "Corredores",
        linhas: [
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "...######..######...",
            "....................",
            "....................",
            "....................",
            ".....1........2.....",
            "....................",
            "....................",
            "...######..######...",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
        ],
    },
    {
        nome: "Cruz",
        linhas: [
            "....................",
            "....................",
            ".........##.........",
            ".........##.........",
            ".........##.........",
            ".........##.........",
            ".........##.........",
            "....................",
            "..#####......#####..",
            "....................",
            ".....1........2.....",
            "....................",
            "..#####......#####..",
            "....................",
            ".........##.........",
            ".........##.........",
            ".........##.........",
            ".........##.........",
            ".........##.........",
            "....................",
        ],
    },
    { 
        nome: "Labirinto",
        linhas: [
            "....................",
            ".####..........####.",
            ".#................#.",
            ".#..####....####..#.",
            "....................",
            "......#......#......",
            "......#......#......",
            "..#####......#####..",
            "....................",
            "....................",
            "....1.........2.....",
            "....................",
            "..#####......#####..",
            "......#......#......",
            "......#......#......",
            "....................",
            ".#..####....####..#.",
            ".#................#.",
            ".####..........####.",
            "....................",
        ],
    },
];

// transforma o desenho em paredes e pontos de partida
function lerMapa(linhas) {
    const paredes = [];
    const inicios = [];

    linhas.forEach((linha, y) => {
        [...linha].forEach((letra, x) => {
            if (letra === "#") {
                paredes.push({ x, y });
            } else if (letra === "1" || letra === "2") {
                inicios[Number(letra) - 1] = { x, y };
            }
        });
    });

    return{ paredes, inicios };
}

// fase 1 até 9 pontos, fase 2 de 10 a 19... sem passar na última
function faseParaPontuacao(pontos, pontosPorFase, totalDeFases) {
    return Math.min(totalDeFases, 1 + Math.floor(pontos / pontosPorFase));
}

// ==========================================
// Desafio do dia (funções puras - testadas em testes.js)
// ==========================================
// data local no formato "2026-10-02"
function dataDeHoje(data = new Date()) {
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()). padStart(2, "0");
    return `${data.getFullYear()}-${mes}-${dia}`;
}

// transforma um texto num número (sempre o mesmo número para o mesmo texto)
function sementeDoTexto(texto) {
    let hash = 2166136261;

    for (const letra of texto) {
        hash ^= letra.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

// sorteador "previsível": com a mesma semente, sai sempre a mesma sequência de números
// (funciona como Math.random, devolve números de 0 até quase 1)
function criarSorteador(semente) {
    let estado = semente >>> 0;

    return function () {
        estado = (estado + 0x6d2b79f5) >>> 0;
        let numero = estado;
        numero = Math.imul(numero ^ (numero >>> 15), numero | 1);
        numero ^= numero + Math.imul(numero ^ (numero >>> 7), numero | 61);
        return ((numero ^ (numero >>> 14)) >>> 0) / 4294967296;
    };
}

// o mapa (pedras) e a sequência de maçãs do dia: iguais para todo mundo na mesma data
function gerarDesafioDoDia(dataTexto, colunas, linhas, quantidadePedras, inicios, quantidadeComidas) {
    const sortear = criarSorteador(sementeDoTexto(dataTexto));
    const casaSorteada = () => ({ x: Math.floor(sortear() * colunas), y: Math.floor(sortear() * linhas) });
    const pedras = [];
    
    while (pedras.length < quantidadePedras) {
        const casa = casaSorteada();
        const pertoDoInicio = inicios.some((inicio) => distanciaManhattan(inicio, casa) <= 2);
        const repetida = pedras.some((pedra) => mesmaPosicao(pedra, casa));

        if (!pertoDoInicio && !repetida) {
            pedras.push(casa);
        }
    }

    const comidas = [];

    while (comidas.length < quantidadeComidas) {
        const casa = casaSorteada();

        if (!pedras.some((pedra) => mesmaPosicao(pedra, casa))) {
            comidas.push(casa);
        }
    }

    return { pedras, comidas };
}

// ==========================================
// Nível do bot (funções puras - testadas em testes.js)
// ==========================================
// chanceDeErro: de vez em quando ele vira pra um lado qualquer (mas nunca pra cima de algo)
// cuidado: o quanto ele olha à frente pra não entrar em beco (0 = nada, 1 = tudo)
const NIVEIS_DO_BOT = {
    facil: { chanceDeErro: 0.3, cuidado: 0 },
    normal:{ chanceDeErro: 0.1, cuidado: 0.5 },
    dificil: { chanceDeErro: 0, cuidado: 1 },
};

function limparNivelBot(valor) {
    return Object.keys(NIVEIS_DO_BOT).includes(valor) ? valor : "normal";
}

// quantas casas livres o bot exige à frente antes de entrar num caminho
function espacoQueOBotExige(tamanhoDaCobra, cuidado) {
    return Math.max(1, Math.round((tamanhoDaCobra + 2) * cuidado));
}

// uma direção qualquer que não seja meia-volta nem bata em nada
function direcaoAleatoriaSegura(cabeca, direcaoAtual, andar, casaLivre, sorteio) {
    const opcoes = DIRECOES.filter(
        (direcao) =>
            !(direcao.x === -direcaoAtual.x && direcao.y === -direcaoAtual.y) &&
            casaLivre(andar(cabeca, direcao))
    );

    if (opcoes.length === 0) {
        return direcaoAtual;
    }

    return opcoes[Math.floor(sorteio() * opcoes.length)];
}

// ==========================================
// Conquistas (funções puras - testadas em testes.js)
// ==========================================
// cada conquista olha o "contexto": as estatísticas de sempre e a partida de agora
const CONQUISTAS = [
    { id: "primeiraMordida", nome: "Primeira Mordida", descricao: "Comer a primeira comida", condicao: (c) => c.estatisticas.comidas >= 1 },
    { id: "faminta", nome: "Faminta", descricao: "Comer 100 comidas no total", condicao: (c) => c.estatisticas.comidas >= 100 },
    { id: "glutona", nome: "Glutona", descricao: "Comer 500 comidas no total", condicao: (c) => c.estatisticas.comidas >= 500 },
    { id: "combo5", nome: "Combo x5", descricao: "Fazer um combo x5", condicao: (c) => c.estatisticas.maiorCombo >= 5 },
    { id: "cobraGrande", nome: "Cobra grande", descricao: "Chegar a 20 pedaços", condicao: (c) => Math.max(c.estatisticas.maiorTamanho, c.partida.tamanho,) >= 20 },
    { id: "ouro", nome: "Ouro!", descricao: "Comer 10 maçãs douradas", condicao: (c) => c.estatisticas.macasDouradas >= 10 },
    { id: "colecionadora", nome: "Colecionadora", descricao: "Pegar 3 power-ups numa partida", condicao: (c) => c.partida.powerUps >= 3 },
    { id: "cinquenta", nome: "50 pontos", descricao: "Fazer 50 pontos numa partida", condicao: (c) => c.partida.pontos >= 50 },
    { id: "lendaria", nome: "Lendária", descricao: "Fazer 100 pontos numa partida", condicao: (c) => c.partida.pontos >= 100 },
    { id: "comboOito", nome: "Combo x8", descricao: "Fazer um combo x8", condicao: (c) => c.estatisticas.maiorCombo >= 8 },
    { id: "fiel", nome: "Fiel", descricao: "Completar as missões 7 dias seguidos", condicao: (c) => (c.missoesSeguidas || 0) >= 7 },
    { id: "contraORelogio", nome: "Contra o relógio", descricao: "Fazer 30 pontos no Contra o tempo", condicao: (c) => c.partida.modo === "tempo" && c.partida.pontos >= 30 },
    { id: "sobrevivente", nome: "Sobrevivente", descricao: "Chegar na última zona da Arena", condicao: (c) => c.partida.modo === "arena" && c.partida.zonaFinal === true },
    { id: "encarouOAbismo", nome: "Encarou o abismo", descricao: "Derrotar os olhos que emergem no modo Chefão", condicao: (c) => (c.partida.chefoes || 0) >= 1 },
    { id: "cacadora", nome: "Caçadora do abismo", descricao: "Derrotar os olhos que emergem 3 vezes numa partida", condicao: (c) => (c.partida.chefoes || 0) >= 3 },
    { id: "labirinto", nome: "Saí do labirinto", descricao: "Chegar à fase 4 no modo Fases", condicao: (c) => c.partida.modo === "fases" && c.partida.fase >= 4 },
    { id: "venceuBot", nome: "Mais esperta que o bot", descricao: "Vencer o bot no nível Difícil", condicao: (c) => c.partida.venceuBotDificil === true },
    { id: "veterana", nome: "Veterana", descricao: "Jogar 50 partidas", condicao: (c) => c.estatisticas.partidas >= 50 },
    { id: "maratona", nome: "Maratona", descricao: "Jogar 1 hora no total", condicao: (c) => c.estatisticas.tempoTotalMs >= 3600000 },
];

// quais conquistas acabaram de ser ganhas (as que já tinha não contam de novo)
function conquistasNovas(jaGanhas, contexto) {
    return CONQUISTAS.filter((conquista) => !jaGanhas.includes(conquista.id) && conquista.condicao(contexto));
}

// só aceita ids que existem (dado salvo ou estragado não quebra nada)
function limparConquistas(salvas) {
    if (!Array.isArray(salvas)) {
        return[];
    }

    return CONQUISTAS.map((conquista) => conquista.id).filter((id) => salvas.includes(id));
}

// ==========================================
// Cores da cobra (funções puras - testadas em testes.js)
// ==========================================
// conquista: null = livre desde o começo; senão, o id da conquista que libera a cor
const CORES_DA_COBRA = [
    { id: "azul", nome: "Azul", cabeca: "#6fa0ff", corpo: "#2a3fb8", conquista: null },
    { id: "ciano", nome: "Ciano", cabeca: "#67e8f9", corpo: "#0e7490", conquista: null },
    { id: "roxa", nome: "Roxa", cabeca: "#c4a1ff", corpo: "#6b3fc9", conquista: "primeiraMordida" },
    { id: "rosa", nome: "Rosa", cabeca: "#ff9ed2", corpo: "#c2185b", conquista: "faminta" },
    { id: "neon", nome: "Neon", cabeca: "#c6f36b", corpo: "#3f6212", conquista: "combo5" },
    { id: "dourada", nome: "Dourada", cabeca: "#ffe27a", corpo: "#b8860b", conquista: "ouro" },
    { id: "noite", nome: "Noite", cabeca: "#9aa7ff", corpo: "#1e1b4b", conquista: "veterana" },
];

function corEstaLiberada(cor, conquistasGanhas) {
    return cor.conquista === null || conquistasGanhas.includes(cor.conquista);
}

// a cor salva só vale se existir e estiver liberada; senão volta pra azul
function limparCorDaCobra(id, conquistasGanhas) {
    const cor = CORES_DA_COBRA.find((opcao) => opcao.id === id);
    return cor && corEstaLiberada(cor, conquistasGanhas) ? cor.id : "azul";
}

// ==========================================
// Teclas configuráveis (funções puras - testadas em testes.js)
// ==========================================
const DIRECOES_DAS_TECLAS = ["cima", "esquerda", "baixo", "direita"]; // ordem dos botões no painel
const TECLAS_PADRAO = [
    { cima: "arrowup", baixo: "arrowdown", esquerda: "arrowleft", direita: "arrowright" },
    { cima: "w", baixo: "s", esquerda: "a", direita: "d" },
];
// Espaço/Esc pausam, F é a tela cheia, Enter/Tab mexem nos botões; as outras são teclas "invisíveis" do teclado
const TECLAS_RESERVADAS = [" ", "escape", "f", "enter", "tab", "dead", "unidentified", "process"];

function copiarTeclasPadrao() {
    return TECLAS_PADRAO.map((teclas) => ({ ...teclas }));
}

function teclaPodeSerUsada(tecla) {
    return typeof tecla === "string" && tecla.length > 0 && !TECLAS_RESERVADAS.includes(tecla);
}

// as telas salvas só valem se estiverem completas e sem repetir; senão volta pro padrão
function limparTeclas(salvas) {
    if (!Array.isArray(salvas) || salvas.length !== 2) return copiarTeclasPadrao();

    const usadas = [];
    for (const teclasDoJogador of salvas) {
        for (const direcao of DIRECOES_DAS_TECLAS) {
            const tecla = teclasDoJogador && teclasDoJogador[direcao];
            if (!teclaPodeSerUsada(tecla) || usadas.includes(tecla)) return copiarTeclasPadrao();
            usadas.push(tecla);
        }
    }

    return salvas.map((teclas) => ({ cima: teclas.cima, baixo: teclas.baixo, esquerda: teclas.esquerda, direita: teclas.direita }));
}

// troca uma tecla; se a nova já era usada em outro lugar, as duas trocam de lugar (nunca fica repetida)
function trocarTecla(teclas, jogador, direcao, novaTecla) {
    const novas = teclas.map((teclasDoJogador) => ({ ...teclasDoJogador }));
    const antiga = novas[jogador][direcao];

    for (const teclasDoJogador of novas) {
        for (const outraDirecao of DIRECOES_DAS_TECLAS) {
            if (teclasDoJogador[outraDirecao] === novaTecla) teclasDoJogador[outraDirecao] = antiga;
        }
    }
    novas[jogador][direcao] = novaTecla;
    return novas;
}

const NOME_DAS_SETAS = { arrowup: "↑", arrowdown: "↓", arrowleft: "←", arrowright: "→" };

function nomeDaTecla(tecla) {
    if (NOME_DAS_SETAS[tecla]) return NOME_DAS_SETAS[tecla];
    return tecla.charAt(0).toUpperCase() + tecla.slice(1);
}

// texto curto pro menu: "setas". "WASD", "I J K L "...
function resumoDasTeclas(teclas) {
    const nomes = DIRECOES_DAS_TECLAS.map((direcao) => nomeDaTecla(teclas[direcao]));

    if (nomes.join("") === "↑←↓→") return "setas";
    return nomes.every((nome) => nome.length === 1) ? nomes.join("") : nomes.join(" ");
}

// ==========================================
// Compartilhar resultado (função pura - testada em testes.js)
// ==========================================
const NOMES_DOS_MODOS = {
    normal: "Normal",
    "clássico": "Clássico",
    rato: "Rato",
    tempo: "Contra o tempo",
    arena: "Arena",
    chefao: "Chefão",
    fases: "Fases",
    desafio: "Desafio do dia",
    personalizada: "Fase criada",
};

// placar: [{ nome, pontuacao }] · data: "2026-10-20"
function textoDeCompartilhar(modo, data, placar, link, juntos = false) {
    const titulo = modo === "desafio"
        ? `Desafio de ${data.slice(8, 10)}/${data.slice(5, 7)}`
        : `Modo ${NOMES_DOS_MODOS[modo] || modo}`;

    const soma = placar.reduce((total, jogador) => total + jogador.pontuacao, 0);
    const pontos = (n) => `${n} ${n === 1 ? "ponto" : "pontos"}`;
    let resultado;

    if (juntos) {
        resultado = `${placar.map((jogador) => jogador.nome).join(" + ")} fizeram ${pontos(soma)} juntos`;
    } else if (placar.length === 1) {
        resultado = pontos(placar[0].pontuacao);
    } else {
        resultado = placar.map((jogador) => `${jogador.nome} ${jogador.pontuacao}`).join(" x ");
    }

    let convite = "Joga também:";
    if (modo === "desafio") convite = "Hoje todo mundo joga o mesmo mapa. Consegue fazer mais?";
    if (modo === "personalizada") convite = "Fiz essa fase. Tenta passar:";

    return `🐍 Snake · ${titulo}: ${resultado}\n${convite} ${link}`;
}

// ==========================================
// Fantasma do recorde (funções puras - testadas em testes.js)
// ==========================================
// cada passo gravado: [tempo da partida em ms, x da cabeça, y da cabeça, tamanho da cobra]

// o corpo no passo "indice": as últimas cabeças, do tamanho que a cobra tinha
function corpoDoFantasma(passos, indice) {
    const tamanho = passos[indice][3];
    const corpo = [];

    for (let i = indice; i >= 0 && corpo.length < tamanho; i--) {
        corpo.push({ x: passos[i][1], y: passos[i][2] });
    }
    return corpo;
}

// o último passo que já aconteceu nesse tempo de partida (-1 se nenhum)
function passoDoFantasmaNoTempo(passos, tempo) {
    let inicio = 0;
    let fim = passos.length - 1;
    let resposta = -1;

    // busca binária: a gravação pode ter milhares de passos
    while (inicio <= fim) {
        const meio = Math.floor((inicio + fim) / 2);

        if (passos[meio][0] <= tempo) {
            resposta = meio;
            inicio = meio + 1;
        } else {
            fim = meio - 1;
        }
    }
    return resposta;
}

// pra onde a cabeça foi de um passo pro outro; null se não foi 1 casa (parada ou troca de fase)
// atravessar a borda no "Sem paredes" conta como 1 casa
function direcaoDoFantasma(de, para, colunas, linhas) {
    const passo = (diferenca, tamanho) => {
        if (Math.abs(diferenca) === tamanho - 1 && tamanho > 2) return -Math.sign(diferenca);
        return diferenca;
    };
    const direcao = { x: passo(para.x - de.x, colunas), y: passo(para.y - de.y, linhas) };

    return Math.abs(direcao.x) + Math.abs(direcao.y) === 1 ? direcao : null;
}

// os fantasmas guardados só valem no dia em que foram feitos
function fantasmasDoDia(salvos, data) {
    const valido = salvos && salvos.data === data && salvos.porModo && typeof salvos.porModo === "object";
    return valido ? salvos : { data, porModo: {} };
}

// devolve os fantasmas com esta partida guardada, ou null se ela não superou o fantasma de hoje
function guardarFantasmaSeMelhor(salvos, data, modo, pontuacao, passos) {
    const doDia = fantasmasDoDia(salvos, data);
    const atual = doDia.porModo[modo];

    if (pontuacao <= 0 || passos.length === 0 || (atual && atual.pontuacao >= pontuacao)) {
        return null;
    }
    return { data, porModo: { ...doDia.porModo, [modo]: { pontuacao, passos } } };
}


// ==========================================
// Temas do tabuleiro (funções puras - testadas em testes.js)
// ==========================================
// conquista: null = livre desde o começo; senão, o id da conquista que libera o tema
const TEMAS_DO_TABULEIRO = [
    { id: "grama", nome: "Grama", claro: "#aad751", escuro: "#a2d149", conquista: null },
    { id: "deserto", nome: "Deserto", claro: "#ecd29a", escuro: "#e3c585", conquista: "cobraGrande" },
    { id: "neve", nome: "Neve", claro: "#eef4f8", escuro: "#dde8ef", conquista: "colecionadora" },
    { id: "noite", nome: "Noite", claro: "#2b4a3d", escuro: "#244034", conquista: "cinquenta" },
];

// o tema salvo só vale se existir e estiver liberado; senão volta pra grama
function limparTemaDoTabuleiro(id, conquistasGanhas) {
    const tema = TEMAS_DO_TABULEIRO.find((opcao) => opcao.id === id);
    return tema && corEstaLiberada(tema, conquistasGanhas) ? tema.id : "grama";
}

// ==========================================
// Tabuleiros no celular (função pura - testada em testes.js)
// ==========================================
const COLUNAS_NO_CELULAR = 15;

// celular em pé: menos colunas (casas maiores) e quantas linhas couberem na altura da tela.
// Fases, Desafio do dia e Fase criada continuam 20x20: os mapas são iguais pra todo mundo.
function tamanhoDoTabuleiro(celularEmPe, larguraTela, alturaTela, modo) {
    if (!celularEmPe || modo === "fases" || modo === "desafio" || modo === "personalizada") {
        return { colunas: 20, linhas: 20 };
    }
    
    const casaNaTela = larguraTela / COLUNAS_NO_CELULAR;
    const linhas = Math.floor((alturaTela - 90) / casaNaTela); // 90: placar e margens

    return { colunas: COLUNAS_NO_CELULAR, linhas: Math.max(15, Math.min(26, linhas)) };
}

// ==========================================
// Fase criada no editor (funções puras - testadas em testes.js)
// ==========================================
const LADO_DA_FASE_CRIADA = 20;

// a linha do meio fica sempre livre: é por onde as cobras saem
function casaReservadaNaFase(casa) {
    return casa.y === 10 && casa.x >= 3 && casa.x <= 17;
}

// cada casa vira 1 bit (400 casas = 50 bytes) e os bytes viram um texto curto que cabe no link
function codificarFase(paredes) {
    const bytes = new Array(50).fill(0);

    for (const parede of paredes) {
        const indice = parede.y * LADO_DA_FASE_CRIADA + parede.x;
        bytes[Math.floor(indice / 8)] |= 1 << (indice % 8);
    }

    // base64 sem os caracteres que atrapalham num link (+ / =)
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// o contrário do codificarFase; devolve null se o código estiver quebrado
function decodificarFase(codigo) {
    if (typeof codigo !== "string" || !/^[A-Za-z0-9_-]{67}$/.test(codigo)) return null;

    let bytes;
    try {
        bytes = atob(codigo.replace(/-/g, "+").replace(/_/g, "/") + "=");
    } catch {
        return null;
    }

    const paredes = [];
    for (let indice = 0; indice < LADO_DA_FASE_CRIADA * LADO_DA_FASE_CRIADA; indice++) {
        if (bytes.charCodeAt(Math.floor(indice / 8)) & (1 << (indice % 8))) {
            const casa = { x: indice % LADO_DA_FASE_CRIADA, y: Math.floor(indice / LADO_DA_FASE_CRIADA) };
            if (!casaReservadaNaFase(casa)) paredes.push(casa);
        }
    }

    return paredes;
}

// ==========================================
// Controle de videogame (função pura - testada em testes.js)
// ==========================================
const ZONA_MORTA_DO_ANALOGICO = 0.5; // analógico encostado de leve não conta

// apertados: botões do controle (true/false) no padrão do navegador, onde 12 a 15 são as setas
// eixos: analógico esquerdo (eixo 0 = esquerda/direita, eixo 1 = cima/baixo)
function direcaoDoControle(apertados, eixos) {
    if (apertados[12]) return { x: 0, y: -1 };
    if (apertados[13]) return { x: 0, y: 1 };
    if (apertados[14]) return { x: -1, y: 0 };
    if (apertados[15]) return { x: 1, y: 0 };

    const x = eixos[0] || 0;
    const y = eixos[1] || 0;

    if (Math.max(Math.abs(x), Math.abs(y)) < ZONA_MORTA_DO_ANALOGICO) return null;

    // vale o lado pra onde o analógico está mais inclinado
    return Math.abs(x) > Math.abs(y) ? { x: Math.sign(x), y: 0 } : { x: 0, y: Math.sign(y) };
}

// ==========================================
// Tutorial (funções puras - testadas em testes.js)
// ==========================================
const PASSOS_DO_TUTORIAL = ["virar", "comer", "cuidado", "pausar"];
const TEMPO_DE_LEITURA_MS = 4500; // dicas que só explicam ficam esse tempo na tela

// situacao: { virou, comeu, tempoNoPassoMs } desde que o passo começou
function passoDoTutorialCumprido(passo, situacao) {
    if (passo === "virar") return situacao.virou;
    if (passo === "comer") return situacao.comeu;
    return situacao.tempoNoPassoMs >= TEMPO_DE_LEITURA_MS;
}

// entrada: "teclado", "toque" (celular) ou "controle" (videogame)
function textoDoTutorial(passo, entrada, modo) {
    if (passo === "virar") {
        if (entrada === "toque") return "Deslize o dedo no tabuleiro pra virar a cobra.";
        if (entrada === "controle") return "Use as setas ou o analógico do controle pra virar a cobra.";
        return "Use as setas do teclado pra virar a cobra.";
    }
    if (passo === "comer") {
        return modo === "rato"
            ? "Agora pegue um rato 🐭 pra crescer e ganhar pontos."
            : "Agora coma a maçã 🍎 pra crescer e ganhar pontos.";
    }
    if (passo === "cuidado") {
        return "Boa! Não bata nas paredes, nas pedras nem no próprio corpo.";
    }

    const comoPausar =  { toque: "O botão ⏸ pausa o jogo.", controle: "Start pausa o jogo.", teclado: "Espaço ou Esc pausa o jogo." };
    return `Itens especiais dão poderes por alguns segundos. ${comoPausar[entrada]}`;
}

// ==========================================
// Acessibilidade (funções puras - testadas em testes.js)
// ==========================================
// tabuleiro quase preto: a cobra, a maçã e as pedras (com borda branca) aparecem bem
const TEMA_ALTO_CONTRASTE = { id: "contraste", nome: "Alto Contraste", claro: "#000000", escuro: "#141414" };

// nomes falados pelo leitor de tela quando pega um power-up
const NOMES_DOS_POWERUPS = {
    invencibilidade: "Invencível",
    velocidade: "Turbo",
    pontosDobrados: "Pontos x2",
    ima: "Imã",
    encolher: "Encolher",
    escudo: "Escudo",
    portal: "Portal",
    cameraLenta: "Câmera lenta",
    congelar: "Congelar",
};

// quais power-ups podem aparecer: só os que fazem sentido na partida
function powerUpsDaPartida({ arena, temQuemCongelar }) {
    return ["invencibilidade", "velocidade", "pontosDobrados", "encolher", "ima", "escudo", "portal", "cameraLenta", "congelar"]
        .filter((tipo) => !(arena && tipo === "portal")) // na Arena o portal jogaria a cobra pra fora da zona
        .filter((tipo) => temQuemCongelar || tipo !== "congelar");
}

// opções salvas: só true conta como ligado (dado estranho = desligado)
function limparAcessibilidade(salvas) {
    const opcoes = salvas && typeof salvas === "object" ? salvas : {};

    return {
        altoContraste: opcoes.altoContraste === true,
        menosMovimento: opcoes.menosMovimento === true,
    };
}

// ==========================================
// Histórico (funções puras - testadas em testes.js)
// ==========================================
const LIMITE_DO_HISTORICO = 200; // guarda só as últimas partidas

// só passa partida com tudo certo (dado estranho no armazenamento é jogado fora)
function limparHistorico(salvo) {
    if (!Array.isArray(salvo)) return [];

    return salvo
        .filter((partida) => partida && typeof partida === "object" &&
            typeof partida.data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(partida.data) &&
            typeof partida.modo === "string" &&
            Number.isInteger(partida.pontos) && partida.pontos >= 0 &&
            Number.isFinite(partida.ms) && partida.ms >= 0)
        .map((partida) => ({ data: partida.data, modo: partida.modo, pontos: partida.pontos, ms: partida.ms }))
        .slice(-LIMITE_DO_HISTORICO);
}

function adicionarAoHistorico(historico, partida) {
    return historico.concat([partida]).slice(-LIMITE_DO_HISTORICO);
}

// melhor, média (1 casa) e tendência: as 5 últimas partidas comparadas com as 5 de antes
function resumoDoHistorico(partidas) {
    const pontos = partidas.map((partida) => partida.pontos);
    const media = (lista) => lista.reduce((soma, valor) => soma + valor, 0) / lista.length;

    let tendencia = null;
    if (pontos.length >= 10) {
        const diferenca = media(pontos.slice(-5)) - media(pontos.slice(-10, -5));
        tendencia = diferenca >= 1 ? "subindo" : diferenca <= -1 ? "caindo" : "estavel";
    }

    return {
        melhor: Math.max(...pontos),
        media: Math.round(media(pontos) * 10) / 10,
        tendencia,
    };
}

// altura no desenho: 0 ponto fica embaixo, o maior fica em cima
function yNoGrafico(valor, maximo, altura, margem) {
    return Math.round((altura - margem - (valor / maximo) * (altura - margem * 2)) * 10) / 10;
}

// onde cada partida fica no gráfico (da esquerda pra direita, da mais antiga pra mais nova)
function pontosDoGrafico(valores, largura, altura, margem) {
    const maximo = Math.max(1, ...valores);
    const passo = valores.length > 1 ? (largura - margem * 2) / (valores.length - 1) : 0;

    return {
        maximo,
        pontos: valores.map((valor, indice) => ({
            x: valores.length > 1 ? Math.round((margem + passo * indice) * 10) / 10 : largura / 2,
            y: yNoGrafico(valor, maximo, altura, margem),
        })),
    };
}

// ==========================================
// Missões diárias (funções puras - testadas em testes.js)
// ==========================================
const MISSOES_POR_DIA = 3;

// "soma": vai somando em todas as partidas do dia. "partida": tem que conseguir numa partida só.
// modo: a missão só conta jogando nesse modo
const MISSOES = [
    { id: "comer30", texto: "Comer 30 maçãs hoje", tipo: "soma", campo: "comidas", alvo: 30 },
    { id: "partidas5", texto: "Jogar 5 partidas", tipo: "soma", campo: "partidas", alvo: 5 },
    { id: "powerups3", texto: "Pegar 3 power-ups", tipo: "soma", campo: "powerUps", alvo: 3 },
    { id: "douradas2", texto: "Comer 2 maçãs douradas", tipo: "soma", campo: "douradas", alvo: 2 },
    { id: "jogar5min", texto: "Jogar 5 minutos", tipo: "soma", campo: "segundos", alvo: 300 },
    { id: "pontos15", texto: "Fazer 15 pontos numa partida", tipo: "partida", campo: "pontos", alvo: 15 },
    { id: "combo4", texto: "Fazer um combo x4", tipo: "partida", campo: "maiorCombo", alvo: 4 },
    { id: "tamanho15", texto: "Chegar a 15 pedaços", tipo: "partida", campo: "tamanho", alvo: 15 },
    { id: "durar90", texto: "Durar 90 segundos numa partida", tipo: "partida", campo: "segundos", alvo: 90 },
    { id: "rato10", texto: "Fazer 10 pontos no modo Rato", tipo: "partida", campo: "pontos", alvo: 10, modo: "rato" },
    { id: "classico12", texto: "Fazer 12 pontos no Clássico", tipo: "partida", campo: "pontos", alvo: 12, modo: "clássico" },
    { id: "fase2", texto: "Chegar na fase 2 do modo Fases", tipo: "partida", campo: "fase", alvo: 2, modo: "fases" },
];

// as 3 do dia: 1 de somar e 2 de partida (no máximo 1 de modo específico), sorteadas pela data (iguais pra todo mundo)
function missoesDoDia(data) {
    const sortear = criarSorteador(sementeDoTexto("missoes " + data));
    const embaralhar = (lista) => lista
        .map((missao) => ({ missao, ordem: sortear() }))
        .sort((a, b) => a.ordem - b.ordem)
        .map((item) => item.missao);

    const deSomar = embaralhar(MISSOES.filter((missao) => missao.tipo === "soma"));
    const dePartida = embaralhar(MISSOES.filter((missao) => missao.tipo === "partida"));

    const segunda = dePartida.slice(1).find((missao) => !(dePartida[0].modo && missao.modo));

    return [deSomar[0], dePartida[0], segunda];
}

// progresso salvo: se for de outro dia (ou estiver estragado), começa o dia do zero
function limparMissoes(salvo, data) {
    const vazio = { data, progresso: {}, feitas: [] };
    if (!salvo || typeof salvo !== "object" || salvo.data !== data) return vazio;

    const ids = MISSOES.map((missao) => missao.id);
    const progresso = {};

    for (const id of ids) {
        const valor = salvo.progresso && salvo.progresso[id];
        if (Number.isFinite(valor) && valor > 0) progresso[id] = valor;
    }

    const feitas = Array.isArray(salvo.feitas) ? salvo.feitas.filter((id) => ids.includes(id)) : [];
    return { data, progresso, feitas: [...new Set(feitas)] };
}

// soma a partida no progresso do dia; devolve o estado novo e as missões que acabaram de ser cumpridas
function registrarPartidaNasMissoes(estado, partida) {
    const novo = { data: estado.data, progresso: { ...estado.progresso }, feitas: [...estado.feitas] };
    const novas = [];

    for (const missao of missoesDoDia(estado.data)) {
        if (novo.feitas.includes(missao.id)) continue;
        if (missao.modo && missao.modo !== partida.modo) continue;

        const daPartida = missao.campo === "partidas" ? 1 : partida[missao.campo] || 0;
        const anterior = novo.progresso[missao.id] || 0;
        const valor = missao.tipo === "soma" ? anterior + daPartida : Math.max(anterior, daPartida);

        novo.progresso[missao.id] = Math.min(valor, missao.alvo);

        if (valor >= missao.alvo) {
            novo.feitas.push(missao.id);
            novas.push(missao);
        }
    }

    return { estado: novo, novas };
}

// dia anterior no mesmo formato de dataDeHoje ("2026-10-26" -> "2026-10-25")
function diaAnterior(data) {
    const [ano, mes, dia] = data.split("-").map(Number);
    return dataDeHoje(new Date(ano, mes - 1, dia - 1));
}

// sequência de dias com as 3 missões feitas
function limparSequencia(salva) {
    const valida = salva && typeof salva === "object" && Number.isInteger(salva.dias) && salva.dias > 0 &&
        typeof salva.ultimoDia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(salva.ultimoDia);
    return valida ? { dias: salva.dias, ultimoDia: salva.ultimoDia } : { dias: 0, ultimoDia: null };
}

function atualizarSequencia(sequencia, data) {
    if (sequencia.ultimoDia === data) return sequencia;
    const continua = sequencia.ultimoDia === diaAnterior(data);
    return { dias: continua ? sequencia.dias + 1 : 1, ultimoDia: data };
}

// quantos dias seguidos valem hoje: se pulou um dia, a sequência zerou
function sequenciaValendo(sequencia, data) {
    return sequencia.ultimoDia === data || sequencia.ultimoDia === diaAnterior(data) ? sequencia.dias : 0;
}

// ==========================================
// Moedas e loja (funções puras - testadas em testes.js)
// ==========================================
// preço = moedas na loja; conquista = só ganha com ela (nunca é vendido)
// Faixas: simples 100-200 (~1 dia jogando), legal 300-500 (2-3 dias), especial 700-1000 (~1 semana)
const ITENS_DA_LOJA = [
    { id: "bone", nome: "Boné", tipo: "chapeu", preco: 120 },
    { id: "laco", nome: "Laço", tipo: "chapeu", preco: 150 },
    { id: "flor", nome: "Flor", tipo: "chapeu", preco: 200 },
    { id: "oculos", nome: "Óculos escuros", tipo: "chapeu", preco: 350 },
    { id: "fone", nome: "Fone de ouvido", tipo: "chapeu", preco: 450 },
    { id: "helice", nome: "Gorro de hélice", tipo: "chapeu", preco: 750 },
    { id: "pirata", nome: "Bandana de pirata", tipo: "chapeu", conquista: "maratona" },
    { id: "visor", nome: "Visor de vilã", tipo: "chapeu", conquista: "venceuBot" },
    { id: "coroa", nome: "Coroa", tipo: "chapeu", conquista: "lendaria" },
    { id: "morango", nome: "Morango", tipo: "comida", preco: 100 },
    { id: "cereja", nome: "Cereja", tipo: "comida", preco: 150 },
    { id: "melancia", nome: "Melancia", tipo: "comida", preco: 250 },
    { id: "donut", nome: "Donut", tipo: "comida", preco: 350 },
    { id: "pizza", nome: "Pizza", tipo: "comida", preco: 450 },
    { id: "listras", nome: "Listras", tipo: "corpo", preco: 180 },
    { id: "neon", nome: "Contorno neon", tipo: "corpo", preco: 450 },
    { id: "arcoiris", nome: "Arco-íris", tipo: "corpo", preco: 950 },
    { id: "zebra", nome: "Zebra", tipo: "corpo", conquista: "glutona" },
    { id: "dourado", nome: "Dourada brilhante", tipo: "corpo", conquista: "fiel" },
    { id: "magma", nome: "Cobra de magma", tipo: "corpo", conquista: "sobrevivente" },
    { id: "espectro", nome: "Espectro", tipo: "corpo", preco: 800, liberaCom: "encarouOAbismo" }, // à venda, mas só depois da conquista
    { id: "bolhas", nome: "Bolhas", tipo: "rastro", preco: 300 },
    { id: "folhas", nome: "Folhas", tipo: "rastro", preco: 350 },
    { id: "notas", nome: "Notas musicais", tipo: "rastro", preco: 400 },
    { id: "estrelinhas", nome: "Estrelinhas", tipo: "rastro", preco: 800 },
    { id: "fogo", nome: "Fogo", tipo: "rastro", conquista: "comboOito" },
    { id: "praia", nome: "Praia", tipo: "tabuleiro", preco: 300, claro: "#f7e3b0", escuro: "#f0d89a", decoracao: true },
    { id: "doces", nome: "Doces", tipo: "tabuleiro", preco: 450, claro: "#ffd6e8", escuro: "#ffc6df", decoracao: true },
    { id: "espaco", nome: "Espaço", tipo: "tabuleiro", preco: 950, claro: "#161c3d", escuro: "#111632", decoracao: true },
    { id: "lava", nome: "Lava", tipo: "tabuleiro", conquista: "labirinto", claro: "#2a1716", escuro: "#221211", decoracao: true },
    { id: "confete", nome: "Confete", tipo: "efeito", preco: 250 },
    { id: "coracoes", nome: "Corações", tipo: "efeito", preco: 350 },
    { id: "estrelas", nome: "Estrelas", tipo: "efeito", preco: 500 },
];
const TIPOS_DA_LOJA = ["chapeu", "comida", "corpo", "rastro", "tabuleiro", "efeito"];

const MOEDAS_POR_MISSAO = 15;
const MOEDAS_DIA_COMPLETO = 30;         // bônus por fazer as 3 missões do dia
const MOEDAS_POR_DIA_SEGUIDO = 5;       // + 5 por dia de sequência...
const MOEDAS_MAXIMAS_DA_SEQUENCIA = 50; // ...até 50

function moedasDaPartida(pontos) {
    return Math.floor(pontos / 2); // 1 moeda a cada 2 pontos
}

function moedasDasMissoes(quantasCumpridas, completouODia, diasSeguidos) {
    const bonusDoDia = completouODia
        ? MOEDAS_DIA_COMPLETO + Math.min(MOEDAS_MAXIMAS_DA_SEQUENCIA, diasSeguidos * MOEDAS_POR_DIA_SEGUIDO)
        : 0;
    return quantasCumpridas * MOEDAS_POR_MISSAO + bonusDoDia;
}

// item de conquista: tem se ganhou a conquista; item de loja: tem se comprou
function itemDisponivel(item, conquistasGanhas, comprados) {
    return item.conquista ? conquistasGanhas.includes(item.conquista) : comprados.includes(item.id);
}

// carteira salva: moedas, o que comprou e o que está usando (dado estranho é jogado fora)
function limparCarteira(salva, conquistasGanhas) {
    const carteira = salva && typeof salva === "object" ? salva : {};
    const idsAVenda = ITENS_DA_LOJA.filter((item) => item.preco).map((item) => item.id);
    const comprados = Array.isArray(carteira.comprados) ? [...new Set(carteira.comprados.filter((id) => idsAVenda.includes(id)))] : [];
    const equipados = {};

    for (const tipo of TIPOS_DA_LOJA) {
        const id = carteira.equipados && carteira.equipados[tipo];
        const item = ITENS_DA_LOJA.find((opcao) => opcao.id === id && opcao.tipo === tipo);
        equipados[tipo] = item && itemDisponivel(item, conquistasGanhas, comprados) ? item.id : null;
    }

    return {
        moedas: Number.isInteger(carteira.moedas) && carteira.moedas > 0 ? carteira.moedas : 0,
        comprados,
        equipados,
    };
}

// devolve a carteira depois da compra, ou null se não der (de conquista, já tem, faltam moedas
// ou ainda não liberou: alguns itens à venda só podem ser comprados depois de uma conquista)
function comprarItem(carteira, item, conquistasGanhas = []) {
    if (!item.preco || carteira.comprados.includes(item.id) || carteira.moedas < item.preco) return null;
    if (item.liberaCom && !conquistasGanhas.includes(item.liberaCom)) return null;
    return { ...carteira, moedas: carteira.moedas - item.preco, comprados: [...carteira.comprados, item.id] };
}

// usar um item (ou tirar, se já estava usando); null se ainda não tem o item
function equiparItem(carteira, item, conquistasGanhas) {
    if (!itemDisponivel(item, conquistasGanhas, carteira.comprados)) return null;
    const jaUsando = carteira.equipados[item.tipo] === item.id;
    return { ...carteira, equipados: { ...carteira.equipados, [item.tipo]: jaUsando ? null : item.id } };
}
