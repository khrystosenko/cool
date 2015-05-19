var io = require('socket.io').listen(8888);

io.sockets.on('connection', function(socket){

  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    socket.broadcast.emit(msg);
    io.emit('chat message', msg);
  });

});
