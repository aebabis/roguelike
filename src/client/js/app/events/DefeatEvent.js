import GameEvent from './GameEvent.js';

export default class DefeatEvent extends GameEvent {
    constructor(dungeon) {
        super(dungeon);
    }

    getText() {
        return 'Defeat';
    }
}
