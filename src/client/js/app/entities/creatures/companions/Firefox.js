import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import Armor from '../../armor/Armor';
import Weapon from '../../weapons/Weapon';
import DamageTypes from '../../DamageTypes';
import DashAttack from '../../../abilities/DashAttack';

class FirefoxAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 3;
    }

    getDamageType() {
        return DamageTypes.FIRE;
    }
}

class FirefoxArmor extends Armor {
    getReduction(type) {
        if(type === DamageTypes.FIRE) {
            return Infinity;
        } else if(type === DamageTypes.MELEE_PHYSICAL) {
            return 1;
        } else {
            return 0;
        }
    }
}

export default class Firefox extends Creature {
    constructor() {
        super();
        this.addAbility(new DashAttack());
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.OffensiveTargettedAbilityStrategy(DashAttack),
            new Strategies.ChaseStrategy(),
            new Strategies.FollowAllyStrategy(2),
            new Strategies.IdleStrategy()
        ));
    }

    getMeleeWeapon() {
        return new FirefoxAttack();
    }

    getArmor() {
        return new FirefoxArmor();
    }

    getBaseSpeed() {
        return 400;
    }

    getBaseHP() {
        return 4;
    }

    getBaseMana() {
        return 6;
    }

    getFaction() {
        return 'Player';
    }
}
