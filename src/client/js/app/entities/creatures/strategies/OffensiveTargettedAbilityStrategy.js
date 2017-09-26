
import Strategy from './Strategy';
import Creature from '../Creature';
import Dungeon from '../../../dungeons/Dungeon';

import Moves from '../moves/Moves';

/**
 * @class OffensiveTargettedAbilityStrategy
 */
export default class OffensiveTargettedAbilityStrategy extends Strategy {
    constructor(AbilityClass){
        super();
        this._AbilityClass = AbilityClass;
    }
    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error('First parameter must be a Dungeon');
        } else if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        var enemy = creature.getClosestEnemy(dungeon);
        var location = enemy && dungeon.getTile(enemy);
        if(location) {
            var abilityIndex = creature.getAbilityIndex(this._AbilityClass);
            if(abilityIndex >= 0) {
                var move = new Moves.UseAbilityMove(dungeon.getTile(creature), abilityIndex, location.getX(), location.getY());
                if(!move.getReasonIllegal(dungeon, creature, location)) {
                    return move;
                }
            }
        }
        return null;
    }
}
