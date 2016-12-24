import Ability from './Ability.js';
import GameEvents from '../events/GameEvents.js';

function getToTile(dungeon, creature, optionalTargetTile) {
    const casterLocation = dungeon.getTile(creature);
    return optionalTargetTile.getNeighbors8(dungeon).sort(function(tile1, tile2) {
        return tile1.getEuclideanDistance(casterLocation) - tile2.getEuclideanDistance(casterLocation);
    })[0];
}

/**
 * @desc An {@link Ability} that enables a creature to move forward and melee
 * attack with the same action
 */
export default class DashAttack extends Ability {
    /** @override */
    getReasonIllegal(dungeon, creature, optionalTargetTile, isFree) {
        const superReason = super.getReasonIllegal.apply(this, arguments);
        const toTile = getToTile(dungeon, creature, optionalTargetTile, isFree);
        if(superReason) {
            return superReason;
        } else if(dungeon.getTile(creature).getNeighbors8(dungeon).includes(optionalTargetTile)) {
            return 'Can\'t use on adjacent enemy';
        } else if(!toTile) {
            return 'No tile to dash to';
        } else if(toTile.isSolid()) {
            return 'Wall blocking path';
        } else if(!toTile.hasFloor()) {
            return 'No floor to land on';
        } else if(toTile.getCreature()) {
            return 'Another creature is blocking the path';
        } else if(!creature.getMeleeWeapon()) {
            return 'No melee weapon to attack with';
        } else {
            return null;
        }
    }

    /**
     * @desc Causes the creature to move the the closest tile the is adjacent
     * to the target tile and attack the occupant with its melee weapon
     */
    use(dungeon, creature, optionalTargetTile, isFree) {
        super.use(dungeon, creature, optionalTargetTile, isFree);
        let toTile = getToTile(dungeon, creature, optionalTargetTile);

        dungeon.moveCreature(creature, toTile.getX(), toTile.getY());

        var target = optionalTargetTile.getCreature();
        var weapon = creature.getMeleeWeapon();
        var damage = target.receiveDamage(dungeon, weapon.getDamage(), weapon.getDamageType());
        weapon.onAttack(dungeon, creature, target);
        if(damage > 0) {
            weapon.onHit(dungeon, creature, target);
        }
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
    isMovementAbility() {
        return true;
    }

    /** @override */
    getRange() {
        return 3;
    }

    /** @override */
    canTargetSelf() {
        return false;
    }

    /** @override */
    getManaCost() {
        return 2;
    }

    /** @override */
    getDescription() {
        return 'Dash to an enemy and make a melee attack';
    }
}
