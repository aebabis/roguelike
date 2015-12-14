import { default as GameEvent } from "./GameEvent.js";

export default class DebugEvent extends GameEvent {
    /**
      * @class DebugEvent
      * @description Can be fired as a one-off event for debugging
      */
    constructor(message) {
        super();
        this._message = message;
    }

    getText() {
        return 'DebugEvent: ' + this._message;
    }
}
