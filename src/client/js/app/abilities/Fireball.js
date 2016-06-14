import { default as Ability } from "./Ability.js";

const FIREBALL_DAMAGE = 5;

export default class Fireball extends Ability {
    use(dungeon, creature, optionalTargetTile) {
        super.use(dungeon, creature, optionalTargetTile);
        optionalTargetTile.getNeighbors8().concat(optionalTargetTile)
                .map((tile)=>tile.getCreature()).filter(Boolean)
                .forEach(function(creature) {
            creature.receiveDamage(dungeon, -FIREBALL_DAMAGE, true);
        });
    }

    isTargetted() {
        return true;
    }

    isTargetCreature() {
        return false;
    }

    getRange() {
        return 5;
    }

    getManaCost() {
        return 8;
    }

    getDescription() {
        return "Does fire damage to creatures in a 3x3 area.";
    }
}
