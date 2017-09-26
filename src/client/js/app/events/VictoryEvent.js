import GameEvent from './GameEvent';

export default class VictoryEvent extends GameEvent {
    constructor(dungeon) {
        super(dungeon);
    }

    getText() {
        return 'Victory';
    }
}
