import EntranceTile from '../tiles/EntranceTile';

import GetTheTreasureConditions from '../conditions/GetTheTreasureConditions';

import Enemies from '../entities/creatures/enemies/Enemies';

import Abilities from '../abilities/Abilities';

import CostedDistributionTable from '../util/CostedDistributionTable';
import TheTreasure from '../entities/TheTreasure';

import Weapons from '../entities/weapons/Weapons';
import Armors from '../entities/armor/Armors';

import AbilityConsumable from '../entities/consumables/AbilityConsumable';
import CherrySoda from '../entities/consumables/CherrySoda';
import BlueberrySoda from '../entities/consumables/BlueberrySoda';

import DebugConsole from '../util/DebugConsole';

import ConnectedRoomLayoutGenerator from './generators/layouts/ConnectedRoomLayoutGenerator';

const LOOT_VALUE = 70;

const itemTable = new CostedDistributionTable([{
    value: Weapons.Stick,
    weight: 3,
    cost: 5
}, {
    value: Weapons.Dagger,
    weight: 5,
    cost: 10
}, {
    value: Weapons.Shortsword,
    weight: 10,
    cost: 20
}, {
    value: Weapons.Longsword,
    weight: 5,
    cost: 30
}, {
    value: Weapons.Slingshot,
    weight: 10,
    cost: 10
}, {
    value: Weapons.Shortbow,
    weight: 5,
    cost: 30
}, {
    value: Weapons.Longbow,
    weight: 2,
    cost: 60
}, {
    value: CherrySoda,
    weight: 40,
    cost: 10
}, {
    value: BlueberrySoda,
    weight: 25,
    cost: 10
}, {
    value: function() {
        return new AbilityConsumable(new Abilities.Fireball());
    },
    weight: 10,
    cost: 20
}, {
    value: function() {
        return new AbilityConsumable(new Abilities.ForceDart());
    },
    weight: 30,
    cost: 10
}, {
    value: function() {
        return new AbilityConsumable(new Abilities.Firebolt());
    },
    weight: 15,
    cost: 15
}, {
    value: function() {
        return new AbilityConsumable(new Abilities.LesserSnare());
    },
    weight: 5,
    cost: 10
}, {
    value: Armors.LightArmor,
    weight: 5,
    cost: 15
}, {
    value: Armors.MediumArmor,
    weight: 3,
    cost: 25
}, {
    value: Armors.HeavyArmor,
    weight: 2,
    cost: 40
}]);

const enemyTable = new CostedDistributionTable([{
    value: Enemies.Archer,
    weight: 40,
    cost: 10
}, {
    value: Enemies.Bigfoot,
    weight: 30,
    cost: 8
}, {
    value: Enemies.BlackVoidSphere,
    weight: 100,
    cost: 3
}, {
    value: Enemies.ClunkyNinetiesCellPhone,
    weight: 30,
    cost: 5
}, {
    value: Enemies.Cow,
    weight: 4,
    cost: 2
}, {
    value: Enemies.Crier,
    weight: 20,
    cost: 8
}, {
    value: Enemies.DustBunny,
    weight: 40,
    cost: 14
}, {
    value: Enemies.DustMite,
    weight: 20,
    cost: 2
}, {
    value: Enemies.Ent,
    weight: 60,
    cost: 9
}, {
    value: Enemies.FireSprite,
    weight: 60,
    cost: 3
}, {
    value: Enemies.FlyingSerpent,
    weight: 60,
    cost: 4
}, {
    value: Enemies.Lobster,
    weight: 5,
    cost: 3
}, {
    value: Enemies.MongolianHorseArcher,
    weight: 30,
    cost: 20
}, {
    value: Enemies.Skeleton,
    weight: 80,
    cost: 5
}, {
    value: Enemies.Slime,
    weight: 50,
    cost: 6
}, {
    value: Enemies.SlingshotImp,
    weight: 50,
    cost: 3
}, {
    value: Enemies.Witch,
    weight: 50,
    cost: 10
}, {
    value: Enemies.Wyrm,
    weight: 20,
    cost: 15
}]);

const rightPad = (s,c,n) => s + c.repeat(Math.max(0, n-s.length));

function reportCreaturesToConsole(creatures) {
    // Record creature data in the debug console
    const data = creatures.map(function(creature) {
        return {
            name: creature.getName(),
            cost: enemyTable.getCost(creature)
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

        const drops = itemTable.rollEntries(prng, LOOT_VALUE);
        drops.forEach((value) => {
            const position = Random.integer(0, emptyTiles.length - 1)(prng);
            const tile = emptyTiles[position];
            dungeon.moveItem(value, tile.getX(), tile.getY());
        });

        const playerLocation = locations.shift();
        dungeon.setTile(new EntranceTile(playerLocation.getX(), playerLocation.getY()), playerLocation.getX(), playerLocation.getY());
        if(player) {
            dungeon.moveCreature(player, playerLocation.getX(), playerLocation.getY());
        }

        // Test game configuration
        const creatures = enemyTable.rollEntries(prng, 80);

        reportCreaturesToConsole(creatures);

        // Place enemies
        const enemyLocations = locations.filter((location)=>location.getEuclideanDistance(playerLocation) > 5);
        creatures.forEach(creature => {
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
        dungeon.moveItem(new TheTreasure(dungeon), treasureLocation.getX(), treasureLocation.getY());

        dungeon.setGameConditions(new GetTheTreasureConditions());

        return dungeon;
    }
}
