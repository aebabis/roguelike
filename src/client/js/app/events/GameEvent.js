import Dungeon from '../dungeons/Dungeon.js';

export default class GameEvent {
    /**
      * @class GameEvent
      * @description Abstract base class for events in the game
      */
    constructor(dungeon) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error('First parameter must be a Dungeon');
        }
        this._timestamp = dungeon.getCurrentTimestep();
    }

    /**
     * @function getTimestamp()
     * @description Gets the time of this event in dungeon timesteps
     * @returns {Number}
     */
    getTimestamp() {
        return this._timestamp;
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
