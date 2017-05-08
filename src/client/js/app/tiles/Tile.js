import Dungeon from '../dungeons/Dungeon.js'; // TOOD: Update transpiler
import Creature from '../entities/creatures/Creature.js';

/**
 * A grid tile in the dungeon
 */
export default class Tile {
    /**
      * @param {number} x - The x-coordinate this Tile will have within the Dungeon
      * @param {number} y - The y-coordinate this Tile will have within the Dungeon
      */
    constructor(x, y) {
        if(!Number.isInteger(x) || !Number.isInteger(y)) {
            throw new Error('Must pass an x and y coordinate');
        }
        this._x = x;
        this._y = y;
        this._items = [];
    }

    /**
     * Sets the Creature occupying this Tile. A Tile can have a maximum of
     * one Creature
     * @param {Creature} creature - The Creature to place on this Tile
     */
    setCreature(creature) {
        if(!(creature instanceof Creature)) {
            throw new Error('First parameter must be a Creature');
        }
        this._creature = creature;
    }

    /**
     * Removes the Creature from this Tile, if any
     * @returns {Creature} - The Creature that was removed
     */
    removeCreature() {
        var creature = this._creature;
        this._creature = null;
        return creature;
    }

    /**
     * Gets the Creature on this Tile
     * @returns {Creature} - The Creature on this Tile
     */
    getCreature() {
        return this._creature;
    }

    /**
     * Gets the list of Items on this Tile
     * @returns {Array<Item>}
     */
    getItems() {
        return this._items.slice();
    }

    /**
     * Adds an Item to the pile of Items on the Tile.
     * There is no limit to the number of items on a Tile
     * @param {Item} item - The Item to add
     */
    addItem(item) {
        this._items.push(item);
    }

    /**
     * Removes an Item from the Tile
     * @param {Item|number} param - The Item to remove or the index of it's position
     */
    removeItem(param) {
        if(isNaN(param)) {
            var index = this._items.indexOf(param);
            if(index === -1) {
                throw new Error('Item not found', param);
            } else {
                return this._items.splice(index, 1)[0];
            }
        } else {
            return this._items.splice(param, 1)[0];
        }
    }

    /**
     * Get's the x coordinate of this tile
     * @returns {number}
     */
    getX() {
        return this._x;
    }

    /**
     * Get's the y coordinate of this tile
     * @returns {number}
     */
    getY() {
        return this._y;
    }

    /**
     * Sets an identifier telling which room the Tile belongs to.
     * This can be used to apply rules to all Tiles in the same room
     * @param {string} key - A string representing the room this Tile is in
     */
    setRoomKey(key) {
        this._roomKey = key;
    }

    /**
     * Gets the room key for this Tile, if any
     * @returns {string}
     */
    getRoomKey() {
        return this._roomKey;
    }

    /**
     * Tells whether this tile is solid (e.g. a wall). Most
     * Creatures cannot pass through solid Tiles.
     * @returns {boolean} - true if the Tile is considered solid; false otherwise
     */
    isSolid() {
        return false;
    }

    /**
     * Tells whether this tile is opaque (e.g. a wall). Most
     * Creatures cannot see through opaque Tiles.
     * @returns {boolean} - true if the Tile is considered opaque; false otherwise
     */
    isOpaque() {
        return false;
    }

    /**
     * Tells whether this tile is considered a floor (not a pit). Most
     * Creatures cannot walk over non-floor Tiles
     * @returns {boolean} - true if the Tile has a walkable floor; false otherwise
     */
    hasFloor() {
        return true;
    }

    /**
     * Gets the (up to) 4 neighbors in the cardinal directions from this Tile
     * @param {Dungeon} dungeon - The dungeon this tile is in
     * @returns {Array<Tile>}
     */
    getNeighbors4(dungeon) {
        var x = this._x;
        var y = this._y;
        return [
            dungeon.getTile(x    , y - 1),
            dungeon.getTile(x - 1, y),
            dungeon.getTile(x + 1, y),
            dungeon.getTile(x    , y + 1)
        ].filter(Boolean);
    }

    /**
     * Gets all Tiles immediately adjacent to this Tile (including diagonally)
     * @param {Dungeon} dungeon - The dungeon this tile is in
     * @returns {Array<Tile>}
     */
    getNeighbors8(dungeon) {
        var x = this._x;
        var y = this._y;
        return [
            dungeon.getTile(x - 1, y - 1),
            dungeon.getTile(x    , y - 1),
            dungeon.getTile(x + 1, y - 1),
            dungeon.getTile(x - 1, y),
            dungeon.getTile(x + 1, y),
            dungeon.getTile(x - 1, y + 1),
            dungeon.getTile(x    , y + 1),
            dungeon.getTile(x + 1, y + 1)
        ].filter(Boolean);
    }

    /**
     * Gets the Chebyshev distance between this Tile and another.
     * This is the number of steps a walking Creature will need to
     * take to travel between the two tiles, assuming no obstacles
     * @param {Tile} other - The to which distance will be measured
     * @returns {number} - A distance, as an integer
     */
    getDirectDistance(other) {
        if(!(other instanceof Tile)) {
            throw new Error('First parameter must be a Tile');
        }
        var dx = Math.abs(other.getX() - this.getX());
        var dy = Math.abs(other.getY() - this.getY());
        return Math.max(dx, dy);
    }

    /**
     * Gets the Euclidean distance between this Tile and another,
     * using the Pythagorean Theorem. This is used when determining
     * if something is within range of a ranged attack
     * @param {Tile} other - The to which distance will be measured
     * @returns {number} - A distance, as a double
     */
    getEuclideanDistance(other) {
        if(!(other instanceof Tile)) {
            throw new Error('First parameter must be a Tile');
        }
        var dx = Math.abs(other.getX() - this.getX());
        var dy = Math.abs(other.getY() - this.getY());
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Gets a human-friendly name for this Tile
     * @returns {string}
     */
    getName() {
        return 'Floor Tile';
    }

    /**
     * Gets a debug representation of this Tile
     * @returns {string}
     */
    toString() {
        return this.constructor.name + '<' + this.getX() + ',' + this.getY() + '>';
    }
}
