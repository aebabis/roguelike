import { default as Dungeon } from '../../../../src/client/js/app/dungeons/Dungeon';
import { default as Tiles } from '../../../../src/client/js/app/tiles/Tiles';
import { default as PlayableCharacter } from '../../../../src/client/js/app/entities/creatures/PlayableCharacter';
import { default as Slingshot } from '../../../../src/client/js/app/entities/weapons/Slingshot';
import { default as LightArmor } from '../../../../src/client/js/app/entities/armor/LightArmor';

import { default as AbilityConsumable } from '../../../../src/client/js/app/entities/consumables/AbilityConsumable';
import { default as CherrySoda } from '../../../../src/client/js/app/entities/consumables/CherrySoda';
import { default as Items } from '../../../../src/client/js/app/entities/Items';

import { default as Fireball } from '../../../../src/client/js/app/abilities/Fireball';
import { default as MovementMove } from '../../../../src/client/js/app/entities/creatures/moves/MovementMove';

const expect = require('chai').expect;

describe('Creature', function() {
    let dungeon;
    let player;
    beforeEach(function() {
        dungeon = new Dungeon(2, 2);
        player = new PlayableCharacter();
        dungeon.moveCreature(player, 0, 0);
    });

    describe('canSee', function() {
        it('should require a tile to be passed', function() {
            const dungeon = new Dungeon(2, 2);
            const creature = new PlayableCharacter();
            dungeon.moveCreature(creature, 0, 0);

            expect(function() {
                creature.canSee(dungeon, {});
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

    describe('takeItems', () => {
        it('should allow an item to be replaced, even when full', () => {
            player.addItem(new Items.LightArmor());
            for(let i = 0; i < player.getBackpackSize(); i++) {
                player.addItem(new Items.BlueberrySoda());
            }

            dungeon.getTile(1, 1).addItem(new Items.MediumArmor());
            player.executeMove(dungeon, new MovementMove(dungeon.getTile(player), 1, 1));
            expect(player.getArmor()).to.be.instanceof(Items.MediumArmor);
        });
    });
});
