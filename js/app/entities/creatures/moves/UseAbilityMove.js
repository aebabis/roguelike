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
    isLegal() {
        throw new Error('Abstract method not implemented');
    }

    getCostMultiplier() {
        throw new Error('Abstract method not implemented');
    }

    execute(dungeon, creature) {
        throw new Error('Abstract method not implemented');
    }

    isSeenBy(dungeon, actor, observer) {
        throw new Error('Abstract method not implemented');
    }
};
