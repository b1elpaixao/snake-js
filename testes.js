const elementoResultados = document.getElementById("resultados");
let totalTestes = 0;
let testesComFalha = 0;

function verificar(descricao, valorObtido, valorEsperado) {
    totalTestes++;
    const passou = valorObtido === valorEsperado;

    if (!passou) {
        testesComFalha++;
    }
    
    const linha = document.createElement("p");
    linha.textContent = passou
        ? `OK - ${descricao}`
        : `FALHOU - ${descricao} (esperado: ${valorEsperado}, obtido: ${valorObtido})`;
    linha.style.color = passou ? "green" : "red";
    elementoResultados.appendChild(linha);
}

// interpolarEixo
verificar("interpolarEixo no meio do caminho entre 2 e 3", interpolarEixo(2, 3, 0.5), 2.5);
verificar("interpolarEixo com progresso 0 retorna a posição anterior", interpolarEixo(5, 6, 0), 5);
verificar("interpolarEixo com progresso 1 retorna a posição atual", interpolarEixo(5, 6, 1), 6);
verificar("interporlarEixo detecta salto de borda (sem paredes) e não anima", interpolarEixo(19, 0, 0.5), 0);

// definirDirecaoJogador
const jogadorTeste1 = { direcao: { x: 1, y: 0} };
definirDirecaoJogador(jogadorTeste1, { x: 0, y: 1 });
aplicarProximaDirecao(jogadorTeste1);
verificar("definirDirecaoJogador aceita virar de horizontal pra vertical", 
JSON.stringify(jogadorTeste1.direcao), JSON.stringify({ x: 0, y: 1 }));

const jogadorTeste2 = {direcao: { x: 1, y: 0 } };
definirDirecaoJogador(jogadorTeste2, { x: -1, y: 0 });
aplicarProximaDirecao(jogadorTeste2);
verificar("definirDirecaoJogador bloqueia meia-volta (direita -> esquerda)",
JSON.stringify(jogadorTeste2.direcao), JSON.stringify({ x: 1, y: 0 }));

const jogadorTeste3 = { direcao: {x: 1, y: 0 } };
definirDirecaoJogador(jogadorTeste3, { x: 0, y: -1 }); // cima
definirDirecaoJogador(jogadorTeste3, { x: -1, y: 0 }); // esquerda, antes do próximo passo
aplicarProximaDirecao(jogadorTeste3);
verificar("duas teclas rápidas: primeiro passo vai pra cima",
JSON.stringify(jogadorTeste3.direcao), JSON.stringify({ x: 0, y: -1 }));
aplicarProximaDirecao(jogadorTeste3);
verificar("duas teclas rápidas: segundo passo vai pra esquerda (sem meia-volta)",
JSON.stringify(jogadorTeste3.direcao), JSON.stringify({ x: -1, y: 0 }));

// misturarCores
verificar("misturarCores com proporção 0 devolve a primeira cor", misturarCores("#000000", "#ffffff", 0), "rgb(0, 0, 0)");
verificar("misturarCores com proporção 1 devolve a segunda cor", misturarCores("#000000", "#ffffff", 1), "rgb(255, 255, 255)");
verificar("misturarCores no meio do caminho", misturarCores("#000000", "#ffffff", 0.5), "rgb(128, 128, 128)");

// mesmaPosicao e foraDoTabuleiro
verificar("mesmaPosicao reconhece a mesma casa", mesmaPosicao({ x: 3, y: 4 }, { x: 3, y: 4 }), true);
verificar("mesmaPosicao diferencia casas diferentes", mesmaPosicao({ x: 3, y: 4}, { x: 4, y: 3 }), false);
verificar("foraDoTabuleiro: x negativo está fora", foraDoTabuleiro({ x: -1, y: 5}, 20, 20), true);
verificar("foraDoTabuleiro: canto (19, 19) está dentro", foraDoTabuleiro({ x: 19, y: 19 }, 20, 20), false);

// calcularNovaCabeca
verificar("calcularNovaCabeca anda uma casa pra direita",
    JSON.stringify(calcularNovaCabeca({ x: 5, y: 5 }, { x: 1, y: 0 }, false, 20, 20)), JSON.stringify({ x: 6, y: 5 }));
verificar("calcularNovaCabeca com paredes: sai do tabuleiro",
    JSON.stringify(calcularNovaCabeca({ x: 19, y: 5}, { x: 1, y: 0}, false, 20, 20)), JSON.stringify({ x: 20, y: 5 }));
verificar("calcularNovaCabeca sem paredes: direita volta pela esquerda",
    JSON.stringify(calcularNovaCabeca({ x: 19, y: 5 }, { x: 1, y: 0}, true, 20, 20)), JSON.stringify({ x: 0, y: 5 }));
verificar("calcularNovaCabeca sem paredes: esquerda volta pela direita",
    JSON.stringify(calcularNovaCabeca({ x: 0, y: 5 }, { x: -1, y: 0}, true, 20, 20)), JSON.stringify({ x: 19, y: 5 }));
verificar("calcularNovaCabeca sem paredes: cima volta por baixo",
    JSON.stringify(calcularNovaCabeca({ x: 5, y: 0 }, { x: 0, y: -1}, true, 20, 20)), JSON.stringify({ x: 5, y: 19 }));

// posicaoOcupada
const obstaculosTeste = [{ x: 2, y: 2 }];
const jogadoresTeste = [{ cobra: [{ x: 5, y: 5 }, { x: 4, y: 5 }] }];
verificar("posicaoOcupada: casa com pedra", posicaoOcupada({ x: 2, y: 2, }, obstaculosTeste, jogadoresTeste), true);
verificar("posicaoOcupada: casa com corpo de cobra", posicaoOcupada({ x: 4, y: 5 }, obstaculosTeste, jogadoresTeste), true);
verificar("posicaoOcupada: casa livre", posicaoOcupada({ x: 10, y: 10 }, obstaculosTeste, jogadoresTeste), false);

//verificarColisao
function criarCobraTeste(segmentos, invencivel = false) {
    return{ cobra: segmentos, invencivel };
}

const naParede = criarCobraTeste([{ x: 20, y: 5 }, { x: 19, y: 5 }]);
verificar("verificarColisao: bater na parede mata", verificarColisao(naParede, [naParede], [], 20, 20), true);

const noCorpo = criarCobraTeste([{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 5 }, { x: 5, y: 5 }]);
verificar("verificarColisao: bater no próprio corpo mata", verificarColisao(noCorpo, [noCorpo], [], 20, 20), true);

const naPedra = criarCobraTeste([{ x: 2, y: 2 }, { x: 1, y: 2 }]);
verificar("verificarColisao: bater numa pedra mata", verificarColisao(naPedra, [naPedra], [{ x: 2, y: 2 }], 20, 20), true);

const atacante = criarCobraTeste([{ x: 8, y: 8 }, { x: 7, y: 8 }]);
const vitima = criarCobraTeste([{ x: 8, y: 9 }, { x: 8, y: 8 }]);
verificar("verificarColisao: bater no corpo do outro jogador mata", verificarColisao(atacante, [atacante, vitima], [], 20, 20), true);

const livre = criarCobraTeste([{ x: 10, y: 10 }, { x: 9, y: 10 }]);
verificar("verificarColisao: casa livre não mata", verificarColisao(livre, [livre], [{ x: 2, y: 2 }], 20, 20), false);

const invencivelNaPedra = criarCobraTeste([{ x: 2, y: 2 }, { x: 1, y: 2 }], true);
verificar("verificarColisao: invencivel atravessa pedra", verificarColisao(invencivelNaPedra, [invencivelNaPedra], [{ x: 2, y: 2 }], 20, 20), false);

const invencivelNaParede = criarCobraTeste([{ x: -1, y: 5 }, { x: 0, y: 5 }], true);
verificar("verificarColisao: invencivel ainda morre na parede",
verificarColisao(invencivelNaParede, [invencivelNaParede], [], 20, 20), true);

// modo rato
verificar("distanciaManhattan soma as distâncias em x e y", distanciaManhattan({ x: 0, y: 0}, { x: 3, y: 4 }), 7);

const tudoLivre = () => true;
const nadaLivre = () => false;
const sempre= (valor) => () => valor;

const ratoLonge = { x: 10, y: 10 };
verificar("rato longe da cobra e sem sorte de passear fica parado",
    JSON.stringify(escolherPassoRato(ratoLonge, [{ x: 0, y: 0 }], tudoLivre, 3, sempre(0.9))), JSON.stringify({ x: 10, y: 10 }));
verificar("rato longe da cobra passeia uma casa",
    distanciaManhattan(escolherPassoRato(ratoLonge, [{ x: 0, y: 0 }], tudoLivre, 3, sempre(0.1)), ratoLonge), 1);

const ratoPerto = { x: 5, y: 5};
const cabecaPerto = { x: 3, y: 5};
const destinoFuga = escolherPassoRato(ratoPerto, [cabecaPerto], tudoLivre, 3, sempre(0.9));
verificar("rato perto da cobra foge (fica mais longe da cabeça)",
    distanciaManhattan(destinoFuga, cabecaPerto) > distanciaManhattan(ratoPerto, cabecaPerto), true);

verificar("rato encurralado fica parado",
    JSON.stringify(escolherPassoRato(ratoPerto, [cabecaPerto], nadaLivre, 3, sempre(0.1))), JSON.stringify({ x: 5, y: 5 }));

const soPraCobra = (posicao) => posicao.x === 4 && posicao.y === 5;
verificar("rato não foge em direção à cobra (prefere ficar parado)",
    JSON.stringify(escolherPassoRato(ratoPerto, [cabecaPerto], soPraCobra, 3, sempre(0.9))), JSON.stringify({ x: 5, y: 5 }));

// recordes
verificar("limparRecordes tira o bot, os zerados e o lixo",
    JSON.stringify(limparRecordes([{ nome: "Ana", pontuacao: 10 }, { nome: "Bot", pontuacao: 30 }, { nome: "Leo", pontuacao: 0 }, null, "lixo"])),
    JSON.stringify([{ nome: "Ana", pontuacao: 10 }]));
verificar("limparRecordes com dado que não é lista devolve lista vazia",
JSON.stringify(limparRecordes({ nome: "Ana" })), "[]");

const listaCheia = [50, 40, 30, 20, 10].map((pontos, i) => ({ nome: "J" + i, pontuacao: pontos }));
const listaNova = juntarRecordes(listaCheia, [{ nome: "Novo", pontuacao: 35 }]);
verificar("juntarRecordes mantém só 5", listaNova.length, 5);
verificar("juntarRecordes coloca o novo na posição certa", listaNova[2].nome, "Novo");
verificar("juntarRecordes tira o pior da lista", listaNova.some((r) => r.pontuacao === 10), false);
verificar("juntarRecordes não altera a lista original", listaCheia.length, 5);

// pedras novas
const cabecaPedra = { x: 10, y: 10 };
const indoPraDireita = { x: 1, y: 0};
verificar("pedra colada na cabeça atrapalha", pedraAtrapalhaJogador({ x: 10, y: 11 }, cabecaPedra, indoPraDireita), true);
verificar("pedra 5 casas na frente atrapalha", pedraAtrapalhaJogador({ x: 15, y: 10 }, cabecaPedra, indoPraDireita), true);
verificar("pedra 6 casas na frente atrapalha", pedraAtrapalhaJogador({ x: 16, y: 10 }, cabecaPedra, indoPraDireita), false);
verificar("pedra atrás da cobra, longe, não atrapalha", pedraAtrapalhaJogador({ x: 5, y: 10 }, cabecaPedra, indoPraDireita), false);
verificar("pedra longe do ladop não atrapalha", pedraAtrapalhaJogador({ x: 10, y: 15 }, cabecaPedra, indoPraDireita), false);

// conquista no fim da partida
const topTeste = [50, 40, 30, 20, 10].map((pontos) => ({ nome: "J", pontuacao: pontos }));
verificar("conquista: passou do 1° lugar é novo recorde", tipoDeConquista([51], topTeste), "recorde");
verificar("conquista: empatar com o 1° não é recorde (mas entra no top)", tipoDeConquista([50], topTeste), "top");
verificar("conquista: passou do 5° lugar entra no top", tipoDeConquista([11], topTeste), "top");
verificar("conquista: abaixo do 5° lugar não ganha nada", tipoDeConquista([10], topTeste), null);
verificar("conquista: zero pontos não ganha nada", tipoDeConquista([0], []), null);
verificar("conquista: primeira partida com pontos é recorde", tipoDeConquista([3], []), "recorde");
verificar("conquista: lista com menos de 5 sempre tem vaga", tipoDeConquista([1], [{ nome: "J", pontuacao: 9 }]), "top");

// bot
// tabuleiro de teste 10x10 com paredes; "bloqueadas" são casas ocupadas
function criarMapaTeste(bloqueadas) {
    const chaves = new Set(bloqueadas.map((posicao) => `${posicao.x},${posicao.y}`));
    return {
        andar: (posicao, direcao) => ({ x: posicao.x + direcao.x, y: posicao.y + direcao.y }),
        casaLivre: (posicao) =>
            posicao.x >= 0 && posicao.x < 10 && posicao.y >= 0 && posicao.y < 10 &&
            !chaves.has(`${posicao.x},${posicao.y}`),
    };
}

// um "beco" à direita: só as casas (3,2) e (4,2) estão abertas lá dentro
// (2,2) é a cabeça da cobra, então também está ocupada
const mapaBeco = criarMapaTeste([{ x: 2, y: 2 }, { x: 3, y: 1}, { x: 4, y: 1}, { x: 3, y: 3}, { x: 4, y: 3}, { x: 5, y: 2 }]);
verificar("contarEspacoLivre conta só as casas do beco", contarEspacoLivre({ x: 3, y: 2 }, mapaBeco.andar, mapaBeco.casaLivre, 50), 2);
verificar("contarEspacoLivre para de contar no limite", contarEspacoLivre({ x: 0, y: 0 }, mapaBeco.andar, mapaBeco.casaLivre, 7), 7);

const direcaoNoBeco = escolherDirecaoBot({ x: 2, y: 2}, { x: 1, y: 0}, { x: 4, y: 2}, mapaBeco.andar, mapaBeco.casaLivre, 5);
verificar("bot não entra no beco mesmo com a comida lá dentro", direcaoNoBeco.x === 1 && direcaoNoBeco.y === 0, false);

const mapaAberto = criarMapaTeste([]);
verificar("bot vai em direção da comida quando a caminho é seguro",
    JSON.stringify(escolherDirecaoBot({ x: 2, y: 2 }, { x: 1, y: 0}, { x: 8, y: 2}, mapaAberto.andar, mapaAberto.casaLivre, 5)),
    JSON.stringify({ x: 1, y: 0 }));

const mapaFechado = criarMapaTeste([{ x: 3, y: 2}, { x: 2, y: 1}, { x: 2, y: 3 }]);
verificar("bot sem saída segue em frente",
    JSON.stringify(escolherDirecaoBot({ x: 2, y: 2}, { x: 1, y: 0}, { x: 8, y: 2}, mapaFechado.andar, mapaFechado.casaLivre, 5 )),
    JSON.stringify({ x: 1, y: 0 }));

// causa da morte
verificar("motivo: parede", motivoDaColisao(naParede, [naParede], [], 20, 20), "parede");
verificar("motivo: próprio corpo", motivoDaColisao(noCorpo, [noCorpo], [], 20, 20), "proprioCorpo");
verificar("motivo: pedra", motivoDaColisao(naPedra, [naPedra], [{ x: 2, y: 2 }], 20, 20), "pedra");
verificar("motivo: outro jogador", motivoDaColisao(atacante, [atacante, vitima], [], 20, 20), "outroJogador");
verificar("motivo: casa livre não tem motivo", motivoDaColisao(livre, [livre], [], 20, 20), null);
verificar("motivo: invencível na parede ainda é parede", motivoDaColisao(invencivelNaParede, [invencivelNaParede], [], 20, 20), "parede");
verificar("descreverBatida monta a frase", descreverBatida("Ana", "pedra", ""), "Ana bateu numa pedra");
verificar("descreverBatida cita o outro jogador", descreverBatida("Ana", "outroJogador", "Bot"), "Ana bateu em Bot");

// imã
verificar("imã: anda no eixo mais longe primeiro",
    JSON.stringify(passoEmDirecaoA({ x: 0, y: 0 }, { x: 5, y: 2 }, () => true)), JSON.stringify({ x: 1, y: 0 }));
verificar("imã se o eixo mais longe está ocupado, tenta o outro",
    JSON.stringify(passoEmDirecaoA({ x: 0, y: 0 }, { x: 5, y: 2 }, (casa) => casa.x === 0)),
JSON.stringify({ x: 0, y: 1 }));
verificar("ímã: tudo ocupado, fica parado",
    JSON.stringify(passoEmDirecaoA({ x: 3, y: 3 }, { x: 5, y: 5}, () => false)),
JSON.stringify({ x: 3, y: 3 }));
verificar("ímã: já ta na mesma linha, anda só em x",
    JSON.stringify(passoEmDirecaoA({ x: 9, y: 4 }, { x: 2, y: 4 }, () => true)), JSON.stringify({ x: 8, y: 4 }));

// pedras que andam
const pedraTeste = { x: 5, y: 5, direcao: { x: 1, y: 0 } };
verificar("pedra anda pra frente quando está livre",
    JSON.stringify(proximoPassoPedra(pedraTeste, () => true)), JSON.stringify({ x: 6, y: 5, direcao: { x: 1, y: 0 } }));
verificar("pedra bloqueada na frente volta pra trás",
    JSON.stringify(proximoPassoPedra(pedraTeste, (casa) => casa.x !== 6)), JSON.stringify({ x: 4, y: 5, direcao: { x: -1, y: 0 } }));
verificar("pedra presa fica parada e vira",
    JSON.stringify(proximoPassoPedra(pedraTeste, () => false)), JSON.stringify({ x: 5, y: 5, direcao: { x: -1, y: 0 } }));

// velocidade no placar
verificar("velocidade no começo é 1,0x", formatarVelocidade(250, 250), "1,0x");
verificar("passo com metade do tempo é 2,0x", formatarVelocidade(250, 125), "2,0x");
verificar("velocidade arredonda pra 1 casa decimal", formatarVelocidade(180, 50), "3,6x");

// preferências salvas
const prefValidas = limparPreferencias(
    { nome1: "Ana", nome2: "Leo", modo: "rato", dificuldade: "dificil", semParedes: true },
    ["normal", "rato"], ["facil", "normal", "dificil"]
);
verificar("preferências válidas são mantidas",
    JSON.stringify(prefValidas), JSON.stringify({ nome1: "Ana", nome2: "Leo", modo: "rato",
dificuldade: "dificil", semParedes: true }));
const prefLixo = limparPreferencias({ nome1: 42, modo: "voador", dificuldade: "impossivel",
semParedes: "sim" }, ["normal", "rato"], ["facil", "normal", "dificil"]);
verificar("preferência inválida volta pro padrão",
    JSON.stringify(prefLixo), JSON.stringify({ nome1: "", nome2: "", modo: "normal", dificuldade:
"normal", semParedes: false }));
verificar("sem nada salvo usa o padrão", limparPreferencias(null, ["normal"], ["normal"]).modo,
"normal");
verificar("nome grande é cortado em 12 letras", limparPreferencias({ nome1: "Maria Eduarda Silva"
}, ["normal"], ["normal"]).nome1, "Maria Eduard");

// estatisticas
verificar("estatísticas vazias começam com 0 partidas", estatisticasVazias().partidas, 0);
const estatLimpas = limparEstatisticas({ partidas: 5, comidas: -3, maiorCombo: "muito", mortes: {
pedra: 2, voou: 9 } });
verificar("limparEstatisticas mantém número válido", estatLimpas.partidas, 5);
verificar("limparEstatisticas troca negativo e texto por 0", estatLimpas.comidas +
estatLimpas.maiorCombo, 0);
verificar("limparEstatisticas mantém morte válida e ignora a inventada",
    JSON.stringify(estatLimpas.mortes), JSON.stringify({ parede: 0, proprioCorpo: 0, pedra: 2,
outroJogador: 0 }));
verificar("limparEstatisticas com lixo devolve tudo zerado", limparEstatisticas("{lixo").partidas, 0);
verificar("formatarTempo em segundos", formatarTempo(45000), "45 s");
verificar("formatarTempo em minutos", formatarTempo(750000), "12 min 30 s");
verificar("formatarTempo em horas", formatarTempo(3900000), "1 h 05 min");
verificar("morteMaisComum acha a maior", morteMaisComum({ parede: 2, proprioCorpo: 5, pedra: 1,
outroJogador: 0 }), "proprioCorpo");
verificar ("morteMaisComum sem mortes é null", morteMaisComum({ parede: 0, pedra: 0 }), null);

// modo contra o tempo
verificar("relógio: 2 minutos", formatarRelogio(120000), "2:00");
verificar("relógio: 1 minuto e 5 segundos", formatarRelogio(65000), "1:05");
verificar("relógio: arredonda pra cima no finalzinho", formatarRelogio(400), "0:01");
verificar("relógio: acabou", formatarRelogio(0), "0:00");
const cobraGrande = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }];
verificar("encolherCobra tira 3 pedaços do rabo", encolherCobra(cobraGrande, 3).length, 2);
verificar("encolherCobra mantém a cabeça no lugar", JSON.stringify(encolherCobra(cobraGrande, 3) [0]), JSON.stringify({ x: 5, y: 5 }));
verificar("encolherCobra nunca deixa a cobra sumir", encolherCobra([{ x: 1, y: 1 }, { x: 0, y: 1 }], 3).length, 1);
verificar("encolherCobra não mexe na cobra original", cobraGrande.length, 5);
verificar("vencedor é quem fez mais pontos", vencedorPorPontos([{ nome: "Ana", pontuacao: 3 }, { nome: "Leo", pontuacao: 8 }]).nome, "Leo");
verificar("empate não tem vencedor", vencedorPorPontos([{ nome: "Ana", pontuacao: 4 }, { nome: "Leo", pontuacao: 4 }]), null);

// modo fases
verificar("faseParaPontuacao: começa na fase 1", faseParaPontuacao(0, 10, 4), 1);
verificar("faseParaPontuacao: 10 pontos é fase 2", faseParaPontuacao(10, 10, 4), 2);
verificar("faseParaPontuacao: não passa da última", faseParaPontuacao(500, 10, 4), 4);
verificar("lerMapa achas as paredes e o início", JSON.stringify(lerMapa(["#1", ".2"])), JSON.stringify({ paredes: [{ x: 0, y: 0 }], inicios: [{ x: 1, y: 0 }, { x: 1, y: 1 }] }));

MAPAS_DAS_FASES.forEach((mapa, indice) => {
    const fase = `fase ${indice + 1} (${mapa.nome})`;
    const tamanhoCerto = mapa.linhas.length === 20 && mapa.linhas.every((linha) => linha.length === 20);
    verificar(`${fase}: tem 20x20 casas`, tamanhoCerto, true);

    const { paredes, inicios } = lerMapa(mapa.linhas);
    const ehParede = (casa) => paredes.some((parede) => mesmaPosicao(parede, casa));
    const casaLivreNoMapa = (casa) => !foraDoTabuleiro(casa, 20, 20) && !ehParede(casa);
    const andarNoMapa = (casa, direcao) => ({ x: casa.x + direcao.x, y: casa.y + direcao.y });

    verificar(`${fase}: tem os dois pontos de partida`, inicios.length === 2 && inicios.every(Boolean), true);

    // as 3 casas na frente de cada cobra estão livres (J1 vai pra direita, J2 pra esquerda)
    const frenteLivre = [1, 2, 3].every((passo) =>
        casaLivreNoMapa({ x: inicios[0].x + passo, y: inicios[0].y }) &&
        casaLivreNoMapa({ x: inicios[1].x - passo, y: inicios[1].y })
    );
    verificar(`${fase}: frente das cobras livre`, frenteLivre, true);

    // dá pra chegar em todas as casas livres (nenhuma área fechada onde a comida ficaria presa)
    const totalLivre = 400 - paredes.length;
    verificar(`${fase}: nenhuma área fechada`, contarEspacoLivre(inicios[0], andarNoMapa, casaLivreNoMapa, 400), totalLivre);
});

// desafio do dia
verificar("dataDeHoje formata com zeros", dataDeHoje(new Date(2026, 0, 5)), "2026-01-05");
verificar("sementeDoTexto: mesmo texto, mesmo número", sementeDoTexto("2026-10-02"), sementeDoTexto("2026-10-02"));
verificar("sementeDoTexto: textos diferentes, números diferentes", sementeDoTexto("2026-10-02") === sementeDoTexto("2026-10-03"), false);
const sorteioA = criarSorteador(42), sorteioB = criarSorteador(42);
verificar("criarSorteador: mesma semente, mesmo números", [sorteioA(), sorteioA(), sorteioA()].join(), [sorteioB(), sorteioB(), sorteioB()].join());
const numerosSorteados = Array.from({ length: 1000 }, criarSorteador(7));
verificar("criarSorteador: números entre 0 e 1", numerosSorteados.every((n) => n >= 0 && n < 1), true);

const iniciosTeste = [{ x: 6, y: 10 }, { x: 14, y: 10 }];
const desafioHoje = gerarDesafioDoDia("2026-10-02", 20, 20, 10, iniciosTeste, 50);
const desafioDeNovo = gerarDesafioDoDia("2026-10-02", 20, 20, 10, iniciosTeste, 50);
const desafioAmanha = gerarDesafioDoDia("2026-10-03", 20, 20, 10, iniciosTeste, 50);
verificar("desafio: mesma data, mesmo mapa e mesmas maçãs", JSON.stringify(desafioHoje), JSON.stringify(desafioDeNovo));
verificar("desafio: outra data, outro mapa", JSON.stringify(desafioHoje.pedras) === JSON.stringify(desafioAmanha.pedras), false);
verificar("desafio: tem 10 pedras e 50 maçãs", desafioHoje.pedras.length + "/" + desafioHoje.comidas.length, "10/50");
verificar("desafio: nenhuma pedra perto do começo das cobras", desafioHoje.pedras.every((pedra) => iniciosTeste.every((inicio) => distanciaManhattan(pedra, inicio) > 2)), true);
verificar("desafio: nenhuma maçã em cima da pedra", desafioHoje.comidas.every((comida) => !desafioHoje.pedras.some((pedra) => mesmaPosicao(pedra, comida))), true);

// nível do bot
verificar("limparNivelBot aceita um nivel que existe", limparNivelBot("dificil"), "dificil");
verificar("limparNivelBot troca nível inventado por normal", limparNivelBot("impossivel"), "normal");
verificar("bot fácil não olha à frente (exige só 1 casa)", espacoQueOBotExige(20, 0), 1);
verificar("bot difícil exige o corpo inteiro + 2", espacoQueOBotExige(20, 1), 22);
verificar("bot normal exige metade", espacoQueOBotExige(20, 0.5), 11);
const mapaAleatorio = criarMapaTeste([{ x: 3, y: 2 }]);
const direcoesSorteadas = [0, 0.4, 0.99].map((valor) => JSON.stringify(direcaoAleatoriaSegura({ x: 2, y: 2 }, { x: 1, y: 0}, mapaAleatorio.andar, mapaAleatorio.casaLivre, () => valor)));
verificar("direção aleatória nunca é meia-volta nem pra cima de algo", direcoesSorteadas.every((direcao) => direcao === JSON.stringify({ x: 0, y: -1 }) || direcao === JSON.stringify({ x: 0, y: 1 })), true);
verificar("sem saída, a direção aleatória segue em frente", JSON.stringify(direcaoAleatoriaSegura({ x: 2, y: 2 }, { x: 1, y: 0 }, mapaFechado.andar, mapaFechado.casaLivre, () => 0.5)), JSON.stringify({ x: 1, y: 0 }));

// conquistas
function contextoTeste(estatisticasTeste = {}, partidaTeste = {}) {
    return {
        estatisticas: { ...estatisticasVazias(), ...estatisticasTeste },
        partida: { pontos: 0, tamanho: 1, powerUps: 0, modo: "normal", fase: 1, venceuBotDificil: false, ...partidaTeste },
    };
}
const idsDe = (lista) => lista.map((conquista) => conquista.id).join(",");
verificar("conquista: começando do zero não ganha nada", idsDe(conquistasNovas([], contextoTeste())), "");
verificar("conquista: primeira comida", idsDe(conquistasNovas([], contextoTeste({ comidas: 1 }))), "primeiraMordida");
verificar("conquista: não ganha de novo o que já tem", idsDe(conquistasNovas(["primeiraMordida"], contextoTeste({ comidas: 1}))), "");
verificar("conquista: 100 comidas dá duas de uma vez", idsDe(conquistasNovas([], contextoTeste({ comidas: 100 }))), "primeiraMordida,faminta");
verificar("conquista: cobra grande vale na partida de agora", idsDe(conquistasNovas([], contextoTeste({}, { tamanho: 20 }))), "cobraGrande");
verificar("conquista: 30 pontos só valem no Contra o tempo", idsDe(conquistasNovas([], contextoTeste({}, { pontos: 30, modo: "normal" }))) + "|" + idsDe(conquistasNovas([], contextoTeste({}, { pontos: 30, modo: "tempo" }))), "|contraORelogio");
verificar("conquista: ids únicos", new Set(CONQUISTAS.map((c) => c.id)).size, CONQUISTAS.length);
verificar("limparConquistas tira o que não existe", JSON.stringify(limparConquistas(["faminta", "voar", 7])), JSON.stringify(["faminta"]));
verificar("limparCOnquistas com lixo devolve lista vazia", JSON.stringify(limparConquistas(" {lixo")), "[]");

// cores da cobra
verificar("cores: azul e ciano já começam liberadas",
    CORES_DA_COBRA.filter((cor) => corEstaLiberada(cor, [])).map((cor) => cor.id).join(","), "azul,ciano");
verificar("cores: a conquista libera a cor", corEstaLiberada(CORES_DA_COBRA.find((cor) => cor.id === "rosa"), ["faminta"]), true);
verificar("limparCorDaCobra: cor bloqueada volta pra azul", limparCorDaCobra("rosa", []), "azul");
verificar("limparCorDaCobra: cor liberada fica", limparCorDaCobra("rosa", ["faminta"]), "rosa");
verificar("limparCorDaCobra: cor inventada volta pra azul", limparCorDaCobra("arco-íris", []), "azul");
verificar("cores: toda conquista pedida existe",
    CORES_DA_COBRA.every((cor) => cor.conquista === null || CONQUISTAS.some((conquista) => conquista.id === cor.conquista)), true);

// teclas configuráveis
verificar("limparTeclas: nada salvo volta pro padrão", JSON.stringify(limparTeclas(null)), JSON.stringify(TECLAS_PADRAO));
verificar("limparTeclas: teclas certas ficam",
    limparTeclas([{ cima: "i", baixo: "k", esquerda: "j", direita: "l" }, TECLAS_PADRAO[1]]) [0].cima, "i");
verificar("limparTeclas: tecla repetida volta pro padrão",
    limparTeclas([{ cima: "w", baixo: "k", esquerda: "j", direita: "l" }, TECLAS_PADRAO[1]]) [0].cima, "arrowup");
verificar("limparTeclas: faltando direção volta pro padrão",
    limparTeclas([{ cima: "i", baixo: "k", esquerda: "j" }, TECLAS_PADRAO[1]])[0].cima, "arrowup");
verificar("limparTeclas: Espaço não pode", limparTeclas([{ cima: " ", baixo: "k", esquerda: "j", direita: "l" }, TECLAS_PADRAO[1]])[0].cima, "arrowup");
verificar("teclaPodeSerUsada: F é da tela cheia", teclaPodeSerUsada("f"), false);
verificar("teclaPodeSerUsada: G pode", teclaPodeSerUsada("g"), true);
verificar("trocarTecla: tecla livre", trocarTecla(TECLAS_PADRAO, 0, "cima", "i")[0].cima, "i");
const teclasTrocadas = trocarTecla(TECLAS_PADRAO, 0, "cima", "w");
verificar("trocarTecla: tecla do outro jogador troca de lugar", teclasTrocadas[0].cima + "," + teclasTrocadas[1].cima, "w,arrowup");
verificar("trocarTecla: não mexe no padrão original", TECLAS_PADRAO[1].cima, "w");
verificar("nomeDaTecla: seta", nomeDaTecla("arrowleft"), "←");
verificar("nomeDaTecla: letra", nomeDaTecla("k"), "K");
verificar("resumoDasTeclas: setas", resumoDasTeclas(TECLAS_PADRAO[0]), "setas");
verificar("resumoDasTeclas: WASD", resumoDasTeclas(TECLAS_PADRAO[1]), "WASD");

// compartilhar resultado
verificar("compartilhar: desafio com data e 1 jogador",
    textoDeCompartilhar("desafio", "2026-10-20", [{ nome: "Ana", pontuacao: 81 }], "https://x"),
    "🐍 Snake · Desafio de 20/10: 81 pontos\nHoje todo mundo joga o mesmo mapa. Consegue fazer mais? https://x");
verificar("compartilhar: 1 ponto no singular",
    textoDeCompartilhar("normal", "2026-10-20", [{ nome: "Ana", pontuacao: 1 }], "https://x").split("\n")[0],
    "🐍 Snake · Modo Normal: 1 ponto");
verificar("compartilhar: 2 jogadores",
    textoDeCompartilhar("clássico", "2026-10-20", [{ nome: "Ana", pontuacao: 12 }, { nome: "Bot", pontuacao: 8 }], "https://x").split("\n")[0],
    "🐍 Snake · Modo Clássico: Ana 12 x Bot 8");

// fantasma do recorde
const passosFantasma = [[0, 5, 5, 1], [100, 6, 5, 1], [200, 7, 5, 2], [300, 7, 6, 2]];
verificar("fantasma: corpo no passo 3 tem as 2 últimas cabeças",
    JSON.stringify(corpoDoFantasma(passosFantasma, 3)), JSON.stringify([{ x: 7, y: 6 }, { x: 7, y: 5 }]));
verificar("fantasma: corpo não passa do começo da gravação",
    corpoDoFantasma([[0, 1, 1, 3]], 0).length, 1);
verificar("fantasma: antes do 1º passo", passoDoFantasmaNoTempo(passosFantasma, -1), -1);
verificar("fantasma: passo exatamente no tempo", passoDoFantasmaNoTempo(passosFantasma, 200), 2);
verificar("fantasma: entre dois passos fica no anterior", passoDoFantasmaNoTempo(passosFantasma, 150), 1);
verificar("fantasma: depois do fim fica no último", passoDoFantasmaNoTempo(passosFantasma, 9999), 3);
verificar("fantasma: vários passos no tempo 0 (corpo inicial) pega o último",
    passoDoFantasmaNoTempo([[0, 1, 1, 3], [0, 2, 1, 3], [0, 3, 1, 3], [100, 4, 1, 3]], 0), 2);
verificar("fantasma: direção para a direita",
    JSON.stringify(direcaoDoFantasma({ x: 3, y: 3 }, { x: 4, y: 3 }, 20, 20)), JSON.stringify({ x: 1, y: 0 }));
verificar("fantasma: atravessar a borda (sem paredes) conta como 1 casa",
    JSON.stringify(direcaoDoFantasma({ x: 19, y: 3 }, { x: 0, y: 3 }, 20, 20)), JSON.stringify({ x: 1, y: 0 }));
verificar("fantasma: atravessar a borda de cima pra baixo",
    JSON.stringify(direcaoDoFantasma({ x: 4, y: 0 }, { x: 4, y: 19 }, 20, 20)), JSON.stringify({ x: 0, y: -1 }));
verificar("fantasma: parada não tem direção", direcaoDoFantasma({ x: 3, y: 3 }, { x: 3, y: 3 }, 20, 20), null);
verificar("fantasma: salto de troca de fase não tem direção", direcaoDoFantasma({ x: 3, y: 3 }, { x: 9, y: 3 }, 20, 20), null);
verificar("fantasma: de outro dia não vale",
    JSON.stringify(fantasmasDoDia({ data: "2026-10-19", porModo: { normal: { pontuacao: 9, passos: [] } } }, "2026-10-20")),
    JSON.stringify({ data: "2026-10-20", porModo: {} }));
verificar("fantasma: dado corrompido vira vazio", fantasmasDoDia("lixo", "2026-10-20").porModo.normal, undefined);
const fantasmasHoje = { data: "2026-10-20", porModo: { normal: { pontuacao: 10, passos: [[0, 1, 1, 1]] } } };
verificar("fantasma: partida pior não substitui",
    guardarFantasmaSeMelhor(fantasmasHoje, "2026-10-20", "normal", 10, [[0, 2, 2, 1]]), null);
verificar("fantasma: partida melhor substitui",
    guardarFantasmaSeMelhor(fantasmasHoje, "2026-10-20", "normal", 11, [[0, 2, 2, 1]]).porModo.normal.pontuacao, 11);
verificar("fantasma: outro modo não apaga o fantasma do normal",
    guardarFantasmaSeMelhor(fantasmasHoje, "2026-10-20", "rato", 3, [[0, 2, 2, 1]]).porModo.normal.pontuacao, 10);
verificar("fantasma: 0 pontos não vira fantasma",
    guardarFantasmaSeMelhor(null, "2026-10-20", "normal", 0, [[0, 2, 2, 1]]), null);
verificar("fantasma: de ontem é trocado mesmo com menos pontos",
    guardarFantasmaSeMelhor({ data: "2026-10-19", porModo: { normal: { pontuacao: 50, passos: [] } } }, "2026-10-20", "normal", 2, [[0, 2, 2, 1]]).porModo.normal.pontuacao, 2);

// 2 juntos
verificar("compartilhar: 2 juntos soma os pontos",
    textoDeCompartilhar("normal", "2026-10-21", [{ nome: "Ana", pontuacao: 12 }, { nome: "Beto", pontuacao: 8 }], "https://x", true).split("\n")[0],
    "🐍 Snake · Modo Normal: Ana + Beto fizeram 20 pontos juntos");

// temas do tabuleiro
verificar("temas: só a grama começa liberada",
    TEMAS_DO_TABULEIRO.filter((tema) => corEstaLiberada(tema, [])).map((tema) => tema.id).join(","), "grama");
verificar("limparTemaDoTabuleiro: tema bloqueado volta pra grama", limparTemaDoTabuleiro("neve", []), "grama");
verificar("limparTemaDoTabuleiro: tema liberado fica", limparTemaDoTabuleiro("neve", ["colecionadora"]), "neve");
verificar("temas: toda conquista pedida existe",
    TEMAS_DO_TABULEIRO.every((tema) => tema.conquista === null || CONQUISTAS.some((conquista) => conquista.id === tema.conquista)), true);

// tabuleiro no celular
verificar("tabuleiro: computador continua 20x20", JSON.stringify(tamanhoDoTabuleiro(false, 1280, 720, "normal")), '{"colunas":20,"linhas":20}');
verificar("tabuleiro: celular em pé fica com 15 colunas e mais linhas", JSON.stringify(tamanhoDoTabuleiro(true, 360, 640, "normal")), '{"colunas":15,"linhas":22}');
verificar("tabuleiro: celular comprido tem no máximo 26 linhas", tamanhoDoTabuleiro(true, 360, 900, "rato").linhas, 26);
verificar("tabuleiro: Fases e Desafio continuam 20x20 no celular", tamanhoDoTabuleiro(true, 360, 740, "fases").colunas + tamanhoDoTabuleiro(true, 360, 740, "desafio").linhas, 40);

// fase criada no editor
const paredesDeTeste = [{ x: 0, y: 0 }, { x: 19, y: 19 }, { x: 5, y: 3 }, { x: 10, y: 15 }];
verificar("fase criada: o código cabe num link", codificarFase(paredesDeTeste).length, 67);
verificar("fase criada: vai e volta igual",
    JSON.stringify(decodificarFase(codificarFase(paredesDeTeste))), '[{"x":0,"y":0},{"x":5,"y":3},{"x":10,"y":15},{"x":19,"y":19}]');
verificar("fase criada: sem paredes também funciona", JSON.stringify(decodificarFase(codificarFase([]))), "[]");
verificar("fase criada: parede na saída das cobras é ignorada", decodificarFase(codificarFase([{ x: 6, y: 10 }, { x: 2, y: 10 }])).length, 1);
verificar("fase criada: código quebrado devolve null", decodificarFase("abc"), null);
verificar("fase criada: nada salvo devolve null", decodificarFase(null), null);
verificar("fase criada: casas reservadas", [casaReservadaNaFase({ x: 3, y: 10 }), casaReservadaNaFase({ x: 18, y: 10 }), casaReservadaNaFase({ x: 6, y: 9 })].join(), "true,false,false");
verificar("fase criada: continua 20x20 no celular", tamanhoDoTabuleiro(true, 360, 740, "personalizada").colunas, 20);
verificar("compartilhar: fase criada convida pra jogar a fase",
    textoDeCompartilhar("personalizada", "2026-10-22", [{ nome: "Ana", pontuacao: 7 }], "https://x/#fase=abc").split("\n").slice(0, 2).join(" | "),
    "🐍 Snake · Modo Fase criada: 7 pontos | Fiz essa fase. Tenta passar: https://x/#fase=abc");

// controle de videogame
verificar("controle: seta pra cima", JSON.stringify(direcaoDoControle(Object.assign([], { 12: true }), [0, 0])), '{"x":0,"y":-1}');
verificar("controle: seta pra direita", JSON.stringify(direcaoDoControle(Object.assign([], { 15: true }), [0, 0])), '{"x":1,"y":0}');
verificar("controle: nada apertado", direcaoDoControle([], [0.1, -0.2]), null);
verificar("controle: analógico pra esquerda", JSON.stringify(direcaoDoControle([], [-0.9, 0.3])), '{"x":-1,"y":0}');
verificar("controle: analógico pra baixo", JSON.stringify(direcaoDoControle([], [0.4, 0.8])), '{"x":0,"y":1}');
verificar("controle: seta ganha do analógico", JSON.stringify(direcaoDoControle(Object.assign([], { 14: true }), [0.9, 0])), '{"x":-1,"y":0}');

// tutorial
verificar("tutorial: virar só passa quando vira",
    [passoDoTutorialCumprido("virar", { virou: false, comeu: true, tempoNoPassoMs: 99999 }), passoDoTutorialCumprido("virar", { virou: true, comeu: false, tempoNoPassoMs: 0 })].join(), "false,true");
verificar("tutorial: comer só pausa quando come",
    [passoDoTutorialCumprido("comer", { virou: true, comeu: false, tempoNoPassoMs: 99999 }), passoDoTutorialCumprido("comer", { virou: false, comeu: true, tempoNoPassoMs: 0 })].join(), "false,true");
verificar("tutorial: dica de ler passa com o tempo",
    [passoDoTutorialCumprido("cuidado", { virou: false, comeu: false, tempoNoPassoMs: 1000 }), passoDoTutorialCumprido("pausar", { virou: false, comeu: false, tempoNoPassoMs: TEMPO_DE_LEITURA_MS })].join(), "false,true");
verificar("tutorial: no celular fala de deslizar", textoDoTutorial("virar", "toque", "normal"), "Deslize o dedo no tabuleiro pra virar a cobra.");
verificar("tutorial: modo rato fala do rato", textoDoTutorial("comer", "teclado", "rato").includes("rato"), true);
verificar("tutorial: controle pausa com Start", textoDoTutorial("pausar", "controle", "normal").endsWith("Start pausa o jogo."), true);

// acessibilidade
verificar("acessibilidade: nada salvo começa desligado",
JSON.stringify(limparAcessibilidade(null)), '{"altoContraste":false,"menosMovimento":false}');
verificar("acessibilidade: guarda o que foi ligado", JSON.stringify(limparAcessibilidade({
"altoContraste":true, menosMovimento: false })), '{"altoContraste":true,"menosMovimento":false}');
verificar("acessibilidade: dado estranho vira desligado", JSON.stringify(limparAcessibilidade({
altoContraste: "sim", menosMovimento: 1 })), '{"altoContraste":false,"menosMovimento":false}');
verificar("acessibilidade: todo power-up tem nome falado",
Object.keys(NOMES_DOS_POWERUPS).length, 10);

// histórico
const partidaDeTeste = (pontos) => ({ data: "2026-10-23", modo: "normal", pontos, ms: 30000 });
verificar("histórico: nada salvo vira lista vazia", limparHistorico(null).length, 0);
verificar("histórico: joga fora partida estragada",
    limparHistorico([partidaDeTeste(5), { data: "ontem", modo: "normal", pontos: 3, ms: 1 }, { ...partidaDeTeste(2), pontos: -1 }, "lixo"]).length, 1);
verificar("histórico: guarda no máximo 200 partidas",
    adicionarAoHistorico(Array.from({ length: 200 }, () => partidaDeTeste(1)), partidaDeTeste(9)).length, 200);
verificar("histórico: a partida nova fica no fim",
    adicionarAoHistorico([partidaDeTeste(1)], partidaDeTeste(9))[1].pontos, 9);
verificar("histórico: melhor e média",
    JSON.stringify(resumoDoHistorico([partidaDeTeste(4), partidaDeTeste(10), partidaDeTeste(5)])), '{"melhor":10,"media":6.3,"tendencia":null}');
verificar("histórico: tendência subindo",
    resumoDoHistorico([1, 1, 1, 1, 1, 5, 5, 5, 5, 5].map(partidaDeTeste)).tendencia, "subindo");
verificar("histórico: tendência estável",
    resumoDoHistorico([3, 3, 3, 3, 3, 3, 4, 3, 3, 3].map(partidaDeTeste)).tendencia, "estavel");
verificar("gráfico: pontos da esquerda pra direita, maior em cima",
    JSON.stringify(pontosDoGrafico([0, 10, 5], 300, 120, 12).pontos), '[{"x":12,"y":108},{"x":150,"y":12},{"x":288,"y":60}]');
verificar("gráfico: uma partida fica no meio", pontosDoGrafico([3], 300, 120, 12).pontos[0].x, 150);

// missões diárias
const missoesTeste = missoesDoDia("2026-10-26");
verificar("missões: 3 por dia, 1 de somar e 2 de partida",
    missoesTeste.map((missao) => missao.tipo).join(), "soma,partida,partida");
verificar("missões: mesmo dia, mesmas missões", JSON.stringify(missoesDoDia("2026-10-26")), JSON.stringify(missoesTeste));
verificar("missões: no máximo 1 de modo específico por dia",
    Array.from({ length: 365 }, (_, i) => missoesDoDia(dataDeHoje(new Date(2026, 0, 1 + i)))).every((dia) => dia.filter((missao) => missao.modo).length <= 1), true);
verificar("missões: sem repetir no mesmo dia", new Set(missoesTeste.map((missao) => missao.id)).size, 3);
verificar("missões: muda de um dia pro outro",
    ["2026-10-27", "2026-10-28", "2026-10-29"].some((data) => JSON.stringify(missoesDoDia(data)) !== JSON.stringify(missoesTeste)), true);
verificar("missões: progresso de ontem zera hoje",
    JSON.stringify(limparMissoes({ data: "2026-10-25", progresso: { comer30: 10 }, feitas: ["comer30"] }, "2026-10-26")), '{"data":"2026-10-26","progresso":{},"feitas":[]}');
verificar("missões: dado estranho é jogado fora",
    JSON.stringify(limparMissoes({ data: "2026-10-26", progresso: { comer30: "muito", inventada: 3, combo4: 2 }, feitas: ["combo4", "x"] }, "2026-10-26")),
    '{"data":"2026-10-26","progresso":{"combo4":2},"feitas":["combo4"]}');

// missões de teste fixas: um dia em que as 3 são conhecidas
const diaDeTeste = Array.from({ length: 365 }, (_, i) => dataDeHoje(new Date(2026, 0, 1 + i)))
    .find((data) => missoesDoDia(data)[0].id === "comer30" && !missoesDoDia(data).some((missao) => missao.modo)) || null;
verificar("missões: achou um dia de teste", diaDeTeste !== null, true);
const partidaDeMissao = (extra) => ({ modo: "normal", pontos: 0, comidas: 0, powerUps: 0, douradas: 0, maiorCombo: 0, tamanho: 1, segundos: 10, fase: 1, ...extra });
const vazioTeste = limparMissoes(null, diaDeTeste);
const depoisDe20 = registrarPartidaNasMissoes(vazioTeste, partidaDeMissao({ comidas: 20 })).estado;
verificar("missões: a de somar vai juntando", depoisDe20.progresso.comer30, 20);
const depoisDe40 = registrarPartidaNasMissoes(depoisDe20, partidaDeMissao({ comidas: 20 }));
verificar("missões: completa e não passa do alvo", [depoisDe40.estado.progresso.comer30, depoisDe40.novas.map((missao) => missao.id).join()].join(), "30,comer30");
verificar("missões: missão feita não é avisada de novo",
    registrarPartidaNasMissoes(depoisDe40.estado, partidaDeMissao({ comidas: 50 })).novas.length, 0);
verificar("missões: a de partida guarda o melhor, não soma",
    registrarPartidaNasMissoes(registrarPartidaNasMissoes(vazioTeste, partidaDeMissao({ pontos: 9, maiorCombo: 3, tamanho: 9, segundos: 60 })).estado,
        partidaDeMissao({ pontos: 5, maiorCombo: 2, tamanho: 5, segundos: 20 })).estado.progresso[missoesDoDia(diaDeTeste)[1].id] > 0, true);
verificar("missões: missão de modo só conta no modo certo",
    registrarPartidaNasMissoes({ data: "x", progresso: {}, feitas: [] }, partidaDeMissao({ pontos: 99 })).novas.every((missao) => !missao.modo), true);

verificar("sequência: dia anterior", diaAnterior("2026-11-01"), "2026-10-31");
verificar("sequência: dia seguido soma", atualizarSequencia({ dias: 2, ultimoDia: "2026-10-25" }, "2026-10-26").dias, 3);
verificar("sequência: pulou um dia, recomeça", atualizarSequencia({ dias: 5, ultimoDia: "2026-10-20" }, "2026-10-26").dias, 1);
verificar("sequência: mostra 0 se ontem não completou", sequenciaValendo({ dias: 5, ultimoDia: "2026-10-20" }, "2026-10-26"), 0);
verificar("sequência: nada salvo", JSON.stringify(limparSequencia("lixo")), '{"dias":0,"ultimoDia":null}');

// moedas e loja
const itemDaLoja = (id) => ITENS_DA_LOJA.find((item) => item.id === id);
verificar("moedas: 1 a cada 2 pontos", [moedasDaPartida(0), moedasDaPartida(1), moedasDaPartida(7), moedasDaPartida(20)].join(), "0,0,3,10");
verificar("moedas: missões, bônus do dia e sequência (até +50)",
    [moedasDasMissoes(1, false, 3), moedasDasMissoes(1, true, 1), moedasDasMissoes(3, true, 4), moedasDasMissoes(1, true, 30)].join(), "15,50,95,95");
verificar("loja: ids únicos", new Set(ITENS_DA_LOJA.map((item) => item.id)).size, ITENS_DA_LOJA.length);
verificar("loja: todo item tem preço ou conquista (nunca os dois)",
    ITENS_DA_LOJA.every((item) => Boolean(item.preco) !== Boolean(item.conquista)), true);
verificar("loja: toda conquista de item existe", ITENS_DA_LOJA.filter((item) => item.conquista).every((item) => CONQUISTAS.some((c) => c.id === item.conquista)), true);
verificar("loja: carteira vazia", JSON.stringify(limparCarteira(null, [])), '{"moedas":0,"comprados":[],"equipados":{"chapeu":null,"comida":null,"corpo":null,"rastro":null,"tabuleiro":null,"efeito":null}}');
verificar("loja: carteira estranha é limpa",
    JSON.stringify(limparCarteira({ moedas: -5, comprados: ["bone", "bone", "coroa", "inventado"], equipados: { chapeu: "coroa", comida: "bone" } }, [])),
    '{"moedas":0,"comprados":["bone"],"equipados":{"chapeu":null,"comida":null,"corpo":null,"rastro":null,"tabuleiro":null,"efeito":null}}');
verificar("loja: item de conquista vale depois de ganhar",
    limparCarteira({ equipados: { chapeu: "coroa" } }, ["lendaria"]).equipados.chapeu, "coroa");
const carteiraDeTeste = limparCarteira({ moedas: 200 }, []);
verificar("loja: comprar desconta e guarda", JSON.stringify(comprarItem(carteiraDeTeste, itemDaLoja("bone"))),
    '{"moedas":80,"comprados":["bone"],"equipados":{"chapeu":null,"comida":null,"corpo":null,"rastro":null,"tabuleiro":null,"efeito":null}}');
verificar("loja: sem moedas não compra", comprarItem(carteiraDeTeste, itemDaLoja("helice")), null);
verificar("loja: item de conquista não se compra", comprarItem({ ...carteiraDeTeste, moedas: 99999 }, itemDaLoja("coroa")), null);
verificar("loja: não compra duas vezes", comprarItem({ ...carteiraDeTeste, comprados: ["bone"] }, itemDaLoja("bone")), null);
const comBone = comprarItem(carteiraDeTeste, itemDaLoja("bone"));
verificar("loja: usar e tirar", [equiparItem(comBone, itemDaLoja("bone"), []).equipados.chapeu,
    equiparItem(equiparItem(comBone, itemDaLoja("bone"), []), itemDaLoja("bone"), []).equipados.chapeu].join(), "bone,");
verificar("loja: não usa o que não tem", equiparItem(carteiraDeTeste, itemDaLoja("laco"), []), null);
verificar("conquista: Lendária com 100 pontos", conquistasNovas([], { estatisticas: estatisticasVazias(), partida: { pontos: 100, tamanho: 1, powerUps: 0 } }).some((c) => c.id === "lendaria"), true);

// loja parte 2
verificar("loja: todo tipo tem item à venda e item de conquista ou mais de 2 à venda",
    TIPOS_DA_LOJA.every((tipo) => ITENS_DA_LOJA.filter((item) => item.tipo === tipo && item.preco).length >= 3), true);
verificar("loja: preços dentro das faixas (100 a 1000)", ITENS_DA_LOJA.filter((item) => item.preco).every((item) => item.preco >= 100 && item.preco <= 1000), true);
verificar("loja: todo item é de um tipo que existe", ITENS_DA_LOJA.every((item) => TIPOS_DA_LOJA.includes(item.tipo)), true);
verificar("loja: tabuleiro tem as duas cores", ITENS_DA_LOJA.filter((item) => item.tipo === "tabuleiro").every((item) => item.claro && item.escuro), true);
verificar("loja: cada conquista dá no máximo 1 item", new Set(ITENS_DA_LOJA.filter((item) => item.conquista).map((item) => item.conquista)).size,
    ITENS_DA_LOJA.filter((item) => item.conquista).length);
verificar("conquista: Combo x8", conquistasNovas([], { estatisticas: { ...estatisticasVazias(), maiorCombo: 8 }, partida: { pontos: 0, tamanho: 1, powerUps: 0 } }).some((c) => c.id === "comboOito"), true);
verificar("conquista: Fiel com 7 dias de missões",
    [6, 7].map((dias) => conquistasNovas([], { estatisticas: estatisticasVazias(), partida: { pontos: 0, tamanho: 1, powerUps: 0 }, missoesSeguidas: dias }).some((c) => c.id === "fiel")).join(), "false,true");
verificar("loja: usar tabuleiro guarda no tipo certo",
    equiparItem({ moedas: 0, comprados: ["praia"], equipados: limparCarteira(null, []).equipados }, ITENS_DA_LOJA.find((item) => item.id === "praia"), []).equipados.tabuleiro, "praia");

// modo Arena
verificar("arena: começa com o tabuleiro todo", JSON.stringify(zonaDaArena(0, 20, 20)), JSON.stringify({ esquerda: 0, topo: 0, direita: 19, baixo: 19, final: false }));
verificar("arena: fecha 1 volta a cada 15 s", [14999, 15000, 30000].map((ms) => zonaDaArena(ms, 20, 20).esquerda).join(), "0,1,2");
verificar("arena: para no lado mínimo (20x20 vira 8x8)", JSON.stringify(zonaDaArena(999999, 20, 20)), JSON.stringify({ esquerda: 6, topo: 6, direita: 13, baixo: 13, final: true }));
verificar("arena: celular com 15 colunas para em 9 de largura", [zonaDaArena(999999, 15, 24).esquerda, zonaDaArena(999999, 15, 24).direita, zonaDaArena(999999, 15, 24).baixo].join(), "3,11,20");
verificar("arena: tempo até fechar", [tempoParaFecharArena(0, 20, 20), tempoParaFecharArena(14000, 20, 20), tempoParaFecharArena(90000, 20, 20)].join(), "15000,1000,");
verificar("arena: fora da zona", [{ x: 1, y: 1 }, { x: 0, y: 5 }, { x: 18, y: 18 }, { x: 19, y: 3 }].map((casa) => foraDaZona(casa, zonaDaArena(15000, 20, 20))).join(), "false,true,false,true");
verificar("arena: corpo fora da zona queima", cortarCobraNaZona([{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 2 }], zonaDaArena(15000, 20, 20)).length, 3);
verificar("arena: a cabeça fora não é cortada (vira batida)", cortarCobraNaZona([{ x: 0, y: 1 }, { x: 1, y: 1 }], zonaDaArena(15000, 20, 20)).length, 2);
verificar("arena: frase da batida", descreverBatida("Ana", "zona", ""), "Ana ficou fora da zona");
verificar("conquista: Sobrevivente só na última zona da Arena",
    [{ modo: "arena", zonaFinal: true }, { modo: "normal", zonaFinal: true }, { modo: "arena" }].map((extra) => conquistasNovas([], { estatisticas: estatisticasVazias(), partida: { pontos: 0, tamanho: 1, powerUps: 0, ...extra } }).some((c) => c.id === "sobrevivente")).join(), "true,false,false");

verificar("loja: Sobrevivente dá a Cobra de magma", ITENS_DA_LOJA.find((item) => item.conquista === "sobrevivente").id, "magma");

// velocidade: acelera pelo que come, numa curva suave com limite
verificar("velocidade: começa no passo inicial", duracaoDoPasso(250, 0, 2), 250);
verificar("velocidade: 10 comidas no Normal ainda é tranquilo (~1,2x)", formatarVelocidade(250, duracaoDoPasso(250, 10, 2)), "1,2x");
verificar("velocidade: 30 comidas no Normal (~1,5x)", formatarVelocidade(250, duracaoDoPasso(250, 30, 2)), "1,5x");
verificar("velocidade: nunca passa do limite da dificuldade", [duracaoDoPasso(250, 1000, 2), duracaoDoPasso(300, 1000, 1.6), duracaoDoPasso(180, 1000, 2.4)].join(), "125,188,75");
verificar("velocidade: cada comida acelera menos que a anterior",
    (duracaoDoPasso(250, 0, 2) - duracaoDoPasso(250, 1, 2)) > (duracaoDoPasso(250, 40, 2) - duracaoDoPasso(250, 41, 2)), true);

// modo Chefão
verificar("chefão: o 1º tem 3 de vida e 8 de tamanho", JSON.stringify([nivelDoChefao(1).vida, nivelDoChefao(1).tamanho]), "[3,8]");
verificar("chefão: cada um é mais forte (vida, tamanho e erra menos)",
    [1, 2, 3].every((n) => nivelDoChefao(n + 1).vida >= nivelDoChefao(n).vida && nivelDoChefao(n + 1).tamanho > nivelDoChefao(n).tamanho && nivelDoChefao(n + 1).chanceDeErro < nivelDoChefao(n).chanceDeErro), true);
verificar("chefão: tem limite de vida e tamanho", JSON.stringify([nivelDoChefao(50).vida, nivelDoChefao(50).tamanho, nivelDoChefao(50).chanceDeErro]), "[6,16,0.02]");
verificar("chefão: longe, vai na comida", JSON.stringify(alvoDoChefao({ x: 0, y: 0 }, { x: 15, y: 15 }, { x: 1, y: 0 }, { x: 3, y: 4 }, false, 20, 20)), JSON.stringify({ x: 3, y: 4 }));
verificar("chefão: perto, corta a frente da sua cabeça", JSON.stringify(alvoDoChefao({ x: 8, y: 10 }, { x: 10, y: 5 }, { x: 1, y: 0 }, { x: 0, y: 0 }, false, 20, 20)), JSON.stringify({ x: 13, y: 5 }));
verificar("chefão: com a sua espada, foge pro lado contrário", JSON.stringify(alvoDoChefao({ x: 10, y: 10 }, { x: 7, y: 9 }, { x: 1, y: 0 }, { x: 0, y: 0 }, true, 20, 20)), JSON.stringify({ x: 13, y: 11 }));
verificar("chefão: o alvo nunca sai do tabuleiro", JSON.stringify(alvoDoChefao({ x: 18, y: 1 }, { x: 10, y: 9 }, { x: 1, y: 0 }, { x: 0, y: 0 }, true, 20, 20)), JSON.stringify({ x: 19, y: 0 }));
verificar("conquista: Encarou o abismo com 1 e Caçadora do abismo com 3",
    [1, 3].map((chefoes) => conquistasNovas([], { estatisticas: estatisticasVazias(), partida: { pontos: 0, tamanho: 1, powerUps: 0, chefoes } }).filter((c) => c.id === "encarouOAbismo" || c.id === "cacadora").length).join(), "1,2");
verificar("loja: toda liberação aponta pra uma conquista que existe", ITENS_DA_LOJA.filter((item) => item.liberaCom).every((item) => item.preco && CONQUISTAS.some((c) => c.id === item.liberaCom)), true);
verificar("loja: Espectro não compra antes de Encarou o abismo", comprarItem({ moedas: 5000, comprados: [], equipados: {} }, ITENS_DA_LOJA.find((item) => item.id === "espectro"), []), null);
verificar("loja: Espectro compra depois de Encarou o abismo",
    JSON.stringify(comprarItem({ moedas: 5000, comprados: [], equipados: {} }, ITENS_DA_LOJA.find((item) => item.id === "espectro"), ["encarouOAbismo"]).comprados), JSON.stringify(["espectro"]));

// power-ups que aparecem na partida
verificar("power-ups: com tudo, aparecem os 10", powerUpsDaPartida({ arena: false, temQuemCongelar: true, temPedras: true }).length, 10);
verificar("power-ups: sozinha e sem nada andando não tem Congelar", powerUpsDaPartida({ arena: false, temQuemCongelar: false, temPedras: true }).includes("congelar"), false);
verificar("power-ups: sem pedras não tem Bomba", powerUpsDaPartida({ arena: false, temQuemCongelar: true, temPedras: false }).includes("bomba"), false);
verificar("power-ups: na Arena não tem Portal", powerUpsDaPartida({ arena: true, temQuemCongelar: true, temPedras: true }).includes("portal"), false);
verificar("power-ups: todos têm nome", powerUpsDaPartida({ arena: false, temQuemCongelar: true, temPedras: true }).every((tipo) => NOMES_DOS_POWERUPS[tipo]), true);
verificar("bomba: explode as pedras no quadrado 5x5 em volta",
    JSON.stringify(pedrasNaExplosao([{ x: 0, y: 0 }, { x: 3, y: 3 }, { x: 4, y: 1 }, { x: 6, y: 6 }], { x: 2, y: 2 }, 2).explodidas), JSON.stringify([{ x: 0, y: 0 }, { x: 3, y: 3 }, { x: 4, y: 1 }]));
verificar("bomba: as pedras longe ficam", JSON.stringify(pedrasNaExplosao([{ x: 0, y: 0 }, { x: 6, y: 6 }, { x: 5, y: 2 }], { x: 2, y: 2 }, 2).ficam), JSON.stringify([{ x: 6, y: 6 }, { x: 5, y: 2 }]));

const linhaResumo = document.createElement("p");
linhaResumo.textContent = `${totalTestes - testesComFalha}/${totalTestes} testes passaram`;
linhaResumo.style.fontWeight = "bold";
elementoResultados.appendChild(linhaResumo);