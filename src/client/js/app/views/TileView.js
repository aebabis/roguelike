import { default as GameEvent } from "../events/GameEvent.js";

import { default as Weapon } from "../entities/weapons/Weapon.js";

import { default as ItemDomFactory } from "./ItemDomFactory.js";

import { default as Move } from "../entities/creatures/moves/Move.js";

export default class TileView {
    /**
     * @class TileView
     * @description View for providing information about an arbitary tile
     */
    constructor(sharedData) {
        var self = this;
        var dom = this._dom = $('<div class="sidebar-subcontainer tile-info">');
        this._sharedData = sharedData;

        sharedData.addObserver((event)=>this.update());

        $(dom).on('click', 'button.item', function() {
            var index = $(this).attr('data-index');
            var dungeon = sharedData.getDungeon();
            var player = dungeon.getPlayableCharacter();
            player.setNextMove(new Move.TakeItemMove(index));
        });
    }

    update() {
        var template;
        var sharedData = this._sharedData;
        var dungeon = sharedData.getDungeon();
        var location = sharedData.getInspectedTile();
        if(location) {
            var tile = dungeon.getTile(location.x, location.y);
            var tileName = tile.getName();
            var creature = tile.getCreature();
            var items = tile.getItems();

            template = $(`
            <h2>${tile.getName()} (${tile.getX()}, ${tile.getY()})</h2>
            <div class="wrap">
                ${
                    creature ? `
                    <div class="creature">
                        <div class="name">${creature.getName()}</div>
                        <div class="hp">HP: ${creature.getCurrentHP()} / ${creature.getBaseHP()}</div>
                        <div class="action">Action: ${creature.getTimeToNextMove()} / ${creature.getSpeed()}</div>
                    </div>` : ''
                }
                <ul class="items">
                    ${items.map((item)=>`<li>${item.getName()}</li>`)}
                </ul>
            </div>`);
        } else {
            template = 'X'
        }
        $(this.getDom()).empty().append(template);
    }

    getDom() {
        return this._dom[0];
    }
}
