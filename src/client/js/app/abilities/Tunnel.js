import Ability from './Ability';
import Tiles from '../tiles/Tiles';

/** Lets user jump over enemies and obstacles to a nearby tile */
export default class Tunnel extends Ability {
    /** @override */
    getReasonIllegal(dungeon, creature, optionalTargetTile) {
        var superReason = super.getReasonIllegal.apply(this, arguments);
        if(superReason) {
            return superReason;
        } else if(!optionalTargetTile.isSolid()) {
            return 'Must tunnel through a solid tile';
        } else if(optionalTargetTile.getCreature()) {
            return 'Can\'t tunnel an occupied tile';
        } else {
            return null;
        }
    }

    /** Moves the creature over open spaces and creatures (but not through walls)
     * to a visible tile within 3 spaces */
    use(dungeon, creature, optionalTargetTile, isFree) {
        super.use(dungeon, creature, optionalTargetTile, isFree);
        const x = optionalTargetTile.getX();
        const y = optionalTargetTile.getY();
        dungeon.setTile(new Tiles.Tile(x, y), x, y);
        dungeon.moveCreature(creature, x, y, this);
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
        return 1;
    }

    /** @override */
    canTargetSelf() {
        return false;
    }

    /** @override */
    getManaCost() {
        return 1;
    }

    /** @override */
    getDescription() {
        return 'Tunnel through walls';
    }
}
