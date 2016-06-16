import Weapon from "./Weapon.js";

export default class Shortsword extends Weapon {
    getDamage() {
        return 4;
    }

    getRange() {
        return 1;
    }
}
