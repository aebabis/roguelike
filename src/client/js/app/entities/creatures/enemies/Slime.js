import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import Weapon from '../../weapons/Weapon';
import DamageTypes from '../../DamageTypes';

import SlowDebuff from '../buffs/SlowDebuff';

class SlimeAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 1;
    }

    getDamageType() {
        return DamageTypes.POISON;
    }

    onHit(dungeon, attacker, defender) {
        defender.applyBuff(dungeon, new SlowDebuff(dungeon, 2000, 1, 200));
    }
}

export default class Slime extends Creature {
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getMeleeWeapon() {
        return new SlimeAttack();
    }

    getBaseSpeed() {
        return 425;
    }

    getBaseHP() {
        return 5;
    }
}
