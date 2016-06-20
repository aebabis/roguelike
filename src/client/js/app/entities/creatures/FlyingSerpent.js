import Creature from "./Creature.js";
import Strategies from "./strategies/Strategies.js";

import Armor from "../armor/Armor.js";
import Weapon from "../weapons/Weapon.js";

import PoisonDebuff from "./buffs/PoisonDebuff.js";

class FlyingSerpentAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 2;
    }

    onHit(dungeon, attacker, defender) {
        defender.applyBuff(dungeon, new PoisonDebuff(dungeon, 2, 500, 3, "serpent venom"));
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

    getSpeed() {
        return 250;
    }
}