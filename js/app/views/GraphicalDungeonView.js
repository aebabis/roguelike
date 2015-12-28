import { default as Tile } from "../tiles/Tile.js";
import { default as AttackEvent } from "../events/AttackEvent.js";
import { default as GameEvent } from "../events/GameEvent.js";
import { default as HumanMovingEvent } from "../events/HumanMovingEvent.js";
import { default as HumanToMoveEvent } from "../events/HumanToMoveEvent.js";

export default class GraphicDungeonView {
    constructor(dungeon) {
        var self = this;
        this._dungeon = dungeon;
        var width = dungeon.getWidth();
        var height = dungeon.getHeight();

        var scrollPane = this._scrollPane = document.createElement('div');
        scrollPane.classList.add('grid-scroll');
        var grid = this._grid = document.createElement('div');
        grid.classList.add('grid');
        grid.classList.add('theme-default');
        grid.setAttribute('tabindex', 0);
        grid.setAttribute('role', 'grid');
        grid.setAttribute('aria-readonly', true);
        scrollPane.appendChild(grid);
        for(var y = 0; y < height; y++) {
            var row = document.createElement('div');
            row.classList.add('row');
            row.setAttribute('role', 'row');
            grid.appendChild(row);
            for(var x = 0; x < width; x++) {
                var cell = document.createElement('div');
                cell.classList.add('cell');
                //cell.setAttribute('tabindex', 0);
                cell.setAttribute('data-x', x);
                cell.setAttribute('data-y', y);
                cell.setAttribute('role', 'gridcell');
                row.appendChild(cell);
            }
        }
        this._rejections = [];

        grid.addEventListener('focus', function() {
            scrollPane.classList.add('grid-focused');
        });

        grid.addEventListener('blur', function() {
            scrollPane.classList.remove('grid-focused');
        });

        dungeon.addObserver(function observer(event) {
            self.update(event);
        });
    }

    getDom() {
        return this._scrollPane;
    }

    _resetAnimationQueue() {
        console.log("JREXCT", this._rejections);
        this._rejections.forEach(function(reject) {
            reject();
        });
        this._rejections = [];
    }

    _createDelay(action, delay) {
        var self = this;
        return Promise.race([new Promise(function(resolve, reject) {
            setTimeout(resolve, delay);
        }), new Promise(function(resolve, reject) {
            self._rejections.push(reject);
        })]).then(action);
    }

    _queueAnimation(event) {
        var grid = this.getDom();
        console.log(event);
        var delay = event.getTimestamp() - (this._lastHumanMovingEvent ? this._lastHumanMovingEvent.getTimestamp() : 0);
        if(event instanceof AttackEvent) {
            var tile = this._dungeon.getTile(event.getTarget());
            var cell = grid.querySelector('[data-x="'+tile.getX()+'"][data-y="'+tile.getY()+'"]');
            this._createDelay(function() {
                cell.setAttribute('data-event-name', 'AttackEvent');
            }, delay);
        }
    }

    update(event) {
        var self = this;
        var grid = this.getDom();
        var dungeon = this._dungeon;
        var player = dungeon.getPlayableCharacter();

        if(event instanceof GameEvent) {
            if(event instanceof HumanMovingEvent) {
                Array.from(grid.querySelectorAll('[data-event-name]')).forEach(function(tile) {
                    tile.removeAttribute('data-event-name');
                });
                this._resetAnimationQueue();
                this._lastHumanMovingEvent = event;
            } else {
                this._queueAnimation(event);
            }
        }

        dungeon.forEachTile(function(tile, x, y) {
            var cell = grid.querySelector('[data-x="'+x+'"][data-y="'+y+'"]');
            var fc;
            while(fc = cell.firstChild) {
                cell.removeChild(fc);
            }
            cell.setAttribute('data-tile-type', tile.constructor.name);
            if(player) {
                cell.setAttribute('data-explored', player.hasSeen(tile));
                if(player.canSee(tile)) {
                    cell.setAttribute('data-visible', true);
                    var creature = tile.getCreature();
                    if(creature) {
                        var dom = self._getDomForCreature(creature);
                        dom.querySelector('.hp').textContent = creature.getCurrentHP() + '/' + creature.getBaseHP();
                        cell.appendChild(dom);
                    }
                } else {
                    cell.setAttribute('data-visible', false);
                }
            }
        });
    }

    getSelectedTileCoordinates() {

    }

    _getDomForCreature(creature) {
        var id = creature.getId();
        var node = this.getDom().querySelector('[data-id="'+id+'"]');
        if(node) {
            return node;
        } else {
            var div = document.createElement('div');
            div.setAttribute('data-id', id);
            div.setAttribute('data-creature-name', creature.toString());

            var hp = document.createElement('div');
            hp.classList.add('hp');
            div.appendChild(hp);

            return div;
        }
    }
}
