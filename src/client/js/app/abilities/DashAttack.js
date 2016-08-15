import Ability from './Ability.js';
import GameEvents from '../events/GameEvents.js';

function getToTile(dungeon, creature, optionalTargetTile) {
    // TODO: Base legal tiles on angle of approach (3 for ortogonal, 1 (?) for diagonal, 2 for other)
    var casterLocation = dungeon.getTile(creature);
    return optionalTargetTile.getNeighbors8().sort(function(tile1, tile2) {
        return tile1.getEuclideanDistance(casterLocation) - tile2.getEuclideanDistance(casterLocation);
    }).slice(0, 2).filter((tile) => !tile.getCreature())[0];
}

/**
 * @desc An {@link Ability} that enables a creature to move forward and melee
 * attack with the same action
 */
export default class DashAttack extends Ability {
    /** @override */
    getReasonIllegal(dungeon, creature, optionalTargetTile, isFree) {
        var superReason = super.getReasonIllegal.apply(this, arguments);
        if(superReason) {
            return superReason;
        } else if(dungeon.getTile(creature).getNeighbors8().includes(optionalTargetTile)) {
            return 'Can\'t use on adjacent enemy';
        } else if(!getToTile(dungeon, creature, optionalTargetTile, isFree)) {
            return 'No tile to dash to';
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

        dungeon.getTile(creature).removeCreature();
        dungeon.setCreature(creature, toTile.getX(), toTile.getY()); // TODO: Make setCreature interface more intuitive
        dungeon.fireEvent(new GameEvents.PositionChangeEvent(dungeon, creature, toTile.getX(), toTile.getY()));

        var target = optionalTargetTile.getCreature();
        var weapon = creature.getMeleeWeapon();
        var damage = target.receiveDamage(dungeon, weapon.getDamage(), weapon.getDamageType());
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
