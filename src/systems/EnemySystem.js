import Phaser from 'phaser';
import { INIMIGO } from '../data/gameConfig.js';

export class EnemySystem {
    constructor(scene) {
        this.scene = scene;
        this.inimigos = scene.physics.add.group();
        this.timerSpawn = null;

        this.configAtual = {
            spawnDelay: INIMIGO.spawnDelay,
            vidaInimigo: INIMIGO.vida,
            velocidadeInimigo: INIMIGO.velocidade
        };
    }

    iniciarSpawn(configOnda) {
        this.pararSpawn();

        this.configAtual = {
            spawnDelay: configOnda.spawnDelay,
            vidaInimigo: configOnda.vidaInimigo,
            velocidadeInimigo: configOnda.velocidadeInimigo
        };

        this.timerSpawn = this.scene.time.addEvent({
            delay: this.configAtual.spawnDelay,
            callback: () => this.gerarInimigo(),
            loop: true
        });
    }

    pararSpawn() {
        if (this.timerSpawn) {
            this.timerSpawn.remove();
            this.timerSpawn = null;
        }
    }

    update() {
        this.moverInimigos();
    }

    gerarInimigo() {
        const distanciaMinima = INIMIGO.distanciaMinimaSpawn;
        const distanciaExtra = Phaser.Math.Between(0, INIMIGO.distanciaExtraSpawn);
        const angulo = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distancia = distanciaMinima + distanciaExtra;

        const xAleatorio = Phaser.Math.Clamp(
            this.scene.player.x + Math.cos(angulo) * distancia,
            40,
            this.scene.mapaLargura - 40
        );

        const yAleatorio = Phaser.Math.Clamp(
            this.scene.player.y + Math.sin(angulo) * distancia,
            40,
            this.scene.mapaAltura - 40
        );

        const novoEsqueleto = this.inimigos.create(xAleatorio, yAleatorio, 'inimigo');
        novoEsqueleto.setScale(INIMIGO.escala);
        novoEsqueleto.setBodySize(INIMIGO.hitbox.largura, INIMIGO.hitbox.altura);
        novoEsqueleto.setOffset(INIMIGO.hitbox.offsetX, INIMIGO.hitbox.offsetY);
        novoEsqueleto.setData('vida', this.configAtual.vidaInimigo);
    }

    moverInimigos() {
        this.inimigos.getChildren().forEach((esqueleto) => {
            if (!esqueleto.active) return;

            this.scene.physics.moveToObject(
                esqueleto,
                this.scene.player,
                this.configAtual.velocidadeInimigo
            );

            if (esqueleto.body.velocity.x > 0) {
                esqueleto.setFlipX(false);
            } else if (esqueleto.body.velocity.x < 0) {
                esqueleto.setFlipX(true);
            }
        });
    }

    destruirTodosComDrop() {
        [...this.inimigos.getChildren()].forEach((inimigo) => {
            if (!inimigo.active) return;

            this.scene.xpSystem.droparCristal(inimigo.x, inimigo.y);
            inimigo.destroy();
        });
    }

    contarInimigosVivos() {
        return this.inimigos.countActive();
    }
}