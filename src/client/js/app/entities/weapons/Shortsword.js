import Weapon from "./Weapon.js";
import DamageTypes from "../DamageTypes.js";

export default class Shortsword extends Weapon {
    getDamage() {
        return 4;
    }

    getRange() {
        return 1;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }
}
