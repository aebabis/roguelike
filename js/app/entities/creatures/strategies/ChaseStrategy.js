import { default as Strategy } from "./Strategy.js";
import { default as Creature } from "../Creature.js";
import { default as Dungeon } from "../../../dungeons/Dungeon.js";

import { default as Move } from "../moves/Move.js";
import { default as Pather } from "./Pather.js";

export default class ChaseStrategy extends Strategy {
    /**
     * @class ChaseStrategy
     * @description Simple strategy for chasing enemies
     */
    constructor(creature) {
        super(creature);
    }

    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error("First parameter must be a Dungeon")
        } else if(!(creature instanceof Creature)) {
            throw new Error("Second parameter must be a Creature");
        }
        var self = this;
        var creature = this._creature;
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
                return new Move.AttackMove(meleeTarget);
            } else {
                // TODO: Run away?
                return new Move.WaitMove();
            }
            this._lastKnownEnemyLocation = meleeTarget.getTile();
        } else if(rangedTarget) {
            if(rangedWeapon && rangedWeapon.getRange() >= tile.getDirectDistance(rangedTarget.getTile())) {
                return new Move.AttackMove(rangedTarget);
            } else {
                return Pather.getMoveToward(dungeon, tile, rangedTarget.getTile())
                        || new Move.WaitMove();
            }
            this._lastKnownEnemyLocation = rangedTarget.getTile();
        } else if(this._lastKnownEnemyLocation) {
            return Pather.getMoveToward(dungeon, tile, this._lastKnownEnemyLocation);
        } else {
            return new Move.WaitMove();
        }
    }

    observeMove(dungeon, observer, actor, move) {
        //console.log(`${observer} saw ${actor} perform a ${move}`);
    }
}
