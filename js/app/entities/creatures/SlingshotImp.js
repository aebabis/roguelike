import { default as Creature } from "./Creature.js";
import { default as PlayableCharacter } from "./PlayableCharacter.js";

import { default as Weapon } from "../weapons/Weapon.js";

class ImpSlingshot extends Weapon {
    getRange() {
        return 5;
    }

    getDamage() {
        return 2;
    }
}

export default class SlingshotImp extends Creature {
    /**
      * @class SlingshotImp
      * @description Basic ranged enemy. Stands in place an shoots enemies
      */
    constructor(dungeon) {
        super(dungeon);
    }

    getMeleeWeapon() {
        return null;
    }

    getRangedWeapon() {
        return new ImpSlingshot(this.getDungeon());
    }

    getNextMove() {
        var self = this;
        return function() {
            var enemy = self.getVisibleEnemies()[0];
            if(enemy) {
                self.attack(enemy);
            } else {
                self.wait();
                return;
                var neighbors = self.getTile().getNeighbors8().filter((tile)=>self.canOccupy(tile));
                var randNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                if(randNeighbor) {
                    self.move(randNeighbor);
                } else {
                    self.wait();
                }
            }
        };
    }

    getBaseHP() {
        return 3;
    }

    getSpeed() {
        return 550;
    }
}
