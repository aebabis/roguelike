import { default as Tile } from "../tiles/Tile.js";

export default class Ability {
    /**
      * @class Ability
      * @description Represents a non-attack action that a creature can perform
      */
    constructor() {
    }

    getReasonIllegal(dungeon, creature, optionalTargetTile) {
        if(this.isTargetted() && !(optionalTargetTile instanceof Tile)) {
            return "This ability requires a target tile";
        }
        if(creature.getTile().getDirectDistance(optionalTargetTile) > this.getRange()) {
            return "Target not in range";
        }
        if(this.getManaCost() > creature.getCurrentMana()) {
            return "Not enough mana";
        }
        return null;
    }

    use(dungeon, creature, optionalTargetTile) {
        var reason  = this.getReasonIllegal(dungeon, creature, optionalTargetTile);
        if(reason) {
            throw new Error(reason);
        }
        creature.modifyMana(-this.getManaCost());
    }

    isTargetted() {
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
        return this.constructor.name.replace(/([^A-Z])(A-Z)/, '$1 $2');
    }

    getDescription() {
        throw new Error('Abstract method not implemented');
    }

    getCooldown() {
        throw new Error('Abstract method not implemented');
    }

    isOffCooldown(dungeon) {
        return dungeon.getCurrentTimestep() - this.lastUsed >= this.getCooldown();
    }

    onUse(dungeon) {
        this._lastUsed = dungeon.getCurrentTimestep();
    }

    toString() {
        return this.getName();
    }
}
