import Ability from './Ability.js';

/** Lets user jump over enemies and obstacles to a nearby tile */
export default class Leap extends Ability {
    /** @override */
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

    /** Moves the creature over open spaces and creatures (but not through walls)
     * to a visible tile within 3 spaces */
    use(dungeon, creature, optionalTargetTile, isFree) {
        super.use(dungeon, creature, optionalTargetTile, isFree);
        dungeon.moveCreature(creature, optionalTargetTile.getX(), optionalTargetTile.getY()); // TODO: Make setCreature interface more intuitive
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
        return 'Leap over obstacles and enemies';
    }
}
