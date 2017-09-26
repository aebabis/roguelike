import Weapon from './Weapon';
import DamageTypes from '../DamageTypes';

var AMOUNT = 3;

export default class Shortbow extends Weapon {
    getDamage() {
        return AMOUNT;
    }

    getRange() {
        return 5;
    }

    getDamageType() {
        return DamageTypes.RANGED_PHYSICAL;
    }

    getFriendlyDescription() {
        return `Deals ${AMOUNT} damage to non-adjacent enemy`;
    }
}
