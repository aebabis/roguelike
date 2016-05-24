import { default as Weapon } from "./Weapon.js";

export default class Dagger extends Weapon {
    getDamage() {
        return 3;
    }

    getRange() {
        return 1;
    }
}
