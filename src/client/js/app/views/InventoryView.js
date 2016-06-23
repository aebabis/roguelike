import GameEvent from "../events/GameEvent.js";

import Weapon from "../entities/weapons/Weapon.js";

import Move from "../entities/creatures/moves/Move.js";

import ItemDomFactory from "./ItemDomFactory.js";

import Creature from "../entities/creatures/Creature.js";

function getInventoryDom(creature, targettedIndex) {
    var meleeWeapon = creature.getMeleeWeapon();
    var rangedWeapon = creature.getRangedWeapon();
    var armor = creature.getArmor();
    var items = creature.getInventory().getBackpack();
    return $('<h2>Inventory</h2>').add($('<ul class="inventory">')
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
        ));
}

export default class InventoryView {
    /**
     * @class InventoryView
     * @description Event feed widget
     */
    constructor(sharedData) {
        var self = this;
        var dom = this._dom = $('<div class="sidebar-subcontainer">');
        this._sharedData = sharedData;

        var dungeon = sharedData.getDungeon();

        $(dom).on('click', '.item', function() {
            var player = dungeon.getPlayableCharacter();
            var index = $(this).attr('data-index');
            var item = player.getInventory().getItem(index);
            if(item.isTargetted()) {
                var targetIndex = sharedData.getTargettedItem();
                if(targetIndex !== index) {
                    sharedData.setTargettedItem(index);
                } else {
                    sharedData.unsetTargettedItem();
                }
            } else {
                creature.setNextMove(new Move.UseItemMove(dungeon.getTile(player), index));
            }
            dungeon.resolveUntilBlocked();
        });

        dungeon.addObserver((event)=>this.update());
        sharedData.addObserver(()=>this.update());
    }

    update() {
        $(this._dom).empty().append(getInventoryDom(this._sharedData.getDungeon().getPlayableCharacter(), this._sharedData.getTargettedItem()));
    }

    getDom() {
        return this._dom[0];
    }
}
