import Entity from "../Entity.js";
import Tile from "../../tiles/Tile.js";
import MoveEvent from "../../events/MoveEvent.js";
import AttackEvent from "../../events/AttackEvent.js";
import BuffAppliedEvent from "../../events/BuffAppliedEvent.js";
import BuffEndedEvent from "../../events/BuffEndedEvent.js";
import CustomEvent from "../../events/CustomEvent.js";
import HitpointsEvent from "../../events/HitpointsEvent.js";

import Inventory from "./Inventory.js";

import Ability from "../../abilities/Ability.js";

import Buff from "./buffs/Buff.js";

import Strategy from "./strategies/Strategy.js";
import Weapon from "../weapons/Weapon.js";

import Geometry from "../../util/Geometry.js";

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

    getActionsCompleted() {
        return this.numActions;
    }

    getInventory() {
        return this._inventory;
    }

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
            if(item.getRange && item.getRange() === 1 && !inventory.getMeleeWeapon()) {
                inventory.equipItem(item);
            } else if(item.getRange && item.getRange() > 1 && !inventory.getRangedWeapon()) {
                inventory.equipItem(item);
            } else if(item.getPhysicalReduction && !inventory.getArmor()) {
                inventory.equipItem(item);
            } else {
                inventory.addItem(item);
            }
        }
    }

    canAddItem(item, backpackOnly) {
        var inventory = this.getInventory();
        if(backpackOnly) {
            return !inventory().isBackpackFull();
        } else {
            if(item.getRange && item.getRange() === 1 && !inventory.getMeleeWeapon()) {
                return true;
            } else if(item.getRange && item.getRange() > 1 && !inventory.getRangedWeapon()) {
                return true;
            } else if(item.getPhysicalReduction && !inventory.getArmor()) {
                return true;
            } else {
                return !inventory.isBackpackFull();
            }
        }
    }

    addAbility(ability) {
        if(!(ability instanceof Ability)) {
            throw new Error('First parameter must be an Ability');
        }
        this._abilities.push(ability);
    }

    getAbilities() {
        return this._abilities.slice();
    }

    getAbilityIndex(param) {
        if(param.prototype instanceof Ability) {
            return this._abilities.findIndex((ability)=>ability.constructor.name===param.name);
        } else {
            throw new Error('Parameter must be an Ability constructor');
        }
    }

    applyBuff(dungeon, buff) {
        if(!(buff instanceof Buff)) {
            throw new Error("Second parameter must be a buff");
        }
        this._buffs.push(buff);
        dungeon.fireEvent(new BuffAppliedEvent(dungeon, this, buff));
    }

    getBuffs() {
        return this._buffs.slice();
    }

    _incrementActions() {
        this.numActions = (this.numActions || 0) + 1;
    }

    getBaseHP() {
        throw new Error('Abstract method not implemented');
    }

    getCurrentHP() {
        return this._currentHP;
    }

    getBaseMana() {
        return 0;
    }

    getCurrentMana() {
        return this._currentMana;
    }

    receiveDamage(dungeon, amount, type) {
        if(!Number.isInteger(amount) || amount <= 0) {
            throw new Error('amount must be a positive integer');
        }

        var reduction = 0;
        if(amount > 0) {
            var armor = this.getArmor();
            if(armor) {
                reduction = armor.getReduction(type);
            }
        }

        var modifiedAmount = amount - reduction;

        if(modifiedAmount > 0) {
            var newValue = this._currentHP = Math.min(this.getCurrentHP() - modifiedAmount, this.getBaseHP());
            dungeon.fireEvent(new HitpointsEvent(dungeon, this, -modifiedAmount));
            if(newValue <= 0) {
                this.die(dungeon);
            }
        }

        return modifiedAmount;
    }

    heal(dungeon, amount) {
        this._currentHP = Math.min(this.getCurrentHP() + amount, this.getBaseHP());
        dungeon.fireEvent(new HitpointsEvent(dungeon, this, amount));
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
        this._isDead = true;
        dungeon.removeCreature(this);
        dungeon.fireEvent(new CustomEvent(dungeon, this.getName() + " died"));
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

    /**
     * @description Determines if the Creature can see the given tile and
     * what's on it.
     * @return {Boolean} `true` if the Creature can see the tile; false otherwise
     */
    canSee(dungeon, tile) {
        // TODO: Allow creature
        if(!(tile instanceof Tile)) {
            throw new Error('Must pass a Tile to canSee');
        }
        var location = dungeon.getTile(this);

        if(tile.getEuclideanDistance(location) > 5.5) {
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
            }

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

                var segments = segments.filter(function(segment) {
                    return Geometry.intersects(los0, los1, segment.p0, segment.p1);
                })

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

    /**
     * @description Determines if the Creature could occupy the given tile based
     * on what kind of tile it is. Does not regard whether the tile is already occiped.
     * @return {Boolean} `true` if the Creature could occupy the tile; false otherwise
     */
    canOccupy(tile) {
        return !tile.isSolid();
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
        this._incrementActions();
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
