import Moves from '../entities/creatures/moves/Moves.js';

import Pather from '../entities/creatures/strategies/Pather.js';

import UIMessageEvent from '../controllers/UIMessageEvent.js';

/**
 * Controller that listens for mouse actions on dungeon views
 * and converts them to game moves
 */
export default class PixiDungeonViewMouseController {
    /**
     * Instantiates a controller and binds event handlers to the document
     * @param {GraphicalViewSharedData} sharedData - The data object containing the dungeon
     * @param {PixiDungeonView} dungeonView - The view that will receive the clicks
     */
    constructor(sharedData, graphicalDungeonView) {
        function getMovesFor(targetX, targetY) {
            var dungeon = sharedData.getDungeon();
            var player = dungeon.getPlayableCharacter();
            var playerLocation = dungeon.getTile(player); // TODO: Ensure that tile isn't empty
            var creature = dungeon.getTile(targetX, targetY).getCreature();
            var abilityIndex = sharedData.getTargettedAbility();
            var itemIndex = sharedData.getTargettedItem();
            if(abilityIndex !== null) {
                return [new Moves.UseAbilityMove(playerLocation, abilityIndex, targetX, targetY)];
            } else if(itemIndex !== null) {
                return [new Moves.UseItemMove(playerLocation, itemIndex, dungeon.getTile(targetX, targetY))];
            } else if(creature && creature.isEnemy(player)) {
                return [new Moves.AttackMove(playerLocation, targetX, targetY)];
            } else {
                var dx = targetX - playerLocation.getX();
                var dy = targetY - playerLocation.getY();
                if(dx === 0 && dy === 0) {
                    return [new Moves.WaitMove(playerLocation)];
                } else if(Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
                    return [new Moves.MovementMove(playerLocation, dx, dy)];
                } else if(playerLocation.getCreature()) {
                    return Pather.getMoveSequenceToward(dungeon, player, dungeon.getTile(targetX, targetY));
                }
            }
        }

        function getMoveNameFor(x, y) {
            var dungeon = sharedData.getDungeon();
            var player = dungeon.getPlayableCharacter();
            var moves = getMovesFor(x, y);
            if(moves && moves[0] && !moves[0].getReasonIllegal(dungeon, player, dungeon.getTile(x, y))) {
                return moves[0].constructor.name;
            } else {
                return '';
            }
        }

        graphicalDungeonView.onClick(function(x, y) {
            const gameContainer = document.querySelector('section.game');
            if(document.activeElement !== gameContainer) {
                gameContainer.focus();
                return;
            }
            const dungeon = sharedData.getDungeon();
            const player = dungeon.getPlayableCharacter();
            const enemies = player.getVisibleEnemies(dungeon);
            const moves = getMovesFor(x, y) || [];
            if(moves.length === 0) {
                sharedData.dispatchUIEvent(new UIMessageEvent('No path to location'));
            } else {
                moves.forEach(function(move) {
                    // Note, optionalTargetTile (3rd param) only relevant for 1-length move sequences
                    var reason = move.getReasonIllegal(dungeon, player, dungeon.getTile(x, y));
                    if(reason) {
                        sharedData.dispatchUIEvent(new UIMessageEvent(reason));
                        return false;
                    } else {
                        player.setNextMove(move);
                        dungeon.resolveUntilBlocked();
                        sharedData.unsetAttackMode();
                        sharedData.unsetTargettedAbility();
                        sharedData.unsetTargettedItem();
                    }
                });
            }
        });

        graphicalDungeonView.onHover(function(x, y) {
            sharedData.setInspectedTile(x, y);
            //sharedData.setInspectedTileMoveType(x, y, getMoveNameFor(x, y));
        });

        sharedData.addObserver(function(event) {
            if(event === 'GO_HOME') {
                //$(dom).find('[data-tile-type="EntranceTile"]').click();
            }
        });

        // sharedData.addObserver(()=>lastHoverTile && updateHoverAttribute(lastHoverTile));
    }
}
