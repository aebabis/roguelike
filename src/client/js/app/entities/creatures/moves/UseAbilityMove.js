import Move from './Move.js';

import AbilityEvent from '../../../events/AbilityEvent.js';

export default Move.UseAbilityMove = class UseAbilityMove extends Move {
    constructor(actorTile, index, x, y) {
        super(actorTile);
        if(!Number.isInteger(+index) || !Number.isInteger(+x) || !Number.isInteger(+y)) {
            throw new Error('Parameters must be integers: ' + arguments);
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

    getReasonIllegal(dungeon, creature, optionalTargetTile) {
        var ability = creature.getAbilities()[this.getIndex()];
        return ability.getReasonIllegal(dungeon, creature, optionalTargetTile);
    }

    getCostMultiplier() {
        return 1;
    }

    execute(dungeon, creature) {
        var x = this.getX();
        var y = this.getY();
        var tile = dungeon.getTile(x, y);
        var reason = this.getReasonIllegal(dungeon, creature, tile);
        if(reason) {
            throw new Error(reason);
        }
        var index = this._index;
        var ability = creature.getAbilities()[index];
        if(ability.isTargetted()) {
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
