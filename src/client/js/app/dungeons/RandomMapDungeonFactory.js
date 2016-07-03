import Dungeon from './Dungeon.js';

import Tile from '../tiles/Tile.js';
import WallTile from '../tiles/WallTile.js';
import PitTile from '../tiles/PitTile.js';
import EntranceTile from '../tiles/EntranceTile.js';

import GetTheTreasureConditions from '../conditions/GetTheTreasureConditions.js';

import Enemies from '../entities/creatures/enemies/Enemies.js';

import Abilities from '../abilities/Abilities.js';

import EntityTable from '../entities/EntityTable.js';
import TheTreasure from '../entities/TheTreasure.js';

import Weapons from '../entities/weapons/Weapons.js';
import Armors from '../entities/armor/Armors.js';

import AbilityConsumable from '../entities/consumables/AbilityConsumable.js';
import CherrySoda from '../entities/consumables/CherrySoda.js';
import BlueberrySoda from '../entities/consumables/BlueberrySoda.js';

function getLoot(prng) {
    return Random.picker([
        new Weapons.Stick(),
        new Weapons.Dagger(),
        new Weapons.Shortsword(),
        new Weapons.Longsword(),
        new Weapons.Sling(),
        new Weapons.Shortbow(),
        new Weapons.Longbow(),
        new CherrySoda(),
        new BlueberrySoda(),
        new AbilityConsumable(new Abilities.Fireball()),
        new AbilityConsumable(new Abilities.ForceDart()),
        new AbilityConsumable(new Abilities.LesserSnare()),
        new Armors.LightArmor(),
        new Armors.MediumArmor(),
        new Armors.HeavyArmor()
    ])(prng);
}

var table = new EntityTable([{
    entity: Enemies.Archer,
    weight: 7,
    cost: 10
}, {
    entity: Enemies.BlackVoidSphere,
    weight: 10,
    cost: 3
}, {
    entity: Enemies.ClunkyNinetiesCellPhone,
    weight: 3,
    cost: 5
}, {
    entity: Enemies.Ent,
    weight: 6,
    cost: 9
}, {
    entity: Enemies.FireSprite,
    weight: 6,
    cost: 6
}, {
    entity: Enemies.FlyingSerpent,
    weight: 6,
    cost: 4
}, {
    entity: Enemies.MongolianHorseArcher,
    weight: 8,
    cost: 20
}, {
    entity: Enemies.Skeleton,
    weight: 8,
    cost: 5
}, {
    entity: Enemies.SlingshotImp,
    weight: 5,
    cost: 3
}, {
    entity: Enemies.Witch,
    weight: 5,
    cost: 10
}]);

export default class RandomMapDungeonFactory {
    getRandomMap(prng, player) {
        var width = Random.integer(17, 22)(prng);
        var height = Random.integer(12, 18)(prng);

        var numTiles = width * height;
        var minOpenTiles = Math.floor(.2 * numTiles);
        var maxOpenTiles = Math.floor(.4 * numTiles);

        var numOpenTiles = Random.integer(minOpenTiles, maxOpenTiles)(prng);

        var dungeon = new Dungeon(width, height);

        for(var x = 0; x < width; x++) {
            for(var y = 0; y < height; y++) {
                if(Random.bool(.2)(prng)) {
                    dungeon.setTile(new PitTile(dungeon, x, y), x, y);
                } else {
                    dungeon.setTile(new WallTile(dungeon, x, y), x, y);
                }
            }
        }

        var tile = dungeon.getTile(Random.integer(1, width - 2)(prng), Random.integer(1, height - 2)(prng));
        var doneList = {};
        var adjacentList = {};

        for(var times = 0; times < numOpenTiles; times++) {
            let x = tile.getX();
            let y = tile.getY();
            tile = new Tile(dungeon, x, y);
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

        var emptyTiles = dungeon.getTiles(tile=>!tile.isSolid() && tile.hasFloor());
        var locations = Random.shuffle(prng, emptyTiles);

        var drops = [
            getLoot(prng),
            getLoot(prng),
            getLoot(prng),
            getLoot(prng),
            getLoot(prng),
            getLoot(prng)
        ];
        drops.forEach(function(item) {
            var position = Random.integer(0, emptyTiles.length - 1)(prng);
            var tile = emptyTiles[position];
            tile.addItem(item);
        });

        var playerLocation = locations.shift();
        dungeon.setTile(new EntranceTile(dungeon, playerLocation.getX(), playerLocation.getY()), playerLocation.getX(), playerLocation.getY());
        dungeon.setCreature(player, playerLocation.getX(), playerLocation.getY());

        // Test game configuration
        var creatures = table.rollEntries(dungeon, prng, 50);
        var enemyLocations = locations.filter((location)=>location.getEuclideanDistance(playerLocation) > 5);
        creatures.forEach(function(creature) {
            var loc = enemyLocations.shift();
            if(loc) {
                dungeon.setCreature(creature, loc.getX(), loc.getY());
            }
        });

        var treasureLocation = Random.picker(enemyLocations)(prng);
        treasureLocation.addItem(new TheTreasure(dungeon));

        dungeon.setGameConditions(new GetTheTreasureConditions());

        return dungeon;
    }
}
