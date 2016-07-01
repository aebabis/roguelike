import Creature from '../entities/creatures/Creature.js';
import GameEvent from './GameEvent.js';

export default class AttackEvent extends GameEvent {
    /**
      * @class AttackEvent
      * @description Fired whenever a creature attacks
      */
    constructor(dungeon, attacker, target, weapon) {
        super(dungeon);
        if(!(attacker instanceof Creature)) {
            throw new Error('Second parameter must be a creature');
        } else if(!(target instanceof Creature)) {
            throw new Error('Third parameter must be a creature');
        }

        this._attacker = attacker;
        this._target = target;
        this._weapon = weapon;
    }

    getAttacker() {
        return this._attacker;
    }

    getTarget() {
        return this._target;
    }

    getWeapon() {
        return this._weapon;
    }

    getText() {
        return this.getAttacker().getName() + ' attacked ' + this.getTarget().getName();
    }
}
