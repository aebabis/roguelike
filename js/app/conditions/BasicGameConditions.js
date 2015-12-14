import { default as GameConditions } from './GameConditions.js';

export default class BasicGameConditions extends GameConditions {
    /**
      * @class GameConditions
      * @description Game win and loss conditions for a kill-all-enemies game
      */
    constructor() {
        super();
    }

    /**
     * @function hasPlayerWon
     * @description Tells if the player has won
     * @returns {Boolean}
     */
    hasPlayerWon(dungeon) {
        // Last Creature standing
        return !this.hasPlayerLost(dungeon) && dungeon.getCreatures().length === 1;
    }

    /**
     * @function hasPlayerLost
     * @description Tells if the player has won
     * @returns {Boolean}
     */
    hasPlayerLost(dungeon) {
        return dungeon.getPlayableCharacter().isDead();
    }
}
