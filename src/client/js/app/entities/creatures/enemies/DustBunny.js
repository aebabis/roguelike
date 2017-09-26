import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import Weapon from '../../weapons/Weapon';
import DamageTypes from '../../DamageTypes';

import DustMite from './DustMite';

/**
 * Basic melee attack for a dust bunny
 */
class DustBunnyAttack extends Weapon {
    /** @override */
    getRange() {
        return 1;
    }

    /** @override */
    getDamage() {
        return 2;
    }

    /** @override */
    getDamageType() {
        return DamageTypes.MELEE_PHYSICAL;
    }
}

/**
 * A fast moving, weak melee enemy that spawns
 * smaller enemies on death
 */
export default class DustBunny extends Creature {
    /** @override */
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    /** @override */
    getMeleeWeapon() {
        return new DustBunnyAttack();
    }

    /** @override */
    getBaseSpeed() {
        return 300;
    }

    /** @override */
    getBaseHP() {
        return 2;
    }

    /**
     * Creates up to 3 dust mites on adjacent empty tiles
     * @override
     * @param {*} dungeon 
     * @param {*} location 
     */
    onDeath(dungeon, location) {
        location.getNeighbors8(dungeon).filter((tile) =>
            !tile.getCreature() && tile.hasFloor() && !tile.isSolid()).slice(-3)
            .forEach((tile)=>dungeon.moveCreature(new DustMite(), tile.getX(), tile.getY()));
    }
}
