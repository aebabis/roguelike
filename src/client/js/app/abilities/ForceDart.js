import { default as Ability } from "./Ability.js";

export default class ForceDart extends Ability {
    use(dungeon, creature, optionalTargetTile) {
        super.use(dungeon, creature, optionalTargetTile);
        optionalTargetTile.getCreature().modifyHP(-2);
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
        return 1;
    }

    getDescription() {
        return "Does 2 magic damage to a target";
    }
}
