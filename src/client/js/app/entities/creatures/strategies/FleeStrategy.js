import { default as Strategy } from "./Strategy.js";
import { default as Creature } from "../Creature.js";
import { default as Dungeon } from "../../../dungeons/Dungeon.js";

import { default as Moves } from "../moves/Moves.js";

export default class FleeStrategy extends Strategy {
    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error("First parameter must be a Dungeon")
        } else if(!(creature instanceof Creature)) {
            throw new Error("Second parameter must be a Creature");
        }
        var self = this;
        var tile = creature.getTile();

        var enemies = creature.getVisibleEnemies();
        if(enemies.length === 0) {
            return null;
        } else {
            var quarry = enemies.reduce(function(enemy1, enemy2) {
                var d1 = tile.getDirectDistance(enemy1.getTile());
                var d2 = tile.getDirectDistance(enemy2.getTile());
                if(d1 <= d2) {
                    return enemy1;
                } else {
                    return enemy2;
                }
            });

            var surroundingTiles = tile.getNeighbors8().filter((tile) => {
                return creature.canOccupyNow(tile);
            }).filter((tile) => {
                // Fleeing creature won't stand next to enemy
                return !tile.getNeighbors8().find((tile)=>tile.getCreature() && tile.getCreature().isEnemy(creature));
            })

            if(surroundingTiles.length === 0) {
                return null;
            } else {
                var target = surroundingTiles.reduce(function(tile1, tile2) {
                    var d1 = tile.getDirectDistance(tile1);
                    var d2 = tile.getDirectDistance(tile2);
                    return d1 > d2 ? tile1 : tile2;
                });

                var dx = target.getX() - tile.getX();
                var dy = target.getY() - tile.getY();

                return new Moves.MovementMove(dx, dy);
            }
        }
    }
}