import Dungeon from '../dungeons/Dungeon.js';
// import GameEvent from '../events/GameEvent.js';
import GameEvents from '../events/GameEvents.js';

// import DungeonTooltips from './DungeonTooltips.js';

import SharedUIDataController from '../controllers/SharedUIDataController.js';

import Moves from '../entities/creatures/moves/Moves.js';

import DefaultPixiAnimationPack from './DefaultPixiAnimationPack.js';
import DefaultSpritePack from './DefaultSpritePack.js';
import PixiAnimationController from './PixiAnimationController.js';

const PIXI = require('pixi.js');

const TILE_WIDTH = 50;
const GAP_WIDTH = 0;

const STAT_BAR_PADDING = 4;
const STAT_BAR_HEIGHT = 3;

const NEUTRAL_COLOR = 0x46465a;
const ATTACK_MOVE_COLOR = 0x8b0000;
const ITEM_MOVE_COLOR = 0x7F00FF;
const ABILITY_MOVE_COLOR = 0x9400D3;

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
    case SharedUIDataController.TARGETTED_ABILITY_MODE: {
        const abilityIndex = sharedData.getTargettedAbility();
        return new Moves.UseAbilityMove(playerLocation, abilityIndex, x, y)
            .getReasonIllegal(dungeon, player) ?
            NEUTRAL_COLOR : ABILITY_MOVE_COLOR;
    }
    case SharedUIDataController.TARGETTED_ITEM_MODE: {
        const itemIndex = sharedData.getTargettedItem();
        return new Moves.UseItemMove(playerLocation, itemIndex, dungeon.getTile(x, y))
            .getReasonIllegal(dungeon, player) ?
            NEUTRAL_COLOR : ITEM_MOVE_COLOR;
    }
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

export default class PixiDungeonView {
    constructor(
        sharedData,
        spritePack = new DefaultSpritePack()) {
        if(!(sharedData instanceof SharedUIDataController)) {
            throw new Error('First parameter must be a SharedUIDataController');
        }
        this._sharedData = sharedData;
        this._indicators = [];
        this._clickHanders = [];
        this._mouseOverHandlers = [];
        this._mouseOutHandlers = [];

        this.setSpritePack(spritePack);
        
        const canvasContainer = this._canvasContainer = document.createElement('div');
        canvasContainer.classList.add('viewport-container');

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

    init() {
        const stage = this.getStage();

        this._entitySprites = {};

        const sharedData = this._sharedData;
        this._pixiApp.renderer;
        const animationController = this._animationController = new PixiAnimationController(
            sharedData,
            this,
            this._pixiApp,
            new DefaultPixiAnimationPack()
        );

        sharedData.addObserver((event) => {
            if(!event || !sharedData.getDungeon()) {
                return; // TODO: Make mouse events have an event type?
            }
            if(event instanceof Dungeon){
                this.populateStage(stage);
                document.querySelector('section.game').focus(); //TODO: Make canvas container focusable insted?
                this.moveViewport();
                //animationController.flush();
            }
            animationController.handleGameEvent(event);
        });

        sharedData.addObserver((event) => {
            if(!sharedData.getDungeon()) {
                return;
            }
            if(event instanceof GameEvents.SpawnEvent) {
                this.updateCreatureLocations();
                this._tileGroups[event.getX()][event.getY()].update();
            } else if(event instanceof GameEvents.HitpointsEvent) {
                /*if(event.getAmount() < 0) {
                    getScrollingText(event.getAmount(), x, y, DAMAGE_COLORS[event.getDamageType()] || 'green', DAMAGE_OUTLINE_COLORS[event.getDamageType()] || 'green')
                        .appendTo(grid.children[0]);
                }*/
            } else if(event instanceof GameEvents.TakeItemEvent || event instanceof GameEvents.ItemDropEvent) {
                this.updateItems();
            }
            this.updateRangeIndicator();
            this.updateSelectedTileIndicator();
        });
    }
    
    setSpritePack(spritePack) {
        this._spritePack = spritePack;
    }

    getSpritePack() {
        return this._spritePack;
    }

    getStage() {
        return this._pixiApp.stage;
    }

    getTileGroup(param1, param2) {
        let x, y;
        if(param1.getX) {
            x = param1.getX();
            y = param1.getY();
        } else {
            x = param1;
            y = param2;
        }
        return this._tileGroups[x][y];
    }

    getItemContainer(x, y) {
        return this._itemContainers[x][y];
    }

    getCreatureContainer(x, y) {
        return this._creatureContainers[x][y];
    }

    getEntityById(id) {
        return this._entitySprites[id];
    }

    removeEntityById(id) {
        const container = this._entitySprites[id];
        container.parent.removeChild(container);
        return container;
    }

    moveCreatureGroup(creature, x, y) {
        const spritePack = this.getSpritePack();
        const entitySprites = this._entitySprites;
        let sprite = entitySprites[creature.getId()];
        if(!sprite) {
            sprite = entitySprites[creature.getId()] = spritePack.getSpriteStack(
                [creature.constructor.name]
            );
            // HP Bar
            sprite.addChild(new PIXI.Graphics());
            // Speed Bar
            sprite.addChild(new PIXI.Graphics());
        }
        if(sprite.parent) {
            sprite.parent.removeChild(sprite);
        }
        this.getCreatureContainer(x, y).addChild(sprite);
    }

    populateStage() {
        this.populateSprites();
        this.updateCreatureLocations();
        this.updateItems();
        this.updateVision();
    }

    addParticle(particle) {
        this._particleLayer.addChild(particle);
    }
    
    populateSprites() {
        const stage = this.getStage();
        while(stage.children.length) stage.removeChild(stage.children[0]);

        const dungeon = this._sharedData.getDungeon();
        const tileGroups = this._tileGroups = new Array(dungeon.getWidth()).fill(0).map(()=>[]);
        const itemContainers = this._itemContainers = new Array(dungeon.getWidth()).fill(0).map(()=>[]);
        const creatureContainers = this._creatureContainers = new Array(dungeon.getWidth()).fill(0).map(()=>[]);
        
        const tileLayer = this._tileLayer = new PIXI.Container();
        const indicatorLayer = this._indicatorLayer = new PIXI.Container();
        const itemLayer = this._itemLayer = new PIXI.Container();
        const creatureLayer = this._creatureLayer = new PIXI.Container();
        const particleLayer = this._particleLayer = new PIXI.Container();

        dungeon.forEachTile((tile, x, y) => {
            const tileGroup = this.getSpritePack().getTileGroup(tile);
            const xOffset = x * (TILE_WIDTH + GAP_WIDTH);
            const yOffset = y * (TILE_WIDTH + GAP_WIDTH);
            tileGroup.x = xOffset;
            tileGroup.y = yOffset;
            tileGroup.interactive = true;
            tileGroup.hitArea = new PIXI.Rectangle(0, 0, TILE_WIDTH, TILE_WIDTH);
            tileGroups[x][y] = tileGroup;

            tileGroup
                .on('click', () => {
                    this._clickHanders.forEach(handler => handler(x, y));
                }).on('tap', () => {
                    this._clickHanders.forEach(handler => handler(x, y));
                }).on('mouseover', () => {
                    setTimeout(() => { // Ensure mouseout fires first
                        this._mouseOverHandlers.forEach(handler => handler(x, y));
                    });
                }).on('mouseout', () => {
                    this._mouseOutHandlers.forEach(handler => handler(x, y));
                });

            tileLayer.addChild(tileGroup);

            const itemContainer = itemContainers[x][y] = new PIXI.Container();
            itemContainer.x = xOffset;
            itemContainer.y = yOffset;
            itemLayer.addChild(itemContainer);

            const creatureContainer = creatureContainers[x][y] = new PIXI.Container();
            creatureContainer.x = xOffset;
            creatureContainer.y = yOffset;
            creatureLayer.addChild(creatureContainer);
        });

        stage.addChild(tileLayer);
        stage.addChild(indicatorLayer);
        stage.addChild(itemLayer);
        stage.addChild(creatureLayer);
        stage.addChild(particleLayer);
    }

    updateItems() {
        const dungeon = this._sharedData.getDungeon();
        const spritePack = this.getSpritePack();
        // const itemContainers = this._itemContainers;
        dungeon.forEachTile((tile, x, y) => {
            const itemLayer = this.getItemContainer(x, y);
            while(itemLayer.children.length) itemLayer.removeChildAt(0);
            tile.getItems().forEach(function(item) {
                itemLayer.addChild(spritePack.getItemSprite(item));
            });
        });
    }

    updateVision() {
        const dungeon = this._sharedData.getDungeon();
        const player = dungeon.getPlayableCharacter();
        if(player) {
            dungeon.forEachTile((tile, x, y) => {
                const tileGroup = this.getTileGroup(x, y);
                const itemContainer = this.getItemContainer(x, y);
                const creatureContainer = this.getCreatureContainer(x, y);
                const playerCanSeeTile = player.canSee(dungeon, tile);
                if(playerCanSeeTile) {
                    tileGroup.alpha = 1;
                } else if(player.hasSeen(tile)) {
                    tileGroup.alpha = .5;
                } else {
                    tileGroup.alpha = 0;
                }
                itemContainer.visible = creatureContainer.visible = playerCanSeeTile;
            });
        }
    }

    updateCreatureLocations() {
        const dungeon = this._sharedData.getDungeon();
        if(!dungeon) {
            return;
        }
        dungeon.getCreatures().forEach((creature) => {
            const tile = dungeon.getTile(creature);
            this.moveCreatureGroup(creature, tile.getX(), tile.getY());
        });
    }

    setCreatureHpBarWidth(creatureId, proportion) {
        const sprite = this._entitySprites[creatureId];
        const creatureWidth = sprite.children[0].width;
        const graphics = sprite.children[1];

        graphics.clear();
        const maxBarWidth = creatureWidth - 2 * STAT_BAR_PADDING;
        const barWidth = maxBarWidth * proportion;

        graphics.x = STAT_BAR_PADDING;
        graphics.y = STAT_BAR_PADDING;

        graphics.lineStyle(1, 0x660000);
        graphics.drawRect(0, 0, barWidth, STAT_BAR_HEIGHT);
        graphics.beginFill(0x8f0222);
        graphics.drawRect(1, 1, barWidth - 1, STAT_BAR_HEIGHT);
        graphics.endFill();
    }

    setCreatureSpeedBarWidth(creatureId, proportion) {
        const sprite = this._entitySprites[creatureId];
        const creatureWidth = sprite.children[0].width;
        const graphics = sprite.children[2];

        graphics.clear();

        if(creatureId === this._sharedData.getDungeon().getPlayableCharacter().getId()) {
            return;
        }

        const maxBarWidth = creatureWidth - 2 * STAT_BAR_PADDING;
        const barWidth = maxBarWidth * proportion;

        graphics.x = STAT_BAR_PADDING;
        graphics.y = STAT_BAR_PADDING;

        graphics.lineStyle(1, 0xCC7000);
        graphics.drawRect(0, STAT_BAR_HEIGHT + 2, barWidth, STAT_BAR_HEIGHT);
        graphics.beginFill(0xdddd00);
        graphics.drawRect(1, STAT_BAR_HEIGHT + 3, barWidth - 1, STAT_BAR_HEIGHT - 1);
        graphics.endFill();
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
        
        let color;
        if(typeof rangedAttack.isMovementAbility === 'function') {
            color = 0x9400D3;
        } else if(rangedAttack.isTargetted()) {
            color = 0x7F00FF;
        } else {
            color = 0x46465a;
        }

        rangeIndicator = this._rangeIndicator = this._createRangeIndicator(color, rangedAttack.getRange());

        this.getEntityById(player.getId()).addChild(rangeIndicator);
    }

    _createRangeIndicator(color, range) {
        const indicator = new PIXI.Graphics();
        indicator.lineStyle(1, color, 1);

        const targetabilityMap = {};
        for(let x = -range - 2; x <= range + 2; x++) {
            let col = targetabilityMap[x] = {};
            for(let y = -range - 2; y <= range + 2; y++) {
                col[y] = Math.sqrt(x * x + y * y) <= range;
            }
        }

        let tile = {x: 0, y: Math.floor(range)}; // Drawing corner is arbitrarily upper-right of tile
        const tiles = [];
        do {
            tiles.push(tile);
            const {x, y} = tile;
            if(y >= 0) {
                // Try to increase x
                if(targetabilityMap[x + 1][y] !== targetabilityMap[x + 1][y + 1]) {
                    tile = {x: x + 1, y};
                } else if(x >= 0) {
                    tile = {x, y: y - 1};
                } else {
                    tile = {x, y: y + 1};
                }
            } else {
                if(targetabilityMap[x][y] !== targetabilityMap[x][y + 1]) {
                    tile = {x: x - 1, y};
                } else if(x >= 0) {
                    tile = {x, y: y - 1};
                } else {
                    tile = {x, y: y + 1};
                }
            }
        } while(tile.x !== tiles[0].x || tile.y !== tiles[0].y);
        tiles.push(tiles[0]);

        indicator.drawPolygon(
            tiles.map(({x, y}) => ({x: (x + 1) * TILE_WIDTH, y: (y + 1) * TILE_WIDTH}))
                .map(({x, y}) => new PIXI.Point(x > 0 ? x + 1 : x, y <= 0 ? y - 1 : y))
        );
        
        return indicator;
    }

    updateSelectedTileIndicator() {
        const indicatorLayer = this._indicatorLayer;
        while(indicatorLayer.children.length > 0) indicatorLayer.removeChildAt(0);

        const sharedData = this._sharedData;
        // const dungeon = sharedData.getDungeon();
        // const player = dungeon.getPlayableCharacter();
        // const playerLocation = dungeon.getTile(player);

        this._indicators = [
            sharedData.getHoverTile(),
            sharedData.getFocusTile()
        ].filter(Boolean).map((tile) => {
            const x = tile.getX();
            const y = tile.getY();
            const color = getTileColor(sharedData, x, y);
            const indicator = getIndicator(x, y, color);
            indicatorLayer.addChild(indicator);
            return indicator;
        });
    }

    moveViewport(
        x,
        y,
        xOffset = 0,
        yOffset = 0
    ) {
        const sharedData = this._sharedData;
        const stage = this.getStage();
        const dungeon = sharedData.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const tile = dungeon.getTile(player);

        if(typeof x === 'undefined') {
            x = tile.getX();
            y = tile.getY();
        }

        const canvasWidth = this.getDom().firstChild.width;
        const canvasHeight = this.getDom().firstChild.height;

        const cellDimension = TILE_WIDTH;
        const halfDimension = TILE_WIDTH / 2;
        const playerOffsetX = x * cellDimension + halfDimension;
        const playerOffsetY = y * cellDimension + halfDimension;

        stage.x = (canvasWidth / 2) - playerOffsetX - xOffset;
        stage.y = (canvasHeight / 2) - playerOffsetY - yOffset;
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

    getTileWidth() {
        return 50;
    }

    // TODO: Cellphone zap
    // TODO: Projectile animations
    // TODO: Show buffs
    // TODO: Tooltips
    // TODO: Blue outline for movement move
}
