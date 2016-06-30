import Move from './Move.js';
import GameEvents from '../../../events/GameEvents.js';

export default class WaitMove extends Move {
    getReasonIllegal() {
        // Waiting is always legal
        return null;
    }

    execute(dungeon, creature) {
        // Does modify game state
        dungeon.fireEvent(new GameEvents.WaitEvent(dungeon, creature));
    }

    getCostMultiplier() {
        return .5;
    }


    isSeenBy(dungeon, observer) {
        return observer.canSee(dungeon, dungeon.getTile(this.getActorX(), this.getActorY()));
    }
}
