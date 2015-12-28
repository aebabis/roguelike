import { default as Weapon } from "./Weapon.js";

export default class Dagger extends Weapon {
    /**
      * @class Weapon
      * @description
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
