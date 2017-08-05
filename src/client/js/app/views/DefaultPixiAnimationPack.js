import Abilities from '../abilities/Abilities.js';
import GameEvents from '../events/GameEvents.js';
import Moves from '../entities/creatures/moves/Moves.js';
import Effects from '../effects/Effects.js';
import Weapons from '../entities/weapons/Weapons.js';
import DamageTypes from '../entities/DamageTypes.js';

import AnimationGroup from './animations/AnimationGroup';
import TransitionAnimation from './animations/TransitionAnimation';

const PIXI = require('pixi.js');
const TextureCache = (PIXI.utils.TextureCache);
const Sprite = PIXI.Sprite;

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

// const MS_PER_TICK = 1;
// const PROJECTILE_SPEED = 10; // Tiles per second

const TILE_WIDTH = 50; // TODO: De-dupe

const Easings = {
    linear: t => t,
    easeIn: (t) => t*t
};

const buildSprite = (textureName) => {
    const sprite = new Sprite(TextureCache[textureName]);
    sprite.width = TILE_WIDTH;
    sprite.height = TILE_WIDTH;
    sprite.anchor.x = sprite.anchor.y = .5;
    return sprite;
};

export default class DefaultPixiAnimationPack {
    getAnimation(sharedData, pixiDungeonView, gameEvent) {
        const dungeon = sharedData.getDungeon();
        const stage = pixiDungeonView.getStage();
        let cumulativeTime = 0;
        if(gameEvent instanceof GameEvents.PositionChangeEvent) {
            const cause = gameEvent.getCause();
            if(cause instanceof Moves.MovementMove || cause instanceof Effects.KnockbackEffect) {
                const MOVE_FRAMES = 20;
                const creature = gameEvent.getCreature();
                const from = gameEvent.getFromCoords();
                const to = gameEvent.getToCoords();
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                return {
                    start: () => {
                        const container = pixiDungeonView.removeEntityById(creature.getId());
                        if(container) {
                            pixiDungeonView.addCreatureSprite(
                                container,
                                to.x,
                                to.y
                            );
                        } else {
                            console.warn('Sprite not there');
                        }
                        [gameEvent.getFromCoords(), gameEvent.getToCoords()].forEach(({x, y}) =>
                            pixiDungeonView.getTileGroup(x, y).update()
                        );
                    },
                    advance: (delta) => {
                        cumulativeTime += delta;
                        const creatureSprite = pixiDungeonView.getEntityById(creature.getId());
                        if(!creatureSprite) {
                            console.warn('No creature sprite found for animation'); // TODO: Prevent other updates from moving sprite
                            return;
                        }
                        if(cumulativeTime > MOVE_FRAMES) {
                            creatureSprite.x = 0;
                            creatureSprite.y = 0;
                            if(creature.getFaction() === 'Player') {
                                pixiDungeonView.moveViewport(to.x, to.y);
                            }
                            return false;
                        } else {
                            const displacement = 1 - Easings.linear(cumulativeTime / MOVE_FRAMES);
                            const xOffset = -dx * displacement * TILE_WIDTH;
                            const yOffset = -dy * displacement * TILE_WIDTH;
                            creatureSprite.x = xOffset;
                            creatureSprite.y = yOffset;
                            if(creature.getFaction() === 'Player') {
                                pixiDungeonView.moveViewport(to.x, to.y, xOffset, yOffset);
                            }
                            return true;
                        }
                    }
                };
            } else {
                // TODO: Extract slide animation to an animation factory.
                // Use a fast slide for Leap ability
                pixiDungeonView.updateCreatureLocations();
                pixiDungeonView.moveViewport();
                [gameEvent.getFromCoords(), gameEvent.getToCoords()].forEach(({x, y}) =>
                    pixiDungeonView.getTileGroup(x, y).update()
                );
            }
        } else if(gameEvent instanceof GameEvents.AbilityEvent) {
            const ability = gameEvent.getAbility();
            const creature = gameEvent.getCreature();
            const tile = gameEvent.getTile();
            if(ability instanceof Abilities.Fireball) {
                const EXPAND_FRAMES = 25;
                const FADE_FRAMES = 15;
                const MAX_SCALE = 2.5;
                const sprite = new Sprite(TextureCache['Fireball']);
                sprite.x = (tile.getX() + .5) * TILE_WIDTH;
                sprite.y = (tile.getY() + .5) * TILE_WIDTH;
                sprite.width = TILE_WIDTH;
                sprite.height = TILE_WIDTH;
                sprite.anchor.x = sprite.anchor.y = .5;
                sprite.scale = 0;
                return {
                    start: () => stage.addChild(sprite),
                    advance: (delta) => {
                        cumulativeTime += delta;
                        if(cumulativeTime < EXPAND_FRAMES) {
                            const scale = MAX_SCALE * Easings.easeIn(cumulativeTime / EXPAND_FRAMES);
                            sprite.scale.set(scale, scale);
                            return true;
                        } else if(cumulativeTime < EXPAND_FRAMES + FADE_FRAMES) {
                            sprite.scale.set(MAX_SCALE, MAX_SCALE);
                            sprite.alpha = 1 - (cumulativeTime - EXPAND_FRAMES) / FADE_FRAMES;
                            return true;
                        } else {
                            stage.removeChild(sprite);
                            return false;
                        }
                    }
                };
            } else if(ability instanceof Abilities.ForceDart) {
                const sprite = buildSprite('ForceDart');
                const startX = () => (dungeon.getTile(creature).getX() + .5) * TILE_WIDTH;
                const startY = () => (dungeon.getTile(creature).getY() + .5) * TILE_WIDTH;
                const endX = () => (tile.getX() + .5) * TILE_WIDTH;
                const endY = () => (tile.getY() + .5) * TILE_WIDTH;
                const rotation = () => Math.atan2(endY() - startY(), endX() - startX());
                return new TransitionAnimation(15, {
                    group: sprite,
                    properties: {
                        x: { start: startX, end: endX },
                        y: { start: startY, end: endY },
                        rotation: { start: rotation, end: rotation }
                    },
                    onStart: () => stage.addChild(sprite),
                    onEnd: () => stage.removeChild(sprite)
                });
            }
        } else if(gameEvent instanceof GameEvents.DeathEvent) {
            const creature = gameEvent.getCreature();
            const location = dungeon.getTile(creature);
            const sprite = pixiDungeonView.getEntityById(creature.getId());
            const FRAMES = 20;
            return {
                start: () => {
                    pixiDungeonView.getTileGroup(location).update();
                },
                advance(delta) {
                    cumulativeTime += delta;
                    if(cumulativeTime > FRAMES) {
                        sprite.parent.removeChild(sprite);
                    } else {
                        sprite.alpha = 1 - Easings.linear(cumulativeTime / FRAMES);
                        return true;
                    }
                }
            };
        } else if(gameEvent instanceof GameEvents.ZeroDamageEvent) {
            const creature = gameEvent.getCreature();
            const cause = gameEvent.getCause();
            const tile = dungeon.getTile(creature);
            const x = tile.getX();
            const y = tile.getY();
            const TIME = 40;

            if((cause instanceof Weapons.FrostDagger || cause instanceof Weapons.LightningRod)) {
                return;
            }

            const text = new PIXI.Text('Blocked', {
                fontFamily: 'Arial',
                fontSize: 10,
                fill: 'white',
                stroke: 'black',
                strokeThickness: 2
            });
            text.x = (x + .1) * TILE_WIDTH;
            const startY = (y + .5) * TILE_WIDTH;
            const endY = y * TILE_WIDTH;
            text.y = startY;
            pixiDungeonView.addParticle(text);

            return {
                start: () => pixiDungeonView.addParticle,
                advance: (delta) => {
                    cumulativeTime += delta;
                    if(cumulativeTime > TIME) {
                        text.parent.removeChild(text);
                    } else {
                        text.y = (endY - startY) * Easings.linear(cumulativeTime / TIME) + startY;
                        return true;
                    }
                }
            };
        } else if(gameEvent instanceof GameEvents.HitpointsEvent) {
            const amount = gameEvent.getAmount();
            const damageType = gameEvent.getDamageType();
            const creature = gameEvent.getCreature();
            const cause = gameEvent.getCause();
            const tile = dungeon.getTile(creature);
            const x = tile.getX();
            const y = tile.getY();
            const TIME = 40;

            if(amount < 0) {
                const text = new PIXI.Text(amount, {
                    fontFamily: 'Arial',
                    fontSize: 20,
                    fill: DAMAGE_COLORS[damageType],
                    stroke: DAMAGE_OUTLINE_COLORS[damageType],
                    strokeThickness: 2
                });
                const isShifted = (cause instanceof Weapons.FrostDagger || cause instanceof Weapons.LightningRod) &&
                        (damageType === DamageTypes.MELEE_PHYSICAL || damageType === DamageTypes.RANGED_PHYSICAL);
                const xShift = isShifted ? .4 : 0;
                text.x = (x + .5 - xShift) * TILE_WIDTH;
                const startY = (y + .5) * TILE_WIDTH;
                const endY = y * TILE_WIDTH;
                text.y = startY;
                pixiDungeonView.addParticle(text);

                return {
                    start: () => pixiDungeonView.addParticle,
                    advance: (delta) => {
                        cumulativeTime += delta;
                        if(cumulativeTime > TIME) {
                            text.parent.removeChild(text);
                        } else {
                            text.y = (endY - startY) * Easings.linear(cumulativeTime / TIME) + startY;
                            return true;
                        }
                    }
                };
            }
        } else if(gameEvent instanceof GameEvents.VisibilityChangeEvent) {
            const newlyHiddenTileCoords = gameEvent.getNewlyHiddenTileCoords();
            const newlyVisibleTileCoords = gameEvent.getNewlyVisibleTileCoords();
            const animation = new AnimationGroup(
                newlyHiddenTileCoords.map(({x, y}) => new TransitionAnimation(20, {
                    group: pixiDungeonView.getTileGroup(x, y),
                    properties: {alpha: {start: 1, end: .5}}
                })).concat(newlyVisibleTileCoords.map(({x, y}) => {
                    const tileGroup = pixiDungeonView.getTileGroup(x, y);
                    return new TransitionAnimation(20, {
                        group: tileGroup,
                        properties: {alpha: {start: () => tileGroup.alpha, end: 1}}
                    });
                }))
            );
            animation.onStart = () => {
                console.log('bleh');
                // TODO: Make this stateless. Don't require VisibilityChangeEvent. Look at movement-type Events
                newlyHiddenTileCoords.forEach(({x, y}) => {
                    pixiDungeonView.getItemContainer(x, y).visible = false;
                    pixiDungeonView.getCreatureContainer(x, y).visible = false;
                });
                newlyVisibleTileCoords.forEach(({x, y}) => {
                    pixiDungeonView.getItemContainer(x, y).visible = true;
                    pixiDungeonView.getCreatureContainer(x, y).visible = true;
                });
            };
            return animation;
        }
    }
}