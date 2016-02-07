import { default as Creature } from "./Creature.js";
import { default as PlayableCharacter } from "./PlayableCharacter.js";
import { default as ChaseStrategy } from "./strategies/ChaseStrategy.js";

import { default as Weapon } from "../weapons/Weapon.js";

class SkeletonPunch extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 3;
    }
}

export default class Skeleton extends Creature {
    /**
     * @class Skeleton
     * @description Medium-speed melee chaser
     */
    constructor(dungeon) {
        super(dungeon);
        this.setStrategy(new ChaseStrategy(this));
    }

    getMeleeWeapon() {
        return super.getMeleeWeapon() || new SkeletonPunch(this.getDungeon());
    }

    getRangedWeapon() {
        return null;
    }

    getSpeed() {
        return 400;
    }

    getBaseHP() {
        return 4;
    }
}
