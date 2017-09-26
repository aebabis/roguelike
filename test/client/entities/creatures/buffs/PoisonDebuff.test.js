import { default as Dungeon } from '../../../../../src/client/js/app/dungeons/Dungeon';
import { default as PlayableCharacter } from '../../../../../src/client/js/app/entities/creatures/PlayableCharacter';

import { default as PoisonDebuff } from '../../../../../src/client/js/app/entities/creatures/buffs/PoisonDebuff';

const expect = require('chai').expect;

describe('PoisonDebuff', function() {
    let dungeon;
    let player;

    beforeEach(function() {
        dungeon = new Dungeon(1, 1);
        player = new PlayableCharacter();
        dungeon.moveCreature(player, 0, 0);
    });

    it('should not throw when constructed', function() {
        new PoisonDebuff(dungeon, 1, 1, 1);
    });

    describe('getProperties', function() {
        if('should return an empty property set', function() {
            const debuff = new PoisonDebuff(dungeon, 1, 1, 1);
            expect(Object.keys(debuff.getProperties())).to.have.length(0);
        });
    });

    describe('getDamage', function() {
        it('should return the damage value given to the constructor', function() {
            const debuff = new PoisonDebuff(dungeon, 107, 1, 1);
            expect(debuff.getDamage()).to.equal(107);

            const debuff2 = new PoisonDebuff(dungeon, 33, 1, 1);
            expect(debuff2.getDamage()).to.equal(33);
        });
    });
    
    describe('getPeriod', function() {
        it('should return the period value given to the constructor', function() {
            const debuff = new PoisonDebuff(dungeon, 10, 100, 1);
            expect(debuff.getPeriod()).to.equal(100);

            const debuff2 = new PoisonDebuff(dungeon, 10, 1000, 1);
            expect(debuff2.getPeriod()).to.equal(1000);
        });
    });

    describe('getCount', function() {
        it('should return the count value given to the constructor', function() {
            const debuff = new PoisonDebuff(dungeon, 10, 100, 2);
            expect(debuff.getCount()).to.equal(2);

            const debuff2 = new PoisonDebuff(dungeon, 10, 1000, 3);
            expect(debuff2.getCount()).to.equal(3);
        });
    });

    describe('getName', function() {
        it('should return a string', function() {
            const debuff = new PoisonDebuff(dungeon, 10, 100, 2);
            expect(debuff.getName()).to.be.a('string');
        });
    });

    describe('isNegative', function() {
        it('should return true because poison is bad', function() {
            const debuff = new PoisonDebuff(dungeon, 1, 1, 1);
            expect(debuff.isNegative()).to.equal(true);
        })
    });

    describe('getDuration', function() {
        it('should return a total duration that is the product of the period and proc count', function() {
            const debuff = new PoisonDebuff(dungeon, 10, 13, 17);
            expect(debuff.getDuration()).to.equal(13 * 17);
        });
    });

    describe('timestep', function() {
        it('should damage the creature given enough time', function() {
            const debuff = new PoisonDebuff(dungeon, 1, 10, 3);
            for(let i = 0; i < 50; i++) {
                dungeon.resolveNextStep();
                debuff.timestep(dungeon, player);
            }
            expect(player.getCurrentHP()).not.to.equal(player.getBaseHP());
        });
        
        it('should not damage the creature prematurely', function() {
            for(let i = 0; i < 5; i++) {
                dungeon.resolveNextStep();
            }
            const debuff = new PoisonDebuff(dungeon, 1, 10, 3);
            for(let i = 0; i < 5; i++) {
                dungeon.resolveNextStep();
                debuff.timestep(dungeon, player);
            }
            expect(player.getCurrentHP()).to.equal(player.getBaseHP());
        });

        it('should be able to kill creatures', function() {
            const debuff = new PoisonDebuff(dungeon, 100, 1, 1);
            dungeon.resolveNextStep();
            debuff.timestep(dungeon, player);
            expect(player.getCurrentHP()).not.to.be.above(0);
        });
    });
});
