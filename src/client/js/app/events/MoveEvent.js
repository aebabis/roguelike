import Creature from '../entities/creatures/Creature';
import GameEvent from './GameEvent';

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
        var location = dungeon.getTile(creature);
        this._from = Object.freeze({
            x: location.getX(),
            y: location.getY()
        });
        this._to = Object.freeze({
            x: x,
            y: y
        });
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
        return this._creature.getName() + ' moved to (' + to.x + ', ' + to.y + ')';
    }

    isSeenBy(dungeon, creature) {
        var from = this.getFromCoords();
        var to = this.getToCoords();
        return creature.canSee(dungeon, dungeon.getTile(from.x, from.y)) ||
                creature.canSee(dungeon, dungeon.getTile(to.x, to.y));
    }
}
