import Dungeon from '../../../src/client/js/app/dungeons/Dungeon.js';
import PlayableCharacter from '../../../src/client/js/app/entities/creatures/PlayableCharacter.js';
import Ent from '../../../src/client/js/app/entities/creatures/enemies/Ent.js';
import Fireball from '../../../src/client/js/app/abilities/Fireball.js';
import Moves from '../../../src/client/js/app/entities/creatures/moves/Moves.js';

var expect = require('chai').expect;

describe('Fireball', () => {
    let dungeon;
    let player;
    let ent;

    beforeEach(() => {
        dungeon = new Dungeon(4, 4);
        player = new PlayableCharacter();
        ent = new Ent();

        const fireball = new Fireball();
        player.addAbility(fireball);

        dungeon.moveCreature(player, 1, 1);
        dungeon.moveCreature(ent, 2, 2);
    });

    it('should have a description', () => {
        expect(new Fireball().getDescription()).to.be.a('string');
    });

    it('should be allowed to target an empty tile', () => {
        const move = new Moves.UseAbilityMove(dungeon.getTile(player), 0, 1, 2);
        const reasonIllegal = move.getReasonIllegal(dungeon, player);
        expect(reasonIllegal).to.equal(null);
    });

    it('should damage enemies', () => {
        const move = new Moves.UseAbilityMove(dungeon.getTile(player), 0, 1, 2);
        player.setNextMove(move);
        dungeon.resolveUntilBlocked();

        const entHP = ent.getCurrentHP();
        const entMaxHP = ent.getBaseHP();
        expect(entHP).not.to.equal(entMaxHP);
    });

    it('should damage the user', () => {
        const move = new Moves.UseAbilityMove(dungeon.getTile(player), 0, 1, 2);
        player.setNextMove(move);
        dungeon.resolveUntilBlocked();

        const playerHP = player.getCurrentHP();
        const playerMaxHP = player.getBaseHP();
        expect(playerHP).not.to.equal(playerMaxHP);
    });

    it('should only have a radius of one tile', () => {
        const move = new Moves.UseAbilityMove(dungeon.getTile(player), 0, 3, 3);
        player.setNextMove(move);
        dungeon.resolveUntilBlocked();

        const playerHP = player.getCurrentHP();
        const playerMaxHP = player.getBaseHP();
        expect(playerHP).to.equal(playerMaxHP);
    });
});
