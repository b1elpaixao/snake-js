// ==========================================
// Sensação: o estouro ao comer e ao bater (vale pra todo mundo, com ou sem item da loja).
// Só enfeite, com sorteio próprio: não mexe nas regras nem no sorteio das partidas.
// ==========================================
const DURACAO_DO_ESTOURO_MS = 420;
let estouros = [];
let sementeDoEstouro = 777;

function sorteioDoEstouro() {
    sementeDoEstouro = (sementeDoEstouro * 1103515245 + 12345) % 2147483648;
    return sementeDoEstouro / 2147483648;
}

// força: 1 comida comum; sobe com o combo e na batida
function soltarEstouro(casa, cor, forca = 1) {
    if (reduzirMovimento) return;
    const centro = centroDaCasa(casa);
    const quantidade = Math.min(18, 7 + forca * 3);
    const pontos = [];
    for (let i = 0; i < quantidade; i++) {
        const angulo = (i / quantidade) * Math.PI * 2 + sorteioDoEstouro() * 0.5;
        const velocidade = (45 + sorteioDoEstouro() * 45) * (1 + forca * 0.12);
        pontos.push({ vx: Math.cos(angulo) * velocidade, vy: Math.sin(angulo) * velocidade, tamanho: 2.4 + sorteioDoEstouro() * 2.4 });
    }
    estouros.push({ x: centro.x, y: centro.y, cor, forca, nasceu: performance.now(), pontos });
    if (estouros.length > 24) estouros.shift();
}

function desenharEstouros() {
    const agora = performance.now();
    estouros = estouros.filter((estouro) => agora - estouro.nasceu < DURACAO_DO_ESTOURO_MS);
    for (const estouro of estouros) {
        const idade = (agora - estouro.nasceu) / DURACAO_DO_ESTOURO_MS;
        const t = (agora - estouro.nasceu) / 1000;

        ctx.save();
        ctx.globalAlpha = (1 - idade) * 0.75;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3.5 * (1 - idade);
        ctx.beginPath();
        ctx.arc(estouro.x, estouro.y, 7 + idade * (15 + estouro.forca * 3), 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1 - idade * idade;
        ctx.fillStyle = estouro.cor;
        for (const ponto of estouro.pontos) {
            ctx.beginPath();
            ctx.arc(estouro.x + ponto.vx * t, estouro.y + ponto.vy * t, ponto.tamanho * (1 - idade * 0.6), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// o número do placar dá um pulinho quando sobe
function pularPlacar(elemento) {
    if (reduzirMovimento || !elemento.animate) return;
    elemento.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.45)" }, { transform: "scale(1)" }],
        { duration: 220, easing: "ease-out" }
    );
}
