import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game-container',
        width: '100%',
        height: '100%'
    },
    // ISTO É MAGIA: Desliga o desfoque e deixa a pixel art nítida!
    pixelArt: true, 

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, 
            debug: false
        }
    },
    scene: [PreloadScene, MenuScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);