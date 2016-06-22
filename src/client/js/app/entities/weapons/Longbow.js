import Weapon from "./Weapon.js";
import DamageTypes from "../DamageTypes.js";

export default class Longbow extends Weapon {
    getDamage() {
        return 4;
    }

    getRange() {
        return 7;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }
}
