import Dungeon from '../dungeons/Dungeon.js';
import GameEvent from '../events/GameEvent.js';
import GameEvents from '../events/GameEvents.js';

import GridAnimations from './GridAnimations.js';
import DungeonTooltips from './DungeonTooltips.js';

import DamageTypes from '../entities/DamageTypes.js';

import GraphicalViewSharedData from '../controllers/GraphicalViewSharedData.js';

const DAMAGE_COLORS = {
    [DamageTypes.MELEE_PHYSICAL]: 'darkred',
    [DamageTypes.RANGED_PHYSICAL]: 'darkred',
    [DamageTypes.FIRE]: 'orange',
    [DamageTypes.COLD]: 'darkblue',
    [DamageTypes.ELECTRICAL]: 'yellow',
    [DamageTypes.ENERGY]: 'white',
    [DamageTypes.POISON]: 'emerald'
};

const DAMAGE_OUTLINE_COLORS = {
    [DamageTypes.MELEE_PHYSICAL]: 'pink',
    [DamageTypes.RANGED_PHYSICAL]: 'pink',
    [DamageTypes.FIRE]: 'darkred',
    [DamageTypes.COLD]: 'skyblue',
    [DamageTypes.ELECTRICAL]: 'orange',
    [DamageTypes.ENERGY]: 'yellow',
    [DamageTypes.POISON]: 'darkgreen'
};

//const ANIMATE_BARS = false;

function getGridTileFast(grid, x, y) {
    return grid.children[0].children[y].children[x];
}

function updateRangeIndicator(grid, dungeon, attack) {
    $('.range-indicator').remove();
    if(!attack) {
        return;
    }
    let color = 'rgb(70, 70, 90)';
    if(typeof attack.isMovementAbility === 'function') {
        color = 'darkviolet';
    } else if(typeof attack.isTargetted === 'function') {
        color = 'violet';
    }
    const player = dungeon.getPlayableCharacter();
    const playerTile = dungeon.getTile(player);
    const playerX = playerTile.getX();
    const playerY = playerTile.getY();
    const range = attack.getRange();
    const dimension = range * 2 + 3;
    const rangeArray = new Array(dimension).fill(0).map(function(unused, x) {
        let dx = x - range - 1;
        return new Array(dimension).fill(0).map(function(unused, y) {
            let dy = y - range - 1;
            return dx * dx + dy * dy <= range * range;
        });
    });
    $('<div class="range-indicator">').css({
        zIndex: 5,
        position: 'absolute',
        pointerEvents: 'none',
        left: (playerX - range - 1) * 5 + 'em',
        top: (playerY - range - 1) * 5 + 'em'
    }).append(rangeArray.map(function(row, dy) {
        return $('<div class="range-indicator-row">').css({
            width: dimension * 5 + 'em',
            overflow: 'auto'
        }).append(row.map(function(isTargettable, dx) {
            return $('<div class="range-indicator-cell">').css({
                float: 'left',
                width: '5em',
                height: '5em',
                pointerEvents: 'none',
                borderStyle: 'solid',
                borderColor: color,
                borderRadius: '-8px',
                borderTopWidth: (isTargettable && !rangeArray[dy - 1][dx]) ? '2px' : '0',
                borderRightWidth: (isTargettable && !rangeArray[dy][dx + 1]) ? '2px' : '0',
                borderBottomWidth: (isTargettable && !rangeArray[dy + 1][dx]) ? '2px' : '0',
                borderLeftWidth: (isTargettable && !rangeArray[dy][dx - 1]) ? '2px' : '0'
            });
        }));
    })).appendTo(grid);
}

const getScrollingText = (function() {
    const previousOccurences = {};

    function markAndCountRecentOccurences(x, y, delta) {
        //debugger;
        const now = Date.now();
        const key  = `${x},${y}`;
        let array = previousOccurences[key] || (previousOccurences[key] = []);
        array = previousOccurences[key] = array.filter((time) => now - time < delta);
        array.push(now);
        return array.length - 1;
    }

    return function getScrollingText(text, x, y, color, outlineColor) {
        let startY = (y * 5) + 2.5 + 'rem';
        let endY = (y * 5) + 'rem';
        let size = text.toString().length <= 2 ? '2em' : '1.5em';
        let previousOccurenceCount = markAndCountRecentOccurences(x, y, 1000);
        return $('<div>').text(text)
            .css({
                color,
                fontWeight: 'bold',
                zIndex: 3,
                pointerEvents: 'none',
                fontSize: size,
                webkitTextStroke: `.025em ${outlineColor}`,
                position: 'absolute',
                width: '5rem',
                textAlign: 'center',
                top: startY,
                left: (x * 5) + - 1 + 2 * previousOccurenceCount + 'rem'
            })
            .animate({
                top: endY,
                opacity: 0
            }, 1000, function() {
                $(this).remove();
            });
    };
}());

export default class GraphicalDungeonView {
    constructor(sharedData) {
        if(!(sharedData instanceof GraphicalViewSharedData)) {
            throw new Error('First parameter must be a GraphicalViewSharedData');
        }
        const self = this;
        this._sharedData = sharedData;

        this._creatureDoms = {};
        this._itemDoms = {};

        const scrollPane = this._scrollPane = document.createElement('div');

        function buildDom() {
            const dungeon = sharedData.getDungeon();
            const width = dungeon.getWidth();
            const height = dungeon.getHeight();

            scrollPane.innerHTML = '';
            scrollPane.classList.add('grid-scroll');
            const grid = self._grid = document.createElement('div');
            grid.classList.add('grid');
            grid.classList.add('theme-default');
            grid.setAttribute('role', 'grid');
            grid.setAttribute('aria-readonly', true);
            scrollPane.appendChild(grid);
            for(let y = 0; y < height; y++) {
                const row = document.createElement('div');
                row.classList.add('row');
                row.setAttribute('role', 'row');
                grid.appendChild(row);
                for(let x = 0; x < width; x++) {
                    const cell = document.createElement('div');
                    cell.classList.add('cell');
                    cell.setAttribute('data-x', x);
                    cell.setAttribute('data-y', y);
                    cell.setAttribute('role', 'gridcell');
                    row.appendChild(cell);
                }
            }
            self._tileDimension = grid.firstChild.firstChild.clientHeight;
            self._halfTileDimension = self._tileDimension >> 1;
            self._synchronizeView();
        }

        sharedData.addObserver(function observer(event) {
            if(event instanceof Dungeon){
                buildDom();
                setTimeout(function() {
                    self.scroll();
                    document.querySelector('section.game').focus();
                });
            } else {
                self.update(event);
            }
        });

        (function() {
            let timer;
            sharedData.addObserver(function() {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    const dungeon = sharedData.getDungeon();
                    let targettable;
                    if(typeof sharedData.getTargettedAbility() === 'number') {
                        targettable = dungeon.getPlayableCharacter().getAbility(sharedData.getTargettedAbility());
                    } else if(typeof sharedData.getTargettedItem() === 'number') {
                        targettable = dungeon.getPlayableCharacter().getInventory().getItem(sharedData.getTargettedItem());
                    } else {
                        targettable = dungeon.getPlayableCharacter().getRangedWeapon();
                    }
                    updateRangeIndicator(self.getDom().children[0], sharedData.getDungeon(), targettable);

                    Array.from(document.querySelectorAll('[data-keyboard-move]')).forEach((element)=>element.removeAttribute('data-keyboard-move'));
                    const attackTarget = sharedData.getAttackTarget();
                    const abilityTarget = sharedData.getAbilityTarget();
                    const itemTarget = sharedData.getItemTarget();
                    const target = attackTarget || abilityTarget || itemTarget;
                    if(target) {
                        const moveName = (attackTarget && 'AttackMove') ||
                            (abilityTarget && 'UseAbilityMove') ||
                            (itemTarget && 'UseItemMove');
                        self.getDom().querySelector(`.cell[data-x="${target.getX()}"][data-y="${target.getY()}"]`)
                            .setAttribute('data-keyboard-move', moveName);
                    }
                });
            });
        })();

        buildDom();
        DungeonTooltips.bindTooltips(sharedData, self.getDom());
        this.scroll();
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
        const self = this;
        const grid = this.getDom();
        const dungeon = this._sharedData.getDungeon();
        const player = dungeon.getPlayableCharacter();

        this._resetAnimationQueue();

        dungeon.forEachTile(function(tile, x, y) {
            const cell = getGridTileFast(grid, x, y);
            let fc;
            while(fc = cell.firstChild) {
                cell.removeChild(fc);
            }
            cell.setAttribute('data-tile-type', tile.constructor.name);
            cell.setAttribute('data-room-key', tile.getRoomKey());
            if(player) {
                cell.setAttribute('data-explored', player.hasSeen(tile));
                cell.setAttribute('data-visible', player.canSee(dungeon, tile));
                const creature = tile.getCreature();
                if(creature) {
                    const dom = self._getDomForCreature(creature);
                    cell.appendChild(dom);
                    self._animateBars(creature);
                }
            }
            tile.getItems().forEach(function(item) {
                cell.appendChild(self._getDomForItem(item));
            });
        });

        // Set grid width programatically to override table layout algorithm
        const table = grid.children[0];
        table.style.width = 5 * dungeon.getWidth() + 'em';
    }

    _animateBars(creature) {
        //const SCALE = 2;
        if(creature.isDead()) {
            return;
        }
        const dom = this._getDomForCreature(creature);
        dom.querySelector('.hp').style.width = creature.getCurrentHP() * 100 / creature.getBaseHP() + '%';
        dom.querySelector('.action-bar').style.width = creature.getTimeToNextMove() * 100 / creature.getSpeed() + '%';
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
        const self = this;
        const grid = this.getDom();
        const dungeon = this._sharedData.getDungeon();
        const delay = event.getTimestamp() - (this._lastHumanMovingEvent ? this._lastHumanMovingEvent.getTimestamp() : 0);
        if(event instanceof GameEvents.AbilityEvent) {
            const ability = event.getAbility();
            if(ability.getRange() > 1 && ability.isTargetted() && ability.isTargetCreature() && !ability.isMovementAbility()) {
                const caster = event.getCreature();
                const casterLocation = dungeon.getTile(caster);
                const target = event.getTile().getCreature();
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
            let cell = getGridTileFast(grid, tile.getX(), tile.getY());
            this._createDelay(function() {
                let targetTile = dungeon.getTile(target); // Get target position dynamically so shooting at moving targets looks ok
                if(weapon.getRange() === 1) {
                    // TODO: Better animation
                    cell.setAttribute('data-event-name', 'AttackEvent');
                } else {
                    GridAnimations.animateProjectile(dungeon, grid, weapon, tile, targetTile);
                }
            }, delay);
        } else if(event instanceof GameEvents.MoveEvent || event instanceof GameEvents.PositionChangeEvent || event instanceof GameEvents.SpawnEvent) {
            let player = dungeon.getPlayableCharacter();
            if(player) {
                let playerLocation = dungeon.getTile(player);
                let visionRadius = Math.ceil(player.getVisionRadius());
                this._createDelay(function() {
                    // TODO: Refactor this? Perhaps all positioning requires a common, secondary event
                    let to = event.getX ? {x: event.getX(), y: event.getY()} : event.getToCoords();
                    let cell = getGridTileFast(grid, to.x, to.y);
                    let creature = event.getCreature();
                    let dom = self._getDomForCreature(creature);
                    cell.appendChild(dom);

                    // TODO: Can this move inside the if?
                    // Update player vision
                    Array.from(grid.querySelectorAll('[data-visible="true"]')).forEach(function(cell) {
                        cell.setAttribute('data-visible', 'false');
                    });
                    let startX = Math.max(0, playerLocation.getX() - visionRadius);
                    let endX = Math.min(dungeon.getWidth() - 1, playerLocation.getX() + visionRadius);
                    let startY = Math.max(0, playerLocation.getY() - visionRadius);
                    let endY = Math.min(dungeon.getHeight() - 1, playerLocation.getY() + visionRadius);
                    for(let x = startX; x <= endX; x++) {
                        for(let y = startY; y <= endY; y++) {
                            let tile = dungeon.getTile(x, y);
                            let cell = getGridTileFast(grid, x, y);
                            cell.setAttribute('data-tile-type', tile.constructor.name);
                            cell.setAttribute('data-explored', player.hasSeen(tile));
                            cell.setAttribute('data-visible', player.canSee(dungeon, tile));
                            tile.getItems().forEach(function(item) {
                                cell.appendChild(self._getDomForItem(item));
                            });
                        }
                    }

                    const creatureLocation = dungeon.getTile(creature);
                    if(creatureLocation.isOpen) {
                        cell.setAttribute('data-door-open', creatureLocation.isOpen());
                    }

                    if(creature === player) {
                        self.scroll();
                    }

                }, delay);
            }
        } else if(event instanceof GameEvents.TakeItemEvent) {
            this._createDelay(function() {
                let location = event.getTile();
                let cell = getGridTileFast(grid, location.getX(), location.getY());
                cell.removeChild(self._getDomForItem(event.getItem()));
            }, delay);
        } else if(event instanceof GameEvents.HitpointsEvent) {
            let creature = event.getCreature();
            let tile = dungeon.getTile(creature);
            let x = tile.getX();
            let y = tile.getY();
            let cell = getGridTileFast(grid, x, y);
            this._createDelay(function() {
                cell.setAttribute('data-event-name', 'HitpointsEvent');
                cell.setAttribute('data-is-hp-change-negative', event.getAmount() < 0);
                let dom = self._getDomForCreature(creature);
                if(creature.isDead()) {
                    dom.setAttribute('data-is-dead', true);
                }
                if(event.getAmount() < 0) {
                    getScrollingText(event.getAmount(), x, y, DAMAGE_COLORS[event.getDamageType()] || 'green', DAMAGE_OUTLINE_COLORS[event.getDamageType()] || 'green')
                        .appendTo(grid.children[0]);
                }
            }, delay + 200); // Death needs to be delayed so it appears to follow its cause
        } else if(event instanceof GameEvents.ZeroDamageEvent) {
            let creature = event.getCreature();
            let type = event.getDamageType();
            let tile = dungeon.getTile(creature);
            let x = tile.getX();
            let y = tile.getY();
            let message = creature.getDamageReduction(type) === Infinity ? 'Immune' : 'Blocked';
            getScrollingText(message, x, y, 'white', 'black')
                .appendTo(grid.children[0]);
        } else if(event instanceof GameEvents.BuffAppliedEvent || event instanceof GameEvents.BuffEndedEvent) {
            this._createDelay(function() {
                const creature = event.getCreature();
                const dom = self._getDomForCreature(creature);
                dom.setAttribute('buffs', creature.getBuffs().map((buff)=>buff.toString()).join(' '));
            }, delay);
        }

        this._createDelay(function() {
            GridAnimations.animateEvent(dungeon, self, event);
        });
    }

    update(event) {
        const self = this;
        const grid = this.getDom();
        const dungeon = this._sharedData.getDungeon();

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
    }

    scroll() {
        const grid = this.getDom();
        const dungeon = this._sharedData.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const tile = dungeon.getTile(player);

        const cellDimension = this._tileDimension;
        const halfDimension = this._halfTileDimension;
        const cellOffsetX = tile.getX() * cellDimension + halfDimension;
        const cellOffsetY = tile.getY() * cellDimension + halfDimension;

        grid.scrollTop = cellOffsetY - grid.clientHeight / 2;
        grid.scrollLeft = cellOffsetX - grid.clientWidth / 2;
    }

    getSelectedTileCoordinates() {

    }

    _getDomForCreature(creature) {
        const id = creature.getId();
        const node = this._creatureDoms[id];
        if(node) {
            return node;
        } else {
            const div = document.createElement('div');
            div.setAttribute('data-id', id);
            div.setAttribute('data-creature-name', creature.toString());
            div.classList.add('entity');
            div.classList.add('creature');

            const stats = document.createElement('div');
            stats.classList.add('stats');
            div.appendChild(stats);

            const hp = document.createElement('div');
            hp.classList.add('hp');
            stats.appendChild(hp);

            const actionBar = document.createElement('div');
            actionBar.classList.add('action-bar');
            stats.appendChild(actionBar);

            return this._creatureDoms[id] = div;
        }
    }

    _getDomForItem(item) {
        const id = item.getId();
        const node = this._itemDoms[id];
        if(node) {
            return node;
        } else {
            const div = document.createElement('div');
            div.setAttribute('data-id', id);
            div.setAttribute('data-item-name', item.toString());
            div.classList.add('entity');
            div.classList.add('item');
            div.classList.add('icon');

            return this._itemDoms[id] = div;
        }
    }
}
