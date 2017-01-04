const DB_URL = process.env.JAWSDB_MARIA_URL;
const APP_ID = process.env.OAUTH_CLIENT_ID;
const APP_SECRET = process.env.OAUTH_CLIENT_SECRET;

const express = require('express');
const router = express.Router();
const request = require('request');

if(typeof DB_URL === 'undefined' || DB_URL.length === 0) {
    const error = 'Must set database path env: JAWSDB_MARIA_URL';
    if(process.env.NODE_ENV === 'production') {
        throw new Error(error);
    } else {
        console.error(error);
        console.info('Serving empty route for dungeon-controller');
    }
} else {
    const mysql = require('mysql');
    const connection = mysql.createConnection(DB_URL);
    const dungeonService = require('../services/dungeon-service')(connection);

    const LightweightDungeonSerializer = require('../../client/js/app/dungeons/LightweightDungeonSerializer').default;

    router.get('/', function(req, res) {
        const { lastId, limit } = req.params;
        dungeonService.getDungeons({
            lastId,
            limit
        }, function(error, dungeons) {
            res.send(dungeons);
        });
    });

    router.get('/:id', function(req, res) {
        const { id } = req.params;
        dungeonService.getDungeon(id, function(error, dungeon) {
            res.send(dungeon);
        });
    });

    router.post('/', function(req, res) {
        const {headers, body} = req;

        const authorization = headers.authorization;
        if(authorization.indexOf('Bearer ') !== 0) {
            return res.status(401).send('Bad OAuth token');
        }
        const token = authorization.substring('Bearer '.length);
        const url = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${APP_ID}|${APP_SECRET}`;

        request({
            url,
            method: 'GET',
            json: true
        }, function(error, {statusCode}, {data}) {
            if(error) {
                console.error(error);
                res.sendStatus(500);
            } else if(data.error) {
                res.status(401).send(data.error.message);
            } else if(statusCode < 200 || statusCode >= 300) {
                res.sendStatus(500);
            } else {
                try {
                    const error = LightweightDungeonSerializer.validate(body);
                    if(error) {
                        res.status(400).send(error);
                    } else {
                        dungeonService.addDungeon(body, function(error, result) {
                            if(error) {
                                res.status(500).send(error);
                            } else {
                                res.status(200).send(result.insertId);
                            }
                        });
                    }
                } catch(error) {
                    res.status(400).send('Failed to save dungeon');
                }
            }
        });
    });
}

module.exports = router;