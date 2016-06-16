import Creature from "./Creature.js";
import PlayableCharacter from "./PlayableCharacter.js";
import Strategies from "./strategies/Strategies.js";

import Weapon from "../weapons/Weapon.js";

class ImpSlingshot extends Weapon {
    getRange() {
        return 3;
    }

    getDamage() {
        return 2;
    }
}

export default class SlingshotImp extends Creature {
    /**
      * @class SlingshotImp
      * @description Basic ranged enemy. Stands in place an shoots enemies
      */
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.FleeStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getMeleeWeapon() {
        return null;
    }

    getRangedWeapon() {
        return new ImpSlingshot();
    }

    getBaseHP() {
        return 3;
    }

    getSpeed() {
        return 550;
    }
}
