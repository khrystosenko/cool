var express = require('express');
// var cors = require('cors');
var bodyParser = require('body-parser');

var app = express();

app.use(express.static('./../web-client'));
// app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(9000, function() {
	console.log('started')
    });