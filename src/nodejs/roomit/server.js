var io = require('socket.io').listen(8888);

// io.sockets.on('connection', function(socket){

//   console.log('a user connected');

//   socket.on('disconnect', function(){
//     console.log('user disconnected');
//   });

//   socket.on('chat message', function(msg){
//     console.log('message: ' + msg);
//     socket.broadcast.emit(msg);
//     io.emit('chat message', msg);
//   });

// });
// Chatroom

// usernames which are currently connected to the chat
var rooms = {};
var numUsers = 0;

io.sockets.on('connection', function (socket) {
  console.log('Socket connected.')
  var addedUser = false;

  socket.on('sendchat', function (data) {
    io.sockets.in(socket.room).emit('updatechat', {username: socket.username, message: data});
  });

  socket.on('adduser', function (username, room_uuid) {
    console.log('User ' + username + ' is added.');
    socket.username = username;
    socket.room = room_uuid;

    if (rooms[socket.room]) {
        rooms[socket.room] += 1;
    } else {
        rooms[socket.room] = 1;
    }

    socket.emit('login');
    socket.emit('userjoined', {username: socket.username, numUsers: rooms[socket.room]});
    socket.join(socket.room);
    socket.emit('updatechat', {username: 'SERVER', message: 'you have connected to ' + socket.room});
    socket.broadcast.to(socket.room).emit('updatechat', {username: 'SERVER', message: username + ' has connected to this room.'});
  });

  socket.on('typing', function () {
    socket.broadcast.to(socket.room).emit('typing', {
      username: socket.username
    });
  });

  socket.on('stoptyping', function () {
    socket.broadcast.to(socket.room).emit('stoptyping', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    rooms[socket.room] -= 1;
    socket.broadcast.to(socket.room).emit('updatechat', {username: 'SERVER', message: socket.username + ' left.'});
    socket.broadcast.to(socket.room).emit('userleft', {username: socket.username, numUsers: rooms[socket.room]});
    socket.leave(socket.room);
  });
});
