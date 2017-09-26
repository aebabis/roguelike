import Weapon from './Weapon';
import DamageTypes from '../DamageTypes';

var AMOUNT = 2;

export default class Slingshot extends Weapon {
    getDamage() {
        return AMOUNT;
    }

    getRange() {
        return 3;
    }

    getDamageType() {
        return DamageTypes.RANGED_PHYSICAL;
    }

    getFriendlyDescription() {
        return `Deals ${AMOUNT} damage to non-adjacent enemy`;
    }
}
