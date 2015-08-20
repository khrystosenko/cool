(function() {
  var ROOMIT = this.ROOMIT || {};

  function loadLocalConfig() {
    var fs = require('fs');
    ROOMIT.config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8'));
  }

  function setUpServer() {
    var rooms = {},
        sockets = {};
    var io = require('socket.io').listen(ROOMIT.config.port);
    console.log('Server is running...');

    io.sockets.on('connection', function(socket) {
      console.log('Socket ' + socket.id + ' is connected.');
      
      socket.on('pre-initialize', function(username) {
        socket.username = username
        socket.emit('socket-initialize', {socket_id: socket.id});
      });

      socket.on('initialize', function(access, room_uuid) {
        console.log('User ' + socket.username + ' is added.');

        socket.room_uuid = room_uuid;
        socket.access = access;

        rooms[room_uuid] = rooms[room_uuid] || [];

        if (rooms[room_uuid].indexOf(socket.id) != -1) {
          console.log('[' + socket.id + '] ERROR: already joined.');
          return;
        }

        sockets[socket.id] = socket;

        socket.join(socket.room_uuid);
        
        for (var i in rooms[room_uuid]) {
          socket_id = rooms[room_uuid][i];
          console.log('Sending peer-add to', socket_id)
          sockets[socket_id].emit('peer-add', {socket_id: socket.id, create_offer: false});
          socket.emit('peer-add', {socket_id: socket_id, create_offer: true, access: sockets[socket_id].access});
        }

        rooms[room_uuid].push(socket.id);
        socket.emit('user-joined', {username: socket.username, numUsers: rooms[socket.room_uuid].length});
        socket.broadcast.to(socket.room_uuid).emit('chat-update', {username: 'SERVER', message: socket.username + ' has connected to this room.'});

      });

      socket.on('chat-send', function (data) {
        console.log('Received message', data);
        io.sockets.in(socket.room_uuid).emit('chat-update', {username: socket.username, message: data});
      });

      socket.on('typing', function () {
        socket.broadcast.to(socket.room_uuid).emit('typing', {username: socket.username});
      });

      socket.on('typing-stop', function () {
       socket.broadcast.to(socket.room_uuid).emit('typing-stop', {username: socket.username});
      });

      socket.on('ice_candidate-relay', function(data) {
        var socket_id = data.socket_id;
        var ice_candidate = data.ice_candidate;
        console.log('[' + socket.id + '] relaying ICE candidate to [' + socket_id + '] ', ice_candidate);

        if (socket_id in sockets) {
            sockets[socket_id].emit('ice_candidate', {'socket_id': socket.id, 'ice_candidate': ice_candidate});
        }
      });

      socket.on('session_description-relay', function(data) {
          var socket_id = data.socket_id;
          var session_description = data.session_description;
          console.log('[' + socket.id + '] relaying session description to [' + socket_id + '] ', session_description);

          if (socket_id in sockets) {
              sockets[socket_id].emit('session_description', {'socket_id': socket.id, 'session_description': session_description});
          }
      });

      socket.on('mic-volume-update', function() {
          socket.broadcast.to(socket.room_uuid).emit('mic-volume-update', {username: socket.username});
      });

      socket.on('media-update', function() {
          for (var i in rooms[socket.room_uuid]) {
            var socket_id = rooms[socket.room_uuid][i];
            if (socket_id == socket.id) {
              continue;
            }

            socket.emit('media-update', {socket_id: socket_id});
          }
      });

      socket.on('disconnect', function () {
        console.log('Socket ' + socket.id + ' is disconnected.');
        socket.leave(socket.room_uuid);

        if (rooms[socket.room_uuid] === undefined) {
          return;
        }

        var index = rooms[socket.room_uuid].indexOf(socket.id);
        rooms[socket.room_uuid] = rooms[socket.room_uuid].slice(0, index).concat(rooms[socket.room_uuid].slice(index + 1));

        socket.broadcast.to(socket.room_uuid).emit('chat-update', {username: 'SERVER', message: socket.username + ' left.'});
        socket.broadcast.to(socket.room_uuid).emit('user-left', {username: socket.username, numUsers: rooms[socket.room_uuid].length});

        for (var i in rooms[socket.room_uuid]) {
          socket_id = rooms[socket.room_uuid][i];
          sockets[socket_id].emit('peer-remove', {socket_id: socket.id});
          socket.emit('peer-remove', {socket_id: socket_id});
        }

        delete sockets[socket.id];
      });

    });
  }

  loadLocalConfig();
  setUpServer();
})(this);