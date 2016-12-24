import Observable from '../util/Observable.js';
import Tile from '../tiles/Tile.js';
import Creature from '../entities/creatures/Creature.js';
import Move from '../entities/creatures/moves/Move.js';
import Moves from '../entities/creatures/moves/Moves.js';
import GameConditions from '../conditions/GameConditions.js';

import PlayableCharacter from '../entities/creatures/PlayableCharacter.js';

import GameEvents from '../events/GameEvents.js';
import HumanToMoveEvent from '../events/HumanToMoveEvent.js';
import HumanMovingEvent from '../events/HumanMovingEvent.js';

import DebugConsole from '../util/DebugConsole.js';

/**
 * An explorable dungeon in the game. Contains a grid of tiles
 * and the high-level logic for advancing the game state. Optionally
 * contains a set of victory and defeat conditions
 */
export default class Dungeon extends Observable {
    /**
     * Initializes an empty dungeon with the specified width
     * @param {number} width - The number of columns in the dungeon
     * @param {number} height - The number of rows in the dungeon
     */
    constructor(width, height) {
        super(width, height);
        if(isNaN(width) || isNaN(height)) {
            throw new Error('`width` and `height` must be numbers');
        }

        this._width = +width;
        this._height = +height;
        const grid = this._grid = [];
        this._creatureMap = new WeakMap(); // TODO: Will this cause problems?
        for(let x = 0; x < width; x++) {
            let col = grid[x] = [];
            for(let y = 0; y < height; y++) {
                col[y] = new Tile(this, x, y);
            }
        }
        this._timestep = 0;
    }

    /**
     * @return {number} - The number of columns in the dungeon
     */
    getWidth() {
        return this._width;
    }

    /**
     * @return {number} - The number of rows in the dungeon
     */
    getHeight() {
        return this._height;
    }

    /**
     * @return {number} - The number of timesteps that have occurred
     */
    getCurrentTimestep() {
        return this._timestep;
    }

    /**
     * Gets an RNG for use with random effects. All creatures behaving
     * randomly should use this RNG.
     * @return {Random} - An RNG for random effects within the dungeon
     */
    getRng() {
        let rng = this._rng;
        if(!rng) {
            rng = this._rng = Random.engines.mt19937();
            rng.seed(this._seed);
        }
        return rng;
    }

    /**
     * Changes the tile at the specified position
     * @param {Tile} tile - The new tile
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     */
    setTile(tile, x, y) {
        if(!tile instanceof Tile) {
            throw new Error('First parameter must be a tile');
        } else if(isNaN(x) || isNaN(y)) {
            throw new Error('Must pass an x and y coordinate');
        }
        this._grid[x][y] = tile;
    }

    /**
     * Gets a tile from coordinates or a creature
     * @param {Creature|number} param1
     * @param {number} [param2]
     */
    getTile(param1, param2) {
        if(param1 instanceof Creature) {
            return this._creatureMap.get(param1);
        } else if(Number.isInteger(+param1) && Number.isInteger(+param2)) {
            const col = this._grid[+param1];
            return col && col[+param2];
        } else {
            throw new Error('Must pass a Creature or XY coordinates');
        }
    }

    /**
     * Gets a 1-D array of the tiles in the map, optionally filtered
     * @param {function} filter - An `Array.filter` predicate. The first parameter will be a Tile
     */
    getTiles(filter) {
        return this._grid.reduce(function(prev, col) {
            Array.prototype.push.apply(prev, filter ? col.filter(filter) : col);
            return prev;
        }, []);
    }

    /**
     * Tells whether the dungeon is traversable.
     * @param {function} [isTraversable] - Optional predicate
     * for determining if a tile counts as traversable. Defaults
     * to testing if tile has a floor and isn't solid
     */
    isConnected(isTraversable = (tile) => tile.hasFloor() && !tile.isSolid()) {
        const key = (tile) => `${tile.getX()},${tile.getY()}`;
        const traversableTiles = this.getTiles(isTraversable);
        const unvisitedSet = {};
        const visitedSet = {};
        const traversalList = [];
        traversableTiles.forEach(function(tile) {
            unvisitedSet[key(tile)] = tile;
        });
        let tile = traversableTiles[0];
        traversalList.push(tile);
        delete unvisitedSet[key(tile)];
        while(traversalList.length > 0) {
            tile = traversalList.pop();
            tile.getNeighbors8().forEach(function(tile) {
                const tileKey = key(tile);
                if(unvisitedSet[tileKey] && !visitedSet[tileKey]) {
                    traversalList.push(tile);
                    delete unvisitedSet[tileKey];
                    visitedSet[tileKey] = tile;
                }
            });
        }
        return Object.keys(unvisitedSet).length === 0;
    }

    /**
     * Performs an operation with each tile in the map
     * @param {function} func - A function that will be called for each tile.
     * The first param is the Tile. The second is the x-coordinate; the third, the y-coordinate
     */
    forEachTile(func) {
        const grid = this._grid;
        const width = this.getWidth();
        const height = this.getHeight();
        for(let x = 0; x < width; x++) {
            let col = grid[x];
            for(let y = 0; y < height; y++) {
                func(col[y], x, y);
            }
        }
    }

    /**
     * Positions a creature within the Dungeon. If the creature is already present,
     * it will be removed from it's previous location first
     * @param {Creature} creature - The creature to add or reposition
     * @param {number} x - The x-coordinate
     * @param {number} y - The y-coordinate
     */
    moveCreature(creature, x, y) {
        if(!(creature instanceof Creature)) {
            throw new Error('First parameter must be a creature: ' + creature);
        } else if(!Number.isInteger(x) || !Number.isInteger(y)) {
            throw new Error('Second and third parameters must be integers');
        } else if(this.getTile(x, y).getCreature(x, y)) {
            throw new Error('Destination already occupied');
        }
        const existed = !!this._creatureMap.get(creature);
        if(existed) {
            this.removeCreature(creature);
        }
        const tile = this._grid[x][y];
        tile.setCreature(creature);
        this._creatureMap.set(creature, tile);
        if(creature instanceof PlayableCharacter) {
            this._player = creature;
            creature._updateVisionMap(this); // TODO: Figure out a way for player to know to update itself
        }
        this.fireEvent(new GameEvents.PositionChangeEvent(this, creature, x, y));
        if(!existed) {
            this.fireEvent(new GameEvents.SpawnEvent(this, creature, x, y));
        }
        this._notifyObservers();
    }

    /**
     * @return {Array<Creature>} - The creatures in the dungeon
     */
    getCreatures() {
        const creatures = [];
        this.forEachTile(function(tile){
            const creature = tile.getCreature();
            if(creature) {
                creatures.push(creature);
            }
        });
        return creatures;
    }

    /**
     * @return {PlayableCharacter} - The player's character, or null if none exists.
     */
    getPlayableCharacter() {
        return this._player || null;
    }

    /**
     * Tells if the game has ended through either defeat or victory
     * @return {boolean} - `true` if the player has won or lost; `false` otherwise
     */
    hasEnded() {
        const conditions = this._gameConditions;
        if(conditions) {
            return conditions.hasPlayerWon(this) || conditions.hasPlayerLost(this);
        } else {
            return false;
        }
    }

    /**
     * Removes a creature from the dungeon, either by using
     * a reference to the creature, or coordinates
     * @param {Creature|number} param1
     * @param {number} [param2]
     */
    removeCreature(param1, param2) {
        if(param1 instanceof Creature) {
            this._creatureMap.get(param1).removeCreature();
        } else if(isNaN(param1) || isNaN(param2)) {
            throw new Error('Must pass one Creature or two numbers');
        } else {
            this._grid[param1][param2].removeCreature();
        }
        this._notifyObservers();
    }

    /**
     * Dispatches a {@link GameEvent} to all observers
     * @param {GameEvent} event - An event representing something
     * that happened in the Dungeon
     */
    fireEvent(event) {
        // TODO: Should this be a separate subscriber list?
        this._notifyObservers(event);
    }

    /**
     * Sets the conditions for victory and defeat in the Dungeon
     * @param {GameConditions} conditions
     */
    setGameConditions(conditions) {
        if(!(conditions instanceof GameConditions)) {
            throw new Error('First parameter must be a GameConditions');
        }
        this._gameConditions = conditions;
    }

    /**
     * Tells if the dungeon's state can advance.
     * @return {boolean} - `false` if the game has ended or if the game is blocked
     * waiting for the player's move; `true` otherwise.
     */
    canAdvance() {
        if(this.hasEnded()) {
            return false;
        } else {
            // Game cannot advance past player's turn until
            // a move is queued
            const activeCreature = this.getActiveCreature();
            if(activeCreature instanceof PlayableCharacter) {
                return activeCreature.hasMoveQueued();
            } else {
                return true;
            }
        }
    }

    /**
     * Advances the game state until the player's next move or the
     * game is over. This contains the game loop.
     */
    resolveUntilBlocked() {
        function time() {
            return window.performance ? window.performance.now() : Date.now();
        }

        const start = time();

        while(this.canAdvance()) {
            this.resolveNextStep();
        }
        const activeCreature = this.getActiveCreature();
        if(activeCreature instanceof PlayableCharacter) {
            this.fireEvent(new HumanToMoveEvent(this, activeCreature));
        }

        const delta = time() - start;
        DebugConsole.log(`Timestep: ${delta.toFixed(2)}ms`);
    }

    /**
     * Gets the creature whose turn it is to move. This will
     * be a creature whose speed counter has reached 0. Ties are broken
     * with the creature's base speed.
     * @return {Creature} - The creature that can move next.
     */
    getActiveCreature() {
        const creatures = this.getCreatures();
        return creatures.filter(function(creature) {
            return creature.canActThisTimestep();
        }).sort(function(c1, c2) {
            return c1.getSpeed() < c2.getSpeed();
        })[0];
    }

    /**
     * Advances the dungeon by one timestep. During this time, multiple
     * creatures can move (if their speed counters have reached 0).
     */
    resolveNextStep() {
        const self = this;
        if(this.hasEnded()) {
            throw new Error('Dungeon has ended. No more steps allowed');
        }

        const activeCreature = this.getActiveCreature();

        if(activeCreature) {
            if(activeCreature instanceof PlayableCharacter) {
                this.fireEvent(new HumanToMoveEvent(this, activeCreature));
            }
            const move = activeCreature.getNextMove(this);
            if(!(move instanceof Move)) {
                throw new Error('Expected move from ' + activeCreature + ', got ' + move);
            }
            if(activeCreature instanceof PlayableCharacter) {
                this.fireEvent(new HumanMovingEvent(this, activeCreature));
            }

            try {
                const dungeon = this;
                activeCreature.executeMove(this, move);
                this.getCreatures().forEach(function(creature) {
                    if(activeCreature !== creature && move.isSeenBy(dungeon, creature)) {
                        creature.observeMove(dungeon, activeCreature, move);
                    }
                });
            } catch(error) {
                console.error(error);
                activeCreature.executeMove(this, new Moves.WaitMove(this.getTile(activeCreature)));
                //activeCreature.wait();
            }
        } else {
            this._timestep++;
            this.getCreatures().forEach(function(creature) {
                creature.timestep(self);
            });
        }

        // Check for deaths
        this.getCreatures().forEach(function(creature) {
            if(creature.getCurrentHP() <= 0) {
                creature.die(self);
            } else if(!creature.isFlying() && !self.getTile(creature).hasFloor()) {
                creature.die(self);
            }
        });

        const conditions = this._gameConditions;
        if(conditions) {
            if(conditions.hasPlayerWon(this)) {
                this.fireEvent(new GameEvents.VictoryEvent(this));
            } else if(conditions.hasPlayerLost(this)) {
                this.fireEvent(new GameEvents.DefeatEvent(this));

            }
        }
    }
}
