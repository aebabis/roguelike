import GameConditions from './GameConditions.js';

/**
 * Game win and loss conditions for a kill-all-enemies game
 */
export default class BasicGameConditions extends GameConditions {
    /**
     * Tells if the player has won by eliminating all enemies in the dungeon
     * @param {Dungeon} dungeon - The dungeon being played
     * @returns {Boolean} - `true` if the player is the only creature left; `false` otherwise
     */
    hasPlayerWon(dungeon) {
        return !this.hasPlayerLost(dungeon) && dungeon.getCreatures().length === 1;
    }
}
