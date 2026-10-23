// ==========================================
// Tutorial na primeira vez: dicas embaixo do tabuleiro que só passam
// quando a pessoa faz o que a dica pediu (virar, comer...)
// ==========================================
let tutorial = null; // enquanto roda: { indice, jogador, direcao, pontos, inicioDoPasso }

// chamado no comecarJogo: só na primeira vez e com 1 pessoa jogando
function prepararTutorial() {
    const humanos = jogadores.filter((jogador) => !jogador.bot);
    const jaViu = Boolean(lerDoArmazenamento("snakeTutorialVisto"));

    tutorial = !jaViu && humanos.length === 1 ? { indice: 0, jogador: null } : null;
}

function terminarTutorial() {
    tutorial = null;
    salvarNoArmazenamento("snakeTutorialVisto", "1");
    document.getElementById("dicaTutorial").hidden = true;
}

// guarda como a cobra estava quando o passo começou, pra saber se ela virou ou comeu depois
function marcarInicioDoPasso(humano) {
    tutorial.jogador = humano;
    tutorial.direcao = { ...humano.direcao };
    tutorial.pontos = humano.pontuacao;
    tutorial.inicioDoPasso = agoraDoJogo();
}

function entradaDoJogador() {
    if (controlesConectados().length > 0) return "controle";
    return window.matchMedia("(pointer: coarse)").matches ? "toque" : "teclado";
}

// chamado a cada quadro pelo loopRenderizacao
function atualizarTutorial() {
    const dica = document.getElementById("dicaTutorial");
    const mostrar = tutorial !== null && !noMenu && jogoAtivo && menuPausa.hidden;

    if (!mostrar) {
        if (!dica.hidden) dica.hidden = true;
        return;
    }

    const humano = jogadores.find((jogador) => !jogador.bot);
    if (tutorial.jogador !== humano) marcarInicioDoPasso(humano); // partida nova (jogou de novo)

    const situacao = {
        virou: !mesmaPosicao(humano.direcao, tutorial.direcao),
        comeu: humano.pontuacao > tutorial.pontos,
        tempoNoPassoMs: agoraDoJogo() - tutorial.inicioDoPasso,
    };

    if (!pausado && !contagemAtiva && passoDoTutorialCumprido(PASSOS_DO_TUTORIAL[tutorial.indice], situacao)) {
        tutorial.indice++;

        if (tutorial.indice >= PASSOS_DO_TUTORIAL.length) {
            terminarTutorial();
            return;
        }
        marcarInicioDoPasso(humano);
    }

    const texto = textoDoTutorial(PASSOS_DO_TUTORIAL[tutorial.indice], entradaDoJogador(), modoAtual);
    const elementoTexto = document.getElementById("textoTutorial");

    if (elementoTexto.textContent !== texto) elementoTexto.textContent = texto;
    if (dica.hidden) dica.hidden = false;
}