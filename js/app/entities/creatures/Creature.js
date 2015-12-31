import { default as Entity } from "../Entity.js";
import { default as Tile } from "../../tiles/Tile.js";
import { default as MoveEvent } from "../../events/MoveEvent.js";
import { default as AttackEvent } from "../../events/AttackEvent.js";
import { default as CustomEvent } from "../../events/CustomEvent.js";

import { default as Strategy } from "./strategies/Strategy.js";
import { default as Weapon } from "../weapons/Weapon.js";

import { default as AStar } from "../../../../bower_components/es6-a-star/es6-a-star.js";

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
        var inventory = this._inventory = [];
        for(var i = 0, l = this.getInventoryCapacity(); i < l; i++) {
            inventory.push(null);
        }
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
        return this._inventory.slice();
    }

    addItem(item) {
        if(!(item instanceof Weapon)) {
            throw new Error('First parameter must be an item');
        }
        var inventory = this._inventory;
        var emptySlot = inventory.indexOf(null);
        if(emptySlot === -1) {
            throw new Error('Inventory full');
        } else {
            inventory[emptySlot] = item;
        }
    }

    getInventoryCapacity() {
        return 2;
    }

    _incrementActions() {
        this.numActions = (this.numActions || 0) + 1;
    }

    move(dx, dy) {
        var dungeon = this.getDungeon();
        var tile = dungeon.getTile(this);
        var x = tile.getX() + dx;
        var y = tile.getY() + dy;
        var newLocation = dungeon.getTile(x, y);
        if(!this.canOccupy(newLocation)) {
            throw new Error("Cannot legally occupy new location");
        }
        var occupant = newLocation.getCreature();
        if(occupant) {
            throw new Error('Cannot move to occupied tile', occupant);
        }
        tile.removeCreature();
        dungeon.setCreature(this, x, y);
        this._incrementActions();
        this._delay();
        dungeon.fireEvent(new MoveEvent(dungeon, this, x, y));
    }

    moveToward(param1, param2) {
        var start = this.getTile();
        var target;
        var x = start.getX();
        var y = start.getY();
        var tX, tY;
        if(param1 instanceof Tile) {
            target = param1;
        } else if(param1 instanceof Creature) {
            target = param1.getTile();
        } else if(!isNaN(param1) && !isNaN(param2)) {
            target = this.getDungeon().getTile(param1, param2);
        } else {
            throw new Error("Illegal parameters", param1, param2);
        }

        if(start === target) {
            console.warn("Creature trying to move to path to its own location", this);
        }

        var pathfinding = AStar({
            start: start,
            isEnd: (node)=>node===target,
            neighbor: (node)=>node.getNeighbors8().filter(
                (neighbor)=>(this.canOccupy(neighbor) && (neighbor===target || neighbor.getCreature() == null))),
            distance: (a,b)=>a.getDirectDistance(b),
            heuristic: (a)=>a.getEuclideanDistance(target)
        });

        if(pathfinding.status === 'success') {
            var nextTile = pathfinding.path[1];
            if(nextTile) {
                this.move(
                    Math.sign(nextTile.getX() - x),
                    Math.sign(nextTile.getY() - y)
                );
            }
        } else {
            throw new Error(pathfinding.status);
        }
    }

    attack(param1, param2) {
        var dungeon = this.getDungeon();
        var tile = dungeon.getTile(this);
        var x, y, target, targetTile;
        if(param1 instanceof Creature) {
            target = param1;
            targetTile = target.getTile();
            x = target.getTile().getX();
            y = target.getTile().getY();
        } else {
            x = param1;
            y = param2;
            targetTile = dungeon.getTile(x, y);
            target = targetTile.getCreature();
        }
        if(!this.canSee(targetTile)) {
            throw new Error('Can\'t see the target');
        } else if(!target) {
            throw new Error('Nothing to attack');
        }
        var dx = tile.getX() - x;
        var dy = tile.getY() - y;
        if(dx === 0 && dy === 0) {
            throw new Error('Creature can\'t attack itself');
        }

        var targetDistance = tile.getDirectDistance(targetTile);
        var weapon = (targetDistance > 1) ? this.getRangedWeapon() : this.getMeleeWeapon();
        if(!weapon) {
            throw new Error('No weapon to attack that target with');
        } else if(!(weapon instanceof Weapon)) {
            throw new Error('Creature did not return weapon');
        }

        // TODO: Should the attack legality determination be in the weapon classes?
        if(targetDistance > weapon.getRange()) {
            throw new Error('Target not in range');
        }
        if(!weapon.isUseable()) {
            throw new Error('Weapon not currently useable');
        }

        target.modifyHP(-weapon.getDamage());
        this._incrementActions();
        this._delay();
        dungeon.fireEvent(new AttackEvent(dungeon, this, target, weapon));
    }

    useItem(inventoryIndex, targetTile) {
        if(isNaN(inventoryIndex)) {
            throw new Error('First parameter must be a number');
        }
        var inventory = this._inventory;
        var item = inventory[inventoryIndex];
        var dungeon = this.getDungeon();
        if(!item) {
            throw new Error('No item in given position');
        }
        if(item instanceof Weapon) {
            var oldWeapon;
            if(item.getRange() === 1) {
                oldWeapon = this.getMeleeWeapon();
                this.setMeleeWeapon(item);
            } else {
                oldWeapon = this.getRangedWeapon();
                this.setRangedWeapon(item);
            }
            inventory[inventoryIndex] = oldWeapon;
            dungeon.fireEvent(new CustomEvent(dungeon, this + "equipped" + item));
        }
        this._incrementActions();
        this._delay();
    }

    wait() {
        this._incrementActions();
        this._delay(.25);
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
        return this.getTimeToNextMove() === 0;
    }

    setMeleeWeapon(weapon) {
        if(!(weapon instanceof Weapon)) {
            throw new Error('Parameter must be a Weapon');
        } else if(weapon.getRange() > 1) {
            throw new Error('Weapon is not melee')
        }
        this._meleeWeapon = weapon;
    }

    setRangedWeapon(weapon) {
        if(!(weapon instanceof Weapon)) {
            throw new Error('Parameter must be a Weapon');
        } else if(weapon.getRange() === 1) {
            throw new Error('Weapon is not ranged')
        }
        this._rangedWeapon = weapon;
    }

    getMeleeWeapon() {
        return this._meleeWeapon;
    }

    getRangedWeapon() {
        return this._rangedWeapon;
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
                console.log("Took too long", los0, los1);
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

    /**
     * @description Gets the Creature's next move
     * @return {Move | Promise} - A Move or a Promise for a Move
     */
    getNextMove() {
        var strategy = this.getStrategy();
        if(strategy) {
            return strategy.getNextMove();
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
