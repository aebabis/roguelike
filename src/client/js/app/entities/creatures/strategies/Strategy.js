import { default as Creature } from "../Creature.js";

export default class Strategy {
    observeMove(dungeon, observer, actor, move) {
        throw new Error('Default method not implemented');
    }

    getNextMove(dungeon, creature) {
        throw new Error('Default method not implemented');
    }
}
