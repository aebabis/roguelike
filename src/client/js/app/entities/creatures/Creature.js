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

var visionLookup = {};

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
            var inventory = this.getInventory();
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
        var inventory = this.getInventory();
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

        var reduction = (amount > 0) ? this.getDamageReduction(type) : 0;

        var modifiedAmount = amount - reduction;

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

    modifyMana(amount) {
        if(!Number.isInteger(amount)) {
            throw new Error('amount must be an integer');
        }
        if(this.getCurrentMana() + amount < 0) {
            throw new Error('Not enough mana');
        }
        this._currentMana = Math.min(this.getCurrentMana() + amount, this.getBaseMana());
    }

    die(dungeon) {
        var location = dungeon.getTile(this);
        this._isDead = true;
        dungeon.removeCreature(this);
        dungeon.fireEvent(new DeathEvent(dungeon, this));
        this.onDeath(dungeon, location);
    }

    onDeath() {
    }

    isDead() {
        return !!this._isDead;
    }

    getTimeToNextMove() {
        return this._timeToNextMove;
    }

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
        var location = dungeon.getTile(this);

        if(tile.getEuclideanDistance(location) > this.getVisionRadius()) {
            return false;
        }

        // Coordinates of starting and ending tile
        var x0 = location.getX();
        var y0 = location.getY();
        var x1 = tile.getX();
        var y1 = tile.getY();
        var dx = x1 - x0;
        var dy = y1 - y0;
        var checkList = visionLookup[dx + ',' + dy];
        if(!checkList) {
            checkList = [];

            // Line of sight is between tile centers
            var los0 = {
                x: x0 + .5,
                y: y0 + .5
            };
            var los1 = {
                x: x1 + .5,
                y: y1 + .5
            };

            // Currently visited tile
            var x = x0;
            var y = y0;

            var fromDirections = [];
            var directionOpposites = [2, 3, 0, 1]; // Plus 2, Mod 4

            while(x !== x1 || y !== y1) {
                var newFromDirections = [];
                checkList.push({
                    dx: x - x0,
                    dy: y - y0
                });
                var segments = [
                    {p0: {x: x, y: y},     p1: {x: x + 1, y: y},     dx: 0, dy: -1, direction: 0},
                    {p0: {x: x + 1, y: y}, p1: {x: x + 1, y: y + 1}, dx: 1, dy: 0,  direction: 1},
                    {p0: {x: x, y: y + 1}, p1: {x: x + 1, y: y + 1}, dx: 0, dy: 1,  direction: 2},
                    {p0: {x: x, y: y},     p1: {x: x, y: y + 1},     dx: -1, dy: 0, direction: 3}
                ].filter((segment)=>(fromDirections.indexOf(segment.direction)<0));

                segments = segments.filter(function(segment) {
                    return Geometry.intersects(los0, los1, segment.p0, segment.p1);
                });

                segments.forEach(function(segment) {
                    newFromDirections.push(directionOpposites[segment.direction]);
                    x += segment.dx;
                    y += segment.dy;
                });

                // Indicate where ray came from
                fromDirections = newFromDirections;
            }

            visionLookup[dx + ',' + dy] = checkList;
        }
        for(var i = 0; i < checkList.length; i++) {
            var loc = checkList[i];
            if(this.visionObsuredBy(dungeon.getTile(loc.dx + x0, loc.dy + y0))) {
                return false;
            }
        }
        return true;
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
        var tile = dungeon.getTile(this);
        return this.getVisibleEnemies(dungeon).reduce(function(enemy1, enemy2) {
            if(enemy1) {
                var d1 = tile.getDirectDistance(dungeon.getTile(enemy1));
                var d2 = tile.getDirectDistance(dungeon.getTile(enemy2));
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
        var strategy = this.getStrategy();
        if(strategy) {
            strategy.observeMove(dungeon, this, actor, move);
        }
    }

    /**
     * @description Gets the Creature's next move
     * @return {Move | Promise} - A Move or a Promise for a Move
     */
    getNextMove(dungeon) {
        var strategy = this.getStrategy();
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
