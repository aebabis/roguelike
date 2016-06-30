import Consumable from './Consumable.js';
import GameEvents from '../../events/GameEvents.js';

export default class AbilityConsumable extends Consumable {
    constructor(ability, name) {
        super();
        this._ability = ability;
        this._name = name || ability.getName() + ' Scroll';
    }

    isTargetted() {
        return this._ability.isTargetted();
    }

    isTargetCreature() {
        return this._ability.isTargetCreature();
    }

    use(dungeon, creature, optionalTargetTile) {
        this._ability.use(dungeon, creature, optionalTargetTile, true);
        dungeon.fireEvent(new GameEvents.AbilityEvent(dungeon, creature, this._ability, optionalTargetTile));
    }

    getFriendlyDescription() {
        return `A scroll containing the ${this._ability.getName()} spell`;
    }

    getUseMessage(dungeon, creature) {
        return `${creature} used a ${this.getName()}`;
    }

    getName() {
        return this._name;
    }

    toString() {
        return this._ability.toString() + '_Consumable';
    }
}
