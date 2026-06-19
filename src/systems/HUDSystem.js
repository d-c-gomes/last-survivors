import { t } from '../i18n.js';
import { UI } from '../data/gameConfig.js';

export class HUDSystem {
    constructor(scene) {
        this.scene = scene;

        this.criarBarraDeVida();
        this.criarBarraXP();

        this.scene.scale.on('resize', () => {
            this.atualizarBarraXP();
        });
    }

    criarBarraDeVida() {
        this.barraVidaFundo = this.scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(UI.profundidadeFundo);

        this.barraVidaPreenchimento = this.scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(UI.profundidadeBarra);

        this.textoVida = this.scene.add.text(42, 28, '', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setScrollFactor(0).setDepth(UI.profundidadeTexto);

        this.barraVidaFundo.fillStyle(0x160909, 0.9);
        this.barraVidaFundo.fillRoundedRect(28, 22, 264, 34, 6);
        this.barraVidaFundo.lineStyle(3, 0x6b1a1a, 1);
        this.barraVidaFundo.strokeRoundedRect(28, 22, 264, 34, 6);

        this.atualizarBarraDeVida();
    }

    atualizarBarraDeVida() {
        const larguraMaxima = 248;
        const percentagem = Phaser.Math.Clamp(
            this.scene.vida / this.scene.vidaMaxima,
            0,
            1
        );

        this.barraVidaPreenchimento.clear();
        this.barraVidaPreenchimento.fillStyle(0x331111, 1);
        this.barraVidaPreenchimento.fillRoundedRect(36, 30, larguraMaxima, 18, 4);

        const cor = percentagem > 0.5
            ? 0x2ecc71
            : percentagem > 0.25
                ? 0xf1c40f
                : 0xe74c3c;

        this.barraVidaPreenchimento.fillStyle(cor, 1);
        this.barraVidaPreenchimento.fillRoundedRect(
            36,
            30,
            larguraMaxima * percentagem,
            18,
            4
        );

        this.textoVida.setText(t(this.scene, 'game.hp', {
            current: this.scene.vida,
            max: this.scene.vidaMaxima
        }));
    }

    criarBarraXP() {
        this.barraXPFundo = this.scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(UI.profundidadeFundo);

        this.barraXPPreenchimento = this.scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(UI.profundidadeBarra);

        this.textoXP = this.scene.add.text(this.scene.scale.width / 2, 30, '', {
            fontSize: '18px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(UI.profundidadeTexto);

        this.atualizarBarraXP();
    }

    atualizarBarraXP() {
        const larguraBarra = Math.min(520, this.scene.scale.width - 360);
        const alturaBarra = 18;
        const xBarra = (this.scene.scale.width - larguraBarra) / 2;
        const yBarra = 22;

        const percentagem = Phaser.Math.Clamp(
            this.scene.xpAtual / this.scene.xpNecessario,
            0,
            1
        );

        this.textoXP.setPosition(this.scene.scale.width / 2, 30);

        this.barraXPFundo.clear();
        this.barraXPFundo.fillStyle(0x333333, 0.9);
        this.barraXPFundo.fillRoundedRect(xBarra, yBarra, larguraBarra, alturaBarra, 4);
        this.barraXPFundo.lineStyle(2, 0xffffff, 0.7);
        this.barraXPFundo.strokeRoundedRect(xBarra, yBarra, larguraBarra, alturaBarra, 4);

        this.barraXPPreenchimento.clear();
        this.barraXPPreenchimento.fillStyle(0x99ff33, 1);
        this.barraXPPreenchimento.fillRoundedRect(
            xBarra,
            yBarra,
            larguraBarra * percentagem,
            alturaBarra,
            4
        );

        this.textoXP.setText(t(this.scene, 'game.xp', {
            level: this.scene.nivel,
            current: this.scene.xpAtual,
            needed: this.scene.xpNecessario
        }));
    }

    criarBarraBoss(vidaMaxima) {
    this.vidaMaximaBoss = vidaMaxima;

    const largura = 360;
    const altura = 24;
    const x = (this.scene.scale.width - largura) / 2;
    const y = this.scene.scale.height - 60;

    this.barraBossFundo = this.scene.add.graphics()
        .setScrollFactor(0)
        .setDepth(UI.profundidadeFundo);

    this.barraBossPreenchimento = this.scene.add.graphics()
        .setScrollFactor(0)
        .setDepth(UI.profundidadeBarra);

    this.textoBoss = this.scene.add.text(this.scene.scale.width / 2, y - 26, 'BOSS', {
        fontSize: '22px',
        fill: '#ff4444',
        fontStyle: 'bold',
        fontFamily: 'PixelGame, Arial, sans-serif'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(UI.profundidadeTexto);

    this.barraBossFundo.fillStyle(0x1a0000, 0.95);
    this.barraBossFundo.fillRoundedRect(x - 5, y - 5, largura + 10, altura + 10, 6);
    this.barraBossFundo.lineStyle(3, 0xff2222, 1);
    this.barraBossFundo.strokeRoundedRect(x - 5, y - 5, largura + 10, altura + 10, 6);

    this.atualizarBarraBoss(vidaMaxima);
}

atualizarBarraBoss(vidaAtual) {
    if (!this.barraBossPreenchimento || !this.vidaMaximaBoss) return;

    const largura = 360;
    const altura = 24;
    const x = (this.scene.scale.width - largura) / 2;
    const y = this.scene.scale.height - 60;
    const percentagem = Phaser.Math.Clamp(vidaAtual / this.vidaMaximaBoss, 0, 1);

    this.barraBossPreenchimento.clear();

    this.barraBossPreenchimento.fillStyle(0x440000, 1);
    this.barraBossPreenchimento.fillRoundedRect(x, y, largura, altura, 4);

    this.barraBossPreenchimento.fillStyle(0xff2222, 1);
    this.barraBossPreenchimento.fillRoundedRect(x, y, largura * percentagem, altura, 4);
}

removerBarraBoss() {
    this.barraBossFundo?.destroy();
    this.barraBossPreenchimento?.destroy();
    this.textoBoss?.destroy();

    this.barraBossFundo = null;
    this.barraBossPreenchimento = null;
    this.textoBoss = null;
    this.vidaMaximaBoss = null;
}
}