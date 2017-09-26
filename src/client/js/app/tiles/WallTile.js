import Tile from './Tile';

export default class WallTile extends Tile {
    /**
      * @class WallTile
      * @description An opaque solid tile
      */
    constructor(x, y) {
        super(x, y);
    }

    isSolid() {
        return true;
    }

    isOpaque() {
        return true;
    }

    getName() {
        return 'Wall';
    }
}
