/**
 * Created by miriamz on 6/14/16.
 */
var express = require('express');
var app = express();


app.use(express.static(__dirname + '/public'));

app.listen(8080);
console.log("Listening on port 8080");


app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});