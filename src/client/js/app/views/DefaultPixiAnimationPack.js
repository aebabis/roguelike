import Abilities from '../abilities/Abilities';
import GameEvents from '../events/GameEvents';
import Moves from '../entities/creatures/moves/Moves';
import Effects from '../effects/Effects';
import Weapons from '../entities/weapons/Weapons';
import DamageTypes from '../entities/DamageTypes';

import Animation from './animations/Animation';
import AnimationGroup from './animations/AnimationGroup';
import FloatingTextAnimation from './animations/FloatingTextAnimation';
import ProjectileAnimation from './animations/ProjectileAnimation';
import SingleFrameAnimation from './animations/SingleFrameAnimation';
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
        if(gameEvent instanceof GameEvents.PositionChangeEvent) {
            const cause = gameEvent.getCause();
            if(cause instanceof Moves.MovementMove || cause instanceof Effects.KnockbackEffect) {
                const creature = gameEvent.getCreature();
                const duration = creature.getSpeed() * 60 / 1000;
                const from = gameEvent.getFromCoords();
                const to = gameEvent.getToCoords();
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const group = () => pixiDungeonView.getEntityById(creature.getId());
                const animations = [
                    new TransitionAnimation(duration, {
                        group,
                        properties: {
                            x: {start: -(dx * pixiDungeonView.getTileWidth()), end: 0},
                            y: {start: -(dy * pixiDungeonView.getTileWidth()), end: 0}
                        },
                        onStart: () => {
                            pixiDungeonView.moveCreatureGroup(creature, to.x, to.y);
                            [gameEvent.getFromCoords(), gameEvent.getToCoords()].forEach(({x, y}) =>
                                pixiDungeonView.getTileGroup(x, y).update()
                            );
                        }
                    }),
                ];
                if(creature.getFaction() === 'Player') {
                    const viewportAnimation = new Animation();
                    viewportAnimation.advance = () => {
                        const {x, y} = group();
                        const tileWidth = pixiDungeonView.getTileWidth();
                        pixiDungeonView.moveViewport(to.x, to.y, x % tileWidth, y % tileWidth);
                    };
                    animations.push(viewportAnimation);
                }
                return new AnimationGroup(animations);
            } else {
                // TODO: Extract slide animation to an animation factory.
                // Use a fast slide for Leap ability
                pixiDungeonView.updateCreatureLocations();
                pixiDungeonView.moveViewport();
                [gameEvent.getFromCoords(), gameEvent.getToCoords()].forEach(({x, y}) =>
                    pixiDungeonView.getTileGroup(x, y).update()
                );
            }
        } else if(gameEvent instanceof GameEvents.AttackEvent) {
            const weapon = gameEvent.getWeapon();
            if(weapon.isMelee()) {
                // TODO: Slash animation
            } else {
                let spriteName;
                if(weapon instanceof Weapons.Shortbow || weapon instanceof Weapons.Longbow) {
                    spriteName = 'Arrow';
                } else {
                    spriteName = 'Bullet';
                }
                return new ProjectileAnimation(15, {
                    pixiDungeonView,
                    sprite: buildSprite(spriteName),
                    dungeon,
                    attacker: gameEvent.getAttacker(),
                    target: gameEvent.getTarget(),
                });
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
                return new Animation(EXPAND_FRAMES + FADE_FRAMES, {
                    onStart: () => stage.addChild(sprite),
                    onEnd: () => stage.removeChild(sprite),
                    advance: (delta, cumulativeTime) => {
                        if(cumulativeTime < EXPAND_FRAMES) {
                            const scale = MAX_SCALE * Easings.easeIn(cumulativeTime / EXPAND_FRAMES);
                            sprite.scale.set(scale, scale);
                        } else {
                            sprite.scale.set(MAX_SCALE, MAX_SCALE);
                            sprite.alpha = 1 - (cumulativeTime - EXPAND_FRAMES) / FADE_FRAMES;
                        }
                    }
                });
            } else if(ability instanceof Abilities.ForceDart) {
                return new ProjectileAnimation(15, {
                    pixiDungeonView,
                    sprite: buildSprite('ForceDart'),
                    dungeon,
                    attacker: creature,
                    target: tile.getCreature(),
                });
            }
        } else if(gameEvent instanceof GameEvents.DeathEvent) {
            const creature = gameEvent.getCreature();
            const sprite = pixiDungeonView.getEntityById(creature.getId());
            return new Animation(20, {
                onEnd: () => sprite.parent.removeChild(sprite),
                advance: (delta, cumulativeTime, proportion) => {
                    sprite.alpha = 1 - Easings.linear(proportion);
                }
            });
        } else if(gameEvent instanceof GameEvents.ZeroDamageEvent) {
            const creature = gameEvent.getCreature();
            const cause = gameEvent.getCause();
            const tile = dungeon.getTile(creature);
            const x = tile.getX();
            const y = tile.getY();

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

            return new Animation(40, {
                onStart: () => pixiDungeonView.addParticle(text),
                onEnd: () => text.parent.removeChild(text),
                advance: (delta, cumulativeTime, proportion) => {
                    text.y = (endY - startY) * Easings.linear(proportion) + startY;
                }
            });
        } else if(gameEvent instanceof GameEvents.HitpointsEvent) {
            const amount = gameEvent.getAmount();
            const damageType = gameEvent.getDamageType();
            const creature = gameEvent.getCreature();
            const cause = gameEvent.getCause();
            const tile = dungeon.getTile(creature);
            const x = tile.getX();
            const y = tile.getY();

            const hpAnimation = new Animation(0);
            hpAnimation.onStart = () => pixiDungeonView.setCreatureHpBarWidth(
                creature.getId(),
                Math.max(0, creature.getCurrentHP()) / creature.getBaseHP()
            );
            hpAnimation.advance = () => {};

            const animations = [hpAnimation];

            if(amount < 0) {
                const isShifted = (cause instanceof Weapons.FrostDagger || cause instanceof Weapons.LightningRod) &&
                        (damageType === DamageTypes.MELEE_PHYSICAL || damageType === DamageTypes.RANGED_PHYSICAL);
                animations.push(new FloatingTextAnimation(pixiDungeonView, new PIXI.Text(amount, {
                    fontFamily: 'Arial',
                    fontSize: 20,
                    fill: DAMAGE_COLORS[damageType],
                    stroke: DAMAGE_OUTLINE_COLORS[damageType],
                    strokeThickness: 2
                }), {
                    x,
                    y,
                    xOffset: isShifted ? .4 : 0
                }));
            }

            return new AnimationGroup(animations);
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
        } else if(gameEvent instanceof GameEvents.HumanToMoveEvent) {
            return new AnimationGroup(
                dungeon.getCreatures().map(creature => {
                    const speedAnimation = new Animation(0);
                    speedAnimation.onStart = () => pixiDungeonView.setCreatureSpeedBarWidth(
                        creature.getId(),
                        creature.getTimeToNextMove() / creature.getSpeed()
                    );
                    speedAnimation.advance = () => {};
                    return speedAnimation;
                })
            );
        } else if(gameEvent instanceof GameEvents.SpawnEvent) {
            // TODO: Also place creature from here rather than handling it entirely in the PixiDungeonView
            const creature = gameEvent.getCreature();

            return new SingleFrameAnimation(() => {
                pixiDungeonView.moveCreatureGroup(creature, gameEvent.getX(), gameEvent.getY());
                pixiDungeonView.setCreatureHpBarWidth(
                    creature.getId(),
                    Math.max(0, creature.getCurrentHP()) / creature.getBaseHP()
                );
            });
        } else if(gameEvent instanceof GameEvents.TakeItemEvent) {
            return new SingleFrameAnimation(() => {
                pixiDungeonView.removeEntityById(gameEvent.getItem().getId());
            });
        } else if(gameEvent instanceof GameEvents.ItemDropEvent) {
            const tile = gameEvent.getTile();
            const item = gameEvent.getItem();
            return new SingleFrameAnimation(() => {
                pixiDungeonView.moveItemGroup(item, tile.getX(), tile.getY());
            });
        } else if(gameEvent instanceof GameEvents.BuffAppliedEvent) {
            const creature = gameEvent.getCreature();
            const buff = gameEvent.getBuff();
            return new SingleFrameAnimation(() => {
                pixiDungeonView.addStatusIcon(creature.getId(), buff.getId(), buff.toString());
            });
        } else if(gameEvent instanceof GameEvents.BuffEndedEvent) {
            const creature = gameEvent.getCreature();
            const buff = gameEvent.getBuff();
            return new SingleFrameAnimation(() => {
                pixiDungeonView.removeStatusIcon(creature.getId(), buff.getId());
            });
        }
    }
}