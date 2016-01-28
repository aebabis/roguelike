import { default as GameEvent } from "../events/GameEvent.js";

import { default as Weapon } from "../entities/weapons/Weapon.js";

import { default as Move } from "../entities/creatures/moves/Move.js";

import { default as ItemDomFactory } from "./ItemDomFactory.js";

function getInventoryDom(creature) {
    var meleeWeapon = creature.getMeleeWeapon();
    var rangedWeapon = creature.getRangedWeapon();
    var items = creature.getInventory().getBackpack();
    return $('<ul class="inventory">')
        .append(
            $('<div class="subinventory equipment">')
                .append('<h2>Equipment</h2>')
                .append(ItemDomFactory.getWeaponDom(meleeWeapon))
                .append(ItemDomFactory.getWeaponDom(rangedWeapon))
            )
        .append(
            $('<div class="subinventory backpack">')
                .append('<h2>Backpack</h2>')
                .append(items.map(ItemDomFactory.getItemDom))
        );
}

export default class InventoryView {
    /**
     * @class InventoryView
     * @description Event feed widget
     */
    constructor(dungeon) {
        var self = this;
        var dom = this._dom = document.createElement('div');

        $(dom).on('click', '.item', function() {
            var creature = self.getCreature();
            var index = $(this).attr('data-index');
            // TODO: Assumes PlayableCharacter anyway?
            creature.setNextMove(new Move.UseItemMove(index));
        });

        dungeon.addObserver((event)=>this.update());

        this.setCreature(dungeon.getPlayableCharacter());
    }

    update() {
        $(this._dom).empty().append(getInventoryDom(this.getCreature()));
    }

    getCreature(creature) {
        return this._creature;
    };

    setCreature(creature) {
        this._creature = creature;
        this.update();
    };

    getDom() {
        return this._dom;
    }
}
