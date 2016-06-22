import Weapon from "./Weapon.js";
import DamageTypes from "../DamageTypes.js";

export default class Shortbow extends Weapon {
    getDamage() {
        return 3;
    }

    getRange() {
        return 5;
    }

    getDamageType() {
        return DamageTypes.RANGED_PHYSICAL;
    }
}
