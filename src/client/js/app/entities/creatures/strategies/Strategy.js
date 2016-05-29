import { default as Creature } from "../Creature.js";

export default class Strategy {
    getNextMove(dungeon, creature) {
        throw new Error('Default method not implemented');
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
