import { default as Strategy } from "./Strategy.js";
import { default as Creature } from "../Creature.js";

export default class ChaseStrategy extends Strategy {
    /**
     * @class ChaseStrategy
     * @description Simple strategy for chasing enemies
     */
    constructor(creature) {
        super(creature);
    }

    getNextMove() {
        var self = this;
        var creature = this._creature;
        return function() {
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
                    creature.attack(meleeTarget);
                } else {
                    // TODO: Run away?
                    creature.wait();
                }
                self._lastKnownEnemyLocation = meleeTarget;
            } else if(rangedTarget) {
                if(rangedWeapon && rangedWeapon.getRange() >= tile.getDirectDistance(rangedTarget.getTile())) {
                    creature.attack(rangedTarget);
                } else {
                    creature.moveToward(rangedTarget.getTile());
                }
                self._lastKnownEnemyLocation = rangedTarget;
            } else if(self._lastKnownEnemyLocation) {
                creature.moveToward(self._lastKnownEnemyLocation)
            } else {
                creature.wait();
            }
        };
    }
}
