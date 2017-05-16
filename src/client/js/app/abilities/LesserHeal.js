import Ability from './Ability.js';

var HEAL_AMOUNT = 2;

/** Heals a small amount of HP */
export default class LesserHeal extends Ability {
    /** Restores 2 HP to the caster or a creature within 5 spaces */
    use(dungeon, creature, optionalTargetTile, isFree) {
        super.use(dungeon, creature, optionalTargetTile, isFree);
        optionalTargetTile.getCreature().heal(dungeon, this, HEAL_AMOUNT);
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
        return `Heals target for ${HEAL_AMOUNT} HP`;
    }
}
