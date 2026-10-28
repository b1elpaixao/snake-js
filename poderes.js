// ==========================================
// Power-ups Congelar e Bomba
// ==========================================
let pedrasDestruidas = 0; // pedras que a Bomba explodiu: não voltam na hora
let explosoes = [];       // { casa, ate } (relógio de verdade: o clarão e a onda aparecem até na animação de morte)
let tremorAte = 0;        // até quando a tela treme (performance.now)

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

// ---------- Bomba ----------
const DURACAO_EXPLOSAO_MS = 1000;

function explodirBomba(jogador) {
    const centro = jogador.cobra[0];
    const { ficam, explodidas } = pedrasNaExplosao(obstaculos, centro, RAIO_DA_BOMBA);

    obstaculos = ficam;
    pedrasDestruidas += explodidas.length;
    if (!jogador.bot) anunciar(`Bomba: ${explodidas.length} ${explodidas.length === 1 ? "pedra explodida" : "pedras explodidas"}`);

    // no Chefão, pegar ele na explosão tira 1 de vida
    if (chefao && jogador !== chefao && !estaAtordoado(chefao)) {
        const atingido = chefao.cobra.find((pedaco) => Math.max(Math.abs(pedaco.x - centro.x), Math.abs(pedaco.y - centro.y)) <= RAIO_DA_BOMBA);
        if (atingido) acertarChefao(atingido, "Bum!");
    }

    // som: estrondo grave
    tocarSom(70, 0.45, "sawtooth");
    tocarSom(45, 0.6, "square");
    vibrar([80, 40, 160]);

    explosoes.push({ casa: { ...centro }, ate: performance.now() + DURACAO_EXPLOSAO_MS });
    if (!reduzirMovimento) {
        tremorAte = performance.now() + 450;
        soltarParticulasDaExplosao(centro, explodidas);
    }
}

// estrelinhas saindo pra todo lado e pedaços das pedras voando
function soltarParticulasDaExplosao(centro, pedras) {
    const agora = agoraDoJogo();
    const meio = centroDaCasa(centro);
    const sorteio = (minimo, maximo) => minimo + Math.random() * (maximo - minimo);

    for (let i = 0; i < 16; i++) {
        const angulo = (i / 16) * Math.PI * 2 + sorteio(0, 0.3);
        const velocidade = sorteio(70, 130);
        particulas.push({ tipo: "estrelas", x: meio.x, y: meio.y, nasceu: agora, vida: sorteio(550, 800),
            vx: Math.cos(angulo) * velocidade, vy: Math.sin(angulo) * velocidade, giro: Math.random() * 6, tamanho: sorteio(2.5, 4),
            cor: ["#ffe066", "#ffffff", "#ff8c42"][i % 3] });
    }
    for (const pedra of pedras) {
        const lugar = centroDaCasa(pedra);
        for (let i = 0; i < 5; i++) {
            const angulo = Math.atan2(lugar.y - meio.y, lugar.x - meio.x) + sorteio(-0.8, 0.8);
            const velocidade = sorteio(50, 120);
            particulas.push({ tipo: "estilhaco", x: lugar.x, y: lugar.y, nasceu: agora, vida: sorteio(500, 800),
                vx: Math.cos(angulo) * velocidade, vy: Math.sin(angulo) * velocidade - 40, giro: Math.random() * 6, tamanho: sorteio(2, 3.5), cor: null });
        }
    }
    particulas = particulas.slice(-220);
}

// a tela treme forte no começo e vai parando
function aplicarTremor() {
    const falta = tremorAte - performance.now();
    if (falta <= 0 || reduzirMovimento) return;
    const forca = 7 * (falta / 450);
    ctx.translate((Math.random() * 2 - 1) * forca, (Math.random() * 2 - 1) * forca);
}

// explosão de desenho animado: estouro em estrela, nuvem de cogumelo e "BOOM!"
function desenharExplosoes() {
    const agora = performance.now();
    explosoes = explosoes.filter((explosao) => explosao.ate > agora);
    if (explosoes.length === 0) return;

    ctx.save();
    ctx.lineJoin = "round";
    for (const explosao of explosoes) {
        const andou = 1 - (explosao.ate - agora) / DURACAO_EXPLOSAO_MS; // 0 = acabou de explodir, 1 = sumiu
        const centro = centroDaCasa(explosao.casa);
        const alcance = TAMANHO_CELULA * (RAIO_DA_BOMBA + 0.5);
        const contorno = "#3b2414";

        // clarão branco rapidinho
        if (andou < 0.12) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * (1 - andou / 0.12)})`;
            ctx.beginPath(); ctx.arc(centro.x, centro.y, alcance * 1.3, 0, Math.PI * 2); ctx.fill();
        }

        // estouro em estrela (amarelo por fora, laranja por dentro), cresce rápido e some
        if (andou < 0.45) {
            const cresce = reduzirMovimento ? 1 : Math.min(1, andou / 0.15);
            ctx.globalAlpha = andou < 0.3 ? 1 : 1 - (andou - 0.3) / 0.15;
            for (const [tamanho, cor] of [[1.15, "#ffd23f"], [0.7, "#ff8c42"]]) {
                ctx.fillStyle = cor;
                ctx.strokeStyle = contorno;
                ctx.lineWidth = 3;
                ctx.beginPath();
                for (let i = 0; i < 24; i++) {
                    const angulo = (i / 24) * Math.PI * 2 + 0.2;
                    const raio = alcance * tamanho * cresce * (i % 2 === 0 ? 1 : 0.62);
                    ctx.lineTo(centro.x + Math.cos(angulo) * raio, centro.y + Math.sin(angulo) * raio);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }

        // nuvem de cogumelo: o tronco e a copa sobem juntos
        if (andou > 0.12) {
            const sobe = reduzirMovimento ? 0.5 : (andou - 0.12) / 0.88;
            ctx.globalAlpha = andou < 0.7 ? 1 : 1 - (andou - 0.7) / 0.3;
            const baseY = centro.y;
            const topoY = centro.y - alcance * (0.6 + sobe * 0.9);
            const fumacas = [];
            for (let i = 0; i < 4; i++) { // tronco
                const y = baseY + (topoY - baseY) * (i / 4);
                fumacas.push([centro.x + (i % 2 ? 3 : -3), y, TAMANHO_CELULA * (0.45 - i * 0.04)]);
            }
            for (const [dx, dy, raio] of [[-1.1, 0.15, 0.55], [1.1, 0.15, 0.55], [-0.55, -0.35, 0.65], [0.55, -0.35, 0.65], [0, 0, 0.8]]) { // copa
                fumacas.push([centro.x + dx * TAMANHO_CELULA, topoY + dy * TAMANHO_CELULA, TAMANHO_CELULA * raio * (0.7 + sobe * 0.4)]);
            }
            ctx.fillStyle = contorno; // contorno grosso de desenho
            for (const [x, y, raio] of fumacas) { ctx.beginPath(); ctx.arc(x, y, raio + 2.5, 0, Math.PI * 2); ctx.fill(); }
            ctx.fillStyle = "#c9c4bd";
            for (const [x, y, raio] of fumacas) { ctx.beginPath(); ctx.arc(x, y, raio, 0, Math.PI * 2); ctx.fill(); }
            ctx.fillStyle = "#efebe6"; // luz na parte de cima de cada bolota
            for (const [x, y, raio] of fumacas) { ctx.beginPath(); ctx.arc(x - raio * 0.25, y - raio * 0.3, raio * 0.5, 0, Math.PI * 2); ctx.fill(); }
            ctx.globalAlpha = 1;
        }

        // "BOOM!" grande, que salta e depois some
        if (andou < 0.8) {
            const salto = reduzirMovimento ? 1 : 1 + 0.5 * Math.max(0, 1 - andou / 0.15);
            const tamanhoDaLetra = Math.round(TAMANHO_CELULA * 1.5);
            const x = Math.max(tamanhoDaLetra * 2, Math.min(LARGURA_TABULEIRO - tamanhoDaLetra * 2, centro.x));
            const y = Math.max(tamanhoDaLetra, centro.y - alcance * 0.2);
            ctx.save();
            ctx.globalAlpha = andou < 0.6 ? 1 : 1 - (andou - 0.6) / 0.2;
            ctx.translate(x, y);
            ctx.rotate(-0.12);
            ctx.scale(salto, salto);
            ctx.font = `900 ${tamanhoDaLetra}px "Arial Black", Impact, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineWidth = Math.max(4, tamanhoDaLetra * 0.16);
            ctx.strokeStyle = contorno;
            ctx.strokeText("BOOM!", 0, 0);
            ctx.fillStyle = "#ffe14d";
            ctx.fillText("BOOM!", 0, 0);
            ctx.restore();
        }
    }
    ctx.restore();
}

// a bomba no chão: bolota preta com brilho e o pavio aceso soltando faíscas
function desenharBombaNoChao(item) {
    const centro = centroDaCasa(item);
    const raio = TAMANHO_CELULA * 0.34;
    const tempo = reduzirMovimento ? 0 : agoraDoJogo();
    const pulso = (Math.sin(tempo / 200) + 1) / 2;

    ctx.save();
    ctx.globalAlpha = 0.18 + 0.18 * pulso; // brilho em volta, como os outros power-ups
    ctx.fillStyle = CORES_POWERUP.bomba;
    ctx.beginPath(); ctx.arc(centro.x, centro.y, TAMANHO_CELULA * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    const cx = centro.x - raio * 0.1;
    const cy = centro.y + raio * 0.15;
    ctx.fillStyle = "#1f2430";
    ctx.beginPath(); ctx.arc(cx, cy, raio, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#4b5263"; // tampinha
    ctx.fillRect(cx + raio * 0.35, cy - raio * 1.05, raio * 0.55, raio * 0.4);
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)"; // brilho
    ctx.beginPath(); ctx.arc(cx - raio * 0.35, cy - raio * 0.35, raio * 0.25, 0, Math.PI * 2); ctx.fill();

    // pavio
    const pontaX = cx + raio * 1.0;
    const pontaY = cy - raio * 1.45;
    ctx.strokeStyle = "#c8a165";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx + raio * 0.62, cy - raio * 1.0);
    ctx.quadraticCurveTo(cx + raio * 0.7, cy - raio * 1.5, pontaX, pontaY);
    ctx.stroke();

    // faíscas piscando na ponta
    for (let i = 0; i < 5; i++) {
        const angulo = (i / 5) * Math.PI * 2 + tempo / 90;
        const comprimento = raio * (0.3 + 0.35 * ((Math.sin(tempo / 50 + i * 2.1) + 1) / 2));
        ctx.strokeStyle = i % 2 ? "#ffe066" : "#ff8c42";
        ctx.beginPath();
        ctx.moveTo(pontaX, pontaY);
        ctx.lineTo(pontaX + Math.cos(angulo) * comprimento, pontaY + Math.sin(angulo) * comprimento);
        ctx.stroke();
    }
    ctx.fillStyle = "#fff6c2";
    ctx.beginPath(); ctx.arc(pontaX, pontaY, 1.6 + pulso, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function prepararPoderes() {
    pedrasDestruidas = 0;
    explosoes = [];
    tremorAte = 0;
}
