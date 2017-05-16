import Consumable from './Consumable.js';

var AMOUNT = 4;

export default class CherrySoda extends Consumable {
    use(dungeon, creature) {
        creature.heal(dungeon, this, AMOUNT);
    }

    getUseMessage(dungeon, creature) {
        return `${creature} drank a cherry soda`;
    }

    getFriendlyDescription() {
        return `Restores ${AMOUNT} HP`;
    }
}
