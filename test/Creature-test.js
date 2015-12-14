var System = require('es6-module-loader').System;
var expect = require('chai').expect;

var depList = ['js/app/Dungeon.js',
    'js/app/Creature.js',
    'js/app/creatures/PlayableCharacter.js',
    'js/app/tiles/WallTile.js',
    'js/app/dungeons/TestDungeonFactory.js'
];

var MODULES = {};

describe('creature', function() {
    before(function(done) {
        // Files have to be loaded sequentially to prevent traceur/es6-module-loader
        // bug.
        depList.reduce(function(chain, fileName) {
            return chain.then(function() {
                return System.import(fileName).then(function(module) {
                    var modName = fileName.split(/[\/\.]/);
                    modName = modName[modName.length - 2];
                    MODULES[modName] = module.default;
                });
            });
        }, Promise.resolve()).then(done, done);
    });

    it('should be able to see an adjacent tile', function() {
        var dungeon = new MODULES['TestDungeonFactory']().getEmptyDungeon();
        var creature = dungeon.getPlayableCharacter();

        expect(creature.canSee(dungeon.getTile(0, 1))).to.equal(true);
    });

    it('should be able to see in a straight line', function() {
        var dungeon = new MODULES['TestDungeonFactory']().getEmptyDungeon();
        var creature = dungeon.getPlayableCharacter();
        
        expect(creature.canSee(dungeon.getTile(4, 1))).to.equal(true);
    });

    it('should not see through walls', function() {
        var dungeon = new MODULES['TestDungeonFactory']().getLineDungeon();
        var creature = dungeon.getPlayableCharacter();

        expect(creature.canSee(dungeon.getTile(0, 0))).to.equal(false);
    });

    it('should be able to see across corners', function() {
        var dungeon = new MODULES['TestDungeonFactory']().getODungeon();
        var creature = dungeon.getPlayableCharacter();

        expect(creature.canSee(dungeon.getTile(0, 0))).to.equal(true);
        expect(creature.canSee(dungeon.getTile(0, 2))).to.equal(true);
        expect(creature.canSee(dungeon.getTile(2, 0))).to.equal(true);
        expect(creature.canSee(dungeon.getTile(2, 2))).to.equal(true);
    });
});
