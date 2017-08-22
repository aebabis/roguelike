import SharedUIDataController from '../../../src/client/js/app/controllers/SharedUIDataController';
import Dungeon from '../../../src/client/js/app/dungeons/Dungeon';
import Rogue from '../../../src/client/js/app/entities/creatures/classes/Rogue';

const expect = require('chai').expect; // TODO: Use import

describe('SharedUIDataController', () => {
    let dungeon, player, controller;

    beforeEach(() => {
        dungeon = new Dungeon(5, 5);
        player = new Rogue();
        controller = new SharedUIDataController(dungeon);
    });

    it('should initially be in neutral mode', () => {
        expect(controller.getMode()).to.equal(SharedUIDataController.NEUTRAL_MODE);
    });

    it('should initially not target anything', () => {
        expect(controller.getAbilityTarget()).to.equal(null);
        expect(controller.getAttackTarget()).to.equal(null);
        expect(controller.getExamineTarget()).to.equal(null);
        expect(controller.getItemTarget()).to.equal(null);
        expect(controller.getTargettedAbility()).to.equal(null);
        expect(controller.getTargettedItem()).to.equal(null);
    });
    
    describe('setDungeon', () => {
        it('should set the Dungeon', () => {
            const dungeon2 = new Dungeon(1, 1);
            controller.setDungeon(dungeon2);
            expect(controller.getDungeon()).to.equal(dungeon2);
        });

        it('should throw if not passed a Dungeon', () => {
            expect(() => {
                controller.setDungeon();
            }).to.throw();
        });
    });

    describe('pathTo', () => {

    });

    describe('setHoverTile', () => {
        it('should set the hover tile', () => {
            const x = 4;
            const y = 2;
            controller.setHoverTile(x, y);
            const tile = controller.getHoverTile();
            expect(tile.getX()).to.equal(x);
            expect(tile.getY()).to.equal(y);
        });

        it('should throw when the coords are out of bounds', () => {
            expect(() => {
                controller.setHoverTile(10, 10);
            }).to.throw();
        });
    });

    describe('unsetHoverTile', () => {
        it('should delete the stored hover tile', () => {
            const x = 0;
            const y = 3;
            controller.setHoverTile(x, y);
            controller.unsetHoverTile();
            const tile = controller.getHoverTile();
            expect(tile).to.equal(null);
        });
    });
});
