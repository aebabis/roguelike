import { default as GameEvent } from "./GameEvent.js";

import { default as Creature } from "../entities/creatures/Creature.js";

import { default as Ability } from "../abilities/Ability.js";

import { default as Tile } from '../tiles/Tile.js';

export default class AbilityEvent extends GameEvent {
    /**
      * @class AbilityEvent
      * @description Fired whenever a creature attacks
      */
    constructor(dungeon, creature, ability, tile) {
        super(dungeon);
        if(!(creature instanceof Creature)) {
            throw new Error('Second parameter must be a Creature');
        } else if(!(ability instanceof Ability)) {
            throw new Error('Third parameter must be an Ability');
        } else if((tile instanceof Tile) !== ability.isTargetted()) {
            throw new Error('Fourth parameter must be a Tile iff ability is targetted');
        }

        this._creature = creature;
        this._ability = ability;
        this._tile = tile;
    }

    getCreature() {
        return this._creature;
    }

    getAbility() {
        return this._ability;
    }

    getTile() {
        return this._tile;
    }

    getText() {
        var creature = this.getCreature();
        var ability = this.getAbility();
        var tile = this.getTile();
        return `${creature} used ${ability}` + (tile ? ` on ${tile}` : '');
    }
}
