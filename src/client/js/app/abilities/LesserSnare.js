import Ability from './Ability';
import SnareDebuff from '../entities/creatures/buffs/SnareDebuff';

var DURATION = 1500;

/** Prevents target from using movement abilities for a duration */
export default class LesserSnare extends Ability {
    /** Targetted creature will be unable to move or use movement abilities
     * for the duration */
    use(dungeon, creature, optionalTargetTile, isFree) {
        super.use(dungeon, creature, optionalTargetTile, isFree);
        optionalTargetTile.getCreature().applyBuff(dungeon, new SnareDebuff(dungeon, DURATION));
    }

    /** @override */
    isTargetted() {
        return true;
    }

    /** @override */
    isTargetCreature() {
        return true;
    }

    /** @override */
    getRange() {
        return 5;
    }

    /** @override */
    getManaCost() {
        return 2;
    }

    /** @override */
    getDescription() {
        return `Snares a target for ${DURATION / 1000} seconds (about 3 actions)`;
    }
}
