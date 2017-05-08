import Creature from '../Creature.js';
import Strategies from '../strategies/Strategies.js';

import Weapon from '../../weapons/Weapon.js';
import DamageTypes from '../../DamageTypes.js';

import DashAttack from '../../../abilities/DashAttack.js';
import KnockbackEffect from '../../../effects/KnockbackEffect.js';

class Foot extends Weapon {
    getDamage() {
        return 4;
    }

    getRange() {
        return 1;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }

    onAttack(dungeon, creature, target) {
        new KnockbackEffect(1).apply(dungeon, creature, target);
    }
}

export default class Bigfoot extends Creature {
    /**
     * An enemy with a flying kick attack
     */
    constructor() {
        super();
        this.setMeleeWeapon(new Foot());
        this.addAbility(new DashAttack());
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.OffensiveTargettedAbilityStrategy(DashAttack),
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getSpeed() {
        return 475;
    }

    getBaseHP() {
        return 5;
    }

    getBaseMana() {
        return 10;
    }
}
