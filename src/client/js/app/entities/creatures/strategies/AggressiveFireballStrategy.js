import Strategy from './Strategy';
import Creature from '../Creature';
import Dungeon from '../../../dungeons/Dungeon';

import Moves from '../moves/Moves';

import Fireball from '../../../abilities/Fireball';

/**
 * @class AggressiveFireballStrategy
 */
export default class AggressiveFireballStrategy extends Strategy {
    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error('First parameter must be a Dungeon');
        } else if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        var creatureTile = dungeon.getTile(creature);
        var enemy = creature.getClosestEnemy(dungeon);
        var location = enemy && dungeon.getTile(enemy);
        if(!location && this._lastKnownEnemyLocation) {
            location = [this._lastKnownEnemyLocation].concat(this._lastKnownEnemyLocation.getNeighbors8(dungeon))
                .filter((tile)=>creature.canSee(dungeon, tile))
                .sort((tileA, tileB)=>creatureTile.getDirectDistance(tileA) - creatureTile.getDirectDistance(tileB))[0];
        }
        if(location) {
            var fireballIndex = creature.getAbilityIndex(Fireball);
            if(fireballIndex >= 0) {
                var move = new Moves.UseAbilityMove(dungeon.getTile(creature), fireballIndex, location.getX(), location.getY());
                if(!move.getReasonIllegal(dungeon, creature, location)) {
                    return move;
                }
            }
        }
        return null;
    }
}
