import { default as Tile } from "../tiles/Tile.js";
import { default as GameEvent } from "../events/GameEvent.js";
import { default as GameEvents } from "../events/GameEvents.js";

var ANIMATE_BARS = false;

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
        this._synchronizeView();

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

    /**
     * Makes the view match the current game state.
     * This is not called every event. It is called
     * when skipping animations (e.g because player
     * provided multiple inputs quickly)
     */
    _synchronizeView() {
        var self = this;
        var grid = this.getDom();
        var dungeon = this._dungeon;
        var player = dungeon.getPlayableCharacter();

        this._resetAnimationQueue();

        dungeon.forEachTile(function(tile, x, y) {
            var cell = grid.querySelector('[data-x="'+x+'"][data-y="'+y+'"]');
            var fc;
            while(fc = cell.firstChild) {
                cell.removeChild(fc);
            }
            cell.setAttribute('data-tile-type', tile.constructor.name);
            if(player) {
                cell.setAttribute('data-explored', player.hasSeen(tile));
                cell.setAttribute('data-visible', player.canSee(tile));
                var creature = tile.getCreature();
                if(creature) {
                    var dom = self._getDomForCreature(creature);
                    cell.appendChild(dom);
                    self._animateBars(creature);
                }
            }
        });

        // Set grid width programatically to override table layout algorithm
        var table = grid.querySelector('.grid');
        table.style.width = 5 * dungeon.getWidth() + 'em';
    }

    _animateBars(creature) {
        var SCALE = 2;
        if(creature.isDead()) {
            return;
        }
        var dom = this._getDomForCreature(creature);
        dom.querySelector('.hp').style.width = creature.getCurrentHP() * 100 / creature.getBaseHP() + '%';
        var actionBar = $(dom).find('.action-bar');
        var prevTime = actionBar.attr('data-last-width') || 0;
        var time = creature.getTimeToNextMove();
        var width = time * 100 / 1000 + '%';
        if(ANIMATE_BARS) {
            if(time < prevTime) {
                actionBar.stop().animate({width: width}, (prevTime - time) * SCALE);
            } else {
                actionBar.stop().animate({width: 0}, prevTime * SCALE, function() {
                    var speed = creature.getSpeed();
                    var startingWidth = speed * 100 / 1000 + '%';
                    actionBar.width(startingWidth).animate({width: width}, (speed - time) * SCALE);
                });
            }
        } else {
            actionBar.width(width);
        }
    }

    _resetAnimationQueue() {
        if(this._rejections) {
            this._rejections.forEach(function(reject) {
                reject();
            });
        }
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
        var self = this;
        var grid = this.getDom();
        var delay = event.getTimestamp() - (this._lastHumanMovingEvent ? this._lastHumanMovingEvent.getTimestamp() : 0);
        if(event instanceof GameEvents.AttackEvent) {
            let target = event.getTarget();
            let tile = this._dungeon.getTile(target);
            let cell = grid.querySelector('[data-x="'+tile.getX()+'"][data-y="'+tile.getY()+'"]');
            this._createDelay(function() {
                cell.setAttribute('data-event-name', 'AttackEvent');
                let dom = self._getDomForCreature(target);
                if(target.isDead()) {
                    dom.setAttribute('data-is-dead', true);
                }
            }, delay);
        } else if(event instanceof GameEvents.MoveEvent) {
            this._createDelay(function() {
                let to = event.getToCoords();
                let cell = grid.querySelector('[data-x="'+to.x+'"][data-y="'+to.y+'"]');
                let creature = event.getCreature();
                let dom = self._getDomForCreature(creature);
                cell.appendChild(dom);
            }, delay);
        } else if(event instanceof GameEvents.TakeItemEvent) {
            this._createDelay(function() {
                let location = event.getCreature().getTile();
                let cell = grid.querySelector('[data-x="'+location.getX()+'"][data-y="'+location.getY()+'"]');
                cell.removeChild(self._getDomForWeapon(event.getItem()));
            }, delay);
        }
    }

    update(event) {
        var self = this;
        var grid = this.getDom();
        var dungeon = this._dungeon;
        var player = dungeon.getPlayableCharacter();

        if(event instanceof GameEvent) {
            if(event instanceof GameEvents.HumanMovingEvent) {
                Array.from(grid.querySelectorAll('[data-event-name]')).forEach(function(tile) {
                    tile.removeAttribute('data-event-name');
                });
                this._synchronizeView();
                this._lastHumanMovingEvent = event;
            } else {
                this._queueAnimation(event);
            }
        }

        dungeon.getCreatures().forEach(function(creature) {
            // TODO: Animate HP by moving this to AttackEvent handling
            self._animateBars(creature);
        });

        // Tempory
        // Sync phone charge state
        dungeon.getCreatures().filter(function(creature) {
            return creature.constructor.name === 'ClunkyNinetiesCellPhone';
        }).forEach(function(creature) {
            self._getDomForCreature(creature).setAttribute('data-phone-charged', creature.getRangedWeapon().isCharged());
        });

        // TODO: Consider if visibility needs to be animated
        // during events other than HumanMovingEvent
        // Should only be an issue in destructible environment
        dungeon.forEachTile(function(tile, x, y) {
            var cell = grid.querySelector('[data-x="'+x+'"][data-y="'+y+'"]');
            cell.setAttribute('data-tile-type', tile.constructor.name);
            if(player) {
                cell.setAttribute('data-explored', player.hasSeen(tile));
                cell.setAttribute('data-visible', player.canSee(tile));
            }
            tile.getItems().forEach(function(item) {
                cell.appendChild(self._getDomForWeapon(item));
            });
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
            div.classList.add('entity');
            div.classList.add('creature');

            var stats = document.createElement('div');
            stats.classList.add('stats');
            div.appendChild(stats);

            var hp = document.createElement('div');
            hp.classList.add('hp');
            stats.appendChild(hp);

            var actionBar = document.createElement('div');
            actionBar.classList.add('action-bar');
            stats.appendChild(actionBar);

            return div;
        }
    }

    _getDomForWeapon(weapon) {
        var id = weapon.getId();
        var node = this.getDom().querySelector('[data-id="'+id+'"]');
        if(node) {
            return node;
        } else {
            var div = document.createElement('div');
            div.setAttribute('data-id', id);
            div.setAttribute('data-weapon-name', weapon.toString());
            div.classList.add('entity');
            div.classList.add('weapon');

            return div;
        }
    }
}
