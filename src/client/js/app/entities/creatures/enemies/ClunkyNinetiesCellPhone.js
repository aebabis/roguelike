import Creature from '../Creature';
import Inventory from '../Inventory';
import Weapon from '../../weapons/Weapon';
import UseItemMove from '../moves/UseItemMove';
import Strategy from '../strategies/Strategy';
import Strategies from '../strategies/Strategies';

import DamageTypes from '../../DamageTypes';

class CellPhoneZap extends Weapon {
    charge(dungeon) {
        this._chargeTimestamp = dungeon.getCurrentTimestep();
    }

    isCharged(dungeon) {
        return (dungeon.getCurrentTimestep() - this._chargeTimestamp) < 500;
    }

    use(dungeon) {
        this.charge(dungeon);
    }

    getUseMessage(dungeon, creature) {
        return creature.getName() +  ' is charging its lazer';
    }

    isUseable(dungeon) {
        return this.isCharged(dungeon);
    }

    getRange() {
        return 10;
    }

    getDamage() {
        return 7;
    }

    isTargetted() {
        return false;
    }

    getDamageType() {
        return DamageTypes.ELECTRICAL;
    }
}

class ChargeWhenReadyStrategy extends Strategy {
    getNextMove(dungeon, creature) {
        const tile = dungeon.getTile(creature);
        const target = creature.getVisibleEnemies(dungeon).find(function(creature) {
            return tile.getDirectDistance(dungeon.getTile(creature)) > 1;
        });
        const weapon = creature.getRangedWeapon();
        if(target && weapon && !weapon.isCharged(dungeon)) {
            return new UseItemMove(dungeon.getTile(creature), Inventory.RANGED_SLOT);
        } else {
            return null;
        }
    }
}

export default class ClunkyNinetiesCellPhone extends Creature {
    /**
      * @class ClunkyNinetiesCellPhone
      * @description Ranged enemy with attack that needs to charge
      */
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new ChargeWhenReadyStrategy(),
            new Strategies.ChaseStrategy(),
            new Strategies.IdleStrategy()
        ));
        this.setRangedWeapon(new CellPhoneZap());
    }

    getBaseHP() {
        return 1;
    }

    getBaseSpeed() {
        return 425;
    }
}
