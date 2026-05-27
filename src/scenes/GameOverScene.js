import Phaser from 'phaser';
import { t } from '../i18n.js';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#140000');

        const meioX = this.scale.width / 2;
        const meioY = this.scale.height / 2;

        this.add.text(meioX, meioY - 100, t(this, 'gameOver.title'), {
            fontSize: '64px',
            fill: '#ff0000',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5);

        const btnTentar = this.add.text(meioX, meioY + 50, t(this, 'gameOver.retry'), {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnTentar.on('pointerover', () => btnTentar.setStyle({ fill: '#ff4444' }));
        btnTentar.on('pointerout', () => btnTentar.setStyle({ fill: '#ffffff' }));
        btnTentar.on('pointerdown', () => this.scene.start('GameScene'));

        const btnMenu = this.add.text(meioX, meioY + 130, t(this, 'gameOver.menu'), {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnMenu.on('pointerover', () => btnMenu.setStyle({ fill: '#ff4444' }));
        btnMenu.on('pointerout', () => btnMenu.setStyle({ fill: '#ffffff' }));
        btnMenu.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}
