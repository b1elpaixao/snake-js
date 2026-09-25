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

const linhaResumo = document.createElement("p");
linhaResumo.textContent = `${totalTestes - testesComFalha}/${totalTestes} testes passaram`;
linhaResumo.style.fontWeight = "bold";
elementoResultados.appendChild(linhaResumo);