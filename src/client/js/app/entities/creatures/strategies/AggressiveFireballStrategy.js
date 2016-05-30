import { default as Strategy } from "./Strategy.js";
import { default as Creature } from "../Creature.js";
import { default as Dungeon } from "../../../dungeons/Dungeon.js";

import { default as Moves } from "../moves/Moves.js";

import { default as Fireball } from "../../../abilities/Fireball.js";

/**
 * @class AggressiveFireballStrategy
 */
export default class AggressiveFireballStrategy extends Strategy {
    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error("First parameter must be a Dungeon")
        } else if(!(creature instanceof Creature)) {
            throw new Error("Second parameter must be a Creature");
        }
        if(this._lastKnownEnemyLocation) {
            var fireballIndex = creature.getAbilityIndex(Fireball);
            if(fireballIndex >= 0) {
                var move = new Moves.UseAbilityMove(fireballIndex, this._lastKnownEnemyLocation.getX(), this._lastKnownEnemyLocation.getY());
                if(!move.getReasonIllegal(dungeon, creature)) {
                    return move;
                }
            }
        }
        return null;
    }
}
