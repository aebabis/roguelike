import { default as Buff } from "./Buff.js";
import { default as GameEvents } from "../../../events/GameEvents.js";

export default class PoisonDebuff extends Buff {
    /**
      * @class Creature
      * @description Represents an entity that can act
      */
    constructor(dungeon, damage, period, count, name) {
        super(dungeon);
        this._damage = damage;
        this._period = period;
        this._count = count;
        this._name = name;
    }

    getProperties() {
        return {};
    }

    getDamage() {
        return this._damage;
    }

    getPeriod() {
        return this._period;
    }

    getCount() {
        return this._count;
    }

    getName() {
        return this._name || "Poisoned";
    }

    isNegative() {
        return true;
    }

    getDuration() {
        return this.getPeriod() * this.getCount();
    }

    timestep(dungeon, creature) {
        if(dungeon.getCurrentTimestep() % this.getPeriod() === 0) {
            var damage = creature.receiveDamage(dungeon, -this.getDamage(), true);
            if(damage < 0) {
                dungeon.fireEvent(new GameEvents.CustomEvent(dungeon, `${creature} recieved ${-damage} from ${this.getName()}`));
            }
        }
    }
}
