import { default as Creature } from "./Creature.js";
import { default as PlayableCharacter } from "./PlayableCharacter.js";

import { default as CustomEvent } from "../../events/CustomEvent.js";

import { default as Weapon } from "../weapons/Weapon.js";

class CellPhoneZap extends Weapon {
    charge() {
        this._chargeTimestamp = this.getDungeon().getCurrentTimestep();
    }

    isCharged() {
        return (this.getDungeon().getCurrentTimestep() - this._chargeTimestamp) < 500;
    }

   isUseable() {
       return this.isCharged();
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
    constructor(dungeon) {
        super(dungeon);
        this._zap = new CellPhoneZap(dungeon);
    }

    getRangedWeapon() {
        return this._zap;
    }

    getNextMove() {
        var self = this;
        return function() {
            var dungeon = self.getDungeon();
            var tile = self.getTile();
            var target = self.getVisibleEnemies().find(function(creature) {
                return tile.getDirectDistance(creature.getTile()) > 1;
            });
            if(target) {
                var weapon = self.getRangedWeapon();
                if(weapon.isCharged()) {
                    self.attack(target);
                } else {
                    dungeon.fireEvent(new CustomEvent(dungeon, self + " is charging its lazer"));
                    self.wait(); // TODO: Make useItem Move
                    weapon.charge();
                }
            }
        }
    }

    getBaseHP() {
        return 1;
    }

    getSpeed() {
        return 400;
    }
}
