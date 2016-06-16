import Creature from "./Creature.js";
import Strategies from "./strategies/Strategies.js";


import Armor from "../armor/Armor.js";
import Weapon from "../weapons/Weapon.js";

// TODO: This should be a buff
class FireSpriteArmor extends Armor {
    getPhysicalReduction() {
        return Infinity;
    }

    getMagicalReduction() {
        return 0;
    }
}

class FireSpriteAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 1;
    }

    isMagical() {
        return true;
    }
}

export default class FireSprite extends Creature {
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getBaseHP() {
        return 2;
    }

    getMeleeWeapon() {
        return new FireSpriteAttack();
    }

    getRangedWeapon() {
        return null;
    }

    getArmor() {
        return new FireSpriteArmor();
    }

    getSpeed() {
        return 250;
    }
}
