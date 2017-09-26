import Tiles from '../../../tiles/Tiles';

// TODO: h-pit with no walk-around area

export default [{
    name: 'Pit Chamber',
    minWidth: 3,
    maxWidth: 6,
    minHeight: 3,
    maxHeight: 4,
    minHallLength: 0,
    maxHallLength: 2,
    fill: function(prng, dungeon, {x1, y1, width, height}) {
        const x2 = x1 + width;
        const y2 = y1 + height;
        for(let x = x1; x < x2; x++) {
            for(let y = y1; y < y2; y++) {
                if(x === x1 || x === x2 - 1 || y === y1 || y === y2 - 1) {
                    dungeon.setTile(new Tiles.Tile(x, y), x, y);
                } else {
                    dungeon.setTile(new Tiles.PitTile(x, y), x, y);
                }
            }
        }
    }
}, {
    name: 'Empty Room',
    minWidth: 3,
    maxWidth: 6,
    minHeight: 3,
    maxHeight: 6,
    minHallLength: 1,
    maxHallLength: 4,
    fill: function(prng, dungeon, {x1, y1, width, height}) {
        const x2 = x1 + width;
        const y2 = y1 + height;
        for(let x = x1; x < x2; x++) {
            for(let y = y1; y < y2; y++) {
                dungeon.setTile(new Tiles.Tile(x, y), x, y);
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
    maxHallLength: 4,
    fill: function(prng, dungeon, {x1, y1, width, height}) {
        const x2 = x1 + width;
        const y2 = y1 + height;
        for(let x = x1; x < x2; x++) {
            for(let y = y1; y < y2; y++) {
                dungeon.setTile(new Tiles.Tile(x, y), x, y);
            }
        }
        let xStride = Random.integer(2, 4)(prng);
        let yStride = Random.integer(2, 4)(prng);
        for(let x = x1 + 1; x < x2; x += xStride) {
            for(let y = y1 + 1; y < y2; y += yStride) {
                dungeon.setTile(new Tiles.PillarTile(x, y), x, y);
            }
        }
    }
}, {
    name: 'Diagonal Pit Room',
    minWidth: 5,
    maxWidth: 9,
    minHeight: 5,
    maxHeight: 9,
    minHallLength: 1,
    maxHallLength: 2,
    fill: function(prng, dungeon, {x1, y1, width, height}) {
        const x2 = x1 + width;
        const y2 = y1 + height;
        for(let x = x1; x < x2; x++) {
            for(let y = y1; y < y2; y++) {
                // TODO: Put more spaces on the edges rather than making it completely walkable
                if((x % 2 === 0) === (y % 4 < 2) || x === x1 || x === x2 - 1 || y === y1 || y === y2 - 1) {
                    dungeon.setTile(new Tiles.Tile(x, y), x, y);
                } else {
                    dungeon.setTile(new Tiles.PitTile(x, y), x, y);
                }
            }
        }
    }
}];
