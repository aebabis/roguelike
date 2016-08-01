import RandomMapDungeonFactory from './dungeons/RandomMapDungeonFactory.js';

import GraphicalDungeonView from './views/GraphicalDungeonView.js';
import EventLogView from './views/EventLogView.js';
import AbilitiesView from './views/AbilitiesView.js';
import InventoryView from './views/InventoryView.js';
import PlayerLocationView from './views/PlayerLocationView.js';

import GraphicalViewKeyboardController from './controllers/GraphicalViewKeyboardController.js';
import GraphicalViewMouseController from './controllers/GraphicalViewMouseController.js';
import GraphicalViewSharedData from './controllers/GraphicalViewSharedData.js';

import DebugConsole from './DebugConsole.js';

export default function(newSeed, character) {
    var gameSection = document.querySelector('section');
    gameSection.innerHTML = '';
    var container = document.createElement('div');
    container.classList.add('game-ui-container');
    gameSection.appendChild(container);

    var seed;
    if(localStorage.lastSeed && !newSeed) {
        seed = localStorage.lastSeed;
    } else {
        seed = localStorage.lastSeed = +new Date();
    }

    DebugConsole.log(`PRNG Seed: ${seed}`);
    var prng = Random.engines.mt19937();
    prng.seed(seed);

    var dungeon = new RandomMapDungeonFactory().getRandomMap(prng, character);

    var sharedData = new GraphicalViewSharedData(dungeon);

    var mapView = new GraphicalDungeonView(sharedData); // TODO: Use sharedData instead of dungeon
    var eventLogView = new EventLogView(sharedData);
    var inventoryView = new InventoryView(sharedData);
    var abilitiesView = new AbilitiesView(sharedData);
    var playerLocationView = new PlayerLocationView(sharedData);

    new GraphicalViewKeyboardController(sharedData, mapView);
    new GraphicalViewMouseController(sharedData, mapView);

    container.appendChild(mapView.getDom());
    var sidebar = document.createElement('div');
    var sidebarInner = document.createElement('div');
    sidebarInner.classList.add('sidebar-inner');
    sidebar.classList.add('sidebar');
    sidebar.appendChild(sidebarInner);
    container.appendChild(sidebar);
    container.appendChild(playerLocationView.getDom());
    container.appendChild(abilitiesView.getDom());
    sidebarInner.appendChild(inventoryView.getDom());
    sidebarInner.appendChild(eventLogView.getDom());

    setTimeout(function() { dungeon.resolveUntilBlocked(); });
}
