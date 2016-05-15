var System = require('es6-module-loader').System;
var expect = require('chai').expect;

describe('Creature', function() {
    beforeEach(function(done) {
        es6Inject([
            'src/client/js/app/dungeons/Dungeon.js',
            'src/client/js/app/dungeons/TestDungeonFactory.js',
            'src/client/js/app/entities/creatures/Creature.js',
            'src/client/js/app/entities/creatures/PlayableCharacter.js',
            'src/client/js/app/tiles/WallTile.js'
        ]).then(done, done);
    });

    it('should be able to see an adjacent tile', function() {
        var dungeon = new TestDungeonFactory().getEmptyDungeon();
        var creature = dungeon.getPlayableCharacter();

        expect(creature.canSee(dungeon.getTile(0, 1))).to.equal(true);
    });

    it('should be able to see in a straight line', function() {
        var dungeon = new TestDungeonFactory().getEmptyDungeon();
        var creature = dungeon.getPlayableCharacter();

        expect(creature.canSee(dungeon.getTile(4, 1))).to.equal(true);
    });

    it('should not see through walls', function() {
        var dungeon = new TestDungeonFactory().getLineDungeon();
        var creature = dungeon.getPlayableCharacter();

        expect(creature.canSee(dungeon.getTile(0, 0))).to.equal(false);
    });

    it('should be able to see across corners', function() {
        var dungeon = new TestDungeonFactory().getODungeon();
        var creature = dungeon.getPlayableCharacter();

        expect(creature.canSee(dungeon.getTile(0, 0))).to.equal(true);
        expect(creature.canSee(dungeon.getTile(0, 2))).to.equal(true);
        expect(creature.canSee(dungeon.getTile(2, 0))).to.equal(true);
        expect(creature.canSee(dungeon.getTile(2, 2))).to.equal(true);
    });
});
