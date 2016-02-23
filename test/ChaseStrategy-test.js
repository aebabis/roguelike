var System = require('es6-module-loader').System;
var expect = require('chai').expect;

describe('Creature', function() {
    beforeEach(function(done) {
        es6Inject([
            'js/app/dungeons/Dungeon.js',
            'js/app/dungeons/TestDungeonFactory.js',
            'js/app/entities/creatures/Creature.js',
            'js/app/entities/creatures/PlayableCharacter.js',
            'js/app/entities/creatures/Ent.js',
            'js/app/entities/creatures/moves/Moves.js'
        ]).then(done, done);
    });

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
        var player = new PlayableCharacter(dungeon);
        var enemy = new Ent(dungeon);
        dungeon.setCreature(player, 0, 0);
        dungeon.setCreature(enemy, 0, 2);
        var enemyStartingPosition = enemy.getTile();

        //TestDungeonFactory.showDungeon(dungeon);
        expect(enemy.canSee(player.getTile())).to.be.true;

        player.setNextMove(new Moves.MovementMove(1, 0));
        player.setNextMove(new Moves.MovementMove(1, 0));
        player.setNextMove(new Moves.MovementMove(0, 1));
        player.setNextMove(new Moves.MovementMove(0, 1));

        dungeon.resolveUntilBlocked();

        var enemyPosition  = enemy.getTile();
        expect(enemyPosition).not.to.equal(enemyStartingPosition);
    });
});
