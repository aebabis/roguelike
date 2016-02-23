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
        var dom = graphicalDungeonView.getDom();

        // Arrow key handler
        dom.addEventListener('keydown', function(event) {
            var active = document.activeElement;
            var code = event.keyCode;
            if(active === dom.children[0]) {
                var character = dungeon.getPlayableCharacter();
                if(code >= 37 && code <= 40 || code >= 97 && code <= 105) {
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

                        case 97:  move(-1, 1); break;
                        case 98:  move( 0, 1); break;
                        case 99:  move( 1, 1); break;
                        case 100: move(-1, 0); break;
                        case 101: character.setNextMove(new Moves.WaitMove()); break;
                        case 102: move( 1, 0); break;
                        case 103: move(-1,-1); break;
                        case 104: move( 0,-1); break;
                        case 105: move( 1,-1); break;
                    }
                    event.preventDefault();
                } else if(code === 190 || code === 101) {
                    character.setNextMove(new Moves.WaitMove());
                }
            }
            dungeon.resolveUntilBlocked();
        });

        // Arrow key handler
        dom.addEventListener('keypress', function(event) {
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
