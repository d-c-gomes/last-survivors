import Phaser from 'phaser';

export class CombatSystem {
    constructor(scene) {
        this.scene = scene;
    }

    atacarAutomaticamente() {
    if (!this.scene.armaEquipada) return;

    if (this.scene.boss && this.scene.boss.active) {
        const distanciaBoss = Phaser.Math.Distance.Between(
            this.scene.player.x,
            this.scene.player.y,
            this.scene.boss.x,
            this.scene.boss.y
        );

        if (distanciaBoss <= this.scene.armaEquipada.alcance * 2) {
            this.mostrarGolpeDaEspada(this.scene.boss);
            this.scene.bossSystem.receberDano(this.scene.armaEquipada.dano);
        }

        return;
    }

    const alvo = this.encontrarInimigoMaisProximo(this.scene.armaEquipada.alcance);
    if (!alvo) return;

    if (this.scene.armaEquipada.tipo === 'corpo-a-corpo') {
        this.atacarComEspada(alvo);
    }
}

    encontrarInimigoMaisProximo(alcance) {
        let alvoMaisProximo = null;
        let menorDistancia = alcance;

        this.scene.inimigos.getChildren().forEach((esqueleto) => {
            if (!esqueleto.active) return;

            const distancia = Phaser.Math.Distance.Between(
                this.scene.player.x,
                this.scene.player.y,
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

    inimigoEstaDentroDoGolpe(inimigo, anguloAtaque) {
        const distancia = Phaser.Math.Distance.Between(
            this.scene.player.x,
            this.scene.player.y,
            inimigo.x,
            inimigo.y
        );

        if (distancia > this.scene.armaEquipada.alcance) {
            return false;
        }

        const anguloInimigo = Phaser.Math.Angle.Between(
            this.scene.player.x,
            this.scene.player.y,
            inimigo.x,
            inimigo.y
        );

        const diferencaAngulo = Math.abs(Phaser.Math.Angle.Wrap(anguloInimigo - anguloAtaque));

        return diferencaAngulo <= Phaser.Math.DegToRad(55);
    }

    darDanoAoInimigo(inimigo) {
        const vidaAtual = inimigo.getData('vida') ?? 1;
        const novaVida = vidaAtual - this.scene.armaEquipada.dano;

        if (novaVida <= 0) {
            this.scene.xpSystem.droparCristal(inimigo.x, inimigo.y);
            inimigo.destroy();
        } else {
            inimigo.setData('vida', novaVida);
        }
    }

    atacarComEspada(alvo) {
    const anguloAtaque = Phaser.Math.Angle.Between(
        this.scene.player.x,
        this.scene.player.y,
        alvo.x,
        alvo.y
    );

    this.mostrarGolpeDaEspada(alvo);

    this.scene.inimigos.getChildren().forEach((inimigo) => {
        if (!inimigo.active) return;

        const estaDentroDoGolpe = this.inimigoEstaDentroDoGolpe(inimigo, anguloAtaque);

        if (estaDentroDoGolpe) {
            this.darDanoAoInimigo(inimigo);
        }
    });
}

    mostrarGolpeDaEspada(alvo) {
        const angulo = Phaser.Math.Angle.Between(
            this.scene.player.x,
            this.scene.player.y,
            alvo.x,
            alvo.y
        );

        const distancia = 62;
        const x = this.scene.player.x + Math.cos(angulo) * distancia;
        const y = this.scene.player.y + Math.sin(angulo) * distancia;

        const golpe = this.scene.add.arc(
            x,
            y,
            42,
            Phaser.Math.RadToDeg(angulo) - 55,
            Phaser.Math.RadToDeg(angulo) + 55,
            false
        );

        golpe.setStrokeStyle(5, 0xf2d48b, 0.9);
        golpe.setDepth(10);

        this.scene.tweens.add({
            targets: golpe,
            alpha: 0,
            scale: 1.35,
            duration: 140,
            onComplete: () => golpe.destroy()
        });
    }
}