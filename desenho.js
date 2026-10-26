// ==========================================
// Desenho
// ==========================================

// tamanho dos desenhos dentro da casa (1 = tamanho antigo). O tamanho das casas e o jogo não mudam.
const ESCALA_DOS_ITEMS = 1.35; // maçã, maçã dourada, power-ups e ratos
const ESCALA_DA_COBRA = 1.2;   // corpo e cabeça (mais que isso, o corpo dobrado gruda)
const ESCALA_DAS_PEDRAS = 1.12;

// desenha algo ampliado em volta do centro da casa
function comItensMaiores(centroX, centroY, desenhoDoItem) {
    ctx.save();
    ctx.translate(centroX, centroY);
    ctx.scale(ESCALA_DOS_ITEMS, ESCALA_DOS_ITEMS);
    ctx.translate(-centroX, -centroY);
    desenhoDoItem();
    ctx.restore();
}

const centroDaCasa = (posicao) => ({ x: (posicao.x + 0.5) * TAMANHO_CELULA, y: (posicao.y + 0.5) * TAMANHO_CELULA });

function desenharCelula(x, y, cor) {
    ctx.fillStyle = cor;
    ctx.fillRect(
        x * TAMANHO_CELULA,
        y * TAMANHO_CELULA,
        TAMANHO_CELULA,
        TAMANHO_CELULA
    );
}

function desenhar() {
    if (editandoFase) {
        desenharEditorDeFase();
        return;
    }

    ctx.clearRect(0, 0, LARGURA_TABULEIRO, ALTURA_TABULEIRO);

    // progresso da animação de morte (0 no começo, 1 no fim)
    const progressoMorte = animacaoMorte
        ? Math.min((performance.now() - animacaoMorte.inicio) / DURACAO_ANIMACAO_MORTE_MS, 1)
        : 1;

    ctx.save();

    if (animacaoMorte && !reduzirMovimento) {
        const forca = 5 * (1 - progressoMorte); // treme forte no começo e vai parando
        ctx.translate((Math.random() * 2 - 1) * forca, (Math.random() * 2 - 1) * forca);
    }

    desenharTabuleiro();

    const progresso = jogoAtivo && !pausado
        ? Math.min((performance.now() - ultimoTickEm) / velocidadeAtual, 1)
        : 1;

    for (const obstaculo of obstaculos) {
        if (obstaculo.movel) {
            desenharObstaculo(
                interpolarEixo(obstaculo.anterior.x, obstaculo.x, progresso),
                interpolarEixo(obstaculo.anterior.y, obstaculo.y, progresso),
                true
            );
        } else {
            desenharObstaculo(obstaculo.x, obstaculo.y);
        }
    }

    if (modoAtual !== "rato") {
        const centro = centroDaCasa(comida);
        comItensMaiores(centro.x, centro.y, () => desenharComidaEquipada(comida)); // a maçã ou a comida da loja
    }

    for (const rato of ratos) {
        desenharRato(rato, progresso);
    }

    if (comidaDourada) {
        const centro = centroDaCasa(comidaDourada);
        comItensMaiores(centro.x, centro.y, () => desenharMacaDourada(comidaDourada));
    }

    if (powerUp) {
        const centro = centroDaCasa(powerUp);
        comItensMaiores(centro.x, centro.y, () => desenharPowerUp(powerUp));
    }

    desenharFantasma(); // por baixo das cobras de verdade

    for (const jogador of jogadores) {
        const bateu = animacaoMorte && animacaoMorte.batidos.includes(jogador);
        // pisca: some e aparece a cada 120 ms
        
        const atordoado = estaAtordoado(jogador);
        const apagada =
            (bateu && Math.floor((performance.now() - animacaoMorte.inicio) / 120) % 2 === 0) ||
            (atordoado && Math.floor(agoraDoJogo() / 120) % 2 === 0);

        ctx.save();
        if (apagada) {
            ctx.globalAlpha = 0.2;
        }
        desenharCobra(jogador);
        ctx.restore();
    }

    desenharTextosFlutuantes();

    if (animacaoMorte) {
        // clarão vermelho que vai sumindo
        ctx.fillStyle = `rgba(231, 71, 29, ${0.35 * (1 - progressoMorte)})`;
        ctx.fillRect(0, 0, LARGURA_TABULEIRO, ALTURA_TABULEIRO);
    }

    ctx.restore();
}

// quanto a cabeça já andou rumo à próxima casa (0 a 1); null = parada (contagem, atordoada, fim)
function progressoDoJogador(jogador) {
    if (!jogoAtivo || jogador.ultimoPassoEm === 0 || estaAtordoado(jogador)) {
        return null;
    }

    // relógio do jogo: na pausa ele para, então o desenho congela no meio do caminho
    const duracao = Math.max(1, jogador.passoTerminaEm - jogador.ultimoPassoEm);
    return Math.min(Math.max((agoraDoJogo() - jogador.ultimoPassoEm) / duracao, 0), 1);
}

// no próximo passo a cabeça cai em comida? então o rabo fica parado (a cobra cresce)
function vaiComerEm(casa) {
    return (modoAtual !== "rato" && mesmaPosicao(casa, comida)) ||
        (comidaDourada !== null && mesmaPosicao(casa, comidaDourada)) ||
        ratos.some((rato) => mesmaPosicao(rato, casa));
}

// a próxima casa é parede, corpo ou pedra, então a cabeça só encosta, não entra
function proximaCasaBloqueada(jogador) {
    const proxima = calcularNovaCabeca(jogador.cobra[0], jogador.direcao, atravessaParede(jogador), COLUNAS, LINHAS);
    const corpo = vaiComerEm(proxima) ? jogador.cobra : jogador.cobra.slice(0, -1);
    const simulada = { ...jogador, cobra: [proxima, ...corpo] };
    const todos = jogadoresQueBatem(jogador).map((outro) => (outro === jogador ? simulada : outro));

    return motivoDaColisao(simulada, todos, obstaculos, COLUNAS, LINHAS) !== null;
}

const ENCOSTA_NA_BATIDA = 0.42; // a cabeça para quase na metade da casa: parece que encostou

// o caminho do corpo, da cabeça até a ponta do rabo (em casas, com frações)
function trilhaDaCobra(jogador) {
    let celulas = jogador.cobra;
    let direcao = jogador.direcao;
    let andou = progressoDoJogador(jogador) ?? 0;
    let crescendo = false;

    if (!jogoAtivo && jogador.bateu) {
        // bateu: mostra a cobra de antes da batida, com a cabeça encostada
        celulas = jogador.cobraAnterior;
        direcao = jogador.direcaoAndada || jogador.direcao;
        andou = ENCOSTA_NA_BATIDA;
    } else if (jogoAtivo) {
        const proxima = calcularNovaCabeca(celulas[0], direcao, atravessaParede(jogador), COLUNAS, LINHAS);
        crescendo = vaiComerEm(proxima);
        if (proximaCasaBloqueada(jogador)) {
            andou = Math.min(andou, ENCOSTA_NA_BATIDA);
        }
    }

    const cabeca = { x: celulas[0].x + direcao.x * andou, y: celulas[0].y + direcao.y * andou };
    const pontos = [cabeca, ...celulas];

    if (!crescendo && celulas.length > 1) {
        // o rabo anda junto, rumo ao pedaço da frente
        const rabo = celulas[celulas.length - 1];
        const frente = celulas[celulas.length - 2];
        pontos[pontos.length - 1] = { x: rabo.x + (frente.x - rabo.x) * andou, y: rabo.y + (frente.y - rabo.y) * andou };
    } else if (!crescendo) {
        pontos.pop(); // cobra de 1 casa: só a cabeça
    }

    return { pontos, direcao };
}

// troca cada quina por um quarto de círculo ( o corpo faz a curva em vez de dobrar)
function arredondarCantos(pontos) {
    const RAIO = 0.5;
    const resultado = [pontos[0]];

    for (let i = 1; i < pontos.length - 1; i++) {
        const antes = pontos[i - 1];
        const canto = pontos[i];
        const depois = pontos[i + 1];
        const ida = { x: canto.x - antes.x, y: canto.y - antes.y };
        const volta = { x: depois.x - canto.x, y: depois.y - canto.y };
        const tamanhoIda = Math.hypot(ida.x, ida.y);
        const tamanhoVolta = Math.hypot(volta.x, volta.y);
        const ehQuina = Math.abs(ida.x * volta.y - ida.y * volta.x) > 0.0001;

        // atravessou a borda (Sem paredes) ou não é quina: segue reto
        if (!ehQuina || tamanhoIda > 1.5 || tamanhoVolta > 1.5) {
            resultado.push(canto);
            continue;
        }

        const raio = Math.min(RAIO, tamanhoIda, tamanhoVolta);
        const inicio = { x: canto.x - (ida.x / tamanhoIda) * raio, y: canto.y - (ida.y / tamanhoIda) * raio };
        const fim = { x: canto.x + (volta.x / tamanhoVolta) * raio, y: canto.y + (volta.y / tamanhoVolta) * raio };

        for (let passo = 0; passo <= 6; passo++) {
            const t = passo / 6;
            // curva suave com o canto como ponto de controle
            resultado.push({
                x: (1 - t) * (1 - t) * inicio.x + 2 * (1 - t) * t * canto.x + t * t * fim.x,
                y: (1 - t) * (1 - t) * inicio.y + 2 * (1 - t) * t * canto.y + t * t * fim.y,
            });
        }
    }

    if (pontos.length > 1) resultado.push(pontos[pontos.length - 1]);
    return resultado;
}

// "+3" que sobe de cabeça da cobra e some
function adicionarTextoFlutuante(posicao, texto, cor) {
    textosFlutuantes.push({ x: posicao.x, y: posicao.y, texto, cor, criadoEm: agoraDoJogo() });
}

function desenharTextosFlutuantes() {
    const agora = agoraDoJogo();

    // tira os que já terminaram de subir
    textosFlutuantes = textosFlutuantes.filter((item) => agora - item.criadoEm < DURACAO_TEXTO_FLUTUANTE_MS);

    for (const item of textosFlutuantes) {
        const progresso = (agora - item.criadoEm) / DURACAO_TEXTO_FLUTUANTE_MS;
        // não deixa o texto sair pelos lados do tabuleiro
        const x = Math.min(Math.max((item.x + 0.5) * TAMANHO_CELULA, 16), LARGURA_TABULEIRO - 16);
        const y = (item.y + 0.5) * TAMANHO_CELULA - 10 - progresso * 22;

        ctx.save();
        ctx.globalAlpha = 1 - progresso * progresso; // some mais rápido no final
        ctx.font = "800 15px 'Bricolage Grotesque', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(14, 23, 18, 0.85)";
        ctx.strokeText(item.texto, x, y);
        ctx.fillStyle = item.cor;
        ctx.fillText(item.texto, x, y);
        ctx.restore();
    }
}

function desenharTabuleiro() {
    for (let linha = 0; linha < LINHAS; linha++) {
        for (let coluna = 0; coluna < COLUNAS; coluna++) {
            const ehClara = (linha + coluna) % 2 === 0;
            desenharCelula(coluna, linha, ehClara ? temaDoTabuleiro().claro : temaDoTabuleiro().escuro);
        }
    }
}

function desenharMaca(x, y, cor = "#e7471d") {
    const centroX = x * TAMANHO_CELULA + TAMANHO_CELULA / 2;
    const centroY = y * TAMANHO_CELULA + TAMANHO_CELULA / 2 + 1;
    const raio = TAMANHO_CELULA * 0.38;

    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(centroX, centroY, raio, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.arc(centroX - raio * 0.4, centroY - raio * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#5b3a1a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centroX, centroY - raio + 1);
    ctx.lineTo(centroX + 1, centroY - raio - 3);
    ctx.stroke();

    ctx.fillStyle = "#3f8f2f";
    ctx.beginPath();
    ctx.ellipse(centroX + 4, centroY - raio - 1, 3.5, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();
}

function desenharRato(rato, progresso) {
    const centroX = (interpolarEixo(rato.anterior.x, rato.x, progresso) + 0.5) * TAMANHO_CELULA;
    const centroY = (interpolarEixo(rato.anterior.y, rato.y, progresso) + 0.5) * TAMANHO_CELULA;
    const angulo = Math.atan2(rato.direcao.y, rato.direcao.x);
    const escala = (TAMANHO_CELULA / 20) * ESCALA_DOS_ITEMS; // desenho feito pra uma casa de 20px

    ctx.save();
    ctx.translate(centroX, centroY);
    ctx.rotate(angulo);
    ctx.scale(escala, escala);

    // rabo
    ctx.strokeStyle = "#e8a3a3";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(-10, -4, -13, 1);
    ctx.stroke();

    // corpo e cabeça
    ctx.fillStyle = TIPOS_RATO[rato.tipo].cor;
    ctx.beginPath();
    ctx.ellipse(-1, 0, 6.5, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, 0, 3.6, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // orelhas
    ctx.fillStyle = "#f4b6c2";
    for (const lado of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(3.5, lado * 3.6, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // olhos e focinho
    ctx.fillStyle= "#1f1f1f";
    for (const lado of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(6.6, lado * 1.3, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = "#e57373";
    ctx.beginPath();
    ctx.arc(8.6, 0, 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function desenharPowerUp(item) {
    const centroX= item.x * TAMANHO_CELULA+ TAMANHO_CELULA / 2;
    const centroY = item.y * TAMANHO_CELULA + TAMANHO_CELULA / 2;
    const cor = CORES_POWERUP[item.tipo];
    const pulso = (Math.sin(agoraDoJogo() / 200) + 1) / 2; // vai de 0 a 1 e volta
    const metade= TAMANHO_CELULA * (0.3+ 0.04 * pulso);

    ctx.save();

    // brilho em volta, pulsando
    ctx.globalAlpha = 0.2 + 0.2 * pulso;
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(centroX, centroY, TAMANHO_CELULA * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // losango (um quadrado girado 45°)
    ctx.translate(centroX, centroY);
    ctx.rotate(Math.PI/ 4);
    ctx.fillStyle = cor;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-metade, -metade, metade * 2, metade * 2, 2);
    ctx.fill();
    ctx.stroke();

    // reflexo
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.beginPath();
    ctx.roundRect(-metade * 0.85, -metade * 0.85, metade * 0.35, metade * 0.35, 1);
    ctx.fill();

    ctx.restore();

    desenharSimboloPowerUp(item.tipo, centroX, centroY, TAMANHO_CELULA * 0.48);
}

// desenha o símbolo centralizado em (centroX, centroY), com "tamanho" pixels de largura
function desenharSimboloPowerUp(tipo, centroX, centroY, tamanho) {
    const simbolo = SIMBOLOS_POWERUP[tipo];
    const escala = tamanho / 24;
    const caminho = new Path2D(simbolo.caminho);

    ctx.save();
    ctx.translate(centroX - tamanho / 2, centroY - tamanho / 2);
    ctx.scale(escala, escala);
    ctx.fillStyle = COR_SIMBOLO_POWERUP;
    ctx.strokeStyle = COR_SIMBOLO_POWERUP;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (simbolo.cheio) {
        ctx.fill(caminho);
    } else {
        ctx.stroke(caminho);
    }

    ctx.restore();
}

// legenda "Itens no mapa": o mesmo losango + símbolo do tabuleiro
function mostrarSimbolosNaLegenda() {
    for (const icone of document.querySelectorAll(".item-icone[data-powerup]")) {
        const tipo = icone.dataset.powerup;
        const simbolo = SIMBOLOS_POWERUP[tipo];
        const pintura = simbolo.cheio
            ? `fill="${COR_SIMBOLO_POWERUP}"`
            : `fill="none" stroke="${COR_SIMBOLO_POWERUP}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;

        icone.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4.5" y="4.5" width="15" height="15" rx="2" transform="rotate(45 12 12)" fill="${CORES_POWERUP[tipo]}" stroke="rgba(0, 0, 0, 0.35)" />
                <path d="${simbolo.caminho}" transform="translate(7 7) scale(0.4167)" ${pintura} />
                
            </svg>`;
    }
}

function desenharMacaDourada(item) {
    const centroX= item.x * TAMANHO_CELULA + TAMANHO_CELULA / 2;
    const centroY = item.y * TAMANHO_CELULA + TAMANHO_CELULA / 2;
    const pulso = (Math.sin(agoraDoJogo() / 150) + 1) / 2;
    const tempoRestante = Math.max(0, (item.expiraEm - agoraDoJogo()) / DURACAO_COMIDA_DOURADA_MS);

    // brilho em volta, pulsando
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.25 * pulso;
    ctx.fillStyle = "#f5c451";
    ctx.beginPath();
    ctx.arc(centroX, centroY, TAMANHO_CELULA * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    desenharMaca(item.x, item.y, "#f5c451");

    // anel que vai sumindo: mostra quando tempo falta pra maçã dourada ir embora
    ctx.save();
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 2;
    ctx.lineCap= "round";
    ctx.beginPath();
    ctx.arc(centroX, centroY, TAMANHO_CELULA * 0.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * tempoRestante);
    ctx.stroke();
    ctx.restore();
}

// editor de fases: o tabuleiro, as paredes e a faixa por onde as cobras saem
function desenharEditorDeFase() {
    ctx.clearRect(0, 0, LARGURA_TABULEIRO, ALTURA_TABULEIRO);
    desenharTabuleiro();

    // faixa da saída (não pode ter parede) com uma bolinha onde cada cobra começa
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(3 * TAMANHO_CELULA, 10 * TAMANHO_CELULA, 15 * TAMANHO_CELULA, TAMANHO_CELULA);
    for (const [x, cor] of [[6, corDaCobra().cabeca], [14, "#ff9a6b"]]) {
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc((x + 0.5) * TAMANHO_CELULA, 10.5 * TAMANHO_CELULA, TAMANHO_CELULA * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    for (const parede of paredesDaFaseCriada) {
        desenharObstaculo(parede.x, parede.y);
    }
}

function desenharObstaculo(x, y, movel = false) {
    const lado = (TAMANHO_CELULA - 4) * ESCALA_DAS_PEDRAS;
    const margem = (TAMANHO_CELULA - lado) / 2;

    ctx.fillStyle = movel ? "#4f5d75" : "#6d6d6d"; // as que andam são azuladas
    ctx.beginPath();
    ctx.roundRect(x * TAMANHO_CELULA + margem, y * TAMANHO_CELULA + margem, lado, lado, 5);
    ctx.fill();

    if (opcoesDeAcessibilidade.altoContraste) {
        ctx.strokeStyle = "#ffffff"; // borda branca: a pedra não some no tabuleiro escuro
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.roundRect(x * TAMANHO_CELULA + margem + 2, y * TAMANHO_CELULA + margem + 2, lado / 2, lado / 3, 2);
    ctx.fill();
}

const SUBDIVISOES_CORPO = 4;

// c: onde desenhar (o tabuleiro, ou a prévia da loja)
function desenharCabecaCobra(corCabeca, c = ctx) {
    c.fillStyle = corCabeca;
    c.beginPath();
    c.ellipse(4, 0, 15, 14, 0, 0, Math.PI * 2);
    c.fill();

    for (const lado of [-1, 1]) {
        c.fillStyle = "#ffe066";
        c.beginPath();
        c.arc(-3, lado * 11, 6.6, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#2a1200";
        c.beginPath();
        c.ellipse(-1, lado * 11, 1.5, 4.2, 0, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "rgba(0, 0, 0, 0.45)";
        c.beginPath();
        c.arc(14, lado * 3, 1.5, 0, Math.PI * 2);
        c.fill();
    }
}

function desenharCobra(jogador, trilha = trilhaDaCobra(jogador)) {
    const { pontos: caminho, direcao } = trilha;
    const pontos = arredondarCantos(caminho).map((p) => ({
            x: (p.x + 0.5) * TAMANHO_CELULA,
            y: (p.y + 0.5) * TAMANHO_CELULA,
    }));

    const corCauda = jogador.invencivel ? "#d4a800" : jogador.corCorpo;
    const corCabeca = jogador.invencivel ? "#fff27a" : jogador.corCabeca;
    const larguraBase = TAMANHO_CELULA * 0.7 * ESCALA_DA_COBRA;
    const pedacoMaximo = TAMANHO_CELULA / 4; // desenha em pedacinhos pra cor e largura mudarem aos poucos

    // comprimento total, pra saber onde cada pedacinho fica no corpo (1 = cabeça, 0 = rabo)
    let total = 0;
    for (let i = 1; i < pontos.length; i++) {
        const d = Math.hypot(pontos[i].x - pontos[i - 1].x, pontos[i].y - pontos[i - 1].y);
        if (d <= TAMANHO_CELULA * 1.5) total += d;
    }

    ctx.lineCap = "round";

    // do rabo pra cabeça, assim a parte da frente fica por cima
    let distanciaDaCabeca = total;
    for (let i = pontos.length - 1; i >= 1; i--) {
        const deste = pontos[i];
        const proximo = pontos[i - 1];
        const tamanho = Math.hypot(proximo.x - deste.x, proximo.y - deste.y);

        if (tamanho > TAMANHO_CELULA * 1.5) {
            continue; // atravessou a borda no "Sem paredes": não liga um lado ao outro
        }

        const partes = Math.max(1, Math.ceil(tamanho / pedacoMaximo));
        for (let parte = 0; parte < partes; parte++) {
            const t0 = parte / partes;
            const t1 = (parte + 1) / partes;
            const meio = distanciaDaCabeca - tamanho * (t0 + t1) / 2;
            const posicaoNoCorpo = total > 0 ? 1 - meio / total : 1;

            ctx.strokeStyle = misturarCores(corCauda, corCabeca, posicaoNoCorpo);
            ctx.lineWidth = larguraBase * (0.6 + 0.4 * posicaoNoCorpo);
            ctx.beginPath();
            ctx.moveTo(deste.x + (proximo.x - deste.x) * t0, deste.y + (proximo.y - deste.y) * t0);
            ctx.lineTo(deste.x + (proximo.x - deste.x) * t1, deste.y + (proximo.y - deste.y) * t1);
            ctx.stroke();
        }

        distanciaDaCabeca -= tamanho;
    }

    // pintinhas a cada 2 casas, contadas da cabeça (andam junto com a cobra)
    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    let percorrido = 0;
    let proximaPinta = TAMANHO_CELULA * 2;
    for (let i = 1; i < pontos.length; i++) {
        const de = pontos[i - 1];
        const ate = pontos[i];
        const tamanho = Math.hypot(ate.x - de.x, ate.y - de.y);

        if (tamanho > TAMANHO_CELULA * 1.5) {
            percorrido += TAMANHO_CELULA;
            continue;
        }

        while (proximaPinta <= percorrido + tamanho && proximaPinta < total - TAMANHO_CELULA * 0.5) {
            const t = (proximaPinta - percorrido) / tamanho;
            ctx.beginPath();
            ctx.arc(de.x + (ate.x - de.x) * t, de.y + (ate.y - de.y) * t, TAMANHO_CELULA * 0.09 * ESCALA_DOS_ITEMS, 0, Math.PI * 2);
            ctx.fill();
            proximaPinta += TAMANHO_CELULA * 2;
    }
    percorrido += tamanho;
    
    }

    // a cabeça sempre olha pra onde está indo
    const angulo = Math.atan2(direcao.y, direcao.x);
    const escala = (TAMANHO_CELULA / 26) * ESCALA_DA_COBRA;

    ctx.save();
    ctx.translate(pontos[0].x, pontos[0].y);
    ctx.rotate(angulo);
    ctx.scale(escala, escala);
    desenharCabecaCobra(corCabeca);
    if (jogador === jogadores[0] && !jogador.bot) {
        desenharChapeu(ctx, carteira.equipados.chapeu, agoraDoJogo()); // chapéu da loja: só no Jogador 1
    }
    ctx.restore();
}

function loopRenderizacao() {
    lerControles(); // controle de videogame: o navegador só conta quando a gente pergunta
    // o jogo anda no mesmo compasso do desenho: o passo acontece no quadro em que a cobra chega na casa
    while (jogoAtivo && !pausado && !contagemAtiva && agoraDoJogo() >= proximoLoopEm) {
        loop();
    }

    desenhar();

    desenharContagem();
    atualizarBarrasEfeitos();
    atualizarTutorial();

    requestAnimationFrame(loopRenderizacao);
}

function mostrarTelaGameOver(jogadoresVivos, batidas) {
    let resultado;

    guardarFantasmaDaPartida();

    if (modoCooperativo) {
        const juntos = jogadores.reduce((total, jogador) => total + jogador.pontuacao, 0);
        resultado = `Juntos: ${juntos} ${juntos === 1 ? "ponto" : "pontos"}`;
    } else if (modoAtual === "tempo") {
        const vencedor = vencedorPorPontos(jogadores);
        resultado = jogadores.length === 1 ? "Tempo esgotado!" : vencedor ? `${vencedor.nome} venceu!` : "Empate!";
    } else if (jogadores.length === 1) {
        resultado = "Game Over";
    } else if (jogadoresVivos.length === 1) {
        resultado = `${jogadoresVivos[0].nome} venceu!`;
    } else {
        resultado = "Empate!";
    }

    const textoPontuacao = jogadores
          .map((jogador) => `${jogador.nome}: ${jogador.pontuacao}`)
          .join(" | ");

    elementoResultadoFinal.textContent = resultado;
    elementoCausaMorte.textContent = batidas
        .map(({ jogador, motivo }) => {
            const nome = jogadores.length === 1 ? "Você" : jogador.nome;
            const outro = jogadores.find((outroJogador) => outroJogador !== jogador);
            return descreverBatida(nome, motivo, outro ? outro.nome : "");
        })
        .join(" · ");

    if (batidas.length === 0) {
        elementoCausaMorte.textContent = "Acabou o tempo";
    }
    elementoPontuacaoFinal.textContent = textoPontuacao;

     // compara com o Top 5 de antes, por isso vem antes de atualizarListaRecordes
    const pontuacoesHumanas = jogadores.filter((jogador) => !jogador.bot).map((jogador) => jogador.pontuacao);
    mostrarConquista(modoAtual === "personalizada" ? null : tipoDeConquista(pontuacoesHumanas, recordesDoModo(modoAtual)));

    atualizarListaRecordes(
        jogadores
            .filter((jogador) => !jogador.bot && jogador.pontuacao > 0)
            .map((jogador) => ({nome: jogador.nome, pontuacao: jogador.pontuacao }))
    );
    telaGameOver.hidden = false;
    anunciar(`${resultado}. ${textoPontuacao}`);
    botaoJogarDeNovo.focus({ preventScroll: true }); // dá pra jogar de novo só com Enter
    registrarFimDePartida(batidas);
}

function mostrarConquista(conquista) {
    elementoAvisoRecorde.hidden = conquista === null;

    if (conquista === "recorde") {
        elementoAvisoRecorde.textContent = "Novo recorde!";
        tocarFanfarra();
    } else if (conquista === "top") {
        elementoAvisoRecorde.textContent = "Entrou no Top 5!";
    }
}

function tocarFanfarra() {
    const notas = [523, 659, 784, 1047]; // dó, mi, sol, dó (uma oitava acima)

    notas.forEach((frequencia, indice) => {
        // espera o som da batida terminar antes de começar
        setTimeout(() => tocarSom(frequencia, 0.15, "triangle"), 350 + indice * 120);
    });
}

function desenharContagem() {
    const decorrido = performance.now() - inicioPassoContagem;

    if (!textoContagem || decorrido > DURACAO_PASSO_CONTAGEM_MS) {
        return;
    }

    const progresso = decorrido / DURACAO_PASSO_CONTAGEM_MS;
    // o número "pula" grande e encolhe rápido até o tamanho normal
    const tamanhoBase = textoContagem.length > 4 ? 64 : 96; // "Fase 2" é mais complicado que "3"
    const tamanho = tamanhoBase * (1.25 - 0.25 * Math.min(progresso * 3, 1));

    ctx.save();

    if (contagemAtiva) {
        ctx.fillStyle = "rgba(14, 23, 18, 0.45)";
        ctx.fillRect(0, 0, LARGURA_TABULEIRO, ALTURA_TABULEIRO);
    }

    ctx.globalAlpha = contagemAtiva ? 1 : 1 - progresso; // o "Vai!" some aos poucos
    ctx.fillStyle = "#eef3e6";
    ctx.font = `800 ${tamanho}px 'Bricolage Grotesque', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(textoContagem, LARGURA_TABULEIRO / 2, ALTURA_TABULEIRO / 2);
    ctx.restore();
}

function atualizarBarrasEfeitos() {
    const agora = agoraDoJogo();

    jogadores.forEach((jogador, indice) => {
        const container = containersEfeitos[indice];

        for (const efeito of EFEITOS_COM_DURACAO) {
            const elemento = container.querySelector(`[data-efeito="${efeito.ativo}"]`);
            const restante = jogador[efeito.ate] - agora;
            const estaAtivo = jogador[efeito.ativo] && restante > 0;

            elemento.hidden = !estaAtivo;

            if (estaAtivo) {
                const porcentagem = (restante / efeito.duracao) * 100;
                elemento.querySelector(".efeito-barra").style.width = `${porcentagem}%`;
                elemento.classList.toggle("acabando", restante < TEMPO_AVISO_FIM_EFEITO_MS);
            }
        }
    });
}

// aoTerminar: o que fazer depois do "Vai!" (começar o loop, ou sair da pausa)
function iniciarContagem(aoTerminar = loop, passos = ["3", "2", "1", "Vai!"]) {
    let indice = 0;

    contagemAtiva = true;
    clearTimeout(temporizadorContagem);

    function proximoPasso() {
        const ultimoPasso = indice === passos.length - 1;

        textoContagem = passos[indice];
        inicioPassoContagem = performance.now();
        tocarSom(ultimoPasso ? 880 : 440, 0.12, "square");

        if (ultimoPasso) {
            contagemAtiva = false;
            aoTerminar();
            return;
        }

        indice++;
        temporizadorContagem = setTimeout(proximoPasso, DURACAO_PASSO_CONTAGEM_MS);
    }

    proximoPasso();
}

function cancelarContagem() {
    clearTimeout(temporizadorContagem);
    contagemAtiva = false;
    textoContagem = "";
}
