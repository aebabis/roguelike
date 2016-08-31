import Dungeon  from '../../../src/client/js/app/dungeons/Dungeon.js';
import Rogue from '../../../src/client/js/app/entities/creatures/classes/Rogue.js';
import Moves from '../../../src/client/js/app/entities/creatures/moves/Moves.js';
import Slingshot from '../../../src/client/js/app/entities/weapons/Slingshot.js';

import GraphicalViewSharedData from '../../../src/client/js/app/controllers/GraphicalViewSharedData.js';
import InventoryView from '../../../src/client/js/app/views/InventoryView.js';

var expect = require('chai').expect;

describe('InventoryView', function() {
    it('should update when a player picks up an item', function() {
        const dungeon = new Dungeon(2, 2);
        dungeon.moveCreature(new Rogue(), 0, 0);
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

    it('should update when a player starts a new dungeon', function() {
        const dungeon = new Dungeon(2, 2);
        const player = new Rogue();
        dungeon.moveCreature(player, 0, 0);
        player.getInventory().addItem(new Slingshot());

        const newDungeon = new Dungeon(1,2);
        const newPlayer = new Rogue();
        newDungeon.moveCreature(newPlayer, 0, 0);

        const sharedData = new GraphicalViewSharedData(dungeon);
        const view = new InventoryView(sharedData);

        const showedSlingshot = !!view.getDom().querySelector('.slot.item');
        sharedData.setDungeon(newDungeon);
        const showsSlingshot = !!view.getDom().querySelector('.slot.item');

        expect(showedSlingshot).to.equal(true);
        expect(showsSlingshot).to.equal(false);
    });
});
