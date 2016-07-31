import BasicRoomGenerators from '../rooms/BasicRoomGenerators.js';

import Dungeon from '../../Dungeon.js';

import Tiles from '../../../tiles/Tiles.js';

// TODO: All boundaries need to be of the form [x1, x2)
// This makes it possible to represent an empty boundary

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
        let lowerX = Math.max(room.x, edge.x1);
        let upperX = Math.min(room.x + room.width - 1, edge.x2 - 1);
        let values = [
            Random.integer(lowerX, upperX)(prng),
            Random.integer(lowerX, upperX)(prng)
        ].sort();
        return {
            x1: values[0],
            y1: (edge.side === NORTH) ? room.y : edge.y,
            x2: values[1],
            y2: (edge.side === NORTH) ? edge.y : room.y + room.height - 1
        };
    } else {
        let lowerY = Math.max(room.y, edge.y1);
        let upperY = Math.min(room.y + room.height - 1, edge.y2 - 1);
        let values = [
            Random.integer(lowerY, upperY)(prng),
            Random.integer(lowerY, upperY)(prng)
        ].sort();
        return {
            x1: (edge.side === EAST) ? edge.x : room.x,
            y1: values[0],
            x2: (edge.side === EAST) ? room.x + room.width - 1 : edge.x,
            y2: values[1]
        };
    }
}

function intersects(room1, room2) {
    return false;
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
                halls.push(getHall(prng, room, edge));
            }

            openEdges = openEdges.concat(getEdges(room).filter(
                (newEdge)=>newEdge.side !== OPPOSITES[edge.side])
            );
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        rooms.forEach(function(room) {
            const {x, y, width, height} = room;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + width - 1);
            maxY = Math.max(maxY, y + height - 1);
        });

        let width = maxX - minX + 3;
        let height = maxY - minY + 3;

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
                dungeon.setTile(new Tiles.WallTile(dungeon, x, y), x, y);
            }
        }

        rooms.forEach(function(room) {
            room.generator.fill(prng, dungeon, {
                x1: room.x,
                y1: room.y,
                width: room.width,
                height: room.height
            });
        });

        halls.forEach(function({x1, y1, x2, y2}) {
            for(var x = x1; x <= x2; x++) {
                for(var y = y1; y <= y2; y++) {
                    try {
                        dungeon.setTile(new Tiles.Tile(dungeon, x, y), x, y);
                    } catch(e) {
                        console.error(minX, minY, maxX, maxY, arguments);
                    }
                }
            }
        });

        return dungeon;
    }
};
