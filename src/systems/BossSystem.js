import Phaser from 'phaser';
import { BOSS } from '../data/waves.js';
import { BOSS_HITBOX } from '../data/gameConfig.js';

export class BossSystem {
    constructor(scene) {
        this.scene = scene;
        this.boss = null;
    }

    iniciarBoss() {
        const x = Phaser.Math.Clamp(
            this.scene.player.x + 600,
            100,
            this.scene.mapaLargura - 100
        );

        const y = this.scene.player.y;

        this.boss = this.scene.physics.add.sprite(x, y, 'inimigo');
        this.boss.setScale(BOSS.escala);
        this.boss.setBodySize(BOSS_HITBOX.largura, BOSS_HITBOX.altura);
        this.boss.setOffset(BOSS_HITBOX.offsetX, BOSS_HITBOX.offsetY);
        this.boss.setTint(0xff2222);
        this.boss.setData('vida', BOSS.vida);
        this.boss.setDepth(5);

        this.scene.physics.add.overlap(
            this.scene.player,
            this.boss,
            () => this.levarDanoBoss(),
            null,
            this
        );

        this.scene.boss = this.boss;
        this.scene.hud.criarBarraBoss(BOSS.vida);
    }

    update() {
        if (!this.boss || !this.boss.active) return;

        this.scene.physics.moveToObject(
            this.boss,
            this.scene.player,
            BOSS.velocidade
        );

        this.boss.setFlipX(this.boss.body.velocity.x < 0);

        this.verificarDanoAoJogador();
    }

    levarDanoBoss() {
        if (this.scene.isInvencivel) return;

        this.scene.vida = Math.max(0, this.scene.vida - BOSS.dano);
        this.scene.hud.atualizarBarraDeVida();

        this.scene.isInvencivel = true;
        this.scene.player.setTint(0xff0000);

        if (this.scene.vida <= 0) {
            this.scene.scene.start('GameOverScene');
            return;
        }

        this.scene.time.delayedCall(1000, () => {
            this.scene.player.clearTint();
            this.scene.isInvencivel = false;
        });
    }

    receberDano(dano) {
        if (!this.boss || !this.boss.active) return;

        const vidaAtual = this.boss.getData('vida');
        const novaVida = vidaAtual - dano;

        this.boss.setData('vida', novaVida);

        if (this.scene.hud) {
            this.scene.hud.atualizarBarraBoss(novaVida);
        }

        if (novaVida <= 0) {
            this.boss.destroy();
            this.boss = null;

            if (this.scene.hud) {
                this.scene.hud.removerBarraBoss();
            }

            this.scene.scene.start('VictoryScene');
        }
    }

    verificarDanoAoJogador() {
        if (!this.boss || !this.boss.active) return;
        if (this.scene.isInvencivel) return;

        const distancia = Phaser.Math.Distance.Between(
            this.boss.x,
            this.boss.y,
            this.scene.player.x,
            this.scene.player.y
        );

        if (distancia <= BOSS.raioDano) {
            this.levarDanoBoss();
        }
    }
}