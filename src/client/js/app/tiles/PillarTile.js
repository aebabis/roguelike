import Tile from './Tile.js';

export default class PillarTile extends Tile {
    /**
      * @class PillarTile
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
        return 'Pillar';
    }
}
