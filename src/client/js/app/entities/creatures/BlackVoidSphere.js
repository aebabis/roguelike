import { default as Creature } from "./Creature.js";
import { default as PlayableCharacter } from "./PlayableCharacter.js";
import { default as Strategies } from "./strategies/Strategies.js";

import { default as Weapon } from "../weapons/Weapon.js";

class VoidSphereAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 3;
    }
}

export default class BlackVoidSphere extends Creature {
    /**
     * @class BlackVoidSphere
     * @description Basic melee enemy. Chases the player
     */
    constructor(dungeon) {
        super(dungeon);
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getMeleeWeapon() {
        return new VoidSphereAttack(this.getDungeon());
    }

    getRangedWeapon() {
        return null;
    }

    getSpeed() {
        return 600;
    }

    getBaseHP() {
        return 5;
    }
}
