// import DamageTypes from '../entities/DamageTypes.js';

import SharedUIDataController from '../controllers/SharedUIDataController.js';

import Moves from '../entities/creatures/moves/Moves.js';

const PIXI = require('pixi.js');
const TextureCache = (PIXI.utils.TextureCache);
const Sprite = PIXI.Sprite;

const TILE_WIDTH = 50;
const GAP_WIDTH = 0;
const SCROLL_ICON_WIDTH = TILE_WIDTH * .7;

// const DAMAGE_COLORS = {
//     [DamageTypes.MELEE_PHYSICAL]: 'darkred',
//     [DamageTypes.RANGED_PHYSICAL]: 'darkred',
//     [DamageTypes.FIRE]: 'orange',
//     [DamageTypes.COLD]: 'darkblue',
//     [DamageTypes.ELECTRICAL]: 'yellow',
//     [DamageTypes.ENERGY]: 'white',
//     [DamageTypes.POISON]: 'emerald'
// };

// const DAMAGE_OUTLINE_COLORS = {
//     [DamageTypes.MELEE_PHYSICAL]: 'pink',
//     [DamageTypes.RANGED_PHYSICAL]: 'pink',
//     [DamageTypes.FIRE]: 'darkred',
//     [DamageTypes.COLD]: 'skyblue',
//     [DamageTypes.ELECTRICAL]: 'orange',
//     [DamageTypes.ENERGY]: 'yellow',
//     [DamageTypes.POISON]: 'darkgreen'
// };

const NEUTRAL_COLOR = 0x46465a;
const ATTACK_MOVE_COLOR = 0x8b0000;
const ITEM_MOVE_COLOR = 0x7F00FF;
const ABILITY_MOVE_COLOR = 0x9400D3;

export default class DefaultSpritePack {
    constructor() {
    }

    getSprite(name) {
        const sprite = new Sprite(TextureCache[name] || TextureCache['ThisIsAThing']);
        sprite.x = 0;
        sprite.y = 0;
        sprite.width = TILE_WIDTH;
        sprite.height = TILE_WIDTH;
        return sprite;
    }

    getSpriteStack(spriteNames) {
        const group = new PIXI.Container();
        spriteNames.forEach((spriteName) => { // TODO: Shift stack instead
            group.addChild(this.getSprite(spriteName));
        });
        return group;
    }

    getTileSprite(tile) {
        let tileDisp;
        if(tile.constructor.name === 'DoorTile') {
            if(tile.isOpen()) {
                tileDisp = this.getSpriteStack(['Tile', 'DoorOpen']);
            } else {
                tileDisp = this.getSprite('DoorClosed');
            }
        } else if(tile.constructor.name === 'EntranceTile') {
            tileDisp = this.getSpriteStack(['Tile', 'Ladder']);
        } else if(tile.constructor.name === 'PillarTile') {
            tileDisp = this.getSpriteStack(['Tile', 'Pillar']);
        } else {
            tileDisp = this.getSprite(tile.constructor.name);
        }
        const group = new PIXI.Container();
        group.addChild(tileDisp);
        return group;
    }

    getItemSprite(item) {
        if(item.constructor.name === 'AbilityConsumable') {
            const abilityName = item.getAbility().constructor.name;
            const group = new PIXI.Container();
            const scrollImage = this.getSprite('Scroll');
            const spellImage = this.getSprite(abilityName);
            spellImage.x = spellImage.y = TILE_WIDTH / 2;
            spellImage.width = spellImage.height = SCROLL_ICON_WIDTH;
            spellImage.anchor.x = spellImage.anchor.y = .5;
            spellImage.rotation = -Math.PI / 8;
            group.addChild(scrollImage);
            group.addChild(spellImage);
            return group;
        } else {
            return this.getSprite(item.constructor.name);
        }
    }

    getTileGroup(tile) {
        const tileContainer = new PIXI.Container(); // TODO: Look at ParticleContainer

        tileContainer.update = () => {
            while(tileContainer.children.length) tileContainer.removeChildAt(0);
            tileContainer.addChild(this.getTileSprite(tile));
        };

        tileContainer.update();

        return tileContainer;
    }

    updateStatBars() {
        const dungeon = this._sharedData.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const entitySprites = this._entitySprites; // TODO: Getter
        
        dungeon.getCreatures().forEach(function(creature) {
            const sprite = entitySprites[creature.getId()];
            if(sprite) {
                const creatureWidth = sprite.children[0].width;
                const statGraphics = sprite.children[1];

                statGraphics.clear();
                const padding = 4;
                const maxBarWidth = creatureWidth - 2 * padding;
                const barHeight = 3;

                const hpBarWidth = maxBarWidth * Math.max(0, creature.getCurrentHP()) / creature.getBaseHP();
                const actionBarWidth = maxBarWidth * creature.getTimeToNextMove() / creature.getSpeed();

                statGraphics.x = padding;
                statGraphics.y = padding;

                statGraphics.lineStyle(1, 0x660000);
                statGraphics.drawRect(0, 0, hpBarWidth, barHeight);
                statGraphics.beginFill(0x8f0222);
                statGraphics.drawRect(1, 1, hpBarWidth - 1, barHeight);
                statGraphics.endFill();

                if(creature === player) {
                    return;
                }

                statGraphics.lineStyle(1, 0xCC7000);
                statGraphics.drawRect(0, barHeight + 2, actionBarWidth, barHeight);
                statGraphics.beginFill(0xdddd00);
                statGraphics.drawRect(1, barHeight + 3, actionBarWidth - 1, barHeight - 1);
                statGraphics.endFill();
            }
        });
    }
}
