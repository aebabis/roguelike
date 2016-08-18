import GameConditions from './GameConditions.js';
import TheTreasure from '../entities/TheTreasure.js';
import EntranceTile from '../tiles/EntranceTile.js';

/**
 * Victory and defeat conditions for a steal-the-treasure game
 */
export default class GetTheTreasureConditions extends GameConditions {
    /**
     * Tells if the player has won by stealing the treasure
     * @param {Dungeon} dungeon - The dungeon being played
     * @returns {Boolean} - `true` if the player has the treasure in their position
     * and is standing at the entrance; `false` otherwise
     */
    hasPlayerWon(dungeon) {
        const player = dungeon.getPlayableCharacter();

        return !this.hasPlayerLost(dungeon) &&
                player.getInventory().getBackpack().find((item) => item instanceof TheTreasure) &&
                dungeon.getTile(player) instanceof EntranceTile;
    }
}
