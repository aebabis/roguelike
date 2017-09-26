import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import Weapon from '../../weapons/Weapon';

import PoisonDebuff from '../buffs/PoisonDebuff';
import DamageTypes from '../../DamageTypes';

class FlyingSerpentAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 2;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }

    onHit(dungeon, attacker, defender) {
        defender.applyBuff(dungeon, new PoisonDebuff(dungeon, 2, 500, 3, 'serpent venom'));
    }
}

export default class FlyingSerpent extends Creature {
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getBaseHP() {
        return 3;
    }

    getMeleeWeapon() {
        return new FlyingSerpentAttack();
    }

    getRangedWeapon() {
        return null;
    }

    getArmor() {
        return null;
    }

    getBaseSpeed() {
        return 250;
    }

    isFlying() {
        return true;
    }
}
