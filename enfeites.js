// ==========================================
// Enfeites da loja: o desenho de cada item (chapéus, comidas, padrões do corpo, rastros, tabuleiros e efeitos).
// Só desenho: nada aqui muda as regras do jogo.
// ==========================================

// ==========================================
// Desenho dos chapéus (em volta da cabeça, no mesmo jeito do desenharCabecaCobra:
// cabeça no meio, olhos em (-3, ±11), a frente da cobra pro lado do x positivo)
// ==========================================
function desenharChapeu(c, id, tempo = 0) {
    if (!id) return;

    const circulo = (x, y, r, cor) => { c.fillStyle = cor; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
    const elipse = (x, y, rx, ry, cor, giro = 0) => { c.fillStyle = cor; c.beginPath(); c.ellipse(x, y, rx, ry, giro, 0, Math.PI * 2); c.fill(); };

    c.save();
    c.lineCap = "round";
    c.lineJoin = "round";

    if (id === "bone") {
        // boné virado pra trás: aba atrás da cabeça
        elipse(-15, 0, 7, 9, "#b71c2c");
        elipse(-3, 0, 11, 11.5, "#e63946");
        c.strokeStyle = "rgba(255, 255, 255, 0.85)";
        c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(-3, -11); c.lineTo(-3, 11); c.stroke();
        circulo(-3, 0, 2, "#ffffff");
    } else if (id === "laco") {
        c.fillStyle = "#ff5fa2";
        for (const lado of [-1, 1]) {
            c.beginPath();
            c.moveTo(-6, 0);
            c.quadraticCurveTo(-16, lado * 4, -14, lado * 13);
            c.quadraticCurveTo(-4, lado * 12, -6, 0);
            c.fill();
        }
        circulo(-6, 0, 3.4, "#d6337a");
        circulo(-7, -1, 1, "rgba(255, 255, 255, 0.7)");
    } else if (id === "flor") {
        for (let i = 0; i < 5; i++) {
            const angulo = (i / 5) * Math.PI * 2 + 0.3;
            circulo(-5 + Math.cos(angulo) * 5.5, Math.sin(angulo) * 5.5, 4.2, "#ffffff");
        }
        circulo(-5, 0, 3.6, "#ffcf33");
        circulo(-6, -1, 1.2, "#fff3b0");
    } else if (id === "oculos") {
        c.strokeStyle = "#111111";
        c.lineWidth = 2.4;
        c.beginPath(); c.moveTo(-3, -5); c.lineTo(-3, 5); c.stroke(); // ponte por cima da cabeça
        for (const lado of [-1, 1]) {
            c.beginPath(); c.moveTo(-6, lado * 16); c.lineTo(-16, lado * 13); c.stroke(); // hastes
            elipse(-3, lado * 11, 8, 7, "#141414");
            elipse(-5, lado * 11 - 2.5, 2.6, 1.3, "rgba(255, 255, 255, 0.55)", -0.4);
        }
    } else if (id === "fone") {
        c.strokeStyle = "#2b2d42";
        c.lineWidth = 3.4;
        c.beginPath(); c.moveTo(-9, -13); c.quadraticCurveTo(-17, 0, -9, 13); c.stroke();
        for (const lado of [-1, 1]) {
            elipse(-9, lado * 14, 5.5, 4.5, "#ff4757");
            elipse(-9, lado * 14, 2.6, 2, "#2b2d42");
        }
    } else if (id === "helice") {
        // gorro de 4 cores com hélice girando
        const cores = ["#e63946", "#ffcf33", "#2f80ed", "#2ecc71"];
        for (let i = 0; i < 4; i++) {
            c.fillStyle = cores[i];
            c.beginPath();
            c.moveTo(-3, 0);
            c.ellipse(-3, 0, 11, 11.5, 0, (i * Math.PI) / 2, ((i + 1) * Math.PI) / 2);
            c.closePath();
            c.fill();
        }
        const giro = tempo / 90;
        for (const lado of [0, Math.PI]) {
            elipse(-3 + Math.cos(giro + lado) * 8, Math.sin(giro + lado) * 8, 8, 2.6, "rgba(40, 40, 40, 0.85)", giro + lado);
        }
        circulo(-3, 0, 2.4, "#222222");
    } else if (id === "pirata") {
        elipse(-4, 0, 11, 12.5, "#d62828");
        for (const [x, y] of [[-8, -6], [-1, -7], [-9, 3], [-2, 5], [-5, -1]]) circulo(x, y, 1.3, "#ffffff");
        c.fillStyle = "#a4161a";
        c.beginPath(); c.moveTo(-14, 0); c.lineTo(-22, -5); c.lineTo(-21, 1); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-14, 0); c.lineTo(-21, 6); c.lineTo(-19, 1); c.closePath(); c.fill();
        // tapa-olho
        c.strokeStyle = "#111111";
        c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(-3, 11); c.lineTo(6, -12); c.stroke();
        elipse(-3, 11, 7.5, 7, "#111111");
    } else if (id === "visor") {
        // visor de vilã: faixa vermelha brilhando por cima dos olhos
        c.shadowColor = "#ff1f3d";
        c.shadowBlur = 8;
        c.fillStyle = "#ff1f3d";
        c.beginPath(); c.roundRect(-8, -19, 8, 38, 4); c.fill();
        c.shadowBlur = 0;
        c.fillStyle = "rgba(255, 255, 255, 0.7)";
        c.beginPath(); c.roundRect(-6.5, -16, 2, 32, 1); c.fill();
    } else if (id === "coroa") {
        // coroa vista de cima: estrela dourada com pedras
        const pontas = 6;
        c.fillStyle = "#ffcf33";
        c.strokeStyle = "#b8860b";
        c.lineWidth = 1.4;
        c.beginPath();
        for (let i = 0; i < pontas * 2; i++) {
            const angulo = (i / (pontas * 2)) * Math.PI * 2;
            const raio = i % 2 === 0 ? 13 : 8;
            c.lineTo(-3 + Math.cos(angulo) * raio, Math.sin(angulo) * raio);
        }
        c.closePath();
        c.fill();
        c.stroke();
        circulo(-3, 0, 5, "#ffe680");
        const pedras = ["#e63946", "#2f80ed", "#2ecc71"];
        for (let i = 0; i < pontas; i++) {
            const angulo = (i / pontas) * Math.PI * 2;
            circulo(-3 + Math.cos(angulo) * 11, Math.sin(angulo) * 11, 1.6, pedras[i % 3]);
        }
    }

    c.restore();
}

// ==========================================
// Desenho das comidas (no lugar da maçã). cx, cy = centro; r = raio da maçã
// ==========================================
function desenharComida(c, id, cx, cy, r) {
    const circulo = (x, y, raio, cor) => { c.fillStyle = cor; c.beginPath(); c.arc(x, y, raio, 0, Math.PI * 2); c.fill(); };

    c.save();
    c.lineCap = "round";
    c.lineJoin = "round";

    if (id === "morango") {
        c.fillStyle = "#e5383b";
        c.beginPath();
        c.moveTo(cx, cy + r * 1.1);
        c.bezierCurveTo(cx - r * 1.3, cy + r * 0.2, cx - r * 1.1, cy - r * 0.9, cx, cy - r * 0.7);
        c.bezierCurveTo(cx + r * 1.1, cy - r * 0.9, cx + r * 1.3, cy + r * 0.2, cx, cy + r * 1.1);
        c.fill();
        for (const [x, y] of [[-0.45, -0.2], [0.4, -0.25], [0, 0.1], [-0.3, 0.45], [0.3, 0.45], [0, 0.75]]) {
            circulo(cx + x * r, cy + y * r, r * 0.08, "#ffe066");
        }
        c.fillStyle = "#3f8f2f";
        for (const angulo of [-0.9, 0, 0.9]) {
            c.beginPath();
            c.ellipse(cx + Math.sin(angulo) * r * 0.35, cy - r * 0.8, r * 0.38, r * 0.16, angulo, 0, Math.PI * 2);
            c.fill();
        }
    } else if (id === "cereja") {
        c.strokeStyle = "#5b8a2b";
        c.lineWidth = r * 0.14;
        c.beginPath();
        c.moveTo(cx - r * 0.45, cy + r * 0.2); c.quadraticCurveTo(cx - r * 0.2, cy - r * 0.6, cx + r * 0.2, cy - r * 1.05);
        c.moveTo(cx + r * 0.5, cy + r * 0.35); c.quadraticCurveTo(cx + r * 0.4, cy - r * 0.4, cx + r * 0.2, cy - r * 1.05);
        c.stroke();
        circulo(cx - r * 0.45, cy + r * 0.4, r * 0.52, "#c1121f");
        circulo(cx + r * 0.5, cy + r * 0.55, r * 0.52, "#e5383b");
        circulo(cx - r * 0.6, cy + r * 0.25, r * 0.14, "rgba(255, 255, 255, 0.5)");
        circulo(cx + r * 0.35, cy + r * 0.4, r * 0.14, "rgba(255, 255, 255, 0.5)");
        c.fillStyle = "#3f8f2f";
        c.beginPath(); c.ellipse(cx + r * 0.5, cy - r * 0.95, r * 0.35, r * 0.15, -0.4, 0, Math.PI * 2); c.fill();
    } else if (id === "melancia") {
        const meio = cy - r * 0.35;
        c.fillStyle = "#2d6a4f";
        c.beginPath(); c.arc(cx, meio, r * 1.1, 0, Math.PI); c.fill();
        c.fillStyle = "#b7e4c7";
        c.beginPath(); c.arc(cx, meio, r * 0.95, 0, Math.PI); c.fill();
        c.fillStyle = "#ef476f";
        c.beginPath(); c.arc(cx, meio, r * 0.82, 0, Math.PI); c.fill();
        c.fillStyle = "#1b1b1b";
        for (const [x, y] of [[-0.45, 0.2], [0, 0.35], [0.45, 0.2], [-0.2, 0.55], [0.22, 0.55]]) {
            c.beginPath(); c.ellipse(cx + x * r, meio + y * r, r * 0.07, r * 0.12, 0, 0, Math.PI * 2); c.fill();
        }
    } else if (id === "donut") {
        // é um anel (desenhado com traço grosso): o furo do meio mostra o tabuleiro
        const anel = (largura, cor) => { c.strokeStyle = cor; c.lineWidth = largura; c.beginPath(); c.arc(cx, cy, r * 0.66, 0, Math.PI * 2); c.stroke(); };
        anel(r * 0.78, "#d4a373");
        anel(r * 0.6, "#ff8fab");
        const granulados = ["#ffffff", "#ffd23f", "#4dabf7", "#2ecc71", "#9b5de5"];
        for (let i = 0; i < 9; i++) {
            const angulo = (i / 9) * Math.PI * 2;
            const distancia = r * (i % 2 ? 0.55 : 0.78);
            c.strokeStyle = granulados[i % granulados.length];
            c.lineWidth = r * 0.1;
            c.beginPath();
            c.moveTo(cx + Math.cos(angulo) * distancia, cy + Math.sin(angulo) * distancia);
            c.lineTo(cx + Math.cos(angulo + 0.25) * distancia, cy + Math.sin(angulo + 0.25) * distancia);
            c.stroke();
        }
    } else if (id === "pizza") {
        c.fillStyle = "#ffd166";
        c.beginPath();
        c.moveTo(cx, cy + r * 1.05);
        c.lineTo(cx - r * 0.95, cy - r * 0.6);
        c.quadraticCurveTo(cx, cy - r * 1.05, cx + r * 0.95, cy - r * 0.6);
        c.closePath();
        c.fill();
        c.strokeStyle = "#c97b3a";
        c.lineWidth = r * 0.28;
        c.beginPath();
        c.moveTo(cx - r * 0.95, cy - r * 0.6);
        c.quadraticCurveTo(cx, cy - r * 1.05, cx + r * 0.95, cy - r * 0.6);
        c.stroke();
        for (const [x, y] of [[-0.3, -0.25], [0.3, -0.2], [0, 0.35]]) circulo(cx + x * r, cy + y * r, r * 0.19, "#d62828");
    } else {
        // "maca" e qualquer coisa desconhecida: a maçã de sempre
        circulo(cx, cy, r, "#e7471d");
        circulo(cx - r * 0.4, cy - r * 0.3, r * 0.26, "rgba(255, 255, 255, 0.35)");
        c.strokeStyle = "#5b3a1a";
        c.lineWidth = r * 0.26;
        c.beginPath(); c.moveTo(cx, cy - r + 1); c.lineTo(cx + 1, cy - r - 3); c.stroke();
        c.fillStyle = "#3f8f2f";
        c.beginPath(); c.ellipse(cx + r * 0.53, cy - r - 1, r * 0.46, r * 0.26, -0.5, 0, Math.PI * 2); c.fill();
    }

    c.restore();
}

// a comida do tabuleiro: a escolhida na loja, ou a maçã de sempre
function desenharComidaEquipada(posicao) {
    const id = carteira.equipados.comida;
    if (!id) {
        desenharMaca(posicao.x, posicao.y);
        return;
    }
    const centro = centroDaCasa(posicao);
    desenharComida(ctx, id, centro.x, centro.y + 1, TAMANHO_CELULA * 0.38);
}

// ==========================================
// Padrões do corpo (só no Jogador 1; o Invencível amarelo continua valendo por cima)
// ==========================================
function padraoDoCorpo(jogador) {
    return jogador === jogadores[0] && !jogador.bot && !jogador.invencivel ? carteira.equipados.corpo : null;
}

function corDaCabecaComPadrao(padrao, corCabeca, tempo) {
    if (padrao === "arcoiris") return `hsl(${Math.round(-tempo / 8) % 360}, 90%, 66%)`;
    if (padrao === "zebra") return "#f5f5f5";
    if (padrao === "dourado") return "#ffe27a";
    if (padrao === "magma") return "#3a1712";
    return corCabeca;
}

// cor de cada pedacinho do corpo. distancia = quanto longe da cabeça (as listras andam junto com a cobra)
function corDoPedacoComPadrao(padrao, corCauda, corCabeca, posicao, distancia, tempo) {
    if (padrao === "listras" && Math.floor(distancia / 7) % 2 === 1) {
        return misturarCores(misturarCores6(corCauda, "#000000", 0.35), misturarCores6(corCabeca, "#000000", 0.35), posicao);
    }
    if (padrao === "arcoiris") return `hsl(${Math.round(distancia * 4 - tempo / 8) % 360}, 90%, 62%)`;
    if (padrao === "zebra") return Math.floor(distancia / 6) % 2 === 1 ? "#1b1b1b" : "#f5f5f5";
    if (padrao === "dourado") return misturarCores("#b8860b", "#ffe27a", posicao);
    if (padrao === "magma") {
        const calor = 0.5 + 0.5 * Math.sin(distancia / 9 - tempo / 160); // a lava pulsa e corre pelo corpo
        return `hsl(${Math.round(14 + 30 * calor)}, 100%, ${Math.round(48 + 14 * calor)}%)`;
    }
    return misturarCores(corCauda, corCabeca, posicao);
}

// misturarCores devolve "rgb(...)"; esta devolve "#rrggbb" (pra poder misturar de novo)
function misturarCores6(corA, corB, proporcao) {
    return "#" + [1, 3, 5].map((inicio) => {
        const a = parseInt(corA.slice(inicio, inicio + 2), 16);
        const b = parseInt(corB.slice(inicio, inicio + 2), 16);
        return Math.round(a + (b - a) * proporcao).toString(16).padStart(2, "0");
    }).join("");
}

// contorno neon: um traço borrado embaixo do corpo inteiro
function desenharContornoNeon(c, pontos, largura, cor = "#39ff14") {
    c.save();
    c.strokeStyle = cor;
    c.shadowColor = cor;
    c.shadowBlur = 10;
    c.lineWidth = largura + 5;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    pontos.forEach((ponto, i) => {
        const pulou = i > 0 && Math.hypot(ponto.x - pontos[i - 1].x, ponto.y - pontos[i - 1].y) > TAMANHO_CELULA * 1.5;
        if (i === 0 || pulou) c.moveTo(ponto.x, ponto.y);
        else c.lineTo(ponto.x, ponto.y);
    });
    c.stroke();
    c.restore();
}

// corpo dourado: 3 brilhinhos piscando em pontos do corpo
function desenharBrilhosDourados(c, pontos, tempo) {
    for (let i = 0; i < 3; i++) {
        const intensidade = Math.sin(tempo / 220 + i * 2.1);
        if (intensidade < 0.2) continue;
        const ponto = pontos[Math.min(pontos.length - 1, Math.floor(((i + 1) / 4) * pontos.length))];
        desenharBrilho(c, ponto.x + 2, ponto.y - 3, 3.2 * intensidade, "#ffffff");
    }
}

// cobra de magma: placas de pedra escura por cima da lava; a lava aparece nas rachaduras entre elas.
// pontos: da cabeça pro rabo. As placas são contadas da cabeça, então andam junto com a cobra
function desenharPlacasDeMagma(c, pontos, largura, tempo) {
    let total = 0;
    for (let i = 1; i < pontos.length; i++) {
        const d = Math.hypot(pontos[i].x - pontos[i - 1].x, pontos[i].y - pontos[i - 1].y);
        if (d <= TAMANHO_CELULA * 1.5) total += d;
    }

    const passo = largura * 0.62;
    let andado = 0;
    let proxima = largura * 0.55; // perto da cabeça não tem placa: a cabeça é desenhada depois
    let numero = 0;

    c.save();
    for (let i = 1; i < pontos.length; i++) {
        const de = pontos[i - 1];
        const ate = pontos[i];
        const distancia = Math.hypot(ate.x - de.x, ate.y - de.y);
        if (distancia === 0) continue;
        if (distancia > TAMANHO_CELULA * 1.5) { // atravessou a borda: pula
            proxima = Math.max(proxima, andado + passo / 2);
            continue;
        }

        const dx = (ate.x - de.x) / distancia;
        const dy = (ate.y - de.y) / distancia;
        while (proxima <= andado + distancia && proxima < total - passo * 0.3) {
            const t = (proxima - andado) / distancia;
            const largo = largura * (0.6 + 0.4 * (1 - proxima / total)); // mesma largura do corpo nesse ponto
            desenharPlacaDeMagma(c, de.x + (ate.x - de.x) * t, de.y + (ate.y - de.y) * t, dx, dy, passo, largo, numero++);
            proxima += passo;
        }
        andado += distancia;
    }
    c.restore();
}

// duas placas tortinhas (uma de cada lado do meio do corpo); o tremido vem de sorteioDaCasa, sempre igual pra cada placa
function desenharPlacaDeMagma(c, x, y, dx, dy, comprimento, largura, numero) {
    const nx = -dy;
    const ny = dx;

    for (const lado of [-1, 1]) {
        const centro = { x: x + nx * lado * largura * 0.23, y: y + ny * lado * largura * 0.23 };
        const meiaFrente = comprimento * 0.47;
        const meioLado = largura * 0.23;
        const cantos = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([f, l], canto) => {
            const tremido = (sorteioDaCasa(numero * 2 + (lado + 1), canto) - 0.5) * 0.45;
            const frente = f * meiaFrente * (1 + tremido);
            const de_lado = l * meioLado * (1 - tremido);
            return { x: centro.x + dx * frente + nx * de_lado, y: centro.y + dy * frente + ny * de_lado };
        });

        c.fillStyle = sorteioDaCasa(numero, lado + 1) < 0.5 ? "#2b120d" : "#3a1a13";
        c.beginPath();
        cantos.forEach((canto, indice) => (indice === 0 ? c.moveTo(canto.x, canto.y) : c.lineTo(canto.x, canto.y)));
        c.closePath();
        c.fill();
        c.fillStyle = "rgba(120, 20, 10, 0.55)"; // miolo avermelhado, como pedra quente por dentro
        c.beginPath();
        c.arc(centro.x, centro.y, meioLado * 0.45, 0, Math.PI * 2);
        c.fill();
    }
}

// fagulhas saindo do corpo de magma (só na partida, não na prévia)
let ultimaFagulhaEm = 0;
function soltarFagulhasDeMagma(pontos) {
    if (!jogoAtivo || pausado || contagemAtiva || reduzirMovimento) return;

    const agora = agoraDoJogo();
    if (agora - ultimaFagulhaEm < 70) return;
    ultimaFagulhaEm = agora;

    const ponto = pontos[Math.floor(Math.random() * pontos.length)];
    const fagulha = criarParticula("fogo", ponto.x + (Math.random() - 0.5) * 8, ponto.y + (Math.random() - 0.5) * 8, agora);
    Object.assign(fagulha, { vy: -(25 + Math.random() * 25), vida: 900, tamanho: 1.4 + Math.random() * 1.2 }); // menores e sobem mais que as do rastro
    particulas.push(fagulha);
    if (particulas.length > 150) particulas.shift();
}

// rachaduras de lava na cabeça (no mesmo jeito do desenharCabecaCobra: olhando pra direita), passando longe dos olhos
function desenharRachadurasNaCabeca(c, tempo) {
    const calor = 0.5 + 0.5 * Math.sin(tempo / 160);
    c.save();
    c.strokeStyle = `hsl(${Math.round(20 + 25 * calor)}, 100%, ${Math.round(55 + 10 * calor)}%)`;
    c.shadowColor = "#ff5a14";
    c.shadowBlur = 6;
    c.lineCap = "round";
    c.lineJoin = "round";

    c.lineWidth = 1.6;
    c.beginPath();
    c.ellipse(4, 0, 15, 14, 0, 0, Math.PI * 2); // a borda da cabeça brilha
    c.stroke();

    c.lineWidth = 1.5;
    for (const linha of [
        [[-9, 1], [-2, -2], [5, -1], [9, -6], [16, -6]],
        [[5, -1], [9, 4], [16, 5]],
        [[9, 4], [7, 10]],
        [[-2, -2], [-4, -4]],
    ]) {
        c.beginPath();
        linha.forEach(([x, y], indice) => (indice === 0 ? c.moveTo(x, y) : c.lineTo(x, y)));
        c.stroke();
    }
    c.restore();
}

// estrelinha de 4 pontas
function desenharBrilho(c, x, y, tamanho, cor) {
    c.fillStyle = cor;
    c.beginPath();
    for (let i = 0; i < 8; i++) {
        const angulo = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const raio = i % 2 === 0 ? tamanho : tamanho * 0.35;
        c.lineTo(x + Math.cos(angulo) * raio, y + Math.sin(angulo) * raio);
    }
    c.closePath();
    c.fill();
}

function desenharCoracao(c, x, y, tamanho, cor) {
    c.fillStyle = cor;
    c.beginPath();
    c.moveTo(x, y + tamanho * 0.9);
    c.bezierCurveTo(x - tamanho * 1.4, y - tamanho * 0.1, x - tamanho * 0.6, y - tamanho * 1.1, x, y - tamanho * 0.35);
    c.bezierCurveTo(x + tamanho * 0.6, y - tamanho * 1.1, x + tamanho * 1.4, y - tamanho * 0.1, x, y + tamanho * 0.9);
    c.fill();
}

// ==========================================
// Partículas: rastro e efeito ao comer (só enfeite, não mexem no jogo).
// O tempo é o do jogo (agoraDoJogo): na pausa elas param junto.
// ==========================================
let particulas = [];
let ultimoRastroEm = 0;
const CORES_DO_CONFETE = ["#ff4d6d", "#ffd23f", "#4dabf7", "#2ecc71", "#9b5de5", "#ff8c42"];

function criarParticula(tipo, x, y, agora) {
    const sorteio = (minimo, maximo) => minimo + Math.random() * (maximo - minimo);
    const particula = { tipo, x, y, nasceu: agora, vida: 900, vx: sorteio(-6, 6), vy: sorteio(-6, 6), giro: sorteio(0, 6), tamanho: sorteio(2.2, 3.4), cor: null };

    if (tipo === "bolhas") Object.assign(particula, { vy: sorteio(-16, -8), vida: 1100 });
    if (tipo === "folhas") Object.assign(particula, { vy: sorteio(4, 10), vida: 1200, cor: ["#3f8f2f", "#6ab04c", "#2d6a4f"][Math.floor(Math.random() * 3)] });
    if (tipo === "notas") Object.assign(particula, { vy: sorteio(-14, -8), vida: 1100, cor: ["#9b5de5", "#4dabf7", "#ff4d6d"][Math.floor(Math.random() * 3)] });
    if (tipo === "estrelinhas") Object.assign(particula, { vida: 800, cor: Math.random() < 0.5 ? "#ffe066" : "#ffffff" });
    if (tipo === "fogo") Object.assign(particula, { vy: sorteio(-20, -10), vida: 650, tamanho: sorteio(3, 4.5) });
    return particula;
}

// chamado a cada quadro pelo desenhar: o rastro sai do rabo do Jogador 1
function atualizarRastro() {
    const id = carteira.equipados.rastro;
    const jogador = jogadores[0];
    if (!id || !jogador || jogador.bot || !jogoAtivo || pausado || contagemAtiva || reduzirMovimento) return;

    const agora = agoraDoJogo();
    if (agora - ultimoRastroEm < 90) return;
    ultimoRastroEm = agora;

    const rabo = centroDaCasa(jogador.cobra[jogador.cobra.length - 1]);
    particulas.push(criarParticula(id, rabo.x + (Math.random() - 0.5) * 8, rabo.y + (Math.random() - 0.5) * 8, agora));
    if (particulas.length > 150) particulas.shift();
}

// chamado no comerAlimento: estouro de confete, corações ou estrelas em volta da cabeça
function soltarEfeitoAoComer(casa) {
    const id = carteira.equipados.efeito;
    if (!id || reduzirMovimento) return;

    const centro = centroDaCasa(casa);
    const agora = agoraDoJogo();
    for (let i = 0; i < 14; i++) {
        const angulo = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
        const velocidade = 35 + Math.random() * 45;
        particulas.push({
            tipo: id, x: centro.x, y: centro.y, nasceu: agora, vida: 750,
            vx: Math.cos(angulo) * velocidade, vy: Math.sin(angulo) * velocidade - 15,
            giro: Math.random() * 6, tamanho: id === "confete" ? 2.4 : 3,
            cor: id === "confete" ? CORES_DO_CONFETE[i % CORES_DO_CONFETE.length] : null,
        });
    }
}

function desenharParticulas() {
    const agora = agoraDoJogo();
    particulas = particulas.filter((particula) => agora - particula.nasceu < particula.vida && agora >= particula.nasceu);
    for (const particula of particulas) desenharParticula(ctx, particula, agora - particula.nasceu);
}

// idade em ms; cada tipo tem seu jeito de andar e sumir
function desenharParticula(c, p, idade) {
    const t = idade / 1000;
    const vida = idade / p.vida; // 0 = nasceu, 1 = sumiu
    const gravidade = p.tipo === "confete" ? 90 : 0;
    const x = p.x + p.vx * t;
    const y = p.y + p.vy * t + 0.5 * gravidade * t * t;

    c.save();
    c.globalAlpha = Math.max(0, 1 - vida);

    if (p.tipo === "bolhas") {
        c.strokeStyle = "rgba(190, 230, 255, 0.95)";
        c.lineWidth = 1;
        c.beginPath(); c.arc(x, y, p.tamanho, 0, Math.PI * 2); c.stroke();
        c.fillStyle = "rgba(255, 255, 255, 0.8)";
        c.beginPath(); c.arc(x - p.tamanho * 0.35, y - p.tamanho * 0.35, p.tamanho * 0.3, 0, Math.PI * 2); c.fill();
    } else if (p.tipo === "folhas") {
        c.fillStyle = p.cor;
        c.beginPath(); c.ellipse(x, y, p.tamanho, p.tamanho * 0.5, p.giro + t * 3, 0, Math.PI * 2); c.fill();
    } else if (p.tipo === "notas") {
        c.fillStyle = p.cor;
        c.font = `bold ${Math.round(p.tamanho * 3.2)}px sans-serif`;
        c.textAlign = "center";
        c.fillText(p.giro > 3 ? "♪" : "♫", x, y);
    } else if (p.tipo === "estrelinhas" || p.tipo === "estrelas") {
        const pisca = 0.6 + 0.4 * Math.sin(idade / 60 + p.giro);
        desenharBrilho(c, x, y, p.tamanho * (p.tipo === "estrelas" ? 1.3 : 1) * pisca, p.cor || "#ffe066");
    } else if (p.tipo === "fogo") {
        const tamanho = p.tamanho * (1 - vida * 0.7);
        c.fillStyle = vida < 0.3 ? "#ffe066" : vida < 0.6 ? "#ff8c42" : "#e5383b";
        c.beginPath(); c.arc(x, y, tamanho, 0, Math.PI * 2); c.fill();
    } else if (p.tipo === "confete") {
        c.translate(x, y);
        c.rotate(p.giro + t * 8);
        c.fillStyle = p.cor;
        c.fillRect(-p.tamanho, -p.tamanho * 0.45, p.tamanho * 2, p.tamanho * 0.9);
    } else if (p.tipo === "coracoes") {
        desenharCoracao(c, x, y, p.tamanho, "#ff4d8d");
    }

    c.restore();
}

// ==========================================
// Tabuleiros da loja: cores + enfeites fixos em algumas casas (sempre nas mesmas)
// ==========================================
function tabuleiroDaLoja() {
    const id = carteira.equipados.tabuleiro;
    return id ? ITENS_DA_LOJA.find((item) => item.id === id) : null;
}

// número de 0 a 1 que é sempre o mesmo pra mesma casa
function sorteioDaCasa(coluna, linha) {
    const numero = Math.imul(coluna + 1, 73856093) ^ Math.imul(linha + 1, 19349663);
    return ((numero >>> 0) % 1000) / 1000;
}

// densidade: na prévia da loja (3 casas) os enfeites aparecem mais, pra dar pra ver
function desenharDecoracaoDoTabuleiro(c, tema, colunas, linhas, lado, tempo, densidade = 1) {
    if (!tema || !tema.decoracao) return;

    c.save();
    for (let linha = 0; linha < linhas; linha++) {
        for (let coluna = 0; coluna < colunas; coluna++) {
            const sorteio = sorteioDaCasa(coluna, linha) / densidade;
            const x = coluna * lado + lado * (0.25 + sorteioDaCasa(linha, coluna) * 0.5);
            const y = linha * lado + lado * (0.25 + sorteio * 0.5);
            const escala = lado / 20;

            if (tema.id === "praia") {
                if (sorteio < 0.07) { // conchinha
                    c.fillStyle = "#f4a6a6";
                    c.beginPath(); c.arc(x, y, 3 * escala, Math.PI, 0); c.closePath(); c.fill();
                    c.strokeStyle = "#e07a7a"; c.lineWidth = 0.6 * escala;
                    for (const dx of [-1.5, 0, 1.5]) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + dx * escala, y - 2.6 * escala); c.stroke(); }
                } else if (sorteio < 0.11) { // estrela-do-mar
                    desenharBrilho(c, x, y, 3.4 * escala, "#ff9f43");
                } else if (sorteio < 0.3) { // grãozinho de areia
                    c.fillStyle = "rgba(160, 120, 60, 0.25)";
                    c.beginPath(); c.arc(x, y, 0.8 * escala, 0, Math.PI * 2); c.fill();
                }
            } else if (tema.id === "doces") {
                if (sorteio < 0.35) { // granulado
                    c.strokeStyle = CORES_DO_CONFETE[Math.floor(sorteio * 100) % CORES_DO_CONFETE.length];
                    c.lineWidth = 1.4 * escala;
                    c.lineCap = "round";
                    const angulo = sorteio * 20;
                    c.beginPath();
                    c.moveTo(x - Math.cos(angulo) * 2 * escala, y - Math.sin(angulo) * 2 * escala);
                    c.lineTo(x + Math.cos(angulo) * 2 * escala, y + Math.sin(angulo) * 2 * escala);
                    c.stroke();
                }
            } else if (tema.id === "espaco") {
                if (sorteio < 0.02) { // planetinha com anel
                    c.fillStyle = "#9b5de5";
                    c.beginPath(); c.arc(x, y, 3 * escala, 0, Math.PI * 2); c.fill();
                    c.strokeStyle = "#f9c74f"; c.lineWidth = 0.8 * escala;
                    c.beginPath(); c.ellipse(x, y, 5 * escala, 1.5 * escala, -0.4, 0, Math.PI * 2); c.stroke();
                } else if (sorteio < 0.4) { // estrela (algumas piscam)
                    const pisca = sorteio < 0.1 ? 0.5 + 0.5 * Math.sin(tempo / 400 + sorteio * 50) : 1;
                    c.fillStyle = `rgba(255, 255, 255, ${0.35 + 0.6 * pisca * sorteio * 2.5})`;
                    c.beginPath(); c.arc(x, y, (0.5 + sorteio) * escala, 0, Math.PI * 2); c.fill();
                }
            } else if (tema.id === "lava") {
                if (sorteio < 0.18) { // rachadura brilhando
                    const brilho = 0.55 + 0.45 * Math.sin(tempo / 500 + sorteio * 40);
                    c.strokeStyle = `rgba(255, ${Math.round(110 + 60 * brilho)}, 40, ${0.5 + 0.5 * brilho})`;
                    c.lineWidth = 1.3 * escala;
                    c.lineCap = "round";
                    c.beginPath();
                    c.moveTo(x - 4 * escala, y - 2 * escala);
                    c.lineTo(x - 1 * escala, y + 1 * escala);
                    c.lineTo(x + 2 * escala, y - 1 * escala);
                    c.lineTo(x + 4 * escala, y + 2.5 * escala);
                    c.stroke();
                } else if (sorteio < 0.24) {
                    c.fillStyle = "rgba(255, 140, 66, 0.7)";
                    c.beginPath(); c.arc(x, y, 1 * escala, 0, Math.PI * 2); c.fill();
                }
            }
        }
    }
    c.restore();
}

// ==========================================
// Prévias da loja (num canvas pequeno, sem mexer no tabuleiro do jogo)
// ==========================================
function desenharGramaDePrevia(c, lado) {
    for (let linha = 0; linha < 3; linha++) {
        for (let coluna = 0; coluna < 3; coluna++) {
            c.fillStyle = (linha + coluna) % 2 === 0 ? "#aad751" : "#a2d149";
            c.fillRect(coluna * (lado / 3), linha * (lado / 3), lado / 3, lado / 3);
        }
    }
}

// um pedaço de cobra em "S" com o padrão, e a cabeça na ponta
function desenharCorpoDePrevia(c, padrao, tempo) {
    const caminho = [{ x: 10, y: 54 }, { x: 34, y: 54 }, { x: 34, y: 26 }, { x: 54, y: 26 }];
    const pontos = [];
    for (let i = 0; i < caminho.length - 1; i++) {
        for (let passo = 0; passo < 24; passo++) {
            const t = passo / 24;
            pontos.push({ x: caminho[i].x + (caminho[i + 1].x - caminho[i].x) * t, y: caminho[i].y + (caminho[i + 1].y - caminho[i].y) * t });
        }
    }
    pontos.push(caminho[caminho.length - 1]);

    const cor = corDaCobra();
    if (padrao === "neon") desenharContornoNeon(c, pontos, 13);
    if (padrao === "magma") desenharContornoNeon(c, pontos, 13, "#ff5a14");

    c.lineCap = "round";
    const total = pontos.length - 1;
    for (let i = 0; i < total; i++) {
        const posicao = i / total;
        c.strokeStyle = corDoPedacoComPadrao(padrao, cor.corpo, cor.cabeca, posicao, (total - i) * 0.9, tempo);
        c.lineWidth = 13 * (0.6 + 0.4 * posicao);
        c.beginPath(); c.moveTo(pontos[i].x, pontos[i].y); c.lineTo(pontos[i + 1].x, pontos[i + 1].y); c.stroke();
    }
    if (padrao === "dourado") desenharBrilhosDourados(c, pontos, 300);
    if (padrao === "magma") {
        desenharPlacasDeMagma(c, [...pontos].reverse(), 13, 0); // aqui o caminho vai do rabo pra cabeça
        [[14, 40, 0.3], [30, 34, 0.55], [22, 30, 0.75], [44, 14, 0.4]].forEach(([x, y, idade]) =>
            desenharParticula(c, { tipo: "fogo", x, y, nasceu: 0, vida: 650, vx: 0, vy: -20, giro: 0, tamanho: 2.2, cor: null }, 650 * idade));
    }

    c.save();
    c.translate(56, 26);
    c.scale(0.75, 0.75);
    desenharCabecaCobra(corDaCabecaComPadrao(padrao, cor.cabeca, tempo), c);
    if (padrao === "magma") desenharRachadurasNaCabeca(c, 0);
    c.restore();
}

// rastro: a cabeça à direita e partículas "congeladas" atrás dela
function desenharRastroDePrevia(c, tipo) {
    const antigo = Math.random;
    let semente = 7;
    Math.random = () => ((semente = (semente * 16807) % 2147483647) / 2147483647); // sempre o mesmo desenho
    for (let i = 0; i < 9; i++) {
        const particula = criarParticula(tipo, 12 + i * 4.5, 36 + Math.sin(i) * 6, 0);
        desenharParticula(c, { ...particula, tamanho: particula.tamanho * 1.3 }, particula.vida * (0.75 - i * 0.07));
    }
    Math.random = antigo;

    c.save();
    c.translate(54, 36);
    c.scale(0.8, 0.8);
    desenharCabecaCobra(corDaCobra().cabeca, c);
    c.restore();
}

// efeito: a comida no meio e o estouro em volta
function desenharEfeitoDePrevia(c, tipo) {
    desenharComida(c, carteira.equipados.comida || "maca", 36, 38, 11);
    for (let i = 0; i < 12; i++) {
        const angulo = (i / 12) * Math.PI * 2;
        desenharParticula(c, {
            tipo, x: 36, y: 36, nasceu: 0, vida: 750, vx: Math.cos(angulo) * 90, vy: Math.sin(angulo) * 90,
            giro: i, tamanho: tipo === "confete" ? 3.4 : 4.4, cor: tipo === "confete" ? CORES_DO_CONFETE[i % CORES_DO_CONFETE.length] : null,
        }, 260);
    }
}
