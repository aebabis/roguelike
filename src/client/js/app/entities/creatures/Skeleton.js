import Creature from "./Creature.js";
import PlayableCharacter from "./PlayableCharacter.js";
import Strategies from "./strategies/Strategies.js";

import Armor from "../armor/Armor.js";
import Weapon from "../weapons/Weapon.js";

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
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getMeleeWeapon() {
        return super.getMeleeWeapon() || new SkeletonPunch();
    }

    getRangedWeapon() {
        return null;
    }

    getArmor() {
        return new SkeletonArmor();
    }

    getSpeed() {
        return 600;
    }

    getBaseHP() {
        return 4;
    }
}
