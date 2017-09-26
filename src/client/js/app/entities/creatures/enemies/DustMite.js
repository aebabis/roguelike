import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import Weapon from '../../weapons/Weapon';
import DamageTypes from '../../DamageTypes';

class DustMiteAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 1;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }
}

export default class DustMite extends Creature {
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getMeleeWeapon() {
        return new DustMiteAttack();
    }

    getBaseSpeed() {
        return 300;
    }

    getBaseHP() {
        return 1;
    }
}
