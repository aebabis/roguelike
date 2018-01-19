import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import Weapon from '../../weapons/Weapon';
import DamageTypes from '../../DamageTypes';

class KittenAttack extends Weapon {
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

export default class Kitten extends Creature {
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.FollowAllyStrategy(2),
            new Strategies.IdleStrategy()
        ));
    }

    getMeleeWeapon() {
        return new KittenAttack();
    }

    getBaseSpeed() {
        return 400;
    }

    getBaseHP() {
        return 3;
    }

    getFaction() {
        return 'Player';
    }
}
