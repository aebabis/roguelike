import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import Armor from '../../armor/Armor';
import Weapon from '../../weapons/Weapon';
import DamageTypes from '../../DamageTypes';

import KnockbackEffect from '../../../effects/KnockbackEffect';

class TrumpetPlating extends Armor {
    getReduction(type) {
        if(type === DamageTypes.MELEE_PHYSICAL) {
            return 2;
        } else if(type === DamageTypes.RANGED_PHYSICAL) {
            return 2;
        } else if(type === DamageTypes.FIRE) {
            return 2;
        } else {
            return 0;
        }
    }
}

class TrumpetBlast extends Weapon {
    getDamage() {
        return 0;
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

    getFriendlyDescription() {
        return `Does ${this.getDamage()} damage to adjacent enemy and pushes them back`;
    }
}

export default class Crier extends Creature {
    constructor() {
        super();
        this.addItem(new TrumpetBlast());
        this.addItem(new TrumpetPlating());
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.MeleeAttackStrategy(),
            new Strategies.HoldStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getBaseSpeed() {
        return 500;
    }

    getBaseHP() {
        return 4;
    }
}
