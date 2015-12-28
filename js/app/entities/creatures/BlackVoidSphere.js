import { default as Creature } from "./Creature.js";
import { default as PlayableCharacter } from "./PlayableCharacter.js";
import { default as ChaseStrategy } from "./strategies/ChaseStrategy.js";

import { default as Weapon } from "../weapons/Weapon.js";

class VoidSphereAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 3;
    }
}

export default class BlackVoidSphere extends Creature {
    /**
     * @class BlackVoidSphere
     * @description Basic melee enemy. Chases the player
     */
    constructor(dungeon) {
        super(dungeon);
        this._strategy = new ChaseStrategy(this);
    }

    getMeleeWeapon() {
        return new VoidSphereAttack(this.getDungeon());
    }

    getRangedWeapon() {
        return null;
    }

    getNextMove() {
        return this._strategy.getNextMove();
    }

    getSpeed() {
        return 600;
    }

    getBaseHP() {
        return 5;
    }
}
