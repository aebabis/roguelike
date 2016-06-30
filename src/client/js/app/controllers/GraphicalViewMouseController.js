import Move from '../entities/creatures/moves/Move.js';

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
                return new Move.UseAbilityMove(playerLocation, abilityIndex, targetX, targetY);
            } else if(itemIndex !== null) {
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

        function getTileFor(tileDom) {
            var dungeon = sharedData.getDungeon();
            var targetX = tileDom.getAttribute('data-x');
            var targetY = tileDom.getAttribute('data-y');
            return dungeon.getTile(targetX, targetY);
        }

        function updateHoverAttribute(tileDom) {
            var dungeon = sharedData.getDungeon();
            var player = dungeon.getPlayableCharacter();
            var move = getMoveFor(tileDom);
            if(move && !move.getReasonIllegal(dungeon, player, getTileFor(tileDom))) {
                tileDom.setAttribute('data-move', move.constructor.name);
            } else {
                tileDom.setAttribute('data-move', '');
            }
        }

        // Arrow key handler
        /*eslint-env jquery*/
        $(dom).on('click', '.cell', function() {
            var move = getMoveFor(this);
            if(move) {
                var dungeon = sharedData.getDungeon();
                var player = dungeon.getPlayableCharacter();
                var reason = move.getReasonIllegal(dungeon, player, getTileFor(this));
                if(reason) {
                    console.warn(reason);
                } else {
                    player.setNextMove(move);
                    dungeon.resolveUntilBlocked();
                    sharedData.unsetTargettedAbility();
                    sharedData.unsetTargettedItem();
                }
            }
        });

        var lastHoverTile;
        $(dom).on('mouseover', '.cell', function() {
            var tileDom = lastHoverTile = this;
            var targetX = tileDom.getAttribute('data-x');
            var targetY = tileDom.getAttribute('data-y');
            sharedData.setInspectedTile(targetX, targetY);
            updateHoverAttribute(tileDom);
        });

        sharedData.getDungeon().addObserver(()=>lastHoverTile && updateHoverAttribute(lastHoverTile));
        sharedData.addObserver(()=>lastHoverTile && updateHoverAttribute(lastHoverTile));
    }
}
