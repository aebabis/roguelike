import Ability from './Ability.js';
import DamageTypes from '../entities/DamageTypes.js';

const AMOUNT = 3;

/**
 * Shoots a bolt of fire at an enemy
 */
export default class Firebolt extends Ability {
    /** Does 3 fire damage to a target within 5 tiles */
    use(dungeon, creature, optionalTargetTile, isFree) {
        super.use(dungeon, creature, optionalTargetTile, isFree);
        optionalTargetTile.getCreature().receiveDamage(dungeon, AMOUNT, DamageTypes.FIRE);
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
        return `Does ${AMOUNT} fire damage to a target`;
    }
}
