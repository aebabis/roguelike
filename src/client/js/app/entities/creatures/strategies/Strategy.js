//import Moves from '../moves/Moves';

export default class Strategy {
    getNextMove(dungeon, creature) {
        throw new Error('Default method not implemented');
    }

    // TODO: Only observe events?
    observeMove(dungeon, observer, actor, move) {
        if(observer.isEnemy(actor)) {
            if(move.constructor.name === 'MovementMove') {
                let currentLocation = dungeon.getTile(actor);
                this._lastKnownEnemyLocation = dungeon.getTile(currentLocation.getX(), currentLocation.getY());
            } else if(move.getAbility && actor.getAbility(move.getIndex()).isMovementAbility()) {
                let currentLocation = dungeon.getTile(actor);
                this._lastKnownEnemyLocation = dungeon.getTile(currentLocation.getX(), currentLocation.getY());
            }
        }
    }

    observeEvent(dungeon, event) {
        if(event.constructor.name === 'PositionChangeEvent') {
            const {x, y} = event.getToCoords();
            const tile = dungeon.getTile(x, y);
            this._lastKnownEnemyLocation = tile;
        }
    }
}
