const PIXI = require('pixi.js');
const TextureCache = (PIXI.utils.TextureCache);
const Sprite = PIXI.Sprite;

const TILE_WIDTH = 50;
const SCROLL_ICON_WIDTH = TILE_WIDTH * .7;

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
}
