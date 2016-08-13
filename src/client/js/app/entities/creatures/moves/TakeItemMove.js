import GameEvents from '../../../events/GameEvents.js';

import Move from './Move.js';

export default class TakeItemMove extends Move {
    constructor(actorTile, itemIndex) {
        super(actorTile);
        if(isNaN(itemIndex)) {
            throw new Error('Must pass two integer parameters or a Creature');
        }
        this._itemIndex = itemIndex;
    }

    getItemIndex() {
        return this._itemIndex;
    }

    getCostMultiplier() {
        return 0.5;
    }

    getReasonIllegal(dungeon, creature) {
        var location = dungeon.getTile(creature);
        var item = location.getItems()[this.getItemIndex()];
        if(!item) {
            return 'No item to take';
        } else if(!creature.canAddItem(item)) {
            return 'No room';
        } else {
            return null;
        }
    }

    execute(dungeon, creature) {
        var reason = this.getReasonIllegal(dungeon, creature);
        if(reason) {
            throw new Error(reason);
        }
        var item = dungeon.getTile(creature).removeItem(this.getItemIndex());
        creature.getInventory().addItem(item);
        dungeon.fireEvent(new GameEvents.TakeItemEvent(dungeon, creature, item));
        dungeon.fireEvent(new GameEvents.InventoryChangeEvent(dungeon, creature));
    }

    isSeenBy(dungeon, observer) {
        return observer.canSee(dungeon, dungeon.getTile(this.getActorX(), this.getActorY()));
    }
}
