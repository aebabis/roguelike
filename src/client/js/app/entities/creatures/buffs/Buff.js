export default class Buff {
    constructor(dungeon) {
        this._creationTimestamp = dungeon.getCurrentTimestep();
    }

    getProperties() {
        throw new Error('Abstract method not implemented');
    }

    isNegative() {
        return false;
    }

    getDuration() {
        throw new Error('Abstract method not implemented');
    }

    getCreationTimestamp() {
        return this._creationTimestamp;
    }

    getTimeRemaining(dungeon) {
        return this.getDuration() - (dungeon.getCurrentTimestep() - this.getCreationTimestamp());
    }

    timestep(dungeon, creature) {
        throw new Error('Abstract method not implemented');
    }

    isDone(dungeon) {
        return this.getTimeRemaining(dungeon) <= 0;
    }

    getName() {
        // Split camelcasing
        return this.constructor.name.replace(/([^A-Z])([A-Z])/g, '$1 $2');
    }

    toString() {
        return this.constructor.name;
    }
}
