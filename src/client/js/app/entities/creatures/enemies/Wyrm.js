import Creature from '../Creature.js';
import Strategies from '../strategies/Strategies.js';
import DamageTypes from '../../DamageTypes.js';

import Armor from '../../armor/Armor.js';
import Weapon from '../../weapons/Weapon.js';
import Firebolt from '../../../abilities/Firebolt.js';

class WyrmHide extends Armor {
    getReduction(type) {
        if(type === DamageTypes.MELEE_PHYSICAL) {
            return 2;
        } else if(type === DamageTypes.RANGED_PHYSICAL) {
            return 1;
        } else if(type === DamageTypes.FIRE) {
            return 2;
        } else {
            return 0;
        }
    }
}

class ClawAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 4;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }
}

export default class Wyrm extends Creature {
    constructor() {
        super();
        this.setArmor(new WyrmHide());
        this.setMeleeWeapon(new ClawAttack());
        this.addAbility(new Firebolt());
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.MeleeAttackStrategy(),
            new Strategies.OffensiveTargettedAbilityStrategy(Firebolt),
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getBaseHP() {
        return 4;
    }

    getBaseMana() {
        return 10;
    }

    getBaseSpeed() {
        return 500;
    }
}
