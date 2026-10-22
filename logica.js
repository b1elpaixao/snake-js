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

// ==========================================
// Velocidade no placar (função para - testadas em  testes.js)
// ==========================================
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
    { id: "contraORelogio", nome: "Contra o relógio", descricao: "Fazer 30 pontos no Contra o tempo", condicao: (c) => c.partida.modo === "tempo" && c.partida.pontos >= 30 },
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
    fases: "Fases",
    desafio: "Desafio do dia",
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

    const convite = modo === "desafio"
        ? "Hoje todo mundo joga o mesmo mapa. Consegue fazer mais?"
        : "Joga também:";

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
// Fases e Desafio do dia continuam 20x20: os mapas e o desafio são iguais pra todo mundo.
function tamanhoDoTabuleiro(celularEmPe, larguraTela, alturaTela, modo) {
    if (!celularEmPe || modo === "fases" || modo === "desafio") {
        return { colunas: 20, linhas: 20 };
    }
    
    const casaNaTela = larguraTela / COLUNAS_NO_CELULAR;
    const linhas = Math.floor((alturaTela - 90) / casaNaTela); // 90: placar e margens

    return { colunas: COLUNAS_NO_CELULAR, linhas: Math.max(15, Math.min(26, linhas)) };
}