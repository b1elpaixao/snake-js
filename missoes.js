// ==========================================
// Missões diárias: 3 por dia (iguais pra todo mundo), progresso salvo e sequência de dias completos
// ==========================================
function lerMissoes() {
    try {
        return limparMissoes(JSON.parse(lerDoArmazenamento("snakeMissoes")), dataDeHoje());
    } catch {
        return limparMissoes(null, dataDeHoje()); // dado corrompido: começa o dia do zero
    }
}

function lerSequenciaDeMissoes() {
    try {
        return limparSequencia(JSON.parse(lerDoArmazenamento("snakeSequenciaMissoes")));
    } catch {
        return limparSequencia(null);
    }
}

// chamado no fim de cada partida (registrarFimDePartida)
function registrarMissoesDaPartida() {
    const humanos = jogadores.filter((jogador) => !jogador.bot);
    if (humanos.length === 0) return; // partida só de bot não conta

    const partida = {
        modo: modoAtual,
        pontos: modoCooperativo
            ? humanos.reduce((soma, jogador) => soma + jogador.pontuacao, 0)
            : Math.max(...humanos.map((jogador) => jogador.pontuacao)),
        comidas: partidaAtual.comidas,
        powerUps: partidaAtual.powerUps,
        douradas: partidaAtual.douradas,
        maiorCombo: partidaAtual.maiorCombo,
        tamanho: Math.max(...humanos.map((jogador) => jogador.cobra.length)),
        segundos: Math.floor(tempoDaPartidaMs / 1000),
        fase: faseAtual,
    };

    const { estado, novas } = registrarPartidaNasMissoes(lerMissoes(), partida);
    salvarNoArmazenamento("snakeMissoes", JSON.stringify(estado));

    let completouODia = false;
    if (novas.length > 0 && estado.feitas.length === MISSOES_POR_DIA) {
        salvarNoArmazenamento("snakeSequenciaMissoes", JSON.stringify(atualizarSequencia(lerSequenciaDeMissoes(), estado.data)));
        completouODia = true;
    }

    mostrarMissoes();
    if (novas.length > 0) avisarMissoes(novas, completouODia);
}

function mostrarMissoes() {
    const estado = lerMissoes();
    const lista = document.getElementById("listaMissoes");
    lista.innerHTML = "";

    for (const missao of missoesDoDia(estado.data)) {
        const feita = estado.feitas.includes(missao.id);
        const valor = feita ? missao.alvo : Math.min(estado.progresso[missao.id] || 0, missao.alvo);

        const item = document.createElement("li");
        item.className = feita ? "missao feita" : "missao";

        const texto = document.createElement("span");
        texto.className = "missao-texto";
        texto.textContent = missao.texto;

        const numero = document.createElement("span");
        numero.className = "missao-numero";
        // tempo aparece em minutos (0:45/1:30); o resto, em número (12/30)
        const formatar = (n) => missao.campo === "segundos" ? `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}` : n;
        numero.textContent = feita ? "✓" : `${formatar(valor)}/${formatar(missao.alvo)}`;

        const barra = document.createElement("span");
        barra.className = "missao-barra";
        barra.style.setProperty("--progresso", `${Math.round((valor / missao.alvo) * 100)}%`);

        item.append(texto, numero, barra);
        lista.appendChild(item);
    }

    const sequencia = lerSequenciaDeMissoes();
    const diasSeguidos = sequenciaValendo(sequencia, estado.data);
    document.getElementById("sequenciaMissoes").textContent = diasSeguidos > 0 ? `· 🔥 ${diasSeguidos} ${diasSeguidos === 1 ? "dia" : "dias"}` : "";
}

// usa o mesmo aviso das conquistas (em cima do tabuleiro); se tiver uma conquista na tela, espera ela sair
function avisarMissoes(novas, completouODia) {
    const aviso = document.getElementById("avisoConquista");
    const texto = completouODia
        ? "Missões do dia completas! 🔥"
        : `Missão cumprida: ${novas.map((missao) => missao.texto).join(" · ")}`;

    const mostrar = () => {
        aviso.textContent = texto;
        aviso.hidden = true;
        void aviso.offsetWidth; // esconde e mostra de novo pra animação recomeçar
        aviso.hidden = false;

        tocarSom(660, 0.1, "triangle");
        setTimeout(() => tocarSom(990, 0.18, "triangle"), 110);
        anunciar(texto);

        clearTimeout(temporizadorAvisoConquista);
        temporizadorAvisoConquista = setTimeout(() => {
            aviso.hidden = true;
        }, 2800);
    };

    if (aviso.hidden) {
        mostrar();
    } else {
        setTimeout(mostrar, 2900);
    }
}
