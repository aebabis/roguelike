import Consumable from "./Consumable.js";

export default class CherrySoda extends Consumable {
    use(dungeon, creature, optionalTargetTile) {
        creature.heal(dungeon, 4);
    }

    getUseMessage(dungeon, creature, optionalTargetTile) {
        return `${creature} drank a cherry soda`
    }
}
