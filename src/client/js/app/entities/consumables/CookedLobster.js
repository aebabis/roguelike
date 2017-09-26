import Consumable from './Consumable';

var HEAL_AMOUNT = 2;
var MANA_AMOUNT = 2;

export default class CookedLobster extends Consumable {
    use(dungeon, creature) {
        creature.heal(dungeon, this, HEAL_AMOUNT);
        creature.modifyMana(dungeon, this, MANA_AMOUNT);
    }

    getUseMessage(dungeon, creature) {
        return `${creature} ate a lobster`;
    }

    getFriendlyDescription() {
        return `Restores ${HEAL_AMOUNT} HP and ${MANA_AMOUNT} mana`;
    }
}
