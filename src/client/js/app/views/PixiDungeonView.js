import Dungeon from '../dungeons/Dungeon.js';
import GameEvent from '../events/GameEvent.js';
import GameEvents from '../events/GameEvents.js';

import DungeonTooltips from './DungeonTooltips.js';

import DamageTypes from '../entities/DamageTypes.js';

import SharedUIDataController from '../controllers/SharedUIDataController.js';

import Moves from '../entities/creatures/moves/Moves.js';

import DefaultPixiAnimationPack from './DefaultPixiAnimationPack.js';
import PixiAnimationController from './PixiAnimationController.js';

const PIXI = require('pixi.js');
const TextureCache = (PIXI.utils.TextureCache);
const Sprite = PIXI.Sprite;

const TILE_WIDTH = 50;
const GAP_WIDTH = 0;
const SCROLL_ICON_WIDTH = TILE_WIDTH * .7;

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

function getSprite(name) {
    return setDefaultSpriteProps(
        new Sprite(TextureCache[name] || TextureCache['ThisIsAThing'])
    );
}

function getSpriteStack(spriteNames) {
    const group = new PIXI.Container();
    spriteNames.forEach(function(spriteName) { // TODO: Shift stack instead
        group.addChild(getSprite(spriteName));
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
            tileDisp = getSprite('DoorClosed');
        }
    } else if(tile.constructor.name === 'EntranceTile') {
        tileDisp = getSpriteStack(['Tile', 'Ladder']);
    } else if(tile.constructor.name === 'PillarTile') {
        tileDisp = getSpriteStack(['Tile', 'Pillar']);
    } else {
        tileDisp = getSprite(tile.constructor.name);
    }
    return getContainerWrapping(tileDisp);
}

function getCreatureSprite(creature) {
    return getContainerWrapping(
        new Sprite(TextureCache[creature.constructor.name])
    );
}

function getItemSprite(item) {
    if(item.constructor.name === 'AbilityConsumable') {
        const abilityName = item.getAbility().constructor.name;
        const group = new PIXI.Container();
        const scrollImage = getSprite('Scroll');
        const spellImage = getSprite(abilityName);
        spellImage.x = spellImage.y = TILE_WIDTH / 2;
        spellImage.width = spellImage.height = SCROLL_ICON_WIDTH;
        spellImage.anchor.x = spellImage.anchor.y = .5;
        spellImage.rotation = -Math.PI / 8;
        group.addChild(scrollImage);
        group.addChild(spellImage);
        return group;
    } else {
        return getSprite(item.constructor.name);
    };
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

    tileContainer.addChild(new PIXI.Container());
    tileContainer.addChild(new PIXI.Container());
    tileContainer.addChild(new PIXI.Container());

    tileContainer.update = () => {
        const spriteContainer = tileContainer.children[0];
        while(spriteContainer.children.length) spriteContainer.removeChildAt(0);
        spriteContainer.addChild(getTileSprite(tile));
    }

    tileContainer.update();

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

        const pixiApp = this._pixiApp = new PIXI.Application();
        canvasContainer.appendChild(pixiApp.view);

        PIXI.loader.add('images/spritesheet.json').load(() => this.init());

        function resize() {
            const {clientWidth, clientHeight} = canvasContainer;
            pixiApp.renderer.resize(clientWidth, clientHeight);
        }

        setTimeout(resize);
        window.addEventListener('resize', resize);
    }

    getStage() {
        return this._pixiApp.stage;
    }

    init() {
        const stage = this.getStage();

        const entitySprites = this._entiteSprites = {};

        const sharedData = this._sharedData;
        const renderer = this._pixiApp.renderer;
        const animationController = this._animationController = new PixiAnimationController(
            this._pixiApp,
            new DefaultPixiAnimationPack()
        );

        sharedData.addObserver((event) => {
            if(!event) {
                return; // TODO: Make mouse events have an event type?
            }
            if(event instanceof Dungeon){
                this.populateStage(stage);
                document.querySelector('section.game').focus(); //TODO: Make canvas container focusable insted?
                //animationController.flush();
            } else {
                animationController.handleGameEvent(event);
            }
        });

        sharedData.addObserver((event) => {
            const dungeon = sharedData.getDungeon();
            if(event instanceof GameEvents.PositionChangeEvent) {
                this.updateVision();
                this.updateCreatureLocations();
                [event.getFromCoords(), event.getToCoords()].forEach(({x, y}) =>
                    this._tileContainers[x][y].update()
                );
            } else if(event instanceof GameEvents.SpawnEvent) {
                this.updateCreatureLocations();
                this._tileContainers[event.getX()][event.getY()].update();
            } else if(event instanceof GameEvents.DeathEvent) {
                const creature = event.getCreature();
                const tile = dungeon.getTile(creature);
                const x = tile.getX();
                const y = tile.getY();
                const tileContainer = this._tileContainers[x][y];
                tileContainer.children[2].removeChildAt(0);
                tileContainer.update();
                //setTimeout(updateItems); // TODO: Fix with item spawn/drop event
            } else if(event instanceof GameEvents.HitpointsEvent) {
                /*if(event.getAmount() < 0) {
                    getScrollingText(event.getAmount(), x, y, DAMAGE_COLORS[event.getDamageType()] || 'green', DAMAGE_OUTLINE_COLORS[event.getDamageType()] || 'green')
                        .appendTo(grid.children[0]);
                }*/
            } else if(event instanceof GameEvents.TakeItemEvent || event instanceof GameEvents.ItemDropEvent) {
                this.updateItems();
            }
            this.scrollToPlayer();
            this.updateStatBars();
            this.updateRangeIndicator();
            this.updateSelectedTileIndicator();
        });
    }

    populateStage() {
        this.populateSprites();
        this.updateCreatureLocations();
        this.updateItems();
        this.updateVision();
    }
    
    populateSprites() {
        const stage = this.getStage();
        while(stage.children.length) stage.removeChild(stage.children[0]);

        const dungeon = this._sharedData.getDungeon();
        const tileContainers = this._tileContainers = new Array(dungeon.getWidth()).fill(0).map(()=>[]);
        const entitySprites = this._entiteSprites;
        
        dungeon.forEachTile((tile, x, y) => {
            const tileContainer = getTileContainer(tile);
            tileContainer.x = x * (TILE_WIDTH + GAP_WIDTH);
            tileContainer.y = y * (TILE_WIDTH + GAP_WIDTH);
            tileContainer.interactive = true;
            tileContainer.hitArea = new PIXI.Rectangle(0, 0, TILE_WIDTH, TILE_WIDTH);
            tileContainers[x][y] = tileContainer;

            tileContainer
            .on('click', (event) => {
                this._clickHanders.forEach(handler => handler(x, y));
            }).on('tap', (event) => {
                this._clickHanders.forEach(handler => handler(x, y));
            }).on('mouseover', (event) => {
                setTimeout(() => { // Ensure mouseout fires first
                    this._mouseOverHandlers.forEach(handler => handler(x, y));
                });
            }).on('mouseout', (event) => {
                this._mouseOutHandlers.forEach(handler => handler(x, y));
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
                itemsContainer.addChild(getItemSprite(item));
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
            let sprite = entitySprites[creature.getId()];
            if(!sprite) {
                sprite = entitySprites[creature.getId()] = setDefaultSpriteProps(getCreatureSprite(creature));
                sprite.addChild(new PIXI.Graphics());
            }
            if(sprite.parent) {
                sprite.parent.removeChild(sprite);
            }
            if(!creature.isDead()) {
                const tile = dungeon.getTile(creature);
                tileContainers[tile.getX()][tile.getY()].children[2].addChild(sprite);
            }
        })
    }

    updateStatBars() {
        const dungeon = this._sharedData.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const entitySprites = this._entiteSprites; // TODO: Getter
        const tileContainers = this._tileContainers;
        
        dungeon.getCreatures().forEach(function(creature) {
            const sprite = entitySprites[creature.getId()];
            if(sprite) {
                const creatureWidth = sprite.children[0].width;
                const statGraphics = sprite.children[1];

                statGraphics.clear();
                const padding = 4;
                const maxBarWidth = creatureWidth - 2 * padding;
                const barHeight = 6;

                const hpBarWidth = maxBarWidth * creature.getCurrentHP() / creature.getBaseHP();
                const actionBarWidth = maxBarWidth * creature.getTimeToNextMove() / creature.getSpeed();

                statGraphics.lineStyle(1, 0x660000);
                statGraphics.drawRect(padding, padding, hpBarWidth, barHeight);
                statGraphics.beginFill(0x8f0222);
                statGraphics.drawRect(padding + 1, padding + 1, hpBarWidth - 2, barHeight);
                statGraphics.endFill();

                if(creature === player) {
                    return;
                }

                statGraphics.lineStyle(1, 0xCC7000);
                statGraphics.drawRect(padding, padding + barHeight + 2, actionBarWidth, barHeight);
                statGraphics.beginFill(0xdddd00);
                statGraphics.drawRect(padding + 1, padding + barHeight + 3, actionBarWidth - 2, barHeight - 1);
                statGraphics.endFill();
            }
        });
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
        
        this.getStage().addChild(rangeIndicator);
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
            this.getStage().addChild(indicator);
            return indicator;
        });
    }

    scrollToPlayer() {
        const sharedData = this._sharedData;
        const stage = this.getStage();
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

    // TODO: Cellphone zap
    // TODO: Projectile animations
    // TODO: Show buffs
    // TODO: Tooltips
    // TODO: Blue outline for movement move
}
