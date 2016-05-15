import { default as Weapon } from "../entities/weapons/Weapon.js";

var lib;
export default lib = {
    getItemDom: function(item, index) {
        if(item instanceof Weapon) {
            return lib.getWeaponDom(item, index)
        } else {
            return $(`<li class="slot empty" tabindex="0" data-index="${index}">(Empty slot)</li>`)[0];
        }
    },

    getWeaponDom: function(weapon, index) {
        if(weapon) {
            var data = {
                name: weapon.constructor.name,
                damage: weapon.getDamage(),
                range: weapon.getRange(),
                isMagical: weapon.isMagical()
            }
            return $(`
                <li class="slot item weapon" tabindex="0" data-index="${index}">
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
}
