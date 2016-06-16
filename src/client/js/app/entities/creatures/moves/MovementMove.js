import Tile from "../../../tiles/Tile.js";

import Move from "./Move.js";

import GameEvents from "../../../events/GameEvents.js";

import PlayableCharacter from "../PlayableCharacter.js";

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
        if(creature.getBuffs().length) {
            console.log('BUFFS', creature, creature.getBuffs(), creature.getBuffs().map((buff)=>buff.getProperties()));
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
        dungeon.setCreature(creature, x, y);
        dungeon.fireEvent(new GameEvents.MoveEvent(dungeon, creature, x, y));
        if(creature instanceof PlayableCharacter) {
            var newLocation = dungeon.getTile(x, y);
            newLocation.getItems().forEach(function(item) {
                if(creature.canAddItem(item)) {
                    newLocation.removeItem(item);
                    creature.addItem(item);
                    dungeon.fireEvent(new GameEvents.TakeItemEvent(dungeon, creature, item));
                }
            });
        }
    }

    isSeenBy(dungeon, actor, observer) {
        var actorTile = dungeon.getTile(actor);
        var actorX = actorTile.getX();
        var actorY = actorTile.getY();
        return observer.canSee(dungeon, actorTile) ||
                observer.canSee(dungeon, dungeon.getTile(actorX + this._dx, actorY + this._dy));
    }
};
