import { default as AStar } from "../../../../../bower_components/es6-a-star/es6-a-star.js";

import { default as Move } from "../moves/Move.js";

export default {
    getMoveToward: function(dungeon, start, target) {
        var creature = start.getCreature();
        var x = start.getX();
        var y = start.getY();

        if(start === target) {
            console.warn("Creature trying to move to path to its own location", this);
        }

        console.time("Pathfinding");
        var pathfinding = AStar({
            start: start,
            isEnd: (node)=>node===target,
            neighbor: (node)=>node.getNeighbors8().filter(
                (neighbor)=>(creature.canOccupy(neighbor) && (neighbor===target || neighbor.getCreature() == null))),
            distance: (a,b)=>a.getDirectDistance(b),
            heuristic: (a)=>a.getEuclideanDistance(target)
        });
        console.timeEnd("Pathfinding");

        if(pathfinding.status === 'success') {
            var nextTile = pathfinding.path[1];
            if(nextTile) {
                return new Move.MovementMove(Math.sign(nextTile.getX() - x), Math.sign(nextTile.getY() - y));
            } else {
                return new Move.WaitMove();
            }
        } else {
            return null;
        }
    }
};
