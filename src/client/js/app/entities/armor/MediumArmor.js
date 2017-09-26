import Armor from './Armor';
import DamageTypes from '../DamageTypes';

/** Amount of protection provided by armor */
var AMOUNT = 2;

/**
 * Provides moderate protection against physical attacks
 */
export default class MediumArmor extends Armor {
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
