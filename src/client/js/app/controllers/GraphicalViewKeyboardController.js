import { default as Tile } from "../tiles/Tile.js";
import { default as Moves } from "../entities/creatures/moves/Moves.js";


import { default as AttackMove } from "../entities/creatures/moves/AttackMove.js";
import { default as MovementMove } from "../entities/creatures/moves/MovementMove.js";
import { default as TakeItemMove } from "../entities/creatures/moves/TakeItemMove.js";
import { default as UseAbilityMove } from "../entities/creatures/moves/UseAbilityMove.js";
import { default as UseItemMove } from "../entities/creatures/moves/UseItemMove.js";
import { default as WaitMove } from "../entities/creatures/moves/WaitMove.js";

export default class GraphicalViewKeyboardController {
    constructor(dungeon, sharedData, graphicalDungeonView) {
        var dom = document.querySelector('section.game');

        console.log(dom);

        // Arrow key handler
        dom.addEventListener('keydown', function(event) {
            var active = document.activeElement;
            var code = event.keyCode;

            var preventDefault = true;
            var character = dungeon.getPlayableCharacter();
            function move(dx, dy) {
                var tile = character.getTile();
                var x = tile.getX() + dx;
                var y = tile.getY() + dy;
                var targetTile = dungeon.getTile(x, y);
                var creature = targetTile.getCreature();
                if(creature && creature.isEnemy(character)) {
                    character.setNextMove(new Moves.AttackMove(x, y));
                } else if(character.canOccupy(targetTile)) {
                    character.setNextMove(new Moves.MovementMove(dx, dy));
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
                case 101: case 190: character.setNextMove(new Moves.WaitMove()); break;
                case 102: case 76: move( 1, 0); break;
                case 103: case 89: move(-1,-1); break;
                case 104: case 75: move( 0,-1); break;
                case 105: case 85: move( 1,-1); break;
                default:
                    preventDefault = false;
                    break;
            }

            if(preventDefault) {
                event.preventDefault();
            }
            
            dungeon.resolveUntilBlocked();
        });

        // TODO: Move this logic into an observer function
        // since we are no longer using cell focus
        $(dom).on('focus', '.cell', function(event) {
            var $cell = $(this);
            var cellPos = $cell.position();
            var scrollTop = cellPos.top + ($cell.height() - $(dom).height()) / 2;
            var scrollLeft = cellPos.left + ($cell.width() - $(dom).width()) / 2;
            $(dom).scrollTop(scrollTop);
            $(dom).scrollLeft(scrollLeft);
        });
    }
}
