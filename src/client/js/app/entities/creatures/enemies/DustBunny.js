import Creature from '../Creature.js';
import Strategies from '../strategies/Strategies.js';

import Weapon from '../../weapons/Weapon.js';
import DamageTypes from '../../DamageTypes.js';

import DustMite from './DustMite.js';

class DustBunnyAttack extends Weapon {
    getRange() {
        return 1;
    }

    getDamage() {
        return 2;
    }

    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }
}

export default class DustBunny extends Creature {
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getMeleeWeapon() {
        return new DustBunnyAttack();
    }

    getSpeed() {
        return 300;
    }

    getBaseHP() {
        return 2;
    }

    onDeath(dungeon, location) {
        location.getNeighbors8().filter((tile) =>
            !tile.getCreature() && tile.hasFloor() && !tile.isSolid()).slice(-3)
        .forEach((tile)=>dungeon.moveCreature(new DustMite(), tile.getX(), tile.getY()));
    }
}
