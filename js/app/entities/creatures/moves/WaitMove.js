import { default as Move } from './Move.js';
import { default as CustomEvent } from '../../../events/CustomEvent.js';

export default Move.WaitMove = class WaitMove extends Move {
    isLegal() {
        return true;
    }

    execute(dungeon, creature) {
        // Does modify game state
        dungeon.fireEvent(new CustomEvent(dungeon, 'Creature waited'));
    }

    getCostMultiplier() {
        return .5;
    }
};
