import Dungeon from "../dungeons/Dungeon.js";
import CustomEvent from "../events/CustomEvent.js";

var idGen = 1;

export default class Entity {
    /**
      * @class Entity
      * @description Base class for entities that can occupy tiles
      */
    constructor() {
        this._id = idGen++;
    }

    getId() {
        return this._id;
    }

    isEquipable() {
        return false;
    }

    isItem() {
        return false;
    }

    getName() {
        // Split camelcasing
        return this.constructor.name.replace(/([^A-Z])([A-Z])/g, '$1 $2');
    }

    toString() {
        return this.constructor.name;
    }
}
