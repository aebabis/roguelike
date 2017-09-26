import Creature from '../entities/creatures/Creature';
import GameEvent from './GameEvent';

export default class EquipItemEvent extends GameEvent {
    /**
      * @class EquipItemEvent
      * @description Event fired whenever a Creature equips an item
      */
    constructor(dungeon, creature, item) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a creature');
        } /*else if(!(item instanceof Item)) {
            // TODO
        }*/
        this._creature = creature;
        this._item = item;
    }

    getCreature() {
        return this._creature;
    }

    getItem() {
        return this._item;
    }

    getText() {
        var creature = this.getCreature();
        var item = this.getItem();
        return `${creature} equipped ${item.getName()}`;
    }
}
