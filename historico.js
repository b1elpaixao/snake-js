// ==========================================
// Histórico: guarda as últimas partidas e desenha o gráfico dos pontos
// ==========================================
const PARTIDAS_NO_GRAFICO = 30;
const LARGURA_DO_GRAFICO = 300; // tamanho do desenho (o SVG estica pra caber no quadro)
const ALTURA_DO_GRAFICO = 120;
const MARGEM_DO_GRAFICO = 12;

function lerHistorico() {
    try {
        return limparHistorico(JSON.parse(lerDoArmazenamento("snakeHistorico")));
    } catch {
        return []; // dado corrompido: começa sem histórico
    }
}

// chamado no fim de cada partida (registrarFimDePartida)
function registrarNoHistorico() {
    const humanos = jogadores.filter((jogador) => !jogador.bot);
    if (humanos.length === 0) return;

    // 2 Juntos: os pontos somados; nos outros: a maior pontuação de quem jogou
    const pontos = modoCooperativo
        ? humanos.reduce((soma, jogador) => soma + jogador.pontuacao, 0)
        : Math.max(...humanos.map((jogador) => jogador.pontuacao));

    const partida = { data: dataDeHoje(), modo: modoAtual, pontos, ms: Math.round(tempoDaPartidaMs) };
    salvarNoArmazenamento("snakeHistorico", JSON.stringify(adicionarAoHistorico(lerHistorico(), partida)));
    mostrarHistorico();
}

function mostrarHistorico() {
    const filtro = document.getElementById("filtroHistorico").value;
    const partidas = lerHistorico()
        .filter((partida) => filtro === "todos" || partida.modo === filtro)
        .slice(-PARTIDAS_NO_GRAFICO);
    const grafico = document.getElementById("graficoHistorico");
    const elementoResumo = document.getElementById("resumoHistorico");

    if (partidas.length === 0) {
        grafico.innerHTML = "";
        elementoResumo.textContent = "Jogue uma partida pra ver o gráfico.";
        return;
    }

    const resumo = resumoDoHistorico(partidas);
    const { pontos, maximo } = pontosDoGrafico(partidas.map((partida) => partida.pontos), LARGURA_DO_GRAFICO, ALTURA_DO_GRAFICO, MARGEM_DO_GRAFICO);
    const yDaMedia = yNoGrafico(resumo.media, maximo, ALTURA_DO_GRAFICO, MARGEM_DO_GRAFICO);
    const nomeDaPartida = (partida) =>
        `${partida.data.slice(8, 10)}/${partida.data.slice(5, 7)} · ${NOMES_MODOS[partida.modo] || partida.modo} · ${partida.pontos} pontos`;

    // linha tracejada = média; a bolinha maior é a última partida (passe o mouse pra ver cada uma)
    grafico.innerHTML = `
        <line class="grafico-media" x1="${MARGEM_DO_GRAFICO}" x2="${LARGURA_DO_GRAFICO - MARGEM_DO_GRAFICO}" y1="${yDaMedia}" y2="${yDaMedia}" />
        <polyline class="grafico-linha" points="${pontos.map((ponto) => `${ponto.x},${ponto.y}`).join(" ")}" />
        ${pontos.map((ponto, indice) => `<circle class="grafico-ponto" cx="${ponto.x}" cy="${ponto.y}" r="${indice === pontos.length - 1 ? 4.5 : 2.5}"><title>${nomeDaPartida(partidas[indice])}</title></circle>`).join("")}
        <text class="grafico-texto" x="2" y="10">${maximo}</text>
        <text class="grafico-texto" x="2" y="${ALTURA_DO_GRAFICO - 2}">0</text>`;

    const tendencias = { subindo: " · subindo ↑", caindo: " · caindo ↓", estavel: " · estável" };
    const texto = `${partidas.length} ${partidas.length === 1 ? "partida" : "partidas"} · melhor ${resumo.melhor} · média ${String(resumo.media).replace(".", ",")}${tendencias[resumo.tendencia] || ""}`;

    elementoResumo.textContent = texto;
    grafico.setAttribute("aria-label", `Gráfico dos pontos: ${texto}`);
}
