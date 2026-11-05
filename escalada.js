// ==========================================
// Escalada: a campanha solo. 10 andares contra bots; a cada andar vencido, escolhe 1 de 3 poderes.
// Morreu? Recomeça do andar 1 (as moedas ficam). As regras puras ficam no logica.js.
// ==========================================
const DISTANCIA_DO_IMA_DA_ESCALADA = 6;
const ESPERA_ANTES_DOS_PODERES_MS = 800;
const MUITO_TEMPO_MS = 1e9; // poder que dura o andar inteiro

let escalada = null; // { andar, poderes, pontos, tempoMs, partida, macas, macasDoRival, seguindo, entreAndares, venceu, rivalVenceu }

function novaEscalada() {
    return { andar: 1, poderes: [], pontos: 0, tempoMs: 0, partida: null, macas: 0, macasDoRival: 0, seguindo: false, entreAndares: false, venceu: false, rivalVenceu: false, usouSegundaChance: false, novosPoderes: [] };
}

function andarDaEscalada() {
    return ANDARES_DA_ESCALADA[escalada.andar - 1];
}

function temPoderDaEscalada(id) {
    return modoAtual === "escalada" && escalada !== null && escalada.poderes.includes(id);
}

function temaDaEscalada() {
    const id = andarDaEscalada().tema;
    return id === "abismo" ? TEMA_DO_ABISMO : TEMAS_DO_TABULEIRO.find((tema) => tema.id === id);
}

function recordeDaEscalada() {
    return Number(lerDoArmazenamento("snakeRecordeEscalada")) || 0;
}

// no começo do reiniciar: ainda antes de criar as cobras
function prepararEscaladaNoReiniciar() {
    document.querySelector(".placares").classList.toggle("placares-escalada", modoAtual === "escalada");
    if (modoAtual !== "escalada") return;
    if (escalada === null || !escalada.seguindo) escalada = novaEscalada(); // "Jogar de novo" recomeça do andar 1
    escalada.seguindo = false;
    escalada.entreAndares = false;
    escalada.macas = 0;
    escalada.macasDoRival = 0;

    const andar = andarDaEscalada();
    quantidadeJogadoresAtual = 1 + andar.rivais.length;
    vagasComBotAtuais = andar.rivais.map((_, indice) => indice + 2);
    modoComBotAtivo = false;
    modoCooperativo = false;
    nomesJogadoresAtuais = [nomesJogadoresAtuais[0], ...andar.rivais.map((rival) => tr(rival.nome))];
    nomesJogadoresAtuais.forEach((nome, indice) => { document.getElementById(`nomeExibido${indice + 1}`).textContent = nome; });
    placaresDosJogadores.forEach((placar, indice) => { placar.hidden = indice >= quantidadeJogadoresAtual; });
    document.querySelector(".placares").classList.toggle("placares-muitos", quantidadeJogadoresAtual > 2);

    aplicarDificuldade();
    const semPedras = temPoderDaEscalada("caminhoLimpo");
    QUANTIDADE_OBSTACULOS = semPedras ? 0 : andar.pedras;
    QUANTIDADE_PEDRAS_MOVEIS = semPedras ? 0 : andar.pedrasMoveis || 0;
    if (temPoderDaEscalada("sangueFrio")) VELOCIDADE_INICIAL_MS = Math.round(VELOCIDADE_INICIAL_MS * MULTIPLICADOR_DO_SANGUE_FRIO);
}

// no fim do reiniciar: as cobras já existem
function comecarAndarDaEscalada() {
    if (modoAtual !== "escalada") return;
    const andar = andarDaEscalada();
    const humano = jogadores[0];
    medir(`escalada/andar-${escalada.andar}`);

    humano.pontuacao = escalada.pontos;
    humano.elementoPontuacao.textContent = humano.pontuacao;
    tempoDaPartidaMs = escalada.tempoMs;
    if (escalada.partida) partidaAtual = escalada.partida;

    jogadores.slice(1).forEach((rival, indice) => {
        const dados = andar.rivais[indice];
        rival.nivel = NIVEIS_DO_BOT[andar.nivel];
        rival.chapeuDeRival = dados.chapeu;
        rival.golpes = dados.golpes || 1; // quantos golpes de espada aguenta
        if (dados.cabeca) {
            rival.corCabeca = dados.cabeca;
            rival.corCorpo = dados.corpo;
        }
    });

    if (temPoderDaEscalada("casca")) {
        humano.escudoAtivo = true;
        humano.escudoAte = agoraDoJogo() + MUITO_TEMPO_MS;
    }
    if (temPoderDaEscalada("portalDeBolso")) {
        humano.portalAtivo = true;
        humano.portalAte = agoraDoJogo() + MUITO_TEMPO_MS;
    }
    if (temPoderDaEscalada("entradaTriunfal")) {
        humano.invencivel = true;
        humano.invencivelAte = agoraDoJogo() + passosDaContagemDaEscalada().length * DURACAO_PASSO_CONTAGEM_MS + 5000;
    }
    if (temPoderDaEscalada("largada")) {
        const contagem = passosDaContagemDaEscalada().length * DURACAO_PASSO_CONTAGEM_MS;
        jogadores.slice(1).forEach((rival) => { rival.atordoadoAte = agoraDoJogo() + contagem + 3000; });
    }
    atualizarPlacarDaEscalada();
    elementoFase.hidden = false;
}

function passosDaContagemDaEscalada() {
    return [tr(andarDaEscalada().chefe ? "Chefe!" : "Andar {n}", { n: escalada.andar }), "3", "2", "1", tr("Vai!")];
}

function atualizarPlacarDaEscalada() {
    const andar = andarDaEscalada();
    const texto = tr("Andar {n} · 🍎 {feitas}/{meta}", { n: escalada.andar, feitas: Math.min(escalada.macas, andar.meta), meta: andar.meta });
    elementoFase.textContent = andar.chefe
        ? `${texto} · ${tr("Rival {feitas}/{meta}", { feitas: Math.min(escalada.macasDoRival, andar.metaDoRival), meta: andar.metaDoRival })}`
        : texto;
}

// chamado quando alguém come uma maçã
function contarMacaDaEscalada(jogador) {
    if (modoAtual !== "escalada" || !escalada) return;
    if (jogador.bot) {
        if (andarDaEscalada().chefe) escalada.macasDoRival++;
    } else {
        escalada.macas += macasQueValem(escalada.poderes);
    }
    atualizarPlacarDaEscalada();
}

// maçã dourada: com Caça-ouro, conta 2 pra meta do andar
function contarDouradaDaEscalada(jogador) {
    if (jogador.bot || !temPoderDaEscalada("cacaOuro")) return;
    escalada.macas += 2 * macasQueValem(escalada.poderes);
    atualizarPlacarDaEscalada();
}

function chanceDePowerUp() {
    return temPoderDaEscalada("sorteDePoder") ? 2 : 1;
}

// Caçador: rival derrotado conta 2 maçãs
function contarRivalDerrotado(atacante) {
    if (atacante.bot || !temPoderDaEscalada("cacador")) return;
    escalada.macas += 2;
    atualizarPlacarDaEscalada();
}

function chanceDeDourada() {
    return temPoderDaEscalada("cacaOuro") ? 3 : 1;
}

// com Combo longo, o combo da pessoa dura o dobro
function janelaDoCombo(jogador) {
    return !jogador.bot && temPoderDaEscalada("comboLongo") ? JANELA_COMBO_MS * 2 : JANELA_COMBO_MS;
}

// Segunda chance: segura uma batida, uma vez só na corrida
function usarSegundaChance(jogador) {
    if (jogador.bot || !temPoderDaEscalada("segundaChance") || escalada.usouSegundaChance) return false;
    escalada.usouSegundaChance = true;
    adicionarTextoFlutuante(jogador.cobra[0], tr("Segunda chance!"), "#ff7ac6");
    return true;
}

// a Dieta faz a cobra crescer só em uma maçã a cada duas
function dietaSeguraOCrescimento(jogador) {
    return !jogador.bot && temPoderDaEscalada("dieta") && jogador.comidas % 2 === 0;
}

// o Ímã só puxa quando a maçã está perto
function atualizarImaDaEscalada() {
    if (!temPoderDaEscalada("ima")) return;
    const humano = jogadores.find((jogador) => !jogador.bot);
    if (!humano) return;
    const cabeca = humano.cobra[0];
    humano.imaAtivo = Math.abs(cabeca.x - comida.x) + Math.abs(cabeca.y - comida.y) <= DISTANCIA_DO_IMA_DA_ESCALADA;
    humano.imaAte = agoraDoJogo() + MUITO_TEMPO_MS;
}

// um rival bateu: sai do andar. Sem rivais, o andar está vencido
function tirarRivaisDaEscalada(batidas) {
    tirarDaPartida(batidas);
}

// chamado no loop, depois das batidas. true = o andar acabou
function verificarFimDoAndar() {
    const andar = andarDaEscalada();
    const semRivais = jogadores.every((jogador) => !jogador.bot);

    if (escalada.macas >= andar.meta || semRivais) {
        terminarAndar();
        return true;
    }
    if (andar.chefe && escalada.macasDoRival >= andar.metaDoRival) {
        escalada.rivalVenceu = true;
        encerrarCorrida(jogadores.filter((jogador) => jogador.bot));
        return true;
    }
    return false;
}

function guardarProgressoDaEscalada() {
    escalada.pontos = jogadores.find((jogador) => !jogador.bot).pontuacao;
    escalada.tempoMs = tempoDaPartidaMs;
    escalada.partida = partidaAtual;
}

function terminarAndar() {
    const humano = jogadores.find((jogador) => !jogador.bot);

    jogoAtivo = false;
    guardarProgressoDaEscalada();
    soltarEstouro(humano.cobra[0], "#ffd23a", 6);
    adicionarTextoFlutuante(humano.cobra[0], tr("Andar vencido!"), "#ffd23a");
    tocarFanfarra();
    vibrar([30, 40, 60]);
    if (andarDaEscalada().rivais[0] === RIVAIS_DA_ESCALADA.mestre) verificarConquistas({ derrubouOMestre: true });

    if (escalada.andar >= ANDARES_DA_ESCALADA.length) {
        escalada.venceu = true;
        medir("escalada/topo");
        encerrarCorrida([humano]);
        return;
    }
    escalada.entreAndares = true;
    setTimeout(mostrarEscolhaDePoder, ESPERA_ANTES_DOS_PODERES_MS);
}

// fim sem batida da pessoa: venceu o chefe, ou o chefe comeu tudo antes
function encerrarCorrida(vivos) {
    jogoAtivo = false;
    guardarProgressoDaEscalada();
    pararMusicaFundo();
    salvarRecordeDaEscalada();
    jogadores = participantes;
    mostrarTelaGameOver(vivos, []);
}

function salvarRecordeDaEscalada() {
    const andar = escalada.venceu ? ANDARES_DA_ESCALADA.length : escalada.andar;
    const antes = recordeDaEscalada();
    if (andar <= antes) return;
    salvarNoArmazenamento("snakeRecordeEscalada", String(andar));
    const novos = poderesLiberados(andar).filter((poder) => poder.liberaNoAndar > antes);
    escalada.novosPoderes = novos;
}

// ---------- tela de escolher o poder ----------
function escolhendoPoder() {
    return modoAtual === "escalada" && escalada !== null && escalada.entreAndares;
}

function desenharTrilhaDosAndares(concluidos) {
    const trilha = document.getElementById("trilhaDosAndares");
    trilha.innerHTML = "";
    ANDARES_DA_ESCALADA.forEach((andar, indice) => {
        const bolinha = document.createElement("span");
        bolinha.className = "andar-da-trilha";
        bolinha.classList.toggle("feito", indice < concluidos);
        bolinha.classList.toggle("proximo", indice === concluidos);
        bolinha.classList.toggle("chefe", Boolean(andar.chefe));
        bolinha.textContent = andar.chefe ? "☠" : String(indice + 1);
        trilha.append(bolinha);
    });
}

// entre os andares: escolhe um poder, ou só respira e segue (a cada 2 andares vem a escolha; se acabarem os poderes, segue também)
function mostrarEscolhaDePoder() {
    const tela = document.getElementById("telaPoderes");
    const caixa = document.getElementById("cartasDePoder");
    desenharTrilhaDosAndares(escalada.andar);
    const opcoes = andarDaPoder(escalada.andar)
        ? sortearPoderes(escalada.poderes, Math.random, Math.max(recordeDaEscalada(), escalada.andar))
        : [];
    document.getElementById("tituloPoderes").textContent = opcoes.length > 0
        ? tr("Andar {n} vencido! Escolha um poder", { n: escalada.andar })
        : tr("Andar {n} vencido!", { n: escalada.andar });
    const seus = escalada.poderes.map((id) => PODERES_DA_ESCALADA.find((poder) => poder.id === id));
    document.getElementById("rodapePoderes").textContent = seus.length > 0
        ? tr("Seus poderes: {lista}", { lista: seus.map((poder) => `${poder.icone} ${poder.nome}`).join(" · ") })
        : tr("Se morrer, volta ao andar 1, mas as moedas ficam.");
    caixa.classList.toggle("so-seguir", opcoes.length === 0);
    if (opcoes.length === 0 && andarDaPoder(escalada.andar + 1)) {
        document.getElementById("rodapePoderes").textContent = tr("Vença o próximo andar para escolher um poder!");
    }

    caixa.innerHTML = "";
    if (opcoes.length === 0) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "botao-principal botao-seguir-andar";
        botao.textContent = tr("Próximo andar");
        botao.addEventListener("click", () => escolherPoder(null));
        caixa.append(botao);
    }
    opcoes.forEach((poder) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = `carta-poder raridade-${poder.raridade}`;
        const icone = document.createElement("i");
        icone.textContent = poder.icone;
        const nome = document.createElement("b");
        nome.textContent = poder.nome;
        const texto = document.createElement("span");
        texto.textContent = poder.descricao;
        botao.append(icone, nome, texto);
        botao.addEventListener("click", () => escolherPoder(poder.id));
        caixa.append(botao);
    });
    tela.hidden = false;
    caixa.firstElementChild.focus({ preventScroll: true });
    anunciar(document.getElementById("tituloPoderes").textContent);
}

function escolherPoder(id) {
    document.getElementById("telaPoderes").hidden = true;
    if (id) escalada.poderes.push(id);
    escalada.andar++;
    escalada.seguindo = true;
    reiniciar();
}

function telaDePoderesAberta() {
    return !document.getElementById("telaPoderes").hidden;
}

// 1, 2, 3 escolhem; setas passam de carta (Enter no botão já clica sozinho)
function teclaNaEscolhaDePoder(evento) {
    if (!telaDePoderesAberta()) return;
    const cartas = [...document.getElementById("cartasDePoder").children];
    const numero = Number(evento.key);
    if (numero >= 1 && numero <= cartas.length) {
        cartas[numero - 1].click();
    } else if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") {
        moverFocoDasCartas(-1);
    } else if (evento.key === "ArrowRight" || evento.key === "ArrowDown") {
        moverFocoDasCartas(1);
    }
}

function moverFocoDasCartas(passo) {
    const cartas = [...document.getElementById("cartasDePoder").children];
    const atual = cartas.indexOf(document.activeElement);
    cartas[(atual + passo + cartas.length) % cartas.length].focus({ preventScroll: true });
}

function confirmarCartaPeloControle() {
    if (!telaDePoderesAberta()) return;
    const cartas = [...document.getElementById("cartasDePoder").children];
    (cartas.includes(document.activeElement) ? document.activeElement : cartas[0]).click();
}

// ---------- fim de jogo ----------
function resultadoDaEscalada() {
    return escalada.venceu ? tr("Você chegou ao topo!") : tr("Caiu no andar {n}", { n: escalada.andar });
}

function pontuacaoDaEscalada() {
    const recorde = recordeDaEscalada();
    const partes = [tr("Pontos: {pontos} · Melhor andar: {recorde}", { pontos: escalada.pontos, recorde })];
    if (escalada.novosPoderes.length > 0) {
        partes.push(tr("Poder novo: {lista}", { lista: escalada.novosPoderes.map((poder) => `${poder.icone} ${poder.nome}`).join(", ") }));
    }
    const proximo = proximoAndarComPoder(recorde);
    if (proximo !== null) partes.push(tr("Chegue ao andar {n} para liberar outro poder", { n: proximo }));
    return partes.join(" · ");
}

function causaDoFimDaEscalada() {
    if (escalada.venceu) return tr("A Rainha das Cobras caiu. O topo é seu!");
    const rival = andarDaEscalada().rivais[0];
    return tr("{nome} comeu {n} maçãs antes de você", { nome: tr(rival.nome), n: andarDaEscalada().metaDoRival });
}
