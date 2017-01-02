const DB_URL = process.env.JAWSDB_MARIA_URL;
const APP_ID = process.env.OAUTH_CLIENT_ID;
const APP_SECRET = process.env.OAUTH_CLIENT_SECRET;

const express = require('express');
const router = express.Router();

if(typeof DB_URL === 'undefined' || DB_URL.length === 0) {
    console.error('Must set database path env: JAWSDB_MARIA_URL');
    console.log('Serving empty route for dungeon-controller');
} else {
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

        const authorization = headers.authorization;
        if(authorization.indexOf('Bearer ') !== 0) {
            response.status(400).send();
            return;
        }
        const token = authorization.substring('Bearer '.length);
        const url = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${APP_ID}|${APP_SECRET}`;

        require('request')({
            url,
            method: 'GET',
            json: true
        }, function(error, {statusCode}, {data}) {
            if(error) {
                console.error(error);
                response.status(500).send();
            } else if(data.error) {
                response.status(401).send(data.error.message);
            } else if(statusCode < 200 || statusCode >= 300) {
                response.status(500).send();
            } else {
                try {
                    const error = LightweightDungeonSerializer.validate(body);
                    if(error) {
                        response.status(400).send(error);
                    } else {
                        dungeonService.addDungeon(body, function(error, result) {
                            if(error) {
                                response.status(500).send(error);
                            } else {
                                response.status(200).send(result.insertId);
                            }
                        });
                    }
                } catch(error) {
                    response.status(400).send('Failed to save dungeon');
                }
            }
        });
    });
}

module.exports = router;