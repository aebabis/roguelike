import GameEvent from './GameEvent.js';

export default class WaitEvent extends GameEvent {
    /**
      * @class WaitEvent
      * @description Event fired whenever a Creature waits
      */
    constructor(dungeon, creature) {
        super(dungeon);
        this._creature = creature;
        var location = dungeon.getTile(creature);
        this._from = Object.freeze({
            x: location.getX(),
            y: location.getY()
        });
    }

    getCreature() {
        return this._creature;
    }

    getFromCoords() {
        return this._from;
    }

    getText() {
        return this.getCreature().getName() + ' waited';
    }

    isSeenBy(dungeon, creature) {
        var from = this.getFromCoords();
        return creature.canSee(dungeon, dungeon.getTile(from.x, from.y));
    }
}
