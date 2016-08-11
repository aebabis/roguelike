import Moves from '../entities/creatures/moves/Moves.js';

import Pather from '../entities/creatures/strategies/Pather.js';

export default class GraphicalViewMouseController {
    constructor(sharedData, graphicalDungeonView) {
        var dom = graphicalDungeonView.getDom();

        function getMovesFor(tileDom) {
            var dungeon = sharedData.getDungeon();
            var player = dungeon.getPlayableCharacter();
            var playerLocation = dungeon.getTile(player); // TODO: Ensure that tile isn't empty
            var targetX = tileDom.getAttribute('data-x');
            var targetY = tileDom.getAttribute('data-y');
            var creature = dungeon.getTile(targetX, targetY).getCreature();
            var abilityIndex = sharedData.getTargettedAbility();
            var itemIndex = sharedData.getTargettedItem();
            if(abilityIndex !== null) {
                return [new Moves.UseAbilityMove(playerLocation, abilityIndex, targetX, targetY)];
            } else if(itemIndex !== null) {
                return [new Moves.UseItemMove(playerLocation, itemIndex, dungeon.getTile(targetX, targetY))];
            } else if(creature && creature.isEnemy(player)) {
                return [new Moves.AttackMove(playerLocation, targetX, targetY)];
            } else {
                var dx = targetX - playerLocation.getX();
                var dy = targetY - playerLocation.getY();
                if(dx === 0 && dy === 0) {
                    return [new Moves.WaitMove(playerLocation)];
                } else if(Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
                    return [new Moves.MovementMove(playerLocation, dx, dy)];
                } else {
                    return Pather.getMoveSequenceToward(dungeon, playerLocation, dungeon.getTile(targetX, targetY));
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
            var moves = getMovesFor(tileDom);
            if(moves && moves[0] && !moves[0].getReasonIllegal(dungeon, player, getTileFor(tileDom))) {
                tileDom.setAttribute('data-move', moves[0].constructor.name);
            } else {
                tileDom.setAttribute('data-move', '');
            }
        }

        function anyNewEnemies(e1, e2) {
            var tmp1 = e1.map(c=>c.getId()).sort();
            var tmp2 = e2.map(c=>c.getId()).sort();
            while(tmp2.length) {
                if(tmp1[0] === tmp2[0]) {
                    tmp1.shift();
                    tmp2.shift();
                } else if(tmp1[0] < tmp2[0]) {
                    tmp1.shift(); // Enemies are allowed to disappear, but not appear
                } else {
                    return true;
                }
            }
        }

        // Arrow key handler
        /*eslint-env jquery*/
        $(dom).on('click tap', '.cell', function() {
            var self = this;
            var dungeon = sharedData.getDungeon();
            var player = dungeon.getPlayableCharacter();
            var enemies = player.getVisibleEnemies(dungeon);
            getMovesFor(this).forEach(function(move) {
                // Note, optionalTargetTile (3rd param) only relevant for 1-length move sequences
                var reason = move.getReasonIllegal(dungeon, player, getTileFor(self));
                if(reason) {
                    console.warn(reason); // TODO: Show message to user
                    return false;
                } if(anyNewEnemies(enemies, player.getVisibleEnemies(dungeon))) {
                    return false;
                } else {
                    player.setNextMove(move);
                    dungeon.resolveUntilBlocked();
                    sharedData.unsetTargettedAbility();
                    sharedData.unsetTargettedItem();
                }
            });
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
