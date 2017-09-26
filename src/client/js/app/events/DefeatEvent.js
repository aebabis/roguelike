import GameEvent from './GameEvent';

export default class DefeatEvent extends GameEvent {
    constructor(dungeon) {
        super(dungeon);
    }

    getText() {
        return 'Defeat';
    }
}
