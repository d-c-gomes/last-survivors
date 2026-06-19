import Phaser from 'phaser';
import { initLanguage } from '../i18n.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.image('fundoMenu', 'assets/images/menu-bg.png');
        this.load.image('logo', 'assets/images/logo.png');

        this.load.image('chao', 'assets/images/chao.png');
        this.load.image('jogador', 'assets/images/jogador.png');
        this.load.image('inimigo', 'assets/images/inimigo.png');

        this.load.image('cristalVerde', 'assets/images/xp_verde.png');
        this.load.image('cristalAzul', 'assets/images/xp_azul.png');
        this.load.image('cristalDourado', 'assets/images/xp_dourado.png');

        this.load.json('lang-pt', 'assets/locales/pt.json');
        this.load.json('lang-en', 'assets/locales/en.json');
        this.load.json('lang-fr', 'assets/locales/fr.json');
    }

    create() {
        initLanguage(this);
        this.scene.start('MenuScene');
    }
}