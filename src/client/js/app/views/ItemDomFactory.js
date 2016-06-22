import Armor from "../entities/armor/Armor.js";
import Weapon from "../entities/weapons/Weapon.js";

var lib;
export default lib = {
    getItemDom: function(item, index) {
        if(item instanceof Weapon) {
            return lib.getWeaponDom(item, index)
        } else if(item instanceof Armor) {
            return lib.getArmorDom(item, index)
        } else if(item){
            return $(`<li class="slot" tabindex="0" data-index="${index}">${item.getName()}</li>`)[0];
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
                damageType: weapon.getDamageType()
            }
            return $(`
                <li class="slot item weapon" tabindex="0" data-index="${index}">
                    <div class="name">${data.name}</div>
                    <div class="stats">
                        <span class="damage-icon">Damage: </span> <span class="damage-text">${data.damage}</span>,
                        <span class="range-icon">Range: </span> <span class="range-text">${data.range}</span>,
                        <span class="damage-type">${data.damageType}</span>
                    </div>
                </li>
            `)[0];
        } else {
            return $('<li class="slot empty" tabindex="0">(Empty weapon slot)</li>')[0];
        }
    },

    getArmorDom: function(armor, index) {
        if(armor) {
            var data = {
                name: armor.getName(),
                physical: armor.getPhysicalReduction(),
                magical: armor.getMagicalReduction()
            }
            return $(`
                <li class="slot item armor" tabindex="0" data-index="${index}">
                    <div class="name">${data.name}</div>
                    <div class="stats">
                        <span class="physical-dr-text">-${data.physical} physical damage</span>,
                        <span class="magical-dr-text">-${data.magical} magic damage</span>,
                    </div>
                </li>
            `)[0];
        } else {
            return $('<li class="slot empty" tabindex="0">(Empty armor slot)</li>')[0];
        }
    }
}
