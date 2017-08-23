import Armor from '../entities/armor/Armor';
import Weapon from '../entities/weapons/Weapon';
import TheTreasure from '../entities/TheTreasure';
import AbilityConsumable from '../entities/consumables/AbilityConsumable';

const buildDom = str => {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.children[0];
};

let lib;
export default lib = {
    getItemDom: function(item, index, isTargetting) {
        if(item instanceof Weapon) {
            return lib.getWeaponDom(item, index);
        } else if(item instanceof Armor) {
            return lib.getArmorDom(item, index);
        } else if(item){
            return buildDom(
                `<li class="slot item"
                    tabindex="0"
                    data-index="${index}"
                    data-item="${item.toString()}"
                    data-is-targetting="${!!isTargetting}"
                    title="${item.getFriendlyDescription()}">
                    <div class="inventory-icon tiny-icon-wrap">
                        ${(item instanceof AbilityConsumable) ?
                            `<div class="icon-Scroll"></div><div class="icon-${item.getAbility().toString()}"></div>` :
                            `<div class="icon-${item.toString()}"></div>`
                        }
                    </div>
                    <div class="info">
                        <span class="name">${item.getName()}</span>
                        <span class="desc">${item.getFriendlyDescription()}</span>
                    </div>
                    ${(isNaN(index) || item instanceof TheTreasure) ?
        '<button class="home" type="button" title="Walk to the exit" accesskey="h">&#127968;</button>' :
        `<button class="trash" data-index="${index}" type="button" title="Destroy this item. Forever">&#128465;</button>`}
            </li>`);
        } else {
            return buildDom(`<li class="slot empty" tabindex="0" data-index="${index}">
                <div class="inventory-icon"></div>
                <div class="info">(Empty slot)</div>
            </li>`);
        }
    },

    getWeaponDom: function(weapon, index) {
        if(weapon) {
            const data = {
                name: weapon.constructor.name,
                damage: weapon.getDamage(),
                range: weapon.getRange()
            };
            return buildDom(`
                <li class="slot item weapon" tabindex="0" data-index="${index}" data-item="${weapon.toString()}">
                    <div class="inventory-icon tiny-icon-wrap">
                        <div class="icon-${weapon.toString()}"></div>
                    </div>
                    <div class="info">
                        <div class="name">${data.name}</div>
                        <div class="desc">
                            <span class="damage-icon"></span> <span class="damage-text">${data.damage}\u2694</span>
                            <span class="range-icon"></span> <span class="range-text">${data.range > 1 ? data.range + '\u25CE' : ''}</span>
                        </div>
                    </div>
                    ${isNaN(index) ? '' : `<button class="trash" data-index="${index}" type="button" title="Destroy this item. Forever">&#128465;</button>`}
                </li>
            `);
        } else {
            return buildDom(`<li class="slot empty" tabindex="0" data-index="${index}">
                <div class="inventory-icon"></div>
                <div class="info">(Empty weapon slot)</div>
            </li>`);
        }
    },

    getArmorDom: function(armor, index) {
        if(armor) {
            const data = {
                name: armor.getName()/*,
                physical: armor.getPhysicalReduction(),
                magical: armor.getMagicalReduction()*/
            };
            return buildDom(`
                <li class="slot item armor" tabindex="0" data-index="${index}" data-item="${armor.toString()}">
                    <div class="inventory-icon tiny-icon-wrap">
                        <div class="icon-${armor.toString()}"></div>
                    </div>
                    <div class="info">
                        <div class="name">${data.name}</div>
                        <!--div class="stats">
                            <span class="physical-dr-text">-${data.physical} physical damage</span>,
                            <span class="magical-dr-text">-${data.magical} magic damage</span>,
                        </div-->
                    </div>
                    ${isNaN(index) ? '' : `<button class="trash" data-index="${index}" type="button" title="Destroy this item. Forever">&#128465;</button>`}
                </li>
            `);
        } else {
            return buildDom(`<li class="slot empty" tabindex="0" data-index="${index}">
                <div class="inventory-icon"></div>
                <div class="info">(Empty armor slot)</div>
            </li>`);
        }
    }
};
