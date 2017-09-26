import Dungeon from '../../Dungeon';

import Tiles from '../../../tiles/Tiles';

import Rogue from '../../../entities/creatures/classes/Rogue';

import Enemies from '../../../entities/creatures/enemies/Enemies';
import Strategies from '../../../entities/creatures/strategies/Strategies';

import Weapons from '../../../entities/weapons/Weapons';
import TheTreasure from '../../../entities/TheTreasure';

import GetTheTreasureConditions from '../../../conditions/GetTheTreasureConditions';

function fill(dungeon, Tile, x1, y1, x2, y2) {
    for(let x = x1; x < x2; x++) {
        for(let y = y1; y < y2; y++) {
            dungeon.setTile(new Tile(x, y), x, y);
        }
    }
}

export default {
    generate: function() {
        let dungeon = new Dungeon(10, 12);

        fill(dungeon, Tiles.WallTile, 0, 0, 10, 12);
        fill(dungeon, Tiles.Tile, 1, 6, 6, 11);
        fill(dungeon, Tiles.Tile, 3, 3, 4, 6);
        fill(dungeon, Tiles.Tile, 3, 3, 6, 4);
        fill(dungeon, Tiles.Tile, 5, 1, 6, 4);
        fill(dungeon, Tiles.Tile, 5, 1, 8, 2);
        fill(dungeon, Tiles.Tile, 7, 1, 8, 7);
        fill(dungeon, Tiles.Tile, 7, 7, 9, 11);

        dungeon.setTile(new Tiles.PitTile(7, 3), 7, 3);
        dungeon.setTile(new Tiles.PitTile(7, 5), 7, 5);
        dungeon.setTile(new Tiles.PitTile(6, 11), 6, 10);

        dungeon.setTile(new Tiles.EntranceTile(2, 9), 2, 9);

        dungeon.moveCreature(new Rogue(), 2, 9);
        var bvsStrategy = new Strategies.CompositeStrategy(
            new Strategies.MeleeAttackStrategy(),
            new Strategies.IdleStrategy()
        );
        var bvs1 = new Enemies.BlackVoidSphere();
        var bvs2 = new Enemies.BlackVoidSphere();
        bvs1.setStrategy(bvsStrategy);
        bvs2.setStrategy(bvsStrategy);
        dungeon.moveCreature(bvs1, 5, 1);
        dungeon.moveCreature(bvs2, 7, 4);

        dungeon.moveItem(new TheTreasure(dungeon), 8, 9);
        dungeon.moveItem(new Weapons.Longsword(), 4, 3);
        dungeon.moveItem(new Weapons.Slingshot(), 6, 1);

        dungeon.setGameConditions(new GetTheTreasureConditions());

        return dungeon;
    }
};
