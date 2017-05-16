import GameEvent from './GameEvent.js';

import Creature from '../entities/creatures/Creature.js';

export default class HitpointsEvent extends GameEvent {
    /**
      * @class HitpointsEvent
      */
    constructor(dungeon, creature, cause, amount, type) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        if(!Number.isInteger(amount)) {
            throw new Error('Third parameter must be an integer');
        }
        this._creature = creature;
        this._cause = cause;
        this._amount = amount;
        this._type = type || null;
    }

    /**
     * @function getCreature()
     * @memberof HitpointsEvent
     * @return {Creature}
     */
    getCreature() {
        return this._creature;
    }

    /**
     * Gets the cause of the hitpoints changing
     * @return {Object}
     */
    getCause() {
        return this._cause;
    }

    getAmount() {
        return this._amount;
    }

    getDamageType() {
        return this._type;
    }

    /**
     * @function getText()
     * @memberof HitpointsEvent
     * @description A text description of the event
     * @return {String}
     */
    getText() {
        var creature = this.getCreature();
        var amount = this.getAmount();
        return `${creature} HP modified by ${amount}`;
    }
}
