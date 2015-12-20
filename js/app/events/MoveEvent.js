import { default as Creature } from "../entities/creatures/Creature.js";
import { default as GameEvent } from "./GameEvent.js";

export default class MoveEvent extends GameEvent {
    /**
      * @class MoveEvent
      * @description Event fired whenever a Creature moves
      */
    constructor(dungeon, creature, x, y) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('First parameter must be a creature');
        } else if(isNaN(x) || isNaN(y)) {
            throw new Error('Second and third parameters must be numbers');
        }
        this._creature = creature;
        this._x = x;
        this._y = y;
    }

    getText() {
        return this._creature.toString() + ' moved to (' + this._x + ', ' + this._y + ')';
    }
}
