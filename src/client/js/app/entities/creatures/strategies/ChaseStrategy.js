import { default as Strategy } from "./Strategy.js";
import { default as Creature } from "../Creature.js";
import { default as Dungeon } from "../../../dungeons/Dungeon.js";

import { default as Moves } from "../moves/Moves.js";
import { default as Pather } from "./Pather.js";

/**
 * @class ChaseStrategy
 * @description Simple strategy for chasing enemies
 */
export default class ChaseStrategy extends Strategy {
    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error("First parameter must be a Dungeon")
        } else if(!(creature instanceof Creature)) {
            throw new Error("Second parameter must be a Creature");
        }
        var self = this;
        var tile = creature.getTile();
        var meleeWeapon = creature.getMeleeWeapon();
        var rangedWeapon = creature.getRangedWeapon();
        var quarry;
        var enemies = creature.getVisibleEnemies().sort(function(enemy1, enemy2) {
            var d1 = tile.getDirectDistance(enemy1.getTile());
            var d2 = tile.getDirectDistance(enemy2.getTile());
            if(d1 < d2) {
                return 1;
            } else if(d1 > d2) {
                return -1;
            } else {
                return 0;
            }
        });

        var meleeTarget;
        var rangedTarget;

        if(enemies[0] && enemies[0].getTile().getDirectDistance(tile) === 1) {
            meleeTarget = enemies[0];
        }
        rangedTarget = enemies.find(function(enemy) {
            return tile.getDirectDistance(enemy.getTile()) > 1;
        });

        if(meleeTarget) {
            if(meleeWeapon) {
                return new Moves.AttackMove(meleeTarget);
            }
        } else if(rangedTarget) {
            if(rangedWeapon && rangedWeapon.getRange() >= tile.getDirectDistance(rangedTarget.getTile())) {
                return new Moves.AttackMove(rangedTarget);
            } else {
                return Pather.getMoveToward(dungeon, tile, rangedTarget.getTile());
            }
        } else if(this._lastKnownEnemyLocation) {
            // TODO: Write a unit test for waiting when there's no path
            return Pather.getMoveToward(dungeon, tile, this._lastKnownEnemyLocation);
        }

        return null;
    }

    observeMove(dungeon, observer, actor, move) {
        if(observer.isEnemy(actor) && move.getDx) {
            var currentLocation = actor.getTile();
            var newX = currentLocation.getX() + move.getDx();
            var newY = currentLocation.getY() + move.getDy();
            this._lastKnownEnemyLocation = dungeon.getTile(newX, newY);
        }
    }
}
