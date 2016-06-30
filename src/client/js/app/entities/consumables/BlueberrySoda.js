import Consumable from './Consumable.js';

var AMOUNT = 3;

export default class BlueberrySoda extends Consumable {
    use(dungeon, creature) {
        creature.modifyMana(3);
    }

    getUseMessage(dungeon, creature) {
        return `${creature} drank a blueberry soda`
    }

    getFriendlyDescription() {
        return `Restores ${AMOUNT} MP`;
    }
}
