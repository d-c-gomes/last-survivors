import Phaser from 'phaser';
import { t } from '../i18n.js';

export class VictoryScene extends Phaser.Scene {
    constructor() {
        super('VictoryScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#061400');

        const meioX = this.scale.width / 2;
        const meioY = this.scale.height / 2;

        this.add.text(meioX, meioY - 100, t(this, 'victory.title'), {
            fontSize: '64px',
            fill: '#55ff55',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5);

        const btnJogar = this.add.text(meioX, meioY + 40, t(this, 'victory.retry'), {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnJogar.on('pointerover', () => btnJogar.setStyle({ fill: '#55ff55' }));
        btnJogar.on('pointerout', () => btnJogar.setStyle({ fill: '#ffffff' }));
        btnJogar.on('pointerdown', () => this.scene.start('GameScene'));

        const btnMenu = this.add.text(meioX, meioY + 110, t(this, 'victory.menu'), {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnMenu.on('pointerover', () => btnMenu.setStyle({ fill: '#55ff55' }));
        btnMenu.on('pointerout', () => btnMenu.setStyle({ fill: '#ffffff' }));
        btnMenu.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}