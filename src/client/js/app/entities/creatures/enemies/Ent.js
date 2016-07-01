import Creature from '../Creature.js';
import Strategies from '../strategies/Strategies.js';

import Armor from '../../armor/Armor.js';
import Weapon from '../../weapons/Weapon.js';
import DamageTypes from '../../DamageTypes.js';

class Bark extends Armor {
    getReduction(type) {
        if(type === DamageTypes.MELEE_PHYSICAL) {
            return 2;
        } else if(type === DamageTypes.RANGED_PHYSICAL) {
            return 3;
        } else if(type === DamageTypes.FIRE) {
            return -3; // Weakness
        } else {
            return 0;
        }
    }
}

class EntAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 8;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
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
