import Strategy from './Strategy.js';
import Creature from '../Creature.js';
import Dungeon from '../../../dungeons/Dungeon.js';

import Moves from '../moves/Moves.js';
import Pather from './Pather.js';

/**
 * @class ChaseStrategy
 * @description Simple strategy for chasing enemies
 */
export default class ChaseStrategy extends Strategy {
    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error('First parameter must be a Dungeon');
        } else if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        const tile = dungeon.getTile(creature);
        const enemies = creature.getVisibleEnemies(dungeon).sort(function(enemy1, enemy2) {
            const d1 = tile.getDirectDistance(dungeon.getTile(enemy1));
            const d2 = tile.getDirectDistance(dungeon.getTile(enemy2));
            if(d1 < d2) {
                return 1;
            } else if(d1 > d2) {
                return -1;
            } else {
                return 0;
            }
        });

        const attackableEnemy = enemies.find(function(enemy) {
            const move = new Moves.AttackMove(tile, dungeon.getTile(enemy));
            return !move.getReasonIllegal(dungeon, creature);
        });

        if(attackableEnemy) {
            return new Moves.AttackMove(tile, dungeon.getTile(attackableEnemy));
        } else {
            const mark = enemies.find(enemy => dungeon.getTile(enemy).getDirectDistance(tile) > 1);
            const target = mark ? dungeon.getTile(mark) : this._lastKnownEnemyLocation;
            if(target) {
                const move = Pather.getMoveToward(dungeon, creature, target);
                if(move && !move.getReasonIllegal(dungeon, creature)) {
                    return move;
                }
            }
        }

        return null;
    }
}
