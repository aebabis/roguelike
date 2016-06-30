import Weapon from './Weapon.js';
import DamageTypes from '../DamageTypes.js';

var AMOUNT = 5;

export default class Longsword extends Weapon {
    getDamage() {
        return AMOUNT;
    }

    getRange() {
        return 1;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }

    getFriendlyDescription() {
        return `Does ${AMOUNT} damage to adjacent enemy`;
    }
}
