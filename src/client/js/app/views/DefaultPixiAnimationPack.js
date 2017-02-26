import Abilities from '../abilities/Abilities.js';
import GameEvents from '../events/GameEvents.js';

const PIXI = require('pixi.js');
const TextureCache = (PIXI.utils.TextureCache);
const Sprite = PIXI.Sprite;

const MS_PER_TICK = 1;
const PROJECTILE_SPEED = 10; // Tiles per second

const Easings = {
    easeIn: (t) => t*t
}

export default class DefaultPixiAnimationPack {
    getAnimation(pixiDungeonView, gameEvent) {
        const stage = pixiDungeonView.getStage();
        let cumulativeTime = 0;
        if(gameEvent instanceof GameEvents.PositionChangeEvent) {
            pixiDungeonView.updateVision();
            pixiDungeonView.updateCreatureLocations();
            [gameEvent.getFromCoords(), gameEvent.getToCoords()].forEach(({x, y}) =>
                pixiDungeonView.getTileContainer(x, y).update()
            );
        } else if(gameEvent instanceof GameEvents.AbilityEvent) {
            const ability = gameEvent.getAbility();
            const creature = gameEvent.getCreature();
            const tile = gameEvent.getTile();
            const TILE_WIDTH = 50; // TODO: De-dupe
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
                stage.addChild(sprite);
                return (delta) => {
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
                };
            }
        }
    }
}