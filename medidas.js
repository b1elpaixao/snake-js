// ==========================================
// Contagem anônima (GoatCounter): visitas, partidas, andares da Escalada e quem volta.
// Sem cookie e sem identificar ninguém. Fora do ar no CrazyGames (lá vale o SDK deles) e abrindo o arquivo direto.
// ==========================================
const ENDERECO_DA_CONTAGEM = "https://b13l.goatcounter.com/count";
const SCRIPT_DA_CONTAGEM = "https://gc.zgo.at/count.js";
let contagemLigada = false;
let eventosEsperando = [];

function medir(evento) {
    if (!contagemLigada) return;
    if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: evento, title: evento, event: true });
    } else {
        eventosEsperando.push(evento);
    }
}

// dias entre duas datas "AAAA-MM-DD"
function diasEntre(antes, depois) {
    return Math.round((Date.parse(depois) - Date.parse(antes)) / 86400000);
}

// a volta: só compara datas guardadas no próprio aparelho
function medirVolta() {
    const hoje = dataDeHoje();
    const ultima = lerDoArmazenamento("snakeUltimaVisita");
    if (ultima === hoje) return;
    salvarNoArmazenamento("snakeUltimaVisita", hoje);
    if (!ultima) medir("visita/primeira");
    else if (diasEntre(ultima, hoje) === 1) medir("visita/voltou-no-dia-seguinte");
    else medir("visita/voltou-depois");
}

function ligarContagem() {
    if (!location.protocol.startsWith("http") || sdkDaPlataforma) return;
    contagemLigada = true;
    window.goatcounter = { allow_frame: true }; // no itch, o jogo roda dentro de um iframe
    const arquivo = document.createElement("script");
    arquivo.async = true;
    arquivo.src = SCRIPT_DA_CONTAGEM;
    arquivo.dataset.goatcounter = ENDERECO_DA_CONTAGEM;
    arquivo.addEventListener("load", () => {
        eventosEsperando.forEach(medir);
        eventosEsperando = [];
    });
    document.head.append(arquivo);
    medirVolta();
}
