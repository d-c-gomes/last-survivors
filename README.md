# Last Survivors

Last Survivors e um jogo web 2D top-down desenvolvido em Phaser 3 e Vite.
O jogo segue o estilo survivor-like, inspirado em Vampire Survivors e Survivor.io.

O jogador controla um cavaleiro num ambiente de fantasia sombria e deve sobreviver a ondas de inimigos. O ataque e automatico, os inimigos deixam cristais de XP, o jogador evolui de nivel e no final surge um boss.

## Tecnologias usadas

- JavaScript
- Phaser 3
- Vite
- HTML/CSS
- Arcade Physics
- Web Audio(osciladores)

## Como executar o projeto

Instalar as dependencias:

```bash
npm install
```

Executar em modo desenvolvimento:

```bash
npm run dev
```

Gerar a versao final:

```bash
npm run build
```

Previsualizar a build:

```bash
npm run preview
```

## Controlos

- W: mover para cima
- A: mover para a esquerda
- S: mover para baixo
- D: mover para a direita

O ataque do jogador e automatico.

## Objetivo do jogo

O objetivo e sobreviver as ondas de inimigos, recolher cristais de XP, subir de nivel e derrotar o boss final.

O jogador perde vida quando entra em contacto com inimigos. Quando a vida chega a zero, o jogo muda para a cena de Game Over. Quando o boss final e derrotado, o jogo muda para a cena de vitoria.

## Funcionalidades implementadas

- Menu principal
- Menu de opcoes
- Suporte multilingue
- Movimento do jogador com WASD
- Camera a seguir o jogador
- Mapa grande com textura repetida
- Inimigos que perseguem o jogador
- Sistema de vida
- Invencibilidade temporaria depois de sofrer dano
- Ataque automatico com espada
- Dano em area no ataque da espada
- Drops de cristais de XP
- Sistema de XP e subida de nivel
- Barra de vida
- Barra de XP
- Sistema de ondas
- Boss final
- Barra de vida do boss
- Cena de Game Over
- Cena de vitoria
- Musica gerada por codigo no menu e durante o jogo

## Estrutura do projeto

```txt
src/
  main.js
  i18n.js
  style.css

  scenes/
    PreloadScene.js
    MenuScene.js
    GameScene.js
    GameOverScene.js
    VictoryScene.js

  systems/
    AudioSystem.js
    BossSystem.js
    CombatSystem.js
    EnemySystem.js
    HUDSystem.js
    WaveSystem.js
    XPSystem.js

  data/
    gameConfig.js
    lootTable.js
    waves.js
    weapons.js
```

## Cenas do jogo

### PreloadScene

Carrega os assets do jogo, como imagens, sprites, cristais e ficheiros de traducao.

### MenuScene

Mostra o menu principal e as opcoes de idioma.

### GameScene

Cena principal do jogo. Cria o mapa, o jogador, a camera, os sistemas principais e controla o ciclo de jogo.

### GameOverScene

Cena apresentada quando o jogador perde toda a vida.

### VictoryScene

Cena apresentada quando o boss final e derrotado.

## Sistemas principais

### EnemySystem

Responsavel por criar inimigos, controlar o spawn e fazer os inimigos perseguirem o jogador.

### CombatSystem

Responsavel pelo ataque automatico do jogador e pelo dano em area da espada.

### XPSystem

Responsavel pelos cristais de XP, drops e recolha pelo jogador.

### HUDSystem

Responsavel pela interface do jogo, como barra de vida, barra de XP, informacao das ondas e barra do boss.

### WaveSystem

Responsavel pelo controlo das ondas e pela transicao para o boss final.

### BossSystem

Responsavel por criar o boss, controlar o movimento, a vida, o dano e a vitoria.

### AudioSystem

Responsavel pela musica do menu e pela musica durante o jogo. O som e gerado por codigo usando Web Audio API.

## Assets usados

Os assets estao dentro da pasta:

```txt
public/assets/
```

Exemplos de assets usados:

- Imagem de fundo do menu
- Logotipo do jogo
- Textura do chao
- Sprite do jogador
- Sprite do inimigo
- Cristais de XP
- Fonte pixel art
- Ficheiros JSON de traducao

## Suporte multilingue

O jogo suporta:

- Portugues
- Ingles
- Frances

As traducoes estao organizadas em ficheiros JSON:

```txt
public/assets/locales/pt.json
public/assets/locales/en.json
public/assets/locales/fr.json
```

Os textos do jogo sao obtidos atraves da funcao `t()`, evitando strings fixas espalhadas pelo codigo.

## Fisica e colisoes

O jogo usa Arcade Physics do Phaser.

Como e um jogo top-down, a gravidade esta desativada:

```js
gravity: { y: 0 }
```

As colisoes principais usam `overlap`, por exemplo:

- Jogador com inimigos
- Jogador com cristais de XP
- Jogador com boss

## Versao do Phaser

O projeto usa Phaser:

```txt
^3.80.0
```

## Autor

Projeto desenvolvido para a unidade curricular de Tecnologias Multimidia.
