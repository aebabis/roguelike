import Armor from './Armor.js';
import DamageTypes from '../DamageTypes.js';

var AMOUNT = 1;

export default class LightArmor extends Armor {
    /**
     * @override
     */
    getReduction(type) {
        return (type === DamageTypes.MELEE_PHYSICAL || type === DamageTypes.RANGED_PHYSICAL) ? AMOUNT : 0;
    }

    /**
     * @override
     */
    getFriendlyDescription() {
        return `Reduces normal weapon damage by ${AMOUNT}`;
    }
}
