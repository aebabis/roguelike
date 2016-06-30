import Dungeon from './Dungeon.js';

import PlayableCharacter from '../entities/creatures/PlayableCharacter.js';

import Tile from '../tiles/Tile.js';
import WallTile from '../tiles/WallTile.js';

import BasicGameConditions from '../conditions/BasicGameConditions.js';
import BlackVoidSphere from '../entities/creatures/BlackVoidSphere.js';
import ClunkyNinetiesCellPhone from '../entities/creatures/ClunkyNinetiesCellPhone.js';
import Ent from '../entities/creatures/Ent.js';
import Skeleton from '../entities/creatures/Skeleton.js';
import SlingshotImp from '../entities/creatures/SlingshotImp.js';

import Dagger from '../entities/weapons/Dagger.js';
import Shortbow from '../entities/weapons/Shortbow.js';
import Stick from '../entities/weapons/Stick.js';

export default class TestDungeonFactory {
    static showDungeon(dungeon) {
        /* eslint-disable no-console */
        var width = dungeon.getWidth();
        var height = dungeon.getHeight();
        // Transpose dungeon coordinates and print
        console.log('\u250E' + Array(width + 1).join('\u2501') + '\u2512');
        for(let y = 0; y < height; y++) {
            var row = [];
            row.push('\u2503');
            for(let x = 0; x < width; x++) {
                var tile = dungeon.getTile(x, y);
                var creature = tile.getCreature();
                if(creature instanceof PlayableCharacter) {
                    row.push('P');
                } else if(creature){
                    row.push(creature.getName()[0]);
                } else if(tile instanceof WallTile) {
                    row.push('\u2588');
                } else {
                    row.push(' ');
                }
            }
            row.push('\u2503');
            console.log(row.join(''));
        }
        console.log('\u2516' + Array(width + 1).join('\u2501') + '\u251A');
        /* eslint-enable no-console */
    }

    getEmptyDungeon() {
        var dungeon = new Dungeon(5, 5);
        dungeon.setCreature(new PlayableCharacter(), 1, 1);
        return dungeon;
    }

    buildCustomWalledDungeon(wallMap) {
        var width = wallMap.length;
        var height = wallMap[0].length;
        var dungeon = new Dungeon(width, height);
        wallMap.forEach(function(column, x) {
            column.forEach(function(hasWall, y) {
                if(hasWall) {
                    dungeon.setTile(new WallTile(dungeon, x, y), x, y);
                }
            });
        });
        return dungeon;
    }

    getLDungeon() {
        var dungeon = new Dungeon(5, 5);

        [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]].forEach(function(coords) {
            var x = coords[0];
            var y = coords[1];
            dungeon.setTile(new WallTile(dungeon, x, y), x, y);
        });

        // Test game configuration
        dungeon.setCreature(new PlayableCharacter(), 3, 3);

        return dungeon;
    }

    getODungeon() {
        var dungeon = new Dungeon(3, 3);

        [[0, 1], [1, 0], [2, 1], [1, 2]].forEach(function(coords) {
            var x = coords[0];
            var y = coords[1];
            dungeon.setTile(new WallTile(dungeon, x, y), x, y);
        });

        // Test game configuration
        dungeon.setCreature(new PlayableCharacter(), 1, 1);

        return dungeon;
    }

    getLineDungeon() {
        var dungeon = new Dungeon(3, 1);
        dungeon.setTile(new WallTile(dungeon, 1, 0), 1, 0);
        dungeon.setCreature(new PlayableCharacter(), 2, 0);
        return dungeon;
    }

    getBasicEnemyDungeon(prng) {
        var width = Random.integer(15, 20)(prng);
        var height = Random.integer(10, 15)(prng);

        var numTiles = width * height;
        var minOpenTiles = Math.floor(.6 * numTiles);
        var maxOpenTiles = Math.floor(.8 * numTiles);

        var numOpenTiles = Random.integer(minOpenTiles, maxOpenTiles)(prng);

        var dungeon = new Dungeon(width, height);

        for(var x = 0; x < width; x++) {
            for(var y = 0; y < height; y++) {
                dungeon.setTile(new WallTile(dungeon, x, y), x, y);
            }
        }

        var tile = dungeon.getTile(Random.integer(0, width - 1)(prng), Random.integer(0, height - 1)(prng));
        var doneList = {};
        var adjacentList = {};

        for(var times = 0; times < numOpenTiles; times++) {
            let x = tile.getX();
            let y = tile.getY();
            tile = new Tile(dungeon, x, y);
            dungeon.setTile(tile, x, y);
            doneList[x+','+y] = true;
            tile.getNeighbors4().forEach(function(tile) {
                var str = tile.getX() + ',' + tile.getY();
                if(!doneList[str]) {
                    adjacentList[str] = true;
                }
            });
            var key = Random.picker(Object.keys(adjacentList))(prng);
            adjacentList[key] = false;
            var coords = key.split(',');
            tile = dungeon.getTile(coords[0], coords[1]);
        }

        var emptyTiles = dungeon.getTiles(tile=>!tile.isSolid());
        var locations = Random.shuffle(prng, emptyTiles);

        var drops = [
            new Dagger(),
            new Shortbow(),
            new Stick()
        ];
        drops.forEach(function(item) {
            var position = Random.integer(0, emptyTiles.length - 1)(prng);
            var tile = emptyTiles[position];
            tile.addItem(item);
        });

        var player = new PlayableCharacter();

        player.setMeleeWeapon(new Dagger());
        player.addItem(new Shortbow());
        player.addItem(new Stick());

        // Test game configuration
        var creatures = [
            player,
            new BlackVoidSphere(),
            new SlingshotImp(),
            new Ent(),
            new ClunkyNinetiesCellPhone(),
            new Skeleton()
        ];
        creatures.forEach(function(creature) {
            var loc = locations.shift();
            dungeon.setCreature(creature, loc.getX(), loc.getY());
        });

        dungeon.setGameConditions(new BasicGameConditions());

        return dungeon;
    }
}
