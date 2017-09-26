import GameEvent from './GameEvent';

import Creature from '../entities/creatures/Creature';

export default class DeathEvent extends GameEvent {
    constructor(dungeon, creature) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        this._creature = creature;
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
     * @function getText()
     * @memberof HitpointsEvent
     * @description A text description of the event
     * @return {String}
     */
    getText() {
        var creature = this.getCreature();
        return `${creature} died`;
    }
}
