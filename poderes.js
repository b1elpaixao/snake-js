// ==========================================
// Power-up Congelar
// ==========================================
// ---------- Congelar ----------
// quem pegou o Congelar continua andando; o resto (outra cobra, chefão, ratos e pedras que andam) fica parado
function quemCongelou() {
    return jogadores.find((jogador) => jogador.congelarAtivo) || null;
}

function estaCongelado(jogador) {
    const dono = quemCongelou();
    return dono !== null && dono !== jogador && !modoCooperativo; // no 2 Juntos não congela o parceiro
}

// 0 a 1: o gelo aparece rápido e derrete no fim
function forcaDoGelo() {
    const dono = quemCongelou();
    if (!dono) return 0;
    const agora = agoraDoJogo();
    const comecou = dono.congelarAte - DURACAO_CONGELAR_MS;
    return Math.max(0, Math.min(1, (agora - comecou) / 250, (dono.congelarAte - agora) / 700));
}

// o tabuleiro vira um lago congelado: azulado, geada nas bordas, reflexo passando, flocos caindo e, no fim, rachaduras
function desenharGeloNoTabuleiro() {
    const forca = forcaDoGelo();
    if (forca <= 0) return;
    const tempo = reduzirMovimento ? 0 : agoraDoJogo();

    ctx.save();
    ctx.fillStyle = `rgba(170, 225, 255, ${0.3 * forca})`;
    ctx.fillRect(0, 0, LARGURA_TABULEIRO, ALTURA_TABULEIRO);

    // geada nas bordas
    const geada = ctx.createRadialGradient(
        LARGURA_TABULEIRO / 2, ALTURA_TABULEIRO / 2, Math.min(LARGURA_TABULEIRO, ALTURA_TABULEIRO) * 0.3,
        LARGURA_TABULEIRO / 2, ALTURA_TABULEIRO / 2, Math.hypot(LARGURA_TABULEIRO, ALTURA_TABULEIRO) / 2
    );
    geada.addColorStop(0, "rgba(255, 255, 255, 0)");
    geada.addColorStop(1, `rgba(235, 248, 255, ${0.75 * forca})`);
    ctx.fillStyle = geada;
    ctx.fillRect(0, 0, LARGURA_TABULEIRO, ALTURA_TABULEIRO);

    // gelo liso: um reflexo passa na diagonal de tempos em tempos
    if (!reduzirMovimento) {
        const onde = ((tempo % 2600) / 2600) * 1.6 - 0.3; // de -0.3 a 1.3: entra e sai do tabuleiro
        const reflexo = ctx.createLinearGradient(0, 0, LARGURA_TABULEIRO, ALTURA_TABULEIRO);
        for (const [deslocamento, brilho] of [[-0.07, 0], [-0.02, 0.32], [0, 0.42], [0.02, 0.32], [0.07, 0], [0.11, 0], [0.12, 0.2], [0.13, 0]]) {
            const parada = onde + deslocamento;
            if (parada >= 0 && parada <= 1) reflexo.addColorStop(parada, `rgba(255, 255, 255, ${brilho * forca})`);
        }
        ctx.fillStyle = reflexo;
        ctx.fillRect(0, 0, LARGURA_TABULEIRO, ALTURA_TABULEIRO);
    }

    // perto do fim, rachaduras finas vão crescendo pelo gelo
    const falta = quemCongelou().congelarAte - agoraDoJogo();
    if (falta < 1500) {
        const cresceu = 1 - falta / 1500; // 0 a 1
        const pedacos = 7;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (const [largura, cor] of [[2.4, `rgba(90, 150, 200, ${0.35 * forca})`], [1.1, `rgba(255, 255, 255, ${0.9 * forca})`]]) {
            ctx.strokeStyle = cor;
            ctx.lineWidth = largura;
            ctx.beginPath();
            for (let r = 0; r < 6; r++) {
                let x = sorteioDaCasa(r, 21) * LARGURA_TABULEIRO;
                let y = sorteioDaCasa(r, 22) * ALTURA_TABULEIRO;
                let angulo = sorteioDaCasa(r, 23) * Math.PI * 2;
                ctx.moveTo(x, y);
                const ate = cresceu * pedacos;
                for (let p = 0; p < ate; p++) {
                    angulo += (sorteioDaCasa(r * 9 + p, 24) - 0.5) * 1.4;
                    const passo = TAMANHO_CELULA * 0.9 * Math.min(1, ate - p);
                    x += Math.cos(angulo) * passo;
                    y += Math.sin(angulo) * passo;
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
    }

    // cristais de gelo em algumas casas (sempre nas mesmas)
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 * forca})`;
    ctx.lineWidth = 1.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let linha = 0; linha < LINHAS; linha++) {
        for (let coluna = 0; coluna < COLUNAS; coluna++) {
            if (sorteioDaCasa(coluna * 7 + 3, linha * 5 + 11) > 0.1) continue;
            const centro = centroDaCasa({ x: coluna, y: linha });
            const raio = TAMANHO_CELULA * 0.28;
            for (let i = 0; i < 3; i++) {
                const angulo = (i * Math.PI) / 3;
                ctx.moveTo(centro.x - Math.cos(angulo) * raio, centro.y - Math.sin(angulo) * raio);
                ctx.lineTo(centro.x + Math.cos(angulo) * raio, centro.y + Math.sin(angulo) * raio);
            }
        }
    }
    ctx.stroke();

    // flocos caindo
    ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * forca})`;
    for (let i = 0; i < 26; i++) {
        const x = (sorteioDaCasa(i, 1) * LARGURA_TABULEIRO + Math.sin(tempo / 700 + i) * 10 + LARGURA_TABULEIRO) % LARGURA_TABULEIRO;
        const y = (sorteioDaCasa(i, 2) * ALTURA_TABULEIRO + tempo * (0.02 + sorteioDaCasa(i, 3) * 0.03)) % ALTURA_TABULEIRO;
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + sorteioDaCasa(i, 4) * 1.6, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// uma casca de gelo por cima de quem está congelado (cobras e ratos)
function desenharGeloPorCima() {
    const forca = forcaDoGelo();
    if (forca <= 0) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const jogador of jogadores) {
        if (!estaCongelado(jogador)) continue;
        const pontos = jogador.cobra.map(centroDaCasa);
        for (const [largura, cor] of [[0.95, `rgba(190, 235, 255, ${0.55 * forca})`], [0.35, `rgba(255, 255, 255, ${0.5 * forca})`]]) {
            ctx.strokeStyle = cor;
            ctx.lineWidth = TAMANHO_CELULA * largura;
            ctx.beginPath();
            pontos.forEach((ponto, indice) => {
                const pulou = indice > 0 && Math.hypot(ponto.x - pontos[indice - 1].x, ponto.y - pontos[indice - 1].y) > TAMANHO_CELULA * 1.5;
                if (indice === 0 || pulou) ctx.moveTo(ponto.x, ponto.y); else ctx.lineTo(ponto.x, ponto.y);
            });
            if (pontos.length === 1) ctx.lineTo(pontos[0].x + 0.1, pontos[0].y);
            ctx.stroke();
        }
    }
    ctx.fillStyle = `rgba(190, 235, 255, ${0.55 * forca})`;
    for (const rato of ratos) {
        const centro = centroDaCasa(rato);
        ctx.beginPath();
        ctx.arc(centro.x, centro.y, TAMANHO_CELULA * 0.55, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// quando o Congelar acaba, o gelo de quem estava parado estilhaça
function estilhacarGelo(dono) {
    tocarSom(1400, 0.08, "triangle");
    setTimeout(() => tocarSom(1900, 0.06, "triangle"), 60);
    if (reduzirMovimento || modoCooperativo) return;

    const agora = agoraDoJogo();
    const casas = [...jogadores.filter((jogador) => jogador !== dono).flatMap((jogador) => jogador.cobra), ...ratos].slice(0, 40);
    for (const casa of casas) {
        const centro = centroDaCasa(casa);
        for (let i = 0; i < 3; i++) {
            const angulo = Math.random() * Math.PI * 2;
            const velocidade = 30 + Math.random() * 50;
            particulas.push({ tipo: "gelo", x: centro.x, y: centro.y, nasceu: agora, vida: 500 + Math.random() * 250,
                vx: Math.cos(angulo) * velocidade, vy: Math.sin(angulo) * velocidade - 50, giro: Math.random() * 6, tamanho: 1.6 + Math.random() * 1.6, cor: null });
        }
    }
    particulas = particulas.slice(-220);
}
