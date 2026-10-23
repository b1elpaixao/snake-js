# Snake-JS

Jogo da cobrinha  em JavaScript puro (sem frameworks, sem build).
Site no ar: https://b1elpaixao.github.io/snake-js/ (GitHub Pages, publica sozinho a cada push na `main`).
Testes: abrir `testes.html` no navegador; tem que dar todos passando (232 na última contagem).

## Como eu gosto de trabalhar

- **Não edite os arquivos do projeto.** Me dê o código para eu colar, mostrando só o que mudou
  (estilo diff, com o número aproximado da linha e onde colar). Exceção: quando eu disser
  explicitamente "pode aplicar você mesmo" (por exemplo, quando eu estiver no celular).
- Teste antes de me entregar: monte numa cópia fora do projeto, rode os testes e simule o jogo.
- Depois que eu colar, eu peço "verifique se tem algum erro": compare meus arquivos com a versão
  testada, linha por linha, e aponte cada diferença com o trecho certo.
- **Depois de cada melhoria conferida, faça o commit e o push sozinho** (sem esperar eu pedir).
  Termine a mensagem do commit com a linha de coautoria do Claude.
- Me responda em português, de forma direta.

## Estrutura

Arquivos JS carregados nesta ordem pelo `index.html` (scripts comuns, sem módulos, para funcionar abrindo o arquivo direto no computador):

1. `logica.js` - funções puras (testadas em `testes.js`)
2. `itens.js` - pedras, comida, maçã dourada, ratos
3. `desenho.js` - desenho do tabuleiro, da cobra (movimento por trilha), telas e contagem
4. `som.js` - efeitos, música, vibração
5. `movimento.js` - mover, colisão, recordes, power-ups, bot, pausa
6. `modos.js` - Contra o tempo e Fases
7. `fantasma.js` - fantasma do recorde: com 1 jogador, uma cobra transparente refaz a melhor partida de hoje
8. `controle.js` - controle de videogame: lê os botões a cada quadro (setas/analógico, A, Start) e treme junto com a vibração
9. `tutorial.js` - tutorial na primeira vez: dicas que avançam quando a pessoa vira, come etc. (`snakeTutorialVisto`)
10. `acessibilidade.js` - alto contraste, menos movimento e `anunciar()` (avisos pro leitor de tela)
11. `historico.js` - histórico das partidas (`snakeHistorico`, até 200) e o gráfico SVG das últimas 30
12. `script.js` - configuração, estado, inicialização e tudo que roda ao abrir a página (sempre por último)

Os arquivos 2 a 11 só tem funções e valores fixos; o que executa ao carregar fica no `script.js`.
Outros: `style.css`, `sw.js` (service worker, cache `snake-v8`), `manifest.webmanifest`, `icone.svg`.
**Ao criar um arquivo .js novo:** incluir no `index.html` antes do `script.js`, na lista `ARQUIVOS`
do `sw.js`, e trocar o número do `NOME_DO_CACHE`.

## Nomes do meu jeito (funcionam, não "corrija")

`puxarAlimento` (sem s), `criarRatosIniciais`, `espaçoNecessario` (com ç), `PEDRAS_NO_DESAFIO`,
`NOME_DAS_SETAS` (no `logica.js`). O modo `"clássico"` tem acento no valor.

## Coisas importantes do código

- Movimento por trilha: a direção do próximo passo é combinada no fim de cada passo; o corpo é desenhado seguindo as casas, com cantos arredondados. Os passos acontecem dentro do `loopRenderizacao` (compasso do desenho) usando `proximoLoopEm`; não volte para `setTimeout`.
- `agoraDoJogo()` é o relógio que para na pausa. Use ele para tempos no jogo.
- Teclas reservadas (não podem ser escolhidas para jogador): Espaço, Esc, F, Enter, Tab.
- localStorage só pelas funções `lerDoArmazenamento` / `salvarNoArmazenamento`.

## Lições aprendidas

- Movimento e animação: não confiar só em números ou simulação com relógio perfeito. Conferir quadro a quadro (tira de imagens) e com o tempo real do navegador.
- Conferir que todo `getElementById("x")` tem `id="x"` no HTML.

## Melhorias pendentes (lista 4)

Feito: 1 movimento por trilha / delay nas teclas · 2 compartilhar resultado · 3 fantasma do recorde · 4 modo 2 Juntos (cooperativo) · 5 power-ups Escudo, Portal e Câmera lenta · 6 temas do tabuleiro (Grama, Deserto, Neve, Noite) · celular: cobra, itens e tabuleiro maiores · celular sem setas (só deslizar), tabuleiro em pé 15 colunas, tudo maior · 7 editor de fases com link (botão "Criar fase", modo `"personalizada"`, link `#fase=`) · 8 controle de videogame (`controle.js`) · 9 tutorial na primeira vez (`tutorial.js`) · 10 acessibilidade (`acessibilidade.js`) · 11 histórico com gráfico (`historico.js`).
A fazer: 12 ícones PNG e conferir instalação · 13 terminar de dividir o `script.js` (`salvos.js`).