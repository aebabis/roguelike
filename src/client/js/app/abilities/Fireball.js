import Ability from './Ability.js';
import DamageTypes from '../entities/DamageTypes.js';

const AMOUNT = 5;

/**
  * Deals fire damage in a 3x3 area
  */
export default class Fireball extends Ability {
    /** Deals fire damage to creature in target tile (if any), and to each
      * creature on adjacent tiles. */
    use(dungeon, creature, optionalTargetTile, isFree) {
        super.use(dungeon, creature, optionalTargetTile, isFree);
        optionalTargetTile.getNeighbors8().concat(optionalTargetTile)
                .map((tile)=>tile.getCreature()).filter(Boolean)
                .forEach(function(creature) {
                    creature.receiveDamage(dungeon, AMOUNT, DamageTypes.FIRE);
                });
    }

    /** @override */
    isTargetted() {
        return true;
    }

    /** @override */
    isTargetCreature() {
        return false;
    }

    /** @override */
    getRange() {
        return 5;
    }

    /** @override */
    getManaCost() {
        return 8;
    }

    /** @override */
    getDescription() {
        return `Does ${AMOUNT} fire damage to creatures in a 3x3 area.`;
    }
}
