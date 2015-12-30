import { default as GameEvent } from "../events/GameEvent.js";

import { default as Weapon } from "../entities/weapons/Weapon.js";

function getItemDom(item) {
    if(item instanceof Weapon) {
        var data = {
            name: item.constructor.name,
            damage: item.getDamage(),
            range: item.getRange(),
            isMagical: item.isMagical()
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
        return $('<li class="slot empty" tabindex="0">(Empty slot)</li>')[0];
    }
}

function getInventoryDom(creature) {
    var items = [creature.getMeleeWeapon(), creature.getRangedWeapon()];
    return $('<ul class="inventory">').append(items.map(getItemDom));
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
