import { default as GameEvent } from "../events/GameEvent.js";

import { default as Weapon } from "../entities/weapons/Weapon.js";

import { default as ItemDomFactory } from "./ItemDomFactory.js";

import { default as Move } from "../entities/creatures/moves/Move.js";

function getCreatureDom(creature) {
    var name = creature.constructor.name;
    var hp = creature.getCurrentHP();
    var baseHP = creature.getBaseHP();
    var time = creature.getTimeToNextMove();
    var speed = creature.getSpeed();
    return $(
        `<div class="creature">
            <div class="name">${name}</div>
            <div class="hp">HP: ${hp} / ${baseHP}</div>
            <div class="action">Action: ${time} / ${speed}</div>
        </div>`);
}

function getItemsDom(dungeon, items) {
    return $('<div class="items">').append(items.map(function(item, index) {
        var disabled = new Move.TakeItemMove(index).isLegal(dungeon, dungeon.getPlayableCharacter());
        return $(
            `<button class="item"
                ${disabled ? '' : 'disabled'}
                data-index="${index}">${item.getName()}
            </button>`);
    }));
}

export default class TileView {
    /**
     * @class TileView
     * @description
     */
    constructor(sharedData) {
        var self = this;
        var dom = this._dom = document.createElement('div');
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
        var sharedData = this._sharedData;
        var dungeon = sharedData.getDungeon();
        var player = dungeon.getPlayableCharacter();
        var location = sharedData.getInspectedTile();

        var contents = $('<div class="tile-info">');
        if(location) {
            var x = location.x;
            var y = location.y;
            var tile = dungeon.getTile(x, y);
            var items = tile.getItems();
            contents.append($('<div class="tile">').text(tile.constructor.name + ' (' + x + ', ' + y + ')'));
            var creature = tile.getCreature();
            if(creature === player) {
                if(items.length > 0) {
                    contents.append(getItemsDom(dungeon, items));
                }
            } else if(creature) {
                contents.append(getCreatureDom(creature));
            }
        }

        $(this.getDom()).empty().append(contents);
    }

    getDom() {
        return this._dom;
    }
}
