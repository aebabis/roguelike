import Move from './Move.js';
import Weapon from '../../weapons/Weapon.js';
import AttackEvent from '../../../events/AttackEvent.js';

export default class AttackMove extends Move {
    constructor(actorTile, param1, param2) {
        super(actorTile);
        if(param1.getX) {
            this._x = param1.getX();
            this._y = param1.getY();
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
        if(!creature.canSee(dungeon, targetTile)) {
            return 'Can\'t see the target location';
        } else if(!target) {
            return 'Nothing to attack';
        } else if(creature === target) {
            return 'Creature can\'t attack itself';
        }

        var targetDistance = dungeon.getTile(creature).getEuclideanDistance(targetTile);
        var weapon = (targetDistance > 1) ? creature.getRangedWeapon() : creature.getMeleeWeapon();
        if(!(weapon && weapon instanceof Weapon)) {
            return 'No weapon to attack that target with';
        } else if(targetDistance > weapon.getRange()) {
            return 'Target not in range';
        } else if(!weapon.isUseable(dungeon)) {
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
        var damage = target.receiveDamage(dungeon, weapon.getDamage(), weapon.getDamageType());
        dungeon.fireEvent(new AttackEvent(dungeon, creature, target, weapon));
        if(damage > 0) {
            weapon.onHit(dungeon, creature, target);
        }
    }

    isSeenBy(dungeon, observer) {
        return observer.canSee(dungeon, dungeon.getTile(this._x, this._y));
    }
}
