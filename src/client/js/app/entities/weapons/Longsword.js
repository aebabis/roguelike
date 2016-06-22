import Weapon from "./Weapon.js";
import DamageTypes from "../DamageTypes.js";

export default class Longsword extends Weapon {
    getDamage() {
        return 5;
    }

    getRange() {
        return 1;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }
}
