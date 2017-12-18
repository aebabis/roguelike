import Strategy from './Strategy';
import Creature from '../Creature';
import Dungeon from '../../../dungeons/Dungeon';

import Pather from './Pather';

/**
 * @class FollowAllyStrategy
 * @description Strategy for tailing an ally at a specified distance
 */
export default class FollowAllyStrategy extends Strategy {
    constructor(followingDistance = 1) {
        super();
        this._followingDistance = followingDistance;
    }

    getFollowingDistance() {
        return this._followingDistance;
    }

    getNextMove(dungeon, creature) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error('First parameter must be a Dungeon');
        } else if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        const tile = dungeon.getTile(creature);
        // TODO: Consider making a comparator import. TileUtils?
        const allies = creature.getVisibleAllies(dungeon).sort((ally1, ally2) => {
            const d1 = tile.getDirectDistance(dungeon.getTile(ally1));
            const d2 = tile.getDirectDistance(dungeon.getTile(ally2));
            if(d1 < d2) {
                return 1;
            } else if(d1 > d2) {
                return -1;
            } else {
                return 0;
            }
        });

        const ally = allies[0];
        if(!ally) {
            return null;
        }

        const allyTile = dungeon.getTile(ally);
        const followingDistance = this.getFollowingDistance();
        const currentDistance = allyTile.getDirectDistance(tile);

        let move;

        if(currentDistance < followingDistance) {
            const neighbors = tile.getNeighbors8(dungeon).filter(tile => creature.canOccupyNow(tile));
            const neighbor = neighbors.sort((tile1, tile2) => {
                const d1 = allyTile.getDirectDistance(tile1);
                const d2 = allyTile.getDirectDistance(tile2);
                if(d1 < d2) {
                    return 1;
                } else if(d1 > d2) {
                    return -1;
                } else {
                    return 0;
                }
            })[0];
            if(neighbor) {
                move = Pather.getMoveToward(dungeon, creature, neighbor);
            }
        } else if(currentDistance > followingDistance) {
            move = Pather.getMoveToward(dungeon, creature, allyTile);
        }

        if(move && !move.getReasonIllegal(dungeon, creature)) {
            return move;
        } else {
            return null;
        }
    }
}
