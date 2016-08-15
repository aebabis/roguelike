import Ability from './Ability.js';
import DamageTypes from '../entities/DamageTypes.js';

/**
 * Shoots at a dart of magical energy at an enemy
 */
export default class ForceDart extends Ability {
    /** Does 2 energy damage to a target within 5 tiles */
    use(dungeon, creature, optionalTargetTile, isFree) {
        super.use(dungeon, creature, optionalTargetTile, isFree);
        optionalTargetTile.getCreature().receiveDamage(dungeon, 2, DamageTypes.ENERGY);
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
        return 1;
    }

    /** @override */
    getDescription() {
        return 'Does 2 magic damage to a target';
    }
}
