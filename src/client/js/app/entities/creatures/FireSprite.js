import Creature from "./Creature.js";
import Strategies from "./strategies/Strategies.js";


import Armor from "../armor/Armor.js";
import Weapon from "../weapons/Weapon.js";

import DamageTypes from "../DamageTypes.js";

// TODO: This should be a buff
class FireSpriteArmor extends Armor {
    getReduction(type) {
        return (type === DamageTypes.MELEE_PHYSICAL || type === DamageTypes.RANGED_PHYSICAL) ? Infinity : 0;
    }
}

class FireSpriteAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 1;
    }

    getDamageType() {
        return DamageTypes.FIRE;
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
