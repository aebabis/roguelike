import Dungeon from "./Dungeon.js";

import Classes from "../entities/creatures/classes/Classes.js";

import Tile from "../tiles/Tile.js";
import WallTile from "../tiles/WallTile.js";
import EntranceTile from "../tiles/EntranceTile.js";

import BasicGameConditions from "../conditions/BasicGameConditions.js";
import GetTheTreasureConditions from "../conditions/GetTheTreasureConditions.js";
import BlackVoidSphere from "../entities/creatures/BlackVoidSphere.js";
import ClunkyNinetiesCellPhone from "../entities/creatures/ClunkyNinetiesCellPhone.js";
import Ent from "../entities/creatures/Ent.js";
import FireSprite from "../entities/creatures/FireSprite.js";
import FlyingSerpent from "../entities/creatures/FlyingSerpent.js";
import Skeleton from "../entities/creatures/Skeleton.js";
import SlingshotImp from "../entities/creatures/SlingshotImp.js";
import Witch from "../entities/creatures/Witch.js";

import Fireball from "../abilities/Fireball.js";
import ForceDart from "../abilities/ForceDart.js";
import LesserSnare from "../abilities/LesserSnare.js";

import EntityTable from "../entities/EntityTable.js";
import TheTreasure from "../entities/TheTreasure.js";

import Stick from "../entities/weapons/Stick.js";
import Dagger from "../entities/weapons/Dagger.js";
import Shortsword from "../entities/weapons/Shortsword.js";
import Longsword from "../entities/weapons/Longsword.js";
import Shortbow from "../entities/weapons/Shortbow.js";

import LightArmor from "../entities/armor/LightArmor.js";
import MediumArmor from "../entities/armor/MediumArmor.js";

import CherrySoda from "../entities/consumables/CherrySoda.js";
import BlueberrySoda from "../entities/consumables/BlueberrySoda.js";

function getLoot(prng, dungeon) {
    return Random.picker([
        new Dagger(),
        new Shortbow(),
        new Stick(),
        new CherrySoda(),
        new BlueberrySoda()
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
    entity: FireSprite,
    weight: 6,
    cost: 6
}, {
    entity: FlyingSerpent,
    weight: 6,
    cost: 4
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
            new Dagger(),
            new Shortbow(),
            new Stick(),
            new CherrySoda(),
            new BlueberrySoda()
        ];
        drops.forEach(function(item) {
            var position = Random.integer(0, emptyTiles.length - 1)(prng);
            var tile = emptyTiles[position];
            tile.addItem(item);
        });

        var playerLocation = locations.shift();
        dungeon.setTile(new EntranceTile(dungeon, playerLocation.getX(), playerLocation.getY()), playerLocation.getX(), playerLocation.getY());
        dungeon.setCreature(player, playerLocation.getX(), playerLocation.getY());
        player.addItem(Fireball.asConsumable());

        // Test game configuration
        var creatures = table.rollEntries(dungeon, prng, 40);
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
