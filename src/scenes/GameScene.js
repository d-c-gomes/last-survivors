import Phaser from 'phaser';
import { t } from '../i18n.js';

// =============================================================
// CONFIGURAÇÃO DAS ONDAS — edita aqui para ajustar a dificuldade
// =============================================================
const ONDAS = [
    { duracao: 60,  spawnDelay: 2000, vidaInimigo: 1, velocidade: 80  }, // Onda 1: 60s, 1 inimigo/2s
    { duracao: 90,  spawnDelay: 1200, vidaInimigo: 2, velocidade: 100 }, // Onda 2: 90s, 1 inimigo/1.2s
    { duracao: 120, spawnDelay: 800,  vidaInimigo: 3, velocidade: 120 }, // Onda 3: 120s, 1 inimigo/0.8s
];

const BOSS = {
    vida: 20,
    velocidade: 60,
    escala: 4,
    dano: 10,
};

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('chao',    'assets/images/chao.png');
        this.load.image('jogador', 'assets/images/jogador.png');
        this.load.image('inimigo', 'assets/images/inimigo.png');
    }

    create() {
        // --- Mapa ---
        this.mapaLargura = 15000;
        this.mapaAltura  = 15000;
        this.add.tileSprite(0, 0, this.mapaLargura, this.mapaAltura, 'chao').setOrigin(0, 0);
        this.physics.world.setBounds(0, 0, this.mapaLargura, this.mapaAltura);

        // --- Jogador ---
        this.player = this.physics.add.sprite(this.mapaLargura / 2, this.mapaAltura / 2, 'jogador');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(2);
        this.player.setBodySize(22, 28);
        this.player.setOffset(21, 18);

        // --- Câmara ---
        this.cameras.main.setBounds(0, 0, this.mapaLargura, this.mapaAltura);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(0.8);

        // --- Teclas ---
        this.teclas = this.input.keyboard.addKeys({
            up:    Phaser.Input.Keyboard.KeyCodes.W,
            down:  Phaser.Input.Keyboard.KeyCodes.S,
            left:  Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.velocidade = 200;

        // --- Stats do jogador ---
        this.vidaMaxima  = 100;
        this.vida        = this.vidaMaxima;
        this.isInvencivel = false;
        this.nivel       = 1;
        this.xpAtual     = 0;
        this.xpNecessario = 100;

        // --- Arma ---
        this.armaEquipada = { nome: 'Espada', tipo: 'corpo-a-corpo', dano: 1, alcance: 150, cooldown: 500 };
        this.time.addEvent({
            delay: this.armaEquipada.cooldown,
            callback: this.atacarAutomaticamente,
            callbackScope: this,
            loop: true
        });

        // --- Grupos de física ---
        this.inimigos   = this.physics.add.group();
        this.cristaisXp = this.physics.add.group();
        this.criarTexturasCristais();

        // --- Colisões ---
        this.physics.add.overlap(this.player, this.inimigos,   this.levarDano,      null, this);
        this.physics.add.overlap(this.player, this.cristaisXp, this.recolherCristal, null, this);

        // --- HUD ---
        this.criarBarraDeVida();
        this.criarBarraXP();
        this.criarHUDOnda();

        // --- Sistema de ondas ---
        this.ondaAtual    = 0;   // índice da onda (0, 1, 2)
        this.faseAtual    = 'onda'; // 'onda' | 'intervalo' | 'boss'
        this.boss         = null;
        this.iniciarOnda(this.ondaAtual);
    }

    update() {
        this.moverJogador();
        this.moverInimigos();
        this.verificarFimDeOnda();
    }

    // =============================================================
    // SISTEMA DE ONDAS
    // =============================================================

    iniciarOnda(indice) {
        this.faseAtual         = 'onda';
        this.tempoRestanteOnda = ONDAS[indice].duracao;
        this.timerSpawn        = null; // null = spawn parado
        this.atualizarHUDOnda();

        // Conta o tempo restante (1 tick por segundo)
        this.timerOnda = this.time.addEvent({
            delay: 1000,
            repeat: ONDAS[indice].duracao - 1,
            callback: () => {
                this.tempoRestanteOnda--;
                this.atualizarHUDOnda();

                // Quando o tempo chega a 0, para o spawn e elimina os inimigos restantes
                if (this.tempoRestanteOnda <= 0) {
                    this.timerSpawn.remove();
                    this.timerSpawn = null;

                    // Usa delayedCall(0) para garantir que o Phaser terminou
                    // de processar colisões deste frame antes de destruir tudo
                    this.time.delayedCall(0, () => {
                        // slice() cria uma cópia do array para evitar problemas
                        // ao modificar o grupo enquanto o percorremos
                        [...this.inimigos.getChildren()].forEach((inimigo) => {
                            if (!inimigo.active) return;
                            this.droparCristal(inimigo.x, inimigo.y);
                            inimigo.destroy();
                        });
                    });
                }
            }
        });

        // Spawn de inimigos
        this.timerSpawn = this.time.addEvent({
            delay: ONDAS[indice].spawnDelay,
            callback: this.gerarInimigo,
            callbackScope: this,
            loop: true
        });
    }

    verificarFimDeOnda() {
        // Só verifica quando estamos numa onda, o spawn já parou, e não há inimigos vivos
        if (this.faseAtual !== 'onda') return;
        if (this.timerSpawn !== null) return;   // spawn ainda ativo
        if (this.inimigos.countActive() > 0) return;

        // Muda a fase imediatamente para não entrar aqui de novo no próximo frame
        this.faseAtual = 'intervalo';
        const proximaOnda = this.ondaAtual + 1;

        if (proximaOnda < ONDAS.length) {
            this.mostrarIntervalo(proximaOnda);
        } else {
            this.mostrarIntervalo(null);
        }
    }

    mostrarIntervalo(proximaOnda) {
        this.faseAtual = 'intervalo';

        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        const mensagem = proximaOnda !== null
            ? t(this, 'game.waveIncoming', { number: proximaOnda + 1 })
            : t(this, 'game.bossIncoming');

        const texto = this.add.text(cx, cy, mensagem, {
            fontSize: '48px',
            fill: proximaOnda !== null ? '#ffffff' : '#ff4444',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);

        // Após 3 segundos inicia a próxima fase
        this.time.delayedCall(3000, () => {
            texto.destroy();
            if (proximaOnda !== null) {
                this.ondaAtual = proximaOnda;
                this.iniciarOnda(this.ondaAtual);
            } else {
                this.iniciarBoss();
            }
        });
    }

    // =============================================================
    // BOSS
    // =============================================================

    iniciarBoss() {
        this.faseAtual = 'boss';
        this.atualizarHUDOnda();

        // Cria o boss à frente do jogador
        const x = Phaser.Math.Clamp(this.player.x + 600, 100, this.mapaLargura - 100);
        const y = this.player.y;

        this.boss = this.physics.add.sprite(x, y, 'inimigo');
        this.boss.setScale(BOSS.escala);
        this.boss.setTint(0xff2222);
        this.boss.setData('vida', BOSS.vida);
        this.boss.setDepth(5);

        // Barra de vida do boss
        this.criarBarraBoss();

        // Colisão do boss com o jogador (dano diferente dos inimigos normais)
        this.physics.add.overlap(this.player, this.boss, this.levarDanoBoss, null, this);
    }

    moverBoss() {
        if (!this.boss || !this.boss.active) return;
        this.physics.moveToObject(this.boss, this.player, BOSS.velocidade);
        this.boss.setFlipX(this.boss.body.velocity.x < 0);
    }

    atacarBossComEspada() {
        if (!this.boss || !this.boss.active) return;

        const distancia = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.boss.x,   this.boss.y
        );

        if (distancia > this.armaEquipada.alcance * 2) return; // alcance maior para o boss

        this.mostrarGolpeDaEspada(this.boss);

        const vidaAtual = this.boss.getData('vida');
        const novaVida  = vidaAtual - this.armaEquipada.dano;
        this.boss.setData('vida', novaVida);
        this.atualizarBarraBoss(novaVida);

        if (novaVida <= 0) {
            this.boss.destroy();
            this.boss = null;
            this.barraVidaBossContainer?.destroy();
            this.scene.start('VictoryScene');
        }
    }

    levarDanoBoss(jogador) {
        if (this.isInvencivel) return;

        this.vida = Math.max(0, this.vida - BOSS.dano);
        this.atualizarBarraDeVida();
        this.isInvencivel = true;
        jogador.setTint(0xff0000);

        if (this.vida <= 0) {
            this.scene.start('GameOverScene');
            return;
        }

        this.time.delayedCall(1000, () => {
            jogador.clearTint();
            this.isInvencivel = false;
        });
    }

    criarBarraBoss() {
        const largura = 300;
        const x = this.scale.width / 2 - largura / 2;
        const y = this.scale.height - 60;

        this.barraVidaBossContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);

        const fundo = this.add.graphics();
        fundo.fillStyle(0x1a0000, 0.9);
        fundo.fillRoundedRect(x - 5, y - 5, largura + 10, 34, 6);
        fundo.lineStyle(3, 0xff2222, 1);
        fundo.strokeRoundedRect(x - 5, y - 5, largura + 10, 34, 6);

        this.barraBossPreenchimento = this.add.graphics();
        this.barraBossPreenchimento.setScrollFactor(0).setDepth(2001);
        this.atualizarBarraBoss(BOSS.vida);

        const label = this.add.text(this.scale.width / 2, y - 24, '💀 ' + t(this, 'game.boss'), {
            fontSize: '20px',
            fill: '#ff4444',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2002);

        this.barraVidaBossContainer.add([fundo, label]);
    }

    atualizarBarraBoss(vidaAtual) {
        if (!this.barraBossPreenchimento) return;
        const largura = 300;
        const x = this.scale.width / 2 - largura / 2;
        const y = this.scale.height - 60;
        const pct = Phaser.Math.Clamp(vidaAtual / BOSS.vida, 0, 1);

        this.barraBossPreenchimento.clear();
        this.barraBossPreenchimento.fillStyle(0x550000, 1);
        this.barraBossPreenchimento.fillRoundedRect(x, y, largura, 24, 4);
        this.barraBossPreenchimento.fillStyle(0xff2222, 1);
        this.barraBossPreenchimento.fillRoundedRect(x, y, largura * pct, 24, 4);
    }

    // =============================================================
    // MOVIMENTOS
    // =============================================================

    moverJogador() {
        this.player.setVelocity(0);

        if (this.teclas.up.isDown)    this.player.setVelocityY(-this.velocidade);
        else if (this.teclas.down.isDown)  this.player.setVelocityY(this.velocidade);

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
        if (this.faseAtual === 'boss') {
            this.moverBoss();
            return;
        }

        this.inimigos.getChildren().forEach((inimigo) => {
            if (!inimigo.active) return;
            this.physics.moveToObject(inimigo, this.player, ONDAS[this.ondaAtual]?.velocidade ?? 120);
            inimigo.setFlipX(inimigo.body.velocity.x < 0);
        });
    }

    // =============================================================
    // INIMIGOS NORMAIS
    // =============================================================

    gerarInimigo() {
        const angulo    = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distancia = Phaser.Math.Between(650, 950);

        const x = Phaser.Math.Clamp(this.player.x + Math.cos(angulo) * distancia, 40, this.mapaLargura - 40);
        const y = Phaser.Math.Clamp(this.player.y + Math.sin(angulo) * distancia, 40, this.mapaAltura  - 40);

        const inimigo = this.inimigos.create(x, y, 'inimigo');
        inimigo.setScale(2);
        inimigo.setBodySize(18, 26);
        inimigo.setOffset(23, 20);
        inimigo.setData('vida', ONDAS[this.ondaAtual]?.vidaInimigo ?? 1);
    }

    // =============================================================
    // COMBATE
    // =============================================================

    atacarAutomaticamente() {
        if (!this.armaEquipada) return;

        if (this.faseAtual === 'boss') {
            this.atacarBossComEspada();
            return;
        }

        // Encontra o inimigo mais próximo para determinar a direção do golpe
        let maisProximo = null;
        let menorDistancia = this.armaEquipada.alcance;

        this.inimigos.getChildren().forEach((inimigo) => {
            if (!inimigo.active) return;
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, inimigo.x, inimigo.y);
            if (d < menorDistancia) { menorDistancia = d; maisProximo = inimigo; }
        });

        if (!maisProximo) return;

        // Ângulo do golpe — aponta ao inimigo mais próximo
        const anguloGolpe = Phaser.Math.Angle.Between(this.player.x, this.player.y, maisProximo.x, maisProximo.y);
        const metadeArco  = Phaser.Math.DegToRad(60); // arco de 120° total (60° para cada lado)

        this.mostrarGolpeDaEspada(maisProximo);

        // Atinge todos os inimigos dentro do alcance E dentro do arco do golpe
        this.inimigos.getChildren().forEach((inimigo) => {
            if (!inimigo.active) return;

            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, inimigo.x, inimigo.y);
            if (d > this.armaEquipada.alcance) return; // fora do alcance

            const anguloInimigo = Phaser.Math.Angle.Between(this.player.x, this.player.y, inimigo.x, inimigo.y);
            const diferenca = Phaser.Math.Angle.Wrap(anguloInimigo - anguloGolpe);

            // Só atinge se estiver dentro do arco (±60°)
            if (Math.abs(diferenca) <= metadeArco) {
                this.atacarComEspada(inimigo);
            }
        });
    }

    atacarComEspada(alvo) {
        const novaVida = (alvo.getData('vida') ?? 1) - this.armaEquipada.dano;

        if (novaVida <= 0) {
            this.droparCristal(alvo.x, alvo.y);
            alvo.destroy();
        } else {
            alvo.setData('vida', novaVida);
        }
    }

    mostrarGolpeDaEspada(alvo) {
        const angulo = Phaser.Math.Angle.Between(this.player.x, this.player.y, alvo.x, alvo.y);
        const x = this.player.x + Math.cos(angulo) * 62;
        const y = this.player.y + Math.sin(angulo) * 62;

        const golpe = this.add.arc(x, y, 42,
            Phaser.Math.RadToDeg(angulo) - 55,
            Phaser.Math.RadToDeg(angulo) + 55, false);
        golpe.setStrokeStyle(5, 0xf2d48b, 0.9).setDepth(10);

        this.tweens.add({ targets: golpe, alpha: 0, scale: 1.35, duration: 140, onComplete: () => golpe.destroy() });
    }

    levarDano(jogador) {
        if (this.isInvencivel) return;

        this.vida = Math.max(0, this.vida - 5); // 5 de dano por toque (era 10)
        this.atualizarBarraDeVida();
        this.isInvencivel = true;
        jogador.setTint(0xff0000);

        if (this.vida <= 0) { this.scene.start('GameOverScene'); return; }

        this.time.delayedCall(1500, () => { jogador.clearTint(); this.isInvencivel = false; }); // 1.5s de invencibilidade (era 1s)
    }

    // =============================================================
    // XP E CRISTAIS
    // =============================================================

    criarTexturasCristais() {
        [
            { chave: 'cristalVerde',   cor: 0x00ff00 },
            { chave: 'cristalAzul',    cor: 0x0000ff },
            { chave: 'cristalDourado', cor: 0xffd700 }
        ].forEach(({ chave, cor }) => {
            if (this.textures.exists(chave)) return;
            const g = this.add.graphics();
            g.fillStyle(cor, 1).fillCircle(8, 8, 8);
            g.lineStyle(2, 0xffffff, 0.8).strokeCircle(8, 8, 8);
            g.generateTexture(chave, 16, 16);
            g.destroy();
        });
    }

    droparCristal(x, y) {
        const sorteio = Phaser.Math.Between(1, 100);
        const tipo = sorteio > 95
            ? { textura: 'cristalDourado', xp: 100 }
            : sorteio > 75
                ? { textura: 'cristalAzul', xp: 30 }
                : { textura: 'cristalVerde', xp: 10 };

        const cristal = this.cristaisXp.create(x, y, tipo.textura);
        cristal.setData('xp', tipo.xp).setScale(0.4).setDepth(5);
        cristal.body.setAllowGravity(false);
    }

    recolherCristal(jogador, cristal) {
        const xp = cristal.getData('xp') ?? 0;
        cristal.destroy();
        this.ganharXP(xp);
    }

    ganharXP(quantidade) {
        this.xpAtual += quantidade;
        if (this.xpAtual >= this.xpNecessario) this.subirNivel();
        this.atualizarBarraXP();
    }

    subirNivel() {
        this.nivel++;
        this.xpAtual = 0;
        this.xpNecessario = Math.floor(this.xpNecessario * 1.5);
    }

    // =============================================================
    // HUD
    // =============================================================

    criarBarraDeVida() {
        this.barraVidaFundo          = this.add.graphics().setScrollFactor(0).setDepth(1000);
        this.barraVidaPreenchimento  = this.add.graphics().setScrollFactor(0).setDepth(1001);
        this.textoVida = this.add.text(42, 28, '', {
            fontSize: '20px', fill: '#ffffff', fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setScrollFactor(0).setDepth(1002);

        this.barraVidaFundo.fillStyle(0x160909, 0.9).fillRoundedRect(28, 22, 264, 34, 6);
        this.barraVidaFundo.lineStyle(3, 0x6b1a1a, 1).strokeRoundedRect(28, 22, 264, 34, 6);
        this.atualizarBarraDeVida();
    }

    atualizarBarraDeVida() {
        const pct = Phaser.Math.Clamp(this.vida / this.vidaMaxima, 0, 1);
        const cor = pct > 0.5 ? 0x2ecc71 : pct > 0.25 ? 0xf1c40f : 0xe74c3c;

        this.barraVidaPreenchimento.clear();
        this.barraVidaPreenchimento.fillStyle(0x331111, 1).fillRoundedRect(36, 30, 248, 18, 4);
        this.barraVidaPreenchimento.fillStyle(cor, 1).fillRoundedRect(36, 30, 248 * pct, 18, 4);
        this.textoVida.setText(t(this, 'game.hp', { current: this.vida, max: this.vidaMaxima }));
    }

    criarBarraXP() {
        this.barraXPFundo         = this.add.graphics().setScrollFactor(0).setDepth(1000);
        this.barraXPPreenchimento = this.add.graphics().setScrollFactor(0).setDepth(1001);
        this.textoXP = this.add.text(this.scale.width / 2, 30, '', {
            fontSize: '18px', fill: '#ffffff', fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

        this.atualizarBarraXP();
        this.scale.on('resize', () => this.atualizarBarraXP());
    }

    atualizarBarraXP() {
        const largura = Math.min(520, this.scale.width - 360);
        const x       = (this.scale.width - largura) / 2;
        const pct     = Phaser.Math.Clamp(this.xpAtual / this.xpNecessario, 0, 1);

        this.textoXP.setPosition(this.scale.width / 2, 30);
        this.barraXPFundo.clear()
            .fillStyle(0x333333, 0.9).fillRoundedRect(x, 22, largura, 18, 4)
            .lineStyle(2, 0xffffff, 0.7).strokeRoundedRect(x, 22, largura, 18, 4);
        this.barraXPPreenchimento.clear()
            .fillStyle(0x99ff33, 1).fillRoundedRect(x, 22, largura * pct, 18, 4);

        this.textoXP.setText(t(this, 'game.xp', { level: this.nivel, current: this.xpAtual, needed: this.xpNecessario }));
    }

    criarHUDOnda() {
        this.textoOnda = this.add.text(this.scale.width - 20, 20, '', {
            fontSize: '22px', fill: '#f2d48b', fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1002);

        this.scale.on('resize', () => {
            this.textoOnda.setPosition(this.scale.width - 20, 20);
        });
    }

    atualizarHUDOnda() {
        if (this.faseAtual === 'boss') {
            this.textoOnda.setText('💀 ' + t(this, 'game.boss'));
            this.textoOnda.setStyle({ fill: '#ff4444' });
        } else {
            const tempo = this.tempoRestanteOnda ?? 0;
            this.textoOnda.setText(t(this, 'game.wave', { current: this.ondaAtual + 1, total: ONDAS.length, time: tempo }));
            this.textoOnda.setStyle({ fill: '#f2d48b' });
        }
    }
}
