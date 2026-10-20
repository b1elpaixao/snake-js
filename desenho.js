// ==========================================
// Desenho
// ==========================================
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
        desenharMaca(comida.x, comida.y);
    }

    for (const rato of ratos) {
        desenharRato(rato, progresso);
    }

    if (comidaDourada) {
        desenharMacaDourada(comidaDourada);
    }

    if (powerUp) {
        desenharPowerUp(powerUp);
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
        desenharCobra(jogador, progressoDoJogador(jogador));
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

// cada cobra tem o próprio ritmo (com Turbo o passo dura metade)
function progressoDoJogador(jogador) {
    if (!jogoAtivo || pausado) {
        return 1;
    }

    return Math.min((performance.now() - jogador.ultimoPassoEm) / jogador.duracaoPasso, 1);
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
            desenharCelula(coluna, linha, ehClara ? CORES_TABULEIRO.claro : CORES_TABULEIRO.escuro);
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
    const escala = TAMANHO_CELULA / 20; // desenho feito pra uma casa de 20px

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

function desenharObstaculo(x, y, movel = false) {
    const margem = 2;
    const lado = TAMANHO_CELULA - margem * 2;

    ctx.fillStyle = movel ? "#4f5d75" : "#6d6d6d"; // as que andam são azuladas
    ctx.beginPath();
    ctx.roundRect(x * TAMANHO_CELULA + margem, y * TAMANHO_CELULA + margem, lado, lado, 5);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.roundRect(x * TAMANHO_CELULA + margem + 2, y * TAMANHO_CELULA + margem + 2, lado / 2, lado / 3, 2);
    ctx.fill();
}

const SUBDIVISOES_CORPO = 4;

function desenharCabecaCobra(corCabeca) {
    ctx.fillStyle = corCabeca;
    ctx.beginPath();
    ctx.ellipse(4, 0, 15, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    for (const lado of [-1, 1]) {
        ctx.fillStyle = "#ffe066";
        ctx.beginPath();
        ctx.arc(-3, lado * 11, 6.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#2a1200";
        ctx.beginPath();
        ctx.ellipse(-1, lado * 11, 1.5, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.arc(14, lado * 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function desenharCobra(jogador, progresso) {
    const pontos = jogador.cobra.map((segmento, indice) => {
        const anterior = jogador.cobraAnterior[indice] || segmento;
        return {
            x: (interpolarEixo(anterior.x, segmento.x, progresso) + 0.5) * TAMANHO_CELULA,
            y: (interpolarEixo(anterior.y, segmento.y, progresso) + 0.5) * TAMANHO_CELULA,
        };
    });

    const corCauda = jogador.invencivel ? "#d4a800" : jogador.corCorpo;
    const corCabeca = jogador.invencivel ? "#fff27a" : jogador.corCabeca;
    const distanciaMaxima = TAMANHO_CELULA * 1.5;
    const larguraBase = TAMANHO_CELULA * 0.7;
    const totalSegmentos = pontos.length;

    ctx.lineCap = "round";

    for (let i = totalSegmentos - 1; i >= 1; i--) {
        const deste = pontos[i];
        const proximo = pontos[i - 1];

        if (Math.hypot(proximo.x - deste.x, proximo.y - deste.y) > distanciaMaxima) {
            continue;
        }

        for (let passo = 0; passo < SUBDIVISOES_CORPO; passo++) {
            const t0 = passo / SUBDIVISOES_CORPO;
            const t1 = (passo + 1) / SUBDIVISOES_CORPO;
            const indiceMeio = i - (t0 + t1) / 2;
            const posicaoNoCorpo = 1 - indiceMeio / (totalSegmentos - 1);
            
            ctx.strokeStyle = misturarCores(corCauda, corCabeca, posicaoNoCorpo);
            ctx.lineWidth = larguraBase * (0.6 + 0.4 * posicaoNoCorpo);
            ctx.beginPath();
            ctx.moveTo(deste.x + (proximo.x - deste.x) * t0, deste.y + (proximo.y - deste.y) * t0);
            ctx.lineTo(deste.x + (proximo.x - deste.x) * t1, deste.y + (proximo.y - deste.y) * t1);
            ctx.stroke();
        }
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    for (let i = 2; i < totalSegmentos; i += 2) {
        ctx.beginPath();
        ctx.arc(pontos[i].x, pontos[i].y, TAMANHO_CELULA * 0.09, 0, Math.PI * 2);
        ctx.fill();
    }

    const angulo = Math.atan2(jogador.direcao.y, jogador.direcao.x);
    const escala = TAMANHO_CELULA / 26;

    ctx.save();
    ctx.translate(pontos[0].x, pontos[0].y);
    ctx.rotate(angulo);
    ctx.scale(escala, escala);
    desenharCabecaCobra(corCabeca);
    ctx.restore();
}

function loopRenderizacao() {
    desenhar();

    desenharContagem();
    atualizarBarrasEfeitos();

    requestAnimationFrame(loopRenderizacao);
}

function mostrarTelaGameOver(jogadoresVivos, batidas) {
    let resultado;

    guardarFantasmaDaPartida();

    if (modoAtual === "tempo") {
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
    mostrarConquista(tipoDeConquista(pontuacoesHumanas, recordesDoModo(modoAtual)));

    atualizarListaRecordes(
        jogadores
            .filter((jogador) => !jogador.bot && jogador.pontuacao > 0)
            .map((jogador) => ({nome: jogador.nome, pontuacao: jogador.pontuacao }))
    );
    telaGameOver.hidden = false;
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
