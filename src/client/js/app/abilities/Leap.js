import Ability from './Ability.js';
import GameEvents from '../events/GameEvents.js';

export default class Leap extends Ability {
    getReasonIllegal(dungeon, creature, optionalTargetTile) {
        var superReason = super.getReasonIllegal.apply(this, arguments);
        if(superReason) {
            return superReason;
        } else if(optionalTargetTile.getCreature()) {
            return 'Can\'t leap to occupied tile';
        } else {
            return null;
        }
    }

    use(dungeon, creature, optionalTargetTile, isFree) {
        super.use(dungeon, creature, optionalTargetTile, isFree);

        dungeon.getTile(creature).removeCreature();
        dungeon.setCreature(creature, optionalTargetTile.getX(), optionalTargetTile.getY()); // TODO: Make setCreature interface more intuitive
        dungeon.fireEvent(new GameEvents.PositionChangeEvent(dungeon, creature, optionalTargetTile.getX(), optionalTargetTile.getY()));
    }

    isTargetted() {
        return true;
    }

    isTargetCreature() {
        return false;
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
        return 'Leap over obstacles and enemies';
    }
}
