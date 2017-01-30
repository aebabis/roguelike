import Dungeon from '../dungeons/Dungeon.js';
import GameEvent from '../events/GameEvent.js';
import GameEvents from '../events/GameEvents.js';

import DungeonTooltips from './DungeonTooltips.js';

import DamageTypes from '../entities/DamageTypes.js';

import SharedUIDataController from '../controllers/SharedUIDataController.js';

import Moves from '../entities/creatures/moves/Moves.js';

const PIXI = require('pixi.js');
const TextureCache = (PIXI.utils.TextureCache);
const Sprite = PIXI.Sprite;

const TILE_WIDTH = 50;
const GAP_WIDTH = 0;

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

const NEUTRAL_COLOR = 0x46465a;
const ATTACK_MOVE_COLOR = 0x8b0000;
const ITEM_MOVE_COLOR = 0x7F00FF;
const ABILITY_MOVE_COLOR = 0x9400D3;

function setDefaultSpriteProps(sprite) {
    sprite.x = 0;
    sprite.y = 0;
    sprite.width = TILE_WIDTH;
    sprite.height = TILE_WIDTH;
    return sprite;
}

function getSpriteStack(spriteNames) {
    const group = new PIXI.Container();
    spriteNames.forEach(function(spriteName) {
        group.addChild(
            setDefaultSpriteProps(
                new Sprite(TextureCache[spriteName])
            )
        );
    });
    return group;
}

function getContainerWrapping(obj) {
    const group = new PIXI.Container();
    group.addChild(obj);
    return group;
}

function getTileSprite(tile) {
    let tileDisp;
    if(tile.constructor.name === 'DoorTile') {
        if(tile.isOpen()) {
            tileDisp = getSpriteStack(['Tile', 'DoorOpen']);
        } else {
            tileDisp = new Sprite(TextureCache['DoorClosed']);
        }
    } else if(tile.constructor.name === 'EntranceTile') {
        tileDisp = getSpriteStack(['Tile', 'Ladder']);
    } else if(tile.constructor.name === 'PillarTile') {
        tileDisp = getSpriteStack(['Tile', 'Pillar']);
    } else {
        const texture = TextureCache[tile.constructor.name] || TextureCache['ThisIsAThing'];
        tileDisp = new Sprite(texture);
    }
    return getContainerWrapping(tileDisp);
}

function getCreatureSprite(creature) {
    return getContainerWrapping(
        new PIXI.Sprite(PIXI.utils.TextureCache[creature.constructor.name])
    );
}

function getTileColor(sharedData, x, y) {
    const dungeon = sharedData.getDungeon();
    const player = dungeon.getPlayableCharacter();
    const playerLocation = dungeon.getTile(player);

    switch(sharedData.getMode()) {
        case SharedUIDataController.EXAMINE_MODE:
            return NEUTRAL_COLOR;
        case SharedUIDataController.ATTACK_MODE:
            return new Moves.AttackMove(playerLocation, x, y)
                .getReasonIllegal(dungeon, player) ?
                NEUTRAL_COLOR : ATTACK_MOVE_COLOR;
        case SharedUIDataController.TARGETTED_ABILITY_MODE:
            const abilityIndex = sharedData.getTargettedAbility();
            return new Moves.UseAbilityMove(playerLocation, abilityIndex, x, y)
                .getReasonIllegal(dungeon, player) ?
                NEUTRAL_COLOR : ABILITY_MOVE_COLOR;
        case SharedUIDataController.TARGETTED_ITEM_MODE:
            const itemIndex = sharedData.getTargettedItem();
            return new Moves.UseItemMove(playerLocation, itemIndex, dungeon.getTile(x, y))
                .getReasonIllegal(dungeon, player) ?
                NEUTRAL_COLOR : ITEM_MOVE_COLOR;
        case SharedUIDataController.NEUTRAL_MODE:
            return new Moves.AttackMove(playerLocation, x, y)
                .getReasonIllegal(dungeon, player) ?
                NEUTRAL_COLOR : ATTACK_MOVE_COLOR;
        default:
            throw new Error('This should never happen');
    }
}

function getIndicator(x, y, color) {
    const indicator = new PIXI.Graphics();
    indicator.lineStyle(1, color);
    indicator.drawRect(
        x * (TILE_WIDTH + GAP_WIDTH) + 1, y * (TILE_WIDTH + GAP_WIDTH),
        TILE_WIDTH + GAP_WIDTH - 1, TILE_WIDTH + GAP_WIDTH - 1
    );
    return indicator;
}

function getTileContainer(tile) {
    const tileContainer = new PIXI.Container(); // TODO: Look at ParticleContainer
    const tileSprite = getTileSprite(tile);
    const x = tile.getX();
    const y = tile.getY();

    tileSprite.x = 0;
    tileSprite.y = 0;
    tileSprite.width = TILE_WIDTH;
    tileSprite.height = TILE_WIDTH;
    tileSprite.interactive = true;

    tileContainer.addChild(tileSprite);
    tileContainer.addChild(new PIXI.Container());
    tileContainer.addChild(new PIXI.Container());

    return tileContainer;
}

export default class PixiDungeonView {
    constructor(sharedData) {
        if(!(sharedData instanceof SharedUIDataController)) {
            throw new Error('First parameter must be a SharedUIDataController');
        }
        const self = this;
        this._sharedData = sharedData;
        this._indicators = [];
        this._clickHanders = [];
        this._mouseOverHandlers = [];
        this._mouseOutHandlers = [];
        
        const canvasContainer = this._canvasContainer = document.createElement('div');
        canvasContainer.classList.add('canvas-container');

        const renderer = this._renderer = PIXI.autoDetectRenderer();
        canvasContainer.appendChild(renderer.view);

        PIXI.loader.add('images/spritesheet.json').load(() => this.init());

        function resize() {
            const {clientWidth, clientHeight} = canvasContainer;
            renderer.resize(clientWidth, clientHeight);
        }

        setTimeout(resize);
        window.addEventListener('resize', resize);
    }

    init() {
        const stage = this._stage = new PIXI.Container();

        const entitySprites = this._entiteSprites = {};

        const sharedData = this._sharedData;
        const renderer = this._renderer;

        sharedData.addObserver((event) => {
            if(event instanceof Dungeon){
                this.populateStage(stage);
                document.querySelector('section.game').focus(); //TODO: Make canvas container focusable insted?
            }
        });

        sharedData.addObserver((event) => {
            const dungeon = sharedData.getDungeon();
            if(event instanceof GameEvents.MoveEvent || event instanceof GameEvents.PositionChangeEvent || event instanceof GameEvents.SpawnEvent) {
                this.updateVision();
                this.updateCreatureLocations();
                this.scrollToPlayer();
            } else if(event instanceof GameEvents.DeathEvent) {
                const creature = event.getCreature();
                const tile = dungeon.getTile(creature);
                const x = tile.getX();
                const y = tile.getY();
                const tileContainer = this._tileContainers[x][y].children[2].removeChildAt(0);
                //setTimeout(updateItems); // TODO: Fix with item spawn/drop event
            } else if(event instanceof GameEvents.HitpointsEvent) {
                /*if(event.getAmount() < 0) {
                    getScrollingText(event.getAmount(), x, y, DAMAGE_COLORS[event.getDamageType()] || 'green', DAMAGE_OUTLINE_COLORS[event.getDamageType()] || 'green')
                        .appendTo(grid.children[0]);
                }*/
            } else if(event instanceof GameEvents.TakeItemEvent) {
                this.updateItems();
            }
            this.scrollToPlayer();
            this.updateRangeIndicator();
            this.updateSelectedTileIndicator();
            renderer.render(stage);
        });

        renderer.render(stage);
    }

    populateStage(stage) {
        this.populateSprites(stage);
        this.updateCreatureLocations();
        this.updateItems();
        this.updateVision();
        this._renderer.render(stage);
    }
    
    populateSprites(stage) {
        const self = this;
        while(stage.children.length) stage.removeChild(stage.children[0]);

        const dungeon = this._sharedData.getDungeon();
        const tileContainers = this._tileContainers = new Array(dungeon.getWidth()).fill(0).map(()=>[]);
        const entitySprites = this._entiteSprites;
        
        dungeon.forEachTile(function(tile, x, y) {
            const tileContainer = getTileContainer(tile);
            tileContainer.x = x * (TILE_WIDTH + GAP_WIDTH);
            tileContainer.y = y * (TILE_WIDTH + GAP_WIDTH);
            tileContainers[x][y] = tileContainer;

            tileContainer.children[0].on('click', function(event) {
                self._clickHanders.forEach(function(handler) {
                    handler(x, y);
                });
            }).on('mouseover', function(event) {
                setTimeout(function() { // Ensure mouseout fires first
                    self._mouseOverHandlers.forEach(function(handler) {
                        handler(x, y);
                    });
                });
            }).on('mouseout', function(event) {
                self._mouseOutHandlers.forEach(function(handler) {
                    handler(x, y);
                });
            });

            stage.addChild(tileContainer);
        });
    }

    updateItems() {
        const dungeon = this._sharedData.getDungeon();
        const tileContainers = this._tileContainers;
        dungeon.forEachTile(function(tile, x, y) {
            const tileContainer = tileContainers[x][y];
            const itemsContainer = tileContainer.children[1];
            while(itemsContainer.children.length) itemsContainer.removeChildAt(0);
            tile.getItems().forEach(function(item) {
                itemsContainer.addChild(setDefaultSpriteProps(new PIXI.Sprite(PIXI.utils.TextureCache[item.constructor.name])));
            })
        });
    }

    updateVision() {
        const dungeon = this._sharedData.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const tileContainers = this._tileContainers;
        if(player) {
            dungeon.forEachTile(function(tile, x, y) {
                const creature = tile.getCreature();
                const tileContainer = tileContainers[x][y];
                const [tileSprite, itemContainer, creatureContainer] = tileContainer.children;
                const playerCanSeeTile = player.canSee(dungeon, tile);
                if(playerCanSeeTile) {
                    tileContainer.alpha = 1;
                } else if(player.hasSeen(tile)) {
                    tileContainer.alpha = .5;
                } else {
                    tileContainer.alpha = 0;
                }
                itemContainer.visible = creatureContainer.visible = playerCanSeeTile;
            });
        }
    }

    updateCreatureLocations() {
        const dungeon = this._sharedData.getDungeon();
        const entitySprites = this._entiteSprites; // TODO: Getter
        const tileContainers = this._tileContainers;
        dungeon.getCreatures().forEach(function(creature) {
            const sprite = entitySprites[creature.getId()] || 
                    (entitySprites[creature.getId()] = setDefaultSpriteProps(getCreatureSprite(creature)));
            if(sprite.parent) {
                sprite.parent.removeChild(sprite);
            }
            if(!creature.isDead()) {
                const tile = dungeon.getTile(creature);
                tileContainers[tile.getX()][tile.getY()].children[2].addChild(sprite);
            }
        })
    }

    updateRangeIndicator() {
        let rangeIndicator = this._rangeIndicator;
        if(rangeIndicator && rangeIndicator.parent) {
            rangeIndicator.parent.removeChild(rangeIndicator); // TODO: Is there a remove self function?
        }

        const sharedData = this._sharedData;
        const dungeon = sharedData.getDungeon();
        const player = dungeon.getPlayableCharacter();
        let rangedAttack;
        if(typeof sharedData.getTargettedAbility() === 'number') {
            rangedAttack = player.getAbility(sharedData.getTargettedAbility());
        } else if(typeof sharedData.getTargettedItem() === 'number') {
            rangedAttack = player.getInventory().getItem(sharedData.getTargettedItem());
        } else {
            rangedAttack = player.getRangedWeapon();
        }
        if(!rangedAttack) {
            return;
        }

        rangeIndicator = this._rangeIndicator = new PIXI.Graphics();
        
        let color;
        if(typeof rangedAttack.isMovementAbility === 'function') {
            color = 0x9400D3;
        } else if(rangedAttack.isTargetted()) {
            color = 0x7F00FF;
        } else {
            color = 0x46465a;
        }

        const playerTile = dungeon.getTile(player);
        rangeIndicator.lineStyle(1, color, 1);
        rangeIndicator.drawCircle(
            (playerTile.getX() + .5) * TILE_WIDTH,
            (playerTile.getY() + .5) * TILE_WIDTH,
            rangedAttack.getRange() * TILE_WIDTH
        );
        
        this._stage.addChild(rangeIndicator);
    }

    updateSelectedTileIndicator() {
        this._indicators.forEach((indicator) => {
            if(indicator.parent) {
                indicator.parent.removeChild(indicator);
            }
        });

        const sharedData = this._sharedData;
        const dungeon = sharedData.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const playerLocation = dungeon.getTile(player);

        this._indicators = [
            sharedData.getHoverTile(),
            sharedData.getFocusTile()
        ].filter(Boolean).map((tile) => {
            const x = tile.getX();
            const y = tile.getY();
            const color = getTileColor(sharedData, x, y);
            const indicator = getIndicator(x, y, color);
            this._stage.addChild(indicator);
            return indicator;
        });
    }

    scrollToPlayer() {
        const sharedData = this._sharedData;
        const stage = this._stage;
        const dungeon = sharedData.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const tile = dungeon.getTile(player);

        const canvasWidth = this.getDom().firstChild.width;
        const canvasHeight = this.getDom().firstChild.height;

        const cellDimension = TILE_WIDTH;
        const halfDimension = TILE_WIDTH / 2;
        const playerOffsetX = tile.getX() * cellDimension + halfDimension;
        const playerOffsetY = tile.getY() * cellDimension + halfDimension;

        stage.x = (canvasWidth / 2) - playerOffsetX;
        stage.y = (canvasHeight / 2) - playerOffsetY;
    }

    getDom() {
        return this._canvasContainer;
    }

    onClick(handler) {
        if(typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }
        this._clickHanders.push(handler);
    }

    onMouseOver(handler) {
        if(typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }
        this._mouseOverHandlers.push(handler);
    }

    onMouseOut(handler) {
        if(typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }
        this._mouseOutHandlers.push(handler);
    }

    // TODO: HP bar
    // TODO: Cellphone zap
    // TODO: Projectile animations
    // TODO: Show buffs
    // TODO: Item drop event
    // TODO: Tooltips
}
