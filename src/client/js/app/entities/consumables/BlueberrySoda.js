import Consumable from "./Consumable.js";

export default class BlueberrySoda extends Consumable {
    use(dungeon, creature, optionalTargetTile) {
        creature.modifyMana(3);
    }

    getUseMessage(dungeon, creature, optionalTargetTile) {
        return `${creature} drank a blueberry soda`
    }
}
