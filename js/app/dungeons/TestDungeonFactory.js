import { default as Dungeon } from "./Dungeon.js";

import { default as PlayableCharacter } from "../entities/creatures/PlayableCharacter.js";

import { default as Tile } from "../tiles/Tile.js";
import { default as WallTile } from "../tiles/WallTile.js";

import { default as BasicGameConditions } from "../conditions/BasicGameConditions.js";
import { default as BlackVoidSphere } from "../entities/creatures/BlackVoidSphere.js";
import { default as Ent } from "../entities/creatures/Ent.js";
import { default as SlingshotImp } from "../entities/creatures/SlingshotImp.js";

export default class TestDungeonFactory {
    getEmptyDungeon() {
        var dungeon = new Dungeon(5, 5);
        dungeon.setCreature(new PlayableCharacter(dungeon), 1, 1);
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
        dungeon.setCreature(new PlayableCharacter(dungeon), 3, 3);

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
        dungeon.setCreature(new PlayableCharacter(dungeon), 1, 1);

        return dungeon;
    }

    getLineDungeon() {
        var dungeon = new Dungeon(3, 1);
        dungeon.setTile(new WallTile(dungeon, 1, 0), 1, 0);
        dungeon.setCreature(new PlayableCharacter(dungeon), 2, 0);
        return dungeon;
    }

    getBasicEnemyDungeon() {
        var seed = +new Date();
        console.log(seed);
        var prng = Random.engines.mt19937();
        prng.seed(+new Date());

        var width = Random.integer(8, 15)(prng);
        var height = Random.integer(7, 10)(prng);

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
        console.log("Num open tiles", numOpenTiles);
        for(var times = 0; times < numOpenTiles; times++) {
            let x = tile.getX();
            let y = tile.getY();
            var tile = new Tile(dungeon, x, y);
            dungeon.setTile(tile, x, y);
            doneList[x+','+y] = true;
            tile.getNeighbors8().forEach(function(tile) {
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

        // Test game configuration
        var loc = locations.shift();
        dungeon.setCreature(new PlayableCharacter(dungeon), loc.getX(), loc.getY());
        var loc = locations.shift();
        dungeon.setCreature(new BlackVoidSphere(dungeon), loc.getX(), loc.getY());
        var loc = locations.shift();
        dungeon.setCreature(new SlingshotImp(dungeon), loc.getX(), loc.getY());
        var loc = locations.shift();
        dungeon.setCreature(new Ent(dungeon), loc.getX(), loc.getY());

        dungeon.setGameConditions(new BasicGameConditions());

        return dungeon;
    }
}
