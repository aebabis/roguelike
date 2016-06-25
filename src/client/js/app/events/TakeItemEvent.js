import Creature from "../entities/creatures/Creature.js";
import GameEvent from "./GameEvent.js";

export default class TakeItemEvent extends GameEvent {
    /**
      * @class MoveEvent
      * @description Event fired whenever a Creature moves
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
        return `${creature} picked up ${item.getName()}`;
    }
}
