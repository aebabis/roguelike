export default class Move {
    isLegal(dungeon, creature) {
        throw new Error('Abstract method not implemented');
    }

    _setReasonIllegal(reason) {
        this._reasonIllegal = reason;
    }

    getReasonIllegal() {
        if(this.isLegal()) {
            throw new Error("Move is legal");
        }
        return this._reasonIllegal;
    }

    getCostMultiplier() {
        throw new Error('Abstract method not implemented');
    }

    execute(dungeon, creature) {
        throw new Error('Abstract method not implemented');
    }
};
