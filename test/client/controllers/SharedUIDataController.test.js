import SharedUIDataController from '../../../src/client/js/app/ui/SharedUIDataController';
import Dungeon from '../../../src/client/js/app/dungeons/Dungeon';
import Tiles from '../../../src/client/js/app/tiles/Tiles';
import Rogue from '../../../src/client/js/app/entities/creatures/classes/Rogue';
import Leap from '../../../src/client/js/app/abilities/Leap';
import Items from '../../../src/client/js/app/entities/Items';
import Enemies from '../../../src/client/js/app/entities/creatures/enemies/Enemies';

const expect = require('chai').expect; // TODO: Use import

describe('SharedUIDataController', () => {
    let dungeon, player, controller;

    beforeEach(() => {
        dungeon = new Dungeon(5, 5);
        player = new Rogue();
        dungeon.moveCreature(player, 2, 2);
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

    describe('handleTileActivation', () => {
        it('should move the player a single tile', () => {
            controller.handleTileActivation(1, 1);
            let tile = dungeon.getTile(player);
            expect(tile.getX()).to.equal(1);
            expect(tile.getY()).to.equal(1);

            controller.handleTileActivation(0, 1);
            tile = dungeon.getTile(player);
            expect(tile.getX()).to.equal(0);
            expect(tile.getY()).to.equal(1);

            controller.handleTileActivation(0, 0);
            tile = dungeon.getTile(player);
            expect(tile.getX()).to.equal(0);
            expect(tile.getY()).to.equal(0);
        });

        it('should move the player multiple tiles', () => {
            controller.handleTileActivation(0, 0);
            const tile = dungeon.getTile(player);
            expect(tile.getX()).to.equal(0);
            expect(tile.getY()).to.equal(0);
        });

        it('should not move the player when there is no path', () => {
            dungeon.setTile(new Tiles.WallTile(3, 3), 3, 3);
            dungeon.setTile(new Tiles.WallTile(3, 4), 3, 4);
            dungeon.setTile(new Tiles.WallTile(4, 3), 4, 3);
            controller.handleTileActivation(4, 4);
            const tile = dungeon.getTile(player);
            expect(tile.getX()).to.equal(2);
            expect(tile.getY()).to.equal(2);
        });

        it('should handle ability usage', () => {
            player.addAbility(new Leap());
            controller.setTargettedAbility(0);
            const target = controller.getAbilityTarget();
            controller.handleTileActivation(1, 1);
            const tile = dungeon.getTile(player);

            expect(target).to.be.an.instanceof(Tiles.Tile);
            expect(tile.getX()).to.equal(1);
            expect(tile.getY()).to.equal(1);
        });

        it('should handle ability usage', () => {
            player.addAbility(new Leap());
            controller.setTargettedAbility(0);
            controller.handleTileActivation(1, 1);
            const tile = dungeon.getTile(player);
            expect(tile.getX()).to.equal(1);
            expect(tile.getY()).to.equal(1);
        });

        it('should handle a melee attack', () => {
            const enemy = new Enemies.DustMite();
            dungeon.moveCreature(enemy, 1, 1);
            player.addItem(new Items.Longsword());
            controller.handleTileActivation(1, 1);
            expect(enemy.isDead()).to.equal(true);
        });

        it('should handle auto-pathing into a melee attack');
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
