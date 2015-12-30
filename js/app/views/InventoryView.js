import { default as GameEvent } from "../events/GameEvent.js";

import { default as Weapon } from "../entities/weapons/Weapon.js";

function getItemDom(item, index) {
    if(item instanceof Weapon) {
        return getWeaponDom(item)
    } else {
        return $(`<li class="slot empty" tabindex="0" data-index="${index}">(Empty slot)</li>`)[0];
    }
}

function getWeaponDom(weapon) {
    if(weapon) {
        var data = {
            name: weapon.constructor.name,
            damage: weapon.getDamage(),
            range: weapon.getRange(),
            isMagical: weapon.isMagical()
        }
        return $(`
            <li class="slot item weapon" tabindex="0">
                <div class="name">${data.name}</div>
                <div class="stats">
                    <span class="damage-icon">Damage: </span> <span class="damage-text">${data.damage}</span>,
                    <span class="range-icon">Range: </span> <span class="range-text">${data.range}</span>,
                    <span class="damage-type">${data.isMagical ? 'Magical' : 'Physical'}</span>
                </div>
            </li>
        `)[0];
    } else {
        return $('<li class="slot empty" tabindex="0">(Empty weapon slot)</li>')[0];
    }
}

function getInventoryDom(creature) {
    var meleeWeapon = creature.getMeleeWeapon();
    var rangedWeapon = creature.getRangedWeapon();
    var items = creature.getInventory();
    return $('<ul class="inventory">')
        .append(getWeaponDom(meleeWeapon))
        .append(getWeaponDom(rangedWeapon))
        .append(items.map(getItemDom));
}

export default class InventoryView {
    /**
     * @class InventoryView
     * @description Event feed widget
     */
    constructor(dungeon) {
        var self = this;
        var dom = this._dom = document.createElement('div');

        dungeon.addObserver((event)=>this.update());

        this.setCreature(dungeon.getPlayableCharacter());
    }

    update() {
        $(this._dom).empty().append(getInventoryDom(this._creature));
    }

    setCreature(creature) {
        this._creature = creature;
        this.update();
    };

    getDom() {
        return this._dom;
    }
}
