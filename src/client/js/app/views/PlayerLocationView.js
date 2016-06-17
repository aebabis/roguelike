import GameEvent from "../events/GameEvent.js";

import Weapon from "../entities/weapons/Weapon.js";

import ItemDomFactory from "./ItemDomFactory.js";

import Move from "../entities/creatures/moves/Move.js";

function getItemsDom(dungeon, items) {
    return $('<div class="items">');
}

export default class PlayerLocationView {
    /**
     * @class PlayerLocationView
     * @description View summarizing the tile where the player is standing
     */
    constructor(sharedData) {
        var self = this;
        var dom = this._dom = $('<div class="sidebar-subcontainer player-location-view">');
        this._sharedData = sharedData;

        sharedData.addObserver((event)=>this.update());

        $(dom).on('click', 'button.item', function() {
            var index = $(this).attr('data-index');
            var dungeon = sharedData.getDungeon();
            if(dungeon) {
                var player = dungeon.getPlayableCharacter();
                player.setNextMove(new Move.TakeItemMove(index));
                dungeon.resolveUntilBlocked();
            }
        });
    }

    update() {
        var sharedData = this._sharedData;
        var dungeon = sharedData.getDungeon();
        var player = dungeon.getPlayableCharacter();
        var tile = dungeon.getTile(player);

        var tileName = tile.constructor.name;
        var x = tile.getX();
        var y = tile.getY();

        var name = player.constructor.name;
        var hp = player.getCurrentHP();
        var baseHP = player.getBaseHP();
        var mana = player.getCurrentMana();
        var baseMana = player.getBaseMana();
        var time = player.getTimeToNextMove();
        var speed = player.getSpeed();

        var items = tile.getItems().map(function(item, index) {
            return {
                name: item.getName(),
                index: index,
                takeable: !(new Move.TakeItemMove(index).getReasonIllegal(dungeon, player))
            }
        });

        var template = $(`
        <h2>${name}</h2>
        <div class="player">
            <div class="hp">HP: ${hp} / ${baseHP}</div>
            <div class="mana">Mana: ${mana} / ${baseMana}</div>
            <div class="action">Action: ${time} / ${speed}</div>
        </div>
        <div class="items">
            ${items.map((item)=>`
                <button class="item"
                    ${item.takeable ? '' : 'disabled'}
                    data-index="${item.index}">${item.name}
                </button>`)}
        </div>`);

        $(this.getDom()).empty().append(template);
    }

    getDom() {
        return this._dom[0];
    }
}
