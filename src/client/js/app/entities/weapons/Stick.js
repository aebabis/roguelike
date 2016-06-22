import Weapon from "./Weapon.js";
import DamageTypes from "../DamageTypes.js";

export default class Stick extends Weapon {
    getDamage() {
        return 2;
    }

    getRange() {
        return 1;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }
}
