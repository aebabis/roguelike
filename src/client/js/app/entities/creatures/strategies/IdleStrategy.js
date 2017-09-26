import Strategy from './Strategy';
import Creature from '../Creature';
import Dungeon from '../../../dungeons/Dungeon';

import Moves from '../moves/Moves';

/**
 * @class IdleStrategy
 */
export default class IdleStrategy extends Strategy {
    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error('First parameter must be a Dungeon');
        } else if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        return new Moves.WaitMove(dungeon.getTile(creature));
    }

    observeMove() {
        // Do nothing
    }
}
