// ==========================================
// Movimento e colisão
// ==========================================
function moverJogador(jogador) {
    const novaCabeca = calcularNovaCabeca(
        jogador.cobra[0], jogador.direcao, semParedesNaPartida, COLUNAS, LINHAS
    );
    
    jogador.cobra.unshift(novaCabeca);

    const comeuComida = modoAtual !== "rato" && mesmaPosicao(novaCabeca, comida);
    const comeuComidaDourada = comidaDourada && novaCabeca.x === comidaDourada.x && novaCabeca.y === comidaDourada.y;

    const indiceRato = ratos.findIndex((rato) => mesmaPosicao(rato, novaCabeca));
    const comeuRato= indiceRato !== -1;

    if (comeuComida) {
        comida = gerarComida();
        comerAlimento(jogador, 1);
    }

    if (comeuRato) {
        const ratoComido = ratos[indiceRato];

        ratos.splice(indiceRato, 1);
        comerAlimento(jogador, TIPOS_RATO[ratoComido.tipo].pontos);
        ratos.push(gerarRato(ratoComido.tipo)); // nasce outro do mesmo tipo
    }

    if (comeuComidaDourada) {
        const pontosGanhos = PONTOS_COMIDA_DOURADA * (jogador.pontosDobradosAtivo ? 2 : 1);

        jogador.pontuacao += pontosGanhos;
        jogador.elementoPontuacao.textContent = jogador.comboAtual > 1
           ? `${jogador.pontuacao} (x${jogador.comboAtual})`
           : jogador.pontuacao;

        adicionarTextoFlutuante(novaCabeca, `+${pontosGanhos}`, "#f5c451");
        atualizarRecordeSeNecessario(jogador.pontuacao);
        tocarSomComidaDourada();

        if (!jogador.bot) {
            estatisticas.macasDouradas++;
            vibrar([30, 40, 30]);
        }

        comidaDourada = null;
    }

    if (!comeuComida && !comeuComidaDourada && !comeuRato) {
        jogador.cobra.pop();
    }
    
    const pegouPowerUp = powerUp && novaCabeca.x === powerUp.x && novaCabeca.y === powerUp.y;

    if (pegouPowerUp) {
        if (!jogador.bot) {
            estatisticas.powerUps++;
            partidaAtual.powerUps++;
            vibrar(50);
            verificarConquistas();
        }
        if (powerUp.tipo === "invencibilidade") {
            ativarInvencibilidade(jogador);
        } else if (powerUp.tipo === "velocidade") {
            ativarVelocidadeExtra(jogador);
        } else if (powerUp.tipo === "pontosDobrados") {
            ativarPontosDobrados(jogador);
        } else if (powerUp.tipo === "encolher") {
            ativarEncolher(jogador);
        } else if (powerUp.tipo === "ima") {
            ativarIma(jogador);
        }

        powerUp = null;
    }
}

// maçã ou rato: contra o combo, soma os pontos e atualiza o placar
function comerAlimento(jogador, pontosBase) {
    const agora = agoraDoJogo();
    const dentroDoCombo = jogador.ultimoComerEm !== null && (agora - jogador.ultimoComerEm) <= JANELA_COMBO_MS;

    jogador.comboAtual = dentroDoCombo ? jogador.comboAtual + 1 : 1;
    jogador.ultimoComerEm = agora;

    const pontosGanhos = pontosBase * jogador.comboAtual * (jogador.pontosDobradosAtivo ? 2 : 1);

    jogador.pontuacao += pontosGanhos;
    jogador.elementoPontuacao.textContent = jogador.comboAtual > 1
       ? `${jogador.pontuacao} (x${jogador.comboAtual})`
       : jogador.pontuacao;

    // branco normal; dourado quando tem combo ou pontos x2
    const corTexto = pontosGanhos > pontosBase ? "#f5c451" : "#ffffff";
    adicionarTextoFlutuante(jogador.cobra[0], `+${pontosGanhos}`, corTexto);   

    atualizarRecordeSeNecessario(jogador.pontuacao);
    adicionarObstaculosSeNecessario();
    tocarSomComer();

    if (!jogador.bot) {
        estatisticas.comidas++;
        estatisticas.maiorCombo = Math.max(estatisticas.maiorCombo, jogador.comboAtual);
        vibrar(30);
        verificarConquistas();
    }
}

function atualizarRecordeSeNecessario(pontuacaoAtual) {
    if (pontuacaoAtual > melhorPontuacao) {
        melhorPontuacao = pontuacaoAtual;
        elementoRecorde.textContent = melhorPontuacao;
    }
}

function recordesDoModo(modo) {
    const lista = recordesPorModo[modo] || [];

    // o Top 5 do desafio só mostra ( e só guarda) os recordes de hoje
    return modo === "desafio" ? lista.filter((registro) => registro.data === dataDeHoje()) : lista;
}

// mostra o Top 5 e o troféu do modo escolhido
function mostrarRecordesDoModo(modo) {
    const lista = recordesDoModo(modo);

    modoExibidoRecordes = modo;
    melhorPontuacao = lista.length > 0 ? lista[0].pontuacao : 0;
    elementoRecorde.textContent = melhorPontuacao;
    elementoModoRecordes.textContent = NOMES_MODOS[modo] || modo;
    desenharListaRecordes();
}

function desenharListaRecordes() {
    elementoListaRecordes.innerHTML = "";

    recordesDoModo(modoExibidoRecordes).forEach((registro) => {
        const item = document.createElement("li");
        item.textContent = `${registro.nome}: ${registro.pontuacao}`;
        elementoListaRecordes.appendChild(item);
    });
}

function atualizarListaRecordes(novosRegistros) {
    const registros = modoAtual === "desafio"
        ? novosRegistros.map((registro) => ({ ...registro, data: dataDeHoje() }))
        : novosRegistros;

    recordesPorModo[modoAtual] = juntarRecordes(recordesDoModo(modoAtual), registros);

    salvarNoArmazenamento("snakeRecordesPorModo", JSON.stringify(recordesPorModo));
    mostrarRecordesDoModo(modoAtual);
}

function ativarInvencibilidade(jogador) {
    jogador.invencivel = true;

    jogador.invencivelAte = agoraDoJogo() + DURACAO_INVENCIBILIDADE_MS;
}

function ativarVelocidadeExtra(jogador) {
    jogador.velocidadeExtraAtiva = true;

    jogador.velocidadeExtraAte = agoraDoJogo() + DURACAO_VELOCIDADE_EXTRA_MS;
}

function ativarPontosDobrados(jogador) {
    jogador.pontosDobradosAtivo = true;

    jogador.pontosDobradosAte = agoraDoJogo() + DURACAO_PONTOS_DOBRADOS_MS;
}

function ativarIma(jogador) {
    jogador.imaAtivo = true;

    jogador.imaAte = agoraDoJogo() + DURACAO_IMA_MS; 
}

function atualizarEfeitos(jogador) {
    const agora = agoraDoJogo();

    if (jogador.invencivel && agora >= jogador.invencivelAte) {
        jogador.invencivel = false;
    }
    if (jogador.velocidadeExtraAtiva && agora >= jogador.velocidadeExtraAte) {
        jogador.velocidadeExtraAtiva = false;
    }
    if (jogador.pontosDobradosAtivo && agora >= jogador.pontosDobradosAte) {
        jogador.pontosDobradosAtivo = false;
    }
    if (jogador.imaAtivo && agora >= jogador.imaAte) {
        jogador.imaAtivo = false;
    }
}

// com Imã ligado, maçã dourada e ratos andam uma casa em direção à cabeça mais perto (de quem tem imã)
function puxarAlimento() {
    const cabecasComIma = jogadores.filter((jogador) => jogador.imaAtivo).map((jogador) => jogador.cobra[0]);

    const casaLivre = (posicao) =>
        !foraDoTabuleiro(posicao, COLUNAS, LINHAS) &&
        !posicaoOcupada(posicao, obstaculos, jogadores) &&
        !ratos.some((rato) => mesmaPosicao(rato, posicao)) &&
        !(powerUp && mesmaPosicao(powerUp, posicao)) &&
        !mesmaPosicao(comida, posicao) &&
        !(comidaDourada && mesmaPosicao(comidaDourada, posicao));

    const proximaCasa = (item) => {
        const alvo = cabecasComIma.reduce((maisPerto, cabeca) =>
            distanciaManhattan(item, cabeca) < distanciaManhattan(item, maisPerto) ? cabeca : maisPerto
        );
        return passoEmDirecaoA(item, alvo, casaLivre);
    };

    if (modoAtual !== "rato") {
        comida = proximaCasa(comida);
    }

    if (comidaDourada) {
        const destino = proximaCasa(comidaDourada);
        comidaDourada.x = destino.x;
        comidaDourada.y = destino.y;
    }

    for (const rato of ratos) {
        rato.anterior = { x: rato.x, y: rato.y };
        const destino = proximaCasa(rato);

        if (!mesmaPosicao(destino, rato)) {
            rato.direcao = { x: destino.x - rato.x, y: destino.y - rato.y };
            rato.x = destino.x;
            rato.y = destino.y;
        }
    }
}

function ativarEncolher(jogador) {
    const tamanhoMinimo = 1;
    const quantidadeARemover = Math.min(QUANTIDADE_ENCOLHER, jogador.cobra.length - tamanhoMinimo);

    for (let i = 0; i < quantidadeARemover; i++) {
        jogador.cobra.pop();
    }
}

function motivoDaBatida(jogador) {
    return motivoDaColisao(jogador, jogadoresQueBatem(jogador), obstaculos, COLUNAS, LINHAS);
}

//  ==========================================
// Direção (regra compartilhada entre teclado e toque)
//  ==========================================

// no modo rato o bot persegue o rato mais perto; nos outros, a maçã
function escolherAlvoBot(cabeca) {
    if (modoAtual !== "rato" || ratos.length === 0) {
        return comida;
    }

    return ratos.reduce((maisPerto, rato) =>
        distanciaManhattan(cabeca, rato) < distanciaManhattan(cabeca, maisPerto) ? rato : maisPerto
    );
}

function decidirDirecaoBot(jogador) {
    const semParedes = semParedesNaPartida;
    const andar = (posicao, direcao) => calcularNovaCabeca(posicao, direcao, semParedes, COLUNAS, LINHAS);
    const casaLivre = (posicao) =>
        !foraDoTabuleiro(posicao, COLUNAS, LINHAS) && !posicaoOcupada(posicao, obstaculos, jogadores);
    const cabeca = jogador.cobra[0];

    const nivel = NIVEIS_DO_BOT[limparNivelBot(seletorNivelBot.value)];

    // de vez em quando (mais no fácil) ele se distrai e vira pra um lado qualquer
    if (Math.random() < nivel.chanceDeErro) {
        return direcaoAleatoriaSegura(cabeca, jogador.direcao, andar, casaLivre, Math.random);
    }

    // quando mais cuidadoso, mais espaço ele exige à frente pra não entrar em beco
    const espaçoNecessario = espacoQueOBotExige(jogador.cobra.length, nivel.cuidado);

    return escolherDirecaoBot(cabeca, jogador.direcao, escolherAlvoBot(cabeca), andar, casaLivre, espaçoNecessario);
}
