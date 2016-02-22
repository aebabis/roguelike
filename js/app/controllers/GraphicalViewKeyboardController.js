import { default as Tile } from "../tiles/Tile.js";
import { default as Move } from "../entities/creatures/moves/Move.js";


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
                if(code >= 37 && code <= 40) {
                    var dx = 0;
                    var dy = 0;
                    switch(code) {
                        case 37: dx--; break;
                        case 38: dy--; break;
                        case 39: dx++; break;
                        case 40: dy++; break;
                    }
                    character.setNextMove(new Move.MovementMove(dx, dy));
                    event.preventDefault();
                } else if(code === 190 || code === 101) {
                    character.setNextMove(new Move.WaitMove());
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
