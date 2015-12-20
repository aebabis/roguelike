import { default as Creature } from "../entities/creatures/Creature.js";
import { default as GameEvent } from "./GameEvent.js";

export default class AttackEvent extends GameEvent {
    /**
      * @class AttackEvent
      * @description Fired whenever a creature attacks
      */
    constructor(dungeon, attacker, target, weapon) {
        super(dungeon);
        if(!(attacker instanceof Creature)) {
            throw new Error('First parameter must be a creature');
        } else if(!(target instanceof Creature)) {
            throw new Error('Second parameter must be a creature');
        }

        this._attacker = attacker;
        this._target = target;
    }

    getAttacker() {
        return this._attacker;
    }

    getTarget() {
        return this._target;
    }

    getText() {
        return this.getAttacker().toString() + ' attacked ' + this.getTarget().toString();
    }
}
