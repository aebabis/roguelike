import Buff from "./Buff.js";

export default class SnareDebuff extends Buff {
    getProperties() {
        return {
            preventsMovement: true
        }
    }

    isNegative() {
        return true;
    }

    getDuration() {
        return 1000;
    }

    timestep(dungeon, creature) {
        // Do nothing
    }
}
