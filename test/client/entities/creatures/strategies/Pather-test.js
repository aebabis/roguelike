import { default as Dungeon } from '../../../../../src/client/js/app/dungeons/Dungeon.js';
import { default as Tiles } from '../../../../../src/client/js/app/tiles/Tiles.js';
import { default as PlayableCharacter } from '../../../../../src/client/js/app/entities/creatures/PlayableCharacter.js';
import { default as BlackVoidSphere } from '../../../../../src/client/js/app/entities/creatures/enemies/BlackVoidSphere.js';

import { default as Pather } from '../../../../../src/client/js/app/entities/creatures/strategies/Pather.js';

const expect = require('chai').expect;

function getUDungeon() {
    const dungeon = new Dungeon(3, 3);
    dungeon.setTile(new Tiles.WallTile(dungeon, 1, 0), 1, 0);
    dungeon.setTile(new Tiles.WallTile(dungeon, 1, 1), 1, 1);
    return dungeon;
}

describe.only('Pather', function() {
    it('should attempt to path through unseen tunnels', function() {
        const dungeon = getUDungeon();
        const player = new PlayableCharacter();
        dungeon.moveCreature(player, 0, 0);

        const playerTile = dungeon.getTile(player);
        const targetTile = dungeon.getTile(2, 0);

        const path = Pather.getMoveSequenceToward(dungeon, playerTile, targetTile);
        expect(path).to.be.an('array');
    });

    it('should attempt to path through unseen enemies', function() {
        const dungeon = getUDungeon();
        const player = new PlayableCharacter();
        const enemy = new BlackVoidSphere();
        dungeon.moveCreature(player, 0, 0);
        dungeon.moveCreature(enemy, 2, 1);

        const playerTile = dungeon.getTile(player);
        const targetTile = dungeon.getTile(2, 0);

        const path = Pather.getMoveSequenceToward(dungeon, playerTile, targetTile);
        expect(path).to.be.an('array');
    });
});
