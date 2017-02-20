import { default as Dungeon } from '../../../../../src/client/js/app/dungeons/Dungeon.js';
import { default as PlayableCharacter } from '../../../../../src/client/js/app/entities/creatures/PlayableCharacter.js';
import { default as SlingshotImp } from '../../../../../src/client/js/app/entities/creatures/enemies/SlingshotImp.js';
import { default as Ent } from '../../../../../src/client/js/app/entities/creatures/enemies/Ent.js';
import { default as Tiles } from '../../../../../src/client/js/app/tiles/Tiles.js';
import { default as Moves } from '../../../../../src/client/js/app/entities/creatures/moves/Moves.js';

const expect = require('chai').expect;

describe('ChaseStrategy', function() {
    function getImpDungeon(enemyDx, enemyDy) {
        const dungeon = new Dungeon(7, 7);
        const imp = new SlingshotImp();
        const player = new PlayableCharacter();
        dungeon.moveCreature(imp, 3, 3);
        dungeon.moveCreature(player, 3 + enemyDx, 3 + enemyDy);
        return dungeon;
    }

    it('should only return legal AttackMoves when in an open field', function() {
        for(let dx = 0; dx < 4; dx++) {
            for(let dy = 0; dy < 4; dy++) {
                if(dy === 0 && dx === 0) {
                    continue;
                }
                const dungeon = getImpDungeon(dx, dy);
                const imp = dungeon.getTile(3, 3).getCreature();
                const move = imp.getNextMove(dungeon);
                const reason = move.getReasonIllegal(dungeon, imp);
                expect(reason).to.be.null;
            }
        }
    });

    it('should cause a creature to move toward a tile it has seen the player occupy', function() {
        const dungeon = new Dungeon(3, 3);
        dungeon.setTile(new Tiles.WallTile(1, 1), 1, 1);
        dungeon.setTile(new Tiles.WallTile(1, 2), 1, 2);
        var player = new PlayableCharacter();
        var enemy = new Ent();
        dungeon.moveCreature(player, 0, 0);
        dungeon.moveCreature(enemy, 0, 2);
        var enemyStartingPosition = dungeon.getTile(enemy);

        expect(enemy.canSee(dungeon, dungeon.getTile(player))).to.be.true;

        player.setNextMove(new Moves.MovementMove(dungeon.getTile(player), 1, 0));
        player.setNextMove(new Moves.MovementMove(dungeon.getTile(player), 2, 0));
        player.setNextMove(new Moves.MovementMove(dungeon.getTile(player), 2, 1));
        player.setNextMove(new Moves.MovementMove(dungeon.getTile(player), 2, 2));

        dungeon.resolveUntilBlocked();

        var enemyPosition  = dungeon.getTile(enemy);
        expect(enemyPosition).not.to.equal(enemyStartingPosition);
    });
});
