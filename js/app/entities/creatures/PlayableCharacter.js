import { default as Creature } from "./Creature.js";

export default class PlayableCharacter extends Creature {
    /**
      * @class Tile
      * @description
      */
    constructor(dungeon) {
        super(dungeon);
        this.test = 'Chatar';
        this._readQueue = [];
        this._writeQueue = [];
    }

    _queueWrite() {
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
        var write = this._writeQueue;
        if(write.length) {
            write.shift().resolve(move);
        } else {
            this._readQueue.push(Promise.resolve(move));
        }
    }

    getNextMove() {
        var read = this._readQueue;
        if(read.length) {
            return read.shift();
        } else {
            var res;
            var promise = new Promise(function(resolve, reject) {
                res = resolve;
            });
            this._writeQueue.push({
                move: promise,
                resolve: res
            });
            return promise;
        }
    }

    getBaseHP() {
        return 10;
    }

    getSpeed() {
        return 1;
    }

    toString() {
        return 'PlayableCharacter';
    }
}
