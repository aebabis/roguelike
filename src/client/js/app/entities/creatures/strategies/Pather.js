import PlayableCharacter from '../PlayableCharacter.js';

var AStar = (function() {
    var StringSet = function() {};
    StringSet.prototype.add = function(key) {this[key] = true;};
    StringSet.prototype.contains = function(key) {return this[key];};

    var dict = function() {};
    dict.prototype.set = function(key, value) {this[key] = value;};
    dict.prototype.get = function(key) {return this[key];};
    dict.prototype['delete'] = function(key) {delete this[key];};

    var Heap = function(comparator) {
        this._comparator = comparator;
        this._list = [];
    };
    Heap.prototype.push = function(value) {
        this._list.unshift(value);
        this._list.sort(this._comparator);
    };
    Heap.prototype.pop = function() {
        return this._list.shift();
    };
    Heap.prototype.size = function() {
        return this._list.length;
    };

    function aStar(params) {
        if(params.start === undefined) {
            throw new Error('No starting node');
        }
        if(typeof params.isEnd !== 'function') {
            throw new Error('No isEnd function provided');
        }
        if(typeof params.neighbor !== 'function') {
            throw new Error('No neighbors function provided');
        }
        if(typeof params.distance !== 'function') {
            throw new Error('No distance function provided');
        }
        if(typeof params.heuristic !== 'function') {
            throw new Error('No heuristic function provided');
        }

        if(params.timeout !== undefined && typeof params.timeout !== 'number') {
            throw new Error('Optional parameter timeout must be a number');
        }
        var hash = params.hash || defaultHash;

        var startNode = {
            data: params.start,
            g: 0,
            h: params.heuristic(params.start)
        };
        var bestNode = startNode;
        startNode.f = startNode.h;
        // leave .parent undefined
        var closedDataSet = new StringSet();
        var openHeap = new Heap(heapComparator);
        var openDataMap = new dict();
        openHeap.push(startNode);
        openDataMap.set(hash(startNode.data), startNode);
        var startTime = new Date();
        while (openHeap.size()) {
            if (new Date() - startTime > params.timeout) {
                return {
                    status: 'timeout',
                    cost: bestNode.g,
                    path: reconstructPath(bestNode)
                };
            }
            var node = openHeap.pop();
            openDataMap.delete(hash(node.data));
            if (params.isEnd(node.data)) {
                // done
                return {
                    status: 'success',
                    cost: node.g,
                    path: reconstructPath(node)
                };
            }
            // not done yet
            closedDataSet.add(hash(node.data));
            var neighbors = params.neighbor(node.data);
            for (var i = 0; i < neighbors.length; i++) {
                var neighborData = neighbors[i];
                if (closedDataSet.contains(hash(neighborData))) {
                    // skip closed neighbors
                    continue;
                }
                var gFromThisNode = node.g + params.distance(node.data, neighborData);
                var neighborNode = openDataMap.get(hash(neighborData));
                var update = false;
                if (neighborNode === undefined) {
                    // add neighbor to the open set
                    neighborNode = {
                        data: neighborData
                    };
                    // other properties will be set later
                    openDataMap.set(hash(neighborData), neighborNode);
                } else {
                    if (neighborNode.g < gFromThisNode) {
                        // skip this one because another route is faster
                        continue;
                    }
                    update = true;
                }
                // found a new or better route.
                // update this neighbor with this node as its new parent
                neighborNode.parent = node;
                neighborNode.g = gFromThisNode;
                neighborNode.h = params.heuristic(neighborData);
                neighborNode.f = gFromThisNode + neighborNode.h;
                if (neighborNode.h < bestNode.h) bestNode = neighborNode;
                if (update) {
                    //openHeap.heapify();
                } else {
                    openHeap.push(neighborNode);
                }
            }
        }
        // all the neighbors of every accessible node have been exhausted
        return {
            status: 'noPath',
            cost: bestNode.g,
            path: reconstructPath(bestNode)
        };
    }

    function reconstructPath(node) {
        if (node.parent !== undefined) {
            var pathSoFar = reconstructPath(node.parent);
            pathSoFar.push(node.data);
            return pathSoFar;
        } else {
            // this is the starting node
            return [node.data];
        }
    }

    function defaultHash(node) {
        return node.toString();
    }

    function heapComparator(a, b) {
        return a.f - b.f;
    }

    return aStar;
}());

import Moves from '../moves/Moves.js';

const Pather = {
    getMoveSequenceToward: function(dungeon, creature, target) {
        const start = dungeon.getTile(creature);

        if(start === target) {
            console.warn('Creature trying to move to path to its own location', this);
        }

        let getNeighbors;
        if(creature instanceof PlayableCharacter) {
            getNeighbors = (node) => node.getNeighbors8(dungeon)
                .filter(neighbor => {
                    if(neighbor === target) {
                        return true;
                    }
                    if(creature.canSee(dungeon, neighbor)) {
                        return creature.canOccupyNow(neighbor);
                    } else if(creature.hasSeen(neighbor)) {
                        return creature.canOccupy(neighbor);
                    } else {
                        return true;
                    }
                });
        } else {
            getNeighbors = (node)=>node.getNeighbors8(dungeon)
                .filter(neighbor => creature.canOccupy(neighbor)) // Monsters implicitly know the dungeon layout
                .filter(neighbor => neighbor === target ||
                    !creature.canSee(dungeon, neighbor) ||
                    creature.canOccupyNow(neighbor));
        }

        var pathfinding = AStar({
            start: start,
            isEnd: (node)=>node===target,
            neighbor: getNeighbors,
            distance: (a,b)=>a.getDirectDistance(b),
            heuristic: (a)=>a.getEuclideanDistance(target)
        });

        if(pathfinding.status === 'success') {
            var prevX = start.getX();
            var prevY = start.getY();
            return pathfinding.path.slice(1).map(function(location) {
                var nextX = location.getX();
                var nextY = location.getY();
                prevX = nextX;
                prevY = nextY;
                return new Moves.MovementMove(dungeon.getTile(prevX, prevY), nextX, nextY);
            });
        } else {
            return null;
        }
    },

    getMoveToward: function(dungeon, creature, target) {
        var path = Pather.getMoveSequenceToward(dungeon, creature, target);
        if(path) {
            return path[0];
        }
    }
};

export default Pather;