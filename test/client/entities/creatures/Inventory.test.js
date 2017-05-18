import { default as Inventory } from '../../../../src/client/js/app/entities/creatures/Inventory.js';
import { default as Items } from '../../../../src/client/js/app/entities/Items.js';

const expect = require('chai').expect;

describe('Inventory', () => {
    const LIMIT = 3;
    let inventory;

    beforeEach(() => inventory = new Inventory(LIMIT));

    describe('addItem', () => {
        it('should allow an item to be added');
        it('should only allow the limit of items to be added', () => {
            for(let i = 0; i < LIMIT; i++) {
                inventory.addItem(new Items.BlueberrySoda());
            }
            expect(() => inventory.addItem(new Items.BlueberrySoda())).to.throw();
        });
        it('should allow an item to be added after being emptied');
    });

    describe('removeItem', () => {
        it('should not be able to remove an item that isn\'t there', () => {
            expect(() => inventory.removeItem(0)).to.throw();
        });
    });

    describe('getItem', () => {
        it('should return null for a slot that hasn\'t been filled', () => {
            const item = inventory.getItem(0);
            expect(item).to.equal(null);
        });
    });

    describe('getItems', () => {

    });

    describe('findItem', () => {
        
    });

    describe('removeItems', () => {
        
    });

    describe('getBackpack', () => {
        
    });

    describe('isBackpackFull', () => {
        
    });

    describe('getEquipment', () => {
        
    });

    describe('equipItem', () => {
        
    });

    describe('setMeleeWeapon', () => {
        
    });

    describe('setRangedWeapon', () => {
        
    });

    describe('setArmor', () => {
        
    });

    describe('getMeleeWeapon', () => {
        
    });

    describe('getRangedWeapon', () => {
        
    });

    describe('getArmor', () => {
        
    });
});
