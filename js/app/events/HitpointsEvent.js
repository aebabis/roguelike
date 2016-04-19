import { default as GameEvent } from './GameEvent.js';

import { default as Dungeon } from '../dungeons/Dungeon.js';
import { default as Creature } from '../entities/creatures/Creature.js';

export default class HitpointsEvent extends GameEvent {
    /**
      * @class HitpointsEvent
      */
    constructor(dungeon, creature, amount) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        if(!Number.isInteger(amount)) {
            throw new Error('Third parameter must be an integer');
        }
        this._creature = creature;
        this._amount = amount;
    }

    /**
     * @function getCreature()
     * @returns {Creature}
     */
    getCreature() {
        return this._creature;
    }

    getAmount() {
        return this._amount;
    }

    /**
     * @function getText()
     * @description A text description of the event
     * @returns {String}
     */
    getText() {
        var creature = this.getCreature();
        var amount = this.getAmount();
        return `${creature} HP modified by ${amount}`;
    }
}
