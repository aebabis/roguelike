import GameEvent from './GameEvent';

export default class ItemDropEvent extends GameEvent {
    /**
      * @class ItemDropEvent
      * @description Event fired whenever an item is dropped or spawned
      */
    constructor(dungeon, tile, item) {
        super(dungeon);
        this._tile = tile;
        this._item = item;
    }

    getTile() {
        return this._tile;
    }

    getItem() {
        return this._item;
    }

    getText() {
        const item = this.getItem();
        return `${item.getName()} dropped`;
    }
}
