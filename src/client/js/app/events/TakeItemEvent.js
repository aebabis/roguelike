import Creature from '../entities/creatures/Creature.js';
import GameEvent from './GameEvent.js';

export default class TakeItemEvent extends GameEvent {
    /**
      * @class MoveEvent
      * @description Event fired whenever a Creature takes an item
      */
    constructor(dungeon, creature, item) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a creature');
        }
        this._creature = creature;
        this._tile = dungeon.getTile(creature);
        this._item = item;
    }

    getCreature() {
        return this._creature;
    }

    getTile() {
        return this._tile;
    }

    getItem() {
        return this._item;
    }

    getText() {
        var creature = this.getCreature();
        var item = this.getItem();
        return `${creature} picked up ${item.getName()}`;
    }
}
