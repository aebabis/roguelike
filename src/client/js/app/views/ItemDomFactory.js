import Armor from '../entities/armor/Armor.js';
import Weapon from '../entities/weapons/Weapon.js';
import TheTreasure from '../entities/TheTreasure.js';

var lib;
export default lib = {
    getItemDom: function(item, index, isTargetting) {
        if(item instanceof Weapon) {
            return lib.getWeaponDom(item, index);
        } else if(item instanceof Armor) {
            return lib.getArmorDom(item, index);
        } else if(item){
            return $(
            `<li class="slot item"
                 tabindex="0"
                 data-index="${index}"
                 data-item="${item.toString()}"
                 data-is-targetting="${!!isTargetting}"
                 title="${item.getFriendlyDescription()}">
                <div class="icon" data-item-name="${item.toString()}"></div>
                <div class="info">
                    <span class="name">${item.getName()}</span>
                    <span class="desc">${item.getFriendlyDescription()}</span>
                </div>
                ${(isNaN(index) || item instanceof TheTreasure) ? '' : '<button class="trash" type="button" title="Destroy this item. Forever">&#128465;</button>'}
            </li>`)[0];
        } else {
            return $(`<li class="slot empty" tabindex="0" data-index="${index}">
                <div class="icon"></div>
                <div class="info">(Empty slot)</div>
            </li>`)[0];
        }
    },

    getWeaponDom: function(weapon, index) {
        if(weapon) {
            var data = {
                name: weapon.constructor.name,
                damage: weapon.getDamage(),
                range: weapon.getRange()
            };
            return $(`
                <li class="slot item weapon" tabindex="0" data-index="${index}" data-item="${weapon.toString()}">
                    <div class="icon" data-item-name="${weapon.toString()}"></div>
                    <div class="info">
                        <div class="name">${data.name}</div>
                        <div class="desc">
                            <span class="damage-icon"></span> <span class="damage-text">${data.damage}\u2694</span>
                            <span class="range-icon"></span> <span class="range-text">${data.range > 1 ? data.range + '\u25CE' : ''}</span>
                        </div>
                    </div>
                    ${isNaN(index) ? '' : '<button class="trash" type="button" title="Destroy this item. Forever">&#128465;</button>'}
                </li>
            `)[0];
        } else {
            return $(`<li class="slot empty" tabindex="0" data-index="${index}">
                <div class="icon"></div>
                <div class="info">(Empty weapon slot)</div>
            </li>`)[0];
        }
    },

    getArmorDom: function(armor, index) {
        if(armor) {
            var data = {
                name: armor.getName()/*,
                physical: armor.getPhysicalReduction(),
                magical: armor.getMagicalReduction()*/
            };
            return $(`
                <li class="slot item armor" tabindex="0" data-index="${index}" data-item="${armor.toString()}">
                    <div class="icon" data-item-name="${armor.toString()}"></div>
                    <div class="info">
                        <div class="name">${data.name}</div>
                        <!--div class="stats">
                            <span class="physical-dr-text">-${data.physical} physical damage</span>,
                            <span class="magical-dr-text">-${data.magical} magic damage</span>,
                        </div-->
                    </div>
                    ${isNaN(index) ? '' : '<button class="trash" type="button" title="Destroy this item. Forever">&#128465;</button>'}
                </li>
            `)[0];
        } else {
            return $(`<li class="slot empty" tabindex="0" data-index="${index}">
                <div class="icon"></div>
                <div class="info">(Empty armor slot)</div>
            </li>`)[0];
        }
    }
};
