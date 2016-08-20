var engine = Random.engines.mt19937().autoSeed();

export default class Entity {
    /**
      * @class Entity
      * @description Base class for entities that can occupy tiles
      */
    constructor() {
        this._id = Random.uuid4(engine);
    }

    getId() {
        return this._id;
    }

    isEquipable() {
        return false;
    }

    getFriendlyDescription() {
        throw new Error('Abstract method not implemented');
    }

    getName() {
        // Split camelcasing
        return this.constructor.name.replace(/([^A-Z])([A-Z])/g, '$1 $2');
    }

    toString() {
        return this.constructor.name;
    }
}
