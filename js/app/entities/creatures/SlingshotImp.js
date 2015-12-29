import { default as Creature } from "./Creature.js";
import { default as PlayableCharacter } from "./PlayableCharacter.js";
import { default as ChaseStrategy } from "./strategies/ChaseStrategy.js";

import { default as Weapon } from "../weapons/Weapon.js";

class ImpSlingshot extends Weapon {
    getRange() {
        return 5;
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
    constructor(dungeon) {
        super(dungeon);
        this.setStrategy(new ChaseStrategy(this));
    }

    getMeleeWeapon() {
        return null;
    }

    getRangedWeapon() {
        return new ImpSlingshot(this.getDungeon());
    }

    getBaseHP() {
        return 3;
    }

    getSpeed() {
        return 550;
    }
}
