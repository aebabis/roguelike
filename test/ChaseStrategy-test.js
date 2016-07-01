import { default as Dungeon } from '../src/client/js/app/dungeons/Dungeon.js';
import { default as TestDungeonFactory } from '../src/client/js/app/dungeons/TestDungeonFactory.js';
import { default as Creature } from '../src/client/js/app/entities/creatures/Creature.js';
import { default as PlayableCharacter } from '../src/client/js/app/entities/creatures/PlayableCharacter.js';
import { default as Ent } from '../src/client/js/app/entities/creatures/enemies/Ent.js';
import { default as Moves } from '../src/client/js/app/entities/creatures/moves/Moves.js';

var expect = require('chai').expect;

describe('ChaseStrategy', function() {
    // http://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
    function transpose(array) {
        return array[0].map(function(col, i) {
            return array.map(function(row) {
                return row[i]
            });
        });
    }

    it('should cause a creature to move toward a tile it has seen the player occupy', function() {
        var dungeon = new TestDungeonFactory().buildCustomWalledDungeon(transpose([
            [false, false, false],
            [false, true,  false],
            [false, true,  false]
        ]));
        var player = new PlayableCharacter();
        var enemy = new Ent();
        dungeon.setCreature(player, 0, 0);
        dungeon.setCreature(enemy, 0, 2);
        var enemyStartingPosition = dungeon.getTile(enemy);

        //TestDungeonFactory.showDungeon(dungeon);
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
