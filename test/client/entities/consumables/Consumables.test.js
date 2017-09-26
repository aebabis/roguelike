import { default as Consumable } from '../../../../src/client/js/app/entities/consumables/Consumable';
import { default as Consumables } from '../../../../src/client/js/app/entities/consumables/Consumables';

const expect = require('chai').expect;

describe('Consumables', () => {
    describe('use', () => {
        it('should throw if not implemented', () => {
            expect(() => {
                new Consumable().use();
            }).to.throw();
        });
    });

    Object.entries(Consumables).forEach(([name, Consumable]) => {
        describe(name, () => {
            let instance;
            beforeEach(() => {
                instance = new Consumable();
            });

            describe('isUseable', () => {
                it('should return true', () => {
                    expect(instance.isUseable()).to.equal(true);
                });
            });

            describe('isTargetted', () => {
                it('should return a boolean', () => {
                    expect(instance.isTargetted()).to.be.a('boolean');
                });
            });

            describe('getRange', () => {
                it('should return a number', () => {
                    expect(instance.getRange()).to.be.a('number');
                });
            });
        });
    });
});
