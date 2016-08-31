import { default as Dungeon } from '../src/client/js/app/dungeons/Dungeon.js';
import { default as Tiles } from '../src/client/js/app/tiles/Tiles.js';
import { default as PlayableCharacter } from '../src/client/js/app/entities/creatures/PlayableCharacter.js';
import { default as Ent } from '../src/client/js/app/entities/creatures/enemies/Ent.js';
import { default as Moves } from '../src/client/js/app/entities/creatures/moves/Moves.js';

var expect = require('chai').expect;

describe('ChaseStrategy', function() {
    it('should cause a creature to move toward a tile it has seen the player occupy', function() {
        const dungeon = new Dungeon(3, 3);
        dungeon.setTile(new Tiles.WallTile(dungeon, 1, 1), 1, 1);
        dungeon.setTile(new Tiles.WallTile(dungeon, 1, 2), 1, 2);
        var player = new PlayableCharacter();
        var enemy = new Ent();
        dungeon.moveCreature(player, 0, 0);
        dungeon.moveCreature(enemy, 0, 2);
        var enemyStartingPosition = dungeon.getTile(enemy);

        expect(enemy.canSee(dungeon, dungeon.getTile(player))).to.be.true;

        player.setNextMove(new Moves.MovementMove(dungeon.getTile(player), 1, 0));
        player.setNextMove(new Moves.MovementMove(dungeon.getTile(player), 1, 0));
        player.setNextMove(new Moves.MovementMove(dungeon.getTile(player), 0, 1));
        player.setNextMove(new Moves.MovementMove(dungeon.getTile(player), 0, 1));

        dungeon.resolveUntilBlocked();

        var enemyPosition  = dungeon.getTile(enemy);
        expect(enemyPosition).not.to.equal(enemyStartingPosition);
    });
});
