import Entity from '../Entity.js';
import Tile from '../../tiles/Tile.js';

import BuffAppliedEvent from '../../events/BuffAppliedEvent.js';
import BuffEndedEvent from '../../events/BuffEndedEvent.js';
import DeathEvent from '../../events/DeathEvent.js';
import HitpointsEvent from '../../events/HitpointsEvent.js';
import InventoryChangeEvent from '../../events/InventoryChangeEvent.js';
import TakeItemEvent from '../../events/TakeItemEvent.js';
import ZeroDamageEvent from '../../events/ZeroDamageEvent.js';

import Inventory from './Inventory.js';
import Weapon from '../weapons/Weapon.js';

import Ability from '../../abilities/Ability.js';

import Buff from './buffs/Buff.js';

import Strategy from './strategies/Strategy.js';

import Geometry from '../../util/Geometry.js';

const visionLookup = {};

function rangeBetween(a, b) {
    const arr = [];
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    for(let i = from + 1; i < to; i++) {
        arr.push(i);
    }
    return arr;
}

export default class Creature extends Entity {
    /**
      * @class Creature
      * @description Represents an entity that can act
      */
    constructor() {
        super();
        this._delay();
        this._currentHP = this.getBaseHP();
        this._currentMana = this.getBaseMana();
        this._inventory = new Inventory();
        this._abilities = [];
        this._buffs = [];
    }

    _delay(multiplier) {
        if(typeof multiplier === 'undefined') {
            multiplier = 1;
        } else if (isNaN(multiplier)) {
            throw new Error('Delay amount, if given, must be a number');
        }
        this._timeToNextMove = Math.floor(this.getSpeed() * multiplier);
    }

    /**
     * Gets the creature's inventory
     * @returns {@link Inventory}
     */
    getInventory() {
        return this._inventory;
    }

    /**
     * Adds an item to the creature's inventory, optionally
     * equipping it if there's room
     * @param {Item} item - The Item to add
     * @param {boolean} [backpackOnly=false] - Prohibits automatically equipping the item
     */
    addItem(item, backpackOnly = false) {
        if(backpackOnly) {
            if(!this.canAddItem(item, backpackOnly)) {
                throw new Error('Backpack full');
            }
        } else {
            if(!this.canAddItem(item, backpackOnly)) {
                throw new Error('No available slot');
            }
            const inventory = this.getInventory();
            if(item instanceof Weapon && item.getRange() === 1 && !inventory.getMeleeWeapon()) {
                inventory.equipItem(item);
            } else if(item instanceof Weapon && item.getRange() > 1 && !inventory.getRangedWeapon()) {
                inventory.equipItem(item);
            } else if(item.getPhysicalReduction && !inventory.getArmor()) {
                inventory.equipItem(item);
            } else {
                inventory.addItem(item);
            }
        }
    }

    /**
     * Checks to see if the creature's backpack can hold another item
     * @param {Item} item - The Item to add
     * @param {boolean} [backpackOnly=false] - If true, only checks
     * for an empty backpack slot
     * @return {boolean}
     */
    canAddItem(item, backpackOnly = false) {
        const inventory = this.getInventory();
        if(backpackOnly) {
            return !inventory().isBackpackFull();
        } else {
            if(item instanceof Weapon && item.getRange() === 1 && !inventory.getMeleeWeapon()) {
                return true;
            } else if(item instanceof Weapon && item.getRange() > 1 && !inventory.getRangedWeapon()) {
                return true;
            } else if(item.getPhysicalReduction && !inventory.getArmor()) {
                return true;
            } else {
                return !inventory.isBackpackFull();
            }
        }
    }

    /**
     * Tells whether the creature can pickup and use items.
     * By default, players can use items and enemies cannot.
     * @return {boolean}
     */
    canUseItems() {
        return false;
    }

    /**
     * Takes items from the Creature's current tile and attempts
     * to add each one to it's {@link Inventory} in sequence
     * @param {Dungeon} dungeon - The Dungeon the creature is in
     */
    takeItems(dungeon) {
        const tile = dungeon.getTile(this);
        tile.getItems().forEach((item) => {
            if(this.canAddItem(item)) {
                tile.removeItem(item);
                this.addItem(item);
                dungeon.fireEvent(new TakeItemEvent(dungeon, this, item));
                dungeon.fireEvent(new InventoryChangeEvent(dungeon, this));
            }
        });
    }

    /**
     * Adds an {@link Ability} to the Creature's list of Abilities.
     * @param {Ability} ability - The new ability
     */
    addAbility(ability) {
        if(!(ability instanceof Ability)) {
            throw new Error('First parameter must be an Ability');
        }
        this._abilities.push(ability);
    }

    /**
     * Gets a list of the Creature's abilities
     * @return {Array<Ability>}
     */
    getAbilities() {
        return this._abilities.slice();
    }

    /**
     * Gets the creature's Ability at the given index
     * @param {number} index
     * @return {Ability}
     */
    getAbility(index) {
        return this._abilities[index];
    }

    /**
     * Gets the index of a creature's Ability
     * @param {function(): Ability} param - An ability constructor
     * @return {number} - An integer index if an instance of the given class is found;
     * -1 otherwise
     */
    getAbilityIndex(param) {
        if(param.prototype instanceof Ability) {
            return this._abilities.findIndex((ability)=>ability.constructor.name===param.name);
        } else {
            throw new Error('Parameter must be an Ability constructor');
        }
    }

    /**
     * Puts a {@link Buff} onto the creature. The Buff will have a chance
     * to apply it's effects each timestep (including the current one)
     * until it ends or is removed
     * @param {Dungeon} dungeon - The Dungeon the creature is in
     * @param {Buff} buff - The Buff to apply
     */
    applyBuff(dungeon, buff) {
        if(!(buff instanceof Buff)) {
            throw new Error('Second parameter must be a buff');
        }
        this._buffs.push(buff);
        dungeon.fireEvent(new BuffAppliedEvent(dungeon, this, buff));
    }

    /**
     * Gets a list of the Creature's {@link Buff}s.
     * @return {Array<Buff>} - The Creature's Buffs
     */
    getBuffs() {
        return this._buffs.slice();
    }

    /**
     * Get's the Creature's maximum allowed hitpoints
     * @return {number} - A positive integer
     */
    getBaseHP() {
        throw new Error('Abstract method not implemented');
    }

    /**
     * Get's the Creature's current hitpoints
     * @return {number} - A non-negative integer
     */
    getCurrentHP() {
        return this._currentHP;
    }

    /**
     * Get's the Creature's maximum allowed mana
     * @return {number} - A positive integer
     */
    getBaseMana() {
        return 0;
    }

    /**
     * Get's the Creature's current mana
     * @return {number} - A non-negative integer
     */
    getCurrentMana() {
        return this._currentMana;
    }

    /**
     * Get's the amount that damage of the given type is
     * reduced by the creature's defenses. Damage reduction
     * is subtracted from incoming damage. Damage reduction
     * typically comes from {@link Armor}
     * @param {string} type - A member of {@link DamageTypes}
     * @return {number} - A non-negative integer
     */
    getDamageReduction(type) {
        let armor = this.getArmor();
        return armor ? this.getArmor().getReduction(type) : 0;
    }

    /**
     * Applies a given amount of typed damage to the creature,
     * minus the creature's damage reduction
     * @param {Dungeon} dungeon - The creature's current Dungeon
     * @param {number} amount - The amount of damage
     * @param {string} type - A member of {@link DamageTypes}
     * @return {number} The amount of damage received. If the creature
     * has no reduction for the given type, then this will be the same
     * as the input amount
     */
    receiveDamage(dungeon, amount, type) {
        if(!Number.isInteger(amount) || amount < 0) {
            throw new Error('amount must be a non-negative integer');
        }

        const reduction = (amount > 0) ? this.getDamageReduction(type) : 0;

        const modifiedAmount = amount - reduction;

        if(modifiedAmount > 0) {
            this._currentHP = Math.min(this.getCurrentHP() - modifiedAmount, this.getBaseHP());
            dungeon.fireEvent(new HitpointsEvent(dungeon, this, -modifiedAmount, type));
        } else {
            dungeon.fireEvent(new ZeroDamageEvent(dungeon, this, type));
        }

        return modifiedAmount;
    }

    /**
     * Restores the Creature's hitpoints by a given amount. The Creature
     * cannot go above it's hitpoint maximum in this way
     * @param {Dungeon} dungeon - The creature's current Dungeon
     * @param {number} amount - The amount of damage to restore
     */
    heal(dungeon, amount) {
        this._currentHP = Math.min(this.getCurrentHP() + amount, this.getBaseHP());
        dungeon.fireEvent(new HitpointsEvent(dungeon, this, amount, null));
    }

    /**
     * Modifies the Creature's current mana by the given amount. Mana cannot
     * go below zero or above the Creature's base mana value
     * @param {number} - An integer to add to the Creature's current mana.
     * Negative numbers are allowed
     */
    modifyMana(amount) {
        if(!Number.isInteger(amount)) {
            throw new Error('amount must be an integer');
        }
        if(this.getCurrentMana() + amount < 0) {
            throw new Error('Not enough mana');
        }
        this._currentMana = Math.min(this.getCurrentMana() + amount, this.getBaseMana());
    }

    /**
     * Kills this creature, removing it from the Dungeon
     * @param {Dungeon} - The Dungeon this Creature is in
     */
    die(dungeon) {
        this._isDead = true;
        dungeon.removeCreature(this);
        dungeon.fireEvent(new DeathEvent(dungeon, this));
        this.onDeath(dungeon, dungeon.getTile(this));
    }

    /**
     * An optional death handler for this Creature. Called
     * when the Creature dies
     */
    onDeath() {
    }

    /**
     * Tells whether the Creature is dead. If the Creature is
     * dead it will no longer be in a Dungeon.
     * @returns {boolean} - true if the Creature has died; false otherwise
     */
    isDead() {
        return !!this._isDead;
    }

    /**
     * Gets the number of timesteps until this Creature's next move.
     * @returns {number}
     */
    getTimeToNextMove() {
        return this._timeToNextMove;
    }

    /**
     * Tells whether the Creature may act on the current timestep.
     * @returns {boolean} - true if the Creature's wait time til it's next
     * move is 0; false otherwise
     */
    canActThisTimestep() {
        return this.getTimeToNextMove() <= 0;
    }

    setMeleeWeapon(weapon) {
        this.getInventory().setMeleeWeapon(weapon);
    }

    setRangedWeapon(weapon) {
        this.getInventory().setRangedWeapon(weapon);
    }

    setArmor(armor) {
        this.getInventory().setArmor(armor);
    }

    // Convenience function to get inventory item
    // TODO: Consider removing
    getMeleeWeapon() {
        return this.getInventory().getMeleeWeapon();
    }

    getRangedWeapon() {
        return this.getInventory().getRangedWeapon();
    }

    getArmor() {
        return this.getInventory().getArmor();
    }

    getVisionRadius() {
        return 5.5;
    }

    /**
     * Determines if the Creature can see the given tile and what's on it.
     * @return {Boolean} `true` if the Creature can see the tile; false otherwise
     */
    canSee(dungeon, tile) {
        // TODO: Allow creature
        if(!(tile instanceof Tile)) {
            throw new Error('Must pass a Tile to canSee');
        }
        const location = dungeon.getTile(this);

        if(tile.getEuclideanDistance(location) > this.getVisionRadius()) {
            return false;
        }

        // Coordinates of starting and ending tile
        const x0 = location.getX();
        const y0 = location.getY();
        const x1 = tile.getX();
        const y1 = tile.getY();
        const dx = x1 - x0;
        const dy = y1 - y0;


        if(dx === 0) {
            return rangeBetween(y0, y1).every((y) => !this.visionObsuredBy(dungeon.getTile(x0, y)));
        } else if(dy === 0) {
            return rangeBetween(x0, x1).every((x) => !this.visionObsuredBy(dungeon.getTile(x, y0)));
        } else if(Math.abs(dx) === 1) {
            return rangeBetween(y0, y1).every((y) => !this.visionObsuredBy(dungeon.getTile(x0, y))) ||
                rangeBetween(y0, y1).every((y) => !this.visionObsuredBy(dungeon.getTile(x1, y)));
        } else if(Math.abs(dy) === 1) {
            return rangeBetween(x0, x1).every((x) => !this.visionObsuredBy(dungeon.getTile(x, y0))) ||
                rangeBetween(x0, x1).every((x) => !this.visionObsuredBy(dungeon.getTile(x, y1)));
        } else { // Sight ray is a diagonal
            let checkList = visionLookup[dx + ',' + dy];
            if(!checkList) {
                // Compute sequence of tiles intersected by delta line.
                // Delta line is transformed to start at 0,0 to improve
                // chance of cache hit in the future
                checkList = [];

                const xDir = Math.sign(dx);
                const yDir = Math.sign(dy);
                const targetSlopeX = dx - xDir;
                const targetSlopeY = dy - yDir;

                // Algorithm uses a cursor which traces path by
                // moving along tile edges
                let cursorX = xDir;
                let cursorY = yDir;

                while(Math.abs(cursorX) < Math.abs(dx) ||
                        Math.abs(cursorY) < Math.abs(dy)) {
                    checkList.push({
                        dx: cursorX,
                        dy: cursorY
                    });

                    // Compare cursor slope to LOS slope.
                    // If larger, we need to travel along x-axis
                    // If smaller, travel along y-axis
                    // If equal, do both
                    // Use cross-product for efficiency
                    const cursorCross = cursorY * targetSlopeX;
                    const targetCross = cursorX * targetSlopeY;

                    if(Math.abs(cursorCross) >= Math.abs(targetCross)) { // cursorSlope >= targetSlope
                        cursorX += xDir;
                    }
                    if(Math.abs(cursorCross) <= Math.abs(targetCross)) { // cursorSlope <= targetSlope
                        cursorY += yDir;
                    }
                }

                visionLookup[dx + ',' + dy] = checkList;
            }
            return checkList.every(({dx, dy}) => !this.visionObsuredBy(dungeon.getTile(dx + x0, dy + y0)));
        }
    }

    hasSeen(tile) {
        return this._visionMap[tile.getX()][tile.getY()];
    }

    visionObsuredBy(tile) {
        return tile.isOpaque();
    }

    isFlying() {
        return false;
    }

    /**
     * @description Determines if the Creature could occupy the given tile based
     * on what kind of tile it is. Does not regard whether the tile is already occiped.
     * @return {Boolean} `true` if the Creature could occupy the tile; false otherwise
     */
    canOccupy(tile) {
        return !tile.isSolid() &&
                (this.isFlying() || tile.hasFloor());
    }

    canOccupyNow(tile) {
        return this.canOccupy(tile) && !tile.getCreature();
    }

    getVisibleTiles(dungeon) {
        return dungeon.getTiles((tile)=>this.canSee(dungeon, tile));
    }

    getVisibleCreatures(dungeon) {
        return this.getVisibleTiles(dungeon).filter((tile)=>(tile.getCreature()&&tile.getCreature()!==this)).map((tile)=>tile.getCreature());
    }

    getVisibleEnemies(dungeon) {
        return this.getVisibleCreatures(dungeon).filter((other)=>this.isEnemy(other));
    }

    getClosestEnemy(dungeon) {
        const tile = dungeon.getTile(this);
        return this.getVisibleEnemies(dungeon).reduce(function(enemy1, enemy2) {
            if(enemy1) {
                const d1 = tile.getDirectDistance(dungeon.getTile(enemy1));
                const d2 = tile.getDirectDistance(dungeon.getTile(enemy2));
                return d1 < d2 ? enemy1 : enemy2;
            } else {
                return enemy2;
            }
        }, null);
    }

    getFaction() {
        return 'Guards';
    }

    isEnemy(other) {
        return this.getFaction() !== other.getFaction();
    }

    setStrategy(strategy) {
        if(!(strategy instanceof Strategy)) {
            throw new Error('Must pass a Strategy');
        } else {
            this._strategy = strategy;
        }
    }

    getStrategy() {
        return this._strategy || null;
    }

    executeMove(dungeon, move) {
        move.execute(dungeon, this);
        if(this.canUseItems()) {
            this.takeItems(dungeon);
        }
        this._delay(move.getCostMultiplier());
    }

    observeMove(dungeon, actor, move) {
        const strategy = this.getStrategy();
        if(strategy) {
            strategy.observeMove(dungeon, this, actor, move);
        }
    }

    /**
     * @description Gets the Creature's next move
     * @return {Move | Promise} - A Move or a Promise for a Move
     */
    getNextMove(dungeon) {
        const strategy = this.getStrategy();
        if(strategy) {
            return strategy.getNextMove(dungeon, this);
        } else {
            throw new Error('Default method ran with no strategy set');
        }
    }

    getSpeed() {
        return 500;
    }

    timestep(dungeon) {
        this._timeToNextMove--;
        this._buffs = this._buffs.filter((buff)=>{
            if(buff.isDone(dungeon)) {
                dungeon.fireEvent(new BuffEndedEvent(dungeon, this, buff));
                return false;
            } else {
                return true;
            }
        });
        this._buffs.forEach((buff)=>buff.timestep(dungeon, this));
    }
}
