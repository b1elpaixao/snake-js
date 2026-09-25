// ==========================================
// Configuração e elementos do DOM
// ==========================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const elementoRecorde = document.getElementById("highscore");
const telaGameOver = document.getElementById("telaGameOver");
const elementoResultadoFinal = document.getElementById("resultadoFinal");
const elementoPontuacaoFinal = document.getElementById("pontuacaoFinal");
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
const PONTOS_POR_NOVO_OBSTACULO = 3;
const JANELA_COMBO_MS = 3000; // tempo máximo entre uma comida e outra pra manter o combo

const CHANCE_POWERUP_POR_TICK = 0.01;
const CHANCE_COMIDA_DOURADA_POR_TICK = 0.005;
const PONTOS_COMIDA_DOURADA = 5;
const DURACAO_COMIDA_DOURADA_MS = 4000;
const DURACAO_INVENCIBILIDADE_MS = 5000;
const DURACAO_VELOCIDADE_EXTRA_MS = 5000;
const DURACAO_PONTOS_DOBRADOS_MS = 5000;
const MULTIPLICADOR_VELOCIDADE_EXTRA = 0.5;
const QUANTIDADE_ENCOLHER = 3;
const CORES_POWERUP = {
    invencibilidade: "gold",
    velocidade: "deepskyblue",
    pontosDobrados: "magenta",
    encolher: "white",
};
const EFEITOS_COM_DURACAO = [
    { ativo: "invencivel", ate: "invencivelAte", duracao: DURACAO_INVENCIBILIDADE_MS },
    { ativo: "velocidadeExtraAtiva", ate: "velocidadeExtraAte", duracao: DURACAO_VELOCIDADE_EXTRA_MS },
    { ativo: "pontosDobradosAtivo", ate: "pontosDobradosAte", duracao: DURACAO_PONTOS_DOBRADOS_MS },
];
const TEMPO_AVISO_FIM_EFEITO_MS = 1500;
const containersEfeitos = [
    document.getElementById("efeitosJogador1"),
    document.getElementById("efeitosJogador2"),
];
const CORES_TABULEIRO = { claro: "#aad751", escuro: "#a2d149" };

const telaInicial = document.getElementById("telaInicial");
const seletorDificuldade = document.getElementById("seletorDificuldade");

const CONFIGURACAO_DIFICULDADE = {
    facil: { velocidadeInicial: 300, obstaculos: 5 },
    normal: { velocidadeInicial: 250, obstaculos: 8 },
    dificil: { velocidadeInicial: 180, obstaculos: 12 },
};
const botaoJogarBot = document.getElementById("botaoJogarBot");
const botaoJogar1 = document.getElementById("botaoJogar1");
const botaoJogar2 = document.getElementById("botaoJogar2");
const placarJogador2 = document.getElementById("placarJogador2");

const elementoListaRecordes = document.getElementById("listaRecordes");

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
        pontosDobradosAtivo: false,
        invencivelAte: 0,
        velocidadeExtraAte: 0,
        pontosDobradosAte: 0,
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

function lerRecordesSalvos() {
    try {
        const salvos = JSON.parse(lerDoArmazenamento("snakeRecordes"));

        if (!Array.isArray(salvos)) {
            return [];
        }

        return salvos.filter((registro) =>
            registro &&
            typeof registro.nome === "string" &&
            registro.nome !== "Bot" &&
            Number(registro.pontuacao) > 0
        );
    } catch {
        return []; // dado corrompido: começa com a lista vazia
    }
}
let melhorPontuacao = Number(lerDoArmazenamento("snakeMelhorPontuacao")) || 0;
let jogoAtivo = true;
let pausado = false;
let noMenu = true;
let quantidadeJogadoresAtual = 2;
let modoComBotAtivo = false;
let recordes = lerRecordesSalvos();
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
        mesmaPosicao(comida, candidato)
    );

    return candidato;
}

function gerarTipoPowerUp() {
    const tipos = ["invencibilidade", "velocidade", "pontosDobrados", "encolher"];
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

function adicionarObstaculosSeNecessario() {
    const maiorPontuacao = Math.max(...jogadores.map((j) => j.pontuacao));
    const quantidadeAlvo = QUANTIDADE_OBSTACULOS + Math.floor(maiorPontuacao / PONTOS_POR_NOVO_OBSTACULO);

    while (obstaculos.length < quantidadeAlvo) {
        obstaculos.push(gerarPosicaoLivre());
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

    for (const obstaculo of obstaculos) {
        desenharObstaculo(obstaculo.x, obstaculo.y);
    }

    desenharMaca(comida.x, comida.y);

    if (comidaDourada) {
        desenharCelula(comidaDourada.x, comidaDourada.y, "goldenrod");
    }

    if (powerUp) {
        desenharCelula(powerUp.x, powerUp.y, CORES_POWERUP[powerUp.tipo]);
    }

    const progresso = jogoAtivo && !pausado
        ? Math.min((performance.now() - ultimoTickEm) / velocidadeAtual, 1)
        : 1;

    for (const jogador of jogadores) {
        desenharCobra(jogador, progresso);
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

function desenharMaca(x, y) {
    const centroX = x * TAMANHO_CELULA + TAMANHO_CELULA / 2;
    const centroY = y * TAMANHO_CELULA + TAMANHO_CELULA / 2 + 1;
    const raio = TAMANHO_CELULA * 0.38;

    ctx.fillStyle = "#e7471d";
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

function desenharObstaculo(x, y) {
    const margem = 2;
    const lado = TAMANHO_CELULA - margem * 2;

    ctx.fillStyle = "#6d6d6d";
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

    if (pausado) {
        desenharPausa();
    }

    desenharContagem();
    atualizarBarrasEfeitos();

    requestAnimationFrame(loopRenderizacao);
}

function mostrarTelaGameOver(jogadoresVivos) {
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
    elementoPontuacaoFinal.textContent = textoPontuacao;
    atualizarListaRecordes(
        jogadores
            .filter((jogador) => !jogador.bot && jogador.pontuacao > 0)
            .map((jogador) => ({nome: jogador.nome, pontuacao: jogador.pontuacao }))
    );
    telaGameOver.hidden = false;
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

function iniciarContagem() {
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
            loop();
            return;
        }

        indice++;
        temporizadorContagem = setTimeout(proximoPasso, DURACAO_PASSO_CONTAGEM_MS);
    }

    proximoPasso();
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

elementoRecorde.textContent = melhorPontuacao;
desenharListaRecordes();
atualizarBotaoMudo();

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

    const comeuComida = novaCabeca.x === comida.x && novaCabeca.y === comida.y;
    const comeuComidaDourada = comidaDourada && novaCabeca.x === comidaDourada.x && novaCabeca.y === comidaDourada.y;
    
    if (comeuComida) {
        const agora = agoraDoJogo();
        const dentroDoCombo = jogador.ultimoComerEm !== null && (agora - jogador.ultimoComerEm) <= JANELA_COMBO_MS;

        jogador.comboAtual = dentroDoCombo ? jogador.comboAtual + 1 : 1;
        jogador.ultimoComerEm = agora;

        const pontosGanhos = jogador.comboAtual * (jogador.pontosDobradosAtivo ? 2 : 1);

        comida = gerarComida();
        jogador.pontuacao += pontosGanhos;
        jogador.elementoPontuacao.textContent = jogador.comboAtual > 1
           ? `${jogador.pontuacao} (x${jogador.comboAtual})`
           : jogador.pontuacao;
    
        atualizarRecordeSeNecessario(jogador.pontuacao);
        adicionarObstaculosSeNecessario();
        tocarSomComer();
    } 

    if (comeuComidaDourada) {
        const pontosGanhos = PONTOS_COMIDA_DOURADA * (jogador.pontosDobradosAtivo ? 2 : 1);

        jogador.pontuacao += pontosGanhos;
        jogador.elementoPontuacao.textContent = jogador.comboAtual > 1
           ? `${jogador.pontuacao} (x${jogador.comboAtual})`
           : jogador.pontuacao;

        atualizarRecordeSeNecessario(jogador.pontuacao);
        tocarSomComidaDourada();

        comidaDourada = null;
    }

    if (!comeuComida && !comeuComidaDourada) {
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
        }

        powerUp = null;
    }
}

function atualizarRecordeSeNecessario(pontuacaoAtual) {
    if (pontuacaoAtual > melhorPontuacao) {
        melhorPontuacao = pontuacaoAtual;
        elementoRecorde.textContent = melhorPontuacao;
        desenharListaRecordes();
        salvarNoArmazenamento("snakeMelhorPontuacao", melhorPontuacao);
    }
}

function desenharListaRecordes() {
    elementoListaRecordes.innerHTML = "";

    recordes.forEach((registro) => {
        const item = document.createElement("li");
        item.textContent = `${registro.nome}: ${registro.pontuacao}`;
        elementoListaRecordes.appendChild(item);
    });
}

function atualizarListaRecordes(novosRegistros) {
    recordes = recordes.concat(novosRegistros);
    recordes.sort((a, b) => b.pontuacao - a.pontuacao);
    recordes = recordes.slice(0, 5);

    salvarNoArmazenamento("snakeRecordes", JSON.stringify(recordes));
    desenharListaRecordes();
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
}

function ativarEncolher(jogador) {
    const tamanhoMinimo = 1;
    const quantidadeARemover = Math.min(QUANTIDADE_ENCOLHER, jogador.cobra.length - tamanhoMinimo);

    for (let i = 0; i < quantidadeARemover; i++) {
        jogador.cobra.pop();
    }
}

function colidiuJogador(jogador) {
    return verificarColisao(jogador, jogadores, obstaculos, COLUNAS, LINHAS);
}

//  ==========================================
// Direção (regra compartilhada entre teclado e toque)
//  ==========================================
function jogadorPodeIrPara(jogador, x, y) {
    let xFinal = x;
    let yFinal = y;

    if (inputModoSemParedes.checked) {
        xFinal = (x + COLUNAS) % COLUNAS;
        yFinal = (y + LINHAS) % LINHAS;
    } else if (x < 0 || x >= COLUNAS || y < 0 || y >= LINHAS) {
        return false;
    }

    const bateuEmObstaculo = obstaculos.some((o) => o.x === xFinal && o.y === yFinal);
    const bateuEmCobra = jogadores.some((outro) =>
        outro.cobra.some((segmento) => segmento.x === xFinal && segmento.y === yFinal)
    );

    return !bateuEmObstaculo && !bateuEmCobra;
}

function decidirDirecaoBot(jogador) {
    const direcoesPossiveis = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
    ];

    const cabeca = jogador.cobra[0];

    const opcoesSeguras = direcoesPossiveis.filter((direcao) => {
        const invertida = direcao.x === -jogador.direcao.x && direcao.y === -jogador.direcao.y;
        if (invertida) return false;

        return jogadorPodeIrPara(jogador, cabeca.x + direcao.x, cabeca.y + direcao.y);
    });

    const candidatas = opcoesSeguras.length > 0 ? opcoesSeguras : direcoesPossiveis;

    candidatas.sort((a, b) => {
        const distanciaA = Math.abs(cabeca.x + a.x - comida.x) + Math.abs(cabeca.y + a.y - comida.y);
        const distanciaB = Math.abs(cabeca.x + b.x - comida.x) + Math.abs(cabeca.y + b.y - comida.y);
        return distanciaA - distanciaB;
    });

    return candidatas[0];
}

function alternarPausa() {
    pausado = !pausado;

    if (pausado) {
        pausadoDesde = performance.now();
    } else {
        tempoPausadoTotal += performance.now() - pausadoDesde;
        pausadoDesde = null;
    }
    
    botaoPausa.textContent = pausado ? "Continuar" : "Pausar";
    tocarSom(pausado ? 300 : 500, 0.08, "sine");
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

document.addEventListener("keydown", mudarDirecao);
botaoJogarDeNovo.addEventListener("click", reiniciar);
botaoVoltarMenu.addEventListener("click", voltarAoMenu);

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

    for (const jogador of jogadores) {
        if (jogador.bot) {
            definirDirecaoJogador(jogador, decidirDirecaoBot(jogador));
        }

        atualizarEfeitos(jogador);

        if (jogador.comboAtual > 0 && agoraDoJogo() - jogador.ultimoComerEm > JANELA_COMBO_MS) {
            jogador.comboAtual = 0;
        }
        
        jogador.cobraAnterior = jogador.cobra.map((segmento) => ({ ...segmento }));
        aplicarProximaDirecao(jogador);
        moverJogador(jogador);
    }

    if (comidaDourada && agoraDoJogo() >= comidaDourada.expiraEm) {
        comidaDourada = null;
    }

    const jogadoresVivos = jogadores.filter((jogador) => !colidiuJogador(jogador));

    if (jogadoresVivos.length < jogadores.length) {
        jogoAtivo = false;
        pararMusicaFundo();
        tocarSomColisao();
        mostrarTelaGameOver(jogadoresVivos);
        return;
    }
    
    if (!powerUp && Math.random() < CHANCE_POWERUP_POR_TICK) {
        const posicao = gerarPosicaoLivre();
        powerUp = { x: posicao.x, y: posicao.y, tipo: gerarTipoPowerUp() };
    }

    if(!comidaDourada && Math.random() < CHANCE_COMIDA_DOURADA_POR_TICK) {
        gerarComidaDourada();
    }

    ultimoTickEm = performance.now();

    velocidadeAtual = Math.max(
        VELOCIDADE_MINIMA_MS,
        VELOCIDADE_INICIAL_MS - Math.max(...jogadores.map((j) => j.pontuacao)) * REDUCAO_VELOCIDADE_POR_PONTO
    );
    
    if (jogadores.some((jogador) => jogador.velocidadeExtraAtiva)) {
        velocidadeAtual *= MULTIPLICADOR_VELOCIDADE_EXTRA;
    }

    setTimeout(loop, velocidadeAtual);
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
    comida = gerarComida();
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
    QUANTIDADE_OBSTACULOS = configuracao.obstaculos;
}

function comecarJogo(quantidade, comBot = false) {
    obterContextoAudio();
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
