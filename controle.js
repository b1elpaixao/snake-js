// ==========================================
// Controle de videogame (Xbox, PlayStation e genéricos com fio ou Bluetooth)
// O navegador não avisa quando um botão do controle é apertado: a cada quadro
// o loopRenderizacao chama lerControles() e a gente compara com o quadro anterior.
// ==========================================
const BOTAO_A = 0;      // A no Xbox, X no PlayStation
const BOTAO_START = 9;  // Start no Xbox, Options no PlayStation

let estadoAnteriorDosControles = {}; // um por controle (pelo número dele): { direcao, a, start } do quadro anterior

function controlesConectados() {
    if (!navigator.getGamepads) return [];
    return [...navigator.getGamepads()].filter(Boolean);
}

function lerControles() {
    controlesConectados().forEach((controle, posicao) => {
        const apertados = controle.buttons.map((botao) => botao.pressed);
        const agora = {
            direcao: direcaoDoControle(apertados, controle.axes),
            a: apertados[BOTAO_A],
            start: apertados[BOTAO_START],
        };
        const antes = estadoAnteriorDosControles[controle.index] || {};
        estadoAnteriorDosControles[controle.index] = agora;

        // só vale no quadro em que apertou (segurar não repete)
        if (agora.start && !antes.start) apertouStart();
        if (agora.a && !antes.a) apertouA();

        const mudouDirecao = agora.direcao && !(antes.direcao && mesmaPosicao(agora.direcao, antes.direcao));
        if (mudouDirecao) moverPeloControle(posicao, agora.direcao);
    });
}

// 1º controle move o Jogador 1, 2º o Jogador 2... (pulando as vagas de bot)
function moverPeloControle(posicao, direcao) {
    if (noMenu || animacaoMorte || !jogoAtivo || pausado) return;

    const pessoa = jogadorDoControle(posicao, participantes);
    if (pessoa) definirDirecaoJogador(pessoa, direcao);
}

// A: começa no menu, joga de novo no fim de jogo, continua na pausa
function apertouA() {
    if (!document.getElementById("telaLoja").hidden) return;
    if (noMenu) {
        if (!telaInicial.hidden && telaComoJogar.hidden && !editandoFase) {
            const celular = window.matchMedia("(pointer: coarse)").matches;
            comecarJogo(quantidadePeloControle(controlesConectados().length, Number(seletorQuantidade.value), celular));
        }
        return;
    }
    if (animacaoMorte) return;
    if (!jogoAtivo) {
        reiniciar();
    } else if (menuPausaDisponivel()) {
        alternarPausa();
    }
}

// Start: pausa e despausa; fora da partida faz o mesmo que o A
function apertouStart() {
    if (noMenu || !jogoAtivo) {
        apertouA();
        return;
    }
    if (!contagemAtiva) alternarPausa();
}

// treme o controle junto com a vibração do celular (só em controles e navegadores que deixam)
function tremerControles(padrao) {
    const duracao = Array.isArray(padrao) ? padrao.reduce((soma, ms) => soma + ms, 0) : padrao;

    for (const controle of controlesConectados()) {
        if (!controle.vibrationActuator) continue;
        controle.vibrationActuator
            .playEffect("dual-rumble", { duration: duracao, strongMagnitude: 0.6, weakMagnitude: 0.4 })
            .catch(() => {}); // controle que não treme: tudo bem
    }
}
