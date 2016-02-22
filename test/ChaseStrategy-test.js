var System = require('es6-module-loader').System;
var expect = require('chai').expect;

describe('Creature', function() {
    beforeEach(function(done) {
        es6Inject([
            'js/app/dungeons/Dungeon.js',
            'js/app/dungeons/TestDungeonFactory.js',
            'js/app/entities/creatures/Creature.js',
            'js/app/entities/creatures/PlayableCharacter.js',
            'js/app/entities/creatures/Skeleton.js',
            'js/app/tiles/WallTile.js'
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
        var enemy = new Skeleton(dungeon);

        dungeon.setCreature(player, 0, 0);
        dungeon.setCreature(enemy, 0, 2);

        TestDungeonFactory.showDungeon(dungeon);
        expect(enemy.canSee(player.getTile())).to.be.true;
        //expect(enemy.canSee(player.getTile())).to.be.false;


        // Skeleton gets to move before player
        // TODO: Consider allowing creatures to observe movement on other creatures' turns
        // TODO: Consider adding an advanceUntil() method to dungeon
    });
});
