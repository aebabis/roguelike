import Weapon from "./Weapon.js";

export default class Stick extends Weapon {
    getDamage() {
        return 2;
    }

    getRange() {
        return 1;
    }
}
