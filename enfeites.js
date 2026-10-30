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
    } else if (id === "mascara") {
        desenharMascaraDeFerro(c, tempo); // logo abaixo, fora do desenharChapeu
    } else if (id === "bruxa") {
        desenharChapeuDeBruxa(c, tempo); // no fim do arquivo (Halloween)
    } else if (id === "gorro") {
        desenharGorroDePapaiNoel(c, tempo); // no fim do arquivo (Natal)
    } else if (id === "baile") {
        desenharMascaraDeBaile(c, tempo); // no fim do arquivo (Carnaval)
    } else if (id === "orelhas") {
        desenharOrelhasDeCoelho(c, tempo); // no fim do arquivo (Páscoa)
    } else if (id === "palha") {
        desenharChapeuDePalha(c, tempo); // no fim do arquivo (Festa Junina)
    }

    c.restore();
}

// ==========================================
// Máscara de ferro (chapéu da conquista "Última de pé"), estilo gibi anos 80;
// nanquim grosso, cor chapada, sombra em bloco e retícula. As formas são caminhos
// SVG num Path2D, criados uma vez só; os pontinhos da retícula também.
// Os olhos pulsam e a estrelinha da testa pisca.
// ==========================================
let formasDaMascara = null;

function criarFormasDaMascara() {
    const reticula = (x0, y0, x1, y1, passo, raio) => {
        const pontos = new Path2D();
        for (let y = y0; y <= y1; y += passo) {
            for (let x = x0; x <= x1; x += passo) {
                pontos.moveTo(x + raio, y);
                pontos.arc(x, y, raio, 0, Math.PI * 2);
            }
        }
        return pontos;
    };
    const rebites = new Path2D();
    for (const [x, y] of [[-9.6, 10.6], [-2, 13.9], [8, 12.6], [14.6, 8.2], [-12, 8]]) {
        for (const lado of [-1, 1]) {
            rebites.moveTo(x + 0.65, y * lado);
            rebites.arc(x, y * lado, 0.65, 0, Math.PI * 2);
        }
    }

    return {
        capuz: new Path2D("M14 -16 C8 -22 -6 -25 -18 -22 C-26 -19 -30 -13 -31 -7 L-28 -4 L-32 0 L-28 3 L-31 7 C-30 13 -26 19 -18 22 C-6 25 8 22 14 16 Z"),
        sombraDoCapuz: new Path2D("M-40 -1 L20 -5 L20 -30 L-40 -30 Z"),
        reticulaDoCapuz: reticula(-32, -25, 15, -1, 1.6, 0.45),
        dobras: new Path2D("M-19 -15 L-28 -10 M-19 15 L-28 10"),
        luzDoCapuz: new Path2D("M10 20 C0 23.4 -10 23 -18 20.5"),
        rosto: new Path2D("M-12 -12 L-14 -4 L-11 0 L-14 4 L-12 12 L-4 15.5 L6 14.5 L14 10 L20 4 L20 -4 L14 -10 L6 -14.5 L-4 -15.5 Z"),
        sombraDoRosto: new Path2D("M-20 0.2 L30 0.2 L30 -20 L-20 -20 Z"),
        reticulaDoRosto: reticula(-14, -16, 20, 0, 1.5, 0.42),
        queixo: new Path2D("M10.5 0.2 L30 0.2 L30 20 L10.5 20 Z"),
        brilhoDaTesta: new Path2D("M-12.6 10.8 L-13.4 5 L-9.4 6.6 L-6.6 12.8 Z"),
        brilhoDaBochecha: new Path2D("M1.5 13.2 L9 11.8"),
        emendas: new Path2D("M1 5.5 L9.5 12.5 M1 -5.5 L9.5 -12.5 M10 -11.5 Q12 0 10 11.5"),
        sobrancelhaClara: new Path2D("M-5.5 1.6 L-10.5 13 L-8 14.6 L-3.2 2.8 Z"),
        sobrancelhaEscura: new Path2D("M-5.5 -1.6 L-10.5 -13 L-8 -14.6 L-3.2 -2.8 Z"),
        olhos: new Path2D("M-3 3.4 L-7.2 12.4 L-3.4 13.6 L0.5 4 Z M-3 -3.4 L-7.2 -12.4 L-3.4 -13.6 L0.5 -4 Z"),
        brilhoDosOlhos: new Path2D("M-2.6 5.4 L-4.8 10.6 L-3.6 11 L-1.4 5.8 Z M-2.6 -5.4 L-4.8 -10.6 L-3.6 -11 L-1.4 -5.8 Z"),
        narizClaro: new Path2D("M-11 0 L6 2.6 L9.5 0 Z"),
        narizEscuro: new Path2D("M-11 0 L6 -2.6 L9.5 0 Z"),
        nariz: new Path2D("M-11 0 L6 -2.6 L9.5 0 L6 2.6 Z"),
        rebites,
        estrela: new Path2D("M-10.5 4.6 L-9.8 6.3 L-8.1 7 L-9.8 7.7 L-10.5 9.4 L-11.2 7.7 L-12.9 7 L-11.2 6.3 Z"),
    };
}

function desenharMascaraDeFerro(c, tempo) {
    if (!formasDaMascara) formasDaMascara = criarFormasDaMascara();
    const f = formasDaMascara;
    const TINTA = "#141414";
    const pintar = (forma, cor) => { c.fillStyle = cor; c.fill(forma); };
    const riscar = (forma, cor, largura) => { c.strokeStyle = cor; c.lineWidth = largura; c.stroke(forma); };

    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";

    // capuz curto verde, com a sombra em bloco e retícula
    pintar(f.capuz, "#2fb04f");
    c.save();
    c.clip(f.capuz);
    pintar(f.sombraDoCapuz, "#14702f");
    riscar(f.dobras, TINTA, 1);
    riscar(f.luzDoCapuz, "#b8f5c6", 1.5);
    c.clip(f.sombraDoCapuz);
    pintar(f.reticulaDoCapuz, "#06331a");
    c.restore();
    riscar(f.capuz, TINTA, 2);

    // vão preto entre o capuz e a máscara
    c.fillStyle = "#0d0d0d";
    c.beginPath(); c.ellipse(3, 0, 18, 17.4, 0, 0, Math.PI * 2); c.fill();

    // a máscara: aço claro, um lado em sombra com retícula, queixo meio-tom
    pintar(f.rosto, "#cbd8e6");
    c.save();
    c.clip(f.rosto);
    pintar(f.queixo, "#9fb3c9");
    pintar(f.brilhoDaTesta, "#ffffff");
    riscar(f.brilhoDaBochecha, "#ffffff", 1.2);
    pintar(f.sombraDoRosto, "#6c84a3");
    c.clip(f.sombraDoRosto);
    pintar(f.reticulaDoRosto, "#22324d");
    c.restore();
    riscar(f.rosto, TINTA, 2);
    riscar(f.emendas, TINTA, 1.1);

    // sobrancelhas de aço (cara de brava)
    pintar(f.sobrancelhaClara, "#eef4fa");
    pintar(f.sobrancelhaEscura, "#4f6787");
    riscar(f.sobrancelhaClara, TINTA, 1.2);
    riscar(f.sobrancelhaEscura, TINTA, 1.2);

    // olhos acesos que pulsam
    const pulso = 0.5 + 0.5 * Math.sin(tempo / 260);
    c.globalAlpha = 0.2 + 0.35 * pulso;
    riscar(f.olhos, "#ffe23a", 2.2 + 1.8 * pulso);
    c.globalAlpha = 1;
    pintar(f.olhos, pulso > 0.6 ? "#fff07a" : "#ffe23a");
    riscar(f.olhos, TINTA, 1.1);
    pintar(f.brilhoDosOlhos, "#fffbe0");

    // nariz: metade na luz, metade na sombra
    pintar(f.narizClaro, "#f2f7fb");
    pintar(f.narizEscuro, "#586f8f");
    riscar(f.nariz, TINTA, 1.1);

    // grade na boca e rebites
    c.fillStyle = TINTA;
    c.fillRect(12.2, -5.7, 6.2, 1.5);
    c.fillRect(12.2, -2.6, 6.4, 1.5);
    c.fillRect(12.2, 0.5, 6.4, 1.5);
    c.fillRect(12.2, 3.6, 6.2, 1.5);
    c.fill(f.rebites);

    // estrelinha de brilho na testa, piscando
    const piscada = 0.55 + 0.45 * Math.abs(Math.sin(tempo / 380));
    c.translate(-10.5, 7);
    c.scale(piscada, piscada);
    c.translate(10.5, -7);
    pintar(f.estrela, "#ffffff");
    riscar(f.estrela, TINTA, 0.45 / piscada);

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
    } else if (id === "abobora") {
        desenharAbobora(c, cx, cy, r, performance.now()); // comida do Halloween (no fim do arquivo)
    } else if (id === "panetone") {
        desenharPanetone(c, cx, cy, r); // comida do Natal (no fim do arquivo)
    } else if (id === "algodao") {
        desenharAlgodaoDoce(c, cx, cy, r); // comida do Carnaval (no fim do arquivo)
    } else if (id === "ovoDeChocolate") {
        desenharOvoDeChocolate(c, cx, cy, r); // comida da Páscoa (no fim do arquivo)
    } else if (id === "milho") {
        desenharMilho(c, cx, cy, r); // comida da Festa Junina (no fim do arquivo)
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

// a comida do tabuleiro: a da época (Halloween...), a escolhida na loja, ou a maçã de sempre
function desenharComidaEquipada(posicao) {
    const id = epocaAtual && enfeitesDeEpoca ? epocaAtual.comida : carteira.equipados.comida;
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
    return jogador.numero === 1 && !jogador.bot && !jogador.invencivel ? carteira.equipados.corpo : null;
}

function corDaCabecaComPadrao(padrao, corCabeca, tempo) {
    if (padrao === "arcoiris") return `hsl(${Math.round(-tempo / 8) % 360}, 90%, 66%)`;
    if (padrao === "zebra") return "#f5f5f5";
    if (padrao === "dourado") return "#ffe27a";
    if (padrao === "magma") return "#3a1712";
    if (padrao === "esqueleto") return "#ece5d3"; // caveira
    if (padrao === "piscaPisca") return "#3c9a5c";
    if (padrao === "lantejoulas") return "#6a1fa0";
    if (padrao === "chocolate") return "#7b4320";
    if (padrao === "xadrez") return "#e74c3c";
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
    if (padrao === "esqueleto") return misturarCores("#1d1a29", "#2e2a40", posicao);
    if (padrao === "piscaPisca") return misturarCores("#1f6b3e", "#3c9a5c", posicao); // verde de pinheiro
    if (padrao === "lantejoulas") return misturarCores("#3d1466", "#6a1fa0", posicao);
    if (padrao === "chocolate") return misturarCores("#3f1f0e", "#7b4320", posicao);
    if (padrao === "xadrez") return misturarCores("#a8281c", "#e74c3c", posicao);
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
    if (tipo === "morcegos") Object.assign(particula, { vx: sorteio(-18, 18), vy: sorteio(-34, -20), vida: 1000, tamanho: sorteio(5, 6.5) });
    if (tipo === "flocos") Object.assign(particula, { vx: sorteio(-22, 22), vy: sorteio(-8, 22), vida: 1400, tamanho: sorteio(3.6, 5) });
    if (tipo === "serpentinas") Object.assign(particula, { vx: sorteio(-30, 30), vy: sorteio(-40, -15), vida: 1100, tamanho: sorteio(5.5, 7), cor: CORES_DO_CARNAVAL[Math.floor(Math.random() * 5)] });
    if (tipo === "ovinhos") Object.assign(particula, { vx: sorteio(-25, 25), vy: sorteio(-45, -25), vida: 1000, tamanho: sorteio(3.6, 4.6), cor: CORES_DOS_OVINHOS[Math.floor(Math.random() * 5)] });
    if (tipo === "pipoca") Object.assign(particula, { vx: sorteio(-30, 30), vy: sorteio(-60, -35), vida: 900, tamanho: sorteio(3.4, 4.2) });
    if (tipo === "faiscas") Object.assign(particula, { vx: sorteio(-70, 70), vy: sorteio(-70, 20), vida: 500, tamanho: sorteio(2.5, 3.5), cor: Math.random() < 0.5 ? "#ffe066" : "#ffffff" });
    return particula;
}

// chamado a cada quadro pelo desenhar: o rastro sai do rabo do Jogador 1
function atualizarRastro() {
    const id = carteira.equipados.rastro;
    const jogador = jogadores.find((outro) => outro.numero === 1); // se o Jogador 1 saiu, o rastro some junto
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
    const gravidade = p.tipo === "confete" ? 90 : p.tipo === "ovinhos" ? 120 : p.tipo === "pipoca" ? 160 : p.tipo === "estilhaco" || p.tipo === "gelo" ? 260 : 0;
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
    } else if (p.tipo === "faiscas") { // risco na direção em que voa (laranja por fora, claro por dentro) com um brilho na ponta
        c.lineCap = "round";
        for (const [largura, cor] of [[1.6, "#ff7b00"], [0.7, p.cor || "#ffe066"]]) {
            c.strokeStyle = cor;
            c.lineWidth = p.tamanho * largura;
            c.beginPath(); c.moveTo(x - p.vx * 0.08, y - p.vy * 0.08); c.lineTo(x, y); c.stroke();
        }
        desenharBrilho(c, x, y, p.tamanho * 1.3, "#fff6c2");
    } else if (p.tipo === "estilhaco") { // pedaço de pedra
        c.translate(x, y);
        c.rotate(p.giro + t * 10);
        c.fillStyle = "#6b6f78";
        c.fillRect(-p.tamanho, -p.tamanho * 0.7, p.tamanho * 2, p.tamanho * 1.4);
    } else if (p.tipo === "gelo") { // caco de gelo
        c.translate(x, y);
        c.rotate(p.giro + t * 8);
        c.fillStyle = "rgba(210, 240, 255, 0.95)";
        c.beginPath(); c.moveTo(0, -p.tamanho * 1.4); c.lineTo(p.tamanho, p.tamanho); c.lineTo(-p.tamanho, p.tamanho * 0.6); c.closePath(); c.fill();
    } else if (p.tipo === "morcegos") {
        desenharMorceguinho(c, x, y, p.tamanho, idade, p.giro);
    } else if (p.tipo === "flocos") {
        desenharFlocoDoRastro(c, x, y, p.tamanho, p.giro + idade / 700);
    } else if (p.tipo === "serpentinas") {
        desenharSerpentina(c, x, y, p.tamanho, p.giro + idade / 300, p.cor);
    } else if (p.tipo === "ovinhos") {
        desenharOvinho(c, x, y, p.tamanho, p.cor, p.giro + idade / 250);
    } else if (p.tipo === "pipoca") {
        desenharPipoca(c, x, y, p.tamanho, p.giro + idade / 200);
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
            } else if (tema.id === "abismo") {
                if (sorteio < 0.03) { // bolhinha subindo dentro da casa
                    const subida = (tempo / 3200 + sorteio * 30) % 1;
                    c.strokeStyle = `rgba(170, 200, 255, ${0.5 * (1 - subida)})`;
                    c.lineWidth = 0.8 * escala;
                    c.beginPath(); c.arc(x, linha * lado + lado * (0.9 - subida * 0.8), (1.2 + sorteio * 25) * escala, 0, Math.PI * 2); c.stroke();
                } else if (sorteio < 0.16) { // plâncton: pontinho que acende e apaga devagar
                    const brilho = Math.max(0, Math.sin(tempo / 1100 + sorteio * 80));
                    const [r, g, b] = corDaPaleta(PALETA_DA_SOMBRA, (sorteio * 7) % 1);
                    c.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.15 + 0.45 * brilho})`;
                    c.beginPath(); c.arc(x, y, (0.6 + brilho * 0.6) * escala, 0, Math.PI * 2); c.fill();
                }
            } else if (tema.id === "halloween") {
                desenharEnfeiteDoHalloween(c, x, y, sorteio, escala, tempo); // no fim do arquivo
            } else if (tema.id === "natal") {
                desenharEnfeiteDoNatal(c, x, y, sorteio, escala); // no fim do arquivo
            } else if (tema.id === "carnaval") {
                desenharEnfeiteDoCarnaval(c, x, y, sorteio, escala); // no fim do arquivo
            } else if (tema.id === "pascoa") {
                desenharEnfeiteDaPascoa(c, x, y, sorteio, escala); // no fim do arquivo
            } else if (tema.id === "junina") {
                desenharEnfeiteJunino(c, x, y, sorteio, escala, tempo); // no fim do arquivo
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
    if (tema.id === "halloween") desenharTeiasDosCantos(c, colunas * lado, linhas * lado, lado, tempo);
    if (tema.id === "natal") desenharNeveEPiscaPisca(c, colunas * lado, linhas * lado, lado, tempo);
    if (tema.id === "carnaval") desenharConfeteCaindo(c, colunas * lado, linhas * lado, lado, tempo);
    if (tema.id === "junina") desenharBandeirinhas(c, colunas * lado, linhas * lado, lado, tempo);
    if (tema.fogos && !reduzirMovimento) desenharFogosDaVirada(c, colunas * lado, linhas * lado, lado, tempo); // 31/12 e 1/1
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
    if (padrao === "espectro") { // estilo "aura": desenho próprio (aqui o caminho vai do rabo pra cabeça)
        desenharSombraViva(c, [...pontos].reverse(), { x: 1, y: 0 }, 13, 0, PALETA_DA_SOMBRA);
        return;
    }
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
    if (padrao === "esqueleto") desenharOssosDoEsqueleto(c, [...pontos].reverse(), 13); // aqui o caminho vai do rabo pra cabeça
    if (padrao === "piscaPisca") desenharLuzesDoPiscaPisca(c, [...pontos].reverse(), 13, tempo);
    if (padrao === "lantejoulas") desenharLantejoulas(c, [...pontos].reverse(), 13, tempo);
    if (padrao === "chocolate") desenharBrilhoDeChocolate(c, [...pontos].reverse(), 13);
    if (padrao === "xadrez") desenharXadrez(c, [...pontos].reverse(), 13);
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
    if (padrao === "esqueleto") desenharDentesDaCaveira(c);
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

// ==========================================
// Estilo "aura": o chefão do modo Chefão ("os olhos que emergem") e o corpo "Espectro" da loja.
// Corpo escuro de borda macia e granulado, aura colorida em volta, o rabo sumindo como fumaça e só os olhos acesos
// ==========================================
const PALETA_DA_SOMBRA = [[70, 160, 255], [120, 90, 255], [255, 70, 170], [255, 190, 60]]; // azul, roxo, rosa, amarelo (da cabeça pro rabo)
const PALETA_DO_CHEFAO = [[255, 70, 70], [230, 40, 150], [120, 50, 230], [50, 25, 110]]; // vermelho, magenta, roxo, roxo-escuro

function corDaPaleta(paleta, t) {
    const x = Math.min(0.999, Math.max(0, t)) * (paleta.length - 1);
    const a = paleta[Math.floor(x)];
    const b = paleta[Math.floor(x) + 1];
    const u = x - Math.floor(x);
    return a.map((valor, k) => Math.round(valor + (b[k] - valor) * u));
}

// pontos: da cabeça pro rabo · direcao: pra onde a cabeça olha ({ x, y }) · largura: do corpo perto da cabeça.
// Tudo direto no tabuleiro, sem desfoque nem rascunho (os dois pesavam: travava o jogo).
// O borrado da aura vem de várias camadas transparentes, uma dentro da outra; o granulado são pontinhos espalhados
function desenharSombraViva(c, pontos, direcao, largura, tempo, paleta) {
    const escala = Math.hypot(c.getTransform().a, c.getTransform().b);
    const total = pontos.length - 1;
    const larguraEm = (i) => largura * (0.55 + 0.45 * (1 - i / Math.max(1, total)));
    const pulou = (i) => Math.hypot(pontos[i].x - pontos[i - 1].x, pontos[i].y - pontos[i - 1].y) > TAMANHO_CELULA * 1.5;
    const traco = (i) => { c.beginPath(); c.moveTo(pontos[i].x, pontos[i].y); c.lineTo(pontos[i - 1].x, pontos[i - 1].y); c.stroke(); };
    const tamanhoDaCabeca = largura / 19;
    const cabeca = (desenhar) => {
        c.save();
        c.translate(pontos[0].x, pontos[0].y);
        c.rotate(Math.atan2(direcao.y, direcao.x));
        c.scale(tamanhoDaCabeca, tamanhoDaCabeca);
        desenhar();
        c.restore();
    };
    const formaDaCabeca = () => {
        c.beginPath();
        c.ellipse(2, 0, 13, 11.5, 0, 0, Math.PI * 2);
        for (const lado of [-1, 1]) {
            c.moveTo(-4, lado * 8);
            c.quadraticCurveTo(-10, lado * 15, -16, lado * 15);
            c.quadraticCurveTo(-11, lado * 9, -9, lado * 4);
            c.closePath();
        }
    };

    c.save();
    c.lineCap = "round";
    c.lineJoin = "round";

    // 1) aura colorida: 4 camadas transparentes (a de fora mais larga e mais fraca), pulsando devagar
    for (const [camada, forca] of [[2.9, 0.12], [2.4, 0.16], [1.95, 0.22], [1.55, 0.3]]) {
        for (let i = total; i >= 1; i--) {
            if (pulou(i)) continue;
            const [r, g, b] = corDaPaleta(paleta, i / Math.max(1, total));
            const pulso = reduzirMovimento ? 0.85 : 0.75 + 0.25 * Math.sin(tempo / 300 - i / 2);
            c.strokeStyle = `rgba(${r}, ${g}, ${b}, ${forca * pulso})`;
            c.lineWidth = larguraEm(i) * camada;
            traco(i);
        }
    }

    // 2) o corpo: uma beirada meio transparente (borda macia) e o escuro por dentro; o rabo some como fumaça
    for (const [camada, forca] of [[1.15, 0.45], [0.95, 0.95]]) {
        for (let i = total; i >= 1; i--) {
            if (pulou(i)) continue;
            c.strokeStyle = `rgba(10, 8, 22, ${forca * Math.min(1, (total - i + 1) / 3)})`;
            c.lineWidth = larguraEm(i) * camada;
            traco(i);
        }
    }
    cabeca(() => { formaDaCabeca(); c.fillStyle = "rgba(10, 8, 22, 0.97)"; c.fill(); });

    // 3) granulado: pontinhos claros e escuros espalhados no corpo e na aura, que mudam um pouco a cada 120 ms.
    // Cada cor é um caminho só, pintado de uma vez (bem mais leve que pintar com "tinta" de imagem)
    const lampejo = reduzirMovimento ? 0 : Math.floor(tempo / 120);
    const grao = Math.max(0.6, 1 / escala);
    const claros = new Path2D();
    const escuros = new Path2D();
    for (let i = total; i >= 1; i--) {
        if (pulou(i)) continue;
        const de = pontos[i];
        const ate = pontos[i - 1];
        const comprimento = Math.hypot(ate.x - de.x, ate.y - de.y) || 1;
        const nx = -(ate.y - de.y) / comprimento;
        const ny = (ate.x - de.x) / comprimento;
        const quantos = Math.ceil(comprimento * larguraEm(i) / 14);
        for (let k = 0; k < quantos; k++) {
            const t = sorteioDaCasa(i * 31 + k, lampejo);
            const lado = (sorteioDaCasa(k * 17 + lampejo, i) - 0.5) * larguraEm(i) * 2.2; // até um pouco fora do corpo, na aura
            const x = de.x + (ate.x - de.x) * t + nx * lado;
            const y = de.y + (ate.y - de.y) * t + ny * lado;
            (k % 3 === 0 ? claros : escuros).rect(x, y, grao, grao);
        }
    }
    c.fillStyle = "rgba(255, 255, 255, 0.28)";
    c.fill(claros);
    c.fillStyle = "rgba(0, 0, 0, 0.4)";
    c.fill(escuros);

    // 4) só os olhos, brancos e acesos
    cabeca(() => {
        c.fillStyle = "#ffffff";
        c.shadowColor = "#ffffff";
        c.shadowBlur = 8 * escala * tamanhoDaCabeca;
        for (const lado of [-1, 1]) {
            c.beginPath(); c.arc(5, lado * 4.6, 2.6, 0, Math.PI * 2); c.fill();
        }
    });
    c.restore();
}

// ==========================================
// Época: Halloween (tabuleiro, abóbora, chapéu de bruxa, esqueleto e morcegos).
// Estilo gibi, igual à Máscara de ferro: contorno de nanquim e cor chapada.
// ==========================================
const TINTA_DE_GIBI = "#141414";

// abóbora com a cara acesa (comida da época e enfeite do tabuleiro); a vela tremula com o tempo
function desenharAbobora(c, cx, cy, r, tempo) {
    const chama = 0.5 + 0.5 * Math.sin(tempo / 90) * Math.sin(tempo / 37);

    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";

    c.fillStyle = `rgba(255, 150, 30, ${0.12 + 0.12 * chama})`; // luz em volta
    c.beginPath(); c.arc(cx, cy, r * 1.55, 0, Math.PI * 2); c.fill();

    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = Math.max(0.8, r * 0.13);
    c.fillStyle = "#3f8f2f"; // cabinho
    c.beginPath();
    c.moveTo(cx - r * 0.14, cy - r * 0.6);
    c.lineTo(cx - r * 0.04, cy - r * 1.12);
    c.lineTo(cx + r * 0.3, cy - r * 1.04);
    c.lineTo(cx + r * 0.16, cy - r * 0.6);
    c.closePath(); c.fill(); c.stroke();

    const gomo = (x, rx, cor) => {
        c.fillStyle = cor;
        c.beginPath(); c.ellipse(cx + x * r, cy + r * 0.08, rx * r, r * 0.86, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    };
    gomo(-0.42, 0.6, "#d9600f");
    gomo(0.42, 0.6, "#d9600f");
    gomo(0, 0.62, "#f7841f");

    c.strokeStyle = "rgba(255, 225, 170, 0.85)"; // brilho no gomo do meio
    c.lineWidth = r * 0.1;
    c.beginPath(); c.arc(cx, cy + r * 0.08, r * 0.46, Math.PI * 1.12, Math.PI * 1.4); c.stroke();

    // olhos e boca cavados, com a vela acesa dentro
    c.fillStyle = chama > 0.25 ? "#ffe066" : "#ffb627";
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = Math.max(0.6, r * 0.08);
    c.beginPath();
    for (const lado of [-1, 1]) {
        c.moveTo(cx + lado * r * 0.16, cy - r * 0.02);
        c.lineTo(cx + lado * r * 0.48, cy - r * 0.06);
        c.lineTo(cx + lado * r * 0.36, cy - r * 0.38);
        c.closePath();
    }
    c.moveTo(cx - r * 0.5, cy + r * 0.2);
    for (const [x, y] of [[-0.3, 0.34], [-0.15, 0.24], [0, 0.36], [0.15, 0.24], [0.3, 0.34], [0.5, 0.2]]) c.lineTo(cx + x * r, cy + y * r);
    c.quadraticCurveTo(cx, cy + r * 0.78, cx - r * 0.5, cy + r * 0.2);
    c.fill();
    c.stroke();
    c.restore();
}

// morcego de gibi; batida de -1 a 1 (asas lá em cima / lá embaixo)
function desenharMorcego(c, x, y, tamanho, batida, cor, contorno) {
    const ponta = -4 - 5 * batida;

    c.save();
    c.translate(x, y);
    c.scale(tamanho / 10, tamanho / 10);
    c.lineJoin = "round";
    c.fillStyle = cor;
    c.strokeStyle = contorno;
    c.lineWidth = 1.1;
    c.beginPath();
    for (const lado of [-1, 1]) {
        c.moveTo(lado * 1.5, -1);
        c.lineTo(lado * 6, ponta * 0.55 - 1);
        c.lineTo(lado * 11, ponta);
        c.quadraticCurveTo(lado * 9.6, 0.6, lado * 8, 2.6); // a borda de baixo em ondinhas
        c.quadraticCurveTo(lado * 6.6, 0.6, lado * 5, 2.6);
        c.quadraticCurveTo(lado * 3.6, 0.8, lado * 1.5, 2.2);
        c.closePath();
    }
    c.moveTo(-2.4, -1.6); // corpo com as orelhas
    c.lineTo(-1.9, -5);
    c.lineTo(-0.7, -3.1);
    c.lineTo(0.7, -3.1);
    c.lineTo(1.9, -5);
    c.lineTo(2.4, -1.6);
    c.quadraticCurveTo(2.8, 4.2, 0, 4.6);
    c.quadraticCurveTo(-2.8, 4.2, -2.4, -1.6);
    c.fill();
    c.stroke();
    c.fillStyle = "#ffd23a";
    for (const lado of [-1, 1]) { c.beginPath(); c.arc(lado * 0.95, -0.9, 0.6, 0, Math.PI * 2); c.fill(); }
    c.restore();
}

function desenharLapide(c, x, y, escala) {
    c.save();
    c.translate(x, y);
    c.scale(escala, escala);
    c.lineJoin = "round";
    c.lineCap = "round";
    c.fillStyle = "#2f5a3d"; // tufinho de grama no pé
    c.beginPath(); c.ellipse(0, 3.2, 4.6, 1.3, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#8b88a6";
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(-3.2, 3);
    c.lineTo(-3.2, -1.4);
    c.arc(0, -1.4, 3.2, Math.PI, 0);
    c.lineTo(3.2, 3);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#64607f"; // lado na sombra
    c.fillRect(1.3, -2.6, 1.4, 5.2);
    c.strokeStyle = "#45415e";
    c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(-0.6, -3); c.lineTo(-0.6, 0.9); c.moveTo(-1.8, -1.7); c.lineTo(0.6, -1.7); c.stroke();
    c.restore();
}

// teias nos 4 cantos do tabuleiro, e uma aranha descendo do canto de cima à esquerda
function desenharTeiasDosCantos(c, largura, altura, lado, tempo) {
    const raio = lado * 2.4;
    c.save();
    c.strokeStyle = "rgba(235, 228, 255, 0.42)";
    c.lineWidth = lado * 0.035;
    for (const [x, y, sx, sy] of [[0, 0, 1, 1], [largura, 0, -1, 1], [0, altura, 1, -1], [largura, altura, -1, -1]]) {
        const fios = [0, 0.4, 0.8, 1.2, 1.5708].map((angulo) => ({ x: Math.cos(angulo) * sx, y: Math.sin(angulo) * sy }));
        c.beginPath();
        for (const fio of fios) { c.moveTo(x, y); c.lineTo(x + fio.x * raio, y + fio.y * raio); }
        for (const volta of [0.35, 0.62, 0.88]) { // os fios de volta caem um pouco entre um raio e outro
            for (let i = 0; i < fios.length - 1; i++) {
                const a = fios[i];
                const b = fios[i + 1];
                const meio = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
                if (i === 0) c.moveTo(x + a.x * raio * volta, y + a.y * raio * volta);
                c.quadraticCurveTo(x + meio.x * raio * volta * 0.82, y + meio.y * raio * volta * 0.82, x + b.x * raio * volta, y + b.y * raio * volta);
            }
        }
        c.stroke();
    }

    const descida = lado * (1.6 + 0.5 * Math.sin(tempo / 900));
    const aranha = { x: lado * 0.95, y: lado * 0.6 + descida };
    c.beginPath(); c.moveTo(aranha.x, 0); c.lineTo(aranha.x, aranha.y); c.stroke();
    c.strokeStyle = "#0b0712";
    c.lineWidth = lado * 0.06;
    c.beginPath();
    for (const lado2 of [-1, 1]) {
        for (const altura2 of [-0.12, 0, 0.12]) {
            c.moveTo(aranha.x, aranha.y);
            c.quadraticCurveTo(aranha.x + lado2 * lado * 0.22, aranha.y + (altura2 - 0.12) * lado, aranha.x + lado2 * lado * 0.3, aranha.y + (altura2 + 0.08) * lado);
        }
    }
    c.stroke();
    c.fillStyle = "#0b0712";
    c.beginPath(); c.arc(aranha.x, aranha.y, lado * 0.13, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#ff4d4d";
    c.beginPath(); c.arc(aranha.x - lado * 0.04, aranha.y + lado * 0.03, lado * 0.025, 0, Math.PI * 2); c.arc(aranha.x + lado * 0.04, aranha.y + lado * 0.03, lado * 0.025, 0, Math.PI * 2); c.fill();
    c.restore();
}

// enfeites de uma casa do tabuleiro do Halloween (chamado pelo desenharDecoracaoDoTabuleiro)
function desenharEnfeiteDoHalloween(c, x, y, sorteio, escala, tempo) {
    if (sorteio < 0.018) { // abóbora pequena e meio apagada, pra não confundir com a comida
        c.save();
        c.globalAlpha = 0.6;
        desenharAbobora(c, x, y, 3.6 * escala, tempo + sorteio * 50000);
        c.restore();
    } else if (sorteio < 0.03) {
        desenharLapide(c, x, y, escala * 0.95);
    } else if (sorteio < 0.042) { // morcego parado no ar, batendo as asas
        desenharMorcego(c, x, y + Math.sin(tempo / 600 + sorteio * 90) * 2 * escala, 6 * escala, Math.sin(tempo / 110 + sorteio * 300), "#140a1f", "#b48cff");
    } else if (sorteio < 0.2) { // vagalume laranja que acende e apaga
        const brilho = Math.max(0, Math.sin(tempo / 900 + sorteio * 70));
        c.fillStyle = `rgba(255, 170, 60, ${0.06 + 0.4 * brilho})`;
        c.beginPath(); c.arc(x, y, (0.5 + 0.6 * brilho) * escala, 0, Math.PI * 2); c.fill();
    }
}

// ==========================================
// Prêmios das missões do Halloween (cada um sai de uma missão)
// ==========================================

// chapéu de bruxa, em volta da cabeça (mesmas medidas do desenharChapeu); a ponta dobrada balança
function desenharChapeuDeBruxa(c, tempo) {
    const balanco = Math.sin(tempo / 420) * 2.2;
    const aba = () => { c.beginPath(); c.ellipse(-7, 0, 10, 21, 0, 0, Math.PI * 2); };

    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = 1.8;

    c.fillStyle = "#7438b8"; // aba larga, com um lado na sombra
    aba(); c.fill();
    c.save(); aba(); c.clip(); c.fillStyle = "#4e2287"; c.fillRect(-20, -25, 30, 25); c.restore();
    c.strokeStyle = "#c9a7ff"; // luz na beira da aba
    c.beginPath(); c.ellipse(-7, 0, 8.6, 19.4, 0, 0.35, 1.25); c.stroke();
    c.strokeStyle = TINTA_DE_GIBI;
    aba(); c.stroke();

    c.fillStyle = "#8a48d6"; // cone deitado pra trás, com a ponta dobrada
    c.beginPath();
    c.moveTo(-6, -9);
    c.quadraticCurveTo(-18, -7, -26, -2 + balanco * 0.3);
    c.quadraticCurveTo(-32, 2 + balanco, -27.5, 6.5 + balanco);
    c.quadraticCurveTo(-25.5, 2.5 + balanco * 0.5, -21.5, 3.4);
    c.quadraticCurveTo(-14, 7, -6, 9);
    c.closePath();
    c.fill();
    c.save(); c.clip(); c.fillStyle = "#5d2a9e"; c.fillRect(-34, -12, 30, 11.2); c.restore();
    c.stroke();

    c.fillStyle = "#ff8c1a"; // faixa laranja com fivela
    c.beginPath(); c.moveTo(-6, -9.2); c.lineTo(-10, -8.4); c.lineTo(-10, 8.4); c.lineTo(-6, 9.2); c.closePath(); c.fill();
    c.lineWidth = 1.2; c.stroke();
    c.fillStyle = "#ffd23a";
    c.fillRect(-9.6, -2.6, 3.2, 5.2); c.strokeRect(-9.6, -2.6, 3.2, 5.2);
    c.fillStyle = "#7438b8";
    c.fillRect(-8.7, -1.3, 1.4, 2.6);

    desenharBrilho(c, -16, 2.6, 2.4, "#ffe066"); // estrela e lua pintadas no cone
    c.fillStyle = "#ffe066";
    c.beginPath(); c.arc(-21, -0.6, 1.9, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#8a48d6";
    c.beginPath(); c.arc(-20.2, -1.3, 1.6, 0, Math.PI * 2); c.fill();

    for (const lado of [-1, 1]) { // os olhos ficam por cima da aba
        c.fillStyle = "#ffe066";
        c.beginPath(); c.arc(-3, lado * 11, 6.6, 0, Math.PI * 2); c.fill();
        c.lineWidth = 1.2; c.stroke();
        c.fillStyle = "#2a1200";
        c.beginPath(); c.ellipse(-1, lado * 11, 1.5, 4.2, 0, 0, Math.PI * 2); c.fill();
    }
    c.restore();
}

// corpo "Esqueleto": costelas e vértebras por cima do corpo escuro (a cabeça vira caveira)
function desenharOssosDoEsqueleto(c, pontos, largura) {
    let total = 0;
    for (let i = 1; i < pontos.length; i++) {
        const d = Math.hypot(pontos[i].x - pontos[i - 1].x, pontos[i].y - pontos[i - 1].y);
        if (d <= TAMANHO_CELULA * 1.5) total += d;
    }

    const passo = largura * 0.5;
    const grossura = largura / 16.8;
    const costelas = [];
    let andado = 0;
    let proxima = largura * 0.75; // logo atrás da cabeça
    for (let i = 1; i < pontos.length; i++) {
        const de = pontos[i - 1];
        const ate = pontos[i];
        const distancia = Math.hypot(ate.x - de.x, ate.y - de.y);
        if (distancia === 0) continue;
        if (distancia > TAMANHO_CELULA * 1.5) { // atravessou a borda: pula
            proxima = Math.max(proxima, andado + passo / 2);
            continue;
        }
        while (proxima <= andado + distancia && proxima < total - passo * 0.4) {
            const t = (proxima - andado) / distancia;
            costelas.push({
                x: de.x + (ate.x - de.x) * t, y: de.y + (ate.y - de.y) * t,
                dx: (ate.x - de.x) / distancia, dy: (ate.y - de.y) / distancia,
                largo: largura * (0.6 + 0.4 * (1 - proxima / total)),
            });
            proxima += passo;
        }
        andado += distancia;
    }

    c.save();
    c.lineCap = "round";
    // primeiro o nanquim de tudo, depois o osso por cima (assim o contorno não corta os ossos vizinhos)
    for (const [cor, extra] of [[TINTA_DE_GIBI, 1.1], ["#ece5d3", 0]]) {
        c.strokeStyle = cor;
        c.beginPath();
        for (const osso of costelas) {
            const meio = osso.largo * 0.36;
            for (const lado of [-1, 1]) { // costela curvada pra trás
                c.moveTo(osso.x, osso.y);
                c.quadraticCurveTo(
                    osso.x - osso.dy * lado * meio, osso.y + osso.dx * lado * meio,
                    osso.x - osso.dy * lado * meio * 1.05 + osso.dx * meio * 0.55, osso.y + osso.dx * lado * meio * 1.05 + osso.dy * meio * 0.55,
                );
            }
        }
        c.lineWidth = (1.5 + extra) * grossura;
        c.stroke();
        c.fillStyle = cor;
        for (const osso of costelas) { // vértebra no meio
            c.beginPath(); c.arc(osso.x, osso.y, (1.5 + extra * 0.6) * grossura, 0, Math.PI * 2); c.fill();
        }
    }
    c.restore();
}

// dentes da caveira na frente da cabeça (coordenadas da cabeça)
function desenharDentesDaCaveira(c) {
    c.save();
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineCap = "round";
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(13.5, -5.5); c.quadraticCurveTo(17.5, 0, 13.5, 5.5);
    for (const y of [-3.6, -1.2, 1.2, 3.6]) { c.moveTo(14.4, y); c.lineTo(16.9, y); }
    c.stroke();
    c.restore();
}

// rastro "Morceguinhos": voam pra cima batendo as asas
function desenharMorceguinho(c, x, y, tamanho, idade, giro) {
    desenharMorcego(c, x, y, tamanho, Math.sin(idade / 45 + giro), "#2a1740", "#c9a7ff");
}

// ==========================================
// Época: Natal e Ano Novo (tabuleiro, panetone, gorro, pisca-pisca, flocos e os fogos da virada).
// Mesmo estilo de gibi do Halloween (usa a TINTA_DE_GIBI de lá).
// ==========================================
const CORES_DO_PISCA_PISCA = ["#ff4d4d", "#ffd23a", "#4dabf7", "#7bd389"];
const CORES_DO_PISCA_APAGADO = ["#6e2626", "#6e5a1c", "#24486b", "#2f5e3c"];

// panetone na forma de papel (comida da época)
function desenharPanetone(c, cx, cy, r) {
    c.save();
    c.lineJoin = "round";
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = Math.max(0.8, r * 0.12);

    c.fillStyle = "rgba(0, 0, 0, 0.25)"; // sombra no chão
    c.beginPath(); c.ellipse(cx, cy + r * 0.9, r * 0.85, r * 0.2, 0, 0, Math.PI * 2); c.fill();

    const papel = () => {
        c.beginPath();
        c.moveTo(cx - r * 0.82, cy - r * 0.05);
        c.lineTo(cx + r * 0.82, cy - r * 0.05);
        c.lineTo(cx + r * 0.72, cy + r * 0.85);
        c.quadraticCurveTo(cx, cy + r * 0.98, cx - r * 0.72, cy + r * 0.85);
        c.closePath();
    };
    c.fillStyle = "#e9b949"; // forma de papel dourada, com as pregas
    papel(); c.fill();
    c.save();
    papel(); c.clip();
    c.fillStyle = "#c48f22";
    for (let i = -3; i <= 3; i += 2) c.fillRect(cx + i * r * 0.2 - r * 0.07, cy - r * 0.1, r * 0.14, r * 1.1);
    c.fillStyle = "#d62839"; // fitinha vermelha
    c.fillRect(cx - r, cy + r * 0.28, r * 2, r * 0.2);
    c.restore();
    papel(); c.stroke();

    c.fillStyle = "#b8661f"; // a cúpula assada
    c.beginPath();
    c.moveTo(cx - r * 0.86, cy - r * 0.02);
    c.bezierCurveTo(cx - r * 0.95, cy - r * 0.75, cx - r * 0.45, cy - r * 1.02, cx, cy - r * 1.02);
    c.bezierCurveTo(cx + r * 0.45, cy - r * 1.02, cx + r * 0.95, cy - r * 0.75, cx + r * 0.86, cy - r * 0.02);
    c.quadraticCurveTo(cx, cy + r * 0.12, cx - r * 0.86, cy - r * 0.02);
    c.fill();
    c.stroke();

    c.strokeStyle = "#f2c66d"; // o corte em cruz do topo
    c.lineWidth = r * 0.12;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(cx - r * 0.3, cy - r * 0.78); c.lineTo(cx + r * 0.3, cy - r * 0.62);
    c.moveTo(cx + r * 0.28, cy - r * 0.8); c.lineTo(cx - r * 0.26, cy - r * 0.6);
    c.stroke();

    for (const [x, y, cor] of [[-0.55, -0.35, "#d62839"], [0.5, -0.4, "#4caf50"], [-0.15, -0.25, "#5a2a1a"], [0.2, -0.22, "#d62839"], [0.62, -0.15, "#5a2a1a"], [-0.62, -0.62, "#4caf50"]]) {
        c.fillStyle = cor; // frutinhas e uvas-passas
        c.beginPath(); c.arc(cx + x * r, cy + y * r, r * 0.09, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = "rgba(255, 240, 200, 0.7)"; // brilho
    c.beginPath(); c.ellipse(cx - r * 0.45, cy - r * 0.62, r * 0.16, r * 0.08, -0.6, 0, Math.PI * 2); c.fill();
    c.restore();
}

// floco de neve de 6 pontas (rastro e neve caindo)
function desenharFloco(c, x, y, tamanho, giro, cor) {
    c.save();
    c.translate(x, y);
    c.rotate(giro);
    c.strokeStyle = cor;
    c.lineCap = "round";
    c.beginPath();
    for (let i = 0; i < 6; i++) {
        const angulo = (i / 6) * Math.PI * 2;
        const dx = Math.cos(angulo);
        const dy = Math.sin(angulo);
        c.moveTo(0, 0);
        c.lineTo(dx * tamanho, dy * tamanho);
        for (const lado of [-1, 1]) { // os galhinhos em V
            const meio = tamanho * 0.55;
            const galho = angulo + lado * 0.7;
            c.moveTo(dx * meio, dy * meio);
            c.lineTo(dx * meio + Math.cos(galho) * tamanho * 0.32, dy * meio + Math.sin(galho) * tamanho * 0.32);
        }
    }
    c.stroke();
    c.restore();
}

function desenharPinheirinho(c, x, y, escala) {
    c.save();
    c.translate(x, y);
    c.scale(escala, escala);
    c.lineJoin = "round";
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = 0.8;
    c.fillStyle = "#6b3f1f";
    c.fillRect(-0.9, 3, 1.8, 2);
    c.strokeRect(-0.9, 3, 1.8, 2);
    for (const [topo, base, largura] of [[-1.5, 3.4, 4.6], [-3.6, 1, 3.6], [-5.6, -1.4, 2.6]]) {
        c.fillStyle = "#4caf50";
        c.beginPath(); c.moveTo(0, topo); c.lineTo(largura, base); c.lineTo(-largura, base); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = "#eef6ff"; // neve na beirada
        c.beginPath(); c.ellipse(0, base - 0.3, largura * 0.8, 0.55, 0, 0, Math.PI * 2); c.fill();
    }
    desenharBrilho(c, 0, -6, 1.8, "#ffd23a");
    c.restore();
}

function desenharPresente(c, x, y, escala, cor) {
    c.save();
    c.translate(x, y);
    c.scale(escala, escala);
    c.lineJoin = "round";
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = 0.8;
    c.fillStyle = cor;
    c.fillRect(-3, -1.6, 6, 4.6);
    c.strokeRect(-3, -1.6, 6, 4.6);
    c.fillStyle = "#ffd23a"; // fita
    c.fillRect(-0.6, -1.6, 1.2, 4.6);
    c.beginPath();
    c.ellipse(-1.2, -2.3, 1.2, 0.7, -0.4, 0, Math.PI * 2);
    c.ellipse(1.2, -2.3, 1.2, 0.7, 0.4, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.restore();
}

// enfeites de uma casa do tabuleiro do Natal (chamado pelo desenharDecoracaoDoTabuleiro)
function desenharEnfeiteDoNatal(c, x, y, sorteio, escala) {
    if (sorteio < 0.02) {
        desenharPinheirinho(c, x, y, escala * 1.4);
    } else if (sorteio < 0.034) {
        desenharPresente(c, x, y, escala * 1.3, sorteio < 0.027 ? "#d62839" : "#3d7ad6");
    } else if (sorteio < 0.3) { // neve no chão
        c.fillStyle = "rgba(255, 255, 255, 0.16)";
        c.beginPath(); c.arc(x, y, (0.6 + sorteio * 2) * escala, 0, Math.PI * 2); c.fill();
    }
}

// por cima de tudo do tabuleiro: o fio de pisca-pisca no alto e a neve caindo
function desenharNeveEPiscaPisca(c, largura, altura, lado, tempo) {
    const sorteio = (n) => ((Math.imul(n + 1, 2654435761) >>> 0) % 1000) / 1000;

    c.save();
    const flocos = Math.round((largura * altura) / (lado * lado * 12));
    for (let i = 0; i < flocos; i++) {
        const velocidade = lado * (0.6 + sorteio(i * 3) * 0.6) / 1000;
        const x = sorteio(i * 3 + 1) * largura + Math.sin(tempo / 1300 + i) * lado * 0.35;
        const y = ((sorteio(i * 3 + 2) * (altura + lado) + tempo * velocidade) % (altura + lado)) - lado / 2;
        c.lineWidth = lado * 0.035;
        desenharFloco(c, x, y, lado * (0.1 + sorteio(i * 7) * 0.1), tempo / 2000 + i, "rgba(255, 255, 255, 0.55)");
    }

    // o fio cai um pouco entre um gancho e outro; as lâmpadas acendem em sequência
    const vao = lado * 4;
    const ganchos = Math.ceil(largura / vao);
    const pontoDoFio = (x) => {
        const t = (x % vao) / vao;
        return lado * 0.12 + lado * 0.5 * 4 * t * (1 - t);
    };
    c.strokeStyle = "#0e2418";
    c.lineWidth = lado * 0.06;
    c.beginPath();
    for (let g = 0; g < ganchos; g++) {
        c.moveTo(g * vao, lado * 0.12);
        c.quadraticCurveTo(g * vao + vao / 2, lado * 1.12, (g + 1) * vao, lado * 0.12);
    }
    c.stroke();
    const passo = Math.floor(tempo / 450);
    for (let i = 0; (i + 0.5) * lado < largura; i++) {
        const x = (i + 0.5) * lado;
        const y = pontoDoFio(x);
        const cor = i % 4;
        const acesa = (i + passo) % 4 !== 0;
        if (acesa) {
            c.fillStyle = CORES_DO_PISCA_PISCA[cor] + "55";
            c.beginPath(); c.arc(x, y + lado * 0.2, lado * 0.22, 0, Math.PI * 2); c.fill();
        }
        c.fillStyle = "#1c1c1c";
        c.fillRect(x - lado * 0.06, y - lado * 0.02, lado * 0.12, lado * 0.1);
        c.fillStyle = acesa ? CORES_DO_PISCA_PISCA[cor] : CORES_DO_PISCA_APAGADO[cor];
        c.beginPath(); c.ellipse(x, y + lado * 0.2, lado * 0.09, lado * 0.13, 0, 0, Math.PI * 2); c.fill();
    }
    c.restore();
}

// fogos da virada (31/12 e 1/1): 3 foguetes que sobem e estouram, um atrás do outro.
// Tudo calculado pelo tempo, sem guardar nada
function desenharFogosDaVirada(c, largura, altura, lado, tempo) {
    const sorteio = (n) => ((Math.imul(n + 7, 2246822519) >>> 0) % 1000) / 1000;
    const cores = ["#ffd23a", "#5ce1e6", "#4dabf7", "#7bd389", "#c77dff", "#ffffff"]; // sem vermelho: o tabuleiro já é vermelho
    const duracao = 2600;

    c.save();
    c.lineCap = "round";
    for (let fogo = 0; fogo < 3; fogo++) {
        const relogio = tempo + fogo * 870;
        const vez = Math.floor(relogio / duracao) * 3 + fogo;
        const fase = (relogio % duracao) / duracao;
        const cx = (0.15 + 0.7 * sorteio(vez)) * largura;
        const cy = (0.15 + 0.35 * sorteio(vez + 100)) * altura;
        const cor = cores[Math.floor(sorteio(vez + 200) * cores.length)];

        if (fase < 0.25) { // subindo
            const subida = fase / 0.25;
            const y = altura + (cy - altura) * (1 - (1 - subida) * (1 - subida));
            c.strokeStyle = "rgba(255, 230, 160, 0.5)";
            c.lineWidth = lado * 0.06;
            c.beginPath(); c.moveTo(cx, y + lado * 0.8); c.lineTo(cx, y); c.stroke();
            c.fillStyle = "#fff4c2";
            c.beginPath(); c.arc(cx, y, lado * 0.08, 0, Math.PI * 2); c.fill();
            continue;
        }

        const t = (fase - 0.25) / 0.75; // estouro: abre rápido, cai um pouco e apaga
        const raio = lado * 3.2 * (1 - (1 - t) * (1 - t));
        const queda = lado * 1.2 * t * t;
        c.globalAlpha = 1 - t;
        if (t < 0.12) {
            c.fillStyle = "rgba(255, 255, 255, 0.5)";
            c.beginPath(); c.arc(cx, cy, lado * 0.9 * (1 - t / 0.12), 0, Math.PI * 2); c.fill();
        }
        c.strokeStyle = cor;
        c.fillStyle = cor;
        c.lineWidth = lado * 0.09;
        c.beginPath();
        for (let raioDoFogo = 0; raioDoFogo < 16; raioDoFogo++) {
            const angulo = (raioDoFogo / 16) * Math.PI * 2 + sorteio(vez + 300);
            const dx = Math.cos(angulo);
            const dy = Math.sin(angulo);
            c.moveTo(cx + dx * raio * 0.72, cy + dy * raio * 0.72 + queda);
            c.lineTo(cx + dx * raio, cy + dy * raio + queda);
        }
        c.stroke();
        for (let raioDoFogo = 0; raioDoFogo < 16; raioDoFogo += 2) {
            const angulo = (raioDoFogo / 16) * Math.PI * 2 + sorteio(vez + 300);
            c.beginPath(); c.arc(cx + Math.cos(angulo) * raio * 1.08, cy + Math.sin(angulo) * raio * 1.08 + queda, lado * 0.06, 0, Math.PI * 2); c.fill();
        }
        c.globalAlpha = 1;
    }
    c.restore();
}

// ==========================================
// Prêmios das missões do Natal (cada um sai de uma missão)
// ==========================================

// gorro de Papai Noel em volta da cabeça (mesmas medidas do desenharChapeu); o pompom balança
function desenharGorroDePapaiNoel(c, tempo) {
    const balanco = Math.sin(tempo / 420) * 2.2;
    const ponta = { x: -25, y: 6 + balanco };

    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = 1.8;

    c.fillStyle = "#d62839"; // o gorro, deitado pra trás e caído pro lado
    c.beginPath();
    c.moveTo(-8, -15);
    c.quadraticCurveTo(-20, -12, ponta.x + 2, ponta.y - 3);
    c.quadraticCurveTo(ponta.x - 1, ponta.y + 1, ponta.x + 3, ponta.y + 2);
    c.quadraticCurveTo(-17, 8, -8, 15);
    c.closePath();
    c.fill();
    c.save(); c.clip(); c.fillStyle = "#9e1b2a"; c.fillRect(-34, -18, 30, 12); c.restore(); // lado na sombra
    c.stroke();
    c.strokeStyle = "#ff8a8a"; // luz na dobra
    c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(-12, 6); c.quadraticCurveTo(-17, 5, ponta.x + 4, ponta.y); c.stroke();

    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = 1.8;
    const pelo = () => { // a barra de pelo branca, fofinha
        c.beginPath();
        for (let i = 0; i <= 8; i++) {
            const y = -19 + i * 4.75;
            c.arc(-6 + (i % 2) * 0.8, y, 3.4, 0, Math.PI * 2);
        }
    };
    c.fillStyle = "#f4f1ea";
    c.beginPath(); c.ellipse(-6, 0, 4.6, 19.5, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    pelo(); c.fill();
    c.fillStyle = "#cfd6e0";
    c.beginPath(); c.ellipse(-7.5, 0, 2, 17, 0, 0, Math.PI * 2); c.fill();

    c.fillStyle = "#f4f1ea"; // pompom
    c.beginPath(); c.arc(ponta.x, ponta.y, 4.4, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = "#cfd6e0";
    c.beginPath(); c.arc(ponta.x - 1.2, ponta.y + 1.2, 2, 0, Math.PI * 2); c.fill();

    for (const lado of [-1, 1]) { // os olhos ficam por cima do pelo
        c.fillStyle = "#ffe066";
        c.beginPath(); c.arc(-3, lado * 11, 6.6, 0, Math.PI * 2); c.fill();
        c.lineWidth = 1.2; c.stroke();
        c.fillStyle = "#2a1200";
        c.beginPath(); c.ellipse(-1, lado * 11, 1.5, 4.2, 0, 0, Math.PI * 2); c.fill();
    }
    c.restore();
}

// corpo "Pisca-pisca": a cobra vira um galho de pinheiro enrolado num fio de luzinhas
function desenharLuzesDoPiscaPisca(c, pontos, largura, tempo) {
    const passo = largura * 0.95; // de uma lâmpada pra outra
    const onda = largura * 0.24; // o fio vai de um lado pro outro do corpo, como se estivesse enrolado
    const fio = [[]];
    const luzes = [];
    let andado = 0;
    for (let i = 1; i < pontos.length; i++) {
        const de = pontos[i - 1];
        const ate = pontos[i];
        const distancia = Math.hypot(ate.x - de.x, ate.y - de.y);
        if (distancia === 0) continue;
        if (distancia > TAMANHO_CELULA * 1.5) { // atravessou a borda: o fio recomeça do outro lado
            fio.push([]);
            continue;
        }
        const nx = -(ate.y - de.y) / distancia;
        const ny = (ate.x - de.x) / distancia;
        const desvio = Math.sin((andado / passo) * Math.PI) * onda;
        fio[fio.length - 1].push({ x: de.x + nx * desvio, y: de.y + ny * desvio });

        const proxima = (Math.floor(andado / passo - 0.5) + 1.5) * passo; // as lâmpadas ficam nas curvas do fio
        if (proxima >= largura * 0.6 && proxima < andado + distancia) {
            const lado = Math.round(proxima / passo - 0.5) % 2 === 0 ? 1 : -1;
            const t = (proxima - andado) / distancia;
            luzes.push({ x: de.x + (ate.x - de.x) * t + nx * lado * onda, y: de.y + (ate.y - de.y) * t + ny * lado * onda, nx: nx * lado, ny: ny * lado });
        }
        andado += distancia;
    }

    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = "#0e2418";
    c.lineWidth = largura / 12;
    c.beginPath();
    for (const trecho of fio) trecho.forEach((ponto, i) => (i === 0 ? c.moveTo(ponto.x, ponto.y) : c.lineTo(ponto.x, ponto.y)));
    c.stroke();

    const sequencia = Math.floor(tempo / 450);
    luzes.forEach((luz, i) => {
        const cor = i % 4;
        const acesa = (i + sequencia) % 4 !== 0;
        const bx = luz.x + luz.nx * largura * 0.13;
        const by = luz.y + luz.ny * largura * 0.13;
        if (acesa) {
            c.fillStyle = CORES_DO_PISCA_PISCA[cor] + "44";
            c.beginPath(); c.arc(bx, by, largura * 0.3, 0, Math.PI * 2); c.fill();
        }
        c.save();
        c.translate(bx, by);
        c.rotate(Math.atan2(luz.ny, luz.nx));
        c.fillStyle = "#1c1c1c"; // soquete
        c.fillRect(-largura * 0.15, -largura * 0.07, largura * 0.08, largura * 0.14);
        c.fillStyle = acesa ? CORES_DO_PISCA_PISCA[cor] : CORES_DO_PISCA_APAGADO[cor];
        c.strokeStyle = TINTA_DE_GIBI;
        c.lineWidth = largura / 24;
        c.beginPath(); c.ellipse(0, 0, largura * 0.17, largura * 0.12, 0, 0, Math.PI * 2); c.fill(); c.stroke();
        if (acesa) {
            c.fillStyle = "rgba(255, 255, 255, 0.85)";
            c.beginPath(); c.arc(largura * 0.04, -largura * 0.04, largura * 0.04, 0, Math.PI * 2); c.fill();
        }
        c.restore();
    });
    c.restore();
}

// rastro "Flocos de neve": caem devagar girando
function desenharFlocoDoRastro(c, x, y, tamanho, giro) {
    c.lineWidth = tamanho * 0.5;
    desenharFloco(c, x, y, tamanho, giro, "rgba(60, 110, 170, 0.55)"); // contorninho azul pra aparecer na grama
    c.lineWidth = tamanho * 0.22;
    desenharFloco(c, x, y, tamanho, giro, "#ffffff");
}

// ==========================================
// Época: Carnaval (tabuleiro, algodão-doce, máscara de baile, lantejoulas e serpentinas).
// Mesmo estilo de gibi do Halloween (usa a TINTA_DE_GIBI de lá).
// ==========================================
const CORES_DO_CARNAVAL = ["#ff4fa3", "#ffd23a", "#38d9e8", "#b26bff", "#7bed6f"];

// algodão-doce no palito de papel (comida da época)
function desenharAlgodaoDoce(c, cx, cy, r) {
    const nuvens = [[-0.45, -0.2, 0.42], [0.45, -0.2, 0.42], [0, -0.55, 0.48], [-0.22, 0.02, 0.4], [0.22, 0.02, 0.4], [0, -0.18, 0.45]];

    c.save();
    c.lineJoin = "round";
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = Math.max(0.8, r * 0.12);

    c.fillStyle = "#f4f1ea"; // casquinha de papel listrado
    c.beginPath();
    c.moveTo(cx - r * 0.3, cy + r * 0.2);
    c.lineTo(cx + r * 0.3, cy + r * 0.2);
    c.lineTo(cx, cy + r * 1.08);
    c.closePath();
    c.fill();
    c.save(); c.clip();
    c.strokeStyle = "#4dabf7";
    c.lineWidth = r * 0.12;
    c.beginPath();
    for (const y of [0.42, 0.68]) { c.moveTo(cx - r * 0.4, cy + r * (y - 0.12)); c.lineTo(cx + r * 0.4, cy + r * (y + 0.12)); }
    c.stroke();
    c.restore();
    c.stroke();

    // a nuvem cor-de-rosa: o contorno de todas as bolinhas primeiro, depois o recheio (fica só o contorno de fora)
    c.lineWidth = Math.max(1.6, r * 0.24);
    for (const [x, y, raio] of nuvens) { c.beginPath(); c.arc(cx + x * r, cy + y * r, raio * r, 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = "#ff8cc6";
    for (const [x, y, raio] of nuvens) { c.beginPath(); c.arc(cx + x * r, cy + y * r, raio * r, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = "#ffc2e0"; // fofura clarinha
    for (const [x, y, raio] of [[-0.12, -0.62, 0.16], [-0.5, -0.28, 0.12], [0.3, -0.3, 0.1]]) {
        c.beginPath(); c.arc(cx + x * r, cy + y * r, raio * r, 0, Math.PI * 2); c.fill();
    }
    c.restore();
}

// confete de papel: um retanguinho que gira (o cosseno faz ele "virar" no ar)
function desenharPapelDeConfete(c, x, y, tamanho, giro, cor) {
    c.save();
    c.translate(x, y);
    c.rotate(giro);
    c.scale(1, Math.cos(giro * 1.7));
    c.fillStyle = cor;
    c.fillRect(-tamanho / 2, -tamanho / 4, tamanho, tamanho / 2);
    c.restore();
}

// serpentina enrolada como mola (enfeite do tabuleiro e rastro)
function desenharSerpentina(c, x, y, tamanho, giro, cor) {
    c.save();
    c.translate(x, y);
    c.rotate(giro);
    c.strokeStyle = cor;
    c.lineWidth = tamanho * 0.3;
    c.lineCap = "round";
    c.beginPath();
    for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        const angulo = t * Math.PI * 3;
        const raio = tamanho * (0.25 + t * 0.35);
        const px = Math.cos(angulo) * raio;
        const py = Math.sin(angulo) * raio * 0.55 + (t - 0.5) * tamanho * 1.3;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.stroke();
    c.restore();
}

// máscara de baile pequenininha (enfeite do tabuleiro)
function desenharMascarinha(c, x, y, escala, cor) {
    c.save();
    c.translate(x, y);
    c.scale(escala, escala);
    c.lineJoin = "round";
    c.fillStyle = cor;
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = 0.7;
    c.beginPath();
    c.moveTo(-4.5, -1.6);
    c.quadraticCurveTo(0, -0.4, 4.5, -1.6);
    c.quadraticCurveTo(4.2, 2.4, 1.2, 1.8);
    c.quadraticCurveTo(0, 0.8, -1.2, 1.8);
    c.quadraticCurveTo(-4.2, 2.4, -4.5, -1.6);
    c.fill();
    c.stroke();
    c.fillStyle = TINTA_DE_GIBI; // os furinhos dos olhos
    c.beginPath(); c.ellipse(-2.2, 0.1, 1, 0.6, 0.2, 0, Math.PI * 2); c.ellipse(2.2, 0.1, 1, 0.6, -0.2, 0, Math.PI * 2); c.fill();
    c.restore();
}

// enfeites de uma casa do tabuleiro do Carnaval (chamado pelo desenharDecoracaoDoTabuleiro)
function desenharEnfeiteDoCarnaval(c, x, y, sorteio, escala) {
    const cor = CORES_DO_CARNAVAL[Math.floor(sorteio * 1000) % CORES_DO_CARNAVAL.length];
    if (sorteio < 0.015) {
        desenharMascarinha(c, x, y, escala * 1.6, cor);
    } else if (sorteio < 0.032) {
        desenharSerpentina(c, x, y, 6 * escala, sorteio * 400, cor);
    } else if (sorteio < 0.3) { // confete no chão
        c.globalAlpha = 0.55;
        desenharPapelDeConfete(c, x, y, 2.6 * escala, sorteio * 200, cor);
        c.globalAlpha = 1;
    }
}

// por cima de tudo do tabuleiro: confete caindo
function desenharConfeteCaindo(c, largura, altura, lado, tempo) {
    const sorteio = (n) => ((Math.imul(n + 3, 2654435761) >>> 0) % 1000) / 1000;
    const papeis = Math.round((largura * altura) / (lado * lado * 10));
    for (let i = 0; i < papeis; i++) {
        const velocidade = lado * (0.7 + sorteio(i * 3) * 0.7) / 1000;
        const x = sorteio(i * 3 + 1) * largura + Math.sin(tempo / 900 + i) * lado * 0.4;
        const y = ((sorteio(i * 3 + 2) * (altura + lado) + tempo * velocidade) % (altura + lado)) - lado / 2;
        desenharPapelDeConfete(c, x, y, lado * 0.16, tempo / 300 + i, CORES_DO_CARNAVAL[i % CORES_DO_CARNAVAL.length]);
    }
}

// ==========================================
// Prêmios das missões do Carnaval
// ==========================================

// máscara de baile em volta dos olhos, com plumas que balançam (mesmas medidas do desenharChapeu)
function desenharMascaraDeBaile(c, tempo) {
    const balanco = Math.sin(tempo / 380) * 0.12;

    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = TINTA_DE_GIBI;

    // plumas saindo pra trás de um lado
    [["#38d9e8", -0.5], ["#ff4fa3", -0.2], ["#ffd23a", 0.1]].forEach(([cor, angulo], i) => {
        c.save();
        c.translate(-9, -15);
        c.rotate(Math.PI + angulo + balanco * (i + 1));
        c.fillStyle = cor;
        c.lineWidth = 1.2;
        c.beginPath(); c.ellipse(9, 0, 9.5, 3.2, 0, 0, Math.PI * 2); c.fill(); c.stroke();
        c.strokeStyle = "rgba(20, 20, 20, 0.45)"; // o talo
        c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(17, 0); c.stroke();
        c.restore();
    });

    // a máscara: uma faixa por cima dos olhos, com as pontas puxadas pra trás
    const mascara = () => {
        c.beginPath();
        c.moveTo(3, -17);
        c.quadraticCurveTo(5, 0, 3, 17);
        c.lineTo(-12, 22);
        c.quadraticCurveTo(-8, 15, -9, 6);
        c.quadraticCurveTo(-6, 0, -9, -6);
        c.quadraticCurveTo(-8, -15, -12, -22);
        c.closePath();
    };
    c.fillStyle = "#8e3bd1";
    mascara(); c.fill();
    c.save(); mascara(); c.clip(); c.fillStyle = "#6a23a8"; c.fillRect(-14, -24, 20, 12); c.restore(); // lado na sombra
    c.lineWidth = 3.4; mascara(); c.stroke();
    c.strokeStyle = "#ffd23a"; // a beirada dourada
    c.lineWidth = 1.4;
    mascara(); c.stroke();
    desenharBrilho(c, -2, 0, 3.2, "#ffd23a"); // a pedrinha do meio
    c.fillStyle = "#38d9e8";
    c.beginPath(); c.arc(-2, 0, 1.1, 0, Math.PI * 2); c.fill();

    c.strokeStyle = TINTA_DE_GIBI;
    for (const lado of [-1, 1]) { // os olhos aparecem pelos furos
        c.fillStyle = "#ffe066";
        c.beginPath(); c.arc(-3, lado * 11, 6.6, 0, Math.PI * 2); c.fill();
        c.lineWidth = 1.2; c.stroke();
        c.fillStyle = "#2a1200";
        c.beginPath(); c.ellipse(-1, lado * 11, 1.5, 4.2, 0, 0, Math.PI * 2); c.fill();
    }
    c.restore();
}

// corpo "Lantejoulas": fileiras de lantejoulas coloridas que brilham uma de cada vez
function desenharLantejoulas(c, pontos, largura, tempo) {
    let total = 0;
    for (let i = 1; i < pontos.length; i++) {
        const d = Math.hypot(pontos[i].x - pontos[i - 1].x, pontos[i].y - pontos[i - 1].y);
        if (d <= TAMANHO_CELULA * 1.5) total += d;
    }

    const passo = largura * 0.42;
    let andado = 0;
    let proxima = largura * 0.55; // logo atrás da cabeça
    let fileira = 0;
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
        while (proxima <= andado + distancia && proxima < total - passo * 0.3) {
            const t = (proxima - andado) / distancia;
            const nx = -(ate.y - de.y) / distancia;
            const ny = (ate.x - de.x) / distancia;
            const largo = largura * (0.6 + 0.4 * (1 - proxima / total)); // o corpo afina no rabo
            const lugares = fileira % 2 === 0 ? [-0.27, 0, 0.27] : [-0.135, 0.135];
            lugares.forEach((lugar, k) => {
                const x = de.x + (ate.x - de.x) * t + nx * lugar * largo;
                const y = de.y + (ate.y - de.y) * t + ny * lugar * largo;
                const brilho = Math.max(0, Math.sin(tempo / 260 + fileira * 1.7 + k * 2.3));
                c.fillStyle = CORES_DO_CARNAVAL[(fileira * 3 + k) % CORES_DO_CARNAVAL.length];
                c.beginPath(); c.arc(x, y, largo * 0.1, 0, Math.PI * 2); c.fill();
                if (brilho > 0.6) {
                    c.fillStyle = `rgba(255, 255, 255, ${(brilho - 0.6) * 2.2})`;
                    c.beginPath(); c.arc(x - largo * 0.03, y - largo * 0.03, largo * 0.05, 0, Math.PI * 2); c.fill();
                }
            });
            fileira++;
            proxima += passo;
        }
        andado += distancia;
    }
    c.restore();
}

// ==========================================
// Época: Páscoa (tabuleiro, ovo de chocolate, orelhas de coelho, chocolate e ovinhos)
// ==========================================
const CORES_DOS_OVINHOS = ["#ff9ec7", "#9ad7ff", "#ffe27a", "#b9f2a1", "#d7b5ff"];

// ovo de chocolate meio embrulhado no papel brilhante (comida da época)
function desenharOvoDeChocolate(c, cx, cy, r) {
    const ovo = () => { c.beginPath(); c.ellipse(cx, cy - r * 0.05, r * 0.74, r * 0.95, 0, 0, Math.PI * 2); };

    c.save();
    c.lineJoin = "round";
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = Math.max(0.8, r * 0.12);

    c.fillStyle = "rgba(0, 0, 0, 0.2)"; // sombra
    c.beginPath(); c.ellipse(cx, cy + r * 0.88, r * 0.7, r * 0.18, 0, 0, Math.PI * 2); c.fill();

    c.fillStyle = "#6b3a1e";
    ovo(); c.fill();
    c.save();
    ovo(); c.clip();
    c.fillStyle = "#ff6fae"; // o papel, com a beirada em zigue-zague
    c.beginPath();
    c.moveTo(cx - r, cy + r * 1.2);
    c.lineTo(cx - r, cy + r * 0.15);
    for (let i = 0; i <= 8; i++) c.lineTo(cx - r + (i * r) / 4, cy + r * (i % 2 === 0 ? 0.15 : 0.32));
    c.lineTo(cx + r, cy + r * 1.2);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "rgba(255, 220, 236, 0.75)"; // brilho do papel
    c.fillRect(cx - r * 0.42, cy + r * 0.38, r * 0.14, r * 0.6);
    c.restore();
    ovo(); c.stroke();

    c.fillStyle = "rgba(220, 150, 100, 0.65)"; // brilho do chocolate
    c.beginPath(); c.ellipse(cx - r * 0.3, cy - r * 0.5, r * 0.12, r * 0.28, 0.35, 0, Math.PI * 2); c.fill();

    c.fillStyle = "#ffd23a"; // lacinho
    c.lineWidth = Math.max(0.6, r * 0.08);
    c.beginPath();
    c.ellipse(cx - r * 0.2, cy + r * 0.2, r * 0.2, r * 0.12, -0.4, 0, Math.PI * 2);
    c.ellipse(cx + r * 0.2, cy + r * 0.2, r * 0.2, r * 0.12, 0.4, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.restore();
}

// ovinho pintado (enfeite, rastro e prévia)
function desenharOvinho(c, x, y, tamanho, cor, giro) {
    c.save();
    c.translate(x, y);
    c.rotate(giro);
    c.fillStyle = cor;
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = tamanho * 0.16;
    c.beginPath(); c.ellipse(0, 0, tamanho * 0.75, tamanho, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.strokeStyle = "#ffffff"; // a faixa em zigue-zague
    c.lineWidth = tamanho * 0.2;
    c.beginPath();
    for (let i = 0; i <= 4; i++) {
        const px = -tamanho * 0.7 + (i * tamanho * 1.4) / 4;
        const py = i % 2 === 0 ? -tamanho * 0.12 : tamanho * 0.18;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.stroke();
    c.restore();
}

function desenharFlorzinha(c, x, y, escala, cor) {
    c.fillStyle = cor;
    for (let i = 0; i < 5; i++) {
        const angulo = (i / 5) * Math.PI * 2;
        c.beginPath(); c.arc(x + Math.cos(angulo) * 1.5 * escala, y + Math.sin(angulo) * 1.5 * escala, 1.2 * escala, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = "#ffd23a";
    c.beginPath(); c.arc(x, y, 0.9 * escala, 0, Math.PI * 2); c.fill();
}

// enfeites de uma casa do tabuleiro da Páscoa (chamado pelo desenharDecoracaoDoTabuleiro)
function desenharEnfeiteDaPascoa(c, x, y, sorteio, escala) {
    if (sorteio < 0.025) { // ovinho escondido, meio deitado
        desenharOvinho(c, x, y, 4 * escala, CORES_DOS_OVINHOS[Math.floor(sorteio * 1000) % CORES_DOS_OVINHOS.length], 0.5);
    } else if (sorteio < 0.08) {
        desenharFlorzinha(c, x, y, escala * 1.3, sorteio < 0.05 ? "#ffffff" : "#ffb3d4");
    } else if (sorteio < 0.2) { // tufinho de grama
        c.strokeStyle = "rgba(120, 170, 90, 0.45)";
        c.lineWidth = 0.8 * escala;
        c.lineCap = "round";
        c.beginPath();
        for (const dx of [-1, 0, 1]) { c.moveTo(x + dx * escala, y + 1.5 * escala); c.lineTo(x + dx * 1.6 * escala, y - 1.5 * escala); }
        c.stroke();
    }
}

// ==========================================
// Prêmios das missões da Páscoa
// ==========================================

// orelhas de coelho deitadas pra trás, mexendo de leve (mesmas medidas do desenharChapeu)
function desenharOrelhasDeCoelho(c, tempo) {
    c.save();
    c.lineJoin = "round";
    c.strokeStyle = TINTA_DE_GIBI;
    for (const lado of [-1, 1]) {
        const mexe = Math.sin(tempo / 300 + (lado > 0 ? 0 : 1.3)) * 0.07;
        c.save();
        c.translate(-5, lado * 6);
        c.rotate(Math.PI - lado * (0.18 + mexe));
        c.fillStyle = "#f4f1ea";
        c.lineWidth = 1.6;
        c.beginPath(); c.ellipse(11, 0, 12, 4.8, 0, 0, Math.PI * 2); c.fill(); c.stroke();
        c.fillStyle = "#ffb3c7"; // dentro da orelha
        c.beginPath(); c.ellipse(12, 0, 8.5, 2.4, 0, 0, Math.PI * 2); c.fill();
        c.restore();
    }
    for (const lado of [-1, 1]) { // os olhos ficam por cima
        c.fillStyle = "#ffe066";
        c.beginPath(); c.arc(-3, lado * 11, 6.6, 0, Math.PI * 2); c.fill();
        c.lineWidth = 1.2; c.stroke();
        c.fillStyle = "#2a1200";
        c.beginPath(); c.ellipse(-1, lado * 11, 1.5, 4.2, 0, 0, Math.PI * 2); c.fill();
    }
    c.restore();
}

// corpo "Chocolate": brilho de um lado e os risquinhos de barra de chocolate
function desenharBrilhoDeChocolate(c, pontos, largura) {
    const passo = largura * 0.7;
    const brilho = [[]];
    const riscos = [];
    let andado = 0;
    let proxima = largura * 0.8;
    for (let i = 1; i < pontos.length; i++) {
        const de = pontos[i - 1];
        const ate = pontos[i];
        const distancia = Math.hypot(ate.x - de.x, ate.y - de.y);
        if (distancia === 0) continue;
        if (distancia > TAMANHO_CELULA * 1.5) { // atravessou a borda
            brilho.push([]);
            continue;
        }
        const nx = -(ate.y - de.y) / distancia;
        const ny = (ate.x - de.x) / distancia;
        brilho[brilho.length - 1].push({ x: de.x + nx * largura * 0.2, y: de.y + ny * largura * 0.2 });
        while (proxima <= andado + distancia) {
            const t = (proxima - andado) / distancia;
            riscos.push({ x: de.x + (ate.x - de.x) * t, y: de.y + (ate.y - de.y) * t, nx, ny });
            proxima += passo;
        }
        andado += distancia;
    }

    c.save();
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = "rgba(45, 20, 8, 0.45)";
    c.lineWidth = largura * 0.07;
    c.beginPath();
    for (const risco of riscos) {
        c.moveTo(risco.x - risco.nx * largura * 0.24, risco.y - risco.ny * largura * 0.24);
        c.lineTo(risco.x + risco.nx * largura * 0.12, risco.y + risco.ny * largura * 0.12);
    }
    c.stroke();
    c.strokeStyle = "rgba(255, 215, 175, 0.4)";
    c.lineWidth = largura * 0.1;
    c.beginPath();
    for (const trecho of brilho) trecho.forEach((ponto, i) => (i === 0 ? c.moveTo(ponto.x, ponto.y) : c.lineTo(ponto.x, ponto.y)));
    c.stroke();
    c.restore();
}

// ==========================================
// Época: Festa Junina (tabuleiro de terra com bandeirinhas, milho, chapéu de palha, xadrez e pipoca).
// Mesmo estilo de gibi do Halloween (usa a TINTA_DE_GIBI de lá).
// ==========================================
const CORES_DAS_BANDEIRINHAS = ["#ff4d4d", "#ffd23a", "#4dabf7", "#7bd389", "#ff8fd8", "#ffffff"];

// espiga de milho cozido, um pouco deitada (comida da época)
function desenharMilho(c, cx, cy, r) {
    c.save();
    c.translate(cx, cy);
    c.rotate(-0.6);
    c.lineJoin = "round";
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = Math.max(0.8, r * 0.12);

    c.fillStyle = "#6ab04c"; // a palha verde aberta embaixo
    for (const lado of [-1, 1]) {
        c.beginPath();
        c.moveTo(0, r * 0.75);
        c.quadraticCurveTo(lado * r * 0.75, r * 0.55, lado * r * 0.55, -r * 0.1);
        c.quadraticCurveTo(lado * r * 0.25, r * 0.3, 0, r * 0.75);
        c.fill();
        c.stroke();
    }

    const espiga = () => { c.beginPath(); c.ellipse(0, -r * 0.12, r * 0.4, r * 0.92, 0, 0, Math.PI * 2); };
    c.fillStyle = "#ffd23a";
    espiga(); c.fill();
    c.save();
    espiga(); c.clip();
    c.fillStyle = "#e9a90b"; // os grãos
    for (let linha = -5; linha <= 4; linha++) {
        for (let coluna = -1; coluna <= 1; coluna++) {
            const x = coluna * r * 0.26 + (linha % 2 === 0 ? r * 0.13 : 0);
            c.beginPath(); c.ellipse(x, linha * r * 0.19, r * 0.08, r * 0.06, 0, 0, Math.PI * 2); c.fill();
        }
    }
    c.fillStyle = "rgba(255, 250, 210, 0.75)"; // a manteiga brilhando
    c.beginPath(); c.ellipse(-r * 0.15, -r * 0.4, r * 0.08, r * 0.35, 0, 0, Math.PI * 2); c.fill();
    c.restore();
    espiga(); c.stroke();
    c.restore();
}

// fogueirinha (enfeite do tabuleiro): lenha cruzada e o fogo tremendo
function desenharFogueirinha(c, x, y, escala, tempo) {
    const chama = 0.85 + 0.15 * Math.sin(tempo / 70 + x) * Math.sin(tempo / 43 + y);
    c.save();
    c.translate(x, y);
    c.scale(escala, escala);
    c.fillStyle = `rgba(255, 150, 40, ${0.18 * chama})`; // luz no chão
    c.beginPath(); c.arc(0, 0.5, 7, 0, Math.PI * 2); c.fill();
    c.lineCap = "round";
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(-4, 3); c.lineTo(4, 0.5); c.moveTo(4, 3); c.lineTo(-4, 0.5); c.stroke();
    c.strokeStyle = "#8a5a2b";
    c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(-4, 3); c.lineTo(4, 0.5); c.moveTo(4, 3); c.lineTo(-4, 0.5); c.stroke();
    for (const [cor, altura, largura] of [["#ff6b1a", 6.5, 3.2], ["#ffd23a", 4, 1.8]]) {
        c.fillStyle = cor;
        c.beginPath();
        c.moveTo(-largura, 1.5);
        c.quadraticCurveTo(-largura, -altura * 0.4 * chama, 0, -altura * chama);
        c.quadraticCurveTo(largura, -altura * 0.4 * chama, largura, 1.5);
        c.closePath();
        c.fill();
    }
    c.restore();
}

// enfeites de uma casa do tabuleiro da Festa Junina (chamado pelo desenharDecoracaoDoTabuleiro)
function desenharEnfeiteJunino(c, x, y, sorteio, escala, tempo) {
    if (sorteio < 0.012) {
        desenharFogueirinha(c, x, y, escala * 1.2, tempo);
    } else if (sorteio < 0.025) { // bandeirinha que caiu no chão
        c.save();
        c.translate(x, y);
        c.rotate(sorteio * 300);
        c.fillStyle = CORES_DAS_BANDEIRINHAS[Math.floor(sorteio * 1000) % CORES_DAS_BANDEIRINHAS.length];
        c.globalAlpha = 0.7;
        c.beginPath(); c.moveTo(-2.4 * escala, -1.6 * escala); c.lineTo(2.4 * escala, -1.6 * escala); c.lineTo(0, 2.4 * escala); c.closePath(); c.fill();
        c.restore();
    } else if (sorteio < 0.28) { // palhinha no chão de terra
        c.strokeStyle = "rgba(240, 200, 120, 0.22)";
        c.lineWidth = 0.8 * escala;
        c.lineCap = "round";
        const angulo = sorteio * 40;
        c.beginPath();
        c.moveTo(x - Math.cos(angulo) * 2.5 * escala, y - Math.sin(angulo) * 2.5 * escala);
        c.lineTo(x + Math.cos(angulo) * 2.5 * escala, y + Math.sin(angulo) * 2.5 * escala);
        c.stroke();
    }
}

// por cima de tudo do tabuleiro: o varal de bandeirinhas balançando no alto
function desenharBandeirinhas(c, largura, altura, lado, tempo) {
    const vao = lado * 6; // o varal cai um pouco entre um prego e outro
    const alturaDoVaral = (x) => {
        const t = (x % vao) / vao;
        return lado * 0.1 + lado * 0.8 * 4 * t * (1 - t);
    };

    c.save();
    c.lineJoin = "round";
    c.strokeStyle = "#2b1a0c";
    c.lineWidth = lado * 0.05;
    c.beginPath();
    for (let x = 0; x <= largura; x += lado / 4) {
        if (x === 0) c.moveTo(x, alturaDoVaral(x)); else c.lineTo(x, alturaDoVaral(x));
    }
    c.stroke();
    for (let i = 0; (i + 0.5) * lado * 0.75 < largura; i++) {
        const x = (i + 0.5) * lado * 0.75;
        c.save();
        c.translate(x, alturaDoVaral(x));
        c.rotate(Math.sin(tempo / 600 + i * 0.9) * 0.15);
        c.fillStyle = CORES_DAS_BANDEIRINHAS[i % CORES_DAS_BANDEIRINHAS.length];
        c.strokeStyle = TINTA_DE_GIBI;
        c.lineWidth = lado * 0.03;
        c.beginPath();
        c.moveTo(-lado * 0.28, 0);
        c.lineTo(lado * 0.28, 0);
        c.lineTo(lado * 0.28, lado * 0.42);
        c.lineTo(0, lado * 0.28); // o recorte em V embaixo
        c.lineTo(-lado * 0.28, lado * 0.42);
        c.closePath();
        c.fill();
        c.stroke();
        c.restore();
    }
    c.restore();
}

// ==========================================
// Prêmios das missões da Festa Junina
// ==========================================

// chapéu de palha de aba larga, puxado por cima dos olhos (a sombra cai no focinho), com a palhinha no canto da boca
function desenharChapeuDePalha(c, tempo) {
    desenharPalhinhaNaBoca(c, tempo);
    const aba = () => { c.beginPath(); c.ellipse(-4, 0, 14, 23, 0, 0, Math.PI * 2); };

    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";

    c.fillStyle = "rgba(0, 0, 0, 0.28)"; // a sombra da aba na frente da cabeça
    c.beginPath(); c.ellipse(-1, 0, 14.5, 22, 0, 0, Math.PI * 2); c.fill();

    c.strokeStyle = "#c9a24a"; // fiapos de palha soltos em volta da aba
    c.lineWidth = 1.2;
    c.beginPath();
    for (let i = 0; i < 16; i++) {
        const angulo = (i / 16) * Math.PI * 2 + (i % 3) * 0.08;
        const comprimento = 1.6 + (i % 4) * 0.7;
        const x = -4 + Math.cos(angulo) * 14;
        const y = Math.sin(angulo) * 23;
        c.moveTo(x, y);
        c.lineTo(x + Math.cos(angulo) * comprimento, y + Math.sin(angulo) * comprimento * 1.3);
    }
    c.stroke();

    c.fillStyle = "#e8c46a";
    aba(); c.fill();
    c.save();
    aba(); c.clip();
    c.strokeStyle = "rgba(150, 100, 30, 0.45)"; // a palha trançada: voltas e raios
    c.lineWidth = 0.8;
    for (const raio of [0.55, 0.72, 0.88]) {
        c.beginPath(); c.ellipse(-4, 0, 14 * raio, 23 * raio, 0, 0, Math.PI * 2); c.stroke();
    }
    c.beginPath();
    for (let i = 0; i < 16; i++) {
        const angulo = (i / 16) * Math.PI * 2;
        c.moveTo(-4 + Math.cos(angulo) * 7, Math.sin(angulo) * 11.5);
        c.lineTo(-4 + Math.cos(angulo) * 14, Math.sin(angulo) * 23);
    }
    c.stroke();
    c.fillStyle = "rgba(150, 100, 30, 0.22)"; // lado na sombra
    c.fillRect(-20, -25, 32, 22);
    c.restore();
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = 1.8;
    aba(); c.stroke();

    c.fillStyle = "#d9ad4a"; // a copa, com a fita vermelha
    c.lineWidth = 1.6;
    c.beginPath(); c.ellipse(-5, 0, 7, 11.5, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.strokeStyle = "#d62839";
    c.lineWidth = 2.2;
    c.beginPath(); c.ellipse(-5, 0, 7.8, 12.6, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "#c4963a"; // o amassado no meio da copa
    c.beginPath(); c.ellipse(-5.5, 0, 2.2, 6, 0, 0, Math.PI * 2); c.fill();

    c.save(); // remendo de chita na aba
    c.translate(-12, 14);
    c.rotate(0.35);
    c.fillStyle = "#4dabf7";
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineWidth = 1;
    c.fillRect(-3, -3, 6, 6); c.strokeRect(-3, -3, 6, 6);
    c.fillStyle = "#ff8fd8";
    for (const [x, y] of [[-1.4, -1.2], [1.4, 1.2]]) { c.beginPath(); c.arc(x, y, 1, 0, Math.PI * 2); c.fill(); }
    c.restore();
    c.restore();
}

// palhinha de capim no canto da boca, balançando (vai junto com o chapéu de palha)
function desenharPalhinhaNaBoca(c, tempo) {
    const balanco = Math.sin(tempo / 500) * 0.12;
    c.save();
    c.translate(16, 5);
    c.rotate(0.45 + balanco);
    c.strokeStyle = TINTA_DE_GIBI;
    c.lineCap = "round";
    c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(13, 0); c.stroke();
    c.strokeStyle = "#e8c46a";
    c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(13, 0); c.stroke();
    c.strokeStyle = "#b8862e"; // a pontinha de semente
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(13, 0); c.lineTo(16, -1.6); c.moveTo(13, 0); c.lineTo(16, 1.4); c.stroke();
    c.restore();
}

// corpo "Xadrez": camisa de quadrilha, faixas claras e escuras cruzando o corpo vermelho
function desenharXadrez(c, pontos, largura) {
    let total = 0;
    for (let i = 1; i < pontos.length; i++) {
        const d = Math.hypot(pontos[i].x - pontos[i - 1].x, pontos[i].y - pontos[i - 1].y);
        if (d <= TAMANHO_CELULA * 1.5) total += d;
    }

    const passo = largura * 0.55;
    const faixas = [];
    const linhas = [[], []];
    let andado = 0;
    let proxima = largura * 0.7;
    for (let i = 1; i < pontos.length; i++) {
        const de = pontos[i - 1];
        const ate = pontos[i];
        const distancia = Math.hypot(ate.x - de.x, ate.y - de.y);
        if (distancia === 0) continue;
        if (distancia > TAMANHO_CELULA * 1.5) { // atravessou a borda
            linhas.forEach((linha) => linha.push(null));
            continue;
        }
        const nx = -(ate.y - de.y) / distancia;
        const ny = (ate.x - de.x) / distancia;
        const largo = largura * (0.6 + 0.4 * (1 - andado / total)); // o corpo afina no rabo
        [-0.2, 0.2].forEach((lado, k) => linhas[k].push({ x: de.x + nx * largo * lado, y: de.y + ny * largo * lado }));
        while (proxima <= andado + distancia) {
            const t = (proxima - andado) / distancia;
            faixas.push({ x: de.x + (ate.x - de.x) * t, y: de.y + (ate.y - de.y) * t, nx, ny, largo, clara: faixas.length % 2 === 0 });
            proxima += passo;
        }
        andado += distancia;
    }

    c.save();
    c.lineCap = "butt";
    for (const clara of [false, true]) { // as faixas atravessadas
        c.strokeStyle = clara ? "rgba(255, 240, 230, 0.4)" : "rgba(60, 10, 10, 0.3)";
        c.lineWidth = largura * (clara ? 0.16 : 0.1);
        c.beginPath();
        for (const faixa of faixas.filter((outra) => outra.clara === clara)) {
            c.moveTo(faixa.x - faixa.nx * faixa.largo * 0.42, faixa.y - faixa.ny * faixa.largo * 0.42);
            c.lineTo(faixa.x + faixa.nx * faixa.largo * 0.42, faixa.y + faixa.ny * faixa.largo * 0.42);
        }
        c.stroke();
    }
    c.strokeStyle = "rgba(255, 240, 230, 0.4)"; // as faixas no comprido
    c.lineWidth = largura * 0.1;
    c.lineJoin = "round";
    c.beginPath();
    for (const linha of linhas) {
        let comecou = false;
        for (const ponto of linha) {
            if (!ponto) { comecou = false; continue; }
            if (comecou) c.lineTo(ponto.x, ponto.y); else c.moveTo(ponto.x, ponto.y);
            comecou = true;
        }
    }
    c.stroke();
    c.restore();
}

// rastro "Pipoca": pipoquinhas que pulam do rabo e caem
function desenharPipoca(c, x, y, tamanho, giro) {
    c.save();
    c.translate(x, y);
    c.rotate(giro);
    c.fillStyle = "#fff8e6";
    c.strokeStyle = "rgba(120, 80, 20, 0.6)";
    c.lineWidth = tamanho * 0.18;
    c.beginPath();
    for (const [px, py, raio] of [[-0.45, 0.1, 0.55], [0.4, 0.15, 0.55], [0, -0.4, 0.6], [0.05, 0.45, 0.45]]) {
        c.moveTo(px * tamanho + raio * tamanho, py * tamanho);
        c.arc(px * tamanho, py * tamanho, raio * tamanho, 0, Math.PI * 2);
    }
    c.stroke();
    c.fill();
    c.fillStyle = "#f5c04a"; // o miolinho amarelo
    c.beginPath(); c.arc(0.05 * tamanho, 0.1 * tamanho, tamanho * 0.22, 0, Math.PI * 2); c.fill();
    c.restore();
}
