export default class GameEvent {
    /**
      * @class GameEvent
      * @description Abstract base class for events in the game
      */
    constructor() {
    }

    /**
     * @function getText()
     * @description A text description of the event
     * @returns {String}
     */
    getText() {
        throw new Error('Abstract function not implemented');
    }
}
