import Weapon from "./Weapon.js";

export default class Sling extends Weapon {
    getDamage() {
        return 2;
    }

    getRange() {
        return 3;
    }
}
