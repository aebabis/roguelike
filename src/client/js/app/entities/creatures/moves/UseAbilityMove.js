import Move from './Move.js';

import AbilityEvent from '../../../events/AbilityEvent.js';

export default class UseAbilityMove extends Move {
    constructor(actorTile, index, x, y) { // TODO: Consider passing target tile
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

    getReasonIllegal(dungeon, creature) {
        const ability = creature.getAbilities()[this.getIndex()];
        const tile = dungeon.getTile(this.getX(), this.getY());
        return ability.getReasonIllegal(dungeon, creature, tile);
    }

    getCostMultiplier() {
        return 1;
    }

    execute(dungeon, creature) {
        const x = this.getX();
        const y = this.getY();
        const tile = dungeon.getTile(x, y);
        const reason = this.getReasonIllegal(dungeon, creature, tile);
        if(reason) {
            throw new Error(reason);
        }
        const index = this._index;
        const ability = creature.getAbilities()[index];
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
}
