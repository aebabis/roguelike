import Armor from "../armor/Armor.js";
import Weapon from "../weapons/Weapon.js";

import Item from "../Item.js";

var DEFAULT_BACKPACE_SIZE = 2;

var Inventory = class Inventory {
    static get MELEE_SLOT() {
        return 'MELEE_SLOT';
    }
    static get RANGED_SLOT() {
        return 'RANGED_SLOT';
    }
    static get ARMOR_SLOT() {
        return 'ARMOR_SLOT';
    }
    static get ACCESSORY_SLOT() {
        return 'ACCESSORY_SLOT';
    }

    /**
      * @class Inventory
      * @description A creature's inventory for holding items
      */
    constructor(backpackSize) {
        if(isNaN(backpackSize)) {
            if(typeof backpackSize !== 'undefined') {
                throw new Error('Optional parameter must be a number');
            } else {
                backpackSize = DEFAULT_BACKPACE_SIZE;
            }
        }

        var equipment = this._equipment = {};
        equipment[Inventory.MELEE_SLOT] = null;
        equipment[Inventory.RANGED_SLOT] = null;
        equipment[Inventory.ARMOR_SLOT] = null;
        equipment[Inventory.ACCESSORY_SLOT] = null;

        var backpack = this._backpack = [];
        for(var i = 0, l = backpackSize; i < l; i++) {
            backpack.push(null);
        }
    }

    addItem(item) {
        if(!(item instanceof Item)) {
            throw new Error('First parameter must be an item');
        }
        var backpack = this._backpack;
        var emptySlot = backpack.indexOf(null);
        if(emptySlot === -1) {
            throw new Error('Inventory full');
        } else {
            backpack[emptySlot] = item;
        }
    }

    getItem(position) {
        var item;
        if(isNaN(position)) {
            // Assume that its an equipment constant
            item = this._equipment[position];
        } else {
            item = this._backpack[position];
        }
        if(item === undefined) {
            throw new Error('Illegal item slot: ' + position);
        } else {
            return item;
        }
    }

    getBackpack() {
        return this._backpack;
    }

    isBackpackFull() {
        return this._backpack.reduce((a,b)=>a&&b);
    }

    getEquipment() {
        return this._equipment;
    }

    equipItem(param) {
        if(param instanceof Weapon) {
            if(param.getRange() === 1) {
                this.setMeleeWeapon(param);
            } else {
                this.setRangedWeapon(param);
            }
        } else if(param instanceof Armor) {
            this.setArmor(param);
        } else if(!isNaN(param)) {
            var index = param;
            var backpack = this._backpack;
            var item = backpack[index];
            if(!item) {
                throw new Error('No item in given position');
            }
            if(item instanceof Weapon) {
                var oldWeapon;
                if(item.getRange() === 1) {
                    oldWeapon = this.getMeleeWeapon();
                    this.setMeleeWeapon(item);
                } else {
                    oldWeapon = this.getRangedWeapon();
                    this.setRangedWeapon(item);
                }
                backpack[index] = oldWeapon;
            } else if(item instanceof Armor) {
                var oldArmor = this.getArmor();
                this.setArmor(item);
                backpack[index] = oldArmor;
            }
        } else {
            throw new Error('First parameter must be a number or Item');
        }
    }

    setMeleeWeapon(weapon) {
        if(!(weapon instanceof Weapon)) {
            throw new Error('Parameter must be a Weapon');
        } else if(weapon.getRange() > 1) {
            throw new Error('Weapon is not melee')
        }
        this.getEquipment()[Inventory.MELEE_SLOT] = weapon;
    }

    setRangedWeapon(weapon) {
        if(!(weapon instanceof Weapon)) {
            throw new Error('Parameter must be a Weapon');
        } else if(weapon.getRange() === 1) {
            throw new Error('Weapon is not ranged')
        }
        this.getEquipment()[Inventory.RANGED_SLOT] = weapon;
    }

    setArmor(armor) {
        if(!(armor instanceof Armor)) {
            throw new Error('Parameter must be Armor');
        }
        this.getEquipment()[Inventory.ARMOR_SLOT] = armor;
    }

    getMeleeWeapon() {
        return this._equipment[Inventory.MELEE_SLOT];
    }

    getRangedWeapon() {
        return this._equipment[Inventory.RANGED_SLOT];
    }

    getArmor() {
        return this._equipment[Inventory.ARMOR_SLOT];
    }
}

export default Inventory;
