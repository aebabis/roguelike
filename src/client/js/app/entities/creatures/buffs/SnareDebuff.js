import Buff from './Buff';

export default class SnareDebuff extends Buff {
    constructor(dungeon, duration) {
        super(dungeon);
        this._duration = +duration;
    }

    getProperties() {
        return {
            preventsMovement: true
        };
    }

    isNegative() {
        return true;
    }

    getDuration() {
        return this._duration || 1000;
    }

    timestep() {
        // Do nothing
    }
}
