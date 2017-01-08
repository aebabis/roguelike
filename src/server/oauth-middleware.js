const request = require('request');

const APP_ID = process.env.OAUTH_CLIENT_ID;
const APP_SECRET = process.env.OAUTH_CLIENT_SECRET;

module.exports = function (req, res, next) {
    const session = req.session;
    const authorization = req.headers.authorization;

    if(session.user || !authorization) {
        next();
    } else {
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
                session.user = data;
                next();
            }
        }).on('error', function(error) {
            console.error(error);
            res.sendStatus(500);
        });
    }
};
