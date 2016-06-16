import Observable from "../util/Observable.js";

import Dungeon from "../dungeons/Dungeon.js";

export default class GraphicalViewSharedData extends Observable {
    constructor(dungeon) {
        super();
        if(dungeon) {
            this.setDungeon(dungeon);
        }
        this._targettedIndex = null;
    }

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
        dungeon.addObserver(this._dungeonObserver = ()=>this._notifyObservers());
        this._dungeon = dungeon;
        this._notifyObservers();
    }

    getDungeon() {
        return this._dungeon;
    }

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

    getInspectedTile() {
        return this._inspectedTile;
    }

    unsetTargettedAbility() {
        this._targettedIndex = null;
        this._notifyObservers();
    }

    setTargettedAbility(index) {
        if(!Number.isInteger(+index)) {
            throw new Error('index must be an integer');
        }
        this._targettedIndex = +index;
        this._notifyObservers();
    }

    getTargettedAbility() {
        return this._targettedIndex;
    }
}
