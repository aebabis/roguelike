import { default as Observable } from "../util/Observable.js";

import { default as Dungeon } from "../dungeons/Dungeon.js";

export default class GraphicalViewSharedData extends Observable {
    constructor(dungeon) {
        super();
        if(dungeon) {
            this.setDungeon(dungeon);
        }
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
}
