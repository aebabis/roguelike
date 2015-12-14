import { default as Creature } from "./Creature.js";
import { default as PlayableCharacter } from "./PlayableCharacter.js";

export default class BlackVoidSphere extends Creature {
    /**
     * @class BlackVoidSphere
     * @description Basic melee enemy. Chases the player
     */
    constructor(dungeon) {
        super(dungeon);
    }

    getNextMove() {
        var self = this;
        return function() {
            var occupiedTile = self.getLocation().getNeighbors8().find(function(tile) {
                return tile.getCreature() instanceof PlayableCharacter;
            });
            if(occupiedTile) {
                self.attack(occupiedTile.getX(), occupiedTile.getY());
            } else {
                var enemy = self.getVisibleEnemies()[0];
                if(enemy) {
                    self.moveToward(enemy);
                }
            }
        };
    }

    getSpeed() {
        return 2;
    }
}
