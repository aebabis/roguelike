import { default as PlayableCharacter } from "../entities/creatures/PlayableCharacter.js";
import { default as GameEvent } from "./GameEvent.js";

export default class HumanToMoveEvent extends GameEvent {
    /**
      * @class HumanToMoveEvent
      * @description Event fired when it is the player's turn to move
      */
    constructor(player) {
        super();
        if(!(player instanceof PlayableCharacter)) {
            throw new Error('First parameter must be a PlayableCharacter');
        }
        this._player = player;
    }

    getText() {
        return this._player.toString() + ' to move.';
    }
}
