import Abilities from '../abilities/Abilities.js';
import GameEvents from '../events/GameEvents.js';

const PIXI = require('pixi.js');
const TextureCache = (PIXI.utils.TextureCache);
const Sprite = PIXI.Sprite;

const MS_PER_TICK = 1;
const PROJECTILE_SPEED = 10; // Tiles per second

export default class DefaultPixiAnimationPack {
    getAnimation(gameEvent, stage) {
        let cumulativeTime = 0;
        if(gameEvent instanceof GameEvents.AbilityEvent) {
            const ability = gameEvent.getAbility();
            const creature = gameEvent.getCreature();
            const tile = gameEvent.getTile();
            const TILE_WIDTH = 50; // TODO: De-dupe
            if(ability instanceof Abilities.Fireball) {
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
                    let size = cumulativeTime / 10;
                    if(size > 2.5) {
                        stage.removeChild(sprite);
                        return false;
                    }
                    sprite.scale.set(size, size);
                    return true;
                };
            }
        }
    }
}