import Move from "./Move.js";

import AbilityEvent from "../../../events/AbilityEvent.js";

export default Move.UseAbilityMove = class UseAbilityMove extends Move {
    constructor(actorTile, index, x, y) {
        super(actorTile);
        if(!Number.isInteger(+index) || !Number.isInteger(+x) || !Number.isInteger(+y)) {
            throw new Error('Parameters must be integers: ' + arguments)
        }
        this._index = +index;
        this._x = +x;
        this._y = +y;
    }

    getIndex() {
        return this._index;
    }

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }

    getReasonIllegal(dungeon, creature) {
        var ability = creature.getAbilities()[this.getIndex()];
        if(ability.getManaCost() > creature.getCurrentMana()) {
            return 'Not enough mana';
        }
        if(ability.isTargetted()) {
            var tile = dungeon.getTile(this.getX(), this.getY());
            if(!creature.canSee(dungeon, tile)) {
                return 'Can\'t see target';
            }
            if(dungeon.getTile(creature).getEuclideanDistance(tile) > ability.getRange()) {
                return 'Target out of range';
            }
        }
        return null;
    }

    getCostMultiplier() {
        return 1;
    }

    execute(dungeon, creature) {
        var reason = this.getReasonIllegal(dungeon, creature);
        if(reason) {
            throw new Error(reason);
        }
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

    isSeenBy(dungeon, observer) {
        return observer.canSee(dungeon, dungeon.getTile(this.getActorX(), this.getActorY()));
    }
};
