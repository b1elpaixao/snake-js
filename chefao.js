// ==========================================
// Modo Chefão: você contra "os olhos que emergem", uma sombra (estilo "aura") que caça você.
// Pra derrotar: pegue a espada e acerte o corpo dela, ou faça ela bater (em você, na parede, numa pedra).
// Cada chefão derrotado dá pontos e chama outro mais forte.
// ==========================================
let chefao = null; // o jogador que é o chefão (só no modo Chefão)
let numeroDoChefao = 0;
let chefoesDerrotados = 0;
let espada = null; // { x, y } quando está no chão
let proximaEspadaEm = 0;
const TEMA_DO_ABISMO = { id: "abismo", nome: "Abismo", claro: "#112033", escuro: "#0e1a2b", decoracao: true }; // o tabuleiro do Chefão: escuro, pra aura aparecer

function temEspada(jogador) {
    return jogador.espadaAte > agoraDoJogo();
}

// chamado no reiniciar: no modo Chefão, o Jogador 2 vira o chefão
function prepararChefao() {
    chefao = null;
    espada = null;
    numeroDoChefao = 0;
    chefoesDerrotados = 0;
    if (modoAtual !== "chefao") return;

    chefao = jogadores[1];
    chefao.bot = true;
    chefao.chefao = true;
    chefao.elementoPontuacao = document.createElement("span"); // os pontos do chefão não aparecem: no placar fica a vida
    chamarProximoChefao();
}

// a casa livre mais longe da sua cabeça (de 30 sorteadas)
function casaLongeDoJogador() {
    const cabeca = jogadores[0].cobra[0];
    let melhor = gerarPosicaoLivre();
    for (let i = 0; i < 30; i++) {
        const casa = gerarPosicaoLivre();
        if (distanciaManhattan(casa, cabeca) > distanciaManhattan(melhor, cabeca)) melhor = casa;
    }
    return melhor;
}

// o próximo chefão sai de uma toca longe de você: fica 2 s piscando e depois vai saindo de lá
function chamarProximoChefao() {
    numeroDoChefao++;
    const nivel = nivelDoChefao(numeroDoChefao);
    const toca = casaLongeDoJogador();
    const praOMeio = { x: Math.sign(Math.floor(COLUNAS / 2) - toca.x), y: Math.sign(Math.floor(LINHAS / 2) - toca.y) };
    const direcao = Math.abs(Math.floor(COLUNAS / 2) - toca.x) >= Math.abs(Math.floor(LINHAS / 2) - toca.y)
        ? { x: praOMeio.x || 1, y: 0 }
        : { x: 0, y: praOMeio.y || 1 };

    chefao.cobra = Array.from({ length: nivel.tamanho }, () => ({ ...toca }));
    chefao.cobraAnterior = chefao.cobra.map((pedaco) => ({ ...pedaco }));
    chefao.direcao = direcao;
    chefao.filaDirecoes = [];
    chefao.nivel = nivel;
    chefao.direcao = decidirDirecaoBot(chefao); // sai da toca desviando de pedra e parede
    chefao.direcaoAndada = { ...chefao.direcao };
    chefao.vida = nivel.vida;
    chefao.bateu = false;
    chefao.atordoadoAte = agoraDoJogo() + 2000;
    proximaEspadaEm = agoraDoJogo() + ESPADA_VOLTA_EM_MS;

    adicionarTextoFlutuante(toca, numeroDoChefao === 1 ? "Os olhos emergem!" : `Os olhos emergem! (${numeroDoChefao})`, "#ff8a80");
    anunciar(`Os olhos que emergem chegaram (${numeroDoChefao})`);
    tocarSom(110, 0.5, "sawtooth");
    atualizarPlacarDoChefao();
}

function atualizarPlacarDoChefao() {
    elementoNomeExibido2.textContent = numeroDoChefao === 1 ? "Os olhos que emergem" : `Os olhos que emergem · ${numeroDoChefao}`;
    chefao.elementoVida = chefao.elementoVida || document.getElementById("score2");
    chefao.elementoVida.textContent = "♥".repeat(Math.max(0, chefao.vida));
    chefao.elementoVida.title = `Vida dos olhos que emergem: ${chefao.vida}`;
}

// a cada passo: espada nasce, é pega, e o golpe acontece quando a sua cabeça (com espada) encosta no chefão
function atualizarChefao() {
    const jogador = jogadores[0];
    const agora = agoraDoJogo();

    if (!espada && agora >= proximaEspadaEm && !temEspada(jogador)) {
        espada = gerarPosicaoLivre();
    }

    if (espada && mesmaPosicao(jogador.cobra[0], espada)) {
        espada = null;
        jogador.espadaAte = agora + DURACAO_ESPADA_MS;
        proximaEspadaEm = agora + DURACAO_ESPADA_MS + ESPADA_VOLTA_EM_MS;
        adicionarTextoFlutuante(jogador.cobra[0], "Espada!", "#9be7ff");
        anunciar("Pegou a espada: acerte os olhos que emergem");
        tocarSom(988, 0.15, "triangle");
        vibrar(50);
    }

    const acertou = temEspada(jogador) && !estaAtordoado(chefao) &&
        chefao.cobra.some((pedaco) => mesmaPosicao(pedaco, jogador.cobra[0]));
    if (acertou) acertarChefao(jogador.cobra[0], "Golpe!");
}

// o chefão não morre de uma batida: volta pra onde estava e perde 1 de vida
function tratarBatidasDoChefao(batidas) {
    for (const { jogador } of batidas) {
        if (jogador !== chefao || estaAtordoado(chefao)) continue;
        chefao.cobra = chefao.cobraAnterior.map((pedaco) => ({ ...pedaco }));
        chefao.bateu = false;
        acertarChefao(chefao.cobra[0], "Bateu!");
    }
    // quem encostou neles: pulso de luz
    batidas
        .filter(({ jogador, motivo }) => jogador !== chefao && motivo === "outroJogador")
        .forEach(({ jogador }) => soltarPulso(jogador.cobra[0], 3));
    return batidas.filter(({ jogador }) => jogador !== chefao);
}

function acertarChefao(casa, texto) {
    chefao.vida--;
    chefao.filaDirecoes = [];
    vibrar(80);

    if (chefao.vida <= 0) {
        derrotarChefao();
        return;
    }

    chefao.cobra = encolherCobra(chefao.cobra, 2);
    chefao.cobraAnterior = chefao.cobraAnterior.slice(0, chefao.cobra.length);
    chefao.atordoadoAte = agoraDoJogo() + 1200; // pisca e fica parado: nesse tempo não leva outro golpe
    adicionarTextoFlutuante(casa, `${texto} -1 ♥`, "#ff8a80");
    soltarPulso(casa, 2);
    tocarSom(196, 0.2, "square");
    atualizarPlacarDoChefao();
}

function derrotarChefao() {
    const jogador = jogadores[0];
    const bonus = PONTOS_POR_CHEFAO * numeroDoChefao;
    const agora = agoraDoJogo();

    chefoesDerrotados++;
    jogador.pontuacao += bonus;
    jogador.elementoPontuacao.textContent = jogador.pontuacao;
    atualizarRecordeSeNecessario(jogador.pontuacao);
    adicionarTextoFlutuante(chefao.cobra[0], `Derrotados! +${bonus}`, "#f5c451");
    anunciar(`Os olhos que emergem foram derrotados! Mais ${bonus} pontos`);

    // a sombra se desfaz em brilhos
    if (!reduzirMovimento) {
        for (const pedaco of chefao.cobra) {
            const centro = centroDaCasa(pedaco);
            for (let i = 0; i < 2; i++) particulas.push(criarParticula("estrelinhas", centro.x, centro.y, agora));
        }
        soltarPulso(chefao.cobra[0], 4);
        particulas = particulas.slice(-150);
    }
    [523, 659, 784, 1047].forEach((nota, indice) => setTimeout(() => tocarSom(nota, 0.15, "triangle"), indice * 120));

    verificarConquistas({ chefoes: chefoesDerrotados });
    chamarProximoChefao();
}

// ==========================================
// Desenho da espada (no chão e o brilho em quem está com ela)
// ==========================================
function desenharEspadaNoChao() {
    if (!espada) return;
    const centro = centroDaCasa(espada);
    const sobe = reduzirMovimento ? 0 : Math.sin(agoraDoJogo() / 250) * 2;
    desenharEspada(ctx, centro.x, centro.y + sobe, TAMANHO_CELULA * ESCALA_DOS_ITEMS * 1.5);
}

// espada inclinada, com brilho azul em volta
function desenharEspada(c, x, y, tamanho) {
    const e = tamanho / 20;
    c.save();
    c.translate(x, y);
    c.rotate(-Math.PI / 4);
    c.shadowColor = "#9be7ff";
    c.shadowBlur = 10;

    c.fillStyle = "#e8f1f8"; // lâmina
    c.beginPath();
    c.moveTo(-1.8 * e, 3 * e);
    c.lineTo(-1.8 * e, -6 * e);
    c.lineTo(0, -9 * e);
    c.lineTo(1.8 * e, -6 * e);
    c.lineTo(1.8 * e, 3 * e);
    c.closePath();
    c.fill();
    c.shadowBlur = 0;
    c.fillStyle = "#9fb4c4";
    c.fillRect(-0.4 * e, -7 * e, 0.8 * e, 10 * e);

    c.fillStyle = "#f5c451"; // guarda
    c.fillRect(-4.5 * e, 3 * e, 9 * e, 1.8 * e);
    c.fillStyle = "#7b4a2a"; // cabo
    c.fillRect(-1.1 * e, 4.8 * e, 2.2 * e, 3.6 * e);
    c.fillStyle = "#f5c451";
    c.beginPath();
    c.arc(0, 9.2 * e, 1.4 * e, 0, Math.PI * 2);
    c.fill();
    c.restore();
}

// quem está com a espada brilha em azul; no último 1,5 s o brilho pisca pra avisar que vai acabar
function desenharBrilhoDaEspada(c, jogador, pontos, largura) {
    if (!temEspada(jogador)) return;
    const restante = jogador.espadaAte - agoraDoJogo();
    if (restante < 1500 && Math.floor(restante / 150) % 2 === 0) return;
    desenharContornoNeon(c, pontos, largura, "#9be7ff");
}

// ==========================================
// Pulsos de luz: um anel colorido que se abre quando a sombra leva golpe, é derrotada ou quando você encosta nela
// ==========================================
let pulsos = []; // { casa, forca, ate } (relógio de verdade: aparece até na animação de morte)

function soltarPulso(casa, forca) {
    pulsos.push({ casa: { ...casa }, forca, ate: performance.now() + 550 });
    tocarSom(196, 0.2, "sine");
}

function desenharPulsos() {
    const agora = performance.now();
    pulsos = pulsos.filter((pulso) => pulso.ate > agora);
    if (pulsos.length === 0 || reduzirMovimento) return;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.shadowBlur = 14;
    for (const pulso of pulsos) {
        const andou = 1 - (pulso.ate - agora) / 550; // 0 = acabou de sair, 1 = sumiu
        const centro = centroDaCasa(pulso.casa);
        const [r, g, b] = corDaPaleta(PALETA_DA_SOMBRA, andou);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${1 - andou})`;
        ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.arc(centro.x, centro.y, TAMANHO_CELULA * (0.4 + andou * pulso.forca * 0.5), 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}
