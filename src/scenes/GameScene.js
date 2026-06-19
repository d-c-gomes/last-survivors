import Phaser from 'phaser';
import { t } from '../i18n.js';
import { MAPA, CAMERA, JOGADOR, INIMIGO, XP_CONFIG, UI } from '../data/gameConfig.js';
import { ESPADA_INICIAL } from '../data/weapons.js';
import { sortearCristalXP } from '../data/lootTable.js';
import { XPSystem } from '../systems/XPSystem.js';
import { HUDSystem } from '../systems/HUDSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { BossSystem } from '../systems/BossSystem.js';


export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.mapaLargura = MAPA.largura;
        this.mapaAltura = MAPA.altura;
        this.chao = this.add.tileSprite(0, 0, this.mapaLargura, this.mapaAltura, 'chao').setOrigin(0, 0);
        this.physics.world.setBounds(0, 0, this.mapaLargura, this.mapaAltura);

        this.player = this.physics.add.sprite(this.mapaLargura / 2, this.mapaAltura / 2, 'jogador');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(JOGADOR.escala);
        this.player.setBodySize(JOGADOR.hitbox.largura, JOGADOR.hitbox.altura);
        this.player.setOffset(JOGADOR.hitbox.offsetX, JOGADOR.hitbox.offsetY);

        this.cameras.main.setBounds(0, 0, this.mapaLargura, this.mapaAltura);
        this.cameras.main.startFollow(this.player, true, CAMERA.suavidadeX, CAMERA.suavidadeY);
        this.cameras.main.setZoom(CAMERA.zoom);

        this.teclas = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.velocidade = JOGADOR.velocidade;

        this.vidaMaxima = JOGADOR.vidaMaxima;
        this.vida = this.vidaMaxima;
        this.isInvencivel = false;
        this.nivel = XP_CONFIG.nivelInicial;
        this.xpAtual = XP_CONFIG.xpInicial;
        this.xpNecessario = XP_CONFIG.xpNecessarioInicial;
        this.enemySystem = new EnemySystem(this);
        this.inimigos = this.enemySystem.inimigos;
       this.bossSystem = new BossSystem(this);

        this.waveSystem = new WaveSystem(this, this.enemySystem);
        this.waveSystem.iniciar();

        this.armaEquipada = { ...ESPADA_INICIAL };

        this.time.addEvent({
            delay: this.armaEquipada.cooldown,
            callback: () => this.combatSystem.atacarAutomaticamente(),
            loop: true
        });

        this.criarTexturasCristais();
        

        this.physics.add.overlap(this.player, this.inimigos, this.levarDano, null, this);
       
        this.xpSystem = new XPSystem(this);
        this.hud = new HUDSystem(this);
        this.combatSystem = new CombatSystem(this);

        this.iniciarMusicaJogo();

        this.events.once('shutdown', () => {
            this.pararMusicaJogo();
        });
    }

    update() {
    this.moverJogador();
    this.enemySystem.update();

    if (this.bossSystem) {
        this.bossSystem.update();
    }
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


    ganharXP(quantidade) {
        this.xpAtual += quantidade;

        if (this.xpAtual >= this.xpNecessario) {
            this.subirNivel();
        }

        if (this.hud) {
            this.hud.atualizarBarraXP();
        }
    }

    subirNivel() {
        this.nivel += 1;
        this.xpAtual = 0;
        this.xpNecessario = Math.floor(this.xpNecessario * XP_CONFIG.multiplicadorNivel);
    }

    levarDano(jogador) {
        if (this.isInvencivel) return;

        this.vida = Math.max(0, this.vida - 10);
        this.hud.atualizarBarraDeVida();

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

    iniciarMusicaJogo() {
    if (this.audioContextJogo) return;

    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContextJogo = new AudioContext();

        this.ganhoMusicaJogo = this.audioContextJogo.createGain();
        this.ganhoMusicaJogo.gain.value = 0.70;
        this.ganhoMusicaJogo.connect(this.audioContextJogo.destination);

        this.notasMusicaJogo = [220, 261.63, 293.66, 329.63, 392, 329.63, 293.66, 261.63];
        this.indiceNotaMusicaJogo = 0;

        this.timerMusicaJogo = this.time.addEvent({
            delay: 220,
            loop: true,
            callback: () => {
                this.tocarNotaJogo();
            }
        });
    } catch {
        this.audioContextJogo = null;
    }
}

tocarNotaJogo() {
    if (!this.audioContextJogo || !this.ganhoMusicaJogo) return;

    const agora = this.audioContextJogo.currentTime;
    const frequencia = this.notasMusicaJogo[this.indiceNotaMusicaJogo];

    const oscilador = this.audioContextJogo.createOscillator();
    const ganhoNota = this.audioContextJogo.createGain();

    oscilador.type = 'square';
    oscilador.frequency.value = frequencia;

    ganhoNota.gain.setValueAtTime(0, agora);
    ganhoNota.gain.linearRampToValueAtTime(0.35, agora + 0.02);
    ganhoNota.gain.linearRampToValueAtTime(0, agora + 0.18);

    oscilador.connect(ganhoNota);
    ganhoNota.connect(this.ganhoMusicaJogo);

    oscilador.start(agora);
    oscilador.stop(agora + 0.2);

    this.indiceNotaMusicaJogo += 1;

    if (this.indiceNotaMusicaJogo >= this.notasMusicaJogo.length) {
        this.indiceNotaMusicaJogo = 0;
    }
}

pararMusicaJogo() {
    if (this.timerMusicaJogo) {
        this.timerMusicaJogo.remove();
        this.timerMusicaJogo = null;
    }

    if (this.audioContextJogo) {
        this.audioContextJogo.close();
        this.audioContextJogo = null;
    }
}

}