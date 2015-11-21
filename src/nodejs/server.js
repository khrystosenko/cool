(function() {
  var ROOMIT = this.ROOMIT || {};

  function loadLocalConfig() {
    var fs = require('fs');
    ROOMIT.config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8'));
  }

  function setUpServer() {
    var rooms = {},
        history = {},
        sockets = {};
    var io = require('socket.io').listen(ROOMIT.config.port);
    console.log('Server is running...');

    io.sockets.on('connection', function(socket) {
      console.log('Socket ' + socket.id + ' is connected.');

      socket.on('initialize', function(room_uuid, access_granted) {
        console.log('User ' + socket.id + ' is added.');
        socket.room_uuid = room_uuid;
        rooms[room_uuid] = rooms[room_uuid] || [];
        history[room_uuid] = history[room_uuid] || {emptyChat: true};

        if (rooms[room_uuid].indexOf(socket.id) != -1) {
          console.log('[' + socket.id + '] ERROR: already joined.');
          return;
        }

        if (rooms[room_uuid].length >= ROOMIT.config.limit) {
          socket.emit('error', {'msg': 'You can\'t join this room because it is already full.', 'code': 401});
          return
        }

        sockets[socket.id] = socket;

        socket.join(socket.room_uuid);

        rooms[room_uuid].push(socket.id);
        socket.emit('user-joined', {numUsers: rooms[socket.room_uuid].length, socket_id: socket.id, empty: history[room_uuid].emptyChat});

        for (var i in rooms[room_uuid]) {
          socket_id = rooms[room_uuid][i];

          sockets[socket_id].emit('peer-add', {numUsers: rooms[socket.room_uuid].length, socket_id: socket.id, create_offer: false});
          socket.emit('peer-add', {socket_id: socket_id, create_offer: true, audio: sockets[socket_id].audio, video: sockets[socket_id].video});
        }

      });

      socket.on('stream-update', function(audio, video) {
        socket.audio = audio;
        socket.video = video;
      });

      socket.on('chat-join', function(data) {
        socket.username = data.username;
        socket.emit('login');
      });

      socket.on('chat-send', function (data) {
        history[socket.room_uuid].emptyChat = false;
        io.sockets.in(socket.room_uuid).emit('chat-update', {socket_id: socket.id, username: socket.username, message: data});
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

      socket.on('disconnect', function () {
        console.log('Socket ' + socket.id + ' is disconnected.');
        socket.leave(socket.room_uuid);

        if (rooms[socket.room_uuid] === undefined) {
          return;
        }

        var index = rooms[socket.room_uuid].indexOf(socket.id);
        rooms[socket.room_uuid] = rooms[socket.room_uuid].slice(0, index).concat(rooms[socket.room_uuid].slice(index + 1));

        if (socket.username) {
          socket.broadcast.to(socket.room_uuid).emit('chat-update', {username: 'SERVER', message: socket.username + ' left.'});
        }
        socket.broadcast.to(socket.room_uuid).emit('user-left', {username: socket.username, numUsers: rooms[socket.room_uuid].length});

        for (var i in rooms[socket.room_uuid]) {
          socket_id = rooms[socket.room_uuid][i];
          sockets[socket_id].emit('peer-remove', {socket_id: socket.id});
          socket.emit('peer-remove', {socket_id: socket_id});
        }

        if (socket.id in sockets) {
          delete sockets[socket.id];
        }

        if (rooms[socket.room_uuid].length == 0) {
          history[socket.room_uuid].emptyChat = true;
        }
      });

    });
  }

  loadLocalConfig();
  setUpServer();
})(this);