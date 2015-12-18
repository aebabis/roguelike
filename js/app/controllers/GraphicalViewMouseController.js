export default class GraphicalViewMouseController {
    constructor(dungeon, graphicalDungeonView) {
        var dom = graphicalDungeonView.getDom();

        // Arrow key handler
        dom.addEventListener('click', function(event) {
            var tile = event.target;
            if(!tile.classList.contains('cell')) {
                return;
            }
            var character = dungeon.getPlayableCharacter();
            var playerLocation = dungeon.getTile(character);
            var targetX = tile.getAttribute('data-x');
            var targetY = tile.getAttribute('data-y');
            var enemy = dungeon.getTile(targetX, targetY).getCreature();
            if(enemy) {
                character.setNextMove(function() {
                    character.attack(targetX, targetY);
                });
            } else {
                var dx = targetX - playerLocation.getX();
                var dy = targetY - playerLocation.getY();
                if(Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
                    character.setNextMove(function() {
                        character.move(dx, dy);
                    });
                }
            }
        });

        // Arrow key handler
        dom.addEventListener('mouseover', function(event) {
        });
    }
}
