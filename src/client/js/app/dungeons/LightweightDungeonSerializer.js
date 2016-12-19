import Tiles from '../tiles/Tiles.js';
import Items from '../entities/Items.js';
import Enemies from '../entities/creatures/enemies/Enemies.js';
import Conditions from '../conditions/Conditions.js';

import Dungeon from '../dungeons/Dungeon.js';

export default {
    serialize: function(dungeon) {
        
    },

    deserialize: function(json) {
        const struct = (typeof json === 'string') ? JSON.parse(json) : json;
        const {conditions, grid} = struct;
        const width = grid.length;
        const height = grid[0].length;
        const dungeon = new Dungeon(width, height);
        grid.forEach(function(column, x) {
            column.forEach(function({tile, items = [], creature}, y) {
                const cell = new Tiles[tile](dungeon, x, y);
                items.forEach(function(itemName) {
                    cell.addItem(new Items[itemName]());
                });
                dungeon.setTile(cell, x, y);
                if(creature) {
                    dungeon.moveCreature(new Enemies[creature](), x, y);
                }
            });
        });
        dungeon.setGameConditions(new Conditions[conditions]());
        return dungeon;
    },

    validate: function(json) {
        // Must be an array of arrays
        // Each subarray must be the same length
        // Floor tiles must all be connected to entrance
        // Must contain treasure
        // Must have an entrance
        // Edges must be walls
    }
};