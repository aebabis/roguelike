import Moves from '../entities/creatures/moves/Moves';

/**
 * Controller that listens for mouse actions on dungeon views
 * and converts them to game moves
 */
export default class PixiDungeonViewMouseController {
    /**
     * Instantiates a controller and binds event handlers to the document
     * @param {SharedUIDataController} sharedData - The data object containing the dungeon
     * @param {PixiDungeonView} dungeonView - The view that will receive the clicks
     */
    constructor(sharedData, graphicalDungeonView) {

        graphicalDungeonView.onClick(function(x, y) {
            const gameContainer = document.querySelector('section.game');
            if(document.activeElement !== gameContainer) {
                gameContainer.focus();
                return;
            }
            sharedData.handleTileActivation(x, y);
        });

        graphicalDungeonView.onMouseOver(function(x, y) {
            sharedData.setHoverTile(x, y);
        });

        graphicalDungeonView.onMouseOut(function() {
            sharedData.unsetHoverTile();
        });
    }
}
