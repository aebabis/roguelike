import Weapon from './Weapon.js';
import DamageTypes from '../DamageTypes.js';

var DAMAGE = 3;

export default class FrostDagger extends Weapon {
    getDamage() {
        return DAMAGE;
    }

    getRange() {
        return 1;
    }

    getDamageType() {
        return DamageTypes.COLD;
    }

    getFriendlyDescription() {
        return `Does ${DAMAGE} cold damage to adjacent enemy`;
    }
}
