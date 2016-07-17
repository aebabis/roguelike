import Strategy from './Strategy.js';
import Creature from '../Creature.js';
import Dungeon from '../../../dungeons/Dungeon.js';

import Moves from '../moves/Moves.js';

/**
 * @class ChaseStrategy
 * @description Causes monster to make melee attacks if able.
 * Does not cause movement
 */
export default class MeleeAttackStrategy extends Strategy {
    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error('First parameter must be a Dungeon');
        } else if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        var tile = dungeon.getTile(creature);
        var meleeWeapon = creature.getMeleeWeapon();
        if(!meleeWeapon || !meleeWeapon.isUseable()) {
            return null;
        }

        var enemyTiles = tile.getNeighbors8().filter((tile)=>{
            var otherCreature = tile.getCreature();
            return otherCreature && otherCreature.isEnemy(creature);
        });

        if(enemyTiles.length > 0) {
            return new Moves.AttackMove(tile, enemyTiles[0]);
        } else {
            return null;
        }
    }
}
