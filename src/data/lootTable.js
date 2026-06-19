import Phaser from 'phaser';

export const CRISTAIS_XP = {
    verde: {
        textura: 'cristalVerde',
        xp: 10
    },
    azul: {
        textura: 'cristalAzul',
        xp: 30
    },
    dourado: {
        textura: 'cristalDourado',
        xp: 100
    }
};

export function sortearCristalXP() {
    const sorteio = Phaser.Math.Between(1, 100);

    if (sorteio > 95) {
        return CRISTAIS_XP.dourado;
    }

    if (sorteio > 75) {
        return CRISTAIS_XP.azul;
    }

    return CRISTAIS_XP.verde;
}