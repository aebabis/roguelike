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
        var location = creature.getTile();
        this._from = Object.freeze({
            x: location.getX(),
            y: location.getY()
        });
        this._to = Object.freeze({
            x: x,
            y: y
        })
    }

    getCreature() {
        return this._creature;
    }

    getFromCoords() {
        return this._from;
    }

    getToCoords() {
        return this._to;
    }

    getText() {
        var to = this.getToCoords();
        return this._creature.toString() + ' moved to (' + to.x + ', ' + to.y + ')';
    }
}
