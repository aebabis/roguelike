import { default as Dungeon } from "../dungeons/Dungeon.js";
import { default as Creature } from "../entities/creatures/Creature.js";

export default class Tile {
    /**
      * @class Tile
      * @description
      */
    constructor(dungeon, x, y) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error("First parameter must be a Dungeon");
        }
        if(isNaN(x) || isNaN(y)) {
            throw new Error('Must pass an x and y coordinate');
        }
        this._dungeon = dungeon;
        this._x = x;
        this._y = y;
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

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }

    isSolid() {
        return false;
    }

    isOpaque() {
        return false;
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

    toString() {
        return this.constructor.name + "<" + this.getX() + "," + this.getY() + ">";
    }
}
