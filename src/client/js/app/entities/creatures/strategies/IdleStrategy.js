import Strategy from "./Strategy.js";
import Creature from "../Creature.js";
import Dungeon from "../../../dungeons/Dungeon.js";

import Moves from "../moves/Moves.js";

/**
 * @class IdleStrategy
 */
export default class IdleStrategy extends Strategy {
    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error("First parameter must be a Dungeon")
        } else if(!(creature instanceof Creature)) {
            throw new Error("Second parameter must be a Creature");
        }
        return new Moves.WaitMove(dungeon.getTile(creature));
    }

    observeMove(dungeon, observer, actor, move) {
        // Do nothing
    }
}
