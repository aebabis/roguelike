import Weapon from './Weapon.js';
import DamageTypes from '../DamageTypes.js';

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
