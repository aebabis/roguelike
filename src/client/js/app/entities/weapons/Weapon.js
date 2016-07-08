import Item from '../Item.js';

export default class Weapon extends Item {
    /**
      * @class Weapon
      * @description Base class for a weapon. Can be wielded by player or enemy
      */
    isEquipable() {
        return true;
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
    getDamageType() {
        throw new Error('Abstract method not implemented');
    }

    /**
     * False if the weapon is currently inoperable
     */
    isUseable() {
        return true;
    }

    onAttack(dungeon, attacker, defender) {
        // Do nothing
    }

    onHit(dungeon, attacker, defender) {
        // Do nothing
    }
}
