import Weapon from './Weapon';
import DamageTypes from '../DamageTypes';

import KnockbackEffect from '../../effects/KnockbackEffect';

var AMOUNT = 4;

export default class Warhammer extends Weapon {
    getDamage() {
        return AMOUNT;
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
        return `Does ${AMOUNT} damage to adjacent enemy and pushes them back`;
    }
}
