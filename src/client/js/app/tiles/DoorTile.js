import Tile from './Tile.js';

export default class DoorTile extends Tile {
    /**
      * @class DoorTile
      * @description An opaque solid tile
      */
    constructor(dungeon, x, y) {
        super(dungeon, x, y);
        this._isOpen = false;
    }

    isSolid() {
        return false;
    }

    isOpaque() {
        return !this.isOpen();
    }

    isOpen() {
        return this._isOpen;
    }

    setCreature(creature) {
        super.setCreature(creature);
        this._isOpen = true;
    }

    getName() {
        return 'Door';
    }
}
