import Weapon from './Weapon.js';
import DamageTypes from '../DamageTypes.js';

var DAMAGE = 4;

export default class LightningRod extends Weapon {
    getDamage() {
        return DAMAGE;
    }

    getRange() {
        return 1;
    }

    getDamageType() {
        return DamageTypes.ELECTRICAL;
    }

    getFriendlyDescription() {
        return `Does ${DAMAGE} electrical damage to adjacent enemy`;
    }
}
