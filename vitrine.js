// ==========================================
// Vitrine: o fundo do menu, as cobras com chapéu que passeiam e os cartões de modo.
// Só enfeite, com sorteio próprio: não mexe no jogo nem no sorteio das partidas.
// ==========================================
const COBRAS_DA_VITRINE = [
    { cabeca: "#6fa0ff", corpo: "#3f6be0", chapeu: "mascara" },
    { cabeca: "#ff9a6b", corpo: "#e0683a", chapeu: "coroa" },
    { cabeca: "#ff7ac6", corpo: "#d94a9f", chapeu: "bruxa" },
    { cabeca: "#b98bff", corpo: "#8a5be0", chapeu: "helice" },
];
let casaDaVitrine = 56; // proporcional à janela: em tela pequena, cobras menores
const PASSO_DA_VITRINE_MS = 210;
const TAMANHO_DA_COBRA_NA_VITRINE = 9;

let sementeDaVitrine = 12345;
function sorteioDaVitrine(limite) {
    sementeDaVitrine = (sementeDaVitrine * 1103515245 + 12345) % 2147483648;
    return Math.floor((sementeDaVitrine / 2147483648) * limite);
}

function novaCobraDaVitrine(molde, colunas, linhas) {
    const x = sorteioDaVitrine(colunas), y = sorteioDaVitrine(linhas);
    const casas = [];
    for (let i = 0; i < TAMANHO_DA_COBRA_NA_VITRINE; i++) casas.push({ x, y });
    return { ...molde, casas, direcao: { x: 1, y: 0 } };
}

// segue na mesma direção e, de vez em quando, vira; passando da borda, volta pelo outro lado
function andarNaVitrine(cobra, colunas, linhas) {
    if (sorteioDaVitrine(5) === 0) {
        const lado = sorteioDaVitrine(2) === 0 ? 1 : -1;
        cobra.direcao = { x: cobra.direcao.y * lado, y: cobra.direcao.x * lado };
    }
    const cabeca = cobra.casas[0];
    cobra.casas.unshift({
        x: (cabeca.x + cobra.direcao.x + colunas) % colunas,
        y: (cabeca.y + cobra.direcao.y + linhas) % linhas,
    });
    cobra.casas.pop();
}

function desenharCobraDaVitrine(c, cobra, andou) {
    const centro = (casa) => ({ x: (casa.x + 0.5) * casaDaVitrine, y: (casa.y + 0.5) * casaDaVitrine });
    const largura = casaDaVitrine * 0.62;
    const pontos = cobra.casas.map(centro);
    const proxima = {
        x: pontos[0].x + cobra.direcao.x * casaDaVitrine * andou,
        y: pontos[0].y + cobra.direcao.y * casaDaVitrine * andou,
    };

    // cada trecho é riscado separado: quem deu a volta pela borda não risca a tela de um lado ao outro
    const trechos = [[proxima]];
    for (let i = 0; i < pontos.length; i++) {
        const anterior = i === 0 ? proxima : pontos[i - 1];
        if (Math.hypot(pontos[i].x - anterior.x, pontos[i].y - anterior.y) > casaDaVitrine * 1.5) trechos.push([]);
        trechos[trechos.length - 1].push(pontos[i]);
    }
    for (const [cor, largo] of [[TINTA_DE_GIBI, largura * 1.22], [cobra.corpo, largura]]) {
        c.strokeStyle = cor;
        c.lineWidth = largo;
        for (const trecho of trechos) {
            c.beginPath();
            trecho.forEach((ponto, i) => (i === 0 ? c.moveTo(ponto.x, ponto.y) : c.lineTo(ponto.x, ponto.y)));
            c.stroke();
        }
    }

    c.save();
    c.translate(proxima.x, proxima.y);
    c.rotate(Math.atan2(cobra.direcao.y, cobra.direcao.x));
    c.scale(largura / 15, largura / 15);
    c.fillStyle = TINTA_DE_GIBI;
    c.beginPath(); c.ellipse(4, 0, 17, 16, 0, 0, Math.PI * 2); c.fill();
    desenharCabecaCobra(cobra.cabeca, c);
    desenharChapeu(c, cobra.chapeu, performance.now());
    c.restore();
}

function iniciarVitrine() {
    const tela = document.getElementById("canvasVitrine");
    if (!tela || !tela.getContext || tela.getContext("2d") === ctx) return;
    const c = tela.getContext("2d");
    let cobras = [], colunas = 0, linhas = 0, ultimoPasso = 0;

    function medir() {
        const proporcao = window.devicePixelRatio || 1;
        tela.width = window.innerWidth * proporcao;
        tela.height = window.innerHeight * proporcao;
        c.setTransform(proporcao, 0, 0, proporcao, 0, 0);
        casaDaVitrine = Math.max(28, Math.min(56, Math.min(window.innerWidth, window.innerHeight) / 13));
        c.lineCap = "round";
        c.lineJoin = "round";
        colunas = Math.ceil(window.innerWidth / casaDaVitrine);
        linhas = Math.ceil(window.innerHeight / casaDaVitrine);
        cobras = COBRAS_DA_VITRINE.map((molde) => novaCobraDaVitrine(molde, colunas, linhas));
        for (let i = 0; i < 40; i++) cobras.forEach((cobra) => andarNaVitrine(cobra, colunas, linhas));
    }

    function quadro(agora) {
        requestAnimationFrame(quadro);
        if (telaInicial.hidden || document.hidden) return;
        const parado = reduzirMovimento && ultimoPasso !== 0;
        if (!parado && agora - ultimoPasso >= PASSO_DA_VITRINE_MS) {
            ultimoPasso = agora;
            cobras.forEach((cobra) => andarNaVitrine(cobra, colunas, linhas));
        }
        const andou = reduzirMovimento ? 0 : Math.min(1, (agora - ultimoPasso) / PASSO_DA_VITRINE_MS);
        c.clearRect(0, 0, window.innerWidth, window.innerHeight);
        cobras.forEach((cobra) => desenharCobraDaVitrine(c, cobra, andou));
    }

    medir();
    window.addEventListener("resize", medir);
    requestAnimationFrame(quadro);
}

// fundo parado: o abismo com os raios e os olhos atrás do título
function desenharFundoDoMenu() {
    const tela = document.getElementById("fundoDoMenu");
    if (!tela || !tela.getContext || tela.getContext("2d") === ctx) return;
    const L = window.innerWidth, A = window.innerHeight;
    tela.width = L;
    tela.height = A;
    const c = tela.getContext("2d");

    const casa = Math.max(L, A) / 24;
    c.fillStyle = "#112033";
    c.fillRect(0, 0, L, A);
    c.fillStyle = "#0e1a2b";
    for (let y = 0; y * casa < A; y++) for (let x = y % 2; x * casa < L; x += 2) c.fillRect(x * casa, y * casa, casa, casa);

    const cx = L / 2, cy = A * 0.24, raio = Math.hypot(L, A);
    c.fillStyle = "rgba(255, 70, 90, 0.07)";
    for (let i = 0; i < 16; i++) {
        const angulo = (i / 16) * Math.PI * 2;
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx + Math.cos(angulo) * raio, cy + Math.sin(angulo) * raio);
        c.lineTo(cx + Math.cos(angulo + 0.2) * raio, cy + Math.sin(angulo + 0.2) * raio);
        c.closePath();
        c.fill();
    }
    const brilho = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(L, A) * 0.55);
    brilho.addColorStop(0, "rgba(255, 50, 90, 0.5)");
    brilho.addColorStop(0.5, "rgba(120, 40, 200, 0.2)");
    brilho.addColorStop(1, "rgba(0, 0, 0, 0)");
    c.fillStyle = brilho;
    c.fillRect(0, 0, L, A);

    const escala = Math.min(L, A) / 95;
    const pontos = [];
    for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        pontos.push({ x: (L * (0.5 + 0.03 * Math.sin(t * 6))) / escala, y: (A * (0.17 - 0.5 * t)) / escala });
    }
    c.save();
    c.scale(escala, escala);
    desenharSombraViva(c, pontos, { x: 0, y: 1 }, 19, 2400, PALETA_DO_CHEFAO);
    c.restore();
}

const CARTOES_DE_MODO = [
    { modo: "normal", nome: "Normal", texto: "Coma, cresça, não bata", cabeca: "#6fa0ff", chapeu: "mascara", chao: "#d2a56c" },
    { modo: "arena", nome: "Arena", texto: "A zona fecha com fogo", cabeca: "#ff9a6b", chapeu: "coroa", chao: "#5a2a1e" },
    { modo: "chefao", nome: "Chefão", texto: "Enfrente os olhos", cabeca: "#ff7ac6", chapeu: "bruxa", chao: "#112033" },
    { modo: "tempo", nome: "Contra o tempo", texto: "2 minutos, muitos pontos", cabeca: "#b98bff", chapeu: "helice", chao: "#2b4a3d" },
];

function montarCartoesDeModo() {
    const fila = document.getElementById("cartoesDeModo");
    if (!fila.append || !document.createElement("canvas").getContext("2d")) return;
    for (const cartao of CARTOES_DE_MODO) {
        const botao = document.createElement("button");
        botao.className = "cartao-modo";
        botao.type = "button";

        const tela = document.createElement("canvas");
        tela.width = 240;
        tela.height = 150;
        const c = tela.getContext("2d");
        c.fillStyle = cartao.chao;
        c.fillRect(0, 0, 240, 150);
        c.translate(120, 78);
        c.scale(2.3, 2.3);
        c.rotate(-Math.PI / 2);
        c.fillStyle = TINTA_DE_GIBI;
        c.beginPath(); c.ellipse(4, 0, 17, 16, 0, 0, Math.PI * 2); c.fill();
        desenharCabecaCobra(cartao.cabeca, c);
        desenharChapeu(c, cartao.chapeu, 1200);

        const nome = document.createElement("b");
        nome.textContent = tr(cartao.nome);
        const texto = document.createElement("span");
        texto.textContent = tr(cartao.texto);
        botao.append(tela, nome, texto);
        botao.addEventListener("click", () => {
            seletorModo.value = cartao.modo;
            comecarJogo(1, false, false, cartao.modo);
        });
        fila.append(botao);
    }
}
