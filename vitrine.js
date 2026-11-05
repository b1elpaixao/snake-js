// ==========================================
// Vitrine: as cobras com chapéu que passeiam atrás do menu.
// Só enfeite, com sorteio próprio: não mexe no jogo nem no sorteio das partidas.
// ==========================================
const COBRAS_DA_VITRINE = [
    { cabeca: "#6fa0ff", corpo: "#3f6be0", chapeu: "mascara" },
    { cabeca: "#ff9a6b", corpo: "#e0683a", chapeu: "coroa" },
    { cabeca: "#ff7ac6", corpo: "#d94a9f", chapeu: "bruxa" },
    { cabeca: "#b98bff", corpo: "#8a5be0", chapeu: "helice" },
];
const CASA_DA_VITRINE = 56;
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
    const centro = (casa) => ({ x: (casa.x + 0.5) * CASA_DA_VITRINE, y: (casa.y + 0.5) * CASA_DA_VITRINE });
    const largura = CASA_DA_VITRINE * 0.62;
    const pontos = cobra.casas.map(centro);
    const proxima = {
        x: pontos[0].x + cobra.direcao.x * CASA_DA_VITRINE * andou,
        y: pontos[0].y + cobra.direcao.y * CASA_DA_VITRINE * andou,
    };

    // cada trecho é riscado separado: quem deu a volta pela borda não risca a tela de um lado ao outro
    const trechos = [[proxima]];
    for (let i = 0; i < pontos.length; i++) {
        const anterior = i === 0 ? proxima : pontos[i - 1];
        if (Math.hypot(pontos[i].x - anterior.x, pontos[i].y - anterior.y) > CASA_DA_VITRINE * 1.5) trechos.push([]);
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
        c.lineCap = "round";
        c.lineJoin = "round";
        colunas = Math.ceil(window.innerWidth / CASA_DA_VITRINE);
        linhas = Math.ceil(window.innerHeight / CASA_DA_VITRINE);
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
