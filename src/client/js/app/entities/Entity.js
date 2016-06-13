import { default as Dungeon } from "../dungeons/Dungeon.js";
import { default as CustomEvent } from "../events/CustomEvent.js";

var idGen = 1;

export default class Entity {
    /**
      * @class Entity
      * @description Base class for entities that can occupy tiles
      */
    constructor(dungeon) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error('Must pass a dungeon as the first parameter');
        }
        this._id = idGen++;
        this._dungeon = dungeon;
    }

    getId() {
        return this._id;
    }

    getDungeon() {
        return this._dungeon;
    }

    isEquipable() {
        return false;
    }

    isItem() {
        return false;
    }

    getTile() {
        return this.getDungeon().getTile(this);
    }

    getName() {
        // Split camelcasing
        return this.constructor.name.replace(/([^A-Z])([A-Z])/g, '$1 $2');
    }

    toString() {
        return this.constructor.name;
    }
}
