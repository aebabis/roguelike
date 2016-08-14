import Dungeon from '../../Dungeon.js';

import Tiles from '../../../tiles/Tiles.js';

import Rogue from '../../../entities/creatures/classes/Rogue.js';

import Enemies from '../../../entities/creatures/enemies/Enemies.js';
import Strategies from '../../../entities/creatures/strategies/Strategies.js';

import Weapons from '../../../entities/weapons/Weapons.js';
import TheTreasure from '../../../entities/TheTreasure.js';

import GetTheTreasureConditions from '../../../conditions/GetTheTreasureConditions.js';

function fill(dungeon, Tile, x1, y1, x2, y2) {
    for(let x = x1; x < x2; x++) {
        for(let y = y1; y < y2; y++) {
            dungeon.setTile(new Tile(dungeon, x, y), x, y);
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

        dungeon.setTile(new Tiles.PitTile(dungeon, 7, 3), 7, 3);
        dungeon.setTile(new Tiles.PitTile(dungeon, 7, 5), 7, 5);
        dungeon.setTile(new Tiles.PitTile(dungeon, 6, 11), 6, 10);

        dungeon.setTile(new Tiles.EntranceTile(dungeon, 2, 9), 2, 9);

        dungeon.setCreature(new Rogue(), 2, 9);
        var bvsStrategy = new Strategies.CompositeStrategy(
            new Strategies.MeleeAttackStrategy(),
            new Strategies.IdleStrategy()
        );
        var bvs1 = new Enemies.BlackVoidSphere();
        var bvs2 = new Enemies.BlackVoidSphere();
        bvs1.setStrategy(bvsStrategy);
        bvs2.setStrategy(bvsStrategy);
        dungeon.setCreature(bvs1, 5, 1);
        dungeon.setCreature(bvs2, 7, 4);

        dungeon.getTile(8, 9).addItem(new TheTreasure(dungeon));
        dungeon.getTile(4, 3).addItem(new Weapons.Longsword());
        dungeon.getTile(6, 1).addItem(new Weapons.Slingshot());

        dungeon.setGameConditions(new GetTheTreasureConditions());

        return dungeon;
    }
};
