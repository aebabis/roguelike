import Tile from './Tile.js';

export default class PitTile extends Tile {
    /**
      * @class PitTile
      * @description An open pit tile
      */
    constructor(dungeon, x, y) {
        super(dungeon, x, y);
    }

    hasFloor() {
        return false;
    }
}
