import Weapon from "./Weapon.js";
import DamageTypes from "../DamageTypes.js";

export default class Dagger extends Weapon {
    getDamage() {
        return 3;
    }

    getRange() {
        return 1;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }
}
