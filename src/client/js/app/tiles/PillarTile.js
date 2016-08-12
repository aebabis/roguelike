import Tile from './Tile.js';

export default class PillarTile extends Tile {
    /**
      * @class PillarTile
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

    getName() {
        return 'Pillar';
    }
}
