import Weapon from './Weapon.js';
import DamageTypes from '../DamageTypes.js';

var AMOUNT = 4;

export default class Longbow extends Weapon {
    getDamage() {
        return AMOUNT;
    }

    getRange() {
        return 7;
    }

    getDamageType() {
        return DamageTypes.RANGED_PHYSICAL;
    }

    getFriendlyDescription() {
        return `Deals ${AMOUNT} damage to non-adjacent enemy`;
    }
}
