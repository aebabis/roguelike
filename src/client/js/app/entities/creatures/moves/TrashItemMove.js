import GameEvents from '../../../events/GameEvents';
import TheTreasure from '../../TheTreasure';

import Move from './Move';

export default class TrashItemMove extends Move {
    constructor(actorTile, itemIndex) {
        super(actorTile);
        if(!Number.isInteger(+itemIndex)) {
            throw new Error('Item index must be an integer');
        }
        this._itemIndex = +itemIndex;
    }

    getItemIndex() {
        return this._itemIndex;
    }

    getCostMultiplier() {
        return 0.5;
    }

    getReasonIllegal(dungeon, creature) {
        var inventory = creature.getInventory();
        var item = inventory.getItem(this.getItemIndex());
        if(!item) {
            return `No item in slot ${this.getItemIndex()}`;
        } else if(item instanceof TheTreasure) {
            return 'Cannot trash The Treasure';
        } else {
            return null;
        }
    }

    execute(dungeon, creature) {
        var reason = this.getReasonIllegal(dungeon, creature);
        if(reason) {
            throw new Error(reason);
        }
        var item = creature.getInventory().removeItem(this.getItemIndex());
        dungeon.fireEvent(new GameEvents.TrashItemEvent(dungeon, creature, item));
        dungeon.fireEvent(new GameEvents.InventoryChangeEvent(dungeon, creature));
    }

    isSeenBy(dungeon, observer) {
        return observer.canSee(dungeon, dungeon.getTile(this.getActorX(), this.getActorY()));
    }
}
