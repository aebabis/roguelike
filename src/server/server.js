var express = require('express');
var app = express();
var compression = require('compression');
app.use(compression());

require('./serve-static')(app);

app.listen(process.env.PORT || 8080);
