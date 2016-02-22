import { default as Observable } from "../util/Observable.js";
import { default as Tile } from "../tiles/Tile.js";
import { default as Creature } from "../entities/creatures/Creature.js";
import { default as Move } from "../entities/creatures/moves/Move.js";
import { default as GameConditions } from "../conditions/GameConditions.js";

import { default as PlayableCharacter } from "../entities/creatures/PlayableCharacter.js";

import { default as CustomEvent } from "../events/CustomEvent.js";
import { default as HumanToMoveEvent } from "../events/HumanToMoveEvent.js";
import { default as HumanMovingEvent } from "../events/HumanMovingEvent.js";

import { default as WallTile } from "../tiles/WallTile.js";

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
        } else if(!isNaN(param1) && !isNaN(param2)) {
            var col = this._grid[param1];
            return col && col[param2];
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

    setCreature(creature, x, y) {
        if(creature instanceof Creature) {
            var tile = this._grid[x][y];
            tile.setCreature(creature);
            this._creatureMap.set(creature, tile);
            if(creature instanceof PlayableCharacter) {
                this._player = creature;
                creature._updateVisionMap(); // TODO: Figure out a way for player to know to update itself
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
        var activeCreature = this.getActiveCreature();
        if(activeCreature instanceof PlayableCharacter) {
            return activeCreature.hasMoveQueued();
        } else {
            return true;
        }
    }

    resolveUntilBlocked() {
        while(this.canAdvance()) {
            this.resolveNextStep();
        }
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
        if(this.hasEnded()) {
            throw new Error('Dungeon has ended. No more steps allowed');
        }

        var activeCreature = this.getActiveCreature();

        if(activeCreature) {
            if(activeCreature instanceof PlayableCharacter) {
                this.fireEvent(new HumanToMoveEvent(this, activeCreature));
            }
            var move = activeCreature.getNextMove(this)
            if(!(move instanceof Move)) {
                throw new Error("Expected move from " + activeCreature + ", got " + move);
            }
            if(activeCreature instanceof PlayableCharacter) {
                this.fireEvent(new HumanMovingEvent(this, activeCreature));
            }

            try {
                activeCreature.executeMove(this, move);
            } catch(error) {
                console.error(error);
                activeCreature.executeMove(this, new Move.WaitMove());
                //activeCreature.wait();
            }
        } else {
            this._timestep++;
            this.getCreatures().forEach(function(creature) {
                creature.timestep();
            });
        }

        var conditions = this._gameConditions;
        if(conditions) {
            if(conditions.hasPlayerWon(this)) {
                this.fireEvent(new CustomEvent(this, "Victory"));
            } else if(conditions.hasPlayerLost(this)) {
                this.fireEvent(new CustomEvent(this, "Defeat"));

            }
        }
    }
}
