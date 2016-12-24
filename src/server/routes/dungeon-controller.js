const DB_URL = process.env.JAWSDB_MARIA_URL;
if(typeof DB_URL === 'undefined' || DB_URL.length === 0) {
    throw new Error('Must set database path env: JAWSDB_MARIA_URL');
}
const PASSWORD = process.env.DUNGEON_UPLOAD_PASSWORD;
if(typeof PASSWORD === 'undefined' || PASSWORD.length === 0) {
    throw new Error('Must set API token env: DUNGEON_UPLOAD_PASSWORD');
}

const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const connection = mysql.createConnection(DB_URL);
const dungeonService = require('../services/dungeon-service')(connection);

const LightweightDungeonSerializer = require('../../client/js/app/dungeons/LightweightDungeonSerializer').default;

router.use(require('body-parser')());

router.get('/', function(request, response) {
    const { lastId, limit } = request.params;
    dungeonService.getDungeons({
        lastId,
        limit
    }, function(error, dungeons) {
        response.send(dungeons);
    });
});

router.get('/:id', function(request, response) {
    const { id } = request.params;
    dungeonService.getDungeon(id, function(error, dungeon) {
        console.log(dungeon);
        response.send(dungeon);
    });
});

router.post('/', function(request, response) {
    const {headers, body} = request;
    if(headers.api_token !== PASSWORD) {
        response.status(401).send();
    } else {
        const error = LightweightDungeonSerializer.validate(body);
        if(error) {
            response.status(400).send(error);
        }
        dungeonService.addDungeon(body, function(error, result) {
            if(error) {
                response.status(500).send(error);
            } else {
                response.send(result.insertId);
            }
        });
    }
});

module.exports = router;