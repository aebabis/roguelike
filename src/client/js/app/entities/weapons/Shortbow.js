import Weapon from "./Weapon.js";

export default class Shortbow extends Weapon {
    getDamage() {
        return 3;
    }

    getRange() {
        return 5;
    }
}
