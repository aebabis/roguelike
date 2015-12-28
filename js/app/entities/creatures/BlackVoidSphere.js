import { default as Creature } from "./Creature.js";
import { default as PlayableCharacter } from "./PlayableCharacter.js";
import { default as ChaseStrategy } from "./strategies/ChaseStrategy.js";

export default class BlackVoidSphere extends Creature {
    /**
     * @class BlackVoidSphere
     * @description Basic melee enemy. Chases the player
     */
    constructor(dungeon) {
        super(dungeon);
        this._strategy = new ChaseStrategy(this);
    }

    getNextMove() {
        return this._strategy.getNextMove();
    }

    getSpeed() {
        return 600;
    }

    getBaseHP() {
        return 5;
    }
}
