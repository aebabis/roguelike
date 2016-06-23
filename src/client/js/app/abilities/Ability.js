import Tile from "../tiles/Tile.js";
import Consumable from "../entities/consumables/Consumable.js";
import GameEvents from "../events/GameEvents.js";

class Ability {
    /**
      * @class Ability
      * @description Represents a non-attack action that a creature can perform
      */
    constructor() {
    }

    getReasonIllegal(dungeon, creature, optionalTargetTile, isFree) {
        if(this.isTargetted() && !(optionalTargetTile instanceof Tile)) {
            return "This ability requires a target tile";
        }
        if(this.isTargetted() && this.isTargetCreature() && !optionalTargetTile.getCreature()) {
            return "Target tile has no creature";
        }
        if(dungeon.getTile(creature).getDirectDistance(optionalTargetTile) > this.getRange()) {
            return "Target not in range";
        }
        if(!isFree && this.getManaCost() > creature.getCurrentMana()) {
            return "Not enough mana";
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

class AbilityConsumable extends Consumable {
    constructor(ability, name) {
        super();
        this._ability = ability;
        this._name = name;
    }

    isTargetted() {
        return this._ability.isTargetted();
    }

    use(dungeon, creature, optionalTargetTile) {
        this._ability.use(dungeon, creature, optionalTargetTile, true);
        dungeon.fireEvent(new GameEvents.AbilityEvent(dungeon, creature, this._ability, optionalTargetTile));
    }

    getFriendlyDescription() {
        return `A scroll containing the ${this._ability.getName()} spell`;
    }

    getUseMessage(dungeon, creature, optionalTargetTile) {
        return `${creature} used a ${this.getName()}`;
    }

    getName() {
        return this._name;
    }

    toString() {
        return this._ability.toString() + '_Consumable';
    }
}

Ability.asConsumable = function() {
    var ability = new this();
    return new AbilityConsumable(ability, ability.getName() + ' Scroll');
}

export default Ability;
