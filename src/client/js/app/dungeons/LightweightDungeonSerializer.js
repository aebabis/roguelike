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

    validate: function({conditions, grid}) {
        if(!(conditions in Conditions)) {
            return `Illegal game conditions: ${conditions}`;
        }
        if(!Array.isArray(grid)) {
            return `Grid must be an Array`;
        }
        for(let x = 0, width = grid.length; x < width; x++) {
            const col = grid[x];
            if(!Array.isArray(col)) {
                return `Grid must be an Array of Arrays`;
            }
            if(col.length !== grid[0].length) {
                return `Columns must be uniform height`;
            }
            for(let y = 0, height = col.length; y < height; y++) {
                const cell = col[y];

                let illegalKey = Object.keys(cell).find((key)=>key !== 'tile' && key !== 'items' && key !== 'enemy');
                if(illegalKey) {
                    return `Illegal cell contents ${illegalKey}`;
                }

                const {tile, items, enemy} = cell;
                if(!(tile in Tiles)) {
                    return `Illegal tile name ${tile}`;
                }
                const isEdge = x === 0 || x === width - 1 || y === 0 || y == height - 1;
                if(isEdge && tile !== 'WallTile') {
                    return `Edge tiles must be walls`;
                }
                if(items !== undefined) {
                    if(!Array.isArray(items)) {
                        return `Items, if given, must be an Array`;
                    }
                    for(let i = 0, count = items.length; i < count; i++) {
                        if(!(items[i] in Items)) {
                            return `Illegal item name ${items[i]}`;
                        }
                    }
                }
                if(enemy !== undefined && !(enemy in Enemies)) {
                    return `Illegal enemy name ${enemy}`;
                }
            }
        }
    }
};