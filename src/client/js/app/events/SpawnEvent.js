import Creature from '../entities/creatures/Creature.js';
import GameEvent from './GameEvent.js';

export default class SpawnEvent extends GameEvent {
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

    getCreature() {
        return this._creature;
    }

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }

    getText() {
        return this._creature.getName() + ' spawned at (' + this.getX() + ', ' + this.getY() + ')';
    }

    isSeenBy(dungeon, creature) {
        return creature.canSee(dungeon, dungeon.getTile(this.getX(), this.getY()));
    }
}
