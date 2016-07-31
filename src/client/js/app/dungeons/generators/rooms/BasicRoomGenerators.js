import Tiles from '../../../tiles/Tiles.js';

// TODO: h-pit with no walk-around area

export default [{
    name: 'Pit Chamber',
    minWidth: 3,
    maxWidth: 9,
    minHeight: 3,
    maxHeight: 6,
    minHallLength: 0,
    maxHallLength: 2,
    fill: function(prng, dungeon, {x1, y1, width, height}) {
        const x2 = x1 + width - 1;
        const y2 = y1 + height - 1;
        for(let x = x1; x <= x2; x++) {
            for(let y = y1; y <= y2; y++) {
                if(x === x1 || x === x2 || y === y1 || y === y2) {
                    dungeon.setTile(new Tiles.Tile(dungeon, x, y), x, y);
                } else {
                    dungeon.setTile(new Tiles.PitTile(dungeon, x, y), x, y);
                }
            }
        }
    }
}, {
    name: 'Empty Room',
    minWidth: 3,
    maxWidth: 9,
    minHeight: 3,
    maxHeight: 6,
    minHallLength: 1,
    maxHallLength: 3,
    fill: function(prng, dungeon, {x1, y1, width, height}) {
        const x2 = x1 + width - 1;
        const y2 = y1 + height - 1;
        for(let x = x1; x <= x2; x++) {
            for(let y = y1; y <= y2; y++) {
                dungeon.setTile(new Tiles.Tile(dungeon, x, y), x, y);
            }
        }
    }
}, {
    name: 'Pillared Room',
    minWidth: 5,
    maxWidth: 9,
    minHeight: 5,
    maxHeight: 9,
    minHallLength: 1,
    maxHallLength: 2,
    fill: function(prng, dungeon, {x1, y1, width, height}) {
        const x2 = x1 + width - 1;
        const y2 = y1 + height - 1;
        for(let x = x1; x <= x2; x++) {
            for(let y = y1; y <= y2; y++) {
                dungeon.setTile(new Tiles.Tile(dungeon, x, y), x, y);
            }
        }
        let xStride = Random.integer(2, 4)(prng);
        let yStride = Random.integer(2, 4)(prng);
        for(let x = x1 + 1; x < x2; x += xStride) {
            for(let y = y1 + 1; y < y2; y += yStride) {
                dungeon.setTile(new Tiles.WallTile(dungeon, x, y), x, y);
            }
        }
    }
}];
