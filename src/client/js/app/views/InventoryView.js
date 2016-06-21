import GameEvent from "../events/GameEvent.js";

import Weapon from "../entities/weapons/Weapon.js";

import Move from "../entities/creatures/moves/Move.js";

import ItemDomFactory from "./ItemDomFactory.js";

import Creature from "../entities/creatures/Creature.js";

function getInventoryDom(creature) {
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
                .append(items.map(ItemDomFactory.getItemDom))
        ));
}

export default class InventoryView {
    /**
     * @class InventoryView
     * @description Event feed widget
     */
    constructor(dungeon) {
        var self = this;
        var dom = this._dom = $('<div class="sidebar-subcontainer">')

        $(dom).on('click', '.item', function() {
            var creature = self.getCreature();
            var index = $(this).attr('data-index');
            // TODO: Assumes PlayableCharacter anyway?
            creature.setNextMove(new Move.UseItemMove(dungeon.getTile(creature), index));
            dungeon.resolveUntilBlocked();
        });

        dungeon.addObserver((event)=>this.update());
        console.log(dungeon);

        this.setCreature(dungeon.getPlayableCharacter());
    }

    update() {
        $(this._dom).empty().append(getInventoryDom(this.getCreature()));
    }

    getCreature(creature) {
        return this._creature;
    };

    setCreature(creature) {
        if(!(creature instanceof Creature)) {
            throw new Error('First parameter must be a creature');
        }
        this._creature = creature;
        this.update();
    };

    getDom() {
        return this._dom[0];
    }
}
