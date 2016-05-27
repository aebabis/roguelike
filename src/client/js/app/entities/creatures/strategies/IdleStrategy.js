import { default as Strategy } from "./Strategy.js";
import { default as Creature } from "../Creature.js";
import { default as Dungeon } from "../../../dungeons/Dungeon.js";

import { default as Moves } from "../moves/Moves.js";

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
        return new Moves.WaitMove();
    }

    observeMove(dungeon, observer, actor, move) {
        // Do nothing
    }
}
