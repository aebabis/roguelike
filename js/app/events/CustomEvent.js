import { default as GameEvent } from "./GameEvent.js";

export default class CustomEvent extends GameEvent {
    /**
      * @class CustomEvent
      * @description Custom event class for one-off and/or debugging events
      */
    constructor(dungeon, message) {
        super(dungeon);
        console.log(dungeon, message);
        this._message = message;
    }

    getText() {
        return this._message;
    }
}
