import Armor from '../../../../src/client/js/app/entities/armor/Armor.js';
import Armors from '../../../../src/client/js/app/entities/armor/Armors.js';
import DamageTypes from '../../../../src/client/js/app/entities/DamageTypes.js';

const expect = require('chai').expect;

describe('Armors', () => {
    describe('getReduction', () => {
        it('should throw if not implemented', () => {
            expect(() => {
                new Armor().getReduction();
            }).to.throw();
        });
    });

    Object.entries(Armors).forEach(([key, Class]) => {
        describe(key, () => {
            it('should be equipable', () => {
                expect(new Class().isEquipable()).to.equal(true);
            });
        });
    });

    ['LightArmor', 'MediumArmor', 'HeavyArmor'].forEach(className => {
        describe(className, () => {
            let armor;

            beforeEach(() => {
                armor = new Armors[className]();
            });

            it('should provide protection against melee physical attacks', () => {
                expect(armor.getReduction(DamageTypes.MELEE_PHYSICAL)).to.be.above(0);
            });

            it('should provide protection against ranged physical attacks', () => {
                expect(armor.getReduction(DamageTypes.RANGED_PHYSICAL)).to.be.above(0);
            });

            it('should not provide protection against magical attacks', () => {
                Object.entries(DamageTypes).filter(([key]) => key !== 'MELEE_PHYSICAL' && key !== 'RANGED_PHYSICAL').forEach(type => {
                    expect(armor.getReduction(type)).to.equal(0);
                });
            });

            it('should have a description', () => {
                expect(armor.getFriendlyDescription()).to.be.a('string');
            });
        });
    });
});
