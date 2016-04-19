import { default as Move } from "./Move.js";

import { default as AbilityEvent } from "../../../events/AbilityEvent.js";

export default Move.UseAbilityMove = class UseAbilityMove extends Move {
    constructor(index, x, y) {
        super();
        this._index = index;
        this._x = x;
        this._y = y;
    }

    isLegal(dungeon, creature) {
        // TODO: implement
        return true;
    }

    getCostMultiplier() {
        return 1;
    }

    execute(dungeon, creature) {
        var index = this._index;
        var ability = creature.getAbilities()[index];
        if(ability.isTargetted()) {
            var x = this._x;
            var y = this._y;
            var tile = dungeon.getTile(x, y);
            ability.use(dungeon, creature, tile);
            dungeon.fireEvent(new AbilityEvent(dungeon, creature, ability, tile));
        } else {
            ability.use(dungeon, creature);
            dungeon.fireEvent(new AbilityEvent(dungeon, creature, ability));
        }
    }

    isSeenBy(dungeon, actor, observer) {
        return true;
    }
};
