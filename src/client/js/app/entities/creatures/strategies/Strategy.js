import { default as Creature } from "../Creature.js";

export default class Strategy {
    /**
     * @class Strategy
     */
    constructor(creature) {
        if(!(creature instanceof Creature)) {
            throw new Error('First parameter must be a Creature');
        }
        this._creature = creature;
    }

    observeMove(dungeon, observer, actor, move) {
        throw new Error('Default method not implemented');
    }

    getNextMove(dungeon, creature) {
        throw new Error('Default method not implemented');
    }
}
