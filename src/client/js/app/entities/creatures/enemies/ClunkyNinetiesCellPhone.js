import Creature from '../Creature.js';
import Inventory from '../Inventory.js';
import Weapon from '../../weapons/Weapon.js';
import AttackMove from '../moves/AttackMove.js';
import UseItemMove from '../moves/UseItemMove.js';
import WaitMove from '../moves/WaitMove.js';

import DamageTypes from '../../DamageTypes.js';

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

export default class ClunkyNinetiesCellPhone extends Creature {
    /**
      * @class ClunkyNinetiesCellPhone
      * @description Ranged enemy with attack that needs to charge
      */
    constructor() {
        super();
        this.setRangedWeapon(new CellPhoneZap());
    }

    getNextMove(dungeon) {
        var tile = dungeon.getTile(this);
        var target = this.getVisibleEnemies(dungeon).find(function(creature) {
            return tile.getDirectDistance(dungeon.getTile(creature)) > 1;
        });
        if(target) {
            var weapon = this.getRangedWeapon();
            if(weapon.isCharged(dungeon)) {
                return new AttackMove(dungeon.getTile(this), dungeon.getTile(target));
            } else {
                return new UseItemMove(dungeon.getTile(this), Inventory.RANGED_SLOT);
            }
        } else {
            return new WaitMove(dungeon.getTile(this));
        }
    }

    getBaseHP() {
        return 1;
    }

    getBaseSpeed() {
        return 425;
    }
}
