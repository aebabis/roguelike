import { default as Move } from './Move.js';
import { default as CustomEvent } from '../../../events/CustomEvent.js';

export default Move.WaitMove = class WaitMove extends Move {
    getReasonIllegal(dungeon, creature) {
        return null;
    }

    execute(dungeon, creature) {
        // Does modify game state
        dungeon.fireEvent(new CustomEvent(dungeon, 'Creature waited'));
    }

    getCostMultiplier() {
        return .5;
    }


    isSeenBy(dungeon, actor, observer) {
        return observer.canSee(actor.getTile());
    }
};
