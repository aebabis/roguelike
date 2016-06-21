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
        var dom = this._dom = $('<div class="player-location-view">');
        this._sharedData = sharedData;

        sharedData.addObserver((event)=>this.update());

        $(dom).on('click', 'button.item', function() {
            var index = $(this).attr('data-index');
            var dungeon = sharedData.getDungeon();
            if(dungeon) {
                var player = dungeon.getPlayableCharacter();
                player.setNextMove(dungeon.getTile(player), new Move.TakeItemMove(index));
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
        var hpPercentage = Math.max(0, hp * 100 / baseHP);
        var mana = player.getCurrentMana();
        var baseMana = player.getBaseMana();
        var manaPercentage = Math.max(0, mana * 100 / baseMana);
        var time = player.getTimeToNextMove();
        var speed = player.getSpeed();
        var speedPercentage = Math.max(0, time * 100 / speed);

        var items = tile.getItems().map(function(item, index) {
            return {
                name: item.getName(),
                index: index,
                takeable: !(new Move.TakeItemMove(tile, index).getReasonIllegal(dungeon, player))
            }
        });

        var template = $(`
        <div role="presentation" class="portrait"></div>
        <div class="player">
            <h2>${name}</h2>
            <div class="bar hp" title="Hitpoints">
                <span class="text">${hp} / ${baseHP}</span>
                <div class="inner" style="width: ${hpPercentage}%"></div>
            </div>
            <div class="bar mana" title="Mana">
                <div class="inner" style="width: ${manaPercentage}%"></div>
                <span class="text">${mana} / ${baseMana}</span>
            </div>
            <!--div class="bar action" title="Ticks to Next Move">
                <div class="inner" style="width: ${speedPercentage}%"></div>
                <span class="text">${time} / ${speed}</span>
            </div-->
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
