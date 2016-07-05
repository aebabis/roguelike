import GameEvent from '../events/GameEvent.js';
import GameEvents from '../events/GameEvents.js';

import GridAnimations from './GridAnimations.js';
import DungeonTooltips from './DungeonTooltips.js';

var ANIMATE_BARS = false;

export default class GraphicDungeonView {
    constructor(sharedData) {
        var self = this;
        this._sharedData = sharedData;
        var dungeon = sharedData.getDungeon();
        var width = dungeon.getWidth();
        var height = dungeon.getHeight();

        var scrollPane = this._scrollPane = document.createElement('div');
        scrollPane.classList.add('grid-scroll');
        var grid = this._grid = document.createElement('div');
        grid.classList.add('grid');
        grid.classList.add('theme-default');
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
                cell.setAttribute('data-x', x);
                cell.setAttribute('data-y', y);
                cell.setAttribute('role', 'gridcell');
                row.appendChild(cell);
            }
        }
        this._synchronizeView();

        dungeon.addObserver(function observer(event) {
            self.update(event);
        });

        DungeonTooltips.bindTooltips(dungeon, grid);
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
        var dungeon = this._sharedData.getDungeon();
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
                cell.setAttribute('data-visible', player.canSee(dungeon, tile));
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
            this._rejections.forEach(clearTimeout);
        }
        this._rejections = [];
    }

    _createDelay(action, delay) {
        this._rejections.push(setTimeout(action, delay));
    }

    _queueAnimation(event) {
        var self = this;
        var grid = this.getDom();
        var dungeon = this._sharedData.getDungeon();
        var delay = event.getTimestamp() - (this._lastHumanMovingEvent ? this._lastHumanMovingEvent.getTimestamp() : 0);
        if(event instanceof GameEvents.AbilityEvent) {
            var ability = event.getAbility();
            if(ability.getRange() > 1 && ability.isTargetted() && ability.isTargetCreature()) {
                var caster = event.getCreature();
                var casterLocation = dungeon.getTile(caster);
                var target = event.getTile().getCreature();
                this._createDelay(function() {
                    let targetTile = (target && dungeon.getTile(target)) || event.getTile(); // Get target position dynamically so shooting at moving targets looks ok
                    GridAnimations.animateProjectile(dungeon, grid, ability, casterLocation, targetTile);
                }, delay);
            }
        } else if(event instanceof GameEvents.AttackEvent) {
            let attacker = event.getAttacker();
            let target = event.getTarget();
            let weapon = event.getWeapon();
            let tile = dungeon.getTile(attacker);
            let cell = grid.querySelector('[data-x="'+tile.getX()+'"][data-y="'+tile.getY()+'"]');
            this._createDelay(function() {
                let targetTile = dungeon.getTile(target); // Get target position dynamically so shooting at moving targets looks ok
                if(weapon.getRange() === 1) {
                    // TODO: Always add AttackEvent and consider range in CSS
                    cell.setAttribute('data-event-name', 'AttackEvent');
                } else {
                    GridAnimations.animateProjectile(dungeon, grid, weapon, tile, targetTile);
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
                let location = dungeon.getTile(event.getCreature());
                let cell = grid.querySelector('[data-x="'+location.getX()+'"][data-y="'+location.getY()+'"]');
                cell.removeChild(self._getDomForItem(event.getItem()));
            }, delay);
        } else if(event instanceof GameEvents.HitpointsEvent) {
            let creature = event.getCreature();
            let tile = dungeon.getTile(creature);
            let cell = grid.querySelector('[data-x="'+tile.getX()+'"][data-y="'+tile.getY()+'"]');
            //let tile = this._dungeon.getTile(creature);
            //let cell = grid.querySelector(`[data-x="${tile.getX()}"][data-y="${tile.getY()}"]`);
            this._createDelay(function() {
                cell.setAttribute('data-event-name', 'HitpointsEvent');
                cell.setAttribute('data-is-hp-change-negative', event.getAmount() < 0);
                let dom = self._getDomForCreature(creature);
                if(creature.isDead()) {
                    dom.setAttribute('data-is-dead', true);
                }
            }, delay + 200); // Death needs to be delayed so it appears to follow its cause
        } else if(event instanceof GameEvents.BuffAppliedEvent || event instanceof GameEvents.BuffEndedEvent) {
            this._createDelay(function() {
                var creature = event.getCreature();
                var dom = self._getDomForCreature(creature);
                dom.setAttribute('buffs', creature.getBuffs().map((buff)=>buff.toString()).join(' '));
            }, delay);
        }

        this._createDelay(function() {
            GridAnimations.animateEvent(dungeon, self, event);
        });
    }

    update(event) {
        var self = this;
        var grid = this.getDom();
        var dungeon = this._sharedData.getDungeon();
        var player = dungeon.getPlayableCharacter();

        if(event instanceof GameEvent) {
            if(event instanceof GameEvents.HumanMovingEvent) {
                Array.from(grid.querySelectorAll('[data-event-name]')).forEach(function(tile) {
                    tile.removeAttribute('data-event-name');
                });
                //this._synchronizeView();
                this._lastHumanMovingEvent = event;
            } else {
                this._queueAnimation(event);
            }
        }

        if(event instanceof GameEvents.HumanToMoveEvent || event instanceof GameEvents.HitpointsEvent) {
            dungeon.getCreatures().forEach(function(creature) {
                // TODO: Animate HP by moving this to AttackEvent handling
                self._animateBars(creature);
            });
        }

        // Tempory
        // Sync phone charge state
        dungeon.getCreatures().filter(function(creature) {
            return creature.constructor.name === 'ClunkyNinetiesCellPhone';
        }).forEach(function(creature) {
            self._getDomForCreature(creature).setAttribute('data-phone-charged', creature.getRangedWeapon().isCharged(dungeon));
        });

        // TODO: Consider if visibility needs to be animated
        // during events other than HumanMovingEvent
        // Should only be an issue in destructible environment
        Array.from(grid.querySelector('[data-visible="true"]')).forEach(function(cell) {
            cell.setAttribute('data-visible', 'false');
        });

        if(player) {
            let playerLocation = dungeon.getTile(player);
            let visionRadius = Math.ceil(player.getVisionRadius());
            let startX = Math.max(0, playerLocation.getX() - visionRadius);
            let endX = Math.min(dungeon.getWidth() - 1, playerLocation.getX() + visionRadius);
            let startY = Math.max(0, playerLocation.getY() - visionRadius);
            let endY = Math.min(dungeon.getHeight() - 1, playerLocation.getY() + visionRadius);
            for(let x = startX; x < endX; x++) {
                for(let y = startY; y < endY; y++) {
                    let tile = dungeon.getTile(x, y);
                    let cell = grid.querySelector('[data-x="'+x+'"][data-y="'+y+'"]');
                    cell.setAttribute('data-tile-type', tile.constructor.name);
                    cell.setAttribute('data-explored', player.hasSeen(tile));
                    cell.setAttribute('data-visible', player.canSee(dungeon, tile));
                    tile.getItems().forEach(function(item) {
                        cell.appendChild(self._getDomForItem(item));
                    });
                }
            }
        }
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

    _getDomForItem(item) {
        var id = item.getId();
        var node = this.getDom().querySelector('[data-id="'+id+'"]');
        if(node) {
            return node;
        } else {
            var div = document.createElement('div');
            div.setAttribute('data-id', id);
            div.setAttribute('data-item-name', item.toString());
            div.classList.add('entity');
            div.classList.add('item');

            return div;
        }
    }
}
