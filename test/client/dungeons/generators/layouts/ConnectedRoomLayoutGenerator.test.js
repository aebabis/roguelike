import ConnectedRoomLayoutGenerator  from '../../../../../src/client/js/app/dungeons/generators/layouts/ConnectedRoomLayoutGenerator.js';

var expect = require('chai').expect;

describe.only('ConnectedRoomLayoutGenerator', function() {
    it('should create dungeons that are connected', function() {
        for(let i = 0; i < 100; i++) {
            const prng = Random.engines.mt19937();
            prng.seed(i);
            const dungeon = ConnectedRoomLayoutGenerator.generate(prng, {
                numRooms: 6
            });
            console.log(i);
            expect(dungeon.isConnected()).to.equal(true);
        }
    });
});
