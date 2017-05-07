import Dungeon from '../dungeons/Dungeon.js';
import Creature from '../entities/creatures/Creature.js';
import Tile from '../tiles/Tile.js';

/**
 * @abstract
 * @desc Represents a non-attack action that a creature can perform
 */
export default class Ability {
    /**
     * @desc Gives a reason the ability cannot be performed by the given
     * creature, if any exists.
     * @param {Dungeon} dungeon - The dungeon the creature is in
     * @param {Creature} creature - The creature performing the ability
     * @param {Tile} [optionalTargetTile] - The tile targetted by the ability, if required
     * @param {boolean} [isFree] - If true, will not check whether mana cost is met
     * @return {String} - The reason the ability cannot be performed, or null if none
     * exists.
     */
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
            } else if(!this.canTargetSelf() && optionalTargetTile === dungeon.getTile(creature)) {
                return 'Not a self-target ability';
            }
        }
        return null;
    }

    /**
     * @desc Causes the given creature to perform the ability, modifying the game state
     * @param {Dungeon} dungeon - The dungeon the creature is in
     * @param {Creature} creature - The creature performing the ability
     * @param {Tile} [optionalTargetTile] - The tile targetted by the ability, if required
     * @param {boolean} [isFree] - If true, will not check whether mana cost is met
     */
    use(dungeon, creature, optionalTargetTile, isFree) {
        var reason  = this.getReasonIllegal(dungeon, creature, optionalTargetTile, isFree);
        if(reason) {
            throw new Error(reason);
        }
        if(!isFree) {
            creature.modifyMana(-this.getManaCost());
        }
    }

    /**
     * @abstract
     * @desc Tells whether the ability targets a tile.
     * @return {boolean} - `true` if the ability must target a tile; `false` otherwise.
     */
    isTargetted() {
        throw new Error('Abstract method not implemented');
    }

    /**
     * @abstract
     * @desc For a targetted ability, tells whether the ability requires
     * the target tile to contain a creature. This is not called if the ability
     * doesn't target.
     * @return {boolean} - `true` if the ability must target a creature; `false` otherwise.
     */
    isTargetCreature() {
        throw new Error('Abstract method not implemented');
    }

    /**
     * @desc Tells whether the ability can cause the creature to move. creatures
     * will not be able to use a movement ability if their movement is impaired.
     * @return {boolean} - `true` if the ability can cause the user to move; `false` otherwise.
     */
    isMovementAbility() {
        return false;
    }

    /**
     * @desc For targetted abilities, tells whether or not the target must
     * be visible to the creature.
     * @return {boolean} - `true` if the ability must target a visible tile; `false` otherwise.
     */
    mustTargetBeVisible() {
        return true;
    }

    /**
     * @desc For targetted abilities, tells how far away the ability can
     * target. 0 means that the ability can only self-target.
     * @return {number} - A number indicating how far the ability can target
     */
    getRange() {
        return 0;
    }

    /**
     * @desc For targetted abilities, tells whether or not the target
     * can be the tile the creature is standing on.
     * @return {boolean} - `true` if the ability may target the user; `false` otherwise.
     */
    canTargetSelf() {
        return true;
    }

    /**
     * @abstract
     * @desc Gets the amount of mana deducted from the user upon use. If
     * this amount exceeds the creature's available mana, the ability cannot be
     * used normally.
     * @return {number} - The mana required to use the ability
     */
    getManaCost() {
        throw new Error('Abstract method not implemented');
    }

    /**
     * @desc Gets a formatted name for the ability
     * @return {String} - A human-readable name
     */
    getName() {
        return this.constructor.name.replace(/([^A-Z])([A-Z])/g, '$1 $2');
    }

    /**
     * @abstract
     * @desc A short description of the ability
     * @return {String} - A human-readable description of the ability's effects
     */
    getDescription() {
        throw new Error('Abstract method not implemented');
    }

    /**
     * @desc Generic toString method
     * @return {String} - A string for debug purposes
     */
    toString() {
        return this.constructor.name;
    }
}
