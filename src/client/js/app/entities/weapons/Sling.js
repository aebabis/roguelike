import Weapon from "./Weapon.js";
import DamageTypes from "../DamageTypes.js";

export default class Sling extends Weapon {
    getDamage() {
        return 2;
    }

    getRange() {
        return 3;
    }

    getDamageType() {
        return DamageTypes.RANGED_PHYSICAL;
    }
}
