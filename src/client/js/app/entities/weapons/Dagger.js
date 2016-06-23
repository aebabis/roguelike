import Weapon from "./Weapon.js";
import DamageTypes from "../DamageTypes.js";

var DAMAGE = 3;

export default class Dagger extends Weapon {
    getDamage() {
        return DAMAGE;
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
