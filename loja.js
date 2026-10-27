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

    if (item.tipo === "tabuleiro") {
        for (let linha = 0; linha < 3; linha++) {
            for (let coluna = 0; coluna < 3; coluna++) {
                c.fillStyle = (linha + coluna) % 2 === 0 ? item.claro : item.escuro;
                c.fillRect(coluna * 24, linha * 24, 24, 24);
            }
        }
        desenharDecoracaoDoTabuleiro(c, item, 3, 3, 24, 0, 3);
    }

    if (item.tipo === "chapeu") {
        c.save();
        c.translate(38, 36);
        c.scale(1.45, 1.45);
        desenharCabecaCobra(corDaCobra().cabeca, c);
        desenharChapeu(c, item.id, 400);
        c.restore();
    } else if (item.tipo === "comida") {
        desenharComida(c, item.id, 36, 38, 20);
    } else if (item.tipo === "corpo") {
        desenharCorpoDePrevia(c, item.id, 0);
    } else if (item.tipo === "rastro") {
        desenharRastroDePrevia(c, item.id);
    } else if (item.tipo === "efeito") {
        desenharEfeitoDePrevia(c, item.id);
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
    mostrarTemasDoTabuleiro();
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
    mostrarTemasDoTabuleiro(); // tabuleiro da loja no lugar do tema (ou de volta pro tema)
}

// conquistas com prêmio mostram o que dão
function premioDaConquista(conquistaId) {
    const item = ITENS_DA_LOJA.find((opcao) => opcao.conquista === conquistaId);
    return item ? item.nome : null;
}
