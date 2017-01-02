import Tiles from '../tiles/Tiles.js';
import Items from '../entities/Items.js';
import Enemies from '../entities/creatures/enemies/Enemies.js';
import Conditions from '../conditions/Conditions.js';
import Abilities from '../abilities/Abilities.js';
import AbilityConsumable from '../entities/consumables/AbilityConsumable';

import Dungeon from '../dungeons/Dungeon.js';

export default {
    serialize: function(dungeon) {
        const conditions = dungeon.getGameConditions().constructor.name;
        const width = dungeon.getWidth();
        const height = dungeon.getHeight();
        const grid = new Array(width).fill(0).map(()=>[]);
        dungeon.forEachTile(function(tile, x, y) {
            const tileName = tile.constructor.name;
            const creature = tile.getCreature();
            const itemNames = tile.getItems().map((item)=>{
                const name = item.constructor.name;
                if(name === 'AbilityConsumable') {
                    return item._ability.constructor.name;
                } else {
                    return name;
                }
            });
            grid[x][y] = {
                tile: tileName,
                creature: creature && creature.constructor.name || undefined,
                items: itemNames
            };
        });
        return {
            grid,
            conditions
        };
    },

    deserialize: function(json) {
        const struct = (typeof json === 'string') ? JSON.parse(json) : json;
        const {conditions, grid} = struct;
        const width = grid.length;
        const height = grid[0].length;
        const dungeon = new Dungeon(width, height);
        grid.forEach(function(column, x) {
            column.forEach(function({tile, items = [], creature}, y) {
                const cell = new Tiles[tile](x, y);
                items.forEach(function(itemName) {
                    if(itemName in Abilities) {
                        cell.addItem(new AbilityConsumable(new Abilities[itemName]()));
                    } else {
                        cell.addItem(new Items[itemName]());
                    }
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

                let illegalKey = Object.keys(cell).find((key)=>key !== 'tile' && key !== 'items' && key !== 'creature');
                if(illegalKey) {
                    return `Illegal cell contents ${illegalKey}`;
                }

                const {tile, items, creature} = cell;
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
                        const item = items[i];
                        if(!(item in Items || item in Abilities)) {
                            return `Illegal item name ${items[i]}`;
                        }
                    }
                }
                if(creature !== undefined && !(creature in Enemies)) {
                    return `Illegal enemy name ${creature}`;
                }
            }
        }
    }
};