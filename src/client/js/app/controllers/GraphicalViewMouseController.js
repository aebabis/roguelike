import Move from "../entities/creatures/moves/Move.js";

export default class GraphicalViewMouseController {
    constructor(dungeon, sharedData, graphicalDungeonView) {
        var dom = graphicalDungeonView.getDom();

        function getMoveFor(tileDom) {
            var dungeon = sharedData.getDungeon();
            var player = dungeon.getPlayableCharacter();
            var playerLocation = dungeon.getTile(player);
            var targetX = tileDom.getAttribute('data-x');
            var targetY = tileDom.getAttribute('data-y');
            var creature = dungeon.getTile(targetX, targetY).getCreature();
            var abilityIndex = sharedData.getTargettedAbility();
            var itemIndex = sharedData.getTargettedItem();
            if(abilityIndex !== null) {
                sharedData.unsetTargettedAbility();
                return new Move.UseAbilityMove(playerLocation, abilityIndex, targetX, targetY);
            } else if(itemIndex !== null) {
                sharedData.unsetTargettedItem();
                return new Move.UseItemMove(playerLocation, itemIndex, dungeon.getTile(targetX, targetY));
            } else if(creature && creature.isEnemy(player)) {
                return new Move.AttackMove(playerLocation, targetX, targetY);
            } else {
                var dx = targetX - playerLocation.getX();
                var dy = targetY - playerLocation.getY();
                if(dx === 0 && dy === 0) {
                    return new Move.WaitMove(playerLocation);
                } else if(Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
                    return new Move.MovementMove(playerLocation, dx, dy);
                }
            }
        }

        // Arrow key handler
        $(dom).on('click', '.cell', function(event) {
            var move = getMoveFor(this);
            if(move) {
                var dungeon = sharedData.getDungeon();
                var player = dungeon.getPlayableCharacter();
                var reason = move.getReasonIllegal(dungeon, player);
                if(reason) {
                    console.warn(reason);
                } else {
                    player.setNextMove(move);
                    dungeon.resolveUntilBlocked();
                }
            }
        });

        $(dom).on('mouseover', '.cell', function() {
            var x = $(this).attr('data-x');
            var y = $(this).attr('data-y');
            sharedData.setInspectedTile(x, y);
        });

        $(dom).on('mouseout', '.grid', function() {
            /*var character = dungeon.getPlayableCharacter();
            var location = character.getTile(character);
            var x = location.getX();
            var y = location.getY();
            sharedData.setInspectedTile(x, y);*/
        });

        // Arrow key handler
        dom.addEventListener('mouseover', function(event) {
        });
    }
}
