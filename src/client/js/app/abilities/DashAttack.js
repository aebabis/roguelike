import Ability from './Ability.js';
import GameEvents from '../events/GameEvents.js';

function getToTile(dungeon, creature, optionalTargetTile) {
    // TODO: Base legal tiles on angle of approach (3 for ortogonal, 1 (?) for diagonal, 2 for other)
    var casterLocation = dungeon.getTile(creature);
    return optionalTargetTile.getNeighbors8().sort(function(tile1, tile2) {
        return tile1.getEuclideanDistance(casterLocation) - tile2.getEuclideanDistance(casterLocation);
    }).slice(0, 2).filter((tile) => !tile.getCreature())[0];
}

export default class DashAttack extends Ability {
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

    isTargetted() {
        return true;
    }

    isTargetCreature() {
        return true;
    }

    isMovementAbility() {
        return true;
    }

    getRange() {
        return 3;
    }

    canTargetSelf() {
        return false;
    }

    getManaCost() {
        return 2;
    }

    getDescription() {
        return 'Dash to an enemy and make a melee attack';
    }
}
