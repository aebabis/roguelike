import CustomEvent from "../../../events/CustomEvent.js";

import Move from "./Move.js";

export default Move.UseItemMove = class UseItemMove extends Move {
    constructor(position, targetTile) {
        super();
        this._position = position;
        if(targetTile) {
            this._target = {
                x: targetTile.getX(),
                y: targetTile.getY()
            }
        }
    }

    getReasonIllegal(dungeon, creature) {
        var position = this.getItemPosition();
        var targetLocation = this.getTargetLocation();
        if(targetLocation && dungeon.getTile(targetLocation.x, targetLocation.y) == null) {
            return 'Illegal target tile';
        }
        var inventory = creature.getInventory();
        var item = inventory.getItem(position);
        if(!item) {
            return 'No item at position: ' + position;
        }
        return null;
    }

    getCostMultiplier() {
        return 1;
    }

    getItemPosition() {
        return this._position;
    }

    getTargetLocation() {
        return this._target;
    }

    execute(dungeon, creature) {
        var reason = this.getReasonIllegal(dungeon, creature);
        if(reason) {
            throw new Error(reason);
        }
        var position = this.getItemPosition();
        var targetLocation = this.getTargetLocation();
        if(targetLocation) {
            var targetTile = dungeon.getTile(targetLocation.x, targetLocation.y);
        }
        var inventory = creature.getInventory();
        var item = inventory.getItem(position);
        if(!item) {
            throw new Error('No item at position: ' + position);
        }
        if(item.isEquipable() && !isNaN(position)) {
            // Equipable items in backpack are used by equipping them
            inventory.equipItem(position);
            dungeon.fireEvent(new CustomEvent(dungeon, creature + " equipped " + item));
        } else {
            item.use(dungeon);
            dungeon.fireEvent(new CustomEvent(dungeon, item.getUseMessage(this, targetTile)));
        }
    }

    isSeenBy(dungeon, actor, observer) {
        return false; // TODO: Implement
    }
};
