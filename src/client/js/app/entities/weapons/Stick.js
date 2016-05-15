import { default as Weapon } from "./Weapon.js";

export default class Stick extends Weapon {
    getDamage() {
        return 1;
    }

    getRange() {
        return 1;
    }
}
