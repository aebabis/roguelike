import GameEvent from './GameEvent';

export default class CustomEvent extends GameEvent {
    /**
      * @class CustomEvent
      * @description Custom event class for one-off and/or debugging events
      */
    constructor(dungeon, message) {
        super(dungeon);
        this._message = message;
    }

    getText() {
        return this._message;
    }
}
