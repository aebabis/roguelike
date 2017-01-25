import Dungeon from '../dungeons/Dungeon.js';
import GameEvent from '../events/GameEvent.js';
import GameEvents from '../events/GameEvents.js';

import DungeonTooltips from './DungeonTooltips.js';

import DamageTypes from '../entities/DamageTypes.js';

import SharedUIDataController from '../controllers/SharedUIDataController.js';

import Moves from '../entities/creatures/moves/Moves.js';

const PIXI = require('pixi.js');

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

function setDefaultSpriteProps(sprite) {
    sprite.x = 0;
    sprite.y = 0;
    sprite.width = TILE_WIDTH;
    sprite.height = TILE_WIDTH;
    return sprite;
}

function getTileSprite(tile) {
    const TextureCache = (PIXI.utils.TextureCache);
    const Sprite = PIXI.Sprite;
    if(tile.constructor.name === 'DoorTile') {
        if(tile.isOpen()) {
            return new Sprite(TextureCache['DoorOpen']);
        } else {
            return new Sprite(TextureCache['DoorClosed']);
        }
    } if(tile.constructor.name === 'PillarTile') {
        const group = new PIXI.Container();
        const tile = new Sprite(TextureCache['Tile']);
        const pillar = new Sprite(TextureCache['Pillar']);
        setDefaultSpriteProps(tile);
        setDefaultSpriteProps(pillar);
        group.addChild(tile);
        group.addChild(pillar);
        return group;
    } else {
        const texture = TextureCache[tile.constructor.name] || TextureCache['ThisIsAThing'];
        return new Sprite(texture);
    }
}

function getCreatureSprite(creature) {
    return new PIXI.Sprite(PIXI.utils.TextureCache[creature.constructor.name]);
}

export default class PixiDungeonView {
    constructor(sharedData) {
        if(!(sharedData instanceof SharedUIDataController)) {
            throw new Error('First parameter must be a SharedUIDataController');
        }
        const self = this;
        this._sharedData = sharedData;
        this._clickHanders = [];
        this._hoverHandlers = [];
        
        const canvasContainer = this._canvasContainer = document.createElement('div');
        canvasContainer.classList.add('canvas-container');

        const renderer = PIXI.autoDetectRenderer();
        canvasContainer.appendChild(renderer.view);

        PIXI.loader.add('images/spritesheet.json').load(function() {
            const stage = new PIXI.Container();
            stage.backgroundColor = 'gray';

            let tileContainers;
            const entitySprites = {};

            function populateSprites() {
                while(stage.children.length) stage.removeChild(stage.children[0]);

                const dungeon = sharedData.getDungeon();
                tileContainers = new Array(dungeon.getWidth()).fill(0).map(()=>[]);
                
                dungeon.forEachTile(function(tile, x, y) {
                    const tileContainer = getTileContainer(tile);
                    tileContainer.x = x * (TILE_WIDTH + GAP_WIDTH);
                    tileContainer.y = y * (TILE_WIDTH + GAP_WIDTH);
                    tileContainers[x][y] = tileContainer;

                    const creature = tile.getCreature();
                    if(creature) {
                        const creatureSprite = getCreatureSprite(creature);
                        creatureSprite.x = 0;
                        creatureSprite.y = 0;
                        creatureSprite.width = TILE_WIDTH;
                        creatureSprite.height = TILE_WIDTH;
                        entitySprites[creature.getId()] = creatureSprite;
                        tileContainer.children[2].addChild(creatureSprite);
                    }

                    stage.addChild(tileContainer);
                });

                updateVision();
            }

            function updateVision() {
                const dungeon = sharedData.getDungeon();
                const player = dungeon.getPlayableCharacter();
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

            let rangeIndicator;
            function updateRangeIndicator() {
                if(rangeIndicator && rangeIndicator.parent) {
                    rangeIndicator.parent.removeChild(rangeIndicator); // TODO: Is there a remove self function?
                }

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

                rangeIndicator = new PIXI.Graphics();
                
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
                
                stage.addChild(rangeIndicator);
            }

            let hoverIndicator;
            function updateHoverIndicator() {
                if(hoverIndicator && hoverIndicator.parent) {
                    hoverIndicator.parent.removeChild(hoverIndicator);
                }

                const dungeon = sharedData.getDungeon();
                const player = dungeon.getPlayableCharacter();
                const playerLocation = dungeon.getTile(player);

                const tile = sharedData.getInspectedTile(); // TODO: getHoverTile? Make sharedData keep track of mouse vs keyboard?
                if(!tile) {
                    return;
                }
                const { x, y } = tile;

                let color = 0x46465a;

                const abilityIndex = sharedData.getTargettedAbility();
                const itemIndex = sharedData.getTargettedItem();
                if(typeof abilityIndex === 'number') {
                    if(!new Moves.UseAbilityMove(playerLocation, abilityIndex, x, y).getReasonIllegal(dungeon, player)) {
                        color = 0x9400D3;
                    }
                } if(typeof itemIndex === 'number') {
                    if(!new Moves.UseItemMove(playerLocation, itemIndex, dungeon.getTile(x, y)).getReasonIllegal(dungeon, player)) {
                        color = 0x7F00FF;
                    }
                } else if(!new Moves.AttackMove(playerLocation, x, y).getReasonIllegal(dungeon, player)) {
                    color = 0x8b0000;
                }

                hoverIndicator = new PIXI.Graphics();
                hoverIndicator.lineStyle(1, color);
                hoverIndicator.drawRect(
                    x * (TILE_WIDTH + GAP_WIDTH) + 1, y * (TILE_WIDTH + GAP_WIDTH) - GAP_WIDTH, // TODO: Figure out why only 1 of these needs -1
                    TILE_WIDTH + GAP_WIDTH - 1, TILE_WIDTH + GAP_WIDTH - 1
                );
                
                stage.addChild(hoverIndicator);
            }

            function updateCreatureLocations() {
                const dungeon = sharedData.getDungeon();
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

            function updateItems() {
                const dungeon = sharedData.getDungeon();
                dungeon.forEachTile(function(tile, x, y) {
                    const tileContainer = tileContainers[x][y];
                    const itemsContainer = tileContainer.children[1];
                    while(itemsContainer.children.length) itemsContainer.removeChildAt(0);
                    tile.getItems().forEach(function(item) {
                        itemsContainer.addChild(setDefaultSpriteProps(new PIXI.Sprite(PIXI.utils.TextureCache[item.constructor.name])));
                    })
                });
            }

            function scroll() {
                const dungeon = sharedData.getDungeon();
                const player = dungeon.getPlayableCharacter();
                const tile = dungeon.getTile(player);

                const canvasWidth = renderer.view.width;
                const canvasHeight = renderer.view.height;

                const cellDimension = TILE_WIDTH;
                const halfDimension = TILE_WIDTH / 2;
                const playerOffsetX = tile.getX() * cellDimension + halfDimension;
                const playerOffsetY = tile.getY() * cellDimension + halfDimension;

                stage.x = (canvasWidth / 2) - playerOffsetX;
                stage.y = (canvasHeight / 2) - playerOffsetY;
            }

            function populateStage() {
                populateSprites();
                updateItems();
                updateVision();
                renderer.render(stage);
            }

            sharedData.addObserver(function observer(event) {
                if(event instanceof Dungeon){
                    populateStage();
                    document.querySelector('section.game').focus(); //TODO: Make canvas container focusable insted?
                }
                updateHoverIndicator();
            });

            sharedData.addObserver(function observer(event) {
                const dungeon = sharedData.getDungeon();
                if(event instanceof GameEvents.MoveEvent || event instanceof GameEvents.PositionChangeEvent || event instanceof GameEvents.SpawnEvent) {
                    updateVision();
                    updateCreatureLocations();
                    renderer.render(stage);
                } else if(event instanceof GameEvents.DeathEvent) {
                    const creature = event.getCreature();
                    const tile = dungeon.getTile(creature);
                    const x = tile.getX();
                    const y = tile.getY();
                    const tileContainer = tileContainers[x][y].children[2].removeChildAt(0);
                    setTimeout(updateItems); // TODO: Fix with item spawn/drop event
                } else if(event instanceof GameEvents.HitpointsEvent) {
                    /*if(event.getAmount() < 0) {
                        getScrollingText(event.getAmount(), x, y, DAMAGE_COLORS[event.getDamageType()] || 'green', DAMAGE_OUTLINE_COLORS[event.getDamageType()] || 'green')
                            .appendTo(grid.children[0]);
                    }*/
                } else if(event instanceof GameEvents.TakeItemEvent) {
                    updateItems();
                }
                scroll();
                updateRangeIndicator();
                renderer.render(stage);
            });

            scroll();
            updateRangeIndicator();
            renderer.render(stage);
        });

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

            tileSprite.on('click', function(event) {
                self._clickHanders.forEach(function(handler) {
                    handler(x, y);
                });
            }).on('mouseover', function(event) {
                self._hoverHandlers.forEach(function(handler) {
                    handler(x, y);
                });
            });

            tileContainer.addChild(tileSprite);
            tileContainer.addChild(new PIXI.Container());
            tileContainer.addChild(new PIXI.Container());

            return tileContainer;
        }

        function resize() {
            const {clientWidth, clientHeight} = canvasContainer;
            renderer.resize(clientWidth, clientHeight);
        }

        setTimeout(resize);
        window.addEventListener('resize', resize);
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

    onHover(handler) {
        if(typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }
        this._hoverHandlers.push(handler);
    }

    // TODO: HP bar
    // TODO: Cellphone zap
    // TODO: Projectile animations
    // TODO: Show buffs
    // TODO: Item drop event
    // TODO: Tooltips
}
