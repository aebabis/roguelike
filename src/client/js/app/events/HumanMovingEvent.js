import PlayableCharacter from "../entities/creatures/PlayableCharacter.js";
import GameEvent from "./GameEvent.js";

export default class HumanMovingEvent extends GameEvent {
    /**
      * @class HumanMovingEvent
      * @description Event fired whenever the player has begun moving
      */
    constructor(dungeon, player) {
        super(dungeon);
        if(!(player instanceof PlayableCharacter)) {
            throw new Error('First parameter must be a PlayableCharacter');
        }
        this._player = player;
    }

    getText() {
        return this._player.getName() + ' moving.';
    }
}
