import GameEvent from "./GameEvent.js";

export default class BuffAppliedEvent extends GameEvent {
    /**
      * @class BuffAppliedEvent
      * @description Fired whenever a buff (or debuff) is applied to a creature
      */
    constructor(dungeon, creature, buff) {
        super(dungeon);
        this._creature = creature;
        this._buff = buff;
    }

    getCreature() {
        return this._creature;
    }

    getBuff() {
        return this._buff;
    }

    getText() {
        return this.getBuff() + ' applied to ' + this.getCreature();
    }
}
