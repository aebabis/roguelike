import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import Armor from '../../armor/Armor';
import Weapon from '../../weapons/Weapon';
import DamageTypes from '../../DamageTypes';

class SkeletonArmor extends Armor {
    getReduction(type) {
        return (type === DamageTypes.MELEE_PHYSICAL || type === DamageTypes.RANGED_PHYSICAL) ? 1 : 0;
    }
}

class SkeletonPunch extends Weapon {
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

export default class Skeleton extends Creature {
    /**
     * @class Skeleton
     * @description Medium-speed melee chaser
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
        return super.getMeleeWeapon() || new SkeletonPunch();
    }

    getRangedWeapon() {
        return null;
    }

    getArmor() {
        return new SkeletonArmor();
    }

    getBaseSpeed() {
        return 600;
    }

    getBaseHP() {
        return 4;
    }
}
