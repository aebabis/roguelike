import Ability from "./Ability.js";
import DamageTypes from "../entities/DamageTypes.js";

export default class ForceDart extends Ability {
    use(dungeon, creature, optionalTargetTile) {
        super.use(dungeon, creature, optionalTargetTile);
        optionalTargetTile.getCreature().receiveDamage(dungeon, -2, DamageTypes.ENERGY);
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
