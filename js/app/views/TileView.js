import { default as GameEvent } from "../events/GameEvent.js";

import { default as Weapon } from "../entities/weapons/Weapon.js";

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
    }

    update() {
        var sharedData = this._sharedData;
        var dungeon = sharedData.getDungeon();
        var location = sharedData.getInspectedTile();

        var contents = $('<div class="tile-info">');
        if(location) {
            var x = location.x;
            var y = location.y;
            var tile = dungeon.getTile(x, y);
            contents.append($('<div class="tile">').text(tile.constructor.name + ' (' + x + ', ' + y + ')'));
            var creature = tile.getCreature();
            if(creature) {
                var name = creature.constructor.name;
                var hp = creature.getCurrentHP();
                var baseHP = creature.getBaseHP();
                var time = creature.getTimeToNextMove();
                var speed = creature.getSpeed();
                contents.append($('<div class="creature">')
                    .append($('<div class="name">').text(name))
                    .append($('<div class="hp">').text('HP: ' + hp + '/' + baseHP))
                    .append($('<div class="action">').text('Action: ' + time + '/' + speed))
                );
            }
        }

        $(this.getDom()).empty().append(contents);
    }

    getDom() {
        return this._dom;
    }
}
