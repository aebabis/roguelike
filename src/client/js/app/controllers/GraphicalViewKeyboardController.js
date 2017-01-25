import Moves from '../entities/creatures/moves/Moves.js';

import UIMessageEvent from './UIMessageEvent.js';

/**
 * Controller that listens for keypresses on dungeon views
 * and converts them to game moves
 */
export default class GraphicalViewKeyboardController {
    /**
     * Instantiates a controller and binds event handlers to the document
     * @param {SharedUIDataController} sharedData - The data object containing the dungeon
     */
    constructor(sharedData, view) {
        // Arrow key handler
        document.querySelector('section.game').addEventListener('keydown', function(event) {
            const dungeon = sharedData.getDungeon();
            //var active = document.activeElement;
            const code = event.keyCode;

            let preventDefault = true;
            const character = dungeon.getPlayableCharacter();
            const tile = dungeon.getTile(character);
            function move(dx, dy) {
                if(typeof sharedData.getTargettedItem() === 'number' ||
                        typeof sharedData.getTargettedAbility() === 'number') {
                    sharedData.cycleTarget(dx, dy);
                } else {
                    const x = tile.getX() + dx;
                    const y = tile.getY() + dy;
                    const targetTile = dungeon.getTile(x, y);
                    const creature = targetTile.getCreature();
                    if(creature && creature.isEnemy(character)) {
                        attemptMove(new Moves.AttackMove(tile, x, y));
                    } else {
                        attemptMove(new Moves.MovementMove(tile, dx, dy));
                    }
                }
            }

            function attemptMove(move) {
                const reason = move.getReasonIllegal(dungeon, character);
                if(reason) {
                    sharedData.dispatchUIEvent(new UIMessageEvent(reason));
                } else {
                    character.setNextMove(move);
                }
            }

            switch(code) {
            case 37: move(-1, 0); break;
            case 38: move(0, -1); break;
            case 39: move(1, 0); break;
            case 40: move(0, 1); break;

            case 97:  case 66: move(-1, 1); break;
            case 98:  case 74: move( 0, 1); break;
            case 99:  case 78: move( 1, 1); break;
            case 100: case 72: move(-1, 0); break;
            case 101: case 190: attemptMove(new Moves.WaitMove(dungeon.getTile(character))); break;
            case 102: case 76: move( 1, 0); break;
            case 103: case 89: move(-1,-1); break;
            case 104: case 75: move( 0,-1); break;
            case 105: case 85: move( 1,-1); break;

            case 81: case 87: case 69: case 82: {
                const index = ({81: 0, 87: 1, 69: 2, 82: 3})[code];
                const item = character.getInventory().getItem(index);
                if(!item) {
                	return;
                }
                if(event.ctrlKey) {
                    attemptMove(new Moves.TrashItemMove(tile, index));
                } else if(item.isTargetted()) {
                    if(index === sharedData.getTargettedItem()) {
                        sharedData.unsetTargettedItem();
                    } else {
                        sharedData.setTargettedItem(index);
                    }
                } else {
                    attemptMove(new Moves.UseItemMove(tile, index));
                }
                break;
            }

            case 65:
                if(sharedData.getAttackTarget()) {
                    sharedData.unsetAttackMode();
                } else {
                    sharedData.setAttackMode();
                }
                break;
            case 9:  sharedData.cycleTarget(); break;

            case 32: {
                const attackTile = sharedData.getAttackTarget();
                const abilityTile = sharedData.getAbilityTarget();
                const itemTile = sharedData.getItemTarget();
                if(attackTile) {
                    attemptMove(new Moves.AttackMove(tile, attackTile.getX(), attackTile.getY()));
                } else if(abilityTile) {
                    attemptMove(new Moves.UseAbilityMove(tile, sharedData.getTargettedAbility(), abilityTile.getX(), abilityTile.getY()));
                } else if(itemTile) {
                    attemptMove(new Moves.UseItemMove(tile, sharedData.getTargettedItem(), itemTile));
                }
                break;
            }

            default:
                preventDefault = false;
                break;
            }

            if(preventDefault) {
                event.preventDefault();
            }

            dungeon.resolveUntilBlocked();
        });
    }
}
