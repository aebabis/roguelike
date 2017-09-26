import Identifiable from '../util/Identifiable';

export default class Entity extends Identifiable {
    /**
      * @class Entity
      * @description Base class for entities that can occupy tiles
      */
    constructor() {
        super();
    }

    isEquipable() {
        return false;
    }

    getFriendlyDescription() {
        throw new Error('Abstract method not implemented');
    }
}
