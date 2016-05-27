import { default as Strategy } from "./Strategy.js";
import { default as Creature } from "../Creature.js";
import { default as Dungeon } from "../../../dungeons/Dungeon.js";

import { default as Moves } from "../moves/Moves.js";
import { default as Pather } from "./Pather.js";

/**
 * @class RandomWalkStrategy
 * @description Makes enemies move to a random adjacent tile each time they act
 */
export default class RandomWalkStrategy extends Strategy {
    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error("First parameter must be a Dungeon")
        } else if(!(creature instanceof Creature)) {
            throw new Error("Second parameter must be a Creature");
        }
        var tiles = creature.getTile().getNeighbors8().filter((tile)=>creature.canOccupy(tile) && !tile.getCreature());
        if(tiles.length) {
            return Pather.getMoveToward(dungeon, creature.getTile(), Random.pick(dungeon.getRng(), tiles));
        } else {
            return null;
        }
    }

    observeMove(dungeon, observer, actor, move) {
    }
}
