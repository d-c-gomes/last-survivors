import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // Vai buscar o tamanho exato da janela do teu browser
        let largura = this.scale.width;
        let altura = this.scale.height;

        // 1. O Fundo (agora é esticado para caber perfeitamente na janela sem cortes)
        let bg = this.add.image(largura / 2, altura / 2, 'fundoMenu');
        bg.setDisplaySize(largura, altura);

        // 2. O Logo (centrado e MAIS PEQUENO)
        // Coloquei a 35% da altura do ecrã para ficar bem arrumado em cima
        let logo = this.add.image(largura / 2, altura * 0.35, 'logo');
        logo.setScale(0.7); // <- AQUI resolves o problema! Muda para 0.3 ou 0.5 até ficar ao teu gosto.

        // 3. O Botão Jogar (colocado a 75% da altura)
        let botaoJogar = this.add.text(largura / 2, altura * 0.75, 'JOGAR', {
            fontSize: '50px',
            fontFamily: 'PixelGame, Arial, sans-serif',
            fill: '#ffffff',
            fontStyle: 'bold',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive();

        botaoJogar.setShadow(3, 3, 'rgba(255,0,0,0.8)', 5);

        // Efeitos do botão
        botaoJogar.on('pointerover', () => {
            botaoJogar.setStyle({ fill: '#ff0000' });
            this.input.setDefaultCursor('pointer');
        });

        botaoJogar.on('pointerout', () => {
            botaoJogar.setStyle({ fill: '#ffffff' });
            this.input.setDefaultCursor('default');
        });
        botaoJogar.on('pointerdown', () => {
            this.input.setDefaultCursor('default');
            this.scene.start('GameScene');
        });
        
        // BÓNUS PRO: Se redimensionares a janela com o jogo aberto, ele ajusta tudo sozinho!
        this.scale.on('resize', (gameSize) => {
            bg.setPosition(gameSize.width / 2, gameSize.height / 2);
            bg.setDisplaySize(gameSize.width, gameSize.height);
            logo.setPosition(gameSize.width / 2, gameSize.height * 0.35);
            botaoJogar.setPosition(gameSize.width / 2, gameSize.height * 0.75);
        });
    }
}
