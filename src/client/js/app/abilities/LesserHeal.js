import Ability from './Ability.js';

var HEAL_AMOUNT = 2;

export default class LesserHeal extends Ability {
    use(dungeon, creature, optionalTargetTile, isFree) {
        super.use(dungeon, creature, optionalTargetTile, isFree);
        optionalTargetTile.getCreature().heal(dungeon, HEAL_AMOUNT);
    }

    isTargetted() {
        return true;
    }

    isTargetCreature() {
        return true;
    }

    getRange() {
        return 5;
    }

    getManaCost() {
        return 2;
    }

    getDescription() {
        return `Heals target for ${HEAL_AMOUNT} HP`;
    }
}
