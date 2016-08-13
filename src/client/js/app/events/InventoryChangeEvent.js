import Creature from '../entities/creatures/Creature.js';
import GameEvent from './GameEvent.js';

export default class InventoryChangeEvent extends GameEvent {
    /**
      * @class InventoryChangeEvent
      * @description Event fired whenever a Creature's equipment changes
      * or is rearranged
      */
    constructor(dungeon, creature) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a creature');
        } /*else if(!(item instanceof Item)) {
            // TODO
        }*/
        this._creature = creature;
    }

    getCreature() {
        return this._creature;
    }

    getText() {
        var creature = this.getCreature();
        return `${creature}'s inventory modified`;
    }
}
