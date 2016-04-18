/*import { default as Entity } from "../Entity.js";
import { default as Tile } from "../../tiles/Tile.js";
import { default as MoveEvent } from "../../events/MoveEvent.js";
import { default as AttackEvent } from "../../events/AttackEvent.js";
import { default as CustomEvent } from "../../events/CustomEvent.js";

import { default as Inventory } from "./Inventory.js";

import { default as Strategy } from "./strategies/Strategy.js";
import { default as Weapon } from "../weapons/Weapon.js";

import { default as AStar } from "../../../../bower_components/es6-a-star/es6-a-star.js";

import { default as Geometry } from "../../util/Geometry.js";*/

import { default as Move } from "./Move.js";

export default Move.UseAbilityMove = class UseAbilityMove extends Move {
    constructor(index, x, y) {
        super();
        this._index = index;
        this._x = x;
        this._y = y;
    }

    isLegal(dungeon, creature) {
        // TODO: implement
        return true;
    }

    getCostMultiplier() {
        return 1;
    }

    execute(dungeon, creature) {
        var index = this._index;
        console.log(creature.getAbilities(), index);
        var ability = creature.getAbilities()[index];
        if(ability.isTargetted()) {
            var x = this._x;
            var y = this._y;
            var tile = dungeon.getTile(x, y);
            ability.use(dungeon, creature, tile);
        } else {
            ability.use(dungeon, creature);
        }
    }

    isSeenBy(dungeon, actor, observer) {
        return true;
    }
};
