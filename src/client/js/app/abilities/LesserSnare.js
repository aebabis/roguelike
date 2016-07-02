import Ability from './Ability.js';
import SnareDebuff from '../entities/creatures/buffs/SnareDebuff.js';

var DURATION = 1500;

export default class LesserSnare extends Ability {
    use(dungeon, creature, optionalTargetTile, isFree) {
        super.use(dungeon, creature, optionalTargetTile, isFree);
        optionalTargetTile.getCreature().applyBuff(dungeon, new SnareDebuff(dungeon, DURATION));
    }

    isTargetted() {
        return true;
    }

    isTargetCreature() {
        return true;
    }

    getRange() {
        return 5;
    }

    getManaCost() {
        return 2;
    }

    getDescription() {
        return `Snares a target for ${DURATION / 1000} seconds (about 3 actions)`;
    }
}
