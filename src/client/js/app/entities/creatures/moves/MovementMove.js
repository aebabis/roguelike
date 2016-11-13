import Move from './Move.js';

import GameEvents from '../../../events/GameEvents.js';

import PlayableCharacter from '../PlayableCharacter.js';

/**
 * @todo Only take two absolute coord params
 */
export default class MovementMove extends Move {
    constructor(actorTile, param1, param2) {
        super(actorTile);
        if(Number.isInteger(param1) && Number.isInteger(param2)
                && Math.abs(param1) <= 1 && Math.abs(param2) <= 1
                && (Math.abs(param1) === 1 || Math.abs(param2) === 1)) {
            this._dx = param1;
            this._dy = param2;
        } else {
            throw new Error('Must pass two integers that represent a move to an adjacent tile');
        }
    }

    getDx() {
        return this._dx;
    }

    getDy() {
        return this._dy;
    }

    getCostMultiplier() {
        return 1;
    }

    getReasonIllegal(dungeon, creature) {
        var tile = dungeon.getTile(creature);
        var x = tile.getX() + this.getDx();
        var y = tile.getY() + this.getDy();
        var newLocation = dungeon.getTile(x, y);
        if(!creature.canOccupy(newLocation)) {
            return `${creature} cannot legally occupy new location [${x}, ${y}]`;
        }
        if(creature.getBuffs().find((buff)=>buff.getProperties().preventsMovement)) {
            return 'A debuff is preventing movement';
        }
        var occupant = newLocation.getCreature();
        if(occupant) {
            return 'Cannot move to occupied tile';
        }
        return null;
    }

    execute(dungeon, creature) {
        var reason = this.getReasonIllegal(dungeon, creature);
        if(reason) {
            throw new Error(reason);
        }
        var tile = dungeon.getTile(creature);
        var x = tile.getX() + this.getDx();
        var y = tile.getY() + this.getDy();
        tile.removeCreature();
        dungeon.moveCreature(creature, x, y);
        dungeon.fireEvent(new GameEvents.MoveEvent(dungeon, creature, x, y));
        if(creature instanceof PlayableCharacter) {
            creature.takeItems(dungeon);
        }
    }

    isSeenBy(dungeon, observer) {
        var actorX = this.getActorX();
        var actorY = this.getActorY();
        return observer.canSee(dungeon, dungeon.getTile(actorX, actorY)) ||
                observer.canSee(dungeon, dungeon.getTile(actorX + this.getDx(), actorY + this.getDy()));
    }
}
