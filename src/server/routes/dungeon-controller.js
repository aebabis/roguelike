const DB_URL = process.env.JAWSDB_MARIA_URL;
const APP_ID = process.env.OAUTH_CLIENT_ID;
const APP_SECRET = process.env.OAUTH_CLIENT_SECRET;

const express = require('express');
const router = express.Router();

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
        const { lastId, limit = 10} = req.query;
        try {
            dungeonService.getDungeons({
                lastId,
                limit: limit + 1
            }, function(error, dungeons) {
                const hasMore = dungeons.length === limit + 1;
                const payloadDungeons = dungeons.slice(0, limit);
                res.set('Has-More', hasMore);
                if(hasMore) {
                    const lastDungeon = payloadDungeons.slice(-1)[0].id;
                    const linkParams = Object.assign({}, req.query, {lastId: lastDungeon});
                    const Link = '/dungeons?' + Object.keys(linkParams).map(key => `${key}=${linkParams[key]}`);
                    res.set('Link', Link);
                }
                res.send(payloadDungeons);
            });
        } catch(e) {
            res.sendStatus(500);
        }
    });

    router.get('/:id', function(req, res) {
        const { id } = req.params;
        dungeonService.getDungeon(id, function(error, dungeon) {
            res.send(dungeon);
        });
    });

    router.post('/', function(req, res) {
        const user = req.session.user;
        const body = req.body;
        try {
            const error = LightweightDungeonSerializer.validate(body);
            if(error) {
                res.status(400).send(error);
            } else {
                dungeonService.addDungeon(body, user.user_id, function(error, result) {
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
    });
}

module.exports = router;