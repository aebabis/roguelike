import { default as Tile } from "../tiles/Tile.js";

export default class GraphicalViewKeyboardController {
    constructor(dungeon, graphicalDungeonView) {
        var dom = graphicalDungeonView.getDom();

        // Arrow key handler
        dom.addEventListener('keydown', function(event) {
            var active = document.activeElement;
            var code = event.keyCode;
            if(active.classList.contains('cell')) {
                if(code >= 37 && code <= 40) {
                    var x = active.getAttribute('data-x');
                    var y = active.getAttribute('data-y');
                    switch(code) {
                        case 37: x--; break;
                        case 38: y--; break;
                        case 39: x++; break;
                        case 40: y++; break;
                    }
                    var next = dom.querySelector('[data-x="'+x+'"][data-y="'+y+'"]');
                    if(next) {
                        event.preventDefault();
                        next.focus();
                    }
                }
            } else if(active === dom.children[0]) {
                if(code >= 37 && code <= 40) {
                    var dx = 0;
                    var dy = 0;
                    switch(code) {
                        case 37: dx--; break;
                        case 38: dy--; break;
                        case 39: dx++; break;
                        case 40: dy++; break;
                    }
                    var character = dungeon.getPlayableCharacter();
                    var tile = dungeon.getTile(character);
                    character.setNextMove(function() {
                        character.move(dx, dy);
                    });
                    event.preventDefault();
                }
            }
        });

        // Arrow key handler
        dom.addEventListener('keypress', function(event) {
        });

        $(dom).on('focus', '.cell', function(event) {
            var $cell = $(this);
            var cellPos = $cell.position();
            var scrollTop = cellPos.top + ($cell.height() - $(dom).height()) / 2;
            var scrollLeft = cellPos.left + ($cell.width() - $(dom).width()) / 2;
            $(dom).scrollTop(scrollTop);
            $(dom).scrollLeft(scrollLeft);
        });

        document.addEventListener("focus", function() {
            console.log(document.activeElement);
        });
    }
}
