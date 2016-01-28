import { default as CustomEvent } from "../../../events/CustomEvent.js";

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

    isLegal(dungeon, creature) {
        var inventory = creature.getInventory();
        var location = creature.getTile();
        var item = location.getItems()[this.getItemIndex()];
        if(!item) {
            return false;
        }
        if(item.getRange && item.getRange() === 1 && !inventory.getMeleeWeapon()) {
            return true;
        } else if(item.getRange && item.getRange() > 1 && !inventory.getRangedWeapon()) {
            return true;
        } else {
            return !inventory.isBackpackFull();
        }
    }

    execute(dungeon, creature) {
        var item = creature.getTile().removeItem(this.getItemIndex());
        var inventory = creature.getInventory();
        if(item.getRange && item.getRange() === 1 && !inventory.getMeleeWeapon()) {
            inventory.equipItem(item);
        } else if(item.getRange && item.getRange() > 1 && !inventory.getRangedWeapon()) {
            inventory.equipItem(item);
        } else {
            inventory.addItem(item);
        }
        dungeon.fireEvent(new CustomEvent(dungeon, creature.getName() + " took " + item.getName()));
    }
};
