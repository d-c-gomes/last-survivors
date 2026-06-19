export const MAPA = {
    largura: 15000,
    altura: 15000
};

export const CAMERA = {
    zoom: 0.7,
    suavidadeX: 0.08,
    suavidadeY: 0.08
};

export const JOGADOR = {
    velocidade: 200,
    vidaMaxima: 100,
    escala: 2,
    hitbox: {
        largura: 22,
        altura: 28,
        offsetX: 21,
        offsetY: 18
    }
};

export const INIMIGO = {
    velocidade: 120,
    escala: 2,
    vida: 1,
    spawnDelay: 1000,
    distanciaMinimaSpawn: 650,
    distanciaExtraSpawn: 300,
    hitbox: {
        largura: 18,
        altura: 26,
        offsetX: 23,
        offsetY: 20
    }
};

export const BOSS_HITBOX = {
    largura: 32,
    altura: 42,
    offsetX: 48,
    offsetY: 42
};

export const XP_CONFIG = {
    nivelInicial: 1,
    xpInicial: 0,
    xpNecessarioInicial: 100,
    multiplicadorNivel: 1.5
};

export const UI = {
    profundidadeFundo: 1000,
    profundidadeBarra: 1001,
    profundidadeTexto: 1002
};