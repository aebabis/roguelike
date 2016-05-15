import { default as Tile } from "../../../tiles/Tile.js";

import { default as Move } from "./Move.js";

import { default as MoveEvent } from "../../../events/MoveEvent.js";

export default Move.MovementMove = class MovementMove extends Move {
    constructor(param1, param2) {
        super();
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

    isLegal() {
        throw new Error('Abstract method not implemented');
    }

    getCostMultiplier() {
        return 1;
    }

    execute(dungeon, creature) {
        var tile = dungeon.getTile(creature);
        var x = tile.getX() + this._dx;
        var y = tile.getY() + this._dy;
        var newLocation = dungeon.getTile(x, y);
        if(!creature.canOccupy(newLocation)) {
            throw new Error(`${creature} cannot legally occupy new location [${x}, ${y}]`);
        }
        var occupant = newLocation.getCreature();
        if(occupant) {
            throw new Error('Cannot move to occupied tile', occupant);
        }
        tile.removeCreature();
        dungeon.setCreature(creature, x, y);
        dungeon.fireEvent(new MoveEvent(dungeon, creature, x, y));
    }

    isSeenBy(dungeon, actor, observer) {
        var actorTile = actor.getTile();
        var actorX = actorTile.getX();
        var actorY = actorTile.getY();
        return observer.canSee(actorTile) ||
                observer.canSee(dungeon.getTile(actorX + this._dx, actorY + this._dy));
    }
};
