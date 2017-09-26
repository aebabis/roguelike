import GameEvent from './GameEvent';

import Creature from '../entities/creatures/Creature';

export default class ZeroDamageEvent extends GameEvent {
    constructor(dungeon, creature, cause, type) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        if(typeof type !== 'string') {
            throw new Error('Third parameter must be a string');
        }
        this._creature = creature;
        this._cause = cause;
        this._type = type;
    }

    /**
     * @function getCreature()
     * @memberof ZeroDamageEvent
     * @return {Creature}
     */
    getCreature() {
        return this._creature;
    }

    /**
     * Gets the source of attempted damage
     * @return {Object}
     */
    getCause() {
        return this._cause;
    }

    getDamageType() {
        return this._type;
    }

    /**
     * @function getText()
     * @memberof ZeroDamageEvent
     * @description A text description of the event
     * @return {String}
     */
    getText() {
        var creature = this.getCreature();
        return `${creature} took no damage`;
    }
}
