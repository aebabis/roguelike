const APP_ID = process.env.OAUTH_CLIENT_ID;

const express = require('express');
const router = express.Router();

router.get('/', function(request, response) {
    response.send(APP_ID);
});

module.exports = router;