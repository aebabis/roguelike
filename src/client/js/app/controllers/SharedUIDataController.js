import Observable from '../util/Observable.js';

import Dungeon from '../dungeons/Dungeon.js';

import Moves from '../entities/creatures/moves/Moves.js';

import GameEvents from '../events/GameEvents.js';

import Pather from '../entities/creatures/strategies/Pather.js';

let incr = 0;
const NEUTRAL_MODE = incr++;
const ATTACK_MODE = incr++;
const TARGETTED_ABILITY_MODE = incr++;
const TARGETTED_ITEM_MODE = incr++;
const EXAMINE_MODE = incr++;

/**
 * An object for decoupling the Dungeon from views and controllers
 * Holds the current Dungeon and acts as a proxy for the Dungeon's events.
 * Observers are notified whenever the Dungeon fires an event *or* when the
 * Dungeon itself switches.
 * Additionally, this class stores information that needs to be shared between
 * multiple views and controllers, such as the currently hovered tile
 */
export default class SharedUIDataController extends Observable {
    static get NEUTRAL_MODE() { return NEUTRAL_MODE }
    static get ATTACK_MODE() { return ATTACK_MODE }
    static get TARGETTED_ABILITY_MODE() { return TARGETTED_ABILITY_MODE }
    static get TARGETTED_ITEM_MODE() { return TARGETTED_ITEM_MODE }
    static get EXAMINE_MODE() { return EXAMINE_MODE }

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

        this.addObserver((event) => {
            // Whenever the player makes a move, cancel
            // any UI flows managed by the shared data
            if(event instanceof GameEvents.HumanMovingEvent) {
                this.unsetAttackMode();
                this.unsetTargettedAbility();
                this.unsetTargettedItem();
            }
        });
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

    pathTo(x, y) {
        var dungeon = this.getDungeon();
        var player = dungeon.getPlayableCharacter();
        var playerLocation = dungeon.getTile(player); // TODO: Ensure that tile isn't empty
        var creature = dungeon.getTile(x, y).getCreature();
        var abilityIndex = this.getTargettedAbility();
        var itemIndex = this.getTargettedItem();
        let moves;
        if(abilityIndex !== null) {
            moves = [new Moves.UseAbilityMove(playerLocation, abilityIndex, x, y)];
        } else if(itemIndex !== null) {
            moves = [new Moves.UseItemMove(playerLocation, itemIndex, dungeon.getTile(x, y))];
        } else if(creature && creature.isEnemy(player)) {
            moves = [new Moves.AttackMove(playerLocation, x, y)];
        } else {
            var dx = x - playerLocation.getX();
            var dy = y - playerLocation.getY();
            if(dx === 0 && dy === 0) {
                moves = [new Moves.WaitMove(playerLocation)];
            } else if(Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
                moves = [new Moves.MovementMove(playerLocation, dx, dy)];
            } else if(playerLocation.getCreature()) {
                moves = Pather.getMoveSequenceToward(dungeon, player, dungeon.getTile(x, y));
            }
        }
        if(moves.length === 0) {
            this.dispatchUIEvent(new UIMessageEvent('No path to location'));
        } else {
            moves.forEach((move) => {
                // Note, optionalTargetTile (3rd param) only relevant for 1-length move sequences
                var reason = move.getReasonIllegal(dungeon, player, dungeon.getTile(x, y));
                if(reason) {
                    this.dispatchUIEvent(new UIMessageEvent(reason));
                    return false;
                } else {
                    player.setNextMove(move);
                    dungeon.resolveUntilBlocked();
                    this.unsetAttackMode();
                    this.unsetTargettedAbility();
                    this.unsetTargettedItem();
                }
            });
        }
    }

    /**
     * Stores the coordinates of a tile that the user has selected. Useful
     * for changing views based on which tile the user is examining/hovering/ect
     * @param {number} x - The x-coordinate of the tile
     * @param {number} y - The y-coordinate of the tile
     */
    setHoverTile(x, y) {
        if(isNaN(x) || isNaN(y)) {
            throw new Error('x and y must be numbers');
        }
        this._inspectedTile = Object.freeze({
            x: +x,
            y: +y
        });
        this._notifyObservers();
    }

    unsetHoverTile() {
        this._inspectedTile = null;
        this._notifyObservers();
    }

    /**
     * Gets the tile set by {@link setInspectedTile}
     * @return {Tile}
     */
    getHoverTile() {
        const coords = this._inspectedTile;
        if(coords) {
            const {x, y} = coords;
            return this.getDungeon().getTile(x, y);
        } else {
            return null;
        }
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

        const dungeon = this.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const playerTile = dungeon.getTile(player);
        const ability = player.getAbility(index);

        if(!ability.isTargetted()) {
            throw new Error('Ability must be targetted');
        }

        const potentialTargets = ability.isTargetCreature() ?
            player.getVisibleEnemies(dungeon).map((enemy) => dungeon.getTile(enemy)) :
            dungeon.getTiles((tile) => player.canSee(dungeon, tile));

        this._abilityTargets = potentialTargets.filter((tile) => {
            const move = new Moves.UseAbilityMove(playerTile, +index, tile.getX(), tile.getY());
            return !move.getReasonIllegal(dungeon, player, tile);
        });

        if(this._abilityTargets.length === 0) {
            this._targettedAbilityIndex = null;
            this._abilityTargets = null;
        }

        this.unsetTargettedItem();
        this.unsetAttackMode();
        this.unsetExamineMode();
        this._notifyObservers();
    }

    /**
     * Forgets which targetted ability the user was considering using
     */
    unsetTargettedAbility() {
        this._targettedAbilityIndex = null;
        this._abilityTargets = null;
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
     * Gets the currently focused legal ability target
     * for the currently selected targetted ability, if any
     * @return {Tile} - A tile that is a legal target for the targetted
     * ability, or null if no ability is selected
     */
    getAbilityTarget() {
        return this._abilityTargets && this._abilityTargets[0];
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

        const dungeon = this.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const playerTile = dungeon.getTile(player);
        const item = player.getInventory().getItem(index);

        if(!item.isTargetted()) {
            throw new Error('Item must be targetted');
        }

        const potentialTargets = item.isTargetCreature() ?
            player.getVisibleEnemies(dungeon).map((enemy) => dungeon.getTile(enemy)) :
            dungeon.getTiles((tile) => player.canSee(dungeon, tile));

        this._itemTargets = potentialTargets.filter((tile) => {
            const move = new Moves.UseItemMove(playerTile, +index, tile);
            return !move.getReasonIllegal(dungeon, player);
        });

        if(this._itemTargets.length === 0) {
            this._itemTargets = null;
        }

        this.unsetTargettedAbility();
        this.unsetAttackMode();
        this.unsetExamineMode();
        this._notifyObservers();
    }

    /**
     * Forgets which targetted item the user was considering using
     */
    unsetTargettedItem() {
        this._targettedItemIndex = null;
        this._itemTargets = null;
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

    /**
     * Gets the currently focused legal item target
     * for the currently selected targetted item, if any
     * @return {Tile} - A tile that is a legal target for the targetted
     * item, or null if no item is selected
     */
    getItemTarget() {
        return this._itemTargets && this._itemTargets[0];
    }

    /**
     * Puts this controller in attack mode so that keyboard users
     * can select a target for an attack
     */
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
        this.unsetTargettedAbility();
        this.unsetTargettedItem();
        this.unsetExamineMode();
        this._notifyObservers();
    }

    /**
     * Returns this controller to the default mode (movement mode)
     */
    unsetAttackMode() {
        this._attackTargets = null;
        this._notifyObservers();
    }

    /**
     * Gets the currently focused legal attack target
     * for the currently selected weapon, if any
     * @return {Tile} - A tile that is a legal target for the targetted
     * weapon, or null if no weapon is selected
     */
    getAttackTarget() {
        return this._attackTargets && this._attackTargets[0];
    }

    /**
     * Puts this controller in attack mode so that keyboard users
     * can select a target for an attack
     */
    setExamineMode() {
        const dungeon = this.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const playerTile = dungeon.getTile(player);
        this._examineTarget = playerTile;
        this.unsetAttackMode();
        this.unsetTargettedAbility();
        this.unsetTargettedItem();
        this._notifyObservers();
    }

    /**
     * Returns this controller to the default mode (movement mode)
     */
    unsetExamineMode() {
        this._examineTarget = null;
        this._notifyObservers();
    }

    /**
     * Gets the currently focused legal attack target
     * for the currently selected weapon, if any
     * @return {Tile} - A tile that is a legal target for the targetted
     * weapon, or null if no weapon is selected
     */
    getExamineTarget() {
        return this._examineTarget;
    }

    getFocusTile() {
        switch(this.getMode()) {
            case SharedUIDataController.ATTACK_MODE:
                return this.getAttackTarget();
            case SharedUIDataController.TARGETTED_ABILITY_MODE:
                return this.getAbilityTarget();
            case SharedUIDataController.TARGETTED_ITEM_MODE:
                return this.getItemTarget();
            case SharedUIDataController.EXAMINE_MODE:
                return this.getExamineTarget();
            case SharedUIDataController.NEUTRAL_MODE:
                return null;
            default:
                throw new Error('This should never happen');
        }
    }

    /**
     * Cycles focus to the next ability target, attack target, item target, or tile depending
     * on what mode the controller is in
     */
    cycleTarget(dx, dy) {
        const self = this;
        let arrayName, array;
        ['_abilityTargets', '_attackTargets', '_itemTargets'].forEach(function(name) {
            if(self[name]) {
                arrayName = name;
                array = self[name];
            }
        });
        if(typeof dx !== 'undefined') {
            const currentTarget = array[0];
            const newTarget = array.filter(function(tile) {
                return Math.sign(tile.getX() - currentTarget.getX()) === dx &&
                    Math.sign(tile.getY() - currentTarget.getY()) === dy;
            }).sort(function(tileA, tileB) {
                return currentTarget.getEuclideanDistance(tileA) - currentTarget.getEuclideanDistance(tileB);
            })[0];
            if(newTarget) {
                const index = array.indexOf(newTarget);
                this[arrayName] = array.slice(index).concat(array.slice(0, index));
            }
        } else {
            array.push(array.shift());
        }
        this._notifyObservers();
    }

    getMode() {
        if(this.getAttackTarget()) {
            return ATTACK_MODE;
        } else if(typeof this.getTargettedAbility() === 'number') {
            return TARGETTED_ABILITY_MODE;
        } else if(typeof this.getTargettedItem() === 'number') {
            return TARGETTED_ITEM_MODE;
        } else if(this.getExamineTarget()) {
            return EXAMINE_MODE;
        } else {
            return NEUTRAL_MODE;
        }
    }

    /**
     * Dispatches an event to observers
     */
    dispatchUIEvent(event) {
        this._notifyObservers(event);
    }
}
