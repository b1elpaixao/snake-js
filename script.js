// ==========================================
// Configuração e elementos do DOM
// ==========================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const elementoRecorde = document.getElementById("highscore");
const elementoVelocidade = document.getElementById("velocidade");
const elementoRelogio = document.getElementById("relogioTempo");
const elementoFase = document.getElementById("indicadorFase");

// modo Fases
const PONTOS_POR_FASE = 10;
let faseAtual = 1;
let corDaCobraId = "azul"; // cor escolhida pro Jogador 1
let temaDoTabuleiroId = "grama"; // tema escolhido pro tabuleiro
let teclasDosJogadores = lerTeclasSalvas(); // [teclas do Jogador 1, teclas do Jogador 2]

// Desafio do dia
const PEDRAS_NO_DESAFIO = 10;
let desafioDoDia = null;      // { pedras, comidas } de hoje, quando o modo é "desafio"
let indiceComidaDesafio = 0;  // qual maçã da sequência do dia é a próxima

// modo Contra o Tempo
const DURACAO_MODO_TEMPO_MS = 120000; // 2 minutos
const PEDACOS_PERDIDOS_NA_BATIDA = 3;
const DURACAO_ATORDOADO_MS = 1000;    // depois de bater, a cobra fica 1 s parada
const barraVelocidade = document.getElementById("barraVelocidade");
const telaGameOver = document.getElementById("telaGameOver");
const elementoResultadoFinal = document.getElementById("resultadoFinal");
const elementoCausaMorte = document.getElementById("causaMorte");
const elementoPontuacaoFinal = document.getElementById("pontuacaoFinal");
const elementoAvisoRecorde = document.getElementById("avisoRecorde");
const botaoJogarDeNovo = document.getElementById("botaoJogarDeNovo");
const botaoVoltarMenu = document.getElementById("botaoVoltarMenu");
const placarJuntos = document.getElementById("placarJuntos");
const elementoPontosJuntos = document.getElementById("scoreJuntos");
const botaoCompartilhar = document.getElementById("botaoCompartilhar");
const elementoTextoCompartilhar = document.getElementById("textoCompartilhar");
const menuPausa = document.getElementById("menuPausa");
const botaoContinuar = document.getElementById("botaoContinuar");
const botaoReiniciarPausa = document.getElementById("botaoReiniciarPausa");
const botaoMenuPausa = document.getElementById("botaoMenuPausa");
const inputModoSemParedes = document.getElementById("modoSemParedes");
const botaoTelaCheia = document.getElementById("botaoTelaCheia");
const areaDoJogo = document.querySelector(".jogo");

const TAMANHO_CELULA = 20;
// o tamanho do tabuleiro muda no celular (em pé, casas maiores): veja aplicarTamanhoDoTabuleiro
let COLUNAS = 20;
let LINHAS = 20;
let LARGURA_TABULEIRO = COLUNAS * TAMANHO_CELULA; // tamanho usado nos desenhos (20 x 20 casas = 400)
let ALTURA_TABULEIRO = LINHAS * TAMANHO_CELULA;

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
const DURACAO_ESCUDO_MS = 10000;          // se não bater em 10 s, o escudo some
const DURACAO_PORTAL_MS = 10000;
const DURACAO_CAMERA_LENTA_MS = 5000;
const FATOR_CAMERA_LENTA = 1.6;           // cada passo demora 60% a mais
const DURACAO_SUSTO_ESCUDO_MS = 500;      // depois que o escudo segura a batida, fica meio segundo parada
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
    escudo: "#4ade80",
    portal: "#a5b4fc",
    cameraLenta: "#cbd5e1",
};
// símbolo de cada power-up (pra não depender só da cor - ajuda quem é daltônico)
// caminhos no formato SVG, numa caixa de 24x24; "cheio" = pintado por dentro, senão só o contorno
const SIMBOLOS_POWERUP = {
    invencibilidade: { caminho: "M12 2 L20 5.5 V11 C20 16 16.5 19.8 12 22 C7.5 19.8 4 16 4 11 V5.5 Z", cheio: true }, // escudo
    velocidade: { caminho: "M14 1 L5 14 H11 L10 23 L19 10 H13 Z", cheio: true }, // raio
    pontosDobrados: { caminho: "M2 7 L9 17 M9 7 L2 17 M13 9.5 C13 5.5 21 5.5 21 9.5 C21 13 13 14 13 18 H21", cheio: false }, // x2
    ima: { caminho: "M6 3 V12 A6 6 0 0 0 18 12 V3 M3 7.5 H9 M15 7.5 H21", cheio: false }, // imã em U
    encolher: { caminho: "M1 12 H9 M5.5 8 L9.5 12 L5.5 16 M23 12 H15 M18.5 8 L14.5 12 L18.5 16", cheio: false }, // setas pra dentro
    escudo: { caminho: "M12 2.5 A9.5 9.5 0 1 1 11.99 2.5 M7.5 11 A4.5 4.5 0 0 1 12 6.5", cheio: false }, // bolha
    portal: { caminho: "M6 22 V10 A6 6 0 0 1 18 10 V22 M2 22 H22", cheio: false }, // arco
    cameraLenta: { caminho: "M5 2 H19 L12 12 L19 22 H5 L12 12 Z", cheio: false }, // ampulheta
};
const COR_SIMBOLO_POWERUP = "#1f2937";
const EFEITOS_COM_DURACAO = [
    { ativo: "invencivel", ate: "invencivelAte", duracao: DURACAO_INVENCIBILIDADE_MS },
    { ativo: "velocidadeExtraAtiva", ate: "velocidadeExtraAte", duracao: DURACAO_VELOCIDADE_EXTRA_MS },
    { ativo: "pontosDobradosAtivo", ate: "pontosDobradosAte", duracao: DURACAO_PONTOS_DOBRADOS_MS },
    { ativo: "imaAtivo", ate: "imaAte", duracao: DURACAO_IMA_MS },
    { ativo: "escudoAtivo", ate: "escudoAte", duracao: DURACAO_ESCUDO_MS },
    { ativo: "portalAtivo", ate: "portalAte", duracao: DURACAO_PORTAL_MS },
    { ativo: "cameraLentaAtiva", ate: "cameraLentaAte", duracao: DURACAO_CAMERA_LENTA_MS },
];
const TEMPO_AVISO_FIM_EFEITO_MS = 1500;
const containersEfeitos = [
    document.getElementById("efeitosJogador1"),
    document.getElementById("efeitosJogador2"),
];

const telaInicial = document.getElementById("telaInicial");
const telaComoJogar = document.getElementById("telaComoJogar");
const botaoComoJogar = document.getElementById("botaoComoJogar");
const botaoFecharComoJogar = document.getElementById("botaoFecharComoJogar");
const seletorDificuldade = document.getElementById("seletorDificuldade");
const seletorModo = document.getElementById("seletorModo");
const seletorNivelBot = document.getElementById("seletorNivelBot");

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
const botaoMusica = document.getElementById("botaoMusica");
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
        inicio: { x: config.x, y: config.y }, // no 2 Juntos, quem bate volta pra cá
        direcaoInicial: { ...config.direcaoInicial },
        filaDirecoes: [],
        pontuacao: 0,
        comboAtual: 0,
        ultimoComerEm: null,
        nome: config.nome,
        bot: false,
        invencivel: false,
        velocidadeExtraAtiva: false,
        atordoadoAte: 0,
        ultimoPassoEm: 0,
        duracaoPasso: VELOCIDADE_INICIAL_MS,
        pontosDobradosAtivo: false,
        imaAtivo: false,
        invencivelAte: 0,
        velocidadeExtraAte: 0,
        pontosDobradosAte: 0,
        imaAte: 0,
        escudoAtivo: false,
        escudoAte: 0,
        portalAtivo: false,
        portalAte: 0,
        cameraLentaAtiva: false,
        cameraLentaAte: 0,
        teclas: config.teclas,
        corCabeca: config.corCabeca,
        corCorpo: config.corCorpo,
        elementoPontuacao: config.elementoPontuacao,
    };
}

function criarJogadores(quantidade = 2, nomes = ["Jogador 1", "Jogador 2"]) {
    const todosOsJogadores = [
        criarJogador({
            x: Math.round(COLUNAS * 0.3),
            y: Math.round(LINHAS / 2),
            direcaoInicial: { x: 1, y: 0 },
            teclas: teclasDosJogadores[0],
            corCabeca: corDaCobra().cabeca,
            corCorpo: corDaCobra().corpo,
            nome: nomes[0],
            elementoPontuacao: document.getElementById("score1"),
        }),
        criarJogador({
            x: COLUNAS - Math.round(COLUNAS * 0.3),
            y: Math.floor(LINHAS / 2),
            direcaoInicial: { x: -1, y: 0 },
            teclas: teclasDosJogadores[1],
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
// animação de morte: a cobra que bateu pisca e o tabuleiro treme antes da tela de fim
const DURACAO_ANIMACAO_MORTE_MS = 900;
let animacaoMorte = null; // { inicio, batidos } enquanto está animando, ou null
let temporizadorAnimacaoMorte =  null;
const movimentoReduzidoNoSistema = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let reduzirMovimento = movimentoReduzidoNoSistema; // também liga pela opção "Menos movimento"
let textosFlutuantes = []; // os "=3" que sobem ao comer
const DURACAO_TEXTO_FLUTUANTE_MS = 800;
const MODOS_DE_JOGO = ["normal", "clássico", "rato", "tempo", "fases", "desafio"];
const NOMES_MODOS = { normal: "Normal", "clássico": "Clássico", rato: "Rato", tempo: "Contra o tempo", fases: "Fases", desafio: "Desafio de hoje", personalizada: "Fase criada" };

let jogoAtivo = false; // só fica true quando a partida começa ( o loopRenderizacao anda o jogo sempre que for true)
let pausado = false;
let noMenu = true;
let quantidadeJogadoresAtual = 2;
let modoComBotAtivo = false;
let modoCooperativo = false; // 2 Juntos: somam pontos e não batem um no outro
let modoAtual = "normal";
let semParedesNaPartida = false; // o "Sem paredes" que vale na partida atual (fica fixo até ela acabar)
let recordesPorModo = lerRecordesSalvos();
let modoExibidoRecordes = "normal";
let melhorPontuacao = 0;
let ultimoTickEm = performance.now();
let velocidadeAtual = VELOCIDADE_INICIAL_MS;
let temporizadorDestaqueVelocidade = null;
let estatisticas = lerEstatisticas();
let conquistasGanhas = lerConquistas();
let carteira = lerCarteira(); // { moedas, comprados, equipados } (loja.js)
let partidaAtual = { powerUps: 0, comidas: 0, douradas: 0, maiorCombo: 0 }; // contadores só desta partida (pras conquistas e missões)
let temporizadorAvisoConquista = null;
let tempoDaPartidaMs = 0;
let velocidadeMostrada = null;  
let nomesJogadoresAtuais = ["Jogador 1", "Jogador 2"];
let mudo = lerDoArmazenamento("snakeMudo") === "true"; // "mudo" agora vale só para os efeitos que já tinha desligado o som antes continua sem música
const musicaSalva = lerDoArmazenamento("snakeMusicaDesligada");
let musicaDesligada = musicaSalva === null ? mudo : musicaSalva === "true";
let tempoPausadoTotal= 0;
let pausadoDesde = null;

const DURACAO_PASSO_CONTAGEM_MS = 700;
let contagemAtiva = false;
let temporizadorLoop = null; // guardado pra poder parar o loop ao reiniciar/sair pela pausa
let proximoLoopEm = 0; // no relógio do jogo: quando é o próximo meio passo (o loopRenderizacao confere a cada quadro)
let textoContagem = "";
let inicioPassoContagem = 0;
let temporizadorContagem = null;

// relógio que não anda enquanto o jogo está pausado
function agoraDoJogo() {
    const pausaAtual = pausadoDesde !== null ? performance.now()- pausadoDesde : 0;
    return performance.now() - tempoPausadoTotal- pausaAtual;
}

// ==========================================
// Tela Cheia
// ==========================================
function alternarTelaCheia() {
    if (!document.fullscreenEnabled) return;

    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        areaDoJogo.requestFullscreen().catch(() => {}); // o navegador pode recusar; aí só não muda nada
    }
}

function atualizarBotaoTelaCheia() {
    const cheia = Boolean(document.fullscreenElement);
    const texto = cheia ? "Sair da tela cheia (F)" : "Tela cheia (F)";

    botaoTelaCheia.setAttribute("aria-pressed", String(cheia));
    botaoTelaCheia.setAttribute("aria-label", texto);
    botaoTelaCheia.title = texto;
    ajustarResolucaoCanvas(); // o tabuleiro mudou de tamanho: redesenha nítido
}

botaoTelaCheia.hidden = !document.fullscreenEnabled; // iPhone não deixa: o botão some
botaoTelaCheia.addEventListener("click", () => {
    alternarTelaCheia();
    botaoTelaCheia.blur(); // senão o Espaço da pausa "clicaria" o botão de novo
});
document.addEventListener("fullscreenchange", atualizarBotaoTelaCheia);

document.addEventListener("keydown", (evento) => {
    if (evento.key.toLowerCase() !== "f" || evento.ctrlKey || evento.metaKey || evento.altKey) return;
    if (["INPUT", "SELECT", "TEXTAREA"].includes(evento.target.tagName)) return; // digitando o nome
    alternarTelaCheia();
});

// ==========================================
// Estatisticas (só de quem joga de verdade, não do bot)
// ==========================================
const NOMES_MORTES = { parede: "Parede", proprioCorpo: "Próprio corpo", pedra: "Pedra", outroJogador: "Outra cobra" };

function mostrarEstatisticas() {
    const morte = morteMaisComum(estatisticas.mortes);

    document.getElementById("estatPartidas").textContent = estatisticas.partidas;
    document.getElementById("estatTempo").textContent = formatarTempo(estatisticas.tempoTotalMs);
    document.getElementById("estatComidas").textContent = estatisticas.comidas;
    document.getElementById("estatDouradas").textContent = estatisticas.macasDouradas;
    document.getElementById("estatPowerUps").textContent = estatisticas.powerUps;
    document.getElementById("estatCombo").textContent = estatisticas.maiorCombo > 1 ? `x${estatisticas.maiorCombo}` : "-";
    document.getElementById("estatTamanho").textContent = estatisticas.maiorTamanho
    document.getElementById("estatMorte").textContent = morte ? `${NOMES_MORTES[morte]} (${estatisticas.mortes[morte]}x)` : "-";
}

function registrarFimDePartida(batidas) {
    const humanos = jogadores.filter((jogador) => !jogador.bot);
    
    estatisticas.partidas++;
    estatisticas.tempoTotalMs += tempoDaPartidaMs;
    estatisticas.maiorTamanho = Math.max(estatisticas.maiorTamanho, ...humanos.map((jogador) => jogador.cobra.length));

    for (const { jogador, motivo } of batidas) {
        if (!jogador.bot) {
            estatisticas.mortes[motivo]++;
        }
    }

    salvarEstatisticas();
    mostrarEstatisticas();
    registrarNoHistorico();

    const bot = jogadores.find((jogador) => jogador.bot);
    const humano = humanos[0];
    const venceuOBot = Boolean(bot && humano) && (modoAtual === "tempo"
        ? humano.pontuacao > bot.pontuacao
        : batidas.some((batida) => batida.jogador === bot) && !batidas.some((batida) => batida.jogador === humano));

    verificarConquistas({ venceuBotDificil: venceuOBot && seletorNivelBot.value === "dificil"});
    registrarMissoesDaPartida(); // depois das conquistas: o aviso da missão espera o da conquista sair
    darMoedasDaPartida();
}

document.getElementById("botaoZerarEstatisticas").addEventListener("click", () => {
    if (confirm("Apagar todas as estatísticas e o histórico? Isso não dá pra desfazer.")) {
        estatisticas = estatisticasVazias();
        salvarEstatisticas();
        mostrarEstatisticas();
        salvarNoArmazenamento("snakeHistorico", "[]");
        mostrarHistorico();
    }
});

mostrarEstatisticas();

// ========================================== 
// Conquistas
// ========================================== 
// junta o que as conquistas precisam saber: estatísticas de sempre + a partida de agora
function contextoDasConquistas(extra = {}) {
    const humanos = jogadores.filter((jogador) => !jogador.bot);

    return {
        estatisticas,
        missoesSeguidas: sequenciaValendo(lerSequenciaDeMissoes(), dataDeHoje()),
        partida: {
            pontos: Math.max(0, ...humanos.map((jogador) => jogador.pontuacao)),
            tamanho: Math.max(0, ...humanos.map((jogador) => jogador.cobra.length)),
            powerUps: partidaAtual.powerUps,
            modo: modoAtual,
            fase: faseAtual,
            venceuBotDificil: false,
            ...extra,
        },
    };
}

function verificarConquistas(extra) {
    const novas = conquistasNovas(conquistasGanhas, contextoDasConquistas(extra));

    if (novas.length === 0) return;

    conquistasGanhas = conquistasGanhas.concat(novas.map((conquista) => conquista.id));
    salvarNoArmazenamento("snakeConquistas", JSON.stringify(conquistasGanhas));
    mostrarConquistas();
    mostrarCoresDaCobra();
    mostrarTemasDoTabuleiro();
    avisarConquistas(novas);
}

function mostrarConquistas() {
    const lista = document.getElementById("listaConquistas");
    lista.innerHTML = "";

    for (const conquista of CONQUISTAS) {
        const ganhou = conquistasGanhas.includes(conquista.id);
        const item = document.createElement("li");
        const textos = document.createElement("div");
        const nome = document.createElement("b");
        const descricao = document.createElement("span");

        item.className = ganhou ? "ganhou" : "bloqueada";
        nome.textContent = conquista.nome;
        const premio = premioDaConquista(conquista.id);
        descricao.textContent = premio ? `${conquista.descricao} · Prêmio: ${premio}` : conquista.descricao;
        textos.append(nome, descricao);
        item.append(textos);
        lista.append(item);
    }

    document.getElementById("contadorConquistas").textContent = `${conquistasGanhas.length}/${CONQUISTAS.length}`;
}

function avisarConquistas(novas) {
    const aviso = document.getElementById("avisoConquista");

    aviso.textContent = `Conquista: ${novas.map((conquista) => conquista.nome).join(" · ")}`;
    // esconde e mostra de novo pra animação recomeçar
    aviso.hidden = true;
    void aviso.offsetWidth;
    aviso.hidden = false;

    tocarSom(880, 0.1, "triangle");
    setTimeout(() => tocarSom(1320, 0.15, "triangle"), 110);

    clearTimeout(temporizadorAvisoConquista);
    temporizadorAvisoConquista = setTimeout(() => {
        aviso.hidden = true;
    }, 2800);
}

mostrarConquistas();

// ==========================================
// Teclas configuráveis
// ==========================================
let teclaSendoTrocada = null; // { jogador, direcao } enquanto espera a pessoa apertar a nova tecla

function mostrarTeclas() {
    for (const caixa of document.querySelectorAll(".teclas[data-jogador]")) {
        const jogador = Number(caixa.dataset.jogador);
        caixa.innerHTML = "";

        for (const direcao of DIRECOES_DAS_TECLAS) {
            const esperando = teclaSendoTrocada !== null && teclaSendoTrocada.jogador === jogador && teclaSendoTrocada.direcao === direcao;
            const nome = nomeDaTecla(teclasDosJogadores[jogador][direcao]);
            const botao = document.createElement("button");

            botao.type = "button";
            botao.className = esperando ? "tecla-botao esperando" : "tecla-botao";
            botao.textContent = esperando ? ".." : nome;
            botao.setAttribute("aria-label", `Jogador ${jogador + 1}, ${direcao}: ${esperando ? "aperte a nova tecla" : nome + ". Clique para trocar"}`);
            botao.addEventListener("click", () => comecarTrocaDeTecla(jogador, direcao));
            caixa.append(botao);
        }
    }

    document.getElementById("resumoTeclas1").textContent =
resumoDasTeclas(teclasDosJogadores[0]);
    document.getElementById("resumoTeclas2").textContent =
resumoDasTeclas(teclasDosJogadores[1]);
    document.getElementById("dicaTeclas").textContent = teclaSendoTrocada ? "Aperte a nova tecla · Esc cancela" : "Clique numa tecla pra trocar";
}

function comecarTrocaDeTecla(jogador, direcao) {
    const mesmaTecla = teclaSendoTrocada !== null && teclaSendoTrocada.jogador === jogador && teclaSendoTrocada.direcao === direcao;

    teclaSendoTrocada = mesmaTecla ? null : { jogador, direcao }; // clicar de novo cancela
    mostrarTeclas();
}

// roda antes de todos os outros "keydown": enquanto espera a tecla nova, o jogo não recebe nada
function capturarTecla(evento) {
    if (teclaSendoTrocada === null) return;

    evento.preventDefault();
    evento.stopImmediatePropagation();

    const tecla = evento.key.toLowerCase();
    const { jogador, direcao } = teclaSendoTrocada;
    teclaSendoTrocada = null;

    if (teclaPodeSerUsada(tecla)) { // Esc (ou Espaço, Enter...) só cancela
        guardarTeclas(trocarTecla(teclasDosJogadores, jogador, direcao, tecla));
    }
    mostrarTeclas();
}

window.addEventListener("keydown", capturarTecla, true);

document.getElementById("botaoTeclasPadrao").addEventListener("click", () => {
    teclaSendoTrocada = null;
    guardarTeclas(copiarTeclasPadrao());
    mostrarTeclas();
});

// ==========================================
// Cor da cobra
// ==========================================
function corDaCobra() {
    return CORES_DA_COBRA.find((cor) => cor.id === corDaCobraId) || CORES_DA_COBRA[0];
}

// pinta a cobra do Jogador 1 e as bolinhas azuis do placar/menu com a cor escolhida
function aplicarCorDaCobra() {
    const cor = corDaCobra();
    document.documentElement.style.setProperty("--jogador1", cor.cabeca);

    if (jogadores[0] && !jogadores[0].bot) {
        jogadores[0].corCabeca = cor.cabeca;
        jogadores[0].corCorpo = cor.corpo;
    }
}

function mostrarCoresDaCobra() {
    const caixa = document.getElementById("coresDaCobra");
    caixa.innerHTML = "";

    for (const cor of CORES_DA_COBRA) {
        const liberada = corEstaLiberada(cor, conquistasGanhas);
        const conquista = CONQUISTAS.find((item) => item.id === cor.conquista);
        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "amostra-cor";
        botao.style.setProperty("--cor-cabeca", cor.cabeca);
        botao.style.setProperty("--cor-corpo", cor.corpo);
        botao.disabled = !liberada;
        botao.setAttribute("aria-pressed", String(cor.id === corDaCobraId));
        botao.title = liberada ? cor.nome : `${cor.nome}: ganhe a conquista "${conquista.nome}"`;
        botao.setAttribute("aria-label", botao.title);
        botao.addEventListener("click", () => escolherCorDaCobra(cor.id));
        caixa.append(botao);
    }

    document.getElementById("nomeCorDaCobra").textContent = `${corDaCobra().nome} · as apagadas liberam com conquistas`;
}

function escolherCorDaCobra(id) {
    const cor = CORES_DA_COBRA.find((opcao) => opcao.id === id);

    if (!cor || !corEstaLiberada(cor, conquistasGanhas)) return; // bloqueada: não muda nada

    corDaCobraId = cor.id;
    aplicarCorDaCobra();
    mostrarCoresDaCobra();
    salvarPreferencias();
}

// ==========================================
// Tema do tabuleiro
// ==========================================
function temaDoTabuleiro() {
    if (opcoesDeAcessibilidade.altoContraste) return TEMA_ALTO_CONTRASTE; // a opção de acessibilidade ganha do tema
    const daLoja = tabuleiroDaLoja();
    if (daLoja) return daLoja; // tabuleiro comprado na loja
    return TEMAS_DO_TABULEIRO.find((tema) => tema.id === temaDoTabuleiroId) || TEMAS_DO_TABULEIRO[0];
}

function mostrarTemasDoTabuleiro() {
    const caixa = document.getElementById("temasDoTabuleiro");
    caixa.innerHTML = "";

    for (const tema of TEMAS_DO_TABULEIRO) {
        const liberado = corEstaLiberada(tema, conquistasGanhas);
        const conquista = CONQUISTAS.find((item) => item.id === tema.conquista);
        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "amostra-cor amostra-tema";
        botao.style.setProperty("--cor-cabeca", tema.claro);
        botao.style.setProperty("--cor-corpo", tema.escuro);
        botao.disabled = !liberado;
        botao.setAttribute("aria-pressed", String(tema.id === temaDoTabuleiroId && !carteira.equipados.tabuleiro));
        botao.title = liberado ? tema.nome : `${tema.nome}: ganhe a conquista "${conquista.nome}"`;
        botao.setAttribute("aria-label", botao.title);
        botao.addEventListener("click", () => escolherTemaDoTabuleiro(tema.id));
        caixa.append(botao);
    }

    document.getElementById("nomeTemaDoTabuleiro").textContent = `${temaDoTabuleiro().nome} · os apagados liberam com conquistas`;
}

function escolherTemaDoTabuleiro(id) {
    const tema = TEMAS_DO_TABULEIRO.find((opcao) => opcao.id === id);

    if (!tema || !corEstaLiberada(tema, conquistasGanhas)) return; // bloqueado: não muda nada

    temaDoTabuleiroId = tema.id;
    if (carteira.equipados.tabuleiro) {
        carteira = { ...carteira, equipados: { ...carteira.equipados, tabuleiro: null } }; // escolheu um tema: tira o tabuleiro da loja
        salvarCarteira();
    }
    mostrarTemasDoTabuleiro();
    salvarPreferencias();
}

aplicarPreferenciasSalvas(); // antes de mostrar os recordes, pra já abrir no modo salvo
inputModoSemParedes.addEventListener("change", salvarPreferencias);

aplicarCorDaCobra();
mostrarCoresDaCobra();
mostrarTemasDoTabuleiro();
mostrarSimbolosNaLegenda();
mostrarTeclas();
mostrarRecordesDoModo(seletorModo.value);

atualizarBotaoMudo();
atualizarBotaoMusica();

seletorModo.addEventListener("change", () => mostrarRecordesDoModo(seletorModo.value));

botaoMudo.addEventListener("click", () => {
    mudo = !mudo;
    salvarNoArmazenamento("snakeMudo", mudo);
    atualizarBotaoMudo();
});

botaoMusica.addEventListener("click", () => {
    musicaDesligada = !musicaDesligada;
    salvarNoArmazenamento("snakeMusicaDesligada", musicaDesligada);
    atualizarBotaoMusica();
});

function alternarPausa() {
    if (pausado) {
        menuPausa.hidden = true;
        iniciarContagem(sairDaPausa);  // o loop continua esperando; só despausava no "Vai!"
    } else {
        entrarNaPausa();
    }
}

function entrarNaPausa() {
    anunciar("Jogo pausado");
    pausado = true;
    pausadoDesde = performance.now();
    botaoPausa.textContent = "Continuar";
    tocarSom(300, 0.08, "sine");
    mostrarMenuPausa();
}

function mostrarMenuPausa() {
    menuPausa.hidden = false;
    botaoContinuar.focus();
}

// os botões do menu só valem com o jogo parado ( e não no meio do 3, 2, 1)
function menuPausaDisponivel() {
    return jogoAtivo && pausado && !contagemAtiva && !menuPausa.hidden;
}

function reiniciarPelaPausa() {
    if (!menuPausaDisponivel()) return;
    reiniciar();
}

// abandona a partida: não conta recorde, estatísticas nem conquista
function sairPelaPausa() {
    if (!menuPausaDisponivel()) return;

    clearTimeout(temporizadorLoop);
    cancelarContagem();
    jogoAtivo = false;
    pausado = false;
    pausadoDesde = null;
    menuPausa.hidden = true;
    botaoPausa.textContent = "Pausar";
    travarSemParedes(false);
    pararMusicaFundo();
    voltarAoMenu();
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
    if (noMenu || animacaoMorte) return;
    if (!jogoAtivo) {
        if (evento.key === "Escape") {
            voltarAoMenu();
            return;
        }
        // Enter/Espaço num botão já disparam o clique dele; evita reiniciar duas vezes
        if (evento.target.tagName === "BUTTON" && (evento.key === "Enter" || evento.key === " ")) return;
        if (evento.key.toLowerCase() === "f") return; // F é só a tela cheia

        reiniciar();
        return;
    }

    const tecla = evento.key.toLowerCase();

    if (tecla === " " || tecla === "escape") {
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

document.getElementById("botaoPausaToque").addEventListener("click", (evento) => {
    evento.currentTarget.blur();
    if (noMenu || !jogoAtivo || contagemAtiva || pausado) return;
    alternarPausa();
});

// pausa sozinho se o jogador sair da aba/janela (e não despausa sozinho ao voltar)
function pausarAutomaticamente() {
    if (noMenu || !jogoAtivo) return;

    if (pausado) {
        // saiu da aba no meio da contagem de volta: cancela e continua pausado
        if (contagemAtiva) {
            cancelarContagem();
            mostrarMenuPausa();
        }
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

// ==========================================
// Controle de videogame (a leitura dos botões fica no controle.js)
// ==========================================
function mostrarControlesConectados() {
    const quantidade = controlesConectados().length;
    const aviso = document.getElementById("avisoControle");

    aviso.hidden = quantidade === 0;
    aviso.textContent = quantidade >= 2
        ? "🎮 2 controles: o 1º é o Jogador 1, o 2º é o Jogador 2. A começa, Start pausa."
        : "🎮 Controle conectado: setas ou analógico movem, A começa, Start pausa.";
}

window.addEventListener("gamepadconnected", mostrarControlesConectados);
window.addEventListener("gamepaddisconnected", () => {
    estadoAnteriorDosControles = [];
    mostrarControlesConectados();
});
botaoJogarDeNovo.addEventListener("click", reiniciar);
botaoVoltarMenu.addEventListener("click", voltarAoMenu);

// ==========================================
// Compartilhar resultado
// ==========================================
function linkDoJogo() {
    // aberto direto do computador (file://) não tem link: usa o do site publicado
    return location.protocol.startsWith("http") ? location.origin + location.pathname : "https://b1elpaixao.github.io/snake-js/";
}

function avisarNoBotao(texto) {
    botaoCompartilhar.textContent = texto;
    setTimeout(() => { botaoCompartilhar.textContent = "Compartilhar resultado"; }, 2000);
}

async function compartilharResultado() {
    const placar = jogadores.map((jogador) => ({ nome: jogador.nome, pontuacao: jogador.pontuacao }));
    const link = modoAtual === "personalizada" ? linkDaFaseCriada() : linkDoJogo();
    const texto = textoDeCompartilhar(modoAtual, dataDeHoje(), placar, link, modoCooperativo);
    const ehCelular = window.matchMedia("(pointer: coarse)").matches;

    try {
        if (ehCelular && navigator.share) {
            await navigator.share({ text: texto }); // abre o menu do celular (WhatsApp, Instagram...)
            return;
        }
        await navigator.clipboard.writeText(texto);
        avisarNoBotao("✓ Copiado! Cole no WhatsApp");
    } catch (erro) {
        if (erro.name === "AbortError") return; // fechou o menu de compartilhar sem escolher
        // não deu pra copiar sozinho: mostra o texto pra pessoa copiar na mão
        elementoTextoCompartilhar.textContent = texto;
        elementoTextoCompartilhar.hidden = false;
    }
}

botaoCompartilhar.addEventListener("click", compartilharResultado);
botaoContinuar.addEventListener("click", () => {
    if (menuPausaDisponivel()) alternarPausa();
});
botaoReiniciarPausa.addEventListener("click", reiniciarPelaPausa);
botaoMenuPausa.addEventListener("click", sairPelaPausa);

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

// ==========================================
// Histórico (o gráfico fica no historico.js)
// ==========================================
const filtroHistorico = document.getElementById("filtroHistorico");

for (const [modo, nome] of Object.entries(NOMES_MODOS)) {
    const opcao = document.createElement("option");
    opcao.value = modo;
    opcao.textContent = nome;
    filtroHistorico.appendChild(opcao);
}

filtroHistorico.addEventListener("change", mostrarHistorico);
mostrarHistorico();

// ==========================================
// Missões diárias (ficam no missoes.js)
// ==========================================
mostrarMissoes();
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) mostrarMissoes(); // virou o dia com o jogo aberto: mostra as missões novas
});

// ==========================================
// Loja (fica no loja.js)
// ==========================================
mostrarSaldo();
document.getElementById("botaoLoja").addEventListener("click", abrirLoja);
document.getElementById("botaoAbrirLoja").addEventListener("click", abrirLoja);
document.getElementById("botaoFecharLoja").addEventListener("click", fecharLoja);

for (const aba of document.querySelectorAll(".aba-loja")) {
    aba.addEventListener("click", () => {
        abaDaLoja = aba.dataset.aba;
        mostrarLoja();
    });
}

// com a loja aberta, as teclas não mexem no jogo (no fim de jogo, qualquer tecla recomeçaria)
window.addEventListener("keydown", (evento) => {
    if (document.getElementById("telaLoja").hidden) return;
    evento.stopPropagation();
    if (evento.key === "Escape") fecharLoja();
}, true);

// ==========================================
// Acessibilidade (as funções ficam no acessibilidade.js)
// ==========================================
try {
    opcoesDeAcessibilidade =
limparAcessibilidade(JSON.parse(lerDoArmazenamento("snakeAcessibilidade")));
} catch {
    // dado corrompido: fica tudo desligado
}
aplicarAcessibilidade();

document.getElementById("opcaoAltoContraste").addEventListener("change", (evento) => {
    opcoesDeAcessibilidade.altoContraste = evento.target.checked;
    salvarAcessibilidade();
    aplicarAcessibilidade();
});

document.getElementById("opcaoMenosMovimento").addEventListener("change", (evento) => {
    opcoesDeAcessibilidade.menosMovimento = evento.target.checked;
    salvarAcessibilidade();
    aplicarAcessibilidade();
});

// ==========================================
// Tutorial (as dicas ficam no tutorial.js)
// ==========================================
document.getElementById("botaoPularTutorial").addEventListener("click", (evento) => {
    evento.currentTarget.blur(); // senão o Espaço apertaria o botão de novo em vez de pausar
    terminarTutorial();
});

document.getElementById("botaoRefazerTutorial").addEventListener("click", (evento) => {
    salvarNoArmazenamento("snakeTutorialVisto", "");
    evento.currentTarget.textContent = "✓ O tutorial aparece na próxima partida";
});
botaoFecharComoJogar.addEventListener("click", fecharComoJogar);

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !telaComoJogar.hidden) {
        fecharComoJogar();
    }
});

// ==========================================
// Editor de fases: desenha paredes num 20x20 e manda o link pros amigos
// ==========================================
const barraEditor = document.getElementById("barraEditor");
const botaoCopiarFase = document.getElementById("botaoCopiarFase");
let paredesDaFaseCriada = decodificarFase(lerDoArmazenamento("snakeFasePersonalizada")) || [];
let editandoFase = false;
let pintandoParede = null; // enquanto aperta: true = pondo paredes, false = tirando
let ultimaCasaPintada = null;

function abrirEditorDeFase() {
    editandoFase = true;
    modoAtual = "personalizada"; // tabuleiro 20x20 também no celular
    telaInicial.hidden = true;
    barraEditor.hidden = false;
    aplicarTamanhoDoTabuleiro();
}

function fecharEditorDeFase() {
    editandoFase = false;
    pintandoParede = null;
    barraEditor.hidden = true;
}

function salvarFaseCriada() {
    salvarNoArmazenamento("snakeFasePersonalizada", codificarFase(paredesDaFaseCriada));
}

function linkDaFaseCriada() {
    return `${linkDoJogo()}#fase=${codificarFase(paredesDaFaseCriada)}`;
}

function casaDoPonteiro(evento) {
    const retangulo = canvas.getBoundingClientRect();

    return {
        x: Math.floor(((evento.clientX - retangulo.left) / retangulo.width) * COLUNAS),
        y: Math.floor(((evento.clientY - retangulo.top) / retangulo.height) * LINHAS),
    };
}

function pintarCasa(casa) {
    if (casa.x < 0 || casa.y < 0 || casa.x >= COLUNAS || casa.y >= LINHAS || casaReservadaNaFase(casa)) return;

    const indice = paredesDaFaseCriada.findIndex((parede) => mesmaPosicao(parede, casa));

    if (pintandoParede && indice === -1) {
        paredesDaFaseCriada.push(casa);
    } else if (!pintandoParede && indice !== -1) {
        paredesDaFaseCriada.splice(indice, 1);
    }
}

// apertou numa casa vazia: arrastando põe paredes; apertou numa parede: arrastando tira
canvas.addEventListener("pointerdown", (evento) => {
    if (!editandoFase) return;

    const casa = casaDoPonteiro(evento);
    pintandoParede = !paredesDaFaseCriada.some((parede) => mesmaPosicao(parede, casa));
    canvas.setPointerCapture(evento.pointerId);
    pintarCasa(casa);
    ultimaCasaPintada = casa;
});

// arrastando rápido o mouse pula casas: pinta todas do caminho entre a última e a de agora
canvas.addEventListener("pointermove", (evento) => {
    if (!editandoFase || pintandoParede === null) return;

    const casa = casaDoPonteiro(evento);
    const passos = Math.max(Math.abs(casa.x - ultimaCasaPintada.x), Math.abs(casa.y - ultimaCasaPintada.y));

    for (let passo = 1; passo <= passos; passo++) {
        pintarCasa({
            x: Math.round(ultimaCasaPintada.x + ((casa.x - ultimaCasaPintada.x) * passo) / passos),
            y: Math.round(ultimaCasaPintada.y + ((casa.y - ultimaCasaPintada.y) * passo) / passos),
        });
    }
    ultimaCasaPintada = casa;
});

function pararDePintar() {
    if (pintandoParede === null) return;
    pintandoParede = null;
    salvarFaseCriada();
}
canvas.addEventListener("pointerup", pararDePintar);
canvas.addEventListener("pointercancel", pararDePintar);

async function copiarLinkDaFase() {
    const link = linkDaFaseCriada();
    const ehCelular = window.matchMedia("(pointer: coarse)").matches;

    try {
        if (ehCelular && navigator.share) {
            await navigator.share({ text: "Fiz uma fase no Snake. Tenta passar:", url: link });
            return;
        }
        await navigator.clipboard.writeText(link);
        botaoCopiarFase.textContent = "✓ Link copiado!";
        setTimeout(() => { botaoCopiarFase.textContent = "Copiar link"; }, 2000);
    } catch (erro) {
        if (erro.name === "AbortError") return;
        window.prompt("Copie o link da fase:", link); // não deu pra copiar sozinho
    }
}

document.getElementById("botaoCriarFase").addEventListener("click", abrirEditorDeFase);
botaoCopiarFase.addEventListener("click", copiarLinkDaFase);
document.getElementById("botaoJogarFase").addEventListener("click", () => {
    fecharEditorDeFase();
    comecarJogo(1, false, false, "personalizada");
});
document.getElementById("botaoLimparFase").addEventListener("click", () => {
    if (paredesDaFaseCriada.length > 0 && !confirm("Apagar todas as paredes?")) return;
    paredesDaFaseCriada = [];
    salvarFaseCriada();
});
document.getElementById("botaoSairEditor").addEventListener("click", () => {
    fecharEditorDeFase();
    telaInicial.hidden = false;
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

let deslizouNesteToque = false;

canvas.addEventListener("touchstart", (evento) => {
    const toque = evento.touches[0];
    toqueInicioX = toque.clientX;
    toqueInicioY = toque.clientY;
    deslizouNesteToque = false;
});

// vira assim que o dedo anda um pouco (sem esperar soltar), e dá pra emendar outra virada sem tirar o dedo
canvas.addEventListener("touchmove", (evento) => {
    evento.preventDefault();
    if (noMenu || animacaoMorte || !jogoAtivo || pausado) return;

    const toque = evento.touches[0];
    const deltaX = toque.clientX - toqueInicioX;
    const deltaY = toque.clientY - toqueInicioY;

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < DISTANCIA_MINIMA_SWIPE) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        definirDirecaoJogador(jogadores[0], deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    } else {
        definirDirecaoJogador(jogadores[0], deltaY > 0 ? { x: 0, y: 1} : { x: 0, y: -1 });
    }

    toqueInicioX = toque.clientX;
    toqueInicioY = toque.clientY;
    deslizouNesteToque = true;
}, {passive: false});

canvas.addEventListener("touchend", (evento) => {
    if (noMenu || animacaoMorte) return;
    if (!jogoAtivo) {
        reiniciar();
        return;
    }

    if (deslizouNesteToque) return; // já virou durante o movimento

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
    if (noMenu || animacaoMorte) return;
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
        return; // ao despausar, o loopRenderizacao volta a chamar o loop sozinho
    }
    // o loop roda em meios passos: quem está com Turbo anda em todos,
    // os outros só nos passos completos (um sim, um não)
    contadorMeiosPassos++;
    tempoDaPartidaMs += duracaoDoMeioPasso(); // tempo jogado (não conta pausa)
    marcarTempoDoFantasma(velocidadeAtual / MEIOS_PASSOS_POR_PASSO);

    if (modoAtual === "tempo") {
        atualizarRelogio();

        if (tempoDaPartidaMs >= DURACAO_MODO_TEMPO_MS) {
            encerrarPorTempo();
            return;
        }
    }
    const passoCompleto = contadorMeiosPassos % MEIOS_PASSOS_POR_PASSO === 0;
    const agoraReal = performance.now();
    // o quadro chega um pouquinho depois do horário do passo: conta sempre do horário combinado,
    // senão o atraso se acumula e a cobra "engasga" no fim de cada passo
    const agoraJogo = agoraDoJogo();
    const horaDoPasso = Math.abs(agoraJogo - proximoLoopEm) < duracaoDoMeioPasso() ? proximoLoopEm : agoraJogo;

    for (const jogador of jogadores) {
        atualizarEfeitos(jogador);

        if (jogador.comboAtual > 0 && agoraDoJogo() - jogador.ultimoComerEm > JANELA_COMBO_MS) {
            jogador.comboAtual = 0;
        }
    }

    const jogadoresQueAndam = jogadores.filter(
        (jogador) => (passoCompleto || jogador.velocidadeExtraAtiva) && !estaAtordoado(jogador)
    );

    for (const jogador of jogadoresQueAndam) {
        jogador.cobraAnterior = jogador.cobra.map((segmento) => ({ ...segmento }));
        moverJogador(jogador); // anda pra direção combinada no passo anterior
        jogador.direcaoAndada = jogador.direcao;
        jogador.ultimoPassoEm = horaDoPasso; // contado horário certo do passo (o quadro pode ter chegado um pouco depois)
    }

    if (comidaDourada && agoraDoJogo() >= comidaDourada.expiraEm) {
        comidaDourada = null;
    }
    
    // só quem andou pode ter batido
    const batidas = jogadoresQueAndam
        .map((jogador) => ({ jogador, motivo: motivoDaBatida(jogador) }))
        .filter((batida) => batida.motivo !== null)
        .filter(({ jogador }) => !segurarComEscudo(jogador)); // com escudo, a batida não conta

    batidas.forEach(({ jogador }) => { jogador.bateu = true; }); // o desenho mostra a cabeça encostada

    if (batidas.length > 0 && modoAtual === "tempo") {
        // no Contra o Tempo bater não acaba o jogo: perde pedaços e fica parada um pouco
        batidas.forEach(({ jogador }) => penalizarBatida(jogador));
        tocarSomColisao();
        vibrar(80);
    } else if (batidas.length > 0 && parceiroContinuaNoJogo(batidas)) {
        // 2 Juntos: quem bateu volta pro começo; o jogo só acaba se os dois estiverem fora
        batidas.forEach(({ jogador }) => voltarAoInicio(jogador));
        tocarSomColisao();
        vibrar(80);
    } else if (batidas.length > 0) {
        jogoAtivo = false;
        travarSemParedes(false);
        pararMusicaFundo();
        tocarSomColisao();
        vibrar([120, 60, 200]);

        animacaoMorte = { inicio: performance.now(), batidos: batidas.map((batida) => batida.jogador) };
        temporizadorAnimacaoMorte = setTimeout(() => {
            animacaoMorte = null;
            mostrarTelaGameOver(
                jogadores.filter((jogador) => !batidas.some((batida) => batida.jogador === jogador)),
                batidas
            );
        }, DURACAO_ANIMACAO_MORTE_MS);
        return;
    }

    jogadoresQueAndam.forEach(gravarPassoDoFantasma); // depois das batidas: no Contra o tempo a cobra já voltou

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
    atualizarVelocidadeNoPlacar();
    }

    if (modoAtual === "fases") {
        const maiorPontuacao = Math.max(...jogadores.map((jogador) => jogador.pontuacao));
        const fase = faseParaPontuacao(maiorPontuacao, PONTOS_POR_FASE, MAPAS_DAS_FASES.length);

        if (fase > faseAtual) {
            passarDeFase(fase);
        }
    }

    atualizarPlacarJuntos();

    const meioPasso = duracaoDoMeioPasso();
    const proximoEhCompleto = (contadorMeiosPassos + 1) % MEIOS_PASSOS_POR_PASSO === 0;
    proximoLoopEm = horaDoPasso + meioPasso;

    for (const jogador of jogadores) {
        if (jogadoresQueAndam.includes(jogador)) {
            // já combina a direção do próximo passo: o desenho mostra a cobra indo exatamente pra lá

            if (jogador.bot) {
                definirDirecaoJogador(jogador, decidirDirecaoBot(jogador));
            }
            aplicarProximaDirecao(jogador);
        } else if (estaAtordoado(jogador)) {
            // parada (bateu, escudo, voltando pro começo): já combina pra onde vai sair,
            // senão ela sai de novo na mesma direção em que bateu
            if (jogador.bot) {
                definirDirecaoJogador(jogador, decidirDirecaoBot(jogador));
            }
            aplicarProximaDirecao(jogador);
        }

        if (!jogadoresQueAndam.includes(jogador) && !(jogador.passoTerminaEm > horaDoPasso)) {
            jogador.ultimoPassoEm = horaDoPasso; // estava parada (começo, atordoada): sai andando daqui
        }

        // quando ela anda de novo: no próximo meio passo (Turbo ou passo completo) ou no seguinte
        const turboNoProximo = jogador.velocidadeExtraAtiva && jogador.velocidadeExtraAte > proximoLoopEm;
        jogador.passoTerminaEm = proximoLoopEm + (turboNoProximo || proximoEhCompleto ? 0 : meioPasso);
    }
}

// mostra "1.4x" no placar e acende a cor por um instante quando o número sobe
function atualizarVelocidadeNoPlacar() {
    const texto = formatarVelocidade(VELOCIDADE_INICIAL_MS, velocidadeAtual);

    if (texto === elementoVelocidade.textContent) return;

    const acelerou = jogoAtivo && velocidadeMostrada !== null && velocidadeAtual < velocidadeMostrada;
    elementoVelocidade.textContent = texto;
    velocidadeMostrada = velocidadeAtual;

    if (acelerou) {
        barraVelocidade.classList.add("acelerou");
        clearTimeout(temporizadorDestaqueVelocidade);
        temporizadorDestaqueVelocidade = setTimeout(() => barraVelocidade.classList.remove("acelerou"), 600);
    }
}

// "Sem paredes" só muda fora da partida (antes dava pra marcar no meio e escapar de uma batida)
function travarSemParedes(travado) {
    inputModoSemParedes.disabled = travado;
    inputModoSemParedes.parentElement.title = travado ? "Só dá pra mudar fora da partida" : "";
}

function reiniciar() {
    particulas = []; // rastro e efeitos da partida anterior
    clearTimeout(temporizadorAnimacaoMorte);
    elementoTextoCompartilhar.hidden = true;
    clearTimeout(temporizadorLoop);
    cancelarContagem();
    menuPausa.hidden = true;
    animacaoMorte = null;
    semParedesNaPartida = inputModoSemParedes.checked && modoAtual !== "desafio"; // desafio: sempre com paredes
    travarSemParedes(true);
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
    elementoFase.hidden = modoAtual !== "fases" && modoAtual !== "desafio" && modoAtual !== "personalizada";
    if (modoAtual === "fases") {
        carregarFase(1);
    }
    if (modoAtual === "personalizada") {
        obstaculos = paredesDaFaseCriada.map((parede) => ({ x: parede.x, y: parede.y }));
        elementoFase.textContent = "Fase criada";
    }
    desafioDoDia = null;
    if (modoAtual === "desafio") {
        const hoje = dataDeHoje();
        desafioDoDia = gerarDesafioDoDia(hoje, COLUNAS, LINHAS, PEDRAS_NO_DESAFIO, jogadores.map((jogador) => jogador.cobra[0]), 400);
        obstaculos = desafioDoDia.pedras.map((pedra) => ({ x: pedra.x, y: pedra.y }));
        indiceComidaDesafio = 0;
        elementoFase.textContent = `Desafio de ${hoje.slice(8, 10)}/${hoje.slice(5, 7)}`;
    }
    comida = gerarComida();
    criarRatosIniciais();
    atualizarPlacarJuntos();
    contadorMeiosPassos = 0;
    contadorPassosPedras = 0;
    tempoDaPartidaMs = 0;
    partidaAtual = { powerUps: 0, comidas: 0, douradas: 0, maiorCombo: 0 };
    elementoRelogio.hidden = modoAtual !== "tempo";
    atualizarRelogio();
    velocidadeAtual = VELOCIDADE_INICIAL_MS; // antes, o 1° passo usava a velocidade na partida anterior
    atualizarVelocidadeNoPlacar();
    textosFlutuantes = [];
    powerUp = null;
    comidaDourada = null;
    pausado = false;
    pausadoDesde = null;
    telaGameOver.hidden = true;
    jogoAtivo = true;
    botaoPausa.textContent = "Pausar";
    prepararFantasma();
    iniciarContagem();
}

function aplicarDificuldade() {
    // no desafio a velocidade é sempre a Normal, pra todo mundo jogar igual
    const dificuldade= modoAtual === "desafio" ? "normal" : seletorDificuldade.value;
    const configuracao = CONFIGURACAO_DIFICULDADE[dificuldade];

    VELOCIDADE_INICIAL_MS = configuracao.velocidadeInicial;
    QUANTIDADE_OBSTACULOS = modoAtual === "clássico" ? 0 : configuracao.obstaculos;
    QUANTIDADE_PEDRAS_MOVEIS = modoAtual === "clássico" ? 0 : configuracao.pedrasMoveis;
}

// celular em pé: tabuleiro com casas maiores (menos colunas, mais linhas); o computador continua 20x20
function aplicarTamanhoDoTabuleiro() {
    const celularEmPe = window.matchMedia("(pointer: coarse)").matches &&
        window.innerWidth < 600 && window.innerHeight > window.innerWidth;
    const tamanho = tamanhoDoTabuleiro(celularEmPe, window.innerWidth, window.innerHeight, modoAtual);

    COLUNAS = tamanho.colunas;
    LINHAS = tamanho.linhas;
    LARGURA_TABULEIRO = COLUNAS * TAMANHO_CELULA;
    ALTURA_TABULEIRO = LINHAS * TAMANHO_CELULA;
    canvas.style.aspectRatio = `${COLUNAS} / ${LINHAS}`;
    ajustarResolucaoCanvas();
}

function comecarJogo(quantidade, comBot = false, juntos = false, modo = seletorModo.value) {
    obterContextoAudio();
    salvarPreferencias();
    modoAtual = modo;
    mostrarRecordesDoModo(modoAtual);
    aplicarDificuldade();
    quantidadeJogadoresAtual = comBot ? 2 : quantidade;
    modoComBotAtivo = comBot;
    modoCooperativo = juntos;

    const nome1 = inputNomeJogador1.value.trim() || "Jogador 1";
    const nome2 = comBot ? "Bot" : (inputNomeJogador2.value.trim() || "Jogador 2");
    nomesJogadoresAtuais = [nome1, nome2];

    elementoNomeExibido1.textContent = nome1;
    elementoNomeExibido2.textContent = nome2;
    placarJogador2.hidden = quantidadeJogadoresAtual === 1;
    noMenu = false;
    telaInicial.hidden= true;
    aplicarTamanhoDoTabuleiro();
    reiniciar();
    prepararTutorial();

    // no celular, rola a página pra deixar o tabuleiro na tela
    if (window.matchMedia("(pointer: coarse)").matches) {
        document.querySelector(".jogo").scrollIntoView({ behavior: reduzirMovimento ? "auto" : "smooth", block: "start" });
    }
}

botaoJogar1.addEventListener("click", () => comecarJogo(1));
botaoJogar2.addEventListener("click", () => comecarJogo(2));
botaoJogarBot.addEventListener("click", () => comecarJogo(1, true));
document.getElementById("botaoJogarJuntos").addEventListener("click", () => comecarJogo(2, false, true));

// ==========================================
// Instalar como app (PWA)
// ==========================================
const botaoInstalar = document.getElementById("botaoInstalar");
let pedidoDeInstalacao = null; // o navegador entrega quando o jogo pode ser instalado

// só funciona em http(s) (GitHub Pages, localhost); abrindo o arquivo direto do computador não faz nada
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
}

window.addEventListener("beforeinstallprompt", (evento) => {
    evento.preventDefault(); // guarda o pedido pra mostrar só quando clicarem no botão
    pedidoDeInstalacao = evento;
    botaoInstalar.hidden = false;
});

botaoInstalar.addEventListener("click", async () => {
    if (!pedidoDeInstalacao) return;

    pedidoDeInstalacao.prompt();
    await pedidoDeInstalacao.userChoice;
    pedidoDeInstalacao = null;
    botaoInstalar.hidden = true;
});

window.addEventListener("appinstalled", () => {
    botaoInstalar.hidden = true;
});

// ==========================================
// Início
// ==========================================
// abriu um link de fase (...#fase=código): a fase aparece no editor, pronta pra jogar
const faseDoLink = location.hash.startsWith("#fase=") ? decodificarFase(location.hash.slice(6)) : null;
if (faseDoLink) {
    paredesDaFaseCriada = faseDoLink;
    salvarFaseCriada();
    history.replaceState(null, "", location.pathname + location.search); // tira o código da barra de endereço
    abrirEditorDeFase();
}

loopRenderizacao();
