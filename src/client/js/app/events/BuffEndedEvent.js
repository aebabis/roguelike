import { default as GameEvent } from "./GameEvent.js";

export default class BuffEndedEvent extends GameEvent {
    /**
      * @class BuffEndedEvent
      * @description Fired whenever a buff (or debuff) ends on a creature
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
        return this.getBuff() + ' ended on ' + this.getCreature();
    }
}
