import { default as Dungeon } from "./dungeons/Dungeon.js";
import { default as GraphicalDungeonView } from "./views/GraphicalDungeonView.js";
import { default as EventLogView } from "./views/EventLogView.js";
import { default as GraphicalViewKeyboardController } from "./controllers/GraphicalViewKeyboardController.js";
import { default as GraphicalViewMouseController } from "./controllers/GraphicalViewMouseController.js";
import { default as TestDungeonFactory } from "./dungeons/TestDungeonFactory.js";

export default function() {
    var gameSection = document.querySelector('section');
    gameSection.innerHTML = '';
    var container = document.createElement('div');
    container.classList.add('game-ui-container');
    gameSection.appendChild(container);
    var dungeon = new TestDungeonFactory().getBasicEnemyDungeon();
    var mapView = new GraphicalDungeonView(dungeon);
    var eventLogView = new EventLogView(dungeon);
    var keyboardController = new GraphicalViewKeyboardController(dungeon, mapView);
    var mouseController = new GraphicalViewMouseController(dungeon, mapView);
    container.appendChild(mapView.getDom());
    var sidebar = document.createElement('div');
    sidebar.classList.add('sidebar');
    container.appendChild(sidebar);
    sidebar.appendChild(eventLogView.getDom());

    function delay() {
        return new Promise(function(resolve, reject) {
            setTimeout(resolve, 50);
        });
    }

    (function iterate() {
        if(!dungeon.hasEnded()) {
            dungeon.resolveNextStep().then(delay).then(iterate).catch(function(error) {
                console.error(error);
            });
        }
    })();
};
