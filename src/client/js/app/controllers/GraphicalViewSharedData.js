import Observable from '../util/Observable.js';

import Dungeon from '../dungeons/Dungeon.js';

import Moves from '../entities/creatures/moves/Moves.js';

/**
 * An object for decoupling the Dungeon from views and controllers
 * Holds the current Dungeon and acts as a proxy for the Dungeon's events.
 * Observers are notified whenever the Dungeon fires an event *or* when the
 * Dungeon itself switches.
 * Additionally, this class stores information that needs to be shared between
 * multiple views and controllers, such as the currently hovered tile
 * @todo Consider renaming this to `UiSharedData` or similar
 */
export default class GraphicalViewSharedData extends Observable {
    /**
     * @param {Dungeon} [dungeon] - The initial dungeon for the views to show
     */
    constructor(dungeon) {
        super();
        if(dungeon) {
            this.setDungeon(dungeon);
        }
        this._targettedAbilityIndex = null;
        this._targettedItemIndex = null;
    }

    /**
     * Changes the contained dungeon. Will notify observers of the change
     * @param {Dungeon} dungeon - The dungeon to replace the current dungeon
     */
    setDungeon(dungeon) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error('Must pass a dungeon');
        }
        // Clean up old observer
        if(typeof this._dungeonObserver === 'function') {
            this._dungeon.removeObserver(this._dungeonObserver);
        }
        // Chain observer so that UI doesn't need to store direct
        // reference to dungeon
        dungeon.addObserver(this._dungeonObserver = (event)=>this._notifyObservers(event));
        this._dungeon = dungeon;
        this._notifyObservers(dungeon);
    }

    /**
     * Gets the currently held {@link Dungeon}
     * @return {Dungeon}
     */
    getDungeon() {
        return this._dungeon;
    }

    /**
     * Stores the coordinates of a tile that the user has selected. Useful
     * for changing views based on which tile the user is examining/hovering/ect
     * @param {number} x - The x-coordinate of the tile
     * @param {number} y - The y-coordinate of the tile
     */
    setInspectedTile(x, y) {
        if(isNaN(x) || isNaN(y)) {
            throw new Error('x and y must be numbers');
        }
        this._inspectedTile = Object.freeze({
            x: +x,
            y: +y
        });
        this._notifyObservers();
    }

    /**
     * Gets the tile set by {@link setInspectedTile}
     * @return {object} - An object with `x` and `y` properties
     */
    getInspectedTile() {
        return this._inspectedTile;
    }

    /**
     * Forgets which targetted ability the user was considering using
     */
    unsetTargettedAbility() {
        this._targettedAbilityIndex = null;
        this._notifyObservers();
    }

    /**
     * Stores a reference to a targetted ability that the user
     * has considered using. This enables views to reference the selected
     * move while the user considers targets.
     * @param {number} index - The position of the chosen ability within
     * the player's ability list
     */
    setTargettedAbility(index) {
        if(!Number.isInteger(+index)) {
            throw new Error('index must be an integer');
        }
        this._targettedAbilityIndex = +index;
        this.unsetTargettedItem();
        this._notifyObservers();
    }

    /**
     * Gets the index of the selected targetted ability, if any
     * @return {number} - The index of the targetted ability the user is
     * considering, or `null` if none has been selected
     */
    getTargettedAbility() {
        return this._targettedAbilityIndex;
    }

    /**
     * Forgets which targetted item the user was considering using
     */
    unsetTargettedItem() {
        this._targettedItemIndex = null;
        this._notifyObservers();
    }

    /**
     * Stores a reference to a targetted item that the user
     * has considered using. This enables views to reference the selected
     * item while the user considers targets.
     * @param {number} index - The position of the chosen item within
     * the player's inventory slots.
     */
    setTargettedItem(index) {
        if(!Number.isInteger(+index)) {
            throw new Error('index must be an integer');
        }
        this._targettedItemIndex = +index;
        this.unsetTargettedAbility();
        this._notifyObservers();
    }

    /**
     * Gets the index of the selected targetted item, if any
     * @return {number} - The index of the targetted item the user is
     * considering, or `null` if none has been selected
     */
    getTargettedItem() {
        return this._targettedItemIndex;
    }

    setAttackMode() {
        const dungeon = this.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const playerTile = dungeon.getTile(player);
        this._attackTargets = player.getVisibleEnemies(dungeon)
            .filter((enemy) => {
                const tile = dungeon.getTile(enemy);
                const move = new Moves.AttackMove(playerTile, tile.getX(), tile.getY());
                return !move.getReasonIllegal(dungeon, player);
            }).map((enemy) => dungeon.getTile(enemy));
        if(this._attackTargets.length === 0) {
            this._attackTargets = null;
        }
    }

    unsetAttackMode() {
        this._attackTargets = null;
    }

    cycleTarget() {
        this._attackTargets.push(this._attackTargets.shift());
    }

    getAttackTarget() {
        return this._attackTargets && this._attackTargets[0];
    }
}
