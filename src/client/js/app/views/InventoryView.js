import Moves from '../entities/creatures/moves/Moves.js';
import GameEvents from '../events/GameEvents.js';

import ItemDomFactory from './ItemDomFactory.js';

function getInventoryDom(creature, targettedIndex) {
    var meleeWeapon = creature.getMeleeWeapon();
    var rangedWeapon = creature.getRangedWeapon();
    var armor = creature.getArmor();
    var items = creature.getInventory().getBackpack();
    return $('<ul class="inventory">')
        .append(
            $('<div class="subinventory equipment">')
                .append('<h3>Equipment</h2>')
                .append(ItemDomFactory.getWeaponDom(meleeWeapon))
                .append(ItemDomFactory.getWeaponDom(rangedWeapon))
                .append(ItemDomFactory.getArmorDom(armor))
            )
        .append(
            $('<div class="subinventory backpack">')
                .append('<h3>Backpack</h2>')
                .append(items.map(function(item, index) {
                    return ItemDomFactory.getItemDom(item, index, index === targettedIndex);
                }))
        );
}

export default class InventoryView {
    /**
     * @class InventoryView
     * @description Event feed widget
     */
    constructor(sharedData) {
        var dom = this._dom = $('<div>');
        this._sharedData = sharedData;

        var dungeon = sharedData.getDungeon();

        $(dom).on('click tap', '.item', function() {
            var player = dungeon.getPlayableCharacter();
            var index = +$(this).attr('data-index');
            var item = player.getInventory().getItem(index);
            if(item.isTargetted && item.isTargetted()) {
                var targetIndex = sharedData.getTargettedItem();
                if(targetIndex !== index) {
                    sharedData.setTargettedItem(index);
                } else {
                    sharedData.unsetTargettedItem();
                }
            } else {
                player.setNextMove(new Moves.UseItemMove(dungeon.getTile(player), index));
            }
            dungeon.resolveUntilBlocked();
        });

        $(dom).on('click tap', 'button.trash', function(event) {
            event.stopPropagation(); // Prevent parent "button" from being clicked

            var player = dungeon.getPlayableCharacter();
            var index = $(this).parent('.item').attr('data-index');
            player.setNextMove(new Moves.TrashItemMove(dungeon.getTile(player), index));
            dungeon.resolveUntilBlocked();
        });

        dungeon.addObserver((event)=>this.update(event));
        sharedData.addObserver((event)=>this.update(event));
        this.redraw();
    }

    update(event) {
        let player = this._sharedData.getDungeon().getPlayableCharacter();
        if(event instanceof GameEvents.TakeItemEvent ||
                event instanceof GameEvents.TrashItemEvent ||
                event instanceof GameEvents.CustomEvent || // UseItemMove. TODO: Make UseItemEvent
                (event instanceof GameEvents.MoveEvent && event.getCreature() === player)) {
            this.redraw();
        }
    }

    redraw() {
        $(this._dom).empty().append(getInventoryDom(this._sharedData.getDungeon().getPlayableCharacter(), this._sharedData.getTargettedItem()));
    }

    getDom() {
        return this._dom[0];
    }
}
