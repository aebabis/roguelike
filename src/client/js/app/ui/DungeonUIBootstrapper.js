import PixiDungeonView from '../views/PixiDungeonView';
import EventLogView from '../views/EventLogView';
import AbilitiesView from '../views/AbilitiesView';
import InventoryView from '../views/InventoryView';
import PlayerLocationView from '../views/PlayerLocationView';

import GraphicalViewKeyboardController from '../ui/GraphicalViewKeyboardController';
import PixiDungeonViewMouseController from '../views/PixiDungeonViewMouseController';

export default function(sharedData) {
    const mapView = new PixiDungeonView(sharedData);
    const eventLogView = new EventLogView(sharedData);
    const inventoryView = new InventoryView(sharedData);
    const abilitiesView = new AbilitiesView(sharedData);
    const playerLocationView = new PlayerLocationView(sharedData);

    new GraphicalViewKeyboardController(sharedData, mapView);
    new PixiDungeonViewMouseController(sharedData, mapView);

    const gameSection = document.querySelector('section');
    gameSection.innerHTML = '';
    const container = document.createElement('div');
    container.classList.add('game-ui-container');
    gameSection.appendChild(container);

    container.appendChild(mapView.getDom());
    const sidebar = document.createElement('div');
    const sidebarInner = document.createElement('div');
    sidebarInner.classList.add('sidebar-inner');
    sidebar.classList.add('sidebar');
    sidebar.appendChild(sidebarInner);
    container.appendChild(sidebar);
    container.appendChild(playerLocationView.getDom());
    container.appendChild(abilitiesView.getDom());
    sidebarInner.appendChild(inventoryView.getDom());
    sidebarInner.appendChild(eventLogView.getDom());
}
