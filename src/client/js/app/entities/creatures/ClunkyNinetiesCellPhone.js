import Creature from "./Creature.js";
import Inventory from "./Inventory.js";
import PlayableCharacter from "./PlayableCharacter.js";

import CustomEvent from "../../events/CustomEvent.js";

import Weapon from "../weapons/Weapon.js";

import AttackMove from "./moves/AttackMove.js";
import UseItemMove from "./moves/UseItemMove.js";
import WaitMove from "./moves/WaitMove.js";

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

    getUseMessage(creature) {
        return creature +  " is charging its lazer";
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

    isMagical() {
        return true;
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
                return new AttackMove(dungeon.getTile(target));
            } else {
                return new UseItemMove(Inventory.RANGED_SLOT);
            }
        } else {
            return new WaitMove();
        }
    }

    getBaseHP() {
        return 1;
    }

    getSpeed() {
        return 400;
    }
}
