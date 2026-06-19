import Phaser from 'phaser';
import { getLanguage, setLanguage, t } from '../i18n.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.idiomaSelecionado = getLanguage(this);
        this.criarFundo();
        this.mostrarMenuPrincipal();

        this.scale.on('resize', () => {
            this.scene.restart();
        });

        this.input.once('pointerdown', () => {
            this.iniciarMusicaMenu();
        });

        this.events.once('shutdown', () => {
            this.pararMusicaMenu();
        });
    }

    criarFundo() {
        const largura = this.scale.width;
        const altura = this.scale.height;

        this.bg = this.add.image(largura / 2, altura / 2, 'fundoMenu');
        this.bg.setDisplaySize(largura, altura);

        this.logo = this.add.image(largura / 2, altura * 0.35, 'logo');
        this.logo.setScale(0.7);
    }

    mostrarMenuPrincipal() {
        this.limparElementosMenu();

        const largura = this.scale.width;
        const altura = this.scale.height;

        const botaoJogar = this.criarBotao(largura / 2, altura * 0.72, t(this, 'menu.play'), '50px');
        botaoJogar.on('pointerdown', () => {
            this.input.setDefaultCursor('default');
            this.scene.start('GameScene');
        });

        const botaoOpcoes = this.criarBotao(largura / 2, altura * 0.84, t(this, 'menu.options'), '34px');
        botaoOpcoes.on('pointerdown', () => this.mostrarOpcoes());

        this.elementosMenu = [botaoJogar, botaoOpcoes];
    }

    mostrarOpcoes() {
        this.limparElementosMenu();

        const largura = this.scale.width;
        const altura = this.scale.height;

        const painel = this.add.rectangle(largura / 2, altura * 0.62, 720, 360, 0x120707, 0.88);
        painel.setStrokeStyle(3, 0x8f1c1c);

        const titulo = this.add.text(largura / 2, altura * 0.45, t(this, 'options.title'), {
            fontSize: '42px',
            fontFamily: 'PixelGame, Arial, sans-serif',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const labelIdioma = this.add.text(largura / 2, altura * 0.53, t(this, 'options.language'), {
            fontSize: '24px',
            fontFamily: 'PixelGame, Arial, sans-serif',
            fill: '#f2d48b',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const botaoPortugues = this.criarBotaoIdioma(largura / 2 - 130, altura * 0.62, t(this, 'options.portuguese'), 'pt');
        const botaoIngles = this.criarBotaoIdioma(largura / 2 + 130, altura * 0.62, t(this, 'options.english'), 'en');
        const botaoFrances = this.criarBotaoIdioma(largura / 2, altura * 0.70, t(this, 'options.french'), 'fr');

        const botaoSalvar = this.criarBotao(largura / 2, altura * 0.76, t(this, 'options.save'), '28px');
        botaoSalvar.on('pointerdown', () => {
            setLanguage(this, this.idiomaSelecionado);
            this.mostrarMenuPrincipal();
        });

        const botaoVoltar = this.criarBotao(largura / 2, altura * 0.83, t(this, 'options.back'), '24px');
        botaoVoltar.on('pointerdown', () => this.mostrarMenuPrincipal());

        this.elementosMenu = [
            painel,
            titulo,
            labelIdioma,
            botaoPortugues.fundo,
            botaoPortugues.texto,
            botaoIngles.fundo,
            botaoIngles.texto,
            botaoFrances.fundo,
            botaoFrances.texto,
            botaoSalvar,
            botaoVoltar
        ];

        this.atualizarBotoesIdioma();
    }

    criarBotao(x, y, texto, tamanhoFonte) {
        const botao = this.add.text(x, y, texto, {
            fontSize: tamanhoFonte,
            fontFamily: 'PixelGame, Arial, sans-serif',
            fill: '#ffffff',
            fontStyle: 'bold',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        botao.setShadow(3, 3, 'rgba(255,0,0,0.8)', 5);
        botao.on('pointerover', () => {
            botao.setStyle({ fill: '#ff0000' });
            this.input.setDefaultCursor('pointer');
        });
        botao.on('pointerout', () => {
            botao.setStyle({ fill: '#ffffff' });
            this.input.setDefaultCursor('default');
        });

        return botao;
    }

    criarBotaoIdioma(x, y, texto, idioma) {
        const fundo = this.add.rectangle(x, y, 210, 58, 0x260f0f, 0.95)
            .setStrokeStyle(3, 0x6b1a1a)
            .setInteractive({ useHandCursor: true });
        const textoBotao = this.add.text(x, y, texto, {
            fontSize: '20px',
            fontFamily: 'PixelGame, Arial, sans-serif',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        fundo.on('pointerdown', () => {
            this.idiomaSelecionado = idioma;
            this.atualizarBotoesIdioma();
        });

        fundo.setData('idioma', idioma);
        fundo.setData('texto', textoBotao);

        return { fundo, texto: textoBotao };
    }

    atualizarBotoesIdioma() {
        this.elementosMenu.forEach((elemento) => {
            const idioma = elemento.getData?.('idioma');
            if (!idioma) return;

            const selecionado = idioma === this.idiomaSelecionado;
            elemento.setFillStyle(selecionado ? 0x5c1a1a : 0x260f0f, 0.95);
            elemento.setStrokeStyle(3, selecionado ? 0xf2d48b : 0x6b1a1a);
        });
    }

    limparElementosMenu() {
        if (!this.elementosMenu) {
            this.elementosMenu = [];
            return;
        }

        this.elementosMenu.forEach((elemento) => elemento.destroy());
        this.elementosMenu = [];
    }

    
iniciarMusicaMenu() {
    if (this.audioContext) return;

    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();

        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.50;
        this.masterGain.connect(this.audioContext.destination);

        this.osciladoresMenu = [];

        this.criarNotaMenu(220, 'sine', 0.25);
        this.criarNotaMenu(330, 'triangle', 0.18);
        this.criarNotaMenu(440, 'sine', 0.12);

        this.criarPulsoMenu();
    } catch {
        this.audioContext = null;
    }
}

criarNotaMenu(frequencia, tipo, volume) {
    if (!this.audioContext || !this.masterGain) return;

    const oscilador = this.audioContext.createOscillator();
    const ganho = this.audioContext.createGain();

    oscilador.type = tipo;
    oscilador.frequency.value = frequencia;
    ganho.gain.value = volume;

    oscilador.connect(ganho);
    ganho.connect(this.masterGain);

    oscilador.start();

    this.osciladoresMenu.push(oscilador);
}

criarPulsoMenu() {
    this.timerMusicaMenu = this.time.addEvent({
        delay: 900,
        loop: true,
        callback: () => {
            if (!this.audioContext || !this.masterGain) return;

            const agora = this.audioContext.currentTime;

            this.masterGain.gain.cancelScheduledValues(agora);
            this.masterGain.gain.setValueAtTime(0.08, agora);
            this.masterGain.gain.linearRampToValueAtTime(0.22, agora + 0.08);
            this.masterGain.gain.linearRampToValueAtTime(0.10, agora + 0.45);
        }
    });
}

pararMusicaMenu() {
    if (this.timerMusicaMenu) {
        this.timerMusicaMenu.remove();
        this.timerMusicaMenu = null;
    }

    if (!this.audioContext) return;

    this.osciladoresMenu.forEach((oscilador) => {
        oscilador.stop();
    });

    this.osciladoresMenu = [];

    this.audioContext.close();
    this.audioContext = null;
}
    
}
