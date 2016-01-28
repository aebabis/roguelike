import { default as Move } from "../entities/creatures/moves/Move.js";

export default class GraphicalViewMouseController {
    constructor(dungeon, sharedData, graphicalDungeonView) {
        var dom = graphicalDungeonView.getDom();

        // Arrow key handler
        $(dom).on('click', '.cell', function(event) {
            var tile = this;
            var character = dungeon.getPlayableCharacter();
            var playerLocation = dungeon.getTile(character);
            var targetX = tile.getAttribute('data-x');
            var targetY = tile.getAttribute('data-y');
            var creature = dungeon.getTile(targetX, targetY).getCreature();
            if(creature && creature.isEnemy(character)) {
                character.setNextMove(new Move.AttackMove(creature));
            } else {
                var dx = targetX - playerLocation.getX();
                var dy = targetY - playerLocation.getY();
                if(dx === 0 && dy === 0) {
                    character.setNextMove(new Move.WaitMove());
                } else if(Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
                    character.setNextMove(new Move.MovementMove(dx, dy));
                }
            }
        });

        $(dom).on('mouseover', '.cell', function() {
            var x = $(this).attr('data-x');
            var y = $(this).attr('data-y');
            sharedData.setInspectedTile(x, y);
        });

        $(dom).on('mouseout', '.grid', function() {
            var character = dungeon.getPlayableCharacter();
            var location = character.getTile(character);
            var x = location.getX();
            var y = location.getY();
            sharedData.setInspectedTile(x, y);
        });

        // Arrow key handler
        dom.addEventListener('mouseover', function(event) {
        });
    }
}
