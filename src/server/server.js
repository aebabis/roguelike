const express = require('express');
const session = require('express-session');
const compression = require('compression');
const bodyParser = require('body-parser');
const oauth = require('./oauth-middleware.js');
const notFound = require('./routes/not-found.js');
let SESSION_SECRET = process.env.SESSION_SECRET;

if(!SESSION_SECRET) {
    console.error('Environment variable SESSION_SECRET should be set');
    SESSION_SECRET = Math.random().toString().slice(2);
}

const app = express();
app.use(compression());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
    secret: SESSION_SECRET
}));
app.use(oauth);

require('./serve-static')(app);
app.use('/dungeons', require('./routes/dungeon-controller'));
// Serve OAuth client ID based on environment
app.use('/oauth-client-id', require('./routes/oauth-client-id'));

app.use(notFound);

app.listen(process.env.PORT || 8080);
