import Entity from '../Entity';
import Tile from '../../tiles/Tile';

import BuffAppliedEvent from '../../events/BuffAppliedEvent';
import BuffEndedEvent from '../../events/BuffEndedEvent';
import DeathEvent from '../../events/DeathEvent';
import HitpointsEvent from '../../events/HitpointsEvent';
import InventoryChangeEvent from '../../events/InventoryChangeEvent';
import ItemDropEvent from '../../events/ItemDropEvent';
import TakeItemEvent from '../../events/TakeItemEvent';
import ZeroDamageEvent from '../../events/ZeroDamageEvent';

import Inventory from './Inventory';
import Weapon from '../weapons/Weapon';
import Armor from '../armor/Armor';

import Ability from '../../abilities/Ability';

import Buff from './buffs/Buff';

import Strategy from './strategies/Strategy';

import Items from '../Items';
import Consumable from '../consumables/Consumable';
import ItemComparator from './ItemComparator';

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

/**
 * Class representing creature's in the Dungeon. Includes
 * both the player and the enemies. Does not include obstacles
 * or loot.
 */
export default class Creature extends Entity {
    /**
      * @class Creature
      * @description Represents an entity that can act
      */
    constructor() {
        super();
        this._currentHP = this.getBaseHP();
        this._currentMana = this.getBaseMana();
        this._inventory = new Inventory();
        this._abilities = [];
        this._buffs = [];
        this._delay();
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
            } else if(item instanceof Armor && !inventory.getArmor()) {
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
        tile.getItems().forEach((newItem) => {
            if(this.getFaction() === 'Player' && !(newItem instanceof Consumable)) {
                if(this.getInventory().findItem((oldItem) =>
                    newItem instanceof oldItem.constructor ||
                    ItemComparator.is(oldItem).strictlyBetterThan(newItem)
                )) {
                    // Destroy item
                    tile.removeItem(newItem);
                    dungeon.fireEvent(new TakeItemEvent(dungeon, this, newItem));
                    return;
                }
                this.getInventory().removeItems((oldItem) =>
                    ItemComparator.is(newItem).strictlyBetterThan(oldItem)
                );
            }
            if(this.canAddItem(newItem)) {
                tile.removeItem(newItem);
                this.addItem(newItem);
                dungeon.fireEvent(new TakeItemEvent(dungeon, this, newItem));
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
     * @param {Object} cause - The source of the damage (usually an ability or weapon)
     * @param {number} amount - The amount of damage
     * @param {string} type - A member of {@link DamageTypes}
     * @return {number} The amount of damage received. If the creature
     * has no reduction for the given type, then this will be the same
     * as the input amount
     */
    receiveDamage(dungeon, cause, amount, type) {
        if(!Number.isInteger(amount) || amount < 0) {
            throw new Error('amount must be a non-negative integer');
        }

        const reduction = (amount > 0) ? this.getDamageReduction(type) : 0;

        const modifiedAmount = amount - reduction;

        if(modifiedAmount > 0) {
            this._currentHP = Math.min(this.getCurrentHP() - modifiedAmount, this.getBaseHP());
            dungeon.fireEvent(new HitpointsEvent(dungeon, this, cause, -modifiedAmount, type));
        } else {
            dungeon.fireEvent(new ZeroDamageEvent(dungeon, this, cause, type));
        }

        return modifiedAmount;
    }

    /**
     * Restores the Creature's hitpoints by a given amount. The Creature
     * cannot go above it's hitpoint maximum in this way
     * @param {Dungeon} dungeon - The creature's current Dungeon
     * @param {Object} cause - The cause of the healing
     * @param {number} amount - The amount of damage to restore
     */
    heal(dungeon, cause, amount) {
        this._currentHP = Math.min(this.getCurrentHP() + amount, this.getBaseHP());
        dungeon.fireEvent(new HitpointsEvent(dungeon, this, cause, amount, null));
    }

    /**
     * Modifies the Creature's current mana by the given amount. Mana cannot
     * go below zero or above the Creature's base mana value
     * @param {Dungeon} dungeon - The creature's current Dungeon
     * @param {Object} cause - The cause of the mana change
     * @param {number} amount - An integer to add to the Creature's current mana.
     * Negative numbers are allowed
     */
    modifyMana(dungeon, cause, amount) {
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
     * @param {Dungeon} dungeon - The Dungeon this Creature is in
     */
    die(dungeon) {
        const tile = dungeon.getTile(this);
        this._isDead = true;
        dungeon.removeCreature(this);
        dungeon.fireEvent(new DeathEvent(dungeon, this));
        this.onDeath(dungeon, tile);
        // Drop items
        this.getInventory().getItems().forEach(function(item) {
            // Check if item is droppable. Items from private classes
            // (e.g. Ent melee weapon are not droppable)
            if(item.constructor.name in Items) {
                tile.addItem(item);
                dungeon.fireEvent(new ItemDropEvent(dungeon, tile, item));
            }
        });
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

    /**
     * Sets the creature's equipped melee weapon
     */
    setMeleeWeapon(weapon) {
        this.getInventory().setMeleeWeapon(weapon);
    }

    /**
     * Sets the creature's equipped ranged weapon
     */
    setRangedWeapon(weapon) {
        this.getInventory().setRangedWeapon(weapon);
    }

    /**
     * Sets the creature's equipped armor
     */
    setArmor(armor) {
        this.getInventory().setArmor(armor);
    }

    /**
     * Gets the creature's currently held melee weapon
     * @return {Weapon} The creature's equipped melee weapon, if any
     */
    getMeleeWeapon() {
        return this.getInventory().getMeleeWeapon();
    }

    /**
     * Gets the creature's currently held ranged weapon
     * @return {Weapon} The creature's equipped ranged weapon, if any
     */
    getRangedWeapon() {
        return this.getInventory().getRangedWeapon();
    }

    /**
     * Gets the creature's currently worn armor
     * @return {Armor} The creature's worn armor, if any
     */
    getArmor() {
        return this.getInventory().getArmor();
    }

    /**
     * Gets the maximum distance the creature can
     * see in any direction
     * @return {number} The distance in tiles that the creature can
     * see when there are no obstructions
     */
    getVisionRadius() {
        return 5.5;
    }

    /**
     * Determines if the Creature can see the given tile and what's on it.
     * @return {Boolean} `true` if the Creature can see the tile; false otherwise
     */
    canSee(dungeon, param) {
        const tile = param instanceof Creature ? dungeon.getTile(param) : param;
        if(!(tile instanceof Tile)) {
            throw new Error('Must pass a Tile or Creature');
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

    /**
     * Tells whether the Creature has seen the given Tile
     * @param {Tile} tile
     * @return {boolean}
     */
    hasSeen(tile) { // TODO: Does this belong to PlayableCharacter?
        return this._visionMap[tile.getX()][tile.getY()];
    }

    /**
     * Determines if the creature's vision would be obscured by the given tile.
     * By default, vision is obscured by opaque tiles
     * @return {boolean} `true` if the tile blocks the creature's vision; `false` otherwise
     */
    visionObsuredBy(tile) {
        return tile.isOpaque();
    }

    /**
     * Tells whether the creature is flying. Flying creatures can move over pit tiles
     * @return {boolean} `true` if the creature is currently flying; `false` otherwise
     */
    isFlying() {
        return false;
    }

    /**
     * Determines if the Creature could occupy the given tile based
     * on what kind of tile it is. Does not regard whether the tile is already occiped.
     * @return {Boolean} `true` if the Creature could occupy the tile; false otherwise
     */
    canOccupy(tile) {
        return !tile.isSolid() &&
                (this.isFlying() || tile.hasFloor());
    }

    /**
     * Determines if the Creature can occupy the given tile.
     * In order to occupy the tile, it must not obstruct the creature's movement,
     * and it must not already be occupied.
     * @return {Boolean} `true` if the Creature could be added to the tile immediately; `false` otherwise
     */
    canOccupyNow(tile) {
        return this.canOccupy(tile) && !tile.getCreature();
    }

    /**
     * Gets the list of Tiles that the Creature can currently see
     * @return {Tile[]}
     */
    getVisibleTiles(dungeon) {
        return dungeon.getTiles((tile)=>this.canSee(dungeon, tile));
    }

    /**
     * Gets the list of other Creatures that this Creature can currently see
     * @return {Creature[]}
     */
    getVisibleCreatures(dungeon) {
        return this.getVisibleTiles(dungeon).filter((tile)=>(tile.getCreature()&&tile.getCreature()!==this)).map((tile)=>tile.getCreature());
    }

    /**
     * Gets the list of enemy Creatures that this Creature can currently see
     * @return {Creature[]}
     */
    getVisibleEnemies(dungeon) {
        return this.getVisibleCreatures(dungeon).filter((other)=>this.isEnemy(other));
    }

    /**
     * Gets the closest enemy Creature that this Creature can see
     * @return {Creature}
     */
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

    /**
     * Gets the name of the "Faction" this Creature belongs to. Creatures
     * in different factions are enemies. The player is in the "Player" faction.
     * Most enemies are in the "Guards" faction.
     * @return {string}
     */
    getFaction() {
        return 'Guards';
    }

    /**
     * Determines if another creature is an enemy based on its faction name
     * @return {boolean}
     */
    isEnemy(other) {
        return this.getFaction() !== other.getFaction();
    }

    /**
     * Sets this Creature's movement strategy. NPCs have a Strategy object
     * to determine their moves
     * @param {Strategy} strategy
     */
    setStrategy(strategy) {
        if(!(strategy instanceof Strategy)) {
            throw new Error('Must pass a Strategy');
        } else {
            this._strategy = strategy;
        }
    }

    /**
     * Gets the Creature's strategy
     * @return {Strategy} strategy
     */
    getStrategy() {
        return this._strategy || null;
    }

    /**
     * Causes the Creature to execute the given Move and sets its
     * cooldown. The Creature will also automatically pick up items
     * if allowed and able
     * @param {Dungeon} dungeon - The Dungeon this Creature is in
     * @param {Move} move - The Move this Creature will execute
     */
    executeMove(dungeon, move) {
        move.execute(dungeon, this);
        if(this.canUseItems()) {
            this.takeItems(dungeon);
        }
        this._delay(move.getCostMultiplier());
    }

    /**
     * Invokes an observer function on the Creature's Strategy, if any.
     * The Strategy can remember other Creature's Moves and base its own
     * Moves on them. This is only called if the other Creature is visible.
     * @param {Dungeon} dungeon - The Dungeon this Creature is in
     * @param {Creature} actor - The Creature being observed
     * @param {Move} move - The Move being performed
     */
    observeMove(dungeon, actor, move) {
        const strategy = this.getStrategy();
        if(strategy) {
            strategy.observeMove(dungeon, this, actor, move);
        }
    }

    /**
     * Invokes an observer function on the Creature's Strategy, if any.
     * The Strategy can remember events and base its own
     * Moves on them. This is only called if the other Creature is visible.
     * @param {Dungeon} dungeon - The Dungeon this Creature is in
     * @param {Event} event - The event that occured
     */
    observeEvent(dungeon, event) {
        const strategy = this.getStrategy();
        if(strategy) {
            strategy.observeEvent(dungeon, event);
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

    /**
     * Returns the default number of game ticks the creature must wait in 
     * between its moves. This can be modified by buffs
     * @return {number} The number of base cooldown ticks in between the
     * creature's moves.
     */
    getBaseSpeed() {
        return 500;
    }

    /**
     * Returns the number of game ticks the creature must wait in between
     * its moves. Lower numbers are better
     * @return {number} The number of cooldown ticks in between the
     * creature's moves.
     */
    getSpeed() {
        const baseSpeed = this.getBaseSpeed();
        const delayFactor = this.getBuffs().map(buff =>
            buff.getProperties().delayFactor || 1
        ).reduce((a, b) => a * b, 1);
        const delayModifier = this.getBuffs().map(buff =>
            buff.getProperties().delayModifier || 0
        ).reduce((a, b) => a + b, 0);
        return baseSpeed * delayFactor + delayModifier;
    }

    /**
     * Advances this creature through time in the simulation:
     *   - Decrements the creature's move cooldown
     *   - Removes any expired buffs/debuffs
     * @param {Dungeon} dungeon - The Dungeon the creature is in
     */
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
