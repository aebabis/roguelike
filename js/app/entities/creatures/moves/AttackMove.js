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

    isLegal(dungeon, creature) {
        var targetTile = dungeon.getTile(this._x, this._y);
        var target = targetTile.getCreature();
        if(!creature.canSee(targetTile)) {
            this._setReasonIllegal('Can\'t see the target location');
            return false;
        } else if(!target) {
            this._setReasonIllegal('Nothing to attack');
            return false;
        } else if(creature === target) {
            this._setReasonIllegal('Creature can\'t attack itself');
            return false;
        }

        var targetDistance = dungeon.getTile(creature).getDirectDistance(targetTile);
        var weapon = (targetDistance > 1) ? creature.getRangedWeapon() : creature.getMeleeWeapon();
        if(!(weapon && weapon instanceof Weapon)) {
            this._setReasonIllegal('No weapon to attack that target with');
            return false;
        } else if(targetDistance > weapon.getRange()) {
            this._setReasonIllegal('Target not in range');
            return false;
        } else if(!weapon.isUseable()) {
            this._setReasonIllegal('Weapon not currently useable');
            return false;
        }

        return true;
    }

    getCostMultiplier() {
        return 1;
    }

    execute(dungeon, creature) {
        var x = this._x;
        var y = this._y;
        var targetTile = dungeon.getTile(x, y);
        var target = targetTile.getCreature();
        var targetDistance = dungeon.getTile(creature).getDirectDistance(targetTile);
        var weapon = (targetDistance > 1) ? creature.getRangedWeapon() : creature.getMeleeWeapon();
        target.modifyHP(-weapon.getDamage());
        dungeon.fireEvent(new AttackEvent(dungeon, creature, target, weapon));
    }
};
