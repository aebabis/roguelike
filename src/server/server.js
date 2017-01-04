const express = require('express');
const app = express();
const compression = require('compression');
const bodyParser = require('body-parser');
app.use(compression());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

require('./serve-static')(app);
app.use('/dungeons', require('./routes/dungeon-controller'));
// Serve OAuth client ID based on environment
app.use('/oauth-client-id', require('./routes/oauth-client-id'));

app.listen(process.env.PORT || 8080);
