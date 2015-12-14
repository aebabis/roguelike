import { default as Dungeon } from "../dungeons/Dungeon.js";

var idGen = 1;

export default class Entity {
    /**
      * @class Entity
      * @description Base class for entities that can occupy tiles
      */
    constructor(dungeon) {
        if(!(dungeon instanceof Dungeon)) {
            throw new Error('Must pass a dungeon as the first parameter');
        }
        this._id = idGen++;
        this._dungeon = dungeon;
        this._currentHP = this.getBaseHP();
    }

    getId() {
        return this._id;
    }

    getDungeon() {
        return this._dungeon;
    }

    getBaseHP() {
        return 0;
    }

    getCurrentHP() {
        return this._currentHP;
    }

    modifyHP(amount) {
        if(isNaN(amount)) {
            throw new Error('amount must be a number');
        }
        this._currentHP += amount;
        if(this._currentHP <= 0) {
            this.die();
        }
    }

    die() {
        this._isDead = true;
        this._dungeon.removeCreature(this);
        this._dungeon.fireEvent({
            getText: ()=>(this.toString() + " died")
        });
    }

    isDead() {
        return !!this._isDead;
    }
}
