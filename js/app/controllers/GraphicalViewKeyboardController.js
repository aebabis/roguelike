import { default as Tile } from "../tiles/Tile.js";

export default class GraphicalViewKeyboardController {
    constructor(dungeon, graphicalDungeonView) {
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
                    character.setNextMove(function() {
                        character.move(dx, dy);
                    });
                    event.preventDefault();
                } else if(code === 190) {
                    character.setNextMove(function() {
                        character.wait();
                    });
                }
            }
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
