import ConnectedRoomLayoutGenerator  from '../../../../../src/client/js/app/dungeons/generators/layouts/ConnectedRoomLayoutGenerator.js';

var expect = require('chai').expect;

describe('ConnectedRoomLayoutGenerator', function() {
    it('should create dungeons that are connected', function() {
        this.timeout(0);
        for(let i = 0; i < 100; i++) {
            const prng = Random.engines.mt19937();
            prng.seed(i);
            const dungeon = ConnectedRoomLayoutGenerator.generate(prng, {
                numRooms: 6
            });
            expect(dungeon.isConnected()).to.equal(true);
        }
    });
});
