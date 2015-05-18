var express = require('express');
var io = require('socket.io').listen(8888);
var bodyParser = require('body-parser');
var fs = require('fs');

var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');

var app = express(),
    server = require('http').createServer(app);

app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/chat', function (req, res) {
    console.log('chat');
});

var port = 9999,  
    ip = "127.0.0.1";

io.on('connection', function(socket){
  console.log('a user connected');
});

server.listen(port, ip, function() {console.log('Server is running.')});
