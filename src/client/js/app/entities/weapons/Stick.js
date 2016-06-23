import Weapon from "./Weapon.js";
import DamageTypes from "../DamageTypes.js";

var AMOUNT = 2;

export default class Stick extends Weapon {
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
        return `Does ${DAMAGE} damage to adjacent enemy`
    }
}
