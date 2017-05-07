import { default as Dungeon } from '../../../../src/client/js/app/dungeons/Dungeon.js';
import { default as Tiles } from '../../../../src/client/js/app/tiles/Tiles.js';
import { default as PlayableCharacter } from '../../../../src/client/js/app/entities/creatures/PlayableCharacter.js';
import { default as Slingshot } from '../../../../src/client/js/app/entities/weapons/Slingshot.js';
import { default as LightArmor } from '../../../../src/client/js/app/entities/armor/LightArmor.js';

import { default as AbilityConsumable } from '../../../../src/client/js/app/entities/consumables/AbilityConsumable.js';
import { default as CherrySoda } from '../../../../src/client/js/app/entities/consumables/CherrySoda.js';

import { default as Fireball } from '../../../../src/client/js/app/abilities/Fireball.js';

const expect = require('chai').expect;

describe('Creature', function() {
    describe('canSee', function() {
        it('should require a tile to be passed', function() {
            const dungeon = new Dungeon(2, 2);
            const creature = new PlayableCharacter();
            dungeon.moveCreature(creature, 0, 0);

            expect(function() {
                creature.canSee(dungeon, {})
            }).to.throw();
        });

        it('should be able to see an adjacent tile', function() {
            const dungeon = new Dungeon(2, 2);
            const creature = new PlayableCharacter();
            dungeon.moveCreature(creature, 0, 0);

            expect(creature.canSee(dungeon, dungeon.getTile(0, 1))).to.equal(true);
        });

        it('should be able to see in a straight line', function() {
            const dungeon = new Dungeon(5, 2);
            const creature = new PlayableCharacter();
            dungeon.moveCreature(creature, 0, 0);

            expect(creature.canSee(dungeon, dungeon.getTile(4, 1))).to.equal(true);
        });

        it('should not see through walls', function() {
            const dungeon = new Dungeon(3, 1);
            const creature = new PlayableCharacter();
            dungeon.setTile(new Tiles.WallTile(1, 0), 1, 0);
            dungeon.moveCreature(creature, 2, 0);

            expect(creature.canSee(dungeon, dungeon.getTile(0, 0))).to.equal(false);
        });

        it('should be able to see across corners', function() {
            const dungeon = new Dungeon(3, 3);
            const creature = new PlayableCharacter();

            [[0, 1], [1, 0], [2, 1], [1, 2]].forEach(function(coords) {
                const x = coords[0];
                const y = coords[1];
                dungeon.setTile(new Tiles.WallTile(x, y), x, y);
            });

            dungeon.moveCreature(creature, 1, 1);

            expect(creature.canSee(dungeon, dungeon.getTile(0, 0))).to.equal(true);
            expect(creature.canSee(dungeon, dungeon.getTile(0, 2))).to.equal(true);
            expect(creature.canSee(dungeon, dungeon.getTile(2, 0))).to.equal(true);
            expect(creature.canSee(dungeon, dungeon.getTile(2, 2))).to.equal(true);
        });
    });

    describe('canAddItem', function() {
        let player;
        beforeEach(function() {
            player = new PlayableCharacter();
        });

        it('should return true when trying to add a weapon to an empty equipment slot', function() {
            var canAdd = player.canAddItem(new Slingshot());
            expect(canAdd).to.equal(true);
        });

        it('should return true when trying to add armor to an empty equipment slot', function() {
            var canAdd = player.canAddItem(new LightArmor());
            expect(canAdd).to.equal(true);
        });

        it('should return false when trying to add a scroll to a character with no weapons and a full pack', function() {
            for(let i = 0, count = player.getBackpackSize(); i < count; i++) {
                player.addItem(new CherrySoda());
            }

            var canAdd = player.canAddItem(new AbilityConsumable(new Fireball()));
            expect(canAdd).to.equal(false);
        });
    });
});
