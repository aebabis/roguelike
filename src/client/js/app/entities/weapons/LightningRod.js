import Weapon from './Weapon';
import DamageTypes from '../DamageTypes';

var DAMAGE = 4;
var BONUS_DAMAGE = 1;

export default class LightningRod extends Weapon {
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
        defender.receiveDamage(dungeon, this, BONUS_DAMAGE, DamageTypes.ELECTRICAL);
    }

    getFriendlyDescription() {
        return `Does ${DAMAGE} electrical damage and ${BONUS_DAMAGE} electrical damage`;
    }
}
