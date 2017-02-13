import { default as Enemies } from '../../../../../src/client/js/app/entities/creatures/enemies/Enemies.js';
import { default as PlayableCharacter } from '../../../../../src/client/js/app/entities/creatures/PlayableCharacter.js';
import { default as Moves } from '../../../../../src/client/js/app/entities/creatures/moves/Moves.js';
import { default as Dungeon } from '../../../../../src/client/js/app/dungeons/Dungeon.js';
import { default as Tiles } from '../../../../../src/client/js/app/tiles/Tiles.js';

const expect = require('chai').expect;

describe('Enemies', function() {
    it('should all construct without throwing', function() {
        Object.keys(Enemies).map(constructorName => Enemies[constructorName]).forEach(function(Enemy) {
            new Enemy();
        });
    });

    describe('Bigfoot', function() {
        it('should be able to kick the player into a pit', function() {
            const dungeon = new Dungeon(1, 3);
            dungeon.setTile(new Tiles.PitTile(0, 2), 0, 2);
            const player = new PlayableCharacter();
            const bigfoot = new Enemies.Bigfoot();

            dungeon.moveCreature(bigfoot, 0, 0);
            dungeon.moveCreature(player, 0, 1);
            player.setNextMove(new Moves.WaitMove(dungeon.getTile(player)));

            dungeon.resolveSteps(1000); // TODO: Should resolveUntilBlocked handle dead player scenarios without game conditions?
            expect(player.isDead()).to.equal(true);
        });

        it('should not be able to kick the player into a wall', function() {
            const dungeon = new Dungeon(1, 3);
            dungeon.setTile(new Tiles.WallTile(0, 2), 0, 2);
            const player = new PlayableCharacter();
            const bigfoot = new Enemies.Bigfoot();

            dungeon.moveCreature(bigfoot, 0, 0);
            dungeon.moveCreature(player, 0, 1);
            player.setNextMove(new Moves.WaitMove(dungeon.getTile(player)));

            dungeon.resolveUntilBlocked();
            expect(player.isDead()).to.equal(false);
        });

    })
});
