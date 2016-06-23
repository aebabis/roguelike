import Consumable from "./Consumable.js";

var AMOUNT = 3;

export default class BlueberrySoda extends Consumable {
    use(dungeon, creature, optionalTargetTile) {
        creature.modifyMana(3);
    }

    getUseMessage(dungeon, creature, optionalTargetTile) {
        return `${creature} drank a blueberry soda`
    }

    getFriendlyDescription() {
        return `Restores ${AMOUNT} MP`;
    }
}
