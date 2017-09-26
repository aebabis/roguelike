import Tile from './Tile';

export default class DoorTile extends Tile {
    /**
      * @class DoorTile
      * @description A tile that is opaque until a creature opens it
      */
    constructor(x, y) {
        super(x, y);
    }

    isSolid() {
        return false;
    }

    isOpaque() {
        return !this.isOpen();
    }

    isOpen() {
        return !!this.getCreature();
    }

    getName() {
        return 'Door';
    }
}
