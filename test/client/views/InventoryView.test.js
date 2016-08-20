import Dungeon  from '../../../src/client/js/app/dungeons/Dungeon.js';
import PlayableCharacter from '../../../src/client/js/app/entities/creatures/PlayableCharacter.js';
import Moves from '../../../src/client/js/app/entities/creatures/moves/Moves.js';
import Slingshot from '../../../src/client/js/app/entities/weapons/Slingshot.js';

import GraphicalViewSharedData from '../../../src/client/js/app/controllers/GraphicalViewSharedData.js';
import InventoryView from '../../../src/client/js/app/views/InventoryView.js';

var expect = require('chai').expect;

describe('InventoryView', function() {
    it('should update when a player picks up an item', function() {
        const dungeon = new Dungeon(2, 2);
        dungeon.setCreature(new PlayableCharacter(), 0, 0);
        dungeon.getTile(1, 1).addItem(new Slingshot());

        const sharedData = new GraphicalViewSharedData(dungeon);
        const view = new InventoryView(sharedData);

        const showedSlingshot = !!view.getDom().querySelector('.slot.item');
        dungeon.getPlayableCharacter().setNextMove(new Moves.MovementMove(dungeon.getTile(dungeon.getPlayableCharacter()), 1, 1));
        dungeon.resolveUntilBlocked();
        const showsSlingshot = !!view.getDom().querySelector('.slot.item');

        expect(showedSlingshot).to.equal(false);
        expect(showsSlingshot).to.equal(true);
    });
});
