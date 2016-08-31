import Dungeon  from '../../../src/client/js/app/dungeons/Dungeon.js';
import Rogue from '../../../src/client/js/app/entities/creatures/classes/Rogue.js';
import Moves from '../../../src/client/js/app/entities/creatures/moves/Moves.js';
import Slingshot from '../../../src/client/js/app/entities/weapons/Slingshot.js';

import GraphicalViewSharedData from '../../../src/client/js/app/controllers/GraphicalViewSharedData.js';
import GraphicalDungeonView from '../../../src/client/js/app/views/GraphicalDungeonView.js';

var expect = require('chai').expect;

describe('GraphicalDungeonView', function() {
    it('should update when a player picks up an item', function(done) {
        const dungeon = new Dungeon(2, 2);
        dungeon.moveCreature(new Rogue(), 0, 0);
        dungeon.getTile(1, 1).addItem(new Slingshot());

        const sharedData = new GraphicalViewSharedData(dungeon);
        const view = new GraphicalDungeonView(sharedData);

        const showedSlingshot = !!view.getDom().querySelector('[data-item-name]');
        dungeon.getPlayableCharacter().setNextMove(new Moves.MovementMove(dungeon.getTile(dungeon.getPlayableCharacter()), 1, 1));
        dungeon.resolveUntilBlocked();
        // TODO: Make delay based on animation queue. Expose delay
        setTimeout(function(){
            const showsSlingshot = !!view.getDom().querySelector('[data-item-name]');

            expect(showedSlingshot).to.equal(true);
            expect(showsSlingshot).to.equal(false);
            done();
        }, 500);
    });

    it('should update when a player starts a new dungeon', function(done) {
        const dungeon = new Dungeon(2, 2);
        dungeon.getTile(1, 1).addItem(new Slingshot());
        dungeon.moveCreature(new Rogue(),0,0);

        const newDungeon = new Dungeon(1,2);
        newDungeon.moveCreature(new Rogue(),0,0);

        const sharedData = new GraphicalViewSharedData(dungeon);
        const view = new GraphicalDungeonView(sharedData);

        const showedSlingshot = !!view.getDom().querySelector('[data-item-name]');
        sharedData.setDungeon(newDungeon);
        setTimeout(function(){
            const showsSlingshot = !!view.getDom().querySelector('[data-item-name]');

            expect(showedSlingshot).to.equal(true);
            expect(showsSlingshot).to.equal(false);
            done();
        }, 500);
    });
});
