import GameEvent from './GameEvent';

import Creature from '../entities/creatures/Creature';

import Ability from '../abilities/Ability';

import Tile from '../tiles/Tile';

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

    getText(dungeon) {
        var creature = this.getCreature();
        var ability = this.getAbility();
        var tile = dungeon.getTile(creature);
        return `${creature} used ${ability}` + (tile ? ` on ${tile}` : '');
    }
}
