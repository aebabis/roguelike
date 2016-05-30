export default class Move {
    getReasonIllegal(dungeon, creature) {
        throw new Error('Abstract method not implemented');
    }

    getCostMultiplier() {
        throw new Error('Abstract method not implemented');
    }

    execute(dungeon, creature) {
        throw new Error('Abstract method not implemented');
    }

    isSeenBy(dungeon, creature) {
        throw new Error('Abstract method not implemented');
    }
};
