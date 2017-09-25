import Buff from './Buff.js';

export default class SlowDebuff extends Buff {
    /**
      * @class SlowDebuff
      * @description A debuff that increases the time between actions
      */
    constructor(dungeon, duration, factor = 1, modifier = 0, name = 'Slowed') {
        super(dungeon);
        this._duration = duration;
        this._factor = factor;
        this._modifier = modifier;
        this._name = name;
    }

    getProperties() {
        return {
            delayFactor: this.getDelayFactor(),
            delayModifier: this.getDelayModifier()
        };
    }

    getDuration() {
        return this._duration;
    }

    getDelayFactor() {
        return this._factor;
    }

    getDelayModifier() {
        return this._modifier;
    }

    getName() {
        return this._name;
    }

    isNegative() {
        return true;
    }

    timestep() {
    }
}
