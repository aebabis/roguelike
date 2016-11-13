import PlayableCharacter from '../PlayableCharacter.js';
import GameEvents from '../../../events/GameEvents.js';

import Move from './Move.js';

import Consumable from '../../consumables/Consumable.js';

export default class UseItemMove extends Move {
    constructor(actorTile, position, targetTile) {
        super(actorTile);
        this._position = position;
        if(targetTile) {
            this._target = {
                x: targetTile.getX(),
                y: targetTile.getY()
            };
        }
    }

    getReasonIllegal(dungeon, creature) {
        var position = this.getItemPosition();
        var targetLocation = this.getTargetLocation();
        var tile;
        if(targetLocation && (tile = dungeon.getTile(targetLocation.x, targetLocation.y)) == null) {
            return 'Illegal target tile';
        }
        var inventory = creature.getInventory();
        var item = inventory.getItem(position);
        if(!item) {
            return 'No item at position: ' + position;
        } else {
            if(item.isTargetted && item.isTargetted()) {
                if(targetLocation) {
                    if(item.isTargetCreature && item.isTargetCreature() && !tile.getCreature()) {
                        return 'Target must be a creature';
                    }
                } else {
                    return 'Target not given for targetted item';
                }
            } else if(targetLocation) {
                return 'Target given for untargetted item';
            }
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
            dungeon.fireEvent(new GameEvents.EquipItemEvent(dungeon, creature, item));
        } else {
            item.use(dungeon, creature, targetTile);
            dungeon.fireEvent(new GameEvents.UseItemEvent(dungeon, creature, item, targetTile));
            if(item instanceof Consumable) {
                inventory.removeItem(position);
            }
        }
        dungeon.fireEvent(new GameEvents.InventoryChangeEvent(dungeon, creature));
    }

    isSeenBy(dungeon, observer) {
        return observer.canSee(dungeon, dungeon.getTile(this.getActorX(), this.getActorY()));
    }
}
