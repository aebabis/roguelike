import { default as Dungeon } from "./Dungeon.js";

import { default as PlayableCharacter } from "../entities/creatures/PlayableCharacter.js";

import { default as Tile } from "../tiles/Tile.js";
import { default as WallTile } from "../tiles/WallTile.js";

import { default as BasicGameConditions } from "../conditions/BasicGameConditions.js";
import { default as BlackVoidSphere } from "../entities/creatures/BlackVoidSphere.js";
import { default as ClunkyNinetiesCellPhone } from "../entities/creatures/ClunkyNinetiesCellPhone.js";
import { default as Ent } from "../entities/creatures/Ent.js";
import { default as Skeleton } from "../entities/creatures/Skeleton.js";
import { default as SlingshotImp } from "../entities/creatures/SlingshotImp.js";

import { default as Dagger } from "../entities/weapons/Dagger.js";
import { default as Shortbow } from "../entities/weapons/Shortbow.js";
import { default as Stick } from "../entities/weapons/Stick.js";

function getLoot(prng, dungeon) {
    return Random.picker([
        new Dagger(dungeon),
        new Shortbow(dungeon),
        new Stick(dungeon)
    ])(prng);
}

export default class RandomMapDungeonFactory {
    getRandomMap(prng) {
        var width = Random.integer(15, 20)(prng);
        var height = Random.integer(10, 15)(prng);

        var numTiles = width * height;
        var minOpenTiles = Math.floor(.3 * numTiles);
        var maxOpenTiles = Math.floor(.5 * numTiles);

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
        var descheduledList = {};

        for(var times = 0; times < numOpenTiles; times++) {
            let x = tile.getX();
            let y = tile.getY();
            var tile = new Tile(dungeon, x, y);
            dungeon.setTile(tile, x, y);
            doneList[x+','+y] = true;
            tile.getNeighbors4().forEach(function(tile) {
                var nX = tile.getX();
                var nY = tile.getY();
                var dX = nX - x;
                var dY = nY - y;
                var str = nX + ',' + nY;
                // Since corner gaps look weird, we prevent them
                // by removing from the adjacency list, any wall tile
                // which is adjacent to the new selection and whose
                // opposite tile is a floor-neighboring wall
                var oX = x + 2 * dX;
                var oY = y + 2 * dY;
                var oppositeKey = oX + ',' + oY;
                var cwKey = dX ? oX + ',' + (oY + dX) : (oX + dY) + ',' + oY;
                var ccwKey = dX ? oX + ',' + (oY - dX) : (oX - dY) + ',' + oY;
                //console.log(x, y, nX, nY, oppositeKey, cwKey, ccwKey);
                var isOppositeWall = !doneList[oppositeKey];
                var isCWFloor = !!doneList[cwKey];
                var isCCWFloor = !!doneList[ccwKey];
                var isNeighborLegal = isOppositeWall && (isCWFloor || isCCWFloor);
                if(!doneList[str] && !isNeighborLegal) {
                    adjacentList[str] = true;
                } else {
                    delete adjacentList[str];
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
            new Dagger(dungeon),
            new Shortbow(dungeon),
            new Stick(dungeon)
        ];
        drops.forEach(function(item) {
            var position = Random.integer(0, emptyTiles.length - 1)(prng);
            var tile = emptyTiles[position];
            console.log(item, 'at', tile);
            tile.addItem(item);
        });

        var player = new PlayableCharacter(dungeon);

        player.setMeleeWeapon(new Dagger(dungeon));
        player.addItem(new Shortbow(dungeon));
        player.addItem(new Stick(dungeon));

        // Test game configuration
        var creatures = [
            player,
            new BlackVoidSphere(dungeon),
            new SlingshotImp(dungeon),
            new Ent(dungeon),
            new ClunkyNinetiesCellPhone(dungeon),
            new Skeleton(dungeon)
        ];
        creatures.forEach(function(creature) {
            var loc = locations.shift();
            dungeon.setCreature(creature, loc.getX(), loc.getY());
        });

        dungeon.setGameConditions(new BasicGameConditions());

        return dungeon;
    }
}
