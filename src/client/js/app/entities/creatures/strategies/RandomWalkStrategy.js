import Strategy from './Strategy';
import Creature from '../Creature';
import Dungeon from '../../../dungeons/Dungeon';

import Pather from './Pather';

/**
 * @class RandomWalkStrategy
 * @description Makes enemies move to a random adjacent tile each time they act
 */
export default class RandomWalkStrategy extends Strategy {
    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error('First parameter must be a Dungeon');
        } else if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        var tiles = dungeon.getTile(creature).getNeighbors8(dungeon).filter((tile)=>creature.canOccupyNow(tile));
        if(tiles.length) {
            var move = Pather.getMoveToward(dungeon, creature, Random.pick(dungeon.getRng(), tiles));
            if(!move.getReasonIllegal(dungeon, creature)) {
                return move;
            }
        }
        return null;
    }

    observeMove() {
    }
}
