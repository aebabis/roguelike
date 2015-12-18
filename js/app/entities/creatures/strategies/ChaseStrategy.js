import { default as Creature } from "../Creature.js";

export default class ChaseStrategy { // TODO: Would a concrete
    /**
     * @class ChaseStrategy
     * @description Simple strategy for chasing enemies
     */
    constructor(creature, preferRanged) {
        if(!(creature instanceof Creature)) {
            throw new Error('First parameter must be a Creature');
        }
        this._creature = creature;
        this._preferRanged = !!preferRanged;
    }

    getNextMove() {
        var self = this;
        var creature = this._creature;
        return function() {
            var occupiedTile = creature.getLocation().getNeighbors8().filter(function(tile) {
                var other = tile.getCreature();
                return other && creature.isEnemy(other);
            })[0];
            if(occupiedTile) {
                creature.attack(occupiedTile.getX(), occupiedTile.getY());
                self._lastKnownEnemyLocation = occupiedTile;
            } else {
                var enemy = creature.getVisibleEnemies()[0];
                if(enemy) {
                    creature.moveToward(enemy);
                    self._lastKnownEnemyLocation = enemy.getLocation();
                } else {
                    var tile = self._lastKnownEnemyLocation;
                    if(tile && tile !== creature.getLocation()) {
                        creature.moveToward(tile);
                    }
                }
            }
        };
    }
}
