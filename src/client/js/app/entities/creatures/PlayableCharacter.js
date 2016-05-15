import { default as Creature } from "./Creature.js";

import { default as Move } from "./moves/Move.js";

import { default as Inventory } from "./Inventory.js";

export default class PlayableCharacter extends Creature {
    /**
      * @class PlayableCharacter
      * @description The creature controlled by the player
      */
    constructor(dungeon) {
        super(dungeon);
        this._moveQueue = [];
        this._inventory = new Inventory(4);
    }

    move(dx, dy)  {
        super.move(dx, dy);
        this._updateVisionMap();
    }

    _updateVisionMap() {
        var self = this;
        var dungeon = this.getDungeon();
        var visionMap = this._visionMap;
        if(!visionMap) {
            visionMap = this._visionMap = this._visionMap = new Array(dungeon.getWidth()).fill(0).map(()=>new Array(dungeon.getHeight()));
        }
        dungeon.forEachTile(function(tile, x, y) {
            visionMap[x][y] = visionMap[x][y] || self.canSee(tile);
        });
    }

    setNextMove(move) {
        if(!(move instanceof Move)) {
            throw new Error(move + " is not a Move");
        }
        this._moveQueue.push(move);
    }

    hasMoveQueued() {
        return this._moveQueue.length > 0;
    }

    getNextMove() {
        var read = this._moveQueue;
        if(read.length) {
            return read.shift();
        } else {
            throw new Error('PlayableCharacter doesn\'t have move queued');
        }
    }

    getBaseHP() {
        return 10;
    }

    getSpeed() {
        return 450;
    }

    toString() {
        return 'PlayableCharacter';
    }
}
