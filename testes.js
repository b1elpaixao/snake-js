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

const linhaResumo = document.createElement("p");
linhaResumo.textContent = `${totalTestes - testesComFalha}/${totalTestes} testes passaram`;
linhaResumo.style.fontWeight = "bold";
elementoResultados.appendChild(linhaResumo);