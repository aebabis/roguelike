import Weapon from './Weapon';
import DamageTypes from '../DamageTypes';

var DAMAGE = 3;
var BONUS_DAMAGE = 1;

export default class FrostDagger extends Weapon {
    getDamage() {
        return DAMAGE;
    }

    getRange() {
        return 1;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }

    onAttack(dungeon, attacker, defender) {
        defender.receiveDamage(dungeon, this, BONUS_DAMAGE, DamageTypes.COLD);
    }

    getFriendlyDescription() {
        return `Does ${DAMAGE} physical damage and ${BONUS_DAMAGE} cold damage`;
    }
}
