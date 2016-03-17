import { default as Dungeon } from "./dungeons/Dungeon.js";
import { default as RandomMapDungeonFactory } from "./dungeons/RandomMapDungeonFactory.js";

import { default as GraphicalDungeonView } from "./views/GraphicalDungeonView.js";
import { default as EventLogView } from "./views/EventLogView.js";
import { default as InventoryView } from "./views/InventoryView.js";
import { default as PlayerLocationView } from "./views/PlayerLocationView.js";
import { default as TileView } from "./views/TileView.js";

import { default as GraphicalViewKeyboardController } from "./controllers/GraphicalViewKeyboardController.js";
import { default as GraphicalViewMouseController } from "./controllers/GraphicalViewMouseController.js";
import { default as GraphicalViewSharedData } from "./controllers/GraphicalViewSharedData.js";

export default function(newSeed) {
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

    var prng = Random.engines.mt19937();
    prng.seed(seed);

    var dungeon = new RandomMapDungeonFactory().getRandomMap(prng);

    var sharedData = new GraphicalViewSharedData(dungeon);

    var mapView = new GraphicalDungeonView(dungeon);
    var eventLogView = new EventLogView(dungeon);
    var inventoryView = new InventoryView(dungeon);
    var playerLocationView = new PlayerLocationView(sharedData);
    var tileView = new TileView(sharedData);
    var keyboardController = new GraphicalViewKeyboardController(dungeon, sharedData, mapView);
    var mouseController = new GraphicalViewMouseController(dungeon, sharedData, mapView);
    container.appendChild(mapView.getDom());
    var sidebar = document.createElement('div');
    sidebar.classList.add('sidebar');
    container.appendChild(sidebar);
    sidebar.appendChild(playerLocationView.getDom());
    sidebar.appendChild(tileView.getDom());
    sidebar.appendChild(inventoryView.getDom());
    sidebar.appendChild(eventLogView.getDom());

setTimeout(function() {
    dungeon.resolveUntilBlocked();});
};
