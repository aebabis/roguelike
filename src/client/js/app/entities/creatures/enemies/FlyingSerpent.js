import Creature from '../Creature.js';
import Strategies from '../strategies/Strategies.js';

import Weapon from '../../weapons/Weapon.js';

import PoisonDebuff from '../buffs/PoisonDebuff.js';
import DamageTypes from '../../DamageTypes.js';

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
