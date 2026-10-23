// ==========================================
// Acessibilidade: alto contraste, menos movimento e avisos pro leitor de tela
// ==========================================
let opcoesDeAcessibilidade = { altoContraste: false, menosMovimento: false };
let anunciosPendentes = [];

function aplicarAcessibilidade() {
    reduzirMovimento = movimentoReduzidoNoSistema || opcoesDeAcessibilidade.menosMovimento;
    document.body.classList.toggle("menos-movimento", opcoesDeAcessibilidade.menosMovimento);
    document.getElementById("opcaoAltoContraste").checked = opcoesDeAcessibilidade.altoContraste;
    document.getElementById("opcaoMenosMovimento").checked = opcoesDeAcessibilidade.menosMovimento;
}

function salvarAcessibilidade() {
    salvarNoArmazenamento("snakeAcessibilidade", JSON.stringify(opcoesDeAcessibilidade));
}

// leitor de tela: escreve numa área invísivel que o leitor fala em voz alta.
// Avisos que chegam juntos (comeu e pegou o power-up no mesmo passo) são lidos numa frase só.
function anunciar(texto) {
    anunciosPendentes.push(texto);
    if (anunciosPendentes.length > 1) return; // já vai ser lido junto com o primeiro

    const area = document.getElementById("anuncioLeitor");
    area.textContent = ""; // limpa antes: assim o mesmo texto duas vezes seguidas também é lido

    setTimeout(() => {
        area.textContent = anunciosPendentes.join(". ");
        anunciosPendentes = [];
    }, 100);
}