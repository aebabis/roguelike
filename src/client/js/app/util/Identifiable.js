let getUuid = (function () {
    let engine;
    return function() {
        engine = Random.engines.mt19937().autoSeed();
        getUuid = function() {
            return Random.uuid4(engine);
        };
        return getUuid();
    };
}());

/**
 * Base class for objects that receive a default ID
 */
export default class Identifiable {
    /**
      * @class Entity
      * @description Base class for entities that can occupy tiles
      */
    constructor() {
        this._id = getUuid();
    }

    /**
     * Get UUID for this object
     */
    getId() {
        return this._id;
    }

    /**
     * Gets the name of this object
     */
    getName() {
        // Split camelcasing
        return this.constructor.name.replace(/([^A-Z])([A-Z])/g, '$1 $2');
    }

    /**
     * Gets a string representation of this object
     */
    toString() {
        return this.constructor.name;
    }
}

