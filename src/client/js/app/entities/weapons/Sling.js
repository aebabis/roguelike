import Weapon from "./Weapon.js";
import DamageTypes from "../DamageTypes.js";

var AMOUNT = 2;

export default class Sling extends Weapon {
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
