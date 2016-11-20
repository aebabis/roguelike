import { default as Dungeon } from '../../../../../src/client/js/app/dungeons/Dungeon.js';
import { default as PlayableCharacter } from '../../../../../src/client/js/app/entities/creatures/PlayableCharacter.js';
import { default as SlingshotImp } from '../../../../../src/client/js/app/entities/creatures/enemies/SlingshotImp.js';

const expect = require('chai').expect;

describe.only('ChaseStrategy', function() {
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
});
