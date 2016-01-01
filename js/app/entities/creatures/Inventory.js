import { default as Weapon } from "../weapons/Weapon.js";

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
      * @description
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
        if(!(item instanceof Weapon)) {
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

    getEquipment() {
        return this._equipment;
    }

    equipItem(index) {
        if(isNaN(index)) {
            throw new Error('First parameter must be a number');
        }
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

    getMeleeWeapon() {
        return this._equipment[Inventory.MELEE_SLOT];
    }

    getRangedWeapon() {
        return this._equipment[Inventory.RANGED_SLOT];
    }
}

export default Inventory;
