import Consumable from './Consumable';

var AMOUNT = 5;

export default class BlueberrySoda extends Consumable {
    use(dungeon, creature) {
        creature.modifyMana(dungeon, this, AMOUNT);
    }

    getUseMessage(dungeon, creature) {
        return `${creature} drank a blueberry soda`;
    }

    getFriendlyDescription() {
        return `Restores ${AMOUNT} MP`;
    }
}
