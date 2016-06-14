import { default as GameEvents } from "../../../events/GameEvents.js";

import { default as Move } from "./Move.js";

export default Move.TakeItemMove = class TakeItemMove extends Move {
    constructor(itemIndex) {
        super();
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
        var inventory = creature.getInventory();
        var location = dungeon.getTile(creature);
        var item = location.getItems()[this.getItemIndex()];
        if(!item) {
            return 'No item to take';
        } else if(item.getRange && item.getRange() === 1 && !inventory.getMeleeWeapon()) {
            return null;
        } else if(item.getRange && item.getRange() > 1 && !inventory.getRangedWeapon()) {
            return null;
        } else if(inventory.isBackpackFull()){
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
        var inventory = creature.getInventory();
        if(item.getRange && item.getRange() === 1 && !inventory.getMeleeWeapon()) {
            inventory.equipItem(item);
        } else if(item.getRange && item.getRange() > 1 && !inventory.getRangedWeapon()) {
            inventory.equipItem(item);
        } else {
            inventory.addItem(item);
        }
        dungeon.fireEvent(new GameEvents.TakeItemEvent(dungeon, creature, item));
    }

    isSeenBy(dungeon, actor, observer) {
        return observer.canSee(dungeon, dungeon.getTile(actor));
    }
};
