import { default as PlayableCharacter } from "../entities/creatures/PlayableCharacter.js";
import { default as GameEvent } from "./GameEvent.js";

export default class HumanMovingEvent extends GameEvent {
    /**
      * @class HumanMovingEvent
      * @description Event fired whenever the player has begun moving
      */
    constructor(player) {
        super();
        if(!(player instanceof PlayableCharacter)) {
            throw new Error('First parameter must be a PlayableCharacter');
        }
        this._player = player;
    }

    getText() {
        return this._player.toString() + ' moving.';
    }
}
