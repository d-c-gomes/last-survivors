import Phaser from 'phaser';
import { initLanguage } from '../i18n.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.image('fundoMenu', 'assets/images/menu-bg.png'); // O teu fundo
        this.load.image('logo', 'assets/images/logo.png');         // O teu logo separado
        this.load.image('cristalVerde', 'assets/images/xp_verde.png');// Cristais
        this.load.image('cristalAzul', 'assets/images/xp_azul.png');
        this.load.image('cristalDourado', 'assets/images/xp_dourado.png');
        this.load.json('lang-pt', 'assets/locales/pt.json'); // linguagens
        this.load.json('lang-en', 'assets/locales/en.json');
    }

    create() {
        initLanguage(this);
        this.scene.start('MenuScene');
    }
}