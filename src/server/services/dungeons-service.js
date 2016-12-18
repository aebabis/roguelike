const express = require('express');
const router = express.Router();

const dungeons = [];

const serializer = require('../../client/js/app/dungeons/LightweightDungeonSerializer');

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
    dungeons.push(request.body);
    response.send();
});

module.exports = router;