import { default as Item } from "../Item.js";

export default class Armor extends Item {
    /**
      * @class Armor
      * @description Base class for armor. Can be worn by player or enemy
      */
    constructor(dungeon) {
        super(dungeon);
    }

    isEquipable() {
        return true;
    }

    getPhysicalReduction() {
        throw new Error('Abstract method not implemented');
    }

    getMagicalReduction() {
        throw new Error('Abstract method not implemented');
    }
}
