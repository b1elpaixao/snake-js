// ==========================================
// Configuração e elementos do DOM
// ==========================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const elementoRecorde = document.getElementById("highscore");
const telaGameOver = document.getElementById("telaGameOver");
const elementoResultadoFinal = document.getElementById("resultadoFinal");
const elementoCausaMorte = document.getElementById("causaMorte");
const elementoPontuacaoFinal = document.getElementById("pontuacaoFinal");
const elementoAvisoRecorde = document.getElementById("avisoRecorde");
const botaoJogarDeNovo = document.getElementById("botaoJogarDeNovo");
const botaoVoltarMenu = document.getElementById("botaoVoltarMenu");
const inputModoSemParedes = document.getElementById("modoSemParedes");

const TAMANHO_CELULA = 20;
const LARGURA_TABULEIRO = canvas.width; // 400 tamanho usado nos desenhos
const ALTURA_TABULEIRO = canvas.height;
const COLUNAS = LARGURA_TABULEIRO / TAMANHO_CELULA;
const LINHAS = ALTURA_TABULEIRO / TAMANHO_CELULA;

function ajustarResolucaoCanvas() {
    const larguraNaTela = canvas.getBoundingClientRect().width || LARGURA_TABULEIRO;
    const escala = Math.max(1, (larguraNaTela / LARGURA_TABULEIRO) * (window.devicePixelRatio || 1));

    canvas.width = Math.round(LARGURA_TABULEIRO * escala);
    canvas.height = Math.round(ALTURA_TABULEIRO * escala);
    // desenha tudo em coordenadas de 400x400 e o canvas amplia sem borrar
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
}

ajustarResolucaoCanvas();
window.addEventListener("resize", ajustarResolucaoCanvas);

let VELOCIDADE_INICIAL_MS = 230;
const VELOCIDADE_MINIMA_MS = 50;
const REDUCAO_VELOCIDADE_POR_PONTO = 5;
const DISTANCIA_MINIMA_SWIPE = 20;

let QUANTIDADE_OBSTACULOS = 8;
let QUANTIDADE_PEDRAS_MOVEIS = 0;
const TICKS_POR_PASSO_PEDRA = 3; // a pedra anda 1 casa a cada 3 passos de cobra
const PONTOS_POR_NOVO_OBSTACULO = 3;
const JANELA_COMBO_MS = 3000; // tempo máximo entre uma comida e outra pra manter o combo

const CHANCE_POWERUP_POR_TICK = 0.01;
const CHANCE_COMIDA_DOURADA_POR_TICK = 0.005;
const PONTOS_COMIDA_DOURADA = 5;
const DURACAO_COMIDA_DOURADA_MS = 4000;
const DURACAO_INVENCIBILIDADE_MS = 5000;
const DURACAO_VELOCIDADE_EXTRA_MS = 5000;
const DURACAO_PONTOS_DOBRADOS_MS = 5000;
const DURACAO_IMA_MS = 5000;
const MEIOS_PASSOS_POR_PASSO = 2; // com Turbo a cobra anda em todo meio passo (2x mais rápida)
const QUANTIDADE_ENCOLHER = 3;

// modo rato
const TIPOS_RATO = {
    parado: { pontos: 1, cor: "#b0b5bb", anda: false },
    fujao: { pontos: 3, cor: "#8d6e63", anda: true },
};
const DISTANCIA_ALERTA_RATO = 3;      // a partir dessa distância o rato fujão foge
const DISTANCIA_MINIMA_NASCER_RATO = 5; // rato novo não nasce colado na cobra
const TICKS_POR_PASSO_RATO = 2;         // o rato anda na metade da velocidade da cobra
const CORES_POWERUP = {
    invencibilidade: "#f5c451",
    velocidade: "#38bdf8",
    pontosDobrados: "#e879f9",
    encolher: "#f1f5f9",
    ima: "#fb923c",
};
const EFEITOS_COM_DURACAO = [
    { ativo: "invencivel", ate: "invencivelAte", duracao: DURACAO_INVENCIBILIDADE_MS },
    { ativo: "velocidadeExtraAtiva", ate: "velocidadeExtraAte", duracao: DURACAO_VELOCIDADE_EXTRA_MS },
    { ativo: "pontosDobradosAtivo", ate: "pontosDobradosAte", duracao: DURACAO_PONTOS_DOBRADOS_MS },
    { ativo: "imaAtivo", ate: "imaAte", duracao: DURACAO_IMA_MS },
];
const TEMPO_AVISO_FIM_EFEITO_MS = 1500;
const containersEfeitos = [
    document.getElementById("efeitosJogador1"),
    document.getElementById("efeitosJogador2"),
];
const CORES_TABULEIRO = { claro: "#aad751", escuro: "#a2d149" };

const telaInicial = document.getElementById("telaInicial");
const telaComoJogar = document.getElementById("telaComoJogar");
const botaoComoJogar = document.getElementById("botaoComoJogar");
const botaoFecharComoJogar = document.getElementById("botaoFecharComoJogar");
const seletorDificuldade = document.getElementById("seletorDificuldade");
const seletorModo = document.getElementById("seletorModo");

const CONFIGURACAO_DIFICULDADE = {
    facil: { velocidadeInicial: 300, obstaculos: 5, pedrasMoveis: 0 },
    normal: { velocidadeInicial: 250, obstaculos: 8, pedrasMoveis: 0 },
    dificil: { velocidadeInicial: 180, obstaculos: 12, pedrasMoveis: 3 },
};
const botaoJogarBot = document.getElementById("botaoJogarBot");
const botaoJogar1 = document.getElementById("botaoJogar1");
const botaoJogar2 = document.getElementById("botaoJogar2");
const placarJogador2 = document.getElementById("placarJogador2");

const elementoListaRecordes = document.getElementById("listaRecordes");
const elementoModoRecordes = document.getElementById("modoRecordes");

const botaoPausa = document.getElementById("botaoPausa");
const botaoMudo = document.getElementById("botaoMudo");
const botaoCima = document.getElementById("botaoCima");
const botaoBaixo = document.getElementById("botaoBaixo");
const botaoEsquerda = document.getElementById("botaoEsquerda");
const botaoDireita = document.getElementById("botaoDireita");

const inputNomeJogador1 = document.getElementById("inputNomeJogador1");
const inputNomeJogador2 = document.getElementById("inputNomeJogador2");
const elementoNomeExibido1 = document.getElementById("nomeExibido1");
const elementoNomeExibido2 = document.getElementById("nomeExibido2");


// ==========================================
// Jogadores
// ==========================================
function criarJogador(config) {
    return {
        cobra: [{ x: config.x, y: config.y }],
        cobraAnterior : [{ x: config.x, y: config.y }],
        direcao: {...config.direcaoInicial },
        filaDirecoes: [],
        pontuacao: 0,
        comboAtual: 0,
        ultimoComerEm: null,
        nome: config.nome,
        bot: false,
        invencivel: false,
        velocidadeExtraAtiva: false,
        ultimoPassoEm: 0,
        duracaoPasso: VELOCIDADE_INICIAL_MS,
        pontosDobradosAtivo: false,
        imaAtivo: false,
        invencivelAte: 0,
        velocidadeExtraAte: 0,
        pontosDobradosAte: 0,
        imaAte: 0,
        teclas: config.teclas,
        corCabeca: config.corCabeca,
        corCorpo: config.corCorpo,
        elementoPontuacao: config.elementoPontuacao,
    };
}

function criarJogadores(quantidade = 2, nomes = ["Jogador 1", "Jogador 2"]) {
    const todosOsJogadores = [
        criarJogador({
            x: 6,
            y: 10,
            direcaoInicial: { x: 1, y: 0 },
            teclas: { cima: "arrowup", baixo: "arrowdown", esquerda: "arrowleft", direita: "arrowright" },
            corCabeca: "#6fa0ff",
            corCorpo: "#2a3fb8",
            nome: nomes[0],
            elementoPontuacao: document.getElementById("score1"),
        }),
        criarJogador({
            x: 14,
            y: 10,
            direcaoInicial: { x: -1, y: 0 },
            teclas: { cima: "w", baixo: "s", esquerda: "a", direita: "d"},
            corCabeca: "#ff9a6b",
            corCorpo: "#c7431a",
            nome: nomes[1],
            elementoPontuacao: document.getElementById("score2"),
        }),
    ];

    return todosOsJogadores.slice(0, quantidade);
}

let jogadores = criarJogadores();
let obstaculos = gerarObstaculos();
let comida = gerarComida();
let powerUp = null; // { x, y } quando existe um na tela, ou null
let comidaDourada = null; // { x, y } quando existe, ou null
let ratos = []; // só tem ratos no modo rato
let contadorTicksRatos = 0;
let contadorMeiosPassos = 0;
let contadorPassosPedras = 0;
let textosFlutuantes = []; // os "=3" que sobem ao comer
const DURACAO_TEXTO_FLUTUANTE_MS = 800;
// ==========================================
// Armazenamento (localStorage) - nunca deixa o jogo quebrar
// ==========================================
function lerDoArmazenamento(chave) {
    try {
        return localStorage.getItem(chave);
    } catch {
        return null; // navegador bloqueou o armazenamento
    }
}

function salvarNoArmazenamento(chave, valor) {
    try {
        localStorage.setItem(chave, valor);
    } catch {
        // sem armazenamento: o jogo segue funcionando, só não salva
    }
}

const MODOS_DE_JOGO = ["normal", "clássico", "rato"];
const NOMES_MODOS = { normal: "Normal", "clássico": "Clássico", rato: "Rato" };

function lerRecordesSalvos() {
    const porModo = { normal: [], "clássico": [], rato: [] };

    try {
        const salvos = JSON.parse(lerDoArmazenamento("snakeRecordesPorModo"));

        if (salvos && typeof salvos === "object") {
            for (const modo of MODOS_DE_JOGO) {
                porModo[modo] = limparRecordes(salvos[modo]);
            }
        } else {
            // primeira vez com recordes por modo: os recordes antigos vão pro Normal
            porModo.normal = limparRecordes(JSON.parse(lerDoArmazenamento("snakeRecordes")));
        }
    } catch {
        // dado corrompido: começa com as listas vazias
    }

    return porModo;
}
let jogoAtivo = true;
let pausado = false;
let noMenu = true;
let quantidadeJogadoresAtual = 2;
let modoComBotAtivo = false;
let modoAtual = "normal";
let recordesPorModo = lerRecordesSalvos();
let modoExibidoRecordes = "normal";
let melhorPontuacao = 0;
let ultimoTickEm = performance.now();
let velocidadeAtual = VELOCIDADE_INICIAL_MS;
let nomesJogadoresAtuais = ["Jogador 1", "Jogador 2"];
let mudo = lerDoArmazenamento("snakeMudo") === "true";
let tempoPausadoTotal= 0;
let pausadoDesde = null;

const DURACAO_PASSO_CONTAGEM_MS = 700;
let contagemAtiva = false;
let textoContagem = "";
let inicioPassoContagem = 0;
let temporizadorContagem = null;

// relógio que não anda enquanto o jogo está pausado
function agoraDoJogo() {
    const pausaAtual = pausadoDesde !== null ? performance.now()- pausadoDesde : 0;
    return performance.now() - tempoPausadoTotal- pausaAtual;
}

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
    if (modoAtual === "clássico") return;

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

// ==========================================
// Desenho
// ==========================================
function desenharCelula(x, y, cor) {
    ctx.fillStyle = cor;
    ctx.fillRect(
        x * TAMANHO_CELULA,
        y * TAMANHO_CELULA,
        TAMANHO_CELULA,
        TAMANHO_CELULA
    );
}

function desenhar() {
    ctx.clearRect(0, 0, LARGURA_TABULEIRO, ALTURA_TABULEIRO);
    desenharTabuleiro();

    const progresso = jogoAtivo && !pausado
        ? Math.min((performance.now() - ultimoTickEm) / velocidadeAtual, 1)
        : 1;

    for (const obstaculo of obstaculos) {
        if (obstaculo.movel) {
            desenharObstaculo(
                interpolarEixo(obstaculo.anterior.x, obstaculo.x, progresso),
                interpolarEixo(obstaculo.anterior.y, obstaculo.y, progresso),
                true
            );
        } else {
            desenharObstaculo(obstaculo.x, obstaculo.y);
        }
    }

    if (modoAtual !== "rato") {
        desenharMaca(comida.x, comida.y);
    }

    for (const rato of ratos) {
        desenharRato(rato, progresso);
    }

    if (comidaDourada) {
        desenharMacaDourada(comidaDourada);
    }

    if (powerUp) {
        desenharPowerUp(powerUp);
    }

    for (const jogador of jogadores) {
        desenharCobra(jogador, progressoDoJogador(jogador));
    }

    desenharTextosFlutuantes();
}

// cada cobra tem o próprio ritmo (com Turbo o passo dura metade)
function progressoDoJogador(jogador) {
    if (!jogoAtivo || pausado) {
        return 1;
    }

    return Math.min((performance.now() - jogador.ultimoPassoEm) / jogador.duracaoPasso, 1);
}

// "+3" que sobe de cabeça da cobra e some
function adicionarTextoFlutuante(posicao, texto, cor) {
    textosFlutuantes.push({ x: posicao.x, y: posicao.y, texto, cor, criadoEm: agoraDoJogo() });
}

function desenharTextosFlutuantes() {
    const agora = agoraDoJogo();

    // tira os que já terminaram de subir
    textosFlutuantes = textosFlutuantes.filter((item) => agora - item.criadoEm < DURACAO_TEXTO_FLUTUANTE_MS);

    for (const item of textosFlutuantes) {
        const progresso = (agora - item.criadoEm) / DURACAO_TEXTO_FLUTUANTE_MS;
        // não deixa o texto sair pelos lados do tabuleiro
        const x = Math.min(Math.max((item.x + 0.5) * TAMANHO_CELULA, 16), LARGURA_TABULEIRO - 16);
        const y = (item.y + 0.5) * TAMANHO_CELULA - 10 - progresso * 22;

        ctx.save();
        ctx.globalAlpha = 1 - progresso * progresso; // some mais rápido no final
        ctx.font = "800 15px 'Bricolage Grotesque', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(14, 23, 18, 0.85)";
        ctx.strokeText(item.texto, x, y);
        ctx.fillStyle = item.cor;
        ctx.fillText(item.texto, x, y);
        ctx.restore();
    }
}

function desenharTabuleiro() {
    for (let linha = 0; linha < LINHAS; linha++) {
        for (let coluna = 0; coluna < COLUNAS; coluna++) {
            const ehClara = (linha + coluna) % 2 === 0;
            desenharCelula(coluna, linha, ehClara ? CORES_TABULEIRO.claro : CORES_TABULEIRO.escuro);
        }
    }
}

function desenharMaca(x, y, cor = "#e7471d") {
    const centroX = x * TAMANHO_CELULA + TAMANHO_CELULA / 2;
    const centroY = y * TAMANHO_CELULA + TAMANHO_CELULA / 2 + 1;
    const raio = TAMANHO_CELULA * 0.38;

    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(centroX, centroY, raio, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.arc(centroX - raio * 0.4, centroY - raio * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#5b3a1a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centroX, centroY - raio + 1);
    ctx.lineTo(centroX + 1, centroY - raio - 3);
    ctx.stroke();

    ctx.fillStyle = "#3f8f2f";
    ctx.beginPath();
    ctx.ellipse(centroX + 4, centroY - raio - 1, 3.5, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();
}

function desenharRato(rato, progresso) {
    const centroX = (interpolarEixo(rato.anterior.x, rato.x, progresso) + 0.5) * TAMANHO_CELULA;
    const centroY = (interpolarEixo(rato.anterior.y, rato.y, progresso) + 0.5) * TAMANHO_CELULA;
    const angulo = Math.atan2(rato.direcao.y, rato.direcao.x);
    const escala = TAMANHO_CELULA / 20; // desenho feito pra uma casa de 20px

    ctx.save();
    ctx.translate(centroX, centroY);
    ctx.rotate(angulo);
    ctx.scale(escala, escala);

    // rabo
    ctx.strokeStyle = "#e8a3a3";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(-10, -4, -13, 1);
    ctx.stroke();

    // corpo e cabeça
    ctx.fillStyle = TIPOS_RATO[rato.tipo].cor;
    ctx.beginPath();
    ctx.ellipse(-1, 0, 6.5, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, 0, 3.6, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // orelhas
    ctx.fillStyle = "#f4b6c2";
    for (const lado of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(3.5, lado * 3.6, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // olhos e focinho
    ctx.fillStyle= "#1f1f1f";
    for (const lado of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(6.6, lado * 1.3, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = "#e57373";
    ctx.beginPath();
    ctx.arc(8.6, 0, 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function desenharPowerUp(item) {
    const centroX= item.x * TAMANHO_CELULA+ TAMANHO_CELULA / 2;
    const centroY = item.y * TAMANHO_CELULA + TAMANHO_CELULA / 2;
    const cor = CORES_POWERUP[item.tipo];
    const pulso = (Math.sin(agoraDoJogo() / 200) + 1) / 2; // vai de 0 a 1 e volta
    const metade= TAMANHO_CELULA * (0.3+ 0.04 * pulso);

    ctx.save();

    // brilho em volta, pulsando
    ctx.globalAlpha = 0.2 + 0.2 * pulso;
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(centroX, centroY, TAMANHO_CELULA * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // losango (um quadrado girado 45°)
    ctx.translate(centroX, centroY);
    ctx.rotate(Math.PI/ 4);
    ctx.fillStyle = cor;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-metade, -metade, metade * 2, metade * 2, 2);
    ctx.fill();
    ctx.stroke();

    // reflexo
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.beginPath();
    ctx.roundRect(-metade * 0.7, -metade * 0.7, metade * 0.7, metade * 0.7, 1);
    ctx.fill();

    ctx.restore();
}

function desenharMacaDourada(item) {
    const centroX= item.x * TAMANHO_CELULA + TAMANHO_CELULA / 2;
    const centroY = item.y * TAMANHO_CELULA + TAMANHO_CELULA / 2;
    const pulso = (Math.sin(agoraDoJogo() / 150) + 1) / 2;
    const tempoRestante = Math.max(0, (item.expiraEm - agoraDoJogo()) / DURACAO_COMIDA_DOURADA_MS);

    // brilho em volta, pulsando
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.25 * pulso;
    ctx.fillStyle = "#f5c451";
    ctx.beginPath();
    ctx.arc(centroX, centroY, TAMANHO_CELULA * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    desenharMaca(item.x, item.y, "#f5c451");

    // anel que vai sumindo: mostra quando tempo falta pra maçã dourada ir embora
    ctx.save();
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 2;
    ctx.lineCap= "round";
    ctx.beginPath();
    ctx.arc(centroX, centroY, TAMANHO_CELULA * 0.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * tempoRestante);
    ctx.stroke();
    ctx.restore();
}

function desenharObstaculo(x, y, movel = false) {
    const margem = 2;
    const lado = TAMANHO_CELULA - margem * 2;

    ctx.fillStyle = movel ? "#4f5d75" : "#6d6d6d"; // as que andam são azuladas
    ctx.beginPath();
    ctx.roundRect(x * TAMANHO_CELULA + margem, y * TAMANHO_CELULA + margem, lado, lado, 5);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.roundRect(x * TAMANHO_CELULA + margem + 2, y * TAMANHO_CELULA + margem + 2, lado / 2, lado / 3, 2);
    ctx.fill();
}

const SUBDIVISOES_CORPO = 4;

function desenharCabecaCobra(corCabeca) {
    ctx.fillStyle = corCabeca;
    ctx.beginPath();
    ctx.ellipse(4, 0, 15, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    for (const lado of [-1, 1]) {
        ctx.fillStyle = "#ffe066";
        ctx.beginPath();
        ctx.arc(-3, lado * 11, 6.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#2a1200";
        ctx.beginPath();
        ctx.ellipse(-1, lado * 11, 1.5, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.arc(14, lado * 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function desenharCobra(jogador, progresso) {
    const pontos = jogador.cobra.map((segmento, indice) => {
        const anterior = jogador.cobraAnterior[indice] || segmento;
        return {
            x: (interpolarEixo(anterior.x, segmento.x, progresso) + 0.5) * TAMANHO_CELULA,
            y: (interpolarEixo(anterior.y, segmento.y, progresso) + 0.5) * TAMANHO_CELULA,
        };
    });

    const corCauda = jogador.invencivel ? "#d4a800" : jogador.corCorpo;
    const corCabeca = jogador.invencivel ? "#fff27a" : jogador.corCabeca;
    const distanciaMaxima = TAMANHO_CELULA * 1.5;
    const larguraBase = TAMANHO_CELULA * 0.7;
    const totalSegmentos = pontos.length;

    ctx.lineCap = "round";

    for (let i = totalSegmentos - 1; i >= 1; i--) {
        const deste = pontos[i];
        const proximo = pontos[i - 1];

        if (Math.hypot(proximo.x - deste.x, proximo.y - deste.y) > distanciaMaxima) {
            continue;
        }

        for (let passo = 0; passo < SUBDIVISOES_CORPO; passo++) {
            const t0 = passo / SUBDIVISOES_CORPO;
            const t1 = (passo + 1) / SUBDIVISOES_CORPO;
            const indiceMeio = i - (t0 + t1) / 2;
            const posicaoNoCorpo = 1 - indiceMeio / (totalSegmentos - 1);
            
            ctx.strokeStyle = misturarCores(corCauda, corCabeca, posicaoNoCorpo);
            ctx.lineWidth = larguraBase * (0.6 + 0.4 * posicaoNoCorpo);
            ctx.beginPath();
            ctx.moveTo(deste.x + (proximo.x - deste.x) * t0, deste.y + (proximo.y - deste.y) * t0);
            ctx.lineTo(deste.x + (proximo.x - deste.x) * t1, deste.y + (proximo.y - deste.y) * t1);
            ctx.stroke();
        }
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    for (let i = 2; i < totalSegmentos; i += 2) {
        ctx.beginPath();
        ctx.arc(pontos[i].x, pontos[i].y, TAMANHO_CELULA * 0.09, 0, Math.PI * 2);
        ctx.fill();
    }

    const angulo = Math.atan2(jogador.direcao.y, jogador.direcao.x);
    const escala = TAMANHO_CELULA / 26;

    ctx.save();
    ctx.translate(pontos[0].x, pontos[0].y);
    ctx.rotate(angulo);
    ctx.scale(escala, escala);
    desenharCabecaCobra(corCabeca);
    ctx.restore();
}

function loopRenderizacao() {
    desenhar();

    if (pausado && !contagemAtiva) {
        desenharPausa();
    }

    desenharContagem();
    atualizarBarrasEfeitos();

    requestAnimationFrame(loopRenderizacao);
}

function mostrarTelaGameOver(jogadoresVivos, batidas) {
    let resultado;

    if (jogadores.length === 1) {
        resultado = "Game Over";
    } else if (jogadoresVivos.length === 1) {
        resultado = `${jogadoresVivos[0].nome} venceu!`;
    } else {
        resultado = "Empate!";
    }

    const textoPontuacao = jogadores
          .map((jogador) => `${jogador.nome}: ${jogador.pontuacao}`)
          .join(" | ");

    elementoResultadoFinal.textContent = resultado;
    elementoCausaMorte.textContent = batidas
        .map(({ jogador, motivo }) => {
            const nome = jogadores.length === 1 ? "Você" : jogador.nome;
            const outro = jogadores.find((outroJogador) => outroJogador !== jogador);
            return descreverBatida(nome, motivo, outro ? outro.nome : "");
        })
        .join(" · ");
    elementoPontuacaoFinal.textContent = textoPontuacao;

     // compara com o Top 5 de antes, por isso vem antes de atualizarListaRecordes
    const pontuacoesHumanas = jogadores.filter((jogador) => !jogador.bot).map((jogador) => jogador.pontuacao);
    mostrarConquista(tipoDeConquista(pontuacoesHumanas, recordesDoModo(modoAtual)));

    atualizarListaRecordes(
        jogadores
            .filter((jogador) => !jogador.bot && jogador.pontuacao > 0)
            .map((jogador) => ({nome: jogador.nome, pontuacao: jogador.pontuacao }))
    );
    telaGameOver.hidden = false;
}

function mostrarConquista(conquista) {
    elementoAvisoRecorde.hidden = conquista === null;

    if (conquista === "recorde") {
        elementoAvisoRecorde.textContent = "Novo recorde!";
        tocarFanfarra();
    } else if (conquista === "top") {
        elementoAvisoRecorde.textContent = "Entrou no Top 5!";
    }
}

function tocarFanfarra() {
    const notas = [523, 659, 784, 1047]; // dó, mi, sol, dó (uma oitava acima)

    notas.forEach((frequencia, indice) => {
        // espera o som da batida terminar antes de começar
        setTimeout(() => tocarSom(frequencia, 0.15, "triangle"), 350 + indice * 120);
    });
}

function desenharPausa() {
    ctx.fillStyle = "rgba(14, 23, 18, 0.8)";
    ctx.fillRect(0, 0, LARGURA_TABULEIRO, ALTURA_TABULEIRO);
    ctx.fillStyle = "#eef3e6";
    ctx.font = "800 32px 'Bricolage Grotesque', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PAUSADO", LARGURA_TABULEIRO / 2, ALTURA_TABULEIRO / 2);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
}

function desenharContagem() {
    const decorrido = performance.now() - inicioPassoContagem;

    if (!textoContagem || decorrido > DURACAO_PASSO_CONTAGEM_MS) {
        return;
    }

    const progresso = decorrido / DURACAO_PASSO_CONTAGEM_MS;
    // o número "pula" grande e encolhe rápido até o tamanho normal
    const tamanho = 96 * (1.25 - 0.25 * Math.min(progresso * 3, 1));

    ctx.save();

    if (contagemAtiva) {
        ctx.fillStyle = "rgba(14, 23, 18, 0.45)";
        ctx.fillRect(0, 0, LARGURA_TABULEIRO, ALTURA_TABULEIRO);
    }

    ctx.globalAlpha = contagemAtiva ? 1 : 1 - progresso; // o "Vai!" some aos poucos
    ctx.fillStyle = "#eef3e6";
    ctx.font = `800 ${tamanho}px 'Bricolage Grotesque', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(textoContagem, LARGURA_TABULEIRO / 2, ALTURA_TABULEIRO / 2);
    ctx.restore();
}

function atualizarBarrasEfeitos() {
    const agora = agoraDoJogo();

    jogadores.forEach((jogador, indice) => {
        const container = containersEfeitos[indice];

        for (const efeito of EFEITOS_COM_DURACAO) {
            const elemento = container.querySelector(`[data-efeito="${efeito.ativo}"]`);
            const restante = jogador[efeito.ate] - agora;
            const estaAtivo = jogador[efeito.ativo] && restante > 0;

            elemento.hidden = !estaAtivo;

            if (estaAtivo) {
                const porcentagem = (restante / efeito.duracao) * 100;
                elemento.querySelector(".efeito-barra").style.width = `${porcentagem}%`;
                elemento.classList.toggle("acabando", restante < TEMPO_AVISO_FIM_EFEITO_MS);
            }
        }
    });
}

// aoTerminar: o que fazer depois do "Vai!" (começar o loop, ou sair da pausa)
function iniciarContagem(aoTerminar = loop) {
    const passos = ["3", "2", "1", "Vai!"];
    let indice = 0;

    contagemAtiva = true;
    clearTimeout(temporizadorContagem);

    function proximoPasso() {
        const ultimoPasso = indice === passos.length - 1;

        textoContagem = passos[indice];
        inicioPassoContagem = performance.now();
        tocarSom(ultimoPasso ? 880 : 440, 0.12, "square");

        if (ultimoPasso) {
            contagemAtiva = false;
            aoTerminar();
            return;
        }

        indice++;
        temporizadorContagem = setTimeout(proximoPasso, DURACAO_PASSO_CONTAGEM_MS);
    }

    proximoPasso();
}

function cancelarContagem() {
    clearTimeout(temporizadorContagem);
    contagemAtiva = false;
    textoContagem = "";
}

// ==========================================
// Som
// ==========================================
const NOTAS_MUSICA_FUNDO = [220, 246.94, 261.63, 246.94, 220, 196, 220, 246.94];
const DURACAO_NOTA_MUSICA_MS = 280;
const VOLUME_MUSICA_FUNDO = 0.05;

let contextoAudio = null;
let indiceNotaMusica = 0;
let temporizadorMusica = null;
let musicaAtiva = false;

function obterContextoAudio() {
    if (!contextoAudio) {
        contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
    }
    return contextoAudio;
}

function tocarSom(frequencia, duracaoSegundos, tipoOnda = "sine") {
    if (mudo) return;

    const ctxAudio = obterContextoAudio();
    const oscilador = ctxAudio.createOscillator();
    const ganho = ctxAudio.createGain();

    oscilador.type = tipoOnda;
    oscilador.frequency.value = frequencia;

    ganho.gain.setValueAtTime(0.2, ctxAudio.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.001, ctxAudio.currentTime + duracaoSegundos);

    oscilador.connect(ganho);
    ganho.connect(ctxAudio.destination);

    oscilador.start();
    oscilador.stop(ctxAudio.currentTime + duracaoSegundos);
}

function tocarSomComer() {
    tocarSom(700, 0.1, "square");
}

function tocarSomColisao() {
    tocarSom(120, 0.4, "sawtooth");
}

function tocarSomComidaDourada() {
    tocarSom(1000, 0.15, "triangle");
}

function tocarNotaMusica(frequencia) {
    if (mudo) return;

    const ctxAudio = obterContextoAudio();
    const oscilador = ctxAudio.createOscillator();
    const ganho = ctxAudio.createGain();

    oscilador.type = "triangle";
    oscilador.frequency.value = frequencia;

    ganho.gain.setValueAtTime(VOLUME_MUSICA_FUNDO, ctxAudio.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.001, ctxAudio.currentTime + DURACAO_NOTA_MUSICA_MS / 1000);

    oscilador.connect(ganho);
    ganho.connect(ctxAudio.destination);

    oscilador.start();
    oscilador.stop(ctxAudio.currentTime + DURACAO_NOTA_MUSICA_MS / 1000);
}

function loopMusicaFundo() {
    if (!musicaAtiva) return;

    if (jogoAtivo && !pausado) {
        tocarNotaMusica(NOTAS_MUSICA_FUNDO[indiceNotaMusica]);
        indiceNotaMusica = (indiceNotaMusica + 1) % NOTAS_MUSICA_FUNDO.length;
    }

    temporizadorMusica = setTimeout(loopMusicaFundo, DURACAO_NOTA_MUSICA_MS);
}

function iniciarMusicaFundo() {
    if (musicaAtiva) return;

    musicaAtiva = true;
    indiceNotaMusica = 0;
    loopMusicaFundo();
}

function pararMusicaFundo() {
    musicaAtiva = false;
    clearTimeout(temporizadorMusica);
}

function atualizarBotaoMudo() {
    botaoMudo.textContent = mudo ? "🔇 Som" : "🔊 Som";
}

mostrarRecordesDoModo(seletorModo.value);
atualizarBotaoMudo();

seletorModo.addEventListener("change", () => mostrarRecordesDoModo(seletorModo.value));

botaoMudo.addEventListener("click", () => {
    mudo = !mudo;
    salvarNoArmazenamento("snakeMudo", mudo);
    atualizarBotaoMudo();
});

// ==========================================
// Movimento e colisão
// ==========================================
function moverJogador(jogador) {
    const novaCabeca = calcularNovaCabeca(
        jogador.cobra[0], jogador.direcao, inputModoSemParedes.checked, COLUNAS, LINHAS
    );
    
    jogador.cobra.unshift(novaCabeca);

    const comeuComida = modoAtual !== "rato" && mesmaPosicao(novaCabeca, comida);
    const comeuComidaDourada = comidaDourada && novaCabeca.x === comidaDourada.x && novaCabeca.y === comidaDourada.y;

    const indiceRato = ratos.findIndex((rato) => mesmaPosicao(rato, novaCabeca));
    const comeuRato= indiceRato !== -1;

    if (comeuComida) {
        comida = gerarComida();
        comerAlimento(jogador, 1);
    }

    if (comeuRato) {
        const ratoComido = ratos[indiceRato];

        ratos.splice(indiceRato, 1);
        comerAlimento(jogador, TIPOS_RATO[ratoComido.tipo].pontos);
        ratos.push(gerarRato(ratoComido.tipo)); // nasce outro do mesmo tipo
    }

    if (comeuComidaDourada) {
        const pontosGanhos = PONTOS_COMIDA_DOURADA * (jogador.pontosDobradosAtivo ? 2 : 1);

        jogador.pontuacao += pontosGanhos;
        jogador.elementoPontuacao.textContent = jogador.comboAtual > 1
           ? `${jogador.pontuacao} (x${jogador.comboAtual})`
           : jogador.pontuacao;

        adicionarTextoFlutuante(novaCabeca, `+${pontosGanhos}`, "#f5c451");
        atualizarRecordeSeNecessario(jogador.pontuacao);
        tocarSomComidaDourada();

        comidaDourada = null;
    }

    if (!comeuComida && !comeuComidaDourada && !comeuRato) {
        jogador.cobra.pop();
    }
    
    const pegouPowerUp = powerUp && novaCabeca.x === powerUp.x && novaCabeca.y === powerUp.y;

    if (pegouPowerUp) {
        if (powerUp.tipo === "invencibilidade") {
            ativarInvencibilidade(jogador);
        } else if (powerUp.tipo === "velocidade") {
            ativarVelocidadeExtra(jogador);
        } else if (powerUp.tipo === "pontosDobrados") {
            ativarPontosDobrados(jogador);
        } else if (powerUp.tipo === "encolher") {
            ativarEncolher(jogador);
        } else if (powerUp.tipo === "ima") {
            ativarIma(jogador);
        }

        powerUp = null;
    }
}

// maçã ou rato: contra o combo, soma os pontos e atualiza o placar
function comerAlimento(jogador, pontosBase) {
    const agora = agoraDoJogo();
    const dentroDoCombo = jogador.ultimoComerEm !== null && (agora - jogador.ultimoComerEm) <= JANELA_COMBO_MS;

    jogador.comboAtual = dentroDoCombo ? jogador.comboAtual + 1 : 1;
    jogador.ultimoComerEm = agora;

    const pontosGanhos = pontosBase * jogador.comboAtual * (jogador.pontosDobradosAtivo ? 2 : 1);

    jogador.pontuacao += pontosGanhos;
    jogador.elementoPontuacao.textContent = jogador.comboAtual > 1
       ? `${jogador.pontuacao} (x${jogador.comboAtual})`
       : jogador.pontuacao;

    // branco normal; dourado quando tem combo ou pontos x2
    const corTexto = pontosGanhos > pontosBase ? "#f5c451" : "#ffffff";
    adicionarTextoFlutuante(jogador.cobra[0], `+${pontosGanhos}`, corTexto);   

    atualizarRecordeSeNecessario(jogador.pontuacao);
    adicionarObstaculosSeNecessario();
    tocarSomComer();
}

function atualizarRecordeSeNecessario(pontuacaoAtual) {
    if (pontuacaoAtual > melhorPontuacao) {
        melhorPontuacao = pontuacaoAtual;
        elementoRecorde.textContent = melhorPontuacao;
    }
}

function recordesDoModo(modo) {
    return recordesPorModo[modo] || [];
}

// mostra o Top 5 e o troféu do modo escolhido
function mostrarRecordesDoModo(modo) {
    const lista = recordesDoModo(modo);

    modoExibidoRecordes = modo;
    melhorPontuacao = lista.length > 0 ? lista[0].pontuacao : 0;
    elementoRecorde.textContent = melhorPontuacao;
    elementoModoRecordes.textContent = NOMES_MODOS[modo] || modo;
    desenharListaRecordes();
}

function desenharListaRecordes() {
    elementoListaRecordes.innerHTML = "";

    recordesDoModo(modoExibidoRecordes).forEach((registro) => {
        const item = document.createElement("li");
        item.textContent = `${registro.nome}: ${registro.pontuacao}`;
        elementoListaRecordes.appendChild(item);
    });
}

function atualizarListaRecordes(novosRegistros) {
    recordesPorModo[modoAtual] = juntarRecordes(recordesDoModo(modoAtual), novosRegistros);

    salvarNoArmazenamento("snakeRecordesPorModo", JSON.stringify(recordesPorModo));
    mostrarRecordesDoModo(modoAtual);
}

function ativarInvencibilidade(jogador) {
    jogador.invencivel = true;

    jogador.invencivelAte = agoraDoJogo() + DURACAO_INVENCIBILIDADE_MS;
}

function ativarVelocidadeExtra(jogador) {
    jogador.velocidadeExtraAtiva = true;

    jogador.velocidadeExtraAte = agoraDoJogo() + DURACAO_VELOCIDADE_EXTRA_MS;
}

function ativarPontosDobrados(jogador) {
    jogador.pontosDobradosAtivo = true;

    jogador.pontosDobradosAte = agoraDoJogo() + DURACAO_PONTOS_DOBRADOS_MS;
}

function ativarIma(jogador) {
    jogador.imaAtivo = true;

    jogador.imaAte = agoraDoJogo() + DURACAO_IMA_MS; 
}

function atualizarEfeitos(jogador) {
    const agora = agoraDoJogo();

    if (jogador.invencivel && agora >= jogador.invencivelAte) {
        jogador.invencivel = false;
    }
    if (jogador.velocidadeExtraAtiva && agora >= jogador.velocidadeExtraAte) {
        jogador.velocidadeExtraAtiva = false;
    }
    if (jogador.pontosDobradosAtivo && agora >= jogador.pontosDobradosAte) {
        jogador.pontosDobradosAtivo = false;
    }
    if (jogador.imaAtivo && agora >= jogador.imaAte) {
        jogador.imaAtivo = false;
    }
}

// com Imã ligado, maçã dourada e ratos andam uma casa em direção à cabeça mais perto (de quem tem imã)
function puxarAlimento() {
    const cabecasComIma = jogadores.filter((jogador) => jogador.imaAtivo).map((jogador) => jogador.cobra[0]);

    const casaLivre = (posicao) =>
        !foraDoTabuleiro(posicao, COLUNAS, LINHAS) &&
        !posicaoOcupada(posicao, obstaculos, jogadores) &&
        !ratos.some((rato) => mesmaPosicao(rato, posicao)) &&
        !(powerUp && mesmaPosicao(powerUp, posicao)) &&
        !mesmaPosicao(comida, posicao) &&
        !(comidaDourada && mesmaPosicao(comidaDourada, posicao));

    const proximaCasa = (item) => {
        const alvo = cabecasComIma.reduce((maisPerto, cabeca) =>
            distanciaManhattan(item, cabeca) < distanciaManhattan(item, maisPerto) ? cabeca : maisPerto
        );
        return passoEmDirecaoA(item, alvo, casaLivre);
    };

    if (modoAtual !== "rato") {
        comida = proximaCasa(comida);
    }

    if (comidaDourada) {
        const destino = proximaCasa(comidaDourada);
        comidaDourada.x = destino.x;
        comidaDourada.y = destino.y;
    }

    for (const rato of ratos) {
        rato.anterior = { x: rato.x, y: rato.y };
        const destino = proximaCasa(rato);

        if (!mesmaPosicao(destino, rato)) {
            rato.direcao = { x: destino.x - rato.x, y: destino.y - rato.y };
            rato.x = destino.x;
            rato.y = destino.y;
        }
    }
}

function ativarEncolher(jogador) {
    const tamanhoMinimo = 1;
    const quantidadeARemover = Math.min(QUANTIDADE_ENCOLHER, jogador.cobra.length - tamanhoMinimo);

    for (let i = 0; i < quantidadeARemover; i++) {
        jogador.cobra.pop();
    }
}

function motivoDaBatida(jogador) {
    return motivoDaColisao(jogador, jogadores, obstaculos, COLUNAS, LINHAS);
}

//  ==========================================
// Direção (regra compartilhada entre teclado e toque)
//  ==========================================

// no modo rato o bot persegue o rato mais perto; nos outros, a maçã
function escolherAlvoBot(cabeca) {
    if (modoAtual !== "rato" || ratos.length === 0) {
        return comida;
    }

    return ratos.reduce((maisPerto, rato) =>
        distanciaManhattan(cabeca, rato) < distanciaManhattan(cabeca, maisPerto) ? rato : maisPerto
    );
}

function decidirDirecaoBot(jogador) {
    const semParedes = inputModoSemParedes.checked;
    const andar = (posicao, direcao) => calcularNovaCabeca(posicao, direcao, semParedes, COLUNAS, LINHAS);
    const casaLivre = (posicao) =>
        !foraDoTabuleiro(posicao, COLUNAS, LINHAS) && !posicaoOcupada(posicao, obstaculos, jogadores);
    const cabeca = jogador.cobra[0];

    // precisa de espaço pra caber o corpo inteiro (+2 de folga), senão é beco
    const espaçoNecessario = jogador.cobra.length + 2;

    return escolherDirecaoBot(cabeca, jogador.direcao, escolherAlvoBot(cabeca), andar, casaLivre, espaçoNecessario);
}

function alternarPausa() {
    if (pausado) {
        iniciarContagem(sairDaPausa);  // o loop continua esperando; só despausava no "Vai!"
    } else {
        entrarNaPausa();
    }
}

function entrarNaPausa() {
    pausado = true;
    pausadoDesde = performance.now();
    botaoPausa.textContent = "Continuar";
    tocarSom(300, 0.08, "sine");
}

function sairDaPausa() {
    tempoPausadoTotal += performance.now() - pausadoDesde;
    pausadoDesde = null;
    pausado = false;
    botaoPausa.textContent = "Pausar";
}

// ==========================================
// Controle: teclado
// ==========================================
function mudarDirecao(evento) {
    if (noMenu) return;
    if (!jogoAtivo) {
        if (evento.key === "Escape") {
            voltarAoMenu();
            return;
        }
        // Enter/Espaço num botão já disparam o clique dele; evita reiniciar duas vezes
        if (evento.target.tagName === "BUTTON") return;

        reiniciar();
        return;
    }

    const tecla = evento.key.toLowerCase();

    if (tecla === " ") {
        evento.preventDefault();
        if (!contagemAtiva) alternarPausa();
        return;
    }

    if (pausado) {
        return;
    }

    for (const jogador of jogadores) {
        if (jogador.bot) continue;

        if (tecla === jogador.teclas.cima) {
        definirDirecaoJogador(jogador, { x: 0, y: -1 });
        } else if (tecla === jogador.teclas.baixo) {
        definirDirecaoJogador(jogador, { x: 0, y: 1 });
        } else if (tecla === jogador.teclas.esquerda) {
        definirDirecaoJogador(jogador, { x: -1, y: 0 });
        } else if (tecla === jogador.teclas.direita) {
        definirDirecaoJogador(jogador, { x: 1, y: 0 });
        }
    }
}

botaoPausa.addEventListener("click", () => {
    if (noMenu || !jogoAtivo || contagemAtiva) return;
    alternarPausa();
});

// pausa sozinho se o jogador sair da aba/janela (e não despausa sozinho ao voltar)
function pausarAutomaticamente() {
    if (noMenu || !jogoAtivo) return;

    if (pausado) {
        // saiu da aba no meio da contagem de volta: cancela e continua pausado
        if (contagemAtiva) cancelarContagem();
        return;
    }
    
    alternarPausa();
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        pausarAutomaticamente();
    }
});
window.addEventListener("blur", pausarAutomaticamente);

document.addEventListener("keydown", mudarDirecao);
botaoJogarDeNovo.addEventListener("click", reiniciar);
botaoVoltarMenu.addEventListener("click", voltarAoMenu);

// ==========================================
// Tela "Como jogar"
// ==========================================
function abrirComoJogar() {
    telaInicial.hidden = true;
    telaComoJogar.hidden = false;
    telaComoJogar.scrollTop = 0;
    botaoFecharComoJogar.focus();
}

function fecharComoJogar() {
    telaComoJogar.hidden = true;
    telaInicial.hidden = false;
    botaoComoJogar.focus();
}

botaoComoJogar.addEventListener("click", abrirComoJogar);
botaoFecharComoJogar.addEventListener("click", fecharComoJogar);

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !telaComoJogar.hidden) {
        fecharComoJogar();
    }
});

function voltarAoMenu() {
    telaGameOver.hidden = true;
    telaInicial.hidden = false;
    noMenu = true;
}

// ==========================================
// Controle: toque (swipe) - controla o Jogador 1
// ==========================================
let toqueInicioX = 0;
let toqueInicioY = 0;

canvas.addEventListener("touchstart", (evento) => {
    const toque = evento.touches[0];
    toqueInicioX = toque.clientX;
    toqueInicioY = toque.clientY;
});

canvas.addEventListener("touchmove", (evento) => {
    evento.preventDefault();
}, {passive: false});

canvas.addEventListener("touchend", (evento) => {
    if (noMenu) return;
    if (!jogoAtivo) {
        reiniciar();
        return;
    }

    
    const toque = evento.changedTouches[0];
    const deltaX = toque.clientX - toqueInicioX;
    const deltaY = toque.clientY - toqueInicioY;

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < DISTANCIA_MINIMA_SWIPE) {
        return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        definirDirecaoJogador(jogadores[0], deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    } else {
        definirDirecaoJogador(jogadores[0], deltaY > 0 ? { x: 0, y: 1} : { x: 0, y: -1 });
    }
});

function pressionarDirecaoTela(direcao) {
    if (noMenu) return;
    if (!jogoAtivo) {
        reiniciar();
        return;
    }
    if (pausado) return;

    definirDirecaoJogador(jogadores[0], direcao);
}

botaoCima.addEventListener("click", () => pressionarDirecaoTela({ x: 0, y: -1 }));
botaoBaixo.addEventListener("click", () => pressionarDirecaoTela({ x: 0, y: 1 }));
botaoEsquerda.addEventListener("click", () => pressionarDirecaoTela({ x: -1, y: 0 }));
botaoDireita.addEventListener("click", () => pressionarDirecaoTela({ x: 1, y: 0 }));

// ==========================================
// Loop principal e ciclo de vida no jogo
// ==========================================
function loop() {
    if (!jogoAtivo) return;

    if (pausado) {
        setTimeout(loop, 100);
        return;
    }
    // o loop roda em meios passos: quem está com Turbo anda em todos,
    // os outros só nos passos completos (um sim, um não)
    contadorMeiosPassos++;
    const passoCompleto = contadorMeiosPassos % MEIOS_PASSOS_POR_PASSO === 0;
    const agoraReal = performance.now();

    for (const jogador of jogadores) {
        atualizarEfeitos(jogador);

        if (jogador.comboAtual > 0 && agoraDoJogo() - jogador.ultimoComerEm > JANELA_COMBO_MS) {
            jogador.comboAtual = 0;
        }
    }

    const jogadoresQueAndam = jogadores.filter((jogador) => passoCompleto || jogador.velocidadeExtraAtiva);

    for (const jogador of jogadoresQueAndam) {
        if (jogador.bot) {
            definirDirecaoJogador(jogador, decidirDirecaoBot(jogador));
        }
        
        jogador.cobraAnterior = jogador.cobra.map((segmento) => ({ ...segmento }));
        aplicarProximaDirecao(jogador);
        moverJogador(jogador);

        jogador.ultimoPassoEm = agoraReal;
        jogador.duracaoPasso = jogador.velocidadeExtraAtiva
            ? velocidadeAtual / MEIOS_PASSOS_POR_PASSO
            : velocidadeAtual;
    }

    if (comidaDourada && agoraDoJogo() >= comidaDourada.expiraEm) {
        comidaDourada = null;
    }
    
    // só quem andou pode ter batido
    const batidas = jogadoresQueAndam
        .map((jogador) => ({ jogador, motivo: motivoDaBatida(jogador) }))
        .filter((batida) => batida.motivo !== null);

    if (batidas.length > 0) {
        jogoAtivo = false;
        pararMusicaFundo();
        tocarSomColisao();
        mostrarTelaGameOver(
            jogadores.filter((jogador) => !batidas.some((batida) => batida.jogador === jogador)),
            batidas
        );
        return;
    }

    if (passoCompleto) {

    const imaLigado = jogadores.some((jogador) => jogador.imaAtivo);

    if (imaLigado) {
        puxarAlimento(); // os ratos não fogem: são puxados
    } else if (modoAtual === "rato") {
        moverRatos();
    }

    moverPedras();
    
    if (!powerUp && Math.random() < CHANCE_POWERUP_POR_TICK) {
        const posicao = gerarPosicaoLivre();
        powerUp = { x: posicao.x, y: posicao.y, tipo: gerarTipoPowerUp() };
    }

    if(!comidaDourada && Math.random() < CHANCE_COMIDA_DOURADA_POR_TICK) {
        gerarComidaDourada();
    }

    ultimoTickEm = agoraReal;

    velocidadeAtual = Math.max(
        VELOCIDADE_MINIMA_MS,
        VELOCIDADE_INICIAL_MS - Math.max(...jogadores.map((j) => j.pontuacao)) * REDUCAO_VELOCIDADE_POR_PONTO
    );
    }

    setTimeout(loop, velocidadeAtual / MEIOS_PASSOS_POR_PASSO);
}

function reiniciar() {
    iniciarMusicaFundo();
    jogadores = criarJogadores(quantidadeJogadoresAtual, nomesJogadoresAtuais);

    if (modoComBotAtivo) {
        jogadores[1].bot = true;
    }

    jogadores.forEach((jogador) => {
        jogador.elementoPontuacao.textContent = jogador.pontuacao;
    });
    obstaculos = gerarObstaculos();
    tornarPedrasMoveis();
    comida = gerarComida();
    criarRatosIniciais();
    contadorMeiosPassos = 0;
    contadorPassosPedras = 0;
    textosFlutuantes = [];
    powerUp = null;
    comidaDourada = null;
    pausado = false;
    pausadoDesde = null;
    telaGameOver.hidden = true;
    jogoAtivo = true;
    botaoPausa.textContent = "Pausar";
    iniciarContagem();
}

function aplicarDificuldade() {
    const configuracao = CONFIGURACAO_DIFICULDADE[seletorDificuldade.value];

    VELOCIDADE_INICIAL_MS = configuracao.velocidadeInicial;
    QUANTIDADE_OBSTACULOS = modoAtual === "clássico" ? 0 : configuracao.obstaculos;
    QUANTIDADE_PEDRAS_MOVEIS = modoAtual === "clássico" ? 0 : configuracao.pedrasMoveis;
}

function comecarJogo(quantidade, comBot = false) {
    obterContextoAudio();
    modoAtual = seletorModo.value;
    mostrarRecordesDoModo(modoAtual);
    aplicarDificuldade();
    quantidadeJogadoresAtual = comBot ? 2 : quantidade;
    modoComBotAtivo = comBot;

    const nome1 = inputNomeJogador1.value.trim() || "Jogador 1";
    const nome2 = comBot ? "Bot" : (inputNomeJogador2.value.trim() || "Jogador 2");
    nomesJogadoresAtuais = [nome1, nome2];

    elementoNomeExibido1.textContent = nome1;
    elementoNomeExibido2.textContent = nome2;
    placarJogador2.hidden = quantidadeJogadoresAtual === 1;
    noMenu = false;
    telaInicial.hidden= true;
    reiniciar();
}

botaoJogar1.addEventListener("click", () => comecarJogo(1));
botaoJogar2.addEventListener("click", () => comecarJogo(2));
botaoJogarBot.addEventListener("click", () => comecarJogo(1, true));

// ==========================================
// Início
// ==========================================
loopRenderizacao();
