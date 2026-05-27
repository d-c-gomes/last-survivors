import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        // Um fundo vermelho muito escuro para manter a estética do inferno/masmorra
        this.cameras.main.setBackgroundColor('#140000');

        const meioX = this.scale.width / 2;
        const meioY = this.scale.height / 2;

        // Título Gigante
        this.add.text(meioX, meioY - 100, 'VOCÊ MORREU', {
            fontSize: '64px',
            fill: '#ff0000', // Vermelho sangue
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5);

        // --- BOTÃO: TENTAR DE NOVO ---
        const btnTentar = this.add.text(meioX, meioY + 50, 'TENTAR DE NOVO', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }); // O cursor muda para a "mãozinha"

        // Efeitos de Hover (Muda para vermelho quando passas o rato)
        btnTentar.on('pointerover', () => btnTentar.setStyle({ fill: '#ff4444' }));
        btnTentar.on('pointerout', () => btnTentar.setStyle({ fill: '#ffffff' }));
        // Ação ao clicar
        btnTentar.on('pointerdown', () => this.scene.start('GameScene'));

        // --- BOTÃO: VOLTAR AO MENU ---
        const btnMenu = this.add.text(meioX, meioY + 130, 'VOLTAR AO MENU', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Efeitos de Hover
        btnMenu.on('pointerover', () => btnMenu.setStyle({ fill: '#ff4444' }));
        btnMenu.on('pointerout', () => btnMenu.setStyle({ fill: '#ffffff' }));
        // Ação ao clicar
        btnMenu.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}
