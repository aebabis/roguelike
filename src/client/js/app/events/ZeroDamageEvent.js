import GameEvent from './GameEvent.js';

import Creature from '../entities/creatures/Creature.js';

export default class ZeroDamageEvent extends GameEvent {
    constructor(dungeon, creature, type) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        if(typeof type !== 'string') {
            throw new Error('Third parameter must be a string');
        }
        this._creature = creature;
        this._type = type;
    }

    /**
     * @function getCreature()
     * @memberof ZeroDamageEvent
     * @returns {Creature}
     */
    getCreature() {
        return this._creature;
    }

    getDamageType() {
        return this._type;
    }

    /**
     * @function getText()
     * @memberof ZeroDamageEvent
     * @description A text description of the event
     * @returns {String}
     */
    getText() {
        var creature = this.getCreature();
        return `${creature} took no damage`;
    }
}
