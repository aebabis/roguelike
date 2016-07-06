//import Moves from '../moves/Moves.js';

export default class Strategy {
    getNextMove(dungeon, creature) {
        throw new Error('Default method not implemented');
    }

    observeMove(dungeon, observer, actor, move) {
        if(observer.isEnemy(actor)) {
            if(move.getDx) {
                let currentLocation = dungeon.getTile(actor);
                this._lastKnownEnemyLocation = dungeon.getTile(currentLocation.getX(), currentLocation.getY());
            } else if(move.getAbility && actor.getAbility(move.getIndex()).isMovementAbility()) {
                let currentLocation = dungeon.getTile(actor);
                this._lastKnownEnemyLocation = dungeon.getTile(currentLocation.getX(), currentLocation.getY());
            }
        }
    }
}
