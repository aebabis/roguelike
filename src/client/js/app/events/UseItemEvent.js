import Creature from '../entities/creatures/Creature.js';
import GameEvent from './GameEvent.js';

export default class UseItemEvent extends GameEvent {
    /**
      * @class UseItemEvent
      * @description Event fired whenever a Creature uses an item
      */
    constructor(dungeon, creature, item, optionalTargetTile) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a creature');
        } /*else if(!(item instanceof Item)) {
            // TODO
        }*/
        this._creature = creature;
        this._item = item;
        this._tile = optionalTargetTile;
        this._text = item.getUseMessage(dungeon, creature, optionalTargetTile);
    }

    getCreature() {
        return this._creature;
    }

    getItem() {
        return this._item;
    }

    getTile() {
        return this._tile || null;
    }

    getText() {
        return this._text;
    }
}
