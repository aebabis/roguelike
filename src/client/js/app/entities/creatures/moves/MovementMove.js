import Move from './Move.js';

import GameEvents from '../../../events/GameEvents.js';

/**
 * @todo Only take two absolute coord params
 */
export default class MovementMove extends Move {
    constructor(actorTile, x, y) {
        super(actorTile);
        if(Number.isInteger(x) && Number.isInteger(y)) {
            this._x = x;
            this._y = y;
        } else {
            throw new Error('Must pass two integers');
        }
    }

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }

    getCostMultiplier() {
        return 1;
    }

    getReasonIllegal(dungeon, creature) {
        const tile = dungeon.getTile(creature);
        const x = this.getX();
        const y = this.getY();
        const adx = Math.abs(x - tile.getX());
        const ady = Math.abs(y - tile.getY());
        const newLocation = dungeon.getTile(x, y);
        if(!newLocation) {
            return `Tile [${x}, ${y}] does not exist`;
        }
        if(adx > 1 || ady > 1 || (adx === 0 && ady === 0)) {
            return `New location [${x}, ${y}] is not an adjacent tile`;
        }
        if(!creature.canOccupy(newLocation)) {
            return `${creature} cannot legally occupy new location [${x}, ${y}]`;
        }
        if(creature.getBuffs().find((buff)=>buff.getProperties().preventsMovement)) {
            return 'A debuff is preventing movement';
        }
        const occupant = newLocation.getCreature();
        if(occupant) {
            return 'Cannot move to occupied tile';
        }
        return null;
    }

    execute(dungeon, creature) {
        const reason = this.getReasonIllegal(dungeon, creature);
        if(reason) {
            throw new Error(reason);
        }
        const tile = dungeon.getTile(creature);
        const x = this.getX();
        const y = this.getY();
        let previouslySeenTiles;
        if(creature.getFaction() === 'Player') {
            previouslySeenTiles = creature.getVisibleTiles(dungeon);
        }
        tile.removeCreature();
        dungeon.moveCreature(creature, x, y, this);
        dungeon.fireEvent(new GameEvents.MoveEvent(dungeon, creature, x, y));
        if(creature.getFaction() === 'Player') {
            dungeon.fireEvent(new GameEvents.VisibilityChangeEvent(
                dungeon, creature, previouslySeenTiles, creature.getVisibleTiles(dungeon)
            ));
        }
    }

    isSeenBy(dungeon, observer) {
        const actorX = this.getActorX();
        const actorY = this.getActorY();
        return observer.canSee(dungeon, dungeon.getTile(actorX, actorY)) ||
                observer.canSee(dungeon, dungeon.getTile(this.getX(), this.getY()));
    }
}
