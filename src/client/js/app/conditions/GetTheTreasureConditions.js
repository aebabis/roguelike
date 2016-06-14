import { default as GameConditions } from './GameConditions.js';
import { default as TheTreasure } from '../entities/TheTreasure.js';
import { default as EntranceTile } from '../tiles/EntranceTile.js';

export default class GetTheTreasureConditions extends GameConditions {
    /**
     * @function hasPlayerWon
     * @description Tells if the player has won
     * @returns {Boolean}
     */
    hasPlayerWon(dungeon) {
        var player = dungeon.getPlayableCharacter();

        // Last Creature standing
        return !this.hasPlayerLost(dungeon) &&
                player.getInventory().getBackpack().find((item) => item instanceof TheTreasure) &&
                dungeon.getTile(player) instanceof EntranceTile;
    }
}
