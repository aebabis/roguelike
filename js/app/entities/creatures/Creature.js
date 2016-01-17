import { default as Entity } from "../Entity.js";
import { default as Tile } from "../../tiles/Tile.js";
import { default as MoveEvent } from "../../events/MoveEvent.js";
import { default as AttackEvent } from "../../events/AttackEvent.js";
import { default as CustomEvent } from "../../events/CustomEvent.js";

import { default as Inventory } from "./Inventory.js";

import { default as Strategy } from "./strategies/Strategy.js";
import { default as Weapon } from "../weapons/Weapon.js";

import { default as Geometry } from "../../util/Geometry.js";

export default class Creature extends Entity {
    /**
      * @class Creature
      * @description
      */
    constructor(dungeon) {
        super(dungeon);
        this._delay();
        this._currentHP = this.getBaseHP();
        this._inventory = new Inventory();
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

    addItem(item) {
        this._inventory.addItem(item);
    }

    _incrementActions() {
        this.numActions = (this.numActions || 0) + 1;
    }

    getTile() {
        return this.getDungeon().getTile(this);
    }

    getBaseHP() {
        throw new Error('Abstract method not implemented')
    }

    getCurrentHP() {
        return this._currentHP;
    }

    modifyHP(amount) {
        if(isNaN(amount)) {
            throw new Error('amount must be a number');
        }
        this._currentHP += amount;
        if(this._currentHP <= 0) {
            this.die();
        }
    }

    die() {
        this._isDead = true;
        this._dungeon.removeCreature(this);
        this._dungeon.fireEvent(new CustomEvent(this.getDungeon(), this.toString() + " died"));
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

    // Convenience function to get inventory item
    // TODO: Consider removing
    getMeleeWeapon() {
        return this.getInventory().getMeleeWeapon();
    }

    getRangedWeapon() {
        return this.getInventory().getRangedWeapon();
    }

    /**
     * @description Determines if the Creature can see the given tile and
     * what's on it.
     * @return {Boolean} `true` if the Creature can see the tile; false otherwise
     */
    canSee(tile) {
        // TODO: Allow creature
        if(!(tile instanceof Tile)) {
            throw new Error('Must pass a Tile to canSee');
        }
        var dungeon = this.getDungeon();
        var location = this.getTile();
        if(!location) { // Creature hasn't been placed yet.
            // TODO: Should this check be necessary?
            return false;
        }

        // Coordinates of starting and ending tile
        var x0 = location.getX();
        var y0 = location.getY();
        var x1 = tile.getX();
        var y1 = tile.getY();

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

        var limit = 20;

        while(x !== x1 || y !== y1) {
            if(!limit--) {
                return false;
            }

            //debugger;
            var newFromDirections = [];
            if(this.visionObsuredBy(dungeon.getTile(x, y))) {
                return false;
            }
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

    getVisibleTiles() {
        return this.getDungeon().getTiles((tile)=>this.canSee(tile));
    }

    getVisibleCreatures() {
        return this.getVisibleTiles().filter((tile)=>(tile.getCreature()&&tile.getCreature()!==this)).map((tile)=>tile.getCreature());
    }

    getVisibleEnemies() {
        return this.getVisibleCreatures().filter((other)=>this.isEnemy(other));
    }

    isEnemy(other) {
        // TODO: Figure out how/if to import PlayableCharacter in this class
        return (this.toString() === 'PlayableCharacter') !== (other.toString() === 'PlayableCharacter');
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

    timestep() {
        this._timeToNextMove--;
    }
}
