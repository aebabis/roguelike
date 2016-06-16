import Weapon from "./Weapon.js";

export default class Longsword extends Weapon {
    getDamage() {
        return 5;
    }

    getRange() {
        return 1;
    }
}
