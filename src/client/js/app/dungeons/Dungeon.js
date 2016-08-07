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

import DebugConsole from '../DebugConsole.js';

export default class Dungeon extends Observable {
    constructor(width, height) {
        super(width, height);
        if(isNaN(width) || isNaN(height)) {
            throw new Error('`width` and `height` must be numbers');
        }

        this._width = +width;
        this._height = +height;
        let grid = this._grid = [];
        this._creatureMap = new WeakMap(); // TODO: Will this cause problems?
        for(var x = 0; x < width; x++) {
            let col = grid[x] = [];
            for(var y = 0; y < height; y++) {
                col[y] = new Tile(this, x, y);
            }
        }
        this._timestep = 0;
    }

    getRng() {
        var rng = this._rng;
        if(!rng) {
            rng = this._rng = Random.engines.mt19937();
            rng.seed(this._seed);
        }
        return rng;
    }

    setTile(tile, x, y) {
        if(!tile instanceof Tile) {
            throw new Error('First parameter must be a tile');
        } else if(isNaN(x) || isNaN(y)) {
            throw new Error('Must pass an x and y coordinate');
        }
        this._grid[x][y] = tile;
    }

    getTile(param1, param2) {
        if(param1 instanceof Creature) {
            return this._creatureMap.get(param1);
        } else if(Number.isInteger(+param1) && Number.isInteger(+param2)) {
            var col = this._grid[+param1];
            return col && col[+param2];
        } else {
            throw new Error('Must pass a Creature or XY coordinates');
        }
    }

    getTiles(filter) {
        return this._grid.reduce(function(prev, col) {
            Array.prototype.push.apply(prev, filter ? col.filter(filter) : col);
            return prev;
        }, []);
    }

    forEachTile(func) {
        var grid = this._grid;
        var width = this.getWidth();
        var height = this.getHeight();
        for(let x = 0; x < width; x++) {
            let col = grid[x];
            for(let y = 0; y < height; y++) {
                func(col[y], x, y);
            }
        }
    }

    getWidth() {
        return this._width;
    }

    getHeight() {
        return this._height;
    }

    getCurrentTimestep() {
        return this._timestep;
    }

    moveCreature(creature, x, y) {
        if(this.getTile(x, y).getCreature(x, y)) {
            throw new Error('Destination already occupied');
        }
        this.removeCreature(creature);
        this.setCreature(creature, x, y);
        this.fireEvent(new GameEvents.PositionChangeEvent(this, creature, x, y));
    }

    setCreature(creature, x, y) {
        if(creature instanceof Creature) {
            var existed = !!this._creatureMap.get(creature);
            var tile = this._grid[x][y];
            tile.setCreature(creature);
            this._creatureMap.set(creature, tile);
            if(creature instanceof PlayableCharacter) {
                this._player = creature;
                creature._updateVisionMap(this); // TODO: Figure out a way for player to know to update itself
            }
            if(!existed) {
                this.fireEvent(new GameEvents.SpawnEvent(this, creature, x, y));
            }
        } else {
            throw new Error('First parameter must be a creature: ' + creature);
        }
        this._notifyObservers();
    }

    setGameConditions(conditions) {
        if(!(conditions instanceof GameConditions)) {
            throw new Error('First parameter must be a GameConditions');
        }
        this._gameConditions = conditions;
    }

    hasEnded() {
        var conditions = this._gameConditions;
        if(conditions) {
            return conditions.hasPlayerWon(this) || conditions.hasPlayerLost(this);
        } else {
            return false;
        }
    }

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

    getCreatures() {
        var creatures = [];
        this.forEachTile(function(tile){
            var creature = tile.getCreature();
            if(creature) {
                creatures.push(creature);
            }
        });
        return creatures;
    }

    getPlayableCharacter() {
        return this._player;
    }

    fireEvent(event) {
        // TODO: Should this be a separate subscriber list?
        this._notifyObservers(event);
    }

    canAdvance() {
        if(this.hasEnded()) {
            return false;
        } else {
            // Game cannot advance past player's turn until
            // a move is queued
            var activeCreature = this.getActiveCreature();
            if(activeCreature instanceof PlayableCharacter) {
                return activeCreature.hasMoveQueued();
            } else {
                return true;
            }
        }
    }

    resolveUntilBlocked() {
        function time() {
            return window.performance ? window.performance.now() : Date.now();
        }

        var start = time();

        while(this.canAdvance()) {
            this.resolveNextStep();
        }
        var activeCreature = this.getActiveCreature();
        if(activeCreature instanceof PlayableCharacter) {
            this.fireEvent(new HumanToMoveEvent(this, activeCreature));
        }

        var delta = time() - start;
        DebugConsole.log(`Timestep: ${delta.toFixed(2)}ms`);
    }

    getActiveCreature() {
        var creatures = this.getCreatures();
        return creatures.filter(function(creature) {
            return creature.canActThisTimestep();
        }).sort(function(c1, c2) {
            return c1.getSpeed() < c2.getSpeed();
        })[0];
    }

    resolveNextStep() {
        var self = this;
        if(this.hasEnded()) {
            throw new Error('Dungeon has ended. No more steps allowed');
        }

        var activeCreature = this.getActiveCreature();

        if(activeCreature) {
            if(activeCreature instanceof PlayableCharacter) {
                this.fireEvent(new HumanToMoveEvent(this, activeCreature));
            }
            var move = activeCreature.getNextMove(this);
            if(!(move instanceof Move)) {
                throw new Error('Expected move from ' + activeCreature + ', got ' + move);
            }
            if(activeCreature instanceof PlayableCharacter) {
                this.fireEvent(new HumanMovingEvent(this, activeCreature));
            }

            try {
                var dungeon = this;
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

        var conditions = this._gameConditions;
        if(conditions) {
            if(conditions.hasPlayerWon(this)) {
                this.fireEvent(new GameEvents.CustomEvent(this, 'Victory'));
            } else if(conditions.hasPlayerLost(this)) {
                this.fireEvent(new GameEvents.CustomEvent(this, 'Defeat'));

            }
        }
    }
}
