import { default as Creature } from "./Creature.js";
import { default as PlayableCharacter } from "./PlayableCharacter.js";
import { default as Strategies } from "./strategies/Strategies.js";

import { default as Armor } from "../armor/Armor.js";
import { default as Weapon } from "../weapons/Weapon.js";

class SkeletonArmor extends Armor {
    getPhysicalReduction() {
        return 1;
    }

    getMagicalReduction() {
        return 0;
    }
}

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
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getMeleeWeapon() {
        return super.getMeleeWeapon() || new SkeletonPunch(this.getDungeon());
    }

    getRangedWeapon() {
        return null;
    }

    getArmor() {
        return new SkeletonArmor(this.getDungeon());
    }

    getSpeed() {
        return 600;
    }

    getBaseHP() {
        return 4;
    }
}
