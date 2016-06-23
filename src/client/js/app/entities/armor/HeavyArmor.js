import Armor from "./Armor.js";
import DamageTypes from "../DamageTypes.js";

var AMOUNT = 3;

export default class Heavy extends Armor {
    getReduction(type) {
        return (type === DamageTypes.MELEE_PHYSICAL || type === DamageTypes.RANGED_PHYSICAL) ? AMOUNT : 0;
    }

    getFriendlyDescription() {
        return `Reduces normal weapon damage by ${AMOUNT}`;
    }
}
