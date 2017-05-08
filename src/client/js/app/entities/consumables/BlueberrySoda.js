import Consumable from './Consumable.js';

var AMOUNT = 5;

export default class BlueberrySoda extends Consumable {
    use(dungeon, creature) {
        creature.modifyMana(AMOUNT);
    }

    getUseMessage(dungeon, creature) {
        return `${creature} drank a blueberry soda`;
    }

    getFriendlyDescription() {
        return `Restores ${AMOUNT} MP`;
    }
}
