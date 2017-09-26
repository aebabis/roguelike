import Tile from './Tile';

export default class PitTile extends Tile {
    /**
      * @class PitTile
      * @description An open pit tile
      */
    constructor(x, y) {
        super(x, y);
    }

    hasFloor() {
        return false;
    }

    getName() {
        return 'Spike Pit';
    }
}
