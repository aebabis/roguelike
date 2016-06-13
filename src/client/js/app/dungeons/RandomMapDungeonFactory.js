import { default as Dungeon } from "./Dungeon.js";

import { default as Classes } from "../entities/creatures/classes/Classes.js";

import { default as Tile } from "../tiles/Tile.js";
import { default as WallTile } from "../tiles/WallTile.js";
import { default as EntranceTile } from "../tiles/EntranceTile.js";

import { default as BasicGameConditions } from "../conditions/BasicGameConditions.js";
import { default as GetTheTreasureConditions } from "../conditions/GetTheTreasureConditions.js";
import { default as BlackVoidSphere } from "../entities/creatures/BlackVoidSphere.js";
import { default as ClunkyNinetiesCellPhone } from "../entities/creatures/ClunkyNinetiesCellPhone.js";
import { default as Ent } from "../entities/creatures/Ent.js";
import { default as Skeleton } from "../entities/creatures/Skeleton.js";
import { default as SlingshotImp } from "../entities/creatures/SlingshotImp.js";
import { default as Witch } from "../entities/creatures/Witch.js";

import { default as Fireball } from "../abilities/Fireball.js";
import { default as ForceDart } from "../abilities/ForceDart.js";

import { default as EntityTable } from "../entities/EntityTable.js";
import { default as TheTreasure } from "../entities/TheTreasure.js";

import { default as Stick } from "../entities/weapons/Stick.js";
import { default as Dagger } from "../entities/weapons/Dagger.js";
import { default as Shortsword } from "../entities/weapons/Shortsword.js";
import { default as Longsword } from "../entities/weapons/Longsword.js";
import { default as Shortbow } from "../entities/weapons/Shortbow.js";

import { default as LightArmor } from "../entities/armor/LightArmor.js";
import { default as MediumArmor } from "../entities/armor/MediumArmor.js";

function getLoot(prng, dungeon) {
    return Random.picker([
        new Dagger(dungeon),
        new Shortbow(dungeon),
        new Stick(dungeon)
    ])(prng);
}

var table = new EntityTable([{
    entity: BlackVoidSphere,
    weight: 10,
    cost: 3
}, {
    entity: ClunkyNinetiesCellPhone,
    weight: 3,
    cost: 5
}, {
    entity: Ent,
    weight: 6,
    cost: 9
}, {
    entity: Skeleton,
    weight: 8,
    cost: 5
}, {
    entity: SlingshotImp,
    weight: 5,
    cost: 4
}, {
    entity: Witch,
    weight: 5,
    cost: 10
}]);

export default class RandomMapDungeonFactory {
    getRandomMap(prng, CharacterClass) {
        var width = Random.integer(17, 22)(prng);
        var height = Random.integer(12, 18)(prng);

        var numTiles = width * height;
        var minOpenTiles = Math.floor(.2 * numTiles);
        var maxOpenTiles = Math.floor(.4 * numTiles);

        var numOpenTiles = Random.integer(minOpenTiles, maxOpenTiles)(prng);

        var dungeon = new Dungeon(width, height);

        for(var x = 0; x < width; x++) {
            for(var y = 0; y < height; y++) {
                dungeon.setTile(new WallTile(dungeon, x, y), x, y);
            }
        }

        var tile = dungeon.getTile(Random.integer(1, width - 2)(prng), Random.integer(1, height - 2)(prng));
        var doneList = {};
        var adjacentList = {};
        var descheduledList = {};

        for(var times = 0; times < numOpenTiles; times++) {
            let x = tile.getX();
            let y = tile.getY();
            var tile = new Tile(dungeon, x, y);
            dungeon.setTile(tile, x, y);
            doneList[x+','+y] = true;
            tile.getNeighbors4().filter(function(tile) {
                // Edge tiles must be wall
                var x = tile.getX();
                var y = tile.getY();
                return x !== 0 && y !== 0 && x !== width - 1 && y !== height - 1;
            }).forEach(function(tile) {
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
                var isCWFloor = doneList[cwKey];
                var isCCWFloor = doneList[ccwKey];
                var isNeighborLegal = isOppositeWall && (isCWFloor || isCCWFloor);
                if(!doneList[str] && !isNeighborLegal) {
                    adjacentList[str] = true;
                } else {
                    delete adjacentList[str];
                }
            });
            var key = Random.picker(Object.keys(adjacentList))(prng);
            delete adjacentList[key];
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
            tile.addItem(item);
        });

        if(!CharacterClass) {
            var classes = Object.keys(Classes);
            var index = Math.floor(Math.random() * classes.length);
            CharacterClass = Classes[classes[index]];
        }
        var player = new CharacterClass(dungeon);

        // Starting items
        switch(player.toString()) {
            case "Fighter":
                player.setMeleeWeapon(new Shortsword(dungeon));
                player.setArmor(new MediumArmor(dungeon));
                break;
            case "Rogue":
                player.setMeleeWeapon(new Dagger(dungeon));
                player.setRangedWeapon(new Shortbow(dungeon));
                player.setArmor(new LightArmor(dungeon));
                break;
            case "Wizard":
                player.setMeleeWeapon(new Stick(dungeon));
                player.addAbility(new Fireball());
                player.addAbility(new ForceDart());
                break;
        }

        var playerLocation = locations.shift();
        dungeon.setTile(new EntranceTile(dungeon, playerLocation.getX(), playerLocation.getY()), playerLocation.getX(), playerLocation.getY());
        dungeon.setCreature(player, playerLocation.getX(), playerLocation.getY());

        // Test game configuration
        var creatures = table.rollEntries(dungeon, prng, 30);
        var enemyLocations = locations.filter((location)=>location.getEuclideanDistance(playerLocation) > 5);
        creatures.forEach(function(creature) {
            var loc = enemyLocations.shift();
            dungeon.setCreature(creature, loc.getX(), loc.getY());
        });

        var treasureLocation = Random.picker(enemyLocations)(prng);
        treasureLocation.addItem(new TheTreasure(dungeon));

        dungeon.setGameConditions(new GetTheTreasureConditions());

        return dungeon;
    }
}
