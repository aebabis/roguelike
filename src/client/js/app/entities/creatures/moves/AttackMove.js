import { default as Move } from "./Move.js";
import { default as Creature } from "../Creature.js";
import { default as Weapon } from "../../weapons/Weapon.js";
import { default as AttackEvent } from "../../../events/AttackEvent.js";

export default Move.AttackMove = class AttackMove extends Move {
    constructor(param1, param2) {
        super();
        if(param1.getTile) {
            var tile = param1.getTile();
            this._x = tile.getX();
            this._y = tile.getY();
        } else if(!isNaN(param1) && !isNaN(param2)) {
            this._x = param1;
            this._y = param2;
        } else {
            throw new Error('Must pass two integer parameters or a Creature');
        }
    }

    getReasonIllegal(dungeon, creature) {
        var targetTile = dungeon.getTile(this._x, this._y);
        var target = targetTile.getCreature();
        if(!creature.canSee(targetTile)) {
            return 'Can\'t see the target location';
        } else if(!target) {
            return 'Nothing to attack';
        } else if(creature === target) {
            return 'Creature can\'t attack itself';
        }

        var targetDistance = dungeon.getTile(creature).getDirectDistance(targetTile);
        var weapon = (targetDistance > 1) ? creature.getRangedWeapon() : creature.getMeleeWeapon();
        if(!(weapon && weapon instanceof Weapon)) {
            return 'No weapon to attack that target with';
        } else if(targetDistance > weapon.getRange()) {
            return 'Target not in range';
        } else if(!weapon.isUseable()) {
            return 'Weapon not currently useable';
        }

        return null;
    }

    getCostMultiplier() {
        return 1;
    }

    execute(dungeon, creature) {
        var reason = this.getReasonIllegal(dungeon, creature);
        if(reason) {
            throw new Error(reason);
        }
        var x = this._x;
        var y = this._y;
        var targetTile = dungeon.getTile(x, y);
        var target = targetTile.getCreature();
        var targetDistance = dungeon.getTile(creature).getDirectDistance(targetTile);
        var weapon = (targetDistance > 1) ? creature.getRangedWeapon() : creature.getMeleeWeapon();
        var reduction = 0;
        var armor = target.getArmor();
        if(armor) {
            reduction = weapon.isMagical() ? armor.getMagicalReduction() : armor.getPhysicalReduction();
        }
        target.modifyHP(-(weapon.getDamage() - reduction));
        dungeon.fireEvent(new AttackEvent(dungeon, creature, target, weapon));
    }

    isSeenBy(dungeon, actor, observer) {
        return observer.canSee(actor.getTile()) || observer.canSee(dungeon.getTile(this._x, this._y));
    }
};
