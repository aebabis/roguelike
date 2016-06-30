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
        var tile = dungeon.getTile(creature);
        var meleeWeapon = creature.getMeleeWeapon();
        var rangedWeapon = creature.getRangedWeapon();
        var enemies = creature.getVisibleEnemies(dungeon).sort(function(enemy1, enemy2) {
            var d1 = tile.getDirectDistance(dungeon.getTile(enemy1));
            var d2 = tile.getDirectDistance(dungeon.getTile(enemy2));
            if(d1 < d2) {
                return 1;
            } else if(d1 > d2) {
                return -1;
            } else {
                return 0;
            }
        });

        var meleeTarget;
        var rangedTarget;

        if(enemies[0] && dungeon.getTile(enemies[0]).getDirectDistance(tile) === 1) {
            meleeTarget = enemies[0];
        }
        rangedTarget = enemies.find(function(enemy) {
            return tile.getDirectDistance(dungeon.getTile(enemy)) > 1;
        });

        if(meleeTarget) {
            if(meleeWeapon) {
                return new Moves.AttackMove(tile, dungeon.getTile(meleeTarget));
            }
        } else if(rangedTarget) {
            if(rangedWeapon && rangedWeapon.getRange() >= tile.getDirectDistance(dungeon.getTile(rangedTarget))) {
                return new Moves.AttackMove(tile, dungeon.getTile(rangedTarget));
            } else {
                let move = Pather.getMoveToward(dungeon, tile, dungeon.getTile(rangedTarget));
                if(move && !move.getReasonIllegal(dungeon, creature)) {
                    return move;
                }
            }
        } else if(this._lastKnownEnemyLocation) {
            // TODO: Write a unit test for waiting when there's no path
            let move = Pather.getMoveToward(dungeon, tile, this._lastKnownEnemyLocation);
            if(move && !move.getReasonIllegal(dungeon, creature)) {
                return move;
            }
        }

        return null;
    }
}
