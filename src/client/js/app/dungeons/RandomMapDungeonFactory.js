import EntranceTile from '../tiles/EntranceTile.js';

import GetTheTreasureConditions from '../conditions/GetTheTreasureConditions.js';

import Enemies from '../entities/creatures/enemies/Enemies.js';

import Abilities from '../abilities/Abilities.js';

import EntityTable from '../entities/EntityTable.js';
import TheTreasure from '../entities/TheTreasure.js';

import Weapons from '../entities/weapons/Weapons.js';
import Armors from '../entities/armor/Armors.js';

import AbilityConsumable from '../entities/consumables/AbilityConsumable.js';
import CherrySoda from '../entities/consumables/CherrySoda.js';
import BlueberrySoda from '../entities/consumables/BlueberrySoda.js';

import DebugConsole from '../util/DebugConsole.js';

import ConnectedRoomLayoutGenerator from './generators/layouts/ConnectedRoomLayoutGenerator.js';

const LOOT_VALUE = 70;

const itemTable = new EntityTable([{
    entity: Weapons.Stick,
    weight: 3,
    cost: 5
}, {
    entity: Weapons.Dagger,
    weight: 5,
    cost: 10
}, {
    entity: Weapons.Shortsword,
    weight: 10,
    cost: 20
}, {
    entity: Weapons.Longsword,
    weight: 5,
    cost: 30
}, {
    entity: Weapons.Slingshot,
    weight: 10,
    cost: 10
}, {
    entity: Weapons.Shortbow,
    weight: 5,
    cost: 30
}, {
    entity: Weapons.Longbow,
    weight: 2,
    cost: 60
}, {
    entity: CherrySoda,
    weight: 40,
    cost: 10
}, {
    entity: BlueberrySoda,
    weight: 25,
    cost: 10
}, {
    entity: function() {
        return new AbilityConsumable(new Abilities.Fireball());
    },
    weight: 10,
    cost: 20
}, {
    entity: function() {
        return new AbilityConsumable(new Abilities.ForceDart());
    },
    weight: 30,
    cost: 10
}, {
    entity: function() {
        return new AbilityConsumable(new Abilities.Firebolt());
    },
    weight: 15,
    cost: 15
}, {
    entity: function() {
        return new AbilityConsumable(new Abilities.LesserSnare());
    },
    weight: 5,
    cost: 10
}, {
    entity: Armors.LightArmor,
    weight: 5,
    cost: 15
}, {
    entity: Armors.MediumArmor,
    weight: 3,
    cost: 25
}, {
    entity: Armors.HeavyArmor,
    weight: 2,
    cost: 40
}]);

const table = new EntityTable([{
    entity: Enemies.Archer,
    weight: 40,
    cost: 10
}, {
    entity: Enemies.Bigfoot,
    weight: 30,
    cost: 8
}, {
    entity: Enemies.BlackVoidSphere,
    weight: 100,
    cost: 3
}, {
    entity: Enemies.ClunkyNinetiesCellPhone,
    weight: 30,
    cost: 5
}, {
    entity: Enemies.Cow,
    weight: 4,
    cost: 2
}, {
    entity: Enemies.Crier,
    weight: 20,
    cost: 8
}, {
    entity: Enemies.DustBunny,
    weight: 40,
    cost: 14
}, {
    entity: Enemies.DustMite,
    weight: 20,
    cost: 2
}, {
    entity: Enemies.Ent,
    weight: 60,
    cost: 9
}, {
    entity: Enemies.FireSprite,
    weight: 60,
    cost: 6
}, {
    entity: Enemies.FlyingSerpent,
    weight: 60,
    cost: 4
}, {
    entity: Enemies.MongolianHorseArcher,
    weight: 30,
    cost: 20
}, {
    entity: Enemies.Skeleton,
    weight: 80,
    cost: 5
}, {
    entity: Enemies.SlingshotImp,
    weight: 50,
    cost: 3
}, {
    entity: Enemies.Witch,
    weight: 50,
    cost: 10
}, {
    entity: Enemies.Wyrm,
    weight: 20,
    cost: 15
}]);

const rightPad = (s,c,n) => s + c.repeat(Math.max(0, n-s.length));

function reportCreaturesToConsole(creatures) {
    // Record creature data in the debug console
    const data = creatures.map(function(creature) {
        return {
            name: creature.getName(),
            cost: table.getCost(creature)
        };
    }).sort((c1, c2)=>c1.cost-c2.cost);
    const maxNameLength = data.map((item)=>item.name.length).reduce((a,b)=>Math.max(a,b));
    DebugConsole.log('SPAWNED ENEMIES');
    DebugConsole.log(data.map(function(creature) {
        return `${rightPad(creature.name, ' ', maxNameLength)} (${creature.cost})`;
    }).join('\n'));
    const totalCost = data.map((c)=>c.cost).reduce((a,b)=>a+b);
    DebugConsole.log(`${rightPad('TOTAL COST', ' ', maxNameLength)} (${totalCost})`);
}

/**
 * Factory for creating random dungeons. Uses a generator to create random rooms,
 * then fills them with monsters and loot
 */
export default class RandomMapDungeonFactory {
    /**
     * Generates a new psuedorandom map
     * @param {Random} prng - A RandomJS PRNG
     * @param {PlayableCharacter} [player] - A player character. If not given,
     * it can be manually added later
     * @return {Dungeon}
     */
    getRandomMap(prng, player) {
        const dungeon = ConnectedRoomLayoutGenerator.generate(prng, {
            numRooms: 6
        });

        const emptyTiles = dungeon.getTiles(tile=>!tile.isSolid() && tile.hasFloor());
        const locations = Random.shuffle(prng, emptyTiles);

        const drops = itemTable.rollEntries(dungeon, prng, LOOT_VALUE);
        drops.forEach(function(item) {
            const position = Random.integer(0, emptyTiles.length - 1)(prng);
            const tile = emptyTiles[position];
            tile.addItem(item);
        });

        const playerLocation = locations.shift();
        dungeon.setTile(new EntranceTile(playerLocation.getX(), playerLocation.getY()), playerLocation.getX(), playerLocation.getY());
        if(player) {
            dungeon.moveCreature(player, playerLocation.getX(), playerLocation.getY());
        }

        // Test game configuration
        const creatures = table.rollEntries(dungeon, prng, 70);

        reportCreaturesToConsole(creatures);

        // Place enemies
        const enemyLocations = locations.filter((location)=>location.getEuclideanDistance(playerLocation) > 5);
        creatures.forEach(function(creature) {
            const loc = enemyLocations.shift();
            if(loc) {
                dungeon.moveCreature(creature, loc.getX(), loc.getY());
            }
        });

        const treasureLocations = enemyLocations.sort((locA, locB) => {
            const distA = locA.getEuclideanDistance(playerLocation);
            const distB = locB.getEuclideanDistance(playerLocation);
            if(distA < distB) {
                return -1;
            } else if(distA > distB) {
                return 1;
            } else {
                return 0;
            }
        });
        const treasureLocation = Random.picker(
            treasureLocations.slice(-Math.floor(treasureLocations.length / 3))
        )(prng);
        treasureLocation.addItem(new TheTreasure(dungeon));

        dungeon.setGameConditions(new GetTheTreasureConditions());

        return dungeon;
    }
}
