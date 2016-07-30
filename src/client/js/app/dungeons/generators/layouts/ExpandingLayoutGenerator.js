import Dungeon from '../../Dungeon.js';

import Tiles from '../../../tiles/Tiles.js';

const WIDTH = {
    lower: 24,
    upper: 30
};
var HEIGHT = {
    lower: 15,
    upper: 20
};

export default {
    generate: function(prng) {
        var width = Random.integer(WIDTH.lower, WIDTH.upper)(prng);
        var height = Random.integer(HEIGHT.lower, HEIGHT.upper)(prng);

        var numTiles = width * height;
        var minOpenTiles = Math.floor(.2 * numTiles);
        var maxOpenTiles = Math.floor(.4 * numTiles);

        var numOpenTiles = Random.integer(minOpenTiles, maxOpenTiles)(prng);

        var dungeon = new Dungeon(width, height);

        for(var x = 0; x < width; x++) {
            for(var y = 0; y < height; y++) {
                if(Random.bool(.2)(prng)) {
                    dungeon.setTile(new Tiles.PitTile(dungeon, x, y), x, y);
                } else {
                    dungeon.setTile(new Tiles.WallTile(dungeon, x, y), x, y);
                }
            }
        }

        var tile = dungeon.getTile(Random.integer(1, width - 2)(prng), Random.integer(1, height - 2)(prng));
        var doneList = {};
        var adjacentList = {};

        for(var times = 0; times < numOpenTiles; times++) {
            let x = tile.getX();
            let y = tile.getY();
            tile = new Tiles.Tile(dungeon, x, y);
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

        return dungeon;
    }
};
