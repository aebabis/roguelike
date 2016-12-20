const express = require('express');
const router = express.Router();

const dungeons = [];

const LightweightDungeonSerializer = require('../../client/js/app/dungeons/LightweightDungeonSerializer').default;

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
    const {headers, body} = request;
    if(headers.api_token !== PASSWORD) {
        response.status(401).send();
    } else {
        const error = LightweightDungeonSerializer.validate(body);
        if(error) {
            response.status(400).send(error);
        } else {
            dungeons.push(body);
            response.send();
        }
    }
});

module.exports = router;