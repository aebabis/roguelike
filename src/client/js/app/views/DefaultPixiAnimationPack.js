import Abilities from '../abilities/Abilities.js';
import GameEvents from '../events/GameEvents.js';
import Moves from '../entities/creatures/moves/Moves.js';

const PIXI = require('pixi.js');
const TextureCache = (PIXI.utils.TextureCache);
const Sprite = PIXI.Sprite;

const MS_PER_TICK = 1;
const PROJECTILE_SPEED = 10; // Tiles per second

const TILE_WIDTH = 50; // TODO: De-dupe

const Easings = {
    linear: t => t,
    easeIn: (t) => t*t
}

export default class DefaultPixiAnimationPack {
    getAnimation(pixiDungeonView, gameEvent) {
        const stage = pixiDungeonView.getStage();
        let cumulativeTime = 0;
        if(gameEvent instanceof GameEvents.PositionChangeEvent) {
            const cause = gameEvent.getCause();
            if(cause instanceof Moves.MovementMove) {
                const MOVE_FRAMES = 20;
                const from = gameEvent.getFromCoords();
                const to = gameEvent.getToCoords();
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const container = pixiDungeonView.getTileContainer(to.x, to.y);
                return {
                    start: () => {
                        const sprite = pixiDungeonView.removeCreatureSprite(from.x, from.y);
                        if(sprite) {
                            pixiDungeonView.addCreatureSprite(
                                sprite,
                                to.x,
                                to.y
                            );
                        } else {
                            console.warn('Sprite not there');
                        }
                        pixiDungeonView.updateVision();
                        [gameEvent.getFromCoords(), gameEvent.getToCoords()].forEach(({x, y}) =>
                            pixiDungeonView.getTileContainer(x, y).update()
                        );
                    },
                    advance: (delta) => {
                        cumulativeTime += delta;
                        const creatureSprite = pixiDungeonView.getCreatureContainer(to.x, to.y).children[0];
                        if(!creatureSprite) {
                            console.warn('No creature sprite found for animation'); // TODO: Prevent other updates from moving sprite
                            return;
                        }
                        let x, y;
                        if(cumulativeTime > MOVE_FRAMES) {
                            creatureSprite.x = 0;
                            creatureSprite.y = 0;
                            return false;
                        } else {
                            const displacement = 1 - Easings.linear(cumulativeTime / MOVE_FRAMES);
                            creatureSprite.x = -dx * displacement * TILE_WIDTH;
                            creatureSprite.y = -dy * displacement * TILE_WIDTH;
                            return true;
                        }
                    }
                }
            } else {
                pixiDungeonView.updateVision();
                pixiDungeonView.updateCreatureLocations();
                [gameEvent.getFromCoords(), gameEvent.getToCoords()].forEach(({x, y}) =>
                    pixiDungeonView.getTileContainer(x, y).update()
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
                    start: stage.addChild(sprite),
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
            }
        }
    }
}