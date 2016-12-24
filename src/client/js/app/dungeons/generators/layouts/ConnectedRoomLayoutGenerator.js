import BasicRoomGenerators from '../rooms/BasicRoomGenerators.js';

import Dungeon from '../../Dungeon.js';

import Tiles from '../../../tiles/Tiles.js';

const NORTH = 'NORTH';
const EAST = 'EAST';
const SOUTH = 'SOUTH';
const WEST = 'WEST';

const OPPOSITES = {
    [NORTH]: SOUTH,
    [EAST]: WEST,
    [SOUTH]: NORTH,
    [WEST]: EAST
};

function buildRoom(prng) {
    const generator = Random.picker(BasicRoomGenerators)(prng);
    return {
        generator,
        width: Random.integer(generator.minWidth, generator.maxWidth)(prng),
        height: Random.integer(generator.minHeight, generator.maxHeight)(prng),
        hallLength: Random.integer(generator.minHallLength, generator.maxHallLength)(prng)
    };
}

function getEdges(room) {
    return [{
        side: NORTH,
        y: room.y,
        x1: room.x,
        x2: room.x + room.width
    }, {
        side: EAST,
        x: room.x + room.width,
        y1: room.y,
        y2: room.y + room.height
    }, {
        side: SOUTH,
        y: room.y + room.height,
        x1: room.x,
        x2: room.x + room.width
    }, {
        side: WEST,
        x: room.x,
        y1: room.y,
        y2: room.y + room.height
    }];
}

function positionRoom(prng, room, edge) {
    switch(edge.side) {
    case NORTH:
        room.y = edge.y - room.hallLength - room.height;
        room.x = Random.integer(edge.x1 - room.width + 1, edge.x2 - 1)(prng);
        break;
    case EAST:
        room.x = edge.x + room.hallLength;
        room.y = Random.integer(edge.y1 - room.height + 1, edge.y2 - 1)(prng);
        break;
    case SOUTH:
        room.y = edge.y + room.hallLength;
        room.x = Random.integer(edge.x1 - room.width + 1, edge.x2 - 1)(prng);
        break;
    case WEST:
        room.x = edge.x - room.hallLength - room.width;
        room.y = Random.integer(edge.y1 - room.height + 1, edge.y2 - 1)(prng);
        break;
    }
}

function getHall(prng, room, edge) {
    if(typeof edge.y === 'number') { // NORTH or SOUTH
        const minX = Math.max(room.x, edge.x1);
        const maxX = Math.min(room.x + room.width, edge.x2);
        const lowerX = Random.integer(minX, maxX - 1)(prng);
        const upperX = Random.integer(lowerX + 1, maxX)(prng);
        return {
            x1: lowerX,
            y1: (edge.side === NORTH) ? room.y + room.height : edge.y,
            x2: upperX,
            y2: (edge.side === NORTH) ? edge.y : room.y,
            direction: 'y'
        };
    } else {
        const minY = Math.max(room.y, edge.y1);
        const maxY = Math.min(room.y + room.height, edge.y2);
        const lowerY = Random.integer(minY, maxY - 1)(prng);
        const upperY = Random.integer(lowerY + 1, maxY)(prng);
        return {
            x1: (edge.side === EAST) ? edge.x : room.x,
            y1: lowerY,
            x2: (edge.side === EAST) ? room.x : edge.x,
            y2: upperY,
            direction: 'x'
        };
    }
}

function intersects(room1, room2) {
    return !(room1.x >= room2.x + room2.width ||
            room2.x >= room1.x + room1.width ||
            room1.y >= room2.y + room2.height ||
            room2.y >= room1.y + room1.height);
}

function shiftLayout(rooms, halls) {
    const minX = rooms.map(({x})=>x).reduce((a, b)=>Math.min(a, b));
    const maxX = rooms.map(({x, width})=>x+width).reduce((a, b)=>Math.max(a, b));
    const minY = rooms.map(({y})=>y).reduce((a, b)=>Math.min(a, b));
    const maxY = rooms.map(({y, height})=>y+height).reduce((a, b)=>Math.max(a, b));
    return {
        width: maxX - minX + 2,
        height: maxY - minY + 2,
        rooms: rooms.map(({x, y, width, height}) => ({
            x: x - minX + 1,
            y: y - minY + 1,
            width,
            height
        })),
        halls: halls.map(({x1, y1, x2, y2}) => ({
            x1: x1 - minX + 1,
            x2: x2 - minX + 1,
            y1: y1 - minY + 1,
            y2: y2 - minY + 1
        }))
    };
}

function print({width, height, rooms, halls}) {
    const dungeon = new Array(height).fill(0).map(()=>new Array(width).fill('#'));
    rooms.forEach(({x, y, width, height}) => {
        const x2 = x + width;
        const y2 = y + height;
        for(let i = x; i < x2; i++) {
            for(let j = y; j < y2; j++) {
                dungeon[j][i] = ' ';
            }
        }
    });
    halls.forEach(({x1, x2, y1, y2}) => {
        for(let i = x1; i < x2; i++) {
            for(let j = y1; j < y2; j++) {
                dungeon[j][i] = ' ';
            }
        }
    });
    console.log(dungeon.map(row=>row.join('')).join('\n'));
}

export default {
    generate: function(prng, options = {
        numRooms: 10,
        minRoomDimension: 3,
        maxRoomDimension: 10
    }) {
        let rooms = [];
        let openEdges = [];
        let halls = [];

        let room = buildRoom(prng);
        room.x = 0;
        room.y = 0;
        rooms.push(room);
        openEdges = openEdges.concat(getEdges(room));

        while(rooms.length < options.numRooms) {
            const roomIndex = Random.integer(0, openEdges.length - 1)(prng);
            let edge = openEdges.splice(roomIndex, 1)[0];
            room = buildRoom(prng);

            positionRoom(prng, room, edge);
            if(!rooms.some((room2)=>intersects(room, room2))) {
                rooms.push(room);
                let hall = getHall(prng, room, edge);
                halls.push(hall);

                openEdges = openEdges.concat(getEdges(room).filter(
                    (newEdge)=>newEdge.side !== OPPOSITES[edge.side])
                );
            }
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        rooms.forEach(function(room) {
            const {x, y, width, height} = room;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + width);
            maxY = Math.max(maxY, y + height);
        });

        let width = maxX - minX + 2;
        let height = maxY - minY + 2;

        // Shift rooms and halls so that
        // top-most room is at y=1 and
        // left-most room is at x=1
        rooms.forEach(function(room) {
            room.x -= (minX - 1);
            room.y -= (minY - 1);
        });

        halls.forEach(function(hall) {
            hall.x1 -= (minX - 1);
            hall.y1 -= (minY - 1);
            hall.x2 -= (minX - 1);
            hall.y2 -= (minY - 1);
        });

        var dungeon = new Dungeon(width, height);

        for(var x = 0; x < width; x++) {
            for(var y = 0; y < height; y++) {
                dungeon.setTile(new Tiles.WallTile(x, y), x, y);
            }
        }

        let key = 0;
        rooms.forEach(function(room) {
            key++;
            const roomWidth = room.width;
            const roomHeight = room.height;
            const roomX = room.x;
            const roomY = room.y;
            room.generator.fill(prng, dungeon, {
                x1: roomX,
                y1: roomY,
                width: roomWidth,
                height: roomHeight
            });
            const startX = Math.max(roomX - 1, 0);
            const endX = Math.min(roomX + roomWidth + 1, width);
            const startY = Math.max(roomY - 1, 0);
            const endY = Math.min(roomY + roomHeight + 1, height);
            for(let x = startX; x < endX; x++) {
                for(let y = startY; y < endY; y++) {
                    dungeon.getTile(x, y).setRoomKey(key);
                }
            }
        });

        halls.forEach(function({x1, y1, x2, y2, direction}) {
            for(let x = x1; x < x2; x++) {
                for(let y = y1; y < y2; y++) {
                    dungeon.setTile(new Tiles.Tile(x, y), x, y);
                }
            }
            if(Random.bool(.4)(prng)) {
                const doorX = Random.integer(x1, x2 - 1)(prng);
                const doorY = Random.integer(y1, y2 - 1)(prng);
                if(direction === 'x') {
                    for(let y = y1; y < y2; y++) {
                        dungeon.setTile(new Tiles.WallTile(doorX, y), doorX, y);
                    }
                } else {
                    for(let x = x1; x < x2; x++) {
                        dungeon.setTile(new Tiles.WallTile(x, doorY), x, doorY);
                    }
                }
                dungeon.setTile(new Tiles.DoorTile(doorX, doorY), doorX, doorY);
            }
        });

        return dungeon;
    }
};
