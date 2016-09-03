import Moves from '../entities/creatures/moves/Moves.js';

/**
 * Controller that listens for keypresses on dungeon views
 * and converts them to game moves
 */
export default class GraphicalViewKeyboardController {
    /**
     * Instantiates a controller and binds event handlers to the document
     * @param {GraphicalViewSharedData} sharedData - The data object containing the dungeon
     */
    constructor(sharedData) {
        const dom = document.querySelector('section.game');

        // Arrow key handler
        dom.addEventListener('keydown', function(event) {
            const dungeon = sharedData.getDungeon();
            //var active = document.activeElement;
            const code = event.keyCode;

            let preventDefault = true;
            const character = dungeon.getPlayableCharacter();
            const tile = dungeon.getTile(character);
            function move(dx, dy) {
                const x = tile.getX() + dx;
                const y = tile.getY() + dy;
                const targetTile = dungeon.getTile(x, y);
                const creature = targetTile.getCreature();
                if(creature && creature.isEnemy(character)) {
                    character.setNextMove(new Moves.AttackMove(tile, x, y));
                } else if(character.canOccupy(targetTile)) {
                    character.setNextMove(new Moves.MovementMove(tile, dx, dy));
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
            case 101: case 190: character.setNextMove(new Moves.WaitMove(dungeon.getTile(character))); break;
            case 102: case 76: move( 1, 0); break;
            case 103: case 89: move(-1,-1); break;
            case 104: case 75: move( 0,-1); break;
            case 105: case 85: move( 1,-1); break;

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
                if(attackTile) {
                    character.setNextMove(new Moves.AttackMove(tile, attackTile.getX(), attackTile.getY()));
                    sharedData.unsetAttackMode();
                } else if(abilityTile) {
                    character.setNextMove(new Moves.UseAbilityMove(tile, sharedData.getTargettedAbility(), abilityTile.getX(), abilityTile.getY()));
                    sharedData.unsetTargettedAbility();
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
