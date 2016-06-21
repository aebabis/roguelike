export default class Move {
    constructor(actorTile) {
        this._actorX = actorTile.getX();
        this._actorY = actorTile.getY();
    }

    getActorX() {
        return this._actorX;
    }

    getActorY() {
        return this._actorY;
    }

    getReasonIllegal(dungeon, creature) {
        throw new Error('Abstract method not implemented');
    }

    getCostMultiplier() {
        throw new Error('Abstract method not implemented');
    }

    execute(dungeon, creature) {
        throw new Error('Abstract method not implemented');
    }

    isSeenBy(dungeon, observer) {
        throw new Error('Abstract method not implemented');
    }
};
