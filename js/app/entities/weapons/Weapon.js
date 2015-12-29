import { default as Entity } from "../Entity.js";

export default class Weapon extends Entity {
    /**
      * @class Weapon
      * @description
      */
    constructor(dungeon) {
        super(dungeon);
    }

    getDamage() {
        throw new Error('Abstract method not implemented');
    }

    /**
     * Returns a number >= 1.
     * Exactly 1 means melee.
     */
    getRange() {
        throw new Error('Abstract method not implemented');
    }

    /**
     * Magical damage is less likely to be reduced
     */
    isMagical() {
        return false;
    }

    /**
     * False if the weapon is currently inoperable
     */
    isUseable() {
        return true;
    }
}
