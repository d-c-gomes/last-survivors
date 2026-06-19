import { ONDAS } from '../data/waves.js';
import { t } from '../i18n.js';

export class WaveSystem {
    constructor(scene, enemySystem) {
        this.scene = scene;
        this.enemySystem = enemySystem;

        this.ondaAtual = 0;
        this.tempoRestante = ONDAS[this.ondaAtual].duracao;
        this.timerOnda = null;

        this.criarHUD();
    }

    iniciar() {
        this.iniciarOnda(0);
    }

    criarHUD() {
        this.textoOnda = this.scene.add.text(this.scene.scale.width - 20, 20, '', {
            fontSize: '22px',
            fill: '#f2d48b',
            fontStyle: 'bold',
            fontFamily: 'PixelGame, Arial, sans-serif'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1002);

        this.scene.scale.on('resize', () => {
            this.textoOnda.setPosition(this.scene.scale.width - 20, 20);
        });
    }

    iniciarOnda(indice) {
        this.ondaAtual = indice;
        const onda = ONDAS[this.ondaAtual];

        this.tempoRestante = onda.duracao;
        this.atualizarHUD();

        this.enemySystem.iniciarSpawn({
            spawnDelay: onda.spawnDelay,
            vidaInimigo: onda.vidaInimigo,
            velocidadeInimigo: onda.velocidadeInimigo
        });

        if (this.timerOnda) {
            this.timerOnda.remove();
        }

        this.timerOnda = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.contarTempo(),
            loop: true
        });
    }

    contarTempo() {
        this.tempoRestante -= 1;
        this.atualizarHUD();

        if (this.tempoRestante <= 0) {
            this.terminarOnda();
        }
    }

    terminarOnda() {
        if (this.timerOnda) {
            this.timerOnda.remove();
            this.timerOnda = null;
        }

        this.enemySystem.pararSpawn();
        this.enemySystem.destruirTodosComDrop();

        const proximaOnda = this.ondaAtual + 1;

        if (proximaOnda < ONDAS.length) {
            this.mostrarMensagemTemporaria(
                t(this.scene, 'game.waveIncoming', { number: proximaOnda + 1 }),
                '#ffffff',
                () => this.iniciarOnda(proximaOnda)
            );
        } else {
            this.mostrarMensagemTemporaria(
                t(this.scene, 'game.bossIncoming'),
                '#ff4444',
                () => {
                    this.textoOnda.setText(t(this.scene, 'game.boss'));
                    this.textoOnda.setStyle({ fill: '#ff4444' });

                    if (this.scene.bossSystem) {
                        this.scene.bossSystem.iniciarBoss();
                    }
                }
            );
        }
    }

    mostrarMensagemTemporaria(mensagem, cor, depois) {
        const texto = this.scene.add.text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            mensagem,
            {
                fontSize: '48px',
                fill: cor,
                fontStyle: 'bold',
                fontFamily: 'PixelGame, Arial, sans-serif'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(2000);

        this.scene.time.delayedCall(3000, () => {
            texto.destroy();
            depois();
        });
    }

    atualizarHUD() {
        const onda = ONDAS[this.ondaAtual];

        this.textoOnda.setText(t(this.scene, 'game.wave', {
            current: onda.numero,
            total: ONDAS.length,
            time: this.tempoRestante
        }));
    }
}