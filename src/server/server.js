const express = require('express');
const app = express();
const compression = require('compression');
app.use(compression());

require('./serve-static')(app);

app.listen(process.env.PORT || 8080);
