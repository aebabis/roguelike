import GameEvent from './GameEvent.js';

export default class VictoryEvent extends GameEvent {
    constructor(dungeon) {
        super(dungeon);
    }

    getText() {
        return 'Victory';
    }
}
