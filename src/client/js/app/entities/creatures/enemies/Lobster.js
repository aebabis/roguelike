import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import Weapon from '../../weapons/Weapon';
import CookedLobster from '../../consumables/CookedLobster';
import DamageTypes from '../../DamageTypes';

class LobsterClaw extends Weapon {
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

export default class Lobster extends Creature {
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getMeleeWeapon() {
        return new LobsterClaw();
    }

    getSpeed() {
        return 600;
    }

    getBaseHP() {
        return 1;
    }

    receiveDamage(dungeon, cause, amount, type) {
        const tile = dungeon.getTile(this);
        super.receiveDamage(dungeon, cause, amount, type);
        if(type === DamageTypes.FIRE && this.getCurrentHP() <= 0) {
            dungeon.moveItem(new CookedLobster(), tile.getX(), tile.getY());
        }
    }
}
