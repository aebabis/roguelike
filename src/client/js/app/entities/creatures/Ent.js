import Creature from "./Creature.js";
import PlayableCharacter from "./PlayableCharacter.js";
import Strategies from "./strategies/Strategies.js";

import Armor from "../armor/Armor.js";
import Weapon from "../weapons/Weapon.js";

class Bark extends Armor {
    getPhysicalReduction() {
        return 2;
    }

    getMagicalReduction() {
        return 1;
    }
}

class EntAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 8;
    }
}

export default class Ent extends Creature {
    /**
     * @class Ent
     * @description Slow melee enemy. Chases the player
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
        return new EntAttack();
    }

    getRangedWeapon() {
        return null;
    }

    getArmor() {
        return new Bark();
    }

    getSpeed() {
        return 800;
    }

    getBaseHP() {
        return 8;
    }
}
