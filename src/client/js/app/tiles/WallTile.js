import Tile from './Tile.js';

export default class WallTile extends Tile {
    /**
      * @class WallTile
      * @description An opaque solid tile
      */
    constructor(dungeon, x, y) {
        super(dungeon, x, y);
    }

    isSolid() {
        return true;
    }

    isOpaque() {
        return true;
    }
}
