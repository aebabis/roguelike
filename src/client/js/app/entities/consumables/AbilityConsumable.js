import Consumable from './Consumable.js';
import GameEvents from '../../events/GameEvents.js';

export default class AbilityConsumable extends Consumable {
    /**
     * A consumable item that invokes an ability when activated
     * @param {Ability} ability - The contained Ability
     * @param {String} [name] - The name of the item
     */
    constructor(ability, name) {
        super();
        this._ability = ability;
        this._name = name || ability.getName() + ' Scroll';
    }

    /**
     * Gets the ability performed by using this consumable
     * @return {Ability}
     */
    getAbility() {
        return this._ability;
    }

    /**
     * Tells whether the consumable's ability is targetted
     * @return {boolean} `true` if the consumable and ability require a target;
     * `false` if the item is used without need of a target
     */
    isTargetted() {
        return this._ability.isTargetted();
    }

    /**
     * Tells whether the the consumable's ability's target must
     * be a creature. Only relevant for targetted abilities
     * @return {boolean} `true` if the targetted tile must contain a creature;
     * `false` otherwise
     */
    isTargetCreature() {
        return this._ability.isTargetCreature();
    }

    /**
     * Gets the range of the consumable's ability
     * @return {number} The maximum distance the consumable may target
     */
    getRange() {
        return this._ability.getRange();
    }

    /**
     * Invokes the ability contained in the consumable
     * @param {Dungeon} dungeon - The dungeon 
     * @param {Creature} creature - The creature consuming the item
     * @param {Tile} optionalTargetTile - The targetted tile, if any
     * @see Ability.use
     */
    use(dungeon, creature, optionalTargetTile) {
        this._ability.use(dungeon, creature, optionalTargetTile, true);
        dungeon.fireEvent(new GameEvents.AbilityEvent(dungeon, creature, this._ability, optionalTargetTile));
    }

    /**
     * @override
     */
    getFriendlyDescription() {
        return `A scroll containing the ${this._ability.getName()} spell`;
    }

    /**
     * Gets a user-friendly description of what happens when the item is used
     * @param {Dungeon} dungeon 
     * @param {Creature} creature 
     */
    getUseMessage(dungeon, creature) {
        return `${creature} used a ${this.getName()}`;
    }

    /**
     * @override
     */
    getName() {
        return this._name;
    }

    /**
     * @override
     */
    toString() {
        return this._ability.toString() + '_Consumable';
    }
}
