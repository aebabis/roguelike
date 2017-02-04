import GameEvent from './GameEvent.js';

export default class ItemDropEvent extends GameEvent {
    /**
      * @class ItemDropEvent
      * @description Event fired whenever an item is dropped or spawned
      */
    constructor(dungeon, item) {
        super(dungeon);
        this._item = item;
    }

    getItem() {
        return this._item;
    }

    getText() {
        const item = this.getItem();
        return `${item.getName()} dropped`;
    }
}
