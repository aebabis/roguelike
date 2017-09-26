import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import Weapon from '../../weapons/Weapon';
import DamageTypes from '../../DamageTypes';

class VoidSphereAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 3;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
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

    getBaseSpeed() {
        return 600;
    }

    getBaseHP() {
        return 5;
    }
}
