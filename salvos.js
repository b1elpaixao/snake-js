// Tudo que o jogo guarda no navegador (localStorage) e lê de volta ao abrir.
// Outros arquivos também salvam coisas suas (fantasma, histórico, tutorial...), sempre por
// lerDoArmazenamento / salvarNoArmazenamento, que ficam aqui.

// ==========================================
// Armazenamento (localStorage) - nunca deixa o jogo quebrar
// ==========================================
function lerDoArmazenamento(chave) {
    try {
        return localStorage.getItem(chave);
    } catch {
        return null; // navegador bloqueou o armazenamento
    }
}

function salvarNoArmazenamento(chave, valor) {
    try {
        localStorage.setItem(chave, valor);
    } catch {
        // sem armazenamento: o jogo segue funcionando, só não salva
    }
}

// ==========================================
// Recordes (Top 5 de cada modo)
// ==========================================
function lerRecordesSalvos() {
    const porModo = { normal: [], "clássico": [], rato: [], tempo: [], fases: [], desafio: [] };

    try {
        const salvos = JSON.parse(lerDoArmazenamento("snakeRecordesPorModo"));

        if (salvos && typeof salvos === "object") {
            for (const modo of MODOS_DE_JOGO) {
                porModo[modo] = limparRecordes(salvos[modo]);
            }
        } else {
            // primeira vez com recordes por modo: os recordes antigos vão pro Normal
            porModo.normal = limparRecordes(JSON.parse(lerDoArmazenamento("snakeRecordes")));
        }
    } catch {
        // dado corrompido: começa com as listas vazias
    }

    return porModo;
}

// ==========================================
// Estatísticas
// ==========================================
function lerEstatisticas() {
    try {
        return limparEstatisticas(JSON.parse(lerDoArmazenamento("snakeEstatisticas")));
    } catch {
        return estatisticasVazias(); // dado corrompido: começa do zero
    }
}

function salvarEstatisticas() {
    salvarNoArmazenamento("snakeEstatisticas", JSON.stringify(estatisticas));
}

// ==========================================
// Conquistas
// ==========================================
function lerConquistas() {
    try {
        return limparConquistas(JSON.parse(lerDoArmazenamento("snakeConquistas")));
    } catch {
        return []; // dado corrompido: começa sem conquistas
    }
}

// ==========================================
// Teclas configuráveis
// ==========================================
function lerTeclasSalvas() {
    try {
        return limparTeclas(JSON.parse(lerDoArmazenamento("snakeTeclas")));
    } catch {
        return limparTeclas(null);
    }
}

function guardarTeclas(novas) {
    teclasDosJogadores = novas;
    salvarNoArmazenamento("snakeTeclas", JSON.stringify(teclasDosJogadores));
    jogadores.forEach((jogador) => {
        jogador.teclas = teclasDosJogadores[jogador.numero - 1]; // vale na hora, até no meio da partida
    });
}

// ==========================================
// Preferências: nomes, modo, dificuldade, cor, tema e "Sem paredes"
// ==========================================
function aplicarPreferenciasSalvas() {
    let salvas = null;

    try {
        salvas = JSON.parse(lerDoArmazenamento("snakePreferencias"));
    } catch {
        salvas = null; // dado corrompido: usa o padrão
    }

    const preferencias = limparPreferencias(salvas, MODOS_DE_JOGO, Object.keys(CONFIGURACAO_DIFICULDADE));

    inputNomeJogador1.value = preferencias.nome1;
    inputNomeJogador2.value = preferencias.nome2;
    inputsNomesExtras[0].value = preferencias.nome3;
    inputsNomesExtras[1].value = preferencias.nome4;
    botoesDasVagas.forEach((botao) => mostrarVaga(botao, preferencias.vagasComBot.includes(Number(botao.dataset.vaga))));
    seletorQuantidade.value = String(preferencias.quantidade);
    seletorModo.value = preferencias.modo;
    seletorDificuldade.value = preferencias.dificuldade;
    seletorNivelBot.value = limparNivelBot(salvas && salvas.nivelBot);
    corDaCobraId = limparCorDaCobra(salvas && salvas.corCobra, conquistasGanhas);
    temaDoTabuleiroId = limparTemaDoTabuleiro(salvas && salvas.temaTabuleiro, conquistasGanhas);
    enfeitesDeEpoca = !(salvas && salvas.semEnfeitesDeEpoca === true);
    document.getElementById("opcaoEnfeitesDeEpoca").checked = enfeitesDeEpoca;
    inputModoSemParedes.checked = preferencias.semParedes;
}

function salvarPreferencias() {
    salvarNoArmazenamento("snakePreferencias", JSON.stringify({
        nome1: inputNomeJogador1.value.trim(),
        nome2: nomeDoCampo(inputNomeJogador2),
        nome3: nomeDoCampo(inputsNomesExtras[0]),
        nome4: nomeDoCampo(inputsNomesExtras[1]),
        quantidade: Number(seletorQuantidade.value),
        vagasComBot: botoesDasVagas.filter((botao) => botao.getAttribute("aria-pressed") === "true").map((botao) => Number(botao.dataset.vaga)),
        modo: seletorModo.value,
        dificuldade: seletorDificuldade.value,
        nivelBot: seletorNivelBot.value,
        corCobra: corDaCobraId,
        temaTabuleiro: temaDoTabuleiroId,
        semEnfeitesDeEpoca: !enfeitesDeEpoca,
        semParedes: inputModoSemParedes.checked,
    }));
}
