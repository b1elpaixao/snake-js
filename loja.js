// ==========================================
// Moedas e loja: ganha jogando e cumprindo missões; compra chapéus e comidas novas.
// Os itens de conquista não são vendidos: só ganhando a conquista.
// ==========================================
let abaDaLoja = "chapeu";
let telaAntesDaLoja = null; // a tela que estava aberta (menu ou fim de jogo), pra voltar pra ela

function lerCarteira() {
    try {
        return limparCarteira(JSON.parse(lerDoArmazenamento("snakeCarteira")), conquistasGanhas);
    } catch {
        return limparCarteira(null, conquistasGanhas); // dado corrompido: começa sem moedas
    }
}

function salvarCarteira() {
    salvarNoArmazenamento("snakeCarteira", JSON.stringify(carteira));
}

function ganharMoedas(quantidade) {
    if (quantidade <= 0) return;

    carteira = { ...carteira, moedas: carteira.moedas + quantidade };
    salvarCarteira();
    mostrarSaldo();
}

function mostrarSaldo() {
    document.getElementById("saldoMoedas").textContent = `🪙 ${carteira.moedas}`;
    document.getElementById("saldoLoja").textContent = `🪙 ${carteira.moedas}`;
}

// chamado no fim de cada partida: 1 moeda a cada 2 pontos de quem jogou de verdade
function darMoedasDaPartida() {
    const humanos = jogadores.filter((jogador) => !jogador.bot);
    const elemento = document.getElementById("moedasGanhas");

    if (humanos.length === 0) {
        elemento.hidden = true; // partida só de bot não dá moeda
        return;
    }

    const pontos = modoCooperativo
        ? humanos.reduce((soma, jogador) => soma + jogador.pontuacao, 0)
        : Math.max(...humanos.map((jogador) => jogador.pontuacao));
    const ganhas = moedasDaPartida(pontos);

    ganharMoedas(ganhas);
    elemento.textContent = ganhas > 0
        ? `+${ganhas} 🪙 · você tem ${carteira.moedas}`
        : `Faça 2 pontos pra ganhar moedas · você tem ${carteira.moedas} 🪙`;
    elemento.hidden = false;
}

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
// Tela da loja
// ==========================================
function abrirLoja() {
    if (jogoAtivo) return; // no meio da partida não abre
    telaAntesDaLoja = [telaInicial, telaGameOver].find((tela) => !tela.hidden) || null;
    if (telaAntesDaLoja) telaAntesDaLoja.hidden = true;
    document.getElementById("telaLoja").hidden = false;
    document.getElementById("telaLoja").scrollTop = 0;
    mostrarLoja();
    document.getElementById("botaoFecharLoja").focus();
}

function fecharLoja() {
    document.getElementById("telaLoja").hidden = true;
    if (telaAntesDaLoja) telaAntesDaLoja.hidden = false;
    telaAntesDaLoja = null;
}

// desenha a prévia de um item num quadradinho com o tabuleiro de grama atrás
function desenharPreviaDoItem(canvasDaPrevia, item) {
    const lado = 72;
    const escala = window.devicePixelRatio || 1;
    canvasDaPrevia.width = lado * escala;
    canvasDaPrevia.height = lado * escala;
    const c = canvasDaPrevia.getContext("2d");
    c.setTransform(escala, 0, 0, escala, 0, 0);

    for (let linha = 0; linha < 3; linha++) {
        for (let coluna = 0; coluna < 3; coluna++) {
            c.fillStyle = (linha + coluna) % 2 === 0 ? "#aad751" : "#a2d149";
            c.fillRect(coluna * 24, linha * 24, 24, 24);
        }
    }

    if (item.tipo === "chapeu") {
        c.save();
        c.translate(38, 36);
        c.scale(1.45, 1.45);
        desenharCabecaCobra(corDaCobra().cabeca, c);
        desenharChapeu(c, item.id, 400);
        c.restore();
    } else {
        desenharComida(c, item.id, 36, 38, 20);
    }
}

function mostrarLoja() {
    mostrarSaldo();

    for (const aba of document.querySelectorAll(".aba-loja")) {
        aba.setAttribute("aria-selected", String(aba.dataset.aba === abaDaLoja));
    }

    const lista = document.getElementById("itensLoja");
    lista.innerHTML = "";

    for (const item of ITENS_DA_LOJA.filter((opcao) => opcao.tipo === abaDaLoja)) {
        const temOItem = itemDisponivel(item, conquistasGanhas, carteira.comprados);
        const equipado = carteira.equipados[item.tipo] === item.id;
        const conquista = item.conquista && CONQUISTAS.find((opcao) => opcao.id === item.conquista);

        const cartao = document.createElement("li");
        cartao.className = equipado ? "item-loja equipado" : "item-loja";

        const previa = document.createElement("canvas");
        previa.className = "previa-loja";
        desenharPreviaDoItem(previa, item);

        const nome = document.createElement("b");
        nome.textContent = item.nome;

        const botao = document.createElement("button");
        botao.type = "button";

        if (temOItem) {
            botao.className = "botao-usar";
            botao.textContent = equipado ? "Usando ✓" : "Usar";
            botao.addEventListener("click", () => usarItem(item));
        } else if (conquista) {
            botao.className = "botao-conquista";
            botao.disabled = true;
            botao.textContent = `🏆 ${conquista.nome}`;
            botao.title = `Só ganhando a conquista: ${conquista.descricao}`;
        } else {
            botao.className = "botao-comprar";
            botao.textContent = `🪙 ${item.preco}`;
            botao.disabled = carteira.moedas < item.preco;
            botao.title = botao.disabled ? `Faltam ${item.preco - carteira.moedas} moedas` : `Comprar por ${item.preco} moedas`;
            botao.addEventListener("click", () => comprarNaLoja(item));
        }

        cartao.append(previa, nome, botao);
        lista.appendChild(cartao);
    }
}

function comprarNaLoja(item) {
    const nova = comprarItem(carteira, item);
    if (!nova) return; // sem moedas, já comprado ou é de conquista
    if (!confirm(`Comprar ${item.nome} por ${item.preco} moedas?`)) return;

    carteira = equiparItem(nova, item, conquistasGanhas) || nova; // já sai usando
    salvarCarteira();
    mostrarLoja();
    tocarSom(880, 0.1, "triangle");
    anunciar(`Comprou ${item.nome}`);
}

// clicar em "Usar" coloca; clicar em "Usando" tira
function usarItem(item) {
    const nova = equiparItem(carteira, item, conquistasGanhas);
    if (!nova) return;

    carteira = nova;
    salvarCarteira();
    mostrarLoja();
}

// conquistas com prêmio mostram o que dão
function premioDaConquista(conquistaId) {
    const item = ITENS_DA_LOJA.find((opcao) => opcao.conquista === conquistaId);
    return item ? item.nome : null;
}
