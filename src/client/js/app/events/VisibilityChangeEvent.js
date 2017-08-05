import GameEvent from './GameEvent.js';

import Creature from '../entities/creatures/Creature.js';

export default class VisibilityChangeEvent extends GameEvent {
    /**
      * @class VisibilityChangeEvent
      */
    constructor(dungeon, creature, previouslySeenTiles, currentlySeenTiles) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        }
        this._creature = creature;
        this._newlyHiddenTileCoords = previouslySeenTiles.filter(
            tile => !currentlySeenTiles.includes(tile)
        ).map(tile => ({x: tile.getX(), y: tile.getY()}));
        this._newlyVisibleTileCoords = currentlySeenTiles.filter(
            tile => !previouslySeenTiles.includes(tile)
        ).map(tile => ({x: tile.getX(), y: tile.getY()}));
    }

    /**
     * @function getCreature()
     * @memberof HitpointsEvent
     * @return {Creature}
     */
    getCreature() {
        return this._creature;
    }

    /**
     * Gets the list of tiles that just became hidden to the creature
     * @return {Array<{x, y}>}
     */
    getNewlyHiddenTileCoords() {
        return this._newlyHiddenTileCoords;
    }

    /**
     * Gets the list of tiles that just became visible to the creature
     * @return {Array<{x, y}>}
     */
    getNewlyVisibleTileCoords() {
        return this._newlyVisibleTileCoords;
    }

    /**
     * @function getText()
     * @memberof HitpointsEvent
     * @description A text description of the event
     * @return {String}
     */
    getText() {
        return 'Creature\'s visible tiles changed';
    }
}
