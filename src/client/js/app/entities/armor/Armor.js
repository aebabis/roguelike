import Item from '../Item';

export default class Armor extends Item {
    /**
      * Base class for armor. Can be worn by player or enemy
      */
    isEquipable() {
        return true;
    }

    /**
     * Gets the damage reduction the armor provides against a given damage type
     */
    getReduction(type) {
        throw new Error('Abstract method not implemented');
    }
}
