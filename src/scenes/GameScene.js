import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('chao', 'assets/images/chao.png');
        this.load.image('jogador', 'assets/images/jogador.png');
        this.load.image('inimigo', 'assets/images/inimigo.png');
    }

    create() {
        this.mapaLargura = 15000;
        this.mapaAltura = 15000;
        this.chao = this.add.tileSprite(0, 0, this.mapaLargura, this.mapaAltura, 'chao').setOrigin(0, 0);
        this.physics.world.setBounds(0, 0, this.mapaLargura, this.mapaAltura);

        this.player = this.physics.add.sprite(this.mapaLargura / 2, this.mapaAltura / 2, 'jogador');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(2);
        this.player.setBodySize(22, 28);
        this.player.setOffset(21, 18);

        this.cameras.main.setBounds(0, 0, this.mapaLargura, this.mapaAltura);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(0.8);

        this.teclas = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.velocidade = 200;

        this.vidaMaxima = 100;
        this.vida = this.vidaMaxima;
        this.isInvencivel = false;
        this.nivel = 1;
        this.xpAtual = 0;
        this.xpNecessario = 100;

        this.inimigos = this.physics.add.group();
        this.time.addEvent({
            delay: 1000,
            callback: this.gerarInimigo,
            callbackScope: this,
            loop: true
        });

        this.armaEquipada = this.criarArmaInicial();

        this.time.addEvent({
            delay: this.armaEquipada.cooldown,
            callback: this.atacarAutomaticamente,
            callbackScope: this,
            loop: true
        });

        this.criarTexturasCristais();
        this.cristaisXp = this.physics.add.group();

        this.physics.add.overlap(this.player, this.inimigos, this.levarDano, null, this);
        this.physics.add.overlap(this.player, this.cristaisXp, this.recolherCristal, null, this);

        this.criarBarraDeVida();
        this.criarBarraXP();
    }

    update() {
        this.moverJogador();
        this.moverInimigos();
    }

    moverJogador() {
        this.player.setVelocity(0);

        if (this.teclas.up.isDown) {
            this.player.setVelocityY(-this.velocidade);
        } else if (this.teclas.down.isDown) {
            this.player.setVelocityY(this.velocidade);
        }

        if (this.teclas.left.isDown) {
            this.player.setVelocityX(-this.velocidade);
            this.player.setFlipX(true);
        } else if (this.teclas.right.isDown) {
            this.player.setVelocityX(this.velocidade);
            this.player.setFlipX(false);
        }

        this.player.body.velocity.normalize().scale(this.velocidade);
    }

    moverInimigos() {
        this.inimigos.getChildren().forEach((esqueleto) => {
            if (!esqueleto.active) return;

            this.physics.moveToObject(esqueleto, this.player, 120);

            if (esqueleto.body.velocity.x > 0) {
                esqueleto.setFlipX(false);
            } else if (esqueleto.body.velocity.x < 0) {
                esqueleto.setFlipX(true);
            }
        });
    }

    gerarInimigo() {
        const distanciaMinima = 650;
        const distanciaExtra = Phaser.Math.Between(0, 300);
        const angulo = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distancia = distanciaMinima + distanciaExtra;
        const xAleatorio = Phaser.Math.Clamp(
            this.player.x + Math.cos(angulo) * distancia,
            40,
            this.mapaLargura - 40
        );
        const yAleatorio = Phaser.Math.Clamp(
            this.player.y + Math.sin(angulo) * distancia,
            40,
            this.mapaAltura - 40
        );

        const novoEsqueleto = this.inimigos.create(xAleatorio, yAleatorio, 'inimigo');
        novoEsqueleto.setScale(2);
        novoEsqueleto.setBodySize(18, 26);
        novoEsqueleto.setOffset(23, 20);
        novoEsqueleto.setData('vida', 1);
    }

    criarArmaInicial() {
        return {
            nome: 'Espada',
            tipo: 'corpo-a-corpo',
            dano: 1,
            alcance: 150,
            cooldown: 500
        };
    }

    atacarAutomaticamente() {
        if (!this.armaEquipada) return;

        const alvo = this.encontrarInimigoMaisProximo(this.armaEquipada.alcance);
        if (!alvo) return;

        if (this.armaEquipada.tipo === 'corpo-a-corpo') {
            this.atacarComEspada(alvo);
        }
    }

    encontrarInimigoMaisProximo(alcance) {
        let alvoMaisProximo = null;
        let menorDistancia = alcance;

        this.inimigos.getChildren().forEach((esqueleto) => {
            if (!esqueleto.active) return;

            const distancia = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                esqueleto.x,
                esqueleto.y
            );

            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                alvoMaisProximo = esqueleto;
            }
        });

        return alvoMaisProximo;
    }

    atacarComEspada(alvo) {
        this.mostrarGolpeDaEspada(alvo);

        const vidaAtual = alvo.getData('vida') ?? 1;
        const novaVida = vidaAtual - this.armaEquipada.dano;

        if (novaVida <= 0) {
            this.droparCristal(alvo.x, alvo.y);
            alvo.destroy();
        } else {
            alvo.setData('vida', novaVida);
        }
    }

    mostrarGolpeDaEspada(alvo) {
        const angulo = Phaser.Math.Angle.Between(this.player.x, this.player.y, alvo.x, alvo.y);
        const distancia = 62;
        const x = this.player.x + Math.cos(angulo) * distancia;
        const y = this.player.y + Math.sin(angulo) * distancia;

        const golpe = this.add.arc(x, y, 42, Phaser.Math.RadToDeg(angulo) - 55, Phaser.Math.RadToDeg(angulo) + 55, false);
        golpe.setStrokeStyle(5, 0xf2d48b, 0.9);
        golpe.setDepth(10);

        this.tweens.add({
            targets: golpe,
            alpha: 0,
            scale: 1.35,
            duration: 140,
            onComplete: () => golpe.destroy()
        });
    }

    criarTexturasCristais() {
        const cristais = [
            { chave: 'cristalVerde', cor: 0x00ff00 },
            { chave: 'cristalAzul', cor: 0x0000ff },
            { chave: 'cristalDourado', cor: 0xffd700 }
        ];

        cristais.forEach((cristal) => {
            if (this.textures.exists(cristal.chave)) return;

            const graphics = this.add.graphics();
            graphics.fillStyle(cristal.cor, 1);
            graphics.fillCircle(8, 8, 8);
            graphics.lineStyle(2, 0xffffff, 0.8);
            graphics.strokeCircle(8, 8, 8);
            graphics.generateTexture(cristal.chave, 16, 16);
            graphics.destroy();
        });
    }

    droparCristal(x, y) {
        const sorteio = Phaser.Math.Between(1, 100);
        let tipoCristal = {
            textura: 'cristalVerde',
            xp: 10
        };

        if (sorteio > 95) {
            tipoCristal = {
                textura: 'cristalDourado',
                xp: 100
            };
        } else if (sorteio > 75) {
            tipoCristal = {
                textura: 'cristalAzul',
                xp: 30
            };
        }

        const cristal = this.cristaisXp.create(x, y, tipoCristal.textura);
        cristal.setData('xp', tipoCristal.xp);
        cristal.setScale(0.4);
        cristal.setDepth(5);
        cristal.body.setAllowGravity(false);
    }

    recolherCristal(jogador, cristal) {
        const xpGanho = cristal.getData('xp') ?? 0;
        cristal.destroy();

        this.ganharXP(xpGanho);
    }

    ganharXP(quantidade) {
        this.xpAtual += quantidade;

        if (this.xpAtual >= this.xpNecessario) {
            this.subirNivel();
        }

        this.atualizarBarraXP();
    }

    subirNivel() {
        this.nivel += 1;
        this.xpAtual = 0;
        this.xpNecessario = Math.floor(this.xpNecessario * 1.5);
    }

    levarDano(jogador) {
        if (this.isInvencivel) return;

        this.vida = Math.max(0, this.vida - 10);
        this.atualizarBarraDeVida();

        this.isInvencivel = true;
        jogador.setTint(0xff0000);

        if (this.vida <= 0) {
            this.scene.start('GameOverScene');
            return;
        }

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                jogador.clearTint();
                this.isInvencivel = false;
            },
            callbackScope: this
        });
    }

    criarBarraDeVida() {
        this.barraVidaFundo = this.add.graphics().setScrollFactor(0).setDepth(1000);
        this.barraVidaPreenchimento = this.add.graphics().setScrollFactor(0).setDepth(1001);
        this.textoVida = this.add.text(42, 28, '', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setScrollFactor(0).setDepth(1002);

        this.barraVidaFundo.fillStyle(0x160909, 0.9);
        this.barraVidaFundo.fillRoundedRect(28, 22, 264, 34, 6);
        this.barraVidaFundo.lineStyle(3, 0x6b1a1a, 1);
        this.barraVidaFundo.strokeRoundedRect(28, 22, 264, 34, 6);

        this.atualizarBarraDeVida();
    }

    atualizarBarraDeVida() {
        const larguraMaxima = 248;
        const percentagem = Phaser.Math.Clamp(this.vida / this.vidaMaxima, 0, 1);

        this.barraVidaPreenchimento.clear();
        this.barraVidaPreenchimento.fillStyle(0x331111, 1);
        this.barraVidaPreenchimento.fillRoundedRect(36, 30, larguraMaxima, 18, 4);

        const cor = percentagem > 0.5 ? 0x2ecc71 : percentagem > 0.25 ? 0xf1c40f : 0xe74c3c;
        this.barraVidaPreenchimento.fillStyle(cor, 1);
        this.barraVidaPreenchimento.fillRoundedRect(36, 30, larguraMaxima * percentagem, 18, 4);

        this.textoVida.setText(`VIDA ${this.vida}/${this.vidaMaxima}`);
    }

    criarBarraXP() {
        this.barraXPFundo = this.add.graphics().setScrollFactor(0).setDepth(1000);
        this.barraXPPreenchimento = this.add.graphics().setScrollFactor(0).setDepth(1001);
        this.textoXP = this.add.text(this.scale.width / 2, 30, '', {
            fontSize: '18px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

        this.atualizarBarraXP();

        this.scale.on('resize', () => {
            this.atualizarBarraXP();
        });
    }

    atualizarBarraXP() {
        const larguraBarra = Math.min(520, this.scale.width - 360);
        const alturaBarra = 18;
        const xBarra = (this.scale.width - larguraBarra) / 2;
        const yBarra = 22;
        const percentagem = Phaser.Math.Clamp(this.xpAtual / this.xpNecessario, 0, 1);

        this.textoXP.setPosition(this.scale.width / 2, 30);

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

        this.textoXP.setText(`NIVEL ${this.nivel}  XP ${this.xpAtual}/${this.xpNecessario}`);
    }
}
