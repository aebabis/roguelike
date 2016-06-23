import Consumable from "./Consumable.js";

var AMOUNT = 4;

export default class CherrySoda extends Consumable {
    use(dungeon, creature, optionalTargetTile) {
        creature.heal(dungeon, AMOUNT);
    }

    getUseMessage(dungeon, creature, optionalTargetTile) {
        return `${creature} drank a cherry soda`
    }

    getFriendlyDescription() {
        return `Restores ${AMOUNT} HP`;
    }
}
