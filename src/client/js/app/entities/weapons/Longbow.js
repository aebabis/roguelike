import Weapon from "./Weapon.js";

export default class Longbow extends Weapon {
    getDamage() {
        return 4;
    }

    getRange() {
        return 7;
    }
}
