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
            var creature = dungeon.getTile(targetX, targetY).getCreature();
            if(creature && creature.isEnemy(character)) {
                character.setNextMove(function() {
                    character.attack(creature);
                });
            } else {
                var dx = targetX - playerLocation.getX();
                var dy = targetY - playerLocation.getY();
                if(dx === 0 && dy === 0) {
                    character.setNextMove(function() {
                        character.wait();
                    });
                } else if(Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
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
