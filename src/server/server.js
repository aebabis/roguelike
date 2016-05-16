var express = require('express');
var app = express();

app.use("/bower_components", express.static(__dirname + "/../../bower_components"));
app.use("/node_modules", express.static(__dirname + "/../../node_modules"));

app.use("/", express.static(__dirname + "/../client"));


app.listen(process.env.PORT || 8080);
