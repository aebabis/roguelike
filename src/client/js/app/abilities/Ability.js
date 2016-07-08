import Dungeon from '../dungeons/Dungeon.js';
import Creature from '../entities/creatures/Creature.js';
import Tile from '../tiles/Tile.js';

export default class Ability {
    /**
      * @class Ability
      * @description Represents a non-attack action that a creature can perform
      */
    constructor() {
    }

    getReasonIllegal(dungeon, creature, optionalTargetTile, isFree) {
        if(!(dungeon instanceof Dungeon)) {
            return 'No dungeon specified';
        } else if(!(creature instanceof Creature)) {
            return 'No creature specified';
        } else if(!isFree && this.getManaCost() > creature.getCurrentMana()) {
            return 'Not enough mana';
        } else if(this.isTargetted()) {
            if(!(optionalTargetTile instanceof Tile)) {
                return 'This ability requires a target tile';
            } else if(this.mustTargetBeVisible() && !creature.canSee(dungeon, optionalTargetTile)) {
                return 'Tile not visible';
            } else if(this.isTargetCreature() && !optionalTargetTile.getCreature()) {
                return 'Target tile has no creature';
            } else if(dungeon.getTile(creature).getEuclideanDistance(optionalTargetTile) > this.getRange()) {
                return 'Target not in range';
            } else if(this.getRange() > 0 && optionalTargetTile === dungeon.getTile(creature)) {
                return 'Not a self-target ability';
            }
        } else {
            return null;
        }
    }

    use(dungeon, creature, optionalTargetTile, isFree) {
        var reason  = this.getReasonIllegal(dungeon, creature, optionalTargetTile, isFree);
        if(reason) {
            throw new Error(reason);
        }
        if(!isFree) {
            creature.modifyMana(-this.getManaCost());
        }
    }

    isTargetted() {
        throw new Error('Abstract method not implemented');
    }

    isTargetCreature() {
        throw new Error('Abstract method not implemented');
    }

    isMovementAbility() {
        return false;
    }

    // By default, ability targets must be visible
    mustTargetBeVisible() {
        return true;
    }

    getRange() {
        // Default for self-target abilities
        return 0;
    }

    getManaCost() {
        throw new Error('Abstract method not implemented');
    }

    getName() {
        // Split camelcasing
        return this.constructor.name.replace(/([^A-Z])([A-Z])/g, '$1 $2');
    }

    getDescription() {
        throw new Error('Abstract method not implemented');
    }

    toString() {
        return this.constructor.name;
    }
}
