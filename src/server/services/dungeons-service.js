const express = require('express');
const router = express.Router();

const dungeons = [];

const serializer = require('../../client/js/app/dungeons/LightweightDungeonSerializer');

const PASSWORD = process.env.DUNGEON_UPLOAD_PASSWORD;
if(typeof PASSWORD === 'undefined' || PASSWORD.length === 0) {
    throw new Error('Must set API token env: DUNGEON_UPLOAD_PASSWORD');
}

router.use(require('body-parser')());

router.get('/', function(request, response) {
    response.send(dungeons);
});

router.get('/:id', function(request, response) {
    const { id } = request.params;
    const dungeon = dungeons[id];
    response.send(dungeon);
});

router.post('/', function(request, response) {
    if(request.headers.api_token !== PASSWORD) {
        response.send(401);
    } else {
        dungeons.push(request.body);
        response.send();
    }
});

module.exports = router;