// ==========================================
// Cenários: tabuleiros desenhados (Coliseu, Selva, Arena) e o que aparece em volta deles.
// O desenho é feito uma vez só numa tela guardada e colado a cada quadro: não pesa no jogo.
// ==========================================
const TINTA_DO_CENARIO = "#10131c";
const telaDoCenario = document.createElement("canvas");
const brilhoDaTocha = document.createElement("canvas");
let cenarioMontado = "";   // pra saber quando redesenhar (mudou o tema ou o tamanho)
let cenarioDeForaMontado = "";

// número de 0 a 1 que é sempre o mesmo pros mesmos valores
function sorteioDoCenario(a, b, sal = 0) {
    const numero = Math.imul(a + 1 + sal * 7, 73856093) ^ Math.imul(b + 1 + sal * 13, 19349663);
    return (((numero >>> 0) ^ ((numero >>> 0) >>> 13)) % 1000) / 1000;
}

function desenharChaoDoColiseu(c, L, A, lado) {
    const colunas = L / lado, linhas = A / lado;
    for (let y = 0; y < linhas; y++) {
        for (let x = 0; x < colunas; x++) {
            const luz = 58 + sorteioDoCenario(x, y, 4) * 8 + ((x + y) % 2 ? 4 : 0);
            c.fillStyle = `hsl(32, 42%, ${luz}%)`;
            c.fillRect(x * lado, y * lado, lado, lado);
            // cada laje tem um lado claro e um escuro
            c.fillStyle = "rgba(255, 240, 200, 0.28)";
            c.fillRect(x * lado, y * lado, lado, 1.2);
            c.fillRect(x * lado, y * lado, 1.2, lado);
            c.fillStyle = "rgba(70, 35, 10, 0.28)";
            c.fillRect(x * lado, (y + 1) * lado - 1.2, lado, 1.2);
            c.fillRect((x + 1) * lado - 1.2, y * lado, 1.2, lado);

            const sorteio = sorteioDoCenario(x, y);
            if (sorteio < 0.1) { // rachadura
                c.strokeStyle = "rgba(60, 30, 10, 0.6)";
                c.lineWidth = 0.9;
                c.lineCap = "round";
                let px = (x + 0.2) * lado, py = (y + 0.2 + sorteio * 4) * lado;
                c.beginPath();
                c.moveTo(px, py);
                for (let pedaco = 0; pedaco < 3; pedaco++) {
                    px += lado * 0.22;
                    py += (sorteioDoCenario(x + pedaco, y, 9) - 0.5) * 8;
                    c.lineTo(px, py);
                }
                c.stroke();
            } else if (sorteio < 0.14) { // marca de garra
                c.strokeStyle = "rgba(90, 30, 10, 0.35)";
                c.lineWidth = 1.2;
                for (const desvio of [0, 3, 6]) {
                    c.beginPath();
                    c.moveTo((x + 0.25) * lado + desvio, (y + 0.25) * lado);
                    c.lineTo((x + 0.1) * lado + desvio, (y + 0.75) * lado);
                    c.stroke();
                }
            }
        }
    }

    // a cobra enrolada pintada no meio da arena, em vermelho desbotado
    const cx = L / 2, cy = A / 2, raio = Math.min(L, A) * 0.26;
    c.strokeStyle = "rgba(170, 45, 30, 0.34)";
    c.lineWidth = 7;
    c.beginPath(); c.arc(cx, cy, raio, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2.5;
    c.beginPath(); c.arc(cx, cy, raio * 0.8, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 11;
    c.lineCap = "round";
    c.beginPath();
    for (let angulo = 0; angulo < 9.5; angulo += 0.2) {
        const q = raio * 0.6 * (1 - angulo / 12);
        c.lineTo(cx + Math.cos(angulo) * q, cy + Math.sin(angulo) * q);
    }
    c.stroke();

    // sombra nas bordas e a luz das tochas nos quatro cantos
    const sombra = c.createRadialGradient(cx, cy, Math.min(L, A) * 0.3, cx, cy, Math.hypot(L, A) * 0.6);
    sombra.addColorStop(0, "rgba(60, 20, 0, 0)");
    sombra.addColorStop(1, "rgba(50, 15, 0, 0.55)");
    c.fillStyle = sombra;
    c.fillRect(0, 0, L, A);
    for (const [x, y] of [[0, 0], [L, 0], [0, A], [L, A]]) {
        const luz = c.createRadialGradient(x, y, 0, x, y, lado * 7);
        luz.addColorStop(0, "rgba(255, 170, 50, 0.45)");
        luz.addColorStop(1, "rgba(255, 120, 30, 0)");
        c.fillStyle = luz;
        c.fillRect(0, 0, L, A);
    }
    c.strokeStyle = TINTA_DO_CENARIO;
    c.lineWidth = 6;
    c.strokeRect(0, 0, L, A);
}

function desenharChaoDaSelva(c, L, A, lado) {
    const colunas = L / lado, linhas = A / lado;
    for (let y = 0; y < linhas; y++) {
        for (let x = 0; x < colunas; x++) {
            c.fillStyle = (x + y) % 2 ? "#49a83f" : "#3f9a3a";
            c.fillRect(x * lado, y * lado, lado, lado);
        }
    }
    for (let y = 0; y < linhas; y++) {
        for (let x = 0; x < colunas; x++) {
            const sorteio = sorteioDoCenario(x, y);
            const px = (x + 0.2 + sorteioDoCenario(y, x) * 0.6) * lado, py = (y + 0.3 + sorteio * 0.5) * lado;
            if (sorteio < 0.2) { // tufo de capim
                c.strokeStyle = "#1f6b2a";
                c.lineWidth = 1.3;
                c.lineCap = "round";
                for (const desvio of [-3, 0, 3]) {
                    c.beginPath();
                    c.moveTo(px + desvio * 0.5, py + 3);
                    c.quadraticCurveTo(px + desvio * 0.6, py - 1, px + desvio, py - 3);
                    c.stroke();
                }
            } else if (sorteio < 0.235) { // flor
                c.fillStyle = TINTA_DO_CENARIO;
                c.beginPath(); c.arc(px, py, 3.8, 0, Math.PI * 2); c.fill();
                c.fillStyle = sorteioDoCenario(x, y, 2) < 0.5 ? "#ffd23a" : "#ff7ac6";
                for (let petala = 0; petala < 5; petala++) {
                    c.beginPath(); c.arc(px + Math.cos(petala * 1.26) * 2, py + Math.sin(petala * 1.26) * 2, 1.6, 0, Math.PI * 2); c.fill();
                }
                c.fillStyle = "#fff";
                c.beginPath(); c.arc(px, py, 1.1, 0, Math.PI * 2); c.fill();
            } else if (sorteio < 0.26) { // pedrinha
                c.fillStyle = TINTA_DO_CENARIO;
                c.beginPath(); c.ellipse(px, py, 4, 3, 0, 0, Math.PI * 2); c.fill();
                c.fillStyle = "#9aa6a0";
                c.beginPath(); c.ellipse(px, py - 0.4, 3, 2, 0, 0, Math.PI * 2); c.fill();
            }
        }
    }
    const sombra = c.createRadialGradient(L / 2, A / 2, Math.min(L, A) * 0.35, L / 2, A / 2, Math.hypot(L, A) * 0.58);
    sombra.addColorStop(0, "rgba(0, 30, 20, 0)");
    sombra.addColorStop(1, "rgba(0, 30, 20, 0.5)");
    c.fillStyle = sombra;
    c.fillRect(0, 0, L, A);
    c.strokeStyle = TINTA_DO_CENARIO;
    c.lineWidth = 5;
    c.strokeRect(0, 0, L, A);
}

function desenharChaoDaArena(c, L, A, lado) {
    const colunas = L / lado, linhas = A / lado;
    for (let y = 0; y < linhas; y++) {
        for (let x = 0; x < colunas; x++) {
            c.fillStyle = (x + y) % 2 ? "#1d2c47" : "#17233a";
            c.fillRect(x * lado, y * lado, lado, lado);
        }
    }
    const cx = L / 2, cy = A / 2, alcance = Math.hypot(L, A);
    c.fillStyle = "rgba(255, 70, 90, 0.025)";
    for (let raio = 0; raio < 16; raio++) {
        const angulo = (raio / 16) * Math.PI * 2;
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx + Math.cos(angulo) * alcance, cy + Math.sin(angulo) * alcance);
        c.lineTo(cx + Math.cos(angulo + 0.2) * alcance, cy + Math.sin(angulo + 0.2) * alcance);
        c.closePath();
        c.fill();
    }
    const brilho = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(L, A) * 0.55);
    brilho.addColorStop(0, "rgba(255, 60, 100, 0.2)");
    brilho.addColorStop(0.55, "rgba(120, 50, 210, 0.12)");
    brilho.addColorStop(1, "rgba(0, 0, 0, 0)");
    c.fillStyle = brilho;
    c.fillRect(0, 0, L, A);
    // retícula de gibi, mais forte nos cantos
    c.fillStyle = "rgba(255, 255, 255, 0.1)";
    const passo = 7;
    for (let y = 0; y < A; y += passo) {
        for (let x = (y / passo) % 2 ? passo / 2 : 0; x < L; x += passo) {
            const raio = (Math.hypot(x - cx, y - cy) / (alcance / 2) - 0.62) * 3.6;
            if (raio > 0.1) {
                c.beginPath(); c.arc(x, y, raio, 0, Math.PI * 2); c.fill();
            }
        }
    }
    c.strokeStyle = "rgba(255, 210, 58, 0.2)";
    c.lineWidth = 4;
    c.beginPath(); c.arc(cx, cy, Math.min(L, A) * 0.27, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 1.5;
    c.beginPath(); c.arc(cx, cy, Math.min(L, A) * 0.31, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = TINTA_DO_CENARIO;
    c.lineWidth = 7;
    c.strokeRect(0, 0, L, A);
    c.shadowColor = "#ff4a6e";
    c.shadowBlur = 12;
    c.strokeStyle = "#ff5a7e";
    c.lineWidth = 2;
    c.strokeRect(4, 4, L - 8, A - 8);
    c.shadowBlur = 0;
}

// ---------- o que fica em volta do tabuleiro ----------
function desenharTorcida(c, L, A) {
    c.fillStyle = "#2a1a12";
    c.fillRect(0, 0, L, A);
    const fila = 46;
    for (let y = 0; y < A; y += fila) {
        c.fillStyle = (y / fila) % 2 ? "#3a2418" : "#33201a";
        c.fillRect(0, y, L, fila);
        c.fillStyle = "#1a0f0a";
        c.fillRect(0, y + fila - 4, L, 4);
        for (let x = ((y / fila) % 2) * 18; x < L; x += 36) {
            const sorteio = sorteioDoCenario(x, y);
            c.fillStyle = sorteio < 0.15 ? "#54261c" : sorteio < 0.25 ? "#5e4420" : "#1c120d";
            c.beginPath(); c.arc(x + 18, y + 19, 9, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.ellipse(x + 18, y + 40, 14, 15, 0, 0, Math.PI * 2); c.fill();
        }
    }
}

function desenharFolhagem(c, L, A) {
    c.fillStyle = "#0b2a1c";
    c.fillRect(0, 0, L, A);
    const folhas = Math.round((L * A) / 5000);
    c.strokeStyle = TINTA_DO_CENARIO;
    c.lineWidth = 2.5;
    for (let i = 0; i < folhas; i++) {
        const x = sorteioDoCenario(i, 1) * L, y = sorteioDoCenario(i, 2) * A;
        const raio = 26 + sorteioDoCenario(i, 3) * 54, angulo = sorteioDoCenario(i, 4) * Math.PI * 2;
        c.fillStyle = ["#0f3a24", "#14482a", "#0c3120", "#1a5a30"][i % 4];
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(x + Math.cos(angulo + 0.6) * raio, y + Math.sin(angulo + 0.6) * raio, x + Math.cos(angulo) * raio * 1.7, y + Math.sin(angulo) * raio * 1.7);
        c.quadraticCurveTo(x + Math.cos(angulo - 0.6) * raio, y + Math.sin(angulo - 0.6) * raio, x, y);
        c.fill();
        c.stroke();
    }
}

function desenharHoloFotes(c, L, A) {
    c.fillStyle = "#0a0e1a";
    c.fillRect(0, 0, L, A);
    const alcance = Math.hypot(L, A);
    for (let raio = 0; raio < 18; raio++) {
        const angulo = (raio / 18) * Math.PI * 2;
        c.fillStyle = raio % 2 ? "rgba(255, 70, 90, 0.05)" : "rgba(120, 60, 220, 0.04)";
        c.beginPath();
        c.moveTo(L / 2, A / 2);
        c.lineTo(L / 2 + Math.cos(angulo) * alcance, A / 2 + Math.sin(angulo) * alcance);
        c.lineTo(L / 2 + Math.cos(angulo + 0.35) * alcance, A / 2 + Math.sin(angulo + 0.35) * alcance);
        c.closePath();
        c.fill();
    }
    c.fillStyle = "rgba(255, 255, 255, 0.07)";
    for (let y = 0; y < A; y += 11) {
        for (let x = (y / 11) % 2 ? 5 : 0; x < L; x += 11) {
            c.beginPath(); c.arc(x, y, 1.7, 0, Math.PI * 2); c.fill();
        }
    }
}

const DESENHOS_DOS_CENARIOS = {
    coliseu: { chao: desenharChaoDoColiseu, fora: desenharTorcida },
    selva: { chao: desenharChaoDaSelva, fora: desenharFolhagem },
    arena: { chao: desenharChaoDaArena, fora: desenharHoloFotes },
};

function atualizarCenarioDeFora(tema) {
    const tela = document.getElementById("cenarioDeFora");
    const desenhos = DESENHOS_DOS_CENARIOS[tema.id];
    if (!desenhos) {
        if (!tela.hidden) tela.hidden = true;
        return;
    }
    if (tela.hidden) tela.hidden = false;
    const chave = `${tema.id} ${window.innerWidth}x${window.innerHeight}`;
    if (cenarioDeForaMontado === chave) return;
    cenarioDeForaMontado = chave;
    const escala = Math.min(window.devicePixelRatio || 1, 2);
    tela.width = Math.round(window.innerWidth * escala);
    tela.height = Math.round(window.innerHeight * escala);
    const c = tela.getContext("2d");
    c.setTransform(escala, 0, 0, escala, 0, 0);
    desenhos.fora(c, window.innerWidth, window.innerHeight);
}

// as tochas do Coliseu tremem (uma manchinha de luz em cada canto)
function desenharTochas() {
    if (reduzirMovimento) return;
    if (!brilhoDaTocha.width) {
        brilhoDaTocha.width = brilhoDaTocha.height = 128;
        const c = brilhoDaTocha.getContext("2d");
        const luz = c.createRadialGradient(64, 64, 0, 64, 64, 64);
        luz.addColorStop(0, "rgba(255, 190, 80, 0.9)");
        luz.addColorStop(1, "rgba(255, 120, 30, 0)");
        c.fillStyle = luz;
        c.fillRect(0, 0, 128, 128);
    }
    const agora = performance.now(), tamanho = TAMANHO_CELULA * 7;
    const cantos = [[0, 0], [LARGURA_TABULEIRO, 0], [0, ALTURA_TABULEIRO], [LARGURA_TABULEIRO, ALTURA_TABULEIRO]];
    ctx.save();
    cantos.forEach(([x, y], indice) => {
        ctx.globalAlpha = 0.14 + 0.12 * (0.5 + 0.5 * Math.sin(agora / 85 + indice * 2) * Math.sin(agora / 37 + indice));
        ctx.drawImage(brilhoDaTocha, x - tamanho, y - tamanho, tamanho * 2, tamanho * 2);
    });
    ctx.restore();
}

// devolve true se desenhou (tema com cenário); senão o tabuleiro é o xadrez de sempre
function desenharCenario(tema) {
    atualizarCenarioDeFora(tema);
    const desenhos = DESENHOS_DOS_CENARIOS[tema.id];
    if (!desenhos) return false;
    const chave = `${tema.id} ${canvas.width}x${canvas.height} ${COLUNAS}x${LINHAS}`;
    if (cenarioMontado !== chave) {
        cenarioMontado = chave;
        telaDoCenario.width = canvas.width;
        telaDoCenario.height = canvas.height;
        const c = telaDoCenario.getContext("2d");
        const escala = canvas.width / LARGURA_TABULEIRO;
        c.setTransform(escala, 0, 0, escala, 0, 0);
        desenhos.chao(c, LARGURA_TABULEIRO, ALTURA_TABULEIRO, TAMANHO_CELULA);
    }
    ctx.drawImage(telaDoCenario, 0, 0, LARGURA_TABULEIRO, ALTURA_TABULEIRO);
    if (tema.id === "coliseu") desenharTochas();
    return true;
}
