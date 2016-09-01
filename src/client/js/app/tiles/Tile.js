import Dungeon from '../dungeons/Dungeon.js';
import Creature from '../entities/creatures/Creature.js';

export default class Tile {
    /**
      * @class Tile
      * @description A grid tile in the dungeon
      */
    constructor(dungeon, x, y) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error('First parameter must be a Dungeon');
        }
        if(!Number.isInteger(x) || !Number.isInteger(y)) {
            throw new Error('Must pass an x and y coordinate');
        }
        this._dungeon = dungeon;
        this._x = x;
        this._y = y;
        this._items = [];
    }

    setCreature(creature) {
        if(!(creature instanceof Creature)) {
            throw new Error('First parameter must be a Creature');
        }
        this._creature = creature;
    }

    removeCreature() {
        var creature = this._creature;
        this._creature = null;
        return creature;
    }

    getCreature() {
        return this._creature;
    }

    getItems() {
        return this._items.slice();
    }

    addItem(item) {
        this._items.push(item);
    }

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

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }

    setRoomKey(key) {
        this._roomKey = key;
    }

    getRoomKey() {
        return this._roomKey;
    }

    isSolid() {
        return false;
    }

    isOpaque() {
        return false;
    }

    hasFloor() {
        return true;
    }

    getNeighbors4() {
        var dungeon = this._dungeon;
        var x = this._x;
        var y = this._y;
        return [
            dungeon.getTile(x    , y - 1),
            dungeon.getTile(x - 1, y),
            dungeon.getTile(x + 1, y),
            dungeon.getTile(x    , y + 1)
        ].filter(Boolean);
    }

    getNeighbors8() {
        var dungeon = this._dungeon;
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

    getDirectDistance(other) {
        if(!(other instanceof Tile)) {
            throw new Error('First parameter must be a Tile');
        }
        var dx = Math.abs(other.getX() - this.getX());
        var dy = Math.abs(other.getY() - this.getY());
        return Math.max(dx, dy);
    }

    getEuclideanDistance(other) {
        if(!(other instanceof Tile)) {
            throw new Error('First parameter must be a Tile');
        }
        var dx = Math.abs(other.getX() - this.getX());
        var dy = Math.abs(other.getY() - this.getY());
        return Math.sqrt(dx * dx + dy * dy);
    }

    getName() {
        return 'Floor Tile';
    }

    toString() {
        return this.constructor.name + '<' + this.getX() + ',' + this.getY() + '>';
    }
}
