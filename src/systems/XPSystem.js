import { sortearCristalXP } from '../data/lootTable.js';

export class XPSystem {
    constructor(scene) {
        this.scene = scene;
        this.cristaisXp = scene.physics.add.group();

        scene.physics.add.overlap(
            scene.player,
            this.cristaisXp,
            this.recolherCristal,
            this.podeRecolherCristal,
            this
        );
    }

    droparCristal(x, y) {
        const tipoCristal = sortearCristalXP();

        const cristal = this.cristaisXp.create(x, y, tipoCristal.textura);
        cristal.setData('xp', tipoCristal.xp);
        cristal.setData('podeRecolher', false);
        cristal.setScale(0.4);
        cristal.setDepth(5);
        cristal.body.setAllowGravity(false);

        this.scene.time.delayedCall(350, () => {
            if (cristal.active) {
                cristal.setData('podeRecolher', true);
            }
        });
    }

    podeRecolherCristal(jogador, cristal) {
        return cristal.getData('podeRecolher') === true;
    }

    recolherCristal(jogador, cristal) {
        const xpGanho = cristal.getData('xp') ?? 0;
        cristal.destroy();

        this.scene.ganharXP(xpGanho);
    }
}