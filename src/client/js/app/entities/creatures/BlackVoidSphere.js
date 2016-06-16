import Creature from "./Creature.js";
import PlayableCharacter from "./PlayableCharacter.js";
import Strategies from "./strategies/Strategies.js";

import Weapon from "../weapons/Weapon.js";

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
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getMeleeWeapon() {
        return new VoidSphereAttack();
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
