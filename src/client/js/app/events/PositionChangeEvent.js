import Creature from '../entities/creatures/Creature.js';
import GameEvent from './GameEvent.js';

export default class PositionChangeEvent extends GameEvent {
    /**
      * @class PositionChangeEvent
      * @description Event fired whenever a Creature moves, regardless of cause
      */
    constructor(dungeon, creature, x1, y1, x2, y2, cause) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a creature');
        } else if(!dungeon.getTile(x1, y1)) {
            throw new Error(`Illegal coordinates (${x1}, ${y1})`);
        } else if(!dungeon.getTile(x2, y2)) {
            throw new Error(`Illegal coordinates (${x2}, ${y2})`);
        }
        this._creature = creature;
        this._from = Object.freeze({
            x: x1,
            y: y1
        });
        this._to = Object.freeze({
            x: x2,
            y: y2
        });
        this._cause = cause;
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
    
    getCause() {
        return this._cause;
    }

    getText() {
        var to = this.getToCoords();
        return this._creature.getName() + ' position changed to (' + to.x + ', ' + to.y + ')';
    }

    isSeenBy(dungeon, creature) {
        var from = this.getFromCoords();
        var to = this.getToCoords();
        return creature.canSee(dungeon, dungeon.getTile(from.x, from.y)) ||
                creature.canSee(dungeon, dungeon.getTile(to.x, to.y));
    }
}
