# Snake-JS

Jogo da cobrinha  em JavaScript puro (sem frameworks, sem build).
Site no ar: https://b1elpaixao.github.io/snake-js/ (GitHub Pages, publica sozinho a cada push na `main`).
Testes: abrir `testes.html` no navegador; tem que dar todos passando (386 na última contagem).

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
4. `som.js` - efeitos, música (agendada no relógio do áudio: `loopMusicaFundo`, `tocarPassoDaMusica`), volume (`ganhoMusica`/`ganhoEfeitos`), vibração e o cartão Som ("Ouvir")
5. `movimento.js` - mover, colisão, recordes, power-ups, bot, pausa
6. `modos.js` - Contra o tempo, Fases, 2 Juntos, 3-4 jogadores (`tirarDaPartida`) e Arena (zona que fecha a cada 15 s: `zonaArena`, `atualizarZonaDaArena`)
7. `chefao.js` - modo Chefão: "os olhos que emergem" (o Jogador 2 vira o chefão, `chefao`), espada, golpes, vida no placar, pulsos de luz; tabuleiro `TEMA_DO_ABISMO`
8. `poderes.js` - power-ups novos: Congelar (`quemCongelou`, `estaCongelado`; tabuleiro de gelo, rachaduras no fim e o gelo estilhaça) e Bomba (`explodirBomba`: pedras num 5x5 somem e não voltam, `pedrasDestruidas`; no Chefão tira 1 de vida; explosão cartoon, tela treme; só aparece com pedras)
9. `fantasma.js` - fantasma do recorde: com 1 jogador, uma cobra transparente refaz a melhor partida de hoje
10. `controle.js` - controle de videogame: lê os botões a cada quadro (setas/analógico, A, Start) e treme junto com a vibração
11. `tutorial.js` - tutorial na primeira vez: dicas que avançam quando a pessoa vira, come etc. (`snakeTutorialVisto`)
12. `acessibilidade.js` - alto contraste, menos movimento e `anunciar()` (avisos pro leitor de tela)
13. `historico.js` - histórico das partidas (`snakeHistorico`, até 200) e o gráfico SVG das últimas 30
14. `missoes.js` - missões diárias: 3 por dia sorteadas pela data (`snakeMissoes`), sequência de dias (`snakeSequenciaMissoes`)
15. `enfeites.js` - desenho dos itens da loja: chapéus, comidas, padrões do corpo, rastros e efeitos (partículas), tabuleiros com enfeites, as prévias e o estilo "aura" (`desenharSombraViva`: chefão e skin Espectro; sem `ctx.filter`, rascunho nem `createPattern` — travavam: a aura são camadas transparentes e o granulado são pontinhos num Path2D)
16. `loja.js` - moedas (`snakeCarteira`: moedas, comprados, equipados), tela da loja com abas, desenho dos chapéus e das comidas
17. `salvos.js` - tudo que é guardado no navegador: `lerDoArmazenamento`/`salvarNoArmazenamento`, recordes, estatísticas, conquistas, teclas e preferências
18. `script.js` - configuração, estado, inicialização e tudo que roda ao abrir a página (sempre por último)

Os arquivos 2 a 17 só tem funções e valores fixos; o que executa ao carregar fica no `script.js`.
Outros: `style.css`, `sw.js` (service worker, cache `snake-v16`), `manifest.webmanifest`, ícones PNG (`icone-32`, `-180`, `-192`, `-512`, `-maskable-512`: a cobra enrolada na maçã, desenhada pelo próprio jogo).
**Ao criar um arquivo .js novo:** incluir no `index.html` antes do `script.js`, na lista `ARQUIVOS`
do `sw.js`, e trocar o número do `NOME_DO_CACHE`.

## Economia da loja (combinado com o usuário)

Conquistas dão itens exclusivos 🏆 (nunca vendidos); a loja vende só itens próprios. Itens 🔒 (`liberaCom`): à venda, mas só depois de uma conquista (ex.: Espectro, 800, libera com "Encarou o abismo"). Moedas: 1 a cada 2 pontos, 15 por missão, +30 com as 3 do dia, +5 por dia de sequência (até +50); ~150-200 moedas em 30 min/dia. Preços: simples 100-200, legal 300-500, especial 700-1000. Tudo em `ITENS_DA_LOJA` e nas constantes `MOEDAS_*` do `logica.js`.

## Nomes do meu jeito (funcionam, não "corrija")

`puxarAlimento` (sem s), `criarRatosIniciais`, `espaçoNecessario` (com ç), `PEDRAS_NO_DESAFIO`,
`NOME_DAS_SETAS` (no `logica.js`). O modo `"clássico"` tem acento no valor.

## Coisas importantes do código

- Até 4 jogadores: `jogadores` = só quem ainda está na partida; `participantes` = todos que começaram (volta pra `jogadores` no fim, pra placar/recordes/moedas). Use `jogador.numero` (1 a 4), não o índice em `jogadores`. Com 3+, quem bate sai (`saidasDaPartida`) e o último vivo ganha (`classificarPorSobrevivencia`). Fases/Desafio/fase criada/Chefão: só 2 (`jogadoresPermitidos`).

- Movimento por trilha: a direção do próximo passo é combinada no fim de cada passo; o corpo é desenhado seguindo as casas, com cantos arredondados. Os passos acontecem dentro do `loopRenderizacao` (compasso do desenho) usando `proximoLoopEm`; não volte para `setTimeout`.
- Velocidade: acelera pelo que a cobra come (`jogador.comidas`), não pelos pontos, numa curva suave (`duracaoDoPasso`) com limite por dificuldade (`aceleracaoMaxima`: 1,6x / 2x / 2,4x). Não voltar a ligar a velocidade aos pontos: o combo faz o jogo disparar.
- `agoraDoJogo()` é o relógio que para na pausa. Use ele para tempos no jogo.
- Teclas reservadas (não podem ser escolhidas para jogador): Espaço, Esc, F, Enter, Tab.
- localStorage só pelas funções `lerDoArmazenamento` / `salvarNoArmazenamento`.

## Lições aprendidas

- Movimento e animação: não confiar só em números ou simulação com relógio perfeito. Conferir quadro a quadro (tira de imagens) e com o tempo real do navegador.
- Conferir que todo `getElementById("x")` tem `id="x"` no HTML.

## Melhorias (lista 4 concluída)

Feito: 1 movimento por trilha / delay nas teclas · 2 compartilhar resultado · 3 fantasma do recorde · 4 modo 2 Juntos (cooperativo) · 5 power-ups Escudo, Portal e Câmera lenta · 6 temas do tabuleiro (Grama, Deserto, Neve, Noite) · celular: cobra, itens e tabuleiro maiores · celular sem setas (só deslizar), tabuleiro em pé 15 colunas, tudo maior · 7 editor de fases com link (botão "Criar fase", modo `"personalizada"`, link `#fase=`) · 8 controle de videogame (`controle.js`) · 9 tutorial na primeira vez (`tutorial.js`) · 10 acessibilidade (`acessibilidade.js`) · 11 histórico com gráfico (`historico.js`) · 12 ícones PNG · 13 `salvos.js` (script.js dividido).

## Melhorias pendentes (lista 5)

Feito: 1 missões diárias (`missoes.js`) · 2 moedas e loja, partes 1 e 2 (`loja.js` + `enfeites.js`: chapéus, comidas, padrões do corpo, rastros, tabuleiros e efeitos ao comer; itens 🏆 só por conquista: Zebra=Glutona, Lava=Saí do labirinto, Fogo=Combo x8, Dourada=Fiel, Faíscas=Arsenal, Máscara de ferro=Última de pé; de época: Chapéu de bruxa=Noite das bruxas, Esqueleto=Até os ossos, Morceguinhos=Revoada, Gorro de Papai Noel=Ho ho ho!, Pisca-pisca=Luzes de Natal, Flocos de neve=Nevasca, Máscara de baile=Folia, Lantejoulas=Brilho na avenida, Serpentinas=Bloco na rua, Orelhas de coelho=Caça aos ovos, Chocolate=Chocólatra, Ovinhos=Cesta cheia, Chapéu de palha=Arraiá, Xadrez=Olha a cobra!, Pipoca=Balancê) · 3 modo Arena (zona que fecha, conquista Sobrevivente = corpo exclusivo Cobra de magma). · 4 modo Chefão (`chefao.js`: "os olhos que emergem", estilo aura no abismo; espada; skin Espectro liberada por conquista).
· 5 power-ups Congelar e Bomba (`poderes.js`; Fantasma descartado) + conquista Arsenal (6 power-ups diferentes numa partida, `partidaAtual.tiposDePowerUp`) = rastro exclusivo Faíscas.
· 6 até 4 jogadores (pedaço 1, base; pedaço 2, botão Pessoa/Bot nas vagas 2-4 (`vagasComBot`, `vagasComBotAtuais`) e bot que foge de bater de frente (`casasPerigosas`); pedaço 3, controle pra 4 (`jogadorDoControle`: cada controle move uma pessoa na ordem, pulando bots); pedaço 4, ajustes nos modos (Contra o tempo ordena por pontos, `classificarPorPontos`; quem congelou e saiu quebra o gelo) + conquista Última de pé (vencer com 4) = chapéu exclusivo Máscara de ferro (`desenharMascaraDeFerro`: estilo gibi anos 80, capuz curto verde, formas em Path2D criadas uma vez só)).
· 9 temas de época (pedaço 1, base + Halloween 25/10 a 2/11: `EPOCAS`/`epocaDoDia` no `logica.js`, `epocaAtual` e `enfeitesDeEpoca` (caixa "Enfeites de época"; tabuleiro e comida da época ganham da loja e do tema), missões da época em `snakeMissoesDaEpoca` (somam a época toda, cada uma dá uma conquista com prêmio); desenhos no fim do `enfeites.js`; pedaço 2, Natal e Ano Novo 15/12 a 6/1 (tabuleiro vermelho, panetone; atravessa a virada: a chave usa o ano em que começou; `diasDeFogos` 31/12 e 1/1 põe `fogos` no tabuleiro); pedaço 3, Carnaval (Páscoa -51 a -46) e Páscoa (-7 a +1): `diasDaPascoa` no lugar de inicio/fim, `domingoDePascoa`/`diaDaPascoaMais`; pedaço 4, Festa Junina em junho; chapéu de palha com palhinha na boca, escondendo os olhos).
· 10 volume ajustável e mais músicas (cartão Som: barrinhas `volumeMusica`/`volumeEfeitos` 0-100, 50 = volume antigo; `MUSICAS` no `logica.js` em notas MIDI: Clássica, Arcade, Aventura, Calma e Abismo, que é só do Chefão; "Sortear a cada partida"; salvos nas preferências).
A fazer: 11 replay e GIF · 12 nível e XP. (13 idiomas descartado: depois do 12 o projeto fecha.)