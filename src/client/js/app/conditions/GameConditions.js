/**
 * Abstract base class for a pair of victory and defeat conditions.
 * Used for determining if a given game state represents
 * a win or loss (or neither) for the player. GameConditions should be stateless.
 */
export default class GameConditions {
    /**
     * Tells if the player has won the game
     * @param {Dungeon} dungeon - The dungeon being played
     * @return {boolean} - `true` if the player has won; `false` otherwise
     */
    hasPlayerWon(dungeon) {
        throw new Error('Abstract function not implemented');
    }

    /**
     * Tells if the player has lost the game
     * @param {Dungeon} dungeon - The dungeon being played
     * @return {boolean} - `true` if the player has lost; `false` otherwise
     */
    hasPlayerLost(dungeon) {
        const player = dungeon.getPlayableCharacter();
        return player && player.isDead();
    }
}
