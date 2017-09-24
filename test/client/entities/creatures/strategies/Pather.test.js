import { default as Dungeon } from '../../../../../src/client/js/app/dungeons/Dungeon.js';
import { default as Tiles } from '../../../../../src/client/js/app/tiles/Tiles.js';
import { default as PlayableCharacter } from '../../../../../src/client/js/app/entities/creatures/PlayableCharacter.js';
import { default as BlackVoidSphere } from '../../../../../src/client/js/app/entities/creatures/enemies/BlackVoidSphere.js';

import { default as Pather } from '../../../../../src/client/js/app/entities/creatures/strategies/Pather.js';

const expect = require('chai').expect;
const sinon = require('sinon');

function getUDungeon() {
    const dungeon = new Dungeon(3, 3);
    dungeon.setTile(new Tiles.WallTile(1, 0), 1, 0);
    dungeon.setTile(new Tiles.WallTile(1, 1), 1, 1);
    return dungeon;
}

describe('Pather', function() {
    it('should attempt to path through unknown tiles', function() {
        const dungeon = getUDungeon();
        const player = new PlayableCharacter();
        dungeon.moveCreature(player, 0, 0);

        const targetTile = dungeon.getTile(2, 0);

        const path = Pather.getMoveSequenceToward(dungeon, player, targetTile);
        expect(path).to.equal(null);
    });

    it('should attempt to path through unseen enemies on visited tiles', function() {
        const dungeon = getUDungeon();
        const player = new PlayableCharacter();
        const enemy = new BlackVoidSphere();
        sinon.stub(player, 'hasSeen').callsFake(() => true);
        dungeon.moveCreature(player, 0, 0);
        dungeon.moveCreature(enemy, 2, 1);

        const targetTile = dungeon.getTile(2, 0);

        const path = Pather.getMoveSequenceToward(dungeon, player, targetTile);
        expect(path).to.be.an('array');
    });
});
