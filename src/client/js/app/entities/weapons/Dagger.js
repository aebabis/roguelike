import { default as Weapon } from "./Weapon.js";

export default class Dagger extends Weapon {
    /**
      * @class Weapon
      * @description Low damage melee weapons
      */
    constructor(dungeon) {
        super(dungeon);
    }

    getDamage() {
        return 2;
    }

    getRange() {
        return 1;
    }
}
