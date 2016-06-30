import Tile from '../tiles/Tile.js';

export default class Ability {
    /**
      * @class Ability
      * @description Represents a non-attack action that a creature can perform
      */
    constructor() {
    }

    getReasonIllegal(dungeon, creature, optionalTargetTile, isFree) {
        if(this.isTargetted() && !(optionalTargetTile instanceof Tile)) {
            return 'This ability requires a target tile';
        }
        if(this.isTargetted() && this.isTargetCreature() && !optionalTargetTile.getCreature()) {
            return 'Target tile has no creature';
        }
        if(dungeon.getTile(creature).getDirectDistance(optionalTargetTile) > this.getRange()) {
            return 'Target not in range';
        }
        if(!isFree && this.getManaCost() > creature.getCurrentMana()) {
            return 'Not enough mana';
        }
        return null;
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
        return this.getName();
    }
}
