var io = require('socket.io').listen(7000); 

io.sockets.on('connection', function (socket) {
	console.log('yeah');
});